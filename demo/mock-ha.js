// Faux Home Assistant pour la démo : composants ha-card / ha-icon et objet hass minimal.
const MDI = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css";

customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `<style>:host{display:block;background:var(--ha-card-background,var(--card-background-color));
      border-radius:var(--ha-card-border-radius,12px);color:var(--primary-text-color)}</style><slot></slot>`;
  }
});

customElements.define("ha-icon", class extends HTMLElement {
  static get observedAttributes() { return ["icon"]; }
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `<link rel="stylesheet" href="${MDI}"><style>:host{display:inline-flex;align-items:center;justify-content:center;
      width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);font-size:var(--mdc-icon-size,24px);line-height:1}i{line-height:1}</style><i></i>`;
  }
  attributeChangedCallback() { this.shadowRoot.querySelector("i").className = `mdi ${(this.getAttribute("icon") || "").replace("mdi:", "mdi-")}`; }
});

// langue de la démo : ?lang=en|fr, sinon celle du navigateur (fr* → français, le reste → anglais), comme la carte
const PARAM = new URLSearchParams(location.search).get("lang");
export const LANGUE = /^fr/i.test(PARAM || navigator.language || "") ? "fr" : "en";
const LOCALE = PARAM ? LANGUE : navigator.language || LANGUE;

const FORMATS = LANGUE === "fr" ? {
  on: { door: "Ouverte", window: "Ouverte", motion: "Détecté", occupancy: "Occupé", plug: "Branché", moisture: "Humide", _: "Allumé" },
  off: { door: "Fermée", window: "Fermée", motion: "RAS", occupancy: "Libre", plug: "Débranché", moisture: "Sec", _: "Éteint" },
  open: "Ouvert", closed: "Fermé", locked: "Verrouillée", unlocked: "Déverrouillée", locking: "Verrouillage", unlocking: "Déverrouillage", heat: "Chauffage", idle: "Inactif", playing: "Lecture", unavailable: "Indisponible",
} : {
  on: { door: "Open", window: "Open", motion: "Detected", occupancy: "Detected", plug: "Plugged in", moisture: "Wet", _: "On" },
  off: { door: "Closed", window: "Closed", motion: "Clear", occupancy: "Clear", plug: "Unplugged", moisture: "Dry", _: "Off" },
  open: "Open", closed: "Closed", locked: "Locked", unlocked: "Unlocked", locking: "Locking", unlocking: "Unlocking", heat: "Heat", idle: "Idle", playing: "Playing", unavailable: "Unavailable",
};
const SERVICES = LANGUE === "fr" ? ["Allumer", "Éteindre", "Basculer", "Ouvrir", "Fermer", "Arrêter", "Activer", "Pause"]
  : ["Turn on", "Turn off", "Toggle", "Open", "Close", "Stop", "Activate", "Pause"];

// unité après un nombre, comme Home Assistant : pas d'espace avant « % » en anglais
const unite = (u) => (!u ? "" : LANGUE !== "fr" && u === "%" ? u : " " + u);

