// étages (L6) : image de fond (calque « fond ») — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // ---------- image de fond (plan scanné, photo) : calque « fond », sous tout le dessin ----------
  // Dessinée en édition ; en vue seulement avec `show: always` (et le calque non masqué) : sinon rien n'est chargé, replay compris.
  // L'<image> est créée à part (createElementNS + setAttribute) avec l'URL revalidée, jamais posée par HTML : le filet retire
  // toute <image> d'un fragment. Le crochet de _construire reçoit ici un <g> vide, rempli juste après la pose du SVG.
  static urlFond(v) { return urlFond(v) || null; }
  _dessinerFond(c, { ed, Q }) {
    const f = c.fond, url = f && urlFond(f.image);
    this._fondAPoser = null;
    if (!url || !(+f.largeur > 0) || (!ed && (f.afficher !== "toujours" || Q.masques.has(CALQUE_FOND)))) return "";
    this._fondAPoser = { f, url };
    queueMicrotask(() => this._poserFond());
    const cls = `${Q.masques.has(CALQUE_FOND) ? " c-masque" : ""}${ed && this._fondVerrouille() ? " c-verrou" : ""}`;
    return `<g class="cq fond${cls}" data-cq="${CALQUE_FOND}" aria-hidden="true"></g>`;
  }
  // verrouillé par défaut en édition (on clique à travers, l'image ne bouge pas) ; « déverrouiller » vaut pour la session d'édition
  _fondVerrouille() {
    const e = this._editeur;
    return !e || !e.fondLibre || (this._config?.calques?.verrous || []).includes(CALQUE_FOND);
  }
  // largeur, hauteur (cm) et transformation : hauteur absente → ratio naturel de l'image (connu une fois chargée)
  _geoFond(f, url) {
    const [x, y] = Array.isArray(f.pos) && f.pos.length === 2 && f.pos.every((v) => Number.isFinite(+v)) ? f.pos.map(Number) : [0, 0];
    const w = +f.largeur, r = this._fondRatios?.get(url), h = +f.hauteur > 0 ? +f.hauteur : r ? w * r : null, rot = +f.rotation || 0;
    return { x, y, w, h, rot, tr: rot && h ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : "" };
  }
  _poserFond() {
    const p = this._fondAPoser, g = p && this.shadowRoot?.querySelector(`.zone svg>g[data-cq="${CALQUE_FOND}"]`);
    if (!g || g.firstChild) return;
    const { f, url } = p, im = document.createElementNS("http://www.w3.org/2000/svg", "image"), G = this._geoFond(f, url);
    const fixer = (G2) => {
      for (const [k, v] of [["x", G2.x], ["y", G2.y], ["width", G2.w], ["height", G2.h]]) if (v != null) im.setAttribute(k, String(v));
      if (G2.tr) im.setAttribute("transform", G2.tr); else im.removeAttribute("transform");
    };
    fixer(G);
    im.setAttribute("preserveAspectRatio", "none");
    im.setAttribute("opacity", String(Number.isFinite(+f.opacite) ? Math.min(1, Math.max(0, +f.opacite)) : 0.5));
    im.setAttribute("decoding", "async");
    im.setAttribute("class", "fond-image");
    im.style.pointerEvents = "none";
    if (G.h == null) {
      // ratio naturel : lu une fois (même fichier, déjà en cache), gardé pour les reconstructions suivantes
      im.addEventListener("load", () => {
        const i = new Image();
        i.src = url;
        i.decode().then(() => {
          if (!i.naturalWidth || !i.naturalHeight) return;
          (this._fondRatios ||= new Map()).set(url, i.naturalHeight / i.naturalWidth);
          if (im.isConnected) fixer(this._geoFond(f, url));
        }, () => {});
      }, { once: true });
    }
    im.setAttribute("href", url);
    g.append(im);
  }
} // @assemblage
