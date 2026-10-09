// Construit dist/maquette-card.js : textes (en/fr) + démo + carte + éditeur embarqué (un seul fichier pour HACS).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";
import { MORCEAUX, assembler, verifier } from "./src/assemblage.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
// textes de l'interface, placés en tête : la démo, la carte et l'éditeur les lisent (globalThis.MaquetteI18n)
// sources découpées par sujet (src/i18n/, src/carte/, src/editeur/) : recollées dans l'ordre de src/assemblage.mjs
const assemblage = verifier();
if (assemblage.problemes.length) {
  console.error(`Assemblage des sources (src/assemblage.mjs) :\n  ${assemblage.problemes.join("\n  ")}`);
  process.exit(1);
}
const i18n = assembler(MORCEAUX.i18n);
// en développement, la carte et l'éditeur importent maquette-i18n.js (et l'éditeur maquette-nettoyage.js) ; dans dist/ ils sont déjà en tête
const sansImport = (s) => s.replace(/^import "\.\/maquette-(?:i18n|nettoyage)\.js";.*\n/gm, "");
// moteur « Nettoyer le plan » (module pur, globalThis.MaquetteNettoyage), placé après les textes
const nettoyage = readFileSync("src/maquette-nettoyage.js", "utf8");
if (/^(?:import|export) /m.test(nettoyage)) {
  console.error("import / export inattendu dans src/maquette-nettoyage.js (fichier placé tel quel dans dist/)");
  process.exit(1);
}
const carte = sansImport(assembler(MORCEAUX.carte));
// mode démo (appartement + simulation), placé avant la carte qui l'utilise
const demo = readFileSync("src/plan-demo.js", "utf8");
const editeur = sansImport(assembler(MORCEAUX.editeur));
// js-yaml 4.1.0 (MIT, src/vendor/js-yaml.LICENSE) : lecture des plans importés en YAML, gardé local à l'éditeur
const jsyaml = readFileSync("src/vendor/js-yaml.min.js", "utf8");

const version = /const VERSION = "([^"]+)"/.exec(carte)?.[1];
if (version !== pkg.version) {
  console.error(`Version incohérente : src = ${version}, package.json = ${pkg.version}`);
  process.exit(1);
}
if (!/^export class EditeurPlan/m.test(editeur)) {
  console.error("« export class EditeurPlan » introuvable dans src/editeur/ (classe-coeur.js)");
  process.exit(1);
}
if (/^import /m.test(carte) || /^import /m.test(editeur)) {
  console.error("import inattendu dans la carte ou l'éditeur (seuls ./maquette-i18n.js et ./maquette-nettoyage.js sont retirés)");
  process.exit(1);
}

// toutes les clés _t("…") / _tk("…") des sources doivent avoir leur traduction anglaise ; les clés anglaises inutilisées sont signalées
const ctx = { Intl, console };
vm.runInNewContext(i18n, ctx);
const { en } = ctx.MaquetteI18n.DICO;
const cles = new Set();
for (const s of [carte, demo, editeur]) for (const m of s.matchAll(/\b_tk?\(\s*"((?:[^"\\\n]|\\.)*)"/g)) cles.add(JSON.parse(`"${m[1]}"`));
const manquantes = [...cles].filter((k) => !(k in en));
if (manquantes.length) {
  console.error(`${manquantes.length} texte(s) sans traduction anglaise (src/i18n/textes-*.js) :\n  ${manquantes.join("\n  ")}`);
  process.exit(1);
}
const enTrop = Object.keys(en).filter((k) => !cles.has(k));
if (enTrop.length) console.warn(`${enTrop.length} traduction(s) anglaise(s) inutilisée(s) :\n  ${enTrop.join("\n  ")}`);

const sortie = `/*! Maquette v${pkg.version} | MIT | ${pkg.homepage} */
${i18n}
${nettoyage}
${demo}
${carte}
// ---- Éditeur intégré (même fichier dans la version publiée) ----
(() => {
const jsyaml = (() => { const module = { exports: {} }, exports = module.exports;
${jsyaml}
return module.exports; })();
${editeur.replace(/^export class EditeurPlan/m, "class EditeurPlan")}
globalThis.MaquetteEditeur = EditeurPlan;
})();
`;
mkdirSync("dist", { recursive: true });
writeFileSync("dist/maquette-card.js", sortie);
console.log(`dist/maquette-card.js v${pkg.version} (${(sortie.length / 1024).toFixed(0)} Kio, ${cles.size} textes traduits)`);
