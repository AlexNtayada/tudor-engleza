# Ninja English

O aplicație jucăușă pentru ca Tudor (5 ani) să învețe engleză, cu Ninja, un mic ninja prietenos.
Merge în browser pe calculator și se poate instala pe telefon (PWA).

## Ce are prototipul

- Harta cu lecții (3 teme: culori, animale, numere 1–10, câte 5 lecții)
- Prezentarea cuvintelor cu poză mare și voce (normal și rar 🐢)
- Exerciții: „Ascultă și atinge”, „Sparge balonul” și „Spune tu!” cu microfon 🎤
- Stele, abțibilduri, album, mod „Joacă liberă”
- **Sunete (logopedie pentru R și L)**, în română: gimnastica limbii cu o gură animată și oglindă (camera),
  sunetul lung (motorașul / păsărica merg cât timp se aude sunetul), trenul silabelor, cuvinte cu sunetul la
  început / mijloc / sfârșit și jocul „Urechiușa” (rață sau iață?). Înregistrările rămân pe dispozitiv și
  se ascultă din Zona părinților. Completează, nu înlocuiește, lucrul cu un logoped. Conținutul e în
  `src/logopedie/data.ts`.
- Zona părinților (poartă cu numere): progres, minute pe zi, setări
- Instrucțiuni în română (dacă dispozitivul are voce românească) sau engleză; cuvintele sunt mereu cu voce americană

## Rulare locală

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

## Conținut

Toate cuvintele și lecțiile sunt în `src/content.ts`. Adaugi o temă nouă adăugând un obiect în `UNITS`.

## Publicare

La fiecare push pe `main`, GitHub Actions construiește aplicația și o publică pe GitHub Pages
(Settings → Pages → Source: GitHub Actions).
