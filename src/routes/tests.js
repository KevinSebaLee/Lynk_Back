import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://wqawnxhzcqxdhwyibvhe.supabase.co/rest/v1/', {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    res.json({ status: response.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;