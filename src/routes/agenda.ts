import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as agendaService from '../services/agendaService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const agenda = await agendaService.getAgenda(req.user.id);
    res.json(agenda);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

export default router;