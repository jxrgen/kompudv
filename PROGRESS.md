# Fremskridt — kompudv

> Denne fil opdateres, hver gang jho skriver **farvel** i prompten, og læses ved sessionsstart, så udviklingen kan genoptages.

## Status pr. 2026-08-31

**Fase:** Opstart — grundlag lagt.

### Gjort
- GitHub CLI logget ind som `jxrgen` (scopes: gist, read:org, repo).
- Repo `jxrgen/kompudv` klonet til `C:\claude\kompetenceudvikling\kompudv`.
- `index.html` oprettet: en glad "Hej verden!"-side (animeret 👋, gradient-baggrund, responsivt, dansk, light/dark). Committet som root-commit `4b9945a` og pushet til `main`.
- Automatik sat op i `C:\claude\kompetenceudvikling\.claude\settings.json`:
  - `UserPromptSubmit`-hook: reagerer på ordet "farvel" og minder om at opdatere + pushe denne fil.
  - `SessionStart`-hook: viser denne fil ved start.

### I gang
- Intet aktivt lige nu.

### Næste skridt
- Beslut teknologivalg for appens hjemmeside (ren statisk HTML/CSS/JS, eller et framework?).
- Beslut hostingform (GitHub Pages?).
- Udbyg `index.html` fra hello world til den egentlige forside for kompetenceudviklings-appen.

### Åbne beslutninger
- Appens formål/indhold er endnu ikke beskrevet i repoet.
- Sprog: dansk (antaget ud fra hidtidig dialog).

### Hvor tingene ligger
- Arbejdsmappe: `C:\claude\kompetenceudvikling`
- Repo: `C:\claude\kompetenceudvikling\kompudv` (remote: `https://github.com/jxrgen/kompudv.git`, branch `main`)
- Config/hooks: `C:\claude\kompetenceudvikling\.claude\settings.json`
