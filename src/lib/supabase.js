import { createClient } from '@supabase/supabase-js'

// Usar import.meta.env para Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
