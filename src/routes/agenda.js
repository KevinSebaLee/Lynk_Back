import express from 'express';
import supabase from '../database/supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import { supaBaseErrorHandler } from '../utils/supaBaseErrorHandler.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { id_user } = req.cookies ? req.cookies : { id_user: null };

  try {
    const { data, error } = await supabase
      .from('EventosAgendados')
      .select(`Eventos(nombre, descripcion, fecha, ubicacion, color, imagen)`)
      .eq('id_user', id_user);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }
    const cleanedData = data.map(({ id_evento, id_user, ...rest }) => rest);
    res.json(cleanedData);
  } catch (err) {
    supaBaseErrorHandler(err, res, 'Failed to fetch agenda');
  }
});

export default router;