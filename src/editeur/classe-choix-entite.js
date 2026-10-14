// choix d'un appareil (choisirEntite) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- appareils ----------
  choisirEntite({ titre, domaine = "", obligatoire = false } = {}) {
    return new Promise((fin) => {
      const hass = this.hass, deja = new Set([...(this.d.points || []), ...(this.d.meubles || [])].map((p) => p.entite).filter(Boolean));
      let filtre = domaine;
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue" role="dialog" aria-modal="true"><header><h2>${esc(titre)}</h2>
        <label class="ed-recherche"><ha-icon icon="mdi:magnify"></ha-icon><input type="text" placeholder="${this._etroit() ? _t("Rechercher…") : _t("Rechercher une entité, une pièce…")}" aria-label="${_t("Rechercher une entité, une pièce…")}" autocomplete="off"></label>
        <div class="ed-filtres">${DOMAINES.map(([d, n]) => `<button data-f="${d}" class="${d === filtre ? "on" : ""}">${_t(n)}</button>`).join("")}</div></header>
        <div class="ed-resultats"></div>
        <footer>${obligatoire ? "" : `<button class="ed-btn texte" data-r="">${_t("Aucune")}</button>`}<button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button></footer></div>`, { echap: () => fermer(null) });
      const champ = voile.querySelector("input"), res = voile.querySelector(".ed-resultats");
      const tous = Object.keys(hass.states).sort();
      const rendre = () => {
        const q = champ.value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const l = [];
        for (const e of tous) {
          if (filtre && !e.startsWith(filtre + ".")) continue;
          const s = hass.states[e], n = String(s.attributes.friendly_name || e);
          const cle = `${e} ${n}`.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          if (q && !q.split(/\s+/).every((m) => cle.includes(m))) continue;
          l.push([e, n, s]);
          if (l.length >= 120) break;
        }
        poserHTML(res, l.length ? l.map(([e, n, s]) => `<button data-r="${esc(e)}" class="${deja.has(e) ? "deja" : ""}"><ha-icon icon="${esc(iconeEntite(hass, e))}"></ha-icon>
          <span class="n"><span>${esc(n)}</span><small>${esc(e)}${deja.has(e) ? _t(" · déjà sur le plan") : ""}</small></span><span class="etat">${esc(hass.formatEntityState?.(s) ?? s.state)}</span></button>`).join("")
          : `<div class="ed-aide" style="padding:16px">${_t("Aucune entité trouvée.")}</div>`);
      };
      const fermer = (v) => { retirer(); fin(v); };
      voile.addEventListener("click", (ev) => {
        if (ev.target === voile) return fermer(null);
        const b = ev.composedPath().find((n) => n.dataset && (n.dataset.f != null || n.dataset.r != null));
        if (!b) return;
        if (b.dataset.f != null) { filtre = b.dataset.f; voile.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === b)); rendre(); return; }
        fermer(b.dataset.r === "annuler" ? null : b.dataset.r);
      });
      champ.addEventListener("input", rendre);
      champ.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { const b = res.querySelector("button"); if (b) fermer(b.dataset.r); } });
      rendre();
      this._indiceDefilement(voile.querySelector(".ed-filtres"));
      setTimeout(() => champ.focus(), 30);
    });
  }

} // @assemblage
