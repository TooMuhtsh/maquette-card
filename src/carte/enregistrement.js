// reprise des anciens noms, version, enregistrement des éléments, cartes et stratégies — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage

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
