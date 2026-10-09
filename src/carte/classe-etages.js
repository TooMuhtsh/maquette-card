// étages (L1) : sélecteur d'étages, changement d'étage, mémoire — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // ---------- étages : sélecteur (ascenseur au bord du plan, ou barre d'onglets en haut de la carte), changement, mémoire ----------
  // dernier étage vu, par carte (propre à ce navigateur, jamais dans la config)
  _cleEtage() { return `maquette-etage:${this._plein?.id || this._config?.id || "plan"}`; }
  // étage affiché : celui que l'éditeur a déplié s'il est ouvert, sinon this._etage
  _etageAffiche() { return this._config?.etage_actif?.id ?? this._etage ?? null; }

  // change l'étage affiché (vue seulement ; en édition, l'éditeur s'en charge) : vue de pièce, zoom, fiche et glisser remis à zéro ;
  // `centrer: [x, y]` (cm) : la vue se centre sur ce point (escalier d'arrivée, élément à montrer). Renvoie true si c'est fait.
  _changerEtage(id, { centrer } = {}) {
    if (this._editeur) return this._editeur.changerEtage ? (this._editeur.changerEtage(id), true) : false;
    if (!this._plein || !idsEtages(this._plein).includes(id)) return false;
    const R = this.shadowRoot, d = R?.querySelector("dialog.mf");
    if (d?.open) d.close();
    if (R) this._menuCalques(false);
    cancelAnimationFrame(this._anim);
    this._aBouge = false;
    R?.querySelector(".zone")?.classList.remove("panne");
    const autre = id !== this._etage;
    this._iso = null; this._vue = null;
    if (autre) { this._etage = id; this._config = deplier(this._plein, id); }
    stock.ecrire(this._cleEtage(), id); // stockage indisponible : l'étage vaut pour cette page
    // vue figée (lock_view) : pas de zoom, le pincement et « Toute la maison » sont coupés et n'en sortiraient pas
    const ok = Array.isArray(centrer) && Number.isFinite(+centrer[0]) && Number.isFinite(+centrer[1]);
    this._centrerAttente = ok && !this._figee() ? [+centrer[0], +centrer[1]] : null;
    if (!this._hass) return true; // construit à l'arrivée de hass, centrage compris (_apresConstruireEtages)
    this._construire();
    // fondu court (rien sans animation ou si le système demande moins de mouvement)
    const z = R?.querySelector(".zone");
    if (autre && z?.animate && !this._sansFondu()) z.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 180, easing: "cubic-bezier(.2,0,0,1)" });
    return true;
  }
  _sansFondu() { return this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // choix dans le sélecteur ou au clavier : l'éditeur ouvert replie d'abord ses données (L4), sinon changement de la vue
  _choisirEtage(id) {
    if (id == null || id === this._etageAffiche()) return;
    if (this._editeur) this._editeur.changerEtage?.(id);
    else this._changerEtage(id);
  }
  // étage voisin dans l'ordre de `floors` (du bas vers le haut) : sens +1 = au-dessus
  _etageVoisin(sens) {
    const l = parEtage(this._config).map((e) => e.id), i = l.indexOf(this._etageAffiche());
    return i < 0 ? null : l[i + sens] ?? null;
  }

  // crochet de fin de _construire : sélecteur dessiné (ou retiré) selon le nombre d'étages, l'option et l'édition
  _apresConstruireEtages() {
    const R = this.shadowRoot, card = R?.querySelector("ha-card");
    if (!card) return;
    const ed = !!this._editeur, E = parEtage(this._config).filter((e) => e.id != null);
    const voir = E.length > 1 || (ed && !!this._editeur?.afficherSelecteur && E.length > 0);
    const onglets = this._config.selecteur_etages === "onglets";
    const avant = !!R.querySelector(".etages.onglets:not([hidden])");
    for (const [cl, ici] of [["ascenseur", !onglets], ["onglets", onglets]]) {
      let el = R.querySelector(`.etages.${cl}`);
      if (!voir || !ici) { if (el) el.hidden = true; continue; }
      if (!el) el = this._creerSelecteur(cl);
      el.hidden = false;
      this._dessinerSelecteur(el, E, cl === "onglets");
    }
    // la barre d'onglets prend de la hauteur à la carte : pleine page recalculée quand elle apparaît ou disparaît
    if (avant !== !!R.querySelector(".etages.onglets:not([hidden])")) this._mise();
    this._suivreAscenseur();
    this._centrerEnAttente();
  }
  // ascenseur en haut à droite du plan, zoom en bas à droite : quand le plan est trop bas pour les deux empilés,
  // l'ascenseur passe à gauche de la colonne du zoom (classe .serre) ; revu à chaque changement de taille du plan ou du zoom
  _suivreAscenseur() {
    const R = this.shadowRoot, a = R.querySelector(".etages.ascenseur:not([hidden])");
    this._roAsc?.disconnect();
    if (!a) return;
    this._roAsc ??= new ResizeObserver(() => this._placerAscenseur());
    for (const el of [R.querySelector(".plan"), R.querySelector(".zoom")]) if (el) this._roAsc.observe(el);
    this._placerAscenseur();
  }
  _placerAscenseur() {
    const R = this.shadowRoot, a = R?.querySelector(".etages.ascenseur:not([hidden])"), z = R?.querySelector(".zoom");
    if (!a) return;
    a.classList.remove("serre");
    if (!z || getComputedStyle(z).display === "none") return;
    const A = a.getBoundingClientRect(), Z = z.getBoundingClientRect();
    if (Z.height > 0 && A.bottom + 8 > Z.top) a.classList.add("serre");
  }
  // centrage demandé par _changerEtage (zoom ×2,5 sur le point), appliqué une fois le plan construit
  _centrerEnAttente() {
    const c = this._centrerAttente, B = this._box;
    this._centrerAttente = null;
    if (!c || this._editeur || this._figee() || !(B?.W > 0 && B?.H > 0)) return;
    const W = B.W / 2.5, H = W * B.H / B.W;
    this._cadrer({ x0: c[0] - W / 2, y0: c[1] - H / 2, W, H });
  }

  _creerSelecteur(cl) {
    const R = this.shadowRoot, el = document.createElement("div");
    el.className = `etages ${cl}`;
    if (cl === "onglets") R.querySelector(".barre").after(el); else R.querySelector(".plan").append(el);
    el.addEventListener("click", (ev) => {
      const ch = ev.composedPath(), b = ch.find((n) => n.dataset?.etage != null), g = ch.find((n) => n.dataset?.etagesGerer != null);
      if (!b && !g) return;
      ev.stopPropagation(); // jamais jusqu'aux clics du plan ni de l'éditeur
      if (g) return this._editeur?.ouvrirEtages?.();
      this._choisirEtage(b.dataset.etage);
    });
    el.addEventListener("keydown", (ev) => {
      const b = ev.target.closest?.("[data-etage]");
      if (!b) return;
      const l = [...el.querySelectorAll("[data-etage]")], i = l.indexOf(b), vert = cl === "ascenseur";
      const pas = { [vert ? "ArrowUp" : "ArrowLeft"]: -1, [vert ? "ArrowDown" : "ArrowRight"]: 1 }[ev.key];
      const j = pas ? (i + pas + l.length) % l.length : ev.key === "Home" ? 0 : ev.key === "End" ? l.length - 1 : -1;
      if (j < 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      const id = l[j].dataset.etage;
      this._choisirEtage(id);
      [...el.querySelectorAll("[data-etage]")].find((x) => x.dataset.etage === id)?.focus();
    });
    if (!this._clavierEtages) {
      // PageUp / PageDown sur le plan : étage au-dessus / au-dessous
      this._clavierEtages = true;
      R.querySelector(".plan").addEventListener("keydown", (ev) => {
        if ((ev.key !== "PageUp" && ev.key !== "PageDown") || ev.altKey || ev.ctrlKey || ev.metaKey) return;
        if (ev.target.closest?.("input,textarea,select,[contenteditable]")) return;
        if (R.querySelector(".etages:not([hidden])") == null) return;
        const id = this._etageVoisin(ev.key === "PageUp" ? 1 : -1);
        ev.preventDefault();
        if (id != null) this._choisirEtage(id);
      });
    }
    return el;
  }

  _dessinerSelecteur(el, E, onglets) {
    const actif = this._etageAffiche(), P = this._pastillesEtages?.() || {}, ed = !!this._editeur;
    const focus = el.contains(this.shadowRoot.activeElement);
    // ascenseur : l'étage du haut en haut ; barre : du bas vers le haut, de gauche à droite
    const l = onglets ? E : [...E].reverse();
    const bouton = (e) => {
      const nom = e.nom || e.court, on = e.id === actif, p = P[e.id] === "rouge" || P[e.id] === "ambre" ? ` ${P[e.id]}` : "";
      return `<button type="button" role="tab" class="et-b${on ? " on" : ""}" data-etage="${esc(e.id)}" aria-selected="${on}" tabindex="${on ? 0 : -1}"
        ${onglets ? "" : `title="${esc(nom)}" aria-label="${esc(nom)}"`}>${onglets ? `<ha-icon icon="${esc(e.icone || "mdi:layers-outline")}"></ha-icon><span class="et-n">${esc(nom)}</span>`
        : `<span class="et-c">${esc(e.court)}</span>`}<span class="et-pastille${p}" aria-hidden="true"></span></button>`;
    };
    const gerer = ed && typeof this._editeur?.ouvrirEtages === "function"
      ? `<button type="button" class="et-gerer" data-etages-gerer title="${esc(_t("Gérer les étages"))}" aria-label="${esc(_t("Gérer les étages"))}"><ha-icon icon="mdi:layers-edit"></ha-icon>${onglets ? `<span class="et-n">${_t("Gérer")}</span>` : ""}</button>` : "";
    poserHTML(el, `<div class="et-l" role="tablist" aria-label="${esc(_t("Étages"))}" aria-orientation="${onglets ? "horizontal" : "vertical"}">${l.map(bouton).join("")}</div>${gerer}`);
    if (!l.some((e) => e.id === actif)) el.querySelector("[data-etage]")?.setAttribute("tabindex", "0");
    if (focus) el.querySelector('[tabindex="0"]')?.focus();
  }
} // @assemblage
