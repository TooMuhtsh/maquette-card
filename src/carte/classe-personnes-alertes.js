// flux d'énergie, personnes, alertes plein plan — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // ---------- flux d'énergie ----------
  _majFlux() {
    const R = this.shadowRoot, c = this._config, E = coucheEnergie(c.ambiance), g = R?.querySelector(".zone svg .flux");
    if (!E || !g) return;
    const M = c.meubles || [], src = typeof E.source === "number" ? M[E.source] : M.find((m) => m.type === (E.source || "tableau_elec"));
    const l = [], seuil = +(E.seuil ?? 5), couleur = (x) => couleurSure(x);
    const ajoute = (o) => {
      if (!src?.pos || o === src || !Array.isArray(o.pos)) return;
      // puissance : la première de valeur / actif / entite exprimée en W ou kW
      const w = [o.valeur, o.actif, o.entite].map((e) => (typeof e === "string" ? enWatts(this._etat(e)) : null)).find((x) => x != null);
      if (w == null || w < seuil) return;
      l.push({ de: src.pos.map(nb), vers: o.pos.map(nb), w, col: couleur(E.couleur) || couleur(o.couleur) || COULEURS_TYPE[o.type] || "#fbc02d" });
    };
    M.forEach(ajoute);
    if (E.pastilles !== false) (c.points || []).forEach(ajoute);
    const cle = l.map((x) => `${x.vers}|${Math.round(Math.log2(x.w + 1) * 2)}|${x.col}`).join(";");
    if (cle === this._fluxCle) return;
    this._fluxCle = cle;
    const b = this._box;
    poserHTML(g, dessinFlux(l, Math.max(b.W, b.H) * 0.0045, this._sansBoucles()));
  }

  // ---------- personnes ----------
  _listePersonnes(A) {
    const P = couchePersonnes(A);
    if (!P) return [];
    return P.liste || Object.keys(this._hass?.states || {}).filter((e) => e.startsWith("person.")).sort().map((e) => ({ entite: e }));
  }
  _htmlPersonnes(A) {
    const P = couchePersonnes(A);
    return this._listePersonnes(A).map((p) => {
      const s = this._etat(p.entite), nom = s?.attributes.friendly_name || p.entite.split(".")[1], pic = s?.attributes.entity_picture;
      const ini = initiales(nom);
      // `avatar` : photo du profil HA si elle existe, sinon les initiales (défaut) ; `initiales` : toujours les initiales
      const url = affPersonne(P, p.entite).avatar === "photo" && typeof pic === "string" && /^\/(?![/\\])/.test(pic) ? (this._hass.hassUrl ? this._hass.hassUrl(pic) : pic) : null; // photo servie par HA seulement
      return `<button class="pers" data-pers="${esc(p.entite)}" data-e="${esc(p.entite)}" aria-label="${esc(nom)}"><span class="av">${url ? `<img src="${esc(url)}" alt="">` : esc(ini)}</span><small></small></button>`;
    }).join("");
  }
  // point de rassemblement à la maison : `maison` ([x, y] ou nom de pièce), sinon le centre des pièces intérieures
  _pointMaison() {
    const c = this._config, m = couchePersonnes(c.ambiance)?.maison;
    if (Array.isArray(m) && m.length === 2) return m.map(nb);
    const pc = typeof m === "string" ? c.pieces.find((x) => x.nom === m) : null;
    if (pc?.etiquette) return pc.etiquette;
    const l = (pc ? [pc] : c.pieces.filter((p) => !p.dehors && !p.sous_zone)).flatMap((p) => p.poly || []);
    if (!l.length) { const b = this._box; return [b.x0 + b.W / 2, b.y0 + b.H / 2]; }
    const xs = l.map((q) => q[0]), ys = l.map((q) => q[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  // à la maison : côte à côte au point de rassemblement (suit le zoom) ; dehors : au bord du plan, dans la direction réelle
  // (depuis les coordonnées de HA, avec `nord`), grisé, avec la distance ou le nom de la zone ; le passage de l'un à l'autre glisse.
  // Réglages (`dehors`, `chez_soi`, communs ou par personne) : dehors en rangée discrète en bas du plan avec la zone (`zone`),
  // ou caché (`cache`, à la maison comme dehors) : plus dessiné, ni cliquable, ni lu
  _majPersonnes() {
    const R = this.shadowRoot, A = this._config.ambiance, l = [...(R?.querySelectorAll(".calque>.pers[data-pers]") || [])];
    if (!l.length || this._glissePers) return; // pendant un glisser des avatars (éditeur), leur place suit le pointeur
    const q = this.vue(), mz = this._pointMaison(), nord = +A?.nord || 0, cf = this._hass.config || {}, P = couchePersonnes(A);
    const aff = new Map(l.map((el) => [el, affPersonne(P, el.dataset.pers)]));
    const tousChez = l.filter((el) => this._etat(el.dataset.pers)?.state === "home"), tousDehors = l.filter((el) => !tousChez.includes(el));
    const chez = tousChez.filter((el) => aff.get(el).chez_soi !== "cache"), dehors = tousDehors.filter((el) => aff.get(el).dehors === "direction");
    const rangee = tousDehors.filter((el) => aff.get(el).dehors === "zone");
    l.forEach((el) => {
      const s = this._etat(el.dataset.pers), nom = s?.attributes.friendly_name || el.dataset.pers, pt = el.querySelector("small");
      const home = tousChez.includes(el), a = aff.get(el), cache = home ? a.chez_soi === "cache" : a.dehors === "cache";
      el.classList.toggle("dehors", !home);
      el.classList.toggle("inconnu", !s || ["unknown", "unavailable"].includes(s.state));
      el.classList.toggle("cache", cache);
      el.classList.toggle("ailleurs", !home && a.dehors === "zone");
      if (cache) { delete el.dataset.x; delete el.dataset.y; return; }
      if (!home && a.dehors === "zone") {
        // rangée en bas du plan, sans direction ni distance : la zone de HA, ou « Absent » hors de toute zone
        delete el.dataset.x; delete el.dataset.y;
        const txt = !s ? _t("inconnu") : s.state === "not_home" ? _t("Absent") : this._hass.formatEntityState?.(s) ?? s.state;
        el.style.left = "50%"; el.style.top = "100%";
        pt.textContent = txt; el.title = _t("{nom} : {etat}", { nom, etat: txt });
        return;
      }
      if (home) {
        el.dataset.x = mz[0]; el.dataset.y = mz[1];
        el.style.left = `${((mz[0] - q.x0) / q.W) * 100}%`; el.style.top = `${((mz[1] - q.y0) / q.H) * 100}%`;
        el.style.setProperty("--dx", (chez.indexOf(el) - (chez.length - 1) / 2).toFixed(2));
        pt.textContent = ""; el.title = _t("{nom} : à la maison", { nom });
        return;
      }
      delete el.dataset.x; delete el.dataset.y;
      let txt = s ? this._hass.formatEntityState?.(s) ?? s.state : _t("inconnu"), ux = 0, uy = 1;
      const la = parseFloat(s?.attributes.latitude), lo = parseFloat(s?.attributes.longitude);
      if (!isNaN(la) && !isNaN(lo) && cf.latitude != null && cf.longitude != null) {
        const { cap, km } = capDistance(+cf.latitude, +cf.longitude, la, lo), f = ((cap + nord) * Math.PI) / 180;
        ux = Math.sin(f); uy = -Math.cos(f);
        if (s.state === "not_home") txt = km < 10 ? `${fmt(km, 1)} km` : `${Math.round(km)} km`;
      }
      const k = Math.min(Math.abs(ux) > 1e-6 ? 0.44 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.44 / Math.abs(uy) : Infinity);
      el.style.left = `${(50 + ux * k * 100).toFixed(2)}%`; el.style.top = `${(50 + uy * k * 100).toFixed(2)}%`;
      el.style.setProperty("--dx", (dehors.indexOf(el) * 0.5).toFixed(2)); // deux personnes au même endroit : légèrement décalées
      pt.textContent = txt; el.title = _t("{nom} : {etat}", { nom, etat: txt });
    });
    this._rangeePersonnes();
  }
  // rangée du bas (dehors: zone) : puces centrées côte à côte selon leur largeur (recalculé aussi au redimensionnement)
  _rangeePersonnes() {
    const l = [...(this.shadowRoot?.querySelectorAll(".calque>.pers.ailleurs:not(.cache)") || [])];
    if (!l.length) return;
    const g = 8, w = l.map((el) => el.offsetWidth), tot = w.reduce((a, b) => a + b, 0) + g * (l.length - 1);
    let x = -tot / 2;
    l.forEach((el, k) => { el.style.setProperty("--ox", `${(x + w[k] / 2).toFixed(1)}px`); x += w[k] + g; });
  }

  // ---------- alertes plein plan ----------
  _alertesActives() {
    const c = this._config, out = [];
    (Array.isArray(c.alertes) ? c.alertes : []).forEach((r, i) => {
      if (!r || typeof r !== "object" || r.actif === false) return;
      if (r.si_absent && this._quelquun(r.presence) !== false) return;
      const ents = r.type === "ouvertures" ? (c.ouvertures || []).flatMap((o) => [...contactsDe(o), ...(contactsDe(o).length ? [] : [o.entite])]) : [...(Array.isArray(r.entites) ? r.entites : []), r.entite];
      const vide = (v) => v == null || v === "";
      const on = [...new Set(ents.filter((e) => typeof e === "string"))].filter((e) => {
        const s = this._etat(e);
        if (!s) return false;
        const v = parseFloat(s.state);
        if (!vide(r.au_dessus)) return !isNaN(v) && v > +r.au_dessus;
        if (!vide(r.au_dessous)) return !isNaN(v) && v < +r.au_dessous;
        if (!vide(r.etat)) return s.state === String(r.etat);
        return ETATS_ALERTE.includes(s.state);
      });
      const niv = NIVEAUX_ALERTE[r.niveau] ? r.niveau : "critique";
      if (on.length) out.push({ r, on, niv, sig: `${i}|${on.map((e) => `${e}@${this._etat(e).last_changed}`).join(",")}` });
    });
    return out.sort((a, b) => NIVEAUX_ALERTE[b.niv].r - NIVEAUX_ALERTE[a.niv].r);
  }
  // voile coloré qui bat sur tout le plan, bandeau (nom, éléments concernés, détails, masquer jusqu'au prochain changement),
  // éléments concernés entourés d'une onde ; jamais pendant l'édition
  _majAlertes() {
    const R = this.shadowRoot, plan = R?.querySelector(".plan");
    if (!plan) return;
    const l = this._editeur ? [] : this._alertesActives().filter((a) => !this._alertesVues?.has(a.sig));
    R.querySelectorAll(".en-alerte:not(.vit-pt)").forEach((e) => { e.classList.remove("en-alerte"); e.style.removeProperty("--al-c"); });
    let v = plan.querySelector(":scope>.alerte-voile"), bd = plan.querySelector(":scope>.bandeau-al");
    this._alertes = l;
    if (!l.length) { v?.remove(); bd?.remove(); return; }
    const COUL = { critique: "var(--md-error)", alerte: "var(--warning-color,#f4b400)", info: "var(--md-primary)" }, a0 = l[0];
    if (!v) { v = document.createElement("div"); plan.append(v); }
    if (!bd) { bd = document.createElement("div"); bd.setAttribute("role", "alert"); plan.append(bd); }
    v.className = `alerte-voile ${a0.niv}`; bd.className = `bandeau-al ${a0.niv}`;
    plan.style.setProperty("--al-c", COUL[a0.niv]);
    const nomDe = (e) => { const o = (this._config.ouvertures || []).find((x) => contactsDe(x).includes(e) || (!contactsDe(x).length && x.entite === e)); return o?.baie || o?.nom || this._nom(e); };
    const html = `<ha-icon icon="${esc(a0.r.icone || NIVEAUX_ALERTE[a0.niv].icone)}"></ha-icon><span class="t"><b>${esc(a0.r.nom || _t("Alerte"))}</b>
      <small>${esc([...new Set(a0.on.map(nomDe))].join(", "))}${l.length > 1 ? _t(" · {n} autre alerte| · {n} autres alertes", { n: l.length - 1 }) : ""}</small></span>
      <button class="ib" data-al="infos" title="${_t("Détails")}" aria-label="${_t("Détails")}"><ha-icon icon="mdi:information-outline"></ha-icon></button>
      <button class="ib" data-al="masquer" title="${_t("Masquer jusqu'au prochain changement")}" aria-label="${_t("Masquer")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (bd._h !== html) { poserHTML(bd, html); bd._h = html; }
    for (const a of l) for (const e of a.on) {
      const els = [...R.querySelectorAll(".zone [data-e]")].filter((x) => x.dataset.e === e && !x.classList.contains("etq") && !x.classList.contains("pers"));
      (this._config.meubles || []).forEach((m, i) => { if (m.entite === e || m.valeur === e) els.push(R.querySelector(`.calque>[data-mbq="${i}"]`)); });
      // ouverture à plusieurs capteurs : entourée aussi quand c'est un autre que le premier qui est ouvert
      (this._config.ouvertures || []).forEach((o, i) => { if (contactsDe(o).length > 1 && contactsDe(o).includes(e)) els.push(R.querySelector(`.zone svg [data-o="${i}"]`)); });
      for (const x of els) if (x && !x.classList.contains("en-alerte")) { x.classList.add("en-alerte"); x.style.setProperty("--al-c", COUL[a.niv]); }
    }
  }
  _actionAlerte(k) {
    const a = this._alertes?.[0];
    if (!a) return;
    if (k === "infos") return this._plusInfos(a.on[0]);
    (this._alertesVues ||= new Set()).add(a.sig);
    this._majAlertes();
  }

} // @assemblage
