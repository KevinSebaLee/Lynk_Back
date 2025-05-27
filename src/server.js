import express from 'express';
import supabase from './modules/supabaseClient.js';

const app = express();

app.get('/Usuarios', async (req, res) => {
  const { data, error } = await supabase
    .from('Usuarios')
    .select('*');

  if (error) {
    console.error('Supabase Error:', error); // 🔍 Log it
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});


app.listen(3000, () => console.log('http://localhost:3000'));
