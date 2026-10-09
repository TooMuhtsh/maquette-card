// rendu du plan : repère, calques, palette, _construire, vue, zoom, isolement, gestes — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // repère : position d'un événement pointeur en cm (coordonnées du plan)
  cm(ev) {
    const svg = this.shadowRoot.querySelector(".zone svg");
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  // cadre du plan : celui de l'étage affiché, ou l'union de tous les étages (la carte ne change ni d'échelle ni de hauteur d'un étage
  // à l'autre ; l'image de fond n'y entre pas) — en vue, calculée une fois par config et par largeur affichée
  bornes(sansVitrine = false) {
    const c = this._config, m = c.marge ?? 40;
    let b;
    if (idsEtages(c).length > 1) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, K = this._bornesEt;
      if (!this._editeur && K && K.plein === this._plein && K.P === P) b = K.b;
      else {
        const l = parEtage(c).map((e) => this._bornesGeo({ ...e.geo, marge: c.marge }, true)).filter(Boolean);
        b = l.length ? l.reduce((u, q) => { const x0 = Math.min(u.x0, q.x0), y0 = Math.min(u.y0, q.y0); return { x0, y0, W: Math.max(u.x0 + u.W, q.x0 + q.W) - x0, H: Math.max(u.y0 + u.H, q.y0 + q.H) - y0 }; })
          : this._bornesGeo(c);
        this._bornesEt = this._editeur ? null : { plein: this._plein, P, b };
      }
    } else b = this._bornesGeo(c);
    if (!c.vitrine || sansVitrine) return b;
    const v = geoVitrine(c, b), X0 = Math.min(b.x0, v.x - m), Y0 = Math.min(b.y0, v.y - m);
    return { x0: X0, y0: Y0, W: Math.max(b.x0 + b.W, v.x + v.w + m) - X0, H: Math.max(b.y0 + b.H, v.y + v.H + m) - Y0 };
  }
  // cadre d'une géométrie (listes d'un étage, ou la config) ; vide : null si `nulSiVide`, sinon 0..500
  _bornesGeo(c, nulSiVide = false) {
    const xs = [], ys = [];
    const ajoute = (x, y) => { xs.push(x); ys.push(y); };
    c.pieces.forEach((p) => p.poly.forEach(([x, y]) => ajoute(x, y)));
    [...(c.murs || []), ...(c.limites || []), ...(c.ouvertures || []).map((o) => o.seg)].forEach(([a, b, d, e]) => { ajoute(a, b); ajoute(d, e); });
    (c.points || []).forEach((p) => ajoute(...p.pos));
    (c.meubles || []).forEach((m) => { const [w, h] = [0, 1].map((j) => nb((m.taille || MEUBLES[m.type]?.taille || [60, 60])[j], 60)), r = Math.hypot(w, h) / 2; ajoute(nb(m.pos?.[0]) - r, nb(m.pos?.[1]) - r); ajoute(nb(m.pos?.[0]) + r, nb(m.pos?.[1]) + r); });
    if (!xs.length) { if (nulSiVide) return null; ajoute(0, 0), ajoute(500, 500); }
    const m = c.marge ?? 40;
    let x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, x1 = Math.max(...xs) + m, y1 = Math.max(...ys) + m;
    // textes figés et zones d'informations (centrés sur leur position, police en px : clamp(10px, 1,2 % de la largeur, 13px)) :
    // emprise estimée d'après leurs caractères et la largeur affichée du plan ; le cadre ne s'agrandit que si un texte dépasse
    const textes = (c.textes || []).filter((t) => t && Array.isArray(t.pos) && Number.isFinite(+t.pos[0]) && Number.isFinite(+t.pos[1]));
    if (textes.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, px = Math.max(10, Math.min(13, 0.012 * P));
      const nomL = (l) => String(l?.nom || this._hass?.states?.[l?.entite]?.attributes?.friendly_name || l?.entite || "").length;
      // largeur d'un texte en em : majuscules et chiffres plus larges, espaces plus étroits
      const largeur = (txt) => [...txt].reduce((a, ch) => a + (ch === " " ? 0.3 : /[A-Z0-9ÀÂÉÈÊÎÔÛÇMW]/.test(ch) ? 0.72 : 0.56), 0);
      for (let tour = 0; tour < 4; tour++) { // l’emprise agrandit le plan, donc les textes en cm : quelques passes
        const em = (px * (x1 - x0)) / P;
        for (const t of textes) {
          const f = em * Math.max(0.3, Math.min(5, nb(t.taille, 1))), titre = String(t.t ?? ""), info = Array.isArray(t.infos);
          const l = info ? Math.max(6, largeur(titre) + 1.5, ...t.infos.map((x) => (nomL(x) + 9) * 0.55 + 2.2)) * f + 1.5 * f : Math.max(0.6, largeur(titre)) * f;
          const h = info ? ((t.infos.length || 1) + (titre ? 1 : 0)) * 1.5 * f + 0.9 * f : 1.3 * f;
          const [x, y] = [+t.pos[0], +t.pos[1]];
          x0 = Math.min(x0, x - l / 2 - 8); x1 = Math.max(x1, x + l / 2 + 8); y0 = Math.min(y0, y - h / 2 - 8); y1 = Math.max(y1, y + h / 2 + 8);
        }
      }
    }
    return { x0, y0, W: x1 - x0, H: y1 - y0 };
  }

  // calques effectifs : ordre de dessin, masqués (config, afficher_meubles, choix du visiteur en vue) et verrouillés (édition seulement)
  _calques() {
    const c = this._config, q = c.calques || {}, ed = !!this._editeur, masques = new Set(q.masques || []);
    if (c.afficher_meubles === false || (c.afficher_meubles === "pc" && this.clientWidth < 760)) masques.add("meubles");
    if (!ed) this._calquesVisiteur().forEach((k) => masques.add(k));
    return { svg: ordreCalques(q.ordre_svg, CALQUES_SVG), html: ordreCalques(q.ordre_html, CALQUES_HTML), masques, verrous: new Set(ed ? q.verrous || [] : []) };
  }

  // bouton « Calques » en vue : choix propres à ce navigateur (jamais dans la config), ignorés si le bouton est retiré
  _cleCalques() { return `maquette-calques:${this._config.id || "plan"}`; }
  _calquesVisiteur() {
    if (!this._config.calques?.bouton_vue) return [];
    const cle = this._cleCalques();
    if (this._cqV?.cle !== cle) {
      let l = [];
      try { l = JSON.parse(localStorage.getItem(cle) || "[]"); } catch (e) { /* stockage indisponible : rien de caché */ }
      this._cqV = { cle, l: Array.isArray(l) ? l.filter((k) => NOMS_CALQUES[k]) : [] };
    }
    return this._cqV.l;
  }
  // calques proposés dans le menu de la vue : ceux qui ont des éléments et que la config ne cache pas déjà
  _calquesMenu() {
    const c = this._config, q = c.calques || {}, P = c.points || [], M = c.meubles || [];
    const presents = { meubles: M.length, appareils: P.length, halos: P.some((p) => p.halo), limites: (c.limites || []).length, sous_zones: c.pieces.some((p) => p.sous_zone),
      etiquettes: c.pieces.some((p) => !p.sous_zone && p.etiquette), libelles: c.pieces.some((p) => p.sous_zone && p.etiquette) || M.some((m) => m.type === "espace" && m.nom), textes: (c.textes || []).length };
    const fixes = new Set(q.masques || []);
    if (c.afficher_meubles === false) fixes.add("meubles");
    return Object.keys(presents).filter((k) => presents[k] && !fixes.has(k));
  }
  _menuCalques(ouvrir = true) {
    const R = this.shadowRoot, zoom = R.querySelector(".zoom"), btn = R.querySelector('[data-z="calques"]'), ouvert = R.querySelector(".menu-cq");
    if (ouvert || !ouvrir) {
      ouvert?.remove();
      btn.setAttribute("aria-expanded", "false");
      window.removeEventListener("pointerdown", this._horsMenu, true);
      return;
    }
    const caches = new Set(this._calquesVisiteur());
    const m = document.createElement("div");
    m.className = "menu-cq";
    m.setAttribute("role", "group");
    m.setAttribute("aria-label", _t("Calques affichés"));
    poserHTML(m, `<div class="t">${_t("Afficher")}</div>${this._calquesMenu().map((k) => `<label><input type="checkbox" data-cqv="${k}" ${caches.has(k) ? "" : "checked"}><ha-icon icon="${ICONES_CALQUES[k]}"></ha-icon><span>${esc(_t(NOMS_CALQUES[k]))}</span></label>`).join("")}`);
    m.onchange = (ev) => {
      const k = ev.target.dataset.cqv;
      if (!k) return;
      const l = new Set(this._calquesVisiteur());
      if (ev.target.checked) l.delete(k); else l.add(k);
      this._cqV = { cle: this._cleCalques(), l: [...l] };
      if (l.size) stock.ecrire(this._cqV.cle, JSON.stringify([...l])); else stock.retirer(this._cqV.cle); // stockage indisponible : le choix vaut pour cette page
      this._construire();
    };
    m.onkeydown = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._menuCalques(false); btn.focus(); } };
    this._horsMenu = (ev) => { if (!ev.composedPath().some((n) => n === m || n === btn)) this._menuCalques(false); };
    window.addEventListener("pointerdown", this._horsMenu, true);
    zoom.append(m);
    btn.setAttribute("aria-expanded", "true");
    m.querySelector("input")?.focus();
  }

  // couleurs nommées : --mq-c-<nom> sur l'hôte (héritées dans le shadow DOM) ; les noms retirés de la palette perdent leur variable
  _poserPalette(c) {
    const l = palette(c), noms = new Set(l.map(([n]) => n));
    for (const n of this._palNoms || []) if (!noms.has(n)) this.style.removeProperty(`--mq-c-${n}`);
    for (const [n, v] of l) { paletteActive.add(n); this.style.setProperty(`--mq-c-${n}`, v); }
    this._palNoms = noms;
  }
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
    // et coupés par la pièce de la lampe (celle où elle est posée si `piece` manque)
    const LU = coucheLumiere((!ed || this._editeur?.vueAmbiance) && objetSimple(c.ambiance) ? c.ambiance : null), lampes = !!LU?.lampes;
    S.halos = (c.points || []).map((p, i) => {
      if (!p.halo || !garde(p)) return "";
      let k = p.piece != null ? c.pieces.findIndex((q) => q.nom === p.piece) : -1;
      if (k < 0 && lampes && point(p.pos)) k = c.pieces.findIndex((q) => !q.sous_zone && Array.isArray(q.poly) && q.poly.length > 2 && dansPoly(p.pos, q.poly));
      const lc = lampes && (p.entite || "").startsWith("light.");
      return (k >= 0 ? `<clipPath id="cp${i}"><polygon points="${ptsSvg(c.pieces[k].poly)}"/></clipPath>` : "")
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
    poserHTML(R.querySelector(".zone"), `${svg}<div class="calque">${calque}</div>`);
    this._mbs = (c.meubles || []).map((m, i) => (estConnecte(m) ? { m, g: R.querySelector(`.zone svg [data-mb="${i}"]`), b: R.querySelector(`.calque>[data-mbq="${i}"]`) } : null)).filter((x) => x && (x.g || x.b));
    const deg = `linear-gradient(90deg,${PALIERS.map(([t, col]) => `${col} ${((t - 17) / 11 * 100).toFixed(0)}%`).join(",")})`;
    // légende : dégradé aux bornes de la teinte (`temperature_tint`), retiré sans teinte ; `legend: false` la cache
    const te = teinteTemp(c);
    poserHTML(R.querySelector(".legende"), `${te ? `<span>${fmt(te[0])} °C<span class="degrade" style="background:${deg}"></span>${fmt(te[1])} °C</span>` : ""}
        <span><i style="color:var(--plan-ferme)"></i>${_t("fermé")}</span><span><i style="color:var(--md-error)"></i>${_t("ouvert")}</span>
        ${(c.ouvertures || []).some((o) => o.volet) ? `<span><i style="color:var(--plan-volet);border-top-width:6px"></i>${_t("volet baissé")}</span>` : ""}`);
    const vide = !c.pieces.length && !(c.murs || []).length && !(c.points || []).length;
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
    this._apresConstruireEtages?.();
  }

  vue() { return this._vue || this._box; }

  // nouvelle vue (même proportions que le plan entier), bornée au plan ; null = plan entier
  _normaliser(v) {
    const B = this._box, r = B.W / B.H;
    let W = Math.min(B.W, Math.max(B.W / 8, v.W)), H = W / r;
    if (W >= B.W * 0.985) return null;
    const cx = v.x0 + v.W / 2, cy = v.y0 + v.H / 2;
    let x0 = cx - W / 2, y0 = cy - H / 2;
    x0 = Math.min(Math.max(x0, B.x0), B.x0 + B.W - W);
    y0 = Math.min(Math.max(y0, B.y0), B.y0 + B.H - H);
    return { x0, y0, W, H };
  }

  _cadrer(v, anim = false) {
    const cible = v && this._normaliser(v);
    const depart = this.vue(), fin = cible || this._box;
    cancelAnimationFrame(this._anim);
    const poser = (q) => {
      const R = this.shadowRoot, svg = R.querySelector(".zone svg");
      if (!svg || !(q.W > 0 && q.H > 0)) return;
      svg.setAttribute("viewBox", `${q.x0} ${q.y0} ${q.W} ${q.H}`);
      R.querySelectorAll(".calque>[data-x]").forEach((n) => {
        n.style.left = `${((n.dataset.x - q.x0) / q.W) * 100}%`;
        n.style.top = `${((n.dataset.y - q.y0) / q.H) * 100}%`;
      });
      this._tailleBadges(q);
    };
    const finir = () => {
      this._vue = cible;
      const R = this.shadowRoot;
      R.querySelector('[data-z="tout"]').hidden = !cible || this._figee();
      R.querySelector(".zone").classList.toggle("zoome", !!cible);
      if (this._editeur) this._construire(); else poser(fin);
    };
    if (!anim || this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches) { this._vue = cible; poser(fin); return finir(); }
    const t0 = performance.now(), D = 320, ease = (k) => 1 - Math.pow(1 - k, 3);
    const pas = (t) => {
      // l'horodatage de la 1re image peut précéder t0 : k < 0 extrapolerait au-delà du départ (largeur négative en dézoomant)
      const k = ease(Math.max(0, Math.min(1, (t - t0) / D)));
      poser({ x0: depart.x0 + (fin.x0 - depart.x0) * k, y0: depart.y0 + (fin.y0 - depart.y0) * k, W: depart.W + (fin.W - depart.W) * k, H: depart.H + (fin.H - depart.H) * k });
      if (k < 1) this._anim = requestAnimationFrame(pas); else finir();
    };
    this._anim = requestAnimationFrame(pas);
  }

  zoomer(f, centre) {
    const v = this.vue(), [cx, cy] = centre || [v.x0 + v.W / 2, v.y0 + v.H / 2];
    const W = v.W * f, H = v.H * f;
    this._cadrer({ x0: cx - (cx - v.x0) * f, y0: cy - (cy - v.y0) * f, W, H }, !centre);
  }

  toutVoir() {
    if (this._iso != null) { this._iso = null; this._construire(); }
    this._cadrer(null, true);
  }

  isoler(i) {
    // une sous-zone n'a pas de vue à elle : on isole la pièce qui la contient
    if (this._config.pieces[i]?.sous_zone) {
      const z = this._config.pieces[i].poly, c = [z.reduce((a, q) => a + q[0], 0) / z.length, z.reduce((a, q) => a + q[1], 0) / z.length];
      i = this._config.pieces.findIndex((p) => !p.sous_zone && dansPoly(c, p.poly));
      if (i < 0) return;
    }
    if (this._config.pieces[i]?.zoom === false) return;
    const poly = this._config.pieces[i].poly, B = this._box;
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = Math.max(x1 - x0, y1 - y0) * 0.14 + 40;
    let W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
    if (W / H > B.W / B.H) H = W * B.H / B.W; else W = H * B.W / B.H;
    const depart = this.vue();
    this._iso = i;
    this._vue = null;
    this._construire();
    this._vue = depart === this._box ? null : depart;
    this._cadrer({ x0: (x0 + x1) / 2 - W / 2, y0: (y0 + y1) / 2 - H / 2, W, H }, true);
  }

  _pxVersCm(cx, cy) {
    const r = this.shadowRoot.querySelector(".zone").getBoundingClientRect(), v = this.vue();
    return [v.x0 + ((cx - r.left) / r.width) * v.W, v.y0 + ((cy - r.top) / r.height) * v.H];
  }

  _gestes(zone) {
    // pincement (2 doigts) partout ; glisser d'un doigt / de la souris quand on est zoomé (hors édition)
    let pince = null, pan = null;
    const debutPince = (t) => {
      const [a, b] = t, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      pince = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, m: this._pxVersCm(mx, my), v: { ...this.vue() } };
    };
    zone.addEventListener("touchstart", (e) => {
      if (this._figee()) { pince = pan = null; return; } // vue figée : ni pincement ni déplacement, le toucher reste un clic
      if (e.touches.length === 2) { debutPince(e.touches); pan = null; this._editeur?.annulerGlisse?.(); }
      else if (e.touches.length === 1 && this._vue && !this._editeur) pan = { x: e.touches[0].clientX, y: e.touches[0].clientY, v: { ...this._vue }, bouge: false };
    }, { passive: true });
    zone.addEventListener("touchmove", (e) => {
      const r = zone.getBoundingClientRect();
      if (pince && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const B = this._box, W = Math.min(B.W, Math.max(B.W / 8, pince.v.W * pince.d / d)), H = W * B.H / B.W;
        const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
        this._cadrer({ x0: pince.m[0] - ((mx - r.left) / r.width) * W, y0: pince.m[1] - ((my - r.top) / r.height) * H, W, H });
        this._aBouge = true;
      } else if (pan && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0], dx = t.clientX - pan.x, dy = t.clientY - pan.y;
        if (Math.hypot(dx, dy) > 6) pan.bouge = this._aBouge = true;
        this._cadrer({ ...pan.v, x0: pan.v.x0 - (dx / r.width) * pan.v.W, y0: pan.v.y0 - (dy / r.height) * pan.v.H });
      }
    }, { passive: false });
    const finTouche = (e) => {
      if (e.touches.length < 2) pince = null;
      if (!e.touches.length) { pan = null; setTimeout(() => { this._aBouge = false; }, 60); }
    };
    zone.addEventListener("touchend", finTouche);
    zone.addEventListener("touchcancel", finTouche);
    zone.addEventListener("wheel", (e) => {
      if (!e.ctrlKey || this._figee()) return; // pincement du pavé tactile ou Ctrl + molette (vue figée : rien)
      e.preventDefault();
      this.zoomer(Math.exp(e.deltaY * 0.01), this._pxVersCm(e.clientX, e.clientY));
    }, { passive: false });
    zone.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== (this._editeur ? 1 : 0) || !this._vue || this._figee()) return;
      if (!this._editeur && e.composedPath().some((n) => n.classList?.contains("pt") || n.classList?.contains("mb"))) return;
      this.debutPan(e);
    });
  }

  debutPan(e) {
    if (!this._vue) return;
    const zone = this.shadowRoot.querySelector(".zone"), r = zone.getBoundingClientRect(), v0 = { ...this._vue };
    zone.classList.add("panne");
    const mv = (m) => {
      const dx = m.clientX - e.clientX, dy = m.clientY - e.clientY;
      if (Math.hypot(dx, dy) > 4) this._aBouge = true;
      this._cadrer({ ...v0, x0: v0.x0 - (dx / r.width) * v0.W, y0: v0.y0 - (dy / r.height) * v0.H });
    };
    const up = () => {
      zone.classList.remove("panne");
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
      setTimeout(() => { this._aBouge = false; }, 60);
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  }

} // @assemblage
