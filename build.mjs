// Construit dist/ : maquette-card.js (textes de la carte + démo + carte) et maquette-editeur.js (éditeur, chargé à la demande).
// La carte charge l'éditeur à la première ouverture, depuis le même dossier qu'elle (HACS télécharge tous les fichiers de la release).
// `node build.mjs --min` : en plus, copies minifiées dans release/ (terser), jointes à la release GitHub (.github/workflows/release.yml).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { MORCEAUX, assembler, verifier } from "./src/assemblage.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
// sources découpées par sujet (src/i18n/, src/carte/, src/editeur/) : recollées dans l'ordre de src/assemblage.mjs
const assemblage = verifier();
if (assemblage.problemes.length) {
  console.error(`Assemblage des sources (src/assemblage.mjs) :\n  ${assemblage.problemes.join("\n  ")}`);
  process.exit(1);
}
const i18n = assembler(MORCEAUX.i18n);
// en développement, la carte et l'éditeur importent maquette-i18n.js (et l'éditeur maquette-nettoyage.js) ; dans dist/ ils sont déjà là
const sansImport = (s) => s.replace(/^import "\.\/maquette-(?:i18n|nettoyage)\.js";.*\n/gm, "");
// moteur « Nettoyer le plan » (module pur, globalThis.MaquetteNettoyage) : utilisé par l'éditeur seul, placé dans son module
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
const clesDe = (...l) => { const c = new Set(); for (const s of l) for (const m of s.matchAll(/\b_tk?\(\s*"((?:[^"\\\n]|\\.)*)"/g)) c.add(JSON.parse(`"${m[1]}"`)); return c; };
const clesCarte = clesDe(carte, demo), clesEditeur = clesDe(editeur), cles = new Set([...clesCarte, ...clesEditeur]);
const manquantes = [...cles].filter((k) => !(k in en));
if (manquantes.length) {
  console.error(`${manquantes.length} texte(s) sans traduction anglaise (src/i18n/textes-*.js) :\n  ${manquantes.join("\n  ")}`);
  process.exit(1);
}
const enTrop = Object.keys(en).filter((k) => !cles.has(k));
if (enTrop.length) console.warn(`${enTrop.length} traduction(s) anglaise(s) inutilisée(s) :\n  ${enTrop.join("\n  ")}`);

// dictionnaire anglais partagé : les textes cités seulement par l'éditeur partent dans son module (ajoutés à l'ouverture) ;
// ceux de la carte, de la démo, et par prudence ceux qu'aucune source ne cite, restent dans la carte
const ligne = (k) => `    ${JSON.stringify(k)}: ${JSON.stringify(en[k])},\n`;
const seulEditeur = (k) => clesEditeur.has(k) && !clesCarte.has(k);
const debut = assembler(["i18n/moteur-debut.js"]), fin = assembler(["i18n/moteur-fin.js"]);
if (!/const EN = \{\n$/.test(debut)) { console.error("src/i18n/moteur-debut.js : doit finir par « const EN = { »"); process.exit(1); }
const i18nCarte = `${debut}${Object.keys(en).filter((k) => !seulEditeur(k)).map(ligne).join("")}  };\n${fin}`;
const textesEditeur = Object.keys(en).filter(seulEditeur).map(ligne).join("");
const ctx2 = { Intl, console };
vm.runInNewContext(i18nCarte, ctx2);
if (Object.keys(ctx2.MaquetteI18n.DICO.en).length + textesEditeur.split("\n").length - 1 !== Object.keys(en).length) {
  console.error("partage des textes anglais carte / éditeur incohérent");
  process.exit(1);
}

const entete = (quoi) => `/*! Maquette v${pkg.version}${quoi} | MIT | ${pkg.homepage} */\n`;
const sortieCarte = `${entete("")}${i18nCarte}
${demo}
${carte}`;
// module de l'éditeur : sans import ni export (chargé par import() depuis la carte, ou comme ressource ordinaire) ; il attend que la
// carte soit définie (outils communs, textes) et ne fait rien si un éditeur est déjà là (ancienne version d'un seul fichier)
const sortieEditeur = `${entete(" (editor)")}(() => {
const demarrer = () => {
if (globalThis.MaquetteEditeur) return;
Object.assign(globalThis.MaquetteI18n.DICO.en, {
${textesEditeur}});
${nettoyage}
const jsyaml = (() => { const module = { exports: {} }, exports = module.exports;
${jsyaml}
return module.exports; })();
${editeur.replace(/^export class EditeurPlan/m, "class EditeurPlan")}
EditeurPlan.VERSION = ${JSON.stringify(pkg.version)};
globalThis.MaquetteEditeur = EditeurPlan;
};
if (customElements.get("maquette-card")) demarrer(); else customElements.whenDefined("maquette-card").then(demarrer);
})();
`;
mkdirSync("dist", { recursive: true });
const fichiers = { "maquette-card.js": sortieCarte, "maquette-editeur.js": sortieEditeur };
for (const [nom, s] of Object.entries(fichiers)) writeFileSync(`dist/${nom}`, s);
const kio = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} Kio`;
console.log(`dist/ v${pkg.version} : maquette-card.js ${kio(sortieCarte)}, maquette-editeur.js ${kio(sortieEditeur)} (${cles.size} textes traduits)`);

// --min : copies minifiées pour la release (src/ et dist/ restent lisibles dans le dépôt) ; terser local, sinon la même version par npx
if (process.argv.includes("--min")) {
  mkdirSync("release", { recursive: true });
  const TERSER = "5.38.0";
  let cmd = ["terser"];
  try { if (!execFileSync("terser", ["--version"], { encoding: "utf8" }).includes(TERSER)) throw 0; } catch (e) { cmd = ["npx", "--yes", `terser@${TERSER}`]; }
  for (const nom of Object.keys(fichiers)) {
    execFileSync(cmd[0], [...cmd.slice(1), `dist/${nom}`, "--module", "--compress", "--mangle", "--comments", "/^!/", "-o", `release/${nom}`], { stdio: "inherit" });
    execFileSync("node", ["--check", `release/${nom}`], { stdio: "inherit" });
    console.log(`release/${nom} ${kio(readFileSync(`release/${nom}`, "utf8"))}`);
  }
}
