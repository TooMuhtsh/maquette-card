// pièces : entités, actions, liens ; appels de service confirmés ; glisser des widgets — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // entités de la pièce : celles placées dans son contour + celles de la pièce HA liée
  entitesPiece(pi) {
    const c = this._config, p = c.pieces[pi], l = new Set();
    for (const q of c.points || []) if (dansPoly(q.pos, p.poly)) [q.entite, q.actif, q.valeur].forEach((e) => e && l.add(e));
    for (const o of c.ouvertures || []) if (distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], p.poly) < 20) [...contactsDe(o), o.volet, o.entite].forEach((e) => e && l.add(e));
    entitesZone(this._hass, p.zone).forEach((e) => l.add(e));
    [p.temperature, p.humidite].forEach((e) => e && l.add(e));
    return [...l].filter((e) => e.includes(".") && this._hass.states[e]);
  }

  _actionsPiece(pi) {
    const p = this._config.pieces[pi], ents = this.entitesPiece(pi), dom = (e) => e.split(".")[0];
    const boutons = [];
    if (p.auto_actions !== false) {
      const lum = ents.filter((e) => dom(e) === "light");
      if (lum.length) {
        const allumees = lum.filter((e) => this._etat(e).state === "on").length;
        boutons.push(allumees ? { nom: lum.length > 1 ? _t("Éteindre tout") : _t("Éteindre"), icone: "mdi:lightbulb-off-outline", action: "light.turn_off", cibles: lum }
          : { nom: lum.length > 1 ? _t("Allumer tout") : _t("Allumer"), icone: "mdi:lightbulb-on-outline", action: "light.turn_on", cibles: lum, plein: true });
      }
      const vol = ents.filter((e) => dom(e) === "cover" && ["shade", "shutter", "blind", "curtain", "awning", "window"].includes(this._etat(e).attributes.device_class));
      if (vol.length) {
        // libellés courts (l'icône dit « volet »), texte complet en infobulle : les boutons tiennent sur une rangée
        boutons.push({ nom: _t("Ouvrir"), titre: vol.length > 1 ? _t("Ouvrir les volets") : _t("Ouvrir le volet"), icone: "mdi:window-shutter-open", action: "cover.open_cover", cibles: vol });
        boutons.push({ nom: _t("Fermer"), titre: vol.length > 1 ? _t("Fermer les volets") : _t("Fermer le volet"), icone: "mdi:window-shutter", action: "cover.close_cover", cibles: vol });
      }
    }
    for (const a of p.actions || []) {
      const d0 = (a.action || "").split(".")[0];
      const cibles = a.cible === "piece" ? (p.zone ? null : ents.filter((e) => d0 === "homeassistant" || dom(e) === d0)) : a.cible ? [a.cible] : null;
      boutons.push({ ...a, cibles, zone: a.cible === "piece" && p.zone ? p.zone : null });
    }
    const lie = this._lies(pi);
    // scènes liées en boutons ; les scripts restent listés (ils peuvent déclencher des alertes) : un appui ouvre leur fiche
    for (const e of lie.scene || []) {
      if ((p.actions || []).some((a) => a.cible === e)) continue;
      boutons.push({ nom: this._nom(e), icone: "mdi:palette-outline", action: "scene.turn_on", cibles: [e] });
    }
    return { boutons, automations: p.automatismes === false ? [] : [...(lie.automation || []), ...(lie.script || [])] };
  }

  // automatisations / scènes / scripts liés (search/related), en cache 10 min
  _lies(pi) {
    const p = this._config.pieces[pi], cle = `${pi}|${p.zone || ""}`, c = (this._cacheLies ||= {})[cle];
    if (!c || (Date.now() - c.t > 600000 && !c.enCours)) {
      this._cacheLies[cle] = { ...(c || { v: {} }), enCours: true, t: c?.t || 0 };
      const req = p.zone ? [{ item_type: "area", item_id: p.zone }] : this.entitesPiece(pi).slice(0, 20).map((e) => ({ item_type: "entity", item_id: e }));
      Promise.all(req.map((r) => this._hass.callWS({ type: "search/related", ...r }).catch(() => ({}))))
        .then((rs) => {
          const v = {};
          for (const r of rs) for (const k of ["automation", "scene", "script"]) for (const e of r[k] || []) (v[k] ||= new Set()).add(e);
          for (const k of Object.keys(v)) v[k] = [...v[k]].filter((e) => this._hass.states[e]).sort();
          this._cacheLies[cle] = { v, t: Date.now() };
          if (this._iso === pi) this._fiche();
        });
    }
    return c?.v || {};
  }

  // bouton d'une pièce : son service, confirmé par un dialogue s'il est sensible ou si le bouton a `confirm: true`
  _lancerAction(btn) {
    const b = this._boutons?.[+btn.dataset.cta];
    if (!b || typeof b.action !== "string" || !SERVICE_SUR.test(b.action)) return;
    const [domaine, service] = b.action.split(".");
    const cible = b.zone ? { area_id: b.zone } : b.cibles ? { entity_id: b.cibles } : undefined;
    const donnees = objetSimple(b.donnees) ? b.donnees : {};
    this._appeler(domaine, service, donnees, cible, { forcer: b.confirmer === true, libelle: b.nom }).then((fait) => {
      if (!fait || !btn.isConnected) return;
      btn.classList.remove("confirmer"); btn.classList.add("fait");
      setTimeout(() => btn.isConnected && btn.classList.remove("fait"), 1200);
    }).catch((e) => { btn.title = String(e?.message || e); btn.classList.add("confirmer"); });
  }

  // appel de service depuis le plan (jamais pendant l'édition) : un service sensible demande toujours une confirmation qui nomme
  // l'action réelle et les entités visées ; `forcer` la demande aussi pour un service sûr. Renvoie true si le service est parti.
  async _appeler(dom, svc, donnees = {}, cible, { forcer = false, libelle = "" } = {}) {
    if (this._editeur) return false;
    const ents = entitesAppel(this._hass, dom, donnees, cible);
    if ((forcer || serviceSensible(this._hass, dom, svc, ents)) && !(await this._confirmerService(dom, svc, donnees, ents, libelle))) return false;
    await this._hass.callService(dom, svc, donnees, cible);
    return true;
  }

  // dialogue de confirmation (MD3) : l'action réelle (verbe et service technique), les entités visées (nom et identifiant),
  // les clés des données envoyées (jamais leurs valeurs : un code reste caché) ; Annuler a le focus, Échap annule
  _confirmerService(dom, svc, donnees, ents, libelle) {
    const R = this.shadowRoot;
    R.querySelector("dialog.conf")?.close();
    const d = document.createElement("dialog");
    d.className = "conf";
    d.setAttribute("role", "alertdialog");
    d.setAttribute("aria-labelledby", "conf-t"); d.setAttribute("aria-describedby", "conf-d");
    const verbe = verbeService(dom, svc), cles = Object.keys(donnees || {}).filter((k) => k !== "entity_id" && k !== "area_id");
    const liste = ents === null ? `<p>${_t("Cibles : appareils ou zones (non détaillés).")}</p>`
      : ents.length ? `<ul>${ents.slice(0, 20).map((e) => `<li><b>${esc(this._nom(e))}</b><small>${esc(e)}</small></li>`).join("")}${ents.length > 20 ? `<li>${_t("… et {n} autres", { n: ents.length - 20 })}</li>` : ""}</ul>` : `<p>${_t("Sans entité visée.")}</p>`;
    const bouton = libelle && libelle !== verbe ? `<p>${_t("Bouton « {nom} »", { nom: esc(libelle) })}</p>` : "";
    poserHTML(d, `<ha-icon class="conf-ic" icon="mdi:shield-alert-outline"></ha-icon><h2 id="conf-t">${esc(_t("{action} ?", { action: verbe }))}</h2>
      <div id="conf-d">${bouton}<p>${_t("Service appelé : {service}", { service: `<code>${esc(`${dom}.${svc}`)}</code>` })}</p>${liste}
      ${cles.length ? `<p>${_t("Données envoyées : {cles}", { cles: esc(cles.join(", ")) })}</p>` : ""}</div>
      <div class="conf-actions"><button class="non" data-conf="non">${_t("Annuler")}</button><button class="oui" data-conf="oui">${esc(verbe)}</button></div>`);
    R.querySelector("ha-card").append(d);
    return new Promise((fin) => {
      let r = false;
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // jamais vers les clics de la carte ni de la fiche ouverte
        const b = ev.composedPath().find((n) => n.dataset?.conf);
        if (b) { r = b.dataset.conf === "oui"; d.close(); }
      });
      d.addEventListener("close", () => { d.remove(); fin(r); });
      d.showModal();
      d.querySelector(".non").focus();
    });
  }

  // édition : glisser-déposer des widgets pour les réordonner ou les changer de panneau
  // (souris : dès 5 px ; tactile : appui long, le défilement de la page reste possible sinon)
  _glisserWidgets(vue) {
    vue.addEventListener("pointerdown", (ev) => {
      if (!this._editeur || ev.button > 0) return;
      const w = ev.composedPath().find((n) => n.classList?.contains("w") && n.dataset?.w);
      if (!w) return;
      const R = this.shadowRoot, src = this._selWidget(w.dataset.w);
      const x0 = ev.clientX, y0 = ev.clientY, tactile = ev.pointerType === "touch";
      let actif = false, fantome = null, depot = null, cible = null, dx = 0, dy = 0;
      const bloquer = (e) => e.preventDefault();
      const viser = (x, y) => {
        let cont = null;
        for (const c of R.querySelectorAll(".col:not([hidden]) .widgets")) { const r = c.closest(".col").getBoundingClientRect(); if (x >= r.left - 24 && x <= r.right + 24) cont = c; }
        if (!cont) return null;
        const items = [...cont.children].filter((n) => (n.dataset.w || n.dataset.ajouter) && !n.classList.contains("w-fantome"));
        for (const n of items) {
          const r = n.getBoundingClientRect();
          if (y < r.top + r.height / 2) return n.dataset.ajouter ? { cote: n.dataset.ajouter, i: Infinity, avant: n } : { cote: n.dataset.w.split(":")[0], i: +n.dataset.w.split(":")[1], avant: n };
        }
        const der = items[items.length - 1];
        return { cote: der?.dataset.ajouter || der?.dataset.w?.split(":")[0] || (cont.closest(".col-g") ? "gauche" : "droite"), i: Infinity, avant: null, cont };
      };
      const demarrer = () => {
        actif = true;
        const r = w.getBoundingClientRect();
        dx = x0 - r.left; dy = y0 - r.top;
        fantome = w.cloneNode(true);
        fantome.classList.add("w-fantome"); fantome.classList.remove("sel");
        Object.assign(fantome.style, { width: `${r.width}px`, left: `${r.left}px`, top: `${r.top}px` });
        R.querySelector("ha-card").append(fantome);
        w.classList.add("glisse");
        depot = document.createElement("div"); depot.className = "w-depot";
        if (tactile) window.addEventListener("touchmove", bloquer, { passive: false });
      };
      const minuteur = tactile ? setTimeout(demarrer, 350) : null;
      const bouge = (e) => {
        if (!actif) {
          const d = Math.hypot(e.clientX - x0, e.clientY - y0);
          if (tactile) { if (d > 8) fin(); return; }
          if (d < 5) return;
          demarrer();
        }
        fantome.style.left = `${e.clientX - dx}px`; fantome.style.top = `${e.clientY - dy}px`;
        cible = viser(e.clientX, e.clientY);
        if (!cible) { depot.remove(); return; }
        const cont = cible.avant?.parentElement || cible.cont || R.querySelector(`.col-${cible.cote === "gauche" ? "g" : "d"} .widgets`);
        if (cible.avant) cont.insertBefore(depot, cible.avant); else cont.append(depot);
      };
      const fin = (e) => {
        clearTimeout(minuteur);
        window.removeEventListener("pointermove", bouge); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
        window.removeEventListener("touchmove", bloquer);
        if (!actif) return;
        fantome.remove(); depot.remove();
        R.querySelectorAll(".w.glisse").forEach((n) => n.classList.remove("glisse"));
        this._wDrag = true;
        setTimeout(() => { this._wDrag = false; }, 0);
        if (e?.type === "pointerup" && cible) this._editeur?.deplacerWidget(src, cible.cote, cible.i);
      };
      window.addEventListener("pointermove", bouge); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
    });
  }

  // « gauche:2 », « droite:0:3 » (pièce 3), « fiche:1:5 » (fiche du meuble 5), « fiche:1:5:ouverture » / « fiche:1:5:point » → sélection de l'éditeur
  _selWidget(k) { return deCle(`widget:${k}`); }

} // @assemblage
