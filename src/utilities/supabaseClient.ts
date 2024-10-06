import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env
  .VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseServiceRoleClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
    },
  }
);
