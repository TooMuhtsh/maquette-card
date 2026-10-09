// widgets prêts à l'emploi (catégories, préréglages) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
// nom des champs entité d'un widget (CHAMPS_ENTITE_WIDGET, carte) dans les dialogues de choix
const NOMS_CHAMPS_AUTO = { batterie: _tk("Batterie"), autonomie: _tk("Autonomie"), puissance: _tk("Puissance de charge"), branche: _tk("Câble branché"), "colonnes.stat": _tk("Compteur") };
const idModele = () => Math.random().toString(36).slice(2, 10);
