// clics et fiches (meubles, ouvertures, pastilles) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  _plusInfos(e) {
    if (this._sim) return; // démo : pas de fenêtre « plus d'infos » (entités simulées)
    if (!e) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId: e };
    this.dispatchEvent(ev);
  }

  _clicMeuble(i) {
    const m = this._config.meubles?.[i];
    if (!estConnecte(m)) return;
    const mode = clicMeuble(m);
    if (mode === "infos") return this._plusInfos(m.entite || m.valeur);
    if (mode === "fiche") this._ouvrirFiche("meuble", i);
  }

  // ouverture ou pastille : true si le clic est pris en charge (fiche, plus d'infos ou rien, réglés) ; false = comportement d'avant
  _clicPorteur(genre, i) {
    const o = this._config[GENRES_FICHE[genre]]?.[i], mode = clicPorteur(o);
    if (!mode) return false;
    if (mode === "fiche") this._ouvrirFiche(genre, i);
    else if (mode === "infos") this._plusInfos(this._enteteFiche(genre, o).infos);
    return true;
  }

  _ficheOuvrable(genre, o) { return genre === "meuble" ? estConnecte(o) : clicPorteur(o) === "fiche"; }

  // en-tête d'une fiche selon l'élément qui la porte : icône, titre, entité dont on montre l'état, interrupteur, couleur, « plus d'infos »
  _enteteFiche(genre, o) {
    if (genre === "meuble") return { icone: ICONES_MEUBLE[o.type] || "mdi:sofa-outline", titre: o.fiche?.titre || o.nom || _t(MEUBLES[o.type]?.nom || _tk("Meuble")), etat: o.entite || o.valeur, bascule: o.entite, couleur: o.couleur, infos: o.entite || o.valeur };
    if (genre === "ouverture") {
      const e = entOuv(o);
      return { icone: (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[0], titre: o.fiche?.titre || o.baie || o.nom || (e || o.volet ? this._nom(e || o.volet) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))), etat: e, bascule: e, infos: e || o.volet };
    }
    return { icone: o.icone || "mdi:circle", titre: o.fiche?.titre || o.nom || this._nom(o.entite) || _t("Appareil"), etat: o.entite, bascule: o.entite, couleur: o.couleur, infos: o.entite };
  }

  // fiche d'un meuble connecté, d'une ouverture ou d'une pastille : <dialog> modal (couche supérieure, Échap, focus contenu puis rendu),
  // feuille du bas au téléphone ; ses widgets passent par le moteur des panneaux ; services possibles : marche / arrêt de l'entité
  // de l'en-tête (domaines BASCULES, jamais l'arrêt si elle est protégée) et Ouvrir / Stop / Fermer des widgets `commande`
  _ouvrirFiche(genre, i) {
    if (typeof genre === "number") [genre, i] = ["meuble", genre];
    const R = this.shadowRoot, o = this._config[GENRES_FICHE[genre]]?.[i];
    if (!o) return;
    let d = R.querySelector("dialog.mf");
    if (!d) {
      d = document.createElement("dialog");
      d.className = "mf";
      d.setAttribute("aria-labelledby", "mf-titre");
      R.querySelector("ha-card").append(d);
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // les clics de la fiche ne passent jamais par ceux de la carte (interrupteurs des widgets…)
        if (ev.target === d) return d.close(); // fond
        const chemin = ev.composedPath(), a = chemin.find((n) => n.dataset?.mf)?.dataset.mf;
        if (a === "fermer") return d.close();
        if (a === "infos") { const x = this._mfObjet(), cible = x && this._cibleInfos(this._mf.genre, x); d.close(); return this._ouvrirInfos(cible); }
        if (a === "allumer") return this._basculerFiche(true);
        if (a) return;
        const cmd = chemin.find((n) => n.dataset?.cmd);
        if (cmd) return this._lancerCommande(cmd);
        const th = chemin.find((n) => n.dataset?.th);
        if (th) return this._reglerThermostat(th);
        const el = chemin.find((n) => n.dataset?.e);
        if (el) { d.close(); this._plusInfos(el.dataset.e); }
      });
      d.addEventListener("change", (ev) => { if (ev.target.dataset?.mf === "basculer") this._basculerFiche(ev.target.checked); });
      d.addEventListener("close", () => {
        if (d.open) return; // rouverte (autre élément) avant que l'événement de fermeture n'arrive
        const r = this._mf?.retour;
        this._mf = null;
        if (r?.isConnected) r.focus();
      });
    }
    const t = this._enteteFiche(genre, o), dom = (t.bascule || "").split(".")[0];
    const retour = { meuble: `.calque>[data-mbq="${i}"]`, point: `.calque>[data-q="${i}"]`, ouverture: `.zone svg [data-o="${i}"][tabindex]` }[genre];
    this._mf = { genre, i, retour: (retour && R.querySelector(retour)) || R.activeElement, html: null };
    const tc = genre === "meuble" ? couleurMeuble(o) : t.couleur;
    d.style.cssText = couleurSure(tc) ? `--mb-couleur:${couleurSure(tc)}` : "";
    poserHTML(d, `<div class="mf-in"><header><span class="ic"><ha-icon icon="${esc(t.icone)}"></ha-icon></span>
        <div class="n"><h2 id="mf-titre">${esc(t.titre)}</h2><small class="etat"></small></div>
        ${t.bascule && BASCULES.includes(dom) && !o.protege ? `<input type="checkbox" class="bascule" role="switch" data-mf="basculer" aria-label="${_t("Marche / arrêt")}">` : ""}
        ${(() => { const ci = this._cibleInfos(genre, o), lien = ci && /^(\/|https?:\/\/)/i.test(ci), lib = lien ? _t("Ouvrir : {cible}", { cible: ci }) : _t("Plus d'infos");
          return ci ? `<button class="ib" data-mf="infos" title="${esc(lib)}" aria-label="${esc(lib)}"><ha-icon icon="${lien ? "mdi:open-in-new" : "mdi:information-outline"}"></ha-icon></button>` : ""; })()}
        <button class="ib" data-mf="fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      ${o.protege ? `<div class="mf-protege"><ha-icon icon="mdi:shield-lock-outline"></ha-icon><span>${_t("Appareil protégé : pas d'arrêt depuis le plan.")}</span><button class="cta" data-mf="allumer" hidden><ha-icon icon="mdi:power"></ha-icon>${_t("Rallumer")}</button></div>` : ""}
      <div class="mf-w"></div></div>`);
    this._majFiche();
    if (!d.open) d.showModal();
    d.querySelector("header [data-mf=fermer]").focus();
  }

  // bouton « Plus d'infos » d'une fiche (`card.more_info`) : par défaut l'entité de l'en-tête ; false = masqué ; une autre entité,
  // un chemin de tableau de bord (/…) ou une URL (http…)
  _cibleInfos(genre, o) {
    const v = o?.fiche?.plus_infos;
    if (v === false) return null;
    return typeof v === "string" && v ? v : this._enteteFiche(genre, o).infos || null;
  }
  _ouvrirInfos(cible) {
    if (!cible) return;
    if (/^https?:\/\//i.test(cible)) return LIEN_SUR.test(cible) ? window.open(cible, "_blank", "noopener,noreferrer") : undefined;
    if (cible.startsWith("/")) {
      if (!LIEN_SUR.test(cible)) return;
      history.pushState(null, "", cible);
      const ev = new Event("location-changed", { bubbles: true, composed: true });
      ev.detail = { replace: false };
      return window.dispatchEvent(ev);
    }
    this._plusInfos(cible);
  }

  // vantaux d'une même baie (`baie` identique), l'ouverture seule sinon
  _vantaux(o) { return o?.baie ? (this._config.ouvertures || []).filter((x) => x.baie === o.baie) : o ? [o] : []; }

  _mfObjet() { return this._mf ? this._config[GENRES_FICHE[this._mf.genre]]?.[this._mf.i] ?? null : null; }

  // marche / arrêt depuis la fiche : service explicite selon l'état voulu (pas de toggle), sur l'entité de l'en-tête seulement,
  // arrêt refusé si l'élément est protégé
  _basculerFiche(on) {
    const o = this._mfObjet(), e = o ? this._enteteFiche(this._mf.genre, o).bascule : null, dom = (e || "").split(".")[0];
    if (!o || !BASCULES.includes(dom) || (!on && o.protege)) return;
    // `confirm: true` de l'élément : confirmation même pour ce service sûr ; annulé ou en échec, l'interrupteur revient à l'état réel
    const remettre = () => this._majFiche();
    this._appeler(dom, on ? "turn_on" : "turn_off", { entity_id: e }, undefined, { forcer: o.confirmer === true, libelle: on ? _t("Allumer") : _t("Éteindre") }).then((fait) => { if (!fait) remettre(); }, remettre);
  }

  // mise à jour en direct de la fiche ouverte : en-tête modifié sur place (le focus reste), widgets réécrits seulement s'ils changent
  _majFiche() {
    const d = this.shadowRoot?.querySelector("dialog.mf"), o = this._mfObjet();
    if (!d || !o) return;
    const genre = this._mf.genre, t = this._enteteFiche(genre, o), s = this._etat(t.etat), on = s?.state === "on", ic = d.querySelector("header .ic");
    let v = "", actif = false, ouvert = false;
    let se = s;
    if (genre === "ouverture") {
      // baie à plusieurs vantaux : ouverte dès qu'un vantail l'est, état d'en-tête = le vantail ouvert (sinon le premier)
      const vs = this._vantaux(o).map((x) => this._etatOuverture(x)).filter(Boolean);
      se = vs.find((x) => ["on", "open"].includes(x.state)) || this._etatOuverture(o) || s;
      // plusieurs capteurs : mention discrète de ceux qui ne répondent pas (l'ouverture reste fermée ou ouverte d'après les autres)
      const muets = contactsDe(o).filter((e) => { const x = this._etat(e); return !x || ETATS_MUETS.includes(x.state); }).length;
      if (contactsDe(o).length > 1 && muets && se && !ETATS_MUETS.includes(se.state)) v = _t("{n} capteur indisponible|{n} capteurs indisponibles", { n: muets });
      ouvert = !!se && ["on", "open"].includes(se.state);
      const sv = this._etat(o.volet), pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      if (sv) v = [v, _t("volet {n} %", { n: pos })].filter(Boolean).join(" · ");
      ic.querySelector("ha-icon").setAttribute("icon", (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[ouvert ? 1 : 0]);
    } else {
      v = this._texteValeur(o);
      actif = !!s && this._actif(genre === "meuble" ? { ...o, actif: o.actif || o.entite || o.valeur } : o);
    }
    d.querySelector(".etat").textContent = [se ? this._hass.formatEntityState?.(se) ?? se.state : t.etat ? _t("indisponible") : "", v].filter(Boolean).join(" · ");
    ic.classList.toggle("on", actif);
    ic.classList.toggle("clair", actif && genre === "point" && !!(o.clair ?? clairPour(o.couleur)));
    ic.classList.toggle("alerte", ouvert);
    const b = d.querySelector('[data-mf="basculer"]');
    if (b) { b.checked = on; b.disabled = !s || s.state === "unavailable"; }
    const r = d.querySelector('[data-mf="allumer"]');
    if (r) r.hidden = !(s && s.state === "off" && BASCULES.includes((t.bascule || "").split(".")[0]));
    const cs = genre === "ouverture" ? contactsDe(o) : [];
    // plusieurs capteurs : une ligne par capteur en tête de la fiche
    // (sauf si un widget de la fiche montre déjà tous les capteurs)
    const fw = o.fiche?.widgets || [], dejaLa = cs.length > 1 && cs.every((e) => fw.some((w) => JSON.stringify(w ?? null).includes(JSON.stringify(e))));
    const l = [...(cs.length > 1 && !dejaLa ? [{ type: "entites", titre: _t("Capteurs"), icone: "mdi:magnet", entites: cs }] : []), ...fw];
    // PC : la fiche s'élargit avec le nombre de widgets (1, 2, 3 colonnes) plutôt que de défiler
    const n = l.filter((w) => w?.type !== "separateur").length;
    d.classList.toggle("l2", n === 2); d.classList.toggle("l3", n >= 3);
    this._sansBascule = true;
    let html;
    try { html = l.map((w, j) => { try { return this._widget(w, "mf", j); } catch (e) { return `<div class="w"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }).join(""); } finally { this._sansBascule = false; }
    if (!l.length) html = `<div class="w-note">${t.etat ? "" : _t("Aucun widget dans cette fiche.")}</div>`;
    if (html !== this._mf.html) { poserHTML(d.querySelector(".mf-w"), html); this._mf.html = html; }
  }

  _fiche() {
    const R = this.shadowRoot, f = R.querySelector(".fiche"), c = this._config;
    const iso = this._iso != null && !this._editeur ? c.pieces[this._iso] : null;
    f.hidden = !iso;
    if (!iso) { poserHTML(f, ""); return; }
    const t = this._num(iso.temperature, iso.attribut_temperature), h = this._num(iso.humidite, iso.attribut_humidite);
    const etat = (s) => (s ? this._hass.formatEntityState?.(s) ?? s.state : _t("indisponible"));
    // pastilles de la pièce (une pastille masquée, `hidden: true`, n'y figure pas) ; état actif et valeur lus de la config, pas du plan
    const lignes = (c.points || []).filter((p) => !p.masque && dansPoly(p.pos, iso.poly)).map((p) => {
      const s = this._etat(p.entite), on = this._actif(p), dom = (p.entite || "").split(".")[0];
      const v = this._texteValeur(p);
      return `<div class="ligne" data-e="${esc(p.entite)}"${clicPorteur(p) ? ` data-fq="${c.points.indexOf(p)}"` : ""} role="button"><span class="ic${on ? " on" : ""}${on && (p.clair ?? clairPour(p.couleur)) ? " clair" : ""}" style="--pt-couleur:${couleurSure(p.couleur) || "var(--md-primary)"}"><ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon></span>
        <span class="n"><span>${esc(p.nom || this._nom(p.entite))}</span><small>${esc(v ? `${v} · ${etat(s)}` : etat(s))}</small></span>
        ${BASCULES.includes(dom) && s ? this._interrupteur(p.entite, s, p) : ""}</div>`;
    });
    const ouv = (c.ouvertures || []).filter((o) => !o.masque && (entOuv(o) || o.volet) && distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], iso.poly) < 20)
      .filter((o, k, l) => !o.baie || l.findIndex((x) => x.baie === o.baie) === k).map((o) => { // une ligne par baie
      const ent = entOuv(o), sv = this._etat(o.volet);
      const ss = this._vantaux(o).map((x) => this._etatOuverture(x)).filter(Boolean);
      const s = ss.find((x) => ["on", "open"].includes(x.state)) || this._etatOuverture(o);
      const ouvert = s && ["on", "open"].includes(s.state);
      const pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      const txt = [ent ? (ouvert ? _t("Ouverte") : s ? _t("Fermée") : _t("indisponible")) : "", sv ? _t("volet {n} %", { n: pos }) : ""].filter(Boolean).join(" · ");
      const ic = o.type === "fenetre" ? (ouvert ? "mdi:window-open-variant" : "mdi:window-closed-variant") : o.type === "portail" ? "mdi:garage-variant" : (ouvert ? "mdi:door-open" : "mdi:door-closed");
      return `<div class="ligne" data-e="${esc(ent || o.volet)}"${clicPorteur(o) ? ` data-fo="${c.ouvertures.indexOf(o)}"` : ""} role="button"><span class="ic${ouvert ? " alerte" : ""}"><ha-icon icon="${ic}"></ha-icon></span>
        <span class="n"><span>${esc(o.baie || o.nom || this._nom(ent || o.volet))}</span><small>${esc(txt)}</small></span></div>`;
    });
    const { boutons, automations } = this._actionsPiece(this._iso);
    const autos = automations.map((a) => {
      const s = this._etat(a);
      const script = a.startsWith("script.");
      return `<div class="ligne" data-e="${esc(a)}" role="button"><span class="ic${!script && s?.state === "on" ? " on" : ""}" style="--pt-couleur:var(--md-primary)"><ha-icon icon="${script ? "mdi:script-text-outline" : "mdi:robot-outline"}"></ha-icon></span>
        <span class="n"><span class="deux">${esc(s?.attributes.friendly_name || a)}</span><small>${script ? _t("Script · ") : ""}${esc(ilya(s?.attributes.last_triggered))}</small></span>
        ${s && !script ? `<input type="checkbox" class="bascule" data-b="${esc(a)}" ${s.state === "on" ? "checked" : ""} aria-label="${_t("Activer")}">` : ""}</div>`;
    });
    poserHTML(f, `<header><b>${esc(iso.nom)}</b><span>${[t != null ? `${fmt(t)} °C` : "", h != null ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · ")}</span></header>
      ${boutons.length ? `<div class="actions">${boutons.map((b, k) => `<button class="cta${b.plein ? " plein" : ""}" data-cta="${k}"${b.titre ? ` title="${esc(b.titre)}" aria-label="${esc(b.titre)}"` : ""}><ha-icon icon="${esc(b.icone || "mdi:gesture-tap")}"></ha-icon>${esc(b.nom)}</button>`).join("")}</div>` : ""}
      ${lignes.length ? `<h4>${_t("Appareils")}</h4>${lignes.join("")}` : ""}${ouv.length ? `<h4>${_t("Ouvertures")}</h4>${ouv.join("")}` : ""}
      ${autos.length ? `<h4>${_t("Automatisations")}</h4>${autos.join("")}` : ""}
      ${!lignes.length && !ouv.length && !boutons.length ? `<div class="vide">${_t("Aucun appareil placé dans cette pièce.")}</div>` : ""}`);
    this._boutons = boutons;
    this._ajusterCols();
  }

} // @assemblage
