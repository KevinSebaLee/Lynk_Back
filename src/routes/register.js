import express from 'express';
import supabase from '../database/supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import { supaBaseErrorHandler } from '../utils/supaBaseErrorHandler.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const {id_genero, id_pais, nombre, apellido, contraseña, email, pfp, nacimiento, id_premium } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is empty' });
  }

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (contraseña.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const { data: existingUser, error: lookupError } = await supabase
      .from('Usuarios')
      .select('email')
      .eq('email', email)
      .single();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const { error } = await supabase
      .from('Usuarios')
      .insert({ id_genero, id_pais, nombre, apellido, contraseña: hashedPassword,email, pfp, nacimiento, id_premium });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    return res.status(201).json({ message: 'User registered successfully' });
    
  } catch (err) {
    supaBaseErrorHandler(err, res, 'Failed to create user');
  }
});

export default router;