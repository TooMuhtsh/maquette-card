// classe MaquetteCard : statiques, setConfig, hass, langue, cycle de vie, minuterie, mise en page, squelette, ouverture de l'éditeur — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement {
  static PUCES = [{ type: "ouvertures" }, { type: "lumieres" }, { type: "volets" }, { type: "temperature" }];
  static MEUBLES = MEUBLES;
  static normaliser = normaliserConfig;
  static COULEURS_TYPE = COULEURS_TYPE;
  static dessinMeuble = dessinMeuble;
  static normaliserForme = normaliserForme;
  static traitsOuverture = traitsOuverture;
  static LUMIERE = { couche: coucheLumiere, tache: tacheLumiere, baies: baiesFenetres, couleur: couleurLampe, phases: PHASES_LUNE, ciel: LUM_CIEL, kelvin: kelvinRgb,
    fond: lumiereFond, bornes: vitrageBornes, lune: positionLune, voisins: lumiereVoisins, passage: passageLumiere, lames: partLames, interieure: ouvertureInterieure };
  static couleurSure = (c) => !!couleurSure(c);
  static couleurEcrite = couleurEcrite;
  static palette = palette;
  static poserHTML = poserHTML;
  static ajouterHTML = ajouterHTML;
  static VERSION = VERSION;
  static serviceSensible = serviceSensible;
  static get DEPOT() { return DEPOT; } // dépôt du projet (défini plus bas, avec l'enregistrement de la carte)
  static CATS_MEUBLES = { sejour: _tk("Séjour"), repas: _tk("Repas"), cuisine: _tk("Cuisine"), chambre: _tk("Chambre et bureau"), salle_eau: _tk("Salle d'eau"),
    technique: _tk("Technique"), formes: _tk("Formes et espaces"), exterieur: _tk("Extérieur") };
  static CALQUES = { svg: CALQUES_SVG, html: CALQUES_HTML, noms: NOMS_CALQUES, icones: ICONES_CALQUES };
  static niveauMeuble = niveauMeuble;
  static ANIMATIONS = ANIMATIONS;
  static EVENEMENTS_ANIM = EVENEMENTS_ANIM;
  static animDe = animDe;
  static evenementPoint = evenementPoint;
  // format public (YAML en anglais) ↔ config interne : pour l'éditeur, les tests et la migration des anciennes configs
  static depuisAnglais = depuisAnglais;
  static contactsDe = contactsDe;
  static etatCombine = etatCombine;
  static versAnglais = versAnglais;
  static SCHEMA_ANGLAIS = N_RACINE;
  // étages : config repliée ↔ dépliée sur un étage, toute la maison par étage, identifiants, étage du chargement
  static ETAGES = { deplier, replier, parEtage, ids: idsEtages, etageInitial, CLES_ETAGE };
  // valeurs par défaut des réglages globaux (panneau ⚙ Paramètres de l'éditeur)
  // outils communs à la carte et à l'éditeur (une seule définition, lue par l'éditeur au chargement)
  static outils = { dansPoly, distBord, entitesZone, esc, fmt, canon, GENRES_FICHE, porteurDe, deCle, BASCULES, NOMS_OUVERTURE, initiales, borne,
    TAILLE_MEUBLE_MAX, CHAMPS_ENTITE_WIDGET, stock, stockSession, cleRouvrir, cleVersions };
  static REGLAGES = { vitesses: VITESSES_REPLAY, teinte: TEINTE_DEF, presence: "zone.home", heures: 24, vitesse: 900, marge: 40 };

  setConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("maquette-card : invalid configuration");
    // format public en anglais → config interne (clés françaises) ; clés inconnues ignorées avec un avertissement
    config = depuisAnglais(config);
    // langue de l'interface (option `language`, sinon celle de HA) : choisie avant la démo, dont les noms en dépendent
    this._lgOpt = config.langue;
    const relangue = this._langue();
    // `demo: true` : l'appartement de démonstration et ses états simulés (rien n'est commandé dans la maison)
    if (config.demo && typeof PlanDemo !== "undefined") {
      config = { ...PlanDemo.config(), ...(typeof config.titre === "string" ? { titre: config.titre } : {}) };
      const brut = this._sim ? this._hassBrut : this._hass;
      this._sim ||= new PlanDemo.Simulation();
      if (relangue) this._sim.renommer();
      // jamais un appel vers la maison avec la config de démo, même au premier rendu
      if (brut) { this._hassBrut = brut; this._hass = this._hassDemo(brut); }
    } else if (this._sim) {
      this._desabonner?.(); this._desabonner = null; this._sim = null;
      if (this._hassBrut) this._hass = this._hassBrut;
      this._hassBrut = null; this._cacheStat = {}; this._cacheHisto = {};
    }
    const rapport = {};
    config = normaliserConfig(config, rapport);
    // éléments sans géométrie valide : ignorés, signalés discrètement (console ; l'éditeur le dit à l'ouverture)
    if (rapport.ignores && this._ignores !== rapport.ignores) console.warn(`maquette-card : ${rapport.ignores} element(s) without valid coordinates ignored`);
    this._ignores = rapport.ignores;
    // valeurs invalides retirées (coordonnées, couleurs, icônes, valeurs énumérées…) : signalées une fois dans la console
    const ret = (rapport.retires || []).join(", ");
    if (ret && ret !== this._retires) console.warn(`maquette-card : invalid value(s) removed: ${ret.length > 400 ? `${ret.slice(0, 400)}…` : ret}`);
    this._retires = ret;
    if (this._editeur) {
      // config rechargée après notre propre enregistrement : on garde l'éditeur ouvert
      if (canon(config) === canon(replier(this._editeur.original))) return;
      // modifiée ailleurs pendant l'édition : on garde le travail en cours, le conflit sera proposé à l'enregistrement
      this._editeur.externe = JSON.parse(JSON.stringify(config));
      this._editeur.snack(_t("Ce plan vient d'être modifié ailleurs : à l'enregistrement, tu choisiras de garder ta version ou non."), _t("Exporter le mien"), () => this._editeur.exporter(), 12000);
      return;
    }
    // étages : _plein = config repliée (normalisée), _config = l'étage affiché déplié à la racine, _etage = son id (null sans étages)
    // étage du chargement : `default_floor`, sinon le dernier vu sur ce navigateur, sinon le premier ; même plan à étages rechargé
    // (enregistrement, tableau de bord modifié) : on reste sur l'étage affiché s'il existe encore
    const reste = idsEtages(this._plein).length > 1 && this._plein.id === config.id && idsEtages(config).includes(this._etage);
    this._plein = JSON.parse(JSON.stringify(config));
    this._etage = reste ? this._etage : etageInitial(this._plein, stock.lire(this._cleEtage()));
    this._config = deplier(this._plein, this._etage);
    this._ok = false;
    if (relangue) this._textesSquelette();
    if (this._hass) this._construire();
  }

  set hass(hass) {
    const relangue = this._langue(hass);
    if (relangue) this._sim?.renommer();
    if (this._sim) { this._hassBrut = hass; hass = this._hassDemo(hass); }
    this._hass = hass;
    if (!this._ok) this._construire();
    else if (relangue) this._relangue();
    else if (this._rp) return; // replay : le plan montre l'historique, pas le direct
    else if (this._change()) this._maj();
  }

  // langue de l'interface : option `language` (en | fr), sinon celle du profil HA, sinon celle de la page ; elle est commune à la page
  // (MaquetteI18n), chaque carte la remet à la sienne avant de se dessiner. Renvoie true si elle a changé pour cette carte.
  _langue(hass = this._hass) {
    const I = globalThis.MaquetteI18n, l = this._lgOpt;
    I.definir(hass, l === "en" || l === "fr" ? l : null);
    const avant = this._lg;
    this._lg = `${I.langue()}|${I.locale()}`;
    return avant != null && avant !== this._lg;
  }

  // changement de langue sans recharger : textes fixes, plan, résumé, widgets et éditeur ouvert redessinés (fiche et replay fermés)
  _relangue() {
    if (this._rp) this._replayFermer();
    this.shadowRoot?.querySelector("dialog.mf")?.close();
    this._textesSquelette();
    this._construire();
    const ed = this._editeur;
    if (ed) { ed._barre(); ed._panneau(); }
  }

  _textesSquelette() {
    const R = this.shadowRoot;
    if (!R) return;
    for (const [sel, cle] of [[".retour", _tk("Toute la maison")], [".editer", _tk("Modifier le plan")], ["[data-z=calques]", _tk("Calques affichés")],
      ["[data-z=plus]", _tk("Zoomer")], ["[data-z=moins]", _tk("Dézoomer")], ["[data-z=tout]", _tk("Toute la maison")], ["[data-z=replay]", _tk("Revoir la journée")]]) {
      const b = R.querySelector(`.barre ${sel}, .zoom ${sel}`);
      if (b) b.title = _t(cle);
    }
  }

  // démo : hass de HA, avec les états de la simulation par-dessus, ses services et son historique (soleil et coordonnées réels)
  _hassDemo(h) {
    const sim = this._sim;
    sim.placer(h.config);
    if (!this._desabonner) this._desabonner = sim.abonner(() => { if (this._hassBrut && this.isConnected) this.hass = this._hassBrut; });
    const w = Object.create(h);
    w.states = { ...h.states, ...sim.etats };
    w.callService = (d, s, data, cible) => sim.service(d, s, data, cible);
    w.callWS = (m) => sim.ws(m);
    return w;
  }

  disconnectedCallback() { this._desabonner?.(); this._desabonner = null; if (this._rp) this._replayFermer(); if (this._editeur) this._editeur.fermer(true); this.shadowRoot?.querySelector("dialog.mf")?.close(); clearInterval(this._tm); this._tm = 0; this._vu?.disconnect(); this._vu = null; clearInterval(this._tmBi); this._tmBi = 0; clearTimeout(this._tmRetour); this._tmRetour = 0; }
  connectedCallback() {
    if (this._sim && this._hassBrut) this.hass = this._hassBrut; // la simulation reprend
    if (this._sq) requestAnimationFrame(() => { this._mise(); this._majCrayon(); if (this._ok) this._minuterie(); });
  }

  // ambiance : traces qui s'estompent et soleil qui avance (toutes les 30 s) ; animations en pause quand le plan n'est pas à l'écran
  _minuterie() {
    const A = this._config.ambiance, il = !!(A && !this._editeur && (coucheTraces(A) || coucheJour(A)));
    if (il && !this._tm) this._tm = setInterval(() => { if (this.isConnected && this._ok) { this._majTraces(); this._majAmbiance(); } }, 30000);
    if (!il && this._tm) { clearInterval(this._tm); this._tm = 0; }
    // tablette murale : anti-marquage (jamais en édition, où la carte reste à sa place)
    const bi = !!this._tablette()?.anti_marquage;
    if (bi && !this._tmBi) this._tmBi = setInterval(() => { if (this.isConnected && this._ok) this._pasAntiMarquage(); }, PAS_ANTI_MARQUAGE);
    if (!bi && this._tmBi) { clearInterval(this._tmBi); this._tmBi = 0; }
    if (!bi && this._bi != null) { this._bi = null; this.shadowRoot?.querySelector("ha-card")?.style.removeProperty("transform"); }
    const z = this.shadowRoot?.querySelector(".zone");
    if (z && !this._vu && typeof IntersectionObserver === "function") {
      this._vu = new IntersectionObserver((l) => { for (const e of l) {
        e.target.classList.toggle("hors-ecran", !e.isIntersecting);
        const sv = e.target.querySelector("svg"); // animations SMIL (météo)
        if (sv?.pauseAnimations) { if (e.isIntersecting) sv.unpauseAnimations(); else sv.pauseAnimations(); }
      } });
      this._vu.observe(z);
    }
  }

  // réglages effectifs : interaction, mode tablette (jamais en édition : l'éditeur montre tout), niveau d'animation
  _tablette() { return this._editeur ? null : tabletteDe(this._config); }
  _figee() { return !this._editeur && interactionDe(this._config).figee; }
  _niveauAnim() { return niveauAnimDe(this._config); }
  // animations SMIL (météo, flux d'énergie, vitrine) dessinées figées : niveau réduit ou aucun, ou mouvement réduit demandé par le système
  _sansBoucles() { return this._niveauAnim() !== "complet" || matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // un pas d'anti-marquage : décalage de la carte entière (transform, sans effet sur la mise en page ; reconnu des vieilles WebView)
  _pasAntiMarquage() {
    const card = this.shadowRoot?.querySelector("ha-card");
    if (!card) return;
    this._bi = (this._bi ?? 12) + 1;
    const [x, y] = decalageAntiMarquage(this._bi);
    if (x || y) card.style.transform = `translate(${x}px, ${y}px)`; else card.style.removeProperty("transform");
  }

  // `interaction.reset_after` : compte à rebours relancé à chaque action sur la carte
  _activite() {
    clearTimeout(this._tmRetour); this._tmRetour = 0;
    const s = this._config ? interactionDe(this._config).retour : 0;
    if (s > 0) this._tmRetour = setTimeout(() => this._retourAuto(), s * 1000);
  }
  // jamais pendant l'édition ni pendant la lecture d'un replay : le compte à rebours reprend
  _retourAuto() {
    this._tmRetour = 0;
    if (!this._ok || !this.isConnected || !(interactionDe(this._config).retour > 0)) return;
    if (this._editeur || this._rp?.lecture) return this._activite();
    this.revenirAuPlan();
    // étages : retour à `default_floor` (sinon au premier), même vue figée
    const e = etageInitial(this._plein, null);
    if (e != null && e !== this._etage) this._changerEtage(e);
  }
  // retour au plan entier : fiche et menu des calques fermés, replay en pause fermé (retour au direct), vue de la pièce fermée, zoom initial
  revenirAuPlan() {
    const R = this.shadowRoot, d = R?.querySelector("dialog.mf");
    if (d?.open) d.close();
    this._menuCalques(false);
    if (this._rp && !this._rp.lecture) this._replayFermer();
    if (this._iso != null || this._vue) this.toutVoir();
  }

  // pleine page : la carte occupe la hauteur restante de l'écran, le plan tient sans défilement
  _mise() {
    const R = this.shadowRoot, card = R?.querySelector("ha-card");
    if (!card || !this._box) return;
    // sur téléphone (carte étroite) : défilement de page autorisé, plan en pleine largeur et fiche dépliée dessous
    // mode tablette : toujours en pleine page, quelle que soit la largeur
    const plein = this._tablette() ? true : this._config.plein_ecran !== false && this.clientWidth >= 760;
    card.classList.toggle("plein", plein);
    if (plein) {
      const haut = card.getBoundingClientRect().top - (this._bi != null ? decalageAntiMarquage(this._bi)[1] : 0); // sans le décalage anti-marquage
      if (haut >= 0) card.style.height = `${Math.max(420, window.innerHeight - haut - 8)}px`;
    } else card.style.height = "";
    const corps = R.querySelector(".corps"), plan = R.querySelector(".plan");
    const { P } = this._panneauxCourants(), aG = !!P.gauche?.length, aD = !!P.droite?.length;
    const cw = corps.clientWidth, ch = plein ? corps.clientHeight : Infinity, r = this._box.W / this._box.H;
    const fiche = !R.querySelector(".fiche").hidden, ed = !!this._editeur, vue = R.querySelector(".vue");
    const mode = cw >= 1180 ? "large" : cw >= 760 ? "moyen" : "etroit";
    if (mode !== this._modeMise) { this._modeMise = mode; this._widgets(); }
    // en édition, la vue finale garde exactement sa mise en page (l'éditeur n'a plus de panneau latéral : rien n'est pris à sa largeur)
    const reduite = ed && mode !== "etroit";
    this._zVue = 1;
    card.classList.toggle("ed-etroit", ed && mode === "etroit");
    vue.style.zoom = "";
    vue.style.width = reduite ? `${cw}px` : "";
    vue.style.height = reduite && plein ? `${ch}px` : "";
    const voirG = mode === "large" && (aG || ed);
    const voirD = fiche || aD || (mode !== "large" && aG) || (ed && mode !== "etroit");
    R.querySelector(".col-g").hidden = !voirG;
    R.querySelector(".col-d").hidden = !voirD;
    const cote = voirD || ed;
    corps.classList.toggle("colonne", mode === "etroit" && cote);
    const dispoW = mode === "etroit" ? cw : cw - (voirG ? 336 : 0) - (voirD ? 336 : 0);
    const dispoH = mode === "etroit" && cote && plein ? ch * 0.6 : ch;
    plan.style.width = `${Math.floor(Math.max(200, Math.min(dispoW, (dispoH - 16) * r + 16)))}px`;
    this._ajusterCols();
    this._tailleBadges();
  }

  // badge de valeur masqué quand le meuble fait moins de 24 px à l'écran (recalculé au zoom et au redimensionnement)
  _tailleBadges(v = this.vue()) {
    const R = this.shadowRoot, z = R?.querySelector(".zone"), l = R?.querySelectorAll(".calque>.mb");
    // textes figés sur le plan : ils grossissent et rapetissent avec le zoom comme le dessin (1 = plan entier de la vue)
    z?.style.setProperty("--zk", +((this._refW || v.W) / v.W).toFixed(4));
    this._rangeePersonnes();
    this._eviterPastilles();
    if (!l?.length || !z.clientWidth) return;
    const k = z.clientWidth / v.W;
    l.forEach((b) => {
      const m = this._config.meubles?.[+b.dataset.mbq], t = m && (m.taille || MEUBLES[m.type]?.taille || [60, 60]);
      if (t) b.classList.toggle("petit", Math.min(nb(t[0], 60), nb(t[1], 60)) * k < 24);
    });
  }

  // étiquette de pièce recouverte par une pastille (petit écran surtout) : décalée vers la place libre la plus proche (au plus deux
  // hauteurs d'étiquette en hauteur, une largeur en largeur) ; rien ne bouge sans chevauchement. En vue seulement : dans l'éditeur, l'étiquette reste à
  // la position qu'on règle. Recalculé à la mise en page, au zoom et quand les valeurs changent.
  _eviterPastilles() {
    const R = this.shadowRoot, etqs = [...(R?.querySelectorAll(".calque>.etq") || [])];
    etqs.forEach((e) => { if (e.classList.contains("evite")) { e.classList.remove("evite"); e.style.removeProperty("--dx"); e.style.removeProperty("--dy"); } });
    if (this._editeur || !etqs.length) return;
    const pts = [...R.querySelectorAll(".calque>.pt")].map((p) => p.getBoundingClientRect()).filter((r) => r.width > 0);
    if (!pts.length) return;
    const pris = [];
    for (const e of etqs) {
      const r = e.getBoundingClientRect();
      if (!r.width) continue;
      const libre = (dx, dy) => !pts.some((p) => p.left < r.right + dx - 2 && p.right > r.left + dx + 2 && p.top < r.bottom + dy - 2 && p.bottom > r.top + dy + 2)
        && !pris.some((q) => q.left < r.right + dx && q.right > r.left + dx && q.top < r.bottom + dy && q.bottom > r.top + dy);
      if (libre(0, 0)) continue;
      let mieux = null;
      for (let dy = -Math.round(r.height * 2 / 4) * 4; dy <= r.height * 2; dy += 4)
        for (let dx = -Math.round(r.width / 4) * 4; dx <= r.width; dx += 4) {
          const d = Math.hypot(dx * 1.5, dy); // un peu plus loin en largeur : l'étiquette reste au-dessus ou au-dessous de sa place
          if ((!mieux || d < mieux.d) && libre(dx, dy)) mieux = { dx, dy, d };
        }
      if (!mieux) continue;
      const z = this._zVue || 1;
      e.classList.add("evite");
      e.style.setProperty("--dx", `${mieux.dx / z}px`); e.style.setProperty("--dy", `${mieux.dy / z}px`);
      pris.push({ left: r.left + mieux.dx, right: r.right + mieux.dx, top: r.top + mieux.dy, bottom: r.bottom + mieux.dy });
    }
  }

  static getStubConfig() {
    return versAnglais({ titre: _t("Mon plan"), pieces: [{ nom: _t("Pièce"), poly: [[0, 0], [400, 0], [400, 300], [0, 300]], etiquette: [200, 150] }],
      murs: [[0, 0, 400, 0], [400, 0, 400, 300], [400, 300, 0, 300], [0, 300, 0, 0]] });
  }

  getCardSize() { return 14; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  // entités suivies : celles de TOUTE la maison (résumé, alertes et pastilles d'étage comptent tous les étages) ; sans étages, la config
  _entites() {
    const c = this._config, l = [], E = parEtage(c);
    for (const e of E) for (const p of e.geo.pieces) l.push(p.temperature, p.humidite);
    for (const e of E) for (const t of e.geo.textes) if (Array.isArray(t?.infos)) for (const x of t.infos) l.push(x?.entite);
    for (const e of E) for (const o of e.geo.ouvertures) { l.push(...contactsDe(o), o.volet, o.entite); for (const w of o.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const e of E) for (const p of e.geo.points) { l.push(p.entite, p.actif, p.valeur); for (const w of p.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const e of E) for (const m of e.geo.meubles) { l.push(m.entite, m.actif, m.valeur); for (const w of m.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const w of [...(c.panneaux?.gauche || []), ...(c.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    for (const q of this._puces()) if (q.afficher === "absent" || q.afficher === "present") l.push(q.presence || presenceDefaut(c)); // puces selon la présence
    for (const p of c.pieces) for (const w of [...(p.panneaux?.gauche || []), ...(p.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    const A = c.ambiance;
    if (coucheJour(A)) l.push(coucheJour(A).soleil || "sun.sun");
    if (coucheMeteo(A)) l.push(coucheMeteo(A).entite);
    const LU = coucheLumiere(A);
    if (LU) l.push(soleilDe(A), ...(LU.lune ? [this._entiteLune(LU)] : []));
    l.push(...this._listePersonnes(A).map((p) => p.entite));
    for (const r of Array.isArray(c.alertes) ? c.alertes : []) if (r && typeof r === "object") {
      l.push(r.entite, ...(Array.isArray(r.entites) ? r.entites : []), r.si_absent ? r.presence || presenceDefaut(c) : null);
      if (r.type === "ouvertures") for (const e of E) for (const o of e.geo.ouvertures) l.push(...contactsDe(o), o.entite);
    }
    return [...new Set(l.filter((e) => typeof e === "string" && e.includes(".")))];
  }

  _change() {
    let diff = false;
    for (const e of this._suivies) {
      const s = this._hass.states[e];
      if (s !== this._prec[e]) { this._prec[e] = s; diff = true; }
    }
    return diff;
  }

  _squelette() {
    if (this._sq) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    poserHTML(this.shadowRoot, `<style>${CSS}${CSS_BARRE}</style><ha-card>
      <div class="barre"><button class="ib retour" hidden title="${_t("Toute la maison")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button><div class="titre"></div>
        <button class="ib editer" title="${_t("Modifier le plan")}" hidden><ha-icon icon="mdi:pencil-ruler"></ha-icon></button></div>
      <div class="tete"></div>
      <div class="corps"><div class="vue"><aside class="col col-g" hidden><div class="col-in"><div class="widgets"></div></div></aside><div class="plan"><div class="zone"></div>
        <div class="zoom"><button data-z="calques" title="${_t("Calques affichés")}" aria-expanded="false" hidden><ha-icon icon="mdi:layers-outline"></ha-icon></button>
          <button data-z="plus" title="${_t("Zoomer")}"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button data-z="moins" title="${_t("Dézoomer")}"><ha-icon icon="mdi:minus"></ha-icon></button>
          <button data-z="tout" title="${_t("Toute la maison")}" hidden><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button>
          <button data-z="replay" title="${_t("Revoir la journée")}" hidden><ha-icon icon="mdi:history"></ha-icon></button></div></div>
        <aside class="col col-d" hidden><div class="col-in"><div class="fiche" hidden></div><div class="widgets"></div></div></aside></div></div>
      <div class="legende"></div></ha-card>`);
    const R = this.shadowRoot;
    R.querySelector("ha-card").addEventListener("click", (ev) => {
      const chemin = ev.composedPath();
      const z = chemin.find((n) => n.dataset?.z);
      if (z?.dataset.z === "calques") return this._menuCalques();
      const al = chemin.find((n) => n.dataset?.al);
      if (al) return this._actionAlerte(al.dataset.al);
      if (z?.dataset.z === "replay") return this._rp ? this._replayFermer() : this._replayOuvrir();
      const rp = chemin.find((n) => n.dataset?.rp);
      if (rp) return this._actionReplay(rp.dataset.rp);
      if (chemin.some((n) => n.classList?.contains("replay"))) return;
      if (z) return z.dataset.z === "tout" ? this.toutVoir() : this.zoomer(z.dataset.z === "plus" ? 1 / 1.6 : 1.6);
      if (chemin.some((n) => n.classList?.contains("menu-cq"))) return;
      if (chemin.some((n) => n.classList?.contains("retour"))) return this.toutVoir();
      const dep = chemin.find((n) => n.dataset?.depart);
      if (dep) return this._demarrer(dep.dataset.depart);
      if (this._editeur) {
        const aj = chemin.find((n) => n.dataset?.ajouter);
        if (aj) { const pc = this._panneauxCourants(); return this._editeur.ouvrirCatalogue({ widgets: true, cote: aj.dataset.ajouter, piece: pc.pi, ...(pc.pf ? { [pc.pf.genre]: pc.pf.i } : {}) }); }
        if (chemin.some((n) => n.dataset?.ajouterPuce != null)) return this._editeur.ajouterPuce();
        if (this._puceGlissee) return;
        const pu = chemin.find((n) => n.dataset?.puce != null);
        if (pu) return this._editeur.selectionner({ type: "puce", i: +pu.dataset.puce });
        if (this._wDrag) { this._wDrag = false; return; }
        const w = chemin.find((n) => n.dataset?.w);
        if (w) this._editeur.selectionner(this._selWidget(w.dataset.w));
        return;
      }
      if (this._aBouge) { this._aBouge = false; return; }
      const mb = chemin.find((n) => n.dataset && (n.dataset.mbq != null || (n.dataset.mb != null && n.classList?.contains("connecte"))));
      if (mb) return this._clicMeuble(+(mb.dataset.mbq ?? mb.dataset.mb));
      // interrupteur (vue de la pièce, lignes des widgets) : avant la ligne qui le porte (sa fiche, plus d'infos)
      const bas = chemin.find((n) => n.classList?.contains("bascule"));
      if (bas) return this._basculer(bas);
      // ouverture ou pastille (sur le plan ou dans la fiche d'une pièce) : sa fiche si elle en a une, sinon le comportement d'avant
      const po = chemin.find((n) => n.dataset && (n.dataset.o ?? n.dataset.fo ?? n.dataset.q ?? n.dataset.fq) != null);
      if (po && this._clicPorteur((po.dataset.o ?? po.dataset.fo) != null ? "ouverture" : "point", +(po.dataset.o ?? po.dataset.fo ?? po.dataset.q ?? po.dataset.fq))) return;
      const cmd = chemin.find((n) => n.dataset?.cmd);
      if (cmd) return this._lancerCommande(cmd);
      const act = chemin.find((n) => n.dataset?.active);
      if (act) return this._activer(act);
      const th = chemin.find((n) => n.dataset?.th);
      if (th) return this._reglerThermostat(th);
      const cta = chemin.find((n) => n.classList?.contains("cta"));
      if (cta) return this._lancerAction(cta);
      if (chemin.some((n) => n.classList?.contains("voile"))) return this.toutVoir();
      const piece = chemin.find((n) => n.dataset && (n.dataset.l != null || n.dataset.p != null));
      const ip = piece ? +(piece.dataset.l ?? piece.dataset.p) : null;
      // pièce réglée sans vue (`zoom: false`, ex. extérieurs) : pas de zoom, seulement l'entité de son étiquette s'il y en a une
      if (ip != null && ip !== this._iso && this._config.pieces[ip]?.zoom !== false) {
        // `interaction.room_tap` : vue de la pièce (défaut), « plus d'infos » de son entité `tap` (sinon de sa température), ou rien
        const cp = interactionDe(this._config).clic, p = this._config.pieces[ip];
        if (cp === "vue") return this.isoler(ip);
        if (cp === "infos") this._plusInfos(p.clic || p.temperature);
        return;
      }
      const el = chemin.find((n) => n.dataset && n.dataset.e);
      if (!el || this._sim) return;
      const e = new Event("hass-more-info", { bubbles: true, composed: true });
      e.detail = { entityId: el.dataset.e };
      this.dispatchEvent(e);
    });
    R.querySelector(".editer").addEventListener("click", () => this.ouvrirEditeur());
    R.querySelector(".tete").addEventListener("pointerdown", (ev) => {
      const pu = this._editeur && ev.composedPath().find((n) => n.dataset?.puce != null);
      if (pu) this._editeur.glisserPuce(ev, pu);
    });
    this._glisserWidgets(R.querySelector(".vue"));
    this._gestes(R.querySelector(".zone"));
    // édition, panneau Ambiance ouvert : les avatars à la maison se glissent (point de rassemblement `ambiance.personnes.maison`) ;
    // en capture, avant les écouteurs de l'éditeur (sélection, cadre, déplacement de la vue)
    R.querySelector(".zone").addEventListener("pointerdown", (ev) => {
      if (!this._editeur?.vueAmbiance || ev.button > 0) return;
      const p = ev.composedPath().find((n) => n.classList?.contains("pers") && n.dataset?.pers && !n.classList.contains("dehors"));
      if (!p) return;
      ev.preventDefault(); // ni sélection de texte ni glisser natif (qui annulerait le pointeur)
      ev.stopImmediatePropagation();
      this._editeur.glisserPersonnes(ev);
    }, true);
    R.querySelector(".zone").addEventListener("keydown", (ev) => {
      if (this._editeur || (ev.key !== "Enter" && ev.key !== " ")) return;
      const g = ev.target.closest?.(".ouv.a-fiche[tabindex]");
      if (g) { ev.preventDefault(); this._clicPorteur("ouverture", +g.dataset.o); }
    });
    // `interaction.reset_after` : toute action sur la carte (plan, fiche, menus) relance le compte à rebours du retour au plan entier
    for (const t of ["pointerdown", "keydown", "wheel"]) this.addEventListener(t, () => this._activite(), { passive: true });
    this._ro = new ResizeObserver(() => this._mise());
    this._ro.observe(this);
    window.addEventListener("resize", (this._surResize = () => this._mise()));
    this._sq = true;
  }

  async ouvrirEditeur(reprise = null) {
    if (this._editeur || this._ouverture) return;
    if (this._rp) this._replayFermer();
    this._ouverture = true;
    try {
      // l'éditeur est embarqué dans le même fichier (build.mjs : globalThis.MaquetteEditeur)
      const EditeurPlan = globalThis.MaquetteEditeur;
      if (EditeurPlan && this.isConnected) new EditeurPlan(this, reprise);
    } finally { this._ouverture = false; }
  }

  // boutons de l'état vide : ouvre l'éditeur puis lance l'assistant, l'outil rectangle ou l'import
  async _demarrer(a) {
    if (!this._editeur) await this.ouvrirEditeur();
    const e = this._editeur;
    if (!e) return;
    ({ pieces: () => e.assistantPieces(), rectangle: () => e.choisirOutil("rectangle"), importer: () => e.exporter() })[a]?.();
  }

  _reprise() {
    if (this._editeur || !this._hass?.user?.is_admin) return;
    const cle = cleRouvrir(this._config.id);
    let r = null;
    try { r = JSON.parse(sessionStorage.getItem(cle) || "null"); sessionStorage.removeItem(cle); } catch (e) { return; }
    if (r && Date.now() - r.t < 30000) setTimeout(() => this.ouvrirEditeur(r), 0);
  }

} // @assemblage
