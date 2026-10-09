// flux, personnes, bulles, alertes, vitrine, icônes et commandes, formes des meubles perso, dessin des ouvertures — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// flux d'énergie (`ambiance.energie`) : du tableau électrique vers chaque meuble / pastille dont la valeur est une puissance ;
// des billes avancent à une vitesse qui suit la puissance (échelle logarithmique), plus nombreuses quand elle est forte
const coucheEnergie = (a) => (a ? objAmb(a.energie, false) : null);
const enWatts = (s) => { const v = parseFloat(s?.state), u = s?.attributes?.unit_of_measurement; return isNaN(v) ? null : u === "kW" ? v * 1000 : u === "W" ? v : u === "MW" ? v * 1e6 : null; };
function dessinFlux(l, rb, fixe) {
  return l.map(({ de, vers, w, col }) => {
    const [sx, sy] = de, [tx, ty] = vers, dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) || 1;
    const qx = (sx + tx) / 2 - (dy / L) * L * 0.15, qy = (sy + ty) / 2 + (dx / L) * L * 0.15;
    const d = `M${sx.toFixed(0)} ${sy.toFixed(0)}Q${qx.toFixed(0)} ${qy.toFixed(0)} ${tx.toFixed(0)} ${ty.toFixed(0)}`;
    const dur = borne(5 / (0.4 + Math.log10(1 + w / 20)), 0.7, 9), n = 1 + Math.min(3, Math.floor(Math.log10(Math.max(1, w))));
    const billes = fixe ? "" : Array.from({ length: n }, (_, k) => `<circle r="${rb.toFixed(1)}" fill="${col}"><animateMotion dur="${dur.toFixed(2)}s" begin="${(-k * dur / n).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`).join("");
    return `<path d="${d}" fill="none" stroke="${col}" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>${billes}`;
  }).join("");
}
// personnes (`ambiance.personnes`) : à la maison autour d'un point (`maison`), dehors au bord du plan dans leur direction réelle
const couchePersonnes = (a) => {
  const v = a?.personnes;
  if (!v) return null;
  const lire = (l) => l.map((x) => (typeof x === "string" ? { entite: x } : x)).filter((x) => typeof x?.entite === "string" && x.entite.startsWith("person."));
  if (v === true) return { auto: true };
  if (Array.isArray(v)) return { liste: lire(v) };
  return typeof v === "object" ? { ...v, liste: Array.isArray(v.entites) ? lire(v.entites) : null, auto: !Array.isArray(v.entites) } : null;
};
// affichage d'une personne : `par_personne[entité]` prime sur les réglages communs ; valeur absente ou inconnue = la première (comportement d'origine)
const AFF_PERSONNE = { dehors: ["direction", "zone", "cache"], chez_soi: ["groupe", "cache"], avatar: ["photo", "initiales"] };
const affPersonne = (P, e) => {
  const pp = P?.par_personne && typeof P.par_personne === "object" ? P.par_personne[e] : null, o = {};
  for (const [k, l] of Object.entries(AFF_PERSONNE)) o[k] = [pp?.[k], P?.[k]].find((x) => l.includes(x)) || l[0];
  return o;
};
const capDistance = (la1, lo1, la2, lo2) => {
  const r = Math.PI / 180, p1 = la1 * r, p2 = la2 * r, dl = (lo2 - lo1) * r;
  const cap = (Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / r + 360) % 360;
  const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return { cap, km: 12742 * Math.asin(Math.min(1, Math.sqrt(h))) };
};
// bulles d'appareils (`style_pastilles`) : indisponibles, inactives, taille, valeurs ; valeur absente ou inconnue = la première (comportement d'origine)
const STYLE_PASTILLES = { indisponible: ["estompe", "tirets", "cache"], inactif: ["visible", "actif_seul", "estompe"], taille: ["normal", "petit", "grand"], valeurs: ["toujours", "survol", "jamais"] };
const stylePastilles = (c) => {
  const v = c?.style_pastilles && typeof c.style_pastilles === "object" ? c.style_pastilles : {}, o = {};
  for (const [k, l] of Object.entries(STYLE_PASTILLES)) o[k] = l.includes(v[k]) ? v[k] : l[0];
  return o;
};
// classes fixes d'une bulle (aucune avec les réglages d'origine)
const classesPastilles = (st) => (st.taille !== "normal" ? ` bs-${st.taille}` : "") + (st.valeurs !== "toujours" ? ` bs-v-${st.valeurs}` : "") + (st.indisponible === "tirets" ? " bs-tirets" : "");
// alertes plein plan (`alertes`) : liste de règles ; critique > alerte > info
// attributs qui ne changent pas avec l'état (repris de l'état actuel pendant le replay)
const ATTRS_FIXES = ["friendly_name", "unit_of_measurement", "device_class", "state_class", "icon", "supported_features", "supported_color_modes", "options"];
const NIVEAUX_ALERTE = { critique: { r: 3, icone: "mdi:alarm-light" }, alerte: { r: 2, icone: "mdi:alert" }, info: { r: 1, icone: "mdi:information" } };
const ETATS_ALERTE = ["on", "open", "triggered", "detected"];
// vitrine (`vitrine: true`) : exemples d'animations et d'ambiance dessinés sous le plan
const VITRINE_METEO = [["partlycloudy", _tk("Nuages")], ["rainy", _tk("Pluie")], ["pouring", _tk("Averse")], ["snowy", _tk("Neige")], ["hail", _tk("Grêle")], ["fog", _tk("Brouillard")], ["lightning-rainy", _tk("Orage")], ["windy", _tk("Vent")]];
const VITRINE_AMB = [["nuit", _tk("Nuit")], ["dore", _tk("Soleil bas")], ["trace", _tk("Trace (vient de changer)")], ["flux", _tk("Flux d'énergie")], ["alerte", _tk("Alerte")], ["personne", _tk("Personne dehors")]];
function geoVitrine(c, base) {
  const V = c.vitrine && typeof c.vitrine === "object" ? c.vitrine : {}, m = c.marge ?? 40;
  const w = Math.max(700, +V.largeur || base.W - 2 * m), x = Array.isArray(V.pos) ? nb(V.pos[0]) : base.x0 + m, y = Array.isArray(V.pos) ? nb(V.pos[1]) : base.y0 + base.H + Math.max(40, w / 25);
  const ca = w / 7, th = ca * 0.22, ha = ca * 0.62, cm = w / 8, hm = cm * 0.62;
  return { x, y, w, ca, th, ha, cm, hm, H: th * 3 + ha + hm * 2 + th * 1.4 };
}
const ICONES_MESURE = { temperature: "mdi:thermometer", humidity: "mdi:water-percent", power: "mdi:flash", energy: "mdi:lightning-bolt", battery: "mdi:battery",
  co2: "mdi:molecule-co2", carbon_dioxide: "mdi:molecule-co2", carbon_monoxide: "mdi:molecule-co", pressure: "mdi:gauge", illuminance: "mdi:brightness-5", voltage: "mdi:sine-wave", current: "mdi:current-ac", monetary: "mdi:cash", pm25: "mdi:blur" };
