// Konfiguration til kompetenceudviklings-app'en.
//
// SUPABASE_URL og SUPABASE_ANON_KEY findes i Supabase Studio:
//   Project Settings → API → "Project URL" og "anon public" nøglen.
// anon-nøglen er designet til at ligge offentligt i frontend-kode; det er
// Row Level Security (se supabase-schema.sql) der beskytter data.
//
// Udfyld placeholder-værdierne nedenfor og commit filen.

export const SUPABASE_URL = "https://DIT-PROJEKT.supabase.co";
export const SUPABASE_ANON_KEY = "DIN-ANON-PUBLIC-NØGLE";

// Ekstra spærre foran admin-området (7 klik på app-ikonet + dette password).
// NB: dette er kun en obfuskering i browseren — den egentlige adgangskontrol
// er is_admin-flaget i databasen sammen med RLS.
export const ADMIN_UNLOCK_PASSWORD = "Superadmin";
