'use strict';
/* DuivenApp – klikbaar prototype.
   Alles staat lokaal op het apparaat (localStorage). Geen server nodig. */

// ---------- hulpjes ----------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const DAG = 86400000;
const KEY = 'duivenapp-v1';

const vandaag = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const plus = (n, basis) => { const d = basis ? parseD(basis) : vandaag(); d.setDate(d.getDate() + n); return iso(d); };
const dagenTot = s => Math.round((parseD(s) - vandaag()) / DAG);
const VANDAAG = () => iso(vandaag());
const fmtD = s => parseD(s).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtDJ = s => parseD(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
const wanneer = n => n === 0 ? 'vandaag' : n === 1 ? 'morgen' : n === -1 ? 'gisteren' : n > 1 ? `over ${n} dagen` : `${-n} dagen geleden`;
const euro = n => n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
const minuten = t => { const [h, m, s] = t.split(':').map(Number); return h * 60 + (m || 0) + (s || 0) / 60; };
const tijdNu = () => new Date().toTimeString().slice(0, 8);
const cijfers = r => r.replace(/\D/g, '');

function ringHtml(r) {
  const eind = r.slice(-4);
  return `<span class="ring">${esc(r.slice(0, -4))}<span class="eind">${esc(eind)}</span></span>`;
}
const duif = id => S.duiven.find(d => d.id === id);
const hokLijst = () => (S.inst?.hokken?.length ? S.inst.hokken : ['Hok 1', 'Hok 2', 'Kweekhok', 'Jongen']);
const kortRing = id => duif(id)?.ring.slice(-4) || '?';
const duifNaam = id => { const d = duif(id); return d ? d.ring + (d.naam ? ' · ' + d.naam : '') : '—'; };

// ---------- demogegevens ----------
function rnd(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function demo() {
  const r = rnd(7);
  const D = (id, ring, g, kleur, status, q, extra = {}) => ({ id, ring, geslacht: g, kleur, status, q, hok: status === 'kweek' ? 'Kweekhok' : (g === 'D' ? 'Hok 1' : 'Hok 2'), naam: '', vader: '', moeder: '', notitie: '', prijs: 0, ...extra });
  const duiven = [
    D('d15', 'NL-2018-1107781', 'D', 'Donkerkras', 'kweek', null, { naam: 'Oude Kanon', aankoopprijs: 750, gekochtVan: 'Online veiling', aankoopdatum: plus(-1500) }),
    D('d16', 'NL-2018-1107790', 'V', 'Blauw', 'kweek', null),
    D('d17', 'NL-2019-3305512', 'D', 'Kras', 'kweek', null),
    D('d18', 'NL-2019-3305527', 'V', 'Blauwgebandeerd', 'kweek', null, { naam: 'Goudvleugel', aankoopprijs: 400, gekochtVan: 'Duivenmarkt', aankoopdatum: plus(-1100) }),
    D('d11', 'NL-2021-2214417', 'D', 'Blauwgebandeerd', 'kweek', null, { naam: 'Stamdoffer', vader: 'd15', moeder: 'd16' }),
    D('d12', 'NL-2021-2214552', 'V', 'Donkerkras', 'kweek', null, { naam: 'Stamduivin', vader: 'd17', moeder: 'd18' }),
    D('d14', 'NL-2022-3320450', 'V', 'Blauw', 'kweek', null),
    D('d1', 'NL-2023-4011234', 'D', 'Donkerkras', 'vlieg', 0.10, { naam: 'Kanon', vader: 'd11', moeder: 'd12' }),
    D('d2', 'NL-2023-4011238', 'V', 'Blauwgebandeerd', 'vlieg', 0.17, { naam: 'Dirkje', vader: 'd11', moeder: 'd12' }),
    D('d3', 'NL-2024-1191234', 'D', 'Kras', 'vlieg', 0.30, { aankoopprijs: 250, gekochtVan: 'Clubgenoot', aankoopdatum: plus(-250) }),
    D('d4', 'NL-2024-1190457', 'V', 'Blauw', 'vlieg', 0.22, { vader: 'd11', moeder: 'd14' }),
    D('d5', 'NL-2024-1190460', 'D', 'Rood', 'vlieg', 0.52),
    D('d6', 'NL-2023-4011301', 'D', 'Schimmel', 'vlieg', 0.86),
    D('d7', 'NL-2024-1190502', 'V', 'Kras', 'vlieg', 0.40),
    D('d8', 'NL-2022-3324417', 'D', 'Vaal', 'vlieg', 0.97),
    D('d9', 'NL-2024-1190519', 'V', 'Blauwgebandeerd', 'vlieg', 0.34),
    D('d10', 'NL-2023-4011277', 'D', 'Blauw', 'vlieg', 0.66),
    D('d19', 'NL-2026-1234573', 'D', 'Donkerkras', 'vlieg', null, { vader: 'd11', moeder: 'd12', notitie: 'Geringd in nestbak 1' }),
    D('d20', 'NL-2026-1234574', 'V', 'Blauwgebandeerd', 'vlieg', null, { vader: 'd11', moeder: 'd12', notitie: 'Geringd in nestbak 1' }),
    D('d21', 'NL-2025-1190611', 'D', 'Donkerkras', 'verkocht', null, { vader: 'd1', moeder: 'd4', verkoopprijs: 275, verkochtAan: 'Liefhebber uit Duitsland', verkoopdatum: plus(-120) }),
    D('d13', 'NL-2024-1190533', 'D', 'Donkerkras', 'verkoop', 0.26, { prijs: 350, vader: 'd11', moeder: 'd14' }),
  ];
  const vliegers = duiven.filter(d => d.q != null);
  const vluchten = [
    ['Pommeroeul', 178, -190, '09:15', 1240], ['Quiévrain', 196, -183, '10:00', 980],
    ['Noyon', 318, -176, '08:30', 1510], ['Pont-Ste-Maxence', 354, -169, '07:45', 1320],
    ['Melun', 441, -162, '07:00', 860], ['Châteauroux', 650, -148, '06:30', 640],
  ].map(([plaats, afstand, dag, lostijd, deelnemers]) => {
    const uitslag = vliegers.map(d => {
      const f = Math.max(0.01, d.q + (r() - 0.5) * 0.45 + (afstand > 500 ? 0.08 : 0));
      if (f > 1.08) return { duif: d.id, aankomst: null, plaats: null };
      const sn = 1450 * (1 - 0.2 * Math.min(f, 1)) * (afstand > 500 ? 0.85 : 1);
      const m = minuten(lostijd) + afstand * 1000 / sn;
      const h = Math.floor(m / 60), mm = Math.floor(m % 60), ss = Math.floor((m * 60) % 60);
      return { duif: d.id, aankomst: `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, plaats: Math.min(deelnemers, Math.max(1, Math.round(f * deelnemers))) };
    });
    return { id: uid(), plaats, afstand, datum: plus(dag), lostijd, deelnemers, uitslag };
  });
  duiven.forEach(d => delete d.q);

  const kosten = [];
  const k = (dag, omschrijving, bedrag, cat) => kosten.push({ id: uid(), datum: plus(dag), omschrijving, bedrag, cat });
  for (let m = 0; m < 10; m++) k(-300 + m * 30, 'Voer (3 zakken)', -55.5, 'Voer');
  vluchten.forEach((v, i) => { k(dagenTot(v.datum) - 2, 'Inleg ' + v.plaats, -38 - i * 4, 'Inleg'); k(dagenTot(v.datum) + 3, 'Prijzengeld ' + v.plaats, 20 + i * 17, 'Prijzen'); });
  k(-210, 'Dierenarts voorjaarscontrole', -65, 'Medicatie');
  k(-200, 'Paramyxo-vaccin', -32, 'Medicatie');
  k(-120, 'Verkoop NL-2025-1190611', 275, 'Verkoop');
  k(-40, 'Verkoop 2 jongen markt', 180, 'Verkoop');
  k(-12, 'Ronidazole', -14.95, 'Medicatie');
  k(-250, 'Aankoop NL-2024-1191234', -250, 'Aankoop duiven');

  return {
    versie: 4,
    demo: true,
    duiven, vluchten, kosten,
    nestbakken: [
      { nr: 1, vader: 'd11', moeder: 'd12', legdatum: plus(-16), eieren: 2, uitgekomen: '', jongen: 0, geringd: false },
      { nr: 2, vader: 'd3', moeder: 'd14', legdatum: plus(-24), eieren: 2, uitgekomen: plus(-6), jongen: 2, geringd: false },
      { nr: 3, vader: 'd1', moeder: 'd4', legdatum: plus(-4), eieren: 2, uitgekomen: '', jongen: 0, geringd: false },
      ...[4, 5, 6, 7, 8].map(nr => ({ nr, vader: '', moeder: '', legdatum: '', eieren: 0, uitgekomen: '', jongen: 0, geringd: false })),
    ],
    vaccinaties: [
      { id: uid(), naam: 'Paramyxo', datum: plus(-351), herhaalDagen: 365 },
      { id: uid(), naam: 'Pokken', datum: plus(-200), herhaalDagen: 365 },
      { id: uid(), naam: 'Salmonella', datum: plus(-160), herhaalDagen: 180 },
    ],
    kuren: [{ id: uid(), naam: 'Tricho (Ronidazole)', hok: 'Hok 2', start: plus(-2), dagen: 5, wachttijd: 2 }],
    trainingen: [
      { id: uid(), datum: VANDAAG(), afstand: 20, plaats: 'Richting zuid (Breda)', gedaan: false },
      { id: uid(), datum: plus(3), afstand: 35, plaats: 'Richting zuid (Antwerpen-N)', gedaan: false },
      { id: uid(), datum: plus(-4), afstand: 12, plaats: 'Richting zuid', gedaan: true },
    ],
    afspraken: [
      { id: uid(), datum: plus(2), titel: 'Dierenarts – mestonderzoek' },
      { id: uid(), datum: plus(5), titel: 'Duivenmarkt' },
      { id: uid(), datum: plus(19), titel: 'Clubvergadering' },
    ],
    voer: { voorraad: 28, perDag: 4.5, levertijd: 3, prijsPerKg: 0.92 },
    ringen: { voorraad: 12, minimum: 10, volgende: 'NL-2026-1234575', laatste: [{ ring: 'NL-2026-1234573', datum: plus(-9), nb: 1 }, { ring: 'NL-2026-1234574', datum: plus(-9), nb: 1 }] },
    producten: {
      '8712345000017': { soort: 'voer', naam: 'Kweek- en vliegvoer 20 kg', kg: 20, prijs: 18.5 },
      '8712345000024': { soort: 'medicijn', naam: 'Ronidazole 10%', prijs: 14.95, dagen: 5 },
    },
    inst: { plaats: 'Midden-Nederland', lat: 52.09, lon: 5.12, vorstTest: false },
    weer: null,
  };
}

let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch { S = null; }
if (!S || !Array.isArray(S.duiven)) S = demo();
// Bij een nieuwe versie worden ontbrekende onderdelen aangevuld; bestaande gegevens blijven altijd staan.
S.versie = 4;
S.demo ??= S.duiven.some(d => d.id === 'd11');
S.inst ??= { plaats: 'Mijn hok', lat: 52.09, lon: 5.12, vorstTest: false };
for (const k of ['duiven', 'vluchten', 'kosten', 'nestbakken', 'vaccinaties', 'kuren', 'trainingen', 'afspraken']) S[k] ??= [];
S.voer ??= { voorraad: 0, perDag: 0, levertijd: 3, prijsPerKg: 0 };
S.producten ??= {};
const bewaar = () => localStorage.setItem(KEY, JSON.stringify(S));
S.ringen ??= { voorraad: 12, minimum: 10 };
S.ringen.volgende ??= `NL-${new Date().getFullYear()}-`;
S.ringen.laatste ??= [];
S.woorden ??= [
  { id: uid(), zeg: 'de kampioen', betekent: '4011234' },
  { id: uid(), zeg: 'het oude hok', betekent: 'hok 2' },
  { id: uid(), zeg: 'zwarte', betekent: 'donkerkras' },
];
S.snel ??= [
  { id: uid(), zeg: 'inkorven', actie: 'inkorven', zin: '' },
  { id: uid(), zeg: 'voeren', actie: 'voeren', zin: '' },
  { id: uid(), zeg: 'water ververst', actie: 'water', zin: '' },
  { id: uid(), zeg: 'hok schoon', actie: 'schoon', zin: '' },
  { id: uid(), zeg: 'ochtendronde', actie: 'ronde', zin: '' },
  { id: uid(), zeg: 'tricho kuur', actie: 'zin', zin: 'kuur tricho alle hokken 5 dagen' },
];
S.logboek ??= [];
S.commandos ??= {}; // eigen commandowoorden per handeling (anders de standaard)
bewaar();

// ---------- berekeningen ----------
function snelheid(v, u) {
  if (!u.aankomst || !v.lostijd || !v.afstand) return null;
  const m = minuten(u.aankomst) - minuten(v.lostijd);
  return m > 0 ? v.afstand * 1000 / m : null;
}
function analyse(v) {
  const res = v.uitslag.map(u => ({ ...u, sn: snelheid(v, u) }));
  const max = Math.max(0, ...res.map(x => x.sn || 0));
  const verleden = v.datum < VANDAAG();
  res.forEach(x => {
    x.prijs = !!(x.plaats && v.deelnemers && x.plaats <= v.deelnemers / 3);
    x.nietThuis = !x.aankomst && verleden;
    x.onderweg = !x.aankomst && !verleden;
    x.telaat = !!(x.sn && max && x.sn < 0.9 * max);
    x.pct = x.plaats && v.deelnemers ? x.plaats / v.deelnemers * 100 : (x.nietThuis ? 100 : null);
  });
  return res;
}
function prestaties(pid) {
  let n = 0, prijzen = 0, telaat = 0, niet = 0; const pcts = [];
  for (const v of S.vluchten) {
    const x = analyse(v).find(y => y.duif === pid);
    if (!x || x.onderweg) continue;
    n++; if (x.prijs) prijzen++; if (x.telaat) telaat++; if (x.nietThuis) niet++;
    if (x.pct != null) pcts.push(x.pct);
  }
  return { n, prijzen, telaat, niet, gem: pcts.length ? pcts.reduce((a, b) => a + b) / pcts.length : null, constant: n ? prijzen / n : 0 };
}
function eruitVoorstellen() {
  return S.duiven.filter(d => d.status === 'vlieg').map(d => {
    const p = prestaties(d.id), redenen = [];
    if (p.n >= 3 && p.prijzen === 0) redenen.push(`geen prijs in ${p.n} vluchten`);
    if (p.telaat + p.niet >= 2) redenen.push(`${p.telaat}× te laat, ${p.niet}× niet thuis`);
    if (p.n >= 3 && p.gem > 70) redenen.push(`gem. ${Math.round(p.gem)}%`);
    return { d, p, redenen };
  }).filter(x => x.redenen.length);
}
function voerInfo() {
  const v = S.voer, over = v.perDag ? v.voorraad / v.perDag : 99;
  const bestelBinnen = Math.floor(over - v.levertijd - 1);
  return { over, bestelBinnen, opDatum: plus(Math.floor(over)) };
}
const volgendeVaccin = x => plus(x.herhaalDagen, x.datum);
const kuurActief = k => k.start <= VANDAAG() && plus(k.dagen, k.start) > VANDAAG();
const uitkomstDatum = nb => nb.legdatum ? plus(18, nb.legdatum) : '';

function nestStatus(nb) {
  if (!nb.vader && !nb.moeder && !nb.eieren) return { t: 'Leeg', kl: '' };
  if (nb.uitgekomen) {
    const leeftijd = -dagenTot(nb.uitgekomen);
    if (!nb.geringd) return { t: `${nb.jongen} jong(en), ${leeftijd} dagen – ${leeftijd >= 6 ? 'nu ringen!' : 'ringen vanaf dag 6'}`, kl: leeftijd >= 6 ? 'oranje' : 'blauw' };
    return { t: `${nb.jongen} jong(en), ${leeftijd} dagen, geringd`, kl: '' };
  }
  if (nb.eieren) return { t: `${nb.eieren} ei(eren), uitkomst ${wanneer(dagenTot(uitkomstDatum(nb)))}`, kl: 'blauw' };
  return { t: 'Koppel, nog geen eieren', kl: '' };
}

// ---------- melding "Vandaag" ----------
function meldingen() {
  const m = [];
  const add = (kl, ico, titel, sub, href) => m.push({ kl, ico, titel, sub, href });

  // vorst
  const w = S.weer;
  if (S.inst.vorstTest) add('rood', '❄', 'Vannacht −3 °C (test)', 'Drinkbakken binnenhalen, water niet laten bevriezen, hok tochtvrij.', '#/instellingen');
  else if (w) {
    w.min.slice(0, 2).forEach((t, i) => {
      if (t <= 0) add('rood', '❄', `${i === 0 ? 'Vannacht' : 'Morgennacht'} ${t.toFixed(0).replace('-', '−')} °C`, 'Drinkbakken binnenhalen, water niet laten bevriezen, hok tochtvrij.', '#/instellingen');
      else if (t <= 2 && i === 0) add('oranje', '🌡', `Vannacht ${t.toFixed(0)} °C – kans op nachtvorst`, 'Houd de drinkbakken in de gaten.', '#/instellingen');
    });
  }
  // voer
  const vi = voerInfo();
  if (vi.bestelBinnen <= 3) add(vi.bestelBinnen <= 0 ? 'rood' : 'oranje', '🌾', `Voer over ${Math.floor(vi.over)} dagen op – ${vi.bestelBinnen <= 0 ? 'nu bestellen' : 'bestel binnen ' + vi.bestelBinnen + (vi.bestelBinnen === 1 ? ' dag' : ' dagen')}`, `${S.voer.voorraad} kg voorraad, ${S.voer.perDag} kg per dag, levertijd ${S.voer.levertijd} dagen.`, '#/voer');
  // vaccinaties
  S.vaccinaties.forEach(x => {
    const n = dagenTot(volgendeVaccin(x));
    if (n <= 21) add(n <= 3 ? 'rood' : 'oranje', '💉', `Vaccinatie ${x.naam} ${n < 0 ? 'te laat (' + wanneer(n) + ')' : wanneer(n)}`, `Laatst gegeven ${fmtDJ(x.datum)}.`, '#/gezondheid');
  });
  // kuren
  S.kuren.filter(kuurActief).forEach(k => {
    const dag = -dagenTot(k.start) + 1;
    add('blauw', '💊', `Kuur ${k.naam}: dag ${dag} van ${k.dagen}`, `${k.hok}. Niet inkorven vóór ${fmtD(plus(k.dagen + (k.wachttijd || 0), k.start))}.`, '#/gezondheid');
  });
  // training
  S.trainingen.filter(t => !t.gedaan && dagenTot(t.datum) >= 0 && dagenTot(t.datum) <= 1).forEach(t =>
    add('blauw', '🧭', `Training ${t.afstand} km ${wanneer(dagenTot(t.datum))}`, t.plaats, '#/training'));
  // kweek
  S.nestbakken.forEach(nb => {
    if (nb.eieren && !nb.uitgekomen) {
      const n = dagenTot(uitkomstDatum(nb));
      if (n <= 3) add('blauw', '🥚', `Nestbak ${nb.nr}: eieren komen ${n < 0 ? 'binnenkort' : wanneer(n)} uit`, `Gelegd ${fmtD(nb.legdatum)}.`, '#/nestbak/' + nb.nr);
    }
    if (nb.uitgekomen && !nb.geringd && -dagenTot(nb.uitgekomen) >= 5) add('oranje', '💍', `Nestbak ${nb.nr}: jongen ringen`, `${nb.jongen} jong(en), ${-dagenTot(nb.uitgekomen)} dagen oud.`, '#/nestbak/' + nb.nr);
  });
  // afspraken
  S.afspraken.filter(a => dagenTot(a.datum) >= 0 && dagenTot(a.datum) <= 7).forEach(a =>
    add('', '📅', a.titel, `${fmtD(a.datum)} – ${wanneer(dagenTot(a.datum))}`, '#/afspraken'));
  // ringen
  const nodig = ringenNodig();
  if (S.ringen.voorraad <= S.ringen.minimum || S.ringen.voorraad < nodig)
    add(S.ringen.voorraad < nodig ? 'rood' : 'oranje', '💍', `Nog ${S.ringen.voorraad} ringen – bijbestellen`, `${nodig} nodig voor eieren en jongen in de bakken. Bestel bij je bond/afdeling.`, '#/kweek');
  // eruit
  if (!S.demo && S.duiven.length && (!S.laatsteBackup || dagenTot(S.laatsteBackup) <= -14))
    add('oranje', '💾', S.laatsteBackup ? `Laatste back-up ${wanneer(dagenTot(S.laatsteBackup))}` : 'Nog nooit een back-up gemaakt', 'Je gegevens staan alleen op dit toestel. Maak een back-up en bewaar of deel hem.', '#/instellingen');
  const ev = eruitVoorstellen();
  if (ev.length) add('', '✂', `${ev.length} duif/duiven om naar te kijken`, 'Voorstellen op basis van slechte resultaten.', '#/eruit');
  return m;
}

// ---------- weer (Open-Meteo, gratis, geen sleutel) ----------
async function haalWeer(force) {
  const w = S.weer;
  if (!force && w && Date.now() - w.tijd < 3 * 3600e3 && w.lat === S.inst.lat && w.lon === S.inst.lon) return;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${S.inst.lat}&longitude=${S.inst.lon}&daily=temperature_2m_min,temperature_2m_max&timezone=auto&forecast_days=3`);
    const j = await r.json();
    S.weer = { tijd: Date.now(), lat: S.inst.lat, lon: S.inst.lon, dagen: j.daily.time, min: j.daily.temperature_2m_min, max: j.daily.temperature_2m_max };
    bewaar();
    vorstPush();
    if (route().naam === 'vandaag' || route().naam === 'instellingen') render();
  } catch { /* offline: dan later */ }
}
async function vorstPush() {
  const vorst = S.inst.vorstTest || (S.weer && S.weer.min.slice(0, 2).some(t => t <= 0));
  if (!vorst || S.laatsteVorstPush === VANDAAG()) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  S.laatsteVorstPush = VANDAAG(); bewaar();
  const reg = await navigator.serviceWorker?.getRegistration();
  const tekst = 'Vorst verwacht: drinkbakken binnenhalen en hok tochtvrij maken.';
  if (reg) reg.showNotification('DuivenApp – vorst', { body: tekst, icon: 'icon.svg' });
  else new Notification('DuivenApp – vorst', { body: tekst });
}

// ---------- UI-basis ----------
function dialoog(html) { $('#dlg-body').innerHTML = html; if (!$('#dlg').open) $('#dlg').showModal(); }
function sluit() { stopCam(); stopLuister(); if ($('#dlg').open) $('#dlg').close(); }
$('#dlg').addEventListener('close', () => { stopCam(); stopLuister(); });

function toast(msg, undo) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (undo ? ' <button class="knop licht" style="padding:6px 10px;margin-left:8px" id="undo">Ongedaan maken</button>' : '');
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.hidden = true, undo ? 8000 : 3000);
  if (undo) $('#undo').onclick = () => { undo(); t.hidden = true; };
}
// Wijziging met mogelijkheid tot terugdraaien
function wijzig(fn, melding) {
  const voor = JSON.stringify(S);
  fn(); bewaar(); render();
  if (melding) toast(melding, () => { S = JSON.parse(voor); bewaar(); render(); toast('Teruggezet'); });
}

/* velden: {naam,label,type,waarde,opties:[waarde|[waarde,tekst]]} */
function formulier(titel, velden, opslaan) {
  const veld = v => {
    if (v.opties) return `<select name="${v.naam}">${v.opties.map(o => { const [w, t] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(w)}" ${w == v.waarde ? 'selected' : ''}>${esc(t)}</option>`; }).join('')}</select>`;
    // getallen als tekstveld met cijfertoetsenbord, zodat ook een komma (3,5) werkt
    return `<input name="${v.naam}" type="${v.type === 'number' ? 'text' : v.type || 'text'}" value="${esc(v.waarde ?? '')}" ${v.type === 'number' ? 'inputmode="decimal" autocomplete="off"' : ''} ${v.type === 'time' ? 'step="1"' : ''}>`;
  };
  dialoog(`<h3>${esc(titel)}</h3><form id="frm">${velden.map(v => `<label>${esc(v.label)}</label>${veld(v)}`).join('')}
    <div class="knoppen"><button type="button" class="knop licht" onclick="sluit()">Annuleren</button><button class="knop">Opslaan</button></div></form>`);
  $('#frm').onsubmit = e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    velden.forEach(v => { if (v.type === 'number') fd[v.naam] = parseFloat(String(fd[v.naam]).replace(',', '.')) || 0; });
    sluit();
    wijzig(() => opslaan(fd), 'Opgeslagen');
  };
}
const duifOpties = (filter = () => true) => [['', '—'], ...S.duiven.filter(filter).map(d => [d.id, d.ring + (d.naam ? ' · ' + d.naam : '')])];

// ---------- schermen ----------
function vVandaag() {
  const m = meldingen();
  const w = S.weer;
  const weer = S.inst.vorstTest ? '❄ Vorsttest staat aan' : w ? `🌡 Vannacht ${w.min[0].toFixed(0)} °C · morgen ${w.min[1].toFixed(0)} / ${w.max[1].toFixed(0)} °C · ${esc(S.inst.plaats)}` : navigator.onLine ? 'Weer wordt geladen…' : 'Geen internet – weer volgt later';
  const datum = vandaag().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const laatste = [...S.vluchten].sort((a, b) => b.datum.localeCompare(a.datum))[0];
  let top = '';
  if (laatste) {
    const res = analyse(laatste).filter(x => x.plaats).sort((a, b) => a.plaats - b.plaats).slice(0, 3);
    top = `<div class="sectie">Laatste vlucht – ${esc(laatste.plaats)}</div><div class="kaart">${res.map((x, i) => `
      <a class="rij" href="#/duif/${x.duif}"><b style="width:22px">${i + 1}</b><div class="groot">${ringHtml(duif(x.duif).ring)}<small>${esc(duif(x.duif).naam || duif(x.duif).kleur)}</small></div><div class="rechts">${x.plaats}e<br><small>${Math.round(x.sn || 0)} m/min</small></div></a>`).join('') || '<div class="leeg">Nog geen uitslag</div>'}
      <a class="knop licht vol" href="#/vlucht/${laatste.id}">Hele uitslag</a></div>`;
  }
  return ['Vandaag', `
    ${S.demo ? `<div class="kaart melding blauw"><div class="ico">👋</div><div><b>Je kijkt naar voorbeeldgegevens</b><small>Kanon, Dirkje en de rest zijn om mee te oefenen. Klaar? Begin met je eigen hok.</small><div class="knoppen"><button class="knop" onclick="startEigenHok()">Start met mijn eigen hok</button></div></div></div>` : ''}
    <div style="margin:2px 4px 10px"><b style="font-size:20px;text-transform:capitalize">${datum}</b><br><small style="color:var(--grijs)">${weer}</small></div>
    ${m.length ? m.map(x => `<a class="kaart melding ${x.kl}" href="${x.href}" style="text-decoration:none;color:inherit"><div class="ico">${x.ico}</div><div><b>${esc(x.titel)}</b><small>${esc(x.sub)}</small></div></a>`).join('') : '<div class="kaart leeg">Niets dringends vandaag 👍</div>'}
    <div class="sectie">Dagtaken</div>
    <div class="kaart" style="display:flex;gap:8px;flex-wrap:wrap">${Object.entries(DAGTAKEN).map(([k, v]) => { const g = vandaagGedaan(k); return `<button class="knop ${g ? '' : 'licht'}" style="flex:1;min-width:30%;padding:10px 6px;font-size:15px" ${g ? 'disabled' : `onclick="wijzig(()=>doeTaak('${k}'),'${v.slice(3)} – afgevinkt')"`}>${v}<br><small style="font-weight:400">${g ? '✔ ' + g.tijd : 'nog doen'}</small></button>`; }).join('')}</div>
    ${top}
    <div class="sectie">Snel</div>
    <div class="grid2">
      <a class="tegel" href="#/ranglijst"><span>🏆</span><b>Beste duiven</b><small>Ranglijst seizoen</small></a>
      <a class="tegel" href="#/kweek"><span>🥚</span><b>Kweek</b><small>${S.nestbakken.filter(n => n.eieren || n.uitgekomen).length} nestbakken bezet</small></a>
    </div>`];
}

let zoekTerm = '', duivenFilter = 'alle';
const STATUS = { vlieg: ['Vliegduif', ''], kweek: ['Kweek', 'blauw'], verkoop: ['Verkoop', 'oranje'], verkocht: ['Verkocht', 'blauw'], eruit: ['Eruit', 'rood'], weg: ['Weg', 'rood'] };
function vDuiven() {
  return ['Duiven', `
    <div class="zoek"><input id="zoek" type="search" inputmode="numeric" placeholder="Zoek op laatste cijfers van de ring…" value="${esc(zoekTerm)}">
    <div class="filters">${[['alle', 'Alle'], ...Object.entries(STATUS).map(([k, v]) => [k, v[0]])].map(([k, t]) => `<button class="${duivenFilter === k ? 'aan' : ''}" onclick="duivenFilter='${k}';render()">${t}</button>`).join('')}</div></div>
    <div class="kaart" id="lijst"></div>
    <div class="knoppen"><button class="knop" onclick="nieuweDuif()">＋ Nieuwe duif</button><button class="knop licht" onclick="bulkDuiven()">＋ Meerdere tegelijk</button></div>`, () => {
    const vul = () => {
      const z = cijfers(zoekTerm);
      const l = S.duiven.filter(d => (duivenFilter === 'alle' || d.status === duivenFilter) && (!z || cijfers(d.ring).includes(z) || d.naam.toLowerCase().includes(zoekTerm.toLowerCase())));
      $('#lijst').innerHTML = l.map(d => {
        const p = prestaties(d.id);
        return `<a class="rij" href="#/duif/${d.id}"><div style="font-size:22px">${d.geslacht === 'D' ? '♂' : '♀'}</div>
          <div class="groot">${ringHtml(d.ring)}<small>${esc([d.naam, d.kleur, d.hok].filter(Boolean).join(' · '))}</small></div>
          <div class="rechts"><span class="label ${STATUS[d.status][1]}">${STATUS[d.status][0]}</span><br><small>${p.n ? `${p.prijzen}/${p.n} prijs` : ''}</small></div></a>`;
      }).join('') || '<div class="leeg">Geen duiven gevonden</div>';
    };
    $('#zoek').oninput = e => { zoekTerm = e.target.value; vul(); };
    vul();
  }];
}

function vDuif(id) {
  const d = duif(id);
  if (!d) return ['Duif', '<div class="kaart leeg">Duif niet gevonden</div>'];
  const p = prestaties(id);
  const kinderen = S.duiven.filter(x => x.vader === id || x.moeder === id);
  const rijen = S.vluchten.map(v => ({ v, x: analyse(v).find(y => y.duif === id) })).filter(o => o.x).sort((a, b) => b.v.datum.localeCompare(a.v.datum));
  const ouder = (oid, t) => oid ? `<a class="rij" href="#/duif/${oid}"><div class="groot"><small>${t}</small>${ringHtml(duif(oid)?.ring || '?')}</div><small>${esc(duif(oid)?.naam || '')}</small></a>` : '';
  return [d.ring.slice(-7), `
    <div class="kaart">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><div style="font-size:24px">${ringHtml(d.ring)}</div><div style="color:var(--grijs)">${d.geslacht === 'D' ? '♂ Doffer' : '♀ Duivin'} · ${esc(d.kleur)} · ${esc(d.hok)}</div>${d.naam ? `<b>“${esc(d.naam)}”</b>` : ''}</div>
        <span class="label ${STATUS[d.status][1]}">${STATUS[d.status][0]}</span>
      </div>
      ${d.status === 'verkoop' ? `<p><b>Vraagprijs: ${euro(d.prijs || 0)}</b></p>` : ''}
      <p style="margin:8px 0 0;color:var(--grijs)">${d.aankoopprijs ? `🛒 Gekocht voor <b style="color:var(--tekst)">${euro(d.aankoopprijs)}</b>${d.gekochtVan ? ' van ' + esc(d.gekochtVan) : ''}${d.aankoopdatum ? ' op ' + fmtDJ(d.aankoopdatum) : ''}` : '🏠 Eigen kweek'}</p>
      ${d.verkoopprijs ? `<p style="margin:4px 0 0;color:var(--grijs)">💶 Verkocht voor <b style="color:var(--tekst)">${euro(d.verkoopprijs)}</b>${d.verkochtAan ? ' aan ' + esc(d.verkochtAan) : ''}${d.verkoopdatum ? ' op ' + fmtDJ(d.verkoopdatum) : ''}${d.aankoopprijs ? ` · ${d.verkoopprijs - d.aankoopprijs >= 0 ? 'winst' : 'verlies'} ${euro(Math.abs(d.verkoopprijs - d.aankoopprijs))}` : ''}</p>` : ''}
      ${d.notitie ? `<p style="background:var(--zand);padding:8px;border-radius:8px">${esc(d.notitie)}</p>` : ''}
      <div class="knoppen"><button class="knop licht" onclick="bewerkDuif('${id}')">Bewerken</button>${d.status === 'verkoop' ? `<button class="knop licht" onclick="deelDuif('${id}')">Delen</button>` : ''}</div>
    </div>
    ${p.n ? `<div class="stat"><div><b>${p.n}</b><small>vluchten</small></div><div><b>${p.prijzen}</b><small>prijzen</small></div><div><b>${p.gem != null ? Math.round(p.gem) + '%' : '–'}</b><small>gem. prijs%</small></div><div><b>${p.telaat + p.niet}</b><small>te laat/weg</small></div></div>` : ''}
    <div class="sectie">Status</div>
    <div class="filters" style="flex-wrap:wrap">${Object.entries(STATUS).map(([k, v]) => `<button class="${d.status === k ? 'aan' : ''}" onclick="zetStatus('${id}','${k}')">${v[0]}</button>`).join('')}</div>
    ${rijen.length ? `<div class="sectie">Resultaten</div><div class="kaart"><table><tr><th>Vlucht</th><th class="n">km</th><th class="n">m/min</th><th class="n">Plaats</th><th></th></tr>
      ${rijen.map(({ v, x }) => `<tr onclick="location.hash='#/vlucht/${v.id}'"><td>${esc(v.plaats)}<br><small style="color:var(--grijs)">${fmtD(v.datum)}</small></td><td class="n">${v.afstand}</td><td class="n">${x.sn ? Math.round(x.sn) : '–'}</td><td class="n">${x.plaats ? x.plaats + '/' + v.deelnemers : '–'}</td><td>${labelRes(x)}</td></tr>`).join('')}</table></div>` : ''}
    ${(d.vader || d.moeder) ? `<div class="sectie">Stamboom</div><div class="kaart">
      ${ouder(d.vader, '♂ Vader')}${duif(d.vader) ? `<div style="padding-left:18px">${ouder(duif(d.vader).vader, 'Grootvader vaderskant')}${ouder(duif(d.vader).moeder, 'Grootmoeder vaderskant')}</div>` : ''}
      ${ouder(d.moeder, '♀ Moeder')}${duif(d.moeder) ? `<div style="padding-left:18px">${ouder(duif(d.moeder).vader, 'Grootvader moederskant')}${ouder(duif(d.moeder).moeder, 'Grootmoeder moederskant')}</div>` : ''}</div>` : ''}
    ${kinderen.length ? `<div class="sectie">Jongen (${kinderen.length})</div><div class="kaart">${kinderen.map(k => `<a class="rij" href="#/duif/${k.id}"><div class="groot">${ringHtml(k.ring)}</div><small>${prestaties(k.id).prijzen} prijzen</small></a>`).join('')}</div>` : ''}
    <div class="sectie">QR-sticker</div><div class="kaart"><span class="qr-code">DUIF:RING:${esc(d.ring)}</span><br><small>Deze code komt op het duivenkaartje. Scannen opent deze kaart.</small></div>`];
}
function labelRes(x) {
  if (x.onderweg) return '<span class="label blauw">onderweg</span>';
  if (x.nietThuis) return '<span class="label rood">niet thuis</span>';
  if (x.prijs) return '<span class="label">prijs</span>';
  if (x.telaat) return '<span class="label oranje">te laat</span>';
  return '';
}
function zetStatus(id, st) { wijzig(() => duif(id).status = st, `Status: ${STATUS[st][0]}`); }
function duifVelden(d = {}) {
  return [
    { naam: 'ring', label: 'Ringnummer', waarde: d.ring || `NL-${new Date().getFullYear()}-` },
    { naam: 'naam', label: 'Naam (optioneel)', waarde: d.naam },
    { naam: 'geslacht', label: 'Geslacht', waarde: d.geslacht || 'D', opties: [['D', 'Doffer'], ['V', 'Duivin']] },
    { naam: 'kleur', label: 'Kleur', waarde: d.kleur },
    { naam: 'hok', label: 'Hok', waarde: d.hok || hokLijst()[0], opties: [...new Set([...hokLijst(), ...(d.hok ? [d.hok] : [])])] },
    { naam: 'status', label: 'Status', waarde: d.status || 'vlieg', opties: Object.entries(STATUS).map(([k, v]) => [k, v[0]]) },
    { naam: 'vader', label: 'Vader', waarde: d.vader, opties: duifOpties(x => x.geslacht === 'D' && x.id !== d.id) },
    { naam: 'moeder', label: 'Moeder', waarde: d.moeder, opties: duifOpties(x => x.geslacht === 'V' && x.id !== d.id) },
    { naam: 'prijs', label: 'Vraagprijs bij verkoop (€)', type: 'number', waarde: d.prijs || 0 },
    { naam: 'aankoopprijs', label: 'Gekocht voor (€, leeg = eigen kweek)', type: 'number', waarde: d.aankoopprijs || '' },
    { naam: 'gekochtVan', label: 'Gekocht van / waar', waarde: d.gekochtVan },
    { naam: 'aankoopdatum', label: 'Aankoopdatum', type: 'date', waarde: d.aankoopdatum || '' },
    { naam: 'verkoopprijs', label: 'Verkocht voor (€)', type: 'number', waarde: d.verkoopprijs || '' },
    { naam: 'verkochtAan', label: 'Verkocht aan', waarde: d.verkochtAan },
    { naam: 'verkoopdatum', label: 'Verkoopdatum', type: 'date', waarde: d.verkoopdatum || '' },
    { naam: 'notitie', label: 'Notitie', waarde: d.notitie },
  ];
}
function nieuweDuif() { formulier('Nieuwe duif', duifVelden(), f => { const id = uid(); S.duiven.push({ id, ...f }); setTimeout(() => location.hash = '#/duif/' + id); }); }
function bewerkDuif(id) { formulier('Duif bewerken', duifVelden(duif(id)), f => Object.assign(duif(id), f)); }
async function deelDuif(id) {
  const d = duif(id), p = prestaties(id);
  const tekst = `Te koop: ${d.ring}${d.naam ? ' “' + d.naam + '”' : ''} (${d.geslacht === 'D' ? 'doffer' : 'duivin'}, ${d.kleur})\n` +
    `Vader: ${duifNaam(d.vader)}\nMoeder: ${duifNaam(d.moeder)}\n` +
    (p.n ? `Resultaten: ${p.prijzen} prijzen uit ${p.n} vluchten, gem. ${Math.round(p.gem)}%\n` : '') + `Vraagprijs: ${euro(d.prijs || 0)}`;
  if (navigator.share) { try { await navigator.share({ title: 'Duif te koop', text: tekst }); } catch { } }
  else { await navigator.clipboard?.writeText(tekst); toast('Verkooptekst gekopieerd'); }
}

function vVluchten() {
  const l = [...S.vluchten].sort((a, b) => b.datum.localeCompare(a.datum));
  return ['Vluchten', `
    <div class="knoppen" style="margin:0 0 10px"><a class="knop" href="#/ranglijst">🏆 Beste duiven</a><button class="knop licht" onclick="nieuweVlucht()">＋ Vlucht</button></div>
    <div class="kaart">${l.map(v => {
      const a = analyse(v);
      return `<a class="rij" href="#/vlucht/${v.id}"><div class="groot"><b>${esc(v.plaats)}</b><small>${fmtDJ(v.datum)} · ${v.afstand} km</small></div>
        <div class="rechts"><b>${a.filter(x => x.prijs).length}/${a.length}</b><br><small>prijzen</small></div></a>`;
    }).join('') || '<div class="leeg">Nog geen vluchten</div>'}</div>`];
}
function vluchtVelden(v = {}) {
  return [
    { naam: 'plaats', label: 'Lossingsplaats', waarde: v.plaats },
    { naam: 'datum', label: 'Datum', type: 'date', waarde: v.datum || VANDAAG() },
    { naam: 'afstand', label: 'Afstand (km)', type: 'number', waarde: v.afstand || '' },
    { naam: 'lostijd', label: 'Lostijd', type: 'time', waarde: v.lostijd || '' },
    { naam: 'deelnemers', label: 'Aantal duiven in concours', type: 'number', waarde: v.deelnemers || '' },
  ];
}
function nieuweVlucht() {
  formulier('Nieuwe vlucht', vluchtVelden(), f => {
    const id = uid();
    S.vluchten.push({ id, ...f, uitslag: S.duiven.filter(d => d.status === 'vlieg').map(d => ({ duif: d.id, aankomst: null, plaats: null })) });
    setTimeout(() => location.hash = '#/vlucht/' + id);
  });
}
function vVlucht(id) {
  const v = S.vluchten.find(x => x.id === id);
  if (!v) return ['Vlucht', '<div class="kaart leeg">Niet gevonden</div>'];
  const a = analyse(v).sort((x, y) => (x.aankomst || '99').localeCompare(y.aankomst || '99'));
  return [v.plaats, `
    <div class="stat"><div><b>${v.afstand || '–'}</b><small>km</small></div><div><b>${v.lostijd ? v.lostijd.slice(0, 5) : '–'}</b><small>lostijd</small></div><div><b>${v.deelnemers || '–'}</b><small>in concours</small></div><div><b>${a.filter(x => x.prijs).length}</b><small>prijzen</small></div></div>
    <p style="color:var(--grijs);margin:8px 4px">${fmtDJ(v.datum)} · Prijs = bij de eerste derde (1:3). Te laat = meer dan 10% trager dan je snelste duif.</p>
    <div class="kaart"><table><tr><th>Duif</th><th class="n">Aankomst</th><th class="n">m/min</th><th class="n">Plaats</th><th></th></tr>
    ${a.map(x => `<tr onclick="aankomstInvoer('${id}','${x.duif}')"><td>${ringHtml(duif(x.duif)?.ring || '?')}</td><td class="n">${x.aankomst || '–'}</td><td class="n">${x.sn ? Math.round(x.sn) : '–'}</td><td class="n">${x.plaats || '–'}</td><td>${labelRes(x)}</td></tr>`).join('')}
    </table><small style="color:var(--grijs)">Tik op een regel om de aankomst of plaats in te vullen.</small></div>
    <div class="knoppen"><button class="knop licht" onclick="duifBijVlucht('${id}')">＋ Duif</button><button class="knop licht" onclick="bewerkVlucht('${id}')">Vlucht bewerken</button></div>`];
}
function bewerkVlucht(id) { const v = S.vluchten.find(x => x.id === id); formulier('Vlucht bewerken', vluchtVelden(v), f => Object.assign(v, f)); }
function aankomstInvoer(vid, pid) {
  const v = S.vluchten.find(x => x.id === vid), u = v.uitslag.find(x => x.duif === pid);
  formulier(duif(pid).ring, [
    { naam: 'aankomst', label: 'Aankomsttijd (leeg = niet thuis)', type: 'time', waarde: u.aankomst || '' },
    { naam: 'plaats', label: 'Plaats in de uitslag', type: 'number', waarde: u.plaats || '' },
  ], f => { u.aankomst = f.aankomst ? (f.aankomst.length === 5 ? f.aankomst + ':00' : f.aankomst) : null; u.plaats = f.plaats || null; });
}
function duifBijVlucht(vid) {
  const v = S.vluchten.find(x => x.id === vid);
  formulier('Duif toevoegen', [{ naam: 'duif', label: 'Duif', opties: duifOpties(d => !v.uitslag.some(u => u.duif === d.id)) }], f => { if (f.duif) v.uitslag.push({ duif: f.duif, aankomst: null, plaats: null }); });
}

let rangSort = 'gem';
function vRanglijst() {
  const l = S.duiven.map(d => ({ d, p: prestaties(d.id) })).filter(x => x.p.n >= 2);
  l.sort(rangSort === 'gem' ? (a, b) => (a.p.gem ?? 999) - (b.p.gem ?? 999) : rangSort === 'voorop' ? (a, b) => b.p.constant - a.p.constant || (a.p.gem - b.p.gem) : (a, b) => (b.p.telaat + b.p.niet) - (a.p.telaat + a.p.niet));
  return ['Beste duiven', `
    <div class="filters"><button class="${rangSort === 'gem' ? 'aan' : ''}" onclick="rangSort='gem';render()">Gem. prijs%</button><button class="${rangSort === 'voorop' ? 'aan' : ''}" onclick="rangSort='voorop';render()">Steeds voorop</button><button class="${rangSort === 'laat' ? 'aan' : ''}" onclick="rangSort='laat';render()">Vaakst te laat</button></div>
    <p style="color:var(--grijs);margin:4px">${rangSort === 'gem' ? 'Laag prijspercentage = goed (1% is helemaal vooraan). Niet thuis telt als 100%.' : rangSort === 'voorop' ? 'Hoeveel procent van de vluchten de duif prijs vloog. Constantheid boven één uitschieter.' : 'Te laat of niet thuis, opgeteld over het seizoen.'}</p>
    <div class="kaart"><table><tr><th>#</th><th>Duif</th><th class="n">Vl.</th><th class="n">Prijs</th><th class="n">Gem%</th><th class="n">Laat</th></tr>
    ${l.map((x, i) => `<tr onclick="location.hash='#/duif/${x.d.id}'"><td>${i + 1}</td><td>${ringHtml(x.d.ring)}${x.d.naam ? `<br><small style="color:var(--grijs)">${esc(x.d.naam)}</small>` : ''}</td><td class="n">${x.p.n}</td><td class="n">${x.p.prijzen} <small>(${Math.round(x.p.constant * 100)}%)</small></td><td class="n">${x.p.gem != null ? Math.round(x.p.gem) : '–'}</td><td class="n">${x.p.telaat + x.p.niet}</td></tr>`).join('')}
    </table></div>`];
}

function vMeer() {
  const t = (href, ico, titel, sub) => `<a class="tegel" href="${href}"><span>${ico}</span><b>${titel}</b><small>${sub}</small></a>`;
  const k = kostenJaar(new Date().getFullYear());
  return ['Meer', `<div class="grid2">
    ${t('#/kweek', '🥚', 'Kweek', 'Nestbakken & jongen')}
    ${t('#/gezondheid', '💉', 'Gezondheid', 'Vaccinaties & kuren')}
    ${t('#/training', '🧭', 'Africhten & trainen', `${S.trainingen.filter(x => !x.gedaan && dagenTot(x.datum) >= 0).length} gepland`)}
    ${t('#/voer', '🌾', 'Voer', `${Math.floor(voerInfo().over)} dagen voorraad`)}
    ${t('#/afspraken', '📅', 'Afspraken', `${S.afspraken.filter(a => dagenTot(a.datum) >= 0).length} komend`)}
    ${t('#/kosten', '💶', 'Kosten & winst', `Saldo ${euro(k.in + k.uit)}`)}
    ${t('#/verkoop', '🏷', 'Verkoop', `${S.duiven.filter(d => d.status === 'verkoop').length} te koop`)}
    ${t('#/eruit', '✂', 'Eruit', `${eruitVoorstellen().length} voorstellen`)}
    ${t('#/hok/Hok 1', '🏠', 'Hokken', 'Per hok bekijken')}
    ${t('#/commandos', '🎙', 'Commando\u2019s', 'Vaste spraakwoorden')}
    ${t('#/woorden', '🗣', 'Mijn woorden', `${S.snel.length} snelopdrachten`)}
    ${t('#/instellingen', '⚙', 'Instellingen', 'Locatie, meldingen')}
  </div>`];
}

// ringen die je binnenkort nodig hebt: jongen nog niet geringd + eieren in de bakken
function ringenNodig() { return S.nestbakken.reduce((a, n) => a + (n.uitgekomen ? (n.geringd ? 0 : n.jongen) : n.eieren), 0); }
function ringen(n) { S.ringen.voorraad = Math.max(0, S.ringen.voorraad + n); }
// volgend nummer in de reeks: NL-2026-1234575 -> NL-2026-1234576
function volgendeRing(r) { const m = r.match(/^(.*?)(\d+)$/); return m ? m[1] + String(+m[2] + 1).padStart(m[2].length, '0') : r; }
// nestbak ringen: elk jong krijgt het volgende ringnummer en een eigen duivenkaart met ouders
function ringNest(n) {
  if (n.geringd) return [];
  const nieuw = [];
  for (let i = 0; i < (n.jongen || 0); i++) {
    const ring = /\d$/.test(S.ringen.volgende) ? S.ringen.volgende : '';
    if (ring) {
      const d = { id: uid(), ring, naam: '', geslacht: 'D', kleur: '', status: 'vlieg', hok: 'Jongen', vader: n.vader, moeder: n.moeder, notitie: `Geringd ${fmtDJ(VANDAAG())} in nestbak ${n.nr} – geslacht nog bepalen`, prijs: 0 };
      S.duiven.push(d); nieuw.push(d);
      S.ringen.laatste.push({ ring, datum: VANDAAG(), nb: n.nr });
      S.ringen.volgende = volgendeRing(ring);
    }
    ringen(-1);
  }
  n.geringd = true;
  return nieuw;
}
function volgendeRingen(k) { const l = []; let r = S.ringen.volgende; for (let i = 0; i < k; i++) { l.push(r); r = volgendeRing(r); } return l; }
function vKweek() {
  return ['Kweek', `<div class="kaart">${S.nestbakken.map(nb => {
    const st = nestStatus(nb);
    return `<a class="rij" href="#/nestbak/${nb.nr}"><b style="width:52px">Bak ${nb.nr}</b><div class="groot">${nb.vader || nb.moeder ? `<small>${esc(duif(nb.vader)?.ring.slice(-4) || '?')} × ${esc(duif(nb.moeder)?.ring.slice(-4) || '?')}</small>` : ''}<span class="label ${st.kl}">${esc(st.t)}</span></div><span>›</span></a>`;
  }).join('')}</div>
  <div class="kaart melding ${S.ringen.voorraad < ringenNodig() ? 'rood' : S.ringen.voorraad <= S.ringen.minimum ? 'oranje' : ''}"><div class="ico">💍</div><div style="flex:1">
    <b>${S.ringen.voorraad} ringen op voorraad</b><small>Volgende: ${esc(S.ringen.volgende)}${S.ringen.laatste.length ? ' · laatst geringd: ' + esc(S.ringen.laatste.at(-1).ring) : ''}<br>${ringenNodig()} nodig voor eieren en jongen in de bakken · melding onder ${S.ringen.minimum}</small>
    <div class="knoppen"><button class="knop licht" onclick="formulier('Ringen binnen',[{naam:'n',label:'Aantal ringen',type:'number',waarde:20}],f=>ringen(f.n))">＋ Ringen binnen</button><button class="knop licht" onclick="formulier('Ringvoorraad',[{naam:'voorraad',label:'Voorraad nu',type:'number',waarde:S.ringen.voorraad},{naam:'volgende',label:'Volgende ringnummer (eerste van je reeks)',waarde:S.ringen.volgende},{naam:'minimum',label:'Melding onder',type:'number',waarde:S.ringen.minimum}],f=>Object.assign(S.ringen,f))">Instellen</button></div></div></div>
  <p style="color:var(--grijs);margin:4px">Tip: plak een QR-sticker op elke nestbak. Scannen opent direct de juiste bak. Bij “Geringd” gaan de ringen automatisch van de voorraad af.</p>`];
}
function nb(nr) { return S.nestbakken.find(x => x.nr == nr); }
function vNestbak(nr) {
  const n = nb(nr);
  if (!n) return ['Nestbak', '<div class="kaart leeg">Niet gevonden</div>'];
  const st = nestStatus(n);
  return [`Nestbak ${nr}`, `
    <div class="kaart"><h2>Koppel</h2>
      ${n.vader ? `<a class="rij" href="#/duif/${n.vader}"><div class="groot"><small>♂ Doffer</small>${ringHtml(duif(n.vader).ring)}</div></a>` : '<div class="rij"><small>Geen doffer</small></div>'}
      ${n.moeder ? `<a class="rij" href="#/duif/${n.moeder}"><div class="groot"><small>♀ Duivin</small>${ringHtml(duif(n.moeder).ring)}</div></a>` : '<div class="rij"><small>Geen duivin</small></div>'}
      <button class="knop licht vol" onclick="koppelKiezen(${nr})">Koppel wijzigen</button></div>
    <div class="kaart melding ${st.kl}"><div class="ico">🥚</div><div><b>${esc(st.t)}</b>
      <small>${n.legdatum ? `Gelegd ${fmtD(n.legdatum)} · verwachte uitkomst ${fmtD(uitkomstDatum(n))}` : ''}${n.uitgekomen ? ` · uitgekomen ${fmtD(n.uitgekomen)}` : ''}</small></div></div>
    <div class="grid2">
      <button class="knop" onclick="nestActie(${nr},'ei')">＋ Ei gelegd</button>
      <button class="knop" onclick="nestActie(${nr},'uit')">🐣 Jongen uit</button>
      <button class="knop" onclick="nestActie(${nr},'ring')">💍 Geringd</button>
      <button class="knop licht" onclick="nestActie(${nr},'leeg')">Bak leegmaken</button>
    </div>
    <div class="sectie">QR-sticker</div><div class="kaart"><span class="qr-code">DUIF:NB:${nr}</span></div>`];
}
function nestActie(nr, a) {
  const n = nb(nr);
  wijzig(() => {
    if (a === 'ei') { if (!n.eieren || n.uitgekomen) { n.legdatum = VANDAAG(); n.uitgekomen = ''; n.jongen = 0; n.geringd = false; n.eieren = 0; } n.eieren = Math.min(2, n.eieren + 1); }
    if (a === 'uit') { n.uitgekomen = VANDAAG(); n.jongen = n.eieren || 1; }
    if (a === 'ring') ringNest(n);
    if (a === 'leeg') Object.assign(n, { legdatum: '', eieren: 0, uitgekomen: '', jongen: 0, geringd: false });
  }, { ei: 'Ei genoteerd, uitkomst in de agenda', uit: 'Jongen genoteerd – ringen over 6 dagen', ring: `Geringd: ${volgendeRingen(n.jongen || 0).join(', ') || 'geen jongen'}`, leeg: 'Nestbak leeggemaakt' }[a]);
}
function koppelKiezen(nr) {
  const n = nb(nr);
  formulier(`Koppel nestbak ${nr}`, [
    { naam: 'vader', label: 'Doffer', waarde: n.vader, opties: duifOpties(d => d.geslacht === 'D') },
    { naam: 'moeder', label: 'Duivin', waarde: n.moeder, opties: duifOpties(d => d.geslacht === 'V') },
  ], f => Object.assign(n, f));
}

function vHok(naam) {
  const hokken = [...new Set(S.duiven.map(d => d.hok).filter(Boolean))];
  const l = S.duiven.filter(d => d.hok === naam && !['weg', 'verkocht'].includes(d.status));
  return [naam, `
    <div class="filters">${hokken.map(h => `<button class="${h === naam ? 'aan' : ''}" onclick="location.hash='#/hok/${encodeURIComponent(h)}'">${esc(h)}</button>`).join('')}</div>
    <button class="knop vol" onclick="nieuweKuur('${esc(naam)}')">💊 Medicatie gegeven aan dit hok</button>
    <div class="sectie">${l.length} duiven</div>
    <div class="kaart">${l.map(d => `<a class="rij" href="#/duif/${d.id}"><div class="groot">${ringHtml(d.ring)}<small>${esc(d.naam || d.kleur)}</small></div><span class="label ${STATUS[d.status][1]}">${STATUS[d.status][0]}</span></a>`).join('') || '<div class="leeg">Leeg</div>'}</div>
    <div class="kaart"><span class="qr-code">DUIF:HOK:${esc(naam)}</span><br><small>Sticker voor de hokdeur.</small></div>`];
}

function vGezondheid() {
  const vac = [...S.vaccinaties].sort((a, b) => volgendeVaccin(a).localeCompare(volgendeVaccin(b)));
  const kuren = [...S.kuren].sort((a, b) => b.start.localeCompare(a.start));
  return ['Gezondheid', `
    <div class="sectie">Vaccinaties</div><div class="kaart">${vac.map(x => { const n = dagenTot(volgendeVaccin(x)); return `
      <div class="rij"><div class="groot"><b>${esc(x.naam)}</b><small>Laatst ${fmtDJ(x.datum)} · elke ${x.herhaalDagen} dagen</small></div>
      <div class="rechts"><span class="label ${n <= 3 ? 'rood' : n <= 21 ? 'oranje' : ''}">${wanneer(n)}</span><br><button class="knop licht" style="padding:6px 10px;margin-top:4px" onclick="vaccinGedaan('${x.id}')">Vandaag gedaan</button></div></div>`; }).join('')}
      <button class="knop licht vol" onclick="nieuweVaccin()">＋ Vaccinatie</button></div>
    <div class="sectie">Kuren</div><div class="kaart">${kuren.map(k => `
      <div class="rij"><div class="groot"><b>${esc(k.naam)}</b><small>${esc(k.hok)} · ${fmtD(k.start)} t/m ${fmtD(plus(k.dagen - 1, k.start))} · wachttijd ${k.wachttijd || 0} d</small></div>
      ${kuurActief(k) ? '<span class="label blauw">loopt</span>' : ''}</div>`).join('') || '<div class="leeg">Geen kuren</div>'}
      <button class="knop licht vol" onclick="nieuweKuur()">＋ Kuur starten</button></div>`];
}
function vaccinGedaan(id) { wijzig(() => S.vaccinaties.find(x => x.id === id).datum = VANDAAG(), 'Vaccinatie genoteerd'); }
function nieuweVaccin() {
  formulier('Vaccinatie', [{ naam: 'naam', label: 'Naam', waarde: '' }, { naam: 'datum', label: 'Gegeven op', type: 'date', waarde: VANDAAG() }, { naam: 'herhaalDagen', label: 'Herhalen na (dagen)', type: 'number', waarde: 365 }],
    f => S.vaccinaties.push({ id: uid(), ...f }));
}
function nieuweKuur(hok, naam = '', dagen = 5) {
  formulier('Kuur starten', [
    { naam: 'naam', label: 'Middel / tegen', waarde: naam },
    { naam: 'hok', label: 'Hok', waarde: hok || 'Alle hokken', opties: ['Alle hokken', ...hokLijst()] },
    { naam: 'start', label: 'Start', type: 'date', waarde: VANDAAG() },
    { naam: 'dagen', label: 'Aantal dagen', type: 'number', waarde: dagen },
    { naam: 'wachttijd', label: 'Wachttijd voor de vlucht (dagen)', type: 'number', waarde: 2 },
  ], f => S.kuren.push({ id: uid(), ...f }));
}

function vTraining() {
  const l = [...S.trainingen].sort((a, b) => a.datum.localeCompare(b.datum));
  return ['Africhten & trainen', `<div class="kaart">${l.map(t => `
    <div class="rij"><div class="groot"><b>${t.afstand} km – ${fmtD(t.datum)}</b><small>${esc(t.plaats)} · ${wanneer(dagenTot(t.datum))}</small></div>
    <button class="knop ${t.gedaan ? '' : 'licht'}" style="padding:8px 12px" onclick="wijzig(()=>{const x=S.trainingen.find(y=>y.id==='${t.id}');x.gedaan=!x.gedaan})">${t.gedaan ? '✔ Gedaan' : 'Gedaan?'}</button></div>`).join('')}
    <button class="knop licht vol" onclick="nieuweTraining()">＋ Training plannen</button></div>
    <p style="color:var(--grijs);margin:4px">Op de dag zelf staat de training op het scherm Vandaag.</p>`];
}
function nieuweTraining() {
  const laatste = [...S.trainingen].sort((a, b) => b.datum.localeCompare(a.datum))[0];
  formulier('Training plannen', [{ naam: 'datum', label: 'Datum', type: 'date', waarde: plus(1) }, { naam: 'afstand', label: 'Afstand (km)', type: 'number', waarde: laatste ? Math.round(laatste.afstand * 1.5) : 5 }, { naam: 'plaats', label: 'Richting / plaats', waarde: 'Richting zuid' }],
    f => S.trainingen.push({ id: uid(), ...f, gedaan: false }));
}

function vVoer() {
  const v = S.voer, vi = voerInfo();
  return ['Voer', `
    <div class="stat"><div><b>${v.voorraad}</b><small>kg voorraad</small></div><div><b>${v.perDag}</b><small>kg per dag</small></div><div><b>${Math.floor(vi.over)}</b><small>dagen over</small></div></div>
    <div class="kaart melding ${vi.bestelBinnen <= 0 ? 'rood' : vi.bestelBinnen <= 3 ? 'oranje' : ''}" style="margin-top:10px"><div class="ico">🌾</div><div>
      <b>${vi.bestelBinnen <= 0 ? 'Nu bestellen' : `Bestellen uiterlijk ${fmtD(plus(vi.bestelBinnen))}`}</b>
      <small>Op ${fmtD(vi.opDatum)}, met ${v.levertijd} dagen levertijd en 1 dag marge.</small></div></div>
    <div class="knoppen"><button class="knop" onclick="voerBinnen()">＋ Voer binnen</button><button class="knop licht" onclick="voerInstellen()">Instellen</button></div>
    <p style="color:var(--grijs);margin:8px 4px">De app trekt elke dag automatisch het verbruik van de voorraad af (in de echte versie). Scan de streepjescode van een zak om hem toe te voegen.</p>`];
}
function voerBinnen(kg = 20, prijs = 18.5) {
  formulier('Voer binnen', [{ naam: 'kg', label: 'Kilo', type: 'number', waarde: kg }, { naam: 'prijs', label: 'Prijs (€)', type: 'number', waarde: prijs }],
    f => { S.voer.voorraad = +(S.voer.voorraad + f.kg).toFixed(1); if (f.prijs) S.kosten.push({ id: uid(), datum: VANDAAG(), omschrijving: `Voer ${f.kg} kg`, bedrag: -f.prijs, cat: 'Voer' }); });
}
function voerInstellen() {
  const v = S.voer;
  formulier('Voer instellen', [{ naam: 'voorraad', label: 'Voorraad nu (kg)', type: 'number', waarde: v.voorraad }, { naam: 'perDag', label: 'Verbruik per dag (kg)', type: 'number', waarde: v.perDag }, { naam: 'levertijd', label: 'Levertijd (dagen)', type: 'number', waarde: v.levertijd }],
    f => Object.assign(S.voer, f));
}

function vAfspraken() {
  const l = [...S.afspraken].sort((a, b) => a.datum.localeCompare(b.datum));
  return ['Afspraken', `<div class="kaart">${l.map(a => `
    <div class="rij" style="${dagenTot(a.datum) < 0 ? 'opacity:.5' : ''}"><div class="groot"><b>${esc(a.titel)}</b><small>${fmtD(a.datum)} · ${wanneer(dagenTot(a.datum))}</small></div>
    <button class="icon-btn" style="background:var(--zand);color:var(--grijs)" aria-label="Verwijderen" onclick="wijzig(()=>S.afspraken=S.afspraken.filter(x=>x.id!=='${a.id}'),'Afspraak verwijderd')">✕</button></div>`).join('') || '<div class="leeg">Geen afspraken</div>'}
    <button class="knop licht vol" onclick="formulier('Afspraak',[{naam:'titel',label:'Wat',waarde:''},{naam:'datum',label:'Datum',type:'date',waarde:plus(1)}],f=>S.afspraken.push({id:uid(),...f}))">＋ Afspraak</button></div>`];
}

function kostenJaar(j) {
  const l = S.kosten.filter(k => k.datum.startsWith(String(j)));
  return { l, in: l.filter(k => k.bedrag > 0).reduce((a, k) => a + k.bedrag, 0), uit: l.filter(k => k.bedrag < 0).reduce((a, k) => a + k.bedrag, 0) };
}
function vKosten() {
  const j = new Date().getFullYear(), k = kostenJaar(j);
  const maanden = {};
  k.l.forEach(x => { const m = x.datum.slice(0, 7); maanden[m] ??= { in: 0, uit: 0 }; maanden[m][x.bedrag > 0 ? 'in' : 'uit'] += x.bedrag; });
  const cats = {};
  k.l.filter(x => x.bedrag < 0).forEach(x => cats[x.cat] = (cats[x.cat] || 0) - x.bedrag);
  const recent = [...S.kosten].sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 12);
  return ['Kosten & winst', `
    <div class="stat"><div><b style="color:var(--groen)">${euro(k.in)}</b><small>inkomsten ${j}</small></div><div><b style="color:var(--rood)">${euro(-k.uit)}</b><small>uitgaven</small></div><div><b>${euro(k.in + k.uit)}</b><small>${k.in + k.uit >= 0 ? 'winst' : 'verlies'}</small></div></div>
    <div class="knoppen"><button class="knop" onclick="nieuwePost(-1)">＋ Uitgave</button><button class="knop licht" onclick="nieuwePost(1)">＋ Inkomst</button></div>
    <div class="sectie">Uitgaven per soort</div><div class="kaart">${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, b]) => `<div class="rij"><div class="groot">${esc(c)}</div><div class="rechts">${euro(b)}</div></div>`).join('')}</div>
    <div class="sectie">Per maand</div><div class="kaart"><table><tr><th>Maand</th><th class="n">In</th><th class="n">Uit</th><th class="n">Saldo</th></tr>
      ${Object.keys(maanden).sort().reverse().map(m => { const x = maanden[m]; return `<tr><td>${parseD(m + '-01').toLocaleDateString('nl-NL', { month: 'long' })}</td><td class="n">${euro(x.in)}</td><td class="n">${euro(-x.uit)}</td><td class="n" style="color:${x.in + x.uit >= 0 ? 'var(--groen)' : 'var(--rood)'}">${euro(x.in + x.uit)}</td></tr>`; }).join('')}</table></div>
    <div class="sectie">Laatste boekingen</div><div class="kaart">${recent.map(x => `<div class="rij"><div class="groot">${esc(x.omschrijving)}<small>${fmtDJ(x.datum)} · ${esc(x.cat)}</small></div><div class="rechts" style="color:${x.bedrag >= 0 ? 'var(--groen)' : 'var(--rood)'}">${euro(x.bedrag)}</div></div>`).join('')}</div>`];
}
function nieuwePost(teken) {
  formulier(teken < 0 ? 'Uitgave' : 'Inkomst', [
    { naam: 'omschrijving', label: 'Omschrijving', waarde: '' },
    { naam: 'bedrag', label: 'Bedrag (€)', type: 'number', waarde: '' },
    { naam: 'cat', label: 'Soort', opties: teken < 0 ? ['Voer', 'Medicatie', 'Inleg', 'Aankoop duiven', 'Hok & materiaal', 'Overig'] : ['Prijzen', 'Verkoop', 'Overig'] },
    { naam: 'datum', label: 'Datum', type: 'date', waarde: VANDAAG() },
  ], f => S.kosten.push({ id: uid(), ...f, bedrag: teken * Math.abs(f.bedrag) }));
}

function vVerkoop() {
  const l = S.duiven.filter(d => d.status === 'verkoop');
  return ['Verkoop', `<div class="kaart">${l.map(d => { const p = prestaties(d.id); return `
    <div class="rij"><a class="groot" href="#/duif/${d.id}" style="color:inherit;text-decoration:none">${ringHtml(d.ring)}<small>${esc(d.kleur)} · ${p.n ? p.prijzen + ' prijzen' : 'geen vluchten'} · v. ${esc(duif(d.vader)?.ring.slice(-4) || '?')} × m. ${esc(duif(d.moeder)?.ring.slice(-4) || '?')}</small></a>
    <div class="rechts"><b>${euro(d.prijs || 0)}</b><br><button class="knop licht" style="padding:6px 10px;margin-top:4px" onclick="deelDuif('${d.id}')">Delen</button></div></div>`; }).join('') || '<div class="leeg">Geen duiven te koop. Zet een duif op status “Verkoop”.</div>'}</div>
    <p style="color:var(--grijs);margin:4px">In de echte versie: verkoopkaart als PDF of link met QR-code, ook voor majidpigeons.com.</p>`];
}

function vEruit() {
  const v = eruitVoorstellen(), al = S.duiven.filter(d => d.status === 'eruit');
  return ['Eruit', `
    <div class="sectie">Voorstellen (jij beslist)</div><div class="kaart">${v.map(({ d, redenen }) => `
      <div class="rij"><a class="groot" href="#/duif/${d.id}" style="color:inherit;text-decoration:none">${ringHtml(d.ring)}<small>${esc(redenen.join(' · '))}</small></a>
      <button class="knop rood" style="padding:8px 12px" onclick="zetStatus('${d.id}','eruit')">Eruit</button></div>`).join('') || '<div class="leeg">Geen voorstellen</div>'}</div>
    <div class="sectie">Op de lijst “eruit”</div><div class="kaart">${al.map(d => `
      <div class="rij"><a class="groot" href="#/duif/${d.id}" style="color:inherit;text-decoration:none">${ringHtml(d.ring)}<small>${esc(d.notitie)}</small></a>
      <button class="knop licht" style="padding:8px 12px" onclick="zetStatus('${d.id}','vlieg')">Toch houden</button></div>`).join('') || '<div class="leeg">Leeg</div>'}</div>`];
}

function vInstellingen() {
  const w = S.weer;
  const perm = 'Notification' in window ? Notification.permission : 'niet ondersteund';
  return ['Instellingen', `
    <div class="kaart"><h2>Mijn hok</h2>
      ${S.demo ? '<p style="margin:0 0 8px">Je gebruikt nu voorbeeldgegevens.</p><button class="knop vol" onclick="startEigenHok()">Start met mijn eigen hok</button>' : `
      <p style="margin:0 0 4px"><b>${esc(S.inst.naam || 'Mijn hok')}</b></p>
      <small style="color:var(--grijs)">Hokken: ${hokLijst().map(esc).join(', ')} · ${S.nestbakken.length} nestbakken · ${S.duiven.length} duiven</small>
      <div class="knoppen"><button class="knop licht" onclick="hokInstellen()">Wijzigen</button><button class="knop licht" onclick="bulkDuiven()">＋ Duiven in één keer</button></div>`}</div>
    <div class="kaart"><h2>Locatie voor vorstmelding</h2>
      <p style="margin:0 0 8px">${esc(S.inst.plaats)} (${S.inst.lat.toFixed(2)}, ${S.inst.lon.toFixed(2)})</p>
      ${w ? `<table><tr><th>Dag</th><th class="n">Min</th><th class="n">Max</th></tr>${w.dagen.map((d, i) => `<tr><td>${fmtD(d)}</td><td class="n" style="${w.min[i] <= 0 ? 'color:var(--rood);font-weight:700' : ''}">${w.min[i].toFixed(1)} °C</td><td class="n">${w.max[i].toFixed(1)} °C</td></tr>`).join('')}</table>` : '<p class="leeg">Nog geen weer geladen</p>'}
      <div class="knoppen"><button class="knop" onclick="mijnLocatie()">📍 Gebruik mijn locatie</button><button class="knop licht" onclick="haalWeer(true)">Vernieuwen</button></div></div>
    <div class="kaart"><h2>Meldingen</h2><p style="margin:0">Status: <b>${perm === 'granted' ? 'aan' : perm === 'denied' ? 'geblokkeerd' : perm}</b></p>
      <div class="knoppen"><button class="knop" onclick="meldingenAan()">Meldingen aanzetten</button><button class="knop licht" onclick="wijzig(()=>S.inst.vorstTest=!S.inst.vorstTest,S.inst.vorstTest?'Vorsttest uit':'Vorsttest aan');vorstPush()">${S.inst.vorstTest ? 'Vorsttest uitzetten' : 'Vorst testen'}</button></div>
      <small style="color:var(--grijs)">iPhone: meldingen werken alleen als de app op het beginscherm staat.</small></div>
    <div class="kaart"><h2>Back-up</h2><p style="margin:0 0 8px;color:var(--grijs)">Je gegevens staan alleen op dit toestel. Maak regelmatig een back-up en bewaar die ergens anders (mail, WhatsApp naar jezelf, Google Drive). Met dezelfde back-up zet je alles over naar je computer of een nieuwe telefoon.</p>
      <p style="margin:0 0 8px">Laatste back-up: <b>${S.laatsteBackup ? fmtDJ(S.laatsteBackup) + ' (' + wanneer(dagenTot(S.laatsteBackup)) + ')' : 'nog nooit'}</b></p>
      <div class="knoppen">${navigator.canShare ? '<button class="knop" onclick="exporteer(true)">📤 Back-up delen</button>' : ''}<button class="knop ${navigator.canShare ? 'licht' : ''}" onclick="exporteer()">💾 Back-up opslaan</button></div>
      <button class="knop licht vol" style="margin-top:8px" onclick="$('#backupbestand').click()">📥 Back-up terugzetten</button>
      <input type="file" id="backupbestand" accept=".json,application/json" hidden onchange="importeer(this.files[0]);this.value=''"></div>
    <div class="kaart"><h2>Voorbeeldgegevens</h2><p style="margin:0 0 8px;color:var(--grijs)">Om te oefenen of de app te laten zien.</p>
      <button class="knop rood" onclick="if(confirm('Alle gegevens op dit toestel vervangen door de voorbeeldgegevens? Maak eerst een back-up als je je eigen gegevens wilt houden.')){S=demo();bewaar();location.reload()}">Voorbeeldgegevens laden</button></div>`];
}
function mijnLocatie() {
  if (!navigator.geolocation) return toast('Locatie niet beschikbaar');
  navigator.geolocation.getCurrentPosition(p => {
    S.inst.lat = +p.coords.latitude.toFixed(2); S.inst.lon = +p.coords.longitude.toFixed(2); S.inst.plaats = 'Mijn hok'; bewaar(); haalWeer(true); render(); toast('Locatie opgeslagen');
  }, () => toast('Geen toestemming voor locatie'));
}
async function meldingenAan() {
  if (!('Notification' in window)) return toast('Deze browser ondersteunt geen meldingen');
  await Notification.requestPermission(); render(); vorstPush();
}
async function exporteer(delen) {
  S.laatsteBackup = VANDAAG(); bewaar();
  const naam = `duivenapp-backup-${VANDAAG()}.json`;
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  if (delen && navigator.canShare) {
    const file = new File([blob], naam, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'DuivenApp back-up' }); render(); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = naam; a.click();
  render(); toast('Back-up opgeslagen: ' + naam);
}
async function importeer(bestand) {
  if (!bestand) return;
  let x;
  try { x = JSON.parse(await bestand.text()); } catch { return toast('Dit is geen geldig back-upbestand'); }
  if (!x || !Array.isArray(x.duiven) || !x.inst) return toast('Dit is geen DuivenApp-back-up');
  const wanneerGemaakt = x.laatsteBackup ? ` van ${fmtDJ(x.laatsteBackup)}` : '';
  if (!confirm(`Back-up${wanneerGemaakt} terugzetten met ${x.duiven.length} duiven en ${x.vluchten?.length || 0} vluchten?\n\nAlles wat nu op dit toestel staat, wordt vervangen.`)) return;
  localStorage.setItem(KEY, JSON.stringify(x));
  location.hash = '#/vandaag'; location.reload();
}

// ---------- eigen hok ----------
function startEigenHok() {
  if (S.demo === false && S.duiven.length && !confirm('Je hebt al eigen gegevens. Opnieuw beginnen wist alles. Doorgaan?')) return;
  formulier('Start met mijn eigen hok', [
    { naam: 'naam', label: 'Naam van je hok / hokgemeenschap', waarde: '' },
    { naam: 'hokken', label: 'Je hokken (gescheiden door komma\'s)', waarde: 'Hok 1, Hok 2, Kweekhok, Jongen' },
    { naam: 'bakken', label: 'Aantal nestbakken', type: 'number', waarde: 12 },
    { naam: 'volgende', label: 'Eerstvolgende ringnummer (van je ringenreeks)', waarde: `NL-${new Date().getFullYear()}-` },
    { naam: 'ringen', label: 'Ringen op voorraad', type: 'number', waarde: 0 },
    { naam: 'voer', label: 'Voer op voorraad (kg)', type: 'number', waarde: 0 },
    { naam: 'perDag', label: 'Voerverbruik per dag (kg, alle duiven samen)', type: 'number', waarde: 0 },
    { naam: 'levertijd', label: 'Levertijd voer (dagen)', type: 'number', waarde: 3 },
  ], f => {
    const oud = S;
    S = {
      versie: 4, demo: false,
      duiven: [], vluchten: [], kosten: [], vaccinaties: [], kuren: [], trainingen: [], afspraken: [], producten: {},
      nestbakken: Array.from({ length: Math.max(0, Math.min(200, Math.round(f.bakken))) }, (_, i) => ({ nr: i + 1, vader: '', moeder: '', legdatum: '', eieren: 0, uitgekomen: '', jongen: 0, geringd: false })),
      voer: { voorraad: f.voer, perDag: f.perDag, levertijd: f.levertijd || 3, prijsPerKg: 0 },
      ringen: { voorraad: Math.round(f.ringen), minimum: 10, volgende: f.volgende.trim().toUpperCase(), laatste: [] },
      inst: { naam: f.naam.trim() || 'Mijn hok', plaats: 'Mijn hok', lat: oud.inst.lat, lon: oud.inst.lon, vorstTest: false, hokken: f.hokken.split(',').map(h => h.trim()).filter(Boolean) },
      weer: null, woorden: [], snel: oud.snel.filter(x => x.actie !== 'zin'), commandos: oud.commandos || {}, logboek: [],
    };
    setTimeout(() => { location.hash = '#/instellingen'; toast('Je eigen hok staat klaar. Zet nu je locatie en voeg je duiven toe.'); });
  });
}
function hokInstellen() {
  formulier('Mijn hok', [
    { naam: 'naam', label: 'Naam van je hok', waarde: S.inst.naam || '' },
    { naam: 'hokken', label: 'Hokken (gescheiden door komma\'s)', waarde: hokLijst().join(', ') },
    { naam: 'bakken', label: 'Aantal nestbakken', type: 'number', waarde: S.nestbakken.length },
  ], f => {
    S.inst.naam = f.naam.trim(); S.inst.hokken = f.hokken.split(',').map(h => h.trim()).filter(Boolean);
    const n = Math.max(0, Math.min(200, Math.round(f.bakken)));
    while (S.nestbakken.length < n) S.nestbakken.push({ nr: S.nestbakken.length + 1, vader: '', moeder: '', legdatum: '', eieren: 0, uitgekomen: '', jongen: 0, geringd: false });
    // alleen lege bakken achteraan weghalen
    while (S.nestbakken.length > n) { const b = S.nestbakken.at(-1); if (b.vader || b.moeder || b.eieren || b.uitgekomen) break; S.nestbakken.pop(); }
  });
}

// ---------- duiven in één keer ----------
const KLEUREN = ['blauwgebandeerd', 'donkerkras', 'lichtkras', 'kras', 'blauw', 'rood', 'roodkras', 'schimmel', 'vaal', 'zwart', 'wit', 'geschelpt', 'gekrast', 'lichtgeschelpt'];
function leesRegel(r) {
  const delen = (/[\t;|]/.test(r) ? r.split(/[\t;|]/) : r.split(',')).map(x => x.trim()).filter(Boolean);
  if (!delen.length) return null;
  let ringRuw = delen.shift().toUpperCase().replace(/\s+/g, ' ');
  // alleen cijfers met jaartal ervoor: "20251190001"
  const los = ringRuw.match(/^((?:19|20)\d{9,10})\b\s*(.*)$/);
  if (los) { ringRuw = los[1]; if (los[2]) delen.unshift(...los[2].split(' ')); }
  // "NL 2024 1234567 D blauw" in één veld: extra woorden afsplitsen
  const m0 = ringRuw.match(/^([A-Z]{2,3}[\s\-\/]*)?((?:\d{2}|\d{4})[\s\-\/]+)?\d{3,8}/);
  if (!los && m0 && m0[0].length < ringRuw.length) { delen.unshift(...ringRuw.slice(m0[0].length).trim().split(' ')); ringRuw = m0[0]; }
  let m = ringRuw.match(/^([A-Z]{2,3})?[\s\-\/]*(?:(\d{4}|\d{2})[\s\-\/]+)?(\d{3,8})$/);
  if (/^(19|20)\d{9,10}$/.test(ringRuw)) m = [ringRuw, '', ringRuw.slice(0, 4), ringRuw.slice(4)];
  if (!m) return { fout: `Ringnummer niet herkend: “${r.trim()}”` };
  const land = m[1] || 'NL', jaar = !m[2] ? String(new Date().getFullYear()) : m[2].length === 2 ? '20' + m[2] : m[2];
  const d = { ring: `${land}-${jaar}-${m[3]}`, geslacht: '', kleur: '', naam: '' };
  for (const w of delen) {
    const l = w.toLowerCase();
    if (!d.geslacht && /^(d|doffer|m|man|♂|mannetje)$/.test(l)) d.geslacht = 'D';
    else if (!d.geslacht && /^(v|duivin|w|vrouw|pop|♀|vrouwtje)$/.test(l)) d.geslacht = 'V';
    else if (!d.kleur && KLEUREN.some(k => l.replace(/\s/g, '') === k || l.startsWith(k))) d.kleur = w[0].toUpperCase() + w.slice(1).toLowerCase();
    else if (!d.naam && !/^\d+$/.test(w)) d.naam = w;
  }
  return d;
}
function bulkDuiven() {
  dialoog(`<h3>Duiven in één keer toevoegen</h3>
    <p style="color:var(--grijs);margin-top:0;font-size:15px">Eén duif per regel. Plak uit Excel of je oude programma, of typ/spreek in. Alleen het ringnummer is nodig; geslacht (D/V), kleur en naam mogen erachter.<br><small>Bijv. “NL-2024-1234567 D blauw Kanon” · “24 1234568 V” · “BE 2023 6012345”</small></p>
    <textarea id="bulk" rows="7" placeholder="NL-2024-1234567 D blauw&#10;NL-2024-1234568 V kras"></textarea>
    <div class="grid2"><div><label>Status</label><select id="bulkstatus">${Object.entries(STATUS).filter(([k]) => !['weg', 'verkocht'].includes(k)).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></div>
    <div><label>Hok</label><select id="bulkhok">${hokLijst().map(h => `<option>${esc(h)}</option>`).join('')}</select></div></div>
    <div id="bulkvoorbeeld"></div>
    <div class="knoppen"><button class="knop licht" onclick="sluit()">Annuleren</button><button class="knop" id="bulkok" disabled>Toevoegen</button></div>`);
  let goed = [];
  const lees = () => {
    const bestaand = new Set(S.duiven.map(d => cijfers(d.ring)));
    const gezien = new Set(); goed = []; const rijen = [];
    for (const r of $('#bulk').value.split('\n')) {
      if (!r.trim() || /ring/i.test(r) && !/\d{3}/.test(r)) continue; // lege regels en kopregels overslaan
      const d = leesRegel(r);
      if (!d) continue;
      if (d.fout) { rijen.push(`<div style="color:var(--rood)">✖ ${esc(d.fout)}</div>`); continue; }
      const c = cijfers(d.ring);
      if (bestaand.has(c) || gezien.has(c)) { rijen.push(`<div style="color:var(--grijs)">↷ ${esc(d.ring)} staat er al</div>`); continue; }
      gezien.add(c); goed.push(d);
      rijen.push(`<div>✔ ${ringHtml(d.ring)} <small>${d.geslacht === 'D' ? '♂' : d.geslacht === 'V' ? '♀' : '?'} ${esc(d.kleur)} ${esc(d.naam)}</small></div>`);
    }
    $('#bulkvoorbeeld').innerHTML = rijen.length ? `<div class="kaart" style="max-height:220px;overflow:auto;margin-top:8px;font-size:15px">${rijen.join('')}</div>` : '';
    $('#bulkok').disabled = !goed.length;
    $('#bulkok').textContent = goed.length ? `${goed.length} duiven toevoegen` : 'Toevoegen';
  };
  $('#bulk').oninput = lees;
  $('#bulkok').onclick = () => {
    const status = $('#bulkstatus').value, hok = $('#bulkhok').value, l = goed;
    sluit();
    wijzig(() => l.forEach(d => S.duiven.push({ id: uid(), ring: d.ring, naam: d.naam, geslacht: d.geslacht || 'D', kleur: d.kleur, status, hok, vader: '', moeder: '', notitie: d.geslacht ? '' : 'Geslacht nog controleren', prijs: 0 })), `${l.length} duiven toegevoegd`);
  };
}

// ---------- spraak-assistent ----------
const NW = { nul: 0, een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12, dertien: 13, veertien: 14, vijftien: 15, zestien: 16, zeventien: 17, achttien: 18, negentien: 19, twintig: 20, dertig: 30, veertig: 40, vijftig: 50, zestig: 60 };
function getallen(t) {
  t = t.toLowerCase().replace(/één/g, 'een').replace(/ë/g, 'e');
  t = t.replace(/duizend/g, ' duizend ');
  t = t.replace(/(een|twee|drie|vier|vijf|zes|zeven|acht|negen)en(twintig|dertig|veertig|vijftig)/g, (m, a, b) => ' ' + (NW[a] + NW[b]) + ' ');
  t = t.replace(/\b(nul|een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|twintig|dertig|veertig|vijftig|zestig)\b/g, m => NW[m]);
  // "2 duizend 25" -> 2025
  return t.replace(/\b(\d)\s*duizend\s*(\d{1,3})?\b/g, (m, a, b) => String(a * 1000 + (+b || 0))).replace(/\s+/g, ' ');
}
const zoekRing = z => S.duiven.filter(d => d.status !== 'weg' && cijfers(d.ring).endsWith(z));
function tijdUit(t) {
  let m = t.match(/(\d{1,2})\s*(?:uur|u|h|:|\.)\s*(\d{1,2})?(?:\s*[:.]\s*(\d{2}))?/) || t.match(/\b(\d{1,2})\s+(\d{2})\b/);
  if (!m) return null;
  const h = +m[1], mi = +(m[2] || 0), s = +(m[3] || 0);
  if (h > 23 || mi > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* Geeft terug: {wat, doe} | {fout} | {antwoord} | {kies:[duiven], sleutel, vraag}
   keuzes: {sleutel: duif-id} voor eerder gemaakte keuzes bij dubbele eindnummers */
// Synoniemen en spreektaal -> vaste woorden, zodat je het op veel manieren kunt zeggen
const SYNONIEMEN = [
  [/\b(kwijt voor|van de hand gedaan voor|weggedaan voor|verpatst|opgebracht)\b/g, 'verkocht'],
  [/\b(betaald|neergelegd|neergeteld|ervoor gegeven|kostte|kocht|aangeschaft|op de kop getikt)\b/g, 'gekocht'],
  [/\b(gearriveerd|geklokt|aangekomen|gevallen|valt|viel|geland|op de klep)\b/g, 'binnen'],
  [/\b(nestschotel|schotel|broedbak|nestkast|kweekbak)\b/g, 'nestbak'],
  [/\b(papa|pa|paps)\b/g, 'vader'], [/\b(mama|ma|mams)\b/g, 'moeder'],
  [/\bopa\b/g, 'grootvader'], [/\boma\b/g, 'grootmoeder'], [/\bgroot\s+(vader|moeder|ouders?)\b/g, 'groot$1'],
  [/\b(eitjes?|eiers)\b/g, 'eieren'], [/\b(kuurtje|behandeling|medicatie|medicijnen)\b/g, 'kuur'],
  [/\b(graan|mengeling|korrels?)\b/g, 'voer'], [/\b(kilos?|kilogram)\b/g, 'kilo'],
  [/\b(piepers?|jonkies|jongen duiven|jonge duiven|jongeduiven)\b/g, 'jongen'],
  [/\b(manneke|mannetje|doffertje)\b/g, 'doffer'], [/\b(vrouwtje|popje|pop)\b/g, 'duivin'],
];
let gesprekDuif = null; // de duif waar het gesprek als laatste over ging ("en zijn moeder?")
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function normaliseer(ruw) {
  let t = getallen(ruw.replace(/(\d)\.(?=\d{3}\b)/g, '$1'));
  t = t.replace(/[,!;:](?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/\b\d(?: \d){2,}\b/g, m => m.replace(/ /g, ''));            // "1 2 3 4" -> "1234"
  t = t.replace(/\b(eh+m?|uh+m?|even|ff|effe|nou|zeg|hoor|eens|es|alsjeblieft|graag|dus|toch|oke|okay|ok)\b/g, ' ');
  // eigen woorden van de gebruiker ("de kampioen" = 4011234)
  for (const w of S.woorden || []) {
    const z = getallen(w.zeg).replace(/[,!;:?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (z) t = t.replace(new RegExp(`(^|\\s)${reEsc(z)}(?=\\s|$)`, 'g'), (m, a) => a + getallen(w.betekent));
  }
  for (const [re, w] of SYNONIEMEN) t = t.replace(re, w);
  // duivennamen -> ringcijfers ("Kanon is binnen")
  [...S.duiven].filter(d => d.naam && d.naam.length >= 3).sort((a, b) => b.naam.length - a.naam.length)
    .forEach(d => { const n = d.naam.toLowerCase(); if (t.includes(n)) t = t.split(n).join(cijfers(d.ring).slice(-7)); });
  return t.replace(/\s+/g, ' ').trim();
}
const KLEURWOORD = /\b(blauwgebandeerd|donkerkras|kras|blauw|rood|rode|schimmel|vaal|zwart|wit)\w*/;

function begrijp(ruw, keuzes = {}, diepte = 0) {
  let t = normaliseer(ruw);
  if (!t) return { fout: 'Ik heb niets gehoord.' };

  // commando: vast woord + gegevens in vaste volgorde ("binnen 1234 14 32")
  if (diepte < 3) {
    const c = commandoZin(t);
    if (c) {
      const r = begrijp(c.zin, keuzes, 9); // 9 = geen commando's/snelopdrachten opnieuw
      if (r.fout) return { fout: `Commando “${c.woord}”: ${r.fout} Zeg: ${c.woord} ${c.cmd.vorm}`, suggesties: [] };
      const label = `<small style="color:var(--grijs)">Commando <b>${esc(c.woord)}</b></small><br>`;
      if (r.wat) r.wat = label + r.wat;
      if (r.antwoord) { r.antwoord = label + (r.html ? r.antwoord : esc(r.antwoord)); r.html = true; }
      return r;
    }
  }
  // snelopdracht: een vast woord voert een vaste handeling uit
  if (diepte < 3) {
    const sn = (S.snel || []).find(x => {
      const z = normaliseer(x.zeg);
      return z && (t === z || (new RegExp(`(^|\\s)${reEsc(z)}(\\s|$)`).test(t) && t.split(' ').length <= z.split(' ').length + 2));
    });
    if (sn) return snelopdracht(sn, keuzes, diepte);
  }

  // Geen ringnummer genoemd? Dan bedoel je de open duivenkaart, de duif van daarnet, of "die blauwe".
  if (!/\b\d{3,7}\b/.test(t) && !/^(hoeveel|aantal)/.test(t)) {
    let ctx = keuzes.duif ? duif(keuzes.duif) : null;
    const kw = t.match(KLEURWOORD);
    const kleurVerwijzing = kw && new RegExp(`\\b(die|deze|de|dat)\\s+${kw[0]}`).test(t) && !/nieuwe?|zet|voeg/.test(t);
    const vraag = /(^|\s)(wanneer|welke?|hoe|wat|wie|waar|hoeveel)\b|\?$|^en\b/.test(t);
    const verwijst = /\b(die duif|deze duif|hij|zij|ze|hem|haar|zijn|die|deze)\b|^en\b/.test(t) ||
      (vraag && /grootvader|grootmoeder|grootouder|vader|moeder|ouders|gekocht|verkocht|presteer|vloog|binnen|\bzit\b|afstamming|stamboom/.test(t));
    if (!ctx && verwijst && !kleurVerwijzing) ctx = (route().naam === 'duif' && duif(route().arg)) || duif(gesprekDuif);
    if (!ctx && kleurVerwijzing) {
      const stam = kw[1].replace(/^rode$/, 'rood');
      let l = S.duiven.filter(d => !['weg', 'verkocht'].includes(d.status) && d.kleur.toLowerCase().includes(stam));
      if (l.some(d => d.kleur.toLowerCase() === stam)) l = l.filter(d => d.kleur.toLowerCase() === stam); // "blauw" = blauw, niet blauwgebandeerd
      if (l.length === 1) ctx = l[0];
      else if (l.length > 1) return { kies: l, sleutel: 'duif', vraag: `Welke ${stam}e duif bedoel je?` };
    }
    if (ctx) {
      keuzes = { ...keuzes, duif: ctx.id };
      const z = cijfers(ctx.ring).slice(-7);
      const t2 = t.replace(/\b(die duif|deze duif|hij|zij|ze|hem|die|deze)\b/, z);
      t = t2 !== t ? t2 : t + ' ' + z;
    }
  }
  // Zoek een duif op eindcijfers; bij twijfel vragen we het (sleutel onthoudt de keuze)
  const vind = (z, sleutel, filter = () => true) => {
    if (keuzes[sleutel]) { if (sleutel === 'duif') gesprekDuif = keuzes[sleutel]; return { d: duif(keuzes[sleutel]) }; }
    let l = zoekRing(z);
    if (l.length > 1 && l.some(filter)) l = l.filter(filter);
    if (!l.length) return { r: { fout: `Geen duif gevonden met ring eindigend op ${z}.` } };
    if (l.length > 1) return { r: { kies: l, sleutel, vraag: `Welke duif bedoel je met ${z}?` } };
    if (sleutel === 'duif') gesprekDuif = l[0].id;
    return { d: l[0] };
  };
  const metDuif = (z, fn) => { const x = vind(z, 'duif'); return x.r || fn(x.d); };

  // verplaatsen: "1234 naar hok 2", "zet 0457 bij de kweek", "die naar de jongen"
  let m = t.match(/(\d{3,7})\s*(?:moet\s*|gaat\s*|mag\s*)?(?:naar|in|bij|op)\s*(?:de\s*|het\s*)?(hok\s*\d+|kweek\w*|jong\w*|vlieg\w*)/);
  if (m && (keuzes.duif || zoekRing(m[1]).length)) return metDuif(m[1], d => {
    const w = m[2], nieuw = /^hok/.test(w) ? { hok: 'Hok ' + w.match(/\d+/)[0] } : /^kweek/.test(w) ? { status: 'kweek', hok: 'Kweekhok' } : /^jong/.test(w) ? { hok: 'Jongen' } : { status: 'vlieg' };
    return { wat: `${ringHtml(d.ring)} ${nieuw.hok ? `naar <b>${nieuw.hok}</b>` : ''}${nieuw.status ? ` · status <b>${STATUS[nieuw.status][0]}</b>` : ''}`, doe: () => Object.assign(d, nieuw) };
  });
  // eruit: "4417 moet eruit want ..." (voor "weg", want "moet weg" = eruit)
  m = t.match(/(\d{3,7})\s*(?:moet\s*(?:er\s*uit|eruit|weg)|er\s*uit|eruit)\s*(?:want|omdat|reden|vanwege)?\s*(.*)/);
  if (m) return metDuif(m[1], d => ({ wat: `${ringHtml(d.ring)} op de lijst <b>eruit</b>${m[2] ? ` – reden: ${esc(m[2])}` : ''}`, doe: () => { d.status = 'eruit'; if (m[2]) d.notitie = (d.notitie ? d.notitie + ' · ' : '') + m[2]; } }));
  // weg: "1301 is niet teruggekomen", "0460 is dood"
  m = t.match(/(\d{3,7}).*?\b(weg|verloren|vermist|dood|gestorven|overleden|niet terug\s?gekomen|niet thuis\s?gekomen|kwijt|gepakt door \w+)\b/);
  if (m && !/\?$/.test(t)) return metDuif(m[1], d => ({ wat: `${ringHtml(d.ring)} op <b>weg</b> zetten (${esc(m[2])})`, doe: () => { d.status = 'weg'; d.notitie = (d.notitie ? d.notitie + ' · ' : '') + `${m[2]} (${fmtDJ(VANDAAG())})`; } }));

  // nieuwe duif: "zet duif 2025 1234567 erin, de ouders zijn 4417 en 4552"
  if (/\b(zet|voeg|nieuwe?|registreer)\b/.test(t) && !/verkoop|te koop|eruit|binnen/.test(t) && /\d{3}/.test(t)) {
    const [ringDeel, ...rest] = t.split(/\b(?=ouders?|vader|moeder|uit|van)\b/);
    const ouderDeel = rest.join(' ');
    const tokens = (ringDeel.match(/\d+/g) || []);
    let alle = tokens.join(''), jaar = String(new Date().getFullYear()), nr = alle;
    if (/^(19|20)\d\d/.test(alle) && alle.length >= 9) { jaar = alle.slice(0, 4); nr = alle.slice(4); }
    else if (tokens.length >= 2 && /^(19|20)?\d\d$/.test(tokens[0])) { jaar = tokens[0].length === 2 ? '20' + tokens[0] : tokens[0]; nr = tokens.slice(1).join(''); }
    if (nr.length < 4) return { fout: 'Ik heb het ringnummer niet goed verstaan. Zeg bijv. “zet duif 2025 1234567 erin”.' };
    const land = /\bbe\b|belg/.test(ringDeel) ? 'BE' : /\bdv\b|duits/.test(ringDeel) ? 'DV' : 'NL';
    const ring = `${land}-${jaar}-${nr}`;
    if (S.duiven.some(d => cijfers(d.ring) === cijfers(ring))) return { fout: `${ring} staat al in de app.` };

    // ouders
    let vz = ouderDeel.match(/vader\s*(?:is\s*)?(\d{3,7})/)?.[1], mz = ouderDeel.match(/moeder\s*(?:is\s*)?(\d{3,7})/)?.[1];
    if (!vz && !mz) { const n = ouderDeel.match(/\d{3,7}/g) || []; [vz, mz] = n; }
    let vader = null, moeder = null;
    if (vz) { const x = vind(vz, 'vader', d => d.geslacht === 'D'); if (x.r) return x.r; vader = x.d; }
    if (mz) { const x = vind(mz, 'moeder', d => d.geslacht === 'V'); if (x.r) return x.r; moeder = x.d; }
    if (vader && moeder && vader.geslacht === 'V' && moeder.geslacht === 'D') [vader, moeder] = [moeder, vader]; // volgorde maakt niet uit
    if (vader && vader.geslacht !== 'D') return { fout: `${vader.ring} staat als duivin in de app en kan geen vader zijn.` };
    if (moeder && moeder.geslacht !== 'V') return { fout: `${moeder.ring} staat als doffer in de app en kan geen moeder zijn.` };

    const geslacht = /duivin|pop\b/.test(t) ? 'V' : /doffer|man\b/.test(t) ? 'D' : '';
    const kleuren = ['blauwgebandeerd', 'donkerkras', 'kras', 'blauw', 'rood', 'schimmel', 'vaal', 'zwart', 'wit'];
    const kl = kleuren.find(k => t.includes(k));
    const kleur = kl ? kl[0].toUpperCase() + kl.slice(1) : '';
    const jong = /jong/.test(t) || jaar === String(new Date().getFullYear());
    const nieuw = { id: uid(), ring, naam: '', geslacht: geslacht || 'D', kleur, status: /kweek/.test(t) ? 'kweek' : 'vlieg', hok: jong ? 'Jongen' : 'Hok 1', vader: vader?.id || '', moeder: moeder?.id || '', notitie: geslacht ? '' : 'Geslacht nog controleren', prijs: 0 };
    return {
      wat: `Nieuwe duif ${ringHtml(ring)}<br>Vader: ${vader ? ringHtml(vader.ring) + (vader.naam ? ' ' + esc(vader.naam) : '') : '<i>onbekend</i>'}<br>Moeder: ${moeder ? ringHtml(moeder.ring) + (moeder.naam ? ' ' + esc(moeder.naam) : '') : '<i>onbekend</i>'}<br><small>${geslacht ? (geslacht === 'D' ? 'Doffer' : 'Duivin') : 'Geslacht niet genoemd, later aanpassen'}${kleur ? ' · ' + kleur : ''} · ${nieuw.hok}</small>`,
      doe: () => { S.duiven.push(nieuw); setTimeout(() => location.hash = '#/duif/' + nieuw.id); },
    };
  }

  // vragen
  if (/(^|\s)(wanneer|welke?|hoe|wat|wie|waar|hoeveel|aantal|geef|toon|zoek|vertel)\b|\?$|^en\b/.test(t)) {
    const rz = t.match(/\b(\d{3,7})\b/)?.[1];

    // tellen: "hoeveel doffers heb ik?", "hoeveel blauwe jongen?"
    if (/^(hoeveel|aantal)/.test(t) && /\b(duiven|doffers?|duivinnen|duivin|jongen|jonge|vliegduiven|kweekduiven)\b/.test(t) && !/voer|ring|euro|geld/.test(t)) {
      let l = S.duiven; const wat = [];
      const st = /verkocht/.test(t) ? 'verkocht' : /\bweg\b|verloren|dood/.test(t) ? 'weg' : /te koop|verkoop/.test(t) ? 'verkoop' : /eruit/.test(t) ? 'eruit' : /kweek/.test(t) ? 'kweek' : /vlieg/.test(t) ? 'vlieg' : '';
      l = st ? l.filter(d => d.status === st) : l.filter(d => !['weg', 'verkocht'].includes(d.status));
      if (st) wat.push(STATUS[st][0].toLowerCase());
      if (/doffer/.test(t)) { l = l.filter(d => d.geslacht === 'D'); wat.push('doffers'); }
      else if (/duivin/.test(t)) { l = l.filter(d => d.geslacht === 'V'); wat.push('duivinnen'); }
      if (/jong/.test(t)) { l = l.filter(d => d.hok === 'Jongen' || d.ring.includes('-' + new Date().getFullYear() + '-')); wat.push('jongen'); }
      const kw = t.match(KLEURWOORD); if (kw) { const stam = kw[1].replace(/^rode$/, 'rood'); l = l.filter(d => d.kleur.toLowerCase().includes(stam)); wat.unshift({ blauw: 'blauwe', rood: 'rode', wit: 'witte', zwart: 'zwarte', vaal: 'vale', kras: 'krasse' }[stam] || stam); if (wat.length === 1) wat.push('duiven'); }
      return { antwoord: `Je hebt <b>${l.length}</b> ${wat.join(' ') || 'duiven'}${st ? '' : ' (zonder verkochte en weggevallen)'}.` + (l.length && l.length <= 12 ? `<br><small>${l.map(d => ringHtml(d.ring)).join(' · ')}</small>` : ''), html: true };
    }
    // hoe laat binnen: "hoe laat was 1234 binnen?"
    if (rz && /hoe laat|aankomst|binnen/.test(t)) {
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d;
      const r = [...S.vluchten].sort((a, b) => b.datum.localeCompare(a.datum)).map(v => ({ v, u: analyse(v).find(y => y.duif === d.id) })).find(o => o.u);
      if (!r) return { antwoord: `${ringHtml(d.ring)} heeft nog geen vlucht gevlogen.`, html: true };
      return { antwoord: `${ringHtml(d.ring)} op ${esc(r.v.plaats)} (${fmtD(r.v.datum)}): ${r.u.aankomst ? `binnen om <b>${r.u.aankomst}</b>${r.u.sn ? `, ${Math.round(r.u.sn)} m/min` : ''}${r.u.plaats ? `, ${r.u.plaats}e` : ''}` : r.u.onderweg ? 'nog niet binnen' : '<b>niet thuisgekomen</b>'}.`, html: true };
    }
    const kaartLink = d => `<br><a href="#/duif/${d.id}" onclick="sluit()">Open duivenkaart ›</a>`;
    const kort = o => o ? `${ringHtml(o.ring)}${o.naam ? ' “' + esc(o.naam) + '”' : ''}` : '<i>onbekend</i>';

    // aankoop/verkoop: "hoe duur heb ik 1234 gekocht?", "wanneer heb ik die duif verkocht?"
    if (/duur|gekost|gekocht|verkocht|aankoop|betaald|opgebracht|prijs/.test(t) && !/voer|ring/.test(t)) {
      const wilVerkoop = /verkocht|opgebracht/.test(t), wilAankoop = /gekocht|gekost|aankoop|betaald/.test(t) || !wilVerkoop;
      if (!rz) {
        const l = S.duiven.filter(d => wilVerkoop && !wilAankoop ? d.verkoopprijs : d.aankoopprijs);
        const veld = wilVerkoop && !wilAankoop ? 'verkoopprijs' : 'aankoopprijs';
        return { antwoord: (/^hoeveel/.test(t) ? `${veld === 'verkoopprijs' ? 'Verkocht' : 'Gekocht'}: ${l.length} duif/duiven.` : `Over welke duif gaat het? Noem de laatste cijfers van de ring, of open eerst de duivenkaart.`) + (l.length ? `<br><small>${veld === 'verkoopprijs' ? 'Verkocht' : 'Gekocht'}: ${l.map(d => `${ringHtml(d.ring)} ${euro(d[veld])}`).join(' · ')} – samen ${euro(l.reduce((a, d) => a + d[veld], 0))}</small>` : ''), html: true };
      }
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d, lijnen = [];
      const aankoop = () => lijnen.push(d.aankoopprijs ? `Gekocht voor <b>${euro(d.aankoopprijs)}</b>${d.gekochtVan ? ` van ${esc(d.gekochtVan)}` : ''}${d.aankoopdatum ? ` op <b>${fmtDJ(d.aankoopdatum)}</b>` : ''}.` : `Niet gekocht${d.vader || d.moeder ? ` – eigen kweek uit ${kortRing(d.vader)} × ${kortRing(d.moeder)}` : ' (of aankoop nog niet ingevuld)'}.`);
      const verkoop = () => lijnen.push(d.verkoopprijs ? `Verkocht voor <b>${euro(d.verkoopprijs)}</b>${d.verkochtAan ? ` aan ${esc(d.verkochtAan)}` : ''}${d.verkoopdatum ? ` op <b>${fmtDJ(d.verkoopdatum)}</b>` : ''}.` + (d.aankoopprijs ? ` ${d.verkoopprijs >= d.aankoopprijs ? 'Winst' : 'Verlies'}: ${euro(Math.abs(d.verkoopprijs - d.aankoopprijs))}.` : '') : d.status === 'verkoop' ? `Nog niet verkocht – staat te koop voor ${euro(d.prijs || 0)}.` : 'Niet verkocht.');
      lijnen.push(`<b>${kort(d)}</b>`);
      if (wilVerkoop && !/gekocht|gekost|aankoop|betaald/.test(t)) { verkoop(); if (d.aankoopprijs) aankoop(); }
      else { aankoop(); if (wilVerkoop || d.verkoopprijs) verkoop(); }
      return { antwoord: lijnen.join('<br>') + kaartLink(d), html: true };
    }

    // waar zit de duif: "in welke bak zit 1234?", "in welk hok zit 1234?", "waar zit 1234?"
    if (rz && /\b(bak|nestbak|hok|zit|zitten)\b/.test(t)) {
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d, lijnen = [];
      const wilBak = /bak/.test(t) || !/hok/.test(t), wilHok = /hok/.test(t) || !/bak/.test(t);
      if (wilHok) lijnen.push(`${kort(d)} zit in <b>${esc(d.hok || 'geen hok ingevuld')}</b>.`);
      if (wilBak) {
        const bakken = S.nestbakken.filter(n => n.vader === d.id || n.moeder === d.id);
        if (bakken.length) bakken.forEach(n => {
          const partner = duif(n.vader === d.id ? n.moeder : n.vader);
          lijnen.push(`${kort(d)} zit in <b>nestbak ${n.nr}</b>${partner ? ` met ${kort(partner)}` : ''} – ${esc(nestStatus(n).t)}. <a href="#/nestbak/${n.nr}" onclick="sluit()">Open bak ›</a>`);
        });
        else lijnen.push(`${kort(d)} zit in geen nestbak.`);
      }
      return { antwoord: lijnen.join('<br>') + kaartLink(d), html: true };
    }

    // grootouders: "wie is de grootvader van vaderskant van 1234?"
    const q = t.replace(/groot\s+(vader|moeder|ouders?)/g, 'groot$1').replace(/\bopa\b/g, 'grootvader').replace(/\boma\b/g, 'grootmoeder');
    if (rz && /grootvader|grootmoeder|grootouder/.test(q)) {
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d;
      const zijde = q.replace(/groot(vader|moeder|ouders?)/g, '');
      let vk = /vaders|van (de )?vader|vaderlijk|vader ?kant|vaderzijde/.test(zijde), mk = /moeders|van (de )?moeder|moederlijk|moeder ?kant|moederzijde/.test(zijde);
      if (!vk && !mk) vk = mk = true;
      let gv = /grootvader/.test(q), gm = /grootmoeder/.test(q);
      if (/grootouder/.test(q) || (!gv && !gm)) gv = gm = true;
      const lijnen = [`<b>Grootouders van ${ringHtml(d.ring)}</b>`];
      const kant = (ouderId, naamKant) => {
        const o = duif(ouderId);
        if (!o) { lijnen.push(`${naamKant}: ${ouderId ? '' : 'ouder onbekend'}`); return; }
        if (gv) lijnen.push(`Grootvader ${naamKant}: ${kort(duif(o.vader))} <small>(vader van ${ringHtml(o.ring)})</small>`);
        if (gm) lijnen.push(`Grootmoeder ${naamKant}: ${kort(duif(o.moeder))} <small>(moeder van ${ringHtml(o.ring)})</small>`);
      };
      if (vk) kant(d.vader, 'vaderskant');
      if (mk) kant(d.moeder, 'moederskant');
      return { antwoord: lijnen.join('<br>') + kaartLink(d), html: true };
    }
    // afstamming: "waar komt 1234 uit?", "wie zijn de ouders van 1234?", "en zijn moeder?"
    if (rz && /uit\b|ouders?|vader|moeder|afstamming|stamboom|komt|lijn|bloed/.test(t)) {
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d;
      const kort1 = o => o ? `${ringHtml(o.ring)}${o.naam ? ' “' + esc(o.naam) + '”' : ''}` : '<i>onbekend</i>';
      const een = /vader/.test(t) !== /moeder/.test(t) && !/ouders|afstamming|stamboom|uit\b|komt/.test(t);
      if (een) {
        const rol = /vader/.test(t) ? 'vader' : 'moeder', o = duif(d[rol]);
        if (!o) return { antwoord: `De ${rol} van ${kort1(d)} is niet bekend.`, html: true };
        const po = prestaties(o.id);
        return { antwoord: `De ${rol} van ${kort1(d)} is <b>${kort1(o)}</b> <small>${esc(o.kleur)}${po.n ? ` · ${po.prijzen} prijzen uit ${po.n}` : ''}</small>` + (duif(o.vader) || duif(o.moeder) ? `<br><small>Zelf uit ${kort1(duif(o.vader))} × ${kort1(duif(o.moeder))}</small>` : '') + `<br><a href="#/duif/${o.id}" onclick="sluit()">Open kaart van de ${rol} ›</a>`, html: true };
      }
      const regel = (id, rol) => { const o = duif(id); return o ? `${rol}: ${ringHtml(o.ring)}${o.naam ? ' “' + esc(o.naam) + '”' : ''} <small>${esc(o.kleur)}${prestaties(o.id).n ? ' · ' + prestaties(o.id).prijzen + ' prijzen' : ''}</small>` : `${rol}: <i>onbekend</i>`; };
      const lijnen = [`<b>Afstamming ${ringHtml(d.ring)}</b>`, regel(d.vader, '♂ Vader')];
      const groot = o => { if (o && (duif(o.vader) || duif(o.moeder))) lijnen.push('&nbsp;&nbsp;' + regel(o.vader, 'grootvader'), '&nbsp;&nbsp;' + regel(o.moeder, 'grootmoeder')); };
      groot(duif(d.vader));
      lijnen.push(regel(d.moeder, '♀ Moeder'));
      groot(duif(d.moeder));
      const broers = S.duiven.filter(b => b.id !== d.id && b.vader && b.vader === d.vader && b.moeder === d.moeder);
      if (broers.length) lijnen.push(`Volle broers/zussen: ${broers.map(b => ringHtml(b.ring)).join(', ')}`);
      return { antwoord: lijnen.join('<br>') + `<br><a href="#/duif/${d.id}" onclick="sluit()">Open duivenkaart ›</a>`, html: true };
    }
    // prestaties: "wat heeft 1234 gepresteerd?", "hoe vloog 1234?"
    if (rz && /presteer|gepresteerd|vloog|gevlogen|resultat|uitslag|prijzen|hoe deed|doet/.test(t)) {
      const x = vind(rz, 'duif'); if (x.r) return x.r;
      const d = x.d, p = prestaties(d.id);
      if (!p.n) return { antwoord: `${ringHtml(d.ring)} heeft nog geen vluchten gevlogen.`, html: true };
      const rang = S.duiven.map(o => ({ o, p: prestaties(o.id) })).filter(o => o.p.n >= 2).sort((a, b) => a.p.gem - b.p.gem).findIndex(o => o.o.id === d.id) + 1;
      const res = S.vluchten.map(v => ({ v, r: analyse(v).find(y => y.duif === d.id) })).filter(o => o.r && !o.r.onderweg).sort((a, b) => b.v.datum.localeCompare(a.v.datum));
      const beste = res.filter(o => o.r.plaats).sort((a, b) => a.r.pct - b.r.pct)[0];
      return {
        antwoord: `<b>${ringHtml(d.ring)}${d.naam ? ' “' + esc(d.naam) + '”' : ''}</b><br>${p.prijzen} prijzen uit ${p.n} vluchten (${Math.round(p.constant * 100)}%), gem. ${Math.round(p.gem)}%${rang ? `, nr. ${rang} van je hok` : ''}.` +
          (beste ? `<br>Beste: ${beste.r.plaats}e van ${beste.v.deelnemers} op ${esc(beste.v.plaats)} (${beste.v.afstand} km).` : '') +
          (p.telaat + p.niet ? `<br>${p.telaat}× te laat, ${p.niet}× niet thuis.` : '<br>Nooit te laat.') +
          `<br><small>${res.slice(0, 4).map(o => `${esc(o.v.plaats)}: ${o.r.plaats ? o.r.plaats + 'e' : 'niet thuis'}`).join(' · ')}</small>` +
          `<br><a href="#/duif/${d.id}" onclick="sluit()">Open duivenkaart ›</a>`, html: true,
      };
    }
    if (/gering|laatste ring|volgende ring|ringnummer/.test(t) && !rz) {
      const l = S.ringen.laatste.slice(-3).reverse();
      if (!l.length) return { antwoord: `Er is nog niets geringd in de app. Het volgende ringnummer is <b>${esc(S.ringen.volgende)}</b>.`, html: true };
      const d = S.duiven.find(x => x.ring === l[0].ring);
      return { antwoord: `Laatst geringd: <b>${ringHtml(l[0].ring)}</b> op ${fmtD(l[0].datum)} in nestbak ${l[0].nb}${d ? ` (uit ${kortRing(d.vader)} × ${kortRing(d.moeder)})` : ''}.` +
        (l.length > 1 ? `<br><small>Daarvoor: ${l.slice(1).map(x => esc(x.ring)).join(', ')}</small>` : '') +
        `<br>Volgende ring: <b>${esc(S.ringen.volgende)}</b> · nog ${S.ringen.voorraad} op voorraad.` + (d ? `<br><a href="#/duif/${d.id}" onclick="sluit()">Open duivenkaart ›</a>` : ''), html: true };
    }
    if (/ringen|ring\b/.test(t) && !rz) { const nd = ringenNodig(); return { antwoord: `Je hebt nog <b>${S.ringen.voorraad} ringen</b>. Voor de eieren en jongen in de bakken heb je er ${nd} nodig${S.ringen.voorraad < nd ? ' – <b>te weinig, nu bestellen</b>' : S.ringen.voorraad - nd <= S.ringen.minimum ? `, daarna blijven er ${S.ringen.voorraad - nd} over – bijbestellen` : `, daarna blijven er ${S.ringen.voorraad - nd} over`}.`, html: true }; }
    if (/voer/.test(t)) { const vi = voerInfo(); return { antwoord: `Je hebt nog <b>${S.voer.voorraad} kg voer</b>, bij ${S.voer.perDag} kg per dag genoeg voor ${Math.floor(vi.over)} dagen. Het is op ${fmtD(vi.opDatum)}. ${vi.bestelBinnen <= 0 ? '<b>Bestel vandaag</b>' : 'Bestel uiterlijk ' + fmtD(plus(vi.bestelBinnen))} (levertijd ${S.voer.levertijd} dagen).`, html: true }; }
    if (/laat/.test(t)) {
      const l = S.duiven.map(d => ({ d, p: prestaties(d.id) })).filter(x => x.p.telaat + x.p.niet).sort((a, b) => (b.p.telaat + b.p.niet) - (a.p.telaat + a.p.niet)).slice(0, 5);
      return { antwoord: 'Vaakst te laat of niet thuis:<br>' + l.map(x => `${ringHtml(x.d.ring)} – ${x.p.telaat}× te laat, ${x.p.niet}× niet thuis`).join('<br>'), html: true };
    }
    if (/beste|voorop|goed/.test(t)) {
      const l = S.duiven.map(d => ({ d, p: prestaties(d.id) })).filter(x => x.p.n >= 2).sort((a, b) => a.p.gem - b.p.gem).slice(0, 5);
      return { antwoord: 'Beste duiven (gem. prijs%):<br>' + l.map((x, i) => `${i + 1}. ${ringHtml(x.d.ring)} – ${Math.round(x.p.gem)}%, ${x.p.prijzen}/${x.p.n} prijs`).join('<br>'), html: true };
    }
    if (/vaccin|ent/.test(t)) {
      const x = [...S.vaccinaties].sort((a, b) => volgendeVaccin(a).localeCompare(volgendeVaccin(b)))[0];
      return { antwoord: `Eerstvolgende: ${x.naam} ${wanneer(dagenTot(volgendeVaccin(x)))} (${fmtD(volgendeVaccin(x))}).` };
    }
    return { fout: 'Die vraag ken ik (nog) niet.', suggesties: suggesties(t) };
  }

  // aankomst: "1234 is binnen 14 uur 32"
  m = t.match(/(\d{3,7})\s*(?:is\s*)?(?:binnen|thuis|aangekomen|geklokt)(.*)/);
  if (m) return metDuif(m[1], d => {
    const tijd = tijdUit(m[2]) || tijdNu();
    let v = S.vluchten.find(x => x.datum === VANDAAG());
    return {
      wat: `Duif ${ringHtml(d.ring)} binnen om <b>${tijd}</b>, vlucht <b>${v ? esc(v.plaats) : 'van vandaag (nieuw, plaats en afstand later invullen)'}</b>`,
      doe: () => {
        if (!v) { v = { id: uid(), plaats: 'Vlucht van vandaag', afstand: 0, datum: VANDAAG(), lostijd: '', deelnemers: 0, uitslag: [] }; S.vluchten.push(v); }
        let u = v.uitslag.find(x => x.duif === d.id);
        if (!u) { u = { duif: d.id, aankomst: null, plaats: null }; v.uitslag.push(u); }
        u.aankomst = tijd;
      },
    };
  });

  // nestbak
  m = t.match(/nest\s*bak\s*(\d+)/);
  if (m) {
    const n = nb(m[1]);
    if (!n) return { fout: `Nestbak ${m[1]} bestaat niet.` };
    const ei = t.match(/(\d)?\s*(?:ei|eieren|eitje)/);
    if (/gering/.test(t)) { if (n.geringd) return { fout: `Nestbak ${n.nr} is al geringd.` }; if (!n.jongen) return { fout: `In nestbak ${n.nr} zitten nog geen jongen.` }; return { wat: `Nestbak ${n.nr}: ${n.jongen} jong(en) ringen met <b>${volgendeRingen(n.jongen).join(', ')}</b><br><small>Ouders ${kortRing(n.vader)} × ${kortRing(n.moeder)} · ringvoorraad wordt ${Math.max(0, S.ringen.voorraad - n.jongen)}</small>`, doe: () => ringNest(n) }; }
    if (/uit|jong/.test(t)) { const j = +(t.match(/(\d)\s*jong/)?.[1] || n.eieren || 1); return { wat: `Nestbak ${n.nr}: ${j} jong(en) uit vandaag – ringen vanaf ${fmtD(plus(6))}`, doe: () => { n.uitgekomen = VANDAAG(); n.jongen = j; } }; }
    if (ei) { const k = +(ei[1] || 1); return { wat: `Nestbak ${n.nr}: ${k} ei(eren) gelegd vandaag – verwachte uitkomst <b>${fmtD(plus(18))}</b>`, doe: () => Object.assign(n, { eieren: k, legdatum: VANDAAG(), uitgekomen: '', jongen: 0, geringd: false }) }; }
    if (/leeg/.test(t)) return { wat: `Nestbak ${n.nr} leegmaken`, doe: () => Object.assign(n, { legdatum: '', eieren: 0, uitgekomen: '', jongen: 0, geringd: false }) };
    return { fout: `Wat is er met nestbak ${n.nr}? Zeg bijv. “twee eieren”, “jongen uit” of “geringd”.` };
  }

  // kuur
  m = t.match(/kuur\s+([a-z]+)/) || t.match(/([a-z]+)\s*kuur/);
  if (m && /kuur/.test(t)) {
    const naam = t.split(' ').find(w => w.length > 2 && !/^\d/.test(w) && !/^(kuur|gestart|begonnen|start|starten|dagen?|hok|alle|hokken|tegen|voor|met|gegeven|vandaag|een|de|het|in|op|van|heb|ik|we|is)$/.test(w)) || 'onbekend';
    const dagen = +(t.match(/(\d+)\s*dag/)?.[1] || 5);
    const hok = t.match(/hok\s*(\d+)/) ? 'Hok ' + t.match(/hok\s*(\d+)/)[1] : 'Alle hokken';
    return { wat: `Kuur <b>${esc(naam)}</b> gestart vandaag, ${dagen} dagen, ${hok}. Herinnering elke dag, wachttijd 2 dagen.`, doe: () => S.kuren.push({ id: uid(), naam, hok, start: VANDAAG(), dagen, wachttijd: 2 }) };
  }

  // voer: "20 kilo voer gekocht 18 euro"
  m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:kilo|kg)/);
  if (m && /voer/.test(t)) {
    const kg = parseFloat(m[1].replace(',', '.'));
    const e = t.match(/(\d+(?:[.,]\d+)?)\s*(?:euro|€)/);
    const prijs = e ? parseFloat(e[1].replace(',', '.')) : 0;
    const over = (S.voer.voorraad + kg) / S.voer.perDag;
    return {
      wat: `${kg} kg voer erbij${prijs ? `, ${euro(prijs)} bij de kosten` : ''}. Nieuwe voorraad ${S.voer.voorraad + kg} kg, genoeg tot ${fmtD(plus(Math.floor(over)))}.`,
      doe: () => { S.voer.voorraad = +(S.voer.voorraad + kg).toFixed(1); if (prijs) S.kosten.push({ id: uid(), datum: VANDAAG(), omschrijving: `Voer ${kg} kg`, bedrag: -prijs, cat: 'Voer' }); },
    };
  }

  // ringen binnen: "dertig ringen gekocht"
  m = t.match(/(\d+)\s*ringen?\b/);
  if (m && /gekocht|binnen|erbij|besteld|gehaald/.test(t)) { const n = +m[1]; return { wat: `${n} ringen erbij – voorraad wordt <b>${S.ringen.voorraad + n}</b>`, doe: () => ringen(n) }; }

  // aankoop: "1234 gekocht voor 500 euro van de markt"
  m = t.match(/(\d{3,7})\s*(?:heb ik\s*)?(?:is\s*)?gekocht.*?(\d+(?:[.,]\d+)?)\s*(?:euro|€)(?:.*?\b(?:van|bij|op)\s+(.+))?/);
  if (m && !/voer|ring/.test(t)) return metDuif(m[1], d => {
    const bedrag = parseFloat(m[2].replace(',', '.')), van = (m[3]?.trim() || '').replace(/^1 /, 'een ');
    return { wat: `${ringHtml(d.ring)} gekocht voor <b>${euro(bedrag)}</b>${van ? ` van ${esc(van)}` : ''}, vandaag – ook bij de kosten`, doe: () => { Object.assign(d, { aankoopprijs: bedrag, gekochtVan: van, aankoopdatum: VANDAAG() }); S.kosten.push({ id: uid(), datum: VANDAAG(), omschrijving: 'Aankoop ' + d.ring, bedrag: -bedrag, cat: 'Aankoop duiven' }); } };
  });

  // verkocht: "1234 verkocht voor 400 euro aan Jan"
  m = t.match(/(\d{3,7})\s*(?:heb ik\s*)?(?:is\s*)?verkocht.*?(\d+(?:[.,]\d+)?)\s*(?:euro|€)(?:.*?\b(?:aan|naar)\s+(.+))?/);
  if (m) return metDuif(m[1], d => {
    const bedrag = parseFloat(m[2].replace(',', '.')), aan = (m[3]?.trim() || '').replace(/^1 /, 'een ');
    return { wat: `${ringHtml(d.ring)} <b>verkocht</b> voor <b>${euro(bedrag)}</b>${aan ? ` aan ${esc(aan)}` : ''}, vandaag – bij de inkomsten${d.aankoopprijs ? ` (gekocht voor ${euro(d.aankoopprijs)})` : ''}`, doe: () => { Object.assign(d, { status: 'verkocht', verkoopprijs: bedrag, verkochtAan: aan, verkoopdatum: VANDAAG() }); S.kosten.push({ id: uid(), datum: VANDAAG(), omschrijving: 'Verkoop ' + d.ring, bedrag, cat: 'Verkoop' }); } };
  });

  // verkooplijst
  m = t.match(/(\d{3,7}).*(verkoop|te koop)/);
  if (m) return metDuif(m[1], d => { const p = t.match(/(\d+)\s*euro/); return { wat: `${ringHtml(d.ring)} naar de <b>verkooplijst</b>${p ? ` voor ${euro(+p[1])}` : ''}`, doe: () => { d.status = 'verkoop'; if (p) d.prijs = +p[1]; } }; });

  return { fout: 'Dat heb ik niet begrepen.', suggesties: suggesties(t) };
}

// ---------- commando's ----------
// Elk commando: standaardwoorden, de vorm (voor het spiekbriefje) en hoe het naar een gewone zin vertaald wordt.
const RING = /^(\d{3,7})\b\s*(.*)$/;
const COMMANDOS = [
  { key: 'binnen', naam: 'Aankomst klokken', woorden: ['binnen', 'klok'], vorm: 'ring tijd', vb: '1234 14 32', zin: r => { const m = r.match(RING); return m && `${m[1]} is binnen ${m[2]}`; } },
  { key: 'tijd', naam: 'Hoe laat was hij binnen', woorden: ['tijd'], vorm: 'ring', vb: '1234', zin: r => { const m = r.match(RING); return m && `hoe laat was ${m[1]} binnen`; } },
  { key: 'ei', naam: 'Ei(eren) gelegd', woorden: ['ei', 'eieren'], vorm: 'nestbak [aantal]', vb: '3 2', zin: r => { const m = r.match(/^(\d{1,2})\b\s*(\d)?/); return m && `nestbak ${m[1]} ${m[2] || 1} eieren`; } },
  { key: 'uit', naam: 'Jongen uit', woorden: ['uit'], vorm: 'nestbak [aantal]', vb: '2', zin: r => { const m = r.match(/^(\d{1,2})\b\s*(\d)?/); return m && `nestbak ${m[1]} ${m[2] ? m[2] + ' ' : ''}jongen uit`; } },
  { key: 'ring', naam: 'Jongen ringen', woorden: ['ring'], vorm: 'nestbak', vb: '2', zin: r => { const m = r.match(/^(\d{1,2})\b/); return m && `nestbak ${m[1]} geringd`; } },
  { key: 'leeg', naam: 'Nestbak leegmaken', woorden: ['leeg'], vorm: 'nestbak', vb: '4', zin: r => { const m = r.match(/^(\d{1,2})\b/); return m && `nestbak ${m[1]} leeg`; } },
  { key: 'kuur', naam: 'Kuur starten', woorden: ['kuur'], vorm: '[hok nr] middel [dagen]', vb: 'hok 2 tricho 5', zin: r => {
      const hok = r.match(/hok\s*(\d+)/)?.[1]; const rest = r.replace(/hok\s*\d+/, '').trim();
      const dagen = rest.match(/(\d+)\s*(?:dagen?)?\s*$/)?.[1]; const middel = rest.replace(/(\d+)\s*(?:dagen?)?\s*$/, '').trim();
      return middel && `${hok ? 'hok ' + hok + ' ' : ''}kuur ${middel} ${dagen || 5} dagen`; } },
  { key: 'naar', naam: 'Verplaatsen', woorden: ['naar', 'verplaats'], vorm: 'ring hok/kweek/jongen', vb: '1234 hok 2', zin: r => { const m = r.match(RING); return m && m[2] && `${m[1]} naar ${m[2]}`; } },
  { key: 'eruit', naam: 'Op de lijst eruit', woorden: ['eruit'], vorm: 'ring [reden]', vb: '4417 te oud', zin: r => { const m = r.match(RING); return m && `${m[1]} moet eruit ${m[2]}`; } },
  { key: 'weg', naam: 'Weg (verloren/dood)', woorden: ['weg', 'kwijt'], vorm: 'ring [reden]', vb: '1301 niet teruggekomen', zin: r => { const m = r.match(RING); return m && `${m[1]} is ${m[2] || 'weg'}`; } },
  { key: 'tekoop', naam: 'Te koop zetten', woorden: ['te koop'], vorm: 'ring [prijs]', vb: '0533 350', zin: r => { const m = r.match(RING); return m && `${m[1]} te koop${m[2] ? ' ' + m[2].replace(/\D+$/, '') + ' euro' : ''}`; } },
  { key: 'verkocht', naam: 'Verkocht', woorden: ['verkocht'], vorm: 'ring bedrag [aan wie]', vb: '0460 400 Jan', zin: r => { const m = r.match(/^(\d{3,7})\s+(\d+(?:[.,]\d+)?)\s*(?:euro)?\s*(?:aan\s+)?(.*)$/); return m && `${m[1]} verkocht voor ${m[2]} euro${m[3] ? ' aan ' + m[3] : ''}`; } },
  { key: 'gekocht', naam: 'Gekocht', woorden: ['gekocht'], vorm: 'ring bedrag [van wie]', vb: '1238 300 markt', zin: r => { const m = r.match(/^(\d{3,7})\s+(\d+(?:[.,]\d+)?)\s*(?:euro)?\s*(?:van\s+)?(.*)$/); return m && `${m[1]} gekocht voor ${m[2]} euro${m[3] ? ' van ' + m[3] : ''}`; } },
  { key: 'prijs', naam: 'Aankoop/verkoop opvragen', woorden: ['prijs'], vorm: 'ring', vb: '7781', zin: r => { const m = r.match(RING); return m && `hoe duur heb ik ${m[1]} gekocht of verkocht`; } },
  { key: 'nieuw', naam: 'Nieuwe duif', woorden: ['nieuw', 'nieuwe duif'], vorm: '[jaar] ring [ouders vader moeder]', vb: '2025 1234567 ouders 4417 4552', zin: r => /^\d/.test(r) && `zet duif ${r.replace(/\bouders\s+(\d+)\s+(\d+)/, 'de ouders zijn $1 en $2')} erin` },
  { key: 'ouders', naam: 'Afstamming', woorden: ['ouders', 'afstamming'], vorm: 'ring', vb: '1238', zin: r => { const m = r.match(RING); return m && `waar komt ${m[1]} uit`; } },
  { key: 'groot', naam: 'Grootouders', woorden: ['groot'], vorm: 'ring [vaderskant/moederskant]', vb: '1238 vaderskant', zin: r => { const m = r.match(RING); return m && `wie zijn de grootouders ${m[2] ? 'van ' + m[2] + ' ' : ''}van ${m[1]}`; } },
  { key: 'uitslag', naam: 'Prestaties', woorden: ['uitslag', 'prestatie'], vorm: 'ring', vb: '0457', zin: r => { const m = r.match(RING); return m && `wat heeft ${m[1]} gepresteerd`; } },
  { key: 'waar', naam: 'Waar zit de duif', woorden: ['waar'], vorm: 'ring', vb: '1234', zin: r => { const m = r.match(/^(\d{3,7})$/); return m && `waar zit ${m[1]}`; } },
  { key: 'voer', naam: 'Voer binnen', woorden: ['voer'], vorm: 'kilo [euro]', vb: '20 18', zin: r => { const m = r.match(/^(\d+(?:[.,]\d+)?)\s*(?:kilo)?\s*(?:(\d+(?:[.,]\d+)?)\s*(?:euro)?)?$/); return m && `${m[1]} kilo voer gekocht${m[2] ? ' ' + m[2] + ' euro' : ''}`; } },
  { key: 'ringen', naam: 'Ringen binnen', woorden: ['ringen'], vorm: 'aantal', vb: '30', zin: r => { const m = r.match(/^(\d+)$/); return m && `${m[1]} ringen gekocht`; } },
];
const cmdWoorden = c => (S.commandos[c.key]?.length ? S.commandos[c.key] : c.woorden);
// Herken "woord + gegevens"; alleen als de gegevens in de juiste vorm staan, anders gaat de zin naar de vrije herkenning.
function commandoZin(t) {
  const kandidaten = [];
  for (const c of COMMANDOS) for (const w of cmdWoorden(c)) {
    const z = normaliseer(w);
    if (z && t.startsWith(z + ' ')) kandidaten.push({ c, w, z });
  }
  kandidaten.sort((a, b) => b.z.length - a.z.length); // langste woord eerst ("te koop" voor "te")
  for (const { c, w, z } of kandidaten) {
    const zin = c.zin(t.slice(z.length).trim());
    if (zin) return { zin, woord: w, cmd: c };
  }
  return null;
}

function vCommandos() {
  return ['Commando’s', `
    <p style="color:var(--grijs);margin:0 4px 10px">Zeg het commandowoord, dan de gegevens in deze volgorde. Tik op ✎ om je eigen woord te kiezen. Gewone zinnen blijven ook werken.</p>
    <div class="kaart" id="spiek"><table><tr><th>Zeg</th><th>Dan</th><th></th></tr>
    ${COMMANDOS.map(c => `<tr><td><b>${cmdWoorden(c).map(esc).join(' / ')}</b> <span style="color:var(--grijs)">${esc(c.vorm)}</span><br><small style="color:var(--grijs)">bijv. “${esc(cmdWoorden(c)[0])} ${esc(c.vb)}”</small></td><td>${esc(c.naam)}</td>
      <td><button class="icon-btn geen-print" style="background:var(--zand);color:var(--grijs)" aria-label="Woord wijzigen" onclick="commandoWijzigen('${c.key}')">✎</button></td></tr>`).join('')}
    ${S.snel.map(x => `<tr><td><b>${esc(x.zeg)}</b></td><td>${esc(x.actie === 'zin' ? x.zin : ACTIES[x.actie])}</td><td></td></tr>`).join('')}
    </table></div>
    <div class="knoppen geen-print"><button class="knop" onclick="window.print()">🖨 Spiekbriefje afdrukken</button><a class="knop licht" href="#/woorden">Snelopdrachten & eigen woorden</a></div>
    <p style="color:var(--grijs);margin:8px 4px" class="geen-print">[ ] = mag je weglaten. Ringnummers: de laatste cijfers zijn genoeg.</p>`];
}
function commandoWijzigen(key) {
  const c = COMMANDOS.find(x => x.key === key);
  formulier(c.naam, [
    { naam: 'woorden', label: `Woord(en) voor “${c.naam}”, gescheiden door komma's. Leeg = standaard (${c.woorden.join(', ')})`, waarde: (S.commandos[key] || c.woorden).join(', ') },
  ], f => {
    const l = f.woorden.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
    if (!l.length || l.join() === c.woorden.join()) delete S.commandos[key]; else S.commandos[key] = l;
  });
}

