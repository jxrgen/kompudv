// Konfiguration til kompetenceudviklings-app'en.

// Hvilket databacked appen kører på:
//   "local"    — alt gemmes i browserens localStorage. Ingen server, ingen opsætning.
//                Til demo og udvikling. Data deles ikke mellem enheder eller brugere.
//   "supabase" — rigtig database med login og adgangskontrol. Kræver at
//                SUPABASE_URL og SUPABASE_ANON_KEY nedenfor er udfyldt.
//                Se docs/SUPABASE-OPSAETNING.md.
export const BACKEND = "local";

// ---- Kun relevant når BACKEND = "supabase" -------------------------------
//
// Findes i Supabase Studio: Project Settings → API → "Project URL" og den
// offentlige nøgle ("Publishable key" eller "anon public").
// Nøglen er designet til at ligge offentligt i frontend-kode; det er Row Level
// Security (se supabase-schema.sql) der beskytter data.

export const SUPABASE_URL = "https://DIT-PROJEKT.supabase.co";
export const SUPABASE_ANON_KEY = "DIN-ANON-PUBLIC-NØGLE";

// ---- Admin ----------------------------------------------------------------
// Ekstra spærre foran admin-området (7 klik på app-ikonet + dette password).
// NB: dette er kun en obfuskering i browseren — den egentlige adgangskontrol
// er is_admin-flaget på brugeren.
export const ADMIN_UNLOCK_PASSWORD = "Superadmin";
