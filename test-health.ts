import { checkSupabaseHealth } from './src/integrations/supabase/healthCheck';

async function testHealth() {
  const health = await checkSupabaseHealth();
  console.log('Supabase Health Check Result:', JSON.stringify(health, null, 2));
}

testHealth();
