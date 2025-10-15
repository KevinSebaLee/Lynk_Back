import { supabaseClient } from '../database/supabase.js';

class CategoryRepository {
  static async getAllCategories() {
    try {
      const { data, error } = await supabaseClient
        .from('Categorias')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }
}

export default CategoryRepository;
