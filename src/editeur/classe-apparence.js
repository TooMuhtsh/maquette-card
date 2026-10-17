// onglet ⚙ Paramètres › Apparence : thème en vignettes, retouches, CSS personnalisé et variables --maquette-* — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- apparence (`theme:` et `css:`) ----------
  // Tout vient du socle de la carte (MaquetteCard.THEMES : registre, table des variables, validation) : aucune palette ici.
  // Config interne : d.theme = nom du registre, ou { base, <clé interne de la variable>: valeur } (retouches) ; d.css = texte.
  // Aperçu en direct : carte.apercuTheme(theme, css) pendant un glisser ou une frappe (rien d'écrit), puis commit au relâchement ;
  // l'éditeur vit dans le shadow DOM de la carte et lit ses --md-* : il suit l'aperçu lui aussi.
  // Onglet ajouté par classe-parametres.js (_ongletsParametres → _ongletApparence, rendu → _htmlApparence, câblage → _cablerApparence).
  _ongletApparence() { return { id: "apparence", titre: _tk("Apparence"), icone: "mdi:palette-outline", apres: "affichage", html: () => this._htmlApparence() }; }
  get _TH() { return this.carte.constructor.THEMES; }
  // retouches proposées (nom de la variable publique) ; les autres variables restent réglables par le CSS personnalisé
  static RETOUCHES_APPARENCE = [["accent", _tk("Accent")], ["surface", _tk("Fond")], ["wall", _tk("Murs")], ["room-fill", _tk("Sol des pièces")]];
  // nom affiché d'un thème du registre (un thème ajouté plus tard sans nom traduit : son nom avec une majuscule)
  _nomTheme(n) {
    const l = { material: "Material", ha: "Home Assistant", ocean: _t("Océan"), slate: _t("Ardoise"), sand: _t("Sable"), forest: _t("Forêt"), night: _t("Nuit") };
    return l[n] || n.charAt(0).toUpperCase() + n.slice(1);
  }
  // thème de la config : { base, retouches: { <nom de variable>: valeur } } (mêmes règles que la carte : valeurs non sûres ignorées)
  _themeApp(t = this.d.theme) {
    const TH = this._TH, base = typeof t === "string" ? t : t && typeof t === "object" ? t.base : null, retouches = {};
    if (t && typeof t === "object" && !Array.isArray(t)) for (const v of TH.variables) { const s = Object.hasOwn(t, v.cle) ? TH.valeur(t[v.cle], v.type) : null; if (s) retouches[v.nom] = s; }
    return { base: typeof base === "string" && Object.hasOwn(TH.registre, base) ? base : TH.defaut, retouches };
  }
  // config interne d'un thème : nom seul sans retouche (rien pour le thème par défaut), objet sinon
  _configTheme(base, retouches) {
    const l = Object.entries(retouches || {});
    if (!l.length) return base === this._TH.defaut ? undefined : base;
    const cle = Object.fromEntries(this._TH.variables.map((v) => [v.nom, v.cle]));
    return { base, ...Object.fromEntries(l.map(([n, v]) => [cle[n], v])) };
  }
  _ecrireTheme(base, retouches) {
    this.carte.apercuTheme?.(null);
    const t = this._configTheme(base, retouches);
    this.commit(() => { if (t === undefined) delete this.d.theme; else this.d.theme = t; });
  }
  // aperçu sans écriture (retouches et / ou CSS du brouillon) ; un CSS refusé n'est jamais montré (celui de la config reste)
  // un aperçu identique à la config est retiré (sinon il resterait posé sur la carte et masquerait les modifications suivantes)
  _apercuApparence(retouches, css) {
    const { base, retouches: r0 } = this._themeApp();
    const c = css === undefined ? this.d.css : this._TH.verifierCss(css).ok || !css.trim() ? css : this.d.css;
    const t = this._configTheme(base, retouches ?? r0);
    if (JSON.stringify(t) === JSON.stringify(this._configTheme(base, r0)) && (c ?? "") === (this.d.css ?? "")) return this.carte.apercuTheme?.(null);
    this.carte.apercuTheme?.(t ?? this._TH.defaut, c ?? "");
  }
  // toute modification (annuler / rétablir compris) revient à la config : un aperçu en cours n'y survit pas
  _quand_modifie_apparence() { if (this.carte._thApercu) this.carte.apercuTheme?.(null); }
  // couleur calculée → #rrggbb (champ couleur) ; null si elle ne se lit pas (transparente, var() vide…)
  _hexCouleur(c) {
    const s = this._sonde ||= Object.assign(document.createElement("span"), { hidden: true });
    if (!s.isConnected) this.R.append(s);
    s.style.color = ""; s.style.color = c || "";
    if (!s.style.color) return null;
    const v = getComputedStyle(s).color, n = v.match(/[\d.]+(?:e-?\d+)?%?/g)?.map(Number) || [];
    if (n.length < 3 || (n.length > 3 && n[3] < 1)) return null;
    const k = /^color\(srgb/.test(v) ? 255 : /^rgba?\(/.test(v) ? 1 : 0;
    if (!k) return null;
    return `#${n.slice(0, 3).map((x) => Math.max(0, Math.min(255, Math.round(x * k))).toString(16).padStart(2, "0")).join("")}`;
  }
  // variables publiques avec leur valeur lisible : couleur en #rrggbb si possible, police réelle de la carte
  _variablesApp() {
    const l = this.carte.variablesTheme?.() || [];
    const police = getComputedStyle(this.carte).fontFamily;
    return l.map((v) => ({ ...v, lisible: v.type === "couleur" ? this._hexCouleur(v.valeur) || v.valeur : v.type === "police" ? police || v.valeur : v.valeur }));
  }

  // ---------- rendu de l'onglet ----------
  _htmlApparence() {
    const TH = this._TH, { base, retouches } = this._themeApp(), vars = this._variablesApp(), parNom = Object.fromEntries(vars.map((v) => [v.nom, v]));
    this._variablesAppCache = Object.fromEntries(vars.map((v) => [v.nom, v.lisible]));
    // focus et curseur d'un champ de l'onglet : retrouvés après le rendu (_cablerApparence)
    const a = this.R.activeElement;
    this._appGarde = a?.dataset?.app ? { k: a.dataset.app, s: a.selectionStart, e: a.selectionEnd, top: a.scrollTop } : this._appGarde?.force ? this._appGarde : null;
    // brouillon du CSS (refusé, pas encore écrit) : gardé tant que la config n'a pas changé entre-temps
    if (this._appCss && this._appCss.base !== (this.d.css ?? "")) this._appCss = null;
    const css = this._appCss?.texte ?? this.d.css ?? "", refus = css.trim() ? TH.verifierCss(css) : { ok: true };
    // vignette : deux moitiés claire / sombre (une seule si le thème force un mode), variables lues dans le registre ;
    // une valeur absente ou qui dépend du thème HA (var(…)) prend une valeur témoin du mode
    const TEMOIN = { clair: { accent: "#03a9f4", surface: "#ffffff", text: "#1c1b1f", "room-fill": "#eeeeee" }, sombre: { accent: "#03a9f4", surface: "#1c1c1c", text: "#e3e3e3", "room-fill": "#2e2e2e" } };
    const defaut = Object.fromEntries(TH.variables.map((v) => [v.nom, v.defaut]));
    const moitie = (n, sombre) => {
      const r = TH.resoudre(n, sombre), m = TEMOIN[(TH.registre[n].mode || (sombre ? "sombre" : "clair")) === "sombre" ? "sombre" : "clair"];
      const v = (k) => (r[k] && !/^var\(/.test(r[k]) ? r[k] : m[k] ?? defaut[k]);
      const st = `--md-primary:${v("accent")};--md-surface:${v("surface")};--md-on-surface:${v("text")};--f:${v("card-background")};--w:${v("wall")};--r:${v("room-fill")};--a:${v("door-closed")};--t:${v("room-text")}`;
      return `<span class="ed-app-moitie" style="${esc(st)}"><span class="p"></span><span class="l"></span><span class="o"></span></span>`;
    };
    const vignettes = TH.noms.map((n) => {
      const on = n === base, mode = TH.registre[n].mode, nom = this._nomTheme(n);
      const quoi = mode === "sombre" ? _t("toujours sombre") : mode === "clair" ? _t("toujours clair") : _t("clair et sombre");
      return `<button type="button" class="ed-app-theme" data-app="theme:${esc(n)}" aria-pressed="${on}" aria-label="${esc(`${nom} (${quoi})`)}">
        <span class="ed-app-mini" aria-hidden="true">${mode ? moitie(n, mode === "sombre") : moitie(n, false) + moitie(n, true)}</span>
        <span class="ed-app-nom">${on ? `<ha-icon icon="mdi:check"></ha-icon>` : ""}${esc(nom)}</span></button>`;
    }).join("");
    // retouches : couleur (champ couleur + effacer) et rayon (curseur)
    const lignes = EditeurPlan.RETOUCHES_APPARENCE.map(([n, lib]) => {
      const r = retouches[n], hex = this._hexCouleur(r ?? parNom[n]?.valeur) || "#808080", l = esc(_t(lib));
      return `<div class="ed-pal ed-app-ret"><input type="color" data-app="ret:${esc(n)}" value="${esc(hex)}" aria-label="${l}">
        <span class="n">${l}<small>${r ? esc(r) : `${esc(_t("Thème"))} · ${esc(hex)}`}</small></span>
        ${r ? `<button type="button" class="ib" data-app="raz:${esc(n)}" title="${esc(_t("Valeur du thème"))}" aria-label="${esc(_t("Valeur du thème"))} : ${l}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</div>`;
    }).join("");
    const ray = retouches.radius ?? parNom.radius?.valeur ?? "16px", rpx = Math.max(0, Math.min(32, Math.round(parseFloat(ray) || 0)));
    const rayon = `<div class="ed-champ ed-par-curseur ed-app-rayon"><label for="app-rayon">${_t("Rayon des coins")}</label><div class="ed-curseur">
        <input type="range" id="app-rayon" data-app="ret:radius" min="0" max="32" step="1" value="${rpx}" aria-valuetext="${rpx} px"><output>${rpx} px</output>
        ${retouches.radius ? `<button type="button" class="ib" data-app="raz:radius" title="${esc(_t("Valeur du thème"))}" aria-label="${esc(_t("Valeur du thème"))} : ${esc(_t("Rayon des coins"))}"><ha-icon icon="mdi:close"></ha-icon></button>` : ""}</div></div>`;
    const nbRet = Object.keys(retouches).length;
    // variables publiques : liste cliquable (un clic insère « --maquette-x: valeur; » au curseur du CSS personnalisé)
    const ico = { longueur: "mdi:ruler", police: "mdi:format-font" };
    const liste = vars.map((v) => `<li><button type="button" class="ed-app-var" data-app="var:${esc(v.nom)}" title="${esc(_t("Insérer « {v} » dans le CSS", { v: `${v.variable}: ${v.lisible};` }))}">
        ${v.type === "couleur" ? `<span class="ed-app-pastille" data-app-coul="${esc(v.nom)}"></span>` : `<ha-icon class="ed-app-pastille ic" icon="${ico[v.type] || "mdi:code-braces"}"></ha-icon>`}
        <span class="n"><code>${esc(v.variable)}</code><small>${esc(v.role)}</small></span><code class="v">${esc(v.lisible)}</code></button></li>`).join("");
    return `<section class="ed-par-sec" data-sec="app-theme"><h4><span id="app-theme-t">${_t("Thème")}</span>${bulleI(_t("Material : le rendu d'origine. Home Assistant : se fond dans le thème du tableau de bord. Chaque vignette montre le thème clair et sombre."))}</h4>
        <div class="ed-app-themes" role="group" aria-labelledby="app-theme-t">${vignettes}</div></section>
      <section class="ed-par-sec" data-sec="app-retouches"><h4><span>${_t("Retouches")}</span>${bulleI(_t("Par-dessus le thème choisi, en clair comme en sombre. Les autres couleurs se règlent dans le CSS personnalisé."))}</h4>
        <div class="ed-palette ed-app-retouches">${lignes}</div>${rayon}
        <div class="ed-actions"><button type="button" class="ed-btn texte" data-app="raz" ${nbRet ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon>${_t("Réinitialiser")}</button></div></section>
      <section class="ed-par-sec" data-sec="app-css"><h4><label for="app-css">${_t("CSS personnalisé")}</label>${bulleI(_t("Ajouté en dernier dans la carte. Refusés : @import, url() hors image data:, expression(), javascript:, barres obliques inverses, plus de {n} Kio.", { n: TH.CSS_MAX / 1024 }))}</h4>
        <textarea id="app-css" class="ed-code ed-app-css" data-app="css" spellcheck="false" placeholder=":host { --maquette-accent: #006a6a; }" aria-describedby="app-css-err"${refus.ok ? "" : ` aria-invalid="true"`}>${esc(css)}</textarea>
        <div class="ed-erreur" id="app-css-err" role="alert" ${refus.ok ? "hidden" : ""}>${refus.ok ? "" : esc(this._refusCss(refus.raison))}</div>
        <div class="ed-par-inter"><span>${_t("Variables --maquette-*")}</span>${bulleI(_t("Un clic insère la variable et sa valeur actuelle au curseur. Elles priment sur le thème, aussi depuis un thème Home Assistant ou card-mod."))}</div>
        <ul class="ed-app-vars">${liste}</ul></section>`;
  }
  // raison d'un refus (anglais, donnée par la carte) : traduite pour l'interface
  _refusCss(raison) {
    const fr = globalThis.MaquetteI18n?.langue?.() === "fr";
    const R = [[/^larger than (\d+) KiB/, (m) => `plus de ${m[1]} Kio`], [/^backslash/, () => "barres obliques inverses interdites"], [/^<\/style/, () => "</style interdit"],
      [/^@import/, () => "@import interdit"], [/^expression/, () => "expression() interdit"], [/^javascript/, () => "javascript: interdit"], [/^-moz-binding/, () => "-moz-binding / behavior interdits"],
      [/^url\(\)/, () => "url() seulement avec une image data:"], [/^image-set/, () => "image-set() / src() interdits"], [/^not a text/, () => "ce n'est pas du texte"]];
    let r = raison;
    if (fr) for (const [re, f] of R) { const m = raison.match(re); if (m) { r = f(m); break; } }
    return _t("CSS refusé ({raison}) : rien n'est appliqué.", { raison: r });
  }

  // ---------- événements de l'onglet (après chaque rendu) ----------
  _cablerApparence(V) {
    const P = V.querySelector('[data-onglet="apparence"]');
    if (!P) return;
    const q = (k) => P.querySelector(`[data-app="${k}"]`);
    P.querySelectorAll("[data-app-coul]").forEach((s) => { const v = this._variablesAppCache?.[s.dataset.appCoul]; if (v) s.style.setProperty("--c", v); });
    // retouches : aperçu en direct pendant le choix, écriture au relâchement (une seule étape d'annulation)
    const avec = (n, v) => { const r = { ...this._themeApp().retouches }; if (v == null) delete r[n]; else r[n] = v; return r; };
    P.querySelectorAll('input[data-app^="ret:"]').forEach((inp) => {
      const n = inp.dataset.app.slice(4), val = () => (n === "radius" ? `${+inp.value}px` : inp.value);
      inp.oninput = () => {
        if (n === "radius") { const o = inp.parentElement.querySelector("output"); if (o) o.textContent = `${+inp.value} px`; inp.setAttribute("aria-valuetext", `${+inp.value} px`); }
        this._apercuApparence(avec(n, val()), this._appCss?.texte);
      };
      inp.onchange = () => this._ecrireTheme(this._themeApp().base, avec(n, val()));
    });
    // CSS personnalisé : contrôlé à la frappe (refus affiché, aperçu des seuls CSS acceptés), écrit quand il est accepté
    const ta = q("css"), err = P.querySelector("#app-css-err");
    let controle = () => true;
    if (ta) {
      controle = () => {
        const t = ta.value, v = t.trim() ? this._TH.verifierCss(t) : { ok: true };
        err.hidden = v.ok; err.textContent = v.ok ? "" : this._refusCss(v.raison);
        if (v.ok) ta.removeAttribute("aria-invalid"); else ta.setAttribute("aria-invalid", "true");
        this._appCss = t === (this.d.css ?? "") ? null : { base: this.d.css ?? "", texte: t };
        return v.ok;
      };
      ta.oninput = () => {
        controle();
        if (this._rafApp) return;
        this._rafApp = requestAnimationFrame(() => { this._rafApp = 0; this._apercuApparence(undefined, ta.value); });
      };
      ta.onchange = () => this._ecrireCss(ta, controle());
      // Échap ferme la modale : le CSS en cours est écrit d'abord (pas de changement perdu)
      ta.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && this._appCss) this._ecrireCss(ta, controle(), false); });
    }
    P.onclick = (ev) => {
      const b = ev.composedPath().find((n) => n instanceof HTMLButtonElement && n.dataset?.app);
      if (!b || b.disabled) return;
      const k = b.dataset.app, { base, retouches } = this._themeApp();
      if (k.startsWith("theme:")) { this._appGarde = { k, force: true }; return this._ecrireTheme(k.slice(6), retouches); }
      if (k === "raz") { this._appGarde = { k: `theme:${base}`, force: true }; return this._ecrireTheme(base, {}); }
      if (k.startsWith("raz:")) { this._appGarde = { k: `ret:${k.slice(4)}`, force: true }; return this._ecrireTheme(base, avec(k.slice(4), null)); }
      if (k.startsWith("var:") && ta) return this._insererVariable(ta, k.slice(4), controle);
    };
    // focus et curseur retrouvés (rendu refait à chaque modification)
    const g = this._appGarde;
    this._appGarde = null;
    if (g) {
      const el = q(g.k);
      if (el) { el.focus({ preventScroll: true }); if (el === ta && g.s != null) { ta.setSelectionRange(g.s, g.e ?? g.s); ta.scrollTop = g.top || 0; } }
    }
  }
  // écrit le CSS du champ s'il est accepté (vide = clé retirée) ; refusé : rien d'écrit, le brouillon et le message restent
  _ecrireCss(ta, ok, garder = true) {
    if (!ok) return;
    const t = ta.value.trim() ? ta.value : "";
    this._appCss = null;
    if (t === (this.d.css ?? "")) return;
    if (garder && this.R.activeElement === ta) this._appGarde = { k: "css", s: ta.selectionStart, e: ta.selectionEnd, top: ta.scrollTop, force: true };
    this.carte.apercuTheme?.(null);
    this.commit(() => { if (t) this.d.css = t; else delete this.d.css; });
  }
  // un clic sur une variable : « --maquette-x: valeur; » au curseur s'il est dans un bloc { … } ; sinon dans le dernier bloc
  // « :host { … } » (créé à la fin s'il n'y en a pas, ou seul si le champ est vide) ; puis écrit
  _insererVariable(ta, nom, controle) {
    const v = this._variablesApp().find((x) => x.nom === nom);
    if (!v) return;
    const decl = `${v.variable}: ${v.lisible};`, t = ta.value, s = ta.selectionStart ?? t.length, e = ta.selectionEnd ?? s;
    // profondeur des accolades avant une position (commentaires ignorés)
    const prof = (x) => [...x.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, "")].reduce((n, c) => n + (c === "{") - (c === "}"), 0);
    // séparateur avant la déclaration : « ; » si la précédente n'est pas terminée
    const sep = (avant) => (/[{;]\s*$/.test(avant) || !avant.trim() ? (/\s$/.test(avant) || !avant ? "" : " ") : "; ");
    let avant, apres, ins;
    if (!t.trim()) { avant = ""; ins = `:host {\n  ${decl}`; apres = "\n}\n"; }
    else if (prof(t.slice(0, s)) > 0) { avant = t.slice(0, s); apres = t.slice(e); ins = sep(avant) + decl; }
    else {
      const blocs = [...t.matchAll(/:host\s*\{[^{}]*\}/g)], b = blocs[blocs.length - 1];
      if (b) { const i = b.index + b[0].length - 1; avant = t.slice(0, i).replace(/\s*$/, ""); apres = `\n${t.slice(i)}`; ins = `${/[{;]$/.test(avant) ? "" : ";"}\n  ${decl}`; }
      else { avant = t.replace(/\s*$/, ""); apres = "\n}\n"; ins = `\n:host {\n  ${decl}`; }
    }
    const fin = avant.length + ins.length;
    ta.value = avant + ins + apres;
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(fin, fin);
    const ok = controle();
    if (ok) { this._appGarde = { k: "css", s: fin, e: fin, top: ta.scrollTop, force: true }; this._ecrireCss(ta, true, false); }
  }
} // @assemblage
