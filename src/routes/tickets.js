import express from 'express';
import supabase from '../database/supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import { supaBaseErrorHandler } from '../utils/supaBaseErrorHandler.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const id_user = req.id_user; // set by requireAuth

  try {
    const { data, error } = await supabase
      .from('Movimientos')
      .select('*, Usuarios(tickets), Eventos(nombre), Monedas(nombre), Categorias(nombre), TipoMovimientos(icon)')
      .eq('id_user', id_user);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }

    const cleanedData = data?.map(({ id, id_user: uid, id_evento, id_moneda, id_categoria, id_tipo_movimiento, ...rest }) => rest);

    res.json(cleanedData);
  } catch (err) {
    supaBaseErrorHandler(err, res, 'Failed to fetch user data');
  }
});

router.get('/cupones', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Cupones')
      .select('*')
      .eq('id_user', req.id_user);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    supaBaseErrorHandler(err, res, 'Failed to fetch offers');
  }
});

export default router;