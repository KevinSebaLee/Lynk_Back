import express from 'express';
import * as registerService from '../services/registerService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user, token } = await registerService.registerUser(req.body);
    res.status(201).json({
      user: {
        ...user,
        user_nombre: user.nombre,
        user_apellido: user.apellido,
        user_email: user.email,
        tickets: 0,
        plan_titulo: user.plan_titulo || 'Básico'
      },
      token,
      message: 'Registration successful'
    });
  } catch (err) {
    res.status(err.message === 'Email already registered' ? 409 : 500).json({ error: err.message || 'Registration failed' });
  }
});

export default router;