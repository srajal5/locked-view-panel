// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tnfexpjgfucolbrbdmla.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZmV4cGpnZnVjb2xicmJkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODI2OTIsImV4cCI6MjA2MTA1ODY5Mn0.OFxy_t_lvrH1kOLbkgkChZoW4zRPTSjFN80rkb2lwAI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);