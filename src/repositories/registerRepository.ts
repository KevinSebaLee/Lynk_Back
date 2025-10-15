import { supabaseClient } from '../database/supabase.js';
import bcrypt from 'bcryptjs';

class RegisterRepository {
  static async registerUser(userData: any) {
    const { nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, esEmpresa, cuil, telefono, direccion } = userData;

    const { data: existing, error: existingError } = await supabaseClient
      .from('Usuarios')
      .select('id')
      .eq('email', email);

    if (existingError) throw existingError;
    if (existing && existing.length > 0) throw new Error('Email already registered');

    console.log('Registering user with esEmpresa:', esEmpresa);

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const midNombre = Math.floor(nombre.length / 2);
    const midApellido = apellido ? Math.floor(apellido.length / 2) : 0;

    const alias = apellido ? nombre.substring(0, midNombre) + apellido.substring(midApellido) : nombre;

    const { data: insertResult, error: insertError } = await supabaseClient
      .from('Usuarios')
      .insert({
        nombre,
        apellido,
        email,
        contraseña: hashedPassword,
        id_pais,
        id_genero,
        id_premium,
        alias,
        tickets: 0,
        esEmpresa: !!esEmpresa
      })
      .select('id, nombre, apellido, email, esEmpresa')
      .single();

    if (insertError) throw insertError;

    if (esEmpresa) {
      const { error: empresaError } = await supabaseClient
        .from('Empresas')
        .insert({
          id_user: insertResult.id,
          cuil,
          telefono,
          direccion
        });

      if (empresaError) throw empresaError;
    }

    return insertResult;
  }
}

export default RegisterRepository;