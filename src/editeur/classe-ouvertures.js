// ouvertures : pièces d'un segment, capteurs, suggestions, atelier — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- pièces du plan et pièces HA (pré-remplissage des ouvertures et des meubles connectés) ----------
  // pièce HA d'une pièce du plan : sa clé `zone`, sinon l'aire HA de même nom (sans accents ni casse), sinon la seule dont le nom
  // contient l'autre (4 lettres au moins)
  _zonePiece(p) {
    const areas = this.hass?.areas || {};
    if (!p) return null;
    if (p.zone && areas[p.zone]) return p.zone;
    const n = sansAccent(String(p.nom || "")).trim(), nomA = (a) => sansAccent(String(a.name || "")).trim();
    if (!n) return null;
    const l = Object.values(areas), egal = l.find((a) => nomA(a) === n);
    if (egal) return egal.area_id;
    const proches = l.filter((a) => { const m = nomA(a); return m.length >= 4 && n.length >= 4 && (m.includes(n) || n.includes(m)); });
    return proches.length === 1 ? proches[0].area_id : null;
  }
  // pièces (hors sous-zones) bordées par un segment : intérieures d'abord
  _piecesDuSeg(seg) {
    const m = [(seg[0] + seg[2]) / 2, (seg[1] + seg[3]) / 2];
    return (this.d.pieces || []).filter((p) => !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && (distBord(m, p.poly) < 20 || dansPoly(m, p.poly)))
      .sort((a, b) => !!a.dehors - !!b.dehors);
  }
  _zonesDuSeg(seg) { return [...new Set(this._piecesDuSeg(seg).map((p) => this._zonePiece(p)).filter(Boolean))]; }
  // pièce (hors sous-zones) qui contient un point : la plus petite, intérieure d'abord
  _pieceDuPoint(q) {
    return (this.d.pieces || []).filter((p) => !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && dansPoly(q, p.poly))
      .sort((a, b) => !!a.dehors - !!b.dehors || aire(a.poly) - aire(b.poly))[0] || null;
  }
  // côté extérieur d'une ouverture tracée : à l'opposé de la pièce intérieure qu'elle borde (mur extérieur) ; sinon le côté par défaut
  _dehorsAuto(seg, defaut) {
    const [a, b, d, e] = seg, mx = (a + d) / 2, my = (b + e) / 2;
    const interieur = (n) => (this.d.pieces || []).some((p) => !p.sous_zone && !p.dehors && Array.isArray(p.poly) && p.poly.length > 2 && dansPoly([mx + n[0] * 30, my + n[1] * 30], p.poly));
    const inv = [-defaut[0] || 0, -defaut[1] || 0];
    return interieur(defaut) && !interieur(inv) ? inv : defaut;
  }

  // entités libres (pas encore sur le plan) d'un champ d'ouverture : celles des pièces données d'abord (`ici`), puis la classe
  // d'appareil qui va avec le type (porte → door…) ou `pref` (portail, garage)
  _candidatsOuverture(champ, o, zones, exclure = this._utilisees(), pref = null) {
    const hass = this.hass, dcPref = [...(pref || []), ...(champ === "contact" ? DC_TYPE_OUV[o.type] || [] : [])];
    const l = this._marquerIci(this.entitesCandidates(CRIT_OUV[champ], { exclure }), zones);
    for (const c of l) c.pref = dcPref.includes(hass.states[c.e]?.attributes.device_class);
    return l.sort((x, y) => y.ici - x.ici || y.pref - x.pref);
  }
  // une entité d'après la pièce (même règle pour les ouvertures et les meubles connectés) : une seule dans la pièce → prise d'office ;
  // plusieurs → petite liste (la pièce d'abord, « Autre entité… », « Ignorer ») ; aucune → null (champ « à compléter »).
  // Pièce inconnue : la seule entité qui correspond, sinon la liste. Sans dialogue (`dialogue: false`) : seulement le cas « une seule ».
  async _entitePourPiece({ titre, liste, zones, dialogue = true, domaine = "", plusieurs = false }) {
    const ici = liste.filter((c) => c.ici);
    if (ici.length === 1) return ici[0].e;
    if (!dialogue) return null;
    if (ici.length > 1 || (!zones.length && liste.length > 1)) return this.choisirParmi({ titre, liste: liste.slice(0, 30), ctx: { zone: zones[0] }, domaine, plusieurs });
    return !zones.length && liste.length === 1 ? liste[0].e : null;
  }
  // pré-remplissage d'une ouverture à la pose : `champs` voulus (contact, volet, entite), `chercher` repris seulement s'il n'y en a
  // qu'un dans la pièce ; rend les champs restés vides (« à compléter ») et les entités reliées
  async _preRemplirOuverture(o, { champs = [], chercher = [], pref = null, dialogue = true } = {}) {
    const zones = this._zonesDuSeg(o.seg), exclure = this._utilisees(), manquants = new Set(), relies = [];
    const nomOuv = o.nom || _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"));
    for (const ch of [...new Set([...champs, ...chercher])]) {
      if (o[ch] || !CRIT_OUV[ch]) continue;
      const oblig = champs.includes(ch), liste = this._candidatsOuverture(ch, o, zones, exclure, pref);
      const e = await this._entitePourPiece({ titre: `${nomOuv} · ${_t(A_COMPLETER[ch])}`, liste, zones, dialogue: dialogue && oblig, domaine: CRIT_OUV[ch].d, plusieurs: ch === "contact" });
      const l = (Array.isArray(e) ? e : [e]).filter(Boolean);
      if (l.length) { if (ch === "contact") poserContacts(o, l); else o[ch] = l[0]; l.forEach((x) => { exclure.add(x); relies.push(x); }); } else if (oblig) manquants.add(ch);
    }
    return { manquants, relies };
  }
  // meuble connecté posé depuis un modèle : son entité cherchée dans la pièce où il est (même règle que les ouvertures)
  async _preRemplirMeuble(i, pre) {
    const m = this.d.meubles?.[i];
    if (!m || m.entite) return;
    const p = this._pieceDuPoint(m.pos), zones = p ? [this._zonePiece(p)].filter(Boolean) : [];
    const liste = this._marquerIci(this.entitesCandidates(K(pre.domaine || null), { exclure: this._utilisees() }), zones);
    const e = await this._entitePourPiece({ titre: pre.nom || _t("Meuble"), liste, zones, domaine: pre.domaine || "" });
    if (this.d.meubles?.[i] !== m) return;
    if (e) return this.commit(() => { m.entite = e; });
    this._aFaire = { cle: `meuble:${i}`, champs: new Set(["entite"]) };
    if (this.vueEdition) this._panneau(); else if (this.sel && cle(this.sel) === `meuble:${i}`) this.editerSelection();
    this.snack(_t("À compléter dans la fenêtre d'édition : {l}.", { l: _t("Entité") }));
  }
  // entités d'une liste situées dans l'une des pièces HA données : `ici`, en tête
  _marquerIci(l, zones) {
    const hass = this.hass, zoneDe = (e) => { const r = hass.entities?.[e]; return r?.area_id || hass.devices?.[r?.device_id]?.area_id || null; };
    for (const c of l) c.ici = zones.includes(zoneDe(c.e));
    return l.sort((x, y) => y.ici - x.ici);
  }
  // suggestions discrètes sur une ouverture tracée : capteur libre de la même pièce, type d'après la classe du contact
  _suggestionsOuverture(o, i) {
    const hass = this.hass, out = [], ign = (this._suggIgn ||= new Set());
    if (!o || !Array.isArray(o.seg) || !hass) return out;
    const zones = this._zonesDuSeg(o.seg), exclure = this._utilisees(), nomZone = zones[0] && (hass.areas?.[zones[0]]?.name || zones[0]);
    const TXT = { contact: [_tk("Contact libre : « {nom} »"), _tk("{n} contacts libres dans « {piece} »")], volet: [_tk("Volet libre : « {nom} »"), _tk("{n} volets libres dans « {piece} »")],
      entite: [_tk("Motorisation libre : « {nom} »"), _tk("{n} motorisations libres dans « {piece} »")] };
    const champs = o.type === "portail" ? ["entite"] : o.volet_seul ? ["volet"] : ["contact", "volet"];
    if (zones.length) for (const ch of champs) {
      if (o[ch] || ign.has(`${i}:${ch}`)) continue;
      const ici = this._candidatsOuverture(ch, o, zones, exclure).filter((c) => c.ici);
      if (ici.length === 1) out.push({ k: `${i}:${ch}`, ic: iconeEntite(hass, ici[0].e), txt: _t(TXT[ch][0], { nom: esc(ici[0].nom) }), act: `sugg:${ch}:${ici[0].e}`, bouton: _t("Relier") });
      else if (ici.length > 1) out.push({ k: `${i}:${ch}`, ic: iconeEntite(hass, ici[0].e), txt: _t(TXT[ch][1], { n: ici.length, piece: esc(nomZone) }), act: `sugg-choisir:${ch}`, bouton: _t("Choisir") });
    }
    const t = TYPE_DC_OUV[hass.states[contactsOuv(o)[0]]?.attributes.device_class];
    if (t && t !== o.type && !(o.type === "portail" && t === "porte") && !ign.has(`${i}:type`))
      out.push({ k: `${i}:type`, ic: t === "fenetre" ? "mdi:window-closed-variant" : t === "portail" ? "mdi:garage-variant" : "mdi:door", txt: _t("Type d'après le contact : {type}", { type: esc(_t(NOMS_OUVERTURE[t])) }), act: `sugg-type:${t}`, bouton: _t("Appliquer") });
    return out;
  }
  _htmlSuggestions(l) {
    return l.length ? `<div class="ed-suggs">${l.map((x) => `<div class="ed-sugg"><ha-icon icon="${esc(x.ic)}"></ha-icon><span>${x.txt}</span>
      <button type="button" class="ed-btn texte" data-act="${esc(x.act)}">${esc(x.bouton)}</button>${ibAct(`sugg-ign:${x.k}`, "mdi:close", _t("Ignorer"))}</div>`).join("")}</div>` : "";
  }
  // actions des suggestions et des réglages de dessin d'une ouverture sélectionnée
  async _actionOuvertureSel(a) {
    const s = this.sel, o = this._objet();
    if (s?.type !== "ouverture" || !o) return;
    const [op, ch, ...r] = a.split(":");
    if (op === "sugg") { const e = r.join(":"); return this.commit(() => { o[ch] = e; }); }
    if (op === "sugg-type") return this._modif("type", ch);
    if (op === "sugg-ign") { this._suggIgn.add(`${ch}:${r.join(":")}`); return this._panneau(); }
    if (op === "sugg-choisir") {
      const zones = this._zonesDuSeg(o.seg), liste = this._candidatsOuverture(ch, o, zones);
      const e = await this.choisirParmi({ titre: `${o.nom || _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))} · ${_t(A_COMPLETER[ch])}`, liste: liste.slice(0, 30), ctx: { zone: zones[0] }, domaine: CRIT_OUV[ch].d, plusieurs: ch === "contact" });
      if (e && this._objet() === o) this.commit(() => { if (ch === "contact") poserContacts(o, Array.isArray(e) ? e : [e]); else o[ch] = e; });
      return;
    }
    if (op === "atelier-ouv") return this.modifierOuverture(s.i);
  }

  // ---------- « Créer une ouverture » : l'atelier avec les préréglages (type, battants, capteurs, aperçu sur un mur) ----------
  _typesOuverture() {
    return CATALOGUE.plan.map((m, i) => [m, i]).filter(([m]) => m.genre === "ouverture").map(([m, i]) => ({ id: `p${i}`, nom: m.nom, icone: m.icone, desc: m.desc,
      chercher: m.chercher, pref: m.pref, objet: { ...clone(m.objet), ...(m.aCompleter?.length ? { _avec: Object.fromEntries(m.aCompleter.map((c) => [c, true])) } : {}) } }));
  }
  // objet prêt à poser (clés internes `_avec` retirées) et capteurs voulus
  _sortirOuverture(o) {
    const objet = clone(o), avec = ["contact", "volet", "entite"].filter((c) => objet._avec?.[c] || objet[c]);
    delete objet._avec;
    for (const k of Object.keys(objet)) if (objet[k] === "" || objet[k] == null) delete objet[k];
    if (!OUVRANTS_ED.some(([v]) => v && v === objet.ouvrant)) { delete objet.ouvrant; delete objet.vers_dehors; }
    if (objet.ouvrant === "coulissant") delete objet.vers_dehors;
    if (+objet.battants !== 2) delete objet.battants;
    return { objet, avec };
  }
  _specOuverture(extra) {
    return {
      reglages: (o) => this._reglagesOuverture(o), apercu: (o) => this._apercuOuverture(o),
      ecrire: (o, k, v) => { if (k.startsWith("_avec.") && !v) delete o[k.slice(6)]; return false; },
      action: (a, o) => {
        const [k, v] = a.split(":");
        if (k === "type") o.type = v;
        if (k === "battants") { if (v === "2") o.battants = 2; else delete o.battants; }
      },
      ...extra,
    };
  }
  creerOuverture(opt = {}) {
    const types = this._typesOuverture();
    this.ouvrirAtelier(this._specOuverture({
      titre: _t("Créer une ouverture"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      valider: ({ o, type, modele, demander }) => {
        opt.apres?.();
        const t = types.find((x) => x.id === type), { objet, avec } = this._sortirOuverture(o), nom = objet.nom || t?.nom || _t("Ouverture");
        if (modele) {
          // modèle : capteurs voulus = demandés à chaque pose (cherchés dans la pièce) ; décoché, les entités choisies restent fixes
          const m = clone(objet), dem = demander ? avec : avec.filter((c) => !objet[c]);
          if (demander) for (const c of dem) delete m[c];
          this.commit(() => (this.d.modeles ||= []).push({ id: idModele(), nom, genre: "ouverture", icone: t?.icone || "mdi:window-closed-variant", desc: t?.nom || _t("Ouverture"), objet: m, ...(dem.length ? { demander: dem } : {}) }));
        }
        this.choisirOutil("ouverture", true);
        this.modeleOuverture = objet; this.aCompleter = avec.filter((c) => !objet[c]); this.chercherOuv = t?.chercher || null; this.prefOuv = t?.pref || null;
        this.snack(_t("« {nom} » : clique les deux extrémités sur un mur.", { nom }));
      },
    }));
  }
  // ouverture déjà tracée : préréglage, type, battants et capteurs changés sans la redessiner (position, fiche et le reste gardés)
  modifierOuverture(i) {
    const cur = this.d.ouvertures?.[i];
    if (!cur) return;
    const types = this._typesOuverture(), PROPRES = ["type", "battants", "ouvrant", "vers_dehors", "volet_seul", "vitree"];
    this.ouvrirAtelier(this._specOuverture({
      titre: _t("Modifier l'ouverture"), types, initial: { ...clone(cur), _avec: Object.fromEntries(["contact", "volet", "entite"].filter((c) => cur[c]).map((c) => [c, true])) },
      libelleOk: _t("Appliquer"), retour: this.R.querySelector(".ed-edit [data-act=atelier-ouv]"),
      // autre préréglage : son type, ses battants et ses capteurs ; les entités déjà reliées restent
      fusion: (t, o) => { const n = { ...o }; for (const k of PROPRES) delete n[k]; Object.assign(n, clone(t.objet)); n._avec = { ...(o._avec || {}), ...(t.objet._avec || {}) }; return n; },
      valider: async ({ o, type }) => {
        const t = types.find((x) => x.id === type), { objet, avec } = this._sortirOuverture(o);
        const r = await this._preRemplirOuverture(objet, { champs: avec.filter((c) => !objet[c]), chercher: t?.chercher || [], pref: t?.pref });
        if (this.d.ouvertures?.[i] !== cur) return;
        if (r.manquants.size) this._aFaire = { cle: `ouverture:${i}`, champs: r.manquants };
        this.commit(() => { for (const k of [...PROPRES, "contact", "volet", "entite", "nom", "animation"]) delete cur[k]; Object.assign(cur, objet); this.sel = { type: "ouverture", i }; });
        if (r.manquants.size) this.editerSelection("capteurs");
        this.snack(r.manquants.size ? _t("À compléter dans la fenêtre d'édition : {l}.", { l: [...r.manquants].map((x) => _t(A_COMPLETER[x])).join(", ") }) : _t("Ouverture modifiée."));
      },
    }));
  }
  _reglagesOuverture(o) {
    const af = this._aFaire; this._aFaire = null; // l'atelier n'est pas l'élément sélectionné : rien n'y est « à compléter »
    try { return this._reglagesOuv(o); } finally { this._aFaire = af; }
  }
  _reglagesOuv(o) {
    const seg = (k, l, v) => `<div class="ed-seg" role="radiogroup">${l.map(([x, n]) => `<button type="button" role="radio" aria-checked="${x === v}" class="${x === v ? "on" : ""}" data-at="${k}:${x}">${esc(n)}</button>`).join("")}</div>`;
    const avec = o._avec || {}, AN = this.carte.constructor.ANIMATIONS, anim = typeof o.animation === "string" ? o.animation : o.animation?.type || "";
    const capteur = (ch, label, dom) => `<label class="ed-inter"><span>${esc(label)}</span><input type="checkbox" data-k="_avec.${ch}" data-rendre ${avec[ch] || o[ch] ? "checked" : ""}></label>
      ${avec[ch] || o[ch] ? `<div class="ed-at-capteur">${this._champEntite("", ch, o[ch], true, dom)}</div>` : ""}`;
    return `${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Baie salon"))}
      <div class="ed-champ"><label>${_t("Type")}</label>${seg("type", [["fenetre", _t("Fenêtre")], ["porte", _t("Porte")], ["portail", _t("Portail")]], o.type)}</div>
      <div class="ed-ligne"><div class="ed-champ"><label>${_t("Vantaux")}</label>${seg("battants", [["1", "1"], ["2", "2"]], +o.battants === 2 ? "2" : "1")}</div>
        <div class="ed-champ"><label>${_t("Ouverture##battants")}</label><select data-k="ouvrant" data-rendre>${OUVRANTS_ED.map(([v, n]) => `<option value="${esc(v)}" ${(o.ouvrant || "") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div></div>
      ${o.ouvrant === "gauche" || o.ouvrant === "droite" ? this._inter(_t("Ouvre vers l'extérieur"), "vers_dehors", o.vers_dehors) : ""}
      <h4 class="ed-at-titre">${_t("Capteurs")}${bulleI(_t("Laissés vides, ils sont cherchés dans la pièce à la pose."))}</h4>
      ${capteur("contact", _t("Contact (ouvert / fermé)"), "binary_sensor")}${o.type === "portail" ? "" : capteur("volet", _t("Volet"), "cover")}${capteur("entite", _t("Motorisation (cover)"), "cover")}
      <div class="ed-champ"><label>${_t("Animation (ouverte)")}</label><select data-k="animation"><option value="">${_t("Celle du plan")}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${anim === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>`;
  }
  // aperçu : un morceau de mur, l'ouverture à sa largeur habituelle, l'extérieur en haut
  _apercuOuverture(o) {
    const avec = o._avec || {}, L = o.ouvrant === "coulissant" ? 240 : o.type === "portail" ? (+o.battants === 2 ? 320 : 260) : o.type === "porte" ? (+o.battants === 2 ? 140 : 90) : (+o.battants === 2 ? 140 : 100);
    const x = { ...o, seg: [-L / 2, 0, L / 2, 0], dehors: [0, -1] };
    if (avec.contact) x.contact ||= "binary_sensor.apercu";
    if (avec.entite) x.entite ||= "cover.apercu";
    const capteur = !!(x.contact || x.entite), { baie, traits } = this.carte.constructor.traitsOuverture(x), W = Math.max(400, L + 120);
    const volet = avec.volet || o.volet ? `<path class="volet" d="M${-L / 2} -16L${L / 2} -16"/>` : "";
    return `<svg class="ed-ap-ouv" viewBox="${-W / 2} -120 ${W} 240" role="img" aria-label="${esc(_t("Aperçu"))}">
      <rect class="ed-ap-int" x="${-W / 2}" y="0" width="${W}" height="120"/>
      <text x="${-W / 2 + 12}" y="-96">${esc(_t("Extérieur"))}</text><text x="${-W / 2 + 12}" y="108">${esc(_t("Intérieur"))}</text>
      <path class="murs" d="M${-W / 2} 0H${W / 2}"/>
      <g class="ouv ${esc(o.type || "fenetre")}${capteur ? "" : " sans"}">${baie}${traits}${volet}</g>
      <path class="ed-ap-cote" d="M${-L / 2} -58V-46M${L / 2} -58V-46M${-L / 2} -52H${L / 2}"/><text class="ed-ap-cote-t" x="0" y="-62">${fmt(L / 100, 2)} m</text></svg>`;
  }

} // @assemblage
