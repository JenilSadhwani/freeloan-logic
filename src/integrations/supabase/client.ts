// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lfjrbeykcbcsdzuwvddc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmanJiZXlrY2Jjc2R6dXd2ZGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzM1MTQsImV4cCI6MjA1ODEwOTUxNH0.zLVukovgWmnnf_EBpsw9LqItbQbiW0jAdDTZMpwTOzs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);