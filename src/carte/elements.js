// normalisation des éléments, couleurs et palette, fiches, animations, interaction et tablette — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// YAML écrit à la main : on remet chaque meuble dans une forme que le dessin et l'éditeur savent lire (sans perdre les clés inconnues)
const normaliserMeubles = (liste) => (Array.isArray(liste) ? liste : []).filter((m) => m && typeof m === "object" && !Array.isArray(m)).map((m) => {
  const n = { ...m }, def = MEUBLES[n.type];
  n.pos = [nb(n.pos?.[0]), nb(n.pos?.[1])];
  if (n.taille != null) {
    const t = Array.isArray(n.taille) ? n.taille : [n.taille, n.taille], d = def?.taille || [60, 60];
    n.taille = [bornerTaille(t[0], d[0]), bornerTaille(t[1] ?? t[0], d[1])];
  }
  if (n.rotation != null) n.rotation = nb(n.rotation);
  if (n.chaises != null) n.chaises = Math.max(0, Math.min(12, Math.round(nb(n.chaises))));
  if (n.teinte != null) n.teinte = n.teinte !== false && n.teinte !== "false";
  if (n.type === "forme") n.forme = normaliserForme(n.forme); else delete n.forme;
  // meuble connecté : mêmes clés que les pastilles ; une valeur invalide est retirée, jamais d'erreur
  for (const k of ["entite", "valeur", "actif"]) if (k in n && !(typeof n[k] === "string" && n[k].includes("."))) delete n[k];
  for (const k of ["unite", "actif_attribut", "attribut", "couleur"]) if (k in n && typeof n[k] !== "string") delete n[k];
  if ("couleur" in n && !couleurEcrite(n.couleur)) delete n.couleur;
  if ("seuil" in n) { if (n.seuil !== "" && n.seuil !== null && typeof n.seuil !== "boolean" && Number.isFinite(+n.seuil)) n.seuil = +n.seuil; else delete n.seuil; }
  if ("decimales" in n) { if (n.decimales !== null && n.decimales !== "" && Number.isFinite(+n.decimales)) n.decimales = Math.max(0, Math.min(6, Math.round(+n.decimales))); else delete n.decimales; }
  normaliserFiche(n);
  return n;
});
// `clic`, `protege` et `fiche` d'un meuble, d'une ouverture ou d'une pastille (objet déjà copié) : valeur invalide retirée ou corrigée
function normaliserFiche(n) {
  if ("clic" in n && !CLICS_MEUBLE.includes(n.clic)) delete n.clic;
  if ("protege" in n && typeof n.protege !== "boolean") n.protege = !!n.protege;
  if ("fiche" in n) {
    const f = Array.isArray(n.fiche) ? { widgets: n.fiche } : n.fiche;
    if (!f || typeof f !== "object") delete n.fiche;
    else {
      n.fiche = { ...f };
      if ("titre" in n.fiche && typeof n.fiche.titre !== "string") n.fiche.titre = n.fiche.titre == null ? "" : String(n.fiche.titre);
      if ("widgets" in n.fiche) n.fiche.widgets = normaliserWidgets((Array.isArray(n.fiche.widgets) ? n.fiche.widgets : []).filter((w) => w && typeof w === "object" && !Array.isArray(w)));
      // bouton « Plus d'infos » : false (masqué), une entité, un chemin de tableau de bord (/…) ou une URL (http…) ; sinon valeur par défaut
      if ("plus_infos" in n.fiche) {
        const v = n.fiche.plus_infos;
        if (v === false || v === "false" || v === "none") n.fiche.plus_infos = false;
        else if (typeof v === "string" && v.trim()) n.fiche.plus_infos = v.trim();
        else delete n.fiche.plus_infos;
      }
    }
  }
  return n;
}
// capteurs d'une ouverture : `contact` est une entité ou une liste (baie à plusieurs capteurs : ouverte dès que l'un l'est)
const contactsDe = (o) => (Array.isArray(o?.contact) ? o.contact : [o?.contact]).filter((e) => typeof e === "string" && e.includes("."));
// entité de référence d'une ouverture (nom, « plus d'infos », repères) : le premier contact, sinon l'entité motorisée
const entOuv = (o) => contactsDe(o)[0] || o?.entite;
const ETATS_MUETS = ["unavailable", "unknown"];
// état combiné de plusieurs capteurs : ouvert si l'un l'est (depuis le premier ouvert), puis en mouvement, puis fermé dès qu'un
// capteur répond (depuis le dernier fermé) ; indisponible seulement si aucun ne répond
function etatCombine(ss) {
  const l = ss.filter(Boolean), t = (s) => Date.parse(s.last_changed) || 0;
  const ouv = l.filter((s) => s.state === "on" || s.state === "open");
  if (ouv.length) return ouv.reduce((a, b) => (t(b) < t(a) ? b : a));
  const bouge = l.find((s) => s.state === "opening" || s.state === "closing");
  if (bouge) return bouge;
  const ok = l.filter((s) => !ETATS_MUETS.includes(s.state));
  return ok.length ? ok.reduce((a, b) => (t(b) > t(a) ? b : a)) : l[0];
}
// ouvertures : `battants` 1 ou 2, `ouvrant` connu, `vers_dehors` booléen ; une valeur invalide est retirée (seules les ouvertures
// qui portent ces clés sont copiées)
const normaliserOuvertures = (l) => (Array.isArray(l) ? l.map((o) => {
  if (!o || typeof o !== "object" || !("battants" in o || "ouvrant" in o || "vers_dehors" in o)) return o;
  const n = { ...o };
  if ("battants" in n) { if (+n.battants === 1 || +n.battants === 2) n.battants = +n.battants; else delete n.battants; }
  if ("ouvrant" in n && !OUVRANTS.includes(n.ouvrant)) delete n.ouvrant;
  if ("vers_dehors" in n) { if (n.vers_dehors === true || n.vers_dehors === "true") n.vers_dehors = true; else delete n.vers_dehors; }
  return n;
}) : l);
// modèles de meubles (« Mes modèles ») : couleur validée, forme bornée, comme un meuble posé (rien n'est dessiné d'un modèle invalide)
const normaliserModeles = (l) => (Array.isArray(l) ? l.map((m) => {
  if (!m || typeof m !== "object" || m.genre !== "meuble" || !m.objet || typeof m.objet !== "object") return m;
  const o = { ...m.objet };
  if ("couleur" in o && !couleurEcrite(o.couleur)) delete o.couleur;
  if ("forme" in o) o.forme = normaliserForme(o.forme);
  if ("taille" in o) { const t = Array.isArray(o.taille) ? o.taille : [o.taille, o.taille]; o.taille = [0, 1].map((j) => bornerTaille(t[j] ?? t[0])); }
  const n = { ...m, objet: o };
  if ("cat" in n && !Object.hasOwn(V_CATS_MEUBLES, n.cat)) delete n.cat;
  return n;
}) : l);
// ouvertures et pastilles : seules celles qui portent `clic`, `protege` ou `fiche` sont copiées (les autres restent telles quelles)
const normaliserPorteurs = (liste) => (Array.isArray(liste) ? liste.map((o) => (o && typeof o === "object" && !Array.isArray(o) && ("clic" in o || "protege" in o || "fiche" in o) ? normaliserFiche({ ...o }) : o)) : liste);
// widgets `commande` (entité cover ou valve seulement) et `serrure` (lock seulement) : `confirmer` booléen, `lignes` en liste ;
// les autres widgets ne sont pas touchés
const DOMAINES_CMD = { commande: /^(cover|valve)\./, serrure: /^lock\./ };
const normaliserWidgets = (l) => (Array.isArray(l) ? l.map((w) => {
  if (!Object.hasOwn(DOMAINES_CMD, w?.type)) return w;
  const n = { ...w };
  if ("entite" in n && !(typeof n.entite === "string" && DOMAINES_CMD[w.type].test(n.entite))) delete n.entite;
  if ("confirmer" in n && typeof n.confirmer !== "boolean") { if (n.confirmer == null || n.confirmer === "") delete n.confirmer; else n.confirmer = !["false", "non", "0", "off", "no"].includes(String(n.confirmer).toLowerCase()); }
  if ("lignes" in n && !Array.isArray(n.lignes)) delete n.lignes;
  return n;
}) : l);
// widgets des panneaux (maison et pièces) : même normalisation, la config d'origine n'est jamais modifiée
function normaliserPanneaux(p) {
  if (!p || typeof p !== "object" || Array.isArray(p) || ![p.gauche, p.droite].some((l) => Array.isArray(l) && l.some((w) => Object.hasOwn(DOMAINES_CMD, w?.type)))) return p;
  const n = { ...p };
  for (const k of ["gauche", "droite"]) if (Array.isArray(n[k])) n[k] = normaliserWidgets(n[k]);
  return n;
}
// meuble connecté : lié à une entité, une valeur ou une fiche ; au toucher : fiche, plus d'infos HA ou rien
const CLICS_MEUBLE = ["fiche", "infos", "aucun"];
// couleur écrite dans la config (pastilles, widgets, jauges, meubles, animations, traces, flux) : #hex, rgb() / hsl() aux valeurs
// numériques, nom de couleur CSS ou var(--…) ; rien d'autre (ni « ; », ni url(), ni expression) n'arrive jamais dans un style
const COULEUR_SURE = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|var\(--[\w-]{1,60}\)|(?:rgb|hsl)a?\(\s*-?\d{1,3}(?:\.\d+)?(?:deg|%)?(?:\s*[,\s]\s*-?\d{1,3}(?:\.\d+)?%?){2}(?:\s*[,/]\s*\d{0,3}(?:\.\d+)?%?)?\s*\))$/i;
// couleurs nommées (`palette: {nom: couleur}`) : un élément écrit le nom, la carte pose --mq-c-<nom> sur son hôte et l'élément
// suit la palette. Nom : minuscules, chiffres, « _ » et « - » ; couleur de la palette : une couleur sûre (jamais un autre nom).
const NOM_PALETTE = /^[a-z][a-z0-9_-]{0,30}$/;
const palette = (c) => (c?.palette && typeof c.palette === "object" && !Array.isArray(c.palette)
  ? Object.entries(c.palette).filter(([n, v]) => NOM_PALETTE.test(n) && typeof v === "string" && COULEUR_SURE.test(v)) : []);
