// thème sombre, jour / nuit, lune, lumière, fond des pièces — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // thème sombre : fond de la carte peu lumineux (sinon, carte transparente : réglage sombre de HA)
  _sombre() {
    const t = getComputedStyle(this.shadowRoot.querySelector("ha-card")).backgroundColor, c = t.match(/[\d.]+/g)?.map(Number), k = t.startsWith("color(") ? 1 : 255;
    if (!c || c.length < 3 || c[3] === 0) return !!this._hass?.themes?.darkMode;
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / k < 0.4;
  }

  // jour / nuit : teinte bleu nuit selon la hauteur du soleil (plus forte sur les extérieurs), lumière venant du côté du soleil
  // (azimut + `nord`), plus chaude au lever et au coucher ; repère du soleil au bord du plan ; météo redessinée quand elle change
  _majAmbiance() {
    const R = this.shadowRoot, A = this._config.ambiance, g = R?.querySelector(".zone svg .amb");
    if (!A || !g) return;
    const I = intensiteAmb(A), b = this._box, nord = +A.nord || 0, jn = coucheJour(A);
    const so = jn && this._etat(jn.soleil || "sun.sun"), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const Ij = I * borne(+(jn?.intensite ?? 1), 0, 2), nuit = isNaN(e) ? 0 : borne((2 - e) / 14, 0, 1), dore = isNaN(e) || e < -4 ? 0 : Math.max(0, 1 - Math.abs(e - 3) / 9);
    const op = (sel, v) => g.querySelector(sel)?.setAttribute("opacity", v.toFixed(3));
    // thème sombre : le bleu nuit sur un fond déjà sombre ne se voit presque pas en « discret » ; on le renforce (normal et fort inchangés)
    const In = I > 0 && I < INTENSITES.normal && this._sombre() ? Math.min(INTENSITES.normal * 1.5, I * 2.3) / I : 1;
    op(".amb-ni", Ij * In * nuit * 0.22); op(".amb-ne", Ij * In * nuit * 0.5);
    const cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, f = ((az + nord) * Math.PI) / 180, ux = Math.sin(f), uy = -Math.cos(f);
    const lg = g.querySelector("#amb-g"), astre = R.querySelector(".calque>.amb-astre"), jour = !isNaN(az) && e > 0;
    if (lg && jour) {
      const rr = Math.max(b.W, b.H) / 2;
      [["x1", cx + ux * rr], ["y1", cy + uy * rr], ["x2", cx - ux * rr * 0.3], ["y2", cy - uy * rr * 0.3]].forEach(([k, v]) => lg.setAttribute(k, v.toFixed(0)));
      const col = dore > 0.5 ? "#ffb74d" : "#fff59d";
      lg.querySelectorAll("stop").forEach((st) => st.setAttribute("stop-color", col));
    }
    op(".amb-sol", jour ? Ij * (0.18 + 0.32 * dore) : 0);
    if (astre) {
      astre.hidden = !jour;
      if (jour) {
        // au bord du plan, dans la direction du soleil (2,5 % de marge)
        const k = Math.min(Math.abs(ux) > 1e-6 ? 0.475 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.475 / Math.abs(uy) : Infinity);
        astre.style.left = `${(50 + ux * k * 100).toFixed(2)}%`; astre.style.top = `${(50 + uy * k * 100).toFixed(2)}%`;
        const hm = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" }) : "?"; };
        astre.title = _t("Soleil : hauteur {h}°, azimut {az}° · coucher {coucher}", { h: Math.round(e), az: Math.round(az), coucher: hm(so.attributes.next_setting) });
      }
    }
    const me = coucheMeteo(A), w = me && this._etat(me.entite), zm = g.querySelector(".amb-meteo");
    const cle = w && zm ? [w.state, w.attributes.cloud_coverage, Math.round(+w.attributes.wind_speed || 0), Math.round((+w.attributes.wind_bearing || 0) / 10)].join("|") : "";
    if (zm && cle !== this._meteoCle) { this._meteoCle = cle; poserHTML(zm, w ? dessinMeteo(w, b, nord, I * borne(+(me.intensite ?? 1), 0, 2), this._sansBoucles(), "amb", 1, me.sens ?? 135) : ""); }
    // nuages : quasi invisibles la nuit (sinon, clairs sur fond sombre, on les prendrait pour des halos de lumière)
    zm?.querySelectorAll(".m-nuages").forEach((n) => { n.style.opacity = (+n.dataset.op * (1 - 0.85 * nuit)).toFixed(3); });
    this._majLumiere(I, nord);
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
    const M = LU.mult, K = LU.kelvin, D = LU.diffusion;
    const cle = [M.ciel, D, M.rediffusion, M.soleil, K.ciel, K.soleil, jour ? Math.round(az) : "", jour || ciel > 0 ? Math.round(e) : "", ciel.toFixed(2), direct, nuitL.toFixed(2), phase, I, nord, sombre, ouv.map((v) => (v == null ? "" : v.toFixed(2))).join(","),
      PL ? `${Math.round(PL.az)},${Math.round(PL.haut)}` : "", trans.map((v) => v.toFixed(2)).join(",")].join("|");
    if (cle === this._lumCle) return;
    this._lumCle = cle;
    const pieces = c.pieces.map((p, k) => [p, k]).filter(([p]) => !p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    // pièce derrière la baie : un point à 15 cm du milieu, côté intérieur
    const salle = (o) => {
      const [a, b, d, f] = o.seg, [nx, ny] = o.dehors, q = [(a + d) / 2 - nx * 15, (b + f) / 2 - ny * 15];
      return pieces.find(([p]) => dansPoly(q, p.poly))?.[1] ?? -1;
    };
    // profondeur de la pièce vue de la baie (cm, le long de la normale vers l'intérieur)
    const profondeur = (o, k) => { const [a, b] = o.seg, [nx, ny] = o.dehors; return Math.max(60, ...c.pieces[k].poly.map(([x, y]) => -((x - a) * nx + (y - b) * ny))); };
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
        + `<filter id="${id}f" filterUnits="userSpaceOnUse" x="${f0(x0)}" y="${f0(y0)}" width="${f0(Math.max(...xs) + m - x0)}" height="${f0(Math.max(...ys) + m - y0)}"><feGaussianBlur stdDeviation="${f0(sd)}"/></filter>`;
      clips.add(k);
      h += `<polygon class="lum-tache lum-b" points="${ptsSvg(t.poly)}" fill="url(#${id})" filter="url(#${id}f)" opacity="${op.toFixed(3)}" clip-path="url(#lum-cp${k})"/>`;
    };
    // lumière du ciel : faisceau qui entre par la baie (trapèze qui s'évase vers l'intérieur), plus lumineux contre la vitre, fondu en
    // profondeur, à bords doux ; dégradé linéaire de la baie (`de`) vers le fond du faisceau. Diffusion D (0 à 1) : faisceau plus évasé,
    // découpé en profondeur en 3 copies (poids en triangle qui se recouvrent, somme = le dégradé d'origine), de plus en plus floues :
    // presque net contre la vitre, flou large au fond, sans bord visible. D = 0 : une seule copie, le faisceau net d'origine
    const faisceau = (k, B, p, col, op) => {
      if (op < 0.004) return;
      const [a, b, d, ff] = B.seg, [nx, ny] = B.dehors, L = Math.hypot(d - a, ff - b), vx = (d - a) / L, vy = (ff - b) / L, w = p * (0.35 + 0.4 * D);
      const id = `lum-f${n++}`, m = [(a + d) / 2, (b + ff) / 2], sd = borne(4 + L * 0.03, 4, 14);
      const poly = [[a, b], [d, ff], [d - nx * p + vx * w, ff - ny * p + vy * w], [a - nx * p - vx * w, b - ny * p - vy * w]];
      const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), pts = ptsSvg(poly.map((q) => q.map((v) => +v.toFixed(1))));
      const grad = (j, stops) => `<linearGradient id="${id}${j}" gradientUnits="userSpaceOnUse" x1="${f0(m[0])}" y1="${f0(m[1])}" x2="${f0(m[0] - nx * p)}" y2="${f0(m[1] - ny * p)}">${stops.map(([o, v]) => `<stop offset="${o}" stop-color="${col}"${v < 1 ? ` stop-opacity="${+v.toFixed(3)}"` : ""}/>`).join("")}</linearGradient>`;
      const flou = (j, s) => `<filter id="${id}${j}b" filterUnits="userSpaceOnUse" x="${f0(Math.min(...xs) - s * 3)}" y="${f0(Math.min(...ys) - s * 3)}" width="${f0(Math.max(...xs) - Math.min(...xs) + s * 6)}" height="${f0(Math.max(...ys) - Math.min(...ys) + s * 6)}"><feGaussianBlur stdDeviation="${f0(s)}"/></filter>`;
      const copie = (j, cls) => `<polygon class="${cls}" points="${pts}" fill="url(#${id}${j})" filter="url(#${id}${j}b)" opacity="${op.toFixed(3)}"/>`;
      clips.add(k);
      if (D <= 0) {
        defs += grad("", [[0, 1], [0.3, 0.55], [1, 0]]) + flou("", sd);
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
    let fh = "";
    const F = new Map([...fonds].map(([k, l]) => [k, lumiereFond(l.map((x) => x[0]), aireDe(c.pieces[k].poly)) * Math.max(...l.map((x) => x[1])) * (sombre ? 0.2 : 0.28)]));
    for (const [k, v] of F) fh += this._fondPiece(k, v, cCiel);
    // lumière entre pièces (un seul saut) : fond plus faible dans toute la voisine, et lueur près de l'ouverture
    for (const V of lumiereVoisins(pieces.map(([p, k]) => [p.poly, k]), c.ouvertures, trans, F)) {
      fh += this._fondPiece(V.vers, V.fond, cCiel, "lum-voisin");
      const [a, b, d, ff] = c.ouvertures[V.i].seg;
      lueur("lum-voisin-l", V.vers, [V.mil[0] + V.n[0] * V.L * 0.3, V.mil[1] + V.n[1] * V.L * 0.3], [(d - a) / V.L, (ff - b) / V.L], Math.max(70, V.L * 0.9), Math.max(60, V.L * 0.8), cCiel, op1(V.lueur * 1.2));
    }
    const cp = [...clips].map((k) => `<clipPath id="lum-cp${k}"><polygon points="${ptsSvg(c.pieces[k].poly)}"/></clipPath>`).join("");
    poserHTML(g, h || fh ? `<defs>${cp}${defs}</defs>${fh}${h}` : "");
  }

  // lumière de fond d'une pièce (k = indice dans `pieces`) : toute la pièce légèrement éclaircie, en écran ; op = intensité (0 à 1), col = teinte.
  // Réutilisable pour une pièce voisine éclairée par une porte intérieure ouverte (intensité réduite, même teinte)
  _fondPiece(k, op, col, cls = "") {
    const p = this._config.pieces[k];
    return op >= 0.004 && Array.isArray(p?.poly) && p.poly.length > 2 ? `<polygon class="lum-fond lum-b${cls ? ` ${cls}` : ""}" data-p="${k}" points="${ptsSvg(p.poly)}" fill="${col}" opacity="${op.toFixed(3)}"/>` : "";
  }
}
