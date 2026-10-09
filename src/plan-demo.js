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
