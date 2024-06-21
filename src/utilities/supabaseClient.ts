import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://dznfhiyfjniapdbzdjpt.supabase.co";
export const SUPABASE_PROJECT_ID = "dznfhiyfjniapdbzdjpt";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmZoaXlmam5pYXBkYnpkanB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY5NDE5MiwiZXhwIjoyMDM0MjcwMTkyfQ.H1LQieqWyYbOj_KjqQVkJLdDNk1e6YH5iqspe-X8REY";

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
  },
);
