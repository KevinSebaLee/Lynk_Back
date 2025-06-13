import express from 'express';
import supabase from '../database/supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const id_user = req.query.id_user ? parseInt(req.query.id_user) : null;

  try {
    const { data, error } = await (
      id_user
        ? supabase
            .from('Eventos')
            .select(`*,Usuarios(nombre, apellido, pfp),Categorias(nombre)`)
            .eq('id_creador', id_user)
        : supabase
            .from('Eventos')
            .select(`*,Usuarios(nombre, apellido, pfp),Categorias(nombre)`)
    );
    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }

    const cleanedData = data.map(({ id_categoria, id_creador, presupuesto, objetivo, ...rest }) => ({
      ...rest,
      presupuesto: presupuesto.toLocaleString(),
      objetivo: objetivo.toLocaleString()
    }));

    res.json(cleanedData);
  } catch (err) {
    console.error('Connection Error:', err);
    res.status(500).json({ 
      error: 'Failed to connect to Supabase',
      details: err.message 
    });
  }
});

router.get('/agendar', requireAuth, async (req, res) => {
  const { id_evento } = req.query;
  const { id_user } = req.cookies

  verifyUser(req, res);

  if (!id_evento || !id_user) {
    return res.status(400).json({ error: 'Event ID and User ID are required' });
  }

  // http://localhost:3000/eventos/agendar?id_evento=2

  try {
    const { data: existingScheduledEvent, error: lookupError } = await supabase
      .from('EventosAgendados')
      .select('id_evento')
      .eq('id_evento', id_evento)
      .single();

    if (existingScheduledEvent) {
      return res.status(409).json({ error: 'Event already registered' });
    }

    const { error } = await supabase
      .from('EventosAgendados')
      .insert({ id_evento, id_user });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    return res.status(201).json({ message: 'Event scheduled successfully' });
    
  } catch (err) {
    console.error('Event Scheduling Error:', err);
    return res.status(500).json({ 
      error: 'Failed to schedule event', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen, id_creador } = req.body;

  const imagenVerificar = imagen ?? null;

  try {
    const { error } = await supabase
      .from('Eventos')
      .insert({ id_categoria, nombre, descripcion, fecha, ubicacion, visibilidad, presupuesto, objetivo, color, imagen: imagenVerificar, id_creador });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    return res.status(201).json({ message: 'Event logged successfully' });
    
  } catch (err) {
    console.error('Event Logging Error:', err);
    return res.status(500).json({ 
      error: 'Failed to log event', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

router.get('/:id/movimientos', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { id_user } = req.cookies ? req.cookies : { id_user: null };
  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  verifyUser(req.cookies, res, async () => {
    try {
      const { data: eventOwner, error: eventError } = await supabase
        .from('Eventos')
        .select('id_creador')
        .eq('id', id)
        .single();

      if(!eventOwner){
        return res.status(409).json({ error: 'Not event owner' });
      }

      const { data, error } = await supabase
        .from('Eventos')
        .select(`nombre, presupuesto, objetivo, color, Movimientos(*)`)
        .eq('id', id)
        .eq('id_creador', id_user);

      if (error) {
        console.error('Supabase Query Error:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      console.error('Connection Error:', err);
      res.status(500).json({
        error: 'Failed to connect ot Supabase',
        details: err.message
      });
    }
  });
});

export default router;