// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnktsgglrgheqtqtdkma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxua3RzZ2dscmdoZXF0cXRka21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDM5NDAsImV4cCI6MjA2ODcxOTk0MH0.07N7whOt28KgzC2U6z6iUm2BJU8W_Ml-tBPuvs4rufw';

export const supabase = createClient(supabaseUrl, supabaseKey);