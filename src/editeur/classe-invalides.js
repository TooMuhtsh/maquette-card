// enregistrement : éléments et valeurs invalides du plan enregistré, à retirer ou à garder tels quels — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- avant d'enregistrer : ce que la carte rejette dans la config du dashboard ----------
  // La carte lit sa config en retirant ce qui est invalide (élément sans coordonnées valides, valeur hors liste, clé inconnue…) :
  // l'éditeur ne voit donc pas ces valeurs, et l'enregistrement les ferait disparaître. Avant d'écrire, il les liste (quoi, où,
  // pourquoi) et laisse choisir : « Les retirer » (enregistrement du plan tel qu'il est dessiné) ou « Les garder tels quels »
  // (recopiés à l'identique depuis la config du dashboard : toujours ignorés à l'affichage). Unité comparée : un élément d'une
  // liste de la géométrie (racine ou étage) ou une clé de la racine, relu seul par la carte. Un élément gardé n'est recopié que
  // si le plan dessiné le contient encore inchangé (élément modifié ou supprimé dans l'éditeur : sa version dessinée l'emporte).

  // relecture d'une config partielle (format public) comme la carte la lit : sa version normalisée (format public) et ses rejets
  // (garder : seuls les chemins retirés qui commencent ainsi comptent, le reste vient du contexte ajouté)
  _relireUnite(cfg, garder = "") {
    const K = customElements.get("maquette-card"), rap = {}, rapport = {};
    try {
      const en = K.versAnglais(K.normaliser(K.depuisAnglais({ type: "custom:maquette-card", ...cfg }, rap), rapport));
      const motifs = [...(rapport.retires || []).filter((c) => c.startsWith(garder)).map((c) => _t("valeur invalide : {chemin}", { chemin: c })), ...(rap.inconnues || []).map((c) => _t("clé inconnue : {chemin}", { chemin: c })),
        ...(rap.refusees || []).map((c) => _t("valeur inconnue : {chemin}", { chemin: c }))];
      if (rapport.ignores) motifs.unshift(_t("coordonnées invalides ou hors du plan (± 1 km)"));
      return { en, motifs };
    } catch (e) { return { en: null, motifs: [String(e?.message || e)] }; }
  }

  // rejets de la config brute du dashboard (format public) : [{ genre: "element", L, etage, j, brut, nu, quoi, ou, motifs } | { genre: "cle", k, … }]
  _rejetsConfig(brut) {
    if (!brut || typeof brut !== "object") return [];
    const L_GEO = ["rooms", "walls", "fences", "openings", "badges", "texts", "furniture", "groups"], out = [];
    const NOMS = { rooms: _t("Pièce"), walls: _t("Mur"), fences: _t("Limite"), openings: _t("Ouverture"), badges: _t("Pastille"), texts: _t("Texte"), furniture: _t("Meuble"), groups: _t("Groupe") };
    const nomDe = (r) => (r && typeof r === "object" ? [r.name, r.text, r.entity, r.type].find((v) => typeof v === "string" && v) : "") || "";
    // un élément d'étage est relu dans son étage, avec les identifiants des autres (escalier vers un autre étage)
    const etages = Array.isArray(brut.floors) ? brut.floors : null;
    const listes = (g, etage, pre) => {
      for (const L of L_GEO) {
        if (!Array.isArray(g[L])) continue;
        g[L].forEach((r, j) => {
          const cfg = etage == null ? { [L]: [r] } : { floors: etages.map((f, n) => (n === etage ? { id: f?.id, [L]: [r] } : { id: f?.id })) };
          const { en, motifs } = this._relireUnite(cfg, `${pre}${L}[0]`);
          if (!motifs.length) return;
          const nu = (etage == null ? en : en?.floors?.[etage])?.[L]?.[0], nom = nomDe(r);
          out.push({ genre: "element", L, etage, j, brut: r, nu, ou: `${pre}${L}[${j}]`, quoi: nom ? `${NOMS[L]} « ${nom} »` : `${NOMS[L]} ${j + 1}`,
            motifs: motifs.map((m) => m.replace(`${pre}${L}[0].`, "").replace(`${pre}${L}[0]`, L)) });
        });
      }
    };
    listes(brut, null, "");
    if (Array.isArray(brut.floors)) brut.floors.forEach((f, i) => { if (f && typeof f === "object") listes(f, i, `floors[${i}].`); });
    // clés de la racine (hors géométrie et étages ; l'étage par défaut dépend des étages, l'id et le type sont toujours gardés)
    for (const [k, v] of Object.entries(brut)) {
      if (L_GEO.includes(k) || ["type", "id", "floors", "default_floor", "background"].includes(k)) continue;
      const { en, motifs } = this._relireUnite({ [k]: v });
      if (motifs.length) out.push({ genre: "cle", k, brut: v, nu: en?.[k], ou: k, quoi: _t("Réglage « {cle} »", { cle: k }), motifs });
    }
    return out;
  }

  // recopie des rejets gardés dans la config écrite (format public) ; renvoie le nombre de rejets qui n'ont pas pu l'être
  _remettreRejets(cfg, rejets) {
    let perdus = 0;
    const geo = (r) => (r.etage == null ? cfg : (cfg.floors || []).find((f) => f?.id != null && f.id === r.brutEtageId) || cfg.floors?.[r.etage]);
    const pris = new Set();
    for (const r of rejets) {
      if (r.genre === "cle") { if (canon(cfg[r.k]) === canon(r.nu)) cfg[r.k] = clone(r.brut); else perdus++; continue; }
      if (r.nu === undefined) continue;
      const g = geo(r), l = g?.[r.L], t = Array.isArray(l) ? l.findIndex((x) => !pris.has(x) && canon(x) === canon(r.nu)) : -1;
      if (t < 0) { perdus++; continue; }
      l[t] = clone(r.brut); pris.add(l[t]);
    }
    // éléments que la carte n'a jamais lus (sans coordonnées valides…) : remis à leur place d'origine
    for (const r of rejets.filter((x) => x.genre === "element" && x.nu === undefined).sort((a, b) => a.j - b.j)) {
      const g = geo(r);
      if (!g) { perdus++; continue; }
      const l = Array.isArray(g[r.L]) ? g[r.L] : (g[r.L] = []);
      l.splice(Math.min(r.j, l.length), 0, clone(r.brut));
    }
    return perdus;
  }

  // dialogue : la liste des rejets et le choix ; résultat "retirer", "garder" ou "annuler"
  _dialogueRejets(rejets) {
    return new Promise((fin) => {
      const id = `ed-rej-${Math.random().toString(36).slice(2, 8)}`, max = 60;
      const lignes = rejets.slice(0, max).map((r) => `<li><b>${esc(r.quoi)}</b> <code>${esc(r.ou)}</code><small>${esc(r.motifs.slice(0, 4).join(" ; "))}${r.motifs.length > 4 ? " …" : ""}</small></li>`).join("");
      const { voile, fermer: retirer } = this._voile("", `<div class="ed-dialogue ed-rejets" role="alertdialog" aria-modal="true" aria-labelledby="${id}" style="width:min(560px,100%)"><header><h2 id="${id}">${_t("Éléments invalides dans le plan enregistré")}</h2>
        <div class="ed-aide">${_t("La carte ignore ces éléments ou valeurs (invisibles dans l'éditeur). Les retirer, ou les garder tels quels dans la config (toujours ignorés à l'affichage) ?")}</div></header>
        <ul class="ed-rejets-l" style="margin:0;padding:0 24px 0 40px;max-height:min(360px,50vh);overflow:auto;display:grid;gap:6px">${lignes}${rejets.length > max ? `<li>${_t("… et {n} autres", { n: rejets.length - max })}</li>` : ""}</ul>
        <footer style="flex-wrap:wrap"><button class="ed-btn texte" data-r="annuler">${_t("Annuler")}</button><span class="ed-espace"></span>
          <button class="ed-btn texte" data-r="garder">${_t("Les garder tels quels")}</button><button class="ed-btn" data-r="retirer">${_t("Les retirer")}</button></footer></div>`,
      { echap: () => fermer("annuler"), pieger: true });
      const fermer = (r) => { retirer(); fin(r); };
      voile.onclick = (ev) => { ev.stopPropagation(); const b = ev.composedPath().find((n) => n.dataset?.r); if (ev.target === voile || b) fermer(b?.dataset.r || "annuler"); };
      setTimeout(() => voile.querySelector('[data-r="retirer"]')?.focus(), 30);
    });
  }

  // avant d'écrire (brut = la carte du dashboard) : rien à signaler → null ; sinon le choix (gardé pour la session de l'éditeur)
  async _choisirRejets(brut) {
    const rejets = this._rejetsConfig(brut);
    if (!rejets.length) return null;
    (brut.floors || []).forEach((f, i) => rejets.forEach((r) => { if (r.etage === i) r.brutEtageId = f?.id; }));
    const choix = this._choixRejets || await this._dialogueRejets(rejets);
    if (choix === "annuler") return "annuler";
    this._choixRejets = choix;
    return choix === "garder" ? rejets : null;
  }
} // @assemblage
