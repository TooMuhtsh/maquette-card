// groupes, rectangle, redimensionner, assistant des pièces — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- groupes : appartenance portée par chaque élément (clé « groupe », 5e valeur pour murs et limites) ----------
  _gr(k) { const o = this._elt(k); if (!o) return null; return Array.isArray(o) ? (typeof o[4] === "string" ? o[4] : null) : o.groupe || null; }
  _poserGr(k, g) {
    const o = this._elt(k);
    if (!o || k.startsWith("widget:") || k.startsWith("puce:")) return;
    if (Array.isArray(o)) { if (g) o[4] = g; else o.length = 4; } else if (g) o.groupe = g; else delete o.groupe;
  }
  _toutesCles() {
    const d = this.d, l = [];
    for (const [ty, liste] of Object.entries(this._listes(d))) (liste || []).forEach((_, i) => l.push(`${ty}:${i}`));
    return l;
  }
  _membres(g) { return this._toutesCles().filter((k) => this._gr(k) === g); }
  grouper() {
    const cles = [...this.multi].filter((k) => !/^(widget|puce):/.test(k));
    if (cles.length < 2) return this.snack(_t("Sélectionne au moins deux éléments (cadre ou Ctrl+clic) pour les grouper."));
    const id = `g${Date.now().toString(36)}`, n = (this.d.groupes || []).length + 1;
    this.commit(() => {
      (this.d.groupes ||= []).push({ id, nom: _t("Groupe {n}", { n }) });
      cles.forEach((k) => this._poserGr(k, id));
      this._nettoyerGroupes();
    });
    this.snack(_t("{n} éléments groupés : un clic prend tout le groupe, un second clic sans glisser entre dedans.", { n: cles.length }));
  }
  degrouper() {
    const gs = new Set([...this.multi].map((k) => this._gr(k)).filter(Boolean));
    if (!gs.size) return;
    this.commit(() => { for (const k of this._toutesCles()) if (gs.has(this._gr(k))) this._poserGr(k, null); this._nettoyerGroupes(); });
    this.snack(_t("Groupe défait."), _t("Annuler##defaire"), this._annulation(), 8000);
  }
  _nettoyerGroupes() {
    const compte = {};
    for (const k of this._toutesCles()) { const g = this._gr(k); if (g) compte[g] = (compte[g] || 0) + 1; }
    for (const k of this._toutesCles()) { const g = this._gr(k); if (g && compte[g] < 2) this._poserGr(k, null); }
    // un groupe utilisé mais absent de la liste (YAML écrit à la main) y est ajouté pour pouvoir le nommer et le défaire
    const connus = new Set((this.d.groupes || []).map((g) => g.id));
    Object.keys(compte).filter((g) => compte[g] >= 2 && !connus.has(g)).forEach((g) => (this.d.groupes ||= []).push({ id: g, nom: _t("Groupe {n}", { n: this.d.groupes.length + 1 }) }));
    if (this.d.groupes) { this.d.groupes = this.d.groupes.filter((g) => compte[g.id] >= 2); if (!this.d.groupes.length) delete this.d.groupes; }
  }
  _groupeSel() {
    const gs = new Set([...this.multi].map((k) => this._gr(k)));
    if (gs.size !== 1) return null;
    const [g] = gs;
    return g && this._membres(g).length === this.multi.size ? (this.d.groupes || []).find((x) => x.id === g) || { id: g, nom: _t("Groupe") } : null;
  }

  // pièce rectangulaire et ses 4 murs (sans doublon avec des murs déjà là, cas de deux pièces accolées)
  creerRectangle(x, y, w, h, opt = {}) {
    const z = opt.zone ?? this.zoneEnAttente;
    this.zoneEnAttente = null;
    const poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const sz = this.sousZoneEnAttente;
    if (sz) {
      // sous-zone : un contour nommé dans une pièce, sans murs
      this.sousZoneEnAttente = null;
      this.commit(() => { this.d.pieces.push({ nom: sz.nom, sous_zone: true, poly, etiquette: [x + w / 2, y + h / 2] }); this.sel = { type: "piece", i: this.d.pieces.length - 1 }; });
      this.choisirOutil("selection");
      return;
    }
    (opt.silencieux ? (f) => f() : (f) => this.commit(f))(() => {
      const murs = (this.d.murs ||= []), meme = (a, b) => (a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]) || (a[0] === b[2] && a[1] === b[3] && a[2] === b[0] && a[3] === b[1]);
      poly.forEach((p, j) => { const q = poly[(j + 1) % 4], sg = [p[0], p[1], q[0], q[1]]; if (!murs.some((m) => meme(m, sg))) murs.push(sg); });
      this.d.pieces.push({ nom: opt.nom || (z ? this.hass.areas?.[z]?.name || z : _t("Nouvelle pièce")), poly, etiquette: [x + w / 2, y + h / 2], ...(z ? { zone: z } : {}) });
      if (!opt.silencieux) this.sel = { type: "piece", i: this.d.pieces.length - 1 };
    });
    if (opt.silencieux) return this.d.pieces.length - 1;
    this.choisirOutil("selection");
    if (z) { this.integrer(this.d.pieces.length - 1); return; }
    setTimeout(() => this.R.querySelector('.ed-edit input[data-k="nom"]')?.select(), 50);
  }

  // nouvelle largeur / hauteur d'une pièce rectangle (bords droit et bas déplacés) : seuls SES murs, limites et
  // ouvertures suivent ; un mur partagé avec une voisine reste en place pour elle et un nouveau mur est tracé
  redimensionner(i, w, h) {
    const p = this.d.pieces[i], r = rectDe(p.poly);
    if (!r || !(w > 0) || !(h > 0)) return;
    const [x, y, w0, h0] = r, X = x + w0, Y = y + h0, dx = w - w0, dy = h - h0;
    const entre = (v, a, b) => v >= Math.min(a, b) - 0.5 && v <= Math.max(a, b) + 0.5;
    // bord de la pièce qui porte le segment : g / d (verticaux), h / b (horizontaux), ou null
    const bord = (sg) => {
      if (sg[0] === sg[2] && entre(sg[1], y, Y) && entre(sg[3], y, Y)) return sg[0] === x ? "g" : sg[0] === X ? "d" : null;
      if (sg[1] === sg[3] && entre(sg[0], x, X) && entre(sg[2], x, X)) return sg[1] === y ? "h" : sg[1] === Y ? "b" : null;
      return null;
    };
    const surPoly = (q, poly) => poly.some((a, j) => { const b = poly[(j + 1) % poly.length], cr = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
      return Math.abs(cr) < 1 && entre(q[0], a[0], b[0]) && entre(q[1], a[1], b[1]); });
    const partage = (sg) => this.d.pieces.some((o, j) => j !== i && surPoly([sg[0], sg[1]], o.poly) && surPoly([sg[2], sg[3]], o.poly));
    const bouge = ([px, py]) => [px === X ? px + dx : px, py === Y ? py + dy : py];
    const nouveaux = [];
    this.commit(() => {
      for (const l of [this.d.murs || [], this.d.limites || []]) l.forEach((sg, j) => {
        const b = bord(sg);
        if (!b) return;
        const moved = [...bouge([sg[0], sg[1]]), ...bouge([sg[2], sg[3]]), ...sg.slice(4)];
        if (moved.join() === sg.join()) return;
        if (partage(sg)) { if ((b === "d" && dx) || (b === "b" && dy)) nouveaux.push([l, moved]); return; }
        l[j] = moved;
      });
      nouveaux.forEach(([l, sg]) => { if (!l.some((m) => m.join() === sg.join())) l.push(sg); });
      (this.d.ouvertures || []).forEach((o) => { const b = bord(o.seg); if (b === "d") o.seg = [o.seg[0] + dx, o.seg[1], o.seg[2] + dx, o.seg[3]]; if (b === "b") o.seg = [o.seg[0], o.seg[1] + dy, o.seg[2], o.seg[3] + dy]; });
      this._meublesDans(p.poly).forEach((j) => { const m = this.d.meubles[j]; m.pos = [m.pos[0] > x + w0 / 2 ? m.pos[0] + dx : m.pos[0], m.pos[1] > y + h0 / 2 ? m.pos[1] + dy : m.pos[1]]; });
      p.poly = p.poly.map(bouge);
      if (p.etiquette) p.etiquette = [x + w / 2, y + h / 2];
    });
    const chevauche = (o) => { const xs = o.poly.map((q) => q[0]), ys = o.poly.map((q) => q[1]);
      return Math.min(x + w, Math.max(...xs)) - Math.max(x, Math.min(...xs)) > 1 && Math.min(y + h, Math.max(...ys)) - Math.max(y, Math.min(...ys)) > 1; };
    // une sous-zone chevauche forcément sa pièce : on ne compare que des pièces ordinaires entre elles
    if (!p.sous_zone && this.d.pieces.some((o, j) => j !== i && !o.sous_zone && chevauche(o)))
      this.snack(_t("La pièce empiète sur une voisine : ajuste-la aussi (les voisines ne bougent pas)."));
  }

  // assistant de départ : toutes les pièces HA d'un coup, en rectangles côte à côte avec leurs appareils
  async assistantPieces() {
    const hass = this.hass, deja = new Set(this.d.pieces.map((p) => p.zone).filter(Boolean));
    const zones = Object.values(hass.areas || {}).filter((z) => !deja.has(z.area_id)).sort((a, b) => a.name.localeCompare(b.name, _loc()));
    if (!zones.length) return this.snack(Object.keys(hass.areas || {}).length ? _t("Toutes les pièces HA sont déjà sur le plan.") : _t("Aucune pièce dans Home Assistant : crée-les dans Paramètres → Pièces, ou dessine-les ici."));
    const choix = await new Promise((fin) => {
      const { voile } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${_t("Démarrer avec mes pièces")}</h2>
          <div class="ed-aide">${_t("Chaque pièce cochée devient un rectangle 4 × 3 m, à ajuster ensuite.")}</div></header>
        <div class="ed-resultats">${zones.map((z) => { const n = entitesZone(hass, z.area_id).length;
          return `<label class="ed-coche"><input type="checkbox" value="${esc(z.area_id)}" ${n ? "checked" : ""}><ha-icon icon="${esc(z.icon || "mdi:floor-plan")}"></ha-icon><span class="n"><span>${esc(z.name)}</span><small>${_t("{n} entité|{n} entités", { n })}</small></span></label>`; }).join("")}</div>
        <footer><button class="ed-btn texte" data-r="0">${_t("Annuler")}</button><button class="ed-btn plein" data-r="1"><ha-icon icon="mdi:home-import-outline"></ha-icon>${_t("Créer les pièces")}</button></footer></div>`);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) { const l = [...voile.querySelectorAll("input:checked")].map((x) => x.value); voile.remove(); fin(b?.dataset.r === "1" ? l : null); } };
    });
    if (!choix?.length) return;
    const b = this.d.pieces.length ? this.carte.bornes() : null, x0 = b ? b.x0 + b.W + 100 : 0, y0 = b ? b.y0 : 0;
    const par = Math.ceil(Math.sqrt(choix.length)), W = 400, H = 300;
    this._instantane();
    const histo = this.histo.length;
    let n = 0;
    choix.forEach((z, k) => {
      const i = this.creerRectangle(x0 + (k % par) * W, y0 + Math.floor(k / par) * H, W, H, { zone: z, silencieux: true });
      n += this._integrerSilencieux(i);
    });
    this.histo.length = histo; // une seule étape d'annulation pour tout l'assistant
    this.sel = null; this.multi.clear();
    this._apres();
    this.recadrer();
    this.snack(`${_t("{n} pièce créée|{n} pièces créées", { n: choix.length })}, ${_t("{n} appareil placé|{n} appareils placés", { n })}. ${_t("Ajuste maintenant tailles et positions.")}`, _t("Annuler##defaire"), this._annulation(), 12000);
  }

} // @assemblage