// ---------- snelopdrachten ----------
const ACTIES = {
  inkorven: 'Inkorven: alle vliegduiven in de vlucht van vandaag',
  voeren: 'Gevoerd: dagportie van de voorraad af',
  water: 'Water ververst (afvinken)',
  schoon: 'Hok schoongemaakt (afvinken)',
  ronde: 'Ochtendronde: meldingen van vandaag voorlezen',
  zin: 'Een of meer zinnen uitvoeren',
};
const DAGTAKEN = { voeren: '🌾 Gevoerd', water: '💧 Water ververst', schoon: '🧹 Hok schoon' };
const tijdKort = () => new Date().toTimeString().slice(0, 5);
const vandaagGedaan = taak => S.logboek.find(l => l.datum === VANDAAG() && l.taak === taak);
function logTaak(taak, tekst) { S.logboek.push({ datum: VANDAAG(), tijd: tijdKort(), taak, tekst }); S.logboek = S.logboek.slice(-500); }
function doeTaak(taak) {
  if (taak === 'voeren') S.voer.voorraad = Math.max(0, +(S.voer.voorraad - S.voer.perDag).toFixed(1));
  logTaak(taak, DAGTAKEN[taak]);
}

function snelopdracht(sn, keuzes, diepte) {
  const kop = `<b>“${esc(sn.zeg)}”</b><br>`;
  switch (sn.actie) {
    case 'inkorven': {
      const kuurHokken = S.kuren.filter(k => k.start <= VANDAAG() && plus(k.dagen + (k.wachttijd || 0), k.start) > VANDAAG()).map(k => k.hok);
      const alle = S.duiven.filter(d => d.status === 'vlieg');
      const geblokt = alle.filter(d => kuurHokken.includes(d.hok) || kuurHokken.includes('Alle hokken'));
      const mee = alle.filter(d => !geblokt.includes(d));
      let v = S.vluchten.find(x => x.datum === VANDAAG());
      return {
        wat: kop + `${mee.length} vliegduiven inkorven voor ${v ? esc(v.plaats) : 'de vlucht van vandaag (nieuw)'}.` + (geblokt.length ? `<br><small style="color:var(--rood)">Niet mee (kuur/wachttijd): ${geblokt.map(d => esc(d.ring.slice(-4))).join(', ')}</small>` : ''),
        doe: () => {
          if (!v) { v = { id: uid(), plaats: 'Vlucht van vandaag', afstand: 0, datum: VANDAAG(), lostijd: '', deelnemers: 0, uitslag: [] }; S.vluchten.push(v); }
          mee.forEach(d => { if (!v.uitslag.some(u => u.duif === d.id)) v.uitslag.push({ duif: d.id, aankomst: null, plaats: null }); });
          logTaak('inkorven', `Ingekorfd: ${mee.length} duiven`);
        },
      };
    }
    case 'voeren': case 'water': case 'schoon': {
      const al = vandaagGedaan(sn.actie);
      if (al) return { antwoord: `${DAGTAKEN[sn.actie]} staat vandaag al afgevinkt (${al.tijd}).` };
      return { wat: kop + DAGTAKEN[sn.actie] + ` om ${tijdKort()}` + (sn.actie === 'voeren' ? `<br><small>${S.voer.perDag} kg van de voorraad af → nog ${Math.max(0, +(S.voer.voorraad - S.voer.perDag).toFixed(1))} kg</small>` : ''), doe: () => doeTaak(sn.actie) };
    }
    case 'ronde': {
      const m = meldingen();
      const tekst = m.length ? `Goedemorgen. Er zijn ${m.length} punten. ` + m.map(x => x.titel.replace('−', 'min ')).join('. ') + '.' : 'Goedemorgen. Er is niets dringends vandaag.';
      return { antwoord: kop + (m.length ? m.map(x => `${x.ico} ${esc(x.titel)}`).join('<br>') : 'Niets dringends vandaag 👍'), html: true, spreek: tekst };
    }
    case 'zin': {
      const delen = (sn.zin || '').split(';').map(x => x.trim()).filter(Boolean);
      if (!delen.length) return { fout: `Snelopdracht “${sn.zeg}” heeft nog geen zin om uit te voeren.` };
      const res = delen.map(z => begrijp(z, keuzes, diepte + 1));
      const fout = res.find(r => r.fout); if (fout) return { fout: `Snelopdracht “${sn.zeg}”: ${fout.fout}` };
      const kies = res.find(r => r.kies); if (kies) return kies;
      if (res.length === 1 && res[0].antwoord) return { ...res[0], antwoord: kop + res[0].antwoord, html: true };
      if (res.every(r => r.doe)) return { wat: kop + res.map(r => r.wat).join('<br>'), doe: () => res.forEach(r => r.doe()) };
      return { antwoord: kop + res.map(r => r.antwoord || r.wat).join('<br>'), html: true };
    }
  }
  return { fout: 'Onbekende snelopdracht.' };
}

