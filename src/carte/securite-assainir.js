// sécurité : filet HTML, services sensibles, assainirConfig — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
  // sans « : » ni « ( », aucun des motifs ci-dessous n'est possible (schéma javascript: / data:, url()) : sûr sans les expressions
  // (cas de presque tous les attributs du plan : classes, coordonnées, data-*)
  if (!v.includes(":") && !v.includes("(")) return true;
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
// un `switch` (ou un `input_boolean`) peut commander un portail, une porte de garage ou une gâche : il reste un service sûr,
// mais l'éditeur demande, quand on choisit un tel interrupteur, s'il faut confirmer chaque appui (`confirm`), et présélectionne
// « Oui » s'il ressemble à un accès (même règle pour « Nettoyer le plan »). Accès = (a) un mot d'accès (porte, portail, garage, serrure, door, gate, lock…, sans accents ni
// pluriel, mot entier) dans son identifiant, son nom, son icône ou le nom / modèle de son appareil, sauf si son propre
// identifiant ou son nom dit lumière, prise ou appareil (lumiere, lampe, light, prise, plug, chauffage, congelateur…) ou qu'il est de classe `outlet` ;
// ou (b) son appareil porte une serrure (lock.*), une cover garage / portail / porte, ou un capteur de porte de garage.
const MOTS_ACCES = new Set(["porte", "portail", "portillon", "garage", "barriere", "serrure", "verrou", "verrouillage", "gache", "interphone",
  "door", "gate", "barrier", "lock", "unlock", "latch", "opener", "intercom"]);
const MOTS_NON_ACCES = new Set(["lumiere", "lampe", "eclairage", "ampoule", "applique", "plafonnier", "spot", "guirlande", "projecteur",
  "light", "lamp", "bulb", "prise", "plug", "outlet", "socket", "enfant", "child", "chauffage", "radiateur", "heater", "ventilateur", "ventilation", "fan",
  "congelateur", "frigo", "refrigerateur", "freezer", "fridge", "chargeur", "charger"]);
// mots d'un texte : minuscules, sans accents, découpé sur tout ce qui n'est pas lettre ou chiffre, pluriel en « s » retiré
const motsDe = (...t) => t.filter((x) => typeof x === "string").join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .split(/[^a-z0-9]+/).filter(Boolean).map((m) => (m.length > 3 && m.endsWith("s") ? m.slice(0, -1) : m));
const DOMAINES_INTERRUPTEUR = ["switch", "input_boolean"];
function interrupteurAcces(hass, e) {
  if (typeof e !== "string" || !DOMAINES_INTERRUPTEUR.includes(e.split(".")[0])) return false;
  const st = hass?.states?.[e], at = st?.attributes || {}, reg = hass?.entities?.[e], dev = reg?.device_id ? hass?.devices?.[reg.device_id] : null;
  const propres = motsDe(e.split(".").slice(1).join("."), at.friendly_name, reg?.name);
  const mots = [...propres, ...motsDe(at.icon, reg?.icon, dev?.name, dev?.name_by_user, dev?.model)];
  if (mots.some((m) => MOTS_ACCES.has(m)) && !propres.some((m) => MOTS_NON_ACCES.has(m)) && at.device_class !== "outlet") return true;
  if (!reg?.device_id || !hass?.entities) return false;
  return Object.entries(hass.entities).some(([id, r]) => r?.device_id === reg.device_id && id !== e && (id.startsWith("lock.")
    || (id.startsWith("cover.") && ["garage", "gate", "door"].includes(hass.states?.[id]?.attributes?.device_class))
    || (id.startsWith("binary_sensor.") && hass.states?.[id]?.attributes?.device_class === "garage_door")));
}
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
      opacite: (x) => (num(x) ? Math.min(1, Math.max(0, +x)) : undefined), opacite_sol: (x) => (num(x) ? Math.min(1, Math.max(0, +x)) : undefined), afficher: parmi(["editeur", "toujours"]) }, ch);
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
    effets: parmi(EFFETS),
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
    // thème : nom du registre (themes.js), ou objet { base, <variable>… } aux valeurs validées par type (couleur : même règle que les autres)
    theme: (v, ch) => {
      if (typeof v === "string") return NOMS_THEMES.includes(v) ? v : undefined;
      if (!objetSimple(v)) return undefined;
      for (const k of Object.keys(v)) {
        const d = VARIABLES_THEME.find((x) => x.cle === k);
        if (k === "base" ? !NOMS_THEMES.includes(v.base) : !d || !valeurTheme(v[k], d.type)) { delete v[k]; retires.push([...ch, k]); }
        else if (d) v[k] = typeof v[k] === "number" ? v[k] : v[k].trim();
      }
      return v;
    },
    // CSS personnalisé : refusé en entier (avertissement clair, rien d'injecté) s'il charge ou exécute quoi que ce soit, ou dépasse 20 Kio
    css: (v) => {
      const r = verifierCss(v);
      if (!r.ok) avertir(`custom css refused (${r.raison}): nothing applied`);
      return r.ok ? v : undefined;
    },
  }, []);
  if (rapport && retires.length) (rapport.retires ||= []).push(...retires.map(cheminPublic));
  return c;
}

