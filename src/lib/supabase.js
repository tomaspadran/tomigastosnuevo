import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_URL'
const supabaseAnonKey = 'TU_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
