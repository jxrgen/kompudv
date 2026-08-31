# Fremskridt — kompudv

> Denne fil opdateres, hver gang jho skriver **farvel** i prompten, og læses ved sessionsstart, så udviklingen kan genoptages.

## Status pr. 2026-08-31

**Fase:** App'en er bygget og kører i **demo-tilstand uden server**. Supabase-laget er
skrevet færdigt og ligger klar, men er midlertidigt sat på pause efter aftale.

### Trufne beslutninger
- **CAE = Civil and Architectural Engineering**, Aarhus Universitet. (Var først gættet
  forkert i `index.html` — rettet.)
- **To backends bag samme API**, valgt med `BACKEND` i `js/config.js`:
  - `"local"` — `localStorage`, ingen server. **Nuværende standard, til demo.**
  - `"supabase"` — Postgres + auth i EU-region med Row Level Security. Klar, men slået fra.
- **Login:** e-mail + password (ikke "navn + simpelt password" som i første udkast).
- **Frontend:** ren statisk HTML/CSS/JS, ingen build, ES-moduler.
- **Admin-eksport:** CSV (semikolon, UTF-8 m/ BOM → dansk Excel).

### Gjort
- `index.html` — app-skal med tre visninger: login, app, admin. Demo-markering vises
  automatisk, når `BACKEND = "local"`.
- `css/styles.css` — enkelt responsivt design, light/dark, desktop-først.
- `js/data.js` — backend-vælger. Alt andet importerer herfra.
- `js/local-store.js` — demo-backend på `localStorage`. Første oprettede bruger bliver
  automatisk admin. Password hashes med SHA-256. `kompudvDemoReset()` i konsollen rydder alt.
- `js/supabase.js` — Supabase-klient + samme API.
- `js/app.js` — view-styring, auth-flow, opret/list/slet kompetence, 7-klik på app-ikon →
  password-dialog → admin, CSV-eksport.
- `supabase-schema.sql` — tabeller, RLS, `is_admin()`, signup-trigger.
- `docs/SUPABASE-OPSAETNING.md` + `docs/supabase-opsaetning.html` — komplet
  opsætningsvejledning i 8 trin. HTML-udgaven har indholdsfortegnelse med scrollspy,
  afkrydsning der huskes, kopiér-knap på kodeblokke, tema-skifter og printopsætning.
- `README.md` — begge backends, demo-vejledning, filoversigt.
- Kravdækning: introtekst "Velkommen til din Kompetenceudviklingsapp", input (dato,
  varighed timer/dage, aktivitetstype-dropdown med de 4 typer, titel i flere linjer),
  egen liste, admin via 7 klik + "Superadmin".

### I gang
- **Demoen er aldrig kørt i en browser.** Alle filer serveres korrekt (HTTP 200), og
  koden er gennemgået statisk, men runtime-fejl kan stadig dukke op.

### Næste skridt
1. Kør demoen: `python -m http.server 5173` i `kompudv`, åbn <http://localhost:5173>,
   opret en bruger, test registrering + admin + CSV. Meld fejl fra konsollen.
2. Justér funktionalitet og design ud fra hvad demoen viser.
3. Når retningen er sat: skift `BACKEND` til `"supabase"` og følg
   `docs/SUPABASE-OPSAETNING.md`.
4. Evt. GitHub Pages (virker fint med demo-backend).

### Åbne beslutninger / spørgsmål til jho
- **Aktivitetstyper:** brugt de 4 nævnte (Kursus m/ bevis, Kursus, Praktik, Andet).
  "..." i kravene antyder flere — hvilke?
- **Varighed:** valgt tal + enhed (timer/dage). OK?
- **Admin-setting-området:** indhold ikke defineret endnu.
- **Redigering:** man kan pt. kun oprette og slette, ikke rette en registrering.
- **GDPR før drift:** databehandleraftale AU–Supabase, EU-dataplacering bekræftet,
  formål/retsgrundlag/opbevaringsperiode, admin-adgang væk fra delt password.
  Demo-tilstanden må ikke bruges med rigtige personoplysninger.

### Hvor tingene ligger
- Arbejdsmappe: `C:\claude\kompetenceudvikling`
- Repo: `C:\claude\kompetenceudvikling\kompudv` (remote: `https://github.com/jxrgen/kompudv.git`, branch `main`)
- Config/hooks: `C:\claude\kompetenceudvikling\.claude\settings.json`
- App-filer: `index.html`, `css/`, `js/`, `supabase-schema.sql`, `docs/`, `README.md`
