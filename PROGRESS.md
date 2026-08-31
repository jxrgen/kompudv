# Fremskridt — kompudv

> Denne fil opdateres, hver gang jho skriver **farvel** i prompten, og læses ved sessionsstart, så udviklingen kan genoptages.

## Status pr. 2026-08-31

**Fase:** Første version af app'en er bygget (frontend + DB-skema). Mangler at blive
koblet til et rigtigt Supabase-projekt og testet i browser.

### Trufne beslutninger (denne session)
- **Backend:** Supabase (EU-region) for at komme i gang — kan migreres senere. jho er
  opmærksom på GDPR og vil skifte løsning på sigt.
- **Login:** e-mail + password (ikke "navn + simpelt password" som i første udkast).
- **Frontend:** ren statisk HTML/CSS/JS, ingen build, ES-moduler. Supabase-klient via
  jsDelivr-CDN.
- **Admin-eksport:** CSV (semikolon, UTF-8 m/ BOM → dansk Excel).

### Gjort
- `index.html` skrevet om fra "Hej verden" til app-skal med tre visninger:
  login, app, admin.
- `css/styles.css`: enkelt responsivt design, light/dark, desktop-først med
  mobiltilpasning.
- `js/config.js`: placeholders for `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `ADMIN_UNLOCK_PASSWORD = "Superadmin"`.
- `js/supabase.js`: klient-init + hele dataadgangslaget (auth, profil, kompetencer,
  admin-opslag) — samlet ét sted, så backend kan udskiftes.
- `js/app.js`: view-styring, auth-flow, opret/list/slet kompetence, 7-klik på
  app-ikon → password-dialog → admin, admin-visning af alle brugere + CSV-eksport.
- `supabase-schema.sql`: tabeller `profiles` + `competences`, RLS-politikker,
  `is_admin()`-funktion, trigger der opretter profil ved signup.
- `README.md`: opsætning trin for trin + GDPR-tjekliste.
- Funktionalitet fra kravene: introtekst "Velkommen til din Kompetenceudviklingsapp",
  input (dato, varighed timer/dage, aktivitetstype-dropdown med de 4 typer, titel i
  flere linjer), egen liste, admin via 7 klik + "Superadmin".

### I gang
- Intet aktivt.

### Næste skridt
1. jho opretter Supabase-projekt i EU-region, kører `supabase-schema.sql`, og
   udfylder `js/config.js` med URL + anon-nøgle.
2. Test i browser via lokal server (`python -m http.server`) — appen er ikke kørt
   endnu, så regn med små rettelser.
3. Opret testbruger, sæt `is_admin = true` (SQL i README), test admin + CSV.
4. Slå GitHub Pages til (Settings → Pages → main / root).
5. Derefter: setting-området i admin (endnu udefineret), evt. redigér-funktion,
   filtrering/sortering af egen liste.

### Åbne beslutninger / spørgsmål til jho
- **Aktivitetstyper:** brugt de 4 nævnte (Kursus m/ bevis, Kursus, Praktik, Andet).
  "..." i kravene antyder flere — hvilke?
- **Varighed:** valgt tal + enhed (timer/dage). OK?
- **Admin-setting-området:** indhold ikke defineret endnu.
- **E-mailbekræftelse:** Supabase kræver som standard bekræftelse af e-mail ved
  signup. Skal det slås fra (nemmere) eller beholdes (sikrere)?
- **GDPR før drift:** databehandleraftale AU–Supabase, EU-dataplacering bekræftet,
  formål/retsgrundlag/opbevaringsperiode, admin-adgang væk fra delt password.

### Hvor tingene ligger
- Arbejdsmappe: `C:\claude\kompetenceudvikling`
- Repo: `C:\claude\kompetenceudvikling\kompudv` (remote: `https://github.com/jxrgen/kompudv.git`, branch `main`)
- Config/hooks: `C:\claude\kompetenceudvikling\.claude\settings.json`
- App-filer: `index.html`, `css/`, `js/`, `supabase-schema.sql`, `README.md`
