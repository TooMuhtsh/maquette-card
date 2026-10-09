// classe EditeurPlan : constructeur, UI, barre d'outils, menus, historique, brouillon, apresConstruction — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
export class EditeurPlan {
  // réglages de la modale ⚙ Paramètres (lecture seule : pour les tests et l'intégration)
  static SECTIONS_PARAMETRES = SECTIONS_PARAMETRES;
  // lecture / écriture d'un réglage, par son chemin ou par son champ (sans historique) ; reglerParametre(chemin, v) écrit avec annulation (Ctrl+Z)
  static PARAMETRES = { sections: SECTIONS_PARAMETRES, lire: (d, c) => lireReglage(d, champDe(c)),
    ecrire: (d, c, v) => { const f = champDe(c); if (f.si && !f.si(d)) return; if (f.ecrire) f.ecrire(d, v); else ecrireReglage(d, f, v); } };
  // alias (champ complet) : lecture où un interrupteur porté par un objet (`tablet: {…}`) vaut true, écriture avec `ecrire` éventuel
  static lireParametre = (d, f) => { const v = lireReglage(d, f); return f.type === "bool" && v && typeof v === "object" ? true : v; };
  static poserParametre = (d, f, v) => (f.ecrire ? f.ecrire(d, v) : ecrireReglage(d, f, v));
  constructor(carte, reprise = null) {
    this.carte = carte;
    this.original = clone(carte._config);
    this.d = clone(carte._config);
    this.histo = []; this.refaire = [];
    this.sel = null; this.outil = "selection"; this.grille = 5; this.modifie = false;
    this.trace = []; this.aPlacer = null; this.survol = null; this.multi = new Set(); this.espace = false;
    carte._config = this.d;
    this._boite(true, carte);
    carte._editeur = this;
    this._monterUI();
    this._cablerAides(); // avant les raccourcis : Échap ferme d'abord une bulle ouverte
    this._touche = this._touche.bind(this);
    window.addEventListener("keydown", this._touche, true);
    this._relache = (ev) => { if (ev.key === " ") { this.espace = false; this.zone?.classList.remove("espace"); } };
    window.addEventListener("keyup", this._relache, true);
    this._avantFermeture = (e) => { if (this.modifie) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", this._avantFermeture);
    if (reprise) {
      this.grille = PAS_GRILLE.includes(+reprise.grille) ? +reprise.grille : 5;
      const s = reprise.sel, simple = (v) => typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && /^[\w:.-]{0,80}$/.test(v);
      this.sel = s && typeof s === "object" && !Array.isArray(s) && Object.values(s).every(simple) ? s : null;
    }
    carte._construire();
    if (reprise) { this._barre(); this._panneau(); this.snack(_t("Plan enregistré.")); } else {
      const n = carte._ignores;
      if (n) this.snack(_t("{n} élément sans coordonnées valides (pièce sans contour, mur sans extrémités…) est ignoré : il sera retiré à l'enregistrement.|{n} éléments sans coordonnées valides (pièce sans contour, mur sans extrémités…) sont ignorés : ils seront retirés à l'enregistrement.", { n }), null, null, 12000);
      this._proposerBrouillon();
      this._cadrerPlan();
    }
  }

  // téléphone : à l'ouverture, la vue est cadrée sur le plan (la zone de dessin garde ses 5 m de marge : « Toute la maison »,
  // dézoomer ou « Recadrer » pour y accéder) ; sur grand écran, tout reste visible d'emblée
  _cadrerPlan() {
    const c = this.carte, B = c._box;
    if (c.clientWidth >= 760 || !this.d.pieces.length || !B) return;
    const b = c.bornes(), m = 80, r = B.W / B.H, W = Math.max(b.W + 2 * m, (b.H + 2 * m) * r), H = W / r;
    c._cadrer({ x0: b.x0 + b.W / 2 - W / 2, y0: b.y0 + b.H / 2 - H / 2, W, H });
  }

  get hass() { return this.carte._hass; }
  // brouillon et versions : par id, ou par empreinte du contenu d'origine pour une carte sans id (plusieurs plans sans id ne se mélangent pas)
  _ident() {
    if (this.d.id != null) return this.d.id;
    let h = 0;
    for (const c of canon({ pieces: [], ...this.original })) h = (h * 31 + c.charCodeAt(0)) | 0;
    return `sansid-${(h >>> 0).toString(36)}`;
  }
  _cle() { return CLE(this._ident()); }
  get R() { return this.carte.shadowRoot; }

  // ---------- interface ----------
  _monterUI() {
    const R = this.R, card = R.querySelector("ha-card");
    this.style = document.createElement("style");
    this.style.textContent = CSS;
    R.prepend(this.style);
    this.barre = document.createElement("div");
    this.barre.className = "ed-barre";
    card.insertBefore(this.barre, R.querySelector(".tete"));
    // pas de panneau latéral : chaque élément s'édite dans sa modale (barre flottante › Modifier, double-clic, Entrée)
    this._barre();
    this.zone = R.querySelector(".zone");
    this._pd = (e) => this._pointeurBas(e);
    this._pm = (e) => this._survolPlan(e);
    this._dbl = (e) => this._double(e);
    this._ctx = (e) => { if (this.outil !== "selection") { e.preventDefault(); this._finirTrace(); } };
    this.zone.addEventListener("pointerdown", this._pd);
    this._suivre = (e) => { this._xy = [e.clientX, e.clientY]; };
    window.addEventListener("pointermove", this._suivre, true);
    window.addEventListener("pointerdown", this._suivre, true);
    this._sortie = () => { const b = this.R.querySelector(".ed-bulle"); if (b) b.hidden = true; };
    this.zone.addEventListener("pointerleave", this._sortie);
    this.zone.addEventListener("pointermove", this._pm);
    this.zone.addEventListener("dblclick", this._dbl);
    this.zone.addEventListener("contextmenu", this._ctx);
  }

  _barre() {
    this._fermerMenu();
    // bouton qui avait le focus (barre redessinée après chaque modification) : il le retrouve ensuite
    const a = this.R.activeElement, garde = a && this.barre.contains(a) ? (a.dataset.a ? `[data-a="${a.dataset.a}"]` : a.dataset.outil ? `[data-outil="${a.dataset.outil}"]` : null) : null;
    const o = (id, ic, t) => `<button data-outil="${id}" class="${this.outil === id ? "on" : ""}" title="${_t(t)}" aria-label="${_t(t)}" aria-pressed="${this.outil === id}"><ha-icon icon="${ic}"></ha-icon></button>`;
    const ib = (a, ic, t, on, pc = true) => `<button class="ib${on ? " on" : ""}${pc ? " ed-pc" : ""}" data-a="${a}" title="${t}" aria-label="${t}"${on != null ? ` aria-pressed="${!!on}"` : ""}><ha-icon icon="${ic}"></ha-icon></button>`;
    // PC : historique | outils | grille, recadrer | panneaux (calques, ambiance) | import / export, paramètres, raccourcis
    // téléphone : la grille et « Plus » (recadrer, calques, ambiance, import / export, paramètres) passent en tête, les outils en 2e rangée
    poserHTML(this.barre, `<div class="ed-defile">
      <span class="ed-groupe ed-histo"><button class="ib" data-a="annuler" title="${_t("Annuler (Ctrl+Z)")}" aria-label="${_t("Annuler (Ctrl+Z)")}" ${this.histo.length ? "" : "disabled"}><ha-icon icon="mdi:undo"></ha-icon></button>
        <button class="ib" data-a="refaire" title="${_t("Rétablir (Ctrl+Y)")}" aria-label="${_t("Rétablir (Ctrl+Y)")}" ${this.refaire.length ? "" : "disabled"}><ha-icon icon="mdi:redo"></ha-icon></button></span>
      <span class="ed-seg ed-outils" role="group" aria-label="${_t("Outils")}">${OUTILS.map(([id, ic, t]) => o(id, ic, t)).join("")}</span>
      <span class="ed-sep ed-pc"></span>
      <button class="ed-menu-btn" data-a="grille" title="${tactile() ? _t("Grille") : _t("Grille (Alt : sans aimant)")}" aria-label="${_t("Pas de la grille : {v} cm", { v: this.grille })}" aria-haspopup="menu" aria-expanded="false">
        <ha-icon icon="mdi:grid"></ha-icon><span><span class="lib">${_t("Grille :")} </span>${_t("{v} cm", { v: this.grille })}</span><ha-icon icon="mdi:menu-down"></ha-icon></button>
      ${ib("recadrer", "mdi:fit-to-screen-outline", _t("Recadrer : tout le plan avec 5 m de marge"))}
      <span class="ed-sep ed-pc"></span>
      ${ib("calques", "mdi:layers-outline", _t("Calques"), !!this.vueCalques)}
      ${ib("ambiance", "mdi:weather-partly-cloudy", _t("Ambiance et animations"), !!this.vueAmbiance)}
      <span class="ed-sep ed-pc"></span>
      ${ib("nettoyer", "mdi:auto-fix", _t("Nettoyer le plan"))}
      ${ib("exporter", "mdi:file-swap-outline", _t("Exporter / importer le plan (YAML, JSON)"))}
      <button class="ib ed-pc${this.vueParametres ? " on" : ""}" data-a="parametres" title="${_t("Paramètres")}" aria-label="${_t("Paramètres")}" aria-haspopup="dialog" aria-expanded="${!!this.vueParametres}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>
      ${sansClavier() ? "" : `<button class="ib ed-pc" data-a="aide" title="${_t("Raccourcis clavier (?)")}" aria-label="${_t("Raccourcis clavier (?)")}" aria-haspopup="dialog"><ha-icon icon="mdi:keyboard-outline"></ha-icon></button>`}</div>
      <div class="ed-fin"><button class="ib ed-plus" data-a="plus" title="${_t("Plus d'outils")}" aria-label="${_t("Plus d'outils")}" aria-haspopup="menu" aria-expanded="false"><ha-icon icon="mdi:dots-vertical"></ha-icon></button>
      <button class="ed-btn tonal" data-a="ajouter" title="${tactile() ? _t("Ajouter un objet ou un widget") : _t("Ajouter un objet ou un widget (A)")}" aria-label="${_t("Ajouter")}"><ha-icon icon="mdi:plus"></ha-icon><span class="lib">${_t("Ajouter")}</span></button>
      <span class="ed-info"></span>
      <button class="ed-btn texte" data-a="quitter" title="${_t("Quitter l'éditeur")}" aria-label="${_t("Quitter l'éditeur")}"><ha-icon icon="mdi:exit-to-app"></ha-icon><span class="lib">${_t("Quitter")}</span></button>
      <button class="ed-btn texte ed-pc" data-a="appliquer" ${this.modifie ? "" : "disabled"} title="${tactile() ? _t("Appliquer : enregistrer sans quitter l'éditeur") : _t("Appliquer : enregistrer sans quitter l'éditeur (Ctrl+S)")}" aria-label="${_t("Appliquer : enregistrer sans quitter l'éditeur")}"><ha-icon icon="mdi:check"></ha-icon><span class="lib">${_t("Appliquer")}</span></button>
      <button class="ed-btn plein${this.modifie ? " modifie" : ""}" data-a="enregistrer" ${this.modifie ? "" : "disabled"} title="${_t("Enregistrer et quitter l'éditeur")}" aria-label="${this.modifie ? _t("Enregistrer (modifications non enregistrées)") : _t("Enregistrer")}"><ha-icon icon="mdi:content-save-outline"></ha-icon><span class="lib">${_t("Enregistrer")}</span></button>
      <span class="ed-saut"></span></div>`);
    // indice de défilement quand tous les outils ne tiennent pas
    const df = this.barre.querySelector(".ed-defile"), indice = () => df.classList.toggle("deborde", df.scrollWidth > df.clientWidth + 2 && df.scrollLeft + df.clientWidth < df.scrollWidth - 2);
    df.onscroll = indice;
    requestAnimationFrame(indice);
    this.barre.onclick = (ev) => {
      const b = ev.composedPath().find((n) => n instanceof HTMLElement && (n.dataset.a || n.dataset.outil));
      if (!b || b.disabled) return;
      if (b.dataset.outil) this.choisirOutil(b.dataset.outil);
      else ({ annuler: () => this.annuler(), refaire: () => this.retablir(), ajouter: () => this.ouvrirCatalogue(), enregistrer: () => this.enregistrer(), appliquer: () => this.appliquer(),
        quitter: () => this.quitter(), recadrer: () => this.recadrer(), exporter: () => this.exporter(), nettoyer: () => this.nettoyerPlan(), calques: () => this.panneauCalques(!this.vueCalques), ambiance: () => this.panneauAmbiance(!this.vueAmbiance),
        parametres: () => this.panneauParametres(!this.vueParametres), aide: () => this.aideClavier(), grille: () => this.menuGrille(), plus: () => this.menuPlus() })[b.dataset.a]();
    };
    if (garde) this.barre.querySelector(garde)?.focus({ preventScroll: true });
    this._info();
  }

  // pas de la grille (et du magnétisme, des flèches) : menu sous le bouton « Grille : 5 cm », valeur courante cochée
  _itemsGrille() { return [{ titre: _t("Pas de la grille") }, ...PAS_GRILLE.map((g) => ({ libelle: _t("{v} cm", { v: g }), coche: this.grille === g, action: () => this.reglerGrille(g) }))]; }
  reglerGrille(g) { this.grille = g; this._barre(); }
  menuGrille() { const b = this.barre.querySelector('[data-a="grille"]'); if (b) this._menu(b, this._itemsGrille(), _t("Pas de la grille")); }
  // téléphone : ce qui ne tient pas dans la barre
  menuPlus() {
    const b = this.barre.querySelector('[data-a="plus"]');
    if (!b) return;
    // le pas de la grille a son propre bouton à côté : pas de doublon dans ce menu
    // Appliquer (enregistrer sans quitter) : dans ce menu sur téléphone, la barre garde ses deux rangées
    this._menu(b, [...(this.modifie ? [{ icone: "mdi:check", libelle: _t("Appliquer : enregistrer sans quitter l'éditeur"), action: () => this.appliquer() }, { sep: true }] : []),
      { icone: "mdi:fit-to-screen-outline", libelle: _t("Recadrer"), action: () => this.recadrer() },
      { icone: "mdi:layers-outline", libelle: _t("Calques"), action: () => this.panneauCalques(!this.vueCalques) },
      { icone: "mdi:weather-partly-cloudy", libelle: _t("Ambiance et animations"), action: () => this.panneauAmbiance(!this.vueAmbiance) },
      { icone: "mdi:auto-fix", libelle: _t("Nettoyer le plan"), action: () => this.nettoyerPlan() },
      ...(this._copiesNettoyage().length ? [{ icone: "mdi:history", libelle: _t("Restaurer un plan d'avant nettoyage"), action: () => this.copiesNettoyage() }] : []),
      { icone: "mdi:file-swap-outline", libelle: _t("Importer / exporter"), action: () => this.exporter() },
      { icone: "mdi:cog-outline", libelle: _t("Paramètres"), action: () => this.panneauParametres(true) }], _t("Plus d'outils"));
  }
  // menu déroulant MD3 sous un bouton : items { titre } (intitulé), { sep }, { icone, libelle, coche?, action } ; flèches, Origine / Fin, Échap
  _menu(btn, items, etiquette) {
    this._fermerMenu();
    const m = document.createElement("div");
    m.className = "ed-menu"; m.setAttribute("role", "menu"); m.setAttribute("aria-label", etiquette);
    poserHTML(m, items.map((it, j) => (it.titre ? `<div class="ed-menu-titre" role="presentation">${esc(it.titre)}</div>` : it.sep ? `<div class="ed-menu-sep" role="separator"></div>`
      : `<button type="button" role="${it.coche != null ? "menuitemradio" : "menuitem"}"${it.coche != null ? ` aria-checked="${it.coche}"` : ""} data-menu="${j}" tabindex="-1"><ha-icon icon="${it.coche != null ? (it.coche ? "mdi:check" : "") : esc(it.icone || "")}"></ha-icon><span>${esc(it.libelle)}</span></button>`)).join(""));
    this.R.querySelector("ha-card").append(m);
    const r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = `${Math.max(8, Math.min(r.left, innerWidth - w - 8))}px`;
    m.style.top = `${r.bottom + 4 + h > innerHeight - 8 && r.top - 4 - h > 8 ? r.top - 4 - h : Math.max(8, Math.min(r.bottom + 4, innerHeight - h - 8))}px`;
    btn.setAttribute("aria-expanded", "true");
    const boutons = [...m.querySelectorAll("[data-menu]")];
    const fermer = (rendre) => {
      if (this._menuOuvert?.m !== m) return;
      m.remove(); this._menuOuvert = null;
      window.removeEventListener("pointerdown", dehors, true);
      btn.setAttribute("aria-expanded", "false");
      if (rendre) btn.focus();
    };
    const dehors = (e) => { const ch = e.composedPath(); if (!ch.includes(m) && !ch.includes(btn)) fermer(false); };
    window.addEventListener("pointerdown", dehors, true);
    this._menuOuvert = { m, btn, fermer };
    m.onkeydown = (e) => {
      const i = boutons.indexOf(this.R.activeElement), n = boutons.length;
      const j = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (j != null) { e.preventDefault(); boutons[j].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fermer(true); }
      else if (e.key === "Tab") { e.preventDefault(); fermer(true); }
    };
    m.onclick = (e) => {
      const b = e.composedPath().find((x) => x.dataset?.menu != null);
      if (!b) return;
      fermer(false);
      items[+b.dataset.menu].action();
      // le bouton d'origine (redessiné avec la barre) garde le focus, sauf si l'action l'a pris ailleurs (panneau, dialogue)
      const a = this.R.activeElement;
      if (!a || a === document.body || !a.isConnected) this.barre.querySelector(`[data-a="${btn.dataset.a}"]`)?.focus();
    };
    (boutons.find((b) => b.getAttribute("aria-checked") === "true") || boutons[0])?.focus();
  }
  _fermerMenu() { this._menuOuvert?.fermer(false); }

  _info(txt) {
    const el = this.barre.querySelector(".ed-info");
    if (el) el.textContent = ""; // état « modifié » : point sur le bouton Enregistrer (pas de texte en doublon)
    if (txt == null) return;
    // cotes près du curseur : la barre d'outils ne change jamais de hauteur pendant un tracé
    const plan = this.R.querySelector(".plan");
    if (!plan || !this._xy) return;
    let b = plan.querySelector(".ed-bulle");
    if (!b) { b = document.createElement("div"); b.className = "ed-bulle"; plan.append(b); }
    const r = plan.getBoundingClientRect(), z = this.carte._zVue || 1;
    b.hidden = !txt;
    b.textContent = txt;
    const x = (this._xy[0] - r.left) / z + 16, y = (this._xy[1] - r.top) / z + 18;
    b.style.left = `${Math.max(4, Math.min(x, plan.clientWidth - b.offsetWidth - 8))}px`;
    b.style.top = `${Math.max(4, Math.min(y, plan.clientHeight - b.offsetHeight - 8))}px`;
  }

  choisirOutil(o, garderModele = false) {
    if (o !== "rectangle") this.sousZoneEnAttente = null;
    this._fermerAide();
    this._finirTrace();
    this._info("");
    this.outil = o; this.aPlacer = null;
    if (!garderModele) { this.modeleOuverture = null; this.aCompleter = null; this.chercherOuv = null; this.prefOuv = null; }
    if (o !== "piece" && o !== "rectangle") this.zoneEnAttente = null;
    this.zone.classList.toggle("dessin", o !== "selection");
    this._barre();
    const tactile = matchMedia("(pointer: coarse)").matches;
    const aides = { mur: tactile ? _t("Touche ou clique pour enchaîner les murs ; « Terminer » pour finir.") : _t("Touche ou clique pour enchaîner les murs ; Échap, Entrée ou clic droit pour finir."),
      rectangle: _t("Clique un coin puis le coin opposé : la pièce et ses murs sont créés, les cotes s'affichent près du curseur."), limite: _t("Comme les murs, en trait de clôture."),
      ouverture: _t("Clique les deux extrémités sur un mur."), piece: tactile ? _t("Clique les sommets ; reclique le premier ou « Terminer » pour fermer.") : _t("Clique les sommets ; reclique le premier (ou Entrée) pour fermer."), texte: this._texteInfos ? _t("Clique où placer la zone d'informations.") : _t("Clique où placer le texte.") };
    if (aides[o]) this._aide(aides[o]);
    this.apresConstruction();
  }

  // ---------- historique ----------
  _instantane() { this.histo.push(JSON.stringify(this.d)); if (this.histo.length > 150) this.histo.shift(); this.refaire = []; }
  _applique(json) { const d = JSON.parse(json); Object.keys(this.d).forEach((k) => delete this.d[k]); Object.assign(this.d, d); }
  // config interne gardée dans ce navigateur (brouillon, copie d'avant nettoyage) : relue comme un plan importé (même normalisation,
  // valeurs invalides retirées), jamais posée telle quelle
  _relire(json) {
    const N = customElements.get("maquette-card").normaliser;
    try { const o = JSON.parse(json); return JSON.stringify(N(o && typeof o === "object" && !Array.isArray(o) ? o : {})); } catch (e) { return JSON.stringify(N({})); }
  }
  annuler() { if (!this.histo.length) return; this.refaire.push(JSON.stringify(this.d)); this._applique(this.histo.pop()); this._valide(); this._apres(true); }
  retablir() { if (!this.refaire.length) return; this.histo.push(JSON.stringify(this.d)); this._applique(this.refaire.pop()); this._valide(); this._apres(true); }
  _valide() {
    const n = this._listes();
    if (this.sel?.type === "widget") { if (!this._wl(this.sel)?.[this.sel.i]) this.sel = null; return; }
    if (this.sel?.type === "puce") { if (!this._puces()[this.sel.i]) this.sel = null; return; }
    if (this.sel && !(n[this.sel.type] || [])[this.sel.i]) this.sel = null;
  }
  _wl(s, creer = false) {
    if (s.cote === "fiche") {
      const pf = porteurDe(s), m = pf && this.d[GENRES_FICHE[pf.genre]]?.[pf.i];
      if (!m) return null;
      if (creer) { if (!m.fiche || typeof m.fiche !== "object") m.fiche = {}; return (m.fiche.widgets ||= []); }
      return m.fiche?.widgets || null;
    }
    const base = s.piece != null ? this.d.pieces[s.piece] : this.d;
    if (!base) return null;
    if (creer) { base.panneaux ||= {}; return (base.panneaux[s.cote] ||= []); }
    return base.panneaux?.[s.cote] || null;
  }
  // élément verrouillé (`locked: true`) : sélectionnable et modifiable dans son panneau, mais immobile à la souris et au clavier
  _verrouille(k) { const o = this._elt(k); return !!o && !Array.isArray(o) && o.verrouille === true; }
  // listes du plan par type d'élément
  _listes(d = this.d) { return { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, mur: d.murs, limite: d.limites, meuble: d.meubles }; }
  _elt(k) {
    const [ty, a, b] = k.split(":"), d = this.d;
    if (ty === "widget") { const s = deCle(k); return this._wl(s)?.[s.i]; }
    return ({ ...this._listes(d), puce: this._puces() }[ty] || [])[+a];
  }
  _apres(sansHisto) {
    this.multi = new Set([...this.multi].filter((k) => this._elt(k)));
    if (!this.sel) this.multi.clear(); else if (!this.multi.has(cle(this.sel))) this.multi = new Set([cle(this.sel)]);
    if (this.d.groupes || this._toutesCles().some((k) => this._gr(k))) this._nettoyerGroupes();
    this.modifie = JSON.stringify(this.d) !== JSON.stringify(this.original);
    this._boite();
    if (this.modifie) stock.ecrire(this._cle(), JSON.stringify(this.d)); else stock.retirer(this._cle());
    // langue de la carte changée (panneau Paramètres, annuler / rétablir) : carte et éditeur passent tout de suite dans la nouvelle langue
    suivreLangue(this.carte, this.d);
    this.carte._construire();
    this._barre();
    this._panneau();
  }
  commit(fn) { this._instantane(); fn(); this._apres(); }
  // « Annuler » d'une notification : n'annule que si rien n'a été fait depuis
  _annulation() {
    const marque = this.histo.length;
    return () => (this.histo.length === marque ? this.annuler() : this.snack(_t("D'autres modifications ont suivi : Ctrl+Z (ou la flèche d'annulation) pour revenir en arrière pas à pas.")));
  }

  _proposerBrouillon() {
    let b = null;
    b = stock.lire(this._cle());
    if (b && b !== JSON.stringify(this.original)) {
      this.snack(_t("Un brouillon non enregistré existe."), [[_t("Reprendre"), () => { this._instantane(); this._applique(this._relire(b)); this._valide(); this._apres(); }],
        [_t("Supprimer"), () => { stock.retirer(this._cle()); this.snack(_t("Brouillon supprimé.")); }]], 20000);
    }
  }

  // ---------- rendu des aides d'édition dans le SVG ----------
  apresConstruction() {
    const svg = this.R.querySelector(".zone svg");
    if (!svg) return;
    this.echelle = svg.clientWidth / this.carte.vue().W || 1;
    const k = 1 / this.echelle, d = this.d, { x0, y0, W, H } = this.carte._box;
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", "ed");
    let h = `<defs><pattern id="ed-g1" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="var(--md-on-surface)" stroke-width="${0.6 * k}" opacity=".12"/></pattern>
      <pattern id="ed-g2" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#ed-g1)"/><path d="M100 0H0V100" fill="none" stroke="var(--md-on-surface)" stroke-width="${1 * k}" opacity=".2"/></pattern></defs>
      <rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="url(#ed-g2)" pointer-events="none"/>`;
    const cible = (liste, i, s) => `<path class="ed-cible" data-c="${liste}:${i}" d="M${s[0]} ${s[1]}L${s[2]} ${s[3]}" stroke-width="${22 * k}"/>`;
    const Q = this.carte._calques(), libre = (k) => !Q.masques.has(k) && !Q.verrous.has(k);
    if (libre("murs")) (d.murs || []).forEach((s, i) => { h += cible("mur", i, s); });
    if (libre("limites")) (d.limites || []).forEach((s, i) => { h += cible("limite", i, s); });
    if (libre("ouvertures")) (d.ouvertures || []).forEach((o, i) => { h += cible("ouverture", i, o.seg); });
    const s = this.multi.size > 1 ? null : this.sel, fige = !!s && this._verrouille(cle(s));
    // élément verrouillé : cadre de sélection sans poignées
    const poignee = (x, y, ref, r = 7) => (fige ? "" : `<circle class="ed-poignee" data-poignee="${ref}" cx="${x}" cy="${y}" r="${r * k}" stroke-width="${2.5 * k}"/>`);
    if (this.multi.size > 1) for (const kk of this.multi) {
      const m = deCle(kk);
      if (["mur", "limite", "ouverture"].includes(m.type)) { const sg = m.type === "ouverture" ? d.ouvertures[m.i].seg : this._liste(m.type)[m.i]; h += `<path class="ed-sel" d="M${sg[0]} ${sg[1]}L${sg[2]} ${sg[3]}" stroke-width="${4 * k}"/>`; }
      if (m.type === "piece") h += `<polygon class="ed-poly-sel" points="${d.pieces[m.i].poly.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
    }
    if (s && ["mur", "limite", "ouverture"].includes(s.type)) {
      const seg = s.type === "ouverture" ? d.ouvertures[s.i].seg : this._liste(s.type)[s.i];
      h += `<path class="ed-sel" d="M${seg[0]} ${seg[1]}L${seg[2]} ${seg[3]}" stroke-width="${3 * k}"/>`;
      h += poignee(seg[0], seg[1], `bout:${s.type}:${s.i}:0`) + poignee(seg[2], seg[3], `bout:${s.type}:${s.i}:1`);
    }
    const cadreMeuble = (m) => { const [w, h] = m.taille || MEUBLES()[m.type]?.taille || [60, 60];
      return `<g transform="translate(${nbr(m.pos[0])} ${nbr(m.pos[1])}) rotate(${nbr(m.rotation)})"><rect class="ed-poly-sel" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" stroke-width="${2 * k}"/></g>`; };
    if (this.multi.size > 1) for (const kk of this.multi) { const m = deCle(kk); if (m.type === "meuble" && d.meubles?.[m.i]) h += cadreMeuble(d.meubles[m.i]); }
    if (s && s.type === "meuble" && d.meubles?.[s.i]) {
      const m = d.meubles[s.i], [w, hh] = m.taille || MEUBLES()[m.type]?.taille || [60, 60], th = (nbr(m.rotation) * Math.PI) / 180, mx = m.miroir ? -1 : 1;
      h += cadreMeuble(m);
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const lx = ((sx * w) / 2) * mx, ly = (sy * hh) / 2;
        h += poignee(m.pos[0] + lx * Math.cos(th) - ly * Math.sin(th), m.pos[1] + lx * Math.sin(th) + ly * Math.cos(th), `coin:${s.i}:${sx}:${sy}`);
      }
    }
    if (this.aPlacerMeuble && !matchMedia("(pointer: coarse)").matches) h += `<g class="ed-fantome" visibility="hidden">${this.carte.constructor.dessinMeuble({ ...this.aPlacerMeuble, pos: [0, 0] })}</g>`;
    if (s && s.type === "piece") {
      const poly = d.pieces[s.i].poly;
      h += `<polygon class="ed-poly-sel" points="${poly.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
      if (!fige) poly.forEach((p, j) => {
        const q = poly[(j + 1) % poly.length];
        h += `<circle class="ed-milieu" data-poignee="milieu:${s.i}:${j}" cx="${(p[0] + q[0]) / 2}" cy="${(p[1] + q[1]) / 2}" r="${5 * k}"><title>${_t("Ajouter un sommet")}</title></circle>`;
      });
      poly.forEach((p, j) => { h += poignee(p[0], p[1], `sommet:${s.i}:${j}`); });
    }
    if (this.trace.length) {
      h += `<polyline class="ed-trace" points="${this.trace.map((p) => p.join(",")).join(" ")}" stroke-width="${2.5 * k}"/>`;
      this.trace.forEach((p) => { h += `<circle class="ed-trace-pt" cx="${p[0]}" cy="${p[1]}" r="${4 * k}"/>`; });
    }
    h += `<rect class="ed-trace ed-rect" x="0" y="0" width="0" height="0" stroke-width="${2.5 * k}" visibility="hidden"/>
      <line class="ed-trace ed-elastique" x1="0" y1="0" x2="0" y2="0" stroke-width="${2.5 * k}" visibility="hidden"/>
      <circle class="ed-curseur-pt" r="${6 * k}" stroke-width="${2 * k}" visibility="hidden"/>`;
    poserHTML(g, h);
    svg.append(g);
    this.R.querySelectorAll(".calque>.sel").forEach((n) => n.classList.remove("sel"));
    for (const kk of this.multi) {
      const m = deCle(kk), q = { point: `[data-q="${m.i}"]`, texte: `[data-t="${m.i}"]`, piece: `[data-l="${m.i}"]` }[m.type];
      if (q) this.R.querySelector(`.calque>${q}`)?.classList.add("sel");
    }
    this.zone.classList.toggle("dessin", this.outil !== "selection" || !!this.aPlacer);
    // « Terminer » : seule façon de finir un tracé au doigt (pas d'Échap ni de clic droit)
    let fin = this.R.querySelector(".ed-terminer");
    const montrer = this.trace.length && ["mur", "limite", "piece"].includes(this.outil);
    if (montrer && !fin) {
      fin = document.createElement("button");
      fin.className = "ed-btn plein ed-terminer";
      poserHTML(fin, `<ha-icon icon="mdi:check"></ha-icon>${_t("Terminer")}`);
      fin.onclick = (e) => { e.stopPropagation(); this._finirTrace(); };
      this.R.querySelector(".plan").append(fin);
    } else if (!montrer) fin?.remove();
    if (!this._panneauFait) { this._panneauFait = true; this._panneau(); }
    this._majBarreFlottante();
  }

} // @assemblage
