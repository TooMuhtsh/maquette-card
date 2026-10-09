// réglages globaux (REGLAGES) et format public anglais (versAnglais / depuisAnglais) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- réglages globaux (panneau ⚙ Paramètres) : valeurs effectives, avec les valeurs par défaut d'avant ces options ----------
// vitesses du replay (secondes de journée par seconde) ; défaut ×900
const VITESSES_REPLAY = [[60, "×60 (1 min/s)"], [300, "×300"], [900, "×900"], [3600, "×3600 (1 h/s)"]];
const vitesseReplay = (r) => (r && typeof r === "object" && VITESSES_REPLAY.some(([v]) => v === +r.vitesse) ? +r.vitesse : 900);
// présence par défaut des puces et des alertes « personne à la maison » (chacune peut avoir la sienne)
const presenceDefaut = (c) => (typeof c?.presence === "string" && c.presence.includes(".") ? c.presence : "zone.home");
// teinte des pièces selon la température : null (désactivée) ou [min, max] en °C, bornes de la légende ; défaut 17 à 28 °C
const TEINTE_DEF = [17, 28];
function teinteTemp(c) {
  const v = c?.teinte_temperature;
  if (v === false) return null;
  const o = v && typeof v === "object" ? v : {}, a = num(o.min) ? +o.min : TEINTE_DEF[0], b = num(o.max) ? +o.max : TEINTE_DEF[1];
  return a < b ? [a, b] : TEINTE_DEF;
}
// couleur d'une température sur l'échelle [min, max] (les paliers de couleur sont définis de 17 à 28 °C)
const couleurTempEchelle = (t, [a, b]) => couleurTemp(t == null || (a === TEINTE_DEF[0] && b === TEINTE_DEF[1]) ? t : TEINTE_DEF[0] + ((t - a) * (TEINTE_DEF[1] - TEINTE_DEF[0])) / (b - a));
// éléments des étiquettes de pièce : nom, température, humidité (tous affichés par défaut)
const etiquettesPieces = (c) => { const o = c?.etiquettes_pieces && typeof c.etiquettes_pieces === "object" ? c.etiquettes_pieces : {}; return { nom: o.nom !== false, temperature: o.temperature !== false, humidite: o.humidite !== false }; };

// ---------- format public en anglais : traduction à la frontière (la config interne et le code restent en français) ----------
// depuisAnglais à l'entrée (setConfig, import de l'éditeur, carte relue dans le dashboard), versAnglais à la sortie (enregistrement,
// export, versions, stub, stratégies). Un seul schéma, qui dépend du contexte : une même clé interne change de nom ou de valeurs
// selon l'objet qui la porte (`niveau` d'un élément ou d'une alerte, `clic` d'une pièce ou d'un meuble, `pieces` du plan ou du widget climat…).
// Nœud : { k: { cléInterne: "english" | ["english", nœud] }, l: nœud des éléments d'une liste, v: { valeurInterne: "english" },
//          var: [cléInterne, { valeurInterne: { cléInterne: nœud } }] (contenu d'une clé qui dépend d'une autre clé),
//          m: nœud des valeurs d'un dictionnaire à clés libres (`persons: {person.x: {…}}`) }.
// Selon le type de la valeur (objet, liste, texte), le nœud s'applique par k, l ou v : `animation: halo` ou `animation: {type: halo}`.
// Nœud absent = contenu libre, copié tel quel (entités, noms, couleurs, nombres, coordonnées, données de service, états HA…).
// Seules les valeurs énumérées sont traduites ; une valeur inconnue passe telle quelle (la normalisation décide), mais une valeur
// interne (française) écrite dans le YAML anglais est refusée, comme une clé inconnue : ignorée, avec un avertissement unique.
const nObj = (k, x = {}) => ({ k, ...x }), nListe = (l) => ({ l }), nEnum = (v) => ({ v });
// dictionnaire : clés libres (identifiants d'entités, gardés tels quels), chaque valeur traduite par le nœud donné
const nDico = (m) => ({ m });
const V_CLIC = { fiche: "card", infos: "more_info", aucun: "none" };
const V_ANIM = { aucune: "none", pulsation: "pulse", respiration: "breathe", clignote: "blink", halo: "halo", onde: "wave", defilement: "scroll" };
const V_MEUBLES = { canape: "sofa", canape_angle: "corner_sofa", fauteuil: "armchair", table_basse: "coffee_table", meuble_tv: "tv_unit", etagere: "shelf",
  tapis: "rug", plante: "plant", cheminee: "fireplace", table_carree: "square_table", table_rect: "rect_table", table_ronde: "round_table", chaise: "chair",
  plan_travail: "counter", evier: "sink", plaques: "hob", refrigerateur: "fridge", lave_linge: "washing_machine", lave_vaisselle: "dishwasher",
  lit_simple: "single_bed", lit_double: "double_bed", lit_bebe: "crib", table_nuit: "nightstand", armoire: "wardrobe", commode: "dresser", bureau: "desk",
  douche: "shower", baignoire: "bathtub", lavabo: "washbasin", wc: "toilet", chaudiere: "boiler", ballon: "water_heater", radiateur: "radiator",
  tableau_elec: "electrical_panel", box: "router", borne_recharge: "ev_charger", pac: "heat_pump", voiture: "car", velo: "bike", arbre: "tree", piscine: "pool",
  espace: "area", rect: "rect", cercle: "circle", escalier: "stairs", forme: "custom" };
