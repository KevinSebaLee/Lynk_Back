import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (userData) => {
  const { nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, esEmpresa, cuil, telefono, direccion } = userData;

  const existing = await pool.query('SELECT id FROM "Usuarios" WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already registered');

  console.log('Registering user with esEmpresa:', esEmpresa);

  const hashedPassword = await bcrypt.hash(contraseña, 10);
  const midNombre = Math.floor(nombre.length / 2);
  const midApellido = apellido ? Math.floor(apellido.length / 2) : 0;

  const alias = apellido ? nombre.substring(0, midNombre) + apellido.substring(midApellido) : nombre;

  const insertResult = await pool.query(
    'INSERT INTO "Usuarios" (nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, alias, tickets, "esEmpresa") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9) RETURNING id, nombre, apellido, email, "esEmpresa"',
    [nombre, apellido, email, hashedPassword, id_pais, id_genero, id_premium, alias, !!esEmpresa]
  );

  if (esEmpresa) {
    await pool.query(
      'INSERT INTO "Empresas" (id_user, cuil, telefono, direccion) VALUES ($1, $2, $3, $4)',
      [insertResult.rows[0].id, cuil, telefono, direccion]
    );
  }

  return insertResult.rows[0];
};