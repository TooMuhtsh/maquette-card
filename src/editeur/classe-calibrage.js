// calibrage de l'image de fond (L7) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- image de fond : calibrage 2 points, aligner sur un mur, glisser l'image déverrouillée ----------
  // Rien n'est écrit pendant le mode : une seule étape d'annulation à la fin, Échap (ou ×) ressort sans rien changer.
  // Le bandeau est un « ed-voile » : tant qu'il est là, les raccourcis de l'éditeur se taisent (Échap, Ctrl+Z…).

  // verrou de session (Calques, panneau Image de fond) : déverrouillée, l'image se glisse sur le plan
  get fondLibre() { return !!this._fondLibre; }
  set fondLibre(v) {
    this._fondLibre = !!v;
    // pas de style écrit dans .zone (elle survit à l'éditeur) : une classe, et sa règle dans le style de l'éditeur, retiré à la fermeture
    if (v && this.style && !this.style.textContent.includes(".fond-libre")) this.style.textContent += "\n.zone.fond-libre,.zone.zoome.figee.fond-libre{touch-action:none}";
    this.zone?.classList.toggle("fond-libre", !!v);
    if (v && !this._glFond) { this._glFond = (ev) => this._basFond(ev); this.R.addEventListener("pointerdown", this._glFond, true); }
  }
  // géométrie de l'image (cm) telle que dessinée : hauteur absente → lue sur l'<image> (ratio naturel)
  _geoFondEd() {
    const f = this.d.fond, url = f && this.carte.constructor.urlFond(f.image);
    if (!url || !(+f.largeur > 0)) return null;
    const G = this.carte._geoFond(f, url);
    if (G.h == null) { const h = +this.R.querySelector(".zone svg .fond-image")?.getAttribute("height"); if (h > 0) G.h = h; else return null; }
    return G;
  }
  // point du plan ↔ point de l'image (0..1 sur la largeur et la hauteur, avant rotation autour du centre)
  static _tourne([x, y], deg) { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }
  static _versImage(G, p) {
    const [vx, vy] = EditeurPlan._tourne([p[0] - G.x - G.w / 2, p[1] - G.y - G.h / 2], -G.rot);
    return [vx / G.w + 0.5, vy / G.h + 0.5];
  }
  // nouvelle géométrie : largeur w, rotation rot, le point (u, v) de l'image posé sur `cible`
  static _poserSur([u, v], cible, w, h, rot) {
    const [ox, oy] = EditeurPlan._tourne([(u - 0.5) * w, (v - 0.5) * h], rot);
    return { x: cible[0] - ox - w / 2, y: cible[1] - oy - h / 2, w, h, rot };
  }
  _dessinerImageFond(G) {
    const im = this.R.querySelector(".zone svg .fond-image");
    if (!im) return;
    for (const [k, v] of [["x", G.x], ["y", G.y], ["width", G.w], ["height", G.h]]) im.setAttribute(k, String(v));
    if (G.rot) im.setAttribute("transform", `rotate(${G.rot} ${G.x + G.w / 2} ${G.y + G.h / 2})`); else im.removeAttribute("transform");
  }

  // appui sur le dessin (SVG, étiquettes posées par-dessus), pas sur la barre flottante ni un bouton de l'éditeur
  _surPlan(chemin) {
    const z = this.zone, svg = z?.querySelector("svg");
    return !!svg && chemin.includes(z) && !chemin.some((n) => n.classList?.contains("ed-bf") || n.classList?.contains("ed-terminer") || n.classList?.contains("ed-calib"));
  }

  // ---------- glisser l'image (calque déverrouillé) : un appui dans l'image la prend, une étape d'annulation au relâcher ----------
  _basFond(ev) {
    if (this.carte._editeur !== this) { this.R?.removeEventListener("pointerdown", this._glFond, true); this.zone?.classList.remove("fond-libre"); return; }
    if (this._calib || ev.button !== 0 || !ev.isPrimary || this.carte._fondVerrouille() || this.outil !== "selection" || this.aPlacer || this.aPlacerMeuble
      || this.trace.length || this.espace || this.R.querySelector(".ed-voile") || this.carte._calques().masques.has("fond")) return;
    const chemin = ev.composedPath();
    if (!this._surPlan(chemin) || chemin.some((n) => n.dataset?.poignee != null)) return;
    const G = this._geoFondEd(), p = G && this.carte.cm(ev), u = p && EditeurPlan._versImage(G, p);
    if (!u || u[0] < 0 || u[0] > 1 || u[1] < 0 || u[1] > 1) return;
    ev.preventDefault(); ev.stopPropagation();
    let d = null;
    const mv = (m) => {
      if (m.pointerId !== ev.pointerId) return;
      if (!d && Math.hypot(m.clientX - ev.clientX, m.clientY - ev.clientY) < 4) return;
      const q = this.carte.cm(m);
      d = [q[0] - p[0], q[1] - p[1]];
      this._dessinerImageFond({ ...G, x: G.x + d[0], y: G.y + d[1] });
    };
    const fin = (u2) => {
      if (u2.pointerId !== ev.pointerId) return;
      window.removeEventListener("pointermove", mv, true); window.removeEventListener("pointerup", fin, true); window.removeEventListener("pointercancel", fin, true);
      if (!d) return;
      if (u2.type === "pointercancel" || !this.d.fond) return this._dessinerImageFond(G);
      const r = (v) => Math.round(v * 10) / 10;
      this.commit(() => { this.d.fond.pos = [r(G.x + d[0]), r(G.y + d[1])]; });
    };
    window.addEventListener("pointermove", mv, true); window.addEventListener("pointerup", fin, true); window.addEventListener("pointercancel", fin, true);
  }

  // ---------- calibrage : A, B sur l'image, puis la distance réelle (ou deux extrémités de mur) ----------
  calibrerFond() {
    const G = this._geoFondEd();
    if (!G) return this._alerteFond?.(_t("Image pas encore chargée : réessaie dans un instant."));
    if (this.carte._calques().masques.has("fond")) return this._alerteFond?.(_t("Affiche le calque « Image de fond » pour la calibrer."));
    this.vueFond = false;
    this.panneauCalques(false);
    if (this.sel || this.multi.size) this.selectionner(null);
    if (this.outil !== "selection") this.choisirOutil("selection");
    const C = this._calib = { etape: "A", G, msg: "" };
    const { voile, fermer } = this._voile("ed-calib", null, { touche: (ev) => this._toucheCalib(ev) });
    voile.onclick = (ev) => {
      const a = ev.composedPath().find((n) => n.dataset?.cal)?.dataset.cal;
      if (a === "annuler") this.quitterCalibrage();
      else if (a === "valider") this._validerDistance();
      else if (a === "mur") { C.etape = "M1"; C.msg = ""; this._majCalib(); }
    };
    C.voile = voile; C.fermer = fermer;
    (this.R.querySelector(".plan") || this.R.querySelector("ha-card")).append(voile);
    this._calibPd = (ev) => this._basCalib(ev);
    this.R.addEventListener("pointerdown", this._calibPd, true);
    // plan redessiné (zoom, Calques…) : les repères reviennent
    C.obs = new MutationObserver(() => { const svg = this.R.querySelector(".zone svg"); if (this._calib === C && svg && !svg.querySelector(".ed-calib-marques")) this._marquesCalib(); });
    C.obs.observe(this.zone, { childList: true, subtree: true });
    this._majCalib();
  }
  // sortie du mode ; sans calibrage fait (Échap, ×) : rien n'a changé, retour au panneau
  quitterCalibrage(fait = false) {
    const C = this._calib;
    if (!C) return;
    this._calib = null;
    C.obs?.disconnect();
    C.fermer();
    this.R?.removeEventListener("pointerdown", this._calibPd, true);
    this.R?.querySelector(".zone svg .ed-calib-marques")?.remove();
    if (!fait && this.carte._editeur === this) this.ouvrirFond();
  }
  _toucheCalib(ev) {
    const C = this._calib;
    if (!C || this.carte._editeur !== this) return this.quitterCalibrage(true);
    if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); return this.quitterCalibrage(); }
    if (ev.key === "Enter" && C.etape === "dist" && ev.composedPath().some((n) => n.dataset?.calVal != null || n.dataset?.calUnite != null)) { ev.preventDefault(); ev.stopPropagation(); this._validerDistance(); }
  }
  // appui sur le plan : un toucher bref (sans glisser, un seul doigt) pose le point ; deux doigts zooment, la molette du milieu déplace la vue
  _basCalib(ev) {
    const C = this._calib;
    if (C && this.carte._editeur !== this) return this.quitterCalibrage(true);
    if (!C || !this._surPlan(ev.composedPath()) || ev.button !== 0) return;
    ev.stopPropagation(); ev.preventDefault();
    if (!ev.isPrimary) { C.appui = null; return; }
    if (C.etape === "dist") return;
    C.appui = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
    const up = (u) => {
      if (u.pointerId !== ev.pointerId) return;
      window.removeEventListener("pointerup", up, true); window.removeEventListener("pointercancel", up, true);
      const a = C.appui;
      C.appui = null;
      if (!a || a.id !== u.pointerId || u.type === "pointercancel" || this._calib !== C || Math.hypot(u.clientX - a.x, u.clientY - a.y) > 10) return;
      this._pointCalib(this.carte.cm(u));
    };
    window.addEventListener("pointerup", up, true); window.addEventListener("pointercancel", up, true);
  }
  // extrémité de mur la plus proche (30 px à l'écran au plus)
  _extremiteMur(p) {
    const svg = this.R.querySelector(".zone svg"), seuil = (30 * this.carte.vue().W) / (svg?.clientWidth || 1);
    let m = null, dm = seuil;
    for (const s of this.d.murs || []) for (const q of [[+s[0], +s[1]], [+s[2], +s[3]]]) {
      const dd = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (Number.isFinite(dd) && dd <= dm) { dm = dd; m = q; }
    }
    return m;
  }
  _pointCalib(p) {
    const C = this._calib;
    C.msg = "";
    if (C.etape === "A") { C.A = p; C.etape = "B"; }
    else if (C.etape === "B") {
      if (Math.hypot(p[0] - C.A[0], p[1] - C.A[1]) < 1) C.msg = _t("Points trop proches : touche un point plus loin du premier.");
      else { C.B = p; C.etape = "dist"; }
    } else if (C.etape === "M1" || C.etape === "M2") {
      const m = this._extremiteMur(p);
      if (!m) C.msg = _t("Pas d'extrémité de mur ici : touche le bout d'un mur existant (zoome si besoin).");
      else if (C.etape === "M1") { C.M1 = m; C.etape = "M2"; }
      else if (Math.hypot(m[0] - C.M1[0], m[1] - C.M1[1]) < 1) C.msg = _t("Même extrémité que la première : touche l'autre bout.");
      else { C.M2 = m; return this._finirCalib(); }
    }
    this._majCalib();
  }
  _validerDistance() {
    const C = this._calib, V = C?.voile;
    if (!V || C.etape !== "dist") return;
    const n = parseFloat(String(V.querySelector("[data-cal-val]")?.value || "").replace(",", ".")), u = V.querySelector("[data-cal-unite]")?.value === "m" ? 100 : 1;
    C.unite = u === 100 ? "m" : "cm";
    if (!(n > 0)) { C.msg = _t("Saisis la distance réelle, plus grande que 0."); return this._majCalib(); }
    this._finirCalib(n * u);
  }
  // distance (cm) : mise à l'échelle autour de A ; sans distance : A et B posés sur les extrémités M1 et M2 du mur (échelle, rotation, position)
  _finirCalib(dist = null) {
    const C = this._calib, G = C.G, ab = Math.hypot(C.B[0] - C.A[0], C.B[1] - C.A[1]), a = EditeurPlan._versImage(G, C.A);
    let s = dist / ab, rot = G.rot, cible = C.A;
    if (dist == null) {
      s = Math.hypot(C.M2[0] - C.M1[0], C.M2[1] - C.M1[1]) / ab;
      rot = G.rot + ((Math.atan2(C.M2[1] - C.M1[1], C.M2[0] - C.M1[0]) - Math.atan2(C.B[1] - C.A[1], C.B[0] - C.A[0])) * 180) / Math.PI;
      cible = C.M1;
    }
    const w = G.w * s, h = G.h * s;
    if (!(w >= 1) || w > 1e6 || !(h >= 1) || h > 1e6) { C.msg = _t("Résultat hors limites (image de plus de 10 km ou de moins de 1 cm) : vérifie les points et la distance."); if (C.etape !== "dist") C.etape = "dist"; return this._majCalib(); }
    const r1 = (v) => Math.round(v * 10) / 10;
    rot = Math.round(((((rot % 360) + 360) % 360)) * 100) / 100 % 360;
    const N = EditeurPlan._poserSur(a, cible, w, h, rot);
    this.quitterCalibrage(true);
    this.commit(() => {
      const f = this.d.fond;
      if (!f) return;
      f.pos = [r1(N.x), r1(N.y)]; f.largeur = r1(N.w); f.hauteur = r1(N.h);
      if (rot) f.rotation = rot; else delete f.rotation;
    });
    this.ouvrirFond();
    this.snack(_t("Image calibrée : {l} cm de large.", { l: fmt(r1(N.w), 1) }), _t("Annuler"), this._annulation(), 8000);
  }
  // bandeau MD3 (étape, consigne, message) et repères sur le plan
  _majCalib() {
    const C = this._calib, V = C?.voile;
    if (!V) return;
    const mur = C.etape === "M1" || C.etape === "M2";
    const num = { A: "1/3", B: "2/3", dist: "3/3", M1: _t("Mur 1/2"), M2: _t("Mur 2/2") }[C.etape];
    const txt = {
      A: _t("Touche un premier point de l'image dont tu connais la distance à un autre (zoome pour viser juste)."),
      B: _t("Touche le second point, le plus loin possible du premier."),
      dist: _t("Distance réelle entre les deux points :"),
      M1: _t("Touche l'extrémité de mur où doit tomber le point 1."),
      M2: _t("Touche l'extrémité de mur où doit tomber le point 2."),
    }[C.etape];
    const dist = C.etape === "dist" ? `<div class="ed-calib-dist">
        <input type="number" min="0" step="any" inputmode="decimal" data-cal-val aria-label="${_t("Distance réelle")}" value="">
        <select data-cal-unite aria-label="${_t("Unité")}"><option value="cm"${C.unite !== "m" ? " selected" : ""}>cm</option><option value="m"${C.unite === "m" ? " selected" : ""}>m</option></select></div>
      <div class="ed-actions"><button type="button" class="ed-btn texte" data-cal="mur" title="${_t("Poser les deux points sur les extrémités d'un mur existant : l'image est aussi déplacée et tournée.")}"><ha-icon icon="mdi:wall"></ha-icon>${_t("Aligner sur un mur")}</button>
        <button type="button" class="ed-btn plein" data-cal="valider"><ha-icon icon="mdi:check"></ha-icon>${_t("Valider")}</button></div>` : "";
    poserHTML(V, `<style>.ed-voile.ed-calib{position:absolute;inset:8px 8px auto 8px;background:none;display:flex;justify-content:center;padding:0;z-index:6;pointer-events:none}
      ha-card.ed-etroit .ed-voile.ed-calib{position:fixed;inset:auto 8px 136px 8px;z-index:9}
      .ed-calib-bandeau{pointer-events:auto;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;max-width:560px;width:100%;box-sizing:border-box;padding:8px 8px 8px 16px;border-radius:16px;
        background:var(--md-surface-container-high,#ece6f0);color:var(--md-on-surface,#1d1b20);box-shadow:0 2px 6px #0004;font-size:14px;line-height:20px}
      .ed-calib-num{flex:none;font-weight:500;padding:2px 10px;border-radius:8px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
      .ed-calib-texte{flex:1 1 180px;min-width:0}
      .ed-calib-msg{color:var(--md-error,#b3261e);margin-top:2px}
      .ed-calib-bandeau>.ib{flex:none;margin-left:auto}
      .ed-calib-dist{display:flex;gap:8px;flex:1 1 200px}
      .ed-calib-dist input,.ed-calib-dist select{height:40px;box-sizing:border-box;border-radius:8px;border:1px solid var(--md-outline,#79747e);background:var(--md-surface,#fff);color:inherit;font:inherit;padding:0 12px}
      .ed-calib-dist input{flex:1;min-width:0;width:100px}
      .ed-calib-bandeau .ed-actions{flex:1 1 100%;justify-content:flex-end;margin:0;flex-wrap:wrap}</style>
      <div class="ed-calib-bandeau${mur ? " mur" : ""}" role="group" aria-label="${_t("Calibrer l'image de fond")}">
        <span class="ed-calib-num">${esc(num)}</span>
        <div class="ed-calib-texte" role="status" aria-live="polite">${esc(txt)}${C.msg ? `<div class="ed-calib-msg">${esc(C.msg)}</div>` : ""}</div>
        <button type="button" class="ib" data-cal="annuler" title="${_t("Annuler le calibrage (Échap)")}" aria-label="${_t("Annuler le calibrage (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button>
        ${dist}</div>`);
    if (C.etape === "dist") V.querySelector("[data-cal-val]")?.focus({ preventScroll: true });
    this._marquesCalib();
  }
  _marquesCalib() {
    const C = this._calib, svg = this.R.querySelector(".zone svg");
    if (!svg) return;
    svg.querySelector(".ed-calib-marques")?.remove();
    if (!C) return;
    const k = this.carte.vue().W / (svg.clientWidth || 1), g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "ed-calib-marques");
    g.setAttribute("pointer-events", "none");
    const rond = (p, t, coul) => `<circle cx="${p[0]}" cy="${p[1]}" r="${9 * k}" fill="${coul}" stroke="var(--md-surface,#fff)" stroke-width="${2 * k}"/>
      <text x="${p[0]}" y="${p[1]}" dy=".35em" text-anchor="middle" font-size="${11 * k}" font-weight="600" fill="var(--md-on-primary,#fff)">${t}</text>`;
    const trait = (p, q, coul) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${coul}" stroke-width="${2 * k}" stroke-dasharray="${6 * k} ${4 * k}"/>`;
    let h = "";
    if (C.A && C.B) h += trait(C.A, C.B, "var(--md-primary,#6750a4)");
    if (C.M1 && C.M2) h += trait(C.M1, C.M2, "var(--md-tertiary,#7d5260)");
    if (C.A) h += rond(C.A, 1, "var(--md-primary,#6750a4)");
    if (C.B) h += rond(C.B, 2, "var(--md-primary,#6750a4)");
    if (C.M1) h += rond(C.M1, 1, "var(--md-tertiary,#7d5260)");
    poserHTML(g, h);
    svg.append(g);
  }
} // @assemblage
