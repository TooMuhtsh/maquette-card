// onglet ⚙ Paramètres › À propos : version, mise à jour (HACS), liens du projet — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // Onglet ajouté par classe-parametres.js (_ongletsParametres → _ongletAPropos, câblage → _cablerAPropos), en dernier.
  // Mise à jour : entité update.* de HACS lue par la carte (carte.etatVersion(), classe-version.js) ; aucune requête externe,
  // d'où pas de compteur d'étoiles. `update_notice` (interne avis_maj) : false coupe la fenêtre « nouvelle version ».
  _ongletAPropos() { return { id: "apropos", titre: _tk("À propos"), icone: "mdi:information-outline", apres: null, html: () => this._htmlAPropos() }; }
  static LIENS_APROPOS = [["depot", "mdi:github", _tk("Dépôt GitHub"), ""], ["wiki", "mdi:book-open-variant", _tk("Documentation (wiki)"), "/wiki"],
    ["demo", "mdi:play-circle-outline", _tk("Démo en ligne"), "@https://toomuhtsh.github.io/maquette-card/"], ["notes", "mdi:text-box-outline", _tk("Notes de version"), "/releases"],
    ["bug", "mdi:bug-outline", _tk("Signaler un problème"), "/issues/new/choose"], ["discussions", "mdi:forum-outline", _tk("Discussions et idées"), "/discussions"]];
  _lienAPropos(cle) {
    const D = customElements.get("maquette-card").DEPOT, l = EditeurPlan.LIENS_APROPOS.find((x) => x[0] === cle)?.[3] ?? "";
    return l.startsWith("@") ? l.slice(1) : D + l;
  }
  _htmlAPropos() {
    const K = customElements.get("maquette-card"), v = K.VERSION, s = this.carte.etatVersion?.(), a = s?.attributes || {};
    const cible = String(a.latest_version || "").replace(/^v/i, ""), plusRecente = s && K.comparerVersions(a.latest_version, v) > 0;
    let etat;
    if (!s) etat = `<p class="ed-ap-etat">${esc(_t("Installée sans HACS : pas de vérification des mises à jour. Les nouvelles versions sont sur GitHub."))}</p>`;
    else if (plusRecente && s.state === "on") etat = `<p class="ed-ap-etat nouveau"><ha-icon icon="mdi:party-popper"></ha-icon>${esc(_t("Maquette {v} est disponible", { v: cible }))}</p>
        <div class="ed-liste"><button type="button" class="ed-btn plein" data-ap="installer"${a.in_progress ? " disabled" : ""}><ha-icon icon="mdi:download"></ha-icon><span>${esc(a.in_progress ? _t("Installation…") : _t("Mettre à jour"))}</span></button></div>`;
    else if (plusRecente) etat = `<p class="ed-ap-etat nouveau"><ha-icon icon="mdi:refresh"></ha-icon>${esc(_t("Téléchargée : recharge la page pour l'utiliser"))}</p>
        <div class="ed-liste"><button type="button" class="ed-btn plein" data-ap="recharger"><ha-icon icon="mdi:refresh"></ha-icon><span>${esc(_t("Recharger"))}</span></button></div>`;
    else etat = `<p class="ed-ap-etat ok"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${esc(_t("À jour (vérifié par HACS)"))}</p>`;
    const avis = this.d.avis_maj !== false;
    return `<section class="ed-par-sec ed-apropos" data-sec="apropos" aria-labelledby="par-pan-t-apropos">
      <div class="ed-ap-tete"><ha-icon icon="mdi:floor-plan"></ha-icon><div><b>Maquette ${esc(v)}</b>
        <small>${esc(_t("Le plan vivant de ta maison pour Home Assistant"))}</small></div></div>
      ${etat}
      ${K.NOUVEAUTES?.[v] ? `<div class="ed-liste"><button type="button" class="ed-btn tonal" data-ap="nouveautes"><ha-icon icon="mdi:creation-outline"></ha-icon><span>${esc(_t("Quoi de neuf dans la {v}", { v }))}</span></button></div>` : ""}
      <label class="ed-ap-avis"><input type="checkbox" data-ap-avis="1"${avis ? " checked" : ""}><span>${esc(_t("Prévenir les administrateurs quand une nouvelle version est disponible"))}</span></label>
      <div class="ed-ap-liens">${EditeurPlan.LIENS_APROPOS.map(([c, ic, t]) => `<button type="button" class="ed-btn texte" data-ap-lien="${c}"><ha-icon icon="${ic}"></ha-icon><span>${esc(_t(t))}</span></button>`).join("")}</div>
      <button type="button" class="ed-ap-etoile" data-ap-lien="depot"><ha-icon icon="mdi:star-outline"></ha-icon><span>${esc(_t("Maquette te plaît ? Une étoile sur GitHub l'aide à se faire connaître"))}</span></button>
      <p class="ed-ap-note">${esc(_t("Licence MIT · par TooMuhtsh · Maquette ne contacte aucun service en ligne : la vérification des mises à jour passe par HACS, dans Home Assistant."))}</p>
    </section>`;
  }
  _cablerAPropos(V) {
    const sec = V.querySelector(".ed-apropos");
    if (!sec) return;
    sec.onclick = (ev) => {
      const b = ev.target.closest?.("[data-ap],[data-ap-lien]");
      if (!b) return;
      if (b.dataset.apLien) return window.open(this._lienAPropos(b.dataset.apLien), "_blank", "noopener,noreferrer");
      if (b.dataset.ap === "recharger") return location.reload();
      // « Quoi de neuf » à la demande : la modale se ferme pour laisser voir la fenêtre (en bas à droite)
      if (b.dataset.ap === "nouveautes") { this.panneauParametres(false); return this.carte.montrerNouveautes?.(); }
      if (b.dataset.ap === "installer") {
        const s = this.carte.etatVersion?.();
        if (!s) return;
        b.disabled = true;
        this.hass.callService("update", "install", { entity_id: s.entity_id }).catch((e) => console.warn("maquette-card : update failed", e));
      }
    };
    const c = sec.querySelector("[data-ap-avis]");
    if (c) c.onchange = () => this.commit(() => { if (c.checked) delete this.d.avis_maj; else this.d.avis_maj = false; });
  }
} // @assemblage
