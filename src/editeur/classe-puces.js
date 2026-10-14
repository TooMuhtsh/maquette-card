// résumé en tête (puces) : onglets, glisser, déplacer, ajouter — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- résumé en tête (puces) ----------
  _puces(creer) {
    if (Array.isArray(this.d.resume)) return this.d.resume;
    if (!creer) return this.carte._puces();
    return (this.d.resume = this.carte._puces());
  }

  _ongletsPuce(o) {
    const t0 = PUCES.find((x) => x[0] === o.type), t = t0 ? [t0[0], t0[1], _t(t0[2]), _t(t0[3])] : [o.type, "mdi:help", o.type, ""], l = this._puces(), i = this.sel.i;
    let h = "";
    if (o.type === "entite") h += `${this._champEntite(_t("Entité"), "entite", o.entite, false)}
      ${this._champTexte(_t("Texte après la valeur"), "nom", o.nom, o.entite ? this.carte._nom(o.entite) : _t("nom de l'entité"))}
      <div class="ed-ligne">${this._champTexte(_t("Unité"), "unite", o.unite, _t("auto"))}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, _t("auto"))}</div>
      <h4>${_t("Alerte (puce rouge)")}</h4>
      <div class="ed-ligne">${this._champTexte(_t("Quand l'état vaut"), "alerte_etat", o.alerte_etat, _t("ex. on"))}${this._champNombre(_t("Ou au-dessus de"), "alerte_au_dessus", o.alerte_au_dessus, 1, "—")}</div>
      ${this._champTexte(_t("Masquer la puce quand l'état vaut"), "masquer_si", o.masquer_si, _t("ex. off"))}`;
    h += `<div class="ed-champ"><label>${_t("Afficher la puce")}</label><select data-k="afficher">${[["", _t("Toujours")], ["absent", _t("Seulement quand personne n'est à la maison")], ["present", _t("Seulement quand quelqu'un est à la maison")]].map(([v, n]) => `<option value="${esc(v)}" ${(o.afficher || "") === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${o.afficher ? this._champEntite(this.d.presence ? _t("Présence (défaut : celle des paramètres)") : _t("Présence (défaut : zone Maison)"), "presence", o.presence, true) : ""}
      ${this._champTexte(_t("Icône"), "icone", o.icone, _t("auto ({icone})", { icone: t[1] }))}
      <h4>${_t("Place")}${bulleI(_t("Glisse la puce : à côté d'une autre, sous elle (pile) ou sous toutes (nouvelle ligne)."))}</h4>
      ${i ? this._inter(_t("Sous la puce précédente (pile)"), "sous", o.sous) : ""}
      ${i && !o.sous ? this._inter(_t("Commencer une nouvelle ligne"), "ligne", o.ligne) : ""}`;
    return { icone: o.icone || t[1], titre: o.type === "entite" ? o.nom || (o.entite ? this.carte._nom(o.entite) : t[2]) : t[2], resume: _t("Puce {i} sur {n}", { i: i + 1, n: l.length }),
      aide: t[3] ? `${_t("Puce du résumé, en tête du plan.")} ${t[3]}.` : _t("Puce du résumé, en tête du plan."), apercu: "puce", onglets: [["general", _t("Général"), "mdi:tune-variant", h]],
      actions: `${ibAct("p-avant", "mdi:arrow-left", _t("Avant"), i ? "" : "disabled")}${ibAct("p-apres", "mdi:arrow-right", _t("Après"), i < l.length - 1 ? "" : "disabled")}` };
  }

  // glisser une puce du résumé : à gauche / à droite d'une autre (dans sa ligne), sous elle (pile), ou sous toutes (nouvelle ligne)
  glisserPuce(ev, el) {
    if (ev.button > 0) return;
    ev.preventDefault(); // ni sélection de texte ni glisser natif du navigateur (qui annulerait le pointeur)
    getSelection?.()?.removeAllRanges?.();
    const tete = el.closest(".tete"), i0 = +el.dataset.puce, x0 = ev.clientX, y0 = ev.clientY;
    let actif = false, cible = null;
    const ind = document.createElement("div");
    ind.className = "puce-depot";
    this.carte._glissePuce = true; // plus de redessin du résumé jusqu'au relâchement
    const mv = (e) => {
      if (!el.isConnected) el = tete.querySelector(`.chip[data-puce="${i0}"]`) || el;
      if (!actif) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) < 6) return;
        actif = true; el.classList.add("glisse"); tete.append(ind);
      }
      e.preventDefault();
      el.style.transform = `translate(${e.clientX - x0}px, ${e.clientY - y0}px)`;
      cible = this._ciblePuce(tete, el, e.clientX, e.clientY);
      const T = tete.getBoundingClientRect();
      ind.hidden = !cible;
      if (!cible) return;
      const r = cible.r, place = (x, y, w, h) => Object.assign(ind.style, { left: `${x - T.left}px`, top: `${y - T.top}px`, width: `${w}px`, height: `${h}px` });
      if (cible.mode === "avant") place(r.left - 6, r.top, 3, r.height);
      else if (cible.mode === "apres") place(r.right + 3, r.top, 3, r.height);
      else if (cible.mode === "sous") place(r.left, r.bottom + 2, r.width, 3);
      else place(T.left, T.bottom - 2, T.width, 3);
    };
    const fin = (e) => {
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
      el.style.transform = ""; el.classList.remove("glisse"); ind.remove();
      this.carte._glissePuce = false;
      if (!actif) return;
      this.carte._puceGlissee = true;
      setTimeout(() => { this.carte._puceGlissee = false; }, 0);
      if (e.type === "pointerup" && cible) this.deplacerPuce(i0, cible.mode, cible.j);
    };
    window.addEventListener("pointermove", mv, { passive: false }); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
  }
  _ciblePuce(tete, el, x, y) {
    const l = [...tete.querySelectorAll(".chip[data-puce]")].filter((c) => c !== el).map((c) => ({ j: +c.dataset.puce, r: c.getBoundingClientRect() }));
    if (!l.length) return null;
    const dans = l.find(({ r }) => x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 3 && y <= r.bottom + 3);
    if (dans) return { ...dans, mode: y > dans.r.top + dans.r.height * 0.62 ? "sous" : x < dans.r.left + dans.r.width / 2 ? "avant" : "apres" };
    if (y > Math.max(...l.map(({ r }) => r.bottom)) + 4) return { mode: "ligne", j: null, r: null };
    // dans la bande d'une ligne, hors des puces : à côté de la plus proche
    const bande = l.filter(({ r }) => y >= r.top - 4 && y <= r.bottom + 4);
    if (!bande.length) return null;
    const p = bande.reduce((a, b) => (Math.min(Math.abs(x - a.r.left), Math.abs(x - a.r.right)) <= Math.min(Math.abs(x - b.r.left), Math.abs(x - b.r.right)) ? a : b));
    return { ...p, mode: x > p.r.right ? "apres" : "avant" };
  }
  // déplacement d'une puce ; en la retirant, sa place (début de ligne, tête de pile) passe à la suivante
  deplacerPuce(i0, mode, j) {
    if (mode !== "ligne" && (j == null || j === i0)) return;
    this.commit(() => {
      const l = this._puces(true), p = l[i0], n = l[i0 + 1];
      if (!p) return;
      if (!p.sous && n) { if (n.sous) { delete n.sous; if (p.ligne) n.ligne = true; } else if (p.ligne) n.ligne = true; }
      l.splice(i0, 1);
      delete p.sous; delete p.ligne;
      const jj = j == null ? null : j > i0 ? j - 1 : j;
      const tete = (k) => { while (k > 0 && l[k].sous) k--; return k; }, fin = (k) => { while (l[k + 1]?.sous) k++; return k; };
      let k;
      if (mode === "avant") { k = tete(jj); if (l[k].ligne) { p.ligne = true; delete l[k].ligne; } }
      else if (mode === "apres") k = fin(jj) + 1;
      else if (mode === "sous") { k = jj + 1; p.sous = true; }
      else { k = l.length; if (k) p.ligne = true; }
      l.splice(k, 0, p);
      if (l[0]) delete l[0].ligne;
      this.sel = { type: "puce", i: k };
    });
  }

  ajouterPuce() {
    const l = this._puces(), dispo = PUCES.filter(([t]) => t === "entite" || !l.some((p) => p.type === t));
    const { voile } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true" style="width:min(440px,100%)"><header><h2>${_t("Ajouter une puce")}</h2></header>
      <div class="ed-resultats">${dispo.map(([t, ic, n, d]) => `<button data-t="${t}"><ha-icon icon="${ic}"></ha-icon><span class="n"><span>${esc(_t(n))}</span><small>${esc(_t(d))}</small></span></button>`).join("")}</div>
      <footer><button class="ed-btn texte" data-t="">${_t("Annuler")}</button></footer></div>`);
    voile.onclick = async (ev) => {
      const b = ev.composedPath().find((n) => n.dataset?.t != null);
      if (ev.target !== voile && !b) return;
      voile.remove();
      const t = b?.dataset.t;
      if (!t) return;
      const p = { type: t };
      if (t === "entite") { p.entite = await this.choisirEntite({ titre: _t("Puce : choisir une entité"), obligatoire: true }); if (!p.entite) return; }
      this.commit(() => { const L = this._puces(true); L.push(p); this.sel = { type: "puce", i: L.length - 1 }; });
    };
  }

} // @assemblage
