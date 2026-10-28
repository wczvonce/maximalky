# Mobile app design brief

_Started 2026-10-27 19:43 UTC_

---

## User

Design a mobile app for

## Assistant



## Assistant

_[tool: read_skill_prompt]_

_[tool: list_files]_

_[tool: run_script]_

_[tool: list_files]_

_[tool: copy_files]_

_[tool: run_script]_

Správa sa zrezala na „Design a mobile app for" — beriem ako zadanie priložený návrh **Maximálky**. Pár otázok, než začnem:

_[tool: ask_user]_

Čakám na odpovede vo formulári — najmä na rozsah obrazoviek a či chceš klikací prototyp.

## User

<artifact-content-authored-by-others/>
Answered — Asked for follow-up questions; screens: Domov, Prebiehajúci tréning (série, časovač), Zápis maximálky, Cviky (mriežka), Detail cviku s grafom, Denník, Grafy a štatistiky, Profil a nastavenia; fidelity: Oboje; theme: Svetlý; data: Vymyslené ale realistické dáta; scope: MVP + náznak v2; frame: Android; variants: Zápis série – rýchlosť zadávania, Navigácia a štruktúra Domov, Vizualizácia grafu vývoja, Nechcem varianty, jedna cesta stačí

## Assistant



## Assistant

_[tool: ask_user]_

Čakám hlavne na rozhodnutie o variantoch a ktoré tri obrazovky vyladiť do detailu.

## User

<artifact-content-authored-by-others/>
Answered — first_pass: Domov, Zápis maximálky, Detail cviku; images: Prázdne miesta na obrázok – doplnim ne

## Assistant

_[tool: list_files]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_starter_component]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Hotový klikací prototyp — všetkých 8 obrazoviek v Androide, svetlý Modernist, slovensky.

Čo funguje naživo: zápis maximálky s prepočtom 1RM (Epley/Brzycki) a hlásením rekordu, odškrtávanie sérií s časovačom prestávky, filter a hľadanie cvikov, prepínanie období v grafe s trendovou čiarou. Varianty som nerobil — označil si aj „nechcem varianty", tak som zvolil jednu cestu. Obrázok cviku môžeš na detaile presunúť myšou do prázdnej plochy.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Kontrast opravený: drobný text je teraz na `neutral-700` (5,6:1) a „minule" hodnoty aj popisky osí mierne väčšie. Svetlejšie odtiene zostali len na výplniach grafov.

## User

Pridaj tam ešte graf, napríklad Bench. Chcem vidieť graf za každý raz, čo som zapísal maximálku, a ako mi v čase klesal a stúpal výkon. Čiže klasický horizontálny graf. Napríklad: 1. januára som mal 100 kg, potom graf ide hore, lebo som stúpol na 110. Potom v marci ide ešte vyššie, lebo som stúpol na stodvadsať. V apríli ide nižšie, lebo som klesol napríklad na sto.

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Graf vývoja je teraz na dvoch miestach:

**Domov** – malý graf benchu pod rekordom, cez celú históriu, ťuknutím otvorí detail.
**Detail cviku** – plný graf s osou v kg, dátumami pod bodmi a hodnotami nad vrcholom a posledným bodom.

Čiara mení farbu podľa smeru: červená keď výkon ide hore, tmavá keď klesá. Každý bod je jeden zápis — plný krúžok testované 1RM, prázdny prepočet zo série, štvorček rekord. Prerušovaná čiara je trend. Obdobie prepneš pod grafom (1M–Všetko).

## User

Zjednoduš celú aplikáciu. Všetky veci okolo maximálok nech tam ostanú, aj grafy, aj môj profil. Nechcem si tam však zapisovať denník toho, čo a kedy cvičím. To sa mi nebude chcieť zapisovať. Chcem mať iba záznam o tom, kedy som sa testoval a koľko mi vyšlo. Pri každom cviku chcem mať jednoduchý obrázok, ktorý ukazuje, o aký cvik ide. Tie obrázky chcem, aby si vygeneroval ty.

## Assistant

_[tool: copy_files]_

_[tool: dc_write]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Zjednodušené na šesť obrazoviek: Domov, Zápis, Cviky, Detail, Grafy, Profil. Denník aj prebiehajúci tréning sú preč — zostal len záznam testov. Domov má teraz zoznam „Posledné testy" (kedy, čo, koľko) a v grafoch nahradil objem tréningov počet zápisov za mesiac.

K obrázkom: fotorealistické obrázky neviem vygenerovať. Nakreslil som 16 schematických piktogramov, jeden na každý cvik — čiarová kresba s červenými kotúčmi, v štýle systému. Sú v mriežke cvikov, na detaile aj v zoznamoch. Ak chceš radšej fotky alebo kreslené ilustrácie, pošli ich a vymením.

Pôvodná verzia s denníkom zostala v súbore *Maximálky v1 (s denníkom)*.

## User

<artifact-content-authored-by-others/>
Found issues — fixing…

## User

Found issues — fixing…

## User

<artifact-content-authored-by-others/>
A do budúcna, keď budem pridávať nový cvik, chcem, aby tam bola aj možnosť pridať obrázoky k cviku. Chcem, aby bol každý cvik znázornený troma až piatimi obrázkami, ktoré ukazujú, ako sa cvičí. Do prílohy dávam príklad, ako si to predstavujem napriklad pri split squate

## User

A do budúcna, keď budem pridávať nový cvik, chcem, aby tam bola aj možnosť pridať obrázoky k cviku. Chcem, aby bol každý cvik znázornený troma až piatimi obrázkami, ktoré ukazujú, ako sa cvičí. Do prílohy dávam príklad, ako si to predstavujem napriklad pri split squate

## Assistant

_[tool: copy_files]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

Pridané:

**Nový cvik** (07 v zozname vpravo, alebo tlačidlo v Cvikoch) — názov, partia a 3 až 5 krokov. Každý krok má plochu na obrázok (presunieš doň súbor), názov kroku a poznámku na čo si dať pozor. Tlačidlami + / − Krok meníš počet medzi 3 a 5.

**Detail cviku** má novú sekciu Technika — vodorovná galéria krokov s číslom, názvom a popisom. Split squat je naplnený tvojimi tromi obrázkami; ostatné cviky ukazujú prázdny stav s výzvou pridať obrázky.

Dosiahol sa limit využitia. Keď budeš chcieť pokračovať, napíš.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

## Assistant

_[tool: get_webview_logs]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: image_metadata]_

_[tool: eval_js]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

Obrazovka **Nový cvik** aj galéria **Technika** na detaile sú hotové a fungujú. Split squat má tvoje tri obrázky načítané, ostatné cviky ukazujú prázdny stav s výzvou obrázky pridať.

