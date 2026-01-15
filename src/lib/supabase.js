import { createClient } from '@supabase/supabase-js'

// Intentar obtener de variables de entorno (Vercel/Vite) o usar el string directo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hururbfcotnebgamhget.supabase.co';

// NOTA: Asegúrate de que esta Key sea la "anon public" que copiaste de Supabase.
// La que pasaste se veía duplicada, aquí la dejo limpia si es que era un error de pegado.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxH'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
