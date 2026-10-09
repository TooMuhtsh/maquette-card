// Appartement fictif de démonstration (cotes en cm).
import { creerHass, LANGUE } from "./mock-ha.js";

// textes de la démo en anglais (la page suit la langue du navigateur ou ?lang=en|fr ; les prénoms restent tels quels)
const EN = {"Baie du séjour": "Living room bay window", "Fenêtre chambre": "Bedroom window", "Fenêtre bureau": "Office window", "Porte d'entrée": "Front door", "Fenêtre salle de bain": "Bathroom window", "Appartement démo": "Demo apartment", "Balcon": "Balcony", "Séjour": "Living room", "Raccourcis du séjour": "Living room shortcuts", "Mode cinéma": "Movie mode", "Chambre": "Bedroom", "Bureau": "Office", "Salle de bain": "Bathroom", "Entrée": "Entrance", "Rue": "Street", "Tarif en direct": "Live rate", "Puissance appelée": "Power draw", "Consommation": "Consumption", "Énergie": "Energy", "Coût": "Cost", "Voiture": "Car", "Maison en direct": "Home right now", "Machine à café": "Coffee machine", "Lampe du séjour": "Living room lamp", "Plafonnier cuisine": "Kitchen ceiling light", "Lampe de chevet": "Bedside lamp", "Lampe du bureau": "Office lamp", "Téléviseur": "TV", "Machine à café puissance": "Coffee machine power", "Caméra de l'entrée": "Entrance camera", "Mouvement entrée": "Entrance motion", "Volet du séjour": "Living room shutter", "Volet chambre": "Bedroom shutter", "Extérieur": "Outdoor", "Prix du kWh": "kWh price", "Heures creuses": "Off-peak hours", "Période": "Period", "Bleu": "Blue", "Blanc": "White", "Puissance maison": "Home power", "Batterie": "Battery", "Autonomie": "Range", "Cinéma": "Movie", "Volets au coucher du soleil": "Shutters at sunset", "Lumière sur mouvement (entrée)": "Light on motion (entrance)", "Alerte fenêtre ouverte + chauffage": "Window open + heating alert", "Prise borne": "Charger plug", "Borne énergie aujourd'hui": "Charger energy today", "Borne énergie du mois": "Charger energy this month", "Borne coût aujourd'hui": "Charger cost today", "Borne tension": "Charger voltage", "Borne température": "Charger temperature", "Borne surchauffe": "Charger overheating", "Linky tension": "Linky voltage", "Linky courant": "Linky current", "Linky puissance active": "Linky active power", "Linky conso aujourd'hui": "Linky usage today", "Linky conso hier": "Linky usage yesterday", "Linky puissance souscrite": "Linky subscribed power", "Prise TV": "TV plug", "Prise TV puissance": "TV plug power", "Prise TV énergie": "TV plug energy", "Prise frigo": "Fridge plug", "Frigo puissance": "Fridge power", "Frigo énergie": "Fridge energy", "Chaudière départ": "Boiler flow temperature", "Chaudière": "Boiler", "Meuble TV": "TV unit", "Frigo": "Fridge", "Énergie totale": "Total energy", "Tableau électrique": "Electrical panel", "Borne": "Charger", "Recharge voiture": "Car charging", "Aujourd'hui": "Today", "Coût aujourd'hui": "Cost today", "Portail": "Gate", "Portail ouvert": "Gate open", "Portail manœuvres aujourd'hui": "Gate cycles today", "Porte de garage": "Garage door", "Baie du séjour batterie": "Living room bay window battery", "Baie du séjour manipulation": "Living room bay window tampering", "Ouvertures du séjour aujourd'hui": "Living room openings today", "Aération du séjour aujourd'hui": "Living room airing today", "Baie du séjour signal": "Living room bay window signal", "Contact baie du séjour": "Living room bay window contact", "Motorisation du portail": "Gate motor", "Volet": "Shutter", "Capteur": "Sensor", "Puissance": "Power", "Garage": "Garage", "Soleil": "Sun", "Lune": "Moon", "Maison": "Home", "Détecteur de fumée": "Smoke detector", "Météo": "Weather", "Fumée détectée": "Smoke detected", "Ouverture alors que la maison est vide": "Opening while the home is empty", "Ma maison": "My home", "CO₂ du séjour": "Living room CO₂", "CO₂ de la chambre": "Bedroom CO₂", "Luminosité du bureau": "Office illuminance", "Serrure de l'entrée": "Front door lock", "Fuite salle de bain": "Bathroom leak", "Fuite sous l'évier": "Leak under the sink", "Porte du balcon": "Balcony door", "Volet de la porte du balcon": "Balcony door shutter", "Volet du bureau": "Office shutter", "Store du bureau": "Office blind"};
const L = (s) => (LANGUE === "fr" ? s : EN[s] ?? s);

