// image de fond dans l'éditeur (L6) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- image de fond : modale MD3 ouverte depuis Calques (ligne « Image de fond », bouton Régler) ----------
  // Chaque changement = une étape d'annulation. Le verrou (cliquer à travers, image immobile) vaut pour la session d'édition.
  ouvrirFond() {
    if (!this.vueCalques) this.panneauCalques(true);
    this.vueFond = true;
    this._fondAlerte = null;
    this._panneau();
    this.R.querySelector(".ed-fond-modale [data-fact=retour]")?.focus({ preventScroll: true });
  }
  // retour à la liste des calques (Échap, flèche ←)
  fermerFond() {
    this.vueFond = false;
    this._fondAlerte = null;
    this.R.querySelector(".ed-mvoile.ed-fond-modale")?.remove();
    this._panneau();
    this.R.querySelector('.ed-cq-modale [data-act="cq-fond-regler"]')?.focus({ preventScroll: true });
  }
  _fondAvertiLu() { return stock.lire("maquette-fond-avertissement") === "1"; }
  _panneauFond() {
    let V = this.R.querySelector(".ed-mvoile.ed-fond-modale");
    if (!this.vueCalques || !this.vueFond) { V?.remove(); return; }
    if (!V) {
      V = this._mvoile("ed-fond-modale");
      V.onpointerdown = (ev) => { this._basVoileFond = ev.target === V; };
      V.addEventListener("click", (ev) => { if (ev.target === V && this._basVoileFond) this.fermerFond(); });
      this._clavierModale(V);
    }
    V.hidden = !!(this.sel || this.multi.size || this.vueEdition || this.vueParametres || this.vueAmbiance);
    if (V.hidden) return;
    const actif = this.R.activeElement, garde = V.contains(actif) && actif.dataset?.fk ? `[data-fk="${actif.dataset.fk}"]` : V.contains(actif) && actif.dataset?.fact ? `[data-fact="${actif.dataset.fact}"]` : null;
    const f = this.d.fond, url = f && this.carte.constructor.urlFond(f.image), admin = !!this.hass?.user?.is_admin;
    const libre = !this.carte._fondVerrouille(), num = (v) => (Number.isFinite(+v) ? Math.round(+v * 10) / 10 : "");
    const op = Number.isFinite(+f?.opacite) ? +f.opacite : 0.5;
    const envoyer = admin ? `<button type="button" class="ed-btn${f ? " contour" : ""}" data-fact="envoyer"><ha-icon icon="mdi:upload"></ha-icon>${_t("Envoyer une image")}</button>
      <input type="file" accept="image/png,image/jpeg,image/webp" hidden data-fond-fichier>` : "";
    const avert = this._fondAvertiLu() ? "" : `<div class="ed-fond-avert" role="note"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><div>${_t("Confidentialité : ce qui est dans /local et /api/image/serve est lisible sans connexion si Home Assistant est exposé sur Internet. N'y mets pas un plan que tu ne veux pas rendre public.")}
      <div class="ed-actions"><button type="button" class="ed-btn texte" data-fact="compris">${_t("Compris")}</button></div></div></div>`;
    const alerte = this._fondAlerte ? `<div class="ed-fond-alerte" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${esc(this._fondAlerte)}</span></div>` : "";
    const chemin = `<div class="ed-champ"><label for="ed-fond-chemin">${_t("Chemin de l'image")}${bulleI(_t("Une image du même site : un fichier de /local/… (dossier www de Home Assistant) ou une image envoyée ici. PNG, JPEG, WebP, AVIF ou SVG."))}</label>
      <input type="text" id="ed-fond-chemin" data-fk="image" value="${esc(f?.image || "")}" placeholder="/local/plans/rdc.png" spellcheck="false" autocomplete="off"></div>`;
    const reglages = f ? `${url ? `<div class="ed-fond-apercu"><img src="${esc(url)}" alt="${esc(_t("Aperçu de l'image de fond"))}" loading="lazy" decoding="async"></div>` : ""}
      ${chemin}
      <div class="ed-actions">${envoyer}${url ? `<button type="button" class="ed-btn contour" data-fact="calibrer" title="${_t("Deux points de l'image et leur distance réelle (ou un mur du plan) : l'image est mise à l'échelle.")}"><ha-icon icon="mdi:ruler"></ha-icon>${_t("Calibrer")}</button>` : ""}</div>
      ${champCurseur(_t("Opacité"), 'data-fk="opacite"', 0, 1, 0.05, op, `${Math.round(op * 100)} %`)}
      <div class="ed-ligne">${this._champFond(_t("Position X (cm)"), "x", num(f.pos?.[0] ?? 0))}${this._champFond(_t("Position Y (cm)"), "y", num(f.pos?.[1] ?? 0))}</div>
      <div class="ed-ligne">${this._champFond(_t("Largeur (cm)"), "largeur", num(f.largeur), _t("La hauteur suit (même proportion)."))}${this._champFond(_t("Rotation (°)"), "rotation", num(f.rotation || 0))}</div>
      <label class="ed-inter"><span>${_t("Afficher aussi en vue")}${bulleI(_t("Sinon, l'image n'apparaît que pendant l'édition (rien n'est chargé en vue)."))}</span><input type="checkbox" data-fk="afficher" ${f.afficher === "toujours" ? "checked" : ""}></label>
      <label class="ed-inter"><span>${_t("Verrouillée (on clique à travers)")}${bulleI(_t("Les clics atteignent les pièces et les murs dessous. Déverrouillée : elle peut être déplacée sur le plan, le temps de l'édition."))}</span><input type="checkbox" data-fk="verrou" ${libre ? "" : "checked"}></label>
      <div class="ed-actions"><button type="button" class="ed-btn danger" data-fact="retirer"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Retirer l'image")}</button></div>`
      : `<p class="ed-aide">${_t("Pose un plan scanné ou une photo sous le dessin pour le recopier. Visible pendant l'édition seulement, sauf si tu choisis de l'afficher aussi en vue.")}</p>
      ${chemin}<div class="ed-actions">${envoyer}</div>`;
    poserHTML(V, `<style>.ed-fond-apercu{border-radius:12px;overflow:hidden;background:var(--md-surface-container-high,#eee);display:flex;justify-content:center;max-height:180px;margin-bottom:8px}
      .ed-fond-apercu img{max-width:100%;max-height:180px;object-fit:contain;display:block}
      .ed-fond-avert,.ed-fond-alerte{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-radius:12px;margin-bottom:12px;font-size:14px;line-height:20px}
      .ed-fond-avert{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
      .ed-fond-alerte{background:var(--md-error-container,#fce8e6);color:var(--md-on-error-container,#410e0b)}
      .ed-fond-avert>ha-icon,.ed-fond-alerte>ha-icon{flex:none;--mdc-icon-size:20px}
      .ed-fond-avert .ed-actions{margin:4px 0 -8px -12px}</style>
      <div class="ed-modale ed-modale-cq ed-modale-fond" role="dialog" aria-modal="true" aria-labelledby="ed-fond-titre">
      <header><button class="ib" data-fact="retour" title="${_t("Retour aux calques (Échap)")}" aria-label="${_t("Retour aux calques (Échap)")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>
        <div><h2 id="ed-fond-titre">${_t("Image de fond")}</h2><div class="ed-version">${_t("Sous tout le dessin, à l'échelle du plan (cm)")}</div></div>
        <button class="ib" data-fact="fermer" title="${_t("Fermer")}" aria-label="${_t("Fermer")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcontenu ed-medit"><section>${avert}${alerte}${reglages}</section></div></div>`);
    const boite = V.querySelector(".ed-modale");
    if (garde) boite.querySelector(garde)?.focus({ preventScroll: true });
    this._cablerFond(boite);
  }
  _champFond(label, k, v, aide = "") {
    return `<div class="ed-champ"><label for="ed-fond-${k}">${esc(label)}${bulleI(aide)}</label><input type="number" step="any" id="ed-fond-${k}" data-fk="${k}" value="${esc(v)}"></div>`;
  }
  _cablerFond(B) {
    B.onclick = (ev) => {
      const el = ev.composedPath().find((n) => n.dataset?.fact);
      if (!el) return;
      const a = el.dataset.fact;
      if (a === "retour") return this.fermerFond();
      if (a === "fermer") { this.vueFond = false; return this.panneauCalques(false); }
      if (a === "compris") { stock.ecrire("maquette-fond-avertissement", "1"); return this._panneauFond(); }
      if (a === "calibrer") return this.calibrerFond?.();
      if (a === "envoyer") return B.querySelector("[data-fond-fichier]")?.click();
      if (a === "retirer") { this.commit(() => { delete this.d.fond; }); return this.snack(_t("Image de fond retirée."), _t("Annuler"), this._annulation(), 8000); }
    };
    const fic = B.querySelector("[data-fond-fichier]");
    if (fic) fic.onchange = () => { const f = fic.files?.[0]; fic.value = ""; if (f) this._envoyerFond(f); };
    B.querySelectorAll("[data-fk]").forEach((inp) => {
      const k = inp.dataset.fk;
      if (k === "opacite") {
        const out = inp.parentElement.querySelector("output"), im = () => this.carte.shadowRoot.querySelector(".zone svg .fond-image");
        inp.oninput = () => { out.textContent = `${Math.round(+inp.value * 100)} %`; im()?.setAttribute("opacity", inp.value); }; // aperçu en direct, une seule étape au relâcher
        inp.onchange = () => this._modifFond(k, +inp.value);
      } else if (inp.type === "checkbox") inp.onchange = () => this._modifFond(k, inp.checked);
      else inp.onchange = () => this._modifFond(k, inp.type === "number" ? (inp.value === "" ? null : +inp.value) : inp.value.trim());
    });
  }
  // plan entier : position et largeur d'une nouvelle image (largeur du plan, au moins 100 cm)
  _cadreFond() {
    const b = this.carte.bornes();
    const ok = (v, d) => (Number.isFinite(+v) ? Math.round(+v) : d);
    return { pos: [ok(b.x0, 0), ok(b.y0, 0)], largeur: Math.max(100, Math.min(1e6, ok(b.W, 1000))) };
  }
  _alerteFond(t) { this._fondAlerte = t; this._panneauFond(); }
  _modifFond(k, v) {
    this._fondAlerte = null;
    if (k === "verrou") {
      this.fondLibre = !v;
      this.carte._construire();
      return this._panneauFond();
    }
    if (k === "image") {
      if (!v) return this._panneauFond();
      if (!this.carte.constructor.urlFond(v)) return this._alerteFond(_t("Chemin refusé : une image du même site seulement (/local/… ou image envoyée), en PNG, JPEG, WebP, AVIF ou SVG."));
      return this.commit(() => { if (this.d.fond) this.d.fond.image = v; else this.d.fond = { image: v, ...this._cadreFond() }; });
    }
    const f = this.d.fond;
    if (!f) return;
    if (k === "largeur" && !(v > 0)) return this._alerteFond(_t("La largeur doit être plus grande que 0."));
    if ((k === "x" || k === "y" || k === "rotation") && v != null && !Number.isFinite(v)) return this._panneauFond();
    this.commit(() => {
      if (k === "opacite") f.opacite = Math.min(1, Math.max(0, v));
      else if (k === "x" || k === "y") { const p = Array.isArray(f.pos) ? [...f.pos] : [0, 0]; p[k === "x" ? 0 : 1] = v ?? 0; f.pos = p; }
      else if (k === "largeur") { const v2 = Math.min(1e6, v); if (+f.hauteur > 0 && +f.largeur > 0) f.hauteur = Math.round(f.hauteur * v2 / f.largeur * 10) / 10; f.largeur = v2; }
      else if (k === "rotation") { const r = (((v ?? 0) % 360) + 360) % 360; if (r) f.rotation = r; else delete f.rotation; }
      else if (k === "afficher") { if (v) f.afficher = "toujours"; else delete f.afficher; }
    });
  }
  // « Envoyer une image » (administrateur) : envoi à Home Assistant (/api/image/upload), puis image = /api/image/serve/<id>/original,
  // à la largeur du plan en gardant la proportion de l'image
  async _envoyerFond(fichier) {
    this._fondAlerte = null;
    const h = this.hass;
    if (!h?.user?.is_admin || typeof h.fetchWithAuth !== "function") return this._alerteFond(_t("Envoi réservé aux administrateurs de Home Assistant."));
    if (!/^image\/(?:png|jpeg|webp)$/.test(fichier.type)) return this._alerteFond(_t("Format refusé : PNG, JPEG ou WebP seulement."));
    if (fichier.size > 10 * 1024 * 1024) return this._alerteFond(_t("Image trop lourde : 10 Mo au plus. Réduis-la avant de l'envoyer."));
    let dims;
    try { const bm = await createImageBitmap(fichier); dims = [bm.width, bm.height]; bm.close?.(); } catch (e) { return this._alerteFond(_t("Image illisible : le fichier n'est pas une image valide.")); }
    if (!dims[0] || !dims[1]) return this._alerteFond(_t("Image illisible : le fichier n'est pas une image valide."));
    this.snack(_t("Envoi de l'image…"), null, null, 3000);
    const fd = new FormData();
    fd.append("file", fichier);
    let r, id;
    try { r = await h.fetchWithAuth("/api/image/upload", { method: "POST", body: fd }); } catch (e) { return this._alerteFond(_t("Envoi impossible : Home Assistant ne répond pas.")); }
    if (r.status === 401 || r.status === 403) return this._alerteFond(_t("Envoi refusé : réservé aux administrateurs de Home Assistant."));
    if (r.status === 413) return this._alerteFond(_t("Image trop lourde pour Home Assistant. Réduis-la avant de l'envoyer."));
    if (!r.ok) return this._alerteFond(_t("Envoi refusé par Home Assistant (erreur {n}).", { n: r.status }));
    try { id = (await r.json())?.id; } catch (e) { id = null; }
    const url = typeof id === "string" && this.carte.constructor.urlFond(`/api/image/serve/${id}/original`);
    if (!url) return this._alerteFond(_t("Réponse inattendue de Home Assistant : image non posée."));
    const cadre = this._cadreFond(), haut = Math.round(cadre.largeur * dims[1] / dims[0] * 10) / 10;
    this.commit(() => {
      const f = this.d.fond;
      this.d.fond = { ...(f && Number.isFinite(+f.opacite) ? { opacite: f.opacite } : {}), ...(f?.afficher ? { afficher: f.afficher } : {}), image: url, ...cadre, hauteur: haut };
    });
    if (Math.max(...dims) > 4096) this._alerteFond(_t("Image très grande ({l} × {h} px) : au-delà de 4096 px, l'affichage peut être lent sur une tablette ou un téléphone.", { l: dims[0], h: dims[1] }));
    else this.snack(_t("Image envoyée et posée sous le plan."));
  }
} // @assemblage
