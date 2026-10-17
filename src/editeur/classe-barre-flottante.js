// barre flottante près de l'élément sélectionné : placement, élément sous le pointeur — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- barre flottante (MD3) près de l'élément sélectionné : Modifier, Dupliquer, Copier, Verrou, Ordre, Supprimer ----------
  // hors de l'élément (au-dessus, sinon dessous), dans la partie visible du plan ; suit le zoom, le défilement et les modifications
  _majBarreFlottante() {
    const plan = this.R.querySelector(".plan"), svg = this.R.querySelector(".zone svg"), s = this.sel, multi = this.multi.size > 1;
    let b = this.R.querySelector(".ed-bf");
    const o = this._objetEd();
    const montrer = !!o && this._enModale(s) && !this.vueEdition && !this.vueParametres && !this.vueAmbiance && this.outil === "selection" && !this.aPlacer && !this.aPlacerMeuble && !this.trace.length && !!plan && !!svg;
    if (!montrer) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement("div");
      b.className = "ed-bf";
      b.setAttribute("role", "toolbar");
      b.addEventListener("pointerdown", (ev) => ev.stopPropagation());
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const x = ev.composedPath().find((n) => n.dataset?.bf);
        if (!x) return;
        if (x.dataset.bf === "modifier") return this.editerSelection();
        if (x.dataset.bf === "partager") return this.partagerSelection(); // classe-partage.js
        this._action(x.dataset.bf);
      });
    }
    if (b.parentNode !== plan) plan.append(b);
    b.hidden = false;
    b.setAttribute("aria-label", _t("Actions de la sélection"));
    // verrou et ordre : éléments du plan qui en ont (pas les murs, limites, widgets ni puces) ; sélection multiple : verrou de tous
    const objs = multi ? this._objetsMulti() : [], plat = !multi && ["mur", "limite"].includes(s.type), hors = !multi && ["widget", "puce"].includes(s.type);
    const v = multi ? objs.length > 0 && objs.every((x) => x.verrouille === true) : o.verrouille === true, lv = v ? _t("Déverrouiller") : _t("Verrouiller : ni déplacé ni redimensionné à la souris");
    const ib = (a, ic, t, cl = "") => `<button type="button" class="ib${cl}" data-bf="${a}" title="${esc(t)}" aria-label="${esc(t)}"><ha-icon icon="${ic}"></ha-icon></button>`;
    poserHTML(b, `<button type="button" class="ed-btn tonal ed-bf-mod" data-bf="modifier" title="${tactile() ? _t("Modifier") : _t("Modifier (Entrée ou double-clic)")}"><ha-icon icon="mdi:pencil-outline"></ha-icon><span>${_t("Modifier")}</span></button>
      ${plat ? "" : ib("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${hors || (multi && !objs.length) ? "" : ib("copier", "mdi:clipboard-outline", tactile() ? _t("Copier, pour coller sur un autre étage") : _t("Copier, pour coller sur un autre étage (Ctrl+C)"))}${plat || hors || (multi && !objs.length) ? "" : ib("verrou", `mdi:${v ? "lock-outline" : "lock-open-variant-outline"}`, lv, v ? " on" : "")}
      ${plat || hors || multi ? "" : `${ib("niveau:haut", "mdi:arrange-bring-to-front", _t("Premier plan"))}${ib("niveau:bas", "mdi:arrange-send-to-back", _t("Arrière-plan"))}`}${!this._etroit() && this._clesEd().some((k) => /^(widget|point|ouverture|meuble):/.test(k)) ? ib("partager", "mdi:share-variant-outline", _t("Partager (sans tes entités)")) : ""}<span class="ed-bf-sep"></span>${ib("supprimer", "mdi:delete-outline", _t("Supprimer"), " danger")}`);
    b.querySelector('[data-bf="verrou"]')?.setAttribute("aria-pressed", String(v));
    this._placerBarreFlottante();
    // zoom animé ou vue déplacée sans reconstruction : la barre suit le viewBox
    if (this._bfObs?.svg !== svg) {
      this._bfObs?.disconnect();
      this._bfObs = new MutationObserver(() => this._placerBarreFlottante());
      this._bfObs.observe(svg, { attributes: true, attributeFilter: ["viewBox"] });
      this._bfObs.svg = svg;
    }
  }
  // rectangle à l'écran de la sélection (px) : élément rendu (pastille, texte, meuble, widget, puce), sinon ses points (pièce, segment)
  _ecranSel() {
    const svg = this.R.querySelector(".zone svg"), m = svg?.getScreenCTM(), b = [];
    for (const k of this._clesEd()) {
      const s = deCle(k);
      const dom = { widget: ".w.sel", puce: ".tete .chip.sel", point: `.calque>[data-q="${s.i}"]`, texte: `.calque>[data-t="${s.i}"],.calque [data-t="${s.i}"]`, meuble: `.zone svg [data-mb="${s.i}"]` }[s.type];
      const el = dom && this.R.querySelector(dom), r = el?.getBoundingClientRect();
      if (r && (r.width || r.height)) { b.push([r.left, r.top, r.right, r.bottom]); continue; }
      const pts = this._ptsElt(k);
      if (!pts || !m) continue;
      const e = pts.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      b.push([Math.min(...e.map((p) => p[0])), Math.min(...e.map((p) => p[1])), Math.max(...e.map((p) => p[0])), Math.max(...e.map((p) => p[1]))]);
    }
    if (!b.length) return null;
    return { g: Math.min(...b.map((x) => x[0])), h: Math.min(...b.map((x) => x[1])), d: Math.max(...b.map((x) => x[2])), b: Math.max(...b.map((x) => x[3])) };
  }
  _placerBarreFlottante() {
    const b = this.R.querySelector(".ed-bf"), plan = this.R.querySelector(".plan"), zone = this.R.querySelector(".zone"), s = this.sel;
    if (!b || b.hidden || !plan || !zone || !this._enModale(s)) return;
    const ex = this._ecranSel();
    if (!ex) return;
    // partie visible : la zone du plan (widget, puce : la carte), coupée par la fenêtre
    const P = plan.getBoundingClientRect(), Z = (this.multi.size <= 1 && ["widget", "puce"].includes(s.type) ? this.R.querySelector("ha-card") : zone).getBoundingClientRect();
    const vis = { g: Math.max(Z.left, 0), h: Math.max(Z.top, 0), d: Math.min(Z.right, innerWidth), b: Math.min(Z.bottom, innerHeight) };
    const bw = b.offsetWidth, bh = b.offsetHeight, ec = 12, bord = 4;
    // trop large pour la partie visible (téléphone étroit) : centrée, elle déborde autant des deux côtés
    const bx = (x) => (vis.d - vis.g - 2 * bord < bw ? (vis.g + vis.d - bw) / 2 : Math.min(Math.max(x, vis.g + bord), Math.max(vis.g + bord, vis.d - bw - bord))), by = (y) => Math.min(Math.max(y, vis.h + bord), Math.max(vis.h + bord, vis.b - bh - bord));
    const tient = ([x, y]) => x >= vis.g + bord - 0.5 && x + bw <= vis.d - bord + 0.5 && y >= vis.h + bord - 0.5 && y + bh <= vis.b - bord + 0.5;
    const couvre = ([x, y], r) => x < r.d && x + bw > r.g && y < r.b && y + bh > r.h;
    // hors de la sélection, dans la partie visible : au-dessus, dessous, à droite, à gauche (centrée sur la partie visible de la sélection)
    const cx = bx((Math.max(ex.g, vis.g) + Math.min(ex.d, vis.d)) / 2 - bw / 2), cy = by((Math.max(ex.h, vis.h) + Math.min(ex.b, vis.b)) / 2 - bh / 2);
    let pos = [[cx, ex.h - bh - ec], [cx, ex.b + ec], [ex.d + ec, cy], [ex.g - bw - ec, cy]].find((q) => tient(q) && !couvre(q, ex));
    // la sélection occupe toute la partie visible : un coin ou un bord libre qui ne recouvre pas l'élément sous le pointeur
    if (!pos) {
      const g = bx(vis.g), d = bx(vis.d), h = by(vis.h), bas = by(vis.b), sous = this._eltSousPointeur(vis);
      const cand = [[cx, h], [cx, bas], [g, h], [d, h], [g, bas], [d, bas]];
      pos = (sous && cand.find((q) => !couvre(q, sous))) || cand[0];
    }
    b.style.left = `${Math.round(pos[0] - P.left)}px`; b.style.top = `${Math.round(pos[1] - P.top)}px`;
  }
  // rectangle à l'écran (marge comprise) du plus petit élément du plan sous le pointeur (dernière position connue), sinon du pointeur
  // lui-même ; null = pointeur hors de la partie visible. Un élément qui couvre la moitié de la partie visible ne compte pas (pièce de fond)
  _eltSousPointeur(vis) {
    const [x, y] = this._xy || [];
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < vis.g || x > vis.d || y < vis.h || y > vis.b) return null;
    const zone = this.R.querySelector(".zone"), aire = (vis.d - vis.g) * (vis.b - vis.h);
    let q = null, min = Infinity;
    for (const el of this.R.elementsFromPoint?.(x, y) || []) {
      if (!zone?.contains(el) || el.closest?.(".ed-bf")) continue;
      const e = el.getBoundingClientRect(), a = e.width * e.height;
      if (a > 0 && a < aire / 2 && a < min) { min = a; q = e; }
    }
    return { g: Math.min(x - 24, q ? q.left - 8 : x), h: Math.min(y - 24, q ? q.top - 8 : y), d: Math.max(x + 24, q ? q.right + 8 : x), b: Math.max(y + 24, q ? q.bottom + 8 : y) };
  }

} // @assemblage
