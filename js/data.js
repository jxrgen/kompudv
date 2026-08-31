// Backend-vælger. Resten af appen importerer kun herfra, så vi kan skifte mellem
// lokal demo og Supabase ved at ændre BACKEND i js/config.js.

import { BACKEND } from "./config.js";

const impl = BACKEND === "supabase"
  ? await import("./supabase.js")
  : await import("./local-store.js");

export const isConfigured = impl.isConfigured;
export const isDemo = impl.isDemo === true;

export const signUp = impl.signUp;
export const signIn = impl.signIn;
export const signOut = impl.signOut;
export const getSession = impl.getSession;
export const onAuthChange = impl.onAuthChange;

export const getMyProfile = impl.getMyProfile;

export const listMyCompetences = impl.listMyCompetences;
export const addCompetence = impl.addCompetence;
export const deleteCompetence = impl.deleteCompetence;

export const adminListUsers = impl.adminListUsers;
export const adminListCompetences = impl.adminListCompetences;
