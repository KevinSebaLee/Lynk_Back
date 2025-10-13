import CategoryRepository from '../repositories/categoryRepository.js';

export async function getAllCategories() {
  return await CategoryRepository.getAllCategories();
}
