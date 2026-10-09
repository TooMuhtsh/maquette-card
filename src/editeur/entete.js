// imports, outils de la carte, couleurs, icônes, outils et raccourcis, catalogue des widgets de base — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
/* Éditeur du plan (chargé à la demande par maquette-card, admins seulement).
 * Outils : sélection/déplacement, appareil, mur, limite, ouverture, pièce, texte ; magnétisme grille + sommets + angles droits ;
 * panneau de propriétés, annuler/rétablir, raccourcis clavier, brouillon local, enregistrement dans la config du dashboard.
 */
import "./maquette-i18n.js"; // dist : ligne retirée par build.mjs (déjà chargé en tête)
import "./maquette-nettoyage.js"; // idem : moteur « Nettoyer le plan » (globalThis.MaquetteNettoyage)
const { _t, _tk } = globalThis.MaquetteI18n, _loc = () => globalThis.MaquetteI18n.locale();
// outils communs exposés par la carte (déjà définie quand l'éditeur se charge) : une seule définition
const { dansPoly, distBord, entitesZone, esc, fmt, canon, GENRES_FICHE, porteurDe, deCle, BASCULES, NOMS_OUVERTURE, initiales, borne,
  TAILLE_MEUBLE_MAX: MAX_TAILLE_MEUBLE, CHAMPS_ENTITE_WIDGET, stock, stockSession, cleRouvrir, cleVersions } = customElements.get("maquette-card").outils;
// HTML posé via le filet de sécurité de la carte (balises, attributs, liens et styles contrôlés : voir « sécurité (2/3) »)
const poserHTML = (el, h) => customElements.get("maquette-card").poserHTML(el, h);
const ajouterHTML = (el, h) => customElements.get("maquette-card").ajouterHTML(el, h);
// écran tactile (textes sans « clic », « Alt », « Maj ») ; sans souris ni pavé (aide aux raccourcis clavier masquée)
const tactile = () => matchMedia("(pointer: coarse)").matches;
const sansClavier = () => !matchMedia("(any-pointer: fine)").matches;
// bulle d'aide ⓘ (texte déjà traduit, non échappé) : remplace les aides permanentes ; comportement dans EditeurPlan._cablerAides
const bulleI = (txt) => (txt ? `<button type="button" class="ed-i" data-aide="${esc(txt)}" aria-label="${esc(_t("Aide"))}" aria-description="${esc(txt)}" aria-expanded="false"><ha-icon icon="mdi:information-outline"></ha-icon></button>` : "");
// action secondaire en icône (libellé en infobulle et pour les lecteurs d'écran)
// types édités dans la modale (barre flottante sur le plan, plus de feuille latérale) ; les autres gardent la feuille pour l'instant
const TYPES_MODALE = new Set(["piece", "ouverture", "point", "meuble", "texte", "mur", "limite", "widget", "puce"]);
// champ glissière + valeur affichée : lib (HTML), attrs de l'input (data-k…), bornes, pas, valeur (déjà échappée), texte de la sortie
const champCurseur = (lib, attrs, min, max, pas, val, sortie) => `<div class="ed-champ"><label>${lib}</label><div class="ed-curseur"><input type="range" min="${min}" max="${max}" step="${pas}" ${attrs} value="${val}"><output>${sortie}</output></div></div>`;
const ibAct = (act, icone, lib, attrs = "") => `<button type="button" class="ib" data-act="${act}" title="${esc(lib)}" aria-label="${esc(lib)}" ${attrs}><ha-icon icon="${icone}"></ha-icon></button>`;

// noms des couleurs : clés traduites à l'affichage (_t)
const COULEURS = [[_tk("Jaune"), "#f6c445"], [_tk("Orange"), "#e8710a"], [_tk("Rouge"), "#d93025"], [_tk("Rose"), "#d01884"], [_tk("Violet"), "#9334e6"],
  [_tk("Bleu"), "#1a73e8"], [_tk("Cyan"), "#12b5cb"], [_tk("Vert"), "#188038"], [_tk("Gris"), "#5f6368"]];
