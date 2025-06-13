import express from 'express';
import supabase from '../database/supabaseClient.js';
import {supaBaseErrorHandler} from '../utils/supaBaseErrorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const { id_user } = req.cookies || {};
        const { data, error } = await supabase
        .from('Usuarios')
        .select('tickets, id_premium')
        .eq('id', id_user)
        .single();

        if (error) {
        console.error('Supabase Query Error:', error);
        return res.status(500).json({ error: error.message });
        }

        res.json({ data, id_user });
    } catch (err) {
        supaBaseErrorHandler(err, res, 'Failed to fetch user data');
    }
});

export default router;