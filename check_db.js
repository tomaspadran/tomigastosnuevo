import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hururbfcotnebgamhget.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cnVyYmZjb3RuZWJnYW1oZ2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTEzNDcsImV4cCI6MjA4MzAyNzM0N30.OTzen7ePLhG036uK4grHNsZoYfo2oq7RPUrTCSVr33k'; 

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error selecting:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]));
    } else {
      console.log('Table is empty. Checking via error trick...');
      // Try to select non-existent column to see error message with available columns if possible
      const { error: err2 } = await supabase.from('expenses').select('id, description, amount, category, subcategory, type');
      if (err2) {
        console.log('Error hint:', err2.message);
      } else {
          console.log('Columns id, description, amount, category, subcategory, type all seem to exist (or at least no error).');
      }
    }
  } catch (e) {
    console.error('General error:', e.message);
  }
}

checkColumns();
