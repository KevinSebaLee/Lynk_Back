import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'

// Import route modules
import Usuarios from './routes/users.js';
import Tickets from './routes/tickets.js';
import Home from './routes/index.js';
import Perfil from './routes/profile.js';
import Registrar from './routes/register.js';
import Eventos from './routes/event.js';
import Agenda from './routes/agenda.js';
import Auth from './routes/auth.js';

import Test from './routes/tests.js';

// Import error handler middleware
import { errorHandler } from './middleware/errorHandler.js';

// http://127.0.0.1:4040
// https://stirring-intense-sheep.ngrok-free.app -> http://localhost:3000   

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true, // Required for cookies
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    sameSite: 'none'
}));

app.use('/', Home);
app.use('/usuarios', Usuarios);
app.use('/tickets', Tickets);
app.use('/perfil', Perfil);
app.use('/register', Registrar)
app.use('/eventos', Eventos);
app.use('/agenda', Agenda);
app.use('/auth', Auth);
app.use('/test-connection', Test)

app.use(errorHandler);

app.listen(3000, () => console.log('http://localhost:3000'));