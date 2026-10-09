// CSS : catalogue des widgets, récapitulatif d'import, ateliers (ouvertures, meubles) — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
/* « Ajouter un widget » et atelier : titre + bouton « Créer un widget », sections par catégorie ; plein écran sur téléphone */
.ed-titre-ligne{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 16px}
.ed-titre-ligne h2{margin:0;flex:1;min-width:0}
.ed-dialogue .ed-ou{margin:-8px 0 12px}
.ed-dialogue.ed-cat-widgets{width:min(880px,100%);height:min(760px,calc(100vh - 32px))}
.ed-cat-widgets .ed-cat,.ed-dialogue .ed-cat:has(>section){display:flex;flex-direction:column}
.ed-cat>section{flex:none}
.ed-espace{flex:1}
.ed-dialogue footer{align-items:center}
/* récapitulatif de sécurité d'un import : sections (services, commandes, liens, retiré), une liste par section */
.ed-recap .ed-cat{display:flex;flex-direction:column;gap:12px}
.ed-recap-s h4{display:flex;align-items:center;gap:8px;margin:0 0 6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface)}
.ed-recap-s h4 ha-icon{--mdc-icon-size:20px;color:var(--md-primary);flex:none}
.ed-recap-s ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.ed-recap-s li{display:flex;flex-wrap:wrap;align-items:center;gap:2px 12px;padding:8px 12px;border-radius:12px;background:var(--md-surface-container);min-width:0;overflow-wrap:anywhere}
.ed-recap-s li>span:first-child{flex:1 1 auto;min-width:0}
.ed-recap-s li small{flex:1 1 100%;color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.ed-recap-s p{margin:0 0 6px;color:var(--md-on-surface-variant)}
.ed-recap code{font:500 12px/16px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--md-on-surface);overflow-wrap:anywhere}
.ed-sensible{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:8px;background:var(--md-error-container);
  color:var(--md-on-error-container);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap}
