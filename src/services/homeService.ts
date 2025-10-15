import HomeRepository from '../repositories/homeRepository.js';

export const getHomeData = async (id: string | number) => HomeRepository.getHomeData(id);