import express from 'express';
import supabase from './modules/supabaseClient.js';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

app.get('/usuarios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Usuarios')
      .select('*')
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

app.get('/', async (req, res) => {
  const { id_user } = 1; // Default user ID for testing, replace with actual logic to get user ID

  try{
    const { data, error } = await supabase
      .from('Usuarios')
      .select('tickets')
      .eq('id', id_user)
      .limit(10);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  }catch(err) {
    console.error('Error in root route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/register', async (req, res) => {
  const {id_genero, id_pais, nombre, apellido, contraseña, email, pfp, nacimiento, id_premium } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is empty' });
  }

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (contraseña.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const { data: existingUser, error: lookupError } = await supabase
      .from('Usuarios')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const { error } = await supabase
      .from('Usuarios')
      .insert({ 
        id_genero, 
        id_pais, 
        nombre, 
        apellido, 
        contraseña: hashedPassword,
        email, 
        pfp, 
        nacimiento, 
        id_premium 
      });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    return res.status(201).json({ message: 'User registered successfully' });
    
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ 
      error: 'Failed to register user', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
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