function vWoorden() {
  return ['Mijn woorden', `
    <p style="color:var(--grijs);margin:0 4px 10px">Leer de app je eigen woorden. Alles werkt zonder internet en zonder AI.</p>
    <div class="sectie">Snelopdrachten – één woord, vaste handeling</div>
    <div class="kaart">${S.snel.map(x => `
      <div class="rij"><div class="groot"><b>“${esc(x.zeg)}”</b><small>${esc(x.actie === 'zin' ? '→ ' + x.zin : ACTIES[x.actie])}</small></div>
      <button class="icon-btn" style="background:var(--zand);color:var(--grijs)" aria-label="Wijzigen" onclick="snelBewerken('${x.id}')">✎</button>
      <button class="icon-btn" style="background:var(--zand);color:var(--grijs)" aria-label="Verwijderen" onclick="wijzig(()=>S.snel=S.snel.filter(y=>y.id!=='${x.id}'),'Snelopdracht verwijderd')">✕</button></div>`).join('') || '<div class="leeg">Nog geen snelopdrachten</div>'}
      <button class="knop licht vol" onclick="snelBewerken()">＋ Snelopdracht</button></div>
    <div class="sectie">Eigen woorden – “als ik dit zeg, bedoel ik dat”</div>
    <div class="kaart">${S.woorden.map(x => `
      <div class="rij"><div class="groot"><b>“${esc(x.zeg)}”</b><small>= ${esc(x.betekent)}</small></div>
      <button class="icon-btn" style="background:var(--zand);color:var(--grijs)" aria-label="Verwijderen" onclick="wijzig(()=>S.woorden=S.woorden.filter(y=>y.id!=='${x.id}'),'Woord verwijderd')">✕</button></div>`).join('') || '<div class="leeg">Nog geen eigen woorden</div>'}
      <button class="knop licht vol" onclick="woordToevoegen()">＋ Eigen woord</button></div>
    <p style="color:var(--grijs);margin:4px">Tip: snapt de app een zin niet? Tik dan op “Leer deze zin”. Een snelopdracht kan ook meerdere zinnen doen, gescheiden door ; (puntkomma).</p>
    ${S.logboek.length ? `<div class="sectie">Logboek</div><div class="kaart">${S.logboek.slice(-10).reverse().map(l => `<div class="rij"><div class="groot">${esc(l.tekst)}</div><small>${fmtD(l.datum)} ${l.tijd}</small></div>`).join('')}</div>` : ''}`];
}
function woordToevoegen(zeg = '') {
  formulier('Eigen woord', [
    { naam: 'zeg', label: 'Als ik zeg…', waarde: zeg },
    { naam: 'betekent', label: '…bedoel ik (bijv. ringcijfers 4011234, “hok 2”, “donkerkras”)', waarde: '' },
  ], f => { if (f.zeg.trim() && f.betekent.trim()) S.woorden.push({ id: uid(), zeg: f.zeg.trim().toLowerCase(), betekent: f.betekent.trim() }); });
}
function snelBewerken(id, zeg = '') {
  const x = S.snel.find(y => y.id === id) || { zeg, actie: 'zin', zin: '' };
  formulier(id ? 'Snelopdracht wijzigen' : 'Nieuwe snelopdracht', [
    { naam: 'zeg', label: 'Als ik zeg…', waarde: x.zeg },
    { naam: 'actie', label: '…dan doet de app', waarde: x.actie, opties: Object.entries(ACTIES) },
    { naam: 'zin', label: 'Zin(nen) die hij uitvoert (alleen bij “zinnen uitvoeren”; meerdere met ;)', waarde: x.zin },
  ], f => {
    const nieuw = { zeg: f.zeg.trim().toLowerCase(), actie: f.actie, zin: f.zin.trim() };
    if (!nieuw.zeg) return;
    if (id) Object.assign(S.snel.find(y => y.id === id), nieuw); else S.snel.push({ id: uid(), ...nieuw });
  });
}

