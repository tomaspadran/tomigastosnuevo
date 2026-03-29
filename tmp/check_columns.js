import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hururbfcotnebgamhget.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cnVyYmZjb3RuZWJnYW1oZ2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTEzNDcsImV4cCI6MjA4MzAyNzM0N30.OTzen7ePLhG036uK4grHNsZoYfo2oq7RPUrTCSVr33k'; 

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    // If table is empty, we might need another way to check schema, 
    // but usually let's hope there is at least one row.
    console.log('Table is empty, cannot infer columns from data.');
    
    // Attempt to insert and then rollback or just check error message? 
    // Better yet, just try to select some columns that might exist.
  }
}

checkColumns();
