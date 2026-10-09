// CSS : tablette, commandes, zoom, calques en édition, fiches, confirmation — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
const CSS_BARRE = `
ha-card{container-type:inline-size}
.barre{display:flex;align-items:center;gap:4px;margin:0 0 12px 4px;min-height:40px}
.barre .titre{margin:0;flex:1}
.barre[hidden]{display:none}
/* mode tablette : le plan centré dans la hauteur de l'écran (tablette en portrait) */
ha-card.tablette .vue{align-items:center}
.ib{width:40px;height:40px;border-radius:50%;border:none;background:none;color:var(--md-on-surface-variant);cursor:pointer;display:inline-grid;place-items:center;flex:none}
.ib ha-icon{--mdc-icon-size:22px}
.ib[hidden]{display:none}
ha-card.plein{display:flex;flex-direction:column;box-sizing:border-box}
.plein .barre,.plein .legende{flex:none}
.corps{display:flex;gap:16px;align-items:flex-start;justify-content:center;min-height:0}
.plein .corps{flex:1}
.vue{display:flex;gap:16px;align-items:flex-start;justify-content:center;min-height:0;min-width:0;flex:1 1 auto;align-self:stretch}
.corps.edition:not(.colonne)>.vue{flex:none;align-self:flex-start}
.corps.colonne,.corps.colonne>.vue{flex-direction:column;align-items:center}
.corps.colonne>.vue{width:100%;flex:none}
.vue>.col{flex:0 0 320px;align-self:stretch;min-height:0;overflow:auto;box-sizing:border-box;scrollbar-width:none}
.vue>.col::-webkit-scrollbar{display:none}
.col-in{display:flex;flex-direction:column;gap:12px}
.vue>.col[hidden]{display:none}
.col>.widgets{display:flex;flex-direction:column;gap:12px}
.col>.widgets:empty{display:none}
.corps.colonne .vue>.col{flex:1 1 auto;width:100%;max-width:720px}
ha-card:not(.plein) .corps.colonne .vue>.col{flex:none;overflow:visible}
.w{background:var(--md-surface-container);border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;color:var(--md-on-surface);
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);position:relative}
.w.sel{outline:3px solid var(--md-primary);outline-offset:2px}
.w-ajout{display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;border-radius:16px;border:2px dashed var(--md-outline-variant);background:none;
  color:var(--md-primary);cursor:pointer;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.w-ajout:hover{background:color-mix(in srgb,var(--md-primary) 8%,transparent)}
.edition .w{cursor:pointer;user-select:none;-webkit-user-select:none}
.w.w-sep{background:none;padding:2px 4px;flex-direction:row;align-items:center;gap:12px;min-height:0;color:var(--md-on-surface-variant);
  font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.w.w-sep::after{content:"";flex:1;border-top:1px solid var(--md-outline-variant)}
.w.w-sep.vide{gap:0}
.edition .w.w-sep{min-height:24px}
.w.glisse{opacity:.35}
.w-fantome{position:fixed;z-index:20;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;transform:rotate(1.5deg)}
.w-depot{height:4px;border-radius:2px;background:var(--md-primary);margin:-8px 0}
.w-tete{display:flex;align-items:center;gap:8px;color:var(--md-on-surface-variant);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.w-tete ha-icon{--mdc-icon-size:18px;color:var(--w-couleur,var(--md-primary))}
.w-tete .d{margin-left:auto;font-weight:400;font-size:12px}
.w-grand{display:flex;align-items:baseline;gap:6px;font:400 36px/44px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums;cursor:pointer}
.w-grand small{font-size:16px;line-height:24px;color:var(--md-on-surface-variant)}
.w-lignes{display:flex;flex-direction:column}
.w-climat{display:grid;grid-template-columns:minmax(4.5em,1fr) auto auto;gap:2px 10px;align-items:center}
.w-climat .n{min-width:0;overflow-wrap:anywhere;line-height:1.2;color:var(--md-on-surface-variant);min-height:32px;display:flex;align-items:center}
.w-climat .m{display:inline-flex;align-items:center;justify-content:flex-end;gap:3px;font-variant-numeric:tabular-nums;white-space:nowrap;cursor:pointer}
.w-climat .m ha-icon{--mdc-icon-size:16px;color:var(--md-on-surface-variant)}
.w-climat .m small{color:var(--md-on-surface-variant);font-size:.78em;min-width:2.6em;text-align:right}
.w-climat .m.monte ha-icon{color:#e8710a}.w-climat .m.descend ha-icon{color:#1a73e8}
.w-climat .m.alerte,.w-climat .m.alerte ha-icon,.w-climat .m.alerte small{color:var(--md-error)}
.w-climat .m.vide{color:var(--md-on-surface-variant)}
.w-climat .n.moy{color:var(--md-on-surface);font-weight:500}
.w-th{display:grid;grid-template-columns:1fr auto;gap:4px 16px;align-items:center}
.w-th small{display:block;color:var(--md-on-surface-variant);font-size:12px;font-weight:400}
.w-th b{font-size:28px;line-height:34px;font-weight:400;font-variant-numeric:tabular-nums}
.w-th b small{display:inline;font-size:14px}
.w-th .mes{cursor:pointer}
.w-th .cons{display:flex;align-items:center;gap:8px;text-align:center}
.w-th .th-b{width:40px;height:40px;border-radius:50%;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.w-th .th-b[aria-disabled="true"]{opacity:.4;pointer-events:none}
.w-th .mode{grid-column:1/-1}
.w-alerte{display:inline-flex;align-items:center;gap:2px;color:var(--md-error);font-weight:500}.w-alerte ha-icon{--mdc-icon-size:16px}
.w-ligne{display:flex;align-items:center;gap:12px;min-height:36px;cursor:pointer;border-radius:8px}
.w-ligne ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}
.w-ligne .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--md-on-surface-variant)}
.w-ligne .v{font-variant-numeric:tabular-nums;white-space:nowrap}
.w-ligne .bascule{transform:scale(.8);transform-origin:right center}
.w-courbe{width:100%;height:56px;display:block}
.w-courbe path.l{fill:none;stroke:var(--w-couleur,var(--md-primary));stroke-width:2;vector-effect:non-scaling-stroke}
.w-courbe path.a{fill:color-mix(in srgb,var(--w-couleur,var(--md-primary)) 18%,transparent);stroke:none}
.w-jauge{display:grid;place-items:center;position:relative;cursor:pointer}
.w-jauge svg{width:100%;max-width:220px;height:auto}
.w-jauge .val{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);text-align:center;font:400 32px/40px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums}
.w-jauge .val small{display:block;font-size:13px;line-height:18px;color:var(--md-on-surface-variant)}
.w-bornes{display:flex;justify-content:space-between;color:var(--md-on-surface-variant);font-size:12px;margin-top:-18px;padding:0 8%}
.pastilles{display:flex;flex-wrap:wrap;gap:8px}
.pastille{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:8px;font:500 13px/18px var(--ha-font-family-body,Roboto,sans-serif);
  background:var(--md-surface-container-high);color:var(--md-on-surface);cursor:pointer}
.pastille i{width:10px;height:10px;border-radius:50%;background:var(--p-couleur,var(--md-outline));box-shadow:0 0 0 1px #0003 inset}
.pastille.forte{background:var(--p-couleur);color:var(--p-texte,#fff)}
.w-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.w-table th{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.4px;color:var(--md-on-surface-variant);text-align:right;padding:4px 0 6px 8px;white-space:nowrap}
.w-table th:first-child,.w-table td:first-child{text-align:left;padding-left:0}
.w-table td{padding:7px 0 7px 8px;border-top:1px solid var(--md-outline-variant);text-align:right;white-space:nowrap}
.w-table td:first-child{color:var(--md-on-surface-variant)}
.w-table td.e{cursor:pointer}
.w-table .vide{color:var(--md-outline)}
.w-note{color:var(--md-on-surface-variant);font-size:12px;line-height:16px}
.w-note.w-fiche{display:flex;align-items:center;gap:8px;font-size:13px;line-height:18px;padding:0 4px}
.w-note.w-fiche ha-icon{--mdc-icon-size:18px;color:var(--md-primary);flex:none}
/* commande d'une cover : état, position (indicateur linéaire MD3), trois boutons tonals ; armé = rouge « Confirmer ? » */
.w-cmd{display:flex;flex-direction:column;gap:10px}
.w-cmd .w-grand{font-size:28px;line-height:36px}
.w-cmd .w-grand small ha-icon{--mdc-icon-size:18px;color:var(--md-on-surface-variant)}
.w-pos{height:4px;border-radius:2px;background:var(--md-secondary-container);overflow:hidden}
.w-pos i{display:block;height:100%;border-radius:2px;background:var(--w-couleur,var(--md-primary));transition:width .6s var(--md-sys-motion)}
.w-cmd-btns{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px}
.w-serrure .w-cmd-btns .cta{padding:0 10px;gap:6px}
.w-grand.alerte,.w-ligne .v.alerte{color:var(--md-error)}
.w-ligne .v.alerte{font-weight:500}
.w-activer{flex:none;height:28px;padding:0 12px;border-radius:14px;border:none;background:var(--md-secondary-container);color:var(--md-on-secondary-container);cursor:pointer;
  font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap}
.w-activer:hover{background:color-mix(in srgb,var(--md-on-secondary-container) 8%,var(--md-secondary-container))}
.w-activer.fait{background:var(--md-primary);color:var(--text-primary-color,#fff)}
.w-activer[aria-disabled=true]{opacity:.38;cursor:default}
.w-cmd-btns .cta{justify-content:center;padding:0 12px;min-width:0;white-space:nowrap}
.w-cmd-btns .cta[aria-disabled=true]{opacity:.38;cursor:default}
.w-cmd-btns .cta[aria-disabled=true]::after{display:none}
.w-note.w-err{color:var(--md-error)}
.w-ve{display:flex;align-items:center;gap:16px}
.w-ve .anneau{width:96px;height:96px;flex:none;position:relative;cursor:pointer}
.w-ve .anneau svg{width:100%;height:100%;transform:rotate(-90deg)}
.w-ve .anneau b{position:absolute;inset:0;display:grid;place-items:center;font:500 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.w-ve .etat{display:flex;flex-direction:column;gap:6px;min-width:0}
.edition .calque>*{cursor:grab}
.edition .txt{pointer-events:auto}
.edition .etq.dehors{cursor:grab}
.calque>.sel{outline:3px solid var(--md-primary);outline-offset:3px}
.zone{position:relative;overflow:hidden;border-radius:8px;touch-action:pan-y}
.zone.zoome{touch-action:none;cursor:grab}
.zone.zoome.panne{cursor:grabbing}
.zoom{position:absolute;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;z-index:2}
.zoom button{width:40px;height:40px;border-radius:12px;border:none;cursor:pointer;display:grid;place-items:center;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 1px 3px #0004,0 4px 8px 3px #0001}
.zoom button ha-icon{--mdc-icon-size:22px}
.zoom button[hidden]{display:none}
/* souris seule : les boutons de zoom n'apparaissent que quand le curseur est sur le plan (ou au clavier) ; toujours visibles dès qu'un écran tactile est présent (portable tactile avec souris) */
@media (hover:hover) and (pointer:fine) and (not (any-pointer:coarse)){.zoom{opacity:0;pointer-events:none;transition:opacity .2s var(--md-sys-motion)}
  .plan:hover .zoom,.zoom:focus-within{opacity:1;pointer-events:auto}}
@media (prefers-reduced-motion:reduce){.zoom{transition:none}}
/* calques en édition : masqué = en transparence et non cliquable, verrouillé = transparent au clic ; élément masqué en vue = en transparence */
.edition .c-masque,.edition .e-masque{opacity:.25}
.edition .zone svg .cq.c-masque,.edition .zone svg .cq.c-masque *,.edition .zone svg .cq.c-verrou,.edition .zone svg .cq.c-verrou *,
  .edition .calque>.c-masque,.edition .calque>.c-verrou{pointer-events:none!important}
.menu-cq{position:absolute;right:52px;bottom:0;min-width:220px;max-height:min(360px,70vh);overflow:auto;padding:8px 0;border-radius:4px;background:var(--md-surface-container);
  color:var(--md-on-surface);box-shadow:0 2px 6px 2px #0002,0 1px 2px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);z-index:3}
.menu-cq .t{padding:4px 16px 8px;color:var(--md-on-surface-variant);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase}
.menu-cq label{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px 0 12px;cursor:pointer;white-space:nowrap}
.menu-cq label:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.menu-cq input{width:18px;height:18px;margin:0;accent-color:var(--md-primary);flex:none}
.menu-cq ha-icon{--mdc-icon-size:20px;color:var(--md-on-surface-variant);flex:none}
.menu-cq label:has(input:not(:checked)) span{color:var(--md-on-surface-variant)}
.voile{fill:var(--md-surface);opacity:.78;cursor:zoom-out}
.calque>.hors{opacity:.15;pointer-events:none}
.retour{cursor:pointer;margin-right:4px}
.retour[hidden]{display:none}
.barre .fil{color:var(--md-on-surface-variant);font-weight:400}
.fiche{border-radius:16px;background:var(--md-surface-container);padding:8px 0}
.fiche[hidden]{display:none}
.fiche header{display:flex;align-items:baseline;gap:12px;padding:8px 16px 4px;flex-wrap:wrap}
.fiche header b{font:500 16px/24px var(--ha-font-family-body,Roboto,sans-serif)}
.fiche header span{color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums}
.fiche h4{margin:12px 16px 0;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ligne{display:flex;align-items:center;gap:16px;width:100%;min-height:56px;padding:8px 16px;border:none;background:none;color:var(--md-on-surface);
  text-align:left;cursor:pointer;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);box-sizing:border-box}
.ligne .ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--md-secondary-container);color:var(--md-on-secondary-container);flex:none}
.ligne .ic.on{background:var(--pt-couleur);color:#fff}
.ligne .ic.on.clair{color:#2b2000}
.ligne .ic.alerte{background:var(--md-error-container);color:var(--md-on-error-container)}
.ligne .n{flex:1;min-width:0}
.ligne .n span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;line-height:24px}
.ligne .n small{color:var(--md-on-surface-variant)}
.ligne .n span.deux{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.fiche .actions .cta{padding:0 14px 0 10px}
.bascule{appearance:none;width:52px;height:32px;border-radius:16px;border:2px solid var(--md-outline);background:var(--md-surface-container-high);position:relative;cursor:pointer;flex:none;margin:0}
.bascule::before{content:"";position:absolute;width:16px;height:16px;border-radius:50%;background:var(--md-outline);top:6px;left:6px;transition:all .2s var(--md-sys-motion)}
.bascule:checked{background:var(--md-primary);border-color:var(--md-primary)}
.bascule:checked::before{width:24px;height:24px;top:2px;left:22px;background:var(--text-primary-color,#fff)}
.fiche .vide{padding:8px 16px 12px;color:var(--md-on-surface-variant)}
.actions{display:flex;flex-wrap:wrap;gap:8px;padding:8px 16px 4px}
.cta{height:40px;padding:0 20px 0 16px;border-radius:20px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.cta ha-icon{--mdc-icon-size:18px}
.cta.plein{background:var(--md-primary);color:var(--text-primary-color,#fff)}
.cta.confirmer{background:var(--md-error);color:#fff}
.cta.fait{background:#188038;color:#fff}
/* mini-fiche d'un meuble connecté : fenêtre MD3 sur PC, feuille du bas au téléphone */
dialog.mf{border:none;padding:0;border-radius:28px;width:min(420px,calc(100vw - 32px));max-height:min(92vh,calc(100vh - 32px));overflow:hidden;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
/* PC : plus large avec 2 widgets (deux colonnes) ou 3 et plus (trois colonnes), le défilement ne vient qu'en dernier recours */
dialog.mf.l2{width:min(760px,calc(100vw - 48px))}
dialog.mf.l3{width:min(1120px,calc(100vw - 48px))}
dialog.mf::backdrop{background:#0008}
dialog.mf[open]{animation:mf-entree .2s var(--md-sys-motion)}
@keyframes mf-entree{from{opacity:0;transform:translateY(12px)}}
.mf-in{display:flex;flex-direction:column;max-height:inherit}
.mf header{display:flex;align-items:center;gap:12px;padding:20px 12px 12px 20px;flex:none}
.mf header .ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.mf header .ic.on{background:var(--mb-couleur,var(--md-primary));color:var(--text-primary-color,#fff)}
.mf header .ic.on.clair{color:#2b2000}
.mf header .ic.alerte{background:var(--md-error-container);color:var(--md-on-error-container)}
.mf header .n{flex:1;min-width:0}
.mf h2{margin:0;font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif);overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere}
.mf .etat{display:block;color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums}
.mf-protege{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 20px 8px;padding:8px 12px;border-radius:12px;background:var(--md-surface-container);color:var(--md-on-surface-variant);font-size:13px}
.mf-protege ha-icon{--mdc-icon-size:18px;color:var(--md-primary)}
.mf-protege span{flex:1}
.mf-protege .cta{padding:0 16px 0 12px;height:32px}
.mf-w{overflow:auto;padding:4px 16px 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));align-items:start;gap:12px;min-height:0}
.mf-w>.w-sep,.mf-w>.w-note{grid-column:1/-1}
.mf-w:empty{display:none}
.mf-w{padding-bottom:20px}
@media (max-width:600px){dialog.mf,dialog.mf.l2,dialog.mf.l3{width:100%;max-width:100%;margin:auto 0 0;border-radius:28px 28px 0 0;max-height:85vh}
  @keyframes mf-entree{from{transform:translateY(40%)}}
  .mf-in::before{content:"";display:block;width:32px;height:4px;border-radius:2px;margin:12px auto -8px;background:var(--md-on-surface-variant);opacity:.4}}
@media (prefers-reduced-motion:reduce){dialog.mf[open]{animation:none}}
/* confirmation d'un service sensible : dialogue de base MD3 (icône, titre, texte, deux boutons), centré sur PC comme au téléphone */
dialog.conf{border:none;padding:24px;border-radius:28px;width:min(400px,calc(100vw - 48px));box-sizing:border-box;background:var(--md-surface-container-high);color:var(--md-on-surface);
  box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
dialog.conf::backdrop{background:#0008}
dialog.conf[open]{animation:conf-entree .2s var(--md-sys-motion)}
@keyframes conf-entree{from{opacity:0;transform:scale(.96)}}
.conf-ic{display:block;margin:0 auto 16px;width:24px;--mdc-icon-size:24px;color:var(--md-error)}
.conf h2{margin:0 0 16px;text-align:center;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif);overflow-wrap:anywhere}
.conf p{margin:0 0 8px;color:var(--md-on-surface-variant);overflow-wrap:anywhere}
.conf code{font:500 13px/18px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--md-on-surface)}
.conf ul{margin:0 0 8px;padding:0;list-style:none;max-height:min(30vh,200px);overflow:auto}
.conf li{display:flex;flex-direction:column;padding:6px 12px;border-radius:12px;background:var(--md-surface-container);margin:0 0 4px;overflow-wrap:anywhere}
.conf li small{color:var(--md-on-surface-variant);font-size:12px}
.conf-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:24px}
.conf-actions button{height:40px;padding:0 24px;border-radius:20px;border:none;cursor:pointer;background:none;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px}
.conf-actions button:hover{background:color-mix(in srgb,var(--md-primary) 8%,transparent)}
.conf-actions .oui{background:var(--md-error);color:#fff}
.conf-actions .oui:hover{background:color-mix(in srgb,#fff 8%,var(--md-error))}
@media (prefers-reduced-motion:reduce){dialog.conf[open]{animation:none}}
`;

