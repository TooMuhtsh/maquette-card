// « Nettoyer le plan » : dialogue, application, copies — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- nettoyer le plan ----------
  // analyse par le moteur (MaquetteNettoyage) → dialogue : aperçu, défauts cerclés (clic = zoom), corrections à cocher (pièce par
  // pièce pour les murs manquants et les passages) ; « Appliquer » = une seule action annulable, après une copie du plan d'avant
  nettoyerPlan() {
    const N = globalThis.MaquetteNettoyage, en = versMoteur(this.d), controles = this._controlesNet(), a = N.analyser(en, { ...N.OPTIONS_DEFAUT, controles });
    const opts = { ...N.OPTIONS_DEFAUT, controles }, salles = { manquants: new Set(), passages: new Set() };
    const visibles = OPTIONS_NET.filter(([k]) => a.corrections[k].length && (k !== "arrondir" || a.arrondiUtile));
    const items = visibles.flatMap(([k]) => a.corrections[k]).map((x, i) => ({ ...x, i }));
    const piecesDe = (k) => [...new Set(items.filter((x) => x.option === k).flatMap((x) => x.pieces || [x.piece]))];
    const choix = () => {
      const o = { ...opts };
      for (const k of PAR_PIECE) { const t = piecesDe(k); o[k] = salles[k].size && salles[k].size === t.length ? true : salles[k].size ? [...salles[k]].filter((n) => n != null) : false; }
      return o;
    };
    const nDef = items.filter((x) => x.niveau === "defaut").length, nStyle = items.filter((x) => x.niveau === "style").length;
    const copies = this._copiesNettoyage().length;
    const lienCopies = copies ? `<button class="ed-btn texte" data-x="copies"><ha-icon icon="mdi:history"></ha-icon>${_t("Plans d'avant nettoyage ({n})", { n: copies })}</button>` : "";
    const { voile, fermer } = this._voile("ed-plein-tel", null, { echap: () => fermer() });
    // plan propre, sans rien de facultatif : un message et rien à faire
    if (!visibles.length) {
      poserHTML(voile, `<div class="ed-dialogue ed-net ed-net-petit" role="dialog" aria-modal="true" aria-label="${esc(_t("Nettoyer le plan"))}"><header><h2>${_t("Nettoyer le plan")}</h2></header>
        <div class="ed-net-vide" role="status"><ha-icon icon="mdi:check-circle-outline"></ha-icon><b>${_t("Plan propre")}</b><span>${_t("Rien à corriger.")}</span></div>
        <footer>${lienCopies}<span class="ed-espace"></span><button class="ed-btn plein" data-x="fermer">${_t("Fermer")}</button></footer></div>`);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.x); if (ev.target === voile || b?.dataset.x === "fermer") fermer(); else if (b?.dataset.x === "copies") { fermer(); this.copiesNettoyage(); } };
      this.R.querySelector("ha-card").append(voile);
      voile.querySelector('[data-x="fermer"]').focus();
      return;
    }
    let vue = "avant", sel = null, vb = null, essai = N.nettoyer(en, choix());
    const plein = cadreNet(en);
    const resume = [nDef ? _t("{n} défaut|{n} défauts", { n: nDef }) : "", nStyle ? _t("{n} retouche de dessin|{n} retouches de dessin", { n: nStyle }) : ""].filter(Boolean).join(" · ");
    poserHTML(voile, `<div class="ed-dialogue ed-net" role="dialog" aria-modal="true" aria-label="${esc(_t("Nettoyer le plan"))}"><header><h2>${_t("Nettoyer le plan")}</h2>
        <div class="ed-aide">${esc(resume ? `${resume}. ${_t("Rien ne change avant « Appliquer ».")}` : _t("Rien ne change avant « Appliquer »."))}</div></header>
      <div class="ed-cat ed-net-corps"><div class="ed-net-apercu"><div class="ed-net-tete"><span class="ed-seg petit" role="group" aria-label="${esc(_t("Aperçu"))}">
          <button data-vue="avant" class="on" aria-pressed="true">${_t("Avant")}</button><button data-vue="apres" aria-pressed="false">${_t("Après")}</button></span><span class="ed-espace"></span>
          <button class="ib" data-x="tout" title="${esc(_t("Tout voir"))}" aria-label="${esc(_t("Tout voir"))}" hidden><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button></div>
        <div class="ed-net-w"></div><div class="ed-net-leg"></div></div>
        <div class="ed-net-form"></div></div>
      <footer>${lienCopies}<span class="ed-espace"></span><button class="ed-btn texte" data-x="fermer">${_t("Annuler")}</button><button class="ed-btn plein" data-x="appliquer"></button></footer></div>`);
    const W = voile.querySelector(".ed-net-w"), F = voile.querySelector(".ed-net-form"), leg = voile.querySelector(".ed-net-leg"), btnApp = voile.querySelector('[data-x="appliquer"]');
    const genre = (x) => (x.niveau === "defaut" ? "defaut" : x.niveau === "info" ? "info" : "style");
    const apercu = () => {
      const r = W.getBoundingClientRect(), cw = r.width || 600, ch = r.height || 400, v = vb || plein;
      const k = Math.max(v.w / cw, v.h / ch);
      const marques = vue === "avant" ? items.map((x) => ({ i: x.i, point: x.point, segment: x.type === "passage" || x.type === "absent" ? x.segment : null, genre: genre(x) }))
        : essai.operations.map((x, j) => ({ i: `f${j}`, point: x.point, genre: "fait" }));
      poserHTML(W, svgNettoyage(vue === "avant" ? en : essai.config, v, k, marques, sel));
      W.classList.toggle("ed-net-z", !!vb);
      voile.querySelector('[data-x="tout"]').hidden = !vb;
      poserHTML(leg, vue === "avant" ? `<span><i class="l-def"></i>${_t("Défaut")}</span><span><i class="l-style"></i>${_t("Retouche de dessin")}</span>${items.some((x) => genre(x) === "info") ? `<span><i class="l-info"></i>${_t("Sans mur")}</span>` : ""}`
        : `<span><i class="l-fait"></i>${_t("{n} correction|{n} corrections", { n: essai.operations.length })}</span>`);
    };
    // zoom sur un défaut (animé, sauf mouvement réduit) ; null = tout le plan
    const zoomer = (cible) => {
      const r = W.getBoundingClientRect(), ratio = (r.height || 400) / (r.width || 600), de = vb || plein;
      let vers = null;
      if (cible) {
        const L = cible.segment ? Math.hypot(cible.segment[2] - cible.segment[0], cible.segment[3] - cible.segment[1]) : 0, w = Math.max(300, L + 160, 300 / ratio);
        vers = { x: cible.point[0] - w / 2, y: cible.point[1] - (w * ratio) / 2, w, h: w * ratio };
      }
      const fin = vers || plein;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { vb = vers; return apercu(); }
      const t0 = performance.now(), D = 220, ease = (t) => 1 - (1 - t) ** 3;
      const pas = (t) => {
        const u = ease(Math.min(1, (t - t0) / D));
        vb = { x: de.x + (fin.x - de.x) * u, y: de.y + (fin.y - de.y) * u, w: de.w + (fin.w - de.w) * u, h: de.h + (fin.h - de.h) * u };
        apercu();
        if (u < 1) requestAnimationFrame(pas); else { vb = vers; apercu(); }
      };
      requestAnimationFrame(pas);
    };
    const ouverts = new Set();
    const formulaire = () => {
      const ligne = ([k, lib, sous]) => {
        const L = items.filter((x) => x.option === k), on = PAR_PIECE.has(k) ? salles[k].size > 0 : !!opts[k];
        const t = PAR_PIECE.has(k) ? piecesDe(k) : [], partiel = PAR_PIECE.has(k) && salles[k].size > 0 && salles[k].size < t.length;
        const nb = (n) => L.filter((x) => (x.pieces || [x.piece]).includes(n)).length;
        return `<div class="ed-net-opt"><label class="ed-coche"><input type="checkbox" data-o="${k}" ${on ? "checked" : ""} ${partiel ? 'data-partiel="1"' : ""}>
            <span class="n"><span>${_t(lib)}</span><small>${_t(sous)}</small></span><span class="ed-net-nb">${L.length}</span></label>
          ${t.length > 1 || (t.length && PAR_PIECE.has(k)) ? `<div class="ed-puces ed-net-salles">${t.map((n, j) => `<button type="button" data-salle="${k}:${j}" class="${salles[k].has(n) ? "on" : ""}" aria-pressed="${salles[k].has(n)}">${esc(n ?? _t("Pièce sans nom"))} · ${nb(n)}</button>`).join("")}</div>` : ""}
          <details class="ed-net-det" data-det="${k}" ${ouverts.has(k) ? "open" : ""}><summary>${_t("Voir où")}</summary><div class="ed-net-liste">${L.map((x) => `<button type="button" data-d="${x.i}" class="${sel === x.i ? "on" : ""}">${esc(texteNet(x))}${x.piece ? `<small> · ${esc(x.piece)}</small>` : ""}</button>`).join("")}</div></details></div>`;
      };
      const parDefaut = visibles.filter(([k]) => N.OPTIONS_DEFAUT[k]), autres = visibles.filter(([k]) => !N.OPTIONS_DEFAUT[k]);
      poserHTML(F, (a.propre ? `<div class="ed-net-propre" role="status"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span><b>${_t("Plan propre")}</b>${_t("Rien à corriger. Options facultatives :")}</span></div>` : "")
        + parDefaut.map(ligne).join("") + (autres.length && parDefaut.length ? `<h4>${_t("Facultatif")}</h4>` : "") + autres.map(ligne).join(""));
      F.querySelectorAll("[data-partiel]").forEach((i) => { i.indeterminate = true; });
      const n = essai.operations.length;
      btnApp.textContent = n ? _t("Appliquer · {n}", { n }) : _t("Appliquer");
      btnApp.disabled = !n;
    };
    const recalculer = () => { essai = N.nettoyer(en, choix()); formulaire(); apercu(); };
    const choisir = (i) => {
      const x = items.find((y) => String(y.i) === String(i));
      if (!x) return;
      if (sel === x.i) { sel = null; formulaire(); return zoomer(null); }
      sel = x.i;
      if (vue !== "avant") { vue = "avant"; voile.querySelectorAll("[data-vue]").forEach((b) => { b.classList.toggle("on", b.dataset.vue === "avant"); b.setAttribute("aria-pressed", b.dataset.vue === "avant"); }); }
      ouverts.add(x.option);
      formulaire();
      zoomer(x);
    };
    voile.addEventListener("toggle", (ev) => { const d = ev.target?.dataset?.det; if (d) ev.target.open ? ouverts.add(d) : ouverts.delete(d); }, true);
    voile.onchange = (ev) => {
      const k = ev.target?.dataset?.o;
      if (!k) return;
      if (PAR_PIECE.has(k)) salles[k] = ev.target.checked ? new Set(piecesDe(k)) : new Set();
      else opts[k] = ev.target.checked;
      recalculer();
    };
    voile.onclick = (ev) => {
      if (ev.target === voile) return fermer();
      const ch = ev.composedPath(), b = ch.find((n) => n.dataset?.x || n.dataset?.vue || n.dataset?.salle || n.dataset?.d != null);
      if (!b) { if (vb && ch.includes(W)) zoomer(null); return; }
      if (b.dataset.d != null) {
        // un repère de l'aperçu « Après » (correction faite) ne mène à rien de plus : on recadre seulement
        if (String(b.dataset.d).startsWith("f")) { const o = essai.operations[+b.dataset.d.slice(1)]; return o && zoomer(vb ? null : { point: o.point }); }
        return choisir(b.dataset.d);
      }
      if (b.dataset.vue) {
        vue = b.dataset.vue;
        voile.querySelectorAll("[data-vue]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
        return apercu();
      }
      if (b.dataset.salle) {
        const [k, j] = b.dataset.salle.split(":"), n = piecesDe(k)[+j];
        salles[k].has(n) ? salles[k].delete(n) : salles[k].add(n);
        return recalculer();
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "tout") { sel = null; formulaire(); return zoomer(null); }
      if (x === "copies") { fermer(); return this.copiesNettoyage(); }
      if (x === "appliquer") { fermer(); this.appliquerNettoyage(choix()); }
    };
    this.R.querySelector("ha-card").append(voile);
    formulaire();
    apercu();
    // la taille de l'aperçu n'est connue qu'une fois le dialogue affiché (et change avec la fenêtre)
    const ro = new ResizeObserver(() => { if (!voile.isConnected) return ro.disconnect(); apercu(); });
    ro.observe(W);
    btnApp.disabled ? voile.querySelector('[data-x="fermer"]').focus() : btnApp.focus();
  }

  // contrôles des ouvertures (côté dehors, volets reliés à rien) : entités connues de HA (sans HA, aucune n'est dite inexistante)
  _controlesNet() { const st = this.hass?.states; return { entites: st && Object.keys(st).length ? Object.keys(st) : null }; }

  // applique les corrections choisies : copie du plan d'avant gardée dans ce navigateur, puis une seule action annulable
  appliquerNettoyage(options = {}) {
    const N = globalThis.MaquetteNettoyage, r = N.nettoyer(versMoteur(this.d), { controles: this._controlesNet(), ...options }), n = r.operations.length;
    if (!n) return this.snack(_t("Plan propre"));
    const garde = this._garderCopieNettoyage(n), res = depuisMoteur(this.d, r.config);
    this.commit(() => {
      this.d.pieces = res.pieces;
      if (this.d.ouvertures || res.ouvertures.length) this.d.ouvertures = res.ouvertures;
      if (this.d.murs || res.murs.length) this.d.murs = res.murs;
      this.sel = null; this.multi.clear();
    });
    this.snack(garde ? _t("{n} correction|{n} corrections", { n }) : `${_t("{n} correction|{n} corrections", { n })} · ${_t("copie d'avant non gardée : stockage du navigateur plein")}`, _t("Annuler##defaire"), this._annulation(), 10000);
    return n;
  }
  // copie des clés que le nettoyage peut toucher, au format public (anglais) : rooms, walls, openings
  _instantaneNettoyage(n) {
    const o = {};
    for (const k of ["pieces", "murs", "ouvertures"]) if (Object.hasOwn(this.d, k)) o[k] = this.d[k];
    return globalThis.MaquetteNettoyage.instantane(versAnglais(clone(o)), n);
  }
  _garderCopieNettoyage(n) {
    try {
      const id = this._ident(), inst = this._instantaneNettoyage(n);
      this._ecrireVersions(id, this._versions(id), [{ t: Date.now(), nettoyage: n, cles: inst.cles, en: 1 }, ...this._copiesNettoyage(id)]);
      return true;
    } catch (e) { return false; }
  }
  // remet pièces, murs et ouvertures d'une copie d'avant nettoyage (une action annulable)
  restaurerNettoyage(j = 0) {
    const v = this._copiesNettoyage()[j];
    if (!v) return;
    const back = customElements.get("maquette-card").normaliser({ pieces: [], ...depuisAnglais({ ...v.cles }) });
    this.commit(() => {
      for (const [k, e] of [["pieces", "rooms"], ["murs", "walls"], ["ouvertures", "openings"]]) {
        if (Object.hasOwn(v.cles, e)) this.d[k] = back[k];
        else if (k === "pieces") this.d.pieces = [];
        else delete this.d[k];
      }
      this.sel = null; this.multi.clear();
    });
    this.snack(_t("Plan d'avant nettoyage restauré."), _t("Annuler##defaire"), this._annulation(), 10000);
  }
  async _copierTexte(t) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) { /* refusé : repli ci-dessous */ }
    const ta = document.createElement("textarea");
    ta.value = t; ta.style.cssText = "position:fixed;left:0;top:0;opacity:0";
    this.R.querySelector("ha-card").append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* indisponible */ }
    ta.remove();
    return ok;
  }
  // « Restaurer un plan d'avant nettoyage » : les 3 dernières copies de ce navigateur, aperçu, restauration ou copie en YAML (autre appareil)
  copiesNettoyage() {
    const copies = this._copiesNettoyage();
    if (!copies.length) return this.snack(_t("Aucun plan d'avant nettoyage dans ce navigateur."));
    let j = 0;
    const date = (t) => new Date(t).toLocaleString(_loc(), { dateStyle: "short", timeStyle: "short" });
    const { voile, fermer } = this._voile("ed-plein-tel", `<div class="ed-dialogue ed-net" role="dialog" aria-modal="true" aria-label="${esc(_t("Plans d'avant nettoyage"))}"><header><h2>${_t("Plans d'avant nettoyage")}</h2>
        <div class="ed-aide">${_t("Les 3 derniers, gardés dans ce navigateur. « Restaurer » remplace pièces, murs et ouvertures (annulable).")}</div></header>
      <div class="ed-cat ed-net-corps"><div class="ed-net-apercu"><div class="ed-net-w"></div></div>
        <div class="ed-versions" role="listbox" aria-label="${esc(_t("Plans d'avant nettoyage"))}">${copies.map((v, i) => `<button type="button" role="option" data-c="${i}" aria-selected="${i === 0}" class="${i === 0 ? "on" : ""}"><span>${esc(date(v.t))}<small> · ${_t("{n} correction|{n} corrections", { n: v.nettoyage })}</small></span></button>`).join("")}</div></div>
      <footer><button class="ed-btn texte" data-x="yaml"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copier le plan d'avant (YAML)")}</button><span class="ed-espace"></span>
        <button class="ed-btn texte" data-x="fermer">${_t("Fermer")}</button><button class="ed-btn plein" data-x="restaurer"><ha-icon icon="mdi:history"></ha-icon>${_t("Restaurer")}</button></footer></div>`, { echap: () => fermer() });
    const W = voile.querySelector(".ed-net-w");
    const apercu = () => {
      const c = { rooms: copies[j].cles.rooms || [], walls: copies[j].cles.walls || [], openings: copies[j].cles.openings || [] }, v = cadreNet(c), r = W.getBoundingClientRect();
      poserHTML(W, svgNettoyage(c, v, Math.max(v.w / (r.width || 600), v.h / (r.height || 400)), [], null));
    };
    voile.onclick = async (ev) => {
      if (ev.target === voile) return fermer();
      const b = ev.composedPath().find((n) => n.dataset?.x || n.dataset?.c != null);
      if (!b) return;
      if (b.dataset.c != null) {
        j = +b.dataset.c;
        voile.querySelectorAll("[data-c]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
        return apercu();
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "restaurer") { fermer(); return this.restaurerNettoyage(j); }
      if (x === "yaml") {
        const ok = await this._copierTexte(versYaml(copies[j].cles) + "\n");
        this.snack(ok ? _t("Plan d'avant copié (YAML : rooms, walls, openings).") : _t("Copie refusée par le navigateur."));
      }
    };
    apercu();
    const ro = new ResizeObserver(() => { if (!voile.isConnected) return ro.disconnect(); apercu(); });
    ro.observe(W);
    voile.querySelector('[data-x="restaurer"]').focus();
  }

} // @assemblage
