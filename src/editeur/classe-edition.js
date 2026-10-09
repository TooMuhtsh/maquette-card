// fenêtre d'édition générique : onglets par type, modale, aperçu, barre flottante — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
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
  }
  _etroit() { return !!this.R.querySelector("ha-card")?.classList.contains("ed-etroit"); }

  // ---------- onglets des éléments (hors pièce et ouverture) : le contenu de l'ancien panneau, réparti ----------
  _ongletsPoint(o) {
    const dom = o.entite.split(".")[0];
    const icones = [...new Set([o.icone, ...(ICONES[dom] || []), ...ICONES._])].filter(Boolean).slice(0, 12);
    const halo = champCurseur(dom === "light" ? _t("Halo quand elle est allumée") : _t("Halo lumineux"), 'data-k="halo"', 0, 400, 10, +o.halo || 0, o.halo ? `${o.halo} cm` : _t("aucun"));
    return { icone: o.icone || "mdi:circle", titre: o.nom || this.carte._nom(o.entite), resume: o.entite, aide: "",
      actions: ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser cette pastille (Ajouter › Mes modèles)")),
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
        <div class="ed-champ"><label>${_t("Halo limité à la pièce")}</label><select data-k="piece"><option value="">${_t("— aucune —")}</option>${this.d.pieces.map((p) => `<option ${p.nom === o.piece ? "selected" : ""}>${esc(p.nom)}</option>`).join("")}</select></div>
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

  // ---------- modale d'édition d'un élément (ou de la sélection multiple) : onglets + aperçu dans sa pièce ----------
  // contenu de la modale : titre, icône, résumé, onglets [id, titre, icône, html] et actions du pied
  _ongletsElement(s, o) {
    if (this.multi.size > 1) return this._ongletsMulti();
    if (s.type === "widget") return this._ongletsWidget(o);
    if (s.type === "puce") return this._ongletsPuce(o);
    if (s.type === "meuble") return this._ongletsMeuble(o);
    if (s.type === "point") return this._ongletsPoint(o);
    if (s.type === "texte") return this._ongletsTexte(o);
    if (s.type === "mur" || s.type === "limite") return this._ongletsSegment(s, o);
    const hass = this.hass, plein = (h) => h.replace(/^\s*<details class="ed-avance"( open)?>/, '<details class="ed-avance ed-plein" open>');
    if (s.type === "piece") {
      const surf = Math.abs(o.poly.reduce((a, p, j) => { const q = o.poly[(j + 1) % o.poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2) / 10000;
      const poignees = tactile() ? _t("Glisse les poignées pour déformer, les points pleins pour ajouter un sommet ; retouche la pièce sélectionnée et glisse pour la déplacer.")
        : _t("Glisse les poignées pour déformer, les points pleins pour ajouter un sommet, double-clic sur une poignée pour la retirer ; reclique la pièce sélectionnée et glisse pour la déplacer.");
      const taille = (() => { const r = rectDe(o.poly); return r ? `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "_largeur", r[2], 1)}${this._champNombre(_t("Hauteur (cm)"), "_hauteur", r[3], 1)}</div>` : ""; })();
      if (o.sous_zone) return { icone: "mdi:selection-drag", titre: o.nom, resume: _t("Sous-zone · {s} m² · {n} sommets", { s: fmt(surf, 1), n: o.poly.length }), aide: `${_t("Contour nommé dans une pièce, sans murs ; en vue, toucher la sous-zone ouvre la pièce qui la contient.")} ${poignees}`,
        onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(_t("Nom"), "nom", o.nom)}${taille}
        ${this._inter(_t("Sous-zone"), "sous_zone", true, _t("Contour pointillé dans une pièce, sans murs (cuisine, douche…)."))}
        ${this._inter(_t("Afficher le nom"), "_etiquette", !!o.etiquette)}${this._calqueNiveau(o)}`]], actions: "" };
      const aPlacer = this._ouverturesAPlacer(s.i);
      return { icone: "mdi:vector-square", titre: o.nom, resume: _t("{s} m² · {n} sommets", { s: fmt(surf, 1), n: o.poly.length }), aide: poignees, actions: "",
        onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(_t("Nom"), "nom", o.nom)}${taille}
        ${this._champEntite(_t("Température"), "temperature", o.temperature, true, "sensor")}
        ${this._champEntite(_t("Humidité"), "humidite", o.humidite, true, "sensor")}
        <details class="ed-avance" ${o.attribut_temperature || o.attribut_humidite || o.clic ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <div class="ed-ligne">${this._champTexte(_t("Attribut température"), "attribut_temperature", o.attribut_temperature, _t("option"))}${this._champTexte(_t("Attribut humidité"), "attribut_humidite", o.attribut_humidite, _t("option"))}</div>
        ${this._champEntite(_t("Au clic, ouvrir"), "clic", o.clic, true)}</details>
        ${this._inter(_t("Extérieur"), "dehors", o.dehors, _t("Sans teinte de température ; la météo s'y dessine."))}
        ${this._inter(_t("Sous-zone"), "sous_zone", o.sous_zone, _t("Contour pointillé dans une pièce, sans murs ni vue propre (cuisine, douche…)."))}
        ${this._interInv(_t("Vue de la pièce au toucher"), "zoom", o.zoom !== false, _t("Zoom sur la pièce ; à décocher pour les extérieurs."))}
        ${this._inter(_t("Afficher l'étiquette"), "_etiquette", !!o.etiquette)}${this._calqueNiveau(o)}`],
        ["ha", _t("Pièce Home Assistant"), "mdi:home-assistant", `${o.zone ? "" : `<div class="ed-aide">${_t("Lier la pièce à HA ajoute ses appareils, ses scènes et ses automatisations à sa vue.")}</div>`}
        <div class="ed-champ"><select data-k="zone" aria-label="${_t("Pièce Home Assistant")}"><option value="">${_t("— aucune —")}</option>${Object.values(hass.areas || {}).sort((a, b) => a.name.localeCompare(b.name, _loc())).map((z) => `<option value="${esc(z.area_id)}" ${z.area_id === o.zone ? "selected" : ""}>${esc(z.name)}${this.d.pieces.some((p, j) => j !== s.i && p.zone === z.area_id) ? ` (${_t("déjà liée")})` : ""}</option>`).join("")}</select></div>
        ${o.zone ? `<div class="ed-actions"><button class="ed-btn tonal" data-act="integrer"><ha-icon icon="mdi:import"></ha-icon>${_t("Intégrer les appareils de la pièce")}</button></div>` : ""}
        ${aPlacer.length ? `<div class="ed-champ"><label>${_t("À placer sur les murs")}</label><div class="ed-liste">${aPlacer.map((e) => `<button data-act="placer-ouv:${esc(e)}"><ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon><span>${esc(hass.states[e].attributes.friendly_name || e)}<small>${esc(e)} · ${_t("clique puis trace-la sur un mur")}</small></span></button>`).join("")}</div></div>` : ""}`],
        ["vue", _t("Vue de la pièce"), "mdi:view-dashboard-outline", `<div class="ed-aide">${_t("Ce qui s'affiche quand on touche la pièce.")}</div>
        ${["gauche", "droite"].map((c) => `<div class="ed-champ"><label>${c === "gauche" ? _t("Panneau gauche") : _t("Panneau droit")}</label><div class="ed-liste">${(o.panneaux?.[c] || []).map((w, j) => `<button data-choix="widget:${c}:${j}:${s.i}"><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(w.titre || typeWidgetEn(w.type))}<small>${esc(typeWidgetEn(w.type))}</small></span></button>`).join("")}</div>
          <button class="ed-btn contour" data-act="ajouter-widget:${c}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un widget")}</button></div>`).join("")}
        ${this._interInv(_t("Boutons automatiques"), "auto_actions", o.auto_actions !== false, _t("Allumer, ouvrir et fermer les lumières et volets de la pièce."))}
        ${this._interInv(_t("Afficher les automatisations liées"), "automatismes", o.automatismes !== false)}
        <div class="ed-champ"><label>${_t("Boutons d'action")}</label>
          <datalist id="ed-services">${SERVICES.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
          ${(o.actions || []).map((a, j) => `<div class="ed-sous"><div class="ed-entete"><span>${_t("Bouton {n}", { n: j + 1 })}</span><button class="ed-btn texte" data-act="retirer:actions:${j}">${_t("Retirer")}</button></div>
            ${this._champTexte(_t("Texte"), `actions.${j}.nom`, a.nom)}${this._champTexte(_t("Icône"), `actions.${j}.icone`, a.icone, "mdi:…")}
            ${this._choixService(`actions.${j}.action`, a.action)}
            <label class="ed-inter"><span>${o.zone ? _t("Cible : toute la pièce") : _t("Cible : toute la pièce (pièce HA à lier)")}</span><input type="checkbox" data-act-chk="cible-piece:${j}" ${a.cible === "piece" ? "checked" : ""}></label>
            ${a.cible === "piece" ? "" : this._champEntite(_t("Cible : entité"), `actions.${j}.cible`, a.cible, true)}
            ${this._inter(_t("Toujours demander confirmation"), `actions.${j}.confirmer`, a.confirmer, _t("Un service sensible (déverrouiller, ouvrir un garage ou un portail, désarmer, lancer un script…) est confirmé dans tous les cas."))}
            <details class="ed-avance" ${a.donnees ? "open" : ""}><summary>${_t("Données de l'action")}</summary>${this._champTexte(_t("Données (JSON)"), `actions.${j}.donnees`, a.donnees ? JSON.stringify(a.donnees) : "", '{"brightness_pct": 30}')}</details></div>`).join("")}
          <button class="ed-btn contour" data-act="ajouter-action"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un bouton")}</button></div>`]] };
    }
    // ouverture
    const dir = (v, ic, t) => `<button data-dehors="${v.join(",")}" class="${(o.dehors || []).join(",") === v.join(",") ? "on" : ""}" title="${t}" aria-label="${t}"><ha-icon icon="${ic}"></ha-icon></button>`;
    const lum = (o.type === "fenetre" && !o.volet_seul) || o.type === "porte", anim = (o.contact || o.entite ? this._sectionAnimation(o, "ouverture", "animation", _t("Animation (ouverte)")) : "") + (o.volet ? this._sectionAnimation(o, "volet", "animation_volet", _t("Animation du volet (en mouvement)")) : "");
    return { icone: o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door", titre: o.nom || _t("Ouverture"),
      resume: `${fmt(Math.hypot(o.seg[2] - o.seg[0], o.seg[3] - o.seg[1]) / 100, 2)} m`, aide: "",
      actions: `${ibAct("atelier-ouv", "mdi:tune-variant", _t("Modifier dans l'atelier (préréglage, capteurs, aperçu)"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser cette ouverture (Ajouter › Mes modèles)"))}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._htmlSuggestions(this._suggestionsOuverture(o, s.i))}
        ${this._champTexte(_t("Nom"), "nom", o.nom, _t("ex. Baie salon"))}
        ${this._champTexte(_t("Baie (vantaux regroupés)"), "baie", o.baie, _t("ex. Baie du séjour"), _t("Même nom sur chaque vantail : une seule fiche."))}
        <div class="ed-champ"><label>${_t("Type")}</label><span class="ed-seg petit">${[["fenetre", _t("Fenêtre")], ["porte", _t("Porte")], ["portail", _t("Portail")]].map(([v, n]) => `<button data-type="${v}" class="${o.type === v ? "on" : ""}">${n}</button>`).join("")}</span></div>
        <div class="ed-ligne"><div class="ed-champ"><label>${_t("Vantaux")}</label><select data-k="battants" data-num="1"><option value="">1</option><option value="2" ${+o.battants === 2 ? "selected" : ""}>2</option></select></div>
          <div class="ed-champ"><label>${_t("Ouverture##battants")}${bulleI(_t("Dessin des battants : côté des gonds vu de l'intérieur, ou coulissant."))}</label><select data-k="ouvrant">${OUVRANTS_ED.map(([v, n]) => `<option value="${esc(v)}" ${(o.ouvrant || "") === v ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div></div>
        ${o.ouvrant === "gauche" || o.ouvrant === "droite" ? this._inter(_t("Ouvre vers l'extérieur"), "vers_dehors", o.vers_dehors) : ""}
        <div class="ed-champ"><label>${_t("Côté extérieur (volet dessiné de ce côté)")}</label><div class="ed-dir">
          <span></span>${dir([0, -1], "mdi:arrow-up", _t("Haut"))}<span></span>${dir([-1, 0], "mdi:arrow-left", _t("Gauche"))}<span></span>${dir([1, 0], "mdi:arrow-right", _t("Droite"))}<span></span>${dir([0, 1], "mdi:arrow-down", _t("Bas"))}<span></span></div></div>
        <details class="ed-avance"><summary>${_t("Position")}</summary>
        <div class="ed-ligne">${this._champNombre(_t("x départ"), "seg.0", o.seg[0], 1)}${this._champNombre(_t("y départ"), "seg.1", o.seg[1], 1)}</div>
        <div class="ed-ligne">${this._champNombre(_t("x arrivée"), "seg.2", o.seg[2], 1)}${this._champNombre(_t("y arrivée"), "seg.3", o.seg[3], 1)}</div></details>
        ${this._calqueNiveau(o)}`],
      ["capteurs", _t("Capteurs"), "mdi:leak", `${this._champsContact(o)}
        ${this._champEntite(_t("Volet"), "volet", o.volet, true, "cover")}
        ${this._champEntite(_t("Ou entité motorisée (portail)"), "entite", o.entite, true, "cover")}
        ${this._inter(_t("Volet seul (pas de trait de fenêtre)"), "volet_seul", o.volet_seul)}`],
      ...(lum ? [["lumiere", _t("Lumière"), "mdi:white-balance-sunny", plein(this._sectionLumiereOuv(o))]] : []),
      ["fiche", _t("Fiche"), "mdi:card-text-outline", this._sectionFiche(o, "ouverture")],
      ...(anim ? [["animation", _t("Animation"), "mdi:animation-play-outline", anim]] : [])] };
  }
  _enModale(s) { return this.multi.size > 1 || (!!s && TYPES_MODALE.has(s.type)); }
  // objet édité : celui de la sélection (mur et limite : leur segment) ; sélection multiple : celui du dernier élément pris
  _objetEd() {
    const s = this.sel;
    if (this.multi.size > 1) return this._objet() || {};
    if (!s) return null;
    if (s.type === "mur" || s.type === "limite") return this._liste(s.type)?.[s.i] ?? null;
    return this._objet();
  }
  // la modale a un retour (← et Échap) : élément ouvert depuis la modale d'un autre, widget d'une pièce ou d'une fiche (vers son porteur)
  _aRetour() {
    const s = this.sel;
    return this.multi.size <= 1 && !!s && ((!!this._retourEd && this._retourEd !== this._edCle) || (s.type === "widget" && (s.piece != null || s.cote === "fiche")));
  }
  _cleEd() { return this.multi.size > 1 ? "multi" : this.sel ? cle(this.sel) : null; }
  // ouvre la modale d'édition de l'élément sélectionné (une seule modale à la fois : ⚙ Paramètres et Ambiance se ferment)
  editerSelection(onglet = null) {
    if (!this._enModale(this.sel) || !this._objetEd()) return;
    if (this.vueParametres) { this._fermerParametres(); this._barre(); }
    if (this.vueAmbiance) { this.vueAmbiance = false; this._fermerAmbiance(); this.carte._construire(); this._barre(); }
    this._fermerMenu?.();
    this._retourEd = null;
    const avant = !!this.vueEdition;
    this.vueEdition = true; this._edCle = this._cleEd(); this._edCachee = false;
    if (onglet) this._ongletEd = onglet;
    // champs « à compléter » (orange) : la modale s'ouvre sur leur onglet
    else if (this._aFaire && this.sel && this._aFaire.cle === cle(this.sel)) this._edCompleter = true;
    this._rendreEdition();
    this._majBarreFlottante();
    if (!avant) (this.R.querySelector(".ed-edit .ed-onglets [aria-selected=true]") || this.R.querySelector(".ed-edit [data-act=ed-fermer]"))?.focus({ preventScroll: true });
  }
  // ferme la modale ; la sélection reste (barre flottante), le focus revient au plan
  fermerEdition() {
    if (!this.vueEdition) return;
    const a = this.R.activeElement;
    if (a instanceof HTMLInputElement && a.type !== "checkbox" && a.type !== "range" && this.R.querySelector(".ed-edit")?.contains(a)) a.blur(); // « change » d'abord : la saisie en cours est gardée
    this.vueEdition = false; this._edCachee = false; this._edCle = null; this._retourEd = null;
    this.R.querySelector(".ed-mvoile.ed-edit")?.remove();
    this._edObs?.disconnect(); this._edObs = null;
    this._edCarte?.remove(); this._edCarte = null; this._edApCle = null;
    // élément ouvert depuis Calques : retour à Calques
    if (this.vueCalques) {
      if (this.sel || this.multi.size) { this.sel = null; this.multi.clear(); this.carte._construire(); }
      this._panneauCalques();
      this.R.querySelector(".ed-cq-modale [data-act=cq-fermer]")?.focus({ preventScroll: true });
      return;
    }
    this._majBarreFlottante();
    this.R.querySelector(".ed-bf [data-bf=modifier]")?.focus({ preventScroll: true });
  }
  ongletEdition(id) {
    const V = this.R.querySelector(".ed-mvoile.ed-edit");
    if (!V || !V.querySelector(`[data-onglet-ed="${id}"]`)) return;
    this._ongletEd = id;
    V.querySelectorAll("[data-onglet-ed]").forEach((b) => { const on = b.dataset.ongletEd === id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    V.querySelectorAll(".ed-mcontenu>section").forEach((p) => { p.hidden = p.dataset.onglet !== id; });
    V.querySelector(".ed-mcontenu").scrollTop = 0;
  }
  _rendreEdition() {
    const s = this.sel, o = this._objetEd();
    // sélection perdue (annuler, suppression) ou changée pendant que la modale était masquée (placement sur le plan) : elle se ferme
    if (!this._enModale(s) || !o || (this._edCachee && this._cleEd() !== this._edCle)) return this.fermerEdition();
    this._edCle = this._cleEd();
    let V = this.R.querySelector(".ed-mvoile.ed-edit");
    // bouton pressé (Fermer, Appliquer, une action) juste après une saisie : la saisie part au « change » et redessine la modale ;
    // le rendu attend le relâchement, sinon le bouton serait remplacé avant son « click » (deux clics nécessaires)
    if (V && this._edPresse) { this._edDiffere = true; return; }
    if (this._tip?.b.closest(".ed-mvoile")) this._cacherAide();
    if (!V) {
      V = this._mvoile("ed-edit");
      V.onpointerdown = (ev) => {
        this._basVoileEd = ev.target === V;
        this._edPresse = true;
        const fin = () => {
          window.removeEventListener("pointerup", fin, true); window.removeEventListener("pointercancel", fin, true);
          setTimeout(() => { this._edPresse = false; if (this._edDiffere) { this._edDiffere = false; if (this.vueEdition) this._rendreEdition(); } });
        };
        window.addEventListener("pointerup", fin, true); window.addEventListener("pointercancel", fin, true);
      };
      V.addEventListener("click", (ev) => {
        if (ev.target === V) { if (this._basVoileEd) this.fermerEdition(); return; }
        const og = ev.composedPath().find((n) => n.dataset?.ongletEd);
        if (og) this.ongletEdition(og.dataset.ongletEd);
      });
      this._clavierModale(V, "ongletEd", (o) => this.ongletEdition(o));
    }
    V.hidden = !!this._edCachee;
    // focus et défilement gardés d'un rendu à l'autre (chaque modification redessine la modale)
    const actif = this.R.activeElement, dans = V.contains(actif), ds = dans ? actif.dataset || {} : {};
    const garde = !dans ? null : ds.k ? `[data-k="${ds.k}"]` : ds.entite ? `[data-entite="${ds.entite}"]` : ds.act ? `[data-act="${ds.act}"]` : ds.actChk ? `[data-act-chk="${ds.actChk}"]` : ds.ongletEd ? `[data-onglet-ed="${ds.ongletEd}"]` : ds.type ? `[data-type="${ds.type}"]` : ds.dehors ? `[data-dehors="${ds.dehors}"]` : null;
    const defile = V.querySelector(".ed-mcontenu")?.scrollTop || 0;
    const E = this._ongletsElement(s, o), l = E.onglets;
    if (this._edCompleter) { this._edCompleter = false; const t = l.find((x) => x[3].includes("a-completer")); if (t) this._ongletEd = t[0]; }
    if (!l.some((x) => x[0] === this._ongletEd)) this._ongletEd = l[0][0];
    const plusieurs = l.length > 1, verrou = this.multi.size <= 1 && o.verrouille === true;
    const retour = this._aRetour() ? `<button class="ib ed-retour" data-act="deselection" title="${_t("Retour à la liste (Échap)")}" aria-label="${_t("Retour à la liste (Échap)")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>` : "";
    poserHTML(V, `<div class="ed-modale ed-modale-elt${E.apercu ? ` ed-ap-${E.apercu}` : ""}" role="dialog" aria-modal="true" aria-labelledby="ed-elt-titre">
      <header>${retour || `<ha-icon icon="${esc(E.icone)}"></ha-icon>`}<div><h2><span id="ed-elt-titre">${esc(E.titre)}</span></h2><div class="ed-version ed-resume">${E.resumeH ?? esc(E.resume)}${verrou ? ` · ${_t("verrouillé")}` : ""}${E.aide ? bulleI(E.aide) : ""}</div></div>
        <button class="ib" data-act="ed-fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcorps">${plusieurs ? this._navOnglets("ed", _t("Réglages"), l, this._ongletEd) : ""}
        <div class="ed-mcontenu ed-medit">${l.map(([id, t, , h]) => `<section ${plusieurs ? `role="tabpanel" id="ed-pan-${id}" aria-labelledby="ed-tab-${id}"` : ""} data-onglet="${id}" tabindex="0" ${id === this._ongletEd ? "" : "hidden"}>${plusieurs ? `<h3 class="ed-mtitre">${esc(t)}</h3>` : ""}${h}</section>`).join("")}</div>
        <aside class="ed-elt-apercu" aria-label="${_t("Aperçu")}"></aside></div>
      <footer class="ed-mpied">${E.sansDupliquer ? "" : ibAct("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${E.actions}<button class="ib danger" data-act="supprimer" title="${_t("Supprimer")}" aria-label="${_t("Supprimer")}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
        <span class="ed-esp"></span><button class="ed-btn plein" data-act="ed-appliquer"><ha-icon icon="mdi:check"></ha-icon>${_t("Appliquer")}</button></footer></div>`);
    this._cablerPanneau(V.querySelector(".ed-modale"));
    const c = V.querySelector(".ed-mcontenu");
    if (c) c.scrollTop = defile;
    this._indiceDefilement?.(V.querySelector(".ed-onglets"));
    this._apercuEdition(V.querySelector(".ed-elt-apercu"));
    if (garde) { try { V.querySelector(garde)?.focus({ preventScroll: true }); } catch (e) { /* sélecteur invalide : focus laissé */ } }
  }
  // aperçu : une carte Maquette (même moteur que le plan) avec la vraie config, recadrée sur la pièce de l'élément, élément mis en évidence ;
  // widget et puce du résumé : l'aperçu est le widget (la puce) lui-même, rendu par la carte
  _apercuEdition(aside) {
    if (!aside) return;
    const s = this.sel, un = this.multi.size <= 1;
    if (un && (s?.type === "widget" || s?.type === "puce")) {
      let h = "";
      if (s.type === "widget") { try { h = this.carte._widget(this._objet(), "apercu", 0); } catch (e) { h = ""; } }
      poserHTML(aside, `<h4 class="ed-ap-titre">${_t("Aperçu")}</h4><div class="ed-ap-w${s.type === "puce" ? " ed-ap-puce" : ""}">${h}</div>`);
      aside.querySelector(".ed-ap-w").inert = true;
      if (s.type === "puce") {
        const c = this.R.querySelector(`.tete .chip[data-puce="${s.i}"]`)?.cloneNode(true);
        if (c) { c.classList.remove("sel"); aside.querySelector(".ed-ap-w").append(c); }
      }
      return;
    }
    if (!this._edCarte) {
      this._edCarte = document.createElement("maquette-card");
      this._edCarte.className = "ed-ap-carte";
      this._edCarte.setAttribute("aria-hidden", "true");
    }
    poserHTML(aside, `<h4 class="ed-ap-titre">${_t("Aperçu")}${bulleI(_t("La pièce de l'élément, telle qu'elle sera en vue ; elle suit chaque réglage."))}</h4><div class="ed-ap-plan"></div>`);
    aside.querySelector(".ed-ap-plan").append(this._edCarte);
    this._majApercuEdition();
  }
  // éléments édités : la sélection multiple ou l'élément seul
  _clesEd() { return this.multi.size > 1 ? [...this.multi] : this.sel ? [cle(this.sel)] : []; }
  // points (cm) qui situent un élément du plan : contour d'une pièce, bouts d'un segment, position d'un appareil, d'un texte, d'un meuble
  _ptsElt(k) {
    const m = deCle(k), d = this.d;
    if (m.type === "piece") return d.pieces[m.i]?.poly || null;
    if (m.type === "ouverture" || m.type === "mur" || m.type === "limite") { const g = m.type === "ouverture" ? d.ouvertures?.[m.i]?.seg : this._liste(m.type)?.[m.i]; return g ? [[g[0], g[1]], [g[2], g[3]]] : null; }
    const o = { point: d.points, texte: d.textes, meuble: d.meubles }[m.type]?.[m.i];
    if (!o?.pos) return null;
    if (m.type !== "meuble") return [o.pos];
    const [w, h] = Array.isArray(o.taille) && o.taille.length === 2 ? o.taille : MEUBLES()[o.type]?.taille || [60, 60], th = (nbr(o.rotation) * Math.PI) / 180;
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const lx = (sx * w) / 2, ly = (sy * h) / 2; return [o.pos[0] + lx * Math.cos(th) - ly * Math.sin(th), o.pos[1] + lx * Math.sin(th) + ly * Math.cos(th)]; });
  }
  // cadre de l'aperçu (cm) : la pièce de l'élément (ouverture : la pièce du côté intérieur ; appareil, texte, meuble : la pièce qui le
  // contient ; mur, limite : autour du trait ; sélection multiple : tous les éléments), avec une marge, aux proportions de l'aperçu
  _cadreEdition() {
    const d = this.d, dans = (pt) => d.pieces.find((p) => !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2 && dansPoly(pt, p.poly)), cles = this._clesEd();
    let pts = [];
    for (const k of cles) {
      const m = deCle(k), q = this._ptsElt(k);
      if (!q) continue;
      if (m.type === "piece" || cles.length > 1) { pts.push(...q); continue; }
      if (m.type === "ouverture") {
        const o = d.ouvertures[m.i], [a, b, c, e] = o.seg, [nx, ny] = o.dehors || [0, 0], mi = [(a + c) / 2, (b + e) / 2];
        const p = dans([mi[0] - nx * 40, mi[1] - ny * 40]) || dans([mi[0] + 40, mi[1]]) || dans([mi[0] - 40, mi[1]]) || dans([mi[0], mi[1] + 40]) || dans([mi[0], mi[1] - 40]);
        pts.push(...(p ? p.poly : [[a - 150, b - 150], [c + 150, e + 150]]), [a, b], [c, e]);
        continue;
      }
      const ctr = [q.reduce((x, p) => x + p[0], 0) / q.length, q.reduce((x, p) => x + p[1], 0) / q.length], p = m.type === "mur" || m.type === "limite" ? null : dans(ctr);
      pts.push(...q, ...(p ? p.poly : [[ctr[0] - 150, ctr[1] - 150], [ctr[0] + 150, ctr[1] + 150]]));
    }
    if (!pts.length) pts = d.pieces.flatMap((p) => p.poly || []);
    if (!pts.length) pts = [[0, 0], [400, 300]];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    let x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0, H = Math.max(...ys) - y0;
    const mg = Math.max(60, 0.12 * Math.max(W, H)), r = this._etroit() ? 2.2 : 1.3;
    x0 -= mg; y0 -= mg; W += 2 * mg; H += 2 * mg;
    if (W / H < r) { const w = H * r; x0 -= (w - W) / 2; W = w; } else { const h = W / r; y0 -= (h - H) / 2; H = h; }
    return { x0, y0, W, H };
  }
  // mise en évidence dans l'aperçu : règles de style (pièces, ouvertures) et formes dessinées par-dessus (le reste)
  _surlignage(box, pr) {
    let css = "", formes = "";
    const f = (v) => Math.round(v * 10) / 10, r = f(Math.max(30, box.W * 0.075)); // autour de la pastille (dessinée par-dessus le plan, ≈ 24 px dans la vignette)
    for (const k of this._clesEd()) {
      const m = deCle(k), q = this._ptsElt(k);
      if (m.type === "piece") css += `.zone svg polygon[data-p="${m.i}"]{fill:color-mix(in srgb,${pr} 22%,transparent)!important;stroke:${pr}!important;stroke-width:4px!important;vector-effect:non-scaling-stroke}`;
      else if (m.type === "ouverture") css += `.zone svg g.ouv[data-o="${m.i}"]{filter:drop-shadow(0 0 3px ${pr}) drop-shadow(0 0 6px ${pr})}.zone svg g.ouv[data-o="${m.i}"] *{stroke:${pr}!important}`;
      else if (!q) continue;
      else if (m.type === "mur" || m.type === "limite") formes += `<line class="seg" x1="${f(q[0][0])}" y1="${f(q[0][1])}" x2="${f(q[1][0])}" y2="${f(q[1][1])}"/>`;
      else if (m.type === "meuble") formes += `<polygon points="${q.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}"/>`;
      else formes += `<circle cx="${f(q[0][0])}" cy="${f(q[0][1])}" r="${r}"/>`;
    }
    return { css, formes };
  }
  _majApercuEdition() {
    const ap = this._edCarte, s = this.sel;
    if (!ap || !ap.isConnected || !this._enModale(s)) return;
    const cfg = clone(this.d);
    for (const k of ["panneaux", "titre", "ambiance", "tablette", "legende_entites"]) delete cfg[k];
    Object.assign(cfg, { id: "apercu-element", marge: 0, plein_ecran: false, edition: false, legende: false, resume: false,
      interaction: { vue_figee: true, clic_piece: "aucun" } });
    const box = this._cadreEdition(), cleAp = JSON.stringify([cfg, box]);
    if (cleAp !== this._edApCle) {
      this._edApCle = cleAp;
      ap._boxFige = box;
      ap.setConfig(this.carte.constructor.versAnglais(cfg));
    }
    if (ap.hass !== this.hass) ap.hass = this.hass;
    // élément mis en évidence : une règle de style dans la carte de l'aperçu (gardée d'un rendu à l'autre) et des formes posées sur son plan
    const R = ap.shadowRoot;
    if (!R) return;
    let st = R.querySelector("style.ed-ap-hl");
    if (!st) { st = document.createElement("style"); st.className = "ed-ap-hl"; R.append(st); }
    const pr = "var(--md-primary,var(--primary-color,#6750a4))", { css, formes } = this._surlignage(box, pr);
    // carte de l'aperçu sans cadre ni marges : le plan remplit la vignette
    st.textContent = "ha-card{padding:0!important;margin:0!important;background:none!important;box-shadow:none!important;border:none!important}.plan{padding:0!important;background:none!important}.zoom,.legende,.tete,.barre{display:none!important}"
      + `g.ed-ap-formes *{fill:color-mix(in srgb,${pr} 14%,transparent);stroke:${pr};stroke-width:3px;vector-effect:non-scaling-stroke;pointer-events:none}g.ed-ap-formes .seg{fill:none;stroke-width:8px;stroke-linecap:round;opacity:.75}` + css;
    // formes redessinées si la carte de l'aperçu reconstruit son plan
    const poser = () => {
      const svg = R.querySelector(".zone svg");
      if (!svg) return;
      let g = svg.querySelector(":scope>g.ed-ap-formes");
      if (!formes) { g?.remove(); return; }
      if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "ed-ap-formes"); svg.append(g); }
      if (g.dataset.f !== formes) { g.dataset.f = formes; poserHTML(g, formes); }
    };
    poser();
    if (this._edObs?.R !== R) { this._edObs?.disconnect(); this._edObs = new MutationObserver(() => this._edPoser?.()); this._edObs.observe(R, { childList: true, subtree: true }); this._edObs.R = R; }
    this._edPoser = poser;
  }

  // ---------- barre flottante (MD3) près de l'élément sélectionné : Modifier, Dupliquer, Verrou, Ordre, Supprimer ----------
  // hors de l'élément (au-dessus, sinon dessous), dans la partie visible du plan ; suit le zoom, le défilement et les modifications
  _majBarreFlottante() {
    const plan = this.R.querySelector(".plan"), svg = this.R.querySelector(".zone svg"), s = this.sel, multi = this.multi.size > 1;
    let b = this.R.querySelector(".ed-bf");
    const o = this._objetEd();
    const montrer = !!o && this._enModale(s) && !this.vueEdition && !this.vueParametres && !this.vueAmbiance && this.outil === "selection" && !this.aPlacer && !this.aPlacerMeuble && !this.trace.length && !!plan && !!svg;
    if (!montrer) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement("div");
      b.className = "ed-bf";
      b.setAttribute("role", "toolbar");
      b.addEventListener("pointerdown", (ev) => ev.stopPropagation());
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const x = ev.composedPath().find((n) => n.dataset?.bf);
        if (!x) return;
        if (x.dataset.bf === "modifier") return this.editerSelection();
        this._action(x.dataset.bf);
      });
    }
    if (b.parentNode !== plan) plan.append(b);
    b.hidden = false;
    b.setAttribute("aria-label", _t("Actions de la sélection"));
    // verrou et ordre : éléments du plan qui en ont (pas les murs, limites, widgets ni puces) ; sélection multiple : verrou de tous
    const objs = multi ? this._objetsMulti() : [], plat = !multi && ["mur", "limite"].includes(s.type), hors = !multi && ["widget", "puce"].includes(s.type);
    const v = multi ? objs.length > 0 && objs.every((x) => x.verrouille === true) : o.verrouille === true, lv = v ? _t("Déverrouiller") : _t("Verrouiller : ni déplacé ni redimensionné à la souris");
    const ib = (a, ic, t, cl = "") => `<button type="button" class="ib${cl}" data-bf="${a}" title="${esc(t)}" aria-label="${esc(t)}"><ha-icon icon="${ic}"></ha-icon></button>`;
    poserHTML(b, `<button type="button" class="ed-btn tonal ed-bf-mod" data-bf="modifier" title="${tactile() ? _t("Modifier") : _t("Modifier (Entrée ou double-clic)")}"><ha-icon icon="mdi:pencil-outline"></ha-icon><span>${_t("Modifier")}</span></button>
      ${plat ? "" : ib("dupliquer", "mdi:content-copy", _t("Dupliquer"))}${plat || hors || (multi && !objs.length) ? "" : ib("verrou", `mdi:${v ? "lock-outline" : "lock-open-variant-outline"}`, lv, v ? " on" : "")}
      ${plat || hors || multi ? "" : `${ib("niveau:haut", "mdi:arrange-bring-to-front", _t("Premier plan"))}${ib("niveau:bas", "mdi:arrange-send-to-back", _t("Arrière-plan"))}`}<span class="ed-bf-sep"></span>${ib("supprimer", "mdi:delete-outline", _t("Supprimer"), " danger")}`);
    b.querySelector('[data-bf="verrou"]')?.setAttribute("aria-pressed", String(v));
    this._placerBarreFlottante();
    // zoom animé ou vue déplacée sans reconstruction : la barre suit le viewBox
    if (this._bfObs?.svg !== svg) {
      this._bfObs?.disconnect();
      this._bfObs = new MutationObserver(() => this._placerBarreFlottante());
      this._bfObs.observe(svg, { attributes: true, attributeFilter: ["viewBox"] });
      this._bfObs.svg = svg;
    }
  }
  // rectangle à l'écran de la sélection (px) : élément rendu (pastille, texte, meuble, widget, puce), sinon ses points (pièce, segment)
  _ecranSel() {
    const svg = this.R.querySelector(".zone svg"), m = svg?.getScreenCTM(), b = [];
    for (const k of this._clesEd()) {
      const s = deCle(k);
      const dom = { widget: ".w.sel", puce: ".tete .chip.sel", point: `.calque>[data-q="${s.i}"]`, texte: `.calque>[data-t="${s.i}"],.calque [data-t="${s.i}"]`, meuble: `.zone svg [data-mb="${s.i}"]` }[s.type];
      const el = dom && this.R.querySelector(dom), r = el?.getBoundingClientRect();
      if (r && (r.width || r.height)) { b.push([r.left, r.top, r.right, r.bottom]); continue; }
      const pts = this._ptsElt(k);
      if (!pts || !m) continue;
      const e = pts.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      b.push([Math.min(...e.map((p) => p[0])), Math.min(...e.map((p) => p[1])), Math.max(...e.map((p) => p[0])), Math.max(...e.map((p) => p[1]))]);
    }
    if (!b.length) return null;
    return { g: Math.min(...b.map((x) => x[0])), h: Math.min(...b.map((x) => x[1])), d: Math.max(...b.map((x) => x[2])), b: Math.max(...b.map((x) => x[3])) };
  }
  _placerBarreFlottante() {
    const b = this.R.querySelector(".ed-bf"), plan = this.R.querySelector(".plan"), zone = this.R.querySelector(".zone"), s = this.sel;
    if (!b || b.hidden || !plan || !zone || !this._enModale(s)) return;
    const ex = this._ecranSel();
    if (!ex) return;
    // partie visible : la zone du plan (widget, puce : la carte), coupée par la fenêtre
    const P = plan.getBoundingClientRect(), Z = (this.multi.size <= 1 && ["widget", "puce"].includes(s.type) ? this.R.querySelector("ha-card") : zone).getBoundingClientRect();
    const vis = { g: Math.max(Z.left, 0), h: Math.max(Z.top, 0), d: Math.min(Z.right, innerWidth), b: Math.min(Z.bottom, innerHeight) };
    const bw = b.offsetWidth, bh = b.offsetHeight, ec = 12, bord = 4;
    const bx = (x) => Math.min(Math.max(x, vis.g + bord), Math.max(vis.g + bord, vis.d - bw - bord)), by = (y) => Math.min(Math.max(y, vis.h + bord), Math.max(vis.h + bord, vis.b - bh - bord));
    const tient = ([x, y]) => x >= vis.g + bord - 0.5 && x + bw <= vis.d - bord + 0.5 && y >= vis.h + bord - 0.5 && y + bh <= vis.b - bord + 0.5;
    const couvre = ([x, y], r) => x < r.d && x + bw > r.g && y < r.b && y + bh > r.h;
    // hors de la sélection, dans la partie visible : au-dessus, dessous, à droite, à gauche (centrée sur la partie visible de la sélection)
    const cx = bx((Math.max(ex.g, vis.g) + Math.min(ex.d, vis.d)) / 2 - bw / 2), cy = by((Math.max(ex.h, vis.h) + Math.min(ex.b, vis.b)) / 2 - bh / 2);
    let pos = [[cx, ex.h - bh - ec], [cx, ex.b + ec], [ex.d + ec, cy], [ex.g - bw - ec, cy]].find((q) => tient(q) && !couvre(q, ex));
    // la sélection occupe toute la partie visible : un coin ou un bord libre qui ne recouvre pas l'élément sous le pointeur
    if (!pos) {
      const g = bx(vis.g), d = bx(vis.d), h = by(vis.h), bas = by(vis.b), sous = this._eltSousPointeur(vis);
      const cand = [[cx, h], [cx, bas], [g, h], [d, h], [g, bas], [d, bas]];
      pos = (sous && cand.find((q) => !couvre(q, sous))) || cand[0];
    }
    b.style.left = `${Math.round(pos[0] - P.left)}px`; b.style.top = `${Math.round(pos[1] - P.top)}px`;
  }
  // rectangle à l'écran (marge comprise) du plus petit élément du plan sous le pointeur (dernière position connue), sinon du pointeur
  // lui-même ; null = pointeur hors de la partie visible. Un élément qui couvre la moitié de la partie visible ne compte pas (pièce de fond)
  _eltSousPointeur(vis) {
    const [x, y] = this._xy || [];
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < vis.g || x > vis.d || y < vis.h || y > vis.b) return null;
    const zone = this.R.querySelector(".zone"), aire = (vis.d - vis.g) * (vis.b - vis.h);
    let q = null, min = Infinity;
    for (const el of this.R.elementsFromPoint?.(x, y) || []) {
      if (!zone?.contains(el) || el.closest?.(".ed-bf")) continue;
      const e = el.getBoundingClientRect(), a = e.width * e.height;
      if (a > 0 && a < aire / 2 && a < min) { min = a; q = e; }
    }
    return { g: Math.min(x - 24, q ? q.left - 8 : x), h: Math.min(y - 24, q ? q.top - 8 : y), d: Math.max(x + 24, q ? q.right + 8 : x), b: Math.max(y + 24, q ? q.bottom + 8 : y) };
  }

} // @assemblage
