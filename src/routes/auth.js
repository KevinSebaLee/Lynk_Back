import express from 'express';
import pool from '../database/pgClient.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/login', async (req, res) => {
  const { email, contraseña } = req.query;

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM "Usuarios" WHERE email = $1 LIMIT 1', [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { id, nombre, apellido, pfp } = user;

    res.cookie('id_user', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return res.json({ id, nombre, apellido, pfp });

  } catch (err) {
    console.error('PostgreSQL Query Error:', err);
    res.status(500).json({ error: 'Failed to fetch user to login' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('id_user', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;