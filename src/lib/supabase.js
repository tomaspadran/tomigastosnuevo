import { createClient } from '@supabase/supabase-js'

// Reemplaza los valores de abajo con los que sacaste de tu panel de Supabase
const supabaseUrl = 'https://hururbfcotnebgamhget.supabase.co'
const supabaseAnonKey = 'sb_publishable_hSrl7qXqO3l5kzuYO19yYQ_2OYOiXxH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
