// meubles : stockage sûr, jauges, symboles vus du dessus, catalogue MEUBLES — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- meubles : symboles vus du dessus, dans le repère du meuble (centre 0,0 ; dos en haut) ----------
const nb = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
// côté d'un meuble : 5 à 5000 cm (lecture de la config, dessin, éditeur)
const TAILLE_MEUBLE_MAX = 5000, bornerTaille = (v, d = 60) => Math.max(5, Math.min(TAILLE_MEUBLE_MAX, nb(v, d)));
// stockage du navigateur : accès sûr (navigation privée, stockage bloqué) ; session = sessionStorage, sinon localStorage
const stockage = (session) => {
  const S = () => (session ? sessionStorage : localStorage);
  return {
    lire: (k) => { try { return S().getItem(k); } catch (e) { return null; } },
    ecrire: (k, v) => { try { S().setItem(k, v); return true; } catch (e) { return false; } },
    retirer: (k) => { try { S().removeItem(k); } catch (e) { /* stockage indisponible */ } },
  };
};
const stock = stockage(false), stockSession = stockage(true);
// éditeur à rouvrir après l'enregistrement (la carte est recréée) ; versions enregistrées d'un plan
const cleRouvrir = (id) => `maquette-rouvrir:${id || "plan"}`, cleVersions = (id) => `maquette-versions:${id}`;
// couleur d'une jauge selon ses seuils { vert, jaune, rouge } : celle dont la valeur de départ est la plus haute sous la mesure
// (comme la carte Jauge de HA : { vert: 0, jaune: 800, rouge: 1200 } pour le CO₂, { rouge: 0, jaune: 20, vert: 50 } pour une batterie)
const COULEURS_SEUILS = { vert: "#188038", jaune: "#e8710a", rouge: "#d93025" };
const couleurSeuils = (seuils, n) => {
  let c = null, haut = -Infinity;
  for (const [k, col] of Object.entries(COULEURS_SEUILS)) { const v = seuils[k]; if (v === "" || v == null || !Number.isFinite(+v)) continue; if (+v <= n && +v >= haut) { haut = +v; c = col; } }
  return c;
};
// sommets d'un polygone pour l'attribut points (deux nombres par sommet, rien d'autre)
const ptsSvg = (poly) => poly.map((q) => `${+q[0]},${+q[1]}`).join(" ");
// escalier relié à un autre étage (`floor`) : petite pastille avec une flèche, droite à l'écran quel que soit l'angle du meuble ;
// ↑ par défaut, la carte la tourne (↓) quand l'étage visé est en dessous (ordre de `floors`)
const flecheEscalier = (w, h, m) => {
  const r = Math.max(3, Math.min(9, w * 0.14, h * 0.1)), cx = +(w / 4).toFixed(1), cy = +(h / 2 - r - 3).toFixed(1), a = r * 0.55;
  return `<g class="esc-fleche" transform="translate(${cx} ${cy}) ${m.miroir ? "scale(-1 1) " : ""}rotate(${-nb(m.rotation)})"><circle r="${r}"/>`
    + `<path class="ligne esc-sens" d="M0 ${a}V${-a}M${-a * 0.7} ${-a * 0.15}L0 ${-a}L${a * 0.7} ${-a * 0.15}"/></g>`;
};
const R_ = (x, y, w, h, rx = 3, cl = "") => `<rect${cl ? ` class="${cl}"` : ""} x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="${rx}"/>`;
const C_ = (x, y, r, cl = "") => `<circle${cl ? ` class="${cl}"` : ""} cx="${x}" cy="${y}" r="${Math.max(0, r)}"/>`;
const L_ = (x1, y1, x2, y2, cl = "") => `<path class="ligne${cl ? ` ${cl}` : ""}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
const E_ = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${Math.max(0, rx)}" ry="${Math.max(0, ry)}"/>`;
function chaises(w, h, n, rond) {
  const c = 42, out = [];
  if (rond) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 2 * Math.PI - Math.PI / 2, rr = w / 2 + 10;
      out.push(`<g transform="translate(${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})">${R_(-c / 2, -c / 2, c, c, 6)}</g>`);
    }
    return out.join("");
  }
  const bouts = n >= 6 || (n === 4 && Math.abs(w - h) < 20) ? 2 : 0, cotes = n - bouts, haut = Math.ceil(cotes / 2), bas = cotes - haut;
  const ligne = (k, y) => { for (let j = 0; j < k; j++) out.push(R_(-w / 2 + (w * (j + 0.5)) / k - c / 2, y, c, c, 6)); };
  ligne(haut, -h / 2 - c + 12); ligne(bas, h / 2 - 12);
  if (bouts) out.push(R_(-w / 2 - c + 12, -c / 2, c, c, 6), R_(w / 2 - 12, -c / 2, c, c, 6));
  return out.join("");
}
function canape(w, h, places) {
  const dos = h * 0.25, bras = Math.min(25, w * 0.12), n = places || Math.max(1, Math.round((w - 2 * bras) / 65));
  let s = R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2, -h / 2, w, dos, 4) + R_(-w / 2, -h / 2, bras, h, 5) + R_(w / 2 - bras, -h / 2, bras, h, 5);
  for (let k = 1; k < n; k++) { const x = -w / 2 + bras + ((w - 2 * bras) * k) / n; s += L_(x, -h / 2 + dos, x, h / 2); }
  return s;
}
function lit(w, h, oreillers) {
  const o = 26, m = 8;
  let s = R_(-w / 2, -h / 2, w, h, 4);
  if (oreillers === 2) s += R_(-w / 2 + m, -h / 2 + m, w / 2 - 1.5 * m, o, 6) + R_(m / 2, -h / 2 + m, w / 2 - 1.5 * m, o, 6);
  else if (oreillers === 1) s += R_(-w * 0.35, -h / 2 + m, w * 0.7, o, 6);
  const y = -h / 2 + o + 2 * m + 8;
  return s + L_(-w / 2, y, w / 2, y) + `<path class="ligne" d="M${w / 2 - 28} ${y}L${w / 2} ${y + 28}"/>`;
}
const MEUBLES = {
  canape: { nom: _tk("Canapé"), cat: _tk("Séjour"), taille: [200, 90], d: (w, h) => canape(w, h) },
  canape_angle: { nom: _tk("Canapé d'angle"), cat: _tk("Séjour"), taille: [250, 200], d: (w, h) => {
    const p = Math.min(90, h * 0.45, w * 0.4), dos = p * 0.25;
    return `<path d="M${-w / 2} ${-h / 2}H${w / 2}V${-h / 2 + p}H${-w / 2 + p}V${h / 2}H${-w / 2}Z"/>` + R_(-w / 2, -h / 2, w, dos, 4) + R_(-w / 2, -h / 2, dos, h, 4)
      + R_(w / 2 - 22, -h / 2, 22, p, 5) + R_(-w / 2, h / 2 - 22, p, 22, 5) + L_(-w / 2 + p, -h / 2 + dos, -w / 2 + p, -h / 2 + p); } },
  fauteuil: { nom: _tk("Fauteuil"), cat: _tk("Séjour"), taille: [80, 80], d: (w, h) => canape(w, h, 1) },
  table_basse: { nom: _tk("Table basse"), cat: _tk("Séjour"), taille: [100, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4, "vide") },
  meuble_tv: { nom: _tk("Meuble TV"), cat: _tk("Séjour"), taille: [160, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 6, -h / 2, -w / 6, h / 2) + L_(w / 6, -h / 2, w / 6, h / 2) },
  etagere: { nom: _tk("Étagère"), cat: _tk("Séjour"), taille: [100, 35], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, 0, w / 2, 0, "tirets") },
  tapis: { nom: _tk("Tapis"), cat: _tk("Séjour"), taille: [200, 140], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4, "tirets") + R_(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 3, "tirets vide") },
  plante: { nom: _tk("Plante"), cat: _tk("Séjour"), taille: [45, 45], d: (w) => [0, 1, 2, 3, 4, 5].map((k) => C_(Math.cos(k * 1.047) * w * 0.27, Math.sin(k * 1.047) * w * 0.27, w * 0.2)).join("") + C_(0, 0, w * 0.16) },
  table_carree: { nom: _tk("Table carrée"), cat: _tk("Repas"), taille: [90, 90], chaises: 4, d: (w, h, m) => chaises(w, h, nb(m.chaises, 4)) + R_(-w / 2, -h / 2, w, h, 4) },
  table_rect: { nom: _tk("Table rectangulaire"), cat: _tk("Repas"), taille: [160, 90], chaises: 6, d: (w, h, m) => chaises(w, h, nb(m.chaises, 6)) + R_(-w / 2, -h / 2, w, h, 4) },
  table_ronde: { nom: _tk("Table ronde"), cat: _tk("Repas"), taille: [110, 110], chaises: 4, rond: true, d: (w, h, m) => chaises(w, h, nb(m.chaises, 4), true) + E_(0, 0, w / 2, h / 2) },
  chaise: { nom: _tk("Chaise"), cat: _tk("Repas"), taille: [45, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2, -h / 2, w, h * 0.2, 3) },
  plan_travail: { nom: _tk("Plan de travail"), cat: _tk("Cuisine"), taille: [240, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, h / 2 - 6, w / 2, h / 2 - 6) },
  evier: { nom: _tk("Évier"), cat: _tk("Cuisine"), taille: [100, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + R_(-w / 2 + 8, -h / 2 + 14, w / 2 - 12, h - 22, 8, "vide") + R_(4, -h / 2 + 14, w / 2 - 12, h - 22, 8, "vide") + C_(0, -h / 2 + 7, 3) },
  plaques: { nom: _tk("Plaques de cuisson"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => C_(a * w * 0.22, b * h * 0.22, Math.min(w, h) * (a < 0 ? 0.16 : 0.12), "vide")).join("") },
  refrigerateur: { nom: _tk("Réfrigérateur"), cat: _tk("Cuisine"), taille: [60, 65], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) + L_(-w / 2 + 6, -h / 2 + 6, w / 2 - 6, h / 2 - 14, "tirets") },
  lave_linge: { nom: _tk("Lave-linge"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + C_(0, 2, Math.min(w, h) * 0.3, "vide") },
  lave_vaisselle: { nom: _tk("Lave-vaisselle"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) + L_(-w / 2 + 8, -h / 2 + 10, w / 2 - 8, -h / 2 + 10, "tirets") },
  lit_simple: { nom: _tk("Lit simple"), cat: _tk("Chambre et bureau"), taille: [90, 190], d: (w, h) => lit(w, h, 1) },
  lit_double: { nom: _tk("Lit double"), cat: _tk("Chambre et bureau"), taille: [160, 200], d: (w, h) => lit(w, h, 2) },
  lit_bebe: { nom: _tk("Lit bébé"), cat: _tk("Chambre et bureau"), taille: [60, 120], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + R_(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 2, "tirets vide") },
  armoire: { nom: _tk("Armoire"), cat: _tk("Chambre et bureau"), taille: [120, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2 + 6, 0, w / 2 - 6, 0, "tirets") + L_(0, h / 2 - 10, 0, h / 2) },
  commode: { nom: _tk("Commode"), cat: _tk("Chambre et bureau"), taille: [100, 50], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) },
  bureau: { nom: _tk("Bureau"), cat: _tk("Chambre et bureau"), taille: [140, 70], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + `<g class="chaise">${R_(-22, h / 2 - 8, 44, 44, 8)}${R_(-22, h / 2 + 28, 44, 8, 3)}</g>` },
  douche: { nom: _tk("Douche"), cat: _tk("Salle d'eau"), taille: [90, 90], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, -h / 2, w / 2, h / 2) + L_(w / 2, -h / 2, -w / 2, h / 2) + C_(0, 0, 5) },
  baignoire: { nom: _tk("Baignoire"), cat: _tk("Salle d'eau"), taille: [170, 75], d: (w, h) => R_(-w / 2, -h / 2, w, h, 8) + R_(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, Math.min(30, h / 2 - 8), "vide") + C_(w / 2 - 22, 0, 4) },
  lavabo: { nom: _tk("Lavabo"), cat: _tk("Salle d'eau"), taille: [60, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + E_(0, 4, w * 0.32, h * 0.28) + C_(0, -h / 2 + 7, 3) },
  wc: { nom: _tk("WC"), cat: _tk("Salle d'eau"), taille: [40, 65], d: (w, h) => R_(-w / 2, -h / 2, w, 18, 3) + E_(0, -h / 2 + 18 + (h - 18) * 0.48, w * 0.42, (h - 18) * 0.48) },
  chaudiere: { nom: _tk("Chaudière"), cat: _tk("Technique"), taille: [45, 35], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(0, 0, Math.min(w, h) * 0.28, "vide") + L_(0, -Math.min(w, h) * 0.28, 0, Math.min(w, h) * 0.28) },
  ballon: { nom: _tk("Ballon d'eau chaude"), cat: _tk("Technique"), taille: [55, 55], rond: true, d: (w, h) => E_(0, 0, w / 2, h / 2) + C_(0, 0, Math.min(w, h) * 0.3, "vide") },
  espace: { nom: _tk("Espace nommé"), cat: _tk("Formes et espaces"), niveau: 0, taille: [300, 200], aide: _tk("Coin cuisine, coin bureau… : pointillés et un nom, sans capteur (ce n'est pas une pièce)"), d: (w, h) => R_(-w / 2, -h / 2, w, h, 6, "tirets zone-fond") },
  rect: { nom: _tk("Rectangle libre"), cat: _tk("Formes et espaces"), taille: [100, 60], aide: _tk("N'importe quel meuble ou objet, avec un nom"), d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) },
  cercle: { nom: _tk("Cercle libre"), cat: _tk("Formes et espaces"), taille: [60, 60], rond: true, d: (w, h) => E_(0, 0, w / 2, h / 2) },
  escalier: { nom: _tk("Escalier"), cat: _tk("Formes et espaces"), taille: [90, 280], mots: "marches", d: (w, h, m) => {
    const n = Math.max(3, Math.round(h / 25)); let s = R_(-w / 2, -h / 2, w, h, 1);
    for (let k = 1; k < n; k++) { const y = -h / 2 + (h * k) / n; s += L_(-w / 2, y, w / 2, y); }
    return s + `<path class="ligne" d="M0 ${h / 2 - 10}V${-h / 2 + 14}M-8 ${-h / 2 + 24}L0 ${-h / 2 + 12}L8 ${-h / 2 + 24}"/>` + (typeof m?.etage === "string" ? flecheEscalier(w, h, m) : ""); } },
  // fenêtre de toit vue du dessus : dormant, vitrage bleuté, store (enroulé depuis le haut, hauteur suivie par la carte : `current_position`
  // du `cover`), chevron et trait épais côté bas de la pente (bas du rectangle)
  fenetre_toit: { nom: _tk("Fenêtre de toit"), cat: _tk("Formes et espaces"), taille: [78, 118], mots: "velux lucarne vasistas toit combles skylight", d: (w, h) => {
    const f = +Math.max(2, Math.min(8, w * 0.1, h * 0.1)).toFixed(1), gw = Math.max(0, w - 2 * f), gh = Math.max(0, h - 2 * f), a = Math.max(3, Math.min(10, gw * 0.18, gh * 0.18));
    return R_(-w / 2, -h / 2, w, h, 2) + `<rect class="vx-vitre" x="${-w / 2 + f}" y="${-h / 2 + f}" width="${gw}" height="${gh}" rx="1" style="fill:color-mix(in srgb,#4fc3f7 32%,var(--plan-meuble))"/>`
      + `<rect class="vx-store" x="${-w / 2 + f}" y="${-h / 2 + f}" width="${gw}" height="0" data-h="${gh}" style="fill:color-mix(in srgb,var(--plan-meuble-trait) 45%,var(--plan-meuble))"/>`
      + `<path class="ligne vx-sens" d="M${-a} ${+(h / 2 - f - a * 1.6).toFixed(1)}L0 ${+(h / 2 - f - a * 0.6).toFixed(1)}L${a} ${+(h / 2 - f - a * 1.6).toFixed(1)}"/>`
      + `<path class="ligne vx-bas" d="M${-w / 2} ${h / 2}H${w / 2}" style="stroke-width:2.6px"/>`; } },
  table_nuit: { nom: _tk("Table de nuit"), cat: _tk("Chambre et bureau"), taille: [45, 40], mots: "chevet", d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(0, 0, Math.min(w, h) * 0.18, "vide") },
  cheminee: { nom: _tk("Cheminée / poêle"), cat: _tk("Séjour"), taille: [100, 50], mots: "poele foyer insert", d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + `<path class="ligne" d="M${-w * 0.3} ${h / 2}V${-h * 0.1}Q0 ${-h * 0.45} ${w * 0.3} ${-h * 0.1}V${h / 2}"/>` },
  radiateur: { nom: _tk("Radiateur"), cat: _tk("Technique"), taille: [80, 12], mots: "chauffage", d: (w, h) => {
    let s = R_(-w / 2, -h / 2, w, h, 2); for (let k = 1; k < Math.round(w / 8); k++) { const x = -w / 2 + k * 8; s += L_(x, -h / 2, x, h / 2); } return s; } },
  tableau_elec: { nom: _tk("Tableau électrique"), cat: _tk("Technique"), taille: [50, 15], mots: "disjoncteur linky compteur", d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + `<path class="ligne" d="M${-w * 0.08} ${-h * 0.35}L${-w * 0.16} ${h * 0.05}H${w * 0.1}L${w * 0.02} ${h * 0.4}"/>` },
  box: { nom: _tk("Box internet / NAS"), cat: _tk("Technique"), taille: [35, 25], mots: "routeur serveur nas wifi", d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + C_(-w * 0.25, 0, 2) + C_(0, 0, 2) + C_(w * 0.25, 0, 2) },
  borne_recharge: { nom: _tk("Borne de recharge"), cat: _tk("Technique"), taille: [30, 20], mots: "wallbox voiture electrique prise", d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + `<path class="ligne" d="M2 ${-h * 0.35}L${-4} 1H3L-2 ${h * 0.35}"/>` },
  pac: { nom: _tk("Pompe à chaleur / clim (extérieur)"), cat: _tk("Technique"), taille: [90, 35], mots: "pac climatisation groupe", d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(w * 0.15, 0, h * 0.38, "vide") + L_(w * 0.15 - h * 0.3, 0, w * 0.15 + h * 0.3, 0) },
  // vue de dessus d'une citadine (avant en haut) : caisse aux angles arrondis, pare-brise et lunette, toit, rétroviseurs, roues
  voiture: { nom: _tk("Voiture"), cat: _tk("Extérieur"), taille: [178, 406], mots: "auto carport garage", d: (w, h) => {
    const u = w / 2, v = h / 2, y = (k) => -v + k * h;
    const caisse = `<path d="M${-u * 0.68} ${-v}H${u * 0.68}Q${u} ${-v} ${u} ${y(0.13)}V${v - 0.09 * h}Q${u} ${v} ${u * 0.72} ${v}H${-u * 0.72}Q${-u} ${v} ${-u} ${v - 0.09 * h}V${y(0.13)}Q${-u} ${-v} ${-u * 0.68} ${-v}Z"/>`;
    const roue = (sx, k) => R_(sx < 0 ? -u - w * 0.03 : u - w * 0.05, y(k), w * 0.08, h * 0.12, 3);
    return roue(-1, 0.13) + roue(1, 0.13) + roue(-1, 0.72) + roue(1, 0.72) + caisse
      + `<path class="vide" d="M${-u * 0.8} ${y(0.4)}L${-u * 0.64} ${y(0.27)}Q0 ${y(0.24)} ${u * 0.64} ${y(0.27)}L${u * 0.8} ${y(0.4)}Q0 ${y(0.37)} ${-u * 0.8} ${y(0.4)}Z"/>`
      + R_(-u * 0.74, y(0.42), w * 0.74, h * 0.29, 8, "vide")
      + `<path class="vide" d="M${-u * 0.74} ${y(0.73)}Q0 ${y(0.75)} ${u * 0.74} ${y(0.73)}L${u * 0.6} ${y(0.83)}Q0 ${y(0.85)} ${-u * 0.6} ${y(0.83)}Z"/>`
      + `<path d="M${-u} ${y(0.33)}L${-u - w * 0.09} ${y(0.31)}V${y(0.36)}L${-u} ${y(0.37)}Z"/><path d="M${u} ${y(0.33)}L${u + w * 0.09} ${y(0.31)}V${y(0.36)}L${u} ${y(0.37)}Z"/>`
      + L_(-u * 0.5, -v + 3, -u * 0.2, -v + 3) + L_(u * 0.2, -v + 3, u * 0.5, -v + 3);
  } },
  velo: { nom: _tk("Vélo"), cat: _tk("Extérieur"), taille: [60, 180], d: (w, h) => C_(0, -h / 2 + 30, 28, "vide") + C_(0, h / 2 - 30, 28, "vide") + L_(0, -h / 2 + 30, 0, h / 2 - 30) + L_(-w / 2 + 6, -h / 2 + 50, w / 2 - 6, -h / 2 + 50) },
  arbre: { nom: _tk("Arbre / arbuste"), cat: _tk("Extérieur"), taille: [200, 200], rond: true, mots: "haie jardin", d: (w) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => C_(Math.cos(k * 0.785) * w * 0.3, Math.sin(k * 0.785) * w * 0.3, w * 0.22)).join("") + C_(0, 0, w * 0.3) },
  piscine: { nom: _tk("Piscine"), cat: _tk("Extérieur"), taille: [800, 400], d: (w, h) => R_(-w / 2, -h / 2, w, h, 20) + R_(-w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 14, "eau") },
};
// tapis et espaces sous les autres meubles, quel que soit l'ordre de pose
MEUBLES.tapis.niveau = 0;
Object.assign(MEUBLES.canape, { mots: "sofa divan" }); Object.assign(MEUBLES.refrigerateur, { mots: "frigo congelateur" }); Object.assign(MEUBLES.wc, { mots: "toilettes" });
Object.assign(MEUBLES.plan_travail, { mots: "cuisine ilot comptoir" }); Object.assign(MEUBLES.lave_linge, { mots: "machine a laver seche linge" });
Object.assign(MEUBLES.chaudiere, { mots: "gaz chauffe eau" }); Object.assign(MEUBLES.armoire, { mots: "placard penderie dressing" }); Object.assign(MEUBLES.plante, { mots: "fleur pot" });
Object.setPrototypeOf(MEUBLES, null); // « constructor », « toString »… ne sont pas des types de meuble