// catégories des meubles (catalogue et meubles personnalisés `modeles[].cat`)
const V_CATS_MEUBLES = { sejour: "living", repas: "dining", cuisine: "kitchen", chambre: "bedroom", salle_eau: "bathroom", technique: "utility", formes: "shapes", exterieur: "outdoor" };
const V_CALQUES = { pieces: "rooms", sous_zones: "sub_areas", halos: "halos", meubles: "furniture", limites: "fences", murs: "walls", ouvertures: "openings",
  etiquettes: "room_labels", libelles: "area_labels", appareils: "badges", textes: "texts" };
const V_WIDGETS = { tarif: "tariff", ve: "ev", jauge: "gauge", tuile: "tile", entites: "entities", periodes: "periods", separateur: "divider", commande: "cover",
  thermostat: "thermostat", climat: "climate", serrure: "lock" };
const V_PERIODES = { jour: "day", semaine: "week", mois: "month", annee: "year" };
// lignes d'un widget (`lignes`, `entites`) : une entité en texte ou un objet
const N_LIGNE = nObj({ entite: "entity", nom: "name", icone: "icon", decimales: "decimals", unite: "unit" });
// widgets des panneaux et des fiches : toutes les clés de tous les types (aucune clé n'y change de sens d'un type à l'autre)
const N_WIDGET = nObj({ type: ["type", nEnum(V_WIDGETS)], titre: "title", icone: "icon", couleur: "color", lignes: ["rows", nListe(N_LIGNE)],
  entite: "entity", unite: "unit", decimales: "decimals", historique: "history", min: "min", max: "max", entites: ["entities", nListe(N_LIGNE)],
  prix: "price", periode: "period", couleur_jour: "color_today", couleur_demain: "color_tomorrow",
  batterie: "battery", autonomie: "range", puissance: "power", seuil: "threshold", branche: "plugged", session_kwh: "session_kwh", session_cout: "session_cost",
  periodes: ["periods", nListe(nEnum(V_PERIODES))], note: "note",
  colonnes: ["columns", nListe(nObj({ nom: "name", unite: "unit", stat: "stat", facteur: "factor", decimales: "decimals", jour: "day", semaine: "week", mois: "month",
    annee: "year", source: ["source", nEnum({ stat: "stat", entites: "entities" })] }))],
  espace: "spacing", confirmer: "confirm", duree: "duration", pieces: "rooms", dehors: "outside", moyenne: "average",
  stable_t: "stable_t", alerte_t: "alert_t", stable_h: "stable_h", alerte_h: "alert_h", t_min: "t_min", t_max: "t_max", h_min: "h_min", h_max: "h_max",
  // jauge : couleur selon la valeur, comme la carte Jauge de HA (chaque couleur s'applique à partir de sa valeur)
  seuils: ["severity", nObj({ vert: "green", jaune: "yellow", rouge: "red" })] });
