// thème et CSS personnalisé appliqués à la carte ; points d'accroche pour l'onglet Apparence de l'éditeur — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
  // registre, table et outils purs (éditeur, doc, tests) : MaquetteCard.THEMES.registre[nom] = { clair, sombre, mode?, css? },
  // .variables = VARIABLES_THEME, .resoudre(theme, sombre) = { variable: valeur }, .css(theme, sombre), .verifierCss(texte), .doc(langue)
  static THEMES = { registre: THEMES, noms: NOMS_THEMES, defaut: THEME_DEFAUT, variables: VARIABLES_THEME, resoudre: variablesDuTheme, css: cssDuTheme, verifierCss, valeur: valeurTheme,
    doc: tableVariablesTheme, cleAnglaise: cleAnglaiseTheme, CSS_MAX: CSS_PERSO_MAX, jetonsCss: CSS_JETONS_THEME };

  // moments : plan construit (config neuve ou modifiée), nouvel état de HA (le thème clair / sombre de HA a pu changer)
  _quand_construit_themes() { this._appliquerTheme(); }
  _quand_hass_themes() { if (!!this._hass?.themes?.darkMode !== this._thSombre) this._appliquerTheme(); }

  // pose le thème (variables --mq-t-* + règles de forme) puis le CSS personnalisé, en dernier dans le shadow DOM (feuilles construites,
  // après tous les <style> : la carte et l'éditeur) ; rien n'est posé pour material sans retouche ni CSS (rendu d'avant à l'identique)
  _appliquerTheme() {
    const R = this.shadowRoot;
    if (!R) return;
    const src = this._thApercu || { theme: this._plein?.theme ?? this._config?.theme, css: this._plein?.css ?? this._config?.css };
    const sombre = (this._thSombre = !!this._hass?.themes?.darkMode);
    let perso = "";
    if (typeof src.css === "string" && src.css.trim()) {
      const v = verifierCss(src.css);
      if (v.ok) perso = v.css;
      else if (this._thRefus !== v.raison) console.warn(`maquette-card : custom css refused (${v.raison}): nothing applied`);
      this._thRefus = v.ok ? null : v.raison;
    }
    const empreinte = [cssDuTheme(src.theme, sombre), perso];
    this._poserFeuille("theme", empreinte[0]);
    this._poserFeuille("css", perso);
    // police : --maquette-font (thème HA, CSS personnalisé…) sinon celle du thème, posée sur l'hôte (tous les styles lisent --ha-font-family-body)
    const ext = typeof getComputedStyle === "function" ? getComputedStyle(this).getPropertyValue("--maquette-font").trim() : "";
    const police = valeurTheme(ext, "police") || policeDuTheme(src.theme, sombre);
    if (police) { this.style.setProperty("--ha-font-family-body", police); this._thPolice = true; }
    else if (this._thPolice) { this.style.removeProperty("--ha-font-family-body"); this._thPolice = false; }
    // le thème peut changer la boîte du plan sans changer la taille de l'hôte (bordure de ha-card de `ha`, police, CSS personnalisé) :
    // le ResizeObserver de l'hôte reste muet, la mise en page est refaite ici (seulement si quelque chose a changé)
    empreinte.push(police || "");
    const cle = empreinte.join("\n");
    if (cle !== (this._thEmpreinte ?? "\n\n") && this._ok) this._mise();
    this._thEmpreinte = cle;
  }
  // une feuille par sujet (« theme » puis « css », toujours dans cet ordre, à la fin) ; texte vide = feuille retirée
  _poserFeuille(sujet, texte) {
    const R = this.shadowRoot, F = (this._thFeuilles ||= {});
    const construites = typeof CSSStyleSheet === "function" && "replaceSync" in CSSStyleSheet.prototype && Array.isArray(R.adoptedStyleSheets);
    if (construites) {
      if (!texte && !F[sujet]) return;
      const avant = F[sujet];
      if (texte) (F[sujet] ||= new CSSStyleSheet()).replaceSync(texte); else F[sujet] = null;
      // les autres feuilles adoptées (card-mod, autre outil) restent devant, les nôtres en dernier
      const miennes = ["theme", "css"].map((k) => F[k]).filter(Boolean);
      R.adoptedStyleSheets = [...R.adoptedStyleSheets.filter((s) => s !== avant && !miennes.includes(s)), ...miennes];
      return;
    }
    // sans feuilles construites : un <style> à la fin du shadow DOM
    let el = R.querySelector(`style[data-maquette-${sujet}]`);
    if (!texte) { el?.remove(); return; }
    if (!el) { el = document.createElement("style"); el.setAttribute(`data-maquette-${sujet}`, ""); }
    el.textContent = texte;
    R.append(el);
    if (sujet === "theme") { const c = R.querySelector("style[data-maquette-css]"); if (c) R.append(c); }
  }

  // ---------- pour l'éditeur (onglet Apparence) ----------
  // toutes les variables publiques, avec leur valeur calculée actuelle sur cette carte (liste cliquable, pastilles) :
  // [{ nom, variable: "--maquette-<nom>", cle, yaml, type, role (langue de l'interface), fr, en, defaut, valeur }]
  variablesTheme() {
    const cs = typeof getComputedStyle === "function" ? getComputedStyle(this) : null, fr = globalThis.MaquetteI18n?.langue?.() === "fr";
    return VARIABLES_THEME.map((v) => ({ nom: v.nom, variable: `--maquette-${v.nom}`, cle: v.cle, yaml: cleAnglaiseTheme(v), type: v.type, role: fr ? v.fr : v.en, fr: v.fr, en: v.en,
      defaut: v.defaut, valeur: (cs?.getPropertyValue(v.jeton) || "").trim() || v.defaut }));
  }
  // aperçu d'un thème et / ou d'un CSS (config interne : `theme` chaîne ou objet aux clés internes, `css` texte), sans toucher la config ;
  // apercuTheme(null) revient à la config. Renvoie les variables du thème appliqué ({ variable: valeur }).
  apercuTheme(theme, css) {
    this._thApercu = theme === null && css === undefined ? null : { theme: theme === undefined ? this._plein?.theme : theme, css: css === undefined ? this._plein?.css : css };
    this._appliquerTheme();
    return variablesDuTheme(this._thApercu ? this._thApercu.theme : this._plein?.theme, this._thSombre);
  }
} // @assemblage
