// CSS de l'éditeur : barre, plan, panneaux, téléphone — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
const CSS = `
.ed-barre{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;margin:0 0 12px;padding:8px;border-radius:16px;background:var(--md-surface-container-high);flex:none;min-width:0}
.ed-defile{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:8px;overflow-x:auto;scrollbar-width:none}
.ed-defile::-webkit-scrollbar{display:none}
.ed-defile>*{flex:none}
.ed-defile.deborde{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent)}
.ed-fin{flex:none;display:flex;align-items:center;gap:4px}
ha-card.ed-etroit .ed-fin .lib,ha-card.ed-etroit .ed-fin .ed-info{display:none}
ha-card.ed-etroit .ed-fin .ed-btn{padding:0 10px;min-width:44px;justify-content:center}
.ed-bulle{position:absolute;z-index:4;pointer-events:none;padding:4px 8px;border-radius:8px;background:var(--md-inverse-surface,#313033);color:var(--md-inverse-on-surface,#f4eff4);font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 1px 3px #0005}
.ed-bulle[hidden]{display:none}
.ed-snack.erreur{background:var(--md-error);color:#fff}
svg .ed-rect{fill:color-mix(in srgb,var(--md-primary) 12%,transparent)}
.ed-terminer{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:5;box-shadow:0 2px 6px #0005}
/* plus de panneau latéral : téléphone, barre d'outils collante */
ha-card.ed-etroit{overflow:visible}
ha-card.ed-etroit .ed-barre{position:sticky;top:0;z-index:7;box-shadow:0 2px 6px #0004}
ha-card.ed-etroit .ed-terminer{position:fixed;bottom:136px;z-index:9}
ha-card.ed-etroit .ed-snack{bottom:56px}
.ed-avance{border-top:1px solid var(--md-outline-variant);padding-top:8px;display:flex;flex-direction:column;gap:14px}
.ed-avance>summary{cursor:pointer;color:var(--md-primary);font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);list-style:none;display:flex;align-items:center;gap:6px;min-height:32px}
.ed-avance>summary::before{content:"▸";transition:transform .2s}
.ed-avance[open]>summary::before{transform:rotate(90deg)}
.ed-avance:not([open]){gap:0}
.ed-avance.ed-elts{gap:4px;padding-top:4px}
.ed-champ.a-completer>label{color:#e8710a;font-weight:500}
.ed-champ.a-completer .ed-entite{border-color:#e8710a;box-shadow:0 0 0 1px #e8710a}
.ed-cat section[hidden],.ed-tuile[hidden]{display:none}
.ed-apercu{width:40px;height:40px;flex:none}
.ed-apercu .ed-sz{fill:color-mix(in srgb,var(--md-primary) 8%,transparent);stroke:var(--md-primary);stroke-width:1.6px;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.ed-apercu .meuble *{fill:color-mix(in srgb,var(--md-on-surface) 6%,transparent);stroke:var(--md-on-surface-variant);stroke-width:1.4px;vector-effect:non-scaling-stroke}
.ed-apercu .meuble .ligne,.ed-apercu .meuble .vide{fill:none}
.ed-apercu .meuble .tirets{stroke-dasharray:4 3}
.ed-dialogue header .ed-recherche{margin-top:4px}
.ed-coche{display:flex;align-items:center;gap:16px;min-height:56px;padding:8px 12px;border-radius:12px;cursor:pointer}
.ed-coche:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ed-coche input{width:20px;height:20px;accent-color:var(--md-primary);flex:none}
.ed-coche ha-icon{color:var(--md-on-surface-variant);flex:none}
.ed-coche small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-snack.erreur button{color:#fff}
.ed-versions{display:flex;flex-direction:column;gap:4px}
.ed-versions-bloc{margin-bottom:12px;border-top:none;padding-top:0}
.ed-versions small{color:var(--md-on-surface-variant)}
.ed-versions button{display:flex;justify-content:space-between;gap:12px;border:1px solid var(--md-outline-variant);border-radius:12px;background:none;color:var(--md-on-surface);padding:8px 12px;cursor:pointer;font:inherit;text-align:left}
.ed-groupe{display:inline-flex;align-items:center;gap:2px}
.ed-sep{width:1px;height:28px;background:var(--md-outline-variant);margin:0 4px}
.ed-seg{display:inline-flex;border:1px solid var(--md-outline);border-radius:20px;overflow:hidden;height:40px}
.ed-seg button{border:none;border-right:1px solid var(--md-outline);background:none;color:var(--md-on-surface);min-width:44px;padding:0 10px;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-seg button:last-child{border-right:none}
.ed-seg button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-seg ha-icon{--mdc-icon-size:20px}
.ed-seg.petit{height:32px;border-radius:16px}
.ed-seg.petit button{min-width:36px;padding:0 8px;font-size:13px}
.ed-btn{height:40px;padding:0 24px 0 16px;border-radius:20px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
  font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px;white-space:nowrap}
.ed-btn ha-icon{--mdc-icon-size:18px}
.ed-btn.plein{background:var(--md-primary);color:var(--text-primary-color,#fff)}
.ed-btn.tonal{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-btn.contour{background:none;border:1px solid var(--md-outline);color:var(--md-primary)}
.ed-btn.texte{background:none;color:var(--md-primary);padding:0 12px}
.ed-btn.danger{background:none;border:1px solid var(--md-error);color:var(--md-error)}
.ed-btn:disabled,.ib:disabled{opacity:.38;cursor:default}
.ed-btn.plein:disabled{background:color-mix(in srgb,var(--md-on-surface) 12%,transparent);color:var(--md-on-surface)}
.ed-info{font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);font-variant-numeric:tabular-nums;margin-left:auto;padding:0 8px}
.ed-medit h4{margin:4px 0 0;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;text-transform:uppercase;color:var(--md-on-surface-variant)}
.ed-aide{color:var(--md-on-surface-variant);font-size:13px;line-height:19px}
.ed-aide kbd{font:500 11px/1 ui-monospace,monospace;border:1px solid var(--md-outline-variant);border-radius:4px;padding:2px 5px;background:var(--md-surface)}
.ed-champ{display:flex;flex-direction:column;gap:4px}
.ed-champ>label{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);letter-spacing:.4px}
.ed-champ input[type=text],.ed-champ input[type=number],.ed-champ select{height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:0 12px;
  background:var(--md-surface);color:var(--md-on-surface);font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);min-width:0;width:100%;box-sizing:border-box}
.ed-champ input:focus,.ed-champ select:focus{outline:2px solid var(--md-primary);outline-offset:-1px;border-color:transparent}
.ed-ligne{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ed-ligne.trois{grid-template-columns:1fr 1fr 1fr}
.ed-entite{display:flex;align-items:center;gap:8px;min-height:40px;border:1px solid var(--md-outline);border-radius:4px;padding:4px 4px 4px 12px;background:var(--md-surface);cursor:pointer;text-align:left;color:var(--md-on-surface);font:inherit;width:100%;box-sizing:border-box}
.ed-entite .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-entite small{display:block;color:var(--md-on-surface-variant);font-size:11px;overflow:hidden;text-overflow:ellipsis}
.ed-entite .vide{color:var(--md-on-surface-variant)}
.ed-entite .x{width:32px;height:32px}
.ed-icones{display:flex;flex-wrap:wrap;gap:4px}
.ed-icones button{width:36px;height:36px;border-radius:8px;border:1px solid var(--md-outline-variant);background:var(--md-surface);color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-icones button.on{background:var(--md-secondary-container);border-color:transparent}
.ed-icones ha-icon{--mdc-icon-size:20px}
.ed-couleurs{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ed-ic{position:relative;display:flex;align-items:center;gap:6px}
.ed-ic>input{flex:1;min-width:0}
.ed-ic-ap{--mdc-icon-size:22px;width:36px;height:36px;display:grid;place-items:center;border-radius:8px;background:var(--md-surface-container-high);color:var(--md-on-surface);flex:none}
.ed-ic-menu{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px;padding:8px;max-height:220px;overflow:auto;
  border-radius:12px;background:var(--md-surface-container-high);box-shadow:0 4px 16px #0006}
.ed-ic-menu[hidden]{display:none}
.ed-ic-menu button{width:40px;height:40px;border:none;border-radius:8px;background:none;color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-ic-menu button:hover,.ed-ic-menu button:focus-visible{background:var(--md-secondary-container)}
.ed-ic-menu small{grid-column:1/-1;color:var(--md-on-surface-variant)}
.ed-al{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--md-outline-variant);border-radius:12px;margin:0 0 8px}
.ed-al-ents{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ed-al-e{display:inline-flex;align-items:center;gap:2px;padding:0 0 0 10px;border-radius:8px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}
.ed-al-e .ib{width:28px;height:28px}
.ed-couleur-anim{display:flex;align-items:center;gap:4px;min-width:0}
.ed-couleur-anim input[type=color]{width:44px;height:36px;padding:2px;border-radius:8px;flex:none}
.ed-couleurs button{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.ed-couleurs button.on{outline:2px solid var(--md-on-surface);outline-offset:2px}
.ed-couleurs input[type=color]{width:32px;height:32px;border:none;background:none;padding:0;cursor:pointer}
.ed-couleurs .ed-pal-pastille{border-radius:8px}
.ed-palette{display:flex;flex-direction:column;gap:4px}
.ed-pal{display:flex;align-items:center;gap:12px;min-height:48px}
.ed-pal input[type=color]{width:36px;height:36px;border:none;background:none;padding:0;cursor:pointer;flex:none}
.ed-pal .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-pal .n small{display:block;color:var(--md-on-surface-variant)}
.ed-pal-ajout input[type=text]{flex:1;min-width:0}
.ed-inter{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}
.ed-inter input{appearance:none;width:52px;height:32px;border-radius:16px;border:2px solid var(--md-outline);background:var(--md-surface-container-high);position:relative;cursor:pointer;flex:none;margin:0;transition:background .2s}
.ed-inter input::before{content:"";position:absolute;width:16px;height:16px;border-radius:50%;background:var(--md-outline);top:6px;left:6px;transition:all .2s var(--md-sys-motion)}
.ed-inter input:checked{background:var(--md-primary);border-color:var(--md-primary)}
.ed-inter input:checked::before{width:24px;height:24px;top:2px;left:22px;background:var(--text-primary-color,#fff)}
.ed-curseur{display:flex;align-items:center;gap:12px}
.ed-curseur input{flex:1;accent-color:var(--md-primary)}
.ed-curseur output{min-width:52px;text-align:right;font-variant-numeric:tabular-nums;color:var(--md-on-surface-variant)}
.ed-actions{display:flex;flex-wrap:wrap;gap:8px}
.ed-liste{display:flex;flex-direction:column;margin:0 -8px}
.ed-liste button{display:flex;align-items:center;gap:12px;min-height:48px;padding:4px 8px;border:none;border-radius:12px;background:none;color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit}
.ed-liste button ha-icon{color:var(--md-on-surface-variant);--mdc-icon-size:22px;flex:none}
.ed-liste button span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-liste button .ed-elt-verrou{margin-left:auto;--mdc-icon-size:18px}
.ed-liste small{display:block;color:var(--md-on-surface-variant);font-size:12px}
.ed-dir{display:inline-grid;grid-template-columns:repeat(3,36px);grid-template-rows:repeat(3,36px);gap:2px}
.ed-dir button{border:1px solid var(--md-outline-variant);border-radius:8px;background:var(--md-surface);color:var(--md-on-surface);cursor:pointer;display:grid;place-items:center}
.ed-dir button.on{background:var(--md-secondary-container);border-color:transparent}
.ed-voile{position:fixed;inset:0;background:#0007;z-index:9;display:grid;place-items:center;padding:16px}
.ed-dialogue{background:var(--md-surface-container-high);color:var(--md-on-surface);border-radius:28px;width:min(560px,100%);max-height:min(720px,calc(100vh - 32px));display:flex;flex-direction:column;
  box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-dialogue header{padding:24px 24px 12px}
.ed-dialogue h2{margin:0 0 16px;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-recherche{display:flex;align-items:center;gap:8px;height:56px;border-radius:28px;background:var(--md-surface-container);padding:0 16px}
.ed-recherche input{flex:1;border:none;background:none;color:var(--md-on-surface);font:400 16px/24px var(--ha-font-family-body,Roboto,sans-serif);outline:none;min-width:0}
.ed-filtres{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;min-width:0;max-width:100%;scrollbar-width:none}
.ed-dialogue,.ed-dialogue>*,.ed-dialogue header{min-width:0;box-sizing:border-box}
.ed-dialogue .ed-grille{grid-template-columns:repeat(auto-fill,minmax(min(160px,100%),1fr))}
.ed-filtres button{flex:none;height:32px;padding:0 16px;border-radius:8px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface-variant);cursor:pointer;white-space:nowrap;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-filtres button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
.ed-resultats{overflow:auto;padding:0 12px 8px;flex:1}
.ed-resultats button{display:flex;width:100%;align-items:center;gap:16px;min-height:56px;padding:8px 12px;border:none;border-radius:12px;background:none;color:var(--md-on-surface);cursor:pointer;text-align:left;font:inherit}
.ed-resultats button ha-icon{color:var(--md-on-surface-variant);flex:none}
.ed-resultats .n{flex:1;min-width:0}
.ed-resultats .n span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-resultats small{color:var(--md-on-surface-variant);font-size:12px}
.ed-resultats .etat{color:var(--md-on-surface-variant);font-size:12px;white-space:nowrap}
.ed-resultats .deja{opacity:.55}
.ed-choix-l{display:flex;align-items:center}
.ed-resultats .ed-choix-l>.ed-coche{width:48px;min-height:48px;flex:none;justify-content:center;padding:0}
.ed-resultats .ed-coche[aria-pressed=true] ha-icon{color:var(--md-primary)}
.ed-dialogue footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 24px 20px}
.ed-snack{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10;background:var(--md-on-surface);color:var(--md-surface);
  border-radius:4px;padding:6px 8px 6px 16px;display:flex;align-items:center;gap:8px;min-height:40px;box-shadow:0 3px 6px #0004;
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);max-width:calc(100vw - 32px)}
.ed-snack button{background:none;border:none;color:color-mix(in srgb,var(--md-primary) 60%,var(--md-surface));font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);cursor:pointer;padding:8px 12px;border-radius:20px}
.ed-dialogue.large{width:min(760px,100%)}
` // @assemblage
