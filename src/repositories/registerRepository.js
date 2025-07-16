import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (userData) => {
  const { nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, esEmpresa, cuil, telefono, direccion } = userData;

  const existing = await pool.query('SELECT id FROM "Usuarios" WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(contraseña, 10);
  const midNombre = Math.floor(nombre.length / 2);
  const midApellido = Math.floor(apellido.length / 2);
  const alias = nombre.substring(0, midNombre) + apellido.substring(midApellido);

  const insertResult = await pool.query(
    `INSERT INTO "Usuarios" (nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, alias, tickets) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0) RETURNING id, nombre, apellido, email`,
    [nombre, apellido, email, hashedPassword, id_pais, id_genero, id_premium, alias]
  );

  if (esEmpresa) {
    await pool.query(
      `INSERT INTO "Empresas" (id_usuario, cuil, telefono, direccion) VALUES ($1, $2, $3, $4)`,
      [insertResult.rows[0].id, cuil, telefono, direccion]
    );
  }

  return insertResult.rows[0];
};