import UserRepository from '../repositories/userRepository.js';

export const getUsers = async () => {
  return await UserRepository.getUsers();
};