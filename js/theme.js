// Temavælger — fem farvetemaer, gemt i browseren pr. bruger.
// Selve farverne står i css/styles.css under :root[data-app-theme="…"].
// Et lille script i index.html sætter temaet før første maling, så siden ikke blinker.

const KEY = "kompudv-theme";

export const THEMES = [
  { id: "lys", name: "Lys blå" },
  { id: "moerk", name: "Mørk blå" },
  { id: "skov", name: "Grøn" },
  { id: "bordeaux", name: "Bordeaux" },
  { id: "nat", name: "Nat" },
];

function readTheme() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function saveTheme(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* privat vindue — temaet holder så kun til næste genindlæsning */
  }
}

function markCurrent(id) {
  document.querySelectorAll("[data-theme-picker] .swatch").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === id));
  });
}

export function applyTheme(id) {
  document.documentElement.setAttribute("data-app-theme", id);
  markCurrent(id);
}

export function initThemePickers() {
  const buttons = THEMES.map(
    (t) =>
      `<button type="button" class="swatch swatch--${t.id}" data-theme="${t.id}"` +
      ` title="Tema: ${t.name}" aria-label="Tema: ${t.name}" aria-pressed="false"></button>`
  ).join("");

  document.querySelectorAll("[data-theme-picker]").forEach((host) => {
    host.innerHTML = buttons;
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-picker] .swatch");
    if (!btn) return;
    saveTheme(btn.dataset.theme);
    applyTheme(btn.dataset.theme);
  });

  markCurrent(readTheme());
}
