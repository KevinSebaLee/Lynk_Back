import express from 'express';
import pool from '../database/pgClient.js';

const router = express.Router();

// Example: Simple health check or test query
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: result.rows[0] });
  } catch (err) {
    console.error('PostgreSQL Test Query Error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Example: List all tables for debugging
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    res.json({ tables: result.rows.map(r => r.table_name) });
  } catch (err) {
    console.error('PostgreSQL Table List Query Error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;