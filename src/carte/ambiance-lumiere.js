// ambiance : couches, météo, lune, calculs de la lumière (taches, baies, voisins, lampes) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- ambiance (`ambiance`) : jour / nuit d'après sun.sun, météo de HA sur les extérieurs, traces des derniers changements ----------
const INTENSITES = { discret: 0.45, normal: 0.7, fort: 1 };
const intensiteAmb = (a) => (typeof a?.intensite === "number" ? Math.min(1, Math.max(0, a.intensite)) : INTENSITES[a?.intensite] ?? INTENSITES.discret);
// couche : absente si false ; true / absente = réglages par défaut ; objet = ses réglages
const objAmb = (v, def) => (v === false || v == null && !def ? null : v && typeof v === "object" && !Array.isArray(v) ? v : {});
const coucheJour = (a) => (a ? objAmb(a.jour_nuit, true) : null);
const coucheMeteo = (a) => { if (!a) return null; const v = a.meteo; if (typeof v === "string") return v.startsWith("weather.") ? { entite: v } : null; const o = objAmb(v, false); return o?.entite ? o : null; };
const coucheTraces = (a) => {
  if (!a) return null;
  const v = a.traces, o = typeof v === "number" ? { duree: v } : objAmb(v, true);
  if (!o) return null;
  const d = +(o.duree ?? 10);
  return d > 0 ? { ...o, duree: Math.min(240, d) } : null;
};
const alea = (graine) => { let x = graine; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const borne = (v, a, b) => Math.min(b, Math.max(a, v));
// météo peinte sur les extérieurs (vue de dessus) : ombres de nuages qui passent, pluie, neige, grêle, vent, brouillard, éclairs ;
// tout part dans le sens du vent (wind_bearing = d'où il vient) ; tirages au hasard mais toujours les mêmes (graine fixe).
// Pluie, neige, grêle et vent = motifs répétés (densité constante, quelques nœuds seulement) qui glissent en SMIL (pauseAnimations hors écran)
function dessinMeteo(w, b, nord, I, fixe = false, pre = "amb", e = 1, sens = 135) {
  const at = w.attributes || {}, cond = w.state;
  const S = Math.hypot(b.W, b.H) * 1.05, cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, r = alea(7);
  const u = at.wind_speed_unit, v0 = +at.wind_speed || 0, v = u === "m/s" ? v0 * 3.6 : u === "mph" ? v0 * 1.609 : u === "kn" ? v0 * 1.852 : v0;
  // sens du déplacement (degrés horaires depuis le haut) : 135 = d'en haut à gauche vers en bas à droite (défaut) ; « vent » = le vent réel
  const dir = sens === "vent" ? (v > 3 && at.wind_bearing != null && !isNaN(+at.wind_bearing) ? +at.wind_bearing + 180 + nord : 180) : Number.isFinite(+sens) ? +sens : 135, a = (dir - 180).toFixed(1);
  const f0 = (x) => x.toFixed(1);
  let h = "", n = 0;
  // motif de côté T avec k formes, qui glisse de T le long de +y (local, tourné dans le sens du vent) en `duree` secondes
  const motif = (T0, k, forme, duree, op) => {
    const T = T0 * e, id = `${pre}-m${n++}`, l = [];
    for (let q = 0; q < k; q++) { const x = r() * T, y = r() * T; l.push(forme(x, y), forme(x, y - T), forme(x - T, y), forme(x - T, y - T)); }
    const anim = fixe ? "" : `<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 ${T}" dur="${duree}s" repeatCount="indefinite" additive="sum"/>`;
    h += `<pattern id="${id}" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})">${l.join("")}${anim}</pattern>
      <rect x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="url(#${id})" opacity="${op.toFixed(3)}"/>`;
  };
  const L = (lg, ep, col) => (x, y) => `<line x1="${f0(x)}" y1="${f0(y)}" x2="${f0(x)}" y2="${f0(y + lg * e)}" stroke="${col}" stroke-width="${f0(ep * e)}" stroke-linecap="round"/>`;
  const C = (ray, col) => (x, y) => `<circle cx="${f0(x)}" cy="${f0(y)}" r="${f0(ray * e)}" fill="${col}"/>`;
  const couv = at.cloud_coverage != null && !isNaN(+at.cloud_coverage) ? +at.cloud_coverage : { sunny: 5, "clear-night": 5, partlycloudy: 45, windy: 20, "windy-variant": 50 }[cond] ?? 90;
  const nn = Math.round(couv / 22);
  if (nn) {
    // ombres de nuages : grandes taches floues (dégradé radial, sans filtre) qui traversent le plan en boucle
    const p = Array.from({ length: nn }, () => { const rx = S * (0.11 + r() * 0.09); return [cx - S / 2 + r() * S, cy - S / 2 + r() * S, rx, rx * (0.55 + r() * 0.2)]; });
    const un = (dy) => p.map(([x, y, rx, ry]) => `<ellipse cx="${x.toFixed(0)}" cy="${(y + dy).toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="url(#${pre}-nuage)"/>`).join("");
    const opn = I * 0.3 * Math.min(1, couv / 80);
    h += `<g class="m-nuages" data-op="${opn.toFixed(3)}" transform="rotate(${a} ${cx.toFixed(0)} ${cy.toFixed(0)})" opacity="${opn.toFixed(3)}"><g class="m-defile" style="--m-s:${S.toFixed(0)}px;--m-d:${Math.round(borne(520 / (1 + v / 8), 70, 520))}s">${un(0)}${un(-S)}</g></g>`;
  }
  if (["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(cond)) {
    const fort = cond === "pouring";
    motif(100, fort ? 6 : cond === "snowy-rainy" ? 2 : 3, L(fort ? 30 : 22, 1.6, "#90caf9"), fort ? 0.3 : 0.4, I * 0.9);
  }
  if (cond === "snowy" || cond === "snowy-rainy") motif(120, cond === "snowy" ? 5 : 3, C(3, "#ffffff"), 4, I);
  if (cond === "hail") motif(100, 4, C(2.5, "#e3f2fd"), 0.35, I);
  if (cond === "windy" || cond === "windy-variant") motif(400, 5, L(120, 1.2, "#ffffff"), 0.8, I * 0.5);
  if (cond === "fog") h += `<g opacity="${Math.min(0.6, I * 0.55).toFixed(3)}"><rect class="m-brume" x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="#cfd8dc"/></g>`;
  if (cond === "lightning" || cond === "lightning-rainy") h += `<g opacity="${(I * 0.6).toFixed(3)}"><rect class="m-eclair" x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="#ffffff"/></g>`;
  return h;
}
// lumière (`ambiance.lumiere`) : taches de soleil au sol derrière les fenêtres, lueur de lune la nuit, halos de lampes colorés.
// Active avec l'ambiance (false = rien) ; objet = { soleil, lune, lampes } (true par défaut ; lune : true ou entité de phase).
// Réglages : `ciel` (lueur du ciel), `rediffusion` (lueur autour de la tache) et `soleil` (tache directe) = true / false ou multiplicateur
// de 0 à 2 (1 = rendu d'origine) ; `soleil: false` coupe toute la lumière du jour (ciel compris). `ciel_kelvin`, `soleil_kelvin` :
// teinte forcée de 1800 à 10000 K (corps noir), sinon `auto` = teintes d'origine (ciel blanc froid, soleil doré près du coucher).
// `ciel_diffusion` : flou du faisceau du ciel (et de la lueur de la nuit), de 0 (faisceau net) à 1 (flou large qui grandit avec la profondeur)
const LUM_MULT = (v) => (v === false ? 0 : typeof v === "number" && Number.isFinite(v) ? borne(v, 0, 2) : 1);
const LUM_DIFFUSION = 0.6, LUM_DIFF = (v) => (typeof v === "number" && Number.isFinite(v) ? borne(v, 0, 1) : LUM_DIFFUSION);
const LUM_KELVIN = (v) => (typeof v === "number" && Number.isFinite(v) ? borne(v, 1800, 10000) : null);
const coucheLumiere = (a) => {
  if (!a || a.lumiere === false) return null;
  const o = objetSimple(a.lumiere) ? a.lumiere : {};
  const r = { soleil: o.soleil !== false, lune: o.lune !== false, lampes: o.lampes !== false, phase: typeof o.lune === "string" ? o.lune : null, portes: o.portes === "fermees" ? "fermees" : "ouvertes",
    mult: { ciel: LUM_MULT(o.ciel), rediffusion: LUM_MULT(o.rediffusion), soleil: LUM_MULT(o.soleil) }, kelvin: { ciel: LUM_KELVIN(o.ciel_kelvin), soleil: LUM_KELVIN(o.soleil_kelvin) }, diffusion: LUM_DIFF(o.ciel_diffusion) };
  return r.soleil || r.lune || r.lampes ? r : null;
};
const soleilDe = (a) => (objetSimple(a?.jour_nuit) && typeof a.jour_nuit.soleil === "string" ? a.jour_nuit.soleil : "sun.sun");
// part de la lune éclairée selon l'état de l'intégration Moon (sensor.moon_phase) ; inconnue = 0,6
const PHASES_LUNE = { new_moon: 0.05, waxing_crescent: 0.3, first_quarter: 0.55, waxing_gibbous: 0.8, full_moon: 1, waning_gibbous: 0.8, last_quarter: 0.55, waning_crescent: 0.3 };
// position de la lune (formules astronomiques usuelles, précision de l'ordre du degré, comme suncalc) : t = instant (ms),
// lat / lon en degrés. Retour : az = azimut en degrés depuis le nord, sens horaire ; haut = hauteur en degrés (réfraction comprise) ;
// fraction = part éclairée (0 = nouvelle lune, 1 = pleine lune). null si les coordonnées manquent
function positionLune(t, lat, lon) {
  if (![t, lat, lon].every((v) => typeof v === "number" && Number.isFinite(v)) || Math.abs(lat) > 90) return null;
  const R = Math.PI / 180, d = t / 864e5 - 0.5 + 2440588 - 2451545, eps = R * 23.4397;
  const asc = (l, b) => Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l));
  const dec = (l, b) => Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
  // lune : longitude moyenne, anomalie moyenne, distance moyenne au nœud
  const L = R * (218.316 + 13.176396 * d), Mm = R * (134.963 + 13.064993 * d), F = R * (93.272 + 13.22935 * d);
  const l = L + R * 6.289 * Math.sin(Mm), b = R * 5.128 * Math.sin(F), dist = 385001 - 20905 * Math.cos(Mm);
  const ra = asc(l, b), de = dec(l, b), phi = R * lat, H = R * (280.16 + 360.9856235 * d) + R * lon - ra;
  let h = Math.asin(Math.sin(phi) * Math.sin(de) + Math.cos(phi) * Math.cos(de) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(de) * Math.cos(phi)); // depuis le sud, vers l'ouest
  const hr = Math.max(h, 0);
  h += (0.0002967 / Math.tan(hr + 0.00312536 / (hr + 0.08901179))); // réfraction
  // soleil : pour la part éclairée (angle de phase)
  const M = R * (357.5291 + 0.98560028 * d), C = R * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const ls = M + C + R * 102.9372 + Math.PI, sra = asc(ls, 0), sde = dec(ls, 0), sd = 149598000;
  const el = Math.acos(Math.sin(sde) * Math.sin(de) + Math.cos(sde) * Math.cos(de) * Math.cos(sra - ra));
  const inc = Math.atan2(sd * Math.sin(el), dist - sd * Math.cos(el));
  return { az: (((az / R + 180) % 360) + 360) % 360, haut: h / R, fraction: (1 + Math.cos(inc)) / 2, ra: (((ra / R) % 360) + 360) % 360, dec: de / R };
}
// lumière du jour selon la hauteur du soleil et le temps : `ciel` = lueur diffuse du ciel par toutes les fenêtres (fondu du crépuscule
// civil, -6° à +10°, puis plateau ; un peu plus forte par temps couvert : un ciel gris est lumineux, la pièce reste claire),
// `direct` = part du soleil direct : selon `cloud_coverage` (%) de l'entité météo quand il existe (10 % ou moins = 1, 90 % ou plus = 0),
// sinon selon la condition (couvert = 0, quelques nuages = 0,55) ; pluie, neige, grêle, brouillard, orage = 0 ; sans météo = 1
const DIRECT_METEO = { sunny: 1, "clear-night": 1, windy: 1, exceptional: 1, partlycloudy: 0.55 };
const SANS_SOLEIL = ["rainy", "pouring", "lightning-rainy", "lightning", "snowy", "snowy-rainy", "hail", "fog"];
function LUM_CIEL(e, cond, couv) {
  const cc = nbOpt(couv), direct = !cond || cond === "unknown" || cond === "unavailable" ? (cc != null ? borne((90 - cc) / 80, 0, 1) : 1)
    : SANS_SOLEIL.includes(cond) ? 0 : cc != null ? borne((90 - cc) / 80, 0, 1) : DIRECT_METEO[cond] ?? 0;
  return { ciel: Number.isFinite(e) ? borne((e + 6) / 16, 0, 1) * (1 + 0.3 * (1 - direct)) : 0, direct };
}
const nbOpt = (v) => (v == null || v === "" || typeof v === "boolean" || !Number.isFinite(+v) ? null : +v);
// baie vitrée qui laisse passer la lumière : une fenêtre, ou une porte vitrée (`vitree` : true / « toute » = toute la hauteur, « haut » = petite vitre en haut)
const vitrageDe = (o) => (o?.type === "porte" ? (o.vitree === true ? "toute" : o.vitree === "toute" || o.vitree === "haut" ? o.vitree : null) : o?.type === "fenetre" ? "fenetre" : null);
// bas et haut du vitrage (cm au-dessus du sol) : `allege` / `hauteur` d'abord ; sinon fenêtre = allège 90 (0 dès 180 cm de large), haut 215 ;
// porte vitrée sur toute la hauteur = 0 à 215 ; petite vitre en haut = 150 à 200
function vitrageBornes(o, larg) {
  const v = vitrageDe(o), al = nbOpt(o.allege), ht = nbOpt(o.hauteur);
  return [al != null ? borne(al, 0, 300) : v === "haut" ? 150 : v === "toute" || larg >= 180 ? 0 : 90, ht != null ? borne(ht, 0, 500) : v === "haut" ? 200 : 215];
}
// haut du vitrage encore au soleil sous une avancée de toit (`avancee` cm de profondeur, posée `avancee_hauteur` cm au-dessus du haut) :
// l'ombre de son bord descend de (profondeur / expo) × tan(hauteur du soleil) sous l'avancée : soleil haut (été) coupé, soleil bas (hiver) passe
function hautAuSoleil(o, haut, e, expo) {
  const P = nbOpt(o.avancee);
  if (!P || P <= 0) return haut;
  const h0 = haut + borne(nbOpt(o.avancee_hauteur) ?? 0, 0, 300), t = Math.tan((Math.min(e, 89) * Math.PI) / 180);
  return Math.min(haut, h0 - (P / Math.max(expo, 0.05)) * t);
}
// tache de lumière d'une baie au sol, côté intérieur : bord de la baie décalé selon la direction de l'astre.
// (ux, uy) = direction de l'astre dans le plan (vers lui), e = hauteur (°), ouvert = part dégagée par le volet (0 à 1, du bas).
// `o` = une fenêtre, ou une baie de baiesFenetres (vantaux réunis : `parts` = [début, fin (cm le long de seg), ouvert] de chacun).
// Allège : `allege` (cm, 0 = jusqu'au sol), sinon 90 cm, et 0 pour une baie d'au moins 180 cm de large (largeur cumulée des vantaux) ;
// haut : `hauteur` (cm), sinon 215. Le volet de chaque vantail réduit sa part : la tache reste d'un seul polygone. Rien si la baie ne voit pas l'astre.
function tacheLumiere(o, ux, uy, e, ouvert = 1, max = 900) {
  if (!vitrageDe(o) || !Array.isArray(o.seg) || o.seg.length < 4 || !Array.isArray(o.dehors)) return null;
  const [a, b, d, f] = o.seg.map(Number), [nx, ny] = o.dehors.map(Number), ln = Math.hypot(nx, ny), L = Math.hypot(d - a, f - b);
  if (![a, b, d, f, nx, ny, ux, uy, e].every(Number.isFinite) || !ln || !L || e <= 0.5) return null;
  const parts = Array.isArray(o.parts) && o.parts.length ? o.parts : [[0, L, ouvert]];
  if (Math.max(...parts.map((p) => p[2])) <= 0.02) return null;
  const expo = (nx * ux + ny * uy) / ln;
  if (expo <= 0.2) return null; // lumière rasante (plus de 78°) : arrêtée par l'embrasure
  const larg = Number.isFinite(o.largeur) ? o.largeur : L;
  const [bas, haut0] = vitrageBornes(o, larg), haut = hautAuSoleil(o, haut0, e, expo);
  if (haut - bas < 5) return null; // vitrage trop bas, ou tout à l'ombre de l'avancée
  const t = Math.tan((Math.min(e, 89) * Math.PI) / 180), pres = Math.min(max, bas / t);
  const loinDe = (ouv) => (ouv <= 0.02 ? pres : Math.min(max, Math.min(haut, bas + (haut0 - bas) * Math.min(1, ouv)) / t));
  const loin = Math.max(...parts.map((p) => loinDe(p[2])));
  if (loin - pres < 2) return null;
  const vx = (d - a) / L, vy = (f - b) / L, lx = -ux, ly = -uy, r = (v) => +v.toFixed(1);
  const P = (s, k) => [r(a + vx * s + lx * k), r(b + vy * s + ly * k)];
  const ps = [...parts].sort((p, q) => p[0] - q[0]), s0 = ps[0][0], s1 = Math.max(...ps.map((p) => p[1]));
  const poly = [P(s0, pres), P(s1, pres)];
  // bord loin : un palier par vantail (vantaux voisins au même niveau fusionnés)
  for (let i = ps.length - 1; i >= 0; i--) {
    const k = loinDe(ps[i][2]);
    if (i < ps.length - 1 && k === loinDe(ps[i + 1][2])) poly.pop();
    else poly.push(P(i === ps.length - 1 ? s1 : ps[i][1], k));
    poly.push(P(i ? ps[i][0] : s0, k));
  }
  const net = poly.filter((p, i) => !i || p[0] !== poly[i - 1][0] || p[1] !== poly[i - 1][1]);
  let aire = 0;
  net.forEach((p, i) => { const q = net[(i + 1) % net.length]; aire += p[0] * q[1] - q[0] * p[1]; });
  const m = (s0 + s1) / 2;
  return { expo, poly: net, aire: Math.abs(aire) / 2, pres, loin, de: P(m, pres), vers: P(m, loin), centre: P(m, (pres + loin) / 2), coupe: haut < haut0 };
}
// lumière de fond d'une pièce, de 0 à 1 : selon la surface vitrée dégagée (cm², une valeur par baie : largeur × hauteur du vitrage × part
// ouverte) rapportée à la surface au sol de la pièce (cm²) ; une fenêtre de 1 m dans 16 m² ≈ 0,37, une baie de 2,8 m ≈ 0,9 ; sans baie = 0
const lumiereFond = (surfaces, aire) => (aire > 0 ? 1 - Math.exp((-6 * surfaces.reduce((t, v) => t + Math.max(0, +v || 0), 0)) / aire) : 0);
// part dégagée d'une baie derrière son volet : pos = position du volet (0 à 1). Lames (`lames` de l'ouverture) : « orientables » = la
// partie couverte laisse passer selon l'inclinaison (`current_tilt_position` du volet : 100 = lames ouvertes, 0 = fermées), « ajourees » =
// un volet fermé laisse passer un peu de lumière (filets). Sans `lames` : pos tel quel (rendu d'origine)
function partLames(pos, lames, tilt) {
  const t = lames === "orientables" ? (Number.isFinite(tilt) ? (0.85 * borne(tilt, 0, 100)) / 100 : 0) : lames === "ajourees" ? 0.06 : 0;
  return t > 0 ? pos + (1 - pos) * t : pos;
}
// part de lumière qui passe par une ouverture intérieure (0 à 1) : porte ouverte = 1 (etat = état du capteur, null = sans capteur :
// ouverte, sauf `portes: fermees` de la lumière) ; porte fermée vitrée = 0,7 (toute la hauteur) ou 0,25 (petite vitre en haut) ;
// fenêtre intérieure (verrière) = 0,7 ; ouv = part dégagée par un volet éventuel
function passageLumiere(o, etat, portesFermees, ouv = 1) {
  if (!o || o.masque) return 0;
  if (o.type === "fenetre") return 0.7 * ouv;
  if (o.type !== "porte") return 0;
  if (etat != null ? etat === "on" || etat === "open" : !portesFermees) return 1;
  const v = vitrageDe(o);
  return (v === "toute" ? 0.7 : v === "haut" ? 0.25 : 0) * ouv;
}
// pièces de part et d'autre d'une ouverture (à 15 cm du milieu, le long de la perpendiculaire) : { p1, p2 } (-1 = aucune pièce de ce
// côté), avec le segment, sa longueur, son milieu et sa normale ; null = segment invalide. pieces = [[poly, k]] (pièces intérieures)
function cotesOuverture(pieces, o) {
  if (!Array.isArray(o?.seg) || o.seg.length < 4) return null;
  const [a, b, d, f] = o.seg.map(Number), L = Math.hypot(d - a, f - b);
  if (![a, b, d, f].every(Number.isFinite) || L < 1) return null;
  const nx = -(f - b) / L, ny = (d - a) / L, m = [(a + d) / 2, (b + f) / 2];
  const cote = (sg) => pieces.find(([poly]) => dansPoly([m[0] + nx * 15 * sg, m[1] + ny * 15 * sg], poly))?.[1] ?? -1;
  return { p1: cote(1), p2: cote(-1), L, m, nx, ny };
}
// ouverture intérieure : une pièce intérieure différente de chaque côté (verrière, porte intérieure : lumiereVoisins). Une fenêtre ou une
// porte vitrée entre deux pièces qui a aussi un côté `dehors` ne compte qu'une fois : en fenêtre extérieure, son `dehors` fait foi (une
// terrasse dessinée en pièce sans `outside` reste dehors) ; le contrôle « fenêtre intérieure avec un côté dehors » de Nettoyer le plan la signale
const ouvertureInterieure = (pieces, o) => { const c = cotesOuverture(pieces, o); return !!c && c.p1 >= 0 && c.p2 >= 0 && c.p1 !== c.p2; };
// lumière entre pièces : ouverture intérieure = une pièce de chaque côté (voir cotesOuverture).
// pieces = [[poly, k]], trans[i] = part qui passe par l'ouverture i, F = Map(k → lumière de fond de la pièce éclairée par le jour).
// Un seul saut : seules les pièces de F éclairent leurs voisines. fond = lumière de fond de la voisine (plus faible, selon la taille
// du passage rapportée à sa surface), lueur = intensité près de l'ouverture ; n = direction vers la voisine
function lumiereVoisins(pieces, ouvertures, trans, F) {
  const res = [];
  (ouvertures || []).forEach((o, i) => {
    const t = trans[i];
    const c = t > 0 ? cotesOuverture(pieces, o) : null;
    if (!c || c.p1 < 0 || c.p2 < 0 || c.p1 === c.p2) return;
    const { p1, p2, L, m, nx, ny } = c;
    const [bas, haut] = o.type === "porte" ? [0, 210] : vitrageBornes(o, L);
    for (const [de, vers, sg] of [[p1, p2, -1], [p2, p1, 1]]) {
      const Fd = F.get(de) || 0, poly = pieces.find((x) => x[1] === vers)[0];
      if (Fd < 0.004) continue;
      res.push({ de, vers, i, fond: Fd * t * 0.6 * lumiereFond([L * Math.max(0, haut - bas)], aireDe(poly)), lueur: Fd * t, mil: m, n: [nx * sg, ny * sg], L });
    }
  });
  return res;
}
const aireDe = (poly) => Math.abs(poly.reduce((t, p, i) => { const q = poly[(i + 1) % poly.length]; return t + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
// fenêtres → baies (lumière) : vantaux de même `baie` (prioritaire), colinéaires et contigus (bouts à moins de 5 cm, même côté dehors),
// ou de même `groupe`, réunis en une baie d'un seul tenant. Un volet seul posé sur la baie (colinéaire, qui recouvre le vantail) réduit aussi sa part.
// ouv[i] = part dégagée de l'ouverture i (null = ignorée). Retour : [{ type, seg, dehors, largeur, allege, hauteur, parts, ouvert, ids }]
function baiesFenetres(l, ouv) {
  const geo = (o) => {
    if (!Array.isArray(o?.seg) || o.seg.length < 4 || !Array.isArray(o.dehors)) return null;
    const [a, b, d, f] = o.seg.map(Number), [nx, ny] = o.dehors.map(Number), L = Math.hypot(d - a, f - b), ln = Math.hypot(nx, ny);
    return [a, b, d, f, nx, ny].every(Number.isFinite) && L > 0 && ln > 0 ? { a, b, d, f, L, vx: (d - a) / L, vy: (f - b) / L, nx: nx / ln, ny: ny / ln } : null;
  };
  // g2 sur la droite de g1 (parallèles, à moins de `tol` cm) : positions de ses bouts le long de g1
  const surLigne = (g1, g2, tol) => {
    if (Math.abs(g1.vx * g2.vy - g1.vy * g2.vx) > 0.03) return null;
    const dist = (x, y) => Math.abs((x - g1.a) * g1.vy - (y - g1.b) * g1.vx);
    if (dist(g2.a, g2.b) > tol || dist(g2.d, g2.f) > tol) return null;
    const s = (x, y) => (x - g1.a) * g1.vx + (y - g1.b) * g1.vy, p = s(g2.a, g2.b), q = s(g2.d, g2.f);
    return [Math.min(p, q), Math.max(p, q)];
  };
  const F = [], V = [];
  (l || []).forEach((o, i) => {
    if (!vitrageDe(o) || ouv[i] == null) return;
    const g = geo(o);
    if (g) (o.volet_seul ? V : F).push({ o, i, g, ouvert: ouv[i] });
  });
  // volet seul (avec un volet) qui recouvre au moins la moitié du vantail
  for (const v of V) if (v.o.volet) for (const x of F) {
    const s = surLigne(x.g, v.g, 10);
    if (s && Math.min(x.g.L, s[1]) - Math.max(0, s[0]) >= x.g.L / 2) x.ouvert = Math.min(x.ouvert, v.ouvert);
  }
  const chef = F.map((_, k) => k), racine = (k) => (chef[k] === k ? k : (chef[k] = racine(chef[k])));
  const nom = (o, k) => (typeof o[k] === "string" && o[k].trim() ? o[k].trim() : null);
  for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
    const A = F[i], B = F[j];
    if (A.g.nx * B.g.nx + A.g.ny * B.g.ny < 0.95 || vitrageDe(A.o) !== vitrageDe(B.o)) continue;
    const s = surLigne(A.g, B.g, 5);
    // `baie` prioritaire : même nom = une baie ; deux noms différents = deux baies, même contiguës
    const ba = nom(A.o, "baie"), bb = nom(B.o, "baie"), memeNom = (ba && ba === bb) || (nom(A.o, "groupe") && nom(A.o, "groupe") === nom(B.o, "groupe"));
    if (ba && bb && ba !== bb) continue;
    if ((s && s[0] <= A.g.L + 5 && s[1] >= -5) || (memeNom && surLigne(A.g, B.g, 40))) chef[racine(j)] = racine(i);
  }
  const groupes = new Map();
  F.forEach((x, k) => { const r = racine(k); if (!groupes.has(r)) groupes.set(r, []); groupes.get(r).push(x); });
  return [...groupes.values()].map((m) => {
    const g = m[0].g, s = m.map((x) => [...(x === m[0] ? [0, g.L] : surLigne(g, x.g, 40)), x.ouvert]);
    const s0 = Math.min(...s.map((p) => p[0])), s1 = Math.max(...s.map((p) => p[1])), r = (v) => +v.toFixed(1);
    const larg = m.reduce((t, x) => t + x.g.L, 0), prem = (k) => m.map((x) => nbOpt(x.o[k])).find((v) => v != null);
    return { type: m[0].o.type, ...(m[0].o.type === "porte" ? { vitree: vitrageDe(m[0].o) } : {}), avancee: prem("avancee"), avancee_hauteur: prem("avancee_hauteur"), seg: [r(g.a + g.vx * s0), r(g.b + g.vy * s0), r(g.a + g.vx * s1), r(g.b + g.vy * s1)], dehors: [g.nx, g.ny], largeur: larg,
      allege: prem("allege"), hauteur: prem("hauteur"), parts: s.map(([p, q, v]) => [p - s0, q - s0, v]),
      ouvert: m.reduce((t, x) => t + x.g.L * x.ouvert, 0) / larg, ids: m.map((x) => x.i) };
  });
}
// couleur d'une lampe allumée : rgb_color, sinon hs_color, sinon color_temp_kelvin ; force = luminosité (0 à 1) ; null = jaune d'origine
// teinte d'une température de couleur : approximation du corps noir (1000 à 40000 K) → [r, g, b] de 0 à 255
function kelvinRgb(K) {
  const t = borne(+K || 6500, 1000, 40000) / 100, k = (v) => Math.round(borne(v, 0, 255));
  return (t <= 66 ? [255, 99.47 * Math.log(t) - 161.12, t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04] : [329.7 * (t - 60) ** -0.1332, 288.12 * (t - 60) ** -0.0755, 255]).map(k);
}
function couleurLampe(s) {
  const at = s?.attributes || {}, k = (v) => Math.round(borne(+v || 0, 0, 255));
  let rgb = null;
  if (Array.isArray(at.rgb_color) && at.rgb_color.length >= 3 && at.rgb_color.every((v) => Number.isFinite(+v))) rgb = at.rgb_color.slice(0, 3).map(k);
  else if (Array.isArray(at.hs_color) && Number.isFinite(+at.hs_color[0]) && Number.isFinite(+at.hs_color[1])) {
    const h = ((+at.hs_color[0] % 360) + 360) % 360 / 60, sat = borne(+at.hs_color[1], 0, 100) / 100, c = sat, x = c * (1 - Math.abs((h % 2) - 1)), m = 1 - c;
    const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6];
    rgb = [r + m, g + m, b + m].map((v) => k(v * 255));
  } else if (Number.isFinite(+at.color_temp_kelvin) && +at.color_temp_kelvin > 0) rgb = kelvinRgb(at.color_temp_kelvin);
  const br = Number.isFinite(+at.brightness) ? borne(+at.brightness / 255, 0, 1) : 1;
  return { rgb, force: 0.35 + 0.65 * br };
}
