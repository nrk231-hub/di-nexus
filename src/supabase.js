import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yydmsttenscnwivmblbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZG1zdHRlbnNjbndpdm1ibGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODA1MjcsImV4cCI6MjA5NjI1NjUyN30.u0k6PsvHRaKbTXqebXyklhilUxa1NyN7oKGrwtvVqOM'
);