// Bij onbegrepen zinnen: de voorbeelden die er het meest op lijken
const VOORBEELDEN = [
  ['1234 is binnen 14 uur 32', 'binnen thuis klok aankomst tijd uur'],
  ['hoe laat was 1234 binnen?', 'hoe laat binnen aankomst tijd'],
  ['zet duif 2025 1234567 erin, de ouders zijn 4417 en 4552', 'zet nieuwe duif erin ouders ring toevoegen'],
  ['waar komt 1234 uit?', 'waar komt uit ouders afstamming stamboom vader moeder'],
  ['wie is de grootvader van vaderskant van 1234?', 'grootvader grootmoeder grootouders kant'],
  ['wat heeft 1234 gepresteerd?', 'presteren gepresteerd vloog resultaten uitslag prijzen goed'],
  ['in welke bak zit 1234?', 'bak nestbak hok zit waar'],
  ['hoe duur heb ik 1234 gekocht?', 'duur gekocht kosten prijs betaald'],
  ['hoe duur heb ik 1234 verkocht?', 'verkocht verkoop opgebracht'],
  ['1234 verkocht voor 400 euro aan Jan', 'verkocht verkoop euro aan'],
  ['1234 naar hok 2', 'naar hok verplaatsen kweek jongen zetten'],
  ['1234 is niet teruggekomen', 'weg verloren dood kwijt vermist teruggekomen'],
  ['1234 moet eruit', 'eruit weg slecht opruimen'],
  ['nestbak 3, twee eieren', 'nestbak eieren gelegd ei'],
  ['nestbak 2 jongen uit', 'nestbak jongen uit uitgekomen'],
  ['nestbak 2 geringd', 'nestbak geringd ringen ring'],
  ['hoeveel ringen hebben we nog?', 'ringen ring voorraad hoeveel'],
  ['welk ringnummer hebben we als laatste geringd?', 'laatste geringd ringnummer'],
  ['twintig kilo voer gekocht, achttien euro', 'voer kilo gekocht euro zak'],
  ['hoeveel voer hebben we nog?', 'voer hoeveel nog voorraad bestellen'],
  ['hok 2 kuur tricho gestart, vijf dagen', 'kuur medicijn tricho behandeling gestart'],
  ['hoeveel doffers heb ik?', 'hoeveel doffers duivinnen duiven jongen aantal'],
  ['welke duiven zijn het vaakst te laat?', 'laat te vaakst slechtste'],
  ['wie zijn de beste duiven?', 'beste voorop goed top'],
];
function suggesties(t) {
  const woorden = t.split(' ').filter(w => w.length > 2 && !/^\d+$/.test(w));
  const z = t.match(/\b(\d{3,7})\b/)?.[1];
  return VOORBEELDEN.map(([zin, sl]) => ({ zin: z ? zin.replace(/\b1234\b/, z) : zin, score: woorden.filter(w => sl.split(' ').some(k => k.startsWith(w.slice(0, 4)) || w.startsWith(k.slice(0, 4)))).length }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.zin);
}

let rec = null;
function stopLuister() { try { rec?.abort(); } catch { } rec = null; $('#mic').classList.remove('luistert'); }
function spraak() {
  dialoog(`<h3>Wat wil je invoeren?</h3>
    <p style="color:var(--grijs);margin-top:0;font-size:15px">Bijv. “zet duif 2025 1234567 erin, de ouders zijn 4417 en 4552” · “1234 is binnen, 14 uur 32” ·“nestbak 3, twee eieren” · “hok 2 kuur tricho gestart, vijf dagen” · “twintig kilo voer gekocht, achttien euro” · “4417 moet eruit” · “waar komt 1238 uit?” · “wat heeft 0457 gepresteerd?” · “wanneer moet ik voer bestellen?” · Snelopdrachten: ${S.snel.map(x => '“' + esc(x.zeg) + '”').join(' · ')}<br><b>Commando's:</b> ${COMMANDOS.slice(0, 6).map(c => '“' + esc(cmdWoorden(c)[0] + ' ' + c.vb) + '”').join(' · ')} <a href="#/commandos" onclick="sluit()">Alle commando's ›</a></p>
    <textarea id="zin" rows="2" placeholder="Spreek in of typ…"></textarea>
    <div class="knoppen"><button class="knop licht" id="opnieuw">🎤 Inspreken</button><button class="knop" id="verwerk">Verwerken</button></div>
    <div id="uitleg"></div>`);
  $('#opnieuw').onclick = luister;
  $('#verwerk').onclick = () => verwerk($('#zin').value);
  luister();
}
function luister() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { $('#uitleg').innerHTML = '<p style="color:var(--grijs)">Inspreken werkt niet in deze browser. Typ de zin, of gebruik Chrome of Safari op je telefoon.</p>'; $('#zin').focus(); return; }
  stopLuister();
  rec = new SR(); rec.lang = 'nl-NL'; rec.interimResults = true;
  $('#mic').classList.add('luistert');
  $('#uitleg').innerHTML = '<p style="color:var(--grijs)">Ik luister…</p>';
  let definitief = '';
  rec.onresult = e => {
    let tussen = ''; definitief = '';
    for (const r of e.results) (r.isFinal ? (definitief += r[0].transcript) : (tussen += r[0].transcript));
    $('#zin').value = definitief + tussen;
  };
  rec.onerror = e => { if (e.error === 'aborted') return; $('#uitleg').innerHTML = `<p style="color:var(--rood)">${e.error === 'not-allowed' ? 'Geen toestemming voor de microfoon.' : 'Niets gehoord, probeer opnieuw of typ.'}</p>`; };
  rec.onend = () => { $('#mic').classList.remove('luistert'); rec = null; if (definitief.trim()) verwerk(definitief); };
  rec.start();
}
function verwerk(tekst, keuzes = {}) {
  const r = begrijp(tekst, keuzes), u = $('#uitleg');
  if (r.fout) {
    const sg = r.suggesties || [];
    u.innerHTML = `<div class="kaart melding rood" style="margin-top:10px"><div>${esc(r.fout)}${sg.length ? '<br><small>Bedoelde je misschien:</small>' : '<br><small>Tik op “Inspreken” en probeer het anders te zeggen.</small>'}</div></div>` +
      sg.map((z, i) => `<button class="knop licht vol" style="margin-bottom:6px;text-align:left" data-sg="${i}">“${esc(z)}”</button>`).join('') +
      `<div class="knoppen"><button class="knop licht" id="leer">🧠 Leer deze zin</button><button class="knop licht" id="leerwoord">＋ Eigen woord</button></div>`;
    u.querySelectorAll('[data-sg]').forEach(b => b.onclick = () => { const z = sg[+b.dataset.sg]; $('#zin').value = z; verwerk(z, keuzes); });
    $('#leer').onclick = () => snelBewerken(null, tekst.trim().toLowerCase().replace(/[?.!]+$/, ''));
    $('#leerwoord').onclick = () => woordToevoegen();
    return;
  }
  if (r.antwoord) {
    u.innerHTML = `<div class="kaart melding blauw" style="margin-top:10px"><div>${r.html ? r.antwoord : esc(r.antwoord)}</div></div>`;
    if (r.spreek && 'speechSynthesis' in window) { const s = new SpeechSynthesisUtterance(r.spreek); s.lang = 'nl-NL'; speechSynthesis.cancel(); speechSynthesis.speak(s); }
    return;
  }
  if (r.kies) {
    u.innerHTML = `<p><b>${esc(r.vraag || 'Welke duif bedoel je?')}</b></p>` + r.kies.map(d => `<button class="knop licht vol" style="margin-bottom:6px" data-id="${d.id}">${ringHtml(d.ring)} ${esc(d.naam)} <small>${d.geslacht === 'D' ? '♂' : '♀'} ${STATUS[d.status][0]}</small></button>`).join('');
    u.querySelectorAll('[data-id]').forEach(b => b.onclick = () => verwerk(tekst, { ...keuzes, [r.sleutel]: b.dataset.id }));
    return;
  }
  u.innerHTML = `<div class="kaart melding" style="margin-top:10px"><div><small>Begrepen:</small><br>${r.wat}<br><b>Klopt dit?</b></div></div>
    <div class="knoppen"><button class="knop licht" id="nee">✖ Nee</button><button class="knop" id="ja">✔ Klopt</button></div>`;
  $('#nee').onclick = () => { u.innerHTML = ''; $('#zin').focus(); };
  $('#ja').onclick = () => { sluit(); wijzig(r.doe, 'Opgeslagen'); };
}
$('#mic').onclick = spraak;

