import ProfileRepository from '../repositories/profileRepository.js';

export const getProfile = async (id) => ProfileRepository.getProfile(id);