const N_PANNEAUX = nObj({ gauche: ["left", nListe(N_WIDGET)], droite: ["right", nListe(N_WIDGET)] });
// fiche : { titre, widgets } (ou directement la liste des widgets)
const N_FICHE = nObj({ titre: "title", widgets: ["widgets", nListe(N_WIDGET)], plus_infos: "more_info" }, { l: N_WIDGET });
// animation : un type, ou { type, couleur, duree, intensite, forme }
const N_ANIM = nObj({ type: ["type", nEnum(V_ANIM)], couleur: "color", duree: "duration", intensite: "intensity", forme: ["shape", nEnum({ contour: "outline" })] }, { v: V_ANIM });
const K_ELEMENT = { masque: "hidden", niveau: "level", groupe: "group", verrouille: "locked" };
// clés « connectées » communes aux pastilles et aux meubles
const K_CONNECTE = { entite: "entity", valeur: "value", actif: "active", actif_attribut: "active_attribute", seuil: "threshold", attribut: "attribute",
  unite: "unit", decimales: "decimals", couleur: "color", clic: ["tap", nEnum(V_CLIC)], protege: "protected", confirmer: "confirm", fiche: ["card", N_FICHE], animation: ["animation", N_ANIM] };
const N_PIECE = nObj({ nom: "name", poly: "poly", etiquette: "label", temperature: "temperature", humidite: "humidity", attribut_temperature: "temperature_attribute",
  attribut_humidite: "humidity_attribute", clic: "tap", dehors: "outside", zoom: "zoom", zone: "area", auto_actions: "auto_actions", automatismes: "automations",
  actions: ["actions", nListe(nObj({ nom: "name", icone: "icon", action: "action", cible: ["target", nEnum({ piece: "room" })], donnees: "data", confirmer: "confirm" }))],
  panneaux: ["panels", N_PANNEAUX], sous_zone: "sub_area", ...K_ELEMENT });
const N_OUVERTURE = nObj({ type: ["type", nEnum({ fenetre: "window", porte: "door", portail: "gate" })], seg: "seg", nom: "name", contact: "contact", volet: "shutter",
  entite: "entity", dehors: "outside", volet_seul: "shutter_only", baie: "bay", allege: "sill", hauteur: "height",
  vitree: ["glazed", nEnum({ toute: "full", haut: "top" })], avancee: "overhang", avancee_hauteur: "overhang_height", lames: ["slats", nEnum({ orientables: "tilt", ajourees: "vented" })],
  battants: "leaves", ouvrant: ["swing", nEnum({ gauche: "left", droite: "right", coulissant: "sliding" })], vers_dehors: "outward", animation: ["animation", N_ANIM], animation_volet: ["shutter_animation", N_ANIM],
  clic: ["tap", nEnum(V_CLIC)], protege: "protected", confirmer: "confirm", fiche: ["card", N_FICHE], ...K_ELEMENT });
const N_POINT = nObj({ ...K_CONNECTE, pos: "pos", icone: "icon", nom: "name", halo: "halo", piece: "room", alerte: "alert", clair: "light_color", zoom_seul: "zoom_only", ...K_ELEMENT });
const N_TEXTE = nObj({ t: "text", pos: "pos", taille: "size", style: ["style", nEnum({ discret: "subtle" })],
  infos: ["info", nListe(nObj({ entite: "entity", nom: "name", attribut: "attribute", unite: "unit", decimales: "decimals", icone: "icon" }))], ...K_ELEMENT });
// forme d'un meuble personnalisé (`type: custom`) : primitives en % de la taille
const N_PRIMITIVE = nObj({ genre: ["kind", nEnum({ rect: "rect", arrondi: "rounded_rect", ellipse: "ellipse", trait: "line", polygone: "polygon" })],
  x: "x", y: "y", l: "w", h: "h", rayon: "radius", points: "points", style: ["style", nEnum({ plein: "filled", vide: "outline", tirets: "dashed" })] });
const N_MEUBLE = nObj({ type: ["type", nEnum(V_MEUBLES)], pos: "pos", taille: "size", rotation: "rotation", miroir: "mirror", nom: "name", chaises: "chairs", teinte: "tint",
  forme: ["shape", nListe(N_PRIMITIVE)], ...K_CONNECTE, ...K_ELEMENT });
const N_PUCE = nObj({ type: ["type", nEnum({ ouvertures: "openings", lumieres: "lights", volets: "shutters", temperature: "temperature", entite: "entity" })],
  icone: "icon", entite: "entity", nom: "name", unite: "unit", decimales: "decimals", alerte_au_dessus: "alert_above", alerte_etat: "alert_state",
  masquer_si: "hide_if", afficher: ["show", nEnum({ absent: "away", present: "home" })], presence: "presence", ligne: "new_line", sous: "below" });
