# Dlho netestované cviky

_Started 2026-10-28 11:04 UTC_

---

## User

<artifact-content-authored-by-others/>
Continuing from "Mobile app design brief".

## Assistant

We were building Maximálky, a mobile app (Android frame, light Modernist theme, Slovak) for tracking strength max tests — both hi-fi design and an interactive clickable prototype, based on your attached PDF návrh.

Decisions along the way:
- No A/B variants — you said one path is enough.
- Simplified from 8 screens to 6: Domov, Zápis maximálky, Cviky, Detail cviku, Grafy a štatistiky, Profil. The workout diary and "Prebiehajúci tréning" were removed because you don't want to log every session — only test records. Domov now shows a "Posledné testy" list; Grafy replaced training volume with number of records per month.
- The older diary version is preserved in the file "Maximálky v1 (s denníkom)".
- I can't generate photorealistic images, so I drew 16 schematic line pictograms (red plates, system style), one per exercise, used in the grid, detail and lists.
- Contrast fixes after verifier runs: small text moved to neutral-700 (5.6:1), "minule" values and axis labels slightly larger; light tints kept only as chart fills.

Current state:
- Progress chart appears twice: a small bench chart on Domov (taps through to detail) and a full chart on Detail cviku with kg axis, dates under points, values above peak and last point. Line turns red when performance rises, dark when it falls; filled dot = tested 1RM, hollow = calculated from a set, square = record; dashed line = trend. Period switcher 1M–Všetko.
- Zápis maximálky computes 1RM (Epley/Brzycki) and flags records.
- New screen "Nový cvik" (07 in the list, also a button in Cviky): name, muscle group, and 3–5 technique steps, each with a drop-target image slot, step title and note; + / − Krok adjusts between 3 and 5.
- Detail cviku has a new "Technika" section — horizontal step gallery with number, title, description. Split squat is populated with your three images; other exercises show an empty state prompting to add images.
- All verifier-reported issues have been addressed.

Files: Maximálky.dc.html, Maximálky v1 (s denníkom), android-frame.jsx, image-slot.js, support.js.

## User

Na domovksej stranke mame: dlho netestovane cviky
Toe daj na spodok uvodnej stranky

## Assistant

I'll move the "Dlho netestované" section to the bottom of the home screen.

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

"Dlho netestované" je teraz na spodku domovskej stránky, pod "Posledné testy".

