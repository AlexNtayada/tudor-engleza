# Regulile de stil Tudoo! („desen simplu de poveste”)

Stilul ales de părinte pe 26 nov 2026 pentru harta Castelului. De acum se folosește pentru **toate** imaginile și elementele noi din aplicație: hărți, fundaluri, castele, nivelurile din Hartă, etichete, carduri. Abțibildurile și boșii rămân deocamdată în stilul vechi, până se cere altfel.

Referință vizuală: harta Castelului pe desktop. Insula e în `src/tower/painted-island.webp`, castelele în `src/tower/map-castle/*.webp`, iar etichetele în clasa `.td-gate-label` din `src/tower/tower.css`.

## 1. Reguli de aur

1. **Desen de carte de povești pentru un copil de 5 ani.** Nu realist, nu 3D, nu fotografic.
2. **Puține detalii.** Forme mari și rotunde, multe zone calme și plate. Fiecare loc are 2–4 obiecte clare, nu zeci de pietricele.
3. **Contur subțire, închis** (maro-negru, aproape `#2b2118`) în jurul fiecărei forme.
4. **Culori blânde, luminoase.** Umbre foarte simple, fără texturi fine sau gradiente puternice.
5. **Nimic nu plutește.** Obiectele stau pe pământ, cu umbra lor, ca parte din desen.
6. **Fără text în imagini.** Literele, cifrele și numele le pune aplicația.
7. **Același stil când refacem ceva.** Folosim aceeași rețetă și aceleași culori, fără variații „puțin diferite”.

## 2. Hărțile se fac din bucăți

- **Fundalul** (insula sau terenul) e o imagine separată, fără castele sau clădiri mari. Are câte un luminiș gol unde vine fiecare nivel.
- **Fiecare castel sau obiect mare e o imagine separată.** Se pune peste fundal, pe luminișul lui. Dacă vrem să schimbăm un castel, îl redesenăm doar pe el.
- **Drumul e pictat în fundal.** E un singur traseu, în ordinea nivelurilor, fără ramificații, bucle sau scurtături. Nu desenăm drum SVG peste pictură.
- **Trecerile dintre tărâmuri sunt variate**, nu la fel peste tot: pod de lemn, de piatră, de frânghie, de gheață, din bastonașe de bomboane, un buștean, pietre în apă, curcubeu.
- **Tărâmurile se leagă între ele** pe o singură bucată de pământ. Nu facem insulițe separate pentru fiecare nivel.
- Când pictura nu iese perfect, reparăm mici bucăți (de exemplu ștergem un pod în plus). Nu repictăm toată harta pentru o schimbare mică.

## 3. Etichetele nivelurilor (pergament)

Numele nivelului e scris pe un pergament mic (`.td-gate-label`), fără bifă și fără lacăt. Starea se vede din culoare.

| Stare | Cum arată |
|---|---|
| Terminat | pergament auriu (`#ffe08a`, contur `#b07d10`) |
| Activ (de jucat acum) | pergament crem, puțin mai mare (×1.15), cu contur auriu strălucitor |
| Încuiat | pergament gri spălăcit (`#e4ddd0`); castelul lui e și el gri, pe jumătate transparent |

Fontul e **Baloo 2**, care are corect ș și ț cu virgulă dedesubt, plus ă, î, â. Nu folosim fonturi fără diacritice românești; Comfortaa, de exemplu, le arată cu sedilă. Textul din cod se scrie mereu cu ș/ț cu virgulă (U+0219/U+021B), nu cu sedilă (ş/ţ).

## 4. Paleta (din harta aprobată)

| Rol | Culoare |
|---|---|
| Mare adâncă | `#2287c5`, `#217fb1`, `#22719a` |
| Apă mică / lagună | `#64c4cf`, `#45a1b4` |
| Iarbă / pădure | `#5d8664`, `#94a47d`, `#aac6a5` |
| Nisip / drum | `#eacba9`, `#e8decb`, `#e2b09d` |
| Zăpadă / nori | `#eef1f4` |
| Lună / mov | `#715971`, `#aa8597` |
| Contur | `#2b2118` |
| Pergament | `#f8ebc8`, contur `#8a6a3e`, text `#5a3c1a` |

## 5. Rețeta pentru generare (Figma AI, model `gpt-image-2.5-sunburst`)

Blocul de stil se lipește la finalul oricărui prompt:

> Simple hand-drawn children's storybook illustration: thin dark ink outlines, soft gentle colours, simple rounded shapes, LOW detail, lots of calm flat areas, cute and clean, not busy. Objects are small, cute and sit on the ground as part of the drawing. Absolutely no text, no letters, no numbers.

- **Mărimi:** `1536x864` pentru imagini late (hartă desktop, fundaluri de luptă), `864x1536` pentru verticale (nivelurile din Hartă pe telefon), iar obiectele câte 3–4 pe rând într-o imagine `1536x864`.
- **Obiecte (castele):** pe fundal uniform magenta `#ff00ff` („on a flat plain magenta background, no ground, no shadows”), câte 3–4 pe rând, cu spații mari între ele. Le decupăm cu cheia de culoare, le tăiem pe coloane și le salvăm la 512 px lățime.
- **Hartă cu drum:** descriem ordinea exactă a tărâmurilor și unde e fiecare (stânga jos, sus...). Cerem „ONE single continuous road ... no branches, no loops, no shortcuts, no dead ends” și „NO castles, one empty round clearing per land”.
- **Decupare:** marea din jurul insulei se decupează prin umplere din margini, ca insula să se îmbine cu marea paginii.
- **Descărcare:** cu `get_screenshot` (`maxDimension: 2048`). Salvăm ca WebP, calitate ~90, la 2K (2048 px pe latura lungă).
- **Verificare:** înainte de a pune ceva live, îi arătăm părintelui o captură.

## 6. Ce evităm

- Stilul „desenat detaliat” (contururi groase, multe pietricele, texturi), folosit înainte de 26 nov.
- Clădiri asemănătoare între tărâmuri. Fiecare castel are altă formă (turnuri rotunde, cupole, plate, iglu...), nu doar turnuri ascuțite.
- Elemente SVG puse „deasupra” unei picturi ca să imite peisajul (drumuri trasate, castele plutitoare).
- Bifă și lacăt pe etichete.
