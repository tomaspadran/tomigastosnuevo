import { createClient } from '@supabase/supabase-js'

// ASEGÚRATE DE QUE LA URL EMPIECE CON HTTPS://
const supabaseUrl = 'https://tu-proyecto.supabase.co' 
const supabaseAnonKey = 'tu-clave-larga-aqui'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