export function creerHass({ etats, areas, devices, entities, lies, config, appliquer }) {
  const hass = {
    states: etats, areas, devices, entities, user: { name: LANGUE === "fr" ? "Démo" : "Demo", is_admin: true }, language: LANGUE,
    locale: { language: LOCALE, number_format: "language", time_format: "language" },
    services: { light: { turn_on: { name: SERVICES[0] }, turn_off: { name: SERVICES[1] }, toggle: { name: SERVICES[2] } }, switch: { turn_on: { name: SERVICES[0] }, turn_off: { name: SERVICES[1] } },
      cover: { open_cover: { name: SERVICES[3] }, close_cover: { name: SERVICES[4] }, stop_cover: { name: SERVICES[5] } }, lock: { lock: { name: "lock" }, unlock: { name: "unlock" }, open: { name: "open" } }, scene: { turn_on: { name: SERVICES[6] } }, media_player: { media_pause: { name: SERVICES[7] } } },
    formatEntityState(s) {
      const f = FORMATS[s.state], dc = s.attributes.device_class;
      if (f && typeof f === "object") return f[dc] || f._;
      if (f) return f;
      const n = parseFloat(s.state);
      return isNaN(n) ? s.state : `${n.toLocaleString(LOCALE, { maximumFractionDigits: 2 })}${unite(s.attributes.unit_of_measurement)}`;
    },
    async callService(domaine, service, donnees = {}, cible = {}) {
      let ids = [].concat(cible?.entity_id || donnees.entity_id || []);
      if (cible?.area_id) ids = Object.keys(entities).filter((e) => (entities[e].area_id || devices[entities[e].device_id]?.area_id) === cible.area_id);
      for (const e of ids) {
        const d = e.split(".")[0], s = etats[e];
        if (!s) continue;
        if (service === "toggle") appliquer(e, s.state === "on" ? "off" : "on");
        else if (service === "turn_on") appliquer(e, d === "scene" ? s.state : "on");
        else if (service === "turn_off") appliquer(e, "off");
        else if (service === "open_cover") appliquer(e, "open", { current_position: 100 });
        else if (service === "close_cover") appliquer(e, "closed", { current_position: 0 });
        else if (service === "stop_cover") appliquer(e, s.state === "closed" ? "closed" : "open");
        else if (d === "lock" && ["lock", "unlock", "open"].includes(service)) appliquer(e, { lock: "locked", unlock: "unlocked", open: "open" }[service]);
      }
    },
    async callWS(m) {
      if (m.type === "recorder/statistic_during_period") {
        const base = { day: 9.4, week: 41.7, month: 168.2, year: 2143 }[m.calendar.period];
        return { change: m.statistic_id.includes("cout") ? base * 0.21 : base * 1000 };
      }
      if (m.type === "history/history_during_period" && m.entity_ids.length > 1) return journeeSimulee(hass, m);
      if (m.type === "history/history_during_period") {
        const id = m.entity_ids[0], debut = new Date(m.start_time).getTime() / 1000, fin = Date.now() / 1000, l = [];
        // température / humidité : valeurs proches de l'état actuel, avec une pente propre à chaque capteur (tendances variées)
        const st = hass.states[id], v = parseFloat(st?.state), uni = st?.attributes.unit_of_measurement;
        if (!isNaN(v) && (uni === "°C" || uni === "%")) {
          const pente = ([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 7 - 3) * (uni === "°C" ? 0.25 : 2.5);
          for (let t = debut; t < fin; t += 300) l.push({ s: String(+(v - pente * (fin - t) / (fin - debut)).toFixed(2)), lu: t });
          return { [id]: l };
        }
        for (let t = debut, k = 0; t < fin; t += 600, k++) l.push({ s: String(Math.round(420 + 260 * Math.sin(k / 9) + (k % 7) * 35 + (k % 23 === 0 ? 1600 : 0))), lu: t });
        return { [id]: l };
      }
      if (m.type === "search/related") return lies[m.item_id] || {};
      if (m.type === "lovelace/config") return { views: [{ cards: [JSON.parse(JSON.stringify(config.actuelle))] }] };
      if (m.type === "lovelace/config/save") {
        const c = m.config.views[0].cards[0];
        config.actuelle = c;
        try { localStorage.setItem("maquette-demo", JSON.stringify(c)); } catch (e) { /* stockage indisponible */ }
        setTimeout(() => document.querySelector("maquette-card").setConfig(c), 50);
        return null;
      }
      throw new Error(`WS not simulated: ${m.type}`);
    },
  };
  return hass;
}

// replay de la démo : une journée plausible pour chaque entité (heure locale), au format compressé de HA ({s, a?, lu})
function journeeSimulee(hass, m) {
  const debut = new Date(m.start_time).getTime(), fin = new Date(m.end_time || Date.now()).getTime(), out = {};
  const h = (t) => { const d = new Date(t); return d.getHours() + d.getMinutes() / 60; };
  const pas = (ms, f) => { const l = []; for (let t = debut; t <= fin; t += ms) l.push(f(t)); return l; };
  const compacter = (l) => l.filter((x, i) => i === 0 || x.s !== l[i - 1].s || JSON.stringify(x.a) !== JSON.stringify(l[i - 1].a));
  for (const e of m.entity_ids) {
    const st = hass.states[e];
    if (!st) continue;
    const a0 = st.attributes, dom = e.split(".")[0], g = [...e].reduce((x, c) => x + c.charCodeAt(0), 0);
    let l;
    if (dom === "binary_sensor" && /contact|baie|fenetre|porte/.test(e)) l = pas(60e3, (t) => { const x = h(t), o = (g % 5) + 7; return { s: (x > o && x < o + 0.3) || (x > 12.2 + (g % 3) && x < 12.6 + (g % 3)) || (x > 19 + (g % 4) * 0.4 && x < 19.2 + (g % 4) * 0.4) ? "on" : "off", lu: t / 1000 }; });
    else if (dom === "light") l = pas(60e3, (t) => { const x = h(t); return { s: (x > 6.8 && x < 7.6) || (x > 18.5 + (g % 3) * 0.5 && x < 23.2) ? "on" : "off", lu: t / 1000 }; });
    else if (dom === "cover") l = pas(60e3, (t) => { const x = h(t), p = x < 7.5 || x > 21 + (g % 3) * 0.3 ? 0 : x < 7.6 ? 50 : 100; return { s: p ? "open" : "closed", a: { ...a0, current_position: p }, lu: t / 1000 }; });
    else if (dom === "person") l = pas(300e3, (t) => { const x = h(t), dehors = e.endsWith("sam") ? x > 8.3 && x < 17.5 : x > 13 && x < 16; return { s: dehors ? "not_home" : "home", a: { ...a0, latitude: dehors ? a0.latitude ?? 45.79 : 45.76, longitude: dehors ? a0.longitude ?? 4.93 : 4.84 }, lu: t / 1000 }; });
    else if (e === "zone.home") l = pas(300e3, (t) => { const x = h(t); return { s: String((x > 8.3 && x < 17.5 ? 0 : 1) + (x > 13 && x < 16 ? 0 : 1)), lu: t / 1000 }; });
    else if (dom === "sun") l = pas(600e3, (t) => { const x = h(t), el = 42 * Math.sin(((x - 7.5) / 12) * Math.PI); return { s: el > 0 ? "above_horizon" : "below_horizon", a: { ...a0, elevation: +el.toFixed(1), azimuth: +(90 + (x - 7.5) * 15).toFixed(1) }, lu: t / 1000 }; });
    else if (dom === "weather") l = pas(1800e3, (t) => { const x = h(t); return { s: x > 14 && x < 17 ? "rainy" : x > 10 && x < 14 ? "cloudy" : "partlycloudy", a: a0, lu: t / 1000 }; });
    else if (!isNaN(parseFloat(st.state))) { const v = parseFloat(st.state); l = pas(600e3, (t) => ({ s: String(+(v * (0.8 + 0.4 * Math.abs(Math.sin(t / 3.6e6 + g)))).toFixed(1)), lu: t / 1000 })); }
    else l = [{ s: st.state, lu: debut / 1000 }];
    out[e] = compacter(l).map((x) => (m.no_attributes ? { s: x.s, lu: x.lu } : x));
  }
  return out;
}
