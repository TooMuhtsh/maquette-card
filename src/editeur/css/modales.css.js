// CSS : modales (Paramètres, Ambiance, édition, Calques), barre flottante, aides, nettoyage — morceau de src/maquette-editeur.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
/* champs de la modale ⚙ Paramètres */
.ed-par-sec{display:flex;flex-direction:column;gap:14px}
.ed-par-sec+.ed-par-sec{border-top:1px solid var(--md-outline-variant);padding-top:14px}
.ed-par-sec>h4{margin:0}
.ed-par-inter{font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface);margin:2px 0 -6px}
.ed-par{display:flex;flex-direction:column;gap:6px}
.ed-champ>.ed-par-lib{font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface-variant);letter-spacing:.4px}
.ed-seg.plein{display:flex;width:100%;box-sizing:border-box}
.ed-seg.plein button{flex:1 1 0;min-width:0;padding:0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:30px;text-align:center}
.ed-seg button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-unite{position:relative;display:flex}
.ed-unite input{flex:1;min-width:0;padding-right:44px!important}
.ed-unite>span{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--md-on-surface-variant);pointer-events:none}
.ed-confirme{display:flex;flex-direction:column;gap:8px;padding:12px 12px 8px 16px;border-radius:12px;background:var(--md-surface-container-high);border:1px solid var(--md-outline-variant)}
.ed-confirme b{display:flex;align-items:center;gap:8px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-confirme b ha-icon{--mdc-icon-size:20px;color:var(--md-error)}
.ed-confirme p{margin:0;color:var(--md-on-surface-variant);font-size:13px;line-height:19px}
.ed-confirme code{font:12px/1 ui-monospace,monospace}
.ed-confirme .ed-actions{justify-content:flex-end}
.ed-liste button .chevron{margin-left:auto;--mdc-icon-size:20px}
.ed-par-sec .ed-liste button span{white-space:normal}
/* barre d'outils : commande du pas de la grille, menus déroulants */
.ed-menu-btn{height:40px;padding:0 6px 0 10px;border-radius:20px;border:1px solid var(--md-outline-variant);background:none;color:var(--md-on-surface);cursor:pointer;
  display:inline-flex;align-items:center;gap:6px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);white-space:nowrap;font-variant-numeric:tabular-nums}