const ICONES = {
  light: ["mdi:lightbulb", "mdi:floor-lamp", "mdi:ceiling-light", "mdi:lamp", "mdi:led-strip-variant", "mdi:wall-sconce"],
  switch: ["mdi:power-socket-eu", "mdi:power", "mdi:light-flood-down", "mdi:fridge-outline", "mdi:ev-station", "mdi:washing-machine"],
  binary_sensor: ["mdi:motion-sensor", "mdi:door", "mdi:window-closed-variant", "mdi:smoke-detector", "mdi:water-alert", "mdi:vibrate"],
  sensor: ["mdi:thermometer", "mdi:water-percent", "mdi:flash", "mdi:gauge", "mdi:molecule-co2", "mdi:brightness-5"],
  camera: ["mdi:cctv", "mdi:webcam"], cover: ["mdi:window-shutter", "mdi:garage-variant", "mdi:blinds", "mdi:gate"],
  climate: ["mdi:thermostat", "mdi:heating-coil", "mdi:air-conditioner", "mdi:radiator"], media_player: ["mdi:television", "mdi:speaker", "mdi:cast"],
  vacuum: ["mdi:robot-vacuum"], fan: ["mdi:fan"], lock: ["mdi:lock"], _: ["mdi:circle", "mdi:star", "mdi:information-outline", "mdi:home"],
};
// ---------- choix d'icône : aperçu, propositions selon l'entité, recherche dans les icônes de Home Assistant ----------
// (liste servie par HA, /static/mdi/iconList.json, chargée une fois) ; mots français → noms d'icônes anglais
const ICONES_DC = { temperature: ["thermometer", "thermometer-lines", "home-thermometer-outline", "snowflake-thermometer"], humidity: ["water-percent", "water", "air-humidifier"],
  power: ["flash", "lightning-bolt", "power-plug", "meter-electric"], energy: ["lightning-bolt", "meter-electric", "transmission-tower"], battery: ["battery", "battery-charging", "battery-alert"],
  door: ["door", "door-open", "door-closed", "door-sliding"], window: ["window-open-variant", "window-closed-variant", "window-shutter"], garage_door: ["garage-variant", "garage-open-variant"],
  motion: ["motion-sensor", "run", "walk"], occupancy: ["account", "home-account", "account-group"], smoke: ["smoke-detector", "fire"], moisture: ["water-alert", "pipe-leak"],
  co2: ["molecule-co2", "air-filter"], carbon_dioxide: ["molecule-co2", "air-filter"], carbon_monoxide: ["molecule-co", "air-filter"], illuminance: ["brightness-5", "white-balance-sunny"], plug: ["power-plug", "ev-plug-type2"], voltage: ["sine-wave"], current: ["current-ac"],
  monetary: ["cash", "currency-eur"], gas: ["meter-gas", "fire"], problem: ["alert-circle", "alert"], tamper: ["shield-alert"], opening: ["door-open", "gate-open"] };