// ---------- QR / streepjescode scannen ----------
let cam = null, camTimer = null;
function stopCam() { clearInterval(camTimer); camTimer = null; cam?.getTracks().forEach(t => t.stop()); cam = null; }
async function scan() {
  const voorbeelden = [['DUIF:NB:2', 'Nestbak 2'], ['DUIF:NB:3', 'Nestbak 3'], ['DUIF:HOK:Hok 2', 'Hokdeur 2'], ['DUIF:RING:NL-2023-4011234', 'Duivenkaartje 1234'], ['8712345000017', 'Voerzak'], ['8712345000024', 'Medicijn']];
  dialoog(`<h3>Scannen</h3><video id="cam" playsinline muted></video><p id="scaninfo" style="color:var(--grijs);font-size:15px">Camera wordt gestart…</p>
    <label>Voorbeeldcodes (stickers komen later)</label>
    <div class="filters" style="flex-wrap:wrap">${voorbeelden.map(([c, t]) => `<button data-c="${esc(c)}">${t}</button>`).join('')}</div>
    <button class="knop licht vol" onclick="sluit()">Sluiten</button>`);
  document.querySelectorAll('#dlg [data-c]').forEach(b => b.onclick = () => codeGescand(b.dataset.c));
  const info = $('#scaninfo'), video = $('#cam');
  if (!navigator.mediaDevices?.getUserMedia) { video.hidden = true; info.textContent = 'Camera alleen beschikbaar via een beveiligde (https) verbinding. Kies hieronder een voorbeeld.'; return; }
  try {
    cam = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = cam; await video.play();
  } catch { video.hidden = true; info.textContent = 'Geen toegang tot de camera. Kies hieronder een voorbeeld.'; return; }
  if (!('BarcodeDetector' in window)) { info.textContent = 'Deze browser kan zelf nog geen codes lezen (bijv. iPhone). In de echte versie zit een eigen scanner. Kies hieronder een voorbeeld.'; return; }
  const det = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'ean_8', 'code_128'] });
  info.textContent = 'Richt de camera op een QR-code of streepjescode.';
  camTimer = setInterval(async () => {
    try { const c = await det.detect(video); if (c.length) codeGescand(c[0].rawValue); } catch { }
  }, 300);
}
function codeGescand(code) {
  stopCam();
  let m;
  if ((m = code.match(/^DUIF:NB:(\d+)/))) { sluit(); location.hash = '#/nestbak/' + m[1]; return; }
  if ((m = code.match(/^DUIF:HOK:(.+)/))) { sluit(); location.hash = '#/hok/' + encodeURIComponent(m[1]); return; }
  if ((m = code.match(/^DUIF:RING:(.+)/))) { const d = S.duiven.find(x => x.ring === m[1]); sluit(); if (d) location.hash = '#/duif/' + d.id; else toast('Duif niet gevonden'); return; }
  const p = S.producten[code];
  if (p?.soort === 'voer') { sluit(); voerBinnen(p.kg, p.prijs); return; }
  if (p?.soort === 'medicijn') { sluit(); S.kosten.push({ id: uid(), datum: VANDAAG(), omschrijving: p.naam, bedrag: -p.prijs, cat: 'Medicatie' }); bewaar(); nieuweKuur('Alle hokken', p.naam, p.dagen); toast(`${p.naam} bij de kosten gezet`); return; }
  sluit(); toast('Onbekende code: ' + code);
}
$('#scan-btn').onclick = scan;

