// étages (floors), escaliers, normaliserConfig — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- étages (`floors`) : chaque étage porte sa géométrie (et au besoin ses panneaux, son fond) ; tout le reste est commun ----------
const CLES_GEO = ["pieces", "murs", "limites", "ouvertures", "points", "textes", "meubles", "groupes"];
// structure des étages (avant la géométrie) : liste, géométrie absente de la racine, éléments objets, identifiants sûrs et uniques,
// étage par défaut connu ; ret : chemins internes des valeurs retirées ou corrigées
function normaliserEtages(c, ret) {
  if (!("etages" in c)) return;
  if (!Array.isArray(c.etages)) throw new Error("maquette-card : « floors » must be a list of floors");
  if (!c.etages.length) { delete c.etages; ret.push(["etages"]); return; }
  const vide = (v) => v == null || (Array.isArray(v) && !v.length);
  const racine = [...CLES_GEO, "fond"].filter((k) => k in c && !vide(c[k]));
  if (racine.length) throw new Error(`maquette-card : with « floors », the plan is drawn floor by floor: move ${racine.map((k) => `« ${cheminPublic([k])} »`).join(", ")} into floors[n] (each floor has its own rooms, walls, openings…)`);
  for (const k of [...CLES_GEO, "fond"]) delete c[k];
  const l = [];
  c.etages.forEach((e, i) => { if (objetSimple(e)) l.push(e); else ret.push(["etages", i]); });
  if (!l.length) { delete c.etages; return; }
  // identifiants : les valides gardés (le premier d'un doublon), les autres remplacés (floor_<rang>) ou suffixés (_2, _3…)
  const pris = new Set(), libre = (base) => { let id = base, k = 2; while (pris.has(id)) id = `${base}_${k++}`; return id; };
  const ok = l.map((e) => { const v = typeof e.id === "string" && ID_SUR.test(e.id) && !pris.has(e.id) ? e.id : null; if (v) pris.add(v); return v; });
  l.forEach((e, n) => {
    if (ok[n]) return;
    const base = typeof e.id === "string" && ID_SUR.test(e.id) ? e.id.slice(0, 74) : `floor_${n + 1}`;
    e.id = libre(base); pris.add(e.id);
    ret.push(["etages", n, "id"]);
  });
  c.etages = l;
  if ("etage_defaut" in c && !pris.has(c.etage_defaut)) { delete c.etage_defaut; ret.push(["etage_defaut"]); }
}
// `floor` d'un meuble : seulement sur un escalier, vers un autre étage connu (sinon retiré)
function normaliserEscaliers(g, ids, propre, pre, ret) {
  (Array.isArray(g.meubles) ? g.meubles : []).forEach((m, j) => {
    if (!m || !("etage" in m) || (m.type === "escalier" && ids.includes(m.etage) && m.etage !== propre)) return;
    delete m.etage; ret.push([...pre, "meubles", j, "etage"]);
  });
}
// toute la normalisation de `setConfig` (sans la démo) : aussi utilisée par l'éditeur pour reconnaître la carte stockée
// plan à étages : rendu replié (`floors`, sans géométrie à la racine) ; une config dépliée (`etage_actif`) est rendue dépliée sur le même étage
function normaliserConfig(config, rapport) {
  if (objetSimple(config?.etage_actif)) return deplier(normaliserConfig(replier(config), rapport), config.etage_actif.id);
  config = booleens({ pieces: [], ...config });
  const ret = [];
  normaliserEtages(config, ret);
  const ids = idsEtages(config);
  if (ids.length) config.etages.forEach((e, n) => { normaliserGeo(e, rapport, ["etages", n]); normaliserEscaliers(e, ids, e.id, ["etages", n], ret); });
  else { normaliserGeo(config, rapport); normaliserEscaliers(config, [], null, [], ret); if ("etage_defaut" in config) { delete config.etage_defaut; ret.push(["etage_defaut"]); } }
  if (ids.length && "panneaux" in config) config.panneaux = normaliserPanneaux(config.panneaux); // panneaux communs à la maison
  if (rapport && ret.length) (rapport.retires ||= []).push(...ret.map(cheminPublic));
  if (Array.isArray(config.modeles)) config.modeles = normaliserModeles(config.modeles);
  if ("calques" in config) { const q = normaliserCalques(config.calques); if (q) config.calques = q; else delete config.calques; }
  if ("interaction" in config || "tablette" in config) normaliserInteraction(config);
  // étiquettes des pièces : { nom, temperature, humidite } (des clés qui ne sont pas booléennes ailleurs) : « false » écrit en texte → false
  const ep = config.etiquettes_pieces;
  if (ep && typeof ep === "object" && !Array.isArray(ep)) config.etiquettes_pieces = Object.fromEntries(Object.entries(ep).map(([k, v]) => [k, typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v]));
  return assainirConfig(config, rapport);
}

