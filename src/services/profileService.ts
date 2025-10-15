import ProfileRepository from '../repositories/profileRepository.js';

export const getProfile = async (id: string | number) => ProfileRepository.getProfile(id);