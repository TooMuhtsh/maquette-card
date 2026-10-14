// atelier des meubles : manipulation directe des formes dans l'aperçu (_manipFormes) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- atelier des meubles : manipulation directe des formes dans l'aperçu ----------
  // Clic ou toucher sur une forme : sélection (cadre, poignées, sa ligne surlignée dans la liste ; l'inverse aussi) ; dans le vide :
  // désélection. Glisser : déplacer ; 8 poignées : redimensionner (Maj : proportions) ; trait et polygone : sommets glissés, « + » au
  // milieu d'une arête = nouveau sommet, appui long, Suppr ou bouton de la ligne = sommet retiré (3 au moins pour un polygone).
  // Aimantation : grille de 5 cm, bords et centres du meuble et des autres formes (guides affichés), coupée par Alt ou le bouton ;
  // les formes restent dans le cadre du meuble. Clavier : flèches 1 cm (Maj : 10 cm), Suppr, Échap ; Ctrl+Z / Ctrl+Y : historique
  // propre à l'atelier (celui de l'éditeur n'est pas touché). Stockage inchangé (en % de la taille) ; les champs en cm suivent.
  _manipFormes() {
    const ed = this, GRILLE = 5, SEUIL = 8, MIN = 1; // cm, px (aimant), cm (plus petite forme)
    const M = { sel: null, som: null, aimant: true, grand: false, hist: [], pos: -1, ref: null, g: null, guides: [], voile: null, api: null, raf: 0 };
    const o = () => M.api?.objet();
    const dims = (ob) => ob.taille.map(tailleMeuble);
    const aPoints = (p) => p.genre === "trait" || p.genre === "polygone";
    const minPts = (p) => (p.genre === "trait" ? 2 : 3);
    const valide = (p) => !!p && (aPoints(p) ? Array.isArray(p.points) && p.points.length >= minPts(p) : [p.x, p.y, p.l, p.h].every((v) => v !== "" && Number.isFinite(+v)));
    // boîte d'une forme en cm (depuis le coin haut gauche du meuble)
    const boite = (p, w, h) => {
      if (aPoints(p)) { const xs = p.points.map((q) => (q[0] * w) / 100), ys = p.points.map((q) => (q[1] * h) / 100); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; }
      return { x0: (p.x * w) / 100, y0: (p.y * h) / 100, x1: ((+p.x + +p.l) * w) / 100, y1: ((+p.y + +p.h) * h) / 100 };
    };
    // repères d'aimantation sur un axe (0 : x, 1 : y) : bords et centre du meuble, des autres formes (et leurs sommets), des autres
    // sommets de la forme
    const reperes = (axe, j, w, h, i = null) => {
      const L = axe ? h : w, t = [0, L / 2, L], ob = o();
      ob.forme.forEach((q, n) => {
        if (n === j || !valide(q)) return;
        const b = boite(q, w, h), a0 = axe ? b.y0 : b.x0, a1 = axe ? b.y1 : b.x1;
        t.push(a0, (a0 + a1) / 2, a1);
        if (aPoints(q)) for (const pt of q.points) t.push((pt[axe] * L) / 100);
      });
      if (i != null) ob.forme[j].points.forEach((q, n) => { if (n !== i) t.push((q[axe] * L) / 100); });
      return t;
    };
    // décalage aimanté : le repère le plus proche sous le seuil, sinon la grille (sur la première valeur)
    const aimanter = (vals, rep, seuil) => {
      let best = null;
      for (const v of vals) for (const c of rep) { const d = c - v; if (Math.abs(d) <= seuil && (best === null || Math.abs(d) < Math.abs(best))) best = d; }
      return best ?? Math.round(vals[0] / GRILLE) * GRILLE - vals[0];
    };
    // guides : repères atteints après le déplacement
    const guides = (vals, rep, axe) => [...new Set(rep.filter((c) => vals.some((v) => Math.abs(v - c) < 0.05)).map((c) => +c.toFixed(2)))].map((v) => [axe, v]);
    // g : { mode: corps | poignee | sommet, j (forme), i (sommet), ph (poignée), p0 (forme au départ), b0 (sa boîte en cm), w, h (taille), k (cm par px) }
    const appliquer = (g, dx, dy, aim, prop) => {
      const p = o().forme[g.j];
      if (!p) return;
      const { w, h, b0, p0 } = g, seuil = SEUIL * g.k;
      M.guides = [];
      if (g.mode === "corps") {
        if (aim) {
          dx += aimanter([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), seuil);
          dy += aimanter([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), seuil);
        }
        dx = borne(dx, Math.min(0, -b0.x0), Math.max(0, w - b0.x1)); dy = borne(dy, Math.min(0, -b0.y0), Math.max(0, h - b0.y1));
        if (aPoints(p0)) p.points = p0.points.map(([a, b]) => [pc(a + (dx / w) * 100), pc(b + (dy / h) * 100)]);
        else { p.x = pc(+p0.x + (dx / w) * 100); p.y = pc(+p0.y + (dy / h) * 100); }
        if (aim) M.guides = [...guides([b0.x0 + dx, (b0.x0 + b0.x1) / 2 + dx, b0.x1 + dx], reperes(0, g.j, w, h), 0), ...guides([b0.y0 + dy, (b0.y0 + b0.y1) / 2 + dy, b0.y1 + dy], reperes(1, g.j, w, h), 1)];
      } else if (g.mode === "sommet") {
        const a = (p0.points[g.i][0] * w) / 100, b = (p0.points[g.i][1] * h) / 100;
        let x = a + dx, y = b + dy;
        if (aim) { x += aimanter([x], reperes(0, g.j, w, h, g.i), seuil); y += aimanter([y], reperes(1, g.j, w, h, g.i), seuil); }
        x = borne(x, Math.min(0, a), Math.max(w, a)); y = borne(y, Math.min(0, b), Math.max(h, b));
        p.points = p0.points.map((q) => [...q]); p.points[g.i] = [pc((x / w) * 100), pc((y / h) * 100)];
        if (aim) M.guides = [...guides([x], reperes(0, g.j, w, h, g.i), 0), ...guides([y], reperes(1, g.j, w, h, g.i), 1)];
      } else if (g.mode === "poignee") {
        const fx = g.ph.includes("w") ? "x0" : g.ph.includes("e") ? "x1" : null, fy = g.ph.includes("n") ? "y0" : g.ph.includes("s") ? "y1" : null;
        const lim = { x0: Math.min(0, b0.x0), x1: Math.max(w, b0.x1), y0: Math.min(0, b0.y0), y1: Math.max(h, b0.y1) };
        let b = { ...b0 };
        if (prop) {
          // proportions gardées : mise à l'échelle depuis le coin (ou le côté) opposé, bornée au cadre et à la taille minimale
          const W0 = b0.x1 - b0.x0 || 1, H0 = b0.y1 - b0.y0 || 1;
          const ax = fx === "x0" ? b0.x1 : fx === "x1" ? b0.x0 : (b0.x0 + b0.x1) / 2, ay = fy === "y0" ? b0.y1 : fy === "y1" ? b0.y0 : (b0.y0 + b0.y1) / 2;
          const sx = fx ? (W0 + (fx === "x1" ? dx : -dx)) / W0 : null, sy = fy ? (H0 + (fy === "y1" ? dy : -dy)) / H0 : null;
          let s = sx != null && sy != null ? (Math.abs(sx - 1) >= Math.abs(sy - 1) ? sx : sy) : sx ?? sy;
          s = Math.max(s, MIN / W0, MIN / H0);
          for (const [e0, a, lo, hi] of [[b0.x0, ax, lim.x0, lim.x1], [b0.x1, ax, lim.x0, lim.x1], [b0.y0, ay, lim.y0, lim.y1], [b0.y1, ay, lim.y0, lim.y1]]) {
            if (e0 > a + 1e-9) s = Math.min(s, (hi - a) / (e0 - a)); else if (e0 < a - 1e-9) s = Math.min(s, (a - lo) / (a - e0));
          }
          b = { x0: ax + s * (b0.x0 - ax), x1: ax + s * (b0.x1 - ax), y0: ay + s * (b0.y0 - ay), y1: ay + s * (b0.y1 - ay) };
        } else {
          for (const [f, d, axe] of [[fx, dx, 0], [fy, dy, 1]]) {
            if (!f) continue;
            const autre = { x0: "x1", x1: "x0", y0: "y1", y1: "y0" }[f];
            let v = b0[f] + d;
            if (aim) v += aimanter([v], reperes(axe, g.j, w, h), seuil);
            if (f.endsWith("0")) { const hi = b0[autre] - MIN; b[f] = borne(v, Math.min(lim[f], hi), hi); } else { const lo = b0[autre] + MIN; b[f] = borne(v, lo, Math.max(lim[f], lo)); }
            if (aim) M.guides.push(...guides([b[f]], reperes(axe, g.j, w, h), axe));
          }
        }
        p.x = pc((b.x0 / w) * 100); p.y = pc((b.y0 / h) * 100); p.l = pc(((b.x1 - b.x0) / w) * 100); p.h = pc(((b.y1 - b.y0) / h) * 100);
      }
    };
    const ajouterSommet = (j, a) => {
      const p = o().forme[j];
      if (!p?.points || p.points.length >= 24) return null;
      const n = p.points.length, q1 = p.points[a], q2 = p.points[(a + 1) % n];
      p.points.splice(a + 1, 0, [pc((q1[0] + q2[0]) / 2), pc((q1[1] + q2[1]) / 2)]);
      return a + 1;
    };
    const retirerSommet = (j, i) => {
      const p = o().forme[j];
      if (!p?.points || i == null || !p.points[i] || p.points.length <= minPts(p)) return false;
      p.points.splice(i, 1); M.som = null;
      return true;
    };
    // historique de l'atelier : un état par modification (glisser, touche, champ, bouton) ; nouvel objet (autre type) = historique neuf
    const noter = () => {
      const ob = o();
      if (!ob) return;
      const s = JSON.stringify(ob);
      if (M.ref !== ob) { M.ref = ob; M.hist = [s]; M.pos = 0; return; }
      if (M.hist[M.pos] === s) return;
      M.hist = M.hist.slice(0, M.pos + 1); M.hist.push(s);
      if (M.hist.length > 100) M.hist.shift();
      M.pos = M.hist.length - 1;
    };
    const foc = () => { const f = ed.R.activeElement; return f?.dataset?.foc ? `[data-foc="${f.dataset.foc}"]` : f?.dataset?.k ? `[data-k="${f.dataset.k}"]` : null; };
    const aller = (pas) => {
      noter();
      const n = M.pos + pas;
      if (n < 0 || n >= M.hist.length) return;
      const f = foc(), ob = JSON.parse(M.hist[n]);
      M.pos = n; M.ref = ob; M.som = null;
      if (M.sel != null && !valide(ob.forme?.[M.sel])) M.sel = null;
      M.api.remplacer(ob, f);
      if (!M.voile.contains(ed.R.activeElement)) M.voile.querySelector('[data-foc="ap"]')?.focus();
    };
    // ligne de la forme choisie surlignée (et montrée) ; bouton « Retirer le sommet » actif si un sommet est choisi
    const lignes = (voir) => {
      const v = M.voile, ob = o();
      if (!v || !ob) return;
      v.querySelectorAll(".ed-prim[data-prim]").forEach((r) => {
        const on = +r.dataset.prim === M.sel;
        r.classList.toggle("sel", on);
        if (on) { r.setAttribute("aria-current", "true"); if (voir) r.scrollIntoView({ block: "nearest" }); } else r.removeAttribute("aria-current");
      });
      v.querySelectorAll('[data-at^="retirer-som:"]').forEach((b) => { const j = +b.dataset.at.split(":")[1]; b.disabled = !(j === M.sel && M.som != null && ob.forme[j]?.points?.length > 3); });
    };
    // champs en cm de la forme j, mis à jour en direct (sauf celui où l'on écrit)
    const champs = (j) => {
      const ob = o(), p = ob?.forme[j], v = M.voile;
      if (!p || !v) return;
      const [w, h] = ob.taille, cm = (x, t) => arr((x * t) / 100);
      const mettre = (k, val) => { const i = v.querySelector(`.ed-at-form [data-k="${k}"]`); if (i && ed.R.activeElement !== i) i.value = val; };
      if (aPoints(p)) mettre(`_p.${j}.pts`, p.points.map(([x, y]) => `${cm(x, w)},${cm(y, h)}`).join(" "));
      else { mettre(`_p.${j}.x`, cm(p.x, w)); mettre(`_p.${j}.y`, cm(p.y, h)); mettre(`_p.${j}.l`, cm(p.l, w)); mettre(`_p.${j}.h`, cm(p.h, h)); }
    };
    const choisir = (j, voir = true) => { if (j === M.sel) return; M.sel = j; M.som = null; lignes(voir); };
    const redessiner = () => { cancelAnimationFrame(M.raf); M.raf = 0; M.api?.maj(); };
    const planifier = () => { if (!M.raf) M.raf = requestAnimationFrame(() => { M.raf = 0; M.api?.maj(); }); };
    const COINS = { nw: _tk("coin haut gauche"), n: _tk("bord haut"), ne: _tk("coin haut droit"), e: _tk("bord droit"), se: _tk("coin bas droit"), s: _tk("bord bas"), sw: _tk("coin bas gauche"), w: _tk("bord gauche") };
    const CURSEURS = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" };
    // calque de manipulation, dans le repère de l'aperçu (cm, centre du meuble en 0,0) ; tailles des poignées en px écran
    const dessinUI = (svg) => {
      const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM(), k = m?.a ? 1 / m.a : svg.viewBox.baseVal.width / 320;
      const X = (v) => +(v - w / 2).toFixed(2), Y = (v) => +(v - h / 2).toFixed(2), f = (v) => +v.toFixed(2);
      const geo = (p, extra) => {
        const b = boite(p, w, h);
        if (aPoints(p)) return `<path d="M${p.points.map(([x, y]) => `${X((x * w) / 100)} ${Y((y * h) / 100)}`).join("L")}${p.genre === "polygone" ? "Z" : ""}"${extra}/>`;
        if (p.genre === "ellipse") return `<ellipse cx="${X((b.x0 + b.x1) / 2)}" cy="${Y((b.y0 + b.y1) / 2)}" rx="${f(Math.abs(b.x1 - b.x0) / 2)}" ry="${f(Math.abs(b.y1 - b.y0) / 2)}"${extra}/>`;
        return `<rect x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(Math.max(0, b.x1 - b.x0))}" height="${f(Math.max(0, b.y1 - b.y0))}"${extra}/>`;
      };
      // cibles : toute la forme, ou son trait seulement (trait, contour) pour laisser atteindre les formes dessous ; 24 px au moins
      const cibles = ob.forme.map((p, j) => {
        if (!valide(p)) return "";
        const trait = p.genre === "trait" || p.style === "vide";
        return geo(p, ` class="cible" data-p="${j}" pointer-events="${trait ? "stroke" : "all"}" stroke-width="${f(24 * k)}"`);
      }).join("");
      const gd = M.guides.map(([axe, v]) => `<path class="guide" d="${axe ? `M${X(-8 * k)} ${Y(v)}H${X(w + 8 * k)}` : `M${X(v)} ${Y(-8 * k)}V${Y(h + 8 * k)}`}"/>`).join("");
      const poignee = (attrs, x, y, label, cl, curseur) => `<g class="${cl}" ${attrs} tabindex="0" role="button" aria-label="${esc(label)}" transform="translate(${X(x)} ${Y(y)})"${curseur ? ` style="cursor:${curseur}"` : ""}><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(6 * k)}"/></g>`;
      let sel = "";
      const p = M.sel != null ? ob.forme[M.sel] : null;
      if (valide(p)) {
        const b = boite(p, w, h), lw = (b.x1 - b.x0) / k, lh = (b.y1 - b.y0) / k;
        sel += `<rect class="cadre" x="${X(b.x0)}" y="${Y(b.y0)}" width="${f(b.x1 - b.x0)}" height="${f(b.y1 - b.y0)}"/>`;
        if (!aPoints(p)) {
          const xm = (b.x0 + b.x1) / 2, ym = (b.y0 + b.y1) / 2;
          // poignées des côtés seulement si le côté laisse la place (sinon elles couvriraient la forme)
          sel += [["nw", b.x0, b.y0], ["n", xm, b.y0], ["ne", b.x1, b.y0], ["e", b.x1, ym], ["se", b.x1, b.y1], ["s", xm, b.y1], ["sw", b.x0, b.y1], ["w", b.x0, ym]]
            .filter(([id]) => id.length === 2 || (id === "n" || id === "s" ? lw >= 56 : lh >= 56))
            .map(([id, x, y]) => poignee(`data-h="${id}" data-foc="h-${id}"`, x, y, _t("Redimensionner : {c}", { c: _t(COINS[id]) }), "ed-ap-h", CURSEURS[id])).join("");
        } else {
          const n = p.points.length, P = p.points.map(([x, y]) => [(x * w) / 100, (y * h) / 100]);
          if (p.genre === "polygone" && n < 24) sel += P.map((q, i) => {
            const r = P[(i + 1) % n];
            return Math.hypot(r[0] - q[0], r[1] - q[1]) / k < 56 ? "" : `<g class="ed-ap-plus" data-plus="${i}" data-foc="p-${i}" tabindex="0" role="button" aria-label="${esc(_t("Ajouter un sommet"))}" transform="translate(${X((q[0] + r[0]) / 2)} ${Y((q[1] + r[1]) / 2)})"><circle class="zone" r="${f(12 * k)}"/><circle class="vis" r="${f(7 * k)}"/><path d="M${f(-3.5 * k)} 0H${f(3.5 * k)}M0 ${f(-3.5 * k)}V${f(3.5 * k)}"/></g>`;
          }).join("");
          sel += P.map(([x, y], i) => poignee(`data-som="${i}" data-foc="s-${i}"`, x, y, _t("Sommet {n}", { n: i + 1 }), `ed-ap-h${M.som === i ? " on" : ""}`, "move")).join("");
        }
      }
      return `<g class="ed-ap-ui"><rect class="limite" x="${X(0)}" y="${Y(0)}" width="${f(w)}" height="${f(h)}"/><g class="cibles">${cibles}</g>${gd}${sel}</g>`;
    };
    const versCm = (g, ev) => { const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(g.inv); return [q.x + g.w / 2, q.y + g.h / 2]; };
    return {
      tete: () => `<div class="ed-at-outils">
        <button type="button" class="ib${M.aimant ? " on" : ""}" data-at="aimant" aria-pressed="${M.aimant}" title="${tactile() ? _t("Aimanter") : _t("Aimanter (Alt : couper)")}" aria-label="${_t("Aimanter")}"><ha-icon icon="${M.aimant ? "mdi:magnet-on" : "mdi:magnet"}"></ha-icon></button>
        <button type="button" class="ib${M.grand ? " on" : ""}" data-at="grand" aria-pressed="${M.grand}" title="${_t("Agrandir l'aperçu")}" aria-label="${_t("Agrandir l'aperçu")}"><ha-icon icon="${M.grand ? "mdi:arrow-collapse" : "mdi:arrow-expand"}"></ha-icon></button></div>`,
      pied: () => `<p class="ed-at-astuce">${_t("Choisis une forme pour la glisser ou la redimensionner.")}</p>`,
      changerGenre: (p, v) => {
        // rectangle ↔ trait ou polygone : la forme garde sa place (boîte ↔ points)
        const pts = v === "trait" || v === "polygone";
        if (pts && !aPoints(p)) {
          const x0 = pc(+p.x || 0), y0 = pc(+p.y || 0), x1 = pc(x0 + (+p.l || 0)), y1 = pc(y0 + (+p.h || 0)), ym = pc((y0 + y1) / 2);
          p.points = v === "trait" ? [[x0, ym], [x1, ym]] : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
          for (const k of ["x", "y", "l", "h"]) delete p[k];
        } else if (!pts && aPoints(p) && p.points?.length) {
          const b = boite(p, 100, 100);
          Object.assign(p, { x: pc(b.x0), y: pc(b.y0), l: pc(Math.max(5, b.x1 - b.x0)), h: pc(Math.max(5, b.y1 - b.y0)) });
          delete p.points;
        }
        if (v === "polygone" && p.points?.length === 2) { const [[a, b], [c, d]] = p.points, ym = (b + d) / 2; p.points.push([pc((a + c) / 2), pc(ym >= 50 ? ym - 40 : ym + 40)]); }
        if (v === "arrondi") p.rayon ??= 8; else delete p.rayon;
        p.genre = v;
      },
      action: (k, v, ob) => {
        const j = +v;
        if (k === "aimant") { M.aimant = !M.aimant; return '[data-at="aimant"]'; }
        if (k === "grand") { M.grand = !M.grand; return '[data-at="grand"]'; }
        if (k === "prim") { M.sel = ob.forme.length - 1; M.som = null; }
        if (k === "retirer-prim") { if (M.sel === j) { M.sel = null; M.som = null; } else if (M.sel != null && M.sel > j) M.sel--; }
        if (k === "monter-prim" && j > 0) { if (M.sel === j) M.sel = j - 1; else if (M.sel === j - 1) M.sel = j; }
        if (k === "retirer-som") { if (M.sel === j) retirerSommet(j, M.som); noter(); return '[data-foc="ap"]'; }
        noter();
        if (k === "prim") return `[data-at="prim:${v}"]`;
        return undefined;
      },
      monter: (voile, api) => {
        M.voile = voile; M.api = api;
        const dans = (ev, k) => ev.composedPath().find((n) => n.dataset?.[k] != null);
        const bouger = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          if (!g.bouge && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 4) return;
          g.bouge = true; clearTimeout(g.appui);
          if (g.mode === "vide" || g.mode === "fini" || !g.b0) return;
          ev.preventDefault();
          const [x, y] = versCm(g, ev);
          appliquer(g, x - g.s0[0], y - g.s0[1], M.aimant && !ev.altKey, ev.shiftKey);
          champs(g.j); planifier();
        };
        const lacher = (ev) => {
          const g = M.g;
          if (!g || ev.pointerId !== g.id) return;
          M.g = null; clearTimeout(g.appui); M.guides = [];
          window.removeEventListener("pointermove", bouger); window.removeEventListener("pointerup", lacher); window.removeEventListener("pointercancel", lacher);
          if (!voile.isConnected || ev.type === "perdu") return;
          if (g.mode === "vide") { if (!g.bouge && ev.type === "pointerup" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); } return; }
          if (g.bouge || g.ajout) noter();
          redessiner();
        };
        voile.addEventListener("pointerdown", (ev) => {
          voile.classList.remove("ed-clavier"); // contour de focus de l'aperçu : au clavier seulement
          // une ligne de la liste touchée : sa forme est choisie
          const r = ev.target.closest?.(".ed-prim[data-prim]");
          if (r) { if (+r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } return; }
          const svg = ev.target.closest?.("svg.ed-ap-meuble");
          if (!svg || (ev.pointerType === "mouse" && ev.button !== 0)) return;
          if (M.g) { if (ev.pointerId !== M.g.id && ev.pointerType !== "mouse") return; noter(); lacher({ pointerId: M.g.id, type: "perdu" }); } // second doigt : ignoré ; relâché perdu : glissement clos
          const ob = o(), [w, h] = dims(ob), m = svg.getScreenCTM();
          if (!m) return;
          const pl = dans(ev, "plus"), so = dans(ev, "som"), hd = dans(ev, "h"), ci = dans(ev, "p");
          let mode = "vide", focus = '[data-foc="ap"]', ajout = false;
          if (pl && M.sel != null) { const i = ajouterSommet(M.sel, +pl.dataset.plus); if (i != null) { M.som = i; mode = "sommet"; ajout = true; focus = `[data-foc="s-${i}"]`; } }
          else if (so && M.sel != null) { M.som = +so.dataset.som; mode = "sommet"; focus = `[data-foc="s-${M.som}"]`; }
          else if (hd && M.sel != null) { mode = "poignee"; focus = `[data-foc="h-${hd.dataset.h}"]`; }
          else if (ci) { const j = +ci.dataset.p; if (j !== M.sel) choisir(j); else M.som = null; mode = "corps"; }
          ev.preventDefault(); // ni sélection de texte ni focus du navigateur : le focus est donné ci-dessous
          const p = M.sel != null ? ob.forme[M.sel] : null;
          const g = (M.g = { mode, j: M.sel, i: M.som, ph: hd?.dataset.h, p0: p ? clone(p) : null, b0: valide(p) ? boite(p, w, h) : null, w, h, inv: m.inverse(), k: 1 / Math.hypot(m.a, m.b),
            cx: ev.clientX, cy: ev.clientY, id: ev.pointerId, bouge: false, ajout });
          g.s0 = versCm(g, ev);
          // appui long au doigt ou au stylet sur un sommet : retiré (s'il en reste assez) ; à la souris, Suppr ou le bouton de la ligne
          if (mode === "sommet" && !ajout && ev.pointerType !== "mouse" && p.points.length > minPts(p)) g.appui = setTimeout(() => {
            if (M.g !== g || g.bouge || !retirerSommet(g.j, g.i)) return;
            g.mode = "fini"; noter(); redessiner(); champs(g.j); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus({ preventScroll: true }); navigator.vibrate?.(30);
          }, 600);
          try { voile.querySelector(".ed-at-w").setPointerCapture(ev.pointerId); } catch (e) { /* pointeur déjà relâché */ }
          window.addEventListener("pointermove", bouger); window.addEventListener("pointerup", lacher); window.addEventListener("pointercancel", lacher);
          if (mode !== "vide") { redessiner(); if (ajout) champs(M.sel); }
          voile.querySelector(focus)?.focus({ preventScroll: true });
        });
        // tactile : pas de défilement ni de menu quand le doigt part d'une forme ou d'une poignée (le vide de l'aperçu défile)
        voile.addEventListener("touchstart", (ev) => { if (ev.composedPath().some((n) => n.dataset && ["p", "h", "som", "plus"].some((k) => n.dataset[k] != null))) ev.preventDefault(); }, { passive: false });
        voile.addEventListener("contextmenu", (ev) => { if (ev.target.closest?.(".ed-ap-ui")) ev.preventDefault(); });
        // focus dans une ligne de la liste : sa forme est choisie ; champ validé : noté dans l'historique
        voile.addEventListener("focusin", (ev) => { const r = ev.target.closest?.(".ed-prim[data-prim]"); if (r && +r.dataset.prim !== M.sel) { choisir(+r.dataset.prim, false); redessiner(); } });
        voile.addEventListener("change", () => noter());
      },
      apresRendu: (v) => {
        M.voile = v;
        const ob = o();
        if (!ob?.forme) return;
        if (M.ref !== ob) { noter(); M.sel = null; M.som = null; } // autre point de départ (Retour, autre type) : rien de choisi
        if (M.sel != null && !valide(ob.forme[M.sel])) { M.sel = null; M.som = null; }
        if (M.som != null && !(ob.forme[M.sel]?.points?.length > M.som)) M.som = null;
        v.querySelector(".ed-atelier")?.classList.toggle("ed-at-grand", M.grand);
        const w = v.querySelector(".ed-at-w"), svg = w?.querySelector("svg.ed-ap-meuble");
        if (!svg) return;
        w.classList.add("ed-at-manip");
        ajouterHTML(svg, dessinUI(svg));
        lignes();
        // téléphone : la ligne montrée ne passe pas sous l'aperçu collant
        v.querySelector(".ed-at-corps")?.style.setProperty("--ed-ap-h", `${v.querySelector(".ed-at-apercu")?.offsetHeight || 0}px`);
      },
      touche: (ev) => {
        if (ev.type !== "keydown" || !M.voile) return false;
        M.voile.classList.add("ed-clavier");
        const ch = ev.composedPath(), t = ch[0], kl = (ev.key || "").toLowerCase(), ctrl = ev.ctrlKey || ev.metaKey;
        const stop = () => { ev.preventDefault(); ev.stopPropagation(); return true; };
        if (ctrl && !ev.altKey && (kl === "z" || kl === "y")) {
          // champ de texte : annulation du navigateur ; ailleurs (aperçu, nombres, boutons) : historique de l'atelier
          if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && !["number", "checkbox", "radio", "range"].includes(t.type))) return false;
          aller(kl === "y" || ev.shiftKey ? 1 : -1);
          return stop();
        }
        if (ctrl || ev.altKey || !ch.some((n) => n.classList?.contains("ed-at-w"))) return false;
        const ob = o(), p = M.sel != null ? ob.forme[M.sel] : null, ds = t?.dataset || {};
        if (kl === "escape" && M.sel != null) { M.sel = null; M.som = null; lignes(); redessiner(); M.voile.querySelector('[data-foc="ap"]')?.focus(); return stop(); }
        if (kl === "enter" || kl === " ") {
          if (ds.plus == null || M.sel == null) return kl === " " ? stop() : false;
          const i = ajouterSommet(M.sel, +ds.plus);
          if (i != null) { M.som = i; noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector(`[data-foc="s-${i}"]`)?.focus(); }
          return stop();
        }
        if (!valide(p)) return false;
        if (kl === "delete" || kl === "backspace") {
          if (ds.som != null) { if (retirerSommet(M.sel, +ds.som)) { noter(); redessiner(); champs(M.sel); lignes(); M.voile.querySelector('[data-foc="ap"]')?.focus(); } return stop(); }
          ob.forme.splice(M.sel, 1); M.sel = null; M.som = null; noter(); M.api.rendre('[data-foc="ap"]');
          return stop();
        }
        const pas = ev.shiftKey ? 10 : 1, d = { arrowleft: [-pas, 0], arrowright: [pas, 0], arrowup: [0, -pas], arrowdown: [0, pas] }[kl];
        if (!d) return false;
        const [w, h] = dims(ob), mode = ds.som != null && aPoints(p) ? "sommet" : ds.h && !aPoints(p) ? "poignee" : "corps";
        if (mode === "sommet") M.som = +ds.som;
        appliquer({ mode, j: M.sel, i: M.som, ph: ds.h, p0: clone(p), b0: boite(p, w, h), w, h, k: 1 }, d[0], d[1], false, false);
        M.guides = []; noter(); champs(M.sel); redessiner();
        return stop();
      },
    };
  }

} // @assemblage
