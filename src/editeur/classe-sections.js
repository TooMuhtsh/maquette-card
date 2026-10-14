// sections communes des onglets : animation, connecté, interrupteur, clic, fiche — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // section « Animation » d'un élément : remplace celle de l'événement pour cet élément seulement
  _sectionAnimation(o, ev, cle = "animation", titre = _t("Animation")) {
    const C = this.carte.constructor, AN = C.ANIMATIONS, base = C.animDe(this.d, ev, null), a = typeof o[cle] === "string" ? { type: o[cle] } : o[cle] || {};
    return `<details class="ed-avance"${o[cle] ? " open" : ""}><summary>${esc(titre)}${a.type && AN[a.type] ? ` · ${esc(_t(AN[a.type]))}` : ""}</summary>
      <div class="ed-aide">${_t("Par défaut : celle du plan ({anim}).", { anim: esc(_t(AN[base.type]).split(" (")[0]) })}</div>
      <div class="ed-champ"><label>${_t("Type")}</label><select data-k="${cle}.type"><option value="">${_t("Celle du plan")}</option>${Object.entries(AN).map(([k, n]) => `<option value="${esc(k)}" ${a.type === k ? "selected" : ""}>${esc(_t(n))}</option>`).join("")}</select></div>
      <div class="ed-ligne"><div class="ed-champ"><label>${a.couleur ? _t("Couleur") : _t("Couleur (celle de l'élément)")}</label><span class="ed-couleur-anim ed-couleurs">${this._nuancierPalette(a.couleur, `${cle}.couleur`)}<input type="color" data-k="${cle}.couleur" value="${esc(hexOu(a.couleur, "#f4b400"))}">${a.couleur ? `<button class="ib" data-effacer="${cle}.couleur" title="${_t("Couleur de l'élément")}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</span></div>
        ${this._champNombre(_t("Durée d'un cycle (s)"), `${cle}.duree`, a.duree, 0.1, `${base.duree}`)}</div>
      <div class="ed-ligne">${this._champNombre(_t("Intensité (0,2 à 2)"), `${cle}.intensite`, a.intensite, 0.1, "1")}
        ${ev === "meuble" ? `<div class="ed-champ"><label>${_t("Forme de l'onde")}</label><select data-k="${cle}.forme"><option value="">${_t("Cercle")}</option><option value="contour" ${a.forme === "contour" ? "selected" : ""}>${_t("Contour du meuble")}</option></select></div>` : ""}</div></details>`;
  }

  // section « Connecté » d'un meuble : entité, valeur, comportement au toucher, protection, fiche (widgets)
  _sectionConnecte(o, def) {
    const dom = (o.entite || "").split(".")[0], lie = !!(o.entite || o.valeur || o.fiche);
    const defaut = o.fiche ? _t("la fiche") : o.entite || o.valeur ? _t("la fiche HA") : _t("rien");
    let h = `<h4>${_t("Connecté")}${bulleI(_t("S'allume sur le plan et ouvre sa fiche au toucher."))}</h4>
      ${this._champEntite(_t("Entité"), "entite", o.entite, true)}`;
    if (!lie) return h;
    const parType = this.carte.constructor.COULEURS_TYPE?.[o.type];
    h += `${this._champEntite(_t("Valeur affichée sur le meuble"), "valeur", o.valeur, true, "sensor")}
      <div class="ed-champ"><label>${_t("Couleur sur le plan")}</label><div class="ed-couleurs">${this._pastilles(o.couleur)}
          <input type="color" data-k="couleur" value="${esc(hexOu(o.couleur || parType, "#1a73e8"))}" title="${_t("Autre couleur")}">
          ${o.couleur ? `<button class="ed-btn texte" data-effacer="couleur">${parType ? _t("Couleur du type") : _t("Accent du thème")}</button>` : ""}</div></div>
      ${this._interInv(_t("Toujours teinté"), "teinte", o.teinte !== false, _t("Sinon seulement quand il est actif."))}
      ${this._champClic(o, defaut, _t("Rien (pas cliquable)"))}
      ${this._champsInterrupteur(o, dom)}
      <details class="ed-avance" ${o.actif || o.actif_attribut || o.seuil != null || o.unite || o.decimales != null ? "open" : ""}><summary>${_t("Réglages avancés")}</summary>
        <h4>${_t("Quand le meuble est « actif » (contour coloré)")}${bulleI(_t("Par défaut : quand l'entité est allumée, ouverte ou en marche."))}</h4>
        ${this._champEntite(_t("Selon une autre entité"), "actif", o.actif, true)}
        <div class="ed-ligne">${this._champTexte(_t("ou selon l'attribut"), "actif_attribut", o.actif_attribut, _t("ex. hvac_action"))}${this._champNombre(_t("Actif au-dessus de"), "seuil", o.seuil, 1, _t("ex. 5 (W)"))}</div>
        <div class="ed-ligne">${this._champTexte(_t("Unité de la valeur"), "unite", o.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", o.decimales, 1, "0")}</div>
</details>
      ${this._listeFiche(o, "meuble", o.nom || _t(def.nom), _t("Sans widget, la fiche montre l'état et le bouton marche / arrêt."))}`;
    const pastilles = this._pastillesProches(o);
    if (pastilles.length) h += `<div class="ed-champ"><label>${_t("Pastille de la même entité à côté")}</label>${pastilles.map((j) => `<button class="ed-btn tonal" data-act="fusion:${j}" title="${_t("La pastille est retirée, sa valeur, son état actif et sa couleur passent au meuble (Annuler possible)")}"><ha-icon icon="mdi:merge"></ha-icon>${_t("Fusionner avec « {nom} »", { nom: esc(this.d.points[j].nom || this.carte._nom(this.d.points[j].entite)) })}</button>`).join("")}</div>`;
    return h;
  }

  // interrupteur marche / arrêt de l'élément (fiche, vue de la pièce) : protection (pas d'arrêt) et confirmation forcée (`confirm`)
  _champsInterrupteur(o, dom) {
    if (!BASCULES.includes(dom)) return "";
    return `${this._inter(_t("Protégé (sans bouton d'arrêt)"), "protege", o.protege, _t("Pas de bouton d'arrêt dans la fiche (frigo, congélateur…)."))}
      ${this._inter(_t("Toujours demander confirmation"), "confirmer", o.confirmer, _t("Marche et arrêt confirmés avant chaque appel (fiche, vue de la pièce), ex. une porte de garage commandée par un switch."))}`;
  }
  // « Au toucher, en vue » : défaut (texte), fiche, plus d'infos ou rien (libellé selon l'élément)
  _champClic(o, defaut, rien) {
    return `<div class="ed-champ"><label>${_t("Au toucher, en vue")}</label><select data-k="clic"><option value="">${_t("Par défaut ({d})", { d: defaut })}</option>
        ${[["fiche", _t("Ouvrir sa fiche")], ["infos", _t("Ouvrir la fiche HA (plus d'infos)")], ["aucun", rien]].map(([v, n]) => `<option value="${esc(v)}" ${o.clic === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
  }
  // position x / y d'un élément (cm)
  _champXY(o) { return `<div class="ed-ligne">${this._champNombre(_t("x (cm)"), "pos.0", o.pos[0], 1)}${this._champNombre(_t("y (cm)"), "pos.1", o.pos[1], 1)}</div>`; }
  // fiche d'une ouverture ou d'une pastille : comportement au toucher, protection, widgets (mêmes outils que pour un meuble)
  _sectionFiche(o, genre) {
    const e = genre === "ouverture" ? contactsOuv(o)[0] || o.entite : o.entite, dom = (e || "").split(".")[0];
    const defaut = o.fiche ? _t("la fiche") : (genre === "ouverture" ? e || o.volet : o.entite) ? _t("la fiche HA") : _t("rien");
    const titre = o.nom || (e || o.volet ? this.carte._nom(e || o.volet) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture")));
    return `${this._champClic(o, defaut, _t("Rien"))}
      ${this._champsInterrupteur(o, dom)}
      ${this._listeFiche(o, genre, titre, genre === "ouverture" ? _t("Sans widget, la fiche montre l'état du contact (et du volet) ; « commande » pour piloter un volet ou un portail.") : _t("Sans widget, la fiche montre l'état et, pour une lumière ou une prise, le bouton marche / arrêt."))}`;
  }
  // titre, liste des widgets et actions d'une fiche (meuble, ouverture ou pastille sélectionné)
  _listeFiche(o, genre, titreDef, aide) {
    const l = o.fiche?.widgets || [], i = this.sel.i;
    const remplir = genre === "meuble" ? this._entitesAppareil(o.entite).length > 1 : this._proposer(genre, o).widgets.length > 0;
    return `<h4>${_t("Fiche ({n} widget)|Fiche ({n} widgets)", { n: l.length })}${bulleI(`${_t("Mêmes widgets que les panneaux.")} ${aide}`)}</h4>
      ${this._champTexte(_t("Titre de la fiche"), "fiche.titre", o.fiche?.titre, titreDef)}
      ${this._champPlusInfos(o)}
      ${l.length ? `<div class="ed-liste">${l.map((w, j) => `<button data-choix="${cle({ type: "widget", cote: "fiche", i: j, [genre]: i })}"><ha-icon icon="${esc(w.icone || "mdi:view-dashboard-outline")}"></ha-icon><span>${esc(w.titre || typeWidgetEn(w.type))}<small>${esc(typeWidgetEn(w.type))}</small></span></button>`).join("")}</div>` : ""}
      <div class="ed-actions"><button class="ed-btn contour" data-act="fiche-ajouter"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un widget")}</button>
        ${remplir ? `<button class="ed-btn tonal" data-act="fiche-remplir" title="${_t("Widgets proposés d'après les entités du même appareil HA : aperçu, puis validation")}"><ha-icon icon="mdi:auto-fix"></ha-icon>${_t("Remplir depuis l'appareil")}</button>` : ""}
        ${l.length ? `<button class="ed-btn contour" data-act="fiche-modele" title="${_t("Réutilisable pour une autre fiche ou dans un panneau (Ajouter › Mes modèles)")}"><ha-icon icon="mdi:bookmark-plus-outline"></ha-icon>${_t("Fiche en modèle")}</button>` : ""}</div>`;
  }

  // bouton « Plus d'infos » de la fiche (`card.more_info`) : par défaut l'entité de la fiche, une autre entité, une page (chemin ou URL), ou masqué
  _champPlusInfos(o) {
    const pi = o.fiche?.plus_infos, lien = (v) => typeof v === "string" && /^(\/|https?:\/\/)/i.test(v);
    const mode = pi === false ? "masque" : typeof pi === "string" && pi ? (lien(pi) ? "lien" : "entite") : this._modeInfos === cle(this.sel) ? "lien" : "";
    const opts = [["", _t("Par défaut (entité de la fiche)")], ["entite", _t("Une autre entité")], ["lien", _t("Une page (chemin ou URL)")], ["masque", _t("Masqué")]];
    return `<div class="ed-champ"><label>${_t("Bouton « Plus d'infos »")}${bulleI(_t("Ce que fait le bouton ⓘ en haut de la fiche : plus d'infos de HA pour une entité, ou ouverture d'une page (/lovelace/energie, https://…)."))}</label>
        <select data-k="_plus_infos">${opts.map(([v, n]) => `<option value="${esc(v)}" ${mode === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      ${mode === "entite" ? this._champEntite(_t("Entité ouverte"), "fiche.plus_infos", pi, false) : ""}
      ${mode === "lien" ? this._champTexte(_t("Chemin ou URL"), "fiche.plus_infos", lien(pi) ? pi : "", "/lovelace/energie") : ""}`;
  }

} // @assemblage
