import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfwnizjbliyuwhjpqeog.supabase.co';
const supabaseAnonKey = 'sb_publishable_6ES9vD2hQlF2rhArVuHjhQ_gHn4t6_6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);