// vue : position au pointeur, bornes du plan, calques, palette — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // repère : position d'un événement pointeur en cm (coordonnées du plan)
  cm(ev) {
    const svg = this.shadowRoot.querySelector(".zone svg");
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  // cadre du plan : celui de l'étage affiché, ou l'union de tous les étages (la carte ne change ni d'échelle ni de hauteur d'un étage
  // à l'autre ; l'image de fond n'y entre pas) — en vue, calculée une fois par config et par largeur affichée
  static PX_BULLES = 32; // demi-emprise d'une pastille à l'écran (px, halo compris), réservée autour d'elle dans le cadre du plan
  bornes(sansVitrine = false) {
    const c = this._config, m = c.marge ?? 40;
    let b;
    if (idsEtages(c).length > 1) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, K = this._bornesEt;
      if (!this._editeur && K && K.plein === this._plein && K.P === P) b = K.b;
      else {
        const l = parEtage(c).map((e) => this._bornesGeo({ ...e.geo, marge: c.marge }, true)).filter(Boolean);
        b = l.length ? l.reduce((u, q) => { const x0 = Math.min(u.x0, q.x0), y0 = Math.min(u.y0, q.y0); return { x0, y0, W: Math.max(u.x0 + u.W, q.x0 + q.W) - x0, H: Math.max(u.y0 + u.H, q.y0 + q.H) - y0 }; })
          : this._bornesGeo(c);
        this._bornesEt = this._editeur ? null : { plein: this._plein, P, b };
      }
    } else b = this._bornesGeo(c);
    if (!c.vitrine || sansVitrine) return b;
    const v = geoVitrine(c, b), X0 = Math.min(b.x0, v.x - m), Y0 = Math.min(b.y0, v.y - m);
    return { x0: X0, y0: Y0, W: Math.max(b.x0 + b.W, v.x + v.w + m) - X0, H: Math.max(b.y0 + b.H, v.y + v.H + m) - Y0 };
  }
  // cadre d'une géométrie (listes d'un étage, ou la config) ; vide : null si `nulSiVide`, sinon 0..500
  _bornesGeo(c, nulSiVide = false) {
    const xs = [], ys = [];
    const ajoute = (x, y) => { xs.push(x); ys.push(y); };
    c.pieces.forEach((p) => p.poly.forEach(([x, y]) => ajoute(x, y)));
    [...(c.murs || []), ...(c.limites || []), ...(c.ouvertures || []).map((o) => o.seg)].forEach(([a, b, d, e]) => { ajoute(a, b); ajoute(d, e); });
    (c.points || []).forEach((p) => ajoute(...p.pos));
    (c.meubles || []).forEach((m) => { const [w, h] = [0, 1].map((j) => nb((m.taille || MEUBLES[m.type]?.taille || [60, 60])[j], 60)), r = Math.hypot(w, h) / 2; ajoute(nb(m.pos?.[0]) - r, nb(m.pos?.[1]) - r); ajoute(nb(m.pos?.[0]) + r, nb(m.pos?.[1]) + r); });
    if (!xs.length) { if (nulSiVide) return null; ajoute(0, 0), ajoute(500, 500); }
    const m = c.marge ?? 40;
    let x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, x1 = Math.max(...xs) + m, y1 = Math.max(...ys) + m;
    // textes figés et zones d'informations (centrés sur leur position, police en px : clamp(10px, 1,2 % de la largeur, 13px)) :
    // emprise estimée d'après leurs caractères et la largeur affichée du plan ; le cadre ne s'agrandit que si un texte dépasse
    const textes = (c.textes || []).filter((t) => t && Array.isArray(t.pos) && Number.isFinite(+t.pos[0]) && Number.isFinite(+t.pos[1]));
    if (textes.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, px = Math.max(10, Math.min(13, 0.012 * P));
      const nomL = (l) => String(l?.nom || this._hass?.states?.[l?.entite]?.attributes?.friendly_name || l?.entite || "").length;
      // largeur d'un texte en em : majuscules et chiffres plus larges, espaces plus étroits
      const largeur = (txt) => [...txt].reduce((a, ch) => a + (ch === " " ? 0.3 : /[A-Z0-9ÀÂÉÈÊÎÔÛÇMW]/.test(ch) ? 0.72 : 0.56), 0);
      for (let tour = 0; tour < 4; tour++) { // l’emprise agrandit le plan, donc les textes en cm : quelques passes
        const em = (px * (x1 - x0)) / P;
        for (const t of textes) {
          const f = em * Math.max(0.3, Math.min(5, nb(t.taille, 1))), titre = String(t.t ?? ""), info = Array.isArray(t.infos);
          const l = info ? Math.max(6, largeur(titre) + 1.5, ...t.infos.map((x) => (nomL(x) + 9) * 0.55 + 2.2)) * f + 1.5 * f : Math.max(0.6, largeur(titre)) * f;
          const h = info ? ((t.infos.length || 1) + (titre ? 1 : 0)) * 1.5 * f + 0.9 * f : 1.3 * f;
          const [x, y] = [+t.pos[0], +t.pos[1]];
          x0 = Math.min(x0, x - l / 2 - 8); x1 = Math.max(x1, x + l / 2 + 8); y0 = Math.min(y0, y - h / 2 - 8); y1 = Math.max(y1, y + h / 2 + 8);
        }
      }
    }
    // pastilles (taille en px : environ 2,6 em, plus l'onde d'une pastille active, MaquetteCard.PX_BULLES) : jamais rognées par le bord du plan
    const pts = (c.points || []).filter((p) => Array.isArray(p?.pos) && Number.isFinite(+p.pos[0]) && Number.isFinite(+p.pos[1]));
    if (pts.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800;
      for (let tour = 0; tour < 3; tour++) {
        const r = (MaquetteCard.PX_BULLES * (x1 - x0)) / P;
        for (const p of pts) { const x = +p.pos[0], y = +p.pos[1]; x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); }
      }
    }
    return { x0, y0, W: x1 - x0, H: y1 - y0 };
  }

  // calques effectifs : ordre de dessin, masqués (config, afficher_meubles, choix du visiteur en vue) et verrouillés (édition seulement)
  _calques() {
    const c = this._config, q = c.calques || {}, ed = !!this._editeur, masques = new Set(q.masques || []);
    if (c.afficher_meubles === false || (c.afficher_meubles === "pc" && this.clientWidth < 760)) masques.add("meubles");
    if (!ed) this._calquesVisiteur().forEach((k) => masques.add(k));
    return { svg: ordreCalques(q.ordre_svg, CALQUES_SVG), html: ordreCalques(q.ordre_html, CALQUES_HTML), masques, verrous: new Set(ed ? q.verrous || [] : []) };
  }

  // bouton « Calques » en vue : choix propres à ce navigateur (jamais dans la config), ignorés si le bouton est retiré
  _cleCalques() { return `maquette-calques:${this._config.id || "plan"}`; }
  _calquesVisiteur() {
    if (!this._config.calques?.bouton_vue) return [];
    const cle = this._cleCalques();
    if (this._cqV?.cle !== cle) {
      let l = [];
      try { l = JSON.parse(localStorage.getItem(cle) || "[]"); } catch (e) { /* stockage indisponible : rien de caché */ }
      this._cqV = { cle, l: Array.isArray(l) ? l.filter((k) => NOMS_CALQUES[k]) : [] };
    }
    return this._cqV.l;
  }
  // calques proposés dans le menu de la vue : ceux qui ont des éléments et que la config ne cache pas déjà
  _calquesMenu() {
    const c = this._config, q = c.calques || {}, P = c.points || [], M = c.meubles || [];
    const presents = { meubles: M.length, appareils: P.length, halos: P.some((p) => p.halo), limites: (c.limites || []).length, sous_zones: c.pieces.some((p) => p.sous_zone),
      etiquettes: c.pieces.some((p) => !p.sous_zone && p.etiquette), libelles: c.pieces.some((p) => p.sous_zone && p.etiquette) || M.some((m) => m.type === "espace" && m.nom), textes: (c.textes || []).length };
    const fixes = new Set(q.masques || []);
    if (c.afficher_meubles === false) fixes.add("meubles");
    return Object.keys(presents).filter((k) => presents[k] && !fixes.has(k));
  }
  _menuCalques(ouvrir = true) {
    const R = this.shadowRoot, zoom = R.querySelector(".zoom"), btn = R.querySelector('[data-z="calques"]'), ouvert = R.querySelector(".menu-cq");
    if (ouvert || !ouvrir) {
      ouvert?.remove();
      btn.setAttribute("aria-expanded", "false");
      window.removeEventListener("pointerdown", this._horsMenu, true);
      return;
    }
    const caches = new Set(this._calquesVisiteur());
    const m = document.createElement("div");
    m.className = "menu-cq";
    m.setAttribute("role", "group");
    m.setAttribute("aria-label", _t("Calques affichés"));
    poserHTML(m, `<div class="t">${_t("Afficher")}</div>${this._calquesMenu().map((k) => `<label><input type="checkbox" data-cqv="${k}" ${caches.has(k) ? "" : "checked"}><ha-icon icon="${ICONES_CALQUES[k]}"></ha-icon><span>${esc(_t(NOMS_CALQUES[k]))}</span></label>`).join("")}`);
    m.onchange = (ev) => {
      const k = ev.target.dataset.cqv;
      if (!k) return;
      const l = new Set(this._calquesVisiteur());
      if (ev.target.checked) l.delete(k); else l.add(k);
      this._cqV = { cle: this._cleCalques(), l: [...l] };
      if (l.size) stock.ecrire(this._cqV.cle, JSON.stringify([...l])); else stock.retirer(this._cqV.cle); // stockage indisponible : le choix vaut pour cette page
      this._construire();
    };
    m.onkeydown = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._menuCalques(false); btn.focus(); } };
    this._horsMenu = (ev) => { if (!ev.composedPath().some((n) => n === m || n === btn)) this._menuCalques(false); };
    window.addEventListener("pointerdown", this._horsMenu, true);
    zoom.append(m);
    btn.setAttribute("aria-expanded", "true");
    m.querySelector("input")?.focus();
  }

  // couleurs nommées : --mq-c-<nom> sur l'hôte (héritées dans le shadow DOM) ; les noms retirés de la palette perdent leur variable
  _poserPalette(c) {
    const l = palette(c), noms = new Set(l.map(([n]) => n));
    for (const n of this._palNoms || []) if (!noms.has(n)) this.style.removeProperty(`--mq-c-${n}`);
    for (const [n, v] of l) { paletteActive.add(n); this.style.setProperty(`--mq-c-${n}`, v); }
    this._palNoms = noms;
  }
} // @assemblage
