/* Maquette : « Nettoyer le plan », moteur pur (aucune dépendance au DOM), partagé par l'éditeur et les tests.
 *   analyser(config, options?)  → { defauts, corrections: { option: [opérations] }, propre }
 *   appliquer(config, options?) → nouvelle config (l'entrée n'est jamais modifiée) ; nettoyer(…) rend aussi les opérations
 *   isoler(config, nom)         → la pièce seule : murs d'après le contour, ouvertures recalées, passages, cloisons
 *   instantane / restaurer      → copie des clés touchées (CLES) avant nettoyage, et retour à cette copie
 *   rapprocherNom / cleNom      → noms de pièce rapprochés malgré accents, suffixes (« Chambre · 12,6 m² ») et sigles (« SDB »)
 * Le contour des pièces fait foi : murs et ouvertures sont recalés dessus, jamais l'inverse (seules les options « sommets » et
 * « arrondir » touchent aux pièces). Unités : cm, y vers le bas. Murs [x1, y1, x2, y2, groupe?], ouvertures {seg: [x1, y1, x2, y2]},
 * pièces {poly: [[x, y], …]}. Chaque façon de dessiner (pans séparés, murs d'un seul tenant, coupés à chaque sommet, doublons,
 * murs épais en 2 traits, tracé approximatif, aucun mur) doit donner le même résultat, quelle que soit l'orientation du plan.
 * Fichier sans import ni export : placé tel quel dans dist/ (globalThis.MaquetteNettoyage), importable en Node pour les tests. */
