import { createClient } from '@supabase/supabase-js'

// Intentar obtener de variables de entorno (Vercel/Vite) o usar el string directo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hururbfcotnebgamhget.supabase.co';

// NOTA: Asegúrate de que esta Key sea la "anon public" que copiaste de Supabase.
// La que pasaste se veía duplicada, aquí la dejo limpia si es que era un error de pegado.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cnVyYmZjb3RuZWJnYW1oZ2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTEzNDcsImV4cCI6MjA4MzAyNzM0N30.OTzen7ePLhG036uK4grHNsZoYfo2oq7RPUrTCSVr33k'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
