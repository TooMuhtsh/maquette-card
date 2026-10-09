// étages (L2) : toute la maison (résumé, alertes, pastilles d'étage) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // ---------- toute la maison : résumé, alertes et pastilles comptent tous les étages, pas seulement l'affiché ----------
  // étages de la maison (ETAGES.parEtage), l'affiché d'abord : un élément présent sur deux étages (lumière d'escalier) revient
  // à l'étage affiché. Sans étages : un seul, id null, avec les listes de la config (résumé et alertes identiques à avant).
  _maisonEtages() {
    const E = parEtage(this._config), ici = this._etageAffiche?.() ?? null;
    return [...E.filter((e) => e.id === ici), ...E.filter((e) => e.id !== ici)];
  }
  _plusieursEtages() { return parEtage(this._config).filter((e) => e.id != null).length > 1; }

  // entités portées par les éléments d'un étage (pièces, ouvertures, pastilles, meubles, zones d'infos)
  _entitesEtage(E) {
    const G = E.geo, s = new Set();
    for (const p of G.pieces) s.add(p?.temperature).add(p?.humidite);
    for (const o of G.ouvertures) { for (const e of contactsDe(o)) s.add(e); s.add(o?.entite).add(o?.volet); }
    for (const p of [...G.points, ...G.meubles]) s.add(p?.entite).add(p?.actif).add(p?.valeur);
    for (const t of G.textes) for (const x of Array.isArray(t?.infos) ? t.infos : []) s.add(x?.entite);
    s.delete(undefined); s.delete(null);
    return s;
  }
  // étage d'une entité qui n'est PAS sur l'étage affiché (null si elle y est, ou si la maison n'a qu'un étage)
  _etageAilleurs(ent) {
    if (!this._plusieursEtages()) return null;
    const ici = this._etageAffiche();
    for (const E of this._maisonEtages()) if (this._entitesEtage(E).has(ent)) return E.id === ici ? null : E;
    return null;
  }

  // résumé de toute la maison : ouvertures ouvertes (un nom par baie et par étage), lumières allumées, volets baissés,
  // températures intérieures ; chaque élément garde son étage, son genre, son rang dans l'étage et son centre (aller à l'élément).
  // Une entité déjà comptée sur un autre étage (l'affiché passe d'abord) ne l'est pas deux fois.
  _resumeMaison() {
    const r = { ouvertures: [], lumieres: [], volets: [], temperature: [] }, vus = { o: new Set(), l: new Set(), t: new Set() }, voletsVus = new Set();
    const milieu = (s) => (Array.isArray(s) && s.length >= 4 ? [(nb(s[0]) + nb(s[2])) / 2, (nb(s[1]) + nb(s[3])) / 2] : null);
    for (const E of this._maisonEtages()) {
      const G = E.geo, et = E.id, noms = new Set(), ici = { o: [], l: [], t: [] };
      G.ouvertures.forEach((o, i) => {
        const ent = entOuv(o), s = ent ? this._etatOuverture(o) : null;
        if (ent && s && (s.state === "on" || s.state === "open")) {
          const cles = contactsDe(o).length ? contactsDe(o) : [o.entite], n = o.baie || o.nom || this._nom(ent);
          ici.o.push(...cles);
          if (!cles.every((e) => vus.o.has(e)) && !noms.has(n)) { noms.add(n); r.ouvertures.push({ etage: et, genre: "ouverture", i, nom: n, ent, centre: milieu(o.seg) }); }
        }
        if (o.volet) {
          const sv = this._etat(o.volet);
          let pos = sv ? sv.attributes.current_position : undefined;
          if (pos == null && sv) pos = sv.state === "closed" ? 0 : 100;
          if (pos != null && pos < 50 && !voletsVus.has(o.volet)) r.volets.push({ etage: et, genre: "ouverture", i, nom: o.baie || o.nom || this._nom(o.volet), ent: o.volet, val: pos + globalThis.MaquetteI18n.pct(), centre: milieu(o.seg) });
          voletsVus.add(o.volet);
        }
      });
      G.points.forEach((p, i) => {
        if (!(p?.entite || "").startsWith("light.") || !this._actif(p)) return;
        ici.l.push(p.entite);
        if (!vus.l.has(p.entite)) r.lumieres.push({ etage: et, genre: "point", i, nom: p.nom || this._nom(p.entite), ent: p.entite, centre: Array.isArray(p.pos) ? p.pos.map(nb) : null });
      });
      G.pieces.forEach((p, i) => {
        const t = this._num(p.temperature, p.attribut_temperature);
        if (p.sous_zone || t == null || p.dehors) return;
        ici.t.push(p.temperature);
        if (!vus.t.has(p.temperature)) r.temperature.push({ etage: et, genre: "piece", i, nom: p.nom, ent: p.temperature, t, val: `${fmt(t)} °C`, centre: this._centrePiece(p) });
      });
      for (const k of ["o", "l", "t"]) for (const e of ici[k]) vus[k].add(e);
    }
    return r;
  }
  _centrePiece(p) {
    if (Array.isArray(p?.etiquette)) return p.etiquette.map(nb);
    const l = Array.isArray(p?.poly) ? p.poly : [];
    if (!l.length) return null;
    const xs = l.map((q) => nb(q[0])), ys = l.map((q) => nb(q[1]));
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }

  // pastilles des boutons d'étage (sélecteur L1), pour les étages NON affichés : rouge = une alerte active (non masquée) touche
  // un élément de l'étage ; ambre = une ouverture ouverte ou une pastille `alert` allumée. Rien en édition ni à un seul étage.
  _pastillesEtages() {
    const L = this._maisonEtages().filter((e) => e.id != null);
    if (L.length < 2 || this._editeur) return {};
    const ici = this._etageAffiche(), S = new Map(L.map((e) => [e.id, this._entitesEtage(e)])), surIci = S.get(ici) || new Set(), out = {};
    const autres = L.filter((e) => e.id !== ici);
    for (const a of this._alertesActives().filter((x) => !this._alertesVues?.has(x.sig)))
      for (const ent of a.on) if (!surIci.has(ent)) for (const e of autres) if (S.get(e.id).has(ent)) out[e.id] = "rouge";
    for (const x of this._resumeMaison().ouvertures) if (x.etage !== ici && !out[x.etage]) out[x.etage] = "ambre";
    for (const e of autres) if (!out[e.id] && e.geo.points.some((p) => p?.alerte && !surIci.has(p.entite) && this._actif(p))) out[e.id] = "ambre";
    return out;
  }
  // pastilles tenues à jour à chaque changement d'état (le sélecteur n'est redessiné qu'à la construction)
  _majPastillesEtages() {
    const l = this.shadowRoot?.querySelectorAll(".etages [data-etage]");
    if (!l?.length) return;
    const P = this._pastillesEtages();
    l.forEach((b) => { const s = b.querySelector(".et-pastille"), p = P[b.dataset.etage]; if (s) s.className = `et-pastille${p ? ` ${p}` : ""}`; });
  }

  // ---------- détail d'une puce du résumé (ouvertures, lumières, volets, température) : liste groupée par étage ----------
  static TITRES_DETAIL = { ouvertures: _tk("Ouvertures ouvertes"), lumieres: _tk("Lumières allumées"), volets: _tk("Volets baissés"), temperature: _tk("Températures") };
  static ICONES_DETAIL = { ouvertures: "mdi:window-open-variant", lumieres: "mdi:lightbulb-on", volets: "mdi:window-shutter", temperature: "mdi:thermometer" };
  static CSS_DETAIL = `.det-maison{position:absolute;top:8px;z-index:6;min-width:220px;max-width:min(320px,calc(100% - 16px));max-height:min(360px,70vh);overflow:auto;
padding:8px 0;border-radius:4px;background:var(--md-surface-container);color:var(--md-on-surface);box-shadow:0 2px 6px 2px rgba(0,0,0,.15),0 1px 2px rgba(0,0,0,.3)}
.det-maison .t{padding:4px 16px 8px;color:var(--md-on-surface-variant);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.det-maison .g{padding:8px 16px 4px;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.det-maison button{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 16px 0 12px;border:0;background:none;color:inherit;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);text-align:left;cursor:pointer}
.det-maison button:hover,.det-maison button:focus-visible{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent);outline:none}
.det-maison button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.det-maison button small{color:var(--md-on-surface-variant);font-size:12px}
.det-maison ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}`;

  // clic sur une puce du résumé (hors édition, puces sans entité) : son détail
  _brancherResume() {
    const tete = this.shadowRoot?.querySelector(".tete");
    if (!tete || tete._maison) return;
    tete._maison = true;
    tete.addEventListener("click", (ev) => {
      if (this._editeur) return;
      const pu = ev.composedPath().find((n) => n.dataset?.puce != null);
      if (pu && pu.dataset.e == null) this._detailPuce(+pu.dataset.puce, pu);
    });
  }
  _detailPuce(i, puce) {
    const R = this.shadowRoot, plan = R.querySelector(".plan"), type = this._puces()[i]?.type;
    const ouvert = plan.querySelector(":scope>.det-maison");
    this._fermerDetail();
    if (ouvert?._puce === i || !MaquetteCard.TITRES_DETAIL[type]) return;
    const l = this._resumeMaison()[type];
    if (!l.length) return;
    if (!R.querySelector("style[data-maison]")) { const st = document.createElement("style"); st.dataset.maison = ""; st.textContent = MaquetteCard.CSS_DETAIL; R.append(st); }
    const plus = this._plusieursEtages(), E = parEtage(this._config), ic = MaquetteCard.ICONES_DETAIL[type];
    // groupes dans l'ordre des étages (du bas vers le haut), titre d'étage seulement s'il y en a plusieurs
    const groupes = plus ? E.map((e) => ({ e, l: l.filter((x) => x.etage === e.id) })).filter((g) => g.l.length) : [{ e: null, l }];
    const d = document.createElement("div");
    d.className = "det-maison"; d._puce = i; d._l = l;
    d.setAttribute("role", "dialog"); d.setAttribute("aria-label", _t(MaquetteCard.TITRES_DETAIL[type]));
    poserHTML(d, `<div class="t">${esc(_t(MaquetteCard.TITRES_DETAIL[type]))}</div>${groupes.map((g) => (g.e ? `<div class="g">${esc(g.e.nom || g.e.court)}</div>` : "")
      + g.l.map((x) => `<button type="button" data-aller="${l.indexOf(x)}"><ha-icon icon="${ic}"></ha-icon><span>${esc(x.nom)}</span>${x.val ? `<small>${esc(x.val)}</small>` : ""}</button>`).join("")).join("")}`);
    d.addEventListener("click", (ev) => {
      ev.stopPropagation(); // jamais jusqu'aux clics du plan
      const b = ev.composedPath().find((n) => n.dataset?.aller != null);
      if (b) this._allerElement(l[+b.dataset.aller]);
    });
    d.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._fermerDetail(); } });
    this._horsDetail = (ev) => { if (!ev.composedPath().some((n) => n === d || n === puce)) this._fermerDetail(); };
    window.addEventListener("pointerdown", this._horsDetail, true);
    const rp = plan.getBoundingClientRect(), rc = puce.getBoundingClientRect();
    plan.append(d);
    d.style.left = `${Math.max(8, Math.min(rc.left - rp.left, rp.width - d.offsetWidth - 8))}px`;
    d.querySelector("button")?.focus();
  }
  _fermerDetail() {
    this.shadowRoot?.querySelector(".plan>.det-maison")?.remove();
    if (this._horsDetail) window.removeEventListener("pointerdown", this._horsDetail, true);
    this._horsDetail = null;
  }
  // aller à l'élément : sur un autre étage, l'étage change et la vue se centre dessus ; puis le comportement habituel du toucher
  // (vue de la pièce, fiche de l'ouverture ou de la pastille, sinon « plus d'infos »)
  _allerElement(x) {
    this._fermerDetail();
    if (!x) return;
    const piece = x.genre === "piece", vue = piece && interactionDe(this._config).clic === "vue";
    if (x.etage != null && x.etage !== this._etageAffiche()) this._changerEtage(x.etage, vue ? {} : { centrer: x.centre });
    if (piece) {
      const p = this._config.pieces[x.i];
      if (!p || p.zoom === false) return;
      if (vue) return this.isoler(x.i);
      if (interactionDe(this._config).clic === "infos") this._plusInfos(p.clic || p.temperature);
      return;
    }
    if (!this._clicPorteur(x.genre, x.i)) this._plusInfos(x.ent);
  }
} // @assemblage