const murs = [], ouvertures = [];
function mur(x1, y1, x2, y2, trous = []) {
  const hz = y1 === y2;
  let cur = hz ? x1 : y1;
  const fin = hz ? x2 : y2;
  for (const [d, f, o] of trous.sort((a, b) => a[0] - b[0])) {
    if (d - cur > 0.5) murs.push(hz ? [cur, y1, d, y1] : [x1, cur, x1, d]);
    if (o) ouvertures.push({ ...o, seg: hz ? [d, y1, f, y1] : [x1, d, x1, f] });
    cur = f;
  }
  if (fin - cur > 0.5) murs.push(hz ? [cur, y1, fin, y1] : [x1, cur, x1, fin]);
}
mur(0, 0, 900, 0, [[90, 410, { type: "window", name: L("Baie du séjour"), contact: "binary_sensor.baie_sejour", shutter: "cover.volet_sejour", outside: [0, -1] }],
  [600, 800, { type: "window", name: L("Fenêtre chambre"), contact: "binary_sensor.fenetre_chambre", shutter: "cover.volet_chambre", outside: [0, -1] }]]);
mur(900, 0, 900, 700, [[450, 600, { type: "window", name: L("Fenêtre bureau"), contact: "binary_sensor.fenetre_bureau", outside: [1, 0] }]]);
mur(0, 700, 900, 700, [[320, 410, { type: "door", name: L("Porte d'entrée"), contact: "binary_sensor.porte_entree", outside: [0, 1] }]]);
mur(0, 0, 0, 700, [[500, 600, { type: "window", name: L("Fenêtre salle de bain"), contact: "binary_sensor.fenetre_sdb", outside: [-1, 0] }]]);
mur(500, 0, 500, 700, [[190, 270, { type: "door", outside: [-1, 0] }], [500, 580, { type: "door", outside: [1, 0] }]]);
mur(0, 420, 500, 420, [[290, 410, null]]);
mur(250, 420, 250, 700, [[520, 600, { type: "door", outside: [-1, 0] }]]);
mur(500, 350, 900, 350);
const limites = [[0, -170, 500, -170], [0, -170, 0, 0], [500, -170, 500, 0]];
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

