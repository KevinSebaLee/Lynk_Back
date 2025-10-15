import EventRepository from '../repositories/eventRepository.js';
import { sendCancellationEmail } from './emailService.js';
import { supabaseClient } from '../database/supabase.js';
import path from 'path';

// Helper function to handle image uploads to Supabase
const uploadImageToSupabase = async (file: Express.Multer.File, eventId: number): Promise<string> => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error('File buffer is empty or invalid');
  }

  console.log('File received:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    bufferExists: !!file.buffer
  });

  const ext = path.extname(file.originalname) || '.jpg';
  const fileName = `photo${ext}`;
  const filePath = `event_images/${eventId}/${fileName}`;
  const BUCKET_NAME = 'event-image';

  console.log(`Uploading to bucket: ${BUCKET_NAME}, path: ${filePath}, file size: ${file.buffer.length} bytes`);

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL for the file
    const { data: urlData } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const imagePath = urlData.publicUrl;
    console.log('Image URL:', imagePath);

    // Verify the upload is accessible
    try {
      const checkResponse = await fetch(imagePath);
      console.log('File verification response:', checkResponse.status, checkResponse.ok);
    } catch (verifyError) {
      console.warn('Warning: Could not verify uploaded file:', (verifyError as Error).message);
    }

    return imagePath;
  } catch (uploadError) {
    console.error('Exception during upload:', uploadError);
    throw uploadError;
  }
};

// Helper function to delete image from Supabase
const deleteImageFromSupabase = async (imageUrl: string | null): Promise<void> => {
  if (!imageUrl) return;

  try {
    const pathMatch = imageUrl.match(/event_images\/\d+\/[^?]+/);
    if (pathMatch) {
      const filePath = pathMatch[0];
      const { error } = await supabaseClient.storage
        .from('event-image')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file from Supabase:', error);
      } else {
        console.log('Successfully deleted image:', filePath);
      }
    }
  } catch (storageError) {
    console.error('Error deleting image from storage:', storageError);
  }
};

export const getEvents = async () => {
  const rows = await EventRepository.getAllEvents();
  return rows.map(({ id_categoria, id_creador, presupuesto, objetivo, ...rest }: any) => {
    let imagenFinal = null;
    if (rest.imagen) {
      if (Buffer.isBuffer(rest.imagen)) {
        imagenFinal = `data:image/jpeg;base64,${rest.imagen.toString('base64')}`;
      } else if (typeof rest.imagen === 'string') {
        imagenFinal = rest.imagen;
      }
    }

    return {
      ...rest,
      imagen: imagenFinal,
      presupuesto: presupuesto?.toLocaleString(),
      objetivo: objetivo?.toLocaleString()
    };
  });
};

export const getEvent = async (id: string | number): Promise<any> => {
  const event = await EventRepository.getEventById(id);
  if (!event) return null;

  const { id_categoria, presupuesto, objetivo, ...rest } = event;

  let imagenFinal = null;
  if (rest.imagen) {
    if (Buffer.isBuffer(rest.imagen)) {
      imagenFinal = `data:image/jpeg;base64,${rest.imagen.toString('base64')}`;
    } else if (typeof rest.imagen === 'string') {
      imagenFinal = rest.imagen;
    }
  }

  return {
    ...rest,
    imagen: imagenFinal,
    presupuesto: presupuesto?.toLocaleString(),
    objetivo: objetivo?.toLocaleString()
  };
};

export const getEventParticipantsEmails = async (eventId: string | number): Promise<string[]> => {
  // Busca los participantes en el repositorio intermedio
  const participantesRaw = await EventRepository.getEventParticipants(eventId);
  if (!participantesRaw || participantesRaw.length === 0) return [];

  // Retorna solo el email de cada participante
  return participantesRaw.map((participante: any) => participante.email);
};

