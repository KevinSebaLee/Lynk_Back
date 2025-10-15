import AuthRepository from '../repositories/authRepository.js';
import jwt from 'jsonwebtoken';

export const login = async (email: string, contraseña: string) => {
  const user = await AuthRepository.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isPasswordValid = await AuthRepository.comparePassword(contraseña, user.contraseña);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  const payload = { id: user.id, email: user.email, nombre: user.nombre, pfp: user.pfp, esEmpresa: user.esEmpresa };
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  return { token };
};