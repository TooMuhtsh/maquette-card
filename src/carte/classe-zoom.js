// zoom : vue courante, cadrer, zoomer, tout voir, isoler une pièce, boutons, gestes, déplacement — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  vue() { return this._vue || this._box; }

  // nouvelle vue (même proportions que le plan entier), bornée au plan ; null = plan entier
  _normaliser(v) {
    const B = this._box, r = B.W / B.H;
    let W = Math.min(B.W, Math.max(B.W / 8, v.W)), H = W / r;
    if (W >= B.W * 0.985) return null;
    const cx = v.x0 + v.W / 2, cy = v.y0 + v.H / 2;
    let x0 = cx - W / 2, y0 = cy - H / 2;
    x0 = Math.min(Math.max(x0, B.x0), B.x0 + B.W - W);
    y0 = Math.min(Math.max(y0, B.y0), B.y0 + B.H - H);
    return { x0, y0, W, H };
  }

  _cadrer(v, anim = false) {
    const cible = v && this._normaliser(v);
    const depart = this.vue(), fin = cible || this._box;
    cancelAnimationFrame(this._anim);
    const poser = (q) => {
      const R = this.shadowRoot, svg = R.querySelector(".zone svg");
      if (!svg || !(q.W > 0 && q.H > 0)) return;
      svg.setAttribute("viewBox", `${q.x0} ${q.y0} ${q.W} ${q.H}`);
      R.querySelectorAll(".calque>[data-x]").forEach((n) => {
        n.style.left = `${((n.dataset.x - q.x0) / q.W) * 100}%`;
        n.style.top = `${((n.dataset.y - q.y0) / q.H) * 100}%`;
      });
      this._tailleBadges(q);
    };
    const finir = () => {
      this._vue = cible;
      const R = this.shadowRoot;
      R.querySelector('[data-z="tout"]').hidden = !cible || this._figee();
      R.querySelector(".zone").classList.toggle("zoome", !!cible);
      if (this._editeur) this._construire(); else poser(fin);
    };
    if (!anim || this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches) { this._vue = cible; poser(fin); return finir(); }
    const t0 = performance.now(), D = 320, ease = (k) => 1 - Math.pow(1 - k, 3);
    const pas = (t) => {
      // l'horodatage de la 1re image peut précéder t0 : k < 0 extrapolerait au-delà du départ (largeur négative en dézoomant)
      const k = ease(Math.max(0, Math.min(1, (t - t0) / D)));
      poser({ x0: depart.x0 + (fin.x0 - depart.x0) * k, y0: depart.y0 + (fin.y0 - depart.y0) * k, W: depart.W + (fin.W - depart.W) * k, H: depart.H + (fin.H - depart.H) * k });
      if (k < 1) this._anim = requestAnimationFrame(pas); else finir();
    };
    this._anim = requestAnimationFrame(pas);
  }

  zoomer(f, centre) {
    const v = this.vue(), [cx, cy] = centre || [v.x0 + v.W / 2, v.y0 + v.H / 2];
    const W = v.W * f, H = v.H * f;
    this._cadrer({ x0: cx - (cx - v.x0) * f, y0: cy - (cy - v.y0) * f, W, H }, !centre);
  }

  toutVoir() {
    if (this._iso != null) { this._iso = null; this._construire(); }
    this._cadrer(null, true);
  }

  isoler(i) {
    // une sous-zone n'a pas de vue à elle : on isole la pièce qui la contient
    if (this._config.pieces[i]?.sous_zone) {
      const z = this._config.pieces[i].poly, c = [z.reduce((a, q) => a + q[0], 0) / z.length, z.reduce((a, q) => a + q[1], 0) / z.length];
      i = this._config.pieces.findIndex((p) => !p.sous_zone && dansPoly(c, p.poly));
      if (i < 0) return;
    }
    if (this._config.pieces[i]?.zoom === false) return;
    const poly = this._config.pieces[i].poly, B = this._box;
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = Math.max(x1 - x0, y1 - y0) * 0.14 + 40;
    let W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
    if (W / H > B.W / B.H) H = W * B.H / B.W; else W = H * B.W / B.H;
    const depart = this.vue();
    this._iso = i;
    this._vue = null;
    this._construire();
    this._vue = depart === this._box ? null : depart;
    this._cadrer({ x0: (x0 + x1) / 2 - W / 2, y0: (y0 + y1) / 2 - H / 2, W, H }, true);
  }

  // boutons de zoom (`interaction.boutons_zoom`) : sur le plan, dans l'en-tête (hors du plan) ou cachés (plus, moins, tout le plan :
  // calques et revoir la journée restent) ; auto = en-tête sur un écran étroit et tactile (téléphone), sur le plan sinon.
  // En édition, jamais cachés : dans l'en-tête au téléphone (sauf `map`) ou avec `header`, sur le plan sinon (le plan de
  // l'éditeur reste libre au doigt). Toujours sur le plan sans en-tête (tablette sans titre)
  _placerZoom() {
    const R = this.shadowRoot, z = R?.querySelector(".zoom"), barre = R?.querySelector(".barre");
    if (!z || !barre) return;
    const m = interactionDe(this._config).zoom, tel = this._modeMise === "etroit" && matchMedia("(pointer: coarse)").matches;
    const tete = !barre.hidden && (this._editeur ? m !== "plan" && (m === "entete" || tel) : m === "entete" || (m === "auto" && tel)), bEd = R.querySelector(".editer");
    if (tete && z.parentElement !== barre) barre.insertBefore(z, bEd?.parentElement === barre ? bEd : null);
    else if (!tete && z.parentElement === barre) R.querySelector(".plan").append(z);
    z.classList.toggle("en-tete", tete);
    z.classList.toggle("caches", !this._editeur && m === "caches");
  }

  _pxVersCm(cx, cy) {
    const r = this.shadowRoot.querySelector(".zone").getBoundingClientRect(), v = this.vue();
    return [v.x0 + ((cx - r.left) / r.width) * v.W, v.y0 + ((cy - r.top) / r.height) * v.H];
  }

  _gestes(zone) {
    // pincement (2 doigts) partout ; glisser d'un doigt / de la souris quand on est zoomé (hors édition)
    let pince = null, pan = null;
    const debutPince = (t) => {
      const [a, b] = t, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      pince = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, m: this._pxVersCm(mx, my), v: { ...this.vue() } };
    };
    zone.addEventListener("touchstart", (e) => {
      if (this._figee()) { pince = pan = null; return; } // vue figée : ni pincement ni déplacement, le toucher reste un clic
      if (e.touches.length === 2) { debutPince(e.touches); pan = null; this._editeur?.annulerGlisse?.(); }
      else if (e.touches.length === 1 && this._vue && !this._editeur) pan = { x: e.touches[0].clientX, y: e.touches[0].clientY, v: { ...this._vue }, bouge: false };
    }, { passive: true });
    zone.addEventListener("touchmove", (e) => {
      const r = zone.getBoundingClientRect();
      if (pince && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const B = this._box, W = Math.min(B.W, Math.max(B.W / 8, pince.v.W * pince.d / d)), H = W * B.H / B.W;
        const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
        this._cadrer({ x0: pince.m[0] - ((mx - r.left) / r.width) * W, y0: pince.m[1] - ((my - r.top) / r.height) * H, W, H });
        this._aBouge = true;
      } else if (pan && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0], dx = t.clientX - pan.x, dy = t.clientY - pan.y;
        if (Math.hypot(dx, dy) > 6) pan.bouge = this._aBouge = true;
        this._cadrer({ ...pan.v, x0: pan.v.x0 - (dx / r.width) * pan.v.W, y0: pan.v.y0 - (dy / r.height) * pan.v.H });
      }
    }, { passive: false });
    const finTouche = (e) => {
      if (e.touches.length < 2) pince = null;
      if (!e.touches.length) { pan = null; setTimeout(() => { this._aBouge = false; }, 60); }
    };
    zone.addEventListener("touchend", finTouche);
    zone.addEventListener("touchcancel", finTouche);
    zone.addEventListener("wheel", (e) => {
      if (!e.ctrlKey || this._figee()) return; // pincement du pavé tactile ou Ctrl + molette (vue figée : rien)
      e.preventDefault();
      this.zoomer(Math.exp(e.deltaY * 0.01), this._pxVersCm(e.clientX, e.clientY));
    }, { passive: false });
    zone.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== (this._editeur ? 1 : 0) || !this._vue || this._figee()) return;
      if (!this._editeur && e.composedPath().some((n) => n.classList?.contains("pt") || n.classList?.contains("mb"))) return;
      this.debutPan(e);
    });
  }

  debutPan(e) {
    if (!this._vue) return;
    const zone = this.shadowRoot.querySelector(".zone"), r = zone.getBoundingClientRect(), v0 = { ...this._vue };
    zone.classList.add("panne");
    const mv = (m) => {
      const dx = m.clientX - e.clientX, dy = m.clientY - e.clientY;
      if (Math.hypot(dx, dy) > 4) this._aBouge = true;
      this._cadrer({ ...v0, x0: v0.x0 - (dx / r.width) * v0.W, y0: v0.y0 - (dy / r.height) * v0.H });
    };
    const up = () => {
      zone.classList.remove("panne");
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
      setTimeout(() => { this._aBouge = false; }, 60);
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  }

} // @assemblage
