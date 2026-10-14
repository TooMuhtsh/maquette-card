// meubles : « Créer un meuble », modifier, réglages, aperçu — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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

} // @assemblage
