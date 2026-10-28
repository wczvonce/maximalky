# Maximálky

Mobilná webová aplikácia (PWA) na zápis maximálok: kedy si sa testoval a koľko ti vyšlo. Graf vývoja 1RM, rekordy, rep-maxy, porovnanie cvikov, 16 cvikov s piktogramami a vlastné cviky s 3 až 5 obrázkami techniky.

- Dáta sú v telefóne (IndexedDB), appka funguje aj bez signálu.
- Voliteľne sa zálohujú a synchronizujú do tvojho súkromného GitHub repozitára (`data.json` + `images/`).
- Dizajn: Modernist z Claude Design — `project/Maximálky.dc.html`, konverzácie v `chats/`, pôvodný návod k exportu v `HANDOFF.md`.

## Spustenie na mobile (GitHub Pages)

1. Na GitHube vytvor **verejný** repozitár, napr. `maximalky`, a nahraj doň tento kód (vetva `main`).
2. V repozitári: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Po každom pushi na `main` workflow *Deploy* appku zostaví a zverejní na `https://<meno>.github.io/maximalky/`.
4. Adresu otvor v Chrome na Androide → menu ⋮ → **Inštalovať aplikáciu** (alebo *Pridať na plochu*). Potom sa otvára ako bežná aplikácia, aj offline.

## Záloha a synchronizácia cez GitHub

Kód je verejný, dáta nie — idú do samostatného **súkromného** repozitára.

1. Vytvor súkromný repozitár, napr. `maximalky-data` (môže byť prázdny).
2. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
   - Repository access: *Only select repositories* → `maximalky-data`
   - Permissions → Repository permissions → **Contents: Read and write**
3. V appke: Profil → Záloha na GitHub → repozitár `meno/maximalky-data` a token → Pripojiť.

Pri spustení, po každej zmene a po návrate signálu appka stiahne `data.json`, spojí ho so záznamami v telefóne (novšia verzia záznamu vyhráva, zmazania sa prenášajú) a nahrá výsledok späť. Obrázky techniky sa ukladajú ako `images/<id>.jpg`. Token zostáva iba v telefóne.

## Vývoj

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # výstup v dist/
```

- `src/screens/` — obrazovky (Domov, Zápis, Cviky, Detail, Grafy, Profil, Nový cvik)
- `src/store.jsx` — dáta v IndexedDB a synchronizácia
- `src/lib/github.js` — GitHub Contents API
- `src/lib/calc.js` — odhad 1RM (Epley, Brzycki) a geometria grafu
- `src/styles/modernist.css` — dizajn systém z exportu
