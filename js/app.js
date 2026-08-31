// Kompetenceudviklingsapp — hovedlogik (view-styring, auth, registreringer, admin).

import {
  isConfigured, supabase,
  signUp, signIn, signOut, getSession, onAuthChange,
  getMyProfile, listMyCompetences, addCompetence, deleteCompetence,
  adminListUsers, adminListCompetences,
} from "./supabase.js";
import { ADMIN_UNLOCK_PASSWORD } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);

const el = {
  app: $("#app"),
  views: {
    auth: $("#view-auth"),
    main: $("#view-main"),
    admin: $("#view-admin"),
  },
  // auth
  authTitle: $("#auth-title"),
  formAuth: $("#form-auth"),
  fieldName: $("#field-name"),
  authError: $("#auth-error"),
  authSubmit: $("#auth-submit"),
  switchToSignup: $("#switch-to-signup"),
  switchToLogin: $("#switch-to-login"),
  // main
  who: $("#who"),
  btnLogout: $("#btn-logout"),
  appIcon: $("#app-icon"),
  formCompetence: $("#form-competence"),
  competenceError: $("#competence-error"),
  competenceList: $("#competence-list"),
  countBadge: $("#count-badge"),
  // admin
  adminBack: $("#admin-back"),
  adminUsers: $("#admin-users"),
  adminDetail: $("#admin-detail"),
  adminDetailTitle: $("#admin-detail-title"),
  adminExport: $("#admin-export"),
  // dialog
  adminDialog: $("#admin-dialog"),
  formAdminUnlock: $("#form-admin-unlock"),
  adminUnlockError: $("#admin-unlock-error"),
};

let state = {
  profile: null,
  authMode: "login",
  adminSelectedUser: null,
  adminSelectedRows: [],
};

// ---------- Hjælpere ----------------------------------------------------