.ed-sensible ha-icon{--mdc-icon-size:16px}
.ed-choix-parmi .ed-resultats h4{margin:12px 12px 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-choix-parmi header .ed-aide{margin-top:-8px}
.ed-atelier header .ed-aide{margin-top:-8px}
.ed-atelier .ed-cat{padding-bottom:16px}
.ed-atelier.large{width:min(880px,100%)}
.ed-at-corps{display:grid;grid-template-columns:minmax(0,1fr) 320px;grid-template-areas:"form apercu";gap:24px;align-items:start}
.ed-at-corps>*{min-width:0}
.ed-at-apercu{position:sticky;top:0;grid-area:apercu}
.ed-at-form{grid-area:form}
.ed-at-apercu h4{margin:4px 0 8px}
.ed-at-w{pointer-events:none;border-radius:16px;background:var(--md-surface);padding:12px;box-sizing:border-box}
.ed-at-w .w{margin:0}
.ed-at-form{display:flex;flex-direction:column;gap:4px}
.ed-at-form .ed-champ{margin:0 0 8px}
.ed-at-form .ed-inter{margin:4px 0}
.ed-ligne.ed-at-rang{display:flex;align-items:center}
.ed-at-rang .ed-champ{flex:1;margin:0}
ha-card.ed-etroit .ed-plein-tel{padding:0;place-items:stretch}
ha-card.ed-etroit .ed-plein-tel>.ed-dialogue{width:100vw;height:100vh;height:100dvh;max-height:none;border-radius:0}
ha-card.ed-etroit .ed-plein-tel header{padding:16px 16px 8px}
ha-card.ed-etroit .ed-plein-tel .ed-cat{padding:0 16px 8px}
ha-card.ed-etroit .ed-plein-tel footer{padding:8px 16px 12px}
ha-card.ed-etroit .ed-plein-tel h2{font-size:22px;line-height:28px}
ha-card.ed-etroit .ed-cat-filtres.ed-cat-defile{flex-wrap:nowrap;overflow-x:auto}
.ed-at-form .ed-seg{display:flex}
.ed-at-form .ed-seg button{flex:1}
.ed-creer-bas{display:none}
ha-card.ed-etroit .ed-titre-ligne .ed-btn{display:none}
ha-card.ed-etroit .ed-creer-bas{display:inline-flex}
ha-card.ed-etroit .ed-at-w{max-width:280px;margin:0 auto}
ha-card.ed-etroit .ed-at-corps{grid-template-columns:minmax(0,1fr);grid-template-areas:"apercu" "form";gap:12px}
ha-card.ed-etroit .ed-at-apercu{position:static}
/* « Créer une ouverture », « Créer un meuble » : aperçus à l'échelle, primitives, sections ; suggestions d'une ouverture */
.ed-at-w svg.ed-ap-ouv,.ed-at-w svg.ed-ap-meuble{display:block;width:100%;height:auto;max-height:280px}
.ed-ap-ouv text{font:400 16px var(--ha-font-family-body,Roboto,sans-serif);fill:var(--md-on-surface-variant)}
.ed-ap-int{fill:color-mix(in srgb,var(--md-primary) 6%,transparent)}
.ed-ap-cote{fill:none;stroke:var(--md-on-surface-variant);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-at-w text.ed-ap-cote-t{font:500 14px var(--ha-font-family-body,Roboto,sans-serif);fill:var(--md-on-surface-variant)}
.ed-ap-ouv .ed-ap-cote-t{text-anchor:middle}
.ed-ap-meuble .meuble *{fill:color-mix(in srgb,var(--md-on-surface) 6%,transparent);stroke:var(--md-on-surface-variant);stroke-width:1.4px;vector-effect:non-scaling-stroke}
.ed-ap-meuble .meuble .ligne,.ed-ap-meuble .meuble .vide,.ed-apercu .meuble .forme .vide{fill:none}
.ed-ap-meuble .meuble .tirets{stroke-dasharray:5 4}
.ed-ap-meuble .meuble .forme.colore *,.ed-apercu .meuble .forme.colore *{stroke:color-mix(in srgb,var(--mb-teinte) 75%,var(--md-on-surface-variant))}
.ed-ap-meuble .meuble .forme.colore :not(.ligne):not(.vide),.ed-apercu .meuble .forme.colore :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-teinte) 30%,transparent)}
.ed-at-titre,.ed-at-groupe{display:flex;align-items:center;gap:4px;margin:12px 0 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-at-groupe{margin:4px 0 8px}
.ed-cat .ed-grille+.ed-at-groupe{margin-top:16px}
.ed-at-capteur{margin:-4px 0 4px}
.ed-at-capteur .ed-champ>label:empty{display:none}
.ed-prim{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--md-outline-variant);border-radius:12px;margin:0 0 8px}
.ed-prim-tete{display:flex;align-items:center;gap:6px}
.ed-prim-tete>ha-icon{--mdc-icon-size:20px;color:var(--md-primary);flex:none}
.ed-prim-tete select{flex:1;min-width:0;height:36px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-prim-tete .ib{flex:none}
.ed-ligne.quatre{grid-template-columns:repeat(4,minmax(0,1fr))}
.ed-prim-ajout{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}
.ed-prim-ajout .ed-btn{height:32px;padding:0 12px 0 8px;font-size:13px}
/* atelier des meubles : aperçu manipulable (sélection, poignées, sommets, guides), plus grand ; collant en haut sur téléphone */
.ed-atelier.ed-at-mb{width:min(1040px,100%)}
.ed-at-mb .ed-at-corps{grid-template-columns:minmax(0,1fr) minmax(0,460px)}
.ed-at-mb .ed-at-w svg.ed-ap-meuble{max-height:min(460px,calc(100vh - 300px))}
.ed-atelier.ed-at-mb.ed-at-grand{width:min(1400px,100%);height:calc(100vh - 32px);max-height:none}
.ed-at-mb.ed-at-grand .ed-at-corps{grid-template-columns:minmax(0,1fr) minmax(0,min(820px,60vw))}
.ed-at-mb.ed-at-grand .ed-at-w svg.ed-ap-meuble{max-height:calc(100vh - 310px)}
.ed-at-ap-tete{display:flex;align-items:center;gap:4px;min-height:40px;margin:0 0 4px;padding-top:4px}
.ed-at-ap-tete h4{flex:1;margin:0}
.ed-at-outils{display:flex;gap:4px}
.ed-at-astuce{margin:8px 4px 0;color:var(--md-on-surface-variant);font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-at-w.ed-at-manip{pointer-events:auto;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.ed-at-manip svg.ed-ap-meuble{outline:none;border-radius:8px}
.ed-clavier .ed-at-manip svg.ed-ap-meuble:focus{outline:2px solid var(--md-primary);outline-offset:4px}
.ed-ap-ui .limite{fill:none;stroke:var(--md-outline);stroke-width:1px;stroke-dasharray:2 4;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-ui .cible{fill:none;stroke:none;cursor:move;touch-action:none;stroke-linecap:round;stroke-linejoin:round}
.ed-ap-ui .cadre{fill:none;stroke:var(--md-primary);stroke-width:1.5px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-ui .guide{fill:none;stroke:#e91e63;stroke-width:1px;vector-effect:non-scaling-stroke;pointer-events:none}
.ed-ap-h,.ed-ap-plus{cursor:pointer;touch-action:none;outline:none}
.ed-ap-h .zone,.ed-ap-plus .zone{fill:transparent;stroke:none}
.ed-ap-h .vis{fill:var(--md-surface);stroke:var(--md-primary);stroke-width:2px;vector-effect:non-scaling-stroke}
.ed-ap-h.on .vis{fill:var(--md-primary)}
.ed-ap-plus .vis{fill:var(--md-primary);stroke:var(--md-surface);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-ap-plus path{fill:none;stroke:var(--md-surface);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.ed-clavier .ed-ap-h:focus .zone,.ed-clavier .ed-ap-plus:focus .zone{fill:color-mix(in srgb,var(--md-primary) 16%,transparent);stroke:var(--md-primary);stroke-width:2px;vector-effect:non-scaling-stroke}
.ed-prim.sel{border-color:var(--md-primary);box-shadow:0 0 0 1px var(--md-primary);background:color-mix(in srgb,var(--md-primary) 6%,transparent)}
ha-card.ed-etroit .ed-at-mb .ed-at-corps{display:flex;flex-direction:column;align-items:stretch;gap:12px}
ha-card.ed-etroit .ed-at-mb .ed-at-apercu{position:sticky;top:0;z-index:2;background:var(--md-surface-container-high);margin:0 -16px;padding:0 16px 8px;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-at-mb .ed-at-w{max-width:none;padding:6px}
ha-card.ed-etroit .ed-at-mb .ed-at-w svg.ed-ap-meuble{max-height:30vh;max-height:30dvh}
ha-card.ed-etroit .ed-at-mb.ed-at-grand .ed-at-w svg.ed-ap-meuble{max-height:52vh;max-height:52dvh}
ha-card.ed-etroit .ed-at-mb .ed-at-ap-tete{min-height:36px;margin:0}
ha-card.ed-etroit .ed-at-mb .ed-at-astuce{display:none}
ha-card.ed-etroit .ed-at-mb .ed-prim{scroll-margin-top:calc(var(--ed-ap-h,0px) + 8px)}
.ed-couleurs button.aucune{background:linear-gradient(to top right,transparent calc(50% - 1px),var(--md-outline) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px));border:1px solid var(--md-outline)}
.ed-tuile .modif{position:absolute;top:4px;right:40px;width:32px;height:32px}
.ed-tuile-creer{border-style:dashed;background:none}
.ed-btn.ed-plein{width:100%;justify-content:center}
.ed-suggs{display:flex;flex-direction:column;gap:6px}
.ed-sugg{display:flex;align-items:center;gap:8px;min-height:40px;padding:2px 2px 2px 12px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-sugg>ha-icon{--mdc-icon-size:18px;flex:none}
.ed-sugg>span{flex:1;min-width:0;overflow-wrap:anywhere}
.ed-sugg .ed-btn.texte{height:32px;padding:0 8px;flex:none;color:var(--md-on-secondary-container);font-weight:500}
.ed-sugg .ib{width:32px;height:32px;flex:none;color:var(--md-on-secondary-container)}
.ed-cat{overflow:auto;padding:0 24px 8px;flex:1}
.ed-code{width:100%;box-sizing:border-box;min-height:min(420px,50vh);resize:vertical;border-radius:12px;border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface);
  padding:12px;font:400 12px/18px ui-monospace,"Roboto Mono",Consolas,monospace;tab-size:2;white-space:pre;outline:none}
.ed-code:focus{border-color:var(--md-primary)}
.ed-erreur{margin-top:8px;color:var(--md-error);font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-dialogue .ed-resultats{padding-bottom:0}
.ed-cat h4{margin:16px 0 8px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
.ed-tuile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:12px;border:1px solid var(--md-outline-variant);background:var(--md-surface-container);
  color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit;position:relative;min-height:84px;box-sizing:border-box}
.ed-tuile:hover{background:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface-container))}
.ed-tuile>ha-icon{color:var(--md-primary);--mdc-icon-size:24px}
.ed-tuile b{font-weight:500;line-height:20px}
.ed-tuile small{color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.ed-tuile .cotes{display:flex;gap:6px;margin-top:6px}
.ed-tuile .cotes span{height:28px;padding:0 10px;border-radius:14px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;gap:4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-tuile .cotes ha-icon{--mdc-icon-size:16px}
.ed-tuile .suppr{position:absolute;top:4px;right:4px;width:32px;height:32px}
.ed-sous{border:1px solid var(--md-outline-variant);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
.ed-sous .ed-entete{display:flex;align-items:center;justify-content:space-between;gap:8px;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-puces{display:flex;flex-wrap:wrap;gap:6px}
.ed-puces button{height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface-variant);cursor:pointer;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-puces button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
svg .ed-cadre{fill:color-mix(in srgb,var(--md-primary) 12%,transparent);stroke:var(--md-primary);stroke-dasharray:6 4;pointer-events:none}
.edition .zone.espace{cursor:grab}
svg .ed-cible{stroke:transparent;fill:none;cursor:pointer;pointer-events:stroke}
svg .ed-cible:hover{stroke:color-mix(in srgb,var(--md-primary) 25%,transparent)}
svg .ed-sel{fill:none;stroke:var(--md-primary);stroke-dasharray:10 6;pointer-events:none}
svg .ed-poly-sel{fill:color-mix(in srgb,var(--md-primary) 10%,transparent);stroke:var(--md-primary);stroke-dasharray:10 6;pointer-events:none}
svg .ed-poignee{fill:var(--md-surface);stroke:var(--md-primary);cursor:move}
svg .ed-milieu{fill:var(--md-primary);stroke:none;opacity:.55;cursor:copy}
svg .ed-trace{fill:none;stroke:var(--md-primary);stroke-dasharray:8 6;pointer-events:none}
svg .ed-trace-pt{fill:var(--md-primary);pointer-events:none}
svg .ed-curseur-pt{fill:none;stroke:var(--md-primary);pointer-events:none}
.edition .zone.dessin{cursor:crosshair}
.edition .zone.dessin .calque>*{pointer-events:none}
.edition .piece{cursor:pointer}
.ib.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-cqs{display:flex;flex-direction:column;margin:0 -8px}
.ed-cq{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 4px;border-radius:12px}
.ed-cq>ha-icon{color:var(--md-on-surface-variant);--mdc-icon-size:20px;flex:none}
.ed-cq .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-cq .n small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-cq.masque .n,.ed-cq.masque>ha-icon{opacity:.6}
.ed-cq.glisse{background:var(--md-secondary-container)}
.ed-cq-poignee{cursor:grab;touch-action:none;width:32px;height:40px}
.ed-cq-depot{height:3px;border-radius:2px;background:var(--md-primary);margin:-1px 8px}
.ed-apercu-fiche{display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;padding:4px 0 8px}
.ed-pers{display:flex;flex-direction:column;gap:4px}
.ed-pers-l{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);align-items:center;gap:8px;min-height:48px}
.ed-pers-l>span{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-pers-l>span>i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 12px/1 var(--ha-font-family-body,Roboto,sans-serif);font-style:normal;
  background:var(--md-primary);color:var(--text-primary-color,#fff)}
.ed-pers-l select{height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;min-width:0}
` // @assemblage
