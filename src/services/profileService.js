import * as profileRepository from '../repositories/profileRepository.js';

export const getProfile = async (id) => profileRepository.getProfile(id);