import { createClient } from '@supabase/supabase-js';


const supabaseUrl= 'https://dvjcfrnjjodznviqraog.supabase.co';
const supabaseKey= 'sb_publishable_INnfybqxjW4YX51c_otefw_CaJBJK4w';
//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);