function showView(name) {
  for (const [key, node] of Object.entries(el.views)) node.hidden = key !== name;
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function humanError(err) {
  const msg = (err && err.message) || String(err);
  if (/Invalid login credentials/i.test(msg)) return "Forkert e-mail eller password.";
  if (/User already registered/i.test(msg)) return "Der findes allerede en bruger med denne e-mail.";
  if (/Password should be at least/i.test(msg)) return "Password skal være mindst 8 tegn.";
  if (/Email not confirmed/i.test(msg)) return "E-mailen er ikke bekræftet endnu — tjek din indbakke.";
  return msg;
}

// ---------- Auth ------------------------------------------------------

function setAuthMode(mode) {
  state.authMode = mode;
  const signup = mode === "signup";
  el.authTitle.textContent = signup ? "Opret konto" : "Log ind";
  el.authSubmit.textContent = signup ? "Opret konto" : "Log ind";
  el.fieldName.hidden = !signup;
  el.fieldName.querySelector("input").required = signup;
  el.formAuth.password.autocomplete = signup ? "new-password" : "current-password";
  el.switchToSignup.hidden = signup;
  el.switchToLogin.hidden = !signup;
  el.authError.hidden = true;
}

document.querySelectorAll("[data-mode]").forEach((b) =>
  b.addEventListener("click", () => setAuthMode(b.dataset.mode))
);

el.formAuth.addEventListener("submit", async (e) => {
  e.preventDefault();
  el.authError.hidden = true;
  const fd = new FormData(el.formAuth);
  const email = fd.get("email").trim();
  const password = fd.get("password");
  const fullName = (fd.get("fullName") || "").trim();
  el.authSubmit.disabled = true;
  try {
    if (state.authMode === "signup") {
      if (!fullName) throw new Error("Udfyld dit navn.");
      const res = await signUp({ email, password, fullName });
      if (!res.session) {
        el.authError.textContent =
          "Konto oprettet. Bekræft din e-mail via linket i mailen, og log derefter ind.";
        el.authError.hidden = false;
        setAuthMode("login");
        return;
      }
    } else {
      await signIn({ email, password });
    }
  } catch (err) {
    el.authError.textContent = humanError(err);
    el.authError.hidden = false;
  } finally {
    el.authSubmit.disabled = false;
  }
});

el.btnLogout.addEventListener("click", async () => {
  await signOut();
});

// ---------- Registreringer ------------------------------------------

function renderCompetences(rows) {
  el.countBadge.textContent = rows.length;
  if (!rows.length) {
    el.competenceList.innerHTML = `<p class="muted">Ingen registreringer endnu.</p>`;
    return;
  }
  el.competenceList.innerHTML = rows.map((r) => `
    <article class="item" data-id="${r.id}">
      <div class="item-top">
        <span class="item-type">${escapeHtml(r.activity_type)}</span>
        <span class="item-meta">${fmtDate(r.activity_date)} · ${formatDuration(r)}</span>
      </div>
      <div class="item-title">${escapeHtml(r.title)}</div>
      <div class="item-actions">
        <button class="btn btn-danger" data-delete="${r.id}">Slet</button>
      </div>
    </article>`).join("");
}

function formatDuration(r) {
  const v = Number(r.duration_value);
  const val = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
  return `${val} ${r.duration_unit}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

async function refreshCompetences() {
  try {
    const rows = await listMyCompetences();
    renderCompetences(rows);
  } catch (err) {
    el.competenceList.innerHTML = `<p class="error">Kunne ikke hente registreringer: ${escapeHtml(humanError(err))}</p>`;
  }
}

el.competenceList.addEventListener("click", async (e) => {
  const id = e.target.dataset.delete;
  if (!id) return;
  if (!confirm("Slet denne registrering?")) return;
  try {
    await deleteCompetence(id);
    await refreshCompetences();
  } catch (err) {
    alert("Kunne ikke slette: " + humanError(err));
  }
});

el.formCompetence.addEventListener("submit", async (e) => {
  e.preventDefault();
  el.competenceError.hidden = true;
  const fd = new FormData(el.formCompetence);
  const entry = {
    activity_date: fd.get("activity_date"),
    duration_value: Number(fd.get("duration_value")),
    duration_unit: fd.get("duration_unit"),
    activity_type: fd.get("activity_type"),
    title: fd.get("title").trim(),
  };
  if (!entry.activity_date || !entry.title || Number.isNaN(entry.duration_value)) {
    el.competenceError.textContent = "Udfyld dato, varighed og titel.";
    el.competenceError.hidden = false;
    return;
  }
  const btn = el.formCompetence.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    await addCompetence(entry);
    el.formCompetence.reset();
    setToday();
    await refreshCompetences();
  } catch (err) {
    el.competenceError.textContent = "Kunne ikke gemme: " + humanError(err);
    el.competenceError.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

function setToday() {
  el.formCompetence.activity_date.value = new Date().toISOString().slice(0, 10);
}

// ---------- Admin: 7 klik på app-ikonet ---------------------------

let clickCount = 0;
let clickTimer = null;
el.appIcon.addEventListener("click", () => {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => (clickCount = 0), 2000);
  if (clickCount >= 7) {
    clickCount = 0;
    openAdminUnlock();
  }
});

function openAdminUnlock() {
  el.adminUnlockError.hidden = true;
  el.formAdminUnlock.password.value = "";
  el.adminDialog.showModal();
}

el.formAdminUnlock.addEventListener("submit", (e) => {
  if (e.submitter && e.submitter.value === "cancel") return; // luk uden validering
  if (el.formAdminUnlock.password.value !== ADMIN_UNLOCK_PASSWORD) {
    e.preventDefault(); // hold dialogen åben
    el.adminUnlockError.hidden = false;
    return;
  }
  queueMicrotask(enterAdmin); // korrekt password — dialogen lukker selv
});

async function enterAdmin() {
  if (!state.profile?.is_admin) {
    alert(
      "Din bruger har ikke admin-rettigheder i databasen.\n\n" +
      "En eksisterende admin (eller en DB-administrator) skal sætte is_admin = true på din profil."
    );
    return;
  }
  showView("admin");
  state.adminSelectedUser = null;
  el.adminExport.hidden = true;
  el.adminDetailTitle.textContent = "Vælg en bruger";
  el.adminDetail.innerHTML = `<p class="muted">—</p>`;
  el.adminUsers.innerHTML = `<p class="muted">Indlæser…</p>`;
  try {
    const users = await adminListUsers();
    el.adminUsers.innerHTML = users.map((u) => `
      <button class="user-row" data-user="${u.id}">
        <span>${escapeHtml(u.full_name || "(uden navn)")}</span>
        ${u.is_admin ? `<span class="tag">ADMIN</span>` : ""}
      </button>`).join("") || `<p class="muted">Ingen brugere.</p>`;
  } catch (err) {
    el.adminUsers.innerHTML = `<p class="error">${escapeHtml(humanError(err))}</p>`;
  }
}

el.adminUsers.addEventListener("click", async (e) => {
  const row = e.target.closest("[data-user]");
  if (!row) return;
  const userId = row.dataset.user;
  el.adminUsers.querySelectorAll(".user-row").forEach((r) => r.classList.toggle("active", r === row));
  const name = row.querySelector("span").textContent;
  state.adminSelectedUser = { id: userId, name };
  el.adminDetailTitle.textContent = name;
  el.adminDetail.innerHTML = `<p class="muted">Indlæser…</p>`;
  el.adminExport.hidden = true;
  try {
    const rows = await adminListCompetences(userId);
    state.adminSelectedRows = rows;
    if (!rows.length) {
      el.adminDetail.innerHTML = `<p class="muted">Ingen registreringer.</p>`;
      return;
    }
    el.adminExport.hidden = false;
    el.adminDetail.innerHTML = rows.map((r) => `
      <article class="item">
        <div class="item-top">
          <span class="item-type">${escapeHtml(r.activity_type)}</span>
          <span class="item-meta">${fmtDate(r.activity_date)} · ${formatDuration(r)}</span>
        </div>
        <div class="item-title">${escapeHtml(r.title)}</div>
      </article>`).join("");
  } catch (err) {
    el.adminDetail.innerHTML = `<p class="error">${escapeHtml(humanError(err))}</p>`;
  }
});

el.adminExport.addEventListener("click", () => {
  const rows = state.adminSelectedRows || [];
  const user = state.adminSelectedUser;
  if (!rows.length || !user) return;
  const header = ["Navn", "Dato", "Varighed", "Enhed", "Aktivitetstype", "Titel", "Oprettet"];
  const csvRows = rows.map((r) => [
    user.name, r.activity_date, r.duration_value, r.duration_unit,
    r.activity_type, r.title, r.created_at,
  ]);
  const csv = [header, ...csvRows]
    .map((cols) => cols.map(csvCell).join(";"))
    .join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kompetencer_${slug(user.name)}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function csvCell(v) {
  const s = String(v ?? "");
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "bruger";
}

el.adminBack.addEventListener("click", () => showView("main"));

// ---------- Sessionsstyring ---------------------------------------

async function enterApp(session) {
  try {
    state.profile = await getMyProfile();
  } catch {
    state.profile = null;
  }
  const name = state.profile?.full_name || session.user.email;
  el.who.textContent = name;
  el.who.title = `${name} · ${session.user.email}`;
  showView("main");
  setToday();
  await refreshCompetences();
}

function leaveApp() {
  state.profile = null;
  state.adminSelectedUser = null;
  state.adminSelectedRows = [];
  setAuthMode("login");
  el.formAuth.reset();
  showView("auth");
}

async function boot() {
  el.app.hidden = false;
  setAuthMode("login");

  if (!isConfigured) {
    showView("auth");
    el.authError.textContent =
      "Supabase er ikke konfigureret endnu. Udfyld js/config.js med projektets URL og anon-nøgle.";
    el.authError.hidden = false;
    el.formAuth.querySelectorAll("input, button").forEach((n) => (n.disabled = true));
    return;
  }

  const session = await getSession();
  if (session) await enterApp(session);
  else showView("auth");

  onAuthChange(async (s) => {
    if (s) await enterApp(s);
    else leaveApp();
  });
}

boot();
