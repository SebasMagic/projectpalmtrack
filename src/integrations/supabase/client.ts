
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mwqwiwresjjrnxelrucd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cXdpd3Jlc2pqcm54ZWxydWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjIzMDUsImV4cCI6MjA1NzUzODMwNX0.BiGFlF0A-EE32FbJQbMLBY2yszrcdBmGiH_SrQo-w1c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
