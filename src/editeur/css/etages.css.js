// CSS : étages dans l'éditeur (L5) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
.ed-dialogue.ed-et-dlg{width:min(760px,100%);height:min(720px,calc(100vh - 32px))}
.ed-et-corps{flex:1;overflow:auto;padding:0 24px 8px;display:flex;flex-direction:column;gap:16px}
.ed-et-l{display:flex;flex-direction:column;gap:8px}
.ed-et{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;border:1px solid var(--md-outline-variant);border-radius:16px;background:var(--md-surface-container-low,var(--md-surface))}
.ed-et.on{border-color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 8%,var(--md-surface-container-low,var(--md-surface)))}
.ed-et-ic{flex:none;color:var(--md-on-surface-variant)}
.ed-et.on .ed-et-ic{color:var(--md-primary)}
.ed-et-champs{flex:1;min-width:0;display:grid;grid-template-columns:minmax(0,2fr) 72px minmax(0,1.4fr);gap:8px;align-items:end}
.ed-et-champs .ed-champ input{width:100%;box-sizing:border-box}
.ed-et-info{grid-column:1/-1;color:var(--md-on-surface-variant);font-size:12px}
.ed-et-info b{color:var(--md-primary);font-weight:500}
.ed-et-seul .ed-et-champs{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.ed-et-act{display:flex;flex:none;gap:2px}
.ed-et-act .ib[disabled]{opacity:.38;cursor:default}
.ed-et-ajout h3{margin:0 0 8px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);letter-spacing:.1px}
.ed-et-choix{display:flex;flex-wrap:wrap;gap:8px}
.ed-et-defaut{max-width:360px}
.ed-btn.plein.ed-et-danger{background:var(--md-error,#b3261e);color:var(--md-on-error,#fff)}
ha-card.ed-etroit .ed-et-corps{padding:0 16px 8px}
ha-card.ed-etroit .ed-et{flex-wrap:wrap;padding:8px 8px 8px 12px}
ha-card.ed-etroit .ed-et-champs{grid-template-columns:minmax(0,1fr) 64px;flex-basis:calc(100% - 40px)}
ha-card.ed-etroit .ed-et-icone{grid-column:1/-1}
ha-card.ed-etroit .ed-et-act{width:100%;justify-content:flex-end}
ha-card.ed-etroit .ed-et-choix .ed-btn{flex:1 1 100%;justify-content:flex-start}
ha-card.ed-etroit .ed-et-defaut{max-width:none}
` // @assemblage
