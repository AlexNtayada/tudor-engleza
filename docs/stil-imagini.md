# Stilul imaginilor Tudoo! („desen simplu de poveste”)

Stilul ales de părinte pe 26 nov 2026, pentru harta Castelului. Se folosește pentru **toate** imaginile noi din aplicație: hărți, fundaluri de luptă, castele, boși, abțibilduri.

Referință vizuală: `src/tower/painted-island.webp` (insula, fără castele), `src/tower/map-castle/*.webp` (castelele) și harta veche din Figma (fișier `2kft1INQWgNe7aXRll44Aq`, nodul `4:7`).

## Pe scurt

- Desen de carte de povești pentru copii de 5 ani, nu realist.
- Contur subțire, închis la culoare (maro-negru), în jurul fiecărei forme.
- Culori blânde, luminoase, puțin pastel. Umbre foarte simple, fără texturi fine.
- Puține detalii: forme rotunde și mari, multe zone liniștite și plate. Fiecare loc are 2–4 obiecte clare, nu zeci.
- Obiectele (castele, case, copaci) sunt mici și „drăguțe”, așezate pe pământ ca parte din desen, cu umbră proprie. Nimic nu plutește.
- Fără text, litere sau cifre în imagine. Textul îl pune aplicația.

## Paleta (din harta aprobată)

| Rol | Culoare |
|---|---|
| Mare adâncă | `#2287c5`, `#217fb1`, `#22719a` |
| Apă mică / lagună | `#64c4cf`, `#45a1b4` |
| Iarbă / pădure | `#5d8664`, `#94a47d`, `#aac6a5` |
| Nisip / drum | `#eacba9`, `#e8decb`, `#e2b09d` |
| Zăpadă / nori | `#eef1f4` |
| Lună / mov | `#715971`, `#aa8597` |
| Contur | maro-negru închis, aproape `#2b2118` |

Drumul este nisip deschis (`#e8decb`) cu un contur subțire, un singur traseu fără scurtături.

## Rețeta pentru generare (Figma AI, model `gpt-image-2.5-sunburst`)

Lipește blocul de stil la finalul oricărui prompt:

> Simple hand-drawn children's storybook illustration: thin dark ink outlines, soft gentle colours, simple rounded shapes, LOW detail, lots of calm flat areas, cute and clean, not busy. Objects are small, cute and sit on the ground as part of the drawing. Absolutely no text, no letters, no numbers.

Mărimi: `1536x864` pentru imagini late (hărți desktop, fundaluri de luptă), `864x1536` pentru verticale (Hartă pe telefon), `1024x1024` pentru obiecte (castele, boși, abțibilduri).

- Obiecte decupate (castel, boss, abțibild): cere fundal uniform magenta `#ff00ff` („on a flat plain magenta background”) și decupează cu scriptul de cheie de culoare.
- Hărți: cere marea în jurul insulei. Decupează apoi marea exterioară (umplere din margini), ca insula să se îmbine cu marea paginii.
- Descarcă la rezoluție maximă cu `get_screenshot` (`maxDimension: 2048`). Salvează ca WebP, calitate ~90, la 2K (2048 px pe latura lungă).

## Ce evităm

- Stilul „desenat detaliat” (contururi groase, multe pietricele, texturi), folosit înainte de 26 nov.
- Aspect realist, 3D sau fotografic.
- Să pictăm toată harta din nou pentru o schimbare mică. Harta se face din bucăți: insula separat, fiecare castel separat (desenat în același stil, pus pe pământ cu umbră), iar drumul pe niveluri e desenat în aplicație cu contur subțire maro și nisip în interior, auriu cât ai parcurs.
- Să schimbăm stilul „puțin” când refacem ceva: aceeași rețetă, aceleași culori.
