// variables CSS publiques --maquette-* : table unique (CSS de la carte, éditeur, doc) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
