// catalogue « Ajouter », modèles, zones, intégrer une pièce, choix d'entité, puces du résumé — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- catalogue et modèles ----------
  ouvrirCatalogue(opt = {}) {
    const d = this.d, mod = (d.modeles || []).filter((m) => !opt.widgets || m.genre === "widget");
    const cat = (m) => (m.genre === "point" ? "appareils" : m.genre === "ouverture" ? "ouvertures" : m.genre === "widget" ? "widgets" : m.genre === "meuble" ? "meubles" : "pieces");
    const apercu = (t) => { const x = MEUBLES()[t]; return apercuObj({ type: t, taille: x.taille, chaises: x.chaises }); };
    // aperçu d'un meuble (catalogue ou modèle, forme personnalisée comprise)
    const apercuObj = (x) => { const [w, h] = (x.taille || MEUBLES()[x.type]?.taille || [60, 60]).map((v) => nbr(v, 60)), c = Math.max(w, h) * 0.62 + 20;
      return `<svg class="ed-apercu" viewBox="${-c} ${-c} ${2 * c} ${2 * c}" aria-hidden="true">${this.carte.constructor.dessinMeuble({ ...x, pos: [0, 0], rotation: 0 })}</svg>`; };
    // tuile : description sur une ligne, détail en infobulle ; widget : flèches ← / → pour le panneau gauche ou droit (Entrée : panneau droit)
    // widgets : génériques (types de base) en tête, puis les prêts à l'emploi ; référence « w<i> » dans cette liste
    const W = [...CATALOGUE.panneaux.map((m) => ({ ...m, cat: "generiques" })), ...PRETS_WIDGETS()], NOMS_CAT = Object.fromEntries(CATS_WIDGETS.map(([c, , t]) => [c, _t(t)]));
    const tuile = (m, ref, c, hors) => `<div class="ed-tuile${m.creer ? " ed-tuile-creer" : ""}" data-m="${ref}" data-cat="${c}"${hors ? ` data-recherche="1"` : ""} data-txt="${esc(sansAccent(`${m.nom} ${m.desc || ""} ${m.detail || ""} ${m.mots || ""} ${m.genre === "widget" && m.cat ? NOMS_CAT[m.cat] || "" : ""}`))}" role="button" tabindex="0"${m.detail ? ` title="${esc(m.detail)}"` : ""}>${ref[0] === "z" ? apercuSZ : m.genre === "meuble" && m.objet && (MEUBLES()[m.type] || m.type === "forme") ? apercuObj({ ...m.objet, type: m.type }) : m.genre === "meuble" && MEUBLES()[m.type] ? apercu(m.type) : `<ha-icon icon="${esc(m.icone || "mdi:shape-outline")}"></ha-icon>`}<b>${esc(m.nom)}</b>${m.desc ? `<small>${esc(m.desc)}</small>` : ""}
      ${ref.startsWith("u") && m.genre === "meuble" && m.type === "forme" ? `<button class="ib modif" data-modif="${ref.slice(1)}" title="${_t("Modifier ce modèle")}" aria-label="${_t("Modifier ce modèle")}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>` : ""}
      ${m.genre === "widget" && opt.cote !== "fiche" && ref !== "W" ? `<span class="cotes"><span data-cote="gauche" title="${_t("Panneau gauche")}" aria-label="${_t("Panneau gauche")}"><ha-icon icon="mdi:arrow-left"></ha-icon></span><span data-cote="droite" title="${_t("Panneau droit")}" aria-label="${_t("Panneau droit")}"><ha-icon icon="mdi:arrow-right"></ha-icon></span></span>` : ""}
      ${ref.startsWith("u") ? `<button class="ib suppr" data-suppr="${ref.slice(1)}" title="${_t("Supprimer ce modèle")}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>` : ""}</div>`;
    const plan = CATALOGUE.plan.map((m, i) => [m, `p${i}`]), ordre = ["zone", "assistant", "outil"];
    const ML = MEUBLES(), cats = [...new Set(Object.values(ML).map((x) => x.cat))];
    const COURT = { espace: _t("Pointillés et un nom"), rect: _t("Objet avec un nom") };
    // meubles personnalisés de « Mes modèles » rangés dans leur catégorie (et non plus dans « Mes modèles ») ; « Créer un meuble » en tête
    const CATS = this.carte.constructor.CATS_MEUBLES, persos = mod.map((m, i) => [m, i]).filter(([m]) => m.genre === "meuble" && m.type === "forme" && CATS[m.cat] && cats.includes(CATS[m.cat]));
    const meubles = cats.map((c, k) => [c, [...(k ? [] : [[{ nom: _t("Créer un meuble"), icone: "mdi:shape-plus-outline", desc: _t("Forme, taille, couleur"), mots: "nouveau meuble personnalise forme", creer: true }, "CM"]]),
      ...Object.entries(ML).filter(([, x]) => x.cat === c).map(([t, x]) => [{ nom: _t(x.nom), desc: x.aide ? COURT[t] || _t(x.aide) : `${x.taille[0]} × ${x.taille[1]} cm`, detail: x.aide && COURT[t] ? _t(x.aide) : "", genre: "meuble", type: t, mots: x.mots }, `m${t}`]),
      ...persos.filter(([m]) => CATS[m.cat] === c).map(([m, i]) => [m, `u${i}`])]]);
    // nom écrit dans la config à la création : langue de l'interface ; mots de recherche français gardés (le nom affiché est aussi cherché)
    const SZ = [[_t("Cuisine"), 300, 200, "plan de travail coin repas"], [_t("Douche"), 90, 90, "salle d eau"], [_t("Coin repas"), 200, 160, "table salle a manger"], [_t("Coin salon"), 300, 250, "canape tv"],
      [_t("Coin bureau"), 160, 120, "travail"], [_t("Dressing"), 200, 150, "placard rangement"], [_t("Buanderie"), 200, 150, "lave linge cellier"], [_t("Entrée"), 150, 150, "hall vestibule"], [_t("Sous-zone"), 200, 150, "zone delimitation espace"]];
    const apercuSZ = `<svg class="ed-apercu" viewBox="-60 -45 120 90" aria-hidden="true"><rect x="-50" y="-35" width="100" height="70" rx="2" class="ed-sz"/></svg>`;
    const sousZones = SZ.map(([nom, w, h, mots], i) => [{ nom, desc: _t("{w} × {h} cm · à tracer", { w, h }), genre: "sous_zone", mots: `sous zone ${mots}` }, `z${i}`]);
    const pieces = plan.filter(([m]) => cat(m) === "pieces").sort((a, b) => ordre.indexOf(a[0].genre) - ordre.indexOf(b[0].genre));
    const pf = opt.cote === "fiche" ? porteurDe(opt) : null, pourFiche = pf && d[GENRES_FICHE[pf.genre]]?.[pf.i];
    const Wi = W.map((m, i) => [m, `w${i}`]);
    // modale « Ajouter un widget » : une section par catégorie ; catalogue général : les génériques, « Tous les widgets » et,
    // seulement pendant une recherche, les prêts à l'emploi
    const sections = opt.widgets ? CATS_WIDGETS.map(([c, , t]) => [c, esc(_t(t)), Wi.filter(([m]) => m.cat === c)])
      : [["pieces", _t("Pièces et tracé"), pieces], ["appareils", _t("Appareils"), plan.filter(([m]) => cat(m) === "appareils")],
        ["ouvertures", _t("Ouvertures"), [[{ nom: _t("Créer une ouverture"), icone: "mdi:plus-box-outline", desc: _t("Type, capteurs, aperçu"), mots: "nouvelle ouverture personnalisee", creer: true }, "CO"], ...plan.filter(([m]) => cat(m) === "ouvertures")]],
        ["meubles", _t("Sous-zones (cuisine, douche…)"), sousZones],
        ...meubles.map(([c, l]) => ["meubles", _t("Meubles · {cat}", { cat: esc(_t(c)) }), l]),
        ["widgets", _t("Widgets des panneaux (maison)"), [...Wi.filter(([m]) => m.cat === "generiques"), [{ nom: _t("Tous les widgets"), icone: "mdi:view-grid-plus-outline", desc: _t("{n} prêts à l'emploi", { n: W.length - CATALOGUE.panneaux.length }), mots: "plus widgets catalogue" }, "W"],
          ...Wi.filter(([m]) => m.cat !== "generiques").map(([m, r]) => [m, r, true])]]];
    const autres = mod.map((m, i) => [m, i]).filter(([m]) => !persos.some(([x]) => x === m));
    if (autres.length) sections.push(["modeles", _t("Mes modèles"), autres.map(([m, i]) => [{ ...m, desc: m.desc || ((dg) => dg && _t(dg))(({ point: _tk("Objet du plan"), ouverture: _tk("Ouverture"), widget: _tk("Widget (panneau ou fiche)") })[m.genre]) }, `u${i}`])]);
    const NOMS_ONGLETS = { pieces: _t("Pièces"), appareils: _t("Appareils"), ouvertures: _t("Ouvertures"), meubles: _t("Meubles"), widgets: _t("Widgets"), modeles: _t("Mes modèles"),
      ...(opt.widgets ? Object.fromEntries(CATS_WIDGETS.map(([c, puce]) => [c, _t(puce)])) : {}) };
    const onglets = [["tous", _t("Tout")], ...new Map(sections.map(([c, t]) => [c, NOMS_ONGLETS[c] || t]))];
    let onglet = opt.onglet && onglets.some(([c]) => c === opt.onglet) ? opt.onglet : opt.widgets ? "tous" : !d.pieces.length ? "pieces" : "tous";
    const ou = opt.widgets ? (pourFiche ? _t("Fiche « {nom} »", { nom: esc(this._nomElement(pf)) }) : opt.piece != null ? _t("Pièce « {nom} »", { nom: esc(d.pieces[opt.piece].nom) }) : "") : "";
    const { voile, fermer } = this._voile(opt.widgets ? "ed-plein-tel" : "", `<div class="ed-dialogue large${opt.widgets ? " ed-cat-widgets" : ""}" role="dialog" aria-modal="true" aria-labelledby="ed-cat-titre"><header>
        ${opt.widgets ? `<div class="ed-titre-ligne"><h2 id="ed-cat-titre">${_t("Ajouter un widget")}</h2><button class="ed-btn tonal" data-creer="1"><ha-icon icon="mdi:plus"></ha-icon>${_t("Créer un widget")}</button></div>${ou ? `<div class="ed-aide ed-ou">${ou}</div>` : ""}` : `<h2 id="ed-cat-titre">${_t("Ajouter")}</h2>`}
        <div class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="search" placeholder="${this._etroit() ? _t("Rechercher…") : opt.widgets ? _t("Rechercher (co2, fuite, serrure…)") : _t("Rechercher (lumière, fenêtre, jauge…)")}" aria-label="${_t("Rechercher")}"></div>
        <div class="ed-filtres ed-cat-filtres${opt.widgets ? " ed-cat-defile" : ""}" role="tablist">${onglets.map(([c, t]) => `<button role="tab" data-onglet="${c}">${esc(t)}</button>`).join("")}</div></header>
      <div class="ed-cat">${sections.map(([c, t, l]) => `<section data-sec="${c}"><h4>${t}</h4><div class="ed-grille">${l.map(([m, ref, hors]) => tuile(m, ref, c, hors)).join("")}</div></section>`).join("")}
        <div class="ed-aide ed-rien" hidden>${_t("Rien ne correspond à cette recherche.")}</div></div>
      <footer>${opt.widgets ? `<button class="ed-btn tonal ed-creer-bas" data-creer="1"><ha-icon icon="mdi:plus"></ha-icon>${_t("Créer un widget")}</button><span class="ed-espace"></span>` : ""}<button class="ed-btn texte" data-fermer="1">${_t("Fermer")}</button></footer></div>`, { echap: () => fermer(), dessus: true });
    const champ = voile.querySelector("input[type=search]");
    const filtrer = () => {
      const q = sansAccent(champ.value.trim());
      let vus = 0;
      voile.querySelectorAll("[data-onglet]").forEach((b) => { b.classList.toggle("on", b.dataset.onglet === onglet); b.setAttribute("aria-selected", b.dataset.onglet === onglet); });
      voile.querySelectorAll("section[data-sec]").forEach((sec) => {
        let n = 0;
        let nom = false;
        sec.querySelectorAll(".ed-tuile").forEach((t) => {
          const ok = (q ? true : (onglet === "tous" || sec.dataset.sec === onglet) && !t.dataset.recherche) && (!q || q.split(/\s+/).every((m) => t.dataset.txt.includes(m))); t.hidden = !ok; n += ok;
          // recherche : les tuiles dont le nom correspond passent devant (et leur section aussi)
          const parNom = ok && !!q && sansAccent(t.querySelector("b")?.textContent || "").includes(q);
          t.style.order = q && !parNom ? 1 : ""; nom ||= parNom;
        });
        sec.hidden = !n; vus += n; sec.style.order = q && !nom ? 1 : "";
      });
      voile.querySelector(".ed-rien").hidden = !!vus;
    };
    champ.oninput = filtrer;
    filtrer();
    this._indiceDefilement(voile.querySelector(".ed-filtres"));
    setTimeout(() => champ.focus(), 30);
    voile.addEventListener("click", (ev) => {
      const chemin = ev.composedPath();
      if (ev.target === voile || chemin.some((n) => n.dataset?.fermer)) return fermer();
      const cr = chemin.find((n) => n.dataset?.creer);
      if (cr) return this.creerWidget({ ...opt, apres: fermer, retour: cr, dessous: voile });
      const mf = chemin.find((n) => n.dataset?.modif);
      if (mf) return this.modifierMeuble({ u: this.d.modeles.indexOf(mod[+mf.dataset.modif]), retour: mf, dessous: voile, apres: fermer });
      const og = chemin.find((n) => n.dataset?.onglet);
      if (og) { onglet = og.dataset.onglet; champ.value = ""; return filtrer(); }
      const sup = chemin.find((n) => n.dataset?.suppr);
      if (sup) { const m = mod[+sup.dataset.suppr]; fermer(); this.commit(() => this.d.modeles.splice(this.d.modeles.indexOf(m), 1)); this.snack(_t("Modèle supprimé.")); return; }
      const el = chemin.find((n) => n.dataset?.m);
      if (!el) return;
      const ref = el.dataset.m;
      if (ref === "CO") return this.creerOuverture({ apres: fermer, retour: el, dessous: voile });
      if (ref === "CM") return this.creerMeuble({ apres: fermer, retour: el, dessous: voile });
      if (ref === "W") { fermer(); return this.ouvrirCatalogue({ widgets: true, cote: chemin.find((n) => n.dataset?.cote)?.dataset.cote || "droite" }); }
      const m = ref[0] === "z" ? sousZones[+ref.slice(1)][0] : ref[0] === "m" ? { genre: "meuble", type: ref.slice(1) } : ref[0] === "u" ? mod[+ref.slice(1)] : ref[0] === "p" ? CATALOGUE.plan[+ref.slice(1)] : W[+ref.slice(1)];
      const cote = chemin.find((n) => n.dataset?.cote)?.dataset.cote || opt.cote || "droite";
      fermer();
      this.utiliserModele(m, cote, opt.piece ?? null, pf);
    });
    voile.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target?.dataset?.m) ev.target.click(); });
  }

  // fiche : porteur { genre, i } (ou numéro d'un meuble, forme d'origine)
  async utiliserModele(m, cote, piece = null, fiche = null) {
    const pf = typeof fiche === "number" ? { genre: "meuble", i: fiche } : fiche, ref = pf ? { [pf.genre]: pf.i } : {};
    const o = clone(m.objet || {});
    if (m.genre === "outil") { this._texteInfos = m.outil === "infos"; return this.choisirOutil(m.outil === "infos" ? "texte" : m.outil); }
    if (m.genre === "zone") return this.importerZone();
    if (m.genre === "assistant") return this.assistantPieces();
    if (m.genre === "sous_zone") {
      this.choisirOutil("rectangle");
      this.sousZoneEnAttente = { nom: m.nom };
      this._aide(matchMedia("(pointer: coarse)").matches ? _t("« {nom} » : touche deux coins opposés (forme en L : outil Pièce, puis coche « Sous-zone »).", { nom: m.nom }) : _t("« {nom} » : clique deux coins opposés (forme en L : outil Pièce, puis coche « Sous-zone »).", { nom: m.nom }));
      return;
    }
    if (m.genre === "meuble") {
      const def = MEUBLES()[m.type] || { nom: m.nom, taille: [60, 60] };
      this.choisirOutil("selection");
      this.aPlacerMeuble = m.objet ? { ...clone(m.objet), type: m.type } : { type: m.type, taille: [...def.taille], ...(def.chaises ? { chaises: def.chaises } : {}), ...(m.type === "espace" ? { nom: _t("Espace") } : {}) };
      // modèle connecté dont l'entité est à choisir à chaque pose : cherchée dans la pièce où il est posé
      this._meublePre = Array.isArray(m.demander) && m.demander.includes("entite") ? { domaine: m.domaine || "", nom: m.nom } : null;
      this.zone.classList.add("dessin");
      this.carte._construire();
      const nomDef = MEUBLES()[m.type] ? _t(def.nom) : def.nom; // nom du catalogue traduit, nom d'un modèle tel quel
      this._aide(matchMedia("(pointer: coarse)").matches ? _t("Touche le plan pour poser « {nom} ».", { nom: nomDef }) : _t("Clique le plan pour poser « {nom} » (Échap pour annuler).", { nom: nomDef }));
      return;
    }
    if (m.genre === "widget") {
      const objs = Array.isArray(m.objets) ? clone(m.objets).filter((w) => w && typeof w === "object") : [o];
      if (!objs.length || (cote === "fiche" && !pf)) return;
      // prêt à l'emploi : entités cherchées dans HA (pièce ou appareil visé d'abord) ; modèle : champs `demander` vidés ;
      // les champs restés vides sont surlignés « à compléter » dans le panneau du widget
      let manquants = new Set();
      if (m.auto && objs.length === 1) manquants = await this._preRemplir(objs[0], m.auto, this._contexteWidget(piece, pf), m.nom);
      if (Array.isArray(m.demander) && objs.length === 1) for (const c of m.demander) if (typeof c === "string") { poserChemin(objs[0], c, c === "entites" || c === "lignes" ? [] : ""); manquants.add(c); }
      this.commit(() => {
        const l = this._wl(cote === "fiche" ? { cote, ...ref } : { cote, piece }, true), i0 = l.length;
        l.push(...objs);
        this.sel = { type: "widget", cote, i: i0, ...(cote === "fiche" ? ref : piece != null ? { piece } : {}) };
      });
      if (manquants.size) { this._aFaire = { cle: cle(this.sel), champs: manquants }; this.editerSelection(); this.snack(_t("« {nom} » ajouté : champs en orange à compléter.", { nom: m.nom })); }
      return;
    }
    if (m.genre === "ouverture") {
      this.choisirOutil("ouverture", true);
      // capteurs : ceux du préréglage, ou ceux qu'un modèle demande à chaque pose (cherchés dans la pièce)
      this.modeleOuverture = o; this.aCompleter = m.aCompleter || (Array.isArray(m.demander) ? m.demander.filter((c) => CRIT_OUV[c]) : null);
      this.chercherOuv = m.chercher || null; this.prefOuv = m.pref || null;
      this.snack(_t("« {nom} » : clique les deux extrémités sur un mur.", { nom: m.nom }));
      return;
    }
    let e = o.entite;
    if (!e) {
      e = await this.choisirEntite({ titre: m.nom, domaine: m.domaine || "", obligatoire: true });
      if (!e) return;
    }
    const base = o.entite ? {} : pointPour(this.hass, e, [0, 0]);
    const pt = { ...base, ...o, entite: e };
    if (pt.valeur === "$entite") pt.valeur = e;
    delete pt.pos;
    this.choisirOutil("selection");
    this.aPlacer = pt; this.aCompleter = m.aCompleter;
    this.zone.classList.add("dessin");
    this.snack(_t("Clique sur le plan pour placer « {nom} ». Échap pour annuler.", { nom: this.carte._nom(e) }));
  }

  choisirZone() {
    return new Promise((fin) => {
      const hass = this.hass, zones = Object.values(hass.areas || {}).sort((a, b) => a.name.localeCompare(b.name, _loc()));
      const liee = (z) => this.d.pieces.find((p) => p.zone === z);
      const { voile } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${_t("Pièce Home Assistant")}</h2>
        <div class="ed-aide">${_t("Ses appareils, capteurs et automatisations seront intégrés d'office.")}</div></header>
        <div class="ed-resultats">${zones.map((z) => { const n = entitesZone(hass, z.area_id).length, p = liee(z.area_id);
          return `<button data-r="${esc(z.area_id)}"><ha-icon icon="${esc(z.icon || "mdi:floor-plan")}"></ha-icon><span class="n"><span>${esc(z.name)}</span><small>${_t("{n} entité|{n} entités", { n })}${p ? _t(" · liée à « {nom} »", { nom: esc(p.nom) }) : ""}</small></span></button>`; }).join("")}</div>
        <footer><button class="ed-btn texte" data-r="">${_t("Annuler")}</button></footer></div>`);
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r != null); if (ev.target === voile || b) { voile.remove(); fin(b?.dataset.r || null); } };
    });
  }

  async importerZone() {
    const z = await this.choisirZone();
    if (!z) return;
    const nom = this.hass.areas?.[z]?.name || z, i = this.d.pieces.findIndex((p) => p.zone === z);
    if (i >= 0) { this.selectionner({ type: "piece", i }); this.snack(_t("« {nom} » est déjà sur le plan : « Intégrer les appareils » complète ce qui manque.", { nom })); return; }
    this.choisirOutil("rectangle");
    this.zoneEnAttente = z;
    this.snack(_t("Dessine « {nom} » : clique un coin puis le coin opposé (outil Pièce libre pour une autre forme).", { nom }), null, null, 8000);
  }

  // places libres dans un contour, pour poser des appareils sans chevauchement
  _placesLibres(poly, n) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pas = Math.max(40, Math.min(80, Math.min(x1 - x0, y1 - y0) / 4));
    const pris = (this.d.points || []).map((p) => p.pos), l = [];
    for (let y = y0 + pas * 0.75; y < y1 && l.length < n; y += pas)
      for (let x = x0 + pas * 0.75; x < x1 && l.length < n; x += pas) {
        const q = [arr(x), arr(y)];
        if (dansPoly(q, poly) && distBord(q, poly) > 25 && pris.every((r) => Math.hypot(r[0] - x, r[1] - y) > pas * 0.7)) { l.push(q); pris.push(q); }
      }
    const c = centre(poly);
    while (l.length < n) l.push([arr(c[0] + (l.length % 5) * 20), arr(c[1] + Math.floor(l.length / 5) * 20)]);
    return l;
  }

  _utilisees() {
    const d = this.d;
    return new Set([...(d.points || []).flatMap((q) => [q.entite, q.valeur, q.actif]), ...(d.ouvertures || []).flatMap((o) => [...contactsOuv(o), o.volet, o.entite]),
      ...(d.meubles || []).flatMap((m) => [m.entite, m.valeur, m.actif])].filter(Boolean));
  }

  _ouverturesAPlacer(pi) {
    const hass = this.hass, deja = this._utilisees(), dc = (e) => hass.states[e]?.attributes.device_class;
    return entitesZone(hass, this.d.pieces[pi]?.zone).filter((e) => !deja.has(e) && (
      (e.startsWith("binary_sensor.") && ["window", "door", "garage_door", "opening"].includes(dc(e))) ||
      (e.startsWith("cover.") && ["shade", "shutter", "blind", "curtain", "window", "door", "garage", "gate"].includes(dc(e)))));
  }

  placerOuverture(e) {
    const s = this.hass.states[e], dc = s?.attributes.device_class, nom = s?.attributes.friendly_name || e;
    const o = e.startsWith("cover.")
      ? (["garage", "gate", "door"].includes(dc) ? { type: "portail", entite: e, nom } : { type: "fenetre", volet: e, nom })
      : { type: ["door", "garage_door"].includes(dc) ? "porte" : "fenetre", contact: e, nom };
    this.choisirOutil("ouverture", true);
    this.modeleOuverture = o; this.aCompleter = null;
    this.snack(_t("« {nom} » : clique ses deux extrémités sur un mur.", { nom }), null, null, 8000);
  }

  _integrerSilencieux(pi) { this._silence = true; try { return this.integrer(pi); } finally { this._silence = false; } }

  integrer(pi) {
    const hass = this.hass, p = this.d.pieces[pi], ents = entitesZone(hass, p.zone), deja = this._utilisees();
    const dom = (e) => e.split(".")[0], dc = (e) => hass.states[e]?.attributes.device_class;
    const temp = ents.find((e) => dom(e) === "sensor" && dc(e) === "temperature"), hum = ents.find((e) => dom(e) === "sensor" && dc(e) === "humidity");
    const parApp = {};
    for (const e of ents) (parApp[hass.entities[e]?.device_id || e] ||= []).push(e);
    const PRIO = ["light", "climate", "media_player", "camera", "vacuum", "fan", "lock", "switch", "binary_sensor"];
    const DETECT = ["motion", "occupancy", "presence", "smoke", "moisture", "gas", "carbon_monoxide"];
    const nouveaux = [];
    for (const l of Object.values(parApp)) {
      if (l.some((e) => deja.has(e))) continue;
      const principal = PRIO.map((d) => l.find((e) => dom(e) === d && (d !== "binary_sensor" || DETECT.includes(dc(e))))).find(Boolean);
      if (!principal) continue;
      const pt = pointPour(hass, principal, [0, 0]);
      const pw = l.find((e) => dom(e) === "sensor" && dc(e) === "power");
      if (dom(principal) === "switch" && pw) Object.assign(pt, { valeur: pw, actif: pw, seuil: 20 });
      if (dom(principal) === "camera") { const mv = l.find((e) => dom(e) === "binary_sensor" && dc(e) === "motion"); if (mv) Object.assign(pt, { actif: mv, alerte: true }); }
      nouveaux.push(pt);
    }
    const places = this._placesLibres(p.poly, nouveaux.length);
    const avaitTemp = !!p.temperature;
    const faire = () => {
      if (temp && !p.temperature) p.temperature = temp;
      if (hum && !p.humidite) p.humidite = hum;
      nouveaux.forEach((pt, k) => { pt.pos = places[k]; (this.d.points ||= []).push(pt); this._rattacher(pt); });
    };
    if (this._silence) { faire(); return nouveaux.length; }
    this.commit(faire);
    const ouv = this._ouverturesAPlacer(pi).length;
    this.snack(`${nouveaux.length ? _t("{n} appareil ajouté|{n} appareils ajoutés", { n: nouveaux.length }) : _t("Aucun nouvel appareil")}${temp && !avaitTemp ? _t(", température reliée") : ""}${ouv ? _t(", {n} ouverture à placer sur les murs (fenêtre d'édition de la pièce)|, {n} ouvertures à placer sur les murs (fenêtre d'édition de la pièce)", { n: ouv }) : ""}.`, null, null, 8000);
  }

  demander(titre, defaut, inter) {
    return new Promise((fin) => {
      const { voile } = this._voile("", `<div class="ed-dialogue" role="dialog" style="width:min(420px,100%)"><header><h2>${esc(titre)}</h2>
        <div class="ed-champ"><label>${_t("Nom")}</label><input type="text" value="${esc(defaut)}"></div>
        ${inter ? `<label class="ed-inter" style="margin-top:12px"><span>${esc(inter)}</span><input type="checkbox"></label>` : ""}</header>
        <footer><button class="ed-btn texte" data-r="0">${_t("Annuler")}</button><button class="ed-btn plein" data-r="1">${_t("Enregistrer")}</button></footer></div>`);
      const champ = voile.querySelector("input[type=text]"), coche = voile.querySelector("input[type=checkbox]");
      const fermer = (ok) => { voile.remove(); fin(ok && champ.value.trim() ? { nom: champ.value.trim(), coche: !!coche?.checked } : null); };
      voile.onclick = (ev) => { const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile) fermer(false); else if (b) fermer(b.dataset.r === "1"); };
      champ.onkeydown = (ev) => { if (ev.key === "Enter") fermer(true); if (ev.key === "Escape") { ev.stopPropagation(); fermer(false); } };
      setTimeout(() => champ.select(), 30);
    });
  }

  async enregistrerModele() {
    const s = this.sel, o = this._objet();
    if (!s || !o) return;
    if (s.type === "meuble") {
      const def = MEUBLES()[o.type], [w, h] = o.taille || def?.taille || [60, 60], lie = !!(o.entite || o.valeur || o.actif || o.fiche);
      const r = await this.demander(_t("Enregistrer comme modèle"), `${o.nom || (def?.nom ? _t(def.nom) : _t("Meuble"))} ${w} × ${h}`, lie ? _t("Garder les entités (sinon le meuble et sa fiche sont à relier à nouveau)") : null);
      if (!r) return;
      let objet = clone(o); delete objet.pos; delete objet.groupe; objet.taille = [w, h];
      if (lie && !r.coche) { objet = sansEntites(objet); if (o.clic) objet.clic = o.clic; }
      this.commit(() => (this.d.modeles ||= []).push({ nom: r.nom, genre: "meuble", type: o.type, desc: `${w} × ${h} cm`, objet }));
      return this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
    }
    const genre = s.type === "widget" ? "widget" : s.type === "ouverture" ? "ouverture" : "point";
    const defaut = o.titre || o.nom || (o.entite ? this.carte._nom(o.entite) : genre === "ouverture" ? _t("Ouverture") : _t("Modèle"));
    const r = await this.demander(_t("Enregistrer comme modèle"), defaut, _t("Garder les entités (sinon elles seront demandées à chaque usage)"));
    if (!r) return;
    let objet = clone(o);
    delete objet.pos; delete objet.seg; delete objet.piece;
    if (!r.coche) {
      const valeurPropre = objet.valeur && objet.valeur === objet.entite;
      objet = sansEntites(objet);
      if (valeurPropre) objet.valeur = "$entite";
    }
    const m = { nom: r.nom, genre, icone: o.icone || (genre === "ouverture" ? (o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door") : "mdi:shape-outline"), objet };
    if (genre === "point" && o.entite) m.domaine = o.entite.split(".")[0];
    // ouverture sans ses entités : ses capteurs seront cherchés dans la pièce à chaque pose
    if (genre === "ouverture" && !r.coche) { const dem = ["contact", "volet", "entite"].filter((c) => o[c]); if (dem.length) m.demander = dem; }
    this.commit(() => (this.d.modeles ||= []).push(m));
    this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
  }

  // ---------- appareils ----------
  choisirEntite({ titre, domaine = "", obligatoire = false } = {}) {
    return new Promise((fin) => {
      const hass = this.hass, deja = new Set([...(this.d.points || []), ...(this.d.meubles || [])].map((p) => p.entite).filter(Boolean));
      let filtre = domaine;
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${esc(titre)}</h2>
        <label class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="text" placeholder="${this._etroit() ? _t("Rechercher…") : _t("Rechercher une entité, une pièce…")}" aria-label="${_t("Rechercher une entité, une pièce…")}" autocomplete="off"></label>
        <div class="ed-filtres">${DOMAINES.map(([d, n]) => `<button data-f="${d}" class="${d === filtre ? "on" : ""}">${_t(n)}</button>`).join("")}</div></header>
        <div class="ed-resultats"></div>
        <footer>${obligatoire ? "" : `<button class="ed-btn texte" data-r="">${_t("Aucune")}</button>`}<button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button></footer></div>`, { echap: () => fermer(null) });
      const champ = voile.querySelector("input"), res = voile.querySelector(".ed-resultats");
      const tous = Object.keys(hass.states).sort();
      const rendre = () => {
        const q = champ.value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const l = [];
        for (const e of tous) {
          if (filtre && !e.startsWith(filtre + ".")) continue;
          const s = hass.states[e], n = String(s.attributes.friendly_name || e);
          const cle = `${e} ${n}`.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          if (q && !q.split(/\s+/).every((m) => cle.includes(m))) continue;
          l.push([e, n, s]);
          if (l.length >= 120) break;
        }
        poserHTML(res, l.length ? l.map(([e, n, s]) => `<button data-r="${esc(e)}" class="${deja.has(e) ? "deja" : ""}"><ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon>
          <span class="n"><span>${esc(n)}</span><small>${esc(e)}${deja.has(e) ? _t(" · déjà sur le plan") : ""}</small></span><span class="etat">${esc(hass.formatEntityState?.(s) ?? s.state)}</span></button>`).join("")
          : `<div class="ed-aide" style="padding:16px">${_t("Aucune entité trouvée.")}</div>`);
      };
      const fermer = (v) => { retirer(); fin(v); };
      voile.addEventListener("click", (ev) => {
        if (ev.target === voile) return fermer(null);
        const b = ev.composedPath().find((n) => n.dataset && (n.dataset.f != null || n.dataset.r != null));
        if (!b) return;
        if (b.dataset.f != null) { filtre = b.dataset.f; voile.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === b)); rendre(); return; }
        fermer(b.dataset.r === "annuler" ? null : b.dataset.r);
      });
      champ.addEventListener("input", rendre);
      champ.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { const b = res.querySelector("button"); if (b) fermer(b.dataset.r); } });
      rendre();
      this._indiceDefilement(voile.querySelector(".ed-filtres"));
      setTimeout(() => champ.focus(), 30);
    });
  }

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

  // glisser-déposer depuis les panneaux d'information : cote / i = destination (i Infinity = à la fin)
  deplacerWidget(src, cote, i) {
    const l = this._wl(src);
    if (!l?.[src.i] || (src.cote === "fiche") !== (cote === "fiche")) return; // une fiche ne s'échange pas par glisser avec les panneaux
    let j = i === Infinity ? null : i;
    if (cote === src.cote && j != null && j > src.i) j--;
    if (cote === src.cote && (j ?? l.length - 1) === src.i) return;
    this.commit(() => {
      const [w] = l.splice(src.i, 1), dest = this._wl({ ...src, cote }, true), k = j == null ? dest.length : Math.min(j, dest.length);
      dest.splice(k, 0, w);
      this.sel = { ...src, cote, i: k };
    });
  }

} // @assemblage
