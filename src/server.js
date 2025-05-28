import express from 'express';
import supabase from './modules/supabaseClient.js';

const app = express();

app.get('/Usuarios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Usuarios')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Connection Error:', err);
    res.status(500).json({ 
      error: 'Failed to connect to Supabase',
      details: err.message 
    });
  }
});

app.get('/test-connection', async (req, res) => {
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

app.get('/ping-supabase', async (req, res) => {
  try {
    const ping = await fetch('https://www.google.com');
    const supabasePing = await fetch('https://wqawnxhzcqxdhwyibvhe.supabase.co');
    res.json({
      google: ping.ok,
      supabase: supabasePing.ok
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