.ed-menu-btn>ha-icon{--mdc-icon-size:18px;color:var(--md-on-surface-variant)}
.ed-menu-btn .lib{color:var(--md-on-surface-variant);font-weight:400}
.ed-menu-btn[aria-expanded=true]{background:var(--md-secondary-container);border-color:transparent}
.ed-menu{position:fixed;z-index:11;min-width:200px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:8px 0;border-radius:4px;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 2px 6px 2px #0003,0 1px 2px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-menu-titre{padding:8px 16px 4px;font:500 12px/16px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.5px;color:var(--md-on-surface-variant)}
.ed-menu-sep{height:1px;margin:8px 0;background:var(--md-outline-variant)}
.ed-menu button{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 16px 0 12px;border:none;border-radius:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;white-space:nowrap}
.ed-menu button ha-icon{--mdc-icon-size:20px;width:24px;flex:none;color:var(--md-on-surface-variant)}
.ed-menu button[aria-checked=true]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-menu button[aria-checked=true] ha-icon{color:inherit}
.ed-menu button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-menu kbd,.ed-touches kbd{font:500 11px/1 ui-monospace,monospace;border:1px solid var(--md-outline-variant);border-bottom-width:2px;border-radius:4px;padding:2px 5px;background:var(--md-surface);color:var(--md-on-surface)}
.ed-menu button kbd{margin-left:auto}
.ed-barre .ed-plus{display:none}
.ed-saut{display:none}
/* téléphone : deux rangées (grille, Plus, Ajouter, Quitter, Enregistrer / annuler, rétablir, outils) ; le reste dans le menu « Plus » */
ha-card.ed-etroit .ed-barre{flex-wrap:wrap;row-gap:8px}
ha-card.ed-etroit .ed-defile,ha-card.ed-etroit .ed-fin{display:contents}
ha-card.ed-etroit .ed-pc{display:none}
ha-card.ed-etroit .ed-barre .ed-plus{display:inline-grid;order:2;margin-right:auto}
ha-card.ed-etroit .ed-menu-btn[data-a=grille]{order:1}
ha-card.ed-etroit .ed-fin>[data-a=ajouter]{order:3}
ha-card.ed-etroit .ed-fin>[data-a=quitter]{order:4}
ha-card.ed-etroit .ed-fin>[data-a=enregistrer]{order:5}
ha-card.ed-etroit .ed-saut{display:block;order:6;flex-basis:100%;height:0}
ha-card.ed-etroit .ed-histo{order:7}
ha-card.ed-etroit .ed-outils{order:8;flex:1 1 0;min-width:0;display:flex}
ha-card.ed-etroit .ed-outils button{flex:1 1 0;min-width:0;padding:0}
ha-card.ed-etroit .ed-menu-btn .lib{display:none}
/* modale ⚙ Paramètres : onglets à gauche, contenu défilant ; plein écran et onglets en haut sur téléphone */
.ed-mvoile{position:fixed;inset:0;z-index:9;display:grid;place-items:center;background:rgb(0 0 0 / .35)}
.ed-modale{width:min(880px,calc(100vw - 48px));height:min(640px,90vh);display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;border-radius:28px;
  background:var(--md-surface-container-high);color:var(--md-on-surface);box-shadow:0 8px 12px 6px #0003,0 4px 4px #0004;font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-modale>header{display:flex;align-items:flex-start;gap:12px;padding:20px 16px 12px 24px;flex:none}
.ed-modale>header>ha-icon{--mdc-icon-size:24px;color:var(--md-on-surface-variant);margin-top:4px}
.ed-modale>header>div{flex:1;min-width:0}
.ed-modale h2{margin:0;font:400 24px/32px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-version{color:var(--md-on-surface-variant);font:400 12px/16px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-version button{border:none;background:none;padding:0;color:var(--md-primary);font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.ed-mcorps{flex:1;min-height:0;display:flex}
.ed-onglets{flex:none;width:248px;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;padding:4px 12px 16px;overflow:auto}
.ed-onglets button{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px 0 12px;border:none;border-radius:24px;background:none;color:var(--md-on-surface-variant);
  font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);text-align:left;cursor:pointer;flex:none}
.ed-onglets button ha-icon{--mdc-icon-size:22px;flex:none}
.ed-onglets button[aria-selected=true]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-onglets button:focus-visible{outline:2px solid var(--md-primary);outline-offset:-2px}
.ed-mcontenu{flex:1;min-width:0;overflow:auto;padding:4px 24px 24px;box-sizing:border-box;border-left:1px solid var(--md-outline-variant);overscroll-behavior:contain}
.ed-mcontenu>section{display:flex;flex-direction:column;gap:14px}
.ed-mcontenu>section[hidden]{display:none}
.ed-mcontenu>section:focus{outline:none}
.ed-mtitre{margin:4px 0 2px;font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-on-surface)}
.ed-mcontenu .ed-par-sec>h4{margin:6px 0 0;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.1px;text-transform:none;color:var(--md-primary)}
.ed-mcontenu .ed-liste{margin:0 -8px}
.ed-mcontenu .ed-liste button{width:100%}
ha-card.ed-etroit .ed-mvoile{place-items:stretch}
ha-card.ed-etroit .ed-modale{width:100vw;height:100vh;height:100dvh;border-radius:0}
ha-card.ed-etroit .ed-modale>header{padding:12px 8px 4px 16px}
ha-card.ed-etroit .ed-modale>header>ha-icon{display:none}
ha-card.ed-etroit .ed-modale h2{font-size:22px;line-height:28px}
ha-card.ed-etroit .ed-mcorps{flex-direction:column}
ha-card.ed-etroit .ed-onglets{width:auto;flex-direction:row;gap:8px;padding:4px 16px 8px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-onglets::-webkit-scrollbar{display:none}
ha-card.ed-etroit .ed-onglets button{min-height:32px;height:32px;padding:0 16px;border-radius:8px;border:1px solid var(--md-outline-variant);white-space:nowrap}
ha-card.ed-etroit .ed-onglets button[aria-selected=true]{border-color:transparent}
ha-card.ed-etroit .ed-onglets button ha-icon{display:none}
ha-card.ed-etroit .ed-mcontenu{border-left:none;padding:8px 16px 24px}
/* modale Ambiance : même modèle que ⚙ Paramètres, plus large, aperçu fictif à droite (téléphone : bandeau au-dessus des réglages) */
.ed-mvoile[hidden]{display:none}
.ed-modale-amb{width:min(1040px,calc(100vw - 48px))}
.ed-modale-amb .ed-onglets{width:216px}
.ed-amb-apercu{flex:none;width:300px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:4px 20px 20px;border-left:1px solid var(--md-outline-variant);overflow:auto}
.ed-amb-apercu:empty{display:none}
.ed-ap-titre{display:flex;align-items:center;gap:4px;margin:6px 0 0;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-primary)}
.ed-ap-plan{border-radius:16px;overflow:hidden;background:var(--md-surface-container-lowest,#0002);min-height:120px}
.ed-ap-plan .ed-ap-carte{display:block;pointer-events:none}
.ed-ap-ctl{display:flex;flex-direction:column;gap:10px;min-width:0}
ha-card.ed-etroit .ed-ap-titre{display:none}
ha-card.ed-etroit .ed-ap-plan{flex:none;width:132px;min-height:0}
ha-card.ed-etroit .ed-ap-ctl{flex:1;gap:6px}
ha-card.ed-etroit .ed-ap-ctl .ed-champ label{font-size:12px;line-height:16px}
ha-card.ed-etroit .ed-modale-amb{width:100vw}
ha-card.ed-etroit .ed-amb-apercu{order:1;width:auto;flex-direction:row;align-items:center;gap:12px;padding:8px 16px;border-left:none;border-bottom:1px solid var(--md-outline-variant);overflow:hidden}
ha-card.ed-etroit .ed-modale-amb .ed-mcontenu{order:2}
/* modale d'édition d'un élément (pièce, ouverture) : onglets, réglages, aperçu dans sa pièce (à droite ; en haut sur téléphone), pied d'actions */
.ed-modale-elt{width:min(1080px,calc(100vw - 48px));height:min(720px,92vh)}
.ed-modale-elt .ed-onglets{width:240px}
.ed-elt-apercu{flex:none;width:340px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:4px 20px 20px;border-left:1px solid var(--md-outline-variant);overflow:auto}
.ed-elt-apercu .ed-ap-plan{min-height:0}
.ed-medit details.ed-plein>summary{list-style:none;pointer-events:none;padding-left:0;color:var(--md-primary)}
.ed-medit details.ed-plein>summary::-webkit-details-marker{display:none}
.ed-medit details.ed-plein>summary::before{display:none}
.ed-medit>section>.ed-actions{margin-top:0}
.ed-mpied{flex:none;display:flex;align-items:center;gap:4px;padding:10px 20px 16px;border-top:1px solid var(--md-outline-variant)}
.ed-mpied .ed-esp{flex:1}
.ed-mpied .ib.danger,.ed-bf .ib.danger{color:var(--md-error,#b3261e)}
ha-card.ed-etroit .ed-modale-elt{width:100vw}
ha-card.ed-etroit .ed-elt-apercu{order:-1;width:auto;padding:8px 16px;border-left:none;border-bottom:1px solid var(--md-outline-variant);overflow:hidden}
ha-card.ed-etroit .ed-elt-apercu .ed-ap-plan{width:100%;max-height:24vh}
ha-card.ed-etroit .ed-mpied{padding:8px 12px calc(8px + env(safe-area-inset-bottom));flex-wrap:wrap;row-gap:4px}
.ed-mpied>*{flex-shrink:0}
ha-card.ed-etroit .ed-mpied>.ed-btn.plein{margin-left:auto}
.ed-modale>header>.ed-retour{margin:-4px 0 0 -8px}
/* aperçu d'un widget ou d'une puce du résumé : l'élément lui-même, rendu par la carte, non cliquable */
.ed-ap-w{display:flex;flex-direction:column;min-width:0}
.ed-ap-w.ed-ap-puce{flex-direction:row;padding:8px 0}
ha-card.ed-etroit .ed-ap-w{width:100%;max-height:24vh;overflow:hidden}
/* modale Calques : une colonne, plus étroite */
.ed-modale-cq{width:min(560px,calc(100vw - 48px))}
.ed-modale-cq .ed-mcontenu{border-left:none}
ha-card.ed-etroit .ed-modale-cq{width:100vw}
/* barre flottante près de l'élément sélectionné (MD3 : barre d'outils flottante, surface élevée, boutons icônes) */
.ed-bf{position:absolute;z-index:5;display:flex;width:max-content;align-items:center;gap:2px;padding:4px;border-radius:28px;background:var(--md-surface-container-high);color:var(--md-on-surface);
  box-shadow:0 2px 6px 2px #00000026,0 1px 2px #0000004d;max-width:calc(100% - 8px);box-sizing:border-box}
.ed-bf[hidden]{display:none}
.ed-bf .ed-bf-mod{height:40px;padding:0 16px 0 12px;border-radius:20px;margin-right:2px}
.ed-bf .ed-bf-sep{width:1px;height:24px;margin:0 2px;background:var(--md-outline-variant)}
ha-card.ed-etroit .ed-bf .ed-bf-mod{padding:0 10px}
ha-card.ed-etroit .ed-bf .ed-bf-mod span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
/* curseurs des réglages (MD3) : valeur affichée ; teinte : piste au vrai spectre, « Auto » = teinte d'origine */
.ed-par-curseur .ed-curseur{gap:10px}
.ed-par-curseur .ed-curseur output{min-width:60px}
.ed-par-curseur .ed-btn{flex:none;min-width:0;padding:0 12px}
.ed-par-curseur.kelvin input[type=range]{-webkit-appearance:none;appearance:none;height:12px;border-radius:6px;background:var(--piste);margin:0;cursor:pointer}
.ed-par-curseur.kelvin input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:var(--md-primary);border:3px solid var(--md-surface-container-high);box-shadow:0 1px 3px #0006}
.ed-par-curseur.kelvin input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--md-primary);border:3px solid var(--md-surface-container-high);box-shadow:0 1px 3px #0006}
.ed-par-curseur.kelvin input[type=range]:focus-visible{outline:2px solid var(--md-primary);outline-offset:4px}
.ed-par-curseur.auto input[type=range]{opacity:.6}
.ed-par-curseur.auto output{color:var(--md-primary)}
/* aide aux raccourcis clavier */
.ed-dialogue.ed-dlg-touches{width:min(880px,100%)}
.ed-dlg-touches header{padding-bottom:0}
.ed-touches{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:0 32px;overflow:auto;padding:0 24px 8px;flex:1}
.ed-touches h3{margin:8px 0 4px;font:500 14px/20px var(--ha-font-family-body,Roboto,sans-serif);color:var(--md-primary)}
.ed-touches dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;align-items:baseline}
.ed-touches dt{color:var(--md-on-surface-variant);font-size:12px;line-height:20px;white-space:nowrap}
.ed-touches dt>span{white-space:nowrap}
.ed-touches dd{margin:0;color:var(--md-on-surface)}
/* bulle d'aide ⓘ : petit bouton (cible de 40 px) ; infobulle au survol ou au focus sur PC, popover au toucher (EditeurPlan._cablerAides) */
.ed-i{position:relative;display:inline-grid;place-items:center;width:24px;height:24px;margin:-4px 0 -4px 2px;padding:0;border:none;border-radius:50%;background:none;
  color:var(--md-on-surface-variant);cursor:help;flex:none;vertical-align:middle;--mdc-icon-size:18px;text-transform:none;letter-spacing:normal;font:inherit}
.ed-i::before{content:"";position:absolute;inset:-8px;border-radius:50%}
.ed-i:hover,.ed-i[aria-expanded=true]{color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 10%,transparent)}
.ed-i:focus-visible{outline:2px solid var(--md-primary);outline-offset:1px}
.ed-tip{position:fixed;z-index:12;box-sizing:border-box;max-width:min(320px,calc(100vw - 16px));padding:12px 16px;border-radius:12px;
  background:color-mix(in srgb,var(--md-on-surface) 6%,var(--md-surface-container-high));color:var(--md-on-surface-variant);
  font:400 14px/20px var(--ha-font-family-body,Roboto,sans-serif);letter-spacing:.25px;text-transform:none;white-space:normal;overflow-wrap:anywhere;
  box-shadow:0 2px 6px 2px #00000026,0 1px 2px #0000004d;animation:ed-tip .12s var(--md-sys-motion,ease-out)}
@keyframes ed-tip{from{opacity:0;transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){.ed-tip{animation:none}}
/* aide courte sous le titre d'un panneau (surface, sommets, compte d'une sélection) */
.ed-resume{color:var(--md-on-surface-variant);font-size:13px;line-height:19px;font-variant-numeric:tabular-nums}
/* actions secondaires en icônes (premier plan, dupliquer, modèle…) : texte en infobulle ; « Supprimer » garde son libellé */
.ed-actions .ib{width:40px;height:40px;border:1px solid var(--md-outline-variant);border-radius:20px;color:var(--md-on-surface-variant)}
.ed-actions .ed-btn.danger{margin-left:auto}
.ed-actions .ib:focus-visible,.ed-btn:focus-visible{outline:2px solid var(--md-primary);outline-offset:2px}
/* bouton Enregistrer : point d'état quand le plan est modifié (plus de texte « Non enregistré ») */
.ed-btn[data-a=enregistrer]{position:relative}
.ed-btn[data-a=enregistrer].modifie::after{content:"";position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--md-error);box-shadow:0 0 0 2px var(--md-surface-container-high)}
/* animations par événement (panneau Ambiance) : type en pleine largeur, couleur et durée dessous */
.ed-anim-ev select{width:100%}
.ed-anim-ev .ed-ligne{align-items:center;margin-top:4px}
.ed-anim-ev input[type=number]{height:36px;border:1px solid var(--md-outline);border-radius:4px;padding:0 8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;min-width:0;width:100%;box-sizing:border-box}
/* indices de défilement des rangées horizontales (onglets, filtres) : dégradé du côté où il reste à voir */
.ed-filtres.def-d,.ed-onglets.def-d{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent)}
.ed-filtres.def-g,.ed-onglets.def-g{-webkit-mask-image:linear-gradient(90deg,transparent,#000 32px);mask-image:linear-gradient(90deg,transparent,#000 32px)}
.ed-filtres.def-g.def-d,.ed-onglets.def-g.def-d{-webkit-mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 32px),transparent)}
/* catalogue : filtres sur plusieurs lignes au téléphone, tuiles sur 2 colonnes, ombre de défilement en bas */
ha-card.ed-etroit .ed-cat-filtres{flex-wrap:wrap;overflow:visible}
ha-card.ed-etroit .ed-dialogue .ed-grille{grid-template-columns:repeat(auto-fill,minmax(min(132px,100%),1fr))}
.ed-tuile small{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.ed-tuile .cotes span{padding:0;width:36px;justify-content:center}
.ed-cat{background:linear-gradient(transparent,var(--md-surface-container-high) 70%) center bottom/100% 24px no-repeat local,
  radial-gradient(farthest-side at 50% 100%,#0005,transparent) center bottom/100% 10px no-repeat scroll}
/* sélecteur d'entité : nom sur deux lignes, identifiant coupé où il faut (téléphone) */
.ed-resultats .n span{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.ed-resultats small{overflow-wrap:anywhere}
/* modale ⚙ : titre d'onglet gardé pour les lecteurs d'écran sur PC (l'onglet actif le montre déjà), visible au téléphone */
ha-card:not(.ed-etroit) .ed-mtitre{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ed-modale h2 .ed-i{margin-left:6px}
/* « Nettoyer le plan » : aperçu (défauts cerclés, clic = zoom) à gauche, corrections à cocher à droite ; empilés au téléphone */
.ed-dialogue.ed-net{width:min(1040px,100%);height:min(780px,calc(100vh - 32px))}
.ed-net header .ed-aide{margin-top:-8px}
.ed-net-corps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,360px);gap:24px;align-items:start;align-content:start;padding-bottom:16px}
.ed-net-corps>*{min-width:0}
.ed-net-apercu{position:sticky;top:0;display:flex;flex-direction:column;gap:8px}
.ed-net-tete{display:flex;align-items:center;gap:8px;min-height:40px}
.ed-net-tete .ed-espace{flex:1}
.ed-net-w{border-radius:16px;background:var(--md-surface);overflow:hidden;height:min(calc(100vh - 360px),480px);min-height:220px;touch-action:manipulation}
.ed-net-w svg{display:block;width:100%;height:100%}
.ed-net-w.ed-net-z svg{cursor:zoom-out}
.ed-net-w [data-d]{cursor:pointer}
.n-sol{fill:var(--md-surface-container-high);stroke:var(--md-outline-variant)}
.n-sol.dehors{fill:none;stroke-dasharray:6 4}
.n-sol.sz{fill:none}
.n-mur{fill:none;stroke:var(--md-on-surface);stroke-linecap:square}
.n-ouv{fill:none;stroke:var(--md-primary)}
.n-def{fill:color-mix(in srgb,var(--md-error) 16%,transparent);stroke:var(--md-error)}
.n-info{fill:none;stroke:var(--md-error);opacity:.75}
.n-style{fill:var(--md-surface);stroke:var(--md-on-surface-variant)}
.n-fait{fill:var(--md-primary);stroke:var(--md-surface)}
.n-def.on,.n-style.on,.n-fait.on,.n-info.on{stroke-width:3px;vector-effect:non-scaling-stroke}
.ed-net-leg{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--md-on-surface-variant)}
.ed-net-leg span{display:inline-flex;align-items:center;gap:6px}
.ed-net-leg i{width:10px;height:10px;border-radius:50%;box-sizing:border-box;flex:none}
.ed-net-leg .l-def{border:2px solid var(--md-error);background:color-mix(in srgb,var(--md-error) 16%,transparent)}
.ed-net-leg .l-style{border:1.5px solid var(--md-on-surface-variant)}
.ed-net-leg .l-info{width:16px;height:0;border-radius:0;border-top:2px dashed var(--md-error)}
.ed-net-leg .l-fait{background:var(--md-primary)}
.ed-net-form{display:flex;flex-direction:column;gap:2px}
.ed-net-form h4{margin:12px 8px 4px}
.ed-net-opt .ed-coche{min-height:44px;padding:4px 8px;gap:12px}
.ed-net-opt+.ed-net-opt{margin-top:4px}
.ed-net-opt .ed-coche .n{flex:1;min-width:0}
.ed-net-nb{min-width:24px;height:24px;padding:0 8px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 12px/24px var(--ha-font-family-body,Roboto,sans-serif);text-align:center;box-sizing:border-box;flex:none}
.ed-net-det{margin:-4px 8px 2px 40px}
.ed-net-det>summary{cursor:pointer;color:var(--md-primary);font:500 13px/28px var(--ha-font-family-body,Roboto,sans-serif);list-style:none;display:inline-flex;align-items:center;gap:4px}
.ed-net-det>summary::before{content:"▸";transition:transform .2s}
.ed-net-det[open]>summary::before{transform:rotate(90deg)}
.ed-net-liste{display:flex;flex-direction:column}
.ed-net-liste button{text-align:left;border:none;background:none;color:var(--md-on-surface);padding:6px 8px;border-radius:8px;font:400 13px/18px var(--ha-font-family-body,Roboto,sans-serif);cursor:pointer}
.ed-net-liste button:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)}
.ed-net-liste button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-net-liste small{color:var(--md-on-surface-variant);font-size:12px}
.ed-net-salles{margin:0 8px 6px 40px}
.ed-net-salles button{height:28px;padding:0 10px}
.ed-net-propre{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}
.ed-net-propre ha-icon{--mdc-icon-size:28px;color:var(--md-primary);flex:none}
.ed-net-propre b{display:block;font:500 16px/24px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-net-vide{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;padding:32px 16px}
.ed-net-vide ha-icon{--mdc-icon-size:48px;color:var(--md-primary)}
.ed-net-vide b{font:400 22px/28px var(--ha-font-family-body,Roboto,sans-serif)}
.ed-net-vide span{color:var(--md-on-surface-variant)}
.ed-net footer{flex-wrap:wrap}
.ed-net .ed-versions button.on{background:var(--md-secondary-container);color:var(--md-on-secondary-container);border-color:transparent}
.ed-dialogue.ed-net.ed-net-petit{height:auto;width:min(560px,100%)}
ha-card.ed-etroit .ed-net-corps{grid-template-columns:minmax(0,1fr);gap:8px}
ha-card.ed-etroit .ed-net-apercu{z-index:2;background:var(--md-surface-container-high);margin:0 -16px;padding:0 16px 8px;border-bottom:1px solid var(--md-outline-variant)}
ha-card.ed-etroit .ed-net-w{height:30vh;height:30dvh}
ha-card.ed-etroit .ed-net-det,ha-card.ed-etroit .ed-net-salles{margin-left:32px}
`;

