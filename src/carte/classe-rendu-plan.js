// rendu du plan (_construire) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  _construire() {
    this._squelette();
    const c = this._config, R = this.shadowRoot;
    this._poserPalette(c);
    this._suivies = this._entites();
    this._prec = {};
    this._box = this._boxFige || this.bornes();
    this._refW = this.bornes().W; // textes et zones d'informations : taille rapportée au plan entier de la vue
    if (this._editeur) this._iso = null;
    if (this._iso != null && !c.pieces[this._iso]) this._iso = null;
    // fiche ouverte d'un élément qui n'existe plus ou n'a plus de fiche (config rechargée), ou éditeur ouvert : on la ferme
    if (this._mf && (this._editeur || !this._ficheOuvrable(this._mf.genre, this._mfObjet()))) R?.querySelector("dialog.mf")?.close();
    const { x0, y0, W, H } = this.vue();
    const pct = ([x, y]) => `left:${((x - x0) / W * 100).toFixed(3)}%;top:${((y - y0) / H * 100).toFixed(3)}%`;
    const xy = ([x, y]) => `data-x="${+x}" data-y="${+y}"`;
    const chemin = (segs) => segs.map(([a, b, d, e]) => `M${a} ${b}L${d} ${e}`).join("");

    // calques : masqués = absents en vue, à 25 % et non cliquables en édition ; verrouillés = transparents au clic (édition)
    const Q = this._calques(), ed = !!this._editeur;
    const voir = (k) => ed || !Q.masques.has(k);
    const cq = (...ks) => ks.map((k) => `${Q.masques.has(k) ? " c-masque" : ""}${Q.verrous.has(k) ? " c-verrou" : ""}`).join("");
    // élément masqué (`masque: true`) : absent en vue, en transparence (mais sélectionnable) en édition
    const garde = (o) => ed || !o?.masque, em = (o) => (o?.masque ? " e-masque" : "");
    const trie = (l, niv = (o) => nb(o.niveau)) => l.map((o, i) => [o, i]).filter(([o]) => garde(o)).sort((a, b) => niv(a[0]) - niv(b[0]) || a[1] - b[1]);
    const S = {};
    // sous-zones (cuisine, douche…) : contour pointillé au-dessus des pièces, sans teinte ; en vue, le clic passe à la pièce dessous
    for (const [k, sz] of [["pieces", false], ["sous_zones", true]]) S[k] = trie(c.pieces).filter(([p]) => !!p.sous_zone === sz)
      .map(([p, i]) => `<polygon class="piece${p.dehors ? " dehors" : ""}${p.sous_zone ? " sous-zone" : ""}${em(p)}" data-p="${i}" points="${ptsSvg(p.poly)}"/>`).join("");
    // lumière de l'ambiance (`ambiance.lumiere.lampes`) : un dégradé par halo, à la couleur de la lampe, fondus entre eux (écran)
    // et coupés par l'espace de la pièce de la lampe (celle où elle est posée si `piece` manque ; pièces ouvertes l'une sur l'autre réunies,
    // voir espacesOuverts) ; `piece: false` = halo libre, jamais coupé
    const LU = coucheLumiere((!ed || this._editeur?.vueAmbiance) && objetSimple(c.ambiance) ? c.ambiance : null), lampes = !!LU?.lampes;
    let ESP = null;
    S.halos = (c.points || []).map((p, i) => {
      if (!p.halo || !garde(p)) return "";
      let k = typeof p.piece === "string" ? c.pieces.findIndex((q) => q.nom === p.piece) : -1;
      if (k < 0 && p.piece !== false && lampes && point(p.pos)) k = c.pieces.findIndex((q) => !q.sous_zone && Array.isArray(q.poly) && q.poly.length > 2 && dansPoly(p.pos, q.poly));
      const lc = lampes && (p.entite || "").startsWith("light.");
      if (k >= 0) ESP ||= espacesOuverts(c.pieces, c.murs, c.ouvertures);
      return (k >= 0 ? `<clipPath id="cp${i}">${ESP[k].map((j) => `<polygon points="${ptsSvg(c.pieces[j].poly)}"/>`).join("")}</clipPath>` : "")
        + (lc ? `<radialGradient id="halo-${i}"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient>` : "")
        + `<circle class="halo${lc ? " lampe" : ""}" data-h="${i}" cx="${p.pos[0]}" cy="${p.pos[1]}" r="${p.halo === true ? 130 : nb(p.halo)}" fill="url(#halo${lc ? `-${i}` : ""})" opacity="0"${k >= 0 ? ` clip-path="url(#cp${i})"` : ""}/>`;
    }).join("");
    // meuble connecté : cliquable en vue, contour et teinte d'accent quand il est actif (mis à jour par _maj, sans reconstruction)
    const accent = (m) => { const k = couleurMeuble(m); return ` style="${k ? `--mb-couleur:${esc(k)};` : ""}${styleAnim(animDe(c, "meuble", m))}"`; };
    S.meubles = trie(c.meubles || [], niveauMeuble).map(([m, i]) => dessinMeuble(m).replace('<g class="meuble',
      `<g data-mb="${i}"${estConnecte(m) ? accent(m) : ""} class="meuble${em(m)}${estConnecte(m) ? ` connecte${m.teinte === false ? "" : " teinte"}${clicMeuble(m) === "aucun" ? " sans-clic" : ""}${classeAnim(animDe(c, "meuble", m))}` : ""}`)).join("");
    S.limites = c.limites?.length ? `<path class="limites" d="${chemin(c.limites)}"/>` : "";
    S.murs = `<path class="murs" d="${chemin(c.murs || [])}"/>`;
    S.ouvertures = trie(c.ouvertures || []).map(([o, i]) => {
      const [a, b, d, e] = o.seg, [nx, ny] = o.dehors || [0, 0], ent = entOuv(o) || o.volet;
      const { baie, traits } = traitsOuverture(o);
      const av = animDe(c, "volet", o, "animation_volet"), ao = animDe(c, "ouverture", o);
      const volet = o.volet ? `<path class="volet${classeAnim(av)}" style="${styleAnim(av)}" data-v="${i}" d="M${a + nx * 16} ${b + ny * 16}L${d + nx * 16} ${e + ny * 16}"/>` : "", mode = clicPorteur(o);
      // ouverture à fiche : atteignable au clavier (Entrée / Espace), annoncée comme ouvrant une fenêtre de dialogue
      const kb = mode === "fiche" && !ed ? ` tabindex="0" role="button" aria-haspopup="dialog" aria-label="${esc(o.nom || (ent ? this._nom(ent) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))))}"` : "";
      return `<g class="ouv${Object.hasOwn(NOMS_OUVERTURE, o.type) ? ` ${o.type}` : ""}${o.contact || o.entite ? "" : " sans"}${mode === "aucun" ? " sans-clic" : mode ? " a-fiche" : ""}${em(o)}${classeAnim(ao)}" style="${styleAnim(ao)}" data-o="${i}"${ent ? ` data-e="${esc(ent)}"` : ""}${kb}>
        ${ent || mode === "fiche" ? `<path class="cible" d="M${a} ${b}L${d} ${e}"/>` : ""}${baie}${traits}${volet}<title></title></g>`;
    }).join("");
    let svg = `<svg viewBox="${x0} ${y0} ${W} ${H}" role="img" aria-label="${esc(c.titre || _t("Plan de la maison"))}">
      <defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient></defs>`;
    // ambiance (pas en édition) : teinte de nuit (plus forte dehors), lumière du soleil et météo sur les extérieurs, sous les halos
    const A = (!ed || this._editeur?.vueAmbiance) && c.ambiance && typeof c.ambiance === "object" ? c.ambiance : null, b0 = this._box;
    const ext = c.pieces.filter((p) => p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    // pièces intérieures : la météo (nuages, brume, pluie…) n'y est jamais peinte, même sous un extérieur qui les recouvre
    const int = c.pieces.filter((p) => !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    let amb = "";
    if (A) {
      const r = `x="${b0.x0}" y="${b0.y0}" width="${b0.W}" height="${b0.H}"`;
      amb = `<g class="amb" aria-hidden="true"><defs><linearGradient id="amb-g" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb74d"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient>
        <radialGradient id="amb-nuage"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>
        ${ext.length ? `<clipPath id="cp-dehors">${ext.map((p) => `<polygon points="${ptsSvg(p.poly)}"/>`).join("")}</clipPath>` : ""}
        ${ext.length && int.length ? `<mask id="m-dedans" maskUnits="userSpaceOnUse" ${r}><rect ${r} fill="#fff"/>${int.map((p) => `<polygon points="${ptsSvg(p.poly)}" fill="#000"/>`).join("")}</mask>` : ""}</defs>
        <rect class="amb-n amb-ni" ${r} fill="#0b1d4d" opacity="0"/>
        ${ext.length ? `<g clip-path="url(#cp-dehors)"><rect class="amb-n amb-ne" ${r} fill="#0b1d4d" opacity="0"/><rect class="amb-sol" ${r} fill="url(#amb-g)" opacity="0"/><g class="amb-meteo"${int.length ? ` mask="url(#m-dedans)"` : ""}></g></g>` : ""}</g>`;
      if (LU && (LU.soleil || LU.lune)) amb += `<g class="lum" aria-hidden="true"></g>`;
    }
    this._lumCle = null;
    this._meteoCle = null; this._fluxCle = null;
    svg += this._dessinerFond?.(c, { ed, Q, cq }) || ""; // image de fond (calque « fond »), sous tout le dessin
    for (const k of Q.svg) {
      if (k === "halos") svg += amb;
      if (voir(k)) svg += `<g class="cq${k === "meubles" ? " meubles" : ""}${k === "halos" && lampes ? " fondu" : ""}${cq(k)}" data-cq="${k}"${k === "meubles" && !ed ? ` aria-hidden="true"` : ""}>${S[k]}</g>`;
      if (k === "meubles" && A && coucheEnergie(A)) svg += `<g class="flux" aria-hidden="true"></g>`; // billes au-dessus des meubles
    }
    const vit = c.vitrine ? this._vitrine(pct, xy) : null;
    if (vit) svg += vit.svg;
    const iso = this._iso != null ? c.pieces[this._iso] : null;
    if (iso) {
      const b = this._box;
      svg += `<path class="voile" fill-rule="evenodd" d="M${b.x0 - 5000} ${b.y0 - 5000}h${b.W + 10000}v${b.H + 10000}h${-(b.W + 10000)}Z M${iso.poly.map((q) => `${+q[0]} ${+q[1]}`).join("L")}Z"/>`;
    }
    svg += `</svg>`;
    const hors = (pos) => iso && !dansPoly(pos, iso.poly) ? " hors" : "";

    const H_ = { etiquettes: "", libelles: "", appareils: "", textes: "", meubles: "" };
    // meuble connecté : bouton HTML centré (cible tactile ≥ 44 px, clavier, lecteur d'écran) qui porte le badge de valeur
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m, i]) => {
      if (!estConnecte(m)) return;
      const nom = esc(m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble"))), b = clicMeuble(m) !== "aucun";
      const am = animDe(c, "meuble", m);
      H_.meubles += `<${b ? "button" : "span"} class="mb${hors(m.pos)}${cq("meubles")}${em(m)}${classeAnim(am)}" data-mbq="${i}" ${xy(m.pos)} style="${pct(m.pos)}${couleurMeuble(m) ? `;--mb-couleur:${esc(couleurMeuble(m))}` : ""};${styleAnim(am)}"${b ? ` aria-haspopup="${clicMeuble(m) === "fiche" ? "dialog" : "false"}" aria-label="${nom}"` : ""}><span class="v"></span></${b ? "button" : "span"}>`;
    });
    const cp = interactionDe(c).clic; // `interaction.room_tap`
    const EP = etiquettesPieces(c);
    trie(c.pieces).forEach(([p, i]) => {
      if (!p.etiquette) return;
      const cible = p.clic || p.temperature;
      // étiquette sans action au toucher (rien, ou « plus d'infos » sans entité) : pas d'apparence de bouton cliquable
      // (hors de l'ordre du clavier : elle ne fait rien)
      const inerte = !ed && cp !== "vue" && p.zoom !== false && (cp === "aucun" || !cible) ? " inerte" : "";
      if (p.sous_zone) { if (voir("sous_zones")) H_.libelles += `<span class="zone-etq sz${iso && !dansPoly(p.etiquette, iso.poly) ? " hors" : ""}${cq("libelles", "sous_zones")}${em(p)}" data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}">${esc(p.nom)}</span>`; return; }
      H_.etiquettes += `<button class="etq${p.dehors ? " dehors" : ""}${iso && i !== this._iso ? " hors" : ""}${cq("etiquettes")}${em(p)}${inerte}"${inerte ? ` tabindex="-1"` : ""} data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}"${cible ? ` data-e="${esc(cible)}"` : ""}>
        <b${EP.nom ? "" : ' class="cache"'}>${esc(p.nom)}</b><span class="val"></span></button>`;
    });
    const bs = classesPastilles(stylePastilles(c));
    // appareil « seulement dans la vue de sa pièce » (`zoom_only`, sinon `badge_style.zoom_only`) : absent du plan entier, toujours là en édition
    const zoomSeul = !ed && (c.points || []).some((p) => p.zoom_seul ?? c.style_pastilles?.zoom_seul);
    trie(c.points || []).forEach(([p, i]) => {
      if (zoomSeul && (p.zoom_seul ?? c.style_pastilles?.zoom_seul) && !(iso && dansPoly(p.pos, iso.poly))) return;
      const ap = animDe(c, evenementPoint(p), p);
      H_.appareils += `<button class="pt${bs}${hors(p.pos)}${cq("appareils")}${em(p)}${classeAnim(ap)}" data-q="${i}" data-e="${esc(p.entite)}" ${xy(p.pos)} style="${pct(p.pos)};--pt-couleur:${couleurSure(p.couleur) || "var(--state-active-color,#fdd835)"};${styleAnim(ap)}"${clicPorteur(p) === "fiche" ? ` aria-haspopup="dialog"` : ""}>
        <ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon><span class="v"></span></button>`;
    });
    // nom d'un espace : libellé d'un meuble, masqué avec le calque Meubles comme avec celui des libellés
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m]) => {
      if (m.type === "espace" && m.nom) H_.libelles += `<span class="zone-etq${hors(m.pos)}${cq("libelles", "meubles")}${em(m)}" ${xy(m.pos)} style="${pct(m.pos)}">${esc(m.nom)}</span>`;
    });
    trie(c.textes || []).forEach(([t, i]) => {
      // zone d'informations : un texte qui porte une liste d'entités (titre facultatif, une ligne par entité, valeurs en direct)
      if (Array.isArray(t.infos)) {
        H_.textes += `<div class="txt infob${t.style === "discret" ? " discret" : ""}${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">
          ${t.t ? `<b class="ib-t">${esc(t.t)}</b>` : ""}${t.infos.map((l, j) => `<span class="ib-l" data-ibl="${j}"${typeof l?.entite === "string" ? ` data-e="${esc(l.entite)}"` : ""}><ha-icon icon="${esc(l?.icone || "mdi:information-outline")}"></ha-icon><span class="ib-n"></span><span class="ib-v"></span></span>`).join("")}
          ${t.infos.length ? "" : `<span class="ib-vide">${_t("Ajoute des entités")}</span>`}</div>`;
        return;
      }
      H_.textes += `<span class="txt${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">${esc(t.t)}</span>`;
    });
    // les boutons des meubles passent sous les pastilles (même place que le calque Appareils, qu'il soit affiché ou non)
    const calque = Q.html.map((k) => (k === "appareils" ? H_.meubles : "") + (voir(k) ? H_[k] : "")).join("")
      + (A && coucheJour(A) && coucheJour(A).marqueur !== false ? `<span class="amb-astre" hidden><ha-icon icon="mdi:white-balance-sunny"></ha-icon></span>` : "")
      + (vit ? vit.html : "") + (A ? this._htmlPersonnes(A) : "");

    // mode tablette sans titre : dans la vue d'une pièce, son nom sert de titre (sans « › » devant)
    const tabSansTitre = !c.titre && !!this._tablette();
    poserHTML(R.querySelector(".titre"), `${esc(c.titre || "")}${iso ? (tabSansTitre ? esc(iso.nom) : ` <span class="fil">› ${esc(iso.nom)}</span>`) : ""}${this._sim ? ` <span class="badge-demo" title="${_t("Appartement de démonstration : états simulés, aucune commande n'atteint la maison")}">${_t("Démo · états simulés")}</span>` : ""}`);
    R.querySelector(".retour").hidden = !iso;
    // vue figée : boutons de zoom cachés ; mode tablette sans titre : pas d'en-tête (sauf dans la vue d'une pièce, pour le retour),
    // le bouton d'édition passe alors avec les boutons du plan
    const fig = this._figee(), tab = this._tablette(), sansTete = !!tab && !c.titre && !iso && !this._sim;
    R.querySelector('[data-z="tout"]').hidden = !this._vue || fig;
    for (const z of ["plus", "moins"]) R.querySelector(`[data-z="${z}"]`).hidden = fig;
    R.querySelector(".barre").hidden = sansTete;
    const bEd = R.querySelector(".editer"), hote = R.querySelector(sansTete ? ".zoom" : ".barre");
    if (bEd.parentElement !== hote) hote.append(bEd);
    this._placerZoom();
    const niv = this._niveauAnim(), card = R.querySelector("ha-card");
    card.classList.toggle("anim-reduit", niv === "reduit");
    card.classList.toggle("anim-aucune", niv === "aucun");
    card.classList.toggle("tablette", !!tab);
    const brp = R.querySelector('[data-z="replay"]');
    brp.hidden = ed || !c.replay;
    brp.classList.toggle("on", !!this._rp);
    const bcq = R.querySelector('[data-z="calques"]');
    bcq.hidden = ed || !c.calques?.bouton_vue || !this._calquesMenu().length;
    if (bcq.hidden) this._menuCalques(false);
    const zone = R.querySelector(".zone");
    zone.classList.toggle("zoome", !!this._vue);
    zone.classList.toggle("figee", fig);
    zone.style.aspectRatio = `${this._box.W} / ${this._box.H}`;
    zone.classList.toggle("amb-glisse", ed && !!this._editeur?.vueAmbiance && !!A && !!couchePersonnes(A));
    const tc = coucheTraces(A)?.couleur;
    zone.style.setProperty("--trace-c", couleurSure(tc) || "var(--md-primary)");
    zone.classList.toggle("sur-fond", this._solFond != null);
    if (this._solFond != null) zone.style.setProperty("--sol-fond", String(this._solFond));
    poserHTML(R.querySelector(".zone"), `${svg}<div class="calque">${calque}</div>`);
    this._mbs = (c.meubles || []).map((m, i) => (estConnecte(m) ? { m, g: R.querySelector(`.zone svg [data-mb="${i}"]`), b: R.querySelector(`.calque>[data-mbq="${i}"]`) } : null)).filter((x) => x && (x.g || x.b));
    const deg = `linear-gradient(90deg,${PALIERS.map(([t, col]) => `${col} ${((t - 17) / 11 * 100).toFixed(0)}%`).join(",")})`;
    // légende : dégradé aux bornes de la teinte (`temperature_tint`), retiré sans teinte ; `legend: false` la cache
    const te = teinteTemp(c);
    poserHTML(R.querySelector(".legende"), `${te ? `<span>${fmt(te[0])} °C<span class="degrade" style="background:${deg}"></span>${fmt(te[1])} °C</span>` : ""}
        <span><i style="color:var(--plan-ferme)"></i>${_t("fermé")}</span><span><i style="color:var(--md-error)"></i>${_t("ouvert")}</span>
        ${(c.ouvertures || []).some((o) => o.volet) ? `<span><i style="color:var(--plan-volet);border-top-width:6px"></i>${_t("volet baissé")}</span>` : ""}`);
    const vide = !c.pieces.length && !(c.murs || []).length && !(c.points || []).length;
    // plan vide (hors éditeur) : rien à zoomer, pas de boutons de zoom (ni au survol)
    if (vide && !this._editeur) for (const z of ["plus", "moins", "tout"]) R.querySelector(`[data-z="${z}"]`).hidden = true;
    R.querySelector(".tete").hidden = !this._editeur && (vide || !this._puces().length || (!!tab && !tab.resume));
    R.querySelector(".legende").hidden = !c.pieces.length || c.legende === false;
    let ev = R.querySelector(".etat-vide");
    if (vide) {
      const admin = !!this._hass?.user?.is_admin && c.edition !== false && !this._apercu();
      if (!ev) { ev = document.createElement("div"); ev.className = "etat-vide"; R.querySelector(".plan").append(ev); }
      poserHTML(ev, admin ? `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan est vide")}</h2>
          <p>${_t("Pars des pièces de Home Assistant (avec leurs appareils), dessine les pièces, ou importe un plan déjà fait.")}</p>
          <div class="actions"><button class="plein" data-depart="pieces"><ha-icon icon="mdi:home-import-outline"></ha-icon>${_t("Démarrer avec mes pièces")}</button>
            <button data-depart="rectangle"><ha-icon icon="mdi:rectangle-outline"></ha-icon>${_t("Dessiner une pièce")}</button>
            <button data-depart="importer"><ha-icon icon="mdi:file-import-outline"></ha-icon>${_t("Importer un plan")}</button></div>`
        : `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan n'est pas encore dessiné")}</h2><p>${_t("Un administrateur peut le créer avec le bouton crayon de cette carte.")}</p>`);
    } else ev?.remove();
    R.querySelector(".editer").hidden = !!this._editeur || c.edition === false || !this._hass?.user?.is_admin || this._apercu();
    R.querySelector(".corps").classList.toggle("edition", !!this._editeur);
    this._ok = true;
    this._minuterie();
    this._change();
    this._maj();
    this._editeur?.apresConstruction();
    this._mise();
    this._reprise();
    this._accroches("construit"); // morceaux branchés ici (étages : sélecteur)
  }

} // @assemblage