export const CONFIG = {
  type: "custom:maquette-card", id: "demo", title: L("Appartement démo"),
  rooms: [
    { name: L("Balcon"), outside: true, poly: R(0, -170, 500, 170), label: [250, -85], temperature: "sensor.exterieur_temperature" },
    { name: L("Séjour"), area: "sejour", poly: R(0, 0, 500, 420), label: [300, 250], temperature: "sensor.sejour_temperature", humidity: "sensor.sejour_humidite",
      panels: { right: [{ type: "entities", title: L("Raccourcis du séjour"), icon: "mdi:sofa-outline", entities: [{ entity: "light.sejour" }, { entity: "light.cuisine" }, { entity: "switch.machine_cafe" }] }] },
      actions: [{ name: L("Mode cinéma"), icon: "mdi:movie-open-outline", action: "scene.turn_on", target: "scene.cinema" }] },
    { name: L("Chambre"), area: "chambre", poly: R(500, 0, 400, 350), label: [700, 175], temperature: "sensor.chambre_temperature", humidity: "sensor.chambre_humidite" },
    { name: L("Bureau"), area: "bureau", poly: R(500, 350, 400, 350), label: [700, 600], temperature: "sensor.bureau_temperature", humidity: "sensor.bureau_humidite" },
    { name: L("Salle de bain"), poly: R(0, 420, 250, 280), label: [125, 640], temperature: "sensor.sdb_temperature", humidity: "sensor.sdb_humidite" },
    { name: L("Entrée"), poly: R(250, 420, 250, 280), label: [375, 640] },
  ],
  walls: murs, fences: limites, openings: ouvertures,
  badges: [
    { entity: "light.sejour", pos: [230, 200], icon: "mdi:floor-lamp", color: "#f6c445", halo: 170, room: L("Séjour") },
    { entity: "light.cuisine", pos: [70, 70], icon: "mdi:ceiling-light", color: "#f6c445", halo: 120, room: L("Séjour") },
    { entity: "light.chambre", pos: [700, 90], icon: "mdi:lamp", color: "#f6c445", halo: 140, room: L("Chambre") },
    { entity: "light.bureau", pos: [700, 480], icon: "mdi:lightbulb", color: "#f6c445", halo: 140, room: L("Bureau") },
    { entity: "media_player.tv", pos: [440, 330], icon: "mdi:television", color: "#9334e6" },
    { entity: "switch.machine_cafe", pos: [160, 60], icon: "mdi:coffee-maker-outline", color: "#1a73e8", value: "sensor.machine_cafe_puissance", active: "sensor.machine_cafe_puissance", threshold: 20 },
    { entity: "camera.entree", pos: [460, 670], icon: "mdi:cctv", color: "#d93025", active: "binary_sensor.mouvement_entree", alert: true },
    { entity: "climate.thermostat", pos: [470, 455], icon: "mdi:thermostat", color: "#e8710a", attribute: "temperature", unit: " °C", active_attribute: "hvac_action" },
  ],
  texts: [{ text: L("Rue"), pos: [450, 760] }],
  panels: {
    left: [
      { type: "tariff", title: L("Tarif en direct"), price: "sensor.prix_kwh", period: "sensor.periode_tarifaire", color_today: "sensor.tempo_aujourdhui", color_tomorrow: "sensor.tempo_demain" },
      { type: "gauge", title: L("Puissance appelée"), entity: "sensor.puissance_apparente", min: 0, max: 6000, unit: "VA", decimals: 0 },
      { type: "periods", title: L("Consommation"), icon: "mdi:home-lightning-bolt-outline", columns: [
        { name: L("Énergie"), unit: "kWh", stat: "sensor.energie_totale", factor: 0.001, decimals: 1 }, { name: L("Coût"), unit: "€", stat: "sensor.energie_totale_cout", decimals: 2 }] },
    ],
    right: [
      { type: "ev", title: L("Voiture"), battery: "sensor.ve_batterie", range: "sensor.ve_autonomie", power: "sensor.borne_puissance", plugged: "binary_sensor.ve_branche", session_kwh: "sensor.borne_session", session_cost: "sensor.borne_session_cout" },
      { type: "tile", title: L("Maison en direct"), icon: "mdi:home-lightning-bolt", entity: "sensor.puissance_maison", unit: "W", decimals: 0, history: 24,
        rows: [{ entity: "sensor.machine_cafe_puissance", name: L("Machine à café"), icon: "mdi:coffee-maker-outline" }] },
    ],
  },
};

