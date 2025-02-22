import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  due_date?: string;
  created_at: string;
  user_id: string;
};