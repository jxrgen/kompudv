# Fremskridt — kompudv

> Denne fil opdateres, hver gang jho skriver **farvel** i prompten, og læses ved sessionsstart, så udviklingen kan genoptages.

## Status pr. 2026-08-31

**Fase:** Opstart — grundlag lagt. Selve appen er endnu ikke påbegyndt.

### Gjort
- GitHub CLI logget ind som `jxrgen` (scopes: gist, read:org, repo).
- Repo `jxrgen/kompudv` klonet til `C:\claude\kompetenceudvikling\kompudv`.
- `index.html` oprettet: en glad "Hej verden!"-side (animeret 👋, gradient-baggrund, responsivt, dansk, light/dark). Root-commit `4b9945a`, pushet til `main`.
- `PROGRESS.md` oprettet og pushet (`d6d2d6a`).
- Automatik i `C:\claude\kompetenceudvikling\.claude\settings.json`:
  - `UserPromptSubmit`-hook: reagerer på ordet "farvel" og minder om at opdatere + pushe denne fil.
  - `SessionStart`-hook: viser denne fil ved start.
  - NB: `.claude`-mappen er ny, så hookene er først aktive efter jho har åbnet `/hooks` én gang eller genstartet Claude Code. Konventionen er også gemt i Claudes hukommelse som backup.
- Denne session: mest forklaring af hooks (koncept, `/hooks`-listen, hvordan man opretter/ændrer). Ingen kodeændringer i appen.

### I gang
- Intet aktivt.

### Næste skridt
- Beskriv appens formål og indhold (mangler helt i repoet).
- Vælg teknologi til hjemmesiden (ren statisk HTML/CSS/JS eller framework?).
- Vælg hosting (GitHub Pages?).
- Udbyg `index.html` fra hello world til den egentlige forside.

### Åbne beslutninger
- Appens formål/indhold ikke defineret.
- Sprog: dansk (antaget).

### Hvor tingene ligger
- Arbejdsmappe: `C:\claude\kompetenceudvikling`
- Repo: `C:\claude\kompetenceudvikling\kompudv` (remote: `https://github.com/jxrgen/kompudv.git`, branch `main`)
- Config/hooks: `C:\claude\kompetenceudvikling\.claude\settings.json`
