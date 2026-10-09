// mode édition, aperçu, résumé (puces), états, mise à jour du plan (_maj), zones d'infos — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  set preview(v) { this._preview = v; this._majCrayon(); }
  get preview() { return this._preview; }
  set editMode(v) { this._editMode = v; this._majCrayon(); }
  get editMode() { return this._editMode; }
  _majCrayon() {
    const b = this.shadowRoot?.querySelector(".editer");
    if (b && this._config) b.hidden = !!this._editeur || this._config.edition === false || !this._hass?.user?.is_admin || this._apercu();
  }

  // aperçu du sélecteur de cartes ou dashboard en mode édition de HA : pas d'éditeur (HA réécrirait la config par-dessus)
  _apercu() {
    if (this._preview || this._editMode) return true;
    for (let n = this; n; ) {
      if (/^(hui-card-preview|hui-card-picker|hui-dialog-edit-card|hui-card-options|hui-card-edit-mode)$/i.test(n.tagName || "")) return true;
      n = n.parentElement || n.getRootNode?.().host || null;
    }
    return false;
  }

  // puces du résumé : liste personnalisée (`resume`), sinon les quatre puces d'origine
  _puces() {
    const r = this._config.resume;
    if (Array.isArray(r)) return r;
    return r === false ? [] : MaquetteCard.PUCES.map((p) => ({ ...p }));
  }

  // en replay, l'état d'une entité à l'instant choisi (historique), sinon l'état en direct
  _etat(e) { if (!e) return undefined; const r = this._rp?.pret ? this._rpEtat(e) : undefined; return r ?? this._hass.states[e]; }
  _maintenant() { return this._rp?.pret ? this._rp.t : Date.now(); }
  // état d'une ouverture : son contact, l'état combiné de ses contacts (ouverte dès que l'un l'est), ou son entité motorisée
  _etatOuverture(o) { const l = contactsDe(o); return l.length > 1 ? etatCombine(l.map((e) => this._etat(e))) : this._etat(l[0] || o?.entite); }
  _nom(e) { const s = this._etat(e); return s ? s.attributes.friendly_name || e : e; }
  _num(e, attr) { const s = this._etat(e); const v = s ? parseFloat(attr ? s.attributes[attr] : s.state) : NaN; return isNaN(v) ? null : v; }
  // « actif » d'une pastille (ou d'un meuble connecté) : état de `actif` (ou de l'entité), d'un attribut, ou au-dessus d'un seuil
  _actif(p) {
    const sa = this._etat(p.actif || p.entite), va = sa ? (p.actif_attribut ? sa.attributes[p.actif_attribut] : sa.state) : undefined;
    return va != null && (p.seuil != null && p.seuil !== "" ? parseFloat(va) > p.seuil : ACTIFS.has(va));
  }
  // valeur affichée : un attribut de l'entité, ou l'état numérique de `valeur` avec son unité
  _texteValeur(p) {
    const s = this._etat(p.entite);
    if (p.attribut && s) { const a = s.attributes[p.attribut]; return a != null ? `${typeof a === "number" ? fmt(a, p.decimales ?? 1) : a}${p.unite ?? ""}` : ""; }
    if (p.valeur) { const n = this._num(p.valeur), sv = this._etat(p.valeur); if (n != null) return `${fmt(n, p.decimales ?? 0)} ${p.unite ?? sv.attributes.unit_of_measurement ?? ""}`.trim(); }
    return "";
  }

  _maj() {
    const c = this._config, R = this.shadowRoot;
    const teinte = teinteTemp(c), EP = etiquettesPieces(c);
    // résumé : toute la maison (tous les étages, une entité comptée une fois ; classe-maison.js)
    const RS = this._resumeMaison(), ouvertes = RS.ouvertures.map((x) => x.nom), temps = RS.temperature.map((x) => x.t);
    const lumieres = RS.lumieres.length, voletsBas = RS.volets.length;

    c.pieces.forEach((p, i) => {
      const t = this._num(p.temperature, p.attribut_temperature), h = this._num(p.humidite, p.attribut_humidite);
      if (p.sous_zone) return;
      const poly = R.querySelector(`[data-p="${i}"]`);
      if (!p.dehors && poly) {
        const col = teinte && couleurTempEchelle(t, teinte);
        poly.style.fill = col ? `color-mix(in srgb, ${col} 28%, var(--md-surface))` : "var(--secondary-background-color)";
      }
      const etq = R.querySelector(`[data-l="${i}"] .val`);
      if (etq) etq.textContent = [t != null && EP.temperature ? `${fmt(t)} °C` : "", h != null && EP.humidite ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · ");
    });

    (c.ouvertures || []).forEach((o, i) => {
      // ouverture masquée (élément ou calque) : pas de dessin, mais elle compte toujours dans le résumé
      const g = R.querySelector(`[data-o="${i}"]`), ent = entOuv(o);
      const s = this._etatOuverture(o), cl = g?.classList;
      cl?.remove("ouvert", "bouge", "inconnu");
      let txt = o.nom || "";
      if (ent) {
        if (!s || ["unavailable", "unknown"].includes(s.state)) cl?.add("inconnu");
        else if (["opening", "closing"].includes(s.state)) cl?.add("bouge");
        else if (s.state === "on" || s.state === "open") cl?.add("ouvert");
        txt = _t("{nom} : {etat}", { nom: o.nom || this._nom(ent), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" });
      }
      if (o.volet) {
        const sv = this._etat(o.volet), v = R.querySelector(`[data-v="${i}"]`);
        let pos = sv ? sv.attributes.current_position : undefined;
        if (pos == null && sv) pos = sv.state === "closed" ? 0 : 100;
        if (v) {
          // en mouvement : visible tout de suite (un volet ouvert à 100 % est transparent), tirets dans le sens du mouvement
          const bouge = !!sv && ["opening", "closing"].includes(sv.state);
          v.classList.toggle("bouge", bouge); v.classList.toggle("monte", bouge && sv.state === "opening");
          v.style.opacity = bouge ? Math.max(0.85, 1 - (pos ?? 0) / 100) : pos == null ? 0.15 : Math.max(0, Math.min(1, 1 - pos / 100));
        }
        if (sv) txt += _t(" · volet {etat}", { etat: pos != null ? pos + globalThis.MaquetteI18n.pct() : sv.state });
      }
      if (g) g.querySelector("title").textContent = txt;
    });

    // bulles cachées (indisponibles ou inactives, selon `style_pastilles`) : plus dessinées ni cliquables ni lues ; toujours là en édition
    const st = stylePastilles(c), ed = !!this._editeur;
    (c.points || []).forEach((p, i) => {
      const b = R.querySelector(`[data-q="${i}"]`), s = this._etat(p.entite), actif = this._actif(p);
      const h = R.querySelector(`[data-h="${i}"]`);
      if (h) h.setAttribute("opacity", actif ? 1 : 0);
      if (h?.classList.contains("lampe") && actif) {
        const { rgb, force } = couleurLampe(s), col = rgb ? `rgb(${rgb.join(",")})` : "#ffd54f";
        R.querySelectorAll(`#halo-${i} stop`).forEach((st, n) => { st.setAttribute("stop-color", col); if (!n) st.setAttribute("stop-opacity", (0.75 * force).toFixed(3)); });
      }
      if (!b) return; // pastille masquée : elle compte toujours dans le résumé
      b.classList.toggle("actif", actif);
      b.classList.toggle("clair", actif && (p.clair ?? clairPour(p.couleur)));
      b.classList.toggle("alerte", actif && !!p.alerte);
      const indispo = !s || s.state === "unavailable";
      b.classList.toggle("indispo", indispo);
      b.classList.toggle("bs-cache", !ed && (indispo ? st.indisponible === "cache" : !actif && st.inactif === "actif_seul"));
      b.classList.toggle("bs-estompe", !ed && !indispo && !actif && st.inactif === "estompe");
      b.querySelector(".v").textContent = this._texteValeur(p);
      b.title = _t("{nom} : {etat}", { nom: p.nom || this._nom(p.entite), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" });
    });

    // meubles connectés : classes et badge seulement (pas de reconstruction du plan) ; un meuble dont les états n'ont pas changé est sauté
    for (const x of this._mbs || []) {
      const { m, g, b } = x, etats = [m.entite, m.valeur, m.actif].map((e) => this._etat(e));
      if (x.prec && etats.every((v, j) => v === x.prec[j])) continue;
      x.prec = etats;
      const e = m.entite || m.valeur, s = this._etat(e), indispo = !!e && (!s || s.state === "unavailable");
      const actif = !indispo && !!(m.actif || m.entite || (m.valeur && m.seuil != null)) && this._actif({ ...m, actif: m.actif || m.entite || m.valeur });
      g?.classList.toggle("actif", actif); g?.classList.toggle("indispo", indispo);
      if (!b) continue;
      const v = this._texteValeur(m), etat = s ? this._hass.formatEntityState?.(s) ?? s.state : e ? _t("indisponible") : "";
      b.classList.toggle("actif", actif); b.classList.toggle("clair", actif && clairPour(m.couleur));
      b.querySelector(".v").textContent = v;
      const nom = m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble")), txt = [nom, m.entite ? etat : "", v].filter(Boolean).join(" · ");
      b.title = txt;
      if (b.tagName === "BUTTON") b.setAttribute("aria-label", txt);
    }

    this._widgets();
    const fv = R.querySelector(".fiche").hidden;
    this._fiche();
    if (fv !== R.querySelector(".fiche").hidden) this._mise();

    const tete = R.querySelector(".tete");
    // pendant le glisser d'une puce, le résumé n'est pas redessiné (la puce saisie resterait sinon détachée)
    if (tete && !tete.hidden && !this._glissePuce) {
      const moy = temps.length ? fmt(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
      const es = this._editeur?.sel, selP = es?.type === "puce" ? es.i : null, ed = !!this._editeur;
      const puce = (i, ic, txt, opt = {}) => `<span class="chip${opt.alerte ? " alerte" : ""}${selP === i ? " sel" : ""}" data-puce="${i}"${opt.e && !ed ? ` data-e="${esc(opt.e)}"` : ""}${opt.title ? ` title="${esc(opt.title)}"` : ""}><ha-icon icon="${esc(ic)}"></ha-icon><span>${txt}</span></span>`;
      // « afficher » : toujours (défaut), seulement quand personne n'est là (absent) ou quand quelqu'un est là (present) ;
      // présence = `presence` (défaut zone.home : nombre de personnes à la maison, ou état home / on d'une personne / d'un groupe)
      const quelquun = (e) => this._quelquun(e);
      const L = this._puces(), parts = L.map((p, i) => {
        if (!ed && (p.afficher === "absent" || p.afficher === "present")) { const q = quelquun(p.presence); if (q != null && q === (p.afficher === "absent")) return ""; }
        if (p.type === "ouvertures") return puce(i, p.icone || `mdi:${ouvertes.length ? "window-open-variant" : "window-closed-variant"}`,
          ouvertes.length ? _t("<b>{n}</b> ouverte : {liste}|<b>{n}</b> ouvertes : {liste}", { n: ouvertes.length, liste: esc(ouvertes.join(", ")) }) : _t("Tout est fermé"), { alerte: ouvertes.length, title: ouvertes.join(", ") });
        if (p.type === "lumieres") return puce(i, p.icone || `mdi:lightbulb${lumieres ? "-on" : "-outline"}`, _t("<b>{n}</b> lumière|<b>{n}</b> lumières", { n: lumieres }));
        if (p.type === "volets") return puce(i, p.icone || "mdi:window-shutter", _t("<b>{n}</b> volet baissé|<b>{n}</b> volets baissés", { n: voletsBas }));
        if (p.type === "temperature") return moy || ed ? puce(i, p.icone || "mdi:home-thermometer-outline", _t("<b>{t} °C</b> à l'intérieur", { t: moy ?? "—" })) : "";
        if (p.type === "entite") {
          const st = this._etat(p.entite);
          if (!ed && (!st || (p.masquer_si != null && p.masquer_si !== "" && st.state === String(p.masquer_si)))) return "";
          const n = this._num(p.entite), v = p.entite ? this._val(p.entite, p.decimales, p.unite) : { t: "—", u: "" };
          const alerte = st && ((p.alerte_etat != null && p.alerte_etat !== "" && st.state === String(p.alerte_etat)) || (p.alerte_au_dessus != null && p.alerte_au_dessus !== "" && n != null && n > +p.alerte_au_dessus));
          const val = n == null && st ? esc(this._hass.formatEntityState?.(st) ?? st.state) : `${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}`;
          return puce(i, p.icone || (st?.attributes.icon) || "mdi:information-outline", `<b>${val}</b>${p.nom !== "" ? ` ${esc(p.nom ?? (p.entite ? this._nom(p.entite) : _t("Choisir une entité")))}` : ""}`, { alerte, e: p.entite });
        }
        return "";
      });
      // `ligne: true` : la puce commence une nouvelle ligne ; `sous: true` : elle se range sous la puce précédente (pile)
      const ajout = ed ? `<button class="chip ajout" data-ajouter-puce title="${_t("Ajouter une puce au résumé")}"><ha-icon icon="mdi:plus"></ha-icon><span>${_t("Puce")}</span></button>` : "";
      const struct = L.some((p) => p.ligne || p.sous);
      tete.classList.toggle("lignes", struct);
      let html;
      if (!struct) html = parts.join("") + ajout;
      else {
        const lignes = [];
        let lg = null, pile = null;
        L.forEach((p, i) => {
          if (!lg || (p.ligne && !p.sous)) { lg = []; lignes.push(lg); pile = null; }
          if (!pile || !p.sous) { pile = []; lg.push(pile); }
          pile.push(parts[i]);
        });
        const rendu = lignes.map((l) => l.map((pl) => pl.filter(Boolean)).filter((pl) => pl.length));
        if (ajout) (rendu[rendu.length - 1] ||= []).push([ajout]);
        html = rendu.filter((l) => l.length).map((l) => `<div class="tete-l">${l.map((pl) => (pl.length > 1 ? `<div class="pile">${pl.join("")}</div>` : pl[0])).join("")}</div>`).join("");
      }
      poserHTML(tete, html);
    }
    this._majInfos();
    this._majTraces();
    this._majAmbiance();
    this._majFlux();
    this._majPersonnes();
    this._majAlertes();
    this._majPastillesEtages();
    this._brancherResume();
    // les pastilles changent de largeur avec leur valeur : les étiquettes recouvertes sont replacées (une fois par image)
    cancelAnimationFrame(this._rafEvite);
    this._rafEvite = requestAnimationFrame(() => this._eviterPastilles());
  }

  // zones d'informations : nom (sinon celui de l'entité), icône (sinon selon le type de mesure), valeur avec son unité
  _majInfos() {
    const R = this.shadowRoot, T = this._config.textes || [];
    R?.querySelectorAll(".calque>.infob").forEach((b) => {
      const t = T[+b.dataset.t];
      b.querySelectorAll(".ib-l").forEach((ln) => {
        const l = t?.infos?.[+ln.dataset.ibl] || {}, s = this._etat(l.entite), dc = s?.attributes.device_class;
        ln.querySelector(".ib-n").textContent = l.nom ?? (s ? s.attributes.friendly_name || l.entite : l.entite || "");
        const parAttr = /temp/i.test(l.attribut || "") ? "temperature" : /humid/i.test(l.attribut || "") ? "humidity" : null;
        if (!l.icone) ln.querySelector("ha-icon").setAttribute("icon", (parAttr && ICONES_MESURE[parAttr]) || s?.attributes.icon || ICONES_MESURE[dc] || "mdi:information-outline");
        let v = "—";
        if (s && l.attribut) { const a = s.attributes[l.attribut]; v = a == null ? "—" : `${typeof a === "number" ? fmt(a, l.decimales ?? 1) : a}${l.unite ? ` ${l.unite}` : ""}`; }
        else if (s && !isNaN(parseFloat(s.state))) { const x = this._val(l.entite, l.decimales, l.unite); v = `${x.t}${globalThis.MaquetteI18n.unite(x.u)}`; }
        else if (s) v = this._hass.formatEntityState?.(s) ?? s.state;
        ln.querySelector(".ib-v").textContent = v;
        ln.classList.toggle("indispo", !s || s.state === "unavailable");
      });
    });
  }

  // présence à la maison : `presence` (défaut : `presence` de la carte, sinon zone.home : nombre de personnes, ou état home / on d'une personne / d'un groupe) ; null = inconnue
  _quelquun(e) { const s = this._etat(e || presenceDefaut(this._config)); if (!s) return null; const n = parseFloat(s.state); return isNaN(n) ? ["home", "on", "true"].includes(s.state) : n > 0; }

} // @assemblage
