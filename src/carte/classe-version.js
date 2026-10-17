// nouvelle version : petite fenêtre « Maquette X.Y.Z est disponible » (administrateurs) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // Source : l'entité de mise à jour que HACS crée pour la carte (update.*, release_url vers le dépôt), lue dans HA : aucune requête
  // externe. Notes de version : websocket update/release_notes (fournies par HACS). Montrée aux administrateurs seulement, une fois
  // par page (plusieurs cartes = une fenêtre), jamais dans l'éditeur ni en aperçu ; « Plus tard » la masque jusqu'à la version
  // suivante (navigateur). Version installée par HACS mais page pas rechargée : même fenêtre, bouton « Recharger ». Sans HACS
  // (installation manuelle), rien. `update_notice: false` la coupe.
  static comparerVersions(a, b) { // « v0.4.1 » vs « 0.4.0 » : > 0 si a est plus récente (X.Y.Z seulement)
    const n = (v) => String(v || "").replace(/^v/i, "").split(/[.-]/).slice(0, 3).map((x) => parseInt(x, 10) || 0);
    const [x, y] = [n(a), n(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;
  }
  // notes de version (markdown de la release) → quelques lignes de texte, sans balisage
  static resumeNotes(md, max = 5) {
    const l = String(md || "").split("\n").map((s) => s.trim()).filter((s) => /^[-*] /.test(s))
      .map((s) => s.replace(/^[-*] /, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim()).filter(Boolean);
    return { lignes: l.slice(0, max).map((s) => (s.length > 140 ? `${s.slice(0, 139)}…` : s)), reste: Math.max(0, l.length - max) };
  }

  // état de l'entité de mise à jour de HACS pour Maquette (null : pas installée par HACS) ; recherche refaite au plus toutes les minutes (HACS peut démarrer après la page)
  etatVersion() {
    const h = this._hass, t = Date.now();
    if (!h?.states) return null;
    if (this._nvId === undefined || (this._nvId === null && t - (this._nvCherche || 0) > 60e3)) {
      this._nvCherche = t;
      this._nvId = Object.keys(h.states).find((id) => id.startsWith("update.") && String(h.states[id].attributes?.release_url || "").includes("TooMuhtsh/maquette-card")) || null;
    }
    return (this._nvId && h.states[this._nvId]) || null;
  }

  _quand_hass_version() {
    const h = this._hass;
    if (!h?.user?.is_admin || this._editeur || this._apercu() || !h.states) return;
    this._nouveautes();
    if (this._config?.avis_maj === false || this.shadowRoot?.querySelector(".nv.nouveautes")) return;
    const s = this.etatVersion();
    if (!s || s === this._nvEtat) return;
    this._nvEtat = s;
    const a = s.attributes || {}, cible = a.latest_version, K = MaquetteCard;
    if (!cible || K.comparerVersions(cible, VERSION) <= 0) return this._fermerVersion();
    let ignoree = null;
    try { ignoree = localStorage.getItem("maquette-version-ignoree"); } catch (e) { /* stockage indisponible */ }
    const autre = globalThis.__maquetteVersion; // une seule fenêtre par page (carte retirée de la page : la place se libère)
    if (ignoree === cible || (autre && autre !== this && autre.isConnected)) return;
    globalThis.__maquetteVersion = this;
    this._montrerVersion(s);
  }

  async _montrerVersion(s) {
    const R = this.shadowRoot, a = s.attributes || {}, cible = String(a.latest_version).replace(/^v/i, ""), K = MaquetteCard;
    // téléchargée par HACS mais pas encore chargée par la page : il ne reste qu'à recharger
    const telechargee = s.state !== "on" && K.comparerVersions(a.installed_version, a.latest_version) >= 0;
    const enCours = !!a.in_progress;
    let d = R.querySelector(".nv");
    if (!d) {
      d = document.createElement("div");
      d.className = "nv"; d.setAttribute("role", "dialog"); d.setAttribute("aria-labelledby", "nv-titre");
      R.querySelector("ha-card").append(d);
      d.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const b = ev.composedPath().find((n) => n.dataset?.nv)?.dataset.nv;
        if (b === "plus-tard") {
          try { localStorage.setItem("maquette-version-ignoree", this._nvEtat?.attributes?.latest_version || ""); } catch (e) { /* stockage indisponible */ }
          this._fermerVersion();
        } else if (b === "installer") {
          this._hass.callService("update", "install", { entity_id: this._nvId }).catch((e) => console.warn("maquette-card : update failed", e));
          d.querySelector('[data-nv="installer"]')?.setAttribute("disabled", "");
        } else if (b === "recharger") location.reload();
        // liens (le HTML posé dans la carte n'a pas de balise <a>) : notes de la version, ou le dépôt pour l'étoile
        else if (b === "github" || b === "etoile") {
          const at = this._nvEtat?.attributes || {}, D = MaquetteCard.DEPOT;
          window.open(b === "etoile" ? D : at.release_url || `${D}/releases`, "_blank", "noopener,noreferrer");
        }
      });
    }
    // notes de version : une fois par version
    if (this._nvNotes?.v !== cible) {
      this._nvNotes = { v: cible, n: K.resumeNotes("") };
      try {
        const md = a.release_summary || (await this._hass.callWS({ type: "update/release_notes", entity_id: this._nvId }));
        this._nvNotes = { v: cible, n: K.resumeNotes(md) };
      } catch (e) { /* pas de notes : la fenêtre reste utile */ }
      if (this._nvEtat !== s) return; // un nouvel état est arrivé pendant l'attente : il redessine
    }
    const { lignes, reste } = this._nvNotes.n;
    poserHTML(d, `<div class="nv-tete"><ha-icon icon="mdi:party-popper"></ha-icon><div class="nv-t"><b id="nv-titre">${esc(_t("Maquette {v} est disponible", { v: cible }))}</b>
        <small>${esc(telechargee ? _t("Téléchargée : recharge la page pour l'utiliser") : _t("Tu as la {v}", { v: VERSION }))}</small></div>
        <button class="ib" data-nv="plus-tard" title="${esc(_t("Plus tard"))}" aria-label="${esc(_t("Plus tard"))}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${lignes.length ? `<ul class="nv-notes">${lignes.map((l) => `<li><span class="nv-2l">${esc(l)}</span></li>`).join("")}</ul>${reste ? `<p class="nv-reste">${esc(_t("… et {n} autres changements", { n: reste }))}</p>` : ""}` : ""}
      <div class="nv-actions">${telechargee ? `<button class="cta plein" data-nv="recharger"><ha-icon icon="mdi:refresh"></ha-icon>${esc(_t("Recharger"))}</button>`
        : `<button class="cta plein" data-nv="installer"${enCours ? " disabled" : ""}><ha-icon icon="mdi:download"></ha-icon>${esc(enCours ? _t("Installation…") : _t("Mettre à jour"))}</button>`}
        <button class="cta texte" data-nv="github">${esc(_t("Voir sur GitHub"))}</button></div>
      <button class="nv-etoile" data-nv="etoile"><ha-icon icon="mdi:star-outline"></ha-icon>${esc(_t("Maquette te plaît ? Une étoile sur GitHub l'aide à se faire connaître"))}</button>`);
  }

  _fermerVersion() {
    this.shadowRoot?.querySelector(".nv")?.remove();
    if (globalThis.__maquetteVersion === this) globalThis.__maquetteVersion = null;
  }
  // ---------- « Quoi de neuf » : au premier affichage d'une nouvelle version (administrateurs) ----------
  // Version vue gardée dans le navigateur (maquette-version-vue). Sans trace : plan vide = nouvelle installation (rien à montrer, la
  // version est notée) ; plan déjà dessiné = mise à jour depuis une version sans cette fenêtre (≤ 0.3.x) → montrée. Une seule fenêtre
  // par page, comme l'avis de nouvelle version. Démo (hass sans connexion) : seulement avec ?nouveautes (tests).
  static NOUVEAUTES = {
    "0.4.0": () => ({
      lignes: [_t("Nouveau thème par défaut : Home Assistant. La carte prend l'apparence des autres cartes de ton tableau de bord."),
        _t("Sept thèmes, des retouches de couleurs et ton propre CSS : ⚙ Paramètres › Apparence."),
        _t("Plus léger au repos, surtout sur téléphone."),
        _t("Les boutons du plan s'estompent à la souris et gardent leur place."),
        _t("Une fenêtre comme celle-ci te préviendra des prochaines versions.")],
      note: _t("Tu préférais l'ancien rendu ? Choisis « Material » dans Apparence."),
      // boutons vers les nouveautés : { texte, icone, parametres: onglet de ⚙ Paramètres } ou { texte, icone, lien: adresse (dépôt si relative) }
      boutons: [{ texte: _t("Choisir un thème"), icone: "mdi:palette-outline", parametres: "apparence" }],
    }),
  };
  _nouveautes() {
    if (this._nqFait || !this._config) return;
    // démo (hass simulé, sans connexion à HA) : seulement avec ?nouveautes
    if (!this._hass?.connection && !/[?&]nouveautes\b/.test(location.search)) return;
    this._nqFait = true;
    const K = MaquetteCard, cle = "maquette-version-vue", noter = () => { try { localStorage.setItem(cle, VERSION); } catch (e) { /* stockage indisponible */ } };
    let vue = null;
    try { vue = localStorage.getItem(cle); } catch (e) { return; }
    if (!vue && !this._config.pieces?.length) return noter();
    if (vue && K.comparerVersions(VERSION, vue) <= 0) return;
    const autre = globalThis.__maquetteVersion;
    if (!K.NOUVEAUTES[VERSION] || (autre && autre !== this && autre.isConnected)) return noter();
    this.montrerNouveautes(vue);
  }
  // fenêtre « Quoi de neuf » de la version chargée ; aussi à la demande (⚙ Paramètres › À propos) ; false s'il n'y a rien pour cette version
  montrerNouveautes(vue = null) {
    const K = MaquetteCard, n = K.NOUVEAUTES[VERSION]?.(), R = this.shadowRoot;
    if (!n || !R) return false;
    const noter = () => { try { localStorage.setItem("maquette-version-vue", VERSION); } catch (e) { /* stockage indisponible */ } };
    R.querySelector(".nv.nouveautes")?.remove();
    globalThis.__maquetteVersion = this;
    const d = document.createElement("div");
    d.className = "nv nouveautes"; d.setAttribute("role", "dialog"); d.setAttribute("aria-labelledby", "nq-titre");
    poserHTML(d, `<div class="nv-tete"><ha-icon icon="mdi:creation-outline"></ha-icon><div class="nv-t"><b id="nq-titre">${esc(_t("Quoi de neuf dans Maquette {v}", { v: VERSION }))}</b>
        <small>${esc(vue ? _t("Mise à jour depuis la {v}", { v: vue }) : _t("Les nouveautés de cette version"))}</small></div>
        <button class="ib" data-nq="ok" title="${esc(_t("Fermer"))}" aria-label="${esc(_t("Fermer"))}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <ul class="nv-notes">${n.lignes.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      ${n.note ? `<p class="nv-reste">${esc(n.note)}</p>` : ""}
      <div class="nv-actions"><button class="cta plein" data-nq="ok">${esc(_t("Compris"))}</button>
        ${(n.boutons || []).map((x, i) => `<button class="cta" data-nq="b${i}"><ha-icon icon="${esc(x.icone || "mdi:arrow-right")}"></ha-icon>${esc(x.texte)}</button>`).join("")}
        <button class="cta texte" data-nq="notes">${esc(_t("Toutes les nouveautés"))}</button></div>
      <button class="nv-etoile" data-nq="etoile"><ha-icon icon="mdi:star-outline"></ha-icon>${esc(_t("Maquette te plaît ? Une étoile sur GitHub l'aide à se faire connaître"))}</button>`);
    d.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const b = ev.composedPath().find((x) => x.dataset?.nq)?.dataset.nq;
      if (!b) return;
      if (b === "notes" || b === "etoile") return window.open(b === "etoile" ? K.DEPOT : `${K.DEPOT}/releases/tag/v${VERSION}`, "_blank", "noopener,noreferrer");
      const x = /^b\d+$/.test(b) ? n.boutons?.[+b.slice(1)] : null;
      if (x?.lien) return window.open(/^https?:/.test(x.lien) ? x.lien : `${K.DEPOT}/${x.lien.replace(/^\//, "")}`, "_blank", "noopener,noreferrer");
      noter(); d.remove();
      if (globalThis.__maquetteVersion === this) globalThis.__maquetteVersion = null;
      this._nvEtat = null; // l'avis de nouvelle version peut venir ensuite
      if (x?.parametres) { if (!this._editeur) await this.ouvrirEditeur(); this._editeur?.panneauParametres(true, x.parametres); }
    });
    R.querySelector("ha-card").append(d);
    return true;
  }
} // @assemblage
