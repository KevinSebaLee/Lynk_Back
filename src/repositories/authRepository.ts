import { supabaseClient } from '../database/supabase.js';
import bcrypt from 'bcryptjs';

class AuthRepository {
  static async findUserByEmail(email: string) {
    const { data, error } = await supabaseClient
      .from('Usuarios')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  static async comparePassword(plain: string, hash: string) {
    return bcrypt.compare(String(plain), hash);
  }
}

export default AuthRepository;