const S = (state, attributes = {}) => ({ state: String(state), attributes, last_changed: new Date().toISOString(), last_updated: new Date().toISOString() });
const etats = {
  "light.sejour": S("on", { friendly_name: L("Lampe du séjour"), color_mode: "rgb", rgb_color: [186, 104, 255], brightness: 200 }), "light.cuisine": S(new URLSearchParams(location.search).has("cuisine") ? "on" : "off", { friendly_name: L("Plafonnier cuisine"), color_mode: "color_temp", color_temp_kelvin: 2700, brightness: 255 }),
  "light.chambre": S("off", { friendly_name: L("Lampe de chevet"), color_mode: "color_temp", color_temp_kelvin: 2200, brightness: 120 }), "light.bureau": S("on", { friendly_name: L("Lampe du bureau"), color_mode: "color_temp", color_temp_kelvin: 5000, brightness: 230 }),
  "media_player.tv": S("playing", { friendly_name: L("Téléviseur"), device_class: "tv" }),
  "switch.machine_cafe": S("on", { friendly_name: L("Machine à café") }), "sensor.machine_cafe_puissance": S(1180, { friendly_name: L("Machine à café puissance"), unit_of_measurement: "W", device_class: "power" }),
  "camera.entree": S("idle", { friendly_name: L("Caméra de l'entrée") }), "binary_sensor.mouvement_entree": S("off", { friendly_name: L("Mouvement entrée"), device_class: "motion" }),
  "climate.thermostat": S("heat", { friendly_name: "Thermostat", temperature: 20, hvac_action: "heating", current_temperature: 20.4 }),
  "binary_sensor.baie_sejour": S("on", { friendly_name: L("Baie du séjour"), device_class: "window" }), "cover.volet_sejour": S("open", { friendly_name: L("Volet du séjour"), current_position: 70, device_class: "shutter" }),
  "binary_sensor.fenetre_chambre": S("off", { friendly_name: L("Fenêtre chambre"), device_class: "window" }), "cover.volet_chambre": S("closed", { friendly_name: L("Volet chambre"), current_position: 0, device_class: "shutter" }),
  "binary_sensor.fenetre_bureau": S("off", { friendly_name: L("Fenêtre bureau"), device_class: "window" }), "binary_sensor.fenetre_sdb": S("off", { friendly_name: L("Fenêtre salle de bain"), device_class: "window" }),
  "binary_sensor.porte_entree": S("off", { friendly_name: L("Porte d'entrée"), device_class: "door" }),
  "sensor.exterieur_temperature": S(11.2, { unit_of_measurement: "°C", device_class: "temperature", friendly_name: L("Extérieur") }),
  "sensor.sejour_temperature": S(21.3, { unit_of_measurement: "°C", device_class: "temperature" }), "sensor.sejour_humidite": S(48, { unit_of_measurement: "%", device_class: "humidity" }),
  "sensor.chambre_temperature": S(18.6, { unit_of_measurement: "°C", device_class: "temperature" }), "sensor.chambre_humidite": S(52, { unit_of_measurement: "%", device_class: "humidity" }),
  "sensor.bureau_temperature": S(23.9, { unit_of_measurement: "°C", device_class: "temperature" }), "sensor.bureau_humidite": S(44, { unit_of_measurement: "%", device_class: "humidity" }),
  "sensor.sdb_temperature": S(24.8, { unit_of_measurement: "°C", device_class: "temperature" }), "sensor.sdb_humidite": S(71, { unit_of_measurement: "%", device_class: "humidity" }),
  "sensor.prix_kwh": S(0.1296, { unit_of_measurement: "€/kWh", friendly_name: L("Prix du kWh") }), "sensor.periode_tarifaire": S(L("Heures creuses"), { friendly_name: L("Période") }),
  "sensor.tempo_aujourdhui": S(L("Bleu")), "sensor.tempo_demain": S(L("Blanc")),
  "sensor.puissance_apparente": S(2310, { unit_of_measurement: "VA" }), "sensor.puissance_maison": S(1840, { unit_of_measurement: "W", friendly_name: L("Puissance maison") }),
  "sensor.energie_totale": S(5123456, { unit_of_measurement: "Wh" }), "sensor.energie_totale_cout": S(812.4, { unit_of_measurement: "€" }),
  "sensor.ve_batterie": S(64, { unit_of_measurement: "%", friendly_name: L("Batterie") }), "sensor.ve_autonomie": S(238, { unit_of_measurement: "km", friendly_name: L("Autonomie") }),
  "sensor.borne_puissance": S(2280, { unit_of_measurement: "W" }), "binary_sensor.ve_branche": S("on", { device_class: "plug" }),
  "sensor.borne_session": S(6.4, { unit_of_measurement: "kWh" }), "sensor.borne_session_cout": S(0.83, { unit_of_measurement: "€" }),
  "scene.cinema": S("2026-10-01T20:00:00", { friendly_name: L("Cinéma") }),
  "automation.volets_coucher_soleil": S("on", { friendly_name: L("Volets au coucher du soleil"), last_triggered: new Date(Date.now() - 5 * 3600e3).toISOString() }),
  "automation.lampe_mouvement_entree": S("on", { friendly_name: L("Lumière sur mouvement (entrée)"), last_triggered: new Date(Date.now() - 12 * 60e3).toISOString() }),
  "automation.alerte_fenetre_chauffage": S("off", { friendly_name: L("Alerte fenêtre ouverte + chauffage"), last_triggered: null }),
  // appareils des meubles connectés (?meubles) : borne, tableau électrique, TV, frigo, chaudière
  "switch.borne": S("on", { friendly_name: L("Prise borne") }), "sensor.borne_energie_jour": S(8.2, { friendly_name: L("Borne énergie aujourd'hui"), unit_of_measurement: "kWh", device_class: "energy" }),
  "sensor.borne_energie_mois": S(96.4, { friendly_name: L("Borne énergie du mois"), unit_of_measurement: "kWh", device_class: "energy" }),
  "sensor.borne_cout_jour": S(1.06, { friendly_name: L("Borne coût aujourd'hui"), unit_of_measurement: "€", device_class: "monetary" }),
  "sensor.borne_tension": S(231.4, { friendly_name: L("Borne tension"), unit_of_measurement: "V", device_class: "voltage" }),
  "sensor.borne_temperature": S(41.5, { friendly_name: L("Borne température"), unit_of_measurement: "°C", device_class: "temperature" }),
  "binary_sensor.borne_surchauffe": S("off", { friendly_name: L("Borne surchauffe"), device_class: "problem" }),
  "sensor.linky_tension": S(229.8, { friendly_name: L("Linky tension"), unit_of_measurement: "V", device_class: "voltage" }),
  "sensor.linky_courant": S(10, { friendly_name: L("Linky courant"), unit_of_measurement: "A", device_class: "current" }),
  "sensor.linky_puissance_active": S(2140, { friendly_name: L("Linky puissance active"), unit_of_measurement: "W", device_class: "power" }),
  "sensor.linky_conso_jour": S(12.6, { friendly_name: L("Linky conso aujourd'hui"), unit_of_measurement: "kWh", device_class: "energy" }),
  "sensor.linky_conso_hier": S(17.9, { friendly_name: L("Linky conso hier"), unit_of_measurement: "kWh", device_class: "energy" }),
  "sensor.linky_puissance_souscrite": S(9, { friendly_name: L("Linky puissance souscrite"), unit_of_measurement: "kVA" }),
  "switch.prise_tv": S("on", { friendly_name: L("Prise TV") }), "sensor.prise_tv_puissance": S(96, { friendly_name: L("Prise TV puissance"), unit_of_measurement: "W", device_class: "power" }),
  "sensor.prise_tv_energie": S(184.2, { friendly_name: L("Prise TV énergie"), unit_of_measurement: "kWh", device_class: "energy" }),
  "switch.prise_frigo": S("on", { friendly_name: L("Prise frigo") }), "sensor.prise_frigo_puissance": S(84, { friendly_name: L("Frigo puissance"), unit_of_measurement: "W", device_class: "power" }),
  "sensor.prise_frigo_energie": S(312.7, { friendly_name: L("Frigo énergie"), unit_of_measurement: "kWh", device_class: "energy" }),
  "sensor.chaudiere_depart": S(48.5, { friendly_name: L("Chaudière départ"), unit_of_measurement: "°C", device_class: "temperature" }),
  // équipements pour les widgets prêts à l'emploi (pré-remplissage) : CO₂ (deux pièces), luminosité, serrure, fuites d'eau
  "sensor.sejour_co2": S(870, { friendly_name: L("CO₂ du séjour"), unit_of_measurement: "ppm", device_class: "carbon_dioxide" }),
  "sensor.chambre_co2": S(640, { friendly_name: L("CO₂ de la chambre"), unit_of_measurement: "ppm", device_class: "carbon_dioxide" }),
  "sensor.bureau_luminosite": S(320, { friendly_name: L("Luminosité du bureau"), unit_of_measurement: "lx", device_class: "illuminance" }),
  "lock.entree": S("locked", { friendly_name: L("Serrure de l'entrée"), supported_features: 1 }),
  "binary_sensor.fuite_sdb": S("off", { friendly_name: L("Fuite salle de bain"), device_class: "moisture" }),
  "binary_sensor.fuite_cuisine": S("off", { friendly_name: L("Fuite sous l'évier"), device_class: "moisture" }),
  // capteurs pas encore sur le plan (éditeur d'ouvertures : pré-remplissage à la pose, suggestions) : porte du balcon avec son volet
  // (chambre), volet et store du bureau
  "binary_sensor.porte_balcon_chambre": S("off", { friendly_name: L("Porte du balcon"), device_class: "door" }),
  "cover.volet_balcon_chambre": S("open", { friendly_name: L("Volet de la porte du balcon"), current_position: 100, device_class: "shutter" }),
  "cover.volet_bureau_est": S("open", { friendly_name: L("Volet du bureau"), current_position: 100, device_class: "shutter" }),
  "cover.store_bureau_est": S("closed", { friendly_name: L("Store du bureau"), current_position: 0, device_class: "blind" }),
};
const areas = { sejour: { area_id: "sejour", name: L("Séjour") }, chambre: { area_id: "chambre", name: L("Chambre") }, bureau: { area_id: "bureau", name: L("Bureau") } };
const devices = { dev_borne: { id: "dev_borne", name: L("Prise borne") }, dev_linky: { id: "dev_linky", name: "Linky" }, dev_tv: { id: "dev_tv", name: "TV" },
  dev_frigo: { id: "dev_frigo", name: L("Prise frigo") }, dev_chaudiere: { id: "dev_chaudiere", name: L("Chaudière") } };
