// Supabase-klient + dataadgangslag.
// Alt databasekald i app'en går gennem dette modul, så backend kan skiftes ud senere.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const isConfigured =
  !SUPABASE_URL.includes("DIT-PROJEKT") && !SUPABASE_ANON_KEY.includes("DIN-ANON");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ---- Auth -----------------------------------------------------------------

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

// ---- Profil -------------------------------------------------------------

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, is_admin, created_at")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

// ---- Kompetencer -------------------------------------------------------

export async function listMyCompetences() {
  const { data, error } = await supabase
    .from("competences")
    .select("*")
    .order("activity_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addCompetence(entry) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("competences")
    .insert({ ...entry, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCompetence(id) {
  const { error } = await supabase.from("competences").delete().eq("id", id);
  if (error) throw error;
}

// ---- Admin -----------------------------------------------------------

export async function adminListUsers() {
  // Kræver is_admin = true (håndhæves af RLS).
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, is_admin, created_at")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function adminListCompetences(userId) {
  const { data, error } = await supabase
    .from("competences")
    .select("*")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false });
  if (error) throw error;
  return data;
}
