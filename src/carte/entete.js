// en-tête, import des textes, VERSION, formats et couleurs de température — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
/* maquette-card (Maquette, ex-plan-maison-card) : plan interactif de la maison, en direct.
 * Générique : la géométrie (en cm) et les entités viennent de la config de la carte (dashboard, accès authentifié) ;
 * ce fichier, servi sans authentification depuis /local, ne contient rien de propre à la maison.
 * Config publique (YAML du dashboard) en anglais, voir docs/configuration.md : rooms[{name, poly, temperature?, humidity?, …}], walls[[x1,y1,x2,y2]],
 *          fences[[…]], openings[{type: window|door|gate, seg, …}], badges[…], texts[…], furniture[…], panels{left, right}, layers{…}…
 * En interne (this._config, éditeur, brouillons) la config garde ses clés françaises : pieces, murs, limites, ouvertures, points, textes,
 *          meubles, panneaux{gauche, droite}, calques… ; depuisAnglais / versAnglais (schéma N_RACINE) traduisent à l'entrée et à la sortie.
 */
import "./maquette-i18n.js"; // dist : ligne retirée par build.mjs, le fichier est placé en tête
const { _t, _tk } = globalThis.MaquetteI18n, _loc = () => globalThis.MaquetteI18n.locale();
const VERSION = "0.2.0";
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