const entities = {};
for (const [e, z] of Object.entries({ "light.sejour": "sejour", "light.cuisine": "sejour", "media_player.tv": "sejour", "switch.machine_cafe": "sejour", "sensor.sejour_temperature": "sejour",
  "cover.volet_sejour": "sejour", "binary_sensor.baie_sejour": "sejour", "light.chambre": "chambre", "cover.volet_chambre": "chambre", "light.bureau": "bureau",
  "sensor.sejour_co2": "sejour", "sensor.chambre_co2": "chambre", "sensor.bureau_luminosite": "bureau",
  "binary_sensor.porte_balcon_chambre": "chambre", "cover.volet_balcon_chambre": "chambre", "cover.volet_bureau_est": "bureau", "cover.store_bureau_est": "bureau" })) entities[e] = { entity_id: e, area_id: z };
// appareils (device_id) sans pièce : ils ne changent rien à l'import des pièces HA
for (const [dev, l] of Object.entries({ dev_borne: ["switch.borne", "sensor.borne_puissance", "sensor.borne_session", "sensor.borne_session_cout", "sensor.borne_energie_jour", "sensor.borne_energie_mois",
    "sensor.borne_cout_jour", "sensor.borne_tension", "sensor.borne_temperature", "binary_sensor.borne_surchauffe"],
  dev_linky: ["sensor.puissance_apparente", "sensor.linky_puissance_active", "sensor.linky_tension", "sensor.linky_courant", "sensor.linky_conso_jour", "sensor.linky_conso_hier", "sensor.linky_puissance_souscrite"],
  dev_tv: ["media_player.tv", "switch.prise_tv", "sensor.prise_tv_puissance", "sensor.prise_tv_energie"], dev_frigo: ["switch.prise_frigo", "sensor.prise_frigo_puissance", "sensor.prise_frigo_energie"],
  dev_chaudiere: ["climate.thermostat", "sensor.chaudiere_depart"] })) for (const e of l) entities[e] = { ...(entities[e] || { entity_id: e }), device_id: dev };
