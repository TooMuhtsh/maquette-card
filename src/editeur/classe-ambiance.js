// modale Ambiance : aperçu, onglets, personnes — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- ambiance et animations ----------
  // modale ouverte = aperçu de l'ambiance sur le plan derrière le voile (sinon l'ambiance n'est jamais dessinée pendant l'édition)
  // ancre : onglet à montrer à l'ouverture (« lumiere », « alertes »…). Échap, la croix ou un clic sur le voile la ferment.
  panneauAmbiance(oui, ancre = null) {
    oui = !!oui;
    const avant = !!this.vueAmbiance;
    this.vueAmbiance = oui;
    this._ambCachee = false;
    if (oui && this.vueParametres) this._fermerParametres();
    if (oui && this.vueEdition) this.fermerEdition();
    if (oui) { this.vueCalques = false; this.sel = null; this.multi.clear(); if (ancre) this._ongletAmb = ancre; }
    else this._fermerAmbiance();
    this.carte._construire();
    this._barre();
    this._panneau();
    if (oui && (!avant || ancre)) this.R.querySelector(".ed-amb .ed-onglets [aria-selected=true]")?.focus({ preventScroll: true });
    if (!oui && avant) [this.barre.querySelector('[data-a="ambiance"]'), this.barre.querySelector('[data-a="plus"]')].find((x) => x && x.getClientRects().length)?.focus({ preventScroll: true });
  }
  _fermerAmbiance() { this._ambCachee = false; this.R.querySelector(".ed-mvoile.ed-amb")?.remove(); this._finApercuAmb(); }
  // aperçu de la modale Ambiance : une pièce fictive (baie avec volet au sud, fenêtre à l'est, lampe, jardin) dessinée par une
  // carte Maquette, même moteur que le plan ; heure et météo fictives (états simulés), réglages lus en direct dans this.d.
  // Ses contrôles n'écrivent rien dans la configuration.
  _apercuAmb(aside) {
    if (!aside) return;
    const ap = (this._ap ||= { h: 15, meteo: "sunny" }), C = this.carte.constructor;
    if (!this._apCarte) {
      this._apCarte = document.createElement("maquette-card");
      this._apCarte.className = "ed-ap-carte";
      this._apCarte.setAttribute("aria-hidden", "true");
      this._apCarte.setConfig(C.versAnglais(this._configApercu()));
    }
    poserHTML(aside, `<h4 class="ed-ap-titre">${_t("Aperçu")}${bulleI(_t("Pièce fictive : baie avec volet au sud, fenêtre à l'est, lampe. Heure et météo de l'aperçu seulement : rien n'est enregistré."))}</h4>
      <div class="ed-ap-plan"></div>
      <div class="ed-ap-ctl"><div class="ed-champ"><label for="ed-ap-heure">${_t("Heure de l'aperçu")}</label><div class="ed-curseur"><input type="range" id="ed-ap-heure" data-ap-heure min="0" max="24" step="0.25" value="${ap.h}" aria-valuetext="${heureAp(ap.h)}"><output>${heureAp(ap.h)}</output></div></div>
      <span class="ed-seg petit plein" role="group" aria-label="${_t("Météo de l'aperçu")}">${[["sunny", _t("Clair")], ["cloudy", _t("Couvert")], ["rainy", _t("Pluie")]].map(([v, n]) => `<button type="button" data-ap-meteo="${v}" class="${ap.meteo === v ? "on" : ""}" aria-pressed="${ap.meteo === v}">${n}</button>`).join("")}</span></div>`);
    aside.querySelector(".ed-ap-plan").append(this._apCarte);
    const h = aside.querySelector("[data-ap-heure]");
    h.oninput = () => { ap.h = +h.value; h.nextElementSibling.textContent = heureAp(ap.h); h.setAttribute("aria-valuetext", heureAp(ap.h)); this._apercuDirect(); };
    aside.querySelectorAll("[data-ap-meteo]").forEach((b) => { b.onclick = (ev) => {
      ev.stopPropagation();
      ap.meteo = b.dataset.apMeteo;
      aside.querySelectorAll("[data-ap-meteo]").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); });
      this._majApercuAmb();
    }; });
    this._majApercuAmb(true);
  }
  // pièce fictive (cm) ; l'ambiance est celle de l'éditeur, sauf nord, météo, personnes, traces et énergie (propres à l'aperçu)
  _configApercu() {
    const d = this.d, A = d.ambiance && typeof d.ambiance === "object" ? clone(d.ambiance) : null;
    if (A) {
      Object.assign(A, { nord: 0, meteo: "weather.apercu", traces: false });
      delete A.personnes; delete A.energie;
      if (A.lumiere && typeof A.lumiere === "object" && A.lumiere.lune !== false) A.lumiere.lune = "sensor.apercu_lune";
      else if (A.lumiere !== false) A.lumiere = { ...(A.lumiere || {}), lune: "sensor.apercu_lune" };
    }
    return { id: "apercu-ambiance", ...(d.langue ? { langue: d.langue } : {}), marge: 10, plein_ecran: false, edition: false, legende: false, resume: false, teinte_temperature: false,
      etiquettes_pieces: { nom: false, temperature: false, humidite: false }, interaction: { vue_figee: true, clic_piece: "aucun" },
      pieces: [{ nom: _t("Séjour"), poly: [[0, 0], [500, 0], [500, 400], [0, 400]] },
        { nom: _t("Jardin"), dehors: true, zoom: false, poly: [[0, 400], [500, 400], [500, 0], [620, 0], [620, 560], [0, 560]] }],
      ouvertures: [{ type: "fenetre", nom: _t("Baie"), seg: [110, 400, 390, 400], dehors: [0, 1], volet: "cover.apercu" }, { type: "fenetre", nom: _t("Fenêtre"), seg: [500, 130, 500, 250], dehors: [1, 0] },
        { type: "porte", nom: _t("Porte vitrée"), seg: [0, 220, 0, 310], dehors: [-1, 0], vitree: "toute" }],
      points: [{ entite: "light.apercu", pos: [80, 80], icone: "mdi:floor-lamp", couleur: "#f6c445", halo: 150, piece: _t("Séjour") }],
      ...(A ? { ambiance: A } : {}) };
  }
  // états simulés de l'aperçu : soleil selon l'heure (lever 6 h à l'est, midi au sud, coucher 18 h à l'ouest), météo, volet ouvert, lampe allumée le soir
  _hassApercu() {
    const ap = this._ap, h = ap.h, e = 55 * Math.sin((Math.PI * (h - 6)) / 12), az = (((90 + (h - 6) * 15) % 360) + 360) % 360, t = new Date().toISOString();
    const st = (id, state, attributes = {}) => [id, { entity_id: id, state, attributes, last_changed: t, last_updated: t }];
    const states = Object.fromEntries([st("sun.sun", e > 0 ? "above_horizon" : "below_horizon", { elevation: +e.toFixed(2), azimuth: +az.toFixed(2) }),
      st("weather.apercu", ap.meteo === "sunny" && e <= 0 ? "clear-night" : ap.meteo, { cloud_coverage: ap.meteo === "sunny" ? 5 : 95, wind_speed: 12, wind_bearing: 220 }),
      st("cover.apercu", "open", { current_position: 100 }), st("sensor.apercu_lune", "full_moon"),
      st("light.apercu", e < 4 ? "on" : "off", { color_temp_kelvin: 2700, brightness: 200 })]);
    const w = Object.create(this.hass);
    w.states = states;
    w.callService = () => Promise.resolve();
    w.callWS = () => Promise.reject(new Error("aperçu"));
    return w;
  }
  // aperçu redessiné : réglages de l'éditeur (config de la pièce fictive refaite seulement si l'ambiance a changé hors lumière), puis états
  _majApercuAmb(force = false) {
    const ap = this._apCarte;
    if (!ap || !ap.isConnected) return;
    const cfg = this._configApercu(), cle = JSON.stringify({ ...cfg.ambiance, lumiere: null }), lu = cfg.ambiance?.lumiere;
    if (force || cle !== this._apCle || !ap._config || !ap._ok) {
      this._apCle = cle;
      ap.setConfig(this.carte.constructor.versAnglais(cfg));
    } else if (ap._config.ambiance) {
      // glisser d'un curseur de lumière : la couche lumière seule (clé interne déjà normalisée)
      if (lu === undefined) delete ap._config.ambiance.lumiere; else ap._config.ambiance.lumiere = clone(lu);
    }
    ap.hass = this._hassApercu();
    ap._majAmbiance?.();
  }
  _finApercuAmb() { this._apCarte?.remove(); this._apCarte = null; this._apCle = null; }
  ongletAmbiance(id) {
    const V = this.R.querySelector(".ed-mvoile.ed-amb");
    if (!V || !V.querySelector(`[data-onglet-amb="${id}"]`)) return;
    this._ongletAmb = id;
    V.querySelectorAll("[data-onglet-amb]").forEach((b) => { const on = b.dataset.ongletAmb === id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    V.querySelectorAll(".ed-mcontenu>section").forEach((p) => { p.hidden = p.dataset.onglet !== id; });
    V.querySelector(".ed-mcontenu").scrollTop = 0;
    V.querySelector(`[data-onglet-amb="${id}"]`).scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  _panneauAmbiance() {
    const d = this.d, A = d.ambiance && typeof d.ambiance === "object" ? d.ambiance : null, C = this.carte.constructor, AN = C.ANIMATIONS, EV = C.EVENEMENTS_ANIM;
    const I = typeof A?.intensite === "number" ? "" : A?.intensite || "discret", jn = A?.jour_nuit !== false, mq = !(A?.jour_nuit && typeof A.jour_nuit === "object" && A.jour_nuit.marqueur === false);
    const tr = !A ? 10 : A.traces === false ? 0 : typeof A.traces === "number" ? A.traces : A.traces?.duree ?? 10;
    const met = typeof A?.meteo === "string" ? A.meteo : A?.meteo?.entite || "", meteos = Object.keys(this.hass.states).filter((e) => e.startsWith("weather.")).sort();
    const ext = d.pieces.some((p) => p.dehors && !p.sous_zone);
    const en = A?.energie ? (typeof A.energie === "object" ? A.energie : {}) : null, pe = A?.personnes ? (typeof A.personnes === "object" && !Array.isArray(A.personnes) ? A.personnes : {}) : null;
    const AL = Array.isArray(d.alertes) ? d.alertes : [];
    const regle = (r, i) => {
      const ents = [...(Array.isArray(r.entites) ? r.entites : []), ...(r.entite ? [r.entite] : [])];
      return `<div class="ed-al">
        <div class="ed-ligne"><div class="ed-champ"><label>${_t("Nom")}</label><input type="text" data-alk="${i}.nom" value="${esc(r.nom || "")}" placeholder="${_t("Alerte")}"></div>
          <div class="ed-champ"><label>${_t("Niveau")}</label><select data-alk="${i}.niveau">${[["", _t("Critique")], ["alerte", _t("Alerte##niveau")], ["info", _t("Info")]].map(([v, n]) => `<option value="${esc(v)}" ${(r.niveau || "") === (v || "") || (v === "" && r.niveau === "critique") ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
        <div class="ed-champ"><label>${_t("Icône")}</label><input type="text" data-alk="${i}.icone" value="${esc(r.icone || "")}" placeholder="auto (${{ alerte: "mdi:alert", info: "mdi:information" }[r.niveau] || "mdi:alarm-light"})"></div>
        ${r.type === "ouvertures" ? `<div class="ed-aide">${_t("Toutes les portes et fenêtres du plan (ouvertes).")}</div>` : `<div class="ed-champ"><label>${_t("Entités (une suffit)")}</label><div class="ed-al-ents">${ents.map((e, k) => `<span class="ed-al-e"><span>${esc(this.carte._nom(e))}</span><button class="ib" data-al-act="retirer:${i}:${k}" title="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></span>`).join("")}
          <button class="ed-btn texte" data-al-act="ajouter:${i}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Entité")}</button></div></div>
          <div class="ed-ligne"><div class="ed-champ"><label>${_t("Quand l'état vaut")}</label><input type="text" data-alk="${i}.etat" value="${esc(r.etat ?? "")}" placeholder="${_t("ex. on")}" title="on, open, triggered…"></div>${this._champNombreAl(`${i}.au_dessus`, r.au_dessus)}</div>`}
        <label class="ed-inter"><span>${_t("Seulement quand personne n'est à la maison")}</span><input type="checkbox" data-alk-chk="${i}.si_absent" ${r.si_absent ? "checked" : ""}></label>
        <div class="ed-actions"><button class="ed-btn danger" data-al-act="suppr:${i}"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Retirer l'alerte")}</button></div></div>`;
    };
    const ligneEv = (ev) => {
      const g = d.animations?.[ev], a = typeof g === "string" ? { type: g } : g || {}, def = EV[ev].defaut;
      // type en pleine largeur (l'animation par défaut reste lisible), couleur et durée sur la ligne du dessous
      return `<div class="ed-champ ed-anim-ev"><label for="ed-anim-${ev}">${esc(_t(EV[ev].nom))}</label>
        <select id="ed-anim-${ev}" data-anim="${ev}.type"><option value="">${_t("Défaut ({nom})", { nom: esc(_t(AN[def.type]).split(" (")[0]) })}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${a.type === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select>
        <div class="ed-ligne"><span class="ed-couleur-anim ed-couleurs">${this._nuancierPalette(a.couleur, "", (n) => `data-anim-pal="${ev}.couleur" data-couleur="${esc(n)}"`)}<input type="color" data-anim="${ev}.couleur" value="${esc(hexOu(a.couleur, "#f4b400"))}" title="${_t("Couleur (sinon celle de l'élément)")}" aria-label="${_t("Couleur")}">${a.couleur ? `<button class="ib" data-anim-effacer="${ev}.couleur" title="${_t("Couleur de l'élément")}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</span>
        <input type="number" step="0.1" min="0.2" max="20" data-anim="${ev}.duree" data-num="1" value="${esc(a.duree ?? "")}" placeholder="${def.duree} s" aria-label="${_t("Durée d'un cycle (s)")}" title="${_t("Durée d'un cycle (s)")}"></div></div>`;
    };
    // modale à onglets (comme ⚙ Paramètres) : chaque onglet garde ses champs (data-amb…) ; aperçu fictif à droite (téléphone : au-dessus)
    const sansA = `<div class="ed-aide">${_t("Active d'abord l'ambiance du plan (onglet Général).")}</div>`;
    const LU = PARAMS_LUMIERE[0].champs.filter((f) => !f.si || f.si(d, this));
    const champsLu = LU.map((f) => (f.type === "intertitre" ? `<div class="ed-par-inter">${esc(_t(f.libelle))}</div>` : this._htmlChamp(f))).join("");
    const onglets = [
      ["general", _t("Général"), "mdi:weather-partly-cloudy", `      <label class="ed-inter"><span>${_t("Ambiance du plan")}${bulleI(_t("Jour / nuit, météo, traces. Cette fenêtre ouverte, le plan la montre telle qu'elle sera en vue."))}</span><input type="checkbox" data-amb-chk="actif" ${A ? "checked" : ""}></label>
      ${A ? `<div class="ed-champ"><label>${_t("Intensité")}</label><span class="ed-seg petit">${[["discret", _t("Discrète")], ["normal", _t("Normale")], ["fort", _t("Marquée")]].map(([v, n]) => `<button data-amb-set="intensite:${v}" class="${I === v ? "on" : ""}">${n}</button>`).join("")}</span></div>
      <div class="ed-champ"><label>${_t("Nord du plan (°)")}${bulleI(_t("Degrés, sens horaire depuis le haut ; 45 = en haut à droite."))}</label><input type="number" step="5" data-amb="nord" data-num="1" value="${esc(A.nord ?? "")}" placeholder="0"></div>
      <h4>${_t("Jour et nuit")}</h4>
      <label class="ed-inter"><span>${_t("Teinte de nuit et lumière du soleil (sun.sun)")}</span><input type="checkbox" data-amb-chk="jour_nuit" ${jn ? "checked" : ""}></label>
      ${jn ? `<label class="ed-inter"><span>${_t("Repère du soleil au bord du plan")}</span><input type="checkbox" data-amb-chk="marqueur" ${mq ? "checked" : ""}></label>` : ""}
      <h4>${_t("Météo")}</h4>
      ${ext ? "" : `<div class="ed-aide">${_t("Aucune pièce « extérieur » : météo et soleil n'ont rien à dessiner.")}</div>`}
      <div class="ed-champ"><label>${_t("Météo peinte sur les extérieurs")}</label><select data-amb="meteo"><option value="">${_t("— aucune —")}</option>${meteos.map((e) => `<option value="${esc(e)}" ${e === met ? "selected" : ""}>${esc(this.carte._nom(e))}</option>`).join("")}</select></div>
` : ""}
`],
      ["lumiere", _t("Lumière"), "mdi:white-balance-sunny", A ? `<div class="ed-par-sec" data-sec="lumiere">${champsLu}</div>` : sansA],
      ["personnes", _t("Personnes"), "mdi:account-multiple-outline", A ? `      <h4>${_t("Personnes")}</h4>
      <label class="ed-inter"><span>${_t("Personnes sur le plan")}${bulleI(_t("À la maison, ou au bord dans leur direction réelle avec la distance."))}</span><input type="checkbox" data-amb-chk="personnes" ${pe ? "checked" : ""}></label>
      ${pe ? `<div class="ed-champ"><label>${_t("Où se rangent les personnes à la maison")}${bulleI(_t("« Placer sur le plan » : glisse les avatars à l'endroit voulu."))}</label><select data-amb="personnes.maison"><option value="">${_t("Au centre de la maison")}</option>${d.pieces.filter((p) => !p.sous_zone && p.nom).map((p) => `<option ${pe.maison === p.nom ? "selected" : ""}>${esc(p.nom)}</option>`).join("")}${Array.isArray(pe.maison) ? `<option value="__perso" selected>${_t("Position personnalisée ({pos} cm)", { pos: esc(pe.maison.join(", ")) })}</option>` : ""}</select></div>
        <div class="ed-actions"><button class="ed-btn texte" data-act="amb-placer"><ha-icon icon="mdi:cursor-move"></ha-icon>${_t("Placer sur le plan")}</button></div>
        ${this._lignesPersonnes(d)}` : ""}
      <h4>${_t("Traces")}</h4>
      ${champCurseur(`${_t("Durée des traces")}${bulleI(_t("Ce qui vient de changer garde un liseré qui s'estompe."))}`, 'data-amb="traces"', 0, 240, 5, esc(tr), tr ? `${tr} min` : _t("aucune"))}
` : sansA],
      ["energie", _t("Énergie"), "mdi:flash-outline", A ? `      <h4>${_t("Flux d'énergie")}</h4>
      <label class="ed-inter"><span>${_t("Billes vers les appareils mesurés")}${bulleI(_t("Du tableau électrique vers chaque appareil mesuré ; vitesse selon la puissance."))}</span><input type="checkbox" data-amb-chk="energie" ${en ? "checked" : ""}></label>
      ${en ? `<div class="ed-champ"><label>${_t("Départ")}</label><select data-amb="energie.source" data-num="1"><option value="">${_t("Tableau électrique")}</option>${(d.meubles || []).map((m, i) => (m.type === "espace" ? "" : `<option value="${esc(i)}" ${en.source === i ? "selected" : ""}>${esc(m.nom || (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : m.type))}</option>`)).join("")}</select></div>
        <div class="ed-champ"><label>${_t("À partir de (W)")}</label><input type="number" step="1" min="0" data-amb="energie.seuil" data-num="1" value="${esc(en.seuil ?? "")}" placeholder="5"></div>` : ""}
` : sansA],
      ["animations", _t("Animations"), "mdi:animation-play-outline", `      <h4>${_t("Animations par événement")}${bulleI(_t("Type, couleur et durée d'un cycle. Chaque élément peut avoir la sienne (onglet « Animation » de sa fenêtre d'édition)."))}</h4>
      ${Object.keys(EV).map(ligneEv).join("")}
      <div class="ed-actions"><button class="ed-btn contour" data-act="amb-reinit" ${d.animations ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon>${_t("Animations par défaut")}</button></div>
`],
      ["alertes", _t("Alertes"), "mdi:alarm-light-outline", `      <h4 data-ancre="alertes">${_t("Alertes plein plan")}${bulleI(_t("Le plan entier s'allume (voile, bandeau, éléments entourés) tant que l'alerte dure ; « Masquer » la cache jusqu'au prochain changement."))}</h4>
      ${AL.map((r, i) => (r && typeof r === "object" ? regle(r, i) : "")).join("")}
      <div class="ed-actions"><button class="ed-btn tonal" data-al-act="nouvelle"><ha-icon icon="mdi:plus"></ha-icon>${_t("Alerte sur des entités")}</button>
        <button class="ed-btn contour" data-al-act="intrusion"><ha-icon icon="mdi:door-open"></ha-icon>${_t("Ouverture, maison vide")}</button></div>
`],
    ];
    if (!onglets.some((o) => o[0] === this._ongletAmb)) this._ongletAmb = "general";
    let V = this.R.querySelector(".ed-mvoile.ed-amb");
    V ||= this._mvoile("ed-amb");
    V.hidden = !!this._ambCachee;
    const actif = this.R.activeElement, garde = V.contains(actif) ? cleFocusAmb(actif) : null, defile = V.querySelector(".ed-mcontenu")?.scrollTop || 0;
    poserHTML(V, `<div class="ed-modale ed-modale-amb" role="dialog" aria-modal="true" aria-labelledby="ed-amb-titre">
      <header><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon><div><h2><span id="ed-amb-titre">${_t("Ambiance et animations")}</span>${bulleI(_t("Jour / nuit, météo, lumière, traces. Fenêtre ouverte, le plan derrière la montre telle qu'elle sera en vue."))}</h2></div>
        <button class="ib" data-act="amb-fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcorps">${this._navOnglets("amb", _t("Sections de l'ambiance"), onglets, this._ongletAmb)}
        <div class="ed-mcontenu">${onglets.map(([id, t, , h]) => `<section role="tabpanel" id="amb-pan-${id}" aria-labelledby="amb-tab-${id}" data-onglet="${id}" tabindex="0" ${id === this._ongletAmb ? "" : "hidden"}><h3 class="ed-mtitre">${esc(t)}</h3>${h}</section>`).join("")}</div>
        <aside class="ed-amb-apercu" aria-label="${_t("Aperçu")}"></aside></div></div>`);
    const P = V;
    this._cablerChamps(V);
    this._apercuAmb(V.querySelector(".ed-amb-apercu"));
    P.onclick = (ev) => {
      const el = ev.composedPath().find((n) => n.dataset && (n.dataset.act || n.dataset.ambSet || n.dataset.animEffacer || n.dataset.animPal));
      if (!el) return;
      const ds = el.dataset;
      if (ds.act === "amb-fermer") return this.panneauAmbiance(false);
      if (ds.act === "amb-reinit") return this._majAmb((d) => { delete d.animations; });
      if (ds.ambSet) { const [k, v] = ds.ambSet.split(":"); return this._majAmb((d) => { if (v === "discret") delete d.ambiance[k]; else d.ambiance[k] = v; }); }
      if (ds.animEffacer) return this._majAmb((d) => poserChemin((d.animations ||= {}), ds.animEffacer, ""));
      // couleur nommée de la palette : l'animation garde le nom et suit la palette
      if (ds.animPal) return this._majAmb((d) => { const an = (d.animations ||= {}), [e] = ds.animPal.split("."); if (typeof an[e] === "string") an[e] = { type: an[e] }; poserChemin(an, ds.animPal, ds.couleur); });
    };
    const clicAl = P.onclick;
    P.onclick = async (ev) => {
      const b = ev.composedPath().find((n) => n.dataset?.alAct);
      if (!b) return clicAl(ev);
      const [op, i, k] = b.dataset.alAct.split(":");
      if (op === "nouvelle") return this._majAmb((d) => { (d.alertes ||= []).push({ nom: _t("Alerte"), entites: [] }); });
      if (op === "intrusion") return this._majAmb((d) => { (d.alertes ||= []).push({ nom: _t("Ouverture alors que la maison est vide"), type: "ouvertures", si_absent: true }); });
      if (op === "suppr") return this._majAmb((d) => { d.alertes.splice(+i, 1); });
      if (op === "retirer") return this._majAmb((d) => { const r = d.alertes[+i], l = [...(r.entites || []), ...(r.entite ? [r.entite] : [])]; l.splice(+k, 1); delete r.entite; r.entites = l; });
      if (op === "ajouter") {
        const e = await this.choisirEntite({ titre: _t("Entité de l'alerte") });
        if (e) this._majAmb((d) => { const r = d.alertes[+i]; r.entites = [...new Set([...(r.entites || []), ...(r.entite ? [r.entite] : []), e])]; delete r.entite; });
      }
    };
    P.querySelectorAll("[data-alk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const v = inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim();
      poserChemin(d.alertes, inp.dataset.alk, v);
    }); });
    P.querySelectorAll("[data-alk-chk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => poserChemin(d.alertes, inp.dataset.alkChk, inp.checked)); });
    P.querySelectorAll("[data-amb-chk]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const k = inp.dataset.ambChk;
      if (k === "actif") { if (inp.checked) d.ambiance = { ...(d.ambiance || {}) }; else delete d.ambiance; return; }
      if (k === "energie" || k === "personnes") { if (inp.checked) d.ambiance[k] = {}; else delete d.ambiance[k]; return; }
      if (k === "jour_nuit") { if (inp.checked) delete d.ambiance.jour_nuit; else d.ambiance.jour_nuit = false; return; }
      if (k === "marqueur") { const j = typeof d.ambiance.jour_nuit === "object" ? d.ambiance.jour_nuit : {}; if (inp.checked) delete j.marqueur; else j.marqueur = false; if (Object.keys(j).length) d.ambiance.jour_nuit = j; else delete d.ambiance.jour_nuit; }
    }); });
    // réglage d'une personne quand elle est dehors (`par_personne`) : vide = comme les autres
    P.querySelectorAll("[data-amb-pers]").forEach((inp) => { inp.onchange = () => this._majAmb((d) => {
      const pe = d.ambiance?.personnes;
      if (!pe) return;
      const o = typeof pe === "object" && !Array.isArray(pe) ? pe : Array.isArray(pe) ? { entites: pe } : {}, e = inp.dataset.ambPers;
      const pp = o.par_personne && typeof o.par_personne === "object" ? o.par_personne : {}, r = { ...(pp[e] && typeof pp[e] === "object" ? pp[e] : {}) };
      if (inp.value) r.dehors = inp.value; else delete r.dehors;
      if (Object.keys(r).length) pp[e] = r; else delete pp[e];
      if (Object.keys(pp).length) o.par_personne = pp; else delete o.par_personne;
      d.ambiance.personnes = o;
    }); });
    P.querySelectorAll("[data-amb]").forEach((inp) => {
      const k = inp.dataset.amb;
      if (inp.type === "range") inp.oninput = () => { inp.parentElement.querySelector("output").textContent = +inp.value ? `${inp.value} min` : _t("aucune"); };
      inp.onchange = () => this._majAmb((d) => {
        const v = inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value;
        if (v === "__perso") return; // position glissée sur le plan : déjà enregistrée
        if (k === "traces") { if (+v === 10) delete d.ambiance.traces; else d.ambiance.traces = +v || false; return; }
        if (k === "meteo" && d.ambiance.meteo && typeof d.ambiance.meteo === "object") { if (v) d.ambiance.meteo.entite = v; else delete d.ambiance.meteo; return; }
        if (k.includes(".")) { const [p] = k.split("."); if (!d.ambiance[p] || typeof d.ambiance[p] !== "object" || Array.isArray(d.ambiance[p])) d.ambiance[p] = {}; return poserChemin(d.ambiance, k, v); }
        if (v === "" || v == null) delete d.ambiance[k]; else d.ambiance[k] = v;
      });
    });
    P.querySelectorAll("[data-anim]").forEach((inp) => {
      inp.onchange = () => this._majAmb((d) => {
        const an = (d.animations ||= {}), [ev] = inp.dataset.anim.split(".");
        if (typeof an[ev] === "string") an[ev] = { type: an[ev] };
        poserChemin(an, inp.dataset.anim, inp.dataset.num ? (inp.value === "" ? "" : Math.min(20, Math.max(0.2, +inp.value))) : inp.value);
      });
    });
    // modale : voile (clic = fermer), onglets, champs déclaratifs (Lumière), « Placer sur le plan » (personnes)
    const clicAmb = P.onclick;
    P.onpointerdown = (ev) => { this._basVoileAmb = ev.target === P; };
    P.onclick = async (ev) => {
      if (ev.target === P) { if (this._basVoileAmb) this.panneauAmbiance(false); return; }
      const ch = ev.composedPath(), og = ch.find((n) => n.dataset?.ongletAmb);
      if (og) return this.ongletAmbiance(og.dataset.ongletAmb);
      if (ch.some((n) => n.dataset?.act === "amb-placer")) {
        this._ambCachee = true; P.hidden = true;
        return this.snack(_t("Glisse les avatars sur le plan, puis Échap pour revenir à l'ambiance."));
      }
      if (ch.some((n) => n.dataset && (n.dataset.parAuto != null || n.dataset.parEffacer != null || (n instanceof HTMLButtonElement && n.dataset.par)))) return this._clicChamp(ch);
      return clicAmb(ev);
    };
    this._clavierModale(P, "ongletAmb", (o) => this.ongletAmbiance(o));
    this._cablerIcones(P);
    const cont = P.querySelector(".ed-mcontenu");
    if (cont) cont.scrollTop = defile;
    this._indiceDefilement?.(P.querySelector(".ed-onglets"));
    if (garde) P.querySelector(garde)?.focus({ preventScroll: true });
  }
  // panneau Ambiance ouvert : glisser les avatars à la maison déplace leur point de rassemblement (ambiance.personnes.maison,
  // en cm, sur la grille sauf Alt) ; le résumé des personnes n'est pas redessiné pendant le glisser
  glisserPersonnes(ev) {
    const c = this.carte, R = c.shadowRoot, x0 = ev.clientX, y0 = ev.clientY, m0 = c._pointMaison(), a = c._pxVersCm(x0, y0);
    getSelection?.()?.removeAllRanges?.();
    const els = () => [...R.querySelectorAll(".calque>.pers[data-pers]:not(.dehors)")];
    let actif = false, pos = null;
    c._glissePers = true;
    const mv = (e) => {
      if (!actif) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) < 4) return;
        actif = true;
        els().forEach((el) => el.classList.add("glisse"));
      }
      e.preventDefault();
      const b = c._pxVersCm(e.clientX, e.clientY), g = e.altKey ? 1 : this.grille || 1, q = c.vue();
      pos = [0, 1].map((k) => Math.round((m0[k] + b[k] - a[k]) / g) * g);
      els().forEach((el) => {
        el.dataset.x = pos[0]; el.dataset.y = pos[1];
        el.style.left = `${((pos[0] - q.x0) / q.W) * 100}%`; el.style.top = `${((pos[1] - q.y0) / q.H) * 100}%`;
      });
    };
    const fin = (e) => {
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
      c._glissePers = false;
      els().forEach((el) => el.classList.remove("glisse"));
      if (!actif) return;
      c._aBouge = true;
      setTimeout(() => { c._aBouge = false; }, 0);
      if (e.type !== "pointerup" || !pos) return c._majPersonnes();
      const p = pos.map((x) => Math.round(x));
      this._majAmb((d) => {
        const v = d.ambiance?.personnes;
        if (!d.ambiance) return;
        d.ambiance.personnes = Array.isArray(v) ? { entites: v, maison: p } : { ...(v && typeof v === "object" ? v : {}), maison: p };
      });
      this.snack(_t("Personnes placées ici quand elles sont à la maison."));
    };
    window.addEventListener("pointermove", mv, { passive: false }); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
  }
  // une ligne par personne : avatar, nom, et où la mettre quand elle est dehors (comme les autres / direction / zone / masquée)
  _lignesPersonnes(d) {
    const pe = d.ambiance?.personnes, o = pe && typeof pe === "object" && !Array.isArray(pe) ? pe : {}, l = this.carte._listePersonnes(d.ambiance);
    if (!l.length) return "";
    const N = { direction: _t("Direction et distance"), zone: _t("Zone"), cache: _t("Masquée") }, g = N[o.dehors] ? o.dehors : "direction";
    return `<div class="ed-champ ed-pers"><label>${_t("Quand elle est dehors")}</label><div class="ed-aide">${_t("Réglage commun (⚙ Paramètres) : {mode}", { mode: N[g] })}</div>${l.map(({ entite: e }) => {
      const nom = this.carte._nom(e) === e ? e.split(".")[1] : this.carte._nom(e), v = o.par_personne?.[e]?.dehors;
      const ini = initiales(nom);
      return `<div class="ed-pers-l"><span><i aria-hidden="true">${esc(ini)}</i>${esc(nom)}</span><select data-amb-pers="${esc(e)}" aria-label="${esc(_t("{nom} : quand elle est dehors", { nom }))}">
        <option value="">${_t("Comme les autres")}</option>${Object.entries(N).map(([k, n]) => `<option value="${esc(k)}" ${v === k ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
    }).join("")}</div>`;
  }
  _champNombreAl(k, v) { return `<div class="ed-champ"><label>${_t("Ou au-dessus de")}</label><input type="number" step="any" data-alk="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="—"></div>`; }
  // écriture de l'ambiance ou des animations : objets vides retirés (le YAML reste minimal)
  _majAmb(fn) {
    this.commit(() => {
      const d = this.d;
      fn(d);
      if (Array.isArray(d.alertes) && !d.alertes.length) delete d.alertes;
      if (d.animations) {
        for (const [k, v] of Object.entries(d.animations)) if (!v || (typeof v === "object" && !Object.keys(v).length)) delete d.animations[k];
        if (!Object.keys(d.animations).length) delete d.animations;
      }
    });
  }
} // @assemblage
