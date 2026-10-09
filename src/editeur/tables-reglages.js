// capteurs des ouvertures, primitives, puces ; sections des réglages (personnes, lumière, interaction, ⚙ Paramètres) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- ouvertures : capteurs cherchés dans la pièce (pré-remplissage à la pose, suggestions) ----------
// contact : binary_sensor porte / fenêtre / ouverture / garage ; volet : cover de type volet, store… ; entite : cover motorisée (garage, portail, porte)
const CRIT_OUV = { contact: K("binary_sensor", ["door", "window", "opening", "garage_door"]), volet: K("cover", ["shutter", "blind", "shade", "curtain", "awning", "window"]),
  entite: K("cover", ["garage", "gate", "door"]) };
// classe d'appareil du contact préférée selon le type, et type proposé d'après la classe du contact
const DC_TYPE_OUV = { fenetre: ["window"], porte: ["door"], portail: ["garage_door", "opening", "gate", "garage"] };
const TYPE_DC_OUV = { window: "fenetre", door: "porte", garage_door: "portail", gate: "portail", garage: "portail" };
const OUVRANTS_ED = [["", _tk("Aucun##ouvrant")], ["gauche", _tk("Gauche")], ["droite", _tk("Droite")], ["coulissant", _tk("Coulissant")]];
// ---------- meubles personnalisés : primitives proposées par « Créer un meuble » (coordonnées en % de la taille) ----------
const PRIMITIVES = { rect: _tk("Rectangle"), arrondi: _tk("Arrondi##forme"), ellipse: _tk("Rond##forme"), trait: _tk("Trait"), polygone: _tk("Polygone") };
const STYLES_PRIM = [["plein", _tk("Plein")], ["vide", _tk("Contour")], ["tirets", _tk("Tirets")]];
const PRIM_DEFAUT = { rect: { genre: "rect", x: 0, y: 0, l: 100, h: 100 }, arrondi: { genre: "arrondi", x: 0, y: 0, l: 100, h: 100, rayon: 10 }, ellipse: { genre: "ellipse", x: 0, y: 0, l: 100, h: 100 },
  trait: { genre: "trait", points: [[10, 50], [90, 50]] }, polygone: { genre: "polygone", points: [[0, 0], [100, 0], [100, 40], [40, 40], [40, 100], [0, 100]] } };
// formes de départ de « Créer un meuble » (en plus des meubles du catalogue)
const FORMES_DEPART = () => [
  { id: "f:rect", nom: _t("Rectangle"), taille: [100, 60], forme: [PRIM_DEFAUT.rect] },
  { id: "f:arrondi", nom: _t("Rectangle arrondi"), taille: [100, 60], forme: [PRIM_DEFAUT.arrondi] },
  { id: "f:ellipse", nom: _t("Rond / ellipse"), taille: [80, 80], forme: [PRIM_DEFAUT.ellipse] },
  { id: "f:L", nom: _t("Forme en L"), taille: [200, 200], forme: [PRIM_DEFAUT.polygone] },
];
// domaines à interrupteur marche / arrêt (comme la carte : fiche, vue de la pièce)
// côté d'un meuble dans l'éditeur : mêmes bornes que la carte (5 à 5000 cm), 60 si la valeur manque
const tailleMeuble = (v) => Math.max(5, Math.min(MAX_TAILLE_MEUBLE, +v || 60));
// couleur hexadécimale #rrggbb, sinon la couleur par défaut (sélecteur <input type=color>)
const hexOu = (c, defaut) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : defaut);
const PUCES = [["ouvertures", "mdi:window-open-variant", _tk("Ouvertures"), _tk("Fenêtres et portes ouvertes (rouge s'il y en a)")],
  ["lumieres", "mdi:lightbulb-on", _tk("Lumières allumées"), _tk("Lumières du plan allumées")], ["volets", "mdi:window-shutter", _tk("Volets baissés"), _tk("Volets du plan sous 50 %")],
  ["temperature", "mdi:home-thermometer-outline", _tk("Température intérieure"), _tk("Moyenne des pièces intérieures")],
  ["entite", "mdi:information-outline", _tk("Valeur d'une entité"), _tk("N'importe quelle entité, avec alerte ou masquage selon son état")]];