entities["sensor.borne_temperature"].entity_category = "diagnostic";
const lies = { sejour: { automation: ["automation.volets_coucher_soleil", "automation.alerte_fenetre_chauffage"], scene: ["scene.cinema"] },
  chambre: { automation: ["automation.volets_coucher_soleil"] }, bureau: {} };

// ?meubles : la démo meublée, avec des meubles connectés (borne avec sa fiche, frigo protégé, TV et tableau électrique à compléter)
export const MEUBLES_DEMO = [
  { type: "rug", pos: [250, 250], size: [220, 150] }, { type: "sofa", pos: [250, 345], size: [200, 90], rotation: 180 }, { type: "coffee_table", pos: [250, 250] },
  { type: "tv_unit", pos: [400, 30], name: L("Meuble TV"), entity: "media_player.tv", value: "sensor.prise_tv_puissance" },
  { type: "fridge", pos: [38, 150], rotation: 90, name: L("Frigo"), entity: "switch.prise_frigo", value: "sensor.prise_frigo_puissance", active: "sensor.prise_frigo_puissance", threshold: 5, protected: true,
    card: { title: L("Frigo"), widgets: [{ type: "tile", title: L("Consommation"), icon: "mdi:fridge-outline", entity: "sensor.prise_frigo_puissance", unit: "W", decimals: 0, history: 24, rows: [{ entity: "sensor.prise_frigo_energie", name: L("Énergie totale") }] }] } },
  { type: "electrical_panel", pos: [492, 560], rotation: 90, name: L("Tableau électrique"), entity: "sensor.linky_puissance_active", value: "sensor.puissance_apparente" },
  { type: "ev_charger", pos: [470, -150], name: L("Borne"), entity: "switch.borne", value: "sensor.borne_puissance", active: "sensor.borne_puissance", threshold: 50,
    card: { title: L("Recharge voiture"), widgets: [
      { type: "ev", title: L("Voiture"), battery: "sensor.ve_batterie", range: "sensor.ve_autonomie", power: "sensor.borne_puissance", plugged: "binary_sensor.ve_branche", session_kwh: "sensor.borne_session", session_cost: "sensor.borne_session_cout" },
      { type: "entities", title: L("Borne"), icon: "mdi:ev-station", entities: [{ entity: "switch.borne" }, { entity: "sensor.borne_energie_jour", name: L("Aujourd'hui") }, { entity: "sensor.borne_cout_jour", name: L("Coût aujourd'hui"), decimals: 2 }, { entity: "sensor.borne_tension" }] }] } },
  { type: "desk", pos: [790, 610] }, { type: "double_bed", pos: [790, 175], size: [160, 200], rotation: 270 }, { type: "boiler", pos: [30, 450], rotation: 90, entity: "climate.thermostat" },
];
const params = new URLSearchParams(location.search);
const MEUBLEE = { ...CONFIG, id: "demo-meubles", furniture: MEUBLES_DEMO, badges: [...CONFIG.badges, { entity: "switch.borne", pos: [420, -110], icon: "mdi:ev-station", color: "#188038", value: "sensor.borne_puissance", active: "sensor.borne_puissance", threshold: 50 }] };
// ?fiches : la démo meublée, avec des fiches sur une baie, un portail motorisé et une pastille (widgets « commande » compris)
const FICHES = params.has("fiches");
if (FICHES) {
  Object.assign(etats, {
    "cover.portail": S("closed", { friendly_name: L("Portail"), device_class: "gate", supported_features: 11 }),
    "binary_sensor.portail_ferme": S("off", { friendly_name: L("Portail ouvert"), device_class: "opening" }),
    "sensor.portail_manoeuvres_jour": S(4, { friendly_name: L("Portail manœuvres aujourd'hui"), unit_of_measurement: "×" }),
    "cover.garage": S("closed", { friendly_name: L("Porte de garage"), device_class: "garage", current_position: 0, supported_features: 15 }),
    "sensor.baie_sejour_batterie": S(87, { friendly_name: L("Baie du séjour batterie"), unit_of_measurement: "%", device_class: "battery" }),
    "binary_sensor.baie_sejour_manipulation": S("off", { friendly_name: L("Baie du séjour manipulation"), device_class: "tamper" }),
    "sensor.ouvertures_sejour_jour": S(6, { friendly_name: L("Ouvertures du séjour aujourd'hui"), unit_of_measurement: "×" }),
    "sensor.aeration_sejour_jour": S(0.8, { friendly_name: L("Aération du séjour aujourd'hui"), unit_of_measurement: "h" }),
    "sensor.baie_sejour_signal": S(112, { friendly_name: L("Baie du séjour signal"), unit_of_measurement: "lqi" }),
  });
  Object.assign(devices, { dev_baie: { id: "dev_baie", name: L("Contact baie du séjour") }, dev_portail: { id: "dev_portail", name: L("Motorisation du portail") } });
  for (const [dev, l] of Object.entries({ dev_baie: ["binary_sensor.baie_sejour", "sensor.baie_sejour_batterie", "binary_sensor.baie_sejour_manipulation", "sensor.ouvertures_sejour_jour", "sensor.aeration_sejour_jour", "sensor.baie_sejour_signal"],
    dev_portail: ["cover.portail", "binary_sensor.portail_ferme", "sensor.portail_manoeuvres_jour"] })) for (const e of l) entities[e] = { ...(entities[e] || { entity_id: e }), device_id: dev };
  entities["sensor.baie_sejour_signal"].entity_category = "diagnostic";
}
const CONFIG_FICHES = { ...MEUBLEE, id: "demo-fiches",
  openings: [...MEUBLEE.openings.map((o) => (o.contact === "binary_sensor.baie_sejour" ? { ...o, card: { widgets: [
      { type: "cover", title: L("Volet"), entity: "cover.volet_sejour" },
      { type: "entities", title: L("Capteur"), icon: "mdi:window-closed-variant", entities: [{ entity: "binary_sensor.baie_sejour" }, { entity: "sensor.baie_sejour_batterie" }, { entity: "binary_sensor.baie_sejour_manipulation" }] },
      { type: "entities", title: L("Aujourd'hui"), icon: "mdi:counter", entities: [{ entity: "sensor.ouvertures_sejour_jour" }, { entity: "sensor.aeration_sejour_jour" }] }] } } : o)),
    { type: "gate", name: L("Portail"), entity: "cover.portail", seg: [150, -170, 350, -170], outside: [0, -1], card: { widgets: [{ type: "cover", title: L("Portail"), entity: "cover.portail", confirm: true }] } }],
  badges: MEUBLEE.badges.map((p) => (p.entity === "switch.machine_cafe" ? { ...p, name: L("Machine à café"), card: { widgets: [{ type: "tile", title: L("Puissance"), icon: "mdi:flash", entity: "sensor.machine_cafe_puissance", unit: "W", decimals: 0, history: 24 }] } } : p)),
  panels: { ...CONFIG.panels, right: [{ type: "cover", title: L("Garage"), entity: "cover.garage" }, ...CONFIG.panels.right] } };
