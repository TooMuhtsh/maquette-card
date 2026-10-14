// entités introuvables du plan (supprimées ou renommées dans HA) : où elles servent, remplacement partout en un pas d'annulation — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- diagnostic des entités introuvables ----------
  // Tout le plan : étages, pièces (capteurs, boutons), pastilles, ouvertures, meubles, fiches, widgets, puces, alertes, ambiance,
  // modèles. Même liste d'association que l'import d'un partage : « Choisir… » propose les entités du même domaine.
  // bouton du dialogue « Nettoyer le plan » (rien s'il n'y en a pas)
  _lienIntrouvables() {
    const n = this.hass?.states ? this._introuvables().size : 0;
    return n ? `<button class="ed-btn texte" data-x="diag"><ha-icon icon="mdi:link-variant-off"></ha-icon>${esc(_t("Entités introuvables ({n})", { n }))}</button>` : "";
  }
  _introuvables() { const T = TYPES_ATELIER(); return entitesIntrouvables(this.d, this.hass, (t) => T.find((x) => x.id === t)?.nom || t); }
  diagnosticEntites(opt = {}) {
    const l = this._introuvables(), choix = {};
    const { D, fermer } = this._dialogueModal("ed-partage-d", "ed-diag-titre", opt.retour);
    const rendre = () => {
      const n = Object.values(choix).filter(Boolean).length;
      const lignes = [...l].map(([e, us]) => this._ligneAsso(e, { libelle: e, domaine: e.split(".")[0],
        sous: `${_t("{n} usage|{n} usages", { n: us.length })} : ${[...new Set(us.map((u) => u.ou))].slice(0, 3).join(" ; ")}${new Set(us.map((u) => u.ou)).size > 3 ? " …" : ""}` }, choix[e], false)).join("");
      poserHTML(D, `<div class="ed-dialogue large ed-pt ed-recap"><header><h2 id="ed-diag-titre">${esc(_t("{n} entité introuvable|{n} entités introuvables", { n: l.size }))}</h2>
          <div class="ed-aide">${l.size ? _t("Absentes de Home Assistant (supprimées ou renommées). Choisis une remplaçante : elle prend sa place partout dans le plan.") : _t("Toutes les entités du plan existent dans Home Assistant.")}</div></header>
        <div class="ed-cat">${l.size ? `<div class="ed-pt-asso" role="list">${lignes}</div>` : `<div class="ed-net-vide" role="status"><ha-icon icon="mdi:check-circle-outline"></ha-icon><b>${_t("Rien à remplacer")}</b></div>`}</div>
        <footer><span class="ed-espace"></span><button class="ed-btn texte" data-dg="fermer">${l.size ? _t("Annuler") : _t("Fermer")}</button>${l.size ? `<button class="ed-btn plein" data-dg="remplacer" ${n ? "" : "disabled"}><ha-icon icon="mdi:find-replace"></ha-icon>${esc(_t("Remplacer ({n})", { n }))}</button>` : ""}</footer></div>`);
    };
    D.addEventListener("click", async (ev) => {
      if (ev.target === D) return;
      const ch = ev.composedPath(), b = ch.find((x) => x.dataset?.dg || x.dataset?.ptRole || x.dataset?.ptEffacer);
      if (!b) return;
      if (b.dataset.ptRole) {
        const e0 = b.dataset.ptRole, e = await this._choisirPourEmpl({ libelle: _t("Remplacer {e}", { e: e0 }), domaine: e0.split(".")[0] });
        if (e !== undefined) { if (e && e !== e0) choix[e0] = e; else delete choix[e0]; }
        rendre(); [...D.querySelectorAll("[data-pt-role]")].find((x) => x.dataset.ptRole === e0)?.focus({ preventScroll: true });
        return;
      }
      if (b.dataset.ptEffacer) { delete choix[b.dataset.ptEffacer]; return rendre(); }
      if (b.dataset.dg === "fermer") return fermer();
      if (b.dataset.dg === "remplacer") {
        let n = 0;
        this.commit(() => { for (const [de, vers] of Object.entries(choix)) if (vers) n += remplacerEntite(this.d, de, vers); });
        fermer();
        this.carte._construire();
        this.snack(_t("{n} remplacement fait.|{n} remplacements faits.", { n }), _t("Annuler"), this._annulation(), 10000);
      }
    });
    rendre();
    (D.querySelector("[data-pt-role]") || D.querySelector("[data-dg]"))?.focus({ preventScroll: true });
  }
} // @assemblage
