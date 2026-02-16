import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtlxbqqajguzshbsvzmg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHhicXFhamd1enNoYnN2em1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDg5MjUsImV4cCI6MjA4Njc4NDkyNX0.g_Eld5FPaudXdTBdjr9nCVppdo-HeMMzoFTSZH8BKNU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
