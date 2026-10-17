/*! Maquette v0.3.1 | MIT | https://github.com/TooMuhtsh/maquette-card */
/* Maquette : textes de l'interface en anglais et en français (une seule source de vérité, partagée par la carte, l'éditeur et la démo).
 * Les clés sont les phrases françaises : en français, _t rend la clé telle quelle (seules les exceptions sont dans FR) ;
 * en anglais, une clé absente du dictionnaire retombe sur le français (et la build échoue : voir build.mjs).
 * - interpolation : _t("Pièce {n}", { n: 3 }) ; les valeurs sont insérées telles quelles (à échapper par l'appelant si besoin) ;
 * - pluriels : « singulier|pluriel » choisi par p.n (français : pluriel au-delà de 1, comme « 0 volet baissé » ; anglais : pluriel sauf 1) ;
 * - contexte : un suffixe « ##contexte » distingue deux sens d'une même phrase française (il n'est jamais affiché) ;
 * - _tk("…") marque une clé dans une table (traduite à l'affichage par _t) : la build vérifie qu'elle est traduite.
 * Langue : option `language` (auto | en | fr), sinon celle du profil HA (hass.locale.language, hass.language), sinon la page
 * (document.documentElement.lang, navigator.language) ; fr* → français, tout le reste → anglais. Nombres et dates : locale HA (Intl).
 * Fichier en tête de dist/maquette-card.js (build.mjs) ; en développement, importé par src/maquette-card.js. */
const MaquetteI18n = (() => {
  const EN = {
    "{n} capteur indisponible|{n} capteurs indisponibles": "{n} sensor unavailable|{n} sensors unavailable",
    "Manuel": "Manual",
    "Éco": "Eco",
    "Confort": "Comfort",
    "Absence": "Away",
    "Sommeil": "Sleep",
    "Boost": "Boost",
    "Activité": "Activity",
    "Vacances": "Holiday",
    "Programme": "Schedule",
    "CO₂ du séjour": "Living room CO₂",
    "Luminosité du bureau": "Office illuminance",
    "Serrure de l'entrée": "Front door lock",
    "Fuite salle de bain": "Bathroom leak",
    "Verrouiller": "Lock",
    "Ouvrir##serrure": "Open",
    "Choisis la serrure (entité lock).": "Choose the lock (lock entity).",
    "Présence": "Presence",
    "jamais": "never",
    "à l'instant": "just now",
    "il y a {n} min": "{n} min ago",
    "il y a {n} h": "{n} h ago",
    "il y a {n} j": "{n} d ago",
    "Canapé": "Sofa",
    "Séjour": "Living room",
    "Canapé d'angle": "Corner sofa",
    "Fauteuil": "Armchair",
    "Table basse": "Coffee table",
    "Meuble TV": "TV unit",
    "Étagère": "Shelf",
    "Tapis": "Rug",
    "Plante": "Plant",
    "Table carrée": "Square table",
    "Repas": "Dining",
    "Table rectangulaire": "Rectangular table",
    "Table ronde": "Round table",
    "Chaise": "Chair",
    "Plan de travail": "Worktop",
    "Cuisine": "Kitchen",
    "Évier": "Sink",
    "Plaques de cuisson": "Hob",
    "Réfrigérateur": "Fridge",
    "Lave-linge": "Washing machine",
    "Lave-vaisselle": "Dishwasher",
    "Lit simple": "Single bed",
    "Chambre et bureau": "Bedroom and office",
    "Lit double": "Double bed",
    "Lit bébé": "Cot",
    "Armoire": "Wardrobe",
    "Commode": "Chest of drawers",
    "Bureau": "Desk",
    "Douche": "Shower",
    "Salle d'eau": "Bathroom",
    "Baignoire": "Bathtub",
    "Lavabo": "Washbasin",
    "WC": "Toilet",
    "Chaudière": "Boiler",
    "Technique": "Utilities",
    "Ballon d'eau chaude": "Water heater",
    "Espace nommé": "Named area",
    "Formes et espaces": "Shapes and areas",
    "Coin cuisine, coin bureau… : pointillés et un nom, sans capteur (ce n'est pas une pièce)": "Kitchen corner, desk corner…: dotted outline and a name, no sensor (not a room)",
    "Rectangle libre": "Rectangle",
    "N'importe quel meuble ou objet, avec un nom": "Any furniture or object, with a name",
    "Cercle libre": "Circle",
    "Escalier": "Stairs",
    "Table de nuit": "Bedside table",
    "Cheminée / poêle": "Fireplace / stove",
    "Radiateur": "Radiator",
    "Tableau électrique": "Electrical panel",
    "Box internet / NAS": "Router / NAS",
    "Borne de recharge": "EV charger",
    "Pompe à chaleur / clim (extérieur)": "Heat pump / AC (outdoor unit)",
    "Voiture": "Car",
    "Extérieur": "Outdoor",
    "Vélo": "Bike",
    "Arbre / arbuste": "Tree / shrub",
    "Piscine": "Pool",
    "Pergola": "Pergola",
    "Abri de jardin / cabanon": "Garden shed",
    "Pulsation": "Pulse",
    "Respiration (douce)": "Breathe (gentle)",
    "Clignotement": "Blink",
    "Halo lumineux": "Glow",
    "Onde": "Wave",
    "Défilement (traits, volets)": "Scroll (lines, shutters)",
    "Porte ou fenêtre ouverte": "Door or window open",
    "Volet en mouvement": "Shutter moving",
    "Pastille en alerte": "Badge in alert",
    "Lumière allumée": "Light on",
    "Appareil actif": "Device active",
    "Meuble connecté actif": "Connected furniture active",
    "Nuages": "Clouds",
    "Pluie": "Rain",
    "Averse": "Downpour",
    "Neige": "Snow",
    "Grêle": "Hail",
    "Brouillard": "Fog",
    "Orage": "Storm",
    "Vent": "Wind",
    "Nuit": "Night",
    "Soleil bas": "Low sun",
    "Trace (vient de changer)": "Trace (just changed)",
    "Flux d'énergie": "Energy flow",
    "Alerte": "Alert",
    "Personne dehors": "Person away",
    "Absent": "Away",
    "Fenêtre": "Window",
    "Porte": "Door",
    "Portail": "Gate",
    "Ouvrir": "Open",
    "Stop": "Stop",
    "Fermer": "Close",
    "Pièces": "Rooms",
    "Sous-zones": "Sub-areas",
    "Halos de lumière": "Light halos",
    "Meubles": "Furniture",
    "Limites": "Boundaries",
    "Murs": "Walls",
    "Ouvertures": "Openings",
    "Étiquettes des pièces": "Room labels",
    "Appareils": "Devices",
    "Textes": "Texts",
    "Ce plan vient d'être modifié ailleurs : à l'enregistrement, tu choisiras de garder ta version ou non.": "This plan was just changed elsewhere: when saving, you'll choose whether to keep your version.",
    "Exporter le mien": "Export mine",
    "Mon plan": "My plan",
    "Pièce": "Room",
    "Meuble": "Furniture",
    "Ouverture": "Opening",
    "Toute la maison": "Whole home",
    "Modifier le plan": "Edit plan",
    "Calques affichés": "Visible layers",
    "Zoomer": "Zoom in",
    "Dézoomer": "Zoom out",
    "Revoir la journée": "Replay the day",
    "Afficher": "Show",
    "Plan de la maison": "Floor plan",
    "Ajoute des entités": "Add entities",
    "Appartement de démonstration : états simulés, aucune commande n'atteint la maison": "Demo apartment: simulated states, no command reaches your home",
    "Démo · états simulés": "Demo · simulated states",
    "fermé": "closed",
    "ouvert": "open",
    "volet baissé": "shutter down",
    "Le plan est vide": "The plan is empty",
    "Pars des pièces de Home Assistant (avec leurs appareils), dessine les pièces, ou importe un plan déjà fait.": "Start from your Home Assistant areas (with their devices), draw the rooms, or import an existing plan.",
    "Démarrer avec mes pièces": "Start with my areas",
    "Dessiner une pièce": "Draw a room",
    "Importer un plan": "Import a plan",
    "Le plan n'est pas encore dessiné": "The plan hasn't been drawn yet",
    "Un administrateur peut le créer avec le bouton crayon de cette carte.": "An administrator can create it with this card's pencil button.",
    "Appareil": "Device",
    "Marche / arrêt": "On / off",
    "Fermer (Échap)": "Close (Esc)",
    "Appareil protégé : pas d'arrêt depuis le plan.": "Protected device: can't be turned off from the plan.",
    "Rallumer": "Turn back on",
    "Plus d'infos": "More info",
    "volet {n} %": "shutter {n}%",
    "indisponible": "unavailable",
    "Widget en erreur : {msg}": "Widget error: {msg}",
    "Aucun widget dans cette fiche.": "No widgets in this card.",
    "Basculer": "Toggle",
    "Ouverte": "Open",
    "Fermée": "Closed",
    "Script · ": "Script · ",
    "Activer": "Enable",
    "Activer##lancer": "Activate",
    "Changer la consigne": "Change the set point",
    "Activer la scène": "Activate the scene",
    "Activer l'automatisation": "Enable the automation",
    "Désactiver l'automatisation": "Disable the automation",
    "Automatisations": "Automations",
    "Aucun appareil placé dans cette pièce.": "No devices placed in this room.",
    "Ajouter un widget à la fiche": "Add a widget to the card",
    "Ajouter un widget": "Add widget",
    "Ajouter un widget (gauche)": "Add a widget (left)",
    "Ajouter un widget (droite)": "Add a widget (right)",
    "Fiche « {t} » : ce qui s'ouvre au toucher du meuble": "Card “{t}”: what opens when the furniture is tapped",
    "Fiche « {t} » : ce qui s'ouvre au toucher de l'ouverture": "Card “{t}”: what opens when the opening is tapped",
    "Fiche « {t} » : ce qui s'ouvre au toucher de la pastille": "Card “{t}”: what opens when the badge is tapped",
    "{nom} : {etat}": "{nom}: {etat}",
    "Aujourd'hui": "Today",
    "Demain": "Tomorrow",
    "En charge · {p} {u}": "Charging · {p} {u}",
    "Branchée": "Plugged in",
    "Débranchée": "Unplugged",
    "À l'arrêt": "Idle",
    "Autonomie": "Range",
    "Session": "Session",
    "Coût de la session": "Session cost",
    "Batterie non configurée.": "Battery not configured.",
    "Semaine": "Week",
    "Mois": "Month",
    "Année": "Year",
    "Type de widget inconnu : {type}": "Unknown widget type: {type}",
    "{sens} sur {n} min ({ecart})": "{sens} over {n} min ({ecart})",
    "En hausse": "Rising",
    "En baisse": "Falling",
    "Stable": "Stable",
    "Tendance indisponible": "Trend unavailable",
    " · variation forte": " · large change",
    "Moyenne intérieure": "Indoor average",
    "Aucune pièce n'a de capteur de température ou d'humidité.": "No room has a temperature or humidity sensor.",
    "Choisis le thermostat (entité climate).": "Choose the thermostat (climate entity).",
    "Chauffe": "Heating",
    "Refroidit": "Cooling",
    "Au repos": "Idle",
    "Arrêté": "Off",
    "Déshumidifie": "Drying",
    "Ventile": "Fan",
    "Mesurée": "Current",
    "Baisser la consigne": "Lower the setpoint",
    "Consigne": "Target",
    "Monter la consigne": "Raise the setpoint",
    "Indisponible": "Unavailable",
    "Choisis la cover à commander (volet, portail, porte de garage…).": "Choose the cover to control (shutter, gate, garage door…).",
    "Action confirmée avant d'être lancée": "Confirmed before it runs",
    "{action} ?": "{action}?",
    "Bouton « {nom} »": "Button “{nom}”",
    "Service appelé : {service}": "Service called: {service}",
    "Cibles : appareils ou zones (non détaillés).": "Targets: devices or areas (not detailed).",
    "… et {n} autres": "… and {n} more",
    "Sans entité visée.": "No target entity.",
    "Données envoyées : {cles}": "Data sent: {cles}",
    "Ouvrir la porte": "Open the door",
    "Désarmer l'alarme": "Disarm the alarm",
    "Déclencher l'alarme": "Trigger the alarm",
    "Arrêter": "Stop",
    "Ouvrir ou fermer": "Open or close",
    "Changer la position": "Set the position",
    "Ouvrir la vanne": "Open the valve",
    "Fermer la vanne": "Close the valve",
    "Arrêter la vanne": "Stop the valve",
    "Ouvrir ou fermer la vanne": "Open or close the valve",
    "Lancer le script": "Run the script",
    "Appuyer sur le bouton": "Press the button",
    "Déclencher l'automatisation": "Trigger the automation",
    "Redémarrer Home Assistant": "Restart Home Assistant",
    "Arrêter Home Assistant": "Stop Home Assistant",
    "Lancer l'action": "Run the action",
    "Position": "Position",
    "Échec : {msg}": "Failed: {msg}",
    "Éteindre tout": "Turn all off",
    "Éteindre": "Turn off",
    "Allumer tout": "Turn all on",
    "Allumer": "Turn on",
    "Ouvrir les volets": "Open the shutters",
    "Ouvrir le volet": "Open the shutter",
    "Fermer les volets": "Close the shutters",
    "Fermer le volet": "Close the shutter",
    " · volet {etat}": " · shutter {etat}",
    "<b>{n}</b> ouverte : {liste}|<b>{n}</b> ouvertes : {liste}": "<b>{n}</b> open: {liste}|<b>{n}</b> open: {liste}",
    "Tout est fermé": "All closed",
    "<b>{n}</b> lumière|<b>{n}</b> lumières": "<b>{n}</b> light|<b>{n}</b> lights",
    "<b>{n}</b> volet baissé|<b>{n}</b> volets baissés": "<b>{n}</b> shutter down|<b>{n}</b> shutters down",
    "<b>{t} °C</b> à l'intérieur": "<b>{t} °C</b> inside",
    "Choisir une entité": "Choose an entity",
    "Ajouter une puce au résumé": "Add a chip to the summary",
    "Puce": "Chip",
    "{nom} : à la maison": "{nom}: home",
    "inconnu": "unknown",
    " · {n} autre alerte| · {n} autres alertes": " · {n} other alert| · {n} other alerts",
    "Détails": "Details",
    "Masquer jusqu'au prochain changement": "Hide until the next change",
    "Masquer": "Hide",
    "Chargement de l'historique…": "Loading history…",
    "Historique indisponible : {msg}": "History unavailable: {msg}",
    "Revenir au direct": "Back to live",
    "Chargement…": "Loading…",
    "Lecture": "Play",
    "Moment de la journée": "Time of day",
    "Vitesse": "Speed",
    "hier": "yesterday",
    "Pause": "Pause",
    "Animations (fenêtre ouverte, pastille active)": "Animations (window open, badge active)",
    "Météo sur les extérieurs": "Weather on outdoor areas",
    "Ambiance": "Ambience",
    "Soleil : hauteur {h}°, azimut {az}° · coucher {coucher}": "Sun: elevation {h}°, azimuth {az}° · sets at {coucher}",
    "Plan interactif en direct (ouvertures, volets, lumières, températures), avec éditeur intégré.": "Live interactive floor plan (openings, shutters, lights, temperatures), with a built-in editor.",
    "Maquette — démo": "Maquette — demo",
    "Un appartement de démonstration aux états simulés : toutes les fonctions sans rien configurer, sans rien commander.": "A demo apartment with simulated states: every feature, nothing to configure, nothing controlled.",
    "Démo": "Demo",
    "Plan": "Plan",
    "Ma maison": "My home",
    "Maquette (démo)": "Maquette (demo)",
    "Maison": "Home",
    "Un plan vierge à dessiner avec l'éditeur intégré (pièces de Home Assistant, import, dessin).": "A blank plan to draw with the built-in editor (Home Assistant areas, import, drawing).",
    "L'appartement de démonstration : animations, météo, replay, alertes… avec des états simulés.": "The demo apartment: animations, weather, replay, alerts… with simulated states.",
    "Capteurs": "Sensors",
    "Lune": "Moon",
    "Thermostat": "Thermostat",
    "Climat des pièces": "Room climate",
    "Consommation": "Consumption",
    "Énergie": "Energy",
    "Lumières allumées": "Lights on",
    "Volets baissés": "Shutters down",
    "Déverrouiller": "Unlock",
    "Auto": "Auto",
    "Ouverture alors que la maison est vide": "Opening while the home is empty",
    "Borne": "Charger",
    "Chauffage": "Heating",
    "Annuler": "Cancel",
    "Entrée": "Entrance",
    "Aucune": "None",
    "Appartement démo": "Demo apartment",
    "Baie du séjour": "Living room bay window",
    "Balcon": "Balcony",
    "Batterie": "Battery",
    "Bureau##piece": "Office",
    "Caméra de l'entrée": "Entrance camera",
    "Chambre": "Bedroom",
    "Coût": "Cost",
    "Démo : seules les entités de la démo répondent.": "Demo: only the demo entities respond.",
    "Démo : {type} non disponible": "Demo: {type} not available",
    "Fenêtre bureau": "Office window",
    "Fenêtre chambre": "Bedroom window",
    "Fenêtre salle de bain": "Bathroom window",
    "Frigo": "Fridge",
    "Lampe de chevet": "Bedside lamp",
    "Lampe du bureau": "Office lamp",
    "Lampe du séjour": "Living room lamp",
    "Machine à café": "Coffee machine",
    "Maison (démo)": "Home (demo)",
    "Maison en direct": "Home right now",
    "Météo (démo)": "Weather (demo)",
    "Mouvement entrée": "Entrance motion",
    "Plafonnier cuisine": "Kitchen ceiling light",
    "Porte d'entrée": "Front door",
    "Prise borne": "Charger plug",
    "Prise frigo": "Fridge plug",
    "Prise TV": "TV plug",
    "Puissance apparente": "Apparent power",
    "Puissance appelée": "Power draw",
    "Puissance maison": "Home power",
    "Recharge voiture": "Car charging",
    "Rue": "Street",
    "Salle de bain": "Bathroom",
    "Téléviseur": "TV",
    "Températures": "Temperatures",
    "TV": "TV",
    "Voiture branchée": "Car plugged in",
    "Volet chambre": "Bedroom shutter",
    "Volet du séjour": "Living room shutter",
    "Atelier": "Studio",
    "Chambre d'amis": "Guest room",
    "Étage##demo": "Upstairs",
    "Fenêtre atelier": "Studio window",
    "Fenêtre chambre d'amis": "Guest room window",
    "Fenêtre salle d'eau": "Shower room window",
    "Lampe de l'atelier": "Studio lamp",
    "Palier": "Landing",
    "Plafonnier chambre d'amis": "Guest room ceiling light",
    "Rez-de-chaussée##demo": "Ground floor",
    "Salle d'eau##piece": "Shower room",
    "Volet chambre d'amis": "Guest room shutter",
    "Image de fond": "Background image",
    "Étages": "Floors",
    "Gérer les étages": "Manage floors",
    "Gérer": "Manage",
    "Ouvertures ouvertes": "Open windows and doors",
    "{nom} ({etage})": "{nom} ({etage})",
    "Aller à : {etage}": "Go to: {etage}",
    "Fenêtre de toit": "Roof window",
    "Fenêtre de toit de l'atelier": "Workshop roof window",
    "Store de la fenêtre de toit": "Roof window blind",
    "Éditeur introuvable : copier maquette-editeur.js à côté de maquette-card.js (même dossier), puis recharger la page.": "Editor not found: copy maquette-editeur.js next to maquette-card.js (same folder), then reload the page.",
    "maquette-editeur.js (v{a}) ne correspond pas à la carte (v{b}) : le remplacer, puis recharger la page.": "maquette-editeur.js (v{a}) does not match the card (v{b}): replace it, then reload the page.",
    "Étiquettes des zones": "Area labels",
    "Ouvrir : {cible}": "Open: {cible}",
  };
  // français : les clés sont déjà le texte ; seules les exceptions sont ici
  const FR = {};
  const DICO = { en: EN, fr: FR };
  let langue = "en", locale = "en-US";
  const manquantes = new Set();
  const famille = (code) => (/^fr(?![a-z])/i.test(String(code || "").trim()) ? "fr" : "en");
  const valide = (code) => { try { return code && Intl.NumberFormat.supportedLocalesOf(code).length ? code : null; } catch (e) { return null; } };
  const page = () => { try { return document.documentElement.lang || navigator.language || ""; } catch (e) { return ""; } };

  // langue de l'interface : forcée par la config, sinon celle de HA, sinon celle de la page ; renvoie true si elle a changé
  let dernier = null;
  function definir(hass, forcee) {
    const code = String(hass?.locale?.language || hass?.language || page()).trim().replace(/_/g, "-");
    if (dernier === `${code}|${forcee}`) return false; // appelé à chaque mise à jour de hass : rien à recalculer
    dernier = `${code}|${forcee}`;
    const l = forcee === "en" || forcee === "fr" ? forcee : famille(code);
    const loc = (famille(code) === l && valide(code)) || (l === "fr" ? "fr-FR" : "en-US");
    const change = l !== langue || loc !== locale;
    langue = l; locale = loc;
    return change;
  }

  function _t(cle, p) {
    let s = DICO[langue][cle];
    if (s == null) {
      if (langue !== "fr" && !manquantes.has(cle)) manquantes.add(cle);
      s = String(cle).replace(/##\w+$/, "");
    }
    if (s.includes("|")) {
      const f = s.split("|"), n = p?.n;
      s = f[n == null ? 0 : langue === "fr" ? (n > 1 ? 1 : 0) : (n === 1 ? 0 : 1)] ?? f[0];
    }
    return p ? s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? p[k] : m)) : s;
  }
  const _tk = (cle) => cle;

  // formateurs de nombres gardés par locale et décimales : toLocaleString en recrée un à chaque appel (coûteux, des centaines par
  // mise à jour de hass) ; même résultat (Number.prototype.toLocaleString = Intl.NumberFormat(locale, options).format)
  const formats = new Map();
  const formatNombre = (d) => {
    const cle = `${locale}|${d}`;
    let f = formats.get(cle);
    if (!f) { f = new Intl.NumberFormat(locale, { maximumFractionDigits: d }); formats.set(cle, f); }
    return f;
  };

  definir(null);
  return {
    _t, _tk, definir, DICO, manquantes,
    langue: () => langue,
    locale: () => locale,
    nombre: (v, d = 1) => formatNombre(d).format(Number(v)),
    // espace avant « % » : aucune en anglais (45%), une en français (45 %), comme Home Assistant
    pct: () => (langue === "fr" ? " %" : "%"),
    // unité après un nombre : espace avant, sauf « % » et « ° » en anglais (45%, 12°) ; en français toujours une espace
    unite: (u) => (!u ? "" : langue !== "fr" && (u === "%" || u === "°") ? u : ` ${u}`),
  };
})();
globalThis.MaquetteI18n = MaquetteI18n;

// ---------- mode démo (`demo: true`) : un appartement de démonstration, des états simulés, aucune action sur la maison ----------
// Tout ce que la carte lit (états, historique, statistiques) vient de la simulation ; tout ce qu'elle commande (allumer, ouvrir,
// consigne…) ne change que la simulation. Le soleil (sun.sun) et les coordonnées de la maison restent ceux de Home Assistant.
const PlanDemo = (() => {
  const { _t, _tk } = globalThis.MaquetteI18n;
  // murs d'un étage tracés avec leurs ouvertures (trous : [début, fin, ouverture ou null] le long du mur)
  const traceur = () => {
  const murs = [], ouvertures = [];
  const mur = (x1, y1, x2, y2, trous = []) => {
    const hz = y1 === y2, fin = hz ? x2 : y2;
    let cur = hz ? x1 : y1;
    for (const [d, f, o] of trous.sort((a, b) => a[0] - b[0])) {
      if (d - cur > 0.5) murs.push(hz ? [cur, y1, d, y1] : [x1, cur, x1, d]);
      if (o) ouvertures.push({ ...o, seg: hz ? [d, y1, f, y1] : [x1, d, x1, f] });
      cur = f;
    }
    if (fin - cur > 0.5) murs.push(hz ? [cur, y1, fin, y1] : [x1, cur, x1, fin]);
  };
  return { murs, ouvertures, mur };
  };
  // rez-de-chaussée : l'appartement de toujours
  const rdc = traceur(), mur = rdc.mur;
  mur(0, 0, 900, 0, [[90, 410, { type: "fenetre", nom: _tk("Baie du séjour"), contact: "binary_sensor.demo_baie_sejour", volet: "cover.demo_volet_sejour", dehors: [0, -1] }],
    [600, 800, { type: "fenetre", nom: _tk("Fenêtre chambre"), contact: "binary_sensor.demo_fenetre_chambre", volet: "cover.demo_volet_chambre", dehors: [0, -1] }]]);
  mur(900, 0, 900, 700, [[450, 600, { type: "fenetre", nom: _tk("Fenêtre bureau"), contact: "binary_sensor.demo_fenetre_bureau", dehors: [1, 0] }]]);
  mur(0, 700, 900, 700, [[320, 410, { type: "porte", nom: _tk("Porte d'entrée"), contact: "binary_sensor.demo_porte_entree", dehors: [0, 1] }]]);
  mur(0, 0, 0, 700, [[500, 600, { type: "fenetre", nom: _tk("Fenêtre salle de bain"), contact: "binary_sensor.demo_fenetre_sdb", dehors: [-1, 0] }]]);
  mur(500, 0, 500, 700, [[190, 270, { type: "porte", dehors: [-1, 0] }], [500, 580, { type: "porte", dehors: [1, 0] }]]);
  mur(0, 420, 500, 420, [[290, 410, null]]);
  mur(250, 420, 250, 700, [[520, 600, { type: "porte", dehors: [-1, 0] }]]);
  mur(500, 350, 900, 350);
  // étage : salle d'eau, palier (arrivée de l'escalier), chambre d'amis, atelier, dans l'emprise du rez-de-chaussée (même cadre)
  const haut = traceur(), murH = haut.mur;
  murH(0, 0, 900, 0, [[300, 400, { type: "fenetre", nom: _tk("Fenêtre salle d'eau"), contact: "binary_sensor.demo_fenetre_salle_eau", dehors: [0, -1] }]]);
  murH(900, 0, 900, 700, [[250, 450, { type: "fenetre", nom: _tk("Fenêtre atelier"), contact: "binary_sensor.demo_fenetre_atelier", dehors: [1, 0] }]]);
  murH(0, 700, 900, 700, [[150, 330, { type: "fenetre", nom: _tk("Fenêtre chambre d'amis"), contact: "binary_sensor.demo_fenetre_chambre_amis", volet: "cover.demo_volet_chambre_amis", dehors: [0, 1] }]]);
  murH(0, 0, 0, 700);
  murH(500, 0, 500, 700, [[260, 340, { type: "porte", dehors: [-1, 0] }]]);
  murH(0, 200, 500, 200, [[380, 460, { type: "porte", dehors: [0, -1] }]]);
  murH(0, 420, 500, 420, [[380, 460, { type: "porte", dehors: [0, 1] }]]);
  const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const D = (n) => `${n.split(".")[0]}.demo_${n.split(".")[1]}`;
  const geo = ({ murs, ouvertures }) => ({ murs: murs.map((m) => [...m]), ouvertures: ouvertures.map((o) => ({ ...o, ...(o.nom ? { nom: _t(o.nom) } : {}), seg: [...o.seg] })) });
  // escalier entre les deux niveaux : même place en bas et en haut, chacun mène à l'autre (`floor`) ; comme tous les meubles de
  // l'étage, il reste dans le cadre du rez-de-chaussée (le plan garde son échelle)
  const ESCALIER = { type: "escalier", pos: [90, 320], taille: [70, 170] };

  const config = () => ({
    titre: _t("Appartement démo"), demo: true, edition: false, replay: true, vitrine: true,
    // deux niveaux : le rez-de-chaussée s'affiche au chargement, l'ascenseur (sélecteur par défaut) mène à l'étage
    etage_defaut: "rdc",
    etages: [{ id: "rdc", nom: _t("Rez-de-chaussée##demo"), court: "0", icone: "mdi:home-floor-0",
    pieces: [
      { nom: _t("Balcon"), dehors: true, zoom: false, poly: R(0, -170, 500, 170), etiquette: [250, -85], temperature: D("sensor.exterieur_temperature") },
      { nom: _t("Séjour"), poly: R(0, 0, 500, 420), etiquette: [300, 250], temperature: D("sensor.sejour_temperature"), humidite: D("sensor.sejour_humidite") },
      { nom: _t("Chambre"), poly: R(500, 0, 400, 350), etiquette: [700, 175], temperature: D("sensor.chambre_temperature"), humidite: D("sensor.chambre_humidite") },
      { nom: _t("Bureau##piece"), poly: R(500, 350, 400, 350), etiquette: [700, 600], temperature: D("sensor.bureau_temperature"), humidite: D("sensor.bureau_humidite") },
      { nom: _t("Salle de bain"), poly: R(0, 420, 250, 280), etiquette: [125, 640], temperature: D("sensor.sdb_temperature"), humidite: D("sensor.sdb_humidite") },
      { nom: _t("Entrée"), poly: R(250, 420, 250, 280), etiquette: [375, 640] },
    ],
    ...geo(rdc), limites: [[0, -170, 500, -170], [0, -170, 0, 0], [500, -170, 500, 0]],
    points: [
      { entite: D("light.sejour"), pos: [230, 200], icone: "mdi:floor-lamp", couleur: "#f6c445", halo: 170, piece: _t("Séjour") },
      { entite: D("light.cuisine"), pos: [70, 70], icone: "mdi:ceiling-light", couleur: "#f6c445", halo: 120, piece: _t("Séjour") },
      { entite: D("light.chambre"), pos: [700, 90], icone: "mdi:lamp", couleur: "#f6c445", halo: 140, piece: _t("Chambre") },
      { entite: D("light.bureau"), pos: [700, 480], icone: "mdi:lightbulb", couleur: "#f6c445", halo: 140, piece: _t("Bureau##piece") },
      { entite: D("switch.machine_cafe"), pos: [160, 60], icone: "mdi:coffee-maker-outline", couleur: "#1a73e8", valeur: D("sensor.machine_cafe_puissance"), actif: D("sensor.machine_cafe_puissance"), seuil: 20 },
      { entite: D("camera.entree"), pos: [460, 670], icone: "mdi:cctv", couleur: "#d93025", actif: D("binary_sensor.mouvement_entree"), alerte: true },
      { entite: D("climate.thermostat"), pos: [470, 455], icone: "mdi:thermostat", couleur: "#e8710a", attribut: "temperature", unite: " °C", actif_attribut: "hvac_action" },
    ],
    meubles: [
      { type: "tapis", pos: [250, 250], taille: [220, 150] }, { type: "canape", pos: [250, 345], taille: [200, 90], rotation: 180 }, { type: "table_basse", pos: [250, 250] },
      { type: "meuble_tv", pos: [400, 30], nom: _t("Meuble TV"), entite: D("media_player.tv"), valeur: D("sensor.prise_tv_puissance") },
      { type: "refrigerateur", pos: [38, 150], rotation: 90, nom: _t("Frigo"), entite: D("switch.prise_frigo"), valeur: D("sensor.prise_frigo_puissance"), actif: D("sensor.prise_frigo_puissance"), seuil: 5, protege: true,
        fiche: { titre: _t("Frigo"), widgets: [{ type: "tuile", titre: _t("Consommation"), icone: "mdi:fridge-outline", entite: D("sensor.prise_frigo_puissance"), unite: "W", decimales: 0, historique: 24 }] } },
      { type: "tableau_elec", pos: [492, 560], rotation: 90, nom: _t("Tableau électrique"), entite: D("sensor.puissance_maison"), valeur: D("sensor.puissance_apparente") },
      { type: "borne_recharge", pos: [470, -150], nom: _t("Borne"), entite: D("switch.borne"), valeur: D("sensor.borne_puissance"), actif: D("sensor.borne_puissance"), seuil: 50,
        fiche: { titre: _t("Recharge voiture"), widgets: [{ type: "ve", titre: _t("Voiture"), batterie: D("sensor.ve_batterie"), autonomie: D("sensor.ve_autonomie"), puissance: D("sensor.borne_puissance"), branche: D("binary_sensor.ve_branche") }] } },
      { type: "bureau", pos: [790, 610] }, { type: "lit_double", pos: [790, 175], taille: [160, 200], rotation: 270 },
      { type: "chaudiere", pos: [30, 450], rotation: 90, entite: D("climate.thermostat"),
        fiche: { titre: _t("Chauffage"), widgets: [{ type: "thermostat", titre: _t("Thermostat"), entite: D("climate.thermostat") }, { type: "climat", titre: _t("Températures"), duree: 30, moyenne: true }] } },
      { ...ESCALIER, pos: [...ESCALIER.pos], taille: [...ESCALIER.taille], etage: "etage" },
    ],
    textes: [{ t: _t("Rue"), pos: [450, 760] }],
    }, { id: "etage", nom: _t("Étage##demo"), court: "1", icone: "mdi:home-floor-1",
    pieces: [
      { nom: _t("Salle d'eau##piece"), poly: R(0, 0, 500, 200), etiquette: [250, 120], temperature: D("sensor.salle_eau_temperature"), humidite: D("sensor.salle_eau_humidite") },
      { nom: _t("Palier"), poly: R(0, 200, 500, 220), etiquette: [290, 310] },
      { nom: _t("Chambre d'amis"), poly: R(0, 420, 500, 280), etiquette: [340, 560], temperature: D("sensor.chambre_amis_temperature"), humidite: D("sensor.chambre_amis_humidite") },
      { nom: _t("Atelier"), poly: R(500, 0, 400, 700), etiquette: [680, 350], temperature: D("sensor.atelier_temperature"), humidite: D("sensor.atelier_humidite") },
    ],
    ...geo(haut),
    points: [
      { entite: D("light.atelier"), pos: [640, 140], icone: "mdi:desk-lamp", couleur: "#f6c445", halo: 150, piece: _t("Atelier") },
      { entite: D("light.chambre_amis"), pos: [420, 640], icone: "mdi:ceiling-light", couleur: "#f6c445", halo: 130, piece: _t("Chambre d'amis") },
    ],
    meubles: [
      { type: "douche", pos: [60, 60] }, { type: "lavabo", pos: [190, 26] }, { type: "wc", pos: [470, 40], rotation: 270 },
      { type: "lit_double", pos: [130, 560], rotation: 90 }, { type: "table_nuit", pos: [130, 455] },
      { type: "bureau", pos: [835, 350], rotation: 270 }, { type: "etagere", pos: [700, 680] }, { type: "plante", pos: [540, 40] },
      { ...ESCALIER, pos: [...ESCALIER.pos], taille: [...ESCALIER.taille], rotation: 180, etage: "rdc" },
      // fenêtre de toit au-dessus de l'atelier : tache de soleil qui suit sun.sun, store simulé (fermé = pas de tache)
      { type: "fenetre_toit", nom: _t("Fenêtre de toit de l'atelier"), pos: [700, 560], taille: [78, 118], pente: 40, hauteur: 200, entite: D("cover.velux_atelier"), animation: "aucune" },
    ],
    }],
    panneaux: {
      gauche: [
        { type: "jauge", titre: _t("Puissance appelée"), entite: D("sensor.puissance_apparente"), min: 0, max: 6000, unite: "VA", decimales: 0 },
        { type: "periodes", titre: _t("Consommation"), icone: "mdi:home-lightning-bolt-outline", colonnes: [
          { nom: _t("Énergie"), unite: "kWh", stat: D("sensor.energie_totale"), facteur: 0.001, decimales: 1 }, { nom: _t("Coût"), unite: "€", stat: D("sensor.energie_totale_cout"), decimales: 2 }] },
      ],
      droite: [
        { type: "climat", titre: _t("Climat des pièces"), duree: 30 },
        { type: "tuile", titre: _t("Maison en direct"), icone: "mdi:home-lightning-bolt", entite: D("sensor.puissance_maison"), unite: "W", decimales: 0, historique: 24 },
      ],
    },
    ambiance: { nord: 45, meteo: D("weather.maison"), traces: 10, energie: {}, lumiere: { lune: D("sensor.moon_phase") }, personnes: { maison: _t("Séjour"), entites: [D("person.sam"), D("person.camille")] } },
    animations: { lumiere: { type: "halo" }, meuble: { type: "onde" } },
    alertes: [{ nom: _t("Ouverture alors que la maison est vide"), type: "ouvertures", si_absent: true, presence: D("zone.maison") }],
  });

  const METEOS = ["partlycloudy", "rainy", "sunny", "snowy", "cloudy", "lightning-rainy", "fog", "pouring", "windy"];
  const S = (state, attributes = {}, t = Date.now()) => ({ state: String(state), attributes, last_changed: new Date(t).toISOString(), last_updated: new Date(t).toISOString() });
  const u = (unite, dc, nom) => ({ unit_of_measurement: unite, ...(dc ? { device_class: dc } : {}), ...(nom ? { friendly_name: nom } : {}) });

  class Simulation {
    constructor() {
      // états de départ datés d'une heure (pas de « trace » au chargement)
      const t0 = Date.now() - 3600e3, e = {};
      const pose = (n, s, a) => { e[D(n)] = { ...S(s, a, t0), entity_id: D(n) }; };
      // lumière : lampe d'ambiance violette et plafonnier blanc chaud (halos qui se mélangent), lampe du bureau en blanc froid
      pose("light.sejour", "on", { friendly_name: _tk("Lampe du séjour"), color_mode: "rgb", rgb_color: [186, 104, 255], brightness: 200 });
      pose("light.cuisine", "off", { friendly_name: _tk("Plafonnier cuisine"), color_mode: "color_temp", color_temp_kelvin: 2700, brightness: 255 });
      pose("light.chambre", "off", { friendly_name: _tk("Lampe de chevet"), color_mode: "color_temp", color_temp_kelvin: 2200, brightness: 120 });
      pose("light.bureau", "on", { friendly_name: _tk("Lampe du bureau"), color_mode: "color_temp", color_temp_kelvin: 5000, brightness: 230 });
      pose("sensor.moon_phase", "waxing_gibbous", { friendly_name: _tk("Lune"), device_class: "enum" });
      pose("media_player.tv", "playing", { friendly_name: _tk("Téléviseur"), device_class: "tv" });
      pose("switch.machine_cafe", "on", { friendly_name: _tk("Machine à café") }); pose("sensor.machine_cafe_puissance", 6, u("W", "power", _tk("Machine à café")));
      pose("camera.entree", "idle", { friendly_name: _tk("Caméra de l'entrée") }); pose("binary_sensor.mouvement_entree", "off", { friendly_name: _tk("Mouvement entrée"), device_class: "motion" });
      pose("climate.thermostat", "heat", { friendly_name: _tk("Thermostat"), temperature: 20, hvac_action: "heating", current_temperature: 20.4, min_temp: 7, max_temp: 30, target_temp_step: 0.5 });
      pose("binary_sensor.baie_sejour", "off", { friendly_name: _tk("Baie du séjour"), device_class: "window" }); pose("cover.volet_sejour", "open", { friendly_name: _tk("Volet du séjour"), current_position: 100, device_class: "shutter", supported_features: 15 });
      pose("binary_sensor.fenetre_chambre", "off", { friendly_name: _tk("Fenêtre chambre"), device_class: "window" }); pose("cover.volet_chambre", "closed", { friendly_name: _tk("Volet chambre"), current_position: 0, device_class: "shutter", supported_features: 15 });
      pose("binary_sensor.fenetre_bureau", "off", { friendly_name: _tk("Fenêtre bureau"), device_class: "window" }); pose("binary_sensor.fenetre_sdb", "off", { friendly_name: _tk("Fenêtre salle de bain"), device_class: "window" });
      pose("binary_sensor.porte_entree", "off", { friendly_name: _tk("Porte d'entrée"), device_class: "door" });
      for (const [p, t, h] of [["exterieur", 11.2, null], ["sejour", 21.3, 48], ["chambre", 18.6, 52], ["bureau", 23.9, 44], ["sdb", 24.8, 71]]) {
        pose(`sensor.${p}_temperature`, t, u("°C", "temperature", p === "exterieur" ? _tk("Extérieur") : null));
        if (h != null) pose(`sensor.${p}_humidite`, h, u("%", "humidity"));
      }
      pose("sensor.puissance_apparente", 2310, u("VA", "apparent_power", _tk("Puissance apparente"))); pose("sensor.puissance_maison", 1840, u("W", "power", _tk("Puissance maison")));
      pose("sensor.energie_totale", 5123456, u("Wh", "energy")); pose("sensor.energie_totale_cout", 812.4, u("€", "monetary"));
      pose("switch.prise_tv", "on", { friendly_name: _tk("Prise TV") }); pose("sensor.prise_tv_puissance", 96, u("W", "power", _tk("TV")));
      pose("switch.prise_frigo", "on", { friendly_name: _tk("Prise frigo") }); pose("sensor.prise_frigo_puissance", 84, u("W", "power", _tk("Frigo")));
      pose("switch.borne", "on", { friendly_name: _tk("Prise borne") }); pose("sensor.borne_puissance", 2280, u("W", "power", _tk("Borne")));
      pose("sensor.ve_batterie", 64, u("%", "battery", _tk("Batterie"))); pose("sensor.ve_autonomie", 238, u("km", "distance", _tk("Autonomie"))); pose("binary_sensor.ve_branche", "on", { device_class: "plug", friendly_name: _tk("Voiture branchée") });
      pose("weather.maison", "partlycloudy", { friendly_name: _tk("Météo (démo)"), temperature: 14, humidity: 70, cloud_coverage: 45, wind_speed: 14, wind_bearing: 250, wind_speed_unit: "km/h" });
      pose("person.sam", "home", { friendly_name: "Sam" }); pose("person.camille", "not_home", { friendly_name: "Camille" });
      pose("zone.maison", 1, { friendly_name: _tk("Maison (démo)") });
      // équipements pour les widgets prêts à l'emploi : CO₂, luminosité, serrure, fuite d'eau
      pose("sensor.sejour_co2", 870, u("ppm", "carbon_dioxide", _tk("CO₂ du séjour"))); pose("sensor.bureau_luminosite", 320, u("lx", "illuminance", _tk("Luminosité du bureau")));
      pose("lock.entree", "locked", { friendly_name: _tk("Serrure de l'entrée"), supported_features: 1 }); pose("binary_sensor.fuite_sdb", "off", { friendly_name: _tk("Fuite salle de bain"), device_class: "moisture" });
      // étage : lampe de l'atelier allumée, plafonnier de la chambre d'amis éteint, volet ouvert ; la fenêtre de la salle d'eau est
      // ouverte tant que Sam est là (aération après la douche) : la pastille de l'étage le signale depuis le rez-de-chaussée
      pose("light.atelier", "on", { friendly_name: _tk("Lampe de l'atelier"), color_mode: "color_temp", color_temp_kelvin: 4000, brightness: 210 });
      pose("light.chambre_amis", "off", { friendly_name: _tk("Plafonnier chambre d'amis"), color_mode: "color_temp", color_temp_kelvin: 2700, brightness: 200 });
      pose("binary_sensor.fenetre_salle_eau", "on", { friendly_name: _tk("Fenêtre salle d'eau"), device_class: "window" });
      pose("binary_sensor.fenetre_atelier", "off", { friendly_name: _tk("Fenêtre atelier"), device_class: "window" });
      pose("binary_sensor.fenetre_chambre_amis", "off", { friendly_name: _tk("Fenêtre chambre d'amis"), device_class: "window" });
      pose("cover.velux_atelier", "open", { friendly_name: _tk("Store de la fenêtre de toit"), current_position: 100, device_class: "blind", supported_features: 15 });
      pose("cover.volet_chambre_amis", "open", { friendly_name: _tk("Volet chambre d'amis"), current_position: 100, device_class: "shutter", supported_features: 15 });
      for (const [p, t, h] of [["salle_eau", 22.6, 74], ["chambre_amis", 19.1, 50], ["atelier", 20.7, 45]]) {
        pose(`sensor.${p}_temperature`, t, u("°C", "temperature")); pose(`sensor.${p}_humidite`, h, u("%", "humidity"));
      }
      this.etats = e; this.k = 0; this.abonnes = new Set(); this.tm = 0;
      // noms affichés dans la langue de l'interface (les prénoms restent tels quels) ; renommer() après un changement de langue
      this.fr = Object.fromEntries(Object.entries(e).filter(([id, v]) => v.attributes.friendly_name && !id.includes("person.")).map(([id, v]) => [id, v.attributes.friendly_name]));
      this.renommer();
    }
    renommer() {
      for (const [id, n] of Object.entries(this.fr)) this.etats[id] = { ...this.etats[id], attributes: { ...this.etats[id].attributes, friendly_name: _t(n) } };
    }
    // un pas toutes les 3 s : puissances qui bougent, café, mouvement à l'entrée, porte, lumière, météo, allées et venues
    pas() {
      const k = ++this.k, n = (x, v) => this.poser(x, String(v), null, true);
      const w = (x, b, a) => n(x, Math.round(b + a * (Math.sin(k / 3) * 0.6 + Math.random() * 0.4)));
      w("sensor.prise_tv_puissance", 90, 15); w("sensor.prise_frigo_puissance", k % 20 < 12 ? 80 : 2, 6); w("sensor.borne_puissance", 2250, 60);
      n("sensor.machine_cafe_puissance", k % 40 < 4 ? 1180 + Math.round(Math.random() * 60) : 6);
      const tot = ["sensor.prise_tv_puissance", "sensor.prise_frigo_puissance", "sensor.borne_puissance", "sensor.machine_cafe_puissance"].reduce((a, x) => a + parseFloat(this.etats[D(x)].state), 0) + 420;
      n("sensor.puissance_maison", Math.round(tot)); n("sensor.puissance_apparente", Math.round(tot * 1.18));
      if (k % 7 === 0) this.poser("binary_sensor.mouvement_entree", "on"); else if (k % 7 === 2) this.poser("binary_sensor.mouvement_entree", "off");
      if (k % 23 === 5) this.poser("binary_sensor.porte_entree", "on"); else if (k % 23 === 8) this.poser("binary_sensor.porte_entree", "off");
      if (k % 15 === 0) this.poser("light.cuisine", this.etats[D("light.cuisine")].state === "on" ? "off" : "on");
      if (k % 30 === 0) { const m = METEOS[(k / 30) % METEOS.length]; this.poser("weather.maison", m, { cloud_coverage: { sunny: 5, partlycloudy: 45 }[m] ?? 90 }); }
      // Sam ferme la fenêtre de la salle d'eau en partant et la rouvre au retour : pastille de l'étage quand il est là, pas d'alerte
      // « maison vide » permanente pendant son absence
      if (k % 40 === 20) {
        const dehors = this.etats[D("person.sam")].state === "home";
        this.poser("binary_sensor.fenetre_salle_eau", dehors ? "off" : "on", null, true); this.poser("person.sam", dehors ? "not_home" : "home");
      }
      this.poser("zone.maison", String(this.etats[D("person.sam")].state === "home" ? 1 : 0), null, true);
      this.notifier();
    }
    poser(x, s, a = null, sansNotif = false) {
      const id = x.includes(".demo_") ? x : D(x), p = this.etats[id];
      if (!p) return;
      const t = new Date().toISOString(), change = p.state !== String(s);
      this.etats[id] = { ...p, state: String(s), attributes: a ? { ...p.attributes, ...a } : p.attributes, last_changed: change ? t : p.last_changed, last_updated: t };
      if (!sansNotif) this.notifier();
    }
    notifier() { for (const f of this.abonnes) f(); }
    abonner(f) { this.abonnes.add(f); if (!this.tm) this.tm = setInterval(() => this.pas(), 3000); return () => { this.abonnes.delete(f); if (!this.abonnes.size) { clearInterval(this.tm); this.tm = 0; } }; }
    // services : seulement sur les entités de la démo, sinon refusés (rien n'atteint la maison)
    service(dom, svc, data = {}, cible = {}) {
      const ids = [data.entity_id, cible?.entity_id].flat().filter((x) => typeof x === "string");
      if (!ids.length || ids.some((x) => !this.etats[x])) return Promise.reject(new Error(_t("Démo : seules les entités de la démo répondent.")));
      for (const id of ids) {
        const s = this.etats[id].state, d = id.split(".")[0];
        if (d === "cover") {
          const pos = svc === "open_cover" ? 100 : svc === "close_cover" ? 0 : this.etats[id].attributes.current_position;
          this.poser(id, svc === "stop_cover" ? s : svc === "open_cover" ? "opening" : "closing");
          if (svc !== "stop_cover") setTimeout(() => this.poser(id, pos ? "open" : "closed", { current_position: pos }), 4000);
        } else if (d === "climate" && svc === "set_temperature") this.poser(id, s, { temperature: data.temperature });
        else if (d === "lock" && ["lock", "unlock", "open"].includes(svc)) {
          this.poser(id, svc === "lock" ? "locking" : "unlocking");
          setTimeout(() => this.poser(id, svc === "lock" ? "locked" : svc === "open" ? "open" : "unlocked"), 1500);
        }
        else if (svc === "turn_on" || svc === "turn_off" || svc === "toggle") {
          const on = svc === "toggle" ? !["on", "playing"].includes(s) : svc === "turn_on";
          this.poser(id, d === "media_player" ? (on ? "playing" : "off") : on ? "on" : "off");
        }
      }
      return Promise.resolve();
    }
    ws(m) {
      if (m.type === "recorder/statistic_during_period") {
        const base = { day: 9.4, week: 41.7, month: 168.2, year: 2143 }[m.calendar?.period] ?? 9.4;
        return Promise.resolve({ change: m.statistic_id.includes("cout") ? base * 0.21 : base * 1000 });
      }
      if (m.type === "history/history_during_period") return Promise.resolve(this.histoire(m));
      if (m.type === "search/related") return Promise.resolve({});
      return Promise.reject(new Error(_t("Démo : {type} non disponible", { type: m.type })));
    }
    // historique simulé (format compressé de HA) : une journée plausible, en heure locale
    histoire(m) {
      const debut = new Date(m.start_time).getTime(), fin = new Date(m.end_time || Date.now()).getTime(), out = {};
      const h = (t) => { const d = new Date(t); return d.getHours() + d.getMinutes() / 60; };
      const serie = (ms, f) => { const l = []; for (let t = debut; t <= fin; t += ms) l.push({ ...f(t), lu: t / 1000 }); return l; };
      for (const id of m.entity_ids) {
        const st = this.etats[id];
        if (!st) continue;
        const a0 = st.attributes, dom = id.split(".")[0], g = [...id].reduce((x, c) => x + c.charCodeAt(0), 0), v = parseFloat(st.state);
        let l;
        if (dom === "binary_sensor" && !id.includes("ve_branche")) l = serie(60e3, (t) => { const x = h(t), o = (g % 5) + 7; return { s: (x > o && x < o + 0.3) || (x > 12.2 + (g % 3) && x < 12.6 + (g % 3)) || (x > 19 + (g % 4) * 0.4 && x < 19.2 + (g % 4) * 0.4) ? "on" : "off" }; });
        else if (dom === "light") l = serie(60e3, (t) => { const x = h(t); return { s: (x > 6.8 && x < 7.6) || (x > 18.5 + (g % 3) * 0.5 && x < 23.2) ? "on" : "off" }; });
        else if (dom === "cover") l = serie(60e3, (t) => { const x = h(t), p = x < 7.5 || x > 21 + (g % 3) * 0.3 ? 0 : 100; return { s: p ? "open" : "closed", a: { ...a0, current_position: p } }; });
        else if (dom === "person") l = serie(300e3, (t) => { const x = h(t); return { s: id.endsWith("sam") ? (x > 8.3 && x < 17.5 ? "not_home" : "home") : x > 13 && x < 16 ? "home" : "not_home", a: a0 }; });
        else if (dom === "zone") l = serie(300e3, (t) => { const x = h(t); return { s: x > 8.3 && x < 17.5 ? "0" : "1" }; });
        else if (dom === "weather") l = serie(1800e3, (t) => { const x = h(t); return { s: x > 14 && x < 17 ? "rainy" : x > 10 && x < 14 ? "cloudy" : "partlycloudy", a: a0 }; });
        else if (!isNaN(v)) {
          const temp = a0.unit_of_measurement === "°C" || a0.unit_of_measurement === "%";
          l = serie(temp ? 600e3 : 300e3, (t) => ({ s: String(+(temp ? v + Math.sin((h(t) - 15) / 24 * 2 * Math.PI) * (a0.unit_of_measurement === "%" ? 6 : 1.5) : v * (0.6 + 0.6 * Math.abs(Math.sin(t / 3.6e6 + g)))).toFixed(1)) }));
        } else l = [{ s: st.state, a: a0, lu: debut / 1000 }];
        const c = l.filter((x, i) => i === 0 || x.s !== l[i - 1].s || (x.a && x.a.current_position !== l[i - 1].a?.current_position));
        out[id] = c.map((x) => (m.no_attributes ? { s: x.s, lu: x.lu } : x));
      }
      return out;
    }
    // coordonnées des personnes autour de la maison (direction et distance sur le plan)
    placer(cf) {
      const la = +cf?.latitude || 45.76, lo = +cf?.longitude || 4.84;
      for (const [p, dla, dlo] of [["person.sam", 0.03, 0.07], ["person.camille", -0.06, -0.05]]) {
        const s = this.etats[D(p)];
        if (s) s.attributes = { ...s.attributes, latitude: la + dla, longitude: lo + dlo };
      }
    }
  }
  return { config, Simulation };
})();

/* maquette-card (Maquette, ex-plan-maison-card) : plan interactif de la maison, en direct.
 * Générique : la géométrie (en cm) et les entités viennent de la config de la carte (dashboard, accès authentifié) ;
 * ce fichier, servi sans authentification depuis /local, ne contient rien de propre à la maison.
 * Config publique (YAML du dashboard) en anglais, voir docs/configuration.md : rooms[{name, poly, temperature?, humidity?, …}], walls[[x1,y1,x2,y2]],
 *          fences[[…]], openings[{type: window|door|gate, seg, …}], badges[…], texts[…], furniture[…], panels{left, right}, layers{…}…
 * En interne (this._config, éditeur, brouillons) la config garde ses clés françaises : pieces, murs, limites, ouvertures, points, textes,
 *          meubles, panneaux{gauche, droite}, calques… ; depuisAnglais / versAnglais (schéma N_RACINE) traduisent à l'entrée et à la sortie.
 */
const { _t, _tk } = globalThis.MaquetteI18n, _loc = () => globalThis.MaquetteI18n.locale();
const VERSION = "0.3.1";
// éditeur : module à part (maquette-editeur.js, à côté de ce fichier), chargé à la première ouverture, une seule fois par page ;
// même requête que la carte (?hacstag=… de HACS, ?v=… d'un déploiement) pour suivre ses mises à jour, sinon ?v=<version>.
// Déjà là s'il a été chargé autrement (ressource ajoutée à la main, ancienne version d'un seul fichier) ; échec : on pourra réessayer.
let _chargementEditeur = null;
function chargerEditeur() {
  if (globalThis.MaquetteEditeur) return Promise.resolve(globalThis.MaquetteEditeur);
  return (_chargementEditeur ||= (async () => {
    const ici = new URL(import.meta.url);
    await import(new URL(`maquette-editeur.js${ici.search || `?v=${VERSION}`}`, ici).href);
    // le module attend que la carte soit définie : elle l'est déjà ici
    if (!globalThis.MaquetteEditeur) throw new Error("maquette-editeur.js : EditeurPlan absent");
    return globalThis.MaquetteEditeur;
  })().catch((e) => { _chargementEditeur = null; throw e; }));
}
const ACTIFS = new Set(["on", "open", "opening", "closing", "playing", "heating", "cooling", "cleaning", "detected", "home"]);
const fmt = globalThis.MaquetteI18n.nombre; // nombre à la locale de l'interface
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PALIERS = [[17, "#4f7fe0"], [19, "#56b4d3"], [21, "#62c48a"], [23, "#a8cf5a"], [24.5, "#f2c14e"], [26, "#f29e4c"], [28, "#e5604d"]];
function couleurTemp(t) {
  if (t == null || isNaN(t)) return null;
  if (t <= PALIERS[0][0]) return PALIERS[0][1];
  for (let i = 1; i < PALIERS.length; i++) {
    const [t1, c1] = PALIERS[i];
    if (t <= t1) {
      const [t0, c0] = PALIERS[i - 1], k = (t - t0) / (t1 - t0);
      const a = c0.match(/\w\w/g).map((h) => parseInt(h, 16)), b = c1.match(/\w\w/g).map((h) => parseInt(h, 16));
      return "#" + a.map((x, j) => Math.round(x + (b[j] - x) * k).toString(16).padStart(2, "0")).join("");
    }
  }
  return PALIERS[PALIERS.length - 1][1];
}

// ---------- variables publiques du thème ----------
// Une ligne par variable publique stable `--maquette-<nom>` (anglais, jamais renommée). Elle sert à la fois :
//  - au CSS de la carte : chaque jeton interne `jeton` est déclaré sur :host (plan.css.js, CSS_JETONS_THEME) par
//      <jeton>: var(--maquette-<nom>, var(--mq-t-<nom>, <defaut>))
//    → la variable publique (thème HA, card-mod — jetons redéclarés sur ha-card —, CSS personnalisé de la carte) prime sur le thème choisi (`theme:`,
//      posé en --mq-t-<nom> par themes.js), qui prime sur la valeur par défaut (= rendu Material d'avant les thèmes) ;
//  - au format public : clé `cle` (interne, française) ↔ `nom` avec « _ » (YAML : `theme: {base: ocean, room_fill: "#eee"}`) ;
//  - à l'éditeur (liste cliquable, MaquetteCard.prototype.variablesTheme) et à la doc (tableVariablesTheme, générée → toujours exacte).
// type : couleur | longueur | police (validation : themes.js, valeurTheme). css: false = pas de jeton déclaré en CSS (la police
// est posée par la carte sur --ha-font-family-body de son hôte, que tous ses styles lisent déjà).
// Ajouter une variable : une ligne ici, puis utiliser son jeton dans le CSS (le rendu par défaut ne doit pas changer).
const VARIABLES_THEME = [
  { nom: "accent", cle: "accent", type: "couleur", jeton: "--md-primary", defaut: "var(--primary-color,#03a9f4)",
    fr: "Couleur d'accent (portes fermées, icônes, boutons, sélection)", en: "Accent color (closed doors, icons, buttons, selection)" },
  { nom: "on-accent", cle: "sur_accent", type: "couleur", jeton: "--md-on-primary", defaut: "var(--text-primary-color,#fff)",
    fr: "Texte et icônes posés sur l'accent", en: "Text and icons on the accent color" },
  { nom: "surface", cle: "surface", type: "couleur", jeton: "--md-surface", defaut: "var(--ha-card-background,var(--card-background-color,#fff))",
    fr: "Fond du plan et des surfaces (base des teintes)", en: "Plan and surface background (base of the tints)" },
  { nom: "card-background", cle: "fond_carte", type: "couleur", jeton: "--md-surface-container-low", defaut: "color-mix(in srgb,var(--md-primary) 4%,var(--md-surface))",
    fr: "Fond de la carte (autour du plan)", en: "Card background (around the plan)" },
  { nom: "surface-variant", cle: "surface_variante", type: "couleur", jeton: "--md-surface-container", defaut: "color-mix(in srgb,var(--md-primary) 8%,var(--md-surface))",
    fr: "Surfaces secondaires (menus, panneaux, champs)", en: "Secondary surfaces (menus, panels, fields)" },
  { nom: "text", cle: "texte", type: "couleur", jeton: "--md-on-surface", defaut: "var(--primary-text-color,#1c1b1f)",
    fr: "Texte principal", en: "Primary text" },
  { nom: "text-secondary", cle: "texte_secondaire", type: "couleur", jeton: "--md-on-surface-variant", defaut: "var(--secondary-text-color,#49454f)",
    fr: "Texte secondaire (valeurs, détails)", en: "Secondary text (values, details)" },
  { nom: "outline", cle: "contour", type: "couleur", jeton: "--md-outline", defaut: "color-mix(in srgb,var(--md-on-surface) 45%,transparent)",
    fr: "Contours marqués (limites, boutons)", en: "Strong outlines (fences, buttons)" },
  { nom: "outline-variant", cle: "contour_discret", type: "couleur", jeton: "--md-outline-variant", defaut: "color-mix(in srgb,var(--md-on-surface) 14%,transparent)",
    fr: "Contours discrets (puces, séparateurs)", en: "Subtle outlines (chips, dividers)" },
  { nom: "error", cle: "erreur", type: "couleur", jeton: "--md-error", defaut: "var(--error-color,#b3261e)",
    fr: "Erreurs et alertes", en: "Errors and alerts" },
  { nom: "wall", cle: "mur", type: "couleur", jeton: "--plan-mur", defaut: "var(--md-on-surface)",
    fr: "Murs", en: "Walls" },
  { nom: "room-fill", cle: "sol", type: "couleur", jeton: "--plan-sol", defaut: "var(--secondary-background-color)",
    fr: "Sol des pièces (sans teinte de température)", en: "Room floor (without temperature tint)" },
  { nom: "room-text", cle: "texte_piece", type: "couleur", jeton: "--plan-etq", defaut: "var(--md-on-surface)",
    fr: "Texte des étiquettes de pièce", en: "Room label text" },
  { nom: "door-closed", cle: "porte_fermee", type: "couleur", jeton: "--plan-ferme", defaut: "var(--md-primary)",
    fr: "Porte ou fenêtre fermée", en: "Closed door or window" },
  { nom: "door-open", cle: "porte_ouverte", type: "couleur", jeton: "--plan-ouvert", defaut: "var(--md-error)",
    fr: "Porte ou fenêtre ouverte", en: "Open door or window" },
  { nom: "shutter", cle: "volet", type: "couleur", jeton: "--plan-volet", defaut: "color-mix(in srgb,#8d6e4a 85%,var(--md-on-surface))",
    fr: "Volets", en: "Shutters" },
  { nom: "furniture", cle: "meuble", type: "couleur", jeton: "--plan-meuble", defaut: "color-mix(in srgb,var(--md-surface) 40%,transparent)",
    fr: "Remplissage des meubles", en: "Furniture fill" },
  { nom: "furniture-stroke", cle: "meuble_trait", type: "couleur", jeton: "--plan-meuble-trait", defaut: "color-mix(in srgb,var(--md-on-surface) 70%,transparent)",
    fr: "Trait des meubles", en: "Furniture stroke" },
  { nom: "chip-background", cle: "puce_fond", type: "couleur", jeton: "--plan-puce-fond", defaut: "var(--md-surface)",
    fr: "Fond des puces du résumé", en: "Summary chip background" },
  { nom: "chip-text", cle: "puce_texte", type: "couleur", jeton: "--plan-puce-texte", defaut: "var(--md-on-surface-variant)",
    fr: "Texte des puces du résumé", en: "Summary chip text" },
  { nom: "badge-background", cle: "pastille_fond", type: "couleur", jeton: "--md-secondary-container", defaut: "color-mix(in srgb,var(--md-primary) 18%,var(--md-surface))",
    fr: "Fond des pastilles d'appareil (inactives)", en: "Device badge background (inactive)" },
  { nom: "badge-text", cle: "pastille_texte", type: "couleur", jeton: "--md-on-secondary-container", defaut: "var(--md-on-surface)",
    fr: "Texte et icône des pastilles (inactives)", en: "Badge text and icon (inactive)" },
  { nom: "radius", cle: "rayon", type: "longueur", jeton: "--plan-rayon", defaut: "var(--ha-card-border-radius,16px)",
    fr: "Rayon des coins de la carte", en: "Card corner radius" },
  { nom: "font", cle: "police", type: "police", jeton: "--ha-font-family-body", css: false, defaut: "var(--ha-font-family-body,Roboto,system-ui,sans-serif)",
    fr: "Police des textes", en: "Text font" },
];
// clé YAML (anglais) d'une variable : son nom avec « _ » (room-fill → room_fill)
const cleAnglaiseTheme = (v) => v.nom.replace(/-/g, "_");
// déclarations des jetons sur :host (insérées dans plan.css.js)
const CSS_JETONS_THEME = VARIABLES_THEME.filter((v) => v.css !== false).map((v) => `${v.jeton}:var(--maquette-${v.nom},var(--mq-t-${v.nom},${v.defaut}));`).join("\n  ");
// table de la doc (Markdown), générée : `| Variable | Rôle | Défaut |` (langue : "fr" | "en")
const tableVariablesTheme = (langue = "en") => [
  langue === "fr" ? "| Variable | Clé `theme:` | Rôle | Type | Défaut |" : "| Variable | `theme:` key | Role | Type | Default |", "|---|---|---|---|---|",
  ...VARIABLES_THEME.map((v) => `| \`--maquette-${v.nom}\` | \`${cleAnglaiseTheme(v)}\` | ${langue === "fr" ? v.fr : v.en} | ${langue === "fr" ? v.type : { couleur: "color", longueur: "length", police: "font" }[v.type]} | \`${v.defaut}\` |`),
].join("\n");
const CSS = `
/* Material Design 3 : rôles de couleur dérivés du thème HA (primary-color, card-background-color, textes) */
:host{display:block;
  /* jetons publics (table unique VARIABLES_THEME, themes-variables.js) : --maquette-* > thème (--mq-t-*) > valeur par défaut */
  ${CSS_JETONS_THEME}
  --md-surface-container-high:color-mix(in srgb,var(--md-primary) 12%,var(--md-surface));
  --md-error-container:color-mix(in srgb,var(--md-error) 16%,var(--md-surface));
  --md-on-error-container:color-mix(in srgb,var(--md-error) 75%,var(--md-on-surface));
  --md-sys-motion:cubic-bezier(.2,0,0,1);
  --mq-police-hote:var(--ha-font-family-body)}
/* mêmes jetons recalculés sur ha-card : un --maquette-* posé par card-mod (sur ha-card) y prime aussi ; sans lui, valeurs identiques (héritées) */
ha-card{${CSS_JETONS_THEME}
  --ha-font-family-body:var(--maquette-font,var(--mq-police-hote))}
ha-card{padding:16px;overflow:hidden;border-radius:var(--plan-rayon);background:var(--md-surface-container-low)}
.titre{font:500 22px/28px var(--ha-font-family-body,Roboto,system-ui,sans-serif);color:var(--md-on-surface);margin:0 4px 12px}
.tete{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}
.plein .tete{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;flex:none}
.plein .tete::-webkit-scrollbar{display:none}
.plein .chip{flex:none}
.chip{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 16px 0 8px;border-radius:8px;
  border:1px solid var(--md-outline-variant);background:var(--plan-puce-fond);color:var(--plan-puce-texte);
  font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.1px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.chip ha-icon{--mdc-icon-size:18px;color:var(--md-primary);flex:none}
/* texte trop long pour la largeur (téléphone : « 5 ouvertes : … ») : coupé proprement, la liste entière reste dans la bulle (title) ;
   1 px de marge intérieure compensée : le lissage de la dernière lettre n'est pas rogné quand le texte tient */
.chip>span{min-width:0;overflow:hidden;text-overflow:ellipsis;padding-right:1px;margin-right:-1px}
.chip b{color:var(--md-on-surface);font-weight:500}
.chip.alerte{background:var(--md-error-container);border-color:transparent;color:var(--md-on-error-container)}
.chip.alerte ha-icon,.chip.alerte b{color:var(--md-on-error-container)}
.chip[data-e]{cursor:pointer}
.edition .chip[data-puce]{cursor:pointer}
.chip.sel{outline:3px solid var(--md-primary);outline-offset:1px}
.chip.ajout{border-style:dashed;color:var(--md-primary);background:none;cursor:pointer;padding:0 12px 0 8px}
.tete[hidden]{display:none}
.zone svg .meuble{pointer-events:none}
.zone svg .meuble *{fill:var(--plan-meuble);stroke:var(--plan-meuble-trait);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.zone svg .meuble .ligne,.zone svg .meuble .vide{fill:none}
.zone svg .meuble .tirets{stroke-dasharray:5 4}
.zone svg .meuble .eau{fill:color-mix(in srgb,#4fc3f7 35%,transparent)}
.zone svg .meuble.zone .zone-fond{fill:color-mix(in srgb,var(--md-primary) 6%,transparent);stroke:color-mix(in srgb,var(--md-primary) 55%,transparent);stroke-width:1.5px}
/* meuble connecté (vue) : cliquable ; actif = contour et teinte d'accent ; entité indisponible = contour pointillé */
.zone svg .meuble .forme.colore *{stroke:color-mix(in srgb,var(--mb-teinte) 70%,var(--plan-meuble-trait))}
.zone svg .meuble .forme.colore :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-teinte) 30%,var(--plan-meuble))}
.zone svg .meuble.connecte{pointer-events:visiblePainted;cursor:pointer}
.zone svg .meuble.connecte.sans-clic{pointer-events:none;cursor:default}
.zone svg .meuble.connecte.teinte *{stroke:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 75%,var(--plan-meuble-trait))}
.zone svg .meuble.connecte.teinte :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 18%,var(--plan-meuble))}
.zone svg .meuble.connecte.actif *{stroke:var(--mb-couleur,var(--md-primary));stroke-width:2px}
.zone svg .meuble.connecte.actif :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 34%,var(--plan-meuble))}
.zone svg .meuble.connecte.indispo *{stroke:color-mix(in srgb,var(--md-error) 60%,transparent);stroke-dasharray:4 3}
.edition .zone svg .meuble{pointer-events:visiblePainted;cursor:grab}
.zone-etq{position:absolute;transform:translate(-50%,-50%);pointer-events:none;color:color-mix(in srgb,var(--md-primary) 80%,var(--md-on-surface));font:500 11px/14px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.4px;text-transform:uppercase;white-space:nowrap;opacity:.85}
.zone-etq.hors{opacity:.2}
.col.suite{-webkit-mask-image:linear-gradient(180deg,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(180deg,#000 calc(100% - 40px),transparent)}
.legende[hidden]{display:none}
.etat-vide{position:absolute;inset:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;pointer-events:none;z-index:3;
  color:var(--md-on-surface-variant);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.etat-vide>ha-icon{--mdc-icon-size:48px;color:var(--md-primary)}
.etat-vide h2{margin:0;color:var(--md-on-surface);font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.etat-vide p{margin:0;max-width:420px}
.etat-vide .actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px;pointer-events:auto}
.etat-vide button{height:40px;padding:0 20px 0 14px;white-space:nowrap;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);border:1px solid var(--md-outline);background:none;color:var(--md-primary)}
.etat-vide button.plein{background:var(--md-primary);color:var(--md-on-primary);border-color:transparent}
.etat-vide button ha-icon{--mdc-icon-size:18px}
.plan:has(.zone.dessin) .etat-vide{display:none}
.plan:has(.etat-vide) .zoom{display:none}
.plan{position:relative;flex:none;container-type:inline-size;border-radius:12px;background:var(--md-surface);padding:8px;box-sizing:border-box;max-width:100%}
.plan>.zone{position:relative}
svg{display:block;width:100%;height:auto;user-select:none}
.piece{stroke:none;transition:fill .6s var(--md-sys-motion)}
.piece.dehors{fill:var(--md-surface-container-high)}
/* image de fond affichée : sol des pièces translucide (background.room_opacity), la teinte des températures reste visible */
.zone.sur-fond svg .piece:not(.sous-zone){fill-opacity:var(--sol-fond,.6)}
.zone svg .piece.sous-zone{fill:color-mix(in srgb,var(--md-primary) 5%,transparent);stroke:color-mix(in srgb,var(--md-primary) 55%,transparent);stroke-width:1.5px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.edition .zone svg .piece.sous-zone{pointer-events:visiblePainted;cursor:pointer}
.calque>.zone-etq{pointer-events:none}
.edition .calque>.zone-etq.sz{pointer-events:auto;cursor:grab}
.murs{fill:none;stroke:var(--plan-mur);stroke-width:9;stroke-linecap:square}
.limites{fill:none;stroke:var(--md-outline);stroke-width:5;stroke-linecap:square}
.ouv{cursor:pointer}
.ouv .cible{stroke:transparent;stroke-width:46}
.ouv:hover .cible{stroke:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ouv .trait{fill:none;stroke-linecap:butt;transition:stroke .3s var(--md-sys-motion),stroke-width .3s var(--md-sys-motion)}
.ouv.fenetre .trait{stroke:var(--plan-ferme);stroke-width:3.5}
.ouv.porte .trait,.ouv.portail .trait{stroke:var(--plan-ferme);stroke-width:7}
.ouv.sans{cursor:default}
/* baie : toute ouverture (sauf volet seul) interrompt le mur, comme sur un plan d'architecte (fond du plan, un peu plus large
   que le mur) ; sans capteur : traits fins (deux pour une fenêtre, un pour une porte ou un portail, avec ses jambages) */
.ouv .baie{fill:none;stroke:var(--md-surface);stroke-width:11;stroke-linecap:butt}
.ouv.sans .trait{stroke:var(--md-on-surface-variant);stroke-width:1.5}
.ouv.sans .jambage{fill:none;stroke:var(--md-on-surface-variant);stroke-width:2;stroke-linecap:butt}
/* battants (clé « ouvrant ») : feuille et arc fins, comme sur un plan d'architecte */
.ouv .battant{fill:none;stroke:var(--md-on-surface-variant);stroke-width:2;stroke-linecap:round;pointer-events:none}
.ouv .battant.arc{stroke-width:1.2;stroke-dasharray:5 4}
.ouv.a-fiche{cursor:pointer}
.ouv.a-fiche:focus{outline:none}
.ouv.a-fiche:focus-visible .cible{stroke:color-mix(in srgb,var(--md-primary) 40%,transparent)}
.ouv.sans-clic{cursor:default}
.ouv.ouvert .trait{stroke:var(--a-c,var(--plan-ouvert));stroke-width:12}
/* animations (bibliothèque) : a-<type> sur l'élément, --a-d durée, --a-i intensité, --a-c couleur ; jouées seulement dans l'état concerné */
.ouv.ouvert.a-pulsation .trait{animation:pulse var(--a-d,1.6s) ease-in-out infinite}
.ouv.ouvert.a-respiration .trait{animation:respire var(--a-d) ease-in-out infinite}
.ouv.ouvert.a-clignote .trait{animation:clignote var(--a-d) steps(1) infinite}
.ouv.ouvert.a-defilement .trait{stroke-dasharray:18 10;animation:defile var(--a-d) linear infinite}
.ouv.ouvert.a-halo .cible{stroke:var(--a-c,var(--plan-ouvert));stroke-linecap:round;animation:halo-svg var(--a-d) ease-in-out infinite}
.ouv.ouvert.a-onde .cible{stroke:var(--a-c,var(--plan-ouvert));stroke-linecap:round;animation:onde-svg var(--a-d) ease-out infinite}
.ouv.bouge .trait{stroke:var(--warning-color,#f4b400);stroke-width:10;stroke-dasharray:18 10;animation:defile .8s linear infinite}
.ouv.inconnu .trait{stroke:var(--disabled-text-color,#999);stroke-dasharray:6 6}
.volet{fill:none;stroke:var(--plan-volet);stroke-width:8;stroke-linecap:butt;transition:opacity .4s var(--md-sys-motion)}
.volet.bouge{stroke:var(--a-c,var(--warning-color,#f4b400))}
.volet.bouge.a-defilement,.volet.bouge.a-halo,.volet.bouge.a-onde{stroke-dasharray:14 8;animation:defile var(--a-d,.8s) linear infinite}
.volet.bouge.a-pulsation{animation:pulse var(--a-d) ease-in-out infinite}
.volet.bouge.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.volet.bouge.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.volet.bouge.monte{animation-direction:reverse}
.halo{transition:opacity .5s var(--md-sys-motion);pointer-events:none}
.cq.fondu{isolation:isolate}.cq.fondu .halo.lampe{mix-blend-mode:screen}.lum{pointer-events:none}.lum .lum-b{mix-blend-mode:screen}
.calque{position:absolute;inset:0;pointer-events:none;font:500 clamp(10px,1.2cqw,13px)/1.3 var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.1px}
.calque>*{position:absolute;transform:translate(-50%,-50%);pointer-events:auto}
.calque>.etq.evite{transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,0px)))}
button{position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}
button::after{content:"";position:absolute;inset:0;border-radius:inherit;background:currentColor;opacity:0;transition:opacity .15s var(--md-sys-motion);pointer-events:none}
button:hover::after{opacity:.08}
button:active::after{opacity:.12}
button:focus-visible{outline:3px solid var(--md-primary);outline-offset:2px}
.etq{background:color-mix(in srgb,var(--md-surface) 88%,transparent);border:none;border-radius:12px;padding:.35em .75em;
  color:var(--plan-etq);font:inherit;text-align:center;cursor:pointer;box-shadow:0 1px 2px #0003,0 1px 3px 1px #0001}
.etq b{display:block;font-size:1.1em;font-weight:500}
.etq .val{color:var(--md-on-surface-variant);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap}
.etq .val:empty{display:none}
/* room_labels.name: false : nom retiré de l'étiquette (gardé pour les lecteurs d'écran ; estompé en édition) ; étiquette vide cachée en vue */
.etq b.cache{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.edition .etq b.cache{position:static;width:auto;height:auto;overflow:visible;clip:auto;white-space:normal;opacity:.4}
.corps:not(.edition) .etq:has(>b.cache):has(>.val:empty){display:none}
.etq.dehors{background:none;box-shadow:none;cursor:default}
.etq.dehors::after{display:none}
.etq.dehors b{color:var(--md-on-surface-variant)}
.pt{display:flex;align-items:center;gap:.35em;min-width:2.6em;height:2.6em;justify-content:center;padding:0 .55em;border:none;border-radius:999px;cursor:pointer;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:inherit;white-space:nowrap;
  box-shadow:0 1px 2px #0003,0 1px 3px 1px #0001;transition:background .3s var(--md-sys-motion),color .3s var(--md-sys-motion)}
.pt ha-icon{--mdc-icon-size:1.5em}
.pt .v{font-variant-numeric:tabular-nums}
.pt .v:empty{display:none}
.pt.actif{background:var(--pt-couleur);color:#fff}
.pt.actif.clair{color:#2b2000}
.pt.actif.a-pulsation,.pt.actif.a-defilement{animation:pulse var(--a-d,1.2s) ease-in-out infinite}
.pt.actif.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.pt.actif.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.pt.actif.a-halo{animation:halo-html var(--a-d) ease-in-out infinite}
.pt.actif.a-onde,.mb.actif.a-onde{overflow:visible}
.pt.actif.a-onde::before,.mb.actif.a-onde:not(.a-contour)::before{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid var(--a-c,var(--pt-couleur,var(--mb-couleur,var(--md-primary))));animation:onde-html var(--a-d) ease-out infinite;pointer-events:none}
.mb.actif.a-onde:not(.a-contour)::before{inset:6px;border-radius:50%}
.zone svg .meuble.connecte.actif.a-pulsation,.zone svg .meuble.connecte.actif.a-defilement{animation:pulse var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.zone svg .meuble.connecte.actif.a-halo *,.zone svg .meuble.connecte.actif.a-onde.a-contour *{animation:halo-mb var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-onde.a-contour *{animation-name:onde-mb;animation-timing-function:ease-out}
/* sélecteur d'étages : ascenseur (pile en haut à droite du plan, loin du zoom et de la vitrine du bas) ou barre d'onglets MD3 en haut de la carte */
.etages[hidden]{display:none!important} /* l'emporte sur .ascenseur / .onglets (display:flex) */
.etages .et-l{display:flex}
.etages button{position:relative;border:none;cursor:pointer;font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);color:var(--md-on-surface-variant);background:none}
.etages button:focus-visible{outline:2px solid var(--md-primary);outline-offset:2px}
.etages ha-icon{--mdc-icon-size:20px}
.etages.ascenseur{position:absolute;right:16px;top:16px;z-index:3;display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px;border-radius:16px;
  background:var(--md-surface-container-high);box-shadow:0 1px 3px #0003}
.etages.ascenseur.serre{right:64px} /* plan trop bas pour l'ascenseur et le zoom empilés : à gauche de la colonne du zoom */
.etages.ascenseur .et-l{flex-direction:column;gap:4px}
.etages.ascenseur button{width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
.etages.ascenseur button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.etages.ascenseur .et-b.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.etages.onglets{display:flex;align-items:stretch;gap:4px;margin:0 0 12px;border-bottom:1px solid var(--md-outline-variant);flex:none;overflow-x:auto;scrollbar-width:none}
.etages.onglets::-webkit-scrollbar{display:none}
.etages.onglets .et-l{flex:1;gap:0}
.etages.onglets button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 16px;flex:none;white-space:nowrap}
.etages.onglets button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.etages.onglets .et-b.on{color:var(--md-primary)}
.etages.onglets .et-b.on::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--md-primary)}
.etages.onglets .et-gerer{color:var(--md-primary)}
/* pastille d'alerte d'un étage (rouge : ouverture, alerte ; ambre : à surveiller), réservée sur chaque bouton */
.et-pastille{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;box-shadow:0 0 0 2px var(--md-surface-container-high);display:none}
.et-pastille.rouge{display:block;background:var(--md-error)}
.et-pastille.ambre{display:block;background:#f9a825}
.onglets .et-pastille{top:10px;right:6px}
/* petit plan (téléphone) : ascenseur plus compact */
@container (max-width:480px){.etages.ascenseur{right:8px;top:8px;padding:2px;gap:2px;border-radius:12px}.etages.ascenseur.serre{right:60px}
  .etages.ascenseur .et-l{gap:2px}.etages.ascenseur button{width:32px;height:32px;border-radius:10px}.etages.ascenseur .et-pastille{top:3px;right:3px}}
@media (prefers-reduced-motion:reduce){.etages button{transition:none}}
/* traces des derniers changements (ambiance) : --t = 1 juste après, 0 à la fin de la durée */
.ouv.trace .cible{stroke:var(--trace-c,var(--md-primary));stroke-opacity:calc(var(--t,0)*.45)}
.pt.trace,.mb.trace{box-shadow:0 0 0 calc(2px + 5px*var(--t,0)) color-mix(in srgb,var(--trace-c,var(--md-primary)) calc(var(--t,0)*60%),transparent),0 1px 2px #0003}
/* ambiance */
.amb{pointer-events:none}
.m-defile{animation:m-defile var(--m-d) linear infinite}
.m-glisse{animation:m-glisse var(--g-d) linear infinite}
.m-brume{animation:respire 14s ease-in-out infinite;--a-i:1}
/* effets légers (\`effects: light\`) : nuages et brouillard immobiles */
.effets-legers :is(.m-defile,.m-brume){animation:none}
.m-eclair{opacity:0;animation:m-eclair 9s linear infinite}
.calque>.amb-astre{pointer-events:auto;color:#f9a825;opacity:.85;--mdc-icon-size:1.35em;filter:drop-shadow(0 0 4px #f9a82580)}
.calque>.amb-astre[hidden]{display:none}
.zone.hors-ecran *,.zone.hors-ecran *::before{animation-play-state:paused!important}
/* zone d'informations */
.calque>.infob{display:flex;flex-direction:column;gap:2px;padding:.45em .75em;border-radius:.95em;min-width:6em;pointer-events:auto;white-space:nowrap;
  background:color-mix(in srgb,var(--md-surface-container-high) 92%,transparent);color:var(--md-on-surface);box-shadow:0 1px 3px #0004;font-weight:400}
.calque>.infob.discret{background:none;box-shadow:none}
.infob .ib-t{font-weight:500;margin-bottom:2px}
.infob .ib-l{display:flex;align-items:center;gap:.45em;cursor:pointer}
.edition .infob .ib-l{cursor:inherit}
.infob .ib-l ha-icon{--mdc-icon-size:1.2em;color:var(--md-primary);flex:none}
.infob .ib-n{color:var(--md-on-surface-variant);flex:1}
.infob .ib-n:empty{display:none}
.infob .ib-v{font-weight:500;font-variant-numeric:tabular-nums;margin-left:auto}
.infob .ib-l.indispo{opacity:.45}
.infob .ib-vide{color:var(--md-on-surface-variant);font-style:italic}
.badge-demo{display:inline-flex;align-items:center;height:24px;padding:0 10px;margin-left:8px;border-radius:12px;vertical-align:middle;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 12px/16px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.4px}
/* replay de la journée */
.plan.en-replay{box-shadow:inset 0 0 0 2px var(--md-primary)}
.zoom button.on{background:var(--md-primary);color:var(--md-on-primary)}
.replay{position:absolute;left:16px;right:72px;bottom:16px;z-index:4;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:16px;
  background:color-mix(in srgb,var(--md-surface-container-high) 94%,transparent);color:var(--md-on-surface);box-shadow:0 2px 8px #0005;
  font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);font-variant-numeric:tabular-nums}
.replay>ha-icon{color:var(--md-primary);margin-left:6px}
.replay .rp-msg{flex:1;min-width:0;color:var(--md-on-surface-variant)}
.rp-piste{position:relative;flex:1;min-width:80px;display:flex;align-items:center}
.rp-piste input{width:100%;margin:0;accent-color:var(--md-primary);position:relative;z-index:1;background:none}
.rp-marques{position:absolute;inset:0;pointer-events:none}
.rp-marques i{position:absolute;top:2px;bottom:2px;width:2px;margin-left:-1px;border-radius:1px;opacity:.75}
.rp-marques .m-ouv{background:var(--md-error)}
.rp-marques .m-lum{background:#f6c445;top:8px}
.rp-marques .m-pers{background:var(--md-primary);bottom:8px}
.rp-marques .autre{opacity:.25}
.rp-heure{min-width:4.5em;text-align:center}
.replay select{border:1px solid var(--md-outline-variant);border-radius:8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;padding:4px 6px}
@media (max-width:600px){.replay{left:8px;right:8px;bottom:64px;flex-wrap:wrap}.rp-piste{flex-basis:100%;order:5}.rp-heure{min-width:0;flex:none}
  .replay select{flex:none;width:auto;max-width:96px}.replay [data-rp=direct]{margin-left:auto}}
/* résumé sur plusieurs lignes, puces empilées */
.tete.lignes{flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:8px}
.tete-l{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
.pile{display:flex;flex-direction:column;gap:6px;min-width:0}
.plein .tete.lignes{overflow:visible}
.plein .tete-l{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.plein .tete-l::-webkit-scrollbar{display:none}
.plein .pile{flex:none}
.edition .chip[data-puce]{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.chip.glisse{opacity:.85;z-index:5;position:relative;box-shadow:0 6px 16px #0006;cursor:grabbing;pointer-events:none}
.tete{position:relative}
.puce-depot{position:absolute;z-index:10;background:var(--md-primary);border-radius:2px;pointer-events:none}
/* personnes */
.calque>.pers{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;background:none;padding:0;cursor:pointer;font:inherit;color:var(--md-on-surface);overflow:visible;
  transform:translate(calc(-50% + var(--dx,0)*2.9em),calc(-50% + 2.4em));transition:left 1.6s var(--md-sys-motion),top 1.6s var(--md-sys-motion),transform .6s var(--md-sys-motion);z-index:2}
.calque>.pers::after{display:none}
.pers .av{width:2.3em;height:2.3em;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:var(--md-primary);color:var(--md-on-primary);font-weight:600;
  box-shadow:0 0 0 2px var(--md-surface),0 0 0 4px var(--md-primary),0 2px 4px #0005;transition:filter .6s,opacity .6s}
.pers .av img{width:100%;height:100%;object-fit:cover}
.pers small{font-size:.8em;padding:0 .4em;border-radius:6px;background:color-mix(in srgb,var(--md-surface) 85%,transparent);white-space:nowrap}
.pers small:empty{display:none}
.calque>.pers.dehors{transform:translate(calc(-50% + var(--dx,0)*1em),-50%)}
.pers.dehors .av{filter:grayscale(.7);opacity:.8;box-shadow:0 0 0 2px var(--md-surface),0 0 0 4px var(--md-outline),0 2px 4px #0005}
.pers.inconnu .av{opacity:.4}
.calque>.pers.cache{display:none}
/* personnes dehors en rangée (dehors: zone) : puces discrètes côte à côte en bas du plan (--ox : décalage calculé depuis le centre) */
.calque>.pers.dehors.ailleurs{flex-direction:row;gap:.45em;padding:.2em .75em .2em .2em;border-radius:999px;background:color-mix(in srgb,var(--md-surface-container-high) 92%,transparent);
  box-shadow:0 1px 3px #0004;transform:translate(calc(-50% + var(--ox,0px)),calc(-100% - 8px))}
.pers.ailleurs .av{width:2em;height:2em;box-shadow:none}
.pers.ailleurs small{font-size:1em;padding:0;background:none;color:var(--md-on-surface-variant);max-width:9em;overflow:hidden;text-overflow:ellipsis}
.zone.amb-glisse .calque>.pers:not(.dehors){cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.zone.amb-glisse .calque>.pers.glisse{cursor:grabbing;transition:none}
/* alertes plein plan */
.alerte-voile{position:absolute;inset:8px;border-radius:8px;pointer-events:none;z-index:3;
  box-shadow:inset 0 0 0 3px var(--al-c),inset 0 0 70px 12px color-mix(in srgb,var(--al-c) 40%,transparent);animation:pulse 1.8s ease-in-out infinite}
.alerte-voile.info{animation:none;box-shadow:inset 0 0 0 2px var(--al-c)}
.bandeau-al{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:4;display:flex;align-items:center;gap:8px;max-width:calc(100% - 32px);box-sizing:border-box;
  padding:6px 6px 6px 14px;border-radius:12px;background:var(--md-surface-container-high);color:var(--md-on-surface);border:2px solid var(--al-c);box-shadow:0 4px 12px #0006;
  font:400 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif)}
.bandeau-al>ha-icon{color:var(--al-c);flex:none}
.bandeau-al .t{display:flex;flex-direction:column;min-width:0}
.bandeau-al .t small{color:var(--md-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.calque>.pt.en-alerte,.calque>.mb.en-alerte{overflow:visible}
.calque>.pt.en-alerte::before,.calque>.mb.en-alerte::before{content:"";position:absolute;inset:0;border-radius:inherit;border:3px solid var(--al-c,var(--md-error));animation:onde-html 1.4s ease-out infinite;pointer-events:none;--a-i:1}
.calque>.mb.en-alerte::before{inset:6px;border-radius:50%}
.zone svg .ouv.en-alerte .cible{stroke:var(--al-c,var(--md-error));stroke-linecap:round;animation:onde-svg 1.4s ease-out infinite;--a-i:1}
/* vitrine */
.vitrine{pointer-events:none}
.vitrine .vit-fond{fill:none;stroke:var(--md-outline-variant);stroke-width:1px;stroke-dasharray:4 4;vector-effect:non-scaling-stroke}
.vitrine .vit-dehors{fill:var(--md-surface-container-high)}
.calque>.vit,.calque>.vit-pt{pointer-events:none}
.calque>.vit{font-size:.82em;white-space:normal;text-align:center;max-width:10em;line-height:1.15}
.calque>.vit.titre-v{font-weight:500;color:var(--md-on-surface);max-width:none;white-space:nowrap}
.pt.indispo{opacity:.38}
/* bulles d'appareils (style_pastilles) : taille, valeur au survol (toujours visible sans survol, tactile) ou jamais, indisponible
   en pointillé, inactive estompée, cachée (sauf en alerte) */
.calque>.pt.bs-petit{font-size:.8em}
.calque>.pt.bs-grand{font-size:1.25em}
.pt.bs-v-jamais .v{display:none}
@media (hover:hover){.pt.bs-v-survol:not(:hover):not(:focus-visible) .v{display:none}}
.pt.indispo.bs-tirets{opacity:.75;background:none;color:var(--md-on-surface-variant);box-shadow:none;outline:1.5px dashed var(--md-outline);outline-offset:-1.5px}
.pt.bs-estompe{opacity:.5}
.calque>.pt.bs-cache:not(.en-alerte){display:none}
.txt{color:var(--md-on-surface-variant);font-weight:400;white-space:nowrap;pointer-events:none}
.calque>.txt[data-t]{font-size:calc(var(--zk,1)*1em)}
.mb{min-width:44px;min-height:44px;padding:0;border:none;border-radius:22px;background:none;color:var(--md-on-surface);font:inherit;cursor:pointer;display:grid;place-items:center}
span.mb{pointer-events:none}
.edition .calque>.mb{pointer-events:none}
.mb .v{padding:.15em .55em;border-radius:999px;background:var(--md-surface-container-high);font-size:.9em;font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 1px 2px #0003}
.mb .v:empty{display:none}
/* meuble de moins de 24 px à l'écran : badge resserré, police d'au moins 10 px (lisible), jamais masqué */
.mb.petit .v{font-size:max(10px,.72em);padding:.05em .4em}
.mb.actif .v{background:var(--mb-couleur,var(--md-primary));color:var(--md-on-primary)}
.mb.actif.clair .v{color:#2b2000}
.legende{display:flex;align-items:center;gap:8px 16px;justify-content:center;margin-top:12px;
  font:400 12px/16px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.4px;color:var(--md-on-surface-variant);flex-wrap:wrap}
.legende span{display:inline-flex;align-items:center;gap:6px}
.degrade{width:160px;height:8px;border-radius:4px}
.legende i{display:inline-block;width:18px;height:0;border-top:3.5px solid}
@keyframes pulse{50%{opacity:.35}}
@keyframes defile{to{stroke-dashoffset:-28}}
@keyframes respire{50%{opacity:calc(1 - .32*var(--a-i,1))}}
@keyframes clignote{50%{opacity:.12}}
@keyframes halo-svg{0%,100%{stroke-opacity:0}50%{stroke-opacity:calc(.35*var(--a-i,1))}}
@keyframes onde-svg{from{stroke-width:12px;stroke-opacity:calc(.6*var(--a-i,1))}to{stroke-width:calc(12px + 70px*var(--a-i,1));stroke-opacity:0}}
@keyframes halo-html{50%{box-shadow:0 0 0 calc(4px*var(--a-i,1)) color-mix(in srgb,var(--a-c,var(--pt-couleur)) 40%,transparent),0 0 calc(16px*var(--a-i,1)) var(--a-c,var(--pt-couleur))}}
@keyframes onde-html{from{transform:scale(1);opacity:.8}to{transform:scale(calc(1 + 1.1*var(--a-i,1)));opacity:0}}
@keyframes halo-mb{50%{stroke-width:calc(2px + 5px*var(--a-i,1));stroke-opacity:.5}}
@keyframes onde-mb{from{stroke-width:2px;stroke-opacity:1}70%{stroke-width:calc(2px + 12px*var(--a-i,1));stroke-opacity:0}to{stroke-width:2px;stroke-opacity:0}}
@keyframes m-defile{to{transform:translateY(var(--m-s))}}
@keyframes m-glisse{to{transform:translate(var(--g-x),var(--g-y))}}
@keyframes m-eclair{0%,92%,100%{opacity:0}93%{opacity:1}94%{opacity:0}95.5%{opacity:.7}97%{opacity:0}}
@media (prefers-reduced-motion:reduce){.alerte-voile,.ouv .trait,.ouv .cible,.volet,.pt,.pt::before,.mb::before,.zone svg .meuble,.zone svg .meuble *,.m-defile,.m-glisse,.m-brume{animation:none!important}.m-eclair{display:none}}
/* niveau d'animation (\`animation_level\`) : reduced = aucune boucle permanente (pulsations, ondes, météo, flux), changements d'état
   par des transitions courtes ; none = ni animation ni transition. Halos et ondes figés : liseré discret plutôt qu'un trait plein */
:is(.anim-reduit,.anim-aucune) :is(.alerte-voile,.ouv .trait,.ouv .cible,.volet,.pt,.mb,.zone svg .meuble,.zone svg .meuble *,.m-defile,.m-glisse,.m-brume),
  :is(.anim-reduit,.anim-aucune) :is(.pt,.mb)::before{animation:none!important}
:is(.anim-reduit,.anim-aucune) .m-eclair{display:none}
:is(.anim-reduit,.anim-aucune) .ouv:is(.ouvert.a-halo,.ouvert.a-onde,.en-alerte) .cible{stroke-opacity:.3}
.anim-reduit .piece,.anim-reduit .halo,.anim-reduit .volet,.anim-reduit .pers .av{transition-duration:.2s}
.anim-reduit .calque>.pers{transition-duration:.25s}
/* aube et crépuscule : par paliers en JS au niveau complet (_palier) ; transition courte au niveau réduit */
.anim-reduit .amb .amb-n,.anim-reduit .amb .amb-sol{transition:opacity .2s linear}
.anim-reduit .calque>.amb-astre{transition:left .25s linear,top .25s linear}
.anim-aucune,.anim-aucune *,.anim-aucune *::before,.anim-aucune *::after{transition:none!important;animation:none!important}
/* vue figée (\`interaction.lock_view\`) : ni déplacement ni zoom à la main, même dans la vue d'une pièce */
.zone.zoome.figee{touch-action:pan-y;cursor:auto}
/* pièce sans action au toucher (\`interaction.room_tap\`) */
.etq.inerte{cursor:default}
.etq.inerte::after{display:none}
`;

// fond assez clair pour un texte foncé (#2b2000) plutôt que blanc : on garde le plus contrasté des deux (WCAG 2.x) ;
// accepte #rgb, #rrggbb(aa) et rgb()/rgba() ; autre chose (var(), nom) : texte blanc
function clairPour(c) {
  const s = String(c || "").trim();
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s), v;
  if (m) { const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1].slice(0, 6); v = h.match(/../g).map((x) => parseInt(x, 16)); }
  else if ((m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(s))) v = m.slice(1, 4).map(Number);
  else return false;
  const lin = (x) => { x = Math.min(255, x) / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(v[0]) + 0.7152 * lin(v[1]) + 0.0722 * lin(v[2]), FONCE = 0.0152; // luminance de #2b2000
  return (L + 0.05) / (FONCE + 0.05) > 1.05 / (L + 0.05);
}
function dansPoly([x, y], poly) {
  let dedans = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
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
const BASCULES = ["light", "switch", "fan", "input_boolean", "humidifier"];
// entités d'une pièce HA (registre affiché par le frontend : hass.entities / hass.devices)
function entitesZone(hass, zone) {
  if (!zone) return [];
  const l = [];
  for (const [id, e] of Object.entries(hass.entities || {})) {
    if (e.hidden || e.entity_category || !hass.states[id]) continue;
    if ((e.area_id || hass.devices?.[e.device_id]?.area_id) === zone) l.push(id);
  }
  return l;
}
function ilya(iso) {
  if (!iso) return _t("jamais");
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return _t("à l'instant");
  if (s < 3600) return _t("il y a {n} min", { n: Math.round(s / 60) });
  if (s < 86400) return _t("il y a {n} h", { n: Math.round(s / 3600) });
  const j = Math.round(s / 86400);
  return j < 60 ? _t("il y a {n} j", { n: j }) : new Date(iso).toLocaleDateString(_loc());
}
// champs entité d'un widget (hors listes et colonnes) : liste unique (entités surveillées, modèles, choix de l'éditeur)
const CHAMPS_ENTITE_WIDGET = ["entite", "prix", "periode", "couleur_jour", "couleur_demain", "batterie", "autonomie", "puissance", "branche", "session_kwh", "session_cout"];
function entitesWidget(w) {
  const l = CHAMPS_ENTITE_WIDGET.map((k) => w[k]);
  for (const x of [...(w.lignes || []), ...(w.entites || [])]) l.push(typeof x === "string" ? x : x?.entite);
  for (const c of w.colonnes || []) l.push(c.jour, c.semaine, c.mois, c.annee);
  return l;
}
const CSS_BARRE = `
ha-card{container-type:inline-size}
.barre{display:flex;align-items:center;gap:4px;margin:0 0 12px 4px;min-height:40px}
.barre .titre{margin:0;flex:1}
.barre[hidden]{display:none}
/* mode tablette : le plan centré dans la hauteur de l'écran (tablette en portrait) */
ha-card.tablette .vue{align-items:center}
.ib{width:40px;height:40px;border-radius:50%;border:none;background:none;color:var(--md-on-surface-variant);cursor:pointer;display:inline-grid;place-items:center;flex:none}
.ib ha-icon{--mdc-icon-size:22px}
.ib[hidden]{display:none}
ha-card.plein{display:flex;flex-direction:column;box-sizing:border-box}
.plein .barre,.plein .legende{flex:none}
.corps{display:flex;gap:16px;align-items:flex-start;justify-content:center;min-height:0}
.plein .corps{flex:1}
.vue{display:flex;gap:16px;align-items:flex-start;justify-content:center;min-height:0;min-width:0;flex:1 1 auto;align-self:stretch}
.corps.edition:not(.colonne)>.vue{flex:none;align-self:flex-start}
.corps.colonne,.corps.colonne>.vue{flex-direction:column;align-items:center}
.corps.colonne>.vue{width:100%;flex:none}
.vue>.col{flex:0 0 320px;align-self:stretch;min-height:0;overflow:auto;box-sizing:border-box;scrollbar-width:none}
.vue>.col::-webkit-scrollbar{display:none}
.col-in{display:flex;flex-direction:column;gap:12px}
.vue>.col[hidden]{display:none}
.col>.widgets{display:flex;flex-direction:column;gap:12px}
.col>.widgets:empty{display:none}
.corps.colonne .vue>.col{flex:1 1 auto;width:100%;max-width:720px}
ha-card:not(.plein) .corps.colonne .vue>.col{flex:none;overflow:visible}
.w{background:var(--md-surface-container);border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;color:var(--md-on-surface);
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);position:relative}
.w.sel{outline:3px solid var(--md-primary);outline-offset:2px}
.w-ajout{display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;border-radius:16px;border:2px dashed var(--md-outline-variant);background:none;
  color:var(--md-primary);cursor:pointer;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
/* écarté du widget au-dessus : son contour de sélection (3 px + 2 px) ne passe plus dessous */
.w+.w-ajout{margin-top:12px}
.w-ajout:hover{background:color-mix(in srgb,var(--md-primary) 8%,transparent)}
.edition .w{cursor:pointer;user-select:none;-webkit-user-select:none}
.w.w-sep{background:none;padding:2px 4px;flex-direction:row;align-items:center;gap:12px;min-height:0;color:var(--md-on-surface-variant);
  font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.w.w-sep::after{content:"";flex:1;border-top:1px solid var(--md-outline-variant)}
.w.w-sep.vide{gap:0}
.edition .w.w-sep{min-height:24px}
.w.glisse{opacity:.35}
.w-fantome{position:fixed;z-index:20;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;transform:rotate(1.5deg)}
.w-depot{height:4px;border-radius:2px;background:var(--md-primary);margin:-8px 0}
.w-tete{display:flex;align-items:center;gap:8px;color:var(--md-on-surface-variant);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.w-tete ha-icon{--mdc-icon-size:18px;color:var(--w-couleur,var(--md-primary))}
.w-tete .d{margin-left:auto;font-weight:400;font-size:12px}
.w-grand{display:flex;align-items:baseline;gap:6px;font:400 36px/44px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums;cursor:pointer}
.w-grand small{font-size:16px;line-height:24px;color:var(--md-on-surface-variant)}
.w-lignes{display:flex;flex-direction:column}
.w-climat{display:grid;grid-template-columns:minmax(4.5em,1fr) auto auto;gap:2px 10px;align-items:center}
.w-climat .n{min-width:0;overflow-wrap:anywhere;line-height:1.2;color:var(--md-on-surface-variant);min-height:32px;display:flex;align-items:center}
.w-climat .m{display:inline-flex;align-items:center;justify-content:flex-end;gap:3px;font-variant-numeric:tabular-nums;white-space:nowrap;cursor:pointer}
.w-climat .m ha-icon{--mdc-icon-size:16px;color:var(--md-on-surface-variant)}
.w-climat .m small{color:var(--md-on-surface-variant);font-size:.78em;min-width:2.6em;text-align:right}
.w-climat .m.monte ha-icon{color:#e8710a}.w-climat .m.descend ha-icon{color:#1a73e8}
.w-climat .m.alerte,.w-climat .m.alerte ha-icon,.w-climat .m.alerte small{color:var(--md-error)}
.w-climat .m.vide{color:var(--md-on-surface-variant)}
.w-climat .n.moy{color:var(--md-on-surface);font-weight:500}
.w-th{display:grid;grid-template-columns:1fr auto;gap:4px 16px;align-items:center}
.w-th small{display:block;color:var(--md-on-surface-variant);font-size:12px;font-weight:400}
.w-th b{font-size:28px;line-height:34px;font-weight:400;font-variant-numeric:tabular-nums}
.w-th b small{display:inline;font-size:14px}
.w-th .mes{cursor:pointer}
.w-th .cons{display:flex;align-items:center;gap:8px;text-align:center}
.w-th .th-b{width:40px;height:40px;border-radius:50%;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.w-th .th-b[aria-disabled="true"]{opacity:.4;pointer-events:none}
.w-th .mode{grid-column:1/-1}
.w-alerte{display:inline-flex;align-items:center;gap:2px;color:var(--md-error);font-weight:500}.w-alerte ha-icon{--mdc-icon-size:16px}
.w-ligne{display:flex;align-items:center;gap:12px;min-height:36px;cursor:pointer;border-radius:8px}
.w-ligne ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}
.w-ligne .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--md-on-surface-variant)}
.w-ligne .v{font-variant-numeric:tabular-nums;white-space:nowrap}
.w-ligne .bascule{transform:scale(.8);transform-origin:right center}
.w-courbe{width:100%;height:56px;display:block}
.w-courbe path.l{fill:none;stroke:var(--w-couleur,var(--md-primary));stroke-width:2;vector-effect:non-scaling-stroke}
.w-courbe path.a{fill:color-mix(in srgb,var(--w-couleur,var(--md-primary)) 18%,transparent);stroke:none}
.w-jauge{display:grid;place-items:center;position:relative;cursor:pointer}
.w-jauge svg{width:100%;max-width:220px;height:auto}
.w-jauge .val{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);text-align:center;font:400 32px/40px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums}
.w-jauge .val small{display:block;font-size:13px;line-height:18px;color:var(--md-on-surface-variant)}
.w-bornes{display:flex;justify-content:space-between;color:var(--md-on-surface-variant);font-size:12px;margin-top:-18px;padding:0 8%}
.pastilles{display:flex;flex-wrap:wrap;gap:8px}
.pastille{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:8px;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif);
  background:var(--md-surface-container-high);color:var(--md-on-surface);cursor:pointer}
.pastille i{width:10px;height:10px;border-radius:50%;background:var(--p-couleur,var(--md-outline));box-shadow:0 0 0 1px #0003 inset}
.pastille.forte{background:var(--p-couleur);color:var(--p-texte,#fff)}
.w-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.w-table th{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.4px;color:var(--md-on-surface-variant);text-align:right;padding:4px 0 6px 8px;white-space:nowrap}
.w-table th:first-child,.w-table td:first-child{text-align:left;padding-left:0}
.w-table td{padding:7px 0 7px 8px;border-top:1px solid var(--md-outline-variant);text-align:right;white-space:nowrap}
.w-table td:first-child{color:var(--md-on-surface-variant)}
.w-table td.e{cursor:pointer}
.w-table .vide{color:var(--md-outline)}
.w-note{color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.w-note.w-fiche{display:flex;align-items:center;gap:8px;font-size:13px;line-height:18px;padding:0 4px}
.w-note.w-fiche ha-icon{--mdc-icon-size:18px;color:var(--md-primary);flex:none}
/* commande d'une cover : état, position (indicateur linéaire MD3), trois boutons tonals ; armé = rouge « Confirmer ? » */
.w-cmd{display:flex;flex-direction:column;gap:10px}
.w-cmd .w-grand{font-size:28px;line-height:36px}
.w-cmd .w-grand small ha-icon{--mdc-icon-size:18px;color:var(--md-on-surface-variant)}
.w-pos{height:4px;border-radius:2px;background:var(--md-secondary-container);overflow:hidden}
.w-pos i{display:block;height:100%;border-radius:2px;background:var(--w-couleur,var(--md-primary));transition:width .6s var(--md-sys-motion)}
.w-cmd-btns{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px}
.w-serrure .w-cmd-btns .cta{padding:0 10px;gap:6px}
.w-grand.alerte,.w-ligne .v.alerte{color:var(--md-error)}
.w-ligne .v.alerte{font-weight:500}
.w-activer{flex:none;height:28px;padding:0 12px;border-radius:14px;border:none;background:var(--md-secondary-container);color:var(--md-on-secondary-container);cursor:pointer;
  font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap}
.w-activer:hover{background:color-mix(in srgb,var(--md-on-secondary-container) 8%,var(--md-secondary-container))}
.w-activer.fait{background:var(--md-primary);color:var(--md-on-primary)}
.w-activer[aria-disabled=true]{opacity:.38;cursor:default}
.w-cmd-btns .cta{justify-content:center;padding:0 12px;min-width:0;white-space:nowrap}
.w-cmd-btns .cta[aria-disabled=true]{opacity:.38;cursor:default}
.w-cmd-btns .cta[aria-disabled=true]::after{display:none}
.w-note.w-err{color:var(--md-error)}
.w-ve{display:flex;align-items:center;gap:16px}
.w-ve .anneau{width:96px;height:96px;flex:none;position:relative;cursor:pointer}
.w-ve .anneau svg{width:100%;height:100%;transform:rotate(-90deg)}
.w-ve .anneau b{position:absolute;inset:0;display:grid;place-items:center;font:500 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.w-ve .etat{display:flex;flex-direction:column;gap:6px;min-width:0}
.edition .calque>*{cursor:grab}
.edition .txt{pointer-events:auto}
.edition .etq.dehors{cursor:grab}
.calque>.sel{outline:3px solid var(--md-primary);outline-offset:3px}
.zone{position:relative;overflow:hidden;border-radius:8px;touch-action:pan-y}
.zone.zoome{touch-action:none;cursor:grab}
.zone.zoome.panne{cursor:grabbing}
.zoom{position:absolute;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;z-index:2}
.zoom button{width:40px;height:40px;border-radius:12px;border:none;cursor:pointer;display:grid;place-items:center;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 1px 3px #0004,0 4px 8px 3px #0001}
.zoom button ha-icon{--mdc-icon-size:22px}
.zoom button[hidden]{display:none}
/* souris : boutons estompés 5 s après la sortie du curseur (classe « repli », classe-zoom.js) ; jamais au clavier (focus visible) ni menu Calques ouvert ;
   un toucher sur un bouton estompé le fait revenir sans agir (classe-zoom.js).
   Ordre fixe : « tout le plan » au-dessus (la colonne part du bas : rien ne bouge quand il apparaît), plus et moins toujours à la même place */
.zoom{transition:opacity .2s var(--md-sys-motion)}
.zoom.repli:not(.en-tete):not(:has(:focus-visible)):not(:has(.menu-cq)){opacity:0}
.zoom [data-z=tout]{order:-1}
@media (prefers-reduced-motion:reduce){.zoom{transition:none}}
/* boutons de zoom dans l'en-tête (téléphone, ou interaction.boutons_zoom: header) : en ligne, hors du plan ; cachés : plus, moins, tout le plan */
.zoom.en-tete{position:static;flex-direction:row;gap:0;opacity:1;pointer-events:auto;flex:none}
/* dans l'en-tête : boutons plats comme le bouton d'édition voisin (le titre garde sa ligne sur téléphone) */
.zoom.en-tete button{width:32px;height:32px;border-radius:50%;background:transparent;box-shadow:none;color:var(--md-on-surface-variant)}
.zoom.en-tete button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.zoom.en-tete button ha-icon{--mdc-icon-size:20px}
.zoom.en-tete button.on{background:var(--md-primary);color:var(--md-on-primary)}
.barre:has(>.zoom.en-tete) .titre{min-width:0;font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:380px){.barre:has(>.zoom.en-tete) .titre{font-size:18px}}
.zoom.caches [data-z=plus],.zoom.caches [data-z=moins],.zoom.caches [data-z=tout]{display:none}
/* calques en édition : masqué = en transparence et non cliquable, verrouillé = transparent au clic ; élément masqué en vue = en transparence */
.edition .c-masque,.edition .e-masque{opacity:.25}
.edition .zone svg .cq.c-masque,.edition .zone svg .cq.c-masque *,.edition .zone svg .cq.c-verrou,.edition .zone svg .cq.c-verrou *,
  .edition .calque>.c-masque,.edition .calque>.c-verrou{pointer-events:none!important}
.menu-cq{position:absolute;right:52px;bottom:0;min-width:220px;max-height:min(360px,70vh);overflow:auto;padding:8px 0;border-radius:4px;background:var(--md-surface-container);
  color:var(--md-on-surface);box-shadow:0 2px 6px 2px #0002,0 1px 2px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);z-index:3}
.menu-cq .t{padding:4px 16px 8px;color:var(--md-on-surface-variant);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.menu-cq label{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px 0 12px;cursor:pointer;white-space:nowrap}
.menu-cq label:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.menu-cq input{width:18px;height:18px;margin:0;accent-color:var(--md-primary);flex:none}
.menu-cq ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}
.menu-cq label:has(input:not(:checked)) span{color:var(--md-on-surface-variant)}
.voile{fill:var(--md-surface);opacity:.78;cursor:zoom-out}
.calque>.hors{opacity:.15;pointer-events:none}
.retour{cursor:pointer;margin-right:4px}
.retour[hidden]{display:none}
.barre .fil{color:var(--md-on-surface-variant);font-weight:400}
.fiche{border-radius:16px;background:var(--md-surface-container);padding:8px 0}
.fiche[hidden]{display:none}
.fiche header{display:flex;align-items:baseline;gap:12px;padding:8px 16px 4px;flex-wrap:wrap}
.fiche header b{font:500 16px/24px var(--ha-font-family-body,Roboto,sans-serif)}
.fiche header span{color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums}
.fiche h4{margin:12px 16px 0;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ligne{display:flex;align-items:center;gap:16px;width:100%;min-height:56px;padding:8px 16px;border:none;background:none;color:var(--md-on-surface);
  text-align:left;cursor:pointer;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);box-sizing:border-box}
.ligne .ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--md-secondary-container);color:var(--md-on-secondary-container);flex:none}
.ligne .ic.on{background:var(--pt-couleur);color:#fff}
.ligne .ic.on.clair{color:#2b2000}
.ligne .ic.alerte{background:var(--md-error-container);color:var(--md-on-error-container)}
.ligne .n{flex:1;min-width:0}
.ligne .n span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;line-height:24px}
.ligne .n small{color:var(--md-on-surface-variant)}
.ligne .n span.deux{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.fiche .actions .cta{padding:0 14px 0 10px}
.bascule{appearance:none;width:52px;height:32px;border-radius:16px;border:2px solid var(--md-outline);background:var(--md-surface-container-high);position:relative;cursor:pointer;flex:none;margin:0}
.bascule::before{content:"";position:absolute;width:16px;height:16px;border-radius:50%;background:var(--md-outline);top:6px;left:6px;transition:all .2s var(--md-sys-motion)}
.bascule:checked{background:var(--md-primary);border-color:var(--md-primary)}
.bascule:checked::before{width:24px;height:24px;top:2px;left:22px;background:var(--md-on-primary)}
.fiche .vide{padding:8px 16px 12px;color:var(--md-on-surface-variant)}
.actions{display:flex;flex-wrap:wrap;gap:8px;padding:8px 16px 4px}
.cta{height:40px;padding:0 20px 0 16px;border-radius:20px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.cta ha-icon{--mdc-icon-size:18px}
.cta.plein{background:var(--md-primary);color:var(--md-on-primary)}
.cta.confirmer{background:var(--md-error);color:#fff}
.cta.fait{background:#188038;color:#fff}
/* mini-fiche d'un meuble connecté : fenêtre MD3 sur PC, feuille du bas au téléphone */
dialog.mf{border:none;padding:0;border-radius:28px;width:min(420px,calc(100vw - 32px));max-height:min(92vh,calc(100vh - 32px));overflow:hidden;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
/* PC : plus large avec 2 widgets (deux colonnes) ou 3 et plus (trois colonnes), le défilement ne vient qu'en dernier recours */
dialog.mf.l2{width:min(760px,calc(100vw - 48px))}
dialog.mf.l3{width:min(1120px,calc(100vw - 48px))}
dialog.mf::backdrop{background:#0008}
dialog.mf[open]{animation:mf-entree .2s var(--md-sys-motion)}
@keyframes mf-entree{from{opacity:0;transform:translateY(12px)}}
.mf-in{display:flex;flex-direction:column;max-height:inherit}
.mf header{display:flex;align-items:center;gap:12px;padding:20px 12px 12px 20px;flex:none}
.mf header .ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.mf header .ic.on{background:var(--mb-couleur,var(--md-primary));color:var(--md-on-primary)}
.mf header .ic.on.clair{color:#2b2000}
.mf header .ic.alerte{background:var(--md-error-container);color:var(--md-on-error-container)}
.mf header .n{flex:1;min-width:0}
.mf h2{margin:0;font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif);overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere}
.mf .etat{display:block;color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums}
.mf-protege{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 20px 8px;padding:8px 12px;border-radius:12px;background:var(--md-surface-container);color:var(--md-on-surface-variant);font-size:13px}
.mf-protege ha-icon{--mdc-icon-size:18px;color:var(--md-primary)}
.mf-protege span{flex:1}
.mf-protege .cta{padding:0 16px 0 12px;height:32px}
.mf-w{overflow:auto;padding:4px 16px 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));align-items:start;gap:12px;min-height:0}
.mf-w>.w-sep,.mf-w>.w-note{grid-column:1/-1}
.mf-w:empty{display:none}
.mf-w{padding-bottom:20px}
@media (max-width:600px){dialog.mf,dialog.mf.l2,dialog.mf.l3{width:100%;max-width:100%;margin:auto 0 0;border-radius:28px 28px 0 0;max-height:85vh}
  @keyframes mf-entree{from{transform:translateY(40%)}}
  .mf-in::before{content:"";display:block;width:32px;height:4px;border-radius:2px;margin:12px auto -8px;background:var(--md-on-surface-variant);opacity:.4}}
@media (prefers-reduced-motion:reduce){dialog.mf[open]{animation:none}}
/* confirmation d'un service sensible : dialogue de base MD3 (icône, titre, texte, deux boutons), centré sur PC comme au téléphone */
dialog.conf{border:none;padding:24px;border-radius:28px;width:min(400px,calc(100vw - 48px));box-sizing:border-box;background:var(--md-surface-container-high);color:var(--md-on-surface);
  box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
dialog.conf::backdrop{background:#0008}
dialog.conf[open]{animation:conf-entree .2s var(--md-sys-motion)}
@keyframes conf-entree{from{opacity:0;transform:scale(.96)}}
.conf-ic{display:block;margin:0 auto 16px;width:24px;--mdc-icon-size:24px;color:var(--md-error)}
.conf h2{margin:0 0 16px;text-align:center;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif);overflow-wrap:anywhere}
.conf p{margin:0 0 8px;color:var(--md-on-surface-variant);overflow-wrap:anywhere}
.conf code{font:500 13px/18px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--md-on-surface)}
.conf ul{margin:0 0 8px;padding:0;list-style:none;max-height:min(30vh,200px);overflow:auto}
.conf li{display:flex;flex-direction:column;padding:6px 12px;border-radius:12px;background:var(--md-surface-container);margin:0 0 4px;overflow-wrap:anywhere}
.conf li small{color:var(--md-on-surface-variant);font-size:12px}
.conf-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:24px}
.conf-actions button{height:40px;padding:0 24px;border-radius:20px;border:none;cursor:pointer;background:none;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.conf-actions button:hover{background:color-mix(in srgb,var(--md-primary) 8%,transparent)}
.conf-actions .oui{background:var(--md-error);color:#fff}
.conf-actions .oui:hover{background:color-mix(in srgb,#fff 8%,var(--md-error))}
@media (prefers-reduced-motion:reduce){dialog.conf[open]{animation:none}}
`;

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
  // pergola : poteaux aux coins et lames ; reliée à un `cover` (pergola bioclimatique), les lames s'affinent en s'ouvrant (voir _majVelux)
  pergola: { nom: _tk("Pergola"), cat: _tk("Extérieur"), taille: [400, 300], mots: "bioclimatique tonnelle auvent lames terrasse", d: (w, h) => {
    const p = +Math.max(4, Math.min(14, w * 0.06, h * 0.06)).toFixed(1), n = Math.max(2, Math.round((h - 2 * p) / 22)), pas = (h - 2 * p) / n, e = +(pas * 0.7).toFixed(1);
    let s = R_(-w / 2, -h / 2, w, h, 2, "vide") + [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => R_(a > 0 ? w / 2 - p : -w / 2, b > 0 ? h / 2 - p : -h / 2, p, p, 1)).join("");
    for (let k = 0; k < n; k++) {
      const y = +(-h / 2 + p + pas * (k + 0.5)).toFixed(1);
      s += `<rect class="pg-lame" x="${+(-w / 2 + p).toFixed(1)}" y="${+(y - e / 2).toFixed(1)}" width="${+Math.max(0, w - 2 * p).toFixed(1)}" height="${e}" rx="1" data-c="${y}" data-e="${e}"/>`;
    }
    return s; } },
  // abri de jardin, cabanon : toit à deux pans vu du dessus (faîtage au milieu, arêtes vers les coins) et porte sur le bas
  abri: { nom: _tk("Abri de jardin / cabanon"), cat: _tk("Extérieur"), taille: [250, 200], mots: "cabane remise dépendance atelier shed", d: (w, h) => {
    const f = Math.min(w * 0.3, h / 2), pw = Math.min(90, w * 0.4);
    return R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2 + f, 0, w / 2 - f, 0) + L_(-w / 2, -h / 2, -w / 2 + f, 0) + L_(-w / 2, h / 2, -w / 2 + f, 0) + L_(w / 2, -h / 2, w / 2 - f, 0) + L_(w / 2, h / 2, w / 2 - f, 0)
      + `<path class="ligne" d="M${-pw / 2} ${h / 2}H${pw / 2}" style="stroke-width:5px"/>`; } },
  piscine: { nom: _tk("Piscine"), cat: _tk("Extérieur"), taille: [800, 400], d: (w, h) => R_(-w / 2, -h / 2, w, h, 20) + R_(-w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 14, "eau") },
};
// tapis et espaces sous les autres meubles, quel que soit l'ordre de pose
MEUBLES.tapis.niveau = 0;
Object.assign(MEUBLES.canape, { mots: "sofa divan" }); Object.assign(MEUBLES.refrigerateur, { mots: "frigo congelateur" }); Object.assign(MEUBLES.wc, { mots: "toilettes" });
Object.assign(MEUBLES.plan_travail, { mots: "cuisine ilot comptoir" }); Object.assign(MEUBLES.lave_linge, { mots: "machine a laver seche linge" });
Object.assign(MEUBLES.chaudiere, { mots: "gaz chauffe eau" }); Object.assign(MEUBLES.armoire, { mots: "placard penderie dressing" }); Object.assign(MEUBLES.plante, { mots: "fleur pot" });
Object.setPrototypeOf(MEUBLES, null); // « constructor », « toString »… ne sont pas des types de meuble
// YAML écrit à la main : on remet chaque meuble dans une forme que le dessin et l'éditeur savent lire (sans perdre les clés inconnues)
const normaliserMeubles = (liste) => (Array.isArray(liste) ? liste : []).filter((m) => m && typeof m === "object" && !Array.isArray(m)).map((m) => {
  const n = { ...m }, def = MEUBLES[n.type];
  n.pos = [nb(n.pos?.[0]), nb(n.pos?.[1])];
  if (n.taille != null) {
    const t = Array.isArray(n.taille) ? n.taille : [n.taille, n.taille], d = def?.taille || [60, 60];
    n.taille = [bornerTaille(t[0], d[0]), bornerTaille(t[1] ?? t[0], d[1])];
  }
  if (n.rotation != null) n.rotation = nb(n.rotation);
  if (n.chaises != null) n.chaises = Math.max(0, Math.min(12, Math.round(nb(n.chaises))));
  // fenêtre de toit : pente du toit 0 à 75° (défaut 40 à l'affichage), hauteur du bas de la fenêtre au-dessus du sol en cm (défaut 200)
  for (const [k, max] of [["pente", 75], ["hauteur", 1000]]) if (k in n) { if (num(n[k])) n[k] = Math.min(max, Math.max(0, +n[k])); else delete n[k]; }
  // escalier : `etage` (étage où il mène) est un identifiant, vérifié ensuite avec la liste des étages
  if ("etage" in n && !(typeof n.etage === "string" && ID_SUR.test(n.etage))) n.etage = null;
  if (n.teinte != null) n.teinte = n.teinte !== false && n.teinte !== "false";
  if (n.type === "forme") n.forme = normaliserForme(n.forme); else delete n.forme;
  // meuble connecté : mêmes clés que les pastilles ; une valeur invalide est retirée, jamais d'erreur
  for (const k of ["entite", "valeur", "actif"]) if (k in n && !(typeof n[k] === "string" && n[k].includes("."))) delete n[k];
  for (const k of ["unite", "actif_attribut", "attribut", "couleur"]) if (k in n && typeof n[k] !== "string") delete n[k];
  if ("couleur" in n && !couleurEcrite(n.couleur)) delete n.couleur;
  if ("seuil" in n) { if (n.seuil !== "" && n.seuil !== null && typeof n.seuil !== "boolean" && Number.isFinite(+n.seuil)) n.seuil = +n.seuil; else delete n.seuil; }
  if ("decimales" in n) { if (n.decimales !== null && n.decimales !== "" && Number.isFinite(+n.decimales)) n.decimales = Math.max(0, Math.min(6, Math.round(+n.decimales))); else delete n.decimales; }
  normaliserFiche(n);
  return n;
});
// valeur affichée d'un meuble ou d'une pastille sur un thermostat (climate) sans `attribute` ni `value` : sa consigne (température
// voulue, ou plage basse – haute), avec l'unité de HA ; rien d'autre (état « Chauffe » seul) si le thermostat n'en donne pas
const consigneClimat = (s, p, hass) => {
  if (!s || p.attribut || !String(p.entite || "").startsWith("climate.")) return "";
  const a = s.attributes || {}, u = p.unite ?? ` ${hass?.config?.unit_system?.temperature || "°C"}`, f = (x) => fmt(+x, p.decimales ?? 1), ok = (x) => x !== null && x !== "" && Number.isFinite(+x);
  if (ok(a.temperature)) return `${f(a.temperature)}${u}`;
  if (ok(a.target_temp_low) && ok(a.target_temp_high)) return `${f(a.target_temp_low)} – ${f(a.target_temp_high)}${u}`;
  return "";
};
// `clic`, `protege` et `fiche` d'un meuble, d'une ouverture ou d'une pastille (objet déjà copié) : valeur invalide retirée ou corrigée
function normaliserFiche(n) {
  if ("clic" in n && !CLICS_MEUBLE.includes(n.clic)) delete n.clic;
  if ("protege" in n && typeof n.protege !== "boolean") n.protege = !!n.protege;
  if ("fiche" in n) {
    const f = Array.isArray(n.fiche) ? { widgets: n.fiche } : n.fiche;
    if (!f || typeof f !== "object") delete n.fiche;
    else {
      n.fiche = { ...f };
      if ("titre" in n.fiche && typeof n.fiche.titre !== "string") n.fiche.titre = n.fiche.titre == null ? "" : String(n.fiche.titre);
      if ("widgets" in n.fiche) n.fiche.widgets = normaliserWidgets((Array.isArray(n.fiche.widgets) ? n.fiche.widgets : []).filter((w) => w && typeof w === "object" && !Array.isArray(w)));
      // bouton « Plus d'infos » : false (masqué), une entité, un chemin de tableau de bord (/…) ou une URL (http…) ; sinon valeur par défaut
      if ("plus_infos" in n.fiche) {
        const v = n.fiche.plus_infos;
        if (v === false || v === "false" || v === "none") n.fiche.plus_infos = false;
        else if (typeof v === "string" && v.trim()) n.fiche.plus_infos = v.trim();
        else delete n.fiche.plus_infos;
      }
    }
  }
  return n;
}
// capteurs d'une ouverture : `contact` est une entité ou une liste (baie à plusieurs capteurs : ouverte dès que l'un l'est)
const contactsDe = (o) => (Array.isArray(o?.contact) ? o.contact : [o?.contact]).filter((e) => typeof e === "string" && e.includes("."));
// entité de référence d'une ouverture (nom, « plus d'infos », repères) : le premier contact, sinon l'entité motorisée
const entOuv = (o) => contactsDe(o)[0] || o?.entite;
const ETATS_MUETS = ["unavailable", "unknown"];
// état combiné de plusieurs capteurs : ouvert si l'un l'est (depuis le premier ouvert), puis en mouvement, puis fermé dès qu'un
// capteur répond (depuis le dernier fermé) ; indisponible seulement si aucun ne répond
function etatCombine(ss) {
  const l = ss.filter(Boolean), t = (s) => Date.parse(s.last_changed) || 0;
  const ouv = l.filter((s) => s.state === "on" || s.state === "open");
  if (ouv.length) return ouv.reduce((a, b) => (t(b) < t(a) ? b : a));
  const bouge = l.find((s) => s.state === "opening" || s.state === "closing");
  if (bouge) return bouge;
  const ok = l.filter((s) => !ETATS_MUETS.includes(s.state));
  return ok.length ? ok.reduce((a, b) => (t(b) > t(a) ? b : a)) : l[0];
}
// ouvertures : `battants` 1 ou 2, `ouvrant` connu, `vers_dehors` booléen ; une valeur invalide est retirée (seules les ouvertures
// qui portent ces clés sont copiées)
const normaliserOuvertures = (l) => (Array.isArray(l) ? l.map((o) => {
  if (!o || typeof o !== "object" || !("battants" in o || "ouvrant" in o || "vers_dehors" in o)) return o;
  const n = { ...o };
  if ("battants" in n) { if (+n.battants === 1 || +n.battants === 2) n.battants = +n.battants; else delete n.battants; }
  if ("ouvrant" in n && !OUVRANTS.includes(n.ouvrant)) delete n.ouvrant;
  if ("vers_dehors" in n) { if (n.vers_dehors === true || n.vers_dehors === "true") n.vers_dehors = true; else delete n.vers_dehors; }
  return n;
}) : l);
// modèles de meubles (« Mes modèles ») : couleur validée, forme bornée, comme un meuble posé (rien n'est dessiné d'un modèle invalide)
const normaliserModeles = (l) => (Array.isArray(l) ? l.map((m) => {
  if (!m || typeof m !== "object" || m.genre !== "meuble" || !m.objet || typeof m.objet !== "object") return m;
  const o = { ...m.objet };
  if ("couleur" in o && !couleurEcrite(o.couleur)) delete o.couleur;
  if ("forme" in o) o.forme = normaliserForme(o.forme);
  if ("taille" in o) { const t = Array.isArray(o.taille) ? o.taille : [o.taille, o.taille]; o.taille = [0, 1].map((j) => bornerTaille(t[j] ?? t[0])); }
  const n = { ...m, objet: o };
  if ("cat" in n && !Object.hasOwn(V_CATS_MEUBLES, n.cat)) delete n.cat;
  return n;
}) : l);
// ouvertures et pastilles : seules celles qui portent `clic`, `protege` ou `fiche` sont copiées (les autres restent telles quelles)
const normaliserPorteurs = (liste) => (Array.isArray(liste) ? liste.map((o) => (o && typeof o === "object" && !Array.isArray(o) && ("clic" in o || "protege" in o || "fiche" in o) ? normaliserFiche({ ...o }) : o)) : liste);
// widgets `commande` (entité cover ou valve seulement) et `serrure` (lock seulement) : `confirmer` booléen, `lignes` en liste ;
// les autres widgets ne sont pas touchés
const DOMAINES_CMD = { commande: /^(cover|valve)\./, serrure: /^lock\./ };
const normaliserWidgets = (l) => (Array.isArray(l) ? l.map((w) => {
  if (!Object.hasOwn(DOMAINES_CMD, w?.type)) return w;
  const n = { ...w };
  if ("entite" in n && !(typeof n.entite === "string" && DOMAINES_CMD[w.type].test(n.entite))) delete n.entite;
  if ("confirmer" in n && typeof n.confirmer !== "boolean") { if (n.confirmer == null || n.confirmer === "") delete n.confirmer; else n.confirmer = !["false", "non", "0", "off", "no"].includes(String(n.confirmer).toLowerCase()); }
  if ("lignes" in n && !Array.isArray(n.lignes)) delete n.lignes;
  return n;
}) : l);
// widgets des panneaux (maison et pièces) : même normalisation, la config d'origine n'est jamais modifiée
function normaliserPanneaux(p) {
  if (!p || typeof p !== "object" || Array.isArray(p) || ![p.gauche, p.droite].some((l) => Array.isArray(l) && l.some((w) => Object.hasOwn(DOMAINES_CMD, w?.type)))) return p;
  const n = { ...p };
  for (const k of ["gauche", "droite"]) if (Array.isArray(n[k])) n[k] = normaliserWidgets(n[k]);
  return n;
}
// meuble connecté : lié à une entité, une valeur ou une fiche ; au toucher : fiche, plus d'infos HA ou rien
const CLICS_MEUBLE = ["fiche", "infos", "aucun"];
// couleur écrite dans la config (pastilles, widgets, jauges, meubles, animations, traces, flux) : #hex, rgb() / hsl() aux valeurs
// numériques, nom de couleur CSS ou var(--…) ; rien d'autre (ni « ; », ni url(), ni expression) n'arrive jamais dans un style
const COULEUR_SURE = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|var\(--[\w-]{1,60}\)|(?:rgb|hsl)a?\(\s*-?\d{1,3}(?:\.\d+)?(?:deg|%)?(?:\s*[,\s]\s*-?\d{1,3}(?:\.\d+)?%?){2}(?:\s*[,/]\s*\d{0,3}(?:\.\d+)?%?)?\s*\))$/i;
// couleurs nommées (`palette: {nom: couleur}`) : un élément écrit le nom, la carte pose --mq-c-<nom> sur son hôte et l'élément
// suit la palette. Nom : minuscules, chiffres, « _ » et « - » ; couleur de la palette : une couleur sûre (jamais un autre nom).
const NOM_PALETTE = /^[a-z][a-z0-9_-]{0,30}$/;
const palette = (c) => (c?.palette && typeof c.palette === "object" && !Array.isArray(c.palette)
  ? Object.entries(c.palette).filter(([n, v]) => NOM_PALETTE.test(n) && typeof v === "string" && COULEUR_SURE.test(v)) : []);
// noms de palette connus (ajoutés par chaque carte à son rendu) ; la couleur vient de la variable posée sur l'hôte de CETTE carte :
// un nom inconnu d'une carte y reste sans valeur (couleur par défaut de l'élément)
const paletteActive = new Set();
// la couleur si elle est sûre (un nom de la palette devient var(--mq-c-<nom>)), sinon null
// (un nom qui est aussi une couleur CSS, « red », la garde en secours dans les cartes qui ne le définissent pas)
const couleurSure = (c) => (typeof c !== "string" ? null : paletteActive.has(c) ? `var(--mq-c-${c}${COULEUR_SURE.test(c) ? `,${c}` : ""})` : COULEUR_SURE.test(c) ? c : null);
// écrite dans la config : couleur sûre ou nom de palette (résolu au rendu par couleurSure)
const couleurEcrite = (c) => typeof c === "string" && (COULEUR_SURE.test(c) || NOM_PALETTE.test(c));
// couleur d'un meuble connecté sur le plan : la sienne, sinon celle de son type, sinon l'accent du thème
const COULEURS_TYPE = { refrigerateur: "#29b6f6", meuble_tv: "#7e57c2", bureau: "#fb8c00", tableau_elec: "#fbc02d", box: "#26a69a", chaudiere: "#ef5350", radiateur: "#ef5350",
  voiture: "#43a047", borne_recharge: "#43a047", lave_linge: "#42a5f5", lave_vaisselle: "#42a5f5", pac: "#26c6da", plaques: "#ff7043", ballon: "#ef5350" };
const couleurMeuble = (m) => couleurSure(m?.couleur) || COULEURS_TYPE[m?.type] || null;
const estConnecte = (m) => !!(m && (m.entite || m.valeur || m.fiche));
const clicMeuble = (m) => (CLICS_MEUBLE.includes(m.clic) ? m.clic : m.fiche ? "fiche" : m.entite || m.valeur ? "infos" : "aucun");
// fiches : portées par un meuble, une ouverture ou une pastille ; la sélection d'un de leurs widgets porte { meuble | ouverture | point: i }
const GENRES_FICHE = { meuble: "meubles", ouverture: "ouvertures", point: "points" };
const porteurDe = (s) => { const g = s && Object.keys(GENRES_FICHE).find((k) => s[k] != null); return g ? { genre: g, i: s[g] } : null; };
// clé de sélection → élément : « widget:<côté>:<i>[:<pièce>] », « widget:fiche:<i>:<n>[:ouverture | point] », sinon « <type>:<i> »
const deCle = (k) => { const [type, a, b, c, g] = k.split(":"); return type === "widget" ? { type, cote: a, i: +b, ...(c != null ? (a === "fiche" ? { [Object.hasOwn(GENRES_FICHE, g ?? "") ? g : "meuble"]: +c } : { piece: +c }) : {}) } : { type, i: +a }; };
// initiales d'un nom (deux au plus)
const initiales = (nom) => nom.trim().split(/[\s_]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
// suffixe des widgets d'une fiche (« fiche:1:5 » pour le meuble 5, « fiche:1:5:ouverture », « fiche:1:5:point »)
const sufFiche = (pf) => `:${pf.i}${pf.genre === "meuble" ? "" : `:${pf.genre}`}`;
// ouverture ou pastille : « fiche » si elle en a une (ou `clic` choisi) ; null = pas de réglage, le comportement d'avant
const clicPorteur = (o) => (CLICS_MEUBLE.includes(o?.clic) ? o.clic : o?.fiche ? "fiche" : null);
// ---------- animations : bibliothèque réglable par événement (`animations.<événement>`) et par élément (`animation`) ----------
const ANIMATIONS = { aucune: _tk("Aucune"), pulsation: _tk("Pulsation"), respiration: _tk("Respiration (douce)"), clignote: _tk("Clignotement"),
  halo: _tk("Halo lumineux"), onde: _tk("Onde"), defilement: _tk("Défilement (traits, volets)") };
const EVENEMENTS_ANIM = {
  ouverture: { nom: _tk("Porte ou fenêtre ouverte"), defaut: { type: "pulsation", duree: 1.6 } },
  volet: { nom: _tk("Volet en mouvement"), defaut: { type: "defilement", duree: 0.8 } },
  alerte: { nom: _tk("Pastille en alerte"), defaut: { type: "pulsation", duree: 1.2 } },
  lumiere: { nom: _tk("Lumière allumée"), defaut: { type: "aucune", duree: 2.4 } },
  appareil: { nom: _tk("Appareil actif"), defaut: { type: "aucune", duree: 2 } },
  meuble: { nom: _tk("Meuble connecté actif"), defaut: { type: "aucune", duree: 2.4 } },
};
const evenementPoint = (p) => (p.alerte ? "alerte" : (p.entite || "").startsWith("light.") ? "lumiere" : "appareil");
// réglage effectif : défaut de l'événement, puis celui du plan, puis celui de l'élément (objet ou simple nom de type)
function animDe(c, ev, o, cle = "animation") {
  const lire = (v) => (typeof v === "string" ? { type: v } : v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const a = { ...EVENEMENTS_ANIM[ev].defaut, ...lire(c.animations?.[ev]), ...lire(o?.[cle]) };
  if (!ANIMATIONS[a.type]) a.type = EVENEMENTS_ANIM[ev].defaut.type;
  return a;
}
// classe a-<type> (+ a-contour) et variables CSS : --a-d durée, --a-i intensité, --a-c couleur
const classeAnim = (a) => ` a-${a.type}${a.forme === "contour" ? " a-contour" : ""}`;
const styleAnim = (a) => {
  const d = Math.min(20, Math.max(0.2, +a.duree || 1.6)), i = Math.min(2, Math.max(0.2, +a.intensite || 1));
  return `--a-d:${d}s;--a-i:${i}${couleurSure(a.couleur) ? `;--a-c:${couleurSure(a.couleur)}` : ""}`;
};

// ---------- interaction (`interaction`), tablette murale (`tablette`), niveau d'animation (`niveau_animation`) ----------
// sans ces clés : comportement d'origine (vue de la pièce au toucher, déplacement et zoom libres, pas de retour automatique)
const CLICS_PIECE = ["vue", "infos", "aucun"], NIVEAUX_ANIM = ["complet", "reduit", "aucun"], BOUTONS_ZOOM = ["auto", "plan", "entete", "caches"];
const objetSimple = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const interactionDe = (c) => {
  const o = objetSimple(c?.interaction) ? c.interaction : {}, s = Number.isFinite(+o.retour_apres) ? +o.retour_apres : 0;
  return { clic: CLICS_PIECE.includes(o.clic_piece) ? o.clic_piece : "vue", figee: o.vue_figee === true, retour: Math.min(86400, Math.max(0, s)),
    zoom: BOUTONS_ZOOM.includes(o.boutons_zoom) ? o.boutons_zoom : "auto" };
};
// mode tablette : `true` = { resume: false, panneaux: false, anti_marquage: true } ; un objet règle chaque point (les clés absentes gardent ces valeurs)
const tabletteDe = (c) => {
  const t = c?.tablette;
  if (t !== true && !objetSimple(t)) return null;
  const o = t === true ? {} : t;
  return { resume: o.resume === true, panneaux: o.panneaux === true, anti_marquage: o.anti_marquage !== false };
};
const niveauAnimDe = (c) => (NIVEAUX_ANIM.includes(c?.niveau_animation) ? c.niveau_animation : "complet");
// effets (`effets`) : auto (défaut : légers sur un écran tactile principal, complets sinon) / complets / legers ; voir _effetsLegers
const EFFETS = ["auto", "complets", "legers"];
const effetsDe = (c) => (EFFETS.includes(c?.effets) ? c.effets : "auto");
// anti-marquage : la carte se décale d'un pixel toutes les 3 minutes, en serpentin sur un carré de 5 × 5 px parcouru en aller-retour
// (jamais plus de 2 px par axe, 2,8 px au plus du point de départ, jamais de saut) ; position 12 = au centre, sans décalage
const PAS_ANTI_MARQUAGE = 180000;
const decalageAntiMarquage = (n) => {
  const k = ((n % 48) + 48) % 48, j = k < 25 ? k : 48 - k, r = Math.floor(j / 5), q = j % 5;
  return [(r % 2 ? 4 - q : q) - 2, r - 2];
};
// YAML écrit à la main : booléens et nombres écrits en texte (la config d'origine n'est jamais modifiée)
function normaliserInteraction(c) {
  const bool = (v) => (typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v);
  if (objetSimple(c.interaction)) {
    const o = { ...c.interaction };
    if ("vue_figee" in o) o.vue_figee = bool(o.vue_figee);
    if ("retour_apres" in o && typeof o.retour_apres === "string" && o.retour_apres.trim() && Number.isFinite(+o.retour_apres)) o.retour_apres = +o.retour_apres;
    c.interaction = o;
  }
  if ("tablette" in c) c.tablette = bool(c.tablette);
  if (objetSimple(c.tablette)) { const o = { ...c.tablette }; for (const k of ["resume", "panneaux", "anti_marquage"]) if (k in o) o[k] = bool(o[k]); c.tablette = o; }
  return c;
}

// ---------- ambiance (`ambiance`) : jour / nuit d'après sun.sun, météo de HA sur les extérieurs, traces des derniers changements ----------
const INTENSITES = { discret: 0.45, normal: 0.7, fort: 1 };
// fondus par paliers de l'ambiance (aube, crépuscule) : durée totale et intervalle minimal entre deux paliers (ms), voir _palier
const PALIER_DUREE = 40000, PALIER_MIN = 500;
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
// Pluie, neige, grêle et vent = motifs répétés (densité constante, quelques nœuds seulement) qui glissent ; nuages = ombres qui défilent.
// Aucun SMIL : nuages et motifs glissent en animation CSS de `transform` (couches.css.js : m-defile, m-glisse), que Chromium mène sur le
// compositeur, sans redessiner le plan à chaque image (mesuré : par pas, `steps()`, ce serait plus cher) ; effets légers : nuages immobiles
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
    // glisse de T en `duree` s (comme l'ancien animateTransform du patternTransform) : le rectangle, agrandi de T de chaque côté, avance
    // de T le long de l'axe tourné, et le motif, attaché à son repère, le suit. Figé : rectangle nu
    const ra = (+a * Math.PI) / 180, rect = fixe ? `x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}"`
      : `class="m-glisse" style="--g-x:${f0(-T * Math.sin(ra))}px;--g-y:${f0(T * Math.cos(ra))}px;--g-d:${duree}s" x="${b.x0 - T}" y="${b.y0 - T}" width="${b.W + 2 * T}" height="${b.H + 2 * T}"`;
    h += `<pattern id="${id}" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})">${l.join("")}</pattern>
      <rect ${rect} fill="url(#${id})" opacity="${op.toFixed(3)}"/>`;
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
// espaces ouverts : pièces intérieures qui se touchent le long d'un bord libre (ni mur ni ouverture dessus) d'au moins 40 cm, comme un
// salon et une cuisine ouverte dessinés en deux pièces. La lumière d'une pièce (halo d'une lampe, lueur d'une baie) s'étend à tout
// son espace et s'arrête aux murs. Retour : esp[k] = indices des pièces de l'espace de k ([k] : pièce dehors, sous-zone, sans bord libre)
function espacesOuverts(pieces, murs, ouvertures) {
  const L = pieces || [], chef = L.map((_, k) => k), haut = (k) => (chef[k] === k ? k : (chef[k] = haut(chef[k])));
  const ok = (p) => p && !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && p.poly.every(point);
  const seg = (s) => (Array.isArray(s) && s.length >= 4 && s.slice(0, 4).every((v) => Number.isFinite(+v)) ? s.slice(0, 4).map(Number) : null);
  const barres = [...(murs || []), ...(ouvertures || []).map((o) => o?.seg)].map(seg).filter(Boolean);
  const bords = L.map((p) => (ok(p) ? p.poly.map((q, i) => [...q, ...p.poly[(i + 1) % p.poly.length]].map(Number)) : []));
  // positions [début, fin] de s le long de la droite de b (b unitaire : origine, direction), si s est parallèle et à moins de tol cm
  const surLigne = ([a, b, d, f], s, tol) => {
    const l = Math.hypot(d - a, f - b), vx = (d - a) / l, vy = (f - b) / l, ls = Math.hypot(s[2] - s[0], s[3] - s[1]);
    if (!(l > 0 && ls > 0) || Math.abs(vx * (s[3] - s[1]) - vy * (s[2] - s[0])) / ls > 0.03) return null;
    const dist = (x, y) => Math.abs((x - a) * vy - (y - b) * vx), pos = (x, y) => (x - a) * vx + (y - b) * vy;
    if (dist(s[0], s[1]) > tol || dist(s[2], s[3]) > tol) return null;
    const p = pos(s[0], s[1]), q = pos(s[2], s[3]);
    return [Math.min(p, q), Math.max(p, q)];
  };
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    if (!bords[i].length || !bords[j].length || haut(i) === haut(j)) continue;
    const libre = bords[i].some((e) => bords[j].some((e2) => {
      const t = surLigne(e, e2, 3), lg = Math.hypot(e[2] - e[0], e[3] - e[1]);
      if (!t) return false;
      let de = Math.max(0, t[0]), a = Math.min(lg, t[1]);
      if (a - de < 40) return false;
      // bord commun moins ce que couvrent les murs et les ouvertures posés dessus : reste-t-il 40 cm libres ?
      const couverts = barres.map((b) => surLigne(e, b, 8)).filter(Boolean).sort((x, y) => x[0] - y[0]);
      let lib = 0;
      for (const [x, y] of couverts) { if (y <= de) continue; if (x >= a) break; lib += Math.max(0, x - de); de = Math.max(de, y); }
      return lib + Math.max(0, a - de) >= 40;
    }));
    if (libre) chef[haut(j)] = haut(i);
  }
  return L.map((_, k) => L.map((__, j) => j).filter((j) => haut(j) === haut(k)));
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
// ---------- fenêtre de toit (meuble `fenetre_toit`, `skylight` en YAML) ----------
// Le rectangle du meuble est l'emprise de la fenêtre vue du dessus ; son bas (y = +h/2 dans le repère du meuble, avant rotation) est le
// bas de la pente, posé à `hauteur` cm du sol (défaut 200) ; le haut monte de h × tan(`pente`) (0 à 75°, défaut 40 ; 0 = toit plat).
const VELUX_PENTE = 40, VELUX_HAUTEUR = 200;
const penteVelux = (m) => borne(nbOpt(m?.pente) ?? VELUX_PENTE, 0, 75), hauteurVelux = (m) => borne(nbOpt(m?.hauteur) ?? VELUX_HAUTEUR, 0, 1000);
// part dégagée par le store ou le volet (0 à 1) : `cover` = current_position (fermé sans position = 0) ; contact, autre ou rien = 1
function ouvertVelux(entite, etat) {
  if (typeof entite !== "string" || !entite.startsWith("cover.") || !etat) return 1;
  const p = parseFloat(etat.attributes?.current_position);
  return Number.isFinite(p) ? borne(p / 100, 0, 1) : etat.state === "closed" ? 0 : 1;
}
// repère d'une fenêtre de toit : centre, demi-tailles, axes du meuble dans le plan (x = le long du bas, y = vers le bas de la pente)
function repereVelux(m) {
  const [w, h] = (Array.isArray(m?.taille) ? m.taille : [78, 118]).map((v) => bornerTaille(v, 78)), a = (nb(m?.rotation) * Math.PI) / 180;
  const sg = m?.miroir ? -1 : 1, c = Math.cos(a), s = Math.sin(a);
  return { cx: nb(m?.pos?.[0]), cy: nb(m?.pos?.[1]), w, h, ex: [c * sg, s * sg], ey: [-s, c] };
}
// tache de l'astre au sol : le vitrage (incliné de `pente` autour du bas, partie dégagée par le store depuis le bas) projeté au sol le long
// des rayons. (ux, uy) = direction de l'astre dans le plan (vers lui), e = hauteur (°), ouvert = part dégagée (0 à 1), max = recul maximal (cm).
// Rien si l'astre est sous 0,5°, si le store est fermé, ou si l'astre est derrière le pan de toit ou rasant (incidence de plus de 84°).
// Retour au format de tacheLumiere : { expo, poly, aire, pres, loin, de, vers, centre }
function tacheVelux(m, ux, uy, e, ouvert = 1, max = 900) {
  if (![ux, uy, e, ouvert, max].every(Number.isFinite) || e <= 0.5 || ouvert <= 0.02) return null;
  const R = repereVelux(m), p = (penteVelux(m) * Math.PI) / 180, z0 = hauteurVelux(m), er = (Math.min(e, 89) * Math.PI) / 180;
  const ul = Math.hypot(ux, uy) || 1, sx = ux / ul, sy = uy / ul;
  // incidence : normale du vitrage (vers le bas de la pente, inclinée de p) · direction de l'astre
  const expo = Math.sin(p) * Math.cos(er) * (sx * R.ey[0] + sy * R.ey[1]) + Math.cos(p) * Math.sin(er);
  if (expo <= 0.1) return null;
  const t = Math.tan(er), r = (v) => +v.toFixed(1), k = Math.min(1, ouvert);
  // sommet du vitrage : (x, y) dans le repère du meuble, z = hauteur au-dessus du sol ; au sol, reculé de z / tan(e) à l'opposé de l'astre
  const sol = (x, y) => {
    const z = z0 + (R.h / 2 - y) * Math.tan(p), d = Math.min(max, z / t);
    return [r(R.cx + R.ex[0] * x + R.ey[0] * y - sx * d), r(R.cy + R.ex[1] * x + R.ey[1] * y - sy * d), d];
  };
  const yb = R.h / 2, yh = R.h / 2 - R.h * k, P = [sol(-R.w / 2, yb), sol(R.w / 2, yb), sol(R.w / 2, yh), sol(-R.w / 2, yh)];
  const poly = P.map(([x, y]) => [x, y]);
  let aire = 0;
  poly.forEach((q, i) => { const n = poly[(i + 1) % 4]; aire += q[0] * n[1] - n[0] * q[1]; });
  const mil = (a, b) => [r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)], de = mil(P[0], P[1]), vers = mil(P[2], P[3]);
  return { expo, poly, aire: Math.abs(aire) / 2, pres: P[0][2], loin: P[2][2], de, vers, centre: mil(de, vers) };
}
// emprise vue du dessus (4 coins dans le plan) : pièce qui contient la fenêtre, lueur du ciel
function empriseVelux(m) {
  const R = repereVelux(m), c = (x, y) => [R.cx + R.ex[0] * x + R.ey[0] * y, R.cy + R.ex[1] * x + R.ey[1] * y];
  return [c(-R.w / 2, R.h / 2), c(R.w / 2, R.h / 2), c(R.w / 2, -R.h / 2), c(-R.w / 2, -R.h / 2)];
}
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
    // billes : placées le long du chemin par _billes (10 positions par seconde), en avance de k × dur / n secondes l'une sur l'autre
    const billes = fixe ? "" : Array.from({ length: n }, (_, k) => `<circle class="bille" r="${rb.toFixed(1)}" fill="${col}" data-dur="${dur.toFixed(2)}" data-dec="${(k * dur / n).toFixed(2)}"/>`).join("");
    const trajet = `<path d="${d}" fill="none" stroke="${col}" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>`;
    return billes ? `<g>${trajet}${billes}</g>` : trajet;
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

// écritures du DOM seulement quand la valeur change : _maj repasse sur tout le plan à chaque état reçu de HA ; une écriture identique
// coûte quand même une mutation (et, pour un attribut SVG, une invalidation du dessin)
const attrSi = (el, k, v) => { if (el && el.getAttribute(k) !== (v = String(v))) el.setAttribute(k, v); };
const texteSi = (el, v) => { if (el && el.textContent !== (v = String(v))) el.textContent = v; };
const titreSi = (el, v) => { if (el && el.title !== v) el.title = v; };
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
  tableau_elec: "electrical_panel", box: "router", borne_recharge: "ev_charger", pac: "heat_pump", voiture: "car", velo: "bike", arbre: "tree", piscine: "pool", pergola: "pergola", abri: "shed",
  espace: "area", rect: "rect", cercle: "circle", escalier: "stairs", forme: "custom", fenetre_toit: "skylight" };
// catégories des meubles (catalogue et meubles personnalisés `modeles[].cat`)
const V_CATS_MEUBLES = { sejour: "living", repas: "dining", cuisine: "kitchen", chambre: "bedroom", salle_eau: "bathroom", technique: "utility", formes: "shapes", exterieur: "outdoor" };
const V_CALQUES = { fond: "background", pieces: "rooms", sous_zones: "sub_areas", halos: "halos", meubles: "furniture", limites: "fences", murs: "walls", ouvertures: "openings",
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
  // copie d'un modèle de la bibliothèque : id du modèle (`templates[].id`)
  origine: "template",
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
  forme: ["shape", nListe(N_PRIMITIVE)], ...K_CONNECTE, ...K_ELEMENT,
  // escalier : étage où il mène (`floor`) ; fenêtre de toit (`skylight`) : pente du toit et hauteur du bas de la fenêtre
  etage: "floor", pente: "roof_tilt", hauteur: "sill_height" });
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
// géométrie d'un plan : à la racine d'un plan à un étage, sinon dans chaque étage (`floors[n]`), avec les mêmes sous-schémas
const K_GEOMETRIE = { pieces: ["rooms", nListe(N_PIECE)], murs: "walls", limites: "fences", ouvertures: ["openings", nListe(N_OUVERTURE)], points: ["badges", nListe(N_POINT)],
  textes: ["texts", nListe(N_TEXTE)], meubles: ["furniture", nListe(N_MEUBLE)], groupes: ["groups", nListe(nObj({ id: "id", nom: "name" }))] };
// image de fond (plan scanné, photo) : coin haut gauche et taille en cm, rotation, opacité, affichée en édition seulement ou toujours
const N_FOND = nObj({ image: "image", pos: "pos", largeur: "width", hauteur: "height", rotation: "rotation", opacite: "opacity", opacite_sol: "room_opacity",
  afficher: ["show", nEnum({ editeur: "editor", toujours: "always" })] });
// un étage (`floors`, du bas vers le haut) : identifiant, nom, nom court, icône, sa géométrie, ses panneaux (facultatifs) et son fond
const N_ETAGE = nObj({ id: "id", nom: "name", court: "short", icone: "icon", ...K_GEOMETRIE, panneaux: ["panels", N_PANNEAUX], fond: ["background", N_FOND] });
// `theme:` objet : base + une clé par variable publique (interne française ↔ nom de la variable avec « _ »), voir themes-variables.js
const N_THEME = nObj({ base: "base", ...Object.fromEntries(VARIABLES_THEME.map((v) => [v.cle, cleAnglaiseTheme(v)])) });
const N_RACINE = nObj({ type: "type", id: "id", titre: "title", resume: ["summary", nListe(N_PUCE)], plein_ecran: "full_page", edition: "editor", marge: "margin",
  ...K_GEOMETRIE, afficher_meubles: ["show_furniture", nEnum({ pc: "desktop" })], fond: ["background", N_FOND],
  etages: ["floors", nListe(N_ETAGE)], etage_defaut: "default_floor", selecteur_etages: ["floor_selector", nEnum({ ascenseur: "elevator", onglets: "tabs" })],
  calques: ["layers", N_CALQUES], panneaux: ["panels", N_PANNEAUX],
  modeles: ["templates", nListe(N_MODELE)], ambiance: ["ambience", N_AMBIANCE], animations: ["animations", N_ANIMATIONS], alertes: ["alerts", nListe(N_ALERTE)],
  style_pastilles: ["badge_style", N_STYLE_PASTILLES], palette: "palette",
  // apparence : thème (nom du registre, ou { base, <variable>… } : clés tirées de VARIABLES_THEME) et CSS personnalisé
  theme: ["theme", N_THEME], css: "css",
  replay: ["replay", nObj({ heures: "hours", vitesse: "speed" })], vitrine: ["showcase", nObj({ pos: "pos", largeur: "width" })], demo: "demo", langue: "language",
  // réglages globaux (panneau ⚙ Paramètres de l'éditeur) : présence par défaut, étiquettes des pièces, teinte de température, légende
  presence: "presence", etiquettes_pieces: ["room_labels", nObj({ nom: "name", temperature: "temperature", humidite: "humidity" })],
  teinte_temperature: ["temperature_tint", nObj({ min: "min", max: "max" })], legende: "legend",
  // interaction au toucher, tablette murale, niveau d'animation
  interaction: ["interaction", nObj({ clic_piece: ["room_tap", nEnum({ vue: "room_view", infos: "more_info", aucun: "none" })], vue_figee: "lock_view", retour_apres: "reset_after",
    boutons_zoom: ["zoom_buttons", nEnum({ auto: "auto", plan: "map", entete: "header", caches: "hidden" })] })],
  tablette: ["tablet", nObj({ resume: "summary", panneaux: "panels", anti_marquage: "burn_in" })],
  niveau_animation: ["animation_level", nEnum({ complet: "full", reduit: "reduced", aucun: "none" })],
  effets: ["effects", nEnum({ auto: "auto", complets: "full", legers: "light" })],
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
// (config dépliée sur un étage, `etage_actif` : repliée d'abord, cette clé interne n'est jamais exportée)
const versAnglais = (cfg, rap) => (cfg && typeof cfg === "object" && !Array.isArray(cfg) ? traduire(objetSimple(cfg.etage_actif) ? replier(cfg) : cfg, N_RACINE, true, "", rap) : cfg);
// format public (anglais) → config interne ; une config entière à l'ancien format (clés françaises) est refusée avec un message clair
function depuisAnglais(cfg, rap) {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return cfg;
  if (Object.hasOwn(cfg, "pieces") && !Object.hasOwn(cfg, "rooms"))
    throw new Error("maquette-card : this configuration uses the former French keys (pieces, murs, ouvertures…): convert it to the English keys (rooms, walls, openings…), see https://github.com/TooMuhtsh/maquette-card/blob/main/CHANGELOG.md#former-french-keys");
  return traduire(cfg, N_RACINE, false, "", rap);
}

// JSON indépendant de l'ordre des clés (HA et setConfig ne gardent pas toujours le même ordre)
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
// ---------- thèmes (`theme:` et `css:` de la config) ----------
// Registre : nom public (identique en interne) → { clair: {variable: valeur}, sombre: {variable: valeur}, mode?, css? }
//  - variable = `nom` d'une ligne de VARIABLES_THEME (themes-variables.js), sans le préfixe : "accent", "room-fill"… ;
//    une variable absente garde sa valeur par défaut (celle du rendu Material) ;
//  - clair / sombre : choisi selon le thème de HA (hass.themes.darkMode) ; mode: "sombre" = toujours la palette sombre (ex. Nuit) ;
//  - css (facultatif) : règles de forme propres au thème (ex. `ha` : ombre et bordure de ha-card), ajoutées après les variables.
// Le thème choisi est posé en --mq-t-<variable> sur :host (feuille construite) : une variable publique --maquette-<variable>
// (thème HA, card-mod, CSS personnalisé) prime toujours dessus. `material` est vide : rendu d'avant les thèmes, à l'identique.
// `ha` (Lovelace classique) ne pose que des var() du thème HA : il suit n'importe quel thème HA, clair ou sombre. Les cinq préréglages
// sont des palettes MD3 complètes (tons de Material Theme Builder), clair ET sombre ; textes ≥ 4.5:1 sur leurs surfaces
// (vérifié par tests/node/test_themes_palettes.mjs). Une couleur à canal alpha (#rrggbbaa) se pose sur le sol des pièces (meubles).
// Palette MD3 d'un préréglage : rôles dans l'ordre de PALETTE_THEME (porte fermée = accent, porte ouverte = erreur, puces = surface / texte 2nd)
const PALETTE_THEME = ["accent", "on-accent", "surface", "card-background", "surface-variant", "text", "text-secondary", "outline", "outline-variant", "error",
  "wall", "room-fill", "shutter", "furniture", "furniture-stroke", "badge-background", "badge-text"];
const paletteTheme = (...c) => {
  const p = Object.fromEntries(PALETTE_THEME.map((n, i) => [n, c[i]]));
  return { ...p, "room-text": p.text, "door-closed": p.accent, "door-open": p.error, "chip-background": p.surface, "chip-text": p["text-secondary"] };
};
// `ha` : variables privées --mq-ha-* (repli en chaîne sur le thème HA, impossible dans une valeur du registre qui n'admet qu'un var(--x)
// sans repli), puis règles de forme : bordure / ombre / rayon de ha-card, extérieur sans teinte d'accent
const THEME_HA_VARS = { "card-background": "var(--md-surface)", "surface-variant": "var(--mq-ha-variante)", "outline-variant": "var(--mq-ha-separateur)",
  "room-text": "var(--primary-text-color)", "chip-background": "var(--md-surface)", "chip-text": "var(--primary-text-color)",
  "badge-background": "var(--mq-ha-pastille)", "badge-text": "var(--primary-text-color)" };
const THEME_HA_CSS = ":host{--mq-ha-separateur:var(--ha-card-border-color,var(--divider-color,#e0e0e0));"
  + "--mq-ha-variante:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface));--mq-ha-pastille:color-mix(in srgb,var(--state-inactive-color,#808080) 20%,var(--md-surface));"
  + "--md-surface-container-high:color-mix(in srgb,var(--md-on-surface) 8%,var(--md-surface))}"
  + "ha-card{border-radius:var(--maquette-radius,var(--mq-t-radius,var(--ha-card-border-radius,12px)));box-shadow:var(--ha-card-box-shadow,none);"
  + "border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,#e0e0e0))}"
  + ".tete .chip{border-radius:18px}.zone-etq{color:var(--md-on-surface-variant)}";
const THEMES = {
  material: { clair: {}, sombre: {} },
  ha: { clair: THEME_HA_VARS, sombre: THEME_HA_VARS, css: THEME_HA_CSS },
  //               accent     sur accent surface    fond carte surf. var. texte      texte 2nd  contour    contour d. erreur     mur        sol        volet      meuble       trait meuble pastille   txt pastille
  ocean: { clair: paletteTheme("#006a6a", "#ffffff", "#f4fbfa", "#eef5f4", "#e3eae9", "#161d1d", "#3f4948", "#6f7979", "#bec9c8", "#ba1a1a", "#1f2a2a", "#dae5e4", "#4b607c", "#f4fbfa99", "#3f4948b3", "#cce8e7", "#051f1f"),
    sombre: paletteTheme("#4cdada", "#003737", "#0e1515", "#161d1d", "#1a2121", "#dde4e3", "#bec9c8", "#889392", "#3f4948", "#ffb4ab", "#dde4e3", "#242b2b", "#b3c8e8", "#0e151599", "#bec9c8b3", "#324b4b", "#cce8e7") },
  slate: { clair: paletteTheme("#4a5c72", "#ffffff", "#f8f9fc", "#f2f3f7", "#e6e8ed", "#191c20", "#43474e", "#73777f", "#c3c6cf", "#ba1a1a", "#2e3338", "#e0e2e8", "#6d5e4b", "#f8f9fc99", "#43474eb3", "#d5e3f7", "#0e1d2b"),
    sombre: paletteTheme("#b2c7e0", "#1c3145", "#111418", "#191c20", "#1d2024", "#e1e2e8", "#c3c6cf", "#8d9199", "#43474e", "#ffb4ab", "#e1e2e8", "#272a2f", "#c9b79c", "#11141899", "#c3c6cfb3", "#3a4858", "#d5e3f7") },
  sand: { clair: paletteTheme("#7d5800", "#ffffff", "#fff8f2", "#fbf2ea", "#f3e9df", "#1f1b16", "#4e4639", "#807667", "#d2c5b4", "#ba1a1a", "#3a3127", "#efe0cf", "#7a5a3a", "#fff8f299", "#4e4639b3", "#f8dfbb", "#261904"),
    sombre: paletteTheme("#f5bd4f", "#422c00", "#17130e", "#1f1b16", "#241f1a", "#ebe1d9", "#d2c5b4", "#9b8f80", "#4e4639", "#ffb4ab", "#ebe1d9", "#2e2924", "#d9b48c", "#17130e99", "#d2c5b4b3", "#574425", "#f8dfbb") },
  forest: { clair: paletteTheme("#2e6b30", "#ffffff", "#f7fbf1", "#f1f5ec", "#e6eae0", "#191d17", "#424940", "#72796f", "#c2c8bd", "#ba1a1a", "#2c3329", "#dfe4d8", "#6f5b40", "#f7fbf199", "#424940b3", "#d4e8cf", "#0f1f0f"),
    sombre: paletteTheme("#93d68f", "#00390a", "#10140f", "#191d17", "#1d211b", "#e0e4da", "#c2c8bd", "#8c9388", "#424940", "#ffb4ab", "#e0e4da", "#272b25", "#cdb896", "#10140f99", "#c2c8bdb3", "#3a4b38", "#d4e8cf") },
  // Nuit : toujours sombre (bleu nuit), quel que soit le thème de HA
  night: { mode: "sombre", clair: {},
    sombre: paletteTheme("#a8c7fa", "#062e6f", "#11131a", "#191b23", "#1d2028", "#e2e2ec", "#c4c6d0", "#8e909a", "#44474f", "#ffb4ab", "#e2e2ec", "#262a35", "#b9a07e", "#11131a99", "#c4c6d0b3", "#2b3a55", "#d8e2ff") },
};
const NOMS_THEMES = Object.keys(THEMES);
const VAR_THEME = Object.fromEntries(VARIABLES_THEME.map((v) => [v.nom, v]));
const VAR_THEME_CLE = Object.fromEntries(VARIABLES_THEME.map((v) => [v.cle, v]));
// valeur d'une variable selon son type, ou null si elle n'est pas sûre (jamais « ; », « } », url(), expression…)
// couleur : même règle que toutes les couleurs de la config (COULEUR_SURE) ; longueur : nombre (px) ou nombre + px|rem|em|% ;
// police : noms de familles (lettres, chiffres, espaces, virgules, guillemets, tirets) ou var(--…)
const LONGUEUR_SURE = /^\d{1,3}(?:\.\d{1,2})?(?:px|rem|em|%)$/, POLICE_SURE = /^(?:[\w\s,'"-]{1,160}|var\(--[\w-]{1,60}\))$/;
function valeurTheme(v, type) {
  if (type === "longueur") return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 999 ? `${Math.round(v * 100) / 100}px` : typeof v === "string" && LONGUEUR_SURE.test(v.trim()) ? v.trim() : null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (type === "police") return POLICE_SURE.test(t) && /[^\s,'"]/.test(t) ? t : null;
  return COULEUR_SURE.test(t) ? t : null;
}
// thème de la config (interne) → { base, retouches: {variable: valeur} } ; une chaîne = un nom du registre
function themeDe(theme) {
  if (typeof theme === "string") return { base: Object.hasOwn(THEMES, theme) ? theme : "material", retouches: {} };
  const o = theme && typeof theme === "object" && !Array.isArray(theme) ? theme : {}, retouches = {};
  for (const [k, x] of Object.entries(o)) {
    const v = Object.hasOwn(VAR_THEME_CLE, k) ? VAR_THEME_CLE[k] : null, s = v && valeurTheme(x, v.type);
    if (s) retouches[v.nom] = s;
  }
  return { base: typeof o.base === "string" && Object.hasOwn(THEMES, o.base) ? o.base : "material", retouches };
}
// variables effectives d'un thème : palette du registre (clair ou sombre) puis retouches ; { variable: valeur }
function variablesDuTheme(theme, sombre = false) {
  const { base, retouches } = themeDe(theme), t = THEMES[base];
  return { ...((t.mode === "sombre" || sombre) && t.mode !== "clair" ? t.sombre : t.clair), ...retouches };
}
// feuille du thème : --mq-t-* sur :host, puis les règles de forme du thème ; "" pour material sans retouche (rien posé)
function cssDuTheme(theme, sombre = false) {
  const vars = Object.entries(variablesDuTheme(theme, sombre)).filter(([n]) => VAR_THEME[n]?.css !== false);
  const regles = THEMES[themeDe(theme).base].css || "";
  return `${vars.length ? `:host{${vars.map(([n, v]) => `--mq-t-${n}:${v}`).join(";")}}` : ""}${regles}`;
}
// police du thème (posée par la carte sur --ha-font-family-body de son hôte), ou null
const policeDuTheme = (theme, sombre = false) => variablesDuTheme(theme, sombre).font || null;
// CSS personnalisé (`css:`) : { ok: true, css } ou { ok: false, raison } (raison en anglais, pour la console et l'éditeur).
// Refusés : plus de 20 Kio, @import, url() autre qu'une image data:, expression(), javascript: / vbscript:, -moz-binding, behavior,
// </style, et toute barre oblique inverse (échappement CSS qui pourrait déguiser l'un d'eux). Commentaires retirés avant le contrôle.
const CSS_PERSO_MAX = 20 * 1024;
function verifierCss(t) {
  if (typeof t !== "string") return { ok: false, raison: "not a text" };
  if (new TextEncoder().encode(t).length > CSS_PERSO_MAX) return { ok: false, raison: `larger than ${CSS_PERSO_MAX / 1024} KiB` };
  const s = t.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, " ");
  const refus = [[/\\/, "backslash escapes are not allowed"], [/<\/?style/i, "</style is not allowed"], [/@import/i, "@import is not allowed"],
    [/expression\s*\(/i, "expression() is not allowed"], [/(?:java|vb)script\s*:/i, "javascript: is not allowed"], [/-moz-binding|behavior\s*:/i, "-moz-binding / behavior is not allowed"],
    [/url\s*\(\s*(?!["']?\s*data:image\/(?:png|jpe?g|gif|webp|avif|svg\+xml)[;,])/i, "url() is only allowed with a data:image"],
    [/(?:image-set|src)\s*\(/i, "image-set() / src() are not allowed"]];
  for (const [re, raison] of refus) if (re.test(s)) return { ok: false, raison };
  return { ok: true, css: s.trim() };
}
// ---------- étages (`floors`) : la carte garde la config repliée (this._plein) et l'étage affiché déplié à la racine (this._config) ----------
// Repliée (forme stockée, normalisée) : la géométrie de chaque étage dans `etages[n]`, rien à la racine que le commun à la maison.
// Dépliée sur un étage : sa géométrie (et ses panneaux s'il a les siens) à la racine, comme un plan à un étage, les autres étages
// restent dans `etages` ; l'étage déplié n'y garde que son identité (id, nom, court, icône). Une seule clé interne, `etage_actif`
// ({ id, propres : panneaux de l'étage, panneaux : ceux de la maison mis de côté }), jamais exportée (versAnglais replie d'abord).
// Sans `etages` : deplier et replier rendent une copie identique.
const CLES_ETAGE = ["pieces", "murs", "limites", "ouvertures", "points", "textes", "meubles", "groupes", "fond"];
// identifiants des étages, du bas vers le haut ([] sans étages)
const idsEtages = (c) => (Array.isArray(c?.etages) ? c.etages.map((e) => e?.id).filter((x) => typeof x === "string") : []);
// étage affiché au chargement : `default_floor`, sinon le mémorisé s'il existe encore, sinon le premier ; null sans étages
function etageInitial(c, memo = null) {
  const l = idsEtages(c);
  if (!l.length) return null;
  return l.includes(c.etage_defaut) ? c.etage_defaut : l.includes(memo) ? memo : l[0];
}
function deplier(plein, id) {
  const c = copie(plein);
  if (!objetSimple(c) || objetSimple(c.etage_actif) || !Array.isArray(c.etages) || !c.etages.length) return c;
  let i = c.etages.findIndex((e) => e?.id === id);
  if (i < 0) i = Math.max(0, c.etages.findIndex((e) => e?.id === etageInitial(c)));
  const e = objetSimple(c.etages[i]) ? c.etages[i] : {}, ident = {}, geo = {}, actif = { id: e.id };
  for (const [k, v] of Object.entries(e)) (CLES_ETAGE.includes(k) || k === "panneaux" ? geo : ident)[k] = v;
  for (const k of CLES_ETAGE) delete c[k];
  if ("panneaux" in geo) {
    actif.propres = true;
    if ("panneaux" in c) actif.panneaux = c.panneaux;
    delete c.panneaux;
  }
  c.etages[i] = ident;
  return Object.assign(c, geo, { etage_actif: actif });
}
function replier(deplie) {
  const c = copie(deplie);
  if (!objetSimple(c) || !objetSimple(c.etage_actif)) return c;
  const A = c.etage_actif, geo = {};
  delete c.etage_actif;
  for (const k of CLES_ETAGE) if (k in c) { geo[k] = c[k]; delete c[k]; }
  if (A.propres) {
    if ("panneaux" in c) geo.panneaux = c.panneaux;
    delete c.panneaux;
    if ("panneaux" in A) c.panneaux = A.panneaux;
  }
  if (!Array.isArray(c.etages)) c.etages = [];
  const i = c.etages.findIndex((e) => e?.id === A.id);
  // étage déplié introuvable (retiré de la liste pendant l'édition) : sa géométrie est remise en dernier plutôt que perdue
  if (i < 0) c.etages.push({ id: A.id, ...geo }); else c.etages[i] = { ...c.etages[i], ...geo };
  return c;
}
// toute la maison, étage par étage (lecture seule : ne pas modifier) : config repliée ou dépliée ; sans étages, un seul (id null).
// court : celui de l'étage, sinon son rang depuis 0 ; geo : listes de l'étage ([] si absentes) et fond (ou null) ;
// panneaux : ceux de l'étage, null s'il prend ceux de la maison
function parEtage(c) {
  if (!objetSimple(c)) return [];
  const A = objetSimple(c.etage_actif) ? c.etage_actif : null, L = Array.isArray(c.etages) && c.etages.length ? c.etages : [null];
  return L.map((e, i) => {
    const ici = e === null || (A && e?.id === A.id), s = ici ? c : objetSimple(e) ? e : {}, geo = {};
    for (const k of CLES_ETAGE) geo[k] = k === "fond" ? (objetSimple(s.fond) ? s.fond : null) : Array.isArray(s[k]) ? s[k] : [];
    const panneaux = e === null ? null : ici ? (A?.propres ? c.panneaux ?? null : null) : e?.panneaux ?? null;
    return { id: e?.id ?? null, nom: e?.nom ?? null, court: e?.court ?? String(i), icone: e?.icone ?? null, geo, panneaux };
  });
}
class MaquetteCard extends HTMLElement {
  static PUCES = [{ type: "ouvertures" }, { type: "lumieres" }, { type: "volets" }, { type: "temperature" }];
  static MEUBLES = MEUBLES;
  static normaliser = normaliserConfig;
  static COULEURS_TYPE = COULEURS_TYPE;
  static dessinMeuble = dessinMeuble;
  static normaliserForme = normaliserForme;
  static traitsOuverture = traitsOuverture;
  static LUMIERE = { couche: coucheLumiere, tache: tacheLumiere, baies: baiesFenetres, couleur: couleurLampe, phases: PHASES_LUNE, ciel: LUM_CIEL, kelvin: kelvinRgb,
    fond: lumiereFond, bornes: vitrageBornes, lune: positionLune, voisins: lumiereVoisins, passage: passageLumiere, lames: partLames, interieure: ouvertureInterieure, espaces: espacesOuverts };
  static couleurSure = (c) => !!couleurSure(c);
  static couleurEcrite = couleurEcrite;
  static palette = palette;
  static poserHTML = poserHTML;
  static ajouterHTML = ajouterHTML;
  static VERSION = VERSION;
  static serviceSensible = serviceSensible;
  static get DEPOT() { return DEPOT; } // dépôt du projet (défini plus bas, avec l'enregistrement de la carte)
  static CATS_MEUBLES = { sejour: _tk("Séjour"), repas: _tk("Repas"), cuisine: _tk("Cuisine"), chambre: _tk("Chambre et bureau"), salle_eau: _tk("Salle d'eau"),
    technique: _tk("Technique"), formes: _tk("Formes et espaces"), exterieur: _tk("Extérieur") };
  static CALQUES = { svg: CALQUES_SVG, html: CALQUES_HTML, noms: NOMS_CALQUES, icones: ICONES_CALQUES };
  static niveauMeuble = niveauMeuble;
  static ANIMATIONS = ANIMATIONS;
  static EVENEMENTS_ANIM = EVENEMENTS_ANIM;
  static animDe = animDe;
  static evenementPoint = evenementPoint;
  // format public (YAML en anglais) ↔ config interne : pour l'éditeur, les tests et la migration des anciennes configs
  static depuisAnglais = depuisAnglais;
  static contactsDe = contactsDe;
  static etatCombine = etatCombine;
  static versAnglais = versAnglais;
  static SCHEMA_ANGLAIS = N_RACINE;
  // étages : config repliée ↔ dépliée sur un étage, toute la maison par étage, identifiants, étage du chargement
  static ETAGES = { deplier, replier, parEtage, ids: idsEtages, etageInitial, CLES_ETAGE };
  // valeurs par défaut des réglages globaux (panneau ⚙ Paramètres de l'éditeur)
  // outils communs à la carte et à l'éditeur (une seule définition, lue par l'éditeur au chargement)
  static outils = { dansPoly, distBord, entitesZone, esc, fmt, canon, GENRES_FICHE, porteurDe, deCle, BASCULES, NOMS_OUVERTURE, initiales, borne,
    TAILLE_MEUBLE_MAX, CHAMPS_ENTITE_WIDGET, stock, stockSession, cleRouvrir, cleVersions };
  static REGLAGES = { vitesses: VITESSES_REPLAY, teinte: TEINTE_DEF, presence: "zone.home", heures: 24, vitesse: 900, marge: 40 };

  // points d'accroche : un morceau (src/carte/classe-*.js) se branche sur un moment de la carte sans modifier ce fichier, en
  // définissant une méthode « _quand_<moment>_<sujet>(…) » ; toutes celles d'un moment sont appelées dans l'ordre de src/assemblage.mjs.
  // Moments : construit (fin de _construire, plan dessiné), hass (nouvel objet hass reçu, carte déjà construite : thème HA clair / sombre…)
  static ACCROCHES = new Map();
  _accroches(moment, ...args) {
    const P = MaquetteCard.prototype, pre = `_quand_${moment}_`;
    let l = MaquetteCard.ACCROCHES.get(moment);
    if (!l) MaquetteCard.ACCROCHES.set(moment, (l = Object.getOwnPropertyNames(P).filter((n) => n.startsWith(pre) && typeof Object.getOwnPropertyDescriptor(P, n).value === "function")));
    for (const n of l) this[n](...args);
  }
  setConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("maquette-card : invalid configuration");
    // format public en anglais → config interne (clés françaises) ; clés inconnues ignorées avec un avertissement
    config = depuisAnglais(config);
    // langue de l'interface (option `language`, sinon celle de HA) : choisie avant la démo, dont les noms en dépendent
    this._lgOpt = config.langue;
    const relangue = this._langue();
    // `demo: true` : l'appartement de démonstration et ses états simulés (rien n'est commandé dans la maison)
    if (config.demo && typeof PlanDemo !== "undefined") {
      // (titre, thème et CSS personnalisé gardés : la démo montre aussi les thèmes)
      config = { ...PlanDemo.config(), ...Object.fromEntries(["titre", "theme", "css"].filter((k) => config[k] != null).map((k) => [k, config[k]])) };
      const brut = this._sim ? this._hassBrut : this._hass;
      this._sim ||= new PlanDemo.Simulation();
      if (relangue) this._sim.renommer();
      // jamais un appel vers la maison avec la config de démo, même au premier rendu
      if (brut) { this._hassBrut = brut; this._hass = this._hassDemo(brut); }
    } else if (this._sim) {
      this._desabonner?.(); this._desabonner = null; this._sim = null;
      if (this._hassBrut) this._hass = this._hassBrut;
      this._hassBrut = null; this._cacheStat = {}; this._cacheHisto = {};
    }
    const rapport = {};
    config = normaliserConfig(config, rapport);
    // éléments sans géométrie valide : ignorés, signalés discrètement (console ; l'éditeur le dit à l'ouverture)
    if (rapport.ignores && this._ignores !== rapport.ignores) console.warn(`maquette-card : ${rapport.ignores} element(s) without valid coordinates ignored`);
    this._ignores = rapport.ignores;
    // valeurs invalides retirées (coordonnées, couleurs, icônes, valeurs énumérées…) : signalées une fois dans la console
    const ret = (rapport.retires || []).join(", ");
    if (ret && ret !== this._retires) console.warn(`maquette-card : invalid value(s) removed: ${ret.length > 400 ? `${ret.slice(0, 400)}…` : ret}`);
    this._retires = ret;
    if (this._editeur) {
      // config rechargée après notre propre enregistrement : on garde l'éditeur ouvert
      if (canon(config) === canon(replier(this._editeur.original))) return;
      // modifiée ailleurs pendant l'édition : on garde le travail en cours, le conflit sera proposé à l'enregistrement
      this._editeur.externe = JSON.parse(JSON.stringify(config));
      this._editeur.snack(_t("Ce plan vient d'être modifié ailleurs : à l'enregistrement, tu choisiras de garder ta version ou non."), _t("Exporter le mien"), () => this._editeur.exporter(), 12000);
      return;
    }
    // étages : _plein = config repliée (normalisée), _config = l'étage affiché déplié à la racine, _etage = son id (null sans étages)
    // étage du chargement : `default_floor`, sinon le dernier vu sur ce navigateur, sinon le premier ; même plan à étages rechargé
    // (enregistrement, tableau de bord modifié) : on reste sur l'étage affiché s'il existe encore
    const reste = idsEtages(this._plein).length > 1 && this._plein.id === config.id && idsEtages(config).includes(this._etage);
    this._plein = JSON.parse(JSON.stringify(config));
    this._etage = reste ? this._etage : etageInitial(this._plein, stock.lire(this._cleEtage()));
    this._config = deplier(this._plein, this._etage);
    this._ok = false;
    if (relangue) this._textesSquelette();
    if (this._hass) this._construire();
  }

  set hass(hass) {
    const relangue = this._langue(hass);
    if (relangue) this._sim?.renommer();
    if (this._sim) { this._hassBrut = hass; hass = this._hassDemo(hass); }
    this._hass = hass;
    if (this._ok) this._accroches("hass");
    if (!this._ok) this._construire();
    else if (relangue) this._relangue();
    else if (this._rp) return; // replay : le plan montre l'historique, pas le direct
    else if (this._change()) this._maj();
  }

  // langue de l'interface : option `language` (en | fr), sinon celle du profil HA, sinon celle de la page ; elle est commune à la page
  // (MaquetteI18n), chaque carte la remet à la sienne avant de se dessiner. Renvoie true si elle a changé pour cette carte.
  _langue(hass = this._hass) {
    const I = globalThis.MaquetteI18n, l = this._lgOpt;
    I.definir(hass, l === "en" || l === "fr" ? l : null);
    const avant = this._lg;
    this._lg = `${I.langue()}|${I.locale()}`;
    return avant != null && avant !== this._lg;
  }

  // changement de langue sans recharger : textes fixes, plan, résumé, widgets et éditeur ouvert redessinés (fiche et replay fermés)
  _relangue() {
    if (this._rp) this._replayFermer();
    this.shadowRoot?.querySelector("dialog.mf")?.close();
    this._textesSquelette();
    this._construire();
    const ed = this._editeur;
    if (ed) { ed._barre(); ed._panneau(); }
  }

  _textesSquelette() {
    const R = this.shadowRoot;
    if (!R) return;
    for (const [sel, cle] of [[".retour", _tk("Toute la maison")], [".editer", _tk("Modifier le plan")], ["[data-z=calques]", _tk("Calques affichés")],
      ["[data-z=plus]", _tk("Zoomer")], ["[data-z=moins]", _tk("Dézoomer")], ["[data-z=tout]", _tk("Toute la maison")], ["[data-z=replay]", _tk("Revoir la journée")]]) {
      const b = R.querySelector(`.barre ${sel}, .zoom ${sel}`);
      if (b) b.title = _t(cle);
    }
  }

  // démo : hass de HA, avec les états de la simulation par-dessus, ses services et son historique (soleil et coordonnées réels)
  _hassDemo(h) {
    const sim = this._sim;
    sim.placer(h.config);
    if (!this._desabonner) this._desabonner = sim.abonner(() => { if (this._hassBrut && this.isConnected) this.hass = this._hassBrut; });
    const w = Object.create(h);
    w.states = { ...h.states, ...sim.etats };
    w.callService = (d, s, data, cible) => sim.service(d, s, data, cible);
    w.callWS = (m) => sim.ws(m);
    return w;
  }

  disconnectedCallback() { this._desabonner?.(); this._desabonner = null; if (this._rp) this._replayFermer(); if (this._editeur) this._editeur.fermer(true); this.shadowRoot?.querySelector("dialog.mf")?.close(); clearInterval(this._tm); this._tm = 0; this._vu?.disconnect(); this._vu = null; if (this._visi) document.removeEventListener("visibilitychange", this._visi); this._visi = null; clearInterval(this._tmBi); this._tmBi = 0; clearTimeout(this._tmRetour); this._tmRetour = 0; }
  connectedCallback() {
    if (this._sim && this._hassBrut) this.hass = this._hassBrut; // la simulation reprend
    if (this._sq) requestAnimationFrame(() => { this._mise(); this._majCrayon(); if (this._ok) this._minuterie(); });
  }

  // ambiance : traces qui s'estompent et soleil qui avance (toutes les 30 s) ; animations en pause quand le plan n'est pas à l'écran
  _minuterie() {
    const A = this._config.ambiance, il = !!(A && !this._editeur && (coucheTraces(A) || coucheJour(A)));
    if (il && !this._tm) this._tm = setInterval(() => { if (this.isConnected && this._ok) { this._majTraces(); this._majAmbiance(); } }, 30000);
    if (!il && this._tm) { clearInterval(this._tm); this._tm = 0; }
    // tablette murale : anti-marquage (jamais en édition, où la carte reste à sa place)
    const bi = !!this._tablette()?.anti_marquage;
    if (bi && !this._tmBi) this._tmBi = setInterval(() => { if (this.isConnected && this._ok) this._pasAntiMarquage(); }, PAS_ANTI_MARQUAGE);
    if (!bi && this._tmBi) { clearInterval(this._tmBi); this._tmBi = 0; }
    if (!bi && this._bi != null) { this._bi = null; this.shadowRoot?.querySelector("ha-card")?.style.removeProperty("transform"); }
    const z = this.shadowRoot?.querySelector(".zone");
    if (z && !this._vu && typeof IntersectionObserver === "function") {
      this._vu = new IntersectionObserver((l) => { for (const e of l) { this._horsVue = !e.isIntersecting; this._pauseAnimations(); } });
      this._vu.observe(z);
    }
    // page cachée (autre onglet, écran éteint) : animations en pause aussi (classe-ambiance.js)
    if (!this._visi) { this._visi = () => this._pauseAnimations(); document.addEventListener("visibilitychange", this._visi); }
  }

  // réglages effectifs : interaction, mode tablette (jamais en édition : l'éditeur montre tout), niveau d'animation
  _tablette() { return this._editeur ? null : tabletteDe(this._config); }
  _figee() { return !this._editeur && interactionDe(this._config).figee; }
  _niveauAnim() { return niveauAnimDe(this._config); }
  // animations SMIL (météo, flux d'énergie, vitrine) dessinées figées : niveau réduit ou aucun, ou mouvement réduit demandé par le système
  _sansBoucles() { return this._niveauAnim() !== "complet" || matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // un pas d'anti-marquage : décalage de la carte entière (transform, sans effet sur la mise en page ; reconnu des vieilles WebView)
  _pasAntiMarquage() {
    const card = this.shadowRoot?.querySelector("ha-card");
    if (!card) return;
    this._bi = (this._bi ?? 12) + 1;
    const [x, y] = decalageAntiMarquage(this._bi);
    if (x || y) card.style.transform = `translate(${x}px, ${y}px)`; else card.style.removeProperty("transform");
  }

  // `interaction.reset_after` : compte à rebours relancé à chaque action sur la carte
  _activite() {
    clearTimeout(this._tmRetour); this._tmRetour = 0;
    const s = this._config ? interactionDe(this._config).retour : 0;
    if (s > 0) this._tmRetour = setTimeout(() => this._retourAuto(), s * 1000);
  }
  // jamais pendant l'édition ni pendant la lecture d'un replay : le compte à rebours reprend
  _retourAuto() {
    this._tmRetour = 0;
    if (!this._ok || !this.isConnected || !(interactionDe(this._config).retour > 0)) return;
    if (this._editeur || this._rp?.lecture) return this._activite();
    this.revenirAuPlan();
    // étages : retour à `default_floor` (sinon au premier), même vue figée
    const e = etageInitial(this._plein, null);
    if (e != null && e !== this._etage) this._changerEtage(e);
  }
  // retour au plan entier : fiche et menu des calques fermés, replay en pause fermé (retour au direct), vue de la pièce fermée, zoom initial
  revenirAuPlan() {
    const R = this.shadowRoot, d = R?.querySelector("dialog.mf");
    if (d?.open) d.close();
    this._menuCalques(false);
    if (this._rp && !this._rp.lecture) this._replayFermer();
    if (this._iso != null || this._vue) this.toutVoir();
  }

  // pleine page : la carte occupe la hauteur restante de l'écran, le plan tient sans défilement
  _mise() {
    const R = this.shadowRoot, card = R?.querySelector("ha-card");
    if (!card || !this._box) return;
    // sur téléphone (carte étroite) : défilement de page autorisé, plan en pleine largeur et fiche dépliée dessous
    // mode tablette : toujours en pleine page, quelle que soit la largeur
    const plein = this._tablette() ? true : this._config.plein_ecran !== false && this.clientWidth >= 760;
    card.classList.toggle("plein", plein);
    if (plein) {
      const haut = card.getBoundingClientRect().top - (this._bi != null ? decalageAntiMarquage(this._bi)[1] : 0); // sans le décalage anti-marquage
      if (haut >= 0) card.style.height = `${Math.max(420, window.innerHeight - haut - 8)}px`;
    } else card.style.height = "";
    const corps = R.querySelector(".corps"), plan = R.querySelector(".plan");
    const { P } = this._panneauxCourants(), aG = !!P.gauche?.length, aD = !!P.droite?.length;
    const cw = corps.clientWidth, ch = plein ? corps.clientHeight : Infinity, r = this._box.W / this._box.H;
    const fiche = !R.querySelector(".fiche").hidden, ed = !!this._editeur, vue = R.querySelector(".vue");
    const mode = cw >= 1180 ? "large" : cw >= 760 ? "moyen" : "etroit";
    if (mode !== this._modeMise) { this._modeMise = mode; this._widgets(); this._placerZoom(); }
    // en édition, la vue finale garde exactement sa mise en page (l'éditeur n'a plus de panneau latéral : rien n'est pris à sa largeur)
    const reduite = ed && mode !== "etroit";
    this._zVue = 1;
    card.classList.toggle("ed-etroit", ed && mode === "etroit");
    vue.style.zoom = "";
    vue.style.width = reduite ? `${cw}px` : "";
    vue.style.height = reduite && plein ? `${ch}px` : "";
    const voirG = mode === "large" && (aG || ed);
    const voirD = fiche || aD || (mode !== "large" && aG) || (ed && mode !== "etroit");
    R.querySelector(".col-g").hidden = !voirG;
    R.querySelector(".col-d").hidden = !voirD;
    const cote = voirD || ed;
    corps.classList.toggle("colonne", mode === "etroit" && cote);
    const dispoW = mode === "etroit" ? cw : cw - (voirG ? 336 : 0) - (voirD ? 336 : 0);
    const dispoH = mode === "etroit" && cote && plein ? ch * 0.6 : ch;
    plan.style.width = `${Math.floor(Math.max(200, Math.min(dispoW, (dispoH - 16) * r + 16)))}px`;
    this._ajusterCols();
    this._tailleBadges();
  }

  // badge de valeur resserré (classe « petit », police d'au moins 10 px) quand le meuble fait moins de 24 px à l'écran dans les deux
  // sens (un meuble fin, tableau électrique, radiateur, garde son badge normal tant que sa longueur dépasse 24 px ; recalculé au zoom et au redimensionnement)
  _tailleBadges(v = this.vue()) {
    const R = this.shadowRoot, z = R?.querySelector(".zone"), l = R?.querySelectorAll(".calque>.mb");
    // textes figés sur le plan : ils grossissent et rapetissent avec le zoom comme le dessin (1 = plan entier de la vue)
    z?.style.setProperty("--zk", +((this._refW || v.W) / v.W).toFixed(4));
    this._rangeePersonnes();
    this._eviterPastilles();
    if (!l?.length || !z.clientWidth) return;
    const k = z.clientWidth / v.W;
    l.forEach((b) => {
      const m = this._config.meubles?.[+b.dataset.mbq], t = m && (m.taille || MEUBLES[m.type]?.taille || [60, 60]);
      if (t) b.classList.toggle("petit", Math.max(nb(t[0], 60), nb(t[1], 60)) * k < 24);
    });
  }

  // étiquette de pièce recouverte par une pastille (petit écran surtout) : décalée vers la place libre la plus proche (au plus deux
  // hauteurs d'étiquette en hauteur, une largeur en largeur) ; rien ne bouge sans chevauchement. En vue seulement : dans l'éditeur, l'étiquette reste à
  // la position qu'on règle. Recalculé à la mise en page, au zoom et quand les valeurs changent.
  _eviterPastilles() {
    const R = this.shadowRoot, etqs = [...(R?.querySelectorAll(".calque>.etq") || [])];
    etqs.forEach((e) => { if (e.classList.contains("evite")) { e.classList.remove("evite"); e.style.removeProperty("--dx"); e.style.removeProperty("--dy"); } });
    if (this._editeur || !etqs.length) return;
    const pts = [...R.querySelectorAll(".calque>.pt")].map((p) => p.getBoundingClientRect()).filter((r) => r.width > 0);
    if (!pts.length) return;
    const pris = [];
    for (const e of etqs) {
      const r = e.getBoundingClientRect();
      if (!r.width) continue;
      const libre = (dx, dy) => !pts.some((p) => p.left < r.right + dx - 2 && p.right > r.left + dx + 2 && p.top < r.bottom + dy - 2 && p.bottom > r.top + dy + 2)
        && !pris.some((q) => q.left < r.right + dx && q.right > r.left + dx && q.top < r.bottom + dy && q.bottom > r.top + dy);
      if (libre(0, 0)) continue;
      let mieux = null;
      for (let dy = -Math.round(r.height * 2 / 4) * 4; dy <= r.height * 2; dy += 4)
        for (let dx = -Math.round(r.width / 4) * 4; dx <= r.width; dx += 4) {
          const d = Math.hypot(dx * 1.5, dy); // un peu plus loin en largeur : l'étiquette reste au-dessus ou au-dessous de sa place
          if ((!mieux || d < mieux.d) && libre(dx, dy)) mieux = { dx, dy, d };
        }
      if (!mieux) continue;
      const z = this._zVue || 1;
      e.classList.add("evite");
      e.style.setProperty("--dx", `${mieux.dx / z}px`); e.style.setProperty("--dy", `${mieux.dy / z}px`);
      pris.push({ left: r.left + mieux.dx, right: r.right + mieux.dx, top: r.top + mieux.dy, bottom: r.bottom + mieux.dy });
    }
  }

  static getStubConfig() {
    return versAnglais({ titre: _t("Mon plan"), pieces: [{ nom: _t("Pièce"), poly: [[0, 0], [400, 0], [400, 300], [0, 300]], etiquette: [200, 150] }],
      murs: [[0, 0, 400, 0], [400, 0, 400, 300], [400, 300, 0, 300], [0, 300, 0, 0]] });
  }

  getCardSize() { return 14; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  // entités suivies : celles de TOUTE la maison (résumé, alertes et pastilles d'étage comptent tous les étages) ; sans étages, la config
  _entites() {
    const c = this._config, l = [], E = parEtage(c);
    for (const e of E) for (const p of e.geo.pieces) l.push(p.temperature, p.humidite);
    for (const e of E) for (const t of e.geo.textes) if (Array.isArray(t?.infos)) for (const x of t.infos) l.push(x?.entite);
    for (const e of E) for (const o of e.geo.ouvertures) { l.push(...contactsDe(o), o.volet, o.entite); for (const w of o.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const e of E) for (const p of e.geo.points) { l.push(p.entite, p.actif, p.valeur); for (const w of p.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const e of E) for (const m of e.geo.meubles) { l.push(m.entite, m.actif, m.valeur); for (const w of m.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const w of [...(c.panneaux?.gauche || []), ...(c.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    for (const q of this._puces()) if (q.afficher === "absent" || q.afficher === "present") l.push(q.presence || presenceDefaut(c)); // puces selon la présence
    for (const p of c.pieces) for (const w of [...(p.panneaux?.gauche || []), ...(p.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    const A = c.ambiance;
    if (coucheJour(A)) l.push(coucheJour(A).soleil || "sun.sun");
    if (coucheMeteo(A)) l.push(coucheMeteo(A).entite);
    const LU = coucheLumiere(A);
    if (LU) l.push(soleilDe(A), ...(LU.lune ? [this._entiteLune(LU)] : []));
    l.push(...this._listePersonnes(A).map((p) => p.entite));
    for (const r of Array.isArray(c.alertes) ? c.alertes : []) if (r && typeof r === "object") {
      l.push(r.entite, ...(Array.isArray(r.entites) ? r.entites : []), r.si_absent ? r.presence || presenceDefaut(c) : null);
      if (r.type === "ouvertures") for (const e of E) for (const o of e.geo.ouvertures) l.push(...contactsDe(o), o.entite);
    }
    return [...new Set(l.filter((e) => typeof e === "string" && e.includes(".")))];
  }

  _change() {
    let diff = false;
    for (const e of this._suivies) {
      const s = this._hass.states[e];
      if (s !== this._prec[e]) { this._prec[e] = s; diff = true; }
    }
    return diff;
  }

  _squelette() {
    if (this._sq) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    poserHTML(this.shadowRoot, `<style>${CSS}${CSS_BARRE}</style><ha-card>
      <div class="barre"><button class="ib retour" hidden title="${_t("Toute la maison")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button><div class="titre"></div>
        <button class="ib editer" title="${_t("Modifier le plan")}" hidden><ha-icon icon="mdi:pencil-ruler"></ha-icon></button></div>
      <div class="tete"></div>
      <div class="corps"><div class="vue"><aside class="col col-g" hidden><div class="col-in"><div class="widgets"></div></div></aside><div class="plan"><div class="zone"></div>
        <div class="zoom"><button data-z="calques" title="${_t("Calques affichés")}" aria-expanded="false" hidden><ha-icon icon="mdi:layers-outline"></ha-icon></button>
          <button data-z="plus" title="${_t("Zoomer")}"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button data-z="moins" title="${_t("Dézoomer")}"><ha-icon icon="mdi:minus"></ha-icon></button>
          <button data-z="tout" title="${_t("Toute la maison")}" hidden><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button>
          <button data-z="replay" title="${_t("Revoir la journée")}" hidden><ha-icon icon="mdi:history"></ha-icon></button></div></div>
        <aside class="col col-d" hidden><div class="col-in"><div class="fiche" hidden></div><div class="widgets"></div></div></aside></div></div>
      <div class="legende"></div></ha-card>`);
    const R = this.shadowRoot;
    R.querySelector("ha-card").addEventListener("click", (ev) => {
      const chemin = ev.composedPath();
      const z = chemin.find((n) => n.dataset?.z);
      if (z?.dataset.z === "calques") return this._menuCalques();
      const al = chemin.find((n) => n.dataset?.al);
      if (al) return this._actionAlerte(al.dataset.al);
      if (z?.dataset.z === "replay") return this._rp ? this._replayFermer() : this._replayOuvrir();
      const rp = chemin.find((n) => n.dataset?.rp);
      if (rp) return this._actionReplay(rp.dataset.rp);
      if (chemin.some((n) => n.classList?.contains("replay"))) return;
      if (z) return z.dataset.z === "tout" ? this.toutVoir() : this.zoomer(z.dataset.z === "plus" ? 1 / 1.6 : 1.6);
      if (chemin.some((n) => n.classList?.contains("menu-cq"))) return;
      if (chemin.some((n) => n.classList?.contains("retour"))) return this.toutVoir();
      const dep = chemin.find((n) => n.dataset?.depart);
      if (dep) return this._demarrer(dep.dataset.depart);
      if (this._editeur) {
        const aj = chemin.find((n) => n.dataset?.ajouter);
        if (aj) { const pc = this._panneauxCourants(); return this._editeur.ouvrirCatalogue({ widgets: true, cote: aj.dataset.ajouter, piece: pc.pi, ...(pc.pf ? { [pc.pf.genre]: pc.pf.i } : {}) }); }
        if (chemin.some((n) => n.dataset?.ajouterPuce != null)) return this._editeur.ajouterPuce();
        if (this._puceGlissee) return;
        const pu = chemin.find((n) => n.dataset?.puce != null);
        if (pu) return this._editeur.selectionner({ type: "puce", i: +pu.dataset.puce });
        if (this._wDrag) { this._wDrag = false; return; }
        const w = chemin.find((n) => n.dataset?.w);
        if (w) this._editeur.selectionner(this._selWidget(w.dataset.w));
        return;
      }
      if (this._aBouge) { this._aBouge = false; return; }
      const mb = chemin.find((n) => n.dataset && (n.dataset.mbq != null || (n.dataset.mb != null && n.classList?.contains("connecte"))));
      if (mb) return this._clicMeuble(+(mb.dataset.mbq ?? mb.dataset.mb));
      // interrupteur (vue de la pièce, lignes des widgets) : avant la ligne qui le porte (sa fiche, plus d'infos)
      const bas = chemin.find((n) => n.classList?.contains("bascule"));
      if (bas) return this._basculer(bas);
      // ouverture ou pastille (sur le plan ou dans la fiche d'une pièce) : sa fiche si elle en a une, sinon le comportement d'avant
      const po = chemin.find((n) => n.dataset && (n.dataset.o ?? n.dataset.fo ?? n.dataset.q ?? n.dataset.fq) != null);
      if (po && this._clicPorteur((po.dataset.o ?? po.dataset.fo) != null ? "ouverture" : "point", +(po.dataset.o ?? po.dataset.fo ?? po.dataset.q ?? po.dataset.fq))) return;
      const cmd = chemin.find((n) => n.dataset?.cmd);
      if (cmd) return this._lancerCommande(cmd);
      const act = chemin.find((n) => n.dataset?.active);
      if (act) return this._activer(act);
      const th = chemin.find((n) => n.dataset?.th);
      if (th) return this._reglerThermostat(th);
      const cta = chemin.find((n) => n.classList?.contains("cta"));
      if (cta) return this._lancerAction(cta);
      if (chemin.some((n) => n.classList?.contains("voile"))) return this.toutVoir();
      const piece = chemin.find((n) => n.dataset && (n.dataset.l != null || n.dataset.p != null));
      const ip = piece ? +(piece.dataset.l ?? piece.dataset.p) : null;
      // pièce réglée sans vue (`zoom: false`, ex. extérieurs) : pas de zoom, seulement l'entité de son étiquette s'il y en a une
      if (ip != null && ip !== this._iso && this._config.pieces[ip]?.zoom !== false) {
        // `interaction.room_tap` : vue de la pièce (défaut), « plus d'infos » de son entité `tap` (sinon de sa température), ou rien
        const cp = interactionDe(this._config).clic, p = this._config.pieces[ip];
        if (cp === "vue") return this.isoler(ip);
        if (cp === "infos") this._plusInfos(p.clic || p.temperature);
        return;
      }
      const el = chemin.find((n) => n.dataset && n.dataset.e);
      if (!el || this._sim) return;
      const e = new Event("hass-more-info", { bubbles: true, composed: true });
      e.detail = { entityId: el.dataset.e };
      this.dispatchEvent(e);
    });
    R.querySelector(".editer").addEventListener("click", () => this.ouvrirEditeur());
    R.querySelector(".tete").addEventListener("pointerdown", (ev) => {
      const pu = this._editeur && ev.composedPath().find((n) => n.dataset?.puce != null);
      if (pu) this._editeur.glisserPuce(ev, pu);
    });
    this._glisserWidgets(R.querySelector(".vue"));
    this._gestes(R.querySelector(".zone"));
    // édition, panneau Ambiance ouvert : les avatars à la maison se glissent (point de rassemblement `ambiance.personnes.maison`) ;
    // en capture, avant les écouteurs de l'éditeur (sélection, cadre, déplacement de la vue)
    R.querySelector(".zone").addEventListener("pointerdown", (ev) => {
      if (!this._editeur?.vueAmbiance || ev.button > 0) return;
      const p = ev.composedPath().find((n) => n.classList?.contains("pers") && n.dataset?.pers && !n.classList.contains("dehors"));
      if (!p) return;
      ev.preventDefault(); // ni sélection de texte ni glisser natif (qui annulerait le pointeur)
      ev.stopImmediatePropagation();
      this._editeur.glisserPersonnes(ev);
    }, true);
    R.querySelector(".zone").addEventListener("keydown", (ev) => {
      if (this._editeur || (ev.key !== "Enter" && ev.key !== " ")) return;
      const g = ev.target.closest?.(".ouv.a-fiche[tabindex]");
      if (g) { ev.preventDefault(); this._clicPorteur("ouverture", +g.dataset.o); }
    });
    // `interaction.reset_after` : toute action sur la carte (plan, fiche, menus) relance le compte à rebours du retour au plan entier
    for (const t of ["pointerdown", "keydown", "wheel"]) this.addEventListener(t, () => this._activite(), { passive: true });
    this._ro = new ResizeObserver(() => this._mise());
    this._ro.observe(this);
    window.addEventListener("resize", (this._surResize = () => this._mise()));
    this._sq = true;
  }

  async ouvrirEditeur(reprise = null) {
    if (this._editeur || this._ouverture) return;
    if (this._rp) this._replayFermer();
    this._ouverture = true;
    try {
      // l'éditeur est un module à part, chargé à la première ouverture (chargerEditeur, en tête de la carte)
      let EditeurPlan;
      try { EditeurPlan = await chargerEditeur(); } catch (e) {
        // module introuvable (installation manuelle d'un seul fichier) : la carte continue sans éditeur, message clair
        console.error("maquette-card : editor module not loaded", e);
        return this._avisEditeur(_t("Éditeur introuvable : copier maquette-editeur.js à côté de maquette-card.js (même dossier), puis recharger la page."));
      }
      // fichier d'une autre version (cache du navigateur, copie oubliée) : refusé plutôt qu'un éditeur incohérent
      if (EditeurPlan.VERSION && EditeurPlan.VERSION !== VERSION) {
        return this._avisEditeur(_t("maquette-editeur.js (v{a}) ne correspond pas à la carte (v{b}) : le remplacer, puis recharger la page.", { a: EditeurPlan.VERSION, b: VERSION }));
      }
      if (this.isConnected) new EditeurPlan(this, reprise);
    } finally { this._ouverture = false; }
  }

  // message de chargement de l'éditeur : notification de Home Assistant (bandeau en bas) et console
  _avisEditeur(message) {
    console.warn(`maquette-card : ${message}`);
    this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
  }

  // boutons de l'état vide : ouvre l'éditeur puis lance l'assistant, l'outil rectangle ou l'import
  async _demarrer(a) {
    if (!this._editeur) await this.ouvrirEditeur();
    const e = this._editeur;
    if (!e) return;
    ({ pieces: () => e.assistantPieces(), rectangle: () => e.choisirOutil("rectangle"), importer: () => e.exporter() })[a]?.();
  }

  _reprise() {
    if (this._editeur || !this._hass?.user?.is_admin) return;
    const cle = cleRouvrir(this._config.id);
    let r = null;
    try { r = JSON.parse(sessionStorage.getItem(cle) || "null"); sessionStorage.removeItem(cle); } catch (e) { return; }
    if (r && Date.now() - r.t < 30000) setTimeout(() => this.ouvrirEditeur(r), 0);
  }

  // repère : position d'un événement pointeur en cm (coordonnées du plan)
  cm(ev) {
    const svg = this.shadowRoot.querySelector(".zone svg");
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  // cadre du plan : celui de l'étage affiché, ou l'union de tous les étages (la carte ne change ni d'échelle ni de hauteur d'un étage
  // à l'autre ; l'image de fond n'y entre pas) — en vue, calculée une fois par config et par largeur affichée
  static PX_BULLES = 32; // demi-emprise d'une pastille à l'écran (px, halo compris), réservée autour d'elle dans le cadre du plan
  bornes(sansVitrine = false) {
    const c = this._config, m = c.marge ?? 40;
    let b;
    if (idsEtages(c).length > 1) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, K = this._bornesEt;
      if (!this._editeur && K && K.plein === this._plein && K.P === P) b = K.b;
      else {
        const l = parEtage(c).map((e) => this._bornesGeo({ ...e.geo, marge: c.marge }, true)).filter(Boolean);
        b = l.length ? l.reduce((u, q) => { const x0 = Math.min(u.x0, q.x0), y0 = Math.min(u.y0, q.y0); return { x0, y0, W: Math.max(u.x0 + u.W, q.x0 + q.W) - x0, H: Math.max(u.y0 + u.H, q.y0 + q.H) - y0 }; })
          : this._bornesGeo(c);
        this._bornesEt = this._editeur ? null : { plein: this._plein, P, b };
      }
    } else b = this._bornesGeo(c);
    if (!c.vitrine || sansVitrine) return b;
    const v = geoVitrine(c, b), X0 = Math.min(b.x0, v.x - m), Y0 = Math.min(b.y0, v.y - m);
    return { x0: X0, y0: Y0, W: Math.max(b.x0 + b.W, v.x + v.w + m) - X0, H: Math.max(b.y0 + b.H, v.y + v.H + m) - Y0 };
  }
  // cadre d'une géométrie (listes d'un étage, ou la config) ; vide : null si `nulSiVide`, sinon 0..500
  _bornesGeo(c, nulSiVide = false) {
    const xs = [], ys = [];
    const ajoute = (x, y) => { xs.push(x); ys.push(y); };
    c.pieces.forEach((p) => p.poly.forEach(([x, y]) => ajoute(x, y)));
    [...(c.murs || []), ...(c.limites || []), ...(c.ouvertures || []).map((o) => o.seg)].forEach(([a, b, d, e]) => { ajoute(a, b); ajoute(d, e); });
    (c.points || []).forEach((p) => ajoute(...p.pos));
    (c.meubles || []).forEach((m) => { const [w, h] = [0, 1].map((j) => nb((m.taille || MEUBLES[m.type]?.taille || [60, 60])[j], 60)), r = Math.hypot(w, h) / 2; ajoute(nb(m.pos?.[0]) - r, nb(m.pos?.[1]) - r); ajoute(nb(m.pos?.[0]) + r, nb(m.pos?.[1]) + r); });
    if (!xs.length) { if (nulSiVide) return null; ajoute(0, 0), ajoute(500, 500); }
    const m = c.marge ?? 40;
    let x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, x1 = Math.max(...xs) + m, y1 = Math.max(...ys) + m;
    // textes figés et zones d'informations (centrés sur leur position, police en px : clamp(10px, 1,2 % de la largeur, 13px)) :
    // emprise estimée d'après leurs caractères et la largeur affichée du plan ; le cadre ne s'agrandit que si un texte dépasse
    const textes = (c.textes || []).filter((t) => t && Array.isArray(t.pos) && Number.isFinite(+t.pos[0]) && Number.isFinite(+t.pos[1]));
    if (textes.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, px = Math.max(10, Math.min(13, 0.012 * P));
      const nomL = (l) => String(l?.nom || this._hass?.states?.[l?.entite]?.attributes?.friendly_name || l?.entite || "").length;
      // largeur d'un texte en em : majuscules et chiffres plus larges, espaces plus étroits
      const largeur = (txt) => [...txt].reduce((a, ch) => a + (ch === " " ? 0.3 : /[A-Z0-9ÀÂÉÈÊÎÔÛÇMW]/.test(ch) ? 0.72 : 0.56), 0);
      for (let tour = 0; tour < 4; tour++) { // l’emprise agrandit le plan, donc les textes en cm : quelques passes
        const em = (px * (x1 - x0)) / P;
        for (const t of textes) {
          const f = em * Math.max(0.3, Math.min(5, nb(t.taille, 1))), titre = String(t.t ?? ""), info = Array.isArray(t.infos);
          const l = info ? Math.max(6, largeur(titre) + 1.5, ...t.infos.map((x) => (nomL(x) + 9) * 0.55 + 2.2)) * f + 1.5 * f : Math.max(0.6, largeur(titre)) * f;
          const h = info ? ((t.infos.length || 1) + (titre ? 1 : 0)) * 1.5 * f + 0.9 * f : 1.3 * f;
          const [x, y] = [+t.pos[0], +t.pos[1]];
          x0 = Math.min(x0, x - l / 2 - 8); x1 = Math.max(x1, x + l / 2 + 8); y0 = Math.min(y0, y - h / 2 - 8); y1 = Math.max(y1, y + h / 2 + 8);
        }
      }
    }
    // pastilles (taille en px : environ 2,6 em, plus l'onde d'une pastille active, MaquetteCard.PX_BULLES) : jamais rognées par le bord du plan
    const pts = (c.points || []).filter((p) => Array.isArray(p?.pos) && Number.isFinite(+p.pos[0]) && Number.isFinite(+p.pos[1]));
    if (pts.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800;
      for (let tour = 0; tour < 3; tour++) {
        const r = (MaquetteCard.PX_BULLES * (x1 - x0)) / P;
        for (const p of pts) { const x = +p.pos[0], y = +p.pos[1]; x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); }
      }
    }
    return { x0, y0, W: x1 - x0, H: y1 - y0 };
  }

  // calques effectifs : ordre de dessin, masqués (config, afficher_meubles, choix du visiteur en vue) et verrouillés (édition seulement)
  _calques() {
    const c = this._config, q = c.calques || {}, ed = !!this._editeur, masques = new Set(q.masques || []);
    if (c.afficher_meubles === false || (c.afficher_meubles === "pc" && this.clientWidth < 760)) masques.add("meubles");
    if (!ed) this._calquesVisiteur().forEach((k) => masques.add(k));
    return { svg: ordreCalques(q.ordre_svg, CALQUES_SVG), html: ordreCalques(q.ordre_html, CALQUES_HTML), masques, verrous: new Set(ed ? q.verrous || [] : []) };
  }

  // bouton « Calques » en vue : choix propres à ce navigateur (jamais dans la config), ignorés si le bouton est retiré
  _cleCalques() { return `maquette-calques:${this._config.id || "plan"}`; }
  _calquesVisiteur() {
    if (!this._config.calques?.bouton_vue) return [];
    const cle = this._cleCalques();
    if (this._cqV?.cle !== cle) {
      let l = [];
      try { l = JSON.parse(localStorage.getItem(cle) || "[]"); } catch (e) { /* stockage indisponible : rien de caché */ }
      this._cqV = { cle, l: Array.isArray(l) ? l.filter((k) => NOMS_CALQUES[k]) : [] };
    }
    return this._cqV.l;
  }
  // calques proposés dans le menu de la vue : ceux qui ont des éléments et que la config ne cache pas déjà
  _calquesMenu() {
    const c = this._config, q = c.calques || {}, P = c.points || [], M = c.meubles || [];
    const presents = { meubles: M.length, appareils: P.length, halos: P.some((p) => p.halo), limites: (c.limites || []).length, sous_zones: c.pieces.some((p) => p.sous_zone),
      etiquettes: c.pieces.some((p) => !p.sous_zone && p.etiquette), libelles: c.pieces.some((p) => p.sous_zone && p.etiquette) || M.some((m) => m.type === "espace" && m.nom), textes: (c.textes || []).length };
    const fixes = new Set(q.masques || []);
    if (c.afficher_meubles === false) fixes.add("meubles");
    return Object.keys(presents).filter((k) => presents[k] && !fixes.has(k));
  }
  _menuCalques(ouvrir = true) {
    const R = this.shadowRoot, zoom = R.querySelector(".zoom"), btn = R.querySelector('[data-z="calques"]'), ouvert = R.querySelector(".menu-cq");
    if (ouvert || !ouvrir) {
      ouvert?.remove();
      btn.setAttribute("aria-expanded", "false");
      window.removeEventListener("pointerdown", this._horsMenu, true);
      return;
    }
    const caches = new Set(this._calquesVisiteur());
    const m = document.createElement("div");
    m.className = "menu-cq";
    m.setAttribute("role", "group");
    m.setAttribute("aria-label", _t("Calques affichés"));
    poserHTML(m, `<div class="t">${_t("Afficher")}</div>${this._calquesMenu().map((k) => `<label><input type="checkbox" data-cqv="${k}" ${caches.has(k) ? "" : "checked"}><ha-icon icon="${ICONES_CALQUES[k]}"></ha-icon><span>${esc(_t(NOMS_CALQUES[k]))}</span></label>`).join("")}`);
    m.onchange = (ev) => {
      const k = ev.target.dataset.cqv;
      if (!k) return;
      const l = new Set(this._calquesVisiteur());
      if (ev.target.checked) l.delete(k); else l.add(k);
      this._cqV = { cle: this._cleCalques(), l: [...l] };
      if (l.size) stock.ecrire(this._cqV.cle, JSON.stringify([...l])); else stock.retirer(this._cqV.cle); // stockage indisponible : le choix vaut pour cette page
      this._construire();
    };
    m.onkeydown = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._menuCalques(false); btn.focus(); } };
    this._horsMenu = (ev) => { if (!ev.composedPath().some((n) => n === m || n === btn)) this._menuCalques(false); };
    window.addEventListener("pointerdown", this._horsMenu, true);
    zoom.append(m);
    btn.setAttribute("aria-expanded", "true");
    m.querySelector("input")?.focus();
  }

  // couleurs nommées : --mq-c-<nom> sur l'hôte (héritées dans le shadow DOM) ; les noms retirés de la palette perdent leur variable
  _poserPalette(c) {
    const l = palette(c), noms = new Set(l.map(([n]) => n));
    for (const n of this._palNoms || []) if (!noms.has(n)) this.style.removeProperty(`--mq-c-${n}`);
    for (const [n, v] of l) { paletteActive.add(n); this.style.setProperty(`--mq-c-${n}`, v); }
    this._palNoms = noms;
  }
  _construire() {
    this._squelette();
    const c = this._config, R = this.shadowRoot;
    this._poserPalette(c);
    this._suivies = this._entites();
    this._prec = {};
    this._box = this._boxFige || this.bornes();
    this._refW = this.bornes().W; // textes et zones d'informations : taille rapportée au plan entier de la vue
    if (this._editeur) this._iso = null;
    if (this._iso != null && !c.pieces[this._iso]) this._iso = null;
    // fiche ouverte d'un élément qui n'existe plus ou n'a plus de fiche (config rechargée), ou éditeur ouvert : on la ferme
    if (this._mf && (this._editeur || !this._ficheOuvrable(this._mf.genre, this._mfObjet()))) R?.querySelector("dialog.mf")?.close();
    const { x0, y0, W, H } = this.vue();
    const pct = ([x, y]) => `left:${((x - x0) / W * 100).toFixed(3)}%;top:${((y - y0) / H * 100).toFixed(3)}%`;
    const xy = ([x, y]) => `data-x="${+x}" data-y="${+y}"`;
    const chemin = (segs) => segs.map(([a, b, d, e]) => `M${a} ${b}L${d} ${e}`).join("");

    // calques : masqués = absents en vue, à 25 % et non cliquables en édition ; verrouillés = transparents au clic (édition)
    const Q = this._calques(), ed = !!this._editeur;
    const voir = (k) => ed || !Q.masques.has(k);
    const cq = (...ks) => ks.map((k) => `${Q.masques.has(k) ? " c-masque" : ""}${Q.verrous.has(k) ? " c-verrou" : ""}`).join("");
    // élément masqué (`masque: true`) : absent en vue, en transparence (mais sélectionnable) en édition
    const garde = (o) => ed || !o?.masque, em = (o) => (o?.masque ? " e-masque" : "");
    const trie = (l, niv = (o) => nb(o.niveau)) => l.map((o, i) => [o, i]).filter(([o]) => garde(o)).sort((a, b) => niv(a[0]) - niv(b[0]) || a[1] - b[1]);
    const S = {};
    // sous-zones (cuisine, douche…) : contour pointillé au-dessus des pièces, sans teinte ; en vue, le clic passe à la pièce dessous
    for (const [k, sz] of [["pieces", false], ["sous_zones", true]]) S[k] = trie(c.pieces).filter(([p]) => !!p.sous_zone === sz)
      .map(([p, i]) => `<polygon class="piece${p.dehors ? " dehors" : ""}${p.sous_zone ? " sous-zone" : ""}${em(p)}" data-p="${i}" points="${ptsSvg(p.poly)}"/>`).join("");
    // lumière de l'ambiance (`ambiance.lumiere.lampes`) : un dégradé par halo, à la couleur de la lampe, fondus entre eux (écran)
    // et coupés par l'espace de la pièce de la lampe (celle où elle est posée si `piece` manque ; pièces ouvertes l'une sur l'autre réunies,
    // voir espacesOuverts) ; `piece: false` = halo libre, jamais coupé
    const LU = coucheLumiere((!ed || this._editeur?.vueAmbiance) && objetSimple(c.ambiance) ? c.ambiance : null), lampes = !!LU?.lampes;
    let ESP = null;
    S.halos = (c.points || []).map((p, i) => {
      if (!p.halo || !garde(p)) return "";
      let k = typeof p.piece === "string" ? c.pieces.findIndex((q) => q.nom === p.piece) : -1;
      if (k < 0 && p.piece !== false && lampes && point(p.pos)) k = c.pieces.findIndex((q) => !q.sous_zone && Array.isArray(q.poly) && q.poly.length > 2 && dansPoly(p.pos, q.poly));
      const lc = lampes && (p.entite || "").startsWith("light.");
      if (k >= 0) ESP ||= espacesOuverts(c.pieces, c.murs, c.ouvertures);
      return (k >= 0 ? `<clipPath id="cp${i}">${ESP[k].map((j) => `<polygon points="${ptsSvg(c.pieces[j].poly)}"/>`).join("")}</clipPath>` : "")
        + (lc ? `<radialGradient id="halo-${i}"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient>` : "")
        + `<circle class="halo${lc ? " lampe" : ""}" data-h="${i}" cx="${p.pos[0]}" cy="${p.pos[1]}" r="${p.halo === true ? 130 : nb(p.halo)}" fill="url(#halo${lc ? `-${i}` : ""})" opacity="0"${k >= 0 ? ` clip-path="url(#cp${i})"` : ""}/>`;
    }).join("");
    // meuble connecté : cliquable en vue, contour et teinte d'accent quand il est actif (mis à jour par _maj, sans reconstruction)
    const accent = (m) => { const k = couleurMeuble(m); return ` style="${k ? `--mb-couleur:${esc(k)};` : ""}${styleAnim(animDe(c, "meuble", m))}"`; };
    S.meubles = trie(c.meubles || [], niveauMeuble).map(([m, i]) => dessinMeuble(m).replace('<g class="meuble',
      `<g data-mb="${i}"${estConnecte(m) ? accent(m) : ""} class="meuble${em(m)}${estConnecte(m) ? ` connecte${m.teinte === false ? "" : " teinte"}${clicMeuble(m) === "aucun" ? " sans-clic" : ""}${classeAnim(animDe(c, "meuble", m))}` : ""}`)).join("");
    S.limites = c.limites?.length ? `<path class="limites" d="${chemin(c.limites)}"/>` : "";
    S.murs = `<path class="murs" d="${chemin(c.murs || [])}"/>`;
    S.ouvertures = trie(c.ouvertures || []).map(([o, i]) => {
      const [a, b, d, e] = o.seg, [nx, ny] = o.dehors || [0, 0], ent = entOuv(o) || o.volet;
      const { baie, traits } = traitsOuverture(o);
      const av = animDe(c, "volet", o, "animation_volet"), ao = animDe(c, "ouverture", o);
      const volet = o.volet ? `<path class="volet${classeAnim(av)}" style="${styleAnim(av)}" data-v="${i}" d="M${a + nx * 16} ${b + ny * 16}L${d + nx * 16} ${e + ny * 16}"/>` : "", mode = clicPorteur(o);
      // ouverture à fiche : atteignable au clavier (Entrée / Espace), annoncée comme ouvrant une fenêtre de dialogue
      const kb = mode === "fiche" && !ed ? ` tabindex="0" role="button" aria-haspopup="dialog" aria-label="${esc(o.nom || (ent ? this._nom(ent) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))))}"` : "";
      return `<g class="ouv${Object.hasOwn(NOMS_OUVERTURE, o.type) ? ` ${o.type}` : ""}${o.contact || o.entite ? "" : " sans"}${mode === "aucun" ? " sans-clic" : mode ? " a-fiche" : ""}${em(o)}${classeAnim(ao)}" style="${styleAnim(ao)}" data-o="${i}"${ent ? ` data-e="${esc(ent)}"` : ""}${kb}>
        ${ent || mode === "fiche" ? `<path class="cible" d="M${a} ${b}L${d} ${e}"/>` : ""}${baie}${traits}${volet}<title></title></g>`;
    }).join("");
    let svg = `<svg viewBox="${x0} ${y0} ${W} ${H}" role="img" aria-label="${esc(c.titre || _t("Plan de la maison"))}">
      <defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient></defs>`;
    // ambiance (pas en édition) : teinte de nuit (plus forte dehors), lumière du soleil et météo sur les extérieurs, sous les halos
    const A = (!ed || this._editeur?.vueAmbiance) && c.ambiance && typeof c.ambiance === "object" ? c.ambiance : null, b0 = this._box;
    const ext = c.pieces.filter((p) => p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    // pièces intérieures : la météo (nuages, brume, pluie…) n'y est jamais peinte, même sous un extérieur qui les recouvre
    const int = c.pieces.filter((p) => !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    let amb = "";
    if (A) {
      const r = `x="${b0.x0}" y="${b0.y0}" width="${b0.W}" height="${b0.H}"`;
      amb = `<g class="amb" aria-hidden="true"><defs><linearGradient id="amb-g" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb74d"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient>
        <radialGradient id="amb-nuage"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>
        ${ext.length ? `<clipPath id="cp-dehors">${ext.map((p) => `<polygon points="${ptsSvg(p.poly)}"/>`).join("")}</clipPath>` : ""}
        ${ext.length && int.length ? `<mask id="m-dedans" maskUnits="userSpaceOnUse" ${r}><rect ${r} fill="#fff"/>${int.map((p) => `<polygon points="${ptsSvg(p.poly)}" fill="#000"/>`).join("")}</mask>` : ""}</defs>
        <rect class="amb-n amb-ni" ${r} fill="#0b1d4d" opacity="0"/>
        ${ext.length ? `<g clip-path="url(#cp-dehors)"><rect class="amb-n amb-ne" ${r} fill="#0b1d4d" opacity="0"/><rect class="amb-sol" ${r} fill="url(#amb-g)" opacity="0"/><g class="amb-meteo"${int.length ? ` mask="url(#m-dedans)"` : ""}></g></g>` : ""}</g>`;
      if (LU && (LU.soleil || LU.lune)) amb += `<g class="lum" aria-hidden="true"></g>`;
    }
    this._lumCle = null;
    this._meteoCle = null; this._fluxCle = null;
    svg += this._dessinerFond?.(c, { ed, Q, cq }) || ""; // image de fond (calque « fond »), sous tout le dessin
    for (const k of Q.svg) {
      if (k === "halos") svg += amb;
      if (voir(k)) svg += `<g class="cq${k === "meubles" ? " meubles" : ""}${k === "halos" && lampes ? " fondu" : ""}${cq(k)}" data-cq="${k}"${k === "meubles" && !ed ? ` aria-hidden="true"` : ""}>${S[k]}</g>`;
      if (k === "meubles" && A && coucheEnergie(A)) svg += `<g class="flux" aria-hidden="true"></g>`; // billes au-dessus des meubles
    }
    const vit = c.vitrine ? this._vitrine(pct, xy) : null;
    if (vit) svg += vit.svg;
    const iso = this._iso != null ? c.pieces[this._iso] : null;
    if (iso) {
      const b = this._box;
      svg += `<path class="voile" fill-rule="evenodd" d="M${b.x0 - 5000} ${b.y0 - 5000}h${b.W + 10000}v${b.H + 10000}h${-(b.W + 10000)}Z M${iso.poly.map((q) => `${+q[0]} ${+q[1]}`).join("L")}Z"/>`;
    }
    svg += `</svg>`;
    const hors = (pos) => iso && !dansPoly(pos, iso.poly) ? " hors" : "";

    const H_ = { etiquettes: "", libelles: "", appareils: "", textes: "", meubles: "" };
    // meuble connecté : bouton HTML centré (cible tactile ≥ 44 px, clavier, lecteur d'écran) qui porte le badge de valeur
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m, i]) => {
      if (!estConnecte(m)) return;
      const nom = esc(m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble"))), b = clicMeuble(m) !== "aucun";
      const am = animDe(c, "meuble", m);
      H_.meubles += `<${b ? "button" : "span"} class="mb${hors(m.pos)}${cq("meubles")}${em(m)}${classeAnim(am)}" data-mbq="${i}" ${xy(m.pos)} style="${pct(m.pos)}${couleurMeuble(m) ? `;--mb-couleur:${esc(couleurMeuble(m))}` : ""};${styleAnim(am)}"${b ? ` aria-haspopup="${clicMeuble(m) === "fiche" ? "dialog" : "false"}" aria-label="${nom}"` : ""}><span class="v"></span></${b ? "button" : "span"}>`;
    });
    const cp = interactionDe(c).clic; // `interaction.room_tap`
    const EP = etiquettesPieces(c);
    trie(c.pieces).forEach(([p, i]) => {
      if (!p.etiquette) return;
      const cible = p.clic || p.temperature;
      // étiquette sans action au toucher (rien, ou « plus d'infos » sans entité) : pas d'apparence de bouton cliquable
      // (hors de l'ordre du clavier : elle ne fait rien)
      const inerte = !ed && cp !== "vue" && p.zoom !== false && (cp === "aucun" || !cible) ? " inerte" : "";
      if (p.sous_zone) { if (voir("sous_zones")) H_.libelles += `<span class="zone-etq sz${iso && !dansPoly(p.etiquette, iso.poly) ? " hors" : ""}${cq("libelles", "sous_zones")}${em(p)}" data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}">${esc(p.nom)}</span>`; return; }
      H_.etiquettes += `<button class="etq${p.dehors ? " dehors" : ""}${iso && i !== this._iso ? " hors" : ""}${cq("etiquettes")}${em(p)}${inerte}"${inerte ? ` tabindex="-1"` : ""} data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}"${cible ? ` data-e="${esc(cible)}"` : ""}>
        <b${EP.nom ? "" : ' class="cache"'}>${esc(p.nom)}</b><span class="val"></span></button>`;
    });
    const bs = classesPastilles(stylePastilles(c));
    // appareil « seulement dans la vue de sa pièce » (`zoom_only`, sinon `badge_style.zoom_only`) : absent du plan entier, toujours là en édition
    const zoomSeul = !ed && (c.points || []).some((p) => p.zoom_seul ?? c.style_pastilles?.zoom_seul);
    trie(c.points || []).forEach(([p, i]) => {
      if (zoomSeul && (p.zoom_seul ?? c.style_pastilles?.zoom_seul) && !(iso && dansPoly(p.pos, iso.poly))) return;
      const ap = animDe(c, evenementPoint(p), p);
      H_.appareils += `<button class="pt${bs}${hors(p.pos)}${cq("appareils")}${em(p)}${classeAnim(ap)}" data-q="${i}" data-e="${esc(p.entite)}" ${xy(p.pos)} style="${pct(p.pos)};--pt-couleur:${couleurSure(p.couleur) || "var(--state-active-color,#fdd835)"};${styleAnim(ap)}"${clicPorteur(p) === "fiche" ? ` aria-haspopup="dialog"` : ""}>
        <ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon><span class="v"></span></button>`;
    });
    // nom d'un espace : libellé d'un meuble, masqué avec le calque Meubles comme avec celui des libellés
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m]) => {
      if (m.type === "espace" && m.nom) H_.libelles += `<span class="zone-etq${hors(m.pos)}${cq("libelles", "meubles")}${em(m)}" ${xy(m.pos)} style="${pct(m.pos)}">${esc(m.nom)}</span>`;
    });
    trie(c.textes || []).forEach(([t, i]) => {
      // zone d'informations : un texte qui porte une liste d'entités (titre facultatif, une ligne par entité, valeurs en direct)
      if (Array.isArray(t.infos)) {
        H_.textes += `<div class="txt infob${t.style === "discret" ? " discret" : ""}${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">
          ${t.t ? `<b class="ib-t">${esc(t.t)}</b>` : ""}${t.infos.map((l, j) => `<span class="ib-l" data-ibl="${j}"${typeof l?.entite === "string" ? ` data-e="${esc(l.entite)}"` : ""}><ha-icon icon="${esc(l?.icone || "mdi:information-outline")}"></ha-icon><span class="ib-n"></span><span class="ib-v"></span></span>`).join("")}
          ${t.infos.length ? "" : `<span class="ib-vide">${_t("Ajoute des entités")}</span>`}</div>`;
        return;
      }
      H_.textes += `<span class="txt${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">${esc(t.t)}</span>`;
    });
    // les boutons des meubles passent sous les pastilles (même place que le calque Appareils, qu'il soit affiché ou non)
    const calque = Q.html.map((k) => (k === "appareils" ? H_.meubles : "") + (voir(k) ? H_[k] : "")).join("")
      + (A && coucheJour(A) && coucheJour(A).marqueur !== false ? `<span class="amb-astre" hidden><ha-icon icon="mdi:white-balance-sunny"></ha-icon></span>` : "")
      + (vit ? vit.html : "") + (A ? this._htmlPersonnes(A) : "");

    // mode tablette sans titre : dans la vue d'une pièce, son nom sert de titre (sans « › » devant)
    const tabSansTitre = !c.titre && !!this._tablette();
    poserHTML(R.querySelector(".titre"), `${esc(c.titre || "")}${iso ? (tabSansTitre ? esc(iso.nom) : ` <span class="fil">› ${esc(iso.nom)}</span>`) : ""}${this._sim ? ` <span class="badge-demo" title="${_t("Appartement de démonstration : états simulés, aucune commande n'atteint la maison")}">${_t("Démo · états simulés")}</span>` : ""}`);
    R.querySelector(".retour").hidden = !iso;
    // vue figée : boutons de zoom cachés ; mode tablette sans titre : pas d'en-tête (sauf dans la vue d'une pièce, pour le retour),
    // le bouton d'édition passe alors avec les boutons du plan
    const fig = this._figee(), tab = this._tablette(), sansTete = !!tab && !c.titre && !iso && !this._sim;
    R.querySelector('[data-z="tout"]').hidden = !this._vue || fig;
    for (const z of ["plus", "moins"]) R.querySelector(`[data-z="${z}"]`).hidden = fig;
    R.querySelector(".barre").hidden = sansTete;
    const bEd = R.querySelector(".editer"), hote = R.querySelector(sansTete ? ".zoom" : ".barre");
    if (bEd.parentElement !== hote) hote.append(bEd);
    this._placerZoom();
    const niv = this._niveauAnim(), card = R.querySelector("ha-card");
    card.classList.toggle("anim-reduit", niv === "reduit");
    card.classList.toggle("anim-aucune", niv === "aucun");
    card.classList.toggle("tablette", !!tab);
    const brp = R.querySelector('[data-z="replay"]');
    brp.hidden = ed || !c.replay;
    brp.classList.toggle("on", !!this._rp);
    const bcq = R.querySelector('[data-z="calques"]');
    bcq.hidden = ed || !c.calques?.bouton_vue || !this._calquesMenu().length;
    if (bcq.hidden) this._menuCalques(false);
    const zone = R.querySelector(".zone");
    zone.classList.toggle("zoome", !!this._vue);
    zone.classList.toggle("figee", fig);
    zone.style.aspectRatio = `${this._box.W} / ${this._box.H}`;
    zone.classList.toggle("amb-glisse", ed && !!this._editeur?.vueAmbiance && !!A && !!couchePersonnes(A));
    const tc = coucheTraces(A)?.couleur;
    zone.style.setProperty("--trace-c", couleurSure(tc) || "var(--md-primary)");
    zone.classList.toggle("sur-fond", this._solFond != null);
    if (this._solFond != null) zone.style.setProperty("--sol-fond", String(this._solFond));
    poserHTML(R.querySelector(".zone"), `${svg}<div class="calque">${calque}</div>`);
    this._mbs = (c.meubles || []).map((m, i) => (estConnecte(m) ? { m, g: R.querySelector(`.zone svg [data-mb="${i}"]`), b: R.querySelector(`.calque>[data-mbq="${i}"]`) } : null)).filter((x) => x && (x.g || x.b));
    const deg = `linear-gradient(90deg,${PALIERS.map(([t, col]) => `${col} ${((t - 17) / 11 * 100).toFixed(0)}%`).join(",")})`;
    // légende : dégradé aux bornes de la teinte (`temperature_tint`), retiré sans teinte ; `legend: false` la cache
    const te = teinteTemp(c);
    poserHTML(R.querySelector(".legende"), `${te ? `<span>${fmt(te[0])} °C<span class="degrade" style="background:${deg}"></span>${fmt(te[1])} °C</span>` : ""}
        <span><i style="color:var(--plan-ferme)"></i>${_t("fermé")}</span><span><i style="color:var(--md-error)"></i>${_t("ouvert")}</span>
        ${(c.ouvertures || []).some((o) => o.volet) ? `<span><i style="color:var(--plan-volet);border-top-width:6px"></i>${_t("volet baissé")}</span>` : ""}`);
    const vide = !c.pieces.length && !(c.murs || []).length && !(c.points || []).length;
    // plan vide (hors éditeur) : rien à zoomer, pas de boutons de zoom (ni au survol)
    if (vide && !this._editeur) for (const z of ["plus", "moins", "tout"]) R.querySelector(`[data-z="${z}"]`).hidden = true;
    R.querySelector(".tete").hidden = !this._editeur && (vide || !this._puces().length || (!!tab && !tab.resume));
    R.querySelector(".legende").hidden = !c.pieces.length || c.legende === false;
    let ev = R.querySelector(".etat-vide");
    if (vide) {
      const admin = !!this._hass?.user?.is_admin && c.edition !== false && !this._apercu();
      if (!ev) { ev = document.createElement("div"); ev.className = "etat-vide"; R.querySelector(".plan").append(ev); }
      poserHTML(ev, admin ? `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan est vide")}</h2>
          <p>${_t("Pars des pièces de Home Assistant (avec leurs appareils), dessine les pièces, ou importe un plan déjà fait.")}</p>
          <div class="actions"><button class="plein" data-depart="pieces"><ha-icon icon="mdi:home-import-outline"></ha-icon>${_t("Démarrer avec mes pièces")}</button>
            <button data-depart="rectangle"><ha-icon icon="mdi:rectangle-outline"></ha-icon>${_t("Dessiner une pièce")}</button>
            <button data-depart="importer"><ha-icon icon="mdi:file-import-outline"></ha-icon>${_t("Importer un plan")}</button></div>`
        : `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan n'est pas encore dessiné")}</h2><p>${_t("Un administrateur peut le créer avec le bouton crayon de cette carte.")}</p>`);
    } else ev?.remove();
    R.querySelector(".editer").hidden = !!this._editeur || c.edition === false || !this._hass?.user?.is_admin || this._apercu();
    R.querySelector(".corps").classList.toggle("edition", !!this._editeur);
    this._ok = true;
    this._minuterie();
    this._change();
    this._maj();
    this._editeur?.apresConstruction();
    this._mise();
    this._reprise();
    this._accroches("construit"); // morceaux branchés ici (étages : sélecteur)
  }

  vue() { return this._vue || this._box; }

  // nouvelle vue (même proportions que le plan entier), bornée au plan ; null = plan entier
  _normaliser(v) {
    const B = this._box, r = B.W / B.H;
    let W = Math.min(B.W, Math.max(B.W / 8, v.W)), H = W / r;
    if (W >= B.W * 0.985) return null;
    const cx = v.x0 + v.W / 2, cy = v.y0 + v.H / 2;
    let x0 = cx - W / 2, y0 = cy - H / 2;
    x0 = Math.min(Math.max(x0, B.x0), B.x0 + B.W - W);
    y0 = Math.min(Math.max(y0, B.y0), B.y0 + B.H - H);
    return { x0, y0, W, H };
  }

  _cadrer(v, anim = false) {
    const cible = v && this._normaliser(v);
    const depart = this.vue(), fin = cible || this._box;
    cancelAnimationFrame(this._anim);
    const poser = (q) => {
      const R = this.shadowRoot, svg = R.querySelector(".zone svg");
      if (!svg || !(q.W > 0 && q.H > 0)) return;
      svg.setAttribute("viewBox", `${q.x0} ${q.y0} ${q.W} ${q.H}`);
      R.querySelectorAll(".calque>[data-x]").forEach((n) => {
        n.style.left = `${((n.dataset.x - q.x0) / q.W) * 100}%`;
        n.style.top = `${((n.dataset.y - q.y0) / q.H) * 100}%`;
      });
      this._tailleBadges(q);
    };
    const finir = () => {
      this._vue = cible;
      const R = this.shadowRoot;
      R.querySelector('[data-z="tout"]').hidden = !cible || this._figee();
      R.querySelector(".zone").classList.toggle("zoome", !!cible);
      if (this._editeur) this._construire(); else poser(fin);
    };
    if (!anim || this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches) { this._vue = cible; poser(fin); return finir(); }
    const t0 = performance.now(), D = 320, ease = (k) => 1 - Math.pow(1 - k, 3);
    const pas = (t) => {
      // l'horodatage de la 1re image peut précéder t0 : k < 0 extrapolerait au-delà du départ (largeur négative en dézoomant)
      const k = ease(Math.max(0, Math.min(1, (t - t0) / D)));
      poser({ x0: depart.x0 + (fin.x0 - depart.x0) * k, y0: depart.y0 + (fin.y0 - depart.y0) * k, W: depart.W + (fin.W - depart.W) * k, H: depart.H + (fin.H - depart.H) * k });
      if (k < 1) this._anim = requestAnimationFrame(pas); else finir();
    };
    this._anim = requestAnimationFrame(pas);
  }

  zoomer(f, centre) {
    const v = this.vue(), [cx, cy] = centre || [v.x0 + v.W / 2, v.y0 + v.H / 2];
    const W = v.W * f, H = v.H * f;
    this._cadrer({ x0: cx - (cx - v.x0) * f, y0: cy - (cy - v.y0) * f, W, H }, !centre);
  }

  toutVoir() {
    if (this._iso != null) { this._iso = null; this._construire(); }
    this._cadrer(null, true);
  }

  isoler(i) {
    // une sous-zone n'a pas de vue à elle : on isole la pièce qui la contient
    if (this._config.pieces[i]?.sous_zone) {
      const z = this._config.pieces[i].poly, c = [z.reduce((a, q) => a + q[0], 0) / z.length, z.reduce((a, q) => a + q[1], 0) / z.length];
      i = this._config.pieces.findIndex((p) => !p.sous_zone && dansPoly(c, p.poly));
      if (i < 0) return;
    }
    if (this._config.pieces[i]?.zoom === false) return;
    const poly = this._config.pieces[i].poly, B = this._box;
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = Math.max(x1 - x0, y1 - y0) * 0.14 + 40;
    let W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
    if (W / H > B.W / B.H) H = W * B.H / B.W; else W = H * B.W / B.H;
    const depart = this.vue();
    this._iso = i;
    this._vue = null;
    this._construire();
    this._vue = depart === this._box ? null : depart;
    this._cadrer({ x0: (x0 + x1) / 2 - W / 2, y0: (y0 + y1) / 2 - H / 2, W, H }, true);
  }

  // boutons de zoom (`interaction.boutons_zoom`) : sur le plan, dans l'en-tête (hors du plan) ou cachés (plus, moins, tout le plan :
  // calques et revoir la journée restent) ; auto = en-tête sur un écran étroit et tactile (téléphone), sur le plan sinon.
  // En édition, jamais cachés : dans l'en-tête au téléphone (sauf `map`) ou avec `header`, sur le plan sinon (le plan de
  // l'éditeur reste libre au doigt). Toujours sur le plan sans en-tête (tablette sans titre)
  _placerZoom() {
    const R = this.shadowRoot, z = R?.querySelector(".zoom"), barre = R?.querySelector(".barre");
    if (!z || !barre) return;
    const m = interactionDe(this._config).zoom, tel = this._modeMise === "etroit" && matchMedia("(pointer: coarse)").matches;
    const tete = !barre.hidden && (this._editeur ? m !== "plan" && (m === "entete" || tel) : m === "entete" || (m === "auto" && tel)), bEd = R.querySelector(".editer");
    if (tete && z.parentElement !== barre) barre.insertBefore(z, bEd?.parentElement === barre ? bEd : null);
    else if (!tete && z.parentElement === barre) R.querySelector(".plan").append(z);
    z.classList.toggle("en-tete", tete);
    z.classList.toggle("caches", !this._editeur && m === "caches");
  }

  // souris (PC) : boutons du plan (calques, zoom, revoir la journée) estompés 5 s après que le curseur a quitté le plan (ou 5 s après
  // l'affichage s'il n'y est jamais venu), revenus dès qu'il y revient, au clavier (focus) ou au toucher ; écran tactile seul : toujours visibles
  _quand_construit_zoom() {
    const R = this.shadowRoot, plan = R?.querySelector(".plan");
    if (!plan || plan.__repli) return;
    plan.__repli = true;
    const souris = matchMedia("(hover: hover) and (pointer: fine)"), z = () => R.querySelector(".zoom");
    const montrer = () => { clearTimeout(this._tRepli); z()?.classList.remove("repli"); };
    const armer = () => { montrer(); if (souris.matches) this._tRepli = setTimeout(() => z()?.classList.add("repli"), 5000); };
    plan.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") montrer(); });
    // toucher (portable tactile) sur un bouton estompé : il réapparaît sans agir, rien ne passe au plan dessous
    plan.addEventListener("pointerdown", (e) => { this._avaleClic = e.pointerType !== "mouse" && !!z()?.classList.contains("repli") && e.composedPath().includes(z()) ? e.timeStamp : 0; montrer(); });
    plan.addEventListener("click", (e) => { if (this._avaleClic && e.timeStamp - this._avaleClic < 1000) { this._avaleClic = 0; e.stopPropagation(); e.preventDefault(); } }, true);
    plan.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") armer(); });
    plan.addEventListener("focusin", montrer);
    if (!plan.matches(":hover")) armer();
  }

  _pxVersCm(cx, cy) {
    const r = this.shadowRoot.querySelector(".zone").getBoundingClientRect(), v = this.vue();
    return [v.x0 + ((cx - r.left) / r.width) * v.W, v.y0 + ((cy - r.top) / r.height) * v.H];
  }

  _gestes(zone) {
    // pincement (2 doigts) partout ; glisser d'un doigt / de la souris quand on est zoomé (hors édition)
    let pince = null, pan = null;
    const debutPince = (t) => {
      const [a, b] = t, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      pince = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, m: this._pxVersCm(mx, my), v: { ...this.vue() } };
    };
    zone.addEventListener("touchstart", (e) => {
      if (this._figee()) { pince = pan = null; return; } // vue figée : ni pincement ni déplacement, le toucher reste un clic
      if (e.touches.length === 2) { debutPince(e.touches); pan = null; this._editeur?.annulerGlisse?.(); }
      else if (e.touches.length === 1 && this._vue && !this._editeur) pan = { x: e.touches[0].clientX, y: e.touches[0].clientY, v: { ...this._vue }, bouge: false };
    }, { passive: true });
    zone.addEventListener("touchmove", (e) => {
      const r = zone.getBoundingClientRect();
      if (pince && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const B = this._box, W = Math.min(B.W, Math.max(B.W / 8, pince.v.W * pince.d / d)), H = W * B.H / B.W;
        const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
        this._cadrer({ x0: pince.m[0] - ((mx - r.left) / r.width) * W, y0: pince.m[1] - ((my - r.top) / r.height) * H, W, H });
        this._aBouge = true;
      } else if (pan && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0], dx = t.clientX - pan.x, dy = t.clientY - pan.y;
        if (Math.hypot(dx, dy) > 6) pan.bouge = this._aBouge = true;
        this._cadrer({ ...pan.v, x0: pan.v.x0 - (dx / r.width) * pan.v.W, y0: pan.v.y0 - (dy / r.height) * pan.v.H });
      }
    }, { passive: false });
    const finTouche = (e) => {
      if (e.touches.length < 2) pince = null;
      if (!e.touches.length) { pan = null; setTimeout(() => { this._aBouge = false; }, 60); }
    };
    zone.addEventListener("touchend", finTouche);
    zone.addEventListener("touchcancel", finTouche);
    zone.addEventListener("wheel", (e) => {
      if (!e.ctrlKey || this._figee()) return; // pincement du pavé tactile ou Ctrl + molette (vue figée : rien)
      e.preventDefault();
      this.zoomer(Math.exp(e.deltaY * 0.01), this._pxVersCm(e.clientX, e.clientY));
    }, { passive: false });
    zone.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== (this._editeur ? 1 : 0) || !this._vue || this._figee()) return;
      if (!this._editeur && e.composedPath().some((n) => n.classList?.contains("pt") || n.classList?.contains("mb"))) return;
      this.debutPan(e);
    });
  }

  debutPan(e) {
    if (!this._vue) return;
    const zone = this.shadowRoot.querySelector(".zone"), r = zone.getBoundingClientRect(), v0 = { ...this._vue };
    zone.classList.add("panne");
    const mv = (m) => {
      const dx = m.clientX - e.clientX, dy = m.clientY - e.clientY;
      if (Math.hypot(dx, dy) > 4) this._aBouge = true;
      this._cadrer({ ...v0, x0: v0.x0 - (dx / r.width) * v0.W, y0: v0.y0 - (dy / r.height) * v0.H });
    };
    const up = () => {
      zone.classList.remove("panne");
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
      setTimeout(() => { this._aBouge = false; }, 60);
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  }

  // ---------- étages : sélecteur (ascenseur au bord du plan, ou barre d'onglets en haut de la carte), changement, mémoire ----------
  // dernier étage vu, par carte (propre à ce navigateur, jamais dans la config)
  _cleEtage() { return `maquette-etage:${this._plein?.id || this._config?.id || "plan"}`; }
  // étage affiché : celui que l'éditeur a déplié s'il est ouvert, sinon this._etage
  _etageAffiche() { return this._config?.etage_actif?.id ?? this._etage ?? null; }

  // change l'étage affiché (vue seulement ; en édition, l'éditeur s'en charge) : vue de pièce, zoom, fiche et glisser remis à zéro ;
  // `centrer: [x, y]` (cm) : la vue se centre sur ce point (escalier d'arrivée, élément à montrer). Renvoie true si c'est fait.
  _changerEtage(id, { centrer } = {}) {
    if (this._editeur) return this._editeur.changerEtage ? (this._editeur.changerEtage(id), true) : false;
    if (!this._plein || !idsEtages(this._plein).includes(id)) return false;
    const R = this.shadowRoot, d = R?.querySelector("dialog.mf");
    if (d?.open) d.close();
    if (R) this._menuCalques(false);
    cancelAnimationFrame(this._anim);
    this._aBouge = false;
    R?.querySelector(".zone")?.classList.remove("panne");
    const autre = id !== this._etage;
    this._iso = null; this._vue = null;
    if (autre) { this._etage = id; this._config = deplier(this._plein, id); }
    stock.ecrire(this._cleEtage(), id); // stockage indisponible : l'étage vaut pour cette page
    // vue figée (lock_view) : pas de zoom, le pincement et « Toute la maison » sont coupés et n'en sortiraient pas
    const ok = Array.isArray(centrer) && Number.isFinite(+centrer[0]) && Number.isFinite(+centrer[1]);
    this._centrerAttente = ok && !this._figee() ? [+centrer[0], +centrer[1]] : null;
    if (!this._hass) return true; // construit à l'arrivée de hass, centrage compris (_quand_construit_etages)
    this._construire();
    // fondu court (rien sans animation ou si le système demande moins de mouvement)
    const z = R?.querySelector(".zone");
    if (autre && z?.animate && !this._sansFondu()) z.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 180, easing: "cubic-bezier(.2,0,0,1)" });
    return true;
  }
  _sansFondu() { return this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // choix dans le sélecteur ou au clavier : l'éditeur ouvert replie d'abord ses données (L4), sinon changement de la vue
  _choisirEtage(id) {
    if (id == null || id === this._etageAffiche()) return;
    if (this._editeur) this._editeur.changerEtage?.(id);
    else this._changerEtage(id);
  }
  // étage voisin dans l'ordre de `floors` (du bas vers le haut) : sens +1 = au-dessus
  _etageVoisin(sens) {
    const l = parEtage(this._config).map((e) => e.id), i = l.indexOf(this._etageAffiche());
    return i < 0 ? null : l[i + sens] ?? null;
  }

  // point d'accroche « construit » (fin de _construire) : sélecteur dessiné (ou retiré) selon le nombre d'étages, l'option et l'édition
  _quand_construit_etages() {
    const R = this.shadowRoot, card = R?.querySelector("ha-card");
    if (!card) return;
    const ed = !!this._editeur, E = parEtage(this._config).filter((e) => e.id != null);
    const voir = E.length > 1 || (ed && !!this._editeur?.afficherSelecteur && E.length > 0);
    const onglets = this._config.selecteur_etages === "onglets";
    const avant = !!R.querySelector(".etages.onglets:not([hidden])");
    for (const [cl, ici] of [["ascenseur", !onglets], ["onglets", onglets]]) {
      let el = R.querySelector(`.etages.${cl}`);
      if (!voir || !ici) { if (el) el.hidden = true; continue; }
      if (!el) el = this._creerSelecteur(cl);
      el.hidden = false;
      this._dessinerSelecteur(el, E, cl === "onglets");
    }
    // la barre d'onglets prend de la hauteur à la carte : pleine page recalculée quand elle apparaît ou disparaît
    if (avant !== !!R.querySelector(".etages.onglets:not([hidden])")) this._mise();
    this._suivreAscenseur();
    this._centrerEnAttente();
  }
  // ascenseur en haut à droite du plan, zoom en bas à droite : quand le plan est trop bas pour les deux empilés,
  // l'ascenseur passe à gauche de la colonne du zoom (classe .serre) ; revu à chaque changement de taille du plan ou du zoom
  _suivreAscenseur() {
    const R = this.shadowRoot, a = R.querySelector(".etages.ascenseur:not([hidden])");
    this._roAsc?.disconnect();
    if (!a) return;
    this._roAsc ??= new ResizeObserver(() => this._placerAscenseur());
    for (const el of [R.querySelector(".plan"), R.querySelector(".zoom")]) if (el) this._roAsc.observe(el);
    this._placerAscenseur();
  }
  _placerAscenseur() {
    const R = this.shadowRoot, a = R?.querySelector(".etages.ascenseur:not([hidden])"), z = R?.querySelector(".zoom");
    if (!a) return;
    a.classList.remove("serre");
    if (!z || getComputedStyle(z).display === "none") return;
    const A = a.getBoundingClientRect(), Z = z.getBoundingClientRect();
    if (Z.height > 0 && A.bottom + 8 > Z.top) a.classList.add("serre");
  }
  // centrage demandé par _changerEtage (zoom ×2,5 sur le point), appliqué une fois le plan construit
  _centrerEnAttente() {
    const c = this._centrerAttente, B = this._box;
    this._centrerAttente = null;
    if (!c || this._editeur || this._figee() || !(B?.W > 0 && B?.H > 0)) return;
    const W = B.W / 2.5, H = W * B.H / B.W;
    this._cadrer({ x0: c[0] - W / 2, y0: c[1] - H / 2, W, H });
  }

  _creerSelecteur(cl) {
    const R = this.shadowRoot, el = document.createElement("div");
    el.className = `etages ${cl}`;
    if (cl === "onglets") R.querySelector(".barre").after(el); else R.querySelector(".plan").append(el);
    el.addEventListener("click", (ev) => {
      const ch = ev.composedPath(), b = ch.find((n) => n.dataset?.etage != null), g = ch.find((n) => n.dataset?.etagesGerer != null);
      if (!b && !g) return;
      ev.stopPropagation(); // jamais jusqu'aux clics du plan ni de l'éditeur
      if (g) return this._editeur?.ouvrirEtages?.();
      this._choisirEtage(b.dataset.etage);
    });
    el.addEventListener("keydown", (ev) => {
      const b = ev.target.closest?.("[data-etage]");
      if (!b) return;
      const l = [...el.querySelectorAll("[data-etage]")], i = l.indexOf(b), vert = cl === "ascenseur";
      const pas = { [vert ? "ArrowUp" : "ArrowLeft"]: -1, [vert ? "ArrowDown" : "ArrowRight"]: 1 }[ev.key];
      const j = pas ? (i + pas + l.length) % l.length : ev.key === "Home" ? 0 : ev.key === "End" ? l.length - 1 : -1;
      if (j < 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      const id = l[j].dataset.etage;
      this._choisirEtage(id);
      [...el.querySelectorAll("[data-etage]")].find((x) => x.dataset.etage === id)?.focus();
    });
    if (!this._clavierEtages) {
      // PageUp / PageDown sur le plan : étage au-dessus / au-dessous
      this._clavierEtages = true;
      R.querySelector(".plan").addEventListener("keydown", (ev) => {
        if ((ev.key !== "PageUp" && ev.key !== "PageDown") || ev.altKey || ev.ctrlKey || ev.metaKey) return;
        if (ev.target.closest?.("input,textarea,select,[contenteditable]")) return;
        if (R.querySelector(".etages:not([hidden])") == null) return;
        const id = this._etageVoisin(ev.key === "PageUp" ? 1 : -1);
        ev.preventDefault();
        if (id != null) this._choisirEtage(id);
      });
    }
    return el;
  }

  _dessinerSelecteur(el, E, onglets) {
    const actif = this._etageAffiche(), P = this._pastillesEtages?.() || {}, ed = !!this._editeur;
    const focus = el.contains(this.shadowRoot.activeElement);
    // ascenseur : l'étage du haut en haut ; barre : du bas vers le haut, de gauche à droite
    const l = onglets ? E : [...E].reverse();
    const bouton = (e) => {
      const nom = e.nom || e.court, on = e.id === actif, p = P[e.id] === "rouge" || P[e.id] === "ambre" ? ` ${P[e.id]}` : "";
      return `<button type="button" role="tab" class="et-b${on ? " on" : ""}" data-etage="${esc(e.id)}" aria-selected="${on}" tabindex="${on ? 0 : -1}"
        ${onglets ? "" : `title="${esc(nom)}" aria-label="${esc(nom)}"`}>${onglets ? `<ha-icon icon="${esc(e.icone || "mdi:layers-outline")}"></ha-icon><span class="et-n">${esc(nom)}</span>`
        : `<span class="et-c">${esc(e.court)}</span>`}<span class="et-pastille${p}" aria-hidden="true"></span></button>`;
    };
    const gerer = ed && typeof this._editeur?.ouvrirEtages === "function"
      ? `<button type="button" class="et-gerer" data-etages-gerer title="${esc(_t("Gérer les étages"))}" aria-label="${esc(_t("Gérer les étages"))}"><ha-icon icon="mdi:layers-edit"></ha-icon>${onglets ? `<span class="et-n">${_t("Gérer")}</span>` : ""}</button>` : "";
    poserHTML(el, `<div class="et-l" role="tablist" aria-label="${esc(_t("Étages"))}" aria-orientation="${onglets ? "horizontal" : "vertical"}">${l.map(bouton).join("")}</div>${gerer}`);
    if (!l.some((e) => e.id === actif)) el.querySelector("[data-etage]")?.setAttribute("tabindex", "0");
    if (focus) el.querySelector('[tabindex="0"]')?.focus();
  }
  // ---------- toute la maison : résumé, alertes et pastilles comptent tous les étages, pas seulement l'affiché ----------
  // étages de la maison (ETAGES.parEtage), l'affiché d'abord : un élément présent sur deux étages (lumière d'escalier) revient
  // à l'étage affiché. Sans étages : un seul, id null, avec les listes de la config (résumé et alertes identiques à avant).
  _maisonEtages() {
    const E = parEtage(this._config), ici = this._etageAffiche?.() ?? null;
    return [...E.filter((e) => e.id === ici), ...E.filter((e) => e.id !== ici)];
  }
  _plusieursEtages() { return parEtage(this._config).filter((e) => e.id != null).length > 1; }

  // entités portées par les éléments d'un étage (pièces, ouvertures, pastilles, meubles, zones d'infos)
  _entitesEtage(E) {
    const G = E.geo, s = new Set();
    for (const p of G.pieces) s.add(p?.temperature).add(p?.humidite);
    for (const o of G.ouvertures) { for (const e of contactsDe(o)) s.add(e); s.add(o?.entite).add(o?.volet); }
    for (const p of [...G.points, ...G.meubles]) s.add(p?.entite).add(p?.actif).add(p?.valeur);
    for (const t of G.textes) for (const x of Array.isArray(t?.infos) ? t.infos : []) s.add(x?.entite);
    s.delete(undefined); s.delete(null);
    return s;
  }
  // étage d'une entité qui n'est PAS sur l'étage affiché (null si elle y est, ou si la maison n'a qu'un étage)
  _etageAilleurs(ent) {
    if (!this._plusieursEtages()) return null;
    const ici = this._etageAffiche();
    for (const E of this._maisonEtages()) if (this._entitesEtage(E).has(ent)) return E.id === ici ? null : E;
    return null;
  }

  // résumé de toute la maison : ouvertures ouvertes (un nom par baie et par étage), lumières allumées, volets baissés,
  // températures intérieures ; chaque élément garde son étage, son genre, son rang dans l'étage et son centre (aller à l'élément).
  // Une entité déjà comptée sur un autre étage (l'affiché passe d'abord) ne l'est pas deux fois.
  _resumeMaison() {
    const r = { ouvertures: [], lumieres: [], volets: [], temperature: [] }, vus = { o: new Set(), l: new Set(), t: new Set() }, voletsVus = new Set();
    const milieu = (s) => (Array.isArray(s) && s.length >= 4 ? [(nb(s[0]) + nb(s[2])) / 2, (nb(s[1]) + nb(s[3])) / 2] : null);
    for (const E of this._maisonEtages()) {
      const G = E.geo, et = E.id, noms = new Set(), ici = { o: [], l: [], t: [] };
      G.ouvertures.forEach((o, i) => {
        const ent = entOuv(o), s = ent ? this._etatOuverture(o) : null;
        if (ent && s && (s.state === "on" || s.state === "open")) {
          const cles = contactsDe(o).length ? contactsDe(o) : [o.entite], n = o.baie || o.nom || this._nom(ent);
          ici.o.push(...cles);
          if (!cles.every((e) => vus.o.has(e)) && !noms.has(n)) { noms.add(n); r.ouvertures.push({ etage: et, genre: "ouverture", i, nom: n, ent, centre: milieu(o.seg) }); }
        }
        if (o.volet) {
          const sv = this._etat(o.volet);
          let pos = sv ? sv.attributes.current_position : undefined;
          if (pos == null && sv) pos = sv.state === "closed" ? 0 : 100;
          if (pos != null && pos < 50 && !voletsVus.has(o.volet)) r.volets.push({ etage: et, genre: "ouverture", i, nom: o.baie || o.nom || this._nom(o.volet), ent: o.volet, val: pos + globalThis.MaquetteI18n.pct(), centre: milieu(o.seg) });
          voletsVus.add(o.volet);
        }
      });
      G.points.forEach((p, i) => {
        if (!(p?.entite || "").startsWith("light.") || !this._actif(p)) return;
        ici.l.push(p.entite);
        if (!vus.l.has(p.entite)) r.lumieres.push({ etage: et, genre: "point", i, nom: p.nom || this._nom(p.entite), ent: p.entite, centre: Array.isArray(p.pos) ? p.pos.map(nb) : null });
      });
      G.pieces.forEach((p, i) => {
        const t = this._num(p.temperature, p.attribut_temperature);
        if (p.sous_zone || t == null || p.dehors) return;
        ici.t.push(p.temperature);
        if (!vus.t.has(p.temperature)) r.temperature.push({ etage: et, genre: "piece", i, nom: p.nom, ent: p.temperature, t, val: `${fmt(t)} °C`, centre: this._centrePiece(p) });
      });
      for (const k of ["o", "l", "t"]) for (const e of ici[k]) vus[k].add(e);
    }
    return r;
  }
  _centrePiece(p) {
    if (Array.isArray(p?.etiquette)) return p.etiquette.map(nb);
    const l = Array.isArray(p?.poly) ? p.poly : [];
    if (!l.length) return null;
    const xs = l.map((q) => nb(q[0])), ys = l.map((q) => nb(q[1]));
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }

  // pastilles des boutons d'étage (sélecteur L1), pour les étages NON affichés : rouge = une alerte active (non masquée) touche
  // un élément de l'étage ; ambre = une ouverture ouverte ou une pastille `alert` allumée. Rien en édition ni à un seul étage.
  _pastillesEtages() {
    const L = this._maisonEtages().filter((e) => e.id != null);
    if (L.length < 2 || this._editeur) return {};
    const ici = this._etageAffiche(), S = new Map(L.map((e) => [e.id, this._entitesEtage(e)])), surIci = S.get(ici) || new Set(), out = {};
    const autres = L.filter((e) => e.id !== ici);
    for (const a of this._alertesActives().filter((x) => !this._alertesVues?.has(x.sig)))
      for (const ent of a.on) if (!surIci.has(ent)) for (const e of autres) if (S.get(e.id).has(ent)) out[e.id] = "rouge";
    for (const x of this._resumeMaison().ouvertures) if (x.etage !== ici && !out[x.etage]) out[x.etage] = "ambre";
    for (const e of autres) if (!out[e.id] && e.geo.points.some((p) => p?.alerte && !surIci.has(p.entite) && this._actif(p))) out[e.id] = "ambre";
    return out;
  }
  // pastilles tenues à jour à chaque changement d'état (le sélecteur n'est redessiné qu'à la construction)
  _majPastillesEtages() {
    const l = this.shadowRoot?.querySelectorAll(".etages [data-etage]");
    if (!l?.length) return;
    const P = this._pastillesEtages();
    l.forEach((b) => { const s = b.querySelector(".et-pastille"), p = P[b.dataset.etage]; if (s) s.className = `et-pastille${p ? ` ${p}` : ""}`; });
  }

  // ---------- détail d'une puce du résumé (ouvertures, lumières, volets, température) : liste groupée par étage ----------
  static TITRES_DETAIL = { ouvertures: _tk("Ouvertures ouvertes"), lumieres: _tk("Lumières allumées"), volets: _tk("Volets baissés"), temperature: _tk("Températures") };
  static ICONES_DETAIL = { ouvertures: "mdi:window-open-variant", lumieres: "mdi:lightbulb-on", volets: "mdi:window-shutter", temperature: "mdi:thermometer" };
  static CSS_DETAIL = `.det-maison{position:absolute;top:8px;z-index:6;min-width:220px;max-width:min(320px,calc(100% - 16px));max-height:min(360px,70vh);overflow:auto;
padding:8px 0;border-radius:4px;background:var(--md-surface-container);color:var(--md-on-surface);box-shadow:0 2px 6px 2px rgba(0,0,0,.15),0 1px 2px rgba(0,0,0,.3)}
.det-maison .t{padding:4px 16px 8px;color:var(--md-on-surface-variant);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.det-maison .g{padding:8px 16px 4px;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.det-maison button{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 16px 0 12px;border:0;background:none;color:inherit;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);text-align:left;cursor:pointer}
.det-maison button:hover,.det-maison button:focus-visible{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent);outline:none}
.det-maison button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.det-maison button small{color:var(--md-on-surface-variant);font-size:12px}
.det-maison ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}`;

  // clic sur une puce du résumé (hors édition, puces sans entité) : son détail
  _brancherResume() {
    const tete = this.shadowRoot?.querySelector(".tete");
    if (!tete || tete._maison) return;
    tete._maison = true;
    tete.addEventListener("click", (ev) => {
      if (this._editeur) return;
      const pu = ev.composedPath().find((n) => n.dataset?.puce != null);
      if (pu && pu.dataset.e == null) this._detailPuce(+pu.dataset.puce, pu);
    });
  }
  _detailPuce(i, puce) {
    const R = this.shadowRoot, plan = R.querySelector(".plan"), type = this._puces()[i]?.type;
    const ouvert = plan.querySelector(":scope>.det-maison");
    this._fermerDetail();
    if (ouvert?._puce === i || !MaquetteCard.TITRES_DETAIL[type]) return;
    const l = this._resumeMaison()[type];
    if (!l.length) return;
    if (!R.querySelector("style[data-maison]")) { const st = document.createElement("style"); st.dataset.maison = ""; st.textContent = MaquetteCard.CSS_DETAIL; R.append(st); }
    const plus = this._plusieursEtages(), E = parEtage(this._config), ic = MaquetteCard.ICONES_DETAIL[type];
    // groupes dans l'ordre des étages (du bas vers le haut), titre d'étage seulement s'il y en a plusieurs
    const groupes = plus ? E.map((e) => ({ e, l: l.filter((x) => x.etage === e.id) })).filter((g) => g.l.length) : [{ e: null, l }];
    const d = document.createElement("div");
    d.className = "det-maison"; d._puce = i; d._l = l;
    d.setAttribute("role", "dialog"); d.setAttribute("aria-label", _t(MaquetteCard.TITRES_DETAIL[type]));
    poserHTML(d, `<div class="t">${esc(_t(MaquetteCard.TITRES_DETAIL[type]))}</div>${groupes.map((g) => (g.e ? `<div class="g">${esc(g.e.nom || g.e.court)}</div>` : "")
      + g.l.map((x) => `<button type="button" data-aller="${l.indexOf(x)}"><ha-icon icon="${ic}"></ha-icon><span>${esc(x.nom)}</span>${x.val ? `<small>${esc(x.val)}</small>` : ""}</button>`).join("")).join("")}`);
    d.addEventListener("click", (ev) => {
      ev.stopPropagation(); // jamais jusqu'aux clics du plan
      const b = ev.composedPath().find((n) => n.dataset?.aller != null);
      if (b) this._allerElement(l[+b.dataset.aller]);
    });
    d.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._fermerDetail(); } });
    this._horsDetail = (ev) => { if (!ev.composedPath().some((n) => n === d || n === puce)) this._fermerDetail(); };
    window.addEventListener("pointerdown", this._horsDetail, true);
    const rp = plan.getBoundingClientRect(), rc = puce.getBoundingClientRect();
    plan.append(d);
    d.style.left = `${Math.max(8, Math.min(rc.left - rp.left, rp.width - d.offsetWidth - 8))}px`;
    d.querySelector("button")?.focus();
  }
  _fermerDetail() {
    this.shadowRoot?.querySelector(".plan>.det-maison")?.remove();
    if (this._horsDetail) window.removeEventListener("pointerdown", this._horsDetail, true);
    this._horsDetail = null;
  }
  // aller à l'élément : sur un autre étage, l'étage change et la vue se centre dessus ; puis le comportement habituel du toucher
  // (vue de la pièce, fiche de l'ouverture ou de la pastille, sinon « plus d'infos »)
  _allerElement(x) {
    this._fermerDetail();
    if (!x) return;
    const piece = x.genre === "piece", vue = piece && interactionDe(this._config).clic === "vue";
    if (x.etage != null && x.etage !== this._etageAffiche()) this._changerEtage(x.etage, vue ? {} : { centrer: x.centre });
    if (piece) {
      const p = this._config.pieces[x.i];
      if (!p || p.zoom === false) return;
      if (vue) return this.isoler(x.i);
      if (interactionDe(this._config).clic === "infos") this._plusInfos(p.clic || p.temperature);
      return;
    }
    if (!this._clicPorteur(x.genre, x.i)) this._plusInfos(x.ent);
  }
  // ---------- image de fond (plan scanné, photo) : calque « fond », sous tout le dessin ----------
  // Dessinée en édition ; en vue seulement avec `show: always` (et le calque non masqué) : sinon rien n'est chargé, replay compris.
  // L'<image> est créée à part (createElementNS + setAttribute) avec l'URL revalidée, jamais posée par HTML : le filet retire
  // toute <image> d'un fragment. Le crochet de _construire reçoit ici un <g> vide, rempli juste après la pose du SVG.
  static urlFond(v) { return urlFond(v) || null; }
  _dessinerFond(c, { ed, Q }) {
    const f = c.fond, url = f && urlFond(f.image);
    this._fondAPoser = null; this._solFond = null;
    if (!url || !(+f.largeur > 0) || (!ed && (f.afficher !== "toujours" || Q.masques.has(CALQUE_FOND)))) return "";
    this._fondAPoser = { f, url };
    // sol des pièces translucide au-dessus de l'image (teinte des températures gardée) ; 1 = opaque comme avant la 0.3.0
    this._solFond = Number.isFinite(+f.opacite_sol) ? Math.min(1, Math.max(0, +f.opacite_sol)) : 0.6;
    queueMicrotask(() => this._poserFond());
    const cls = `${Q.masques.has(CALQUE_FOND) ? " c-masque" : ""}${ed && this._fondVerrouille() ? " c-verrou" : ""}`;
    return `<g class="cq fond${cls}" data-cq="${CALQUE_FOND}" aria-hidden="true"></g>`;
  }
  // verrouillé par défaut en édition (on clique à travers, l'image ne bouge pas) ; « déverrouiller » vaut pour la session d'édition
  _fondVerrouille() {
    const e = this._editeur;
    return !e || !e.fondLibre || (this._config?.calques?.verrous || []).includes(CALQUE_FOND);
  }
  // largeur, hauteur (cm) et transformation : hauteur absente → ratio naturel de l'image (connu une fois chargée)
  _geoFond(f, url) {
    const [x, y] = Array.isArray(f.pos) && f.pos.length === 2 && f.pos.every((v) => Number.isFinite(+v)) ? f.pos.map(Number) : [0, 0];
    const w = +f.largeur, r = this._fondRatios?.get(url), h = +f.hauteur > 0 ? +f.hauteur : r ? w * r : null, rot = +f.rotation || 0;
    return { x, y, w, h, rot, tr: rot && h ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : "" };
  }
  _poserFond() {
    const p = this._fondAPoser, g = p && this.shadowRoot?.querySelector(`.zone svg>g[data-cq="${CALQUE_FOND}"]`);
    if (!g || g.firstChild) return;
    const { f, url } = p, im = document.createElementNS("http://www.w3.org/2000/svg", "image"), G = this._geoFond(f, url);
    const fixer = (G2) => {
      for (const [k, v] of [["x", G2.x], ["y", G2.y], ["width", G2.w], ["height", G2.h]]) if (v != null) im.setAttribute(k, String(v));
      if (G2.tr) im.setAttribute("transform", G2.tr); else im.removeAttribute("transform");
    };
    fixer(G);
    im.setAttribute("preserveAspectRatio", "none");
    im.setAttribute("opacity", String(Number.isFinite(+f.opacite) ? Math.min(1, Math.max(0, +f.opacite)) : 0.5));
    im.setAttribute("decoding", "async");
    im.setAttribute("class", "fond-image");
    im.style.pointerEvents = "none";
    if (G.h == null) {
      // ratio naturel : lu une fois (même fichier, déjà en cache), gardé pour les reconstructions suivantes
      im.addEventListener("load", () => {
        const i = new Image();
        i.src = url;
        i.decode().then(() => {
          if (!i.naturalWidth || !i.naturalHeight) return;
          (this._fondRatios ||= new Map()).set(url, i.naturalHeight / i.naturalWidth);
          if (im.isConnected) fixer(this._geoFond(f, url));
        }, () => {});
      }, { once: true });
    }
    im.setAttribute("href", url);
    g.append(im);
  }
  _plusInfos(e) {
    if (this._sim) return; // démo : pas de fenêtre « plus d'infos » (entités simulées)
    if (!e) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId: e };
    this.dispatchEvent(ev);
  }

  _clicMeuble(i) {
    const m = this._config.meubles?.[i];
    if (this._versEtage(m)) return this._prendreEscalier(m);
    if (!estConnecte(m)) return;
    const mode = clicMeuble(m);
    if (mode === "infos") return this._plusInfos(m.entite || m.valeur);
    if (mode === "fiche") this._ouvrirFiche("meuble", i);
  }

  // ouverture ou pastille : true si le clic est pris en charge (fiche, plus d'infos ou rien, réglés) ; false = comportement d'avant
  _clicPorteur(genre, i) {
    const o = this._config[GENRES_FICHE[genre]]?.[i], mode = clicPorteur(o);
    if (!mode) return false;
    if (mode === "fiche") this._ouvrirFiche(genre, i);
    else if (mode === "infos") this._plusInfos(this._enteteFiche(genre, o).infos);
    return true;
  }

  // ---------- escaliers reliés à un autre étage (`floor`, interne `etage`) ----------
  // étage visé par un escalier : un autre étage connu du plan, sinon null
  _cibleEscalier(m) {
    if (m?.type !== "escalier" || typeof m.etage !== "string") return null;
    return idsEtages(this._config).includes(m.etage) && m.etage !== this._etageAffiche() ? m.etage : null;
  }
  // toucher l'escalier = aller à l'étage visé, sauf si le meuble règle lui-même son toucher (`tap`, ex. `tap: card`)
  _versEtage(m) { return !this._editeur && !("clic" in (m || {})) && this._cibleEscalier(m) != null; }
  // à l'arrivée, vue centrée sur l'escalier qui revient à l'étage de départ (le plus proche s'il y en a plusieurs), sinon sur la même position
  _prendreEscalier(m) {
    const dep = this._etageAffiche(), cible = this._cibleEscalier(m), pos = [+m.pos[0], +m.pos[1]];
    const l = (parEtage(this._config).find((e) => e.id === cible)?.geo.meubles || []).filter((x) => x?.type === "escalier" && x.etage === dep && Array.isArray(x.pos));
    const d2 = (x) => (x.pos[0] - pos[0]) ** 2 + (x.pos[1] - pos[1]) ** 2;
    const retour = l.reduce((a, x) => (!a || d2(x) < d2(a) ? x : a), null);
    return this._changerEtage?.(cible, { centrer: retour ? [+retour.pos[0], +retour.pos[1]] : pos });
  }
  // une fois par plan construit (premier _maj qui suit) : flèche ↑ / ↓ selon l'ordre de `floors`, symbole touchable,
  // bouton du calque (clavier, lecteur d'écran, infobulle « Aller à : … ») ; rien pour un escalier sans `floor`
  _escaliers() {
    const R = this.shadowRoot, svg = R?.querySelector(".zone svg"), calque = R?.querySelector(".zone .calque");
    if (!svg || svg === this._escSvg) return;
    this._escSvg = svg;
    const c = this._config, L = parEtage(c), rang = (id) => L.findIndex((e) => e.id === id), ici = rang(this._etageAffiche());
    const { x0, y0, W, H } = this.vue();
    (c.meubles || []).forEach((m, i) => {
      const id = this._cibleEscalier(m), g = id != null && svg.querySelector(`[data-mb="${i}"]`);
      if (!g) return; // escalier sans étage visé, ou calque des meubles masqué
      const e = L[rang(id)], txt = _t("Aller à : {etage}", { etage: e.nom || e.court });
      g.querySelector(".esc-sens")?.setAttribute("transform", rang(id) > ici ? "rotate(0)" : "rotate(180)");
      if (!this._versEtage(m)) return;
      g.classList.add("connecte"); // le symbole entier se touche (même chemin que les meubles connectés : _clicMeuble)
      if (!calque || calque.querySelector(`:scope>[data-mbq="${i}"]`)) return;
      const [x, y] = [+m.pos[0], +m.pos[1]];
      ajouterHTML(calque, `<button class="mb esc" data-mbq="${i}" data-x="${x}" data-y="${y}" style="left:${((x - x0) / W * 100).toFixed(3)}%;top:${((y - y0) / H * 100).toFixed(3)}%" title="${esc(txt)}" aria-label="${esc(txt)}"><span class="v"></span></button>`);
    });
  }

  _ficheOuvrable(genre, o) { return genre === "meuble" ? estConnecte(o) : clicPorteur(o) === "fiche"; }

  // en-tête d'une fiche selon l'élément qui la porte : icône, titre, entité dont on montre l'état, interrupteur, couleur, « plus d'infos »
  _enteteFiche(genre, o) {
    if (genre === "meuble") return { icone: ICONES_MEUBLE[o.type] || "mdi:sofa-outline", titre: o.fiche?.titre || o.nom || _t(MEUBLES[o.type]?.nom || _tk("Meuble")), etat: o.entite || o.valeur, bascule: o.entite, couleur: o.couleur, infos: o.entite || o.valeur };
    if (genre === "ouverture") {
      const e = entOuv(o);
      return { icone: (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[0], titre: o.fiche?.titre || o.baie || o.nom || (e || o.volet ? this._nom(e || o.volet) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))), etat: e, bascule: e, infos: e || o.volet };
    }
    return { icone: o.icone || "mdi:circle", titre: o.fiche?.titre || o.nom || this._nom(o.entite) || _t("Appareil"), etat: o.entite, bascule: o.entite, couleur: o.couleur, infos: o.entite };
  }

  // fiche d'un meuble connecté, d'une ouverture ou d'une pastille : <dialog> modal (couche supérieure, Échap, focus contenu puis rendu),
  // feuille du bas au téléphone ; ses widgets passent par le moteur des panneaux ; services possibles : marche / arrêt de l'entité
  // de l'en-tête (domaines BASCULES, jamais l'arrêt si elle est protégée) et Ouvrir / Stop / Fermer des widgets `commande`
  _ouvrirFiche(genre, i) {
    if (typeof genre === "number") [genre, i] = ["meuble", genre];
    const R = this.shadowRoot, o = this._config[GENRES_FICHE[genre]]?.[i];
    if (!o) return;
    let d = R.querySelector("dialog.mf");
    if (!d) {
      d = document.createElement("dialog");
      d.className = "mf";
      d.setAttribute("aria-labelledby", "mf-titre");
      R.querySelector("ha-card").append(d);
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // les clics de la fiche ne passent jamais par ceux de la carte (interrupteurs des widgets…)
        if (ev.target === d) return d.close(); // fond
        const chemin = ev.composedPath(), a = chemin.find((n) => n.dataset?.mf)?.dataset.mf;
        if (a === "fermer") return d.close();
        if (a === "infos") { const x = this._mfObjet(), cible = x && this._cibleInfos(this._mf.genre, x); d.close(); return this._ouvrirInfos(cible); }
        if (a === "allumer") return this._basculerFiche(true);
        if (a) return;
        const cmd = chemin.find((n) => n.dataset?.cmd);
        if (cmd) return this._lancerCommande(cmd);
        const th = chemin.find((n) => n.dataset?.th);
        if (th) return this._reglerThermostat(th);
        const el = chemin.find((n) => n.dataset?.e);
        if (el) { d.close(); this._plusInfos(el.dataset.e); }
      });
      d.addEventListener("change", (ev) => { if (ev.target.dataset?.mf === "basculer") this._basculerFiche(ev.target.checked); });
      d.addEventListener("close", () => {
        if (d.open) return; // rouverte (autre élément) avant que l'événement de fermeture n'arrive
        const r = this._mf?.retour;
        this._mf = null;
        if (r?.isConnected) r.focus();
      });
    }
    const t = this._enteteFiche(genre, o), dom = (t.bascule || "").split(".")[0];
    const retour = { meuble: `.calque>[data-mbq="${i}"]`, point: `.calque>[data-q="${i}"]`, ouverture: `.zone svg [data-o="${i}"][tabindex]` }[genre];
    this._mf = { genre, i, retour: (retour && R.querySelector(retour)) || R.activeElement, html: null };
    const tc = genre === "meuble" ? couleurMeuble(o) : t.couleur;
    d.style.cssText = couleurSure(tc) ? `--mb-couleur:${couleurSure(tc)}` : "";
    poserHTML(d, `<div class="mf-in"><header><span class="ic"><ha-icon icon="${esc(t.icone)}"></ha-icon></span>
        <div class="n"><h2 id="mf-titre">${esc(t.titre)}</h2><small class="etat"></small></div>
        ${t.bascule && BASCULES.includes(dom) && !o.protege ? `<input type="checkbox" class="bascule" role="switch" data-mf="basculer" aria-label="${_t("Marche / arrêt")}">` : ""}
        ${(() => { const ci = this._cibleInfos(genre, o), lien = ci && /^(\/|https?:\/\/)/i.test(ci), lib = lien ? _t("Ouvrir : {cible}", { cible: ci }) : _t("Plus d'infos");
          return ci ? `<button class="ib" data-mf="infos" title="${esc(lib)}" aria-label="${esc(lib)}"><ha-icon icon="${lien ? "mdi:open-in-new" : "mdi:information-outline"}"></ha-icon></button>` : ""; })()}
        <button class="ib" data-mf="fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      ${o.protege ? `<div class="mf-protege"><ha-icon icon="mdi:shield-lock-outline"></ha-icon><span>${_t("Appareil protégé : pas d'arrêt depuis le plan.")}</span><button class="cta" data-mf="allumer" hidden><ha-icon icon="mdi:power"></ha-icon>${_t("Rallumer")}</button></div>` : ""}
      <div class="mf-w"></div></div>`);
    this._majFiche();
    if (!d.open) d.showModal();
    d.querySelector("header [data-mf=fermer]").focus();
  }

  // bouton « Plus d'infos » d'une fiche (`card.more_info`) : par défaut l'entité de l'en-tête ; false = masqué ; une autre entité,
  // un chemin de tableau de bord (/…) ou une URL (http…)
  _cibleInfos(genre, o) {
    const v = o?.fiche?.plus_infos;
    if (v === false) return null;
    return typeof v === "string" && v ? v : this._enteteFiche(genre, o).infos || null;
  }
  _ouvrirInfos(cible) {
    if (!cible) return;
    if (/^https?:\/\//i.test(cible)) return LIEN_SUR.test(cible) ? window.open(cible, "_blank", "noopener,noreferrer") : undefined;
    if (cible.startsWith("/")) {
      if (!LIEN_SUR.test(cible)) return;
      history.pushState(null, "", cible);
      const ev = new Event("location-changed", { bubbles: true, composed: true });
      ev.detail = { replace: false };
      return window.dispatchEvent(ev);
    }
    this._plusInfos(cible);
  }

  // vantaux d'une même baie (`baie` identique), l'ouverture seule sinon
  _vantaux(o) { return o?.baie ? (this._config.ouvertures || []).filter((x) => x.baie === o.baie) : o ? [o] : []; }

  _mfObjet() { return this._mf ? this._config[GENRES_FICHE[this._mf.genre]]?.[this._mf.i] ?? null : null; }

  // marche / arrêt depuis la fiche : service explicite selon l'état voulu (pas de toggle), sur l'entité de l'en-tête seulement,
  // arrêt refusé si l'élément est protégé
  _basculerFiche(on) {
    const o = this._mfObjet(), e = o ? this._enteteFiche(this._mf.genre, o).bascule : null, dom = (e || "").split(".")[0];
    if (!o || !BASCULES.includes(dom) || (!on && o.protege)) return;
    // `confirm: true` de l'élément : confirmation même pour ce service sûr ; annulé ou en échec, l'interrupteur revient à l'état réel
    const remettre = () => this._majFiche();
    this._appeler(dom, on ? "turn_on" : "turn_off", { entity_id: e }, undefined, { forcer: o.confirmer === true, libelle: on ? _t("Allumer") : _t("Éteindre") }).then((fait) => { if (!fait) remettre(); }, remettre);
  }

  // mise à jour en direct de la fiche ouverte : en-tête modifié sur place (le focus reste), widgets réécrits seulement s'ils changent
  _majFiche() {
    const d = this.shadowRoot?.querySelector("dialog.mf"), o = this._mfObjet();
    if (!d || !o) return;
    const genre = this._mf.genre, t = this._enteteFiche(genre, o), s = this._etat(t.etat), on = s?.state === "on", ic = d.querySelector("header .ic");
    let v = "", actif = false, ouvert = false;
    let se = s;
    if (genre === "ouverture") {
      // baie à plusieurs vantaux : ouverte dès qu'un vantail l'est, état d'en-tête = le vantail ouvert (sinon le premier)
      const vs = this._vantaux(o).map((x) => this._etatOuverture(x)).filter(Boolean);
      se = vs.find((x) => ["on", "open"].includes(x.state)) || this._etatOuverture(o) || s;
      // plusieurs capteurs : mention discrète de ceux qui ne répondent pas (l'ouverture reste fermée ou ouverte d'après les autres)
      const muets = contactsDe(o).filter((e) => { const x = this._etat(e); return !x || ETATS_MUETS.includes(x.state); }).length;
      if (contactsDe(o).length > 1 && muets && se && !ETATS_MUETS.includes(se.state)) v = _t("{n} capteur indisponible|{n} capteurs indisponibles", { n: muets });
      ouvert = !!se && ["on", "open"].includes(se.state);
      const sv = this._etat(o.volet), pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      if (sv) v = [v, _t("volet {n} %", { n: pos })].filter(Boolean).join(" · ");
      ic.querySelector("ha-icon").setAttribute("icon", (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[ouvert ? 1 : 0]);
    } else {
      v = this._texteValeur(o);
      actif = !!s && this._actif(genre === "meuble" ? { ...o, actif: o.actif || o.entite || o.valeur } : o);
    }
    d.querySelector(".etat").textContent = [se ? this._hass.formatEntityState?.(se) ?? se.state : t.etat ? _t("indisponible") : "", v].filter(Boolean).join(" · ");
    ic.classList.toggle("on", actif);
    ic.classList.toggle("clair", actif && genre === "point" && !!(o.clair ?? clairPour(o.couleur)));
    ic.classList.toggle("alerte", ouvert);
    const b = d.querySelector('[data-mf="basculer"]');
    if (b) { b.checked = on; b.disabled = !s || s.state === "unavailable"; }
    const r = d.querySelector('[data-mf="allumer"]');
    if (r) r.hidden = !(s && s.state === "off" && BASCULES.includes((t.bascule || "").split(".")[0]));
    const cs = genre === "ouverture" ? contactsDe(o) : [];
    // plusieurs capteurs : une ligne par capteur en tête de la fiche
    // (sauf si un widget de la fiche montre déjà tous les capteurs)
    const fw = o.fiche?.widgets || [], dejaLa = cs.length > 1 && cs.every((e) => fw.some((w) => JSON.stringify(w ?? null).includes(JSON.stringify(e))));
    const l = [...(cs.length > 1 && !dejaLa ? [{ type: "entites", titre: _t("Capteurs"), icone: "mdi:magnet", entites: cs }] : []), ...fw];
    // PC : la fiche s'élargit avec le nombre de widgets (1, 2, 3 colonnes) plutôt que de défiler
    const n = l.filter((w) => w?.type !== "separateur").length;
    d.classList.toggle("l2", n === 2); d.classList.toggle("l3", n >= 3);
    this._sansBascule = true;
    let html;
    try { html = l.map((w, j) => { try { return this._widget(w, "mf", j); } catch (e) { return `<div class="w"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }).join(""); } finally { this._sansBascule = false; }
    if (!l.length) html = `<div class="w-note">${t.etat ? "" : _t("Aucun widget dans cette fiche.")}</div>`;
    if (html !== this._mf.html) { poserHTML(d.querySelector(".mf-w"), html); this._mf.html = html; }
  }

  _fiche() {
    this._escaliers();
    const R = this.shadowRoot, f = R.querySelector(".fiche"), c = this._config;
    const iso = this._iso != null && !this._editeur ? c.pieces[this._iso] : null;
    if (f.hidden !== !iso) f.hidden = !iso; // pas de réécriture identique (une mutation à chaque mise à jour)
    if (!iso) { poserHTML(f, ""); return; }
    const t = this._num(iso.temperature, iso.attribut_temperature), h = this._num(iso.humidite, iso.attribut_humidite);
    const etat = (s) => (s ? this._hass.formatEntityState?.(s) ?? s.state : _t("indisponible"));
    // pastilles de la pièce (une pastille masquée, `hidden: true`, n'y figure pas) ; état actif et valeur lus de la config, pas du plan
    const lignes = (c.points || []).filter((p) => !p.masque && dansPoly(p.pos, iso.poly)).map((p) => {
      const s = this._etat(p.entite), on = this._actif(p), dom = (p.entite || "").split(".")[0];
      const v = this._texteValeur(p);
      return `<div class="ligne" data-e="${esc(p.entite)}"${clicPorteur(p) ? ` data-fq="${c.points.indexOf(p)}"` : ""} role="button"><span class="ic${on ? " on" : ""}${on && (p.clair ?? clairPour(p.couleur)) ? " clair" : ""}" style="--pt-couleur:${couleurSure(p.couleur) || "var(--md-primary)"}"><ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon></span>
        <span class="n"><span>${esc(p.nom || this._nom(p.entite))}</span><small>${esc(v ? `${v} · ${etat(s)}` : etat(s))}</small></span>
        ${BASCULES.includes(dom) && s ? this._interrupteur(p.entite, s, p) : ""}</div>`;
    });
    const ouv = (c.ouvertures || []).filter((o) => !o.masque && (entOuv(o) || o.volet) && distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], iso.poly) < 20)
      .filter((o, k, l) => !o.baie || l.findIndex((x) => x.baie === o.baie) === k).map((o) => { // une ligne par baie
      const ent = entOuv(o), sv = this._etat(o.volet);
      const ss = this._vantaux(o).map((x) => this._etatOuverture(x)).filter(Boolean);
      const s = ss.find((x) => ["on", "open"].includes(x.state)) || this._etatOuverture(o);
      const ouvert = s && ["on", "open"].includes(s.state);
      const pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      const txt = [ent ? (ouvert ? _t("Ouverte") : s ? _t("Fermée") : _t("indisponible")) : "", sv ? _t("volet {n} %", { n: pos }) : ""].filter(Boolean).join(" · ");
      const ic = o.type === "fenetre" ? (ouvert ? "mdi:window-open-variant" : "mdi:window-closed-variant") : o.type === "portail" ? "mdi:garage-variant" : (ouvert ? "mdi:door-open" : "mdi:door-closed");
      return `<div class="ligne" data-e="${esc(ent || o.volet)}"${clicPorteur(o) ? ` data-fo="${c.ouvertures.indexOf(o)}"` : ""} role="button"><span class="ic${ouvert ? " alerte" : ""}"><ha-icon icon="${ic}"></ha-icon></span>
        <span class="n"><span>${esc(o.baie || o.nom || this._nom(ent || o.volet))}</span><small>${esc(txt)}</small></span></div>`;
    });
    const { boutons, automations } = this._actionsPiece(this._iso);
    const autos = automations.map((a) => {
      const s = this._etat(a);
      const script = a.startsWith("script.");
      return `<div class="ligne" data-e="${esc(a)}" role="button"><span class="ic${!script && s?.state === "on" ? " on" : ""}" style="--pt-couleur:var(--md-primary)"><ha-icon icon="${script ? "mdi:script-text-outline" : "mdi:robot-outline"}"></ha-icon></span>
        <span class="n"><span class="deux">${esc(s?.attributes.friendly_name || a)}</span><small>${script ? _t("Script · ") : ""}${esc(ilya(s?.attributes.last_triggered))}</small></span>
        ${s && !script ? `<input type="checkbox" class="bascule" data-b="${esc(a)}" ${s.state === "on" ? "checked" : ""} aria-label="${_t("Activer")}">` : ""}</div>`;
    });
    poserHTML(f, `<header><b>${esc(iso.nom)}</b><span>${[t != null ? `${fmt(t)} °C` : "", h != null ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · ")}</span></header>
      ${boutons.length ? `<div class="actions">${boutons.map((b, k) => `<button class="cta${b.plein ? " plein" : ""}" data-cta="${k}"${b.titre ? ` title="${esc(b.titre)}" aria-label="${esc(b.titre)}"` : ""}><ha-icon icon="${esc(b.icone || "mdi:gesture-tap")}"></ha-icon>${esc(b.nom)}</button>`).join("")}</div>` : ""}
      ${lignes.length ? `<h4>${_t("Appareils")}</h4>${lignes.join("")}` : ""}${ouv.length ? `<h4>${_t("Ouvertures")}</h4>${ouv.join("")}` : ""}
      ${autos.length ? `<h4>${_t("Automatisations")}</h4>${autos.join("")}` : ""}
      ${!lignes.length && !ouv.length && !boutons.length ? `<div class="vide">${_t("Aucun appareil placé dans cette pièce.")}</div>` : ""}`);
    this._boutons = boutons;
    this._ajusterCols();
  }

  // pleine page : un panneau trop haut est réduit (zoom CSS) pour tenir
  // (réduction plafonnée à 85 % pour rester lisible, au-delà défilement sans barre ; même échelle pour les deux colonnes)
  _ajusterCols() {
    const R = this.shadowRoot, plein = R?.querySelector("ha-card")?.classList.contains("plein");
    const cols = [...(R?.querySelectorAll(".col") || [])];
    cols.forEach((col) => { col.querySelector(".col-in").style.zoom = ""; });
    if (!plein || this._modeMise === "etroit") return;
    const vis = cols.filter((c) => !c.hidden);
    let z = 1;
    for (const col of vis) {
      const h = col.querySelector(".col-in").getBoundingClientRect().height / (this._zVue || 1);
      if (h > col.clientHeight + 1) z = Math.min(z, col.clientHeight / h);
    }
    z = Math.max(0.85, z);
    if (z < 1) vis.forEach((col) => { col.querySelector(".col-in").style.zoom = String(z); });
    const fondu = (col) => col.classList.toggle("suite", col.scrollTop + col.clientHeight < col.scrollHeight - 2);
    vis.forEach((col) => { fondu(col); col.onscroll ||= () => fondu(col); });
  }

  // panneaux affichés : ceux de la pièce isolée (ou sélectionnée dans l'éditeur), sinon ceux de la maison
  _panneauxCourants() {
    const c = this._config, s = this._editeur?.sel;
    let pi = this._iso;
    if (this._editeur) {
      // meuble connecté, ouverture ou pastille sélectionné (ou un widget de sa fiche) : la colonne de droite montre sa fiche, en vrai rendu
      const seul = this._editeur.multi.size <= 1;
      const pf = s?.type === "widget" && s.cote === "fiche" ? porteurDe(s)
        : seul && (s?.type === "meuble" ? estConnecte(c.meubles?.[s.i]) : s?.type === "ouverture" || s?.type === "point") ? { genre: s.type, i: s.i } : null;
      const o = pf && c[GENRES_FICHE[pf.genre]]?.[pf.i];
      if (o) return { P: { droite: o.fiche?.widgets || [] }, pi: null, pf };
      pi = s?.type === "piece" && this._editeur.multi.size <= 1 ? s.i : s?.type === "widget" && s.piece != null ? s.piece : null;
    }
    // mode tablette sans panneaux : ni ceux de la maison ni ceux des pièces (la fiche de la pièce reste)
    if (this._tablette() && !this._tablette().panneaux) return { P: {}, pi: pi != null && c.pieces[pi] ? pi : null };
    if (pi != null && c.pieces[pi]) return { P: c.pieces[pi].panneaux || {}, pi };
    return { P: c.panneaux || {}, pi: null };
  }

  _widgets() {
    const R = this.shadowRoot;
    if (!R || !this._hass) return;
    const { P, pi, pf } = this._panneauxCourants(), g = P.gauche || [], d = P.droite || [];
    const suf = pi != null ? `:${pi}` : pf ? sufFiche(pf) : "";
    const ajout = (cote) => (this._editeur ? `<button class="w-ajout" data-ajouter="${cote}"><ha-icon icon="mdi:plus"></ha-icon>${cote === "fiche" ? _t("Ajouter un widget à la fiche") : this._modeMise === "large" ? _t("Ajouter un widget") : cote === "gauche" ? _t("Ajouter un widget (gauche)") : _t("Ajouter un widget (droite)")}</button>` : "");
    const rendu = (l, cote) => {
      this._sansBascule = cote === "fiche"; // aperçu fidèle : pas d'interrupteur dans une fiche
      try { return l.map((w, i) => { try { return this._widget(w, cote, i, suf); } catch (e) { return `<div class="w" data-w="${cote}:${i}${suf}"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }); }
      finally { this._sansBascule = false; }
    };
    const es = this._editeur?.sel, sel = es?.type === "widget" ? `${es.cote}:${es.i}${es.piece != null ? `:${es.piece}` : porteurDe(es) ? sufFiche(porteurDe(es)) : ""}` : null;
    let change = false;
    // colonne posée morceau par morceau (un widget = un élément) : seuls les widgets dont le HTML change sont reconstruits, au lieu de
    // relire toute la colonne à chaque mise à jour de hass ; même DOM qu'une colonne posée d'un bloc (repli sur celle-ci au moindre doute)
    const poser = (el, morceaux) => {
      const parts = morceaux.flat().filter(Boolean), html = parts.join("");
      if (el._html === html) return;
      change = true;
      const avant = el._parts;
      if (avant?.length === parts.length && el.childNodes.length === parts.length) {
        const neufs = parts.map((h, i) => (h === avant[i] ? null : fragmentSur(h, el)));
        if (neufs.every((f) => !f || (f.childNodes.length === 1 && f.firstChild.nodeType === 1))) {
          const enfants = [...el.childNodes];
          neufs.forEach((f, i) => f && enfants[i].replaceWith(f));
          el._html = html; el._parts = parts;
          return;
        }
      }
      poserHTML(el, html); el._html = html;
      el._parts = el.childNodes.length === parts.length && [...el.childNodes].every((n) => n.nodeType === 1) ? parts : null;
    };
    if (pf) {
      const t = this._enteteFiche(pf.genre, this._config[GENRES_FICHE[pf.genre]][pf.i]).titre;
      const note = { meuble: _t("Fiche « {t} » : ce qui s'ouvre au toucher du meuble", { t: esc(t) }), ouverture: _t("Fiche « {t} » : ce qui s'ouvre au toucher de l'ouverture", { t: esc(t) }),
        point: _t("Fiche « {t} » : ce qui s'ouvre au toucher de la pastille", { t: esc(t) }) }[pf.genre];
      poser(R.querySelector(".col-g .widgets"), []);
      poser(R.querySelector(".col-d .widgets"), [`<div class="w-note w-fiche"><ha-icon icon="mdi:card-text-outline"></ha-icon>${note}</div>`, rendu(d, "fiche"), ajout("fiche")]);
    } else if (this._modeMise === "large") { poser(R.querySelector(".col-g .widgets"), [rendu(g, "gauche"), ajout("gauche")]); poser(R.querySelector(".col-d .widgets"), [rendu(d, "droite"), ajout("droite")]); }
    else { poser(R.querySelector(".col-g .widgets"), []); poser(R.querySelector(".col-d .widgets"), [rendu(g, "gauche"), ajout("gauche"), rendu(d, "droite"), ajout("droite")]); }
    if (change) this._ajusterCols();
    R.querySelectorAll(".w.sel").forEach((n) => n.classList.remove("sel"));
    if (sel) R.querySelector(`.w[data-w="${sel}"]`)?.classList.add("sel");
    this._majFiche();
  }

  _val(e, dec, unite) {
    const s = this._etat(e);
    if (!s) return { t: "—", u: "" };
    const n = parseFloat(s.state);
    if (isNaN(n)) return { t: this._hass.formatEntityState?.(s) ?? s.state, u: "" };
    return { t: fmt(n, dec ?? (Math.abs(n) >= 100 ? 0 : 1)), u: unite ?? s.attributes.unit_of_measurement ?? "" };
  }

  _tete(w, defIcone, droite = "") {
    return `<div class="w-tete"><ha-icon icon="${esc(w.icone || defIcone)}"></ha-icon><span>${esc(w.titre || "")}</span>${droite ? `<span class="d">${droite}</span>` : ""}</div>`;
  }

  // interrupteur marche / arrêt (vue de la pièce, lignes des widgets) : `protected` (o.protege) = pas d'arrêt depuis le plan
  // (grisé tant que l'appareil est allumé), `confirm: true` (o.confirmer) = confirmation avant chaque appel
  _interrupteur(e, s, o = {}) {
    const on = s.state === "on", prot = o?.protege === true;
    return `<input type="checkbox" class="bascule" data-b="${esc(e)}"${prot ? ` data-p="1"` : ""}${o?.confirmer === true ? ` data-cf="1"` : ""} ${on ? "checked" : ""}${prot && on ? ` disabled title="${_t("Appareil protégé : pas d'arrêt depuis le plan.")}"` : ""} aria-label="${_t("Basculer")}">`;
  }
  // appui sur un interrupteur : bascule (allumage seul si protégé) ; annulé ou en échec, l'interrupteur revient à sa position
  _basculer(bas) {
    const e = bas.dataset.b, voulu = bas.checked, prot = bas.dataset.p === "1";
    if (this._editeur || !e) return;
    if (bas.disabled || (prot && !voulu)) { bas.checked = !voulu; return; }
    const remettre = () => { if (bas.isConnected) bas.checked = !voulu; };
    this._appeler("homeassistant", prot ? "turn_on" : "toggle", { entity_id: e }, undefined, { forcer: bas.dataset.cf === "1", libelle: bas.getAttribute("aria-label") || "" })
      .then((fait) => { if (!fait) remettre(); }, remettre);
  }

  // lignes d'un widget ; `confirm: true` du widget (w) : ses interrupteurs et ses boutons « Activer » demandent confirmation
  _lignes(liste, w = {}) {
    const cf = w?.confirmer === true ? ` data-cf="1"` : "";
    return `<div class="w-lignes">${(liste || []).map((l) => {
      const o = typeof l === "string" ? { entite: l } : l, s = this._etat(o.entite), v = this._val(o.entite, o.decimales, o.unite);
      const dom = (o.entite || "").split(".")[0];
      return `<div class="w-ligne" data-e="${esc(o.entite)}"><ha-icon icon="${esc(o.icone || s?.attributes.icon || "mdi:circle-small")}"></ha-icon><span class="n">${esc(o.nom || s?.attributes.friendly_name || o.entite)}</span>
        ${BASCULES.includes(dom) && s && !this._sansBascule ? this._interrupteur(o.entite, s, w)
          : Object.hasOwn(ACTIVABLES, dom) && s && !this._sansBascule ? `<button class="w-activer" data-active="${esc(o.entite)}"${cf}${s.state === "unavailable" ? ` aria-disabled="true"` : ""}>${_t("Activer##lancer")}</button>`
          : `<span class="v${enAlarme(o.entite, s) ? " alerte" : ""}">${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}</span>`}</div>`;
    }).join("")}</div>`;
  }

  _widget(w, cote, i, suf = "") {
    const id = `${cote}:${i}${suf}`, coul = couleurSure(w.couleur) ? `--w-couleur:${couleurSure(w.couleur)}` : "";
    const ouvre = (inner) => `<div class="w" data-w="${id}" style="${coul}">${inner}</div>`;
    if (w.type === "separateur") return `<div class="w w-sep${w.titre ? "" : " vide"}" data-w="${id}"${w.espace ? ` style="margin:${+w.espace}px 0"` : ""}>${esc(w.titre || "")}</div>`;
    if (w.type === "tuile") {
      const v = this._val(w.entite, w.decimales, w.unite);
      const h = w.historique ? this._histo(w.entite, w.historique) : null;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:gauge")}<div class="w-grand${enAlarme(w.entite, this._etat(w.entite)) ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(v.t)}<small>${esc(v.u)}</small></div>
        ${h ? this._courbe(h) : ""}${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "jauge") {
      const n = this._num(w.entite), mn = +(w.min ?? 0), mx = +(w.max ?? 100), k = n == null ? 0 : Math.max(0, Math.min(1, (n - mn) / (mx - mn || 1)));
      const v = this._val(w.entite, w.decimales, w.unite);
      const col = (w.seuils && typeof w.seuils === "object" && n != null && couleurSeuils(w.seuils, n)) || couleurSure(w.couleur) || (k < 0.6 ? "#188038" : k < 0.85 ? "#e8710a" : "#d93025");
      const L = 0.75 * 2 * Math.PI * 80;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:speedometer")}<div class="w-jauge" data-e="${esc(w.entite)}"><svg viewBox="0 0 200 200"><g transform="rotate(135 100 100)">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--md-outline-variant)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L} 999"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="${esc(col)}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(L * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></g></svg>
        <div class="val">${esc(v.t)}<small>${esc(v.u)}${w.max ? ` · ${fmt(k * 100, 0)}${globalThis.MaquetteI18n.pct()}` : ""}</small></div></div>
        <div class="w-bornes"><span>${fmt(mn, 3)}</span><span>${fmt(mx, 3)}</span></div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "entites") return ouvre(`${this._tete(w, "mdi:format-list-bulleted")}${this._lignes(w.entites, w)}`);
    if (w.type === "tarif") {
      const s = this._etat(w.prix), n = this._num(w.prix), sp = this._etat(w.periode), per = sp?.state || "";
      // période indisponible ou inconnue : pastille neutre (ni heures pleines ni heures creuses)
      const perIndispo = ["unavailable", "unknown"].includes(per), creuse = /creuse|off.?peak/i.test(per);
      // couleurs Tempo telles que HA les donne : en français (Bleu…) ou en anglais (Blue…)
      const tempo = { bleu: ["#1a73e8", "#fff"], blanc: ["#f1f3f4", "#202124"], rouge: ["#d93025", "#fff"] };
      Object.assign(tempo, { blue: tempo.bleu, white: tempo.blanc, red: tempo.rouge });
      const pastille = (nom, e) => {
        const st = this._etat(e)?.state || "", c = tempo[st.toLowerCase()];
        return e ? `<span class="pastille${c ? " forte" : ""}" data-e="${esc(e)}" style="${c ? `--p-couleur:${c[0]};--p-texte:${c[1]}` : ""}">${_t("{nom} : {etat}", { nom: esc(nom), etat: esc(st || "—") })}</span>` : "";
      };
      return ouvre(`${this._tete(w, "mdi:cash-clock")}<div class="w-grand" data-e="${esc(w.prix)}">${n != null ? fmt(n, 4) : "—"}<small>${esc(s?.attributes.unit_of_measurement || "€/kWh")}</small></div>
        <div class="pastilles">${per ? `<span class="pastille${perIndispo ? "" : " forte"}" data-e="${esc(w.periode)}"${perIndispo ? "" : ` style="--p-couleur:${creuse ? "#188038" : "#e8710a"}"`}>${esc(perIndispo ? this._hass.formatEntityState?.(sp) ?? _t("Indisponible") : per)}</span>` : ""}
        ${pastille(_t("Aujourd'hui"), w.couleur_jour)}${pastille(_t("Demain"), w.couleur_demain)}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "ve") {
      // puissance ramenée en W selon l'unité de l'entité (W, kW, MW) ; le seuil `threshold` est en W
      const pu = String(this._etat(w.puissance)?.attributes.unit_of_measurement || "W").trim(), kp = /^kW$/i.test(pu) ? 1000 : /^MW$/.test(pu) ? 1e6 : 1;
      const bat = this._num(w.batterie), pw0 = this._num(w.puissance), pw = pw0 == null ? null : pw0 * kp, charge = pw != null && pw > nb(w.seuil ?? 50, 50);
      const br = this._etat(w.branche), branche = br ? ["on", "plugged", "connected", "true"].includes(br.state.toLowerCase()) : null;
      const etat = charge ? _t("En charge · {p} {u}", { p: fmt(pw / (pw >= 1000 ? 1000 : 1), pw >= 1000 ? 2 : 0), u: pw >= 1000 ? "kW" : "W" }) : branche === true ? _t("Branchée") : branche === false ? _t("Débranchée") : _t("À l'arrêt");
      const C = 2 * Math.PI * 42, k = bat == null ? 0 : Math.max(0, Math.min(1, bat / 100));
      const col = charge ? "#188038" : bat != null && bat < 20 ? "#d93025" : "var(--md-primary)";
      const lignes = [w.autonomie && { entite: w.autonomie, icone: "mdi:map-marker-distance", nom: _t("Autonomie") }, w.session_kwh && { entite: w.session_kwh, icone: "mdi:lightning-bolt", nom: _t("Session"), decimales: 1 },
        w.session_cout && { entite: w.session_cout, icone: "mdi:currency-eur", nom: _t("Coût de la session"), decimales: 2 }, ...(w.lignes || [])].filter(Boolean);
      return ouvre(`${this._tete(w, "mdi:car-electric")}<div class="w-ve">
        <div class="anneau" data-e="${esc(w.batterie || w.puissance || "")}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-outline-variant)" stroke-width="10"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></svg>
          <b>${bat != null ? `${fmt(bat, 0)}${globalThis.MaquetteI18n.pct()}` : `<ha-icon icon="mdi:${charge ? "battery-charging" : "car-electric-outline"}"></ha-icon>`}</b></div>
        <div class="etat"><span class="pastille forte" style="--p-couleur:${charge ? "#188038" : branche ? "#1a73e8" : "var(--md-surface-container-high)"};--p-texte:${charge || branche ? "#fff" : "var(--md-on-surface)"}" data-e="${esc(w.puissance || w.branche || "")}">${esc(etat)}</span>
          ${bat == null && !w.batterie ? `<span class="w-note">${_t("Batterie non configurée.")}</span>` : ""}</div></div>
        ${lignes.length ? this._lignes(lignes, w) : ""}`);
    }
    if (w.type === "periodes") {
      const per = w.periodes || ["jour", "semaine", "mois", "annee"];
      const NOMS = { jour: _t("Aujourd'hui"), semaine: _t("Semaine"), mois: _t("Mois"), annee: _t("Année") }, CAL = { jour: "day", semaine: "week", mois: "month", annee: "year" };
      const cols = w.colonnes || [];
      const cell = (c, p) => {
        let v = null, e = null;
        if (c.stat) { v = this._stat(c.stat, CAL[p]); e = c.stat; if (v != null) v *= nb(c.facteur ?? 1, 1); }
        else if (c[p]) { e = c[p]; v = this._num(e); if (v != null) v *= nb(c.facteur ?? 1, 1); }
        return `<td${e ? ` class="e" data-e="${esc(e)}"` : ""}>${v == null ? `<span class="vide">—</span>` : esc(fmt(v, c.decimales ?? 2))}</td>`;
      };
      return ouvre(`${this._tete(w, "mdi:table-clock")}<table class="w-table"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c.nom || "")}${c.unite ? `<br>${esc(c.unite)}` : ""}</th>`).join("")}</tr></thead>
        <tbody>${per.map((p) => `<tr><td>${esc(NOMS[p] || p)}</td>${cols.map((c) => cell(c, p)).join("")}</tr>`).join("")}</tbody></table>${w.note ? `<div class="w-note">${esc(w.note)}</div>` : ""}`);
    }
    if (w.type === "climat") return ouvre(this._climat(w));
    if (w.type === "thermostat") return ouvre(this._wThermostat(w, id));
    if (w.type === "commande") return ouvre(this._wCommande(w, id));
    if (w.type === "serrure") return ouvre(this._wSerrure(w, id));
    return ouvre(`${this._tete(w, "mdi:help-circle-outline")}<div class="w-note">${_t("Type de widget inconnu : {type}", { type: esc(w.type) })}</div>`);
  }

  // climat des pièces : température et humidité de chaque pièce, tendance sur `duree` minutes (historique HA),
  // alerte si la variation est trop forte (ou hors des bornes absolues, si elles sont réglées)
  _climat(w) {
    // écart signé, arrondi à l'affichage : « ±0 » quand l'arrondi est nul (jamais « +0° » ni « −0 % »)
    const ecart = (d, genre) => { if (d == null) return ""; const k = genre === "t" ? 10 : 1, r = Math.round(d * k) / k; return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${fmt(Math.abs(r), genre === "t" ? 1 : 0)}${genre === "t" ? "°" : globalThis.MaquetteI18n.pct()}`; };
    const duree = Math.max(5, Math.min(240, nb(w.duree, 30))), choix = Array.isArray(w.pieces) && w.pieces.length ? w.pieces : null, vus = new Set();
    const pieces = this._config.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite) && (choix ? choix.includes(p.nom) : w.dehors !== false || !p.dehors))
      .filter((p) => { const k = `${p.temperature}|${p.attribut_temperature}|${p.humidite}|${p.attribut_humidite}`; if (vus.has(k)) return false; vus.add(k); return true; }); // même capteur = une ligne
    let alertes = 0;
    const mesure = (e, attr, genre) => {
      const v = this._num(e, attr);
      if (v == null) return `<span class="m vide">—</span>`;
      const stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2), seuil = nb(genre === "t" ? w.alerte_t : w.alerte_h, genre === "t" ? 1.5 : 10);
      const h = attr ? null : this._histo(e, duree / 60), depart = h?.pts?.length ? h.pts[0][1] : null, d = depart == null ? null : v - depart;
      const bas = nb(genre === "t" ? w.t_min : w.h_min, -Infinity), haut = nb(genre === "t" ? w.t_max : w.h_max, Infinity);
      const fort = (d != null && Math.abs(d) >= seuil) || v < bas || v > haut;
      if (fort) alertes++;
      const sens = d == null ? "" : d > stable ? "monte" : d < -stable ? "descend" : "stable";
      const ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
      const unite = genre === "t" ? " °C" : globalThis.MaquetteI18n.pct(), dt = ecart(d, genre);
      const titre = `${sens ? _t("{sens} sur {n} min ({ecart})", { sens: { monte: _t("En hausse"), descend: _t("En baisse"), stable: _t("Stable") }[sens], n: duree, ecart: dt }) : _t("Tendance indisponible")}${fort ? _t(" · variation forte") : ""}`;
      return `<span class="m ${sens}${fort ? " alerte" : ""}" data-e="${esc(e)}" title="${esc(titre)}">${esc(fmt(v, genre === "t" ? 1 : 0))}${unite}${ic ? `<ha-icon icon="${fort ? "mdi:alert" : ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
    };
    let lignes = pieces.map((p) => `<span class="n">${esc(p.nom)}</span>${p.temperature ? mesure(p.temperature, p.attribut_temperature, "t") : "<span></span>"}${p.humidite ? mesure(p.humidite, p.attribut_humidite, "h") : "<span></span>"}`).join("");
    if (w.moyenne) {
      // moyenne des pièces intérieures : valeur moyenne et écart moyen sur la durée (pièces dont la tendance est connue)
      const moy = (genre) => {
        const v = [], d = [];
        for (const p of pieces) {
          const e = genre === "t" ? p.temperature : p.humidite, at = genre === "t" ? p.attribut_temperature : p.attribut_humidite;
          if (p.dehors || !e) continue;
          const x = this._num(e, at); if (x == null) continue; v.push(x);
          const h = at ? null : this._histo(e, duree / 60); if (h?.pts?.length) d.push(x - h.pts[0][1]);
        }
        if (!v.length) return `<span class="m vide">—</span>`;
        const m = v.reduce((s, x) => s + x, 0) / v.length, dm = d.length ? d.reduce((s, x) => s + x, 0) / d.length : null, stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2);
        const sens = dm == null ? "" : dm > stable ? "monte" : dm < -stable ? "descend" : "stable", ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
        const dt = ecart(dm, genre);
        return `<span class="m ${sens}">${esc(fmt(m, genre === "t" ? 1 : 0))}${genre === "t" ? " °C" : globalThis.MaquetteI18n.pct()}${ic ? `<ha-icon icon="${ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
      };
      lignes = `<span class="n moy">${_t("Moyenne intérieure")}</span>${moy("t")}${moy("h")}` + lignes;
    }
    return `${this._tete(w, "mdi:home-thermometer-outline", alertes ? `<span class="w-alerte"><ha-icon icon="mdi:alert"></ha-icon>${alertes}</span>` : `${duree} min`)}
      ${pieces.length ? `<div class="w-climat">${lignes}</div>` : `<div class="w-note">${_t("Aucune pièce n'a de capteur de température ou d'humidité.")}</div>`}`;
  }

  // thermostat (climate) : température mesurée, consigne réglable (−/+ au pas de l'appareil, entre ses bornes), action en cours, mode
  _wThermostat(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:thermostat")}<div class="w-note">${_t("Choisis le thermostat (entité climate).")}</div>`;
    const s = this._etat(w.entite), a = s?.attributes || {}, indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const cons = nb(a.temperature, NaN), mes = nb(a.current_temperature, NaN), pas = nb(a.target_temp_step, 0.5) || 0.5;
    const ACTION = { heating: [_t("Chauffe"), "#e8710a"], cooling: [_t("Refroidit"), "#1a73e8"], idle: [_t("Au repos"), ""], off: [_t("Arrêté"), ""], drying: [_t("Déshumidifie"), ""], fan: [_t("Ventile"), ""] };
    // valeurs d'attributs traduites par HA (préréglage « manual », action inconnue de la table) ; brutes sans traduction
    // préréglages courants que HA ne traduit pas pour toutes les intégrations (Zigbee2MQTT : « manual »…)
    const PRESET = { manual: _t("Manuel"), eco: _t("Éco"), comfort: _t("Confort"), away: _t("Absence"), home: _t("Présence"), sleep: _t("Sommeil"), boost: _t("Boost"), activity: _t("Activité"), holiday: _t("Vacances"), schedule: _t("Programme"), program: _t("Programme"), auto: _t("Auto") };
    const attr = (k) => {
      if (a[k] == null || a[k] === "") return "";
      const brut = String(a[k]), v = this._hass.formatEntityAttributeValue?.(s, k) ?? brut;
      return k === "preset_mode" && v === brut && PRESET[brut.toLowerCase()] ? PRESET[brut.toLowerCase()] : v;
    };
    const [act, coul] = ACTION[a.hvac_action] || [attr("hvac_action"), ""];
    const bouton = (k, ic, nom) => `<button class="ib th-b" data-th="${k}"${indispo || isNaN(cons) ? ` aria-disabled="true"` : ""} aria-label="${nom}" title="${nom}"><ha-icon icon="${ic}"></ha-icon></button>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, "mdi:thermostat", act ? `<span class="pastille forte" style="--p-couleur:${coul || "var(--md-surface-container-high)"};--p-texte:${coul ? "#fff" : "var(--md-on-surface)"}">${esc(act)}</span>` : "")}
      <div class="w-th" data-te="${esc(w.entite)}" data-ti="${esc(id)}"${w.confirmer === true ? ` data-cf="1"` : ""}>
        <div class="mes" data-e="${esc(w.entite)}"><small>${_t("Mesurée")}</small><b>${isNaN(mes) ? "—" : esc(fmt(mes, 1))}<small> °C</small></b></div>
        <div class="cons">${bouton("moins", "mdi:minus", _t("Baisser la consigne"))}<div><small>${_t("Consigne")}</small><b>${isNaN(cons) ? "—" : esc(fmt(cons, pas < 1 ? 1 : 0))}<small> °C</small></b></div>${bouton("plus", "mdi:plus", _t("Monter la consigne"))}</div>
        <div class="mode"><small>${esc(indispo ? _t("Indisponible") : [this._hass.formatEntityState?.(s) ?? s.state, a.preset_mode && a.preset_mode !== "none" ? attr("preset_mode") : ""].filter(Boolean).join(" · "))}</small></div>
      </div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // −/+ de la consigne : climate.set_temperature sur le thermostat du widget (présent dans la config), bornée par l'appareil
  _reglerThermostat(btn) {
    const box = btn.closest(".w-th"), e = box?.dataset.te, s = this._etat(e);
    if (this._editeur || !e?.startsWith("climate.") || !s || btn.getAttribute("aria-disabled") === "true") return;
    const c = this._config, ok = new Set(), voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => { if (w?.type === "thermostat" && typeof w.entite === "string") ok.add(w.entite); });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    if (!ok.has(e)) return;
    const a = s.attributes, pas = nb(a.target_temp_step, 0.5) || 0.5, cons = nb(a.temperature, NaN);
    if (isNaN(cons)) return;
    const v = Math.max(nb(a.min_temp, 5), Math.min(nb(a.max_temp, 35), Math.round((cons + (btn.dataset.th === "plus" ? pas : -pas)) / pas) * pas));
    this._appeler("climate", "set_temperature", { entity_id: e, temperature: +v.toFixed(2) }, undefined, { forcer: box.dataset.cf === "1", libelle: btn.getAttribute("aria-label") || "" }).catch(() => {});
  }

  // commande d'une cover (volet, store, portail, porte de garage) : état, position, Ouvrir / Stop / Fermer ;
  // `confirmer` (par défaut pour garage, portail et porte) : le premier appui arme le bouton 4 s, le second lance l'action
  _wCommande(w, id) {
    const s = this._etat(w.entite), dc = s?.attributes.device_class, pos = s?.attributes.current_position;
    const ouvert = !!s && !["closed", "unavailable", "unknown"].includes(s.state), ic = ((w.entite || "").startsWith("valve.") ? ["mdi:valve-closed", "mdi:valve-open"] : ICONES_COVER[dc] || ICONES_COVER._)[ouvert ? 1 : 0];
    const conf = typeof w.confirmer === "boolean" ? w.confirmer : CONFIRMER_COVER.includes(dc) || (w.entite || "").startsWith("valve."), indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const f = s?.attributes.supported_features, sans = (bit) => typeof f === "number" && !(f & bit); // OPEN 1, CLOSE 2, STOP 8
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "";
    const bouton = (k, bit) => {
      if (sans(bit)) return "";
      const [, cleNom, icone] = COMMANDES[k], nom = _t(cleNom);
      return `<button class="cta" data-cmd="${k}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    if (!w.entite) return `${this._tete(w, "mdi:window-shutter")}<div class="w-note">${_t("Choisis la cover à commander (volet, portail, porte de garage…).")}</div>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic, pos != null ? `${fmt(pos, 0)}${globalThis.MaquetteI18n.pct()}` : "")}
      <div class="w-cmd" data-ce="${esc(w.entite)}" data-ci="${esc(id)}"${conf ? ` data-cf="1"` : ""}>
        <div class="w-grand" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? s.state : _t("Indisponible"))}${conf ? `<small><ha-icon icon="mdi:shield-check-outline" title="${_t("Action confirmée avant d'être lancée")}"></ha-icon></small>` : ""}</div>
        ${pos != null ? `<div class="w-pos" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${esc(pos)}" aria-label="${_t("Position")}"><i style="width:${Math.max(0, Math.min(100, nb(pos)))}%"></i></div>` : ""}
        <div class="w-cmd-btns">${bouton("ouvrir", 1)}${bouton("stop", 8)}${bouton("fermer", 2)}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // serrure (lock) : état et l'action utile — Déverrouiller si verrouillée, Verrouiller si ouverte, les deux si l'état est
  // incertain (bloquée, en cours, inconnu) — plus Ouvrir si la serrure sait ouvrir la porte ;
  // `confirmer` : true = tous les boutons en deux appuis, false = aucun, absent = Déverrouiller et Ouvrir seulement
  _wSerrure(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:lock")}<div class="w-note">${_t("Choisis la serrure (entité lock).")}</div>`;
    const s = this._etat(w.entite), st = s?.state, indispo = !s || ["unavailable", "unknown"].includes(st), f = s?.attributes.supported_features;
    const ic = st === "jammed" ? "mdi:lock-alert" : st === "locked" ? "mdi:lock" : st === "locking" || st === "unlocking" ? "mdi:lock-clock" : "mdi:lock-open-variant";
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "", alerte = st === "jammed" || st === "unlocked" || st === "open";
    const bouton = (k) => {
      const [cleNom, icone] = COMMANDES_SERRURE[k], nom = _t(cleNom);
      // déverrouiller et ouvrir sont toujours confirmés (services sensibles) ; `confirm: true` ajoute verrouiller
      const cf = k !== "verrouiller" || w.confirmer === true;
      return `<button class="cta" data-cmd="${k}" data-cf="${cf ? 1 : 0}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic)}
      <div class="w-cmd w-serrure" data-ce="${esc(w.entite)}" data-ci="${esc(id)}">
        <div class="w-grand${alerte ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? st : _t("Indisponible"))}</div>
        <div class="w-cmd-btns">${st !== "locked" ? bouton("verrouiller") : ""}${!["unlocked", "open"].includes(st) ? bouton("deverrouiller") : ""}${typeof f === "number" && f & 1 && st !== "open" ? bouton("ouvrir") : ""}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // ligne « Activer » d'une liste : scène, script ou bouton de la config (scene.turn_on, script.turn_on, button.press)
  _activer(btn) {
    const e = btn.dataset.active, dom = (e || "").split(".")[0];
    if (this._editeur || !Object.hasOwn(ACTIVABLES, dom) || btn.getAttribute("aria-disabled") === "true") return;
    this._appeler(dom, ACTIVABLES[dom], { entity_id: e }, undefined, { forcer: btn.dataset.cf === "1", libelle: btn.textContent.trim() }).then((fait) => {
      if (fait && btn.isConnected) { btn.classList.add("fait"); setTimeout(() => btn.classList.remove("fait"), 1200); }
    }).catch(() => {});
  }

  // entités commandables : celles des widgets `commande` de la config (panneaux de la maison et des pièces, fiches)
  _entitesCommande() {
    const c = this._config, l = new Set();
    const voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => {
      if (typeof w?.entite !== "string") return;
      if ((w.type === "commande" && /^(cover|valve)\./.test(w.entite)) || (w.type === "serrure" && w.entite.startsWith("lock."))) l.add(w.entite);
    });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    return l;
  }

  // appui sur Ouvrir / Stop / Fermer (cover.open_cover…, valve.open_valve…) ou Verrouiller / Déverrouiller / Ouvrir (lock.lock…)
  // sur l'entité du widget, rien d'autre
  _lancerCommande(btn) {
    const box = btn.closest(".w-cmd"), k = btn.dataset.cmd, e = box?.dataset.ce, id = box?.dataset.ci, dom = (e || "").split(".")[0];
    const service = Object.hasOwn(SERVICES_CMD, dom) && Object.hasOwn(SERVICES_CMD[dom], k) ? SERVICES_CMD[dom][k] : null;
    if (this._editeur || !service || !id || btn.getAttribute("aria-disabled") === "true" || !this._entitesCommande().has(e)) return;
    const R = this.shadowRoot, focus = R.activeElement === btn;
    const rendre = () => { this._widgets(); if (focus) R.querySelector(`.w-cmd[data-ci="${globalThis.CSS.escape(id)}"] [data-cmd="${k}"]`)?.focus(); };
    if (this._erreurCmd?.id === id) this._erreurCmd = null;
    // confirmation (dialogue) : `confirm` du widget, garage / portail / porte et vannes par défaut, et toujours pour un service sensible
    this._appeler(dom, service, { entity_id: e }, undefined, { forcer: (btn.dataset.cf ?? box.dataset.cf) === "1", libelle: btn.textContent.trim() }).then(rendre, (x) => {
      this._erreurCmd = { id, msg: String(x?.message || x) };
      setTimeout(() => { if (this._erreurCmd?.id === id) { this._erreurCmd = null; this._widgets(); } }, 8000);
      this._widgets();
    });
  }

  // réponses de HA (statistiques, historique) : les widgets sont redessinés une fois pour toutes les réponses arrivées ensemble
  // (une requête par courbe ou statistique, envoyées au même rendu) au lieu d'une fois par réponse
  _widgetsBientot() {
    if (this._wBientot) return;
    this._wBientot = setTimeout(() => { this._wBientot = null; this._widgets(); }, 40);
  }

  // statistiques HA (variation sur la période calendaire : jour, semaine, mois, année), en cache 5 min
  _stat(id, periode) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${periode}`, c = (this._cacheStat ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        (this._cacheStat[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 });
        this._hass.callWS({ type: "recorder/statistic_during_period", statistic_id: id, calendar: { period: periode }, types: ["change"] })
          .then((r) => { this._cacheStat[cle] = { v: r?.change ?? null, t: Date.now() }; this._widgetsBientot(); })
          .catch(() => { this._cacheStat[cle] = { v: null, t: Date.now() }; });
      }
    }
    return c?.v ?? null;
  }

  // historique récent pour les courbes, en cache 5 min
  _histo(id, heures) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${heures}`, c = (this._cacheHisto ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        this._cacheHisto[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 };
        const debut = new Date(Date.now() - heures * 3600e3).toISOString();
        this._hass.callWS({ type: "history/history_during_period", start_time: debut, entity_ids: [id], minimal_response: true, no_attributes: true })
          .then((r) => {
            const pts = (r?.[id] || []).map((x) => [(x.lu ?? x.lc ?? 0) * 1000, parseFloat(x.s)]).filter((p) => !isNaN(p[1]));
            this._cacheHisto[cle] = { v: { pts, debut: Date.now() - heures * 3600e3 }, t: Date.now() };
            this._widgetsBientot();
          }).catch(() => { this._cacheHisto[cle] = { v: null, t: Date.now() }; });
      }
    }
    const v = c?.v;
    if (!v) return null;
    const n = this._num(id), pts = [...v.pts];
    if (n != null) pts.push([Date.now(), n]);
    return { pts, debut: v.debut };
  }

  _courbe({ pts, debut }) {
    if (pts.length < 2) return "";
    const W = 300, H = 56, fin = Date.now(), ys = pts.map((p) => p[1]);
    const mn = Math.min(...ys), mx = Math.max(...ys), dy = mx - mn || 1;
    const X = (t) => ((Math.max(t, debut) - debut) / (fin - debut)) * W, Y = (v) => H - 4 - ((v - mn) / dy) * (H - 8);
    let d = "", prev = null;
    for (const [tt, v] of pts) { d += prev == null ? `M${X(tt).toFixed(1)} ${Y(v).toFixed(1)}` : `H${X(tt).toFixed(1)}V${Y(v).toFixed(1)}`; prev = v; }
    d += `H${W}`;
    return `<svg class="w-courbe" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path class="a" d="${d}V${H}H${X(pts[0][0]).toFixed(1)}Z"/><path class="l" d="${d}"/></svg>`;
  }

  // interrupteur qui ressemble à un accès (porte, portail, garage…) : l'éditeur y présélectionne la confirmation
  static interrupteurAcces = interrupteurAcces;
  // entités de la pièce : celles placées dans son contour + celles de la pièce HA liée
  entitesPiece(pi) {
    const c = this._config, p = c.pieces[pi], l = new Set();
    for (const q of c.points || []) if (dansPoly(q.pos, p.poly)) [q.entite, q.actif, q.valeur].forEach((e) => e && l.add(e));
    for (const o of c.ouvertures || []) if (distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], p.poly) < 20) [...contactsDe(o), o.volet, o.entite].forEach((e) => e && l.add(e));
    entitesZone(this._hass, p.zone).forEach((e) => l.add(e));
    [p.temperature, p.humidite].forEach((e) => e && l.add(e));
    return [...l].filter((e) => e.includes(".") && this._hass.states[e]);
  }

  _actionsPiece(pi) {
    const p = this._config.pieces[pi], ents = this.entitesPiece(pi), dom = (e) => e.split(".")[0];
    const boutons = [];
    if (p.auto_actions !== false) {
      const lum = ents.filter((e) => dom(e) === "light");
      if (lum.length) {
        const allumees = lum.filter((e) => this._etat(e).state === "on").length;
        boutons.push(allumees ? { nom: lum.length > 1 ? _t("Éteindre tout") : _t("Éteindre"), icone: "mdi:lightbulb-off-outline", action: "light.turn_off", cibles: lum }
          : { nom: lum.length > 1 ? _t("Allumer tout") : _t("Allumer"), icone: "mdi:lightbulb-on-outline", action: "light.turn_on", cibles: lum, plein: true });
      }
      const vol = ents.filter((e) => dom(e) === "cover" && ["shade", "shutter", "blind", "curtain", "awning", "window"].includes(this._etat(e).attributes.device_class));
      if (vol.length) {
        // libellés courts (l'icône dit « volet »), texte complet en infobulle : les boutons tiennent sur une rangée
        boutons.push({ nom: _t("Ouvrir"), titre: vol.length > 1 ? _t("Ouvrir les volets") : _t("Ouvrir le volet"), icone: "mdi:window-shutter-open", action: "cover.open_cover", cibles: vol });
        boutons.push({ nom: _t("Fermer"), titre: vol.length > 1 ? _t("Fermer les volets") : _t("Fermer le volet"), icone: "mdi:window-shutter", action: "cover.close_cover", cibles: vol });
      }
    }
    for (const a of p.actions || []) {
      const d0 = (a.action || "").split(".")[0];
      const cibles = a.cible === "piece" ? (p.zone ? null : ents.filter((e) => d0 === "homeassistant" || dom(e) === d0)) : a.cible ? [a.cible] : null;
      boutons.push({ ...a, cibles, zone: a.cible === "piece" && p.zone ? p.zone : null });
    }
    const lie = this._lies(pi);
    // scènes liées en boutons ; les scripts restent listés (ils peuvent déclencher des alertes) : un appui ouvre leur fiche
    for (const e of lie.scene || []) {
      if ((p.actions || []).some((a) => a.cible === e)) continue;
      boutons.push({ nom: this._nom(e), icone: "mdi:palette-outline", action: "scene.turn_on", cibles: [e] });
    }
    return { boutons, automations: p.automatismes === false ? [] : [...(lie.automation || []), ...(lie.script || [])] };
  }

  // automatisations / scènes / scripts liés (search/related), en cache 10 min
  _lies(pi) {
    const p = this._config.pieces[pi], cle = `${pi}|${p.zone || ""}`, c = (this._cacheLies ||= {})[cle];
    if (!c || (Date.now() - c.t > 600000 && !c.enCours)) {
      this._cacheLies[cle] = { ...(c || { v: {} }), enCours: true, t: c?.t || 0 };
      const req = p.zone ? [{ item_type: "area", item_id: p.zone }] : this.entitesPiece(pi).slice(0, 20).map((e) => ({ item_type: "entity", item_id: e }));
      Promise.all(req.map((r) => this._hass.callWS({ type: "search/related", ...r }).catch(() => ({}))))
        .then((rs) => {
          const v = {};
          for (const r of rs) for (const k of ["automation", "scene", "script"]) for (const e of r[k] || []) (v[k] ||= new Set()).add(e);
          for (const k of Object.keys(v)) v[k] = [...v[k]].filter((e) => this._hass.states[e]).sort();
          this._cacheLies[cle] = { v, t: Date.now() };
          if (this._iso === pi) this._fiche();
        });
    }
    return c?.v || {};
  }

  // bouton d'une pièce : son service, confirmé par un dialogue s'il est sensible ou si le bouton a `confirm: true`
  _lancerAction(btn) {
    const b = this._boutons?.[+btn.dataset.cta];
    if (!b || typeof b.action !== "string" || !SERVICE_SUR.test(b.action)) return;
    const [domaine, service] = b.action.split(".");
    const cible = b.zone ? { area_id: b.zone } : b.cibles ? { entity_id: b.cibles } : undefined;
    const donnees = objetSimple(b.donnees) ? b.donnees : {};
    this._appeler(domaine, service, donnees, cible, { forcer: b.confirmer === true, libelle: b.nom }).then((fait) => {
      if (!fait || !btn.isConnected) return;
      btn.classList.remove("confirmer"); btn.classList.add("fait");
      setTimeout(() => btn.isConnected && btn.classList.remove("fait"), 1200);
    }).catch((e) => { btn.title = String(e?.message || e); btn.classList.add("confirmer"); });
  }

  // appel de service depuis le plan (jamais pendant l'édition) : un service sensible demande toujours une confirmation qui nomme
  // l'action réelle et les entités visées ; `forcer` la demande aussi pour un service sûr. Renvoie true si le service est parti.
  async _appeler(dom, svc, donnees = {}, cible, { forcer = false, libelle = "" } = {}) {
    if (this._editeur) return false;
    const ents = entitesAppel(this._hass, dom, donnees, cible);
    if ((forcer || serviceSensible(this._hass, dom, svc, ents)) && !(await this._confirmerService(dom, svc, donnees, ents, libelle))) return false;
    await this._hass.callService(dom, svc, donnees, cible);
    return true;
  }

  // dialogue de confirmation (MD3) : l'action réelle (verbe et service technique), les entités visées (nom et identifiant),
  // les clés des données envoyées (jamais leurs valeurs : un code reste caché) ; Annuler a le focus, Échap annule
  _confirmerService(dom, svc, donnees, ents, libelle) {
    const R = this.shadowRoot;
    R.querySelector("dialog.conf")?.close();
    const d = document.createElement("dialog");
    d.className = "conf";
    d.setAttribute("role", "alertdialog");
    d.setAttribute("aria-labelledby", "conf-t"); d.setAttribute("aria-describedby", "conf-d");
    const verbe = verbeService(dom, svc), cles = Object.keys(donnees || {}).filter((k) => k !== "entity_id" && k !== "area_id");
    const liste = ents === null ? `<p>${_t("Cibles : appareils ou zones (non détaillés).")}</p>`
      : ents.length ? `<ul>${ents.slice(0, 20).map((e) => `<li><b>${esc(this._nom(e))}</b><small>${esc(e)}</small></li>`).join("")}${ents.length > 20 ? `<li>${_t("… et {n} autres", { n: ents.length - 20 })}</li>` : ""}</ul>` : `<p>${_t("Sans entité visée.")}</p>`;
    const bouton = libelle && libelle !== verbe ? `<p>${_t("Bouton « {nom} »", { nom: esc(libelle) })}</p>` : "";
    poserHTML(d, `<ha-icon class="conf-ic" icon="mdi:shield-alert-outline"></ha-icon><h2 id="conf-t">${esc(_t("{action} ?", { action: verbe }))}</h2>
      <div id="conf-d">${bouton}<p>${_t("Service appelé : {service}", { service: `<code>${esc(`${dom}.${svc}`)}</code>` })}</p>${liste}
      ${cles.length ? `<p>${_t("Données envoyées : {cles}", { cles: esc(cles.join(", ")) })}</p>` : ""}</div>
      <div class="conf-actions"><button class="non" data-conf="non">${_t("Annuler")}</button><button class="oui" data-conf="oui">${esc(verbe)}</button></div>`);
    R.querySelector("ha-card").append(d);
    return new Promise((fin) => {
      let r = false;
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // jamais vers les clics de la carte ni de la fiche ouverte
        const b = ev.composedPath().find((n) => n.dataset?.conf);
        if (b) { r = b.dataset.conf === "oui"; d.close(); }
      });
      d.addEventListener("close", () => { d.remove(); fin(r); });
      d.showModal();
      d.querySelector(".non").focus();
    });
  }

  // édition : glisser-déposer des widgets pour les réordonner ou les changer de panneau
  // (souris : dès 5 px ; tactile : appui long, le défilement de la page reste possible sinon)
  _glisserWidgets(vue) {
    vue.addEventListener("pointerdown", (ev) => {
      if (!this._editeur || ev.button > 0) return;
      const w = ev.composedPath().find((n) => n.classList?.contains("w") && n.dataset?.w);
      if (!w) return;
      const R = this.shadowRoot, src = this._selWidget(w.dataset.w);
      const x0 = ev.clientX, y0 = ev.clientY, tactile = ev.pointerType === "touch";
      let actif = false, fantome = null, depot = null, cible = null, dx = 0, dy = 0;
      const bloquer = (e) => e.preventDefault();
      const viser = (x, y) => {
        let cont = null;
        for (const c of R.querySelectorAll(".col:not([hidden]) .widgets")) { const r = c.closest(".col").getBoundingClientRect(); if (x >= r.left - 24 && x <= r.right + 24) cont = c; }
        if (!cont) return null;
        const items = [...cont.children].filter((n) => (n.dataset.w || n.dataset.ajouter) && !n.classList.contains("w-fantome"));
        for (const n of items) {
          const r = n.getBoundingClientRect();
          if (y < r.top + r.height / 2) return n.dataset.ajouter ? { cote: n.dataset.ajouter, i: Infinity, avant: n } : { cote: n.dataset.w.split(":")[0], i: +n.dataset.w.split(":")[1], avant: n };
        }
        const der = items[items.length - 1];
        return { cote: der?.dataset.ajouter || der?.dataset.w?.split(":")[0] || (cont.closest(".col-g") ? "gauche" : "droite"), i: Infinity, avant: null, cont };
      };
      const demarrer = () => {
        actif = true;
        const r = w.getBoundingClientRect();
        dx = x0 - r.left; dy = y0 - r.top;
        fantome = w.cloneNode(true);
        fantome.classList.add("w-fantome"); fantome.classList.remove("sel");
        Object.assign(fantome.style, { width: `${r.width}px`, left: `${r.left}px`, top: `${r.top}px` });
        R.querySelector("ha-card").append(fantome);
        w.classList.add("glisse");
        depot = document.createElement("div"); depot.className = "w-depot";
        if (tactile) window.addEventListener("touchmove", bloquer, { passive: false });
      };
      const minuteur = tactile ? setTimeout(demarrer, 350) : null;
      const bouge = (e) => {
        if (!actif) {
          const d = Math.hypot(e.clientX - x0, e.clientY - y0);
          if (tactile) { if (d > 8) fin(); return; }
          if (d < 5) return;
          demarrer();
        }
        fantome.style.left = `${e.clientX - dx}px`; fantome.style.top = `${e.clientY - dy}px`;
        cible = viser(e.clientX, e.clientY);
        if (!cible) { depot.remove(); return; }
        const cont = cible.avant?.parentElement || cible.cont || R.querySelector(`.col-${cible.cote === "gauche" ? "g" : "d"} .widgets`);
        if (cible.avant) cont.insertBefore(depot, cible.avant); else cont.append(depot);
      };
      const fin = (e) => {
        clearTimeout(minuteur);
        window.removeEventListener("pointermove", bouge); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
        window.removeEventListener("touchmove", bloquer);
        if (!actif) return;
        fantome.remove(); depot.remove();
        R.querySelectorAll(".w.glisse").forEach((n) => n.classList.remove("glisse"));
        this._wDrag = true;
        setTimeout(() => { this._wDrag = false; }, 0);
        if (e?.type === "pointerup" && cible) this._editeur?.deplacerWidget(src, cible.cote, cible.i);
      };
      window.addEventListener("pointermove", bouge); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
    });
  }

  // « gauche:2 », « droite:0:3 » (pièce 3), « fiche:1:5 » (fiche du meuble 5), « fiche:1:5:ouverture » / « fiche:1:5:point » → sélection de l'éditeur
  _selWidget(k) { return deCle(`widget:${k}`); }

  set preview(v) { this._preview = v; this._majCrayon(); }
  get preview() { return this._preview; }
  set editMode(v) { this._editMode = v; this._majCrayon(); }
  get editMode() { return this._editMode; }
  _majCrayon() {
    const b = this.shadowRoot?.querySelector(".editer");
    if (b && this._config) b.hidden = !!this._editeur || this._config.edition === false || !this._hass?.user?.is_admin || this._apercu();
  }

  // aperçu du sélecteur de cartes ou dashboard en mode édition de HA : pas d'éditeur (HA réécrirait la config par-dessus)
  _apercu() {
    if (this._preview || this._editMode) return true;
    for (let n = this; n; ) {
      if (/^(hui-card-preview|hui-card-picker|hui-dialog-edit-card|hui-card-options|hui-card-edit-mode)$/i.test(n.tagName || "")) return true;
      n = n.parentElement || n.getRootNode?.().host || null;
    }
    return false;
  }

  // puces du résumé : liste personnalisée (`resume`), sinon les quatre puces d'origine
  _puces() {
    const r = this._config.resume;
    if (Array.isArray(r)) return r;
    return r === false ? [] : MaquetteCard.PUCES.map((p) => ({ ...p }));
  }

  // en replay, l'état d'une entité à l'instant choisi (historique), sinon l'état en direct
  _etat(e) { if (!e) return undefined; const r = this._rp?.pret ? this._rpEtat(e) : undefined; return r ?? this._hass.states[e]; }
  _maintenant() { return this._rp?.pret ? this._rp.t : Date.now(); }
  // état d'une ouverture : son contact, l'état combiné de ses contacts (ouverte dès que l'un l'est), ou son entité motorisée
  _etatOuverture(o) { const l = contactsDe(o); return l.length > 1 ? etatCombine(l.map((e) => this._etat(e))) : this._etat(l[0] || o?.entite); }
  _nom(e) { const s = this._etat(e); return s ? s.attributes.friendly_name || e : e; }
  _num(e, attr) { const s = this._etat(e); const v = s ? parseFloat(attr ? s.attributes[attr] : s.state) : NaN; return isNaN(v) ? null : v; }
  // « actif » d'une pastille (ou d'un meuble connecté) : état de `actif` (ou de l'entité), d'un attribut, ou au-dessus d'un seuil
  _actif(p) {
    const sa = this._etat(p.actif || p.entite), va = sa ? (p.actif_attribut ? sa.attributes[p.actif_attribut] : sa.state) : undefined;
    return va != null && (p.seuil != null && p.seuil !== "" ? parseFloat(va) > p.seuil : ACTIFS.has(va));
  }
  // valeur affichée : un attribut de l'entité, ou l'état numérique de `valeur` avec son unité
  _texteValeur(p) {
    const s = this._etat(p.entite);
    if (p.attribut && s) { const a = s.attributes[p.attribut]; return a != null ? `${typeof a === "number" ? fmt(a, p.decimales ?? 1) : typeof a === "string" ? this._hass.formatEntityAttributeValue?.(s, p.attribut) ?? a : a}${p.unite ?? ""}` : ""; }
    if (p.valeur) { const n = this._num(p.valeur), sv = this._etat(p.valeur); if (n != null) return `${fmt(n, p.decimales ?? 0)} ${p.unite ?? sv.attributes.unit_of_measurement ?? ""}`.trim(); }
    return consigneClimat(s, p, this._hass);
  }

  _maj() {
    const c = this._config, R = this.shadowRoot;
    const teinte = teinteTemp(c), EP = etiquettesPieces(c);
    // résumé : toute la maison (tous les étages, une entité comptée une fois ; classe-maison.js)
    const RS = this._resumeMaison(), ouvertes = RS.ouvertures.map((x) => x.nom), temps = RS.temperature.map((x) => x.t);
    const lumieres = RS.lumieres.length, voletsBas = RS.volets.length;

    c.pieces.forEach((p, i) => {
      const t = this._num(p.temperature, p.attribut_temperature), h = this._num(p.humidite, p.attribut_humidite);
      if (p.sous_zone) return;
      const poly = R.querySelector(`[data-p="${i}"]`);
      if (!p.dehors && poly) {
        const col = teinte && couleurTempEchelle(t, teinte);
        poly.style.fill = col ? `color-mix(in srgb, ${col} 28%, var(--md-surface))` : "var(--plan-sol)";
      }
      const etq = R.querySelector(`[data-l="${i}"] .val`);
      texteSi(etq, [t != null && EP.temperature ? `${fmt(t)} °C` : "", h != null && EP.humidite ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · "));
    });

    (c.ouvertures || []).forEach((o, i) => {
      // ouverture masquée (élément ou calque) : pas de dessin, mais elle compte toujours dans le résumé
      const g = R.querySelector(`[data-o="${i}"]`), ent = entOuv(o);
      const s = this._etatOuverture(o), cl = g?.classList;
      // classe d'état (une seule) : basculée seulement si elle change (remove + add réécrivait `class` à chaque passage)
      const ec = !ent ? "" : !s || ["unavailable", "unknown"].includes(s.state) ? "inconnu" : ["opening", "closing"].includes(s.state) ? "bouge" : s.state === "on" || s.state === "open" ? "ouvert" : "";
      for (const k of ["ouvert", "bouge", "inconnu"]) cl?.toggle(k, k === ec);
      let txt = o.nom || "";
      if (ent) {
        txt = _t("{nom} : {etat}", { nom: o.nom || this._nom(ent), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" });
      }
      if (o.volet) {
        const sv = this._etat(o.volet), v = R.querySelector(`[data-v="${i}"]`);
        let pos = sv ? sv.attributes.current_position : undefined;
        if (pos == null && sv) pos = sv.state === "closed" ? 0 : 100;
        if (v) {
          // en mouvement : visible tout de suite (un volet ouvert à 100 % est transparent), tirets dans le sens du mouvement
          const bouge = !!sv && ["opening", "closing"].includes(sv.state);
          v.classList.toggle("bouge", bouge); v.classList.toggle("monte", bouge && sv.state === "opening");
          v.style.opacity = bouge ? Math.max(0.85, 1 - (pos ?? 0) / 100) : pos == null ? 0.15 : Math.max(0, Math.min(1, 1 - pos / 100));
        }
        if (sv) txt += _t(" · volet {etat}", { etat: pos != null ? pos + globalThis.MaquetteI18n.pct() : sv.state });
      }
      if (g) texteSi(g.querySelector("title"), txt);
    });

    // bulles cachées (indisponibles ou inactives, selon `style_pastilles`) : plus dessinées ni cliquables ni lues ; toujours là en édition
    const st = stylePastilles(c), ed = !!this._editeur;
    (c.points || []).forEach((p, i) => {
      const b = R.querySelector(`[data-q="${i}"]`), s = this._etat(p.entite), actif = this._actif(p);
      const h = R.querySelector(`[data-h="${i}"]`);
      attrSi(h, "opacity", actif ? 1 : 0);
      if (h?.classList.contains("lampe") && actif) {
        const { rgb, force } = couleurLampe(s), col = rgb ? `rgb(${rgb.join(",")})` : "#ffd54f";
        R.querySelectorAll(`#halo-${i} stop`).forEach((st, n) => { attrSi(st, "stop-color", col); if (!n) attrSi(st, "stop-opacity", (0.75 * force).toFixed(3)); });
      }
      if (!b) return; // pastille masquée : elle compte toujours dans le résumé
      b.classList.toggle("actif", actif);
      b.classList.toggle("clair", actif && (p.clair ?? clairPour(p.couleur)));
      b.classList.toggle("alerte", actif && !!p.alerte);
      const indispo = !s || s.state === "unavailable";
      b.classList.toggle("indispo", indispo);
      b.classList.toggle("bs-cache", !ed && (indispo ? st.indisponible === "cache" : !actif && st.inactif === "actif_seul"));
      b.classList.toggle("bs-estompe", !ed && !indispo && !actif && st.inactif === "estompe");
      texteSi(b.querySelector(".v"), this._texteValeur(p));
      titreSi(b, _t("{nom} : {etat}", { nom: p.nom || this._nom(p.entite), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" }));
    });

    // meubles connectés : classes et badge seulement (pas de reconstruction du plan) ; un meuble dont les états n'ont pas changé est sauté
    for (const x of this._mbs || []) {
      const { m, g, b } = x, etats = [m.entite, m.valeur, m.actif].map((e) => this._etat(e));
      if (x.prec && etats.every((v, j) => v === x.prec[j])) continue;
      x.prec = etats;
      const e = m.entite || m.valeur, s = this._etat(e), indispo = !!e && (!s || s.state === "unavailable");
      const actif = !indispo && !!(m.actif || m.entite || (m.valeur && m.seuil != null)) && this._actif({ ...m, actif: m.actif || m.entite || m.valeur });
      g?.classList.toggle("actif", actif); g?.classList.toggle("indispo", indispo);
      if (!b) continue;
      const v = this._texteValeur(m), etat = s ? this._hass.formatEntityState?.(s) ?? s.state : e ? _t("indisponible") : "";
      b.classList.toggle("actif", actif); b.classList.toggle("clair", actif && clairPour(m.couleur));
      b.querySelector(".v").textContent = v;
      const nom = m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble")), txt = [nom, m.entite ? etat : "", v].filter(Boolean).join(" · ");
      b.title = txt;
      if (b.tagName === "BUTTON") b.setAttribute("aria-label", txt);
    }

    this._widgets();
    const fv = R.querySelector(".fiche").hidden;
    this._fiche();
    if (fv !== R.querySelector(".fiche").hidden) this._mise();

    const tete = R.querySelector(".tete");
    // pendant le glisser d'une puce, le résumé n'est pas redessiné (la puce saisie resterait sinon détachée)
    if (tete && !tete.hidden && !this._glissePuce) {
      const moy = temps.length ? fmt(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
      const es = this._editeur?.sel, selP = es?.type === "puce" ? es.i : null, ed = !!this._editeur;
      const puce = (i, ic, txt, opt = {}) => `<span class="chip${opt.alerte ? " alerte" : ""}${selP === i ? " sel" : ""}" data-puce="${i}"${opt.e && !ed ? ` data-e="${esc(opt.e)}"` : ""}${opt.title ? ` title="${esc(opt.title)}"` : ""}><ha-icon icon="${esc(ic)}"></ha-icon><span>${txt}</span></span>`;
      // « afficher » : toujours (défaut), seulement quand personne n'est là (absent) ou quand quelqu'un est là (present) ;
      // présence = `presence` (défaut zone.home : nombre de personnes à la maison, ou état home / on d'une personne / d'un groupe)
      const quelquun = (e) => this._quelquun(e);
      const L = this._puces(), parts = L.map((p, i) => {
        if (!ed && (p.afficher === "absent" || p.afficher === "present")) { const q = quelquun(p.presence); if (q != null && q === (p.afficher === "absent")) return ""; }
        if (p.type === "ouvertures") return puce(i, p.icone || `mdi:${ouvertes.length ? "window-open-variant" : "window-closed-variant"}`,
          ouvertes.length ? _t("<b>{n}</b> ouverte : {liste}|<b>{n}</b> ouvertes : {liste}", { n: ouvertes.length, liste: esc(ouvertes.join(", ")) }) : _t("Tout est fermé"), { alerte: ouvertes.length, title: ouvertes.join(", ") });
        if (p.type === "lumieres") return puce(i, p.icone || `mdi:lightbulb${lumieres ? "-on" : "-outline"}`, _t("<b>{n}</b> lumière|<b>{n}</b> lumières", { n: lumieres }));
        if (p.type === "volets") return puce(i, p.icone || "mdi:window-shutter", _t("<b>{n}</b> volet baissé|<b>{n}</b> volets baissés", { n: voletsBas }));
        if (p.type === "temperature") return moy || ed ? puce(i, p.icone || "mdi:home-thermometer-outline", _t("<b>{t} °C</b> à l'intérieur", { t: moy ?? "—" })) : "";
        if (p.type === "entite") {
          const st = this._etat(p.entite);
          if (!ed && (!st || (p.masquer_si != null && p.masquer_si !== "" && st.state === String(p.masquer_si)))) return "";
          const n = this._num(p.entite), v = p.entite ? this._val(p.entite, p.decimales, p.unite) : { t: "—", u: "" };
          const alerte = st && ((p.alerte_etat != null && p.alerte_etat !== "" && st.state === String(p.alerte_etat)) || (p.alerte_au_dessus != null && p.alerte_au_dessus !== "" && n != null && n > +p.alerte_au_dessus));
          const val = n == null && st ? esc(this._hass.formatEntityState?.(st) ?? st.state) : `${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}`;
          return puce(i, p.icone || (st?.attributes.icon) || "mdi:information-outline", `<b>${val}</b>${p.nom !== "" ? ` ${esc(p.nom ?? (p.entite ? this._nom(p.entite) : _t("Choisir une entité")))}` : ""}`, { alerte, e: p.entite });
        }
        return "";
      });
      // `ligne: true` : la puce commence une nouvelle ligne ; `sous: true` : elle se range sous la puce précédente (pile)
      const ajout = ed ? `<button class="chip ajout" data-ajouter-puce title="${_t("Ajouter une puce au résumé")}"><ha-icon icon="mdi:plus"></ha-icon><span>${_t("Puce")}</span></button>` : "";
      const struct = L.some((p) => p.ligne || p.sous);
      tete.classList.toggle("lignes", struct);
      let html;
      if (!struct) html = parts.join("") + ajout;
      else {
        const lignes = [];
        let lg = null, pile = null;
        L.forEach((p, i) => {
          if (!lg || (p.ligne && !p.sous)) { lg = []; lignes.push(lg); pile = null; }
          if (!pile || !p.sous) { pile = []; lg.push(pile); }
          pile.push(parts[i]);
        });
        const rendu = lignes.map((l) => l.map((pl) => pl.filter(Boolean)).filter((pl) => pl.length));
        if (ajout) (rendu[rendu.length - 1] ||= []).push([ajout]);
        html = rendu.filter((l) => l.length).map((l) => `<div class="tete-l">${l.map((pl) => (pl.length > 1 ? `<div class="pile">${pl.join("")}</div>` : pl[0])).join("")}</div>`).join("");
      }
      // même résumé qu'au passage précédent : rien n'est reconstruit (hors édition, où les puces se déplacent à la main)
      if (ed || tete._html !== html) { poserHTML(tete, html); tete._html = ed ? null : html; }
    }
    this._majInfos();
    this._majTraces();
    this._majAmbiance();
    this._majFlux();
    this._majPersonnes();
    this._majAlertes();
    this._majPastillesEtages();
    this._brancherResume();
    // les pastilles changent de largeur avec leur valeur : les étiquettes recouvertes sont replacées (une fois par image)
    cancelAnimationFrame(this._rafEvite);
    this._rafEvite = requestAnimationFrame(() => this._eviterPastilles());
  }

  // zones d'informations : nom (sinon celui de l'entité), icône (sinon selon le type de mesure), valeur avec son unité
  _majInfos() {
    const R = this.shadowRoot, T = this._config.textes || [];
    R?.querySelectorAll(".calque>.infob").forEach((b) => {
      const t = T[+b.dataset.t];
      b.querySelectorAll(".ib-l").forEach((ln) => {
        const l = t?.infos?.[+ln.dataset.ibl] || {}, s = this._etat(l.entite), dc = s?.attributes.device_class;
        texteSi(ln.querySelector(".ib-n"), l.nom ?? (s ? s.attributes.friendly_name || l.entite : l.entite || ""));
        const parAttr = /temp/i.test(l.attribut || "") ? "temperature" : /humid/i.test(l.attribut || "") ? "humidity" : null;
        if (!l.icone) attrSi(ln.querySelector("ha-icon"), "icon", (parAttr && ICONES_MESURE[parAttr]) || s?.attributes.icon || ICONES_MESURE[dc] || "mdi:information-outline");
        let v = "—";
        if (s && l.attribut) { const a = s.attributes[l.attribut]; v = a == null ? "—" : `${typeof a === "number" ? fmt(a, l.decimales ?? 1) : a}${l.unite ? ` ${l.unite}` : ""}`; }
        else if (s && !isNaN(parseFloat(s.state))) { const x = this._val(l.entite, l.decimales, l.unite); v = `${x.t}${globalThis.MaquetteI18n.unite(x.u)}`; }
        else if (s) v = this._hass.formatEntityState?.(s) ?? s.state;
        texteSi(ln.querySelector(".ib-v"), v);
        ln.classList.toggle("indispo", !s || s.state === "unavailable");
      });
    });
  }

  // présence à la maison : `presence` (défaut : `presence` de la carte, sinon zone.home : nombre de personnes, ou état home / on d'une personne / d'un groupe) ; null = inconnue
  _quelquun(e) { const s = this._etat(e || presenceDefaut(this._config)); if (!s) return null; const n = parseFloat(s.state); return isNaN(n) ? ["home", "on", "true"].includes(s.state) : n > 0; }

  // ---------- flux d'énergie ----------
  _majFlux() {
    const R = this.shadowRoot, c = this._config, E = coucheEnergie(c.ambiance), g = R?.querySelector(".zone svg .flux");
    if (!E || !g) return;
    const M = c.meubles || [], src = typeof E.source === "number" ? M[E.source] : M.find((m) => m.type === (E.source || "tableau_elec"));
    const l = [], seuil = +(E.seuil ?? 5), couleur = (x) => couleurSure(x);
    const ajoute = (o) => {
      if (!src?.pos || o === src || !Array.isArray(o.pos)) return;
      // puissance : la première de valeur / actif / entite exprimée en W ou kW
      const w = [o.valeur, o.actif, o.entite].map((e) => (typeof e === "string" ? enWatts(this._etat(e)) : null)).find((x) => x != null);
      if (w == null || w < seuil) return;
      l.push({ de: src.pos.map(nb), vers: o.pos.map(nb), w, col: couleur(E.couleur) || couleur(o.couleur) || COULEURS_TYPE[o.type] || "#fbc02d" });
    };
    M.forEach(ajoute);
    if (E.pastilles !== false) (c.points || []).forEach(ajoute);
    const cle = l.map((x) => `${x.vers}|${Math.round(Math.log2(x.w + 1) * 2)}|${x.col}`).join(";");
    if (cle === this._fluxCle) return;
    this._fluxCle = cle;
    const b = this._box;
    poserHTML(g, dessinFlux(l, Math.max(b.W, b.H) * 0.0045, this._sansBoucles()));
    this._billes();
  }
  // billes des flux (plan et vitrine) : 10 positions par seconde (minuterie de 100 ms) au lieu d'une animation SMIL redessinée à chaque
  // image de l'écran ; même trajet (le chemin du flux, parcouru à vitesse constante) et même vitesse. Horloge propre, arrêtée pendant la
  // pause (plan hors de la vue, page cachée : _pauseAnimations) : les billes repartent d'où elles étaient. Niveau réduit / mouvement
  // réduit : pas de billes
  _billes() {
    const R = this.shadowRoot, l = R ? R.querySelectorAll(".zone svg circle.bille") : [];
    if (!l.length || this._enPause || !this.isConnected) { clearInterval(this._tmBilles); this._tmBilles = 0; this._tbDer = null; return; }
    const pas = () => {
      const t0 = performance.now();
      if (this._tbDer != null) this._tb = (this._tb || 0) + Math.min(1000, Math.max(0, t0 - this._tbDer));
      this._tbDer = t0;
      const t = (this._tb || 0) / 1000;
      for (const c of R.querySelectorAll(".zone svg circle.bille")) {
        const p = c.parentNode.firstElementChild, d = +c.dataset.dur;
        if (!(d > 0) || !p?.getPointAtLength) continue;
        const L = (c._L ??= p.getTotalLength()), q = p.getPointAtLength((((t + +c.dataset.dec) / d) % 1) * L);
        attrSi(c, "cx", q.x.toFixed(1)); attrSi(c, "cy", q.y.toFixed(1));
      }
    };
    pas();
    if (!this._tmBilles) this._tmBilles = setInterval(() => (this.isConnected && !this._enPause ? pas() : this._billes()), 100);
  }

  // ---------- personnes ----------
  _listePersonnes(A) {
    const P = couchePersonnes(A);
    if (!P) return [];
    return P.liste || Object.keys(this._hass?.states || {}).filter((e) => e.startsWith("person.")).sort().map((e) => ({ entite: e }));
  }
  _htmlPersonnes(A) {
    const P = couchePersonnes(A);
    return this._listePersonnes(A).map((p) => {
      const s = this._etat(p.entite), nom = s?.attributes.friendly_name || p.entite.split(".")[1], pic = s?.attributes.entity_picture;
      const ini = initiales(nom);
      // `avatar` : photo du profil HA si elle existe, sinon les initiales (défaut) ; `initiales` : toujours les initiales
      const url = affPersonne(P, p.entite).avatar === "photo" && typeof pic === "string" && /^\/(?![/\\])/.test(pic) ? (this._hass.hassUrl ? this._hass.hassUrl(pic) : pic) : null; // photo servie par HA seulement
      return `<button class="pers" data-pers="${esc(p.entite)}" data-e="${esc(p.entite)}" aria-label="${esc(nom)}"><span class="av">${url ? `<img src="${esc(url)}" alt="">` : esc(ini)}</span><small></small></button>`;
    }).join("");
  }
  // point de rassemblement à la maison : `maison` ([x, y] ou nom de pièce), sinon le centre des pièces intérieures
  _pointMaison() {
    const c = this._config, m = couchePersonnes(c.ambiance)?.maison;
    if (Array.isArray(m) && m.length === 2) return m.map(nb);
    const pc = typeof m === "string" ? c.pieces.find((x) => x.nom === m) : null;
    if (pc?.etiquette) return pc.etiquette;
    const l = (pc ? [pc] : c.pieces.filter((p) => !p.dehors && !p.sous_zone)).flatMap((p) => p.poly || []);
    if (!l.length) { const b = this._box; return [b.x0 + b.W / 2, b.y0 + b.H / 2]; }
    const xs = l.map((q) => q[0]), ys = l.map((q) => q[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  // à la maison : côte à côte au point de rassemblement (suit le zoom) ; dehors : au bord du plan, dans la direction réelle
  // (depuis les coordonnées de HA, avec `nord`), grisé, avec la distance ou le nom de la zone ; le passage de l'un à l'autre glisse.
  // Réglages (`dehors`, `chez_soi`, communs ou par personne) : dehors en rangée discrète en bas du plan avec la zone (`zone`),
  // ou caché (`cache`, à la maison comme dehors) : plus dessiné, ni cliquable, ni lu
  _majPersonnes() {
    const R = this.shadowRoot, A = this._config.ambiance, l = [...(R?.querySelectorAll(".calque>.pers[data-pers]") || [])];
    if (!l.length || this._glissePers) return; // pendant un glisser des avatars (éditeur), leur place suit le pointeur
    const q = this.vue(), mz = this._pointMaison(), nord = +A?.nord || 0, cf = this._hass.config || {}, P = couchePersonnes(A);
    const aff = new Map(l.map((el) => [el, affPersonne(P, el.dataset.pers)]));
    const tousChez = l.filter((el) => this._etat(el.dataset.pers)?.state === "home"), tousDehors = l.filter((el) => !tousChez.includes(el));
    const chez = tousChez.filter((el) => aff.get(el).chez_soi !== "cache"), dehors = tousDehors.filter((el) => aff.get(el).dehors === "direction");
    const rangee = tousDehors.filter((el) => aff.get(el).dehors === "zone");
    l.forEach((el) => {
      const s = this._etat(el.dataset.pers), nom = s?.attributes.friendly_name || el.dataset.pers, pt = el.querySelector("small");
      const home = tousChez.includes(el), a = aff.get(el), cache = home ? a.chez_soi === "cache" : a.dehors === "cache";
      el.classList.toggle("dehors", !home);
      el.classList.toggle("inconnu", !s || ["unknown", "unavailable"].includes(s.state));
      el.classList.toggle("cache", cache);
      el.classList.toggle("ailleurs", !home && a.dehors === "zone");
      if (cache) { delete el.dataset.x; delete el.dataset.y; return; }
      if (!home && a.dehors === "zone") {
        // rangée en bas du plan, sans direction ni distance : la zone de HA, ou « Absent » hors de toute zone
        delete el.dataset.x; delete el.dataset.y;
        const txt = !s ? _t("inconnu") : s.state === "not_home" ? _t("Absent") : this._hass.formatEntityState?.(s) ?? s.state;
        el.style.left = "50%"; el.style.top = "100%";
        pt.textContent = txt; el.title = _t("{nom} : {etat}", { nom, etat: txt });
        return;
      }
      if (home) {
        attrSi(el, "data-x", mz[0]); attrSi(el, "data-y", mz[1]);
        el.style.left = `${((mz[0] - q.x0) / q.W) * 100}%`; el.style.top = `${((mz[1] - q.y0) / q.H) * 100}%`;
        el.style.setProperty("--dx", (chez.indexOf(el) - (chez.length - 1) / 2).toFixed(2));
        texteSi(pt, ""); titreSi(el, _t("{nom} : à la maison", { nom }));
        return;
      }
      delete el.dataset.x; delete el.dataset.y;
      let txt = s ? this._hass.formatEntityState?.(s) ?? s.state : _t("inconnu"), ux = 0, uy = 1;
      const la = parseFloat(s?.attributes.latitude), lo = parseFloat(s?.attributes.longitude);
      if (!isNaN(la) && !isNaN(lo) && cf.latitude != null && cf.longitude != null) {
        const { cap, km } = capDistance(+cf.latitude, +cf.longitude, la, lo), f = ((cap + nord) * Math.PI) / 180;
        ux = Math.sin(f); uy = -Math.cos(f);
        if (s.state === "not_home") txt = km < 10 ? `${fmt(km, 1)} km` : `${Math.round(km)} km`;
      }
      const k = Math.min(Math.abs(ux) > 1e-6 ? 0.44 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.44 / Math.abs(uy) : Infinity);
      el.style.left = `${(50 + ux * k * 100).toFixed(2)}%`; el.style.top = `${(50 + uy * k * 100).toFixed(2)}%`;
      el.style.setProperty("--dx", (dehors.indexOf(el) * 0.5).toFixed(2)); // deux personnes au même endroit : légèrement décalées
      texteSi(pt, txt); titreSi(el, _t("{nom} : {etat}", { nom, etat: txt }));
    });
    this._rangeePersonnes();
  }
  // rangée du bas (dehors: zone) : puces centrées côte à côte selon leur largeur (recalculé aussi au redimensionnement)
  _rangeePersonnes() {
    const l = [...(this.shadowRoot?.querySelectorAll(".calque>.pers.ailleurs:not(.cache)") || [])];
    if (!l.length) return;
    const g = 8, w = l.map((el) => el.offsetWidth), tot = w.reduce((a, b) => a + b, 0) + g * (l.length - 1);
    let x = -tot / 2;
    l.forEach((el, k) => { el.style.setProperty("--ox", `${(x + w[k] / 2).toFixed(1)}px`); x += w[k] + g; });
  }

  // ---------- alertes plein plan ----------
  _alertesActives() {
    const c = this._config, out = [];
    (Array.isArray(c.alertes) ? c.alertes : []).forEach((r, i) => {
      if (!r || typeof r !== "object" || r.actif === false) return;
      if (r.si_absent && this._quelquun(r.presence) !== false) return;
      // ouvertures de toute la maison (tous les étages)
      const ents = r.type === "ouvertures" ? parEtage(c).flatMap((e) => e.geo.ouvertures).flatMap((o) => [...contactsDe(o), ...(contactsDe(o).length ? [] : [o.entite])]) : [...(Array.isArray(r.entites) ? r.entites : []), r.entite];
      const vide = (v) => v == null || v === "";
      const on = [...new Set(ents.filter((e) => typeof e === "string"))].filter((e) => {
        const s = this._etat(e);
        if (!s) return false;
        const v = parseFloat(s.state);
        if (!vide(r.au_dessus)) return !isNaN(v) && v > +r.au_dessus;
        if (!vide(r.au_dessous)) return !isNaN(v) && v < +r.au_dessous;
        if (!vide(r.etat)) return s.state === String(r.etat);
        return ETATS_ALERTE.includes(s.state);
      });
      const niv = NIVEAUX_ALERTE[r.niveau] ? r.niveau : "critique";
      if (on.length) out.push({ r, on, niv, sig: `${i}|${on.map((e) => `${e}@${this._etat(e).last_changed}`).join(",")}` });
    });
    return out.sort((a, b) => NIVEAUX_ALERTE[b.niv].r - NIVEAUX_ALERTE[a.niv].r);
  }
  // voile coloré qui bat sur tout le plan, bandeau (nom, éléments concernés, détails, masquer jusqu'au prochain changement),
  // éléments concernés entourés d'une onde ; jamais pendant l'édition
  _majAlertes() {
    const R = this.shadowRoot, plan = R?.querySelector(".plan");
    if (!plan) return;
    const l = this._editeur ? [] : this._alertesActives().filter((a) => !this._alertesVues?.has(a.sig));
    // éléments entourés (élément → couleur) : seuls ceux qui changent sont réécrits (pas de retrait puis remise à chaque mise à jour)
    const marques = new Map(), marquer = () => {
      R.querySelectorAll(".en-alerte:not(.vit-pt)").forEach((e) => { if (!marques.has(e)) { e.classList.remove("en-alerte"); e.style.removeProperty("--al-c"); } });
      for (const [x, c] of marques) { x.classList.toggle("en-alerte", true); if (x.style.getPropertyValue("--al-c") !== c) x.style.setProperty("--al-c", c); }
    };
    let v = plan.querySelector(":scope>.alerte-voile"), bd = plan.querySelector(":scope>.bandeau-al");
    this._alertes = l;
    if (!l.length) { v?.remove(); bd?.remove(); marquer(); return; }
    const COUL = { critique: "var(--md-error)", alerte: "var(--warning-color,#f4b400)", info: "var(--md-primary)" }, a0 = l[0];
    if (!v) { v = document.createElement("div"); plan.append(v); }
    if (!bd) { bd = document.createElement("div"); bd.setAttribute("role", "alert"); plan.append(bd); }
    attrSi(v, "class", `alerte-voile ${a0.niv}`); attrSi(bd, "class", `bandeau-al ${a0.niv}`);
    if (plan.style.getPropertyValue("--al-c") !== COUL[a0.niv]) plan.style.setProperty("--al-c", COUL[a0.niv]);
    // nom de l'élément concerné (ouverture de n'importe quel étage, l'affiché d'abord), suivi de son étage s'il n'est pas affiché
    const nomDe = (e) => {
      const o = this._maisonEtages().flatMap((E) => E.geo.ouvertures).find((x) => contactsDe(x).includes(e) || (!contactsDe(x).length && x.entite === e));
      const n = o?.baie || o?.nom || this._nom(e), E = this._etageAilleurs(e);
      return E ? _t("{nom} ({etage})", { nom: n, etage: E.nom || E.court }) : n;
    };
    // sous-titre : éléments concernés (sauf s'ils portent déjà le nom de l'alerte), puis le nombre d'autres alertes
    const noms = [...new Set(a0.on.map(nomDe))].filter((n) => n !== a0.r.nom).join(", "), autres = l.length > 1 ? _t(" · {n} autre alerte| · {n} autres alertes", { n: l.length - 1 }) : "";
    const sousTitre = noms ? noms + autres : autres.replace(/^ · /, "");
    const html = `<ha-icon icon="${esc(a0.r.icone || NIVEAUX_ALERTE[a0.niv].icone)}"></ha-icon><span class="t"><b>${esc(a0.r.nom || _t("Alerte"))}</b>
      <small>${esc(sousTitre)}</small></span>
      <button class="ib" data-al="infos" title="${_t("Détails")}" aria-label="${_t("Détails")}"><ha-icon icon="mdi:information-outline"></ha-icon></button>
      <button class="ib" data-al="masquer" title="${_t("Masquer jusqu'au prochain changement")}" aria-label="${_t("Masquer")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (bd._h !== html) { poserHTML(bd, html); bd._h = html; }
    for (const a of l) for (const e of a.on) {
      const els = [...R.querySelectorAll(".zone [data-e]")].filter((x) => x.dataset.e === e && !x.classList.contains("etq") && !x.classList.contains("pers"));
      (this._config.meubles || []).forEach((m, i) => { if (m.entite === e || m.valeur === e) els.push(R.querySelector(`.calque>[data-mbq="${i}"]`)); });
      // ouverture à plusieurs capteurs : entourée aussi quand c'est un autre que le premier qui est ouvert
      (this._config.ouvertures || []).forEach((o, i) => { if (contactsDe(o).length > 1 && contactsDe(o).includes(e)) els.push(R.querySelector(`.zone svg [data-o="${i}"]`)); });
      for (const x of els) if (x && !marques.has(x)) marques.set(x, COUL[a.niv]);
    }
    marquer();
  }
  _actionAlerte(k) {
    const a = this._alertes?.[0];
    if (!a) return;
    if (k === "infos") return this._plusInfos(a.on[0]);
    (this._alertesVues ||= new Set()).add(a.sig);
    this._majAlertes();
  }

  // ---------- replay de la journée (`replay: true` ou {heures}) ----------
  // l'historique de toutes les entités suivies est chargé une fois (attributs pour les volets, le soleil, la météo, les personnes),
  // puis le plan entier (couleurs, ouvertures, volets, lumières, ambiance, personnes, alertes, panneaux) est rendu à l'instant choisi.
  // Étages : un seul chargement pour toute la maison ; changer d'étage pendant la lecture garde l'heure (l'étage affiché montre ses
  // états à l'instant t, pastilles d'étage du sélecteur comprises)
  async _replayOuvrir() {
    if (this._rp || this._editeur) return;
    const c = this._config, h = borne(+(c.replay?.heures ?? 24) || 24, 1, 72), fin = Math.ceil(Date.now() / 60000) * 60000, debut = fin - h * 3600e3; // calé sur la minute
    const rp = (this._rp = { debut, fin, t: debut, vitesse: vitesseReplay(c.replay), lecture: false, pret: false, series: {}, cache: new Map() });
    this._barreReplay(_t("Chargement de l'historique…"));
    const ents = this._rpEntites().filter((e) => !e.startsWith("zone.") || e === "zone.home" || e === presenceDefaut(c));
    const avecAttr = ents.filter((e) => /^(cover|sun|weather|person|climate|media_player)\./.test(e)), sans = ents.filter((e) => !avecAttr.includes(e));
    // entités à attributs : réponse complète (sans `minimal_response`, HA ne renverrait les attributs que pour le premier état et
    // écarterait les changements d'attributs seuls : soleil, position d'un volet, personne, vent) ; les autres : états seuls, réponse minimale
    const lire = (l, attrs) => (l.length ? this._hass.callWS({ type: "history/history_during_period", start_time: new Date(debut).toISOString(), end_time: new Date(fin).toISOString(),
      entity_ids: l, minimal_response: !attrs, no_attributes: !attrs, significant_changes_only: !attrs }) : Promise.resolve({}));
    try {
      const [a, b] = await Promise.all([lire(avecAttr, true), lire(sans, false)]);
      if (this._rp !== rp) return;
      for (const [e, l] of Object.entries({ ...b, ...a })) {
        let attrs = {}, prec = null;
        rp.series[e] = (l || []).map((x) => {
          if (x.a) attrs = x.a;
          const lu = (x.lu ?? x.lc ?? 0) * 1000, lc = x.lc != null ? x.lc * 1000 : !prec || prec.s !== x.s ? lu : prec.lc;
          return (prec = { s: x.s, a: attrs, lu, lc });
        });
      }
      rp.pret = true;
      rp.t = fin - Math.min(2, h) * 3600e3; // on démarre 2 h avant maintenant
      this._barreReplay();
      this._rendreReplay();
    } catch (err) {
      if (this._rp === rp) this._barreReplay(_t("Historique indisponible : {msg}", { msg: err?.message || err }));
    }
  }
  // entités suivies de tous les étages : celles de l'étage affiché (déjà toute la maison pour le plan, le résumé et les alertes),
  // plus les panneaux propres et les fiches des autres étages, lus étage par étage sur la config dépliée
  _rpEntites() {
    const P = this._plein, ids = idsEtages(P), c0 = this._config, s = new Set(this._suivies || []);
    if (ids.length < 2) return [...s];
    try {
      for (const id of ids) if (id !== this._etageAffiche()) { this._config = deplier(P, id); for (const e of this._entites()) s.add(e); }
    } finally { this._config = c0; }
    return [...s];
  }
  _rpEtat(e) {
    const rp = this._rp, l = rp.series[e];
    if (!l?.length) return undefined;
    if (rp.cache.has(e)) return rp.cache.get(e);
    let a = 0, b = l.length - 1, k = -1;
    while (a <= b) { const m = (a + b) >> 1; if (l[m].lu <= rp.t) { k = m; a = m + 1; } else b = m - 1; }
    const x = l[Math.max(0, k)], iso = (t) => new Date(t).toISOString();
    // historique chargé sans attributs (capteurs, lumières…) : nom, unité, classe et icône repris de l'état actuel
    const live = this._hass.states[e]?.attributes || {}, fixes = {};
    for (const n of ATTRS_FIXES) if (live[n] != null) fixes[n] = live[n];
    const v = { entity_id: e, state: x.s, attributes: { ...fixes, ...x.a }, last_changed: iso(x.lc), last_updated: iso(x.lu) };
    rp.cache.set(e, v);
    return v;
  }
  _rendreReplay() {
    const rp = this._rp;
    if (!rp?.pret || this._rpRaf) return;
    this._rpRaf = requestAnimationFrame(() => {
      this._rpRaf = 0;
      if (this._rp !== rp) return;
      rp.cache.clear();
      this._maj();
      this._majBarreReplay();
    });
  }
  _actionReplay(k) {
    const rp = this._rp;
    if (!rp) return;
    if (k === "direct") return this._replayFermer();
    if (k === "lecture" && rp.pret) {
      rp.lecture = !rp.lecture;
      if (rp.lecture && rp.t >= rp.fin) rp.t = rp.debut;
      clearInterval(rp.tm);
      if (rp.lecture) rp.tm = setInterval(() => {
        rp.t = Math.min(rp.fin, rp.t + 100 * rp.vitesse);
        if (rp.t >= rp.fin) { rp.lecture = false; clearInterval(rp.tm); }
        this._rendreReplay();
      }, 100);
      this._majBarreReplay();
    }
  }
  _replayFermer() {
    const rp = this._rp;
    if (!rp) return;
    clearInterval(rp.tm);
    this._rp = null;
    const R = this.shadowRoot;
    R?.querySelector(".plan>.replay")?.remove();
    R?.querySelector(".plan")?.classList.remove("en-replay");
    R?.querySelector('[data-z="replay"]')?.classList.remove("on");
    this._prec = {};
    this._change();
    this._maj();
  }
  // frise : lecture / pause, curseur à la minute près, heure affichée, vitesse, repères (ouvertures, lumières, personnes), retour au direct
  _barreReplay(msg) {
    const R = this.shadowRoot, plan = R.querySelector(".plan"), rp = this._rp;
    let bar = plan.querySelector(":scope>.replay");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "replay";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", _t("Revoir la journée"));
      plan.append(bar);
    }
    plan.classList.add("en-replay");
    R.querySelector('[data-z="replay"]')?.classList.add("on");
    const fermer = `<button class="ib" data-rp="direct" title="${_t("Revenir au direct")}" aria-label="${_t("Revenir au direct")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (msg || !rp.pret) { poserHTML(bar, `<ha-icon icon="mdi:history"></ha-icon><span class="rp-msg">${esc(msg || _t("Chargement…"))}</span>${fermer}`); return; }
    const n = Math.round((rp.fin - rp.debut) / 60000);
    rp.etageFrise = this._etageAffiche();
    poserHTML(bar, `<button class="ib" data-rp="lecture" title="${_t("Lecture")}" aria-label="${_t("Lecture")}"><ha-icon icon="mdi:play"></ha-icon></button>
      <div class="rp-piste"><div class="rp-marques" aria-hidden="true">${this._marquesReplay()}</div><input type="range" min="0" max="${n}" step="1" aria-label="${_t("Moment de la journée")}"></div>
      <span class="rp-heure"></span>
      <select aria-label="${_t("Vitesse")}">${VITESSES_REPLAY.map(([v, t]) => `<option value="${v}" ${v === rp.vitesse ? "selected" : ""}>${t}</option>`).join("")}</select>${fermer}`);
    const r = bar.querySelector("input");
    r.oninput = () => { rp.t = rp.debut + +r.value * 60000; this._rendreReplay(); };
    r.onpointerdown = () => { rp.tient = true; };
    r.onpointerup = r.onpointercancel = () => { rp.tient = false; };
    bar.querySelector("select").onchange = (ev) => { rp.vitesse = +ev.target.value; };
    this._majBarreReplay();
  }
  // repères de la frise (ouvertures ouvertes, lumières allumées, arrivées) : ceux de l'étage affiché pleins, ceux des autres étages
  // estompés (classe `autre`) ; une entité présente sur deux étages (lumière d'escalier) compte pour l'étage affiché.
  // Sans étages : un seul étage, aucun repère estompé (frise identique).
  _marquesReplay() {
    const rp = this._rp, c = this._config, ici = this._etageAffiche(), marques = [], vus = new Set();
    const pos = (t) => (((t - rp.debut) / (rp.fin - rp.debut)) * 100).toFixed(2);
    const ajoute = (e, test, cls) => {
      if (vus.has(`${cls}|${e}`)) return;
      vus.add(`${cls}|${e}`);
      let p = null;
      for (const x of rp.series[e] || []) { if (x.lu >= rp.debut && test(x.s) && !(p && test(p.s))) marques.push(`<i class="${cls}" style="left:${pos(x.lu)}%"></i>`); p = x; }
    };
    const E = parEtage(c);
    for (const et of [...E.filter((x) => x.id === ici), ...E.filter((x) => x.id !== ici)]) {
      const autre = et.id != null && et.id !== ici ? " autre" : "";
      for (const o of et.geo.ouvertures) for (const e of contactsDe(o).length ? contactsDe(o) : [o?.entite].filter(Boolean)) ajoute(e, (v) => v === "on" || v === "open", `m-ouv${autre}`);
      for (const p of et.geo.points) if ((p?.entite || "").startsWith("light.")) ajoute(p.entite, (v) => v === "on", `m-lum${autre}`);
    }
    // repères d'arrivée (toute la maison) : pas pour une personne cachée à la maison comme dehors (elle n'apparaît jamais sur le plan)
    const PP = couchePersonnes(c.ambiance);
    for (const p of this._listePersonnes(c.ambiance)) { const a = affPersonne(PP, p.entite); if (a.dehors !== "cache" || a.chez_soi !== "cache") ajoute(p.entite, (v) => v === "home", "m-pers"); }
    return marques.join("");
  }
  // étage changé pendant le replay (lecture ou pause) : repères redessinés pour le nouvel étage affiché, l'heure ne bouge pas
  _majFriseEtage() {
    const rp = this._rp, m = rp?.pret && this.shadowRoot?.querySelector(".plan>.replay .rp-marques");
    if (!m || rp.etageFrise === this._etageAffiche()) return;
    rp.etageFrise = this._etageAffiche();
    poserHTML(m, this._marquesReplay());
  }
  _majBarreReplay() {
    const rp = this._rp, bar = this.shadowRoot?.querySelector(".plan>.replay");
    if (!rp?.pret || !bar) return;
    this._majFriseEtage();
    const r = bar.querySelector("input"), h = bar.querySelector(".rp-heure"), b = bar.querySelector('[data-rp="lecture"]');
    if (r && !rp.tient) r.value = String(Math.round((rp.t - rp.debut) / 60000)); // curseur tenu au doigt : on ne le bouscule pas
    const d = new Date(rp.t), auj = new Date().toDateString() === d.toDateString();
    if (h) h.textContent = `${auj ? "" : d.toDateString() === new Date(Date.now() - 864e5).toDateString() ? `${_t("hier")} ` : `${d.toLocaleDateString(_loc(), { day: "2-digit", month: "2-digit" })} `}${d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" })}`;
    if (b) { b.querySelector("ha-icon").setAttribute("icon", rp.lecture ? "mdi:pause" : "mdi:play"); b.title = rp.lecture ? _t("Pause") : _t("Lecture"); b.setAttribute("aria-label", b.title); }
  }

  // ---------- vitrine : exemples d'animations et d'ambiance sous le plan ----------
  _vitrine(pct, xy) {
    const c = this._config, g = geoVitrine(c, this.bornes(true)), fixe = this._sansBoucles();
    const nuage = (id) => `<radialGradient id="${id}"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>`;
    let svg = `<g class="vitrine" aria-hidden="true"><defs><linearGradient id="vit-dore"><stop offset="0" stop-color="#ffb74d" stop-opacity=".75"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient></defs>
      <rect class="vit-fond" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.H}" rx="${(g.th * 0.4).toFixed(0)}"/>`, html = "";
    const etq = (x, y, t, cls = "") => { html += `<span class="txt vit${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])}">${esc(t)}</span>`; };
    const pt = (x, y, cls, style, ic) => { html += `<span class="pt vit-pt ${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])};${style}"><ha-icon icon="${ic}"></ha-icon></span>`; };
    const cx0 = g.x + g.w / 2;
    // 1. animations : fenêtre ouverte et pastille active, pour chaque type
    let y = g.y + g.th;
    etq(cx0, g.y + g.th * 0.55, _t("Animations (fenêtre ouverte, pastille active)"), " titre-v");
    Object.keys(ANIMATIONS).forEach((t, k) => {
      const cx = g.x + g.ca * (k + 0.5), y1 = y + g.ha * 0.16, a = { type: t, duree: t === "defilement" ? 0.8 : 1.6 }, dx = g.ca * 0.32;
      svg += `<g class="ouv fenetre ouvert${classeAnim(a)}" style="${styleAnim(a)}"><path class="cible" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/><path class="trait" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/></g>`;
      pt(cx, y + g.ha * 0.52, `actif${classeAnim(a)}`, `--pt-couleur:#f6c445;${styleAnim(a)}`, "mdi:lightbulb-on-outline");
      etq(cx, y + g.ha * 0.88, _t(ANIMATIONS[t]).split(" (")[0]);
    });
    // 2. météo : un carré d'extérieur par temps
    y += g.ha + g.th;
    etq(cx0, y - g.th * 0.45, _t("Météo sur les extérieurs"), " titre-v");
    const carre = (k, rangee) => { const x = g.x + g.cm * k + g.cm * 0.06, w = g.cm * 0.88; return { x, w, b: { x0: x, y0: rangee, W: w, H: g.hm } }; };
    VITRINE_METEO.forEach(([cond, nom], k) => {
      const { x, w, b } = carre(k, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`;
      svg += `<defs>${nuage(`vit${k}-nuage`)}<clipPath id="vit-c${k}"><rect ${r}/></clipPath></defs><g clip-path="url(#vit-c${k})"><rect class="vit-dehors" ${r}/>
        ${dessinMeteo({ state: cond, attributes: { wind_speed: cond === "windy" ? 40 : 15, wind_bearing: 300, wind_speed_unit: "km/h", cloud_coverage: cond === "partlycloudy" ? 100 : undefined } }, b, 0, 1.6, fixe, `vit${k}`, borne(g.cm / 300, 0.3, 1))}</g>`;
      etq(x + w / 2, y + g.hm + g.th * 0.45, _t(nom));
    });
    // 3. ambiance : nuit, soleil bas, trace, flux d'énergie, alerte, personne dehors
    y += g.hm + g.th * 1.4;
    etq(cx0, y - g.th * 0.45, _t("Ambiance"), " titre-v");
    // personne dehors : comme la réglera le plan (direction et distance, ou zone) ; absente de la vitrine si les personnes dehors sont cachées
    const ap = affPersonne(couchePersonnes(c.ambiance), "");
    VITRINE_AMB.filter(([t]) => t !== "personne" || ap.dehors !== "cache").forEach(([t, nom], k) => {
      const { x, w } = carre(k + 1, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`, mx = x + w / 2, my = y + g.hm / 2;
      svg += `<rect class="vit-dehors" ${r}/>`;
      if (t === "nuit") svg += `<rect ${r} fill="#0b1d4d" opacity=".55"/>`;
      if (t === "dore") svg += `<rect ${r} fill="url(#vit-dore)" opacity=".8"/>`;
      if (t === "trace") pt(mx, my, "trace", "--t:.85", "mdi:door-open");
      if (t === "flux") svg += `<circle cx="${(x + w * 0.15).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/><circle cx="${(x + w * 0.85).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/>`
        + dessinFlux([{ de: [x + w * 0.15, my], vers: [x + w * 0.85, my], w: 900, col: "#fbc02d" }], g.hm * 0.035, fixe);
      if (t === "alerte") pt(mx, my, "en-alerte", "--al-c:var(--md-error)", "mdi:alarm-light");
      if (t === "personne") html += `<span class="pers dehors vit-pt" ${xy([+mx.toFixed(1), +my.toFixed(1)])} style="${pct([mx, my])}"><span class="av">A</span><small>${ap.dehors === "zone" ? _t("Absent") : "12 km"}</small></span>`;
      etq(mx, y + g.hm + g.th * 0.45, _t(nom));
    });
    return { svg: `${svg}</g>`, html };
  }

  // traces : les éléments qui viennent de changer gardent un liseré qui s'estompe sur `traces` minutes (10 par défaut) ;
  // capteurs numériques exclus (ils changent sans cesse) ; un redémarrage de HA (beaucoup d'entités changées ensemble) est ignoré
  _majTraces() {
    const R = this.shadowRoot, c = this._config, tr = !this._editeur && coucheTraces(c.ambiance);
    if (!R) return;
    if (this._rp) this._majFriseEtage(); // replay : un changement d'étage en pause reconstruit le plan sans passer par la frise
    if (!tr) { R.querySelectorAll(".zone .trace:not(.vit-pt)").forEach((e) => { e.classList.remove("trace"); e.style.removeProperty("--t"); }); return; }
    const l = [];
    (c.ouvertures || []).forEach((o, i) => l.push([R.querySelector(`.zone svg [data-o="${i}"]`), contactsDe(o).length > 1 ? o : entOuv(o) || o.volet]));
    (c.points || []).forEach((p, i) => l.push([R.querySelector(`.calque>[data-q="${i}"]`), p.entite]));
    (c.meubles || []).forEach((m, i) => l.push([R.querySelector(`.calque>[data-mbq="${i}"]`), m.entite]));
    const t = l.map(([el, e]) => { const s = !el ? null : e && typeof e === "object" ? this._etatOuverture(e) : typeof e === "string" && !/^(sensor|weather|sun|zone)\./.test(e) ? this._etat(e) : null; return s && !["unavailable", "unknown"].includes(s.state) ? Date.parse(s.last_changed) : NaN; });
    const paquets = {}, ok = t.filter((x) => !isNaN(x));
    for (const x of ok) paquets[Math.round(x / 10000)] = (paquets[Math.round(x / 10000)] || 0) + 1;
    const seuil = Math.max(5, ok.length * 0.4), maint = this._maintenant(), d = tr.duree * 60000;
    l.forEach(([el], j) => {
      if (!el) return;
      const age = Math.max(0, maint - t[j]), oui = !isNaN(t[j]) && maint - t[j] > -60000 && age < d && paquets[Math.round(t[j] / 10000)] < seuil;
      el.classList.toggle("trace", oui);
      if (oui) el.style.setProperty("--t", (1 - age / d).toFixed(3)); else el.style.removeProperty("--t");
    });
  }

  // registre, table et outils purs (éditeur, doc, tests) : MaquetteCard.THEMES.registre[nom] = { clair, sombre, mode?, css? },
  // .variables = VARIABLES_THEME, .resoudre(theme, sombre) = { variable: valeur }, .css(theme, sombre), .verifierCss(texte), .doc(langue)
  static THEMES = { registre: THEMES, noms: NOMS_THEMES, variables: VARIABLES_THEME, resoudre: variablesDuTheme, css: cssDuTheme, verifierCss, valeur: valeurTheme,
    doc: tableVariablesTheme, cleAnglaise: cleAnglaiseTheme, CSS_MAX: CSS_PERSO_MAX, jetonsCss: CSS_JETONS_THEME };

  // moments : plan construit (config neuve ou modifiée), nouvel état de HA (le thème clair / sombre de HA a pu changer)
  _quand_construit_themes() { this._appliquerTheme(); }
  _quand_hass_themes() { if (!!this._hass?.themes?.darkMode !== this._thSombre) this._appliquerTheme(); }

  // pose le thème (variables --mq-t-* + règles de forme) puis le CSS personnalisé, en dernier dans le shadow DOM (feuilles construites,
  // après tous les <style> : la carte et l'éditeur) ; rien n'est posé pour material sans retouche ni CSS (rendu d'avant à l'identique)
  _appliquerTheme() {
    const R = this.shadowRoot;
    if (!R) return;
    const src = this._thApercu || { theme: this._plein?.theme ?? this._config?.theme, css: this._plein?.css ?? this._config?.css };
    const sombre = (this._thSombre = !!this._hass?.themes?.darkMode);
    let perso = "";
    if (typeof src.css === "string" && src.css.trim()) {
      const v = verifierCss(src.css);
      if (v.ok) perso = v.css;
      else if (this._thRefus !== v.raison) console.warn(`maquette-card : custom css refused (${v.raison}): nothing applied`);
      this._thRefus = v.ok ? null : v.raison;
    }
    const empreinte = [cssDuTheme(src.theme, sombre), perso];
    this._poserFeuille("theme", empreinte[0]);
    this._poserFeuille("css", perso);
    // police : --maquette-font (thème HA, CSS personnalisé…) sinon celle du thème, posée sur l'hôte (tous les styles lisent --ha-font-family-body)
    const ext = typeof getComputedStyle === "function" ? getComputedStyle(this).getPropertyValue("--maquette-font").trim() : "";
    const police = valeurTheme(ext, "police") || policeDuTheme(src.theme, sombre);
    if (police) { this.style.setProperty("--ha-font-family-body", police); this._thPolice = true; }
    else if (this._thPolice) { this.style.removeProperty("--ha-font-family-body"); this._thPolice = false; }
    // le thème peut changer la boîte du plan sans changer la taille de l'hôte (bordure de ha-card de `ha`, police, CSS personnalisé) :
    // le ResizeObserver de l'hôte reste muet, la mise en page est refaite ici (seulement si quelque chose a changé)
    empreinte.push(police || "");
    const cle = empreinte.join("\n");
    if (cle !== (this._thEmpreinte ?? "\n\n") && this._ok) this._mise();
    this._thEmpreinte = cle;
  }
  // une feuille par sujet (« theme » puis « css », toujours dans cet ordre, à la fin) ; texte vide = feuille retirée
  _poserFeuille(sujet, texte) {
    const R = this.shadowRoot, F = (this._thFeuilles ||= {});
    const construites = typeof CSSStyleSheet === "function" && "replaceSync" in CSSStyleSheet.prototype && Array.isArray(R.adoptedStyleSheets);
    if (construites) {
      if (!texte && !F[sujet]) return;
      const avant = F[sujet];
      if (texte) (F[sujet] ||= new CSSStyleSheet()).replaceSync(texte); else F[sujet] = null;
      // les autres feuilles adoptées (card-mod, autre outil) restent devant, les nôtres en dernier
      const miennes = ["theme", "css"].map((k) => F[k]).filter(Boolean);
      R.adoptedStyleSheets = [...R.adoptedStyleSheets.filter((s) => s !== avant && !miennes.includes(s)), ...miennes];
      return;
    }
    // sans feuilles construites : un <style> à la fin du shadow DOM
    let el = R.querySelector(`style[data-maquette-${sujet}]`);
    if (!texte) { el?.remove(); return; }
    if (!el) { el = document.createElement("style"); el.setAttribute(`data-maquette-${sujet}`, ""); }
    el.textContent = texte;
    R.append(el);
    if (sujet === "theme") { const c = R.querySelector("style[data-maquette-css]"); if (c) R.append(c); }
  }

  // ---------- pour l'éditeur (onglet Apparence) ----------
  // toutes les variables publiques, avec leur valeur calculée actuelle sur cette carte (liste cliquable, pastilles) :
  // [{ nom, variable: "--maquette-<nom>", cle, yaml, type, role (langue de l'interface), fr, en, defaut, valeur }]
  variablesTheme() {
    const cs = typeof getComputedStyle === "function" ? getComputedStyle(this) : null, fr = globalThis.MaquetteI18n?.langue?.() === "fr";
    return VARIABLES_THEME.map((v) => ({ nom: v.nom, variable: `--maquette-${v.nom}`, cle: v.cle, yaml: cleAnglaiseTheme(v), type: v.type, role: fr ? v.fr : v.en, fr: v.fr, en: v.en,
      defaut: v.defaut, valeur: (cs?.getPropertyValue(v.jeton) || "").trim() || v.defaut }));
  }
  // aperçu d'un thème et / ou d'un CSS (config interne : `theme` chaîne ou objet aux clés internes, `css` texte), sans toucher la config ;
  // apercuTheme(null) revient à la config. Renvoie les variables du thème appliqué ({ variable: valeur }).
  apercuTheme(theme, css) {
    this._thApercu = theme === null && css === undefined ? null : { theme: theme === undefined ? this._plein?.theme : theme, css: css === undefined ? this._plein?.css : css };
    this._appliquerTheme();
    return variablesDuTheme(this._thApercu ? this._thApercu.theme : this._plein?.theme, this._thSombre);
  }
  // fenêtres de toit (calculs purs, voir carte/velux.js) : pour les tests et l'éditeur
  static VELUX = { tache: tacheVelux, ouvert: ouvertVelux, emprise: empriseVelux, pente: penteVelux, hauteur: hauteurVelux };
  // thème sombre : fond de la carte peu lumineux (sinon, carte transparente : réglage sombre de HA)
  _sombre() {
    const t = getComputedStyle(this.shadowRoot.querySelector("ha-card")).backgroundColor, c = t.match(/[\d.]+/g)?.map(Number), k = t.startsWith("color(") ? 1 : 255;
    if (!c || c.length < 3 || c[3] === 0) return !!this._hass?.themes?.darkMode;
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / k < 0.4;
  }

  // jour / nuit : teinte bleu nuit selon la hauteur du soleil (plus forte sur les extérieurs), lumière venant du côté du soleil
  // (azimut + `nord`), plus chaude au lever et au coucher ; repère du soleil au bord du plan ; météo redessinée quand elle change
  _majAmbiance() {
    this._majVelux();
    this._pauseAnimations();
    const R = this.shadowRoot, A = this._config.ambiance, g = R?.querySelector(".zone svg .amb");
    // effets légers (classe effets-legers, couches.css.js) : nuages et brouillard immobiles ; voir _effetsLegers
    R?.querySelector("ha-card")?.classList.toggle("effets-legers", this._effetsLegers());
    if (!A || !g) return;
    const I = intensiteAmb(A), b = this._box, nord = +A.nord || 0, jn = coucheJour(A);
    const so = jn && this._etat(jn.soleil || "sun.sun"), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const Ij = I * borne(+(jn?.intensite ?? 1), 0, 2), nuit = isNaN(e) ? 0 : borne((2 - e) / 14, 0, 1), dore = isNaN(e) || e < -4 ? 0 : Math.max(0, 1 - Math.abs(e - 3) / 9);
    // teinte de nuit et lumière du soleil : fondu par paliers (voir _palier) au lieu d'une transition continue de 40 s
    const op = (sel, v) => this._palier(g.querySelector(sel), "opacity", v.toFixed(3), 0.004);
    // thème sombre : le bleu nuit sur un fond déjà sombre ne se voit presque pas en « discret » ; on le renforce (normal et fort inchangés)
    const In = I > 0 && I < INTENSITES.normal && this._sombre() ? Math.min(INTENSITES.normal * 1.5, I * 2.3) / I : 1;
    op(".amb-ni", Ij * In * nuit * 0.22); op(".amb-ne", Ij * In * nuit * 0.5);
    const cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, f = ((az + nord) * Math.PI) / 180, ux = Math.sin(f), uy = -Math.cos(f);
    const lg = g.querySelector("#amb-g"), astre = R.querySelector(".calque>.amb-astre"), jour = !isNaN(az) && e > 0;
    if (lg && jour) {
      const rr = Math.max(b.W, b.H) / 2;
      [["x1", cx + ux * rr], ["y1", cy + uy * rr], ["x2", cx - ux * rr * 0.3], ["y2", cy - uy * rr * 0.3]].forEach(([k, v]) => attrSi(lg, k, v.toFixed(0)));
      const col = dore > 0.5 ? "#ffb74d" : "#fff59d";
      lg.querySelectorAll("stop").forEach((st) => attrSi(st, "stop-color", col));
    }
    op(".amb-sol", jour ? Ij * (0.18 + 0.32 * dore) : 0);
    if (astre) {
      if (astre.hidden !== !jour) astre.hidden = !jour;
      if (jour) {
        // au bord du plan, dans la direction du soleil (2,5 % de marge)
        const k = Math.min(Math.abs(ux) > 1e-6 ? 0.475 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.475 / Math.abs(uy) : Infinity);
        this._palier(astre, "left", (50 + ux * k * 100).toFixed(2), 0.05, "%"); this._palier(astre, "top", (50 + uy * k * 100).toFixed(2), 0.05, "%");
        const hm = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" }) : "?"; };
        titreSi(astre, _t("Soleil : hauteur {h}°, azimut {az}° · coucher {coucher}", { h: Math.round(e), az: Math.round(az), coucher: hm(so.attributes.next_setting) }));
      }
    }
    const me = coucheMeteo(A), w = me && this._etat(me.entite), zm = g.querySelector(".amb-meteo");
    const cle = w && zm ? [w.state, w.attributes.cloud_coverage, Math.round(+w.attributes.wind_speed || 0), Math.round((+w.attributes.wind_bearing || 0) / 10)].join("|") : "";
    if (zm && cle !== this._meteoCle) { this._meteoCle = cle; poserHTML(zm, w ? dessinMeteo(w, b, nord, I * borne(+(me.intensite ?? 1), 0, 2), this._sansBoucles(), "amb", 1, me.sens ?? 135) : ""); }
    // nuages : quasi invisibles la nuit (sinon, clairs sur fond sombre, on les prendrait pour des halos de lumière)
    zm?.querySelectorAll(".m-nuages").forEach((n) => { n.style.opacity = (+n.dataset.op * (1 - 0.85 * nuit)).toFixed(3); });
    this._majLumiere(I, nord);
  }

  // animations du plan (minuterie : billes des flux ; CSS : météo, nuages, pulsations, brouillard, éclairs…) en pause quand le plan n'est pas à l'écran
  // (hors de la vue, carte cachée : IntersectionObserver de _minuterie) ou que la page est cachée ; elles reprennent où elles en étaient.
  // Rappelée après chaque mise à jour : un plan reconstruit hors de la vue (nouveau <svg>) reste en pause
  _pauseAnimations() {
    const z = this.shadowRoot?.querySelector(".zone");
    if (!z) return;
    const p = !!this._horsVue || document.visibilityState === "hidden";
    z.classList.toggle("hors-ecran", p);
    for (const sv of z.querySelectorAll(":scope>svg")) if (sv.pauseAnimations && sv.animationsPaused() !== p) { if (p) sv.pauseAnimations(); else sv.unpauseAnimations(); }
    // billes des flux (minuterie, classe-personnes-alertes.js) : arrêtées ou relancées avec le reste
    const avant = this._enPause;
    this._enPause = p;
    if (avant !== p || (!p && !this._tmBilles)) this._billes();
  }

  // effets (`effets`) : légers = ce qui coûte sans apporter beaucoup est allégé (lumière des fenêtres sans flou, nuages et brouillard
  // immobiles ; pluie et neige gardent leur animation CSS, moins chère que par pas) ; auto = légers sur un écran tactile
  // principal (pointer: coarse : téléphone, tablette), complets sinon. Indépendant du niveau d'animation (`niveau_animation`) et du
  // mouvement réduit du système, qui figent les boucles quels que soient les effets
  _effetsLegers() { const e = effetsDe(this._config); return e === "legers" || (e === "auto" && matchMedia("(pointer: coarse)").matches); }

  // fondu par paliers (aube, crépuscule : teinte de nuit, lumière du soleil, marqueur du soleil) : la valeur affichée va vers la cible
  // en PALIER_DUREE (40 s, comme l'ancienne transition CSS), par petits pas réguliers (au plus `pas`, au plus un toutes les PALIER_MIN ms),
  // invisibles à l'œil ; au lieu d'une transition continue redessinée à chaque image de l'écran pendant tout le lever et le coucher.
  // Opacité : l'attribut porte la cible, le style le palier en cours (retiré à la fin) ; left / top : le style. Première écriture sur un
  // élément (plan neuf) ou niveau d'animation réduit / aucun (transition CSS courte, ou aucune) : valeur posée directement
  _palier(el, k, v, pas, u = "") {
    if (!el) return;
    const P = (this._paliers ||= new WeakMap()), attr = k === "opacity";
    let m = P.get(el);
    const neuf = !m;
    if (neuf) P.set(el, (m = {}));
    const f = m[k], x = +v, lu = parseFloat(attr ? el.getAttribute(k) : el.style[k]);
    if (x === (f ? f.vers : lu)) return;
    if (f) { clearInterval(f.tm); m[k] = null; }
    const de = f ? f.v : lu, fin = () => { if (attr) el.style.removeProperty(k); else el.style[k] = `${v}${u}`; };
    if (attr) el.setAttribute(k, v);
    const n = Math.min(Math.ceil(Math.abs(x - de) / pas), Math.floor(PALIER_DUREE / PALIER_MIN));
    if (neuf || !Number.isFinite(de) || n < 2 || this._niveauAnim() !== "complet") return fin();
    const g = (m[k] = { vers: x, v: de, i: 0 }), ecrire = (y) => { el.style[k] = attr ? y.toFixed(3) : `${y.toFixed(2)}${u}`; };
    ecrire(de);
    g.tm = setInterval(() => {
      if (++g.i >= n || !el.isConnected || !this.isConnected) { clearInterval(g.tm); if (m[k] === g) m[k] = null; return fin(); }
      g.v = de + ((x - de) * g.i) / n;
      ecrire(g.v);
    }, PALIER_DUREE / n);
  }

  // store des fenêtres de toit reliées à un `cover` : hauteur du store dessiné selon current_position (ambiance ou non) ;
  // un contact (binary_sensor) ne change que l'état du meuble (contour actif), pas le store
  _majVelux() {
    const R = this.shadowRoot;
    (this._config?.meubles || []).forEach((m, i) => {
      // pergola reliée à un `cover` : lames vues de chant quand elles s'ouvrent (current_tilt_position, sinon current_position)
      if (m?.type === "pergola") {
        const s = typeof m.entite === "string" && m.entite.startsWith("cover.") ? this._etat(m.entite) : null, t = parseFloat(s?.attributes?.current_tilt_position);
        const k = !s ? 0 : Number.isFinite(t) ? borne(t / 100, 0, 1) : ouvertVelux(m.entite, s);
        R?.querySelectorAll(`.zone svg [data-mb="${i}"] .pg-lame`).forEach((l) => {
          const h = +(+l.dataset.e * (1 - 0.8 * k)).toFixed(1);
          if (l.getAttribute("height") !== String(h)) { l.setAttribute("height", h); l.setAttribute("y", +(+l.dataset.c - h / 2).toFixed(1)); }
        });
        return;
      }
      if (m?.type !== "fenetre_toit") return;
      const st = R?.querySelector(`.zone svg [data-mb="${i}"] .vx-store`);
      if (!st) return;
      const k = typeof m.entite === "string" && m.entite.startsWith("cover.") ? 1 - ouvertVelux(m.entite, this._etat(m.entite)) : 0, h = +(+st.dataset.h * k).toFixed(1);
      if (st.getAttribute("height") !== String(h)) st.setAttribute("height", h);
    });
  }

  // entité de phase de la lune : celle choisie, sinon celle de l'intégration Moon (sensor.moon_phase, ancien nom sensor.moon)
  _entiteLune(LU) { return LU.phase || ["sensor.moon_phase", "sensor.moon"].find((e) => this._etat(e)) || "sensor.moon_phase"; }

  // lumière (`ambiance.lumiere`), par baie (vantaux contigus réunis) et coupée par la pièce :
  // - lueur du ciel : par toutes les fenêtres non fermées, de jour (fondu au crépuscule), blanc froid, plus profonde pour une baie jusqu'au sol ;
  // - soleil direct (baies qui le voient, temps clair) : tache au sol à bords flous (pénombre plus large loin de la baie), et lueur chaude
  //   rediffusée autour de la tache, selon sa surface ; volet baissé = tache raccourcie, fermé = rien ;
  // - lune la nuit : la même chose, froide et discrète (selon la phase).
  // Redessinée seulement quand le soleil (1°), le temps, les volets, la phase ou le thème changent : couche statique, sans animation
  _majLumiere(I, nord) {
    const R = this.shadowRoot, c = this._config, A = c.ambiance, g = R?.querySelector(".zone svg .lum"), LU = coucheLumiere(A);
    if (!g || !LU) return;
    const so = this._etat(soleilDe(A)), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const me = coucheMeteo(A), w = me && this._etat(me.entite), { ciel: ciel0, direct } = LUM_CIEL(e, w?.state, w?.attributes?.cloud_coverage), ciel = LU.soleil ? ciel0 : 0;
    const jour = LU.soleil && !isNaN(az) && e > 0.5 && direct > 0.02, nuitL = LU.lune && !isNaN(e) ? borne((-e - 2) / 6, 0, 1) : 0;
    // lune : position calculée (latitude / longitude de HA, heure de la carte) ; sans coordonnées, lueur dans l'axe de chaque fenêtre (d'origine)
    const cf = this._hass?.config, PL = nuitL > 0 ? positionLune(this._maintenant(), nbOpt(cf?.latitude) ?? NaN, nbOpt(cf?.longitude) ?? NaN) : null;
    const sl = LU.lune ? this._etat(this._entiteLune(LU)) : null, phase = sl ? PHASES_LUNE[sl.state] ?? 0.6 : PL ? Math.max(0.05, PL.fraction) : 0.6, sombre = this._sombre();
    // part dégagée de chaque fenêtre (volet : position, fermé = 0 ; sans volet = 1)
    const ouv = (c.ouvertures || []).map((o) => {
      if (!vitrageDe(o) || o.masque) return null;
      const sv = o.volet ? this._etat(o.volet) : null;
      let pos = sv ? parseFloat(sv.attributes.current_position) : 100;
      if (isNaN(pos)) pos = sv.state === "closed" ? 0 : 100;
      return partLames(borne(pos / 100, 0, 1), sv && o.lames, parseFloat(sv?.attributes.current_tilt_position));
    });
    // part de lumière qui passe par chaque ouverture intérieure (porte ouverte, porte vitrée, verrière) : voir lumiereVoisins
    const trans = (c.ouvertures || []).map((o, i) => {
      if (!o || o.masque || !(o.type === "porte" || o.type === "fenetre")) return 0;
      const st = contactsDe(o).length ? this._etatOuverture(o)?.state : null;
      return passageLumiere(o, st == null || ETATS_MUETS.includes(st) ? null : st, LU.portes === "fermees", ouv[i] ?? 1);
    });
    // fenêtres de toit : [meuble, part dégagée par le store] (contact : sans effet sur la lumière)
    const vel = (c.meubles || []).map((m, i) => [m, m?.type === "fenetre_toit" ? ouvertVelux(m.entite, m.entite ? this._etat(m.entite) : null) : null, i]).filter((x) => x[1] != null);
    // effets légers : aucune copie floue (feGaussianBlur) : tache au bord net, faisceau du ciel en lueur douce (dégradé seul)
    const M = LU.mult, K = LU.kelvin, leger = this._effetsLegers(), D = leger ? 0 : LU.diffusion;
    const cle = [vel.map(([m, v]) => `${v.toFixed(2)}@${JSON.stringify([m.pos, m.taille, m.rotation, m.miroir, m.pente, m.hauteur])}`).join(";"), M.ciel, D, M.rediffusion, M.soleil, K.ciel, K.soleil, jour ? Math.round(az) : "", jour || ciel > 0 ? Math.round(e) : "", ciel.toFixed(2), direct, nuitL.toFixed(2), phase, I, nord, sombre, ouv.map((v) => (v == null ? "" : v.toFixed(2))).join(","),
      PL ? `${Math.round(PL.az)},${Math.round(PL.haut)}` : "", trans.map((v) => v.toFixed(2)).join(","), leger].join("|");
    if (cle === this._lumCle) return;
    this._lumCle = cle;
    const pieces = c.pieces.map((p, k) => [p, k]).filter(([p]) => !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    // pièce derrière la baie : un point à 15 cm du milieu, côté intérieur
    const salle = (o) => {
      const [a, b, d, f] = o.seg, [nx, ny] = o.dehors, q = [(a + d) / 2 - nx * 15, (b + f) / 2 - ny * 15];
      return pieces.find(([p]) => dansPoly(q, p.poly))?.[1] ?? -1;
    };
    // espace de chaque pièce (pièces ouvertes l'une sur l'autre, sans mur entre elles) : la lumière d'une baie s'y étend, coupée aux murs
    const esp = espacesOuverts(c.pieces, c.murs, c.ouvertures);
    // profondeur de l'espace vu de la baie (cm, le long de la normale vers l'intérieur)
    const profondeur = (o, k) => { const [a, b] = o.seg, [nx, ny] = o.dehors; return Math.max(60, ...esp[k].flatMap((j) => c.pieces[j].poly.map(([x, y]) => -((x - a) * nx + (y - b) * ny)))); };
    let defs = "", h = "", n = 0;
    const clips = new Set(), f0 = (v) => v.toFixed(1);
    const degrade = (id, col, stops) => `<radialGradient id="${id}">${stops.map(([o, a]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;
    // lueur douce : ellipse (centre, demi-axes le long de la baie et vers l'intérieur) remplie d'un dégradé radial, coupée par la pièce
    const lueur = (cls, k, [cx, cy], [vx, vy], rl, rp, col, op) => {
      if (op < 0.004) return;
      const id = `lum-l${n++}`, ang = (Math.atan2(vy, vx) * 180) / Math.PI;
      defs += degrade(id, col, [[0, 1], [0.45, 0.42], [1, 0]]);
      clips.add(k);
      h += `<g class="lum-b" clip-path="url(#lum-cp${k})"><ellipse class="${cls}" cx="${f0(cx)}" cy="${f0(cy)}" rx="${f0(rl)}" ry="${f0(rp)}" transform="rotate(${ang.toFixed(1)} ${f0(cx)} ${f0(cy)})" fill="url(#${id})" opacity="${op.toFixed(3)}"/></g>`;
    };
    // tache directe : dégradé le long de la tache, bords flous (pénombre : plus large quand la tache s'éloigne de la baie)
    const tache = (t, k, col, op, fin) => {
      const id = `lum-g${n++}`, sd = borne(2 + t.loin * 0.02, 2, 10), xs = t.poly.map((p) => p[0]), ys = t.poly.map((p) => p[1]), m = sd * 3;
      const x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m;
      defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${t.de[0]}" y1="${t.de[1]}" x2="${t.vers[0]}" y2="${t.vers[1]}"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity="${fin}"/></linearGradient>`
        + (leger ? "" : `<filter id="${id}f" filterUnits="userSpaceOnUse" x="${f0(x0)}" y="${f0(y0)}" width="${f0(Math.max(...xs) + m - x0)}" height="${f0(Math.max(...ys) + m - y0)}"><feGaussianBlur stdDeviation="${f0(sd)}"/></filter>`);
      clips.add(k);
      h += `<polygon class="lum-tache lum-b" points="${ptsSvg(t.poly)}" fill="url(#${id})"${leger ? "" : ` filter="url(#${id}f)"`} opacity="${op.toFixed(3)}" clip-path="url(#lum-cp${k})"/>`;
    };
    // lumière du ciel : faisceau qui entre par la baie (trapèze qui s'évase vers l'intérieur), plus lumineux contre la vitre, fondu en
    // profondeur, à bords doux ; dégradé linéaire de la baie (`de`) vers le fond du faisceau. Diffusion D (0 à 1) : faisceau plus évasé,
    // découpé en profondeur en 3 copies (poids en triangle qui se recouvrent, somme = le dégradé d'origine), de plus en plus floues :
    // presque net contre la vitre, flou large au fond, sans bord visible. D = 0 : une seule copie, le faisceau net d'origine
    const faisceau = (k, B, p, col, op) => {
      if (op < 0.004) return;
      const [a, b, d, ff] = B.seg, [nx, ny] = B.dehors, L = Math.hypot(d - a, ff - b), vx = (d - a) / L, vy = (ff - b) / L, w = p * (0.35 + 0.4 * D);
      // effets légers : lueur douce (dégradé radial, sans filtre) centrée sur la vitre, aussi large que la baie et le faisceau, aussi
      // profonde que lui ; la moitié dehors est coupée par la pièce
      if (leger) return lueur("lum-ciel", k, [(a + d) / 2, (b + ff) / 2], [vx, vy], L / 2 + w * 0.6, p, col, op * 0.9);
      const id = `lum-f${n++}`, m = [(a + d) / 2, (b + ff) / 2], sd = borne(4 + L * 0.03, 4, 14);
      const poly = [[a, b], [d, ff], [d - nx * p + vx * w, ff - ny * p + vy * w], [a - nx * p - vx * w, b - ny * p - vy * w]];
      const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), pts = ptsSvg(poly.map((q) => q.map((v) => +v.toFixed(1))));
      const grad = (j, stops) => `<linearGradient id="${id}${j}" gradientUnits="userSpaceOnUse" x1="${f0(m[0])}" y1="${f0(m[1])}" x2="${f0(m[0] - nx * p)}" y2="${f0(m[1] - ny * p)}">${stops.map(([o, v]) => `<stop offset="${o}" stop-color="${col}"${v < 1 ? ` stop-opacity="${+v.toFixed(3)}"` : ""}/>`).join("")}</linearGradient>`;
      const flou = (j, s) => `<filter id="${id}${j}b" filterUnits="userSpaceOnUse" x="${f0(Math.min(...xs) - s * 3)}" y="${f0(Math.min(...ys) - s * 3)}" width="${f0(Math.max(...xs) - Math.min(...xs) + s * 6)}" height="${f0(Math.max(...ys) - Math.min(...ys) + s * 6)}"><feGaussianBlur stdDeviation="${f0(s)}"/></filter>`;
      const copie = (j, cls) => `<polygon class="${cls}" points="${pts}" fill="url(#${id}${j})"${leger ? "" : ` filter="url(#${id}${j}b)"`} opacity="${op.toFixed(3)}"/>`;
      clips.add(k);
      if (D <= 0) {
        defs += grad("", [[0, 1], [0.3, 0.55], [1, 0]]) + (leger ? "" : flou("", sd));
        h += `<g class="lum-b" clip-path="url(#lum-cp${k})">${copie("", "lum-ciel")}</g>`;
        return;
      }
      // dégradé d'origine (1 → 0,55 à 30 % → 0) échantillonné aux nœuds U ; copie j = ce dégradé × triangle centré sur U[j]
      const U = [0, 0.25, 0.6, 1], P = (u) => (u <= 0.3 ? 1 - (0.45 * u) / 0.3 : (0.55 * (1 - u)) / 0.7);
      let g = "";
      for (let j = 0; j < 3; j++) {
        defs += grad(j, U.map((u, i) => [u, i === j ? P(u) : 0])) + flou(j, sd + D * U[j] * p * 0.45);
        g += copie(j, j ? "lum-ciel-d" : "lum-ciel");
      }
      h += `<g class="lum-b" clip-path="url(#lum-cp${k})">${g}</g>`;
    };
    // lumière de fond de chaque pièce éclairée (toute la pièce, voir lumiereFond) : sous les faisceaux et les taches
    const fonds = new Map();
    const f = ((az + nord) * Math.PI) / 180, sx = Math.sin(f), sy = -Math.cos(f), dore = borne(1 - (e - 4) / 22, 0, 1);
    // teintes : d'origine (auto), ou forcées par `ciel_kelvin` / `soleil_kelvin` (lueur rediffusée un peu plus chaude que la tache)
    const kRgb = (k) => `rgb(${kelvinRgb(k).join(",")})`, op1 = (v) => Math.min(1, v);
    // ciel : blanc légèrement chaud, fondu en écran (il éclaircit le sol, jamais un voile gris), un peu plus doré en thème clair pour rester visible
    const cCiel = K.ciel ? kRgb(K.ciel) : sombre ? "#fff2da" : "#ffe3a6", cLune = sombre ? "#9fb4ff" : "#7986cb";
    const cSoleil = K.soleil ? kRgb(K.soleil) : dore > 0.5 ? (sombre ? "#ffcc80" : "#ffb74d") : (sombre ? "#fff3b0" : "#ffd54f");
    const cRediff = K.soleil ? kRgb(Math.max(1800, K.soleil - 400)) : dore > 0.5 ? (sombre ? "#ffb870" : "#ffa726") : (sombre ? "#ffe9a8" : "#ffca28");
    // fenêtre ou porte vitrée entre deux pièces intérieures avec un côté `dehors` : fenêtre extérieure seulement, pas aussi une verrière
    // (voir ouvertureInterieure)
    const polys = pieces.map(([p, k]) => [p.poly, k]);
    const passe = trans.map((t, i) => (t > 0 && vitrageDe(c.ouvertures[i]) && c.ouvertures[i].dehors && ouvertureInterieure(polys, c.ouvertures[i]) ? 0 : t));
    for (const B of baiesFenetres(c.ouvertures, ouv)) {
      if (B.ouvert <= 0.02) continue;
      const k = salle(B);
      if (k < 0) continue;
      const [a, b, d, ff] = B.seg, [nx, ny] = B.dehors, mil = [(a + d) / 2, (b + ff) / 2], L = Math.hypot(d - a, ff - b), dir = [(d - a) / L, (ff - b) / L];
      const prof = profondeur(B, k), [bas, haut] = vitrageBornes(B, B.largeur), sol = bas < 40, kv = borne((haut - bas) / 125, 0.35, 1.3);
      // lumière du ciel : faisceau de la baie vers l'intérieur, plus profond pour une baie jusqu'au sol, plus court et plus faible pour
      // une petite vitre haute, plus fort côté soleil ; et sa part de la lumière de fond de la pièce
      if (ciel > 0 && M.ciel > 0) {
        const expo = isNaN(az) ? 0 : Math.max(0, nx * sx + ny * sy), p = Math.min(prof, (sol ? 330 : haut - bas < 80 ? 170 : 230) * (0.55 + 0.45 * B.ouvert));
        const k1 = M.ciel * I * ciel * (0.55 + 0.45 * expo) * (0.25 + 0.75 * B.ouvert);
        faisceau(k, B, p, cCiel, op1(k1 * Math.sqrt(kv) * (sombre ? 0.75 : 0.85)));
        fonds.set(k, [...(fonds.get(k) || []), [B.largeur * (haut - bas) * B.ouvert, k1]]);
      }
      const fl = PL ? ((PL.az + nord) * Math.PI) / 180 : 0;
      const astre = jour ? [sx, sy, e, 900] : nuitL > 0 ? (PL ? (PL.haut > 0.5 ? [Math.sin(fl), -Math.cos(fl), PL.haut, 260] : null) : [nx, ny, 40, 260]) : null;
      const t = astre && tacheLumiere(B, astre[0], astre[1], astre[2], 1, astre[3]);
      // la nuit, fenêtre qui ne voit pas la lune (ou lune couchée) : seulement la lueur froide du ciel nocturne
      if (!t && !jour && PL && nuitL > 0) faisceau(k, B, Math.min(prof, 150), cLune, op1(I * nuitL * (0.05 + 0.08 * phase) * (0.25 + 0.75 * B.ouvert)));
      if (!t) continue;
      // lueur rediffusée autour de la tache : rayon de l'ordre de la profondeur de la pièce, intensité selon la surface éclairée
      const s = Math.sqrt(borne(t.aire / 30000, 0, 1)), rl = borne(prof * 0.75, 140, 600), c0 = [t.centre[0] + nx * t.loin * 0.15, t.centre[1] + ny * t.loin * 0.15];
      if (jour) {
        const k0 = I * direct * borne(e / 6, 0.35, 1);
        if (M.soleil > 0) tache(t, k, cSoleil, op1(M.soleil * k0 * (0.3 + 0.4 * t.expo)), ".45");
        lueur("lum-rediff", k, c0, dir, rl, rl * 0.85, cRediff, op1(M.rediffusion * k0 * 0.32 * s));
      } else {
        const k0 = I * nuitL * (0.2 + 0.4 * phase);
        tache(t, k, cLune, k0, "0");
        lueur("lum-rediff", k, c0, dir, rl * 0.7, rl * 0.6, cLune, op1(M.rediffusion * k0 * 0.25 * s));
      }
    }
    // fenêtres de toit : lueur du ciel sous la fenêtre (et part de la lumière de fond), tache de soleil ou de lune projetée au sol,
    // coupée par la pièce qui contient la fenêtre ; store baissé = tache raccourcie, fermé = rien
    for (const [m, ov, i] of vel) {
      if (ov <= 0.02) continue;
      const emp = empriseVelux(m), mil = [(emp[0][0] + emp[2][0]) / 2, (emp[0][1] + emp[2][1]) / 2];
      const k = pieces.find(([p]) => dansPoly(mil, p.poly))?.[1] ?? -1;
      if (k < 0) continue;
      const L = Math.hypot(emp[1][0] - emp[0][0], emp[1][1] - emp[0][1]) || 1, P = Math.hypot(emp[3][0] - emp[0][0], emp[3][1] - emp[0][1]) || 1;
      const dir = [(emp[1][0] - emp[0][0]) / L, (emp[1][1] - emp[0][1]) / L], bas = [(emp[0][0] - emp[3][0]) / P, (emp[0][1] - emp[3][1]) / P];
      if (ciel > 0 && M.ciel > 0) {
        const k1 = M.ciel * I * ciel * 0.8 * (0.25 + 0.75 * ov);
        lueur("lum-ciel lum-velux", k, mil, dir, Math.max(80, L * 1.1), Math.max(90, P * 1.2), cCiel, op1(k1 * (sombre ? 0.55 : 0.65)));
        fonds.set(k, [...(fonds.get(k) || []), [L * P * 1.3 * ov, k1]]);
      }
      // lune sans coordonnées : face à la fenêtre (vers le bas de la pente), à 50°
      const fl = PL ? ((PL.az + nord) * Math.PI) / 180 : 0;
      const astre = jour ? [sx, sy, e, 900] : nuitL > 0 ? (PL ? (PL.haut > 0.5 ? [Math.sin(fl), -Math.cos(fl), PL.haut, 400] : null) : [bas[0], bas[1], 50, 400]) : null;
      const t = astre && tacheVelux(m, astre[0], astre[1], astre[2], ov, astre[3]);
      if (!t) continue;
      const s = Math.sqrt(borne(t.aire / 30000, 0, 1)), rl = borne(Math.sqrt(t.aire) * 1.4, 120, 450), h0 = h.length;
      if (jour) {
        const k0 = I * direct * borne(e / 6, 0.35, 1);
        if (M.soleil > 0) tache(t, k, cSoleil, op1(M.soleil * k0 * (0.3 + 0.4 * Math.min(1, t.expo))), ".55");
        lueur("lum-rediff", k, t.centre, dir, rl, rl * 0.85, cRediff, op1(M.rediffusion * k0 * 0.32 * s));
      } else {
        const k0 = I * nuitL * (0.2 + 0.4 * phase);
        tache(t, k, cLune, k0, "0");
        lueur("lum-rediff", k, t.centre, dir, rl * 0.7, rl * 0.6, cLune, op1(M.rediffusion * k0 * 0.25 * s));
      }
      h = h.slice(0, h0) + h.slice(h0).replace('<polygon class="lum-tache', `<polygon data-vx="${i}" class="lum-tache lum-vx`);
    }
    let fh = "";
    // lumière de fond par espace (pièces ouvertes l'une sur l'autre réunies) : surfaces vitrées de tout l'espace rapportées à son aire,
    // posée sur chacune de ses pièces
    const parEsp = new Map();
    for (const [k, l] of fonds) { const e = esp[k][0]; parEsp.set(e, [...(parEsp.get(e) || []), ...l]); }
    const F = new Map();
    for (const [e, l] of parEsp) {
      const v = lumiereFond(l.map((x) => x[0]), esp[e].reduce((t, j) => t + aireDe(c.pieces[j].poly), 0)) * Math.max(...l.map((x) => x[1])) * (sombre ? 0.2 : 0.28);
      for (const j of esp[e]) F.set(j, v);
    }
    for (const [k, v] of F) fh += this._fondPiece(k, v, cCiel);
    // lumière entre pièces (un seul saut) : fond plus faible dans toute la voisine, et lueur près de l'ouverture
    for (const V of lumiereVoisins(polys, c.ouvertures, passe, F)) {
      fh += this._fondPiece(V.vers, V.fond, cCiel, "lum-voisin");
      const [a, b, d, ff] = c.ouvertures[V.i].seg;
      lueur("lum-voisin-l", V.vers, [V.mil[0] + V.n[0] * V.L * 0.3, V.mil[1] + V.n[1] * V.L * 0.3], [(d - a) / V.L, (ff - b) / V.L], Math.max(70, V.L * 0.9), Math.max(60, V.L * 0.8), cCiel, op1(V.lueur * 1.2));
    }
    const cp = [...clips].map((k) => `<clipPath id="lum-cp${k}">${esp[k].map((j) => `<polygon points="${ptsSvg(c.pieces[j].poly)}"/>`).join("")}</clipPath>`).join("");
    poserHTML(g, h || fh ? `<defs>${cp}${defs}</defs>${fh}${h}` : "");
  }

  // lumière de fond d'une pièce (k = indice dans `pieces`) : toute la pièce légèrement éclaircie, en écran ; op = intensité (0 à 1), col = teinte.
  // Réutilisable pour une pièce voisine éclairée par une porte intérieure ouverte (intensité réduite, même teinte)
  _fondPiece(k, op, col, cls = "") {
    const p = this._config.pieces[k];
    return op >= 0.004 && Array.isArray(p?.poly) && p.poly.length > 2 ? `<polygon class="lum-fond lum-b${cls ? ` ${cls}` : ""}" data-p="${k}" points="${ptsSvg(p.poly)}" fill="${col}" opacity="${op.toFixed(3)}"/>` : "";
  }
}

// ancien nom (plan-maison-card) : brouillons, versions et calques repris une fois sous le nouveau préfixe
for (const st of [() => localStorage, () => sessionStorage]) {
  try {
    const s = st();
    for (const k of Object.keys(s)) if (k.startsWith("plan-maison-") && k !== "plan-maison-demo") {
      const n = "maquette-" + k.slice(12);
      if (s.getItem(n) == null) s.setItem(n, s.getItem(k));
      s.removeItem(k);
    }
  } catch (e) { /* stockage indisponible */ }
}
// versions précédentes gardées par l'éditeur (copies de la carte du dashboard) : celles d'avant les clés anglaises sont converties une fois
try {
  for (const k of Object.keys(localStorage)) if (k.startsWith("maquette-versions:")) {
    const l = JSON.parse(localStorage.getItem(k) || "[]");
    if (Array.isArray(l) && l.some((v) => v && typeof v === "object" && !v.en))
      localStorage.setItem(k, JSON.stringify(l.map((v) => (v && typeof v === "object" && !v.en ? { ...v, config: versAnglais(v.config), en: 1 } : v))));
  }
} catch (e) { /* stockage indisponible ou illisible */ }

console.info(`%c MAQUETTE %c ${VERSION} `, "color:#fff;background:#1a73e8;font-weight:700", "color:#1a73e8;background:#fff");
// une page restée ouverte pendant une mise à jour garde l'ancienne définition : il faut recharger la page
const DEPOT = "https://github.com/TooMuhtsh/maquette-card";
class MaquetteCardDemo extends MaquetteCard {
  setConfig(c) { super.setConfig({ ...(c || {}), demo: true }); }
  static getStubConfig() { return {}; }
}
// les anciens noms restent des alias : une sous-classe, car un même constructeur ne peut être défini deux fois
for (const [nom, C] of [["maquette-card", MaquetteCard], ["maquette-card-demo", MaquetteCardDemo],
  ["plan-maison-card", class extends MaquetteCard {}], ["plan-maison-card-demo", class extends MaquetteCardDemo {}]]) {
  if (!customElements.get(nom)) customElements.define(nom, C);
}
window.customCards = window.customCards || [];
for (const c of [{ type: "maquette-card", name: "Maquette", description: _t("Plan interactif en direct (ouvertures, volets, lumières, températures), avec éditeur intégré.") },
  // la même carte en démo : choisie dans le sélecteur de cartes, elle montre l'appartement de démonstration
  { type: "maquette-card-demo", name: _t("Maquette — démo"), description: _t("Un appartement de démonstration aux états simulés : toutes les fonctions sans rien configurer, sans rien commander.") }]) {
  if (!window.customCards.some((x) => x.type === c.type)) window.customCards.push({ ...c, documentationURL: DEPOT });
}
// dashboards « Maquette » (vierge) et « Maquette — démo » dans « Ajouter un tableau de bord » ;
// le plan vierge porte un id : l'éditeur reprend la main sur le dashboard (vues explicites) au premier enregistrement
const vuePlan = (demo) => ({ title: demo ? _t("Démo") : _t("Plan"), path: "plan", icon: "mdi:floor-plan", type: "panel",
  cards: [versAnglais(demo ? { type: "custom:maquette-card", demo: true } : { type: "custom:maquette-card", id: "plan", titre: _t("Ma maison") })] });
for (const [t, demo] of [["maquette", false], ["maquette-demo", true], ["plan-maison", false], ["plan-maison-demo", true]]) {
  if (!customElements.get(`ll-strategy-dashboard-${t}`)) customElements.define(`ll-strategy-dashboard-${t}`, class extends HTMLElement {
    static async generate(config, hass) {
      if (hass) globalThis.MaquetteI18n.definir(hass);
      return { title: demo ? _t("Maquette (démo)") : _t("Maison"), views: [vuePlan(demo)] };
    }
  });
}
window.customStrategies = window.customStrategies || [];
for (const [t, n, d] of [["maquette", "Maquette", _t("Un plan vierge à dessiner avec l'éditeur intégré (pièces de Home Assistant, import, dessin).")],
  ["maquette-demo", _t("Maquette — démo"), _t("L'appartement de démonstration : animations, météo, replay, alertes… avec des états simulés.")]]) {
  if (!window.customStrategies.some((x) => x.type === t)) window.customStrategies.push({ type: t, strategyType: "dashboard", name: n, description: d, documentationURL: DEPOT });
}
