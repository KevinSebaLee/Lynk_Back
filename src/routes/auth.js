import express from 'express';
import supabase from '../database/supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/login', async (req, res) => {
  const { email, contraseña } = req.query;

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { id, nombre, apellido, pfp } = user;

    res.cookie('id_user', user.id, 
          {
            httpOnly: true, // cookie not accessible via JavaScript
            sameSite: 'lax', // or 'none' for cross-origin
            secure: false, // set to true if using HTTPS
          });

    return res.json({ id, nombre, apellido, pfp });

    // http://localhost:3000/login?email=pepe.troncoso@gmail.com&contraseña=Pepe12345Troncoso

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ 
      error: 'Failed to login', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
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