// YAML, modèles sans entités, clés, nettoyage (projection moteur), anciens exports, points — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// export YAML lisible : objets en bloc, listes de nombres (coordonnées) sur une ligne
function versYaml(v, ind = "") {
  const scal = (x) => {
    if (x == null) return "null";
    if (typeof x !== "string") return String(x);
    const nu = !/^[A-Za-zÀ-ÿ_][^:#'"\n{}\[\],&*!|>%@`]*(:[^\s:#][^:#\n]*)*$/.test(x) || /\s$/.test(x) || /^(true|false|null|yes|no|on|off|y|n|~)$/i.test(x);
    return nu ? JSON.stringify(x) : x;
  };
  const plat = (x) => Array.isArray(x) && x.every((y) => (y === null || typeof y !== "object") || (Array.isArray(y) && y.every((z) => z === null || typeof z !== "object")));
  const ligne = (x) => (Array.isArray(x) ? `[${x.map(ligne).join(", ")}]` : scal(x));
  if (Array.isArray(v)) {
    if (!v.length || plat(v)) return ligne(v);
    return v.map((x) => {
      if (x && typeof x === "object" && !Array.isArray(x)) { const c = versYaml(x, ind + "  "); return `${ind}- ${c.slice(ind.length + 2)}`; }
      return `${ind}- ${Array.isArray(x) && !plat(x) ? `\n${versYaml(x, ind + "  ")}` : ligne(x)}`;
    }).join("\n");
  }
  if (v && typeof v === "object") {
    const e = Object.entries(v).filter(([, x]) => x !== undefined);
    if (!e.length) return `${ind}{}`;
    return e.map(([k, x]) => {
      const kk = scal(k);
      if (x && typeof x === "object" && !(Array.isArray(x) && (!x.length || plat(x))) && !(typeof x === "object" && !Array.isArray(x) && !Object.keys(x).length))
        return `${ind}${kk}:\n${versYaml(x, Array.isArray(x) ? ind : ind + "  ")}`;
      return `${ind}${kk}: ${Array.isArray(x) ? ligne(x) : x && typeof x === "object" ? "{}" : scal(x)}`;
    }).join("\n");
  }
  return ind + scal(v);
}
// clés retirées d'un modèle (entités) : champs entité des widgets, puis ceux des éléments, colonnes et pièces
const CLES_ENTITES = [...CHAMPS_ENTITE_WIDGET, "actif", "valeur", "contact", "volet", "stat", "jour", "semaine", "mois", "annee", "temperature", "humidite", "clic"];
function sansEntites(o) {
  if (Array.isArray(o)) return o.map(sansEntites);
  if (!o || typeof o !== "object") return o;
  const r = {};
  for (const [k, v] of Object.entries(o)) if (!CLES_ENTITES.includes(k)) r[k] = sansEntites(v);
  return r;
}
// fiches : portées par un meuble connecté, une ouverture ou une pastille ; un widget de fiche porte { meuble | ouverture | point: i }
// widget : « widget:<côté>:<i>[:<pièce>] », « widget:fiche:<i>:<meuble> » (fiche d'un meuble), « widget:fiche:<i>:<n>:ouverture | point »
const cle = (s) => { const pf = s.type === "widget" && s.cote === "fiche" ? porteurDe(s) : null;
  return s.type === "widget" ? `widget:${s.cote}:${s.i}${s.piece != null ? `:${s.piece}` : pf ? `:${pf.i}${pf.genre === "meuble" ? "" : `:${pf.genre}`}` : ""}` : `${s.type}:${s.i}`; };
const SERVICES = ["light.turn_off", "light.turn_on", "light.toggle", "switch.turn_off", "switch.turn_on", "cover.open_cover", "cover.close_cover", "cover.stop_cover",
  "scene.turn_on", "script.turn_on", "climate.set_temperature", "climate.set_hvac_mode", "media_player.turn_off", "media_player.media_play_pause", "fan.toggle",
  "vacuum.start", "vacuum.return_to_base", "homeassistant.turn_off", "homeassistant.toggle", "automation.trigger", "input_boolean.toggle", "button.press"];
const A_COMPLETER = { contact: _tk("contact"), volet: _tk("volet"), entite: _tk("entité motorisée"), valeur: _tk("valeur affichée"), actif: _tk("état actif") };
function poserChemin(o, chemin, v) {
  const p = chemin.split("."), num = (s) => /^\d+$/.test(s);
  let x = o;
  for (let i = 0; i < p.length - 1; i++) {
    const k = num(p[i]) ? +p[i] : p[i];
    if (x[k] == null) x[k] = num(p[i + 1]) ? [] : {};
    x = x[k];
  }
  const k = num(p[p.length - 1]) ? +p[p.length - 1] : p[p.length - 1];
  if (Array.isArray(x)) x[k] = v;
  else if (v === "" || v == null || v === false) delete x[k];
  else x[k] = v;
}
const clone = (o) => JSON.parse(JSON.stringify(o));
// contacts d'une ouverture (une entité ou une liste) et liste réécrite : vide → retiré, une seule → une chaîne, comme avant
const contactsOuv = (o) => (Array.isArray(o?.contact) ? o.contact : [o?.contact]).filter((e) => typeof e === "string" && e.includes("."));
const poserContacts = (o, l) => { const u = [...new Set(l.filter((e) => typeof e === "string" && e.includes(".")))].slice(0, 8); if (!u.length) delete o.contact; else o.contact = u.length === 1 ? u[0] : u; };
// langue de la carte (`language`) appliquée sans recharger quand la config éditée en change ; true si l'interface a changé de langue
function suivreLangue(carte, cfg) {
  if ((cfg.langue ?? null) === (carte._lgOpt ?? null)) return false;
  carte._lgOpt = cfg.langue;
  if (!carte._langue()) return false;
  carte._sim?.renommer();
  carte._textesSquelette();
  return true;
}
const MEUBLES = () => customElements.get("maquette-card")?.MEUBLES || {};
// format public (YAML, JSON, dashboard) en anglais ; this.d, brouillons et historique restent au format interne (clés françaises)
const versAnglais = (o) => customElements.get("maquette-card").versAnglais(o);
const depuisAnglais = (o) => customElements.get("maquette-card").depuisAnglais(o);
// valeur énumérée telle qu'écrite dans le YAML (ex. type de widget « tuile » → « tile »), pour les libellés techniques
const typeWidgetEn = (t) => versAnglais({ panneaux: { gauche: [{ type: t }] } }).panels.left[0]?.type ?? t;
// ---------- « Nettoyer le plan » : projection du plan interne vers le moteur (format anglais) et retour ----------
// le moteur ne change que la forme des pièces, les murs et le segment des ouvertures (mêmes pièces, mêmes ouvertures, mêmes index) :
// le reste de chaque objet (capteurs, fiches, groupes…) n'est jamais converti, il reste tel quel
const OUV_EN = { fenetre: "window", porte: "door", portail: "gate" };
const versMoteur = (d) => ({
  rooms: (d.pieces || []).map((p) => ({ name: p?.nom ?? null, poly: p?.poly, outside: !!p?.dehors, sub_area: !!p?.sous_zone })),
  walls: d.murs || [],
  openings: (d.ouvertures || []).map((o) => ({ type: OUV_EN[o?.type] || o?.type, seg: o?.seg, name: o?.nom, shutter_only: !!o?.volet_seul,
    ...(o?.dehors ? { outside: o.dehors } : {}), ...(o?.vitree ? { glazed: true } : {}), ...(o?.volet ? { shutter: o.volet } : {}) })),
});
function depuisMoteur(d, c) {
  const meme = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  return { pieces: (d.pieces || []).map((p, i) => (meme(p?.poly, c.rooms[i]?.poly) ? p : { ...p, poly: c.rooms[i].poly })),
    ouvertures: (d.ouvertures || []).map((o, i) => {
      const n = c.openings[i];
      if (!o || !n) return o;
      // contrôles des ouvertures : côté dehors posé, lien de volet retiré (volet inexistant, « volet seul » relié à rien)
      const r = { ...o, ...(meme(o.seg, n.seg) ? {} : { seg: n.seg }), ...(!o.dehors && n.outside ? { dehors: n.outside } : {}) };
      if (o.volet && !n.shutter) delete r.volet;
      if (o.volet_seul && !n.shutter_only) delete r.volet_seul;
      return meme(r, o) ? o : r;
    }), murs: c.walls || [] };
}
// options du dialogue (dans l'ordre d'affichage) : [clé du moteur, libellé, précision]
const OPTIONS_NET = [["aimanter", _tk("Aimanter murs et ouvertures aux pièces"), _tk("Trous et décalages jusqu'à 12 cm.")],
  ["couper", _tk("Couper les murs sous les ouvertures"), _tk("Un style courant, pas un défaut.")],
  ["bouts", _tk("Retirer les bouts de mur qui dépassent"), _tk("Moins de 35 cm dans une pièce.")],
  ["fusionner", _tk("Fusionner les murs alignés et les doublons"), _tk("Coupés à chaque angle, en double, ou épais en 2 traits.")],
  ["manquants", _tk("Ajouter les murs manquants"), _tk("Côté extérieur, d'après le contour des pièces.")],
  ["passages", _tk("Fermer les passages entre pièces"), _tk("Arêtes communes sans mur.")],
  ["sommets", _tk("Aimanter les sommets presque confondus"), _tk("Jusqu'à 6 cm : change la forme des pièces.")],
  ["arrondir", _tk("Arrondir à 5 cm"), _tk("Sommets, murs et ouvertures : plan relevé sur une image.")],
  ["dehors", _tk("Poser le côté dehors des fenêtres"), _tk("Fenêtres et portes vitrées sans côté dehors : pas de lumière du jour.")],
  ["volets", _tk("Retirer les volets reliés à rien"), _tk("Volet sans entité, ou entité qui n'existe pas.")]];
const PAR_PIECE = new Set(["manquants", "passages"]);
const NOM_OUV_NET = { door: _tk("Porte"), window: _tk("Fenêtre"), gate: _tk("Portail") };
const nomOuvNet = (o) => (NOM_OUV_NET[o] ? _t(NOM_OUV_NET[o]) : o || _t("Fenêtre"));
// une ligne par défaut ou correction (détail chiffré du moteur, traduit ici)
function texteNet(x) {
  const n = x.detail?.longueur ?? x.detail?.ecart, m = fmt((x.detail?.longueur || 0) / 100, 2);
  switch (x.type) {
    case "trou": return _t("Trou de {n} cm", { n });
    case "decale": return x.detail.quoi === "ouverture" ? _t("Ouverture décalée de {n} cm", { n }) : _t("Mur décalé de {n} cm", { n });
    case "depasse": return _t("Mur qui dépasse de {n} cm", { n });
    case "bout": return _t("Bout de mur de {n} cm", { n });
    case "doublon": return x.detail.epaisseur ? _t("Mur épais en 2 traits ({n} cm)", { n: x.detail.epaisseur }) : _t("Mur en double sur {n} cm", { n });
    case "aligne": return _t("Murs alignés à réunir");
    case "sous": { const o = x.detail.ouverture; return _t("Mur sous « {nom} »", { nom: NOM_OUV_NET[o] ? _t(NOM_OUV_NET[o]) : o || _t("Porte") }); }
    case "absent": return x.detail.sansMurs ? _t("Pièce sans murs : {m} m de contour", { m }) : _t("Mur absent sur {m} m", { m });
    case "passage": return _t("Passage ouvert de {m} m", { m });
    case "sommet": return _t("Sommets écartés de {n} cm", { n });
    case "sans_dehors": return _t("« {nom} » sans côté dehors", { nom: nomOuvNet(x.detail.ouverture) });
    case "volet_vide": return _t("Volet de « {nom} » relié à rien", { nom: nomOuvNet(x.detail.ouverture) });
    case "volet_inconnu": return _t("Volet de « {nom} » : {e} n'existe pas", { nom: nomOuvNet(x.detail.ouverture), e: x.detail.entite });
    default: return _t("Cote hors grille de 5 cm");
  }
}
// aperçu SVG d'un plan au format du moteur ; k = cm par pixel (traits et repères à taille constante à l'écran) ;
// marques : [{i, point, segment?, genre : defaut | style | info | fait}], sel = index de la marque choisie
function svgNettoyage(c, vb, k, marques, sel) {
  const px = (v) => +(v * k).toFixed(2), seg = (w) => `M${+w[0]} ${+w[1]}L${+w[2]} ${+w[3]}`, ok = (w) => Array.isArray(w) && w.length >= 4 && w.slice(0, 4).every(Number.isFinite);
  let h = "";
  for (const r of c.rooms || []) if (Array.isArray(r?.poly) && r.poly.length > 2)
    h += `<polygon class="n-sol${r.outside ? " dehors" : ""}${r.sub_area ? " sz" : ""}" points="${r.poly.map((p) => `${+p?.[0]},${+p?.[1]}`).join(" ")}" stroke-width="${px(1)}"/>`;
  h += `<path class="n-mur" d="${(c.walls || []).filter(ok).map(seg).join("")}" stroke-width="${px(4)}"/>`;
  h += `<path class="n-ouv" d="${(c.openings || []).map((o) => o?.seg).filter(ok).map(seg).join("")}" stroke-width="${px(3)}"/>`;
  for (const m of marques) {
    const [x, y] = m.point, on = m.i === sel ? " on" : "";
    if (m.genre === "info" && m.segment) h += `<path class="n-info${on}" data-d="${m.i}" d="${seg(m.segment)}" stroke-width="${px(on ? 4 : 2.5)}" stroke-dasharray="${px(6)} ${px(4)}"/>`;
    else if (m.genre === "defaut") h += `<circle class="n-def${on}" data-d="${m.i}" cx="${+x}" cy="${+y}" r="${px(on ? 15 : 11)}" stroke-width="${px(2)}"/>`;
    else if (m.genre === "fait") h += `<circle class="n-fait${on}" data-d="${m.i}" cx="${+x}" cy="${+y}" r="${px(on ? 9 : 5)}" stroke-width="${px(1.5)}"/>`;
    else h += `<circle class="n-style${on}" data-d="${m.i}" cx="${+x}" cy="${+y}" r="${px(on ? 9 : 4.5)}" stroke-width="${px(1.5)}"/>`;
  }
  return `<svg viewBox="${+vb.x} ${+vb.y} ${+vb.w} ${+vb.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(_t("Aperçu"))}">${h}</svg>`;
}
// cadre d'un plan au format du moteur (pièces, murs, ouvertures) avec une marge
function cadreNet(c, marge = 60) {
  const xs = [], ys = [], aj = (x, y) => { if (Number.isFinite(x) && Number.isFinite(y)) { xs.push(x); ys.push(y); } };
  for (const r of c.rooms || []) for (const p of r?.poly || []) aj(p?.[0], p?.[1]);
  for (const w of c.walls || []) if (Array.isArray(w)) { aj(w[0], w[1]); aj(w[2], w[3]); }
  for (const o of c.openings || []) if (Array.isArray(o?.seg)) { aj(o.seg[0], o.seg[1]); aj(o.seg[2], o.seg[3]); }
  if (!xs.length) return { x: -250, y: -200, w: 500, h: 400 };
  const x0 = Math.min(...xs) - marge, y0 = Math.min(...ys) - marge;
  return { x: x0, y: y0, w: Math.max(...xs) + marge - x0, h: Math.max(...ys) + marge - y0 };
}
// anciens exports (clés françaises) : refusés avec un message clair, jamais convertis en silence
const CLES_FR = ["pieces", "murs", "limites", "ouvertures", "points", "textes", "meubles", "titre", "resume", "panneaux", "calques", "ambiance", "alertes", "groupes", "modeles", "vitrine", "plein_ecran", "afficher_meubles"];
const nbr = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const arr = (n) => Math.round(n * 10) / 10;
// formes des meubles personnalisés : % de la taille au centième (1 cm reste 1 cm, même sur un grand meuble)
const pc = (n) => Math.round(n * 100) / 100;

const centre = (poly) => [arr(poly.reduce((s, p) => s + p[0], 0) / poly.length), arr(poly.reduce((s, p) => s + p[1], 0) / poly.length)];

function iconeEntite(hass, e) {
  const s = hass.states[e], dom = e.split(".")[0], dc = s?.attributes.device_class;
  if (s?.attributes.icon) return s.attributes.icon;
  const parDc = { motion: "mdi:motion-sensor", occupancy: "mdi:motion-sensor", door: "mdi:door", window: "mdi:window-closed-variant",
    temperature: "mdi:thermometer", humidity: "mdi:water-percent", power: "mdi:flash", energy: "mdi:lightning-bolt", illuminance: "mdi:brightness-5",
    garage: "mdi:garage-variant", shade: "mdi:window-shutter", shutter: "mdi:window-shutter", tv: "mdi:television", outlet: "mdi:power-socket-eu", co2: "mdi:molecule-co2", carbon_dioxide: "mdi:molecule-co2", carbon_monoxide: "mdi:molecule-co" };
  return parDc[dc] || (ICONES[dom] || ICONES._)[0];
}

function pointPour(hass, e, pos) {
  const dom = e.split(".")[0], dc = hass.states[e]?.attributes.device_class;
  const p = { entite: e, pos, icone: iconeEntite(hass, e) };
  if (dom === "light") Object.assign(p, { couleur: "#f6c445", halo: 130 });
  else if (dom === "switch") p.couleur = "#1a73e8";
  else if (dom === "binary_sensor") p.couleur = ["motion", "occupancy"].includes(dc) ? "#e8710a" : "#d93025";
  else if (dom === "sensor") p.valeur = e;
  else if (dom === "cover") p.couleur = "#d93025";
  else if (dom === "climate") Object.assign(p, { couleur: "#e8710a", attribut: "temperature", unite: " °C", actif_attribut: "hvac_action" });
  else if (dom === "camera") p.couleur = "#d93025";
  else if (dom === "media_player") p.couleur = "#9334e6";
  else if (dom === "vacuum") p.couleur = "#188038";
  return p;
}

