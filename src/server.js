import express from 'express';
import supabase from './modules/supabaseClient.js';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', async (req, res) => {
  const { id_user } = req.cookies ? req.cookies : { id_user: null };

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

app.get('/profile', async (req, res) => {
  const { id_user } = req.cookies ? req.cookies : { id_user: null };

  if (!id_user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('Usuarios')
      .select(`
        nombre,
        apellido,
        pfp,
        Paises(nombre),
        Planes(titulo)
      `)
      .eq('id', id_user)
      .single();

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

app.get('/usuarios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Usuarios')
      .select(`
        *,
        Paises(nombre),
        Generos(nombre),
        Planes(titulo)
      `);
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

app.get('/login', async (req, res) => {
  const { email, contraseña } = req.query;

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { id, nombre, apellido, pfp } = user;

    res.cookie('id_user', user.id, 
          {
            httpOnly: true, // cookie not accessible via JavaScript
            sameSite: 'lax', // or 'none' for cross-origin
            secure: false, // set to true if using HTTPS
          });

    return res.json({ id, nombre, apellido, pfp });

    // http://localhost:3000/login?email=pepe.troncoso@gmail.com&contraseña=Pepe12345Troncoso

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ 
      error: 'Failed to login', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('id_user', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
  res.json({ message: 'Logged out successfully' });
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
