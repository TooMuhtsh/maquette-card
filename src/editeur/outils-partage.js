// partage d'éléments (format `maquette_share`, code compact MAQ1:), emplacements d'entités, entités introuvables : fonctions pures — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// Un partage = des modèles (format public des `templates`) : widgets, pastilles, ouvertures, meubles.
//   maquette_share: 1
//   elements: [{ name, kind, icon, item: {…, entity: "<<battery>>"} }]
//   placeholders: { battery: { label, domain, device_class?, unit?, state_class? } }
// Anonymisé (défaut) : chaque entité devient un emplacement « <<rôle>> » ; noms des lignes et des pastilles, données d'action et
// liens retirés. Toujours retirés : id, origine (copie liée), groupe, position, segment, pièce, zone, verrou.
// À la lecture : taille plafonnée (texte, décompression, éléments), __proto__ retiré, même assainissement que la carte (clés
// inconnues ignorées, couleurs, icônes…), type inconnu ignoré et listé, toute commande importée demande une confirmation.
const PARTAGE_V = 1, PARTAGE_CODE = "MAQ1:", PARTAGE_MAX = 1e6, PARTAGE_MAX_ELEMENTS = 200, PARTAGE_SLOT = "maquette_slot";
const RX_ROLE = /^[a-z0-9_]{1,40}$/, RX_EMPL = /^<<([a-z0-9_]{1,40})>>$/, RX_ENTITE_P = /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/;
const GENRES_PARTAGE = ["widget", "point", "ouverture", "meuble"];
const TYPES_WIDGET_PARTAGE = ["tarif", "ve", "jauge", "tuile", "entites", "periodes", "separateur", "commande", "thermostat", "climat", "serrure"];
// widgets qui commandent quelque chose : `confirmer: true` à l'import
const WIDGETS_COMMANDE = ["commande", "serrure", "thermostat", "entites"];
// champs entité (clés internes) : une entité en texte ; listes d'entités (texte ou { entite })
const CLES_ENT_P = new Set([...CHAMPS_ENTITE_WIDGET, "valeur", "actif", "contact", "volet", "stat", "jour", "semaine", "mois", "annee", "temperature", "humidite", "plus_infos"]);
const LISTES_ENT_P = new Set(["lignes", "entites", "contact"]);
// diagnostic : en plus, cibles des boutons des pièces, source d'énergie, lune, personnes
const CLES_ENT_DIAG = new Set([...CLES_ENT_P, "cible", "source", "lune"]);
const LISTES_ENT_DIAG = new Set([...LISTES_ENT_P, "personnes"]);
// rôle d'un emplacement : nom anglais du champ (lisible dans le fichier) ; champ générique : classe d'appareil ou domaine
const ROLE_CHAMP = { prix: "price", periode: "period", couleur_jour: "color_today", couleur_demain: "color_tomorrow", batterie: "battery", autonomie: "range", puissance: "power",
  branche: "plugged", session_kwh: "session_kwh", session_cout: "session_cost", volet: "shutter", jour: "day", semaine: "week", mois: "month", annee: "year",
  temperature: "temperature", humidite: "humidity", plus_infos: "more_info" };
const NOM_CHAMP_P = { prix: _tk("Prix"), periode: _tk("Période tarifaire"), couleur_jour: _tk("Couleur du jour"), couleur_demain: _tk("Couleur de demain"), batterie: _tk("Batterie"),
  autonomie: _tk("Autonomie"), puissance: _tk("Puissance de charge"), branche: _tk("Câble branché"), session_kwh: _tk("Énergie de la session"), session_cout: _tk("Coût de la session"),
  volet: _tk("Volet"), contact: _tk("Contact"), stat: _tk("Compteur"), jour: _tk("Compteur du jour"), semaine: _tk("Compteur de la semaine"), mois: _tk("Compteur du mois"), annee: _tk("Compteur de l'année"),
  temperature: _tk("Température"), humidite: _tk("Humidité"), plus_infos: _tk("Plus d'infos"), valeur: _tk("Valeur affichée"), actif: _tk("État actif") };