// ?ambiance : la démo meublée avec l'ambiance (soleil, météo, traces, lumière) et quelques animations ; &meteo=rainy&elev=5&az=240&vent=20&lune=new_moon&cuisine
const AMB = params.has("ambiance");
if (AMB) Object.assign(etats, {
  "sun.sun": S(+(params.get("elev") ?? 30) > 0 ? "above_horizon" : "below_horizon", { friendly_name: L("Soleil"), elevation: +(params.get("elev") ?? 30), azimuth: +(params.get("az") ?? 220), next_setting: new Date(Date.now() + 3 * 3600e3).toISOString() }),
  "person.sam": S(params.get("sam") || "home", { friendly_name: "Sam", latitude: 45.79, longitude: 4.93 }),
  "person.camille": S(params.get("camille") || "not_home", { friendly_name: "Camille", latitude: 45.70, longitude: 4.78 }),
  "zone.home": S(params.get("sam") === "not_home" && params.get("camille") !== "home" ? 0 : 1, { friendly_name: L("Maison") }),
  "sensor.moon_phase": S(params.get("lune") || "full_moon", { friendly_name: L("Lune"), device_class: "enum" }),
  "binary_sensor.detecteur_fumee": S(params.has("fumee") ? "on" : "off", { friendly_name: L("Détecteur de fumée"), device_class: "smoke" }),
  "weather.maison": S(params.get("meteo") || "partlycloudy", { friendly_name: L("Météo"), temperature: 14, cloud_coverage: params.get("nuages") != null ? +params.get("nuages") : undefined, wind_speed: +(params.get("vent") ?? 12), wind_speed_unit: "km/h", wind_bearing: 250 }),
});
const CONFIG_AMB = { ...MEUBLEE, id: "demo-ambiance", ambience: { north: 45, weather: "weather.maison", traces: 10, ...(params.get("intensite") ? { intensity: { discret: "subtle", fort: "strong" }[params.get("intensite")] || params.get("intensite") } : {}) },
  animations: { light: { type: "halo" }, furniture: { type: "wave" } } };
