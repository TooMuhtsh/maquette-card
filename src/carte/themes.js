// thèmes : registre, résolution clair/sombre, retouches, validation des valeurs et du CSS personnalisé — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