// ---------- réglages des personnes, bulles, interaction, tablette (sections de la modale ⚙ Paramètres) ----------
// section : { id, titre: clé i18n, icone?, onglet?, champs: [{ chemin: "chemin.interne", type: "choix"…, nom: clé i18n, options: [[valeur, clé i18n]…],
//   defaut, aide: clé i18n, si(d) : champ proposé seulement si vrai, ecrire(d, v) : écriture particulière }] }
// La valeur par défaut est celle d'origine : la choisir retire la clé (le YAML reste minimal).
// Personnes et bulles d'appareils. Les réglages communs des personnes ne valent que si les personnes sont sur le plan
// (ambiance.personnes) ; `personnes: true` ou une liste d'entités deviennent un objet ({ entites }) à la première écriture.
const avecPersonnes = (d) => !!d.ambiance?.personnes;
const ecrirePersonnes = (k, defaut) => (d, v) => {
  const pe = d.ambiance?.personnes;
  if (!pe) return;
  const o = pe && typeof pe === "object" && !Array.isArray(pe) ? pe : Array.isArray(pe) ? { entites: pe } : {};
  if (v === "" || v == null || v === defaut) delete o[k]; else o[k] = v;
  d.ambiance.personnes = o;
};
const choixPersonne = (k, defaut, options, nom, aide) => ({ chemin: `ambiance.personnes.${k}`, type: "choix", nom, options, defaut, aide, si: avecPersonnes, ecrire: ecrirePersonnes(k, defaut) });
// lumière de l'ambiance (`ambiance.lumiere`) : proposée quand l'ambiance est active ; activé (défaut) = clé retirée, l'ambiance
// reste (pas de retrait des parents vides comme ecrireReglage) ; `lune` peut porter l'entité de phase
const avecAmbiance = (d) => !!d.ambiance && typeof d.ambiance === "object";
const objLumiere = (d) => (d.ambiance.lumiere && typeof d.ambiance.lumiere === "object" ? d.ambiance.lumiere : {});
const finLumiere = (d, o) => { if (Object.keys(o).length) d.ambiance.lumiere = o; else delete d.ambiance.lumiere; };
const ecrireLumiere = (k) => (d, v) => {
  if (!avecAmbiance(d)) return;
  // tout coupé (`lumiere: false`) : en rallumer un garde les autres coupés
  const o = d.ambiance.lumiere === false ? { soleil: false, lune: false, lampes: false } : objLumiere(d);
  if (v === false) o[k] = false; else if (typeof o[k] !== "string" && typeof o[k] !== "number") delete o[k];
  finLumiere(d, o);
};
// réglages fins (`ciel`, `rediffusion`, `soleil` : 0 à 2 ; `ciel_kelvin`, `soleil_kelvin` : 1800 à 10000 K) : valeur par défaut = clé retirée
const lumOn = (d) => avecAmbiance(d) && d.ambiance.lumiere !== false;
const avecSoleil = (d) => lumOn(d) && objLumiere(d).soleil !== false, avecLune = (d) => lumOn(d) && objLumiere(d).lune !== false;
const multLu = (v) => (v === false ? 0 : typeof v === "number" && Number.isFinite(v) ? Math.min(2, Math.max(0, v)) : 1);
const ecrireFin = (k, defaut) => (d, v) => {
  if (!lumOn(d)) return;
  const o = objLumiere(d);
  if (v == null || v === defaut) { if (k !== "soleil" || o.soleil !== false) delete o[k]; } else o[k] = v;
  finLumiere(d, o);
};
// chemin propre (`intensite_…`) : `soleil` est aussi l'interrupteur ; la clé écrite reste `ciel`, `rediffusion` ou `soleil`
const multLumiere = (k, libelle, aide, si) => ({ chemin: `ambiance.lumiere.intensite_${k}`, type: "curseur", libelle, aide, min: 0, max: 200, pas: 5, unite: "%", defaut: 100, si,
  lire: (d) => Math.round(multLu(objLumiere(d)[k]) * 100), ecrire: (d, v) => ecrireFin(k, 1)(d, v == null ? null : Math.round(Math.min(200, Math.max(0, +v))) / 100) });
