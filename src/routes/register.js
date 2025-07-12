import express from 'express';
import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, apellido, email, contraseña, id_pais, id_genero, id_premium } = req.body;

  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT id FROM "Usuarios" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const midNombre = Math.floor(nombre.length / 2);
    const midApellido = Math.floor(apellido.length / 2);
  
    const alias = nombre.substring(0, midNombre) + apellido.substring(midApellido);

    const insertResult = await pool.query(
      `INSERT INTO "Usuarios" (nombre, apellido, email, contraseña, id_pais, id_genero, id_premium, alias, tickets)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, nombre, apellido, email`,
      [nombre, apellido, email, hashedPassword, id_pais, id_genero, id_premium, alias, 0]
    );

    const userId = insertResult.rows[0].id;
    
    const payload = { id: userId, email: email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    const planResult = await pool.query(
      'SELECT titulo FROM "Planes" WHERE id = $1',
      [id_premium]
    );
    
    const plan_titulo = planResult.rows[0]?.titulo || 'Básico';

    return res.status(201).json({
      user: {
        ...insertResult.rows[0],
        user_nombre: nombre,
        user_apellido: apellido,
        user_email: email,
        tickets: 0,
        plan_titulo
      },
      token,
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('PostgreSQL Insert Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;