const MOTS_FR = { lampe: "lamp lightbulb floor-lamp desk-lamp", lumiere: "lightbulb lightbulb-on ceiling-light", ampoule: "lightbulb", plafonnier: "ceiling-light", spot: "spotlight", projecteur: "light-flood-down spotlight-beam",
  prise: "power-socket-eu power-plug", interrupteur: "light-switch toggle-switch", porte: "door door-open", fenetre: "window-open-variant window-closed-variant", baie: "window-open-variant door-sliding", volet: "window-shutter blinds roller-shade",
  portail: "gate gate-open", garage: "garage-variant garage-open-variant", chauffage: "radiator thermostat heating-coil", radiateur: "radiator", chaudiere: "water-boiler", thermostat: "thermostat",
  temperature: "thermometer", humidite: "water-percent", eau: "water", fuite: "water-alert pipe-leak", pluie: "weather-rainy", neige: "weather-snowy", soleil: "white-balance-sunny weather-sunny", nuit: "weather-night moon-waning-crescent",
  vent: "weather-windy fan", nuage: "weather-cloudy", meteo: "weather-partly-cloudy", voiture: "car car-electric", recharge: "ev-station ev-plug-type2", borne: "ev-station", velo: "bike", moto: "motorbike",
  tele: "television", television: "television", tv: "television", musique: "music", enceinte: "speaker", radio: "radio", frigo: "fridge fridge-outline", congelateur: "fridge-industrial snowflake",
  four: "stove microwave", cuisine: "stove countertop", cafe: "coffee coffee-maker-outline", lave: "washing-machine dishwasher", linge: "washing-machine tumble-dryer", vaisselle: "dishwasher",
  aspirateur: "robot-vacuum vacuum", ventilateur: "fan ceiling-fan", clim: "air-conditioner", climatisation: "air-conditioner", camera: "cctv camera webcam", alarme: "alarm-light shield-home", sirene: "alarm-light bullhorn",
  securite: "shield-home shield-lock", serrure: "lock lock-open", cle: "key", sonnette: "doorbell bell", cloche: "bell", mouvement: "motion-sensor run", presence: "account home-account", personne: "account",
  fumee: "smoke-detector", gaz: "meter-gas", compteur: "meter-electric counter", electricite: "flash transmission-tower", energie: "lightning-bolt flash", batterie: "battery", solaire: "solar-power solar-panel",
  prix: "cash currency-eur", euro: "currency-eur", argent: "cash", horloge: "clock-outline", heure: "clock-outline", minuteur: "timer-outline", calendrier: "calendar", agenda: "calendar",
  poubelle: "trash-can delete", dechets: "trash-can recycle", recyclage: "recycle", jardin: "flower tree sprout", plante: "flower sprout", arrosage: "sprinkler watering-can", piscine: "pool", arbre: "tree",
  maison: "home home-outline", bureau: "desk monitor", ordinateur: "laptop monitor", lit: "bed", chambre: "bed", canape: "sofa", salon: "sofa", salle: "shower bathtub", douche: "shower", bain: "bathtub",
  toilettes: "toilet", escalier: "stairs", cave: "home-floor-negative-1", grenier: "home-roof", wifi: "wifi", internet: "web", routeur: "router-wireless", serveur: "server", imprimante: "printer", telephone: "cellphone",
  chat: "cat", chien: "dog", animal: "paw", bebe: "baby-carriage", colis: "package-variant", livraison: "truck-delivery package-variant", courrier: "email mailbox", boite: "mailbox",
  info: "information-outline", alerte: "alert", attention: "alert", ok: "check-circle", reglage: "cog", parametre: "cog", outil: "tools", etoile: "star", coeur: "heart", vacances: "palm-tree beach" };