const kelvinLumiere = (k, libelle, aide, defaut) => ({ chemin: `ambiance.lumiere.${k}`, type: "curseur", kelvin: true, auto: true, libelle, aide, min: 1800, max: 10000, pas: 100, unite: "K", defaut, si: avecSoleil,
  lire: (d) => { const v = objLumiere(d)[k]; return typeof v === "number" && Number.isFinite(v) ? Math.min(10000, Math.max(1800, v)) : null; },
  ecrire: (d, v) => ecrireFin(k, "auto")(d, v == null || v === "auto" ? null : Math.round(Math.min(10000, Math.max(1800, +v)))) });
// piste d'un curseur de teinte : le vrai spectre (même fonction kelvin → rgb que le rendu)
const pisteKelvin = (kv, a, b) => `linear-gradient(90deg,${Array.from({ length: 9 }, (_, i) => `rgb(${kv(a + ((b - a) * i) / 8).join(",")}) ${i * 12.5}%`).join(",")})`;
const texteCurseur = (f, v) => (v == null ? _t("Auto") : f.unite === "%" ? `${fmt(v, 0)} %` : `${fmt(v, 0)} ${f.unite || ""}`.trim());
const boolLumiere = (k, libelle, aide, si = avecAmbiance) => ({ chemin: `ambiance.lumiere.${k}`, type: "bool", libelle, aide, defaut: true, si,
  lire: (d) => d.ambiance?.lumiere !== false && objLumiere(d)[k] !== false, ecrire: ecrireLumiere(k) });
