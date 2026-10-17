// CSS : onglet ⚙ Paramètres › Apparence (vignettes des thèmes, retouches, CSS personnalisé, variables) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
.ed-app-themes{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:8px}
.ed-app-theme{display:flex;flex-direction:column;gap:6px;padding:6px 6px 8px;border-radius:12px;border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface);
  cursor:pointer;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif);text-align:left;min-width:0}
.ed-app-theme:hover{background:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface))}
.ed-app-theme[aria-pressed=true]{border-color:var(--md-primary);box-shadow:inset 0 0 0 1px var(--md-primary);background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-app-theme:focus-visible{outline:2px solid var(--md-primary);outline-offset:2px}
.ed-app-mini{display:flex;height:56px;border-radius:8px;overflow:hidden;border:1px solid var(--md-outline-variant)}
.ed-app-moitie{flex:1;position:relative;background:var(--f)}
.ed-app-moitie .p{position:absolute;left:12%;top:16%;width:60%;height:58%;box-sizing:border-box;background:var(--r);border:2px solid var(--w);border-radius:2px}
.ed-app-moitie .l{position:absolute;left:22%;top:38%;width:30%;height:4px;border-radius:2px;background:var(--t)}
.ed-app-moitie .o{position:absolute;right:9%;bottom:12%;width:12px;height:12px;border-radius:50%;background:var(--a)}
.ed-app-nom{display:flex;align-items:center;gap:4px;padding:0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ed-app-nom ha-icon{--mdc-icon-size:16px;flex:none}
.ed-app-retouches .ed-pal .ib{flex:none}
.ed-app-rayon .ed-curseur .ib{flex:none}
.ed-par-sec[data-sec=app-retouches] .ed-actions{display:flex;justify-content:flex-end}
.ed-app-css{min-height:140px;resize:vertical}
.ed-app-css[aria-invalid=true]{border-color:var(--md-error)}
.ed-par-sec .ed-par-inter{display:flex;align-items:center;gap:2px;margin:4px 0 -6px}
.ed-app-vars{list-style:none;margin:0;padding:4px;display:flex;flex-direction:column;gap:2px;max-height:340px;overflow:auto;border:1px solid var(--md-outline-variant);border-radius:12px}
.ed-app-var{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:4px 8px;box-sizing:border-box;border:none;border-radius:8px;background:none;color:var(--md-on-surface);
  cursor:pointer;text-align:left;font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-app-var:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ed-app-var:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-app-pastille{width:20px;height:20px;border-radius:50%;flex:none;box-sizing:border-box;background:var(--c,transparent);border:1px solid var(--md-outline-variant)}
.ed-app-pastille.ic{--mdc-icon-size:18px;border:none;background:none;color:var(--md-on-surface-variant);display:grid;place-items:center}
.ed-app-var .n{flex:1;min-width:0;display:flex;flex-direction:column}
.ed-app-var code{font:400 12px/16px ui-monospace,"Roboto Mono",Consolas,monospace}
.ed-app-var .n small{color:var(--md-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-app-var .v{max-width:38%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--md-on-surface-variant)}
ha-card.ed-etroit .ed-app-themes{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}
ha-card.ed-etroit .ed-app-mini{height:44px}
ha-card.ed-etroit .ed-app-var .v{max-width:30%}
/* ⚙ Paramètres › À propos (classe-a-propos.js) */
.ed-apropos{display:flex;flex-direction:column;gap:14px}
.ed-ap-tete{display:flex;align-items:center;gap:14px}.ed-ap-tete>ha-icon{--mdc-icon-size:40px;color:var(--md-primary)}
.ed-ap-tete div{display:flex;flex-direction:column}.ed-ap-tete b{font:500 20px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-ap-tete small{color:var(--md-on-surface-variant)}
.ed-ap-etat{margin:0;display:flex;align-items:center;gap:8px;color:var(--md-on-surface-variant)}
.ed-ap-etat.nouveau{color:var(--md-primary);font-weight:500}.ed-ap-etat.ok ha-icon{color:#188038}
.ed-ap-avis{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.ed-ap-avis input{margin-top:3px}
.ed-ap-liens{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:4px}
.ed-ap-liens .ed-btn{justify-content:flex-start}
.ed-ap-etoile{display:flex;align-items:center;gap:8px;border:1px solid var(--md-outline-variant);border-radius:12px;background:none;color:var(--md-on-surface);
  padding:10px 14px;cursor:pointer;font:inherit;text-align:left}.ed-ap-etoile ha-icon{color:#f5b400}.ed-ap-etoile:hover{border-color:var(--md-primary)}
.ed-ap-note{margin:0;color:var(--md-on-surface-variant);font-size:12px}
` // @assemblage