const N_CALQUES = nObj({ ordre_svg: ["drawing_order", nListe(nEnum(V_CALQUES))], ordre_html: ["overlay_order", nListe(nEnum(V_CALQUES))],
  masques: ["hidden", nListe(nEnum(V_CALQUES))], verrous: ["locked", nListe(nEnum(V_CALQUES))], bouton_vue: "view_button" });
const N_PERSONNE = nObj({ entite: "entity" });
// affichage des personnes (`ambiance.personnes`, et par personne dans `par_personne`) : dehors, à la maison, avatar
const K_AFF_PERSONNE = { dehors: ["away", nEnum({ direction: "direction", zone: "zone", cache: "hidden" })], chez_soi: ["at_home", nEnum({ groupe: "grouped", cache: "hidden" })],
  avatar: ["avatar", nEnum({ photo: "picture", initiales: "initials" })] };
// bulles d'appareils (`style_pastilles`) : indisponibles, inactives, taille, valeurs
const N_STYLE_PASTILLES = nObj({ indisponible: ["unavailable", nEnum({ estompe: "dimmed", tirets: "dashed", cache: "hidden" })],
  inactif: ["inactive", nEnum({ visible: "shown", actif_seul: "active_only", estompe: "dimmed" })], zoom_seul: "zoom_only", taille: ["size", nEnum({ petit: "small", normal: "normal", grand: "large" })],
  valeurs: ["values", nEnum({ toujours: "always", survol: "hover", jamais: "never" })] });
const N_AMBIANCE = nObj({ intensite: ["intensity", nEnum({ discret: "subtle", normal: "normal", fort: "strong" })], nord: "north",
  jour_nuit: ["day_night", nObj({ soleil: "sun", intensite: "intensity", marqueur: "marker" })],
  meteo: ["weather", nObj({ entite: "entity", intensite: "intensity", sens: ["direction", nEnum({ vent: "wind" })] })],
  traces: ["traces", nObj({ duree: "duration", couleur: "color" })],
  // source : numéro d'un meuble ou type de meuble ; pastilles : flux aussi vers les pastilles (points)
  energie: ["energy", nObj({ source: ["source", nEnum(V_MEUBLES)], seuil: "threshold", couleur: "color", pastilles: "badges" })],
  personnes: ["people", nObj({ maison: "home", entites: ["entities", nListe(N_PERSONNE)], ...K_AFF_PERSONNE, par_personne: ["persons", nDico(nObj(K_AFF_PERSONNE))] }, { l: N_PERSONNE })],
  lumiere: ["light", nObj({ soleil: "sun", lune: "moon", lampes: "lamps", ciel: "sky", rediffusion: "bounce", ciel_diffusion: "sky_diffusion", ciel_kelvin: "sky_kelvin", soleil_kelvin: "sun_kelvin", portes: ["doors", nEnum({ ouvertes: "open", fermees: "closed" })] })] });
const N_ANIMATIONS = nObj({ ouverture: ["opening", N_ANIM], volet: ["shutter", N_ANIM], alerte: ["alert", N_ANIM], lumiere: ["light", N_ANIM],
  appareil: ["badge", N_ANIM], meuble: ["furniture", N_ANIM] });
const N_ALERTE = nObj({ nom: "name", entite: "entity", entites: "entities", niveau: ["level", nEnum({ critique: "critical", alerte: "warning", info: "info" })],
  type: ["type", nEnum({ ouvertures: "openings" })], si_absent: "when_away", au_dessus: "above", au_dessous: "below", etat: "state", presence: "presence",
  icone: "icon", actif: "enabled" });
