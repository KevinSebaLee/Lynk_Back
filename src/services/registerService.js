import RegisterRepository from '../repositories/registerRepository.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (userData) => {
  const user = await RegisterRepository.registerUser(userData);
  const payload = { 
    id: user.id, 
    email: user.email,
    esEmpresa: user.esEmpresa
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
};