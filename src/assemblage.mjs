// Assemblage des sources découpées par sujet : ORDRE DÉCLARÉ des morceaux (un fichier = un sujet), recollés tels quels
// par build.mjs (sans dépendance). Chaque morceau est un fichier JS valide seul (node --check) : ses premières et dernières
// lignes qui finissent par « // @assemblage » (titre, enveloppes de classe, de gabarit CSS ou d'objet de textes) sont retirées
// au recollage ; aucune autre ligne ne doit porter cette marque. Ajouter un fichier : le créer avec la même en-tête, puis
// l'inscrire ici à sa place (dans une classe : entre deux morceaux de la classe ; textes : entre deux fichiers textes-*).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

export const MARQUE = "// @assemblage";
export const MORCEAUX = {
  // textes (en tête de dist/) : moteur + un fichier de textes par sujet, fusionnés dans le dictionnaire EN
  i18n: [
    "i18n/moteur-debut.js",
    "i18n/textes-nettoyage.js",
    "i18n/textes-ateliers.js",
    "i18n/textes-edition.js",
    "i18n/textes-widgets.js",
    "i18n/textes-carte.js",
    "i18n/textes-securite.js",
    "i18n/textes-editeur.js",
    "i18n/textes-lumiere.js",
    "i18n/textes-personnes.js",
    "i18n/textes-parametres.js",
    "i18n/textes-barre.js",
    "i18n/textes-demo.js",
    "i18n/textes-audit.js",
    "i18n/moteur-fin.js",
  ],
  // la carte (src/carte/) : niveau 0, puis la classe MaquetteCard en plusieurs morceaux, puis l'enregistrement
  carte: [
    "carte/entete.js",
    "carte/css/plan.css.js",
    "carte/css/couches.css.js",
    "carte/outils.js",
    "carte/css/fiches.css.js",
    "carte/meubles.js",
    "carte/elements.js",
    "carte/ambiance-lumiere.js",
    "carte/tables.js",
    "carte/normalisation-securite.js",
    "carte/reglages-anglais.js",
    "carte/classe-coeur.js",
    "carte/classe-vue.js",
    "carte/classe-fiches.js",
    "carte/classe-widgets.js",
    "carte/classe-actions.js",
    "carte/classe-maj.js",
    "carte/classe-personnes-alertes.js",
    "carte/classe-replay.js",
    "carte/classe-ambiance.js",
    "carte/enregistrement.js",
  ],
  // l'éditeur (src/editeur/) : niveau 0, CSS, puis la classe EditeurPlan en plusieurs morceaux
  editeur: [
    "editeur/entete.js",
    "editeur/prets-widgets.js",
    "editeur/tables-reglages.js",
    "editeur/outils-import-export.js",
    "editeur/css/base.css.js",
    "editeur/css/ateliers.css.js",
    "editeur/css/modales.css.js",
    "editeur/classe-coeur.js",
    "editeur/classe-dessin.js",
    "editeur/classe-calques.js",
    "editeur/classe-parametres.js",
    "editeur/classe-ambiance.js",
    "editeur/classe-sections.js",
    "editeur/classe-edition.js",
    "editeur/classe-widgets.js",
    "editeur/classe-actions.js",
    "editeur/classe-entites.js",
    "editeur/classe-ouvertures.js",
    "editeur/classe-meubles.js",
    "editeur/classe-catalogue.js",
    "editeur/classe-nettoyage.js",
    "editeur/classe-import-export.js",
    "editeur/classe-enregistrement.js",
  ],
};

// contenu d'un morceau sans ses lignes d'enveloppe (base : dossier qui contient src/)
export function morceau(f, base = ".") {
  const t = readFileSync(join(base, "src", f), "utf8");
  if (!t.endsWith("\n")) throw new Error(`src/${f} : pas de saut de ligne final`);
  const l = t.slice(0, -1).split("\n");
  let a = 0, b = l.length;
  while (a < b && l[a].endsWith(MARQUE)) a++;
  while (b > a && l[b - 1].endsWith(MARQUE)) b--;
  const ici = l.slice(a, b).findIndex((x) => x.includes(MARQUE));
  if (ici >= 0) throw new Error(`src/${f}:${a + ici + 1} : « ${MARQUE} » seulement en tête ou en fin de morceau`);
  return l.slice(a, b);
}
export const assembler = (liste, base = ".") => liste.map((f) => morceau(f, base).join("\n") + "\n").join("");

// contrôles de la build : fichier présent mais non déclaré (ou l'inverse), clé de texte en double entre fichiers
export function verifier(base = ".") {
  const pb = [], declares = new Set(Object.values(MORCEAUX).flat());
  const parcourir = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parcourir(join(d, e.name)) : [join(d, e.name)]));
  for (const d of ["carte", "editeur", "i18n"]) {
    const dd = join(base, "src", d);
    if (existsSync(dd)) for (const f of parcourir(dd)) { const r = relative(join(base, "src"), f); if (!declares.has(r)) pb.push(`src/${r} : absent de src/assemblage.mjs`); }
  }
  for (const f of declares) if (!existsSync(join(base, "src", f))) pb.push(`src/${f} : déclaré dans src/assemblage.mjs mais introuvable`);
  const vues = new Map();
  for (const f of MORCEAUX.i18n.filter((x) => /\/textes-/.test(x))) {
    if (!existsSync(join(base, "src", f))) continue;
    morceau(f, base); // contrôle des marques
    readFileSync(join(base, "src", f), "utf8").split("\n").forEach((l, i) => {
      if (l.endsWith(MARQUE)) return;
      for (const m of l.matchAll(/(?:^\s*|,\s*)"((?:[^"\\]|\\.)*)"\s*:/g)) {
        const k = m[1];
        if (vues.has(k)) pb.push(`texte en double « ${k} » : ${vues.get(k)} et src/${f}:${i + 1}`); else vues.set(k, `src/${f}:${i + 1}`);
      }
    });
  }
  return { problemes: pb, clesTextes: vues.size };
}