// chaque entité aux places d'entité d'un objet : f(conteneur, clé ou rang, entité, clé du champ) → undefined (garder), null (retirer), texte (remplacer)
function parcourirEntites(o, f, diag = false, k0 = "") {
  const CLES = diag ? CLES_ENT_DIAG : CLES_ENT_P, LISTES = diag ? LISTES_ENT_DIAG : LISTES_ENT_P;
  if (Array.isArray(o)) {
    const retires = [];
    o.forEach((x, i) => {
      if (typeof x === "string") { if (LISTES.has(k0) && RX_ENTITE_P.test(x)) { const r = f(o, i, x, k0); if (r === null) retires.push(i); else if (r !== undefined) o[i] = r; } }
      else if (x && typeof x === "object") parcourirEntites(x, f, diag, k0);
    });
    for (const i of retires.reverse()) o.splice(i, 1);
    return o;
  }
  if (!o || typeof o !== "object") return o;
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string") {
      if ((CLES.has(k) || k === "entite") && RX_ENTITE_P.test(v)) { const r = f(o, k, v, k); if (r === null) delete o[k]; else if (r !== undefined) o[k] = r; }
    } else if (v && typeof v === "object") parcourirEntites(v, f, diag, k);
  }
  return o;
}
// clés retirées partout (récursif) ; à la racine de l'objet en plus : position, segment, pièce
function sansClesP(o, cles) {
  if (Array.isArray(o)) { o.forEach((x) => sansClesP(x, cles)); return o; }
  if (!o || typeof o !== "object") return o;
  for (const k of Object.keys(o)) { if (cles.includes(k)) delete o[k]; else sansClesP(o[k], cles); }
  return o;
}
const CLES_JAMAIS_P = ["origine", "groupe", "zone", "verrouille"];
// un élément interne prêt à partager : { nom, genre, icone?, desc?, type? (meuble), domaine? (pastille), cat?, objet, demander? }
function elementPartage(m) {
  const e = {};
  for (const k of ["nom", "genre", "icone", "desc", "type", "domaine", "cat", "mots", "demander"]) if (m[k] != null) e[k] = clone(m[k]);
  e.objet = sansClesP(clone(m.objet || {}), CLES_JAMAIS_P);
  for (const k of ["pos", "seg", "piece", "id"]) delete e.objet[k];
  if (Array.isArray(m.objets)) e.objets = sansClesP(clone(m.objets), CLES_JAMAIS_P);
  return e;
}
// description d'un emplacement d'après l'entité d'origine (domaine, classe d'appareil, unité : rien de propre à la maison)
function descriptionEmplacement(hass, e, champ) {
  const a = hass?.states?.[e]?.attributes || {}, dom = e.split(".")[0];
  const d = { libelle: NOM_CHAMP_P[champ] ? _t(NOM_CHAMP_P[champ]) : nomDomaineP(dom), domaine: dom };
  if (typeof a.device_class === "string" && a.device_class) d.device_class = a.device_class.slice(0, 40);
  if (typeof a.unit_of_measurement === "string" && a.unit_of_measurement) d.unite = a.unit_of_measurement.slice(0, 20);
  if (typeof a.state_class === "string" && a.state_class) d.state_class = a.state_class.slice(0, 40);
  return d;
}
const nomDomaineP = (dom) => { const x = DOMAINES.find(([d]) => d && d === dom); return x ? _t(x[1]) : dom; };
// anonymise des éléments (interne) : entités → « <<rôle>> », emplacements décrits ; garder = true : entités gardées, rien d'autre ne change
function anonymiserPartage(elements, hass, garder = false) {
  const els = elements.map(elementPartage), emplacements = {};
  if (garder) return { elements: els, emplacements };
  const roles = new Map();
  const role = (e, champ) => {
    if (roles.has(e)) return roles.get(e);
    const a = hass?.states?.[e]?.attributes || {}, dom = e.split(".")[0];
    let base = (ROLE_CHAMP[champ] || (typeof a.device_class === "string" && a.device_class) || dom).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 34) || "entity";
    let r = base, n = 2;
    while (emplacements[r]) r = `${base}_${n++}`;
    roles.set(e, r);
    emplacements[r] = descriptionEmplacement(hass, e, champ);
    return r;
  };
  const prive = (o, racine) => {
    if (Array.isArray(o)) return o.forEach((x) => prive(x, false));
    if (!o || typeof o !== "object") return;
    delete o.donnees;
    if (typeof o.plus_infos === "string" && !RX_ENTITE_P.test(o.plus_infos)) delete o.plus_infos;
    for (const k of ["lignes", "entites", "infos"]) if (Array.isArray(o[k])) o[k].forEach((l) => { if (l && typeof l === "object") delete l.nom; });
    if (racine) delete o.nom;
    for (const v of Object.values(o)) if (v && typeof v === "object") prive(v, false);
  };
  for (const el of els) {
    const visiter = (o) => parcourirEntites(o, (c, k, e, champ) => `<<${role(e, champ)}>>`);
    visiter(el.objet); if (el.objets) visiter(el.objets);
    // pastille : son nom est celui de l'entité (personnalisé) ; meubles et ouvertures gardent le leur
    prive(el.objet, el.genre === "point"); if (el.objets) prive(el.objets, false);
  }
  return { elements: els, emplacements };
}
// objet public du partage (YAML / JSON) : en-tête de version, éléments au format des `templates`, emplacements
function objetPartage(elements, emplacements) {
  const en = versAnglais({ modeles: elements }).templates || [];
  const o = { maquette_share: PARTAGE_V, elements: en };
  const r = Object.entries(emplacements || {});
  if (r.length) o.placeholders = Object.fromEntries(r.map(([k, d]) => [k, { label: d.libelle, domain: d.domaine, ...(d.device_class ? { device_class: d.device_class } : {}), ...(d.unite ? { unit: d.unite } : {}), ...(d.state_class ? { state_class: d.state_class } : {}) }]));
  return o;
}
const yamlPartage = (o) => `# Maquette (maquette-card) : import in the editor › Import / export\n${versYaml(o)}\n`;
// code compact : « MAQ1: » + JSON compressé (deflate-raw) en base64url ; sans CompressionStream : null
async function codeCompact(o) {
  if (typeof CompressionStream !== "function") return null;
  const flux = new Blob([JSON.stringify(o)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const oct = new Uint8Array(await new Response(flux).arrayBuffer());
  let b = "";
  for (let i = 0; i < oct.length; i += 0x8000) b += String.fromCharCode(...oct.subarray(i, i + 0x8000));
  return PARTAGE_CODE + btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
// lecture du code compact : préfixe et version vérifiés avant tout, décompression arrêtée au-delà de PARTAGE_MAX (bombe)
async function lireCodeCompact(txt) {
  const m = /^MAQ(\d{1,4}):([A-Za-z0-9_-]*)$/.exec(txt.replace(/\s+/g, ""));
  if (!m) throw new Error(_t("Code compact illisible : il doit commencer par MAQ1: suivi de lettres et de chiffres."));
  if (+m[1] !== 1) throw new Error(_t("Code compact d'une version plus récente de Maquette (MAQ{v}) : mets la carte à jour pour l'importer.", { v: m[1] }));
  if (m[2].length > PARTAGE_MAX) throw new Error(_t("Partage trop gros : import refusé."));
  if (typeof DecompressionStream !== "function") throw new Error(_t("Ce navigateur ne sait pas lire le code compact : demande la version YAML."));
  let oct;
  try { const b = atob(m[2].replace(/-/g, "+").replace(/_/g, "/")); oct = Uint8Array.from(b, (c) => c.charCodeAt(0)); } catch (e) { throw new Error(_t("Code compact illisible : il doit commencer par MAQ1: suivi de lettres et de chiffres.")); }
  const lecteur = new Blob([oct]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader(), parts = [];
  let n = 0;
  try {
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) break;
      n += value.length;
      if (n > PARTAGE_MAX) { lecteur.cancel().catch(() => {}); throw new Error(_t("Partage trop gros : import refusé.")); }
      parts.push(value);
    }
  } catch (e) { throw e instanceof Error && /trop gros|too large/i.test(e.message) ? e : new Error(_t("Code compact abîmé (copie incomplète ?) : import refusé.")); }
  const tout = new Uint8Array(n);
  let p = 0;
  for (const x of parts) { tout.set(x, p); p += x.length; }
  try { return JSON.parse(new TextDecoder().decode(tout)); } catch (e) { throw new Error(_t("Code compact abîmé (copie incomplète ?) : import refusé.")); }
}
// texte collé ou fichier : { genre: "plan" } (à importer comme plan) ou { genre: "partage", objet } ; erreurs claires
async function lireTextePartage(txt) {
  txt = String(txt ?? "").trim();
  if (!txt) throw new Error(_t("Rien à importer : colle un partage ou ouvre un fichier."));
  if (/^MAQ\d{1,4}:/.test(txt)) return { genre: "partage", objet: await lireCodeCompact(txt), compact: true };
  if (txt.length > MAX_IMPORT) throw new Error(_t("Plan trop gros : {n} Mo, au plus {max} Mo.", { n: fmt(txt.length / 1e6, 1), max: fmt(MAX_IMPORT / 1e6, 0) }));
  let o;
  try { o = /^\s*[{[]/.test(txt) ? JSON.parse(txt) : jsyaml.load(txt, { schema: jsyaml.CORE_SCHEMA }); } catch (e) { throw new Error(_t("Lecture impossible : {err}", { err: (e.message || e).toString().split("\n")[0] })); }
  if (o && typeof o === "object" && !Array.isArray(o) && Object.hasOwn(o, "maquette_share")) return { genre: "partage", objet: o };
  return { genre: "plan" };
}
// objet du partage → éléments internes sûrs. Rend { elements, emplacements, ignores: [texte], inconnues, retires, version }
// Les emplacements « <<rôle>> » sont lus comme entités provisoires maquette_slot.<rôle> (même assainissement que des entités),
// puis repérés par chemin dans chaque élément : el.places = [{ role, chemin }].
function lirePartage(o, K) {
  if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error(_t("Ce n'est pas un partage Maquette."));
  verifierTaille(o);
  const v = o.maquette_share;
  if (!Number.isInteger(v) || v < 1) throw new Error(_t("Ce n'est pas un partage Maquette."));
  if (v > PARTAGE_V) throw new Error(_t("Partage d'une version plus récente de Maquette (format {v}) : mets la carte à jour pour l'importer.", { v }));
  if (!Array.isArray(o.elements)) throw new Error(_t("« elements » doit être une liste."));
  if (o.elements.length > PARTAGE_MAX_ELEMENTS) throw new Error(_t("Trop d'éléments ({n}, au plus {max}) : import refusé.", { n: o.elements.length, max: PARTAGE_MAX_ELEMENTS }));
  // emplacements déclarés : rôle sûr, domaine sûr, textes courts
  const emplacements = {}, txt = (x, n) => (typeof x === "string" && x.trim() ? x.trim().slice(0, n) : null);
  const ph = o.placeholders && typeof o.placeholders === "object" && !Array.isArray(o.placeholders) ? o.placeholders : {};
  for (const [r, d] of Object.entries(ph)) {
    if (!RX_ROLE.test(r) || !d || typeof d !== "object") continue;
    const dom = txt(d.domain, 64);
    emplacements[r] = { libelle: txt(d.label, 80) || r, domaine: dom && /^[a-z0-9_]{1,64}$/.test(dom) ? dom : "" };
    for (const [k, c, n] of [["device_class", "device_class", 40], ["unit", "unite", 20], ["state_class", "state_class", 40]]) { const x = txt(d[k], n); if (x) emplacements[r][c] = x; }
  }
  // « <<rôle>> » → entité provisoire (rôle non déclaré : emplacement sans domaine)
  const remplacer = (x) => {
    if (Array.isArray(x)) return x.map(remplacer);
    if (typeof x === "string") { const m = RX_EMPL.exec(x); if (!m) return x; emplacements[m[1]] ||= { libelle: m[1], domaine: "" }; return `${PARTAGE_SLOT}.${m[1]}`; }
    if (!x || typeof x !== "object") return x;
    return Object.fromEntries(Object.entries(x).map(([k, y]) => [k, remplacer(y)]));
  };
  const rap = {}, rapport = {}, ignores = [];
  // éléments qui ne sont pas des objets : ignorés d'emblée (les rangs suivent les éléments lus)
  const bruts = [];
  o.elements.forEach((x, i) => { if (x && typeof x === "object" && !Array.isArray(x)) bruts.push(remplacer(x)); else ignores.push(_t("Élément {n} : illisible", { n: i + 1 })); });
  const c = K.normaliser(K.depuisAnglais({ type: "custom:maquette-card", templates: bruts }, rap), rapport);
  const nomTypeW = (t) => (TYPES_ATELIER().find((x) => x.id === t)?.nom) || t;
  const elements = [];
  (c.modeles || []).forEach((m, i) => {
    const nom = typeof bruts[i]?.name === "string" ? bruts[i].name.slice(0, 80) : _t("Élément {n}", { n: i + 1 });
    if (!m || !GENRES_PARTAGE.includes(m.genre) || !m.objet || typeof m.objet !== "object" || Array.isArray(m.objet)) {
      return ignores.push(_t("« {nom} » : sorte d'élément inconnue ({k})", { nom, k: String(bruts[i]?.kind ?? "?").slice(0, 40) }));
    }
    if (m.genre === "widget" && !TYPES_WIDGET_PARTAGE.includes(m.objet.type)) return ignores.push(_t("« {nom} » : type de widget inconnu ({k})", { nom, k: String(bruts[i]?.item?.type ?? "?").slice(0, 40) }));
    const el = elementPartage(m);
    el.nom = typeof el.nom === "string" && el.nom.trim() ? el.nom.trim().slice(0, 80) : m.genre === "widget" ? nomTypeW(m.objet.type) : nom;
    delete el.objets; // ancienne forme (plusieurs widgets d'un modèle) : non partagée
    // champs du modèle que la carte ne valide pas : textes courts, domaine sûr
    for (const k of ["desc", "mots"]) if (k in el) { if (typeof el[k] === "string") el[k] = el[k].slice(0, 200); else delete el[k]; }
    if ("domaine" in el && !(typeof el.domaine === "string" && /^[a-z0-9_]{1,64}$/.test(el.domaine))) delete el.domaine;
    if ("demander" in el && !(Array.isArray(el.demander) && el.demander.every((c) => typeof c === "string" && /^[\w.]{1,80}$/.test(c)))) delete el.demander;
    // widgets de fiche d'un type inconnu : retirés et listés
    const fiche = el.objet.fiche;
    if (fiche && Array.isArray(fiche.widgets)) fiche.widgets = fiche.widgets.filter((w) => { const ok = w && TYPES_WIDGET_PARTAGE.includes(w.type); if (!ok) ignores.push(_t("« {nom} » : widget de fiche inconnu ({k})", { nom: el.nom, k: String(w?.type ?? "?").slice(0, 40) })); return ok; });
    // toute commande importée demande une confirmation
    const confirmer = (w) => { if (w && typeof w === "object" && WIDGETS_COMMANDE.includes(w.type)) w.confirmer = true; };
    if (m.genre === "widget") confirmer(el.objet); else if (["entite", "fiche", "volet", "contact", "valeur"].some((k) => k in el.objet)) el.objet.confirmer = true;
    if (fiche && Array.isArray(fiche.widgets)) fiche.widgets.forEach(confirmer);
    // places des emplacements : chemins (lignes et contacts compris)
    el.places = [];
    const chemin = (o2, pre) => {
      if (Array.isArray(o2)) return o2.forEach((x, j) => { if (typeof x === "string" && x.startsWith(`${PARTAGE_SLOT}.`)) el.places.push({ role: x.slice(PARTAGE_SLOT.length + 1), chemin: `${pre}.${j}` }); else chemin(x, `${pre}.${j}`); });
      if (!o2 || typeof o2 !== "object") return;
      for (const [k, x] of Object.entries(o2)) {
        const p = pre ? `${pre}.${k}` : k;
        if (typeof x === "string" && x.startsWith(`${PARTAGE_SLOT}.`)) el.places.push({ role: x.slice(PARTAGE_SLOT.length + 1), chemin: p });
        else if (x && typeof x === "object") chemin(x, p);
      }
    };
    chemin(el.objet, "");
    // `$entite` et rôles inconnus mis à part, aucune entité provisoire ne doit rester hors des places (contacts retirés…)
    elements.push(el);
  });
  // emplacements réellement utilisés
  const utilises = new Set(elements.flatMap((e) => e.places.map((p) => p.role)));
  for (const r of Object.keys(emplacements)) if (!utilises.has(r)) delete emplacements[r];
  return { elements, emplacements, ignores, inconnues: rap.inconnues || [], retires: rapport.retires || [], version: v };
}
// association appliquée à un élément lu : rôle → entité (absent ou vide : champ vidé, rendu dans `manquants`)
function associerElement(el, choix) {
  const o = clone(el.objet), manquants = new Set(), retirer = [];
  for (const p of el.places) {
    const e = choix[p.role];
    if (e) { poserChemin(o, p.chemin, e); continue; }
    const s = p.chemin.split("."), dernier = s[s.length - 1];
    // ligne d'une liste ou contact : la ligne entière est retirée ; champ simple : vidé (« à compléter »)
    if (/^(lignes|entites)\.\d+\.entite$/.test(p.chemin) || /^(lignes|entites|contact)\.\d+$/.test(p.chemin)) { retirer.push(p.chemin); manquants.add(s[0]); }
    else { poserChemin(o, p.chemin, ""); manquants.add(/^\d+$/.test(dernier) ? s[0] : p.chemin); }
  }
  // lignes retirées de la fin vers le début (rangs inchangés)
  for (const c of retirer.sort((a, b) => +b.split(".")[1] - +a.split(".")[1])) { const [k, j] = c.split("."); if (Array.isArray(o[k])) o[k].splice(+j, 1); }
  if (Array.isArray(o.contact)) { if (!o.contact.length) delete o.contact; else if (o.contact.length === 1) o.contact = o.contact[0]; }
  // aucune entité provisoire ne survit
  parcourirEntites(o, (c, k, e) => (e.startsWith(`${PARTAGE_SLOT}.`) ? null : undefined));
  return { objet: o, manquants };
}
// entités de toute la config (interne) qui n'existent pas dans HA : Map entité → [{ ou }] (où elle est utilisée)
function entitesIntrouvables(d, hass, nomType = (t) => t) {
  const l = new Map(), etats = hass?.states || {};
  const NOMS = { pieces: _tk("Pièce"), points: _tk("Pastille"), ouvertures: _tk("Ouverture"), meubles: _tk("Meuble"), textes: _tk("Texte"), modeles: _tk("Modèle"), etages: _tk("Étage"),
    resume: _tk("Puces du haut"), alertes: _tk("Alertes"), ambiance: _tk("Ambiance"), panneaux: _tk("Panneaux de la maison"), gauche: _tk("Panneau gauche"), droite: _tk("Panneau droit"), fiche: _tk("Fiche"), etage_actif: _tk("Panneaux de la maison") };
  const nomDe = (o) => (o && typeof o === "object" ? [o.nom, o.titre, o.t, o.entite, typeof o.type === "string" && o.type ? nomType(o.type) : null].find((v) => typeof v === "string" && v) : "") || "";
  const voir = (o, ou) => {
    if (Array.isArray(o)) return;
    if (!o || typeof o !== "object") return;
    for (const [k, v] of Object.entries(o)) {
      if (k === "modeles") continue; // à part, plus bas
      if (Array.isArray(v)) {
        v.forEach((x, j) => {
          if (typeof x === "string") { if (LISTES_ENT_DIAG.has(k) && RX_ENTITE_P.test(x) && !etats[x]) noter(x, ou); return; }
          if (!x || typeof x !== "object") return;
          const n = nomDe(x), etiquette = NOMS[k] ? `${_t(NOMS[k])} ${n ? `« ${n} »` : j + 1}` : null;
          // lignes d'un widget : l'objet est le widget lui-même
          if (["lignes", "entites", "infos", "colonnes"].includes(k)) { parcourirEntites(clone(x), (c, kk, e) => { if (!etats[e]) noter(e, ou); }, true); return; }
          voir(x, etiquette ? [...ou, etiquette] : ou);
        });
      } else if (typeof v === "string") { if ((CLES_ENT_DIAG.has(k) || k === "entite") && RX_ENTITE_P.test(v) && !etats[v]) noter(v, ou); }
      else if (v && typeof v === "object") voir(v, NOMS[k] && !["panneaux", "etage_actif"].includes(k) ? [...ou, _t(NOMS[k])] : k === "panneaux" && !ou.length ? [_t(NOMS.panneaux)] : ou);
    }
  };
  const noter = (e, ou) => { if (e.startsWith(`${PARTAGE_SLOT}.`)) return; if (!l.has(e)) l.set(e, []); l.get(e).push({ ou: ou.join(" › ") || _t("Plan") }); };
  voir(d, []);
  // modèles : à part, avec leur nom
  (d.modeles || []).forEach((m, j) => { if (m && typeof m === "object") voir({ objet: m.objet }, [`${_t("Modèle")} « ${m.nom || j + 1} »`]); });
  return l;
}
// remplace partout (en place) une entité par une autre ; rend le nombre de remplacements
function remplacerEntite(d, de, vers) {
  let n = 0;
  parcourirEntites(d, (c, k, e) => (e === de ? (n++, vers) : undefined), true);
  return n;
}
