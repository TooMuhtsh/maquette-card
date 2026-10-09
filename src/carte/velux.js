// fenêtres de toit (L11) : tache de lumière sous la fenêtre — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
// ---------- fenêtre de toit (meuble `fenetre_toit`, `skylight` en YAML) ----------
// Le rectangle du meuble est l'emprise de la fenêtre vue du dessus ; son bas (y = +h/2 dans le repère du meuble, avant rotation) est le
// bas de la pente, posé à `hauteur` cm du sol (défaut 200) ; le haut monte de h × tan(`pente`) (0 à 75°, défaut 40 ; 0 = toit plat).
const VELUX_PENTE = 40, VELUX_HAUTEUR = 200;
const penteVelux = (m) => borne(nbOpt(m?.pente) ?? VELUX_PENTE, 0, 75), hauteurVelux = (m) => borne(nbOpt(m?.hauteur) ?? VELUX_HAUTEUR, 0, 1000);
// part dégagée par le store ou le volet (0 à 1) : `cover` = current_position (fermé sans position = 0) ; contact, autre ou rien = 1
function ouvertVelux(entite, etat) {
  if (typeof entite !== "string" || !entite.startsWith("cover.") || !etat) return 1;
  const p = parseFloat(etat.attributes?.current_position);
  return Number.isFinite(p) ? borne(p / 100, 0, 1) : etat.state === "closed" ? 0 : 1;
}
// repère d'une fenêtre de toit : centre, demi-tailles, axes du meuble dans le plan (x = le long du bas, y = vers le bas de la pente)
function repereVelux(m) {
  const [w, h] = (Array.isArray(m?.taille) ? m.taille : [78, 118]).map((v) => bornerTaille(v, 78)), a = (nb(m?.rotation) * Math.PI) / 180;
  const sg = m?.miroir ? -1 : 1, c = Math.cos(a), s = Math.sin(a);
  return { cx: nb(m?.pos?.[0]), cy: nb(m?.pos?.[1]), w, h, ex: [c * sg, s * sg], ey: [-s, c] };
}
// tache de l'astre au sol : le vitrage (incliné de `pente` autour du bas, partie dégagée par le store depuis le bas) projeté au sol le long
// des rayons. (ux, uy) = direction de l'astre dans le plan (vers lui), e = hauteur (°), ouvert = part dégagée (0 à 1), max = recul maximal (cm).
// Rien si l'astre est sous 0,5°, si le store est fermé, ou si l'astre est derrière le pan de toit ou rasant (incidence de plus de 84°).
// Retour au format de tacheLumiere : { expo, poly, aire, pres, loin, de, vers, centre }
function tacheVelux(m, ux, uy, e, ouvert = 1, max = 900) {
  if (![ux, uy, e, ouvert, max].every(Number.isFinite) || e <= 0.5 || ouvert <= 0.02) return null;
  const R = repereVelux(m), p = (penteVelux(m) * Math.PI) / 180, z0 = hauteurVelux(m), er = (Math.min(e, 89) * Math.PI) / 180;
  const ul = Math.hypot(ux, uy) || 1, sx = ux / ul, sy = uy / ul;
  // incidence : normale du vitrage (vers le bas de la pente, inclinée de p) · direction de l'astre
  const expo = Math.sin(p) * Math.cos(er) * (sx * R.ey[0] + sy * R.ey[1]) + Math.cos(p) * Math.sin(er);
  if (expo <= 0.1) return null;
  const t = Math.tan(er), r = (v) => +v.toFixed(1), k = Math.min(1, ouvert);
  // sommet du vitrage : (x, y) dans le repère du meuble, z = hauteur au-dessus du sol ; au sol, reculé de z / tan(e) à l'opposé de l'astre
  const sol = (x, y) => {
    const z = z0 + (R.h / 2 - y) * Math.tan(p), d = Math.min(max, z / t);
    return [r(R.cx + R.ex[0] * x + R.ey[0] * y - sx * d), r(R.cy + R.ex[1] * x + R.ey[1] * y - sy * d), d];
  };
  const yb = R.h / 2, yh = R.h / 2 - R.h * k, P = [sol(-R.w / 2, yb), sol(R.w / 2, yb), sol(R.w / 2, yh), sol(-R.w / 2, yh)];
  const poly = P.map(([x, y]) => [x, y]);
  let aire = 0;
  poly.forEach((q, i) => { const n = poly[(i + 1) % 4]; aire += q[0] * n[1] - n[0] * q[1]; });
  const mil = (a, b) => [r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)], de = mil(P[0], P[1]), vers = mil(P[2], P[3]);
  return { expo, poly, aire: Math.abs(aire) / 2, pres: P[0][2], loin: P[2][2], de, vers, centre: mil(de, vers) };
}
// emprise vue du dessus (4 coins dans le plan) : pièce qui contient la fenêtre, lueur du ciel
function empriseVelux(m) {
  const R = repereVelux(m), c = (x, y) => [R.cx + R.ex[0] * x + R.ey[0] * y, R.cy + R.ex[1] * x + R.ey[1] * y];
  return [c(-R.w / 2, R.h / 2), c(R.w / 2, R.h / 2), c(R.w / 2, -R.h / 2), c(-R.w / 2, -R.h / 2)];
}