const ICONES_OUVERTURE = { fenetre: ["mdi:window-closed-variant", "mdi:window-open-variant"], porte: ["mdi:door-closed", "mdi:door-open"], portail: ["mdi:garage-variant", "mdi:garage-open-variant"] };
const NOMS_OUVERTURE = { fenetre: _tk("Fenêtre"), porte: _tk("Porte"), portail: _tk("Portail") };
// widget `commande` (cover) : icône fermée / ouverte selon la device_class, services permis, confirmation par défaut
const ICONES_COVER = { garage: ["mdi:garage-variant", "mdi:garage-open-variant"], gate: ["mdi:gate", "mdi:gate-open"], door: ["mdi:door-closed", "mdi:door-open"],
  curtain: ["mdi:curtains-closed", "mdi:curtains"], blind: ["mdi:blinds-horizontal-closed", "mdi:blinds-horizontal"], awning: ["mdi:awning-outline", "mdi:awning-outline"], _: ["mdi:window-shutter", "mdi:window-shutter-open"] };
const COMMANDES = { ouvrir: ["open_cover", _tk("Ouvrir"), "mdi:arrow-up"], stop: ["stop_cover", _tk("Stop"), "mdi:stop"], fermer: ["close_cover", _tk("Fermer"), "mdi:arrow-down"] };
const CONFIRMER_COVER = ["garage", "gate", "door"];
// services permis par domaine : widget `commande` (cover, valve) et `serrure` (lock) ; rien d'autre n'est jamais appelé
const SERVICES_CMD = { cover: { ouvrir: "open_cover", stop: "stop_cover", fermer: "close_cover" }, valve: { ouvrir: "open_valve", stop: "stop_valve", fermer: "close_valve" },
  lock: { verrouiller: "lock", deverrouiller: "unlock", ouvrir: "open" } };
