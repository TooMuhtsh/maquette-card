// calques, niveaux, booléens, géométrie (normaliserGeometrie) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- calques : un par genre d'élément ; deux groupes ordonnables, le HTML (étiquettes, pastilles) toujours au-dessus du SVG ----------
// ordre par défaut = ordre de dessin d'avant les calques (une config sans `calques` s'affiche à l'identique)
const CALQUES_SVG = ["pieces", "sous_zones", "halos", "meubles", "limites", "murs", "ouvertures"];
const CALQUES_HTML = ["etiquettes", "libelles", "appareils", "textes"];
// image de fond (`background`) : sous tout le dessin, dessinée à part (crochet _dessinerFond de _construire) ; acceptée dans les
// listes de `layers` (ordre, masqués, verrouillés)
const CALQUE_FOND = "fond", CALQUES_SVG_CONFIG = [CALQUE_FOND, ...CALQUES_SVG];
const NOMS_CALQUES = { fond: _tk("Image de fond"), pieces: _tk("Pièces"), sous_zones: _tk("Sous-zones"), halos: _tk("Halos de lumière"), meubles: _tk("Meubles"), limites: _tk("Limites"), murs: _tk("Murs"), ouvertures: _tk("Ouvertures"),
  etiquettes: _tk("Étiquettes des pièces"), libelles: _tk("Étiquettes des zones"), appareils: _tk("Appareils"), textes: _tk("Textes") };
const ICONES_CALQUES = { fond: "mdi:image-outline", pieces: "mdi:floor-plan", sous_zones: "mdi:selection-drag", halos: "mdi:lightbulb-on-outline", meubles: "mdi:sofa-outline", limites: "mdi:fence", murs: "mdi:wall",
  ouvertures: "mdi:window-closed-variant", etiquettes: "mdi:label-outline", libelles: "mdi:format-letter-case", appareils: "mdi:circle-slice-8", textes: "mdi:format-text" };
// ordre effectif : les calques connus de la liste, puis ceux qui manquent dans l'ordre par défaut
const ordreCalques = (l, def) => [...new Set([...(Array.isArray(l) ? l.filter((x) => def.includes(x)) : []), ...def])];
// YAML écrit à la main : listes de calques inconnus retirés, valeurs invalides supprimées (jamais d'erreur)
function normaliserCalques(q) {
  if (!q || typeof q !== "object" || Array.isArray(q)) return null;
  const n = { ...q }, tous = [...CALQUES_SVG_CONFIG, ...CALQUES_HTML];
  for (const [k, ok] of [["ordre_svg", CALQUES_SVG_CONFIG], ["ordre_html", CALQUES_HTML], ["masques", tous], ["verrous", tous]]) {
    if (!(k in n)) continue;
    if (Array.isArray(n[k])) n[k] = [...new Set(n[k].filter((x) => ok.includes(x)))]; else delete n[k];
  }
  if ("bouton_vue" in n && typeof n.bouton_vue !== "boolean") n.bouton_vue = !!n.bouton_vue;
  return n;
}
// `niveau` (ordre dans son calque) et `masque` (caché en vue) par élément : nombre et booléen, sinon retirés (chemin noté dans
// rapport.retires : ch = chemin interne de la liste)
const normaliserNiveaux = (l, rapport, ch = []) => (Array.isArray(l) ? l.map((o, i) => {
  if (!o || typeof o !== "object" || Array.isArray(o) || !("niveau" in o || "masque" in o)) return o;
  const n = { ...o };
  if ("niveau" in n) { if ((typeof n.niveau === "number" || (typeof n.niveau === "string" && n.niveau.trim())) && Number.isFinite(+n.niveau)) n.niveau = +n.niveau; else { delete n.niveau; if (rapport) (rapport.retires ||= []).push(cheminPublic([...ch, i, "niveau"])); } }
  if ("masque" in n && typeof n.masque !== "boolean") n.masque = !!n.masque;
  return n;
}) : l);
// booléens écrits en texte dans le YAML (« false », « non », « 0 »…) : remis en vrai booléen, partout dans la config ; les autres textes ne sont pas touchés
const CLES_BOOL = new Set(["sous_zone", "dehors", "zoom", "masque", "teinte", "protege", "miroir", "alerte", "volet_seul", "auto_actions", "automatismes", "confirmer",
  "plein_ecran", "bouton_vue", "jour_nuit", "si_absent", "moyenne", "pastilles", "marqueur", "afficher_meubles", "vitrine", "replay", "edition", "legende", "teinte_temperature", "verrouille", "zoom_seul"]);
const FAUX = /^\s*(false|faux|non|no|off|0)\s*$/i, VRAI = /^\s*(true|vrai|oui|yes|on|1)\s*$/i;
// (les clés __proto__, constructor et prototype d'un fichier importé sont écartées au passage)
const CLES_PROTO = new Set(["__proto__", "constructor", "prototype"]);
const booleens = (v, k) => (Array.isArray(v) ? v.map((x) => booleens(x)) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([c]) => !CLES_PROTO.has(c)).map(([c, x]) => [c, booleens(x, c)]))
  : typeof v === "string" && CLES_BOOL.has(k) ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v);
