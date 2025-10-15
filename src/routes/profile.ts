import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as profileService from '../services/profileService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;