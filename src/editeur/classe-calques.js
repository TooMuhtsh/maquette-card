// Calques : niveaux, panneau, actions — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- calques ----------
  _calqueDe(k) {
    const m = deCle(k);
    if (m.type === "piece") return this.d.pieces[m.i]?.sous_zone ? "sous_zones" : "pieces";
    return { point: "appareils", texte: "textes", mur: "murs", limite: "limites", ouverture: "ouvertures", meuble: "meubles" }[m.type] || null;
  }
  // élément sur un calque masqué ou verrouillé : ni cadre de sélection ni Ctrl+A
  _bloque(k, Q = this.carte._calques()) { const c = this._calqueDe(k); return !!c && (Q.masques.has(c) || Q.verrous.has(c)); }
  // couleurs nommées du plan (⚙ Paramètres › Couleurs) proposées dans les champs couleur : l'élément garde le nom et suit la palette
  // attrs(n) : attributs du bouton (par défaut data-couleur, lu par le panneau ; Ambiance et atelier ont les leurs)
  // nuancier : pastilles de la palette de base (COULEURS) puis couleurs nommées du plan ; attrs(c) : attributs d'une pastille de base,
  // attrsPal(nom) : ceux d'une couleur nommée (par défaut data-couleur)
  _pastilles(val, attrs = (c) => `data-couleur="${c}"`, attrsPal) {
    const v = (val || "").toLowerCase();
    return COULEURS.map(([n, c]) => `<button type="button" ${attrs(c)} title="${_t(n)}" aria-label="${_t(n)}" class="${v === c ? "on" : ""}" style="background:${c}"></button>`).join("") + this._nuancierPalette(val, "", attrsPal);
  }
  _nuancierPalette(val, k = "", attrs = (n) => `data-couleur="${esc(n)}"${k ? ` data-ck="${esc(k)}"` : ""}`) {
    const l = Object.entries(this.d.palette || {}).filter(([, c]) => this.carte.constructor.couleurSure(c));
    return l.map(([n, c]) => `<button type="button" ${attrs(n)} class="ed-pal-pastille${val === n ? " on" : ""}" title="${esc(_t("Couleur nommée « {nom} »", { nom: n }))}" aria-label="${esc(_t("Couleur nommée « {nom} »", { nom: n }))}" aria-pressed="${val === n}" style="background:${esc(c)}"></button>`).join("");
  }
  _calqueNiveau(o) {
    const v = o.verrouille === true, lv = v ? _t("Déverrouiller") : _t("Verrouiller : ni déplacé ni redimensionné à la souris");
    return `${this._inter(_t("Masquer en vue"), "masque", o.masque, _t("Visible ici en transparence."))}
      <div class="ed-champ"><label>${_t("Ordre dans son calque")}${o.niveau ? ` · ${_t("niveau {n}", { n: esc(o.niveau) })}` : ""}${v ? ` · ${_t("verrouillé")}` : ""}</label><div class="ed-actions">
        ${ibAct("niveau:haut", "mdi:arrange-bring-to-front", _t("Premier plan"))}${ibAct("niveau:bas", "mdi:arrange-send-to-back", _t("Arrière-plan"))}
        ${Array.isArray(o) ? "" : `<button type="button" class="ib ed-verrou${v ? " on" : ""}" data-act="verrou" title="${esc(lv)}" aria-label="${esc(lv)}" aria-pressed="${v}"><ha-icon icon="mdi:${v ? "lock-outline" : "lock-open-variant-outline"}"></ha-icon></button>`}</div></div>`;
  }
  // premier plan / arrière-plan : juste au-dessus (au-dessous) des autres éléments de son calque ; niveau par défaut = clé retirée
  _niveau(haut) {
    const s = this.sel, o = this._objet(), d = this.d;
    const l = { point: d.points, texte: d.textes, ouverture: d.ouvertures, meuble: d.meubles, piece: d.pieces.filter((p) => !!p.sous_zone === !!o?.sous_zone) }[s?.type];
    if (!l || !o) return;
    const def = (x) => (s.type === "meuble" ? this.carte.constructor.niveauMeuble({ type: x.type }) : 0), niv = (x) => nbr(x.niveau, def(x));
    const ordre = l.map((x, i) => [x, i]).sort((p, q) => niv(p[0]) - niv(q[0]) || p[1] - q[1]).map(([x]) => x), autres = l.filter((x) => x !== o);
    if (!autres.length || ordre[haut ? ordre.length - 1 : 0] === o) return this.snack(haut ? _t("Déjà au premier plan de son calque.") : _t("Déjà à l'arrière-plan de son calque."));
    const v = haut ? Math.max(...autres.map(niv)) + 1 : Math.min(...autres.map(niv)) - 1;
    this.commit(() => { if (v === def(o)) delete o.niveau; else o.niveau = v; });
  }
  panneauCalques(oui) {
    this.vueCalques = oui;
    if (oui && this.vueParametres) this._fermerParametres(); // une seule modale à la fois : ⚙, Ambiance et l'édition d'un élément se ferment
    if (oui && this.vueAmbiance) { this.vueAmbiance = false; this._fermerAmbiance(); this.carte._construire(); }
    if (oui && this.vueEdition) this.fermerEdition();
    if (oui) { this.sel = null; this.multi.clear(); this.carte._construire(); }
    this._barre();
    this._panneau();
    if (oui) this.R.querySelector(".ed-cq-modale [data-act=cq-fermer]")?.focus({ preventScroll: true });
  }
  // modale Calques : ordre, œil et cadenas des calques, puis les éléments du plan par catégorie (un clic ouvre la modale de l'élément,
  // Échap y revient) ; masquée pendant l'édition d'un élément, ⚙ ou Ambiance
  _panneauCalques() {
    let V = this.R.querySelector(".ed-mvoile.ed-cq-modale");
    if (!this.vueCalques) { V?.remove(); return; }
    if (!V) {
      V = this._mvoile("ed-cq-modale");
      V.onpointerdown = (ev) => { this._basVoileCq = ev.target === V; };
      V.addEventListener("click", (ev) => { if (ev.target === V && this._basVoileCq) this.panneauCalques(false); });
      this._clavierModale(V);
    }
    V.hidden = !!(this.sel || this.multi.size || this.vueEdition || this.vueParametres || this.vueAmbiance);
    if (V.hidden) return;
    const actif = this.R.activeElement, ds = V.contains(actif) ? actif.dataset || {} : {};
    const garde = ds.act ? `[data-act="${ds.act}"]` : ds.actChk ? `[data-act-chk="${ds.actChk}"]` : ds.cqGlisse ? `[data-cq-glisse="${ds.cqGlisse}"]` : null;
    const defile = V.querySelector(".ed-mcontenu")?.scrollTop || 0;
    const d = this.d, q = d.calques || {}, Q = this.carte._calques(), { noms, icones } = this.carte.constructor.CALQUES;
    const P = d.points || [], M = d.meubles || [], sz = d.pieces.filter((p) => p.sous_zone);
    const elts = { pieces: d.pieces.filter((p) => !p.sous_zone), sous_zones: sz, halos: P.filter((p) => p.halo), meubles: M, limites: d.limites || [], murs: d.murs || [],
      ouvertures: d.ouvertures || [], etiquettes: d.pieces.filter((p) => !p.sous_zone && p.etiquette), libelles: [...sz.filter((p) => p.etiquette), ...M.filter((m) => m.type === "espace" && m.nom)],
      appareils: P, textes: d.textes || [] };
    const ligne = (k) => {
      const n = elts[k].length, cach = elts[k].filter((o) => o?.masque).length, m = Q.masques.has(k), v = Q.verrous.has(k);
      return `<div class="ed-cq${m ? " masque" : ""}" data-cq="${k}"><button class="ib ed-cq-poignee" data-cq-glisse="${k}" title="${_t("Glisser pour changer l'ordre (ou flèches haut / bas)")}" aria-label="${_t("Ordre du calque {nom} (flèches haut / bas)", { nom: esc(_t(noms[k])) })}"><ha-icon icon="mdi:drag"></ha-icon></button>
        <ha-icon icon="${icones[k]}"></ha-icon><span class="n">${esc(_t(noms[k]))}<small>${_t("{n} élément|{n} éléments", { n })}${cach ? ` · ${_t("{n} masqué|{n} masqués", { n: cach })}` : ""}</small></span>
        <button class="ib${m ? " on" : ""}" data-act="cq-oeil:${k}" title="${m ? _t("Afficher en vue") : _t("Masquer en vue")}" aria-label="${m ? _t("Afficher en vue") : _t("Masquer en vue")}" aria-pressed="${m}"><ha-icon icon="mdi:${m ? "eye-off-outline" : "eye-outline"}"></ha-icon></button>
        <button class="ib${v ? " on" : ""}" data-act="cq-verrou:${k}" title="${v ? _t("Déverrouiller") : _t("Cliquer à travers")}" aria-label="${v ? _t("Déverrouiller") : _t("Cliquer à travers")}" aria-pressed="${v}"><ha-icon icon="mdi:${v ? "lock-outline" : "lock-open-variant-outline"}"></ha-icon></button></div>`;
    };
    poserHTML(V, `<div class="ed-modale ed-modale-cq" role="dialog" aria-modal="true" aria-labelledby="ed-cq-titre">
      <header><ha-icon icon="mdi:layers-outline"></ha-icon><div><h2 id="ed-cq-titre">${_t("Calques")}</h2><div class="ed-version">${bulleI(_t("En haut d'une liste : au premier plan. Œil : masqué en vue (ici en transparence et non cliquable). Cadenas : on clique à travers pendant l'édition. Ce qui est « au-dessus du dessin » reste toujours au-dessus du dessin."))}</div></div>
        <button class="ib" data-act="cq-fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcontenu ed-medit"><section>
      <h4>${_t("Au-dessus du dessin")}</h4><div class="ed-cqs" data-groupe="html">${[...Q.html].reverse().map(ligne).join("")}</div>
      <h4>${_t("Dessin")}</h4><div class="ed-cqs" data-groupe="svg">${[...Q.svg].reverse().map(ligne).join("")}</div>
      ${d.afficher_meubles === "pc" ? `<div class="ed-aide">${_t("Meubles : affichés en vue sur grand écran seulement (show_furniture: desktop).")}</div>` : ""}
      <div class="ed-actions"><button class="ed-btn contour" data-act="cq-reinit" ${q.ordre_svg || q.ordre_html ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon>${_t("Réinitialiser l'ordre")}</button></div>
      <label class="ed-inter"><span>${_t("Bouton Calques pour les visiteurs")}${bulleI(_t("Chacun masque ce qu'il veut, sur son navigateur."))}</span><input type="checkbox" data-act-chk="cq-bouton" ${q.bouton_vue ? "checked" : ""}></label>
      ${this._listesElements()}</section></div></div>`);
    const boite = V.querySelector(".ed-modale");
    this._cablerPanneau(boite);
    V.querySelector(".ed-mcontenu").scrollTop = defile;
    if (garde) boite.querySelector(garde)?.focus({ preventScroll: true });
    // glisser une poignée (souris ou doigt) ou flèches haut / bas : nouvel ordre dans son groupe
    boite.querySelectorAll("[data-cq-glisse]").forEach((h) => {
      const ligne = h.closest(".ed-cq"), liste = ligne.parentElement, groupe = liste.dataset.groupe, k = h.dataset.cqGlisse;
      h.onkeydown = (ev) => {
        const pas = { ArrowUp: -1, ArrowDown: 1 }[ev.key];
        if (!pas) return;
        ev.preventDefault();
        const j = [...liste.children].indexOf(ligne) + pas;
        if (j < 0 || j >= liste.children.length) return;
        this._deplacerCalque(groupe, k, j);
        this.R.querySelector(`.ed-cq-modale [data-cq-glisse="${k}"]`)?.focus();
      };
      h.onpointerdown = (ev) => {
        if (ev.button > 0) return;
        ev.preventDefault();
        h.setPointerCapture?.(ev.pointerId);
        const lignes = [...liste.children], i0 = lignes.indexOf(ligne), depot = document.createElement("div");
        depot.className = "ed-cq-depot";
        let j = i0, bouge = false;
        ligne.classList.add("glisse");
        const mv = (e) => {
          if (!bouge && Math.abs(e.clientY - ev.clientY) < 4) return;
          bouge = true;
          j = lignes.findIndex((x) => { const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
          if (j < 0) j = lignes.length;
          liste.insertBefore(depot, lignes[j] || null);
        };
        const fin = (e) => {
          h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", fin); h.removeEventListener("pointercancel", fin);
          depot.remove(); ligne.classList.remove("glisse");
          const dest = j > i0 ? j - 1 : j;
          if (bouge && e.type === "pointerup" && dest !== i0) this._deplacerCalque(groupe, k, dest);
        };
        h.addEventListener("pointermove", mv); h.addEventListener("pointerup", fin); h.addEventListener("pointercancel", fin);
      };
    });
  }
  // éléments du plan par catégorie (repliables) : un clic sélectionne l'élément et ouvre sa modale (Échap : retour aux calques)
  _listesElements() {
    const d = this.d, nomP = (p) => p.nom || this.carte._nom(p.entite), item = (k, ic, nom, sous) => `<button data-choix="${k}"><ha-icon icon="${esc(ic)}"></ha-icon><span>${esc(nom)}<small>${esc(sous)}</small></span>${this._verrouille(k) ? `<ha-icon class="ed-elt-verrou" icon="mdi:lock-outline" title="${_t("Verrouillé")}" aria-label="${_t("Verrouillé")}"></ha-icon>` : ""}</button>`;
    const nomMeuble = (m) => m.nom || (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : m.type);
    const widgets = ["gauche", "droite"].flatMap((c) => (d.panneaux?.[c] || []).map((w, i) => item(`widget:${c}:${i}`, w.icone || "mdi:view-dashboard-outline", w.titre || typeWidgetEn(w.type), `${typeWidgetEn(w.type)} · ${c === "gauche" ? _t("panneau gauche") : _t("panneau droit")}`)));
    const cats = [
      [_t("Pièces ({n})", { n: d.pieces.length }), d.pieces.map((p, i) => item(`piece:${i}`, p.dehors ? "mdi:pine-tree" : "mdi:floor-plan", p.nom || _t("Pièce"), p.temperature || _t("sans capteur")))],
      [_t("Appareils ({n})", { n: (d.points || []).length }), (d.points || []).map((p, i) => item(`point:${i}`, p.icone || "mdi:circle", nomP(p), p.entite))],
      [_t("Ouvertures ({n})", { n: (d.ouvertures || []).length }), (d.ouvertures || []).map((o, i) => item(`ouverture:${i}`, o.type === "fenetre" ? "mdi:window-closed-variant" : o.type === "portail" ? "mdi:garage-variant" : "mdi:door",
        o.nom || (contactsOuv(o).length ? this.carte._nom(contactsOuv(o)[0]) : _t("Ouverture sans capteur")), contactsOuv(o).join(", ") || o.volet || o.entite || "—"))],
      [_t("Meubles ({n})", { n: (d.meubles || []).length }), (d.meubles || []).map((m, i) => item(`meuble:${i}`, "mdi:sofa-outline", nomMeuble(m), MEUBLES()[m.type]?.cat ? _t(MEUBLES()[m.type].cat) : ""))],
      [_t("Textes ({n})", { n: (d.textes || []).length }), (d.textes || []).map((t, i) => item(`texte:${i}`, Array.isArray(t.infos) ? "mdi:card-text-outline" : "mdi:format-text", t.t || (Array.isArray(t.infos) ? _t("Zone d'informations") : _t("Texte")), ""))],
      [_t("Widgets ({n})", { n: widgets.length }), widgets],
      [_t("Résumé en tête ({n})", { n: this._puces().length }), this._puces().map((p, i) => { const t = PUCES.find((x) => x[0] === p.type) || [];
        return item(`puce:${i}`, p.icone || t[1] || "mdi:help", p.type === "entite" ? p.nom || this.carte._nom(p.entite) || _t("Entité") : t[2] ? _t(t[2]) : p.type, p.type === "entite" ? p.entite || "—" : _t("automatique")); })],
      [_t("Groupes ({n})", { n: (d.groupes || []).length }), (d.groupes || []).map((g) => `<button data-groupe-choix="${esc(g.id)}"><ha-icon icon="mdi:group"></ha-icon><span>${esc(g.nom)}<small>${_t("{n} éléments", { n: this._membres(g.id).length })}</small></span></button>`)],
    ].filter(([, l]) => l.length);
    if (!cats.length) return "";
    return `<h4>${_t("Éléments du plan")}</h4>
      ${cats.map(([t, l]) => `<details class="ed-avance ed-elts"><summary>${t}</summary><div class="ed-liste">${l.join("")}</div></details>`).join("")}`;
  }
  // config des calques : listes vides, ordre par défaut et bouton absent retirés (le YAML reste minimal)
  _majCalques(fn) {
    const { svg, html } = this.carte.constructor.CALQUES;
    this.commit(() => {
      const q = (this.d.calques ||= {});
      fn(q);
      if (q.ordre_svg?.join() === svg.join()) delete q.ordre_svg;
      if (q.ordre_html?.join() === html.join()) delete q.ordre_html;
      for (const x of ["masques", "verrous"]) if (Array.isArray(q[x]) && !q[x].length) delete q[x];
      if (!q.bouton_vue) delete q.bouton_vue;
      if (!Object.keys(q).length) delete this.d.calques;
    });
  }
  _actionCalque(a) {
    const [op, k] = a.split(":"), bascule = (l, x) => { const e = new Set(l || []); if (e.has(x)) e.delete(x); else e.add(x); return [...e]; };
    if (op === "cq-fermer") return this.panneauCalques(false);
    this._majCalques((q) => {
      if (op === "cq-oeil" && k === "meubles" && this.d.afficher_meubles === false) { delete this.d.afficher_meubles; q.masques = (q.masques || []).filter((x) => x !== k); }
      else if (op === "cq-oeil") q.masques = bascule(q.masques, k);
      if (op === "cq-verrou") q.verrous = bascule(q.verrous, k);
      if (op === "cq-reinit") { delete q.ordre_svg; delete q.ordre_html; }
      if (op === "cq-bouton") q.bouton_vue = !q.bouton_vue;
    });
  }
} // @assemblage