// géométrie écrite à la main : nombres en texte convertis ; pièce sans contour (3 sommets valides), mur, ouverture, pastille ou texte sans coordonnées : ignorés
const num = (v) => (typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v));
// coordonnée du plan (cm) : un nombre dans ± 1 km ; au-delà (1e12…), le dessin, le cadrage et l'éditeur n'ont plus de sens :
// la coordonnée est invalide comme un texte (sommet, mur, ouverture, pastille, texte ou meuble ignoré ; point annexe retiré)
const COORD_MAX = 1e5;
const coord = (v) => num(v) && Math.abs(+v) <= COORD_MAX;
const point = (q) => Array.isArray(q) && q.length >= 2 && coord(q[0]) && coord(q[1]);
const seg = (s) => Array.isArray(s) && s.length >= 4 && s.slice(0, 4).every(coord);
// coordonnées réduites à leurs nombres : rien d'autre qu'un nombre fini n'arrive dans un attribut du SVG (un sommet [x, y, "…"]
// perd sa 3e valeur) ; un mur ou une limite garde seulement son groupe en 5e valeur (identifiant sûr)
const ID_SUR = /^[\w.:-]{1,80}$/;
const nbs = (q, n) => q.slice(0, n).map(Number);
// (pre : chemin interne de la géométrie, [] à la racine, ["etages", n] pour un étage ; le rapport cumule les étages)
function normaliserGeometrie(c, rapport, pre = []) {
  let ign = 0;
  const retires = [];
  const garde = (l, ok, fix) => { if (!Array.isArray(l)) return l; const r = []; l.forEach((o, j) => { if (ok(o)) r.push(fix(o, j)); else ign++; }); return r; };
  c.pieces = garde(c.pieces, (p) => p && typeof p === "object" && !Array.isArray(p) && Array.isArray(p.poly) && p.poly.filter(point).length >= 3, (p, i) => {
    const n = { ...p, poly: p.poly.filter(point).map((q) => nbs(q, 2)) };
    if (p.poly.some((q) => !point(q) || q.length > 2)) retires.push(["pieces", i, "poly"]);
    if ("etiquette" in n) {
      if (point(n.etiquette)) { if (n.etiquette.length > 2) retires.push(["pieces", i, "etiquette"]); n.etiquette = nbs(n.etiquette, 2); }
      else { delete n.etiquette; retires.push(["pieces", i, "etiquette"]); }
    }
    return n;
  });
  for (const k of ["murs", "limites"]) c[k] = garde(c[k], seg, (s, i) => {
    const g = s.length === 5 && typeof s[4] === "string" && ID_SUR.test(s[4]) ? [s[4]] : [];
    if (s.length > 4 + g.length) retires.push([k, i]);
    return [...nbs(s, 4), ...g];
  });
  c.ouvertures = garde(c.ouvertures, (o) => o && typeof o === "object" && seg(o.seg), (o, i) => { if (o.seg.length > 4) retires.push(["ouvertures", i, "seg"]); return { ...o, seg: nbs(o.seg, 4) }; });
  for (const k of ["points", "textes"]) c[k] = garde(c[k], (o) => o && typeof o === "object" && point(o.pos), (o, i) => { if (o.pos.length > 2) retires.push([k, i, "pos"]); return { ...o, pos: nbs(o.pos, 2) }; });
  // meuble : sans position, il reste à l'origine (comme avant) ; une position hors des bornes l'écarte
  c.meubles = garde(c.meubles, (m) => !(objetSimple(m) && Array.isArray(m.pos) && m.pos.slice(0, 2).some((v) => num(v) && !coord(v))), (m) => m);
  if (rapport) { rapport.ignores = (rapport.ignores || 0) + ign; if (retires.length) (rapport.retires ||= []).push(...retires.map((r) => cheminPublic([...pre, ...r]))); }
  return c;
}
// géométrie d'un plan (racine d'un plan à un étage, ou un étage) : coordonnées, meubles, fiches, ouvertures, panneaux des pièces, niveaux
function normaliserGeo(c, rapport, pre = []) {
  if (!("pieces" in c)) c.pieces = [];
  if (!Array.isArray(c.pieces)) throw new Error(`maquette-card : « ${cheminPublic([...pre, "pieces"])} » must be a list`);
  normaliserGeometrie(c, rapport, pre);
  if ("meubles" in c) c.meubles = normaliserMeubles(c.meubles);
  for (const k of ["ouvertures", "points"]) if (Array.isArray(c[k])) c[k] = normaliserPorteurs(c[k]);
  if (Array.isArray(c.ouvertures)) c.ouvertures = normaliserOuvertures(c.ouvertures);
  c.pieces = c.pieces.map((p) => { const q = p?.panneaux && normaliserPanneaux(p.panneaux); return q && q !== p.panneaux ? { ...p, panneaux: q } : p; });
  for (const k of ["pieces", "points", "textes", "ouvertures", "meubles"]) if (Array.isArray(c[k])) c[k] = normaliserNiveaux(c[k], rapport, [...pre, k]);
  if ("panneaux" in c) c.panneaux = normaliserPanneaux(c.panneaux);
  return c;
}
