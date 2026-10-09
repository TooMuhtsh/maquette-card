// panneaux et widgets : lignes, climat, thermostat, commandes, serrure, statistiques, courbes — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // pleine page : un panneau trop haut est réduit (zoom CSS) pour tenir
  // (réduction plafonnée à 85 % pour rester lisible, au-delà défilement sans barre ; même échelle pour les deux colonnes)
  _ajusterCols() {
    const R = this.shadowRoot, plein = R?.querySelector("ha-card")?.classList.contains("plein");
    const cols = [...(R?.querySelectorAll(".col") || [])];
    cols.forEach((col) => { col.querySelector(".col-in").style.zoom = ""; });
    if (!plein || this._modeMise === "etroit") return;
    const vis = cols.filter((c) => !c.hidden);
    let z = 1;
    for (const col of vis) {
      const h = col.querySelector(".col-in").getBoundingClientRect().height / (this._zVue || 1);
      if (h > col.clientHeight + 1) z = Math.min(z, col.clientHeight / h);
    }
    z = Math.max(0.85, z);
    if (z < 1) vis.forEach((col) => { col.querySelector(".col-in").style.zoom = String(z); });
    const fondu = (col) => col.classList.toggle("suite", col.scrollTop + col.clientHeight < col.scrollHeight - 2);
    vis.forEach((col) => { fondu(col); col.onscroll ||= () => fondu(col); });
  }

  // panneaux affichés : ceux de la pièce isolée (ou sélectionnée dans l'éditeur), sinon ceux de la maison
  _panneauxCourants() {
    const c = this._config, s = this._editeur?.sel;
    let pi = this._iso;
    if (this._editeur) {
      // meuble connecté, ouverture ou pastille sélectionné (ou un widget de sa fiche) : la colonne de droite montre sa fiche, en vrai rendu
      const seul = this._editeur.multi.size <= 1;
      const pf = s?.type === "widget" && s.cote === "fiche" ? porteurDe(s)
        : seul && (s?.type === "meuble" ? estConnecte(c.meubles?.[s.i]) : s?.type === "ouverture" || s?.type === "point") ? { genre: s.type, i: s.i } : null;
      const o = pf && c[GENRES_FICHE[pf.genre]]?.[pf.i];
      if (o) return { P: { droite: o.fiche?.widgets || [] }, pi: null, pf };
      pi = s?.type === "piece" && this._editeur.multi.size <= 1 ? s.i : s?.type === "widget" && s.piece != null ? s.piece : null;
    }
    // mode tablette sans panneaux : ni ceux de la maison ni ceux des pièces (la fiche de la pièce reste)
    if (this._tablette() && !this._tablette().panneaux) return { P: {}, pi: pi != null && c.pieces[pi] ? pi : null };
    if (pi != null && c.pieces[pi]) return { P: c.pieces[pi].panneaux || {}, pi };
    return { P: c.panneaux || {}, pi: null };
  }

  _widgets() {
    const R = this.shadowRoot;
    if (!R || !this._hass) return;
    const { P, pi, pf } = this._panneauxCourants(), g = P.gauche || [], d = P.droite || [];
    const suf = pi != null ? `:${pi}` : pf ? sufFiche(pf) : "";
    const ajout = (cote) => (this._editeur ? `<button class="w-ajout" data-ajouter="${cote}"><ha-icon icon="mdi:plus"></ha-icon>${cote === "fiche" ? _t("Ajouter un widget à la fiche") : this._modeMise === "large" ? _t("Ajouter un widget") : cote === "gauche" ? _t("Ajouter un widget (gauche)") : _t("Ajouter un widget (droite)")}</button>` : "");
    const rendu = (l, cote) => {
      this._sansBascule = cote === "fiche"; // aperçu fidèle : pas d'interrupteur dans une fiche
      try { return l.map((w, i) => { try { return this._widget(w, cote, i, suf); } catch (e) { return `<div class="w" data-w="${cote}:${i}${suf}"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }).join(""); }
      finally { this._sansBascule = false; }
    };
    const es = this._editeur?.sel, sel = es?.type === "widget" ? `${es.cote}:${es.i}${es.piece != null ? `:${es.piece}` : porteurDe(es) ? sufFiche(porteurDe(es)) : ""}` : null;
    let change = false;
    const poser = (el, html) => { if (el._html !== html) { poserHTML(el, html); el._html = html; change = true; } };
    if (pf) {
      const t = this._enteteFiche(pf.genre, this._config[GENRES_FICHE[pf.genre]][pf.i]).titre;
      const note = { meuble: _t("Fiche « {t} » : ce qui s'ouvre au toucher du meuble", { t: esc(t) }), ouverture: _t("Fiche « {t} » : ce qui s'ouvre au toucher de l'ouverture", { t: esc(t) }),
        point: _t("Fiche « {t} » : ce qui s'ouvre au toucher de la pastille", { t: esc(t) }) }[pf.genre];
      poser(R.querySelector(".col-g .widgets"), "");
      poser(R.querySelector(".col-d .widgets"), `<div class="w-note w-fiche"><ha-icon icon="mdi:card-text-outline"></ha-icon>${note}</div>${rendu(d, "fiche")}${ajout("fiche")}`);
    } else if (this._modeMise === "large") { poser(R.querySelector(".col-g .widgets"), rendu(g, "gauche") + ajout("gauche")); poser(R.querySelector(".col-d .widgets"), rendu(d, "droite") + ajout("droite")); }
    else { poser(R.querySelector(".col-g .widgets"), ""); poser(R.querySelector(".col-d .widgets"), rendu(g, "gauche") + ajout("gauche") + rendu(d, "droite") + ajout("droite")); }
    if (change) this._ajusterCols();
    R.querySelectorAll(".w.sel").forEach((n) => n.classList.remove("sel"));
    if (sel) R.querySelector(`.w[data-w="${sel}"]`)?.classList.add("sel");
    this._majFiche();
  }

  _val(e, dec, unite) {
    const s = this._etat(e);
    if (!s) return { t: "—", u: "" };
    const n = parseFloat(s.state);
    if (isNaN(n)) return { t: this._hass.formatEntityState?.(s) ?? s.state, u: "" };
    return { t: fmt(n, dec ?? (Math.abs(n) >= 100 ? 0 : 1)), u: unite ?? s.attributes.unit_of_measurement ?? "" };
  }

  _tete(w, defIcone, droite = "") {
    return `<div class="w-tete"><ha-icon icon="${esc(w.icone || defIcone)}"></ha-icon><span>${esc(w.titre || "")}</span>${droite ? `<span class="d">${droite}</span>` : ""}</div>`;
  }

  // interrupteur marche / arrêt (vue de la pièce, lignes des widgets) : `protected` (o.protege) = pas d'arrêt depuis le plan
  // (grisé tant que l'appareil est allumé), `confirm: true` (o.confirmer) = confirmation avant chaque appel
  _interrupteur(e, s, o = {}) {
    const on = s.state === "on", prot = o?.protege === true;
    return `<input type="checkbox" class="bascule" data-b="${esc(e)}"${prot ? ` data-p="1"` : ""}${o?.confirmer === true ? ` data-cf="1"` : ""} ${on ? "checked" : ""}${prot && on ? ` disabled title="${_t("Appareil protégé : pas d'arrêt depuis le plan.")}"` : ""} aria-label="${_t("Basculer")}">`;
  }
  // appui sur un interrupteur : bascule (allumage seul si protégé) ; annulé ou en échec, l'interrupteur revient à sa position
  _basculer(bas) {
    const e = bas.dataset.b, voulu = bas.checked, prot = bas.dataset.p === "1";
    if (this._editeur || !e) return;
    if (bas.disabled || (prot && !voulu)) { bas.checked = !voulu; return; }
    const remettre = () => { if (bas.isConnected) bas.checked = !voulu; };
    this._appeler("homeassistant", prot ? "turn_on" : "toggle", { entity_id: e }, undefined, { forcer: bas.dataset.cf === "1", libelle: bas.getAttribute("aria-label") || "" })
      .then((fait) => { if (!fait) remettre(); }, remettre);
  }

  // lignes d'un widget ; `confirm: true` du widget (w) : ses interrupteurs et ses boutons « Activer » demandent confirmation
  _lignes(liste, w = {}) {
    const cf = w?.confirmer === true ? ` data-cf="1"` : "";
    return `<div class="w-lignes">${(liste || []).map((l) => {
      const o = typeof l === "string" ? { entite: l } : l, s = this._etat(o.entite), v = this._val(o.entite, o.decimales, o.unite);
      const dom = (o.entite || "").split(".")[0];
      return `<div class="w-ligne" data-e="${esc(o.entite)}"><ha-icon icon="${esc(o.icone || s?.attributes.icon || "mdi:circle-small")}"></ha-icon><span class="n">${esc(o.nom || s?.attributes.friendly_name || o.entite)}</span>
        ${BASCULES.includes(dom) && s && !this._sansBascule ? this._interrupteur(o.entite, s, w)
          : Object.hasOwn(ACTIVABLES, dom) && s && !this._sansBascule ? `<button class="w-activer" data-active="${esc(o.entite)}"${cf}${s.state === "unavailable" ? ` aria-disabled="true"` : ""}>${_t("Activer##lancer")}</button>`
          : `<span class="v${enAlarme(o.entite, s) ? " alerte" : ""}">${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}</span>`}</div>`;
    }).join("")}</div>`;
  }

  _widget(w, cote, i, suf = "") {
    const id = `${cote}:${i}${suf}`, coul = couleurSure(w.couleur) ? `--w-couleur:${couleurSure(w.couleur)}` : "";
    const ouvre = (inner) => `<div class="w" data-w="${id}" style="${coul}">${inner}</div>`;
    if (w.type === "separateur") return `<div class="w w-sep${w.titre ? "" : " vide"}" data-w="${id}"${w.espace ? ` style="margin:${+w.espace}px 0"` : ""}>${esc(w.titre || "")}</div>`;
    if (w.type === "tuile") {
      const v = this._val(w.entite, w.decimales, w.unite);
      const h = w.historique ? this._histo(w.entite, w.historique) : null;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:gauge")}<div class="w-grand${enAlarme(w.entite, this._etat(w.entite)) ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(v.t)}<small>${esc(v.u)}</small></div>
        ${h ? this._courbe(h) : ""}${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "jauge") {
      const n = this._num(w.entite), mn = +(w.min ?? 0), mx = +(w.max ?? 100), k = n == null ? 0 : Math.max(0, Math.min(1, (n - mn) / (mx - mn || 1)));
      const v = this._val(w.entite, w.decimales, w.unite);
      const col = (w.seuils && typeof w.seuils === "object" && n != null && couleurSeuils(w.seuils, n)) || couleurSure(w.couleur) || (k < 0.6 ? "#188038" : k < 0.85 ? "#e8710a" : "#d93025");
      const L = 0.75 * 2 * Math.PI * 80;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:speedometer")}<div class="w-jauge" data-e="${esc(w.entite)}"><svg viewBox="0 0 200 200"><g transform="rotate(135 100 100)">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--md-outline-variant)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L} 999"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="${esc(col)}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(L * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></g></svg>
        <div class="val">${esc(v.t)}<small>${esc(v.u)}${w.max ? ` · ${fmt(k * 100, 0)}${globalThis.MaquetteI18n.pct()}` : ""}</small></div></div>
        <div class="w-bornes"><span>${fmt(mn, 3)}</span><span>${fmt(mx, 3)}</span></div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "entites") return ouvre(`${this._tete(w, "mdi:format-list-bulleted")}${this._lignes(w.entites, w)}`);
    if (w.type === "tarif") {
      const s = this._etat(w.prix), n = this._num(w.prix), sp = this._etat(w.periode), per = sp?.state || "";
      // période indisponible ou inconnue : pastille neutre (ni heures pleines ni heures creuses)
      const perIndispo = ["unavailable", "unknown"].includes(per), creuse = /creuse|off.?peak/i.test(per);
      // couleurs Tempo telles que HA les donne : en français (Bleu…) ou en anglais (Blue…)
      const tempo = { bleu: ["#1a73e8", "#fff"], blanc: ["#f1f3f4", "#202124"], rouge: ["#d93025", "#fff"] };
      Object.assign(tempo, { blue: tempo.bleu, white: tempo.blanc, red: tempo.rouge });
      const pastille = (nom, e) => {
        const st = this._etat(e)?.state || "", c = tempo[st.toLowerCase()];
        return e ? `<span class="pastille${c ? " forte" : ""}" data-e="${esc(e)}" style="${c ? `--p-couleur:${c[0]};--p-texte:${c[1]}` : ""}">${_t("{nom} : {etat}", { nom: esc(nom), etat: esc(st || "—") })}</span>` : "";
      };
      return ouvre(`${this._tete(w, "mdi:cash-clock")}<div class="w-grand" data-e="${esc(w.prix)}">${n != null ? fmt(n, 4) : "—"}<small>${esc(s?.attributes.unit_of_measurement || "€/kWh")}</small></div>
        <div class="pastilles">${per ? `<span class="pastille${perIndispo ? "" : " forte"}" data-e="${esc(w.periode)}"${perIndispo ? "" : ` style="--p-couleur:${creuse ? "#188038" : "#e8710a"}"`}>${esc(perIndispo ? this._hass.formatEntityState?.(sp) ?? _t("Indisponible") : per)}</span>` : ""}
        ${pastille(_t("Aujourd'hui"), w.couleur_jour)}${pastille(_t("Demain"), w.couleur_demain)}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "ve") {
      // puissance ramenée en W selon l'unité de l'entité (W, kW, MW) ; le seuil `threshold` est en W
      const pu = String(this._etat(w.puissance)?.attributes.unit_of_measurement || "W").trim(), kp = /^kW$/i.test(pu) ? 1000 : /^MW$/.test(pu) ? 1e6 : 1;
      const bat = this._num(w.batterie), pw0 = this._num(w.puissance), pw = pw0 == null ? null : pw0 * kp, charge = pw != null && pw > nb(w.seuil ?? 50, 50);
      const br = this._etat(w.branche), branche = br ? ["on", "plugged", "connected", "true"].includes(br.state.toLowerCase()) : null;
      const etat = charge ? _t("En charge · {p} {u}", { p: fmt(pw / (pw >= 1000 ? 1000 : 1), pw >= 1000 ? 2 : 0), u: pw >= 1000 ? "kW" : "W" }) : branche === true ? _t("Branchée") : branche === false ? _t("Débranchée") : _t("À l'arrêt");
      const C = 2 * Math.PI * 42, k = bat == null ? 0 : Math.max(0, Math.min(1, bat / 100));
      const col = charge ? "#188038" : bat != null && bat < 20 ? "#d93025" : "var(--md-primary)";
      const lignes = [w.autonomie && { entite: w.autonomie, icone: "mdi:map-marker-distance", nom: _t("Autonomie") }, w.session_kwh && { entite: w.session_kwh, icone: "mdi:lightning-bolt", nom: _t("Session"), decimales: 1 },
        w.session_cout && { entite: w.session_cout, icone: "mdi:currency-eur", nom: _t("Coût de la session"), decimales: 2 }, ...(w.lignes || [])].filter(Boolean);
      return ouvre(`${this._tete(w, "mdi:car-electric")}<div class="w-ve">
        <div class="anneau" data-e="${esc(w.batterie || w.puissance || "")}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-outline-variant)" stroke-width="10"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></svg>
          <b>${bat != null ? `${fmt(bat, 0)}${globalThis.MaquetteI18n.pct()}` : `<ha-icon icon="mdi:${charge ? "battery-charging" : "car-electric-outline"}"></ha-icon>`}</b></div>
        <div class="etat"><span class="pastille forte" style="--p-couleur:${charge ? "#188038" : branche ? "#1a73e8" : "var(--md-surface-container-high)"};--p-texte:${charge || branche ? "#fff" : "var(--md-on-surface)"}" data-e="${esc(w.puissance || w.branche || "")}">${esc(etat)}</span>
          ${bat == null && !w.batterie ? `<span class="w-note">${_t("Batterie non configurée.")}</span>` : ""}</div></div>
        ${lignes.length ? this._lignes(lignes, w) : ""}`);
    }
    if (w.type === "periodes") {
      const per = w.periodes || ["jour", "semaine", "mois", "annee"];
      const NOMS = { jour: _t("Aujourd'hui"), semaine: _t("Semaine"), mois: _t("Mois"), annee: _t("Année") }, CAL = { jour: "day", semaine: "week", mois: "month", annee: "year" };
      const cols = w.colonnes || [];
      const cell = (c, p) => {
        let v = null, e = null;
        if (c.stat) { v = this._stat(c.stat, CAL[p]); e = c.stat; if (v != null) v *= nb(c.facteur ?? 1, 1); }
        else if (c[p]) { e = c[p]; v = this._num(e); if (v != null) v *= nb(c.facteur ?? 1, 1); }
        return `<td${e ? ` class="e" data-e="${esc(e)}"` : ""}>${v == null ? `<span class="vide">—</span>` : esc(fmt(v, c.decimales ?? 2))}</td>`;
      };
      return ouvre(`${this._tete(w, "mdi:table-clock")}<table class="w-table"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c.nom || "")}${c.unite ? `<br>${esc(c.unite)}` : ""}</th>`).join("")}</tr></thead>
        <tbody>${per.map((p) => `<tr><td>${esc(NOMS[p] || p)}</td>${cols.map((c) => cell(c, p)).join("")}</tr>`).join("")}</tbody></table>${w.note ? `<div class="w-note">${esc(w.note)}</div>` : ""}`);
    }
    if (w.type === "climat") return ouvre(this._climat(w));
    if (w.type === "thermostat") return ouvre(this._wThermostat(w, id));
    if (w.type === "commande") return ouvre(this._wCommande(w, id));
    if (w.type === "serrure") return ouvre(this._wSerrure(w, id));
    return ouvre(`${this._tete(w, "mdi:help-circle-outline")}<div class="w-note">${_t("Type de widget inconnu : {type}", { type: esc(w.type) })}</div>`);
  }

  // climat des pièces : température et humidité de chaque pièce, tendance sur `duree` minutes (historique HA),
  // alerte si la variation est trop forte (ou hors des bornes absolues, si elles sont réglées)
  _climat(w) {
    // écart signé, arrondi à l'affichage : « ±0 » quand l'arrondi est nul (jamais « +0° » ni « −0 % »)
    const ecart = (d, genre) => { if (d == null) return ""; const k = genre === "t" ? 10 : 1, r = Math.round(d * k) / k; return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${fmt(Math.abs(r), genre === "t" ? 1 : 0)}${genre === "t" ? "°" : globalThis.MaquetteI18n.pct()}`; };
    const duree = Math.max(5, Math.min(240, nb(w.duree, 30))), choix = Array.isArray(w.pieces) && w.pieces.length ? w.pieces : null, vus = new Set();
    const pieces = this._config.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite) && (choix ? choix.includes(p.nom) : w.dehors !== false || !p.dehors))
      .filter((p) => { const k = `${p.temperature}|${p.attribut_temperature}|${p.humidite}|${p.attribut_humidite}`; if (vus.has(k)) return false; vus.add(k); return true; }); // même capteur = une ligne
    let alertes = 0;
    const mesure = (e, attr, genre) => {
      const v = this._num(e, attr);
      if (v == null) return `<span class="m vide">—</span>`;
      const stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2), seuil = nb(genre === "t" ? w.alerte_t : w.alerte_h, genre === "t" ? 1.5 : 10);
      const h = attr ? null : this._histo(e, duree / 60), depart = h?.pts?.length ? h.pts[0][1] : null, d = depart == null ? null : v - depart;
      const bas = nb(genre === "t" ? w.t_min : w.h_min, -Infinity), haut = nb(genre === "t" ? w.t_max : w.h_max, Infinity);
      const fort = (d != null && Math.abs(d) >= seuil) || v < bas || v > haut;
      if (fort) alertes++;
      const sens = d == null ? "" : d > stable ? "monte" : d < -stable ? "descend" : "stable";
      const ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
      const unite = genre === "t" ? " °C" : globalThis.MaquetteI18n.pct(), dt = ecart(d, genre);
      const titre = `${sens ? _t("{sens} sur {n} min ({ecart})", { sens: { monte: _t("En hausse"), descend: _t("En baisse"), stable: _t("Stable") }[sens], n: duree, ecart: dt }) : _t("Tendance indisponible")}${fort ? _t(" · variation forte") : ""}`;
      return `<span class="m ${sens}${fort ? " alerte" : ""}" data-e="${esc(e)}" title="${esc(titre)}">${esc(fmt(v, genre === "t" ? 1 : 0))}${unite}${ic ? `<ha-icon icon="${fort ? "mdi:alert" : ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
    };
    let lignes = pieces.map((p) => `<span class="n">${esc(p.nom)}</span>${p.temperature ? mesure(p.temperature, p.attribut_temperature, "t") : "<span></span>"}${p.humidite ? mesure(p.humidite, p.attribut_humidite, "h") : "<span></span>"}`).join("");
    if (w.moyenne) {
      // moyenne des pièces intérieures : valeur moyenne et écart moyen sur la durée (pièces dont la tendance est connue)
      const moy = (genre) => {
        const v = [], d = [];
        for (const p of pieces) {
          const e = genre === "t" ? p.temperature : p.humidite, at = genre === "t" ? p.attribut_temperature : p.attribut_humidite;
          if (p.dehors || !e) continue;
          const x = this._num(e, at); if (x == null) continue; v.push(x);
          const h = at ? null : this._histo(e, duree / 60); if (h?.pts?.length) d.push(x - h.pts[0][1]);
        }
        if (!v.length) return `<span class="m vide">—</span>`;
        const m = v.reduce((s, x) => s + x, 0) / v.length, dm = d.length ? d.reduce((s, x) => s + x, 0) / d.length : null, stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2);
        const sens = dm == null ? "" : dm > stable ? "monte" : dm < -stable ? "descend" : "stable", ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
        const dt = ecart(dm, genre);
        return `<span class="m ${sens}">${esc(fmt(m, genre === "t" ? 1 : 0))}${genre === "t" ? " °C" : globalThis.MaquetteI18n.pct()}${ic ? `<ha-icon icon="${ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
      };
      lignes = `<span class="n moy">${_t("Moyenne intérieure")}</span>${moy("t")}${moy("h")}` + lignes;
    }
    return `${this._tete(w, "mdi:home-thermometer-outline", alertes ? `<span class="w-alerte"><ha-icon icon="mdi:alert"></ha-icon>${alertes}</span>` : `${duree} min`)}
      ${pieces.length ? `<div class="w-climat">${lignes}</div>` : `<div class="w-note">${_t("Aucune pièce n'a de capteur de température ou d'humidité.")}</div>`}`;
  }

  // thermostat (climate) : température mesurée, consigne réglable (−/+ au pas de l'appareil, entre ses bornes), action en cours, mode
  _wThermostat(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:thermostat")}<div class="w-note">${_t("Choisis le thermostat (entité climate).")}</div>`;
    const s = this._etat(w.entite), a = s?.attributes || {}, indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const cons = nb(a.temperature, NaN), mes = nb(a.current_temperature, NaN), pas = nb(a.target_temp_step, 0.5) || 0.5;
    const ACTION = { heating: [_t("Chauffe"), "#e8710a"], cooling: [_t("Refroidit"), "#1a73e8"], idle: [_t("Au repos"), ""], off: [_t("Arrêté"), ""], drying: [_t("Déshumidifie"), ""], fan: [_t("Ventile"), ""] };
    const [act, coul] = ACTION[a.hvac_action] || [a.hvac_action || "", ""];
    const bouton = (k, ic, nom) => `<button class="ib th-b" data-th="${k}"${indispo || isNaN(cons) ? ` aria-disabled="true"` : ""} aria-label="${nom}" title="${nom}"><ha-icon icon="${ic}"></ha-icon></button>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, "mdi:thermostat", act ? `<span class="pastille forte" style="--p-couleur:${coul || "var(--md-surface-container-high)"};--p-texte:${coul ? "#fff" : "var(--md-on-surface)"}">${esc(act)}</span>` : "")}
      <div class="w-th" data-te="${esc(w.entite)}" data-ti="${esc(id)}"${w.confirmer === true ? ` data-cf="1"` : ""}>
        <div class="mes" data-e="${esc(w.entite)}"><small>${_t("Mesurée")}</small><b>${isNaN(mes) ? "—" : esc(fmt(mes, 1))}<small> °C</small></b></div>
        <div class="cons">${bouton("moins", "mdi:minus", _t("Baisser la consigne"))}<div><small>${_t("Consigne")}</small><b>${isNaN(cons) ? "—" : esc(fmt(cons, pas < 1 ? 1 : 0))}<small> °C</small></b></div>${bouton("plus", "mdi:plus", _t("Monter la consigne"))}</div>
        <div class="mode"><small>${esc(indispo ? _t("Indisponible") : [this._hass.formatEntityState?.(s) ?? s.state, a.preset_mode && a.preset_mode !== "none" ? a.preset_mode : ""].filter(Boolean).join(" · "))}</small></div>
      </div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // −/+ de la consigne : climate.set_temperature sur le thermostat du widget (présent dans la config), bornée par l'appareil
  _reglerThermostat(btn) {
    const box = btn.closest(".w-th"), e = box?.dataset.te, s = this._etat(e);
    if (this._editeur || !e?.startsWith("climate.") || !s || btn.getAttribute("aria-disabled") === "true") return;
    const c = this._config, ok = new Set(), voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => { if (w?.type === "thermostat" && typeof w.entite === "string") ok.add(w.entite); });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    if (!ok.has(e)) return;
    const a = s.attributes, pas = nb(a.target_temp_step, 0.5) || 0.5, cons = nb(a.temperature, NaN);
    if (isNaN(cons)) return;
    const v = Math.max(nb(a.min_temp, 5), Math.min(nb(a.max_temp, 35), Math.round((cons + (btn.dataset.th === "plus" ? pas : -pas)) / pas) * pas));
    this._appeler("climate", "set_temperature", { entity_id: e, temperature: +v.toFixed(2) }, undefined, { forcer: box.dataset.cf === "1", libelle: btn.getAttribute("aria-label") || "" }).catch(() => {});
  }

  // commande d'une cover (volet, store, portail, porte de garage) : état, position, Ouvrir / Stop / Fermer ;
  // `confirmer` (par défaut pour garage, portail et porte) : le premier appui arme le bouton 4 s, le second lance l'action
  _wCommande(w, id) {
    const s = this._etat(w.entite), dc = s?.attributes.device_class, pos = s?.attributes.current_position;
    const ouvert = !!s && !["closed", "unavailable", "unknown"].includes(s.state), ic = ((w.entite || "").startsWith("valve.") ? ["mdi:valve-closed", "mdi:valve-open"] : ICONES_COVER[dc] || ICONES_COVER._)[ouvert ? 1 : 0];
    const conf = typeof w.confirmer === "boolean" ? w.confirmer : CONFIRMER_COVER.includes(dc) || (w.entite || "").startsWith("valve."), indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const f = s?.attributes.supported_features, sans = (bit) => typeof f === "number" && !(f & bit); // OPEN 1, CLOSE 2, STOP 8
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "";
    const bouton = (k, bit) => {
      if (sans(bit)) return "";
      const [, cleNom, icone] = COMMANDES[k], nom = _t(cleNom);
      return `<button class="cta" data-cmd="${k}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    if (!w.entite) return `${this._tete(w, "mdi:window-shutter")}<div class="w-note">${_t("Choisis la cover à commander (volet, portail, porte de garage…).")}</div>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic, pos != null ? `${fmt(pos, 0)}${globalThis.MaquetteI18n.pct()}` : "")}
      <div class="w-cmd" data-ce="${esc(w.entite)}" data-ci="${esc(id)}"${conf ? ` data-cf="1"` : ""}>
        <div class="w-grand" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? s.state : _t("Indisponible"))}${conf ? `<small><ha-icon icon="mdi:shield-check-outline" title="${_t("Action confirmée avant d'être lancée")}"></ha-icon></small>` : ""}</div>
        ${pos != null ? `<div class="w-pos" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${esc(pos)}" aria-label="${_t("Position")}"><i style="width:${Math.max(0, Math.min(100, nb(pos)))}%"></i></div>` : ""}
        <div class="w-cmd-btns">${bouton("ouvrir", 1)}${bouton("stop", 8)}${bouton("fermer", 2)}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // serrure (lock) : état et l'action utile — Déverrouiller si verrouillée, Verrouiller si ouverte, les deux si l'état est
  // incertain (bloquée, en cours, inconnu) — plus Ouvrir si la serrure sait ouvrir la porte ;
  // `confirmer` : true = tous les boutons en deux appuis, false = aucun, absent = Déverrouiller et Ouvrir seulement
  _wSerrure(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:lock")}<div class="w-note">${_t("Choisis la serrure (entité lock).")}</div>`;
    const s = this._etat(w.entite), st = s?.state, indispo = !s || ["unavailable", "unknown"].includes(st), f = s?.attributes.supported_features;
    const ic = st === "jammed" ? "mdi:lock-alert" : st === "locked" ? "mdi:lock" : st === "locking" || st === "unlocking" ? "mdi:lock-clock" : "mdi:lock-open-variant";
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "", alerte = st === "jammed" || st === "unlocked" || st === "open";
    const bouton = (k) => {
      const [cleNom, icone] = COMMANDES_SERRURE[k], nom = _t(cleNom);
      // déverrouiller et ouvrir sont toujours confirmés (services sensibles) ; `confirm: true` ajoute verrouiller
      const cf = k !== "verrouiller" || w.confirmer === true;
      return `<button class="cta" data-cmd="${k}" data-cf="${cf ? 1 : 0}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic)}
      <div class="w-cmd w-serrure" data-ce="${esc(w.entite)}" data-ci="${esc(id)}">
        <div class="w-grand${alerte ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? st : _t("Indisponible"))}</div>
        <div class="w-cmd-btns">${st !== "locked" ? bouton("verrouiller") : ""}${!["unlocked", "open"].includes(st) ? bouton("deverrouiller") : ""}${typeof f === "number" && f & 1 && st !== "open" ? bouton("ouvrir") : ""}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // ligne « Activer » d'une liste : scène, script ou bouton de la config (scene.turn_on, script.turn_on, button.press)
  _activer(btn) {
    const e = btn.dataset.active, dom = (e || "").split(".")[0];
    if (this._editeur || !Object.hasOwn(ACTIVABLES, dom) || btn.getAttribute("aria-disabled") === "true") return;
    this._appeler(dom, ACTIVABLES[dom], { entity_id: e }, undefined, { forcer: btn.dataset.cf === "1", libelle: btn.textContent.trim() }).then((fait) => {
      if (fait && btn.isConnected) { btn.classList.add("fait"); setTimeout(() => btn.classList.remove("fait"), 1200); }
    }).catch(() => {});
  }

  // entités commandables : celles des widgets `commande` de la config (panneaux de la maison et des pièces, fiches)
  _entitesCommande() {
    const c = this._config, l = new Set();
    const voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => {
      if (typeof w?.entite !== "string") return;
      if ((w.type === "commande" && /^(cover|valve)\./.test(w.entite)) || (w.type === "serrure" && w.entite.startsWith("lock."))) l.add(w.entite);
    });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    return l;
  }

  // appui sur Ouvrir / Stop / Fermer (cover.open_cover…, valve.open_valve…) ou Verrouiller / Déverrouiller / Ouvrir (lock.lock…)
  // sur l'entité du widget, rien d'autre
  _lancerCommande(btn) {
    const box = btn.closest(".w-cmd"), k = btn.dataset.cmd, e = box?.dataset.ce, id = box?.dataset.ci, dom = (e || "").split(".")[0];
    const service = Object.hasOwn(SERVICES_CMD, dom) && Object.hasOwn(SERVICES_CMD[dom], k) ? SERVICES_CMD[dom][k] : null;
    if (this._editeur || !service || !id || btn.getAttribute("aria-disabled") === "true" || !this._entitesCommande().has(e)) return;
    const R = this.shadowRoot, focus = R.activeElement === btn;
    const rendre = () => { this._widgets(); if (focus) R.querySelector(`.w-cmd[data-ci="${globalThis.CSS.escape(id)}"] [data-cmd="${k}"]`)?.focus(); };
    if (this._erreurCmd?.id === id) this._erreurCmd = null;
    // confirmation (dialogue) : `confirm` du widget, garage / portail / porte et vannes par défaut, et toujours pour un service sensible
    this._appeler(dom, service, { entity_id: e }, undefined, { forcer: (btn.dataset.cf ?? box.dataset.cf) === "1", libelle: btn.textContent.trim() }).then(rendre, (x) => {
      this._erreurCmd = { id, msg: String(x?.message || x) };
      setTimeout(() => { if (this._erreurCmd?.id === id) { this._erreurCmd = null; this._widgets(); } }, 8000);
      this._widgets();
    });
  }

  // statistiques HA (variation sur la période calendaire : jour, semaine, mois, année), en cache 5 min
  _stat(id, periode) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${periode}`, c = (this._cacheStat ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        (this._cacheStat[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 });
        this._hass.callWS({ type: "recorder/statistic_during_period", statistic_id: id, calendar: { period: periode }, types: ["change"] })
          .then((r) => { this._cacheStat[cle] = { v: r?.change ?? null, t: Date.now() }; this._widgets(); })
          .catch(() => { this._cacheStat[cle] = { v: null, t: Date.now() }; });
      }
    }
    return c?.v ?? null;
  }

  // historique récent pour les courbes, en cache 5 min
  _histo(id, heures) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${heures}`, c = (this._cacheHisto ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        this._cacheHisto[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 };
        const debut = new Date(Date.now() - heures * 3600e3).toISOString();
        this._hass.callWS({ type: "history/history_during_period", start_time: debut, entity_ids: [id], minimal_response: true, no_attributes: true })
          .then((r) => {
            const pts = (r?.[id] || []).map((x) => [(x.lu ?? x.lc ?? 0) * 1000, parseFloat(x.s)]).filter((p) => !isNaN(p[1]));
            this._cacheHisto[cle] = { v: { pts, debut: Date.now() - heures * 3600e3 }, t: Date.now() };
            this._widgets();
          }).catch(() => { this._cacheHisto[cle] = { v: null, t: Date.now() }; });
      }
    }
    const v = c?.v;
    if (!v) return null;
    const n = this._num(id), pts = [...v.pts];
    if (n != null) pts.push([Date.now(), n]);
    return { pts, debut: v.debut };
  }

  _courbe({ pts, debut }) {
    if (pts.length < 2) return "";
    const W = 300, H = 56, fin = Date.now(), ys = pts.map((p) => p[1]);
    const mn = Math.min(...ys), mx = Math.max(...ys), dy = mx - mn || 1;
    const X = (t) => ((Math.max(t, debut) - debut) / (fin - debut)) * W, Y = (v) => H - 4 - ((v - mn) / dy) * (H - 8);
    let d = "", prev = null;
    for (const [tt, v] of pts) { d += prev == null ? `M${X(tt).toFixed(1)} ${Y(v).toFixed(1)}` : `H${X(tt).toFixed(1)}V${Y(v).toFixed(1)}`; prev = v; }
    d += `H${W}`;
    return `<svg class="w-courbe" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path class="a" d="${d}V${H}H${X(pts[0][0]).toFixed(1)}Z"/><path class="l" d="${d}"/></svg>`;
  }

} // @assemblage
