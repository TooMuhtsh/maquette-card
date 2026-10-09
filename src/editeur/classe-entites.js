// choix d'entités, voiles, pré-remplissage, atelier des widgets — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- entités proposées d'après un critère (composant réutilisable : widgets prêts à l'emploi, puis ouvertures et meubles) ----------
  // contexte : { zone: id de pièce HA visée, device: appareil visé, exclure: Set d'entités, preferer: Set d'appareils déjà choisis }
  // Rend la liste triée : appareil visé, puis appareil déjà choisi, puis pièce visée, puis le reste (diagnostics en dernier).
  entitesCandidates(crit, ctx = {}) {
    const hass = this.hass, alt = (Array.isArray(crit) ? crit : [crit]).filter(Boolean), l = [];
    if (!alt.length) return l;
    const norm = (t) => sansAccent(String(t)).replace(/[_.\-/]+/g, " ");
    const dans = (v, x) => v == null || (Array.isArray(v) ? v.includes(x) : v === x);
    const rx = new Map();
    const re = (src) => { if (!rx.has(src)) { try { rx.set(src, new RegExp(src, "i")); } catch (e) { rx.set(src, null); } } return rx.get(src); };
    for (const [e, s] of Object.entries(hass.states || {})) {
      if (ctx.exclure?.has(e)) continue;
      const dom = e.split(".")[0], a = s.attributes || {}, txt = norm(`${e} ${a.friendly_name || ""}`);
      const ok = alt.some((k) => dans(k.d, dom) && dans(k.dc, a.device_class) && dans(k.u, a.unit_of_measurement)
        && (!k.id || re(k.id)?.test(txt)) && (!k.non || !re(k.non)?.test(txt)));
      if (!ok) continue;
      const r = hass.entities?.[e], dev = r?.device_id, zone = r?.area_id || hass.devices?.[dev]?.area_id || null;
      const score = (ctx.device && dev === ctx.device ? 8 : 0) + (dev && ctx.preferer?.has(dev) ? 6 : 0) + (ctx.zone && zone === ctx.zone ? 4 : 0) - (r?.entity_category ? 2 : 0);
      l.push({ e, nom: String(a.friendly_name || e), ici: !!ctx.zone && zone === ctx.zone, dev, score, v: parseFloat(s.state) });
    }
    const tri = (Array.isArray(crit) ? crit[0] : crit)?.tri;
    return l.sort((x, y) => y.score - x.score || (tri === "bas" ? (isNaN(x.v) ? 1e9 : x.v) - (isNaN(y.v) ? 1e9 : y.v) : 0) || x.nom.localeCompare(y.nom, _loc()));
  }

  // une entité pour un champ : aucune correspondance → null (champ « à compléter ») ; une seule (ou une seule sur l'appareil déjà
  // choisi) → prise d'office ; plusieurs → petite liste (pièce visée d'abord) avec « Autre entité… » (sélecteur complet) et « Ignorer ».
  async proposerEntite({ titre, crit, ctx = {}, domaine = "" }) {
    let l = this.entitesCandidates(crit, ctx);
    if (ctx.preferer?.size) { const m = l.filter((c) => c.dev && ctx.preferer.has(c.dev)); if (m.length === 1) return m[0].e; }
    if (ctx.device) { const m = l.filter((c) => c.dev === ctx.device); if (m.length === 1) return m[0].e; }
    if (l.length <= 1) return l[0]?.e ?? null;
    return this.choisirParmi({ titre, liste: l.slice(0, 30), ctx, domaine });
  }

  // petite liste d'entités proposées : Entrée / clic = choisir ; « Autre entité… » = sélecteur complet ; Échap / « Ignorer » = null
  // `plusieurs` (contacts d'une ouverture) : une case à côté de chaque ligne, « Relier » rend la liste cochée ; un clic sur la ligne
  // la choisit aussitôt (avec celles déjà cochées) ; le résultat est alors toujours une liste
  choisirParmi({ titre, liste, ctx = {}, domaine = "", plusieurs = false }) {
    return new Promise((fin) => {
      const coches = new Set();
      const hass = this.hass, nomZone = ctx.zone && (hass.areas?.[ctx.zone]?.name || ctx.zone);
      const ici = liste.filter((c) => c.ici), ailleurs = liste.filter((c) => !c.ici);
      const ligne = (c) => { const s = hass.states[c.e];
        const b = `<button data-r="${esc(c.e)}"><ha-icon icon="${esc(iconeEntite(hass, c.e))}"></ha-icon><span class="n"><span>${esc(c.nom)}</span><small>${esc(c.e)}</small></span><span class="etat">${esc(s ? hass.formatEntityState?.(s) ?? s.state : "")}</span></button>`;
        return plusieurs ? `<div class="ed-choix-l">${b}<button class="ed-coche" data-coche="${esc(c.e)}" aria-pressed="false" title="${_t("Cocher (plusieurs capteurs)")}" aria-label="${esc(_t("Cocher (plusieurs capteurs)"))} : ${esc(c.nom)}"><ha-icon icon="mdi:checkbox-blank-outline"></ha-icon></button></div>` : b; };
      const id = `ed-cp-${Math.random().toString(36).slice(2, 8)}`;
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue ed-choix-parmi" role="dialog" aria-modal="true" aria-labelledby="${id}"><header><h2 id="${id}">${esc(titre)}</h2>
          <div class="ed-aide">${_t("{n} entités correspondent.", { n: liste.length })}${plusieurs ? ` ${_t("Plusieurs capteurs sur cette ouverture : coche-les puis « Relier ».")}` : ""}</div></header>
        <div class="ed-resultats">${ici.length && nomZone ? `<h4>${_t("Dans « {piece} »", { piece: esc(nomZone) })}</h4>${ici.map(ligne).join("")}${ailleurs.length ? `<h4>${_t("Ailleurs")}</h4>` : ""}` : ""}${ailleurs.map(ligne).join("")}</div>
        <footer><button class="ed-btn texte" data-r="autre"><ha-icon icon="mdi:magnify"></ha-icon>${_t("Autre entité…")}</button><span class="ed-espace"></span><button class="ed-btn texte" data-r="">${_t("Ignorer")}</button>${plusieurs ? `<button class="ed-btn" data-relier disabled>${_t("Relier")}</button>` : ""}</footer></div>`, { echap: () => fermer(null), defaut: true, pieger: true, dessus: true });
      const avant = this.R.activeElement;
      const fermer = (v) => { retirer(); if (avant?.isConnected) avant.focus(); fin(v); };
      voile.onclick = async (ev) => {
        ev.stopPropagation();
        if (ev.target === voile) return fermer(null);
        const chemin = ev.composedPath(), co = chemin.find((n) => n.dataset?.coche != null);
        if (co) {
          const on = !coches.delete(co.dataset.coche) && !!coches.add(co.dataset.coche);
          co.setAttribute("aria-pressed", String(on)); co.querySelector("ha-icon").setAttribute("icon", on ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline");
          voile.querySelector("[data-relier]").disabled = !coches.size;
          return;
        }
        if (chemin.some((n) => n.dataset?.relier != null)) return fermer(coches.size ? [...coches] : null);
        const b = chemin.find((n) => n.dataset?.r != null);
        if (!b) return;
        if (b.dataset.r !== "autre") return fermer(b.dataset.r ? (plusieurs ? [...new Set([...coches, b.dataset.r])] : b.dataset.r) : null);
        const e = await this.choisirEntite({ titre, domaine });
        if (e) fermer(plusieurs ? [...coches, e] : e);
      };
      setTimeout(() => voile.querySelector(".ed-resultats button")?.focus(), 30);
    });
  }
  // un dialogue (voile) est-il au premier plan ? (les touches Échap / Tab ne vont qu'à lui)
  _dessus(voile) { const l = this.R.querySelectorAll(".ed-voile"); return l[l.length - 1] === voile; }
  // squelette commun des dialogues : voile (classe « ed-voile » + classe), HTML posé puis voile ajouté à la carte (html null : le
  // dialogue le remplit et l'ajoute lui-même). Clavier en capture sur la fenêtre, retiré par fermer() : o.echap() sur Échap (et o.touches),
  // o.defaut : preventDefault en plus, o.pieger : Tab gardé dans le dialogue, o.dessus : seulement au premier plan, o.touche : gestion libre
  _voile(classe, html, o = {}) {
    const voile = document.createElement("div");
    voile.className = `ed-voile${classe ? ` ${classe}` : ""}`;
    const touche = (ev) => {
      if (o.dessus && !this._dessus(voile)) return;
      if (o.touche) return o.touche(ev);
      if (o.echap && (ev.key === "Escape" || o.touches?.includes(ev.key))) { if (o.defaut) ev.preventDefault(); ev.stopPropagation(); o.echap(); }
      else if (o.pieger && ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
    };
    const clavier = !!(o.echap || o.touche || o.pieger);
    if (clavier) window.addEventListener("keydown", touche, true);
    const fermer = () => { voile.remove(); if (clavier) window.removeEventListener("keydown", touche, true); };
    if (html != null) { poserHTML(voile, html); this.R.querySelector("ha-card").append(voile); }
    return { voile, fermer };
  }

  // contexte de pré-remplissage d'un widget : pièce visée (sa pièce HA), ou appareil et pièce de l'élément qui porte la fiche
  _contexteWidget(piece, pf) {
    const d = this.d, hass = this.hass, ctx = { exclure: new Set(), preferer: new Set() };
    if (piece != null) ctx.zone = d.pieces[piece]?.zone || null;
    if (pf) {
      const o = d[GENRES_FICHE[pf.genre]]?.[pf.i], e = o && (o.entite || contactsOuv(o)[0] || o.volet || o.valeur), r = e && hass.entities?.[e];
      if (r?.device_id) ctx.device = r.device_id;
      ctx.zone ||= r?.area_id || hass.devices?.[r?.device_id]?.area_id || null;
    }
    return ctx;
  }

  // pré-remplit les champs entité d'un widget prêt à l'emploi (`auto`) ; rend les chemins restés vides (« à compléter »)
  async _preRemplir(o, auto, ctx, nomWidget) {
    const manquants = new Set(), lire = (c) => c.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o);
    const choisi = (e) => { ctx.exclure.add(e); const dev = this.hass.entities?.[e]?.device_id; if (dev) ctx.preferer.add(dev); };
    for (const [chemin, spec] of Object.entries(auto || {})) {
      if (chemin === "entites" || chemin === "lignes") {
        const rangs = [];
        if (spec.n) for (const c of this.entitesCandidates(spec.k, ctx).slice(0, spec.n)) { rangs.push({ entite: c.e }); choisi(c.e); }
        for (const r of spec.rangs || []) {
          const c = this.entitesCandidates(r.k, ctx)[0];
          if (c) { rangs.push({ entite: c.e, ...(r.nom ? { nom: r.nom } : {}) }); choisi(c.e); }
        }
        if (rangs.length) o[chemin] = [...(Array.isArray(o[chemin]) ? o[chemin] : []), ...rangs];
        else if (chemin === "entites") manquants.add(chemin);
        continue;
      }
      if (lire(chemin)) continue;
      const nomChamp = NOMS_CHAMPS_AUTO[chemin.replace(/^colonnes\.\d+\./, "colonnes.")];
      const e = await this.proposerEntite({ titre: nomChamp ? `${nomWidget} · ${_t(nomChamp)}` : nomWidget, crit: spec, ctx, domaine: (Array.isArray(spec) ? spec[0] : spec)?.d || "" });
      if (e) { poserChemin(o, chemin, e); choisi(e); } else manquants.add(chemin);
    }
    return manquants;
  }

  // chemins des champs entité d'un widget (modèles : `demander` = ceux à choisir à chaque ajout)
  _cheminsEntites(o) {
    const l = CHAMPS_ENTITE_WIDGET.filter((k) => typeof o[k] === "string" && o[k]);
    for (const k of ["entites", "lignes"]) if (Array.isArray(o[k]) && o[k].some((x) => x?.entite || typeof x === "string")) l.push(k);
    (o.colonnes || []).forEach((c, j) => { for (const k of ["stat", "jour", "semaine", "mois", "annee"]) if (c?.[k]) l.push(`colonnes.${j}.${k}`); });
    return l;
  }

  // ---------- atelier : dialogue générique « choisir un type → réglages + aperçu → ajouter (et modèle) » ----------
  // spec : { titre, types: [{ id, nom, icone, desc, objet }], reglages(o) → html (champs data-k / data-entite / data-at),
  //   apercu(o) → html, destinations?: [[valeur, libellé]], dest?, modele?: true (case « Enregistrer dans Mes modèles »),
  //   demander?: true (case « Entités à choisir à chaque ajout »), action?(a, o) : boutons data-at, valider({ o, type, dest, modele, demander }),
  //   type?: type choisi d'office (étape 1 sautée), retour?: élément qui reprend le focus, dessous?: dialogue masqué pendant l'atelier }
  // Réutilisable pour d'autres objets (meubles, ouvertures) : seuls types, reglages, apercu et valider changent.
  // Modification d'un élément existant : initial (objet de départ, étape 2 d'office), fusion(t, o) (objet quand on choisit un autre type,
  //   à partir de l'objet en cours), libelleOk (bouton de validation), ecrire(o, k, v) → true si le champ est écrit par l'appelant
  //   (unités converties…). Types : svg (aperçu à la place de l'icône), groupe (titre de section). Champ data-rendre : formulaire redessiné.
  // Aperçu manipulable (meubles) : classe (du dialogue), apercuTete() / apercuPied() (boutons au-dessus, astuce en dessous),
  //   monter(voile, api) une fois, apresRendu(voile) après chaque dessin de l'aperçu, touche(ev) → true si la touche est prise ;
  //   api : objet(), remplacer(o, focus), rendre(focus), maj() (aperçu seul) ; action(a, o) peut rendre le sélecteur à refocaliser.
  //   Dans l'aperçu, l'élément focalisé (data-foc) le reste quand l'aperçu est redessiné.
  ouvrirAtelier(spec) {
    const id = `ed-at-${Math.random().toString(36).slice(2, 8)}`;
    const { voile, fermer: retirer } = this._voile("ed-at-voile ed-plein-tel", null, { dessus: true, touche: (ev) => touche(ev) });
    let etape = "type", type = null, o = null, dest = spec.dest ?? spec.destinations?.[0]?.[0], modele = false, demander = true, minuteur = 0;
    if (spec.initial) { o = clone(spec.initial); etape = "reglages"; type = spec.typeInitial ?? null; }
    const avant = spec.retour || this.R.activeElement;
    if (spec.dessous) spec.dessous.style.visibility = "hidden"; // le dialogue d'où vient l'atelier : masqué le temps de l'atelier
    const apercu = () => { try { return spec.apercu(o); } catch (e) { return `<div class="w-note">${esc(e.message)}</div>`; } };
    const rendre = (focus) => {
      this._atelierObjet = o;
      const t = spec.types.find((x) => x.id === type);
      poserHTML(voile, `<div class="ed-dialogue large ed-atelier${spec.classe ? ` ${spec.classe}` : ""}" role="dialog" aria-modal="true" aria-labelledby="${id}">
        <header><h2 id="${id}">${esc(spec.titre)}</h2><div class="ed-aide">${etape === "type" ? _t("1. Choisis le type") : t ? _t("2. Réglages · {type}", { type: esc(t.nom || "") }) : _t("Réglages")}</div></header>
        ${etape === "type" ? `<div class="ed-cat">${[...new Map(spec.types.map((x) => [x.groupe || "", 1])).keys()].map((g) => `${g ? `<h4 class="ed-at-groupe">${esc(g)}</h4>` : ""}<div class="ed-grille">${spec.types.filter((x) => (x.groupe || "") === g).map((x) => `<div class="ed-tuile" role="button" tabindex="0" data-at-type="${esc(x.id)}"${x.detail ? ` title="${esc(x.detail)}"` : ""}>${x.svg || `<ha-icon icon="${esc(x.icone)}"></ha-icon>`}<b>${esc(x.nom)}</b>${x.desc ? `<small>${esc(x.desc)}</small>` : ""}</div>`).join("")}</div>`).join("")}</div>`
        : `<div class="ed-cat ed-at-corps"><div class="ed-at-apercu" aria-label="${_t("Aperçu")}">${spec.apercuTete ? `<div class="ed-at-ap-tete"><h4>${_t("Aperçu")}</h4>${spec.apercuTete()}</div>` : `<h4>${_t("Aperçu")}</h4>`}<div class="ed-at-w">${apercu()}</div>${spec.apercuPied?.() || ""}</div>
            <div class="ed-at-form">${spec.reglages(o)}
              ${spec.destinations ? `<div class="ed-champ"><label>${_t("Emplacement")}</label><div class="ed-seg" role="radiogroup">${spec.destinations.map(([v, n]) => `<button role="radio" aria-checked="${v === dest}" data-at-dest="${esc(v)}" class="${v === dest ? "on" : ""}">${esc(n)}</button>`).join("")}</div></div>` : ""}
              ${spec.modele ? `<label class="ed-inter"><span>${_t("Enregistrer dans Mes modèles")}</span><input type="checkbox" data-at-modele ${modele ? "checked" : ""}></label>
                ${modele && spec.demander ? `<label class="ed-inter"><span>${_t("Entités à choisir à chaque ajout")}</span><input type="checkbox" data-at-demander ${demander ? "checked" : ""}></label>` : ""}` : ""}</div></div>`}
        <footer>${etape === "reglages" ? `<button class="ed-btn texte" data-at-retour><ha-icon icon="mdi:arrow-left"></ha-icon>${_t("Retour")}</button>` : ""}<span class="ed-espace"></span>
          <button class="ed-btn texte" data-at-fermer>${_t("Annuler")}</button>${etape === "reglages" ? `<button class="ed-btn plein" data-at-ok><ha-icon icon="mdi:check"></ha-icon>${esc(spec.libelleOk || _t("Ajouter"))}</button>` : ""}</footer></div>`);
      if (etape === "reglages") {
        const P = voile.querySelector(".ed-at-form");
        P.querySelectorAll("input[data-k],select[data-k]").forEach((inp) => {
          const ecrire = (ev) => {
            const v = inp.type === "checkbox" ? inp.checked : inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim();
            if (!spec.ecrire?.(o, inp.dataset.k, v)) poserChemin(o, inp.dataset.k, v);
            // formulaire redessiné (champ qui en montre ou masque d'autres) : au changement seulement, pas à chaque frappe
            // (le focus reste sur le champ actif après le rendu, même après Tab)
            if (inp.dataset.rendre != null && ev?.type === "change") return setTimeout(() => {
              if (!voile.isConnected) return;
              const f = this.R.activeElement, sel = ["k", "at", "entite"].map((k) => f?.dataset?.[k] != null && `[data-${k}="${f.dataset[k]}"]`).find(Boolean);
              rendre(sel || `[data-k="${inp.dataset.k}"]`);
            });
            clearTimeout(minuteur); minuteur = setTimeout(majApercu, 120);
          };
          inp.addEventListener("input", ecrire); inp.addEventListener("change", ecrire);
        });
        this._cablerIcones(P);
        spec.apresRendu?.(voile);
      }
      (focus ? voile.querySelector(focus) : null)?.focus();
    };
    const majApercu = () => {
      const w = voile.querySelector(".ed-at-w"); if (!w) return;
      const f = this.R.activeElement, foc = f && w.contains(f) ? f.closest("[data-foc]")?.dataset.foc : null;
      poserHTML(w, apercu()); spec.apresRendu?.(voile);
      if (foc) w.querySelector(`[data-foc="${foc}"]`)?.focus({ preventScroll: true });
    };
    const api = { objet: () => o, remplacer: (n, focus) => { o = n; rendre(focus); }, rendre: (focus) => rendre(focus), maj: () => majApercu() };
    const choisirType = (tid) => { const t = spec.types.find((x) => x.id === tid); if (!t) return; if (type !== tid) o = spec.fusion ? spec.fusion(t, o) : clone(t.objet || {}); type = tid; etape = "reglages"; rendre(".ed-at-form input, .ed-at-form button"); };
    const fermer = (ok) => {
      clearTimeout(minuteur); retirer(); this._atelierObjet = null;
      if (spec.dessous) spec.dessous.style.visibility = "";
      if (ok) spec.valider({ o, type, dest, modele, demander });
      else if (avant?.isConnected) avant.focus();
    };
    const touche = (ev) => {
      if (etape === "reglages" && spec.touche?.(ev)) return;
      if (ev.key === "Escape") { if (ev.composedPath().some((n) => n.classList?.contains("ed-ic") && !n.querySelector(".ed-ic-menu")?.hidden)) return; ev.preventDefault(); ev.stopPropagation(); fermer(false); }
      else if (ev.key === "Tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
      else if (ev.key === "Enter") {
        const t = ev.composedPath()[0];
        if (t?.dataset?.atType) { ev.preventDefault(); choisirType(t.dataset.atType); }
        else if (etape === "reglages" && !(t?.tagName === "BUTTON" || t?.tagName === "TEXTAREA" || t?.closest?.(".ed-ic"))) { ev.preventDefault(); t?.dispatchEvent?.(new Event("change")); fermer(true); }
      }
    };
    voile.addEventListener("pointerdown", (ev) => { voile._bas = ev.target === voile; });
    voile.addEventListener("click", async (ev) => {
      ev.stopPropagation(); // l'aperçu n'est pas la carte : aucun clic ne lui revient
      const ch = ev.composedPath(), x = (k) => ch.find((n) => n.dataset?.[k] != null);
      if ((ev.target === voile && voile._bas) || x("atFermer")) return fermer(false);
      if (x("atOk")) return fermer(true);
      if (x("atRetour")) { etape = "type"; return rendre(`[data-at-type="${type}"]`); }
      const ty = x("atType"); if (ty) return choisirType(ty.dataset.atType);
      const de = x("atDest"); if (de) { dest = de.dataset.atDest; return rendre(`[data-at-dest="${dest}"]`); }
      const mo = x("atModele"); if (mo) { modele = mo.checked; return rendre("[data-at-modele]"); }
      const dm = x("atDemander"); if (dm) { demander = dm.checked; return; }
      const ef = x("effacer"); if (ef) { poserChemin(o, ef.dataset.effacer, ""); return rendre(); }
      const en = x("entite");
      if (en) {
        const lab = en.closest(".ed-champ")?.querySelector("label")?.textContent.replace(_t(" · à compléter"), "").trim();
        const e = await this.choisirEntite({ titre: lab || _t("Choisir une entité"), domaine: en.dataset.dom });
        if (e != null) { poserChemin(o, en.dataset.entite, e); if (spec.apresEntite) spec.apresEntite(o, en.dataset.entite, e); }
        return rendre(`[data-entite="${en.dataset.entite}"]`);
      }
      const ac = x("at"); if (ac && spec.action) { const f = await spec.action(ac.dataset.at, o); return rendre(typeof f === "string" ? f : undefined); }
    });
    this.R.querySelector("ha-card").append(voile);
    spec.monter?.(voile, api);
    if (spec.type) choisirType(spec.type); else rendre(etape === "reglages" ? ".ed-at-form input, .ed-at-form button" : ".ed-tuile");
    return voile;
  }

  // « Créer un widget » : l'atelier avec les types de widgets ; ajout au panneau (ou à la fiche) d'où vient la modale
  creerWidget(opt = {}) {
    const pf = opt.cote === "fiche" ? porteurDe(opt) : null, carte = this.carte;
    const types = TYPES_ATELIER();
    this.ouvrirAtelier({
      titre: _t("Créer un widget"), types, modele: true, demander: true, retour: opt.retour, dessous: opt.dessous,
      destinations: pf ? null : [["gauche", _t("Panneau gauche")], ["droite", _t("Panneau droit")]], dest: pf ? "fiche" : opt.cote || "droite",
      reglages: (o) => this._reglagesAtelier(o),
      apercu: (o) => {
        carte._sansBascule = true;
        try { return carte._widget(o, "apercu", 0).replace(/ data-(w|e|ce|ci|te|ti|b|active)="[^"]*"/g, ""); } finally { carte._sansBascule = false; }
      },
      action: async (a, o) => {
        const [op, j] = a.split(":");
        if (op === "ajouter-entite") { const e = await this.choisirEntite({ titre: _t("Ajouter une entité") }); if (e) (o.entites ||= []).push({ entite: e }); }
        if (op === "retirer-entite") o.entites.splice(+j, 1);
      },
      valider: ({ o, type, dest, modele, demander }) => {
        opt.apres?.();
        const w = clone(o), t = types.find((x) => x.id === type);
        for (const k of Object.keys(w)) if (w[k] === "" || w[k] == null) delete w[k];
        if (Array.isArray(w.entites)) w.entites = w.entites.filter((x) => x?.entite);
        const cote = pf ? "fiche" : dest, ref = pf ? { [pf.genre]: pf.i } : {};
        if (cote === "fiche" && !pf) return;
        this.commit(() => {
          const l = this._wl(cote === "fiche" ? { cote, ...ref } : { cote, piece: opt.piece ?? null }, true);
          l.push(clone(w));
          this.sel = { type: "widget", cote, i: l.length - 1, ...(cote === "fiche" ? ref : opt.piece != null ? { piece: opt.piece } : {}) };
          if (modele) {
            const objet = clone(w), dem = demander ? this._cheminsEntites(objet) : [];
            for (const c of dem) poserChemin(objet, c, c === "entites" || c === "lignes" ? [] : "");
            (this.d.modeles ||= []).push({ id: idModele(), nom: w.titre || t?.nom || _t("Widget"), genre: "widget", icone: w.icone || t?.icone || "mdi:view-dashboard-outline",
              desc: t?.nom || "", objet, ...(dem.length ? { demander: dem } : {}) });
          }
        });
        this.snack(modele ? _t("Widget ajouté et enregistré dans Mes modèles.") : _t("Widget ajouté."));
      },
    });
  }

  // réglages essentiels d'un type de widget dans l'atelier (les autres restent dans le panneau du widget, une fois ajouté)
  _reglagesAtelier(o) {
    const E = (label, k, dom = "") => this._champEntite(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), true, dom);
    const T = (label, k, ph = "") => this._champTexte(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), ph);
    const N = (label, k, pas = 1, ph = "") => this._champNombre(label, k, k.split(".").reduce((x, p) => x?.[/^\d+$/.test(p) ? +p : p], o), pas, ph);
    let h = `${T(_t("Titre"), "titre")}${o.type === "separateur" ? "" : this._champTexte(_t("Icône"), "icone", o.icone, "mdi:…")}`;
    const t = o.type;
    if (t === "tuile") h += `${E(_t("Valeur principale"), "entite")}<div class="ed-ligne trois">${T(_t("Unité"), "unite", _t("auto"))}${N(_t("Décimales"), "decimales", 1, _t("auto"))}${N(_t("Courbe (h)"), "historique", 1, "0")}</div>`;
    if (t === "jauge") h += `${E(_t("Valeur"), "entite")}<div class="ed-ligne trois">${N(_t("Minimum"), "min", 1)}${N(_t("Maximum"), "max", 1)}${T(_t("Unité"), "unite", _t("auto"))}</div>`;
    if (t === "entites") h += `<div class="ed-champ"><label>${_t("Entités")}</label>${(o.entites || []).map((l, j) => `<div class="ed-ligne ed-at-rang">${this._champEntite("", `entites.${j}.entite`, l.entite, false)}<button class="ib" data-at="retirer-entite:${j}" title="${_t("Retirer")}" aria-label="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></button></div>`).join("")}
      <button class="ed-btn contour" data-at="ajouter-entite"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une entité")}</button></div>`;
    if (t === "thermostat") h += E(_t("Thermostat"), "entite", "climate");
    if (t === "commande") h += E(_t("Volet, portail, vanne"), "entite", "cover");
    if (t === "serrure") h += E(_t("Serrure"), "entite", "lock");
    if (t === "climat") h += N(_t("Durée de la tendance (min)"), "duree", 5, "30");
    if (t === "tarif") h += `${E(_t("Prix en cours (€/kWh)"), "prix", "sensor")}${E(_t("Période (heures pleines / creuses)"), "periode", "sensor")}`;
    if (t === "ve") h += `${E(_t("Batterie (%)"), "batterie", "sensor")}${E(_t("Autonomie"), "autonomie", "sensor")}${E(_t("Puissance de charge"), "puissance", "sensor")}${E(_t("Câble branché"), "branche")}`;
    if (t === "periodes") h += `<div class="ed-ligne">${T(_t("Nom de la colonne"), "colonnes.0.nom")}${T(_t("Unité"), "colonnes.0.unite")}</div>${E(_t("Compteur cumulatif (statistique HA)"), "colonnes.0.stat", "sensor")}`;
    return h;
  }

} // @assemblage
