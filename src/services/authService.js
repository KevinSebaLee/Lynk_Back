import * as authRepository from '../repositories/authRepository.js';
import jwt from 'jsonwebtoken';

export const login = async (email, contraseña) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isPasswordValid = await authRepository.comparePassword(contraseña, user.contraseña);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  const payload = { id: user.id, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  return { token };
};