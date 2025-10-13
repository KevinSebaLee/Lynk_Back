import UserRepository from '../repositories/userRepository.ts';

export const getUsers = async () => {
  return await UserRepository.getUsers();
};