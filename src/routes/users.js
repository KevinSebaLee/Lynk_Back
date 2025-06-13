import express from 'express';
import supabase from '../database/supabaseClient.js';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    const id_user = req.query.id_user ? parseInt(req.query.id_user) : null;
  
    try {
        const { data, error } = await (
        id_user
            ? supabase
                .from('Usuarios')
                .select(`*, Paises(nombre), Generos(nombre), Planes(titulo)`)
                .eq('id', id_user)
            : supabase
                .from('Usuarios')
                .select(`*, Paises(nombre), Generos(nombre), Planes(titulo)`)
        );

        if (error) {
        console.error('Supabase Query Error:', error);
        return res.status(500).json({ error: error.message });
        }

        const cleanedData = data.map(({ id_genero, id_pais, id_premium, ...rest }) => rest);

        res.json(cleanedData);
    } catch (err) {
        console.error('Connection Error:', err);
        res.status(500).json({ 
        error: 'Failed to connect to Supabase',
        details: err.message 
        });
    }
});

export default router;