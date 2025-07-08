import express from 'express';
import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, apellido, email, contraseña, id_pais, id_genero, id_premium } = req.body;

  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM "Usuarios" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const midNombre = Math.floor(nombre.length / 2);
    const midApellido = Math.floor(apellido.length / 2);
  
    const alias = nombre.substring(0, midNombre) + apellido.substring(midApellido);

    const insertResult = await pool.query(
      `INSERT INTO "Usuarios" (nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, alias)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nombre, apellido, email`,
      [nombre, apellido, email, hashedPassword, id_pais, id_genero, id_premium, alias]
    );

    res.status(201).json({ user: insertResult.rows[0] });
  } catch (err) {
    console.error('PostgreSQL Insert Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;