import { createClient } from '@supabase/supabase-js'

// ASEGÚRATE DE QUE LA URL EMPIECE CON HTTPS://
const supabaseUrl = 'https://hururbfcotnebgamhget.supabase.co' 
const supabaseAnonKey = 'sb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxHsb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
