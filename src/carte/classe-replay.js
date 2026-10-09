// replay de la journée, vitrine, traces — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // ---------- replay de la journée (`replay: true` ou {heures}) ----------
  // l'historique de toutes les entités suivies est chargé une fois (attributs pour les volets, le soleil, la météo, les personnes),
  // puis le plan entier (couleurs, ouvertures, volets, lumières, ambiance, personnes, alertes, panneaux) est rendu à l'instant choisi.
  // Étages : un seul chargement pour toute la maison ; changer d'étage pendant la lecture garde l'heure (l'étage affiché montre ses
  // états à l'instant t, pastilles d'étage du sélecteur comprises)
  async _replayOuvrir() {
    if (this._rp || this._editeur) return;
    const c = this._config, h = borne(+(c.replay?.heures ?? 24) || 24, 1, 72), fin = Math.ceil(Date.now() / 60000) * 60000, debut = fin - h * 3600e3; // calé sur la minute
    const rp = (this._rp = { debut, fin, t: debut, vitesse: vitesseReplay(c.replay), lecture: false, pret: false, series: {}, cache: new Map() });
    this._barreReplay(_t("Chargement de l'historique…"));
    const ents = this._rpEntites().filter((e) => !e.startsWith("zone.") || e === "zone.home" || e === presenceDefaut(c));
    const avecAttr = ents.filter((e) => /^(cover|sun|weather|person|climate|media_player)\./.test(e)), sans = ents.filter((e) => !avecAttr.includes(e));
    // entités à attributs : réponse complète (sans `minimal_response`, HA ne renverrait les attributs que pour le premier état et
    // écarterait les changements d'attributs seuls : soleil, position d'un volet, personne, vent) ; les autres : états seuls, réponse minimale
    const lire = (l, attrs) => (l.length ? this._hass.callWS({ type: "history/history_during_period", start_time: new Date(debut).toISOString(), end_time: new Date(fin).toISOString(),
      entity_ids: l, minimal_response: !attrs, no_attributes: !attrs, significant_changes_only: !attrs }) : Promise.resolve({}));
    try {
      const [a, b] = await Promise.all([lire(avecAttr, true), lire(sans, false)]);
      if (this._rp !== rp) return;
      for (const [e, l] of Object.entries({ ...b, ...a })) {
        let attrs = {}, prec = null;
        rp.series[e] = (l || []).map((x) => {
          if (x.a) attrs = x.a;
          const lu = (x.lu ?? x.lc ?? 0) * 1000, lc = x.lc != null ? x.lc * 1000 : !prec || prec.s !== x.s ? lu : prec.lc;
          return (prec = { s: x.s, a: attrs, lu, lc });
        });
      }
      rp.pret = true;
      rp.t = fin - Math.min(2, h) * 3600e3; // on démarre 2 h avant maintenant
      this._barreReplay();
      this._rendreReplay();
    } catch (err) {
      if (this._rp === rp) this._barreReplay(_t("Historique indisponible : {msg}", { msg: err?.message || err }));
    }
  }
  // entités suivies de tous les étages : celles de l'étage affiché (déjà toute la maison pour le plan, le résumé et les alertes),
  // plus les panneaux propres et les fiches des autres étages, lus étage par étage sur la config dépliée
  _rpEntites() {
    const P = this._plein, ids = idsEtages(P), c0 = this._config, s = new Set(this._suivies || []);
    if (ids.length < 2) return [...s];
    try {
      for (const id of ids) if (id !== this._etageAffiche()) { this._config = deplier(P, id); for (const e of this._entites()) s.add(e); }
    } finally { this._config = c0; }
    return [...s];
  }
  _rpEtat(e) {
    const rp = this._rp, l = rp.series[e];
    if (!l?.length) return undefined;
    if (rp.cache.has(e)) return rp.cache.get(e);
    let a = 0, b = l.length - 1, k = -1;
    while (a <= b) { const m = (a + b) >> 1; if (l[m].lu <= rp.t) { k = m; a = m + 1; } else b = m - 1; }
    const x = l[Math.max(0, k)], iso = (t) => new Date(t).toISOString();
    // historique chargé sans attributs (capteurs, lumières…) : nom, unité, classe et icône repris de l'état actuel
    const live = this._hass.states[e]?.attributes || {}, fixes = {};
    for (const n of ATTRS_FIXES) if (live[n] != null) fixes[n] = live[n];
    const v = { entity_id: e, state: x.s, attributes: { ...fixes, ...x.a }, last_changed: iso(x.lc), last_updated: iso(x.lu) };
    rp.cache.set(e, v);
    return v;
  }
  _rendreReplay() {
    const rp = this._rp;
    if (!rp?.pret || this._rpRaf) return;
    this._rpRaf = requestAnimationFrame(() => {
      this._rpRaf = 0;
      if (this._rp !== rp) return;
      rp.cache.clear();
      this._maj();
      this._majBarreReplay();
    });
  }
  _actionReplay(k) {
    const rp = this._rp;
    if (!rp) return;
    if (k === "direct") return this._replayFermer();
    if (k === "lecture" && rp.pret) {
      rp.lecture = !rp.lecture;
      if (rp.lecture && rp.t >= rp.fin) rp.t = rp.debut;
      clearInterval(rp.tm);
      if (rp.lecture) rp.tm = setInterval(() => {
        rp.t = Math.min(rp.fin, rp.t + 100 * rp.vitesse);
        if (rp.t >= rp.fin) { rp.lecture = false; clearInterval(rp.tm); }
        this._rendreReplay();
      }, 100);
      this._majBarreReplay();
    }
  }
  _replayFermer() {
    const rp = this._rp;
    if (!rp) return;
    clearInterval(rp.tm);
    this._rp = null;
    const R = this.shadowRoot;
    R?.querySelector(".plan>.replay")?.remove();
    R?.querySelector(".plan")?.classList.remove("en-replay");
    R?.querySelector('[data-z="replay"]')?.classList.remove("on");
    this._prec = {};
    this._change();
    this._maj();
  }
  // frise : lecture / pause, curseur à la minute près, heure affichée, vitesse, repères (ouvertures, lumières, personnes), retour au direct
  _barreReplay(msg) {
    const R = this.shadowRoot, plan = R.querySelector(".plan"), rp = this._rp;
    let bar = plan.querySelector(":scope>.replay");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "replay";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", _t("Revoir la journée"));
      plan.append(bar);
    }
    plan.classList.add("en-replay");
    R.querySelector('[data-z="replay"]')?.classList.add("on");
    const fermer = `<button class="ib" data-rp="direct" title="${_t("Revenir au direct")}" aria-label="${_t("Revenir au direct")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (msg || !rp.pret) { poserHTML(bar, `<ha-icon icon="mdi:history"></ha-icon><span class="rp-msg">${esc(msg || _t("Chargement…"))}</span>${fermer}`); return; }
    const n = Math.round((rp.fin - rp.debut) / 60000);
    rp.etageFrise = this._etageAffiche();
    poserHTML(bar, `<button class="ib" data-rp="lecture" title="${_t("Lecture")}" aria-label="${_t("Lecture")}"><ha-icon icon="mdi:play"></ha-icon></button>
      <div class="rp-piste"><div class="rp-marques" aria-hidden="true">${this._marquesReplay()}</div><input type="range" min="0" max="${n}" step="1" aria-label="${_t("Moment de la journée")}"></div>
      <span class="rp-heure"></span>
      <select aria-label="${_t("Vitesse")}">${VITESSES_REPLAY.map(([v, t]) => `<option value="${v}" ${v === rp.vitesse ? "selected" : ""}>${t}</option>`).join("")}</select>${fermer}`);
    const r = bar.querySelector("input");
    r.oninput = () => { rp.t = rp.debut + +r.value * 60000; this._rendreReplay(); };
    r.onpointerdown = () => { rp.tient = true; };
    r.onpointerup = r.onpointercancel = () => { rp.tient = false; };
    bar.querySelector("select").onchange = (ev) => { rp.vitesse = +ev.target.value; };
    this._majBarreReplay();
  }
  // repères de la frise (ouvertures ouvertes, lumières allumées, arrivées) : ceux de l'étage affiché pleins, ceux des autres étages
  // estompés (classe `autre`) ; une entité présente sur deux étages (lumière d'escalier) compte pour l'étage affiché.
  // Sans étages : un seul étage, aucun repère estompé (frise identique).
  _marquesReplay() {
    const rp = this._rp, c = this._config, ici = this._etageAffiche(), marques = [], vus = new Set();
    const pos = (t) => (((t - rp.debut) / (rp.fin - rp.debut)) * 100).toFixed(2);
    const ajoute = (e, test, cls) => {
      if (vus.has(`${cls}|${e}`)) return;
      vus.add(`${cls}|${e}`);
      let p = null;
      for (const x of rp.series[e] || []) { if (x.lu >= rp.debut && test(x.s) && !(p && test(p.s))) marques.push(`<i class="${cls}" style="left:${pos(x.lu)}%"></i>`); p = x; }
    };
    const E = parEtage(c);
    for (const et of [...E.filter((x) => x.id === ici), ...E.filter((x) => x.id !== ici)]) {
      const autre = et.id != null && et.id !== ici ? " autre" : "";
      for (const o of et.geo.ouvertures) for (const e of contactsDe(o).length ? contactsDe(o) : [o?.entite].filter(Boolean)) ajoute(e, (v) => v === "on" || v === "open", `m-ouv${autre}`);
      for (const p of et.geo.points) if ((p?.entite || "").startsWith("light.")) ajoute(p.entite, (v) => v === "on", `m-lum${autre}`);
    }
    // repères d'arrivée (toute la maison) : pas pour une personne cachée à la maison comme dehors (elle n'apparaît jamais sur le plan)
    const PP = couchePersonnes(c.ambiance);
    for (const p of this._listePersonnes(c.ambiance)) { const a = affPersonne(PP, p.entite); if (a.dehors !== "cache" || a.chez_soi !== "cache") ajoute(p.entite, (v) => v === "home", "m-pers"); }
    return marques.join("");
  }
  // étage changé pendant le replay (lecture ou pause) : repères redessinés pour le nouvel étage affiché, l'heure ne bouge pas
  _majFriseEtage() {
    const rp = this._rp, m = rp?.pret && this.shadowRoot?.querySelector(".plan>.replay .rp-marques");
    if (!m || rp.etageFrise === this._etageAffiche()) return;
    rp.etageFrise = this._etageAffiche();
    poserHTML(m, this._marquesReplay());
  }
  _majBarreReplay() {
    const rp = this._rp, bar = this.shadowRoot?.querySelector(".plan>.replay");
    if (!rp?.pret || !bar) return;
    this._majFriseEtage();
    const r = bar.querySelector("input"), h = bar.querySelector(".rp-heure"), b = bar.querySelector('[data-rp="lecture"]');
    if (r && !rp.tient) r.value = String(Math.round((rp.t - rp.debut) / 60000)); // curseur tenu au doigt : on ne le bouscule pas
    const d = new Date(rp.t), auj = new Date().toDateString() === d.toDateString();
    if (h) h.textContent = `${auj ? "" : d.toDateString() === new Date(Date.now() - 864e5).toDateString() ? `${_t("hier")} ` : `${d.toLocaleDateString(_loc(), { day: "2-digit", month: "2-digit" })} `}${d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" })}`;
    if (b) { b.querySelector("ha-icon").setAttribute("icon", rp.lecture ? "mdi:pause" : "mdi:play"); b.title = rp.lecture ? _t("Pause") : _t("Lecture"); b.setAttribute("aria-label", b.title); }
  }

  // ---------- vitrine : exemples d'animations et d'ambiance sous le plan ----------
  _vitrine(pct, xy) {
    const c = this._config, g = geoVitrine(c, this.bornes(true)), fixe = this._sansBoucles();
    const nuage = (id) => `<radialGradient id="${id}"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>`;
    let svg = `<g class="vitrine" aria-hidden="true"><defs><linearGradient id="vit-dore"><stop offset="0" stop-color="#ffb74d" stop-opacity=".75"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient></defs>
      <rect class="vit-fond" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.H}" rx="${(g.th * 0.4).toFixed(0)}"/>`, html = "";
    const etq = (x, y, t, cls = "") => { html += `<span class="txt vit${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])}">${esc(t)}</span>`; };
    const pt = (x, y, cls, style, ic) => { html += `<span class="pt vit-pt ${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])};${style}"><ha-icon icon="${ic}"></ha-icon></span>`; };
    const cx0 = g.x + g.w / 2;
    // 1. animations : fenêtre ouverte et pastille active, pour chaque type
    let y = g.y + g.th;
    etq(cx0, g.y + g.th * 0.55, _t("Animations (fenêtre ouverte, pastille active)"), " titre-v");
    Object.keys(ANIMATIONS).forEach((t, k) => {
      const cx = g.x + g.ca * (k + 0.5), y1 = y + g.ha * 0.16, a = { type: t, duree: t === "defilement" ? 0.8 : 1.6 }, dx = g.ca * 0.32;
      svg += `<g class="ouv fenetre ouvert${classeAnim(a)}" style="${styleAnim(a)}"><path class="cible" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/><path class="trait" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/></g>`;
      pt(cx, y + g.ha * 0.52, `actif${classeAnim(a)}`, `--pt-couleur:#f6c445;${styleAnim(a)}`, "mdi:lightbulb-on-outline");
      etq(cx, y + g.ha * 0.88, _t(ANIMATIONS[t]).split(" (")[0]);
    });
    // 2. météo : un carré d'extérieur par temps
    y += g.ha + g.th;
    etq(cx0, y - g.th * 0.45, _t("Météo sur les extérieurs"), " titre-v");
    const carre = (k, rangee) => { const x = g.x + g.cm * k + g.cm * 0.06, w = g.cm * 0.88; return { x, w, b: { x0: x, y0: rangee, W: w, H: g.hm } }; };
    VITRINE_METEO.forEach(([cond, nom], k) => {
      const { x, w, b } = carre(k, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`;
      svg += `<defs>${nuage(`vit${k}-nuage`)}<clipPath id="vit-c${k}"><rect ${r}/></clipPath></defs><g clip-path="url(#vit-c${k})"><rect class="vit-dehors" ${r}/>
        ${dessinMeteo({ state: cond, attributes: { wind_speed: cond === "windy" ? 40 : 15, wind_bearing: 300, wind_speed_unit: "km/h", cloud_coverage: cond === "partlycloudy" ? 100 : undefined } }, b, 0, 1.6, fixe, `vit${k}`, borne(g.cm / 300, 0.3, 1))}</g>`;
      etq(x + w / 2, y + g.hm + g.th * 0.45, _t(nom));
    });
    // 3. ambiance : nuit, soleil bas, trace, flux d'énergie, alerte, personne dehors
    y += g.hm + g.th * 1.4;
    etq(cx0, y - g.th * 0.45, _t("Ambiance"), " titre-v");
    // personne dehors : comme la réglera le plan (direction et distance, ou zone) ; absente de la vitrine si les personnes dehors sont cachées
    const ap = affPersonne(couchePersonnes(c.ambiance), "");
    VITRINE_AMB.filter(([t]) => t !== "personne" || ap.dehors !== "cache").forEach(([t, nom], k) => {
      const { x, w } = carre(k + 1, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`, mx = x + w / 2, my = y + g.hm / 2;
      svg += `<rect class="vit-dehors" ${r}/>`;
      if (t === "nuit") svg += `<rect ${r} fill="#0b1d4d" opacity=".55"/>`;
      if (t === "dore") svg += `<rect ${r} fill="url(#vit-dore)" opacity=".8"/>`;
      if (t === "trace") pt(mx, my, "trace", "--t:.85", "mdi:door-open");
      if (t === "flux") svg += `<circle cx="${(x + w * 0.15).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/><circle cx="${(x + w * 0.85).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/>`
        + dessinFlux([{ de: [x + w * 0.15, my], vers: [x + w * 0.85, my], w: 900, col: "#fbc02d" }], g.hm * 0.035, fixe);
      if (t === "alerte") pt(mx, my, "en-alerte", "--al-c:var(--md-error)", "mdi:alarm-light");
      if (t === "personne") html += `<span class="pers dehors vit-pt" ${xy([+mx.toFixed(1), +my.toFixed(1)])} style="${pct([mx, my])}"><span class="av">A</span><small>${ap.dehors === "zone" ? _t("Absent") : "12 km"}</small></span>`;
      etq(mx, y + g.hm + g.th * 0.45, _t(nom));
    });
    return { svg: `${svg}</g>`, html };
  }

  // traces : les éléments qui viennent de changer gardent un liseré qui s'estompe sur `traces` minutes (10 par défaut) ;
  // capteurs numériques exclus (ils changent sans cesse) ; un redémarrage de HA (beaucoup d'entités changées ensemble) est ignoré
  _majTraces() {
    const R = this.shadowRoot, c = this._config, tr = !this._editeur && coucheTraces(c.ambiance);
    if (!R) return;
    if (this._rp) this._majFriseEtage(); // replay : un changement d'étage en pause reconstruit le plan sans passer par la frise
    if (!tr) { R.querySelectorAll(".zone .trace:not(.vit-pt)").forEach((e) => { e.classList.remove("trace"); e.style.removeProperty("--t"); }); return; }
    const l = [];
    (c.ouvertures || []).forEach((o, i) => l.push([R.querySelector(`.zone svg [data-o="${i}"]`), contactsDe(o).length > 1 ? o : entOuv(o) || o.volet]));
    (c.points || []).forEach((p, i) => l.push([R.querySelector(`.calque>[data-q="${i}"]`), p.entite]));
    (c.meubles || []).forEach((m, i) => l.push([R.querySelector(`.calque>[data-mbq="${i}"]`), m.entite]));
    const t = l.map(([el, e]) => { const s = !el ? null : e && typeof e === "object" ? this._etatOuverture(e) : typeof e === "string" && !/^(sensor|weather|sun|zone)\./.test(e) ? this._etat(e) : null; return s && !["unavailable", "unknown"].includes(s.state) ? Date.parse(s.last_changed) : NaN; });
    const paquets = {}, ok = t.filter((x) => !isNaN(x));
    for (const x of ok) paquets[Math.round(x / 10000)] = (paquets[Math.round(x / 10000)] || 0) + 1;
    const seuil = Math.max(5, ok.length * 0.4), maint = this._maintenant(), d = tr.duree * 60000;
    l.forEach(([el], j) => {
      if (!el) return;
      const age = Math.max(0, maint - t[j]), oui = !isNaN(t[j]) && maint - t[j] > -60000 && age < d && paquets[Math.round(t[j] / 10000)] < seuil;
      el.classList.toggle("trace", oui);
      if (oui) el.style.setProperty("--t", (1 - age / d).toFixed(3)); else el.style.removeProperty("--t");
    });
  }

} // @assemblage
