// pré-remplissage de la fiche et fusion avec une pastille — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- pré-remplissage de la fiche et fusion avec une pastille ----------
  // entités du même appareil HA (device_id) que l'entité du meuble, visibles et pas de configuration
  _entitesAppareil(e) {
    const hass = this.hass, dev = e && hass.entities?.[e]?.device_id;
    if (!dev) return [];
    return Object.entries(hass.entities).filter(([id, x]) => x.device_id === dev && !x.hidden && x.entity_category !== "config" && hass.states[id]).map(([id]) => id).sort();
  }
  // pastilles de la même entité à moins de 1,5 m du meuble
  _pastillesProches(m) {
    if (!m.entite) return [];
    return (this.d.points || []).map((p, j) => (p.entite === m.entite && Math.hypot(nbr(p.pos?.[0]) - nbr(m.pos?.[0]), nbr(p.pos?.[1]) - nbr(m.pos?.[1])) < 150 ? j : -1)).filter((j) => j >= 0);
  }
  fusionner(j) {
    const m = this._objet(), p = this.d.points?.[j];
    if (this.sel?.type !== "meuble" || !m || !p) return;
    const nom = p.nom || this.carte._nom(p.entite);
    this.commit(() => {
      for (const k of ["valeur", "actif", "actif_attribut", "seuil", "attribut", "unite", "decimales", "couleur"]) if (p[k] != null && p[k] !== "" && m[k] == null) m[k] = clone(p[k]);
      if (!m.nom && p.nom) m.nom = p.nom;
      this.d.points.splice(j, 1);
    });
    this.snack(p.halo ? _t("Pastille « {nom} » fusionnée dans le meuble (son halo est retiré).", { nom }) : _t("Pastille « {nom} » fusionnée dans le meuble.", { nom }), _t("Annuler##defaire"), this._annulation(), 10000);
  }
  // widgets proposés d'après le type de meuble et les entités de l'appareil (device_class, unités, noms) ; rien n'est écrit ici
  _proposerFiche(m) {
    const hass = this.hass, ents = this._entitesAppareil(m.entite).filter((e) => e !== m.entite || !["switch", "light", "fan", "input_boolean"].includes(e.split(".")[0]));
    const st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, u = (e) => String(st(e)?.attributes.unit_of_measurement || ""), dom = (e) => e.split(".")[0];
    const txt = (e) => sansAccent(`${e} ${st(e)?.attributes.friendly_name || ""}`);
    const capteur = (e) => dom(e) === "sensor";
    const souscrit = (e) => /souscri|subscri|abonnement/.test(txt(e));
    const G = {
      puissance: ents.filter((e) => capteur(e) && (dc(e) === "power" || ["W", "kW"].includes(u(e)))),
      apparente: ents.filter((e) => capteur(e) && !souscrit(e) && (dc(e) === "apparent_power" || ["VA", "kVA"].includes(u(e)))),
      energie: ents.filter((e) => capteur(e) && (dc(e) === "energy" || ["kWh", "Wh", "MWh"].includes(u(e)))),
      cout: ents.filter((e) => capteur(e) && !/\/\s*kwh/i.test(u(e)) && (dc(e) === "monetary" || /€|eur/i.test(u(e)))),
      prix: ents.filter((e) => capteur(e) && /\/\s*kwh/i.test(u(e))),
      tension: ents.filter((e) => capteur(e) && (dc(e) === "voltage" || u(e) === "V")),
      courant: ents.filter((e) => capteur(e) && (dc(e) === "current" || u(e) === "A")),
      temperature: ents.filter((e) => capteur(e) && (dc(e) === "temperature" || /°[CF]/.test(u(e)))),
      alerte: ents.filter((e) => dom(e) === "binary_sensor" && (["problem", "safety", "heat", "smoke", "moisture", "gas"].includes(dc(e)) || /alerte|alarm|surchauffe|overheat|defaut|erreur|fault/.test(txt(e)))),
      branche: ents.filter((e) => dom(e) === "binary_sensor" && ["plug", "battery_charging"].includes(dc(e))),
      climat: ents.filter((e) => dom(e) === "climate"), media: ents.filter((e) => dom(e) === "media_player"), souscrite: ents.filter((e) => capteur(e) && souscrit(e)),
    };
    // coût calculé par le tableau Énergie de HA pour un compteur de l'appareil (sensor.x_cost)
    for (const e of G.energie) for (const c of [`${e}_cost`, `${e}_cout`]) if (st(c) && !G.cout.includes(c)) G.cout.push(c);
    const ordre = (l) => [...l].sort((a, b) => { const r = (e) => [/session/, /jour|today|aujourd/, /hier|yesterday/, /semaine|week/, /mois|month/, /annee|annuel|year/].findIndex((x) => x.test(txt(e))); return ((r(a) + 7) % 7) - ((r(b) + 7) % 7) || a.localeCompare(b); });
    const lignes = (l) => l.map((e) => ({ entite: e }));
    const W = [], pw = G.puissance[0], reglages = {};
    const conso = (titre, extra = []) => {
      const l = [...extra, ...ordre(G.energie), ...ordre(G.cout)];
      if (pw) W.push({ type: "tuile", titre, icone: "mdi:flash", entite: pw, decimales: 0, historique: 24, ...(l.length ? { lignes: lignes(l) } : {}) });
      else if (l.length) W.push({ type: "entites", titre, entites: lignes(l) });
    };
    if (m.type === "borne_recharge") {
      conso(_t("Puissance de charge"));
      const l = [...G.branche, ...G.tension, ...G.temperature, ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Borne"), icone: "mdi:ev-station", entites: lignes(l) });
    } else if (m.type === "tableau_elec") {
      const p = pw || G.apparente[0], sc = G.souscrite.map((e) => parseFloat(st(e).state) * (/^k/i.test(u(e)) ? 1000 : 1)).find((x) => x > 0);
      if (p) W.push({ type: "jauge", titre: _t("Puissance"), icone: "mdi:home-lightning-bolt", entite: p, min: 0, max: Math.round(sc || 6000), decimales: 0 });
      const res = [...G.apparente.filter((e) => e !== p), ...G.puissance.filter((e) => e !== p), ...G.tension, ...G.courant];
      if (res.length) W.push({ type: "entites", titre: _t("Réseau"), icone: "mdi:transmission-tower", entites: lignes(res) });
      const en = ordre(G.energie);
      if (en.length) W.push({ type: "entites", titre: _t("Consommation"), icone: "mdi:lightning-bolt", entites: lignes([...en, ...ordre(G.cout)]) });
      // Tempo et prix : souvent une autre intégration que le compteur, cherchés dans toute l'installation
      // (plusieurs candidats : le mieux classé seulement s'il se détache, sinon rien, à choisir dans l'éditeur ; jamais le premier venu)
      const tous = Object.keys(hass.states), meilleur = (l, note) => {
        const t = l.map((e) => [e, note(e)]).sort((a, b) => b[1] - a[1]);
        return t.length === 1 || (t.length > 1 && t[0][1] > t[1][1]) ? t[0][0] : null;
      };
      // couleur Tempo : un capteur dont l'état est une couleur (bleu, blanc, rouge), pas un compte de jours restants
      const COULEUR = /^(?:bleu|blanc|rouge|blue|white|red)$/i, COMPTE = /restant|remaining|nombre|count|jours (?:bleu|blanc|rouge)|days/;
      const tempo = (re, non) => meilleur(tous.filter((e) => e.startsWith("sensor.") && /tempo/.test(txt(e)) && re.test(txt(e)) && !non.test(txt(e)) && !COMPTE.test(txt(e))),
        (e) => (COULEUR.test(String(st(e)?.state || "")) ? 2 : 0) + (/couleur|color/.test(txt(e)) ? 1 : 0));
      // prix du kWh : celui en cours plutôt qu'heures creuses / pleines, moyenne ou prix d'un autre jour
      const prix = meilleur(G.prix.length ? G.prix : tous.filter((e) => e.startsWith("sensor.") && /\/\s*kwh/i.test(u(e))),
        (e) => (/en cours|actuel|courant|current|now|instant/.test(txt(e)) ? 2 : 0) - (/\bh[cp]\b|creuse|pleine|peak|moyen|average|mensuel|month|annuel|year|hier|yesterday|demain|tomorrow/.test(txt(e)) ? 1 : 0));
      const cj = tempo(/aujourd|today|jour|actuel|current/, /demain|tomorrow/), cd = tempo(/demain|tomorrow/, /^$/);
      if (prix || cj || cd) W.push({ type: "tarif", titre: _t("Tarif"), ...(prix ? { prix } : {}), ...(cj ? { couleur_jour: cj } : {}), ...(cd ? { couleur_demain: cd } : {}) });
    } else if (m.type === "chaudiere" || G.climat.length) {
      const l = [...G.climat, ...G.temperature, ...G.puissance, ...ordre(G.energie), ...G.alerte];
      if (l.length) W.push({ type: "entites", titre: _t("Chauffage"), icone: "mdi:water-boiler", entites: lignes(l) });
    } else {
      conso(m.type === "meuble_tv" ? _t("Télévision") : _t("Consommation"), G.media);
      if (!pw && !G.energie.length) { const l = ents.filter((e) => e !== m.entite).slice(0, 8); if (l.length) W.push({ type: "entites", titre: _t("Appareil"), entites: lignes(l) }); }
      else if (G.alerte.length || G.temperature.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes([...G.temperature, ...G.alerte]) });
    }
    if (!m.valeur && pw) reglages.valeur = pw;
    if (!m.actif && pw && ["switch", "input_boolean"].includes(dom(m.entite || ""))) Object.assign(reglages, { actif: pw, seuil: m.type === "borne_recharge" ? 50 : 5 });
    return { widgets: W, reglages, n: ents.length };
  }
  // entités de référence d'une ouverture ou d'une pastille (contact, volet, entité motorisée ; entité de la pastille)
  _sources(genre, o) { return (genre === "ouverture" ? [...contactsOuv(o), o.volet, o.entite] : genre === "point" ? [o.entite] : [o.entite]).filter((e) => typeof e === "string" && e.includes(".")); }
  // propositions selon le genre de l'élément ; rien n'est écrit ici
  _proposer(genre, o) {
    if (genre === "meuble") return this._proposerFiche(o);
    return genre === "ouverture" ? this._proposerFicheOuverture(o) : this._proposerFichePoint(o);
  }
  // capteurs d'un appareil de contact : batterie, manipulation (tamper), compteurs du jour (« ouvertures », « aération »)
  _capteursContact(ents) {
    const hass = this.hass, st = (e) => hass.states[e], dc = (e) => st(e)?.attributes.device_class, dom = (e) => e.split(".")[0];
    const txt = (e) => sansAccent(`${e} ${st(e)?.attributes.friendly_name || ""}`);
    const compteurs = ents.filter((e) => dom(e) === "sensor" && /ouvertures|aeration|openings|times opened|airing|ventilation/.test(txt(e)));
    let batterie = ents.filter((e) => dom(e) === "sensor" && (dc(e) === "battery" || (/batter/.test(txt(e)) && st(e)?.attributes.unit_of_measurement === "%")));
    if (!batterie.length) batterie = ents.filter((e) => dom(e) === "binary_sensor" && dc(e) === "battery");
    const tamper = ents.filter((e) => dom(e) === "binary_sensor" && (dc(e) === "tamper" || /tamper|manipulation|sabotage|arrachement/.test(txt(e))));
    return { batterie, tamper, compteurs };
  }
  // ouverture : volet ou portail en widget « commande », contact, batterie, manipulation, compteurs du jour (même appareil HA)
  _proposerFicheOuverture(o) {
    const hass = this.hass, src = this._sources("ouverture", o), ents = [...new Set(src.flatMap((e) => this._entitesAppareil(e)))].filter((e) => !src.includes(e));
    const dom = (e) => e.split(".")[0], lignes = (l) => [...new Set(l)].map((e) => ({ entite: e })), W = [];
    const { batterie, tamper, compteurs } = this._capteursContact(ents), cover = (e) => typeof e === "string" && e.startsWith("cover.");
    const icone = { fenetre: "mdi:window-closed-variant", porte: "mdi:door", portail: "mdi:gate" }[o.type] || "mdi:door";
    if (o.type === "portail") {
      const c = cover(o.entite) ? o.entite : cover(o.volet) ? o.volet : null;
      if (c) W.push({ type: "commande", titre: o.nom || hass.states[c]?.attributes.friendly_name || _t("Portail"), entite: c, confirmer: true });
      // capteurs liés : ceux des mêmes appareils (hors diagnostic, sauf la batterie), le contact s'il y en a un
      const diag = (e) => hass.entities?.[e]?.entity_category === "diagnostic";
      const autres = ents.filter((e) => ["binary_sensor", "sensor"].includes(dom(e)) && (!diag(e) || batterie.includes(e)));
      const l = [...contactsOuv(o), ...autres].filter(Boolean);
      if (l.length) W.push({ type: "entites", titre: _t("Capteurs"), icone: "mdi:gate", entites: lignes(l) });
      return { widgets: W, reglages: {}, n: ents.length + src.length };
    }
    if (cover(o.volet)) W.push({ type: "commande", titre: _t("Volet"), entite: o.volet });
    if (cover(o.entite)) W.push({ type: "commande", titre: o.nom || hass.states[o.entite]?.attributes.friendly_name || _t("Ouverture motorisée"), entite: o.entite });
    const nc = contactsOuv(o).length, capteur = [...contactsOuv(o), ...batterie, ...tamper].filter(Boolean);
    // le contact seul n'apporte rien de plus que l'en-tête de la fiche, sauf à côté d'un volet ; plusieurs contacts : déjà listés en tête de la fiche
    if (capteur.length > nc || (nc === 1 && W.length)) W.push({ type: "entites", titre: _t("Capteur"), icone, entites: lignes(capteur) });
    if (compteurs.length) W.push({ type: "entites", titre: _t("Aujourd'hui"), icone: "mdi:counter", entites: lignes(compteurs) });
    return { widgets: W, reglages: {}, n: ents.length + src.length };
  }
  // pastille : selon le domaine de son entité (cover → commande, capteur → courbe, détecteur → batterie…, sinon comme un meuble)
  _proposerFichePoint(p) {
    const hass = this.hass, e = p.entite;
    if (typeof e !== "string" || !e.includes(".")) return { widgets: [], reglages: {}, n: 0 };
    const d = e.split(".")[0], ents = this._entitesAppareil(e).filter((x) => x !== e), st = (x) => hass.states[x], dom = (x) => x.split(".")[0], lignes = (l) => [...new Set(l)].map((x) => ({ entite: x }));
    const diag = (x) => hass.entities?.[x]?.entity_category === "diagnostic", mesures = ents.filter((x) => ["sensor", "binary_sensor"].includes(dom(x)) && !diag(x));
    const W = [];
    if (d === "cover") {
      W.push({ type: "commande", titre: p.nom || st(e)?.attributes.friendly_name || _t("Commande"), entite: e });
      if (mesures.length) W.push({ type: "entites", titre: _t("Capteurs"), entites: lignes(mesures) });
    } else if (d === "sensor") {
      const num = !isNaN(parseFloat(st(e)?.state));
      W.push(num ? { type: "tuile", titre: st(e)?.attributes.friendly_name || _t("Valeur"), entite: e, historique: 24 } : { type: "entites", titre: _t("Valeur"), entites: lignes([e]) });
      if (mesures.length) W.push({ type: "entites", titre: _t("Mesures"), entites: lignes(mesures.slice(0, 8)) });
    } else if (d === "binary_sensor") {
      const { batterie, tamper } = this._capteursContact(ents), reste = mesures.filter((x) => !batterie.includes(x) && !tamper.includes(x));
      W.push({ type: "entites", titre: _t("Détecteur"), icone: p.icone, entites: lignes([e, ...batterie, ...tamper, ...reste.slice(0, 6)]) });
    } else return { ...this._proposerFiche({ entite: e }), reglages: {} }; // lumière, prise, média, climat… : comme un meuble connecté, sans toucher à la pastille
    return { widgets: W, reglages: {}, n: ents.length + 1 };
  }
  // aperçu des widgets proposés (vrai rendu), puis « Ajouter » ou « Remplacer la fiche »
  remplirFiche() {
    const s = this.sel, m = this._objet(), src = m && Object.hasOwn(GENRES_FICHE, s?.type) ? this._sources(s.type, m) : [];
    if (!src.length) return;
    const { widgets, reglages, n } = this._proposer(s.type, m), e0 = src.find((e) => this.hass.entities?.[e]?.device_id) || src[0], dev = this.hass.devices?.[this.hass.entities?.[e0]?.device_id];
    if (!widgets.length) return this.snack(s.type === "meuble" ? _t("Rien à proposer : l'appareil n'a pas de mesure reconnue (puissance, énergie, coût, tension…).") : _t("Rien à proposer : pas d'autre entité reconnue sur cet appareil."));
    const deja = (m.fiche?.widgets || []).length, R = this.R, carte = this.carte;
    let apercu;
    carte._sansBascule = true;
    try { apercu = widgets.map((w, j) => { try { return carte._widget(w, "apercu", j); } catch (e) { return ""; } }).join("").replace(/ data-w="[^"]*"/g, ""); } finally { carte._sansBascule = false; }
    const NOMS = { valeur: _t("Valeur affichée"), actif: _t("Actif selon"), seuil: _t("au-dessus de") };
    const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue large" role="dialog" aria-modal="true" aria-label="${_t("Remplir la fiche depuis l'appareil")}"><header><h2>${_t("Remplir la fiche depuis l'appareil")}</h2>
        <div class="ed-aide">${_t("« {nom} » : {n} entité. Widgets proposés.|« {nom} » : {n} entités. Widgets proposés.", { nom: esc(dev?.name_by_user || dev?.name || this.carte._nom(e0)), n })}</div></header>
      <div class="ed-cat"><div class="ed-apercu-fiche">${apercu}</div>
        ${Object.keys(reglages).length ? `<h4>${s.type === "meuble" ? _t("Réglages du meuble") : _t("Réglages de l'élément")}</h4><div class="ed-aide">${Object.entries(reglages).map(([k, v]) => `${NOMS[k]} : ${esc(k === "seuil" ? `${v}` : this.carte._nom(v))}`).join(" · ")}</div>` : ""}</div>
      <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="">${_t("Annuler")}</button>
        ${deja ? `<button class="ed-btn texte" data-r="remplacer">${_t("Remplacer la fiche ({n} widget)|Remplacer la fiche ({n} widgets)", { n: deja })}</button>` : ""}
        <button class="ed-btn plein" data-r="ajouter"><ha-icon icon="mdi:check"></ha-icon>${deja ? _t("Ajouter à la fiche") : _t("Ajouter")}</button></footer></div>`, { echap: () => fermer(null) });
    const fermer = (r) => {
      retirer();
      if (!r) return;
      this.commit(() => {
        const l = this._wl({ cote: "fiche", [s.type]: s.i }, true);
        if (r === "remplacer") l.length = 0;
        l.push(...clone(widgets));
        Object.assign(m, reglages);
        this.sel = { type: s.type, i: s.i };
      });
      this.snack(_t("Fiche remplie : {n} widget. Clique-les dans l'aperçu pour les modifier.|Fiche remplie : {n} widgets. Clique-les dans l'aperçu pour les modifier.", { n: widgets.length }), _t("Annuler##defaire"), this._annulation(), 10000);
    };
    // l'aperçu n'est pas éditable : ses clics ne vont pas à la carte (sélection d'un widget, plus d'infos…)
    voile.onclick = (ev) => { ev.stopPropagation(); const b = ev.composedPath().find((x) => x.dataset?.r != null); if (ev.target === voile || b) fermer(b?.dataset.r || null); };
    voile.querySelector("[data-r=ajouter]").focus();
  }
  // fiche vide (ni titre ni widget) : clé retirée, le YAML reste minimal
  _nettoyerFiche(m) {
    if (!m?.fiche || typeof m.fiche !== "object") return;
    if (Array.isArray(m.fiche.widgets) && !m.fiche.widgets.length) delete m.fiche.widgets;
    if (!m.fiche.titre) delete m.fiche.titre;
    if (!Object.keys(m.fiche).length) delete m.fiche;
  }
  async enregistrerFiche() {
    const m = this._objet(), l = m?.fiche?.widgets || [];
    if (!l.length) return;
    const r = await this.demander(_t("Enregistrer la fiche comme modèle"), m.fiche.titre || m.nom || (this.sel?.type === "meuble" ? (MEUBLES()[m.type] ? _t(MEUBLES()[m.type].nom) : null) : this.sel?.type === "point" ? this.carte._nom(m.entite) : null) || _t("Fiche"), _t("Garder les entités (sinon les widgets sont à relier à nouveau)"));
    if (!r) return;
    const objets = r.coche ? clone(l) : sansEntites(clone(l));
    this.commit(() => (this.d.modeles ||= []).push({ nom: r.nom, genre: "widget", icone: "mdi:card-text-outline", desc: _t("Fiche · {n} widget|Fiche · {n} widgets", { n: l.length }), objets }));
    this.snack(_t("Modèle « {nom} » ajouté (Ajouter › Mes modèles).", { nom: r.nom }));
  }

} // @assemblage
