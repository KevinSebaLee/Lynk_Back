import express from 'express';
import pool from '../database/pgClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    const id_user = req.query.id_user ? parseInt(req.query.id_user) : null;

    console.log(id_user)

    // Adjust the query to join the related tables as needed
    const baseQuery = `
        SELECT u.*, p.nombre AS pais_nombre, g.nombre AS genero_nombre, pl.titulo AS plan_titulo
        FROM "Usuarios" u
        LEFT JOIN "Paises" p ON u.id_pais = p.id
        LEFT JOIN "Generos" g ON u.id_genero = g.id
        LEFT JOIN "Planes" pl ON u.id_premium = pl.id
        ${id_user ? 'WHERE u.id = $1' : ''}
    `;

    try {
        const result = id_user
            ? await pool.query(baseQuery, [id_user])
            : await pool.query(baseQuery);

        const cleanedData = result.rows.map(({ id_genero, id_pais, id_premium, ...rest }) => rest);

        res.json(cleanedData);
    } catch (err) {
        console.error('PostgreSQL Query Error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router;