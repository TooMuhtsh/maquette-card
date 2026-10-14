// onglets d'un meuble : étage où mène un escalier, fenêtre de toit, onglets de la modale — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // escalier : étage où il mène (`floor`), parmi les autres étages du plan, ou aucun (clé retirée) ; absent sans autre étage
  _champMeneA(o) {
    const ici = this.d.etage_actif?.id, L = this.carte.constructor.ETAGES.parEtage(this.d).filter((e) => e.id != null && e.id !== ici);
    if (!L.length) return "";
    const v = typeof o.etage === "string" ? o.etage : "", opt = (id, nom) => `<option value="${esc(id)}" ${v === id ? "selected" : ""}>${esc(nom)}</option>`;
    return `<div class="ed-champ"><label>${_t("Mène à")}${bulleI(_t("Sur le plan, toucher l'escalier affiche cet étage."))}</label><select data-k="etage">${opt("", _t("aucun"))}
      ${L.map((e) => opt(e.id, e.nom || e.court)).join("")}${v && !L.some((e) => e.id === v) ? opt(v, v) : ""}</select></div>`;
  }

  // fenêtre de toit : pente du toit (0 à 75°), hauteur du bas de la fenêtre (cm), store (`cover`) ou contact ; vides = défauts (40°, 200 cm)
  _champsVelux(o) {
    const V = this.carte.constructor.VELUX, N = (label, k, v, min, max, ph, aide) => `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="number" step="1" min="${min}" max="${max}" data-k="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
    return `<div class="ed-ligne">${N(_t("Pente du toit (°)"), "pente", o.pente, 0, 75, String(V.pente({})), _t("0 = toit plat, jusqu'à 75°. Le bas du rectangle est le bas de la pente."))}
      ${N(_t("Hauteur du bas (cm)"), "hauteur", o.hauteur, 0, 1000, String(V.hauteur({})), _t("Hauteur du bas de la fenêtre au-dessus du sol."))}</div>
      ${this._champEntite(_t("Store ou contact"), "entite", o.entite, true, "cover", _t("Un store (cover) raccourcit la tache de soleil selon sa position ; un contact affiche seulement l'état ouvert."))}`;
  }

  _ongletsMeuble(o) {
    const perso = o.type === "forme", L = MEUBLES(), def = L[o.type] || { nom: perso ? _t("Meuble personnalisé") : _t("Type inconnu ({t})", { t: o.type }), taille: [60, 60] }, [w, h] = o.taille || def.taille, rot = nbr(o.rotation);
    const nomDef = L[o.type] ? _t(def.nom) : def.nom; // nom du catalogue (traduit) ; o.nom est celui de l'utilisateur
    const mode = tactile() ? _t("Glisse-le pour le déplacer (il se colle aux murs proches), tire un coin pour changer sa taille.") : _t("Glisse-le pour le déplacer (il se colle aux murs proches, Alt pour l'en empêcher), tire un coin pour changer sa taille (Maj : proportions gardées).");
    const anim = o.entite || o.valeur || o.fiche ? this._sectionAnimation(o, "meuble", "animation", _t("Animation (actif)")) : "";
    return { icone: "mdi:sofa-outline", titre: o.nom || nomDef, resume: nomDef, aide: def.aide ? `${_t(def.aide)}. ${mode}` : mode,
      actions: `${perso || o.type === "espace" ? "" : ibAct("atelier-meuble", "mdi:shape-outline", _t("Personnaliser la forme (atelier)"))}${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : garder ce meuble à ces dimensions dans « Mes modèles »"))}${ibAct("partager", "mdi:share-variant-outline", _t("Partager (sans tes entités)"))}`,
      onglets: [["general", _t("Général"), "mdi:tune-variant", `${this._champTexte(o.type === "espace" ? _t("Nom affiché") : _t("Nom (infobulle)"), "nom", o.nom, nomDef)}
      ${perso ? `<button type="button" class="ed-btn tonal ed-plein" data-act="atelier-meuble"><ha-icon icon="mdi:shape-outline"></ha-icon>${_t("Modifier la forme")}</button>`
        : `<div class="ed-champ"><label>${_t("Type")}</label><select data-k="type">${Object.entries(L).map(([t, x]) => `<option value="${esc(t)}" ${t === o.type ? "selected" : ""}>${esc(_t(x.cat))} · ${esc(_t(x.nom))}</option>`).join("")}${L[o.type] ? "" : `<option selected value="${esc(o.type)}">${esc(o.type)}</option>`}</select></div>`}
      ${def.rond ? this._champNombre(_t("Diamètre (cm)"), "_diametre", w, 1) : `<div class="ed-ligne">${this._champNombre(_t("Largeur (cm)"), "taille.0", w, 1)}${this._champNombre(_t("Profondeur (cm)"), "taille.1", h, 1)}</div>`}
      ${def.chaises ? this._champNombre(_t("Chaises"), "chaises", o.chaises ?? def.chaises, 1) : ""}
      ${o.type === "escalier" ? this._champMeneA(o) : ""}
      ${o.type === "fenetre_toit" ? this._champsVelux(o) : ""}
      <div class="ed-champ"><label>${_t("Orientation")}</label><div class="ed-icones">
        <button data-act="rot:-15" title="${_t("Tourner de 15° à gauche")}"><ha-icon icon="mdi:rotate-left-variant"></ha-icon></button>
        <button data-act="rot:-90" title="${_t("Tourner de 90° à gauche")}"><ha-icon icon="mdi:rotate-left"></ha-icon></button>
        <button data-act="rot:90" title="${_t("Tourner de 90° à droite")}"><ha-icon icon="mdi:rotate-right"></ha-icon></button>
        <button data-act="rot:15" title="${_t("Tourner de 15° à droite")}"><ha-icon icon="mdi:rotate-right-variant"></ha-icon></button>
        ${def.rond ? "" : `<button data-act="miroir" class="${o.miroir ? "on" : ""}" title="${_t("Miroir (canapé d'angle gauche / droite…)")}"><ha-icon icon="mdi:flip-horizontal"></ha-icon></button>`}
        </div></div>
      <details class="ed-avance"><summary>${_t("Position")}</summary>
      ${this._champNombre(_t("Angle (°, 0 à 359)"), "_angle", rot, 1)}
      ${this._champXY(o)}</details>
      ${this._calqueNiveau(o)}`],
        ["connecte", _t("Connecté"), "mdi:lightning-bolt-outline", this._sectionConnecte(o, def)],
        ...(anim ? [["animation", _t("Animation"), "mdi:animation-play-outline", anim]] : [])] };
  }

} // @assemblage
