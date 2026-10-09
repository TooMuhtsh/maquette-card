// sections communes (animation, connecté, fiche), fiches proposées, groupes, rectangle, sélection — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // section « Animation » d'un élément : remplace celle de l'événement pour cet élément seulement
  _sectionAnimation(o, ev, cle = "animation", titre = _t("Animation")) {
    const C = this.carte.constructor, AN = C.ANIMATIONS, base = C.animDe(this.d, ev, null), a = typeof o[cle] === "string" ? { type: o[cle] } : o[cle] || {};
    return `<details class="ed-avance"${o[cle] ? " open" : ""}><summary>${esc(titre)}${a.type && AN[a.type] ? ` · ${esc(_t(AN[a.type]))}` : ""}</summary>
      <div class="ed-aide">${_t("Par défaut : celle du plan ({anim}).", { anim: esc(_t(AN[base.type]).split(" (")[0]) })}</div>
      <div class="ed-champ"><label>${_t("Type")}</label><select data-k="${cle}.type"><option value="">${_t("Celle du plan")}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${a.type === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>
      <div class="ed-ligne"><div class="ed-champ"><label>${a.couleur ? _t("Couleur") : _t("Couleur (celle de l'élément)")}</label><span class="ed-couleur-anim ed-couleurs">${this._nuancierPalette(a.couleur, `${cle}.couleur`)}<input type="color" data-k="${cle}.couleur" value="${esc(hexOu(a.couleur, "#f4b400"))}">${a.couleur ? `<button class="ib" data-effacer="${cle}.couleur" title="${_t("Couleur de l'élément")}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</span></div>
        ${this._champNombre(_t("Durée d'un cycle (s)"), `${cle}.duree`, a.duree, 0.1, `${base.duree}`)}</div>
      <div class="ed-ligne">${this._champNombre(_t("Intensité (0,2 à 2)"), `${cle}.intensite`, a.intensite, 0.1, "1")}
        ${ev === "meuble" ? `<div class="ed-champ"><label>${_t("Forme de l'onde")}</label><select data-k="${cle}.forme"><option value="">${_t("Cercle")}</option><option value="contour" ${a.forme === "contour" ? "selected" : ""}>${_t("Contour du meuble")}</option></select></div>` : ""}</div></details>`;
  }

  // j = nouvelle place dans la liste affichée (premier plan en haut, donc ordre de dessin inversé)
  _deplacerCalque(groupe, k, j) {
    const vue = [...this.carte._calques()[groupe]].reverse().filter((x) => x !== k);
    vue.splice(j, 0, k);
    this._majCalques((q) => { q[`ordre_${groupe}`] = vue.reverse(); });
  }

  // section « Connecté » d'un meuble : entité, valeur, comportement au toucher, protection, fiche (widgets)
  _sectionConnecte(o, def) {
    const dom = (o.entite || "").split(".")[0], lie = !!(o.entite || o.valeur || o.fiche);
    const defaut = o.fiche ? _t("la fiche") : o.entite || o.valeur ? _t("la fiche HA") : _t("rien");
    let h = `<h4>${_t("Connecté")}${bulleI(_t("S'allume sur le plan et ouvre sa fiche au toucher."))}</h4>
      ${this._champEntite(_t("Entité"), "entite", o.entite, true)}`;
    if (!lie) return h;
    const parType = this.carte.constructor.COULEURS_TYPE?.[o.type];
    h += `${this._champEntite(_t("Valeur affichée sur le meuble"), "valeur", o.valeur, true, "sensor")}
      <div class="ed-champ"><label>${_t("Couleur sur le plan")}</label><div class="ed-couleurs">${this._pastilles(o.couleur)}
          <input type="color" data-k="couleur" value="${esc(hexOu(o.couleur || parType, "#1a73e8"))}" title="${_t("Autre couleur")}">
          ${o.couleur ? `<button class="ed-btn texte" data-effacer="couleur">${parType ? _t("Couleur du type") : _t("Accent du thème")}</button>` : ""}</div></div>
      ${this._interInv(_t("Toujours teinté"), "teinte", o.teinte !== false, _t("Sinon seulement quand il est actif."))}
      ${this._champClic(o, defaut, _t("Rien (pas cliquable)"))}
      ${this._champsInterrupteur(o, dom)}
      <details class="ed-avance" ${o.actif || o.actif_attribut || o.seuil != null || o.unite || o.decimales != null ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <h4>${_t("Quand le meuble est « actif » (contour coloré)")}${bulleI(_t("Par défaut : quand l'entité est allumée, ouverte ou en marche."))}</h4>
        ${this._champEntite(_t("Selon une autre entité"), "actif", o.actif, true)}
        <div class="ed-ligne">${this._champTexte(_t("ou selon l'attribut"), "actif_attribut", o.actif_attribut, _t("ex. hvac_action"))}${this._champNombre(_t("Actif au-dessus de"), "seuil", o.seuil, 1, _t("ex. 5 (W)"))}</div>
        <div class="ed-ligne">${this._champTexte(_t("Unité de la valeur"), "unite", o.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, "0")}</div>
</details>
      ${this._listeFiche(o, "meuble", o.nom || _t(def.nom), _t("Sans widget, la fiche montre l'état et le bouton marche / arrêt."))}`;
    const pastilles = this._pastillesProches(o);
    if (pastilles.length) h += `<div class="ed-champ"><label>${_t("Pastille de la même entité à côté")}</label>${pastilles.map((j) => `<button class="ed-btn tonal" data-act="fusion:${j}" title="${_t("La pastille est retirée, sa valeur, son état actif et sa couleur passent au meuble (Annuler possible)")}"><ha-icon icon="mdi:merge"></ha-icon>${_t("Fusionner avec « {nom} »", { nom: esc(this.d.points[j].nom || this.carte._nom(this.d.points[j].entite)) })}</button>`).join("")}</div>`;
    return h;
  }

  // interrupteur marche / arrêt de l'élément (fiche, vue de la pièce) : protection (pas d'arrêt) et confirmation forcée (`confirm`)
  _champsInterrupteur(o, dom) {
    if (!BASCULES.includes(dom)) return "";
    return `${this._inter(_t("Protégé (sans bouton d'arrêt)"), "protege", o.protege, _t("Pas de bouton d'arrêt dans la fiche (frigo, congélateur…)."))}
      ${this._inter(_t("Toujours demander confirmation"), "confirmer", o.confirmer, _t("Marche et arrêt confirmés avant chaque appel (fiche, vue de la pièce), ex. une porte de garage commandée par un switch."))}`;
  }
  // « Au toucher, en vue » : défaut (texte), fiche, plus d'infos ou rien (libellé selon l'élément)
  _champClic(o, defaut, rien) {
    return `<div class="ed-champ"><label>${_t("Au toucher, en vue")}</label><select data-k="clic"><option value="">${_t("Par défaut ({d})", { d: defaut })}</option>
        ${[["fiche", _t("Ouvrir sa fiche")], ["infos", _t("Ouvrir la fiche HA (plus d'infos)")], ["aucun", rien]].map(([v, n]) => `<option value="${esc(v)}" ${o.clic === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
  }
  // position x / y d'un élément (cm)
  _champXY(o) { return `<div class="ed-ligne">${this._champNombre(_t("x (cm)"), "pos.0", o.pos[0], 1)}${this._champNombre(_t("y (cm)"), "pos.1", o.pos[1], 1)}</div>`; }
  // fiche d'une ouverture ou d'une pastille : comportement au toucher, protection, widgets (mêmes outils que pour un meuble)
  _sectionFiche(o, genre) {
    const e = genre === "ouverture" ? contactsOuv(o)[0] || o.entite : o.entite, dom = (e || "").split(".")[0];
    const defaut = o.fiche ? _t("la fiche") : (genre === "ouverture" ? e || o.volet : o.entite) ? _t("la fiche HA") : _t("rien");
    const titre = o.nom || (e || o.volet ? this.carte._nom(e || o.volet) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture")));
    return `${this._champClic(o, defaut, _t("Rien"))}
      ${this._champsInterrupteur(o, dom)}
      ${this._listeFiche(o, genre, titre, genre === "ouverture" ? _t("Sans widget, la fiche montre l'état du contact (et du volet) ; « commande » pour piloter un volet ou un portail.") : _t("Sans widget, la fiche montre l'état et, pour une lumière ou une prise, le bouton marche / arrêt."))}`;
  }
  // titre, liste des widgets et actions d'une fiche (meuble, ouverture ou pastille sélectionné)
  _listeFiche(o, genre, titreDef, aide) {
    const l = o.fiche?.widgets || [], i = this.sel.i;
    const remplir = genre === "meuble" ? this._entitesAppareil(o.entite).length > 1 : this._proposer(genre, o).widgets.length > 0;
    return `<h4>${_t("Fiche ({n} widget)|Fiche ({n} widgets)", { n: l.length })}${bulleI(`${_t("Mêmes widgets que les panneaux.")} ${aide}`)}</h4>
      ${this._champTexte(_t("Titre de la fiche"), "fiche.titre", o.fiche?.titre, titreDef)}
      ${this._champPlusInfos(o)}
      ${l.length ? `<div class="ed-liste">${l.map((w, j) => `<button data-choix="${cle({ type: "widget", cote: "fiche", i: j, [genre]: i })}"><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(w.titre || typeWidgetEn(w.type))}<small>${esc(typeWidgetEn(w.type))}</small></span></button>`).join("")}</div>` : ""}
      <div class="ed-actions"><button class="ed-btn contour" data-act="fiche-ajouter"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un widget")}</button>
        ${remplir ? `<button class="ed-btn tonal" data-act="fiche-remplir" title="${_t("Widgets proposés d'après les entités du même appareil HA : aperçu, puis validation")}"><ha-icon icon="mdi:auto-fix"></ha-icon>${_t("Remplir depuis l'appareil")}</button>` : ""}
        ${l.length ? `<button class="ed-btn contour" data-act="fiche-modele" title="${_t("Réutilisable pour une autre fiche ou dans un panneau (Ajouter › Mes modèles)")}"><ha-icon icon="mdi:bookmark-plus-outline"></ha-icon>${_t("Fiche en modèle")}</button>` : ""}</div>`;
  }

  // bouton « Plus d'infos » de la fiche (`card.more_info`) : par défaut l'entité de la fiche, une autre entité, une page (chemin ou URL), ou masqué
  _champPlusInfos(o) {
    const pi = o.fiche?.plus_infos, lien = (v) => typeof v === "string" && /^(\/|https?:\/\/)/i.test(v);
    const mode = pi === false ? "masque" : typeof pi === "string" && pi ? (lien(pi) ? "lien" : "entite") : this._modeInfos === cle(this.sel) ? "lien" : "";
    const opts = [["", _t("Par défaut (entité de la fiche)")], ["entite", _t("Une autre entité")], ["lien", _t("Une page (chemin ou URL)")], ["masque", _t("Masqué")]];
    return `<div class="ed-champ"><label>${_t("Bouton « Plus d'infos »")}${bulleI(_t("Ce que fait le bouton ⓘ en haut de la fiche : plus d'infos de HA pour une entité, ou ouverture d'une page (/lovelace/energie, https://…)."))}</label>
        <select data-k="_plus_infos">${opts.map(([v, n]) => `<option value="${esc(v)}" ${mode === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${mode === "entite" ? this._champEntite(_t("Entité ouverte"), "fiche.plus_infos", pi, false) : ""}
      ${mode === "lien" ? this._champTexte(_t("Chemin ou URL"), "fiche.plus_infos", lien(pi) ? pi : "", "/lovelace/energie") : ""}`;
  }

  // ---------- pré-remplissage de la fiche et fusion avec une pastille ----------
  // entités du même appareil HA (device_id) que l'entité du meuble, visibles et pas de configuration
  _entitesAppareil(e) {
    const hass = this.hass, dev = e && hass.entities?.[e]?.device_id;
    if (!dev) return [];
    return Object.entries(hass.entities).filter(([id, x]) => x.device_id === dev && !x.hidden && x.entity_category !== "config" && hass.states[id]).map(([id]) => id).sort();
  }
  // pastilles de la même entité à moins de 1,5 m du meuble
  _pastillesProches(m) {
    if (!m.entite) return [];
    return (this.d.points || []).map((p, j) => (p.entite === m.entite && Math.hypot(nbr(p.pos?.[0]) - nbr(m.pos?.[0]), nbr(p.pos?.[1]) - nbr(m.pos?.[1])) < 150 ? j : -1)).filter((j) => j >= 0);
  }
  fusionner(j) {
    const m = this._objet(), p = this.d.points?.[j];
    if (this.sel?.type !== "meuble" || !m || !p) return;
    const nom = p.nom || this.carte._nom(p.entite);
    this.commit(() => {
      for (const k of ["valeur", "actif", "actif_attribut", "seuil", "attribut", "unite", "decimales", "couleur"]) if (p[k] != null && p[k] !== "" && m[k] == null) m[k] = clone(p[k]);
      if (!m.nom && p.nom) m.nom = p.nom;
      this.d.points.splice(j, 1);
    });
    this.snack(p.halo ? _t("Pastille « {nom} » fusionnée dans le meuble (son halo est retiré).", { nom }) : _t("Pastille « {nom} » fusionnée dans le meuble.", { nom }), _t("Annuler##defaire"), this._annulation(), 10000);
  }
  // widgets proposés d'après le type de meuble et les entités de l'appareil (device_class, unités, noms) ; rien n'est écrit ici
  _proposerFiche(m) {
    const hass = this.hass, ents = this._entitesAppareil(m.entite).filter((e) => e !== m.entite || !["switch", "light", "fan", "input_boolean"].includes(e.split(".")[0]));
    const st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, u = (e) => String(st(e)?.attributes.unit_of_measurement || ""), dom = (e) => e.split(".")[0];
    const txt = (e) => sansAccent(`${e} ${st(e)?.attributes.friendly_name || ""}`);
    const capteur = (e) => dom(e) === "sensor";
    const souscrit = (e) => /souscri|subscri|abonnement/.test(txt(e));
    const G = {
      puissance: ents.filter((e) => capteur(e) && (dc(e) === "power" || ["W", "kW"].includes(u(e)))),
      apparente: ents.filter((e) => capteur(e) && !souscrit(e) && (dc(e) === "apparent_power" || ["VA", "kVA"].includes(u(e)))),
      energie: ents.filter((e) => capteur(e) && (dc(e) === "energy" || ["kWh", "Wh", "MWh"].includes(u(e)))),
      cout: ents.filter((e) => capteur(e) && !/\/\s*kwh/i.test(u(e)) && (dc(e) === "monetary" || /€|eur/i.test(u(e)))),
      prix: ents.filter((e) => capteur(e) && /\/\s*kwh/i.test(u(e))),
      tension: ents.filter((e) => capteur(e) && (dc(e) === "voltage" || u(e) === "V")),
      courant: ents.filter((e) => capteur(e) && (dc(e) === "current" || u(e) === "A")),
      temperature: ents.filter((e) => capteur(e) && (dc(e) === "temperature" || /°[CF]/.test(u(e)))),
      alerte: ents.filter((e) => dom(e) === "binary_sensor" && (["problem", "safety", "heat", "smoke", "moisture", "gas"].includes(dc(e)) || /alerte|alarm|surchauffe|overheat|defaut|erreur|fault/.test(txt(e)))),
      branche: ents.filter((e) => dom(e) === "binary_sensor" && ["plug", "battery_charging"].includes(dc(e))),
      climat: ents.filter((e) => dom(e) === "climate"), media: ents.filter((e) => dom(e) === "media_player"), souscrite: ents.filter((e) => capteur(e) && souscrit(e)),
    };
    // coût calculé par le tableau Énergie de HA pour un compteur de l'appareil (sensor.x_cost)
    for (const e of G.energie) for (const c of [`${e}_cost`, `${e}_cout`]) if (st(c) && !G.cout.includes(c)) G.cout.push(c);
    const ordre = (l) => [...l].sort((a, b) => { const r = (e) => [/session/, /jour|today|aujourd/, /hier|yesterday/, /semaine|week/, /mois|month/, /annee|annuel|year/].findIndex((x) => x.test(txt(e))); return ((r(a) + 7) % 7) - ((r(b) + 7) % 7) || a.localeCompare(b); });
    const lignes = (l) => l.map((e) => ({ entite: e }));
    const W = [], pw = G.puissance[0], reglages = {};
    const conso = (titre, extra = []) => {
      const l = [...extra, ...ordre(G.energie), ...ordre(G.cout)];
      if (pw) W.push({ type: "tuile", titre, icone: "mdi:flash", entite: pw, decimales: 0, historique: 24, ...(l.length ? { lignes: lignes(l) } : {}) });
      else if (l.length) W.push({ type: "entites", titre, entites: lignes(l) });
    };
    if (m.type === "borne_recharge") {
      conso(_t("Puissance de charge"));
      const l = [...G.branche, ...G.tension, ...G.temperature, ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Borne"), icone: "mdi:ev-station", entites: lignes(l) });
    } else if (m.type === "tableau_elec") {
      const p = pw || G.apparente[0], sc = G.souscrite.map((e) => parseFloat(st(e).state) * (/^k/i.test(u(e)) ? 1000 : 1)).find((x) => x > 0);
      if (p) W.push({ type: "jauge", titre: _t("Puissance"), icone: "mdi:home-lightning-bolt", entite: p, min: 0, max: Math.round(sc || 6000), decimales: 0 });
      const res = [...G.apparente.filter((e) => e !== p), ...G.puissance.filter((e) => e !== p), ...G.tension, ...G.courant];
      if (res.length) W.push({ type: "entites", titre: _t("Réseau"), icone: "mdi:transmission-tower", entites: lignes(res) });
      const en = ordre(G.energie);
      if (en.length) W.push({ type: "entites", titre: _t("Consommation"), icone: "mdi:lightning-bolt", entites: lignes([...en, ...ordre(G.cout)]) });
      // Tempo et prix : souvent une autre intégration que le compteur, cherchés dans toute l'installation
      const tous = Object.keys(hass.states), tempo = (re) => tous.find((e) => e.startsWith("sensor.") && /tempo/.test(txt(e)) && re.test(txt(e)));
      const prix = G.prix[0] || tous.find((e) => e.startsWith("sensor.") && /\/\s*kwh/i.test(u(e)));
      const cj = tempo(/aujourd|today|jour/), cd = tempo(/demain|tomorrow/);
      if (prix || cj || cd) W.push({ type: "tarif", titre: _t("Tarif"), ...(prix ? { prix } : {}), ...(cj ? { couleur_jour: cj } : {}), ...(cd ? { couleur_demain: cd } : {}) });
    } else if (m.type === "chaudiere" || G.climat.length) {
      const l = [...G.climat, ...G.temperature, ...G.puissance, ...ordre(G.energie), ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Chauffage"), icone: "mdi:water-boiler", entites: lignes(l) });
    } else {
      conso(m.type === "meuble_tv" ? _t("Télévision") : _t("Consommation"), G.media);
      if (!pw && !G.energie.length) { const l = ents.filter((e) => e !== m.entite).slice(0, 8); if (l.length) W.push({ type: "entites", titre: _t("Appareil"), entites: lignes(l) }); }
      else if (G.alerte.length || G.temperature.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes([...G.temperature, ...G.alerte]) });
    }
    if (!m.valeur && pw) reglages.valeur = pw;
    if (!m.actif && pw && ["switch", "input_boolean"].includes(dom(m.entite || ""))) Object.assign(reglages, { actif: pw, seuil: m.type === "borne_recharge" ? 50 : 5 });
    return { widgets: W, reglages, n: ents.length };
  }
  // entités de référence d'une ouverture ou d'une pastille (contact, volet, entité motorisée ; entité de la pastille)
  _sources(genre, o) { return (genre === "ouverture" ? [...contactsOuv(o), o.volet, o.entite] : genre === "point" ? [o.entite] : [o.entite]).filter((e) => typeof e === "string" && e.includes(".")); }
  // propositions selon le genre de l'élément ; rien n'est écrit ici
  _proposer(genre, o) {
    if (genre === "meuble") return this._proposerFiche(o);
    return genre === "ouverture" ? this._proposerFicheOuverture(o) : this._proposerFichePoint(o);
  }
  // capteurs d'un appareil de contact : batterie, manipulation (tamper), compteurs du jour (« ouvertures », « aération »)
  _capteursContact(ents) {
    const hass = this.hass, st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, dom = (e) => e.split(".")[0];
    const txt = (e) => sansAccent(`${e} ${st(e)?.attributes.friendly_name || ""}`);
    const compteurs = ents.filter((e) => dom(e) === "sensor" && /ouvertures|aeration|openings|times opened|airing|ventilation/.test(txt(e)));
    let batterie = ents.filter((e) => dom(e) === "sensor" && (dc(e) === "battery" || (/batter/.test(txt(e)) && st(e)?.attributes.unit_of_measurement === "%")));
    if (!batterie.length) batterie = ents.filter((e) => dom(e) === "binary_sensor" && dc(e) === "battery");
    const tamper = ents.filter((e) => dom(e) === "binary_sensor" && (dc(e) === "tamper" || /tamper|manipulation|sabotage|arrachement/.test(txt(e))));
    return { batterie, tamper, compteurs };
  }
  // ouverture : volet ou portail en widget « commande », contact, batterie, manipulation, compteurs du jour (même appareil HA)
  _proposerFicheOuverture(o) {
    const hass = this.hass, src = this._sources("ouverture", o), ents = [...new Set(src.flatMap((e) => this._entitesAppareil(e)))].filter((e) => !src.includes(e));
    const dom = (e) => e.split(".")[0], lignes = (l) => [...new Set(l)].map((e) => ({ entite: e })), W = [];
    const { batterie, tamper, compteurs } = this._capteursContact(ents), cover = (e) => typeof e === "string" && e.startsWith("cover.");
    const icone = { fenetre: "mdi:window-closed-variant", porte: "mdi:door", portail: "mdi:gate" }[o.type] || "mdi:door";
    if (o.type === "portail") {
      const c = cover(o.entite) ? o.entite : cover(o.volet) ? o.volet : null;
      if (c) W.push({ type: "commande", titre: o.nom || hass.states[c]?.attributes.friendly_name || _t("Portail"), entite: c, confirmer: true });
      // capteurs liés : ceux des mêmes appareils (hors diagnostic, sauf la batterie), le contact s'il y en a un
      const diag = (e) => hass.entities?.[e]?.entity_category === "diagnostic";
      const autres = ents.filter((e) => ["binary_sensor", "sensor"].includes(dom(e)) && (!diag(e) || batterie.includes(e)));
      const l = [...contactsOuv(o), ...autres].filter(Boolean);
      if (l.length) W.push({ type: "entites", titre: _t("Capteurs"), icone: "mdi:gate", entites: lignes(l) });
      return { widgets: W, reglages: {}, n: ents.length + src.length };
    }
    if (cover(o.volet)) W.push({ type: "commande", titre: _t("Volet"), entite: o.volet });
    if (cover(o.entite)) W.push({ type: "commande", titre: o.nom || hass.states[o.entite]?.attributes.friendly_name || _t("Ouverture motorisée"), entite: o.entite });
    const nc = contactsOuv(o).length, capteur = [...contactsOuv(o), ...batterie, ...tamper].filter(Boolean);
    // le contact seul n'apporte rien de plus que l'en-tête de la fiche, sauf à côté d'un volet ; plusieurs contacts : déjà listés en tête de la fiche
    if (capteur.length > nc || (nc === 1 && W.length)) W.push({ type: "entites", titre: _t("Capteur"), icone, entites: lignes(capteur) });
    if (compteurs.length) W.push({ type: "entites", titre: _t("Aujourd'hui"), icone: "mdi:counter", entites: lignes(compteurs) });
    return { widgets: W, reglages: {}, n: ents.length + src.length };
  }
  // pastille : selon le domaine de son entité (cover → commande, capteur → courbe, détecteur → batterie…, sinon comme un meuble)
  _proposerFichePoint(p) {
    const hass = this.hass, e = p.entite;
    if (typeof e !== "string" || !e.includes(".")) return { widgets: [], reglages: {}, n: 0 };
    const d = e.split(".")[0], ents = this._entitesAppareil(e).filter((x) => x !== e), st = (x) => hass.states[x], dom = (x) => x.split(".")[0], lignes = (l) => [...new Set(l)].map((x) => ({ entite: x }));
    const diag = (x) => hass.entities?.[x]?.entity_category === "diagnostic", mesures = ents.filter((x) => ["sensor", "binary_sensor"].includes(dom(x)) && !diag(x));
    const W = [];
    if (d === "cover") {
      W.push({ type: "commande", titre: p.nom || st(e)?.attributes.friendly_name || _t("Commande"), entite: e });
      if (mesures.length) W.push({ type: "entites", titre: _t("Capteurs"), entites: lignes(mesures) });
    } else if (d === "sensor") {
      const num = !isNaN(parseFloat(st(e)?.state));
      W.push(num ? { type: "tuile", titre: st(e)?.attributes.friendly_name || _t("Valeur"), entite: e, historique: 24 } : { type: "entites", titre: _t("Valeur"), entites: lignes([e]) });
      if (mesures.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes(mesures.slice(0, 8)) });
    } else if (d === "binary_sensor") {
      const { batterie, tamper } = this._capteursContact(ents), reste = mesures.filter((x) => !batterie.includes(x) && !tamper.includes(x));
      W.push({ type: "entites", titre: _t("Détecteur"), icone: p.icone, entites: lignes([e, ...batterie, ...tamper, ...reste.slice(0, 6)]) });
    } else return { ...this._proposerFiche({ entite: e }), reglages: {} }; // lumière, prise, média, climat… : comme un meuble connecté, sans toucher à la pastille
    return { widgets: W, reglages: {}, n: ents.length + 1 };
  }
  // aperçu des widgets proposés (vrai rendu), puis « Ajouter » ou « Remplacer la fiche »
  remplirFiche() {
    const s = this.sel, m = this._objet(), src = m && Object.hasOwn(GENRES_FICHE, s?.type) ? this._sources(s.type, m) : [];
    if (!src.length) return;
    const { widgets, reglages, n } = this._proposer(s.type, m), e0 = src.find((e) => this.hass.entities?.[e]?.device_id) || src[0], dev = this.hass.devices?.[this.hass.entities?.[e0]?.device_id];
    if (!widgets.length) return this.snack(s.type === "meuble" ? _t("Rien à proposer : l'appareil n'a pas de mesure reconnue (puissance, énergie, coût, tension…).") : _t("Rien à proposer : pas d'autre entité reconnue sur cet appareil."));
    const deja = (m.fiche?.widgets || []).length, R = this.R, carte = this.carte;
    let apercu;
    carte._sansBascule = true;
    try { apercu = widgets.map((w, j) => { try { return carte._widget(w, "apercu", j); } catch (e) { return ""; } }).join("").replace(/ data-w="[^"]*"/g, ""); } finally { carte._sansBascule = false; }
    const NOMS = { valeur: _t("Valeur affichée"), actif: _t("Actif selon"), seuil: _t("au-dessus de") };
    const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue large" role="dialog" aria-modal="true" aria-label="${_t("Remplir la fiche depuis l'appareil")}"><header><h2>${_t("Remplir la fiche depuis l'appareil")}</h2>
        <div class="ed-aide">${_t("« {nom} » : {n} entité. Widgets proposés.|« {nom} » : {n} entités. Widgets proposés.", { nom: esc(dev?.name_by_user || dev?.name || this.carte._nom(e0)), n })}</div></header>
      <div class="ed-cat"><div class="ed-apercu-fiche">${apercu}</div>
        ${Object.keys(reglages).length ? `<h4>${s.type === "meuble" ? _t("Réglages du meuble") : _t("Réglages de l'élément")}</h4><div class="ed-aide">${Object.entries(reglages).map(([k, v]) => `${NOMS[k]} : ${esc(k === "seuil" ? `${v}` : this.carte._nom(v))}`).join(" · ")}</div>` : ""}</div>
      <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="">${_t("Annuler")}</button>
        ${deja ? `<button class="ed-btn texte" data-r="remplacer">${_t("Remplacer la fiche ({n} widget)|Remplacer la fiche ({n} widgets)", { n: deja })}</button>` : ""}
        <button class="ed-btn plein" data-r="ajouter"><ha-icon icon="mdi:check"></ha-icon>${deja ? _t("Ajouter à la fiche") : _t("Ajouter")}</button></footer></div>`, { echap: () => fermer(null) });
    const fermer = (r) => {
      retirer();
      if (!r) return;
      this.commit(() => {
        const l = this._wl({ cote: "fiche", [s.type]: s.i }, true);
        if (r === "remplacer") l.length = 0;
        l.push(...clone(widgets));
        Object.assign(m, reglages);
        this.sel = { type: s.type, i: s.i };
      });
      this.snack(_t("Fiche remplie : {n} widget. Clique-les dans l'aperçu pour les modifier.|Fiche remplie : {n} widgets. Clique-les dans l'aperçu pour les modifier.", { n: widgets.length }), _t("Annuler##defaire"), this._annulation(), 10000);
    };
    // l'aperçu n'est pas éditable : ses clics ne vont pas à la carte (sélection d'un widget, plus d'infos…)
    voile.onclick = (ev) => { ev.stopPropagation(); const b = ev.composedPath().find((x) => x.dataset?.r != null); if (ev.target === voile || b) fermer(b?.dataset.r || null); };
    voile.querySelector("[data-r=ajouter]").focus();
  }
  // fiche vide (ni titre ni widget) : clé retirée, le YAML reste minimal
  _nettoyerFiche(m) {
    if (!m?.fiche || typeof m.fiche !== "object") return;
    if (Array.isArray(m.fiche.widgets) && !m.fiche.widgets.length) delete m.fiche.widgets;
    if (!m.fiche.titre) delete m.fiche.titre;
    if (!Object.keys(m.fiche).length) delete m.fiche;
  }
  async enregistrerFiche() {
    const m = this._objet(), l = m?.fiche?.widgets || [];
    if (!l.length) return;
    const r = await this.demander(_t("Enregistrer la fiche comme modèle"), m.fiche.titre || m.nom || (this.sel?.type === "meuble" ? (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : null) : this.sel?.type === "point" ? this.carte._nom(m.entite) : null) || _t("Fiche"), _t("Garder les entités (sinon les widgets sont à relier à nouveau)"));
    if (!r) return;
    const objets = r.coche ? clone(l) : sansEntites(clone(l));
    this.commit(() => (this.d.modeles ||= []).push({ nom: r.nom, genre: "widget", icone: "mdi:card-text-outline", desc: _t("Fiche · {n} widget|Fiche · {n} widgets", { n: l.length }), objets }));
    this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
  }

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

  _finirTrace() {
    const o = this.outil, t = this.trace;
    this.trace = [];
    this._info("");
    if (o === "piece" && t.length >= 3) {
      const z = this.zoneEnAttente;
      this.zoneEnAttente = null;
      this.commit(() => { this.d.pieces.push({ nom: z ? this.hass.areas?.[z]?.name || z : _t("Nouvelle pièce"), poly: t, etiquette: centre(t), ...(z ? { zone: z } : {}) }); this.sel = { type: "piece", i: this.d.pieces.length - 1 }; });
      this.choisirOutil("selection");
      if (z) { this.integrer(this.d.pieces.length - 1); return; }
      setTimeout(() => this.R.querySelector('.ed-edit input[data-k="nom"]')?.select(), 50);
      return;
    }
    this.carte._construire();
  }

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
