import express from 'express';
import { supabaseClient } from '../database/supabase.js';

const router = express.Router();

// Example: Simple health check or test query
router.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('Usuarios')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ status: 'ok', db: { connected: true } });
  } catch (err) {
    console.error('Supabase Test Query Error:', err);
    res.status(500).json({ status: 'error', error: (err as Error).message });
  }
});

// Example: List all tables for debugging
router.get('/tables', async (req, res) => {
  try {
    // Note: Supabase doesn't provide direct access to information_schema
    // This endpoint would need to be implemented differently or removed
    res.json({ 
      message: 'Table listing not available with Supabase client',
      suggestion: 'Use Supabase dashboard to view tables'
    });
  } catch (err) {
    console.error('Supabase Table List Query Error:', err);
    res.status(500).json({ status: 'error', error: (err as Error).message });
  }
});

export default router;