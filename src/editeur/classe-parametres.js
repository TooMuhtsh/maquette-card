// modale ⚙ Paramètres : onglets, champs, écriture — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- paramètres : réglages globaux (liste SECTIONS_PARAMETRES) ----------
  // grande modale centrée à onglets (plein écran sur téléphone), au-dessus d'un voile léger : l'aperçu en direct reste visible autour.
  // À l'ouverture le focus va à l'onglet actif ; Échap, la croix ou un clic sur le voile la ferment et le focus revient au bouton ⚙.
  panneauParametres(oui, onglet = null) {
    oui = !!oui;
    if (onglet) this._ongletPar = onglet;
    this._confParam = null;
    const avant = !!this.vueParametres;
    this.vueParametres = oui;
    // une seule modale à la fois : ⚙ Paramètres ferme Ambiance et l'édition d'un élément
    if (oui && this.vueEdition) this.fermerEdition();
    if (oui && this.vueAmbiance) { this.vueAmbiance = false; this._fermerAmbiance(); this.carte._construire(); }
    if (oui) { this._fermerMenu(); this._rendreParametres(); if (!avant || onglet) this.R.querySelector(".ed-onglets [aria-selected=true]")?.focus({ preventScroll: true }); }
    else this.R.querySelector(".ed-mvoile.ed-par")?.remove();
    this._barre();
    this._panneauCalques(); // Calques ouvert : masqué le temps de ⚙ (une seule modale à la fois), de retour ensuite
    if (!oui && avant) this._rendreFocusParametres();
  }
  _fermerParametres() { this.vueParametres = false; this._confParam = null; this.R.querySelector(".ed-mvoile.ed-par")?.remove(); }
  // focus rendu au bouton ⚙ (au bouton « Plus » sur téléphone, où ⚙ est dans son menu)
  _rendreFocusParametres() {
    const b = [this.barre.querySelector('[data-a="parametres"]'), this.barre.querySelector('[data-a="plus"]')].find((x) => x && x.getClientRects().length);
    b?.focus({ preventScroll: true });
  }
  _champParametre(k) { return champReglage(k); }
  // réglage écrit par programme (autres panneaux, tests) : même règle que la modale, avec annulation
  reglerParametre(chemin, v) { this._ecrireParametre(champReglage(chemin) || { chemin }, v, true); }
  // onglets de la modale : une section par onglet, ou plusieurs (`onglet: "id"` de la section qui ouvre l'onglet), dans l'ordre de la liste
  _ongletsParametres(d = this.d) {
    const l = [];
    for (const S of SECTIONS_PARAMETRES) {
      const champs = (S.champs || []).filter((f) => !f.si || f.si(d, this));
      if (!champs.some((f) => f.type !== "intertitre")) continue;
      const id = S.onglet || S.id;
      let o = l.find((x) => x.id === id);
      if (!o) l.push((o = { id, titre: S.titre, icone: S.icone || "mdi:cog-outline", sections: [] }));
      o.sections.push({ S, champs });
    }
    return l;
  }
  ongletParametres(id) {
    const v = this.R.querySelector(".ed-mvoile.ed-par");
    if (!v || !v.querySelector(`[data-onglet-par="${id}"]`)) return;
    this._ongletPar = id;
    v.querySelectorAll("[data-onglet-par]").forEach((b) => { const on = b.dataset.ongletPar === id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    v.querySelectorAll(".ed-mcontenu>section").forEach((p) => { p.hidden = p.dataset.onglet !== id; });
    v.querySelector(".ed-mcontenu").scrollTop = 0;
    v.querySelector(`[data-onglet-par="${id}"]`).scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  _rendreParametres() {
    const d = this.d, hass = this.hass;
    if (this._tip?.b.closest(".ed-mvoile")) this._cacherAide();
    let V = this.R.querySelector(".ed-mvoile.ed-par");
    if (!V) this._cablerModaleParametres(V = this._mvoile("ed-par"));
    // élément qui avait le focus et défilement (rendu refait à chaque modification) : ils sont retrouvés ensuite
    const actif = this.R.activeElement, dans = V.contains(actif);
    const garde = !dans ? null : actif.dataset?.par || (actif.dataset?.parConf ? "conf" : actif.dataset?.ongletPar ? `onglet:${actif.dataset.ongletPar}` : actif.dataset?.parAction ? `action:${actif.dataset.parAction}` : actif.dataset?.parFermer ? "fermer" : null);
    const defile = V.querySelector(".ed-mcontenu")?.scrollTop || 0;
    const onglets = this._ongletsParametres(d);
    if (!onglets.some((o) => o.id === this._ongletPar)) this._ongletPar = onglets[0]?.id;
    const rendu = (f) => this._htmlChamp(f);
    const champs = (l) => {
      let h = "";
      for (let i = 0; i < l.length;) {
        if (l[i].demi && l[i + 1]?.demi) { h += `<div class="ed-ligne">${rendu(l[i])}${rendu(l[i + 1])}</div>`; i += 2; continue; }
        if (l[i].type === "action") { let a = ""; while (l[i]?.type === "action") a += rendu(l[i++]); h += `<div class="ed-liste">${a}</div>`; continue; }
        h += rendu(l[i++]);
      }
      return h;
    };
    // un onglet = son titre puis ses sections ; une section porte un sous-titre seulement si l'onglet en regroupe plusieurs (sauf la première, du même nom)
    const panneaux = onglets.map((o) => {
      const t = _t(o.titre), secs = o.sections.map(({ S, champs: l }, n) => {
        const sous = o.sections.length > 1 && !(n === 0 && _t(S.titre) === t), id = esc(S.id);
        return `<section class="ed-par-sec" data-sec="${id}" aria-labelledby="${sous ? `par-sec-${id}` : `par-pan-t-${esc(o.id)}`}">${sous ? `<h4><span id="par-sec-${id}">${esc(_t(S.titre))}</span>${S.aide ? bulleI(_t(S.aide)) : ""}</h4>` : ""}${champs(l)}</section>`;
      }).join("");
      return `<section role="tabpanel" id="par-pan-${esc(o.id)}" aria-labelledby="par-tab-${esc(o.id)}" data-onglet="${esc(o.id)}" tabindex="0" ${o.id === this._ongletPar ? "" : "hidden"}><h3 class="ed-mtitre" id="par-pan-t-${esc(o.id)}">${esc(t)}</h3>${secs}</section>`;
    }).join("");
    poserHTML(V, `<div class="ed-modale" role="dialog" aria-modal="true" aria-labelledby="ed-par-titre">
      <header><ha-icon icon="mdi:cog-outline"></ha-icon><div><h2><span id="ed-par-titre">${_t("Paramètres")}</span>${bulleI(_t("Un réglage remis à sa valeur par défaut est retiré de la configuration."))}</h2>
        <div class="ed-version">Maquette ${esc(customElements.get("maquette-card").VERSION)} · <button type="button" data-par-lien="doc">${_t("Documentation")}</button> · <button type="button" data-par-lien="bug">${_t("Signaler un problème")}</button></div></div>
        <button class="ib" data-par-fermer="1" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer (Échap)")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      <div class="ed-mcorps">${this._navOnglets("par", _t("Sections des paramètres"), onglets.map((o) => [o.id, _t(o.titre), o.icone]), this._ongletPar)}
        <div class="ed-mcontenu">${panneaux}</div></div></div>`);
    this._cablerChamps(V);
    V.querySelectorAll("[data-pal-coul]").forEach((inp) => { inp.onchange = () => this.commit(() => { (this.d.palette ||= {})[inp.dataset.palCoul] = inp.value; }); });
    const c = V.querySelector(".ed-mcontenu");
    if (c) c.scrollTop = defile;
    this._indiceDefilement(V.querySelector(".ed-onglets"));
    if (garde === "conf") V.querySelector('[data-par-conf="oui"]')?.focus({ preventScroll: true });
    else if (garde?.startsWith("onglet:")) V.querySelector(`[data-onglet-par="${garde.slice(7)}"]`)?.focus({ preventScroll: true });
    else if (garde?.startsWith("action:")) V.querySelector(`[data-par-action="${garde.slice(7)}"]`)?.focus({ preventScroll: true });
    else if (garde === "fermer") V.querySelector("[data-par-fermer]")?.focus({ preventScroll: true });
    else if (garde) (V.querySelector(`button[data-par="${garde}"].on`) || V.querySelector(`[data-par="${garde}"]`))?.focus({ preventScroll: true });
  }
  // champ d'un réglage déclaratif (modales ⚙ Paramètres et Ambiance) : interrupteur, choix, nombre, curseur, texte, entité, palette, action
  _htmlChamp(f) {
    const d = this.d, hass = this.hass, valeur = (f) => lireReglage(d, f);
    // aide d'un réglage : bulle ⓘ après son libellé (plus de texte permanent sous le champ)
    const aide = (f) => (f.aide ? bulleI(_t(f.aide)) : "");
      const k = esc(f.chemin || f.id || ""), lib = esc(_t(f.libelle ?? f.nom ?? "")), v = f.chemin ? valeur(f) : undefined;
      if (f.type === "intertitre") return `<div class="ed-par-inter">${lib}</div>`;
      if (f.type === "bool") {
        const conf = f.confirmer && this._confParam === f.chemin ? f.confirmer : null;
        return `<div class="ed-par"><label class="ed-inter"><span>${lib}${aide(f)}</span><input type="checkbox" data-par="${k}" ${v ? "checked" : ""}></label>
          ${conf ? `<div class="ed-confirme" role="alertdialog" aria-labelledby="ed-conf-t" aria-describedby="ed-conf-d"><b id="ed-conf-t"><ha-icon icon="mdi:alert-outline"></ha-icon>${esc(_t(conf.titre))}</b>
            <p id="ed-conf-d">${esc(_t(conf.texte))}</p><div class="ed-actions"><button class="ed-btn texte" data-par-conf="non">${_t("Annuler")}</button>
            <button class="ed-btn danger" data-par-conf="oui">${esc(_t(conf.bouton))}</button></div></div>` : ""}</div>`;
      }
      if (f.type === "choix") {
        // valeur inconnue des options (ex. `language: auto`) : affichée comme la valeur par défaut
        const connue = f.options.some(([val]) => memeValeur(val, v)), opts = f.options.map(([val, l, brut], j) => ({ j, on: memeValeur(val, connue ? v : f.defaut), l: brut ? l : _t(l) }));
        if (opts.length <= 4) return `<div class="ed-champ"><span class="ed-par-lib"><span id="par-${k}">${lib}</span>${aide(f)}</span><span class="ed-seg petit plein" role="group" aria-labelledby="par-${k}">${opts.map((o) => `<button type="button" data-par="${k}" data-val="${o.j}" class="${o.on ? "on" : ""}" aria-pressed="${o.on}">${esc(o.l)}</button>`).join("")}</span></div>`;
        return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><select id="par-${k}" data-par="${k}">${opts.map((o) => `<option value="${esc(o.j)}" ${o.on ? "selected" : ""}>${esc(o.l)}</option>`).join("")}</select></div>`;
      }
      if (f.type === "nombre") return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><div class="ed-unite"><input type="number" id="par-${k}" data-par="${k}" min="${f.min ?? ""}" max="${f.max ?? ""}" step="${f.pas || 1}" value="${esc(v ?? "")}" placeholder="${esc(f.defaut ?? "")}">${f.unite ? `<span aria-hidden="true">${esc(f.unite)}</span>` : ""}</div></div>`;
      if (f.type === "curseur") {
        // curseur MD3 avec la valeur affichée ; `auto` : bouton « Auto » (valeur null) ; `kelvin` : piste au vrai spectre (corps noir)
        const auto = !!f.auto && v == null, val = v ?? f.defaut, piste = f.kelvin ? ` style="--piste:${esc(pisteKelvin(this.carte.constructor.LUMIERE.kelvin, f.min, f.max))}"` : "";
        return `<div class="ed-champ ed-par-curseur${f.kelvin ? " kelvin" : ""}${auto ? " auto" : ""}"><label for="par-${k}">${lib}${aide(f)}</label><div class="ed-curseur">
          <input type="range" id="par-${k}" data-par="${k}" min="${f.min}" max="${f.max}" step="${f.pas || 1}" value="${esc(val)}"${piste} aria-valuetext="${esc(texteCurseur(f, auto ? null : val))}"><output>${esc(texteCurseur(f, auto ? null : val))}</output>
          ${f.auto && !auto ? `<button type="button" class="ed-btn texte" data-par-auto="${k}" title="${esc(_t("Teinte d'origine"))}" aria-label="${esc(_t("Teinte d'origine"))}">${_t("Auto")}</button>` : ""}</div></div>`;
      }
      if (f.type === "texte") return `<div class="ed-champ"><label for="par-${k}">${lib}${aide(f)}</label><input type="text" id="par-${k}" data-par="${k}" value="${esc(v ?? "")}" placeholder="${esc(f.placeholder ? _t(f.placeholder) : "")}"></div>`;
      if (f.type === "entite") {
        // zone Maison par défaut : son nom plutôt que l'identifiant technique en titre (l'identifiant reste en sous-titre)
        const s = v && hass.states[v], def = memeValeur(v, f.defaut), nom = s ? s.attributes.friendly_name || v : v === "zone.home" ? _t("Maison") : v || "";
        return `<div class="ed-champ"><label>${lib}${aide(f)}</label><button class="ed-entite" data-par="${k}" aria-label="${lib} : ${esc(nom || _t("Choisir…"))}">
          ${v ? `<ha-icon icon="${esc(iconeEntite(hass, v))}"></ha-icon><span class="n">${esc(nom)}<small>${esc(v)}${def ? ` · ${_t("par défaut")}` : ""}${s ? ` · ${esc(hass.formatEntityState?.(s) ?? s.state)}` : def ? "" : _t(" · introuvable")}</small></span>` : `<span class="n vide">${_t("Choisir…")}</span>`}
          ${def || f.defaut == null && !v ? "" : `<span class="ib x" data-par-effacer="${k}" title="${_t("Valeur par défaut")}"><ha-icon icon="mdi:close"></ha-icon></span>`}</button></div>`;
      }
      if (f.type === "palette") {
        const l = Object.entries(d.palette || {}), hex = (c) => hexOu(c, "#808080");
        return `<div class="ed-palette" role="group" aria-label="${lib}">${aide(f)}${l.map(([n, c]) => `<div class="ed-pal"><input type="color" data-pal-coul="${esc(n)}" value="${esc(hex(c))}" aria-label="${esc(_t("Couleur de « {nom} »", { nom: n }))}">
            <span class="n">${esc(n)}<small>${esc(c)}</small></span><button type="button" class="ib" data-pal-suppr="${esc(n)}" title="${esc(_t("Retirer « {nom} »", { nom: n }))}" aria-label="${esc(_t("Retirer « {nom} »", { nom: n }))}"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`).join("")}
          ${l.length ? "" : `<div class="ed-aide">${_t("Aucune couleur nommée.")}</div>`}
          <div class="ed-pal ed-pal-ajout"><input type="color" data-pal-nouv value="#1a73e8" aria-label="${_t("Nouvelle couleur")}"><input type="text" data-pal-nom maxlength="31" placeholder="${_t("Nom, ex. accent")}" aria-label="${_t("Nom de la nouvelle couleur")}">
            <button type="button" class="ed-btn tonal" data-pal-ajout="1"><ha-icon icon="mdi:plus"></ha-icon>${_t("Ajouter")}</button></div></div>`;
      }
      if (f.type === "action") {
        const ds = typeof f.desc === "function" ? f.desc(d, this) : f.desc;
        return `<button data-par-action="${k}"><ha-icon icon="${esc(f.icone || "mdi:open-in-app")}"></ha-icon><span>${lib}${ds ? `<small>${esc(_t(ds))}</small>` : ""}</span><ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon></button>`;
      }
      return "";
  }
  // événements des champs d'une modale (après chaque rendu) ; un curseur montre son effet en direct sur le plan pendant le glisser
  // (valeur posée sans historique), puis l'écrit au relâchement (une seule étape d'annulation)
  _cablerChamps(V) {
    V.querySelectorAll("input[data-par],select[data-par]").forEach((inp) => {
      const f = this._champParametre(inp.dataset.par);
      if (f?.type === "curseur") {
        inp.oninput = () => {
          const v = +inp.value, o = inp.parentElement.querySelector("output");
          if (this._glisse?.f !== f) this._glisse = { f, v0: lireReglage(this.d, f) };
          if (o) o.textContent = texteCurseur(f, v);
          inp.setAttribute("aria-valuetext", texteCurseur(f, v));
          inp.closest(".ed-par-curseur")?.classList.remove("auto");
          f.ecrire(this.d, v);
          this._apercuDirect();
        };
        inp.onchange = () => {
          const g = this._glisse;
          this._glisse = null;
          if (g?.f === f) f.ecrire(this.d, g.v0); // valeur d'avant : l'annulation y revient
          this._ecrireParametre(f, +inp.value);
        };
        return;
      }
      inp.onchange = () => {
        if (f.type === "bool") return this._ecrireParametre(f, inp.checked);
        if (f.type === "choix") return this._ecrireParametre(f, f.options[+inp.value][0]);
        if (f.type === "texte") return this._ecrireParametre(f, inp.value.trim());
        if (f.type !== "nombre") return;
        if (inp.value.trim() === "") return this._ecrireParametre(f, undefined);
        // hors bornes ou incohérente : refusée avec un message, jamais corrigée en silence
        const v = +inp.value, hors = !Number.isFinite(v) || (f.min != null && v < f.min) || (f.max != null && v > f.max), refus = hors ? null : f.valider?.(this.d, v);
        if (hors || refus) { this.snack(hors ? _t("Valeur refusée : de {min} à {max} {unite}.", { min: fmt(f.min), max: fmt(f.max), unite: f.unite || "" }).replace(/ \./, ".") : _t(refus)); this._panneau(); return V.querySelector(`[data-par="${f.chemin}"]`)?.focus(); }
        return this._ecrireParametre(f, v);
      };
    });
  }
  // aperçu en direct pendant un glisser : plan (et aperçu de la modale Ambiance) redessinés au plus une fois par image
  _apercuDirect() {
    if (this._rafApercu) return;
    this._rafApercu = requestAnimationFrame(() => { this._rafApercu = 0; this.carte._majAmbiance?.(); if (this.vueAmbiance) this._majApercuAmb(); });
  }
  // clic sur un champ d'une modale (choix, entité, effacer, Auto) : true si traité
  async _clicChamp(ch) {
    const el = (k) => ch.find((n) => n instanceof HTMLElement && n.dataset?.[k] != null);
    const ef = el("parEffacer");
    if (ef) { this._ecrireParametre(this._champParametre(ef.dataset.parEffacer), undefined); return true; }
    const au = el("parAuto");
    if (au) { this._ecrireParametre(this._champParametre(au.dataset.parAuto), null); return true; }
    const b = ch.find((n) => n instanceof HTMLButtonElement && n.dataset.par);
    const f = b && this._champParametre(b.dataset.par);
    if (f?.type === "choix") { this._ecrireParametre(f, f.options[+b.dataset.val][0]); return true; }
    if (f?.type === "entite") { const e = await this.choisirEntite({ titre: _t(f.libelle ?? f.nom ?? ""), domaine: f.domaine || "" }); if (e) this._ecrireParametre(f, e); return true; }
    return false;
  }
  // événements de la modale (posés une fois : le voile reste, son contenu est redessiné) : clics, onglets au clavier, focus piégé
  _cablerModaleParametres(V) {
    V.onpointerdown = (ev) => { this._basVoile = ev.target === V; };
    V.onclick = async (ev) => {
      if (ev.target === V) { if (this._basVoile) this.panneauParametres(false); return; }
      const ch = ev.composedPath(), el = (k) => ch.find((n) => n instanceof HTMLElement && n.dataset?.[k] != null);
      if (el("parFermer")) return this.panneauParametres(false);
      // version : documentation et signalement d'un problème, sur le dépôt (nouvel onglet)
      const ln = el("parLien");
      if (ln) { const D = customElements.get("maquette-card").DEPOT; return window.open(ln.dataset.parLien === "bug" ? `${D}/issues/new/choose` : `${D}#readme`, "_blank", "noopener,noreferrer"); }
      const og = el("ongletPar");
      if (og) return this.ongletParametres(og.dataset.ongletPar);
      const c = el("parConf");
      if (c) { const f = this._champParametre(this._confParam); this._confParam = null; if (c.dataset.parConf === "oui" && f) return this._ecrireParametre(f, false, true); this._rendreParametres(); return V.querySelector(`[data-par="${f?.chemin}"]`)?.focus(); }
      if (el("parEffacer")) ev.stopPropagation();
      if (el("parEffacer") || el("parAuto")) return this._clicChamp(ch);
      // raccourci : la modale se ferme, puis le panneau (ou le dialogue) visé s'ouvre
      const ps = el("palSuppr");
      if (ps) return this.commit(() => { delete this.d.palette?.[ps.dataset.palSuppr]; if (this.d.palette && !Object.keys(this.d.palette).length) delete this.d.palette; });
      if (el("palAjout")) return this.ajouterCouleurNommee(V.querySelector("[data-pal-nom]")?.value, V.querySelector("[data-pal-nouv]")?.value);
      const a = el("parAction");
      if (a) { const f = this._champParametre(a.dataset.parAction); this.panneauParametres(false); return f?.action(this); }
      return this._clicChamp(ch);
    };
    this._clavierModale(V, "ongletPar", (o) => this.ongletParametres(o));
  }
  // modale persistante (Paramètres, Ambiance, édition, Calques) : voile « ed-mvoile » ajouté à la carte, redessiné ensuite
  _mvoile(classe) {
    const V = document.createElement("div");
    V.className = `ed-mvoile ${classe}`;
    this.R.querySelector("ha-card").append(V);
    return V;
  }
  // onglets d'une modale (verticaux, en ligne sur écran étroit) : [id, titre traduit, icône] ; ids « <pre>-tab-<id> », data-onglet-<pre>
  _navOnglets(pre, lib, onglets, actif) {
    return `<nav class="ed-onglets" role="tablist" aria-label="${lib}" aria-orientation="${this._etroit() ? "horizontal" : "vertical"}">${onglets.map(([id, t, ic]) => { const on = id === actif;
      return `<button type="button" role="tab" id="${pre}-tab-${esc(id)}" aria-controls="${pre}-pan-${esc(id)}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-onglet-${pre}="${esc(id)}"><ha-icon icon="${esc(ic)}"></ha-icon><span>${esc(t)}</span></button>`; }).join("")}</nav>`;
  }
  // clavier d'une modale : flèches, Début et Fin d'un onglet à l'autre (onglet : clé dataset des onglets), Tab gardé dans la modale
  _clavierModale(V, onglet, ouvrir) {
    const attr = onglet && `[data-${onglet.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}]`;
    V.onkeydown = (ev) => {
      const tab = onglet && ev.composedPath().find((n) => n instanceof HTMLElement && n.dataset?.[onglet] != null);
      if (tab) {
        const l = [...V.querySelectorAll(attr)], i = l.indexOf(tab), n = l.length;
        const j = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[ev.key];
        if (j != null) { ev.preventDefault(); const t = l[(j + n) % n]; ouvrir(t.dataset[onglet]); t.focus(); return; }
      }
      if (ev.key === "Tab") this._pieger(ev, V.querySelector(".ed-modale"));
    };
  }
  // focus piégé dans un dialogue : Tab et Maj+Tab bouclent sur ses éléments atteignables
  _pieger(ev, boite) {
    if (!boite) return;
    const l = [...boite.querySelectorAll('button,input,select,textarea,[tabindex]')].filter((x) => !x.disabled && x.tabIndex >= 0 && x.getClientRects().length);
    if (!l.length) return;
    const a = this.R.activeElement, i = l.indexOf(a);
    if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); l[l.length - 1].focus(); }
    else if (!ev.shiftKey && (i === l.length - 1 || i < 0)) { ev.preventDefault(); l[0].focus(); }
  }
  // écriture d'un réglage : confirmation d'abord si le champ en demande une, puis historique (Ctrl+Z) et aperçu en direct
  // nom : minuscules sans accents, espaces en « _ » ; refusé s'il est vide, invalide ou déjà pris (message, jamais corrigé en silence)
  ajouterCouleurNommee(nom, couleur) {
    const n = String(nom || "").trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "_");
    if (!/^[a-z][a-z0-9_-]{0,30}$/.test(n)) return this.snack(_t("Nom refusé : une lettre d'abord, puis lettres, chiffres, « _ » ou « - » (31 au plus)."));
    if (this.d.palette?.[n]) return this.snack(_t("« {nom} » existe déjà dans la palette.", { nom: n }));
    if (!this.carte.constructor.couleurSure(couleur) || !/^#/.test(couleur)) return;
    this.commit(() => { (this.d.palette ||= {})[n] = couleur; });
  }
  _ecrireParametre(f, v, confirme = false) {
    if (!f) return;
    if (f.confirmer && !confirme && f.confirmer.quand(v)) {
      this._confParam = f.chemin;
      this._rendreParametres();
      return this.R.querySelector('.ed-mvoile [data-par-conf="oui"]')?.focus();
    }
    this._confParam = null;
    this.commit(() => (f.ecrire ? f.ecrire(this.d, v) : ecrireReglage(this.d, f, v)));
  }

} // @assemblage
