# DuivenApp
n**Online (prototype):** https://ahmadmajid.github.io/duivenapp/

Installeren: Android → Chrome → "App installeren". iPhone → Safari → Deel → "Zet op beginscherm".

Alles-in-één app voor de duivensport thuis. Draait op telefoon, tablet en computer
als installeerbare website (PWA), werkt offline en wordt online gelijkgezet.

## Kern
- **Duivenkaart** per duif: ring, geslacht, kleur, ouders, foto, status (vlieg / kweek / verkoop / weg).
- **Scherm "Vandaag"**: alles wat nu aandacht vraagt (vorst, voer bestellen, vaccinatie, training).
- **Spraak-assistent**: microfoonknop, bv. "1234 is binnen, 14 uur 32" → app plaatst het, na bevestiging.
- **QR-scannen**: stickers op nestbak, hok en duivenkaartje; streepjescode van voer/medicijn.

## Modules
| Module | Wat de app zelf doet |
|---|---|
| Vluchten & uitslagen | Snelheid, plaats, prijspercentage berekenen; uitslagen importeren |
| Beste duiven / steeds voorop | Ranglijst op gemiddeld prijs% en constantheid |
| Te laat | Automatisch markeren bij ver na peloton of niet thuis |
| Eruit moeten | Voorstellen op basis van resultaten, te laat, ziekte |
| Verkoop | Verkooplijst + deelbare verkoopkaart met afstamming |
| Kweek | Koppels, legdatum, uitkomst (±18 dagen), ringen jongen |
| Gezondheid | Vaccinaties met herhaaldatum, kuren met wachttijd |
| Africhten & trainen | Schema met herinnering |
| Voer | Voorraad + verbruik → besteldatum incl. levertijd |
| Vorst | Weercheck (Open-Meteo) elke avond → melding |
| Afspraken | Agenda: inkorven, dierenarts, markten |
| Kosten & winst | Uitgaven/inkomsten per maand en jaar |

Meldingen: pushbericht en/of Telegram (ook spraakberichten via Telegram verwerken).

## Techniek (voorstel)
- PWA (React of Svelte), lokale database op het apparaat → offline.
- Supabase voor synchronisatie en back-up (later meerdere gebruikers / abonnement).
- Spraak: ingebouwde spraakherkenning telefoon + Claude om de opdracht te begrijpen; altijd eerst bevestigen.

## Volgorde
1. Klikbaar prototype: "Vandaag", duivenkaart, nestbak scannen, microfoonknop.
2. Duiven, vluchten, uitslagen + ranglijst.
3. Meldingen: vorst, voer, vaccinatie, training.
4. Kweek en gezondheid.
5. Kosten/winst en verkoop.

Afspraak: HunterPilot gaat voor; hier eerst alleen het prototype.
