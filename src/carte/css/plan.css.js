// CSS de la carte : couleurs MD3, puces, plan, ouvertures, étiquettes, pastilles, animations — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
const CSS = `
/* Material Design 3 : rôles de couleur dérivés du thème HA (primary-color, card-background-color, textes) */
:host{display:block;
  --md-primary:var(--primary-color,#03a9f4);
  --md-surface:var(--ha-card-background,var(--card-background-color,#fff));
  --md-on-surface:var(--primary-text-color,#1c1b1f);
  --md-on-surface-variant:var(--secondary-text-color,#49454f);
  --md-surface-container-low:color-mix(in srgb,var(--md-primary) 4%,var(--md-surface));
  --md-surface-container:color-mix(in srgb,var(--md-primary) 8%,var(--md-surface));
  --md-surface-container-high:color-mix(in srgb,var(--md-primary) 12%,var(--md-surface));
  --md-secondary-container:color-mix(in srgb,var(--md-primary) 18%,var(--md-surface));
  --md-on-secondary-container:var(--md-on-surface);
  --md-outline:color-mix(in srgb,var(--md-on-surface) 45%,transparent);
  --md-outline-variant:color-mix(in srgb,var(--md-on-surface) 14%,transparent);
  --md-error:var(--error-color,#b3261e);
  --md-error-container:color-mix(in srgb,var(--md-error) 16%,var(--md-surface));
  --md-on-error-container:color-mix(in srgb,var(--md-error) 75%,var(--md-on-surface));
  --plan-ferme:var(--md-primary);
  --plan-volet:color-mix(in srgb,#8d6e4a 85%,var(--md-on-surface));
  --plan-meuble:color-mix(in srgb,var(--md-surface) 40%,transparent);
  --plan-meuble-trait:color-mix(in srgb,var(--md-on-surface) 70%,transparent);
  --md-sys-motion:cubic-bezier(.2,0,0,1)}
ha-card{padding:16px;overflow:hidden;border-radius:var(--ha-card-border-radius,16px);background:var(--md-surface-container-low)}
.titre{font:500 22px/28px var(--ha-font-family-body,Roboto,system-ui,sans-serif);color:var(--md-on-surface);margin:0 4px 12px}
.tete{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}
.plein .tete{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;flex:none}
.plein .tete::-webkit-scrollbar{display:none}
.plein .chip{flex:none}
.chip{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 16px 0 8px;border-radius:8px;
  border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface-variant);
  font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.1px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.chip ha-icon{--mdc-icon-size:18px;color:var(--md-primary);flex:none}
/* texte trop long pour la largeur (téléphone : « 5 ouvertes : … ») : coupé proprement, la liste entière reste dans la bulle (title) ;
   1 px de marge intérieure compensée : le lissage de la dernière lettre n'est pas rogné quand le texte tient */
.chip>span{min-width:0;overflow:hidden;text-overflow:ellipsis;padding-right:1px;margin-right:-1px}
.chip b{color:var(--md-on-surface);font-weight:500}
.chip.alerte{background:var(--md-error-container);border-color:transparent;color:var(--md-on-error-container)}
.chip.alerte ha-icon,.chip.alerte b{color:var(--md-on-error-container)}
.chip[data-e]{cursor:pointer}
.edition .chip[data-puce]{cursor:pointer}
.chip.sel{outline:3px solid var(--md-primary);outline-offset:1px}
.chip.ajout{border-style:dashed;color:var(--md-primary);background:none;cursor:pointer;padding:0 12px 0 8px}
.tete[hidden]{display:none}
.zone svg .meuble{pointer-events:none}
.zone svg .meuble *{fill:var(--plan-meuble);stroke:var(--plan-meuble-trait);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.zone svg .meuble .ligne,.zone svg .meuble .vide{fill:none}
.zone svg .meuble .tirets{stroke-dasharray:5 4}
.zone svg .meuble .eau{fill:color-mix(in srgb,#4fc3f7 35%,transparent)}
.zone svg .meuble.zone .zone-fond{fill:color-mix(in srgb,var(--md-primary) 6%,transparent);stroke:color-mix(in srgb,var(--md-primary) 55%,transparent);stroke-width:1.5px}
/* meuble connecté (vue) : cliquable ; actif = contour et teinte d'accent ; entité indisponible = contour pointillé */
.zone svg .meuble .forme.colore *{stroke:color-mix(in srgb,var(--mb-teinte) 70%,var(--plan-meuble-trait))}
.zone svg .meuble .forme.colore :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-teinte) 30%,var(--plan-meuble))}
.zone svg .meuble.connecte{pointer-events:visiblePainted;cursor:pointer}
.zone svg .meuble.connecte.sans-clic{pointer-events:none;cursor:default}
.zone svg .meuble.connecte.teinte *{stroke:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 75%,var(--plan-meuble-trait))}
.zone svg .meuble.connecte.teinte :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 18%,var(--plan-meuble))}
.zone svg .meuble.connecte.actif *{stroke:var(--mb-couleur,var(--md-primary));stroke-width:2px}
.zone svg .meuble.connecte.actif :not(.ligne):not(.vide){fill:color-mix(in srgb,var(--mb-couleur,var(--md-primary)) 34%,var(--plan-meuble))}
.zone svg .meuble.connecte.indispo *{stroke:color-mix(in srgb,var(--md-error) 60%,transparent);stroke-dasharray:4 3}
.edition .zone svg .meuble{pointer-events:visiblePainted;cursor:grab}
.zone-etq{position:absolute;transform:translate(-50%,-50%);pointer-events:none;color:color-mix(in srgb,var(--md-primary) 80%,var(--md-on-surface));font:500 11px/14px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.4px;text-transform:uppercase;white-space:nowrap;opacity:.85}
.zone-etq.hors{opacity:.2}
.col.suite{-webkit-mask-image:linear-gradient(180deg,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(180deg,#000 calc(100% - 40px),transparent)}
.legende[hidden]{display:none}
.etat-vide{position:absolute;inset:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;pointer-events:none;z-index:3;
  color:var(--md-on-surface-variant);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.etat-vide>ha-icon{--mdc-icon-size:48px;color:var(--md-primary)}
.etat-vide h2{margin:0;color:var(--md-on-surface);font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.etat-vide p{margin:0;max-width:420px}
.etat-vide .actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px;pointer-events:auto}
.etat-vide button{height:40px;padding:0 20px 0 14px;white-space:nowrap;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);border:1px solid var(--md-outline);background:none;color:var(--md-primary)}
.etat-vide button.plein{background:var(--md-primary);color:var(--text-primary-color,#fff);border-color:transparent}
.etat-vide button ha-icon{--mdc-icon-size:18px}
.plan:has(.zone.dessin) .etat-vide{display:none}
.plan:has(.etat-vide) .zoom{display:none}
.plan{position:relative;flex:none;container-type:inline-size;border-radius:12px;background:var(--md-surface);padding:8px;box-sizing:border-box;max-width:100%}
.plan>.zone{position:relative}
svg{display:block;width:100%;height:auto;user-select:none}
.piece{stroke:none;transition:fill .6s var(--md-sys-motion)}
.piece.dehors{fill:var(--md-surface-container-high)}
.zone svg .piece.sous-zone{fill:color-mix(in srgb,var(--md-primary) 5%,transparent);stroke:color-mix(in srgb,var(--md-primary) 55%,transparent);stroke-width:1.5px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.edition .zone svg .piece.sous-zone{pointer-events:visiblePainted;cursor:pointer}
.calque>.zone-etq{pointer-events:none}
.edition .calque>.zone-etq.sz{pointer-events:auto;cursor:grab}
.murs{fill:none;stroke:var(--md-on-surface);stroke-width:9;stroke-linecap:square}
.limites{fill:none;stroke:var(--md-outline);stroke-width:5;stroke-linecap:square}
.ouv{cursor:pointer}
.ouv .cible{stroke:transparent;stroke-width:46}
.ouv:hover .cible{stroke:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ouv .trait{fill:none;stroke-linecap:butt;transition:stroke .3s var(--md-sys-motion),stroke-width .3s var(--md-sys-motion)}
.ouv.fenetre .trait{stroke:var(--plan-ferme);stroke-width:3.5}
.ouv.porte .trait,.ouv.portail .trait{stroke:var(--plan-ferme);stroke-width:7}
.ouv.sans{cursor:default}
/* baie : toute ouverture (sauf volet seul) interrompt le mur, comme sur un plan d'architecte (fond du plan, un peu plus large
   que le mur) ; sans capteur : traits fins (deux pour une fenêtre, un pour une porte ou un portail, avec ses jambages) */
.ouv .baie{fill:none;stroke:var(--md-surface);stroke-width:11;stroke-linecap:butt}
.ouv.sans .trait{stroke:var(--md-on-surface-variant);stroke-width:1.5}
.ouv.sans .jambage{fill:none;stroke:var(--md-on-surface-variant);stroke-width:2;stroke-linecap:butt}
/* battants (clé « ouvrant ») : feuille et arc fins, comme sur un plan d'architecte */
.ouv .battant{fill:none;stroke:var(--md-on-surface-variant);stroke-width:2;stroke-linecap:round;pointer-events:none}
.ouv .battant.arc{stroke-width:1.2;stroke-dasharray:5 4}
.ouv.a-fiche{cursor:pointer}
.ouv.a-fiche:focus{outline:none}
.ouv.a-fiche:focus-visible .cible{stroke:color-mix(in srgb,var(--md-primary) 40%,transparent)}
.ouv.sans-clic{cursor:default}
.ouv.ouvert .trait{stroke:var(--a-c,var(--md-error));stroke-width:12}
/* animations (bibliothèque) : a-<type> sur l'élément, --a-d durée, --a-i intensité, --a-c couleur ; jouées seulement dans l'état concerné */
.ouv.ouvert.a-pulsation .trait{animation:pulse var(--a-d,1.6s) ease-in-out infinite}
.ouv.ouvert.a-respiration .trait{animation:respire var(--a-d) ease-in-out infinite}
.ouv.ouvert.a-clignote .trait{animation:clignote var(--a-d) steps(1) infinite}
.ouv.ouvert.a-defilement .trait{stroke-dasharray:18 10;animation:defile var(--a-d) linear infinite}
.ouv.ouvert.a-halo .cible{stroke:var(--a-c,var(--md-error));stroke-linecap:round;animation:halo-svg var(--a-d) ease-in-out infinite}
.ouv.ouvert.a-onde .cible{stroke:var(--a-c,var(--md-error));stroke-linecap:round;animation:onde-svg var(--a-d) ease-out infinite}
.ouv.bouge .trait{stroke:var(--warning-color,#f4b400);stroke-width:10;stroke-dasharray:18 10;animation:defile .8s linear infinite}
.ouv.inconnu .trait{stroke:var(--disabled-text-color,#999);stroke-dasharray:6 6}
.volet{fill:none;stroke:var(--plan-volet);stroke-width:8;stroke-linecap:butt;transition:opacity .4s var(--md-sys-motion)}
.volet.bouge{stroke:var(--a-c,var(--warning-color,#f4b400))}
.volet.bouge.a-defilement,.volet.bouge.a-halo,.volet.bouge.a-onde{stroke-dasharray:14 8;animation:defile var(--a-d,.8s) linear infinite}
.volet.bouge.a-pulsation{animation:pulse var(--a-d) ease-in-out infinite}
.volet.bouge.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.volet.bouge.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.volet.bouge.monte{animation-direction:reverse}
.halo{transition:opacity .5s var(--md-sys-motion);pointer-events:none}
.cq.fondu{isolation:isolate}.cq.fondu .halo.lampe{mix-blend-mode:screen}.lum{pointer-events:none}.lum .lum-b{mix-blend-mode:screen}
.calque{position:absolute;inset:0;pointer-events:none;font:500 clamp(10px,1.2cqw,13px)/1.3 var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.1px}
.calque>*{position:absolute;transform:translate(-50%,-50%);pointer-events:auto}
.calque>.etq.evite{transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,0px)))}
button{position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}
button::after{content:"";position:absolute;inset:0;border-radius:inherit;background:currentColor;opacity:0;transition:opacity .15s var(--md-sys-motion);pointer-events:none}
button:hover::after{opacity:.08}
button:active::after{opacity:.12}
button:focus-visible{outline:3px solid var(--md-primary);outline-offset:2px}
.etq{background:color-mix(in srgb,var(--md-surface) 88%,transparent);border:none;border-radius:12px;padding:.35em .75em;
  color:var(--md-on-surface);font:inherit;text-align:center;cursor:pointer;box-shadow:0 1px 2px #0003,0 1px 3px 1px #0001}
.etq b{display:block;font-size:1.1em;font-weight:500}
.etq .val{color:var(--md-on-surface-variant);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap}
.etq .val:empty{display:none}
/* room_labels.name: false : nom retiré de l'étiquette (gardé pour les lecteurs d'écran ; estompé en édition) ; étiquette vide cachée en vue */
.etq b.cache{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.edition .etq b.cache{position:static;width:auto;height:auto;overflow:visible;clip:auto;white-space:normal;opacity:.4}
.corps:not(.edition) .etq:has(>b.cache):has(>.val:empty){display:none}
.etq.dehors{background:none;box-shadow:none;cursor:default}
.etq.dehors::after{display:none}
.etq.dehors b{color:var(--md-on-surface-variant)}
.pt{display:flex;align-items:center;gap:.35em;min-width:2.6em;height:2.6em;justify-content:center;padding:0 .55em;border:none;border-radius:999px;cursor:pointer;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:inherit;white-space:nowrap;
  box-shadow:0 1px 2px #0003,0 1px 3px 1px #0001;transition:background .3s var(--md-sys-motion),color .3s var(--md-sys-motion)}
.pt ha-icon{--mdc-icon-size:1.5em}
.pt .v{font-variant-numeric:tabular-nums}
.pt .v:empty{display:none}
.pt.actif{background:var(--pt-couleur);color:#fff}
.pt.actif.clair{color:#2b2000}
.pt.actif.a-pulsation,.pt.actif.a-defilement{animation:pulse var(--a-d,1.2s) ease-in-out infinite}
.pt.actif.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.pt.actif.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.pt.actif.a-halo{animation:halo-html var(--a-d) ease-in-out infinite}
.pt.actif.a-onde,.mb.actif.a-onde{overflow:visible}
.pt.actif.a-onde::before,.mb.actif.a-onde:not(.a-contour)::before{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid var(--a-c,var(--pt-couleur,var(--mb-couleur,var(--md-primary))));animation:onde-html var(--a-d) ease-out infinite;pointer-events:none}
.mb.actif.a-onde:not(.a-contour)::before{inset:6px;border-radius:50%}
.zone svg .meuble.connecte.actif.a-pulsation,.zone svg .meuble.connecte.actif.a-defilement{animation:pulse var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-respiration{animation:respire var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-clignote{animation:clignote var(--a-d) steps(1) infinite}
.zone svg .meuble.connecte.actif.a-halo *,.zone svg .meuble.connecte.actif.a-onde.a-contour *{animation:halo-mb var(--a-d) ease-in-out infinite}
.zone svg .meuble.connecte.actif.a-onde.a-contour *{animation-name:onde-mb;animation-timing-function:ease-out}
` // @assemblage
