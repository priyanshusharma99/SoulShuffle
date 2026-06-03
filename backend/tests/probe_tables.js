const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
  console.log('--- 🔍 DATABASE PROBE ---');
  console.log('Supabase URL:', process.env.SUPABASE_URL);

  const possibleTables = [
    'dares',
    'challenges',
    'master_deck',
    'cards',
    'decks',
    'questions',
    'rooms'
  ];

  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(5);
      if (error) {
        console.log(`🔴 Table "${table}" error:`, error.message);
      } else {
        console.log(`🟢 Table "${table}" exists! Row count (sample):`, data.length);
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.log(`🔴 Table "${table}" exception:`, e.message);
    }
  }
}

probe();
