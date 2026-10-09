// export, lecture d'un plan importé, récapitulatif de sécurité — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- export / import ----------
  exporter() {
    let format = this._format || "yaml";
    const nomFichier = () => `plan-${(this.d.id || "maison").replace(/[^\w-]+/g, "-")}.${format === "json" ? "json" : "yaml"}`;
    const texte = () => { const o = versAnglais(this.d); return format === "json" ? JSON.stringify(o, null, 2) : versYaml(o) + "\n"; };
    const { voile, fermer } = this._voile("", `<div class="ed-dialogue large" role="dialog" aria-modal="true"><header><h2>${_t("Exporter / importer le plan")}</h2>
        <div class="ed-aide">${tactile() ? _t("Le plan complet. « Importer » remplace le plan en cours (annulable).") : _t("Le plan complet. « Importer » remplace le plan en cours (Ctrl+Z pour annuler).")}</div>
        <span class="ed-seg petit" style="margin-top:12px">${["yaml", "json"].map((f) => `<button data-f="${f}" class="${f === format ? "on" : ""}">${f.toUpperCase()}</button>`).join("")}</span></header>
      <div class="ed-cat">${(() => { const vs = this._versions(); if (!vs.length) return "";
          const res = (c) => { const n = resumeVersion(c); return _t("{p} pièces, {a} appareils, {w} widgets", { p: n.pieces, a: n.appareils, w: n.widgets }); };
          return `<details class="ed-avance ed-versions-bloc"><summary>${_t("Versions précédentes ({n}) : reprendre un plan enregistré avant", { n: vs.length })}</summary><div class="ed-versions">${vs.map((v, j) => `<button data-v="${j}"><span>${_t("Remplacée le {date}", { date: new Date(v.t).toLocaleString(_loc(), { dateStyle: "short", timeStyle: "medium" }) })}<small> · ${res(v.config)}</small></span><span>${_t("Charger")}</span></button>`).join("")}</div></details>`; })()}
        <textarea class="ed-code" spellcheck="false" aria-label="${_t("Plan au format texte")}"></textarea><div class="ed-erreur" hidden></div></div>
      <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-x="copier"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copier")}</button>
        <button class="ed-btn texte" data-x="telecharger"><ha-icon icon="mdi:download"></ha-icon>${_t("Télécharger")}</button>
        <button class="ed-btn texte" data-x="ouvrir"><ha-icon icon="mdi:folder-open-outline"></ha-icon>${_t("Ouvrir un fichier…")}</button>
        <span style="flex:1"></span><button class="ed-btn texte" data-x="fermer">${_t("Fermer")}</button><button class="ed-btn plein" data-x="importer"><ha-icon icon="mdi:import"></ha-icon>${_t("Importer")}</button>
        <input type="file" accept=".yaml,.yml,.json,application/json,text/yaml" hidden></footer></div>`, { echap: () => fermer() });
    const ta = voile.querySelector("textarea"), err = voile.querySelector(".ed-erreur"), fichier = voile.querySelector("input[type=file]");
    const erreur = (m) => { err.hidden = !m; err.textContent = m || ""; };
    ta.value = texte();
    fichier.onchange = async () => {
      const f = fichier.files?.[0];
      if (!f) return;
      ta.value = await f.text();
      format = /\.json$/i.test(f.name) || /^\s*[{[]/.test(ta.value) ? "json" : "yaml";
      voile.querySelectorAll("[data-f]").forEach((b) => b.classList.toggle("on", b.dataset.f === format));
      erreur("");
    };
    voile.onclick = (ev) => {
      if (ev.target === voile) return fermer();
      const b = ev.composedPath().find((n) => n.dataset?.f || n.dataset?.x || n.dataset?.v);
      if (!b) return;
      if (b.dataset.v) {
        const v = this._versions()[+b.dataset.v];
        ta.value = format === "json" ? JSON.stringify(v.config, null, 2) : versYaml(v.config) + "\n";
        ta.scrollTop = 0; erreur("");
        return this.snack(_t("Version chargée dans la zone de texte : « Importer » pour la reprendre."));
      }
      if (b.dataset.f) {
        format = this._format = b.dataset.f;
        voile.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === b));
        ta.value = texte(); erreur("");
        return;
      }
      const x = b.dataset.x;
      if (x === "fermer") return fermer();
      if (x === "ouvrir") return fichier.click();
      if (x === "copier") {
        const ok = () => this.snack(_t("Plan copié dans le presse-papiers."));
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(ta.value).then(ok, () => erreur(_t("Copie refusée par le navigateur : sélectionne le texte et copie-le.")));
        ta.select();
        return document.execCommand("copy") ? ok() : erreur(_t("Copie impossible : sélectionne le texte et copie-le."));
      }
      if (x === "telecharger") {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ta.value], { type: format === "json" ? "application/json" : "text/yaml" }));
        a.download = nomFichier();
        this.R.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        return;
      }
      if (x === "importer") {
        let o;
        const rap = {};
        try { o = this._lirePlan(ta.value, rap); } catch (e) { return erreur(e.message || String(e)); }
        // type, id et clés du tableau de bord (placement, visibilité, card_mod) : ceux de cette carte, jamais ceux du fichier
        const ignorees = CLES_HA.filter((k) => Object.hasOwn(o, k) && canon({ v: o[k] }) !== canon({ v: this.d[k] }));
        for (const k of CLES_HA) { delete o[k]; if (Object.hasOwn(this.d, k)) o[k] = this.d[k]; }
        o = { ...o, type: this.d.type || "custom:maquette-card", ...(this.d.id != null ? { id: this.d.id } : {}) };
        const appliquer = () => {
          fermer();
          this.commit(() => { this._applique(JSON.stringify(o)); this.sel = null; this.multi.clear(); });
          this.recadrer();
          this.snack(_t("Plan importé : « Enregistrer » pour le garder, Ctrl+Z pour revenir."), _t("Annuler"), this._annulation(), 10000);
        };
        // même plan que celui en cours (aller-retour, comparé replié) : rien à vérifier ; sinon le récapitulatif d'abord
        if (canon(o) === canon(this._replie())) return appliquer();
        return this._recapImport(o, { ...rap, ignorees }).then((oui) => { if (oui) appliquer(); });
      }
    };
    ta.focus(); ta.setSelectionRange(0, 0); ta.scrollTop = 0;
  }

  _lirePlan(txt, rap = {}) {
    if (!txt.trim()) throw new Error(_t("Rien à importer : colle un plan ou ouvre un fichier."));
    if (txt.length > MAX_IMPORT) throw new Error(_t("Plan trop gros : {n} Mo, au plus {max} Mo.", { n: fmt(txt.length / 1e6, 1), max: fmt(MAX_IMPORT / 1e6, 0) }));
    let o;
    try { o = /^\s*[{[]/.test(txt) ? JSON.parse(txt) : jsyaml.load(txt, { schema: jsyaml.CORE_SCHEMA }); } catch (e) { throw new Error(_t("Lecture impossible : {err}", { err: (e.message || e).toString().split("\n")[0] })); }
    verifierTaille(o);
    if (Array.isArray(o) && o.length === 1) o = o[0];
    if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error(_t("Le plan doit être un objet (clés rooms, walls, openings…)."));
    if (o.type && !TYPES_CARTE.includes(o.type)) throw new Error(_t("Ce n'est pas un plan : type « {type} ».", { type: o.type }));
    const fr = CLES_FR.filter((k) => Object.hasOwn(o, k));
    if (fr.length) throw new Error(_t("Ancien format français (clés {cles}) : ce plan n'est plus lu tel quel. Convertis-le aux clés anglaises (rooms, walls, openings…), voir https://github.com/TooMuhtsh/maquette-card/blob/main/CHANGELOG.md#former-french-keys, puis importe-le.", { cles: `${fr.slice(0, 4).join(", ")}${fr.length > 4 ? "…" : ""}` }));
    for (const k of ["rooms", "walls", "fences", "openings", "badges", "texts", "templates"]) if (o[k] != null && !Array.isArray(o[k])) throw new Error(_t("« {k} » doit être une liste.", { k }));
    if (o.summary != null && typeof o.summary !== "boolean" && !Array.isArray(o.summary)) throw new Error(_t("« summary » doit être une liste de puces (ou true / false)."));
    if (o.panels != null && (typeof o.panels !== "object" || Array.isArray(o.panels))) throw new Error(_t("« panels » doit contenir left / right."));
    // plan à étages : mêmes contrôles, étage par étage (sa géométrie est dans `floors`, rien à la racine)
    const niveaux = Array.isArray(o.floors) && o.floors.length ? o.floors.filter((f) => f && typeof f === "object" && !Array.isArray(f)) : [o];
    for (const f of niveaux) {
      if (f !== o) for (const k of ["rooms", "walls", "fences", "openings", "badges", "texts"]) if (f[k] != null && !Array.isArray(f[k])) throw new Error(_t("« {k} » doit être une liste.", { k }));
      for (const [j, p] of (f.rooms || []).entries()) if (!Array.isArray(p?.poly) || p.poly.length < 3) throw new Error(_t("Pièce {n} ({nom}) : « poly » doit avoir au moins 3 sommets.", { n: j + 1, nom: p?.name || _t("sans nom") }));
    }
    o = depuisAnglais(niveaux[0] === o ? { rooms: [], ...o } : o);
    // même lecture que la carte (booléens en texte, meubles, éléments sans coordonnées ignorés, valeurs invalides retirées)
    return customElements.get("maquette-card").normaliser(o, rap);
  }

  // ---------- récapitulatif de sécurité d'un import ----------
  // ce que le plan importé peut commander (boutons des pièces et leur service, widgets qui commandent, lignes « Activer »),
  // ses liens « Plus d'infos », ce qui a été retiré car invalide et les clés du tableau de bord ignorées ; true = importer
  _analyseImport(c) {
    const K = customElements.get("maquette-card"), hass = this.hass, services = [], commandes = new Map(), liens = new Set(), M = maisonEntiere(K.ETAGES, c);
    for (const p of M.pieces) for (const a of Array.isArray(p?.actions) ? p.actions : []) {
      if (!a || typeof a.action !== "string" || !a.action.includes(".")) continue;
      const [dom, svc] = a.action.split("."), piece = a.cible === "piece", ents = piece ? null : typeof a.cible === "string" && a.cible ? [a.cible] : [];
      services.push({ nom: a.nom || "", piece: p.nom || "", service: a.action, cible: piece ? _t("toute la pièce") : a.cible || "", sensible: K.serviceSensible(hass, dom, svc, ents), confirme: a.confirmer === true });
    }
    const voir = (l) => (Array.isArray(l) ? l : []).forEach((w) => {
      if (!w || typeof w !== "object") return;
      if (["commande", "serrure", "thermostat"].includes(w.type) && typeof w.entite === "string" && w.entite) commandes.set(w.entite, typeWidgetEn(w.type));
      for (const x of [...(Array.isArray(w.lignes) ? w.lignes : []), ...(Array.isArray(w.entites) ? w.entites : [])]) {
        const e = typeof x === "string" ? x : x?.entite;
        if (typeof e === "string" && /^(script|scene|button|input_button)\./.test(e) && !commandes.has(e)) commandes.set(e, _t("Activer##lancer"));
      }
    });
    for (const x of [c, ...M.panneaux, ...M.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of ["meubles", "ouvertures", "points"]) for (const o of M[k]) {
      voir(o?.fiche?.widgets);
      const pi = o?.fiche?.plus_infos;
      if (typeof pi === "string" && /^(\/|https?:)/i.test(pi)) liens.add(pi);
    }
    for (const m of c.modeles || []) { if (m?.genre === "widget") voir([m.objet]); voir(m?.objets); voir(m?.objet?.fiche?.widgets); }
    return { services, commandes: [...commandes], liens: [...liens] };
  }
  _recapImport(c, rap) {
    const { services, commandes, liens } = this._analyseImport(c), retires = rap.retires || [], ignorees = rap.ignorees || [], M = maisonEntiere(customElements.get("maquette-card").ETAGES, c);
    const nW = [c, ...M.panneaux, ...M.pieces].reduce((n, x) => n + (x?.panneaux?.gauche?.length || 0) + (x?.panneaux?.droite?.length || 0), 0);
    const plafond = (l, f) => `${l.slice(0, 30).map(f).join("")}${l.length > 30 ? `<li><small>${_t("… et {n} autres", { n: l.length - 30 })}</small></li>` : ""}`;
    const bloc = (ic, titre, n, corps) => `<section class="ed-recap-s"><h4><ha-icon icon="${ic}"></ha-icon>${esc(titre)} (${n})</h4>${corps}</section>`;
    const rien = !services.length && !commandes.length && !liens.length && !retires.length && !rap.ignores && !ignorees.length;
    return new Promise((fin) => {
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue large ed-recap" role="alertdialog" aria-modal="true" aria-labelledby="ed-recap-t" aria-describedby="ed-recap-d">
        <header><h2 id="ed-recap-t">${_t("Vérifier avant d'importer")}</h2>
          <div class="ed-aide" id="ed-recap-d">${esc(_t("Pièces {p} · Ouvertures {o} · Appareils {a} · Meubles {m} · Widgets {w} · Modèles {t}", { p: M.pieces.length, o: M.ouvertures.length, a: M.points.length, m: M.meubles.length, w: nW, t: (c.modeles || []).length }))}</div></header>
        <div class="ed-cat">
          ${services.length ? bloc("mdi:gesture-tap-button", _t("Boutons des pièces : services appelés"), services.length, `<ul>${plafond(services, (x) => `<li><span><b>${esc(x.nom || _t("sans nom"))}</b>${x.piece ? ` · ${esc(x.piece)}` : ""}</span>
            <small><code>${esc(x.service)}</code>${x.cible ? ` → ${esc(x.cible)}` : ""}</small>${x.sensible || x.confirme ? `<span class="ed-sensible"><ha-icon icon="mdi:shield-alert-outline"></ha-icon>${_t("Confirmation à chaque appui")}</span>` : ""}</li>`)}</ul>`) : ""}
          ${commandes.length ? bloc("mdi:remote", _t("Entités commandées par les widgets"), commandes.length, `<ul>${plafond(commandes, ([e, t]) => `<li><span><b>${esc(this.carte._nom(e))}</b></span><small>${esc(e)} · ${esc(t)}</small></li>`)}</ul>`) : ""}
          ${liens.length ? bloc("mdi:open-in-new", _t("Liens « Plus d'infos »"), liens.length, `<ul>${plafond(liens, (u) => `<li><code>${esc(u)}</code></li>`)}</ul>`) : ""}
          ${retires.length || rap.ignores ? bloc("mdi:delete-sweep-outline", _t("Retiré car invalide"), retires.length + (rap.ignores || 0), `${rap.ignores ? `<p>${_t("{n} élément sans coordonnées valides|{n} éléments sans coordonnées valides", { n: rap.ignores })}</p>` : ""}<ul>${plafond(retires, (r) => `<li><code>${esc(r)}</code></li>`)}</ul>`) : ""}
          ${ignorees.length ? bloc("mdi:view-dashboard-outline", _t("Clés du tableau de bord ignorées"), ignorees.length, `<p>${esc(ignorees.join(", "))} : ${_t("celles de cette carte sont gardées.")}</p>`) : ""}
          ${rien ? `<p class="ed-aide">${_t("Aucun service, aucune commande, aucun lien, rien de retiré.")}</p>` : `<p class="ed-aide">${_t("Les actions sensibles (déverrouiller, ouvrir un garage, désarmer, lancer un script…) demandent toujours une confirmation.")}</p>`}
        </div>
        <footer><button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button><button class="ed-btn plein" data-r="importer"><ha-icon icon="mdi:import"></ha-icon>${_t("Importer")}</button></footer></div>`, { echap: () => finir(false), pieger: true });
      const finir = (r) => { retirer(); fin(r); };
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) finir(b?.dataset.r === "importer"); };
      voile.querySelector('[data-r="annuler"]').focus();
    });
  }

} // @assemblage
