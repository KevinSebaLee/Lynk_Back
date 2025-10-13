import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as homeService from '../services/homeService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await homeService.getHomeData(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;