let LISTE_ICONES = null;
async function listeIcones() {
  if (LISTE_ICONES) return LISTE_ICONES;
  try { const r = await fetch("/static/mdi/iconList.json"); LISTE_ICONES = r.ok ? (await r.json()).map((x) => ({ n: x.name, k: (x.keywords || []).join(" ").toLowerCase() })) : []; } catch (e) { LISTE_ICONES = []; }
  return LISTE_ICONES;
}
const sansAccent = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function chercherIcones(liste, q, n = 48) {
  q = sansAccent(q.replace(/^mdi:/, "").trim());
  if (!q) return [];
  const mots = q.split(/[\s-]+/).filter(Boolean), fr = new Set(mots.flatMap((m) => Object.entries(MOTS_FR).filter(([k]) => k.startsWith(m) && m.length >= 3).flatMap(([, v]) => v.split(" "))));
  const rangFr = [...fr], sc = (x) => (fr.has(x.n) ? 6 + (rangFr.length - rangFr.indexOf(x.n)) / 100 : 0) + (x.n === q ? 5 : x.n.startsWith(q) ? 3 : 0) + mots.reduce((a, m) => a + (x.n.includes(m) ? 2 : 0) + (x.k.includes(m) ? 1 : 0), 0);
  const ext = [...fr].filter((x) => !liste.some((y) => y.n === x)); // liste absente (hors HA) : les correspondances françaises restent proposées
  return [...ext, ...liste.map((x) => [x.n, sc(x)]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(([x]) => x)].slice(0, n);
}
// libellés (DOMAINES[i][1], OUTILS[i][2], PUCES[i][2] et [3], A_COMPLETER) : clés traduites à l'affichage (_t)
const DOMAINES = [["", _tk("Tout")], ["light", _tk("Lumières")], ["switch", _tk("Interrupteurs")], ["sensor", _tk("Capteurs")], ["binary_sensor", _tk("Détecteurs")],
  ["cover", _tk("Volets")], ["camera", _tk("Caméras")], ["climate", _tk("Climat")], ["media_player", _tk("Médias")]];
const OUTILS = [["selection", "mdi:cursor-default-outline", _tk("Sélection (V)")], ["mur", "mdi:wall", _tk("Mur (M)")], ["limite", "mdi:fence", _tk("Limite / clôture (L)")],
  ["ouverture", "mdi:window-closed-variant", _tk("Ouverture (O)")], ["rectangle", "mdi:rectangle-outline", _tk("Pièce rectangulaire avec ses murs (R)")],
  ["piece", "mdi:vector-square", _tk("Pièce de forme libre (P)")], ["texte", "mdi:format-text", _tk("Texte (T)")]];
const PAS_GRILLE = [1, 5, 10, 25]; // pas de la grille proposés, en cm
const RACCOURCIS = { v: "selection", m: "mur", l: "limite", o: "ouverture", r: "rectangle", p: "piece", t: "texte" };
const aire = (poly) => Math.abs(poly.reduce((a, p, j) => { const q = poly[(j + 1) % poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2) / 10000;
// pièce rectangle alignée sur les axes : [x, y, largeur, hauteur], sinon null
const rectDe = (poly) => {
  if (poly.length !== 4) return null;
  const xs = [...new Set(poly.map((p) => p[0]))], ys = [...new Set(poly.map((p) => p[1]))];
  if (xs.length !== 2 || ys.length !== 2) return null;
  return [Math.min(...xs), Math.min(...ys), Math.abs(xs[1] - xs[0]), Math.abs(ys[1] - ys[0])];
};
// ancien type accepté : cartes et exports créés avant le renommage
const TYPES_CARTE = ["custom:maquette-card", "custom:plan-maison-card"];
// clés que Home Assistant ajoute à la carte (placement, visibilité, card_mod) : jamais reprises d'un plan importé
const CLES_HA = ["view_layout", "layout_options", "grid_options", "visibility", "card_mod"];
// plafonds d'un import : taille du texte, nœuds lus (un YAML aux alias en chaîne est refusé avant d'être copié), profondeur, éléments par liste
const MAX_IMPORT = 2e6, MAX_NOEUDS = 200000, MAX_PROFONDEUR = 40, MAX_LISTE = 5000;
function verifierTaille(o) {
  const pile = [[o, 0]];
  let n = 0;
  while (pile.length) {
    const [x, p] = pile.pop();
    if (!x || typeof x !== "object") continue;
    if (++n > MAX_NOEUDS || p > MAX_PROFONDEUR) throw new Error(_t("Plan trop grand ou trop imbriqué : import refusé."));
    if (Array.isArray(x)) { if (x.length > MAX_LISTE) throw new Error(_t("Liste trop longue (plus de {n} éléments) : import refusé.", { n: MAX_LISTE })); x.forEach((v) => pile.push([v, p + 1])); }
    else for (const k of Object.keys(x)) { if (k === "__proto__" || k === "constructor" || k === "prototype") delete x[k]; else pile.push([x[k], p + 1]); }
  }
}
const CLE = (id) => `maquette-brouillon:${id || "plan"}`;
// textes traduits à la lecture (getters) : noms, descriptions et titres par défaut des widgets créés (écrits dans la config)
const CATALOGUE = {
  get plan() { return [
    { nom: _t("Lumière"), icone: "mdi:lightbulb", desc: _t("Halo quand allumée"), genre: "point", domaine: "light", objet: { icone: "mdi:lightbulb", couleur: "#f6c445", halo: 130 } },
    { nom: _t("Prise / interrupteur"), icone: "mdi:power-socket-eu", desc: _t("Colorée si allumée"), genre: "point", domaine: "switch", objet: { icone: "mdi:power-socket-eu", couleur: "#1a73e8" } },
    { nom: _t("Appareil mesuré"), icone: "mdi:flash", desc: _t("Puissance affichée"), detail: _t("Puissance affichée, actif au-dessus d'un seuil"), genre: "point", domaine: "switch", objet: { icone: "mdi:power-plug", couleur: "#1a73e8", seuil: 20 }, aCompleter: ["valeur", "actif"] },
    { nom: _t("Caméra"), icone: "mdi:cctv", desc: _t("Clignote sur mouvement"), genre: "point", domaine: "camera", objet: { icone: "mdi:cctv", couleur: "#d93025", alerte: true }, aCompleter: ["actif"] },
    { nom: _t("Détecteur de mouvement"), icone: "mdi:motion-sensor", genre: "point", domaine: "binary_sensor", objet: { icone: "mdi:motion-sensor", couleur: "#e8710a" } },
    { nom: _t("Thermostat"), icone: "mdi:thermostat", desc: _t("Consigne affichée"), detail: _t("Consigne affichée, orange en chauffe"), genre: "point", domaine: "climate", objet: { icone: "mdi:thermostat", couleur: "#e8710a", attribut: "temperature", unite: " °C", actif_attribut: "hvac_action" } },
    { nom: _t("Capteur (valeur)"), icone: "mdi:thermometer", desc: _t("Affiche la valeur"), genre: "point", domaine: "sensor", objet: { icone: "mdi:thermometer", valeur: "$entite" } },
    { nom: _t("TV / média"), icone: "mdi:television", genre: "point", domaine: "media_player", objet: { icone: "mdi:television", couleur: "#9334e6" } },
    { nom: _t("Appareil libre"), icone: "mdi:shape-outline", desc: _t("N'importe quelle entité"), genre: "point", domaine: "", objet: {} },
    // ouvertures : `aCompleter` = capteurs voulus (pré-remplis à la pose avec les entités libres de la pièce, sinon à compléter) ;
    // `chercher` = repris seulement s'il y en a un seul dans la pièce ; `pref` = classes d'appareil préférées (portail, garage)
    { nom: _t("Fenêtre + volet + contact"), icone: "mdi:window-shutter", desc: _t("À tracer sur un mur"), genre: "ouverture", objet: { type: "fenetre" }, aCompleter: ["contact", "volet"], mots: "roulant store" },
    { nom: _t("Fenêtre + contact"), icone: "mdi:window-closed-variant", desc: _t("À tracer sur un mur"), genre: "ouverture", objet: { type: "fenetre" }, aCompleter: ["contact"] },
    { nom: _t("Fenêtre oscillo-battante"), icone: "mdi:window-open-variant", desc: _t("Contact, un battant"), genre: "ouverture", objet: { type: "fenetre", battants: 1, ouvrant: "gauche" }, aCompleter: ["contact"], mots: "oscillo battant tilt turn" },
    { nom: _t("Porte + volet + contact"), icone: "mdi:door", desc: _t("Porte avec volet roulant"), genre: "ouverture", objet: { type: "porte" }, aCompleter: ["contact", "volet"], mots: "entree roulant store" },
    { nom: _t("Porte + contact"), icone: "mdi:door", desc: _t("À tracer sur un mur"), genre: "ouverture", objet: { type: "porte" }, aCompleter: ["contact"], mots: "entree" },
    { nom: _t("Porte-fenêtre + volet + contact"), icone: "mdi:door-open", desc: _t("Deux battants"), genre: "ouverture", objet: { type: "porte", battants: 2, ouvrant: "gauche", vitree: "toute" }, aCompleter: ["contact", "volet"], mots: "porte fenetre roulant vitree" },
    { nom: _t("Baie coulissante"), icone: "mdi:door-sliding", desc: _t("Contact + volet, deux vantaux"), genre: "ouverture", objet: { type: "fenetre", battants: 2, ouvrant: "coulissant" }, aCompleter: ["contact", "volet"], mots: "baie vitree coulissant galandage bay sliding" },
    { nom: _t("Porte intérieure"), icone: "mdi:door-open", desc: _t("Sans capteur"), genre: "ouverture", objet: { type: "porte" } },
    { nom: _t("Porte de garage"), icone: "mdi:garage-variant", desc: _t("Motorisée (cover)"), genre: "ouverture", objet: { type: "portail" }, aCompleter: ["entite"], chercher: ["contact"], pref: ["garage", "garage_door"], mots: "basculante sectionnelle" },
    { nom: _t("Portail"), icone: "mdi:gate", desc: _t("Motorisé, deux battants"), genre: "ouverture", objet: { type: "portail", battants: 2, ouvrant: "gauche" }, aCompleter: ["entite"], chercher: ["contact"], pref: ["gate", "opening"], mots: "portillon gate" },
    { nom: _t("Pièce Home Assistant"), icone: "mdi:home-import-outline", desc: _t("Avec ses appareils"), detail: _t("Importe une pièce de HA et ses appareils"), genre: "zone" },
    { nom: _t("Toutes mes pièces HA"), icone: "mdi:home-group-plus", desc: _t("Rectangles + appareils"), detail: _t("Assistant : chaque pièce HA en rectangle, appareils compris"), genre: "assistant" },
    { nom: _t("Pièce rectangulaire"), icone: "mdi:rectangle-outline", desc: _t("Deux coins, murs compris"), genre: "outil", outil: "rectangle" },
    { nom: _t("Pièce de forme libre"), icone: "mdi:vector-square", desc: tactile() ? _t("Touche ses sommets") : _t("Clique ses sommets"), genre: "outil", outil: "piece" },
    { nom: _t("Mur"), icone: "mdi:wall", genre: "outil", outil: "mur" },
    { nom: _t("Limite / clôture"), icone: "mdi:fence", genre: "outil", outil: "limite" },
    { nom: _t("Texte"), icone: "mdi:format-text", genre: "outil", outil: "texte" },
    { nom: _t("Zone d'informations"), icone: "mdi:card-text-outline", desc: _t("Valeurs dans un encadré"), detail: _t("Températures, humidité, consommation… : plusieurs entités dans un encadré"), genre: "outil", outil: "infos" },
  ]; },
  get panneaux() { return [
    { nom: _t("Tarif en direct"), icone: "mdi:cash-clock", desc: _t("Prix, HP/HC, Tempo"), detail: _t("Prix, période HP/HC, couleurs Tempo"), genre: "widget", objet: { type: "tarif", titre: _t("Tarif en direct") } },
    { nom: _t("Véhicule électrique"), icone: "mdi:car-electric", desc: _t("Batterie, charge, coût"), detail: _t("Batterie, charge, session, coût"), genre: "widget", objet: { type: "ve", titre: _t("Voiture") } },
    { nom: _t("Jauge"), icone: "mdi:speedometer", desc: _t("Valeur entre min. et max."), detail: _t("Valeur entre un minimum et un maximum"), genre: "widget", objet: { type: "jauge", titre: _t("Puissance"), min: 0, max: 9000 } },
    { nom: _t("Tuile + courbe"), icone: "mdi:chart-line", desc: _t("Valeur + courbe"), detail: _t("Grande valeur et courbe des dernières heures"), genre: "widget", objet: { type: "tuile", titre: _t("Valeur"), historique: 24 } },
    { nom: _t("Liste d'entités"), icone: "mdi:format-list-bulleted", desc: _t("Valeurs et interrupteurs"), genre: "widget", objet: { type: "entites", titre: _t("Entités"), entites: [] } },
    { nom: _t("Thermostat"), icone: "mdi:thermostat", desc: _t("Consigne −/+"), detail: _t("Température mesurée, consigne réglable −/+, chauffe ou au repos"), genre: "widget", objet: { type: "thermostat", titre: _t("Thermostat") } },
    { nom: _t("Climat des pièces"), icone: "mdi:home-thermometer-outline", desc: _t("Par pièce, avec tendance"), detail: _t("Température et humidité par pièce, tendance sur 30 min, alertes"), genre: "widget", objet: { type: "climat", titre: _t("Climat des pièces"), duree: 30 } },
    { nom: _t("Séparateur"), icone: "mdi:minus", desc: _t("Trait, titre optionnel"), detail: _t("Trait, avec un titre de section si besoin"), genre: "widget", objet: { type: "separateur" } },
    { nom: _t("Périodes"), icone: "mdi:table-clock", desc: _t("Jour, semaine, mois"), detail: _t("Tableau jour / semaine / mois / année, depuis l'historique HA ou des compteurs"), genre: "widget", objet: { type: "periodes", titre: _t("Consommation"), colonnes: [{ nom: _t("Énergie"), unite: "kWh", decimales: 1, source: "stat" }] } },
    { nom: _t("Commande"), icone: "mdi:window-shutter-settings", desc: _t("Volet, portail"), detail: _t("Ouvrir, Stop, Fermer une cover, avec confirmation si besoin"), genre: "widget", objet: { type: "commande" }, mots: `volet store portail garage porte motorisee cover${globalThis.MaquetteI18n.langue() === "fr" ? "" : " shutter blind gate door motorized"}` },
  ]; },
};
