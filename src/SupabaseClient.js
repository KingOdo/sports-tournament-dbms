import { createClient } from '@supabase/supabase-js'

const supabaseUrl= 'https://dycfrnjodzvniqraog.supabase.co';
const supabaseAnonkey= 'sb_publishable_INnfybqxjW4YX51c_otefw_CaJBJK4w';

export const supabase = createClient(supabaseUrl, supabaseAnonkey)