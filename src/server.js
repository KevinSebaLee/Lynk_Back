import express from 'express';
import cookieParser from 'cookie-parser';

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

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', Home);
app.use('/usuarios', Usuarios);
app.use('/tickets', Tickets);
app.use('/tickets/cupones', Tickets);
app.use('/perfil', Perfil);
app.use('/register', Registrar)
app.use('/eventos', Eventos);
app.use('/eventos/agendar', Eventos);
app.use('/:id/movimientos', Eventos);
app.use('/agenda', Agenda);
app.use('/', Auth);
app.use('/test-connection', Test)

app.use(errorHandler);

app.listen(3000, () => console.log('http://localhost:3000'));