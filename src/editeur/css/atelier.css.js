// CSS : bibliothèque de widgets (atelier en <dialog>), bandeau des copies — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
dialog.ed-biblio{width:auto;height:auto;max-width:none;max-height:none;margin:0;border:0;color:var(--md-on-surface);box-sizing:border-box;overflow:hidden}
dialog.ed-biblio::backdrop{background:transparent}
.ed-dialogue.ed-bib{width:min(1240px,100%);height:min(820px,calc(100vh - 32px));max-height:none}
.ed-bib-tete{display:flex;align-items:center;gap:12px;padding:16px 16px 8px 24px!important}
.ed-bib-tete>ha-icon{color:var(--md-on-surface-variant);flex:none}
.ed-bib-tete>div{flex:1;min-width:0}
.ed-bib-tete h2{margin:0!important}
.ed-bib-corps{flex:1;min-height:0;display:grid;grid-template-columns:260px minmax(0,1fr) minmax(320px,420px);gap:16px 24px;padding:8px 24px}
.ed-bib-liste{display:flex;flex-direction:column;gap:8px;min-height:0}
.ed-bib-liste .ed-recherche{height:48px;flex:none}
.ed-bib-liste>.ed-btn{align-self:flex-start;flex:none}
.ed-bib-modeles{flex:1;min-height:0;overflow:auto;margin:0!important}
.ed-bib-modeles button{width:100%}
.ed-bib-modeles button[aria-selected=true]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-bib-modeles button[hidden]{display:none}
.ed-bib-apercu{min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:8px}
.ed-bib-ap-tete{display:flex;align-items:center;gap:12px;flex-wrap:wrap;align-self:stretch;justify-content:space-between}
.ed-bib-ap-tete h4{margin:0}
.ed-bib-cadre{box-sizing:border-box;max-width:100%;padding:12px;border:1px dashed var(--md-outline-variant);border-radius:16px;background:var(--md-surface)}
.ed-bib-cadre.pc{width:320px}
.ed-bib-cadre.tel{width:380px}
.ed-bib-form{min-height:0;overflow:auto;padding:0 4px 8px 0}
.ed-bib-form h4{margin:16px 0 8px}
.ed-bib-badge{display:flex;align-items:center;gap:6px;color:var(--md-on-surface-variant);font-size:13px;--mdc-icon-size:18px}
.ed-bib-dem{display:flex;align-items:center;gap:8px;margin:6px 0 4px;color:var(--md-on-surface-variant);font-size:13px;cursor:pointer}
.ed-bib-dem input{width:18px;height:18px;margin:0;accent-color:var(--md-primary)}
.ed-bib-vide{grid-column:2 / -1;display:grid;place-items:center}
.ed-bib-pied{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 24px 16px!important}
.ed-bib-pied .ed-esp{flex:1}
.ed-bib-gestion,.ed-bib-placer{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.ed-bib-placer select{height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;max-width:220px}
.ed-cat-boutons{display:flex;flex-wrap:wrap;gap:8px}
/* bandeau d'une copie (fenêtre du widget) */
.ed-bib-copie{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:8px 8px 8px 12px;margin:0 0 12px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);--mdc-icon-size:20px}
.ed-bib-copie>span:first-of-type{flex:1;min-width:140px}
.ed-bib-copie.perdu{background:var(--md-surface-container);color:var(--md-on-surface-variant)}
.ed-bib-copie-act{display:flex;flex-wrap:wrap;gap:4px}
/* entre 600 et 1100 px : liste à gauche, aperçu puis réglages à droite */
@media (max-width:1099px){
  .ed-bib-corps{grid-template-columns:240px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);overflow:hidden}
  .ed-bib-liste{grid-row:1 / 3}
  .ed-bib-apercu{overflow:visible}
}
/* téléphone (carte étroite) : la liste, ou le modèle (aperçu puis réglages) avec « ← Liste » */
ha-card.ed-etroit .ed-bib-corps{display:flex;flex-direction:column;overflow:auto;padding:8px 16px}
ha-card.ed-etroit .ed-bib-corps.seul-liste>:not(.ed-bib-liste),ha-card.ed-etroit .ed-bib-corps.seul-detail>.ed-bib-liste{display:none}
ha-card.ed-etroit .ed-bib-form,ha-card.ed-etroit .ed-bib-apercu{overflow:visible;flex:none}
ha-card.ed-etroit .ed-bib-cadre{width:100%}
ha-card.ed-etroit .ed-bib-tete{padding:12px 8px 4px 16px!important}
ha-card.ed-etroit .ed-bib-pied{padding:8px 16px 12px!important}
ha-card.ed-etroit .ed-bib-placer{width:100%}
ha-card.ed-etroit .ed-bib-placer select{flex:1 1 100%;max-width:none}
ha-card.ed-etroit .ed-bib-placer .ed-btn{flex:1 0 auto;justify-content:center}
` // @assemblage
