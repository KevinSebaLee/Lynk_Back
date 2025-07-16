import * as homeRepository from '../repositories/homeRepository.js';

export const getHomeData = async (id) => homeRepository.getHomeData(id);