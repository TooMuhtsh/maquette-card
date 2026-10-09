// étages dans l'éditeur (L4) : frontière repliée, changer d'étage — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class EditeurPlan { // @assemblage
  // ---------- étages : frontière repliée ----------
  // Seuls this.d (= carte._config) et les instantanés d'annulation sont dépliés sur l'étage actif (clé interne `etage_actif`) :
  // tout ce qui sort de l'éditeur (original, comparaison « modifié », brouillon, versions, enregistrement, export) est replié.
  // L'id de l'étage actif est gardé à part (brouillon, reprise), jamais dans la config.
  get _E() { return this.carte.constructor.ETAGES; }
  // config repliée (copie) : sans étages, une simple copie
  _replie(d = this.d) { return this._E.replier(d); }
  // étage actif (null sans étages)
  _etageActif(d = this.d) { return d?.etage_actif?.id ?? null; }
  // config repliée → dépliée sur l'étage `id` (s'il existe ; sinon l'étage actif s'il existe encore, sinon l'étage initial)
  _deplie(plein, id = this._etageActif()) {
    const E = this._E, ids = E.ids(plein);
    return E.deplier(plein, ids.includes(id) ? id : E.etageInitial(plein));
  }
  // comparaison « modifié » : forme canonique repliée (ordre des clés indifférent), l'original mis en cache
  _canonOriginal() {
    if (this._cOrig?.o !== this.original) this._cOrig = { o: this.original, s: canon(this.original) };
    return this._cOrig.s;
  }
  _estModifie(p = this._replie()) { return canon(p) !== this._canonOriginal(); }
  // la carte suit l'éditeur : étage affiché et config repliée à jour (sélecteur d'étages, résumé de toute la maison)
  _suivreCarte(p = this._replie()) {
    const c = this.carte;
    c._etage = this._etageActif();
    c._plein = p;
  }
  // instantané de l'état en cours, déplié sur l'étage de l'instantané `json` (annuler / rétablir)
  _instantaneSur(json) {
    const id = this._etageActif() == null ? null : JSON.parse(json)?.etage_actif?.id;
    return JSON.stringify(id == null || id === this._etageActif() ? this.d : this._deplie(this._replie(), id));
  }
  // brouillon : config repliée, étage actif sous une clé à part
  _cleEtage() { return `${this._cle()}#etage`; }
  _ecrireBrouillon(p = this._replie()) {
    if (stock.ecrire(this._cle(), JSON.stringify(p)) && this._etageActif() != null) stock.ecrire(this._cleEtage(), this._etageActif());
    else stock.retirer(this._cleEtage());
  }
  _retirerBrouillon() { stock.retirer(this._cle()); stock.retirer(this._cleEtage()); }
  // brouillon relu (normalisé) et déplié sur l'étage où l'on travaillait
  _brouillonDeplie(b) { return JSON.stringify(this._deplie(this._replie(JSON.parse(this._relire(b))), stock.lire(this._cleEtage()))); }

  // outil en cours, tracé, glisser et sélection remis à zéro (changement d'étage : les index ne désignent plus les mêmes éléments)
  _remettreAZero() {
    this._finGlisse?.();
    this.trace = []; this.aPlacer = null; this.aPlacerMeuble = null; this.zoneEnAttente = null; this.sousZoneEnAttente = null;
    this.sel = null; this.multi.clear();
    if (this.outil !== "selection") this.choisirOutil("selection");
    this._fermerMenu();
  }

  // changer d'étage en édition (appelé par le sélecteur d'étages de la carte) : rien n'est modifié, ni historique ni « Enregistrer »
  changerEtage(id) {
    const E = this._E, plein = this._replie();
    if (this._etageActif() == null || id === this._etageActif() || !E.ids(plein).includes(id)) return false;
    this._remettreAZero();
    this._applique(JSON.stringify(E.deplier(plein, id)));
    // redessin sans _apres : rien n'est corrigé sur l'étage affiché (groupes vides…), seul un brouillon existant suit l'étage
    this.modifie = this._estModifie(plein);
    this._boite();
    if (this.modifie) this._ecrireBrouillon(plein);
    this.carte._construire();
    this._barre();
    this._panneau();
    return true;
  }
} // @assemblage
