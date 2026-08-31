# Supabase-opsætning — kompetenceudviklingsappen

Komplet vejledning fra tom Supabase-konto til kørende app med admin-adgang.

**Tid:** ca. 15–20 minutter. Alt kan gøres på gratis-planen.
**Du skal bruge:** en browser, en GitHub-konto (nemmeste login til Supabase), og filerne i `kompudv`.

> Supabase justerer deres dashboard-UI løbende. Menupunkterne herunder passer pr. august 2026 —
> hvis en knap hedder noget lidt andet, ligger den næsten altid samme sted.

---

## Trin 1 — Opret konto og projekt

1. Gå til <https://supabase.com> → **Sign in** → log ind med GitHub.
2. Klik **New project**.
3. Udfyld:
   - **Organization** — vælg din egen, eller opret en (fx `CAE`).
   - **Project name** — `kompudv`
   - **Database Password** — klik *Generate a password* og **gem den i en password-manager**.
     Du får den ikke at se igen. (Appen bruger den ikke — kun direkte databaseadgang gør.)
   - **Region** — ⚠️ **vælg en EU-region**, fx `Central EU (Frankfurt)`.
     Dette er GDPR-kritisk og **kan ikke ændres bagefter** uden at oprette et nyt projekt.
   - **Pricing plan** — Free.
4. **Create new project**. Der går 1–2 minutter, mens databasen provisioneres.

---

## Trin 2 — Kør databaseskemaet

1. Venstre menu → **SQL Editor**.
2. **New query**.
3. Åbn `kompudv/supabase-schema.sql`, kopiér **hele** indholdet, indsæt i editoren.
4. Klik **Run** (eller `Ctrl+Enter`).
5. Forventet svar: `Success. No rows returned`.

Hvad blev oprettet:

| Objekt | Formål |
|---|---|
| Tabel `profiles` | Navn + `is_admin`-flag pr. bruger |
| Tabel `competences` | Selve kompetenceregistreringerne |
| Funktion `is_admin()` | Bruges af sikkerhedsreglerne |
| Trigger `on_auth_user_created` | Opretter automatisk en profil, når en bruger oprettes |
| Row Level Security | Sikrer at en bruger kun ser sine egne data, og at en admin ser alles |

**Kontrollér:** Venstre menu → **Table Editor**. Du skal se `profiles` og `competences` (begge tomme).

---

## Trin 3 — Hent URL og nøgle

1. Tandhjulet **Project Settings** (nederst i venstre menu) → **API**.
2. Kopiér **Project URL** — formen er `https://abcdefghijkl.supabase.co`
3. Kopiér den offentlige nøgle:
   - Nyere projekter: **Publishable key** (`sb_publishable_…`)
   - Ældre projekter: **anon** / **public** (lang `eyJhbGci…`-streng)
   - Begge virker med appen.
   - ❌ **Tag ikke** `service_role` / `secret key` — den omgår al sikkerhed og må **aldrig** i frontend-kode.

---

## Trin 4 — Sæt nøglerne ind i appen

Åbn `kompudv/js/config.js` og erstat placeholder-værdierne:

```js
export const SUPABASE_URL = "https://abcdefghijkl.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_xxxxxxxxxxxx";
export const ADMIN_UNLOCK_PASSWORD = "Superadmin";
```

Filen må gerne committes. Den offentlige nøgle er **designet** til at ligge i frontend-kode —
beskyttelsen ligger i Row Level Security, ikke i at nøglen er hemmelig.

---

## Trin 5 — Auth-indstillinger

**Authentication** → **Sign In / Providers** → **Email**.

### E-mailbekræftelse

- **Til test:** sæt **Confirm email** til **off** og gem. Så kan du oprette en bruger og logge
  ind med det samme.
  *Hvorfor:* Supabases indbyggede mailserver er kraftigt rate-limited (få mails i timen) og
  mails ender ofte i spam. Det gør test unødigt langsomt.
