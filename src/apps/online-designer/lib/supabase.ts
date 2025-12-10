
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgkbiwdqbodywaozjwor.supabase.co';
const supabaseAnonKey = 'your-anon-key'; // This will be provided by Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
