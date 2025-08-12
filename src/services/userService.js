import UserRepository from '../repositories/userRepository.js';

export const getUsers = async (id) => {
  return await UserRepository.getUsers(id);
};