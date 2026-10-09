// étages : config repliée (stockée) ↔ dépliée sur l'étage affiché, fonctions pures (MaquetteCard.ETAGES) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- étages (`floors`) : la carte garde la config repliée (this._plein) et l'étage affiché déplié à la racine (this._config) ----------
// Repliée (forme stockée, normalisée) : la géométrie de chaque étage dans `etages[n]`, rien à la racine que le commun à la maison.
// Dépliée sur un étage : sa géométrie (et ses panneaux s'il a les siens) à la racine, comme un plan à un étage, les autres étages
// restent dans `etages` ; l'étage déplié n'y garde que son identité (id, nom, court, icône). Une seule clé interne, `etage_actif`
// ({ id, propres : panneaux de l'étage, panneaux : ceux de la maison mis de côté }), jamais exportée (versAnglais replie d'abord).
// Sans `etages` : deplier et replier rendent une copie identique.
const CLES_ETAGE = ["pieces", "murs", "limites", "ouvertures", "points", "textes", "meubles", "groupes", "fond"];
// identifiants des étages, du bas vers le haut ([] sans étages)
const idsEtages = (c) => (Array.isArray(c?.etages) ? c.etages.map((e) => e?.id).filter((x) => typeof x === "string") : []);
// étage affiché au chargement : `default_floor`, sinon le mémorisé s'il existe encore, sinon le premier ; null sans étages
function etageInitial(c, memo = null) {
  const l = idsEtages(c);
  if (!l.length) return null;
  return l.includes(c.etage_defaut) ? c.etage_defaut : l.includes(memo) ? memo : l[0];
}
function deplier(plein, id) {
  const c = copie(plein);
  if (!objetSimple(c) || objetSimple(c.etage_actif) || !Array.isArray(c.etages) || !c.etages.length) return c;
  let i = c.etages.findIndex((e) => e?.id === id);
  if (i < 0) i = Math.max(0, c.etages.findIndex((e) => e?.id === etageInitial(c)));
  const e = objetSimple(c.etages[i]) ? c.etages[i] : {}, ident = {}, geo = {}, actif = { id: e.id };
  for (const [k, v] of Object.entries(e)) (CLES_ETAGE.includes(k) || k === "panneaux" ? geo : ident)[k] = v;
  for (const k of CLES_ETAGE) delete c[k];
  if ("panneaux" in geo) {
    actif.propres = true;
    if ("panneaux" in c) actif.panneaux = c.panneaux;
    delete c.panneaux;
  }
  c.etages[i] = ident;
  return Object.assign(c, geo, { etage_actif: actif });
}
function replier(deplie) {
  const c = copie(deplie);
  if (!objetSimple(c) || !objetSimple(c.etage_actif)) return c;
  const A = c.etage_actif, geo = {};
  delete c.etage_actif;
  for (const k of CLES_ETAGE) if (k in c) { geo[k] = c[k]; delete c[k]; }
  if (A.propres) {
    if ("panneaux" in c) geo.panneaux = c.panneaux;
    delete c.panneaux;
    if ("panneaux" in A) c.panneaux = A.panneaux;
  }
  if (!Array.isArray(c.etages)) c.etages = [];
  const i = c.etages.findIndex((e) => e?.id === A.id);
  // étage déplié introuvable (retiré de la liste pendant l'édition) : sa géométrie est remise en dernier plutôt que perdue
  if (i < 0) c.etages.push({ id: A.id, ...geo }); else c.etages[i] = { ...c.etages[i], ...geo };
  return c;
}
// toute la maison, étage par étage (lecture seule : ne pas modifier) : config repliée ou dépliée ; sans étages, un seul (id null).
// court : celui de l'étage, sinon son rang depuis 0 ; geo : listes de l'étage ([] si absentes) et fond (ou null) ;
// panneaux : ceux de l'étage, null s'il prend ceux de la maison
function parEtage(c) {
  if (!objetSimple(c)) return [];
  const A = objetSimple(c.etage_actif) ? c.etage_actif : null, L = Array.isArray(c.etages) && c.etages.length ? c.etages : [null];
  return L.map((e, i) => {
    const ici = e === null || (A && e?.id === A.id), s = ici ? c : objetSimple(e) ? e : {}, geo = {};
    for (const k of CLES_ETAGE) geo[k] = k === "fond" ? (objetSimple(s.fond) ? s.fond : null) : Array.isArray(s[k]) ? s[k] : [];
    const panneaux = e === null ? null : ici ? (A?.propres ? c.panneaux ?? null : null) : e?.panneaux ?? null;
    return { id: e?.id ?? null, nom: e?.nom ?? null, court: e?.court ?? String(i), icone: e?.icone ?? null, geo, panneaux };
  });
}
