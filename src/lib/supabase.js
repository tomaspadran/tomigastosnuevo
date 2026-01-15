import { createClient } from '@supabase/supabase-js'

// ASEGÚRATE DE QUE LA URL EMPIECE CON HTTPS://
const VITE_SUPABASE_URL = 'https://hururbfcotnebgamhget.supabase.co' 
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxHsb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxH'

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
