// snack et aides ⓘ, recadrage, carte du dashboard, versions, enregistrer, quitter — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- divers ----------
  // action : un libellé (avec fn) ou une liste [[libellé, fn], …]
  snack(txt, action, fn, duree = 5000) {
    this.R.querySelector(".ed-snack")?.remove();
    const s = document.createElement("div"), actions = Array.isArray(action) ? action : action ? [[action, fn]] : [];
    if (Array.isArray(action)) duree = fn ?? duree;
    const erreur = duree === "erreur";
    if (erreur) duree = 15000;
    s.className = `ed-snack${erreur ? " erreur" : ""}`;
    s.setAttribute("role", erreur ? "alert" : "status");
    poserHTML(s, `<span>${esc(txt)}</span>${actions.map(([n]) => `<button>${esc(n)}</button>`).join("")}`);
    s.querySelectorAll("button").forEach((b, j) => { b.onclick = () => { s.remove(); actions[j][1](); }; });
    this._hote().append(s);
    setTimeout(() => s.remove(), duree);
  }

  // ---------- bulles d'aide ⓘ ----------
  // un seul comportement pour tous les boutons .ed-i (panneaux, modale ⚙, dialogues) : infobulle au survol de la souris (après un court
  // délai) ou au focus clavier ; un clic (ou un toucher) l'épingle sous forme de popover, un 2e clic, Échap, un toucher ailleurs,
  // un défilement ou un nouveau rendu la ferment. Le texte est aussi dans aria-description (lu sans ouvrir la bulle).
  _cablerAides() {
    const R = this.R, bouton = (e) => e.composedPath().find((n) => n instanceof HTMLElement && n.classList.contains("ed-i"));
    let attente = 0; // survol : la bulle vient après 300 ms (un clic avant annule cette attente, sinon la bulle épinglée serait remplacée)
    const E = (this._aideEv = {
      over: (e) => { if (e.pointerType !== "mouse") return; const b = bouton(e); if (!b || this._tip?.b === b) return; clearTimeout(attente); attente = setTimeout(() => { if (b.matches(":hover")) this._montrerAide(b, false); }, 300); },
      out: (e) => { if (e.pointerType !== "mouse") return; const b = bouton(e); if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return; clearTimeout(attente); if (this._tip?.b === b && !this._tip.epingle) this._cacherAide(); },
      focusin: (e) => { const b = bouton(e); if (b && !this._focusSansAide && b.matches(":focus-visible") && this._tip?.b !== b) this._montrerAide(b, false); },
      focusout: (e) => { const b = bouton(e); if (b && this._tip?.b === b && !this._tip.epingle) this._cacherAide(); },
      clic: (e) => { const b = bouton(e); if (!b) return; e.preventDefault(); e.stopPropagation(); clearTimeout(attente); if (Date.now() - (this._depliee || 0) < 600) return; if (this._tip?.b === b && this._tip.epingle) this._cacherAide(); else this._montrerAide(b, true); },
      bas: (e) => { if (!this._tip) return; const ch = e.composedPath(); if (!ch.includes(this._tip.el) && !ch.includes(this._tip.b)) this._cacherAide(); },
      touche: (e) => { if (e.key !== "Escape" || !this._tip) return; e.preventDefault(); e.stopImmediatePropagation(); const b = this._tip.b; this._cacherAide(); if (b.isConnected) { this._focusSansAide = true; b.focus({ preventScroll: true }); this._focusSansAide = false; } },
      defile: (e) => { if (this._tip && !(e.target instanceof Node && this._tip.el.contains(e.target))) this._cacherAide(); },
      taille: () => this._cacherAide(),
    });
    R.addEventListener("pointerover", E.over); R.addEventListener("pointerout", E.out);
    R.addEventListener("focusin", E.focusin); R.addEventListener("focusout", E.focusout);
    R.addEventListener("click", E.clic, true); R.addEventListener("scroll", E.defile, true);
    window.addEventListener("pointerdown", E.bas, true); window.addEventListener("keydown", E.touche, true);
    window.addEventListener("scroll", E.defile, true); window.addEventListener("resize", E.taille);
  }
  _decablerAides() {
    const R = this.R, E = this._aideEv;
    if (!E) return;
    this._cacherAide();
    R.removeEventListener("pointerover", E.over); R.removeEventListener("pointerout", E.out);
    R.removeEventListener("focusin", E.focusin); R.removeEventListener("focusout", E.focusout);
    R.removeEventListener("click", E.clic, true); R.removeEventListener("scroll", E.defile, true);
    window.removeEventListener("pointerdown", E.bas, true); window.removeEventListener("keydown", E.touche, true);
    window.removeEventListener("scroll", E.defile, true); window.removeEventListener("resize", E.taille);
    this._aideEv = null;
  }
  // bulle sous son bouton (au-dessus s'il n'y a pas la place), dans l'écran ; epingle : ouverte par un clic, ne se ferme pas en sortant
  _montrerAide(b, epingle) {
    this._cacherAide();
    const txt = b.dataset.aide;
    if (!txt || !b.isConnected) return;
    const el = document.createElement("div");
    el.className = "ed-tip"; el.id = "ed-tip"; el.setAttribute("role", "tooltip");
    el.textContent = txt;
    this.R.querySelector("ha-card").append(el);
    const r = b.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, m = 8;
    const x = Math.max(m, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - m));
    const y = r.bottom + 8 + h > innerHeight - m && r.top - 8 - h > m ? r.top - 8 - h : Math.max(m, Math.min(r.bottom + 8, innerHeight - h - m));
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    b.setAttribute("aria-expanded", "true");
    this._tip = { b, el, epingle };
  }
  _cacherAide() {
    const t = this._tip;
    if (!t) return;
    this._tip = null;
    t.el.remove();
    t.b.setAttribute("aria-expanded", "false");
  }
  // rangée horizontale défilante (onglets, filtres) : dégradé du côté où il reste quelque chose à voir
  _indiceDefilement(el) {
    if (!el) return;
    const maj = () => {
      const deborde = el.scrollWidth > el.clientWidth + 2;
      el.classList.toggle("def-g", deborde && el.scrollLeft > 2);
      el.classList.toggle("def-d", deborde && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    el.addEventListener("scroll", maj, { passive: true });
    requestAnimationFrame(maj);
  }

  // consigne d'un outil : retirée dès que l'outil change ou que l'objet est posé
  _aide(txt) { this.snack(txt); this.R.querySelector(".ed-snack")?.classList.add("aide"); }
  _fermerAide() { this.R.querySelector(".ed-snack.aide")?.remove(); }

  recadrer() {
    this.carte._vue = null;
    this._boite(true);
    this.carte._construire();
  }

  // zone de dessin : le plan + une marge tout autour (8 % de sa plus grande cote, entre 80 cm et 5 m : le plan garde presque sa taille
  // de la vue) ; elle s'agrandit d'elle-même quand on dessine près du bord
  _boite(refaire = false, carte = this.carte) {
    const b = carte.bornes(), m = Math.round(Math.min(500, Math.max(80, 0.08 * Math.max(b.W, b.H)))), voulu = { x0: b.x0 - m, y0: b.y0 - m, x1: b.x0 + b.W + m, y1: b.y0 + b.H + m }, f = carte._boxFige;
    if (refaire || !f) { carte._boxFige = { x0: voulu.x0, y0: voulu.y0, W: voulu.x1 - voulu.x0, H: voulu.y1 - voulu.y0 }; return true; }
    const x0 = Math.min(f.x0, voulu.x0), y0 = Math.min(f.y0, voulu.y0), x1 = Math.max(f.x0 + f.W, voulu.x1), y1 = Math.max(f.y0 + f.H, voulu.y1);
    if (x0 === f.x0 && y0 === f.y0 && x1 === f.x0 + f.W && y1 === f.y0 + f.H) return false;
    carte._boxFige = { x0, y0, W: x1 - x0, H: y1 - y0 };
    return true;
  }

  _cartesPlan(noeud, l = []) {
    if (!noeud || typeof noeud !== "object") return l;
    if (TYPES_CARTE.includes(noeud.type)) l.push(noeud);
    for (const v of Array.isArray(noeud) ? noeud : Object.values(noeud)) this._cartesPlan(v, l);
    return l;
  }

  // la carte à remplacer : par son id, sinon (carte sans id) celle dont la config est exactement celle ouverte
  _trouverCarte(cfg) {
    // les deux côtés passent par la normalisation de la carte (meubles, booléens, géométrie…) : une config corrigée à la lecture n'est pas un conflit
    const N = customElements.get("maquette-card")?.normaliser, interne = (c) => { try { return canon(N ? N(c) : { pieces: [], ...c }); } catch (e) { return canon({ pieces: [], ...c }); } };
    // cartes du dashboard : format public (anglais), relues comme la carte les lit ; l'original est déjà au format interne
    const norme = (c) => { try { return interne(depuisAnglais(c)); } catch (e) { return canon(c); } }, toutes = this._cartesPlan(cfg), orig = interne(this.original);
    if (this.original.id != null) {
      const l = toutes.filter((c) => c.id === this.original.id);
      if (l.length === 1) return { ref: l[0], conflit: norme(l[0]) !== orig };
      if (!l.length) return { erreur: "introuvable" };
      // carte dupliquée dans HA (même id) : on reconnaît la nôtre à son contenu et elle reçoit un nouvel id
      const m = l.filter((c) => norme(c) === orig);
      // copies identiques : écrire dans la première est sans conséquence, elle reçoit un nouvel id et les deux redeviennent distinctes
      return m.length ? { ref: m[0], conflit: false, nouvelId: true } : { erreur: _t("plusieurs cartes portent cet id et aucune n'a le contenu ouvert : recharge la page") };
    }
    const l = toutes.filter((c) => c.id == null && norme(c) === orig);
    if (l.length === 1) return { ref: l[0], conflit: false };
    if (l.length > 1) return { erreur: _t("plusieurs cartes identiques sans id") };
    return toutes.some((c) => c.id == null) ? { erreur: "modifiée", conflit: true } : { erreur: "introuvable" };
  }

  // ---------- versions ----------
  // 5 dernières versions enregistrées (avant écrasement : la carte telle qu'elle était dans le dashboard, format anglais, `en: 1`) et
  // 3 dernières copies d'avant nettoyage (`nettoyage: n`, `cles` : rooms, walls, openings), dans une même liste, à part dans les dialogues.
  // Rangées dans les données utilisateur du frontend de HA (frontend/get_user_data et frontend/set_user_data, clé `maquette-versions:<id>`,
  // fichier .storage/frontend.user_data_<utilisateur>) : elles suivent le compte HA sur tous ses appareils, chaque utilisateur a les siennes,
  // sans intégration côté serveur ; rien ne part ailleurs que dans HA. Copie dans ce navigateur (localStorage, même clé) : repli quand HA
  // refuse (ancienne version, erreur, déconnexion). Lecture synchrone (listes, dialogues) dans un cache rempli à l'ouverture de l'éditeur
  // par la fusion navigateur + HA, sans doublon (empreinte : date + contenu). Dans HA, la liste entière compressée (deflate-raw, base64),
  // 1 Mo au plus par carte : au-delà, les plus anciennes partent d'abord, jamais la dernière version enregistrée.
  static PLAFOND_VERSIONS_HA = 1e6;
  _empreinteVersion(v) {
    let h = 0;
    for (const c of JSON.stringify(v.config ?? v.cles ?? null) || "") h = (h * 31 + c.charCodeAt(0)) | 0;
    return `${v.t}-${v.nettoyage ? "n" : "v"}-${(h >>> 0).toString(36)}`;
  }
  // liste lue (navigateur ou HA) ou à écrire : objets seulement, anciennes clés françaises converties, sans doublon, plus récentes d'abord
  _listeVersions(l) {
    if (!Array.isArray(l)) return [];
    const vues = new Set(), out = [];
    for (let v of l) {
      if (!v || typeof v !== "object" || Array.isArray(v)) continue;
      if (!v.en && v.config && typeof v.config === "object") try { v = { ...v, config: versAnglais(v.config), en: 1 }; } catch (e) { continue; }
      const k = this._empreinteVersion(v);
      if (!vues.has(k)) { vues.add(k); out.push(v); }
    }
    out.sort((a, b) => (+b.t || 0) - (+a.t || 0));
    return [...out.filter((v) => !v.nettoyage).slice(0, 5), ...out.filter((v) => v.nettoyage && v.cles).slice(0, 3)];
  }
  _toutesVersions(id) {
    const c = this._cacheVersions?.[id];
    if (c) return c;
    try { return this._listeVersions(JSON.parse(localStorage.getItem(cleVersions(id)) || "[]")); } catch (e) { return []; }
  }
  _versions(id = this._ident()) { return this._toutesVersions(id).filter((v) => !v.nettoyage); }
  _copiesNettoyage(id = this._ident()) { return this._toutesVersions(id).filter((v) => v.nettoyage && v.cles); }
  // versions rangées dans le compte HA (sinon : dans ce navigateur seulement)
  _versionsDuCompte(id = this._ident()) { return this._versionsHA?.[id] === true; }
  _titreVersions(n) {
    return this._versionsDuCompte() ? _t("Versions de ce compte ({n}) : reprendre un plan enregistré avant", { n })
      : _t("Versions précédentes ({n}) : reprendre un plan enregistré avant", { n });
  }
  _poserVersions(id, l) {
    (this._cacheVersions ||= {})[id] = l;
    try { localStorage.setItem(cleVersions(id), JSON.stringify(l)); } catch (e) { /* stockage plein ou indisponible : HA garde la liste */ }
  }
  _ecrireVersions(id, versions, copies) {
    this._poserVersions(id, this._listeVersions([...versions.slice(0, 5), ...copies.slice(0, 3)]));
    void this._synchroniserVersions(id);
  }
  _garderVersion(id, config) { this._ecrireVersions(id, [{ t: Date.now(), config, en: 1 }, ...this._versions(id)], this._copiesNettoyage(id)); }

  // valeur rangée dans HA : { format: 1, z: <deflate-raw en base64> } (ou { format: 1, liste } sans CompressionStream)
  async _encoderVersions(l) {
    if (typeof CompressionStream !== "function") return { format: 1, liste: l };
    const o = new Uint8Array(await new Response(new Blob([JSON.stringify(l)]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());
    let s = "";
    for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode(...o.subarray(i, i + 0x8000));
    return { format: 1, z: btoa(s) };
  }
  // rien (null) : liste vide ; format inconnu (version plus récente de Maquette) ou illisible : erreur, HA n'est alors pas réécrit
  async _decoderVersions(val) {
    if (val == null) return [];
    if (typeof val !== "object" || val.format !== 1) throw new Error("format inconnu");
    if (Array.isArray(val.liste)) return val.liste;
    if (typeof val.z !== "string" || typeof DecompressionStream !== "function") throw new Error("format illisible");
    const b = Uint8Array.from(atob(val.z), (c) => c.charCodeAt(0));
    return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text());
  }
  // au-delà du plafond : la plus ancienne part (copies comprises), jamais la dernière version ; null si elle seule le dépasse
  async _encoderPlafonne(l) {
    l = [...l];
    for (;;) {
      const val = await this._encoderVersions(l);
      if (JSON.stringify(val).length <= this.constructor.PLAFOND_VERSIONS_HA) return { val, liste: l };
      const derniere = l.find((v) => !v.nettoyage), autres = l.filter((v) => v !== derniere);
      if (!autres.length) return null;
      l.splice(l.indexOf(autres.reduce((a, b) => ((+b.t || 0) < (+a.t || 0) ? b : a))), 1);
    }
  }
  // fusion navigateur + HA, puis HA complété s'il lui manque quelque chose ; une synchronisation à la fois par carte
  _synchroniserVersions(id = this._ident()) {
    const f = (this._fileVersions ||= {});
    return (f[id] = (f[id] || Promise.resolve()).then(() => this._synchroniser(id)).catch(() => { (this._versionsHA ||= {})[id] = false; return false; }));
  }
  async _synchroniser(id) {
    const hass = this.hass, cle = cleVersions(id), etat = (this._versionsHA ||= {});
    if (typeof hass?.callWS !== "function") { etat[id] = false; return false; }
    const brut = await this._decoderVersions((await hass.callWS({ type: "frontend/get_user_data", key: cle }))?.value), ha = this._listeVersions(brut);
    const avant = this._toutesVersions(id), fusion = this._listeVersions([...avant, ...ha]), emp = (l) => l.map((v) => this._empreinteVersion(v)).join();
    // une écriture arrivée entre-temps garde la main : la synchronisation suivante (déjà en file) la reprendra
    const poser = (l) => { if (this._toutesVersions(id) === avant || !this._cacheVersions?.[id]) this._poserVersions(id, l); };
    let liste = fusion;
    // HA réécrit s'il lui manque une version, ou si sa liste a dû être corrigée (anciennes clés françaises, entrée invalide)
    if (emp(fusion) !== emp(ha) || !Array.isArray(brut) || brut.length !== ha.length || brut.some((v) => !v?.en)) {
      const r = await this._encoderPlafonne(fusion);
      if (!r) { etat[id] = false; poser(fusion); return false; } // dernière version trop grosse pour HA : liste gardée dans ce navigateur seulement
      await hass.callWS({ type: "frontend/set_user_data", key: cle, value: r.val });
      liste = r.liste;
    }
    etat[id] = true;
    poser(liste);
    return true;
  }

  _dialogueConflit(message, ecrasable = true) {
    return new Promise((fin) => {
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue" role="alertdialog" aria-modal="true" style="width:min(460px,100%)"><header><h2>${_t("Plan modifié ailleurs")}</h2>
        <div class="ed-aide">${esc(message)}</div></header>
        <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="exporter">${_t("Exporter mon plan")}</button><button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button>
          ${ecrasable ? `<button class="ed-btn texte" data-r="ecraser" style="color:var(--md-error)">${_t("Écraser avec mon plan")}</button>` : ""}</footer></div>`, { echap: () => fermer("annuler") });
      const fermer = (r) => { retirer(); fin(r); };
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) fermer(b?.dataset.r || "annuler"); };
    });
  }

  // Enregistrer : enregistre puis quitte l'éditeur ; Appliquer (Ctrl+S) : enregistre et reste dans l'éditeur, avec un message
  async enregistrer(rester = false) {
    if (this.R.querySelector(".ed-voile") && this.modifie) return this.snack(_t("Ferme la fenêtre ouverte pour enregistrer."));
    if (!this.modifie || this._enCours) return;
    this._enCours = true;
    let ok = false;
    try { ok = await this._enregistrer(rester); } finally { this._enCours = false; }
    if (ok && !rester) {
      stockSession.retirer(cleRouvrir(this.d.id));
      this.fermer();
    }
  }
  appliquer() { return this.enregistrer(true); }

  async _enregistrer(rester = true) {
    const seg = decodeURIComponent(location.pathname.split("/")[1] || "");
    const url_path = !seg || seg === "lovelace" ? null : seg;
    try {
      let cfg = await this.hass.callWS({ type: "lovelace/config", url_path });
      // dashboard créé par notre stratégie « Plan de la maison » : on reprend la main (vues explicites) avant d'enregistrer
      if (cfg?.strategy && /^custom:(maquette|plan-maison)$/.test(cfg.strategy.type)) cfg = await customElements.get("ll-strategy-dashboard-maquette").generate(cfg.strategy, this.hass);
      else if (cfg?.strategy) throw new Error(_t("ce dashboard est généré automatiquement : prends le contrôle du dashboard dans HA pour pouvoir enregistrer"));
      let { ref, conflit, erreur, nouvelId } = this._trouverCarte(cfg);
      if (conflit) {
        const r = await this._dialogueConflit(ref ? _t("Le plan a changé ailleurs. Enregistrer écrasera ces changements.")
          : _t("La carte ouverte n'a plus la même configuration dans le dashboard et n'a pas d'id pour la retrouver. Exporte ton plan, recharge la page, puis réimporte-le."), !!ref);
        if (r === "exporter") return this.exporter();
        if (r !== "ecraser" || !ref) return;
      }
      if (!ref) throw new Error(erreur === "introuvable" ? _t("carte introuvable dans ce dashboard (aperçu, ou dashboard modifié) : recharge la page") : erreur);
      const avant = clone(ref);
      // éléments ou valeurs que la carte rejette dans la config du dashboard : prévenir avant, les retirer ou les garder tels quels
      const rejets = await this._choisirRejets(avant);
      if (rejets === "annuler") return;
      // une carte sans id (ou dupliquée avec le même id) en reçoit un, pour être retrouvée à coup sûr aux prochains enregistrements
      if (this.d.id == null || nouvelId) {
        this._retirerBrouillon();
        const ancien = this._ident(), copies = this._copiesNettoyage(ancien);
        this.d.id = `plan-${Math.random().toString(36).slice(2, 8)}`;
        // les copies d'avant nettoyage suivent la carte sous son nouvel id
        if (copies.length) this._ecrireVersions(this.d.id, this._versions(this.d.id), [...copies, ...this._copiesNettoyage(this.d.id)]);
      }
      Object.keys(ref).forEach((k) => delete ref[k]);
      // enregistré replié (versAnglais replie, `floors` dans l'ordre, aucune clé interne)
      Object.assign(ref, versAnglais(this.d));
      if (rejets) this._remettreRejets(ref, rejets);
      const fige = JSON.stringify(this._replie());
      // HA recrée la carte après l'enregistrement : la nouvelle instance rouvre l'éditeur au même endroit (même étage)
      if (rester) stockSession.ecrire(cleRouvrir(this.d.id), JSON.stringify({ sel: this.sel, grille: this.grille, etage: this._etageActif(), t: Date.now() }));
      await this.hass.callWS({ type: "lovelace/config/save", url_path, config: cfg });
      this._garderVersion(this.d.id, avant); // seulement après un enregistrement réussi
      this.original = JSON.parse(fige);
      this.externe = null;
      this.modifie = false;
      this._retirerBrouillon();
      this._barre();
      this.snack(_t("Plan enregistré."));
      return true;
    } catch (e) {
      const m = String(e?.message || e?.code || e);
      const yaml = /yaml|not supported|unsupported/i.test(m), auto = e?.code === "config_not_found";
      this.snack(_t("Échec de l'enregistrement : {raison}", { raison: yaml ? _t("dashboard en mode YAML, à modifier dans ses fichiers (exporte le plan pour le copier)") : auto ? _t("dashboard généré automatiquement : prends-en le contrôle dans HA (⋮ → Modifier le dashboard)") : m }),
        [[_t("Réessayer"), () => this.enregistrer(rester)], [_t("Exporter"), () => this.exporter()]], "erreur");
    }
  }

  async quitter() {
    if (this.modifie) {
      const ok = await new Promise((fin) => {
        const { voile } = this._voile("", `<div class="ed-dialogue" role="alertdialog" style="width:min(380px,100%)"><header><h2>${_t("Quitter sans enregistrer ?")}</h2>
          <div class="ed-aide">${_t("Brouillon gardé dans ce navigateur.")}</div></header>
          <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="0">${_t("Continuer l'édition")}</button><button class="ed-btn texte" data-r="2" style="color:var(--md-error)">${_t("Abandonner les modifications")}</button>
            <button class="ed-btn texte" data-r="1">${_t("Quitter")}</button></footer></div>`);
        voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) { voile.remove(); fin(b?.dataset.r || "0"); } };
      });
      if (ok === "0") return;
      if (ok === "2") this._retirerBrouillon();
    }
    // la carte n'a pas été recréée après l'enregistrement : la reprise prévue ne doit pas rouvrir l'éditeur qu'on quitte
    stockSession.retirer(cleRouvrir(this.d.id));
    this.fermer();
  }

  fermer(silencieux) {
    this._decablerAides();
    window.removeEventListener("keydown", this._touche, true);
    window.removeEventListener("pointerdown", this._pointeBtn, true);
    window.removeEventListener("keyup", this._relache, true);
    window.removeEventListener("beforeunload", this._avantFermeture);
    window.removeEventListener("pointermove", this._suivre, true);
    window.removeEventListener("pointerdown", this._suivre, true);
    this.zone.removeEventListener("pointerleave", this._sortie);
    this.R.querySelector(".ed-bulle")?.remove();
    this.zone.removeEventListener("pointerdown", this._pd);
    this.zone.removeEventListener("pointermove", this._pm);
    this.zone.removeEventListener("dblclick", this._dbl);
    this.zone.removeEventListener("contextmenu", this._ctx);
    this.zone.classList.remove("dessin");
    this._fermerMenu();
    this.barre.remove(); this.style.remove();
    this.R.querySelectorAll(".ed-voile,.ed-mvoile,.ed-snack,.ed-bf").forEach((n) => n.remove());
    this._bfObs?.disconnect(); this._bfObs = null; this._edObs?.disconnect(); this._edObs = null; this._edCarte = null;
    this.vueParametres = false; this.vueEdition = false;
    const c = this.carte;
    c._editeur = null; c._boxFige = null;
    // la carte reprend la config repliée (enregistrée, ou modifiée ailleurs) et reste sur l'étage affiché s'il existe encore
    const E = c.constructor.ETAGES, plein = clone(this.externe || this.original), ids = E.ids(plein);
    c._plein = plein;
    c._etage = ids.length ? (ids.includes(this._etageActif()) ? this._etageActif() : E.etageInitial(plein)) : null;
    c._config = E.deplier(plein, c._etage);
    suivreLangue(c, c._config);
    if (silencieux) c._ok = false; else c._construire();
  }
}
