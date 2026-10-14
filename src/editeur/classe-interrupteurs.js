// interrupteurs (switch) ajoutés : confirmer chaque appui ? — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- un switch peut commander un portail ou une porte de garage : l'éditeur demande s'il faut confirmer chaque appui ----------
  // Quand une modification (commit) ajoute un `switch.*` à un élément qui en commande (pastille, meuble, ouverture, bouton de pièce,
  // widget), la réponse est écrite tout de suite (`confirmer: true` s'il ressemble à un accès, sinon `false`, ou le choix déjà
  // fait), puis une notification la propose : Oui / Non. Rien de bloquant : dix prises d'affilée = dix notifications remplacées.
  // Plans existants : rien n'est écrit tant qu'on ne touche pas à l'interrupteur (« Nettoyer le plan » propose la confirmation
  // pour les accès qui n'en ont pas).

  // interrupteurs commandés par un élément : son entité (et son entité « active »), les lignes d'un widget, la cible d'un bouton
  _interrupteursDe(o) {
    const l = [], vu = (e) => { if (typeof e === "string" && e.startsWith("switch.") && !l.includes(e)) l.push(e); };
    vu(o.entite); vu(o.actif);
    for (const k of ["lignes", "entites"]) if (Array.isArray(o[k])) o[k].forEach((x) => vu(typeof x === "string" ? x : x?.entite));
    if (typeof o.action === "string" && /^(?:switch|homeassistant)\./.test(o.action)) (Array.isArray(o.cible) ? o.cible : [o.cible]).forEach(vu);
    return l;
  }

  // éléments qui portent `confirm` et commandent au moins un switch : Map objet → ses interrupteurs (texte)
  _porteursInterrupteurs() {
    const m = new Map(), listes = EditeurPlan.LISTES_CONFIRMABLES;
    const marche = (v, k) => {
      if (Array.isArray(v)) {
        for (const x of v) {
          if (listes.has(k) && x && typeof x === "object" && !Array.isArray(x)) { const l = this._interrupteursDe(x); if (l.length) m.set(x, l.join(" ")); }
          marche(x, null);
        }
      } else if (v && typeof v === "object") for (const [c, x] of Object.entries(v)) marche(x, c);
    };
    marche(this.d, null);
    return m;
  }

  // état avant une modification : porteurs, nombre de porteurs par interrupteur(s), listes de la racine (repérer un plan remplacé)
  _avantInterrupteurs() {
    const m = this._porteursInterrupteurs(), cpt = new Map();
    for (const s of m.values()) cpt.set(s, (cpt.get(s) || 0) + 1);
    return { m, cpt, listes: Object.entries(this.d).filter(([, v]) => Array.isArray(v)) };
  }
  // après une modification : interrupteurs ajoutés → réponse écrite + question. Ajouté = il y a plus de porteurs de ce switch
  // qu'avant (un élément refait à l'identique, déplacé ou recréé par « Nettoyer » ne compte pas) ; parmi eux, un élément neuf sans
  // `confirm` (une copie garde le choix de l'original) ou dont l'interrupteur a changé. Plan remplacé en entier (import, étages,
  // brouillon) : rien
  _questionInterrupteurs(av) {
    if (!av) return;
    if (av.listes.length && av.listes.every(([k, v]) => this.d[k] !== v)) return;
    const hass = this.hass, K = customElements.get("maquette-card"), acces = (s) => s.split(" ").some((e) => K?.interrupteurAcces?.(hass, e));
    const apres = [...this._porteursInterrupteurs()], cpt = new Map();
    for (const [, s] of apres) cpt.set(s, (cpt.get(s) || 0) + 1);
    const pris = new Map(), neufs = apres.filter(([o, s]) => {
      if (av.m.has(o) ? av.m.get(o) === s : "confirmer" in o) return false;
      const n = (pris.get(s) || 0) + 1;
      if (n > cpt.get(s) - (av.cpt.get(s) || 0)) return false;
      pris.set(s, n);
      return true;
    });
    if (!neufs.length) return;
    for (const [o, s] of neufs) o.confirmer = acces(s) ? true : o.confirmer === true;
    const objets = neufs.map(([o]) => o), nb = objets.length, oui = objets.filter((o) => o.confirmer).length;
    const nom = (e) => hass?.states?.[e]?.attributes?.friendly_name || e;
    const txt = nb === 1
      ? `${_t("Confirmer chaque appui sur « {nom} » ?", { nom: neufs[0][1].split(" ").map(nom).join(", ") })} ${oui ? _t("Oui présélectionné : il ressemble à un accès (porte, portail, garage…).") : _t("Non présélectionné.")}`
      : `${_t("{n} interrupteurs ajoutés : confirmer chaque appui ?", { n: nb })} ${oui ? _t("Oui présélectionné pour ceux qui ressemblent à un accès ({k}).", { k: oui }) : _t("Non présélectionné.")}`;
    const choisir = (v) => () => {
      const vivants = this._porteursInterrupteurs(), l = objets.filter((o) => vivants.has(o) && o.confirmer !== v);
      if (l.length) this.commit(() => l.forEach((o) => { o.confirmer = v; }));
    };
    // après le rendu ; une notification déjà là (« Remplir la fiche », « Annuler »…) passe d'abord : la question attend qu'elle
    // se ferme (la réponse présélectionnée est déjà écrite) ; éditeur fermé entre-temps : rien
    const montrer = () => {
      if (this.carte?._editeur !== this) return;
      const s = this.R?.querySelector(".ed-snack");
      // (une question précédente sur un interrupteur est simplement remplacée)
      if (!s || s.dataset.interrupteur) {
        this.snack(txt, [[_t("Oui"), choisir(true)], [_t("Non"), choisir(false)]], 12000);
        const n = this.R.querySelector(".ed-snack");
        if (n) n.dataset.interrupteur = "1";
        return;
      }
      const o = new MutationObserver(() => { if (!s.isConnected) { o.disconnect(); montrer(); } });
      o.observe(s.parentNode, { childList: true });
    };
    setTimeout(montrer, 0);
  }
  // listes dont les éléments portent `confirm` (pastilles, meubles, ouvertures, boutons des pièces, widgets des panneaux et des fiches)
  static LISTES_CONFIRMABLES = new Set(["points", "meubles", "ouvertures", "actions", "widgets", "gauche", "droite"]);
} // @assemblage
