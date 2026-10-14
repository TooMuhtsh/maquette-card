// partage de modèles, widgets et objets (export anonymisé, code compact), import d'un partage, association des emplacements — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // fonctions pures du partage (tests sans navigateur)
  static get PARTAGE() { return { anonymiserPartage, objetPartage, yamlPartage, codeCompact, lireCodeCompact, lireTextePartage, lirePartage, associerElement, entitesIntrouvables, remplacerEntite, parcourirEntites }; }

  // ---------- <dialog> modal commun (partage, import, entités introuvables) ----------
  // couche supérieure, dans l'hôte (bibliothèque ouverte, sinon la carte) ; Échap et Tab gérés ici (seulement au premier plan),
  // focus rendu à l'élément d'origine. Les dialogues imbriqués (choix d'entité…) s'ouvrent dedans (voir _hote()).
  _dialogueModal(classe, etiquette, retour) {
    const D = document.createElement("dialog");
    D.className = `ed-voile ed-plein-tel ed-dmod ${classe}`;
    D.setAttribute("aria-labelledby", etiquette);
    const avant = retour || this.R.activeElement;
    const touche = (ev) => {
      if (!D.isConnected) return window.removeEventListener("keydown", touche, true);
      if (!this._dessus(D)) return;
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); fermer(); }
      else if (ev.key === "Tab") this._pieger(ev, D.querySelector(".ed-dialogue"));
      else ev.stopPropagation(); // raccourcis de l'éditeur (Suppr, V, M…) coupés tant que le dialogue est ouvert
    };
    D.addEventListener("cancel", (ev) => ev.preventDefault());
    window.addEventListener("keydown", touche, true);
    const fermer = () => {
      window.removeEventListener("keydown", touche, true);
      if (D.open) D.close();
      D.remove();
      if (avant?.isConnected) avant.focus({ preventScroll: true });
    };
    this._hote().append(D);
    D.showModal();
    return { D, fermer };
  }
  // copie dans le presse-papiers : API du navigateur (contexte sécurisé), sinon sélection + execCommand ; échec : false
  // (zone visible, dialogue modal compris ; _copierTexte de classe-nettoyage.js passe par une zone cachée posée dans la carte)
  async _copierZone(ta) {
    if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(ta.value); return true; } catch (e) { /* repli ci-dessous */ } }
    try { ta.focus(); ta.select(); return document.execCommand("copy"); } catch (e) { return false; }
  }
  _telechargerTexte(texte, nom, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([texte], { type }));
    a.download = nom;
    this.R.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  // ---------- partager ----------
  // éléments sélectionnés sur le plan (widgets, pastilles, ouvertures, meubles) au format d'un modèle
  _elementsSelection() {
    const out = [];
    for (const k of this._clesEd()) {
      const s = deCle(k), o = this._elt(k);
      if (!o || typeof o !== "object") continue;
      if (s.type === "widget") { const t = TYPES_ATELIER().find((x) => x.id === o.type); out.push({ nom: o.titre || t?.nom || _t("Widget"), genre: "widget", icone: o.icone || t?.icone || "mdi:view-dashboard-outline", objet: clone(o) }); }
      else if (s.type === "point") out.push({ nom: o.nom || this.carte._nom(o.entite) || _t("Pastille"), genre: "point", icone: o.icone || "mdi:shape-outline", ...(o.entite ? { domaine: o.entite.split(".")[0] } : {}), objet: clone(o) });
      else if (s.type === "ouverture") out.push({ nom: o.nom || nomOuvNet(OUV_EN[o.type]), genre: "ouverture", icone: o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door", objet: clone(o) });
      else if (s.type === "meuble") { const def = MEUBLES()[o.type]; const ob = clone(o); delete ob.type; out.push({ nom: o.nom || (def?.nom ? _t(def.nom) : _t("Meuble")), genre: "meuble", type: o.type, objet: ob }); }
    }
    return out;
  }
  partagerSelection() {
    const l = this._elementsSelection();
    if (!l.length) return this.snack(_t("Rien à partager : sélectionne un widget, une pastille, une ouverture ou un meuble."));
    // focus rendu au bouton de la barre flottante, ou à celui de la fenêtre de l'élément
    this.partager({ elements: l, retour: (!this.vueEdition && this.R.querySelector(".ed-bf:not([hidden]) [data-bf=partager]")) || undefined });
  }
  // opt : elements (sélection du plan, cochés), u (rangs de `modeles` cochés), retour (focus rendu)
  partager(opt = {}) {
    const lib = (this.d.modeles || []).map((m, u) => [m, u]).filter(([m]) => m && GENRES_PARTAGE.includes(m.genre) && (m.objet || m.genre === "meuble"));
    const cochesU = new Set(opt.u || []);
    const liste = [...(opt.elements || []).map((el) => ({ el, coche: true, source: _t("Sélection") })),
      ...lib.map(([m, u]) => ({ el: m, coche: cochesU.has(u), source: _t("Bibliothèque") }))];
    const SORTE = { widget: _t("Widget"), point: _t("Pastille"), ouverture: _t("Ouverture"), meuble: _t("Meuble") };
    let garder = false, format = "yaml", texte = "", jeton = 0;
    const { D, fermer } = this._dialogueModal("ed-partage-d", "ed-pt-titre", opt.retour);
    poserHTML(D, `<div class="ed-dialogue large ed-pt"><header><h2 id="ed-pt-titre">${_t("Partager")}</h2>
        <div class="ed-aide">${_t("Pour un autre plan ou une autre personne. Rien n'est envoyé : copie le texte ou télécharge le fichier.")}</div></header>
      <div class="ed-cat ed-pt-corps">
        <h4 id="ed-pt-a">${_t("À partager")}</h4><div class="ed-pt-choix" role="group" aria-labelledby="ed-pt-a">
          ${liste.length ? liste.map((x, j) => `<label class="ed-pt-el"><input type="checkbox" data-pt-el="${j}" ${x.coche ? "checked" : ""}><ha-icon icon="${esc(x.el.icone || x.el.objet?.icone || "mdi:shape-outline")}"></ha-icon><span>${esc(x.el.nom || SORTE[x.el.genre])}<small>${esc(SORTE[x.el.genre])} · ${esc(x.source)}</small></span></label>`).join("")
            : `<p class="ed-aide">${_t("Aucun modèle dans la bibliothèque : sélectionne des widgets ou des objets sur le plan, puis « Partager ».")}</p>`}</div>
        <div class="ed-pt-opts"><label class="ed-pt-garder"><input type="checkbox" data-pt-garder><span>${_t("Garder mes entités")}<small>${_t("Décoché : chaque entité devient un emplacement à associer à l'import ; noms personnalisés, données d'action et liens retirés.")}</small></span></label>
          <span class="ed-seg petit" role="radiogroup" aria-label="${_t("Format")}">${[["yaml", "YAML"], ["code", _t("Code compact")]].map(([v, t]) => `<button type="button" role="radio" data-pt-f="${v}" aria-checked="${v === format}" class="${v === format ? "on" : ""}">${t}</button>`).join("")}</span></div>
        <textarea class="ed-code ed-pt-code" spellcheck="false" readonly aria-label="${_t("Texte du partage")}"></textarea>
        <div class="ed-aide ed-pt-info" role="status"></div><div class="ed-erreur" hidden></div></div>
      <footer><button class="ed-btn texte" data-pt="copier"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copier")}</button>
        <button class="ed-btn texte" data-pt="telecharger"><ha-icon icon="mdi:download"></ha-icon>${_t("Télécharger")}</button>
        <span class="ed-espace"></span><button class="ed-btn texte" data-pt="importer"><ha-icon icon="mdi:import"></ha-icon>${_t("Importer un partage…")}</button>
        <button class="ed-btn plein" data-pt="fermer">${_t("Fermer")}</button></footer></div>`);
    const ta = D.querySelector("textarea"), info = D.querySelector(".ed-pt-info"), err = D.querySelector(".ed-erreur");
    const erreur = (m) => { err.hidden = !m; err.textContent = m || ""; };
    const generer = async () => {
      const n = ++jeton, els = liste.filter((x) => x.coche).map((x) => x.el);
      erreur("");
      if (!els.length) { ta.value = ""; info.textContent = _t("Coche au moins un élément."); return; }
      const { elements, emplacements } = anonymiserPartage(els, this.hass, garder), o = objetPartage(elements, emplacements);
      let t = yamlPartage(o);
      if (format === "code") { const c = await codeCompact(o); if (n !== jeton) return; if (c) t = c; else { erreur(_t("Code compact indisponible dans ce navigateur : utilise le YAML.")); format = "yaml"; } }
      texte = t; ta.value = t;
      const ne = Object.keys(emplacements).length;
      info.textContent = [_t("{n} élément|{n} éléments", { n: els.length }), garder ? _t("entités gardées") : _t("{n} emplacement à associer|{n} emplacements à associer", { n: ne }), `${fmt(new Blob([t]).size / 1024, 1)} ${_t("ko")}`].join(" · ");
    };
    D.addEventListener("change", (ev) => {
      const t = ev.target;
      if (t.dataset?.ptEl != null) { liste[+t.dataset.ptEl].coche = t.checked; generer(); }
      else if (t.dataset?.ptGarder != null) { garder = t.checked; generer(); }
    });
    D.addEventListener("click", async (ev) => {
      if (ev.target === D) return;
      const ch = ev.composedPath(), f = ch.find((n) => n.dataset?.ptF);
      if (f) { format = f.dataset.ptF; D.querySelectorAll("[data-pt-f]").forEach((b) => { const on = b === f; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); }); return generer(); }
      const b = ch.find((n) => n.dataset?.pt);
      if (!b) return;
      const x = b.dataset.pt;
      if (x === "fermer") return fermer();
      if (x === "importer") { fermer(); return this.importerPartage({ retour: opt.retour }); }
      if (!texte) return erreur(_t("Coche au moins un élément."));
      if (x === "copier") { if (await this._copierZone(ta)) { erreur(""); info.textContent = _t("Copié dans le presse-papiers."); } else erreur(_t("Copie impossible : sélectionne le texte et copie-le, ou « Télécharger »."));  return; }
      if (x === "telecharger") return this._telechargerTexte(texte, format === "code" ? "maquette-partage.txt" : "maquette-partage.yaml", format === "code" ? "text/plain" : "text/yaml");
    });
    generer();
    (D.querySelector("[data-pt-el]") || D.querySelector('[data-pt="fermer"]'))?.focus({ preventScroll: true });
  }

  // ---------- importer un partage ----------
  // opt : texte (déjà collé : lu tout de suite), retour. Étapes dans le même dialogue : coller → vérifier, associer, destination → importer
  importerPartage(opt = {}) {
    const { D, fermer } = this._dialogueModal("ed-partage-d", "ed-pti-titre", opt.retour);
    const etat = { lu: null, choix: {}, dest: "biblio", piece: "", cote: "droite", proposes: new Set() };
    const coller = (txt = "", msg = "") => {
      poserHTML(D, `<div class="ed-dialogue large ed-pt"><header><h2 id="ed-pti-titre">${_t("Importer un partage")}</h2>
          <div class="ed-aide">${_t("Colle un partage (YAML ou code compact MAQ1:) ou ouvre un fichier. Rien ne change avant « Importer ».")}</div></header>
        <div class="ed-cat"><textarea class="ed-code" spellcheck="false" aria-label="${_t("Texte du partage")}" placeholder="maquette_share: 1"></textarea><div class="ed-erreur" ${msg ? "" : "hidden"}>${esc(msg)}</div></div>
        <footer><button class="ed-btn texte" data-pti="ouvrir"><ha-icon icon="mdi:folder-open-outline"></ha-icon>${_t("Ouvrir un fichier…")}</button><span class="ed-espace"></span>
          <button class="ed-btn texte" data-pti="fermer">${_t("Annuler")}</button><button class="ed-btn plein" data-pti="lire">${_t("Continuer")}</button>
          <input type="file" accept=".yaml,.yml,.json,.txt,application/json,text/yaml,text/plain" hidden></footer></div>`);
      const ta = D.querySelector("textarea");
      ta.value = txt;
      D.querySelector("input[type=file]").onchange = async (ev) => { const f = ev.target.files?.[0]; if (f) { if (f.size > MAX_IMPORT) return erreur(_t("Partage trop gros : import refusé.")); ta.value = await f.text(); erreur(""); } };
      ta.focus();
    };
    const erreur = (m) => { const e = D.querySelector(".ed-erreur"); if (e) { e.hidden = !m; e.textContent = m || ""; } };
    const lire = async (txt) => {
      try {
        const r = await lireTextePartage(txt);
        if (r.genre === "plan") { fermer(); return this.exporter({ texte: txt, message: _t("Ce texte est un plan complet : « Importer » ici le remplace (annulable).") }); }
        etat.lu = lirePartage(r.objet, customElements.get("maquette-card"));
        etat.choix = {}; etat.proposes = new Set();
        // proposition visible avant d'importer : un seul candidat → proposé (modifiable)
        for (const [role, s] of Object.entries(etat.lu.emplacements)) { const c = this._candidatsEmpl(s); if (c.length === 1) { etat.choix[role] = c[0].e; etat.proposes.add(role); } }
        verifier();
      } catch (e) { coller(txt, e.message || String(e)); }
    };
    const verifier = () => {
      const { elements, emplacements, ignores, inconnues, retires } = etat.lu, n = (g) => elements.filter((e) => e.genre === g).length;
      const nW = n("widget"), nO = elements.length - nW, cmds = this._commandesPartage(elements, emplacements), roles = Object.keys(emplacements);
      const pieces = this.d.pieces.map((p, i) => [p, i]).filter(([p]) => !p.sous_zone && p.nom);
      const bloc = (ic, titre, nb, corps, cl = "") => `<section class="ed-recap-s${cl}"><h4><ha-icon icon="${ic}"></ha-icon>${esc(titre)}${nb != null ? ` (${nb})` : ""}</h4>${corps}</section>`;
      const resume = [nW ? _t("{n} widget|{n} widgets", { n: nW }) : "", nO ? _t("{n} objet|{n} objets", { n: nO }) : ""].filter(Boolean).join(", ") || _t("Rien d'importable");
      const cmdTxt = cmds.length ? `${_t("{n} commande|{n} commandes", { n: cmds.length })} : ${[...new Set(cmds.map((c) => c.service))].slice(0, 6).join(", ")}` : _t("aucune commande");
      poserHTML(D, `<div class="ed-dialogue large ed-pt ed-recap"><header><h2 id="ed-pti-titre">${_t("Vérifier avant d'importer")}</h2>
          <div class="ed-aide" id="ed-pti-res"><b>${esc(resume)}</b> ; ${esc(cmdTxt)}.</div></header>
        <div class="ed-cat">
          ${cmds.length ? bloc("mdi:remote", _t("Commandes"), cmds.length, `<ul>${cmds.slice(0, 30).map((c) => `<li><span><b>${esc(c.nom)}</b> · ${esc(c.quoi)}</span><small><code>${esc(c.service)}</code> → ${esc(c.cible)}</small>${c.sensible ? `<span class="ed-sensible"><ha-icon icon="mdi:shield-alert-outline"></ha-icon>${_t("Sensible")}</span>` : ""}</li>`).join("")}</ul>
            <p class="ed-aide">${_t("Toutes les commandes importées demandent une confirmation à chaque appui (réglable ensuite).")}</p>`) : ""}
          ${ignores.length ? bloc("mdi:help-circle-outline", _t("Ignoré (inconnu de cette version)"), ignores.length, `<ul>${ignores.slice(0, 30).map((t) => `<li><span>${esc(t)}</span></li>`).join("")}</ul>`) : ""}
          ${inconnues.length || retires.length ? bloc("mdi:delete-sweep-outline", _t("Réglages retirés (inconnus ou invalides)"), inconnues.length + retires.length, `<p><code>${esc([...inconnues, ...retires].slice(0, 20).join(", "))}${inconnues.length + retires.length > 20 ? " …" : ""}</code></p>`) : ""}
          ${roles.length ? bloc("mdi:link-variant", _t("Associer les entités"), roles.length, `${this._htmlGroupes(emplacements)}<div class="ed-pt-asso" role="list">${roles.map((r) => this._ligneAsso(r, emplacements[r], etat.choix[r], etat.proposes.has(r))).join("")}</div>
            <p class="ed-aide">${_t("Sans entité : le champ reste « à compléter ».")}</p>`) : ""}
          ${elements.length ? bloc("mdi:tray-arrow-down", _t("Destination"), null, `<div class="ed-pt-dest" role="radiogroup" aria-label="${_t("Destination")}">
            <label><input type="radio" name="ed-pt-dest" value="biblio" ${etat.dest === "biblio" ? "checked" : ""}><span>${_t("Ajouter à mes modèles")}<small>${_t("Bibliothèque de widgets et Ajouter › Mes modèles ; le plan ne change pas.")}</small></span></label>
            <label><input type="radio" name="ed-pt-dest" value="plan" ${etat.dest === "plan" ? "checked" : ""}><span>${_t("Placer dans le plan")}<small>${nW ? _t("Widgets dans le panneau choisi ; objets : ajoutés à mes modèles, à poser depuis Ajouter.") : _t("Un objet seul se pose d'un clic sur le plan ; plusieurs : ajoutés à mes modèles.")}</small></span></label>
            ${nW ? `<span class="ed-pt-ou" ${etat.dest === "plan" ? "" : "hidden"}><select data-pti-piece aria-label="${_t("Où placer le widget")}"><option value="">${_t("Maison")}</option>${pieces.map(([p, i]) => `<option value="${i}" ${String(i) === etat.piece ? "selected" : ""}>${esc(_t("Pièce « {nom} »", { nom: p.nom }))}</option>`).join("")}</select>
              <select data-pti-cote aria-label="${_t("Panneau")}"><option value="gauche" ${etat.cote === "gauche" ? "selected" : ""}>${_t("Panneau gauche")}</option><option value="droite" ${etat.cote === "droite" ? "selected" : ""}>${_t("Panneau droit")}</option></select></span>` : ""}</div>
            <p class="ed-aide">${_t("Jamais de remplacement du plan : pour remplacer le plan entier, « Exporter / importer le plan ».")}</p>`) : ""}
        </div>
        <footer><button class="ed-btn texte" data-pti="retour"><ha-icon icon="mdi:arrow-left"></ha-icon>${_t("Retour")}</button><span class="ed-espace"></span>
          <button class="ed-btn texte" data-pti="fermer">${_t("Annuler")}</button><button class="ed-btn plein" data-pti="importer" ${elements.length ? "" : "disabled"}><ha-icon icon="mdi:import"></ha-icon>${_t("Importer")}</button></footer></div>`);
      (D.querySelector("[data-pti=importer]:not([disabled])") || D.querySelector("[data-pti=fermer]")).focus({ preventScroll: true });
    };
    D.addEventListener("change", (ev) => {
      const t = ev.target;
      if (t.name === "ed-pt-dest") { etat.dest = t.value; const o = D.querySelector(".ed-pt-ou"); if (o) o.hidden = t.value !== "plan"; }
      else if (t.dataset?.ptiPiece != null) etat.piece = t.value;
      else if (t.dataset?.ptiCote != null) etat.cote = t.value;
      else if (t.dataset?.ptGroupe != null && t.value) { this._remplirParAppareil(t.value, etat); verifier(); }
    });
    D.addEventListener("click", async (ev) => {
      if (ev.target === D) return;
      const ch = ev.composedPath(), b = ch.find((n) => n.dataset?.pti || n.dataset?.ptRole || n.dataset?.ptEffacer);
      if (!b) return;
      if (b.dataset.ptRole) {
        const r = b.dataset.ptRole, s = etat.lu.emplacements[r];
        const e = await this._choisirPourEmpl(s);
        if (e !== undefined) { if (e) etat.choix[r] = e; else delete etat.choix[r]; etat.proposes.delete(r); }
        verifier(); [...D.querySelectorAll("[data-pt-role]")].find((x) => x.dataset.ptRole === r)?.focus({ preventScroll: true });
        return;
      }
      if (b.dataset.ptEffacer) { delete etat.choix[b.dataset.ptEffacer]; etat.proposes.delete(b.dataset.ptEffacer); verifier(); return; }
      const x = b.dataset.pti;
      if (x === "fermer") return fermer();
      if (x === "ouvrir") return D.querySelector("input[type=file]")?.click();
      if (x === "lire") return lire(D.querySelector("textarea").value);
      if (x === "retour") return coller("");
      if (x === "importer") { const fait = this._appliquerPartage(etat); fermer(); fait?.(); }
    });
    if (opt.texte) lire(opt.texte); else coller("");
  }

  // ---------- association des emplacements (import d'un partage et entités introuvables) ----------
  // entités candidates d'un emplacement : domaine, classe d'appareil et unité ; trop strict (aucune) : domaine seul
  _candidatsEmpl(s) {
    const d = s.domaine || null, l = this.entitesCandidates({ d, dc: s.device_class || null, u: s.unite || null });
    return l.length || !d ? l : this.entitesCandidates({ d });
  }
  // undefined : rien de changé (Échap) ; null : sans entité ; sinon l'entité choisie
  async _choisirPourEmpl(s) {
    const l = this._candidatsEmpl(s), titre = s.libelle || s.domaine || _t("Entité");
    if (l.length) return this.choisirParmi({ titre, liste: l.slice(0, 30), domaine: s.domaine || "" });
    // choisirEntite : null = Annuler (rien ne change), "" = Aucune
    const e = await this.choisirEntite({ titre, domaine: DOMAINES.some(([x]) => x === s.domaine) ? s.domaine : "" });
    return e === null ? undefined : e || null;
  }
  _ligneAsso(role, s, e, propose) {
    // même présentation qu'un champ entité du panneau (orange tant qu'il est à compléter)
    const hass = this.hass, st = e && hass.states[e], det = [s.domaine, s.device_class, s.unite].filter(Boolean).join(" · "), nom = st?.attributes.friendly_name || e;
    return `<div class="ed-champ ed-pt-l${e ? "" : " a-completer"}" role="listitem"><label>${esc(s.libelle || role)}${e ? "" : _t(" · à compléter")}</label>
      <div class="ed-aide ed-pt-det">${esc(s.sous || det || role)}</div>
      <div class="ed-pt-ligne"><button type="button" class="ed-entite" data-pt-role="${esc(role)}" aria-label="${esc(`${s.libelle || role} : ${e ? nom : _t("Choisir…")}`)}">${e
        ? `<ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon><span class="n">${esc(nom)}<small>${esc(e)}${propose ? ` · ${_t("proposé")}` : ""}</small></span>` : `<span class="n vide">${_t("Choisir…")}</span>`}</button>
      ${e ? `<button type="button" class="ib" data-pt-effacer="${esc(role)}" title="${_t("Sans entité")}" aria-label="${esc(`${_t("Sans entité")} : ${s.libelle || role}`)}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</div></div>`;
  }
  // appareils de HA qui remplissent au moins deux emplacements (« le véhicule » : batterie, autonomie, puissance)
  _groupesAppareils(emplacements) {
    const parDev = new Map();
    for (const [r, s] of Object.entries(emplacements)) for (const c of this._candidatsEmpl(s)) if (c.dev) { if (!parDev.has(c.dev)) parDev.set(c.dev, new Map()); const m = parDev.get(c.dev); if (!m.has(r)) m.set(r, c.e); }
    return [...parDev].filter(([, m]) => m.size >= 2).sort((a, b) => b[1].size - a[1].size).slice(0, 20)
      .map(([dev, m]) => ({ dev, roles: m, nom: this.hass.devices?.[dev]?.name_by_user || this.hass.devices?.[dev]?.name || dev }));
  }
  _htmlGroupes(emplacements) {
    const g = this._groupesAppareils(emplacements);
    if (!g.length) return "";
    return `<div class="ed-champ ed-pt-groupe"><label for="ed-pt-gr">${_t("Remplir d'après un appareil")}</label><select id="ed-pt-gr" data-pt-groupe><option value="">${_t("Choisir un appareil…")}</option>${g.map((x) => `<option value="${esc(x.dev)}">${esc(_t("{nom} ({n} champs)", { nom: x.nom, n: x.roles.size }))}</option>`).join("")}</select></div>`;
  }
  // proposition d'un appareil : affichée dans la liste (modifiable) avant « Importer », jamais appliquée en silence
  _remplirParAppareil(dev, etat) {
    const g = this._groupesAppareils(etat.lu.emplacements).find((x) => x.dev === dev);
    if (!g) return;
    for (const [r, e] of g.roles) { etat.choix[r] = e; etat.proposes.add(r); }
  }
  // commandes d'un partage lu : [{ nom, quoi, service, cible, sensible }]
  _commandesPartage(elements, emplacements) {
    const out = [];
    const cible = (e) => (typeof e === "string" && e.startsWith(`${PARTAGE_SLOT}.`) ? (() => { const s = emplacements[e.slice(PARTAGE_SLOT.length + 1)]; return `${s?.libelle || "?"} (${s?.domaine || "?"})`; })() : e || "?");
    const domDe = (e) => (typeof e === "string" && e.startsWith(`${PARTAGE_SLOT}.`) ? emplacements[e.slice(PARTAGE_SLOT.length + 1)]?.domaine || "" : String(e || "").split(".")[0]);
    const SENS = ["lock", "alarm_control_panel", "script", "automation", "button", "input_button", "shell_command", "homeassistant", "hassio", "update", "notify", "valve"];
    // sensible : accès (serrure, alarme, garage, portail, porte ; volet sans classe d'appareil connue), scripts et actions système
    const sens = (dom, dc) => SENS.includes(dom) || (dom === "cover" && (!dc || ["garage", "gate", "door"].includes(dc)));
    const widget = (w, nom) => {
      if (!w || typeof w !== "object") return;
      const q = typeWidgetEn(w.type), dc = (e) => emplacements[String(e).slice(PARTAGE_SLOT.length + 1)]?.device_class;
      if (w.type === "serrure" && w.entite) out.push({ nom, quoi: q, service: "lock.unlock, lock.lock", cible: cible(w.entite), sensible: true });
      else if (w.type === "commande" && w.entite) { const d = domDe(w.entite); out.push({ nom, quoi: q, service: d === "valve" ? "valve.open_valve" : "cover.open_cover", cible: cible(w.entite), sensible: sens(d, dc(w.entite)) }); }
      else if (w.type === "thermostat" && w.entite) out.push({ nom, quoi: q, service: "climate.set_temperature", cible: cible(w.entite), sensible: false });
      for (const x of [...(Array.isArray(w.lignes) ? w.lignes : []), ...(Array.isArray(w.entites) ? w.entites : [])]) {
        const e = typeof x === "string" ? x : x?.entite, d = domDe(e);
        if (/^(script|scene|button|input_button)$/.test(d)) out.push({ nom, quoi: q, service: d === "button" || d === "input_button" ? `${d}.press` : `${d}.turn_on`, cible: cible(e), sensible: d !== "scene" });
        else if (/^(light|switch|input_boolean|fan)$/.test(d)) out.push({ nom, quoi: q, service: `${d}.toggle`, cible: cible(e), sensible: false });
      }
    };
    for (const el of elements) {
      if (el.genre === "widget") widget(el.objet, el.nom);
      for (const w of el.objet?.fiche?.widgets || []) widget(w, el.nom);
      const e = el.objet?.entite, d = domDe(e);
      if (el.genre !== "widget" && e && /^(light|switch|input_boolean|fan|cover|lock|valve)$/.test(d) && el.objet.clic !== "aucun" && el.objet.clic !== "infos")
        out.push({ nom: el.nom, quoi: el.genre === "point" ? _t("Pastille") : el.genre === "meuble" ? _t("Meuble") : _t("Ouverture"), service: `${d}.toggle`, cible: cible(e), sensible: sens(d, null) });
    }
    return out;
  }
  // import : modèles ajoutés (ids neufs, champs sans entité « à demander ») ou widgets placés ; un seul pas d'annulation.
  // Rend la suite à lancer une fois le dialogue fermé (placement d'un objet seul).
  _appliquerPartage(etat) {
    const { elements } = etat.lu, res = elements.map((el) => ({ el, ...associerElement(el, etat.choix) }));
    const DEM = { ouverture: ["contact", "volet", "entite"], meuble: ["entite", "valeur", "actif"] };
    const modele = ({ el, objet, manquants }) => {
      const m = { nom: el.nom, genre: el.genre };
      for (const k of ["icone", "desc", "type", "domaine", "cat", "mots"]) if (el[k] != null) m[k] = el[k];
      if (el.genre === "widget") m.id = idModele();
      m.objet = objet;
      const dem = new Set(Array.isArray(el.demander) ? el.demander.filter((c) => typeof c === "string") : []);
      for (const c of manquants) if (el.genre === "widget" || DEM[el.genre]?.includes(c)) dem.add(c);
      if (dem.size && el.genre !== "point") m.demander = [...dem];
      return m;
    };
    const widgets = res.filter((x) => x.el.genre === "widget"), objets = res.filter((x) => x.el.genre !== "widget");
    if (etat.dest === "plan" && !widgets.length && objets.length === 1) {
      const m = modele(objets[0]);
      return () => { this.utiliserModele(m, null); };
    }
    const piece = etat.piece === "" ? null : +etat.piece, cote = etat.cote === "gauche" ? "gauche" : "droite";
    let dernier = null;
    this.commit(() => {
      const enBiblio = etat.dest === "plan" ? objets : res;
      if (enBiblio.length) (this.d.modeles ||= []).push(...enBiblio.map(modele));
      if (etat.dest === "plan" && widgets.length) {
        const l = this._wl({ cote, piece: Number.isInteger(piece) && this.d.pieces[piece] ? piece : null }, true), i0 = l.length;
        l.push(...widgets.map((x) => x.objet));
        dernier = { type: "widget", cote, i: i0 + widgets.length - 1, ...(Number.isInteger(piece) && this.d.pieces[piece] ? { piece } : {}) };
        this.sel = dernier; this.multi = new Set([cle(dernier)]);
      }
    });
    const nW = widgets.length, nO = objets.length;
    return () => {
      if (dernier) {
        const mq = widgets[widgets.length - 1].manquants;
        if (mq.size) { this._aFaire = { cle: cle(dernier), champs: mq }; this.editerSelection(); }
        this.snack(nO ? _t("{n} widget placé, objets ajoutés à mes modèles (Ajouter › Mes modèles).|{n} widgets placés, objets ajoutés à mes modèles (Ajouter › Mes modèles).", { n: nW }) : _t("{n} widget placé.|{n} widgets placés.", { n: nW }), _t("Annuler"), this._annulation(), 10000);
      } else this.snack(_t("{n} modèle ajouté (bibliothèque, Ajouter › Mes modèles).|{n} modèles ajoutés (bibliothèque, Ajouter › Mes modèles).", { n: res.length }), _t("Annuler"), this._annulation(), 10000);
    };
  }
} // @assemblage
