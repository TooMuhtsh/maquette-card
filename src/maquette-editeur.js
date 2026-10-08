/* Éditeur du plan (chargé à la demande par maquette-card, admins seulement).
 * Outils : sélection/déplacement, appareil, mur, limite, ouverture, pièce, texte ; magnétisme grille + sommets + angles droits ;
 * panneau de propriétés, annuler/rétablir, raccourcis clavier, brouillon local, enregistrement dans la config du dashboard.
 */
import "./maquette-i18n.js"; // dist : ligne retirée par build.mjs (déjà chargé en tête)
import "./maquette-nettoyage.js"; // idem : moteur « Nettoyer le plan » (globalThis.MaquetteNettoyage)
const { _t, _tk } = globalThis.MaquetteI18n, _loc = () => globalThis.MaquetteI18n.locale();
const fmt = (v, d = 1) => Number(v).toLocaleString(_loc(), { maximumFractionDigits: d });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// HTML posé via le filet de sécurité de la carte (balises, attributs, liens et styles contrôlés : voir « sécurité (2/3) »)
const poserHTML = (el, h) => customElements.get("maquette-card").poserHTML(el, h);
const ajouterHTML = (el, h) => customElements.get("maquette-card").ajouterHTML(el, h);
// écran tactile (textes sans « clic », « Alt », « Maj ») ; sans souris ni pavé (aide aux raccourcis clavier masquée)
const tactile = () => matchMedia("(pointer: coarse)").matches;
const sansClavier = () => !matchMedia("(any-pointer: fine)").matches;
// bulle d'aide ⓘ (texte déjà traduit, non échappé) : remplace les aides permanentes ; comportement dans EditeurPlan._cablerAides
const bulleI = (txt) => (txt ? `<button type="button" class="ed-i" data-aide="${esc(txt)}" aria-label="${esc(_t("Aide"))}" aria-description="${esc(txt)}" aria-expanded="false"><ha-icon icon="mdi:information-outline"></ha-icon></button>` : "");
// action secondaire en icône (libellé en infobulle et pour les lecteurs d'écran)
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
    { nom: _t("Porte-fenêtre + volet + contact"), icone: "mdi:door-open", desc: _t("Deux battants"), genre: "ouverture", objet: { type: "porte", battants: 2, ouvrant: "gauche" }, aCompleter: ["contact", "volet"], mots: "porte fenetre roulant" },
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
// ---------- widgets prêts à l'emploi (préréglages des types existants), rangés par catégorie ----------
// Catégories : [id, puce courte, titre de section] ; « generiques » = les types de base (CATALOGUE.panneaux en tête).
const CATS_WIDGETS = [["generiques", _tk("Génériques"), _tk("Génériques")], ["air", _tk("Air"), _tk("Air et climat")], ["lumiere", _tk("Lumière"), _tk("Lumière")],
  ["securite", _tk("Sécurité"), _tk("Sécurité")], ["eau", _tk("Eau"), _tk("Eau")], ["energie", _tk("Énergie"), _tk("Énergie")], ["ouvertures", _tk("Ouvertures"), _tk("Ouvertures")],
  ["chauffage", _tk("Chauffage"), _tk("Chauffage et clim")], ["menager", _tk("Ménager"), _tk("Électroménager")], ["multimedia", _tk("Multimédia"), _tk("Multimédia")],
  ["exterieur", _tk("Extérieur"), _tk("Extérieur et jardin")], ["reseau", _tk("Réseau##informatique"), _tk("Réseau et serveur")], ["presence", _tk("Présence"), _tk("Présence")],
  ["vehicule", _tk("Véhicule"), _tk("Véhicule")]];
// Critère d'entité pour le pré-remplissage : { d: domaine(s), dc: device_class(es), u: unité(s), id: expression cherchée dans
// « id + nom » (minuscules, sans accents, « _ . - » en espaces), non: expression exclue } ; toutes les conditions données doivent
// correspondre ; une liste de critères = alternatives.
const K = (d, dc, u, id, non) => ({ d, dc, u, id, non });
// `auto` d'un préréglage : { chemin: critère } pour un champ entité ; pour une liste (`entites`, `lignes`) :
// { n, k } = jusqu'à n entités correspondantes, ou { rangs: [{ k, nom? }] } = une ligne par critère (si trouvée).
const PW = (cat, nom, icone, desc, mots, objet, auto, detail) => ({ cat, nom, icone, desc, detail, mots, genre: "widget", objet: { titre: nom, icone, ...objet }, auto });
const BATT = ["battery"];
const PRETS_WIDGETS = () => [
  // ---- air et climat ----
  PW("air", _t("CO₂"), "mdi:molecule-co2", _t("Jauge 400 à 2000 ppm"), "co2 dioxyde carbone air confinement ppm carbon dioxide aeration",
    { type: "jauge", min: 400, max: 2000, unite: "ppm", decimales: 0, seuils: { vert: 0, jaune: 800, rouge: 1200 } },
    { entite: [K("sensor", "carbon_dioxide"), K("sensor", null, "ppm", "co2")] }, _t("Vert sous 800 ppm, orange jusqu'à 1200, rouge au-delà")),
  PW("air", _t("COV"), "mdi:air-filter", _t("Composés organiques volatils"), "cov voc tvoc composes organiques volatils air pollution",
    { type: "jauge", min: 0, max: 1000, decimales: 0, seuils: { vert: 0, jaune: 300, rouge: 500 } },
    { entite: [K("sensor", ["volatile_organic_compounds", "volatile_organic_compounds_parts"]), K("sensor", null, null, "voc|cov")] }),
  PW("air", _t("Particules PM2.5"), "mdi:blur", _t("Jauge en µg/m³"), "pm25 pm2.5 particules fines poussiere pollution dust particulate",
    { type: "jauge", min: 0, max: 100, unite: "µg/m³", decimales: 0, seuils: { vert: 0, jaune: 25, rouge: 50 } },
    { entite: [K("sensor", "pm25"), K("sensor", null, null, "pm2 5|pm25")] }),
  PW("air", _t("Humidité"), "mdi:water-percent", _t("Jauge 0 à 100 %"), "humidite hygrometrie humidity hygrometer",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { jaune: 0, vert: 35, rouge: 65 } },
    { entite: K("sensor", "humidity") }, _t("Orange sous 35 %, vert jusqu'à 65 %, rouge au-delà")),
  PW("air", _t("Température"), "mdi:thermometer", _t("Valeur + courbe 24 h"), "temperature thermometre temperature sonde",
    { type: "tuile", unite: "°C", decimales: 1, historique: 24 }, { entite: K("sensor", "temperature"), lignes: { rangs: [{ k: K("sensor", "humidity") }] } }),
  PW("air", _t("Qualité de l'air"), "mdi:leaf", _t("Indice + courbe"), "qualite air indice aqi iaq air quality index",
    { type: "tuile", decimales: 0, historique: 24 }, { entite: [K("sensor", "aqi"), K("sensor", null, null, "aqi|iaq|qualite")] }),
  PW("air", _t("Radon"), "mdi:radioactive", _t("Jauge en Bq/m³"), "radon radioactivite becquerel bq",
    { type: "jauge", min: 0, max: 400, unite: "Bq/m³", decimales: 0, seuils: { vert: 0, jaune: 100, rouge: 300 } },
    { entite: K("sensor", null, null, "radon") }, _t("Orange dès 100 Bq/m³, rouge dès 300 (niveau de référence)")),
  // ---- lumière ----
  PW("lumiere", _t("Luminosité"), "mdi:brightness-5", _t("Jauge 0 à 1000 lx"), "luminosite lux lumiere eclairement illuminance light level",
    { type: "jauge", min: 0, max: 1000, unite: "lx", decimales: 0, couleur: "#f6c445" }, { entite: K("sensor", "illuminance") }),
  PW("lumiere", _t("Lumières"), "mdi:lightbulb-group", _t("Interrupteurs des lampes"), "lumieres lampes groupe eclairage lights group",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("light") } }),
  PW("lumiere", _t("Scènes"), "mdi:palette-outline", _t("Un appui pour activer"), "scenes ambiance scene activer scripts",
    { type: "entites", entites: [] }, { entites: { n: 5, k: K("scene") } }),
  // ---- sécurité ----
  PW("securite", _t("Serrure"), "mdi:lock", _t("Verrouiller, déverrouiller"), "serrure verrou porte cle lock door",
    { type: "serrure" }, { entite: K("lock") }, _t("Déverrouiller et ouvrir demandent confirmation")),
  PW("securite", _t("Alarme"), "mdi:shield-home", _t("État de l'alarme"), "alarme centrale securite alarm panel armed",
    { type: "tuile", historique: 0 }, { entite: K("alarm_control_panel") }),
  PW("securite", _t("Détecteurs de fumée"), "mdi:smoke-detector-variant", _t("Rouge si fumée"), "fumee incendie feu detecteur smoke fire",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("binary_sensor", "smoke") } }),
  PW("securite", _t("Monoxyde de carbone"), "mdi:molecule-co", _t("Rouge si détecté"), "monoxyde carbone co detecteur carbon monoxide",
    { type: "entites", entites: [] }, { entites: { n: 4, k: [K("binary_sensor", "carbon_monoxide"), K("sensor", "carbon_monoxide")] } }),
  PW("securite", _t("Détecteurs de gaz"), "mdi:gas-burner", _t("Rouge si fuite"), "gaz fuite detecteur gas leak",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K("binary_sensor", "gas") } }),
  PW("securite", _t("Mouvements"), "mdi:motion-sensor", _t("Détecteurs de présence"), "mouvement presence pir occupation motion occupancy",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("binary_sensor", ["motion", "occupancy", "presence"]) } }),
  PW("securite", _t("Caméras"), "mdi:cctv", _t("Appui : image en direct"), "cameras video surveillance camera cctv",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K("camera") } }),
  PW("securite", _t("Sonnette"), "mdi:doorbell-video", _t("Dernier appui"), "sonnette carillon interphone doorbell ring",
    { type: "tuile", historique: 0 }, { entite: [K("event", "doorbell"), K(["binary_sensor", "sensor", "event"], null, null, "sonnette|doorbell|carillon")] }),
  // ---- eau ----
  PW("eau", _t("Fuites d'eau"), "mdi:water-alert", _t("Rouge si fuite"), "fuite eau inondation detecteur water leak flood moisture",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("binary_sensor", "moisture") } }),
  PW("eau", _t("Vanne d'arrêt"), "mdi:valve", _t("Ouvrir, fermer"), "vanne arret eau coupure robinet water valve shutoff",
    { type: "commande" }, { entite: K("valve") }, _t("Vanne motorisée (valve) : confirmation par défaut")),
  PW("eau", _t("Consommation d'eau"), "mdi:water-pump", _t("Jour, semaine, mois"), "eau compteur consommation litres m3 water meter usage",
    { type: "periodes", colonnes: [{ nom: _t("Eau"), unite: "m³", decimales: 2, source: "stat" }] }, { "colonnes.0.stat": K("sensor", "water") }),
  PW("eau", _t("Pression d'eau"), "mdi:gauge", _t("Jauge 0 à 6 bar"), "pression eau reseau bar water pressure",
    { type: "jauge", min: 0, max: 6, unite: "bar", decimales: 1, seuils: { rouge: 0, vert: 1.5, jaune: 4 } },
    { entite: [K("sensor", "pressure", "bar"), K("sensor", "pressure", null, "eau|water")] }),
  PW("eau", _t("Adoucisseur"), "mdi:shaker-outline", _t("Sel, régénération"), "adoucisseur sel regeneration calcaire water softener salt",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K(["sensor", "binary_sensor"], null, null, "adoucisseur|softener") } }),
  // ---- énergie ----
  PW("energie", _t("Production solaire"), "mdi:solar-power-variant", _t("Puissance + courbe"), "solaire panneaux photovoltaique production pv onduleur solar inverter",
    { type: "tuile", unite: "W", decimales: 0, historique: 24 },
    { entite: K("sensor", "power", null, "solaire|solar|pv|photovolt|onduleur|inverter|production"), lignes: { rangs: [{ k: K("sensor", "energy", null, "solaire|solar|pv|photovolt|production") }] } }),
  PW("energie", _t("Batterie domestique"), "mdi:home-battery-outline", _t("Charge 0 à 100 %"), "batterie domestique stockage maison home battery storage powerwall",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { rouge: 0, jaune: 20, vert: 50 } },
    { entite: K("sensor", "battery", null, "domestique|home battery|maison|powerwall|stockage|storage|ess"), lignes: { rangs: [{ k: K("sensor", "power", null, "batterie|battery|stockage|storage") }] } }),
  PW("energie", _t("Puissance instantanée"), "mdi:flash", _t("Watts + courbe 24 h"), "puissance instantanee consommation watts power usage",
    { type: "tuile", unite: "W", decimales: 0, historique: 24 }, { entite: [K("sensor", "power", null, "maison|home|total|linky|reseau|grid|compteur"), K("sensor", "power")] }),
  PW("energie", _t("Conso et coût"), "mdi:home-lightning-bolt-outline", _t("Jour, semaine, mois"), "consommation cout euros kwh mois semaine energy cost monthly",
    { type: "periodes", colonnes: [{ nom: _t("Énergie"), unite: "kWh", decimales: 1, source: "stat" }, { nom: _t("Coût"), unite: "€", decimales: 2, source: "stat" }] },
    { "colonnes.0.stat": K("sensor", "energy", ["kWh", "Wh"], null, "jour|today|daily"), "colonnes.1.stat": K("sensor", "monetary", null, null, "kwh|prix|price|tarif") }),
  PW("energie", _t("Prix de l'électricité"), "mdi:currency-eur", _t("Prix du kWh en cours"), "prix electricite tarif kwh euro price electricity",
    { type: "tuile", decimales: 4, historique: 24 }, { entite: [K("sensor", null, ["€/kWh", "EUR/kWh", "€/MWh", "EUR/MWh"]), K("sensor", null, null, "prix|price|tarif")] }),
  PW("energie", _t("Compteur gaz"), "mdi:meter-gas", _t("m³ par période"), "gaz compteur consommation m3 gas meter",
    { type: "periodes", colonnes: [{ nom: _t("Gaz"), unite: "m³", decimales: 2, source: "stat" }] }, { "colonnes.0.stat": K("sensor", "gas") }),
  // ---- ouvertures ----
  PW("ouvertures", _t("Volet"), "mdi:window-shutter", _t("Ouvrir, Stop, Fermer"), "volet roulant store rideau shutter blind",
    { type: "commande" }, { entite: K("cover", ["shutter", "blind", "shade", "curtain", "awning", "window"]) }),
  PW("ouvertures", _t("Portail"), "mdi:gate", _t("Confirmation par défaut"), "portail coulissant battant gate",
    { type: "commande" }, { entite: [K("cover", "gate"), K("cover", null, null, "portail|gate")] }),
  PW("ouvertures", _t("Porte de garage"), "mdi:garage-variant", _t("Confirmation par défaut"), "garage porte basculante sectionnelle garage door",
    { type: "commande" }, { entite: [K("cover", "garage"), K("cover", null, null, "garage")] }),
  PW("ouvertures", _t("Fenêtres et portes"), "mdi:window-open-variant", _t("Contacts d'ouverture"), "fenetres portes ouvertes contacts capteurs ouverture windows doors open",
    { type: "entites", entites: [] }, { entites: { n: 8, k: K("binary_sensor", ["window", "door", "opening", "garage_door"]) } }),
  // ---- chauffage et clim ----
  PW("chauffage", _t("Pompe à chaleur / clim"), "mdi:heat-pump-outline", _t("Consigne −/+"), "pompe chaleur pac clim climatisation split heat pump air conditioner",
    { type: "thermostat" }, { entite: [K("climate", null, null, "pac|pompe|heat pump|clim|split|ac|air"), K("climate")] }),
  PW("chauffage", _t("Chaudière"), "mdi:water-boiler", _t("Température de départ"), "chaudiere depart eau chaude boiler flow temperature",
    { type: "tuile", unite: "°C", decimales: 1, historique: 24 }, { entite: K("sensor", "temperature", null, "chaudiere|boiler|depart|flow") }),
  PW("chauffage", _t("Chauffe-eau"), "mdi:water-thermometer", _t("Température du ballon"), "chauffe eau ballon cumulus eau chaude water heater tank",
    { type: "tuile", unite: "°C", decimales: 0, historique: 24 }, { entite: [K("water_heater"), K("sensor", "temperature", null, "ballon|chauffe eau|cumulus|water heater|tank")] }),
  PW("chauffage", _t("VMC / ventilation"), "mdi:fan", _t("Marche, vitesse"), "vmc ventilation extracteur ventilateur fan",
    { type: "entites", entites: [] }, { entites: { n: 3, k: [K("fan"), K(["switch", "sensor"], null, null, "vmc|ventilation")] } }),
  PW("chauffage", _t("Purificateur d'air"), "mdi:air-purifier", _t("Marche + qualité"), "purificateur air filtre purifier",
    { type: "entites", entites: [] }, { entites: { rangs: [{ k: K("fan", null, null, "purif") }, { k: K("sensor", "pm25") }] } }),
  PW("chauffage", _t("Déshumidificateur"), "mdi:air-humidifier", _t("Marche + humidité"), "deshumidificateur humidificateur humidite dehumidifier humidifier",
    { type: "entites", entites: [] }, { entites: { rangs: [{ k: K("humidifier") }, { k: K("sensor", "humidity") }] } }),
  // ---- électroménager ----
  PW("menager", _t("Lave-linge"), "mdi:washing-machine", _t("État, temps restant"), "lave linge machine laver lessive washing machine washer",
    { type: "entites", entites: [] }, { entites: { n: 3, k: K(["sensor", "binary_sensor", "switch"], null, null, "lave linge|washing|washer|lessive") } }),
  PW("menager", _t("Sèche-linge"), "mdi:tumble-dryer", _t("État, temps restant"), "seche linge sechage dryer",
    { type: "entites", entites: [] }, { entites: { n: 3, k: K(["sensor", "binary_sensor", "switch"], null, null, "seche linge|dryer|sechage") } }),
  PW("menager", _t("Lave-vaisselle"), "mdi:dishwasher", _t("État, temps restant"), "lave vaisselle dishwasher",
    { type: "entites", entites: [] }, { entites: { n: 3, k: K(["sensor", "binary_sensor", "switch"], null, null, "lave vaisselle|dishwasher") } }),
  PW("menager", _t("Aspirateur robot"), "mdi:robot-vacuum", _t("État, batterie"), "aspirateur robot menage vacuum roomba roborock",
    { type: "tuile", historique: 0 }, { entite: K("vacuum"), lignes: { rangs: [{ k: K("sensor", "battery", null, "aspirateur|vacuum|robot|roomba|roborock") }] } }),
  PW("menager", _t("Imprimante 3D"), "mdi:printer-3d", _t("Progression 0 à 100 %"), "imprimante 3d impression octoprint bambu prusa 3d printer",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, couleur: "#1a73e8" },
    { entite: K("sensor", null, "%", "(octoprint|bambu|prusa|printer|imprimante|3d).*(progress|job|avancement)|(progress|progression).*(print|impression)"),
      lignes: { rangs: [{ k: K("sensor", null, null, "(octoprint|bambu|prusa|printer|imprimante).*(remaining|restant|time left)") }, { k: K("sensor", "temperature", null, "nozzle|buse|hotend|tool") }] } }),
  PW("menager", _t("Frigo et congélateur"), "mdi:fridge-outline", _t("Températures"), "frigo refrigerateur congelateur fridge freezer",
    { type: "entites", entites: [] }, { entites: { n: 3, k: K("sensor", "temperature", null, "frigo|fridge|refrigerat|congel|freezer") } }),
  // ---- multimédia ----
  PW("multimedia", _t("Télévision"), "mdi:television", _t("État en direct"), "tv television televiseur ecran",
    { type: "tuile", historique: 0 }, { entite: [K("media_player", "tv"), K("media_player", null, null, "tv|tele")] }),
  PW("multimedia", _t("Enceintes"), "mdi:speaker", _t("Lecture en cours"), "enceintes musique son haut parleur speaker music sonos",
    { type: "entites", entites: [] }, { entites: { n: 4, k: [K("media_player", "speaker"), K("media_player", null, null, null, "tv|tele")] } }),
  // ---- extérieur et jardin ----
  PW("exterieur", _t("Météo"), "mdi:weather-partly-cloudy", _t("Ciel + température"), "meteo temps previsions ciel weather forecast",
    { type: "tuile", historique: 0 }, { entite: K("weather"), lignes: { rangs: [{ k: K("sensor", "temperature", null, "exterieur|dehors|outdoor|outside|jardin") }] } }),
  PW("exterieur", _t("Pluie"), "mdi:weather-rainy", _t("Pluie + courbe"), "pluie precipitations pluviometre mm rain rainfall",
    { type: "tuile", decimales: 1, historique: 24 }, { entite: [K("sensor", ["precipitation", "precipitation_intensity"]), K("sensor", null, ["mm", "mm/h"], "pluie|rain")] }),
  PW("exterieur", _t("Vent"), "mdi:weather-windy", _t("Vitesse + courbe"), "vent rafales anemometre wind speed gust",
    { type: "tuile", decimales: 0, historique: 24 }, { entite: K("sensor", "wind_speed"), lignes: { rangs: [{ k: K("sensor", null, null, "rafale|gust") }] } }),
  PW("exterieur", _t("Indice UV"), "mdi:weather-sunny-alert", _t("Jauge 0 à 11"), "uv ultraviolet soleil indice uv index sun",
    { type: "jauge", min: 0, max: 11, decimales: 0, seuils: { vert: 0, jaune: 3, rouge: 6 } }, { entite: K("sensor", null, null, "\\buv\\b|ultraviolet") }),
  PW("exterieur", _t("Arrosage"), "mdi:sprinkler-variant", _t("Zones d'arrosage"), "arrosage irrigation jardin vanne sprinkler watering garden",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K(["switch", "valve"], null, null, "arros|irrigation|sprinkler|watering|jardin|garden") } }),
  PW("exterieur", _t("Humidité du sol"), "mdi:sprout-outline", _t("Jauge 0 à 100 %"), "humidite sol terre plante jardin soil moisture plant",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { rouge: 0, jaune: 20, vert: 35 } }, { entite: [K("sensor", "moisture"), K("sensor", null, "%", "sol|soil|plante|plant")] }),
  PW("exterieur", _t("Piscine"), "mdi:pool", _t("pH, chlore, température"), "piscine eau ph chlore redox orp temperature pool chlorine",
    { type: "entites", entites: [] }, { entites: { rangs: [{ k: [K("sensor", "ph"), K("sensor", null, null, "\\bph\\b")] }, { k: K("sensor", null, null, "chlor|redox|orp") }, { k: K("sensor", "temperature", null, "piscine|pool") }] } }),
  PW("exterieur", _t("pH de la piscine"), "mdi:ph", _t("Jauge 6,8 à 8"), "ph piscine acidite pool ph",
    { type: "jauge", min: 6.8, max: 8, decimales: 1, seuils: { jaune: 0, vert: 7.2, rouge: 7.7 } }, { entite: [K("sensor", "ph"), K("sensor", null, null, "\\bph\\b")] }, _t("Vert entre 7,2 et 7,6")),
  // ---- réseau et serveur ----
  PW("reseau", _t("Débit internet"), "mdi:speedometer", _t("Descendant, montant, ping"), "debit internet speedtest fibre box download upload bandwidth",
    { type: "entites", entites: [] },
    { entites: { rangs: [{ k: K("sensor", "data_rate", null, "download|descendant|down") }, { k: K("sensor", "data_rate", null, "upload|montant|up") }, { k: K("sensor", null, "ms", "ping|latence|latency") }] } }),
  PW("reseau", _t("Processeur"), "mdi:cpu-64-bit", _t("Charge 0 à 100 %"), "processeur cpu charge serveur nas processor load server",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { vert: 0, jaune: 70, rouge: 90 } }, { entite: K("sensor", null, "%", "cpu|processeur|processor") }),
  PW("reseau", _t("Mémoire"), "mdi:memory", _t("Occupée 0 à 100 %"), "memoire ram serveur nas memory server",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { vert: 0, jaune: 80, rouge: 90 } }, { entite: K("sensor", null, "%", "memory|memoire|\\bram\\b") }),
  PW("reseau", _t("Disque"), "mdi:harddisk", _t("Occupé 0 à 100 %"), "disque stockage espace nas serveur disk storage usage",
    { type: "jauge", min: 0, max: 100, unite: "%", decimales: 0, seuils: { vert: 0, jaune: 80, rouge: 90 } }, { entite: K("sensor", null, "%", "disk|disque|storage|stockage|volume") }),
  PW("reseau", _t("Onduleur"), "mdi:power-plug-battery-outline", _t("Batterie, charge, autonomie"), "onduleur ups nut batterie secours",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K("sensor", null, null, "\\bups\\b|onduleur|\\bnut\\b") } }),
  // ---- présence ----
  PW("presence", _t("Personnes"), "mdi:account-group", _t("À la maison ou non"), "personnes presence famille people person home away",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("person") } }),
  PW("presence", _t("Téléphones"), "mdi:cellphone", _t("Où sont les appareils"), "telephones smartphones mobiles device tracker phones",
    { type: "entites", entites: [] }, { entites: { n: 6, k: K("device_tracker") } }),
  PW("presence", _t("Batteries des appareils"), "mdi:battery-alert-variant-outline", _t("Les plus faibles d'abord"), "batteries piles appareils capteurs faible low battery",
    { type: "entites", entites: [] }, { entites: { n: 8, k: K("sensor", BATT), tri: "bas" } }),
  // ---- véhicule ----
  PW("vehicule", _t("Voiture électrique"), "mdi:car-electric", _t("Batterie, charge, coût"), "voiture electrique ve batterie recharge ev car tesla zoe",
    { type: "ve" }, { batterie: K("sensor", "battery", null, "voiture|car|vehic|\\bev\\b|\\bve\\b|tesla|zoe|corsa|model|ioniq|leaf|kona|id[0-9]"),
      autonomie: K("sensor", "distance", null, "autonomie|range"), puissance: K("sensor", "power", null, "borne|charger|wallbox|charge|evse"),
      branche: K("binary_sensor", ["plug", "battery_charging"]) }),
  PW("vehicule", _t("Borne de recharge"), "mdi:ev-station", _t("Marche, puissance, énergie"), "borne recharge wallbox chargeur evse charger",
    { type: "entites", entites: [] }, { entites: { n: 4, k: K(["switch", "sensor", "binary_sensor"], null, null, "borne|wallbox|charger|evse|chargeur") } }),
];
// types proposés par « Créer un widget » (atelier) : les génériques, plus la serrure, dans l'ordre d'usage
const TYPES_ATELIER = () => {
  const g = Object.fromEntries(CATALOGUE.panneaux.map((m) => [m.objet.type, m]));
  g.serrure = { nom: _t("Serrure"), icone: "mdi:lock", desc: _t("Verrouiller, déverrouiller"), objet: { type: "serrure", titre: _t("Serrure") } };
  return ["tuile", "jauge", "entites", "commande", "serrure", "thermostat", "climat", "periodes", "tarif", "ve", "separateur"].filter((t) => g[t])
    .map((t) => ({ id: t, nom: g[t].nom, icone: g[t].icone, desc: g[t].desc, detail: g[t].detail, objet: g[t].objet }));
};
// champs entité d'un widget (hors listes et colonnes) et leur nom dans les dialogues de choix
const CHAMPS_ENTITE_WIDGET = { entite: 1, prix: 1, periode: 1, couleur_jour: 1, couleur_demain: 1, batterie: 1, autonomie: 1, puissance: 1, branche: 1, session_kwh: 1, session_cout: 1 };
const NOMS_CHAMPS_AUTO = { batterie: _tk("Batterie"), autonomie: _tk("Autonomie"), puissance: _tk("Puissance de charge"), branche: _tk("Câble branché"), "colonnes.stat": _tk("Compteur") };
const idModele = () => Math.random().toString(36).slice(2, 10);
// ---------- ouvertures : capteurs cherchés dans la pièce (pré-remplissage à la pose, suggestions) ----------
// contact : binary_sensor porte / fenêtre / ouverture / garage ; volet : cover de type volet, store… ; entite : cover motorisée (garage, portail, porte)
const CRIT_OUV = { contact: K("binary_sensor", ["door", "window", "opening", "garage_door"]), volet: K("cover", ["shutter", "blind", "shade", "curtain", "awning", "window"]),
  entite: K("cover", ["garage", "gate", "door"]) };
// classe d'appareil du contact préférée selon le type, et type proposé d'après la classe du contact
const DC_TYPE_OUV = { fenetre: ["window"], porte: ["door"], portail: ["garage_door", "opening", "gate", "garage"] };
const TYPE_DC_OUV = { window: "fenetre", door: "porte", garage_door: "portail", gate: "portail", garage: "portail" };
const NOMS_TYPE_OUV = { fenetre: _tk("Fenêtre"), porte: _tk("Porte"), portail: _tk("Portail") };
const OUVRANTS_ED = [["", _tk("Aucun##ouvrant")], ["gauche", _tk("Gauche")], ["droite", _tk("Droite")], ["coulissant", _tk("Coulissant")]];
// ---------- meubles personnalisés : primitives proposées par « Créer un meuble » (coordonnées en % de la taille) ----------
const PRIMITIVES = { rect: _tk("Rectangle"), arrondi: _tk("Arrondi##forme"), ellipse: _tk("Rond##forme"), trait: _tk("Trait"), polygone: _tk("Polygone") };
const STYLES_PRIM = [["plein", _tk("Plein")], ["vide", _tk("Contour")], ["tirets", _tk("Tirets")]];
const PRIM_DEFAUT = { rect: { genre: "rect", x: 0, y: 0, l: 100, h: 100 }, arrondi: { genre: "arrondi", x: 0, y: 0, l: 100, h: 100, rayon: 10 }, ellipse: { genre: "ellipse", x: 0, y: 0, l: 100, h: 100 },
  trait: { genre: "trait", points: [[10, 50], [90, 50]] }, polygone: { genre: "polygone", points: [[0, 0], [100, 0], [100, 40], [40, 40], [40, 100], [0, 100]] } };
// formes de départ de « Créer un meuble » (en plus des meubles du catalogue)
const FORMES_DEPART = () => [
  { id: "f:rect", nom: _t("Rectangle"), taille: [100, 60], forme: [PRIM_DEFAUT.rect] },
  { id: "f:arrondi", nom: _t("Rectangle arrondi"), taille: [100, 60], forme: [PRIM_DEFAUT.arrondi] },
  { id: "f:ellipse", nom: _t("Rond / ellipse"), taille: [80, 80], forme: [PRIM_DEFAUT.ellipse] },
  { id: "f:L", nom: _t("Forme en L"), taille: [200, 200], forme: [PRIM_DEFAUT.polygone] },
];
// domaines à interrupteur marche / arrêt (comme la carte : fiche, vue de la pièce)
const BASCULES_ED = ["light", "switch", "fan", "input_boolean", "humidifier"];
const MAX_TAILLE_MEUBLE = 5000; // mêmes bornes que la carte (5 à 5000 cm)
const PUCES = [["ouvertures", "mdi:window-open-variant", _tk("Ouvertures"), _tk("Fenêtres et portes ouvertes (rouge s'il y en a)")],
  ["lumieres", "mdi:lightbulb-on", _tk("Lumières allumées"), _tk("Lumières du plan allumées")], ["volets", "mdi:window-shutter", _tk("Volets baissés"), _tk("Volets du plan sous 50 %")],
  ["temperature", "mdi:home-thermometer-outline", _tk("Température intérieure"), _tk("Moyenne des pièces intérieures")],
  ["entite", "mdi:information-outline", _tk("Valeur d'une entité"), _tk("N'importe quelle entité, avec alerte ou masquage selon son état")]];
// ---------- réglages des personnes, bulles, interaction, tablette (sections de la modale ⚙ Paramètres) ----------
// section : { id, titre: clé i18n, icone?, onglet?, champs: [{ chemin: "chemin.interne", type: "choix"…, nom: clé i18n, options: [[valeur, clé i18n]…],
//   defaut, aide: clé i18n, si(d) : champ proposé seulement si vrai, ecrire(d, v) : écriture particulière }] }
// La valeur par défaut est celle d'origine : la choisir retire la clé (le YAML reste minimal).
// Personnes et bulles d'appareils. Les réglages communs des personnes ne valent que si les personnes sont sur le plan
// (ambiance.personnes) ; `personnes: true` ou une liste d'entités deviennent un objet ({ entites }) à la première écriture.
const avecPersonnes = (d) => !!d.ambiance?.personnes;
const ecrirePersonnes = (k, defaut) => (d, v) => {
  const pe = d.ambiance?.personnes;
  if (!pe) return;
  const o = pe && typeof pe === "object" && !Array.isArray(pe) ? pe : Array.isArray(pe) ? { entites: pe } : {};
  if (v === "" || v == null || v === defaut) delete o[k]; else o[k] = v;
  d.ambiance.personnes = o;
};
const choixPersonne = (k, defaut, options, nom, aide) => ({ chemin: `ambiance.personnes.${k}`, type: "choix", nom, options, defaut, aide, si: avecPersonnes, ecrire: ecrirePersonnes(k, defaut) });
const PARAMS_PERSONNES_BULLES = [
  { id: "personnes", titre: _tk("Personnes sur le plan"), icone: "mdi:account-multiple-outline", champs: [
    choixPersonne("dehors", "direction", [["direction", _tk("Au bord")], ["zone", _tk("En bas")], ["cache", _tk("Masquées")]],
      _tk("Personnes absentes"), _tk("Au bord : dans leur direction, avec la distance. En bas : en bas du plan, avec leur zone. Chaque personne peut avoir son propre réglage (panneau Ambiance).")),
    choixPersonne("chez_soi", "groupe", [["groupe", _tk("Regroupées")], ["cache", _tk("Masquées")]], _tk("Personnes à la maison"), _tk("Regroupées au point de la maison.")),
    choixPersonne("avatar", "photo", [["photo", _tk("Photo")], ["initiales", _tk("Initiales")]], _tk("Avatar"), _tk("Photo du profil, sinon initiales.")),
  ] },
  { id: "bulles", titre: _tk("Pastilles d'appareils"), icone: "mdi:circle-multiple-outline", champs: [
    { chemin: "style_pastilles.indisponible", type: "choix", nom: _tk("Appareil indisponible"), defaut: "estompe",
      options: [["estompe", _tk("Estompée")], ["tirets", _tk("En pointillé")], ["cache", _tk("Masquée")]],
      aide: _tk("Une pastille masquée reste dans la vue de la pièce et dans les listes.") },
    { chemin: "style_pastilles.inactif", type: "choix", nom: _tk("Appareil inactif"), defaut: "visible",
      options: [["visible", _tk("Visible")], ["actif_seul", _tk("Masquée")], ["estompe", _tk("Estompée")]],
      aide: _tk("Masquée : la pastille n'apparaît que quand l'appareil est actif.") },
    { chemin: "style_pastilles.taille", type: "choix", nom: _tk("Taille des pastilles"), defaut: "normal",
      options: [["petit", _tk("Petite")], ["normal", _tk("Normale")], ["grand", _tk("Grande")]] },
    { chemin: "style_pastilles.valeurs", type: "choix", nom: _tk("Valeurs dans les pastilles"), defaut: "toujours",
      options: [["toujours", _tk("Toujours")], ["survol", _tk("Au survol")], ["jamais", _tk("Jamais")]],
      aide: _tk("Au survol : toujours affichées sur écran tactile.") },
  ] },
];
// interaction au toucher, tablette murale, niveau d'animation (`interaction`, `tablet`, `animation_level`)
const tabletteObj = (d) => (d.tablette && typeof d.tablette === "object" && !Array.isArray(d.tablette) ? d.tablette : null);
// réglage du mode tablette : `tablet: true` devient un objet pour le porter, et redevient `true` sans réglage
const ecrireTablette = (k, defaut) => (d, v) => {
  const o = { ...(tabletteObj(d) || {}) };
  if (v === defaut || v == null) delete o[k]; else o[k] = v;
  d.tablette = Object.keys(o).length ? o : true;
};
const PARAMS_INTERACTION = [
  { id: "interaction", titre: _tk("Interaction"), icone: "mdi:gesture-tap", champs: [
    { chemin: "interaction.clic_piece", type: "choix", nom: _tk("Toucher une pièce"), defaut: "vue",
      options: [["vue", _tk("Vue de la pièce")], ["infos", _tk("Plus d'infos")], ["aucun", _tk("Rien")]],
      aide: _tk("« Plus d'infos » ouvre l'entité de l'étiquette (sinon la température).") },
    { chemin: "interaction.vue_figee", type: "bool", nom: _tk("Vue figée"), defaut: false,
      aide: _tk("Plus de déplacement ni de zoom (boutons compris) ; le toucher des éléments marche toujours.") },
    { chemin: "interaction.retour_apres", type: "nombre", nom: _tk("Retour au plan entier après"), defaut: 0, min: 0, max: 86400, pas: 10, unite: "s",
      aide: _tk("Sans action pendant ce temps : vue de la pièce, zoom et fiches fermés. 0 = jamais.") },
  ] },
  { id: "tablette", titre: _tk("Tablette murale"), onglet: "interaction", champs: [
    { chemin: "tablette", type: "bool", nom: _tk("Mode tablette"), defaut: false,
      aide: _tk("Pleine page, sans titre ni en-tête."),
      ecrire: (d, v) => { if (!v) delete d.tablette; else if (!tabletteObj(d)) d.tablette = true; } },
    { chemin: "tablette.resume", type: "bool", nom: _tk("Puces de résumé"), defaut: false, si: (d) => !!d.tablette, ecrire: ecrireTablette("resume", false) },
    { chemin: "tablette.panneaux", type: "bool", nom: _tk("Panneaux latéraux"), defaut: false, si: (d) => !!d.tablette, ecrire: ecrireTablette("panneaux", false) },
    { chemin: "tablette.anti_marquage", type: "bool", nom: _tk("Anti-marquage de l'écran"), defaut: true, si: (d) => !!d.tablette, ecrire: ecrireTablette("anti_marquage", true),
      aide: _tk("Évite de marquer l'écran : le plan se décale d'un pixel toutes les 3 minutes (2 px au plus).") },
  ] },
  { id: "animations", titre: _tk("Animations"), onglet: "interaction", champs: [
    { chemin: "niveau_animation", type: "choix", nom: _tk("Niveau d'animation"), defaut: "complet",
      options: [["complet", _tk("Complet")], ["reduit", _tk("Réduit")], ["aucun", _tk("Aucune")]],
      aide: _tk("Réduit : rien ne bouge en boucle (pulsations, ondes, météo, flux), transitions courtes. Aucune : rien ne bouge.") },
  ] },
];
// ---------- modale ⚙ Paramètres : réglages globaux de la carte (fonctionnement plutôt que dessin) ----------
// Liste déclarative, rendue et écrite par EditeurPlan._rendreParametres. Section : { id, titre: clé i18n, icone?: icône de l'onglet,
//   onglet?: id de la section qui ouvre l'onglet où elle s'ajoute (sous-titre = son titre ; sinon elle a son propre onglet), aide?: clé i18n, champs: [champ] }.
// Champ : { chemin: "chemin.interne" (config interne, clés françaises), type, libelle (ou nom): clé i18n, aide?: clé i18n, defaut, si?(d),
//   lire?(d) : lecture personnalisée, ecrire?(d, v) : écriture personnalisée (à la place de la règle « défaut = clé retirée ») }
//   bool : interrupteur MD3 ; confirmer? { quand(v), titre, texte, bouton } : confirmation dans la modale avant d'écrire
//   choix : options [[valeur, clé i18n | texte, brut?]] (brut : affiché tel quel) ; boutons segmentés jusqu'à 4 options, sinon menu
//   nombre : min, max, pas, unite ; valider?(d, v) : clé i18n du refus, ou null ; demi : deux champs consécutifs côte à côte
//   texte : placeholder (clé i18n) · entite : domaine? · intertitre : libellé seul
//   action : id, icone, desc (clé i18n, ou (d, ed) → clé), action(ed) : la modale se ferme, puis l'action ouvre son panneau ou son dialogue
//   parentVide : l'objet parent vidé redevient `true` (ex. `replay: { heures }` → `replay: true`)
// Écriture : une valeur par défaut (ou vide) RETIRE la clé et les objets parents devenus vides : la config reste minimale.
// Valeurs par défaut : celles de la carte (MaquetteCard.REGLAGES), vérifiées par les tests.
// (les sections des autres réglages, PARAMS_PERSONNES_BULLES et PARAMS_INTERACTION, se déclarent ici, juste avant la liste)
const SECTIONS_PARAMETRES = [
  { id: "general", titre: _tk("Général"), icone: "mdi:tune-variant", champs: [
    { chemin: "titre", type: "texte", libelle: _tk("Titre"), defaut: "", placeholder: _tk("Sans titre") },
    { chemin: "langue", type: "choix", libelle: _tk("Langue de la carte"), defaut: "",
      options: [["", _tk("Automatique")], ["en", "English", true], ["fr", "Français", true]] },
    { chemin: "plein_ecran", type: "bool", libelle: _tk("Pleine hauteur sur grand écran"), aide: _tk("La carte occupe la hauteur de l'écran et le plan tient sans défilement."), defaut: true },
    { chemin: "marge", type: "nombre", libelle: _tk("Marge autour du plan"), defaut: 40, min: 0, max: 2000, pas: 10, unite: "cm" },
    { chemin: "edition", type: "bool", libelle: _tk("Bouton d'édition (crayon)"), aide: _tk("Visible des administrateurs seulement."), defaut: true,
      confirmer: { quand: (v) => v === false, titre: _tk("Masquer le bouton d'édition ?"), bouton: _tk("Masquer le bouton"),
        texte: _tk("Sans ce bouton, l'éditeur ne s'ouvre plus depuis la carte. Pour le retrouver : dans Home Assistant, modifier le dashboard, ouvrir la carte dans l'éditeur de code (YAML) et retirer la ligne « editor: false ».") } },
  ] },
  { id: "affichage", titre: _tk("Affichage"), icone: "mdi:eye-outline", champs: [
    { chemin: "afficher_meubles", type: "choix", libelle: _tk("Meubles affichés"), aide: _tk("Grand écran : carte d'au moins 760 px de large."), defaut: true,
      options: [[true, _tk("Toujours")], ["pc", _tk("Grand écran")], [false, _tk("Jamais")]] },
    { chemin: "calques.bouton_vue", type: "bool", libelle: _tk("Bouton Calques pour les visiteurs"), aide: _tk("Chacun masque ce qu'il veut, sur son navigateur."), defaut: false },
  ] },
  { id: "fonctions", titre: _tk("Fonctions"), icone: "mdi:puzzle-outline", champs: [
    { chemin: "replay", type: "bool", libelle: _tk("Revoir la journée"), aide: _tk("Bouton à côté du zoom : la journée rejouée en accéléré."), defaut: false },
    { chemin: "replay.heures", type: "nombre", libelle: _tk("Période revue"), defaut: 24, min: 1, max: 72, pas: 1, unite: "h", parentVide: true, si: (d) => !!d.replay },
    { chemin: "replay.vitesse", type: "choix", libelle: _tk("Vitesse au départ"), aide: _tk("×60 : une minute par seconde ; ×3600 : une heure par seconde."), defaut: 900, parentVide: true, si: (d) => !!d.replay,
      options: [[60, "×60", true], [300, "×300", true], [900, "×900", true], [3600, "×3600", true]] },
    { chemin: "vitrine", type: "bool", libelle: _tk("Exemples sous le plan"), aide: _tk("Animations, météo et ambiance en démonstration."), defaut: false },
    { chemin: "presence", type: "entite", libelle: _tk("Présence par défaut"), defaut: "zone.home",
      aide: _tk("Zone, personne ou groupe. Sert aux puces absent / présent et aux alertes « personne à la maison » ; chacune peut avoir la sienne.") },
  ] },
  { id: "pieces", titre: _tk("Pièces et légende"), icone: "mdi:floor-plan", champs: [
    { type: "intertitre", libelle: _tk("Sur les étiquettes des pièces") },
    { chemin: "etiquettes_pieces.nom", type: "bool", libelle: _tk("Nom de la pièce"), defaut: true },
    { chemin: "etiquettes_pieces.temperature", type: "bool", libelle: _tk("Température"), defaut: true },
    { chemin: "etiquettes_pieces.humidite", type: "bool", libelle: _tk("Humidité"), defaut: true },
    { type: "intertitre", libelle: _tk("Couleur des pièces") },
    { chemin: "teinte_temperature", type: "bool", libelle: _tk("Teinte selon la température"), defaut: true },
    { chemin: "teinte_temperature.min", type: "nombre", libelle: _tk("Bleu à"), defaut: 17, min: -30, max: 60, pas: 0.5, unite: "°C", demi: true, si: (d) => d.teinte_temperature !== false,
      valider: (d, v) => (v >= (estNombre(d.teinte_temperature?.max) ? +d.teinte_temperature.max : 28) ? _tk("Le bleu doit être sous le rouge.") : null) },
    { chemin: "teinte_temperature.max", type: "nombre", libelle: _tk("Rouge à"), defaut: 28, min: -30, max: 60, pas: 0.5, unite: "°C", demi: true, si: (d) => d.teinte_temperature !== false,
      valider: (d, v) => (v <= (estNombre(d.teinte_temperature?.min) ? +d.teinte_temperature.min : 17) ? _tk("Le bleu doit être sous le rouge.") : null) },
    { chemin: "legende", type: "bool", libelle: _tk("Légende sous le plan"), defaut: true },
  ] },
  ...PARAMS_PERSONNES_BULLES,
  ...PARAMS_INTERACTION,
  // accès aux réglages sans bouton dans la barre (les autres panneaux ont le leur : pas de doublon)
  { id: "ailleurs", titre: _tk("Réglés ailleurs"), onglet: "fonctions", champs: [
    { id: "alertes", type: "action", icone: "mdi:alarm-light-outline", libelle: _tk("Alertes plein plan"), desc: _tk("Panneau Ambiance"), action: (ed) => ed.panneauAmbiance(true, "alertes") },
    { id: "puces", type: "action", icone: "mdi:format-list-bulleted", libelle: _tk("Puces du résumé"),
      desc: (d, ed) => (ed._puces().length ? _tk("Modifier la première puce") : _tk("Aucune puce : « + Puce » au-dessus du plan en ajoute une")),
      action: (ed) => (ed._puces().length ? ed.selectionner({ type: "puce", i: 0 }) : ed.snack(_t("Clique une puce du résumé (au-dessus du plan) pour la modifier, ou « + Puce » pour en ajouter une."))) },
  ] },
];
const estNombre = (v) => (typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v));
// lecture et écriture d'un réglage par son chemin ; valeur par défaut ou vide = clé retirée, objets parents vides retirés (ou `true`, parentVide)
const lireChemin = (o, chemin) => chemin.split(".").reduce((x, k) => (x && typeof x === "object" && !Array.isArray(x) ? x[k] : undefined), o);
const memeValeur = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const champReglage = (k) => SECTIONS_PARAMETRES.flatMap((S) => S.champs || []).find((f) => (f.chemin || f.id) === k);
const champDe = (c) => (typeof c === "string" ? champReglage(c) || { chemin: c } : c);
// valeur effective d'un réglage : lecture personnalisée, sinon la clé, sinon la valeur par défaut
const lireReglage = (d, f) => { if (f.lire) return f.lire(d); const v = lireChemin(d, f.chemin); return v === undefined ? f.defaut : v; };
function ecrireReglage(d, f, v) {
  const p = f.chemin.split("."), objets = [d];
  for (const k of p.slice(0, -1)) {
    const x = objets[objets.length - 1];
    if (!x[k] || typeof x[k] !== "object" || Array.isArray(x[k])) x[k] = {};
    objets.push(x[k]);
  }
  const fin = objets[objets.length - 1], k = p[p.length - 1];
  if (v === undefined || v === "" || memeValeur(v, f.defaut)) delete fin[k]; else fin[k] = v;
  for (let i = objets.length - 1; i > 0; i--) {
    if (Object.keys(objets[i]).length) break;
    if (f.parentVide && i === objets.length - 1) { objets[i - 1][p[i - 1]] = true; break; }
    delete objets[i - 1][p[i - 1]];
  }
}
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
const CLES_ENTITES = ["entite", "actif", "valeur", "contact", "volet", "prix", "periode", "couleur_jour", "couleur_demain", "batterie", "autonomie", "puissance", "branche",
  "session_kwh", "session_cout", "stat", "jour", "semaine", "mois", "annee", "temperature", "humidite", "clic"];
function sansEntites(o) {
  if (Array.isArray(o)) return o.map(sansEntites);
  if (!o || typeof o !== "object") return o;
  const r = {};
  for (const [k, v] of Object.entries(o)) if (!CLES_ENTITES.includes(k)) r[k] = sansEntites(v);
  return r;
}
// fiches : portées par un meuble connecté, une ouverture ou une pastille ; un widget de fiche porte { meuble | ouverture | point: i }
const GENRES_FICHE = { meuble: "meubles", ouverture: "ouvertures", point: "points" };
const porteur = (s) => { const g = s && Object.keys(GENRES_FICHE).find((k) => s[k] != null); return g ? { genre: g, i: s[g] } : null; };
// widget : « widget:<côté>:<i>[:<pièce>] », « widget:fiche:<i>:<meuble> » (fiche d'un meuble), « widget:fiche:<i>:<n>:ouverture | point »
const cle = (s) => { const pf = s.type === "widget" && s.cote === "fiche" ? porteur(s) : null;
  return s.type === "widget" ? `widget:${s.cote}:${s.i}${s.piece != null ? `:${s.piece}` : pf ? `:${pf.i}${pf.genre === "meuble" ? "" : `:${pf.genre}`}` : ""}` : `${s.type}:${s.i}`; };
const deCle = (k) => { const [type, a, b, c, g] = k.split(":"); return type === "widget" ? { type, cote: a, i: +b, ...(c != null ? (a === "fiche" ? { [Object.hasOwn(GENRES_FICHE, g ?? "") ? g : "meuble"]: +c } : { piece: +c }) : {}) } : { type, i: +a }; };
function entitesZone(hass, zone) {
  if (!zone) return [];
  const l = [];
  for (const [id, e] of Object.entries(hass.entities || {})) {
    if (e.hidden || e.entity_category || !hass.states[id]) continue;
    if ((e.area_id || hass.devices?.[e.device_id]?.area_id) === zone) l.push(id);
  }
  return l;
}
function distBord([x, y], poly) {
  let d = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length], dx = bx - ax, dy = by - ay;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    d = Math.min(d, Math.hypot(x - ax - k * dx, y - ay - k * dy));
  }
  return d;
}
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
  openings: (d.ouvertures || []).map((o) => ({ type: OUV_EN[o?.type] || o?.type, seg: o?.seg, name: o?.nom, shutter_only: !!o?.volet_seul })),
});
function depuisMoteur(d, c) {
  const meme = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  return { pieces: (d.pieces || []).map((p, i) => (meme(p?.poly, c.rooms[i]?.poly) ? p : { ...p, poly: c.rooms[i].poly })),
    ouvertures: (d.ouvertures || []).map((o, i) => (meme(o?.seg, c.openings[i]?.seg) ? o : { ...o, seg: c.openings[i].seg })), murs: c.walls || [] };
}
// options du dialogue (dans l'ordre d'affichage) : [clé du moteur, libellé, précision]
const OPTIONS_NET = [["aimanter", _tk("Aimanter murs et ouvertures aux pièces"), _tk("Trous et décalages jusqu'à 12 cm.")],
  ["couper", _tk("Couper les murs sous les ouvertures"), _tk("Un style courant, pas un défaut.")],
  ["bouts", _tk("Retirer les bouts de mur qui dépassent"), _tk("Moins de 35 cm dans une pièce.")],
  ["fusionner", _tk("Fusionner les murs alignés et les doublons"), _tk("Coupés à chaque angle, en double, ou épais en 2 traits.")],
  ["manquants", _tk("Ajouter les murs manquants"), _tk("Côté extérieur, d'après le contour des pièces.")],
  ["passages", _tk("Fermer les passages entre pièces"), _tk("Arêtes communes sans mur.")],
  ["sommets", _tk("Aimanter les sommets presque confondus"), _tk("Jusqu'à 6 cm : change la forme des pièces.")],
  ["arrondir", _tk("Arrondir à 5 cm"), _tk("Sommets, murs et ouvertures : plan relevé sur une image.")]];
const PAR_PIECE = new Set(["manquants", "passages"]);
const NOM_OUV_NET = { door: _tk("Porte"), window: _tk("Fenêtre"), gate: _tk("Portail") };
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
// JSON indépendant de l'ordre des clés (HA et setConfig ne gardent pas toujours le même ordre)
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
const arr = (n) => Math.round(n * 10) / 10;
// formes des meubles personnalisés : % de la taille au centième (1 cm reste 1 cm, même sur un grand meuble)
const pc = (n) => Math.round(n * 100) / 100;

function dansPoly([x, y], poly) {
  let dedans = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}
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

const CSS = `
.ed-barre{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;margin:0 0 12px;padding:8px;border-radius:16px;background:var(--md-surface-container-high);flex:none;min-width:0}
.ed-defile{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:8px;overflow-x:auto;scrollbar-width:none}
.ed-defile::-webkit-scrollbar{display:none}
.ed-defile>*{flex:none}
.ed-defile.deborde{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent)}
.ed-fin{flex:none;display:flex;align-items:center;gap:4px}
ha-card.ed-etroit .ed-fin .lib,ha-card.ed-etroit .ed-fin .ed-info{display:none}
ha-card.ed-etroit .ed-fin .ed-btn{padding:0 10px;min-width:44px;justify-content:center}
.ed-bulle{position:absolute;z-index:4;pointer-events:none;padding:4px 8px;border-radius:8px;background:var(--md-inverse-surface,#313033);color:var(--md-inverse-on-surface,#f4eff4);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 1px 3px #0005}
.ed-bulle[hidden]{display:none}
.ed-snack.erreur{background:var(--md-error);color:#fff}
svg .ed-rect{fill:color-mix(in srgb,var(--md-primary) 12%,transparent)}
.ed-terminer{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:5;box-shadow:0 2px 6px #0005}
.panneau-hote{display:flex;flex-direction:column;gap:8px}
.panneau-hote>*,.ed-panneau>*{flex-shrink:0}
/* panneau latéral : seulement quand il a un contenu (sélection, Calques, Ambiance) ; au repos, le plan prend toute la largeur.
   PC : feuille latérale détachée (MD3) à droite, posée au-dessus de la vue sans la réduire : rien ne bouge sous le pointeur à la
   sélection (2e clic sur un groupe ou une sous-zone au même endroit). Widget choisi (colonnes) : le panneau reprend sa place à côté
   de la vue réduite, pour que le widget modifié et les deux colonnes (glisser-déposer) restent visibles. */
.corps>.panneau-hote.vide{display:none}
ha-card:not(.ed-etroit) .corps{position:relative}
ha-card:not(.ed-etroit) .corps>.panneau-hote{position:absolute;top:0;right:0;width:360px;max-height:100%;z-index:6;border-radius:16px;
  box-shadow:0 4px 8px 3px #00000026,0 1px 3px #0000004d}
ha-card:not(.ed-etroit) .corps>.panneau-hote.reserve{position:static;box-shadow:none;border-radius:0}
/* poignée de la feuille du bas (téléphone seulement) */
.ed-replier{display:none;align-items:center;gap:4px;border:none;background:var(--md-surface-container);color:var(--md-on-surface-variant);cursor:pointer;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-replier ha-icon{--mdc-icon-size:18px}
ha-card.ed-etroit .panneau-hote.replie>.ed-panneau{display:none}
/* téléphone : feuille en bas de l'écran, barre d'outils collante */
ha-card.ed-etroit{overflow:visible}
ha-card.ed-etroit .ed-barre{position:sticky;top:0;z-index:7;box-shadow:0 2px 6px #0004}
ha-card.ed-etroit .corps>.panneau-hote{position:fixed;left:0;right:0;bottom:0;z-index:8;max-height:55vh;margin:0;gap:0;background:var(--md-surface-container);
  border-radius:28px 28px 0 0;box-shadow:0 -4px 16px #0006;overflow:auto;width:auto;max-width:none}
ha-card.ed-etroit .panneau-hote>.ed-replier{display:flex;position:sticky;top:0;align-self:stretch;justify-content:center;border-radius:28px 28px 0 0;height:40px;padding:0;z-index:1;background:inherit}
ha-card.ed-etroit .panneau-hote>.ed-replier::before{content:"";position:absolute;top:8px;width:32px;height:4px;border-radius:2px;background:var(--md-on-surface-variant);opacity:.4}
ha-card.ed-etroit .panneau-hote>.ed-replier ha-icon{transform:rotate(90deg);margin-top:10px}
ha-card.ed-etroit .panneau-hote>.ed-replier span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
ha-card.ed-etroit .panneau-hote>.ed-panneau{position:static;max-height:none;border-radius:0;padding-top:4px}
ha-card.ed-etroit .panneau-hote.replie{max-height:none}
ha-card.ed-etroit{padding-bottom:calc(55vh + 16px)}
ha-card.ed-etroit .ed-terminer{position:fixed;bottom:136px;z-index:9}
ha-card.ed-etroit .ed-snack{bottom:56px}
ha-card.ed-etroit .corps>.panneau-hote.replie~*,ha-card.ed-etroit:has(.panneau-hote.replie){padding-bottom:56px}
ha-card.ed-etroit:has(.panneau-hote.vide){padding-bottom:16px}
.ed-avance{border-top:1px solid var(--md-outline-variant);padding-top:8px;display:flex;flex-direction:column;gap:14px}
.ed-avance>summary{cursor:pointer;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);list-style:none;display:flex;align-items:center;gap:6px;min-height:32px}
.ed-avance>summary::before{content:"▸";transition:transform .2s}
.ed-avance[open]>summary::before{transform:rotate(90deg)}
.ed-avance:not([open]){gap:0}
.ed-avance.ed-elts{gap:4px;padding-top:4px}
.ed-champ.a-completer>label{color:#e8710a;font-weight:500}
.ed-champ.a-completer .ed-entite{border-color:#e8710a;box-shadow:0 0 0 1px #e8710a}
.ed-cat section[hidden],.ed-tuile[hidden]{display:none}
.ed-apercu{width:40px;height:40px;flex:none}
.ed-apercu .ed-sz{fill:color-mix(in srgb,var(--md-primary) 8%,transparent);stroke:var(--md-primary);stroke-width:1.6px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.ed-apercu .meuble *{fill:color-mix(in srgb,var(--md-on-surface) 6%,transparent);stroke:var(--md-on-surface-variant);stroke-width:1.4px;vector-effect:non-scaling-stroke}
.ed-apercu .meuble .ligne,.ed-apercu .meuble .vide{fill:none}
.ed-apercu .meuble .tirets{stroke-dasharray:4 3}
.ed-dialogue header .ed-recherche{margin-top:4px}
.ed-coche{display:flex;align-items:center;gap:16px;min-height:56px;padding:8px 12px;border-radius:12px;cursor:pointer}
.ed-coche:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ed-coche input{width:20px;height:20px;accent-color:var(--md-primary);flex:none}
.ed-coche ha-icon{color:var(--md-on-surface-variant);flex:none}
.ed-coche small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-snack.erreur button{color:#fff}
.ed-versions{display:flex;flex-direction:column;gap:4px}
.ed-versions-bloc{margin-bottom:12px;border-top:none;padding-top:0}
.ed-versions small{color:var(--md-on-surface-variant)}
.ed-versions button{display:flex;justify-content:space-between;gap:12px;border:1px solid var(--md-outline-variant);border-radius:12px;background:none;color:var(--md-on-surface);padding:8px 12px;cursor:pointer;font:inherit;text-align:left}
.ed-groupe{display:inline-flex;align-items:center;gap:2px}
.ed-sep{width:1px;height:28px;background:var(--md-outline-variant);margin:0 4px}
.ed-seg{display:inline-flex;border:1px solid var(--md-outline);border-radius:20px;overflow:hidden;height:40px}
.ed-seg button{border:none;border-right:1px solid var(--md-outline);background:none;color:var(--md-on-surface);min-width:44px;padding:0 10px;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-seg button:last-child{border-right:none}
.ed-seg button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-seg ha-icon{--mdc-icon-size:20px}
.ed-seg.petit{height:32px;border-radius:16px}
.ed-seg.petit button{min-width:36px;padding:0 8px;font-size:13px}
.ed-btn{height:40px;padding:0 24px 0 16px;border-radius:20px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px;white-space:nowrap}
.ed-btn ha-icon{--mdc-icon-size:18px}
.ed-btn.plein{background:var(--md-primary);color:var(--text-primary-color,#fff)}
.ed-btn.tonal{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-btn.contour{background:none;border:1px solid var(--md-outline);color:var(--md-primary)}
.ed-btn.texte{background:none;color:var(--md-primary);padding:0 12px}
.ed-btn.danger{background:none;border:1px solid var(--md-error);color:var(--md-error)}
.ed-btn:disabled,.ib:disabled{opacity:.38;cursor:default}
.ed-btn.plein:disabled{background:color-mix(in srgb,var(--md-on-surface) 12%,transparent);color:var(--md-on-surface)}
.ed-info{font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums;margin-left:auto;padding:0 8px}
.ed-panneau{background:var(--md-surface-container);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:14px;
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface);max-height:calc(100vh - 160px);overflow:auto;position:sticky;top:8px}
.ed-panneau h3 .ib{margin-left:auto;width:32px;height:32px}
.ed-panneau h3{margin:0;font:500 16px/24px var(--ha-font-family-body,Roboto,sans-serif);display:flex;align-items:center;gap:8px}
.ed-panneau h4{margin:4px 0 0;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-aide{color:var(--md-on-surface-variant);font-size:13px;line-height:19px}
.ed-aide kbd{font:500 11px/1 ui-monospace,monospace;border:1px solid var(--md-outline-variant);border-radius:4px;padding:2px 5px;background:var(--md-surface)}
.ed-champ{display:flex;flex-direction:column;gap:4px}
.ed-champ>label{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);letter-spacing:.4px}
.ed-champ input[type=text],.ed-champ input[type=number],.ed-champ select{height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:0 12px;
  background:var(--md-surface);color:var(--md-on-surface);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);min-width:0;width:100%;box-sizing:border-box}
.ed-champ input:focus,.ed-champ select:focus{outline:2px solid var(--md-primary);outline-offset:-1px;border-color:transparent}
.ed-ligne{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ed-ligne.trois{grid-template-columns:1fr 1fr 1fr}
.ed-entite{display:flex;align-items:center;gap:8px;min-height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:4px 4px 4px 12px;background:var(--md-surface);cursor:pointer;text-align:left;color:var(--md-on-surface);font:inherit;width:100%;box-sizing:border-box}
.ed-entite .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-entite small{display:block;color:var(--md-on-surface-variant);font-size:11px;overflow:hidden;text-overflow:ellipsis}
.ed-entite .vide{color:var(--md-on-surface-variant)}
.ed-entite .x{width:32px;height:32px}
.ed-icones{display:flex;flex-wrap:wrap;gap:4px}
.ed-icones button{width:36px;height:36px;border-radius:8px;border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-icones button.on{background:var(--md-secondary-container);border-color:transparent}
.ed-icones ha-icon{--mdc-icon-size:20px}
.ed-couleurs{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ed-ic{position:relative;display:flex;align-items:center;gap:6px}
.ed-ic>input{flex:1;min-width:0}
.ed-ic-ap{--mdc-icon-size:22px;width:36px;height:36px;display:grid;place-items:center;border-radius:8px;background:var(--md-surface-container-high);color:var(--md-on-surface);flex:none}
.ed-ic-menu{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px;padding:8px;max-height:220px;overflow:auto;
  border-radius:12px;background:var(--md-surface-container-high);box-shadow:0 4px 16px #0006}
.ed-ic-menu[hidden]{display:none}
.ed-ic-menu button{width:40px;height:40px;border:none;border-radius:8px;background:none;color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-ic-menu button:hover,.ed-ic-menu button:focus-visible{background:var(--md-secondary-container)}
.ed-ic-menu small{grid-column:1/-1;color:var(--md-on-surface-variant)}
.ed-al{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--md-outline-variant);border-radius:12px;margin:0 0 8px}
.ed-al-ents{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ed-al-e{display:inline-flex;align-items:center;gap:2px;padding:0 0 0 10px;border-radius:8px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}
.ed-al-e .ib{width:28px;height:28px}
.ed-couleur-anim{display:flex;align-items:center;gap:4px;min-width:0}
.ed-couleur-anim input[type=color]{width:44px;height:36px;padding:2px;border-radius:8px;flex:none}
.ed-couleurs button{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.ed-couleurs button.on{outline:2px solid var(--md-on-surface);outline-offset:2px}
.ed-couleurs input[type=color]{width:32px;height:32px;border:none;background:none;padding:0;cursor:pointer}
.ed-inter{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}
.ed-inter input{appearance:none;width:52px;height:32px;border-radius:16px;border:2px solid var(--md-outline);background:var(--md-surface-container-high);position:relative;cursor:pointer;flex:none;margin:0;transition:background .2s}
.ed-inter input::before{content:"";position:absolute;width:16px;height:16px;border-radius:50%;background:var(--md-outline);top:6px;left:6px;transition:all .2s var(--md-sys-motion)}
.ed-inter input:checked{background:var(--md-primary);border-color:var(--md-primary)}
.ed-inter input:checked::before{width:24px;height:24px;top:2px;left:22px;background:var(--text-primary-color,#fff)}
.ed-curseur{display:flex;align-items:center;gap:12px}
.ed-curseur input{flex:1;accent-color:var(--md-primary)}
.ed-curseur output{min-width:52px;text-align:right;font-variant-numeric:tabular-nums;color:var(--md-on-surface-variant)}
.ed-actions{display:flex;flex-wrap:wrap;gap:8px}
.ed-liste{display:flex;flex-direction:column;margin:0 -8px}
.ed-liste button{display:flex;align-items:center;gap:12px;min-height:48px;padding:4px 8px;border:none;border-radius:12px;background:none;color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit}
.ed-liste button ha-icon{color:var(--md-on-surface-variant);--mdc-icon-size:22px;flex:none}
.ed-liste button span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-liste small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-dir{display:inline-grid;grid-template-columns:repeat(3,36px);grid-template-rows:repeat(3,36px);gap:2px}
.ed-dir button{border:1px solid var(--md-outline-variant);border-radius:8px;background:var(--md-surface);color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-dir button.on{background:var(--md-secondary-container);border-color:transparent}
.ed-voile{position:fixed;inset:0;background:#0007;z-index:9;display:grid;place-items:center;padding:16px}
.ed-dialogue{background:var(--md-surface-container-high);color:var(--md-on-surface);border-radius:28px;width:min(560px,100%);max-height:min(720px,calc(100vh - 32px));display:flex;flex-direction:column;
  box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-dialogue header{padding:24px 24px 12px}
.ed-dialogue h2{margin:0 0 16px;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-recherche{display:flex;align-items:center;gap:8px;height:56px;border-radius:28px;background:var(--md-surface-container);padding:0 16px}
.ed-recherche input{flex:1;border:none;background:none;color:var(--md-on-surface);font:400 16px/24px var(--ha-font-family-body,Roboto,sans-serif);outline:none;min-width:0}
.ed-filtres{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;min-width:0;max-width:100%;scrollbar-width:none}
.ed-dialogue,.ed-dialogue>*,.ed-dialogue header{min-width:0;box-sizing:border-box}
.ed-dialogue .ed-grille{grid-template-columns:repeat(auto-fill,minmax(min(160px,100%),1fr))}
.ed-filtres button{flex:none;height:32px;padding:0 16px;border-radius:8px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface-variant);cursor:pointer;white-space:nowrap;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-filtres button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
.ed-resultats{overflow:auto;padding:0 12px 8px;flex:1}
.ed-resultats button{display:flex;width:100%;align-items:center;gap:16px;min-height:56px;padding:8px 12px;border:none;border-radius:12px;background:none;color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit}
.ed-resultats button ha-icon{color:var(--md-on-surface-variant);flex:none}
.ed-resultats .n{flex:1;min-width:0}
.ed-resultats .n span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-resultats small{color:var(--md-on-surface-variant);font-size:12px}
.ed-resultats .etat{color:var(--md-on-surface-variant);font-size:12px;white-space:nowrap}
.ed-resultats .deja{opacity:.55}
.ed-dialogue footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 24px 20px}
.ed-snack{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10;background:var(--md-on-surface);color:var(--md-surface);
  border-radius:4px;padding:6px 8px 6px 16px;display:flex;align-items:center;gap:8px;min-height:40px;box-shadow:0 3px 6px #0004;
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);max-width:calc(100vw - 32px)}
.ed-snack button{background:none;border:none;color:color-mix(in srgb,var(--md-primary) 60%,var(--md-surface));font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);cursor:pointer;padding:8px 12px;border-radius:20px}
.ed-dialogue.large{width:min(760px,100%)}
/* « Ajouter un widget » et atelier : titre + bouton « Créer un widget », sections par catégorie ; plein écran sur téléphone */
.ed-titre-ligne{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 16px}
.ed-titre-ligne h2{margin:0;flex:1;min-width:0}
.ed-dialogue .ed-ou{margin:-8px 0 12px}
.ed-dialogue.ed-cat-widgets{width:min(880px,100%);height:min(760px,calc(100vh - 32px))}
.ed-cat-widgets .ed-cat,.ed-dialogue .ed-cat:has(>section){display:flex;flex-direction:column}
.ed-cat>section{flex:none}
.ed-espace{flex:1}
.ed-dialogue footer{align-items:center}
/* récapitulatif de sécurité d'un import : sections (services, commandes, liens, retiré), une liste par section */
.ed-recap .ed-cat{display:flex;flex-direction:column;gap:12px}
.ed-recap-s h4{display:flex;align-items:center;gap:8px;margin:0 0 6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface)}
.ed-recap-s h4 ha-icon{--mdc-icon-size:20px;color:var(--md-primary);flex:none}
.ed-recap-s ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.ed-recap-s li{display:flex;flex-wrap:wrap;align-items:center;gap:2px 12px;padding:8px 12px;border-radius:12px;background:var(--md-surface-container);min-width:0;overflow-wrap:anywhere}
.ed-recap-s li>span:first-child{flex:1 1 auto;min-width:0}
.ed-recap-s li small{flex:1 1 100%;color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.ed-recap-s p{margin:0 0 6px;color:var(--md-on-surface-variant)}
.ed-recap code{font:500 12px/16px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--md-on-surface);overflow-wrap:anywhere}
.ed-sensible{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:8px;background:var(--md-error-container);
  color:var(--md-on-error-container);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap}
.ed-sensible ha-icon{--mdc-icon-size:16px}
.ed-choix-parmi .ed-resultats h4{margin:12px 12px 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-choix-parmi header .ed-aide{margin-top:-8px}
.ed-atelier header .ed-aide{margin-top:-8px}
.ed-atelier .ed-cat{padding-bottom:16px}
.ed-atelier.large{width:min(880px,100%)}
.ed-at-corps{display:grid;grid-template-columns:minmax(0,1fr) 320px;grid-template-areas:"form apercu";gap:24px;align-items:start}
.ed-at-corps>*{min-width:0}
.ed-at-apercu{position:sticky;top:0;grid-area:apercu}
.ed-at-form{grid-area:form}
.ed-at-apercu h4{margin:4px 0 8px}
.ed-at-w{pointer-events:none;border-radius:16px;background:var(--md-surface);padding:12px;box-sizing:border-box}
.ed-at-w .w{margin:0}
.ed-at-form{display:flex;flex-direction:column;gap:4px}
.ed-at-form .ed-champ{margin:0 0 8px}
.ed-at-form .ed-inter{margin:4px 0}
.ed-ligne.ed-at-rang{display:flex;align-items:center}
.ed-at-rang .ed-champ{flex:1;margin:0}
ha-card.ed-etroit .ed-plein-tel{padding:0;place-items:stretch}
ha-card.ed-etroit .ed-plein-tel>.ed-dialogue{width:100vw;height:100vh;height:100dvh;max-height:none;border-radius:0}
ha-card.ed-etroit .ed-plein-tel header{padding:16px 16px 8px}
ha-card.ed-etroit .ed-plein-tel .ed-cat{padding:0 16px 8px}
ha-card.ed-etroit .ed-plein-tel footer{padding:8px 16px 12px}
ha-card.ed-etroit .ed-plein-tel h2{font-size:22px;line-height:28px}
ha-card.ed-etroit .ed-cat-filtres.ed-cat-defile{flex-wrap:nowrap;overflow-x:auto}
.ed-at-form .ed-seg{display:flex}
.ed-at-form .ed-seg button{flex:1}
.ed-creer-bas{display:none}
ha-card.ed-etroit .ed-titre-ligne .ed-btn{display:none}
ha-card.ed-etroit .ed-creer-bas{display:inline-flex}
ha-card.ed-etroit .ed-at-w{max-width:280px;margin:0 auto}
ha-card.ed-etroit .ed-at-corps{grid-template-columns:minmax(0,1fr);grid-template-areas:"apercu" "form";gap:12px}
ha-card.ed-etroit .ed-at-apercu{position:static}
/* « Créer une ouverture », « Créer un meuble » : aperçus à l'échelle, primitives, sections ; suggestions d'une ouverture */
.ed-at-w svg.ed-ap-ouv,.ed-at-w svg.ed-ap-meuble{display:block;width:100%;height:auto;max-height:280px}
.ed-ap-ouv text{font:400 16px var(--ha-font-family-body,Roboto,sans-serif);fill:var(--md-on-surface-variant)}
.ed-ap-int{fill:color-mix(in srgb,var(--md-primary) 6%,transparent)}
.ed-ap-cote{fill:none;stroke:var(--md-on-surface-variant);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-at-w text.ed-ap-cote-t{font:500 14px var(--ha-font-family-body,Roboto,sans-serif);fill:var(--md-on-surface-variant)}
.ed-ap-ouv .ed-ap-cote-t{text-anchor:middle}
.ed-ap-meuble .meuble *{fill:color-mix(in srgb,var(--md-on-surface) 6%,transparent);stroke:var(--md-on-surface-variant);stroke-width:1.4px;vector-effect:non-scaling-stroke}
.ed-ap-meuble .meuble .ligne,.ed-ap-meuble .meuble .vide,.ed-apercu .meuble .forme .vide{fill:none}
.ed-ap-meuble .meuble .tirets{stroke-dasharray:5 4}
.ed-ap-meuble .meuble .forme.colore *,.ed-apercu .meuble .forme.colore *{stroke:color-mix(in srgb,var(--mb-teinte) 75%,var(--md-on-surface-variant))}
.ed-ap-meuble .meuble .forme.colore :not(.ligne):not(.vide),.ed-apercu .meuble .forme.colore :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-teinte) 30%,transparent)}
.ed-at-titre,.ed-at-groupe{display:flex;align-items:center;gap:4px;margin:12px 0 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-at-groupe{margin:4px 0 8px}
.ed-cat .ed-grille+.ed-at-groupe{margin-top:16px}
.ed-at-capteur{margin:-4px 0 4px}
.ed-at-capteur .ed-champ>label:empty{display:none}
.ed-prim{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--md-outline-variant);border-radius:12px;margin:0 0 8px}
.ed-prim-tete{display:flex;align-items:center;gap:6px}
.ed-prim-tete>ha-icon{--mdc-icon-size:20px;color:var(--md-primary);flex:none}
.ed-prim-tete select{flex:1;min-width:0;height:36px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-prim-tete .ib{flex:none}
.ed-ligne.quatre{grid-template-columns:repeat(4,minmax(0,1fr))}
.ed-prim-ajout{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}
.ed-prim-ajout .ed-btn{height:32px;padding:0 12px 0 8px;font-size:13px}
/* atelier des meubles : aperçu manipulable (sélection, poignées, sommets, guides), plus grand ; collant en haut sur téléphone */
.ed-atelier.ed-at-mb{width:min(1040px,100%)}
.ed-at-mb .ed-at-corps{grid-template-columns:minmax(0,1fr) minmax(0,460px)}
.ed-at-mb .ed-at-w svg.ed-ap-meuble{max-height:min(460px,calc(100vh - 300px))}
.ed-atelier.ed-at-mb.ed-at-grand{width:min(1400px,100%);height:calc(100vh - 32px);max-height:none}
.ed-at-mb.ed-at-grand .ed-at-corps{grid-template-columns:minmax(0,1fr) minmax(0,min(820px,60vw))}
.ed-at-mb.ed-at-grand .ed-at-w svg.ed-ap-meuble{max-height:calc(100vh - 310px)}
.ed-at-ap-tete{display:flex;align-items:center;gap:4px;min-height:40px;margin:0 0 4px;padding-top:4px}
.ed-at-ap-tete h4{flex:1;margin:0}
.ed-at-outils{display:flex;gap:4px}
.ed-at-astuce{margin:8px 4px 0;color:var(--md-on-surface-variant);font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-at-w.ed-at-manip{pointer-events:auto;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.ed-at-manip svg.ed-ap-meuble{outline:none;border-radius:8px}
.ed-clavier .ed-at-manip svg.ed-ap-meuble:focus{outline:2px solid var(--md-primary);outline-offset:4px}
.ed-ap-ui .limite{fill:none;stroke:var(--md-outline);stroke-width:1px;stroke-dasharray:2 4;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-ui .cible{fill:none;stroke:none;cursor:move;touch-action:none;stroke-linecap:round;stroke-linejoin:round}
.ed-ap-ui .cadre{fill:none;stroke:var(--md-primary);stroke-width:1.5px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-ui .guide{fill:none;stroke:#e91e63;stroke-width:1px;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-h,.ed-ap-plus{cursor:pointer;touch-action:none;outline:none}
.ed-ap-h .zone,.ed-ap-plus .zone{fill:transparent;stroke:none}
.ed-ap-h .vis{fill:var(--md-surface);stroke:var(--md-primary);stroke-width:2px;vector-effect:non-scaling-stroke}
.ed-ap-h.on .vis{fill:var(--md-primary)}
.ed-ap-plus .vis{fill:var(--md-primary);stroke:var(--md-surface);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-ap-plus path{fill:none;stroke:var(--md-surface);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-clavier .ed-ap-h:focus .zone,.ed-clavier .ed-ap-plus:focus .zone{fill:color-mix(in srgb,var(--md-primary) 16%,transparent);stroke:var(--md-primary);stroke-width:2px;vector-effect:non-scaling-stroke}
.ed-prim.sel{border-color:var(--md-primary);box-shadow:0 0 0 1px var(--md-primary);background:color-mix(in srgb,var(--md-primary) 6%,transparent)}
ha-card.ed-etroit .ed-at-mb .ed-at-corps{display:flex;flex-direction:column;align-items:stretch;gap:12px}
ha-card.ed-etroit .ed-at-mb .ed-at-apercu{position:sticky;top:0;z-index:2;background:var(--md-surface-container-high);margin:0 -16px;padding:0 16px 8px;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-at-mb .ed-at-w{max-width:none;padding:6px}
ha-card.ed-etroit .ed-at-mb .ed-at-w svg.ed-ap-meuble{max-height:30vh;max-height:30dvh}
ha-card.ed-etroit .ed-at-mb.ed-at-grand .ed-at-w svg.ed-ap-meuble{max-height:52vh;max-height:52dvh}
ha-card.ed-etroit .ed-at-mb .ed-at-ap-tete{min-height:36px;margin:0}
ha-card.ed-etroit .ed-at-mb .ed-at-astuce{display:none}
ha-card.ed-etroit .ed-at-mb .ed-prim{scroll-margin-top:calc(var(--ed-ap-h,0px) + 8px)}
.ed-couleurs button.aucune{background:linear-gradient(to top right,transparent calc(50% - 1px),var(--md-outline) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px));border:1px solid var(--md-outline)}
.ed-tuile .modif{position:absolute;top:4px;right:40px;width:32px;height:32px}
.ed-tuile-creer{border-style:dashed;background:none}
.ed-btn.ed-plein{width:100%;justify-content:center}
.ed-suggs{display:flex;flex-direction:column;gap:6px}
.ed-sugg{display:flex;align-items:center;gap:8px;min-height:40px;padding:2px 2px 2px 12px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-sugg>ha-icon{--mdc-icon-size:18px;flex:none}
.ed-sugg>span{flex:1;min-width:0;overflow-wrap:anywhere}
.ed-sugg .ed-btn.texte{height:32px;padding:0 8px;flex:none;color:var(--md-on-secondary-container);font-weight:500}
.ed-sugg .ib{width:32px;height:32px;flex:none;color:var(--md-on-secondary-container)}
.ed-cat{overflow:auto;padding:0 24px 8px;flex:1}
.ed-code{width:100%;box-sizing:border-box;min-height:min(420px,50vh);resize:vertical;border-radius:12px;border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface);
  padding:12px;font:400 12px/18px ui-monospace,"Roboto Mono",Consolas,monospace;tab-size:2;white-space:pre;outline:none}
.ed-code:focus{border-color:var(--md-primary)}
.ed-erreur{margin-top:8px;color:var(--md-error);font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-dialogue .ed-resultats{padding-bottom:0}
.ed-cat h4{margin:16px 0 8px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
.ed-tuile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:12px;border:1px solid var(--md-outline-variant);background:var(--md-surface-container);
  color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit;position:relative;min-height:84px;box-sizing:border-box}
.ed-tuile:hover{background:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface-container))}
.ed-tuile>ha-icon{color:var(--md-primary);--mdc-icon-size:24px}
.ed-tuile b{font-weight:500;line-height:20px}
.ed-tuile small{color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.ed-tuile .cotes{display:flex;gap:6px;margin-top:6px}
.ed-tuile .cotes span{height:28px;padding:0 10px;border-radius:14px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;gap:4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-tuile .cotes ha-icon{--mdc-icon-size:16px}
.ed-tuile .suppr{position:absolute;top:4px;right:4px;width:32px;height:32px}
.ed-sous{border:1px solid var(--md-outline-variant);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
.ed-sous .ed-entete{display:flex;align-items:center;justify-content:space-between;gap:8px;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-puces{display:flex;flex-wrap:wrap;gap:6px}
.ed-puces button{height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface-variant);cursor:pointer;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-puces button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
.ed-acompleter{background:var(--md-error-container);color:var(--md-on-error-container);border-radius:8px;padding:8px 12px;font-size:13px}
svg .ed-cadre{fill:color-mix(in srgb,var(--md-primary) 12%,transparent);stroke:var(--md-primary);stroke-dasharray:6 4;pointer-events:none}
.edition .zone.espace{cursor:grab}
svg .ed-cible{stroke:transparent;fill:none;cursor:pointer;pointer-events:stroke}
svg .ed-cible:hover{stroke:color-mix(in srgb,var(--md-primary) 25%,transparent)}
svg .ed-sel{fill:none;stroke:var(--md-primary);stroke-dasharray:10 6;pointer-events:none}
svg .ed-poly-sel{fill:color-mix(in srgb,var(--md-primary) 10%,transparent);stroke:var(--md-primary);stroke-dasharray:10 6;pointer-events:none}
svg .ed-poignee{fill:var(--md-surface);stroke:var(--md-primary);cursor:move}
svg .ed-milieu{fill:var(--md-primary);stroke:none;opacity:.55;cursor:copy}
svg .ed-trace{fill:none;stroke:var(--md-primary);stroke-dasharray:8 6;pointer-events:none}
svg .ed-trace-pt{fill:var(--md-primary);pointer-events:none}
svg .ed-curseur-pt{fill:none;stroke:var(--md-primary);pointer-events:none}
.edition .zone.dessin{cursor:crosshair}
.edition .zone.dessin .calque>*{pointer-events:none}
.edition .piece{cursor:pointer}
.ib.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-cqs{display:flex;flex-direction:column;margin:0 -8px}
.ed-cq{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 4px;border-radius:12px}
.ed-cq>ha-icon{color:var(--md-on-surface-variant);--mdc-icon-size:20px;flex:none}
.ed-cq .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-cq .n small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-cq.masque .n,.ed-cq.masque>ha-icon{opacity:.6}
.ed-cq.glisse{background:var(--md-secondary-container)}
.ed-cq-poignee{cursor:grab;touch-action:none;width:32px;height:40px}
.ed-cq-depot{height:3px;border-radius:2px;background:var(--md-primary);margin:-1px 8px}
.ed-apercu-fiche{display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;padding:4px 0 8px}
.ed-pers{display:flex;flex-direction:column;gap:4px}
.ed-pers-l{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);align-items:center;gap:8px;min-height:48px}
.ed-pers-l>span{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-pers-l>span>i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 12px/1 var(--ha-font-family-body,Roboto,sans-serif);font-style:normal;
  background:var(--md-primary);color:var(--text-primary-color,#fff)}
.ed-pers-l select{height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;min-width:0}
/* champs de la modale ⚙ Paramètres */
.ed-par-sec{display:flex;flex-direction:column;gap:14px}
.ed-par-sec+.ed-par-sec{border-top:1px solid var(--md-outline-variant);padding-top:14px}
.ed-par-sec>h4{margin:0}
.ed-par-inter{font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface);margin:2px 0 -6px}
.ed-par{display:flex;flex-direction:column;gap:6px}
.ed-champ>.ed-par-lib{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);letter-spacing:.4px}
.ed-seg.plein{display:flex;width:100%;box-sizing:border-box}
.ed-seg.plein button{flex:1 1 0;min-width:0;padding:0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:30px;text-align:center}
.ed-seg button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-unite{position:relative;display:flex}
.ed-unite input{flex:1;min-width:0;padding-right:44px!important}
.ed-unite>span{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--md-on-surface-variant);pointer-events:none}
.ed-confirme{display:flex;flex-direction:column;gap:8px;padding:12px 12px 8px 16px;border-radius:12px;background:var(--md-surface-container-high);border:1px solid var(--md-outline-variant)}
.ed-confirme b{display:flex;align-items:center;gap:8px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-confirme b ha-icon{--mdc-icon-size:20px;color:var(--md-error)}
.ed-confirme p{margin:0;color:var(--md-on-surface-variant);font-size:13px;line-height:19px}
.ed-confirme code{font:12px/1 ui-monospace,monospace}
.ed-confirme .ed-actions{justify-content:flex-end}
.ed-liste button .chevron{margin-left:auto;--mdc-icon-size:20px}
.ed-par-sec .ed-liste button span{white-space:normal}
.ed-panneau h3:focus{outline:none}
/* barre d'outils : commande du pas de la grille, menus déroulants */
.ed-menu-btn{height:40px;padding:0 6px 0 10px;border-radius:20px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface);cursor:pointer;
  display:inline-flex;align-items:center;gap:6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap;font-variant-numeric:tabular-nums}
.ed-menu-btn>ha-icon{--mdc-icon-size:18px;color:var(--md-on-surface-variant)}
.ed-menu-btn .lib{color:var(--md-on-surface-variant);font-weight:400}
.ed-menu-btn[aria-expanded=true]{background:var(--md-secondary-container);border-color:transparent}
.ed-menu{position:fixed;z-index:11;min-width:200px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:8px 0;border-radius:4px;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 2px 6px 2px #0003,0 1px 2px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-menu-titre{padding:8px 16px 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;color:var(--md-on-surface-variant)}
.ed-menu-sep{height:1px;margin:8px 0;background:var(--md-outline-variant)}
.ed-menu button{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 16px 0 12px;border:none;border-radius:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;white-space:nowrap}
.ed-menu button ha-icon{--mdc-icon-size:20px;width:24px;flex:none;color:var(--md-on-surface-variant)}
.ed-menu button[aria-checked=true]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-menu button[aria-checked=true] ha-icon{color:inherit}
.ed-menu button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-menu kbd,.ed-touches kbd{font:500 11px/1 ui-monospace,monospace;border:1px solid var(--md-outline-variant);border-bottom-width:2px;border-radius:4px;padding:2px 5px;background:var(--md-surface);color:var(--md-on-surface)}
.ed-menu button kbd{margin-left:auto}
.ed-barre .ed-plus{display:none}
.ed-saut{display:none}
/* téléphone : deux rangées (grille, Plus, Ajouter, Quitter, Enregistrer / annuler, rétablir, outils) ; le reste dans le menu « Plus » */
ha-card.ed-etroit .ed-barre{flex-wrap:wrap;row-gap:8px}
ha-card.ed-etroit .ed-defile,ha-card.ed-etroit .ed-fin{display:contents}
ha-card.ed-etroit .ed-pc{display:none}
ha-card.ed-etroit .ed-barre .ed-plus{display:inline-grid;order:2;margin-right:auto}
ha-card.ed-etroit .ed-menu-btn[data-a=grille]{order:1}
ha-card.ed-etroit .ed-fin>[data-a=ajouter]{order:3}
ha-card.ed-etroit .ed-fin>[data-a=quitter]{order:4}
ha-card.ed-etroit .ed-fin>[data-a=enregistrer]{order:5}
ha-card.ed-etroit .ed-saut{display:block;order:6;flex-basis:100%;height:0}
ha-card.ed-etroit .ed-histo{order:7}
ha-card.ed-etroit .ed-outils{order:8;flex:1 1 0;min-width:0;display:flex}
ha-card.ed-etroit .ed-outils button{flex:1 1 0;min-width:0;padding:0}
ha-card.ed-etroit .ed-menu-btn .lib{display:none}
/* modale ⚙ Paramètres : onglets à gauche, contenu défilant ; plein écran et onglets en haut sur téléphone */
.ed-mvoile{position:fixed;inset:0;z-index:9;display:grid;place-items:center;background:rgb(0 0 0 / .35)}
.ed-modale{width:min(880px,calc(100vw - 48px));height:min(640px,90vh);display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;border-radius:28px;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-modale>header{display:flex;align-items:flex-start;gap:12px;padding:20px 16px 12px 24px;flex:none}
.ed-modale>header>ha-icon{--mdc-icon-size:24px;color:var(--md-on-surface-variant);margin-top:4px}
.ed-modale>header>div{flex:1;min-width:0}
.ed-modale h2{margin:0;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-version{color:var(--md-on-surface-variant);font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-version button{border:none;background:none;padding:0;color:var(--md-primary);font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.ed-mcorps{flex:1;min-height:0;display:flex}
.ed-onglets{flex:none;width:248px;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;padding:4px 12px 16px;overflow:auto}
.ed-onglets button{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px 0 12px;border:none;border-radius:24px;background:none;color:var(--md-on-surface-variant);
  font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);text-align:left;cursor:pointer;flex:none}
.ed-onglets button ha-icon{--mdc-icon-size:22px;flex:none}
.ed-onglets button[aria-selected=true]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-onglets button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-mcontenu{flex:1;min-width:0;overflow:auto;padding:4px 24px 24px;box-sizing:border-box;border-left:1px solid var(--md-outline-variant);overscroll-behavior:contain}
.ed-mcontenu>section{display:flex;flex-direction:column;gap:14px}
.ed-mcontenu>section[hidden]{display:none}
.ed-mcontenu>section:focus{outline:none}
.ed-mtitre{margin:4px 0 2px;font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface)}
.ed-mcontenu .ed-par-sec>h4{margin:6px 0 0;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px;text-transform:none;color:var(--md-primary)}
.ed-mcontenu .ed-liste{margin:0 -8px}
.ed-mcontenu .ed-liste button{width:100%}
ha-card.ed-etroit .ed-mvoile{place-items:stretch}
ha-card.ed-etroit .ed-modale{width:100vw;height:100vh;height:100dvh;border-radius:0}
ha-card.ed-etroit .ed-modale>header{padding:12px 8px 4px 16px}
ha-card.ed-etroit .ed-modale>header>ha-icon{display:none}
ha-card.ed-etroit .ed-modale h2{font-size:22px;line-height:28px}
ha-card.ed-etroit .ed-mcorps{flex-direction:column}
ha-card.ed-etroit .ed-onglets{width:auto;flex-direction:row;gap:8px;padding:4px 16px 8px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-onglets::-webkit-scrollbar{display:none}
ha-card.ed-etroit .ed-onglets button{min-height:32px;height:32px;padding:0 16px;border-radius:8px;border:1px solid var(--md-outline-variant);white-space:nowrap}
ha-card.ed-etroit .ed-onglets button[aria-selected=true]{border-color:transparent}
ha-card.ed-etroit .ed-onglets button ha-icon{display:none}
ha-card.ed-etroit .ed-mcontenu{border-left:none;padding:8px 16px 24px}
/* aide aux raccourcis clavier */
.ed-dialogue.ed-dlg-touches{width:min(880px,100%)}
.ed-dlg-touches header{padding-bottom:0}
.ed-touches{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:0 32px;overflow:auto;padding:0 24px 8px;flex:1}
.ed-touches h3{margin:8px 0 4px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-primary)}
.ed-touches dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;align-items:baseline}
.ed-touches dt{color:var(--md-on-surface-variant);font-size:12px;line-height:20px;white-space:nowrap}
.ed-touches dt>span{white-space:nowrap}
.ed-touches dd{margin:0;color:var(--md-on-surface)}
/* bulle d'aide ⓘ : petit bouton (cible de 40 px) ; infobulle au survol ou au focus sur PC, popover au toucher (EditeurPlan._cablerAides) */
.ed-i{position:relative;display:inline-grid;place-items:center;width:24px;height:24px;margin:-4px 0 -4px 2px;padding:0;border:none;border-radius:50%;background:none;
  color:var(--md-on-surface-variant);cursor:help;flex:none;vertical-align:middle;--mdc-icon-size:18px;text-transform:none;letter-spacing:normal;font:inherit}
.ed-i::before{content:"";position:absolute;inset:-8px;border-radius:50%}
.ed-i:hover,.ed-i[aria-expanded=true]{color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 10%,transparent)}
.ed-i:focus-visible{outline:2px solid var(--md-primary);outline-offset:1px}
.ed-tip{position:fixed;z-index:12;box-sizing:border-box;max-width:min(320px,calc(100vw - 16px));padding:12px 16px;border-radius:12px;
  background:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface-container-high));color:var(--md-on-surface-variant);
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.25px;text-transform:none;white-space:normal;overflow-wrap:anywhere;
  box-shadow:0 2px 6px 2px #00000026,0 1px 2px #0000004d;animation:ed-tip .12s var(--md-sys-motion,ease-out)}
@keyframes ed-tip{from{opacity:0;transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){.ed-tip{animation:none}}
.ed-panneau h3 .ed-i{margin-left:0}
.ed-panneau h3 .ed-i+.ib{margin-left:auto}
/* aide courte sous le titre d'un panneau (surface, sommets, compte d'une sélection) */
.ed-resume{color:var(--md-on-surface-variant);font-size:13px;line-height:19px;font-variant-numeric:tabular-nums}
/* actions secondaires en icônes (premier plan, dupliquer, modèle…) : texte en infobulle ; « Supprimer » garde son libellé */
.ed-actions .ib{width:40px;height:40px;border:1px solid var(--md-outline-variant);border-radius:20px;color:var(--md-on-surface-variant)}
.ed-actions .ed-btn.danger{margin-left:auto}
.ed-actions .ib:focus-visible,.ed-btn:focus-visible{outline:2px solid var(--md-primary);outline-offset:2px}
/* bouton Enregistrer : point d'état quand le plan est modifié (plus de texte « Non enregistré ») */
.ed-btn[data-a=enregistrer]{position:relative}
.ed-btn[data-a=enregistrer].modifie::after{content:"";position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--md-error);box-shadow:0 0 0 2px var(--md-surface-container-high)}
/* animations par événement (panneau Ambiance) : type en pleine largeur, couleur et durée dessous */
.ed-anim-ev select{width:100%}
.ed-anim-ev .ed-ligne{align-items:center;margin-top:4px}
.ed-anim-ev input[type=number]{height:36px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;min-width:0;width:100%;box-sizing:border-box}
/* indices de défilement des rangées horizontales (onglets, filtres) : dégradé du côté où il reste à voir */
.ed-filtres.def-d,.ed-onglets.def-d{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent)}
.ed-filtres.def-g,.ed-onglets.def-g{-webkit-mask-image:linear-gradient(90deg,transparent,#000 32px);mask-image:linear-gradient(90deg,transparent,#000 32px)}
.ed-filtres.def-g.def-d,.ed-onglets.def-g.def-d{-webkit-mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 32px),transparent)}
/* catalogue : filtres sur plusieurs lignes au téléphone, tuiles sur 2 colonnes, ombre de défilement en bas */
ha-card.ed-etroit .ed-cat-filtres{flex-wrap:wrap;overflow:visible}
ha-card.ed-etroit .ed-dialogue .ed-grille{grid-template-columns:repeat(auto-fill,minmax(min(132px,100%),1fr))}
.ed-tuile small{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.ed-tuile .cotes span{padding:0;width:36px;justify-content:center}
.ed-cat{background:linear-gradient(transparent,var(--md-surface-container-high) 70%) center bottom/100% 24px no-repeat local,
  radial-gradient(farthest-side at 50% 100%,#0005,transparent) center bottom/100% 10px no-repeat scroll}
/* sélecteur d'entité : nom sur deux lignes, identifiant coupé où il faut (téléphone) */
.ed-resultats .n span{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.ed-resultats small{overflow-wrap:anywhere}
/* modale ⚙ : titre d'onglet gardé pour les lecteurs d'écran sur PC (l'onglet actif le montre déjà), visible au téléphone */
ha-card:not(.ed-etroit) .ed-mtitre{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ed-modale h2 .ed-i{margin-left:6px}
/* « Nettoyer le plan » : aperçu (défauts cerclés, clic = zoom) à gauche, corrections à cocher à droite ; empilés au téléphone */
.ed-dialogue.ed-net{width:min(1040px,100%);height:min(780px,calc(100vh - 32px))}
.ed-net header .ed-aide{margin-top:-8px}
.ed-net-corps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,360px);gap:24px;align-items:start;align-content:start;padding-bottom:16px}
.ed-net-corps>*{min-width:0}
.ed-net-apercu{position:sticky;top:0;display:flex;flex-direction:column;gap:8px}
.ed-net-tete{display:flex;align-items:center;gap:8px;min-height:40px}
.ed-net-tete .ed-espace{flex:1}
.ed-net-w{border-radius:16px;background:var(--md-surface);overflow:hidden;height:min(calc(100vh - 360px),480px);min-height:220px;touch-action:manipulation}
.ed-net-w svg{display:block;width:100%;height:100%}
.ed-net-w.ed-net-z svg{cursor:zoom-out}
.ed-net-w [data-d]{cursor:pointer}
.n-sol{fill:var(--md-surface-container-high);stroke:var(--md-outline-variant)}
.n-sol.dehors{fill:none;stroke-dasharray:6 4}
.n-sol.sz{fill:none}
.n-mur{fill:none;stroke:var(--md-on-surface);stroke-linecap:square}
.n-ouv{fill:none;stroke:var(--md-primary)}
.n-def{fill:color-mix(in srgb,var(--md-error) 16%,transparent);stroke:var(--md-error)}
.n-info{fill:none;stroke:var(--md-error);opacity:.75}
.n-style{fill:var(--md-surface);stroke:var(--md-on-surface-variant)}
.n-fait{fill:var(--md-primary);stroke:var(--md-surface)}
.n-def.on,.n-style.on,.n-fait.on,.n-info.on{stroke-width:3px;vector-effect:non-scaling-stroke}
.ed-net-leg{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--md-on-surface-variant)}
.ed-net-leg span{display:inline-flex;align-items:center;gap:6px}
.ed-net-leg i{width:10px;height:10px;border-radius:50%;box-sizing:border-box;flex:none}
.ed-net-leg .l-def{border:2px solid var(--md-error);background:color-mix(in srgb,var(--md-error) 16%,transparent)}
.ed-net-leg .l-style{border:1.5px solid var(--md-on-surface-variant)}
.ed-net-leg .l-info{width:16px;height:0;border-radius:0;border-top:2px dashed var(--md-error)}
.ed-net-leg .l-fait{background:var(--md-primary)}
.ed-net-form{display:flex;flex-direction:column;gap:2px}
.ed-net-form h4{margin:12px 8px 4px}
.ed-net-opt .ed-coche{min-height:44px;padding:4px 8px;gap:12px}
.ed-net-opt+.ed-net-opt{margin-top:4px}
.ed-net-opt .ed-coche .n{flex:1;min-width:0}
.ed-net-nb{min-width:24px;height:24px;padding:0 8px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 12px/24px var(--ha-font-family-body,Roboto,sans-serif);text-align:center;box-sizing:border-box;flex:none}
.ed-net-det{margin:-4px 8px 2px 40px}
.ed-net-det>summary{cursor:pointer;color:var(--md-primary);font:500 13px/28px var(--ha-font-family-body,Roboto,sans-serif);list-style:none;display:inline-flex;align-items:center;gap:4px}
.ed-net-det>summary::before{content:"▸";transition:transform .2s}
.ed-net-det[open]>summary::before{transform:rotate(90deg)}
.ed-net-liste{display:flex;flex-direction:column}
.ed-net-liste button{text-align:left;border:none;background:none;color:var(--md-on-surface);padding:6px 8px;border-radius:8px;font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif);cursor:pointer}
.ed-net-liste button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ed-net-liste button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-net-liste small{color:var(--md-on-surface-variant);font-size:12px}
.ed-net-salles{margin:0 8px 6px 40px}
.ed-net-salles button{height:28px;padding:0 10px}
.ed-net-propre{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-net-propre ha-icon{--mdc-icon-size:28px;color:var(--md-primary);flex:none}
.ed-net-propre b{display:block;font:500 16px/24px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-net-vide{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;padding:32px 16px}
.ed-net-vide ha-icon{--mdc-icon-size:48px;color:var(--md-primary)}
.ed-net-vide b{font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-net-vide span{color:var(--md-on-surface-variant)}
.ed-net footer{flex-wrap:wrap}
.ed-net .ed-versions button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
.ed-dialogue.ed-net.ed-net-petit{height:auto;width:min(560px,100%)}
ha-card.ed-etroit .ed-net-corps{grid-template-columns:minmax(0,1fr);gap:8px}
ha-card.ed-etroit .ed-net-apercu{z-index:2;background:var(--md-surface-container-high);margin:0 -16px;padding:0 16px 8px;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-net-w{height:30vh;height:30dvh}
ha-card.ed-etroit .ed-net-det,ha-card.ed-etroit .ed-net-salles{margin-left:32px}
`;

export class EditeurPlan {
  // réglages de la modale ⚙ Paramètres (lecture seule : pour les tests et l'intégration)
  static SECTIONS_PARAMETRES = SECTIONS_PARAMETRES;
  // lecture / écriture d'un réglage, par son chemin ou par son champ (sans historique) ; reglerParametre(chemin, v) écrit avec annulation (Ctrl+Z)
  static PARAMETRES = { sections: SECTIONS_PARAMETRES, lire: (d, c) => lireReglage(d, champDe(c)),
    ecrire: (d, c, v) => { const f = champDe(c); if (f.si && !f.si(d)) return; if (f.ecrire) f.ecrire(d, v); else ecrireReglage(d, f, v); } };
  // alias (champ complet) : lecture où un interrupteur porté par un objet (`tablet: {…}`) vaut true, écriture avec `ecrire` éventuel
  static lireParametre = (d, f) => { const v = lireReglage(d, f); return f.type === "bool" && v && typeof v === "object" ? true : v; };
  static poserParametre = (d, f, v) => (f.ecrire ? f.ecrire(d, v) : ecrireReglage(d, f, v));
  constructor(carte, reprise = null) {
    this.carte = carte;
    this.original = clone(carte._config);
    this.d = clone(carte._config);
    this.histo = []; this.refaire = [];
    this.sel = null; this.outil = "selection"; this.grille = 5; this.modifie = false;
    this.trace = []; this.aPlacer = null; this.survol = null; this.multi = new Set(); this.espace = false;
    carte._config = this.d;
    this._boite(true, carte);
    carte._editeur = this;
    this._monterUI();
    this._cablerAides(); // avant les raccourcis : Échap ferme d'abord une bulle ouverte
    this._touche = this._touche.bind(this);
    window.addEventListener("keydown", this._touche, true);
    this._relache = (ev) => { if (ev.key === " ") { this.espace = false; this.zone?.classList.remove("espace"); } };
    window.addEventListener("keyup", this._relache, true);
    this._avantFermeture = (e) => { if (this.modifie) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", this._avantFermeture);
    if (reprise) {
      this.grille = PAS_GRILLE.includes(+reprise.grille) ? +reprise.grille : 5;
      const s = reprise.sel, simple = (v) => typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && /^[\w:.-]{0,80}$/.test(v);
      this.sel = s && typeof s === "object" && !Array.isArray(s) && Object.values(s).every(simple) ? s : null;
    }
    carte._construire();
    if (reprise) { this._barre(); this._panneau(); this.snack(_t("Plan enregistré.")); } else {
      const n = carte._ignores;
      if (n) this.snack(_t("{n} élément sans coordonnées valides (pièce sans contour, mur sans extrémités…) est ignoré : il sera retiré à l'enregistrement.|{n} éléments sans coordonnées valides (pièce sans contour, mur sans extrémités…) sont ignorés : ils seront retirés à l'enregistrement.", { n }), null, null, 12000);
      this._proposerBrouillon();
      this._cadrerPlan();
    }
  }

  // téléphone : à l'ouverture, la vue est cadrée sur le plan (la zone de dessin garde ses 5 m de marge : « Toute la maison »,
  // dézoomer ou « Recadrer » pour y accéder) ; sur grand écran, tout reste visible d'emblée
  _cadrerPlan() {
    const c = this.carte, B = c._box;
    if (c.clientWidth >= 760 || !this.d.pieces.length || !B) return;
    const b = c.bornes(), m = 80, r = B.W / B.H, W = Math.max(b.W + 2 * m, (b.H + 2 * m) * r), H = W / r;
    c._cadrer({ x0: b.x0 + b.W / 2 - W / 2, y0: b.y0 + b.H / 2 - H / 2, W, H });
  }

  get hass() { return this.carte._hass; }
  // brouillon et versions : par id, ou par empreinte du contenu d'origine pour une carte sans id (plusieurs plans sans id ne se mélangent pas)
  _ident() {
    if (this.d.id != null) return this.d.id;
    let h = 0;
    for (const c of canon({ pieces: [], ...this.original })) h = (h * 31 + c.charCodeAt(0)) | 0;
    return `sansid-${(h >>> 0).toString(36)}`;
  }
  _cle() { return CLE(this._ident()); }
  get R() { return this.carte.shadowRoot; }

  // ---------- interface ----------
  _monterUI() {
    const R = this.R, card = R.querySelector("ha-card");
    this.style = document.createElement("style");
    this.style.textContent = CSS;
    R.prepend(this.style);
    this.barre = document.createElement("div");
    this.barre.className = "ed-barre";
    card.insertBefore(this.barre, R.querySelector(".tete"));
    this.panneau = document.createElement("aside");
    this.panneau.className = "ed-panneau";
    // panneau affiché seulement quand il a un contenu (sélection, Calques, Ambiance) : PC à droite, téléphone en feuille du bas,
    // repliable par sa poignée (téléphone seulement : repliée au départ, elle se déplie à la sélection)
    this.replie = this.carte.clientWidth < 760;
    this.poignee = document.createElement("button");
    this.poignee.className = "ed-replier";
    // le « clic » du même toucher qui a déplié la feuille arrive ensuite sur sa poignée : on l'ignore
    this.poignee.onclick = () => { if (Date.now() - (this._depliee || 0) > 600) this.replier(!this.replie); };
    const hote = R.querySelector(".panneau-hote");
    hote.append(this.poignee, this.panneau);
    hote.classList.add("vide");
    // téléphone : la feuille se déplie sous le doigt au toucher d'un élément du plan ; les événements souris émulés du même toucher
    // (mousedown → focus d'un champ, click → poignée, choix d'entité…) arrivent ensuite sur ce qui vient d'apparaître : on les ignore
    const fantome = (e) => { if (Date.now() - (this._depliee || 0) < 600 && R.querySelector("ha-card")?.classList.contains("ed-etroit")) { e.preventDefault(); e.stopPropagation(); } };
    for (const t of ["mousedown", "mouseup", "click"]) hote.addEventListener(t, fantome, true);
    this._etatRepli();
    this._barre();
    this.zone = R.querySelector(".zone");
    this._pd = (e) => this._pointeurBas(e);
    this._pm = (e) => this._survolPlan(e);
    this._dbl = (e) => this._double(e);
    this._ctx = (e) => { if (this.outil !== "selection") { e.preventDefault(); this._finirTrace(); } };
    this.zone.addEventListener("pointerdown", this._pd);
    this._suivre = (e) => { this._xy = [e.clientX, e.clientY]; };
    window.addEventListener("pointermove", this._suivre, true);
    window.addEventListener("pointerdown", this._suivre, true);
    this._sortie = () => { const b = this.R.querySelector(".ed-bulle"); if (b) b.hidden = true; };
    this.zone.addEventListener("pointerleave", this._sortie);
    this.zone.addEventListener("pointermove", this._pm);
    this.zone.addEventListener("dblclick", this._dbl);
    this.zone.addEventListener("contextmenu", this._ctx);
  }

  _barre() {
    this._fermerMenu();
    // bouton qui avait le focus (barre redessinée après chaque modification) : il le retrouve ensuite
    const a = this.R.activeElement, garde = a && this.barre.contains(a) ? (a.dataset.a ? `[data-a="${a.dataset.a}"]` : a.dataset.outil ? `[data-outil="${a.dataset.outil}"]` : null) : null;
    const o = (id, ic, t) => `<button data-outil="${id}" class="${this.outil === id ? "on" : ""}" title="${_t(t)}" aria-label="${_t(t)}" aria-pressed="${this.outil === id}"><ha-icon icon="${ic}"></ha-icon></button>`;
    const ib = (a, ic, t, on, pc = true) => `<button class="ib${on ? " on" : ""}${pc ? " ed-pc" : ""}" data-a="${a}" title="${t}" aria-label="${t}"${on != null ? ` aria-pressed="${!!on}"` : ""}><ha-icon icon="${ic}"></ha-icon></button>`;
    // PC : historique | outils | grille, recadrer | panneaux (calques, ambiance) | import / export, paramètres, raccourcis
    // téléphone : la grille et « Plus » (recadrer, calques, ambiance, import / export, paramètres) passent en tête, les outils en 2e rangée
    poserHTML(this.barre, `<div class="ed-defile">
      <span class="ed-groupe ed-histo"><button class="ib" data-a="annuler" title="${_t("Annuler (Ctrl+Z)")}" aria-label="${_t("Annuler (Ctrl+Z)")}" ${this.histo.length ? "" : "disabled"}><ha-icon icon="mdi:undo"></ha-icon></button>
        <button class="ib" data-a="refaire" title="${_t("Rétablir (Ctrl+Y)")}" aria-label="${_t("Rétablir (Ctrl+Y)")}" ${this.refaire.length ? "" : "disabled"}><ha-icon icon="mdi:redo"></ha-icon></button></span>
      <span class="ed-seg ed-outils" role="group" aria-label="${_t("Outils")}">${OUTILS.map(([id, ic, t]) => o(id, ic, t)).join("")}</span>
      <span class="ed-sep ed-pc"></span>
      <button class="ed-menu-btn" data-a="grille" title="${tactile() ? _t("Grille") : _t("Grille (Alt : sans aimant)")}" aria-label="${_t("Pas de la grille : {v} cm", { v: this.grille })}" aria-haspopup="menu" aria-expanded="false">
        <ha-icon icon="mdi:grid"></ha-icon><span><span class="lib">${_t("Grille :")} </span>${_t("{v} cm", { v: this.grille })}</span><ha-icon icon="mdi:menu-down"></ha-icon></button>
      ${ib("recadrer", "mdi:fit-to-screen-outline", _t("Recadrer : tout le plan avec 5 m de marge"))}
      <span class="ed-sep ed-pc"></span>
      ${ib("calques", "mdi:layers-outline", _t("Calques"), !!this.vueCalques)}
      ${ib("ambiance", "mdi:weather-partly-cloudy", _t("Ambiance et animations"), !!this.vueAmbiance)}
      <span class="ed-sep ed-pc"></span>
      ${ib("nettoyer", "mdi:auto-fix", _t("Nettoyer le plan"))}
      ${ib("exporter", "mdi:file-swap-outline", _t("Exporter / importer le plan (YAML, JSON)"))}
      <button class="ib ed-pc${this.vueParametres ? " on" : ""}" data-a="parametres" title="${_t("Paramètres")}" aria-label="${_t("Paramètres")}" aria-haspopup="dialog" aria-expanded="${!!this.vueParametres}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>
      ${sansClavier() ? "" : `<button class="ib ed-pc" data-a="aide" title="${_t("Raccourcis clavier (?)")}" aria-label="${_t("Raccourcis clavier (?)")}" aria-haspopup="dialog"><ha-icon icon="mdi:keyboard-outline"></ha-icon></button>`}</div>
      <div class="ed-fin"><button class="ib ed-plus" data-a="plus" title="${_t("Plus d'outils")}" aria-label="${_t("Plus d'outils")}" aria-haspopup="menu" aria-expanded="false"><ha-icon icon="mdi:dots-vertical"></ha-icon></button>
      <button class="ed-btn tonal" data-a="ajouter" title="${tactile() ? _t("Ajouter un objet ou un widget") : _t("Ajouter un objet ou un widget (A)")}" aria-label="${_t("Ajouter")}"><ha-icon icon="mdi:plus"></ha-icon><span class="lib">${_t("Ajouter")}</span></button>
      <span class="ed-info"></span>
      <button class="ed-btn texte" data-a="quitter" title="${_t("Quitter l'éditeur")}" aria-label="${_t("Quitter l'éditeur")}"><ha-icon icon="mdi:exit-to-app"></ha-icon><span class="lib">${_t("Quitter")}</span></button>
      <button class="ed-btn plein${this.modifie ? " modifie" : ""}" data-a="enregistrer" ${this.modifie ? "" : "disabled"} title="${tactile() ? _t("Enregistrer") : _t("Enregistrer (Ctrl+S)")}" aria-label="${this.modifie ? _t("Enregistrer (modifications non enregistrées)") : _t("Enregistrer")}"><ha-icon icon="mdi:content-save-outline"></ha-icon><span class="lib">${_t("Enregistrer")}</span></button>
      <span class="ed-saut"></span></div>`);
    // indice de défilement quand tous les outils ne tiennent pas
    const df = this.barre.querySelector(".ed-defile"), indice = () => df.classList.toggle("deborde", df.scrollWidth > df.clientWidth + 2 && df.scrollLeft + df.clientWidth < df.scrollWidth - 2);
    df.onscroll = indice;
    requestAnimationFrame(indice);
    this.barre.onclick = (ev) => {
      const b = ev.composedPath().find((n) => n instanceof HTMLElement && (n.dataset.a || n.dataset.outil));
      if (!b || b.disabled) return;
      if (b.dataset.outil) this.choisirOutil(b.dataset.outil);
      else ({ annuler: () => this.annuler(), refaire: () => this.retablir(), ajouter: () => this.ouvrirCatalogue(), enregistrer: () => this.enregistrer(),
        quitter: () => this.quitter(), recadrer: () => this.recadrer(), exporter: () => this.exporter(), nettoyer: () => this.nettoyerPlan(), calques: () => this.panneauCalques(!this.vueCalques), ambiance: () => this.panneauAmbiance(!this.vueAmbiance),
        parametres: () => this.panneauParametres(!this.vueParametres), aide: () => this.aideClavier(), grille: () => this.menuGrille(), plus: () => this.menuPlus() })[b.dataset.a]();
    };
    if (garde) this.barre.querySelector(garde)?.focus({ preventScroll: true });
    this._info();
  }

  // pas de la grille (et du magnétisme, des flèches) : menu sous le bouton « Grille : 5 cm », valeur courante cochée
  _itemsGrille() { return [{ titre: _t("Pas de la grille") }, ...PAS_GRILLE.map((g) => ({ libelle: _t("{v} cm", { v: g }), coche: this.grille === g, action: () => this.reglerGrille(g) }))]; }
  reglerGrille(g) { this.grille = g; this._barre(); }
  menuGrille() { const b = this.barre.querySelector('[data-a="grille"]'); if (b) this._menu(b, this._itemsGrille(), _t("Pas de la grille")); }
  // téléphone : ce qui ne tient pas dans la barre
  menuPlus() {
    const b = this.barre.querySelector('[data-a="plus"]');
    if (!b) return;
    // le pas de la grille a son propre bouton à côté : pas de doublon dans ce menu
    this._menu(b, [{ icone: "mdi:fit-to-screen-outline", libelle: _t("Recadrer"), action: () => this.recadrer() },
      { icone: "mdi:layers-outline", libelle: _t("Calques"), action: () => this.panneauCalques(!this.vueCalques) },
      { icone: "mdi:weather-partly-cloudy", libelle: _t("Ambiance et animations"), action: () => this.panneauAmbiance(!this.vueAmbiance) },
      { icone: "mdi:auto-fix", libelle: _t("Nettoyer le plan"), action: () => this.nettoyerPlan() },
      ...(this._copiesNettoyage().length ? [{ icone: "mdi:history", libelle: _t("Restaurer un plan d'avant nettoyage"), action: () => this.copiesNettoyage() }] : []),
      { icone: "mdi:file-swap-outline", libelle: _t("Importer / exporter"), action: () => this.exporter() },
      { icone: "mdi:cog-outline", libelle: _t("Paramètres"), action: () => this.panneauParametres(true) }], _t("Plus d'outils"));
  }
  // menu déroulant MD3 sous un bouton : items { titre } (intitulé), { sep }, { icone, libelle, coche?, action } ; flèches, Origine / Fin, Échap
  _menu(btn, items, etiquette) {
    this._fermerMenu();
    const m = document.createElement("div");
    m.className = "ed-menu"; m.setAttribute("role", "menu"); m.setAttribute("aria-label", etiquette);
    poserHTML(m, items.map((it, j) => (it.titre ? `<div class="ed-menu-titre" role="presentation">${esc(it.titre)}</div>` : it.sep ? `<div class="ed-menu-sep" role="separator"></div>`
      : `<button type="button" role="${it.coche != null ? "menuitemradio" : "menuitem"}"${it.coche != null ? ` aria-checked="${it.coche}"` : ""} data-menu="${j}" tabindex="-1"><ha-icon icon="${it.coche != null ? (it.coche ? "mdi:check" : "") : esc(it.icone || "")}"></ha-icon><span>${esc(it.libelle)}</span></button>`)).join(""));
    this.R.querySelector("ha-card").append(m);
    const r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = `${Math.max(8, Math.min(r.left, innerWidth - w - 8))}px`;
    m.style.top = `${r.bottom + 4 + h > innerHeight - 8 && r.top - 4 - h > 8 ? r.top - 4 - h : Math.max(8, Math.min(r.bottom + 4, innerHeight - h - 8))}px`;
    btn.setAttribute("aria-expanded", "true");
    const boutons = [...m.querySelectorAll("[data-menu]")];
    const fermer = (rendre) => {
      if (this._menuOuvert?.m !== m) return;
      m.remove(); this._menuOuvert = null;
      window.removeEventListener("pointerdown", dehors, true);
      btn.setAttribute("aria-expanded", "false");
      if (rendre) btn.focus();
    };
    const dehors = (e) => { const ch = e.composedPath(); if (!ch.includes(m) && !ch.includes(btn)) fermer(false); };
    window.addEventListener("pointerdown", dehors, true);
    this._menuOuvert = { m, btn, fermer };
    m.onkeydown = (e) => {
      const i = boutons.indexOf(this.R.activeElement), n = boutons.length;
      const j = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (j != null) { e.preventDefault(); boutons[j].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fermer(true); }
      else if (e.key === "Tab") { e.preventDefault(); fermer(true); }
    };
    m.onclick = (e) => {
      const b = e.composedPath().find((x) => x.dataset?.menu != null);
      if (!b) return;
      fermer(false);
      items[+b.dataset.menu].action();
      // le bouton d'origine (redessiné avec la barre) garde le focus, sauf si l'action l'a pris ailleurs (panneau, dialogue)
      const a = this.R.activeElement;
      if (!a || a === document.body || !a.isConnected) this.barre.querySelector(`[data-a="${btn.dataset.a}"]`)?.focus();
    };
    (boutons.find((b) => b.getAttribute("aria-checked") === "true") || boutons[0])?.focus();
  }
  _fermerMenu() { this._menuOuvert?.fermer(false); }

  _info(txt) {
    const el = this.barre.querySelector(".ed-info");
    if (el) el.textContent = ""; // état « modifié » : point sur le bouton Enregistrer (pas de texte en doublon)
    if (txt == null) return;
    // cotes près du curseur : la barre d'outils ne change jamais de hauteur pendant un tracé
    const plan = this.R.querySelector(".plan");
    if (!plan || !this._xy) return;
    let b = plan.querySelector(".ed-bulle");
    if (!b) { b = document.createElement("div"); b.className = "ed-bulle"; plan.append(b); }
    const r = plan.getBoundingClientRect(), z = this.carte._zVue || 1;
    b.hidden = !txt;
    b.textContent = txt;
    const x = (this._xy[0] - r.left) / z + 16, y = (this._xy[1] - r.top) / z + 18;
    b.style.left = `${Math.max(4, Math.min(x, plan.clientWidth - b.offsetWidth - 8))}px`;
    b.style.top = `${Math.max(4, Math.min(y, plan.clientHeight - b.offsetHeight - 8))}px`;
  }

  choisirOutil(o, garderModele = false) {
    if (o !== "rectangle") this.sousZoneEnAttente = null;
    this._fermerAide();
    this._finirTrace();
    this._info("");
    if (o !== "selection" && !this.replie && this.R.querySelector("ha-card")?.classList.contains("ed-etroit")) this.replier(true);
    this.outil = o; this.aPlacer = null;
    if (!garderModele) { this.modeleOuverture = null; this.aCompleter = null; this.chercherOuv = null; this.prefOuv = null; }
    if (o !== "piece" && o !== "rectangle") this.zoneEnAttente = null;
    this.zone.classList.toggle("dessin", o !== "selection");
    this._barre();
    const tactile = matchMedia("(pointer: coarse)").matches;
    const aides = { mur: tactile ? _t("Touche ou clique pour enchaîner les murs ; « Terminer » pour finir.") : _t("Touche ou clique pour enchaîner les murs ; Échap, Entrée ou clic droit pour finir."),
      rectangle: _t("Clique un coin puis le coin opposé : la pièce et ses murs sont créés, les cotes s'affichent près du curseur."), limite: _t("Comme les murs, en trait de clôture."),
      ouverture: _t("Clique les deux extrémités sur un mur."), piece: tactile ? _t("Clique les sommets ; reclique le premier ou « Terminer » pour fermer.") : _t("Clique les sommets ; reclique le premier (ou Entrée) pour fermer."), texte: this._texteInfos ? _t("Clique où placer la zone d'informations.") : _t("Clique où placer le texte.") };
    if (aides[o]) this._aide(aides[o]);
    this.apresConstruction();
  }

  // ---------- historique ----------
  _instantane() { this.histo.push(JSON.stringify(this.d)); if (this.histo.length > 150) this.histo.shift(); this.refaire = []; }
  _applique(json) { const d = JSON.parse(json); Object.keys(this.d).forEach((k) => delete this.d[k]); Object.assign(this.d, d); }
  // config interne gardée dans ce navigateur (brouillon, copie d'avant nettoyage) : relue comme un plan importé (même normalisation,
  // valeurs invalides retirées), jamais posée telle quelle
  _relire(json) {
    const N = customElements.get("maquette-card").normaliser;
    try { const o = JSON.parse(json); return JSON.stringify(N(o && typeof o === "object" && !Array.isArray(o) ? o : {})); } catch (e) { return JSON.stringify(N({})); }
  }
  annuler() { if (!this.histo.length) return; this.refaire.push(JSON.stringify(this.d)); this._applique(this.histo.pop()); this._valide(); this._apres(true); }
  retablir() { if (!this.refaire.length) return; this.histo.push(JSON.stringify(this.d)); this._applique(this.refaire.pop()); this._valide(); this._apres(true); }
  _valide() {
    const n = { point: this.d.points, texte: this.d.textes, piece: this.d.pieces, mur: this.d.murs, limite: this.d.limites, ouverture: this.d.ouvertures, meuble: this.d.meubles };
    if (this.sel?.type === "widget") { if (!this._wl(this.sel)?.[this.sel.i]) this.sel = null; return; }
    if (this.sel?.type === "puce") { if (!this._puces()[this.sel.i]) this.sel = null; return; }
    if (this.sel && !(n[this.sel.type] || [])[this.sel.i]) this.sel = null;
  }
  _wl(s, creer = false) {
    if (s.cote === "fiche") {
      const pf = porteur(s), m = pf && this.d[GENRES_FICHE[pf.genre]]?.[pf.i];
      if (!m) return null;
      if (creer) { if (!m.fiche || typeof m.fiche !== "object") m.fiche = {}; return (m.fiche.widgets ||= []); }
      return m.fiche?.widgets || null;
    }
    const base = s.piece != null ? this.d.pieces[s.piece] : this.d;
    if (!base) return null;
    if (creer) { base.panneaux ||= {}; return (base.panneaux[s.cote] ||= []); }
    return base.panneaux?.[s.cote] || null;
  }
  _elt(k) {
    const [ty, a, b] = k.split(":"), d = this.d;
    if (ty === "widget") { const s = deCle(k); return this._wl(s)?.[s.i]; }
    return ({ point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles, puce: this._puces() }[ty] || [])[+a];
  }
  _apres(sansHisto) {
    this.multi = new Set([...this.multi].filter((k) => this._elt(k)));
    if (!this.sel) this.multi.clear(); else if (!this.multi.has(cle(this.sel))) this.multi = new Set([cle(this.sel)]);
    if (this.d.groupes || this._toutesCles().some((k) => this._gr(k))) this._nettoyerGroupes();
    this.modifie = JSON.stringify(this.d) !== JSON.stringify(this.original);
    this._boite();
    try { if (this.modifie) localStorage.setItem(this._cle(), JSON.stringify(this.d)); else localStorage.removeItem(this._cle()); } catch (e) { /* stockage indisponible */ }
    // langue de la carte changée (panneau Paramètres, annuler / rétablir) : carte et éditeur passent tout de suite dans la nouvelle langue
    if (suivreLangue(this.carte, this.d)) this._etatRepli();
    this.carte._construire();
    this._barre();
    this._panneau();
  }
  commit(fn) { this._instantane(); fn(); this._apres(); }
  // « Annuler » d'une notification : n'annule que si rien n'a été fait depuis
  _annulation() {
    const marque = this.histo.length;
    return () => (this.histo.length === marque ? this.annuler() : this.snack(_t("D'autres modifications ont suivi : Ctrl+Z (ou la flèche d'annulation) pour revenir en arrière pas à pas.")));
  }

  _proposerBrouillon() {
    let b = null;
    try { b = localStorage.getItem(this._cle()); } catch (e) { /* stockage indisponible */ }
    if (b && b !== JSON.stringify(this.original)) {
      this.snack(_t("Un brouillon non enregistré existe."), [[_t("Reprendre"), () => { this._instantane(); this._applique(this._relire(b)); this._valide(); this._apres(); }],
        [_t("Supprimer"), () => { try { localStorage.removeItem(this._cle()); } catch (e) { /* stockage indisponible */ } this.snack(_t("Brouillon supprimé.")); }]], 20000);
    }
  }

  // ---------- rendu des aides d'édition dans le SVG ----------
  apresConstruction() {
    const svg = this.R.querySelector(".zone svg");
    if (!svg) return;
    this.echelle = svg.clientWidth / this.carte.vue().W || 1;
    const k = 1 / this.echelle, d = this.d, { x0, y0, W, H } = this.carte._box;
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", "ed");
    let h = `<defs><pattern id="ed-g1" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="var(--md-on-surface)" stroke-width="${0.6 * k}" opacity=".12"/></pattern>
      <pattern id="ed-g2" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#ed-g1)"/><path d="M100 0H0V100" fill="none" stroke="var(--md-on-surface)" stroke-width="${1 * k}" opacity=".2"/></pattern></defs>
      <rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="url(#ed-g2)" pointer-events="none"/>`;
    const cible = (liste, i, s) => `<path class="ed-cible" data-c="${liste}:${i}" d="M${s[0]} ${s[1]}L${s[2]} ${s[3]}" stroke-width="${22 * k}"/>`;
    const Q = this.carte._calques(), libre = (k) => !Q.masques.has(k) && !Q.verrous.has(k);
    if (libre("murs")) (d.murs || []).forEach((s, i) => { h += cible("mur", i, s); });
    if (libre("limites")) (d.limites || []).forEach((s, i) => { h += cible("limite", i, s); });
    if (libre("ouvertures")) (d.ouvertures || []).forEach((o, i) => { h += cible("ouverture", i, o.seg); });
    const poignee = (x, y, ref, r = 7) => `<circle class="ed-poignee" data-poignee="${ref}" cx="${x}" cy="${y}" r="${r * k}" stroke-width="${2.5 * k}"/>`;
    const s = this.multi.size > 1 ? null : this.sel;
    if (this.multi.size > 1) for (const kk of this.multi) {
      const m = deCle(kk);
      if (["mur", "limite", "ouverture"].includes(m.type)) { const sg = m.type === "ouverture" ? d.ouvertures[m.i].seg : this._liste(m.type)[m.i]; h += `<path class="ed-sel" d="M${sg[0]} ${sg[1]}L${sg[2]} ${sg[3]}" stroke-width="${4 * k}"/>`; }
      if (m.type === "piece") h += `<polygon class="ed-poly-sel" points="${d.pieces[m.i].poly.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
    }
    if (s && ["mur", "limite", "ouverture"].includes(s.type)) {
      const seg = s.type === "ouverture" ? d.ouvertures[s.i].seg : this._liste(s.type)[s.i];
      h += `<path class="ed-sel" d="M${seg[0]} ${seg[1]}L${seg[2]} ${seg[3]}" stroke-width="${3 * k}"/>`;
      h += poignee(seg[0], seg[1], `bout:${s.type}:${s.i}:0`) + poignee(seg[2], seg[3], `bout:${s.type}:${s.i}:1`);
    }
    const cadreMeuble = (m) => { const [w, h] = m.taille || MEUBLES()[m.type]?.taille || [60, 60];
      return `<g transform="translate(${nbr(m.pos[0])} ${nbr(m.pos[1])}) rotate(${nbr(m.rotation)})"><rect class="ed-poly-sel" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" stroke-width="${2 * k}"/></g>`; };
    if (this.multi.size > 1) for (const kk of this.multi) { const m = deCle(kk); if (m.type === "meuble" && d.meubles?.[m.i]) h += cadreMeuble(d.meubles[m.i]); }
    if (s && s.type === "meuble" && d.meubles?.[s.i]) {
      const m = d.meubles[s.i], [w, hh] = m.taille || MEUBLES()[m.type]?.taille || [60, 60], th = (nbr(m.rotation) * Math.PI) / 180, mx = m.miroir ? -1 : 1;
      h += cadreMeuble(m);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const lx = ((sx * w) / 2) * mx, ly = (sy * hh) / 2;
        h += poignee(m.pos[0] + lx * Math.cos(th) - ly * Math.sin(th), m.pos[1] + lx * Math.sin(th) + ly * Math.cos(th), `coin:${s.i}:${sx}:${sy}`);
      }
    }
    if (this.aPlacerMeuble && !matchMedia("(pointer: coarse)").matches) h += `<g class="ed-fantome" visibility="hidden">${this.carte.constructor.dessinMeuble({ ...this.aPlacerMeuble, pos: [0, 0] })}</g>`;
    if (s && s.type === "piece") {
      const poly = d.pieces[s.i].poly;
      h += `<polygon class="ed-poly-sel" points="${poly.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
      poly.forEach((p, j) => {
        const q = poly[(j + 1) % poly.length];
        h += `<circle class="ed-milieu" data-poignee="milieu:${s.i}:${j}" cx="${(p[0] + q[0]) / 2}" cy="${(p[1] + q[1]) / 2}" r="${5 * k}"><title>${_t("Ajouter un sommet")}</title></circle>`;
      });
      poly.forEach((p, j) => { h += poignee(p[0], p[1], `sommet:${s.i}:${j}`); });
    }
    if (this.trace.length) {
      h += `<polyline class="ed-trace" points="${this.trace.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
      this.trace.forEach((p) => { h += `<circle class="ed-trace-pt" cx="${p[0]}" cy="${p[1]}" r="${4 * k}"/>`; });
    }
    h += `<rect class="ed-trace ed-rect" x="0" y="0" width="0" height="0" stroke-width="${2.5 * k}" visibility="hidden"/>
      <line class="ed-trace ed-elastique" x1="0" y1="0" x2="0" y2="0" stroke-width="${2.5 * k}" visibility="hidden"/>
      <circle class="ed-curseur-pt" r="${6 * k}" stroke-width="${2 * k}" visibility="hidden"/>`;
    poserHTML(g, h);
    svg.append(g);
    this.R.querySelectorAll(".calque>.sel").forEach((n) => n.classList.remove("sel"));
    for (const kk of this.multi) {
      const m = deCle(kk), q = { point: `[data-q="${m.i}"]`, texte: `[data-t="${m.i}"]`, piece: `[data-l="${m.i}"]` }[m.type];
      if (q) this.R.querySelector(`.calque>${q}`)?.classList.add("sel");
    }
    this.zone.classList.toggle("dessin", this.outil !== "selection" || !!this.aPlacer);
    // « Terminer » : seule façon de finir un tracé au doigt (pas d'Échap ni de clic droit)
    let fin = this.R.querySelector(".ed-terminer");
    const montrer = this.trace.length && ["mur", "limite", "piece"].includes(this.outil);
    if (montrer && !fin) {
      fin = document.createElement("button");
      fin.className = "ed-btn plein ed-terminer";
      poserHTML(fin, `<ha-icon icon="mdi:check"></ha-icon>${_t("Terminer")}`);
      fin.onclick = (e) => { e.stopPropagation(); this._finirTrace(); };
      this.R.querySelector(".plan").append(fin);
    } else if (!montrer) fin?.remove();
    if (!this._panneauFait) { this._panneauFait = true; this._panneau(); }
  }

  _liste(type) { return { mur: (this.d.murs ||= []), limite: (this.d.limites ||= []) }[type]; }

  // ---------- magnétisme ----------
  _sommets(exclu) {
    const l = [], d = this.d;
    (d.murs || []).forEach((s, i) => { if (exclu !== `mur:${i}`) l.push([s[0], s[1]], [s[2], s[3]]); });
    (d.limites || []).forEach((s, i) => { if (exclu !== `limite:${i}`) l.push([s[0], s[1]], [s[2], s[3]]); });
    (d.ouvertures || []).forEach((o, i) => { if (exclu !== `ouverture:${i}`) l.push([o.seg[0], o.seg[1]], [o.seg[2], o.seg[3]]); });
    d.pieces.forEach((p, i) => { if (exclu !== `piece:${i}`) l.push(...p.poly); });
    this.trace.forEach((p) => l.push(p));
    return l;
  }
  aimante(p, ev, { exclu, depuis } = {}) {
    if (ev?.altKey) return p.map(arr);
    let [x, y] = p;
    if (depuis && !ev?.shiftKey) {
      const dx = x - depuis[0], dy = y - depuis[1];
      if (Math.abs(dx) < Math.abs(dy) * 0.27) x = depuis[0];
      else if (Math.abs(dy) < Math.abs(dx) * 0.27) y = depuis[1];
    }
    const seuil = 12 / this.echelle;
    let best = null, bd = seuil;
    for (const q of this._sommets(exclu)) {
      const dd = Math.hypot(q[0] - x, q[1] - y);
      if (dd < bd) { bd = dd; best = q; }
    }
    if (best) return [best[0], best[1]];
    const g = this.grille;
    const sx = depuis && x === depuis[0] ? x : Math.round(x / g) * g, sy = depuis && y === depuis[1] ? y : Math.round(y / g) * g;
    return [arr(sx), arr(sy)];
  }

  // ---------- pointeur ----------
  _survolPlan(ev) {
    if (this._glisse) return;
    const p = this.carte.cm(ev);
    const fa = this.aPlacerMeuble && this.R.querySelector(".zone svg .ed-fantome");
    if (fa) { const q = this._grille(p, ev); fa.setAttribute("transform", `translate(${q[0]} ${q[1]})`); fa.setAttribute("visibility", "visible"); }
    const dessin = this.outil !== "selection" || this.aPlacer;
    const svg = this.R.querySelector(".zone svg .ed");
    if (!svg) return;
    const el = svg.querySelector(".ed-elastique"), cur = svg.querySelector(".ed-curseur-pt");
    if (dessin) {
      const dep = this.trace[this.trace.length - 1];
      const q = this.aimante(p, ev, { depuis: dep });
      cur.setAttribute("cx", q[0]); cur.setAttribute("cy", q[1]); cur.setAttribute("visibility", "visible");
      const rc = svg.querySelector(".ed-rect");
      if (dep && this.outil === "rectangle") {
        const x = Math.min(dep[0], q[0]), y = Math.min(dep[1], q[1]), w = Math.abs(q[0] - dep[0]), hh = Math.abs(q[1] - dep[1]);
        Object.entries({ x, y, width: w, height: hh, visibility: "visible" }).forEach(([a, v]) => rc.setAttribute(a, v));
        el.setAttribute("visibility", "hidden");
        this._info(`${fmt(w / 100, 2)} × ${fmt(hh / 100, 2)} m · ${fmt((w * hh) / 10000, 1)} m²`);
      } else if (dep) {
        rc.setAttribute("visibility", "hidden");
        el.setAttribute("x1", dep[0]); el.setAttribute("y1", dep[1]); el.setAttribute("x2", q[0]); el.setAttribute("y2", q[1]); el.setAttribute("visibility", "visible");
        const tr = this.outil === "piece" ? [...this.trace, q] : null;
        this._info(`${_t("longueur {v} m", { v: fmt(Math.hypot(q[0] - dep[0], q[1] - dep[1]) / 100, 2) })}${tr && tr.length >= 3 ? ` · ${fmt(aire(tr), 1)} m²` : ""}`);
      } else this._info(`x ${fmt(q[0], 0)} · y ${fmt(q[1], 0)} cm`);
    } else {
      cur.setAttribute("visibility", "hidden"); el.setAttribute("visibility", "hidden");
      svg.querySelector(".ed-rect")?.setAttribute("visibility", "hidden");
      this._info("");
    }
  }

  _pointeurBas(ev) {
    if (ev.button !== 0) return;
    // geste en cours (jusqu'au relâchement) : l'affichage ou le retrait du panneau attend la fin (voir _majHote)
    this._geste = true;
    const fin = () => {
      window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
      setTimeout(() => { this._geste = false; if (this._hoteEnAttente) { this._hoteEnAttente = false; this._majHote(); } });
    };
    window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
    const p = this.carte.cm(ev);
    if (this.aPlacerMeuble) {
      const m = { ...this.aPlacerMeuble, pos: this._grille(p, ev) }, pre = this._meublePre;
      this.aPlacerMeuble = null; this._meublePre = null;
      this._fermerAide();
      this.commit(() => { (this.d.meubles ||= []).push(m); this.sel = { type: "meuble", i: this.d.meubles.length - 1 }; });
      if (pre) this._preRemplirMeuble(this.d.meubles.length - 1, pre);
      this._deplier();
      this.zone.classList.remove("dessin");
      return;
    }
    if (this.aPlacer) {
      const pos = this.aimante(p, ev);
      const pt = { ...this.aPlacer, pos }, aFaire = this.aCompleter;
      this.aPlacer = null; this.aCompleter = null;
      if (aFaire?.length) setTimeout(() => this.snack(_t("À compléter dans le panneau : {l}.", { l: aFaire.map((x) => (A_COMPLETER[x] ? _t(A_COMPLETER[x]) : x)).join(", ") })), 50);
      if (aFaire?.length) this._aFaire = { cle: `point:${this.d.points?.length || 0}`, champs: new Set(aFaire) };
      this.commit(() => { (this.d.points ||= []).push(pt); this._rattacher(pt); this.sel = { type: "point", i: this.d.points.length - 1 }; });
      this.zone.classList.remove("dessin");
      return;
    }
    if (this.outil !== "selection") { ev.preventDefault(); this._clicDessin(p, ev); return; }
    const chemin = ev.composedPath();
    if (this.espace) { ev.preventDefault(); this.carte.debutPan(ev); return; }
    const el = chemin.find((n) => n.dataset && (n.dataset.poignee || n.dataset.q || n.dataset.t || n.dataset.l || n.dataset.c || n.dataset.o || n.dataset.mb || n.dataset.p));
    const mod = ev.ctrlKey || ev.metaKey || ev.shiftKey;
    if (!el) { ev.preventDefault(); if (!mod) this.selectionner(null); return this._cadre(ev, mod); }
    const ds = el.dataset;
    ev.preventDefault();
    if (!ds.poignee) {
      let s = null;
      if (ds.q != null) s = { type: "point", i: +ds.q };
      else if (ds.t != null) s = { type: "texte", i: +ds.t };
      else if (ds.l != null) s = { type: "piece", i: +ds.l };
      else if (ds.c) { const [type, i] = ds.c.split(":"); s = { type, i: +i }; }
      else if (ds.o != null) s = { type: "ouverture", i: +ds.o };
      else if (ds.mb != null) s = { type: "meuble", i: +ds.mb };
      else if (ds.p != null) s = { type: "piece", i: +ds.p };
      if (s && mod) return this.basculerSel(s);
      // élément d'un groupe : le premier clic prend tout le groupe (glisser = déplacer le groupe), un clic sans glisser sur le groupe déjà pris entre dedans
      const gr = s && this._gr(cle(s));
      if (gr) {
        const membres = this._membres(gr), pris = membres.length === this.multi.size && membres.every((k) => this.multi.has(k));
        if (!pris) { this.sel = s; this.multi = new Set(membres); this.carte._construire(); this._panneau(); return this._glisser(ev, { genre: "groupe" }); }
        return this._glisser(ev, { genre: "groupe", surClic: () => this.selectionner(s) });
      }
      if (s && this.multi.size > 1 && this.multi.has(cle(s))) return this._glisser(ev, { genre: "groupe" });
    }
    if (ds.poignee) {
      const [genre, a, b, c] = ds.poignee.split(":");
      if (genre === "milieu") {
        const i = +a, j = +b, poly = this.d.pieces[i].poly, q = poly[(j + 1) % poly.length];
        this.commit(() => poly.splice(j + 1, 0, [arr((poly[j][0] + q[0]) / 2), arr((poly[j][1] + q[1]) / 2)]));
        return this._glisser(ev, { genre: "sommet", i, j: j + 1 });
      }
      if (genre === "sommet") return this._glisser(ev, { genre: "sommet", i: +a, j: +b });
      if (genre === "bout") return this._glisser(ev, { genre: "bout", type: a, i: +b, bout: +c });
      if (genre === "coin") return this._glisser(ev, { genre: "coin", i: +a, sx: +b, sy: +c });
    }
    if (ds.q != null) { this.selectionner({ type: "point", i: +ds.q }); return this._glisser(ev, { genre: "html", type: "point", i: +ds.q, el }); }
    if (ds.t != null) { this.selectionner({ type: "texte", i: +ds.t }); return this._glisser(ev, { genre: "html", type: "texte", i: +ds.t, el }); }
    // sous-zone déjà sélectionnée : un 2e clic (sans glisser) passe à la pièce qui la contient (atteignable même entièrement recouverte)
    const parent = (i) => (this.sel?.type === "piece" && this.sel.i === i && this.d.pieces[i]?.sous_zone ? () => { const j = this._parentZone(i); if (j >= 0) this.selectionner({ type: "piece", i: j }); } : null);
    if (ds.l != null) { const surClic = parent(+ds.l); this.selectionner({ type: "piece", i: +ds.l }); return this._glisser(ev, { genre: "html", type: "etiquette", i: +ds.l, el: this.R.querySelector(`.calque>[data-l="${ds.l}"]`), surClic }); }
    if (ds.c) { const [type, i] = ds.c.split(":"); this.selectionner({ type, i: +i }); return this._glisser(ev, { genre: "segment", type, i: +i }); }
    if (ds.o != null) { this.selectionner({ type: "ouverture", i: +ds.o }); return this._glisser(ev, { genre: "segment", type: "ouverture", i: +ds.o }); }
    if (ds.mb != null) { this.selectionner({ type: "meuble", i: +ds.mb }); return this._glisser(ev, { genre: "meuble", i: +ds.mb }); }
    if (ds.p != null) {
      const deja = this.sel?.type === "piece" && this.sel.i === +ds.p, surClic = parent(+ds.p);
      this.selectionner({ type: "piece", i: +ds.p });
      if (deja) return this._glisser(ev, { genre: "piece", i: +ds.p, surClic });
    }
  }

  _glisser(ev, g) {
    const debut = this.carte.cm(ev), avant = JSON.stringify(this.d);
    let bouge = false, raf = 0;
    const origine = clone(this.d);
    this._glisse = true;
    const segDe = (d, type, i) => (type === "ouverture" ? d.ouvertures[i].seg : (type === "mur" ? d.murs : d.limites)[i]);
    const move = (e) => {
      const p = this.carte.cm(e);
      const dx = p[0] - debut[0], dy = p[1] - debut[1];
      if (!bouge && Math.hypot(dx, dy) * this.echelle < 3) return;
      bouge = true;
      if (g.genre === "groupe") {
        const pas = e.altKey ? 0 : this.grille, ddx = pas ? Math.round(dx / pas) * pas : dx, ddy = pas ? Math.round(dy / pas) * pas : dy;
        for (const k of this.multi) this._translater(k, ddx, ddy, origine);
        this._info(_t("déplacement {x} × {y} cm", { x: fmt(ddx, 0), y: fmt(ddy, 0) }));
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.carte._construire(); });
        return;
      }
      if (g.genre === "html") {
        const src = g.type === "point" ? origine.points[g.i].pos : g.type === "texte" ? origine.textes[g.i].pos : origine.pieces[g.i].etiquette;
        const q = this.aimante([src[0] + dx, src[1] + dy], e);
        const { x0, y0, W, H } = this.carte.vue();
        g.el.style.left = `${((q[0] - x0) / W) * 100}%`; g.el.style.top = `${((q[1] - y0) / H) * 100}%`;
        g.dest = q;
        this._info(`x ${fmt(q[0], 0)} · y ${fmt(q[1], 0)} cm`);
        return;
      }
      if (g.genre === "sommet") {
        this.d.pieces[g.i].poly[g.j] = this.aimante(p, e, { exclu: `piece:${g.i}` });
      } else if (g.genre === "bout") {
        const s = segDe(this.d, g.type, g.i), o = segDe(origine, g.type, g.i);
        const autre = g.bout === 0 ? [o[2], o[3]] : [o[0], o[1]];
        const q = this.aimante(p, e, { exclu: `${g.type}:${g.i}`, depuis: autre });
        if (g.bout === 0) { s[0] = q[0]; s[1] = q[1]; } else { s[2] = q[0]; s[3] = q[1]; }
        this._info(_t("longueur {v} m", { v: fmt(Math.hypot(s[2] - s[0], s[3] - s[1]) / 100, 2) }));
      } else if (g.genre === "segment") {
        const s = segDe(this.d, g.type, g.i), o = segDe(origine, g.type, g.i);
        const q = this.aimante([o[0] + dx, o[1] + dy], e, { exclu: `${g.type}:${g.i}` });
        const ddx = q[0] - o[0], ddy = q[1] - o[1];
        s.splice(0, 4, o[0] + ddx, o[1] + ddy, o[2] + ddx, o[3] + ddy);
      } else if (g.genre === "meuble") {
        const M = this.d.meubles[g.i], O = origine.meubles[g.i];
        const q = this._collerMurs(M, this._grille([O.pos[0] + dx, O.pos[1] + dy], e), e);
        M.pos = q.pos;
        this._info(q.mur ? _t("collé au mur") : `x ${fmt(M.pos[0], 0)} · y ${fmt(M.pos[1], 0)} cm`);
      } else if (g.genre === "coin") {
        const M = this.d.meubles[g.i], O = origine.meubles[g.i], def = MEUBLES()[O.type] || {};
        const [w0, h0] = O.taille || def.taille || [60, 60], th = (nbr(O.rotation) * Math.PI) / 180, co = Math.cos(th), si = Math.sin(th), mx = O.miroir ? -1 : 1;
        const loc = (x, y) => [((x - O.pos[0]) * co + (y - O.pos[1]) * si) * mx, -(x - O.pos[0]) * si + (y - O.pos[1]) * co];
        const pl = loc(p[0], p[1]), opp = [(-g.sx * w0) / 2, (-g.sy * h0) / 2], pas = e.altKey ? 1 : this.grille;
        let w = Math.min(5000, Math.max(10, Math.round(Math.abs(pl[0] - opp[0]) / pas) * pas)), h = Math.min(5000, Math.max(10, Math.round(Math.abs(pl[1] - opp[1]) / pas) * pas));
        if (def.rond || e.shiftKey) { const t = def.rond ? Math.max(w, h) : null; if (t) w = h = t; else { const k = Math.max(w / w0, h / h0); w = Math.round(w0 * k); h = Math.round(h0 * k); } }
        const cl = [opp[0] + (g.sx * w) / 2, opp[1] + (g.sy * h) / 2], cx = cl[0] * mx;
        M.taille = [w, h];
        M.pos = [arr(O.pos[0] + cx * co - cl[1] * si), arr(O.pos[1] + cx * si + cl[1] * co)];
        this._info(def.rond ? `Ø ${fmt(w, 0)} cm` : `${fmt(w, 0)} × ${fmt(h, 0)} cm`);
      } else if (g.genre === "piece") {
        const P = this.d.pieces[g.i], O = origine.pieces[g.i];
        const q = this.aimante([O.poly[0][0] + dx, O.poly[0][1] + dy], e, { exclu: `piece:${g.i}` });
        const ddx = q[0] - O.poly[0][0], ddy = q[1] - O.poly[0][1];
        (g.meubles ||= this._meublesDans(O.poly, origine)).forEach((j) => { this.d.meubles[j].pos = [arr(origine.meubles[j].pos[0] + ddx), arr(origine.meubles[j].pos[1] + ddy)]; });
        (g.zones ||= this._sousZonesDans(g.i, origine)).forEach((j) => this._bougerZone(j, ([x, y]) => [arr(x + ddx), arr(y + ddy)], origine));
        P.poly = O.poly.map(([x, y]) => [arr(x + ddx), arr(y + ddy)]);
        if (O.etiquette) P.etiquette = [arr(O.etiquette[0] + ddx), arr(O.etiquette[1] + ddy)];
      }
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.carte._construire(); });
    };
    const fin = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      this._glisse = false;
      this._finGlisse = null;
    };
    // pincement à deux doigts pendant le glisser (annulerGlisse) : l'élément revient à sa place, rien n'entre dans l'historique
    this._finGlisse = () => { fin(); if (bouge) { this._applique(avant); this.carte._construire(); } };
    const up = () => {
      fin();
      if (!bouge) { g.surClic?.(); return; }
      if (g.genre === "groupe") for (const k of this.multi) if (k.startsWith("point:")) this._rattacher(this._elt(k));
      if (g.genre === "html" && g.dest) {
        if (g.type === "point") { this.d.points[g.i].pos = g.dest; this._rattacher(this.d.points[g.i]); }
        else if (g.type === "texte") this.d.textes[g.i].pos = g.dest;
        else this.d.pieces[g.i].etiquette = g.dest;
      }
      this.histo.push(avant); this.refaire = [];
      this._apres();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  // glisser ou cadre de sélection en cours abandonné (pincement à deux doigts sur le plan, appelé par la carte)
  annulerGlisse() { this._finGlisse?.(); }

  _double(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.poignee);
    if (this.outil !== "selection") { this._finirTrace(); return; }
    if (!el) return;
    const [genre, a, b] = el.dataset.poignee.split(":");
    if (genre === "sommet" && this.d.pieces[+a].poly.length > 3) this.commit(() => this.d.pieces[+a].poly.splice(+b, 1));
  }

  // rattache un point à sa pièce (halo limité aux murs)
  _rattacher(pt) {
    if (!pt.halo) return;
    const pc = [...this.d.pieces].reverse().find((p) => dansPoly(pt.pos, p.poly));
    if (pc) pt.piece = pc.nom; else delete pt.piece;
  }

  // ---------- dessin ----------
  _clicDessin(p, ev) {
    const dep = this.trace[this.trace.length - 1];
    const q = this.aimante(p, ev, { depuis: dep });
    const o = this.outil;
    if (dep && q[0] === dep[0] && q[1] === dep[1]) return;
    if (o === "texte") {
      const infos = this._texteInfos;
      this._texteInfos = false;
      this.commit(() => { (this.d.textes ||= []).push(infos ? { t: _t("Informations"), pos: q, infos: [] } : { t: _t("Texte"), pos: q }); this.sel = { type: "texte", i: this.d.textes.length - 1 }; });
      this.choisirOutil("selection");
      if (infos) setTimeout(() => this._action("info-ajout"), 50);
      else setTimeout(() => this.panneau.querySelector('input[data-k="t"]')?.select(), 50);
      return;
    }
    if (o === "rectangle" && dep) {
      const [x1, y1] = dep, [x2, y2] = q;
      if (x1 === x2 || y1 === y2) return;
      this.trace = [];
      this.creerRectangle(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      return;
    }
    if (o === "piece" && this.trace.length >= 3) {
      const [fx, fy] = this.trace[0];
      if (Math.hypot(q[0] - fx, q[1] - fy) * this.echelle < 12) return this._finirTrace();
    }
    if ((o === "mur" || o === "limite") && dep) {
      if (q[0] === dep[0] && q[1] === dep[1]) return;
      this.commit(() => this._liste(o).push([dep[0], dep[1], q[0], q[1]]));
    }
    if (o === "ouverture" && dep) {
      const [dx, dy] = [q[0] - dep[0], q[1] - dep[1]], seg = [dep[0], dep[1], q[0], q[1]];
      // côté extérieur : à l'opposé de la pièce intérieure bordée (mur extérieur), sinon vers le haut ou la gauche
      const dehors = this._dehorsAuto(seg, Math.abs(dx) >= Math.abs(dy) ? [0, -1] : [-1, 0]);
      this.trace = [];
      const base = this.modeleOuverture ? clone(this.modeleOuverture) : { type: "fenetre" }, aFaire = this.aCompleter, chercher = this.chercherOuv, pref = this.prefOuv;
      this.modeleOuverture = null; this.aCompleter = null; this.chercherOuv = null; this.prefOuv = null;
      const ob = { ...base, seg, dehors };
      this.choisirOutil("selection");
      // capteurs voulus : cherchés parmi les entités libres de la pièce (une seule = reliée d'office, plusieurs = petite liste,
      // aucune = champ « à compléter ») ; l'ouverture est posée une fois les choix faits
      (async () => {
        const r = aFaire?.length || chercher?.length ? await this._preRemplirOuverture(ob, { champs: aFaire || [], chercher: chercher || [], pref }) : { manquants: new Set(), relies: [] };
        if (r.manquants.size) this._aFaire = { cle: `ouverture:${this.d.ouvertures?.length || 0}`, champs: r.manquants };
        this.commit(() => { (this.d.ouvertures ||= []).push(ob); this.sel = { type: "ouverture", i: this.d.ouvertures.length - 1 }; });
        if (r.manquants.size) this.snack(_t("À compléter dans le panneau : {l}.", { l: [...r.manquants].map((x) => (A_COMPLETER[x] ? _t(A_COMPLETER[x]) : x)).join(", ") }));
        else if (r.relies.length) this.snack(_t("Relié : {l}.", { l: r.relies.map((e) => this.carte._nom(e)).join(", ") }));
      })();
      return;
    }
    this.trace.push(q);
    this.carte._construire();
  }

  // ---------- meubles ----------
  // meubles dont le centre est dans un contour (ils suivent la pièce quand on la déplace ou la redimensionne)
  _meublesDans(poly, src = this.d) {
    return (src.meubles || []).map((m, j) => (dansPoly(m.pos, poly) ? j : -1)).filter((j) => j >= 0);
  }
  // sous-zones d'une pièce ou d'une sous-zone (centre de leurs sommets dedans ; dans une sous-zone, seulement les plus petites) : elles la suivent comme ses meubles
  _sousZonesDans(i, src = this.d) {
    const P = src.pieces[i];
    if (!P) return [];
    const a = P.sous_zone ? aire(P.poly) : Infinity;
    return src.pieces.map((z, j) => { if (j === i || !z.sous_zone || aire(z.poly) >= a) return -1; const c = [z.poly.reduce((a, q) => a + q[0], 0) / z.poly.length, z.poly.reduce((a, q) => a + q[1], 0) / z.poly.length]; return dansPoly(c, P.poly) ? j : -1; }).filter((j) => j >= 0);
  }
  // pièce (ou sous-zone plus grande) la plus petite qui contient le centre de la sous-zone i ; -1 s'il n'y en a pas
  _parentZone(i) {
    const z = this.d.pieces[i], c = centre(z.poly), a = aire(z.poly);
    let best = -1, ba = Infinity;
    this.d.pieces.forEach((p, j) => { const ap = aire(p.poly); if (j !== i && (ap > a || (ap === a && !p.sous_zone)) && ap < ba && dansPoly(c, p.poly)) { best = j; ba = ap; } });
    return best;
  }
  _bougerZone(j, T, src = this.d) { const z = this.d.pieces[j], o = src.pieces[j]; z.poly = o.poly.map(T); if (o.etiquette) z.etiquette = T(o.etiquette); }
  // demi-emprise [x, y] d'un meuble tourné
  _emprise(m) {
    const [w, h] = m.taille || MEUBLES()[m.type]?.taille || [60, 60], th = (nbr(m.rotation) * Math.PI) / 180, c = Math.abs(Math.cos(th)), si = Math.abs(Math.sin(th));
    return [(c * w + si * h) / 2, (si * w + c * h) / 2];
  }
  _grille(p, ev) { const g = ev?.altKey ? 1 : this.grille; return [arr(Math.round(p[0] / g) * g), arr(Math.round(p[1] / g) * g)]; }
  // aimantation douce : un bord du meuble (emprise tournée) qui passe à moins de 12 px d'un mur droit s'y colle, côté où il se trouve ;
  // un meuble qui chevauche le mur (poussé dedans) est repoussé du côté de son centre
  _collerMurs(m, pos, ev) {
    if (ev?.altKey) return { pos };
    const [hx, hy] = this._emprise(m), seuil = 12 / (this.echelle || 1), e = 4.5;
    let [x, y] = pos, mur = false, bx = seuil, by = seuil;
    for (const sg of this.d.murs || []) {
      // bord collé du côté où se trouve le centre ; s'il chevauche le mur, quelle que soit la distance
      const coller = (v, c, demi, b) => {
        const cible = c + (v >= c ? 1 : -1) * (e + demi), dans = Math.abs(v - c) < demi + e, dd = Math.abs(v - cible);
        return dans || dd < b ? [cible, dans ? 0 : dd] : null;
      };
      if (sg[0] === sg[2] && Math.min(sg[1], sg[3]) < y + hy && Math.max(sg[1], sg[3]) > y - hy) { const r = coller(pos[0], sg[0], hx, bx); if (r) { [x, bx] = r; mur = true; } }
      if (sg[1] === sg[3] && Math.min(sg[0], sg[2]) < x + hx && Math.max(sg[0], sg[2]) > x - hx) { const r = coller(pos[1], sg[1], hy, by); if (r) { [y, by] = r; mur = true; } }
    }
    return { pos: [arr(x), arr(y)], mur };
  }

  _panneauMeuble(o, supprimer) {
    const perso = o.type === "forme", L = MEUBLES(), def = L[o.type] || { nom: perso ? _t("Meuble personnalisé") : _t("Type inconnu ({t})", { t: o.type }), taille: [60, 60] }, [w, h] = o.taille || def.taille, rot = nbr(o.rotation);
    const nomDef = L[o.type] ? _t(def.nom) : def.nom; // nom du catalogue (traduit) ; o.nom est celui de l'utilisateur
    const mode = tactile() ? _t("Glisse-le pour le déplacer (il se colle aux murs proches), tire un coin pour changer sa taille.") : _t("Glisse-le pour le déplacer (il se colle aux murs proches, Alt pour l'en empêcher), tire un coin pour changer sa taille (Maj : proportions gardées).");
    return `<h3><ha-icon icon="mdi:sofa-outline"></ha-icon>${esc(o.nom || nomDef)}${bulleI(def.aide ? `${_t(def.aide)}. ${mode}` : mode)}</h3>
      ${this._champTexte(o.type === "espace" ? _t("Nom affiché") : _t("Nom (infobulle)"), "nom", o.nom, nomDef)}
      ${perso ? `<button type="button" class="ed-btn tonal ed-plein" data-act="atelier-meuble"><ha-icon icon="mdi:shape-outline"></ha-icon>${_t("Modifier la forme")}</button>`
        : `<div class="ed-champ"><label>${_t("Type")}</label><select data-k="type">${Object.entries(L).map(([t, x]) => `<option value="${esc(t)}" ${t === o.type ? "selected" : ""}>${esc(_t(x.cat))} · ${esc(_t(x.nom))}</option>`).join("")}${L[o.type] ? "" : `<option selected value="${esc(o.type)}">${esc(o.type)}</option>`}</select></div>`}
      ${def.rond ? this._champNombre(_t("Diamètre (cm)"), "_diametre", w, 1) : `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "taille.0", w, 1)}${this._champNombre(_t("Profondeur (cm)"), "taille.1", h, 1)}</div>`}
      ${def.chaises ? this._champNombre(_t("Chaises"), "chaises", o.chaises ?? def.chaises, 1) : ""}
      <div class="ed-champ"><label>${_t("Orientation")}</label><div class="ed-icones">
        <button data-act="rot:-15" title="${_t("Tourner de 15° à gauche")}"><ha-icon icon="mdi:rotate-left-variant"></ha-icon></button>
        <button data-act="rot:-90" title="${_t("Tourner de 90° à gauche")}"><ha-icon icon="mdi:rotate-left"></ha-icon></button>
        <button data-act="rot:90" title="${_t("Tourner de 90° à droite")}"><ha-icon icon="mdi:rotate-right"></ha-icon></button>
        <button data-act="rot:15" title="${_t("Tourner de 15° à droite")}"><ha-icon icon="mdi:rotate-right-variant"></ha-icon></button>
        ${def.rond ? "" : `<button data-act="miroir" class="${o.miroir ? "on" : ""}" title="${_t("Miroir (canapé d'angle gauche / droite…)")}"><ha-icon icon="mdi:flip-horizontal"></ha-icon></button>`}
        </div></div>
      <details class="ed-avance"><summary>${_t("Position")}</summary>
      ${this._champNombre(_t("Angle (°, 0 à 359)"), "_angle", rot, 1)}
      <div class="ed-ligne">${this._champNombre("x (cm)", "pos.0", o.pos[0], 1)}${this._champNombre("y (cm)", "pos.1", o.pos[1], 1)}</div></details>
      ${this._sectionConnecte(o, def)}
      ${o.entite || o.valeur || o.fiche ? this._sectionAnimation(o, "meuble", "animation", _t("Animation (actif)")) : ""}
      ${this._calqueNiveau(o)}
      <div class="ed-actions">${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${perso || o.type === "espace" ? "" : ibAct("atelier-meuble", "mdi:shape-outline", _t("Personnaliser la forme (atelier)"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : garder ce meuble à ces dimensions dans « Mes modèles »"))}${supprimer}</div>`;
  }

  // ---------- calques ----------
  _calqueDe(k) {
    const m = deCle(k);
    if (m.type === "piece") return this.d.pieces[m.i]?.sous_zone ? "sous_zones" : "pieces";
    return { point: "appareils", texte: "textes", mur: "murs", limite: "limites", ouverture: "ouvertures", meuble: "meubles" }[m.type] || null;
  }
  // élément sur un calque masqué ou verrouillé : ni cadre de sélection ni Ctrl+A
  _bloque(k, Q = this.carte._calques()) { const c = this._calqueDe(k); return !!c && (Q.masques.has(c) || Q.verrous.has(c)); }
  _calqueNiveau(o) {
    return `${this._inter(_t("Masquer en vue"), "masque", o.masque, _t("Visible ici en transparence."))}
      <div class="ed-champ"><label>${_t("Ordre dans son calque")}${o.niveau ? ` · ${_t("niveau {n}", { n: esc(o.niveau) })}` : ""}</label><div class="ed-actions">
        ${ibAct("niveau:haut", "mdi:arrange-bring-to-front", _t("Premier plan"))}${ibAct("niveau:bas", "mdi:arrange-send-to-back", _t("Arrière-plan"))}</div></div>`;
  }
  // premier plan / arrière-plan : juste au-dessus (au-dessous) des autres éléments de son calque ; niveau par défaut = clé retirée
  _niveau(haut) {
    const s = this.sel, o = this._objet(), d = this.d;
    const l = { point: d.points, texte: d.textes, ouverture: d.ouvertures, meuble: d.meubles, piece: d.pieces.filter((p) => !!p.sous_zone === !!o?.sous_zone) }[s?.type];
    if (!l || !o) return;
    const def = (x) => (s.type === "meuble" ? this.carte.constructor.niveauMeuble({ type: x.type }) : 0), niv = (x) => nbr(x.niveau, def(x));
    const ordre = l.map((x, i) => [x, i]).sort((p, q) => niv(p[0]) - niv(q[0]) || p[1] - q[1]).map(([x]) => x), autres = l.filter((x) => x !== o);
    if (!autres.length || ordre[haut ? ordre.length - 1 : 0] === o) return this.snack(haut ? _t("Déjà au premier plan de son calque.") : _t("Déjà à l'arrière-plan de son calque."));
    const v = haut ? Math.max(...autres.map(niv)) + 1 : Math.min(...autres.map(niv)) - 1;
    this.commit(() => { if (v === def(o)) delete o.niveau; else o.niveau = v; });
  }
  panneauCalques(oui) {
    this.vueCalques = oui;
    if (oui && this.vueParametres) this._fermerParametres(); // panneau latéral demandé : la modale ⚙ se ferme (comme ses raccourcis)
    if (oui && this.vueAmbiance) { this.vueAmbiance = false; this.carte._construire(); }
    if (oui) { this.sel = null; this.multi.clear(); this.carte._construire(); if (this.replie) { this._depliee = Date.now(); this.replier(false); } }
    this._barre();
    this._panneau();
  }
  _panneauCalques() {
    const d = this.d, q = d.calques || {}, Q = this.carte._calques(), { noms, icones } = this.carte.constructor.CALQUES;
    const P = d.points || [], M = d.meubles || [], sz = d.pieces.filter((p) => p.sous_zone);
    const elts = { pieces: d.pieces.filter((p) => !p.sous_zone), sous_zones: sz, halos: P.filter((p) => p.halo), meubles: M, limites: d.limites || [], murs: d.murs || [],
      ouvertures: d.ouvertures || [], etiquettes: d.pieces.filter((p) => !p.sous_zone && p.etiquette), libelles: [...sz.filter((p) => p.etiquette), ...M.filter((m) => m.type === "espace" && m.nom)],
      appareils: P, textes: d.textes || [] };
    const ligne = (k) => {
      const n = elts[k].length, cach = elts[k].filter((o) => o?.masque).length, m = Q.masques.has(k), v = Q.verrous.has(k);
      return `<div class="ed-cq${m ? " masque" : ""}" data-cq="${k}"><button class="ib ed-cq-poignee" data-cq-glisse="${k}" title="${_t("Glisser pour changer l'ordre (ou flèches haut / bas)")}" aria-label="${_t("Ordre du calque {nom} (flèches haut / bas)", { nom: esc(_t(noms[k])) })}"><ha-icon icon="mdi:drag"></ha-icon></button>
        <ha-icon icon="${icones[k]}"></ha-icon><span class="n">${esc(_t(noms[k]))}<small>${_t("{n} élément|{n} éléments", { n })}${cach ? ` · ${_t("{n} masqué|{n} masqués", { n: cach })}` : ""}</small></span>
        <button class="ib${m ? " on" : ""}" data-act="cq-oeil:${k}" title="${m ? _t("Afficher en vue") : _t("Masquer en vue")}" aria-label="${m ? _t("Afficher en vue") : _t("Masquer en vue")}" aria-pressed="${m}"><ha-icon icon="mdi:${m ? "eye-off-outline" : "eye-outline"}"></ha-icon></button>
        <button class="ib${v ? " on" : ""}" data-act="cq-verrou:${k}" title="${v ? _t("Déverrouiller") : _t("Cliquer à travers")}" aria-label="${v ? _t("Déverrouiller") : _t("Cliquer à travers")}" aria-pressed="${v}"><ha-icon icon="mdi:${v ? "lock-outline" : "lock-open-variant-outline"}"></ha-icon></button></div>`;
    };
    poserHTML(this.panneau, `<h3><ha-icon icon="mdi:layers-outline"></ha-icon>${_t("Calques")}${bulleI(_t("En haut d'une liste : au premier plan. Œil : masqué en vue (ici en transparence et non cliquable). Cadenas : on clique à travers pendant l'édition. Ce qui est « au-dessus du dessin » reste toujours au-dessus du dessin."))}<button class="ib" data-act="cq-fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></h3>
      <h4>${_t("Au-dessus du dessin")}</h4><div class="ed-cqs" data-groupe="html">${[...Q.html].reverse().map(ligne).join("")}</div>
      <h4>${_t("Dessin")}</h4><div class="ed-cqs" data-groupe="svg">${[...Q.svg].reverse().map(ligne).join("")}</div>
      ${d.afficher_meubles === "pc" ? `<div class="ed-aide">${_t("Meubles : affichés en vue sur grand écran seulement (show_furniture: desktop).")}</div>` : ""}
      <div class="ed-actions"><button class="ed-btn contour" data-act="cq-reinit" ${q.ordre_svg || q.ordre_html ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon>${_t("Réinitialiser l'ordre")}</button></div>
      <label class="ed-inter"><span>${_t("Bouton Calques pour les visiteurs")}${bulleI(_t("Chacun masque ce qu'il veut, sur son navigateur."))}</span><input type="checkbox" data-act-chk="cq-bouton" ${q.bouton_vue ? "checked" : ""}></label>
      ${this._listesElements()}`);
    this._cablerPanneau();
    // glisser une poignée (souris ou doigt) ou flèches haut / bas : nouvel ordre dans son groupe
    this.panneau.querySelectorAll("[data-cq-glisse]").forEach((h) => {
      const ligne = h.closest(".ed-cq"), liste = ligne.parentElement, groupe = liste.dataset.groupe, k = h.dataset.cqGlisse;
      h.onkeydown = (ev) => {
        const pas = { ArrowUp: -1, ArrowDown: 1 }[ev.key];
        if (!pas) return;
        ev.preventDefault();
        const j = [...liste.children].indexOf(ligne) + pas;
        if (j < 0 || j >= liste.children.length) return;
        this._deplacerCalque(groupe, k, j);
        this.panneau.querySelector(`[data-cq-glisse="${k}"]`)?.focus();
      };
      h.onpointerdown = (ev) => {
        if (ev.button > 0) return;
        ev.preventDefault();
        h.setPointerCapture?.(ev.pointerId);
        const lignes = [...liste.children], i0 = lignes.indexOf(ligne), depot = document.createElement("div");
        depot.className = "ed-cq-depot";
        let j = i0, bouge = false;
        ligne.classList.add("glisse");
        const mv = (e) => {
          if (!bouge && Math.abs(e.clientY - ev.clientY) < 4) return;
          bouge = true;
          j = lignes.findIndex((x) => { const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
          if (j < 0) j = lignes.length;
          liste.insertBefore(depot, lignes[j] || null);
        };
        const fin = (e) => {
          h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", fin); h.removeEventListener("pointercancel", fin);
          depot.remove(); ligne.classList.remove("glisse");
          const dest = j > i0 ? j - 1 : j;
          if (bouge && e.type === "pointerup" && dest !== i0) this._deplacerCalque(groupe, k, dest);
        };
        h.addEventListener("pointermove", mv); h.addEventListener("pointerup", fin); h.addEventListener("pointercancel", fin);
      };
    });
  }
  // éléments du plan par catégorie (repliables) : un clic sélectionne l'élément et ouvre son panneau (Échap : retour aux calques)
  _listesElements() {
    const d = this.d, nomP = (p) => p.nom || this.carte._nom(p.entite), item = (k, ic, nom, sous) => `<button data-choix="${k}"><ha-icon icon="${esc(ic)}"></ha-icon><span>${esc(nom)}<small>${esc(sous)}</small></span></button>`;
    const nomMeuble = (m) => m.nom || (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : m.type);
    const widgets = ["gauche", "droite"].flatMap((c) => (d.panneaux?.[c] || []).map((w, i) => item(`widget:${c}:${i}`, w.icone || "mdi:view-dashboard-outline", w.titre || typeWidgetEn(w.type), `${typeWidgetEn(w.type)} · ${c === "gauche" ? _t("panneau gauche") : _t("panneau droit")}`)));
    const cats = [
      [_t("Pièces ({n})", { n: d.pieces.length }), d.pieces.map((p, i) => item(`piece:${i}`, p.dehors ? "mdi:pine-tree" : "mdi:floor-plan", p.nom || _t("Pièce"), p.temperature || _t("sans capteur")))],
      [_t("Appareils ({n})", { n: (d.points || []).length }), (d.points || []).map((p, i) => item(`point:${i}`, p.icone || "mdi:circle", nomP(p), p.entite))],
      [_t("Ouvertures ({n})", { n: (d.ouvertures || []).length }), (d.ouvertures || []).map((o, i) => item(`ouverture:${i}`, o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door",
        o.nom || (o.contact ? this.carte._nom(o.contact) : _t("Ouverture sans capteur")), o.contact || o.volet || o.entite || "—"))],
      [_t("Meubles ({n})", { n: (d.meubles || []).length }), (d.meubles || []).map((m, i) => item(`meuble:${i}`, "mdi:sofa-outline", nomMeuble(m), MEUBLES()[m.type]?.cat ? _t(MEUBLES()[m.type].cat) : ""))],
      [_t("Textes ({n})", { n: (d.textes || []).length }), (d.textes || []).map((t, i) => item(`texte:${i}`, Array.isArray(t.infos) ? "mdi:card-text-outline" : "mdi:format-text", t.t || (Array.isArray(t.infos) ? _t("Zone d'informations") : _t("Texte")), ""))],
      [_t("Widgets ({n})", { n: widgets.length }), widgets],
      [_t("Résumé en tête ({n})", { n: this._puces().length }), this._puces().map((p, i) => { const t = PUCES.find((x) => x[0] === p.type) || [];
        return item(`puce:${i}`, p.icone || t[1] || "mdi:help", p.type === "entite" ? p.nom || this.carte._nom(p.entite) || _t("Entité") : t[2] ? _t(t[2]) : p.type, p.type === "entite" ? p.entite || "—" : _t("automatique")); })],
      [_t("Groupes ({n})", { n: (d.groupes || []).length }), (d.groupes || []).map((g) => `<button data-groupe-choix="${esc(g.id)}"><ha-icon icon="mdi:group"></ha-icon><span>${esc(g.nom)}<small>${_t("{n} éléments", { n: this._membres(g.id).length })}</small></span></button>`)],
    ].filter(([, l]) => l.length);
    if (!cats.length) return "";
    return `<h4>${_t("Éléments du plan")}</h4>
      ${cats.map(([t, l]) => `<details class="ed-avance ed-elts"><summary>${t}</summary><div class="ed-liste">${l.join("")}</div></details>`).join("")}`;
  }
  // config des calques : listes vides, ordre par défaut et bouton absent retirés (le YAML reste minimal)
  _majCalques(fn) {
    const { svg, html } = this.carte.constructor.CALQUES;
    this.commit(() => {
      const q = (this.d.calques ||= {});
      fn(q);
      if (q.ordre_svg?.join() === svg.join()) delete q.ordre_svg;
      if (q.ordre_html?.join() === html.join()) delete q.ordre_html;
      for (const x of ["masques", "verrous"]) if (Array.isArray(q[x]) && !q[x].length) delete q[x];
      if (!q.bouton_vue) delete q.bouton_vue;
      if (!Object.keys(q).length) delete this.d.calques;
    });
  }
  _actionCalque(a) {
    const [op, k] = a.split(":"), bascule = (l, x) => { const e = new Set(l || []); if (e.has(x)) e.delete(x); else e.add(x); return [...e]; };
    if (op === "cq-fermer") return this.panneauCalques(false);
    this._majCalques((q) => {
      if (op === "cq-oeil" && k === "meubles" && this.d.afficher_meubles === false) { delete this.d.afficher_meubles; q.masques = (q.masques || []).filter((x) => x !== k); }
      else if (op === "cq-oeil") q.masques = bascule(q.masques, k);
      if (op === "cq-verrou") q.verrous = bascule(q.verrous, k);
      if (op === "cq-reinit") { delete q.ordre_svg; delete q.ordre_html; }
      if (op === "cq-bouton") q.bouton_vue = !q.bouton_vue;
    });
  }
  // ---------- paramètres : réglages globaux (liste SECTIONS_PARAMETRES) ----------
  // grande modale centrée à onglets (plein écran sur téléphone), au-dessus d'un voile léger : l'aperçu en direct reste visible autour.
  // À l'ouverture le focus va à l'onglet actif ; Échap, la croix ou un clic sur le voile la ferment et le focus revient au bouton ⚙.
  panneauParametres(oui, onglet = null) {
    oui = !!oui;
    if (onglet) this._ongletPar = onglet;
    this._confParam = null;
    const avant = !!this.vueParametres;
    this.vueParametres = oui;
    if (oui) { this._fermerMenu(); this._rendreParametres(); if (!avant || onglet) this.R.querySelector(".ed-onglets [aria-selected=true]")?.focus({ preventScroll: true }); }
    else this.R.querySelector(".ed-mvoile")?.remove();
    this._barre();
    if (!oui && avant) this._rendreFocusParametres();
  }
  _fermerParametres() { this.vueParametres = false; this._confParam = null; this.R.querySelector(".ed-mvoile")?.remove(); }
  // focus rendu au bouton ⚙ (au bouton « Plus » sur téléphone, où ⚙ est dans son menu)
  _rendreFocusParametres() {
    const b = [this.barre.querySelector('[data-a="parametres"]'), this.barre.querySelector('[data-a="plus"]')].find((x) => x && x.getClientRects().length);
    b?.focus({ preventScroll: true });
  }
  _champParametre(k) { return champReglage(k); }
  // réglage écrit par programme (autres panneaux, tests) : même règle que la modale, avec annulation
  reglerParametre(chemin, v) { this._ecrireParametre(champReglage(chemin) || { chemin }, v, true); }
  // onglets de la modale : une section par onglet, ou plusieurs (`onglet: "id"` de la section qui ouvre l'onglet), dans l'ordre de la liste
  _ongletsParametres(d = this.d) {
    const l = [];
    for (const S of SECTIONS_PARAMETRES) {
      const champs = (S.champs || []).filter((f) => !f.si || f.si(d, this));
      if (!champs.some((f) => f.type !== "intertitre")) continue;
      const id = S.onglet || S.id;
      let o = l.find((x) => x.id === id);
      if (!o) l.push((o = { id, titre: S.titre, icone: S.icone || "mdi:cog-outline", sections: [] }));
      o.sections.push({ S, champs });
    }
    return l;
  }
  ongletParametres(id) {
    const v = this.R.querySelector(".ed-mvoile");
    if (!v || !v.querySelector(`[data-onglet-par="${id}"]`)) return;
    this._ongletPar = id;
    v.querySelectorAll("[data-onglet-par]").forEach((b) => { const on = b.dataset.ongletPar === id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    v.querySelectorAll(".ed-mcontenu>section").forEach((p) => { p.hidden = p.dataset.onglet !== id; });
    v.querySelector(".ed-mcontenu").scrollTop = 0;
    v.querySelector(`[data-onglet-par="${id}"]`).scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  _rendreParametres() {
    const d = this.d, hass = this.hass;
    if (this._tip?.b.closest(".ed-mvoile")) this._cacherAide();
    let V = this.R.querySelector(".ed-mvoile");
    if (!V) {
      V = document.createElement("div");
      V.className = "ed-mvoile";
      this.R.querySelector("ha-card").append(V);
      this._cablerModaleParametres(V);
    }
    // élément qui avait le focus et défilement (rendu refait à chaque modification) : ils sont retrouvés ensuite
    const actif = this.R.activeElement, dans = V.contains(actif);
    const garde = !dans ? null : actif.dataset?.par || (actif.dataset?.parConf ? "conf" : actif.dataset?.ongletPar ? `onglet:${actif.dataset.ongletPar}` : actif.dataset?.parAction ? `action:${actif.dataset.parAction}` : actif.dataset?.parFermer ? "fermer" : null);
    const defile = V.querySelector(".ed-mcontenu")?.scrollTop || 0;
    const onglets = this._ongletsParametres(d);
    if (!onglets.some((o) => o.id === this._ongletPar)) this._ongletPar = onglets[0]?.id;
    const valeur = (f) => lireReglage(d, f);
    // aide d'un réglage : bulle ⓘ après son libellé (plus de texte permanent sous le champ)
    const aide = (f) => (f.aide ? bulleI(_t(f.aide)) : "");
    const rendu = (f) => {
      const k = esc(f.chemin || f.id || ""), lib = esc(_t(f.libelle ?? f.nom ?? "")), v = f.chemin ? valeur(f) : undefined;
      if (f.type === "intertitre") return `<div class="ed-par-inter">${lib}</div>`;
      if (f.type === "bool") {
        const conf = f.confirmer && this._confParam === f.chemin ? f.confirmer : null;
        return `<div class="ed-par"><label class="ed-inter"><span>${lib}${aide(f)}</span><input type="checkbox" data-par="${k}" ${v ? "checked" : ""}></label>
          ${conf ? `<div class="ed-confirme" role="alertdialog" aria-labelledby="ed-conf-t" aria-describedby="ed-conf-d"><b id="ed-conf-t"><ha-icon icon="mdi:alert-outline"></ha-icon>${esc(_t(conf.titre))}</b>
            <p id="ed-conf-d">${esc(_t(conf.texte))}</p><div class="ed-actions"><button class="ed-btn texte" data-par-conf="non">${_t("Annuler")}</button>
            <button class="ed-btn danger" data-par-conf="oui">${esc(_t(conf.bouton))}</button></div></div>` : ""}</div>`;
      }
      if (f.type === "choix") {
        // valeur inconnue des options (ex. `language: auto`) : affichée comme la valeur par défaut
        const connue = f.options.some(([val]) => memeValeur(val, v)), opts = f.options.map(([val, l, brut], j) => ({ j, on: memeValeur(val, connue ? v : f.defaut), l: brut ? l : _t(l) }));
        if (opts.length <= 4) return `<div class="ed-champ"><span class="ed-par-lib"><span id="par-${k}">${lib}</span>${aide(f)}</span><span class="ed-seg petit plein" role="group" aria-labelledby="par-${k}">${opts.map((o) => `<button type="button" data-par="${k}" data-val="${o.j}" class="${o.on ? "on" : ""}" aria-pressed="${o.on}">${esc(o.l)}</button>`).join("")}</span></div>`;
        return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><select id="par-${k}" data-par="${k}">${opts.map((o) => `<option value="${esc(o.j)}" ${o.on ? "selected" : ""}>${esc(o.l)}</option>`).join("")}</select></div>`;
      }
      if (f.type === "nombre") return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><div class="ed-unite"><input type="number" id="par-${k}" data-par="${k}" min="${f.min ?? ""}" max="${f.max ?? ""}" step="${f.pas || 1}" value="${esc(v ?? "")}" placeholder="${esc(f.defaut ?? "")}">${f.unite ? `<span aria-hidden="true">${esc(f.unite)}</span>` : ""}</div></div>`;
      if (f.type === "texte") return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><input type="text" id="par-${k}" data-par="${k}" value="${esc(v ?? "")}" placeholder="${esc(f.placeholder ? _t(f.placeholder) : "")}"></div>`;
      if (f.type === "entite") {
        // zone Maison par défaut : son nom plutôt que l'identifiant technique en titre (l'identifiant reste en sous-titre)
        const s = v && hass.states[v], def = memeValeur(v, f.defaut), nom = s ? s.attributes.friendly_name || v : v === "zone.home" ? _t("Maison") : v || "";
        return `<div class="ed-champ"><label>${lib}${aide(f)}</label><button class="ed-entite" data-par="${k}" aria-label="${lib} : ${esc(nom || _t("Choisir…"))}">
          ${v ? `<ha-icon icon="${esc(iconeEntite(hass, v))}"></ha-icon><span class="n">${esc(nom)}<small>${esc(v)}${def ? ` · ${_t("par défaut")}` : ""}${s ? ` · ${esc(hass.formatEntityState?.(s) ?? s.state)}` : def ? "" : _t(" · introuvable")}</small></span>` : `<span class="n vide">${_t("Choisir…")}</span>`}
          ${def || f.defaut == null && !v ? "" : `<span class="ib x" data-par-effacer="${k}" title="${_t("Valeur par défaut")}"><ha-icon icon="mdi:close"></ha-icon></span>`}</button></div>`;
      }
      if (f.type === "action") {
        const ds = typeof f.desc === "function" ? f.desc(d, this) : f.desc;
        return `<button data-par-action="${k}"><ha-icon icon="${esc(f.icone || "mdi:open-in-app")}"></ha-icon><span>${lib}${ds ? `<small>${esc(_t(ds))}</small>` : ""}</span><ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon></button>`;
      }
      return "";
    };
    const champs = (l) => {
      let h = "";
      for (let i = 0; i < l.length;) {
        if (l[i].demi && l[i + 1]?.demi) { h += `<div class="ed-ligne">${rendu(l[i])}${rendu(l[i + 1])}</div>`; i += 2; continue; }
        if (l[i].type === "action") { let a = ""; while (l[i]?.type === "action") a += rendu(l[i++]); h += `<div class="ed-liste">${a}</div>`; continue; }
        h += rendu(l[i++]);
      }
      return h;
    };
    // un onglet = son titre puis ses sections ; une section porte un sous-titre seulement si l'onglet en regroupe plusieurs (sauf la première, du même nom)
    const panneaux = onglets.map((o) => {
      const t = _t(o.titre), secs = o.sections.map(({ S, champs: l }, n) => {
        const sous = o.sections.length > 1 && !(n === 0 && _t(S.titre) === t), id = esc(S.id);
        return `<section class="ed-par-sec" data-sec="${id}" aria-labelledby="${sous ? `par-sec-${id}` : `par-pan-t-${esc(o.id)}`}">${sous ? `<h4><span id="par-sec-${id}">${esc(_t(S.titre))}</span>${S.aide ? bulleI(_t(S.aide)) : ""}</h4>` : ""}${champs(l)}</section>`;
      }).join("");
      return `<section role="tabpanel" id="par-pan-${esc(o.id)}" aria-labelledby="par-tab-${esc(o.id)}" data-onglet="${esc(o.id)}" tabindex="0" ${o.id === this._ongletPar ? "" : "hidden"}><h3 class="ed-mtitre" id="par-pan-t-${esc(o.id)}">${esc(t)}</h3>${secs}</section>`;
    }).join("");
    poserHTML(V, `<div class="ed-modale" role="dialog" aria-modal="true" aria-labelledby="ed-par-titre">
      <header><ha-icon icon="mdi:cog-outline"></ha-icon><div><h2><span id="ed-par-titre">${_t("Paramètres")}</span>${bulleI(_t("Un réglage remis à sa valeur par défaut est retiré de la configuration."))}</h2>
        <div class="ed-version">Maquette ${esc(customElements.get("maquette-card").VERSION)} · <button type="button" data-par-lien="doc">${_t("Documentation")}</button> · <button type="button" data-par-lien="bug">${_t("Signaler un problème")}</button></div></div>
        <button class="ib" data-par-fermer="1" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcorps"><nav class="ed-onglets" role="tablist" aria-label="${_t("Sections des paramètres")}" aria-orientation="${this._etroit() ? "horizontal" : "vertical"}">${onglets.map((o) => { const on = o.id === this._ongletPar;
        return `<button type="button" role="tab" id="par-tab-${esc(o.id)}" aria-controls="par-pan-${esc(o.id)}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-onglet-par="${esc(o.id)}"><ha-icon icon="${esc(o.icone)}"></ha-icon><span>${esc(_t(o.titre))}</span></button>`; }).join("")}</nav>
        <div class="ed-mcontenu">${panneaux}</div></div></div>`);
    V.querySelectorAll("input[data-par],select[data-par]").forEach((inp) => {
      const f = this._champParametre(inp.dataset.par);
      inp.onchange = () => {
        if (f.type === "bool") return this._ecrireParametre(f, inp.checked);
        if (f.type === "choix") return this._ecrireParametre(f, f.options[+inp.value][0]);
        if (f.type === "texte") return this._ecrireParametre(f, inp.value.trim());
        if (f.type !== "nombre") return;
        if (inp.value.trim() === "") return this._ecrireParametre(f, undefined);
        // hors bornes ou incohérente : refusée avec un message, jamais corrigée en silence
        const v = +inp.value, hors = !Number.isFinite(v) || (f.min != null && v < f.min) || (f.max != null && v > f.max), refus = hors ? null : f.valider?.(this.d, v);
        if (hors || refus) { this.snack(hors ? _t("Valeur refusée : de {min} à {max} {unite}.", { min: fmt(f.min), max: fmt(f.max), unite: f.unite || "" }).replace(/ \./, ".") : _t(refus)); this._rendreParametres(); return V.querySelector(`[data-par="${f.chemin}"]`)?.focus(); }
        return this._ecrireParametre(f, v);
      };
    });
    const c = V.querySelector(".ed-mcontenu");
    if (c) c.scrollTop = defile;
    this._indiceDefilement(V.querySelector(".ed-onglets"));
    if (garde === "conf") V.querySelector('[data-par-conf="oui"]')?.focus({ preventScroll: true });
    else if (garde?.startsWith("onglet:")) V.querySelector(`[data-onglet-par="${garde.slice(7)}"]`)?.focus({ preventScroll: true });
    else if (garde?.startsWith("action:")) V.querySelector(`[data-par-action="${garde.slice(7)}"]`)?.focus({ preventScroll: true });
    else if (garde === "fermer") V.querySelector("[data-par-fermer]")?.focus({ preventScroll: true });
    else if (garde) (V.querySelector(`button[data-par="${garde}"].on`) || V.querySelector(`[data-par="${garde}"]`))?.focus({ preventScroll: true });
  }
  // événements de la modale (posés une fois : le voile reste, son contenu est redessiné) : clics, onglets au clavier, focus piégé
  _cablerModaleParametres(V) {
    V.onpointerdown = (ev) => { this._basVoile = ev.target === V; };
    V.onclick = async (ev) => {
      if (ev.target === V) { if (this._basVoile) this.panneauParametres(false); return; }
      const ch = ev.composedPath(), el = (k) => ch.find((n) => n instanceof HTMLElement && n.dataset?.[k] != null);
      if (el("parFermer")) return this.panneauParametres(false);
      // version : documentation et signalement d'un problème, sur le dépôt (nouvel onglet)
      const ln = el("parLien");
      if (ln) { const D = customElements.get("maquette-card").DEPOT; return window.open(ln.dataset.parLien === "bug" ? `${D}/issues/new/choose` : `${D}#readme`, "_blank", "noopener,noreferrer"); }
      const og = el("ongletPar");
      if (og) return this.ongletParametres(og.dataset.ongletPar);
      const c = el("parConf");
      if (c) { const f = this._champParametre(this._confParam); this._confParam = null; if (c.dataset.parConf === "oui" && f) return this._ecrireParametre(f, false, true); this._rendreParametres(); return V.querySelector(`[data-par="${f?.chemin}"]`)?.focus(); }
      const ef = el("parEffacer");
      if (ef) { ev.stopPropagation(); return this._ecrireParametre(this._champParametre(ef.dataset.parEffacer), undefined); }
      // raccourci : la modale se ferme, puis le panneau (ou le dialogue) visé s'ouvre
      const a = el("parAction");
      if (a) { const f = this._champParametre(a.dataset.parAction); this.panneauParametres(false); return f?.action(this); }
      const b = ch.find((n) => n instanceof HTMLButtonElement && n.dataset.par);
      const f = b && this._champParametre(b.dataset.par);
      if (f?.type === "choix") return this._ecrireParametre(f, f.options[+b.dataset.val][0]);
      if (f?.type === "entite") { const e = await this.choisirEntite({ titre: _t(f.libelle ?? f.nom ?? ""), domaine: f.domaine || "" }); if (e) this._ecrireParametre(f, e); }
    };
    V.onkeydown = (ev) => {
      const tab = ev.composedPath().find((n) => n instanceof HTMLElement && n.dataset?.ongletPar != null);
      if (tab) {
        const l = [...V.querySelectorAll("[data-onglet-par]")], i = l.indexOf(tab), n = l.length;
        const j = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[ev.key];
        if (j != null) { ev.preventDefault(); const t = l[(j + n) % n]; this.ongletParametres(t.dataset.ongletPar); t.focus(); return; }
      }
      if (ev.key === "Tab") this._pieger(ev, V.querySelector(".ed-modale"));
    };
  }
  // focus piégé dans un dialogue : Tab et Maj+Tab bouclent sur ses éléments atteignables
  _pieger(ev, boite) {
    if (!boite) return;
    const l = [...boite.querySelectorAll('button,input,select,textarea,[tabindex]')].filter((x) => !x.disabled && x.tabIndex >= 0 && x.getClientRects().length);
    if (!l.length) return;
    const a = this.R.activeElement, i = l.indexOf(a);
    if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); l[l.length - 1].focus(); }
    else if (!ev.shiftKey && (i === l.length - 1 || i < 0)) { ev.preventDefault(); l[0].focus(); }
  }
  // écriture d'un réglage : confirmation d'abord si le champ en demande une, puis historique (Ctrl+Z) et aperçu en direct
  _ecrireParametre(f, v, confirme = false) {
    if (!f) return;
    if (f.confirmer && !confirme && f.confirmer.quand(v)) {
      this._confParam = f.chemin;
      this._rendreParametres();
      return this.R.querySelector('.ed-mvoile [data-par-conf="oui"]')?.focus();
    }
    this._confParam = null;
    this.commit(() => (f.ecrire ? f.ecrire(this.d, v) : ecrireReglage(this.d, f, v)));
  }

  // ---------- ambiance et animations ----------
  // panneau ouvert = aperçu de l'ambiance sur le plan (sinon l'ambiance n'est jamais dessinée pendant l'édition)
  // ancre : section à montrer à l'ouverture (« alertes »)
  panneauAmbiance(oui, ancre = null) {
    this.vueAmbiance = oui;
    if (oui && this.vueParametres) this._fermerParametres();
    if (oui) { this.vueCalques = false; this.sel = null; this.multi.clear(); if (this.replie) { this._depliee = Date.now(); this.replier(false); } }
    this.carte._construire();
    this._barre();
    this._panneau();
    if (oui && ancre) this.panneau.querySelector(`[data-ancre="${ancre}"]`)?.scrollIntoView({ block: "start" });
  }
  _panneauAmbiance() {
    const d = this.d, A = d.ambiance && typeof d.ambiance === "object" ? d.ambiance : null, C = this.carte.constructor, AN = C.ANIMATIONS, EV = C.EVENEMENTS_ANIM;
    const I = typeof A?.intensite === "number" ? "" : A?.intensite || "discret", jn = A?.jour_nuit !== false, mq = !(A?.jour_nuit && typeof A.jour_nuit === "object" && A.jour_nuit.marqueur === false);
    const tr = !A ? 10 : A.traces === false ? 0 : typeof A.traces === "number" ? A.traces : A.traces?.duree ?? 10;
    const met = typeof A?.meteo === "string" ? A.meteo : A?.meteo?.entite || "", meteos = Object.keys(this.hass.states).filter((e) => e.startsWith("weather.")).sort();
    const ext = d.pieces.some((p) => p.dehors && !p.sous_zone);
    const en = A?.energie ? (typeof A.energie === "object" ? A.energie : {}) : null, pe = A?.personnes ? (typeof A.personnes === "object" && !Array.isArray(A.personnes) ? A.personnes : {}) : null;
    const AL = Array.isArray(d.alertes) ? d.alertes : [];
    const regle = (r, i) => {
      const ents = [...(Array.isArray(r.entites) ? r.entites : []), ...(r.entite ? [r.entite] : [])];
      return `<div class="ed-al">
        <div class="ed-ligne"><div class="ed-champ"><label>${_t("Nom")}</label><input type="text" data-alk="${i}.nom" value="${esc(r.nom || "")}" placeholder="${_t("Alerte")}"></div>
          <div class="ed-champ"><label>${_t("Niveau")}</label><select data-alk="${i}.niveau">${[["", _t("Critique")], ["alerte", _t("Alerte##niveau")], ["info", _t("Info")]].map(([v, n]) => `<option value="${esc(v)}" ${(r.niveau || "") === (v || "") || (v === "" && r.niveau === "critique") ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
        <div class="ed-champ"><label>${_t("Icône")}</label><input type="text" data-alk="${i}.icone" value="${esc(r.icone || "")}" placeholder="auto (${{ alerte: "mdi:alert", info: "mdi:information" }[r.niveau] || "mdi:alarm-light"})"></div>
        ${r.type === "ouvertures" ? `<div class="ed-aide">${_t("Toutes les portes et fenêtres du plan (ouvertes).")}</div>` : `<div class="ed-champ"><label>${_t("Entités (une suffit)")}</label><div class="ed-al-ents">${ents.map((e, k) => `<span class="ed-al-e"><span>${esc(this.carte._nom(e))}</span><button class="ib" data-al-act="retirer:${i}:${k}" title="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></span>`).join("")}
          <button class="ed-btn texte" data-al-act="ajouter:${i}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Entité")}</button></div></div>
          <div class="ed-ligne"><div class="ed-champ"><label>${_t("Quand l'état vaut")}</label><input type="text" data-alk="${i}.etat" value="${esc(r.etat ?? "")}" placeholder="${_t("ex. on")}" title="on, open, triggered…"></div>${this._champNombreAl(`${i}.au_dessus`, r.au_dessus)}</div>`}
        <label class="ed-inter"><span>${_t("Seulement quand personne n'est à la maison")}</span><input type="checkbox" data-alk-chk="${i}.si_absent" ${r.si_absent ? "checked" : ""}></label>
        <div class="ed-actions"><button class="ed-btn danger" data-al-act="suppr:${i}"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Retirer l'alerte")}</button></div></div>`;
    };
    const ligneEv = (ev) => {
      const g = d.animations?.[ev], a = typeof g === "string" ? { type: g } : g || {}, def = EV[ev].defaut;
      // type en pleine largeur (l'animation par défaut reste lisible), couleur et durée sur la ligne du dessous
      return `<div class="ed-champ ed-anim-ev"><label for="ed-anim-${ev}">${esc(_t(EV[ev].nom))}</label>
        <select id="ed-anim-${ev}" data-anim="${ev}.type"><option value="">${_t("Défaut ({nom})", { nom: esc(_t(AN[def.type]).split(" (")[0]) })}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${a.type === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        <div class="ed-ligne"><span class="ed-couleur-anim"><input type="color" data-anim="${ev}.couleur" value="${esc(/^#[0-9a-f]{6}$/i.test(a.couleur || "") ? a.couleur : "#f4b400")}" title="${_t("Couleur (sinon celle de l'élément)")}" aria-label="${_t("Couleur")}">${a.couleur ? `<button class="ib" data-anim-effacer="${ev}.couleur" title="${_t("Couleur de l'élément")}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</span>
        <input type="number" step="0.1" min="0.2" max="20" data-anim="${ev}.duree" data-num="1" value="${esc(a.duree ?? "")}" placeholder="${def.duree} s" aria-label="${_t("Durée d'un cycle (s)")}" title="${_t("Durée d'un cycle (s)")}"></div></div>`;
    };
    poserHTML(this.panneau, `<h3><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>${_t("Ambiance et animations")}<button class="ib" data-act="amb-fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></h3>
      <label class="ed-inter"><span>${_t("Ambiance du plan")}${bulleI(_t("Jour / nuit, météo, traces. Ce panneau ouvert, le plan la montre telle qu'elle sera en vue."))}</span><input type="checkbox" data-amb-chk="actif" ${A ? "checked" : ""}></label>
      ${A ? `<div class="ed-champ"><label>${_t("Intensité")}</label><span class="ed-seg petit">${[["discret", _t("Discrète")], ["normal", _t("Normale")], ["fort", _t("Marquée")]].map(([v, n]) => `<button data-amb-set="intensite:${v}" class="${I === v ? "on" : ""}">${n}</button>`).join("")}</span></div>
      <div class="ed-champ"><label>${_t("Nord du plan (°)")}${bulleI(_t("Degrés, sens horaire depuis le haut ; 45 = en haut à droite."))}</label><input type="number" step="5" data-amb="nord" data-num="1" value="${esc(A.nord ?? "")}" placeholder="0"></div>
      <h4>${_t("Jour et nuit")}</h4>
      <label class="ed-inter"><span>${_t("Teinte de nuit et lumière du soleil (sun.sun)")}</span><input type="checkbox" data-amb-chk="jour_nuit" ${jn ? "checked" : ""}></label>
      ${jn ? `<label class="ed-inter"><span>${_t("Repère du soleil au bord du plan")}</span><input type="checkbox" data-amb-chk="marqueur" ${mq ? "checked" : ""}></label>` : ""}
      <h4>${_t("Météo")}</h4>
      ${ext ? "" : `<div class="ed-aide">${_t("Aucune pièce « extérieur » : météo et soleil n'ont rien à dessiner.")}</div>`}
      <div class="ed-champ"><label>${_t("Météo peinte sur les extérieurs")}</label><select data-amb="meteo"><option value="">${_t("— aucune —")}</option>${meteos.map((e) => `<option value="${esc(e)}" ${e === met ? "selected" : ""}>${esc(this.carte._nom(e))}</option>`).join("")}</select></div>
      <h4>${_t("Traces")}</h4>
      <div class="ed-champ"><label>${_t("Durée des traces")}${bulleI(_t("Ce qui vient de changer garde un liseré qui s'estompe."))}</label><div class="ed-curseur"><input type="range" min="0" max="240" step="5" data-amb="traces" value="${esc(tr)}"><output>${tr ? `${tr} min` : _t("aucune")}</output></div></div>
      <h4>${_t("Flux d'énergie")}</h4>
      <label class="ed-inter"><span>${_t("Billes vers les appareils mesurés")}${bulleI(_t("Du tableau électrique vers chaque appareil mesuré ; vitesse selon la puissance."))}</span><input type="checkbox" data-amb-chk="energie" ${en ? "checked" : ""}></label>
      ${en ? `<div class="ed-champ"><label>${_t("Départ")}</label><select data-amb="energie.source" data-num="1"><option value="">${_t("Tableau électrique")}</option>${(d.meubles || []).map((m, i) => (m.type === "espace" ? "" : `<option value="${esc(i)}" ${en.source === i ? "selected" : ""}>${esc(m.nom || (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : m.type))}</option>`)).join("")}</select></div>
        <div class="ed-champ"><label>${_t("À partir de (W)")}</label><input type="number" step="1" min="0" data-amb="energie.seuil" data-num="1" value="${esc(en.seuil ?? "")}" placeholder="5"></div>` : ""}
      <h4>${_t("Personnes")}</h4>
      <label class="ed-inter"><span>${_t("Personnes sur le plan")}${bulleI(_t("À la maison, ou au bord dans leur direction réelle avec la distance."))}</span><input type="checkbox" data-amb-chk="personnes" ${pe ? "checked" : ""}></label>
      ${pe ? `<div class="ed-champ"><label>${_t("Où se rangent les personnes à la maison")}${bulleI(_t("Glisse les avatars sur le plan pour les placer."))}</label><select data-amb="personnes.maison"><option value="">${_t("Au centre de la maison")}</option>${d.pieces.filter((p) => !p.sous_zone && p.nom).map((p) => `<option ${pe.maison === p.nom ? "selected" : ""}>${esc(p.nom)}</option>`).join("")}${Array.isArray(pe.maison) ? `<option value="__perso" selected>${_t("Position personnalisée ({pos} cm)", { pos: esc(pe.maison.join(", ")) })}</option>` : ""}</select></div>
        ${this._lignesPersonnes(d)}` : ""}` : ""}
      <h4>${_t("Animations par événement")}${bulleI(_t("Type, couleur et durée d'un cycle. Chaque élément peut avoir la sienne (section « Animation » de son panneau)."))}</h4>
      ${Object.keys(EV).map(ligneEv).join("")}
      <div class="ed-actions"><button class="ed-btn contour" data-act="amb-reinit" ${d.animations ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon>${_t("Animations par défaut")}</button></div>
      <h4 data-ancre="alertes">${_t("Alertes plein plan")}${bulleI(_t("Le plan entier s'allume (voile, bandeau, éléments entourés) tant que l'alerte dure ; « Masquer » la cache jusqu'au prochain changement."))}</h4>
      ${AL.map((r, i) => (r && typeof r === "object" ? regle(r, i) : "")).join("")}
      <div class="ed-actions"><button class="ed-btn tonal" data-al-act="nouvelle"><ha-icon icon="mdi:plus"></ha-icon>${_t("Alerte sur des entités")}</button>
        <button class="ed-btn contour" data-al-act="intrusion"><ha-icon icon="mdi:door-open"></ha-icon>${_t("Ouverture, maison vide")}</button></div>`);
    const P = this.panneau;
    P.onclick = (ev) => {
      const el = ev.composedPath().find((n) => n.dataset && (n.dataset.act || n.dataset.ambSet || n.dataset.animEffacer));
      if (!el) return;
      const ds = el.dataset;
      if (ds.act === "amb-fermer") return this.panneauAmbiance(false);
      if (ds.act === "amb-reinit") return this._majAmb((d) => { delete d.animations; });
      if (ds.ambSet) { const [k, v] = ds.ambSet.split(":"); return this._majAmb((d) => { if (v === "discret") delete d.ambiance[k]; else d.ambiance[k] = v; }); }
      if (ds.animEffacer) return this._majAmb((d) => poserChemin((d.animations ||= {}), ds.animEffacer, ""));
    };
    const clicAl = P.onclick;
    P.onclick = async (ev) => {
      const b = ev.composedPath().find((n) => n.dataset?.alAct);
      if (!b) return clicAl(ev);
      const [op, i, k] = b.dataset.alAct.split(":");
      if (op === "nouvelle") return this._majAmb((d) => { (d.alertes ||= []).push({ nom: _t("Alerte"), entites: [] }); });
      if (op === "intrusion") return this._majAmb((d) => { (d.alertes ||= []).push({ nom: _t("Ouverture alors que la maison est vide"), type: "ouvertures", si_absent: true }); });
      if (op === "suppr") return this._majAmb((d) => { d.alertes.splice(+i, 1); });
      if (op === "retirer") return this._majAmb((d) => { const r = d.alertes[+i], l = [...(r.entites || []), ...(r.entite ? [r.entite] : [])]; l.splice(+k, 1); delete r.entite; r.entites = l; });
      if (op === "ajouter") {
        const e = await this.choisirEntite({ titre: _t("Entité de l'alerte") });
        if (e) this._majAmb((d) => { const r = d.alertes[+i]; r.entites = [...new Set([...(r.entites || []), ...(r.entite ? [r.entite] : []), e])]; delete r.entite; });
      }
    };
    P.querySelectorAll("[data-alk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const v = inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim();
      poserChemin(d.alertes, inp.dataset.alk, v);
    }); });
    P.querySelectorAll("[data-alk-chk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => poserChemin(d.alertes, inp.dataset.alkChk, inp.checked)); });
    P.querySelectorAll("[data-amb-chk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const k = inp.dataset.ambChk;
      if (k === "actif") { if (inp.checked) d.ambiance = { ...(d.ambiance || {}) }; else delete d.ambiance; return; }
      if (k === "energie" || k === "personnes") { if (inp.checked) d.ambiance[k] = {}; else delete d.ambiance[k]; return; }
      if (k === "jour_nuit") { if (inp.checked) delete d.ambiance.jour_nuit; else d.ambiance.jour_nuit = false; return; }
      if (k === "marqueur") { const j = typeof d.ambiance.jour_nuit === "object" ? d.ambiance.jour_nuit : {}; if (inp.checked) delete j.marqueur; else j.marqueur = false; if (Object.keys(j).length) d.ambiance.jour_nuit = j; else delete d.ambiance.jour_nuit; }
    }); });
    // réglage d'une personne quand elle est dehors (`par_personne`) : vide = comme les autres
    P.querySelectorAll("[data-amb-pers]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const pe = d.ambiance?.personnes;
      if (!pe) return;
      const o = typeof pe === "object" && !Array.isArray(pe) ? pe : Array.isArray(pe) ? { entites: pe } : {}, e = inp.dataset.ambPers;
      const pp = o.par_personne && typeof o.par_personne === "object" ? o.par_personne : {}, r = { ...(pp[e] && typeof pp[e] === "object" ? pp[e] : {}) };
      if (inp.value) r.dehors = inp.value; else delete r.dehors;
      if (Object.keys(r).length) pp[e] = r; else delete pp[e];
      if (Object.keys(pp).length) o.par_personne = pp; else delete o.par_personne;
      d.ambiance.personnes = o;
    }); });
    P.querySelectorAll("[data-amb]").forEach((inp) => {
      const k = inp.dataset.amb;
      if (inp.type === "range") inp.oninput = () => { inp.parentElement.querySelector("output").textContent = +inp.value ? `${inp.value} min` : _t("aucune"); };
      inp.onchange = () => this._majAmb((d) => {
        const v = inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value;
        if (v === "__perso") return; // position glissée sur le plan : déjà enregistrée
        if (k === "traces") { if (+v === 10) delete d.ambiance.traces; else d.ambiance.traces = +v || false; return; }
        if (k === "meteo" && d.ambiance.meteo && typeof d.ambiance.meteo === "object") { if (v) d.ambiance.meteo.entite = v; else delete d.ambiance.meteo; return; }
        if (k.includes(".")) { const [p] = k.split("."); if (!d.ambiance[p] || typeof d.ambiance[p] !== "object" || Array.isArray(d.ambiance[p])) d.ambiance[p] = {}; return poserChemin(d.ambiance, k, v); }
        if (v === "" || v == null) delete d.ambiance[k]; else d.ambiance[k] = v;
      });
    });
    P.querySelectorAll("[data-anim]").forEach((inp) => {
      inp.onchange = () => this._majAmb((d) => {
        const an = (d.animations ||= {}), [ev] = inp.dataset.anim.split(".");
        if (typeof an[ev] === "string") an[ev] = { type: an[ev] };
        poserChemin(an, inp.dataset.anim, inp.dataset.num ? (inp.value === "" ? "" : Math.min(20, Math.max(0.2, +inp.value))) : inp.value);
      });
    });
    this._cablerIcones(P);
  }
  // panneau Ambiance ouvert : glisser les avatars à la maison déplace leur point de rassemblement (ambiance.personnes.maison,
  // en cm, sur la grille sauf Alt) ; le résumé des personnes n'est pas redessiné pendant le glisser
  glisserPersonnes(ev) {
    const c = this.carte, R = c.shadowRoot, x0 = ev.clientX, y0 = ev.clientY, m0 = c._pointMaison(), a = c._pxVersCm(x0, y0);
    getSelection?.()?.removeAllRanges?.();
    const els = () => [...R.querySelectorAll(".calque>.pers[data-pers]:not(.dehors)")];
    let actif = false, pos = null;
    c._glissePers = true;
    const mv = (e) => {
      if (!actif) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) < 4) return;
        actif = true;
        els().forEach((el) => el.classList.add("glisse"));
      }
      e.preventDefault();
      const b = c._pxVersCm(e.clientX, e.clientY), g = e.altKey ? 1 : this.grille || 1, q = c.vue();
      pos = [0, 1].map((k) => Math.round((m0[k] + b[k] - a[k]) / g) * g);
      els().forEach((el) => {
        el.dataset.x = pos[0]; el.dataset.y = pos[1];
        el.style.left = `${((pos[0] - q.x0) / q.W) * 100}%`; el.style.top = `${((pos[1] - q.y0) / q.H) * 100}%`;
      });
    };
    const fin = (e) => {
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
      c._glissePers = false;
      els().forEach((el) => el.classList.remove("glisse"));
      if (!actif) return;
      c._aBouge = true;
      setTimeout(() => { c._aBouge = false; }, 0);
      if (e.type !== "pointerup" || !pos) return c._majPersonnes();
      const p = pos.map((x) => Math.round(x));
      this._majAmb((d) => {
        const v = d.ambiance?.personnes;
        if (!d.ambiance) return;
        d.ambiance.personnes = Array.isArray(v) ? { entites: v, maison: p } : { ...(v && typeof v === "object" ? v : {}), maison: p };
      });
      this.snack(_t("Personnes placées ici quand elles sont à la maison."));
    };
    window.addEventListener("pointermove", mv, { passive: false }); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
  }
  // une ligne par personne : avatar, nom, et où la mettre quand elle est dehors (comme les autres / direction / zone / masquée)
  _lignesPersonnes(d) {
    const pe = d.ambiance?.personnes, o = pe && typeof pe === "object" && !Array.isArray(pe) ? pe : {}, l = this.carte._listePersonnes(d.ambiance);
    if (!l.length) return "";
    const N = { direction: _t("Direction et distance"), zone: _t("Zone"), cache: _t("Masquée") }, g = N[o.dehors] ? o.dehors : "direction";
    return `<div class="ed-champ ed-pers"><label>${_t("Quand elle est dehors")}</label><div class="ed-aide">${_t("Réglage commun (⚙ Paramètres) : {mode}", { mode: N[g] })}</div>${l.map(({ entite: e }) => {
      const nom = this.carte._nom(e) === e ? e.split(".")[1] : this.carte._nom(e), v = o.par_personne?.[e]?.dehors;
      const ini = nom.trim().split(/[\s_]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
      return `<div class="ed-pers-l"><span><i aria-hidden="true">${esc(ini)}</i>${esc(nom)}</span><select data-amb-pers="${esc(e)}" aria-label="${esc(_t("{nom} : quand elle est dehors", { nom }))}">
        <option value="">${_t("Comme les autres")}</option>${Object.entries(N).map(([k, n]) => `<option value="${esc(k)}" ${v === k ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
    }).join("")}</div>`;
  }
  _champNombreAl(k, v) { return `<div class="ed-champ"><label>${_t("Ou au-dessus de")}</label><input type="number" step="any" data-alk="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="—"></div>`; }
  // écriture de l'ambiance ou des animations : objets vides retirés (le YAML reste minimal)
  _majAmb(fn) {
    this.commit(() => {
      const d = this.d;
      fn(d);
      if (Array.isArray(d.alertes) && !d.alertes.length) delete d.alertes;
      if (d.animations) {
        for (const [k, v] of Object.entries(d.animations)) if (!v || (typeof v === "object" && !Object.keys(v).length)) delete d.animations[k];
        if (!Object.keys(d.animations).length) delete d.animations;
      }
    });
  }
  // section « Animation » d'un élément : remplace celle de l'événement pour cet élément seulement
  _sectionAnimation(o, ev, cle = "animation", titre = _t("Animation")) {
    const C = this.carte.constructor, AN = C.ANIMATIONS, base = C.animDe(this.d, ev, null), a = typeof o[cle] === "string" ? { type: o[cle] } : o[cle] || {};
    return `<details class="ed-avance"${o[cle] ? " open" : ""}><summary>${esc(titre)}${a.type && AN[a.type] ? ` · ${esc(_t(AN[a.type]))}` : ""}</summary>
      <div class="ed-aide">${_t("Par défaut : celle du plan ({anim}).", { anim: esc(_t(AN[base.type]).split(" (")[0]) })}</div>
      <div class="ed-champ"><label>${_t("Type")}</label><select data-k="${cle}.type"><option value="">${_t("Celle du plan")}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${a.type === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>
      <div class="ed-ligne"><div class="ed-champ"><label>${a.couleur ? _t("Couleur") : _t("Couleur (celle de l'élément)")}</label><span class="ed-couleur-anim"><input type="color" data-k="${cle}.couleur" value="${esc(/^#[0-9a-f]{6}$/i.test(a.couleur || "") ? a.couleur : "#f4b400")}">${a.couleur ? `<button class="ib" data-effacer="${cle}.couleur" title="${_t("Couleur de l'élément")}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</span></div>
        ${this._champNombre(_t("Durée d'un cycle (s)"), `${cle}.duree`, a.duree, 0.1, `${base.duree}`)}</div>
      <div class="ed-ligne">${this._champNombre(_t("Intensité (0,2 à 2)"), `${cle}.intensite`, a.intensite, 0.1, "1")}
        ${ev === "meuble" ? `<div class="ed-champ"><label>${_t("Forme de l'onde")}</label><select data-k="${cle}.forme"><option value="">${_t("Cercle")}</option><option value="contour" ${a.forme === "contour" ? "selected" : ""}>${_t("Contour du meuble")}</option></select></div>` : ""}</div></details>`;
  }

  // j = nouvelle place dans la liste affichée (premier plan en haut, donc ordre de dessin inversé)
  _deplacerCalque(groupe, k, j) {
    const vue = [...this.carte._calques()[groupe]].reverse().filter((x) => x !== k);
    vue.splice(j, 0, k);
    this._majCalques((q) => { q[`ordre_${groupe}`] = vue.reverse(); });
  }

  // section « Connecté » d'un meuble : entité, valeur, comportement au toucher, protection, fiche (widgets)
  _sectionConnecte(o, def) {
    const dom = (o.entite || "").split(".")[0], lie = !!(o.entite || o.valeur || o.fiche);
    const defaut = o.fiche ? _t("la fiche") : o.entite || o.valeur ? _t("la fiche HA") : _t("rien");
    let h = `<h4>${_t("Connecté")}${bulleI(_t("S'allume sur le plan et ouvre sa fiche au toucher."))}</h4>
      ${this._champEntite(_t("Entité"), "entite", o.entite, true)}`;
    if (!lie) return h;
    const parType = this.carte.constructor.COULEURS_TYPE?.[o.type];
    h += `${this._champEntite(_t("Valeur affichée sur le meuble"), "valeur", o.valeur, true, "sensor")}
      <div class="ed-champ"><label>${_t("Couleur sur le plan")}</label><div class="ed-couleurs">${COULEURS.map(([n, c]) => `<button data-couleur="${c}" title="${_t(n)}" class="${(o.couleur || "").toLowerCase() === c ? "on" : ""}" style="background:${c}"></button>`).join("")}
          <input type="color" data-k="couleur" value="${esc(/^#[0-9a-f]{6}$/i.test(o.couleur || parType || "") ? o.couleur || parType : "#1a73e8")}" title="${_t("Autre couleur")}">
          ${o.couleur ? `<button class="ed-btn texte" data-effacer="couleur">${parType ? _t("Couleur du type") : _t("Accent du thème")}</button>` : ""}</div></div>
      ${this._interInv(_t("Toujours teinté"), "teinte", o.teinte !== false, _t("Sinon seulement quand il est actif."))}
      <div class="ed-champ"><label>${_t("Au toucher, en vue")}</label><select data-k="clic"><option value="">${_t("Par défaut ({d})", { d: defaut })}</option>
        ${[["fiche", _t("Ouvrir sa fiche")], ["infos", _t("Ouvrir la fiche HA (plus d'infos)")], ["aucun", _t("Rien (pas cliquable)")]].map(([v, n]) => `<option value="${esc(v)}" ${o.clic === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${this._champsInterrupteur(o, dom)}
      <details class="ed-avance" ${o.actif || o.actif_attribut || o.seuil != null || o.unite || o.decimales != null ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <h4>${_t("Quand le meuble est « actif » (contour coloré)")}${bulleI(_t("Par défaut : quand l'entité est allumée, ouverte ou en marche."))}</h4>
        ${this._champEntite(_t("Selon une autre entité"), "actif", o.actif, true)}
        <div class="ed-ligne">${this._champTexte(_t("ou selon l'attribut"), "actif_attribut", o.actif_attribut, _t("ex. hvac_action"))}${this._champNombre(_t("Actif au-dessus de"), "seuil", o.seuil, 1, _t("ex. 5 (W)"))}</div>
        <div class="ed-ligne">${this._champTexte(_t("Unité de la valeur"), "unite", o.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, "0")}</div>
</details>
      ${this._listeFiche(o, "meuble", o.nom || _t(def.nom), _t("Sans widget, la fiche montre l'état et le bouton marche / arrêt."))}`;
    const pastilles = this._pastillesProches(o);
    if (pastilles.length) h += `<div class="ed-champ"><label>${_t("Pastille de la même entité à côté")}</label>${pastilles.map((j) => `<button class="ed-btn tonal" data-act="fusion:${j}" title="${_t("La pastille est retirée, sa valeur, son état actif et sa couleur passent au meuble (Annuler possible)")}"><ha-icon icon="mdi:merge"></ha-icon>${_t("Fusionner avec « {nom} »", { nom: esc(this.d.points[j].nom || this.carte._nom(this.d.points[j].entite)) })}</button>`).join("")}</div>`;
    return h;
  }

  // interrupteur marche / arrêt de l'élément (fiche, vue de la pièce) : protection (pas d'arrêt) et confirmation forcée (`confirm`)
  _champsInterrupteur(o, dom) {
    if (!BASCULES_ED.includes(dom)) return "";
    return `${this._inter(_t("Protégé (sans bouton d'arrêt)"), "protege", o.protege, _t("Pas de bouton d'arrêt dans la fiche (frigo, congélateur…)."))}
      ${this._inter(_t("Toujours demander confirmation"), "confirmer", o.confirmer, _t("Marche et arrêt confirmés avant chaque appel (fiche, vue de la pièce), ex. une porte de garage commandée par un switch."))}`;
  }
  // fiche d'une ouverture ou d'une pastille : comportement au toucher, protection, widgets (mêmes outils que pour un meuble)
  _sectionFiche(o, genre) {
    const e = genre === "ouverture" ? o.contact || o.entite : o.entite, dom = (e || "").split(".")[0];
    const defaut = o.fiche ? _t("la fiche") : (genre === "ouverture" ? o.contact || o.entite || o.volet : o.entite) ? _t("la fiche HA") : _t("rien");
    const titre = o.nom || (e || o.volet ? this.carte._nom(e || o.volet) : { fenetre: _t("Fenêtre"), porte: _t("Porte"), portail: _t("Portail") }[o.type] || _t("Ouverture"));
    return `<div class="ed-champ"><label>${_t("Au toucher, en vue")}</label><select data-k="clic"><option value="">${_t("Par défaut ({d})", { d: defaut })}</option>
        ${[["fiche", _t("Ouvrir sa fiche")], ["infos", _t("Ouvrir la fiche HA (plus d'infos)")], ["aucun", _t("Rien")]].map(([v, n]) => `<option value="${esc(v)}" ${o.clic === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${this._champsInterrupteur(o, dom)}
      ${this._listeFiche(o, genre, titre, genre === "ouverture" ? _t("Sans widget, la fiche montre l'état du contact (et du volet) ; « commande » pour piloter un volet ou un portail.") : _t("Sans widget, la fiche montre l'état et, pour une lumière ou une prise, le bouton marche / arrêt."))}`;
  }
  // titre, liste des widgets et actions d'une fiche (meuble, ouverture ou pastille sélectionné)
  _listeFiche(o, genre, titreDef, aide) {
    const l = o.fiche?.widgets || [], i = this.sel.i;
    const remplir = genre === "meuble" ? this._entitesAppareil(o.entite).length > 1 : this._proposer(genre, o).widgets.length > 0;
    return `<h4>${_t("Fiche ({n} widget)|Fiche ({n} widgets)", { n: l.length })}${bulleI(`${_t("Mêmes widgets que les panneaux.")} ${aide}`)}</h4>
      ${this._champTexte(_t("Titre de la fiche"), "fiche.titre", o.fiche?.titre, titreDef)}
      ${this._champPlusInfos(o)}
      ${l.length ? `<div class="ed-liste">${l.map((w, j) => `<button data-choix="${cle({ type: "widget", cote: "fiche", i: j, [genre]: i })}"><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(w.titre || typeWidgetEn(w.type))}<small>${esc(typeWidgetEn(w.type))}</small></span></button>`).join("")}</div>` : ""}
      <div class="ed-actions"><button class="ed-btn contour" data-act="fiche-ajouter"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un widget")}</button>
        ${remplir ? `<button class="ed-btn tonal" data-act="fiche-remplir" title="${_t("Widgets proposés d'après les entités du même appareil HA : aperçu, puis validation")}"><ha-icon icon="mdi:auto-fix"></ha-icon>${_t("Remplir depuis l'appareil")}</button>` : ""}
        ${l.length ? `<button class="ed-btn contour" data-act="fiche-modele" title="${_t("Réutilisable pour une autre fiche ou dans un panneau (Ajouter › Mes modèles)")}"><ha-icon icon="mdi:bookmark-plus-outline"></ha-icon>${_t("Fiche en modèle")}</button>` : ""}</div>`;
  }

  // bouton « Plus d'infos » de la fiche (`card.more_info`) : par défaut l'entité de la fiche, une autre entité, une page (chemin ou URL), ou masqué
  _champPlusInfos(o) {
    const pi = o.fiche?.plus_infos, lien = (v) => typeof v === "string" && /^(\/|https?:\/\/)/i.test(v);
    const mode = pi === false ? "masque" : typeof pi === "string" && pi ? (lien(pi) ? "lien" : "entite") : this._modeInfos === cle(this.sel) ? "lien" : "";
    const opts = [["", _t("Par défaut (entité de la fiche)")], ["entite", _t("Une autre entité")], ["lien", _t("Une page (chemin ou URL)")], ["masque", _t("Masqué")]];
    return `<div class="ed-champ"><label>${_t("Bouton « Plus d'infos »")}${bulleI(_t("Ce que fait le bouton ⓘ en haut de la fiche : plus d'infos de HA pour une entité, ou ouverture d'une page (/lovelace/energie, https://…)."))}</label>
        <select data-k="_plus_infos">${opts.map(([v, n]) => `<option value="${esc(v)}" ${mode === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${mode === "entite" ? this._champEntite(_t("Entité ouverte"), "fiche.plus_infos", pi, false) : ""}
      ${mode === "lien" ? this._champTexte(_t("Chemin ou URL"), "fiche.plus_infos", lien(pi) ? pi : "", "/lovelace/energie") : ""}`;
  }

  // ---------- pré-remplissage de la fiche et fusion avec une pastille ----------
  // entités du même appareil HA (device_id) que l'entité du meuble, visibles et pas de configuration
  _entitesAppareil(e) {
    const hass = this.hass, dev = e && hass.entities?.[e]?.device_id;
    if (!dev) return [];
    return Object.entries(hass.entities).filter(([id, x]) => x.device_id === dev && !x.hidden && x.entity_category !== "config" && hass.states[id]).map(([id]) => id).sort();
  }
  // pastilles de la même entité à moins de 1,5 m du meuble
  _pastillesProches(m) {
    if (!m.entite) return [];
    return (this.d.points || []).map((p, j) => (p.entite === m.entite && Math.hypot(nbr(p.pos?.[0]) - nbr(m.pos?.[0]), nbr(p.pos?.[1]) - nbr(m.pos?.[1])) < 150 ? j : -1)).filter((j) => j >= 0);
  }
  fusionner(j) {
    const m = this._objet(), p = this.d.points?.[j];
    if (this.sel?.type !== "meuble" || !m || !p) return;
    const nom = p.nom || this.carte._nom(p.entite);
    this.commit(() => {
      for (const k of ["valeur", "actif", "actif_attribut", "seuil", "attribut", "unite", "decimales", "couleur"]) if (p[k] != null && p[k] !== "" && m[k] == null) m[k] = clone(p[k]);
      if (!m.nom && p.nom) m.nom = p.nom;
      this.d.points.splice(j, 1);
    });
    this.snack(p.halo ? _t("Pastille « {nom} » fusionnée dans le meuble (son halo est retiré).", { nom }) : _t("Pastille « {nom} » fusionnée dans le meuble.", { nom }), _t("Annuler##defaire"), this._annulation(), 10000);
  }
  // widgets proposés d'après le type de meuble et les entités de l'appareil (device_class, unités, noms) ; rien n'est écrit ici
  _proposerFiche(m) {
    const hass = this.hass, ents = this._entitesAppareil(m.entite).filter((e) => e !== m.entite || !["switch", "light", "fan", "input_boolean"].includes(e.split(".")[0]));
    const st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, u = (e) => String(st(e)?.attributes.unit_of_measurement || ""), dom = (e) => e.split(".")[0];
    const txt = (e) => `${e} ${st(e)?.attributes.friendly_name || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const capteur = (e) => dom(e) === "sensor";
    const souscrit = (e) => /souscri|subscri|abonnement/.test(txt(e));
    const G = {
      puissance: ents.filter((e) => capteur(e) && (dc(e) === "power" || ["W", "kW"].includes(u(e)))),
      apparente: ents.filter((e) => capteur(e) && !souscrit(e) && (dc(e) === "apparent_power" || ["VA", "kVA"].includes(u(e)))),
      energie: ents.filter((e) => capteur(e) && (dc(e) === "energy" || ["kWh", "Wh", "MWh"].includes(u(e)))),
      cout: ents.filter((e) => capteur(e) && !/\/\s*kwh/i.test(u(e)) && (dc(e) === "monetary" || /€|eur/i.test(u(e)))),
      prix: ents.filter((e) => capteur(e) && /\/\s*kwh/i.test(u(e))),
      tension: ents.filter((e) => capteur(e) && (dc(e) === "voltage" || u(e) === "V")),
      courant: ents.filter((e) => capteur(e) && (dc(e) === "current" || u(e) === "A")),
      temperature: ents.filter((e) => capteur(e) && (dc(e) === "temperature" || /°[CF]/.test(u(e)))),
      alerte: ents.filter((e) => dom(e) === "binary_sensor" && (["problem", "safety", "heat", "smoke", "moisture", "gas"].includes(dc(e)) || /alerte|alarm|surchauffe|overheat|defaut|erreur|fault/.test(txt(e)))),
      branche: ents.filter((e) => dom(e) === "binary_sensor" && ["plug", "battery_charging"].includes(dc(e))),
      climat: ents.filter((e) => dom(e) === "climate"), media: ents.filter((e) => dom(e) === "media_player"), souscrite: ents.filter((e) => capteur(e) && souscrit(e)),
    };
    // coût calculé par le tableau Énergie de HA pour un compteur de l'appareil (sensor.x_cost)
    for (const e of G.energie) for (const c of [`${e}_cost`, `${e}_cout`]) if (st(c) && !G.cout.includes(c)) G.cout.push(c);
    const ordre = (l) => [...l].sort((a, b) => { const r = (e) => [/session/, /jour|today|aujourd/, /hier|yesterday/, /semaine|week/, /mois|month/, /annee|annuel|year/].findIndex((x) => x.test(txt(e))); return ((r(a) + 7) % 7) - ((r(b) + 7) % 7) || a.localeCompare(b); });
    const lignes = (l) => l.map((e) => ({ entite: e }));
    const W = [], pw = G.puissance[0], reglages = {};
    const conso = (titre, extra = []) => {
      const l = [...extra, ...ordre(G.energie), ...ordre(G.cout)];
      if (pw) W.push({ type: "tuile", titre, icone: "mdi:flash", entite: pw, decimales: 0, historique: 24, ...(l.length ? { lignes: lignes(l) } : {}) });
      else if (l.length) W.push({ type: "entites", titre, entites: lignes(l) });
    };
    if (m.type === "borne_recharge") {
      conso(_t("Puissance de charge"));
      const l = [...G.branche, ...G.tension, ...G.temperature, ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Borne"), icone: "mdi:ev-station", entites: lignes(l) });
    } else if (m.type === "tableau_elec") {
      const p = pw || G.apparente[0], sc = G.souscrite.map((e) => parseFloat(st(e).state) * (/^k/i.test(u(e)) ? 1000 : 1)).find((x) => x > 0);
      if (p) W.push({ type: "jauge", titre: _t("Puissance"), icone: "mdi:home-lightning-bolt", entite: p, min: 0, max: Math.round(sc || 6000), decimales: 0 });
      const res = [...G.apparente.filter((e) => e !== p), ...G.puissance.filter((e) => e !== p), ...G.tension, ...G.courant];
      if (res.length) W.push({ type: "entites", titre: _t("Réseau"), icone: "mdi:transmission-tower", entites: lignes(res) });
      const en = ordre(G.energie);
      if (en.length) W.push({ type: "entites", titre: _t("Consommation"), icone: "mdi:lightning-bolt", entites: lignes([...en, ...ordre(G.cout)]) });
      // Tempo et prix : souvent une autre intégration que le compteur, cherchés dans toute l'installation
      const tous = Object.keys(hass.states), tempo = (re) => tous.find((e) => e.startsWith("sensor.") && /tempo/.test(txt(e)) && re.test(txt(e)));
      const prix = G.prix[0] || tous.find((e) => e.startsWith("sensor.") && /\/\s*kwh/i.test(u(e)));
      const cj = tempo(/aujourd|today|jour/), cd = tempo(/demain|tomorrow/);
      if (prix || cj || cd) W.push({ type: "tarif", titre: _t("Tarif"), ...(prix ? { prix } : {}), ...(cj ? { couleur_jour: cj } : {}), ...(cd ? { couleur_demain: cd } : {}) });
    } else if (m.type === "chaudiere" || G.climat.length) {
      const l = [...G.climat, ...G.temperature, ...G.puissance, ...ordre(G.energie), ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Chauffage"), icone: "mdi:water-boiler", entites: lignes(l) });
    } else {
      conso(m.type === "meuble_tv" ? _t("Télévision") : _t("Consommation"), G.media);
      if (!pw && !G.energie.length) { const l = ents.filter((e) => e !== m.entite).slice(0, 8); if (l.length) W.push({ type: "entites", titre: _t("Appareil"), entites: lignes(l) }); }
      else if (G.alerte.length || G.temperature.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes([...G.temperature, ...G.alerte]) });
    }
    if (!m.valeur && pw) reglages.valeur = pw;
    if (!m.actif && pw && ["switch", "input_boolean"].includes(dom(m.entite || ""))) Object.assign(reglages, { actif: pw, seuil: m.type === "borne_recharge" ? 50 : 5 });
    return { widgets: W, reglages, n: ents.length };
  }
  // entités de référence d'une ouverture ou d'une pastille (contact, volet, entité motorisée ; entité de la pastille)
  _sources(genre, o) { return (genre === "ouverture" ? [o.contact, o.volet, o.entite] : genre === "point" ? [o.entite] : [o.entite]).filter((e) => typeof e === "string" && e.includes(".")); }
  // propositions selon le genre de l'élément ; rien n'est écrit ici
  _proposer(genre, o) {
    if (genre === "meuble") return this._proposerFiche(o);
    return genre === "ouverture" ? this._proposerFicheOuverture(o) : this._proposerFichePoint(o);
  }
  // capteurs d'un appareil de contact : batterie, manipulation (tamper), compteurs du jour (« ouvertures », « aération »)
  _capteursContact(ents) {
    const hass = this.hass, st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, dom = (e) => e.split(".")[0];
    const txt = (e) => `${e} ${st(e)?.attributes.friendly_name || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const compteurs = ents.filter((e) => dom(e) === "sensor" && /ouvertures|aeration|openings|times opened|airing|ventilation/.test(txt(e)));
    let batterie = ents.filter((e) => dom(e) === "sensor" && (dc(e) === "battery" || (/batter/.test(txt(e)) && st(e)?.attributes.unit_of_measurement === "%")));
    if (!batterie.length) batterie = ents.filter((e) => dom(e) === "binary_sensor" && dc(e) === "battery");
    const tamper = ents.filter((e) => dom(e) === "binary_sensor" && (dc(e) === "tamper" || /tamper|manipulation|sabotage|arrachement/.test(txt(e))));
    return { batterie, tamper, compteurs };
  }
  // ouverture : volet ou portail en widget « commande », contact, batterie, manipulation, compteurs du jour (même appareil HA)
  _proposerFicheOuverture(o) {
    const hass = this.hass, src = this._sources("ouverture", o), ents = [...new Set(src.flatMap((e) => this._entitesAppareil(e)))].filter((e) => !src.includes(e));
    const dom = (e) => e.split(".")[0], lignes = (l) => [...new Set(l)].map((e) => ({ entite: e })), W = [];
    const { batterie, tamper, compteurs } = this._capteursContact(ents), cover = (e) => typeof e === "string" && e.startsWith("cover.");
    const icone = { fenetre: "mdi:window-closed-variant", porte: "mdi:door", portail: "mdi:gate" }[o.type] || "mdi:door";
    if (o.type === "portail") {
      const c = cover(o.entite) ? o.entite : cover(o.volet) ? o.volet : null;
      if (c) W.push({ type: "commande", titre: o.nom || hass.states[c]?.attributes.friendly_name || _t("Portail"), entite: c, confirmer: true });
      // capteurs liés : ceux des mêmes appareils (hors diagnostic, sauf la batterie), le contact s'il y en a un
      const diag = (e) => hass.entities?.[e]?.entity_category === "diagnostic";
      const autres = ents.filter((e) => ["binary_sensor", "sensor"].includes(dom(e)) && (!diag(e) || batterie.includes(e)));
      const l = [o.contact, ...autres].filter(Boolean);
      if (l.length) W.push({ type: "entites", titre: _t("Capteurs"), icone: "mdi:gate", entites: lignes(l) });
      return { widgets: W, reglages: {}, n: ents.length + src.length };
    }
    if (cover(o.volet)) W.push({ type: "commande", titre: _t("Volet"), entite: o.volet });
    if (cover(o.entite)) W.push({ type: "commande", titre: o.nom || hass.states[o.entite]?.attributes.friendly_name || _t("Ouverture motorisée"), entite: o.entite });
    const capteur = [o.contact, ...batterie, ...tamper].filter(Boolean);
    // le contact seul n'apporte rien de plus que l'en-tête de la fiche, sauf à côté d'un volet
    if (capteur.length > (o.contact ? 1 : 0) || (o.contact && W.length)) W.push({ type: "entites", titre: _t("Capteur"), icone, entites: lignes(capteur) });
    if (compteurs.length) W.push({ type: "entites", titre: _t("Aujourd'hui"), icone: "mdi:counter", entites: lignes(compteurs) });
    return { widgets: W, reglages: {}, n: ents.length + src.length };
  }
  // pastille : selon le domaine de son entité (cover → commande, capteur → courbe, détecteur → batterie…, sinon comme un meuble)
  _proposerFichePoint(p) {
    const hass = this.hass, e = p.entite;
    if (typeof e !== "string" || !e.includes(".")) return { widgets: [], reglages: {}, n: 0 };
    const d = e.split(".")[0], ents = this._entitesAppareil(e).filter((x) => x !== e), st = (x) => hass.states[x], dom = (x) => x.split(".")[0], lignes = (l) => [...new Set(l)].map((x) => ({ entite: x }));
    const diag = (x) => hass.entities?.[x]?.entity_category === "diagnostic", mesures = ents.filter((x) => ["sensor", "binary_sensor"].includes(dom(x)) && !diag(x));
    const W = [];
    if (d === "cover") {
      W.push({ type: "commande", titre: p.nom || st(e)?.attributes.friendly_name || _t("Commande"), entite: e });
      if (mesures.length) W.push({ type: "entites", titre: _t("Capteurs"), entites: lignes(mesures) });
    } else if (d === "sensor") {
      const num = !isNaN(parseFloat(st(e)?.state));
      W.push(num ? { type: "tuile", titre: st(e)?.attributes.friendly_name || _t("Valeur"), entite: e, historique: 24 } : { type: "entites", titre: _t("Valeur"), entites: lignes([e]) });
      if (mesures.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes(mesures.slice(0, 8)) });
    } else if (d === "binary_sensor") {
      const { batterie, tamper } = this._capteursContact(ents), reste = mesures.filter((x) => !batterie.includes(x) && !tamper.includes(x));
      W.push({ type: "entites", titre: _t("Détecteur"), icone: p.icone, entites: lignes([e, ...batterie, ...tamper, ...reste.slice(0, 6)]) });
    } else return { ...this._proposerFiche({ entite: e }), reglages: {} }; // lumière, prise, média, climat… : comme un meuble connecté, sans toucher à la pastille
    return { widgets: W, reglages: {}, n: ents.length + 1 };
  }
  // aperçu des widgets proposés (vrai rendu), puis « Ajouter » ou « Remplacer la fiche »
  remplirFiche() {
    const s = this.sel, m = this._objet(), src = m && Object.hasOwn(GENRES_FICHE, s?.type) ? this._sources(s.type, m) : [];
    if (!src.length) return;
    const { widgets, reglages, n } = this._proposer(s.type, m), e0 = src.find((e) => this.hass.entities?.[e]?.device_id) || src[0], dev = this.hass.devices?.[this.hass.entities?.[e0]?.device_id];
    if (!widgets.length) return this.snack(s.type === "meuble" ? _t("Rien à proposer : l'appareil n'a pas de mesure reconnue (puissance, énergie, coût, tension…).") : _t("Rien à proposer : pas d'autre entité reconnue sur cet appareil."));
    const deja = (m.fiche?.widgets || []).length, R = this.R, carte = this.carte;
    let apercu;
    carte._sansBascule = true;
    try { apercu = widgets.map((w, j) => { try { return carte._widget(w, "apercu", j); } catch (e) { return ""; } }).join("").replace(/ data-w="[^"]*"/g, ""); } finally { carte._sansBascule = false; }
    const NOMS = { valeur: _t("Valeur affichée"), actif: _t("Actif selon"), seuil: _t("au-dessus de") };
    const voile = document.createElement("div");
    voile.className = "ed-voile";
    poserHTML(voile, `<div class="ed-dialogue large" role="dialog" aria-modal="true" aria-label="${_t("Remplir la fiche depuis l'appareil")}"><header><h2>${_t("Remplir la fiche depuis l'appareil")}</h2>
        <div class="ed-aide">${_t("« {nom} » : {n} entité. Widgets proposés.|« {nom} » : {n} entités. Widgets proposés.", { nom: esc(dev?.name_by_user || dev?.name || this.carte._nom(e0)), n })}</div></header>
      <div class="ed-cat"><div class="ed-apercu-fiche">${apercu}</div>
        ${Object.keys(reglages).length ? `<h4>${s.type === "meuble" ? _t("Réglages du meuble") : _t("Réglages de l'élément")}</h4><div class="ed-aide">${Object.entries(reglages).map(([k, v]) => `${NOMS[k]} : ${esc(k === "seuil" ? `${v}` : this.carte._nom(v))}`).join(" · ")}</div>` : ""}</div>
      <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="">${_t("Annuler")}</button>
        ${deja ? `<button class="ed-btn texte" data-r="remplacer">${_t("Remplacer la fiche ({n} widget)|Remplacer la fiche ({n} widgets)", { n: deja })}</button>` : ""}
        <button class="ed-btn plein" data-r="ajouter"><ha-icon icon="mdi:check"></ha-icon>${deja ? _t("Ajouter à la fiche") : _t("Ajouter")}</button></footer></div>`);
    const fermer = (r) => {
      voile.remove(); window.removeEventListener("keydown", echap, true);
      if (!r) return;
      this.commit(() => {
        const l = this._wl({ cote: "fiche", [s.type]: s.i }, true);
        if (r === "remplacer") l.length = 0;
        l.push(...clone(widgets));
        Object.assign(m, reglages);
        this.sel = { type: s.type, i: s.i };
      });
      this.snack(_t("Fiche remplie : {n} widget. Clique-les dans l'aperçu pour les modifier.|Fiche remplie : {n} widgets. Clique-les dans l'aperçu pour les modifier.", { n: widgets.length }), _t("Annuler##defaire"), this._annulation(), 10000);
    };
    const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer(null); } };
    window.addEventListener("keydown", echap, true);
    // l'aperçu n'est pas éditable : ses clics ne vont pas à la carte (sélection d'un widget, plus d'infos…)
    voile.onclick = (ev) => { ev.stopPropagation(); const b = ev.composedPath().find((x) => x.dataset?.r != null); if (ev.target === voile || b) fermer(b?.dataset.r || null); };
    R.querySelector("ha-card").append(voile);
    voile.querySelector("[data-r=ajouter]").focus();
  }
  // fiche vide (ni titre ni widget) : clé retirée, le YAML reste minimal
  _nettoyerFiche(m) {
    if (!m?.fiche || typeof m.fiche !== "object") return;
    if (Array.isArray(m.fiche.widgets) && !m.fiche.widgets.length) delete m.fiche.widgets;
    if (!m.fiche.titre) delete m.fiche.titre;
    if (!Object.keys(m.fiche).length) delete m.fiche;
  }
  async enregistrerFiche() {
    const m = this._objet(), l = m?.fiche?.widgets || [];
    if (!l.length) return;
    const r = await this.demander(_t("Enregistrer la fiche comme modèle"), m.fiche.titre || m.nom || (this.sel?.type === "meuble" ? (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : null) : this.sel?.type === "point" ? this.carte._nom(m.entite) : null) || _t("Fiche"), _t("Garder les entités (sinon les widgets sont à relier à nouveau)"));
    if (!r) return;
    const objets = r.coche ? clone(l) : sansEntites(clone(l));
    this.commit(() => (this.d.modeles ||= []).push({ nom: r.nom, genre: "widget", icone: "mdi:card-text-outline", desc: _t("Fiche · {n} widget|Fiche · {n} widgets", { n: l.length }), objets }));
    this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
  }

  // ---------- groupes : appartenance portée par chaque élément (clé « groupe », 5e valeur pour murs et limites) ----------
  _gr(k) { const o = this._elt(k); if (!o) return null; return Array.isArray(o) ? (typeof o[4] === "string" ? o[4] : null) : o.groupe || null; }
  _poserGr(k, g) {
    const o = this._elt(k);
    if (!o || k.startsWith("widget:") || k.startsWith("puce:")) return;
    if (Array.isArray(o)) { if (g) o[4] = g; else o.length = 4; } else if (g) o.groupe = g; else delete o.groupe;
  }
  _toutesCles() {
    const d = this.d, l = [];
    for (const [ty, liste] of Object.entries({ point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles })) (liste || []).forEach((_, i) => l.push(`${ty}:${i}`));
    return l;
  }
  _membres(g) { return this._toutesCles().filter((k) => this._gr(k) === g); }
  grouper() {
    const cles = [...this.multi].filter((k) => !/^(widget|puce):/.test(k));
    if (cles.length < 2) return this.snack(_t("Sélectionne au moins deux éléments (cadre ou Ctrl+clic) pour les grouper."));
    const id = `g${Date.now().toString(36)}`, n = (this.d.groupes || []).length + 1;
    this.commit(() => {
      (this.d.groupes ||= []).push({ id, nom: _t("Groupe {n}", { n }) });
      cles.forEach((k) => this._poserGr(k, id));
      this._nettoyerGroupes();
    });
    this.snack(_t("{n} éléments groupés : un clic prend tout le groupe, un second clic sans glisser entre dedans.", { n: cles.length }));
  }
  degrouper() {
    const gs = new Set([...this.multi].map((k) => this._gr(k)).filter(Boolean));
    if (!gs.size) return;
    this.commit(() => { for (const k of this._toutesCles()) if (gs.has(this._gr(k))) this._poserGr(k, null); this._nettoyerGroupes(); });
    this.snack(_t("Groupe défait."), _t("Annuler##defaire"), this._annulation(), 8000);
  }
  _nettoyerGroupes() {
    const compte = {};
    for (const k of this._toutesCles()) { const g = this._gr(k); if (g) compte[g] = (compte[g] || 0) + 1; }
    for (const k of this._toutesCles()) { const g = this._gr(k); if (g && compte[g] < 2) this._poserGr(k, null); }
    // un groupe utilisé mais absent de la liste (YAML écrit à la main) y est ajouté pour pouvoir le nommer et le défaire
    const connus = new Set((this.d.groupes || []).map((g) => g.id));
    Object.keys(compte).filter((g) => compte[g] >= 2 && !connus.has(g)).forEach((g) => (this.d.groupes ||= []).push({ id: g, nom: _t("Groupe {n}", { n: this.d.groupes.length + 1 }) }));
    if (this.d.groupes) { this.d.groupes = this.d.groupes.filter((g) => compte[g.id] >= 2); if (!this.d.groupes.length) delete this.d.groupes; }
  }
  _groupeSel() {
    const gs = new Set([...this.multi].map((k) => this._gr(k)));
    if (gs.size !== 1) return null;
    const [g] = gs;
    return g && this._membres(g).length === this.multi.size ? (this.d.groupes || []).find((x) => x.id === g) || { id: g, nom: _t("Groupe") } : null;
  }

  // pièce rectangulaire et ses 4 murs (sans doublon avec des murs déjà là, cas de deux pièces accolées)
  creerRectangle(x, y, w, h, opt = {}) {
    const z = opt.zone ?? this.zoneEnAttente;
    this.zoneEnAttente = null;
    const poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const sz = this.sousZoneEnAttente;
    if (sz) {
      // sous-zone : un contour nommé dans une pièce, sans murs
      this.sousZoneEnAttente = null;
      this.commit(() => { this.d.pieces.push({ nom: sz.nom, sous_zone: true, poly, etiquette: [x + w / 2, y + h / 2] }); this.sel = { type: "piece", i: this.d.pieces.length - 1 }; });
      this.choisirOutil("selection");
      this._deplier();
      return;
    }
    (opt.silencieux ? (f) => f() : (f) => this.commit(f))(() => {
      const murs = (this.d.murs ||= []), meme = (a, b) => (a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]) || (a[0] === b[2] && a[1] === b[3] && a[2] === b[0] && a[3] === b[1]);
      poly.forEach((p, j) => { const q = poly[(j + 1) % 4], sg = [p[0], p[1], q[0], q[1]]; if (!murs.some((m) => meme(m, sg))) murs.push(sg); });
      this.d.pieces.push({ nom: opt.nom || (z ? this.hass.areas?.[z]?.name || z : _t("Nouvelle pièce")), poly, etiquette: [x + w / 2, y + h / 2], ...(z ? { zone: z } : {}) });
      if (!opt.silencieux) this.sel = { type: "piece", i: this.d.pieces.length - 1 };
    });
    if (opt.silencieux) return this.d.pieces.length - 1;
    this.choisirOutil("selection");
    if (z) { this.integrer(this.d.pieces.length - 1); return; }
    setTimeout(() => this.panneau.querySelector('input[data-k="nom"]')?.select(), 50);
  }

  // nouvelle largeur / hauteur d'une pièce rectangle (bords droit et bas déplacés) : seuls SES murs, limites et
  // ouvertures suivent ; un mur partagé avec une voisine reste en place pour elle et un nouveau mur est tracé
  redimensionner(i, w, h) {
    const p = this.d.pieces[i], r = rectDe(p.poly);
    if (!r || !(w > 0) || !(h > 0)) return;
    const [x, y, w0, h0] = r, X = x + w0, Y = y + h0, dx = w - w0, dy = h - h0;
    const entre = (v, a, b) => v >= Math.min(a, b) - 0.5 && v <= Math.max(a, b) + 0.5;
    // bord de la pièce qui porte le segment : g / d (verticaux), h / b (horizontaux), ou null
    const bord = (sg) => {
      if (sg[0] === sg[2] && entre(sg[1], y, Y) && entre(sg[3], y, Y)) return sg[0] === x ? "g" : sg[0] === X ? "d" : null;
      if (sg[1] === sg[3] && entre(sg[0], x, X) && entre(sg[2], x, X)) return sg[1] === y ? "h" : sg[1] === Y ? "b" : null;
      return null;
    };
    const surPoly = (q, poly) => poly.some((a, j) => { const b = poly[(j + 1) % poly.length], cr = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
      return Math.abs(cr) < 1 && entre(q[0], a[0], b[0]) && entre(q[1], a[1], b[1]); });
    const partage = (sg) => this.d.pieces.some((o, j) => j !== i && surPoly([sg[0], sg[1]], o.poly) && surPoly([sg[2], sg[3]], o.poly));
    const bouge = ([px, py]) => [px === X ? px + dx : px, py === Y ? py + dy : py];
    const nouveaux = [];
    this.commit(() => {
      for (const l of [this.d.murs || [], this.d.limites || []]) l.forEach((sg, j) => {
        const b = bord(sg);
        if (!b) return;
        const moved = [...bouge([sg[0], sg[1]]), ...bouge([sg[2], sg[3]]), ...sg.slice(4)];
        if (moved.join() === sg.join()) return;
        if (partage(sg)) { if ((b === "d" && dx) || (b === "b" && dy)) nouveaux.push([l, moved]); return; }
        l[j] = moved;
      });
      nouveaux.forEach(([l, sg]) => { if (!l.some((m) => m.join() === sg.join())) l.push(sg); });
      (this.d.ouvertures || []).forEach((o) => { const b = bord(o.seg); if (b === "d") o.seg = [o.seg[0] + dx, o.seg[1], o.seg[2] + dx, o.seg[3]]; if (b === "b") o.seg = [o.seg[0], o.seg[1] + dy, o.seg[2], o.seg[3] + dy]; });
      this._meublesDans(p.poly).forEach((j) => { const m = this.d.meubles[j]; m.pos = [m.pos[0] > x + w0 / 2 ? m.pos[0] + dx : m.pos[0], m.pos[1] > y + h0 / 2 ? m.pos[1] + dy : m.pos[1]]; });
      p.poly = p.poly.map(bouge);
      if (p.etiquette) p.etiquette = [x + w / 2, y + h / 2];
    });
    const chevauche = (o) => { const xs = o.poly.map((q) => q[0]), ys = o.poly.map((q) => q[1]);
      return Math.min(x + w, Math.max(...xs)) - Math.max(x, Math.min(...xs)) > 1 && Math.min(y + h, Math.max(...ys)) - Math.max(y, Math.min(...ys)) > 1; };
    // une sous-zone chevauche forcément sa pièce : on ne compare que des pièces ordinaires entre elles
    if (!p.sous_zone && this.d.pieces.some((o, j) => j !== i && !o.sous_zone && chevauche(o)))
      this.snack(_t("La pièce empiète sur une voisine : ajuste-la aussi (les voisines ne bougent pas)."));
  }

  // assistant de départ : toutes les pièces HA d'un coup, en rectangles côte à côte avec leurs appareils
  async assistantPieces() {
    const hass = this.hass, deja = new Set(this.d.pieces.map((p) => p.zone).filter(Boolean));
    const zones = Object.values(hass.areas || {}).filter((z) => !deja.has(z.area_id)).sort((a, b) => a.name.localeCompare(b.name, _loc()));
    if (!zones.length) return this.snack(Object.keys(hass.areas || {}).length ? _t("Toutes les pièces HA sont déjà sur le plan.") : _t("Aucune pièce dans Home Assistant : crée-les dans Paramètres → Pièces, ou dessine-les ici."));
    const choix = await new Promise((fin) => {
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${_t("Démarrer avec mes pièces")}</h2>
          <div class="ed-aide">${_t("Chaque pièce cochée devient un rectangle 4 × 3 m, à ajuster ensuite.")}</div></header>
        <div class="ed-resultats">${zones.map((z) => { const n = entitesZone(hass, z.area_id).length;
          return `<label class="ed-coche"><input type="checkbox" value="${esc(z.area_id)}" ${n ? "checked" : ""}><ha-icon icon="${esc(z.icon || "mdi:floor-plan")}"></ha-icon><span class="n"><span>${esc(z.name)}</span><small>${_t("{n} entité|{n} entités", { n })}</small></span></label>`; }).join("")}</div>
        <footer><button class="ed-btn texte" data-r="0">${_t("Annuler")}</button><button class="ed-btn plein" data-r="1"><ha-icon icon="mdi:home-import-outline"></ha-icon>${_t("Créer les pièces")}</button></footer></div>`);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) { const l = [...voile.querySelectorAll("input:checked")].map((x) => x.value); voile.remove(); fin(b?.dataset.r === "1" ? l : null); } };
      this.R.querySelector("ha-card").append(voile);
    });
    if (!choix?.length) return;
    const b = this.d.pieces.length ? this.carte.bornes() : null, x0 = b ? b.x0 + b.W + 100 : 0, y0 = b ? b.y0 : 0;
    const par = Math.ceil(Math.sqrt(choix.length)), W = 400, H = 300;
    this._instantane();
    const histo = this.histo.length;
    let n = 0;
    choix.forEach((z, k) => {
      const i = this.creerRectangle(x0 + (k % par) * W, y0 + Math.floor(k / par) * H, W, H, { zone: z, silencieux: true });
      n += this._integrerSilencieux(i);
    });
    this.histo.length = histo; // une seule étape d'annulation pour tout l'assistant
    this.sel = null; this.multi.clear();
    this._apres();
    this.recadrer();
    this.snack(`${_t("{n} pièce créée|{n} pièces créées", { n: choix.length })}, ${_t("{n} appareil placé|{n} appareils placés", { n })}. ${_t("Ajuste maintenant tailles et positions.")}`, _t("Annuler##defaire"), this._annulation(), 12000);
  }

  _finirTrace() {
    const o = this.outil, t = this.trace;
    this.trace = [];
    this._info("");
    if (o === "piece" && t.length >= 3) {
      const z = this.zoneEnAttente;
      this.zoneEnAttente = null;
      this.commit(() => { this.d.pieces.push({ nom: z ? this.hass.areas?.[z]?.name || z : _t("Nouvelle pièce"), poly: t, etiquette: centre(t), ...(z ? { zone: z } : {}) }); this.sel = { type: "piece", i: this.d.pieces.length - 1 }; });
      this.choisirOutil("selection");
      if (z) { this.integrer(this.d.pieces.length - 1); return; }
      setTimeout(() => this.panneau.querySelector('input[data-k="nom"]')?.select(), 50);
      return;
    }
    this.carte._construire();
  }

  // ---------- sélection & panneau ----------
  selectionner(s) {
    this.sel = s;
    this.multi = new Set(s ? [cle(s)] : []);
    // au doigt, la feuille du bas se déplie pour montrer les propriétés de ce qu'on vient de toucher
    if (s) this._deplier();
    this.carte._construire();
    this._panneau();
  }

  // au doigt, la feuille du bas se déplie pour montrer les propriétés de ce qu'on vient de toucher ou de poser
  _deplier() {
    if (!this.replie) return;
    this._depliee = Date.now(); this.replier(false);
  }
  // feuille du bas (téléphone) repliée sur sa poignée ou dépliée ; l'état n'est pas gardé d'une session à l'autre (2e argument des anciens appels ignoré)
  replier(oui) {
    this.replie = oui;
    this._etatRepli();
    this.carte._mise();
  }
  _etatRepli() {
    const hote = this.R.querySelector(".panneau-hote");
    hote.classList.toggle("replie", this.replie);
    this.poignee.title = this.replie ? _t("Afficher le panneau d'édition") : _t("Replier le panneau d'édition");
    this.poignee.setAttribute("aria-expanded", String(!this.replie));
    poserHTML(this.poignee, `<ha-icon icon="mdi:${this.replie ? "chevron-left" : "chevron-right"}"></ha-icon><span>${this.replie ? _t("Propriétés") : _t("Replier")}</span>`);
  }

  basculerSel(s) {
    const k = cle(s);
    if (this.multi.has(k)) this.multi.delete(k); else this.multi.add(k);
    this.sel = this.multi.has(k) ? s : this.multi.size ? deCle([...this.multi].pop()) : null;
    this.carte._construire();
    this._panneau();
  }

  toutSelectionner() {
    const d = this.d;
    let k = [];
    (d.points || []).forEach((_, i) => k.push(`point:${i}`)); (d.textes || []).forEach((_, i) => k.push(`texte:${i}`));
    (d.ouvertures || []).forEach((_, i) => k.push(`ouverture:${i}`)); (d.murs || []).forEach((_, i) => k.push(`mur:${i}`));
    (d.limites || []).forEach((_, i) => k.push(`limite:${i}`)); d.pieces.forEach((_, i) => k.push(`piece:${i}`));
    (d.meubles || []).forEach((_, i) => k.push(`meuble:${i}`));
    k = k.filter((x) => !this._bloque(x));
    this.multi = new Set(k); this.sel = k.length ? deCle(k[k.length - 1]) : null;
    this.carte._construire(); this._panneau();
  }

  _translater(k, dx, dy, src) {
    const [ty, a] = k.split(":"), i = +a, d = this.d, T = ([x, y]) => [arr(x + dx), arr(y + dy)];
    const S = (s) => [arr(s[0] + dx), arr(s[1] + dy), arr(s[2] + dx), arr(s[3] + dy), ...s.slice(4)];
    if (ty === "meuble") d.meubles[i].pos = T(src.meubles[i].pos);
    if (ty === "piece") this._meublesDans(src.pieces[i].poly, src).forEach((j) => { if (!this.multi.has(`meuble:${j}`)) d.meubles[j].pos = T(src.meubles[j].pos); });
    if (ty === "piece") this._sousZonesDans(i, src).forEach((j) => { if (!this.multi.has(`piece:${j}`)) this._bougerZone(j, T, src); });
    if (ty === "point") d.points[i].pos = T(src.points[i].pos);
    else if (ty === "texte") d.textes[i].pos = T(src.textes[i].pos);
    else if (ty === "piece") { d.pieces[i].poly = src.pieces[i].poly.map(T); if (src.pieces[i].etiquette) d.pieces[i].etiquette = T(src.pieces[i].etiquette); }
    else if (ty === "mur") d.murs[i] = S(src.murs[i]);
    else if (ty === "limite") d.limites[i] = S(src.limites[i]);
    else if (ty === "ouverture") d.ouvertures[i].seg = S(src.ouvertures[i].seg);
  }

  _dansCadre(x0, y0, x1, y1) {
    const d = this.d, k = [], dans = ([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1, seg = (s) => dans([s[0], s[1]]) && dans([s[2], s[3]]);
    (d.points || []).forEach((p, i) => dans(p.pos) && k.push(`point:${i}`));
    (d.meubles || []).forEach((m, i) => dans(m.pos) && k.push(`meuble:${i}`));
    (d.textes || []).forEach((p, i) => dans(p.pos) && k.push(`texte:${i}`));
    (d.ouvertures || []).forEach((o, i) => seg(o.seg) && k.push(`ouverture:${i}`));
    (d.murs || []).forEach((s, i) => seg(s) && k.push(`mur:${i}`));
    (d.limites || []).forEach((s, i) => seg(s) && k.push(`limite:${i}`));
    d.pieces.forEach((p, i) => p.poly.every(dans) && k.push(`piece:${i}`));
    return k.filter((x) => !this._bloque(x));
  }

  _cadre(ev, ajouter) {
    const debut = this.carte.cm(ev), g = this.R.querySelector(".zone svg .ed");
    if (!g) return;
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("class", "ed-cadre"); r.setAttribute("stroke-width", 1.5 / this.echelle);
    g.append(r);
    let bouge = false, fin = debut;
    this._glisse = true;
    const boite = () => [Math.min(debut[0], fin[0]), Math.min(debut[1], fin[1]), Math.max(debut[0], fin[0]), Math.max(debut[1], fin[1])];
    const move = (e) => {
      fin = this.carte.cm(e);
      if (Math.hypot(fin[0] - debut[0], fin[1] - debut[1]) * this.echelle > 4) bouge = true;
      const [a, b, c, d] = boite();
      r.setAttribute("x", a); r.setAttribute("y", b); r.setAttribute("width", c - a); r.setAttribute("height", d - b);
    };
    const arreter = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); this._glisse = false; this._finGlisse = null; r.remove(); };
    this._finGlisse = arreter; // pincement : cadre abandonné, sélection inchangée
    const up = () => {
      arreter();
      if (!bouge) return;
      const k = this._dansCadre(...boite());
      if (!ajouter) this.multi = new Set();
      k.forEach((x) => this.multi.add(x));
      this.sel = this.multi.size ? deCle(k.length ? k[k.length - 1] : [...this.multi].pop()) : null;
      this.carte._construire(); this._panneau();
      if (k.length) this.snack(_t("{n} élément sélectionné.|{n} éléments sélectionnés.", { n: this.multi.size }), null, null, 2000);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }

  _objet() {
    const s = this.sel, d = this.d;
    if (!s) return null;
    if (s.type === "widget") return this._wl(s)?.[s.i] ?? null;
    if (s.type === "puce") return this._puces(true)[s.i] ?? null;
    return { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, meuble: d.meubles }[s.type]?.[s.i] ?? null;
  }

  _panneauMulti() {
    const keys = [...this.multi], cnt = {}, d = this.d;
    keys.forEach((k) => { const ty = k.split(":")[0]; cnt[ty] = (cnt[ty] || 0) + 1; });
    const NOMS = { point: (n) => _t("{n} appareil|{n} appareils", { n }), texte: (n) => _t("{n} texte|{n} textes", { n }), piece: (n) => _t("{n} pièce|{n} pièces", { n }), mur: (n) => _t("{n} mur|{n} murs", { n }),
      limite: (n) => _t("{n} limite|{n} limites", { n }), ouverture: (n) => _t("{n} ouverture|{n} ouvertures", { n }), meuble: (n) => _t("{n} meuble|{n} meubles", { n }) };
    const NOM1 = { point: _t("appareil"), texte: _t("texte"), piece: _t("pièce"), mur: _t("mur"), limite: _t("limite"), ouverture: _t("ouverture"), meuble: _t("meuble") };
    const pos = keys.filter((k) => /^(point|texte|meuble):/.test(k));
    const nom = (k) => { const m = deCle(k), o = this._elt(k); return m.type === "point" ? (o.nom || this.carte._nom(o.entite)) : m.type === "texte" ? o.t : m.type === "piece" ? o.nom : m.type === "ouverture" ? (o.nom || _t("Ouverture")) : m.type === "meuble" ? (o.nom || (MEUBLES()[o.type] ? _t(MEUBLES()[o.type].nom) : _t("Meuble"))) : m.type === "mur" ? _t("Mur") : _t("Limite"); };
    const ic = { point: "mdi:circle-medium", texte: "mdi:format-text", piece: "mdi:vector-square", mur: "mdi:wall", limite: "mdi:fence", ouverture: "mdi:window-closed-variant", meuble: "mdi:sofa-outline" };
    poserHTML(this.panneau, `<h3><ha-icon icon="mdi:${this._groupeSel() ? "group" : "select-group"}"></ha-icon>${this._groupeSel() ? esc(this._groupeSel().nom) + " · " : ""}${_t("{n} éléments", { n: keys.length })}<button class="ib" data-act="deselection" title="${_t("Tout désélectionner (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></h3>
      <div class="ed-resume">${Object.entries(cnt).map(([ty, n]) => NOMS[ty](n)).join(", ")}${bulleI(tactile() ? _t("Glisse l'un d'eux pour tout déplacer ; un cadre tracé dans le vide sélectionne plusieurs éléments.") : _t("Glisse l'un d'eux pour tout déplacer, flèches pour ajuster, Ctrl+clic pour ajouter ou retirer."))}</div>
      ${pos.length >= 2 ? `<div class="ed-champ"><label>${_t("Aligner (appareils, textes et meubles)")}</label><div class="ed-icones">${[["g", "mdi:align-horizontal-left", _t("À gauche")], ["ch", "mdi:align-horizontal-center", _t("Centrer horizontalement")], ["d", "mdi:align-horizontal-right", _t("À droite")],
        ["h", "mdi:align-vertical-top", _t("En haut")], ["cv", "mdi:align-vertical-center", _t("Centrer verticalement")], ["b", "mdi:align-vertical-bottom", _t("En bas")]].map(([v, i2, ti]) => `<button data-act="aligner:${v}" title="${ti}"><ha-icon icon="${i2}"></ha-icon></button>`).join("")}
        ${pos.length >= 3 ? `<button data-act="repartir:0" title="${_t("Répartir horizontalement")}"><ha-icon icon="mdi:distribute-horizontal-center"></ha-icon></button><button data-act="repartir:1" title="${_t("Répartir verticalement")}"><ha-icon icon="mdi:distribute-vertical-center"></ha-icon></button>` : ""}</div></div>` : ""}
      ${(() => { const g = this._groupeSel(); return g ? `<div class="ed-champ"><label>${_t("Nom du groupe")}</label><input type="text" data-groupe="${esc(g.id)}" value="${esc(g.nom)}"></div>` : ""; })()}
      <div class="ed-actions">${this._groupeSel() ? `<button class="ed-btn contour" data-act="degrouper" title="${tactile() ? _t("Dégrouper") : _t("Ctrl+Maj+G")}"><ha-icon icon="mdi:ungroup"></ha-icon>${_t("Dégrouper")}</button>`
        : `<button class="ed-btn tonal" data-act="grouper" title="${tactile() ? _t("Se sélectionnent et se déplacent ensemble") : _t("Ctrl+G : se sélectionnent et se déplacent ensemble")}"><ha-icon icon="mdi:group"></ha-icon>${_t("Grouper")}</button>`}
        ${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}
        <button class="ed-btn danger" data-act="supprimer"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Supprimer")}</button></div>
      <h4>${_t("Sélection")}</h4><div class="ed-liste">${keys.map((k) => `<button data-choix="${k}"><ha-icon icon="${ic[k.split(":")[0]]}"></ha-icon><span>${esc(nom(k))}<small>${NOM1[k.split(":")[0]]}</small></span></button>`).join("")}</div>`);
    this._cablerPanneau();
  }

  // panneau latéral (feuille du bas sur téléphone) : affiché seulement avec un contenu ; la modale ⚙ ouverte suit aussi les changements
  _panneau() {
    if (this._tip && !this._tip.b.closest(".ed-voile")) this._cacherAide();
    // désélection pendant un geste (PC) : l'ancien contenu reste jusqu'au relâchement plutôt qu'un panneau vide
    if (!this._aContenu() && this._geste && !this._etroit() && !this.R.querySelector(".panneau-hote")?.classList.contains("vide")) { this._hoteEnAttente = true; return; }
    this._panneauContenu();
    this._majHote();
    if (this.vueParametres) this._rendreParametres();
  }
  _aContenu() { return !!(this.sel || this.multi.size || this.vueCalques || this.vueAmbiance); }
  _etroit() { return !!this.R.querySelector("ha-card")?.classList.contains("ed-etroit"); }
  // largeur prise par le panneau à côté de la vue, pour sa réduction : 0 quand il flotte au-dessus (au repos, plan, calques, ambiance)
  largeurPanneau() { const h = this.R.querySelector(".panneau-hote"); return h && !h.classList.contains("vide") && h.classList.contains("reserve") ? 376 : 0; }
  _majHote() {
    const hote = this.R.querySelector(".panneau-hote"), vide = !this._aContenu();
    if (!hote) return;
    // widget choisi dans une colonne (PC) : le panneau prend sa place à côté de la vue (rien n'est caché de ce qu'on modifie)
    const reserve = !vide && !this._etroit() && !!this.R.querySelector(".col .w.sel");
    if (hote.classList.contains("vide") === vide && hote.classList.contains("reserve") === reserve) return;
    // PC : pendant un geste sur le plan (glisser, cadre de sélection), le panneau n'apparaît ou ne disparaît qu'au relâchement
    if (this._geste && !this._etroit()) { this._hoteEnAttente = true; return; }
    hote.classList.toggle("reserve", reserve);
    hote.classList.toggle("vide", vide);
    if (vide) this.panneau.replaceChildren();
    this.carte._mise();
  }
  _panneauContenu() {
    const s = this.sel, P = this.panneau;
    if (this.multi.size > 1) return this._panneauMulti();
    if (!s) return this.vueCalques ? this._panneauCalques() : this.vueAmbiance ? this._panneauAmbiance() : this.panneau.replaceChildren();
    const o = this._objet(), hass = this.hass;
    let h = "";
    const supprimer = `<button class="ed-btn danger" data-act="supprimer"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Supprimer")}</button>`;
    if (s.type === "point") {
      const dom = o.entite.split(".")[0];
      const icones = [...new Set([o.icone, ...(ICONES[dom] || []), ...ICONES._])].filter(Boolean).slice(0, 12);
      h = `<h3><ha-icon icon="${esc(o.icone || "mdi:circle")}"></ha-icon>${esc(o.nom || this.carte._nom(o.entite))}</h3>
        ${this._champEntite(_t("Entité"), "entite", o.entite, false)}
        ${this._champTexte(_t("Nom affiché (infobulle)"), "nom", o.nom, this.carte._nom(o.entite))}
        <div class="ed-champ"><label>${_t("Icône")}</label><div class="ed-icones">${icones.map((ic) => `<button data-icone="${esc(ic)}" class="${ic === o.icone ? "on" : ""}" title="${esc(ic)}" aria-label="${esc(ic)}"><ha-icon icon="${esc(ic)}"></ha-icon></button>`).join("")}</div>
          <input type="text" data-k="icone" value="${esc(o.icone || "")}" placeholder="mdi:…" aria-label="${_t("Icône")}"></div>
        <div class="ed-champ"><label>${_t("Couleur quand actif")}</label><div class="ed-couleurs">${COULEURS.map(([n, c]) => `<button data-couleur="${c}" title="${_t(n)}" class="${(o.couleur || "").toLowerCase() === c ? "on" : ""}" style="background:${c}"></button>`).join("")}
          <input type="color" data-k="couleur" value="${esc(/^#[0-9a-f]{6}$/i.test(o.couleur || "") ? o.couleur : "#f6c445")}" title="${_t("Autre couleur")}"></div></div>
        ${dom === "light" ? `<div class="ed-champ"><label>${_t("Halo quand elle est allumée")}</label><div class="ed-curseur"><input type="range" min="0" max="400" step="10" data-k="halo" value="${+o.halo || 0}"><output>${o.halo ? `${o.halo} cm` : _t("aucun")}</output></div></div>` : ""}
        ${this._champEntite(_t("Valeur affichée sur la pastille"), "valeur", o.valeur, true)}
        ${this._inter(_t("Clignote quand actif"), "alerte", o.alerte)}
        ${this._sectionFiche(o, "point")}
        ${this._sectionAnimation(o, this.carte.constructor.evenementPoint(o))}
        <details class="ed-avance" ${o.actif || o.actif_attribut || o.seuil != null || o.attribut || o.unite || o.decimales != null || this._aCompleter("actif") ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <h4>${_t("Quand la pastille est « active » (colorée)")}${bulleI(_t("Par défaut : quand l'entité est allumée, ouverte ou en marche."))}</h4>
        ${this._champEntite(_t("Selon une autre entité"), "actif", o.actif, true)}
        <div class="ed-ligne">${this._champTexte(_t("ou selon l'attribut"), "actif_attribut", o.actif_attribut, _t("ex. hvac_action"))}${this._champNombre(_t("Active au-dessus de"), "seuil", o.seuil, 1, _t("ex. 20 (W)"))}</div>
        <h4>${_t("Valeur affichée")}</h4>
        <div class="ed-ligne trois">${this._champTexte(_t("ou un attribut"), "attribut", o.attribut, _t("option"))}${this._champTexte(_t("Unité"), "unite", o.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, "0")}</div>
        ${dom === "light" ? "" : `<h4>${_t("Halo lumineux")}</h4>
        <div class="ed-champ"><div class="ed-curseur"><input type="range" min="0" max="400" step="10" data-k="halo" value="${+o.halo || 0}"><output>${o.halo ? `${o.halo} cm` : _t("aucun")}</output></div></div>`}
        <div class="ed-champ"><label>${_t("Halo limité à la pièce")}</label><select data-k="piece"><option value="">${_t("— aucune —")}</option>${this.d.pieces.map((p) => `<option ${p.nom === o.piece ? "selected" : ""}>${esc(p.nom)}</option>`).join("")}</select></div>
        <div class="ed-ligne">${this._champNombre(_t("x (cm)"), "pos.0", o.pos[0], 1)}${this._champNombre(_t("y (cm)"), "pos.1", o.pos[1], 1)}</div></details>
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser cette pastille (Ajouter › Mes modèles)"))}${supprimer}</div>`;
    } else if (s.type === "widget") {
      h = this._panneauWidget(o, supprimer);
    } else if (s.type === "puce") {
      h = this._panneauPuce(o, supprimer);
    } else if (s.type === "meuble") {
      h = this._panneauMeuble(o, supprimer);
    } else if (s.type === "texte" && Array.isArray(o.infos)) {
      h = `<h3><ha-icon icon="mdi:card-text-outline"></ha-icon>${_t("Zone d'informations")}</h3>
        ${this._champTexte(_t("Titre"), "t", o.t, _t("sans titre"))}
        <div class="ed-champ"><label>${_t("Style")}</label><select data-k="style"><option value="">${_t("Encadré")}</option><option value="discret" ${o.style === "discret" ? "selected" : ""}>${_t("Discret (sans fond)")}</option></select></div>
        <div class="ed-champ"><label>${_t("Taille")}</label><div class="ed-curseur"><input type="range" min="0.6" max="2.4" step="0.05" data-k="taille" value="${esc(o.taille || 1)}"><output>${fmt(o.taille || 1, 2)}×</output></div></div>
        <h4>${_t("Entités ({n})", { n: o.infos.length })}</h4>
        ${o.infos.map((l, j) => `<div class="ed-al">${this._champEntite(_t("Entité"), `infos.${j}.entite`, l.entite, false)}
          ${this._champTexte(_t("Nom"), `infos.${j}.nom`, l.nom, "auto")}${this._champTexte(_t("Icône"), `infos.${j}.icone`, l.icone, "auto")}
          <div class="ed-ligne trois">${this._champTexte(_t("Attribut"), `infos.${j}.attribut`, l.attribut, _t("état"))}${this._champTexte(_t("Unité"), `infos.${j}.unite`, l.unite, "auto")}${this._champNombre(_t("Décimales"), `infos.${j}.decimales`, l.decimales, 1, "auto")}</div>
          <div class="ed-actions">${j ? ibAct(`info-haut:${j}`, "mdi:arrow-up", _t("Monter")) : ""}<button class="ed-btn danger" data-act="info-suppr:${j}"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Retirer")}</button></div></div>`).join("")}
        <div class="ed-actions"><button class="ed-btn tonal" data-act="info-ajout"><ha-icon icon="mdi:plus"></ha-icon>${_t("Entité")}</button></div>
        <div class="ed-ligne">${this._champNombre(_t("x (cm)"), "pos.0", o.pos[0], 1)}${this._champNombre(_t("y (cm)"), "pos.1", o.pos[1], 1)}</div>
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${supprimer}</div>`;
    } else if (s.type === "texte") {
      h = `<h3><ha-icon icon="mdi:format-text"></ha-icon>${_t("Texte")}</h3>
        ${this._champTexte(_t("Texte"), "t", o.t)}
        <div class="ed-champ"><label>${_t("Taille")}</label><div class="ed-curseur"><input type="range" min="0.6" max="2.4" step="0.05" data-k="taille" value="${esc(o.taille || 1)}"><output>${fmt(o.taille || 1, 2)}×</output></div></div>
        <div class="ed-ligne">${this._champNombre(_t("x (cm)"), "pos.0", o.pos[0], 1)}${this._champNombre(_t("y (cm)"), "pos.1", o.pos[1], 1)}</div>
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${supprimer}</div>`;
    } else if (s.type === "piece") {
      const surf = Math.abs(o.poly.reduce((a, p, j) => { const q = o.poly[(j + 1) % o.poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2) / 10000;
      // mode d'emploi des poignées : en bulle ⓘ, sans « double-clic » sur écran tactile
      const poignees = tactile() ? _t("Glisse les poignées pour déformer, les points pleins pour ajouter un sommet ; retouche la pièce sélectionnée et glisse pour la déplacer.")
        : _t("Glisse les poignées pour déformer, les points pleins pour ajouter un sommet, double-clic sur une poignée pour la retirer ; reclique la pièce sélectionnée et glisse pour la déplacer.");
      if (o.sous_zone) h = `<h3><ha-icon icon="mdi:selection-drag"></ha-icon>${esc(o.nom)}</h3>
        <div class="ed-resume">${_t("Sous-zone · {s} m² · {n} sommets", { s: fmt(surf, 1), n: o.poly.length })}${bulleI(`${_t("Contour nommé dans une pièce, sans murs ; en vue, toucher la sous-zone ouvre la pièce qui la contient.")} ${poignees}`)}</div>
        ${this._champTexte(_t("Nom"), "nom", o.nom)}
        ${(() => { const r = rectDe(o.poly); return r ? `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "_largeur", r[2], 1)}${this._champNombre(_t("Hauteur (cm)"), "_hauteur", r[3], 1)}</div>` : ""; })()}
        ${this._inter(_t("Sous-zone"), "sous_zone", true, _t("Contour pointillé dans une pièce, sans murs (cuisine, douche…)."))}
        ${this._inter(_t("Afficher le nom"), "_etiquette", !!o.etiquette)}
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${supprimer}</div>`;
      else h = `<h3><ha-icon icon="mdi:vector-square"></ha-icon>${esc(o.nom)}</h3>
        <div class="ed-resume">${_t("{s} m² · {n} sommets", { s: fmt(surf, 1), n: o.poly.length })}${bulleI(poignees)}</div>
        ${this._champTexte(_t("Nom"), "nom", o.nom)}
        ${(() => { const r = rectDe(o.poly); return r ? `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "_largeur", r[2], 1)}${this._champNombre(_t("Hauteur (cm)"), "_hauteur", r[3], 1)}</div>` : ""; })()}
        ${this._champEntite(_t("Température"), "temperature", o.temperature, true, "sensor")}
        ${this._champEntite(_t("Humidité"), "humidite", o.humidite, true, "sensor")}
        <details class="ed-avance" ${o.attribut_temperature || o.attribut_humidite || o.clic ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <div class="ed-ligne">${this._champTexte(_t("Attribut température"), "attribut_temperature", o.attribut_temperature, _t("option"))}${this._champTexte(_t("Attribut humidité"), "attribut_humidite", o.attribut_humidite, _t("option"))}</div>
        ${this._champEntite(_t("Au clic, ouvrir"), "clic", o.clic, true)}</details>
        ${this._inter(_t("Extérieur"), "dehors", o.dehors, _t("Sans teinte de température ; la météo s'y dessine."))}
        ${this._inter(_t("Sous-zone"), "sous_zone", o.sous_zone, _t("Contour pointillé dans une pièce, sans murs ni vue propre (cuisine, douche…)."))}
        ${this._interInv(_t("Vue de la pièce au toucher"), "zoom", o.zoom !== false, _t("Zoom sur la pièce ; à décocher pour les extérieurs."))}
        ${this._inter(_t("Afficher l'étiquette"), "_etiquette", !!o.etiquette)}
        <h4>${_t("Pièce Home Assistant")}${o.zone ? "" : bulleI(_t("Lier la pièce à HA ajoute ses appareils, ses scènes et ses automatisations à sa vue."))}</h4>
        <div class="ed-champ"><select data-k="zone"><option value="">${_t("— aucune —")}</option>${Object.values(hass.areas || {}).sort((a, b) => a.name.localeCompare(b.name, _loc())).map((z) => `<option value="${esc(z.area_id)}" ${z.area_id === o.zone ? "selected" : ""}>${esc(z.name)}${this.d.pieces.some((p, j) => j !== s.i && p.zone === z.area_id) ? ` (${_t("déjà liée")})` : ""}</option>`).join("")}</select></div>
        ${o.zone ? `<button class="ed-btn tonal" data-act="integrer"><ha-icon icon="mdi:import"></ha-icon>${_t("Intégrer les appareils de la pièce")}</button>` : ""}
        ${(() => { const l = this._ouverturesAPlacer(s.i); return l.length ? `<div class="ed-champ"><label>${_t("À placer sur les murs")}</label><div class="ed-liste">${l.map((e) => `<button data-act="placer-ouv:${esc(e)}"><ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon><span>${esc(hass.states[e].attributes.friendly_name || e)}<small>${esc(e)} · ${_t("clique puis trace-la sur un mur")}</small></span></button>`).join("")}</div></div>` : ""; })()}
        <h4>${_t("Vue de la pièce")}${bulleI(_t("Ce qui s'affiche quand on touche la pièce."))}</h4>
        ${["gauche", "droite"].map((c) => `<div class="ed-champ"><label>${c === "gauche" ? _t("Panneau gauche") : _t("Panneau droit")}</label><div class="ed-liste">${(o.panneaux?.[c] || []).map((w, j) => `<button data-choix="widget:${c}:${j}:${s.i}"><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(w.titre || typeWidgetEn(w.type))}<small>${esc(typeWidgetEn(w.type))}</small></span></button>`).join("")}</div>
          <button class="ed-btn contour" data-act="ajouter-widget:${c}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un widget")}</button></div>`).join("")}
        ${this._interInv(_t("Boutons automatiques"), "auto_actions", o.auto_actions !== false, _t("Allumer, ouvrir et fermer les lumières et volets de la pièce."))}
        ${this._interInv(_t("Afficher les automatisations liées"), "automatismes", o.automatismes !== false)}
        <div class="ed-champ"><label>${_t("Boutons d'action")}</label>
          <datalist id="ed-services">${SERVICES.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
          ${(o.actions || []).map((a, j) => `<div class="ed-sous"><div class="ed-entete"><span>${_t("Bouton {n}", { n: j + 1 })}</span><button class="ed-btn texte" data-act="retirer:actions:${j}">${_t("Retirer")}</button></div>
            ${this._champTexte(_t("Texte"), `actions.${j}.nom`, a.nom)}${this._champTexte(_t("Icône"), `actions.${j}.icone`, a.icone, "mdi:…")}
            ${this._choixService(`actions.${j}.action`, a.action)}
            <label class="ed-inter"><span>${o.zone ? _t("Cible : toute la pièce") : _t("Cible : toute la pièce (pièce HA à lier)")}</span><input type="checkbox" data-act-chk="cible-piece:${j}" ${a.cible === "piece" ? "checked" : ""}></label>
            ${a.cible === "piece" ? "" : this._champEntite(_t("Cible : entité"), `actions.${j}.cible`, a.cible, true)}
            ${this._inter(_t("Toujours demander confirmation"), `actions.${j}.confirmer`, a.confirmer, _t("Un service sensible (déverrouiller, ouvrir un garage ou un portail, désarmer, lancer un script…) est confirmé dans tous les cas."))}
            <details class="ed-avance" ${a.donnees ? "open" : ""}><summary>${_t("Données de l'action")}</summary>${this._champTexte(_t("Données (JSON)"), `actions.${j}.donnees`, a.donnees ? JSON.stringify(a.donnees) : "", '{"brightness_pct": 30}')}</details></div>`).join("")}
          <button class="ed-btn contour" data-act="ajouter-action"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un bouton")}</button></div>
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${supprimer}</div>`;
    } else if (["mur", "limite"].includes(s.type)) {
      const seg = this._liste(s.type)[s.i];
      h = `<h3><ha-icon icon="${s.type === "mur" ? "mdi:wall" : "mdi:fence"}"></ha-icon>${s.type === "mur" ? _t("Mur") : _t("Limite")} · ${fmt(Math.hypot(seg[2] - seg[0], seg[3] - seg[1]) / 100, 2)} m</h3>
        <div class="ed-aide">${_t("Glisse le trait pour le déplacer, ses extrémités pour l'allonger.")}</div>
        <div class="ed-ligne">${this._champNombre(_t("x départ"), "seg.0", seg[0], 1)}${this._champNombre(_t("y départ"), "seg.1", seg[1], 1)}</div>
        <div class="ed-ligne">${this._champNombre(_t("x arrivée"), "seg.2", seg[2], 1)}${this._champNombre(_t("y arrivée"), "seg.3", seg[3], 1)}</div>
        <div class="ed-actions">${ibAct("convertir", "mdi:swap-horizontal", s.type === "mur" ? _t("En limite") : _t("En mur"))}${ibAct("couper", "mdi:content-cut", _t("Couper en deux"))}${supprimer}</div>`;
    } else if (s.type === "ouverture") {
      const dir = (v, ic, t) => `<button data-dehors="${v.join(",")}" class="${(o.dehors || []).join(",") === v.join(",") ? "on" : ""}" title="${t}"><ha-icon icon="${ic}"></ha-icon></button>`;
      h = `<h3><ha-icon icon="${o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door"}"></ha-icon>${esc(o.nom || _t("Ouverture"))} · ${fmt(Math.hypot(o.seg[2] - o.seg[0], o.seg[3] - o.seg[1]) / 100, 2)} m</h3>
        ${this._htmlSuggestions(this._suggestionsOuverture(o, s.i))}
        ${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Baie salon"))}
        ${this._champTexte(_t("Baie (vantaux regroupés)"), "baie", o.baie, _t("ex. Baie du séjour"), _t("Même nom sur chaque vantail : une seule fiche."))}
        <div class="ed-champ"><label>${_t("Type")}</label><span class="ed-seg petit">${[["fenetre", _t("Fenêtre")], ["porte", _t("Porte")], ["portail", _t("Portail")]].map(([v, n]) => `<button data-type="${v}" class="${o.type === v ? "on" : ""}">${n}</button>`).join("")}</span></div>
        <div class="ed-ligne"><div class="ed-champ"><label>${_t("Vantaux")}</label><select data-k="battants" data-num="1"><option value="">1</option><option value="2" ${+o.battants === 2 ? "selected" : ""}>2</option></select></div>
          <div class="ed-champ"><label>${_t("Ouverture##battants")}${bulleI(_t("Dessin des battants : côté des gonds vu de l'intérieur, ou coulissant."))}</label><select data-k="ouvrant">${OUVRANTS_ED.map(([v, n]) => `<option value="${esc(v)}" ${(o.ouvrant || "") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div></div>
        ${o.ouvrant === "gauche" || o.ouvrant === "droite" ? this._inter(_t("Ouvre vers l'extérieur"), "vers_dehors", o.vers_dehors) : ""}
        ${this._champEntite(_t("Contact (ouvert / fermé)"), "contact", o.contact, true, "binary_sensor")}
        ${this._champEntite(_t("Volet"), "volet", o.volet, true, "cover")}
        ${this._champEntite(_t("Ou entité motorisée (portail)"), "entite", o.entite, true, "cover")}
        ${this._inter(_t("Volet seul (pas de trait de fenêtre)"), "volet_seul", o.volet_seul)}
        <div class="ed-champ"><label>${_t("Côté extérieur (volet dessiné de ce côté)")}</label><div class="ed-dir">
          <span></span>${dir([0, -1], "mdi:arrow-up", _t("Haut"))}<span></span>${dir([-1, 0], "mdi:arrow-left", _t("Gauche"))}<span></span>${dir([1, 0], "mdi:arrow-right", _t("Droite"))}<span></span>${dir([0, 1], "mdi:arrow-down", _t("Bas"))}<span></span></div></div>
        ${this._sectionFiche(o, "ouverture")}
        ${o.contact || o.entite ? this._sectionAnimation(o, "ouverture", "animation", _t("Animation (ouverte)")) : ""}${o.volet ? this._sectionAnimation(o, "volet", "animation_volet", _t("Animation du volet (en mouvement)")) : ""}
        <details class="ed-avance"><summary>${_t("Position")}</summary>
        <div class="ed-ligne">${this._champNombre(_t("x départ"), "seg.0", o.seg[0], 1)}${this._champNombre(_t("y départ"), "seg.1", o.seg[1], 1)}</div>
        <div class="ed-ligne">${this._champNombre(_t("x arrivée"), "seg.2", o.seg[2], 1)}${this._champNombre(_t("y arrivée"), "seg.3", o.seg[3], 1)}</div></details>
        ${this._calqueNiveau(o)}
        <div class="ed-actions">${ibAct("atelier-ouv", "mdi:tune-variant", _t("Modifier dans l'atelier (préréglage, capteurs, aperçu)"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser cette ouverture (Ajouter › Mes modèles)"))}${supprimer}</div>`;
    }
    poserHTML(P, h.replace("</h3>", `<button class="ib" data-act="deselection" title="${_t("Retour à la liste (Échap)")}" aria-label="${_t("Retour à la liste (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></h3>`));
    this._cablerPanneau();
  }

  _panneauWidget(w, supprimer) {
    for (const cle of ["lignes", "entites"]) if (Array.isArray(w[cle])) w[cle] = w[cle].map((x) => (typeof x === "string" ? { entite: x } : x));
    const NOMS = { tuile: _t("Tuile + courbe"), jauge: _t("Jauge"), entites: _t("Liste d'entités"), tarif: _t("Tarif en direct"), ve: _t("Véhicule électrique"), periodes: _t("Périodes"), separateur: _t("Séparateur"), climat: _t("Climat des pièces"), thermostat: _t("Thermostat"), commande: _t("Commande"), serrure: _t("Serrure") };
    const E = (label, k, dom = "") => this._champEntite(label, k, k.split(".").reduce((x, p) => x?.[p], w), true, dom);
    // où est le widget, en court : « Panneau gauche · 1/3 » (le titre et l'aperçu disent le reste)
    const ou = _t("{ou} · {n}/{total}", { ou: this._ouWidget(), n: this.sel.i + 1, total: this._wl(this.sel).length });
    let h = `<h3><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon>${esc(w.titre || NOMS[w.type] || _t("Widget"))}</h3>
      <div class="ed-resume">${ou}</div>
      ${this._champTexte(_t("Titre"), "titre", w.titre)}
      ${this._champTexte(_t("Icône"), "icone", w.icone, "mdi:…")}${this._champTexte(_t("Couleur d'accent"), "couleur", w.couleur, "#1a73e8")}
      <div class="ed-couleurs">${COULEURS.map(([n, c]) => `<button data-couleur="${c}" title="${_t(n)}" class="${(w.couleur || "").toLowerCase() === c ? "on" : ""}" style="background:${c}"></button>`).join("")}</div>`;
    const lignes = (cle = "lignes", titre = _t("Lignes")) => `<div class="ed-champ${!(w[cle] || []).length && this._aCompleter(cle) ? " a-completer" : ""}"><label>${titre}${!(w[cle] || []).length && this._aCompleter(cle) ? _t(" · à compléter") : ""}</label>${(w[cle] || []).map((l, j) => `<div class="ed-sous">
        ${this._champEntite("", `${cle}.${j}.entite`, l.entite, false)}
        ${this._champTexte(_t("Nom"), `${cle}.${j}.nom`, l.nom, "auto")}${this._champTexte(_t("Icône"), `${cle}.${j}.icone`, l.icone, "auto")}
        <div class="ed-ligne">${this._champNombre(_t("Décimales"), `${cle}.${j}.decimales`, l.decimales, 1, "auto")}<button class="ed-btn texte" data-act="retirer:${cle}:${j}" style="align-self:end">${_t("Retirer")}</button></div></div>`).join("")}
      <button class="ed-btn contour" data-act="ajouter-ligne:${cle}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une ligne")}</button></div>`;
    if (w.type === "tuile") h += `${E(_t("Valeur principale"), "entite")}<div class="ed-ligne">${this._champTexte(_t("Unité"), "unite", w.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", w.decimales, 1, "auto")}</div>
      <div class="ed-champ"><label>${_t("Courbe des dernières heures")}</label><div class="ed-curseur"><input type="range" min="0" max="72" step="1" data-k="historique" data-suf="h" value="${+w.historique || 0}"><output>${w.historique ? `${w.historique} h` : _t("aucune")}</output></div></div>${lignes()}`;
    if (w.type === "jauge") h += `${E(_t("Valeur"), "entite")}<div class="ed-ligne trois">${this._champNombre(_t("Minimum"), "min", w.min, "any", "0")}${this._champNombre(_t("Maximum"), "max", w.max, "any", "100")}${this._champNombre(_t("Décimales"), "decimales", w.decimales, 1, "auto")}</div>
      ${this._champTexte(_t("Unité"), "unite", w.unite, "auto")}
      <details class="ed-avance" ${w.seuils ? "open" : ""}><summary>${_t("Couleur selon la valeur")}</summary>
        <div class="ed-ligne trois">${this._champNombre(_t("Vert dès"), "seuils.vert", w.seuils?.vert, "any", "—")}${this._champNombre(_t("Orange dès"), "seuils.jaune", w.seuils?.jaune, "any", "—")}${this._champNombre(_t("Rouge dès"), "seuils.rouge", w.seuils?.rouge, "any", "—")}</div>
        <div class="ed-aide">${_t("Chaque couleur vaut à partir de sa valeur (ex. CO₂ : 0, 800, 1200).")}</div></details>${lignes()}`;
    // case « Toujours demander confirmation » : widgets qui appellent un service (listes, thermostat, lignes à interrupteur ou « Activer »)
    const agit = (l) => (Array.isArray(l) ? l : []).some((x) => { const d = String((typeof x === "string" ? x : x?.entite) || "").split(".")[0]; return BASCULES_ED.includes(d) || ["scene", "script", "button", "input_button"].includes(d); });
    const confirmer = () => this._inter(_t("Toujours demander confirmation"), "confirmer", w.confirmer === true, _t("Chaque appel de ce widget (interrupteurs, « Activer », consigne) est confirmé. Un service sensible est confirmé dans tous les cas."));
    if (["tuile", "jauge", "tarif", "ve"].includes(w.type) && (w.confirmer === true || agit(w.lignes))) h += confirmer();
    if (w.type === "serrure") h += `${E(_t("Serrure (lock)"), "entite", "lock")}
        <div class="ed-champ"><label>${_t("Confirmer avant d'agir")}</label><select data-k="confirmer">
          <option value="">${_t("Par défaut (déverrouiller, ouvrir)")}</option><option value="oui" ${w.confirmer === true ? "selected" : ""}>${_t("Oui, toujours")}</option></select></div>${lignes()}`;
    if (w.type === "entites") h += `${lignes("entites", _t("Entités"))}${confirmer()}`;
    if (w.type === "thermostat") h += `${E(_t("Thermostat"), "entite", "climate")}${confirmer()}${lignes()}`;
    if (w.type === "climat") {
      const noms = this.d.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite)).map((p) => p.nom), choix = Array.isArray(w.pieces) ? w.pieces : [];
      h += `<div class="ed-champ"><label>${_t("Pièces affichées (aucune cochée = toutes)")}${bulleI(_t("Les pièces viennent du plan (leurs capteurs de température et d'humidité)."))}</label><div class="ed-puces">${noms.map((n, j) => `<button data-act="climat-piece:${j}" class="${choix.includes(n) ? "on" : ""}">${esc(n)}</button>`).join("")}</div></div>
        ${this._interInv(_t("Inclure l'extérieur"), "dehors", w.dehors !== false)}
        ${this._inter(_t("Ligne « Moyenne intérieure » en tête"), "moyenne", w.moyenne)}
        ${this._champNombre(_t("Durée de la tendance (min)"), "duree", w.duree, 5, "30", _t("Tendance = écart avec la valeur d'il y a « Durée » minutes ; flèche plate sous le seuil « stable », alerte au-dessus du seuil « alerte »."))}
        <div class="ed-ligne">${this._champNombre(_t("Stable sous (°C)"), "stable_t", w.stable_t, 0.1, _t("0,3"))}${this._champNombre(_t("Alerte dès (°C)"), "alerte_t", w.alerte_t, 0.1, _t("1,5"))}</div>
        <div class="ed-ligne">${this._champNombre(_t("Stable sous (%)"), "stable_h", w.stable_h, 1, "2")}${this._champNombre(_t("Alerte dès (%)"), "alerte_h", w.alerte_h, 1, "10")}</div>
        <details class="ed-avance"><summary>${_t("Bornes absolues (option)")}</summary>
          <div class="ed-ligne">${this._champNombre(_t("Alerte sous (°C)"), "t_min", w.t_min, 0.5, _t("aucune"))}${this._champNombre(_t("Alerte au-dessus (°C)"), "t_max", w.t_max, 0.5, _t("aucune"))}</div>
          <div class="ed-ligne">${this._champNombre(_t("Alerte sous (%)"), "h_min", w.h_min, 1, _t("aucune"))}${this._champNombre(_t("Alerte au-dessus (%)"), "h_max", w.h_max, 1, _t("aucune"))}</div></details>`;
    }
    if (w.type === "commande") {
      const dc = this.hass.states[w.entite]?.attributes.device_class, defaut = ["garage", "gate", "door"].includes(dc) || !!w.entite?.startsWith("valve.");
      h += `${E(_t("Volet, portail, porte, vanne (cover, valve)"), "entite", "cover")}
        <div class="ed-champ"><label>${_t("Confirmer avant d'agir")}${bulleI(_t("Boutons Ouvrir, Stop et Fermer de cette entité seulement. Par défaut, un garage, un portail ou une porte demande confirmation ; leur ouverture est confirmée dans tous les cas."))}</label><select data-k="confirmer">
          <option value="">${dc ? _t("Par défaut ({v} : {dc})", { v: defaut ? _t("oui") : _t("non"), dc: esc(dc) }) : _t("Par défaut ({d})", { d: defaut ? _t("oui") : _t("non") })}</option><option value="oui" ${w.confirmer === true ? "selected" : ""}>${_t("Oui, toujours")}</option><option value="non" ${w.confirmer === false ? "selected" : ""}>${_t("Non")}</option></select></div>${lignes()}`;
    }
    if (w.type === "tarif") h += `${E(_t("Prix en cours (€/kWh)"), "prix", "sensor")}${E(_t("Période (heures pleines / creuses)"), "periode", "sensor")}${E(_t("Couleur du jour (Tempo)"), "couleur_jour", "sensor")}${E(_t("Couleur de demain (Tempo)"), "couleur_demain", "sensor")}${lignes()}`;
    if (w.type === "ve") h += `${E(_t("Batterie (%)"), "batterie", "sensor")}${E(_t("Autonomie"), "autonomie", "sensor")}${E(_t("Puissance de charge"), "puissance", "sensor")}
      ${this._champNombre(_t("En charge au-dessus de (W)"), "seuil", w.seuil, 1, "50")}${E(_t("Câble branché"), "branche")}${E(_t("Énergie de la session"), "session_kwh", "sensor")}${E(_t("Coût de la session"), "session_cout", "sensor")}${lignes()}`;
    if (w.type === "periodes") {
      const per = w.periodes || ["jour", "semaine", "mois", "annee"];
      h += `<div class="ed-champ"><label>${_t("Lignes du tableau")}</label><div class="ed-puces">${[["jour", _t("Aujourd'hui")], ["semaine", _t("Semaine")], ["mois", _t("Mois")], ["annee", _t("Année")]].map(([p, n]) => `<button data-act="periode:${p}" class="${per.includes(p) ? "on" : ""}">${n}</button>`).join("")}</div></div>
        <div class="ed-champ"><label>${_t("Colonnes")}</label>${(w.colonnes || []).map((c, j) => {
          const stat = c.source === "stat" || (c.source == null && c.stat);
          return `<div class="ed-sous"><div class="ed-entete"><span>${_t("Colonne {n}", { n: j + 1 })}</span><button class="ed-btn texte" data-act="retirer:colonnes:${j}">${_t("Retirer")}</button></div>
            <div class="ed-ligne trois">${this._champTexte(_t("Nom"), `colonnes.${j}.nom`, c.nom)}${this._champTexte(_t("Unité"), `colonnes.${j}.unite`, c.unite)}${this._champNombre(_t("Décimales"), `colonnes.${j}.decimales`, c.decimales, 1, "2")}</div>
            <div class="ed-puces"><button data-act="source:${j}:stat" class="${stat ? "on" : ""}">${_t("Depuis l'historique")}</button><button data-act="source:${j}:entites" class="${stat ? "" : "on"}">${_t("4 compteurs")}</button></div>
            ${stat ? `${this._champEntite(_t("Compteur cumulatif (statistique HA)"), `colonnes.${j}.stat`, c.stat, true, "sensor")}${this._champNombre(_t("Multiplier par"), `colonnes.${j}.facteur`, c.facteur, 0.001, _t("1 (0,001 : Wh → kWh)"))}`
              : `${["jour", "semaine", "mois", "annee"].map((p) => this._champEntite({ jour: _t("Aujourd'hui"), semaine: _t("Semaine"), mois: _t("Mois"), annee: _t("Année") }[p], `colonnes.${j}.${p}`, c[p], true, "sensor")).join("")}${this._champNombre(_t("Multiplier par"), `colonnes.${j}.facteur`, c.facteur, 0.001, _t("1 (0,001 : Wh → kWh)"))}`}</div>`;
        }).join("")}<button class="ed-btn contour" data-act="ajouter-colonne"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une colonne")}</button></div>
        ${this._champTexte(_t("Note sous le tableau"), "note", w.note)}`;
    }
    if (w.type === "separateur") h = `<h3><ha-icon icon="mdi:minus"></ha-icon>${esc(w.titre || _t("Séparateur"))}</h3>
      <div class="ed-resume">${ou}</div>
      ${this._champTexte(_t("Titre de section (option)"), "titre", w.titre, _t("sans titre : simple trait"))}${this._champNombre(_t("Espace au-dessus et au-dessous (px)"), "espace", w.espace, 1, "0")}`;
    const n = this._wl(this.sel).length;
    h += `<div class="ed-actions">
      ${ibAct("w-monter", "mdi:arrow-up", _t("Monter"), this.sel.i ? "" : "disabled")}${ibAct("w-descendre", "mdi:arrow-down", _t("Descendre"), this.sel.i < n - 1 ? "" : "disabled")}
      ${this.sel.cote === "fiche" ? "" : ibAct("w-cote", this.sel.cote === "gauche" ? "mdi:arrow-right" : "mdi:arrow-left", this.sel.cote === "gauche" ? _t("Vers le panneau droit") : _t("Vers le panneau gauche"))}
      ${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser ce widget (Ajouter › Mes modèles)"))}${supprimer}</div>`;
    return h;
  }

  // où est le widget sélectionné, en court (texte déjà échappé) : « Panneau gauche », « Panneau droit · Séjour », « Fiche · Borne »
  _ouWidget() {
    const s = this.sel, pf = s.cote === "fiche" ? porteur(s) : null;
    if (pf) return _t("Fiche · {nom}", { nom: esc(this._nomElement(pf)) });
    const cote = s.cote === "gauche" ? _t("Panneau gauche") : _t("Panneau droit");
    return s.piece != null ? `${cote} · ${esc(this.d.pieces[s.piece].nom)}` : cote;
  }

  // nom d'un élément porteur de fiche (non échappé)
  _nomElement(pf) {
    const o = this.d[GENRES_FICHE[pf.genre]]?.[pf.i];
    if (pf.genre === "meuble") return o?.nom || (MEUBLES()[o?.type] ? _t(MEUBLES()[o.type].nom) : _t("Meuble"));
    if (pf.genre === "ouverture") return o?.nom || (o?.contact || o?.entite || o?.volet ? this.carte._nom(o.contact || o.entite || o.volet) : _t("Ouverture"));
    return o?.nom || this.carte._nom(o?.entite) || _t("Appareil");
  }

  // action HA : liste des services de l'installation (noms lisibles), sinon saisie libre
  _choixService(k, v) {
    const sv = this.hass.services;
    if (!sv || !Object.keys(sv).length) return `<div class="ed-champ"><label>${_t("Action (domaine.service)")}</label><input type="text" list="ed-services" data-k="${k}" value="${esc(v || "")}" placeholder="light.turn_off"></div>`;
    const doms = Object.keys(sv).sort(), courants = SERVICES.filter((x) => sv[x.split(".")[0]]?.[x.split(".")[1]]);
    const opt = (id) => { const [d, n] = id.split("."), nom = sv[d]?.[n]?.name; return `<option value="${esc(id)}" ${id === v ? "selected" : ""}>${esc(nom ? `${nom} (${id})` : id)}</option>`; };
    return `<div class="ed-champ"><label>${_t("Action")}</label><select data-k="${k}"><option value="">${_t("— choisir —")}</option>
      ${v && !sv[v.split(".")[0]]?.[v.split(".")[1]] ? `<option value="${esc(v)}" selected>${_t("{v} (introuvable)", { v: esc(v) })}</option>` : ""}
      <optgroup label="${_t("Courantes")}">${courants.map(opt).join("")}</optgroup>
      ${doms.map((d) => `<optgroup label="${esc(d)}">${Object.keys(sv[d]).sort().map((n) => opt(`${d}.${n}`)).join("")}</optgroup>`).join("")}</select></div>`;
  }

  // champs des panneaux ; aide : texte (traduit) d'une bulle ⓘ après le libellé
  _champTexte(label, k, v, ph = "", aide = "") {
    return `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="text" data-k="${k}" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
  }
  _champNombre(label, k, v, step = 1, ph = "", aide = "") {
    return `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="number" step="${esc(step)}" data-k="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
  }
  _interInv(label, k, v, aide = "") {
    return `<label class="ed-inter"><span>${esc(label)}${bulleI(aide)}</span><input type="checkbox" data-k="!${k}" ${v ? "checked" : ""}></label>`;
  }
  _inter(label, k, v, aide = "") {
    return `<label class="ed-inter"><span>${esc(label)}${bulleI(aide)}</span><input type="checkbox" data-k="${k}" ${v ? "checked" : ""}></label>`;
  }
  // champs laissés à compléter après un objet du catalogue (ex. contact d'une fenêtre) : surlignés tant qu'ils sont vides
  _aCompleter(k) { return !!this._aFaire && this.sel && this._aFaire.cle === cle(this.sel) && this._aFaire.champs.has(k); }

  _champEntite(label, k, v, effacable, domaine = "", aide = "") {
    const s = v && this.hass.states[v], af = !v && this._aCompleter(k);
    return `<div class="ed-champ${af ? " a-completer" : ""}"><label>${esc(label)}${af ? _t(" · à compléter") : ""}${bulleI(aide)}</label><button class="ed-entite" data-entite="${k}" data-dom="${domaine}">
      ${v ? `<ha-icon icon="${esc(iconeEntite(this.hass, v))}"></ha-icon><span class="n">${esc(s ? s.attributes.friendly_name || v : v)}<small>${esc(v)}${s ? ` · ${esc(this.hass.formatEntityState?.(s) ?? s.state)}` : _t(" · introuvable")}</small></span>` : `<span class="n vide">${_t("Choisir…")}</span>`}
      ${v && effacable ? `<span class="ib x" data-effacer="${k}" title="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></span>` : ""}</button></div>`;
  }

  _modif(k, v) {
    const s = this.sel;
    if (!s) return;
    if (k === "_plus_infos") {
      const o = this._objet();
      if (!o) return;
      this._modeInfos = v === "lien" ? cle(s) : null;
      if (v === "entite") return this.choisirEntite({ titre: _t("Bouton « Plus d'infos »"), obligatoire: true }).then((e) => (e ? this.commit(() => { (o.fiche ||= {}).plus_infos = e; }) : this._panneau()));
      return this.commit(() => { if (v === "masque") (o.fiche ||= {}).plus_infos = false; else if (o.fiche) delete o.fiche.plus_infos; this._nettoyerFiche(o); });
    }
    if (s.type === "meuble" && /^taille\.[01]$/.test(k)) {
      // la taille peut être absente (taille du catalogue) : on la matérialise avant d'en changer une dimension
      // mêmes bornes que la lecture de la config (5 à 5000 cm) : une valeur hors bornes est refusée, jamais corrigée en silence
      if (!(+v >= 5 && +v <= 5000)) { this.snack(k.endsWith("0") ? _t("Largeur refusée : un meuble mesure de 5 à 5000 cm de côté.") : _t("Profondeur refusée : un meuble mesure de 5 à 5000 cm de côté.")); return this._panneau(); }
      const m = this._objet(), base = Array.isArray(m.taille) && m.taille.length === 2 ? m.taille : MEUBLES()[m.type]?.taille || [60, 60];
      return this.commit(() => { m.taille = [...base]; m.taille[+k.slice(-1)] = +v; });
    }
    if (s.type === "meuble" && k === "_angle") return this.commit(() => { const m = this._objet(), a = ((Math.round(+v || 0) % 360) + 360) % 360; if (a) m.rotation = a; else delete m.rotation; });
    if (s.type === "meuble" && k === "chaises") return this.commit(() => { this._objet().chaises = Math.max(0, Math.min(12, Math.round(+v) || 0)); });
    if (s.type === "meuble" && (k === "_diametre" || k === "type")) {
      const m = this._objet(), def = MEUBLES()[k === "type" ? v : m.type];
      if (k === "_diametre") { if (!(+v >= 5 && +v <= 5000)) { this.snack(_t("Diamètre refusé : un meuble mesure de 5 à 5000 cm de côté.")); return this._panneau(); } return this.commit(() => { m.taille = [+v, +v]; }); }
      return this.commit(() => { m.type = v; if (def) { m.taille = [...def.taille]; if (def.chaises) m.chaises = def.chaises; else delete m.chaises; } });
    }
    if (s.type === "piece" && (k === "_largeur" || k === "_hauteur")) {
      const r = rectDe(this.d.pieces[s.i].poly);
      if (!(+v > 0)) { this.snack(_t("La largeur et la hauteur doivent être positives (en cm).")); return this._panneau(); }
      return r && this.redimensionner(s.i, k === "_largeur" ? +v : r[2], k === "_hauteur" ? +v : r[3]);
    }
    // « Appareil mesuré » : la valeur choisie sert aussi d'état actif tant qu'il n'est pas réglé
    if (k === "valeur" && v && s.type === "point" && this._aCompleter("actif") && !this._objet()?.actif) this.commit(() => { this._objet().actif = v; });
    // entité choisie sur un meuble : proposer la fiche de son appareil (rien n'est écrit sans l'aperçu validé)
    if (k === "entite" && v && s.type === "meuble") setTimeout(() => {
      const m = this._objet();
      if (this.sel?.type === "meuble" && m?.entite === v && !(m.fiche?.widgets || []).length && this._entitesAppareil(v).length > 1) this.snack(_t("Cet appareil a d'autres entités : remplir la fiche du meuble avec ?"), _t("Voir l'aperçu"), () => this.remplirFiche(), 10000);
    }, 0);
    const o = ["mur", "limite"].includes(s.type) ? { seg: this._liste(s.type)[s.i] } : this._objet();
    if (!o) return;
    if (k === "confirmer" && s.type === "widget") return this.commit(() => { if (v === "oui" || v === "non" || v === true) o.confirmer = v === "oui" || v === true; else delete o.confirmer; });
    this.commit(() => {
      if (k === "_etiquette") { if (v) o.etiquette = centre(o.poly); else delete o.etiquette; return; }
      if (k === "nom" && s.type === "piece") {
        const ancien = o.nom;
        (this.d.points || []).forEach((p) => { if (p.piece === ancien) p.piece = v; });
      }
      if (k === "halo" && !v) { delete o.halo; return; }
      if (k[0] === "!") { if (v) delete o[k.slice(1)]; else o[k.slice(1)] = false; return; }
      if (k.endsWith(".donnees")) { try { v = v ? JSON.parse(v) : ""; } catch (e) { this.snack(_t("Données : JSON invalide.")); return; } }
      const ca = /^(animation(?:_volet)?)\./.exec(k)?.[1];
      if (ca && typeof o[ca] === "string") o[ca] = { type: o[ca] };
      if (ca && /\.(duree|intensite)$/.test(k) && v !== "") v = Math.min(/duree$/.test(k) ? 20 : 2, Math.max(0.2, +v || 0.2));
      poserChemin(o, k, v);
      if (s.type === "widget" && o.seuils && typeof o.seuils === "object" && !Object.keys(o.seuils).length) delete o.seuils;
      if (ca && o[ca] && typeof o[ca] === "object" && !Object.keys(o[ca]).length) delete o[ca];
      if (Object.hasOwn(GENRES_FICHE, s.type)) this._nettoyerFiche(o);
    });
  }

  // chaque case « Icône » (data-k finissant par icone) : aperçu, propositions au focus (selon l'entité voisine), recherche en tapant
  _cablerIcones(P) {
    P.querySelectorAll('input[data-k$="icone"], input[data-alk$="icone"]').forEach((inp) => {
      if (inp.closest(".ed-ic")) return;
      const w = document.createElement("div"), ap = document.createElement("ha-icon"), menu = document.createElement("div");
      w.className = "ed-ic"; ap.className = "ed-ic-ap"; menu.className = "ed-ic-menu"; menu.hidden = true;
      menu.setAttribute("role", "listbox"); menu.setAttribute("aria-label", _t("Icônes proposées"));
      inp.replaceWith(w); w.append(ap, inp, menu);
      inp.setAttribute("autocomplete", "off");
      if (!inp.placeholder || inp.placeholder === "mdi:…") inp.placeholder = _t("Chercher…");
      if (!inp.title) inp.title = _t("Nom mdi:… ou un mot : lampe, porte, voiture…");
      const auto = () => /mdi:[\w-]+/.exec(inp.placeholder)?.[0];
      const maj = () => ap.setAttribute("icon", /^mdi:[\w-]+$/.test(inp.value.trim()) ? inp.value.trim() : auto() || "mdi:magnify");
      maj();
      let jeton = 0;
      const proposer = async () => {
        const q = inp.value.trim(), j = ++jeton, ctx = this._iconesContexte(inp, auto());
        const res = q && !/^mdi:[\w-]+$/.test(q) ? chercherIcones(await listeIcones(), q) : [];
        if (j !== jeton) return;
        const l = [...new Set([...res, ...(res.length ? [] : ctx)])].slice(0, 48);
        poserHTML(menu, (q && !res.length && !/^mdi:/.test(q) ? `<small>${_t("Aucune icône pour « {q} » : essaie un autre mot (français ou anglais)", { q: esc(q) })}</small>` : "")
          + l.map((n) => `<button type="button" role="option" data-ic="mdi:${esc(n)}" title="mdi:${esc(n)}" aria-label="${esc(n)}"><ha-icon icon="mdi:${esc(n)}"></ha-icon></button>`).join(""));
        menu.hidden = !menu.innerHTML;
      };
      inp.addEventListener("focus", proposer);
      inp.addEventListener("input", () => { maj(); proposer(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { e.stopPropagation(); menu.hidden = true; } });
      inp.addEventListener("blur", () => setTimeout(() => { menu.hidden = true; }, 150));
      menu.addEventListener("pointerdown", (e) => e.preventDefault()); // le champ garde le focus
      menu.addEventListener("click", (e) => {
        const b = e.composedPath().find((n) => n.dataset?.ic);
        if (!b) return;
        inp.value = b.dataset.ic; maj(); menu.hidden = true;
        inp.dispatchEvent(new Event("change"));
      });
    });
  }
  // propositions sans recherche : icône actuelle, icône automatique, icône de l'entité, puis selon sa classe et son domaine
  _iconesContexte(inp, auto) {
    let o = inp.closest(".ed-atelier") ? this._atelierObjet : this._objet(), k = inp.dataset.k;
    if (inp.dataset.alk) { const [i, ...c] = inp.dataset.alk.split("."), r = this.d.alertes?.[+i]; o = r && { ...r, entite: r.entite || r.entites?.[0] }; k = c.join("."); }
    const cheminE = k.replace(/icone$/, "entite"), lire = (x, c) => c.split(".").reduce((a, p) => (a == null ? a : a[/^\d+$/.test(p) ? +p : p]), x);
    const e = (o && (lire(o, cheminE) || lire(o, k.replace(/icone$/, "valeur")) || o.entite)) || null, st = typeof e === "string" ? this.hass.states[e] : null;
    const dom = typeof e === "string" ? e.split(".")[0] : null, dc = st?.attributes.device_class;
    const l = [o && lire(o, k), auto, st?.attributes.icon, ...(ICONES_DC[dc] || []).map((x) => `mdi:${x}`), ...(ICONES[dom] || []), ...ICONES._, "mdi:thermometer", "mdi:water-percent", "mdi:flash", "mdi:lightbulb", "mdi:door", "mdi:window-closed-variant", "mdi:car", "mdi:home"];
    return [...new Set(l.filter((x) => typeof x === "string" && /^mdi:[\w-]+$/.test(x)).map((x) => x.slice(4)))];
  }

  _cablerPanneau() {
    const P = this.panneau;
    // les sections « avancées » restent ouvertes ou fermées comme l'utilisateur les a laissées, d'un rendu à l'autre
    P.querySelectorAll("details.ed-avance").forEach((dt, j) => {
      const k = `${this.sel ? cle(this.sel) : "-"}:${j}`;
      if (this._avance?.[k] != null) dt.open = this._avance[k];
      dt.ontoggle = () => { (this._avance ||= {})[k] = dt.open; };
    });
    P.onclick = async (ev) => {
      const chemin = ev.composedPath();
      const el = chemin.find((n) => n.dataset && (n.dataset.effacer || n.dataset.entite || n.dataset.icone || n.dataset.couleur || n.dataset.act || n.dataset.type || n.dataset.dehors || n.dataset.choix || n.dataset.groupeChoix));
      if (!el) return;
      const ds = el.dataset;
      if (ds.choix) return this.selectionner(deCle(ds.choix));
      if (ds.groupeChoix) { const l = this._membres(ds.groupeChoix); if (!l.length) return; this.sel = deCle(l[0]); this.multi = new Set(l); this.carte._construire(); return this._panneau(); }
      if (ds.effacer) { ev.stopPropagation(); return this._modif(ds.effacer, ""); }
      if (ds.entite) {
        const e = await this.choisirEntite({ titre: _t("Choisir une entité"), domaine: ds.dom });
        if (e != null) this._modif(ds.entite, e);
        return;
      }
      if (ds.icone) return this._modif("icone", ds.icone);
      if (ds.couleur) return this._modif("couleur", ds.couleur);
      if (ds.type) return this._modif("type", ds.type);
      if (ds.dehors) return this._modif("dehors", ds.dehors.split(",").map(Number));
      if (ds.act) this._action(ds.act);
    };
    P.querySelectorAll("input[data-act-chk]").forEach((inp) => { inp.onchange = () => this._action(inp.dataset.actChk); });
    P.querySelectorAll("input[data-groupe]").forEach((inp) => { inp.onchange = () => this.commit(() => { const g = (this.d.groupes ||= []).find((x) => x.id === inp.dataset.groupe); if (g) g.nom = inp.value.trim() || g.nom; else this.d.groupes.push({ id: inp.dataset.groupe, nom: inp.value.trim() }); }); });
    // un champ modifié puis quitté en cliquant un autre élément déclenche « change » APRÈS le changement de sélection :
    // la valeur va à l'élément dont le panneau était affiché, jamais au nouvel élément
    const s0 = this.sel ? { ...this.sel } : null;
    const ecrire = (k, v) => {
      if (!s0 || (this.sel && cle(this.sel) === cle(s0))) return this._modif(k, v);
      if (!this._elt(cle(s0))) return;
      const cur = this.sel, multi = new Set(this.multi);
      this.sel = s0;
      try { this._modif(k, v); } finally { this.sel = cur; this.multi = multi; this.carte._construire(); this._panneau(); }
    };
    P.querySelectorAll("input[data-k],select[data-k]").forEach((inp) => {
      const k = inp.dataset.k;
      if (inp.type === "range") {
        const out = inp.parentElement.querySelector("output");
        inp.oninput = () => { out.textContent = inp.dataset.suf === "h" ? (+inp.value ? `${inp.value} h` : _t("aucune")) : k === "halo" ? (+inp.value ? `${inp.value} cm` : _t("aucun")) : `${fmt(+inp.value, 2)}×`; };
        inp.onchange = () => ecrire(k, +inp.value);
      } else if (inp.type === "checkbox") inp.onchange = () => ecrire(k, inp.checked);
      else if (inp.type === "color") inp.onchange = () => ecrire(k, inp.value);
      else inp.onchange = () => ecrire(k, inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim());
    });
    this._cablerIcones(P);
  }

  _action(a) {
    const s = this.sel, d = this.d;
    // zone d'informations : ajouter (choix de l'entité), monter, retirer une ligne
    if (/^info-/.test(a) && s?.type === "texte") {
      const o = this._objet(), [op, j] = a.split(":");
      if (!Array.isArray(o?.infos)) return;
      if (op === "info-ajout") return this.choisirEntite({ titre: _t("Entité à afficher") }).then((e) => { if (e) this.commit(() => { this._objet().infos.push({ entite: e }); }); });
      if (op === "info-suppr") return this.commit(() => { o.infos.splice(+j, 1); });
      if (op === "info-haut" && +j > 0) return this.commit(() => { [o.infos[+j - 1], o.infos[+j]] = [o.infos[+j], o.infos[+j - 1]]; });
      return;
    }
    if (a === "deselection") { const pf = s?.type === "widget" && s.cote === "fiche" ? porteur(s) : null; return this.selectionner(s?.type === "widget" && s.piece != null ? { type: "piece", i: s.piece } : pf ? { type: pf.genre, i: pf.i } : null); }
    if (a.startsWith("ajouter-widget:")) return this.ouvrirCatalogue({ widgets: true, cote: a.split(":")[1], piece: s?.type === "piece" ? s.i : s?.piece ?? null });
    if (a === "fiche-ajouter") return this.ouvrirCatalogue({ widgets: true, cote: "fiche", [s.type]: s.i });
    if (a === "fiche-modele") return this.enregistrerFiche();
    if (a === "fiche-remplir") return this.remplirFiche();
    if (a.startsWith("fusion:")) return this.fusionner(+a.slice(7));
    if (a === "integrer") return this.integrer(s.i);
    if (a.startsWith("placer-ouv:")) return this.placerOuverture(a.slice(11));
    if (/^(sugg|sugg-type|sugg-ign|sugg-choisir|atelier-ouv)(:|$)/.test(a)) return this._actionOuvertureSel(a);
    if (a === "atelier-meuble" && s?.type === "meuble") return this.modifierMeuble({ i: s.i, retour: this.panneau?.querySelector("[data-act=atelier-meuble]") });
    if (a === "ajouter-action") return this.commit(() => (this._objet().actions ||= []).push({ nom: _t("Action"), icone: "mdi:gesture-tap", action: "light.turn_off", cible: "piece" }));
    if (a.startsWith("cible-piece:")) { const j = +a.split(":")[1], ac = this._objet().actions[j]; return this.commit(() => { if (ac.cible === "piece") delete ac.cible; else ac.cible = "piece"; }); }
    if (a.startsWith("cq-")) return this._actionCalque(a);
    if (a.startsWith("niveau:") && this.multi.size <= 1) return this._niveau(a === "niveau:haut");
    if (a === "grouper") return this.grouper();
    if (a === "degrouper") return this.degrouper();
    if (a.startsWith("climat-piece:")) {
      const w = this._objet(), noms = this.d.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite)).map((p) => p.nom), n = noms[+a.split(":")[1]];
      if (!w || n == null) return;
      return this.commit(() => { const l = new Set(w.pieces || []); if (l.has(n)) l.delete(n); else l.add(n); if (l.size) w.pieces = noms.filter((x) => l.has(x)); else delete w.pieces; });
    }
    if (this.multi.size > 1) {
      if (a === "supprimer") return this.supprimer();
      if (a === "dupliquer") {
        const nouv = [];
        return this.commit(() => {
          const L = { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles };
          for (const k of [...this.multi]) { const m = deCle(k); if (!L[m.type]) continue; L[m.type].push(clone(L[m.type][m.i])); nouv.push(`${m.type}:${L[m.type].length - 1}`); }
          // les copies d'un groupe forment un nouveau groupe (sinon cliquer la copie prendrait aussi l'original)
          const ids = {};
          nouv.forEach((k) => { const g = this._gr(k); if (!g) return; if (!ids[g]) { ids[g] = `g${Date.now().toString(36)}${Object.keys(ids).length}`; const nom = (d.groupes || []).find((x) => x.id === g)?.nom || _t("Groupe"); (d.groupes ||= []).push({ id: ids[g], nom: _t("{nom} (copie)", { nom }) }); } this._poserGr(k, ids[g]); });
          const snap = clone(d);
          nouv.forEach((k) => this._translater(k, 40, 40, snap));
          this.multi = new Set(nouv); this.sel = nouv.length ? deCle(nouv[nouv.length - 1]) : null;
        });
      }
      const cles = [...this.multi].filter((k) => /^(point|texte|meuble):/.test(k)), objs = cles.map((k) => this._elt(k));
      if (a.startsWith("aligner:")) {
        // meubles : alignés sur leurs bords (emprise tournée), appareils et textes sur leur position
        const v = a.split(":")[1], axe = ["g", "ch", "d"].includes(v) ? 0 : 1, dm = objs.map((o, j) => (cles[j].startsWith("meuble:") ? this._emprise(o)[axe] : 0));
        const bas = Math.min(...objs.map((o, j) => o.pos[axe] - dm[j])), haut = Math.max(...objs.map((o, j) => o.pos[axe] + dm[j])), sens = { g: -1, h: -1, d: 1, b: 1 }[v] || 0;
        const cible = { g: bas, h: bas, d: haut, b: haut }[v] ?? (bas + haut) / 2;
        return this.commit(() => objs.forEach((o, j) => { o.pos = [...o.pos]; o.pos[axe] = arr(cible - sens * dm[j]); }));
      }
      if (a.startsWith("repartir:")) {
        const axe = +a.split(":")[1], tri = [...objs].sort((p, q) => p.pos[axe] - q.pos[axe]), mn = tri[0].pos[axe], mx = tri[tri.length - 1].pos[axe];
        return this.commit(() => tri.forEach((o, j) => { o.pos = [...o.pos]; o.pos[axe] = arr(mn + ((mx - mn) * j) / (tri.length - 1)); }));
      }
    }
    const o = this._objet();
    if (a === "modele") return this.enregistrerModele();
    if (a.startsWith("retirer:")) { const [, cle, j] = a.split(":"); return this.commit(() => o[cle].splice(+j, 1)); }
    if (a.startsWith("ajouter-ligne:")) {
      const cle = a.split(":")[1];
      return this.choisirEntite({ titre: _t("Ajouter une ligne"), obligatoire: true }).then((e) => { if (e) this.commit(() => (o[cle] ||= []).push({ entite: e })); });
    }
    if (a === "ajouter-colonne") return this.commit(() => (o.colonnes ||= []).push({ nom: _t("Colonne"), decimales: 2, source: "stat" }));
    if (a.startsWith("source:")) {
      const [, j, src] = a.split(":"), c = o.colonnes[+j];
      return this.commit(() => { c.source = src; if (src === "stat") ["jour", "semaine", "mois", "annee"].forEach((p) => delete c[p]); else delete c.stat; });
    }
    if (a.startsWith("periode:")) {
      const p = a.split(":")[1], ordre = ["jour", "semaine", "mois", "annee"], l = new Set(o.periodes || ordre);
      l.has(p) ? l.delete(p) : l.add(p);
      return this.commit(() => { o.periodes = ordre.filter((x) => l.has(x)); if (o.periodes.length === 4) delete o.periodes; });
    }
    if (s?.type === "puce") {
      const l = this._puces(true), j = s.i + (a === "p-avant" ? -1 : 1);
      if ((a === "p-avant" || a === "p-apres") && l[j]) return this.commit(() => { [l[j], l[s.i]] = [l[s.i], l[j]]; this.sel = { ...s, i: j }; });
      if (a === "dupliquer") return this.commit(() => { l.splice(s.i + 1, 0, clone(l[s.i])); this.sel = { ...s, i: s.i + 1 }; });
    }
    if (s?.type === "widget") {
      const l = this._wl(s);
      if (a === "w-monter" && s.i > 0) return this.commit(() => { [l[s.i - 1], l[s.i]] = [l[s.i], l[s.i - 1]]; this.sel = { ...s, i: s.i - 1 }; });
      if (a === "w-descendre" && s.i < l.length - 1) return this.commit(() => { [l[s.i + 1], l[s.i]] = [l[s.i], l[s.i + 1]]; this.sel = { ...s, i: s.i + 1 }; });
      if (a === "w-cote") {
        const autre = s.cote === "gauche" ? "droite" : "gauche";
        return this.commit(() => { const [w] = l.splice(s.i, 1), dest = this._wl({ ...s, cote: autre }, true); dest.push(w); this.sel = { ...s, cote: autre, i: dest.length - 1 }; });
      }
      if (a === "dupliquer") return this.commit(() => { l.splice(s.i + 1, 0, clone(l[s.i])); this.sel = { ...s, i: s.i + 1 }; });
    }
    if (a === "supprimer") return this.supprimer();
    if (a === "dupliquer" && s.type === "meuble") {
      const c = clone(d.meubles[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.meubles.push(c); this.sel = { type: "meuble", i: d.meubles.length - 1 }; });
    }
    if (s?.type === "meuble" && /^rot:|^miroir$/.test(a)) {
      const m = d.meubles[s.i];
      if (a === "miroir") return this.commit(() => { if (m.miroir) delete m.miroir; else m.miroir = true; });
      return this.commit(() => { m.rotation = (((nbr(m.rotation) + +a.slice(4)) % 360) + 360) % 360; if (!m.rotation) delete m.rotation; });
    }
    if (a === "dupliquer" && s.type === "texte") {
      const c = clone(d.textes[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.textes.push(c); this.sel = { type: "texte", i: d.textes.length - 1 }; });
    }
    if (a === "dupliquer" && s.type === "point") {
      const c = clone(d.points[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.points.push(c); this.sel = { type: "point", i: d.points.length - 1 }; });
    }
    if (a === "convertir") {
      const vers = s.type === "mur" ? "limite" : "mur";
      return this.commit(() => { const [seg] = this._liste(s.type).splice(s.i, 1); this._liste(vers).push(seg); this.sel = { type: vers, i: this._liste(vers).length - 1 }; });
    }
    if (a === "couper") {
      return this.commit(() => {
        // les deux moitiés gardent la 5e valeur (groupe)
        const l = this._liste(s.type), [x1, y1, x2, y2, ...r] = l[s.i], m = [arr((x1 + x2) / 2), arr((y1 + y2) / 2)];
        l.splice(s.i, 1, [x1, y1, m[0], m[1], ...r], [m[0], m[1], x2, y2, ...r]);
      });
    }
  }

  supprimer() {
    const s = this.sel, d = this.d;
    if (this.multi.size > 1) {
      const par = {};
      [...this.multi].forEach((k) => { const m = deCle(k); if (m.type !== "widget") (par[m.type] ||= []).push(m.i); });
      return this.commit(() => {
        const L = { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles };
        for (const [ty, l] of Object.entries(par)) l.sort((x, y) => y - x).forEach((i) => L[ty].splice(i, 1));
        this.sel = null; this.multi.clear();
      }), this.snack(_t("{n} éléments supprimés.", { n: Object.values(par).flat().length }), _t("Annuler"), this._annulation(), 10000);
    }
    if (!s) return;
    if (s.type === "widget" && s.cote === "fiche") {
      const pf = porteur(s);
      this.commit(() => { this._wl(s).splice(s.i, 1); this._nettoyerFiche(d[GENRES_FICHE[pf.genre]][pf.i]); this.sel = { type: pf.genre, i: pf.i }; });
      return this.snack(_t("Widget retiré de la fiche."), _t("Annuler"), this._annulation(), 8000);
    }
    const listes = { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles, widget: s.type === "widget" ? this._wl(s) : null,
      puce: s.type === "puce" ? this._puces(true) : null };
    const dedans = s.type === "piece" ? this._meublesDans(d.pieces[s.i].poly) : [];
    const zones = s.type === "piece" ? this._sousZonesDans(s.i).map((j) => d.pieces[j]) : [];
    this.commit(() => { listes[s.type].splice(s.i, 1); this.sel = null; });
    if (dedans.length || zones.length) {
      const quoi = [dedans.length ? _t("{n} meuble|{n} meubles", { n: dedans.length }) : "", zones.length ? _t("{n} sous-zone|{n} sous-zones", { n: zones.length }) : ""].filter(Boolean).join(_t(" et "));
      return this.snack(_t("Pièce supprimée ; ses {quoi} restent en place.", { quoi }), [[_t("Les supprimer aussi"), () => this.commit(() => { dedans.sort((a, b) => b - a).forEach((i) => d.meubles.splice(i, 1)); d.pieces = d.pieces.filter((p) => !zones.includes(p)); })], [_t("Annuler"), this._annulation()]], 12000);
    }
    this.snack(_t("Élément supprimé."), _t("Annuler"), this._annulation(), 8000);
  }

  deplacer(dx, dy) {
    const s = this.sel, o = this._objet();
    if (this.multi.size > 1) {
      return this.commit(() => { const snap = clone(this.d); for (const k of this.multi) if (!k.startsWith("widget:")) this._translater(k, dx, dy, snap); });
    }
    if (!s || s.type === "widget" || s.type === "puce") return;
    this.commit(() => {
      const t = (p) => [arr(p[0] + dx), arr(p[1] + dy)];
      if (s.type === "point" || s.type === "texte" || s.type === "meuble") { o.pos = t(o.pos); if (s.type === "point") this._rattacher(o); }
      else if (s.type === "piece") { this._meublesDans(o.poly).forEach((j) => { this.d.meubles[j].pos = t(this.d.meubles[j].pos); }); const sn = clone(this.d); this._sousZonesDans(s.i, sn).forEach((j) => this._bougerZone(j, t, sn)); o.poly = o.poly.map(t); if (o.etiquette) o.etiquette = t(o.etiquette); }
      else { const seg = s.type === "ouverture" ? o.seg : this._liste(s.type)[s.i]; seg.splice(0, 4, seg[0] + dx, seg[1] + dy, seg[2] + dx, seg[3] + dy); }
    });
  }

  // ---------- clavier ----------
  _touche(ev) {
    const saisie = ev.composedPath().some((n) => n instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName) || n.isContentEditable));
    const ctrl = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
    if (ctrl && k === "s") { ev.preventDefault(); ev.stopPropagation(); this.enregistrer(); return; }
    const interrupteur = ev.composedPath().some((n) => n instanceof HTMLInputElement && (n.type === "checkbox" || n.type === "radio"));
    if (this._menuOuvert) return; // menu déroulant ouvert : il gère ses touches (flèches, Échap)
    // modale ⚙ Paramètres : Échap la ferme (après validation du champ en cours), Ctrl+Z / Ctrl+Y annulent et rétablissent, les autres raccourcis attendent
    if (this.vueParametres && !this.R.querySelector(".ed-voile")) {
      if (k === "escape") {
        ev.preventDefault(); ev.stopPropagation();
        if (this._confParam) { this._confParam = null; this._panneau(); this.R.querySelector('.ed-modale [data-par="edition"]')?.focus(); return; }
        const a = this.R.activeElement;
        if (a instanceof HTMLInputElement && !interrupteur) a.blur(); // « change » d'abord : la saisie en cours est gardée
        this.panneauParametres(false);
        return;
      }
      if (ctrl && (k === "z" || k === "y") && (!saisie || interrupteur)) { ev.preventDefault(); if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler(); }
      return;
    }
    if ((saisie && !(interrupteur && ((ctrl && (k === "z" || k === "y")) || k === "escape"))) || this.R.querySelector(".ed-voile")) return;
    if ((k === "arrowup" || k === "arrowdown") && ev.composedPath().some((n) => n.dataset?.cqGlisse)) return; // ordre des calques au clavier
    if (ctrl && k === "z") { ev.preventDefault(); ev.shiftKey ? this.retablir() : this.annuler(); return; }
    if (ctrl && k === "y") { ev.preventDefault(); this.retablir(); return; }
    if (ctrl && k === "a") { ev.preventDefault(); ev.stopPropagation(); this.toutSelectionner(); return; }
    if (ctrl && k === "d") { ev.preventDefault(); if (this.multi.size > 1 || this.sel?.type === "point" || this.sel?.type === "meuble") this._action("dupliquer"); return; }
    if (ctrl && k === "g") { ev.preventDefault(); ev.stopPropagation(); if (ev.shiftKey) this.degrouper(); else this.grouper(); return; }
    if (ctrl || ev.altKey) return;
    if (ev.key === "?") { ev.preventDefault(); ev.stopPropagation(); this.aideClavier(); return; }
    // Entrée / Espace sur un bouton de zoom : le bouton s'active (pas de fin de tracé ni de déplacement de la vue)
    if ((k === " " || k === "enter") && ev.composedPath().some((n) => n.tagName === "BUTTON" && n.dataset?.z)) return;
    // Entrée / Espace sur un bouton atteint au clavier (barre d'outils…) : le bouton s'active, sauf pendant un tracé
    if ((k === " " || k === "enter") && !this.trace.length && ev.composedPath().some((n) => n instanceof HTMLButtonElement && n.matches(":focus-visible"))) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); };
    if (k === " ") { stop(); this.espace = true; this.zone.classList.add("espace"); return; }
    if (["escape", "enter", "delete", "backspace", "arrowleft", "arrowright", "arrowup", "arrowdown", "a"].includes(k) || RACCOURCIS[k]) stop();
    if (k === "escape") { if (this.trace.length || this.outil !== "selection" || this.aPlacer || this.aPlacerMeuble) { this.aPlacer = null; this.aPlacerMeuble = null; this.trace = []; this.choisirOutil("selection"); } else if (!this.sel && this.vueCalques) this.panneauCalques(false); else if (!this.sel && this.vueAmbiance) this.panneauAmbiance(false);
      else this.selectionner(null); return; }
    if (k === "enter" && this.trace.length) { this._finirTrace(); return; }
    if ((k === "delete" || k === "backspace") && this.sel) { ev.preventDefault(); this.supprimer(); return; }
    const pas = this.grille * (ev.shiftKey ? 10 : 1);
    const fl = { arrowleft: [-pas, 0], arrowright: [pas, 0], arrowup: [0, -pas], arrowdown: [0, pas] }[k];
    if (fl && this.sel) { ev.preventDefault(); this.deplacer(...fl); return; }
    if (RACCOURCIS[k]) { this.choisirOutil(RACCOURCIS[k]); return; }
    if (k === "a") this.ouvrirCatalogue();
  }

  // ---------- aide aux raccourcis clavier (bouton « ? » ou touche ?) ----------
  aideClavier() {
    if (this.R.querySelector(".ed-voile.ed-aide-clavier")) return;
    this._fermerMenu();
    const retour = this.R.activeElement;
    const K = (...t) => t.map((x) => `<kbd>${esc(x)}</kbd>`).join("+"), ou = (...l) => l.map((x) => `<span>${x}</span>`).join(" / ");
    const ctrl = _t("Ctrl"), maj = _t("Maj");
    const groupes = [
      [_t("Général"), [[K(ctrl, "Z"), _t("Annuler##defaire")], [ou(K(ctrl, "Y"), K(ctrl, maj, "Z")), _t("Rétablir")], [K(ctrl, "S"), _t("Enregistrer")],
        [K("A"), _t("Ajouter un objet ou un widget")], [K("?"), _t("Cette aide")], [K(_t("Échap")), _t("Annuler l'outil, désélectionner, fermer un panneau")]]],
      [_t("Outils"), OUTILS.map(([id, , t]) => [K(Object.keys(RACCOURCIS).find((k) => RACCOURCIS[k] === id).toUpperCase()), esc(_t(t).replace(/\s*\([^)]*\)$/, ""))])],
      [_t("Sélection"), [[_t("Clic"), _t("Sélectionner")], [`${K(ctrl)}+${_t("clic")}`, _t("Ajouter à la sélection ou en retirer")], [_t("Glisser dans le vide"), _t("Cadre de sélection")],
        [K(ctrl, "A"), _t("Tout sélectionner")], [K(_t("Flèches")), _t("Déplacer d'un pas de grille (avec Maj : ×10)")], [K(_t("Suppr")), _t("Retirer")],
        [K(ctrl, "D"), _t("Dupliquer")], [K(ctrl, "G"), _t("Grouper")], [K(ctrl, maj, "G"), _t("Dégrouper")]]],
      [_t("Vue et dessin"), [[ou(`${K(_t("Espace##touche"))}+${_t("glisser")}`, _t("clic molette")), _t("Déplacer la vue")], [`${K("Alt")} ${_t("maintenu")}`, _t("Sans magnétisme")],
        [K(maj), _t("Angle libre en dessin")], [ou(K(_t("Entrée##touche")), _t("clic droit")), _t("Finir un tracé")]]],
    ];
    const voile = document.createElement("div");
    voile.className = "ed-voile ed-aide-clavier";
    poserHTML(voile, `<div class="ed-dialogue large ed-dlg-touches" role="dialog" aria-modal="true" aria-labelledby="ed-clavier-t"><header><h2 id="ed-clavier-t">${_t("Raccourcis clavier")}</h2></header>
      <div class="ed-touches">${groupes.map(([t, l]) => `<section><h3>${t}</h3><dl>${l.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></section>`).join("")}</div>
      <footer><button class="ed-btn texte" data-fermer="1">${_t("Fermer")}</button></footer></div>`);
    this.R.querySelector("ha-card").append(voile);
    const fermer = () => {
      voile.remove(); window.removeEventListener("keydown", touche, true);
      const b = retour?.isConnected ? retour : this.barre.querySelector('[data-a="aide"]');
      if (b?.getClientRects().length) b.focus({ preventScroll: true });
    };
    const touche = (ev) => {
      if (ev.key === "Escape" || ev.key === "?") { ev.preventDefault(); ev.stopPropagation(); fermer(); }
      else if (ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
    };
    window.addEventListener("keydown", touche, true);
    voile.onpointerdown = (ev) => { voile._bas = ev.target === voile; };
    voile.onclick = (ev) => { if ((ev.target === voile && voile._bas) || ev.composedPath().some((n) => n.dataset?.fermer)) fermer(); };
    voile.querySelector("[data-fermer]").focus();
  }

  // ---------- entités proposées d'après un critère (composant réutilisable : widgets prêts à l'emploi, puis ouvertures et meubles) ----------
  // contexte : { zone: id de pièce HA visée, device: appareil visé, exclure: Set d'entités, preferer: Set d'appareils déjà choisis }
  // Rend la liste triée : appareil visé, puis appareil déjà choisi, puis pièce visée, puis le reste (diagnostics en dernier).
  entitesCandidates(crit, ctx = {}) {
    const hass = this.hass, alt = (Array.isArray(crit) ? crit : [crit]).filter(Boolean), l = [];
    if (!alt.length) return l;
    const norm = (t) => sansAccent(String(t)).replace(/[_.\-/]+/g, " ");
    const dans = (v, x) => v == null || (Array.isArray(v) ? v.includes(x) : v === x);
    const rx = new Map();
    const re = (src) => { if (!rx.has(src)) { try { rx.set(src, new RegExp(src, "i")); } catch (e) { rx.set(src, null); } } return rx.get(src); };
    for (const [e, s] of Object.entries(hass.states || {})) {
      if (ctx.exclure?.has(e)) continue;
      const dom = e.split(".")[0], a = s.attributes || {}, txt = norm(`${e} ${a.friendly_name || ""}`);
      const ok = alt.some((k) => dans(k.d, dom) && dans(k.dc, a.device_class) && dans(k.u, a.unit_of_measurement)
        && (!k.id || re(k.id)?.test(txt)) && (!k.non || !re(k.non)?.test(txt)));
      if (!ok) continue;
      const r = hass.entities?.[e], dev = r?.device_id, zone = r?.area_id || hass.devices?.[dev]?.area_id || null;
      const score = (ctx.device && dev === ctx.device ? 8 : 0) + (dev && ctx.preferer?.has(dev) ? 6 : 0) + (ctx.zone && zone === ctx.zone ? 4 : 0) - (r?.entity_category ? 2 : 0);
      l.push({ e, nom: String(a.friendly_name || e), ici: !!ctx.zone && zone === ctx.zone, dev, score, v: parseFloat(s.state) });
    }
    const tri = (Array.isArray(crit) ? crit[0] : crit)?.tri;
    return l.sort((x, y) => y.score - x.score || (tri === "bas" ? (isNaN(x.v) ? 1e9 : x.v) - (isNaN(y.v) ? 1e9 : y.v) : 0) || x.nom.localeCompare(y.nom, _loc()));
  }

  // une entité pour un champ : aucune correspondance → null (champ « à compléter ») ; une seule (ou une seule sur l'appareil déjà
  // choisi) → prise d'office ; plusieurs → petite liste (pièce visée d'abord) avec « Autre entité… » (sélecteur complet) et « Ignorer ».
  async proposerEntite({ titre, crit, ctx = {}, domaine = "" }) {
    let l = this.entitesCandidates(crit, ctx);
    if (ctx.preferer?.size) { const m = l.filter((c) => c.dev && ctx.preferer.has(c.dev)); if (m.length === 1) return m[0].e; }
    if (ctx.device) { const m = l.filter((c) => c.dev === ctx.device); if (m.length === 1) return m[0].e; }
    if (l.length <= 1) return l[0]?.e ?? null;
    return this.choisirParmi({ titre, liste: l.slice(0, 30), ctx, domaine });
  }

  // petite liste d'entités proposées : Entrée / clic = choisir ; « Autre entité… » = sélecteur complet ; Échap / « Ignorer » = null
  choisirParmi({ titre, liste, ctx = {}, domaine = "" }) {
    return new Promise((fin) => {
      const hass = this.hass, nomZone = ctx.zone && (hass.areas?.[ctx.zone]?.name || ctx.zone);
      const ici = liste.filter((c) => c.ici), ailleurs = liste.filter((c) => !c.ici);
      const ligne = (c) => { const s = hass.states[c.e];
        return `<button data-r="${esc(c.e)}"><ha-icon icon="${esc(iconeEntite(hass, c.e))}"></ha-icon><span class="n"><span>${esc(c.nom)}</span><small>${esc(c.e)}</small></span><span class="etat">${esc(s ? hass.formatEntityState?.(s) ?? s.state : "")}</span></button>`; };
      const voile = document.createElement("div"), id = `ed-cp-${Math.random().toString(36).slice(2, 8)}`;
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue ed-choix-parmi" role="dialog" aria-modal="true" aria-labelledby="${id}"><header><h2 id="${id}">${esc(titre)}</h2>
          <div class="ed-aide">${_t("{n} entités correspondent.", { n: liste.length })}</div></header>
        <div class="ed-resultats">${ici.length && nomZone ? `<h4>${_t("Dans « {piece} »", { piece: esc(nomZone) })}</h4>${ici.map(ligne).join("")}${ailleurs.length ? `<h4>${_t("Ailleurs")}</h4>` : ""}` : ""}${ailleurs.map(ligne).join("")}</div>
        <footer><button class="ed-btn texte" data-r="autre"><ha-icon icon="mdi:magnify"></ha-icon>${_t("Autre entité…")}</button><span class="ed-espace"></span><button class="ed-btn texte" data-r="">${_t("Ignorer")}</button></footer></div>`);
      this.R.querySelector("ha-card").append(voile);
      const avant = this.R.activeElement;
      const fermer = (v) => { voile.remove(); window.removeEventListener("keydown", touche, true); if (avant?.isConnected) avant.focus(); fin(v); };
      const touche = (ev) => {
        if (!this._dessus(voile)) return;
        if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); fermer(null); }
        else if (ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
      };
      window.addEventListener("keydown", touche, true);
      voile.onclick = async (ev) => {
        ev.stopPropagation();
        if (ev.target === voile) return fermer(null);
        const b = ev.composedPath().find((n) => n.dataset?.r != null);
        if (!b) return;
        if (b.dataset.r !== "autre") return fermer(b.dataset.r || null);
        const e = await this.choisirEntite({ titre, domaine });
        if (e) fermer(e);
      };
      setTimeout(() => voile.querySelector(".ed-resultats button")?.focus(), 30);
    });
  }
  // un dialogue (voile) est-il au premier plan ? (les touches Échap / Tab ne vont qu'à lui)
  _dessus(voile) { const l = this.R.querySelectorAll(".ed-voile"); return l[l.length - 1] === voile; }

  // contexte de pré-remplissage d'un widget : pièce visée (sa pièce HA), ou appareil et pièce de l'élément qui porte la fiche
  _contexteWidget(piece, pf) {
    const d = this.d, hass = this.hass, ctx = { exclure: new Set(), preferer: new Set() };
    if (piece != null) ctx.zone = d.pieces[piece]?.zone || null;
    if (pf) {
      const o = d[GENRES_FICHE[pf.genre]]?.[pf.i], e = o && (o.entite || o.contact || o.volet || o.valeur), r = e && hass.entities?.[e];
      if (r?.device_id) ctx.device = r.device_id;
      ctx.zone ||= r?.area_id || hass.devices?.[r?.device_id]?.area_id || null;
    }
    return ctx;
  }

  // pré-remplit les champs entité d'un widget prêt à l'emploi (`auto`) ; rend les chemins restés vides (« à compléter »)
  async _preRemplir(o, auto, ctx, nomWidget) {
    const manquants = new Set(), lire = (c) => c.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o);
    const choisi = (e) => { ctx.exclure.add(e); const dev = this.hass.entities?.[e]?.device_id; if (dev) ctx.preferer.add(dev); };
    for (const [chemin, spec] of Object.entries(auto || {})) {
      if (chemin === "entites" || chemin === "lignes") {
        const rangs = [];
        if (spec.n) for (const c of this.entitesCandidates(spec.k, ctx).slice(0, spec.n)) { rangs.push({ entite: c.e }); choisi(c.e); }
        for (const r of spec.rangs || []) {
          const c = this.entitesCandidates(r.k, ctx)[0];
          if (c) { rangs.push({ entite: c.e, ...(r.nom ? { nom: r.nom } : {}) }); choisi(c.e); }
        }
        if (rangs.length) o[chemin] = [...(Array.isArray(o[chemin]) ? o[chemin] : []), ...rangs];
        else if (chemin === "entites") manquants.add(chemin);
        continue;
      }
      if (lire(chemin)) continue;
      const nomChamp = NOMS_CHAMPS_AUTO[chemin.replace(/^colonnes\.\d+\./, "colonnes.")];
      const e = await this.proposerEntite({ titre: nomChamp ? `${nomWidget} · ${_t(nomChamp)}` : nomWidget, crit: spec, ctx, domaine: (Array.isArray(spec) ? spec[0] : spec)?.d || "" });
      if (e) { poserChemin(o, chemin, e); choisi(e); } else manquants.add(chemin);
    }
    return manquants;
  }

  // chemins des champs entité d'un widget (modèles : `demander` = ceux à choisir à chaque ajout)
  _cheminsEntites(o) {
    const l = Object.keys(CHAMPS_ENTITE_WIDGET).filter((k) => typeof o[k] === "string" && o[k]);
    for (const k of ["entites", "lignes"]) if (Array.isArray(o[k]) && o[k].some((x) => x?.entite || typeof x === "string")) l.push(k);
    (o.colonnes || []).forEach((c, j) => { for (const k of ["stat", "jour", "semaine", "mois", "annee"]) if (c?.[k]) l.push(`colonnes.${j}.${k}`); });
    return l;
  }

  // ---------- atelier : dialogue générique « choisir un type → réglages + aperçu → ajouter (et modèle) » ----------
  // spec : { titre, types: [{ id, nom, icone, desc, objet }], reglages(o) → html (champs data-k / data-entite / data-at),
  //   apercu(o) → html, destinations?: [[valeur, libellé]], dest?, modele?: true (case « Enregistrer dans Mes modèles »),
  //   demander?: true (case « Entités à choisir à chaque ajout »), action?(a, o) : boutons data-at, valider({ o, type, dest, modele, demander }),
  //   type?: type choisi d'office (étape 1 sautée), retour?: élément qui reprend le focus, dessous?: dialogue masqué pendant l'atelier }
  // Réutilisable pour d'autres objets (meubles, ouvertures) : seuls types, reglages, apercu et valider changent.
  // Modification d'un élément existant : initial (objet de départ, étape 2 d'office), fusion(t, o) (objet quand on choisit un autre type,
  //   à partir de l'objet en cours), libelleOk (bouton de validation), ecrire(o, k, v) → true si le champ est écrit par l'appelant
  //   (unités converties…). Types : svg (aperçu à la place de l'icône), groupe (titre de section). Champ data-rendre : formulaire redessiné.
  // Aperçu manipulable (meubles) : classe (du dialogue), apercuTete() / apercuPied() (boutons au-dessus, astuce en dessous),
  //   monter(voile, api) une fois, apresRendu(voile) après chaque dessin de l'aperçu, touche(ev) → true si la touche est prise ;
  //   api : objet(), remplacer(o, focus), rendre(focus), maj() (aperçu seul) ; action(a, o) peut rendre le sélecteur à refocaliser.
  //   Dans l'aperçu, l'élément focalisé (data-foc) le reste quand l'aperçu est redessiné.
  ouvrirAtelier(spec) {
    const voile = document.createElement("div"), id = `ed-at-${Math.random().toString(36).slice(2, 8)}`;
    voile.className = "ed-voile ed-at-voile ed-plein-tel";
    let etape = "type", type = null, o = null, dest = spec.dest ?? spec.destinations?.[0]?.[0], modele = false, demander = true, minuteur = 0;
    if (spec.initial) { o = clone(spec.initial); etape = "reglages"; type = spec.typeInitial ?? null; }
    const avant = spec.retour || this.R.activeElement;
    if (spec.dessous) spec.dessous.style.visibility = "hidden"; // le dialogue d'où vient l'atelier : masqué le temps de l'atelier
    const apercu = () => { try { return spec.apercu(o); } catch (e) { return `<div class="w-note">${esc(e.message)}</div>`; } };
    const rendre = (focus) => {
      this._atelierObjet = o;
      const t = spec.types.find((x) => x.id === type);
      poserHTML(voile, `<div class="ed-dialogue large ed-atelier${spec.classe ? ` ${spec.classe}` : ""}" role="dialog" aria-modal="true" aria-labelledby="${id}">
        <header><h2 id="${id}">${esc(spec.titre)}</h2><div class="ed-aide">${etape === "type" ? _t("1. Choisis le type") : t ? _t("2. Réglages · {type}", { type: esc(t.nom || "") }) : _t("Réglages")}</div></header>
        ${etape === "type" ? `<div class="ed-cat">${[...new Map(spec.types.map((x) => [x.groupe || "", 1])).keys()].map((g) => `${g ? `<h4 class="ed-at-groupe">${esc(g)}</h4>` : ""}<div class="ed-grille">${spec.types.filter((x) => (x.groupe || "") === g).map((x) => `<div class="ed-tuile" role="button" tabindex="0" data-at-type="${esc(x.id)}"${x.detail ? ` title="${esc(x.detail)}"` : ""}>${x.svg || `<ha-icon icon="${esc(x.icone)}"></ha-icon>`}<b>${esc(x.nom)}</b>${x.desc ? `<small>${esc(x.desc)}</small>` : ""}</div>`).join("")}</div>`).join("")}</div>`
        : `<div class="ed-cat ed-at-corps"><div class="ed-at-apercu" aria-label="${_t("Aperçu")}">${spec.apercuTete ? `<div class="ed-at-ap-tete"><h4>${_t("Aperçu")}</h4>${spec.apercuTete()}</div>` : `<h4>${_t("Aperçu")}</h4>`}<div class="ed-at-w">${apercu()}</div>${spec.apercuPied?.() || ""}</div>
            <div class="ed-at-form">${spec.reglages(o)}
              ${spec.destinations ? `<div class="ed-champ"><label>${_t("Emplacement")}</label><div class="ed-seg" role="radiogroup">${spec.destinations.map(([v, n]) => `<button role="radio" aria-checked="${v === dest}" data-at-dest="${esc(v)}" class="${v === dest ? "on" : ""}">${esc(n)}</button>`).join("")}</div></div>` : ""}
              ${spec.modele ? `<label class="ed-inter"><span>${_t("Enregistrer dans Mes modèles")}</span><input type="checkbox" data-at-modele ${modele ? "checked" : ""}></label>
                ${modele && spec.demander ? `<label class="ed-inter"><span>${_t("Entités à choisir à chaque ajout")}</span><input type="checkbox" data-at-demander ${demander ? "checked" : ""}></label>` : ""}` : ""}</div></div>`}
        <footer>${etape === "reglages" ? `<button class="ed-btn texte" data-at-retour><ha-icon icon="mdi:arrow-left"></ha-icon>${_t("Retour")}</button>` : ""}<span class="ed-espace"></span>
          <button class="ed-btn texte" data-at-fermer>${_t("Annuler")}</button>${etape === "reglages" ? `<button class="ed-btn plein" data-at-ok><ha-icon icon="mdi:check"></ha-icon>${esc(spec.libelleOk || _t("Ajouter"))}</button>` : ""}</footer></div>`);
      if (etape === "reglages") {
        const P = voile.querySelector(".ed-at-form");
        P.querySelectorAll("input[data-k],select[data-k]").forEach((inp) => {
          const ecrire = (ev) => {
            const v = inp.type === "checkbox" ? inp.checked : inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim();
            if (!spec.ecrire?.(o, inp.dataset.k, v)) poserChemin(o, inp.dataset.k, v);
            // formulaire redessiné (champ qui en montre ou masque d'autres) : au changement seulement, pas à chaque frappe
            // (le focus reste sur le champ actif après le rendu, même après Tab)
            if (inp.dataset.rendre != null && ev?.type === "change") return setTimeout(() => {
              if (!voile.isConnected) return;
              const f = this.R.activeElement, sel = ["k", "at", "entite"].map((k) => f?.dataset?.[k] != null && `[data-${k}="${f.dataset[k]}"]`).find(Boolean);
              rendre(sel || `[data-k="${inp.dataset.k}"]`);
            });
            clearTimeout(minuteur); minuteur = setTimeout(majApercu, 120);
          };
          inp.addEventListener("input", ecrire); inp.addEventListener("change", ecrire);
        });
        this._cablerIcones(P);
        spec.apresRendu?.(voile);
      }
      (focus ? voile.querySelector(focus) : null)?.focus();
    };
    const majApercu = () => {
      const w = voile.querySelector(".ed-at-w"); if (!w) return;
      const f = this.R.activeElement, foc = f && w.contains(f) ? f.closest("[data-foc]")?.dataset.foc : null;
      poserHTML(w, apercu()); spec.apresRendu?.(voile);
      if (foc) w.querySelector(`[data-foc="${foc}"]`)?.focus({ preventScroll: true });
    };
    const api = { objet: () => o, remplacer: (n, focus) => { o = n; rendre(focus); }, rendre: (focus) => rendre(focus), maj: () => majApercu() };
    const choisirType = (tid) => { const t = spec.types.find((x) => x.id === tid); if (!t) return; if (type !== tid) o = spec.fusion ? spec.fusion(t, o) : clone(t.objet || {}); type = tid; etape = "reglages"; rendre(".ed-at-form input, .ed-at-form button"); };
    const fermer = (ok) => {
      clearTimeout(minuteur); voile.remove(); window.removeEventListener("keydown", touche, true); this._atelierObjet = null;
      if (spec.dessous) spec.dessous.style.visibility = "";
      if (ok) spec.valider({ o, type, dest, modele, demander });
      else if (avant?.isConnected) avant.focus();
    };
    const touche = (ev) => {
      if (!this._dessus(voile)) return;
      if (etape === "reglages" && spec.touche?.(ev)) return;
      if (ev.key === "Escape") { if (ev.composedPath().some((n) => n.classList?.contains("ed-ic") && !n.querySelector(".ed-ic-menu")?.hidden)) return; ev.preventDefault(); ev.stopPropagation(); fermer(false); }
      else if (ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
      else if (ev.key === "Enter") {
        const t = ev.composedPath()[0];
        if (t?.dataset?.atType) { ev.preventDefault(); choisirType(t.dataset.atType); }
        else if (etape === "reglages" && !(t?.tagName === "BUTTON" || t?.tagName === "TEXTAREA" || t?.closest?.(".ed-ic"))) { ev.preventDefault(); t?.dispatchEvent?.(new Event("change")); fermer(true); }
      }
    };
    window.addEventListener("keydown", touche, true);
    voile.addEventListener("pointerdown", (ev) => { voile._bas = ev.target === voile; });
    voile.addEventListener("click", async (ev) => {
      ev.stopPropagation(); // l'aperçu n'est pas la carte : aucun clic ne lui revient
      const ch = ev.composedPath(), x = (k) => ch.find((n) => n.dataset?.[k] != null);
      if ((ev.target === voile && voile._bas) || x("atFermer")) return fermer(false);
      if (x("atOk")) return fermer(true);
      if (x("atRetour")) { etape = "type"; return rendre(`[data-at-type="${type}"]`); }
      const ty = x("atType"); if (ty) return choisirType(ty.dataset.atType);
      const de = x("atDest"); if (de) { dest = de.dataset.atDest; return rendre(`[data-at-dest="${dest}"]`); }
      const mo = x("atModele"); if (mo) { modele = mo.checked; return rendre("[data-at-modele]"); }
      const dm = x("atDemander"); if (dm) { demander = dm.checked; return; }
      const ef = x("effacer"); if (ef) { poserChemin(o, ef.dataset.effacer, ""); return rendre(); }
      const en = x("entite");
      if (en) {
        const lab = en.closest(".ed-champ")?.querySelector("label")?.textContent.replace(_t(" · à compléter"), "").trim();
        const e = await this.choisirEntite({ titre: lab || _t("Choisir une entité"), domaine: en.dataset.dom });
        if (e != null) { poserChemin(o, en.dataset.entite, e); if (spec.apresEntite) spec.apresEntite(o, en.dataset.entite, e); }
        return rendre(`[data-entite="${en.dataset.entite}"]`);
      }
      const ac = x("at"); if (ac && spec.action) { const f = await spec.action(ac.dataset.at, o); return rendre(typeof f === "string" ? f : undefined); }
    });
    this.R.querySelector("ha-card").append(voile);
    spec.monter?.(voile, api);
    if (spec.type) choisirType(spec.type); else rendre(etape === "reglages" ? ".ed-at-form input, .ed-at-form button" : ".ed-tuile");
    return voile;
  }

  // « Créer un widget » : l'atelier avec les types de widgets ; ajout au panneau (ou à la fiche) d'où vient la modale
  creerWidget(opt = {}) {
    const pf = opt.cote === "fiche" ? porteur(opt) : null, carte = this.carte;
    const types = TYPES_ATELIER();
    this.ouvrirAtelier({
      titre: _t("Créer un widget"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      destinations: pf ? null : [["gauche", _t("Panneau gauche")], ["droite", _t("Panneau droit")]], dest: pf ? "fiche" : opt.cote || "droite",
      reglages: (o) => this._reglagesAtelier(o),
      apercu: (o) => {
        carte._sansBascule = true;
        try { return carte._widget(o, "apercu", 0).replace(/ data-(w|e|ce|ci|te|ti|b|active)="[^"]*"/g, ""); } finally { carte._sansBascule = false; }
      },
      action: async (a, o) => {
        const [op, j] = a.split(":");
        if (op === "ajouter-entite") { const e = await this.choisirEntite({ titre: _t("Ajouter une entité") }); if (e) (o.entites ||= []).push({ entite: e }); }
        if (op === "retirer-entite") o.entites.splice(+j, 1);
      },
      valider: ({ o, type, dest, modele, demander }) => {
        opt.apres?.();
        const w = clone(o), t = types.find((x) => x.id === type);
        for (const k of Object.keys(w)) if (w[k] === "" || w[k] == null) delete w[k];
        if (Array.isArray(w.entites)) w.entites = w.entites.filter((x) => x?.entite);
        const cote = pf ? "fiche" : dest, ref = pf ? { [pf.genre]: pf.i } : {};
        if (cote === "fiche" && !pf) return;
        this.commit(() => {
          const l = this._wl(cote === "fiche" ? { cote, ...ref } : { cote, piece: opt.piece ?? null }, true);
          l.push(clone(w));
          this.sel = { type: "widget", cote, i: l.length - 1, ...(cote === "fiche" ? ref : opt.piece != null ? { piece: opt.piece } : {}) };
          if (modele) {
            const objet = clone(w), dem = demander ? this._cheminsEntites(objet) : [];
            for (const c of dem) poserChemin(objet, c, c === "entites" || c === "lignes" ? [] : "");
            (this.d.modeles ||= []).push({ id: idModele(), nom: w.titre || t?.nom || _t("Widget"), genre: "widget", icone: w.icone || t?.icone || "mdi:view-dashboard-outline",
              desc: t?.nom || "", objet, ...(dem.length ? { demander: dem } : {}) });
          }
        });
        this.snack(modele ? _t("Widget ajouté et enregistré dans Mes modèles.") : _t("Widget ajouté."));
      },
    });
  }

  // réglages essentiels d'un type de widget dans l'atelier (les autres restent dans le panneau du widget, une fois ajouté)
  _reglagesAtelier(o) {
    const E = (label, k, dom = "") => this._champEntite(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), true, dom);
    const T = (label, k, ph = "") => this._champTexte(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), ph);
    const N = (label, k, pas = 1, ph = "") => this._champNombre(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), pas, ph);
    let h = `${T(_t("Titre"), "titre")}${o.type === "separateur" ? "" : this._champTexte(_t("Icône"), "icone", o.icone, "mdi:…")}`;
    const t = o.type;
    if (t === "tuile") h += `${E(_t("Valeur principale"), "entite")}<div class="ed-ligne trois">${T(_t("Unité"), "unite", _t("auto"))}${N(_t("Décimales"), "decimales", 1, _t("auto"))}${N(_t("Courbe (h)"), "historique", 1, "0")}</div>`;
    if (t === "jauge") h += `${E(_t("Valeur"), "entite")}<div class="ed-ligne trois">${N(_t("Minimum"), "min", 1)}${N(_t("Maximum"), "max", 1)}${T(_t("Unité"), "unite", _t("auto"))}</div>`;
    if (t === "entites") h += `<div class="ed-champ"><label>${_t("Entités")}</label>${(o.entites || []).map((l, j) => `<div class="ed-ligne ed-at-rang">${this._champEntite("", `entites.${j}.entite`, l.entite, false)}<button class="ib" data-at="retirer-entite:${j}" title="${_t("Retirer")}" aria-label="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></div>`).join("")}
      <button class="ed-btn contour" data-at="ajouter-entite"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une entité")}</button></div>`;
    if (t === "thermostat") h += E(_t("Thermostat"), "entite", "climate");
    if (t === "commande") h += E(_t("Volet, portail, vanne"), "entite", "cover");
    if (t === "serrure") h += E(_t("Serrure"), "entite", "lock");
    if (t === "climat") h += N(_t("Durée de la tendance (min)"), "duree", 5, "30");
    if (t === "tarif") h += `${E(_t("Prix en cours (€/kWh)"), "prix", "sensor")}${E(_t("Période (heures pleines / creuses)"), "periode", "sensor")}`;
    if (t === "ve") h += `${E(_t("Batterie (%)"), "batterie", "sensor")}${E(_t("Autonomie"), "autonomie", "sensor")}${E(_t("Puissance de charge"), "puissance", "sensor")}${E(_t("Câble branché"), "branche")}`;
    if (t === "periodes") h += `<div class="ed-ligne">${T(_t("Nom de la colonne"), "colonnes.0.nom")}${T(_t("Unité"), "colonnes.0.unite")}</div>${E(_t("Compteur cumulatif (statistique HA)"), "colonnes.0.stat", "sensor")}`;
    return h;
  }

  // ---------- pièces du plan et pièces HA (pré-remplissage des ouvertures et des meubles connectés) ----------
  // pièce HA d'une pièce du plan : sa clé `zone`, sinon l'aire HA de même nom (sans accents ni casse), sinon la seule dont le nom
  // contient l'autre (4 lettres au moins)
  _zonePiece(p) {
    const areas = this.hass?.areas || {};
    if (!p) return null;
    if (p.zone && areas[p.zone]) return p.zone;
    const n = sansAccent(String(p.nom || "")).trim(), nomA = (a) => sansAccent(String(a.name || "")).trim();
    if (!n) return null;
    const l = Object.values(areas), egal = l.find((a) => nomA(a) === n);
    if (egal) return egal.area_id;
    const proches = l.filter((a) => { const m = nomA(a); return m.length >= 4 && n.length >= 4 && (m.includes(n) || n.includes(m)); });
    return proches.length === 1 ? proches[0].area_id : null;
  }
  // pièces (hors sous-zones) bordées par un segment : intérieures d'abord
  _piecesDuSeg(seg) {
    const m = [(seg[0] + seg[2]) / 2, (seg[1] + seg[3]) / 2];
    return (this.d.pieces || []).filter((p) => !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && (distBord(m, p.poly) < 20 || dansPoly(m, p.poly)))
      .sort((a, b) => !!a.dehors - !!b.dehors);
  }
  _zonesDuSeg(seg) { return [...new Set(this._piecesDuSeg(seg).map((p) => this._zonePiece(p)).filter(Boolean))]; }
  // pièce (hors sous-zones) qui contient un point : la plus petite, intérieure d'abord
  _pieceDuPoint(q) {
    return (this.d.pieces || []).filter((p) => !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && dansPoly(q, p.poly))
      .sort((a, b) => !!a.dehors - !!b.dehors || aire(a.poly) - aire(b.poly))[0] || null;
  }
  // côté extérieur d'une ouverture tracée : à l'opposé de la pièce intérieure qu'elle borde (mur extérieur) ; sinon le côté par défaut
  _dehorsAuto(seg, defaut) {
    const [a, b, d, e] = seg, mx = (a + d) / 2, my = (b + e) / 2;
    const interieur = (n) => (this.d.pieces || []).some((p) => !p.sous_zone && !p.dehors && Array.isArray(p.poly) && p.poly.length > 2 && dansPoly([mx + n[0] * 30, my + n[1] * 30], p.poly));
    const inv = [-defaut[0] || 0, -defaut[1] || 0];
    return interieur(defaut) && !interieur(inv) ? inv : defaut;
  }

  // entités libres (pas encore sur le plan) d'un champ d'ouverture : celles des pièces données d'abord (`ici`), puis la classe
  // d'appareil qui va avec le type (porte → door…) ou `pref` (portail, garage)
  _candidatsOuverture(champ, o, zones, exclure = this._utilisees(), pref = null) {
    const hass = this.hass, dcPref = [...(pref || []), ...(champ === "contact" ? DC_TYPE_OUV[o.type] || [] : [])];
    const l = this._marquerIci(this.entitesCandidates(CRIT_OUV[champ], { exclure }), zones);
    for (const c of l) c.pref = dcPref.includes(hass.states[c.e]?.attributes.device_class);
    return l.sort((x, y) => y.ici - x.ici || y.pref - x.pref);
  }
  // une entité d'après la pièce (même règle pour les ouvertures et les meubles connectés) : une seule dans la pièce → prise d'office ;
  // plusieurs → petite liste (la pièce d'abord, « Autre entité… », « Ignorer ») ; aucune → null (champ « à compléter »).
  // Pièce inconnue : la seule entité qui correspond, sinon la liste. Sans dialogue (`dialogue: false`) : seulement le cas « une seule ».
  async _entitePourPiece({ titre, liste, zones, dialogue = true, domaine = "" }) {
    const ici = liste.filter((c) => c.ici);
    if (ici.length === 1) return ici[0].e;
    if (!dialogue) return null;
    if (ici.length > 1 || (!zones.length && liste.length > 1)) return this.choisirParmi({ titre, liste: liste.slice(0, 30), ctx: { zone: zones[0] }, domaine });
    return !zones.length && liste.length === 1 ? liste[0].e : null;
  }
  // pré-remplissage d'une ouverture à la pose : `champs` voulus (contact, volet, entite), `chercher` repris seulement s'il n'y en a
  // qu'un dans la pièce ; rend les champs restés vides (« à compléter ») et les entités reliées
  async _preRemplirOuverture(o, { champs = [], chercher = [], pref = null, dialogue = true } = {}) {
    const zones = this._zonesDuSeg(o.seg), exclure = this._utilisees(), manquants = new Set(), relies = [];
    const nomOuv = o.nom || _t(NOMS_TYPE_OUV[o.type] || _tk("Ouverture"));
    for (const ch of [...new Set([...champs, ...chercher])]) {
      if (o[ch] || !CRIT_OUV[ch]) continue;
      const oblig = champs.includes(ch), liste = this._candidatsOuverture(ch, o, zones, exclure, pref);
      const e = await this._entitePourPiece({ titre: `${nomOuv} · ${_t(A_COMPLETER[ch])}`, liste, zones, dialogue: dialogue && oblig, domaine: CRIT_OUV[ch].d });
      if (e) { o[ch] = e; exclure.add(e); relies.push(e); } else if (oblig) manquants.add(ch);
    }
    return { manquants, relies };
  }
  // meuble connecté posé depuis un modèle : son entité cherchée dans la pièce où il est (même règle que les ouvertures)
  async _preRemplirMeuble(i, pre) {
    const m = this.d.meubles?.[i];
    if (!m || m.entite) return;
    const p = this._pieceDuPoint(m.pos), zones = p ? [this._zonePiece(p)].filter(Boolean) : [];
    const liste = this._marquerIci(this.entitesCandidates(K(pre.domaine || null), { exclure: this._utilisees() }), zones);
    const e = await this._entitePourPiece({ titre: pre.nom || _t("Meuble"), liste, zones, domaine: pre.domaine || "" });
    if (this.d.meubles?.[i] !== m) return;
    if (e) return this.commit(() => { m.entite = e; });
    this._aFaire = { cle: `meuble:${i}`, champs: new Set(["entite"]) };
    this._panneau();
    this.snack(_t("À compléter dans le panneau : {l}.", { l: _t("Entité") }));
  }
  // entités d'une liste situées dans l'une des pièces HA données : `ici`, en tête
  _marquerIci(l, zones) {
    const hass = this.hass, zoneDe = (e) => { const r = hass.entities?.[e]; return r?.area_id || hass.devices?.[r?.device_id]?.area_id || null; };
    for (const c of l) c.ici = zones.includes(zoneDe(c.e));
    return l.sort((x, y) => y.ici - x.ici);
  }
  // suggestions discrètes sur une ouverture tracée : capteur libre de la même pièce, type d'après la classe du contact
  _suggestionsOuverture(o, i) {
    const hass = this.hass, out = [], ign = (this._suggIgn ||= new Set());
    if (!o || !Array.isArray(o.seg) || !hass) return out;
    const zones = this._zonesDuSeg(o.seg), exclure = this._utilisees(), nomZone = zones[0] && (hass.areas?.[zones[0]]?.name || zones[0]);
    const TXT = { contact: [_tk("Contact libre : « {nom} »"), _tk("{n} contacts libres dans « {piece} »")], volet: [_tk("Volet libre : « {nom} »"), _tk("{n} volets libres dans « {piece} »")],
      entite: [_tk("Motorisation libre : « {nom} »"), _tk("{n} motorisations libres dans « {piece} »")] };
    const champs = o.type === "portail" ? ["entite"] : o.volet_seul ? ["volet"] : ["contact", "volet"];
    if (zones.length) for (const ch of champs) {
      if (o[ch] || ign.has(`${i}:${ch}`)) continue;
      const ici = this._candidatsOuverture(ch, o, zones, exclure).filter((c) => c.ici);
      if (ici.length === 1) out.push({ k: `${i}:${ch}`, ic: iconeEntite(hass, ici[0].e), txt: _t(TXT[ch][0], { nom: esc(ici[0].nom) }), act: `sugg:${ch}:${ici[0].e}`, bouton: _t("Relier") });
      else if (ici.length > 1) out.push({ k: `${i}:${ch}`, ic: iconeEntite(hass, ici[0].e), txt: _t(TXT[ch][1], { n: ici.length, piece: esc(nomZone) }), act: `sugg-choisir:${ch}`, bouton: _t("Choisir") });
    }
    const t = TYPE_DC_OUV[hass.states[o.contact]?.attributes.device_class];
    if (t && t !== o.type && !(o.type === "portail" && t === "porte") && !ign.has(`${i}:type`))
      out.push({ k: `${i}:type`, ic: t === "fenetre" ? "mdi:window-closed-variant" : t === "portail" ? "mdi:garage-variant" : "mdi:door", txt: _t("Type d'après le contact : {type}", { type: esc(_t(NOMS_TYPE_OUV[t])) }), act: `sugg-type:${t}`, bouton: _t("Appliquer") });
    return out;
  }
  _htmlSuggestions(l) {
    return l.length ? `<div class="ed-suggs">${l.map((x) => `<div class="ed-sugg"><ha-icon icon="${esc(x.ic)}"></ha-icon><span>${x.txt}</span>
      <button type="button" class="ed-btn texte" data-act="${esc(x.act)}">${esc(x.bouton)}</button>${ibAct(`sugg-ign:${x.k}`, "mdi:close", _t("Ignorer"))}</div>`).join("")}</div>` : "";
  }
  // actions des suggestions et des réglages de dessin d'une ouverture sélectionnée
  async _actionOuvertureSel(a) {
    const s = this.sel, o = this._objet();
    if (s?.type !== "ouverture" || !o) return;
    const [op, ch, ...r] = a.split(":");
    if (op === "sugg") { const e = r.join(":"); return this.commit(() => { o[ch] = e; }); }
    if (op === "sugg-type") return this._modif("type", ch);
    if (op === "sugg-ign") { this._suggIgn.add(`${ch}:${r.join(":")}`); return this._panneau(); }
    if (op === "sugg-choisir") {
      const zones = this._zonesDuSeg(o.seg), liste = this._candidatsOuverture(ch, o, zones);
      const e = await this.choisirParmi({ titre: `${o.nom || _t(NOMS_TYPE_OUV[o.type] || _tk("Ouverture"))} · ${_t(A_COMPLETER[ch])}`, liste: liste.slice(0, 30), ctx: { zone: zones[0] }, domaine: CRIT_OUV[ch].d });
      if (e && this._objet() === o) this.commit(() => { o[ch] = e; });
      return;
    }
    if (op === "atelier-ouv") return this.modifierOuverture(s.i);
  }

  // ---------- « Créer une ouverture » : l'atelier avec les préréglages (type, battants, capteurs, aperçu sur un mur) ----------
  _typesOuverture() {
    return CATALOGUE.plan.map((m, i) => [m, i]).filter(([m]) => m.genre === "ouverture").map(([m, i]) => ({ id: `p${i}`, nom: m.nom, icone: m.icone, desc: m.desc,
      chercher: m.chercher, pref: m.pref, objet: { ...clone(m.objet), ...(m.aCompleter?.length ? { _avec: Object.fromEntries(m.aCompleter.map((c) => [c, true])) } : {}) } }));
  }
  // objet prêt à poser (clés internes `_avec` retirées) et capteurs voulus
  _sortirOuverture(o) {
    const objet = clone(o), avec = ["contact", "volet", "entite"].filter((c) => objet._avec?.[c] || objet[c]);
    delete objet._avec;
    for (const k of Object.keys(objet)) if (objet[k] === "" || objet[k] == null) delete objet[k];
    if (!OUVRANTS_ED.some(([v]) => v && v === objet.ouvrant)) { delete objet.ouvrant; delete objet.vers_dehors; }
    if (objet.ouvrant === "coulissant") delete objet.vers_dehors;
    if (+objet.battants !== 2) delete objet.battants;
    return { objet, avec };
  }
  _specOuverture(extra) {
    return {
      reglages: (o) => this._reglagesOuverture(o), apercu: (o) => this._apercuOuverture(o),
      ecrire: (o, k, v) => { if (k.startsWith("_avec.") && !v) delete o[k.slice(6)]; return false; },
      action: (a, o) => {
        const [k, v] = a.split(":");
        if (k === "type") o.type = v;
        if (k === "battants") { if (v === "2") o.battants = 2; else delete o.battants; }
      },
      ...extra,
    };
  }
  creerOuverture(opt = {}) {
    const types = this._typesOuverture();
    this.ouvrirAtelier(this._specOuverture({
      titre: _t("Créer une ouverture"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      valider: ({ o, type, modele, demander }) => {
        opt.apres?.();
        const t = types.find((x) => x.id === type), { objet, avec } = this._sortirOuverture(o), nom = objet.nom || t?.nom || _t("Ouverture");
        if (modele) {
          // modèle : capteurs voulus = demandés à chaque pose (cherchés dans la pièce) ; décoché, les entités choisies restent fixes
          const m = clone(objet), dem = demander ? avec : avec.filter((c) => !objet[c]);
          if (demander) for (const c of dem) delete m[c];
          this.commit(() => (this.d.modeles ||= []).push({ id: idModele(), nom, genre: "ouverture", icone: t?.icone || "mdi:window-closed-variant", desc: t?.nom || _t("Ouverture"), objet: m, ...(dem.length ? { demander: dem } : {}) }));
        }
        this.choisirOutil("ouverture", true);
        this.modeleOuverture = objet; this.aCompleter = avec.filter((c) => !objet[c]); this.chercherOuv = t?.chercher || null; this.prefOuv = t?.pref || null;
        this.snack(_t("« {nom} » : clique les deux extrémités sur un mur.", { nom }));
      },
    }));
  }
  // ouverture déjà tracée : préréglage, type, battants et capteurs changés sans la redessiner (position, fiche et le reste gardés)
  modifierOuverture(i) {
    const cur = this.d.ouvertures?.[i];
    if (!cur) return;
    const types = this._typesOuverture(), PROPRES = ["type", "battants", "ouvrant", "vers_dehors", "volet_seul"];
    this.ouvrirAtelier(this._specOuverture({
      titre: _t("Modifier l'ouverture"), types, initial: { ...clone(cur), _avec: Object.fromEntries(["contact", "volet", "entite"].filter((c) => cur[c]).map((c) => [c, true])) },
      libelleOk: _t("Appliquer"), retour: this.panneau?.querySelector("[data-act=atelier-ouv]"),
      // autre préréglage : son type, ses battants et ses capteurs ; les entités déjà reliées restent
      fusion: (t, o) => { const n = { ...o }; for (const k of PROPRES) delete n[k]; Object.assign(n, clone(t.objet)); n._avec = { ...(o._avec || {}), ...(t.objet._avec || {}) }; return n; },
      valider: async ({ o, type }) => {
        const t = types.find((x) => x.id === type), { objet, avec } = this._sortirOuverture(o);
        const r = await this._preRemplirOuverture(objet, { champs: avec.filter((c) => !objet[c]), chercher: t?.chercher || [], pref: t?.pref });
        if (this.d.ouvertures?.[i] !== cur) return;
        if (r.manquants.size) this._aFaire = { cle: `ouverture:${i}`, champs: r.manquants };
        this.commit(() => { for (const k of [...PROPRES, "contact", "volet", "entite", "nom", "animation"]) delete cur[k]; Object.assign(cur, objet); this.sel = { type: "ouverture", i }; });
        this.snack(r.manquants.size ? _t("À compléter dans le panneau : {l}.", { l: [...r.manquants].map((x) => _t(A_COMPLETER[x])).join(", ") }) : _t("Ouverture modifiée."));
      },
    }));
  }
  _reglagesOuverture(o) {
    const af = this._aFaire; this._aFaire = null; // l'atelier n'est pas l'élément sélectionné : rien n'y est « à compléter »
    try { return this._reglagesOuv(o); } finally { this._aFaire = af; }
  }
  _reglagesOuv(o) {
    const seg = (k, l, v) => `<div class="ed-seg" role="radiogroup">${l.map(([x, n]) => `<button type="button" role="radio" aria-checked="${x === v}" class="${x === v ? "on" : ""}" data-at="${k}:${x}">${esc(n)}</button>`).join("")}</div>`;
    const avec = o._avec || {}, AN = this.carte.constructor.ANIMATIONS, anim = typeof o.animation === "string" ? o.animation : o.animation?.type || "";
    const capteur = (ch, label, dom) => `<label class="ed-inter"><span>${esc(label)}</span><input type="checkbox" data-k="_avec.${ch}" data-rendre ${avec[ch] || o[ch] ? "checked" : ""}></label>
      ${avec[ch] || o[ch] ? `<div class="ed-at-capteur">${this._champEntite("", ch, o[ch], true, dom)}</div>` : ""}`;
    return `${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Baie salon"))}
      <div class="ed-champ"><label>${_t("Type")}</label>${seg("type", [["fenetre", _t("Fenêtre")], ["porte", _t("Porte")], ["portail", _t("Portail")]], o.type)}</div>
      <div class="ed-ligne"><div class="ed-champ"><label>${_t("Vantaux")}</label>${seg("battants", [["1", "1"], ["2", "2"]], +o.battants === 2 ? "2" : "1")}</div>
        <div class="ed-champ"><label>${_t("Ouverture##battants")}</label><select data-k="ouvrant" data-rendre>${OUVRANTS_ED.map(([v, n]) => `<option value="${esc(v)}" ${(o.ouvrant || "") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div></div>
      ${o.ouvrant === "gauche" || o.ouvrant === "droite" ? this._inter(_t("Ouvre vers l'extérieur"), "vers_dehors", o.vers_dehors) : ""}
      <h4 class="ed-at-titre">${_t("Capteurs")}${bulleI(_t("Laissés vides, ils sont cherchés dans la pièce à la pose."))}</h4>
      ${capteur("contact", _t("Contact (ouvert / fermé)"), "binary_sensor")}${o.type === "portail" ? "" : capteur("volet", _t("Volet"), "cover")}${capteur("entite", _t("Motorisation (cover)"), "cover")}
      <div class="ed-champ"><label>${_t("Animation (ouverte)")}</label><select data-k="animation"><option value="">${_t("Celle du plan")}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${anim === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>`;
  }
  // aperçu : un morceau de mur, l'ouverture à sa largeur habituelle, l'extérieur en haut
  _apercuOuverture(o) {
    const avec = o._avec || {}, L = o.ouvrant === "coulissant" ? 240 : o.type === "portail" ? (+o.battants === 2 ? 320 : 260) : o.type === "porte" ? (+o.battants === 2 ? 140 : 90) : (+o.battants === 2 ? 140 : 100);
    const x = { ...o, seg: [-L / 2, 0, L / 2, 0], dehors: [0, -1] };
    if (avec.contact) x.contact ||= "binary_sensor.apercu";
    if (avec.entite) x.entite ||= "cover.apercu";
    const capteur = !!(x.contact || x.entite), { baie, traits } = this.carte.constructor.traitsOuverture(x), W = Math.max(400, L + 120);
    const volet = avec.volet || o.volet ? `<path class="volet" d="M${-L / 2} -16L${L / 2} -16"/>` : "";
    return `<svg class="ed-ap-ouv" viewBox="${-W / 2} -120 ${W} 240" role="img" aria-label="${esc(_t("Aperçu"))}">
      <rect class="ed-ap-int" x="${-W / 2}" y="0" width="${W}" height="120"/>
      <text x="${-W / 2 + 12}" y="-96">${esc(_t("Extérieur"))}</text><text x="${-W / 2 + 12}" y="108">${esc(_t("Intérieur"))}</text>
      <path class="murs" d="M${-W / 2} 0H${W / 2}"/>
      <g class="ouv ${esc(o.type || "fenetre")}${capteur ? "" : " sans"}">${baie}${traits}${volet}</g>
      <path class="ed-ap-cote" d="M${-L / 2} -58V-46M${L / 2} -58V-46M${-L / 2} -52H${L / 2}"/><text class="ed-ap-cote-t" x="0" y="-62">${fmt(L / 100, 2)} m</text></svg>`;
  }

  // ---------- « Créer un meuble » : forme composée de primitives, taille, couleur, catégorie, connecté ----------
  // primitives d'un meuble du catalogue (« partir d'un meuble ») : son dessin SVG relu (rectangles, cercles, ellipses, traits,
  // courbes approchées par des points), coordonnées ramenées en % de sa taille
  _formeDepuisCatalogue(type) {
    const def = MEUBLES()[type];
    if (!def) return null;
    const [w, h] = def.taille, svg = this.carte.constructor.dessinMeuble({ type, pos: [0, 0], taille: def.taille, chaises: def.chaises });
    const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, "image/svg+xml"), out = [];
    const P = (x, y) => [arr(((x + w / 2) / w) * 100), arr(((y + h / 2) / h) * 100)];
    const style = (el) => (el.classList.contains("tirets") ? "tirets" : el.classList.contains("vide") || el.classList.contains("ligne") ? "vide" : null);
    const mat = (el) => { let m = new DOMMatrix(); for (let n = el.parentNode; n && n.nodeType === 1 && !n.classList?.contains("meuble"); n = n.parentNode) { const t = n.transform?.baseVal?.consolidate?.(); if (t) m = DOMMatrix.fromMatrix(t.matrix).multiply(m); } return m; };
    const pt = (m, x, y) => { const q = m.transformPoint(new DOMPoint(x, y)); return P(q.x, q.y); };
    const poser = (p, el) => { const st = style(el); if (st && p.genre !== "trait") p.style = st; if (p.genre === "trait" && el.classList.contains("tirets")) p.style = "tirets"; out.push(p); };
    for (const el of doc.querySelectorAll("rect,circle,ellipse,path")) {
      const m = mat(el), n = (k) => +el.getAttribute(k) || 0, tourne = Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6;
      if (el.tagName === "rect" && !tourne) {
        const [x0, y0] = pt(m, n("x"), n("y")), [x1, y1] = pt(m, n("x") + n("width"), n("y") + n("height")), r = n("rx");
        poser({ genre: r > 2 ? "arrondi" : "rect", x: Math.min(x0, x1), y: Math.min(y0, y1), l: arr(Math.abs(x1 - x0)), h: arr(Math.abs(y1 - y0)), ...(r > 2 ? { rayon: r } : {}) }, el);
      } else if (el.tagName === "rect") {
        const x = n("x"), y = n("y"), W = n("width"), H = n("height");
        poser({ genre: "polygone", points: [[x, y], [x + W, y], [x + W, y + H], [x, y + H]].map(([a, b]) => pt(m, a, b)) }, el);
      } else if (el.tagName === "circle" || el.tagName === "ellipse") {
        const cx = n("cx"), cy = n("cy"), rx = el.tagName === "circle" ? n("r") : n("rx"), ry = el.tagName === "circle" ? n("r") : n("ry"), [x0, y0] = pt(m, cx - rx, cy - ry), [x1, y1] = pt(m, cx + rx, cy + ry);
        poser({ genre: "ellipse", x: Math.min(x0, x1), y: Math.min(y0, y1), l: arr(Math.abs(x1 - x0)), h: arr(Math.abs(y1 - y0)) }, el);
      } else {
        // chemin : M, L, H, V, Q (courbe approchée), Z ; un Z ferme en polygone, sinon trait (un par sous-chemin)
        const jet = (el.getAttribute("d") || "").match(/[MLHVQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
        let i = 0, sous = [], x = 0, y = 0, cmd = "M";
        const fin = (ferme) => { if (sous.length >= (ferme ? 3 : 2)) poser({ genre: ferme ? "polygone" : "trait", points: sous.map(([a, b]) => pt(m, a, b)) }, el); sous = []; };
        while (i < jet.length) {
          if (/^[MLHVQZ]$/i.test(jet[i])) { cmd = jet[i++].toUpperCase(); if (cmd === "Z") { fin(true); continue; } }
          const v = () => +jet[i++];
          if (cmd === "M") { if (sous.length) fin(false); x = v(); y = v(); sous.push([x, y]); cmd = "L"; }
          else if (cmd === "L") { x = v(); y = v(); sous.push([x, y]); }
          else if (cmd === "H") { x = v(); sous.push([x, y]); }
          else if (cmd === "V") { y = v(); sous.push([x, y]); }
          else if (cmd === "Q") { const qx = v(), qy = v(), ex = v(), ey = v(); for (const k of [0.25, 0.5, 0.75, 1]) sous.push([(1 - k) ** 2 * x + 2 * (1 - k) * k * qx + k * k * ex, (1 - k) ** 2 * y + 2 * (1 - k) * k * qy + k * k * ey]); x = ex; y = ey; }
          else i++;
        }
        if (sous.length) fin(false);
      }
    }
    return { taille: [w, h], forme: this.carte.constructor.normaliserForme(out) };
  }
  _typesMeuble() {
    const C = this.carte.constructor, ML = MEUBLES(), mini = (o) => `<svg class="ed-apercu" viewBox="${-Math.max(...o.taille) * 0.62 - 20} ${-Math.max(...o.taille) * 0.62 - 20} ${Math.max(...o.taille) * 1.24 + 40} ${Math.max(...o.taille) * 1.24 + 40}" aria-hidden="true">${C.dessinMeuble({ type: "forme", pos: [0, 0], ...o })}</svg>`;
    const base = FORMES_DEPART().map((f) => ({ id: f.id, nom: f.nom, groupe: _t("Formes de base"), svg: mini(f), objet: { type: "forme", taille: f.taille, forme: clone(f.forme) } }));
    const cat = Object.entries(ML).filter(([t]) => t !== "espace").map(([t, x]) => ({ id: `m:${t}`, nom: _t(x.nom), desc: `${x.taille[0]} × ${x.taille[1]} cm`, groupe: _t("Partir d'un meuble du catalogue"),
      svg: `<svg class="ed-apercu" viewBox="${-Math.max(...x.taille) * 0.62 - 20} ${-Math.max(...x.taille) * 0.62 - 20} ${Math.max(...x.taille) * 1.24 + 40} ${Math.max(...x.taille) * 1.24 + 40}" aria-hidden="true">${C.dessinMeuble({ type: t, pos: [0, 0], taille: x.taille, chaises: x.chaises })}</svg>`,
      catalogue: t }));
    return [...base, ...cat];
  }
  // catégorie proposée pour un meuble du catalogue (sa catégorie), sinon « Formes et espaces »
  _catMeuble(type) { const C = this.carte.constructor, c = MEUBLES()[type]?.cat; return Object.entries(C.CATS_MEUBLES).find(([, n]) => n === c)?.[0] || "formes"; }
  _specMeuble(extra) {
    const borner = (v) => Math.max(5, Math.min(MAX_TAILLE_MEUBLE, Math.round(+v) || 60)), M = this._manipFormes();
    return {
      reglages: (o) => this._reglagesMeuble(o), apercu: (o) => this._apercuMeuble(o),
      // aperçu manipulable : sélection, glisser, poignées, sommets, aimantation, clavier, historique propre à l'atelier
      classe: "ed-at-mb", apercuTete: () => M.tete(), apercuPied: () => M.pied(), monter: (v, api) => M.monter(v, api), apresRendu: (v) => M.apresRendu(v), touche: (ev) => M.touche(ev),
      // un meuble du catalogue devient une forme (ses primitives) avec son nom et sa catégorie
      fusion: (t, o) => {
        if (t.catalogue) { const f = this._formeDepuisCatalogue(t.catalogue); return { ...(o?.entite ? { entite: o.entite } : {}), type: "forme", nom: t.nom, taille: f.taille, forme: f.forme, _cat: this._catMeuble(t.catalogue) }; }
        return { ...(o?.entite ? { entite: o.entite } : {}), ...clone(t.objet), _cat: o?._cat || "formes" };
      },
      // champs en cm (taille, primitives) : convertis en % de la taille ; points d'un trait ou d'un polygone « x,y x,y … »
      ecrire: (o, k, v) => {
        const [w, h] = o.taille, m = /^_p\.(\d+)\.(x|y|l|h|rayon|pts)$/.exec(k), g = /^forme\.(\d+)\.genre$/.exec(k);
        if (/^taille\.[01]$/.test(k)) { o.taille[+k.slice(-1)] = borner(v); return true; }
        if (g) { const p = o.forme[+g[1]]; if (p && PRIMITIVES[v]) M.changerGenre(p, v); return true; }
        if (!m) return false;
        const p = o.forme[+m[1]];
        if (!p) return true;
        if (m[2] === "rayon") p.rayon = Math.max(0, Math.min(500, +v || 0));
        else if (m[2] === "pts") {
          const l = String(v).split(/[\s;]+/).map((x) => x.split(",").map(Number)).filter((q) => q.length === 2 && q.every(Number.isFinite));
          if (l.length >= (p.genre === "trait" ? 2 : 3)) p.points = l.slice(0, 24).map(([x, y]) => [pc((x / w) * 100), pc((y / h) * 100)]);
        } else p[m[2]] = pc((+v || 0) / (m[2] === "x" || m[2] === "l" ? w : h) * 100);
        return true;
      },
      action: (a, o) => {
        const [k, v] = a.split(":");
        if (k === "couleur") { if (v) o.couleur = v; else delete o.couleur; }
        if (k === "prim" && PRIM_DEFAUT[v] && o.forme.length < 40) o.forme.push(clone(PRIM_DEFAUT[v]));
        if (k === "retirer-prim") o.forme.splice(+v, 1);
        if (k === "monter-prim" && +v > 0) [o.forme[+v - 1], o.forme[+v]] = [o.forme[+v], o.forme[+v - 1]];
        return M.action(k, v, o); // sélection suivie (ajout, retrait, ordre), sommet retiré, aimant, agrandir ; historique
      },
      apresEntite: (o) => { o._connecte = true; },
      ...extra,
    };
  }
  // objet de meuble prêt à poser : couleur validée, forme bornée, clés internes retirées ; rend aussi la catégorie et les mots
  _sortirMeuble(o) {
    const C = this.carte.constructor, m = clone(o), cat = m._cat, mots = (m._mots || "").trim();
    for (const k of ["_cat", "_mots", "_connecte"]) delete m[k];
    if (!o._connecte) for (const k of ["entite", "valeur", "actif", "fiche"]) delete m[k];
    if (m.couleur && !C.couleurSure(m.couleur)) delete m.couleur;
    m.forme = C.normaliserForme(m.forme);
    m.taille = m.taille.map((v) => Math.max(5, Math.min(MAX_TAILLE_MEUBLE, Math.round(+v) || 60)));
    for (const k of Object.keys(m)) if (m[k] === "" || m[k] == null) delete m[k];
    return { m, cat, mots };
  }
  creerMeuble(opt = {}) {
    const types = this._typesMeuble();
    this.ouvrirAtelier(this._specMeuble({
      titre: _t("Créer un meuble"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      valider: ({ o, modele, demander }) => {
        opt.apres?.();
        const { m, cat, mots } = this._sortirMeuble(o);
        if (o.couleur && !m.couleur) this.snack(_t("Couleur ignorée : #rrggbb ou un nom de couleur."));
        if (modele) this.commit(() => (this.d.modeles ||= []).push(this._modeleMeuble(m, cat, mots, demander)));
        this.utiliserModele({ genre: "meuble", type: "forme", nom: m.nom || _t("Meuble"), objet: m }, null);
      },
    }));
  }
  _modeleMeuble(m, cat, mots, demander) {
    const objet = clone(m), dem = demander && objet.entite ? ["entite"] : [], domaine = objet.entite?.split(".")[0];
    if (dem.length) delete objet.entite;
    return { id: idModele(), nom: m.nom || _t("Meuble"), genre: "meuble", type: "forme", desc: `${m.taille[0]} × ${m.taille[1]} cm`, ...(cat ? { cat } : {}), ...(mots ? { mots } : {}),
      ...(dem.length ? { demander: dem, ...(domaine ? { domaine } : {}) } : {}), objet };
  }
  // meuble personnalisé posé (i : numéro du meuble) ou modèle de « Mes modèles » (u : numéro du modèle) : rouvert dans l'atelier
  modifierMeuble({ i = null, u = null, retour = null, dessous = null, apres = null } = {}) {
    const mod = u != null ? this.d.modeles?.[u] : null, cur = i != null ? this.d.meubles?.[i] : mod?.objet;
    if (!cur) return;
    const def = MEUBLES()[cur.type], depart = cur.type === "forme" ? clone(cur) : { ...clone(cur), type: "forme", ...this._formeDepuisCatalogue(cur.type), nom: cur.nom || (def ? _t(def.nom) : "") };
    depart.taille ||= [60, 60]; depart.forme ||= [clone(PRIM_DEFAUT.rect)];
    this.ouvrirAtelier(this._specMeuble({
      titre: mod ? _t("Modifier le modèle") : _t("Modifier le meuble"), types: this._typesMeuble(), libelleOk: _t("Appliquer"), retour, dessous,
      initial: { ...depart, _cat: mod?.cat || (cur.type === "forme" ? "formes" : this._catMeuble(cur.type)), _mots: mod?.mots || "", _connecte: !!(cur.entite || cur.valeur || cur.fiche || mod?.demander?.length) },
      valider: ({ o }) => {
        apres?.();
        const { m, cat, mots } = this._sortirMeuble(o);
        if (mod) {
          // modèle : l'entité reste « à demander » s'il l'était ; décoché « Connecté », plus rien à demander
          const objet = clone(m);
          if (!o._connecte) { delete mod.demander; delete mod.domaine; } else if (mod.demander?.includes("entite")) delete objet.entite;
          this.commit(() => { Object.assign(mod, { nom: m.nom || mod.nom, type: "forme", desc: `${m.taille[0]} × ${m.taille[1]} cm`, objet }); if (cat) mod.cat = cat; else delete mod.cat; if (mots) mod.mots = mots; else delete mod.mots; });
          return this.snack(_t("Modèle modifié."));
        }
        // meuble posé : remplacé par sa nouvelle définition (position, angle, calque et fiche gardés)
        delete m.chaises;
        this.commit(() => { this.d.meubles[i] = m; this.sel = { type: "meuble", i }; });
        this.snack(_t("Meuble modifié."));
      },
    }));
  }
  _reglagesMeuble(o) {
    const af = this._aFaire; this._aFaire = null;
    try { return this._reglagesMb(o); } finally { this._aFaire = af; }
  }
  _reglagesMb(o) {
    const C = this.carte.constructor, [w, h] = o.taille, cm = (v, t) => arr((v * t) / 100);
    const N = (label, k, v, pas = 1) => `<div class="ed-champ"><label>${esc(label)}</label><input type="number" step="${pas}" data-k="${k}" data-num="1" value="${esc(v ?? "")}"${k.startsWith("taille") ? ` min="5" max="${MAX_TAILLE_MEUBLE}" data-rendre` : ""}></div>`;
    const prim = (p, j) => `<div class="ed-prim" data-prim="${j}"><div class="ed-prim-tete"><ha-icon icon="${{ rect: "mdi:rectangle-outline", arrondi: "mdi:rectangle-outline", ellipse: "mdi:circle-outline", trait: "mdi:vector-line", polygone: "mdi:vector-polygon" }[p.genre]}"></ha-icon>
        <select data-k="forme.${j}.genre" data-rendre aria-label="${_t("Primitive")}">${Object.entries(PRIMITIVES).map(([g, n]) => `<option value="${esc(g)}" ${p.genre === g ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        <select data-k="forme.${j}.style" aria-label="${_t("Style")}">${STYLES_PRIM.map(([v, n]) => `<option value="${esc(v === "plein" ? "" : v)}" ${(p.style || "plein") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        ${p.genre === "polygone" ? `<button type="button" class="ib" data-at="retirer-som:${j}" disabled title="${_t("Retirer le sommet choisi")}" aria-label="${_t("Retirer le sommet choisi")}"><ha-icon icon="mdi:vector-polyline-minus"></ha-icon></button>` : ""}
        ${j ? `<button type="button" class="ib" data-at="monter-prim:${j}" title="${_t("Monter")}" aria-label="${_t("Monter")}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>` : ""}<button type="button" class="ib" data-at="retirer-prim:${j}" title="${_t("Retirer")}" aria-label="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${p.points ? `<div class="ed-champ"><label>${_t("Points (x,y en cm)")}</label><input type="text" data-k="_p.${j}.pts" value="${esc(p.points.map(([x, y]) => `${cm(x, w)},${cm(y, h)}`).join(" "))}"></div>`
        : `<div class="ed-ligne quatre">${N("x", `_p.${j}.x`, cm(p.x, w))}${N("y", `_p.${j}.y`, cm(p.y, h))}${N(_t("Larg."), `_p.${j}.l`, cm(p.l, w))}${N(_t("Prof."), `_p.${j}.h`, cm(p.h, h))}</div>${p.genre === "arrondi" ? N(_t("Rayon (cm)"), `_p.${j}.rayon`, p.rayon ?? 8) : ""}`}</div>`;
    const coul = (o.couleur || "").toLowerCase();
    return `${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Banc"))}
      <div class="ed-ligne">${N(_t("Largeur (cm)"), "taille.0", w)}${N(_t("Profondeur (cm)"), "taille.1", h)}</div>
      <div class="ed-ligne"><div class="ed-champ"><label>${_t("Catégorie")}</label><select data-k="_cat">${Object.entries(C.CATS_MEUBLES).map(([k, n]) => `<option value="${esc(k)}" ${o._cat === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>
        ${this._champTexte(_t("Mots de recherche"), "_mots", o._mots, _t("ex. banc assise"))}</div>
      <div class="ed-champ"><label>${_t("Couleur")}</label><div class="ed-couleurs"><button type="button" data-at="couleur:" class="${coul ? "" : "on"} aucune" title="${_t("Aucune")}" aria-label="${_t("Aucune")}"></button>${COULEURS.map(([n, c]) => `<button type="button" data-at="couleur:${c}" title="${_t(n)}" aria-label="${_t(n)}" class="${coul === c ? "on" : ""}" style="background:${c}"></button>`).join("")}</div></div>
      <h4 class="ed-at-titre">${_t("Forme")}${bulleI(`${_t("Primitives dessinées dans l'ordre, la dernière au-dessus ; positions depuis le coin haut gauche, en cm.")} ${tactile() ? _t("Dans l'aperçu : glisser pour déplacer, poignées pour redimensionner, appui long sur un sommet pour le retirer.") : _t("Dans l'aperçu : glisser pour déplacer, poignées pour redimensionner (Maj : proportions, Alt : sans aimant), flèches 1 cm (Maj : 10 cm), Suppr pour retirer.")}`)}</h4>
      ${o.forme.map(prim).join("")}
      <div class="ed-prim-ajout">${Object.entries(PRIMITIVES).map(([g, n]) => `<button type="button" class="ed-btn contour" data-at="prim:${g}"><ha-icon icon="mdi:plus"></ha-icon>${esc(_t(n))}</button>`).join("")}</div>
      <label class="ed-inter"><span>${_t("Connecté")}${bulleI(_t("Relié à une entité : teinté quand il est actif, fiche au toucher."))}</span><input type="checkbox" data-k="_connecte" data-rendre ${o._connecte ? "checked" : ""}></label>
      ${o._connecte ? this._champEntite(_t("Entité"), "entite", o.entite, true) : ""}`;
  }
  // aperçu à l'échelle : le meuble, une règle (50 cm ou 1 m) et ses dimensions
  _apercuMeuble(o) {
    // marge réduite : le meuble occupe l'essentiel de l'aperçu (manipulation), la règle et les cotes restent lisibles
    const C = this.carte.constructor, [w, h] = o.taille.map((v) => Math.max(5, Math.min(MAX_TAILLE_MEUBLE, +v || 60))), c = Math.max(w, h) * 0.56 + 26;
    const regle = Math.max(w, h) > 150 ? 100 : 50, y = c - 14, x0 = -c + 10;
    const coul = C.couleurSure(o.couleur) ? o.couleur : null;
    return `<svg class="ed-ap-meuble" viewBox="${-c} ${-c} ${2 * c} ${2 * c}" tabindex="0" data-foc="ap" role="application" aria-label="${esc(_t("Aperçu des formes : glisser pour déplacer, flèches 1 cm, Suppr pour retirer"))}">
      ${C.dessinMeuble({ type: "forme", pos: [0, 0], taille: [w, h], forme: o.forme, couleur: coul })}
      <path class="ed-ap-cote" d="M${x0} ${y - 5}V${y + 5}M${x0 + regle} ${y - 5}V${y + 5}M${x0} ${y}H${x0 + regle}"/>
      <text class="ed-ap-cote-t" x="${x0 + regle + 6}" y="${y + 4}" style="font-size:${(c / 12).toFixed(1)}px">${regle === 100 ? "1 m" : "50 cm"}</text>
      <text class="ed-ap-cote-t" x="0" y="${-c + c / 9}" text-anchor="middle" style="font-size:${(c / 12).toFixed(1)}px">${fmt(w, 0)} × ${fmt(h, 0)} cm</text></svg>`;
  }

  // ---------- atelier des meubles : manipulation directe des formes dans l'aperçu ----------
  // Clic ou toucher sur une forme : sélection (cadre, poignées, sa ligne surlignée dans la liste ; l'inverse aussi) ; dans le vide :
  // désélection. Glisser : déplacer ; 8 poignées : redimensionner (Maj : proportions) ; trait et polygone : sommets glissés, « + » au
  // milieu d'une arête = nouveau sommet, appui long, Suppr ou bouton de la ligne = sommet retiré (3 au moins pour un polygone).
  // Aimantation : grille de 5 cm, bords et centres du meuble et des autres formes (guides affichés), coupée par Alt ou le bouton ;
  // les formes restent dans le cadre du meuble. Clavier : flèches 1 cm (Maj : 10 cm), Suppr, Échap ; Ctrl+Z / Ctrl+Y : historique
  // propre à l'atelier (celui de l'éditeur n'est pas touché). Stockage inchangé (en % de la taille) ; les champs en cm suivent.
  _manipFormes() {
    const ed = this, GRILLE = 5, SEUIL = 8, MIN = 1; // cm, px (aimant), cm (plus petite forme)
    const M = { sel: null, som: null, aimant: true, grand: false, hist: [], pos: -1, ref: null, g: null, guides: [], voile: null, api: null, raf: 0 };
    const o = () => M.api?.objet();
    const dims = (ob) => ob.taille.map((v) => Math.max(5, Math.min(MAX_TAILLE_MEUBLE, +v || 60)));
    const aPoints = (p) => p.genre === "trait" || p.genre === "polygone";
    const minPts = (p) => (p.genre === "trait" ? 2 : 3);
    const valide = (p) => !!p && (aPoints(p) ? Array.isArray(p.points) && p.points.length >= minPts(p) : [p.x, p.y, p.l, p.h].every((v) => v !== "" && Number.isFinite(+v)));
    // boîte d'une forme en cm (depuis le coin haut gauche du meuble)
    const boite = (p, w, h) => {
      if (aPoints(p)) { const xs = p.points.map((q) => (q[0] * w) / 100), ys = p.points.map((q) => (q[1] * h) / 100); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; }
      return { x0: (p.x * w) / 100, y0: (p.y * h) / 100, x1: ((+p.x + +p.l) * w) / 100, y1: ((+p.y + +p.h) * h) / 100 };
    };
    const borne = (v, a, b) => Math.max(a, Math.min(b, v));
    // repères d'aimantation sur un axe (0 : x, 1 : y) : bords et centre du meuble, des autres formes (et leurs sommets), des autres
    // sommets de la forme
    const reperes = (axe, j, w, h, i = null) => {
      const L = axe ? h : w, t = [0, L / 2, L], ob = o();
      ob.forme.forEach((q, n) => {
        if (n === j || !valide(q)) return;
        const b = boite(q, w, h), a0 = axe ? b.y0 : b.x0, a1 = axe ? b.y1 : b.x1;
        t.push(a0, (a0 + a1) / 2, a1);
        if (aPoints(q)) for (const pt of q.points) t.push((pt[axe] * L) / 100);
      });
      if (i != null) ob.forme[j].points.forEach((q, n) => { if (n !== i) t.push((q[axe] * L) / 100); });
      return t;
    };
    // décalage aimanté : le repère le plus proche sous le seuil, sinon la grille (sur la première valeur)
    const aimanter = (vals, rep, seuil) => {
      let best = null;
      for (const v of vals) for (const c of rep) { const d = c - v; if (Math.abs(d) <= seuil && (best === null || Math.abs(d) < Math.abs(best))) best = d; }
      return best ?? Math.round(vals[0] / GRILLE) * GRILLE - vals[0];
    };
    // guides : repères atteints après le déplacement
    const guides = (vals, rep, axe) => [...new Set(rep.filter((c) => vals.some((v) => Math.abs(v - c) < 0.05)).map((c) => +c.toFixed(2)))].map((v) => [axe, v]);
    // g : { mode: corps | poignee | sommet, j (forme), i (sommet), ph (poignée), p0 (forme au départ), b0 (sa boîte en cm), w, h (taille), k (cm par px) }
    const appliquer = (g, dx, dy, aim, prop) => {
      const p = o().forme[g.j];
      if (!p) return;
      const { w, h, b0, p0 } = g, seuil = SEUIL * g.k;
      M.guides = [];
      if (g.mode === "corps") {
        if (aim) {
          dx += aimanter([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), seuil);
          dy += aimanter([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), seuil);
        }
        dx = borne(dx, Math.min(0, -b0.x0), Math.max(0, w - b0.x1)); dy = borne(dy, Math.min(0, -b0.y0), Math.max(0, h - b0.y1));
        if (aPoints(p0)) p.points = p0.points.map(([a, b]) => [pc(a + (dx / w) * 100), pc(b + (dy / h) * 100)]);
        else { p.x = pc(+p0.x + (dx / w) * 100); p.y = pc(+p0.y + (dy / h) * 100); }
        if (aim) M.guides = [...guides([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), 0), ...guides([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), 1)];
      } else if (g.mode === "sommet") {
        const a = (p0.points[g.i][0] * w) / 100, b = (p0.points[g.i][1] * h) / 100;
        let x = a + dx, y = b + dy;
        if (aim) { x += aimanter([x], reperes(0, g.j, w, h, g.i), seuil); y += aimanter([y], reperes(1, g.j, w, h, g.i), seuil); }
        x = borne(x, Math.min(0, a), Math.max(w, a)); y = borne(y, Math.min(0, b), Math.max(h, b));
        p.points = p0.points.map((q) => [...q]); p.points[g.i] = [pc((x / w) * 100), pc((y / h) * 100)];
        if (aim) M.guides = [...guides([x], reperes(0, g.j, w, h, g.i), 0), ...guides([y], reperes(1, g.j, w, h, g.i), 1)];
      } else if (g.mode === "poignee") {
        const fx = g.ph.includes("w") ? "x0" : g.ph.includes("e") ? "x1" : null, fy = g.ph.includes("n") ? "y0" : g.ph.includes("s") ? "y1" : null;
        const lim = { x0: Math.min(0, b0.x0), x1: Math.max(w, b0.x1), y0: Math.min(0, b0.y0), y1: Math.max(h, b0.y1) };
        let b = { ...b0 };
        if (prop) {
          // proportions gardées : mise à l'échelle depuis le coin (ou le côté) opposé, bornée au cadre et à la taille minimale
          const W0 = b0.x1 - b0.x0 || 1, H0 = b0.y1 - b0.y0 || 1;
          const ax = fx === "x0" ? b0.x1 : fx === "x1" ? b0.x0 : (b0.x0 + b0.x1) / 2, ay = fy === "y0" ? b0.y1 : fy === "y1" ? b0.y0 : (b0.y0 + b0.y1) / 2;
          const sx = fx ? (W0 + (fx === "x1" ? dx : -dx)) / W0 : null, sy = fy ? (H0 + (fy === "y1" ? dy : -dy)) / H0 : null;
          let s = sx != null && sy != null ? (Math.abs(sx - 1) >= Math.abs(sy - 1) ? sx : sy) : sx ?? sy;
          s = Math.max(s, MIN / W0, MIN / H0);
          for (const [e0, a, lo, hi] of [[b0.x0, ax, lim.x0, lim.x1], [b0.x1, ax, lim.x0, lim.x1], [b0.y0, ay, lim.y0, lim.y1], [b0.y1, ay, lim.y0, lim.y1]]) {
            if (e0 > a + 1e-9) s = Math.min(s, (hi - a) / (e0 - a)); else if (e0 < a - 1e-9) s = Math.min(s, (a - lo) / (a - e0));
          }
          b = { x0: ax + s * (b0.x0 - ax), x1: ax + s * (b0.x1 - ax), y0: ay + s * (b0.y0 - ay), y1: ay + s * (b0.y1 - ay) };
        } else {
          for (const [f, d, axe] of [[fx, dx, 0], [fy, dy, 1]]) {
            if (!f) continue;
            const autre = { x0: "x1", x1: "x0", y0: "y1", y1: "y0" }[f];
            let v = b0[f] + d;
            if (aim) v += aimanter([v], reperes(axe, g.j, w, h), seuil);
            if (f.endsWith("0")) { const hi = b0[autre] - MIN; b[f] = borne(v, Math.min(lim[f], hi), hi); } else { const lo = b0[autre] + MIN; b[f] = borne(v, lo, Math.max(lim[f], lo)); }
            if (aim) M.guides.push(...guides([b[f]], reperes(axe, g.j, w, h), axe));
          }
        }
        p.x = pc((b.x0 / w) * 100); p.y = pc((b.y0 / h) * 100); p.l = pc(((b.x1 - b.x0) / w) * 100); p.h = pc(((b.y1 - b.y0) / h) * 100);
      }
    };
    const ajouterSommet = (j, a) => {
      const p = o().forme[j];
      if (!p?.points || p.points.length >= 24) return null;
      const n = p.points.length, q1 = p.points[a], q2 = p.points[(a + 1) % n];
      p.points.splice(a + 1, 0, [pc((q1[0] + q2[0]) / 2), pc((q1[1] + q2[1]) / 2)]);
      return a + 1;
    };
    const retirerSommet = (j, i) => {
      const p = o().forme[j];
      if (!p?.points || i == null || !p.points[i] || p.points.length <= minPts(p)) return false;
      p.points.splice(i, 1); M.som = null;
      return true;
    };
    // historique de l'atelier : un état par modification (glisser, touche, champ, bouton) ; nouvel objet (autre type) = historique neuf
    const noter = () => {
      const ob = o();
      if (!ob) return;
      const s = JSON.stringify(ob);
      if (M.ref !== ob) { M.ref = ob; M.hist = [s]; M.pos = 0; return; }
      if (M.hist[M.pos] === s) return;
      M.hist = M.hist.slice(0, M.pos + 1); M.hist.push(s);
      if (M.hist.length > 100) M.hist.shift();
      M.pos = M.hist.length - 1;
    };
    const foc = () => { const f = ed.R.activeElement; return f?.dataset?.foc ? `[data-foc="${f.dataset.foc}"]` : f?.dataset?.k ? `[data-k="${f.dataset.k}"]` : null; };
    const aller = (pas) => {
      noter();
      const n = M.pos + pas;
      if (n < 0 || n >= M.hist.length) return;
      const f = foc(), ob = JSON.parse(M.hist[n]);
      M.pos = n; M.ref = ob; M.som = null;
      if (M.sel != null && !valide(ob.forme?.[M.sel])) M.sel = null;
      M.api.remplacer(ob, f);
      if (!M.voile.contains(ed.R.activeElement)) M.voile.querySelector('[data-foc="ap"]')?.focus();
    };
    // ligne de la forme choisie surlignée (et montrée) ; bouton « Retirer le sommet » actif si un sommet est choisi
    const lignes = (voir) => {
      const v = M.voile, ob = o();
      if (!v || !ob) return;
      v.querySelectorAll(".ed-prim[data-prim]").forEach((r) => {
        const on = +r.dataset.prim === M.sel;
        r.classList.toggle("sel", on);
        if (on) { r.setAttribute("aria-current", "true"); if (voir) r.scrollIntoView({ block: "nearest" }); } else r.removeAttribute("aria-current");
      });
      v.querySelectorAll('[data-at^="retirer-som:"]').forEach((b) => { const j = +b.dataset.at.split(":")[1]; b.disabled = !(j === M.sel && M.som != null && ob.forme[j]?.points?.length > 3); });
    };
    // champs en cm de la forme j, mis à jour en direct (sauf celui où l'on écrit)
    const champs = (j) => {
      const ob = o(), p = ob?.forme[j], v = M.voile;
      if (!p || !v) return;
      const [w, h] = ob.taille, cm = (x, t) => arr((x * t) / 100);
      const mettre = (k, val) => { const i = v.querySelector(`.ed-at-form [data-k="${k}"]`); if (i && ed.R.activeElement !== i) i.value = val; };
      if (aPoints(p)) mettre(`_p.${j}.pts`, p.points.map(([x, y]) => `${cm(x, w)},${cm(y, h)}`).join(" "));
      else { mettre(`_p.${j}.x`, cm(p.x, w)); mettre(`_p.${j}.y`, cm(p.y, h)); mettre(`_p.${j}.l`, cm(p.l, w)); mettre(`_p.${j}.h`, cm(p.h, h)); }
    };
    const choisir = (j, voir = true) => { if (j === M.sel) return; M.sel = j; M.som = null; lignes(voir); };
    const redessiner = () => { cancelAnimationFrame(M.raf); M.raf = 0; M.api?.maj(); };
    const planifier = () => { if (!M.raf) M.raf = requestAnimationFrame(() => { M.raf = 0; M.api?.maj(); }); };
    const COINS = { nw: _tk("coin haut gauche"), n: _tk("bord haut"), ne: _tk("coin haut droit"), e: _tk("bord droit"), se: _tk("coin bas droit"), s: _tk("bord bas"), sw: _tk("coin bas gauche"), w: _tk("bord gauche") };
    const CURSEURS = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" };
    // calque de manipulation, dans le repère de l'aperçu (cm, centre du meuble en 0,0) ; tailles des poignées en px écran
    const dessinUI = (svg) => {
      const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM(), k = m?.a ? 1 / m.a : svg.viewBox.baseVal.width / 320;
      const X = (v) => +(v - w / 2).toFixed(2), Y = (v) => +(v - h / 2).toFixed(2), f = (v) => +v.toFixed(2);
      const geo = (p, extra) => {
        const b = boite(p, w, h);
        if (aPoints(p)) return `<path d="M${p.points.map(([x, y]) => `${X((x * w) / 100)} ${Y((y * h) / 100)}`).join("L")}${p.genre === "polygone" ? "Z" : ""}"${extra}/>`;
        if (p.genre === "ellipse") return `<ellipse cx="${X((b.x0 + b.x1) / 2)}" cy="${Y((b.y0 + b.y1) / 2)}" rx="${f(Math.abs(b.x1 - b.x0) / 2)}" ry="${f(Math.abs(b.y1 - b.y0) / 2)}"${extra}/>`;
        return `<rect x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(Math.max(0, b.x1 - b.x0))}" height="${f(Math.max(0, b.y1 - b.y0))}"${extra}/>`;
      };
      // cibles : toute la forme, ou son trait seulement (trait, contour) pour laisser atteindre les formes dessous ; 24 px au moins
      const cibles = ob.forme.map((p, j) => {
        if (!valide(p)) return "";
        const trait = p.genre === "trait" || p.style === "vide";
        return geo(p, ` class="cible" data-p="${j}" pointer-events="${trait ? "stroke" : "all"}" stroke-width="${f(24 * k)}"`);
      }).join("");
      const gd = M.guides.map(([axe, v]) => `<path class="guide" d="${axe ? `M${X(-8 * k)} ${Y(v)}H${X(w + 8 * k)}` : `M${X(v)} ${Y(-8 * k)}V${Y(h + 8 * k)}`}"/>`).join("");
      const poignee = (attrs, x, y, label, cl, curseur) => `<g class="${cl}" ${attrs} tabindex="0" role="button" aria-label="${esc(label)}" transform="translate(${X(x)} ${Y(y)})"${curseur ? ` style="cursor:${curseur}"` : ""}><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(6 * k)}"/></g>`;
      let sel = "";
      const p = M.sel != null ? ob.forme[M.sel] : null;
      if (valide(p)) {
        const b = boite(p, w, h), lw = (b.x1 - b.x0) / k, lh = (b.y1 - b.y0) / k;
        sel += `<rect class="cadre" x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(b.x1 - b.x0)}" height="${f(b.y1 - b.y0)}"/>`;
        if (!aPoints(p)) {
          const xm = (b.x0 + b.x1) / 2, ym = (b.y0 + b.y1) / 2;
          // poignées des côtés seulement si le côté laisse la place (sinon elles couvriraient la forme)
          sel += [["nw", b.x0, b.y0], ["n", xm, b.y0], ["ne", b.x1, b.y0], ["e", b.x1, ym], ["se", b.x1, b.y1], ["s", xm, b.y1], ["sw", b.x0, b.y1], ["w", b.x0, ym]]
            .filter(([id]) => id.length === 2 || (id === "n" || id === "s" ? lw >= 56 : lh >= 56))
            .map(([id, x, y]) => poignee(`data-h="${id}" data-foc="h-${id}"`, x, y, _t("Redimensionner : {c}", { c: _t(COINS[id]) }), "ed-ap-h", CURSEURS[id])).join("");
        } else {
          const n = p.points.length, P = p.points.map(([x, y]) => [(x * w) / 100, (y * h) / 100]);
          if (p.genre === "polygone" && n < 24) sel += P.map((q, i) => {
            const r = P[(i + 1) % n];
            return Math.hypot(r[0] - q[0], r[1] - q[1]) / k < 56 ? "" : `<g class="ed-ap-plus" data-plus="${i}" data-foc="p-${i}" tabindex="0" role="button" aria-label="${esc(_t("Ajouter un sommet"))}" transform="translate(${X((q[0] + r[0]) / 2)} ${Y((q[1] + r[1]) / 2)})"><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(7 * k)}"/><path d="M${f(-3.5 * k)} 0H${f(3.5 * k)}M0 ${f(-3.5 * k)}V${f(3.5 * k)}"/></g>`;
          }).join("");
          sel += P.map(([x, y], i) => poignee(`data-som="${i}" data-foc="s-${i}"`, x, y, _t("Sommet {n}", { n: i + 1 }), `ed-ap-h${M.som === i ? " on" : ""}`, "move")).join("");
        }
      }
      return `<g class="ed-ap-ui"><rect class="limite" x="${X(0)}" y="${Y(0)}" width="${f(w)}" height="${f(h)}"/><g class="cibles">${cibles}</g>${gd}${sel}</g>`;
    };
    const versCm = (g, ev) => { const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(g.inv); return [q.x + g.w / 2, q.y + g.h / 2]; };
    return {
      tete: () => `<div class="ed-at-outils">
        <button type="button" class="ib${M.aimant ? " on" : ""}" data-at="aimant" aria-pressed="${M.aimant}" title="${tactile() ? _t("Aimanter") : _t("Aimanter (Alt : couper)")}" aria-label="${_t("Aimanter")}"><ha-icon icon="${M.aimant ? "mdi:magnet-on" : "mdi:magnet"}"></ha-icon></button>
        <button type="button" class="ib${M.grand ? " on" : ""}" data-at="grand" aria-pressed="${M.grand}" title="${_t("Agrandir l'aperçu")}" aria-label="${_t("Agrandir l'aperçu")}"><ha-icon icon="${M.grand ? "mdi:arrow-collapse" : "mdi:arrow-expand"}"></ha-icon></button></div>`,
      pied: () => `<p class="ed-at-astuce">${_t("Choisis une forme pour la glisser ou la redimensionner.")}</p>`,
      changerGenre: (p, v) => {
        // rectangle ↔ trait ou polygone : la forme garde sa place (boîte ↔ points)
        const pts = v === "trait" || v === "polygone";
        if (pts && !aPoints(p)) {
          const x0 = pc(+p.x || 0), y0 = pc(+p.y || 0), x1 = pc(x0 + (+p.l || 0)), y1 = pc(y0 + (+p.h || 0)), ym = pc((y0 + y1) / 2);
          p.points = v === "trait" ? [[x0, ym], [x1, ym]] : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
          for (const k of ["x", "y", "l", "h"]) delete p[k];
        } else if (!pts && aPoints(p) && p.points?.length) {
          const b = boite(p, 100, 100);
          Object.assign(p, { x: pc(b.x0), y: pc(b.y0), l: pc(Math.max(5, b.x1 - b.x0)), h: pc(Math.max(5, b.y1 - b.y0)) });
          delete p.points;
        }
        if (v === "polygone" && p.points?.length === 2) { const [[a, b], [c, d]] = p.points, ym = (b + d) / 2; p.points.push([pc((a + c) / 2), pc(ym >= 50 ? ym - 40 : ym + 40)]); }
        if (v === "arrondi") p.rayon ??= 8; else delete p.rayon;
        p.genre = v;
      },
      action: (k, v, ob) => {
        const j = +v;
        if (k === "aimant") { M.aimant = !M.aimant; return '[data-at="aimant"]'; }
        if (k === "grand") { M.grand = !M.grand; return '[data-at="grand"]'; }
        if (k === "prim") { M.sel = ob.forme.length - 1; M.som = null; }
        if (k === "retirer-prim") { if (M.sel === j) { M.sel = null; M.som = null; } else if (M.sel != null && M.sel > j) M.sel--; }
        if (k === "monter-prim" && j > 0) { if (M.sel === j) M.sel = j - 1; else if (M.sel === j - 1) M.sel = j; }
        if (k === "retirer-som") { if (M.sel === j) retirerSommet(j, M.som); noter(); return '[data-foc="ap"]'; }
        noter();
        if (k === "prim") return `[data-at="prim:${v}"]`;
        return undefined;
      },
      monter: (voile, api) => {
        M.voile = voile; M.api = api;
        const dans = (ev, k) => ev.composedPath().find((n) => n.dataset?.[k] != null);
        const bouger = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          if (!g.bouge && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 4) return;
          g.bouge = true; clearTimeout(g.appui);
          if (g.mode === "vide" || g.mode === "fini" || !g.b0) return;
          ev.preventDefault();
          const [x, y] = versCm(g, ev);
          appliquer(g, x - g.s0[0], y - g.s0[1], M.aimant && !ev.altKey, ev.shiftKey);
          champs(g.j); planifier();
        };
        const lacher = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          M.g = null; clearTimeout(g.appui); M.guides = [];
          window.removeEventListener("pointermove", bouger); window.removeEventListener("pointerup", lacher); window.removeEventListener("pointercancel", lacher);
          if (!voile.isConnected || ev.type === "perdu") return;
          if (g.mode === "vide") { if (!g.bouge && ev.type === "pointerup" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); } return; }
          if (g.bouge || g.ajout) noter();
          redessiner();
        };
        voile.addEventListener("pointerdown", (ev) => {
          voile.classList.remove("ed-clavier"); // contour de focus de l'aperçu : au clavier seulement
          // une ligne de la liste touchée : sa forme est choisie
          const r = ev.target.closest?.(".ed-prim[data-prim]");
          if (r) { if (+r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } return; }
          const svg = ev.target.closest?.("svg.ed-ap-meuble");
          if (!svg || (ev.pointerType === "mouse" && ev.button !== 0)) return;
          if (M.g) { if (ev.pointerId !== M.g.id && ev.pointerType !== "mouse") return; noter(); lacher({ pointerId: M.g.id, type: "perdu" }); } // second doigt : ignoré ; relâché perdu : glissement clos
          const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM();
          if (!m) return;
          const pl = dans(ev, "plus"), so = dans(ev, "som"), hd = dans(ev, "h"), ci = dans(ev, "p");
          let mode = "vide", focus = '[data-foc="ap"]', ajout = false;
          if (pl && M.sel != null) { const i = ajouterSommet(M.sel, +pl.dataset.plus); if (i != null) { M.som = i; mode = "sommet"; ajout = true; focus = `[data-foc="s-${i}"]`; } }
          else if (so && M.sel != null) { M.som = +so.dataset.som; mode = "sommet"; focus = `[data-foc="s-${M.som}"]`; }
          else if (hd && M.sel != null) { mode = "poignee"; focus = `[data-foc="h-${hd.dataset.h}"]`; }
          else if (ci) { const j = +ci.dataset.p; if (j !== M.sel) choisir(j); else M.som = null; mode = "corps"; }
          ev.preventDefault(); // ni sélection de texte ni focus du navigateur : le focus est donné ci-dessous
          const p = M.sel != null ? ob.forme[M.sel] : null;
          const g = (M.g = { mode, j: M.sel, i: M.som, ph: hd?.dataset.h, p0: p ? clone(p) : null, b0: valide(p) ? boite(p, w, h) : null, w, h, inv: m.inverse(), k: 1 / Math.hypot(m.a, m.b),
            cx: ev.clientX, cy: ev.clientY, id: ev.pointerId, bouge: false, ajout });
          g.s0 = versCm(g, ev);
          // appui long au doigt ou au stylet sur un sommet : retiré (s'il en reste assez) ; à la souris, Suppr ou le bouton de la ligne
          if (mode === "sommet" && !ajout && ev.pointerType !== "mouse" && p.points.length > minPts(p)) g.appui = setTimeout(() => {
            if (M.g !== g || g.bouge || !retirerSommet(g.j, g.i)) return;
            g.mode = "fini"; noter(); redessiner(); champs(g.j); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus({ preventScroll: true }); navigator.vibrate?.(30);
          }, 600);
          try { voile.querySelector(".ed-at-w").setPointerCapture(ev.pointerId); } catch (e) { /* pointeur déjà relâché */ }
          window.addEventListener("pointermove", bouger); window.addEventListener("pointerup", lacher); window.addEventListener("pointercancel", lacher);
          if (mode !== "vide") { redessiner(); if (ajout) champs(M.sel); }
          voile.querySelector(focus)?.focus({ preventScroll: true });
        });
        // tactile : pas de défilement ni de menu quand le doigt part d'une forme ou d'une poignée (le vide de l'aperçu défile)
        voile.addEventListener("touchstart", (ev) => { if (ev.composedPath().some((n) => n.dataset && ["p", "h", "som", "plus"].some((k) => n.dataset[k] != null))) ev.preventDefault(); }, { passive: false });
        voile.addEventListener("contextmenu", (ev) => { if (ev.target.closest?.(".ed-ap-ui")) ev.preventDefault(); });
        // focus dans une ligne de la liste : sa forme est choisie ; champ validé : noté dans l'historique
        voile.addEventListener("focusin", (ev) => { const r = ev.target.closest?.(".ed-prim[data-prim]"); if (r && +r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } });
        voile.addEventListener("change", () => noter());
      },
      apresRendu: (v) => {
        M.voile = v;
        const ob = o();
        if (!ob?.forme) return;
        if (M.ref !== ob) { noter(); M.sel = null; M.som = null; } // autre point de départ (Retour, autre type) : rien de choisi
        if (M.sel != null && !valide(ob.forme[M.sel])) { M.sel = null; M.som = null; }
        if (M.som != null && !(ob.forme[M.sel]?.points?.length > M.som)) M.som = null;
        v.querySelector(".ed-atelier")?.classList.toggle("ed-at-grand", M.grand);
        const w = v.querySelector(".ed-at-w"), svg = w?.querySelector("svg.ed-ap-meuble");
        if (!svg) return;
        w.classList.add("ed-at-manip");
        ajouterHTML(svg, dessinUI(svg));
        lignes();
        // téléphone : la ligne montrée ne passe pas sous l'aperçu collant
        v.querySelector(".ed-at-corps")?.style.setProperty("--ed-ap-h", `${v.querySelector(".ed-at-apercu")?.offsetHeight || 0}px`);
      },
      touche: (ev) => {
        if (ev.type !== "keydown" || !M.voile) return false;
        M.voile.classList.add("ed-clavier");
        const ch = ev.composedPath(), t = ch[0], kl = (ev.key || "").toLowerCase(), ctrl = ev.ctrlKey || ev.metaKey;
        const stop = () => { ev.preventDefault(); ev.stopPropagation(); return true; };
        if (ctrl && !ev.altKey && (kl === "z" || kl === "y")) {
          // champ de texte : annulation du navigateur ; ailleurs (aperçu, nombres, boutons) : historique de l'atelier
          if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && !["number", "checkbox", "radio", "range"].includes(t.type))) return false;
          aller(kl === "y" || ev.shiftKey ? 1 : -1);
          return stop();
        }
        if (ctrl || ev.altKey || !ch.some((n) => n.classList?.contains("ed-at-w"))) return false;
        const ob = o(), p = M.sel != null ? ob.forme[M.sel] : null, ds = t?.dataset || {};
        if (kl === "escape" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); M.voile.querySelector('[data-foc="ap"]')?.focus(); return stop(); }
        if (kl === "enter" || kl === " ") {
          if (ds.plus == null || M.sel == null) return kl === " " ? stop() : false;
          const i = ajouterSommet(M.sel, +ds.plus);
          if (i != null) { M.som = i; noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector(`[data-foc="s-${i}"]`)?.focus(); }
          return stop();
        }
        if (!valide(p)) return false;
        if (kl === "delete" || kl === "backspace") {
          if (ds.som != null) { if (retirerSommet(M.sel, +ds.som)) { noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus(); } return stop(); }
          ob.forme.splice(M.sel, 1); M.sel = null; M.som = null; noter(); M.api.rendre('[data-foc="ap"]');
          return stop();
        }
        const pas = ev.shiftKey ? 10 : 1, d = { arrowleft: [-pas, 0], arrowright: [pas, 0], arrowup: [0, -pas], arrowdown: [0, pas] }[kl];
        if (!d) return false;
        const [w, h] = dims(ob), mode = ds.som != null && aPoints(p) ? "sommet" : ds.h && !aPoints(p) ? "poignee" : "corps";
        if (mode === "sommet") M.som = +ds.som;
        appliquer({ mode, j: M.sel, i: M.som, ph: ds.h, p0: clone(p), b0: boite(p, w, h), w, h, k: 1 }, d[0], d[1], false, false);
        M.guides = []; noter(); champs(M.sel); redessiner();
        return stop();
      },
    };
  }

  // ---------- catalogue et modèles ----------
  ouvrirCatalogue(opt = {}) {
    const d = this.d, mod = (d.modeles || []).filter((m) => !opt.widgets || m.genre === "widget");
    const cat = (m) => (m.genre === "point" ? "appareils" : m.genre === "ouverture" ? "ouvertures" : m.genre === "widget" ? "widgets" : m.genre === "meuble" ? "meubles" : "pieces");
    const sansAccent = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const apercu = (t) => { const x = MEUBLES()[t]; return apercuObj({ type: t, taille: x.taille, chaises: x.chaises }); };
    // aperçu d'un meuble (catalogue ou modèle, forme personnalisée comprise)
    const apercuObj = (x) => { const [w, h] = (x.taille || MEUBLES()[x.type]?.taille || [60, 60]).map((v) => nbr(v, 60)), c = Math.max(w, h) * 0.62 + 20;
      return `<svg class="ed-apercu" viewBox="${-c} ${-c} ${2 * c} ${2 * c}" aria-hidden="true">${this.carte.constructor.dessinMeuble({ ...x, pos: [0, 0], rotation: 0 })}</svg>`; };
    // tuile : description sur une ligne, détail en infobulle ; widget : flèches ← / → pour le panneau gauche ou droit (Entrée : panneau droit)
    // widgets : génériques (types de base) en tête, puis les prêts à l'emploi ; référence « w<i> » dans cette liste
    const W = [...CATALOGUE.panneaux.map((m) => ({ ...m, cat: "generiques" })), ...PRETS_WIDGETS()], NOMS_CAT = Object.fromEntries(CATS_WIDGETS.map(([c, , t]) => [c, _t(t)]));
    const tuile = (m, ref, c, hors) => `<div class="ed-tuile${m.creer ? " ed-tuile-creer" : ""}" data-m="${ref}" data-cat="${c}"${hors ? ` data-recherche="1"` : ""} data-txt="${esc(sansAccent(`${m.nom} ${m.desc || ""} ${m.detail || ""} ${m.mots || ""} ${m.genre === "widget" && m.cat ? NOMS_CAT[m.cat] || "" : ""}`))}" role="button" tabindex="0"${m.detail ? ` title="${esc(m.detail)}"` : ""}>${ref[0] === "z" ? apercuSZ : m.genre === "meuble" && m.objet && (MEUBLES()[m.type] || m.type === "forme") ? apercuObj({ ...m.objet, type: m.type }) : m.genre === "meuble" && MEUBLES()[m.type] ? apercu(m.type) : `<ha-icon icon="${esc(m.icone || "mdi:shape-outline")}"></ha-icon>`}<b>${esc(m.nom)}</b>${m.desc ? `<small>${esc(m.desc)}</small>` : ""}
      ${ref.startsWith("u") && m.genre === "meuble" && m.type === "forme" ? `<button class="ib modif" data-modif="${ref.slice(1)}" title="${_t("Modifier ce modèle")}" aria-label="${_t("Modifier ce modèle")}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>` : ""}
      ${m.genre === "widget" && opt.cote !== "fiche" && ref !== "W" ? `<span class="cotes"><span data-cote="gauche" title="${_t("Panneau gauche")}" aria-label="${_t("Panneau gauche")}"><ha-icon icon="mdi:arrow-left"></ha-icon></span><span data-cote="droite" title="${_t("Panneau droit")}" aria-label="${_t("Panneau droit")}"><ha-icon icon="mdi:arrow-right"></ha-icon></span></span>` : ""}
      ${ref.startsWith("u") ? `<button class="ib suppr" data-suppr="${ref.slice(1)}" title="${_t("Supprimer ce modèle")}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>` : ""}</div>`;
    const plan = CATALOGUE.plan.map((m, i) => [m, `p${i}`]), ordre = ["zone", "assistant", "outil"];
    const ML = MEUBLES(), cats = [...new Set(Object.values(ML).map((x) => x.cat))];
    const COURT = { espace: _t("Pointillés et un nom"), rect: _t("Objet avec un nom") };
    // meubles personnalisés de « Mes modèles » rangés dans leur catégorie (et non plus dans « Mes modèles ») ; « Créer un meuble » en tête
    const CATS = this.carte.constructor.CATS_MEUBLES, persos = mod.map((m, i) => [m, i]).filter(([m]) => m.genre === "meuble" && m.type === "forme" && CATS[m.cat] && cats.includes(CATS[m.cat]));
    const meubles = cats.map((c, k) => [c, [...(k ? [] : [[{ nom: _t("Créer un meuble"), icone: "mdi:shape-plus-outline", desc: _t("Forme, taille, couleur"), mots: "nouveau meuble personnalise forme", creer: true }, "CM"]]),
      ...Object.entries(ML).filter(([, x]) => x.cat === c).map(([t, x]) => [{ nom: _t(x.nom), desc: x.aide ? COURT[t] || _t(x.aide) : `${x.taille[0]} × ${x.taille[1]} cm`, detail: x.aide && COURT[t] ? _t(x.aide) : "", genre: "meuble", type: t, mots: x.mots }, `m${t}`]),
      ...persos.filter(([m]) => CATS[m.cat] === c).map(([m, i]) => [m, `u${i}`])]]);
    // nom écrit dans la config à la création : langue de l'interface ; mots de recherche français gardés (le nom affiché est aussi cherché)
    const SZ = [[_t("Cuisine"), 300, 200, "plan de travail coin repas"], [_t("Douche"), 90, 90, "salle d eau"], [_t("Coin repas"), 200, 160, "table salle a manger"], [_t("Coin salon"), 300, 250, "canape tv"],
      [_t("Coin bureau"), 160, 120, "travail"], [_t("Dressing"), 200, 150, "placard rangement"], [_t("Buanderie"), 200, 150, "lave linge cellier"], [_t("Entrée"), 150, 150, "hall vestibule"], [_t("Sous-zone"), 200, 150, "zone delimitation espace"]];
    const apercuSZ = `<svg class="ed-apercu" viewBox="-60 -45 120 90" aria-hidden="true"><rect x="-50" y="-35" width="100" height="70" rx="2" class="ed-sz"/></svg>`;
    const sousZones = SZ.map(([nom, w, h, mots], i) => [{ nom, desc: _t("{w} × {h} cm · à tracer", { w, h }), genre: "sous_zone", mots: `sous zone ${mots}` }, `z${i}`]);
    const pieces = plan.filter(([m]) => cat(m) === "pieces").sort((a, b) => ordre.indexOf(a[0].genre) - ordre.indexOf(b[0].genre));
    const pf = opt.cote === "fiche" ? porteur(opt) : null, pourFiche = pf && d[GENRES_FICHE[pf.genre]]?.[pf.i];
    const Wi = W.map((m, i) => [m, `w${i}`]);
    // modale « Ajouter un widget » : une section par catégorie ; catalogue général : les génériques, « Tous les widgets » et,
    // seulement pendant une recherche, les prêts à l'emploi
    const sections = opt.widgets ? CATS_WIDGETS.map(([c, , t]) => [c, esc(_t(t)), Wi.filter(([m]) => m.cat === c)])
      : [["pieces", _t("Pièces et tracé"), pieces], ["appareils", _t("Appareils"), plan.filter(([m]) => cat(m) === "appareils")],
        ["ouvertures", _t("Ouvertures"), [[{ nom: _t("Créer une ouverture"), icone: "mdi:plus-box-outline", desc: _t("Type, capteurs, aperçu"), mots: "nouvelle ouverture personnalisee", creer: true }, "CO"], ...plan.filter(([m]) => cat(m) === "ouvertures")]],
        ["meubles", _t("Sous-zones (cuisine, douche…)"), sousZones],
        ...meubles.map(([c, l]) => ["meubles", _t("Meubles · {cat}", { cat: esc(_t(c)) }), l]),
        ["widgets", _t("Widgets des panneaux (maison)"), [...Wi.filter(([m]) => m.cat === "generiques"), [{ nom: _t("Tous les widgets"), icone: "mdi:view-grid-plus-outline", desc: _t("{n} prêts à l'emploi", { n: W.length - CATALOGUE.panneaux.length }), mots: "plus widgets catalogue" }, "W"],
          ...Wi.filter(([m]) => m.cat !== "generiques").map(([m, r]) => [m, r, true])]]];
    const autres = mod.map((m, i) => [m, i]).filter(([m]) => !persos.some(([x]) => x === m));
    if (autres.length) sections.push(["modeles", _t("Mes modèles"), autres.map(([m, i]) => [{ ...m, desc: m.desc || ((dg) => dg && _t(dg))(({ point: _tk("Objet du plan"), ouverture: _tk("Ouverture"), widget: _tk("Widget (panneau ou fiche)") })[m.genre]) }, `u${i}`])]);
    const NOMS_ONGLETS = { pieces: _t("Pièces"), appareils: _t("Appareils"), ouvertures: _t("Ouvertures"), meubles: _t("Meubles"), widgets: _t("Widgets"), modeles: _t("Mes modèles"),
      ...(opt.widgets ? Object.fromEntries(CATS_WIDGETS.map(([c, puce]) => [c, _t(puce)])) : {}) };
    const onglets = [["tous", _t("Tout")], ...new Map(sections.map(([c, t]) => [c, NOMS_ONGLETS[c] || t]))];
    let onglet = opt.onglet && onglets.some(([c]) => c === opt.onglet) ? opt.onglet : opt.widgets ? "tous" : !d.pieces.length ? "pieces" : "tous";
    const ou = opt.widgets ? (pourFiche ? _t("Fiche « {nom} »", { nom: esc(this._nomElement(pf)) }) : opt.piece != null ? _t("Pièce « {nom} »", { nom: esc(d.pieces[opt.piece].nom) }) : "") : "";
    const voile = document.createElement("div");
    voile.className = `ed-voile${opt.widgets ? " ed-plein-tel" : ""}`;
    poserHTML(voile, `<div class="ed-dialogue large${opt.widgets ? " ed-cat-widgets" : ""}" role="dialog" aria-modal="true" aria-labelledby="ed-cat-titre"><header>
        ${opt.widgets ? `<div class="ed-titre-ligne"><h2 id="ed-cat-titre">${_t("Ajouter un widget")}</h2><button class="ed-btn tonal" data-creer="1"><ha-icon icon="mdi:plus"></ha-icon>${_t("Créer un widget")}</button></div>${ou ? `<div class="ed-aide ed-ou">${ou}</div>` : ""}` : `<h2 id="ed-cat-titre">${_t("Ajouter")}</h2>`}
        <div class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="search" placeholder="${this._etroit() ? _t("Rechercher…") : opt.widgets ? _t("Rechercher (co2, fuite, serrure…)") : _t("Rechercher (lumière, fenêtre, jauge…)")}" aria-label="${_t("Rechercher")}"></div>
        <div class="ed-filtres ed-cat-filtres${opt.widgets ? " ed-cat-defile" : ""}" role="tablist">${onglets.map(([c, t]) => `<button role="tab" data-onglet="${c}">${esc(t)}</button>`).join("")}</div></header>
      <div class="ed-cat">${sections.map(([c, t, l]) => `<section data-sec="${c}"><h4>${t}</h4><div class="ed-grille">${l.map(([m, ref, hors]) => tuile(m, ref, c, hors)).join("")}</div></section>`).join("")}
        <div class="ed-aide ed-rien" hidden>${_t("Rien ne correspond à cette recherche.")}</div></div>
      <footer>${opt.widgets ? `<button class="ed-btn tonal ed-creer-bas" data-creer="1"><ha-icon icon="mdi:plus"></ha-icon>${_t("Créer un widget")}</button><span class="ed-espace"></span>` : ""}<button class="ed-btn texte" data-fermer="1">${_t("Fermer")}</button></footer></div>`);
    this.R.querySelector("ha-card").append(voile);
    const champ = voile.querySelector("input[type=search]");
    const filtrer = () => {
      const q = sansAccent(champ.value.trim());
      let vus = 0;
      voile.querySelectorAll("[data-onglet]").forEach((b) => { b.classList.toggle("on", b.dataset.onglet === onglet); b.setAttribute("aria-selected", b.dataset.onglet === onglet); });
      voile.querySelectorAll("section[data-sec]").forEach((sec) => {
        let n = 0;
        let nom = false;
        sec.querySelectorAll(".ed-tuile").forEach((t) => {
          const ok = (q ? true : (onglet === "tous" || sec.dataset.sec === onglet) && !t.dataset.recherche) && (!q || q.split(/\s+/).every((m) => t.dataset.txt.includes(m))); t.hidden = !ok; n += ok;
          // recherche : les tuiles dont le nom correspond passent devant (et leur section aussi)
          const parNom = ok && !!q && sansAccent(t.querySelector("b")?.textContent || "").includes(q);
          t.style.order = q && !parNom ? 1 : ""; nom ||= parNom;
        });
        sec.hidden = !n; vus += n; sec.style.order = q && !nom ? 1 : "";
      });
      voile.querySelector(".ed-rien").hidden = !!vus;
    };
    champ.oninput = filtrer;
    filtrer();
    this._indiceDefilement(voile.querySelector(".ed-filtres"));
    setTimeout(() => champ.focus(), 30);
    const fermer = () => { voile.remove(); window.removeEventListener("keydown", echap, true); };
    const echap = (ev) => { if (ev.key === "Escape" && this._dessus(voile)) { ev.stopPropagation(); fermer(); } };
    window.addEventListener("keydown", echap, true);
    voile.addEventListener("click", (ev) => {
      const chemin = ev.composedPath();
      if (ev.target === voile || chemin.some((n) => n.dataset?.fermer)) return fermer();
      const cr = chemin.find((n) => n.dataset?.creer);
      if (cr) return this.creerWidget({ ...opt, apres: fermer, retour: cr, dessous: voile });
      const mf = chemin.find((n) => n.dataset?.modif);
      if (mf) return this.modifierMeuble({ u: this.d.modeles.indexOf(mod[+mf.dataset.modif]), retour: mf, dessous: voile, apres: fermer });
      const og = chemin.find((n) => n.dataset?.onglet);
      if (og) { onglet = og.dataset.onglet; champ.value = ""; return filtrer(); }
      const sup = chemin.find((n) => n.dataset?.suppr);
      if (sup) { const m = mod[+sup.dataset.suppr]; fermer(); this.commit(() => this.d.modeles.splice(this.d.modeles.indexOf(m), 1)); this.snack(_t("Modèle supprimé.")); return; }
      const el = chemin.find((n) => n.dataset?.m);
      if (!el) return;
      const ref = el.dataset.m;
      if (ref === "CO") return this.creerOuverture({ apres: fermer, retour: el, dessous: voile });
      if (ref === "CM") return this.creerMeuble({ apres: fermer, retour: el, dessous: voile });
      if (ref === "W") { fermer(); return this.ouvrirCatalogue({ widgets: true, cote: chemin.find((n) => n.dataset?.cote)?.dataset.cote || "droite" }); }
      const m = ref[0] === "z" ? sousZones[+ref.slice(1)][0] : ref[0] === "m" ? { genre: "meuble", type: ref.slice(1) } : ref[0] === "u" ? mod[+ref.slice(1)] : ref[0] === "p" ? CATALOGUE.plan[+ref.slice(1)] : W[+ref.slice(1)];
      const cote = chemin.find((n) => n.dataset?.cote)?.dataset.cote || opt.cote || "droite";
      fermer();
      this.utiliserModele(m, cote, opt.piece ?? null, pf);
    });
    voile.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target?.dataset?.m) ev.target.click(); });
  }

  // fiche : porteur { genre, i } (ou numéro d'un meuble, forme d'origine)
  async utiliserModele(m, cote, piece = null, fiche = null) {
    const pf = typeof fiche === "number" ? { genre: "meuble", i: fiche } : fiche, ref = pf ? { [pf.genre]: pf.i } : {};
    const o = clone(m.objet || {});
    if (m.genre === "outil") { this._texteInfos = m.outil === "infos"; return this.choisirOutil(m.outil === "infos" ? "texte" : m.outil); }
    if (m.genre === "zone") return this.importerZone();
    if (m.genre === "assistant") return this.assistantPieces();
    if (m.genre === "sous_zone") {
      this.choisirOutil("rectangle");
      this.sousZoneEnAttente = { nom: m.nom };
      this._aide(matchMedia("(pointer: coarse)").matches ? _t("« {nom} » : touche deux coins opposés (forme en L : outil Pièce, puis coche « Sous-zone »).", { nom: m.nom }) : _t("« {nom} » : clique deux coins opposés (forme en L : outil Pièce, puis coche « Sous-zone »).", { nom: m.nom }));
      return;
    }
    if (m.genre === "meuble") {
      const def = MEUBLES()[m.type] || { nom: m.nom, taille: [60, 60] };
      this.choisirOutil("selection");
      this.aPlacerMeuble = m.objet ? { ...clone(m.objet), type: m.type } : { type: m.type, taille: [...def.taille], ...(def.chaises ? { chaises: def.chaises } : {}), ...(m.type === "espace" ? { nom: _t("Espace") } : {}) };
      // modèle connecté dont l'entité est à choisir à chaque pose : cherchée dans la pièce où il est posé
      this._meublePre = Array.isArray(m.demander) && m.demander.includes("entite") ? { domaine: m.domaine || "", nom: m.nom } : null;
      this.zone.classList.add("dessin");
      this.carte._construire();
      const nomDef = MEUBLES()[m.type] ? _t(def.nom) : def.nom; // nom du catalogue traduit, nom d'un modèle tel quel
      this._aide(matchMedia("(pointer: coarse)").matches ? _t("Touche le plan pour poser « {nom} ».", { nom: nomDef }) : _t("Clique le plan pour poser « {nom} » (Échap pour annuler).", { nom: nomDef }));
      return;
    }
    if (m.genre === "widget") {
      const objs = Array.isArray(m.objets) ? clone(m.objets).filter((w) => w && typeof w === "object") : [o];
      if (!objs.length || (cote === "fiche" && !pf)) return;
      // prêt à l'emploi : entités cherchées dans HA (pièce ou appareil visé d'abord) ; modèle : champs `demander` vidés ;
      // les champs restés vides sont surlignés « à compléter » dans le panneau du widget
      let manquants = new Set();
      if (m.auto && objs.length === 1) manquants = await this._preRemplir(objs[0], m.auto, this._contexteWidget(piece, pf), m.nom);
      if (Array.isArray(m.demander) && objs.length === 1) for (const c of m.demander) if (typeof c === "string") { poserChemin(objs[0], c, c === "entites" || c === "lignes" ? [] : ""); manquants.add(c); }
      this.commit(() => {
        const l = this._wl(cote === "fiche" ? { cote, ...ref } : { cote, piece }, true), i0 = l.length;
        l.push(...objs);
        this.sel = { type: "widget", cote, i: i0, ...(cote === "fiche" ? ref : piece != null ? { piece } : {}) };
      });
      if (manquants.size) { this._aFaire = { cle: cle(this.sel), champs: manquants }; this._panneau(); this.snack(_t("« {nom} » ajouté : champs en orange à compléter.", { nom: m.nom })); }
      return;
    }
    if (m.genre === "ouverture") {
      this.choisirOutil("ouverture", true);
      // capteurs : ceux du préréglage, ou ceux qu'un modèle demande à chaque pose (cherchés dans la pièce)
      this.modeleOuverture = o; this.aCompleter = m.aCompleter || (Array.isArray(m.demander) ? m.demander.filter((c) => CRIT_OUV[c]) : null);
      this.chercherOuv = m.chercher || null; this.prefOuv = m.pref || null;
      this.snack(_t("« {nom} » : clique les deux extrémités sur un mur.", { nom: m.nom }));
      return;
    }
    let e = o.entite;
    if (!e) {
      e = await this.choisirEntite({ titre: m.nom, domaine: m.domaine || "", obligatoire: true });
      if (!e) return;
    }
    const base = o.entite ? {} : pointPour(this.hass, e, [0, 0]);
    const pt = { ...base, ...o, entite: e };
    if (pt.valeur === "$entite") pt.valeur = e;
    delete pt.pos;
    this.choisirOutil("selection");
    this.aPlacer = pt; this.aCompleter = m.aCompleter;
    this.zone.classList.add("dessin");
    this.snack(_t("Clique sur le plan pour placer « {nom} ». Échap pour annuler.", { nom: this.carte._nom(e) }));
  }

  choisirZone() {
    return new Promise((fin) => {
      const hass = this.hass, zones = Object.values(hass.areas || {}).sort((a, b) => a.name.localeCompare(b.name, _loc()));
      const liee = (z) => this.d.pieces.find((p) => p.zone === z);
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${_t("Pièce Home Assistant")}</h2>
        <div class="ed-aide">${_t("Ses appareils, capteurs et automatisations seront intégrés d'office.")}</div></header>
        <div class="ed-resultats">${zones.map((z) => { const n = entitesZone(hass, z.area_id).length, p = liee(z.area_id);
          return `<button data-r="${esc(z.area_id)}"><ha-icon icon="${esc(z.icon || "mdi:floor-plan")}"></ha-icon><span class="n"><span>${esc(z.name)}</span><small>${_t("{n} entité|{n} entités", { n })}${p ? _t(" · liée à « {nom} »", { nom: esc(p.nom) }) : ""}</small></span></button>`; }).join("")}</div>
        <footer><button class="ed-btn texte" data-r="">${_t("Annuler")}</button></footer></div>`);
      this.R.querySelector("ha-card").append(voile);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r != null); if (ev.target === voile || b) { voile.remove(); fin(b?.dataset.r || null); } };
    });
  }

  async importerZone() {
    const z = await this.choisirZone();
    if (!z) return;
    const nom = this.hass.areas?.[z]?.name || z, i = this.d.pieces.findIndex((p) => p.zone === z);
    if (i >= 0) { this.selectionner({ type: "piece", i }); this.snack(_t("« {nom} » est déjà sur le plan : « Intégrer les appareils » complète ce qui manque.", { nom })); return; }
    this.choisirOutil("rectangle");
    this.zoneEnAttente = z;
    this.snack(_t("Dessine « {nom} » : clique un coin puis le coin opposé (outil Pièce libre pour une autre forme).", { nom }), null, null, 8000);
  }

  // places libres dans un contour, pour poser des appareils sans chevauchement
  _placesLibres(poly, n) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pas = Math.max(40, Math.min(80, Math.min(x1 - x0, y1 - y0) / 4));
    const pris = (this.d.points || []).map((p) => p.pos), l = [];
    for (let y = y0 + pas * 0.75; y < y1 && l.length < n; y += pas)
      for (let x = x0 + pas * 0.75; x < x1 && l.length < n; x += pas) {
        const q = [arr(x), arr(y)];
        if (dansPoly(q, poly) && distBord(q, poly) > 25 && pris.every((r) => Math.hypot(r[0] - x, r[1] - y) > pas * 0.7)) { l.push(q); pris.push(q); }
      }
    const c = centre(poly);
    while (l.length < n) l.push([arr(c[0] + (l.length % 5) * 20), arr(c[1] + Math.floor(l.length / 5) * 20)]);
    return l;
  }

  _utilisees() {
    const d = this.d;
    return new Set([...(d.points || []).flatMap((q) => [q.entite, q.valeur, q.actif]), ...(d.ouvertures || []).flatMap((o) => [o.contact, o.volet, o.entite]),
      ...(d.meubles || []).flatMap((m) => [m.entite, m.valeur, m.actif])].filter(Boolean));
  }

  _ouverturesAPlacer(pi) {
    const hass = this.hass, deja = this._utilisees(), dc = (e) => hass.states[e]?.attributes.device_class;
    return entitesZone(hass, this.d.pieces[pi]?.zone).filter((e) => !deja.has(e) && (
      (e.startsWith("binary_sensor.") && ["window", "door", "garage_door", "opening"].includes(dc(e))) ||
      (e.startsWith("cover.") && ["shade", "shutter", "blind", "curtain", "window", "door", "garage", "gate"].includes(dc(e)))));
  }

  placerOuverture(e) {
    const s = this.hass.states[e], dc = s?.attributes.device_class, nom = s?.attributes.friendly_name || e;
    const o = e.startsWith("cover.")
      ? (["garage", "gate", "door"].includes(dc) ? { type: "portail", entite: e, nom } : { type: "fenetre", volet: e, nom })
      : { type: ["door", "garage_door"].includes(dc) ? "porte" : "fenetre", contact: e, nom };
    this.choisirOutil("ouverture", true);
    this.modeleOuverture = o; this.aCompleter = null;
    this.snack(_t("« {nom} » : clique ses deux extrémités sur un mur.", { nom }), null, null, 8000);
  }

  _integrerSilencieux(pi) { this._silence = true; try { return this.integrer(pi); } finally { this._silence = false; } }

  integrer(pi) {
    const hass = this.hass, p = this.d.pieces[pi], ents = entitesZone(hass, p.zone), deja = this._utilisees();
    const dom = (e) => e.split(".")[0], dc = (e) => hass.states[e]?.attributes.device_class;
    const temp = ents.find((e) => dom(e) === "sensor" && dc(e) === "temperature"), hum = ents.find((e) => dom(e) === "sensor" && dc(e) === "humidity");
    const parApp = {};
    for (const e of ents) (parApp[hass.entities[e]?.device_id || e] ||= []).push(e);
    const PRIO = ["light", "climate", "media_player", "camera", "vacuum", "fan", "lock", "switch", "binary_sensor"];
    const DETECT = ["motion", "occupancy", "presence", "smoke", "moisture", "gas", "carbon_monoxide"];
    const nouveaux = [];
    for (const l of Object.values(parApp)) {
      if (l.some((e) => deja.has(e))) continue;
      const principal = PRIO.map((d) => l.find((e) => dom(e) === d && (d !== "binary_sensor" || DETECT.includes(dc(e))))).find(Boolean);
      if (!principal) continue;
      const pt = pointPour(hass, principal, [0, 0]);
      const pw = l.find((e) => dom(e) === "sensor" && dc(e) === "power");
      if (dom(principal) === "switch" && pw) Object.assign(pt, { valeur: pw, actif: pw, seuil: 20 });
      if (dom(principal) === "camera") { const mv = l.find((e) => dom(e) === "binary_sensor" && dc(e) === "motion"); if (mv) Object.assign(pt, { actif: mv, alerte: true }); }
      nouveaux.push(pt);
    }
    const places = this._placesLibres(p.poly, nouveaux.length);
    const avaitTemp = !!p.temperature;
    const faire = () => {
      if (temp && !p.temperature) p.temperature = temp;
      if (hum && !p.humidite) p.humidite = hum;
      nouveaux.forEach((pt, k) => { pt.pos = places[k]; (this.d.points ||= []).push(pt); this._rattacher(pt); });
    };
    if (this._silence) { faire(); return nouveaux.length; }
    this.commit(faire);
    const ouv = this._ouverturesAPlacer(pi).length;
    this.snack(`${nouveaux.length ? _t("{n} appareil ajouté|{n} appareils ajoutés", { n: nouveaux.length }) : _t("Aucun nouvel appareil")}${temp && !avaitTemp ? _t(", température reliée") : ""}${ouv ? _t(", {n} ouverture à placer sur les murs (panneau)|, {n} ouvertures à placer sur les murs (panneau)", { n: ouv }) : ""}.`, null, null, 8000);
  }

  demander(titre, defaut, inter) {
    return new Promise((fin) => {
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue" role="dialog" style="width:min(420px,100%)"><header><h2>${esc(titre)}</h2>
        <div class="ed-champ"><label>${_t("Nom")}</label><input type="text" value="${esc(defaut)}"></div>
        ${inter ? `<label class="ed-inter" style="margin-top:12px"><span>${esc(inter)}</span><input type="checkbox"></label>` : ""}</header>
        <footer><button class="ed-btn texte" data-r="0">${_t("Annuler")}</button><button class="ed-btn plein" data-r="1">${_t("Enregistrer")}</button></footer></div>`);
      this.R.querySelector("ha-card").append(voile);
      const champ = voile.querySelector("input[type=text]"), coche = voile.querySelector("input[type=checkbox]");
      const fermer = (ok) => { voile.remove(); fin(ok && champ.value.trim() ? { nom: champ.value.trim(), coche: !!coche?.checked } : null); };
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile) fermer(false); else if (b) fermer(b.dataset.r === "1"); };
      champ.onkeydown = (ev) => { if (ev.key === "Enter") fermer(true); if (ev.key === "Escape") { ev.stopPropagation(); fermer(false); } };
      setTimeout(() => champ.select(), 30);
    });
  }

  async enregistrerModele() {
    const s = this.sel, o = this._objet();
    if (!s || !o) return;
    if (s.type === "meuble") {
      const def = MEUBLES()[o.type], [w, h] = o.taille || def?.taille || [60, 60], lie = !!(o.entite || o.valeur || o.actif || o.fiche);
      const r = await this.demander(_t("Enregistrer comme modèle"), `${o.nom || (def?.nom ? _t(def.nom) : _t("Meuble"))} ${w} × ${h}`, lie ? _t("Garder les entités (sinon le meuble et sa fiche sont à relier à nouveau)") : null);
      if (!r) return;
      let objet = clone(o); delete objet.pos; delete objet.groupe; objet.taille = [w, h];
      if (lie && !r.coche) { objet = sansEntites(objet); if (o.clic) objet.clic = o.clic; }
      this.commit(() => (this.d.modeles ||= []).push({ nom: r.nom, genre: "meuble", type: o.type, desc: `${w} × ${h} cm`, objet }));
      return this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
    }
    const genre = s.type === "widget" ? "widget" : s.type === "ouverture" ? "ouverture" : "point";
    const defaut = o.titre || o.nom || (o.entite ? this.carte._nom(o.entite) : genre === "ouverture" ? _t("Ouverture") : _t("Modèle"));
    const r = await this.demander(_t("Enregistrer comme modèle"), defaut, _t("Garder les entités (sinon elles seront demandées à chaque usage)"));
    if (!r) return;
    let objet = clone(o);
    delete objet.pos; delete objet.seg; delete objet.piece;
    if (!r.coche) {
      const valeurPropre = objet.valeur && objet.valeur === objet.entite;
      objet = sansEntites(objet);
      if (valeurPropre) objet.valeur = "$entite";
    }
    const m = { nom: r.nom, genre, icone: o.icone || (genre === "ouverture" ? (o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door") : "mdi:shape-outline"), objet };
    if (genre === "point" && o.entite) m.domaine = o.entite.split(".")[0];
    // ouverture sans ses entités : ses capteurs seront cherchés dans la pièce à chaque pose
    if (genre === "ouverture" && !r.coche) { const dem = ["contact", "volet", "entite"].filter((c) => o[c]); if (dem.length) m.demander = dem; }
    this.commit(() => (this.d.modeles ||= []).push(m));
    this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
  }

  // ---------- appareils ----------
  async ajouterAppareil() {
    const e = await this.choisirEntite({ titre: _t("Ajouter un appareil"), obligatoire: true });
    if (!e) return;
    this.choisirOutil("selection");
    this.aPlacer = pointPour(this.hass, e, [0, 0]);
    this.zone.classList.add("dessin");
    this.snack(_t("Clique sur le plan pour placer « {nom} ». Échap pour annuler.", { nom: this.carte._nom(e) }));
  }

  choisirEntite({ titre, domaine = "", obligatoire = false } = {}) {
    return new Promise((fin) => {
      const hass = this.hass, deja = new Set([...(this.d.points || []), ...(this.d.meubles || [])].map((p) => p.entite).filter(Boolean));
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      let filtre = domaine;
      poserHTML(voile, `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${esc(titre)}</h2>
        <label class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="text" placeholder="${this._etroit() ? _t("Rechercher…") : _t("Rechercher une entité, une pièce…")}" aria-label="${_t("Rechercher une entité, une pièce…")}" autocomplete="off"></label>
        <div class="ed-filtres">${DOMAINES.map(([d, n]) => `<button data-f="${d}" class="${d === filtre ? "on" : ""}">${_t(n)}</button>`).join("")}</div></header>
        <div class="ed-resultats"></div>
        <footer>${obligatoire ? "" : `<button class="ed-btn texte" data-r="">${_t("Aucune")}</button>`}<button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button></footer></div>`);
      this.R.querySelector("ha-card").append(voile);
      const champ = voile.querySelector("input"), res = voile.querySelector(".ed-resultats");
      const tous = Object.keys(hass.states).sort();
      const rendre = () => {
        const q = champ.value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const l = [];
        for (const e of tous) {
          if (filtre && !e.startsWith(filtre + ".")) continue;
          const s = hass.states[e], n = String(s.attributes.friendly_name || e);
          const cle = `${e} ${n}`.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          if (q && !q.split(/\s+/).every((m) => cle.includes(m))) continue;
          l.push([e, n, s]);
          if (l.length >= 120) break;
        }
        poserHTML(res, l.length ? l.map(([e, n, s]) => `<button data-r="${esc(e)}" class="${deja.has(e) ? "deja" : ""}"><ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon>
          <span class="n"><span>${esc(n)}</span><small>${esc(e)}${deja.has(e) ? _t(" · déjà sur le plan") : ""}</small></span><span class="etat">${esc(hass.formatEntityState?.(s) ?? s.state)}</span></button>`).join("")
          : `<div class="ed-aide" style="padding:16px">${_t("Aucune entité trouvée.")}</div>`);
      };
      const fermer = (v) => { voile.remove(); window.removeEventListener("keydown", echap, true); fin(v); };
      const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer(null); } };
      window.addEventListener("keydown", echap, true);
      voile.addEventListener("click", (ev) => {
        if (ev.target === voile) return fermer(null);
        const b = ev.composedPath().find((n) => n.dataset && (n.dataset.f != null || n.dataset.r != null));
        if (!b) return;
        if (b.dataset.f != null) { filtre = b.dataset.f; voile.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === b)); rendre(); return; }
        fermer(b.dataset.r === "annuler" ? null : b.dataset.r);
      });
      champ.addEventListener("input", rendre);
      champ.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { const b = res.querySelector("button"); if (b) fermer(b.dataset.r); } });
      rendre();
      this._indiceDefilement(voile.querySelector(".ed-filtres"));
      setTimeout(() => champ.focus(), 30);
    });
  }

  // ---------- résumé en tête (puces) ----------
  _puces(creer) {
    if (Array.isArray(this.d.resume)) return this.d.resume;
    if (!creer) return this.carte._puces();
    return (this.d.resume = this.carte._puces());
  }

  _panneauPuce(o, supprimer) {
    const t0 = PUCES.find((x) => x[0] === o.type), t = t0 ? [t0[0], t0[1], _t(t0[2]), _t(t0[3])] : [o.type, "mdi:help", o.type, ""], l = this._puces(), i = this.sel.i;
    let h = `<h3><ha-icon icon="${esc(o.icone || t[1])}"></ha-icon>${esc(o.type === "entite" ? o.nom || (o.entite ? this.carte._nom(o.entite) : t[2]) : t[2])}${bulleI(t[3] ? `${_t("Puce du résumé, en tête du plan.")} ${t[3]}.` : _t("Puce du résumé, en tête du plan."))}</h3>
      <div class="ed-resume">${_t("Puce {i} sur {n}", { i: i + 1, n: l.length })}</div>`;
    if (o.type === "entite") h += `${this._champEntite(_t("Entité"), "entite", o.entite, false)}
      ${this._champTexte(_t("Texte après la valeur"), "nom", o.nom, o.entite ? this.carte._nom(o.entite) : _t("nom de l'entité"))}
      <div class="ed-ligne">${this._champTexte(_t("Unité"), "unite", o.unite, _t("auto"))}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, _t("auto"))}</div>
      <h4>${_t("Alerte (puce rouge)")}</h4>
      <div class="ed-ligne">${this._champTexte(_t("Quand l'état vaut"), "alerte_etat", o.alerte_etat, _t("ex. on"))}${this._champNombre(_t("Ou au-dessus de"), "alerte_au_dessus", o.alerte_au_dessus, 1, "—")}</div>
      ${this._champTexte(_t("Masquer la puce quand l'état vaut"), "masquer_si", o.masquer_si, _t("ex. off"))}`;
    h += `<div class="ed-champ"><label>${_t("Afficher la puce")}</label><select data-k="afficher">${[["", _t("Toujours")], ["absent", _t("Seulement quand personne n'est à la maison")], ["present", _t("Seulement quand quelqu'un est à la maison")]].map(([v, n]) => `<option value="${esc(v)}" ${(o.afficher || "") === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${o.afficher ? this._champEntite(this.d.presence ? _t("Présence (défaut : celle des paramètres)") : _t("Présence (défaut : zone Maison)"), "presence", o.presence, true) : ""}
      ${this._champTexte(_t("Icône"), "icone", o.icone, _t("auto ({icone})", { icone: t[1] }))}
      <h4>${_t("Place")}${bulleI(_t("Glisse la puce : à côté d'une autre, sous elle (pile) ou sous toutes (nouvelle ligne)."))}</h4>
      ${i ? this._inter(_t("Sous la puce précédente (pile)"), "sous", o.sous) : ""}
      ${i && !o.sous ? this._inter(_t("Commencer une nouvelle ligne"), "ligne", o.ligne) : ""}
      <div class="ed-actions">${ibAct("p-avant", "mdi:arrow-left", _t("Avant"), i ? "" : "disabled")}${ibAct("p-apres", "mdi:arrow-right", _t("Après"), i < l.length - 1 ? "" : "disabled")}${ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${supprimer}</div>`;
    return h;
  }

  // glisser une puce du résumé : à gauche / à droite d'une autre (dans sa ligne), sous elle (pile), ou sous toutes (nouvelle ligne)
  glisserPuce(ev, el) {
    if (ev.button > 0) return;
    ev.preventDefault(); // ni sélection de texte ni glisser natif du navigateur (qui annulerait le pointeur)
    getSelection?.()?.removeAllRanges?.();
    const tete = el.closest(".tete"), i0 = +el.dataset.puce, x0 = ev.clientX, y0 = ev.clientY;
    let actif = false, cible = null;
    const ind = document.createElement("div");
    ind.className = "puce-depot";
    this.carte._glissePuce = true; // plus de redessin du résumé jusqu'au relâchement
    const mv = (e) => {
      if (!el.isConnected) el = tete.querySelector(`.chip[data-puce="${i0}"]`) || el;
      if (!actif) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) < 6) return;
        actif = true; el.classList.add("glisse"); tete.append(ind);
      }
      e.preventDefault();
      el.style.transform = `translate(${e.clientX - x0}px, ${e.clientY - y0}px)`;
      cible = this._ciblePuce(tete, el, e.clientX, e.clientY);
      const T = tete.getBoundingClientRect();
      ind.hidden = !cible;
      if (!cible) return;
      const r = cible.r, place = (x, y, w, h) => Object.assign(ind.style, { left: `${x - T.left}px`, top: `${y - T.top}px`, width: `${w}px`, height: `${h}px` });
      if (cible.mode === "avant") place(r.left - 6, r.top, 3, r.height);
      else if (cible.mode === "apres") place(r.right + 3, r.top, 3, r.height);
      else if (cible.mode === "sous") place(r.left, r.bottom + 2, r.width, 3);
      else place(T.left, T.bottom - 2, T.width, 3);
    };
    const fin = (e) => {
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
      el.style.transform = ""; el.classList.remove("glisse"); ind.remove();
      this.carte._glissePuce = false;
      if (!actif) return;
      this.carte._puceGlissee = true;
      setTimeout(() => { this.carte._puceGlissee = false; }, 0);
      if (e.type === "pointerup" && cible) this.deplacerPuce(i0, cible.mode, cible.j);
    };
    window.addEventListener("pointermove", mv, { passive: false }); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
  }
  _ciblePuce(tete, el, x, y) {
    const l = [...tete.querySelectorAll(".chip[data-puce]")].filter((c) => c !== el).map((c) => ({ j: +c.dataset.puce, r: c.getBoundingClientRect() }));
    if (!l.length) return null;
    const dans = l.find(({ r }) => x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 3 && y <= r.bottom + 3);
    if (dans) return { ...dans, mode: y > dans.r.top + dans.r.height * 0.62 ? "sous" : x < dans.r.left + dans.r.width / 2 ? "avant" : "apres" };
    if (y > Math.max(...l.map(({ r }) => r.bottom)) + 4) return { mode: "ligne", j: null, r: null };
    // dans la bande d'une ligne, hors des puces : à côté de la plus proche
    const bande = l.filter(({ r }) => y >= r.top - 4 && y <= r.bottom + 4);
    if (!bande.length) return null;
    const p = bande.reduce((a, b) => (Math.min(Math.abs(x - a.r.left), Math.abs(x - a.r.right)) <= Math.min(Math.abs(x - b.r.left), Math.abs(x - b.r.right)) ? a : b));
    return { ...p, mode: x > p.r.right ? "apres" : "avant" };
  }
  // déplacement d'une puce ; en la retirant, sa place (début de ligne, tête de pile) passe à la suivante
  deplacerPuce(i0, mode, j) {
    if (mode !== "ligne" && (j == null || j === i0)) return;
    this.commit(() => {
      const l = this._puces(true), p = l[i0], n = l[i0 + 1];
      if (!p) return;
      if (!p.sous && n) { if (n.sous) { delete n.sous; if (p.ligne) n.ligne = true; } else if (p.ligne) n.ligne = true; }
      l.splice(i0, 1);
      delete p.sous; delete p.ligne;
      const jj = j == null ? null : j > i0 ? j - 1 : j;
      const tete = (k) => { while (k > 0 && l[k].sous) k--; return k; }, fin = (k) => { while (l[k + 1]?.sous) k++; return k; };
      let k;
      if (mode === "avant") { k = tete(jj); if (l[k].ligne) { p.ligne = true; delete l[k].ligne; } }
      else if (mode === "apres") k = fin(jj) + 1;
      else if (mode === "sous") { k = jj + 1; p.sous = true; }
      else { k = l.length; if (k) p.ligne = true; }
      l.splice(k, 0, p);
      if (l[0]) delete l[0].ligne;
      this.sel = { type: "puce", i: k };
    });
  }

  ajouterPuce() {
    const l = this._puces(), dispo = PUCES.filter(([t]) => t === "entite" || !l.some((p) => p.type === t));
    const voile = document.createElement("div");
    voile.className = "ed-voile";
    poserHTML(voile, `<div class="ed-dialogue" role="dialog" aria-modal="true" style="width:min(440px,100%)"><header><h2>${_t("Ajouter une puce")}</h2></header>
      <div class="ed-resultats">${dispo.map(([t, ic, n, d]) => `<button data-t="${t}"><ha-icon icon="${ic}"></ha-icon><span class="n"><span>${esc(_t(n))}</span><small>${esc(_t(d))}</small></span></button>`).join("")}</div>
      <footer><button class="ed-btn texte" data-t="">${_t("Annuler")}</button></footer></div>`);
    voile.onclick = async (ev) => {
      const b = ev.composedPath().find((n) => n.dataset?.t != null);
      if (ev.target !== voile && !b) return;
      voile.remove();
      const t = b?.dataset.t;
      if (!t) return;
      const p = { type: t };
      if (t === "entite") { p.entite = await this.choisirEntite({ titre: _t("Puce : choisir une entité"), obligatoire: true }); if (!p.entite) return; }
      this.commit(() => { const L = this._puces(true); L.push(p); this.sel = { type: "puce", i: L.length - 1 }; });
    };
    this.R.querySelector("ha-card").append(voile);
  }

  // glisser-déposer depuis les panneaux d'information : cote / i = destination (i Infinity = à la fin)
  deplacerWidget(src, cote, i) {
    const l = this._wl(src);
    if (!l?.[src.i] || (src.cote === "fiche") !== (cote === "fiche")) return; // une fiche ne s'échange pas par glisser avec les panneaux
    let j = i === Infinity ? null : i;
    if (cote === src.cote && j != null && j > src.i) j--;
    if (cote === src.cote && (j ?? l.length - 1) === src.i) return;
    this.commit(() => {
      const [w] = l.splice(src.i, 1), dest = this._wl({ ...src, cote }, true), k = j == null ? dest.length : Math.min(j, dest.length);
      dest.splice(k, 0, w);
      this.sel = { ...src, cote, i: k };
    });
  }

  // ---------- nettoyer le plan ----------
  // analyse par le moteur (MaquetteNettoyage) → dialogue : aperçu, défauts cerclés (clic = zoom), corrections à cocher (pièce par
  // pièce pour les murs manquants et les passages) ; « Appliquer » = une seule action annulable, après une copie du plan d'avant
  nettoyerPlan() {
    const N = globalThis.MaquetteNettoyage, en = versMoteur(this.d), a = N.analyser(en);
    const opts = { ...N.OPTIONS_DEFAUT }, salles = { manquants: new Set(), passages: new Set() };
    const visibles = OPTIONS_NET.filter(([k]) => a.corrections[k].length && (k !== "arrondir" || a.arrondiUtile));
    const items = visibles.flatMap(([k]) => a.corrections[k]).map((x, i) => ({ ...x, i }));
    const piecesDe = (k) => [...new Set(items.filter((x) => x.option === k).flatMap((x) => x.pieces || [x.piece]))];
    const choix = () => {
      const o = { ...opts };
      for (const k of PAR_PIECE) { const t = piecesDe(k); o[k] = salles[k].size && salles[k].size === t.length ? true : salles[k].size ? [...salles[k]].filter((n) => n != null) : false; }
      return o;
    };
    const nDef = items.filter((x) => x.niveau === "defaut").length, nStyle = items.filter((x) => x.niveau === "style").length;
    const copies = this._copiesNettoyage().length;
    const lienCopies = copies ? `<button class="ed-btn texte" data-x="copies"><ha-icon icon="mdi:history"></ha-icon>${_t("Plans d'avant nettoyage ({n})", { n: copies })}</button>` : "";
    const voile = document.createElement("div");
    voile.className = "ed-voile ed-plein-tel";
    const fermer = () => { voile.remove(); window.removeEventListener("keydown", echap, true); };
    const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer(); } };
    window.addEventListener("keydown", echap, true);
    // plan propre, sans rien de facultatif : un message et rien à faire
    if (!visibles.length) {
      poserHTML(voile, `<div class="ed-dialogue ed-net ed-net-petit" role="dialog" aria-modal="true" aria-label="${esc(_t("Nettoyer le plan"))}"><header><h2>${_t("Nettoyer le plan")}</h2></header>
        <div class="ed-net-vide" role="status"><ha-icon icon="mdi:check-circle-outline"></ha-icon><b>${_t("Plan propre")}</b><span>${_t("Rien à corriger.")}</span></div>
        <footer>${lienCopies}<span class="ed-espace"></span><button class="ed-btn plein" data-x="fermer">${_t("Fermer")}</button></footer></div>`);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.x); if (ev.target === voile || b?.dataset.x === "fermer") fermer(); else if (b?.dataset.x === "copies") { fermer(); this.copiesNettoyage(); } };
      this.R.querySelector("ha-card").append(voile);
      voile.querySelector('[data-x="fermer"]').focus();
      return;
    }
    let vue = "avant", sel = null, vb = null, essai = N.nettoyer(en, choix());
    const plein = cadreNet(en);
    const resume = [nDef ? _t("{n} défaut|{n} défauts", { n: nDef }) : "", nStyle ? _t("{n} retouche de dessin|{n} retouches de dessin", { n: nStyle }) : ""].filter(Boolean).join(" · ");
    poserHTML(voile, `<div class="ed-dialogue ed-net" role="dialog" aria-modal="true" aria-label="${esc(_t("Nettoyer le plan"))}"><header><h2>${_t("Nettoyer le plan")}</h2>
        <div class="ed-aide">${esc(resume ? `${resume}. ${_t("Rien ne change avant « Appliquer ».")}` : _t("Rien ne change avant « Appliquer »."))}</div></header>
      <div class="ed-cat ed-net-corps"><div class="ed-net-apercu"><div class="ed-net-tete"><span class="ed-seg petit" role="group" aria-label="${esc(_t("Aperçu"))}">
          <button data-vue="avant" class="on" aria-pressed="true">${_t("Avant")}</button><button data-vue="apres" aria-pressed="false">${_t("Après")}</button></span><span class="ed-espace"></span>
          <button class="ib" data-x="tout" title="${esc(_t("Tout voir"))}" aria-label="${esc(_t("Tout voir"))}" hidden><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button></div>
        <div class="ed-net-w"></div><div class="ed-net-leg"></div></div>
        <div class="ed-net-form"></div></div>
      <footer>${lienCopies}<span class="ed-espace"></span><button class="ed-btn texte" data-x="fermer">${_t("Annuler")}</button><button class="ed-btn plein" data-x="appliquer"></button></footer></div>`);
    const W = voile.querySelector(".ed-net-w"), F = voile.querySelector(".ed-net-form"), leg = voile.querySelector(".ed-net-leg"), btnApp = voile.querySelector('[data-x="appliquer"]');
    const genre = (x) => (x.niveau === "defaut" ? "defaut" : x.niveau === "info" ? "info" : "style");
    const apercu = () => {
      const r = W.getBoundingClientRect(), cw = r.width || 600, ch = r.height || 400, v = vb || plein;
      const k = Math.max(v.w / cw, v.h / ch);
      const marques = vue === "avant" ? items.map((x) => ({ i: x.i, point: x.point, segment: x.type === "passage" || x.type === "absent" ? x.segment : null, genre: genre(x) }))
        : essai.operations.map((x, j) => ({ i: `f${j}`, point: x.point, genre: "fait" }));
      poserHTML(W, svgNettoyage(vue === "avant" ? en : essai.config, v, k, marques, sel));
      W.classList.toggle("ed-net-z", !!vb);
      voile.querySelector('[data-x="tout"]').hidden = !vb;
      poserHTML(leg, vue === "avant" ? `<span><i class="l-def"></i>${_t("Défaut")}</span><span><i class="l-style"></i>${_t("Retouche de dessin")}</span>${items.some((x) => genre(x) === "info") ? `<span><i class="l-info"></i>${_t("Sans mur")}</span>` : ""}`
        : `<span><i class="l-fait"></i>${_t("{n} correction|{n} corrections", { n: essai.operations.length })}</span>`);
    };
    // zoom sur un défaut (animé, sauf mouvement réduit) ; null = tout le plan
    const zoomer = (cible) => {
      const r = W.getBoundingClientRect(), ratio = (r.height || 400) / (r.width || 600), de = vb || plein;
      let vers = null;
      if (cible) {
        const L = cible.segment ? Math.hypot(cible.segment[2] - cible.segment[0], cible.segment[3] - cible.segment[1]) : 0, w = Math.max(300, L + 160, 300 / ratio);
        vers = { x: cible.point[0] - w / 2, y: cible.point[1] - (w * ratio) / 2, w, h: w * ratio };
      }
      const fin = vers || plein;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { vb = vers; return apercu(); }
      const t0 = performance.now(), D = 220, ease = (t) => 1 - (1 - t) ** 3;
      const pas = (t) => {
        const u = ease(Math.min(1, (t - t0) / D));
        vb = { x: de.x + (fin.x - de.x) * u, y: de.y + (fin.y - de.y) * u, w: de.w + (fin.w - de.w) * u, h: de.h + (fin.h - de.h) * u };
        apercu();
        if (u < 1) requestAnimationFrame(pas); else { vb = vers; apercu(); }
      };
      requestAnimationFrame(pas);
    };
    const ouverts = new Set();
    const formulaire = () => {
      const ligne = ([k, lib, sous]) => {
        const L = items.filter((x) => x.option === k), on = PAR_PIECE.has(k) ? salles[k].size > 0 : !!opts[k];
        const t = PAR_PIECE.has(k) ? piecesDe(k) : [], partiel = PAR_PIECE.has(k) && salles[k].size > 0 && salles[k].size < t.length;
        const nb = (n) => L.filter((x) => (x.pieces || [x.piece]).includes(n)).length;
        return `<div class="ed-net-opt"><label class="ed-coche"><input type="checkbox" data-o="${k}" ${on ? "checked" : ""} ${partiel ? 'data-partiel="1"' : ""}>
            <span class="n"><span>${_t(lib)}</span><small>${_t(sous)}</small></span><span class="ed-net-nb">${L.length}</span></label>
          ${t.length > 1 || (t.length && PAR_PIECE.has(k)) ? `<div class="ed-puces ed-net-salles">${t.map((n, j) => `<button type="button" data-salle="${k}:${j}" class="${salles[k].has(n) ? "on" : ""}" aria-pressed="${salles[k].has(n)}">${esc(n ?? _t("Pièce sans nom"))} · ${nb(n)}</button>`).join("")}</div>` : ""}
          <details class="ed-net-det" data-det="${k}" ${ouverts.has(k) ? "open" : ""}><summary>${_t("Voir où")}</summary><div class="ed-net-liste">${L.map((x) => `<button type="button" data-d="${x.i}" class="${sel === x.i ? "on" : ""}">${esc(texteNet(x))}${x.piece ? `<small> · ${esc(x.piece)}</small>` : ""}</button>`).join("")}</div></details></div>`;
      };
      const parDefaut = visibles.filter(([k]) => N.OPTIONS_DEFAUT[k]), autres = visibles.filter(([k]) => !N.OPTIONS_DEFAUT[k]);
      poserHTML(F, (a.propre ? `<div class="ed-net-propre" role="status"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span><b>${_t("Plan propre")}</b>${_t("Rien à corriger. Options facultatives :")}</span></div>` : "")
        + parDefaut.map(ligne).join("") + (autres.length && parDefaut.length ? `<h4>${_t("Facultatif")}</h4>` : "") + autres.map(ligne).join(""));
      F.querySelectorAll("[data-partiel]").forEach((i) => { i.indeterminate = true; });
      const n = essai.operations.length;
      btnApp.textContent = n ? _t("Appliquer · {n}", { n }) : _t("Appliquer");
      btnApp.disabled = !n;
    };
    const recalculer = () => { essai = N.nettoyer(en, choix()); formulaire(); apercu(); };
    const choisir = (i) => {
      const x = items.find((y) => String(y.i) === String(i));
      if (!x) return;
      if (sel === x.i) { sel = null; formulaire(); return zoomer(null); }
      sel = x.i;
      if (vue !== "avant") { vue = "avant"; voile.querySelectorAll("[data-vue]").forEach((b) => { b.classList.toggle("on", b.dataset.vue === "avant"); b.setAttribute("aria-pressed", b.dataset.vue === "avant"); }); }
      ouverts.add(x.option);
      formulaire();
      zoomer(x);
    };
    voile.addEventListener("toggle", (ev) => { const d = ev.target?.dataset?.det; if (d) ev.target.open ? ouverts.add(d) : ouverts.delete(d); }, true);
    voile.onchange = (ev) => {
      const k = ev.target?.dataset?.o;
      if (!k) return;
      if (PAR_PIECE.has(k)) salles[k] = ev.target.checked ? new Set(piecesDe(k)) : new Set();
      else opts[k] = ev.target.checked;
      recalculer();
    };
    voile.onclick = (ev) => {
      if (ev.target === voile) return fermer();
      const ch = ev.composedPath(), b = ch.find((n) => n.dataset?.x || n.dataset?.vue || n.dataset?.salle || n.dataset?.d != null);
      if (!b) { if (vb && ch.includes(W)) zoomer(null); return; }
      if (b.dataset.d != null) {
        // un repère de l'aperçu « Après » (correction faite) ne mène à rien de plus : on recadre seulement
        if (String(b.dataset.d).startsWith("f")) { const o = essai.operations[+b.dataset.d.slice(1)]; return o && zoomer(vb ? null : { point: o.point }); }
        return choisir(b.dataset.d);
      }
      if (b.dataset.vue) {
        vue = b.dataset.vue;
        voile.querySelectorAll("[data-vue]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
        return apercu();
      }
      if (b.dataset.salle) {
        const [k, j] = b.dataset.salle.split(":"), n = piecesDe(k)[+j];
        salles[k].has(n) ? salles[k].delete(n) : salles[k].add(n);
        return recalculer();
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "tout") { sel = null; formulaire(); return zoomer(null); }
      if (x === "copies") { fermer(); return this.copiesNettoyage(); }
      if (x === "appliquer") { fermer(); this.appliquerNettoyage(choix()); }
    };
    this.R.querySelector("ha-card").append(voile);
    formulaire();
    apercu();
    // la taille de l'aperçu n'est connue qu'une fois le dialogue affiché (et change avec la fenêtre)
    const ro = new ResizeObserver(() => { if (!voile.isConnected) return ro.disconnect(); apercu(); });
    ro.observe(W);
    btnApp.disabled ? voile.querySelector('[data-x="fermer"]').focus() : btnApp.focus();
  }

  // applique les corrections choisies : copie du plan d'avant gardée dans ce navigateur, puis une seule action annulable
  appliquerNettoyage(options = {}) {
    const N = globalThis.MaquetteNettoyage, r = N.nettoyer(versMoteur(this.d), options), n = r.operations.length;
    if (!n) return this.snack(_t("Plan propre"));
    const garde = this._garderCopieNettoyage(n), res = depuisMoteur(this.d, r.config);
    this.commit(() => {
      this.d.pieces = res.pieces;
      if (this.d.ouvertures || res.ouvertures.length) this.d.ouvertures = res.ouvertures;
      if (this.d.murs || res.murs.length) this.d.murs = res.murs;
      this.sel = null; this.multi.clear();
    });
    this.snack(garde ? _t("{n} correction|{n} corrections", { n }) : `${_t("{n} correction|{n} corrections", { n })} · ${_t("copie d'avant non gardée : stockage du navigateur plein")}`, _t("Annuler##defaire"), this._annulation(), 10000);
    return n;
  }
  // copie des clés que le nettoyage peut toucher, au format public (anglais) : rooms, walls, openings
  _instantaneNettoyage(n) {
    const o = {};
    for (const k of ["pieces", "murs", "ouvertures"]) if (Object.hasOwn(this.d, k)) o[k] = this.d[k];
    return globalThis.MaquetteNettoyage.instantane(versAnglais(clone(o)), n);
  }
  _garderCopieNettoyage(n) {
    try {
      const id = this._ident(), inst = this._instantaneNettoyage(n);
      this._ecrireVersions(id, this._versions(id), [{ t: Date.now(), nettoyage: n, cles: inst.cles, en: 1 }, ...this._copiesNettoyage(id)]);
      return true;
    } catch (e) { return false; }
  }
  // remet pièces, murs et ouvertures d'une copie d'avant nettoyage (une action annulable)
  restaurerNettoyage(j = 0) {
    const v = this._copiesNettoyage()[j];
    if (!v) return;
    const back = customElements.get("maquette-card").normaliser({ pieces: [], ...depuisAnglais({ ...v.cles }) });
    this.commit(() => {
      for (const [k, e] of [["pieces", "rooms"], ["murs", "walls"], ["ouvertures", "openings"]]) {
        if (Object.hasOwn(v.cles, e)) this.d[k] = back[k];
        else if (k === "pieces") this.d.pieces = [];
        else delete this.d[k];
      }
      this.sel = null; this.multi.clear();
    });
    this.snack(_t("Plan d'avant nettoyage restauré."), _t("Annuler##defaire"), this._annulation(), 10000);
  }
  async _copierTexte(t) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) { /* refusé : repli ci-dessous */ }
    const ta = document.createElement("textarea");
    ta.value = t; ta.style.cssText = "position:fixed;left:0;top:0;opacity:0";
    this.R.querySelector("ha-card").append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* indisponible */ }
    ta.remove();
    return ok;
  }
  // « Restaurer un plan d'avant nettoyage » : les 3 dernières copies de ce navigateur, aperçu, restauration ou copie en YAML (autre appareil)
  copiesNettoyage() {
    const copies = this._copiesNettoyage();
    if (!copies.length) return this.snack(_t("Aucun plan d'avant nettoyage dans ce navigateur."));
    let j = 0;
    const voile = document.createElement("div");
    voile.className = "ed-voile ed-plein-tel";
    const date = (t) => new Date(t).toLocaleString(_loc(), { dateStyle: "short", timeStyle: "short" });
    poserHTML(voile, `<div class="ed-dialogue ed-net" role="dialog" aria-modal="true" aria-label="${esc(_t("Plans d'avant nettoyage"))}"><header><h2>${_t("Plans d'avant nettoyage")}</h2>
        <div class="ed-aide">${_t("Les 3 derniers, gardés dans ce navigateur. « Restaurer » remplace pièces, murs et ouvertures (annulable).")}</div></header>
      <div class="ed-cat ed-net-corps"><div class="ed-net-apercu"><div class="ed-net-w"></div></div>
        <div class="ed-versions" role="listbox" aria-label="${esc(_t("Plans d'avant nettoyage"))}">${copies.map((v, i) => `<button type="button" role="option" data-c="${i}" aria-selected="${i === 0}" class="${i === 0 ? "on" : ""}"><span>${esc(date(v.t))}<small> · ${_t("{n} correction|{n} corrections", { n: v.nettoyage })}</small></span></button>`).join("")}</div></div>
      <footer><button class="ed-btn texte" data-x="yaml"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copier le plan d'avant (YAML)")}</button><span class="ed-espace"></span>
        <button class="ed-btn texte" data-x="fermer">${_t("Fermer")}</button><button class="ed-btn plein" data-x="restaurer"><ha-icon icon="mdi:history"></ha-icon>${_t("Restaurer")}</button></footer></div>`);
    const W = voile.querySelector(".ed-net-w");
    const apercu = () => {
      const c = { rooms: copies[j].cles.rooms || [], walls: copies[j].cles.walls || [], openings: copies[j].cles.openings || [] }, v = cadreNet(c), r = W.getBoundingClientRect();
      poserHTML(W, svgNettoyage(c, v, Math.max(v.w / (r.width || 600), v.h / (r.height || 400)), [], null));
    };
    const fermer = () => { voile.remove(); window.removeEventListener("keydown", echap, true); };
    const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer(); } };
    window.addEventListener("keydown", echap, true);
    voile.onclick = async (ev) => {
      if (ev.target === voile) return fermer();
      const b = ev.composedPath().find((n) => n.dataset?.x || n.dataset?.c != null);
      if (!b) return;
      if (b.dataset.c != null) {
        j = +b.dataset.c;
        voile.querySelectorAll("[data-c]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
        return apercu();
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "restaurer") { fermer(); return this.restaurerNettoyage(j); }
      if (x === "yaml") {
        const ok = await this._copierTexte(versYaml(copies[j].cles) + "\n");
        this.snack(ok ? _t("Plan d'avant copié (YAML : rooms, walls, openings).") : _t("Copie refusée par le navigateur."));
      }
    };
    this.R.querySelector("ha-card").append(voile);
    apercu();
    const ro = new ResizeObserver(() => { if (!voile.isConnected) return ro.disconnect(); apercu(); });
    ro.observe(W);
    voile.querySelector('[data-x="restaurer"]').focus();
  }

  // ---------- export / import ----------
  exporter() {
    let format = this._format || "yaml";
    const nomFichier = () => `plan-${(this.d.id || "maison").replace(/[^\w-]+/g, "-")}.${format === "json" ? "json" : "yaml"}`;
    const texte = () => { const o = versAnglais(this.d); return format === "json" ? JSON.stringify(o, null, 2) : versYaml(o) + "\n"; };
    const voile = document.createElement("div");
    voile.className = "ed-voile";
    poserHTML(voile, `<div class="ed-dialogue large" role="dialog" aria-modal="true"><header><h2>${_t("Exporter / importer le plan")}</h2>
        <div class="ed-aide">${tactile() ? _t("Le plan complet. « Importer » remplace le plan en cours (annulable).") : _t("Le plan complet. « Importer » remplace le plan en cours (Ctrl+Z pour annuler).")}</div>
        <span class="ed-seg petit" style="margin-top:12px">${["yaml", "json"].map((f) => `<button data-f="${f}" class="${f === format ? "on" : ""}">${f.toUpperCase()}</button>`).join("")}</span></header>
      <div class="ed-cat">${(() => { const vs = this._versions(); if (!vs.length) return "";
          const res = (c) => { const w = Object.values(c?.panels || {}).flat().length; return _t("{p} pièces, {a} appareils, {w} widgets", { p: (c?.rooms || []).length, a: (c?.badges || []).length, w }); };
          return `<details class="ed-avance ed-versions-bloc"><summary>${_t("Versions précédentes ({n}) : reprendre un plan enregistré avant", { n: vs.length })}</summary><div class="ed-versions">${vs.map((v, j) => `<button data-v="${j}"><span>${_t("Remplacée le {date}", { date: new Date(v.t).toLocaleString(_loc(), { dateStyle: "short", timeStyle: "medium" }) })}<small> · ${res(v.config)}</small></span><span>${_t("Charger")}</span></button>`).join("")}</div></details>`; })()}
        <textarea class="ed-code" spellcheck="false" aria-label="${_t("Plan au format texte")}"></textarea><div class="ed-erreur" hidden></div></div>
      <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-x="copier"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copier")}</button>
        <button class="ed-btn texte" data-x="telecharger"><ha-icon icon="mdi:download"></ha-icon>${_t("Télécharger")}</button>
        <button class="ed-btn texte" data-x="ouvrir"><ha-icon icon="mdi:folder-open-outline"></ha-icon>${_t("Ouvrir un fichier…")}</button>
        <span style="flex:1"></span><button class="ed-btn texte" data-x="fermer">${_t("Fermer")}</button><button class="ed-btn plein" data-x="importer"><ha-icon icon="mdi:import"></ha-icon>${_t("Importer")}</button>
        <input type="file" accept=".yaml,.yml,.json,application/json,text/yaml" hidden></footer></div>`);
    const ta = voile.querySelector("textarea"), err = voile.querySelector(".ed-erreur"), fichier = voile.querySelector("input[type=file]");
    const erreur = (m) => { err.hidden = !m; err.textContent = m || ""; };
    ta.value = texte();
    const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer(); } };
    window.addEventListener("keydown", echap, true);
    const fermer = () => { voile.remove(); window.removeEventListener("keydown", echap, true); };
    fichier.onchange = async () => {
      const f = fichier.files?.[0];
      if (!f) return;
      ta.value = await f.text();
      format = /\.json$/i.test(f.name) || /^\s*[{[]/.test(ta.value) ? "json" : "yaml";
      voile.querySelectorAll("[data-f]").forEach((b) => b.classList.toggle("on", b.dataset.f === format));
      erreur("");
    };
    voile.onclick = (ev) => {
      if (ev.target === voile) return fermer();
      const b = ev.composedPath().find((n) => n.dataset?.f || n.dataset?.x || n.dataset?.v);
      if (!b) return;
      if (b.dataset.v) {
        const v = this._versions()[+b.dataset.v];
        ta.value = format === "json" ? JSON.stringify(v.config, null, 2) : versYaml(v.config) + "\n";
        ta.scrollTop = 0; erreur("");
        return this.snack(_t("Version chargée dans la zone de texte : « Importer » pour la reprendre."));
      }
      if (b.dataset.f) {
        format = this._format = b.dataset.f;
        voile.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === b));
        ta.value = texte(); erreur("");
        return;
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "ouvrir") return fichier.click();
      if (x === "copier") {
        const ok = () => this.snack(_t("Plan copié dans le presse-papiers."));
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(ta.value).then(ok, () => erreur(_t("Copie refusée par le navigateur : sélectionne le texte et copie-le.")));
        ta.select();
        return document.execCommand("copy") ? ok() : erreur(_t("Copie impossible : sélectionne le texte et copie-le."));
      }
      if (x === "telecharger") {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ta.value], { type: format === "json" ? "application/json" : "text/yaml" }));
        a.download = nomFichier();
        this.R.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        return;
      }
      if (x === "importer") {
        let o;
        const rap = {};
        try { o = this._lirePlan(ta.value, rap); } catch (e) { return erreur(e.message || String(e)); }
        // type, id et clés du tableau de bord (placement, visibilité, card_mod) : ceux de cette carte, jamais ceux du fichier
        const ignorees = CLES_HA.filter((k) => Object.hasOwn(o, k) && canon({ v: o[k] }) !== canon({ v: this.d[k] }));
        for (const k of CLES_HA) { delete o[k]; if (Object.hasOwn(this.d, k)) o[k] = this.d[k]; }
        o = { ...o, type: this.d.type || "custom:maquette-card", ...(this.d.id != null ? { id: this.d.id } : {}) };
        const appliquer = () => {
          fermer();
          this.commit(() => { this._applique(JSON.stringify(o)); this.sel = null; this.multi.clear(); });
          this.recadrer();
          this.snack(_t("Plan importé : « Enregistrer » pour le garder, Ctrl+Z pour revenir."), _t("Annuler"), this._annulation(), 10000);
        };
        // même plan que celui en cours (aller-retour) : rien à vérifier ; sinon le récapitulatif d'abord
        if (canon(o) === canon(this.d)) return appliquer();
        return this._recapImport(o, { ...rap, ignorees }).then((oui) => { if (oui) appliquer(); });
      }
    };
    this.R.querySelector("ha-card").append(voile);
    ta.focus(); ta.setSelectionRange(0, 0); ta.scrollTop = 0;
  }

  _lirePlan(txt, rap = {}) {
    if (!txt.trim()) throw new Error(_t("Rien à importer : colle un plan ou ouvre un fichier."));
    if (txt.length > MAX_IMPORT) throw new Error(_t("Plan trop gros : {n} Mo, au plus {max} Mo.", { n: fmt(txt.length / 1e6, 1), max: fmt(MAX_IMPORT / 1e6, 0) }));
    let o;
    try { o = /^\s*[{[]/.test(txt) ? JSON.parse(txt) : jsyaml.load(txt, { schema: jsyaml.CORE_SCHEMA }); } catch (e) { throw new Error(_t("Lecture impossible : {err}", { err: (e.message || e).toString().split("\n")[0] })); }
    verifierTaille(o);
    if (Array.isArray(o) && o.length === 1) o = o[0];
    if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error(_t("Le plan doit être un objet (clés rooms, walls, openings…)."));
    if (o.type && !TYPES_CARTE.includes(o.type)) throw new Error(_t("Ce n'est pas un plan : type « {type} ».", { type: o.type }));
    const fr = CLES_FR.filter((k) => Object.hasOwn(o, k));
    if (fr.length) throw new Error(_t("Ancien format français (clés {cles}) : ce plan n'est plus lu tel quel. Convertis-le aux clés anglaises (rooms, walls, openings…), voir https://github.com/TooMuhtsh/maquette-card/blob/main/CHANGELOG.md#former-french-keys, puis importe-le.", { cles: `${fr.slice(0, 4).join(", ")}${fr.length > 4 ? "…" : ""}` }));
    for (const k of ["rooms", "walls", "fences", "openings", "badges", "texts", "templates"]) if (o[k] != null && !Array.isArray(o[k])) throw new Error(_t("« {k} » doit être une liste.", { k }));
    if (o.summary != null && typeof o.summary !== "boolean" && !Array.isArray(o.summary)) throw new Error(_t("« summary » doit être une liste de puces (ou true / false)."));
    if (o.panels != null && (typeof o.panels !== "object" || Array.isArray(o.panels))) throw new Error(_t("« panels » doit contenir left / right."));
    for (const [j, p] of (o.rooms || []).entries()) if (!Array.isArray(p?.poly) || p.poly.length < 3) throw new Error(_t("Pièce {n} ({nom}) : « poly » doit avoir au moins 3 sommets.", { n: j + 1, nom: p?.name || _t("sans nom") }));
    o = depuisAnglais({ rooms: [], ...o });
    // même lecture que la carte (booléens en texte, meubles, éléments sans coordonnées ignorés, valeurs invalides retirées)
    return customElements.get("maquette-card").normaliser(o, rap);
  }

  // ---------- récapitulatif de sécurité d'un import ----------
  // ce que le plan importé peut commander (boutons des pièces et leur service, widgets qui commandent, lignes « Activer »),
  // ses liens « Plus d'infos », ce qui a été retiré car invalide et les clés du tableau de bord ignorées ; true = importer
  _analyseImport(c) {
    const K = customElements.get("maquette-card"), hass = this.hass, services = [], commandes = new Map(), liens = new Set();
    for (const p of c.pieces || []) for (const a of Array.isArray(p?.actions) ? p.actions : []) {
      if (!a || typeof a.action !== "string" || !a.action.includes(".")) continue;
      const [dom, svc] = a.action.split("."), piece = a.cible === "piece", ents = piece ? null : typeof a.cible === "string" && a.cible ? [a.cible] : [];
      services.push({ nom: a.nom || "", piece: p.nom || "", service: a.action, cible: piece ? _t("toute la pièce") : a.cible || "", sensible: K.serviceSensible(hass, dom, svc, ents), confirme: a.confirmer === true });
    }
    const voir = (l) => (Array.isArray(l) ? l : []).forEach((w) => {
      if (!w || typeof w !== "object") return;
      if (["commande", "serrure", "thermostat"].includes(w.type) && typeof w.entite === "string" && w.entite) commandes.set(w.entite, typeWidgetEn(w.type));
      for (const x of [...(Array.isArray(w.lignes) ? w.lignes : []), ...(Array.isArray(w.entites) ? w.entites : [])]) {
        const e = typeof x === "string" ? x : x?.entite;
        if (typeof e === "string" && /^(script|scene|button|input_button)\./.test(e) && !commandes.has(e)) commandes.set(e, _t("Activer##lancer"));
      }
    });
    for (const x of [c, ...(c.pieces || [])]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of ["meubles", "ouvertures", "points"]) for (const o of c[k] || []) {
      voir(o?.fiche?.widgets);
      const pi = o?.fiche?.plus_infos;
      if (typeof pi === "string" && /^(\/|https?:)/i.test(pi)) liens.add(pi);
    }
    for (const m of c.modeles || []) { if (m?.genre === "widget") voir([m.objet]); voir(m?.objets); voir(m?.objet?.fiche?.widgets); }
    return { services, commandes: [...commandes], liens: [...liens] };
  }
  _recapImport(c, rap) {
    const { services, commandes, liens } = this._analyseImport(c), retires = rap.retires || [], ignorees = rap.ignorees || [];
    const nW = [c, ...(c.pieces || [])].reduce((n, x) => n + (x?.panneaux?.gauche?.length || 0) + (x?.panneaux?.droite?.length || 0), 0);
    const plafond = (l, f) => `${l.slice(0, 30).map(f).join("")}${l.length > 30 ? `<li><small>${_t("… et {n} autres", { n: l.length - 30 })}</small></li>` : ""}`;
    const bloc = (ic, titre, n, corps) => `<section class="ed-recap-s"><h4><ha-icon icon="${ic}"></ha-icon>${esc(titre)} (${n})</h4>${corps}</section>`;
    const rien = !services.length && !commandes.length && !liens.length && !retires.length && !rap.ignores && !ignorees.length;
    return new Promise((fin) => {
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue large ed-recap" role="alertdialog" aria-modal="true" aria-labelledby="ed-recap-t" aria-describedby="ed-recap-d">
        <header><h2 id="ed-recap-t">${_t("Vérifier avant d'importer")}</h2>
          <div class="ed-aide" id="ed-recap-d">${esc(_t("Pièces {p} · Ouvertures {o} · Appareils {a} · Meubles {m} · Widgets {w} · Modèles {t}", { p: (c.pieces || []).length, o: (c.ouvertures || []).length, a: (c.points || []).length, m: (c.meubles || []).length, w: nW, t: (c.modeles || []).length }))}</div></header>
        <div class="ed-cat">
          ${services.length ? bloc("mdi:gesture-tap-button", _t("Boutons des pièces : services appelés"), services.length, `<ul>${plafond(services, (x) => `<li><span><b>${esc(x.nom || _t("sans nom"))}</b>${x.piece ? ` · ${esc(x.piece)}` : ""}</span>
            <small><code>${esc(x.service)}</code>${x.cible ? ` → ${esc(x.cible)}` : ""}</small>${x.sensible || x.confirme ? `<span class="ed-sensible"><ha-icon icon="mdi:shield-alert-outline"></ha-icon>${_t("Confirmation à chaque appui")}</span>` : ""}</li>`)}</ul>`) : ""}
          ${commandes.length ? bloc("mdi:remote", _t("Entités commandées par les widgets"), commandes.length, `<ul>${plafond(commandes, ([e, t]) => `<li><span><b>${esc(this.carte._nom(e))}</b></span><small>${esc(e)} · ${esc(t)}</small></li>`)}</ul>`) : ""}
          ${liens.length ? bloc("mdi:open-in-new", _t("Liens « Plus d'infos »"), liens.length, `<ul>${plafond(liens, (u) => `<li><code>${esc(u)}</code></li>`)}</ul>`) : ""}
          ${retires.length || rap.ignores ? bloc("mdi:delete-sweep-outline", _t("Retiré car invalide"), retires.length + (rap.ignores || 0), `${rap.ignores ? `<p>${_t("{n} élément sans coordonnées valides|{n} éléments sans coordonnées valides", { n: rap.ignores })}</p>` : ""}<ul>${plafond(retires, (r) => `<li><code>${esc(r)}</code></li>`)}</ul>`) : ""}
          ${ignorees.length ? bloc("mdi:view-dashboard-outline", _t("Clés du tableau de bord ignorées"), ignorees.length, `<p>${esc(ignorees.join(", "))} : ${_t("celles de cette carte sont gardées.")}</p>`) : ""}
          ${rien ? `<p class="ed-aide">${_t("Aucun service, aucune commande, aucun lien, rien de retiré.")}</p>` : `<p class="ed-aide">${_t("Les actions sensibles (déverrouiller, ouvrir un garage, désarmer, lancer un script…) demandent toujours une confirmation.")}</p>`}
        </div>
        <footer><button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button><button class="ed-btn plein" data-r="importer"><ha-icon icon="mdi:import"></ha-icon>${_t("Importer")}</button></footer></div>`);
      const finir = (r) => { voile.remove(); window.removeEventListener("keydown", echap, true); fin(r); };
      const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); finir(false); } else if (ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue")); };
      window.addEventListener("keydown", echap, true);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) finir(b?.dataset.r === "importer"); };
      this.R.querySelector("ha-card").append(voile);
      voile.querySelector('[data-r="annuler"]').focus();
    });
  }

  // ---------- divers ----------
  // action : un libellé (avec fn) ou une liste [[libellé, fn], …]
  snack(txt, action, fn, duree = 5000) {
    this.R.querySelector(".ed-snack")?.remove();
    const s = document.createElement("div"), actions = Array.isArray(action) ? action : action ? [[action, fn]] : [];
    if (Array.isArray(action)) duree = fn ?? duree;
    const erreur = duree === "erreur";
    if (erreur) duree = 15000;
    s.className = `ed-snack${erreur ? " erreur" : ""}`;
    s.setAttribute("role", erreur ? "alert" : "status");
    poserHTML(s, `<span>${esc(txt)}</span>${actions.map(([n]) => `<button>${esc(n)}</button>`).join("")}`);
    s.querySelectorAll("button").forEach((b, j) => { b.onclick = () => { s.remove(); actions[j][1](); }; });
    this.R.querySelector("ha-card").append(s);
    setTimeout(() => s.remove(), duree);
  }

  // ---------- bulles d'aide ⓘ ----------
  // un seul comportement pour tous les boutons .ed-i (panneaux, modale ⚙, dialogues) : infobulle au survol de la souris (après un court
  // délai) ou au focus clavier ; un clic (ou un toucher) l'épingle sous forme de popover, un 2e clic, Échap, un toucher ailleurs,
  // un défilement ou un nouveau rendu la ferment. Le texte est aussi dans aria-description (lu sans ouvrir la bulle).
  _cablerAides() {
    const R = this.R, bouton = (e) => e.composedPath().find((n) => n instanceof HTMLElement && n.classList.contains("ed-i"));
    let attente = 0;
    const E = (this._aideEv = {
      over: (e) => { if (e.pointerType !== "mouse") return; const b = bouton(e); if (!b || this._tip?.b === b) return; clearTimeout(attente); attente = setTimeout(() => { if (b.matches(":hover")) this._montrerAide(b, false); }, 300); },
      out: (e) => { if (e.pointerType !== "mouse") return; const b = bouton(e); if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return; clearTimeout(attente); if (this._tip?.b === b && !this._tip.epingle) this._cacherAide(); },
      focusin: (e) => { const b = bouton(e); if (b && !this._focusSansAide && b.matches(":focus-visible") && this._tip?.b !== b) this._montrerAide(b, false); },
      focusout: (e) => { const b = bouton(e); if (b && this._tip?.b === b && !this._tip.epingle) this._cacherAide(); },
      clic: (e) => { const b = bouton(e); if (!b) return; e.preventDefault(); e.stopPropagation(); if (Date.now() - (this._depliee || 0) < 600) return; if (this._tip?.b === b && this._tip.epingle) this._cacherAide(); else this._montrerAide(b, true); },
      bas: (e) => { if (!this._tip) return; const ch = e.composedPath(); if (!ch.includes(this._tip.el) && !ch.includes(this._tip.b)) this._cacherAide(); },
      touche: (e) => { if (e.key !== "Escape" || !this._tip) return; e.preventDefault(); e.stopImmediatePropagation(); const b = this._tip.b; this._cacherAide(); if (b.isConnected) { this._focusSansAide = true; b.focus({ preventScroll: true }); this._focusSansAide = false; } },
      defile: (e) => { if (this._tip && !(e.target instanceof Node && this._tip.el.contains(e.target))) this._cacherAide(); },
      taille: () => this._cacherAide(),
    });
    R.addEventListener("pointerover", E.over); R.addEventListener("pointerout", E.out);
    R.addEventListener("focusin", E.focusin); R.addEventListener("focusout", E.focusout);
    R.addEventListener("click", E.clic, true); R.addEventListener("scroll", E.defile, true);
    window.addEventListener("pointerdown", E.bas, true); window.addEventListener("keydown", E.touche, true);
    window.addEventListener("scroll", E.defile, true); window.addEventListener("resize", E.taille);
  }
  _decablerAides() {
    const R = this.R, E = this._aideEv;
    if (!E) return;
    this._cacherAide();
    R.removeEventListener("pointerover", E.over); R.removeEventListener("pointerout", E.out);
    R.removeEventListener("focusin", E.focusin); R.removeEventListener("focusout", E.focusout);
    R.removeEventListener("click", E.clic, true); R.removeEventListener("scroll", E.defile, true);
    window.removeEventListener("pointerdown", E.bas, true); window.removeEventListener("keydown", E.touche, true);
    window.removeEventListener("scroll", E.defile, true); window.removeEventListener("resize", E.taille);
    this._aideEv = null;
  }
  // bulle sous son bouton (au-dessus s'il n'y a pas la place), dans l'écran ; epingle : ouverte par un clic, ne se ferme pas en sortant
  _montrerAide(b, epingle) {
    this._cacherAide();
    const txt = b.dataset.aide;
    if (!txt || !b.isConnected) return;
    const el = document.createElement("div");
    el.className = "ed-tip"; el.id = "ed-tip"; el.setAttribute("role", "tooltip");
    el.textContent = txt;
    this.R.querySelector("ha-card").append(el);
    const r = b.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, m = 8;
    const x = Math.max(m, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - m));
    const y = r.bottom + 8 + h > innerHeight - m && r.top - 8 - h > m ? r.top - 8 - h : Math.max(m, Math.min(r.bottom + 8, innerHeight - h - m));
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    b.setAttribute("aria-expanded", "true");
    this._tip = { b, el, epingle };
  }
  _cacherAide() {
    const t = this._tip;
    if (!t) return;
    this._tip = null;
    t.el.remove();
    t.b.setAttribute("aria-expanded", "false");
  }
  // rangée horizontale défilante (onglets, filtres) : dégradé du côté où il reste quelque chose à voir
  _indiceDefilement(el) {
    if (!el) return;
    const maj = () => {
      const deborde = el.scrollWidth > el.clientWidth + 2;
      el.classList.toggle("def-g", deborde && el.scrollLeft > 2);
      el.classList.toggle("def-d", deborde && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    el.addEventListener("scroll", maj, { passive: true });
    requestAnimationFrame(maj);
  }

  // consigne d'un outil : retirée dès que l'outil change ou que l'objet est posé
  _aide(txt) { this.snack(txt); this.R.querySelector(".ed-snack")?.classList.add("aide"); }
  _fermerAide() { this.R.querySelector(".ed-snack.aide")?.remove(); }

  recadrer() {
    this.carte._vue = null;
    this._boite(true);
    this.carte._construire();
  }

  // zone de dessin : le plan + 5 m de marge tout autour ; elle s'agrandit d'elle-même quand on dessine près du bord
  _boite(refaire = false, carte = this.carte) {
    const b = carte.bornes(), m = 500, voulu = { x0: b.x0 - m, y0: b.y0 - m, x1: b.x0 + b.W + m, y1: b.y0 + b.H + m }, f = carte._boxFige;
    if (refaire || !f) { carte._boxFige = { x0: voulu.x0, y0: voulu.y0, W: voulu.x1 - voulu.x0, H: voulu.y1 - voulu.y0 }; return true; }
    const x0 = Math.min(f.x0, voulu.x0), y0 = Math.min(f.y0, voulu.y0), x1 = Math.max(f.x0 + f.W, voulu.x1), y1 = Math.max(f.y0 + f.H, voulu.y1);
    if (x0 === f.x0 && y0 === f.y0 && x1 === f.x0 + f.W && y1 === f.y0 + f.H) return false;
    carte._boxFige = { x0, y0, W: x1 - x0, H: y1 - y0 };
    return true;
  }

  _cartesPlan(noeud, l = []) {
    if (!noeud || typeof noeud !== "object") return l;
    if (TYPES_CARTE.includes(noeud.type)) l.push(noeud);
    for (const v of Array.isArray(noeud) ? noeud : Object.values(noeud)) this._cartesPlan(v, l);
    return l;
  }

  // la carte à remplacer : par son id, sinon (carte sans id) celle dont la config est exactement celle ouverte
  _trouverCarte(cfg) {
    // les deux côtés passent par la normalisation de la carte (meubles, booléens, géométrie…) : une config corrigée à la lecture n'est pas un conflit
    const N = customElements.get("maquette-card")?.normaliser, interne = (c) => { try { return canon(N ? N(c) : { pieces: [], ...c }); } catch (e) { return canon({ pieces: [], ...c }); } };
    // cartes du dashboard : format public (anglais), relues comme la carte les lit ; l'original est déjà au format interne
    const norme = (c) => { try { return interne(depuisAnglais(c)); } catch (e) { return canon(c); } }, toutes = this._cartesPlan(cfg), orig = interne(this.original);
    if (this.original.id != null) {
      const l = toutes.filter((c) => c.id === this.original.id);
      if (l.length === 1) return { ref: l[0], conflit: norme(l[0]) !== orig };
      if (!l.length) return { erreur: "introuvable" };
      // carte dupliquée dans HA (même id) : on reconnaît la nôtre à son contenu et elle reçoit un nouvel id
      const m = l.filter((c) => norme(c) === orig);
      // copies identiques : écrire dans la première est sans conséquence, elle reçoit un nouvel id et les deux redeviennent distinctes
      return m.length ? { ref: m[0], conflit: false, nouvelId: true } : { erreur: _t("plusieurs cartes portent cet id et aucune n'a le contenu ouvert : recharge la page") };
    }
    const l = toutes.filter((c) => c.id == null && norme(c) === orig);
    if (l.length === 1) return { ref: l[0], conflit: false };
    if (l.length > 1) return { erreur: _t("plusieurs cartes identiques sans id") };
    return toutes.some((c) => c.id == null) ? { erreur: "modifiée", conflit: true } : { erreur: "introuvable" };
  }

  // 5 dernières versions enregistrées (avant écrasement), gardées dans ce navigateur : la carte telle qu'elle était dans le dashboard (format anglais, `en: 1` ;
  // les plus anciennes, en clés françaises, sont converties une fois au chargement de la carte)
  // La même clé garde aussi les 3 dernières copies d'avant nettoyage (`nettoyage: n`, `cles` : rooms, walls, openings), à part dans les listes.
  _toutesVersions(id) { try { const l = JSON.parse(localStorage.getItem(`maquette-versions:${id}`) || "[]"); return Array.isArray(l) ? l.filter((v) => v && typeof v === "object") : []; } catch (e) { return []; } }
  _versions(id = this._ident()) { return this._toutesVersions(id).filter((v) => !v.nettoyage); }
  _copiesNettoyage(id = this._ident()) { return this._toutesVersions(id).filter((v) => v.nettoyage && v.cles); }
  _ecrireVersions(id, versions, copies) { localStorage.setItem(`maquette-versions:${id}`, JSON.stringify([...versions.slice(0, 5), ...copies.slice(0, 3)])); }
  _garderVersion(id, config) {
    try { this._ecrireVersions(id, [{ t: Date.now(), config, en: 1 }, ...this._versions(id)], this._copiesNettoyage(id)); } catch (e) { /* stockage plein ou indisponible */ }
  }

  _dialogueConflit(message, ecrasable = true) {
    return new Promise((fin) => {
      const voile = document.createElement("div");
      voile.className = "ed-voile";
      poserHTML(voile, `<div class="ed-dialogue" role="alertdialog" aria-modal="true" style="width:min(460px,100%)"><header><h2>${_t("Plan modifié ailleurs")}</h2>
        <div class="ed-aide">${esc(message)}</div></header>
        <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="exporter">${_t("Exporter mon plan")}</button><button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button>
          ${ecrasable ? `<button class="ed-btn texte" data-r="ecraser" style="color:var(--md-error)">${_t("Écraser avec mon plan")}</button>` : ""}</footer></div>`);
      const fermer = (r) => { voile.remove(); window.removeEventListener("keydown", echap, true); fin(r); };
      const echap = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); fermer("annuler"); } };
      window.addEventListener("keydown", echap, true);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) fermer(b?.dataset.r || "annuler"); };
      this.R.querySelector("ha-card").append(voile);
    });
  }

  async enregistrer() {
    if (this.R.querySelector(".ed-voile") && this.modifie) return this.snack(_t("Ferme la fenêtre ouverte pour enregistrer."));
    if (!this.modifie || this._enCours) return;
    this._enCours = true;
    try { await this._enregistrer(); } finally { this._enCours = false; }
  }

  async _enregistrer() {
    const seg = decodeURIComponent(location.pathname.split("/")[1] || "");
    const url_path = !seg || seg === "lovelace" ? null : seg;
    try {
      const cfg = await this.hass.callWS({ type: "lovelace/config", url_path });
      // dashboard créé par notre stratégie « Plan de la maison » : on reprend la main (vues explicites) avant d'enregistrer
      if (cfg?.strategy && /^custom:(maquette|plan-maison)$/.test(cfg.strategy.type)) cfg = await customElements.get("ll-strategy-dashboard-maquette").generate(cfg.strategy, this.hass);
      else if (cfg?.strategy) throw new Error(_t("ce dashboard est généré automatiquement : prends le contrôle du dashboard dans HA pour pouvoir enregistrer"));
      let { ref, conflit, erreur, nouvelId } = this._trouverCarte(cfg);
      if (conflit) {
        const r = await this._dialogueConflit(ref ? _t("Le plan a changé ailleurs. Enregistrer écrasera ces changements.")
          : _t("La carte ouverte n'a plus la même configuration dans le dashboard et n'a pas d'id pour la retrouver. Exporte ton plan, recharge la page, puis réimporte-le."), !!ref);
        if (r === "exporter") return this.exporter();
        if (r !== "ecraser" || !ref) return;
      }
      if (!ref) throw new Error(erreur === "introuvable" ? _t("carte introuvable dans ce dashboard (aperçu, ou dashboard modifié) : recharge la page") : erreur);
      const avant = clone(ref);
      // une carte sans id (ou dupliquée avec le même id) en reçoit un, pour être retrouvée à coup sûr aux prochains enregistrements
      if (this.d.id == null || nouvelId) {
        try { localStorage.removeItem(this._cle()); } catch (e) { /* stockage indisponible */ }
        const ancien = this._ident(), copies = this._copiesNettoyage(ancien);
        this.d.id = `plan-${Math.random().toString(36).slice(2, 8)}`;
        // les copies d'avant nettoyage suivent la carte sous son nouvel id
        if (copies.length) try { this._ecrireVersions(this.d.id, this._versions(this.d.id), [...copies, ...this._copiesNettoyage(this.d.id)]); } catch (e) { /* stockage plein ou indisponible */ }
      }
      Object.keys(ref).forEach((k) => delete ref[k]);
      Object.assign(ref, versAnglais(this.d));
      const fige = JSON.stringify(this.d);
      // HA recrée la carte après l'enregistrement : la nouvelle instance rouvre l'éditeur au même endroit
      try { sessionStorage.setItem(`maquette-rouvrir:${this.d.id || "plan"}`, JSON.stringify({ sel: this.sel, grille: this.grille, t: Date.now() })); } catch (e) { /* stockage indisponible */ }
      await this.hass.callWS({ type: "lovelace/config/save", url_path, config: cfg });
      this._garderVersion(this.d.id, avant); // seulement après un enregistrement réussi
      this.original = JSON.parse(fige);
      this.externe = null;
      this.modifie = false;
      try { localStorage.removeItem(this._cle()); } catch (e) { /* stockage indisponible */ }
      this._barre();
      this.snack(_t("Plan enregistré."));
    } catch (e) {
      const m = String(e?.message || e?.code || e);
      const yaml = /yaml|not supported|unsupported/i.test(m), auto = e?.code === "config_not_found";
      this.snack(_t("Échec de l'enregistrement : {raison}", { raison: yaml ? _t("dashboard en mode YAML, à modifier dans ses fichiers (exporte le plan pour le copier)") : auto ? _t("dashboard généré automatiquement : prends-en le contrôle dans HA (⋮ → Modifier le dashboard)") : m }),
        [[_t("Réessayer"), () => this.enregistrer()], [_t("Exporter"), () => this.exporter()]], "erreur");
    }
  }

  async quitter() {
    if (this.modifie) {
      const ok = await new Promise((fin) => {
        const voile = document.createElement("div");
        voile.className = "ed-voile";
        poserHTML(voile, `<div class="ed-dialogue" role="alertdialog" style="width:min(380px,100%)"><header><h2>${_t("Quitter sans enregistrer ?")}</h2>
          <div class="ed-aide">${_t("Brouillon gardé dans ce navigateur.")}</div></header>
          <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="0">${_t("Continuer l'édition")}</button><button class="ed-btn texte" data-r="2" style="color:var(--md-error)">${_t("Abandonner les modifications")}</button>
            <button class="ed-btn texte" data-r="1">${_t("Quitter")}</button></footer></div>`);
        voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) { voile.remove(); fin(b?.dataset.r || "0"); } };
        this.R.querySelector("ha-card").append(voile);
      });
      if (ok === "0") return;
      if (ok === "2") try { localStorage.removeItem(this._cle()); } catch (e) { /* stockage indisponible */ }
    }
    // la carte n'a pas été recréée après l'enregistrement : la reprise prévue ne doit pas rouvrir l'éditeur qu'on quitte
    try { sessionStorage.removeItem(`maquette-rouvrir:${this.d.id || "plan"}`); } catch (e) { /* stockage indisponible */ }
    this.fermer();
  }

  fermer(silencieux) {
    this._decablerAides();
    window.removeEventListener("keydown", this._touche, true);
    window.removeEventListener("keyup", this._relache, true);
    window.removeEventListener("beforeunload", this._avantFermeture);
    window.removeEventListener("pointermove", this._suivre, true);
    window.removeEventListener("pointerdown", this._suivre, true);
    this.zone.removeEventListener("pointerleave", this._sortie);
    this.R.querySelector(".ed-bulle")?.remove();
    this.zone.removeEventListener("pointerdown", this._pd);
    this.zone.removeEventListener("pointermove", this._pm);
    this.zone.removeEventListener("dblclick", this._dbl);
    this.zone.removeEventListener("contextmenu", this._ctx);
    this.zone.classList.remove("dessin");
    this._fermerMenu();
    this.barre.remove(); this.panneau.remove(); this.poignee.remove(); this.style.remove();
    this.R.querySelector(".panneau-hote")?.classList.remove("replie", "vide");
    this.R.querySelectorAll(".ed-voile,.ed-mvoile,.ed-snack").forEach((n) => n.remove());
    this.vueParametres = false;
    const c = this.carte;
    c._editeur = null; c._boxFige = null;
    c._config = clone(this.externe || this.original);
    suivreLangue(c, c._config);
    if (silencieux) c._ok = false; else c._construire();
  }
}
