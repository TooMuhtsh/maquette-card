// CSS : étages (L1) — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
/* sélecteur d'étages : ascenseur (pile en haut à droite du plan, loin du zoom et de la vitrine du bas) ou barre d'onglets MD3 en haut de la carte */
.etages[hidden]{display:none!important} /* l'emporte sur .ascenseur / .onglets (display:flex) */
.etages .et-l{display:flex}
.etages button{position:relative;border:none;cursor:pointer;font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);color:var(--md-on-surface-variant);background:none}
.etages button:focus-visible{outline:2px solid var(--md-primary);outline-offset:2px}
.etages ha-icon{--mdc-icon-size:20px}
.etages.ascenseur{position:absolute;right:16px;top:16px;z-index:3;display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px;border-radius:16px;
  background:var(--md-surface-container-high);box-shadow:0 1px 3px #0003}
.etages.ascenseur.serre{right:64px} /* plan trop bas pour l'ascenseur et le zoom empilés : à gauche de la colonne du zoom */
.etages.ascenseur .et-l{flex-direction:column;gap:4px}
.etages.ascenseur button{width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
.etages.ascenseur button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.etages.ascenseur .et-b.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.etages.onglets{display:flex;align-items:stretch;gap:4px;margin:0 0 12px;border-bottom:1px solid var(--md-outline-variant);flex:none;overflow-x:auto;scrollbar-width:none}
.etages.onglets::-webkit-scrollbar{display:none}
.etages.onglets .et-l{flex:1;gap:0}
.etages.onglets button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 16px;flex:none;white-space:nowrap}
.etages.onglets button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.etages.onglets .et-b.on{color:var(--md-primary)}
.etages.onglets .et-b.on::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--md-primary)}
.etages.onglets .et-gerer{color:var(--md-primary)}
/* pastille d'alerte d'un étage (rouge : ouverture, alerte ; ambre : à surveiller), réservée sur chaque bouton */
.et-pastille{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;box-shadow:0 0 0 2px var(--md-surface-container-high);display:none}
.et-pastille.rouge{display:block;background:var(--md-error)}
.et-pastille.ambre{display:block;background:#f9a825}
.onglets .et-pastille{top:10px;right:6px}
/* petit plan (téléphone) : ascenseur plus compact */
@container (max-width:480px){.etages.ascenseur{right:8px;top:8px;padding:2px;gap:2px;border-radius:12px}.etages.ascenseur.serre{right:60px}
  .etages.ascenseur .et-l{gap:2px}.etages.ascenseur button{width:32px;height:32px;border-radius:10px}.etages.ascenseur .et-pastille{top:3px;right:3px}}
@media (prefers-reduced-motion:reduce){.etages button{transition:none}}
` // @assemblage
