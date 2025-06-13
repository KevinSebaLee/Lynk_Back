import express from 'express';
import supabase from '../database/supabaseClient.js';
import bcrypt from 'bcryptjs';
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
        console.error('Error in root route:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;