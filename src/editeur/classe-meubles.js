// meubles : catalogue, atelier « Créer un meuble », manipulation des formes — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- « Créer un meuble » : forme composée de primitives, taille, couleur, catégorie, connecté ----------
  // primitives d'un meuble du catalogue (« partir d'un meuble ») : son dessin SVG relu (rectangles, cercles, ellipses, traits,
  // courbes approchées par des points), coordonnées ramenées en % de sa taille
  _formeDepuisCatalogue(type) {
    const def = MEUBLES()[type];
    if (!def) return null;
    const [w, h] = def.taille, svg = this.carte.constructor.dessinMeuble({ type, pos: [0, 0], taille: def.taille, chaises: def.chaises });
    const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, "image/svg+xml"), out = [];
    const P = (x, y) => [arr(((x + w / 2) / w) * 100), arr(((y + h / 2) / h) * 100)];
    const style = (el) => (el.classList.contains("tirets") ? "tirets" : el.classList.contains("vide") || el.classList.contains("ligne") ? "vide" : null);
    const mat = (el) => { let m = new DOMMatrix(); for (let n = el.parentNode; n && n.nodeType === 1 && !n.classList?.contains("meuble"); n = n.parentNode) { const t = n.transform?.baseVal?.consolidate?.(); if (t) m = DOMMatrix.fromMatrix(t.matrix).multiply(m); } return m; };
    const pt = (m, x, y) => { const q = m.transformPoint(new DOMPoint(x, y)); return P(q.x, q.y); };
    const poser = (p, el) => { const st = style(el); if (st && p.genre !== "trait") p.style = st; if (p.genre === "trait" && el.classList.contains("tirets")) p.style = "tirets"; out.push(p); };
    for (const el of doc.querySelectorAll("rect,circle,ellipse,path")) {
      const m = mat(el), n = (k) => +el.getAttribute(k) || 0, tourne = Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6;
      if (el.tagName === "rect" && !tourne) {
        const [x0, y0] = pt(m, n("x"), n("y")), [x1, y1] = pt(m, n("x") + n("width"), n("y") + n("height")), r = n("rx");
        poser({ genre: r > 2 ? "arrondi" : "rect", x: Math.min(x0, x1), y: Math.min(y0, y1), l: arr(Math.abs(x1 - x0)), h: arr(Math.abs(y1 - y0)), ...(r > 2 ? { rayon: r } : {}) }, el);
      } else if (el.tagName === "rect") {
        const x = n("x"), y = n("y"), W = n("width"), H = n("height");
        poser({ genre: "polygone", points: [[x, y], [x + W, y], [x + W, y + H], [x, y + H]].map(([a, b]) => pt(m, a, b)) }, el);
      } else if (el.tagName === "circle" || el.tagName === "ellipse") {
        const cx = n("cx"), cy = n("cy"), rx = el.tagName === "circle" ? n("r") : n("rx"), ry = el.tagName === "circle" ? n("r") : n("ry"), [x0, y0] = pt(m, cx - rx, cy - ry), [x1, y1] = pt(m, cx + rx, cy + ry);
        poser({ genre: "ellipse", x: Math.min(x0, x1), y: Math.min(y0, y1), l: arr(Math.abs(x1 - x0)), h: arr(Math.abs(y1 - y0)) }, el);
      } else {
        // chemin : M, L, H, V, Q (courbe approchée), Z ; un Z ferme en polygone, sinon trait (un par sous-chemin)
        const jet = (el.getAttribute("d") || "").match(/[MLHVQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
        let i = 0, sous = [], x = 0, y = 0, cmd = "M";
        const fin = (ferme) => { if (sous.length >= (ferme ? 3 : 2)) poser({ genre: ferme ? "polygone" : "trait", points: sous.map(([a, b]) => pt(m, a, b)) }, el); sous = []; };
        while (i < jet.length) {
          if (/^[MLHVQZ]$/i.test(jet[i])) { cmd = jet[i++].toUpperCase(); if (cmd === "Z") { fin(true); continue; } }
          const v = () => +jet[i++];
          if (cmd === "M") { if (sous.length) fin(false); x = v(); y = v(); sous.push([x, y]); cmd = "L"; }
          else if (cmd === "L") { x = v(); y = v(); sous.push([x, y]); }
          else if (cmd === "H") { x = v(); sous.push([x, y]); }
          else if (cmd === "V") { y = v(); sous.push([x, y]); }
          else if (cmd === "Q") { const qx = v(), qy = v(), ex = v(), ey = v(); for (const k of [0.25, 0.5, 0.75, 1]) sous.push([(1 - k) ** 2 * x + 2 * (1 - k) * k * qx + k * k * ex, (1 - k) ** 2 * y + 2 * (1 - k) * k * qy + k * k * ey]); x = ex; y = ey; }
          else i++;
        }
        if (sous.length) fin(false);
      }
    }
    return { taille: [w, h], forme: this.carte.constructor.normaliserForme(out) };
  }
  _typesMeuble() {
    const C = this.carte.constructor, ML = MEUBLES(), mini = (o) => `<svg class="ed-apercu" viewBox="${-Math.max(...o.taille) * 0.62 - 20} ${-Math.max(...o.taille) * 0.62 - 20} ${Math.max(...o.taille) * 1.24 + 40} ${Math.max(...o.taille) * 1.24 + 40}" aria-hidden="true">${C.dessinMeuble({ type: "forme", pos: [0, 0], ...o })}</svg>`;
    const base = FORMES_DEPART().map((f) => ({ id: f.id, nom: f.nom, groupe: _t("Formes de base"), svg: mini(f), objet: { type: "forme", taille: f.taille, forme: clone(f.forme) } }));
    const cat = Object.entries(ML).filter(([t]) => t !== "espace").map(([t, x]) => ({ id: `m:${t}`, nom: _t(x.nom), desc: `${x.taille[0]} × ${x.taille[1]} cm`, groupe: _t("Partir d'un meuble du catalogue"),
      svg: `<svg class="ed-apercu" viewBox="${-Math.max(...x.taille) * 0.62 - 20} ${-Math.max(...x.taille) * 0.62 - 20} ${Math.max(...x.taille) * 1.24 + 40} ${Math.max(...x.taille) * 1.24 + 40}" aria-hidden="true">${C.dessinMeuble({ type: t, pos: [0, 0], taille: x.taille, chaises: x.chaises })}</svg>`,
      catalogue: t }));
    return [...base, ...cat];
  }
  // catégorie proposée pour un meuble du catalogue (sa catégorie), sinon « Formes et espaces »
  _catMeuble(type) { const C = this.carte.constructor, c = MEUBLES()[type]?.cat; return Object.entries(C.CATS_MEUBLES).find(([, n]) => n === c)?.[0] || "formes"; }
  _specMeuble(extra) {
    const borner = (v) => tailleMeuble(Math.round(+v)), M = this._manipFormes();
    return {
      reglages: (o) => this._reglagesMeuble(o), apercu: (o) => this._apercuMeuble(o),
      // aperçu manipulable : sélection, glisser, poignées, sommets, aimantation, clavier, historique propre à l'atelier
      classe: "ed-at-mb", apercuTete: () => M.tete(), apercuPied: () => M.pied(), monter: (v, api) => M.monter(v, api), apresRendu: (v) => M.apresRendu(v), touche: (ev) => M.touche(ev),
      // un meuble du catalogue devient une forme (ses primitives) avec son nom et sa catégorie
      fusion: (t, o) => {
        if (t.catalogue) { const f = this._formeDepuisCatalogue(t.catalogue); return { ...(o?.entite ? { entite: o.entite } : {}), type: "forme", nom: t.nom, taille: f.taille, forme: f.forme, _cat: this._catMeuble(t.catalogue) }; }
        return { ...(o?.entite ? { entite: o.entite } : {}), ...clone(t.objet), _cat: o?._cat || "formes" };
      },
      // champs en cm (taille, primitives) : convertis en % de la taille ; points d'un trait ou d'un polygone « x,y x,y … »
      ecrire: (o, k, v) => {
        const [w, h] = o.taille, m = /^_p\.(\d+)\.(x|y|l|h|rayon|pts)$/.exec(k), g = /^forme\.(\d+)\.genre$/.exec(k);
        if (/^taille\.[01]$/.test(k)) { o.taille[+k.slice(-1)] = borner(v); return true; }
        if (g) { const p = o.forme[+g[1]]; if (p && PRIMITIVES[v]) M.changerGenre(p, v); return true; }
        if (!m) return false;
        const p = o.forme[+m[1]];
        if (!p) return true;
        if (m[2] === "rayon") p.rayon = Math.max(0, Math.min(500, +v || 0));
        else if (m[2] === "pts") {
          const l = String(v).split(/[\s;]+/).map((x) => x.split(",").map(Number)).filter((q) => q.length === 2 && q.every(Number.isFinite));
          if (l.length >= (p.genre === "trait" ? 2 : 3)) p.points = l.slice(0, 24).map(([x, y]) => [pc((x / w) * 100), pc((y / h) * 100)]);
        } else p[m[2]] = pc((+v || 0) / (m[2] === "x" || m[2] === "l" ? w : h) * 100);
        return true;
      },
      action: (a, o) => {
        const [k, v] = a.split(":");
        if (k === "couleur") { if (v) o.couleur = v; else delete o.couleur; }
        if (k === "prim" && PRIM_DEFAUT[v] && o.forme.length < 40) o.forme.push(clone(PRIM_DEFAUT[v]));
        if (k === "retirer-prim") o.forme.splice(+v, 1);
        if (k === "monter-prim" && +v > 0) [o.forme[+v - 1], o.forme[+v]] = [o.forme[+v], o.forme[+v - 1]];
        return M.action(k, v, o); // sélection suivie (ajout, retrait, ordre), sommet retiré, aimant, agrandir ; historique
      },
      apresEntite: (o) => { o._connecte = true; },
      ...extra,
    };
  }
  // objet de meuble prêt à poser : couleur validée, forme bornée, clés internes retirées ; rend aussi la catégorie et les mots
  _sortirMeuble(o) {
    const C = this.carte.constructor, m = clone(o), cat = m._cat, mots = (m._mots || "").trim();
    for (const k of ["_cat", "_mots", "_connecte"]) delete m[k];
    if (!o._connecte) for (const k of ["entite", "valeur", "actif", "fiche"]) delete m[k];
    if (m.couleur && !C.couleurEcrite(m.couleur)) delete m.couleur;
    m.forme = C.normaliserForme(m.forme);
    m.taille = m.taille.map((v) => tailleMeuble(Math.round(+v)));
    for (const k of Object.keys(m)) if (m[k] === "" || m[k] == null) delete m[k];
    return { m, cat, mots };
  }
  creerMeuble(opt = {}) {
    const types = this._typesMeuble();
    this.ouvrirAtelier(this._specMeuble({
      titre: _t("Créer un meuble"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      valider: ({ o, modele, demander }) => {
        opt.apres?.();
        const { m, cat, mots } = this._sortirMeuble(o);
        if (o.couleur && !m.couleur) this.snack(_t("Couleur ignorée : #rrggbb ou un nom de couleur."));
        if (modele) this.commit(() => (this.d.modeles ||= []).push(this._modeleMeuble(m, cat, mots, demander)));
        this.utiliserModele({ genre: "meuble", type: "forme", nom: m.nom || _t("Meuble"), objet: m }, null);
      },
    }));
  }
  _modeleMeuble(m, cat, mots, demander) {
    const objet = clone(m), dem = demander && objet.entite ? ["entite"] : [], domaine = objet.entite?.split(".")[0];
    if (dem.length) delete objet.entite;
    return { id: idModele(), nom: m.nom || _t("Meuble"), genre: "meuble", type: "forme", desc: `${m.taille[0]} × ${m.taille[1]} cm`, ...(cat ? { cat } : {}), ...(mots ? { mots } : {}),
      ...(dem.length ? { demander: dem, ...(domaine ? { domaine } : {}) } : {}), objet };
  }
  // meuble personnalisé posé (i : numéro du meuble) ou modèle de « Mes modèles » (u : numéro du modèle) : rouvert dans l'atelier
  modifierMeuble({ i = null, u = null, retour = null, dessous = null, apres = null } = {}) {
    const mod = u != null ? this.d.modeles?.[u] : null, cur = i != null ? this.d.meubles?.[i] : mod?.objet;
    if (!cur) return;
    const def = MEUBLES()[cur.type], depart = cur.type === "forme" ? clone(cur) : { ...clone(cur), type: "forme", ...this._formeDepuisCatalogue(cur.type), nom: cur.nom || (def ? _t(def.nom) : "") };
    depart.taille ||= [60, 60]; depart.forme ||= [clone(PRIM_DEFAUT.rect)];
    this.ouvrirAtelier(this._specMeuble({
      titre: mod ? _t("Modifier le modèle") : _t("Modifier le meuble"), types: this._typesMeuble(), libelleOk: _t("Appliquer"), retour, dessous,
      initial: { ...depart, _cat: mod?.cat || (cur.type === "forme" ? "formes" : this._catMeuble(cur.type)), _mots: mod?.mots || "", _connecte: !!(cur.entite || cur.valeur || cur.fiche || mod?.demander?.length) },
      valider: ({ o }) => {
        apres?.();
        const { m, cat, mots } = this._sortirMeuble(o);
        if (mod) {
          // modèle : l'entité reste « à demander » s'il l'était ; décoché « Connecté », plus rien à demander
          const objet = clone(m);
          if (!o._connecte) { delete mod.demander; delete mod.domaine; } else if (mod.demander?.includes("entite")) delete objet.entite;
          this.commit(() => { Object.assign(mod, { nom: m.nom || mod.nom, type: "forme", desc: `${m.taille[0]} × ${m.taille[1]} cm`, objet }); if (cat) mod.cat = cat; else delete mod.cat; if (mots) mod.mots = mots; else delete mod.mots; });
          return this.snack(_t("Modèle modifié."));
        }
        // meuble posé : remplacé par sa nouvelle définition (position, angle, calque et fiche gardés)
        delete m.chaises;
        this.commit(() => { this.d.meubles[i] = m; this.sel = { type: "meuble", i }; });
        this.snack(_t("Meuble modifié."));
      },
    }));
  }
  _reglagesMeuble(o) {
    const af = this._aFaire; this._aFaire = null;
    try { return this._reglagesMb(o); } finally { this._aFaire = af; }
  }
  _reglagesMb(o) {
    const C = this.carte.constructor, [w, h] = o.taille, cm = (v, t) => arr((v * t) / 100);
    const N = (label, k, v, pas = 1) => `<div class="ed-champ"><label>${esc(label)}</label><input type="number" step="${pas}" data-k="${k}" data-num="1" value="${esc(v ?? "")}"${k.startsWith("taille") ? ` min="5" max="${MAX_TAILLE_MEUBLE}" data-rendre` : ""}></div>`;
    const prim = (p, j) => `<div class="ed-prim" data-prim="${j}"><div class="ed-prim-tete"><ha-icon icon="${{ rect: "mdi:rectangle-outline", arrondi: "mdi:rectangle-outline", ellipse: "mdi:circle-outline", trait: "mdi:vector-line", polygone: "mdi:vector-polygon" }[p.genre]}"></ha-icon>
        <select data-k="forme.${j}.genre" data-rendre aria-label="${_t("Primitive")}">${Object.entries(PRIMITIVES).map(([g, n]) => `<option value="${esc(g)}" ${p.genre === g ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        <select data-k="forme.${j}.style" aria-label="${_t("Style")}">${STYLES_PRIM.map(([v, n]) => `<option value="${esc(v === "plein" ? "" : v)}" ${(p.style || "plein") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        ${p.genre === "polygone" ? `<button type="button" class="ib" data-at="retirer-som:${j}" disabled title="${_t("Retirer le sommet choisi")}" aria-label="${_t("Retirer le sommet choisi")}"><ha-icon icon="mdi:vector-polyline-minus"></ha-icon></button>` : ""}
        ${j ? `<button type="button" class="ib" data-at="monter-prim:${j}" title="${_t("Monter")}" aria-label="${_t("Monter")}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>` : ""}<button type="button" class="ib" data-at="retirer-prim:${j}" title="${_t("Retirer")}" aria-label="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${p.points ? `<div class="ed-champ"><label>${_t("Points (x,y en cm)")}</label><input type="text" data-k="_p.${j}.pts" value="${esc(p.points.map(([x, y]) => `${cm(x, w)},${cm(y, h)}`).join(" "))}"></div>`
        : `<div class="ed-ligne quatre">${N("x", `_p.${j}.x`, cm(p.x, w))}${N("y", `_p.${j}.y`, cm(p.y, h))}${N(_t("Larg."), `_p.${j}.l`, cm(p.l, w))}${N(_t("Prof."), `_p.${j}.h`, cm(p.h, h))}</div>${p.genre === "arrondi" ? N(_t("Rayon (cm)"), `_p.${j}.rayon`, p.rayon ?? 8) : ""}`}</div>`;
    const coul = (o.couleur || "").toLowerCase();
    return `${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Banc"))}
      <div class="ed-ligne">${N(_t("Largeur (cm)"), "taille.0", w)}${N(_t("Profondeur (cm)"), "taille.1", h)}</div>
      <div class="ed-ligne"><div class="ed-champ"><label>${_t("Catégorie")}</label><select data-k="_cat">${Object.entries(C.CATS_MEUBLES).map(([k, n]) => `<option value="${esc(k)}" ${o._cat === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>
        ${this._champTexte(_t("Mots de recherche"), "_mots", o._mots, _t("ex. banc assise"))}</div>
      <div class="ed-champ"><label>${_t("Couleur")}</label><div class="ed-couleurs"><button type="button" data-at="couleur:" class="${coul ? "" : "on"} aucune" title="${_t("Aucune")}" aria-label="${_t("Aucune")}"></button>${this._pastilles(o.couleur, (c) => `data-at="couleur:${c}"`, (n) => `data-at="couleur:${esc(n)}"`)}</div></div>
      <h4 class="ed-at-titre">${_t("Forme")}${bulleI(`${_t("Primitives dessinées dans l'ordre, la dernière au-dessus ; positions depuis le coin haut gauche, en cm.")} ${tactile() ? _t("Dans l'aperçu : glisser pour déplacer, poignées pour redimensionner, appui long sur un sommet pour le retirer.") : _t("Dans l'aperçu : glisser pour déplacer, poignées pour redimensionner (Maj : proportions, Alt : sans aimant), flèches 1 cm (Maj : 10 cm), Suppr pour retirer.")}`)}</h4>
      ${o.forme.map(prim).join("")}
      <div class="ed-prim-ajout">${Object.entries(PRIMITIVES).map(([g, n]) => `<button type="button" class="ed-btn contour" data-at="prim:${g}"><ha-icon icon="mdi:plus"></ha-icon>${esc(_t(n))}</button>`).join("")}</div>
      <label class="ed-inter"><span>${_t("Connecté")}${bulleI(_t("Relié à une entité : teinté quand il est actif, fiche au toucher."))}</span><input type="checkbox" data-k="_connecte" data-rendre ${o._connecte ? "checked" : ""}></label>
      ${o._connecte ? this._champEntite(_t("Entité"), "entite", o.entite, true) : ""}`;
  }
  // aperçu à l'échelle : le meuble, une règle (50 cm ou 1 m) et ses dimensions
  _apercuMeuble(o) {
    // marge réduite : le meuble occupe l'essentiel de l'aperçu (manipulation), la règle et les cotes restent lisibles
    const C = this.carte.constructor, [w, h] = o.taille.map(tailleMeuble), c = Math.max(w, h) * 0.56 + 26;
    const regle = Math.max(w, h) > 150 ? 100 : 50, y = c - 14, x0 = -c + 10;
    const coul = C.couleurSure(o.couleur) ? o.couleur : null;
    return `<svg class="ed-ap-meuble" viewBox="${-c} ${-c} ${2 * c} ${2 * c}" tabindex="0" data-foc="ap" role="application" aria-label="${esc(_t("Aperçu des formes : glisser pour déplacer, flèches 1 cm, Suppr pour retirer"))}">
      ${C.dessinMeuble({ type: "forme", pos: [0, 0], taille: [w, h], forme: o.forme, couleur: coul })}
      <path class="ed-ap-cote" d="M${x0} ${y - 5}V${y + 5}M${x0 + regle} ${y - 5}V${y + 5}M${x0} ${y}H${x0 + regle}"/>
      <text class="ed-ap-cote-t" x="${x0 + regle + 6}" y="${y + 4}" style="font-size:${(c / 12).toFixed(1)}px">${regle === 100 ? "1 m" : "50 cm"}</text>
      <text class="ed-ap-cote-t" x="0" y="${-c + c / 9}" text-anchor="middle" style="font-size:${(c / 12).toFixed(1)}px">${fmt(w, 0)} × ${fmt(h, 0)} cm</text></svg>`;
  }

  // ---------- atelier des meubles : manipulation directe des formes dans l'aperçu ----------
  // Clic ou toucher sur une forme : sélection (cadre, poignées, sa ligne surlignée dans la liste ; l'inverse aussi) ; dans le vide :
  // désélection. Glisser : déplacer ; 8 poignées : redimensionner (Maj : proportions) ; trait et polygone : sommets glissés, « + » au
  // milieu d'une arête = nouveau sommet, appui long, Suppr ou bouton de la ligne = sommet retiré (3 au moins pour un polygone).
  // Aimantation : grille de 5 cm, bords et centres du meuble et des autres formes (guides affichés), coupée par Alt ou le bouton ;
  // les formes restent dans le cadre du meuble. Clavier : flèches 1 cm (Maj : 10 cm), Suppr, Échap ; Ctrl+Z / Ctrl+Y : historique
  // propre à l'atelier (celui de l'éditeur n'est pas touché). Stockage inchangé (en % de la taille) ; les champs en cm suivent.
  _manipFormes() {
    const ed = this, GRILLE = 5, SEUIL = 8, MIN = 1; // cm, px (aimant), cm (plus petite forme)
    const M = { sel: null, som: null, aimant: true, grand: false, hist: [], pos: -1, ref: null, g: null, guides: [], voile: null, api: null, raf: 0 };
    const o = () => M.api?.objet();
    const dims = (ob) => ob.taille.map(tailleMeuble);
    const aPoints = (p) => p.genre === "trait" || p.genre === "polygone";
    const minPts = (p) => (p.genre === "trait" ? 2 : 3);
    const valide = (p) => !!p && (aPoints(p) ? Array.isArray(p.points) && p.points.length >= minPts(p) : [p.x, p.y, p.l, p.h].every((v) => v !== "" && Number.isFinite(+v)));
    // boîte d'une forme en cm (depuis le coin haut gauche du meuble)
    const boite = (p, w, h) => {
      if (aPoints(p)) { const xs = p.points.map((q) => (q[0] * w) / 100), ys = p.points.map((q) => (q[1] * h) / 100); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; }
      return { x0: (p.x * w) / 100, y0: (p.y * h) / 100, x1: ((+p.x + +p.l) * w) / 100, y1: ((+p.y + +p.h) * h) / 100 };
    };
    // repères d'aimantation sur un axe (0 : x, 1 : y) : bords et centre du meuble, des autres formes (et leurs sommets), des autres
    // sommets de la forme
    const reperes = (axe, j, w, h, i = null) => {
      const L = axe ? h : w, t = [0, L / 2, L], ob = o();
      ob.forme.forEach((q, n) => {
        if (n === j || !valide(q)) return;
        const b = boite(q, w, h), a0 = axe ? b.y0 : b.x0, a1 = axe ? b.y1 : b.x1;
        t.push(a0, (a0 + a1) / 2, a1);
        if (aPoints(q)) for (const pt of q.points) t.push((pt[axe] * L) / 100);
      });
      if (i != null) ob.forme[j].points.forEach((q, n) => { if (n !== i) t.push((q[axe] * L) / 100); });
      return t;
    };
    // décalage aimanté : le repère le plus proche sous le seuil, sinon la grille (sur la première valeur)
    const aimanter = (vals, rep, seuil) => {
      let best = null;
      for (const v of vals) for (const c of rep) { const d = c - v; if (Math.abs(d) <= seuil && (best === null || Math.abs(d) < Math.abs(best))) best = d; }
      return best ?? Math.round(vals[0] / GRILLE) * GRILLE - vals[0];
    };
    // guides : repères atteints après le déplacement
    const guides = (vals, rep, axe) => [...new Set(rep.filter((c) => vals.some((v) => Math.abs(v - c) < 0.05)).map((c) => +c.toFixed(2)))].map((v) => [axe, v]);
    // g : { mode: corps | poignee | sommet, j (forme), i (sommet), ph (poignée), p0 (forme au départ), b0 (sa boîte en cm), w, h (taille), k (cm par px) }
    const appliquer = (g, dx, dy, aim, prop) => {
      const p = o().forme[g.j];
      if (!p) return;
      const { w, h, b0, p0 } = g, seuil = SEUIL * g.k;
      M.guides = [];
      if (g.mode === "corps") {
        if (aim) {
          dx += aimanter([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), seuil);
          dy += aimanter([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), seuil);
        }
        dx = borne(dx, Math.min(0, -b0.x0), Math.max(0, w - b0.x1)); dy = borne(dy, Math.min(0, -b0.y0), Math.max(0, h - b0.y1));
        if (aPoints(p0)) p.points = p0.points.map(([a, b]) => [pc(a + (dx / w) * 100), pc(b + (dy / h) * 100)]);
        else { p.x = pc(+p0.x + (dx / w) * 100); p.y = pc(+p0.y + (dy / h) * 100); }
        if (aim) M.guides = [...guides([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), 0), ...guides([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), 1)];
      } else if (g.mode === "sommet") {
        const a = (p0.points[g.i][0] * w) / 100, b = (p0.points[g.i][1] * h) / 100;
        let x = a + dx, y = b + dy;
        if (aim) { x += aimanter([x], reperes(0, g.j, w, h, g.i), seuil); y += aimanter([y], reperes(1, g.j, w, h, g.i), seuil); }
        x = borne(x, Math.min(0, a), Math.max(w, a)); y = borne(y, Math.min(0, b), Math.max(h, b));
        p.points = p0.points.map((q) => [...q]); p.points[g.i] = [pc((x / w) * 100), pc((y / h) * 100)];
        if (aim) M.guides = [...guides([x], reperes(0, g.j, w, h, g.i), 0), ...guides([y], reperes(1, g.j, w, h, g.i), 1)];
      } else if (g.mode === "poignee") {
        const fx = g.ph.includes("w") ? "x0" : g.ph.includes("e") ? "x1" : null, fy = g.ph.includes("n") ? "y0" : g.ph.includes("s") ? "y1" : null;
        const lim = { x0: Math.min(0, b0.x0), x1: Math.max(w, b0.x1), y0: Math.min(0, b0.y0), y1: Math.max(h, b0.y1) };
        let b = { ...b0 };
        if (prop) {
          // proportions gardées : mise à l'échelle depuis le coin (ou le côté) opposé, bornée au cadre et à la taille minimale
          const W0 = b0.x1 - b0.x0 || 1, H0 = b0.y1 - b0.y0 || 1;
          const ax = fx === "x0" ? b0.x1 : fx === "x1" ? b0.x0 : (b0.x0 + b0.x1) / 2, ay = fy === "y0" ? b0.y1 : fy === "y1" ? b0.y0 : (b0.y0 + b0.y1) / 2;
          const sx = fx ? (W0 + (fx === "x1" ? dx : -dx)) / W0 : null, sy = fy ? (H0 + (fy === "y1" ? dy : -dy)) / H0 : null;
          let s = sx != null && sy != null ? (Math.abs(sx - 1) >= Math.abs(sy - 1) ? sx : sy) : sx ?? sy;
          s = Math.max(s, MIN / W0, MIN / H0);
          for (const [e0, a, lo, hi] of [[b0.x0, ax, lim.x0, lim.x1], [b0.x1, ax, lim.x0, lim.x1], [b0.y0, ay, lim.y0, lim.y1], [b0.y1, ay, lim.y0, lim.y1]]) {
            if (e0 > a + 1e-9) s = Math.min(s, (hi - a) / (e0 - a)); else if (e0 < a - 1e-9) s = Math.min(s, (a - lo) / (a - e0));
          }
          b = { x0: ax + s * (b0.x0 - ax), x1: ax + s * (b0.x1 - ax), y0: ay + s * (b0.y0 - ay), y1: ay + s * (b0.y1 - ay) };
        } else {
          for (const [f, d, axe] of [[fx, dx, 0], [fy, dy, 1]]) {
            if (!f) continue;
            const autre = { x0: "x1", x1: "x0", y0: "y1", y1: "y0" }[f];
            let v = b0[f] + d;
            if (aim) v += aimanter([v], reperes(axe, g.j, w, h), seuil);
            if (f.endsWith("0")) { const hi = b0[autre] - MIN; b[f] = borne(v, Math.min(lim[f], hi), hi); } else { const lo = b0[autre] + MIN; b[f] = borne(v, lo, Math.max(lim[f], lo)); }
            if (aim) M.guides.push(...guides([b[f]], reperes(axe, g.j, w, h), axe));
          }
        }
        p.x = pc((b.x0 / w) * 100); p.y = pc((b.y0 / h) * 100); p.l = pc(((b.x1 - b.x0) / w) * 100); p.h = pc(((b.y1 - b.y0) / h) * 100);
      }
    };
    const ajouterSommet = (j, a) => {
      const p = o().forme[j];
      if (!p?.points || p.points.length >= 24) return null;
      const n = p.points.length, q1 = p.points[a], q2 = p.points[(a + 1) % n];
      p.points.splice(a + 1, 0, [pc((q1[0] + q2[0]) / 2), pc((q1[1] + q2[1]) / 2)]);
      return a + 1;
    };
    const retirerSommet = (j, i) => {
      const p = o().forme[j];
      if (!p?.points || i == null || !p.points[i] || p.points.length <= minPts(p)) return false;
      p.points.splice(i, 1); M.som = null;
      return true;
    };
    // historique de l'atelier : un état par modification (glisser, touche, champ, bouton) ; nouvel objet (autre type) = historique neuf
    const noter = () => {
      const ob = o();
      if (!ob) return;
      const s = JSON.stringify(ob);
      if (M.ref !== ob) { M.ref = ob; M.hist = [s]; M.pos = 0; return; }
      if (M.hist[M.pos] === s) return;
      M.hist = M.hist.slice(0, M.pos + 1); M.hist.push(s);
      if (M.hist.length > 100) M.hist.shift();
      M.pos = M.hist.length - 1;
    };
    const foc = () => { const f = ed.R.activeElement; return f?.dataset?.foc ? `[data-foc="${f.dataset.foc}"]` : f?.dataset?.k ? `[data-k="${f.dataset.k}"]` : null; };
    const aller = (pas) => {
      noter();
      const n = M.pos + pas;
      if (n < 0 || n >= M.hist.length) return;
      const f = foc(), ob = JSON.parse(M.hist[n]);
      M.pos = n; M.ref = ob; M.som = null;
      if (M.sel != null && !valide(ob.forme?.[M.sel])) M.sel = null;
      M.api.remplacer(ob, f);
      if (!M.voile.contains(ed.R.activeElement)) M.voile.querySelector('[data-foc="ap"]')?.focus();
    };
    // ligne de la forme choisie surlignée (et montrée) ; bouton « Retirer le sommet » actif si un sommet est choisi
    const lignes = (voir) => {
      const v = M.voile, ob = o();
      if (!v || !ob) return;
      v.querySelectorAll(".ed-prim[data-prim]").forEach((r) => {
        const on = +r.dataset.prim === M.sel;
        r.classList.toggle("sel", on);
        if (on) { r.setAttribute("aria-current", "true"); if (voir) r.scrollIntoView({ block: "nearest" }); } else r.removeAttribute("aria-current");
      });
      v.querySelectorAll('[data-at^="retirer-som:"]').forEach((b) => { const j = +b.dataset.at.split(":")[1]; b.disabled = !(j === M.sel && M.som != null && ob.forme[j]?.points?.length > 3); });
    };
    // champs en cm de la forme j, mis à jour en direct (sauf celui où l'on écrit)
    const champs = (j) => {
      const ob = o(), p = ob?.forme[j], v = M.voile;
      if (!p || !v) return;
      const [w, h] = ob.taille, cm = (x, t) => arr((x * t) / 100);
      const mettre = (k, val) => { const i = v.querySelector(`.ed-at-form [data-k="${k}"]`); if (i && ed.R.activeElement !== i) i.value = val; };
      if (aPoints(p)) mettre(`_p.${j}.pts`, p.points.map(([x, y]) => `${cm(x, w)},${cm(y, h)}`).join(" "));
      else { mettre(`_p.${j}.x`, cm(p.x, w)); mettre(`_p.${j}.y`, cm(p.y, h)); mettre(`_p.${j}.l`, cm(p.l, w)); mettre(`_p.${j}.h`, cm(p.h, h)); }
    };
    const choisir = (j, voir = true) => { if (j === M.sel) return; M.sel = j; M.som = null; lignes(voir); };
    const redessiner = () => { cancelAnimationFrame(M.raf); M.raf = 0; M.api?.maj(); };
    const planifier = () => { if (!M.raf) M.raf = requestAnimationFrame(() => { M.raf = 0; M.api?.maj(); }); };
    const COINS = { nw: _tk("coin haut gauche"), n: _tk("bord haut"), ne: _tk("coin haut droit"), e: _tk("bord droit"), se: _tk("coin bas droit"), s: _tk("bord bas"), sw: _tk("coin bas gauche"), w: _tk("bord gauche") };
    const CURSEURS = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" };
    // calque de manipulation, dans le repère de l'aperçu (cm, centre du meuble en 0,0) ; tailles des poignées en px écran
    const dessinUI = (svg) => {
      const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM(), k = m?.a ? 1 / m.a : svg.viewBox.baseVal.width / 320;
      const X = (v) => +(v - w / 2).toFixed(2), Y = (v) => +(v - h / 2).toFixed(2), f = (v) => +v.toFixed(2);
      const geo = (p, extra) => {
        const b = boite(p, w, h);
        if (aPoints(p)) return `<path d="M${p.points.map(([x, y]) => `${X((x * w) / 100)} ${Y((y * h) / 100)}`).join("L")}${p.genre === "polygone" ? "Z" : ""}"${extra}/>`;
        if (p.genre === "ellipse") return `<ellipse cx="${X((b.x0 + b.x1) / 2)}" cy="${Y((b.y0 + b.y1) / 2)}" rx="${f(Math.abs(b.x1 - b.x0) / 2)}" ry="${f(Math.abs(b.y1 - b.y0) / 2)}"${extra}/>`;
        return `<rect x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(Math.max(0, b.x1 - b.x0))}" height="${f(Math.max(0, b.y1 - b.y0))}"${extra}/>`;
      };
      // cibles : toute la forme, ou son trait seulement (trait, contour) pour laisser atteindre les formes dessous ; 24 px au moins
      const cibles = ob.forme.map((p, j) => {
        if (!valide(p)) return "";
        const trait = p.genre === "trait" || p.style === "vide";
        return geo(p, ` class="cible" data-p="${j}" pointer-events="${trait ? "stroke" : "all"}" stroke-width="${f(24 * k)}"`);
      }).join("");
      const gd = M.guides.map(([axe, v]) => `<path class="guide" d="${axe ? `M${X(-8 * k)} ${Y(v)}H${X(w + 8 * k)}` : `M${X(v)} ${Y(-8 * k)}V${Y(h + 8 * k)}`}"/>`).join("");
      const poignee = (attrs, x, y, label, cl, curseur) => `<g class="${cl}" ${attrs} tabindex="0" role="button" aria-label="${esc(label)}" transform="translate(${X(x)} ${Y(y)})"${curseur ? ` style="cursor:${curseur}"` : ""}><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(6 * k)}"/></g>`;
      let sel = "";
      const p = M.sel != null ? ob.forme[M.sel] : null;
      if (valide(p)) {
        const b = boite(p, w, h), lw = (b.x1 - b.x0) / k, lh = (b.y1 - b.y0) / k;
        sel += `<rect class="cadre" x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(b.x1 - b.x0)}" height="${f(b.y1 - b.y0)}"/>`;
        if (!aPoints(p)) {
          const xm = (b.x0 + b.x1) / 2, ym = (b.y0 + b.y1) / 2;
          // poignées des côtés seulement si le côté laisse la place (sinon elles couvriraient la forme)
          sel += [["nw", b.x0, b.y0], ["n", xm, b.y0], ["ne", b.x1, b.y0], ["e", b.x1, ym], ["se", b.x1, b.y1], ["s", xm, b.y1], ["sw", b.x0, b.y1], ["w", b.x0, ym]]
            .filter(([id]) => id.length === 2 || (id === "n" || id === "s" ? lw >= 56 : lh >= 56))
            .map(([id, x, y]) => poignee(`data-h="${id}" data-foc="h-${id}"`, x, y, _t("Redimensionner : {c}", { c: _t(COINS[id]) }), "ed-ap-h", CURSEURS[id])).join("");
        } else {
          const n = p.points.length, P = p.points.map(([x, y]) => [(x * w) / 100, (y * h) / 100]);
          if (p.genre === "polygone" && n < 24) sel += P.map((q, i) => {
            const r = P[(i + 1) % n];
            return Math.hypot(r[0] - q[0], r[1] - q[1]) / k < 56 ? "" : `<g class="ed-ap-plus" data-plus="${i}" data-foc="p-${i}" tabindex="0" role="button" aria-label="${esc(_t("Ajouter un sommet"))}" transform="translate(${X((q[0] + r[0]) / 2)} ${Y((q[1] + r[1]) / 2)})"><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(7 * k)}"/><path d="M${f(-3.5 * k)} 0H${f(3.5 * k)}M0 ${f(-3.5 * k)}V${f(3.5 * k)}"/></g>`;
          }).join("");
          sel += P.map(([x, y], i) => poignee(`data-som="${i}" data-foc="s-${i}"`, x, y, _t("Sommet {n}", { n: i + 1 }), `ed-ap-h${M.som === i ? " on" : ""}`, "move")).join("");
        }
      }
      return `<g class="ed-ap-ui"><rect class="limite" x="${X(0)}" y="${Y(0)}" width="${f(w)}" height="${f(h)}"/><g class="cibles">${cibles}</g>${gd}${sel}</g>`;
    };
    const versCm = (g, ev) => { const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(g.inv); return [q.x + g.w / 2, q.y + g.h / 2]; };
    return {
      tete: () => `<div class="ed-at-outils">
        <button type="button" class="ib${M.aimant ? " on" : ""}" data-at="aimant" aria-pressed="${M.aimant}" title="${tactile() ? _t("Aimanter") : _t("Aimanter (Alt : couper)")}" aria-label="${_t("Aimanter")}"><ha-icon icon="${M.aimant ? "mdi:magnet-on" : "mdi:magnet"}"></ha-icon></button>
        <button type="button" class="ib${M.grand ? " on" : ""}" data-at="grand" aria-pressed="${M.grand}" title="${_t("Agrandir l'aperçu")}" aria-label="${_t("Agrandir l'aperçu")}"><ha-icon icon="${M.grand ? "mdi:arrow-collapse" : "mdi:arrow-expand"}"></ha-icon></button></div>`,
      pied: () => `<p class="ed-at-astuce">${_t("Choisis une forme pour la glisser ou la redimensionner.")}</p>`,
      changerGenre: (p, v) => {
        // rectangle ↔ trait ou polygone : la forme garde sa place (boîte ↔ points)
        const pts = v === "trait" || v === "polygone";
        if (pts && !aPoints(p)) {
          const x0 = pc(+p.x || 0), y0 = pc(+p.y || 0), x1 = pc(x0 + (+p.l || 0)), y1 = pc(y0 + (+p.h || 0)), ym = pc((y0 + y1) / 2);
          p.points = v === "trait" ? [[x0, ym], [x1, ym]] : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
          for (const k of ["x", "y", "l", "h"]) delete p[k];
        } else if (!pts && aPoints(p) && p.points?.length) {
          const b = boite(p, 100, 100);
          Object.assign(p, { x: pc(b.x0), y: pc(b.y0), l: pc(Math.max(5, b.x1 - b.x0)), h: pc(Math.max(5, b.y1 - b.y0)) });
          delete p.points;
        }
        if (v === "polygone" && p.points?.length === 2) { const [[a, b], [c, d]] = p.points, ym = (b + d) / 2; p.points.push([pc((a + c) / 2), pc(ym >= 50 ? ym - 40 : ym + 40)]); }
        if (v === "arrondi") p.rayon ??= 8; else delete p.rayon;
        p.genre = v;
      },
      action: (k, v, ob) => {
        const j = +v;
        if (k === "aimant") { M.aimant = !M.aimant; return '[data-at="aimant"]'; }
        if (k === "grand") { M.grand = !M.grand; return '[data-at="grand"]'; }
        if (k === "prim") { M.sel = ob.forme.length - 1; M.som = null; }
        if (k === "retirer-prim") { if (M.sel === j) { M.sel = null; M.som = null; } else if (M.sel != null && M.sel > j) M.sel--; }
        if (k === "monter-prim" && j > 0) { if (M.sel === j) M.sel = j - 1; else if (M.sel === j - 1) M.sel = j; }
        if (k === "retirer-som") { if (M.sel === j) retirerSommet(j, M.som); noter(); return '[data-foc="ap"]'; }
        noter();
        if (k === "prim") return `[data-at="prim:${v}"]`;
        return undefined;
      },
      monter: (voile, api) => {
        M.voile = voile; M.api = api;
        const dans = (ev, k) => ev.composedPath().find((n) => n.dataset?.[k] != null);
        const bouger = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          if (!g.bouge && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 4) return;
          g.bouge = true; clearTimeout(g.appui);
          if (g.mode === "vide" || g.mode === "fini" || !g.b0) return;
          ev.preventDefault();
          const [x, y] = versCm(g, ev);
          appliquer(g, x - g.s0[0], y - g.s0[1], M.aimant && !ev.altKey, ev.shiftKey);
          champs(g.j); planifier();
        };
        const lacher = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          M.g = null; clearTimeout(g.appui); M.guides = [];
          window.removeEventListener("pointermove", bouger); window.removeEventListener("pointerup", lacher); window.removeEventListener("pointercancel", lacher);
          if (!voile.isConnected || ev.type === "perdu") return;
          if (g.mode === "vide") { if (!g.bouge && ev.type === "pointerup" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); } return; }
          if (g.bouge || g.ajout) noter();
          redessiner();
        };
        voile.addEventListener("pointerdown", (ev) => {
          voile.classList.remove("ed-clavier"); // contour de focus de l'aperçu : au clavier seulement
          // une ligne de la liste touchée : sa forme est choisie
          const r = ev.target.closest?.(".ed-prim[data-prim]");
          if (r) { if (+r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } return; }
          const svg = ev.target.closest?.("svg.ed-ap-meuble");
          if (!svg || (ev.pointerType === "mouse" && ev.button !== 0)) return;
          if (M.g) { if (ev.pointerId !== M.g.id && ev.pointerType !== "mouse") return; noter(); lacher({ pointerId: M.g.id, type: "perdu" }); } // second doigt : ignoré ; relâché perdu : glissement clos
          const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM();
          if (!m) return;
          const pl = dans(ev, "plus"), so = dans(ev, "som"), hd = dans(ev, "h"), ci = dans(ev, "p");
          let mode = "vide", focus = '[data-foc="ap"]', ajout = false;
          if (pl && M.sel != null) { const i = ajouterSommet(M.sel, +pl.dataset.plus); if (i != null) { M.som = i; mode = "sommet"; ajout = true; focus = `[data-foc="s-${i}"]`; } }
          else if (so && M.sel != null) { M.som = +so.dataset.som; mode = "sommet"; focus = `[data-foc="s-${M.som}"]`; }
          else if (hd && M.sel != null) { mode = "poignee"; focus = `[data-foc="h-${hd.dataset.h}"]`; }
          else if (ci) { const j = +ci.dataset.p; if (j !== M.sel) choisir(j); else M.som = null; mode = "corps"; }
          ev.preventDefault(); // ni sélection de texte ni focus du navigateur : le focus est donné ci-dessous
          const p = M.sel != null ? ob.forme[M.sel] : null;
          const g = (M.g = { mode, j: M.sel, i: M.som, ph: hd?.dataset.h, p0: p ? clone(p) : null, b0: valide(p) ? boite(p, w, h) : null, w, h, inv: m.inverse(), k: 1 / Math.hypot(m.a, m.b),
            cx: ev.clientX, cy: ev.clientY, id: ev.pointerId, bouge: false, ajout });
          g.s0 = versCm(g, ev);
          // appui long au doigt ou au stylet sur un sommet : retiré (s'il en reste assez) ; à la souris, Suppr ou le bouton de la ligne
          if (mode === "sommet" && !ajout && ev.pointerType !== "mouse" && p.points.length > minPts(p)) g.appui = setTimeout(() => {
            if (M.g !== g || g.bouge || !retirerSommet(g.j, g.i)) return;
            g.mode = "fini"; noter(); redessiner(); champs(g.j); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus({ preventScroll: true }); navigator.vibrate?.(30);
          }, 600);
          try { voile.querySelector(".ed-at-w").setPointerCapture(ev.pointerId); } catch (e) { /* pointeur déjà relâché */ }
          window.addEventListener("pointermove", bouger); window.addEventListener("pointerup", lacher); window.addEventListener("pointercancel", lacher);
          if (mode !== "vide") { redessiner(); if (ajout) champs(M.sel); }
          voile.querySelector(focus)?.focus({ preventScroll: true });
        });
        // tactile : pas de défilement ni de menu quand le doigt part d'une forme ou d'une poignée (le vide de l'aperçu défile)
        voile.addEventListener("touchstart", (ev) => { if (ev.composedPath().some((n) => n.dataset && ["p", "h", "som", "plus"].some((k) => n.dataset[k] != null))) ev.preventDefault(); }, { passive: false });
        voile.addEventListener("contextmenu", (ev) => { if (ev.target.closest?.(".ed-ap-ui")) ev.preventDefault(); });
        // focus dans une ligne de la liste : sa forme est choisie ; champ validé : noté dans l'historique
        voile.addEventListener("focusin", (ev) => { const r = ev.target.closest?.(".ed-prim[data-prim]"); if (r && +r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } });
        voile.addEventListener("change", () => noter());
      },
      apresRendu: (v) => {
        M.voile = v;
        const ob = o();
        if (!ob?.forme) return;
        if (M.ref !== ob) { noter(); M.sel = null; M.som = null; } // autre point de départ (Retour, autre type) : rien de choisi
        if (M.sel != null && !valide(ob.forme[M.sel])) { M.sel = null; M.som = null; }
        if (M.som != null && !(ob.forme[M.sel]?.points?.length > M.som)) M.som = null;
        v.querySelector(".ed-atelier")?.classList.toggle("ed-at-grand", M.grand);
        const w = v.querySelector(".ed-at-w"), svg = w?.querySelector("svg.ed-ap-meuble");
        if (!svg) return;
        w.classList.add("ed-at-manip");
        ajouterHTML(svg, dessinUI(svg));
        lignes();
        // téléphone : la ligne montrée ne passe pas sous l'aperçu collant
        v.querySelector(".ed-at-corps")?.style.setProperty("--ed-ap-h", `${v.querySelector(".ed-at-apercu")?.offsetHeight || 0}px`);
      },
      touche: (ev) => {
        if (ev.type !== "keydown" || !M.voile) return false;
        M.voile.classList.add("ed-clavier");
        const ch = ev.composedPath(), t = ch[0], kl = (ev.key || "").toLowerCase(), ctrl = ev.ctrlKey || ev.metaKey;
        const stop = () => { ev.preventDefault(); ev.stopPropagation(); return true; };
        if (ctrl && !ev.altKey && (kl === "z" || kl === "y")) {
          // champ de texte : annulation du navigateur ; ailleurs (aperçu, nombres, boutons) : historique de l'atelier
          if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && !["number", "checkbox", "radio", "range"].includes(t.type))) return false;
          aller(kl === "y" || ev.shiftKey ? 1 : -1);
          return stop();
        }
        if (ctrl || ev.altKey || !ch.some((n) => n.classList?.contains("ed-at-w"))) return false;
        const ob = o(), p = M.sel != null ? ob.forme[M.sel] : null, ds = t?.dataset || {};
        if (kl === "escape" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); M.voile.querySelector('[data-foc="ap"]')?.focus(); return stop(); }
        if (kl === "enter" || kl === " ") {
          if (ds.plus == null || M.sel == null) return kl === " " ? stop() : false;
          const i = ajouterSommet(M.sel, +ds.plus);
          if (i != null) { M.som = i; noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector(`[data-foc="s-${i}"]`)?.focus(); }
          return stop();
        }
        if (!valide(p)) return false;
        if (kl === "delete" || kl === "backspace") {
          if (ds.som != null) { if (retirerSommet(M.sel, +ds.som)) { noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus(); } return stop(); }
          ob.forme.splice(M.sel, 1); M.sel = null; M.som = null; noter(); M.api.rendre('[data-foc="ap"]');
          return stop();
        }
        const pas = ev.shiftKey ? 10 : 1, d = { arrowleft: [-pas, 0], arrowright: [pas, 0], arrowup: [0, -pas], arrowdown: [0, pas] }[kl];
        if (!d) return false;
        const [w, h] = dims(ob), mode = ds.som != null && aPoints(p) ? "sommet" : ds.h && !aPoints(p) ? "poignee" : "corps";
        if (mode === "sommet") M.som = +ds.som;
        appliquer({ mode, j: M.sel, i: M.som, ph: ds.h, p0: clone(p), b0: boite(p, w, h), w, h, k: 1 }, d[0], d[1], false, false);
        M.guides = []; noter(); champs(M.sel); redessiner();
        return stop();
      },
    };
  }

  // escalier : étage où il mène (`floor`), parmi les autres étages du plan, ou aucun (clé retirée) ; absent sans autre étage
  _champMeneA(o) {
    const ici = this.d.etage_actif?.id, L = this.carte.constructor.ETAGES.parEtage(this.d).filter((e) => e.id != null && e.id !== ici);
    if (!L.length) return "";
    const v = typeof o.etage === "string" ? o.etage : "", opt = (id, nom) => `<option value="${esc(id)}" ${v === id ? "selected" : ""}>${esc(nom)}</option>`;
    return `<div class="ed-champ"><label>${_t("Mène à")}${bulleI(_t("Sur le plan, toucher l'escalier affiche cet étage."))}</label><select data-k="etage">${opt("", _t("aucun"))}
      ${L.map((e) => opt(e.id, e.nom || e.court)).join("")}${v && !L.some((e) => e.id === v) ? opt(v, v) : ""}</select></div>`;
  }

  // fenêtre de toit : pente du toit (0 à 75°), hauteur du bas de la fenêtre (cm), store (`cover`) ou contact ; vides = défauts (40°, 200 cm)
  _champsVelux(o) {
    const V = this.carte.constructor.VELUX, N = (label, k, v, min, max, ph, aide) => `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="number" step="1" min="${min}" max="${max}" data-k="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
    return `<div class="ed-ligne">${N(_t("Pente du toit (°)"), "pente", o.pente, 0, 75, String(V.pente({})), _t("0 = toit plat, jusqu'à 75°. Le bas du rectangle est le bas de la pente."))}
      ${N(_t("Hauteur du bas (cm)"), "hauteur", o.hauteur, 0, 1000, String(V.hauteur({})), _t("Hauteur du bas de la fenêtre au-dessus du sol."))}</div>
      ${this._champEntite(_t("Store ou contact"), "entite", o.entite, true, "cover", _t("Un store (cover) raccourcit la tache de soleil selon sa position ; un contact affiche seulement l'état ouvert."))}`;
  }

  _ongletsMeuble(o) {
    const perso = o.type === "forme", L = MEUBLES(), def = L[o.type] || { nom: perso ? _t("Meuble personnalisé") : _t("Type inconnu ({t})", { t: o.type }), taille: [60, 60] }, [w, h] = o.taille || def.taille, rot = nbr(o.rotation);
    const nomDef = L[o.type] ? _t(def.nom) : def.nom; // nom du catalogue (traduit) ; o.nom est celui de l'utilisateur
    const mode = tactile() ? _t("Glisse-le pour le déplacer (il se colle aux murs proches), tire un coin pour changer sa taille.") : _t("Glisse-le pour le déplacer (il se colle aux murs proches, Alt pour l'en empêcher), tire un coin pour changer sa taille (Maj : proportions gardées).");
    const anim = o.entite || o.valeur || o.fiche ? this._sectionAnimation(o, "meuble", "animation", _t("Animation (actif)")) : "";
    return { icone: "mdi:sofa-outline", titre: o.nom || nomDef, resume: nomDef, aide: def.aide ? `${_t(def.aide)}. ${mode}` : mode,
      actions: `${perso || o.type === "espace" ? "" : ibAct("atelier-meuble", "mdi:shape-outline", _t("Personnaliser la forme (atelier)"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : garder ce meuble à ces dimensions dans « Mes modèles »"))}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(o.type === "espace" ? _t("Nom affiché") : _t("Nom (infobulle)"), "nom", o.nom, nomDef)}
      ${perso ? `<button type="button" class="ed-btn tonal ed-plein" data-act="atelier-meuble"><ha-icon icon="mdi:shape-outline"></ha-icon>${_t("Modifier la forme")}</button>`
        : `<div class="ed-champ"><label>${_t("Type")}</label><select data-k="type">${Object.entries(L).map(([t, x]) => `<option value="${esc(t)}" ${t === o.type ? "selected" : ""}>${esc(_t(x.cat))} · ${esc(_t(x.nom))}</option>`).join("")}${L[o.type] ? "" : `<option selected value="${esc(o.type)}">${esc(o.type)}</option>`}</select></div>`}
      ${def.rond ? this._champNombre(_t("Diamètre (cm)"), "_diametre", w, 1) : `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "taille.0", w, 1)}${this._champNombre(_t("Profondeur (cm)"), "taille.1", h, 1)}</div>`}
      ${def.chaises ? this._champNombre(_t("Chaises"), "chaises", o.chaises ?? def.chaises, 1) : ""}
      ${o.type === "escalier" ? this._champMeneA(o) : ""}
      ${o.type === "fenetre_toit" ? this._champsVelux(o) : ""}
      <div class="ed-champ"><label>${_t("Orientation")}</label><div class="ed-icones">
        <button data-act="rot:-15" title="${_t("Tourner de 15° à gauche")}"><ha-icon icon="mdi:rotate-left-variant"></ha-icon></button>
        <button data-act="rot:-90" title="${_t("Tourner de 90° à gauche")}"><ha-icon icon="mdi:rotate-left"></ha-icon></button>
        <button data-act="rot:90" title="${_t("Tourner de 90° à droite")}"><ha-icon icon="mdi:rotate-right"></ha-icon></button>
        <button data-act="rot:15" title="${_t("Tourner de 15° à droite")}"><ha-icon icon="mdi:rotate-right-variant"></ha-icon></button>
        ${def.rond ? "" : `<button data-act="miroir" class="${o.miroir ? "on" : ""}" title="${_t("Miroir (canapé d'angle gauche / droite…)")}"><ha-icon icon="mdi:flip-horizontal"></ha-icon></button>`}
        </div></div>
      <details class="ed-avance"><summary>${_t("Position")}</summary>
      ${this._champNombre(_t("Angle (°, 0 à 359)"), "_angle", rot, 1)}
      ${this._champXY(o)}</details>
      ${this._calqueNiveau(o)}`],
        ["connecte", _t("Connecté"), "mdi:lightning-bolt-outline", this._sectionConnecte(o, def)],
        ...(anim ? [["animation", _t("Animation"), "mdi:animation-play-outline", anim]] : [])] };
  }

} // @assemblage
