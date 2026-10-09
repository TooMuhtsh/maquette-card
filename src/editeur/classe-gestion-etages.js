// gérer les étages (L5) : ajouter, renommer, réordonner, supprimer — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- gérer les étages : modale « Étages » ----------
  // Chaque action est une seule étape d'annulation : la config repliée est modifiée puis reposée dépliée sur l'étage à afficher.
  // 1 → N : « + Étage » sur un plan sans `floors` range d'abord la géométrie dans l'étage `ground` ; N → 1 : supprimer l'avant-dernier
  // étage remet la géométrie à la racine (plus de `floors` ni de `default_floor`).
  // le sélecteur d'étages de la carte reste visible en édition dès qu'il y a un étage (bouton « Gérer »)
  get afficherSelecteur() { return true; }

  // config repliée (copie) posée dépliée sur l'étage `id` (ou telle quelle sans étages), en une étape d'annulation
  _poserPlein(plein, id) {
    const E = this._E, d = E.ids(plein).length ? E.deplier(plein, id) : plein;
    this.commit(() => this._applique(JSON.stringify(d)));
  }
  // mur du contour : d'un côté une pièce intérieure (pas `outside`), de l'autre rien (essai au quart, au milieu, aux trois quarts)
  _murExterieur(m, pieces) {
    const P = pieces.filter((p) => p && !p.dehors && Array.isArray(p.poly) && p.poly.length >= 3);
    if (!P.length) return true;
    const [x1, y1, x2, y2] = m, L = Math.hypot(x2 - x1, y2 - y1);
    if (!(L > 0)) return false;
    const nx = -(y2 - y1) / L * 15, ny = (x2 - x1) / L * 15, dedans = (x, y) => P.some((p) => dansPoly([x, y], p.poly));
    return [0.25, 0.5, 0.75].some((t) => { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; return dedans(x + nx, y + ny) !== dedans(x - nx, y - ny); });
  }
  // identifiant sûr et libre (etage_1, etage_2…) et nom proposé (« Étage 1 »…), au même numéro
  _nouvelEtage(plein) {
    const ids = new Set(this._E.ids(plein)), noms = new Set((plein.etages || []).map((e) => e?.nom));
    let n = 1;
    while (ids.has(`etage_${n}`) || noms.has(_t("Étage {n}", { n }))) n++;
    return { id: `etage_${n}`, nom: _t("Étage {n}", { n }), court: String(n), icone: n <= 3 ? `mdi:home-floor-${n}` : "mdi:layers-outline" };
  }
  // pièces et autres éléments d'un étage (confirmation de suppression, liste de la modale)
  _comptesEtage(e) {
    const g = e.geo, autres = ["murs", "limites", "ouvertures", "points", "textes", "meubles"].reduce((a, k) => a + g[k].length, 0) + (g.fond ? 1 : 0);
    return { pieces: g.pieces.length, autres };
  }

  // + Étage : `vide`, `murs` (murs extérieurs de l'étage affiché) ou `tout` (copie de l'étage affiché) ; placé juste au-dessus, on y passe
  ajouterEtage(mode = "vide") {
    const E = this._E, plein = this._replie();
    let cur = this._etageActif();
    if (!E.ids(plein).length) {
      // passage 1 → N : le plan actuel devient le rez-de-chaussée
      const g = { id: "ground", nom: _t("Rez-de-chaussée"), court: "0", icone: "mdi:home-floor-0" };
      for (const k of E.CLES_ETAGE) if (k in plein) { g[k] = plein[k]; delete plein[k]; }
      g.pieces ||= [];
      plein.etages = [g];
      delete plein.etage_defaut;
      cur = "ground";
    }
    let i = plein.etages.findIndex((e) => e?.id === cur);
    if (i < 0) i = plein.etages.length - 1;
    const src = plein.etages[i], neuf = this._nouvelEtage(plein);
    if (mode === "tout") {
      for (const k of [...E.CLES_ETAGE, "panneaux"]) if (k in src) neuf[k] = clone(src[k]);
    } else if (mode === "murs") neuf.murs = (src.murs || []).filter((m) => Array.isArray(m) && this._murExterieur(m, src.pieces || [])).map((m) => [...m]);
    neuf.pieces ||= [];
    plein.etages.splice(i + 1, 0, neuf);
    this._taireDoublons = true;
    try { this._poserPlein(plein, neuf.id); } finally { this._taireDoublons = false; }
    const d = this._doublons;
    this._doublons = null;
    if (d?.length) this._avertirDoublons(d, _t("Étage « {nom} » ajouté.", { nom: neuf.nom }));
    else this.snack(_t("Étage « {nom} » ajouté.", { nom: neuf.nom }), _t("Annuler##defaire"), this._annulation(), 8000);
    this._rendreEtages();
    return neuf.id;
  }
  // nom, nom court, icône (l'id ne change jamais : escaliers et étage mémorisé restent valides) ; vide = retiré
  modifierEtage(id, champ, valeur, rendre = true) {
    if (!["nom", "court", "icone"].includes(champ)) return false;
    const e = (this.d.etages || []).find((x) => x?.id === id), v = String(valeur ?? "").trim();
    if (!e || (e[champ] ?? "") === v) return false;
    if (champ === "icone" && v && !/^[\w-]+:[\w-]+$/.test(v)) { this.snack(_t("Icône attendue sous la forme mdi:nom-de-l-icone."), null, null, "erreur"); this._rendreEtages(); return false; }
    this.commit(() => { if (v) e[champ] = v; else delete e[champ]; });
    if (rendre) this._rendreEtages();
    return true;
  }
  // monter (+1) ou descendre (-1) un étage dans la maison (`floors` va du bas vers le haut)
  deplacerEtage(id, sens) {
    const l = this.d.etages || [], i = l.findIndex((x) => x?.id === id), j = i + sens;
    if (i < 0 || j < 0 || j >= l.length) return false;
    this.commit(() => { [l[i], l[j]] = [l[j], l[i]]; });
    this._rendreEtages();
    return true;
  }
  // étage affiché au chargement (`default_floor`) ; null : le dernier affiché, sinon le premier
  etageParDefaut(id) {
    const ids = this._E.ids(this.d);
    if (id != null && !ids.includes(id)) return false;
    if ((this.d.etage_defaut ?? null) === (id ?? null)) return false;
    this.commit(() => { if (id == null) delete this.d.etage_defaut; else this.d.etage_defaut = id; });
    this._rendreEtages();
    return true;
  }
  // supprimer un étage (confirmation, sauf `confirme`) : escaliers qui y menaient sans `floor` ; au dernier étage restant, plus de `floors`
  supprimerEtage(id, confirme = false) {
    const E = this._E, L = E.parEtage(this.d), e = L.find((x) => x.id === id);
    if (!e || L.length < 2) return false;
    if (!confirme) return this._confirmerSuppression(e);
    const plein = this._replie(), i = plein.etages.findIndex((x) => x?.id === id), actif = this._etageActif();
    plein.etages.splice(i, 1);
    let n = 0;
    const sans = (l) => { for (const m of l || []) if (m?.type === "escalier" && "etage" in m && (m.etage === id || plein.etages.length === 1)) { delete m.etage; n++; } };
    plein.etages.forEach((x) => sans(x.meubles));
    if (plein.etage_defaut === id) delete plein.etage_defaut;
    let vers = actif === id ? plein.etages[Math.max(0, i - 1)].id : actif;
    if (plein.etages.length === 1) {
      // N → 1 : la géométrie du dernier étage revient à la racine, comme un plan simple
      const [r] = plein.etages;
      for (const k of E.CLES_ETAGE) if (k in r) plein[k] = r[k];
      if ("panneaux" in r) plein.panneaux = r.panneaux;
      plein.pieces ||= [];
      delete plein.etages; delete plein.etage_defaut; delete plein.selecteur_etages;
      vers = null;
    }
    this._poserPlein(plein, vers);
    const nom = e.nom || e.court;
    this.snack(n ? `${_t("Étage « {nom} » supprimé.", { nom })} ${_t("{n} escalier n'y mène plus.|{n} escaliers n'y mènent plus.", { n })}` : _t("Étage « {nom} » supprimé.", { nom }),
      _t("Annuler##defaire"), this._annulation(), 10000);
    this._rendreEtages();
    return true;
  }
  _confirmerSuppression(e) {
    const { pieces, autres } = this._comptesEtage(e), nom = e.nom || e.court;
    const perte = pieces || autres ? _t("{p} et {a} seront perdus (annulable).", { p: _t("{n} pièce|{n} pièces", { n: pieces }), a: _t("{n} autre élément|{n} autres éléments", { n: autres }) })
      : _t("Cet étage est vide.");
    const { voile, fermer } = this._voile("", `<div class="ed-dialogue ed-et-conf" role="alertdialog" aria-modal="true" aria-labelledby="ed-et-conf-t" aria-describedby="ed-et-conf-d">
      <header><h2 id="ed-et-conf-t">${esc(_t("Supprimer « {nom} » ?", { nom }))}</h2><div class="ed-aide" id="ed-et-conf-d">${esc(perte)}</div></header>
      <footer><button class="ed-btn texte" data-x="non">${_t("Annuler")}</button><button class="ed-btn plein ed-et-danger" data-x="oui"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Supprimer")}</button></footer></div>`,
    { echap: () => { fermer(); this._focusEtages(`[data-id="${this._selId(e.id)}"] [data-et="suppr"]`); }, pieger: true, dessus: true });
    voile.onclick = (ev) => {
      const x = ev.target === voile ? "non" : ev.composedPath().find((n) => n.dataset?.x)?.dataset.x;
      if (!x) return;
      fermer();
      if (x === "oui") this.supprimerEtage(e.id, true); else this._focusEtages(`[data-id="${this._selId(e.id)}"] [data-et="suppr"]`);
    };
    voile.querySelector('[data-x="non"]').focus();
    return false;
  }

  // ---------- noms de pièce uniques dans la maison (avertissement, jamais bloquant) ----------
  _cleNom(n) { return String(n ?? "").trim().toLocaleLowerCase(); }
  _compterNoms(c) {
    const m = new Map();
    for (const e of this._E.parEtage(c)) for (const p of e.geo.pieces) { const k = this._cleNom(p?.nom); if (k) m.set(k, (m.get(k) || 0) + 1); }
    return m;
  }
  // crochet de _apres : un nom de pièce de l'étage affiché devient doublon dans la maison (création, renommage, copie, étage dupliqué)
  _apresGestionEtages(plein, sansHisto) {
    // modale ouverte : redessinée après toute modification (annuler depuis la notification compris), sauf pendant une saisie
    if (this._voileEtages && !this._saisieEtages) this._rendreEtages();
    const avant = this._nomsMaison || this._compterNoms(this.original), noms = (this._nomsMaison = this._compterNoms(plein));
    if (sansHisto || !this._E.ids(plein).length) return;
    const ici = this._E.parEtage(plein).find((e) => e.id === this._etageActif());
    const d = [...new Set((ici?.geo.pieces || []).map((p) => String(p?.nom ?? "").trim()).filter((n) => {
      const k = this._cleNom(n);
      return k && noms.get(k) > 1 && noms.get(k) > (avant.get(k) || 0);
    }))];
    if (!d.length) return;
    if (this._taireDoublons) this._doublons = d; else this._avertirDoublons(d);
  }
  // nom proposé : « WC (Étage) » (nom de l'étage affiché), sinon numéroté s'il est déjà pris
  _nomPropose(nom, noms) {
    const e = (this.d.etages || []).find((x) => x?.id === this._etageActif()), et = e?.nom || e?.court || "";
    const base = et ? `${nom} (${et})` : nom;
    let p = et ? base : `${nom} 2`, k = 1;
    while (noms.has(this._cleNom(p))) p = `${base} ${++k}`;
    return p;
  }
  _avertirDoublons(d, avant = "") {
    const noms = this._compterNoms(this.d), prop = d.map((n) => [n, this._nomPropose(n, noms)]);
    const txt = d.length === 1 ? _t("« {nom} » existe déjà dans la maison : « {prop} » ?", { nom: d[0], prop: prop[0][1] })
      : _t("{n} noms de pièce existent déjà dans la maison ({noms}) : ajouter le nom de l'étage ?", { n: d.length, noms: d.join(", ") });
    this.snack(avant ? `${avant} ${txt}` : txt, [[_t("Renommer"), () => this.renommerDoublons(Object.fromEntries(prop))]], 12000);
  }
  // renomme les pièces de l'étage affiché ({ ancien: nouveau }), une étape d'annulation
  renommerDoublons(table) {
    const l = (this.d.pieces || []).filter((p) => Object.hasOwn(table, String(p?.nom ?? "").trim()));
    if (!l.length) return 0;
    this.commit(() => l.forEach((p) => { p.nom = table[String(p.nom).trim()]; }));
    this._rendreEtages();
    return l.length;
  }

  // ---------- la modale ----------
  ouvrirEtages() {
    if (this._voileEtages?.isConnected) return this._focusEtages(null);
    this._fermerMenu?.();
    const { voile, fermer } = this._voile("ed-plein-tel ed-et-voile", null, {
      dessus: true,
      touche: (ev) => {
        const k = ev.key.toLowerCase(), ctrl = ev.ctrlKey || ev.metaKey;
        const texte = ev.composedPath().some((n) => n instanceof HTMLInputElement && n.type === "text");
        if (k === "escape") {
          ev.preventDefault(); ev.stopPropagation();
          const a = this.R.activeElement;
          if (a instanceof HTMLInputElement && a.type === "text" && a.value !== a.defaultValue) a.blur(); // la saisie en cours est gardée
          return this.fermerEtages();
        }
        if (ctrl && (k === "z" || k === "y") && !texte) {
          ev.preventDefault(); ev.stopPropagation();
          if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler();
          this._rendreEtages();
        } else if (k === "tab") this._pieger(ev, voile.querySelector(".ed-dialogue"));
      },
    });
    this._voileEtages = voile;
    this._fermerVoileEtages = fermer;
    voile.addEventListener("click", (ev) => {
      if (ev.target === voile) return this.fermerEtages();
      const b = ev.composedPath().find((n) => n instanceof HTMLElement && n.dataset?.et);
      if (!b || b.disabled) return;
      const id = b.closest("[data-id]")?.dataset.id, a = b.dataset.et;
      ({ fermer: () => this.fermerEtages(), haut: () => this.deplacerEtage(id, 1), bas: () => this.deplacerEtage(id, -1), suppr: () => this.supprimerEtage(id),
        voir: () => { this.changerEtage(id); this._rendreEtages(); }, vide: () => this.ajouterEtage("vide"), murs: () => this.ajouterEtage("murs"), tout: () => this.ajouterEtage("tout") })[a]?.();
    });
    voile.addEventListener("change", (ev) => {
      const t = ev.target, id = t.closest?.("[data-id]")?.dataset.id;
      // modale redessinée une fois le focus parti (Tab vers le champ suivant) : il est retrouvé ensuite
      if (t.dataset?.ch && id != null) {
        this._saisieEtages = true;
        try { this.modifierEtage(id, t.dataset.ch, t.value, false); } finally { this._saisieEtages = false; }
        setTimeout(() => this._rendreEtages(), 0);
      }
      else if (t.dataset?.defaut != null) this.etageParDefaut(t.value || null);
    });
    // Entrée dans un champ : valide la saisie (événement « change ») sans fermer
    voile.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target instanceof HTMLInputElement) { ev.preventDefault(); ev.target.blur(); ev.target.focus(); } });
    this.R.querySelector("ha-card").append(voile);
    this._rendreEtages();
    (voile.querySelector(".ed-et.on [data-ch]") || voile.querySelector('[data-et="vide"]'))?.focus();
  }
  fermerEtages() {
    if (!this._voileEtages) return;
    this._fermerVoileEtages?.();
    this._voileEtages = null;
    this.R.querySelector('[data-a="etages"]')?.focus({ preventScroll: true });
  }
  // id d'étage dans un sélecteur d'attribut entre guillemets (ids sûrs : lettres, chiffres, _ . : -)
  _selId(id) { return String(id).replace(/["\\]/g, "\\$&"); }
  // focus dans la modale : l'élément `sel` s'il existe encore, sinon « Fermer »
  _focusEtages(sel) { const V = this._voileEtages; ((sel && V?.querySelector(sel)) || V?.querySelector("[data-et=fermer]"))?.focus(); }
  // sélecteur de l'élément de la modale qui a le focus (pour le retrouver après l'avoir redessinée)
  _selFocusEtages() {
    const a = this.R.activeElement, V = this._voileEtages;
    if (!a || !V?.contains(a)) return null;
    const id = a.closest("[data-id]")?.dataset.id, x = a.dataset.ch ? `[data-ch="${a.dataset.ch}"]` : a.dataset.et ? `[data-et="${a.dataset.et}"]` : a.dataset.defaut != null ? "[data-defaut]" : null;
    return x && (id != null ? `[data-id="${this._selId(id)}"] ${x}` : x);
  }
  // (re)dessine la modale ouverte : liste du haut vers le bas, ajout au-dessus de l'étage affiché, étage par défaut
  _rendreEtages() {
    const V = this._voileEtages;
    if (!V?.isConnected) return;
    const focus = this._selFocusEtages(), dedans = V.contains(this.R.activeElement) || !this.R.activeElement || this.R.activeElement === document.body;
    const E = this._E, L = E.parEtage(this.d), avec = L[0]?.id != null, actif = this._etageActif();
    const ici = L.find((e) => e.id === actif) || L[0], nomIci = avec ? ici.nom || ici.court : _t("Rez-de-chaussée");
    const compte = (e) => { const c = this._comptesEtage(e); return `${_t("{n} pièce|{n} pièces", { n: c.pieces })} · ${_t("{n} élément|{n} éléments", { n: c.autres })}`; };
    const ligne = (e, rang) => {
      const on = e.id === actif, haut = rang === 0, bas = rang === L.length - 1;
      return `<div class="ed-et${on ? " on" : ""}" role="listitem" data-id="${esc(e.id)}">
        <ha-icon class="ed-et-ic" icon="${esc(e.icone || "mdi:layers-outline")}"></ha-icon>
        <div class="ed-et-champs">
          <div class="ed-champ ed-et-nom"><label>${_t("Nom")}</label><input type="text" data-ch="nom" value="${esc(e.nom || "")}" placeholder="${esc(e.court)}" aria-label="${esc(_t("Nom"))}"></div>
          <div class="ed-champ ed-et-court"><label>${_t("Court")}</label><input type="text" data-ch="court" maxlength="4" value="${esc((this.d.etages.find((x) => x?.id === e.id) || {}).court ?? "")}" placeholder="${esc(e.court)}" aria-label="${esc(_t("Nom court (ascenseur)"))}"></div>
          <div class="ed-champ ed-et-icone"><label>${_t("Icône")}</label><input type="text" data-ch="icone" value="${esc(e.icone || "")}" placeholder="mdi:home-floor-1" aria-label="${esc(_t("Icône"))}"></div>
          <small class="ed-et-info">${on ? `<b>${_t("Affiché")}</b> · ` : ""}${compte(e)}</small>
        </div>
        <div class="ed-et-act">
          ${ibAct("haut", "mdi:arrow-up", _t("Monter"), haut ? "disabled" : "").replace("data-act", "data-et")}
          ${ibAct("bas", "mdi:arrow-down", _t("Descendre"), bas ? "disabled" : "").replace("data-act", "data-et")}
          ${ibAct("voir", "mdi:eye-outline", _t("Afficher cet étage"), on ? "disabled" : "").replace("data-act", "data-et")}
          ${ibAct("suppr", "mdi:delete-outline", _t("Supprimer"), "").replace("data-act", "data-et")}
        </div></div>`;
    };
    // du haut vers le bas : l'étage le plus haut en tête
    const liste = avec ? [...L].reverse().map((e) => ligne(e, L.length - 1 - L.indexOf(e))).join("")
      : `<div class="ed-et on ed-et-seul" role="listitem"><ha-icon class="ed-et-ic" icon="mdi:home-floor-0"></ha-icon><div class="ed-et-champs"><b>${_t("Plan actuel")}</b>
          <small class="ed-et-info">${compte(L[0])}</small><div class="ed-aide">${_t("Ajouter un étage range le plan actuel dans « {nom} ».", { nom: _t("Rez-de-chaussée") })}</div></div></div>`;
    const defaut = avec ? `<div class="ed-champ ed-et-defaut"><label for="ed-et-def">${_t("Étage affiché au chargement")}</label><select id="ed-et-def" data-defaut>
        <option value="">${_t("Le dernier affiché (sinon le premier)")}</option>${[...L].reverse().map((e) => `<option value="${esc(e.id)}" ${this.d.etage_defaut === e.id ? "selected" : ""}>${esc(e.nom || e.court)}</option>`).join("")}</select></div>` : "";
    const ajout = `<section class="ed-et-ajout" aria-labelledby="ed-et-aj"><h3 id="ed-et-aj">${esc(_t("Ajouter un étage au-dessus de « {nom} »", { nom: nomIci }))}</h3>
      <div class="ed-et-choix">
        <button type="button" class="ed-btn tonal" data-et="vide"><ha-icon icon="mdi:plus"></ha-icon>${_t("Vide")}</button>
        <button type="button" class="ed-btn tonal" data-et="murs"><ha-icon icon="mdi:wall"></ha-icon>${_t("Avec les murs extérieurs")}</button>
        <button type="button" class="ed-btn tonal" data-et="tout"><ha-icon icon="mdi:content-copy"></ha-icon>${_t("Copie de cet étage")}</button></div></section>`;
    poserHTML(V, `<div class="ed-dialogue large ed-et-dlg" role="dialog" aria-modal="true" aria-labelledby="ed-et-titre">
      <header><h2 id="ed-et-titre">${_t("Étages")}</h2><div class="ed-aide">${_t("Du haut vers le bas. Renommer ne change pas l'identifiant : les escaliers et l'étage mémorisé restent valides.")}</div></header>
      <div class="ed-cat ed-et-corps"><div class="ed-et-l" role="list" aria-label="${esc(_t("Étages"))}">${liste}</div>${ajout}${defaut}</div>
      <footer><span class="ed-espace"></span><button class="ed-btn plein" data-et="fermer">${_t("Fermer")}</button></footer></div>`);
    if (focus || dedans) this._focusEtages(focus);
  }
} // @assemblage
