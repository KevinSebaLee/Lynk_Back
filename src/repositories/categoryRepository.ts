import pool from '../database/pgClient.js';

class CategoryRepository {
  static async getAllCategories() {
    try {
      const result = await pool.query('SELECT * FROM "Categorias" ORDER BY nombre ASC');

      return result.rows;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }
}

export default CategoryRepository;
