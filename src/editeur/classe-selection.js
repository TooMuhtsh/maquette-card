// sélection : simple, multiple, tout sélectionner, translation, cadre de sélection — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- sélection & panneau ----------
  selectionner(s) {
    this.sel = s;
    this.multi = new Set(s ? [cle(s)] : []);
    this.carte._construire();
    this._panneau();
  }

  basculerSel(s) {
    const k = cle(s);
    if (this.multi.has(k)) this.multi.delete(k); else this.multi.add(k);
    this.sel = this.multi.has(k) ? s : this.multi.size ? deCle([...this.multi].pop()) : null;
    this.carte._construire();
    this._panneau();
  }

  toutSelectionner() {
    const d = this.d;
    let k = [];
    (d.points || []).forEach((_, i) => k.push(`point:${i}`)); (d.textes || []).forEach((_, i) => k.push(`texte:${i}`));
    (d.ouvertures || []).forEach((_, i) => k.push(`ouverture:${i}`)); (d.murs || []).forEach((_, i) => k.push(`mur:${i}`));
    (d.limites || []).forEach((_, i) => k.push(`limite:${i}`)); d.pieces.forEach((_, i) => k.push(`piece:${i}`));
    (d.meubles || []).forEach((_, i) => k.push(`meuble:${i}`));
    k = k.filter((x) => !this._bloque(x));
    this.multi = new Set(k); this.sel = k.length ? deCle(k[k.length - 1]) : null;
    this.carte._construire(); this._panneau();
  }

  _translater(k, dx, dy, src) {
    if (this._verrouille(k)) return; // verrouillé : reste en place, même dans un groupe ou une sélection multiple
    const [ty, a] = k.split(":"), i = +a, d = this.d, T = ([x, y]) => [arr(x + dx), arr(y + dy)];
    const S = (s) => [arr(s[0] + dx), arr(s[1] + dy), arr(s[2] + dx), arr(s[3] + dy), ...s.slice(4)];
    if (ty === "meuble") d.meubles[i].pos = T(src.meubles[i].pos);
    if (ty === "piece") this._meublesDans(src.pieces[i].poly, src).forEach((j) => { if (!this.multi.has(`meuble:${j}`) && !d.meubles[j].verrouille) d.meubles[j].pos = T(src.meubles[j].pos); });
    if (ty === "piece") this._sousZonesDans(i, src).forEach((j) => { if (!this.multi.has(`piece:${j}`)) this._bougerZone(j, T, src); });
    if (ty === "point") d.points[i].pos = T(src.points[i].pos);
    else if (ty === "texte") d.textes[i].pos = T(src.textes[i].pos);
    else if (ty === "piece") { d.pieces[i].poly = src.pieces[i].poly.map(T); if (src.pieces[i].etiquette) d.pieces[i].etiquette = T(src.pieces[i].etiquette); }
    else if (ty === "mur") d.murs[i] = S(src.murs[i]);
    else if (ty === "limite") d.limites[i] = S(src.limites[i]);
    else if (ty === "ouverture") d.ouvertures[i].seg = S(src.ouvertures[i].seg);
  }

  _dansCadre(x0, y0, x1, y1) {
    const d = this.d, k = [], dans = ([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1, seg = (s) => dans([s[0], s[1]]) && dans([s[2], s[3]]);
    (d.points || []).forEach((p, i) => dans(p.pos) && k.push(`point:${i}`));
    (d.meubles || []).forEach((m, i) => dans(m.pos) && k.push(`meuble:${i}`));
    (d.textes || []).forEach((p, i) => dans(p.pos) && k.push(`texte:${i}`));
    (d.ouvertures || []).forEach((o, i) => seg(o.seg) && k.push(`ouverture:${i}`));
    (d.murs || []).forEach((s, i) => seg(s) && k.push(`mur:${i}`));
    (d.limites || []).forEach((s, i) => seg(s) && k.push(`limite:${i}`));
    d.pieces.forEach((p, i) => p.poly.every(dans) && k.push(`piece:${i}`));
    return k.filter((x) => !this._bloque(x));
  }

  _cadre(ev, ajouter) {
    const debut = this.carte.cm(ev), g = this.R.querySelector(".zone svg .ed");
    if (!g) return;
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("class", "ed-cadre"); r.setAttribute("stroke-width", 1.5 / this.echelle);
    g.append(r);
    let bouge = false, fin = debut;
    this._glisse = true;
    const boite = () => [Math.min(debut[0], fin[0]), Math.min(debut[1], fin[1]), Math.max(debut[0], fin[0]), Math.max(debut[1], fin[1])];
    const move = (e) => {
      fin = this.carte.cm(e);
      if (Math.hypot(fin[0] - debut[0], fin[1] - debut[1]) * this.echelle > 4) bouge = true;
      const [a, b, c, d] = boite();
      r.setAttribute("x", a); r.setAttribute("y", b); r.setAttribute("width", c - a); r.setAttribute("height", d - b);
    };
    const arreter = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); this._glisse = false; this._finGlisse = null; r.remove(); };
    this._finGlisse = arreter; // pincement : cadre abandonné, sélection inchangée
    const up = () => {
      arreter();
      if (!bouge) return;
      const k = this._dansCadre(...boite());
      if (!ajouter) this.multi = new Set();
      k.forEach((x) => this.multi.add(x));
      this.sel = this.multi.size ? deCle(k.length ? k[k.length - 1] : [...this.multi].pop()) : null;
      this.carte._construire(); this._panneau();
      if (k.length) this.snack(_t("{n} élément sélectionné.|{n} éléments sélectionnés.", { n: this.multi.size }), null, null, 2000);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }

} // @assemblage
