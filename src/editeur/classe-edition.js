// fenêtre d'édition générique : sélection multiple, onglets des éléments (hors pièce et ouverture) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  _objet() {
    const s = this.sel, d = this.d;
    if (!s) return null;
    if (s.type === "widget") return this._wl(s)?.[s.i] ?? null;
    if (s.type === "puce") return this._puces(true)[s.i] ?? null;
    return { point: d.points, texte: d.textes, piece: d.pieces, ouverture: d.ouvertures, meuble: d.meubles }[s.type]?.[s.i] ?? null;
  }

  // sélection multiple : modale avec les réglages communs (aligner, groupe, masquer) et les actions groupées (grouper, verrou, dupliquer, supprimer)
  _ongletsMulti() {
    const keys = [...this.multi], cnt = {};
    keys.forEach((k) => { const ty = k.split(":")[0]; cnt[ty] = (cnt[ty] || 0) + 1; });
    const NOMS = { point: (n) => _t("{n} appareil|{n} appareils", { n }), texte: (n) => _t("{n} texte|{n} textes", { n }), piece: (n) => _t("{n} pièce|{n} pièces", { n }), mur: (n) => _t("{n} mur|{n} murs", { n }),
      limite: (n) => _t("{n} limite|{n} limites", { n }), ouverture: (n) => _t("{n} ouverture|{n} ouvertures", { n }), meuble: (n) => _t("{n} meuble|{n} meubles", { n }) };
    const NOM1 = { point: _t("appareil"), texte: _t("texte"), piece: _t("pièce"), mur: _t("mur"), limite: _t("limite"), ouverture: _t("ouverture"), meuble: _t("meuble") };
    const pos = keys.filter((k) => /^(point|texte|meuble):/.test(k));
    const nom = (k) => { const m = deCle(k), o = this._elt(k); return m.type === "point" ? (o.nom || this.carte._nom(o.entite)) : m.type === "texte" ? o.t : m.type === "piece" ? o.nom : m.type === "ouverture" ? (o.nom || _t("Ouverture")) : m.type === "meuble" ? (o.nom || (MEUBLES()[o.type] ? _t(MEUBLES()[o.type].nom) : _t("Meuble"))) : m.type === "mur" ? _t("Mur") : _t("Limite"); };
    const ic = { point: "mdi:circle-medium", texte: "mdi:format-text", piece: "mdi:vector-square", mur: "mdi:wall", limite: "mdi:fence", ouverture: "mdi:window-closed-variant", meuble: "mdi:sofa-outline" };
    const g = this._groupeSel(), objs = this._objetsMulti(), tousM = objs.length > 0 && objs.every((o) => o.masque), tousV = objs.length > 0 && objs.every((o) => o.verrouille === true);
    const lv = tousV ? _t("Déverrouiller") : _t("Verrouiller : ni déplacé ni redimensionné à la souris");
    return { icone: `mdi:${g ? "group" : "select-group"}`, titre: `${g ? `${g.nom} · ` : ""}${_t("{n} éléments", { n: keys.length })}`, resume: Object.entries(cnt).map(([ty, n]) => NOMS[ty](n)).join(", "),
      aide: tactile() ? _t("Glisse l'un d'eux pour tout déplacer ; un cadre tracé dans le vide sélectionne plusieurs éléments.") : _t("Glisse l'un d'eux pour tout déplacer, flèches pour ajuster, Ctrl+clic pour ajouter ou retirer."),
      actions: `${g ? `<button class="ed-btn contour" data-act="degrouper" title="${tactile() ? _t("Dégrouper") : _t("Ctrl+Maj+G")}"><ha-icon icon="mdi:ungroup"></ha-icon>${_t("Dégrouper")}</button>`
        : `<button class="ed-btn tonal" data-act="grouper" title="${tactile() ? _t("Se sélectionnent et se déplacent ensemble") : _t("Ctrl+G : se sélectionnent et se déplacent ensemble")}"><ha-icon icon="mdi:group"></ha-icon>${_t("Grouper")}</button>`}
        ${objs.length ? `<button type="button" class="ib ed-verrou${tousV ? " on" : ""}" data-act="verrou" title="${esc(lv)}" aria-label="${esc(lv)}" aria-pressed="${tousV}"><ha-icon icon="mdi:${tousV ? "lock-outline" : "lock-open-variant-outline"}"></ha-icon></button>` : ""}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${pos.length >= 2 ? `<div class="ed-champ"><label>${_t("Aligner (appareils, textes et meubles)")}</label><div class="ed-icones">${[["g", "mdi:align-horizontal-left", _t("À gauche")], ["ch", "mdi:align-horizontal-center", _t("Centrer horizontalement")], ["d", "mdi:align-horizontal-right", _t("À droite")],
        ["h", "mdi:align-vertical-top", _t("En haut")], ["cv", "mdi:align-vertical-center", _t("Centrer verticalement")], ["b", "mdi:align-vertical-bottom", _t("En bas")]].map(([v, i2, ti]) => `<button data-act="aligner:${v}" title="${ti}" aria-label="${ti}"><ha-icon icon="${i2}"></ha-icon></button>`).join("")}
        ${pos.length >= 3 ? `<button data-act="repartir:0" title="${_t("Répartir horizontalement")}" aria-label="${_t("Répartir horizontalement")}"><ha-icon icon="mdi:distribute-horizontal-center"></ha-icon></button><button data-act="repartir:1" title="${_t("Répartir verticalement")}" aria-label="${_t("Répartir verticalement")}"><ha-icon icon="mdi:distribute-vertical-center"></ha-icon></button>` : ""}</div></div>` : ""}
        ${g ? `<div class="ed-champ"><label>${_t("Nom du groupe")}</label><input type="text" data-groupe="${esc(g.id)}" value="${esc(g.nom)}"></div>` : ""}
        ${objs.length ? `<label class="ed-inter"><span>${_t("Masquer en vue")}${bulleI(_t("Visible ici en transparence."))}</span><input type="checkbox" data-act-chk="multi-masque" ${tousM ? "checked" : ""}></label>` : ""}`],
        ["selection", _t("Sélection"), "mdi:format-list-bulleted", `<div class="ed-liste">${keys.map((k) => `<button data-choix="${k}"><ha-icon icon="${ic[k.split(":")[0]]}"></ha-icon><span>${esc(nom(k))}<small>${NOM1[k.split(":")[0]]}</small></span></button>`).join("")}</div>`]] };
  }
  // objets de la sélection multiple qui portent un verrou ou un masque (pas les murs ni les limites)
  _objetsMulti() { return [...this.multi].map((k) => this._elt(k)).filter((o) => o && typeof o === "object" && !Array.isArray(o)); }

  // plus de panneau latéral : chaque élément (et la sélection multiple) s'édite dans sa modale, Calques est une modale ;
  // les modales ouvertes (⚙, Ambiance, édition, Calques) suivent les changements, la barre flottante suit la sélection
  _panneau() {
    if (this._tip && !this._tip.b.closest(".ed-voile")) this._cacherAide();
    this._panneauCalques();
    if (this.vueParametres) this._rendreParametres();
    if (this.vueAmbiance) this._panneauAmbiance();
    if (this.vueEdition) this._rendreEdition();
    this._majBarreFlottante();
    this._panneauBiblio();
  }
  _etroit() { return !!this.R.querySelector("ha-card")?.classList.contains("ed-etroit"); }

  // ---------- onglets des éléments (hors pièce et ouverture) : le contenu de l'ancien panneau, réparti ----------
  _ongletsPoint(o) {
    const dom = o.entite.split(".")[0];
    const icones = [...new Set([o.icone, ...(ICONES[dom] || []), ...ICONES._])].filter(Boolean).slice(0, 12);
    const halo = champCurseur(dom === "light" ? _t("Halo quand elle est allumée") : _t("Halo lumineux"), 'data-k="halo"', 0, 400, 10, +o.halo || 0, o.halo ? `${o.halo} cm` : _t("aucun"));
    return { icone: o.icone || "mdi:circle", titre: o.nom || this.carte._nom(o.entite), resume: o.entite, aide: "",
      actions: `${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser cette pastille (Ajouter › Mes modèles)"))}${ibAct("partager", "mdi:share-variant-outline", _t("Partager (sans tes entités)"))}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champEntite(_t("Entité"), "entite", o.entite, false)}
        ${this._champTexte(_t("Nom affiché (infobulle)"), "nom", o.nom, this.carte._nom(o.entite))}
        <div class="ed-champ"><label>${_t("Icône")}</label><div class="ed-icones">${icones.map((ic) => `<button data-icone="${esc(ic)}" class="${ic === o.icone ? "on" : ""}" title="${esc(ic)}" aria-label="${esc(ic)}"><ha-icon icon="${esc(ic)}"></ha-icon></button>`).join("")}</div>
          <input type="text" data-k="icone" value="${esc(o.icone || "")}" placeholder="mdi:…" aria-label="${_t("Icône")}"></div>
        <div class="ed-champ"><label>${_t("Couleur quand actif")}</label><div class="ed-couleurs">${this._pastilles(o.couleur)}
          <input type="color" data-k="couleur" value="${esc(hexOu(o.couleur, "#f6c445"))}" title="${_t("Autre couleur")}" aria-label="${_t("Autre couleur")}"></div></div>
        ${dom === "light" ? halo : ""}
        ${this._champEntite(_t("Valeur affichée sur la pastille"), "valeur", o.valeur, true)}
        ${this._inter(_t("Clignote quand actif"), "alerte", o.alerte)}
        <label class="ed-inter"><span>${_t("Seulement dans la vue de sa pièce")}${bulleI(_t("Absent du plan entier : il apparaît quand on zoome sur sa pièce. Réglage par défaut : ⚙ Paramètres › Pastilles d'appareils."))}</span><input type="checkbox" data-act-chk="zoom-seul" ${o.zoom_seul ?? this.d.style_pastilles?.zoom_seul ? "checked" : ""}></label>
        ${this._calqueNiveau(o)}`],
        ["avance", _t("Réglages avancés"), "mdi:cog-outline", `<h4>${_t("Quand la pastille est « active » (colorée)")}${bulleI(_t("Par défaut : quand l'entité est allumée, ouverte ou en marche."))}</h4>
        ${this._champEntite(_t("Selon une autre entité"), "actif", o.actif, true)}
        <div class="ed-ligne">${this._champTexte(_t("ou selon l'attribut"), "actif_attribut", o.actif_attribut, _t("ex. hvac_action"))}${this._champNombre(_t("Active au-dessus de"), "seuil", o.seuil, 1, _t("ex. 20 (W)"))}</div>
        <h4>${_t("Valeur affichée")}</h4>
        <div class="ed-ligne trois">${this._champTexte(_t("ou un attribut"), "attribut", o.attribut, _t("option"))}${this._champTexte(_t("Unité"), "unite", o.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, "0")}</div>
        ${dom === "light" ? "" : halo}
        <div class="ed-champ"><label>${_t("Halo limité à la pièce")}</label><select data-k="piece"><option value="">${_t("Automatique (pièce où il est posé)")}</option><option value="-" ${o.piece === false ? "selected" : ""}>${_t("Aucune : halo libre")}</option>${this.d.pieces.map((p) => `<option ${p.nom === o.piece ? "selected" : ""}>${esc(p.nom)}</option>`).join("")}</select></div>
        ${this._champXY(o)}`],
        ["fiche", _t("Fiche"), "mdi:card-text-outline", this._sectionFiche(o, "point")],
        ["animation", _t("Animation"), "mdi:animation-play-outline", this._sectionAnimation(o, this.carte.constructor.evenementPoint(o))]] };
  }
  _ongletsTexte(o) {
    const taille = champCurseur(_t("Taille"), 'data-k="taille"', 0.6, 2.4, 0.05, esc(o.taille || 1), `${fmt(o.taille || 1, 2)}×`);
    const position = this._champXY(o);
    if (!Array.isArray(o.infos)) return { icone: "mdi:format-text", titre: o.t || _t("Texte"), resume: _t("Texte"), aide: "", actions: "",
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(_t("Texte"), "t", o.t)}${taille}${position}${this._calqueNiveau(o)}`]] };
    return { icone: "mdi:card-text-outline", titre: o.t || _t("Zone d'informations"), resume: _t("Zone d'informations"), aide: "", actions: "",
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(_t("Titre"), "t", o.t, _t("sans titre"))}
        <div class="ed-champ"><label>${_t("Style")}</label><select data-k="style"><option value="">${_t("Encadré")}</option><option value="discret" ${o.style === "discret" ? "selected" : ""}>${_t("Discret (sans fond)")}</option></select></div>
        ${taille}${position}${this._calqueNiveau(o)}`],
        ["infos", _t("Entités ({n})", { n: o.infos.length }), "mdi:format-list-bulleted", `${o.infos.map((l, j) => `<div class="ed-al">${this._champEntite(_t("Entité"), `infos.${j}.entite`, l.entite, false)}
          ${this._champTexte(_t("Nom"), `infos.${j}.nom`, l.nom, "auto")}${this._champTexte(_t("Icône"), `infos.${j}.icone`, l.icone, "auto")}
          <div class="ed-ligne trois">${this._champTexte(_t("Attribut"), `infos.${j}.attribut`, l.attribut, _t("état"))}${this._champTexte(_t("Unité"), `infos.${j}.unite`, l.unite, "auto")}${this._champNombre(_t("Décimales"), `infos.${j}.decimales`, l.decimales, 1, "auto")}</div>
          <div class="ed-actions">${j ? ibAct(`info-haut:${j}`, "mdi:arrow-up", _t("Monter")) : ""}<button class="ed-btn danger" data-act="info-suppr:${j}"><ha-icon icon="mdi:delete-outline"></ha-icon>${_t("Retirer")}</button></div></div>`).join("")}
        <div class="ed-actions"><button class="ed-btn tonal" data-act="info-ajout"><ha-icon icon="mdi:plus"></ha-icon>${_t("Entité")}</button></div>`]] };
  }
  _ongletsSegment(s, seg) {
    const mur = s.type === "mur";
    return { icone: mur ? "mdi:wall" : "mdi:fence", titre: mur ? _t("Mur") : _t("Limite"), resume: `${fmt(Math.hypot(seg[2] - seg[0], seg[3] - seg[1]) / 100, 2)} m`, aide: _t("Glisse le trait pour le déplacer, ses extrémités pour l'allonger."),
      sansDupliquer: true, actions: `${ibAct("convertir", "mdi:swap-horizontal", mur ? _t("En limite") : _t("En mur"))}${ibAct("couper", "mdi:content-cut", _t("Couper en deux"))}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `<div class="ed-aide">${_t("Se verrouille avec son calque (Calques).")}</div>
        <div class="ed-ligne">${this._champNombre(_t("x départ"), "seg.0", seg[0], 1)}${this._champNombre(_t("y départ"), "seg.1", seg[1], 1)}</div>
        <div class="ed-ligne">${this._champNombre(_t("x arrivée"), "seg.2", seg[2], 1)}${this._champNombre(_t("y arrivée"), "seg.3", seg[3], 1)}</div>`]] };
  }

} // @assemblage