export const updateEvent = async (eventData: any, file: Express.Multer.File | null = null): Promise<any> => {
  console.log('updateEvent called with:', {
    id: eventData.id,
    fields: Object.keys(eventData),
    hasFile: !!file
  });
  
  // Get existing event to check current state
  const event = await getEvent(eventData.id);
  if (!event) {
    console.error('Event not found for update:', eventData.id);
    throw new Error('Event not found');
  }

  let imagePath = event.imagen; // Keep existing image by default

  // Handle new image upload if file is provided
  if (file) {
    try {
      // Delete old image if exists
      if (event.imagen) {
        await deleteImageFromSupabase(event.imagen);
      }

      // Upload new image
      imagePath = await uploadImageToSupabase(file, eventData.id);
    } catch (storageError) {
      console.error('Storage operation failed during update:', storageError);
      // Continue with event update even if image upload fails
    }
  }

  const fixedData = {
    id: eventData.id,
    id_categoria: eventData.id_categoria ?? event.id_categoria,
    nombre: eventData.nombre ?? event.nombre,
    descripcion: eventData.descripcion ?? event.descripcion,
    fecha: eventData.fecha ?? event.fecha,
    ubicacion: eventData.ubicacion ?? event.ubicacion,
    visibilidad: eventData.visibilidad ?? event.visibilidad,
    presupuesto: eventData.presupuesto ?? event.presupuesto,
    objetivo: eventData.objetivo ?? event.objetivo,
    color: eventData.color ?? event.color,
    imagen: imagePath
  };

  console.log('Performing update with merged data');
  return await EventRepository.updateEvent(fixedData);
};

export const deleteEvent = async (id: string | number, user_id: string | number): Promise<void> => {
  const event = await getEvent(id);
  if (!event) throw new Error('Event not found');

  //  if(26 !== user_id) {
  //    throw new Error('Unauthorized: Only the creator can delete this event');
  //  }

  // Obtener emails de los participantes
  const participants = await EventRepository.getEventParticipants(id);
  console.log('Participants to notify:', participants);

  // Enviar emails de cancelación antes de borrar el evento
  if (participants.length > 0) {
    await sendCancellationEmail(participants, event.nombre);
  }

  // Borrar imagen de Supabase si existe
  if (event.imagen) {
    await deleteImageFromSupabase(event.imagen);
  }

  await EventRepository.deleteEvent(id);
}


export const createEvent = async (eventData: any, id_user: string | number, file: Express.Multer.File | null = null): Promise<{ eventId: number; imagePath: string | null }> => {
  try {
    // For presupuesto: handle empty string, convert to number if string, or keep as is
    if (eventData.presupuesto === '') {
      eventData.presupuesto = null;
    } else if (typeof eventData.presupuesto === 'string') {
      const parsed = parseFloat(eventData.presupuesto);
      eventData.presupuesto = isNaN(parsed) ? null : parsed;
    }
    
    // For objetivo: handle empty string, convert to number if string, or keep as is  
    if (eventData.objetivo === '') {
      eventData.objetivo = null;
    } else if (typeof eventData.objetivo === 'string') {
      const parsed = parseFloat(eventData.objetivo);
      eventData.objetivo = isNaN(parsed) ? null : parsed;
    }

    if (eventData.visibilidad === 'true' || eventData.visibilidad === '1') {
      eventData.visibilidad = 1;
    } else if (eventData.visibilidad === 'false' || eventData.visibilidad === '0') {
      eventData.visibilidad = 0;
    }

    // Create the event first without image
    const eventId = await EventRepository.createEvent(eventData, id_user);
    
    let imagePath = null;
    
    // Handle image upload if file is provided
    if (file) {
      try {
        imagePath = await uploadImageToSupabase(file, eventId);
        // Update the event with the image path
        await EventRepository.updateEvent({ id: eventId, imagen: imagePath });
      } catch (storageError) {
        console.error('Storage operation failed:', storageError);
        // Continue with event creation even if image upload fails
      }
    }

    return { eventId, imagePath };
  } catch (error) {
    console.error('Error in createEvent service:', error);
    throw error;
  }
};

export const agendarEvent = async (id_evento: string | number, id_user: string | number): Promise<void> => {
  console.log('Entrando al endpoint de agendar');
  const alreadyAgendado = await EventRepository.checkEventAgendado(id_evento, id_user);
  if (alreadyAgendado) throw new Error('Event already registered');
  const fechaActual = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  console.log('Fecha para insertar:', fechaActual); // <-- Esto debe verse en la consola
  await EventRepository.addEventToAgenda(id_evento, id_user, fechaActual);
};

export const getMonthlyInscriptions = async (eventId: string | number): Promise<any> => {
  return await EventRepository.getMonthlyInscriptions(eventId);
};

export const removeAgendadoEvent = async (id_evento: string | number, id_user: string | number): Promise<void> => {
  const alreadyAgendado = await EventRepository.checkEventAgendado(id_evento, id_user);
  if (!alreadyAgendado) throw new Error('Event not found in user agenda');
  await EventRepository.removeEventFromAgenda(id_evento, id_user);
};