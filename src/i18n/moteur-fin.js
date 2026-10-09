// textes : moteur (langue, _t, pluriels, unités) — morceau de src/maquette-i18n.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
(() => { // @assemblage
  // français : les clés sont déjà le texte ; seules les exceptions sont ici
  const FR = {};
  const DICO = { en: EN, fr: FR };
  let langue = "en", locale = "en-US";
  const manquantes = new Set();
  const famille = (code) => (/^fr(?![a-z])/i.test(String(code || "").trim()) ? "fr" : "en");
  const valide = (code) => { try { return code && Intl.NumberFormat.supportedLocalesOf(code).length ? code : null; } catch (e) { return null; } };
  const page = () => { try { return document.documentElement.lang || navigator.language || ""; } catch (e) { return ""; } };

  // langue de l'interface : forcée par la config, sinon celle de HA, sinon celle de la page ; renvoie true si elle a changé
  let dernier = null;
  function definir(hass, forcee) {
    const code = String(hass?.locale?.language || hass?.language || page()).trim().replace(/_/g, "-");
    if (dernier === `${code}|${forcee}`) return false; // appelé à chaque mise à jour de hass : rien à recalculer
    dernier = `${code}|${forcee}`;
    const l = forcee === "en" || forcee === "fr" ? forcee : famille(code);
    const loc = (famille(code) === l && valide(code)) || (l === "fr" ? "fr-FR" : "en-US");
    const change = l !== langue || loc !== locale;
    langue = l; locale = loc;
    return change;
  }

  function _t(cle, p) {
    let s = DICO[langue][cle];
    if (s == null) {
      if (langue !== "fr" && !manquantes.has(cle)) manquantes.add(cle);
      s = String(cle).replace(/##\w+$/, "");
    }
    if (s.includes("|")) {
      const f = s.split("|"), n = p?.n;
      s = f[n == null ? 0 : langue === "fr" ? (n > 1 ? 1 : 0) : (n === 1 ? 0 : 1)] ?? f[0];
    }
    return p ? s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? p[k] : m)) : s;
  }
  const _tk = (cle) => cle;

  definir(null);
  return {
    _t, _tk, definir, DICO, manquantes,
    langue: () => langue,
    locale: () => locale,
    nombre: (v, d = 1) => Number(v).toLocaleString(locale, { maximumFractionDigits: d }),
    // espace avant « % » : aucune en anglais (45%), une en français (45 %), comme Home Assistant
    pct: () => (langue === "fr" ? " %" : "%"),
    // unité après un nombre : espace avant, sauf « % » et « ° » en anglais (45%, 12°) ; en français toujours une espace
    unite: (u) => (!u ? "" : langue !== "fr" && (u === "%" || u === "°") ? u : ` ${u}`),
  };
})();
globalThis.MaquetteI18n = MaquetteI18n;