// noms de palette connus (ajoutés par chaque carte à son rendu) ; la couleur vient de la variable posée sur l'hôte de CETTE carte :
// un nom inconnu d'une carte y reste sans valeur (couleur par défaut de l'élément)
const paletteActive = new Set();
// la couleur si elle est sûre (un nom de la palette devient var(--mq-c-<nom>)), sinon null
// (un nom qui est aussi une couleur CSS, « red », la garde en secours dans les cartes qui ne le définissent pas)
const couleurSure = (c) => (typeof c !== "string" ? null : paletteActive.has(c) ? `var(--mq-c-${c}${COULEUR_SURE.test(c) ? `,${c}` : ""})` : COULEUR_SURE.test(c) ? c : null);
// écrite dans la config : couleur sûre ou nom de palette (résolu au rendu par couleurSure)
const couleurEcrite = (c) => typeof c === "string" && (COULEUR_SURE.test(c) || NOM_PALETTE.test(c));
// couleur d'un meuble connecté sur le plan : la sienne, sinon celle de son type, sinon l'accent du thème
const COULEURS_TYPE = { refrigerateur: "#29b6f6", meuble_tv: "#7e57c2", bureau: "#fb8c00", tableau_elec: "#fbc02d", box: "#26a69a", chaudiere: "#ef5350", radiateur: "#ef5350",
  voiture: "#43a047", borne_recharge: "#43a047", lave_linge: "#42a5f5", lave_vaisselle: "#42a5f5", pac: "#26c6da", plaques: "#ff7043", ballon: "#ef5350" };