const COMMANDES_SERRURE = { verrouiller: [_tk("Verrouiller"), "mdi:lock"], deverrouiller: [_tk("Déverrouiller"), "mdi:lock-open-variant"], ouvrir: [_tk("Ouvrir##serrure"), "mdi:door-open"] };
// capteurs binaires d'alarme : état « on » affiché en rouge dans les tuiles et les listes
const ALARMES = ["moisture", "smoke", "gas", "carbon_monoxide", "safety", "problem", "tamper", "heat", "cold"];
const enAlarme = (e, s) => !!s && e?.startsWith("binary_sensor.") && s.state === "on" && ALARMES.includes(s.attributes.device_class);
// entités qu'une ligne de liste active d'un appui (bouton « Activer ») : scène, script, bouton
const ACTIVABLES = { scene: "turn_on", script: "turn_on", button: "press", input_button: "press" };
// icône de la fiche selon le type de meuble
const ICONES_MEUBLE = { borne_recharge: "mdi:ev-station", tableau_elec: "mdi:flash", meuble_tv: "mdi:television", refrigerateur: "mdi:fridge-outline", lave_linge: "mdi:washing-machine",
  lave_vaisselle: "mdi:dishwasher", bureau: "mdi:desk", box: "mdi:router-wireless", chaudiere: "mdi:water-boiler", ballon: "mdi:water-boiler", pac: "mdi:heat-pump-outline",
  radiateur: "mdi:radiator", plaques: "mdi:stove", cheminee: "mdi:fireplace", voiture: "mdi:car-electric", lit_double: "mdi:bed", lit_simple: "mdi:bed-single" };
