import * as userRepository from '../repositories/userRepository.js';

export const getUsers = async (id) => {
  return await userRepository.getUsers(id);
};