import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// Import route modules

import Usuarios from './routes/users.js';
import Tickets from './routes/tickets.js';
import Home from './routes/index.js';
import Perfil from './routes/profile.js';
import Registrar from './routes/register.js';
import Eventos from './routes/event.js';
import Agenda from './routes/agenda.js';
import Auth from './routes/auth.js';
import Categories from './routes/categories.js';

import Test from './routes/tests.js';

import { errorHandler } from './middleware/errorHandler.js';

// https://stirring-intense-sheep.ngrok-free.app -> http://localhost:3000   

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'exp://ukrtnqe-anonymous-8081.exp.direct', 'stirring-intense-sheep.ngrok-free.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  sameSite: 'none'
}));

app.use('/', Home);
app.use('/usuarios', Usuarios);
app.use('/tickets', Tickets);
app.use('/perfil', Perfil);
app.use('/register', Registrar);
app.use('/eventos', Eventos);
app.use('/agenda', Agenda);
app.use('/auth', Auth);
app.use('/test-connection', Test);
app.use('/categorias', Categories);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(errorHandler);

app.listen(3000, () => console.log('http://localhost:3000'));