// ---------- meubles personnalisés (`type: forme`, « Créer un meuble ») : forme composée de primitives ----------
// Chaque primitive : { genre: rect | arrondi | ellipse | trait | polygone, x, y, l, h (en % de la largeur / profondeur, depuis le coin
// haut gauche ; le meuble peut donc changer de taille), rayon (cm, rectangle arrondi), points ([[x, y]…] en %, trait et polygone),
// style: plein | vide | tirets }. Valeurs bornées (au centième), primitives inconnues retirées : un YAML ou un modèle importé ne dessine que des
// rectangles, ellipses et traits (aucun texte libre n'arrive dans le SVG).
const GENRES_FORME = ["rect", "arrondi", "ellipse", "trait", "polygone"], STYLES_FORME = ["plein", "vide", "tirets"];
const MAX_PRIMITIVES = 40, MAX_POINTS = 24;
const borneF = (v, a, b, d = 0) => { const n = Number.isFinite(+v) && v !== "" && v !== null && typeof v !== "boolean" ? +v : d; return Math.round(Math.max(a, Math.min(b, n)) * 100) / 100; };
function normaliserForme(l) {
  if (!Array.isArray(l)) return [];
  const out = [];
  for (const p of l) {
    if (out.length >= MAX_PRIMITIVES) break;
    if (!p || typeof p !== "object" || Array.isArray(p) || !GENRES_FORME.includes(p.genre)) continue;
    const q = { genre: p.genre };
    if (p.genre === "trait" || p.genre === "polygone") {
      const pts = (Array.isArray(p.points) ? p.points : []).filter((x) => Array.isArray(x) && x.length >= 2 && num(x[0]) && num(x[1])).slice(0, MAX_POINTS)
        .map(([x, y]) => [borneF(x, -50, 150), borneF(y, -50, 150)]);
      if (pts.length < (p.genre === "trait" ? 2 : 3)) continue;
      q.points = pts;
    } else {
      q.x = borneF(p.x, -50, 150); q.y = borneF(p.y, -50, 150); q.l = borneF(p.l, 0, 200, 100); q.h = borneF(p.h, 0, 200, 100);
      if (p.genre === "arrondi") q.rayon = borneF(p.rayon, 0, 500, 8);
    }
    if (STYLES_FORME.includes(p.style) && p.style !== "plein") q.style = p.style;
    out.push(q);
  }
  return out;
}
// SVG d'une forme dans le repère du meuble (centre 0,0) ; w, h = taille en cm
function dessinForme(l, w, h) {
  const X = (v) => +(-w / 2 + (v * w) / 100).toFixed(1), Y = (v) => +(-h / 2 + (v * h) / 100).toFixed(1), Lg = (v) => +((v * w) / 100).toFixed(1), Ht = (v) => +((v * h) / 100).toFixed(1);
  const forme = normaliserForme(l);
  if (!forme.length) return R_(-w / 2, -h / 2, w, h, 3);
  return forme.map((p) => {
    const cl = p.genre === "trait" ? `ligne${p.style === "tirets" ? " tirets" : ""}` : [p.style === "vide" ? "vide" : "", p.style === "tirets" ? "tirets" : ""].filter(Boolean).join(" ");
    if (p.genre === "trait" || p.genre === "polygone") return `<path${cl ? ` class="${cl}"` : ""} d="M${p.points.map(([x, y]) => `${X(x)} ${Y(y)}`).join("L")}${p.genre === "polygone" ? "Z" : ""}"/>`;
    const x = X(p.x), y = Y(p.y), lw = Lg(p.l), lh = Ht(p.h);
    if (p.genre === "ellipse") return `<ellipse${cl ? ` class="${cl}"` : ""} cx="${+(x + lw / 2).toFixed(1)}" cy="${+(y + lh / 2).toFixed(1)}" rx="${+(lw / 2).toFixed(1)}" ry="${+(lh / 2).toFixed(1)}"/>`;
    return R_(x, y, lw, lh, p.genre === "arrondi" ? Math.min(p.rayon, lw / 2, lh / 2) : 1, cl);
  }).join("");
}
// taille = [largeur, profondeur] dans le repère du meuble, AVANT rotation ; type inconnu → rectangle (jamais supprimé)
const dessinMeuble = (m) => {
  const def = MEUBLES[m.type], [w, h] = (m.taille || def?.taille || [60, 60]).map((v) => bornerTaille(v));
  // meuble personnalisé : sa forme, teintée de sa couleur (validée) ; connecté, la teinte d'accent prend le dessus
  const teinte = m.type === "forme" ? couleurSure(m.couleur) : null;
  const corps = m.type === "forme" ? `<g class="forme${teinte ? " colore" : ""}"${teinte ? ` style="--mb-teinte:${esc(teinte)}"` : ""}>${dessinForme(m.forme, w, h)}</g>`
    : def ? def.d(w, h, m) : R_(-w / 2, -h / 2, w, h, 3);
  return `<g class="meuble${m.type === "espace" ? " zone" : ""}" transform="translate(${nb(m.pos?.[0])} ${nb(m.pos?.[1])}) rotate(${nb(m.rotation)})${m.miroir ? " scale(-1 1)" : ""}">${corps}</g>`;
};
// ---------- ouvertures : baie qui coupe le mur, traits selon le type, battants (plan et aperçu de l'atelier) ----------
// fenêtre : deux traits de part et d'autre de l'axe, le long de la normale (dehors) ; sans capteur ni dehors, de la perpendiculaire
function traitsOuverture(o) {
  const [a, b, d, e] = o.seg, [nx, ny] = o.dehors || [0, 0];
  const capteur = !!(o.contact || o.entite), L = Math.hypot(d - a, e - b) || 1, px = -(e - b) / L, py = (d - a) / L; // perpendiculaire au mur
  const [fx, fy] = nx || ny || capteur ? [nx, ny] : [px, py];
  let traits;
  if (o.volet_seul) traits = "";
  else if (o.type === "fenetre") traits = `<path class="trait" d="M${a + fx * 3} ${b + fy * 3}L${d + fx * 3} ${e + fy * 3}M${a - fx * 3} ${b - fy * 3}L${d - fx * 3} ${e - fy * 3}"/>`;
  else traits = `<path class="trait" d="M${a} ${b}L${d} ${e}"/>`
    + (capteur ? "" : `<path class="jambage" d="M${+(a - px * 5.5).toFixed(2)} ${+(b - py * 5.5).toFixed(2)}L${+(a + px * 5.5).toFixed(2)} ${+(b + py * 5.5).toFixed(2)}M${+(d - px * 5.5).toFixed(2)} ${+(e - py * 5.5).toFixed(2)}L${+(d + px * 5.5).toFixed(2)} ${+(e + py * 5.5).toFixed(2)}"/>`);
  const baie = o.volet_seul ? "" : `<path class="baie" d="M${a} ${b}L${d} ${e}"/>`;
  return { baie, traits: traits + dessinBattants(o) };
}
// battants (`battants` 1 ou 2, `ouvrant` gauche | droite | coulissant, `vers_dehors`) : dessinés seulement si `ouvrant` est réglé
// (une config sans ces clés s'affiche à l'identique). Gauche / droite : côté des gonds vu de l'intérieur, face au dehors ;
// la feuille s'ouvre vers l'intérieur (vers l'extérieur avec `vers_dehors`), avec son arc. Coulissant : deux panneaux décalés.
const OUVRANTS = ["gauche", "droite", "coulissant"];
function dessinBattants(o) {
  if (!OUVRANTS.includes(o.ouvrant) || o.volet_seul) return "";
  const [a, b, d, e] = o.seg.map(Number), L = Math.hypot(d - a, e - b);
  if (!(L > 1)) return "";
  const ux = (d - a) / L, uy = (e - b) / L, r = (v) => +v.toFixed(1), deux = +o.battants === 2;
  let [nx, ny] = (o.dehors || [0, 0]).map(Number);
  const nl = Math.hypot(nx, ny);
  if (nl) { nx /= nl; ny /= nl; } else { nx = -uy; ny = ux; }
  if (o.ouvrant === "coulissant") {
    const k = deux ? 0.55 : 0.6, dec = 2.5;
    const p1 = `M${r(a + nx * dec)} ${r(b + ny * dec)}L${r(a + ux * L * k + nx * dec)} ${r(b + uy * L * k + ny * dec)}`;
    const p2 = `M${r(d - nx * dec)} ${r(e - ny * dec)}L${r(d - ux * L * k - nx * dec)} ${r(e - uy * L * k - ny * dec)}`;
    return `<path class="battant" d="${p1}${p2}"/>`;
  }
  const sv = o.vers_dehors === true ? 1 : -1, vx = nx * sv, vy = ny * sv;
  const feuille = (hx, hy, tx, ty, l) => {
    const fx = hx + vx * l, fy = hy + vy * l, sw = vx * (ty - hy) - vy * (tx - hx) > 0 ? 1 : 0;
    return [`M${r(hx)} ${r(hy)}L${r(fx)} ${r(fy)}`, `M${r(fx)} ${r(fy)}A${r(l)} ${r(l)} 0 0 ${sw} ${r(tx)} ${r(ty)}`];
  };
  let f;
  if (deux) {
    const mx = (a + d) / 2, my = (b + e) / 2, f1 = feuille(a, b, mx, my, L / 2), f2 = feuille(d, e, mx, my, L / 2);
    f = [f1[0] + f2[0], f1[1] + f2[1]];
  } else {
    // gonds à gauche vu de l'intérieur (face au dehors n, la gauche est (ny, -nx)) ou à droite
    const lx = ny, ly = -nx, aGauche = a * lx + b * ly >= d * lx + e * ly, gauche = o.ouvrant === "gauche";
    f = aGauche === gauche ? feuille(a, b, d, e, L) : feuille(d, e, a, b, L);
  }
  return `<path class="battant" d="${f[0]}"/><path class="battant arc" d="${f[1]}"/>`;
}
// niveau dans le calque Meubles : tapis et espaces dessous (-1) quel que soit l'ordre de pose, sauf niveau choisi
const niveauMeuble = (m) => nb(m.niveau, MEUBLES[m.type]?.niveau === 0 ? -1 : 0);