// ---------- router ----------
const ROUTES = { vandaag: vVandaag, duiven: vDuiven, duif: vDuif, vluchten: vVluchten, vlucht: vVlucht, ranglijst: vRanglijst, meer: vMeer, kweek: vKweek, nestbak: vNestbak, hok: vHok, gezondheid: vGezondheid, training: vTraining, voer: vVoer, afspraken: vAfspraken, kosten: vKosten, verkoop: vVerkoop, eruit: vEruit, instellingen: vInstellingen, woorden: vWoorden, commandos: vCommandos };
const TAB = { vandaag: 'vandaag', duiven: 'duiven', duif: 'duiven', vluchten: 'vluchten', vlucht: 'vluchten', ranglijst: 'vluchten' };
function route() { const [naam, ...rest] = location.hash.slice(2).split('/'); return { naam: ROUTES[naam] ? naam : 'vandaag', arg: decodeURIComponent(rest.join('/')) }; }
let vorigeRoute = '';
function render() {
  const { naam, arg } = route();
  const [titel, html, na] = ROUTES[naam](arg);
  $('#title').textContent = titel;
  $('#view').innerHTML = html;
  na?.();
  const tab = TAB[naam] || 'meer';
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('actief', a.dataset.tab === tab));
  $('#back').hidden = ['vandaag', 'duiven', 'vluchten', 'meer'].includes(naam);
  if (location.hash !== vorigeRoute) { window.scrollTo(0, 0); vorigeRoute = location.hash; }
}
$('#back').onclick = () => history.length > 1 ? history.back() : (location.hash = '#/vandaag');
window.addEventListener('hashchange', render);
window.addEventListener('online', () => haalWeer(true));

render();
haalWeer();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js');
