import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ctfzprpghyuikucxiogj.supabase.co";
const supabaseKey = "sb_publishable_9AQGxxhbul9pmhgGUb6cew_uoXtGsFu";

export const supabase = createClient(supabaseUrl, supabaseKey);
