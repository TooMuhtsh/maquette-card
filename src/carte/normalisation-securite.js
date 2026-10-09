// calques, booléens, géométrie, normaliserConfig ; sécurité : filet HTML, services sensibles, assainirConfig — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
// `niveau` (ordre dans son calque) et `masque` (caché en vue) par élément : nombre et booléen, sinon retirés
const normaliserNiveaux = (l) => (Array.isArray(l) ? l.map((o) => {
  if (!o || typeof o !== "object" || Array.isArray(o) || !("niveau" in o || "masque" in o)) return o;
  const n = { ...o };
  if ("niveau" in n) { if ((typeof n.niveau === "number" || (typeof n.niveau === "string" && n.niveau.trim())) && Number.isFinite(+n.niveau)) n.niveau = +n.niveau; else delete n.niveau; }
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
const point = (q) => Array.isArray(q) && q.length >= 2 && num(q[0]) && num(q[1]);
const seg = (s) => Array.isArray(s) && s.length >= 4 && s.slice(0, 4).every(num);
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
  for (const k of ["pieces", "points", "textes", "ouvertures", "meubles"]) if (Array.isArray(c[k])) c[k] = normaliserNiveaux(c[k]);
  if ("panneaux" in c) c.panneaux = normaliserPanneaux(c.panneaux);
  return c;
}
// ---------- étages (`floors`) : chaque étage porte sa géométrie (et au besoin ses panneaux, son fond) ; tout le reste est commun ----------
const CLES_GEO = ["pieces", "murs", "limites", "ouvertures", "points", "textes", "meubles", "groupes"];
// structure des étages (avant la géométrie) : liste, géométrie absente de la racine, éléments objets, identifiants sûrs et uniques,
// étage par défaut connu ; ret : chemins internes des valeurs retirées ou corrigées
function normaliserEtages(c, ret) {
  if (!("etages" in c)) return;
  if (!Array.isArray(c.etages)) throw new Error("maquette-card : « floors » must be a list of floors");
  if (!c.etages.length) { delete c.etages; ret.push(["etages"]); return; }
  const vide = (v) => v == null || (Array.isArray(v) && !v.length);
  const racine = [...CLES_GEO, "fond"].filter((k) => k in c && !vide(c[k]));
  if (racine.length) throw new Error(`maquette-card : with « floors », the plan is drawn floor by floor: move ${racine.map((k) => `« ${cheminPublic([k])} »`).join(", ")} into floors[n] (each floor has its own rooms, walls, openings…)`);
  for (const k of [...CLES_GEO, "fond"]) delete c[k];
  const l = [];
  c.etages.forEach((e, i) => { if (objetSimple(e)) l.push(e); else ret.push(["etages", i]); });
  if (!l.length) { delete c.etages; return; }
  // identifiants : les valides gardés (le premier d'un doublon), les autres remplacés (floor_<rang>) ou suffixés (_2, _3…)
  const pris = new Set(), libre = (base) => { let id = base, k = 2; while (pris.has(id)) id = `${base}_${k++}`; return id; };
  const ok = l.map((e) => { const v = typeof e.id === "string" && ID_SUR.test(e.id) && !pris.has(e.id) ? e.id : null; if (v) pris.add(v); return v; });
  l.forEach((e, n) => {
    if (ok[n]) return;
    const base = typeof e.id === "string" && ID_SUR.test(e.id) ? e.id.slice(0, 74) : `floor_${n + 1}`;
    e.id = libre(base); pris.add(e.id);
    ret.push(["etages", n, "id"]);
  });
  c.etages = l;
  if ("etage_defaut" in c && !pris.has(c.etage_defaut)) { delete c.etage_defaut; ret.push(["etage_defaut"]); }
}
// `floor` d'un meuble : seulement sur un escalier, vers un autre étage connu (sinon retiré)
function normaliserEscaliers(g, ids, propre, pre, ret) {
  (Array.isArray(g.meubles) ? g.meubles : []).forEach((m, j) => {
    if (!m || !("etage" in m) || (m.type === "escalier" && ids.includes(m.etage) && m.etage !== propre)) return;
    delete m.etage; ret.push([...pre, "meubles", j, "etage"]);
  });
}
// toute la normalisation de `setConfig` (sans la démo) : aussi utilisée par l'éditeur pour reconnaître la carte stockée
// plan à étages : rendu replié (`floors`, sans géométrie à la racine) ; une config dépliée (`etage_actif`) est rendue dépliée sur le même étage
function normaliserConfig(config, rapport) {
  if (objetSimple(config?.etage_actif)) return deplier(normaliserConfig(replier(config), rapport), config.etage_actif.id);
  config = booleens({ pieces: [], ...config });
  const ret = [];
  normaliserEtages(config, ret);
  const ids = idsEtages(config);
  if (ids.length) config.etages.forEach((e, n) => { normaliserGeo(e, rapport, ["etages", n]); normaliserEscaliers(e, ids, e.id, ["etages", n], ret); });
  else { normaliserGeo(config, rapport); normaliserEscaliers(config, [], null, [], ret); if ("etage_defaut" in config) { delete config.etage_defaut; ret.push(["etage_defaut"]); } }
  if (ids.length && "panneaux" in config) config.panneaux = normaliserPanneaux(config.panneaux); // panneaux communs à la maison
  if (rapport && ret.length) (rapport.retires ||= []).push(...ret.map(cheminPublic));
  if (Array.isArray(config.modeles)) config.modeles = normaliserModeles(config.modeles);
  if ("calques" in config) { const q = normaliserCalques(config.calques); if (q) config.calques = q; else delete config.calques; }
  if ("interaction" in config || "tablette" in config) normaliserInteraction(config);
  // étiquettes des pièces : { nom, temperature, humidite } (des clés qui ne sont pas booléennes ailleurs) : « false » écrit en texte → false
  const ep = config.etiquettes_pieces;
  if (ep && typeof ep === "object" && !Array.isArray(ep)) config.etiquettes_pieces = Object.fromEntries(Object.entries(ep).map(([k, v]) => [k, typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v]));
  return assainirConfig(config, rapport);
}

// ---------- sécurité (2/3) : filet du HTML, tout innerHTML de la carte et de l'éditeur passe par poserHTML ----------
// Le HTML est d'abord lu dans un <template> (document inerte : rien ne s'y charge ni ne s'y exécute), nettoyé, puis posé.
// Retirés : balises hors de la liste (script, iframe, object, a, form, foreignObject, animate, set…), attributs on*, is,
// liens (href, xlink:href, action…) sauf vers « #id », src sauf <img> servie par HA (même origine), url() autre que « url(#id) »,
// javascript:, @import et expression() dans les styles. Les valeurs sont déjà validées ou échappées en amont : ce filet ne
// change rien au rendu normal, il garantit seulement qu'un oubli ne peut rien exécuter ni rien charger d'ailleurs.
const BALISES_SURES = new Set(["div", "span", "button", "label", "input", "select", "option", "optgroup", "textarea", "output", "datalist", "small", "b", "i", "em", "strong",
  "p", "br", "h1", "h2", "h3", "h4", "h5", "header", "footer", "section", "aside", "nav", "details", "summary", "dialog", "kbd", "dl", "dt", "dd", "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td", "img", "style", "code", "ha-icon", "ha-card", "svg", "g", "defs", "path", "rect", "circle", "ellipse", "line", "polyline",
  "polygon", "text", "tspan", "title", "clipPath", "radialGradient", "linearGradient", "stop", "pattern", "animateTransform", "animateMotion", "filter", "feGaussianBlur", "mask"]);
const ATTR_LIENS = new Set(["href", "xlink:href", "src", "srcset", "srcdoc", "action", "formaction", "poster", "background", "ping", "data", "codebase", "lowsrc", "dynsrc", "manifest"]);
const ATTR_ANIMES = new Set(["transform", "patternTransform", "gradientTransform", "opacity"]);
// texte de style ou valeur d'attribut sans chargement ni code : url() seulement vers « #id » du document
const cssSur = (t) => !/@import|expression\s*\(|javascript:|vbscript:|-moz-binding|behavior\s*:|\\/i.test(t) && !/url\s*\(\s*(?!["']?#)/i.test(t);
const memeOrigine = (u) => { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } };
// image de fond : du même site seulement (fichier de /local/… ou image envoyée à HA), jamais data:, blob:, javascript: ni un autre site
const URL_FOND = /^\/(?![/\\])[\w\-./%]+\.(?:png|jpe?g|webp|avif|svg)(?:\?[\w=&.-]{0,60})?$/i, URL_FOND_HA = /^\/api\/image\/serve\/[0-9a-f]{32}\/(?:original|\d+x\d+)$/;
const urlFond = (v) => (typeof v === "string" && v.length <= 300 && (URL_FOND.test(v) || URL_FOND_HA.test(v)) && memeOrigine(v) ? v : undefined);
function attributSur(balise, nom, v) {
  const n = nom.toLowerCase();
  if (n.startsWith("on") || n === "is" || n === "style" && !cssSur(v)) return false;
  if (ATTR_LIENS.has(n)) return (n === "src" && balise === "img" && /^(?:\/(?![/\\])|https?:)/i.test(v) && memeOrigine(v)) || ((n === "href" || n === "xlink:href") && /^#[\w-]*$/.test(v));
  if (n === "attributename") return ATTR_ANIMES.has(v);
  return !/(?:java|vb)script\s*:|data\s*:\s*text/i.test(v.replace(/[\s\u0000-\u001f]/g, "")) && (!/url\s*\(/i.test(v) || cssSur(v));
}
const NS_SVG = "http://www.w3.org/2000/svg";
let tplHTML = null;
// fragment nettoyé ; dans un élément SVG, le HTML est lu comme du SVG (comme le ferait innerHTML)
function fragmentSur(html, contexte) {
  const t = (tplHTML ||= document.createElement("template"));
  const svg = contexte instanceof SVGElement;
  t.innerHTML = svg ? `<svg xmlns="${NS_SVG}">${html}</svg>` : String(html); // lecture inerte (template)
  const frag = t.content, retirer = [];
  for (const el of frag.querySelectorAll("*")) {
    if (!BALISES_SURES.has(el.localName) || (el.localName === "style" && !cssSur(el.textContent))) { retirer.push(el); continue; }
    for (const a of [...el.attributes]) if (!attributSur(el.localName, a.name, a.value)) el.removeAttribute(a.name);
  }
  retirer.forEach((el) => el.remove());
  const f = document.createDocumentFragment();
  f.append(...(svg ? frag.firstChild?.childNodes || [] : frag.childNodes));
  t.innerHTML = "";
  return f;
}
// remplace le contenu de el (élément ou shadowRoot) par le HTML nettoyé
function poserHTML(el, html) { el.replaceChildren(fragmentSur(html, el)); }
// ajoute le HTML nettoyé à la fin de el (insertAdjacentHTML « beforeend »)
function ajouterHTML(el, html) { el.append(fragmentSur(html, el)); }

// ---------- sécurité (3/3) : services sensibles, toujours confirmés ----------
// Un service appelé depuis le plan (boutons des pièces, widgets des panneaux et des fiches, interrupteurs, « Activer ») est sûr
// s'il est dans cette liste blanche ; tout autre service est sensible et demande une confirmation qui nomme l'action réelle et les
// entités visées, quel que soit le libellé du bouton (déverrouiller, ouvrir une porte de garage, désarmer, lancer un script…).
const SERVICES_SURS = (() => {
  const b = ["turn_on", "turn_off", "toggle"], sel = ["select_option", "select_next", "select_previous", "select_first", "select_last"];
  return { light: b, switch: b, input_boolean: b, remote: b, automation: b, fan: [...b, "set_percentage", "increase_speed", "decrease_speed", "oscillate", "set_direction", "set_preset_mode"],
    humidifier: [...b, "set_humidity", "set_mode"], climate: [...b, "set_temperature", "set_hvac_mode", "set_preset_mode", "set_fan_mode", "set_humidity", "set_swing_mode"],
    water_heater: ["turn_on", "turn_off", "set_temperature", "set_operation_mode"],
    media_player: [...b, "media_play", "media_pause", "media_play_pause", "media_stop", "media_next_track", "media_previous_track", "volume_up", "volume_down", "volume_set", "volume_mute", "select_source"],
    scene: ["turn_on"], cover: ["close_cover", "stop_cover", "close_cover_tilt", "stop_cover_tilt"], valve: ["close_valve", "stop_valve"], lock: ["lock"],
    alarm_control_panel: ["alarm_arm_home", "alarm_arm_away", "alarm_arm_night", "alarm_arm_vacation", "alarm_arm_custom_bypass"],
    input_number: ["set_value", "increment", "decrement"], number: ["set_value"], input_select: sel, select: sel };
})();
// ouvrir une cover n'est sûr que pour des volets, stores, rideaux, auvents et fenêtres (jamais garage, portail, porte, ni classe inconnue)
const OUVRIR_COVER = ["open_cover", "open_cover_tilt", "set_cover_position", "set_cover_tilt_position", "toggle", "toggle_cover_tilt"];
const COVERS_SURES = ["shade", "shutter", "blind", "curtain", "awning", "window"];
const coverSure = (hass, e) => e.startsWith("cover.") && COVERS_SURES.includes(hass?.states?.[e]?.attributes?.device_class);
// entités visées par un appel (cible et données : entity_id, area_id ; un appareil n'est pas résolu) ; null = inconnues
function entitesAppel(hass, dom, donnees, cible) {
  const l = [], vers = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
  let inconnu = false;
  for (const o of [cible, donnees]) {
    if (!o || typeof o !== "object") continue;
    for (const e of vers(o.entity_id)) if (typeof e === "string" && e !== "all") l.push(e); else inconnu = true;
    for (const z of vers(o.area_id)) l.push(...entitesZone(hass, z).filter((e) => dom === "homeassistant" || e.startsWith(`${dom}.`)));
    if (o.device_id != null || o.floor_id != null || o.label_id != null) inconnu = true;
  }
  return inconnu ? null : [...new Set(l)];
}
function serviceSensible(hass, dom, svc, ents) {
  if (dom === "homeassistant") {
    if (svc === "update_entity") return false;
    if (!["turn_on", "turn_off", "toggle"].includes(svc) || !ents?.length) return true;
    // homeassistant.* agit selon le domaine de chaque entité : une serrure, une alarme, un script… le rendent sensible
    return ents.some((e) => { const d = e.split(".")[0]; return d === "cover" ? svc !== "turn_off" && !coverSure(hass, e) : !SERVICES_SURS[d]?.includes(svc); });
  }
  if (dom === "cover" && OUVRIR_COVER.includes(svc)) return !ents?.length || !ents.every((e) => coverSure(hass, e));
  return !Object.hasOwn(SERVICES_SURS, dom) || !SERVICES_SURS[dom].includes(svc);
}
// action réelle en clair (titre de la confirmation et bouton qui la lance)
const VERBES_SERVICE = { "lock.unlock": _tk("Déverrouiller"), "lock.open": _tk("Ouvrir la porte"), "lock.lock": _tk("Verrouiller"),
  "alarm_control_panel.alarm_disarm": _tk("Désarmer l'alarme"), "alarm_control_panel.alarm_trigger": _tk("Déclencher l'alarme"),
  "cover.open_cover": _tk("Ouvrir"), "cover.close_cover": _tk("Fermer"), "cover.stop_cover": _tk("Arrêter"), "cover.toggle": _tk("Ouvrir ou fermer"), "cover.set_cover_position": _tk("Changer la position"),
  "valve.open_valve": _tk("Ouvrir la vanne"), "valve.close_valve": _tk("Fermer la vanne"), "valve.stop_valve": _tk("Arrêter la vanne"), "valve.toggle": _tk("Ouvrir ou fermer la vanne"),
  "script.turn_on": _tk("Lancer le script"), "button.press": _tk("Appuyer sur le bouton"), "input_button.press": _tk("Appuyer sur le bouton"), "automation.trigger": _tk("Déclencher l'automatisation"),
  "homeassistant.restart": _tk("Redémarrer Home Assistant"), "homeassistant.stop": _tk("Arrêter Home Assistant"), "homeassistant.turn_on": _tk("Allumer"), "homeassistant.turn_off": _tk("Éteindre"), "homeassistant.toggle": _tk("Basculer") };
// verbes communs à tous les domaines (service sûr confirmé à la demande, `confirm: true`)
const VERBES_COMMUNS = { turn_on: _tk("Allumer"), turn_off: _tk("Éteindre"), toggle: _tk("Basculer"), set_temperature: _tk("Changer la consigne") };
Object.assign(VERBES_SERVICE, { "scene.turn_on": _tk("Activer la scène"), "automation.turn_on": _tk("Activer l'automatisation"), "automation.turn_off": _tk("Désactiver l'automatisation") });
const verbeService = (dom, svc) => _t(VERBES_SERVICE[`${dom}.${svc}`] || (dom === "script" ? _tk("Lancer le script") : Object.hasOwn(VERBES_COMMUNS, svc) ? VERBES_COMMUNS[svc] : _tk("Lancer l'action")));

// ---------- sécurité (1/3) : valeurs de la config validées avant tout dessin ----------
// Une valeur de la config qui finit dans le SVG, le HTML ou un style est soit échappée à l'affichage (texte libre : noms, entités,
// unités, états…), soit validée ici : nombre fini, valeur énumérée connue, couleur sûre, icône « préfixe:nom », identifiant de groupe,
// service « domaine.service », lien « plus d'infos » (/chemin ou http(s)://). Une valeur invalide est retirée, jamais une erreur ;
// rapport.retires garde son chemin au format public (récapitulatif d'import de l'éditeur, console).
const ICONE_SURE = /^[\w-]{1,40}:[\w.-]{1,120}$/;
const SERVICE_SUR = /^[a-z0-9_]{1,64}\.[a-z0-9_]{1,64}$/;
const ENTITE_SURE = /^[a-z0-9_]{1,64}\.[a-z0-9_]{1,200}$/;
// lien de « plus d'infos » : chemin du même site (pas « // » ni « /\ ») ou adresse web, sans espace ni guillemet
const LIEN_SUR = /^(?:\/(?![/\\])[^\s"'<>`\\]*|https?:\/\/[^\s"'<>`\\]+)$/i;
const estLien = (v) => typeof v === "string" && /^(?:\/|[a-z][\w+.-]*:)/i.test(v);
// chemin interne (clés françaises, numéros) → chemin public : ["pieces", 2, "poly"] → « rooms[2].poly »
function cheminPublic(segs) {
  let n = N_RACINE, out = "";
  for (const s of segs) {
    if (typeof s === "number") { out += `[${s}]`; n = prepNoeud(n)?.l ?? null; continue; }
    const e = prepNoeud(n)?.kFr?.[s];
    out += `${out ? "." : ""}${e ? e.en : s}`;
    n = e?.n ?? null;
  }
  return out;
}
function assainirConfig(c, rapport) {
  const retires = [];
  // règle : valeur gardée (au besoin corrigée), ou undefined = retirée ; ch = chemin interne de la valeur
  const nbF = (v) => (num(v) ? Math.min(1e7, Math.max(-1e7, +v)) : undefined);
  const coul = (v) => (couleurEcrite(v) ? v : undefined);
  const oui = (v) => (typeof v === "boolean" ? v : undefined);
  // lumière : multiplicateur (booléen, ou nombre borné de 0 à 2) et teinte (`auto` ou 1800 à 10000 K)
  const multLum = (v) => (typeof v === "boolean" ? v : num(v) ? Math.round(Math.min(2, Math.max(0, +v)) * 100) / 100 : undefined);
  const diffLum = (v) => (num(v) ? Math.round(Math.min(1, Math.max(0, +v)) * 100) / 100 : undefined);
  const kelvinLum = (v) => (v === "auto" ? v : num(v) ? Math.round(Math.min(10000, Math.max(1800, +v))) : undefined);
  const ico = (v) => (v === "" || (typeof v === "string" && ICONE_SURE.test(v)) ? v : undefined);
  const idg = (v) => (typeof v === "string" && ID_SUR.test(v) ? v : undefined);
  const parmi = (l) => (v) => (l.includes(v) ? v : undefined);
  const pt = (v) => (point(v) ? nbs(v, 2) : undefined);
  const objet = (regles) => (o, ch) => (objetSimple(o) ? fixer(o, regles, ch) : undefined);
  const liste = (f) => (l, ch) => {
    if (!Array.isArray(l)) return undefined;
    const out = [];
    l.forEach((x, i) => { const v = f(x, [...ch, i]); if (v === undefined) retires.push([...ch, i]); else out.push(v); });
    return out;
  };
  function fixer(o, regles, ch) {
    for (const [k, f] of Object.entries(regles)) {
      if (!Object.hasOwn(o, k) || o[k] == null) continue;
      const v = f(o[k], [...ch, k]);
      if (v === undefined) { delete o[k]; retires.push([...ch, k]); } else o[k] = v;
    }
    return o;
  }
  const anim = (v, ch) => (typeof v === "string" ? (Object.hasOwn(ANIMATIONS, v) ? v : undefined)
    : objet({ type: parmi(Object.keys(ANIMATIONS)), couleur: coul, duree: nbF, intensite: nbF, forme: parmi(["contour"]) })(v, ch));
  const ligne = (l, ch) => (typeof l === "string" ? l : objet({ icone: ico, decimales: nbF })(l, ch));
  const W = { icone: ico, couleur: coul, decimales: nbF, historique: (v) => (typeof v === "boolean" ? v : nbF(v)), min: nbF, max: nbF, seuil: nbF, espace: nbF, duree: nbF,
    stable_t: nbF, alerte_t: nbF, stable_h: nbF, alerte_h: nbF, t_min: nbF, t_max: nbF, h_min: nbF, h_max: nbF,
    seuils: objet({ vert: nbF, jaune: nbF, rouge: nbF }), lignes: liste(ligne), entites: liste(ligne),
    colonnes: liste(objet({ facteur: nbF, decimales: nbF })), periodes: liste(parmi(Object.keys(V_PERIODES))) };
  const widget = objet(W), widgets = liste(widget);
  const panneaux = objet({ gauche: widgets, droite: widgets });
  // « plus d'infos » d'une fiche : false, une entité, ou un lien sûr (sinon retiré : le bouton reprend l'entité de l'en-tête)
  const plusInfos = (v) => (v === false || (typeof v === "string" && (!estLien(v) || LIEN_SUR.test(v))) ? v : undefined);
  const fiche = objet({ widgets, plus_infos: plusInfos });
  const ELEMENT = { niveau: nbF, groupe: idg };
  const CONNECTE = { ...ELEMENT, couleur: coul, seuil: nbF, decimales: nbF, animation: anim, fiche };
  const action = (a, ch) => {
    if (!objetSimple(a)) return undefined;
    // service illisible : le bouton reste (à compléter dans l'éditeur) mais n'appelle rien
    if ("action" in a && !(typeof a.action === "string" && SERVICE_SUR.test(a.action))) { delete a.action; retires.push([...ch, "action"]); }
    return fixer(a, { icone: ico, donnees: (d) => (objetSimple(d) ? d : undefined), cible: (v) => (typeof v === "string" ? v : undefined) }, ch);
  };
  const R_PIECE = { ...ELEMENT, panneaux, actions: liste(action) };
  // allège et haut d'une fenêtre (cm, lumière) : bornés
  const cm = (a, b) => (v) => (num(v) ? Math.min(b, Math.max(a, +v)) : undefined);
  // contact(s) : une entité, ou une liste d'au plus 8 identifiants d'entité sûrs, sans doublon (une liste d'un seul redevient une chaîne)
  const contacts = (v, ch) => {
    if (typeof v === "string") return v;
    if (!Array.isArray(v)) return undefined;
    const l = [];
    v.forEach((e, i) => { if (typeof e === "string" && ENTITE_SURE.test(e) && !l.includes(e) && l.length < 8) l.push(e); else retires.push([...ch, i]); });
    return l.length > 1 ? l : l[0];
  };
  const R_OUV = { ...ELEMENT, type: parmi(Object.keys(NOMS_OUVERTURE)), contact: contacts, dehors: pt, animation: anim, animation_volet: anim, fiche, allege: cm(0, 300), hauteur: cm(10, 500),
    // porte vitrée (true = toute la hauteur) et avancée de toit au-dessus de la baie (profondeur, hauteur au-dessus du haut du vitrage)
    vitree: (v) => (v === true ? "toute" : v === "toute" || v === "haut" ? v : undefined), avancee: cm(0, 500), avancee_hauteur: cm(0, 300),
    lames: parmi(["orientables", "ajourees"]) };
  const R_POINT = { ...CONNECTE, icone: ico, halo: (v) => (typeof v === "boolean" ? v : num(v) ? Math.min(5000, Math.max(0, +v)) : undefined) };
  const R_TEXTE = { ...ELEMENT, taille: nbF, style: parmi(["discret"]), infos: liste(objet({ icone: ico, decimales: nbF })) };
  // type de meuble : un type inconnu (identifiant simple) reste, il est dessiné comme un rectangle
  const typeMeuble = (v) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : undefined);
  const R_MEUBLE = { ...CONNECTE, type: typeMeuble };
  const modele = (m, ch) => {
    if (!objetSimple(m)) return undefined;
    fixer(m, { id: idg, icone: ico, genre: parmi(["widget", "meuble", "point", "ouverture"]), type: typeMeuble, objets: widgets }, ch);
    const r = { widget: W, meuble: R_MEUBLE, point: R_POINT, ouverture: R_OUV }[m.genre];
    if (objetSimple(m.objet) && r) fixer(m.objet, r, [...ch, "objet"]);
    return m;
  };
  const anims = Object.fromEntries(Object.keys(EVENEMENTS_ANIM).map((k) => [k, anim]));
  // image de fond : URL du même site, largeur > 0 obligatoires (sinon le fond entier est retiré), opacité bornée, rotation dans [0, 360)
  const positif = (v) => (num(v) && +v > 0 ? Math.min(1e6, +v) : undefined);
  const fond = (v, ch) => {
    if (!objetSimple(v)) return undefined;
    fixer(v, { image: urlFond, pos: pt, largeur: positif, hauteur: positif, rotation: (x) => (num(x) ? ((+x % 360) + 360) % 360 : undefined),
      opacite: (x) => (num(x) ? Math.min(1, Math.max(0, +x)) : undefined), afficher: parmi(["editeur", "toujours"]) }, ch);
    return v.image && v.largeur ? v : undefined;
  };
  const GEO = { pieces: liste(objet(R_PIECE)), ouvertures: liste(objet(R_OUV)), points: liste(objet(R_POINT)), textes: liste(objet(R_TEXTE)), meubles: liste(objet(R_MEUBLE)),
    groupes: liste((g, ch) => (objetSimple(g) && idg(g.id) ? g : undefined)), fond };
  // un étage : nom, nom court (3 caractères au plus), icône, puis sa géométrie et ses panneaux (mêmes règles qu'à la racine)
  const R_ETAGE = { nom: (v) => (typeof v === "string" ? v : num(v) ? String(v) : undefined),
    court: (v) => ((typeof v === "string" && v.trim()) || num(v) ? [...String(v).trim()].slice(0, 3).join("") : undefined), icone: ico, ...GEO, panneaux };
  fixer(c, {
    marge: nbF,
    palette: (v) => (objetSimple(v) ? Object.fromEntries(palette({ palette: v })) : undefined),
    ...GEO, etages: (l, ch) => (Array.isArray(l) ? l.map((e, i) => (objetSimple(e) ? fixer(e, R_ETAGE, [...ch, i]) : e)) : undefined),
    selecteur_etages: parmi(["ascenseur", "onglets"]), etage_defaut: idg,
    panneaux, modeles: liste(modele), animations: objet(anims),
    resume: (v, ch) => (Array.isArray(v) ? liste(objet({ icone: ico, decimales: nbF, alerte_au_dessus: nbF }))(v, ch) : v),
    alertes: liste(objet({ icone: ico, au_dessus: nbF, au_dessous: nbF, niveau: parmi(Object.keys(NIVEAUX_ALERTE)) })),
    ambiance: objet({
      intensite: (v) => (num(v) ? +v : Object.hasOwn(INTENSITES, v) ? v : undefined), nord: nbF,
      jour_nuit: (v, ch) => (typeof v === "boolean" ? v : objet({ intensite: nbF })(v, ch)),
      meteo: (v, ch) => (typeof v === "string" ? v : objet({ intensite: nbF, sens: (x) => (x === "vent" || num(x) ? x : undefined) })(v, ch)),
      traces: (v, ch) => (typeof v === "boolean" ? v : num(v) ? +v : objet({ duree: nbF, couleur: coul })(v, ch)),
      energie: (v, ch) => (typeof v === "boolean" ? v : objet({ source: (x) => (typeof x === "string" || num(x) ? x : undefined), seuil: nbF, couleur: coul })(v, ch)),
      personnes: (v, ch) => (typeof v === "boolean" || Array.isArray(v) ? v : objet({ maison: (x) => (typeof x === "string" ? x : pt(x)) })(v, ch)),
      lumiere: (v, ch) => (typeof v === "boolean" ? v : objet({ soleil: multLum, ciel: multLum, rediffusion: multLum, ciel_diffusion: diffLum, ciel_kelvin: kelvinLum, soleil_kelvin: kelvinLum, lampes: oui, portes: parmi(["ouvertes", "fermees"]), lune: (x) => (typeof x === "boolean" || (typeof x === "string" && /^sensor\.\w{1,120}$/.test(x)) ? x : undefined) })(v, ch)),
    }),
    replay: (v, ch) => (typeof v === "boolean" ? v : objet({ heures: nbF, vitesse: nbF })(v, ch)),
    vitrine: (v, ch) => (typeof v === "boolean" ? v : objet({ pos: pt, largeur: nbF })(v, ch)),
    teinte_temperature: (v, ch) => (v === false ? v : objet({ min: nbF, max: nbF })(v, ch)),
    interaction: objet({ retour_apres: nbF }),
  }, []);
  if (rapport && retires.length) (rapport.retires ||= []).push(...retires.map(cheminPublic));
  return c;
}