// élément de la modale Ambiance qui avait le focus : retrouvé après le rendu (refait à chaque modification) par son attribut data-
const heureAp = (h) => `${String(Math.floor(h) % 24).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
const cleFocusAmb = (el) => {
  for (const k of ["par", "parAuto", "amb", "ambChk", "ambSet", "ambPers", "anim", "alk", "alkChk", "alAct", "ongletAmb", "act"]) {
    const v = el?.dataset?.[k];
    if (v != null) return `[data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${String(v).replace(/["\\]/g, "\\$&")}"]`;
  }
  return null;
};
const PARAMS_LUMIERE = [
  { id: "lumiere", titre: _tk("Lumière"), icone: "mdi:white-balance-sunny", onglet: "affichage", champs: [
    boolLumiere("soleil", _tk("Soleil par les fenêtres"), _tk("Lueur du jour par toutes les fenêtres, taches de soleil à bords doux selon l'azimut et la hauteur, raccourcies par les volets.")),
    boolLumiere("lune", _tk("Lueur de la lune"), _tk("La nuit, par les mêmes fenêtres ; plus forte à la pleine lune.")),
    { chemin: "ambiance.lumiere.phase", type: "entite", domaine: "sensor", libelle: _tk("Phase de la lune"), aide: _tk("Capteur de l'intégration Moon (sensor.moon_phase si vide)."),
      si: (d) => avecAmbiance(d) && d.ambiance.lumiere !== false && objLumiere(d).lune !== false,
      lire: (d) => (typeof objLumiere(d).lune === "string" ? objLumiere(d).lune : ""),
      ecrire: (d, v) => { if (!avecAmbiance(d)) return; const o = objLumiere(d); if (typeof v === "string" && v) o.lune = v; else delete o.lune; finLumiere(d, o); } },
    { chemin: "ambiance.lumiere.portes", type: "bool", libelle: _tk("Portes sans capteur ouvertes"), defaut: true, si: avecSoleil,
      aide: _tk("La lumière du jour passe dans la pièce voisine par une porte intérieure ouverte ou une verrière ; une porte sans capteur compte comme ouverte."),
      lire: (d) => objLumiere(d).portes !== "fermees",
      ecrire: (d, v) => { if (!lumOn(d)) return; const o = objLumiere(d); if (v === false) o.portes = "fermees"; else delete o.portes; finLumiere(d, o); } },
    boolLumiere("lampes", _tk("Halos colorés des lampes"), _tk("Couleur et luminosité de chaque lampe ; les halos voisins se mélangent.")),
    { type: "intertitre", libelle: _tk("Intensités") },
    multLumiere("ciel", _tk("Lumière du ciel"), _tk("Lueur douce du jour par toutes les fenêtres non fermées."), avecSoleil),
    // diffusion du ciel (`ciel_diffusion`, 0 à 1, affichée de 0 à 100 %) : 0,6 par défaut = clé retirée
    { chemin: "ambiance.lumiere.ciel_diffusion", type: "curseur", libelle: _tk("Diffusion"), aide: _tk("Flou de la lumière du ciel, de plus en plus large en profondeur ; 0 % = faisceau net."),
      min: 0, max: 100, pas: 5, unite: "%", defaut: 60, si: (d) => avecSoleil(d) || avecLune(d),
      lire: (d) => { const v = objLumiere(d).ciel_diffusion; return Math.round((typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.6) * 100); },
      ecrire: (d, v) => ecrireFin("ciel_diffusion", 0.6)(d, v == null ? null : Math.round(Math.min(100, Math.max(0, +v))) / 100) },
    multLumiere("rediffusion", _tk("Lumière rediffusée"), _tk("Lueur chaude renvoyée autour des taches de soleil (et de lune)."), (d) => avecSoleil(d) || avecLune(d)),
    multLumiere("soleil", _tk("Soleil direct"), _tk("Taches de soleil au sol derrière les fenêtres qui le voient."), avecSoleil),
    { type: "intertitre", libelle: _tk("Teintes"), si: avecSoleil },
    kelvinLumiere("ciel_kelvin", _tk("Teinte du ciel"), _tk("Température de couleur de la lueur du ciel ; Auto = blanc froid d'origine."), 6500),
    kelvinLumiere("soleil_kelvin", _tk("Teinte du soleil"), _tk("Température de couleur des taches de soleil ; Auto = teinte d'origine, dorée près du coucher."), 4000),
  ] },
];
const PARAMS_PERSONNES_BULLES = [
  { id: "personnes", titre: _tk("Personnes sur le plan"), icone: "mdi:account-multiple-outline", champs: [
    choixPersonne("dehors", "direction", [["direction", _tk("Au bord")], ["zone", _tk("En bas")], ["cache", _tk("Masquées")]],
      _tk("Personnes absentes"), _tk("Au bord : dans leur direction, avec la distance. En bas : en bas du plan, avec leur zone. Chaque personne peut avoir son propre réglage (fenêtre Ambiance).")),
    choixPersonne("chez_soi", "groupe", [["groupe", _tk("Regroupées")], ["cache", _tk("Masquées")]], _tk("Personnes à la maison"), _tk("Regroupées au point de la maison.")),
    choixPersonne("avatar", "photo", [["photo", _tk("Photo")], ["initiales", _tk("Initiales")]], _tk("Avatar"), _tk("Photo du profil, sinon initiales.")),
  ] },
  { id: "bulles", titre: _tk("Pastilles d'appareils"), icone: "mdi:circle-multiple-outline", champs: [
    { chemin: "style_pastilles.indisponible", type: "choix", nom: _tk("Appareil indisponible"), defaut: "estompe",
      options: [["estompe", _tk("Estompée")], ["tirets", _tk("En pointillé")], ["cache", _tk("Masquée")]],
      aide: _tk("Une pastille masquée reste dans la vue de la pièce et dans les listes.") },
    { chemin: "style_pastilles.inactif", type: "choix", nom: _tk("Appareil inactif"), defaut: "visible",
      options: [["visible", _tk("Visible")], ["actif_seul", _tk("Masquée")], ["estompe", _tk("Estompée")]],
      aide: _tk("Masquée : la pastille n'apparaît que quand l'appareil est actif.") },
    { chemin: "style_pastilles.taille", type: "choix", nom: _tk("Taille des pastilles"), defaut: "normal",
      options: [["petit", _tk("Petite")], ["normal", _tk("Normale")], ["grand", _tk("Grande")]] },
    { chemin: "style_pastilles.valeurs", type: "choix", nom: _tk("Valeurs dans les pastilles"), defaut: "toujours",
      options: [["toujours", _tk("Toujours")], ["survol", _tk("Au survol")], ["jamais", _tk("Jamais")]],
      aide: _tk("Au survol : toujours affichées sur écran tactile.") },
    { chemin: "style_pastilles.zoom_seul", type: "bool", nom: _tk("Seulement dans la vue de leur pièce"), defaut: false,
      aide: _tk("Les pastilles n'apparaissent qu'en zoomant sur leur pièce. Chaque appareil peut avoir son propre réglage.") },
  ] },
];
// interaction au toucher, tablette murale, niveau d'animation (`interaction`, `tablet`, `animation_level`)
const tabletteObj = (d) => (d.tablette && typeof d.tablette === "object" && !Array.isArray(d.tablette) ? d.tablette : null);
// réglage du mode tablette : `tablet: true` devient un objet pour le porter, et redevient `true` sans réglage
const ecrireTablette = (k, defaut) => (d, v) => {
  const o = { ...(tabletteObj(d) || {}) };
  if (v === defaut || v == null) delete o[k]; else o[k] = v;
  d.tablette = Object.keys(o).length ? o : true;
};
const PARAMS_INTERACTION = [
  { id: "interaction", titre: _tk("Interaction"), icone: "mdi:gesture-tap", champs: [
    { chemin: "interaction.clic_piece", type: "choix", nom: _tk("Toucher une pièce"), defaut: "vue",
      options: [["vue", _tk("Vue de la pièce")], ["infos", _tk("Plus d'infos")], ["aucun", _tk("Rien")]],
      aide: _tk("« Plus d'infos » ouvre l'entité de l'étiquette (sinon la température).") },
    { chemin: "interaction.vue_figee", type: "bool", nom: _tk("Vue figée"), defaut: false,
      aide: _tk("Plus de déplacement ni de zoom (boutons compris) ; le toucher des éléments marche toujours.") },
    { chemin: "interaction.retour_apres", type: "nombre", nom: _tk("Retour au plan entier après"), defaut: 0, min: 0, max: 86400, pas: 10, unite: "s",
      aide: _tk("Sans action pendant ce temps : vue de la pièce, zoom et fiches fermés. 0 = jamais.") },
  ] },
  { id: "tablette", titre: _tk("Tablette murale"), onglet: "interaction", champs: [
    { chemin: "tablette", type: "bool", nom: _tk("Mode tablette"), defaut: false,
      aide: _tk("Pleine page, sans titre ni en-tête."),
      ecrire: (d, v) => { if (!v) delete d.tablette; else if (!tabletteObj(d)) d.tablette = true; } },
    { chemin: "tablette.resume", type: "bool", nom: _tk("Puces de résumé"), defaut: false, si: (d) => !!d.tablette, ecrire: ecrireTablette("resume", false) },
    { chemin: "tablette.panneaux", type: "bool", nom: _tk("Panneaux latéraux"), defaut: false, si: (d) => !!d.tablette, ecrire: ecrireTablette("panneaux", false) },
    { chemin: "tablette.anti_marquage", type: "bool", nom: _tk("Anti-marquage de l'écran"), defaut: true, si: (d) => !!d.tablette, ecrire: ecrireTablette("anti_marquage", true),
      aide: _tk("Évite de marquer l'écran : le plan se décale d'un pixel toutes les 3 minutes (2 px au plus).") },
  ] },
  { id: "animations", titre: _tk("Animations"), onglet: "interaction", champs: [
    { chemin: "niveau_animation", type: "choix", nom: _tk("Niveau d'animation"), defaut: "complet",
      options: [["complet", _tk("Complet")], ["reduit", _tk("Réduit")], ["aucun", _tk("Aucune")]],
      aide: _tk("Réduit : rien ne bouge en boucle (pulsations, ondes, météo, flux), transitions courtes. Aucune : rien ne bouge.") },
  ] },
];
// ---------- modale ⚙ Paramètres : réglages globaux de la carte (fonctionnement plutôt que dessin) ----------
// Liste déclarative, rendue et écrite par EditeurPlan._rendreParametres. Section : { id, titre: clé i18n, icone?: icône de l'onglet,
//   onglet?: id de la section qui ouvre l'onglet où elle s'ajoute (sous-titre = son titre ; sinon elle a son propre onglet), aide?: clé i18n, champs: [champ] }.
// Champ : { chemin: "chemin.interne" (config interne, clés françaises), type, libelle (ou nom): clé i18n, aide?: clé i18n, defaut, si?(d),
//   lire?(d) : lecture personnalisée, ecrire?(d, v) : écriture personnalisée (à la place de la règle « défaut = clé retirée ») }
//   bool : interrupteur MD3 ; confirmer? { quand(v), titre, texte, bouton } : confirmation dans la modale avant d'écrire
//   choix : options [[valeur, clé i18n | texte, brut?]] (brut : affiché tel quel) ; boutons segmentés jusqu'à 4 options, sinon menu
//   nombre : min, max, pas, unite ; valider?(d, v) : clé i18n du refus, ou null ; demi : deux champs consécutifs côte à côte
//   texte : placeholder (clé i18n) · entite : domaine? · intertitre : libellé seul
//   action : id, icone, desc (clé i18n, ou (d, ed) → clé), action(ed) : la modale se ferme, puis l'action ouvre son panneau ou son dialogue
//   parentVide : l'objet parent vidé redevient `true` (ex. `replay: { heures }` → `replay: true`)
// Écriture : une valeur par défaut (ou vide) RETIRE la clé et les objets parents devenus vides : la config reste minimale.
// Valeurs par défaut : celles de la carte (MaquetteCard.REGLAGES), vérifiées par les tests.
// (les sections des autres réglages, PARAMS_PERSONNES_BULLES et PARAMS_INTERACTION, se déclarent ici, juste avant la liste)
const SECTIONS_PARAMETRES = [
  { id: "general", titre: _tk("Général"), icone: "mdi:tune-variant", champs: [
    { chemin: "titre", type: "texte", libelle: _tk("Titre"), defaut: "", placeholder: _tk("Sans titre") },
    { chemin: "langue", type: "choix", libelle: _tk("Langue de la carte"), defaut: "",
      options: [["", _tk("Automatique")], ["en", "English", true], ["fr", "Français", true]] },
    { chemin: "plein_ecran", type: "bool", libelle: _tk("Pleine hauteur sur grand écran"), aide: _tk("La carte occupe la hauteur de l'écran et le plan tient sans défilement."), defaut: true },
    { chemin: "marge", type: "nombre", libelle: _tk("Marge autour du plan"), defaut: 40, min: 0, max: 2000, pas: 10, unite: "cm" },
    { chemin: "edition", type: "bool", libelle: _tk("Bouton d'édition (crayon)"), aide: _tk("Visible des administrateurs seulement."), defaut: true,
      confirmer: { quand: (v) => v === false, titre: _tk("Masquer le bouton d'édition ?"), bouton: _tk("Masquer le bouton"),
        texte: _tk("Sans ce bouton, l'éditeur ne s'ouvre plus depuis la carte. Pour le retrouver : dans Home Assistant, modifier le dashboard, ouvrir la carte dans l'éditeur de code (YAML) et retirer la ligne « editor: false ».") } },
  ] },
  { id: "affichage", titre: _tk("Affichage"), icone: "mdi:eye-outline", champs: [
    { chemin: "afficher_meubles", type: "choix", libelle: _tk("Meubles affichés"), aide: _tk("Grand écran : carte d'au moins 760 px de large."), defaut: true,
      options: [[true, _tk("Toujours")], ["pc", _tk("Grand écran")], [false, _tk("Jamais")]] },
    { chemin: "calques.bouton_vue", type: "bool", libelle: _tk("Bouton Calques pour les visiteurs"), aide: _tk("Chacun masque ce qu'il veut, sur son navigateur."), defaut: false },
    { type: "intertitre", libelle: _tk("Couleurs nommées") },
    { id: "palette", type: "palette", libelle: _tk("Palette du plan"),
      aide: _tk("Proposées dans tous les champs couleur. Un élément qui utilise un nom suit la palette quand elle change ; une couleur retirée rend aux éléments leur couleur par défaut.") },
  ] },
  { id: "fonctions", titre: _tk("Fonctions"), icone: "mdi:puzzle-outline", champs: [
    { chemin: "replay", type: "bool", libelle: _tk("Revoir la journée"), aide: _tk("Bouton à côté du zoom : la journée rejouée en accéléré."), defaut: false },
    { chemin: "replay.heures", type: "nombre", libelle: _tk("Période revue"), defaut: 24, min: 1, max: 72, pas: 1, unite: "h", parentVide: true, si: (d) => !!d.replay },
    { chemin: "replay.vitesse", type: "choix", libelle: _tk("Vitesse au départ"), aide: _tk("×60 : une minute par seconde ; ×3600 : une heure par seconde."), defaut: 900, parentVide: true, si: (d) => !!d.replay,
      options: [[60, "×60", true], [300, "×300", true], [900, "×900", true], [3600, "×3600", true]] },
    { chemin: "vitrine", type: "bool", libelle: _tk("Exemples sous le plan"), aide: _tk("Animations, météo et ambiance en démonstration."), defaut: false },
    { chemin: "presence", type: "entite", libelle: _tk("Présence par défaut"), defaut: "zone.home",
      aide: _tk("Zone, personne ou groupe. Sert aux puces absent / présent et aux alertes « personne à la maison » ; chacune peut avoir la sienne.") },
  ] },
  { id: "pieces", titre: _tk("Pièces et légende"), icone: "mdi:floor-plan", champs: [
    { type: "intertitre", libelle: _tk("Sur les étiquettes des pièces") },
    { chemin: "etiquettes_pieces.nom", type: "bool", libelle: _tk("Nom de la pièce"), defaut: true },
    { chemin: "etiquettes_pieces.temperature", type: "bool", libelle: _tk("Température"), defaut: true },
    { chemin: "etiquettes_pieces.humidite", type: "bool", libelle: _tk("Humidité"), defaut: true },
    { type: "intertitre", libelle: _tk("Couleur des pièces") },
    { chemin: "teinte_temperature", type: "bool", libelle: _tk("Teinte selon la température"), defaut: true },
    { chemin: "teinte_temperature.min", type: "nombre", libelle: _tk("Bleu à"), defaut: 17, min: -30, max: 60, pas: 0.5, unite: "°C", demi: true, si: (d) => d.teinte_temperature !== false,
      valider: (d, v) => (v >= (estNombre(d.teinte_temperature?.max) ? +d.teinte_temperature.max : 28) ? _tk("Le bleu doit être sous le rouge.") : null) },
    { chemin: "teinte_temperature.max", type: "nombre", libelle: _tk("Rouge à"), defaut: 28, min: -30, max: 60, pas: 0.5, unite: "°C", demi: true, si: (d) => d.teinte_temperature !== false,
      valider: (d, v) => (v <= (estNombre(d.teinte_temperature?.min) ? +d.teinte_temperature.min : 17) ? _tk("Le bleu doit être sous le rouge.") : null) },
    { chemin: "legende", type: "bool", libelle: _tk("Légende sous le plan"), defaut: true },
  ] },
  { id: "lumiere", titre: _tk("Lumière"), icone: "mdi:white-balance-sunny", onglet: "affichage", champs: [
    { id: "lumiere-ambiance", type: "action", si: avecAmbiance, icone: "mdi:white-balance-sunny", libelle: _tk("Lumière du jour, lune et lampes"), desc: _tk("Ambiance et animations › Lumière"), action: (ed) => ed.panneauAmbiance(true, "lumiere") },
  ] },
  ...PARAMS_PERSONNES_BULLES,
  ...PARAMS_INTERACTION,
  // accès aux réglages sans bouton dans la barre (les autres panneaux ont le leur : pas de doublon)
  { id: "ailleurs", titre: _tk("Réglés ailleurs"), onglet: "fonctions", champs: [
    { id: "alertes", type: "action", icone: "mdi:alarm-light-outline", libelle: _tk("Alertes plein plan"), desc: _tk("Fenêtre Ambiance"), action: (ed) => ed.panneauAmbiance(true, "alertes") },
    { id: "puces", type: "action", icone: "mdi:format-list-bulleted", libelle: _tk("Puces du résumé"),
      desc: (d, ed) => (ed._puces().length ? _tk("Modifier la première puce") : _tk("Aucune puce : « + Puce » au-dessus du plan en ajoute une")),
      action: (ed) => (ed._puces().length ? ed.selectionner({ type: "puce", i: 0 }) : ed.snack(_t("Clique une puce du résumé (au-dessus du plan) pour la modifier, ou « + Puce » pour en ajouter une."))) },
  ] },
];
const estNombre = (v) => (typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v));
// lecture et écriture d'un réglage par son chemin ; valeur par défaut ou vide = clé retirée, objets parents vides retirés (ou `true`, parentVide)
const lireChemin = (o, chemin) => chemin.split(".").reduce((x, k) => (x && typeof x === "object" && !Array.isArray(x) ? x[k] : undefined), o);
const memeValeur = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const champReglage = (k) => [...SECTIONS_PARAMETRES, ...PARAMS_LUMIERE].flatMap((S) => S.champs || []).find((f) => (f.chemin || f.id) === k);
const champDe = (c) => (typeof c === "string" ? champReglage(c) || { chemin: c } : c);
// valeur effective d'un réglage : lecture personnalisée, sinon la clé, sinon la valeur par défaut
const lireReglage = (d, f) => { if (f.lire) return f.lire(d); const v = lireChemin(d, f.chemin); return v === undefined ? f.defaut : v; };
function ecrireReglage(d, f, v) {
  const p = f.chemin.split("."), objets = [d];
  for (const k of p.slice(0, -1)) {
    const x = objets[objets.length - 1];
    if (!x[k] || typeof x[k] !== "object" || Array.isArray(x[k])) x[k] = {};
    objets.push(x[k]);
  }
  const fin = objets[objets.length - 1], k = p[p.length - 1];
  if (v === undefined || v === "" || memeValeur(v, f.defaut)) delete fin[k]; else fin[k] = v;
  for (let i = objets.length - 1; i > 0; i--) {
    if (Object.keys(objets[i]).length) break;
    if (f.parentVide && i === objets.length - 1) { objets[i - 1][p[i - 1]] = true; break; }
    delete objets[i - 1][p[i - 1]];
  }
}
