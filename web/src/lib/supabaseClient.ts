import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export const SUPABASE_URL = 'https://rdirvoopoaspyqiowmus.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_SplUfW5Di3peZ0q2TLYbOw_30Kr5Cn3';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
