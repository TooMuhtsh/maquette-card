// outils communs : bascules, entités d'une pièce, champs entité des widgets — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