// chemins de champs d'un widget (« lignes.0.entite » ↔ « rows.0.entity ») : chaque segment traduit par la table N_WIDGET
const cheminWidget = (c, versEn) => {
  if (typeof c !== "string") return c;
  let n = N_WIDGET;
  return c.split(".").map((seg) => {
    if (/^\d+$/.test(seg)) return seg;
    const t = prepNoeud(n), e = t?.k ? (versEn ? t.kFr : t.kEn)[seg] : null;
    if (!e) return seg;
    n = e.n?.l || e.n;
    return versEn ? e.en : e.fr;
  }).join(".");
};
const N_DEMANDER = { f: (x, versEn) => (Array.isArray(x) ? x.map((c) => cheminWidget(c, versEn)) : x) };
// champs entité à demander d'une ouverture ou d'un meuble (contact, volet, entité motorisée ; entité, valeur, état actif)
const N_DEMANDER_SIMPLE = (t) => { const en = Object.fromEntries(Object.entries(t).map(([k, v]) => [v, k])); return { f: (x, versEn) => (Array.isArray(x) ? x.map((c) => (versEn ? t : en)[c] ?? c) : x) }; };
// modèles de l'éditeur : le contenu de `objet` dépend du genre (widget, meuble, pastille, ouverture) ;
// `id` (court, généré) et `demander` (champs entité à choisir à chaque ajout) pour les widgets
const N_MODELE = nObj({ id: "id", demander: ["ask", N_DEMANDER], nom: "name", genre: ["kind", nEnum({ widget: "widget", meuble: "furniture", point: "badge", ouverture: "opening" })], icone: "icon",
  desc: "description", type: ["type", nEnum(V_MEUBLES)], domaine: "domain", objet: "item", objets: ["items", nListe(N_WIDGET)],
  // meubles personnalisés : catégorie du catalogue et mots de recherche
  cat: ["category", nEnum(V_CATS_MEUBLES)], mots: "keywords" },
{ var: ["genre", { widget: { objet: N_WIDGET }, meuble: { objet: N_MEUBLE, demander: N_DEMANDER_SIMPLE({ entite: "entity", valeur: "value", actif: "active" }) }, point: { objet: N_POINT },
  ouverture: { objet: N_OUVERTURE, demander: N_DEMANDER_SIMPLE({ contact: "contact", volet: "shutter", entite: "entity" }) } }] });
const N_RACINE = nObj({ type: "type", id: "id", titre: "title", resume: ["summary", nListe(N_PUCE)], plein_ecran: "full_page", edition: "editor", marge: "margin",
  pieces: ["rooms", nListe(N_PIECE)], murs: "walls", limites: "fences", ouvertures: ["openings", nListe(N_OUVERTURE)], points: ["badges", nListe(N_POINT)],
  textes: ["texts", nListe(N_TEXTE)], meubles: ["furniture", nListe(N_MEUBLE)], afficher_meubles: ["show_furniture", nEnum({ pc: "desktop" })],
  calques: ["layers", N_CALQUES], groupes: ["groups", nListe(nObj({ id: "id", nom: "name" }))], panneaux: ["panels", N_PANNEAUX],
  modeles: ["templates", nListe(N_MODELE)], ambiance: ["ambience", N_AMBIANCE], animations: ["animations", N_ANIMATIONS], alertes: ["alerts", nListe(N_ALERTE)],
  style_pastilles: ["badge_style", N_STYLE_PASTILLES], palette: "palette",
  replay: ["replay", nObj({ heures: "hours", vitesse: "speed" })], vitrine: ["showcase", nObj({ pos: "pos", largeur: "width" })], demo: "demo", langue: "language",
  // réglages globaux (panneau ⚙ Paramètres de l'éditeur) : présence par défaut, étiquettes des pièces, teinte de température, légende
  presence: "presence", etiquettes_pieces: ["room_labels", nObj({ nom: "name", temperature: "temperature", humidite: "humidity" })],
  teinte_temperature: ["temperature_tint", nObj({ min: "min", max: "max" })], legende: "legend",
  // interaction au toucher, tablette murale, niveau d'animation
  interaction: ["interaction", nObj({ clic_piece: ["room_tap", nEnum({ vue: "room_view", infos: "more_info", aucun: "none" })], vue_figee: "lock_view", retour_apres: "reset_after" })],
  tablette: ["tablet", nObj({ resume: "summary", panneaux: "panels", anti_marquage: "burn_in" })],
  niveau_animation: ["animation_level", nEnum({ complet: "full", reduit: "reduced", aucun: "none" })],
  // clés que Home Assistant ajoute à toute carte : gardées telles quelles
  view_layout: "view_layout", layout_options: "layout_options", grid_options: "grid_options", visibility: "visibility", card_mod: "card_mod" });