- **Til drift:** Confirm email **on**, og kobl en rigtig SMTP-server på under
  **Project Settings → Authentication → SMTP Settings** — fx AU's mailserver.

### URL-konfiguration

**Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:5173` mens du udvikler
- **Redirect URLs:** tilføj både
  `http://localhost:5173/**` og senere `https://jxrgen.github.io/kompudv/**`

Bruges til bekræftelses- og password-nulstillingslinks.

---

## Trin 6 — Start appen lokalt

ES-moduler virker ikke fra `file://`, så der skal en webserver til:

```powershell
cd C:\claude\kompetenceudvikling\kompudv
python -m http.server 5173
```

Åbn <http://localhost:5173>

Åbner `python` i stedet Microsoft Store? Installér Python derfra, eller brug VS Code-udvidelsen
**Live Server** (højreklik `index.html` → *Open with Live Server*). Live Server bruger typisk
port **5500** — brug så den i Site URL i stedet.

---

## Trin 7 — Opret din bruger og gør dig til admin

1. I appen: **Opret konto** → navn, AU-mail, password (mindst 8 tegn).
2. Log ind. Test at du kan gemme en registrering og se den på listen.
3. Gør dig til admin — **SQL Editor** → New query:

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'jho@cae.au.dk');
   ```

   Forventet: `Success. 1 row(s) affected`. Står der `0 rows`, er mailen stavet forkert —
   tjek den under **Authentication → Users**.

4. Tilbage i appen: **genindlæs siden** (admin-status hentes ved login), klik **7 gange på det
   blå app-ikon** øverst til venstre, skriv `Superadmin`, klik **Lås op**.
5. Vælg en bruger i listen → **Eksportér CSV**.

---

## Trin 8 — Kontrollér at sikkerheden virker

Kør denne test, **før** der kommer rigtige data i systemet:

1. Opret **bruger nr. 2** (fx `din.mail+test@au.dk` — plus-adressering virker).
2. Log ind som bruger 2 og opret en registrering.
3. ✅ Bruger 2 må **kun** se sin egen registrering.
4. ✅ Bruger 2 må **ikke** kunne komme ind i admin — 7 klik + `Superadmin` skal give beskeden
   om manglende rettigheder.

Opfører det sig sådan, er Row Level Security aktiv, og det delte admin-password er ikke i sig
selv nok til at nå andres data.

---

## Fejlfinding

| Symptom | Årsag / løsning |
|---|---|
| "Supabase er ikke konfigureret endnu" | `js/config.js` har stadig placeholders — eller browseren har cachet den gamle fil. Hard-reload med `Ctrl+F5`. |
| Blank side + konsolfejl om `import` | Siden er åbnet som `file://`. Brug en webserver (Trin 6). |
| `Invalid API key` | Forkert nøgle, eller URL og nøgle stammer fra to forskellige projekter. |
| "E-mailen er ikke bekræftet endnu" | Confirm email er slået til. Slå den fra (Trin 5), eller klik linket i mailen. |
| Bruger oprettet, men ingen profil-række | Trigger'en kørte ikke. Kør `supabase-schema.sql` igen og opret brugeren på ny. |
| "Din bruger har ikke admin-rettigheder" | `is_admin` ikke sat, eller siden ikke genindlæst efter SQL-opdateringen. |
| Alt virkede, nu er projektet "Paused" | Gratis-projekter pauses efter ca. 7 dages inaktivitet. Genstart fra dashboardet. |

---

## GDPR — hvad der mangler før rigtig brug

Appen behandler personoplysninger om medarbejdere (navn, e-mail, aktiviteter). Før den tages i
brug med rigtige data:

- **Databehandleraftale** mellem Aarhus Universitet og Supabase (Supabase har en standard-DPA).
- Skriftlig bekræftelse på at **data og backups forbliver i EU**.
- **Formål, retsgrundlag og opbevaringsperiode** beskrevet over for medarbejderne.
- Erstat det delte admin-password med egentlige roller.
- Involvér AU IT / jura inden produktionssætning.
