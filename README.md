# Tudoo!

O aplicație jucăușă pentru ca Tudor (5 ani) să învețe engleză, cu un prieten pe care și-l alege singur (Ninja, Pip, Bobo, Rici, Bip sau Zuzu).
Merge în browser pe calculator și se poate instala pe telefon (PWA).

## Ce are prototipul

- Harta ilustrată cu 13 teme (câte un biom desenat: drum cu pietre, râu cu pod, stâncă, copaci), câte 5 lecții, ultima fiind un boss
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

## Voci (ElevenLabs)

Tot ce spune aplicația e înregistrat o dată cu ElevenLabs în `public/audio/` (cuvintele englezești cu o voce
americană, iar fiecare prieten are vocea lui în română). Ce nu are clip e citit în continuare de vocea browserului.

- Lista replicilor: `scripts/voices/lines.ts` (când adaugi o replică nouă în aplicație, adaug-o și aici)
- Vocile alese: `scripts/voices/voices.json`
- Generare: GitHub → Actions → **Voci ElevenLabs** → Run workflow (are nevoie de secretul `ELEVENLABS_API_KEY`).
  `numara` arată câte caractere/credite ar costa, `mostre` face câteva clipuri de probă, `tot` face restul.
  Se înregistrează doar replicile noi, deci rularea din nou e ieftină.

## Homepage (tudoo.ro)

Pagina de prezentare e în `site/` (HTML simplu + `site/main.tsx`, care desenează prietenii și logo-ul din aplicație).
Aplicația se publică la `/app/`, iar homepage-ul la rădăcină.

```bash
npm run dev:site   # homepage, http://localhost:5174
```

## Publicare

La fiecare push pe `main`, GitHub Actions construiește aplicația (`dist/app/`) și homepage-ul (`dist/`) și le publică
pe GitHub Pages (Settings → Pages → Source: GitHub Actions). Domeniul `tudoo.ro` se setează în Settings → Pages → Custom domain.

Notă: termenii GitHub Pages nu permit folosirea pentru o afacere comercială, așa că înainte de a cere bani
mutăm găzduirea (de ex. Cloudflare Pages sau Netlify); build-ul rămâne același, doar `dist/` se publică în altă parte.
