// thème sombre, jour / nuit, lune, lumière, fond des pièces — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // fenêtres de toit (calculs purs, voir carte/velux.js) : pour les tests et l'éditeur
  static VELUX = { tache: tacheVelux, ouvert: ouvertVelux, emprise: empriseVelux, pente: penteVelux, hauteur: hauteurVelux };
  // thème sombre : fond de la carte peu lumineux (sinon, carte transparente : réglage sombre de HA)
  _sombre() {
    const t = getComputedStyle(this.shadowRoot.querySelector("ha-card")).backgroundColor, c = t.match(/[\d.]+/g)?.map(Number), k = t.startsWith("color(") ? 1 : 255;
    if (!c || c.length < 3 || c[3] === 0) return !!this._hass?.themes?.darkMode;
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / k < 0.4;
  }

  // jour / nuit : teinte bleu nuit selon la hauteur du soleil (plus forte sur les extérieurs), lumière venant du côté du soleil
  // (azimut + `nord`), plus chaude au lever et au coucher ; repère du soleil au bord du plan ; météo redessinée quand elle change
  _majAmbiance() {
    this._majVelux();
    this._pauseAnimations();
    const R = this.shadowRoot, A = this._config.ambiance, g = R?.querySelector(".zone svg .amb");
    // effets légers (classe effets-legers, couches.css.js) : nuages et brouillard immobiles ; voir _effetsLegers
    R?.querySelector("ha-card")?.classList.toggle("effets-legers", this._effetsLegers());
    if (!A || !g) return;
    const I = intensiteAmb(A), b = this._box, nord = +A.nord || 0, jn = coucheJour(A);
    const so = jn && this._etat(jn.soleil || "sun.sun"), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const Ij = I * borne(+(jn?.intensite ?? 1), 0, 2), nuit = isNaN(e) ? 0 : borne((2 - e) / 14, 0, 1), dore = isNaN(e) || e < -4 ? 0 : Math.max(0, 1 - Math.abs(e - 3) / 9);
    // teinte de nuit et lumière du soleil : fondu par paliers (voir _palier) au lieu d'une transition continue de 40 s
    const op = (sel, v) => this._palier(g.querySelector(sel), "opacity", v.toFixed(3), 0.004);
    // thème sombre : le bleu nuit sur un fond déjà sombre ne se voit presque pas en « discret » ; on le renforce (normal et fort inchangés)
    const In = I > 0 && I < INTENSITES.normal && this._sombre() ? Math.min(INTENSITES.normal * 1.5, I * 2.3) / I : 1;
    op(".amb-ni", Ij * In * nuit * 0.22); op(".amb-ne", Ij * In * nuit * 0.5);
    const cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, f = ((az + nord) * Math.PI) / 180, ux = Math.sin(f), uy = -Math.cos(f);
    const lg = g.querySelector("#amb-g"), astre = R.querySelector(".calque>.amb-astre"), jour = !isNaN(az) && e > 0;
    if (lg && jour) {
      const rr = Math.max(b.W, b.H) / 2;
      [["x1", cx + ux * rr], ["y1", cy + uy * rr], ["x2", cx - ux * rr * 0.3], ["y2", cy - uy * rr * 0.3]].forEach(([k, v]) => attrSi(lg, k, v.toFixed(0)));
      const col = dore > 0.5 ? "#ffb74d" : "#fff59d";
      lg.querySelectorAll("stop").forEach((st) => attrSi(st, "stop-color", col));
    }
    op(".amb-sol", jour ? Ij * (0.18 + 0.32 * dore) : 0);
    if (astre) {
      if (astre.hidden !== !jour) astre.hidden = !jour;
      if (jour) {
        // au bord du plan, dans la direction du soleil (2,5 % de marge)
        const k = Math.min(Math.abs(ux) > 1e-6 ? 0.475 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.475 / Math.abs(uy) : Infinity);
        this._palier(astre, "left", (50 + ux * k * 100).toFixed(2), 0.05, "%"); this._palier(astre, "top", (50 + uy * k * 100).toFixed(2), 0.05, "%");
        const hm = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" }) : "?"; };
        titreSi(astre, _t("Soleil : hauteur {h}°, azimut {az}° · coucher {coucher}", { h: Math.round(e), az: Math.round(az), coucher: hm(so.attributes.next_setting) }));
      }
    }
    const me = coucheMeteo(A), w = me && this._etat(me.entite), zm = g.querySelector(".amb-meteo");
    const cle = w && zm ? [w.state, w.attributes.cloud_coverage, Math.round(+w.attributes.wind_speed || 0), Math.round((+w.attributes.wind_bearing || 0) / 10)].join("|") : "";
    if (zm && cle !== this._meteoCle) { this._meteoCle = cle; poserHTML(zm, w ? dessinMeteo(w, b, nord, I * borne(+(me.intensite ?? 1), 0, 2), this._sansBoucles(), "amb", 1, me.sens ?? 135) : ""); }
    // nuages : quasi invisibles la nuit (sinon, clairs sur fond sombre, on les prendrait pour des halos de lumière)
    zm?.querySelectorAll(".m-nuages").forEach((n) => { n.style.opacity = (+n.dataset.op * (1 - 0.85 * nuit)).toFixed(3); });
    this._majLumiere(I, nord);
  }

  // animations du plan (minuterie : billes des flux ; CSS : météo, nuages, pulsations, brouillard, éclairs…) en pause quand le plan n'est pas à l'écran
  // (hors de la vue, carte cachée : IntersectionObserver de _minuterie) ou que la page est cachée ; elles reprennent où elles en étaient.
  // Rappelée après chaque mise à jour : un plan reconstruit hors de la vue (nouveau <svg>) reste en pause
  _pauseAnimations() {
    const z = this.shadowRoot?.querySelector(".zone");
    if (!z) return;
    const p = !!this._horsVue || document.visibilityState === "hidden";
    z.classList.toggle("hors-ecran", p);
    for (const sv of z.querySelectorAll(":scope>svg")) if (sv.pauseAnimations && sv.animationsPaused() !== p) { if (p) sv.pauseAnimations(); else sv.unpauseAnimations(); }
    // billes des flux (minuterie, classe-personnes-alertes.js) : arrêtées ou relancées avec le reste
    const avant = this._enPause;
    this._enPause = p;
    if (avant !== p || (!p && !this._tmBilles)) this._billes();
  }

  // effets (`effets`) : légers = ce qui coûte sans apporter beaucoup est allégé (lumière des fenêtres sans flou, nuages et brouillard
  // immobiles ; pluie et neige gardent leur animation CSS, moins chère que par pas) ; auto = légers sur un écran tactile
  // principal (pointer: coarse : téléphone, tablette), complets sinon. Indépendant du niveau d'animation (`niveau_animation`) et du
  // mouvement réduit du système, qui figent les boucles quels que soient les effets
  _effetsLegers() { const e = effetsDe(this._config); return e === "legers" || (e === "auto" && matchMedia("(pointer: coarse)").matches); }

  // fondu par paliers (aube, crépuscule : teinte de nuit, lumière du soleil, marqueur du soleil) : la valeur affichée va vers la cible
  // en PALIER_DUREE (40 s, comme l'ancienne transition CSS), par petits pas réguliers (au plus `pas`, au plus un toutes les PALIER_MIN ms),
  // invisibles à l'œil ; au lieu d'une transition continue redessinée à chaque image de l'écran pendant tout le lever et le coucher.
  // Opacité : l'attribut porte la cible, le style le palier en cours (retiré à la fin) ; left / top : le style. Première écriture sur un
  // élément (plan neuf) ou niveau d'animation réduit / aucun (transition CSS courte, ou aucune) : valeur posée directement
  _palier(el, k, v, pas, u = "") {
    if (!el) return;
    const P = (this._paliers ||= new WeakMap()), attr = k === "opacity";
    let m = P.get(el);
    const neuf = !m;
    if (neuf) P.set(el, (m = {}));
    const f = m[k], x = +v, lu = parseFloat(attr ? el.getAttribute(k) : el.style[k]);
    if (x === (f ? f.vers : lu)) return;
    if (f) { clearInterval(f.tm); m[k] = null; }
    const de = f ? f.v : lu, fin = () => { if (attr) el.style.removeProperty(k); else el.style[k] = `${v}${u}`; };
    if (attr) el.setAttribute(k, v);
    const n = Math.min(Math.ceil(Math.abs(x - de) / pas), Math.floor(PALIER_DUREE / PALIER_MIN));
    if (neuf || !Number.isFinite(de) || n < 2 || this._niveauAnim() !== "complet") return fin();
    const g = (m[k] = { vers: x, v: de, i: 0 }), ecrire = (y) => { el.style[k] = attr ? y.toFixed(3) : `${y.toFixed(2)}${u}`; };
    ecrire(de);
    g.tm = setInterval(() => {
      if (++g.i >= n || !el.isConnected || !this.isConnected) { clearInterval(g.tm); if (m[k] === g) m[k] = null; return fin(); }
      g.v = de + ((x - de) * g.i) / n;
      ecrire(g.v);
    }, PALIER_DUREE / n);
  }

  // store des fenêtres de toit reliées à un `cover` : hauteur du store dessiné selon current_position (ambiance ou non) ;
  // un contact (binary_sensor) ne change que l'état du meuble (contour actif), pas le store
  _majVelux() {
    const R = this.shadowRoot;
    (this._config?.meubles || []).forEach((m, i) => {
      // pergola reliée à un `cover` : lames vues de chant quand elles s'ouvrent (current_tilt_position, sinon current_position)
      if (m?.type === "pergola") {
        const s = typeof m.entite === "string" && m.entite.startsWith("cover.") ? this._etat(m.entite) : null, t = parseFloat(s?.attributes?.current_tilt_position);
        const k = !s ? 0 : Number.isFinite(t) ? borne(t / 100, 0, 1) : ouvertVelux(m.entite, s);
        R?.querySelectorAll(`.zone svg [data-mb="${i}"] .pg-lame`).forEach((l) => {
          const h = +(+l.dataset.e * (1 - 0.8 * k)).toFixed(1);
          if (l.getAttribute("height") !== String(h)) { l.setAttribute("height", h); l.setAttribute("y", +(+l.dataset.c - h / 2).toFixed(1)); }
        });
        return;
      }
      if (m?.type !== "fenetre_toit") return;
      const st = R?.querySelector(`.zone svg [data-mb="${i}"] .vx-store`);
      if (!st) return;
      const k = typeof m.entite === "string" && m.entite.startsWith("cover.") ? 1 - ouvertVelux(m.entite, this._etat(m.entite)) : 0, h = +(+st.dataset.h * k).toFixed(1);
      if (st.getAttribute("height") !== String(h)) st.setAttribute("height", h);
    });
  }

  // entité de phase de la lune : celle choisie, sinon celle de l'intégration Moon (sensor.moon_phase, ancien nom sensor.moon)
  _entiteLune(LU) { return LU.phase || ["sensor.moon_phase", "sensor.moon"].find((e) => this._etat(e)) || "sensor.moon_phase"; }

  // lumière (`ambiance.lumiere`), par baie (vantaux contigus réunis) et coupée par la pièce :
  // - lueur du ciel : par toutes les fenêtres non fermées, de jour (fondu au crépuscule), blanc froid, plus profonde pour une baie jusqu'au sol ;
  // - soleil direct (baies qui le voient, temps clair) : tache au sol à bords flous (pénombre plus large loin de la baie), et lueur chaude
  //   rediffusée autour de la tache, selon sa surface ; volet baissé = tache raccourcie, fermé = rien ;
  // - lune la nuit : la même chose, froide et discrète (selon la phase).
  // Redessinée seulement quand le soleil (1°), le temps, les volets, la phase ou le thème changent : couche statique, sans animation
  _majLumiere(I, nord) {
    const R = this.shadowRoot, c = this._config, A = c.ambiance, g = R?.querySelector(".zone svg .lum"), LU = coucheLumiere(A);
    if (!g || !LU) return;
    const so = this._etat(soleilDe(A)), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const me = coucheMeteo(A), w = me && this._etat(me.entite), { ciel: ciel0, direct } = LUM_CIEL(e, w?.state, w?.attributes?.cloud_coverage), ciel = LU.soleil ? ciel0 : 0;
    const jour = LU.soleil && !isNaN(az) && e > 0.5 && direct > 0.02, nuitL = LU.lune && !isNaN(e) ? borne((-e - 2) / 6, 0, 1) : 0;
    // lune : position calculée (latitude / longitude de HA, heure de la carte) ; sans coordonnées, lueur dans l'axe de chaque fenêtre (d'origine)
    const cf = this._hass?.config, PL = nuitL > 0 ? positionLune(this._maintenant(), nbOpt(cf?.latitude) ?? NaN, nbOpt(cf?.longitude) ?? NaN) : null;
    const sl = LU.lune ? this._etat(this._entiteLune(LU)) : null, phase = sl ? PHASES_LUNE[sl.state] ?? 0.6 : PL ? Math.max(0.05, PL.fraction) : 0.6, sombre = this._sombre();
    // part dégagée de chaque fenêtre (volet : position, fermé = 0 ; sans volet = 1)
    const ouv = (c.ouvertures || []).map((o) => {
      if (!vitrageDe(o) || o.masque) return null;
      const sv = o.volet ? this._etat(o.volet) : null;
      let pos = sv ? parseFloat(sv.attributes.current_position) : 100;
      if (isNaN(pos)) pos = sv.state === "closed" ? 0 : 100;
      return partLames(borne(pos / 100, 0, 1), sv && o.lames, parseFloat(sv?.attributes.current_tilt_position));
    });
    // part de lumière qui passe par chaque ouverture intérieure (porte ouverte, porte vitrée, verrière) : voir lumiereVoisins
    const trans = (c.ouvertures || []).map((o, i) => {
      if (!o || o.masque || !(o.type === "porte" || o.type === "fenetre")) return 0;
      const st = contactsDe(o).length ? this._etatOuverture(o)?.state : null;
      return passageLumiere(o, st == null || ETATS_MUETS.includes(st) ? null : st, LU.portes === "fermees", ouv[i] ?? 1);
    });
    // fenêtres de toit : [meuble, part dégagée par le store] (contact : sans effet sur la lumière)
    const vel = (c.meubles || []).map((m, i) => [m, m?.type === "fenetre_toit" ? ouvertVelux(m.entite, m.entite ? this._etat(m.entite) : null) : null, i]).filter((x) => x[1] != null);
    // effets légers : aucune copie floue (feGaussianBlur) : tache au bord net, faisceau du ciel en lueur douce (dégradé seul)
    const M = LU.mult, K = LU.kelvin, leger = this._effetsLegers(), D = leger ? 0 : LU.diffusion;
    const cle = [vel.map(([m, v]) => `${v.toFixed(2)}@${JSON.stringify([m.pos, m.taille, m.rotation, m.miroir, m.pente, m.hauteur])}`).join(";"), M.ciel, D, M.rediffusion, M.soleil, K.ciel, K.soleil, jour ? Math.round(az) : "", jour || ciel > 0 ? Math.round(e) : "", ciel.toFixed(2), direct, nuitL.toFixed(2), phase, I, nord, sombre, ouv.map((v) => (v == null ? "" : v.toFixed(2))).join(","),
      PL ? `${Math.round(PL.az)},${Math.round(PL.haut)}` : "", trans.map((v) => v.toFixed(2)).join(","), leger].join("|");
    if (cle === this._lumCle) return;
    this._lumCle = cle;
    const pieces = c.pieces.map((p, k) => [p, k]).filter(([p]) => !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    // pièce derrière la baie : un point à 15 cm du milieu, côté intérieur
    const salle = (o) => {
      const [a, b, d, f] = o.seg, [nx, ny] = o.dehors, q = [(a + d) / 2 - nx * 15, (b + f) / 2 - ny * 15];
      return pieces.find(([p]) => dansPoly(q, p.poly))?.[1] ?? -1;
    };
    // espace de chaque pièce (pièces ouvertes l'une sur l'autre, sans mur entre elles) : la lumière d'une baie s'y étend, coupée aux murs
    const esp = espacesOuverts(c.pieces, c.murs, c.ouvertures);
    // profondeur de l'espace vu de la baie (cm, le long de la normale vers l'intérieur)
    const profondeur = (o, k) => { const [a, b] = o.seg, [nx, ny] = o.dehors; return Math.max(60, ...esp[k].flatMap((j) => c.pieces[j].poly.map(([x, y]) => -((x - a) * nx + (y - b) * ny)))); };
    let defs = "", h = "", n = 0;
    const clips = new Set(), f0 = (v) => v.toFixed(1);
    const degrade = (id, col, stops) => `<radialGradient id="${id}">${stops.map(([o, a]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;
    // lueur douce : ellipse (centre, demi-axes le long de la baie et vers l'intérieur) remplie d'un dégradé radial, coupée par la pièce
    const lueur = (cls, k, [cx, cy], [vx, vy], rl, rp, col, op) => {
      if (op < 0.004) return;
      const id = `lum-l${n++}`, ang = (Math.atan2(vy, vx) * 180) / Math.PI;
      defs += degrade(id, col, [[0, 1], [0.45, 0.42], [1, 0]]);
      clips.add(k);
      h += `<g class="lum-b" clip-path="url(#lum-cp${k})"><ellipse class="${cls}" cx="${f0(cx)}" cy="${f0(cy)}" rx="${f0(rl)}" ry="${f0(rp)}" transform="rotate(${ang.toFixed(1)} ${f0(cx)} ${f0(cy)})" fill="url(#${id})" opacity="${op.toFixed(3)}"/></g>`;
    };
    // tache directe : dégradé le long de la tache, bords flous (pénombre : plus large quand la tache s'éloigne de la baie)
    const tache = (t, k, col, op, fin) => {
      const id = `lum-g${n++}`, sd = borne(2 + t.loin * 0.02, 2, 10), xs = t.poly.map((p) => p[0]), ys = t.poly.map((p) => p[1]), m = sd * 3;
      const x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m;
      defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${t.de[0]}" y1="${t.de[1]}" x2="${t.vers[0]}" y2="${t.vers[1]}"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity="${fin}"/></linearGradient>`
        + (leger ? "" : `<filter id="${id}f" filterUnits="userSpaceOnUse" x="${f0(x0)}" y="${f0(y0)}" width="${f0(Math.max(...xs) + m - x0)}" height="${f0(Math.max(...ys) + m - y0)}"><feGaussianBlur stdDeviation="${f0(sd)}"/></filter>`);
      clips.add(k);
      h += `<polygon class="lum-tache lum-b" points="${ptsSvg(t.poly)}" fill="url(#${id})"${leger ? "" : ` filter="url(#${id}f)"`} opacity="${op.toFixed(3)}" clip-path="url(#lum-cp${k})"/>`;
    };
    // lumière du ciel : faisceau qui entre par la baie (trapèze qui s'évase vers l'intérieur), plus lumineux contre la vitre, fondu en
    // profondeur, à bords doux ; dégradé linéaire de la baie (`de`) vers le fond du faisceau. Diffusion D (0 à 1) : faisceau plus évasé,
    // découpé en profondeur en 3 copies (poids en triangle qui se recouvrent, somme = le dégradé d'origine), de plus en plus floues :
    // presque net contre la vitre, flou large au fond, sans bord visible. D = 0 : une seule copie, le faisceau net d'origine
    const faisceau = (k, B, p, col, op) => {
      if (op < 0.004) return;
      const [a, b, d, ff] = B.seg, [nx, ny] = B.dehors, L = Math.hypot(d - a, ff - b), vx = (d - a) / L, vy = (ff - b) / L, w = p * (0.35 + 0.4 * D);
      // effets légers : lueur douce (dégradé radial, sans filtre) centrée sur la vitre, aussi large que la baie et le faisceau, aussi
      // profonde que lui ; la moitié dehors est coupée par la pièce
      if (leger) return lueur("lum-ciel", k, [(a + d) / 2, (b + ff) / 2], [vx, vy], L / 2 + w * 0.6, p, col, op * 0.9);
      const id = `lum-f${n++}`, m = [(a + d) / 2, (b + ff) / 2], sd = borne(4 + L * 0.03, 4, 14);
      const poly = [[a, b], [d, ff], [d - nx * p + vx * w, ff - ny * p + vy * w], [a - nx * p - vx * w, b - ny * p - vy * w]];
      const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), pts = ptsSvg(poly.map((q) => q.map((v) => +v.toFixed(1))));
      const grad = (j, stops) => `<linearGradient id="${id}${j}" gradientUnits="userSpaceOnUse" x1="${f0(m[0])}" y1="${f0(m[1])}" x2="${f0(m[0] - nx * p)}" y2="${f0(m[1] - ny * p)}">${stops.map(([o, v]) => `<stop offset="${o}" stop-color="${col}"${v < 1 ? ` stop-opacity="${+v.toFixed(3)}"` : ""}/>`).join("")}</linearGradient>`;
      const flou = (j, s) => `<filter id="${id}${j}b" filterUnits="userSpaceOnUse" x="${f0(Math.min(...xs) - s * 3)}" y="${f0(Math.min(...ys) - s * 3)}" width="${f0(Math.max(...xs) - Math.min(...xs) + s * 6)}" height="${f0(Math.max(...ys) - Math.min(...ys) + s * 6)}"><feGaussianBlur stdDeviation="${f0(s)}"/></filter>`;
      const copie = (j, cls) => `<polygon class="${cls}" points="${pts}" fill="url(#${id}${j})"${leger ? "" : ` filter="url(#${id}${j}b)"`} opacity="${op.toFixed(3)}"/>`;
      clips.add(k);
      if (D <= 0) {
        defs += grad("", [[0, 1], [0.3, 0.55], [1, 0]]) + (leger ? "" : flou("", sd));
        h += `<g class="lum-b" clip-path="url(#lum-cp${k})">${copie("", "lum-ciel")}</g>`;
        return;
      }
      // dégradé d'origine (1 → 0,55 à 30 % → 0) échantillonné aux nœuds U ; copie j = ce dégradé × triangle centré sur U[j]
      const U = [0, 0.25, 0.6, 1], P = (u) => (u <= 0.3 ? 1 - (0.45 * u) / 0.3 : (0.55 * (1 - u)) / 0.7);
      let g = "";
      for (let j = 0; j < 3; j++) {
        defs += grad(j, U.map((u, i) => [u, i === j ? P(u) : 0])) + flou(j, sd + D * U[j] * p * 0.45);
        g += copie(j, j ? "lum-ciel-d" : "lum-ciel");
      }
      h += `<g class="lum-b" clip-path="url(#lum-cp${k})">${g}</g>`;
    };
    // lumière de fond de chaque pièce éclairée (toute la pièce, voir lumiereFond) : sous les faisceaux et les taches
    const fonds = new Map();
    const f = ((az + nord) * Math.PI) / 180, sx = Math.sin(f), sy = -Math.cos(f), dore = borne(1 - (e - 4) / 22, 0, 1);
    // teintes : d'origine (auto), ou forcées par `ciel_kelvin` / `soleil_kelvin` (lueur rediffusée un peu plus chaude que la tache)
    const kRgb = (k) => `rgb(${kelvinRgb(k).join(",")})`, op1 = (v) => Math.min(1, v);
    // ciel : blanc légèrement chaud, fondu en écran (il éclaircit le sol, jamais un voile gris), un peu plus doré en thème clair pour rester visible
    const cCiel = K.ciel ? kRgb(K.ciel) : sombre ? "#fff2da" : "#ffe3a6", cLune = sombre ? "#9fb4ff" : "#7986cb";
    const cSoleil = K.soleil ? kRgb(K.soleil) : dore > 0.5 ? (sombre ? "#ffcc80" : "#ffb74d") : (sombre ? "#fff3b0" : "#ffd54f");
    const cRediff = K.soleil ? kRgb(Math.max(1800, K.soleil - 400)) : dore > 0.5 ? (sombre ? "#ffb870" : "#ffa726") : (sombre ? "#ffe9a8" : "#ffca28");
    // fenêtre ou porte vitrée entre deux pièces intérieures avec un côté `dehors` : fenêtre extérieure seulement, pas aussi une verrière
    // (voir ouvertureInterieure)
    const polys = pieces.map(([p, k]) => [p.poly, k]);
    const passe = trans.map((t, i) => (t > 0 && vitrageDe(c.ouvertures[i]) && c.ouvertures[i].dehors && ouvertureInterieure(polys, c.ouvertures[i]) ? 0 : t));
    for (const B of baiesFenetres(c.ouvertures, ouv)) {
      if (B.ouvert <= 0.02) continue;
      const k = salle(B);
      if (k < 0) continue;
      const [a, b, d, ff] = B.seg, [nx, ny] = B.dehors, mil = [(a + d) / 2, (b + ff) / 2], L = Math.hypot(d - a, ff - b), dir = [(d - a) / L, (ff - b) / L];
      const prof = profondeur(B, k), [bas, haut] = vitrageBornes(B, B.largeur), sol = bas < 40, kv = borne((haut - bas) / 125, 0.35, 1.3);
      // lumière du ciel : faisceau de la baie vers l'intérieur, plus profond pour une baie jusqu'au sol, plus court et plus faible pour
      // une petite vitre haute, plus fort côté soleil ; et sa part de la lumière de fond de la pièce
      if (ciel > 0 && M.ciel > 0) {
        const expo = isNaN(az) ? 0 : Math.max(0, nx * sx + ny * sy), p = Math.min(prof, (sol ? 330 : haut - bas < 80 ? 170 : 230) * (0.55 + 0.45 * B.ouvert));
        const k1 = M.ciel * I * ciel * (0.55 + 0.45 * expo) * (0.25 + 0.75 * B.ouvert);
        faisceau(k, B, p, cCiel, op1(k1 * Math.sqrt(kv) * (sombre ? 0.75 : 0.85)));
        fonds.set(k, [...(fonds.get(k) || []), [B.largeur * (haut - bas) * B.ouvert, k1]]);
      }
      const fl = PL ? ((PL.az + nord) * Math.PI) / 180 : 0;
      const astre = jour ? [sx, sy, e, 900] : nuitL > 0 ? (PL ? (PL.haut > 0.5 ? [Math.sin(fl), -Math.cos(fl), PL.haut, 260] : null) : [nx, ny, 40, 260]) : null;
      const t = astre && tacheLumiere(B, astre[0], astre[1], astre[2], 1, astre[3]);
      // la nuit, fenêtre qui ne voit pas la lune (ou lune couchée) : seulement la lueur froide du ciel nocturne
      if (!t && !jour && PL && nuitL > 0) faisceau(k, B, Math.min(prof, 150), cLune, op1(I * nuitL * (0.05 + 0.08 * phase) * (0.25 + 0.75 * B.ouvert)));
      if (!t) continue;
      // lueur rediffusée autour de la tache : rayon de l'ordre de la profondeur de la pièce, intensité selon la surface éclairée
      const s = Math.sqrt(borne(t.aire / 30000, 0, 1)), rl = borne(prof * 0.75, 140, 600), c0 = [t.centre[0] + nx * t.loin * 0.15, t.centre[1] + ny * t.loin * 0.15];
      if (jour) {
        const k0 = I * direct * borne(e / 6, 0.35, 1);
        if (M.soleil > 0) tache(t, k, cSoleil, op1(M.soleil * k0 * (0.3 + 0.4 * t.expo)), ".45");
        lueur("lum-rediff", k, c0, dir, rl, rl * 0.85, cRediff, op1(M.rediffusion * k0 * 0.32 * s));
      } else {
        const k0 = I * nuitL * (0.2 + 0.4 * phase);
        tache(t, k, cLune, k0, "0");
        lueur("lum-rediff", k, c0, dir, rl * 0.7, rl * 0.6, cLune, op1(M.rediffusion * k0 * 0.25 * s));
      }
    }
    // fenêtres de toit : lueur du ciel sous la fenêtre (et part de la lumière de fond), tache de soleil ou de lune projetée au sol,
    // coupée par la pièce qui contient la fenêtre ; store baissé = tache raccourcie, fermé = rien
    for (const [m, ov, i] of vel) {
      if (ov <= 0.02) continue;
      const emp = empriseVelux(m), mil = [(emp[0][0] + emp[2][0]) / 2, (emp[0][1] + emp[2][1]) / 2];
      const k = pieces.find(([p]) => dansPoly(mil, p.poly))?.[1] ?? -1;
      if (k < 0) continue;
      const L = Math.hypot(emp[1][0] - emp[0][0], emp[1][1] - emp[0][1]) || 1, P = Math.hypot(emp[3][0] - emp[0][0], emp[3][1] - emp[0][1]) || 1;
      const dir = [(emp[1][0] - emp[0][0]) / L, (emp[1][1] - emp[0][1]) / L], bas = [(emp[0][0] - emp[3][0]) / P, (emp[0][1] - emp[3][1]) / P];
      if (ciel > 0 && M.ciel > 0) {
        const k1 = M.ciel * I * ciel * 0.8 * (0.25 + 0.75 * ov);
        lueur("lum-ciel lum-velux", k, mil, dir, Math.max(80, L * 1.1), Math.max(90, P * 1.2), cCiel, op1(k1 * (sombre ? 0.55 : 0.65)));
        fonds.set(k, [...(fonds.get(k) || []), [L * P * 1.3 * ov, k1]]);
      }
      // lune sans coordonnées : face à la fenêtre (vers le bas de la pente), à 50°
      const fl = PL ? ((PL.az + nord) * Math.PI) / 180 : 0;
      const astre = jour ? [sx, sy, e, 900] : nuitL > 0 ? (PL ? (PL.haut > 0.5 ? [Math.sin(fl), -Math.cos(fl), PL.haut, 400] : null) : [bas[0], bas[1], 50, 400]) : null;
      const t = astre && tacheVelux(m, astre[0], astre[1], astre[2], ov, astre[3]);
      if (!t) continue;
      const s = Math.sqrt(borne(t.aire / 30000, 0, 1)), rl = borne(Math.sqrt(t.aire) * 1.4, 120, 450), h0 = h.length;
      if (jour) {
        const k0 = I * direct * borne(e / 6, 0.35, 1);
        if (M.soleil > 0) tache(t, k, cSoleil, op1(M.soleil * k0 * (0.3 + 0.4 * Math.min(1, t.expo))), ".55");
        lueur("lum-rediff", k, t.centre, dir, rl, rl * 0.85, cRediff, op1(M.rediffusion * k0 * 0.32 * s));
      } else {
        const k0 = I * nuitL * (0.2 + 0.4 * phase);
        tache(t, k, cLune, k0, "0");
        lueur("lum-rediff", k, t.centre, dir, rl * 0.7, rl * 0.6, cLune, op1(M.rediffusion * k0 * 0.25 * s));
      }
      h = h.slice(0, h0) + h.slice(h0).replace('<polygon class="lum-tache', `<polygon data-vx="${i}" class="lum-tache lum-vx`);
    }
    let fh = "";
    // lumière de fond par espace (pièces ouvertes l'une sur l'autre réunies) : surfaces vitrées de tout l'espace rapportées à son aire,
    // posée sur chacune de ses pièces
    const parEsp = new Map();
    for (const [k, l] of fonds) { const e = esp[k][0]; parEsp.set(e, [...(parEsp.get(e) || []), ...l]); }
    const F = new Map();
    for (const [e, l] of parEsp) {
      const v = lumiereFond(l.map((x) => x[0]), esp[e].reduce((t, j) => t + aireDe(c.pieces[j].poly), 0)) * Math.max(...l.map((x) => x[1])) * (sombre ? 0.2 : 0.28);
      for (const j of esp[e]) F.set(j, v);
    }
    for (const [k, v] of F) fh += this._fondPiece(k, v, cCiel);
    // lumière entre pièces (un seul saut) : fond plus faible dans toute la voisine, et lueur près de l'ouverture
    for (const V of lumiereVoisins(polys, c.ouvertures, passe, F)) {
      fh += this._fondPiece(V.vers, V.fond, cCiel, "lum-voisin");
      const [a, b, d, ff] = c.ouvertures[V.i].seg;
      lueur("lum-voisin-l", V.vers, [V.mil[0] + V.n[0] * V.L * 0.3, V.mil[1] + V.n[1] * V.L * 0.3], [(d - a) / V.L, (ff - b) / V.L], Math.max(70, V.L * 0.9), Math.max(60, V.L * 0.8), cCiel, op1(V.lueur * 1.2));
    }
    const cp = [...clips].map((k) => `<clipPath id="lum-cp${k}">${esp[k].map((j) => `<polygon points="${ptsSvg(c.pieces[j].poly)}"/>`).join("")}</clipPath>`).join("");
    poserHTML(g, h || fh ? `<defs>${cp}${defs}</defs>${fh}${h}` : "");
  }

  // lumière de fond d'une pièce (k = indice dans `pieces`) : toute la pièce légèrement éclaircie, en écran ; op = intensité (0 à 1), col = teinte.
  // Réutilisable pour une pièce voisine éclairée par une porte intérieure ouverte (intensité réduite, même teinte)
  _fondPiece(k, op, col, cls = "") {
    const p = this._config.pieces[k];
    return op >= 0.004 && Array.isArray(p?.poly) && p.poly.length > 2 ? `<polygon class="lum-fond lum-b${cls ? ` ${cls}` : ""}" data-p="${k}" points="${ptsSvg(p.poly)}" fill="${col}" opacity="${op.toFixed(3)}"/>` : "";
  }
}