CONFIG_AMB.ambience.energy = {}; CONFIG_AMB.ambience.people = { home: L("Séjour") };
CONFIG_AMB.alerts = [{ name: L("Fumée détectée"), entities: ["binary_sensor.detecteur_fumee"] }, { name: L("Ouverture alors que la maison est vide"), type: "openings", when_away: true }];
if (params.has("vitrine")) CONFIG_AMB.showcase = true;
CONFIG_AMB.replay = true;
// ?neuf : vraie carte vide (premier usage)
let config = params.has("neuf") ? { type: "custom:maquette-card", id: "demo", title: L("Ma maison") } : FICHES ? CONFIG_FICHES : AMB ? CONFIG_AMB : params.has("meubles") ? MEUBLEE : CONFIG;
// plan de la démo enregistré par l'éditeur ; enregistré avant les clés anglaises (rooms…), il est converti une fois
try {
  let c = JSON.parse(localStorage.getItem("maquette-demo") || "null");
  if (c && "pieces" in c && !("rooms" in c)) { c = customElements.get("maquette-card").versAnglais(c); localStorage.setItem("maquette-demo", JSON.stringify(c)); }
  if (c && !params.has("neuf") && c.id === config.id) config = c;
} catch (e) { /* stockage indisponible */ }
const memo = { actuelle: config };
const carte = document.querySelector("maquette-card");
let hass;
const appliquer = (e, state, attrs = {}) => {
  etats[e] = { ...etats[e], state, attributes: { ...etats[e].attributes, ...attrs }, last_changed: new Date().toISOString() };
  hass = { ...hass, states: { ...etats } };
  carte.hass = hass;
};
hass = creerHass({ etats, areas, devices, entities, lies, config: memo, appliquer });
// coordonnées de la maison (personnes dehors : direction et distance ; direction de la lune) ; ?sans_coord : aucune (lune dans l'axe des fenêtres)
hass.config = params.has("sans_coord") ? {} : { latitude: 45.76, longitude: 4.84 };
carte.setConfig(config);
carte.hass = hass;
// un peu de vie : la puissance varie, un mouvement passe de temps en temps
setInterval(() => {
  appliquer("sensor.puissance_maison", String(1500 + Math.round(Math.random() * 900)));
  appliquer("sensor.puissance_apparente", String(1900 + Math.round(Math.random() * 1100)));
}, 3000);
setInterval(() => { appliquer("binary_sensor.mouvement_entree", "on"); setTimeout(() => appliquer("binary_sensor.mouvement_entree", "off"), 4000); }, 20000);
window.demo = { carte, appliquer };
