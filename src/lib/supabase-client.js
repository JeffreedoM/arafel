import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mag-add tayo ng checking para malaman natin kung nawawala ang env sa ibang page
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Babala: Nawawala ang Supabase Environment Variables sa page na ito!",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
