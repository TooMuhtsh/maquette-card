// outils de dessin : aimantation, pointeur, glisser, clics de dessin, zones — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  _liste(type) { return { mur: (this.d.murs ||= []), limite: (this.d.limites ||= []) }[type]; }

  // ---------- magnétisme ----------
  _sommets(exclu) {
    const l = [], d = this.d;
    (d.murs || []).forEach((s, i) => { if (exclu !== `mur:${i}`) l.push([s[0], s[1]], [s[2], s[3]]); });
    (d.limites || []).forEach((s, i) => { if (exclu !== `limite:${i}`) l.push([s[0], s[1]], [s[2], s[3]]); });
    (d.ouvertures || []).forEach((o, i) => { if (exclu !== `ouverture:${i}`) l.push([o.seg[0], o.seg[1]], [o.seg[2], o.seg[3]]); });
    d.pieces.forEach((p, i) => { if (exclu !== `piece:${i}`) l.push(...p.poly); });
    this.trace.forEach((p) => l.push(p));
    return l;
  }
  aimante(p, ev, { exclu, depuis } = {}) {
    if (ev?.altKey) return p.map(arr);
    let [x, y] = p;
    if (depuis && !ev?.shiftKey) {
      const dx = x - depuis[0], dy = y - depuis[1];
      if (Math.abs(dx) < Math.abs(dy) * 0.27) x = depuis[0];
      else if (Math.abs(dy) < Math.abs(dx) * 0.27) y = depuis[1];
    }
    const seuil = 12 / this.echelle;
    let best = null, bd = seuil;
    for (const q of this._sommets(exclu)) {
      const dd = Math.hypot(q[0] - x, q[1] - y);
      if (dd < bd) { bd = dd; best = q; }
    }
    if (best) return [best[0], best[1]];
    const g = this.grille;
    const sx = depuis && x === depuis[0] ? x : Math.round(x / g) * g, sy = depuis && y === depuis[1] ? y : Math.round(y / g) * g;
    return [arr(sx), arr(sy)];
  }

  // ---------- pointeur ----------
  _survolPlan(ev) {
    if (this._glisse) return;
    const p = this.carte.cm(ev);
    const fa = this.aPlacerMeuble && this.R.querySelector(".zone svg .ed-fantome");
    if (fa) { const q = this._grille(p, ev); fa.setAttribute("transform", `translate(${q[0]} ${q[1]})`); fa.setAttribute("visibility", "visible"); }
    const dessin = this.outil !== "selection" || this.aPlacer;
    const svg = this.R.querySelector(".zone svg .ed");
    if (!svg) return;
    const el = svg.querySelector(".ed-elastique"), cur = svg.querySelector(".ed-curseur-pt");
    if (dessin) {
      const dep = this.trace[this.trace.length - 1];
      const q = this.aimante(p, ev, { depuis: dep });
      cur.setAttribute("cx", q[0]); cur.setAttribute("cy", q[1]); cur.setAttribute("visibility", "visible");
      const rc = svg.querySelector(".ed-rect");
      if (dep && this.outil === "rectangle") {
        const x = Math.min(dep[0], q[0]), y = Math.min(dep[1], q[1]), w = Math.abs(q[0] - dep[0]), hh = Math.abs(q[1] - dep[1]);
        Object.entries({ x, y, width: w, height: hh, visibility: "visible" }).forEach(([a, v]) => rc.setAttribute(a, v));
        el.setAttribute("visibility", "hidden");
        this._info(`${fmt(w / 100, 2)} × ${fmt(hh / 100, 2)} m · ${fmt((w * hh) / 10000, 1)} m²`);
      } else if (dep) {
        rc.setAttribute("visibility", "hidden");
        el.setAttribute("x1", dep[0]); el.setAttribute("y1", dep[1]); el.setAttribute("x2", q[0]); el.setAttribute("y2", q[1]); el.setAttribute("visibility", "visible");
        const tr = this.outil === "piece" ? [...this.trace, q] : null;
        this._info(`${_t("longueur {v} m", { v: fmt(Math.hypot(q[0] - dep[0], q[1] - dep[1]) / 100, 2) })}${tr && tr.length >= 3 ? ` · ${fmt(aire(tr), 1)} m²` : ""}`);
      } else this._info(`x ${fmt(q[0], 0)} · y ${fmt(q[1], 0)} cm`);
    } else {
      cur.setAttribute("visibility", "hidden"); el.setAttribute("visibility", "hidden");
      svg.querySelector(".ed-rect")?.setAttribute("visibility", "hidden");
      this._info("");
    }
  }

  _pointeurBas(ev) {
    if (ev.button !== 0) return;
    const p = this.carte.cm(ev);
    if (this.aPlacerMeuble) {
      const m = { ...this.aPlacerMeuble, pos: this._grille(p, ev) }, pre = this._meublePre;
      this.aPlacerMeuble = null; this._meublePre = null;
      this._fermerAide();
      this.commit(() => { (this.d.meubles ||= []).push(m); this.sel = { type: "meuble", i: this.d.meubles.length - 1 }; });
      if (pre) this._preRemplirMeuble(this.d.meubles.length - 1, pre);
      this.zone.classList.remove("dessin");
      return;
    }
    if (this.aPlacer) {
      const pos = this.aimante(p, ev);
      const pt = { ...this.aPlacer, pos }, aFaire = this.aCompleter;
      this.aPlacer = null; this.aCompleter = null;
      if (aFaire?.length) setTimeout(() => { this.editerSelection(); this.snack(_t("À compléter dans la fenêtre d'édition : {l}.", { l: aFaire.map((x) => (A_COMPLETER[x] ? _t(A_COMPLETER[x]) : x)).join(", ") })); }, 50);
      if (aFaire?.length) this._aFaire = { cle: `point:${this.d.points?.length || 0}`, champs: new Set(aFaire) };
      this.commit(() => { (this.d.points ||= []).push(pt); this._rattacher(pt); this.sel = { type: "point", i: this.d.points.length - 1 }; });
      this.zone.classList.remove("dessin");
      return;
    }
    if (this.outil !== "selection") { ev.preventDefault(); this._clicDessin(p, ev); return; }
    const chemin = ev.composedPath();
    if (this.espace) { ev.preventDefault(); this.carte.debutPan(ev); return; }
    const cibleDe = (n) => n?.dataset && (n.dataset.poignee || n.dataset.q || n.dataset.t || n.dataset.l || n.dataset.c || n.dataset.o || n.dataset.mb || n.dataset.p);
    let el = chemin.find(cibleDe);
    const mod = ev.ctrlKey || ev.metaKey || ev.shiftKey;
    if (!el) { ev.preventDefault(); if (!mod) this.selectionner(null); return this._cadre(ev, mod); }
    const selDe = (ds) => {
      if (ds.q != null) return { type: "point", i: +ds.q };
      if (ds.t != null) return { type: "texte", i: +ds.t };
      if (ds.l != null) return { type: "piece", i: +ds.l };
      if (ds.c) { const [type, i] = ds.c.split(":"); return { type, i: +i }; }
      if (ds.o != null) return { type: "ouverture", i: +ds.o };
      if (ds.mb != null) return { type: "meuble", i: +ds.mb };
      if (ds.p != null) return { type: "piece", i: +ds.p };
      return null;
    };
    // élément verrouillé : le clic passe au premier élément non verrouillé dessous (le verrouillé reste choisi s'il n'y a rien dessous,
    // ou depuis Calques › Éléments du plan)
    const s0 = !el.dataset.poignee && selDe(el.dataset);
    if (s0 && !mod && this._verrouille(cle(s0))) {
      const dessous = (this.R.elementsFromPoint?.(ev.clientX, ev.clientY) || []).map((n) => (cibleDe(n) ? n : n.closest?.("[data-q],[data-t],[data-l],[data-c],[data-o],[data-mb],[data-p]")))
        .find((n) => n && n !== el && !n.dataset.poignee && (() => { const x = selDe(n.dataset); return x && cle(x) !== cle(s0) && !this._verrouille(cle(x)); })());
      if (dessous) el = dessous;
    }
    const ds = el.dataset;
    ev.preventDefault();
    // double appui sur l'élément sélectionné (seul : dans un groupe, le 2e appui entre dans le groupe) : sa modale d'édition (le plan est redessiné au premier appui, le « dblclick » natif ne vient pas)
    if (!ds.poignee && !mod) {
      const s1 = selDe(ds), av = this._appuiPrec, k1 = s1 && cle(s1);
      this._appuiPrec = s1 ? { t: ev.timeStamp, x: ev.clientX, y: ev.clientY, k: k1 } : null;
      if (s1 && av && av.k === k1 && ev.timeStamp - av.t < 300 && Math.hypot(ev.clientX - av.x, ev.clientY - av.y) < 8 && this.multi.size <= 1 && this._enModale(this.sel) && cle(this.sel) === k1) {
        this._appuiPrec = null;
        return this.editerSelection();
      }
    }
    if (!ds.poignee) {
      const s = selDe(ds);
      if (s && mod) return this.basculerSel(s);
      // élément d'un groupe : le premier clic prend tout le groupe (glisser = déplacer le groupe), un clic sans glisser sur le groupe déjà pris entre dedans
      const gr = s && this._gr(cle(s));
      if (gr) {
        const membres = this._membres(gr), pris = membres.length === this.multi.size && membres.every((k) => this.multi.has(k));
        if (!pris) { this.sel = s; this.multi = new Set(membres); this.carte._construire(); this._panneau(); return this._glisser(ev, { genre: "groupe" }); }
        return this._glisser(ev, { genre: "groupe", surClic: () => this.selectionner(s) });
      }
      if (s && this.multi.size > 1 && this.multi.has(cle(s))) return this._glisser(ev, { genre: "groupe" });
    }
    if (ds.poignee) {
      const [genre, a, b, c] = ds.poignee.split(":");
      if (this._verrouille(`piece:${a}`) && genre !== "bout" && genre !== "coin") return;
      if (genre === "milieu") {
        const i = +a, j = +b, poly = this.d.pieces[i].poly, q = poly[(j + 1) % poly.length];
        this.commit(() => poly.splice(j + 1, 0, [arr((poly[j][0] + q[0]) / 2), arr((poly[j][1] + q[1]) / 2)]));
        return this._glisser(ev, { genre: "sommet", i, j: j + 1 });
      }
      if (genre === "sommet") return this._glisser(ev, { genre: "sommet", i: +a, j: +b });
      if (genre === "bout") return this._glisser(ev, { genre: "bout", type: a, i: +b, bout: +c });
      if (genre === "coin") return this._glisser(ev, { genre: "coin", i: +a, sx: +b, sy: +c });
    }
    if (ds.q != null) { this.selectionner({ type: "point", i: +ds.q }); return this._glisser(ev, { genre: "html", type: "point", i: +ds.q, el }); }
    if (ds.t != null) { this.selectionner({ type: "texte", i: +ds.t }); return this._glisser(ev, { genre: "html", type: "texte", i: +ds.t, el }); }
    // sous-zone déjà sélectionnée : un 2e clic (sans glisser) passe à la pièce qui la contient (atteignable même entièrement recouverte)
    const parent = (i) => (this.sel?.type === "piece" && this.sel.i === i && this.d.pieces[i]?.sous_zone ? () => { const j = this._parentZone(i); if (j >= 0) this.selectionner({ type: "piece", i: j }); } : null);
    if (ds.l != null) { const surClic = parent(+ds.l); this.selectionner({ type: "piece", i: +ds.l }); return this._glisser(ev, { genre: "html", type: "etiquette", i: +ds.l, el: this.R.querySelector(`.calque>[data-l="${ds.l}"]`), surClic }); }
    if (ds.c) { const [type, i] = ds.c.split(":"); this.selectionner({ type, i: +i }); return this._glisser(ev, { genre: "segment", type, i: +i }); }
    if (ds.o != null) { this.selectionner({ type: "ouverture", i: +ds.o }); return this._glisser(ev, { genre: "segment", type: "ouverture", i: +ds.o }); }
    if (ds.mb != null) { this.selectionner({ type: "meuble", i: +ds.mb }); return this._glisser(ev, { genre: "meuble", i: +ds.mb }); }
    if (ds.p != null) {
      const deja = this.sel?.type === "piece" && this.sel.i === +ds.p, surClic = parent(+ds.p);
      this.selectionner({ type: "piece", i: +ds.p });
      if (deja) return this._glisser(ev, { genre: "piece", i: +ds.p, surClic });
    }
  }

  _glisser(ev, g) {
    // élément verrouillé (ou poignée d'un élément verrouillé) : le clic sélectionne, le glisser ne bouge rien
    const cleG = { html: g.type === "etiquette" ? `piece:${g.i}` : `${g.type}:${g.i}`, segment: `${g.type}:${g.i}`, bout: `${g.type}:${g.i}`, meuble: `meuble:${g.i}`,
      coin: `meuble:${g.i}`, piece: `piece:${g.i}`, sommet: `piece:${g.i}` }[g.genre];
    if (cleG && this._verrouille(cleG)) g = { genre: "fige", surClic: g.surClic };
    const debut = this.carte.cm(ev), avant = JSON.stringify(this.d);
    let bouge = false, raf = 0;
    const origine = clone(this.d);
    this._glisse = true;
    const segDe = (d, type, i) => (type === "ouverture" ? d.ouvertures[i].seg : (type === "mur" ? d.murs : d.limites)[i]);
    const move = (e) => {
      const p = this.carte.cm(e);
      const dx = p[0] - debut[0], dy = p[1] - debut[1];
      if (!bouge && Math.hypot(dx, dy) * this.echelle < 3) return;
      if (g.genre === "fige") return;
      bouge = true;
      if (g.genre === "groupe") {
        const pas = e.altKey ? 0 : this.grille, ddx = pas ? Math.round(dx / pas) * pas : dx, ddy = pas ? Math.round(dy / pas) * pas : dy;
        for (const k of this.multi) this._translater(k, ddx, ddy, origine);
        this._info(_t("déplacement {x} × {y} cm", { x: fmt(ddx, 0), y: fmt(ddy, 0) }));
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.carte._construire(); });
        return;
      }
      if (g.genre === "html") {
        const src = g.type === "point" ? origine.points[g.i].pos : g.type === "texte" ? origine.textes[g.i].pos : origine.pieces[g.i].etiquette;
        const q = this.aimante([src[0] + dx, src[1] + dy], e);
        const { x0, y0, W, H } = this.carte.vue();
        g.el.style.left = `${((q[0] - x0) / W) * 100}%`; g.el.style.top = `${((q[1] - y0) / H) * 100}%`;
        g.dest = q;
        this._info(`x ${fmt(q[0], 0)} · y ${fmt(q[1], 0)} cm`);
        return;
      }
      if (g.genre === "sommet") {
        this.d.pieces[g.i].poly[g.j] = this.aimante(p, e, { exclu: `piece:${g.i}` });
      } else if (g.genre === "bout") {
        const s = segDe(this.d, g.type, g.i), o = segDe(origine, g.type, g.i);
        const autre = g.bout === 0 ? [o[2], o[3]] : [o[0], o[1]];
        const q = this.aimante(p, e, { exclu: `${g.type}:${g.i}`, depuis: autre });
        if (g.bout === 0) { s[0] = q[0]; s[1] = q[1]; } else { s[2] = q[0]; s[3] = q[1]; }
        this._info(_t("longueur {v} m", { v: fmt(Math.hypot(s[2] - s[0], s[3] - s[1]) / 100, 2) }));
      } else if (g.genre === "segment") {
        const s = segDe(this.d, g.type, g.i), o = segDe(origine, g.type, g.i);
        const q = this.aimante([o[0] + dx, o[1] + dy], e, { exclu: `${g.type}:${g.i}` });
        const ddx = q[0] - o[0], ddy = q[1] - o[1];
        s.splice(0, 4, o[0] + ddx, o[1] + ddy, o[2] + ddx, o[3] + ddy);
      } else if (g.genre === "meuble") {
        const M = this.d.meubles[g.i], O = origine.meubles[g.i];
        const q = this._collerMurs(M, this._grille([O.pos[0] + dx, O.pos[1] + dy], e), e);
        M.pos = q.pos;
        this._info(q.mur ? _t("collé au mur") : `x ${fmt(M.pos[0], 0)} · y ${fmt(M.pos[1], 0)} cm`);
      } else if (g.genre === "coin") {
        const M = this.d.meubles[g.i], O = origine.meubles[g.i], def = MEUBLES()[O.type] || {};
        const [w0, h0] = O.taille || def.taille || [60, 60], th = (nbr(O.rotation) * Math.PI) / 180, co = Math.cos(th), si = Math.sin(th), mx = O.miroir ? -1 : 1;
        const loc = (x, y) => [((x - O.pos[0]) * co + (y - O.pos[1]) * si) * mx, -(x - O.pos[0]) * si + (y - O.pos[1]) * co];
        const pl = loc(p[0], p[1]), opp = [(-g.sx * w0) / 2, (-g.sy * h0) / 2], pas = e.altKey ? 1 : this.grille;
        let w = Math.min(5000, Math.max(10, Math.round(Math.abs(pl[0] - opp[0]) / pas) * pas)), h = Math.min(5000, Math.max(10, Math.round(Math.abs(pl[1] - opp[1]) / pas) * pas));
        if (def.rond || e.shiftKey) { const t = def.rond ? Math.max(w, h) : null; if (t) w = h = t; else { const k = Math.max(w / w0, h / h0); w = Math.round(w0 * k); h = Math.round(h0 * k); } }
        const cl = [opp[0] + (g.sx * w) / 2, opp[1] + (g.sy * h) / 2], cx = cl[0] * mx;
        M.taille = [w, h];
        M.pos = [arr(O.pos[0] + cx * co - cl[1] * si), arr(O.pos[1] + cx * si + cl[1] * co)];
        this._info(def.rond ? `Ø ${fmt(w, 0)} cm` : `${fmt(w, 0)} × ${fmt(h, 0)} cm`);
      } else if (g.genre === "piece") {
        const P = this.d.pieces[g.i], O = origine.pieces[g.i];
        const q = this.aimante([O.poly[0][0] + dx, O.poly[0][1] + dy], e, { exclu: `piece:${g.i}` });
        const ddx = q[0] - O.poly[0][0], ddy = q[1] - O.poly[0][1];
        (g.meubles ||= this._meublesDans(O.poly, origine)).forEach((j) => { this.d.meubles[j].pos = [arr(origine.meubles[j].pos[0] + ddx), arr(origine.meubles[j].pos[1] + ddy)]; });
        (g.zones ||= this._sousZonesDans(g.i, origine)).forEach((j) => this._bougerZone(j, ([x, y]) => [arr(x + ddx), arr(y + ddy)], origine));
        P.poly = O.poly.map(([x, y]) => [arr(x + ddx), arr(y + ddy)]);
        if (O.etiquette) P.etiquette = [arr(O.etiquette[0] + ddx), arr(O.etiquette[1] + ddy)];
      }
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.carte._construire(); });
    };
    const fin = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      this._glisse = false;
      this._finGlisse = null;
    };
    // pincement à deux doigts pendant le glisser (annulerGlisse) : l'élément revient à sa place, rien n'entre dans l'historique
    this._finGlisse = () => { fin(); if (bouge) { this._applique(avant); this.carte._construire(); } };
    const up = () => {
      fin();
      if (!bouge) { g.surClic?.(); return; }
      if (g.genre === "groupe") for (const k of this.multi) if (k.startsWith("point:")) this._rattacher(this._elt(k));
      if (g.genre === "html" && g.dest) {
        if (g.type === "point") { this.d.points[g.i].pos = g.dest; this._rattacher(this.d.points[g.i]); }
        else if (g.type === "texte") this.d.textes[g.i].pos = g.dest;
        else this.d.pieces[g.i].etiquette = g.dest;
      }
      this.histo.push(avant); this.refaire = [];
      this._apres();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  // glisser ou cadre de sélection en cours abandonné (pincement à deux doigts sur le plan, appelé par la carte)
  annulerGlisse() { this._finGlisse?.(); }

  _double(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.poignee);
    if (this.outil !== "selection") { this._finirTrace(); return; }
    // double-clic sur une pièce ou une ouverture (hors poignée) : sa modale d'édition
    if (!el) { if (this._enModale(this.sel)) this.editerSelection(); return; }
    const [genre, a, b] = el.dataset.poignee.split(":");
    if (genre === "sommet" && this.d.pieces[+a].poly.length > 3) this.commit(() => this.d.pieces[+a].poly.splice(+b, 1));
  }

  // rattache un point à sa pièce (halo limité aux murs)
  _rattacher(pt) {
    if (!pt.halo) return;
    const pc = [...this.d.pieces].reverse().find((p) => dansPoly(pt.pos, p.poly));
    if (pc) pt.piece = pc.nom; else delete pt.piece;
  }

  // ---------- dessin ----------
  _clicDessin(p, ev) {
    const dep = this.trace[this.trace.length - 1];
    const q = this.aimante(p, ev, { depuis: dep });
    const o = this.outil;
    if (dep && q[0] === dep[0] && q[1] === dep[1]) return;
    if (o === "texte") {
      const infos = this._texteInfos;
      this._texteInfos = false;
      this.commit(() => { (this.d.textes ||= []).push(infos ? { t: _t("Informations"), pos: q, infos: [] } : { t: _t("Texte"), pos: q }); this.sel = { type: "texte", i: this.d.textes.length - 1 }; });
      this.choisirOutil("selection");
      if (infos) setTimeout(() => this._action("info-ajout"), 50);
      else setTimeout(() => { this.editerSelection(); this.R.querySelector('.ed-edit input[data-k="t"]')?.select(); }, 50);
      return;
    }
    if (o === "rectangle" && dep) {
      const [x1, y1] = dep, [x2, y2] = q;
      if (x1 === x2 || y1 === y2) return;
      this.trace = [];
      this.creerRectangle(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      return;
    }
    if (o === "piece" && this.trace.length >= 3) {
      const [fx, fy] = this.trace[0];
      if (Math.hypot(q[0] - fx, q[1] - fy) * this.echelle < 12) return this._finirTrace();
    }
    if ((o === "mur" || o === "limite") && dep) {
      if (q[0] === dep[0] && q[1] === dep[1]) return;
      this.commit(() => this._liste(o).push([dep[0], dep[1], q[0], q[1]]));
    }
    if (o === "ouverture" && dep) {
      const [dx, dy] = [q[0] - dep[0], q[1] - dep[1]], seg = [dep[0], dep[1], q[0], q[1]];
      // côté extérieur : à l'opposé de la pièce intérieure bordée (mur extérieur), sinon vers le haut ou la gauche
      const dehors = this._dehorsAuto(seg, Math.abs(dx) >= Math.abs(dy) ? [0, -1] : [-1, 0]);
      this.trace = [];
      const base = this.modeleOuverture ? clone(this.modeleOuverture) : { type: "fenetre" }, aFaire = this.aCompleter, chercher = this.chercherOuv, pref = this.prefOuv;
      this.modeleOuverture = null; this.aCompleter = null; this.chercherOuv = null; this.prefOuv = null;
      const ob = { ...base, seg, dehors };
      this.choisirOutil("selection");
      // capteurs voulus : cherchés parmi les entités libres de la pièce (une seule = reliée d'office, plusieurs = petite liste,
      // aucune = champ « à compléter ») ; l'ouverture est posée une fois les choix faits
      (async () => {
        const r = aFaire?.length || chercher?.length ? await this._preRemplirOuverture(ob, { champs: aFaire || [], chercher: chercher || [], pref }) : { manquants: new Set(), relies: [] };
        if (r.manquants.size) this._aFaire = { cle: `ouverture:${this.d.ouvertures?.length || 0}`, champs: r.manquants };
        this.commit(() => { (this.d.ouvertures ||= []).push(ob); this.sel = { type: "ouverture", i: this.d.ouvertures.length - 1 }; });
        // capteur à compléter : la modale s'ouvre sur l'onglet Capteurs, le champ surligné
        if (r.manquants.size) this.editerSelection("capteurs");
        if (r.manquants.size) this.snack(_t("À compléter dans la fenêtre d'édition : {l}.", { l: [...r.manquants].map((x) => (A_COMPLETER[x] ? _t(A_COMPLETER[x]) : x)).join(", ") }));
        else if (r.relies.length) this.snack(_t("Relié : {l}.", { l: r.relies.map((e) => this.carte._nom(e)).join(", ") }));
      })();
      return;
    }
    this.trace.push(q);
    this.carte._construire();
  }

  // ---------- meubles ----------
  // meubles dont le centre est dans un contour (ils suivent la pièce quand on la déplace ou la redimensionne)
  _meublesDans(poly, src = this.d) {
    return (src.meubles || []).map((m, j) => (dansPoly(m.pos, poly) ? j : -1)).filter((j) => j >= 0);
  }
  // sous-zones d'une pièce ou d'une sous-zone (centre de leurs sommets dedans ; dans une sous-zone, seulement les plus petites) : elles la suivent comme ses meubles
  _sousZonesDans(i, src = this.d) {
    const P = src.pieces[i];
    if (!P) return [];
    const a = P.sous_zone ? aire(P.poly) : Infinity;
    return src.pieces.map((z, j) => { if (j === i || !z.sous_zone || aire(z.poly) >= a) return -1; const c = [z.poly.reduce((a, q) => a + q[0], 0) / z.poly.length, z.poly.reduce((a, q) => a + q[1], 0) / z.poly.length]; return dansPoly(c, P.poly) ? j : -1; }).filter((j) => j >= 0);
  }
  // pièce (ou sous-zone plus grande) la plus petite qui contient le centre de la sous-zone i ; -1 s'il n'y en a pas
  _parentZone(i) {
    const z = this.d.pieces[i], c = centre(z.poly), a = aire(z.poly);
    let best = -1, ba = Infinity;
    this.d.pieces.forEach((p, j) => { const ap = aire(p.poly); if (j !== i && (ap > a || (ap === a && !p.sous_zone)) && ap < ba && dansPoly(c, p.poly)) { best = j; ba = ap; } });
    return best;
  }
  _bougerZone(j, T, src = this.d) { const z = this.d.pieces[j], o = src.pieces[j]; z.poly = o.poly.map(T); if (o.etiquette) z.etiquette = T(o.etiquette); }
  // demi-emprise [x, y] d'un meuble tourné
  _emprise(m) {
    const [w, h] = m.taille || MEUBLES()[m.type]?.taille || [60, 60], th = (nbr(m.rotation) * Math.PI) / 180, c = Math.abs(Math.cos(th)), si = Math.abs(Math.sin(th));
    return [(c * w + si * h) / 2, (si * w + c * h) / 2];
  }
  _grille(p, ev) { const g = ev?.altKey ? 1 : this.grille; return [arr(Math.round(p[0] / g) * g), arr(Math.round(p[1] / g) * g)]; }
  // aimantation douce : un bord du meuble (emprise tournée) qui passe à moins de 12 px d'un mur droit s'y colle, côté où il se trouve ;
  // un meuble qui chevauche le mur (poussé dedans) est repoussé du côté de son centre
  _collerMurs(m, pos, ev) {
    if (ev?.altKey) return { pos };
    const [hx, hy] = this._emprise(m), seuil = 12 / (this.echelle || 1), e = 4.5;
    let [x, y] = pos, mur = false, bx = seuil, by = seuil;
    for (const sg of this.d.murs || []) {
      // bord collé du côté où se trouve le centre ; s'il chevauche le mur, quelle que soit la distance
      const coller = (v, c, demi, b) => {
        const cible = c + (v >= c ? 1 : -1) * (e + demi), dans = Math.abs(v - c) < demi + e, dd = Math.abs(v - cible);
        return dans || dd < b ? [cible, dans ? 0 : dd] : null;
      };
      if (sg[0] === sg[2] && Math.min(sg[1], sg[3]) < y + hy && Math.max(sg[1], sg[3]) > y - hy) { const r = coller(pos[0], sg[0], hx, bx); if (r) { [x, bx] = r; mur = true; } }
      if (sg[1] === sg[3] && Math.min(sg[0], sg[2]) < x + hx && Math.max(sg[0], sg[2]) > x - hx) { const r = coller(pos[1], sg[1], hy, by); if (r) { [y, by] = r; mur = true; } }
    }
    return { pos: [arr(x), arr(y)], mur };
  }

  _finirTrace() {
    const o = this.outil, t = this.trace;
    this.trace = [];
    this._info("");
    if (o === "piece" && t.length >= 3) {
      const z = this.zoneEnAttente;
      this.zoneEnAttente = null;
      this.commit(() => { this.d.pieces.push({ nom: z ? this.hass.areas?.[z]?.name || z : _t("Nouvelle pièce"), poly: t, etiquette: centre(t), ...(z ? { zone: z } : {}) }); this.sel = { type: "piece", i: this.d.pieces.length - 1 }; });
      this.choisirOutil("selection");
      if (z) { this.integrer(this.d.pieces.length - 1); return; }
      setTimeout(() => this.R.querySelector('.ed-edit input[data-k="nom"]')?.select(), 50);
      return;
    }
    this.carte._construire();
  }

} // @assemblage
