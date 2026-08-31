# Kompetenceudviklingsapp

Registrering af kompetenceudvikling for sekretariatet og medarbejderne på
Civil and Architectural Engineering (CAE), Aarhus Universitet.

Ren statisk HTML/CSS/JS uden build-trin. Appen kan køre på to backends, som vælges
med `BACKEND` i `js/config.js`:

| `BACKEND` | Hvad det gør | Til hvad |
|---|---|---|
| `"local"` | Alt gemmes i browserens `localStorage`. Ingen server, ingen opsætning. | **Demo og udvikling** (nuværende standard) |
| `"supabase"` | [Supabase](https://supabase.com) (Postgres + auth) i EU-region med Row Level Security. | Drift |

Resten af koden importerer kun fra `js/data.js`, som vælger implementeringen —
`js/local-store.js` eller `js/supabase.js`. De to har samme API.

## Kør demoen

Ingen opsætning nødvendig ud over en lokal webserver (ES-moduler virker ikke fra `file://`):

```powershell
cd C:\claude\kompetenceudvikling\kompudv
python -m http.server 5173
```

Åbn <http://localhost:5173>, klik **Opret konto**, og gå i gang.
**Den første bruger du opretter bliver automatisk admin**, så admin-området kan afprøves
med det samme (7 klik på app-ikonet + `Superadmin`).

Ryd demo-data igen ved at skrive `kompudvDemoReset()` i browserens konsol.

> ⚠️ Demo-tilstanden gemmer data ukrypteret i browseren og deler dem ikke mellem
> enheder eller brugere. Brug den ikke med rigtige personoplysninger.

## Funktioner

- E-mail/password-login (opret konto + log ind).
- Registrering af kompetence: dato, varighed (timer/dage), aktivitetstype
  (Kursus m/ bevis · Kursus · Praktik · Andet), titel i flere linjer.
- Brugeren ser altid sine egne registreringer på listeform og kan slette dem.
- Admin-område: 7 klik på app-ikonet + password (`Superadmin`). Kræver desuden
  at brugeren har `is_admin = true` i databasen. Her kan man se alle brugeres
  data og eksportere en brugers kompetencer som CSV (semikolon-separeret, UTF-8
  med BOM — åbner direkte i dansk Excel).

## Skift til Supabase

> 📘 Detaljeret trin-for-trin med skærmnavne, fejlfinding og sikkerhedstest:
> **[docs/SUPABASE-OPSAETNING.md](docs/SUPABASE-OPSAETNING.md)**
> (samme vejledning som HTML: `docs/supabase-opsaetning.html`)

### 1. Opret Supabase-projekt

1. Log ind på supabase.com → **New project**. Vælg en **EU-region**
   (f.eks. `eu-central-1` (Frankfurt) eller `eu-west-2` (London)).
2. Åbn **SQL Editor**, indsæt hele `supabase-schema.sql` og kør den.
3. **Project Settings → API**: kopiér *Project URL* og *anon public*-nøglen.

### 2. Konfigurér frontend

Redigér `js/config.js`:

```js
export const BACKEND = "supabase";
export const SUPABASE_URL = "https://ditprojekt.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGci...";   // anon public — må gerne være offentlig
```

anon-nøglen er beregnet til at ligge i frontend-kode; det er Row Level Security
i `supabase-schema.sql` der beskytter data.

### 3. Kør lokalt

ES-moduler kræver en webserver (ikke `file://`):

```powershell
python -m http.server 5173
# → http://localhost:5173
```

eller "Live Server"-udvidelsen i VS Code.

### 4. Gør dig selv til admin

Opret først din bruger i appen. Kør derefter i SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'din.mail@au.dk');
```

### 5. Hosting

GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.
Siden bliver tilgængelig på `https://jxrgen.github.io/kompudv/`.

## GDPR — status og åbne punkter

App'en behandler personoplysninger om medarbejdere (navn, e-mail, aktiviteter).
Følgende skal på plads inden reel drift:

- **Databehandleraftale** mellem Aarhus Universitet og Supabase.
- Bekræft at data (inkl. backups) forbliver i **EU**.
- **Formål, retsgrundlag og opbevaringsperiode** beskrevet for de registrerede.
- Admin-oplåsningen (`Superadmin` + 7 klik) er kun obfuskering — den reelle
  adgangskontrol er `is_admin` + RLS. Overvej at flytte admin-rollen helt væk
  fra et delt password.
- Password-krav: minimum 8 tegn (Supabase-standard). Kan strammes.

## Filoversigt

| Fil | Indhold |
|-----|---------|
| `index.html` | App-skal med login-, app- og admin-visning |
| `css/styles.css` | Design, responsivt, light/dark |
| `js/config.js` | Valg af backend, Supabase-URL, anon-nøgle, admin-password |
| `js/data.js` | Vælger backend — alt andet importerer herfra |
| `js/local-store.js` | Demo-backend på `localStorage` |
| `js/supabase.js` | Supabase-klient + dataadgang (samme API) |
| `js/app.js` | View-styring, auth, registreringer, admin, CSV-eksport |
| `supabase-schema.sql` | Tabeller, RLS-politikker, triggers |
| `docs/SUPABASE-OPSAETNING.md` | Opsætningsvejledning (Markdown) |
| `docs/supabase-opsaetning.html` | Samme vejledning som HTML-dokument |
