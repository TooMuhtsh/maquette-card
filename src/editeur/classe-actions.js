// actions de la barre, suppression, déplacement, clavier — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  _action(a) {
    const s = this.sel, d = this.d;
    // zone d'informations : ajouter (choix de l'entité), monter, retirer une ligne
    if (/^info-/.test(a) && s?.type === "texte") {
      const o = this._objet(), [op, j] = a.split(":");
      if (!Array.isArray(o?.infos)) return;
      if (op === "info-ajout") return this.choisirEntite({ titre: _t("Entité à afficher") }).then((e) => { if (e) this.commit(() => { this._objet().infos.push({ entite: e }); }); });
      if (op === "info-suppr") return this.commit(() => { o.infos.splice(+j, 1); });
      if (op === "info-haut" && +j > 0) return this.commit(() => { [o.infos[+j - 1], o.infos[+j]] = [o.infos[+j], o.infos[+j - 1]]; });
      return;
    }
    if (a === "ed-fermer" || a === "ed-appliquer") return this.fermerEdition();
    if (a === "deselection") {
      const pf = s?.type === "widget" && s.cote === "fiche" ? porteurDe(s) : null, r = this._retourEd;
      this.selectionner(s?.type === "widget" && s.piece != null ? { type: "piece", i: s.piece } : pf ? { type: pf.genre, i: pf.i } : null);
      // widget ou fiche ouverts depuis la modale d'une pièce ou d'une ouverture : retour à cette modale
      if (r && this.sel && cle(this.sel) === r) this.editerSelection();
      return;
    }
    if (a.startsWith("ajouter-widget:")) return this.ouvrirCatalogue({ widgets: true, cote: a.split(":")[1], piece: s?.type === "piece" ? s.i : s?.piece ?? null });
    if (a === "fiche-ajouter") return this.ouvrirCatalogue({ widgets: true, cote: "fiche", [s.type]: s.i });
    if (a === "fiche-modele") return this.enregistrerFiche();
    if (a === "fiche-remplir") return this.remplirFiche();
    if (a.startsWith("fusion:")) return this.fusionner(+a.slice(7));
    if (a === "integrer") return this.integrer(s.i);
    // « Placer sur le plan » : la modale se masque le temps du clic sur le plan (Échap la rouvre)
    if (a.startsWith("placer-ouv:")) { if (this.vueEdition) { this._edCachee = true; const V = this.R.querySelector(".ed-mvoile.ed-edit"); if (V) V.hidden = true; } return this.placerOuverture(a.slice(11)); }
    if (/^(sugg|sugg-type|sugg-ign|sugg-choisir|atelier-ouv)(:|$)/.test(a)) return this._actionOuvertureSel(a);
    if (a === "atelier-meuble" && s?.type === "meuble") return this.modifierMeuble({ i: s.i, retour: this.R.querySelector(".ed-edit [data-act=atelier-meuble]") });
    if (a === "ajouter-action") return this.commit(() => (this._objet().actions ||= []).push({ nom: _t("Action"), icone: "mdi:gesture-tap", action: "light.turn_off", cible: "piece" }));
    if (a.startsWith("cible-piece:")) { const j = +a.split(":")[1], ac = this._objet().actions[j]; return this.commit(() => { if (ac.cible === "piece") delete ac.cible; else ac.cible = "piece"; }); }
    if (a.startsWith("cq-")) return this._actionCalque(a);
    if (a.startsWith("niveau:") && this.multi.size <= 1) return this._niveau(a === "niveau:haut");
    // sélection multiple : verrou et masque posés (ou retirés) sur tous ses éléments qui en ont
    if (this.multi.size > 1 && (a === "verrou" || a === "multi-masque")) {
      const ch = a === "verrou" ? "verrouille" : "masque", l = this._objetsMulti(), tous = l.length > 0 && l.every((o) => o[ch] === true);
      if (!l.length) return;
      return this.commit(() => l.forEach((o) => { if (tous) delete o[ch]; else o[ch] = true; }));
    }
    if (a === "verrou") { const o = this._objet(); if (!o || Array.isArray(o)) return; return this.commit(() => { if (o.verrouille) delete o.verrouille; else o.verrouille = true; }); }
    // appareil visible seulement dans la vue de sa pièce : la clé n'est écrite que si elle diffère du réglage global
    if (a === "zoom-seul" && s?.type === "point") {
      const o = this._objet(), g = !!d.style_pastilles?.zoom_seul, v = !(o.zoom_seul ?? g);
      return this.commit(() => { if (v === g) delete o.zoom_seul; else o.zoom_seul = v; });
    }
    if (a === "grouper") return this.grouper();
    if (a === "degrouper") return this.degrouper();
    if (a.startsWith("climat-piece:")) {
      const w = this._objet(), noms = this.d.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite)).map((p) => p.nom), n = noms[+a.split(":")[1]];
      if (!w || n == null) return;
      return this.commit(() => { const l = new Set(w.pieces || []); if (l.has(n)) l.delete(n); else l.add(n); if (l.size) w.pieces = noms.filter((x) => l.has(x)); else delete w.pieces; });
    }
    if (this.multi.size > 1) {
      if (a === "supprimer") return this.supprimer();
      if (a === "dupliquer") {
        const nouv = [];
        return this.commit(() => {
          const L = this._listes(d);
          for (const k of [...this.multi]) { const m = deCle(k); if (!L[m.type]) continue; L[m.type].push(clone(L[m.type][m.i])); nouv.push(`${m.type}:${L[m.type].length - 1}`); }
          // les copies d'un groupe forment un nouveau groupe (sinon cliquer la copie prendrait aussi l'original)
          const ids = {};
          nouv.forEach((k) => { const g = this._gr(k); if (!g) return; if (!ids[g]) { ids[g] = `g${Date.now().toString(36)}${Object.keys(ids).length}`; const nom = (d.groupes || []).find((x) => x.id === g)?.nom || _t("Groupe"); (d.groupes ||= []).push({ id: ids[g], nom: _t("{nom} (copie)", { nom }) }); } this._poserGr(k, ids[g]); });
          const snap = clone(d);
          nouv.forEach((k) => this._translater(k, 40, 40, snap));
          this.multi = new Set(nouv); this.sel = nouv.length ? deCle(nouv[nouv.length - 1]) : null;
        });
      }
      const cles = [...this.multi].filter((k) => /^(point|texte|meuble):/.test(k)), objs = cles.map((k) => this._elt(k));
      if (a.startsWith("aligner:")) {
        // meubles : alignés sur leurs bords (emprise tournée), appareils et textes sur leur position
        const v = a.split(":")[1], axe = ["g", "ch", "d"].includes(v) ? 0 : 1, dm = objs.map((o, j) => (cles[j].startsWith("meuble:") ? this._emprise(o)[axe] : 0));
        const bas = Math.min(...objs.map((o, j) => o.pos[axe] - dm[j])), haut = Math.max(...objs.map((o, j) => o.pos[axe] + dm[j])), sens = { g: -1, h: -1, d: 1, b: 1 }[v] || 0;
        const cible = { g: bas, h: bas, d: haut, b: haut }[v] ?? (bas + haut) / 2;
        return this.commit(() => objs.forEach((o, j) => { o.pos = [...o.pos]; o.pos[axe] = arr(cible - sens * dm[j]); }));
      }
      if (a.startsWith("repartir:")) {
        const axe = +a.split(":")[1], tri = [...objs].sort((p, q) => p.pos[axe] - q.pos[axe]), mn = tri[0].pos[axe], mx = tri[tri.length - 1].pos[axe];
        return this.commit(() => tri.forEach((o, j) => { o.pos = [...o.pos]; o.pos[axe] = arr(mn + ((mx - mn) * j) / (tri.length - 1)); }));
      }
    }
    const o = this._objet();
    if (a === "modele") return this.enregistrerModele();
    if (a.startsWith("retirer:")) { const [, cle, j] = a.split(":"); return this.commit(() => o[cle].splice(+j, 1)); }
    if (a.startsWith("ajouter-ligne:")) {
      const cle = a.split(":")[1];
      return this.choisirEntite({ titre: _t("Ajouter une ligne"), obligatoire: true }).then((e) => { if (e) this.commit(() => (o[cle] ||= []).push({ entite: e })); });
    }
    if (a === "ajouter-colonne") return this.commit(() => (o.colonnes ||= []).push({ nom: _t("Colonne"), decimales: 2, source: "stat" }));
    if (a.startsWith("source:")) {
      const [, j, src] = a.split(":"), c = o.colonnes[+j];
      return this.commit(() => { c.source = src; if (src === "stat") ["jour", "semaine", "mois", "annee"].forEach((p) => delete c[p]); else delete c.stat; });
    }
    if (a.startsWith("periode:")) {
      const p = a.split(":")[1], ordre = ["jour", "semaine", "mois", "annee"], l = new Set(o.periodes || ordre);
      l.has(p) ? l.delete(p) : l.add(p);
      return this.commit(() => { o.periodes = ordre.filter((x) => l.has(x)); if (o.periodes.length === 4) delete o.periodes; });
    }
    if (s?.type === "puce") {
      const l = this._puces(true), j = s.i + (a === "p-avant" ? -1 : 1);
      if ((a === "p-avant" || a === "p-apres") && l[j]) return this.commit(() => { [l[j], l[s.i]] = [l[s.i], l[j]]; this.sel = { ...s, i: j }; });
      if (a === "dupliquer") return this.commit(() => { l.splice(s.i + 1, 0, clone(l[s.i])); this.sel = { ...s, i: s.i + 1 }; });
    }
    if (s?.type === "widget") {
      const l = this._wl(s);
      if (a === "w-monter" && s.i > 0) return this.commit(() => { [l[s.i - 1], l[s.i]] = [l[s.i], l[s.i - 1]]; this.sel = { ...s, i: s.i - 1 }; });
      if (a === "w-descendre" && s.i < l.length - 1) return this.commit(() => { [l[s.i + 1], l[s.i]] = [l[s.i], l[s.i + 1]]; this.sel = { ...s, i: s.i + 1 }; });
      if (a === "w-cote") {
        const autre = s.cote === "gauche" ? "droite" : "gauche";
        return this.commit(() => { const [w] = l.splice(s.i, 1), dest = this._wl({ ...s, cote: autre }, true); dest.push(w); this.sel = { ...s, cote: autre, i: dest.length - 1 }; });
      }
      if (a === "dupliquer") return this.commit(() => { l.splice(s.i + 1, 0, clone(l[s.i])); this.sel = { ...s, i: s.i + 1 }; });
    }
    if (a === "supprimer") return this.supprimer();
    // pièce copiée en décalé (sans sa pièce HA, déjà liée à l'original) ; ouverture copiée à la suite, sur le même mur
    if (a === "dupliquer" && (s?.type === "piece" || s?.type === "ouverture")) {
      const L = s.type === "piece" ? d.pieces : d.ouvertures, c = clone(L[s.i]);
      if (s.type === "piece") { c.poly = c.poly.map(([x, y]) => [x + 40, y + 40]); if (Array.isArray(c.etiquette)) c.etiquette = [c.etiquette[0] + 40, c.etiquette[1] + 40]; c.nom = _t("{nom} (copie)", { nom: c.nom }); delete c.zone; }
      else { const [x0, y0, x1, y1] = c.seg, n = Math.hypot(x1 - x0, y1 - y0) || 1, k = (n + 20) / n; c.seg = [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, x1 + (x1 - x0) * k, y1 + (y1 - y0) * k, ...c.seg.slice(4)].map((v, j) => (j < 4 ? arr(v) : v)); }
      return this.commit(() => { L.push(c); this.sel = { type: s.type, i: L.length - 1 }; });
    }
    if (a === "dupliquer" && s.type === "meuble") {
      const c = clone(d.meubles[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.meubles.push(c); this.sel = { type: "meuble", i: d.meubles.length - 1 }; });
    }
    if (s?.type === "meuble" && /^rot:|^miroir$/.test(a)) {
      const m = d.meubles[s.i];
      if (a === "miroir") return this.commit(() => { if (m.miroir) delete m.miroir; else m.miroir = true; });
      return this.commit(() => { m.rotation = (((nbr(m.rotation) + +a.slice(4)) % 360) + 360) % 360; if (!m.rotation) delete m.rotation; });
    }
    if (a === "dupliquer" && s.type === "texte") {
      const c = clone(d.textes[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.textes.push(c); this.sel = { type: "texte", i: d.textes.length - 1 }; });
    }
    if (a === "dupliquer" && s.type === "point") {
      const c = clone(d.points[s.i]); c.pos = [c.pos[0] + 40, c.pos[1] + 40];
      return this.commit(() => { d.points.push(c); this.sel = { type: "point", i: d.points.length - 1 }; });
    }
    if (a === "convertir") {
      const vers = s.type === "mur" ? "limite" : "mur";
      return this.commit(() => { const [seg] = this._liste(s.type).splice(s.i, 1); this._liste(vers).push(seg); this.sel = { type: vers, i: this._liste(vers).length - 1 }; });
    }
    if (a === "couper") {
      return this.commit(() => {
        // les deux moitiés gardent la 5e valeur (groupe)
        const l = this._liste(s.type), [x1, y1, x2, y2, ...r] = l[s.i], m = [arr((x1 + x2) / 2), arr((y1 + y2) / 2)];
        l.splice(s.i, 1, [x1, y1, m[0], m[1], ...r], [m[0], m[1], x2, y2, ...r]);
      });
    }
  }

  supprimer() {
    const s = this.sel, d = this.d;
    if (this.multi.size > 1) {
      const par = {};
      [...this.multi].forEach((k) => { const m = deCle(k); if (m.type !== "widget") (par[m.type] ||= []).push(m.i); });
      return this.commit(() => {
        const L = this._listes(d);
        for (const [ty, l] of Object.entries(par)) l.sort((x, y) => y - x).forEach((i) => L[ty].splice(i, 1));
        this.sel = null; this.multi.clear();
      }), this.snack(_t("{n} éléments supprimés.", { n: Object.values(par).flat().length }), _t("Annuler"), this._annulation(), 10000);
    }
    if (!s) return;
    if (s.type === "widget" && s.cote === "fiche") {
      const pf = porteurDe(s);
      this.commit(() => { this._wl(s).splice(s.i, 1); this._nettoyerFiche(d[GENRES_FICHE[pf.genre]][pf.i]); this.sel = { type: pf.genre, i: pf.i }; });
      return this.snack(_t("Widget retiré de la fiche."), _t("Annuler"), this._annulation(), 8000);
    }
    const listes = { ...this._listes(d), widget: s.type === "widget" ? this._wl(s) : null,
      puce: s.type === "puce" ? this._puces(true) : null };
    const dedans = s.type === "piece" ? this._meublesDans(d.pieces[s.i].poly) : [];
    const zones = s.type === "piece" ? this._sousZonesDans(s.i).map((j) => d.pieces[j]) : [];
    this.commit(() => { listes[s.type].splice(s.i, 1); this.sel = null; });
    if (dedans.length || zones.length) {
      const quoi = [dedans.length ? _t("{n} meuble|{n} meubles", { n: dedans.length }) : "", zones.length ? _t("{n} sous-zone|{n} sous-zones", { n: zones.length }) : ""].filter(Boolean).join(_t(" et "));
      return this.snack(_t("Pièce supprimée ; ses {quoi} restent en place.", { quoi }), [[_t("Les supprimer aussi"), () => this.commit(() => { dedans.sort((a, b) => b - a).forEach((i) => d.meubles.splice(i, 1)); d.pieces = d.pieces.filter((p) => !zones.includes(p)); })], [_t("Annuler"), this._annulation()]], 12000);
    }
    this.snack(_t("Élément supprimé."), _t("Annuler"), this._annulation(), 8000);
  }

  deplacer(dx, dy) {
    const s = this.sel, o = this._objet();
    if (this.multi.size > 1) {
      return this.commit(() => { const snap = clone(this.d); for (const k of this.multi) if (!k.startsWith("widget:")) this._translater(k, dx, dy, snap); });
    }
    if (!s || s.type === "widget" || s.type === "puce") return;
    if (o?.verrouille) return this.snack(_t("Élément verrouillé : déverrouille-le (cadenas de sa barre d'actions) pour le déplacer."));
    this.commit(() => {
      const t = (p) => [arr(p[0] + dx), arr(p[1] + dy)];
      if (s.type === "point" || s.type === "texte" || s.type === "meuble") { o.pos = t(o.pos); if (s.type === "point") this._rattacher(o); }
      else if (s.type === "piece") { this._meublesDans(o.poly).forEach((j) => { this.d.meubles[j].pos = t(this.d.meubles[j].pos); }); const sn = clone(this.d); this._sousZonesDans(s.i, sn).forEach((j) => this._bougerZone(j, t, sn)); o.poly = o.poly.map(t); if (o.etiquette) o.etiquette = t(o.etiquette); }
      else { const seg = s.type === "ouverture" ? o.seg : this._liste(s.type)[s.i]; seg.splice(0, 4, seg[0] + dx, seg[1] + dy, seg[2] + dx, seg[3] + dy); }
    });
  }

  // ---------- clavier ----------
  _touche(ev) {
    const saisie = ev.composedPath().some((n) => n instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName) || n.isContentEditable));
    const ctrl = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
    if (ctrl && k === "s") { ev.preventDefault(); ev.stopPropagation(); this.appliquer(); return; }
    const interrupteur = ev.composedPath().some((n) => n instanceof HTMLInputElement && (n.type === "checkbox" || n.type === "radio" || n.type === "range"));
    if (this._menuOuvert) return; // menu déroulant ouvert : il gère ses touches (flèches, Échap)
    // modale ⚙ Paramètres : Échap la ferme (après validation du champ en cours), Ctrl+Z / Ctrl+Y annulent et rétablissent, les autres raccourcis attendent
    if (this.vueParametres && !this.R.querySelector(".ed-voile")) {
      if (k === "escape") {
        ev.preventDefault(); ev.stopPropagation();
        if (this._confParam) { this._confParam = null; this._panneau(); this.R.querySelector('.ed-modale [data-par="edition"]')?.focus(); return; }
        const a = this.R.activeElement;
        if (a instanceof HTMLInputElement && !interrupteur) a.blur(); // « change » d'abord : la saisie en cours est gardée
        this.panneauParametres(false);
        return;
      }
      if (ctrl && (k === "z" || k === "y") && (!saisie || interrupteur)) { ev.preventDefault(); if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler(); }
      return;
    }
    // modale d'édition d'un élément : mêmes règles ; masquée pour un clic sur le plan (« Placer sur le plan ») : Échap annule le placement et la rouvre
    if (this.vueEdition && !this.R.querySelector(".ed-voile")) {
      if (this._edCachee) {
        if (k === "escape") {
          ev.preventDefault(); ev.stopPropagation();
          this.aPlacer = null; this.trace = []; this.modeleOuverture = null;
          if (this.outil !== "selection") this.choisirOutil("selection");
          this._edCachee = false; this._panneau();
          this.R.querySelector(".ed-edit .ed-onglets [aria-selected=true]")?.focus({ preventScroll: true });
          return;
        }
      } else {
        if (k === "escape") { ev.preventDefault(); ev.stopPropagation(); if (this._aRetour()) this._action("deselection"); else this.fermerEdition(); return; }
        if (ctrl && (k === "z" || k === "y") && (!saisie || interrupteur)) { ev.preventDefault(); if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler(); }
        return;
      }
    }
    // modale Ambiance : mêmes règles ; masquée pour placer les personnes sur le plan : Échap la rouvre
    if (this.vueAmbiance && !this.R.querySelector(".ed-voile")) {
      if (k === "escape") {
        ev.preventDefault(); ev.stopPropagation();
        if (this._ambCachee) { this._ambCachee = false; this._panneau(); this.R.querySelector(".ed-amb .ed-onglets [aria-selected=true]")?.focus({ preventScroll: true }); return; }
        const a = this.R.activeElement;
        if (a instanceof HTMLInputElement && !interrupteur) a.blur();
        this.panneauAmbiance(false);
        return;
      }
      if (ctrl && (k === "z" || k === "y") && (!saisie || interrupteur)) { ev.preventDefault(); if (k === "y" || ev.shiftKey) this.retablir(); else this.annuler(); }
      if (!this._ambCachee) return;
    }
    if ((saisie && !(interrupteur && ((ctrl && (k === "z" || k === "y")) || k === "escape"))) || this.R.querySelector(".ed-voile")) return;
    if ((k === "arrowup" || k === "arrowdown") && ev.composedPath().some((n) => n.dataset?.cqGlisse)) return; // ordre des calques au clavier
    if (ctrl && k === "z") { ev.preventDefault(); ev.shiftKey ? this.retablir() : this.annuler(); return; }
    if (ctrl && k === "y") { ev.preventDefault(); this.retablir(); return; }
    if (ctrl && k === "a") { ev.preventDefault(); ev.stopPropagation(); this.toutSelectionner(); return; }
    if (ctrl && k === "d") { ev.preventDefault(); if (this.multi.size > 1 || ["point", "meuble", "piece", "ouverture"].includes(this.sel?.type)) this._action("dupliquer"); return; }
    if (ctrl && k === "g") { ev.preventDefault(); ev.stopPropagation(); if (ev.shiftKey) this.degrouper(); else this.grouper(); return; }
    if (ctrl || ev.altKey) return;
    if (ev.key === "?") { ev.preventDefault(); ev.stopPropagation(); this.aideClavier(); return; }
    // Entrée / Espace sur un bouton de zoom : le bouton s'active (pas de fin de tracé ni de déplacement de la vue)
    if ((k === " " || k === "enter") && ev.composedPath().some((n) => n.tagName === "BUTTON" && n.dataset?.z)) return;
    // Entrée / Espace sur un bouton atteint au clavier (barre d'outils…) : le bouton s'active, sauf pendant un tracé
    if ((k === " " || k === "enter") && !this.trace.length && ev.composedPath().some((n) => n instanceof HTMLButtonElement && n.matches(":focus-visible"))) return;
    const stop = () => { ev.preventDefault(); ev.stopPropagation(); };
    if (k === " ") { stop(); this.espace = true; this.zone.classList.add("espace"); return; }
    if (["escape", "enter", "delete", "backspace", "arrowleft", "arrowright", "arrowup", "arrowdown", "a"].includes(k) || RACCOURCIS[k]) stop();
    if (k === "escape") { if (this.trace.length || this.outil !== "selection" || this.aPlacer || this.aPlacerMeuble) { this.aPlacer = null; this.aPlacerMeuble = null; this.trace = []; this.choisirOutil("selection"); } else if (!this.sel && this.vueCalques) this.panneauCalques(false); else if (!this.sel && this.vueAmbiance) this.panneauAmbiance(false);
      else this.selectionner(null); return; }
    if (k === "enter" && this.trace.length) { this._finirTrace(); return; }
    if (k === "enter" && this._enModale(this.sel)) { this.editerSelection(); return; }
    if ((k === "delete" || k === "backspace") && this.sel) { ev.preventDefault(); this.supprimer(); return; }
    const pas = this.grille * (ev.shiftKey ? 10 : 1);
    const fl = { arrowleft: [-pas, 0], arrowright: [pas, 0], arrowup: [0, -pas], arrowdown: [0, pas] }[k];
    if (fl && this.sel) { ev.preventDefault(); this.deplacer(...fl); return; }
    if (RACCOURCIS[k]) { this.choisirOutil(RACCOURCIS[k]); return; }
    if (k === "a") this.ouvrirCatalogue();
  }

  // ---------- aide aux raccourcis clavier (bouton « ? » ou touche ?) ----------
  aideClavier() {
    if (this.R.querySelector(".ed-voile.ed-aide-clavier")) return;
    this._fermerMenu();
    const retour = this.R.activeElement;
    const K = (...t) => t.map((x) => `<kbd>${esc(x)}</kbd>`).join("+"), ou = (...l) => l.map((x) => `<span>${x}</span>`).join(" / ");
    const ctrl = _t("Ctrl"), maj = _t("Maj");
    const groupes = [
      [_t("Général"), [[K(ctrl, "Z"), _t("Annuler##defaire")], [ou(K(ctrl, "Y"), K(ctrl, maj, "Z")), _t("Rétablir")], [K(ctrl, "S"), _t("Enregistrer sans quitter l'éditeur")],
        [K("A"), _t("Ajouter un objet ou un widget")], [K("?"), _t("Cette aide")], [K(_t("Échap")), _t("Annuler l'outil, désélectionner, fermer une fenêtre")]]],
      [_t("Outils"), OUTILS.map(([id, , t]) => [K(Object.keys(RACCOURCIS).find((k) => RACCOURCIS[k] === id).toUpperCase()), esc(_t(t).replace(/\s*\([^)]*\)$/, ""))])],
      [_t("Sélection"), [[_t("Clic"), _t("Sélectionner")], [`${K(ctrl)}+${_t("clic")}`, _t("Ajouter à la sélection ou en retirer")], [_t("Glisser dans le vide"), _t("Cadre de sélection")],
        [K(ctrl, "A"), _t("Tout sélectionner")], [K(_t("Flèches")), _t("Déplacer d'un pas de grille (avec Maj : ×10)")], [K(_t("Suppr")), _t("Retirer")],
        [K(ctrl, "D"), _t("Dupliquer")], [K(ctrl, "G"), _t("Grouper")], [K(ctrl, maj, "G"), _t("Dégrouper")]]],
      [_t("Vue et dessin"), [[ou(`${K(_t("Espace##touche"))}+${_t("glisser")}`, _t("clic molette")), _t("Déplacer la vue")], [`${K("Alt")} ${_t("maintenu")}`, _t("Sans magnétisme")],
        [K(maj), _t("Angle libre en dessin")], [ou(K(_t("Entrée##touche")), _t("clic droit")), _t("Finir un tracé")]]],
    ];
    const { voile, fermer: retirer } = this._voile("ed-aide-clavier", `<div class="ed-dialogue large ed-dlg-touches" role="dialog" aria-modal="true" aria-labelledby="ed-clavier-t"><header><h2 id="ed-clavier-t">${_t("Raccourcis clavier")}</h2></header>
      <div class="ed-touches">${groupes.map(([t, l]) => `<section><h3>${t}</h3><dl>${l.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></section>`).join("")}</div>
      <footer><button class="ed-btn texte" data-fermer="1">${_t("Fermer")}</button></footer></div>`, { echap: () => fermer(), touches: ["?"], defaut: true, pieger: true });
    const fermer = () => {
      retirer();
      const b = retour?.isConnected ? retour : this.barre.querySelector('[data-a="aide"]');
      if (b?.getClientRects().length) b.focus({ preventScroll: true });
    };
    voile.onpointerdown = (ev) => { voile._bas = ev.target === voile; };
    voile.onclick = (ev) => { if ((ev.target === voile && voile._bas) || ev.composedPath().some((n) => n.dataset?.fermer)) fermer(); };
    voile.querySelector("[data-fermer]").focus();
  }

} // @assemblage
