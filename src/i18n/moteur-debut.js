// textes : en-tête, début du module MaquetteI18n — morceau de src/maquette-i18n.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
/* Maquette : textes de l'interface en anglais et en français (une seule source de vérité, partagée par la carte, l'éditeur et la démo).
 * Les clés sont les phrases françaises : en français, _t rend la clé telle quelle (seules les exceptions sont dans FR) ;
 * en anglais, une clé absente du dictionnaire retombe sur le français (et la build échoue : voir build.mjs).
 * - interpolation : _t("Pièce {n}", { n: 3 }) ; les valeurs sont insérées telles quelles (à échapper par l'appelant si besoin) ;
 * - pluriels : « singulier|pluriel » choisi par p.n (français : pluriel au-delà de 1, comme « 0 volet baissé » ; anglais : pluriel sauf 1) ;
 * - contexte : un suffixe « ##contexte » distingue deux sens d'une même phrase française (il n'est jamais affiché) ;
 * - _tk("…") marque une clé dans une table (traduite à l'affichage par _t) : la build vérifie qu'elle est traduite.
 * Langue : option `language` (auto | en | fr), sinon celle du profil HA (hass.locale.language, hass.language), sinon la page
 * (document.documentElement.lang, navigator.language) ; fr* → français, tout le reste → anglais. Nombres et dates : locale HA (Intl).
 * Fichier en tête de dist/maquette-card.js (build.mjs) ; en développement, importé par src/maquette-card.js. */
const MaquetteI18n = (() => {
  const EN = {
}; // @assemblage
})(); // @assemblage