const MaquetteNettoyage = (() => {
  const EPS = 0.5; // sur la ligne (cm)
  const AIMANT = 12; // trous et décalages recalés jusqu'à 12 cm
  const TROU = 15; // au-delà : mur absent ou passage, pas un trou
  const BOUT = 35; // bout de mur dans une pièce : retiré sous 35 cm, cloison au-delà
  const EPAIS = 25; // mur épais dessiné en 2 traits parallèles : jusqu'à 25 cm d'écart
  const SOMMET = 6; // sommets de pièces voisines presque confondus
  const GRILLE = 5; // arrondi des plans relevés sur une image
  const VOISIN = 6; // distance de part et d'autre d'une arête pour trouver la pièce voisine
  const CLES = ["rooms", "walls", "openings"]; // tout ce que le nettoyage peut toucher
  // options (cases du dialogue) et valeurs par défaut ; les étapes s'appliquent dans l'ordre de ETAPES (une option peut en avoir deux)
  const ORDRE = ["aimanter", "couper", "bouts", "fusionner", "manquants", "passages", "sommets", "arrondir"];
  const OPTIONS_DEFAUT = Object.freeze({ aimanter: true, couper: true, bouts: true, fusionner: true, manquants: false, passages: false, sommets: false, arrondir: false });
  // gravité : « defaut » (à corriger), « style » (façon de dessiner, corrigée sans être comptée comme défaut), « info » (passage ouvert)
  const NIVEAU = { trou: "defaut", decale: "defaut", depasse: "defaut", bout: "defaut", doublon: "defaut", absent: "defaut", sommet: "defaut",
    sous: "style", aligne: "style", arrondi: "style", passage: "info" };

  // ---------- géométrie ----------
  const copie = (o) => (o === undefined ? o : typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
  // arrondi symétrique (le même en miroir) ; jamais de -0
  const sym = (v, pas) => (Math.sign(v) * Math.round(Math.abs(v) / pas) * pas) || 0;
  const net = (v) => (Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) || 0 : sym(v, 0.1));
  const netP = (p) => [net(p[0]), net(p[1])];
  const dist2 = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const milieu = (p, q) => netP([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
  function repere(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], lg = Math.hypot(dx, dy);
    return { a, b, lg, ux: lg ? dx / lg : 1, uy: lg ? dy / lg : 0 };
  }
  const ecart = (R, p) => (p[0] - R.a[0]) * R.uy - (p[1] - R.a[1]) * R.ux; // distance signée à la droite
  const abscisse = (R, p) => (p[0] - R.a[0]) * R.ux + (p[1] - R.a[1]) * R.uy;
  const au = (R, t) => [R.a[0] + R.ux * t, R.a[1] + R.uy * t];
  const surDroite = (R, p) => au(R, abscisse(R, p));
  const aire = (poly) => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  function dedans(p, poly) {
    let ok = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[j];
      if ((y1 > p[1]) !== (y2 > p[1]) && p[0] < ((x2 - x1) * (p[1] - y1)) / (y2 - y1) + x1) ok = !ok;
    }
    return ok;
  }
  // segment [p, q] projeté sur la droite R : null s'il n'est pas parallèle ou s'en écarte de plus de tol
  function proj(R, p, q, tol) {
    const d1 = ecart(R, p), d2 = ecart(R, q), lg = dist2(p, q);
    if (lg < 0.1 || Math.abs(d1) > tol || Math.abs(d2) > tol || Math.abs(d1 - d2) > Math.max(4, 0.1 * lg)) return null;
    let t1 = abscisse(R, p), t2 = abscisse(R, q);
    if (Math.abs(t2 - t1) < 0.5 * lg) return null;
    const inv = t1 > t2;
    if (inv) [t1, t2] = [t2, t1];
    return { t1, t2, d: Math.max(Math.abs(d1), Math.abs(d2)), dm: (d1 + d2) / 2, pente: Math.abs(d1 - d2), inv };
  }
  function union(iv) {
    const out = [];
    for (const [a, b] of [...iv].sort((x, y) => x[0] - y[0])) {
      if (out.length && a <= out[out.length - 1][1] + EPS) out[out.length - 1][1] = Math.max(out[out.length - 1][1], b);
      else out.push([a, b]);
    }
    return out;
  }
  // parties de [0, lg] non couvertes
  function trousDe(couv, lg) {
    const out = [];
    let pos = 0;
    for (const [a, b] of union(couv)) { if (a - pos > EPS) out.push([pos, a]); pos = Math.max(pos, b); }
    if (lg - pos > EPS) out.push([pos, lg]);
    return out;
  }
  // [a, b] moins des intervalles ; morceaux de moins de EPS abandonnés
  function moins(a, b, iv) {
    const out = [];
    let pos = a;
    for (const [x, y] of union(iv)) {
      if (y <= pos || x >= b) continue;
      if (x - pos >= EPS) out.push([pos, x]);
      pos = Math.max(pos, y);
    }
    if (b - pos >= EPS) out.push([pos, b]);
    return out;
  }
  const murValide = (w) => Array.isArray(w) && w.length >= 4 && w.slice(0, 4).every((v) => typeof v === "number" && Number.isFinite(v));
  const segValide = (o) => o && Array.isArray(o.seg) && o.seg.length >= 4 && o.seg.slice(0, 4).every((v) => typeof v === "number" && Number.isFinite(v));
  const extremites = (s) => [[s[0], s[1]], [s[2], s[3]]];

  // ---------- pièces ----------
  function surContour(p, P, tol) {
    return P.aretes.some((E) => { const t = abscisse(E.R, p); return t >= -tol && t <= E.R.lg + tol && Math.abs(ecart(E.R, p)) <= tol; });
  }
  function contexte(cfg) {
    const pieces = [];
    (Array.isArray(cfg.rooms) ? cfg.rooms : []).forEach((r, i) => {
      if (!r || r.sub_area || !Array.isArray(r.poly) || r.poly.length < 3) return;
      const poly = r.poly.map((p) => [Number(p?.[0]), Number(p?.[1])]);
      if (poly.some((p) => !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) return;
      const P = { i, nom: r.name ?? null, poly, dehors: !!r.outside, aretes: [], aire: aire(poly) };
      for (let k = 0; k < poly.length; k++) {
        const a = poly[(k + poly.length - 1) % poly.length], b = poly[k], R = repere(a, b);
        if (R.lg >= 1) P.aretes.push({ R, piece: P });
      }
      pieces.push(P);
    });
    // zone dessinée dans une pièce intérieure sans sub_area (« CUISINE » dans le séjour) : traitée comme une sous-zone
    for (const P of pieces) P.zone = pieces.some((Q) => Q !== P && !Q.dehors && Q.aire > P.aire && P.poly.every((p) => dedans(p, Q.poly) || surContour(p, Q, 1.5)));
    const utiles = pieces.filter((P) => !P.zone);
    return { pieces: utiles, interieures: utiles.filter((P) => !P.dehors), aretes: utiles.flatMap((P) => P.aretes) };
  }
  // pièce intérieure concernée par un point : la plus proche par son contour (≤ AIMANT), sinon celle qui le contient
  function pieceDe(ctx, p) {
    let best = null, bd = AIMANT + 1e-9;
    for (const P of ctx.interieures) for (const E of P.aretes) {
      const t = abscisse(E.R, p), d = Math.abs(ecart(E.R, p));
      if (t >= -EPS && t <= E.R.lg + EPS && d <= bd) { bd = d; best = P; }
    }
    return (best || ctx.interieures.find((P) => dedans(p, P.poly)))?.nom ?? null;
  }
  // murs portés par l'arête E (parallèles, à moins de tol, qui la recouvrent) : [{j, t1, t2}] en abscisse de l'arête
  function sur(E, segs, tol) {
    const out = [];
    segs.forEach((s, j) => {
      if (!s) return;
      const [p, q] = extremites(s), pr = proj(E.R, p, q, tol);
      if (pr && pr.t2 > EPS && pr.t1 < E.R.lg - EPS) out.push({ j, ...pr });
    });
    return out;
  }
  const ouvSegs = (cfg) => (Array.isArray(cfg.openings) ? cfg.openings : []).map((o) => (segValide(o) && !o.shutter_only ? o.seg : null));
  const murSegs = (cfg) => (Array.isArray(cfg.walls) ? cfg.walls : []).map((w) => (murValide(w) ? w : null));
  const aDesMurs = (cfg) => murSegs(cfg).some(Boolean);
  // une pièce « avec murs » a au moins un mur sur son contour (un carport, une zone sans murs ne sont pas complétés)
  const pieceAvecMurs = (P, murs) => P.aretes.some((E) => sur(E, murs, AIMANT).length > 0);
  // autre pièce intérieure de part et d'autre du point (côté normal de l'arête)
  function voisineDe(ctx, P, R, t) {
    const m = au(R, t), nx = -R.uy, ny = R.ux;
    return ctx.interieures.find((Q) => Q !== P && (dedans([m[0] + nx * VOISIN, m[1] + ny * VOISIN], Q.poly) || dedans([m[0] - nx * VOISIN, m[1] - ny * VOISIN], Q.poly))) || null;
  }

  // ---------- étapes ----------
  // chaque étape modifie cfg (une copie de travail) et rend ses opérations {type, piece, point, segment?, detail}
  function etapeArrondir(cfg) {
    const ops = [], g = (v) => sym(v, GRILLE);
    (cfg.rooms || []).forEach((r) => {
      if (!r || !Array.isArray(r.poly)) return;
      const poly = r.poly.map((p) => (Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) ? [g(p[0]), g(p[1]), ...p.slice(2)] : p));
      const sans = poly.filter((p, k) => { const q = poly[(k + poly.length - 1) % poly.length]; return poly.length < 2 || !Array.isArray(p) || !Array.isArray(q) || p[0] !== q[0] || p[1] !== q[1]; });
      if (JSON.stringify(sans) !== JSON.stringify(r.poly)) { ops.push({ type: "arrondi", piece: r.name ?? null, point: netP(r.poly[0]), detail: { quoi: "piece" } }); r.poly = sans; }
    });
    if (Array.isArray(cfg.walls)) {
      cfg.walls = cfg.walls.flatMap((w) => {
        if (!murValide(w)) return [w];
        const n = [g(w[0]), g(w[1]), g(w[2]), g(w[3]), ...w.slice(4)];
        if (n.slice(0, 4).every((v, k) => v === w[k])) return [w];
        ops.push({ type: "arrondi", piece: null, point: milieu([w[0], w[1]], [w[2], w[3]]), segment: w.slice(0, 4), detail: { quoi: "mur" } });
        return n[0] === n[2] && n[1] === n[3] ? [] : [n];
      });
    }
    (cfg.openings || []).forEach((o) => {
      if (!segValide(o)) return;
      const n = o.seg.slice(0, 4).map(g);
      if (n.every((v, k) => v === o.seg[k]) || (n[0] === n[2] && n[1] === n[3])) return;
      ops.push({ type: "arrondi", piece: null, point: milieu([o.seg[0], o.seg[1]], [o.seg[2], o.seg[3]]), segment: o.seg.slice(0, 4), detail: { quoi: "ouverture", ouverture: o.name || o.type || null } });
      o.seg = [...n, ...o.seg.slice(4)];
    });
    return ops;
  }

  function etapeSommets(cfg) {
    const ops = [], ctx = contexte(cfg), sommets = [];
    for (const P of ctx.pieces) P.poly.forEach((p, k) => sommets.push({ P, k, p }));
    // regroupement des sommets de pièces différentes à moins de SOMMET cm
    const chef = sommets.map((_, i) => i), trouve = (i) => (chef[i] === i ? i : (chef[i] = trouve(chef[i])));
    for (let i = 0; i < sommets.length; i++) for (let j = i + 1; j < sommets.length; j++)
      if (sommets[i].P !== sommets[j].P && dist2(sommets[i].p, sommets[j].p) <= SOMMET) chef[trouve(j)] = trouve(i);
    const groupes = new Map();
    sommets.forEach((s, i) => { const c = trouve(i); if (!groupes.has(c)) groupes.set(c, []); groupes.get(c).push(s); });
    const bouts = murSegs(cfg).filter(Boolean).flatMap(extremites);
    const touchees = new Set();
    for (const G of groupes.values()) {
      if (new Set(G.map((s) => s.P)).size < 2 || !G.some((s) => G.some((u) => dist2(s.p, u.p) > EPS))) continue;
      // cible : la position la plus partagée (sommets et bouts de murs), à égalité la première dans l'ordre du plan
      let cible = null, score = -1;
      for (const s of G) {
        const n = G.filter((u) => dist2(u.p, s.p) <= EPS).length + bouts.filter((b) => dist2(b, s.p) <= EPS).length;
        if (n > score) { score = n; cible = s.p; }
      }
      const bouges = G.filter((s) => dist2(s.p, cible) > EPS && dist2(s.p, cible) <= SOMMET);
      if (!bouges.length) continue;
      const room = (s) => cfg.rooms[s.P.i];
      for (const s of bouges) { const v = room(s).poly[s.k]; room(s).poly[s.k] = [cible[0], cible[1], ...(Array.isArray(v) ? v.slice(2) : [])]; touchees.add(s.P.i); }
      ops.push({ type: "sommet", piece: bouges[0].P.nom, pieces: [...new Set(G.map((s) => s.P.nom))], point: netP(cible),
        detail: { ecart: Math.round(Math.max(...bouges.map((s) => dist2(s.p, cible)))) } });
    }
    for (const i of touchees) {
      const poly = cfg.rooms[i].poly;
      cfg.rooms[i].poly = poly.filter((p, k) => { const q = poly[(k + poly.length - 1) % poly.length]; return p[0] !== q[0] || p[1] !== q[1]; });
    }
    return ops;
  }

  // arête de rattachement d'un segment : la plus proche ; null si aucune, ou si le segment est entre deux pièces écartées (axe d'un mur épais)
  function rattacher(ctx, p, q) {
    const c = [];
    for (const E of ctx.aretes) {
      const pr = proj(E.R, p, q, AIMANT);
      if (pr && pr.t2 > EPS && pr.t1 < E.R.lg - EPS) c.push({ E, ...pr, rec: Math.min(pr.t2, E.R.lg) - Math.max(pr.t1, 0) });
    }
    if (!c.length) return null;
    const pose = c.find((x) => x.d <= EPS);
    if (pose) return { E: pose.E, d: pose.d };
    // la plus proche, en préférant la plus parallèle au segment (sommets de pièces voisines un peu différents)
    c.sort((x, y) => x.d + 2 * x.pente - (y.d + 2 * y.pente) || y.rec - x.rec);
    const b = c[0];
    // côté de chaque droite candidate vu depuis le segment (repère du segment, indépendant du sens des arêtes)
    const S = repere(p, q), m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const cote = (x) => ecart(S, surDroite(x.E.R, m));
    if (c.some((x) => Math.sign(cote(x)) !== Math.sign(cote(b)) && Math.abs(cote(x)) > EPS && Math.abs(cote(x) - cote(b)) > SOMMET)) return null;
    return { E: b.E, d: b.d };
  }

  function etapeAimanter(cfg) {
    const ops = [], ctx = contexte(cfg);
    if (!ctx.aretes.length) return ops;
    // 1. murs et ouvertures décalés : posés sur l'arête la plus proche
    const recaler = (s, quoi, nom) => {
      const [p, q] = extremites(s), r = rattacher(ctx, p, q);
      if (!r || r.d <= EPS) return null;
      const p2 = netP(surDroite(r.E.R, p)), q2 = netP(surDroite(r.E.R, q));
      ops.push({ type: "decale", piece: pieceDe(ctx, milieu(p2, q2)), point: milieu(p2, q2), segment: s.slice(0, 4), detail: { ecart: Math.round(r.d), quoi, ouverture: nom ?? null } });
      return [...p2, ...q2];
    };
    if (Array.isArray(cfg.walls)) cfg.walls = cfg.walls.map((w) => { if (!murValide(w)) return w; const n = recaler(w, "mur"); return n ? [...n, ...w.slice(4)] : w; });
    (cfg.openings || []).forEach((o) => { if (!segValide(o)) return; const n = recaler(o.seg, "ouverture", o.name || o.type); if (n) o.seg = [...n, ...o.seg.slice(4)]; });
    // 2. bouts qui dépassent (≤ AIMANT) au-delà du dernier angle des pièces intérieures alignées : ramenés à l'angle
    const aretesInt = ctx.interieures.flatMap((P) => P.aretes);
    if (Array.isArray(cfg.walls)) cfg.walls = cfg.walls.map((w) => {
      if (!murValide(w)) return w;
      const [p, q] = extremites(w), S = repere(p, q), sp = [];
      if (S.lg < EPS) return w;
      for (const E of aretesInt) if (Math.abs(ecart(S, E.R.a)) <= EPS && Math.abs(ecart(S, E.R.b)) <= EPS) sp.push([abscisse(S, E.R.a), abscisse(S, E.R.b)].sort((x, y) => x - y));
      if (!sp.length) return w;
      const lo = Math.min(...sp.map((x) => x[0])), hi = Math.max(...sp.map((x) => x[1]));
      if (hi <= EPS || lo >= S.lg - EPS) return w;
      let a = 0, b = S.lg;
      if (S.lg - hi > EPS && S.lg - hi <= AIMANT) b = hi;
      if (lo > EPS && lo <= AIMANT) a = lo;
      if (a === 0 && b === S.lg) return w;
      const p2 = netP(au(S, a)), q2 = netP(au(S, b));
      ops.push({ type: "depasse", piece: pieceDe(ctx, milieu(p2, q2)), point: netP(b !== S.lg ? q : p), segment: w.slice(0, 4), detail: { longueur: Math.round(S.lg - (b - a)) } });
      return [...p2, ...q2, ...w.slice(4)];
    });
    // 3. trous (< TROU) le long du contour des pièces intérieures qui ont des murs : comblés en prolongeant le mur voisin
    if (aDesMurs(cfg)) for (const P of ctx.interieures) {
      if (!pieceAvecMurs(P, murSegs(cfg))) continue;
      for (const E of P.aretes) {
        const murs = sur(E, murSegs(cfg), AIMANT), ouvs = sur(E, ouvSegs(cfg), AIMANT);
        const couv = [...murs, ...ouvs].map((x) => [Math.max(0, x.t1), Math.min(E.R.lg, x.t2)]);
        for (const [g0, g1] of trousDe(couv, E.R.lg)) {
          if (g1 - g0 >= TROU) continue;
          combler(cfg, E, g0, g1, murs);
          ops.push({ type: "trou", piece: P.nom, point: netP(au(E.R, (g0 + g1) / 2)), segment: [...netP(au(E.R, g0)), ...netP(au(E.R, g1))], detail: { longueur: Math.round(g1 - g0) } });
        }
      }
    }
    return ops;
  }
  // couvre [g0, g1] de l'arête E : prolonge un mur qui y touche, sinon ajoute un mur
  function combler(cfg, E, g0, g1, murs) {
    const prolonger = (x, t, vers) => {
      const w = cfg.walls[x.j], [p, q] = extremites(w), S = repere(p, q), cible = au(E.R, vers);
      // l'extrémité du mur qui est à l'abscisse t de l'arête
      const finQ = Math.abs(abscisse(E.R, q) - t) <= EPS;
      const n = netP(surDroite(S, cible));
      cfg.walls[x.j] = finQ ? [w[0], w[1], ...n, ...w.slice(4)] : [...n, w[2], w[3], ...w.slice(4)];
    };
    const avant = murs.find((x) => Math.abs(x.t2 - g0) <= EPS), apres = murs.find((x) => Math.abs(x.t1 - g1) <= EPS);
    if (avant) prolonger(avant, g0, g1);
    else if (apres) prolonger(apres, g1, g0);
    else { if (!Array.isArray(cfg.walls)) cfg.walls = []; cfg.walls.push([...netP(au(E.R, g0)), ...netP(au(E.R, g1))]); }
  }

  // parties d'un segment strictement dans une pièce (hors contour) : [[t1, t2]] en abscisse du segment
  function dansPiece(S, p, q, P) {
    const coupes = [0, S.lg];
    const paral = P.aretes.map((E) => !!proj(E.R, p, q, AIMANT));
    P.aretes.forEach((E, k) => {
      if (paral[k]) { for (const v of [E.R.a, E.R.b]) coupes.push(abscisse(S, v)); return; }
      // intersection de deux segments
      const den = S.ux * E.R.uy - S.uy * E.R.ux;
      if (Math.abs(den) < 1e-9) return;
      const dx = E.R.a[0] - p[0], dy = E.R.a[1] - p[1];
      const t = (dx * E.R.uy - dy * E.R.ux) / den, u = (dx * S.uy - dy * S.ux) / den;
      if (u >= -1e-6 && u <= E.R.lg + 1e-6) coupes.push(t);
    });
    const ts = [...new Set(coupes.map((t) => Math.min(S.lg, Math.max(0, t))))].sort((a, b) => a - b);
    const out = [];
    for (let k = 1; k < ts.length; k++) {
      const a = ts[k - 1], b = ts[k];
      if (b - a < 1e-6) continue;
      const m = au(S, (a + b) / 2);
      if (!dedans(m, P.poly)) continue;
      const bord = P.aretes.some((E, i) => {
        const tol = paral[i] ? AIMANT : 1.5, t = abscisse(E.R, m);
        return t >= -(paral[i] ? EPS : tol) && t <= E.R.lg + (paral[i] ? EPS : tol) && Math.abs(ecart(E.R, m)) <= tol;
      });
      if (!bord) out.push([a, b]);
    }
    return union(out);
  }

  function etapeBouts(cfg) {
    const ops = [], ctx = contexte(cfg);
    if (!Array.isArray(cfg.walls)) return ops;
    cfg.walls = cfg.walls.flatMap((w) => {
      if (!murValide(w)) return [w];
      const [p, q] = extremites(w), S = repere(p, q);
      if (S.lg < EPS) return [w];
      const retirer = [];
      for (const P of ctx.interieures) {
        const iv = dansPiece(S, p, q, P), lg = iv.reduce((s, [a, b]) => s + b - a, 0);
        if (lg > EPS && lg < BOUT) {
          retirer.push(...iv);
          const [a, b] = iv[Math.floor(iv.length / 2)];
          ops.push({ type: "bout", piece: P.nom, point: netP(au(S, (a + b) / 2)), segment: w.slice(0, 4), detail: { longueur: Math.round(lg) } });
        }
      }
      if (!retirer.length) return [w];
      return moins(0, S.lg, retirer).map(([a, b]) => [...netP(au(S, a)), ...netP(au(S, b)), ...w.slice(4)]);
    });
    return ops;
  }

  // murs absents (côté extérieur) et passages (vers une pièce intérieure) : grandes parties du contour sans mur ni ouverture
  // choix : true (toutes les pièces), false, ou liste de noms de pièces ; le constat est rendu même sans correction.
  // Pièce intérieure sans aucun mur (plan sans murs) : tout son contour est « absent » (simple info), pour générer ses murs
  // si l'option est cochée. Une pièce extérieure (outside: true) ne reçoit jamais de mur.
  function etapeManquants(cfg, quoi, choix) {
    const ops = [], ctx = contexte(cfg);
    const veut = (...noms) => choix === true || (Array.isArray(choix) && noms.some((n) => n != null && choix.includes(n)));
    const vides = new Set(ctx.interieures.filter((P) => !pieceAvecMurs(P, murSegs(cfg))).map((P) => P.i));
    for (const P of ctx.interieures) {
      const vide = vides.has(P.i);
      for (const E of P.aretes) {
        const murs = sur(E, murSegs(cfg), AIMANT), ouvs = sur(E, ouvSegs(cfg), AIMANT);
        const couv = [...murs, ...ouvs].map((x) => [Math.max(0, x.t1), Math.min(E.R.lg, x.t2)]);
        for (const [g0, g1] of trousDe(couv, E.R.lg)) {
          // découpé aux sommets des autres pièces : une partie peut donner dehors, l'autre sur une pièce voisine
          const ts = [g0, g1];
          for (const Q of ctx.interieures) if (Q !== P) for (const v of Q.poly) {
            const t = abscisse(E.R, v);
            if (t > g0 + EPS && t < g1 - EPS && Math.abs(ecart(E.R, v)) <= AIMANT) ts.push(t);
          }
          ts.sort((a, b) => a - b);
          const morceaux = [];
          for (let k = 1; k < ts.length; k++) {
            const V = voisineDe(ctx, P, E.R, (ts[k - 1] + ts[k]) / 2), dernier = morceaux[morceaux.length - 1];
            if (dernier && dernier.V === V) dernier.b = ts[k]; else morceaux.push({ a: ts[k - 1], b: ts[k], V });
          }
          for (const { a, b, V } of morceaux) {
            const passage = !!V && !vide, type = passage ? "passage" : "absent";
            if (b - a < EPS || (quoi === "manquants") === passage) continue;
            // une arête commune est vue des deux pièces : comptée une fois
            const m = au(E.R, (a + b) / 2);
            if (V && ops.some((o) => o.type === type && dist2(o.point, m) <= AIMANT && Math.abs(o.detail.longueur - (b - a)) <= AIMANT)) continue;
            const pieces = V ? [P.nom, V.nom] : [P.nom], applique = veut(...pieces);
            if (applique) combler(cfg, E, a, b, sur(E, murSegs(cfg), AIMANT));
            ops.push({ type, piece: P.nom, pieces, point: netP(m), segment: [...netP(au(E.R, a)), ...netP(au(E.R, b))],
              detail: { longueur: Math.round(b - a), ...(vide ? { sansMurs: true } : {}) }, ...(vide ? { niveau: "info" } : {}), applique });
          }
        }
      }
    }
    return ops;
  }

  function etapeCouper(cfg) {
    const ops = [], ctx = contexte(cfg);
    if (!Array.isArray(cfg.walls)) return ops;
    const ouvs = (cfg.openings || []).filter((o) => segValide(o) && !o.shutter_only);
    cfg.walls = cfg.walls.flatMap((w) => {
      if (!murValide(w)) return [w];
      const [p, q] = extremites(w), S = repere(p, q), retirer = [];
      for (const o of ouvs) {
        const [a, b] = extremites(o.seg), O = repere(a, b), pr = proj(O, p, q, AIMANT);
        if (!pr) continue;
        const r = Math.min(pr.t2, O.lg) - Math.max(pr.t1, 0);
        if (r <= EPS) continue;
        const iv = [abscisse(S, a), abscisse(S, b)].sort((x, y) => x - y);
        retirer.push(iv);
        const m = au(O, (Math.max(pr.t1, 0) + Math.min(pr.t2, O.lg)) / 2);
        ops.push({ type: "sous", piece: pieceDe(ctx, m), point: netP(m), segment: w.slice(0, 4), detail: { longueur: Math.round(r), ouverture: o.name || o.type || null } });
      }
      if (!retirer.length) return [w];
      return moins(0, S.lg, retirer).map(([a, b]) => [...netP(au(S, a)), ...netP(au(S, b)), ...w.slice(4)]);
    });
    return ops;
  }

  // mur épais en 2 traits parallèles (≤ EPAIS cm, qui se recouvrent) hors du contour : remplacé par un mur dans l'axe
  function etapeEpais(cfg) {
    const ops = [], ctx = contexte(cfg);
    if (!Array.isArray(cfg.walls)) return ops;
    const W = cfg.walls.slice(), pose = (w) => { const [p, q] = extremites(w), r = ctx.aretes.length ? rattacher(ctx, p, q) : null; return !!r && r.d <= EPS; };
    for (let i = 0; i < W.length; i++) {
      if (!murValide(W[i]) || pose(W[i])) continue;
      for (let j = i + 1; j < W.length; j++) {
        const a = W[i], b = W[j];
        if (!murValide(b) || (a[4] ?? null) !== (b[4] ?? null)) continue;
        const [p, q] = extremites(a), S = repere(p, q), [r, s] = extremites(b), pr = proj(S, r, s, EPAIS);
        if (!pr || Math.abs(pr.dm) <= EPS || pr.pente > 2) continue;
        const rec = Math.min(S.lg, pr.t2) - Math.max(0, pr.t1);
        if (rec < 0.8 * Math.min(S.lg, pr.t2 - pr.t1) || pose(b)) continue;
        // une arête de pièce entre les deux traits (gaine, pièces écartées) : deux vrais murs
        const r0 = Math.max(0, pr.t1), r1 = Math.min(S.lg, pr.t2);
        if (ctx.aretes.some((E) => {
          const e = proj(S, E.R.a, E.R.b, EPAIS);
          return e && Math.min(e.t2, r1) - Math.max(e.t1, r0) > EPS && Math.sign(e.dm) === Math.sign(pr.dm) && Math.abs(e.dm) > EPS && Math.abs(e.dm) < Math.abs(pr.dm) - EPS;
        })) continue;
        // axe : à mi-distance, du côté du second trait (ecart() est positif vers (uy, -ux))
        const nx = S.uy * (pr.dm / 2), ny = -S.ux * (pr.dm / 2), lo = Math.min(0, pr.t1), hi = Math.max(S.lg, pr.t2);
        const p2 = netP([au(S, lo)[0] + nx, au(S, lo)[1] + ny]), q2 = netP([au(S, hi)[0] + nx, au(S, hi)[1] + ny]);
        ops.push({ type: "doublon", piece: pieceDe(ctx, milieu(p2, q2)), point: milieu(p2, q2), segment: b.slice(0, 4), detail: { longueur: Math.round(rec), epaisseur: Math.round(Math.abs(pr.dm)) } });
        W[i] = [...p2, ...q2, ...a.slice(4)];
        W.splice(j, 1);
        break;
      }
    }
    cfg.walls = W;
    return ops;
  }

  function etapeFusionner(cfg) {
    const ops = [], ctx = contexte(cfg);
    if (!Array.isArray(cfg.walls)) return ops;
    const W = cfg.walls.slice();
    for (let i = 0; i < W.length; i++) {
      if (!murValide(W[i])) continue;
      let encore = true;
      while (encore) {
        encore = false;
        for (let j = i + 1; j < W.length; j++) {
          const a = W[i], b = W[j];
          if (!murValide(b) || (a[4] ?? null) !== (b[4] ?? null)) continue;
          const [p, q] = extremites(a), S = repere(p, q), [r, s] = extremites(b);
          if (S.lg < EPS || Math.abs(ecart(S, r)) > EPS || Math.abs(ecart(S, s)) > EPS) continue;
          const [t1, t2] = [abscisse(S, r), abscisse(S, s)].sort((x, y) => x - y), rec = Math.min(S.lg, t2) - Math.max(0, t1);
          if (rec < -EPS) continue;
          const lo = Math.min(0, t1), hi = Math.max(S.lg, t2);
          const m = rec > EPS ? au(S, (Math.max(0, t1) + Math.min(S.lg, t2)) / 2) : au(S, t1 > S.lg / 2 ? S.lg : 0);
          ops.push({ type: rec > EPS ? "doublon" : "aligne", piece: pieceDe(ctx, m), point: netP(m), segment: b.slice(0, 4), detail: { longueur: Math.round(Math.max(0, rec)) } });
          W[i] = [...netP(au(S, lo)), ...netP(au(S, hi)), ...a.slice(4)];
          W.splice(j, 1);
          encore = true;
          break;
        }
      }
    }
    cfg.walls = W;
    return ops;
  }

  // ---------- API ----------
  // [option, étape] dans l'ordre d'application : les murs épais sont ramenés à leur axe avant d'être aimantés
  const ETAPES = [["arrondir", etapeArrondir], ["sommets", etapeSommets], ["fusionner", etapeEpais], ["aimanter", etapeAimanter], ["bouts", etapeBouts],
    ["manquants", (cfg, choix) => etapeManquants(cfg, "manquants", choix)], ["passages", (cfg, choix) => etapeManquants(cfg, "passages", choix)],
    ["couper", etapeCouper], ["fusionner", etapeFusionner]];
  const actif = (v) => v === true || (Array.isArray(v) && v.length > 0);

  // nettoyer(config, options) → { config, operations (appliquées), constats (toutes, appliquées ou non, par option) }
  // une option décochée est quand même examinée (sur une copie) pour le dialogue ; manquants / passages : true, false ou [noms de pièces]
  function nettoyer(config, options = {}) {
    const opts = { ...OPTIONS_DEFAUT, ...(options || {}) };
    let cfg = copie(config || {});
    const operations = [], constats = Object.fromEntries(ORDRE.map((k) => [k, []]));
    for (const [nom, etape] of ETAPES) {
      let ops;
      if (nom === "manquants" || nom === "passages") {
        // constat toujours fait ; seules les pièces choisies sont complétées
        ops = etape(cfg, opts[nom]);
      } else if (actif(opts[nom])) {
        ops = etape(cfg).map((o) => ({ ...o, applique: true }));
      } else {
        ops = etape(copie(cfg)).map((o) => ({ ...o, applique: false }));
      }
      ops = ops.map((o) => ({ option: nom, ...o, niveau: o.niveau || NIVEAU[o.type] || "defaut" }));
      constats[nom].push(...ops);
      operations.push(...ops.filter((o) => o.applique));
    }
    return { config: cfg, operations, constats };
  }
  const appliquer = (config, options) => nettoyer(config, options).config;

  // analyser(config) → défauts à cercler, corrections proposées par option (pour les cases du dialogue), propre = rien à faire
  function analyser(config, options = OPTIONS_DEFAUT) {
    const { constats } = nettoyer(config, options);
    const defauts = Object.values(constats).flat().map(({ type, niveau, option, piece, pieces, point, segment, detail }) => ({ type, niveau, option, piece, ...(pieces ? { pieces } : {}), point, ...(segment ? { segment } : {}), detail }));
    const corrections = {};
    for (const nom of ORDRE) corrections[nom] = constats[nom].filter((o) => o.type !== "passage" || nom === "passages");
    const propre = ORDRE.every((nom) => (OPTIONS_DEFAUT[nom] ? corrections[nom].length === 0 : !corrections[nom].some((o) => o.niveau === "defaut")));
    return { defauts, corrections, propre, arrondiUtile: arrondiUtile(config) };
  }
  // plan relevé sur une image : au moins 30 % des cotes (sommets, murs, ouvertures) hors grille de 5 cm → proposer l'arrondi
  function arrondiUtile(config) {
    const v = [];
    for (const r of config?.rooms || []) for (const p of r?.poly || []) if (Array.isArray(p)) v.push(p[0], p[1]);
    for (const w of config?.walls || []) if (murValide(w)) v.push(...w.slice(0, 4));
    for (const o of config?.openings || []) if (segValide(o)) v.push(...o.seg.slice(0, 4));
    const nums = v.filter((x) => typeof x === "number" && Number.isFinite(x));
    return nums.length > 0 && nums.filter((x) => Math.abs(x - sym(x, GRILLE)) > 1e-6).length >= 0.3 * nums.length;
  }

  // pièce isolée (onglets) : chaque arête devient un mur, sauf les ouvertures (recalées) et les passages vers une pièce intérieure ;
  // les cloisons (murs dans la pièce, au moins BOUT cm) sont gardées, coupées au contour
  function isoler(config, nom) {
    const cfg = config || {}, ctx = contexte(cfg), P = ctx.pieces.find((x) => x.nom === nom) || ctx.pieces.find((x) => memeNom(x.nom, nom));
    if (!P) return null;
    const murs = murSegs(cfg), ouvs = ouvSegs(cfg), sansMurs = !murs.some(Boolean);
    const res = { piece: P.nom, poly: P.poly.map((p) => [...p]), murs: [], ouvertures: [], passages: [], cloisons: [] };
    for (const E of P.aretes) {
      const lg = E.R.lg, w = sur(E, murs, AIMANT), o = sur(E, ouvs, AIMANT);
      const ivo = o.map((x) => [Math.max(0, x.t1), Math.min(lg, x.t2)]);
      o.forEach((x, k) => res.ouvertures.push({ seg: [...netP(au(E.R, ivo[k][0])), ...netP(au(E.R, ivo[k][1]))], type: cfg.openings[x.j].type, index: x.j }));
      const pass = [];
      if (!sansMurs) for (const [g0, g1] of trousDe([...w, ...o].map((x) => [Math.max(0, x.t1), Math.min(lg, x.t2)]), lg)) {
        if (g1 - g0 < TROU) continue;
        const ts = [g0, g1];
        for (const Q of ctx.interieures) if (Q !== P) for (const v of Q.poly) { const t = abscisse(E.R, v); if (t > g0 + EPS && t < g1 - EPS && Math.abs(ecart(E.R, v)) <= AIMANT) ts.push(t); }
        ts.sort((a, b) => a - b);
        for (let k = 1; k < ts.length; k++) if (voisineDe(ctx, P, E.R, (ts[k - 1] + ts[k]) / 2)) pass.push([ts[k - 1], ts[k]]);
      }
      for (const [a, b] of union(pass)) res.passages.push([...netP(au(E.R, a)), ...netP(au(E.R, b))]);
      for (const [a, b] of moins(0, lg, [...ivo, ...pass])) res.murs.push([...netP(au(E.R, a)), ...netP(au(E.R, b))]);
    }
    murs.forEach((s) => {
      if (!s) return;
      const [p, q] = extremites(s), S = repere(p, q);
      if (S.lg < EPS) return;
      const iv = dansPiece(S, p, q, P);
      if (iv.reduce((t, [a, b]) => t + b - a, 0) >= BOUT) for (const [a, b] of iv) res.cloisons.push([...netP(au(S, a)), ...netP(au(S, b))]);
    });
    return res;
  }

  // ---------- retour en arrière (après rechargement) ----------
  // instantané des clés touchées, à garder avant d'appliquer ; restaurer(config, instantané) redonne exactement ces clés
  function instantane(config, corrections = 0) {
    const cles = {};
    for (const k of CLES) if (config && Object.prototype.hasOwnProperty.call(config, k)) cles[k] = copie(config[k]);
    return { date: new Date().toISOString(), corrections, cles };
  }
  function restaurer(config, inst) {
    const out = copie(config || {});
    for (const k of CLES) {
      if (inst?.cles && Object.prototype.hasOwnProperty.call(inst.cles, k)) out[k] = copie(inst.cles[k]);
      else delete out[k];
    }
    return out;
  }

  // ---------- noms de pièce ----------
  const sansAccents = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const cleNom = (n) => sansAccents(n).toLowerCase().replace(/[’'`_\-.]/g, " ").replace(/\s+/g, " ").trim();
  // « Chambre · 12,6 m² », « Chambre - 12,6 m² », « Chambre 12,6 m² » → « Chambre » ; « Patio (cour intérieure) » → « Patio »
  const nomBase = (n) => String(n ?? "").split(/\s*[·•|]\s*|\s+[-–—:]\s+/)[0].replace(/\([^)]*\)/g, "").replace(/\s*\d+(?:[.,]\d+)?\s*m(?:²|2)\s*$/i, "").trim();
  const entreParentheses = (n) => [...String(n ?? "").matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  const sigle = (k) => { const m = k.split(" ").filter(Boolean); return m.length > 1 ? m.map((x) => x[0]).join("") : null; };
  // niveaux de rapprochement, du plus sûr au moins sûr
  const formes = (n) => {
    const k = cleNom(n), b = cleNom(nomBase(n)), par = entreParentheses(n).map(cleNom).filter(Boolean);
    return [new Set([k]), new Set([b]), new Set(par), new Set([b.replace(/ /g, "")]), new Set([sigle(b)].filter(Boolean))];
  };
  function memeNom(a, b) {
    if (a == null || b == null) return false;
    const [ka, ba, pa, ca, sa] = formes(a), [kb, bb, pb, cb, sb] = formes(b), x = (A, B) => [...A].some((v) => v && B.has(v));
    return x(ka, kb) || x(ba, bb) || x(pa, bb) || x(ba, pb) || x(ca, sb) || x(sa, cb);
  }
  // le candidat qui correspond le mieux à nom ; null si aucun, ou si deux candidats correspondent au même niveau
  function rapprocherNom(nom, candidats) {
    if (nom == null || !Array.isArray(candidats)) return null;
    const [k, b, par, c, s] = formes(nom);
    const niveaux = [
      (f) => [...f[0]].some((v) => k.has(v)),
      (f) => [...f[1]].some((v) => v && b.has(v)),
      (f) => [...f[1]].some((v) => v && par.has(v)) || [...f[2]].some((v) => b.has(v)),
      (f) => [...f[4]].some((v) => c.has(v)) || [...f[3]].some((v) => s.has(v)),
    ];
    for (const ok of niveaux) {
      const t = candidats.filter((x) => x != null && ok(formes(x)));
      if (t.length === 1) return t[0];
      if (t.length > 1) return new Set(t.map(cleNom)).size === 1 ? t[0] : null;
    }
    return null;
  }

  return { analyser, appliquer, nettoyer, isoler, instantane, restaurer, rapprocherNom, memeNom, cleNom, nomBase,
    CLES, ORDRE, OPTIONS_DEFAUT, NIVEAU, SEUILS: { EPS, AIMANT, TROU, BOUT, EPAIS, SOMMET, GRILLE } };
})();
globalThis.MaquetteNettoyage = MaquetteNettoyage;
