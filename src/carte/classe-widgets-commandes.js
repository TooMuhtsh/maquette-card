// widgets de commande : thermostat, commande, serrure — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // thermostat (climate) : température mesurée, consigne réglable (−/+ au pas de l'appareil, entre ses bornes), action en cours, mode
  _wThermostat(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:thermostat")}<div class="w-note">${_t("Choisis le thermostat (entité climate).")}</div>`;
    const s = this._etat(w.entite), a = s?.attributes || {}, indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const cons = nb(a.temperature, NaN), mes = nb(a.current_temperature, NaN), pas = nb(a.target_temp_step, 0.5) || 0.5;
    const ACTION = { heating: [_t("Chauffe"), "#e8710a"], cooling: [_t("Refroidit"), "#1a73e8"], idle: [_t("Au repos"), ""], off: [_t("Arrêté"), ""], drying: [_t("Déshumidifie"), ""], fan: [_t("Ventile"), ""] };
    // valeurs d'attributs traduites par HA (préréglage « manual », action inconnue de la table) ; brutes sans traduction
    // préréglages courants que HA ne traduit pas pour toutes les intégrations (Zigbee2MQTT : « manual »…)
    const PRESET = { manual: _t("Manuel"), eco: _t("Éco"), comfort: _t("Confort"), away: _t("Absence"), home: _t("Présence"), sleep: _t("Sommeil"), boost: _t("Boost"), activity: _t("Activité"), holiday: _t("Vacances"), schedule: _t("Programme"), program: _t("Programme"), auto: _t("Auto") };
    const attr = (k) => {
      if (a[k] == null || a[k] === "") return "";
      const brut = String(a[k]), v = this._hass.formatEntityAttributeValue?.(s, k) ?? brut;
      return k === "preset_mode" && v === brut && PRESET[brut.toLowerCase()] ? PRESET[brut.toLowerCase()] : v;
    };
    const [act, coul] = ACTION[a.hvac_action] || [attr("hvac_action"), ""];
    const bouton = (k, ic, nom) => `<button class="ib th-b" data-th="${k}"${indispo || isNaN(cons) ? ` aria-disabled="true"` : ""} aria-label="${nom}" title="${nom}"><ha-icon icon="${ic}"></ha-icon></button>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, "mdi:thermostat", act ? `<span class="pastille forte" style="--p-couleur:${coul || "var(--md-surface-container-high)"};--p-texte:${coul ? "#fff" : "var(--md-on-surface)"}">${esc(act)}</span>` : "")}
      <div class="w-th" data-te="${esc(w.entite)}" data-ti="${esc(id)}"${w.confirmer === true ? ` data-cf="1"` : ""}>
        <div class="mes" data-e="${esc(w.entite)}"><small>${_t("Mesurée")}</small><b>${isNaN(mes) ? "—" : esc(fmt(mes, 1))}<small> °C</small></b></div>
        <div class="cons">${bouton("moins", "mdi:minus", _t("Baisser la consigne"))}<div><small>${_t("Consigne")}</small><b>${isNaN(cons) ? "—" : esc(fmt(cons, pas < 1 ? 1 : 0))}<small> °C</small></b></div>${bouton("plus", "mdi:plus", _t("Monter la consigne"))}</div>
        <div class="mode"><small>${esc(indispo ? _t("Indisponible") : [this._hass.formatEntityState?.(s) ?? s.state, a.preset_mode && a.preset_mode !== "none" ? attr("preset_mode") : ""].filter(Boolean).join(" · "))}</small></div>
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

} // @assemblage