// tables de chaque nœud (interne → anglais et retour), préparées au premier usage ; un nom anglais en double est une erreur du schéma
function prepNoeud(n) {
  if (!n || n.kFr || n.vEn) return n;
  if (n.k) {
    const fr = Object.create(null), en = Object.create(null);
    for (const [k, s] of Object.entries(n.k)) {
      const [e, sous] = Array.isArray(s) ? s : [s, null];
      if (en[e]) throw new Error(`maquette-card : schéma anglais, « ${e} » en double`);
      fr[k] = { en: e, n: sous }; en[e] = { fr: k, n: sous };
    }
    n.kEn = en; n.kFr = fr;
  }
  if (n.v) {
    const en = Object.create(null);
    for (const [k, e] of Object.entries(n.v)) { if (en[e]) throw new Error(`maquette-card : schéma anglais, valeur « ${e} » en double`); en[e] = k; }
    n.vFrSeul = new Set(Object.keys(n.v).filter((k) => !(k in en)));
    n.vEn = en;
  }
  return n;
}
const REJET = Symbol("rejet"), AVERTIS = new Set();
const avertir = (m) => { if (AVERTIS.has(m)) return; AVERTIS.add(m); console.warn(`maquette-card : ${m}`); };
const copie = (x) => (Array.isArray(x) ? x.map(copie) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, copie(v)])) : x);
// rap (facultatif, objet) : cles (clés renommées), valeurs (valeurs traduites), inconnues et refusees (chemins ignorés)
function traduire(x, n, versEn, chemin, rap) {
  n = prepNoeud(n);
  if (n?.f) return n.f(x, versEn);
  if (Array.isArray(x)) return n?.l ? x.map((e) => traduire(e, n.l, versEn, chemin, rap)).filter((e) => e !== REJET) : copie(x);
  if (n?.m && x && typeof x === "object") {
    const out = {};
    for (const [k, v] of Object.entries(x)) { const r = traduire(v, n.m, versEn, chemin ? `${chemin}.${k}` : k, rap); if (r !== REJET) out[k] = r; }
    return out;
  }
  if (x && typeof x === "object") {
    if (!n?.k) return copie(x);
    const cles = versEn ? n.kFr : n.kEn, out = {};
    let vr = null;
    if (n.var) {
      const [dk, tab] = n.var, sd = n.kFr[dk], dv = x[versEn ? dk : sd.en], ne = prepNoeud(sd.n);
      const di = !versEn && typeof dv === "string" && ne?.vEn && dv in ne.vEn ? ne.vEn[dv] : dv;
      vr = typeof di === "string" && Object.hasOwn(tab, di) ? tab[di] : null;
    }
    for (const [k, v] of Object.entries(x)) {
      const s = cles[k], nom = s && versEn ? s.en : k, ch = chemin ? `${chemin}.${nom}` : nom;
      if (!s) { avertir(`unknown key « ${ch} » (ignored)`); if (rap) (rap.inconnues ||= []).push(ch); continue; }
      const ki = versEn ? k : s.fr, ke = versEn ? s.en : k;
      const r = traduire(v, vr && Object.hasOwn(vr, ki) ? vr[ki] : s.n, versEn, ch, rap);
      if (r === REJET) continue;
      if (ki !== ke && rap) rap.cles = (rap.cles || 0) + 1;
      out[versEn ? ke : ki] = r;
    }
    return out;
  }
  if (typeof x === "string" && n?.v) {
    if (versEn) {
      if (!Object.hasOwn(n.v, x)) return x;
      if (n.v[x] !== x && rap) rap.valeurs = (rap.valeurs || 0) + 1;
      return n.v[x];
    }
    if (x in n.vEn) { if (n.vEn[x] !== x && rap) rap.valeurs = (rap.valeurs || 0) + 1; return n.vEn[x]; }
    if (n.vFrSeul.has(x)) { avertir(`unknown value « ${x} » for « ${chemin} » (ignored)`); if (rap) (rap.refusees ||= []).push(`${chemin}: ${x}`); return REJET; }
  }
  return x;
}
// config interne (clés françaises) → format public (anglais)
const versAnglais = (cfg, rap) => (cfg && typeof cfg === "object" && !Array.isArray(cfg) ? traduire(cfg, N_RACINE, true, "", rap) : cfg);
// format public (anglais) → config interne ; une config entière à l'ancien format (clés françaises) est refusée avec un message clair
function depuisAnglais(cfg, rap) {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return cfg;
  if (Object.hasOwn(cfg, "pieces") && !Object.hasOwn(cfg, "rooms"))
    throw new Error("maquette-card : this configuration uses the former French keys (pieces, murs, ouvertures…): convert it to the English keys (rooms, walls, openings…), see https://github.com/TooMuhtsh/maquette-card/blob/main/CHANGELOG.md#former-french-keys");
  return traduire(cfg, N_RACINE, false, "", rap);
}

// JSON indépendant de l'ordre des clés (HA et setConfig ne gardent pas toujours le même ordre)
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
