import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as userService from '../services/userService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const users = await userService.getUsers(id);
    res.json(users);
  } catch (err) {
    console.error('User Route Error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;