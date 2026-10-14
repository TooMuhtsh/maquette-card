// bibliothèque de widgets (atelier) : modèles `modeles` de genre widget, aperçu PC / téléphone, formulaire du widget, placement, copies liées — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- bibliothèque unique = `modeles` ----------
  // Un modèle de widget : { id, nom, genre: "widget", icone?, desc?, objet: <widget>, demander?: [chemins] }. `id` court, attribué à la
  // première écriture qui en a besoin (placement d'une copie), dans le même pas d'annulation. Une copie placée depuis un modèle porte
  // `origine: <id>` (anglais : `template`) : « Détacher » le retire, « Mettre à jour depuis le modèle » applique le modèle en gardant
  // les entités « à demander » propres à la copie. Point d'accroche du partage (lot suivant) : _modelesWidgets() et _copiesModele().
  _modelesWidgets() {
    return (this.d.modeles || []).map((m, u) => [m, u]).filter(([m]) => m && m.genre === "widget" && m.objet && typeof m.objet === "object" && !Array.isArray(m.objet));
  }
  // copies d'un modèle (widgets qui portent `origine: id`) dans tout le plan : panneaux de la maison et des pièces, fiches, autres étages
  _copiesModele(id) {
    const l = [], vus = new Set();
    if (!id) return l;
    const voir = (x) => {
      if (!x || typeof x !== "object" || vus.has(x)) return;
      vus.add(x);
      if (Array.isArray(x)) { for (const y of x) { if (y && typeof y === "object" && !Array.isArray(y) && typeof y.type === "string" && y.origine === id) l.push(y); voir(y); } return; }
      for (const [k, v] of Object.entries(x)) if (k !== "modeles") voir(v);
    };
    voir(this.d);
    return l;
  }
  _modeleDe(id) { return id ? (this.d.modeles || []).find((m) => m?.genre === "widget" && m.id === id && m.objet) || null : null; }
  // valeur d'un chemin « a.0.b » (tableaux compris)
  _lireChemin(o, c) { return String(c).split(".").reduce((x, p) => (x == null || typeof x !== "object" ? undefined : x[/^\d+$/.test(p) ? +p : p]), o); }
  // copie mise à jour depuis son modèle : champs du modèle (entités fixes comprises), entités « à demander » de la copie gardées
  _majDepuisModele(w, m) {
    const dem = Array.isArray(m.demander) ? m.demander.filter((c) => typeof c === "string") : [];
    const garde = dem.map((c) => [c, clone(this._lireChemin(w, c) ?? null)]);
    for (const k of Object.keys(w)) delete w[k];
    Object.assign(w, clone(m.objet));
    delete w.origine;
    for (const [c, v] of garde) poserChemin(w, c, v ?? (c === "entites" || c === "lignes" ? [] : ""));
    w.origine = m.id;
  }
  // chemins entité proposés « à demander » : ceux remplis, ceux déjà demandés
  _cheminsDemandables(m) {
    return [...new Set([...this._cheminsEntites(m.objet), ...(Array.isArray(m.demander) ? m.demander.filter((c) => typeof c === "string") : [])])];
  }
  // hôte des dialogues et des messages : le dernier <dialog> modal ouvert (bibliothèque, partage : couche supérieure), sinon la carte
  _hote() { const l = this.R.querySelectorAll("dialog.ed-voile[open]"); return l[l.length - 1] || this.R.querySelector("ha-card"); }

  // ---------- atelier : <dialog> modal (couche supérieure, Échap, focus piégé, retour du focus) ----------
  // opt : u (rang du modèle dans `modeles`), retour (élément qui reprend le focus)
  ouvrirBibliotheque(opt = {}) {
    if (this._biblio) return;
    if (this.vueEdition) this.fermerEdition();
    const l = this._modelesWidgets(), u = opt.u != null && l.some(([, x]) => x === opt.u) ? opt.u : l[0]?.[1] ?? null;
    const D = document.createElement("dialog");
    D.className = "ed-voile ed-plein-tel ed-biblio";
    D.setAttribute("aria-labelledby", "ed-bib-titre");
    poserHTML(D, `<div class="ed-dialogue ed-bib"></div>`);
    this._biblio = { u, vue: "pc", liste: u == null || (this._etroit() && opt.u == null), q: "", dest: "", D, sel: this.sel, multi: new Set(this.multi), retour: opt.retour || this.R.activeElement };
    this.sel = u == null ? null : { type: "widget", cote: "modele", i: 0 };
    this.multi = new Set(this.sel ? [cle(this.sel)] : []);
    D.addEventListener("cancel", (ev) => ev.preventDefault()); // Échap : géré ci-dessous (dialogue imbriqué d'abord)
    // clavier en capture sur la fenêtre (le focus peut être sur la page après un dialogue imbriqué), retiré à la fermeture
    this._biblio.touche = (ev) => this._toucheBiblio(ev);
    window.addEventListener("keydown", this._biblio.touche, true);
    D.addEventListener("click", (ev) => this._clicBiblio(ev));
    D.addEventListener("change", (ev) => this._changeBiblio(ev));
    D.addEventListener("input", (ev) => { if (ev.target?.dataset?.bibQ != null) { this._biblio.q = ev.target.value; this._filtrerBiblio(); } });
    this.R.querySelector("ha-card").append(D);
    D.showModal();
    this._rendreBiblio();
    (D.querySelector(".ed-bib-modeles [aria-selected=true]") || D.querySelector("[data-bib-q]"))?.focus({ preventScroll: true });
  }
  fermerBibliotheque(focus = true) {
    const B = this._biblio;
    if (!B) return;
    const a = this.R.activeElement;
    if (a instanceof HTMLInputElement && a.type !== "checkbox" && B.D.contains(a)) a.blur(); // « change » d'abord : la saisie en cours est gardée
    this._biblio = null;
    window.removeEventListener("keydown", B.touche, true);
    B.D.close(); B.D.remove();
    this.sel = B.sel; this.multi = B.multi;
    this._valide();
    this.multi = new Set([...this.multi].filter((k) => this._elt(k)));
    this.carte._construire(); this._barre(); this._panneau();
    if (focus && B.retour?.isConnected) B.retour.focus({ preventScroll: true });
  }
  // appelé par _panneau() après chaque modification (annuler, rétablir compris)
  _panneauBiblio() { if (this._biblio) this._rendreBiblio(); }
  _modeleBiblio() {
    const B = this._biblio, m = B && B.u != null ? this.d.modeles?.[B.u] : null;
    return m && m.genre === "widget" && m.objet && typeof m.objet === "object" ? m : null;
  }
  _choisirModeleBiblio(u) {
    const B = this._biblio;
    B.u = u; B.liste = false;
    this.sel = u == null ? null : { type: "widget", cote: "modele", i: 0 };
    this.multi = new Set(this.sel ? [cle(this.sel)] : []);
    this._rendreBiblio();
  }
  _rendreBiblio() {
    const B = this._biblio;
    if (!B) return;
    this.R.querySelector(".ed-bf")?.setAttribute("hidden", ""); // barre flottante : derrière le dialogue, inutile
    let m = this._modeleBiblio();
    if (!m && B.u != null) { B.u = null; this.sel = null; this.multi.clear(); }
    const boite = B.D.querySelector(".ed-bib"), etroit = this._etroit(), liste = this._modelesWidgets();
    // focus et défilement gardés d'un rendu à l'autre
    const f = this.R.activeElement, dans = boite.contains(f), ds = dans ? f.dataset || {} : {};
    const garde = !dans ? null : ["k", "entite", "act", "bib", "bibU", "bibDem", "bibNom", "bibQ", "bibDest", "bibVue"].map((k) => ds[k] != null && `[data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${ds[k]}"]`).find(Boolean);
    const defile = [...boite.querySelectorAll(".ed-bib-liste .ed-liste, .ed-bib-form")].map((x) => x.scrollTop);
    const NOMS = Object.fromEntries(TYPES_ATELIER().map((t) => [t.id, t.nom]));
    const nomType = (t) => NOMS[t] || _t("Type inconnu : {type}", { type: t || "?" });
    const vueListe = etroit && (B.liste || !m);
    const ligne = ([x, u]) => { const n = this._copiesModele(x.id).length;
      return `<button type="button" role="option" data-bib-u="${u}" aria-selected="${u === B.u}" data-txt="${esc(sansAccent(`${x.nom || ""} ${nomType(x.objet.type)} ${x.desc || ""}`))}"><ha-icon icon="${esc(x.icone || x.objet.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(x.nom || _t("Widget"))}<small>${esc(nomType(x.objet.type))}${n ? ` · ${esc(_t("{n} copie|{n} copies", { n }))}` : ""}</small></span></button>`; };
    let h = `<header class="ed-bib-tete">${etroit && !vueListe ? `<button class="ib" data-bib="liste" title="${_t("Liste des modèles")}" aria-label="${_t("Liste des modèles")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>` : `<ha-icon icon="mdi:bookshelf"></ha-icon>`}
      <div><h2 id="ed-bib-titre">${_t("Bibliothèque de widgets")}</h2><div class="ed-aide">${esc(_t("{n} modèle|{n} modèles", { n: liste.length }))} · ${_t("à placer dans les panneaux de la maison ou d'une pièce")}</div></div>
      <button class="ib" data-bib="fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-bib-corps${etroit ? (vueListe ? " seul-liste" : " seul-detail") : ""}">
      <div class="ed-bib-liste"><div class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="search" data-bib-q value="${esc(B.q)}" placeholder="${_t("Rechercher…")}" aria-label="${_t("Rechercher un modèle")}"></div>
        <button type="button" class="ed-btn tonal" data-bib="nouveau"><ha-icon icon="mdi:plus"></ha-icon>${_t("Nouveau modèle")}</button>
        <div class="ed-liste ed-bib-modeles" role="listbox" aria-label="${_t("Modèles de widgets")}">${liste.map(ligne).join("")}</div>
        <div class="ed-aide ed-bib-rien" ${liste.length ? "hidden" : ""}>${liste.length ? _t("Rien ne correspond à cette recherche.") : _t("Aucun modèle de widget : « Nouveau modèle », ou « Modèle » dans la fenêtre d'un widget.")}</div></div>`;
    if (m) {
      const n = this._copiesModele(m.id).length, E = this._ongletsWidget(m.objet, { atelier: true });
      const pieces = this.d.pieces.map((p, i) => [p, i]).filter(([p]) => !p.sous_zone && p.nom);
      h += `<section class="ed-bib-apercu" aria-label="${_t("Aperçu")}"><div class="ed-bib-ap-tete"><h4>${_t("Aperçu")}</h4>
          <span class="ed-seg petit" role="radiogroup" aria-label="${_t("Gabarit de l'aperçu")}">${[["pc", _t("Panneau PC")], ["tel", _t("Téléphone")]].map(([v, t]) => `<button type="button" role="radio" data-bib-vue="${v}" aria-checked="${B.vue === v}" class="${B.vue === v ? "on" : ""}">${t}</button>`).join("")}</span></div>
          <div class="ed-bib-cadre ${B.vue === "tel" ? "tel" : "pc"}"><div class="ed-ap-w">${this._apercuBiblio(m.objet)}</div></div>
          <div class="ed-aide">${_t("Rendu réel, avec les valeurs de la maison.")}</div></section>
        <section class="ed-bib-form ed-medit" aria-label="${_t("Réglages du modèle")}">
          <div class="ed-champ"><label>${_t("Nom du modèle")}</label><input type="text" data-bib-nom="1" value="${esc(m.nom || "")}"></div>
          <div class="ed-bib-badge"><ha-icon icon="mdi:link-variant"></ha-icon>${n ? esc(_t("{n} copie dans le plan|{n} copies dans le plan", { n })) : _t("Aucune copie dans le plan")}</div>
          <h4>${esc(E.titre)}</h4><div class="ed-bib-champs">${E.onglets[0][3]}</div></section></div>
        <footer class="ed-bib-pied"><span class="ed-bib-gestion">${ibAct("bib:dupliquer", "mdi:content-copy", _t("Dupliquer le modèle"))}${ibAct("bib:partager", "mdi:share-variant-outline", _t("Partager (un ou plusieurs modèles)"))}${`<button class="ib danger" data-bib="supprimer" title="${_t("Supprimer le modèle")}" aria-label="${_t("Supprimer le modèle")}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>`}
          <button type="button" class="ed-btn texte" data-bib="maj" ${n ? "" : "disabled"}><ha-icon icon="mdi:sync"></ha-icon>${esc(_t("Mettre à jour {n} copie|Mettre à jour les {n} copies", { n }))}</button></span>
          <span class="ed-esp"></span>
          <span class="ed-bib-placer"><select data-bib-dest="1" aria-label="${_t("Où placer le widget")}"><option value="">${_t("Maison")}</option>${pieces.map(([p, i]) => `<option value="${i}" ${String(i) === B.dest ? "selected" : ""}>${esc(_t("Pièce « {nom} »", { nom: p.nom }))}</option>`).join("")}</select>
          <button type="button" class="ed-btn contour" data-bib="placer:gauche"><ha-icon icon="mdi:arrow-left"></ha-icon>${_t("Placer à gauche")}</button>
          <button type="button" class="ed-btn plein" data-bib="placer:droite">${_t("Placer à droite")}<ha-icon icon="mdi:arrow-right"></ha-icon></button></span></footer>`;
    } else h += `<div class="ed-bib-vide ed-aide">${liste.length ? _t("Choisis un modèle dans la liste.") : ""}</div></div><footer class="ed-bib-pied"><span class="ed-esp"></span><button type="button" class="ed-btn texte" data-bib="fermer">${_t("Fermer")}</button></footer>`;
    poserHTML(boite, h);
    boite.querySelector(".ed-bib-apercu .ed-ap-w")?.setAttribute("inert", "");
    const form = boite.querySelector(".ed-bib-form");
    if (form && m) { this._cablerPanneau(form); this._interrupteursDemander(form, m); }
    this._filtrerBiblio();
    [...boite.querySelectorAll(".ed-bib-liste .ed-liste, .ed-bib-form")].forEach((x, j) => { x.scrollTop = defile[j] || 0; });
    if (garde) { try { boite.querySelector(garde)?.focus({ preventScroll: true }); } catch (e) { /* sélecteur invalide : focus laissé */ } }
    // focus perdu (élément redessiné ou masqué, dialogue imbriqué fermé) : il reste dans la bibliothèque
    if (!B.D.querySelector(".ed-voile") && !boite.contains(this.R.activeElement)) (boite.querySelector('[data-bib="liste"]') || boite.querySelector(".ed-bib-modeles [aria-selected=true]") || boite.querySelector("[data-bib-q]"))?.focus({ preventScroll: true });
  }
  // aperçu réel (moteur de la carte), sans interaction ; type inconnu : la carte dit « Type de widget inconnu »
  _apercuBiblio(w) {
    const carte = this.carte;
    carte._sansBascule = true;
    try { return carte._widget(w, "apercu", 0).replace(/ data-(w|e|ce|ci|te|ti|b|active)="[^"]*"/g, ""); } catch (e) { return `<div class="w-note">${esc(e.message)}</div>`; } finally { carte._sansBascule = false; }
  }
  _filtrerBiblio() {
    const B = this._biblio, boite = B?.D.querySelector(".ed-bib");
    if (!boite) return;
    const q = sansAccent(B.q.trim()), l = [...boite.querySelectorAll("[data-bib-u]")];
    let vus = 0;
    for (const b of l) { const ok = !q || q.split(/\s+/).every((x) => b.dataset.txt.includes(x)); b.hidden = !ok; vus += ok; }
    const rien = boite.querySelector(".ed-bib-rien");
    if (rien && l.length) rien.hidden = !!vus;
  }
  // interrupteur « à demander au placement » sous chaque champ entité (lignes et entités d'une liste : un seul pour le groupe)
  _interrupteursDemander(form, m) {
    const dem = new Set(Array.isArray(m.demander) ? m.demander : []), faits = new Set();
    const inter = (c) => `<label class="ed-bib-dem"><input type="checkbox" data-bib-dem="${esc(c)}" ${dem.has(c) ? "checked" : ""}><span>${_t("À choisir à chaque placement")}</span></label>`;
    const poser = (c, apres) => { if (faits.has(c) || !apres) return; faits.add(c); apres.insertAdjacentHTML("afterend", inter(c)); };
    for (const g of ["lignes", "entites"]) { const b = form.querySelector(`[data-act="ajouter-ligne:${g}"]`); if (b) poser(g, b); }
    form.querySelectorAll("button.ed-entite[data-entite]").forEach((b) => {
      const c = b.dataset.entite;
      if (/^(lignes|entites)\.\d+\.entite$/.test(c)) return;
      poser(c, b);
    });
  }

  _toucheBiblio(ev) {
    const B = this._biblio;
    if (B && !B.D.isConnected) { window.removeEventListener("keydown", B.touche, true); this._biblio = null; return; } // éditeur quitté
    if (!B || B.D.querySelector(".ed-voile")) return; // dialogue imbriqué (choix d'entité, confirmation) : il gère ses touches
    const k = ev.key.toLowerCase(), ctrl = ev.ctrlKey || ev.metaKey;
    const saisie = ev.composedPath().some((n) => n instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName) && !["checkbox", "radio"].includes(n.type)));
    if (k === "escape") {
      if (ev.composedPath().some((n) => n.classList?.contains("ed-ic") && !n.querySelector(".ed-ic-menu")?.hidden)) return; // menu des icônes d'abord
      ev.preventDefault(); ev.stopPropagation();
      if (this._etroit() && !B.liste && this._modeleBiblio()) { B.liste = true; this._rendreBiblio(); B.D.querySelector(`[data-bib-u="${B.u}"]`)?.focus(); return; }
      return this.fermerBibliotheque();
    }
    if (k === "tab") return this._pieger(ev, B.D.querySelector(".ed-bib"));
    if (ctrl && (k === "z" || k === "y") && !saisie) { ev.preventDefault(); ev.stopPropagation(); if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler(); return; }
    // liste des modèles : flèches haut / bas
    const o = ev.composedPath().find((n) => n.dataset?.bibU != null);
    if (o && (k === "arrowdown" || k === "arrowup")) {
      ev.preventDefault();
      const l = [...B.D.querySelectorAll("[data-bib-u]:not([hidden])")], i = l.indexOf(o), j = l[(i + (k === "arrowdown" ? 1 : -1) + l.length) % l.length];
      j?.focus();
    }
  }
  _clicBiblio(ev) {
    const B = this._biblio;
    if (!B) return;
    const ch = ev.composedPath();
    if (ch[0] === B.D) return; // fond du dialogue : rien (les réglages ne se perdent pas d'un clic à côté)
    const u = ch.find((n) => n.dataset?.bibU != null);
    if (u) return this._choisirModeleBiblio(+u.dataset.bibU);
    const v = ch.find((n) => n.dataset?.bibVue);
    if (v) { B.vue = v.dataset.bibVue; return this._rendreBiblio(); }
    const b = ch.find((n) => n.dataset?.bib || n.dataset?.act?.startsWith("bib:"));
    if (!b) return;
    const a = b.dataset.bib || b.dataset.act.slice(4), m = this._modeleBiblio();
    if (a === "fermer") return this.fermerBibliotheque();
    if (a === "liste") { B.liste = true; return this._rendreBiblio(); }
    if (a === "nouveau") return this._nouveauModele(b);
    if (!m) return;
    if (a === "dupliquer") {
      this.commit(() => { const c = clone(m); c.id = idModele(); c.nom = _t("{nom} (copie)", { nom: m.nom || _t("Widget") }); this.d.modeles.splice(B.u + 1, 0, c); B.u += 1; this.sel = { type: "widget", cote: "modele", i: 0 }; });
      return this._messageBiblio(_t("Modèle dupliqué."));
    }
    if (a === "partager") return this.partager({ u: [B.u], retour: b });
    if (a === "supprimer") return this._supprimerModele(m);
    if (a === "maj") return this._majCopies(m);
    if (a.startsWith("placer:")) return this._placerDepuisBiblio(m, a.slice(7));
  }
  _changeBiblio(ev) {
    const B = this._biblio, t = ev.target, m = this._modeleBiblio();
    if (!B || !t?.dataset) return;
    if (t.dataset.bibDest != null) { B.dest = t.value; return; }
    if (!m) return;
    if (t.dataset.bibNom != null) { const v = t.value.trim(); if (v && v !== m.nom) this.commit(() => { m.nom = v; }); else t.value = m.nom || ""; return; }
    if (t.dataset.bibDem != null) {
      const c = t.dataset.bibDem;
      this.commit(() => {
        const l = new Set(Array.isArray(m.demander) ? m.demander : []);
        if (t.checked) l.add(c); else l.delete(c);
        if (l.size) m.demander = [...l]; else delete m.demander;
      });
    }
  }
  // message dans le dialogue (la carte est inerte derrière lui) : snack posé dans l'hôte
  _messageBiblio(txt, action, fn, duree) { this.snack(txt, action, fn, duree); }

  // « Nouveau modèle » : choix du type (mêmes types que « Créer un widget »), modèle créé et ouvert
  _nouveauModele(retour) {
    const types = TYPES_ATELIER();
    const { voile, fermer } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true" aria-labelledby="ed-bib-nv" style="width:min(440px,100%)"><header><h2 id="ed-bib-nv">${_t("Nouveau modèle")}</h2><div class="ed-aide">${_t("1. Choisis le type")}</div></header>
      <div class="ed-resultats">${types.map((t) => `<button data-t="${esc(t.id)}"><ha-icon icon="${esc(t.icone)}"></ha-icon><span class="n"><span>${esc(t.nom)}</span><small>${esc(t.desc || "")}</small></span></button>`).join("")}</div>
      <footer><button class="ed-btn texte" data-t="">${_t("Annuler")}</button></footer></div>`, { echap: () => fin(null), pieger: true, dessus: true });
    const fin = (tid) => {
      fermer();
      const t = types.find((x) => x.id === tid);
      if (!t) { if (retour?.isConnected) retour.focus(); return; }
      let u = null;
      this.commit(() => { (this.d.modeles ||= []).push({ id: idModele(), nom: t.nom, genre: "widget", icone: t.icone, desc: t.nom, objet: clone(t.objet || { type: t.id }) }); u = this.d.modeles.length - 1; });
      this._choisirModeleBiblio(u);
      this._biblio?.D.querySelector("[data-bib-nom]")?.focus();
    };
    voile.addEventListener("click", (ev) => { const b = ev.composedPath().find((n) => n.dataset?.t != null); if (ev.target === voile || b) fin(b?.dataset.t || null); });
    setTimeout(() => voile.querySelector(".ed-resultats button")?.focus(), 30);
  }
  // confirmation dans un petit dialogue (dans l'hôte) ; résout true / false
  _confirmerBiblio(titre, texte, ok, danger = false) {
    return new Promise((res) => {
      const { voile, fermer } = this._voile("", `<div class="ed-dialogue" role="alertdialog" aria-modal="true" aria-labelledby="ed-bib-cf" aria-describedby="ed-bib-cf-t" style="width:min(460px,100%)"><header><h2 id="ed-bib-cf">${esc(titre)}</h2><div class="ed-aide" id="ed-bib-cf-t">${esc(texte)}</div></header>
        <footer><span class="ed-espace"></span><button class="ed-btn texte" data-r="0">${_t("Annuler")}</button><button class="ed-btn ${danger ? "danger" : "plein"}" data-r="1">${esc(ok)}</button></footer></div>`, { echap: () => fin(false), pieger: true, dessus: true });
      const fin = (v) => { fermer(); res(v); if (!v) this._rendreBiblio(); };
      voile.addEventListener("click", (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile) fin(false); else if (b) fin(b.dataset.r === "1"); });
      setTimeout(() => voile.querySelector('[data-r="1"]')?.focus(), 30);
    });
  }
  async _supprimerModele(m) {
    const n = this._copiesModele(m.id).length;
    const ok = await this._confirmerBiblio(_t("Supprimer « {nom} » ?", { nom: m.nom || _t("Widget") }), n ? _t("Sa copie reste dans le plan, détachée du modèle.|Ses {n} copies restent dans le plan, détachées du modèle.", { n }) : _t("Aucune copie dans le plan."), _t("Supprimer"), true);
    if (!ok || !this._biblio) return;
    this.commit(() => {
      for (const w of this._copiesModele(m.id)) delete w.origine;
      const i = this.d.modeles.indexOf(m);
      if (i >= 0) this.d.modeles.splice(i, 1);
      this._biblio.u = null; this.sel = null;
    });
    const l = this._modelesWidgets();
    if (l.length) this._choisirModeleBiblio(l[0][1]); else this._rendreBiblio();
    this._messageBiblio(_t("Modèle supprimé."), _t("Annuler"), this._annulation(), 8000);
  }
  // « Mettre à jour les N copies » : aperçu de la règle, puis un seul pas d'annulation
  async _majCopies(m) {
    const n = this._copiesModele(m.id).length, dem = Array.isArray(m.demander) && m.demander.length;
    if (!n) return;
    const ok = await this._confirmerBiblio(_t("Mettre à jour {n} copie ?|Mettre à jour les {n} copies ?", { n }),
      `${_t("Titre, icône, couleur et réglages du modèle remplacent ceux des copies.")} ${dem ? _t("Les entités « à choisir à chaque placement » de chaque copie sont gardées.") : _t("Les entités du modèle remplacent aussi celles des copies.")} ${_t("Les copies d'autres plans ne changent pas.")}`, _t("Mettre à jour"));
    if (!ok || !this._biblio) return;
    this.commit(() => { for (const w of this._copiesModele(m.id)) this._majDepuisModele(w, m); });
    this._messageBiblio(_t("{n} copie mise à jour.|{n} copies mises à jour.", { n }), _t("Annuler"), this._annulation(), 8000);
  }
  // placement par boutons (glisser impossible depuis un dialogue modal) : maison ou pièce choisie, panneau gauche ou droit
  _placerDepuisBiblio(m, cote) {
    const B = this._biblio, piece = B.dest === "" ? null : +B.dest, nom = m.nom || _t("Widget");
    this.fermerBibliotheque(false);
    this.utiliserModele(m, cote, Number.isInteger(piece) && this.d.pieces[piece] ? piece : null);
    if (!this._aFaire || this._aFaire.cle !== (this.sel && cle(this.sel))) {
      const ou = cote === "gauche" ? _t("Panneau gauche") : _t("Panneau droit"), p = piece != null ? this.d.pieces[piece]?.nom : null;
      this.snack(_t("« {nom} » placé : {ou}.", { nom, ou: p ? `${ou} · ${p}` : ou }), _t("Annuler"), this._annulation(), 8000);
    }
  }

  // ---------- copie d'un modèle, dans la fenêtre d'un widget : badge et actions ----------
  _actionCopie(a) {
    const o = this._objet(), m = this._modeleDe(o?.origine);
    if (!o) return;
    if (a === "bib:detacher") { this.commit(() => { delete o.origine; }); return this.snack(_t("Widget détaché de son modèle.")); }
    if (a === "bib:depuis" && m) { this.commit(() => this._majDepuisModele(o, m)); return this.snack(_t("Widget mis à jour depuis « {nom} ».", { nom: m.nom || _t("Widget") }), _t("Annuler"), this._annulation(), 8000); }
    if (a === "bib:ouvrir") return this.ouvrirBibliotheque({ u: m ? this.d.modeles.indexOf(m) : null, retour: this.R.querySelector(".ed-bf [data-bf=modifier]") });
  }
  // bandeau d'une copie (texte HTML) : modèle lié, ou introuvable (supprimé, autre plan)
  _bandeauCopie(w) {
    if (!w?.origine) return "";
    const m = this._modeleDe(w.origine);
    return `<div class="ed-bib-copie${m ? "" : " perdu"}"><ha-icon icon="mdi:${m ? "link-variant" : "link-variant-off"}"></ha-icon><span>${m ? esc(_t("Copie du modèle « {nom} »", { nom: m.nom || _t("Widget") })) : _t("Modèle introuvable (supprimé ou d'un autre plan)")}</span>
      <span class="ed-bib-copie-act">${m ? `<button type="button" class="ed-btn texte" data-act="bib:depuis"><ha-icon icon="mdi:sync"></ha-icon>${_t("Mettre à jour")}</button><button type="button" class="ed-btn texte" data-act="bib:ouvrir"><ha-icon icon="mdi:bookshelf"></ha-icon>${_t("Ouvrir")}</button>` : ""}
      <button type="button" class="ed-btn texte" data-act="bib:detacher"><ha-icon icon="mdi:link-variant-off"></ha-icon>${_t("Détacher")}</button></span></div>`;
  }

} // @assemblage
