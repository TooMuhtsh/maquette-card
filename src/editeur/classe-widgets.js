// onglets des widgets, champs (texte, nombre, entité, icône), _modif, câblage — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  _ongletsWidget(w) {
    for (const cle of ["lignes", "entites"]) if (Array.isArray(w[cle])) w[cle] = w[cle].map((x) => (typeof x === "string" ? { entite: x } : x));
    const NOMS = { tuile: _t("Tuile + courbe"), jauge: _t("Jauge"), entites: _t("Liste d'entités"), tarif: _t("Tarif en direct"), ve: _t("Véhicule électrique"), periodes: _t("Périodes"), separateur: _t("Séparateur"), climat: _t("Climat des pièces"), thermostat: _t("Thermostat"), commande: _t("Commande"), serrure: _t("Serrure") };
    const E = (label, k, dom = "") => this._champEntite(label, k, k.split(".").reduce((x, p) => x?.[p], w), true, dom);
    // où est le widget, en court : « Panneau gauche · 1/3 » (le titre et l'aperçu disent le reste)
    const ou = _t("{ou} · {n}/{total}", { ou: this._ouWidget(), n: this.sel.i + 1, total: this._wl(this.sel).length });
    let tete = [w.icone || "mdi:view-dashboard-outline", w.titre || NOMS[w.type] || _t("Widget")];
    let h = `${this._champTexte(_t("Titre"), "titre", w.titre)}
      ${this._champTexte(_t("Icône"), "icone", w.icone, "mdi:…")}${this._champTexte(_t("Couleur d'accent"), "couleur", w.couleur, "#1a73e8")}
      <div class="ed-couleurs">${this._pastilles(w.couleur)}</div>`;
    const lignes = (cle = "lignes", titre = _t("Lignes")) => `<div class="ed-champ${!(w[cle] || []).length && this._aCompleter(cle) ? " a-completer" : ""}"><label>${titre}${!(w[cle] || []).length && this._aCompleter(cle) ? _t(" · à compléter") : ""}</label>${(w[cle] || []).map((l, j) => `<div class="ed-sous">
        ${this._champEntite("", `${cle}.${j}.entite`, l.entite, false)}
        ${this._champTexte(_t("Nom"), `${cle}.${j}.nom`, l.nom, "auto")}${this._champTexte(_t("Icône"), `${cle}.${j}.icone`, l.icone, "auto")}
        <div class="ed-ligne">${this._champNombre(_t("Décimales"), `${cle}.${j}.decimales`, l.decimales, 1, "auto")}<button class="ed-btn texte" data-act="retirer:${cle}:${j}" style="align-self:end">${_t("Retirer")}</button></div></div>`).join("")}
      <button class="ed-btn contour" data-act="ajouter-ligne:${cle}"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une ligne")}</button></div>`;
    if (w.type === "tuile") h += `${E(_t("Valeur principale"), "entite")}<div class="ed-ligne">${this._champTexte(_t("Unité"), "unite", w.unite, "auto")}${this._champNombre(_t("Décimales"), "decimales", w.decimales, 1, "auto")}</div>
      ${champCurseur(_t("Courbe des dernières heures"), 'data-k="historique" data-suf="h"', 0, 72, 1, +w.historique || 0, w.historique ? `${w.historique} h` : _t("aucune"))}${lignes()}`;
    if (w.type === "jauge") h += `${E(_t("Valeur"), "entite")}<div class="ed-ligne trois">${this._champNombre(_t("Minimum"), "min", w.min, "any", "0")}${this._champNombre(_t("Maximum"), "max", w.max, "any", "100")}${this._champNombre(_t("Décimales"), "decimales", w.decimales, 1, "auto")}</div>
      ${this._champTexte(_t("Unité"), "unite", w.unite, "auto")}
      <details class="ed-avance" ${w.seuils ? "open" : ""}><summary>${_t("Couleur selon la valeur")}</summary>
        <div class="ed-ligne trois">${this._champNombre(_t("Vert dès"), "seuils.vert", w.seuils?.vert, "any", "—")}${this._champNombre(_t("Orange dès"), "seuils.jaune", w.seuils?.jaune, "any", "—")}${this._champNombre(_t("Rouge dès"), "seuils.rouge", w.seuils?.rouge, "any", "—")}</div>
        <div class="ed-aide">${_t("Chaque couleur vaut à partir de sa valeur (ex. CO₂ : 0, 800, 1200).")}</div></details>${lignes()}`;
    // case « Toujours demander confirmation » : widgets qui appellent un service (listes, thermostat, lignes à interrupteur ou « Activer »)
    const agit = (l) => (Array.isArray(l) ? l : []).some((x) => { const d = String((typeof x === "string" ? x : x?.entite) || "").split(".")[0]; return BASCULES.includes(d) || ["scene", "script", "button", "input_button"].includes(d); });
    const confirmer = () => this._inter(_t("Toujours demander confirmation"), "confirmer", w.confirmer === true, _t("Chaque appel de ce widget (interrupteurs, « Activer », consigne) est confirmé. Un service sensible est confirmé dans tous les cas."));
    if (["tuile", "jauge", "tarif", "ve"].includes(w.type) && (w.confirmer === true || agit(w.lignes))) h += confirmer();
    if (w.type === "serrure") h += `${E(_t("Serrure (lock)"), "entite", "lock")}
        <div class="ed-champ"><label>${_t("Confirmer avant d'agir")}</label><select data-k="confirmer">
          <option value="">${_t("Par défaut (déverrouiller, ouvrir)")}</option><option value="oui" ${w.confirmer === true ? "selected" : ""}>${_t("Oui, toujours")}</option></select></div>${lignes()}`;
    if (w.type === "entites") h += `${lignes("entites", _t("Entités"))}${confirmer()}`;
    if (w.type === "thermostat") h += `${E(_t("Thermostat"), "entite", "climate")}${confirmer()}${lignes()}`;
    if (w.type === "climat") {
      const noms = this.d.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite)).map((p) => p.nom), choix = Array.isArray(w.pieces) ? w.pieces : [];
      h += `<div class="ed-champ"><label>${_t("Pièces affichées (aucune cochée = toutes)")}${bulleI(_t("Les pièces viennent du plan (leurs capteurs de température et d'humidité)."))}</label><div class="ed-puces">${noms.map((n, j) => `<button data-act="climat-piece:${j}" class="${choix.includes(n) ? "on" : ""}">${esc(n)}</button>`).join("")}</div></div>
        ${this._interInv(_t("Inclure l'extérieur"), "dehors", w.dehors !== false)}
        ${this._inter(_t("Ligne « Moyenne intérieure » en tête"), "moyenne", w.moyenne)}
        ${this._champNombre(_t("Durée de la tendance (min)"), "duree", w.duree, 5, "30", _t("Tendance = écart avec la valeur d'il y a « Durée » minutes ; flèche plate sous le seuil « stable », alerte au-dessus du seuil « alerte »."))}
        <div class="ed-ligne">${this._champNombre(_t("Stable sous (°C)"), "stable_t", w.stable_t, 0.1, _t("0,3"))}${this._champNombre(_t("Alerte dès (°C)"), "alerte_t", w.alerte_t, 0.1, _t("1,5"))}</div>
        <div class="ed-ligne">${this._champNombre(_t("Stable sous (%)"), "stable_h", w.stable_h, 1, "2")}${this._champNombre(_t("Alerte dès (%)"), "alerte_h", w.alerte_h, 1, "10")}</div>
        <details class="ed-avance"><summary>${_t("Bornes absolues (option)")}</summary>
          <div class="ed-ligne">${this._champNombre(_t("Alerte sous (°C)"), "t_min", w.t_min, 0.5, _t("aucune"))}${this._champNombre(_t("Alerte au-dessus (°C)"), "t_max", w.t_max, 0.5, _t("aucune"))}</div>
          <div class="ed-ligne">${this._champNombre(_t("Alerte sous (%)"), "h_min", w.h_min, 1, _t("aucune"))}${this._champNombre(_t("Alerte au-dessus (%)"), "h_max", w.h_max, 1, _t("aucune"))}</div></details>`;
    }
    if (w.type === "commande") {
      const dc = this.hass.states[w.entite]?.attributes.device_class, defaut = ["garage", "gate", "door"].includes(dc) || !!w.entite?.startsWith("valve.");
      h += `${E(_t("Volet, portail, porte, vanne (cover, valve)"), "entite", "cover")}
        <div class="ed-champ"><label>${_t("Confirmer avant d'agir")}${bulleI(_t("Boutons Ouvrir, Stop et Fermer de cette entité seulement. Par défaut, un garage, un portail ou une porte demande confirmation ; leur ouverture est confirmée dans tous les cas."))}</label><select data-k="confirmer">
          <option value="">${dc ? _t("Par défaut ({v} : {dc})", { v: defaut ? _t("oui") : _t("non"), dc: esc(dc) }) : _t("Par défaut ({d})", { d: defaut ? _t("oui") : _t("non") })}</option><option value="oui" ${w.confirmer === true ? "selected" : ""}>${_t("Oui, toujours")}</option><option value="non" ${w.confirmer === false ? "selected" : ""}>${_t("Non")}</option></select></div>${lignes()}`;
    }
    if (w.type === "tarif") h += `${E(_t("Prix en cours (€/kWh)"), "prix", "sensor")}${E(_t("Période (heures pleines / creuses)"), "periode", "sensor")}${E(_t("Couleur du jour (Tempo)"), "couleur_jour", "sensor")}${E(_t("Couleur de demain (Tempo)"), "couleur_demain", "sensor")}${lignes()}`;
    if (w.type === "ve") h += `${E(_t("Batterie (%)"), "batterie", "sensor")}${E(_t("Autonomie"), "autonomie", "sensor")}${E(_t("Puissance de charge"), "puissance", "sensor")}
      ${this._champNombre(_t("En charge au-dessus de (W)"), "seuil", w.seuil, 1, "50")}${E(_t("Câble branché"), "branche")}${E(_t("Énergie de la session"), "session_kwh", "sensor")}${E(_t("Coût de la session"), "session_cout", "sensor")}${lignes()}`;
    if (w.type === "periodes") {
      const per = w.periodes || ["jour", "semaine", "mois", "annee"];
      h += `<div class="ed-champ"><label>${_t("Lignes du tableau")}</label><div class="ed-puces">${[["jour", _t("Aujourd'hui")], ["semaine", _t("Semaine")], ["mois", _t("Mois")], ["annee", _t("Année")]].map(([p, n]) => `<button data-act="periode:${p}" class="${per.includes(p) ? "on" : ""}">${n}</button>`).join("")}</div></div>
        <div class="ed-champ"><label>${_t("Colonnes")}</label>${(w.colonnes || []).map((c, j) => {
          const stat = c.source === "stat" || (c.source == null && c.stat);
          return `<div class="ed-sous"><div class="ed-entete"><span>${_t("Colonne {n}", { n: j + 1 })}</span><button class="ed-btn texte" data-act="retirer:colonnes:${j}">${_t("Retirer")}</button></div>
            <div class="ed-ligne trois">${this._champTexte(_t("Nom"), `colonnes.${j}.nom`, c.nom)}${this._champTexte(_t("Unité"), `colonnes.${j}.unite`, c.unite)}${this._champNombre(_t("Décimales"), `colonnes.${j}.decimales`, c.decimales, 1, "2")}</div>
            <div class="ed-puces"><button data-act="source:${j}:stat" class="${stat ? "on" : ""}">${_t("Depuis l'historique")}</button><button data-act="source:${j}:entites" class="${stat ? "" : "on"}">${_t("4 compteurs")}</button></div>
            ${stat ? `${this._champEntite(_t("Compteur cumulatif (statistique HA)"), `colonnes.${j}.stat`, c.stat, true, "sensor")}${this._champNombre(_t("Multiplier par"), `colonnes.${j}.facteur`, c.facteur, 0.001, _t("1 (0,001 : Wh → kWh)"))}`
              : `${["jour", "semaine", "mois", "annee"].map((p) => this._champEntite({ jour: _t("Aujourd'hui"), semaine: _t("Semaine"), mois: _t("Mois"), annee: _t("Année") }[p], `colonnes.${j}.${p}`, c[p], true, "sensor")).join("")}${this._champNombre(_t("Multiplier par"), `colonnes.${j}.facteur`, c.facteur, 0.001, _t("1 (0,001 : Wh → kWh)"))}`}</div>`;
        }).join("")}<button class="ed-btn contour" data-act="ajouter-colonne"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter une colonne")}</button></div>
        ${this._champTexte(_t("Note sous le tableau"), "note", w.note)}`;
    }
    if (w.type === "separateur") tete = ["mdi:minus", w.titre || _t("Séparateur")], h = `${this._champTexte(_t("Titre de section (option)"), "titre", w.titre, _t("sans titre : simple trait"))}${this._champNombre(_t("Espace au-dessus et au-dessous (px)"), "espace", w.espace, 1, "0")}`;
    const n = this._wl(this.sel).length;
    return { icone: tete[0], titre: tete[1], resumeH: ou, aide: "", apercu: "widget", onglets: [["general", _t("Général"), "mdi:tune-variant", h]],
      actions: `${ibAct("w-monter", "mdi:arrow-up", _t("Monter"), this.sel.i ? "" : "disabled")}${ibAct("w-descendre", "mdi:arrow-down", _t("Descendre"), this.sel.i < n - 1 ? "" : "disabled")}
      ${this.sel.cote === "fiche" ? "" : ibAct("w-cote", this.sel.cote === "gauche" ? "mdi:arrow-right" : "mdi:arrow-left", this.sel.cote === "gauche" ? _t("Vers le panneau droit") : _t("Vers le panneau gauche"))}
      ${ibAct("modele", "mdi:bookmark-plus-outline", _t("Modèle : réutiliser ce widget (Ajouter › Mes modèles)"))}` };
  }

  // où est le widget sélectionné, en court (texte déjà échappé) : « Panneau gauche », « Panneau droit · Séjour », « Fiche · Borne »
  _ouWidget() {
    const s = this.sel, pf = s.cote === "fiche" ? porteurDe(s) : null;
    if (pf) return _t("Fiche · {nom}", { nom: esc(this._nomElement(pf)) });
    const cote = s.cote === "gauche" ? _t("Panneau gauche") : _t("Panneau droit");
    return s.piece != null ? `${cote} · ${esc(this.d.pieces[s.piece].nom)}` : cote;
  }

  // nom d'un élément porteur de fiche (non échappé)
  _nomElement(pf) {
    const o = this.d[GENRES_FICHE[pf.genre]]?.[pf.i];
    if (pf.genre === "meuble") return o?.nom || (MEUBLES()[o?.type] ? _t(MEUBLES()[o.type].nom) : _t("Meuble"));
    if (pf.genre === "ouverture") { const e = contactsOuv(o)[0] || o?.entite || o?.volet; return o?.nom || (e ? this.carte._nom(e) : _t("Ouverture")); }
    return o?.nom || this.carte._nom(o?.entite) || _t("Appareil");
  }

  // action HA : liste des services de l'installation (noms lisibles), sinon saisie libre
  _choixService(k, v) {
    const sv = this.hass.services;
    if (!sv || !Object.keys(sv).length) return `<div class="ed-champ"><label>${_t("Action (domaine.service)")}</label><input type="text" list="ed-services" data-k="${k}" value="${esc(v || "")}" placeholder="light.turn_off"></div>`;
    const doms = Object.keys(sv).sort(), courants = SERVICES.filter((x) => sv[x.split(".")[0]]?.[x.split(".")[1]]);
    const opt = (id) => { const [d, n] = id.split("."), nom = sv[d]?.[n]?.name; return `<option value="${esc(id)}" ${id === v ? "selected" : ""}>${esc(nom ? `${nom} (${id})` : id)}</option>`; };
    return `<div class="ed-champ"><label>${_t("Action")}</label><select data-k="${k}"><option value="">${_t("— choisir —")}</option>
      ${v && !sv[v.split(".")[0]]?.[v.split(".")[1]] ? `<option value="${esc(v)}" selected>${_t("{v} (introuvable)", { v: esc(v) })}</option>` : ""}
      <optgroup label="${_t("Courantes")}">${courants.map(opt).join("")}</optgroup>
      ${doms.map((d) => `<optgroup label="${esc(d)}">${Object.keys(sv[d]).sort().map((n) => opt(`${d}.${n}`)).join("")}</optgroup>`).join("")}</select></div>`;
  }

  // champs des panneaux ; aide : texte (traduit) d'une bulle ⓘ après le libellé
  _champTexte(label, k, v, ph = "", aide = "") {
    return `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="text" data-k="${k}" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
  }
  // repli « Lumière » d'une fenêtre ou d'une porte : vitrage d'une porte (pleine, vitrée sur toute la hauteur, petite vitre en haut),
  // allège et haut du vitrage (vide = auto), avancée de toit au-dessus (profondeur, hauteur au-dessus du haut)
  _sectionLumiereOuv(o) {
    const vt = o.type === "porte" ? (o.vitree === true ? "toute" : o.vitree || "") : "fenetre", larg = Math.hypot(o.seg[2] - o.seg[0], o.seg[3] - o.seg[1]);
    const ouvert = o.allege != null || o.hauteur != null || o.avancee != null || !!o.lames || (o.type === "porte" && !!vt);
    // lames du volet (`lames`) : pleines = volet de base (défaut), orientables = selon l'inclinaison du volet, ajourées = filets volet fermé
    const lames = o.volet ? `<div class="ed-champ"><label>${_t("Lames du volet")}${bulleI(_t("Orientables : la lumière passe selon l'inclinaison du volet (current_tilt_position). Ajourées : un volet fermé laisse passer des filets de lumière."))}</label><select data-k="lames">${[["", _t("Pleines (volet de base)")], ["orientables", _t("Orientables")], ["ajourees", _t("Ajourées")]].map(([v, n]) => `<option value="${v}" ${(o.lames || "") === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>` : "";
    const choix = o.type === "porte" ? `<div class="ed-champ"><label>${_t("Vitrage de la porte")}${bulleI(_t("Une porte vitrée laisse entrer la lumière du jour, comme une fenêtre ; son volet est pris en compte."))}</label><select data-k="vitree">${[["", _t("Porte pleine")], ["toute", _t("Vitrée sur toute la hauteur")], ["haut", _t("Petite vitre en haut")]].map(([v, n]) => `<option value="${v}" ${vt === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>` : "";
    if (o.type === "porte" && !vt) return `<details class="ed-avance"${ouvert ? " open" : ""}><summary>${_t("Lumière")}</summary>${choix}</details>`;
    const [bas, haut] = vt === "haut" ? ["150", "200"] : vt === "toute" || larg >= 180 ? ["0", "215"] : ["90", "215"];
    return `<details class="ed-avance"${ouvert ? " open" : ""}><summary>${_t("Lumière")}</summary>${choix}${lames}
      <div class="ed-aide">${o.type === "porte" ? _t("Vide = auto : 0 à 215 cm, ou 150 à 200 cm pour une petite vitre.") : _t("Vide = auto : 90 cm, ou 0 dès 1,80 m de baie.")}</div>
      <div class="ed-ligne">${this._champNombre(_t("Allège (cm)"), "allege", o.allege, 1, bas, _t("Hauteur du bas du vitrage ; 0 = jusqu'au sol."))}${this._champNombre(_t("Haut (cm)"), "hauteur", o.hauteur, 1, haut, _t("Hauteur du haut du vitrage."))}</div>
      <div class="ed-ligne">${this._champNombre(_t("Avancée de toit (cm)"), "avancee", o.avancee, 1, "0", _t("Profondeur de l'avancée au-dessus : elle coupe le soleil haut (été) et laisse passer le soleil bas (hiver)."))}${this._champNombre(_t("Au-dessus du haut (cm)"), "avancee_hauteur", o.avancee_hauteur, 1, "0", _t("Hauteur de l'avancée au-dessus du haut du vitrage."))}</div></details>`;
  }

  _champNombre(label, k, v, step = 1, ph = "", aide = "") {
    return `<div class="ed-champ"><label>${esc(label)}${bulleI(aide)}</label><input type="number" step="${esc(step)}" data-k="${k}" data-num="1" value="${esc(v ?? "")}" placeholder="${esc(ph)}"></div>`;
  }
  _interInv(label, k, v, aide = "") {
    return `<label class="ed-inter"><span>${esc(label)}${bulleI(aide)}</span><input type="checkbox" data-k="!${k}" ${v ? "checked" : ""}></label>`;
  }
  _inter(label, k, v, aide = "") {
    return `<label class="ed-inter"><span>${esc(label)}${bulleI(aide)}</span><input type="checkbox" data-k="${k}" ${v ? "checked" : ""}></label>`;
  }
  // champs laissés à compléter après un objet du catalogue (ex. contact d'une fenêtre) : surlignés tant qu'ils sont vides
  _aCompleter(k) { return !!this._aFaire && this.sel && this._aFaire.cle === cle(this.sel) && this._aFaire.champs.has(k); }

  // contact(s) d'une ouverture : un champ par capteur (ouverte dès que l'un l'est), « Ajouter un capteur » jusqu'à 8
  _champsContact(o) {
    const l = contactsOuv(o);
    const champs = l.length > 1 ? l.map((e, j) => this._champEntite(j ? "" : _t("Contacts (ouverte dès que l'un l'est)"), `contact.${j}`, e, true, "binary_sensor")).join("")
      : this._champEntite(_t("Contact (ouvert / fermé)"), "contact", l[0], true, "binary_sensor");
    return champs + (l.length && l.length < 8 ? `<button class="ed-btn texte ed-ajout-contact" data-entite="contact.${l.length}" data-dom="binary_sensor"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter un capteur")}</button>` : "");
  }
  _champEntite(label, k, v, effacable, domaine = "", aide = "") {
    const s = v && this.hass.states[v], af = !v && this._aCompleter(k);
    return `<div class="ed-champ${af ? " a-completer" : ""}"><label>${esc(label)}${af ? _t(" · à compléter") : ""}${bulleI(aide)}</label><button class="ed-entite" data-entite="${k}" data-dom="${domaine}">
      ${v ? `<ha-icon icon="${esc(iconeEntite(this.hass, v))}"></ha-icon><span class="n">${esc(s ? s.attributes.friendly_name || v : v)}<small>${esc(v)}${s ? ` · ${esc(this.hass.formatEntityState?.(s) ?? s.state)}` : _t(" · introuvable")}</small></span>` : `<span class="n vide">${_t("Choisir…")}</span>`}
      ${v && effacable ? `<span class="ib x" data-effacer="${k}" title="${_t("Retirer")}"><ha-icon icon="mdi:close"></ha-icon></span>` : ""}</button></div>`;
  }

  _modif(k, v) {
    const s = this.sel;
    if (!s) return;
    if (k === "_plus_infos") {
      const o = this._objet();
      if (!o) return;
      this._modeInfos = v === "lien" ? cle(s) : null;
      if (v === "entite") return this.choisirEntite({ titre: _t("Bouton « Plus d'infos »"), obligatoire: true }).then((e) => (e ? this.commit(() => { (o.fiche ||= {}).plus_infos = e; }) : this._panneau()));
      return this.commit(() => { if (v === "masque") (o.fiche ||= {}).plus_infos = false; else if (o.fiche) delete o.fiche.plus_infos; this._nettoyerFiche(o); });
    }
    if (s.type === "meuble" && /^taille\.[01]$/.test(k)) {
      // la taille peut être absente (taille du catalogue) : on la matérialise avant d'en changer une dimension
      // mêmes bornes que la lecture de la config (5 à 5000 cm) : une valeur hors bornes est refusée, jamais corrigée en silence
      if (!(+v >= 5 && +v <= 5000)) { this.snack(k.endsWith("0") ? _t("Largeur refusée : un meuble mesure de 5 à 5000 cm de côté.") : _t("Profondeur refusée : un meuble mesure de 5 à 5000 cm de côté.")); return this._panneau(); }
      const m = this._objet(), base = Array.isArray(m.taille) && m.taille.length === 2 ? m.taille : MEUBLES()[m.type]?.taille || [60, 60];
      return this.commit(() => { m.taille = [...base]; m.taille[+k.slice(-1)] = +v; });
    }
    if (s.type === "meuble" && k === "_angle") return this.commit(() => { const m = this._objet(), a = ((Math.round(+v || 0) % 360) + 360) % 360; if (a) m.rotation = a; else delete m.rotation; });
    if (s.type === "meuble" && k === "chaises") return this.commit(() => { this._objet().chaises = Math.max(0, Math.min(12, Math.round(+v) || 0)); });
    if (s.type === "meuble" && (k === "_diametre" || k === "type")) {
      const m = this._objet(), def = MEUBLES()[k === "type" ? v : m.type];
      if (k === "_diametre") { if (!(+v >= 5 && +v <= 5000)) { this.snack(_t("Diamètre refusé : un meuble mesure de 5 à 5000 cm de côté.")); return this._panneau(); } return this.commit(() => { m.taille = [+v, +v]; }); }
      return this.commit(() => { m.type = v; if (def) { m.taille = [...def.taille]; if (def.chaises) m.chaises = def.chaises; else delete m.chaises; } });
    }
    if (s.type === "piece" && (k === "_largeur" || k === "_hauteur")) {
      const r = rectDe(this.d.pieces[s.i].poly);
      if (!(+v > 0)) { this.snack(_t("La largeur et la hauteur doivent être positives (en cm).")); return this._panneau(); }
      return r && this.redimensionner(s.i, k === "_largeur" ? +v : r[2], k === "_hauteur" ? +v : r[3]);
    }
    // « Appareil mesuré » : la valeur choisie sert aussi d'état actif tant qu'il n'est pas réglé
    if (k === "valeur" && v && s.type === "point" && this._aCompleter("actif") && !this._objet()?.actif) this.commit(() => { this._objet().actif = v; });
    // entité choisie sur un meuble : proposer la fiche de son appareil (rien n'est écrit sans l'aperçu validé)
    if (k === "entite" && v && s.type === "meuble") setTimeout(() => {
      const m = this._objet();
      if (this.sel?.type === "meuble" && m?.entite === v && !(m.fiche?.widgets || []).length && this._entitesAppareil(v).length > 1) this.snack(_t("Cet appareil a d'autres entités : remplir la fiche du meuble avec ?"), _t("Voir l'aperçu"), () => this.remplirFiche(), 10000);
    }, 0);
    const o = ["mur", "limite"].includes(s.type) ? { seg: this._liste(s.type)[s.i] } : this._objet();
    if (!o) return;
    // contact n° j d'une ouverture à plusieurs capteurs (ou le suivant, ajouté) : vide = retiré
    if (s.type === "ouverture" && /^contact\.\d+$/.test(k)) return this.commit(() => { const l = contactsOuv(o), j = +k.slice(8); if (v) l[j] = v; else l.splice(j, 1); poserContacts(o, l); });
    if (k === "confirmer" && s.type === "widget") return this.commit(() => { if (v === "oui" || v === "non" || v === true) o.confirmer = v === "oui" || v === true; else delete o.confirmer; });
    this.commit(() => {
      if (k === "_etiquette") { if (v) o.etiquette = centre(o.poly); else delete o.etiquette; return; }
      if (k === "nom" && s.type === "piece") {
        const ancien = o.nom;
        (this.d.points || []).forEach((p) => { if (p.piece === ancien) p.piece = v; });
      }
      if (k === "halo" && !v) { delete o.halo; return; }
      if (k[0] === "!") { if (v) delete o[k.slice(1)]; else o[k.slice(1)] = false; return; }
      if (k.endsWith(".donnees")) { try { v = v ? JSON.parse(v) : ""; } catch (e) { this.snack(_t("Données : JSON invalide.")); return; } }
      const ca = /^(animation(?:_volet)?)\./.exec(k)?.[1];
      if (ca && typeof o[ca] === "string") o[ca] = { type: o[ca] };
      if (ca && /\.(duree|intensite)$/.test(k) && v !== "") v = Math.min(/duree$/.test(k) ? 20 : 2, Math.max(0.2, +v || 0.2));
      poserChemin(o, k, v);
      if (s.type === "widget" && o.seuils && typeof o.seuils === "object" && !Object.keys(o.seuils).length) delete o.seuils;
      if (ca && o[ca] && typeof o[ca] === "object" && !Object.keys(o[ca]).length) delete o[ca];
      if (Object.hasOwn(GENRES_FICHE, s.type)) this._nettoyerFiche(o);
    });
  }

  // chaque case « Icône » (data-k finissant par icone) : aperçu, propositions au focus (selon l'entité voisine), recherche en tapant
  _cablerIcones(P) {
    P.querySelectorAll('input[data-k$="icone"], input[data-alk$="icone"]').forEach((inp) => {
      if (inp.closest(".ed-ic")) return;
      const w = document.createElement("div"), ap = document.createElement("ha-icon"), menu = document.createElement("div");
      w.className = "ed-ic"; ap.className = "ed-ic-ap"; menu.className = "ed-ic-menu"; menu.hidden = true;
      menu.setAttribute("role", "listbox"); menu.setAttribute("aria-label", _t("Icônes proposées"));
      inp.replaceWith(w); w.append(ap, inp, menu);
      inp.setAttribute("autocomplete", "off");
      if (!inp.placeholder || inp.placeholder === "mdi:…") inp.placeholder = _t("Chercher…");
      if (!inp.title) inp.title = _t("Nom mdi:… ou un mot : lampe, porte, voiture…");
      const auto = () => /mdi:[\w-]+/.exec(inp.placeholder)?.[0];
      const maj = () => ap.setAttribute("icon", /^mdi:[\w-]+$/.test(inp.value.trim()) ? inp.value.trim() : auto() || "mdi:magnify");
      maj();
      let jeton = 0;
      const proposer = async () => {
        const q = inp.value.trim(), j = ++jeton, ctx = this._iconesContexte(inp, auto());
        const res = q && !/^mdi:[\w-]+$/.test(q) ? chercherIcones(await listeIcones(), q) : [];
        if (j !== jeton) return;
        const l = [...new Set([...res, ...(res.length ? [] : ctx)])].slice(0, 48);
        poserHTML(menu, (q && !res.length && !/^mdi:/.test(q) ? `<small>${_t("Aucune icône pour « {q} » : essaie un autre mot (français ou anglais)", { q: esc(q) })}</small>` : "")
          + l.map((n) => `<button type="button" role="option" data-ic="mdi:${esc(n)}" title="mdi:${esc(n)}" aria-label="${esc(n)}"><ha-icon icon="mdi:${esc(n)}"></ha-icon></button>`).join(""));
        menu.hidden = !menu.innerHTML;
      };
      inp.addEventListener("focus", proposer);
      inp.addEventListener("input", () => { maj(); proposer(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { e.stopPropagation(); menu.hidden = true; } });
      inp.addEventListener("blur", () => setTimeout(() => { menu.hidden = true; }, 150));
      menu.addEventListener("pointerdown", (e) => e.preventDefault()); // le champ garde le focus
      menu.addEventListener("click", (e) => {
        const b = e.composedPath().find((n) => n.dataset?.ic);
        if (!b) return;
        inp.value = b.dataset.ic; maj(); menu.hidden = true;
        inp.dispatchEvent(new Event("change"));
      });
    });
  }
  // propositions sans recherche : icône actuelle, icône automatique, icône de l'entité, puis selon sa classe et son domaine
  _iconesContexte(inp, auto) {
    let o = inp.closest(".ed-atelier") ? this._atelierObjet : this._objet(), k = inp.dataset.k;
    if (inp.dataset.alk) { const [i, ...c] = inp.dataset.alk.split("."), r = this.d.alertes?.[+i]; o = r && { ...r, entite: r.entite || r.entites?.[0] }; k = c.join("."); }
    const cheminE = k.replace(/icone$/, "entite"), lire = (x, c) => c.split(".").reduce((a, p) => (a == null ? a : a[/^\d+$/.test(p) ? +p : p]), x);
    const e = (o && (lire(o, cheminE) || lire(o, k.replace(/icone$/, "valeur")) || o.entite)) || null, st = typeof e === "string" ? this.hass.states[e] : null;
    const dom = typeof e === "string" ? e.split(".")[0] : null, dc = st?.attributes.device_class;
    const l = [o && lire(o, k), auto, st?.attributes.icon, ...(ICONES_DC[dc] || []).map((x) => `mdi:${x}`), ...(ICONES[dom] || []), ...ICONES._, "mdi:thermometer", "mdi:water-percent", "mdi:flash", "mdi:lightbulb", "mdi:door", "mdi:window-closed-variant", "mdi:car", "mdi:home"];
    return [...new Set(l.filter((x) => typeof x === "string" && /^mdi:[\w-]+$/.test(x)).map((x) => x.slice(4)))];
  }

  _cablerPanneau(P) {
    // les sections « avancées » restent ouvertes ou fermées comme l'utilisateur les a laissées, d'un rendu à l'autre (onglet entier : toujours ouvert)
    P.querySelectorAll("details.ed-avance:not(.ed-plein)").forEach((dt, j) => {
      const k = `${this.sel ? cle(this.sel) : "-"}:${j}`;
      if (this._avance?.[k] != null) dt.open = this._avance[k];
      dt.ontoggle = () => { (this._avance ||= {})[k] = dt.open; };
    });
    P.onclick = async (ev) => {
      const chemin = ev.composedPath();
      const el = chemin.find((n) => n.dataset && (n.dataset.effacer || n.dataset.entite || n.dataset.icone || n.dataset.couleur || n.dataset.act || n.dataset.type || n.dataset.dehors || n.dataset.choix || n.dataset.groupeChoix));
      if (!el) return;
      const ds = el.dataset;
      // élément choisi dans une liste (Calques, sélection multiple, widgets d'une pièce ou d'une fiche) : sa modale ; Échap ou ← revient d'où l'on vient
      if (ds.choix) {
        const r = this.vueEdition && this.multi.size <= 1 ? this._edCle : null;
        this.selectionner(deCle(ds.choix));
        if (!this.vueEdition) this.editerSelection();
        if (r && this.vueEdition && r !== this._edCle) { this._retourEd = r; this._rendreEdition(); }
        return;
      }
      if (ds.groupeChoix) { const l = this._membres(ds.groupeChoix); if (!l.length) return; this.sel = deCle(l[0]); this.multi = new Set(l); this.carte._construire(); this._panneau(); if (!this.vueEdition) this.editerSelection(); return; }
      if (ds.effacer) { ev.stopPropagation(); return this._modif(ds.effacer, ""); }
      if (ds.entite) {
        const e = await this.choisirEntite({ titre: _t("Choisir une entité"), domaine: ds.dom });
        if (e != null) this._modif(ds.entite, e);
        return;
      }
      if (ds.icone) return this._modif("icone", ds.icone);
      if (ds.couleur) return this._modif(ds.ck || "couleur", ds.couleur);
      if (ds.type) return this._modif("type", ds.type);
      if (ds.dehors) return this._modif("dehors", ds.dehors.split(",").map(Number));
      if (ds.act) this._action(ds.act);
    };
    P.querySelectorAll("input[data-act-chk]").forEach((inp) => { inp.onchange = () => this._action(inp.dataset.actChk); });
    P.querySelectorAll("input[data-groupe]").forEach((inp) => { inp.onchange = () => this.commit(() => { const g = (this.d.groupes ||= []).find((x) => x.id === inp.dataset.groupe); if (g) g.nom = inp.value.trim() || g.nom; else this.d.groupes.push({ id: inp.dataset.groupe, nom: inp.value.trim() }); }); });
    // un champ modifié puis quitté en cliquant un autre élément déclenche « change » APRÈS le changement de sélection :
    // la valeur va à l'élément dont le panneau était affiché, jamais au nouvel élément
    const s0 = this.sel ? { ...this.sel } : null;
    const ecrire = (k, v) => {
      if (!s0 || (this.sel && cle(this.sel) === cle(s0))) return this._modif(k, v);
      if (!this._elt(cle(s0))) return;
      const cur = this.sel, multi = new Set(this.multi);
      this.sel = s0;
      try { this._modif(k, v); } finally { this.sel = cur; this.multi = multi; this.carte._construire(); this._panneau(); }
    };
    P.querySelectorAll("input[data-k],select[data-k]").forEach((inp) => {
      const k = inp.dataset.k;
      if (inp.type === "range") {
        const out = inp.parentElement.querySelector("output");
        inp.oninput = () => { out.textContent = inp.dataset.suf === "h" ? (+inp.value ? `${inp.value} h` : _t("aucune")) : k === "halo" ? (+inp.value ? `${inp.value} cm` : _t("aucun")) : `${fmt(+inp.value, 2)}×`; };
        inp.onchange = () => ecrire(k, +inp.value);
      } else if (inp.type === "checkbox") inp.onchange = () => ecrire(k, inp.checked);
      else if (inp.type === "color") inp.onchange = () => ecrire(k, inp.value);
      else inp.onchange = () => ecrire(k, inp.dataset.num ? (inp.value === "" ? "" : +inp.value) : inp.value.trim());
    });
    this._cablerIcones(P);
  }

} // @assemblage
