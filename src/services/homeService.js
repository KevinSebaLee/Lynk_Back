import HomeRepository from '../repositories/homeRepository.js';

export const getHomeData = async (id) => HomeRepository.getHomeData(id);