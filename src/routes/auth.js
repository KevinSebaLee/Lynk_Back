import express from 'express';
import * as authService from '../services/authService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { token } = await authService.login(email, contraseña);
    res.json({ token, message: 'Logged in successfully!' });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;