const couleurMeuble = (m) => couleurSure(m?.couleur) || COULEURS_TYPE[m?.type] || null;
const estConnecte = (m) => !!(m && (m.entite || m.valeur || m.fiche));
const clicMeuble = (m) => (CLICS_MEUBLE.includes(m.clic) ? m.clic : m.fiche ? "fiche" : m.entite || m.valeur ? "infos" : "aucun");
// fiches : portées par un meuble, une ouverture ou une pastille ; la sélection d'un de leurs widgets porte { meuble | ouverture | point: i }
const GENRES_FICHE = { meuble: "meubles", ouverture: "ouvertures", point: "points" };
const porteurDe = (s) => { const g = s && Object.keys(GENRES_FICHE).find((k) => s[k] != null); return g ? { genre: g, i: s[g] } : null; };
// clé de sélection → élément : « widget:<côté>:<i>[:<pièce>] », « widget:fiche:<i>:<n>[:ouverture | point] », sinon « <type>:<i> »
const deCle = (k) => { const [type, a, b, c, g] = k.split(":"); return type === "widget" ? { type, cote: a, i: +b, ...(c != null ? (a === "fiche" ? { [Object.hasOwn(GENRES_FICHE, g ?? "") ? g : "meuble"]: +c } : { piece: +c }) : {}) } : { type, i: +a }; };
// initiales d'un nom (deux au plus)
const initiales = (nom) => nom.trim().split(/[\s_]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
// suffixe des widgets d'une fiche (« fiche:1:5 » pour le meuble 5, « fiche:1:5:ouverture », « fiche:1:5:point »)
const sufFiche = (pf) => `:${pf.i}${pf.genre === "meuble" ? "" : `:${pf.genre}`}`;
// ouverture ou pastille : « fiche » si elle en a une (ou `clic` choisi) ; null = pas de réglage, le comportement d'avant
const clicPorteur = (o) => (CLICS_MEUBLE.includes(o?.clic) ? o.clic : o?.fiche ? "fiche" : null);
// ---------- animations : bibliothèque réglable par événement (`animations.<événement>`) et par élément (`animation`) ----------
const ANIMATIONS = { aucune: _tk("Aucune"), pulsation: _tk("Pulsation"), respiration: _tk("Respiration (douce)"), clignote: _tk("Clignotement"),
  halo: _tk("Halo lumineux"), onde: _tk("Onde"), defilement: _tk("Défilement (traits, volets)") };
const EVENEMENTS_ANIM = {
  ouverture: { nom: _tk("Porte ou fenêtre ouverte"), defaut: { type: "pulsation", duree: 1.6 } },
  volet: { nom: _tk("Volet en mouvement"), defaut: { type: "defilement", duree: 0.8 } },
  alerte: { nom: _tk("Pastille en alerte"), defaut: { type: "pulsation", duree: 1.2 } },
  lumiere: { nom: _tk("Lumière allumée"), defaut: { type: "aucune", duree: 2.4 } },
  appareil: { nom: _tk("Appareil actif"), defaut: { type: "aucune", duree: 2 } },
  meuble: { nom: _tk("Meuble connecté actif"), defaut: { type: "aucune", duree: 2.4 } },
};
const evenementPoint = (p) => (p.alerte ? "alerte" : (p.entite || "").startsWith("light.") ? "lumiere" : "appareil");
// réglage effectif : défaut de l'événement, puis celui du plan, puis celui de l'élément (objet ou simple nom de type)
function animDe(c, ev, o, cle = "animation") {
  const lire = (v) => (typeof v === "string" ? { type: v } : v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const a = { ...EVENEMENTS_ANIM[ev].defaut, ...lire(c.animations?.[ev]), ...lire(o?.[cle]) };
  if (!ANIMATIONS[a.type]) a.type = EVENEMENTS_ANIM[ev].defaut.type;
  return a;
}
// classe a-<type> (+ a-contour) et variables CSS : --a-d durée, --a-i intensité, --a-c couleur
const classeAnim = (a) => ` a-${a.type}${a.forme === "contour" ? " a-contour" : ""}`;
const styleAnim = (a) => {
  const d = Math.min(20, Math.max(0.2, +a.duree || 1.6)), i = Math.min(2, Math.max(0.2, +a.intensite || 1));
  return `--a-d:${d}s;--a-i:${i}${couleurSure(a.couleur) ? `;--a-c:${couleurSure(a.couleur)}` : ""}`;
};

// ---------- interaction (`interaction`), tablette murale (`tablette`), niveau d'animation (`niveau_animation`) ----------
// sans ces clés : comportement d'origine (vue de la pièce au toucher, déplacement et zoom libres, pas de retour automatique)
const CLICS_PIECE = ["vue", "infos", "aucun"], NIVEAUX_ANIM = ["complet", "reduit", "aucun"];
const objetSimple = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const interactionDe = (c) => {
  const o = objetSimple(c?.interaction) ? c.interaction : {}, s = Number.isFinite(+o.retour_apres) ? +o.retour_apres : 0;
  return { clic: CLICS_PIECE.includes(o.clic_piece) ? o.clic_piece : "vue", figee: o.vue_figee === true, retour: Math.min(86400, Math.max(0, s)) };
};
// mode tablette : `true` = { resume: false, panneaux: false, anti_marquage: true } ; un objet règle chaque point (les clés absentes gardent ces valeurs)
const tabletteDe = (c) => {
  const t = c?.tablette;
  if (t !== true && !objetSimple(t)) return null;
  const o = t === true ? {} : t;
  return { resume: o.resume === true, panneaux: o.panneaux === true, anti_marquage: o.anti_marquage !== false };
};
const niveauAnimDe = (c) => (NIVEAUX_ANIM.includes(c?.niveau_animation) ? c.niveau_animation : "complet");
// anti-marquage : la carte se décale d'un pixel toutes les 3 minutes, en serpentin sur un carré de 5 × 5 px parcouru en aller-retour
// (jamais plus de 2 px par axe, 2,8 px au plus du point de départ, jamais de saut) ; position 12 = au centre, sans décalage
const PAS_ANTI_MARQUAGE = 180000;
const decalageAntiMarquage = (n) => {
  const k = ((n % 48) + 48) % 48, j = k < 25 ? k : 48 - k, r = Math.floor(j / 5), q = j % 5;
  return [(r % 2 ? 4 - q : q) - 2, r - 2];
};
// YAML écrit à la main : booléens et nombres écrits en texte (la config d'origine n'est jamais modifiée)
function normaliserInteraction(c) {
  const bool = (v) => (typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v);
  if (objetSimple(c.interaction)) {
    const o = { ...c.interaction };
    if ("vue_figee" in o) o.vue_figee = bool(o.vue_figee);
    if ("retour_apres" in o && typeof o.retour_apres === "string" && o.retour_apres.trim() && Number.isFinite(+o.retour_apres)) o.retour_apres = +o.retour_apres;
    c.interaction = o;
  }
  if ("tablette" in c) c.tablette = bool(c.tablette);
  if (objetSimple(c.tablette)) { const o = { ...c.tablette }; for (const k of ["resume", "panneaux", "anti_marquage"]) if (k in o) o[k] = bool(o[k]); c.tablette = o; }
  return c;
}

