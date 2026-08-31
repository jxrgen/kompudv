// Lokalt demo-backend — samme API som js/supabase.js, men alt gemmes i browserens
// localStorage. Ingen server, ingen konto, intet netværk.
//
// ⚠️  DEMO-FORMÅL. Dette er IKKE en sikker løsning:
//     - Data ligger ukrypteret i browseren og deles ikke mellem enheder eller brugere.
//     - Password'et hashes (SHA-256 uden salt), men alle "brugere" ligger i samme
//       localStorage, så enhver med adgang til maskinen kan læse det hele.
//     - Må aldrig indeholde rigtige personoplysninger.
//     Til drift skiftes til Supabase-laget: sæt BACKEND = "supabase" i js/config.js.

const KEY = "kompudv-demo-v1";

const emptyDb = () => ({ users: [], competences: [], session: null });

function readDb() {
  try {
    return { ...emptyDb(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return emptyDb();
  }
}

function writeDb(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (err) {
    throw new Error("Kunne ikke gemme lokalt — browseren blokerer måske for lagring.");
  }
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function hash(password) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback når crypto.subtle mangler (fx siden åbnet via file://).
  // Kun for at undgå ren klartekst i demoen — ikke sikkerhed.
  return "plain:" + password;
}

// Demo-backend er altid "konfigureret".
export const isConfigured = true;
export const isDemo = true;

// ---- Auth -----------------------------------------------------------------

const listeners = new Set();

function notify() {
  const session = currentSession();
  listeners.forEach((cb) => cb(session));
}

function currentSession() {
  const db = readDb();
  if (!db.session) return null;
  const user = db.users.find((u) => u.id === db.session);
  if (!user) return null;
  return { user: { id: user.id, email: user.email } };
}

export async function signUp({ email, password, fullName }) {
  const db = readDb();
  const mail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email === mail)) {
    throw new Error("User already registered");
  }
  if (!password || password.length < 8) {
    throw new Error("Password should be at least 8 characters");
  }
  const user = {
    id: uuid(),
    email: mail,
    full_name: fullName,
    pw: await hash(password),
    // Første bruger i demoen bliver automatisk admin, så admin-området kan afprøves.
    is_admin: db.users.length === 0,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  db.session = user.id;
  writeDb(db);
  notify();
  return { session: currentSession(), user };
}

export async function signIn({ email, password }) {
  const db = readDb();
  const mail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === mail);
  if (!user || user.pw !== (await hash(password))) {
    throw new Error("Invalid login credentials");
  }
  db.session = user.id;
  writeDb(db);
  notify();
  return { session: currentSession(), user };
}

export async function signOut() {
  const db = readDb();
  db.session = null;
  writeDb(db);
  notify();
}

export async function getSession() {
  return currentSession();
}

export function onAuthChange(callback) {
  listeners.add(callback);
  return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
}

// ---- Profil -------------------------------------------------------------

export async function getMyProfile() {
  const db = readDb();
  const user = db.users.find((u) => u.id === db.session);
  if (!user) return null;
  const { id, full_name, is_admin, created_at } = user;
  return { id, full_name, is_admin, created_at };
}

// ---- Kompetencer -------------------------------------------------------

function sortRows(rows) {
  return rows.sort(
    (a, b) =>
      b.activity_date.localeCompare(a.activity_date) ||
      b.created_at.localeCompare(a.created_at)
  );
}

export async function listMyCompetences() {
  const db = readDb();
  if (!db.session) return [];
  return sortRows(db.competences.filter((c) => c.user_id === db.session));
}

export async function addCompetence(entry) {
  const db = readDb();
  if (!db.session) throw new Error("Ikke logget ind.");
  const row = {
    id: uuid(),
    user_id: db.session,
    created_at: new Date().toISOString(),
    ...entry,
  };
  db.competences.push(row);
  writeDb(db);
  return row;
}

export async function deleteCompetence(id) {
  const db = readDb();
  const before = db.competences.length;
  // Kun egne rækker — samme begrænsning som RLS håndhæver i Supabase-laget.
  db.competences = db.competences.filter((c) => !(c.id === id && c.user_id === db.session));
  if (db.competences.length === before) throw new Error("Registreringen blev ikke fundet.");
  writeDb(db);
}

// ---- Admin -----------------------------------------------------------

function requireAdmin(db) {
  const me = db.users.find((u) => u.id === db.session);
  if (!me?.is_admin) throw new Error("Ingen admin-rettigheder.");
}

export async function adminListUsers() {
  const db = readDb();
  requireAdmin(db);
  return db.users
    .map(({ id, full_name, is_admin, created_at }) => ({ id, full_name, is_admin, created_at }))
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "da"));
}

export async function adminListCompetences(userId) {
  const db = readDb();
  requireAdmin(db);
  return sortRows(db.competences.filter((c) => c.user_id === userId));
}

// ---- Demo-hjælp ------------------------------------------------------

/** Rydder al demo-data. Kaldes fra konsollen: `kompudvDemoReset()` */
export function resetDemo() {
  localStorage.removeItem(KEY);
  notify();
}
globalThis.kompudvDemoReset = resetDemo;
