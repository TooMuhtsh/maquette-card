// Démo publiée (GitHub Pages, https://toomuhtsh.github.io/maquette-card/) : bandeau « données fictives » avec les liens du projet,
// réglages (langue, clair / sombre, thème de la carte, gardés dans l'adresse pour partager un lien), « Copier la config YAML »
// et « Réinitialiser » (les modifications faites dans l'éditeur restent dans ce navigateur : localStorage).
// Actif seulement sur le site (<html data-site>, posé par tools/site-demo.sh) ou avec ?site en local : la démo des tests reste identique.
const D = window.demo;
const THEMES = ["material", "ha", "ocean", "slate", "sand", "forest", "night"];
const DEPOT = "https://github.com/TooMuhtsh/maquette-card";

if (D?.site) {
  const fr = document.documentElement.lang === "fr";
  const T = fr
    ? { info: "Démo — données fictives, rien n'est envoyé", depot: "Dépôt GitHub", install: "Installation (HACS)", wiki: "Wiki", langue: "Langue", clair: "Clair",
      sombre: "Sombre", theme: "Thème de la carte", copier: "Copier la config YAML", copie: "Config copiée", reset: "Réinitialiser",
      resetQ: "Effacer les modifications faites dans cette démo (gardées dans ce navigateur) ?", manuel: "Copie impossible : sélectionnez le texte puis Ctrl+C", fermer: "Fermer",
      erreur: "Éditeur introuvable : config non copiée" }
    : { info: "Demo — sample data, nothing leaves your browser", depot: "GitHub repository", install: "Install (HACS)", wiki: "Wiki", langue: "Language", clair: "Light",
      sombre: "Dark", theme: "Card theme", copier: "Copy YAML config", copie: "Config copied", reset: "Reset",
      resetQ: "Clear the changes made in this demo (kept in this browser)?", manuel: "Copy failed: select the text, then Ctrl+C", fermer: "Close",
      erreur: "Editor not found: config not copied" };
  const q = new URLSearchParams(location.search);
  // l'adresse suit les réglages (lien à partager), sans recharger
  const adresse = (cle, val) => {
    const p = new URLSearchParams(location.search);
    if (val === null) p.delete(cle); else p.set(cle, val);
    const s = p.toString().replace(/=(?=&|$)/g, "");
    history.replaceState(null, "", location.pathname + (s ? `?${s}` : "") + location.hash);
  };
  const stocke = () => { try { return Object.keys(localStorage).some((k) => k.startsWith("maquette")); } catch (e) { return false; } };
  const themeActuel = () => D.memo.actuelle.theme || "material";

  const st = document.createElement("style");
  st.textContent = `
.site{background:var(--secondary-background-color);color:var(--primary-text-color);border-bottom:1px solid var(--divider-color);
  font:14px/1.4 Roboto,system-ui,sans-serif;padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center}
.site .info{display:flex;align-items:center;gap:6px;color:var(--secondary-text-color);min-width:0}
.site .info i{font-size:18px;color:var(--primary-color)}
.site nav{display:flex;flex-wrap:wrap;gap:4px 14px}
.site a{color:var(--primary-color);text-decoration:none;white-space:nowrap}
.site a:hover,.site a:focus-visible{text-decoration:underline}
.site .reglages{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-left:auto}
.site .seg{display:inline-flex;border:1px solid var(--divider-color);border-radius:18px;overflow:hidden}
.site button,.site select{font:inherit;color:inherit;background:transparent;border:0;min-height:32px;padding:0 12px;cursor:pointer}
.site .seg button[aria-pressed=true]{background:var(--primary-color);color:var(--text-primary-color)}
.site select{border:1px solid var(--divider-color);border-radius:18px;background:var(--card-background-color)}
.site .act{border:1px solid var(--divider-color);border-radius:18px;display:inline-flex;align-items:center;gap:6px}
.site .act i{font-size:18px}
.site button:focus-visible,.site select:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
.site [hidden]{display:none}
.site-toast{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:10;background:var(--primary-text-color);color:var(--card-background-color);
  padding:8px 16px;border-radius:8px;font:14px Roboto,system-ui,sans-serif;max-width:calc(100vw - 32px)}
.site-manuel{position:fixed;inset:auto 16px 16px 16px;z-index:10;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);
  border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;font:14px Roboto,system-ui,sans-serif}
.site-manuel textarea{height:40vh;font:12px/1.4 ui-monospace,monospace;background:var(--secondary-background-color);color:inherit;border:0;border-radius:8px;padding:8px}
.site-manuel button{align-self:flex-end;font:inherit;color:var(--primary-color);background:none;border:0;padding:6px 8px;cursor:pointer}
@media (max-width:600px){.site{font-size:13px;padding:6px 12px;gap:4px 12px}.site .reglages{margin-left:0;gap:6px}
  .site button,.site select{min-height:30px;padding:0 10px}}`;
  document.head.append(st);

  const bandeau = document.createElement("header");
  bandeau.className = "site";
  bandeau.innerHTML = `<div class="info"><i class="mdi mdi-information-outline" aria-hidden="true"></i><span></span></div>
<nav><a data-l="depot" href="${DEPOT}"></a><a data-l="install" href="${DEPOT}#installation"></a><a data-l="wiki" href="${DEPOT}/wiki"></a></nav>
<div class="reglages">
  <span class="seg" role="group" data-g="langue"><button data-lang="fr">FR</button><button data-lang="en">EN</button></span>
  <span class="seg" role="group" data-g="mode"><button data-clair="0"></button><button data-clair="1"></button></span>
  <select data-x="theme">${THEMES.map((t) => `<option value="${t}">${t}</option>`).join("")}</select>
  <button class="act" data-x="copier"><i class="mdi mdi-content-copy" aria-hidden="true"></i><span></span></button>
  <button class="act" data-x="reset"><i class="mdi mdi-restore" aria-hidden="true"></i><span></span></button>
</div>`;
  bandeau.querySelector(".info span").textContent = T.info;
  for (const a of bandeau.querySelectorAll("a[data-l]")) { a.textContent = T[a.dataset.l]; a.target = "_blank"; a.rel = "noopener"; }
  bandeau.querySelector("[data-g=langue]").setAttribute("aria-label", T.langue);
  const [bSombre, bClair] = bandeau.querySelectorAll("[data-clair]");
  bSombre.textContent = T.sombre; bClair.textContent = T.clair;
  const sel = bandeau.querySelector("[data-x=theme]");
  sel.setAttribute("aria-label", T.theme); sel.title = T.theme;
  bandeau.querySelector("[data-x=copier] span").textContent = T.copier;
  const bReset = bandeau.querySelector("[data-x=reset]");
  bReset.querySelector("span").textContent = T.reset;
  document.body.prepend(bandeau);

  const majBoutons = () => {
    for (const b of bandeau.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === document.documentElement.lang));
    const clair = document.documentElement.classList.contains("clair");
    bSombre.setAttribute("aria-pressed", String(!clair)); bClair.setAttribute("aria-pressed", String(clair));
    sel.value = THEMES.includes(themeActuel()) ? themeActuel() : "material";
    bReset.hidden = !stocke();
  };
  majBoutons();
  // la langue change les textes du plan fictif : rechargement, comme à l'ouverture (?lang=)
  for (const b of bandeau.querySelectorAll("[data-lang]")) b.onclick = () => {
    if (b.dataset.lang === document.documentElement.lang) return;
    adresse("lang", b.dataset.lang); location.reload();
  };
  for (const b of [bSombre, bClair]) b.onclick = () => {
    const clair = b.dataset.clair === "1";
    D.regler({ clair }); adresse("clair", clair ? "" : null); majBoutons();
  };
  sel.onchange = () => { D.regler({ theme: sel.value }); adresse("theme", sel.value === "material" ? null : sel.value); majBoutons(); };
  // le thème choisi dans l'éditeur (⚙ Paramètres › Apparence) et un plan enregistré mettent à jour la barre
  const carte = D.carte, setConfig = carte.setConfig.bind(carte);
  carte.setConfig = (c) => { const r = setConfig(c); queueMicrotask(majBoutons); return r; };

  const toast = (m) => {
    const t = document.createElement("div");
    t.className = "site-toast"; t.setAttribute("role", "status"); t.textContent = m;
    document.body.append(t); setTimeout(() => t.remove(), 2500);
  };
  // repli : texte sélectionné à copier à la main
  const manuel = (texte) => {
    const m = document.createElement("div");
    m.className = "site-manuel"; m.setAttribute("role", "dialog");
    m.innerHTML = `<span></span><textarea readonly spellcheck="false"></textarea><button></button>`;
    m.querySelector("span").textContent = T.manuel; m.querySelector("button").textContent = T.fermer;
    const ta = m.querySelector("textarea"); ta.value = texte;
    m.querySelector("button").onclick = () => m.remove();
    document.body.append(m); ta.focus(); ta.select();
  };
  // config actuelle de la carte, au format public anglais, sérialisée par l'export YAML de l'éditeur (même module que dans HA)
  const yaml = async () => {
    const C = carte.constructor, E = await C.chargerEditeur();
    return E.versYaml(C.versAnglais(C.depuisAnglais(JSON.parse(JSON.stringify(D.memo.actuelle))))) + "\n";
  };
  bandeau.querySelector("[data-x=copier]").onclick = async () => {
    let texte;
    try { texte = await yaml(); } catch (e) { toast(T.erreur); return; }
    D.dernierYaml = texte;
    try { await navigator.clipboard.writeText(texte); toast(T.copie); return; } catch (e) { /* repli ci-dessous */ }
    const ta = Object.assign(document.createElement("textarea"), { value: texte });
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* non pris en charge */ }
    ta.remove();
    if (ok) toast(T.copie); else manuel(texte);
  };
  bReset.onclick = () => {
    if (!confirm(T.resetQ)) return;
    for (const s of [localStorage, sessionStorage]) try { for (const k of Object.keys(s)) if (k.startsWith("maquette")) s.removeItem(k); } catch (e) { /* stockage indisponible */ }
    location.reload();
  };
}
