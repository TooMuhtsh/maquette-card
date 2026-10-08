/* maquette-card (Maquette, ex-plan-maison-card) : plan interactif de la maison, en direct.
 * Générique : la géométrie (en cm) et les entités viennent de la config de la carte (dashboard, accès authentifié) ;
 * ce fichier, servi sans authentification depuis /local, ne contient rien de propre à la maison.
 * Config publique (YAML du dashboard) en anglais, voir docs/configuration.md : rooms[{name, poly, temperature?, humidity?, …}], walls[[x1,y1,x2,y2]],
 *          fences[[…]], openings[{type: window|door|gate, seg, …}], badges[…], texts[…], furniture[…], panels{left, right}, layers{…}…
 * En interne (this._config, éditeur, brouillons) la config garde ses clés françaises : pieces, murs, limites, ouvertures, points, textes,
 *          meubles, panneaux{gauche, droite}, calques… ; depuisAnglais / versAnglais (schéma N_RACINE) traduisent à l'entrée et à la sortie.
 */
import "./maquette-i18n.js"; // dist : ligne retirée par build.mjs, le fichier est placé en tête
const { _t, _tk } = globalThis.MaquetteI18n, _loc = () => globalThis.MaquetteI18n.locale();
const VERSION = "0.1.0";
const ACTIFS = new Set(["on", "open", "opening", "closing", "playing", "heating", "cooling", "cleaning", "detected", "home"]);
const fmt = (v, d = 1) => Number(v).toLocaleString(_loc(), { maximumFractionDigits: d });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PALIERS = [[17, "#4f7fe0"], [19, "#56b4d3"], [21, "#62c48a"], [23, "#a8cf5a"], [24.5, "#f2c14e"], [26, "#f29e4c"], [28, "#e5604d"]];
function couleurTemp(t) {
  if (t == null || isNaN(t)) return null;
  if (t <= PALIERS[0][0]) return PALIERS[0][1];
  for (let i = 1; i < PALIERS.length; i++) {
    const [t1, c1] = PALIERS[i];
    if (t <= t1) {
      const [t0, c0] = PALIERS[i - 1], k = (t - t0) / (t1 - t0);
      const a = c0.match(/\w\w/g).map((h) => parseInt(h, 16)), b = c1.match(/\w\w/g).map((h) => parseInt(h, 16));
      return "#" + a.map((x, j) => Math.round(x + (b[j] - x) * k).toString(16).padStart(2, "0")).join("");
    }
  }
  return PALIERS[PALIERS.length - 1][1];
}

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
/* traces des derniers changements (ambiance) : --t = 1 juste après, 0 à la fin de la durée */
.ouv.trace .cible{stroke:var(--trace-c,var(--md-primary));stroke-opacity:calc(var(--t,0)*.45)}
.pt.trace,.mb.trace{box-shadow:0 0 0 calc(2px + 5px*var(--t,0)) color-mix(in srgb,var(--trace-c,var(--md-primary)) calc(var(--t,0)*60%),transparent),0 1px 2px #0003}
/* ambiance */
.amb{pointer-events:none}
.amb .amb-n,.amb .amb-sol{transition:opacity 40s linear}
.m-defile{animation:m-defile var(--m-d) linear infinite}
.m-brume{animation:respire 14s ease-in-out infinite;--a-i:1}
.m-eclair{opacity:0;animation:m-eclair 9s linear infinite}
.calque>.amb-astre{pointer-events:auto;color:#f9a825;opacity:.85;--mdc-icon-size:1.35em;filter:drop-shadow(0 0 4px #f9a82580);transition:left 40s linear,top 40s linear}
.calque>.amb-astre[hidden]{display:none}
.zone.hors-ecran *,.zone.hors-ecran *::before{animation-play-state:paused!important}
/* zone d'informations */
.calque>.infob{display:flex;flex-direction:column;gap:2px;padding:.45em .75em;border-radius:.95em;min-width:6em;pointer-events:auto;white-space:nowrap;
  background:color-mix(in srgb,var(--md-surface-container-high) 92%,transparent);color:var(--md-on-surface);box-shadow:0 1px 3px #0004;font-weight:400}
.calque>.infob.discret{background:none;box-shadow:none}
.infob .ib-t{font-weight:500;margin-bottom:2px}
.infob .ib-l{display:flex;align-items:center;gap:.45em;cursor:pointer}
.edition .infob .ib-l{cursor:inherit}
.infob .ib-l ha-icon{--mdc-icon-size:1.2em;color:var(--md-primary);flex:none}
.infob .ib-n{color:var(--md-on-surface-variant);flex:1}
.infob .ib-n:empty{display:none}
.infob .ib-v{font-weight:500;font-variant-numeric:tabular-nums;margin-left:auto}
.infob .ib-l.indispo{opacity:.45}
.infob .ib-vide{color:var(--md-on-surface-variant);font-style:italic}
.badge-demo{display:inline-flex;align-items:center;height:24px;padding:0 10px;margin-left:8px;border-radius:12px;vertical-align:middle;
  background:var(--md-secondary-container);color:var(--md-on-secondary-container);font:500 12px/16px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.4px}
/* replay de la journée */
.plan.en-replay{box-shadow:inset 0 0 0 2px var(--md-primary)}
.zoom button.on{background:var(--md-primary);color:var(--text-primary-color,#fff)}
.replay{position:absolute;left:16px;right:72px;bottom:16px;z-index:4;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:16px;
  background:color-mix(in srgb,var(--md-surface-container-high) 94%,transparent);color:var(--md-on-surface);box-shadow:0 2px 8px #0005;
  font:500 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif);font-variant-numeric:tabular-nums}
.replay>ha-icon{color:var(--md-primary);margin-left:6px}
.replay .rp-msg{flex:1;min-width:0;color:var(--md-on-surface-variant)}
.rp-piste{position:relative;flex:1;min-width:80px;display:flex;align-items:center}
.rp-piste input{width:100%;margin:0;accent-color:var(--md-primary);position:relative;z-index:1;background:none}
.rp-marques{position:absolute;inset:0;pointer-events:none}
.rp-marques i{position:absolute;top:2px;bottom:2px;width:2px;margin-left:-1px;border-radius:1px;opacity:.75}
.rp-marques .m-ouv{background:var(--md-error)}
.rp-marques .m-lum{background:#f6c445;top:8px}
.rp-marques .m-pers{background:var(--md-primary);bottom:8px}
.rp-heure{min-width:4.5em;text-align:center}
.replay select{border:1px solid var(--md-outline-variant);border-radius:8px;background:var(--md-surface);color:var(--md-on-surface);font:inherit;padding:4px 6px}
@media (max-width:600px){.replay{left:8px;right:8px;bottom:64px;flex-wrap:wrap}.rp-piste{flex-basis:100%;order:5}.rp-heure{min-width:0;flex:none}
  .replay select{flex:none;width:auto;max-width:96px}.replay [data-rp=direct]{margin-left:auto}}
/* résumé sur plusieurs lignes, puces empilées */
.tete.lignes{flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:8px}
.tete-l{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
.pile{display:flex;flex-direction:column;gap:6px;min-width:0}
.plein .tete.lignes{overflow:visible}
.plein .tete-l{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.plein .tete-l::-webkit-scrollbar{display:none}
.plein .pile{flex:none}
.edition .chip[data-puce]{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.chip.glisse{opacity:.85;z-index:5;position:relative;box-shadow:0 6px 16px #0006;cursor:grabbing;pointer-events:none}
.tete{position:relative}
.puce-depot{position:absolute;z-index:10;background:var(--md-primary);border-radius:2px;pointer-events:none}
/* personnes */
.calque>.pers{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;background:none;padding:0;cursor:pointer;font:inherit;color:var(--md-on-surface);overflow:visible;
  transform:translate(calc(-50% + var(--dx,0)*2.9em),calc(-50% + 2.4em));transition:left 1.6s var(--md-sys-motion),top 1.6s var(--md-sys-motion),transform .6s var(--md-sys-motion);z-index:2}
.calque>.pers::after{display:none}
.pers .av{width:2.3em;height:2.3em;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:var(--md-primary);color:var(--text-primary-color,#fff);font-weight:600;
  box-shadow:0 0 0 2px var(--md-surface),0 0 0 4px var(--md-primary),0 2px 4px #0005;transition:filter .6s,opacity .6s}
.pers .av img{width:100%;height:100%;object-fit:cover}
.pers small{font-size:.8em;padding:0 .4em;border-radius:6px;background:color-mix(in srgb,var(--md-surface) 85%,transparent);white-space:nowrap}
.pers small:empty{display:none}
.calque>.pers.dehors{transform:translate(calc(-50% + var(--dx,0)*1em),-50%)}
.pers.dehors .av{filter:grayscale(.7);opacity:.8;box-shadow:0 0 0 2px var(--md-surface),0 0 0 4px var(--md-outline),0 2px 4px #0005}
.pers.inconnu .av{opacity:.4}
.calque>.pers.cache{display:none}
/* personnes dehors en rangée (dehors: zone) : puces discrètes côte à côte en bas du plan (--ox : décalage calculé depuis le centre) */
.calque>.pers.dehors.ailleurs{flex-direction:row;gap:.45em;padding:.2em .75em .2em .2em;border-radius:999px;background:color-mix(in srgb,var(--md-surface-container-high) 92%,transparent);
  box-shadow:0 1px 3px #0004;transform:translate(calc(-50% + var(--ox,0px)),calc(-100% - 8px))}
.pers.ailleurs .av{width:2em;height:2em;box-shadow:none}
.pers.ailleurs small{font-size:1em;padding:0;background:none;color:var(--md-on-surface-variant);max-width:9em;overflow:hidden;text-overflow:ellipsis}
.zone.amb-glisse .calque>.pers:not(.dehors){cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.zone.amb-glisse .calque>.pers.glisse{cursor:grabbing;transition:none}
/* alertes plein plan */
.alerte-voile{position:absolute;inset:8px;border-radius:8px;pointer-events:none;z-index:3;
  box-shadow:inset 0 0 0 3px var(--al-c),inset 0 0 70px 12px color-mix(in srgb,var(--al-c) 40%,transparent);animation:pulse 1.8s ease-in-out infinite}
.alerte-voile.info{animation:none;box-shadow:inset 0 0 0 2px var(--al-c)}
.bandeau-al{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:4;display:flex;align-items:center;gap:8px;max-width:calc(100% - 32px);box-sizing:border-box;
  padding:6px 6px 6px 14px;border-radius:12px;background:var(--md-surface-container-high);color:var(--md-on-surface);border:2px solid var(--al-c);box-shadow:0 4px 12px #0006;
  font:400 14px/20px var(--ha-font-family-body,Roboto,system-ui,sans-serif)}
.bandeau-al>ha-icon{color:var(--al-c);flex:none}
.bandeau-al .t{display:flex;flex-direction:column;min-width:0}
.bandeau-al .t small{color:var(--md-on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.calque>.pt.en-alerte,.calque>.mb.en-alerte{overflow:visible}
.calque>.pt.en-alerte::before,.calque>.mb.en-alerte::before{content:"";position:absolute;inset:0;border-radius:inherit;border:3px solid var(--al-c,var(--md-error));animation:onde-html 1.4s ease-out infinite;pointer-events:none;--a-i:1}
.calque>.mb.en-alerte::before{inset:6px;border-radius:50%}
.zone svg .ouv.en-alerte .cible{stroke:var(--al-c,var(--md-error));stroke-linecap:round;animation:onde-svg 1.4s ease-out infinite;--a-i:1}
/* vitrine */
.vitrine{pointer-events:none}
.vitrine .vit-fond{fill:none;stroke:var(--md-outline-variant);stroke-width:1px;stroke-dasharray:4 4;vector-effect:non-scaling-stroke}
.vitrine .vit-dehors{fill:var(--md-surface-container-high)}
.calque>.vit,.calque>.vit-pt{pointer-events:none}
.calque>.vit{font-size:.82em;white-space:normal;text-align:center;max-width:10em;line-height:1.15}
.calque>.vit.titre-v{font-weight:500;color:var(--md-on-surface);max-width:none;white-space:nowrap}
.pt.indispo{opacity:.38}
/* bulles d'appareils (style_pastilles) : taille, valeur au survol (toujours visible sans survol, tactile) ou jamais, indisponible
   en pointillé, inactive estompée, cachée (sauf en alerte) */
.calque>.pt.bs-petit{font-size:.8em}
.calque>.pt.bs-grand{font-size:1.25em}
.pt.bs-v-jamais .v{display:none}
@media (hover:hover){.pt.bs-v-survol:not(:hover):not(:focus-visible) .v{display:none}}
.pt.indispo.bs-tirets{opacity:.75;background:none;color:var(--md-on-surface-variant);box-shadow:none;outline:1.5px dashed var(--md-outline);outline-offset:-1.5px}
.pt.bs-estompe{opacity:.5}
.calque>.pt.bs-cache:not(.en-alerte){display:none}
.txt{color:var(--md-on-surface-variant);font-weight:400;white-space:nowrap;pointer-events:none}
.calque>.txt[data-t]{font-size:calc(var(--zk,1)*1em)}
.mb{min-width:44px;min-height:44px;padding:0;border:none;border-radius:22px;background:none;color:var(--md-on-surface);font:inherit;cursor:pointer;display:grid;place-items:center}
span.mb{pointer-events:none}
.edition .calque>.mb{pointer-events:none}
.mb .v{padding:.15em .55em;border-radius:999px;background:var(--md-surface-container-high);font-size:.9em;font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 1px 2px #0003}
.mb .v:empty,.mb.petit .v{display:none}
.mb.actif .v{background:var(--mb-couleur,var(--md-primary));color:var(--text-primary-color,#fff)}
.mb.actif.clair .v{color:#2b2000}
.legende{display:flex;align-items:center;gap:8px 16px;justify-content:center;margin-top:12px;
  font:400 12px/16px var(--ha-font-family-body,Roboto,system-ui,sans-serif);letter-spacing:.4px;color:var(--md-on-surface-variant);flex-wrap:wrap}
.legende span{display:inline-flex;align-items:center;gap:6px}
.degrade{width:160px;height:8px;border-radius:4px}
.legende i{display:inline-block;width:18px;height:0;border-top:3.5px solid}
@keyframes pulse{50%{opacity:.35}}
@keyframes defile{to{stroke-dashoffset:-28}}
@keyframes respire{50%{opacity:calc(1 - .32*var(--a-i,1))}}
@keyframes clignote{50%{opacity:.12}}
@keyframes halo-svg{0%,100%{stroke-opacity:0}50%{stroke-opacity:calc(.35*var(--a-i,1))}}
@keyframes onde-svg{from{stroke-width:12px;stroke-opacity:calc(.6*var(--a-i,1))}to{stroke-width:calc(12px + 70px*var(--a-i,1));stroke-opacity:0}}
@keyframes halo-html{50%{box-shadow:0 0 0 calc(4px*var(--a-i,1)) color-mix(in srgb,var(--a-c,var(--pt-couleur)) 40%,transparent),0 0 calc(16px*var(--a-i,1)) var(--a-c,var(--pt-couleur))}}
@keyframes onde-html{from{transform:scale(1);opacity:.8}to{transform:scale(calc(1 + 1.1*var(--a-i,1)));opacity:0}}
@keyframes halo-mb{50%{stroke-width:calc(2px + 5px*var(--a-i,1));stroke-opacity:.5}}
@keyframes onde-mb{from{stroke-width:2px;stroke-opacity:1}70%{stroke-width:calc(2px + 12px*var(--a-i,1));stroke-opacity:0}to{stroke-width:2px;stroke-opacity:0}}
@keyframes m-defile{to{transform:translateY(var(--m-s))}}
@keyframes m-eclair{0%,92%,100%{opacity:0}93%{opacity:1}94%{opacity:0}95.5%{opacity:.7}97%{opacity:0}}
@media (prefers-reduced-motion:reduce){.alerte-voile,.ouv .trait,.ouv .cible,.volet,.pt,.pt::before,.mb::before,.zone svg .meuble,.zone svg .meuble *,.m-defile,.m-brume{animation:none!important}.m-eclair{display:none}}
/* niveau d'animation (\`animation_level\`) : reduced = aucune boucle permanente (pulsations, ondes, météo, flux), changements d'état
   par des transitions courtes ; none = ni animation ni transition. Halos et ondes figés : liseré discret plutôt qu'un trait plein */
:is(.anim-reduit,.anim-aucune) :is(.alerte-voile,.ouv .trait,.ouv .cible,.volet,.pt,.mb,.zone svg .meuble,.zone svg .meuble *,.m-defile,.m-brume),
  :is(.anim-reduit,.anim-aucune) :is(.pt,.mb)::before{animation:none!important}
:is(.anim-reduit,.anim-aucune) .m-eclair{display:none}
:is(.anim-reduit,.anim-aucune) .ouv:is(.ouvert.a-halo,.ouvert.a-onde,.en-alerte) .cible{stroke-opacity:.3}
.anim-reduit .piece,.anim-reduit .halo,.anim-reduit .volet,.anim-reduit .pers .av,.anim-reduit .amb .amb-n,.anim-reduit .amb .amb-sol{transition-duration:.2s}
.anim-reduit .calque>.pers,.anim-reduit .calque>.amb-astre{transition-duration:.25s}
.anim-aucune,.anim-aucune *,.anim-aucune *::before,.anim-aucune *::after{transition:none!important;animation:none!important}
/* vue figée (\`interaction.lock_view\`) : ni déplacement ni zoom à la main, même dans la vue d'une pièce */
.zone.zoome.figee{touch-action:pan-y;cursor:auto}
/* pièce sans action au toucher (\`interaction.room_tap\`) */
.etq.inerte{cursor:default}
.etq.inerte::after{display:none}
`;

function clairPour(c) {
  const m = /^#([0-9a-f]{6})$/i.exec(c || "");
  if (!m) return false;
  const [r, g, b] = m[1].match(/../g).map((h) => parseInt(h, 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55;
}
function dansPoly([x, y], poly) {
  let dedans = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}
function distBord([x, y], poly) {
  let d = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length], dx = bx - ax, dy = by - ay;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    d = Math.min(d, Math.hypot(x - ax - k * dx, y - ay - k * dy));
  }
  return d;
}
const BASCULES = ["light", "switch", "fan", "input_boolean", "humidifier"];
// entités d'une pièce HA (registre affiché par le frontend : hass.entities / hass.devices)
function entitesZone(hass, zone) {
  if (!zone) return [];
  const l = [];
  for (const [id, e] of Object.entries(hass.entities || {})) {
    if (e.hidden || e.entity_category || !hass.states[id]) continue;
    if ((e.area_id || hass.devices?.[e.device_id]?.area_id) === zone) l.push(id);
  }
  return l;
}
function ilya(iso) {
  if (!iso) return _t("jamais");
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return _t("à l'instant");
  if (s < 3600) return _t("il y a {n} min", { n: Math.round(s / 60) });
  if (s < 86400) return _t("il y a {n} h", { n: Math.round(s / 3600) });
  const j = Math.round(s / 86400);
  return j < 60 ? _t("il y a {n} j", { n: j }) : new Date(iso).toLocaleDateString(_loc());
}
function entitesWidget(w) {
  const l = [w.entite, w.prix, w.periode, w.couleur_jour, w.couleur_demain, w.batterie, w.autonomie, w.puissance, w.branche, w.session_kwh, w.session_cout];
  for (const x of [...(w.lignes || []), ...(w.entites || [])]) l.push(typeof x === "string" ? x : x?.entite);
  for (const c of w.colonnes || []) l.push(c.jour, c.semaine, c.mois, c.annee);
  return l;
}
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
.vue>.col,.corps>.panneau-hote{flex:0 0 320px;align-self:stretch;min-height:0;overflow:auto;box-sizing:border-box;scrollbar-width:none}
.vue>.col::-webkit-scrollbar{display:none}
.col-in{display:flex;flex-direction:column;gap:12px}
.corps>.panneau-hote{flex-basis:360px}
.vue>.col[hidden],.corps>.panneau-hote:empty{display:none}
.col>.widgets{display:flex;flex-direction:column;gap:12px}
.col>.widgets:empty{display:none}
.corps.colonne .vue>.col,.corps.colonne>.panneau-hote{flex:1 1 auto;width:100%;max-width:720px}
ha-card:not(.plein) .corps.colonne .vue>.col,ha-card:not(.plein) .corps.colonne>.panneau-hote{flex:none;overflow:visible}
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
.corps>.panneau-hote>.ed-panneau{max-height:none!important;position:static!important;min-height:100%;box-sizing:border-box}
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

// ---------- meubles : symboles vus du dessus, dans le repère du meuble (centre 0,0 ; dos en haut) ----------
const nb = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
// couleur d'une jauge selon ses seuils { vert, jaune, rouge } : celle dont la valeur de départ est la plus haute sous la mesure
// (comme la carte Jauge de HA : { vert: 0, jaune: 800, rouge: 1200 } pour le CO₂, { rouge: 0, jaune: 20, vert: 50 } pour une batterie)
const COULEURS_SEUILS = { vert: "#188038", jaune: "#e8710a", rouge: "#d93025" };
const couleurSeuils = (seuils, n) => {
  let c = null, haut = -Infinity;
  for (const [k, col] of Object.entries(COULEURS_SEUILS)) { const v = seuils[k]; if (v === "" || v == null || !Number.isFinite(+v)) continue; if (+v <= n && +v >= haut) { haut = +v; c = col; } }
  return c;
};
// sommets d'un polygone pour l'attribut points (deux nombres par sommet, rien d'autre)
const ptsSvg = (poly) => poly.map((q) => `${+q[0]},${+q[1]}`).join(" ");
const R_ = (x, y, w, h, rx = 3, cl = "") => `<rect${cl ? ` class="${cl}"` : ""} x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="${rx}"/>`;
const C_ = (x, y, r, cl = "") => `<circle${cl ? ` class="${cl}"` : ""} cx="${x}" cy="${y}" r="${Math.max(0, r)}"/>`;
const L_ = (x1, y1, x2, y2, cl = "") => `<path class="ligne${cl ? ` ${cl}` : ""}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
const E_ = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${Math.max(0, rx)}" ry="${Math.max(0, ry)}"/>`;
function chaises(w, h, n, rond) {
  const c = 42, out = [];
  if (rond) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 2 * Math.PI - Math.PI / 2, rr = w / 2 + 10;
      out.push(`<g transform="translate(${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})">${R_(-c / 2, -c / 2, c, c, 6)}</g>`);
    }
    return out.join("");
  }
  const bouts = n >= 6 || (n === 4 && Math.abs(w - h) < 20) ? 2 : 0, cotes = n - bouts, haut = Math.ceil(cotes / 2), bas = cotes - haut;
  const ligne = (k, y) => { for (let j = 0; j < k; j++) out.push(R_(-w / 2 + (w * (j + 0.5)) / k - c / 2, y, c, c, 6)); };
  ligne(haut, -h / 2 - c + 12); ligne(bas, h / 2 - 12);
  if (bouts) out.push(R_(-w / 2 - c + 12, -c / 2, c, c, 6), R_(w / 2 - 12, -c / 2, c, c, 6));
  return out.join("");
}
function canape(w, h, places) {
  const dos = h * 0.25, bras = Math.min(25, w * 0.12), n = places || Math.max(1, Math.round((w - 2 * bras) / 65));
  let s = R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2, -h / 2, w, dos, 4) + R_(-w / 2, -h / 2, bras, h, 5) + R_(w / 2 - bras, -h / 2, bras, h, 5);
  for (let k = 1; k < n; k++) { const x = -w / 2 + bras + ((w - 2 * bras) * k) / n; s += L_(x, -h / 2 + dos, x, h / 2); }
  return s;
}
function lit(w, h, oreillers) {
  const o = 26, m = 8;
  let s = R_(-w / 2, -h / 2, w, h, 4);
  if (oreillers === 2) s += R_(-w / 2 + m, -h / 2 + m, w / 2 - 1.5 * m, o, 6) + R_(m / 2, -h / 2 + m, w / 2 - 1.5 * m, o, 6);
  else if (oreillers === 1) s += R_(-w * 0.35, -h / 2 + m, w * 0.7, o, 6);
  const y = -h / 2 + o + 2 * m + 8;
  return s + L_(-w / 2, y, w / 2, y) + `<path class="ligne" d="M${w / 2 - 28} ${y}L${w / 2} ${y + 28}"/>`;
}
const MEUBLES = {
  canape: { nom: _tk("Canapé"), cat: _tk("Séjour"), taille: [200, 90], d: (w, h) => canape(w, h) },
  canape_angle: { nom: _tk("Canapé d'angle"), cat: _tk("Séjour"), taille: [250, 200], d: (w, h) => {
    const p = Math.min(90, h * 0.45, w * 0.4), dos = p * 0.25;
    return `<path d="M${-w / 2} ${-h / 2}H${w / 2}V${-h / 2 + p}H${-w / 2 + p}V${h / 2}H${-w / 2}Z"/>` + R_(-w / 2, -h / 2, w, dos, 4) + R_(-w / 2, -h / 2, dos, h, 4)
      + R_(w / 2 - 22, -h / 2, 22, p, 5) + R_(-w / 2, h / 2 - 22, p, 22, 5) + L_(-w / 2 + p, -h / 2 + dos, -w / 2 + p, -h / 2 + p); } },
  fauteuil: { nom: _tk("Fauteuil"), cat: _tk("Séjour"), taille: [80, 80], d: (w, h) => canape(w, h, 1) },
  table_basse: { nom: _tk("Table basse"), cat: _tk("Séjour"), taille: [100, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4, "vide") },
  meuble_tv: { nom: _tk("Meuble TV"), cat: _tk("Séjour"), taille: [160, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 6, -h / 2, -w / 6, h / 2) + L_(w / 6, -h / 2, w / 6, h / 2) },
  etagere: { nom: _tk("Étagère"), cat: _tk("Séjour"), taille: [100, 35], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, 0, w / 2, 0, "tirets") },
  tapis: { nom: _tk("Tapis"), cat: _tk("Séjour"), taille: [200, 140], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4, "tirets") + R_(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 3, "tirets vide") },
  plante: { nom: _tk("Plante"), cat: _tk("Séjour"), taille: [45, 45], d: (w) => [0, 1, 2, 3, 4, 5].map((k) => C_(Math.cos(k * 1.047) * w * 0.27, Math.sin(k * 1.047) * w * 0.27, w * 0.2)).join("") + C_(0, 0, w * 0.16) },
  table_carree: { nom: _tk("Table carrée"), cat: _tk("Repas"), taille: [90, 90], chaises: 4, d: (w, h, m) => chaises(w, h, nb(m.chaises, 4)) + R_(-w / 2, -h / 2, w, h, 4) },
  table_rect: { nom: _tk("Table rectangulaire"), cat: _tk("Repas"), taille: [160, 90], chaises: 6, d: (w, h, m) => chaises(w, h, nb(m.chaises, 6)) + R_(-w / 2, -h / 2, w, h, 4) },
  table_ronde: { nom: _tk("Table ronde"), cat: _tk("Repas"), taille: [110, 110], chaises: 4, rond: true, d: (w, h, m) => chaises(w, h, nb(m.chaises, 4), true) + E_(0, 0, w / 2, h / 2) },
  chaise: { nom: _tk("Chaise"), cat: _tk("Repas"), taille: [45, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 6) + R_(-w / 2, -h / 2, w, h * 0.2, 3) },
  plan_travail: { nom: _tk("Plan de travail"), cat: _tk("Cuisine"), taille: [240, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, h / 2 - 6, w / 2, h / 2 - 6) },
  evier: { nom: _tk("Évier"), cat: _tk("Cuisine"), taille: [100, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + R_(-w / 2 + 8, -h / 2 + 14, w / 2 - 12, h - 22, 8, "vide") + R_(4, -h / 2 + 14, w / 2 - 12, h - 22, 8, "vide") + C_(0, -h / 2 + 7, 3) },
  plaques: { nom: _tk("Plaques de cuisson"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => C_(a * w * 0.22, b * h * 0.22, Math.min(w, h) * (a < 0 ? 0.16 : 0.12), "vide")).join("") },
  refrigerateur: { nom: _tk("Réfrigérateur"), cat: _tk("Cuisine"), taille: [60, 65], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) + L_(-w / 2 + 6, -h / 2 + 6, w / 2 - 6, h / 2 - 14, "tirets") },
  lave_linge: { nom: _tk("Lave-linge"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + C_(0, 2, Math.min(w, h) * 0.3, "vide") },
  lave_vaisselle: { nom: _tk("Lave-vaisselle"), cat: _tk("Cuisine"), taille: [60, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) + L_(-w / 2 + 8, -h / 2 + 10, w / 2 - 8, -h / 2 + 10, "tirets") },
  lit_simple: { nom: _tk("Lit simple"), cat: _tk("Chambre et bureau"), taille: [90, 190], d: (w, h) => lit(w, h, 1) },
  lit_double: { nom: _tk("Lit double"), cat: _tk("Chambre et bureau"), taille: [160, 200], d: (w, h) => lit(w, h, 2) },
  lit_bebe: { nom: _tk("Lit bébé"), cat: _tk("Chambre et bureau"), taille: [60, 120], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + R_(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 2, "tirets vide") },
  armoire: { nom: _tk("Armoire"), cat: _tk("Chambre et bureau"), taille: [120, 60], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2 + 6, 0, w / 2 - 6, 0, "tirets") + L_(0, h / 2 - 10, 0, h / 2) },
  commode: { nom: _tk("Commode"), cat: _tk("Chambre et bureau"), taille: [100, 50], d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + L_(-w / 2, h / 2 - 8, w / 2, h / 2 - 8) },
  bureau: { nom: _tk("Bureau"), cat: _tk("Chambre et bureau"), taille: [140, 70], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + `<g class="chaise">${R_(-22, h / 2 - 8, 44, 44, 8)}${R_(-22, h / 2 + 28, 44, 8, 3)}</g>` },
  douche: { nom: _tk("Douche"), cat: _tk("Salle d'eau"), taille: [90, 90], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + L_(-w / 2, -h / 2, w / 2, h / 2) + L_(w / 2, -h / 2, -w / 2, h / 2) + C_(0, 0, 5) },
  baignoire: { nom: _tk("Baignoire"), cat: _tk("Salle d'eau"), taille: [170, 75], d: (w, h) => R_(-w / 2, -h / 2, w, h, 8) + R_(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, Math.min(30, h / 2 - 8), "vide") + C_(w / 2 - 22, 0, 4) },
  lavabo: { nom: _tk("Lavabo"), cat: _tk("Salle d'eau"), taille: [60, 45], d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + E_(0, 4, w * 0.32, h * 0.28) + C_(0, -h / 2 + 7, 3) },
  wc: { nom: _tk("WC"), cat: _tk("Salle d'eau"), taille: [40, 65], d: (w, h) => R_(-w / 2, -h / 2, w, 18, 3) + E_(0, -h / 2 + 18 + (h - 18) * 0.48, w * 0.42, (h - 18) * 0.48) },
  chaudiere: { nom: _tk("Chaudière"), cat: _tk("Technique"), taille: [45, 35], d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(0, 0, Math.min(w, h) * 0.28, "vide") + L_(0, -Math.min(w, h) * 0.28, 0, Math.min(w, h) * 0.28) },
  ballon: { nom: _tk("Ballon d'eau chaude"), cat: _tk("Technique"), taille: [55, 55], rond: true, d: (w, h) => E_(0, 0, w / 2, h / 2) + C_(0, 0, Math.min(w, h) * 0.3, "vide") },
  espace: { nom: _tk("Espace nommé"), cat: _tk("Formes et espaces"), niveau: 0, taille: [300, 200], aide: _tk("Coin cuisine, coin bureau… : pointillés et un nom, sans capteur (ce n'est pas une pièce)"), d: (w, h) => R_(-w / 2, -h / 2, w, h, 6, "tirets zone-fond") },
  rect: { nom: _tk("Rectangle libre"), cat: _tk("Formes et espaces"), taille: [100, 60], aide: _tk("N'importe quel meuble ou objet, avec un nom"), d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) },
  cercle: { nom: _tk("Cercle libre"), cat: _tk("Formes et espaces"), taille: [60, 60], rond: true, d: (w, h) => E_(0, 0, w / 2, h / 2) },
  escalier: { nom: _tk("Escalier"), cat: _tk("Formes et espaces"), taille: [90, 280], mots: "marches", d: (w, h) => {
    const n = Math.max(3, Math.round(h / 25)); let s = R_(-w / 2, -h / 2, w, h, 1);
    for (let k = 1; k < n; k++) { const y = -h / 2 + (h * k) / n; s += L_(-w / 2, y, w / 2, y); }
    return s + `<path class="ligne" d="M0 ${h / 2 - 10}V${-h / 2 + 14}M-8 ${-h / 2 + 24}L0 ${-h / 2 + 12}L8 ${-h / 2 + 24}"/>`; } },
  table_nuit: { nom: _tk("Table de nuit"), cat: _tk("Chambre et bureau"), taille: [45, 40], mots: "chevet", d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(0, 0, Math.min(w, h) * 0.18, "vide") },
  cheminee: { nom: _tk("Cheminée / poêle"), cat: _tk("Séjour"), taille: [100, 50], mots: "poele foyer insert", d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + `<path class="ligne" d="M${-w * 0.3} ${h / 2}V${-h * 0.1}Q0 ${-h * 0.45} ${w * 0.3} ${-h * 0.1}V${h / 2}"/>` },
  radiateur: { nom: _tk("Radiateur"), cat: _tk("Technique"), taille: [80, 12], mots: "chauffage", d: (w, h) => {
    let s = R_(-w / 2, -h / 2, w, h, 2); for (let k = 1; k < Math.round(w / 8); k++) { const x = -w / 2 + k * 8; s += L_(x, -h / 2, x, h / 2); } return s; } },
  tableau_elec: { nom: _tk("Tableau électrique"), cat: _tk("Technique"), taille: [50, 15], mots: "disjoncteur linky compteur", d: (w, h) => R_(-w / 2, -h / 2, w, h, 2) + `<path class="ligne" d="M${-w * 0.08} ${-h * 0.35}L${-w * 0.16} ${h * 0.05}H${w * 0.1}L${w * 0.02} ${h * 0.4}"/>` },
  box: { nom: _tk("Box internet / NAS"), cat: _tk("Technique"), taille: [35, 25], mots: "routeur serveur nas wifi", d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + C_(-w * 0.25, 0, 2) + C_(0, 0, 2) + C_(w * 0.25, 0, 2) },
  borne_recharge: { nom: _tk("Borne de recharge"), cat: _tk("Technique"), taille: [30, 20], mots: "wallbox voiture electrique prise", d: (w, h) => R_(-w / 2, -h / 2, w, h, 4) + `<path class="ligne" d="M2 ${-h * 0.35}L${-4} 1H3L-2 ${h * 0.35}"/>` },
  pac: { nom: _tk("Pompe à chaleur / clim (extérieur)"), cat: _tk("Technique"), taille: [90, 35], mots: "pac climatisation groupe", d: (w, h) => R_(-w / 2, -h / 2, w, h, 3) + C_(w * 0.15, 0, h * 0.38, "vide") + L_(w * 0.15 - h * 0.3, 0, w * 0.15 + h * 0.3, 0) },
  // vue de dessus d'une citadine (avant en haut) : caisse aux angles arrondis, pare-brise et lunette, toit, rétroviseurs, roues
  voiture: { nom: _tk("Voiture"), cat: _tk("Extérieur"), taille: [178, 406], mots: "auto carport garage", d: (w, h) => {
    const u = w / 2, v = h / 2, y = (k) => -v + k * h;
    const caisse = `<path d="M${-u * 0.68} ${-v}H${u * 0.68}Q${u} ${-v} ${u} ${y(0.13)}V${v - 0.09 * h}Q${u} ${v} ${u * 0.72} ${v}H${-u * 0.72}Q${-u} ${v} ${-u} ${v - 0.09 * h}V${y(0.13)}Q${-u} ${-v} ${-u * 0.68} ${-v}Z"/>`;
    const roue = (sx, k) => R_(sx < 0 ? -u - w * 0.03 : u - w * 0.05, y(k), w * 0.08, h * 0.12, 3);
    return roue(-1, 0.13) + roue(1, 0.13) + roue(-1, 0.72) + roue(1, 0.72) + caisse
      + `<path class="vide" d="M${-u * 0.8} ${y(0.4)}L${-u * 0.64} ${y(0.27)}Q0 ${y(0.24)} ${u * 0.64} ${y(0.27)}L${u * 0.8} ${y(0.4)}Q0 ${y(0.37)} ${-u * 0.8} ${y(0.4)}Z"/>`
      + R_(-u * 0.74, y(0.42), w * 0.74, h * 0.29, 8, "vide")
      + `<path class="vide" d="M${-u * 0.74} ${y(0.73)}Q0 ${y(0.75)} ${u * 0.74} ${y(0.73)}L${u * 0.6} ${y(0.83)}Q0 ${y(0.85)} ${-u * 0.6} ${y(0.83)}Z"/>`
      + `<path d="M${-u} ${y(0.33)}L${-u - w * 0.09} ${y(0.31)}V${y(0.36)}L${-u} ${y(0.37)}Z"/><path d="M${u} ${y(0.33)}L${u + w * 0.09} ${y(0.31)}V${y(0.36)}L${u} ${y(0.37)}Z"/>`
      + L_(-u * 0.5, -v + 3, -u * 0.2, -v + 3) + L_(u * 0.2, -v + 3, u * 0.5, -v + 3);
  } },
  velo: { nom: _tk("Vélo"), cat: _tk("Extérieur"), taille: [60, 180], d: (w, h) => C_(0, -h / 2 + 30, 28, "vide") + C_(0, h / 2 - 30, 28, "vide") + L_(0, -h / 2 + 30, 0, h / 2 - 30) + L_(-w / 2 + 6, -h / 2 + 50, w / 2 - 6, -h / 2 + 50) },
  arbre: { nom: _tk("Arbre / arbuste"), cat: _tk("Extérieur"), taille: [200, 200], rond: true, mots: "haie jardin", d: (w) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => C_(Math.cos(k * 0.785) * w * 0.3, Math.sin(k * 0.785) * w * 0.3, w * 0.22)).join("") + C_(0, 0, w * 0.3) },
  piscine: { nom: _tk("Piscine"), cat: _tk("Extérieur"), taille: [800, 400], d: (w, h) => R_(-w / 2, -h / 2, w, h, 20) + R_(-w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 14, "eau") },
};
// tapis et espaces sous les autres meubles, quel que soit l'ordre de pose
MEUBLES.tapis.niveau = 0;
Object.assign(MEUBLES.canape, { mots: "sofa divan" }); Object.assign(MEUBLES.refrigerateur, { mots: "frigo congelateur" }); Object.assign(MEUBLES.wc, { mots: "toilettes" });
Object.assign(MEUBLES.plan_travail, { mots: "cuisine ilot comptoir" }); Object.assign(MEUBLES.lave_linge, { mots: "machine a laver seche linge" });
Object.assign(MEUBLES.chaudiere, { mots: "gaz chauffe eau" }); Object.assign(MEUBLES.armoire, { mots: "placard penderie dressing" }); Object.assign(MEUBLES.plante, { mots: "fleur pot" });
Object.setPrototypeOf(MEUBLES, null); // « constructor », « toString »… ne sont pas des types de meuble
// YAML écrit à la main : on remet chaque meuble dans une forme que le dessin et l'éditeur savent lire (sans perdre les clés inconnues)
const normaliserMeubles = (liste) => (Array.isArray(liste) ? liste : []).filter((m) => m && typeof m === "object" && !Array.isArray(m)).map((m) => {
  const n = { ...m }, def = MEUBLES[n.type], borne = (v, d) => Math.max(5, Math.min(5000, nb(v, d)));
  n.pos = [nb(n.pos?.[0]), nb(n.pos?.[1])];
  if (n.taille != null) {
    const t = Array.isArray(n.taille) ? n.taille : [n.taille, n.taille], d = def?.taille || [60, 60];
    n.taille = [borne(t[0], d[0]), borne(t[1] ?? t[0], d[1])];
  }
  if (n.rotation != null) n.rotation = nb(n.rotation);
  if (n.chaises != null) n.chaises = Math.max(0, Math.min(12, Math.round(nb(n.chaises))));
  if (n.teinte != null) n.teinte = n.teinte !== false && n.teinte !== "false";
  if (n.type === "forme") n.forme = normaliserForme(n.forme); else delete n.forme;
  // meuble connecté : mêmes clés que les pastilles ; une valeur invalide est retirée, jamais d'erreur
  for (const k of ["entite", "valeur", "actif"]) if (k in n && !(typeof n[k] === "string" && n[k].includes("."))) delete n[k];
  for (const k of ["unite", "actif_attribut", "attribut", "couleur"]) if (k in n && typeof n[k] !== "string") delete n[k];
  if ("couleur" in n && !COULEUR_SURE.test(n.couleur)) delete n.couleur;
  if ("seuil" in n) { if (n.seuil !== "" && n.seuil !== null && typeof n.seuil !== "boolean" && Number.isFinite(+n.seuil)) n.seuil = +n.seuil; else delete n.seuil; }
  if ("decimales" in n) { if (n.decimales !== null && n.decimales !== "" && Number.isFinite(+n.decimales)) n.decimales = Math.max(0, Math.min(6, Math.round(+n.decimales))); else delete n.decimales; }
  normaliserFiche(n);
  return n;
});
// `clic`, `protege` et `fiche` d'un meuble, d'une ouverture ou d'une pastille (objet déjà copié) : valeur invalide retirée ou corrigée
function normaliserFiche(n) {
  if ("clic" in n && !CLICS_MEUBLE.includes(n.clic)) delete n.clic;
  if ("protege" in n && typeof n.protege !== "boolean") n.protege = !!n.protege;
  if ("fiche" in n) {
    const f = Array.isArray(n.fiche) ? { widgets: n.fiche } : n.fiche;
    if (!f || typeof f !== "object") delete n.fiche;
    else {
      n.fiche = { ...f };
      if ("titre" in n.fiche && typeof n.fiche.titre !== "string") n.fiche.titre = n.fiche.titre == null ? "" : String(n.fiche.titre);
      if ("widgets" in n.fiche) n.fiche.widgets = normaliserWidgets((Array.isArray(n.fiche.widgets) ? n.fiche.widgets : []).filter((w) => w && typeof w === "object" && !Array.isArray(w)));
      // bouton « Plus d'infos » : false (masqué), une entité, un chemin de tableau de bord (/…) ou une URL (http…) ; sinon valeur par défaut
      if ("plus_infos" in n.fiche) {
        const v = n.fiche.plus_infos;
        if (v === false || v === "false" || v === "none") n.fiche.plus_infos = false;
        else if (typeof v === "string" && v.trim()) n.fiche.plus_infos = v.trim();
        else delete n.fiche.plus_infos;
      }
    }
  }
  return n;
}
// ouvertures : `battants` 1 ou 2, `ouvrant` connu, `vers_dehors` booléen ; une valeur invalide est retirée (seules les ouvertures
// qui portent ces clés sont copiées)
const normaliserOuvertures = (l) => (Array.isArray(l) ? l.map((o) => {
  if (!o || typeof o !== "object" || !("battants" in o || "ouvrant" in o || "vers_dehors" in o)) return o;
  const n = { ...o };
  if ("battants" in n) { if (+n.battants === 1 || +n.battants === 2) n.battants = +n.battants; else delete n.battants; }
  if ("ouvrant" in n && !OUVRANTS.includes(n.ouvrant)) delete n.ouvrant;
  if ("vers_dehors" in n) { if (n.vers_dehors === true || n.vers_dehors === "true") n.vers_dehors = true; else delete n.vers_dehors; }
  return n;
}) : l);
// modèles de meubles (« Mes modèles ») : couleur validée, forme bornée, comme un meuble posé (rien n'est dessiné d'un modèle invalide)
const normaliserModeles = (l) => (Array.isArray(l) ? l.map((m) => {
  if (!m || typeof m !== "object" || m.genre !== "meuble" || !m.objet || typeof m.objet !== "object") return m;
  const o = { ...m.objet };
  if ("couleur" in o && !(typeof o.couleur === "string" && COULEUR_SURE.test(o.couleur))) delete o.couleur;
  if ("forme" in o) o.forme = normaliserForme(o.forme);
  if ("taille" in o) { const t = Array.isArray(o.taille) ? o.taille : [o.taille, o.taille]; o.taille = [0, 1].map((j) => Math.max(5, Math.min(5000, nb(t[j] ?? t[0], 60)))); }
  const n = { ...m, objet: o };
  if ("cat" in n && !Object.hasOwn(V_CATS_MEUBLES, n.cat)) delete n.cat;
  return n;
}) : l);
// ouvertures et pastilles : seules celles qui portent `clic`, `protege` ou `fiche` sont copiées (les autres restent telles quelles)
const normaliserPorteurs = (liste) => (Array.isArray(liste) ? liste.map((o) => (o && typeof o === "object" && !Array.isArray(o) && ("clic" in o || "protege" in o || "fiche" in o) ? normaliserFiche({ ...o }) : o)) : liste);
// widgets `commande` (entité cover ou valve seulement) et `serrure` (lock seulement) : `confirmer` booléen, `lignes` en liste ;
// les autres widgets ne sont pas touchés
const DOMAINES_CMD = { commande: /^(cover|valve)\./, serrure: /^lock\./ };
const normaliserWidgets = (l) => (Array.isArray(l) ? l.map((w) => {
  if (!Object.hasOwn(DOMAINES_CMD, w?.type)) return w;
  const n = { ...w };
  if ("entite" in n && !(typeof n.entite === "string" && DOMAINES_CMD[w.type].test(n.entite))) delete n.entite;
  if ("confirmer" in n && typeof n.confirmer !== "boolean") { if (n.confirmer == null || n.confirmer === "") delete n.confirmer; else n.confirmer = !["false", "non", "0", "off", "no"].includes(String(n.confirmer).toLowerCase()); }
  if ("lignes" in n && !Array.isArray(n.lignes)) delete n.lignes;
  return n;
}) : l);
// widgets des panneaux (maison et pièces) : même normalisation, la config d'origine n'est jamais modifiée
function normaliserPanneaux(p) {
  if (!p || typeof p !== "object" || Array.isArray(p) || ![p.gauche, p.droite].some((l) => Array.isArray(l) && l.some((w) => Object.hasOwn(DOMAINES_CMD, w?.type)))) return p;
  const n = { ...p };
  for (const k of ["gauche", "droite"]) if (Array.isArray(n[k])) n[k] = normaliserWidgets(n[k]);
  return n;
}
// meuble connecté : lié à une entité, une valeur ou une fiche ; au toucher : fiche, plus d'infos HA ou rien
const CLICS_MEUBLE = ["fiche", "infos", "aucun"];
// couleur écrite dans la config (pastilles, widgets, jauges, meubles, animations, traces, flux) : #hex, rgb() / hsl() aux valeurs
// numériques, nom de couleur CSS ou var(--…) ; rien d'autre (ni « ; », ni url(), ni expression) n'arrive jamais dans un style
const COULEUR_SURE = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|var\(--[\w-]{1,60}\)|(?:rgb|hsl)a?\(\s*-?\d{1,3}(?:\.\d+)?(?:deg|%)?(?:\s*[,\s]\s*-?\d{1,3}(?:\.\d+)?%?){2}(?:\s*[,/]\s*\d{0,3}(?:\.\d+)?%?)?\s*\))$/i;
// la couleur si elle est sûre, sinon null
const couleurSure = (c) => (typeof c === "string" && COULEUR_SURE.test(c) ? c : null);
// couleur d'un meuble connecté sur le plan : la sienne, sinon celle de son type, sinon l'accent du thème
const COULEURS_TYPE = { refrigerateur: "#29b6f6", meuble_tv: "#7e57c2", bureau: "#fb8c00", tableau_elec: "#fbc02d", box: "#26a69a", chaudiere: "#ef5350", radiateur: "#ef5350",
  voiture: "#43a047", borne_recharge: "#43a047", lave_linge: "#42a5f5", lave_vaisselle: "#42a5f5", pac: "#26c6da", plaques: "#ff7043", ballon: "#ef5350" };
const couleurMeuble = (m) => (m?.couleur && COULEUR_SURE.test(m.couleur) ? m.couleur : COULEURS_TYPE[m?.type] || null);
const estConnecte = (m) => !!(m && (m.entite || m.valeur || m.fiche));
const clicMeuble = (m) => (CLICS_MEUBLE.includes(m.clic) ? m.clic : m.fiche ? "fiche" : m.entite || m.valeur ? "infos" : "aucun");
// fiches : portées par un meuble, une ouverture ou une pastille ; la sélection d'un de leurs widgets porte { meuble | ouverture | point: i }
const GENRES_FICHE = { meuble: "meubles", ouverture: "ouvertures", point: "points" };
const porteurDe = (s) => { const g = s && Object.keys(GENRES_FICHE).find((k) => s[k] != null); return g ? { genre: g, i: s[g] } : null; };
// suffixe des widgets d'une fiche (« fiche:1:5 » pour le meuble 5, « fiche:1:5:ouverture », « fiche:1:5:point »)
const sufFiche = (pf) => `:${pf.i}${pf.genre === "meuble" ? "" : `:${pf.genre}`}`;
// ouverture ou pastille : « fiche » si elle en a une (ou `clic` choisi) ; null = pas de réglage, le comportement d'avant
const clicPorteur = (o) => (CLICS_MEUBLE.includes(o?.clic) ? o.clic : o?.fiche ? "fiche" : null);
// ---------- animations : bibliothèque réglable par événement (`animations.<événement>`) et par élément (`animation`) ----------
const ANIMATIONS = { aucune: _tk("Aucune"), pulsation: _tk("Pulsation"), respiration: _tk("Respiration (douce)"), clignote: _tk("Clignotement"),
  halo: _tk("Halo lumineux"), onde: _tk("Onde"), defilement: _tk("Défilement (traits, volets)") };
const EVENEMENTS_ANIM = {
  ouverture: { nom: _tk("Porte ou fenêtre ouverte"), defaut: { type: "pulsation", duree: 1.6 } },
  volet: { nom: _tk("Volet en mouvement"), defaut: { type: "defilement", duree: 0.8 } },
  alerte: { nom: _tk("Pastille en alerte"), defaut: { type: "pulsation", duree: 1.2 } },
  lumiere: { nom: _tk("Lumière allumée"), defaut: { type: "aucune", duree: 2.4 } },
  appareil: { nom: _tk("Appareil actif"), defaut: { type: "aucune", duree: 2 } },
  meuble: { nom: _tk("Meuble connecté actif"), defaut: { type: "aucune", duree: 2.4 } },
};
const evenementPoint = (p) => (p.alerte ? "alerte" : (p.entite || "").startsWith("light.") ? "lumiere" : "appareil");
// réglage effectif : défaut de l'événement, puis celui du plan, puis celui de l'élément (objet ou simple nom de type)
function animDe(c, ev, o, cle = "animation") {
  const lire = (v) => (typeof v === "string" ? { type: v } : v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const a = { ...EVENEMENTS_ANIM[ev].defaut, ...lire(c.animations?.[ev]), ...lire(o?.[cle]) };
  if (!ANIMATIONS[a.type]) a.type = EVENEMENTS_ANIM[ev].defaut.type;
  return a;
}
// classe a-<type> (+ a-contour) et variables CSS : --a-d durée, --a-i intensité, --a-c couleur
const classeAnim = (a) => ` a-${a.type}${a.forme === "contour" ? " a-contour" : ""}`;
const styleAnim = (a) => {
  const d = Math.min(20, Math.max(0.2, +a.duree || 1.6)), i = Math.min(2, Math.max(0.2, +a.intensite || 1));
  return `--a-d:${d}s;--a-i:${i}${a.couleur && COULEUR_SURE.test(a.couleur) ? `;--a-c:${a.couleur}` : ""}`;
};

// ---------- interaction (`interaction`), tablette murale (`tablette`), niveau d'animation (`niveau_animation`) ----------
// sans ces clés : comportement d'origine (vue de la pièce au toucher, déplacement et zoom libres, pas de retour automatique)
const CLICS_PIECE = ["vue", "infos", "aucun"], NIVEAUX_ANIM = ["complet", "reduit", "aucun"];
const objetSimple = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const interactionDe = (c) => {
  const o = objetSimple(c?.interaction) ? c.interaction : {}, s = Number.isFinite(+o.retour_apres) ? +o.retour_apres : 0;
  return { clic: CLICS_PIECE.includes(o.clic_piece) ? o.clic_piece : "vue", figee: o.vue_figee === true, retour: Math.min(86400, Math.max(0, s)) };
};
// mode tablette : `true` = { resume: false, panneaux: false, anti_marquage: true } ; un objet règle chaque point (les clés absentes gardent ces valeurs)
const tabletteDe = (c) => {
  const t = c?.tablette;
  if (t !== true && !objetSimple(t)) return null;
  const o = t === true ? {} : t;
  return { resume: o.resume === true, panneaux: o.panneaux === true, anti_marquage: o.anti_marquage !== false };
};
const niveauAnimDe = (c) => (NIVEAUX_ANIM.includes(c?.niveau_animation) ? c.niveau_animation : "complet");
// anti-marquage : la carte se décale d'un pixel toutes les 3 minutes, en serpentin sur un carré de 5 × 5 px parcouru en aller-retour
// (jamais plus de 2 px par axe, 2,8 px au plus du point de départ, jamais de saut) ; position 12 = au centre, sans décalage
const PAS_ANTI_MARQUAGE = 180000;
const decalageAntiMarquage = (n) => {
  const k = ((n % 48) + 48) % 48, j = k < 25 ? k : 48 - k, r = Math.floor(j / 5), q = j % 5;
  return [(r % 2 ? 4 - q : q) - 2, r - 2];
};
// YAML écrit à la main : booléens et nombres écrits en texte (la config d'origine n'est jamais modifiée)
function normaliserInteraction(c) {
  const bool = (v) => (typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v);
  if (objetSimple(c.interaction)) {
    const o = { ...c.interaction };
    if ("vue_figee" in o) o.vue_figee = bool(o.vue_figee);
    if ("retour_apres" in o && typeof o.retour_apres === "string" && o.retour_apres.trim() && Number.isFinite(+o.retour_apres)) o.retour_apres = +o.retour_apres;
    c.interaction = o;
  }
  if ("tablette" in c) c.tablette = bool(c.tablette);
  if (objetSimple(c.tablette)) { const o = { ...c.tablette }; for (const k of ["resume", "panneaux", "anti_marquage"]) if (k in o) o[k] = bool(o[k]); c.tablette = o; }
  return c;
}

// ---------- ambiance (`ambiance`) : jour / nuit d'après sun.sun, météo de HA sur les extérieurs, traces des derniers changements ----------
const INTENSITES = { discret: 0.45, normal: 0.7, fort: 1 };
const intensiteAmb = (a) => (typeof a?.intensite === "number" ? Math.min(1, Math.max(0, a.intensite)) : INTENSITES[a?.intensite] ?? INTENSITES.discret);
// couche : absente si false ; true / absente = réglages par défaut ; objet = ses réglages
const objAmb = (v, def) => (v === false || v == null && !def ? null : v && typeof v === "object" && !Array.isArray(v) ? v : {});
const coucheJour = (a) => (a ? objAmb(a.jour_nuit, true) : null);
const coucheMeteo = (a) => { if (!a) return null; const v = a.meteo; if (typeof v === "string") return v.startsWith("weather.") ? { entite: v } : null; const o = objAmb(v, false); return o?.entite ? o : null; };
const coucheTraces = (a) => {
  if (!a) return null;
  const v = a.traces, o = typeof v === "number" ? { duree: v } : objAmb(v, true);
  if (!o) return null;
  const d = +(o.duree ?? 10);
  return d > 0 ? { ...o, duree: Math.min(240, d) } : null;
};
const alea = (graine) => { let x = graine; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
const borne = (v, a, b) => Math.min(b, Math.max(a, v));
// météo peinte sur les extérieurs (vue de dessus) : ombres de nuages qui passent, pluie, neige, grêle, vent, brouillard, éclairs ;
// tout part dans le sens du vent (wind_bearing = d'où il vient) ; tirages au hasard mais toujours les mêmes (graine fixe).
// Pluie, neige, grêle et vent = motifs répétés (densité constante, quelques nœuds seulement) qui glissent en SMIL (pauseAnimations hors écran)
function dessinMeteo(w, b, nord, I, fixe = false, pre = "amb", e = 1, sens = 135) {
  const at = w.attributes || {}, cond = w.state;
  const S = Math.hypot(b.W, b.H) * 1.05, cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, r = alea(7);
  const u = at.wind_speed_unit, v0 = +at.wind_speed || 0, v = u === "m/s" ? v0 * 3.6 : u === "mph" ? v0 * 1.609 : u === "kn" ? v0 * 1.852 : v0;
  // sens du déplacement (degrés horaires depuis le haut) : 135 = d'en haut à gauche vers en bas à droite (défaut) ; « vent » = le vent réel
  const dir = sens === "vent" ? (v > 3 && at.wind_bearing != null && !isNaN(+at.wind_bearing) ? +at.wind_bearing + 180 + nord : 180) : Number.isFinite(+sens) ? +sens : 135, a = (dir - 180).toFixed(1);
  const f0 = (x) => x.toFixed(1);
  let h = "", n = 0;
  // motif de côté T avec k formes, qui glisse de T le long de +y (local, tourné dans le sens du vent) en `duree` secondes
  const motif = (T0, k, forme, duree, op) => {
    const T = T0 * e, id = `${pre}-m${n++}`, l = [];
    for (let q = 0; q < k; q++) { const x = r() * T, y = r() * T; l.push(forme(x, y), forme(x, y - T), forme(x - T, y), forme(x - T, y - T)); }
    const anim = fixe ? "" : `<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 ${T}" dur="${duree}s" repeatCount="indefinite" additive="sum"/>`;
    h += `<pattern id="${id}" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})">${l.join("")}${anim}</pattern>
      <rect x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="url(#${id})" opacity="${op.toFixed(3)}"/>`;
  };
  const L = (lg, ep, col) => (x, y) => `<line x1="${f0(x)}" y1="${f0(y)}" x2="${f0(x)}" y2="${f0(y + lg * e)}" stroke="${col}" stroke-width="${f0(ep * e)}" stroke-linecap="round"/>`;
  const C = (ray, col) => (x, y) => `<circle cx="${f0(x)}" cy="${f0(y)}" r="${f0(ray * e)}" fill="${col}"/>`;
  const couv = at.cloud_coverage != null && !isNaN(+at.cloud_coverage) ? +at.cloud_coverage : { sunny: 5, "clear-night": 5, partlycloudy: 45, windy: 20, "windy-variant": 50 }[cond] ?? 90;
  const nn = Math.round(couv / 22);
  if (nn) {
    // ombres de nuages : grandes taches floues (dégradé radial, sans filtre) qui traversent le plan en boucle
    const p = Array.from({ length: nn }, () => { const rx = S * (0.11 + r() * 0.09); return [cx - S / 2 + r() * S, cy - S / 2 + r() * S, rx, rx * (0.55 + r() * 0.2)]; });
    const un = (dy) => p.map(([x, y, rx, ry]) => `<ellipse cx="${x.toFixed(0)}" cy="${(y + dy).toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="url(#${pre}-nuage)"/>`).join("");
    const opn = I * 0.3 * Math.min(1, couv / 80);
    h += `<g class="m-nuages" data-op="${opn.toFixed(3)}" transform="rotate(${a} ${cx.toFixed(0)} ${cy.toFixed(0)})" opacity="${opn.toFixed(3)}"><g class="m-defile" style="--m-s:${S.toFixed(0)}px;--m-d:${Math.round(borne(520 / (1 + v / 8), 70, 520))}s">${un(0)}${un(-S)}</g></g>`;
  }
  if (["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(cond)) {
    const fort = cond === "pouring";
    motif(100, fort ? 6 : cond === "snowy-rainy" ? 2 : 3, L(fort ? 30 : 22, 1.6, "#90caf9"), fort ? 0.3 : 0.4, I * 0.9);
  }
  if (cond === "snowy" || cond === "snowy-rainy") motif(120, cond === "snowy" ? 5 : 3, C(3, "#ffffff"), 4, I);
  if (cond === "hail") motif(100, 4, C(2.5, "#e3f2fd"), 0.35, I);
  if (cond === "windy" || cond === "windy-variant") motif(400, 5, L(120, 1.2, "#ffffff"), 0.8, I * 0.5);
  if (cond === "fog") h += `<g opacity="${Math.min(0.6, I * 0.55).toFixed(3)}"><rect class="m-brume" x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="#cfd8dc"/></g>`;
  if (cond === "lightning" || cond === "lightning-rainy") h += `<g opacity="${(I * 0.6).toFixed(3)}"><rect class="m-eclair" x="${b.x0}" y="${b.y0}" width="${b.W}" height="${b.H}" fill="#ffffff"/></g>`;
  return h;
}
// flux d'énergie (`ambiance.energie`) : du tableau électrique vers chaque meuble / pastille dont la valeur est une puissance ;
// des billes avancent à une vitesse qui suit la puissance (échelle logarithmique), plus nombreuses quand elle est forte
const coucheEnergie = (a) => (a ? objAmb(a.energie, false) : null);
const enWatts = (s) => { const v = parseFloat(s?.state), u = s?.attributes?.unit_of_measurement; return isNaN(v) ? null : u === "kW" ? v * 1000 : u === "W" ? v : u === "MW" ? v * 1e6 : null; };
function dessinFlux(l, rb, fixe) {
  return l.map(({ de, vers, w, col }) => {
    const [sx, sy] = de, [tx, ty] = vers, dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) || 1;
    const qx = (sx + tx) / 2 - (dy / L) * L * 0.15, qy = (sy + ty) / 2 + (dx / L) * L * 0.15;
    const d = `M${sx.toFixed(0)} ${sy.toFixed(0)}Q${qx.toFixed(0)} ${qy.toFixed(0)} ${tx.toFixed(0)} ${ty.toFixed(0)}`;
    const dur = borne(5 / (0.4 + Math.log10(1 + w / 20)), 0.7, 9), n = 1 + Math.min(3, Math.floor(Math.log10(Math.max(1, w))));
    const billes = fixe ? "" : Array.from({ length: n }, (_, k) => `<circle r="${rb.toFixed(1)}" fill="${col}"><animateMotion dur="${dur.toFixed(2)}s" begin="${(-k * dur / n).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`).join("");
    return `<path d="${d}" fill="none" stroke="${col}" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>${billes}`;
  }).join("");
}
// personnes (`ambiance.personnes`) : à la maison autour d'un point (`maison`), dehors au bord du plan dans leur direction réelle
const couchePersonnes = (a) => {
  const v = a?.personnes;
  if (!v) return null;
  const lire = (l) => l.map((x) => (typeof x === "string" ? { entite: x } : x)).filter((x) => typeof x?.entite === "string" && x.entite.startsWith("person."));
  if (v === true) return { auto: true };
  if (Array.isArray(v)) return { liste: lire(v) };
  return typeof v === "object" ? { ...v, liste: Array.isArray(v.entites) ? lire(v.entites) : null, auto: !Array.isArray(v.entites) } : null;
};
// affichage d'une personne : `par_personne[entité]` prime sur les réglages communs ; valeur absente ou inconnue = la première (comportement d'origine)
const AFF_PERSONNE = { dehors: ["direction", "zone", "cache"], chez_soi: ["groupe", "cache"], avatar: ["photo", "initiales"] };
const affPersonne = (P, e) => {
  const pp = P?.par_personne && typeof P.par_personne === "object" ? P.par_personne[e] : null, o = {};
  for (const [k, l] of Object.entries(AFF_PERSONNE)) o[k] = [pp?.[k], P?.[k]].find((x) => l.includes(x)) || l[0];
  return o;
};
const capDistance = (la1, lo1, la2, lo2) => {
  const r = Math.PI / 180, p1 = la1 * r, p2 = la2 * r, dl = (lo2 - lo1) * r;
  const cap = (Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / r + 360) % 360;
  const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return { cap, km: 12742 * Math.asin(Math.min(1, Math.sqrt(h))) };
};
// bulles d'appareils (`style_pastilles`) : indisponibles, inactives, taille, valeurs ; valeur absente ou inconnue = la première (comportement d'origine)
const STYLE_PASTILLES = { indisponible: ["estompe", "tirets", "cache"], inactif: ["visible", "actif_seul", "estompe"], taille: ["normal", "petit", "grand"], valeurs: ["toujours", "survol", "jamais"] };
const stylePastilles = (c) => {
  const v = c?.style_pastilles && typeof c.style_pastilles === "object" ? c.style_pastilles : {}, o = {};
  for (const [k, l] of Object.entries(STYLE_PASTILLES)) o[k] = l.includes(v[k]) ? v[k] : l[0];
  return o;
};
// classes fixes d'une bulle (aucune avec les réglages d'origine)
const classesPastilles = (st) => (st.taille !== "normal" ? ` bs-${st.taille}` : "") + (st.valeurs !== "toujours" ? ` bs-v-${st.valeurs}` : "") + (st.indisponible === "tirets" ? " bs-tirets" : "");
// alertes plein plan (`alertes`) : liste de règles ; critique > alerte > info
// attributs qui ne changent pas avec l'état (repris de l'état actuel pendant le replay)
const ATTRS_FIXES = ["friendly_name", "unit_of_measurement", "device_class", "state_class", "icon", "supported_features", "supported_color_modes", "options"];
const NIVEAUX_ALERTE = { critique: { r: 3, icone: "mdi:alarm-light" }, alerte: { r: 2, icone: "mdi:alert" }, info: { r: 1, icone: "mdi:information" } };
const ETATS_ALERTE = ["on", "open", "triggered", "detected"];
// vitrine (`vitrine: true`) : exemples d'animations et d'ambiance dessinés sous le plan
const VITRINE_METEO = [["partlycloudy", _tk("Nuages")], ["rainy", _tk("Pluie")], ["pouring", _tk("Averse")], ["snowy", _tk("Neige")], ["hail", _tk("Grêle")], ["fog", _tk("Brouillard")], ["lightning-rainy", _tk("Orage")], ["windy", _tk("Vent")]];
const VITRINE_AMB = [["nuit", _tk("Nuit")], ["dore", _tk("Soleil bas")], ["trace", _tk("Trace (vient de changer)")], ["flux", _tk("Flux d'énergie")], ["alerte", _tk("Alerte")], ["personne", _tk("Personne dehors")]];
function geoVitrine(c, base) {
  const V = c.vitrine && typeof c.vitrine === "object" ? c.vitrine : {}, m = c.marge ?? 40;
  const w = Math.max(700, +V.largeur || base.W - 2 * m), x = Array.isArray(V.pos) ? nb(V.pos[0]) : base.x0 + m, y = Array.isArray(V.pos) ? nb(V.pos[1]) : base.y0 + base.H + Math.max(40, w / 25);
  const ca = w / 7, th = ca * 0.22, ha = ca * 0.62, cm = w / 8, hm = cm * 0.62;
  return { x, y, w, ca, th, ha, cm, hm, H: th * 3 + ha + hm * 2 + th * 1.4 };
}
const ICONES_MESURE = { temperature: "mdi:thermometer", humidity: "mdi:water-percent", power: "mdi:flash", energy: "mdi:lightning-bolt", battery: "mdi:battery",
  co2: "mdi:molecule-co2", carbon_dioxide: "mdi:molecule-co2", carbon_monoxide: "mdi:molecule-co", pressure: "mdi:gauge", illuminance: "mdi:brightness-5", voltage: "mdi:sine-wave", current: "mdi:current-ac", monetary: "mdi:cash", pm25: "mdi:blur" };
const ICONES_OUVERTURE = { fenetre: ["mdi:window-closed-variant", "mdi:window-open-variant"], porte: ["mdi:door-closed", "mdi:door-open"], portail: ["mdi:garage-variant", "mdi:garage-open-variant"] };
const NOMS_OUVERTURE = { fenetre: _tk("Fenêtre"), porte: _tk("Porte"), portail: _tk("Portail") };
// widget `commande` (cover) : icône fermée / ouverte selon la device_class, services permis, confirmation par défaut
const ICONES_COVER = { garage: ["mdi:garage-variant", "mdi:garage-open-variant"], gate: ["mdi:gate", "mdi:gate-open"], door: ["mdi:door-closed", "mdi:door-open"],
  curtain: ["mdi:curtains-closed", "mdi:curtains"], blind: ["mdi:blinds-horizontal-closed", "mdi:blinds-horizontal"], awning: ["mdi:awning-outline", "mdi:awning-outline"], _: ["mdi:window-shutter", "mdi:window-shutter-open"] };
const COMMANDES = { ouvrir: ["open_cover", _tk("Ouvrir"), "mdi:arrow-up"], stop: ["stop_cover", _tk("Stop"), "mdi:stop"], fermer: ["close_cover", _tk("Fermer"), "mdi:arrow-down"] };
const CONFIRMER_COVER = ["garage", "gate", "door"];
// services permis par domaine : widget `commande` (cover, valve) et `serrure` (lock) ; rien d'autre n'est jamais appelé
const SERVICES_CMD = { cover: { ouvrir: "open_cover", stop: "stop_cover", fermer: "close_cover" }, valve: { ouvrir: "open_valve", stop: "stop_valve", fermer: "close_valve" },
  lock: { verrouiller: "lock", deverrouiller: "unlock", ouvrir: "open" } };
const COMMANDES_SERRURE = { verrouiller: [_tk("Verrouiller"), "mdi:lock"], deverrouiller: [_tk("Déverrouiller"), "mdi:lock-open-variant"], ouvrir: [_tk("Ouvrir##serrure"), "mdi:door-open"] };
// capteurs binaires d'alarme : état « on » affiché en rouge dans les tuiles et les listes
const ALARMES = ["moisture", "smoke", "gas", "carbon_monoxide", "safety", "problem", "tamper", "heat", "cold"];
const enAlarme = (e, s) => !!s && e?.startsWith("binary_sensor.") && s.state === "on" && ALARMES.includes(s.attributes.device_class);
// entités qu'une ligne de liste active d'un appui (bouton « Activer ») : scène, script, bouton
const ACTIVABLES = { scene: "turn_on", script: "turn_on", button: "press", input_button: "press" };
// icône de la fiche selon le type de meuble
const ICONES_MEUBLE = { borne_recharge: "mdi:ev-station", tableau_elec: "mdi:flash", meuble_tv: "mdi:television", refrigerateur: "mdi:fridge-outline", lave_linge: "mdi:washing-machine",
  lave_vaisselle: "mdi:dishwasher", bureau: "mdi:desk", box: "mdi:router-wireless", chaudiere: "mdi:water-boiler", ballon: "mdi:water-boiler", pac: "mdi:heat-pump-outline",
  radiateur: "mdi:radiator", plaques: "mdi:stove", cheminee: "mdi:fireplace", voiture: "mdi:car-electric", lit_double: "mdi:bed", lit_simple: "mdi:bed-single" };
// ---------- meubles personnalisés (`type: forme`, « Créer un meuble ») : forme composée de primitives ----------
// Chaque primitive : { genre: rect | arrondi | ellipse | trait | polygone, x, y, l, h (en % de la largeur / profondeur, depuis le coin
// haut gauche ; le meuble peut donc changer de taille), rayon (cm, rectangle arrondi), points ([[x, y]…] en %, trait et polygone),
// style: plein | vide | tirets }. Valeurs bornées (au centième), primitives inconnues retirées : un YAML ou un modèle importé ne dessine que des
// rectangles, ellipses et traits (aucun texte libre n'arrive dans le SVG).
const GENRES_FORME = ["rect", "arrondi", "ellipse", "trait", "polygone"], STYLES_FORME = ["plein", "vide", "tirets"];
const MAX_PRIMITIVES = 40, MAX_POINTS = 24;
const borneF = (v, a, b, d = 0) => { const n = Number.isFinite(+v) && v !== "" && v !== null && typeof v !== "boolean" ? +v : d; return Math.round(Math.max(a, Math.min(b, n)) * 100) / 100; };
function normaliserForme(l) {
  if (!Array.isArray(l)) return [];
  const out = [];
  for (const p of l) {
    if (out.length >= MAX_PRIMITIVES) break;
    if (!p || typeof p !== "object" || Array.isArray(p) || !GENRES_FORME.includes(p.genre)) continue;
    const q = { genre: p.genre };
    if (p.genre === "trait" || p.genre === "polygone") {
      const pts = (Array.isArray(p.points) ? p.points : []).filter((x) => Array.isArray(x) && x.length >= 2 && num(x[0]) && num(x[1])).slice(0, MAX_POINTS)
        .map(([x, y]) => [borneF(x, -50, 150), borneF(y, -50, 150)]);
      if (pts.length < (p.genre === "trait" ? 2 : 3)) continue;
      q.points = pts;
    } else {
      q.x = borneF(p.x, -50, 150); q.y = borneF(p.y, -50, 150); q.l = borneF(p.l, 0, 200, 100); q.h = borneF(p.h, 0, 200, 100);
      if (p.genre === "arrondi") q.rayon = borneF(p.rayon, 0, 500, 8);
    }
    if (STYLES_FORME.includes(p.style) && p.style !== "plein") q.style = p.style;
    out.push(q);
  }
  return out;
}
// SVG d'une forme dans le repère du meuble (centre 0,0) ; w, h = taille en cm
function dessinForme(l, w, h) {
  const X = (v) => +(-w / 2 + (v * w) / 100).toFixed(1), Y = (v) => +(-h / 2 + (v * h) / 100).toFixed(1), Lg = (v) => +((v * w) / 100).toFixed(1), Ht = (v) => +((v * h) / 100).toFixed(1);
  const forme = normaliserForme(l);
  if (!forme.length) return R_(-w / 2, -h / 2, w, h, 3);
  return forme.map((p) => {
    const cl = p.genre === "trait" ? `ligne${p.style === "tirets" ? " tirets" : ""}` : [p.style === "vide" ? "vide" : "", p.style === "tirets" ? "tirets" : ""].filter(Boolean).join(" ");
    if (p.genre === "trait" || p.genre === "polygone") return `<path${cl ? ` class="${cl}"` : ""} d="M${p.points.map(([x, y]) => `${X(x)} ${Y(y)}`).join("L")}${p.genre === "polygone" ? "Z" : ""}"/>`;
    const x = X(p.x), y = Y(p.y), lw = Lg(p.l), lh = Ht(p.h);
    if (p.genre === "ellipse") return `<ellipse${cl ? ` class="${cl}"` : ""} cx="${+(x + lw / 2).toFixed(1)}" cy="${+(y + lh / 2).toFixed(1)}" rx="${+(lw / 2).toFixed(1)}" ry="${+(lh / 2).toFixed(1)}"/>`;
    return R_(x, y, lw, lh, p.genre === "arrondi" ? Math.min(p.rayon, lw / 2, lh / 2) : 1, cl);
  }).join("");
}
// taille = [largeur, profondeur] dans le repère du meuble, AVANT rotation ; type inconnu → rectangle (jamais supprimé)
const dessinMeuble = (m) => {
  const def = MEUBLES[m.type], [w, h] = (m.taille || def?.taille || [60, 60]).map((v) => Math.max(5, Math.min(5000, nb(v, 60))));
  // meuble personnalisé : sa forme, teintée de sa couleur (validée) ; connecté, la teinte d'accent prend le dessus
  const teinte = m.type === "forme" && typeof m.couleur === "string" && COULEUR_SURE.test(m.couleur) ? m.couleur : null;
  const corps = m.type === "forme" ? `<g class="forme${teinte ? " colore" : ""}"${teinte ? ` style="--mb-teinte:${esc(teinte)}"` : ""}>${dessinForme(m.forme, w, h)}</g>`
    : def ? def.d(w, h, m) : R_(-w / 2, -h / 2, w, h, 3);
  return `<g class="meuble${m.type === "espace" ? " zone" : ""}" transform="translate(${nb(m.pos?.[0])} ${nb(m.pos?.[1])}) rotate(${nb(m.rotation)})${m.miroir ? " scale(-1 1)" : ""}">${corps}</g>`;
};
// ---------- ouvertures : baie qui coupe le mur, traits selon le type, battants (plan et aperçu de l'atelier) ----------
// fenêtre : deux traits de part et d'autre de l'axe, le long de la normale (dehors) ; sans capteur ni dehors, de la perpendiculaire
function traitsOuverture(o) {
  const [a, b, d, e] = o.seg, [nx, ny] = o.dehors || [0, 0];
  const capteur = !!(o.contact || o.entite), L = Math.hypot(d - a, e - b) || 1, px = -(e - b) / L, py = (d - a) / L; // perpendiculaire au mur
  const [fx, fy] = nx || ny || capteur ? [nx, ny] : [px, py];
  let traits;
  if (o.volet_seul) traits = "";
  else if (o.type === "fenetre") traits = `<path class="trait" d="M${a + fx * 3} ${b + fy * 3}L${d + fx * 3} ${e + fy * 3}M${a - fx * 3} ${b - fy * 3}L${d - fx * 3} ${e - fy * 3}"/>`;
  else traits = `<path class="trait" d="M${a} ${b}L${d} ${e}"/>`
    + (capteur ? "" : `<path class="jambage" d="M${+(a - px * 5.5).toFixed(2)} ${+(b - py * 5.5).toFixed(2)}L${+(a + px * 5.5).toFixed(2)} ${+(b + py * 5.5).toFixed(2)}M${+(d - px * 5.5).toFixed(2)} ${+(e - py * 5.5).toFixed(2)}L${+(d + px * 5.5).toFixed(2)} ${+(e + py * 5.5).toFixed(2)}"/>`);
  const baie = o.volet_seul ? "" : `<path class="baie" d="M${a} ${b}L${d} ${e}"/>`;
  return { baie, traits: traits + dessinBattants(o) };
}
// battants (`battants` 1 ou 2, `ouvrant` gauche | droite | coulissant, `vers_dehors`) : dessinés seulement si `ouvrant` est réglé
// (une config sans ces clés s'affiche à l'identique). Gauche / droite : côté des gonds vu de l'intérieur, face au dehors ;
// la feuille s'ouvre vers l'intérieur (vers l'extérieur avec `vers_dehors`), avec son arc. Coulissant : deux panneaux décalés.
const OUVRANTS = ["gauche", "droite", "coulissant"];
function dessinBattants(o) {
  if (!OUVRANTS.includes(o.ouvrant) || o.volet_seul) return "";
  const [a, b, d, e] = o.seg.map(Number), L = Math.hypot(d - a, e - b);
  if (!(L > 1)) return "";
  const ux = (d - a) / L, uy = (e - b) / L, r = (v) => +v.toFixed(1), deux = +o.battants === 2;
  let [nx, ny] = (o.dehors || [0, 0]).map(Number);
  const nl = Math.hypot(nx, ny);
  if (nl) { nx /= nl; ny /= nl; } else { nx = -uy; ny = ux; }
  if (o.ouvrant === "coulissant") {
    const k = deux ? 0.55 : 0.6, dec = 2.5;
    const p1 = `M${r(a + nx * dec)} ${r(b + ny * dec)}L${r(a + ux * L * k + nx * dec)} ${r(b + uy * L * k + ny * dec)}`;
    const p2 = `M${r(d - nx * dec)} ${r(e - ny * dec)}L${r(d - ux * L * k - nx * dec)} ${r(e - uy * L * k - ny * dec)}`;
    return `<path class="battant" d="${p1}${p2}"/>`;
  }
  const sv = o.vers_dehors === true ? 1 : -1, vx = nx * sv, vy = ny * sv;
  const feuille = (hx, hy, tx, ty, l) => {
    const fx = hx + vx * l, fy = hy + vy * l, sw = vx * (ty - hy) - vy * (tx - hx) > 0 ? 1 : 0;
    return [`M${r(hx)} ${r(hy)}L${r(fx)} ${r(fy)}`, `M${r(fx)} ${r(fy)}A${r(l)} ${r(l)} 0 0 ${sw} ${r(tx)} ${r(ty)}`];
  };
  let f;
  if (deux) {
    const mx = (a + d) / 2, my = (b + e) / 2, f1 = feuille(a, b, mx, my, L / 2), f2 = feuille(d, e, mx, my, L / 2);
    f = [f1[0] + f2[0], f1[1] + f2[1]];
  } else {
    // gonds à gauche vu de l'intérieur (face au dehors n, la gauche est (ny, -nx)) ou à droite
    const lx = ny, ly = -nx, aGauche = a * lx + b * ly >= d * lx + e * ly, gauche = o.ouvrant === "gauche";
    f = aGauche === gauche ? feuille(a, b, d, e, L) : feuille(d, e, a, b, L);
  }
  return `<path class="battant" d="${f[0]}"/><path class="battant arc" d="${f[1]}"/>`;
}
// niveau dans le calque Meubles : tapis et espaces dessous (-1) quel que soit l'ordre de pose, sauf niveau choisi
const niveauMeuble = (m) => nb(m.niveau, MEUBLES[m.type]?.niveau === 0 ? -1 : 0);

// ---------- calques : un par genre d'élément ; deux groupes ordonnables, le HTML (étiquettes, pastilles) toujours au-dessus du SVG ----------
// ordre par défaut = ordre de dessin d'avant les calques (une config sans `calques` s'affiche à l'identique)
const CALQUES_SVG = ["pieces", "sous_zones", "halos", "meubles", "limites", "murs", "ouvertures"];
const CALQUES_HTML = ["etiquettes", "libelles", "appareils", "textes"];
const NOMS_CALQUES = { pieces: _tk("Pièces"), sous_zones: _tk("Sous-zones"), halos: _tk("Halos de lumière"), meubles: _tk("Meubles"), limites: _tk("Limites"), murs: _tk("Murs"), ouvertures: _tk("Ouvertures"),
  etiquettes: _tk("Étiquettes des pièces"), libelles: _tk("Étiquettes des zones"), appareils: _tk("Appareils"), textes: _tk("Textes") };
const ICONES_CALQUES = { pieces: "mdi:floor-plan", sous_zones: "mdi:selection-drag", halos: "mdi:lightbulb-on-outline", meubles: "mdi:sofa-outline", limites: "mdi:fence", murs: "mdi:wall",
  ouvertures: "mdi:window-closed-variant", etiquettes: "mdi:label-outline", libelles: "mdi:format-letter-case", appareils: "mdi:circle-slice-8", textes: "mdi:format-text" };
// ordre effectif : les calques connus de la liste, puis ceux qui manquent dans l'ordre par défaut
const ordreCalques = (l, def) => [...new Set([...(Array.isArray(l) ? l.filter((x) => def.includes(x)) : []), ...def])];
// YAML écrit à la main : listes de calques inconnus retirés, valeurs invalides supprimées (jamais d'erreur)
function normaliserCalques(q) {
  if (!q || typeof q !== "object" || Array.isArray(q)) return null;
  const n = { ...q }, tous = [...CALQUES_SVG, ...CALQUES_HTML];
  for (const [k, ok] of [["ordre_svg", CALQUES_SVG], ["ordre_html", CALQUES_HTML], ["masques", tous], ["verrous", tous]]) {
    if (!(k in n)) continue;
    if (Array.isArray(n[k])) n[k] = [...new Set(n[k].filter((x) => ok.includes(x)))]; else delete n[k];
  }
  if ("bouton_vue" in n && typeof n.bouton_vue !== "boolean") n.bouton_vue = !!n.bouton_vue;
  return n;
}
// `niveau` (ordre dans son calque) et `masque` (caché en vue) par élément : nombre et booléen, sinon retirés
const normaliserNiveaux = (l) => (Array.isArray(l) ? l.map((o) => {
  if (!o || typeof o !== "object" || Array.isArray(o) || !("niveau" in o || "masque" in o)) return o;
  const n = { ...o };
  if ("niveau" in n) { if ((typeof n.niveau === "number" || (typeof n.niveau === "string" && n.niveau.trim())) && Number.isFinite(+n.niveau)) n.niveau = +n.niveau; else delete n.niveau; }
  if ("masque" in n && typeof n.masque !== "boolean") n.masque = !!n.masque;
  return n;
}) : l);
// booléens écrits en texte dans le YAML (« false », « non », « 0 »…) : remis en vrai booléen, partout dans la config ; les autres textes ne sont pas touchés
const CLES_BOOL = new Set(["sous_zone", "dehors", "zoom", "masque", "teinte", "protege", "miroir", "alerte", "volet_seul", "auto_actions", "automatismes", "confirmer",
  "plein_ecran", "bouton_vue", "jour_nuit", "si_absent", "moyenne", "pastilles", "marqueur", "afficher_meubles", "vitrine", "replay", "edition", "legende", "teinte_temperature"]);
const FAUX = /^\s*(false|faux|non|no|off|0)\s*$/i, VRAI = /^\s*(true|vrai|oui|yes|on|1)\s*$/i;
// (les clés __proto__, constructor et prototype d'un fichier importé sont écartées au passage)
const CLES_PROTO = new Set(["__proto__", "constructor", "prototype"]);
const booleens = (v, k) => (Array.isArray(v) ? v.map((x) => booleens(x)) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([c]) => !CLES_PROTO.has(c)).map(([c, x]) => [c, booleens(x, c)]))
  : typeof v === "string" && CLES_BOOL.has(k) ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v);
// géométrie écrite à la main : nombres en texte convertis ; pièce sans contour (3 sommets valides), mur, ouverture, pastille ou texte sans coordonnées : ignorés
const num = (v) => (typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v));
const point = (q) => Array.isArray(q) && q.length >= 2 && num(q[0]) && num(q[1]);
const seg = (s) => Array.isArray(s) && s.length >= 4 && s.slice(0, 4).every(num);
// coordonnées réduites à leurs nombres : rien d'autre qu'un nombre fini n'arrive dans un attribut du SVG (un sommet [x, y, "…"]
// perd sa 3e valeur) ; un mur ou une limite garde seulement son groupe en 5e valeur (identifiant sûr)
const ID_SUR = /^[\w.:-]{1,80}$/;
const nbs = (q, n) => q.slice(0, n).map(Number);
function normaliserGeometrie(c, rapport) {
  let ign = 0;
  const retires = [];
  const garde = (l, ok, fix) => { if (!Array.isArray(l)) return l; const r = []; l.forEach((o, j) => { if (ok(o)) r.push(fix(o, j)); else ign++; }); return r; };
  c.pieces = garde(c.pieces, (p) => p && typeof p === "object" && !Array.isArray(p) && Array.isArray(p.poly) && p.poly.filter(point).length >= 3, (p, i) => {
    const n = { ...p, poly: p.poly.filter(point).map((q) => nbs(q, 2)) };
    if (p.poly.some((q) => !point(q) || q.length > 2)) retires.push(["pieces", i, "poly"]);
    if ("etiquette" in n) {
      if (point(n.etiquette)) { if (n.etiquette.length > 2) retires.push(["pieces", i, "etiquette"]); n.etiquette = nbs(n.etiquette, 2); }
      else { delete n.etiquette; retires.push(["pieces", i, "etiquette"]); }
    }
    return n;
  });
  for (const k of ["murs", "limites"]) c[k] = garde(c[k], seg, (s, i) => {
    const g = s.length === 5 && typeof s[4] === "string" && ID_SUR.test(s[4]) ? [s[4]] : [];
    if (s.length > 4 + g.length) retires.push([k, i]);
    return [...nbs(s, 4), ...g];
  });
  c.ouvertures = garde(c.ouvertures, (o) => o && typeof o === "object" && seg(o.seg), (o, i) => { if (o.seg.length > 4) retires.push(["ouvertures", i, "seg"]); return { ...o, seg: nbs(o.seg, 4) }; });
  for (const k of ["points", "textes"]) c[k] = garde(c[k], (o) => o && typeof o === "object" && point(o.pos), (o, i) => { if (o.pos.length > 2) retires.push([k, i, "pos"]); return { ...o, pos: nbs(o.pos, 2) }; });
  if (rapport) { rapport.ignores = ign; if (retires.length) (rapport.retires ||= []).push(...retires.map(cheminPublic)); }
  return c;
}
// toute la normalisation de `setConfig` (sans la démo) : aussi utilisée par l'éditeur pour reconnaître la carte stockée
function normaliserConfig(config, rapport) {
  config = booleens({ pieces: [], ...config });
  if (!Array.isArray(config.pieces)) throw new Error("maquette-card : « rooms » must be a list");
  normaliserGeometrie(config, rapport);
  if ("meubles" in config) config.meubles = normaliserMeubles(config.meubles);
  for (const k of ["ouvertures", "points"]) if (Array.isArray(config[k])) config[k] = normaliserPorteurs(config[k]);
  if (Array.isArray(config.ouvertures)) config.ouvertures = normaliserOuvertures(config.ouvertures);
  if (Array.isArray(config.modeles)) config.modeles = normaliserModeles(config.modeles);
  if ("panneaux" in config) config.panneaux = normaliserPanneaux(config.panneaux);
  config.pieces = config.pieces.map((p) => { const q = p?.panneaux && normaliserPanneaux(p.panneaux); return q && q !== p.panneaux ? { ...p, panneaux: q } : p; });
  for (const k of ["pieces", "points", "textes", "ouvertures", "meubles"]) if (Array.isArray(config[k])) config[k] = normaliserNiveaux(config[k]);
  if ("calques" in config) { const q = normaliserCalques(config.calques); if (q) config.calques = q; else delete config.calques; }
  if ("interaction" in config || "tablette" in config) normaliserInteraction(config);
  // étiquettes des pièces : { nom, temperature, humidite } (des clés qui ne sont pas booléennes ailleurs) : « false » écrit en texte → false
  const ep = config.etiquettes_pieces;
  if (ep && typeof ep === "object" && !Array.isArray(ep)) config.etiquettes_pieces = Object.fromEntries(Object.entries(ep).map(([k, v]) => [k, typeof v === "string" ? (FAUX.test(v) ? false : VRAI.test(v) ? true : v) : v]));
  return assainirConfig(config, rapport);
}

// ---------- sécurité (2/3) : filet du HTML, tout innerHTML de la carte et de l'éditeur passe par poserHTML ----------
// Le HTML est d'abord lu dans un <template> (document inerte : rien ne s'y charge ni ne s'y exécute), nettoyé, puis posé.
// Retirés : balises hors de la liste (script, iframe, object, a, form, foreignObject, animate, set…), attributs on*, is,
// liens (href, xlink:href, action…) sauf vers « #id », src sauf <img> servie par HA (même origine), url() autre que « url(#id) »,
// javascript:, @import et expression() dans les styles. Les valeurs sont déjà validées ou échappées en amont : ce filet ne
// change rien au rendu normal, il garantit seulement qu'un oubli ne peut rien exécuter ni rien charger d'ailleurs.
const BALISES_SURES = new Set(["div", "span", "button", "label", "input", "select", "option", "optgroup", "textarea", "output", "datalist", "small", "b", "i", "em", "strong",
  "p", "br", "h1", "h2", "h3", "h4", "h5", "header", "footer", "section", "aside", "nav", "details", "summary", "dialog", "kbd", "dl", "dt", "dd", "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td", "img", "style", "code", "ha-icon", "ha-card", "svg", "g", "defs", "path", "rect", "circle", "ellipse", "line", "polyline",
  "polygon", "text", "tspan", "title", "clipPath", "radialGradient", "linearGradient", "stop", "pattern", "animateTransform", "animateMotion"]);
const ATTR_LIENS = new Set(["href", "xlink:href", "src", "srcset", "srcdoc", "action", "formaction", "poster", "background", "ping", "data", "codebase", "lowsrc", "dynsrc", "manifest"]);
const ATTR_ANIMES = new Set(["transform", "patternTransform", "gradientTransform", "opacity"]);
// texte de style ou valeur d'attribut sans chargement ni code : url() seulement vers « #id » du document
const cssSur = (t) => !/@import|expression\s*\(|javascript:|vbscript:|-moz-binding|behavior\s*:|\\/i.test(t) && !/url\s*\(\s*(?!["']?#)/i.test(t);
const memeOrigine = (u) => { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } };
function attributSur(balise, nom, v) {
  const n = nom.toLowerCase();
  if (n.startsWith("on") || n === "is" || n === "style" && !cssSur(v)) return false;
  if (ATTR_LIENS.has(n)) return (n === "src" && balise === "img" && /^(?:\/(?![/\\])|https?:)/i.test(v) && memeOrigine(v)) || ((n === "href" || n === "xlink:href") && /^#[\w-]*$/.test(v));
  if (n === "attributename") return ATTR_ANIMES.has(v);
  return !/(?:java|vb)script\s*:|data\s*:\s*text/i.test(v.replace(/[\s\u0000-\u001f]/g, "")) && (!/url\s*\(/i.test(v) || cssSur(v));
}
const NS_SVG = "http://www.w3.org/2000/svg";
let tplHTML = null;
// fragment nettoyé ; dans un élément SVG, le HTML est lu comme du SVG (comme le ferait innerHTML)
function fragmentSur(html, contexte) {
  const t = (tplHTML ||= document.createElement("template"));
  const svg = contexte instanceof SVGElement;
  t.innerHTML = svg ? `<svg xmlns="${NS_SVG}">${html}</svg>` : String(html); // lecture inerte (template)
  const frag = t.content, retirer = [];
  for (const el of frag.querySelectorAll("*")) {
    if (!BALISES_SURES.has(el.localName) || (el.localName === "style" && !cssSur(el.textContent))) { retirer.push(el); continue; }
    for (const a of [...el.attributes]) if (!attributSur(el.localName, a.name, a.value)) el.removeAttribute(a.name);
  }
  retirer.forEach((el) => el.remove());
  const f = document.createDocumentFragment();
  f.append(...(svg ? frag.firstChild?.childNodes || [] : frag.childNodes));
  t.innerHTML = "";
  return f;
}
// remplace le contenu de el (élément ou shadowRoot) par le HTML nettoyé
function poserHTML(el, html) { el.replaceChildren(fragmentSur(html, el)); }
// ajoute le HTML nettoyé à la fin de el (insertAdjacentHTML « beforeend »)
function ajouterHTML(el, html) { el.append(fragmentSur(html, el)); }

// ---------- sécurité (3/3) : services sensibles, toujours confirmés ----------
// Un service appelé depuis le plan (boutons des pièces, widgets des panneaux et des fiches, interrupteurs, « Activer ») est sûr
// s'il est dans cette liste blanche ; tout autre service est sensible et demande une confirmation qui nomme l'action réelle et les
// entités visées, quel que soit le libellé du bouton (déverrouiller, ouvrir une porte de garage, désarmer, lancer un script…).
const SERVICES_SURS = (() => {
  const b = ["turn_on", "turn_off", "toggle"], sel = ["select_option", "select_next", "select_previous", "select_first", "select_last"];
  return { light: b, switch: b, input_boolean: b, remote: b, automation: b, fan: [...b, "set_percentage", "increase_speed", "decrease_speed", "oscillate", "set_direction", "set_preset_mode"],
    humidifier: [...b, "set_humidity", "set_mode"], climate: [...b, "set_temperature", "set_hvac_mode", "set_preset_mode", "set_fan_mode", "set_humidity", "set_swing_mode"],
    water_heater: ["turn_on", "turn_off", "set_temperature", "set_operation_mode"],
    media_player: [...b, "media_play", "media_pause", "media_play_pause", "media_stop", "media_next_track", "media_previous_track", "volume_up", "volume_down", "volume_set", "volume_mute", "select_source"],
    scene: ["turn_on"], cover: ["close_cover", "stop_cover", "close_cover_tilt", "stop_cover_tilt"], valve: ["close_valve", "stop_valve"], lock: ["lock"],
    alarm_control_panel: ["alarm_arm_home", "alarm_arm_away", "alarm_arm_night", "alarm_arm_vacation", "alarm_arm_custom_bypass"],
    input_number: ["set_value", "increment", "decrement"], number: ["set_value"], input_select: sel, select: sel };
})();
// ouvrir une cover n'est sûr que pour des volets, stores, rideaux, auvents et fenêtres (jamais garage, portail, porte, ni classe inconnue)
const OUVRIR_COVER = ["open_cover", "open_cover_tilt", "set_cover_position", "set_cover_tilt_position", "toggle", "toggle_cover_tilt"];
const COVERS_SURES = ["shade", "shutter", "blind", "curtain", "awning", "window"];
const coverSure = (hass, e) => e.startsWith("cover.") && COVERS_SURES.includes(hass?.states?.[e]?.attributes?.device_class);
// entités visées par un appel (cible et données : entity_id, area_id ; un appareil n'est pas résolu) ; null = inconnues
function entitesAppel(hass, dom, donnees, cible) {
  const l = [], vers = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
  let inconnu = false;
  for (const o of [cible, donnees]) {
    if (!o || typeof o !== "object") continue;
    for (const e of vers(o.entity_id)) if (typeof e === "string" && e !== "all") l.push(e); else inconnu = true;
    for (const z of vers(o.area_id)) l.push(...entitesZone(hass, z).filter((e) => dom === "homeassistant" || e.startsWith(`${dom}.`)));
    if (o.device_id != null || o.floor_id != null || o.label_id != null) inconnu = true;
  }
  return inconnu ? null : [...new Set(l)];
}
function serviceSensible(hass, dom, svc, ents) {
  if (dom === "homeassistant") {
    if (svc === "update_entity") return false;
    if (!["turn_on", "turn_off", "toggle"].includes(svc) || !ents?.length) return true;
    // homeassistant.* agit selon le domaine de chaque entité : une serrure, une alarme, un script… le rendent sensible
    return ents.some((e) => { const d = e.split(".")[0]; return d === "cover" ? svc !== "turn_off" && !coverSure(hass, e) : !SERVICES_SURS[d]?.includes(svc); });
  }
  if (dom === "cover" && OUVRIR_COVER.includes(svc)) return !ents?.length || !ents.every((e) => coverSure(hass, e));
  return !Object.hasOwn(SERVICES_SURS, dom) || !SERVICES_SURS[dom].includes(svc);
}
// action réelle en clair (titre de la confirmation et bouton qui la lance)
const VERBES_SERVICE = { "lock.unlock": _tk("Déverrouiller"), "lock.open": _tk("Ouvrir la porte"), "lock.lock": _tk("Verrouiller"),
  "alarm_control_panel.alarm_disarm": _tk("Désarmer l'alarme"), "alarm_control_panel.alarm_trigger": _tk("Déclencher l'alarme"),
  "cover.open_cover": _tk("Ouvrir"), "cover.close_cover": _tk("Fermer"), "cover.stop_cover": _tk("Arrêter"), "cover.toggle": _tk("Ouvrir ou fermer"), "cover.set_cover_position": _tk("Changer la position"),
  "valve.open_valve": _tk("Ouvrir la vanne"), "valve.close_valve": _tk("Fermer la vanne"), "valve.stop_valve": _tk("Arrêter la vanne"), "valve.toggle": _tk("Ouvrir ou fermer la vanne"),
  "script.turn_on": _tk("Lancer le script"), "button.press": _tk("Appuyer sur le bouton"), "input_button.press": _tk("Appuyer sur le bouton"), "automation.trigger": _tk("Déclencher l'automatisation"),
  "homeassistant.restart": _tk("Redémarrer Home Assistant"), "homeassistant.stop": _tk("Arrêter Home Assistant"), "homeassistant.turn_on": _tk("Allumer"), "homeassistant.turn_off": _tk("Éteindre"), "homeassistant.toggle": _tk("Basculer") };
// verbes communs à tous les domaines (service sûr confirmé à la demande, `confirm: true`)
const VERBES_COMMUNS = { turn_on: _tk("Allumer"), turn_off: _tk("Éteindre"), toggle: _tk("Basculer"), set_temperature: _tk("Changer la consigne") };
Object.assign(VERBES_SERVICE, { "scene.turn_on": _tk("Activer la scène"), "automation.turn_on": _tk("Activer l'automatisation"), "automation.turn_off": _tk("Désactiver l'automatisation") });
const verbeService = (dom, svc) => _t(VERBES_SERVICE[`${dom}.${svc}`] || (dom === "script" ? _tk("Lancer le script") : Object.hasOwn(VERBES_COMMUNS, svc) ? VERBES_COMMUNS[svc] : _tk("Lancer l'action")));

// ---------- sécurité (1/3) : valeurs de la config validées avant tout dessin ----------
// Une valeur de la config qui finit dans le SVG, le HTML ou un style est soit échappée à l'affichage (texte libre : noms, entités,
// unités, états…), soit validée ici : nombre fini, valeur énumérée connue, couleur sûre, icône « préfixe:nom », identifiant de groupe,
// service « domaine.service », lien « plus d'infos » (/chemin ou http(s)://). Une valeur invalide est retirée, jamais une erreur ;
// rapport.retires garde son chemin au format public (récapitulatif d'import de l'éditeur, console).
const ICONE_SURE = /^[\w-]{1,40}:[\w.-]{1,120}$/;
const SERVICE_SUR = /^[a-z0-9_]{1,64}\.[a-z0-9_]{1,64}$/;
// lien de « plus d'infos » : chemin du même site (pas « // » ni « /\ ») ou adresse web, sans espace ni guillemet
const LIEN_SUR = /^(?:\/(?![/\\])[^\s"'<>`\\]*|https?:\/\/[^\s"'<>`\\]+)$/i;
const estLien = (v) => typeof v === "string" && /^(?:\/|[a-z][\w+.-]*:)/i.test(v);
// chemin interne (clés françaises, numéros) → chemin public : ["pieces", 2, "poly"] → « rooms[2].poly »
function cheminPublic(segs) {
  let n = N_RACINE, out = "";
  for (const s of segs) {
    if (typeof s === "number") { out += `[${s}]`; n = prepNoeud(n)?.l ?? null; continue; }
    const e = prepNoeud(n)?.kFr?.[s];
    out += `${out ? "." : ""}${e ? e.en : s}`;
    n = e?.n ?? null;
  }
  return out;
}
function assainirConfig(c, rapport) {
  const retires = [];
  // règle : valeur gardée (au besoin corrigée), ou undefined = retirée ; ch = chemin interne de la valeur
  const nbF = (v) => (num(v) ? Math.min(1e7, Math.max(-1e7, +v)) : undefined);
  const coul = (v) => couleurSure(v) ?? undefined;
  const ico = (v) => (v === "" || (typeof v === "string" && ICONE_SURE.test(v)) ? v : undefined);
  const idg = (v) => (typeof v === "string" && ID_SUR.test(v) ? v : undefined);
  const parmi = (l) => (v) => (l.includes(v) ? v : undefined);
  const pt = (v) => (point(v) ? nbs(v, 2) : undefined);
  const objet = (regles) => (o, ch) => (objetSimple(o) ? fixer(o, regles, ch) : undefined);
  const liste = (f) => (l, ch) => {
    if (!Array.isArray(l)) return undefined;
    const out = [];
    l.forEach((x, i) => { const v = f(x, [...ch, i]); if (v === undefined) retires.push([...ch, i]); else out.push(v); });
    return out;
  };
  function fixer(o, regles, ch) {
    for (const [k, f] of Object.entries(regles)) {
      if (!Object.hasOwn(o, k) || o[k] == null) continue;
      const v = f(o[k], [...ch, k]);
      if (v === undefined) { delete o[k]; retires.push([...ch, k]); } else o[k] = v;
    }
    return o;
  }
  const anim = (v, ch) => (typeof v === "string" ? (Object.hasOwn(ANIMATIONS, v) ? v : undefined)
    : objet({ type: parmi(Object.keys(ANIMATIONS)), couleur: coul, duree: nbF, intensite: nbF, forme: parmi(["contour"]) })(v, ch));
  const ligne = (l, ch) => (typeof l === "string" ? l : objet({ icone: ico, decimales: nbF })(l, ch));
  const W = { icone: ico, couleur: coul, decimales: nbF, historique: (v) => (typeof v === "boolean" ? v : nbF(v)), min: nbF, max: nbF, seuil: nbF, espace: nbF, duree: nbF,
    stable_t: nbF, alerte_t: nbF, stable_h: nbF, alerte_h: nbF, t_min: nbF, t_max: nbF, h_min: nbF, h_max: nbF,
    seuils: objet({ vert: nbF, jaune: nbF, rouge: nbF }), lignes: liste(ligne), entites: liste(ligne),
    colonnes: liste(objet({ facteur: nbF, decimales: nbF })), periodes: liste(parmi(Object.keys(V_PERIODES))) };
  const widget = objet(W), widgets = liste(widget);
  const panneaux = objet({ gauche: widgets, droite: widgets });
  // « plus d'infos » d'une fiche : false, une entité, ou un lien sûr (sinon retiré : le bouton reprend l'entité de l'en-tête)
  const plusInfos = (v) => (v === false || (typeof v === "string" && (!estLien(v) || LIEN_SUR.test(v))) ? v : undefined);
  const fiche = objet({ widgets, plus_infos: plusInfos });
  const ELEMENT = { niveau: nbF, groupe: idg };
  const CONNECTE = { ...ELEMENT, couleur: coul, seuil: nbF, decimales: nbF, animation: anim, fiche };
  const action = (a, ch) => {
    if (!objetSimple(a)) return undefined;
    // service illisible : le bouton reste (à compléter dans l'éditeur) mais n'appelle rien
    if ("action" in a && !(typeof a.action === "string" && SERVICE_SUR.test(a.action))) { delete a.action; retires.push([...ch, "action"]); }
    return fixer(a, { icone: ico, donnees: (d) => (objetSimple(d) ? d : undefined), cible: (v) => (typeof v === "string" ? v : undefined) }, ch);
  };
  const R_PIECE = { ...ELEMENT, panneaux, actions: liste(action) };
  const R_OUV = { ...ELEMENT, type: parmi(Object.keys(NOMS_OUVERTURE)), dehors: pt, animation: anim, animation_volet: anim, fiche };
  const R_POINT = { ...CONNECTE, icone: ico, halo: (v) => (typeof v === "boolean" ? v : num(v) ? Math.min(5000, Math.max(0, +v)) : undefined) };
  const R_TEXTE = { ...ELEMENT, taille: nbF, style: parmi(["discret"]), infos: liste(objet({ icone: ico, decimales: nbF })) };
  // type de meuble : un type inconnu (identifiant simple) reste, il est dessiné comme un rectangle
  const typeMeuble = (v) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : undefined);
  const R_MEUBLE = { ...CONNECTE, type: typeMeuble };
  const modele = (m, ch) => {
    if (!objetSimple(m)) return undefined;
    fixer(m, { id: idg, icone: ico, genre: parmi(["widget", "meuble", "point", "ouverture"]), type: typeMeuble, objets: widgets }, ch);
    const r = { widget: W, meuble: R_MEUBLE, point: R_POINT, ouverture: R_OUV }[m.genre];
    if (objetSimple(m.objet) && r) fixer(m.objet, r, [...ch, "objet"]);
    return m;
  };
  const anims = Object.fromEntries(Object.keys(EVENEMENTS_ANIM).map((k) => [k, anim]));
  fixer(c, {
    marge: nbF,
    pieces: liste(objet(R_PIECE)), ouvertures: liste(objet(R_OUV)), points: liste(objet(R_POINT)), textes: liste(objet(R_TEXTE)), meubles: liste(objet(R_MEUBLE)),
    groupes: liste((g, ch) => (objetSimple(g) && idg(g.id) ? g : undefined)),
    panneaux, modeles: liste(modele), animations: objet(anims),
    resume: (v, ch) => (Array.isArray(v) ? liste(objet({ icone: ico, decimales: nbF, alerte_au_dessus: nbF }))(v, ch) : v),
    alertes: liste(objet({ icone: ico, au_dessus: nbF, au_dessous: nbF, niveau: parmi(Object.keys(NIVEAUX_ALERTE)) })),
    ambiance: objet({
      intensite: (v) => (num(v) ? +v : Object.hasOwn(INTENSITES, v) ? v : undefined), nord: nbF,
      jour_nuit: (v, ch) => (typeof v === "boolean" ? v : objet({ intensite: nbF })(v, ch)),
      meteo: (v, ch) => (typeof v === "string" ? v : objet({ intensite: nbF, sens: (x) => (x === "vent" || num(x) ? x : undefined) })(v, ch)),
      traces: (v, ch) => (typeof v === "boolean" ? v : num(v) ? +v : objet({ duree: nbF, couleur: coul })(v, ch)),
      energie: (v, ch) => (typeof v === "boolean" ? v : objet({ source: (x) => (typeof x === "string" || num(x) ? x : undefined), seuil: nbF, couleur: coul })(v, ch)),
      personnes: (v, ch) => (typeof v === "boolean" || Array.isArray(v) ? v : objet({ maison: (x) => (typeof x === "string" ? x : pt(x)) })(v, ch)),
    }),
    replay: (v, ch) => (typeof v === "boolean" ? v : objet({ heures: nbF, vitesse: nbF })(v, ch)),
    vitrine: (v, ch) => (typeof v === "boolean" ? v : objet({ pos: pt, largeur: nbF })(v, ch)),
    teinte_temperature: (v, ch) => (v === false ? v : objet({ min: nbF, max: nbF })(v, ch)),
    interaction: objet({ retour_apres: nbF }),
  }, []);
  if (rapport && retires.length) (rapport.retires ||= []).push(...retires.map(cheminPublic));
  return c;
}

// ---------- réglages globaux (panneau ⚙ Paramètres) : valeurs effectives, avec les valeurs par défaut d'avant ces options ----------
// vitesses du replay (secondes de journée par seconde) ; défaut ×900
const VITESSES_REPLAY = [[60, "×60 (1 min/s)"], [300, "×300"], [900, "×900"], [3600, "×3600 (1 h/s)"]];
const vitesseReplay = (r) => (r && typeof r === "object" && VITESSES_REPLAY.some(([v]) => v === +r.vitesse) ? +r.vitesse : 900);
// présence par défaut des puces et des alertes « personne à la maison » (chacune peut avoir la sienne)
const presenceDefaut = (c) => (typeof c?.presence === "string" && c.presence.includes(".") ? c.presence : "zone.home");
// teinte des pièces selon la température : null (désactivée) ou [min, max] en °C, bornes de la légende ; défaut 17 à 28 °C
const TEINTE_DEF = [17, 28];
function teinteTemp(c) {
  const v = c?.teinte_temperature;
  if (v === false) return null;
  const o = v && typeof v === "object" ? v : {}, a = num(o.min) ? +o.min : TEINTE_DEF[0], b = num(o.max) ? +o.max : TEINTE_DEF[1];
  return a < b ? [a, b] : TEINTE_DEF;
}
// couleur d'une température sur l'échelle [min, max] (les paliers de couleur sont définis de 17 à 28 °C)
const couleurTempEchelle = (t, [a, b]) => couleurTemp(t == null || (a === TEINTE_DEF[0] && b === TEINTE_DEF[1]) ? t : TEINTE_DEF[0] + ((t - a) * (TEINTE_DEF[1] - TEINTE_DEF[0])) / (b - a));
// éléments des étiquettes de pièce : nom, température, humidité (tous affichés par défaut)
const etiquettesPieces = (c) => { const o = c?.etiquettes_pieces && typeof c.etiquettes_pieces === "object" ? c.etiquettes_pieces : {}; return { nom: o.nom !== false, temperature: o.temperature !== false, humidite: o.humidite !== false }; };

// ---------- format public en anglais : traduction à la frontière (la config interne et le code restent en français) ----------
// depuisAnglais à l'entrée (setConfig, import de l'éditeur, carte relue dans le dashboard), versAnglais à la sortie (enregistrement,
// export, versions, stub, stratégies). Un seul schéma, qui dépend du contexte : une même clé interne change de nom ou de valeurs
// selon l'objet qui la porte (`niveau` d'un élément ou d'une alerte, `clic` d'une pièce ou d'un meuble, `pieces` du plan ou du widget climat…).
// Nœud : { k: { cléInterne: "english" | ["english", nœud] }, l: nœud des éléments d'une liste, v: { valeurInterne: "english" },
//          var: [cléInterne, { valeurInterne: { cléInterne: nœud } }] (contenu d'une clé qui dépend d'une autre clé),
//          m: nœud des valeurs d'un dictionnaire à clés libres (`persons: {person.x: {…}}`) }.
// Selon le type de la valeur (objet, liste, texte), le nœud s'applique par k, l ou v : `animation: halo` ou `animation: {type: halo}`.
// Nœud absent = contenu libre, copié tel quel (entités, noms, couleurs, nombres, coordonnées, données de service, états HA…).
// Seules les valeurs énumérées sont traduites ; une valeur inconnue passe telle quelle (la normalisation décide), mais une valeur
// interne (française) écrite dans le YAML anglais est refusée, comme une clé inconnue : ignorée, avec un avertissement unique.
const nObj = (k, x = {}) => ({ k, ...x }), nListe = (l) => ({ l }), nEnum = (v) => ({ v });
// dictionnaire : clés libres (identifiants d'entités, gardés tels quels), chaque valeur traduite par le nœud donné
const nDico = (m) => ({ m });
const V_CLIC = { fiche: "card", infos: "more_info", aucun: "none" };
const V_ANIM = { aucune: "none", pulsation: "pulse", respiration: "breathe", clignote: "blink", halo: "halo", onde: "wave", defilement: "scroll" };
const V_MEUBLES = { canape: "sofa", canape_angle: "corner_sofa", fauteuil: "armchair", table_basse: "coffee_table", meuble_tv: "tv_unit", etagere: "shelf",
  tapis: "rug", plante: "plant", cheminee: "fireplace", table_carree: "square_table", table_rect: "rect_table", table_ronde: "round_table", chaise: "chair",
  plan_travail: "counter", evier: "sink", plaques: "hob", refrigerateur: "fridge", lave_linge: "washing_machine", lave_vaisselle: "dishwasher",
  lit_simple: "single_bed", lit_double: "double_bed", lit_bebe: "crib", table_nuit: "nightstand", armoire: "wardrobe", commode: "dresser", bureau: "desk",
  douche: "shower", baignoire: "bathtub", lavabo: "washbasin", wc: "toilet", chaudiere: "boiler", ballon: "water_heater", radiateur: "radiator",
  tableau_elec: "electrical_panel", box: "router", borne_recharge: "ev_charger", pac: "heat_pump", voiture: "car", velo: "bike", arbre: "tree", piscine: "pool",
  espace: "area", rect: "rect", cercle: "circle", escalier: "stairs", forme: "custom" };
// catégories des meubles (catalogue et meubles personnalisés `modeles[].cat`)
const V_CATS_MEUBLES = { sejour: "living", repas: "dining", cuisine: "kitchen", chambre: "bedroom", salle_eau: "bathroom", technique: "utility", formes: "shapes", exterieur: "outdoor" };
const V_CALQUES = { pieces: "rooms", sous_zones: "sub_areas", halos: "halos", meubles: "furniture", limites: "fences", murs: "walls", ouvertures: "openings",
  etiquettes: "room_labels", libelles: "area_labels", appareils: "badges", textes: "texts" };
const V_WIDGETS = { tarif: "tariff", ve: "ev", jauge: "gauge", tuile: "tile", entites: "entities", periodes: "periods", separateur: "divider", commande: "cover",
  thermostat: "thermostat", climat: "climate", serrure: "lock" };
const V_PERIODES = { jour: "day", semaine: "week", mois: "month", annee: "year" };
// lignes d'un widget (`lignes`, `entites`) : une entité en texte ou un objet
const N_LIGNE = nObj({ entite: "entity", nom: "name", icone: "icon", decimales: "decimals", unite: "unit" });
// widgets des panneaux et des fiches : toutes les clés de tous les types (aucune clé n'y change de sens d'un type à l'autre)
const N_WIDGET = nObj({ type: ["type", nEnum(V_WIDGETS)], titre: "title", icone: "icon", couleur: "color", lignes: ["rows", nListe(N_LIGNE)],
  entite: "entity", unite: "unit", decimales: "decimals", historique: "history", min: "min", max: "max", entites: ["entities", nListe(N_LIGNE)],
  prix: "price", periode: "period", couleur_jour: "color_today", couleur_demain: "color_tomorrow",
  batterie: "battery", autonomie: "range", puissance: "power", seuil: "threshold", branche: "plugged", session_kwh: "session_kwh", session_cout: "session_cost",
  periodes: ["periods", nListe(nEnum(V_PERIODES))], note: "note",
  colonnes: ["columns", nListe(nObj({ nom: "name", unite: "unit", stat: "stat", facteur: "factor", decimales: "decimals", jour: "day", semaine: "week", mois: "month",
    annee: "year", source: ["source", nEnum({ stat: "stat", entites: "entities" })] }))],
  espace: "spacing", confirmer: "confirm", duree: "duration", pieces: "rooms", dehors: "outside", moyenne: "average",
  stable_t: "stable_t", alerte_t: "alert_t", stable_h: "stable_h", alerte_h: "alert_h", t_min: "t_min", t_max: "t_max", h_min: "h_min", h_max: "h_max",
  // jauge : couleur selon la valeur, comme la carte Jauge de HA (chaque couleur s'applique à partir de sa valeur)
  seuils: ["severity", nObj({ vert: "green", jaune: "yellow", rouge: "red" })] });
const N_PANNEAUX = nObj({ gauche: ["left", nListe(N_WIDGET)], droite: ["right", nListe(N_WIDGET)] });
// fiche : { titre, widgets } (ou directement la liste des widgets)
const N_FICHE = nObj({ titre: "title", widgets: ["widgets", nListe(N_WIDGET)], plus_infos: "more_info" }, { l: N_WIDGET });
// animation : un type, ou { type, couleur, duree, intensite, forme }
const N_ANIM = nObj({ type: ["type", nEnum(V_ANIM)], couleur: "color", duree: "duration", intensite: "intensity", forme: ["shape", nEnum({ contour: "outline" })] }, { v: V_ANIM });
const K_ELEMENT = { masque: "hidden", niveau: "level", groupe: "group" };
// clés « connectées » communes aux pastilles et aux meubles
const K_CONNECTE = { entite: "entity", valeur: "value", actif: "active", actif_attribut: "active_attribute", seuil: "threshold", attribut: "attribute",
  unite: "unit", decimales: "decimals", couleur: "color", clic: ["tap", nEnum(V_CLIC)], protege: "protected", confirmer: "confirm", fiche: ["card", N_FICHE], animation: ["animation", N_ANIM] };
const N_PIECE = nObj({ nom: "name", poly: "poly", etiquette: "label", temperature: "temperature", humidite: "humidity", attribut_temperature: "temperature_attribute",
  attribut_humidite: "humidity_attribute", clic: "tap", dehors: "outside", zoom: "zoom", zone: "area", auto_actions: "auto_actions", automatismes: "automations",
  actions: ["actions", nListe(nObj({ nom: "name", icone: "icon", action: "action", cible: ["target", nEnum({ piece: "room" })], donnees: "data", confirmer: "confirm" }))],
  panneaux: ["panels", N_PANNEAUX], sous_zone: "sub_area", ...K_ELEMENT });
const N_OUVERTURE = nObj({ type: ["type", nEnum({ fenetre: "window", porte: "door", portail: "gate" })], seg: "seg", nom: "name", contact: "contact", volet: "shutter",
  entite: "entity", dehors: "outside", volet_seul: "shutter_only", baie: "bay",
  battants: "leaves", ouvrant: ["swing", nEnum({ gauche: "left", droite: "right", coulissant: "sliding" })], vers_dehors: "outward", animation: ["animation", N_ANIM], animation_volet: ["shutter_animation", N_ANIM],
  clic: ["tap", nEnum(V_CLIC)], protege: "protected", confirmer: "confirm", fiche: ["card", N_FICHE], ...K_ELEMENT });
const N_POINT = nObj({ ...K_CONNECTE, pos: "pos", icone: "icon", nom: "name", halo: "halo", piece: "room", alerte: "alert", clair: "light_color", ...K_ELEMENT });
const N_TEXTE = nObj({ t: "text", pos: "pos", taille: "size", style: ["style", nEnum({ discret: "subtle" })],
  infos: ["info", nListe(nObj({ entite: "entity", nom: "name", attribut: "attribute", unite: "unit", decimales: "decimals", icone: "icon" }))], ...K_ELEMENT });
// forme d'un meuble personnalisé (`type: custom`) : primitives en % de la taille
const N_PRIMITIVE = nObj({ genre: ["kind", nEnum({ rect: "rect", arrondi: "rounded_rect", ellipse: "ellipse", trait: "line", polygone: "polygon" })],
  x: "x", y: "y", l: "w", h: "h", rayon: "radius", points: "points", style: ["style", nEnum({ plein: "filled", vide: "outline", tirets: "dashed" })] });
const N_MEUBLE = nObj({ type: ["type", nEnum(V_MEUBLES)], pos: "pos", taille: "size", rotation: "rotation", miroir: "mirror", nom: "name", chaises: "chairs", teinte: "tint",
  forme: ["shape", nListe(N_PRIMITIVE)], ...K_CONNECTE, ...K_ELEMENT });
const N_PUCE = nObj({ type: ["type", nEnum({ ouvertures: "openings", lumieres: "lights", volets: "shutters", temperature: "temperature", entite: "entity" })],
  icone: "icon", entite: "entity", nom: "name", unite: "unit", decimales: "decimals", alerte_au_dessus: "alert_above", alerte_etat: "alert_state",
  masquer_si: "hide_if", afficher: ["show", nEnum({ absent: "away", present: "home" })], presence: "presence", ligne: "new_line", sous: "below" });
const N_CALQUES = nObj({ ordre_svg: ["drawing_order", nListe(nEnum(V_CALQUES))], ordre_html: ["overlay_order", nListe(nEnum(V_CALQUES))],
  masques: ["hidden", nListe(nEnum(V_CALQUES))], verrous: ["locked", nListe(nEnum(V_CALQUES))], bouton_vue: "view_button" });
const N_PERSONNE = nObj({ entite: "entity" });
// affichage des personnes (`ambiance.personnes`, et par personne dans `par_personne`) : dehors, à la maison, avatar
const K_AFF_PERSONNE = { dehors: ["away", nEnum({ direction: "direction", zone: "zone", cache: "hidden" })], chez_soi: ["at_home", nEnum({ groupe: "grouped", cache: "hidden" })],
  avatar: ["avatar", nEnum({ photo: "picture", initiales: "initials" })] };
// bulles d'appareils (`style_pastilles`) : indisponibles, inactives, taille, valeurs
const N_STYLE_PASTILLES = nObj({ indisponible: ["unavailable", nEnum({ estompe: "dimmed", tirets: "dashed", cache: "hidden" })],
  inactif: ["inactive", nEnum({ visible: "shown", actif_seul: "active_only", estompe: "dimmed" })], taille: ["size", nEnum({ petit: "small", normal: "normal", grand: "large" })],
  valeurs: ["values", nEnum({ toujours: "always", survol: "hover", jamais: "never" })] });
const N_AMBIANCE = nObj({ intensite: ["intensity", nEnum({ discret: "subtle", normal: "normal", fort: "strong" })], nord: "north",
  jour_nuit: ["day_night", nObj({ soleil: "sun", intensite: "intensity", marqueur: "marker" })],
  meteo: ["weather", nObj({ entite: "entity", intensite: "intensity", sens: ["direction", nEnum({ vent: "wind" })] })],
  traces: ["traces", nObj({ duree: "duration", couleur: "color" })],
  // source : numéro d'un meuble ou type de meuble ; pastilles : flux aussi vers les pastilles (points)
  energie: ["energy", nObj({ source: ["source", nEnum(V_MEUBLES)], seuil: "threshold", couleur: "color", pastilles: "badges" })],
  personnes: ["people", nObj({ maison: "home", entites: ["entities", nListe(N_PERSONNE)], ...K_AFF_PERSONNE, par_personne: ["persons", nDico(nObj(K_AFF_PERSONNE))] }, { l: N_PERSONNE })] });
const N_ANIMATIONS = nObj({ ouverture: ["opening", N_ANIM], volet: ["shutter", N_ANIM], alerte: ["alert", N_ANIM], lumiere: ["light", N_ANIM],
  appareil: ["badge", N_ANIM], meuble: ["furniture", N_ANIM] });
const N_ALERTE = nObj({ nom: "name", entite: "entity", entites: "entities", niveau: ["level", nEnum({ critique: "critical", alerte: "warning", info: "info" })],
  type: ["type", nEnum({ ouvertures: "openings" })], si_absent: "when_away", au_dessus: "above", au_dessous: "below", etat: "state", presence: "presence",
  icone: "icon", actif: "enabled" });
// chemins de champs d'un widget (« lignes.0.entite » ↔ « rows.0.entity ») : chaque segment traduit par la table N_WIDGET
const cheminWidget = (c, versEn) => {
  if (typeof c !== "string") return c;
  let n = N_WIDGET;
  return c.split(".").map((seg) => {
    if (/^\d+$/.test(seg)) return seg;
    const t = prepNoeud(n), e = t?.k ? (versEn ? t.kFr : t.kEn)[seg] : null;
    if (!e) return seg;
    n = e.n?.l || e.n;
    return versEn ? e.en : e.fr;
  }).join(".");
};
const N_DEMANDER = { f: (x, versEn) => (Array.isArray(x) ? x.map((c) => cheminWidget(c, versEn)) : x) };
// champs entité à demander d'une ouverture ou d'un meuble (contact, volet, entité motorisée ; entité, valeur, état actif)
const N_DEMANDER_SIMPLE = (t) => { const en = Object.fromEntries(Object.entries(t).map(([k, v]) => [v, k])); return { f: (x, versEn) => (Array.isArray(x) ? x.map((c) => (versEn ? t : en)[c] ?? c) : x) }; };
// modèles de l'éditeur : le contenu de `objet` dépend du genre (widget, meuble, pastille, ouverture) ;
// `id` (court, généré) et `demander` (champs entité à choisir à chaque ajout) pour les widgets
const N_MODELE = nObj({ id: "id", demander: ["ask", N_DEMANDER], nom: "name", genre: ["kind", nEnum({ widget: "widget", meuble: "furniture", point: "badge", ouverture: "opening" })], icone: "icon",
  desc: "description", type: ["type", nEnum(V_MEUBLES)], domaine: "domain", objet: "item", objets: ["items", nListe(N_WIDGET)],
  // meubles personnalisés : catégorie du catalogue et mots de recherche
  cat: ["category", nEnum(V_CATS_MEUBLES)], mots: "keywords" },
{ var: ["genre", { widget: { objet: N_WIDGET }, meuble: { objet: N_MEUBLE, demander: N_DEMANDER_SIMPLE({ entite: "entity", valeur: "value", actif: "active" }) }, point: { objet: N_POINT },
  ouverture: { objet: N_OUVERTURE, demander: N_DEMANDER_SIMPLE({ contact: "contact", volet: "shutter", entite: "entity" }) } }] });
const N_RACINE = nObj({ type: "type", id: "id", titre: "title", resume: ["summary", nListe(N_PUCE)], plein_ecran: "full_page", edition: "editor", marge: "margin",
  pieces: ["rooms", nListe(N_PIECE)], murs: "walls", limites: "fences", ouvertures: ["openings", nListe(N_OUVERTURE)], points: ["badges", nListe(N_POINT)],
  textes: ["texts", nListe(N_TEXTE)], meubles: ["furniture", nListe(N_MEUBLE)], afficher_meubles: ["show_furniture", nEnum({ pc: "desktop" })],
  calques: ["layers", N_CALQUES], groupes: ["groups", nListe(nObj({ id: "id", nom: "name" }))], panneaux: ["panels", N_PANNEAUX],
  modeles: ["templates", nListe(N_MODELE)], ambiance: ["ambience", N_AMBIANCE], animations: ["animations", N_ANIMATIONS], alertes: ["alerts", nListe(N_ALERTE)],
  style_pastilles: ["badge_style", N_STYLE_PASTILLES],
  replay: ["replay", nObj({ heures: "hours", vitesse: "speed" })], vitrine: ["showcase", nObj({ pos: "pos", largeur: "width" })], demo: "demo", langue: "language",
  // réglages globaux (panneau ⚙ Paramètres de l'éditeur) : présence par défaut, étiquettes des pièces, teinte de température, légende
  presence: "presence", etiquettes_pieces: ["room_labels", nObj({ nom: "name", temperature: "temperature", humidite: "humidity" })],
  teinte_temperature: ["temperature_tint", nObj({ min: "min", max: "max" })], legende: "legend",
  // interaction au toucher, tablette murale, niveau d'animation
  interaction: ["interaction", nObj({ clic_piece: ["room_tap", nEnum({ vue: "room_view", infos: "more_info", aucun: "none" })], vue_figee: "lock_view", retour_apres: "reset_after" })],
  tablette: ["tablet", nObj({ resume: "summary", panneaux: "panels", anti_marquage: "burn_in" })],
  niveau_animation: ["animation_level", nEnum({ complet: "full", reduit: "reduced", aucun: "none" })],
  // clés que Home Assistant ajoute à toute carte : gardées telles quelles
  view_layout: "view_layout", layout_options: "layout_options", grid_options: "grid_options", visibility: "visibility", card_mod: "card_mod" });
// tables de chaque nœud (interne → anglais et retour), préparées au premier usage ; un nom anglais en double est une erreur du schéma
function prepNoeud(n) {
  if (!n || n.kFr || n.vEn) return n;
  if (n.k) {
    const fr = Object.create(null), en = Object.create(null);
    for (const [k, s] of Object.entries(n.k)) {
      const [e, sous] = Array.isArray(s) ? s : [s, null];
      if (en[e]) throw new Error(`maquette-card : schéma anglais, « ${e} » en double`);
      fr[k] = { en: e, n: sous }; en[e] = { fr: k, n: sous };
    }
    n.kEn = en; n.kFr = fr;
  }
  if (n.v) {
    const en = Object.create(null);
    for (const [k, e] of Object.entries(n.v)) { if (en[e]) throw new Error(`maquette-card : schéma anglais, valeur « ${e} » en double`); en[e] = k; }
    n.vFrSeul = new Set(Object.keys(n.v).filter((k) => !(k in en)));
    n.vEn = en;
  }
  return n;
}
const REJET = Symbol("rejet"), AVERTIS = new Set();
const avertir = (m) => { if (AVERTIS.has(m)) return; AVERTIS.add(m); console.warn(`maquette-card : ${m}`); };
const copie = (x) => (Array.isArray(x) ? x.map(copie) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, copie(v)])) : x);
// rap (facultatif, objet) : cles (clés renommées), valeurs (valeurs traduites), inconnues et refusees (chemins ignorés)
function traduire(x, n, versEn, chemin, rap) {
  n = prepNoeud(n);
  if (n?.f) return n.f(x, versEn);
  if (Array.isArray(x)) return n?.l ? x.map((e) => traduire(e, n.l, versEn, chemin, rap)).filter((e) => e !== REJET) : copie(x);
  if (n?.m && x && typeof x === "object") {
    const out = {};
    for (const [k, v] of Object.entries(x)) { const r = traduire(v, n.m, versEn, chemin ? `${chemin}.${k}` : k, rap); if (r !== REJET) out[k] = r; }
    return out;
  }
  if (x && typeof x === "object") {
    if (!n?.k) return copie(x);
    const cles = versEn ? n.kFr : n.kEn, out = {};
    let vr = null;
    if (n.var) {
      const [dk, tab] = n.var, sd = n.kFr[dk], dv = x[versEn ? dk : sd.en], ne = prepNoeud(sd.n);
      const di = !versEn && typeof dv === "string" && ne?.vEn && dv in ne.vEn ? ne.vEn[dv] : dv;
      vr = typeof di === "string" && Object.hasOwn(tab, di) ? tab[di] : null;
    }
    for (const [k, v] of Object.entries(x)) {
      const s = cles[k], nom = s && versEn ? s.en : k, ch = chemin ? `${chemin}.${nom}` : nom;
      if (!s) { avertir(`unknown key « ${ch} » (ignored)`); if (rap) (rap.inconnues ||= []).push(ch); continue; }
      const ki = versEn ? k : s.fr, ke = versEn ? s.en : k;
      const r = traduire(v, vr && Object.hasOwn(vr, ki) ? vr[ki] : s.n, versEn, ch, rap);
      if (r === REJET) continue;
      if (ki !== ke && rap) rap.cles = (rap.cles || 0) + 1;
      out[versEn ? ke : ki] = r;
    }
    return out;
  }
  if (typeof x === "string" && n?.v) {
    if (versEn) {
      if (!Object.hasOwn(n.v, x)) return x;
      if (n.v[x] !== x && rap) rap.valeurs = (rap.valeurs || 0) + 1;
      return n.v[x];
    }
    if (x in n.vEn) { if (n.vEn[x] !== x && rap) rap.valeurs = (rap.valeurs || 0) + 1; return n.vEn[x]; }
    if (n.vFrSeul.has(x)) { avertir(`unknown value « ${x} » for « ${chemin} » (ignored)`); if (rap) (rap.refusees ||= []).push(`${chemin}: ${x}`); return REJET; }
  }
  return x;
}
// config interne (clés françaises) → format public (anglais)
const versAnglais = (cfg, rap) => (cfg && typeof cfg === "object" && !Array.isArray(cfg) ? traduire(cfg, N_RACINE, true, "", rap) : cfg);
// format public (anglais) → config interne ; une config entière à l'ancien format (clés françaises) est refusée avec un message clair
function depuisAnglais(cfg, rap) {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return cfg;
  if (Object.hasOwn(cfg, "pieces") && !Object.hasOwn(cfg, "rooms"))
    throw new Error("maquette-card : this configuration uses the former French keys (pieces, murs, ouvertures…): convert it to the English keys (rooms, walls, openings…), see https://github.com/TooMuhtsh/maquette-card/blob/main/CHANGELOG.md#former-french-keys");
  return traduire(cfg, N_RACINE, false, "", rap);
}

// JSON indépendant de l'ordre des clés (HA et setConfig ne gardent pas toujours le même ordre)
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
class MaquetteCard extends HTMLElement {
  static PUCES = [{ type: "ouvertures" }, { type: "lumieres" }, { type: "volets" }, { type: "temperature" }];
  static MEUBLES = MEUBLES;
  static normaliser = normaliserConfig;
  static COULEURS_TYPE = COULEURS_TYPE;
  static dessinMeuble = dessinMeuble;
  static normaliserForme = normaliserForme;
  static traitsOuverture = traitsOuverture;
  static couleurSure = (c) => !!couleurSure(c);
  static poserHTML = poserHTML;
  static ajouterHTML = ajouterHTML;
  static VERSION = VERSION;
  static serviceSensible = serviceSensible;
  static get DEPOT() { return DEPOT; } // dépôt du projet (défini plus bas, avec l'enregistrement de la carte)
  static CATS_MEUBLES = { sejour: _tk("Séjour"), repas: _tk("Repas"), cuisine: _tk("Cuisine"), chambre: _tk("Chambre et bureau"), salle_eau: _tk("Salle d'eau"),
    technique: _tk("Technique"), formes: _tk("Formes et espaces"), exterieur: _tk("Extérieur") };
  static CALQUES = { svg: CALQUES_SVG, html: CALQUES_HTML, noms: NOMS_CALQUES, icones: ICONES_CALQUES };
  static niveauMeuble = niveauMeuble;
  static ANIMATIONS = ANIMATIONS;
  static EVENEMENTS_ANIM = EVENEMENTS_ANIM;
  static animDe = animDe;
  static evenementPoint = evenementPoint;
  // format public (YAML en anglais) ↔ config interne : pour l'éditeur, les tests et la migration des anciennes configs
  static depuisAnglais = depuisAnglais;
  static versAnglais = versAnglais;
  static SCHEMA_ANGLAIS = N_RACINE;
  // valeurs par défaut des réglages globaux (panneau ⚙ Paramètres de l'éditeur)
  static REGLAGES = { vitesses: VITESSES_REPLAY, teinte: TEINTE_DEF, presence: "zone.home", heures: 24, vitesse: 900, marge: 40 };

  setConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("maquette-card : invalid configuration");
    // format public en anglais → config interne (clés françaises) ; clés inconnues ignorées avec un avertissement
    config = depuisAnglais(config);
    // langue de l'interface (option `language`, sinon celle de HA) : choisie avant la démo, dont les noms en dépendent
    this._lgOpt = config.langue;
    const relangue = this._langue();
    // `demo: true` : l'appartement de démonstration et ses états simulés (rien n'est commandé dans la maison)
    if (config.demo && typeof PlanDemo !== "undefined") {
      config = { ...PlanDemo.config(), ...(typeof config.titre === "string" ? { titre: config.titre } : {}) };
      const brut = this._sim ? this._hassBrut : this._hass;
      this._sim ||= new PlanDemo.Simulation();
      if (relangue) this._sim.renommer();
      // jamais un appel vers la maison avec la config de démo, même au premier rendu
      if (brut) { this._hassBrut = brut; this._hass = this._hassDemo(brut); }
    } else if (this._sim) {
      this._desabonner?.(); this._desabonner = null; this._sim = null;
      if (this._hassBrut) this._hass = this._hassBrut;
      this._hassBrut = null; this._cacheStat = {}; this._cacheHisto = {};
    }
    const rapport = {};
    config = normaliserConfig(config, rapport);
    // éléments sans géométrie valide : ignorés, signalés discrètement (console ; l'éditeur le dit à l'ouverture)
    if (rapport.ignores && this._ignores !== rapport.ignores) console.warn(`maquette-card : ${rapport.ignores} element(s) without valid coordinates ignored`);
    this._ignores = rapport.ignores;
    // valeurs invalides retirées (coordonnées, couleurs, icônes, valeurs énumérées…) : signalées une fois dans la console
    const ret = (rapport.retires || []).join(", ");
    if (ret && ret !== this._retires) console.warn(`maquette-card : invalid value(s) removed: ${ret.length > 400 ? `${ret.slice(0, 400)}…` : ret}`);
    this._retires = ret;
    if (this._editeur) {
      // config rechargée après notre propre enregistrement : on garde l'éditeur ouvert
      if (canon(config) === canon(this._editeur.original)) return;
      // modifiée ailleurs pendant l'édition : on garde le travail en cours, le conflit sera proposé à l'enregistrement
      this._editeur.externe = JSON.parse(JSON.stringify(config));
      this._editeur.snack(_t("Ce plan vient d'être modifié ailleurs : à l'enregistrement, tu choisiras de garder ta version ou non."), _t("Exporter le mien"), () => this._editeur.exporter(), 12000);
      return;
    }
    this._config = JSON.parse(JSON.stringify(config));
    this._ok = false;
    if (relangue) this._textesSquelette();
    if (this._hass) this._construire();
  }

  set hass(hass) {
    const relangue = this._langue(hass);
    if (relangue) this._sim?.renommer();
    if (this._sim) { this._hassBrut = hass; hass = this._hassDemo(hass); }
    this._hass = hass;
    if (!this._ok) this._construire();
    else if (relangue) this._relangue();
    else if (this._rp) return; // replay : le plan montre l'historique, pas le direct
    else if (this._change()) this._maj();
  }

  // langue de l'interface : option `language` (en | fr), sinon celle du profil HA, sinon celle de la page ; elle est commune à la page
  // (MaquetteI18n), chaque carte la remet à la sienne avant de se dessiner. Renvoie true si elle a changé pour cette carte.
  _langue(hass = this._hass) {
    const I = globalThis.MaquetteI18n, l = this._lgOpt;
    I.definir(hass, l === "en" || l === "fr" ? l : null);
    const avant = this._lg;
    this._lg = `${I.langue()}|${I.locale()}`;
    return avant != null && avant !== this._lg;
  }

  // changement de langue sans recharger : textes fixes, plan, résumé, widgets et éditeur ouvert redessinés (fiche et replay fermés)
  _relangue() {
    if (this._rp) this._replayFermer();
    this.shadowRoot?.querySelector("dialog.mf")?.close();
    this._textesSquelette();
    this._construire();
    const ed = this._editeur;
    if (ed) { ed._etatRepli(); ed._barre(); ed._panneau(); }
  }

  _textesSquelette() {
    const R = this.shadowRoot;
    if (!R) return;
    for (const [sel, cle] of [[".retour", _tk("Toute la maison")], [".editer", _tk("Modifier le plan")], ["[data-z=calques]", _tk("Calques affichés")],
      ["[data-z=plus]", _tk("Zoomer")], ["[data-z=moins]", _tk("Dézoomer")], ["[data-z=tout]", _tk("Toute la maison")], ["[data-z=replay]", _tk("Revoir la journée")]]) {
      const b = R.querySelector(`.barre ${sel}, .zoom ${sel}`);
      if (b) b.title = _t(cle);
    }
  }

  // démo : hass de HA, avec les états de la simulation par-dessus, ses services et son historique (soleil et coordonnées réels)
  _hassDemo(h) {
    const sim = this._sim;
    sim.placer(h.config);
    if (!this._desabonner) this._desabonner = sim.abonner(() => { if (this._hassBrut && this.isConnected) this.hass = this._hassBrut; });
    const w = Object.create(h);
    w.states = { ...h.states, ...sim.etats };
    w.callService = (d, s, data, cible) => sim.service(d, s, data, cible);
    w.callWS = (m) => sim.ws(m);
    return w;
  }

  disconnectedCallback() { this._desabonner?.(); this._desabonner = null; if (this._rp) this._replayFermer(); if (this._editeur) this._editeur.fermer(true); this.shadowRoot?.querySelector("dialog.mf")?.close(); clearInterval(this._tm); this._tm = 0; this._vu?.disconnect(); this._vu = null; clearInterval(this._tmBi); this._tmBi = 0; clearTimeout(this._tmRetour); this._tmRetour = 0; }
  connectedCallback() {
    if (this._sim && this._hassBrut) this.hass = this._hassBrut; // la simulation reprend
    if (this._sq) requestAnimationFrame(() => { this._mise(); this._majCrayon(); if (this._ok) this._minuterie(); });
  }

  // ambiance : traces qui s'estompent et soleil qui avance (toutes les 30 s) ; animations en pause quand le plan n'est pas à l'écran
  _minuterie() {
    const A = this._config.ambiance, il = !!(A && !this._editeur && (coucheTraces(A) || coucheJour(A)));
    if (il && !this._tm) this._tm = setInterval(() => { if (this.isConnected && this._ok) { this._majTraces(); this._majAmbiance(); } }, 30000);
    if (!il && this._tm) { clearInterval(this._tm); this._tm = 0; }
    // tablette murale : anti-marquage (jamais en édition, où la carte reste à sa place)
    const bi = !!this._tablette()?.anti_marquage;
    if (bi && !this._tmBi) this._tmBi = setInterval(() => { if (this.isConnected && this._ok) this._pasAntiMarquage(); }, PAS_ANTI_MARQUAGE);
    if (!bi && this._tmBi) { clearInterval(this._tmBi); this._tmBi = 0; }
    if (!bi && this._bi != null) { this._bi = null; this.shadowRoot?.querySelector("ha-card")?.style.removeProperty("transform"); }
    const z = this.shadowRoot?.querySelector(".zone");
    if (z && !this._vu && typeof IntersectionObserver === "function") {
      this._vu = new IntersectionObserver((l) => { for (const e of l) {
        e.target.classList.toggle("hors-ecran", !e.isIntersecting);
        const sv = e.target.querySelector("svg"); // animations SMIL (météo)
        if (sv?.pauseAnimations) { if (e.isIntersecting) sv.unpauseAnimations(); else sv.pauseAnimations(); }
      } });
      this._vu.observe(z);
    }
  }

  // réglages effectifs : interaction, mode tablette (jamais en édition : l'éditeur montre tout), niveau d'animation
  _tablette() { return this._editeur ? null : tabletteDe(this._config); }
  _figee() { return !this._editeur && interactionDe(this._config).figee; }
  _niveauAnim() { return niveauAnimDe(this._config); }
  // animations SMIL (météo, flux d'énergie, vitrine) dessinées figées : niveau réduit ou aucun, ou mouvement réduit demandé par le système
  _sansBoucles() { return this._niveauAnim() !== "complet" || matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // un pas d'anti-marquage : décalage de la carte entière (transform, sans effet sur la mise en page ; reconnu des vieilles WebView)
  _pasAntiMarquage() {
    const card = this.shadowRoot?.querySelector("ha-card");
    if (!card) return;
    this._bi = (this._bi ?? 12) + 1;
    const [x, y] = decalageAntiMarquage(this._bi);
    if (x || y) card.style.transform = `translate(${x}px, ${y}px)`; else card.style.removeProperty("transform");
  }

  // `interaction.reset_after` : compte à rebours relancé à chaque action sur la carte
  _activite() {
    clearTimeout(this._tmRetour); this._tmRetour = 0;
    const s = this._config ? interactionDe(this._config).retour : 0;
    if (s > 0) this._tmRetour = setTimeout(() => this._retourAuto(), s * 1000);
  }
  // jamais pendant l'édition ni pendant la lecture d'un replay : le compte à rebours reprend
  _retourAuto() {
    this._tmRetour = 0;
    if (!this._ok || !this.isConnected || !(interactionDe(this._config).retour > 0)) return;
    if (this._editeur || this._rp?.lecture) return this._activite();
    this.revenirAuPlan();
  }
  // retour au plan entier : fiche et menu des calques fermés, replay en pause fermé (retour au direct), vue de la pièce fermée, zoom initial
  revenirAuPlan() {
    const R = this.shadowRoot, d = R?.querySelector("dialog.mf");
    if (d?.open) d.close();
    this._menuCalques(false);
    if (this._rp && !this._rp.lecture) this._replayFermer();
    if (this._iso != null || this._vue) this.toutVoir();
  }

  // pleine page : la carte occupe la hauteur restante de l'écran, le plan tient sans défilement
  _mise() {
    const R = this.shadowRoot, card = R?.querySelector("ha-card");
    if (!card || !this._box) return;
    // sur téléphone (carte étroite) : défilement de page autorisé, plan en pleine largeur et fiche dépliée dessous
    // mode tablette : toujours en pleine page, quelle que soit la largeur
    const plein = this._tablette() ? true : this._config.plein_ecran !== false && this.clientWidth >= 760;
    card.classList.toggle("plein", plein);
    if (plein) {
      const haut = card.getBoundingClientRect().top - (this._bi != null ? decalageAntiMarquage(this._bi)[1] : 0); // sans le décalage anti-marquage
      if (haut >= 0) card.style.height = `${Math.max(420, window.innerHeight - haut - 8)}px`;
    } else card.style.height = "";
    const corps = R.querySelector(".corps"), plan = R.querySelector(".plan");
    const { P } = this._panneauxCourants(), aG = !!P.gauche?.length, aD = !!P.droite?.length;
    const cw = corps.clientWidth, ch = plein ? corps.clientHeight : Infinity, r = this._box.W / this._box.H;
    const fiche = !R.querySelector(".fiche").hidden, ed = !!this._editeur, vue = R.querySelector(".vue");
    const mode = cw >= 1180 ? "large" : cw >= 760 ? "moyen" : "etroit";
    if (mode !== this._modeMise) { this._modeMise = mode; this._widgets(); }
    // en édition, la vue finale garde exactement sa mise en page (réduite de la largeur prise par l'éditeur, 0 : son panneau flotte)
    const reduite = ed && mode !== "etroit";
    this._zVue = reduite ? (cw - this._editeur.largeurPanneau()) / cw : 1;
    card.classList.toggle("ed-etroit", ed && mode === "etroit");
    vue.style.zoom = reduite ? String(this._zVue) : "";
    vue.style.width = reduite ? `${cw}px` : "";
    vue.style.height = reduite && plein ? `${ch}px` : "";
    const voirG = mode === "large" && (aG || ed);
    const voirD = fiche || aD || (mode !== "large" && aG) || (ed && mode !== "etroit");
    R.querySelector(".col-g").hidden = !voirG;
    R.querySelector(".col-d").hidden = !voirD;
    const cote = voirD || ed;
    corps.classList.toggle("colonne", mode === "etroit" && cote);
    const dispoW = mode === "etroit" ? cw : cw - (voirG ? 336 : 0) - (voirD ? 336 : 0);
    const dispoH = mode === "etroit" && cote && plein ? ch * 0.6 : ch;
    plan.style.width = `${Math.floor(Math.max(200, Math.min(dispoW, (dispoH - 16) * r + 16)))}px`;
    this._ajusterCols();
    this._tailleBadges();
  }

  // badge de valeur masqué quand le meuble fait moins de 24 px à l'écran (recalculé au zoom et au redimensionnement)
  _tailleBadges(v = this.vue()) {
    const R = this.shadowRoot, z = R?.querySelector(".zone"), l = R?.querySelectorAll(".calque>.mb");
    // textes figés sur le plan : ils grossissent et rapetissent avec le zoom comme le dessin (1 = plan entier de la vue)
    z?.style.setProperty("--zk", +((this._refW || v.W) / v.W).toFixed(4));
    this._rangeePersonnes();
    this._eviterPastilles();
    if (!l?.length || !z.clientWidth) return;
    const k = z.clientWidth / v.W;
    l.forEach((b) => {
      const m = this._config.meubles?.[+b.dataset.mbq], t = m && (m.taille || MEUBLES[m.type]?.taille || [60, 60]);
      if (t) b.classList.toggle("petit", Math.min(nb(t[0], 60), nb(t[1], 60)) * k < 24);
    });
  }

  // étiquette de pièce recouverte par une pastille (petit écran surtout) : décalée vers la place libre la plus proche (au plus deux
  // hauteurs d'étiquette en hauteur, une largeur en largeur) ; rien ne bouge sans chevauchement. En vue seulement : dans l'éditeur, l'étiquette reste à
  // la position qu'on règle. Recalculé à la mise en page, au zoom et quand les valeurs changent.
  _eviterPastilles() {
    const R = this.shadowRoot, etqs = [...(R?.querySelectorAll(".calque>.etq") || [])];
    etqs.forEach((e) => { if (e.classList.contains("evite")) { e.classList.remove("evite"); e.style.removeProperty("--dx"); e.style.removeProperty("--dy"); } });
    if (this._editeur || !etqs.length) return;
    const pts = [...R.querySelectorAll(".calque>.pt")].map((p) => p.getBoundingClientRect()).filter((r) => r.width > 0);
    if (!pts.length) return;
    const pris = [];
    for (const e of etqs) {
      const r = e.getBoundingClientRect();
      if (!r.width) continue;
      const libre = (dx, dy) => !pts.some((p) => p.left < r.right + dx - 2 && p.right > r.left + dx + 2 && p.top < r.bottom + dy - 2 && p.bottom > r.top + dy + 2)
        && !pris.some((q) => q.left < r.right + dx && q.right > r.left + dx && q.top < r.bottom + dy && q.bottom > r.top + dy);
      if (libre(0, 0)) continue;
      let mieux = null;
      for (let dy = -Math.round(r.height * 2 / 4) * 4; dy <= r.height * 2; dy += 4)
        for (let dx = -Math.round(r.width / 4) * 4; dx <= r.width; dx += 4) {
          const d = Math.hypot(dx * 1.5, dy); // un peu plus loin en largeur : l'étiquette reste au-dessus ou au-dessous de sa place
          if ((!mieux || d < mieux.d) && libre(dx, dy)) mieux = { dx, dy, d };
        }
      if (!mieux) continue;
      const z = this._zVue || 1;
      e.classList.add("evite");
      e.style.setProperty("--dx", `${mieux.dx / z}px`); e.style.setProperty("--dy", `${mieux.dy / z}px`);
      pris.push({ left: r.left + mieux.dx, right: r.right + mieux.dx, top: r.top + mieux.dy, bottom: r.bottom + mieux.dy });
    }
  }

  static getStubConfig() {
    return versAnglais({ titre: _t("Mon plan"), pieces: [{ nom: _t("Pièce"), poly: [[0, 0], [400, 0], [400, 300], [0, 300]], etiquette: [200, 150] }],
      murs: [[0, 0, 400, 0], [400, 0, 400, 300], [400, 300, 0, 300], [0, 300, 0, 0]] });
  }

  getCardSize() { return 14; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  _entites() {
    const c = this._config, l = [];
    for (const p of c.pieces) l.push(p.temperature, p.humidite);
    for (const t of c.textes || []) if (Array.isArray(t?.infos)) for (const x of t.infos) l.push(x?.entite);
    for (const o of c.ouvertures || []) { l.push(o.contact, o.volet, o.entite); for (const w of o.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const p of c.points || []) { l.push(p.entite, p.actif, p.valeur); for (const w of p.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const m of c.meubles || []) { l.push(m.entite, m.actif, m.valeur); for (const w of m.fiche?.widgets || []) l.push(...entitesWidget(w)); }
    for (const w of [...(c.panneaux?.gauche || []), ...(c.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    for (const q of this._puces()) if (q.afficher === "absent" || q.afficher === "present") l.push(q.presence || presenceDefaut(c)); // puces selon la présence
    for (const p of c.pieces) for (const w of [...(p.panneaux?.gauche || []), ...(p.panneaux?.droite || [])]) l.push(...entitesWidget(w));
    const A = c.ambiance;
    if (coucheJour(A)) l.push(coucheJour(A).soleil || "sun.sun");
    if (coucheMeteo(A)) l.push(coucheMeteo(A).entite);
    l.push(...this._listePersonnes(A).map((p) => p.entite));
    for (const r of Array.isArray(c.alertes) ? c.alertes : []) if (r && typeof r === "object") {
      l.push(r.entite, ...(Array.isArray(r.entites) ? r.entites : []), r.si_absent ? r.presence || presenceDefaut(c) : null);
      if (r.type === "ouvertures") for (const o of c.ouvertures || []) l.push(o.contact, o.entite);
    }
    return [...new Set(l.filter((e) => typeof e === "string" && e.includes(".")))];
  }

  _change() {
    let diff = false;
    for (const e of this._suivies) {
      const s = this._hass.states[e];
      if (s !== this._prec[e]) { this._prec[e] = s; diff = true; }
    }
    return diff;
  }

  _squelette() {
    if (this._sq) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    poserHTML(this.shadowRoot, `<style>${CSS}${CSS_BARRE}</style><ha-card>
      <div class="barre"><button class="ib retour" hidden title="${_t("Toute la maison")}"><ha-icon icon="mdi:arrow-left"></ha-icon></button><div class="titre"></div>
        <button class="ib editer" title="${_t("Modifier le plan")}" hidden><ha-icon icon="mdi:pencil-ruler"></ha-icon></button></div>
      <div class="tete"></div>
      <div class="corps"><div class="vue"><aside class="col col-g" hidden><div class="col-in"><div class="widgets"></div></div></aside><div class="plan"><div class="zone"></div>
        <div class="zoom"><button data-z="calques" title="${_t("Calques affichés")}" aria-expanded="false" hidden><ha-icon icon="mdi:layers-outline"></ha-icon></button>
          <button data-z="plus" title="${_t("Zoomer")}"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button data-z="moins" title="${_t("Dézoomer")}"><ha-icon icon="mdi:minus"></ha-icon></button>
          <button data-z="tout" title="${_t("Toute la maison")}" hidden><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></button>
          <button data-z="replay" title="${_t("Revoir la journée")}" hidden><ha-icon icon="mdi:history"></ha-icon></button></div></div>
        <aside class="col col-d" hidden><div class="col-in"><div class="fiche" hidden></div><div class="widgets"></div></div></aside></div><div class="panneau-hote"></div></div>
      <div class="legende"></div></ha-card>`);
    const R = this.shadowRoot;
    R.querySelector("ha-card").addEventListener("click", (ev) => {
      const chemin = ev.composedPath();
      const z = chemin.find((n) => n.dataset?.z);
      if (z?.dataset.z === "calques") return this._menuCalques();
      const al = chemin.find((n) => n.dataset?.al);
      if (al) return this._actionAlerte(al.dataset.al);
      if (z?.dataset.z === "replay") return this._rp ? this._replayFermer() : this._replayOuvrir();
      const rp = chemin.find((n) => n.dataset?.rp);
      if (rp) return this._actionReplay(rp.dataset.rp);
      if (chemin.some((n) => n.classList?.contains("replay"))) return;
      if (z) return z.dataset.z === "tout" ? this.toutVoir() : this.zoomer(z.dataset.z === "plus" ? 1 / 1.6 : 1.6);
      if (chemin.some((n) => n.classList?.contains("menu-cq"))) return;
      if (chemin.some((n) => n.classList?.contains("retour"))) return this.toutVoir();
      const dep = chemin.find((n) => n.dataset?.depart);
      if (dep) return this._demarrer(dep.dataset.depart);
      if (this._editeur) {
        const aj = chemin.find((n) => n.dataset?.ajouter);
        if (aj) { const pc = this._panneauxCourants(); return this._editeur.ouvrirCatalogue({ widgets: true, cote: aj.dataset.ajouter, piece: pc.pi, ...(pc.pf ? { [pc.pf.genre]: pc.pf.i } : {}) }); }
        if (chemin.some((n) => n.dataset?.ajouterPuce != null)) return this._editeur.ajouterPuce();
        if (this._puceGlissee) return;
        const pu = chemin.find((n) => n.dataset?.puce != null);
        if (pu) return this._editeur.selectionner({ type: "puce", i: +pu.dataset.puce });
        if (this._wDrag) { this._wDrag = false; return; }
        const w = chemin.find((n) => n.dataset?.w);
        if (w) this._editeur.selectionner(this._selWidget(w.dataset.w));
        return;
      }
      if (this._aBouge) { this._aBouge = false; return; }
      const mb = chemin.find((n) => n.dataset && (n.dataset.mbq != null || (n.dataset.mb != null && n.classList?.contains("connecte"))));
      if (mb) return this._clicMeuble(+(mb.dataset.mbq ?? mb.dataset.mb));
      // interrupteur (vue de la pièce, lignes des widgets) : avant la ligne qui le porte (sa fiche, plus d'infos)
      const bas = chemin.find((n) => n.classList?.contains("bascule"));
      if (bas) return this._basculer(bas);
      // ouverture ou pastille (sur le plan ou dans la fiche d'une pièce) : sa fiche si elle en a une, sinon le comportement d'avant
      const po = chemin.find((n) => n.dataset && (n.dataset.o ?? n.dataset.fo ?? n.dataset.q ?? n.dataset.fq) != null);
      if (po && this._clicPorteur((po.dataset.o ?? po.dataset.fo) != null ? "ouverture" : "point", +(po.dataset.o ?? po.dataset.fo ?? po.dataset.q ?? po.dataset.fq))) return;
      const cmd = chemin.find((n) => n.dataset?.cmd);
      if (cmd) return this._lancerCommande(cmd);
      const act = chemin.find((n) => n.dataset?.active);
      if (act) return this._activer(act);
      const th = chemin.find((n) => n.dataset?.th);
      if (th) return this._reglerThermostat(th);
      const cta = chemin.find((n) => n.classList?.contains("cta"));
      if (cta) return this._lancerAction(cta);
      if (chemin.some((n) => n.classList?.contains("voile"))) return this.toutVoir();
      const piece = chemin.find((n) => n.dataset && (n.dataset.l != null || n.dataset.p != null));
      const ip = piece ? +(piece.dataset.l ?? piece.dataset.p) : null;
      // pièce réglée sans vue (`zoom: false`, ex. extérieurs) : pas de zoom, seulement l'entité de son étiquette s'il y en a une
      if (ip != null && ip !== this._iso && this._config.pieces[ip]?.zoom !== false) {
        // `interaction.room_tap` : vue de la pièce (défaut), « plus d'infos » de son entité `tap` (sinon de sa température), ou rien
        const cp = interactionDe(this._config).clic, p = this._config.pieces[ip];
        if (cp === "vue") return this.isoler(ip);
        if (cp === "infos") this._plusInfos(p.clic || p.temperature);
        return;
      }
      const el = chemin.find((n) => n.dataset && n.dataset.e);
      if (!el || this._sim) return;
      const e = new Event("hass-more-info", { bubbles: true, composed: true });
      e.detail = { entityId: el.dataset.e };
      this.dispatchEvent(e);
    });
    R.querySelector(".editer").addEventListener("click", () => this.ouvrirEditeur());
    R.querySelector(".tete").addEventListener("pointerdown", (ev) => {
      const pu = this._editeur && ev.composedPath().find((n) => n.dataset?.puce != null);
      if (pu) this._editeur.glisserPuce(ev, pu);
    });
    this._glisserWidgets(R.querySelector(".vue"));
    this._gestes(R.querySelector(".zone"));
    // édition, panneau Ambiance ouvert : les avatars à la maison se glissent (point de rassemblement `ambiance.personnes.maison`) ;
    // en capture, avant les écouteurs de l'éditeur (sélection, cadre, déplacement de la vue)
    R.querySelector(".zone").addEventListener("pointerdown", (ev) => {
      if (!this._editeur?.vueAmbiance || ev.button > 0) return;
      const p = ev.composedPath().find((n) => n.classList?.contains("pers") && n.dataset?.pers && !n.classList.contains("dehors"));
      if (!p) return;
      ev.preventDefault(); // ni sélection de texte ni glisser natif (qui annulerait le pointeur)
      ev.stopImmediatePropagation();
      this._editeur.glisserPersonnes(ev);
    }, true);
    R.querySelector(".zone").addEventListener("keydown", (ev) => {
      if (this._editeur || (ev.key !== "Enter" && ev.key !== " ")) return;
      const g = ev.target.closest?.(".ouv.a-fiche[tabindex]");
      if (g) { ev.preventDefault(); this._clicPorteur("ouverture", +g.dataset.o); }
    });
    // `interaction.reset_after` : toute action sur la carte (plan, fiche, menus) relance le compte à rebours du retour au plan entier
    for (const t of ["pointerdown", "keydown", "wheel"]) this.addEventListener(t, () => this._activite(), { passive: true });
    this._ro = new ResizeObserver(() => this._mise());
    this._ro.observe(this);
    window.addEventListener("resize", (this._surResize = () => this._mise()));
    this._sq = true;
  }

  async ouvrirEditeur(reprise = null) {
    if (this._editeur || this._ouverture) return;
    if (this._rp) this._replayFermer();
    this._ouverture = true;
    try {
      // version HACS : l'éditeur est embarqué dans le même fichier ; version de développement : module à part
      let EditeurPlan = globalThis.MaquetteEditeur;
      if (!EditeurPlan) {
        const url = new URL("maquette-editeur.js" + new URL(import.meta.url).search, import.meta.url);
        ({ EditeurPlan } = await import(url.href));
      }
      if (this.isConnected) new EditeurPlan(this, reprise);
    } finally { this._ouverture = false; }
  }

  // boutons de l'état vide : ouvre l'éditeur puis lance l'assistant, l'outil rectangle ou l'import
  async _demarrer(a) {
    if (!this._editeur) await this.ouvrirEditeur();
    const e = this._editeur;
    if (!e) return;
    ({ pieces: () => e.assistantPieces(), rectangle: () => e.choisirOutil("rectangle"), importer: () => e.exporter() })[a]?.();
  }

  _reprise() {
    if (this._editeur || !this._hass?.user?.is_admin) return;
    const cle = `maquette-rouvrir:${this._config.id || "plan"}`;
    let r = null;
    try { r = JSON.parse(sessionStorage.getItem(cle) || "null"); sessionStorage.removeItem(cle); } catch (e) { return; }
    if (r && Date.now() - r.t < 30000) setTimeout(() => this.ouvrirEditeur(r), 0);
  }

  // repère : position d'un événement pointeur en cm (coordonnées du plan)
  cm(ev) {
    const svg = this.shadowRoot.querySelector(".zone svg");
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  bornes(sansVitrine = false) {
    const c = this._config, xs = [], ys = [];
    const ajoute = (x, y) => { xs.push(x); ys.push(y); };
    c.pieces.forEach((p) => p.poly.forEach(([x, y]) => ajoute(x, y)));
    [...(c.murs || []), ...(c.limites || []), ...(c.ouvertures || []).map((o) => o.seg)].forEach(([a, b, d, e]) => { ajoute(a, b); ajoute(d, e); });
    (c.points || []).forEach((p) => ajoute(...p.pos));
    (c.meubles || []).forEach((m) => { const [w, h] = [0, 1].map((j) => nb((m.taille || MEUBLES[m.type]?.taille || [60, 60])[j], 60)), r = Math.hypot(w, h) / 2; ajoute(nb(m.pos?.[0]) - r, nb(m.pos?.[1]) - r); ajoute(nb(m.pos?.[0]) + r, nb(m.pos?.[1]) + r); });
    if (!xs.length) ajoute(0, 0), ajoute(500, 500);
    const m = c.marge ?? 40;
    let x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, x1 = Math.max(...xs) + m, y1 = Math.max(...ys) + m;
    // textes figés et zones d'informations (centrés sur leur position, police en px : clamp(10px, 1,2 % de la largeur, 13px)) :
    // emprise estimée d'après leurs caractères et la largeur affichée du plan ; le cadre ne s'agrandit que si un texte dépasse
    const textes = (c.textes || []).filter((t) => t && Array.isArray(t.pos) && Number.isFinite(+t.pos[0]) && Number.isFinite(+t.pos[1]));
    if (textes.length) {
      const P = this.shadowRoot?.querySelector(".plan>.zone")?.clientWidth || this.clientWidth || 800, px = Math.max(10, Math.min(13, 0.012 * P));
      const nomL = (l) => String(l?.nom || this._hass?.states?.[l?.entite]?.attributes?.friendly_name || l?.entite || "").length;
      // largeur d'un texte en em : majuscules et chiffres plus larges, espaces plus étroits
      const largeur = (txt) => [...txt].reduce((a, ch) => a + (ch === " " ? 0.3 : /[A-Z0-9ÀÂÉÈÊÎÔÛÇMW]/.test(ch) ? 0.72 : 0.56), 0);
      for (let tour = 0; tour < 4; tour++) { // l’emprise agrandit le plan, donc les textes en cm : quelques passes
        const em = (px * (x1 - x0)) / P;
        for (const t of textes) {
          const f = em * Math.max(0.3, Math.min(5, nb(t.taille, 1))), titre = String(t.t ?? ""), info = Array.isArray(t.infos);
          const l = info ? Math.max(6, largeur(titre) + 1.5, ...t.infos.map((x) => (nomL(x) + 9) * 0.55 + 2.2)) * f + 1.5 * f : Math.max(0.6, largeur(titre)) * f;
          const h = info ? ((t.infos.length || 1) + (titre ? 1 : 0)) * 1.5 * f + 0.9 * f : 1.3 * f;
          const [x, y] = [+t.pos[0], +t.pos[1]];
          x0 = Math.min(x0, x - l / 2 - 8); x1 = Math.max(x1, x + l / 2 + 8); y0 = Math.min(y0, y - h / 2 - 8); y1 = Math.max(y1, y + h / 2 + 8);
        }
      }
    }
    const b = { x0, y0, W: x1 - x0, H: y1 - y0 };
    if (!c.vitrine || sansVitrine) return b;
    const v = geoVitrine(c, b), X0 = Math.min(b.x0, v.x - m), Y0 = Math.min(b.y0, v.y - m);
    return { x0: X0, y0: Y0, W: Math.max(b.x0 + b.W, v.x + v.w + m) - X0, H: Math.max(b.y0 + b.H, v.y + v.H + m) - Y0 };
  }

  // calques effectifs : ordre de dessin, masqués (config, afficher_meubles, choix du visiteur en vue) et verrouillés (édition seulement)
  _calques() {
    const c = this._config, q = c.calques || {}, ed = !!this._editeur, masques = new Set(q.masques || []);
    if (c.afficher_meubles === false || (c.afficher_meubles === "pc" && this.clientWidth < 760)) masques.add("meubles");
    if (!ed) this._calquesVisiteur().forEach((k) => masques.add(k));
    return { svg: ordreCalques(q.ordre_svg, CALQUES_SVG), html: ordreCalques(q.ordre_html, CALQUES_HTML), masques, verrous: new Set(ed ? q.verrous || [] : []) };
  }

  // bouton « Calques » en vue : choix propres à ce navigateur (jamais dans la config), ignorés si le bouton est retiré
  _cleCalques() { return `maquette-calques:${this._config.id || "plan"}`; }
  _calquesVisiteur() {
    if (!this._config.calques?.bouton_vue) return [];
    const cle = this._cleCalques();
    if (this._cqV?.cle !== cle) {
      let l = [];
      try { l = JSON.parse(localStorage.getItem(cle) || "[]"); } catch (e) { /* stockage indisponible : rien de caché */ }
      this._cqV = { cle, l: Array.isArray(l) ? l.filter((k) => NOMS_CALQUES[k]) : [] };
    }
    return this._cqV.l;
  }
  // calques proposés dans le menu de la vue : ceux qui ont des éléments et que la config ne cache pas déjà
  _calquesMenu() {
    const c = this._config, q = c.calques || {}, P = c.points || [], M = c.meubles || [];
    const presents = { meubles: M.length, appareils: P.length, halos: P.some((p) => p.halo), limites: (c.limites || []).length, sous_zones: c.pieces.some((p) => p.sous_zone),
      etiquettes: c.pieces.some((p) => !p.sous_zone && p.etiquette), libelles: c.pieces.some((p) => p.sous_zone && p.etiquette) || M.some((m) => m.type === "espace" && m.nom), textes: (c.textes || []).length };
    const fixes = new Set(q.masques || []);
    if (c.afficher_meubles === false) fixes.add("meubles");
    return Object.keys(presents).filter((k) => presents[k] && !fixes.has(k));
  }
  _menuCalques(ouvrir = true) {
    const R = this.shadowRoot, zoom = R.querySelector(".zoom"), btn = R.querySelector('[data-z="calques"]'), ouvert = R.querySelector(".menu-cq");
    if (ouvert || !ouvrir) {
      ouvert?.remove();
      btn.setAttribute("aria-expanded", "false");
      window.removeEventListener("pointerdown", this._horsMenu, true);
      return;
    }
    const caches = new Set(this._calquesVisiteur());
    const m = document.createElement("div");
    m.className = "menu-cq";
    m.setAttribute("role", "group");
    m.setAttribute("aria-label", _t("Calques affichés"));
    poserHTML(m, `<div class="t">${_t("Afficher")}</div>${this._calquesMenu().map((k) => `<label><input type="checkbox" data-cqv="${k}" ${caches.has(k) ? "" : "checked"}><ha-icon icon="${ICONES_CALQUES[k]}"></ha-icon><span>${esc(_t(NOMS_CALQUES[k]))}</span></label>`).join("")}`);
    m.onchange = (ev) => {
      const k = ev.target.dataset.cqv;
      if (!k) return;
      const l = new Set(this._calquesVisiteur());
      if (ev.target.checked) l.delete(k); else l.add(k);
      this._cqV = { cle: this._cleCalques(), l: [...l] };
      try { if (l.size) localStorage.setItem(this._cqV.cle, JSON.stringify([...l])); else localStorage.removeItem(this._cqV.cle); } catch (e) { /* stockage indisponible : le choix vaut pour cette page */ }
      this._construire();
    };
    m.onkeydown = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); this._menuCalques(false); btn.focus(); } };
    this._horsMenu = (ev) => { if (!ev.composedPath().some((n) => n === m || n === btn)) this._menuCalques(false); };
    window.addEventListener("pointerdown", this._horsMenu, true);
    zoom.append(m);
    btn.setAttribute("aria-expanded", "true");
    m.querySelector("input")?.focus();
  }

  _construire() {
    this._squelette();
    const c = this._config, R = this.shadowRoot;
    this._suivies = this._entites();
    this._prec = {};
    this._box = this._boxFige || this.bornes();
    this._refW = this.bornes().W; // textes et zones d'informations : taille rapportée au plan entier de la vue
    if (this._editeur) this._iso = null;
    if (this._iso != null && !c.pieces[this._iso]) this._iso = null;
    // fiche ouverte d'un élément qui n'existe plus ou n'a plus de fiche (config rechargée), ou éditeur ouvert : on la ferme
    if (this._mf && (this._editeur || !this._ficheOuvrable(this._mf.genre, this._mfObjet()))) R?.querySelector("dialog.mf")?.close();
    const { x0, y0, W, H } = this.vue();
    const pct = ([x, y]) => `left:${((x - x0) / W * 100).toFixed(3)}%;top:${((y - y0) / H * 100).toFixed(3)}%`;
    const xy = ([x, y]) => `data-x="${+x}" data-y="${+y}"`;
    const chemin = (segs) => segs.map(([a, b, d, e]) => `M${a} ${b}L${d} ${e}`).join("");

    // calques : masqués = absents en vue, à 25 % et non cliquables en édition ; verrouillés = transparents au clic (édition)
    const Q = this._calques(), ed = !!this._editeur;
    const voir = (k) => ed || !Q.masques.has(k);
    const cq = (...ks) => ks.map((k) => `${Q.masques.has(k) ? " c-masque" : ""}${Q.verrous.has(k) ? " c-verrou" : ""}`).join("");
    // élément masqué (`masque: true`) : absent en vue, en transparence (mais sélectionnable) en édition
    const garde = (o) => ed || !o?.masque, em = (o) => (o?.masque ? " e-masque" : "");
    const trie = (l, niv = (o) => nb(o.niveau)) => l.map((o, i) => [o, i]).filter(([o]) => garde(o)).sort((a, b) => niv(a[0]) - niv(b[0]) || a[1] - b[1]);
    const S = {};
    // sous-zones (cuisine, douche…) : contour pointillé au-dessus des pièces, sans teinte ; en vue, le clic passe à la pièce dessous
    for (const [k, sz] of [["pieces", false], ["sous_zones", true]]) S[k] = trie(c.pieces).filter(([p]) => !!p.sous_zone === sz)
      .map(([p, i]) => `<polygon class="piece${p.dehors ? " dehors" : ""}${p.sous_zone ? " sous-zone" : ""}${em(p)}" data-p="${i}" points="${ptsSvg(p.poly)}"/>`).join("");
    S.halos = (c.points || []).map((p, i) => {
      if (!p.halo || !garde(p)) return "";
      const k = p.piece != null ? c.pieces.findIndex((q) => q.nom === p.piece) : -1;
      return (k >= 0 ? `<clipPath id="cp${i}"><polygon points="${ptsSvg(c.pieces[k].poly)}"/></clipPath>` : "")
        + `<circle class="halo" data-h="${i}" cx="${p.pos[0]}" cy="${p.pos[1]}" r="${p.halo === true ? 130 : nb(p.halo)}" fill="url(#halo)" opacity="0"${k >= 0 ? ` clip-path="url(#cp${i})"` : ""}/>`;
    }).join("");
    // meuble connecté : cliquable en vue, contour et teinte d'accent quand il est actif (mis à jour par _maj, sans reconstruction)
    const accent = (m) => { const k = couleurMeuble(m); return ` style="${k ? `--mb-couleur:${esc(k)};` : ""}${styleAnim(animDe(c, "meuble", m))}"`; };
    S.meubles = trie(c.meubles || [], niveauMeuble).map(([m, i]) => dessinMeuble(m).replace('<g class="meuble',
      `<g data-mb="${i}"${estConnecte(m) ? accent(m) : ""} class="meuble${em(m)}${estConnecte(m) ? ` connecte${m.teinte === false ? "" : " teinte"}${clicMeuble(m) === "aucun" ? " sans-clic" : ""}${classeAnim(animDe(c, "meuble", m))}` : ""}`)).join("");
    S.limites = c.limites?.length ? `<path class="limites" d="${chemin(c.limites)}"/>` : "";
    S.murs = `<path class="murs" d="${chemin(c.murs || [])}"/>`;
    S.ouvertures = trie(c.ouvertures || []).map(([o, i]) => {
      const [a, b, d, e] = o.seg, [nx, ny] = o.dehors || [0, 0], ent = o.contact || o.entite || o.volet;
      const { baie, traits } = traitsOuverture(o);
      const av = animDe(c, "volet", o, "animation_volet"), ao = animDe(c, "ouverture", o);
      const volet = o.volet ? `<path class="volet${classeAnim(av)}" style="${styleAnim(av)}" data-v="${i}" d="M${a + nx * 16} ${b + ny * 16}L${d + nx * 16} ${e + ny * 16}"/>` : "", mode = clicPorteur(o);
      // ouverture à fiche : atteignable au clavier (Entrée / Espace), annoncée comme ouvrant une fenêtre de dialogue
      const kb = mode === "fiche" && !ed ? ` tabindex="0" role="button" aria-haspopup="dialog" aria-label="${esc(o.nom || (ent ? this._nom(ent) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))))}"` : "";
      return `<g class="ouv${Object.hasOwn(NOMS_OUVERTURE, o.type) ? ` ${o.type}` : ""}${o.contact || o.entite ? "" : " sans"}${mode === "aucun" ? " sans-clic" : mode ? " a-fiche" : ""}${em(o)}${classeAnim(ao)}" style="${styleAnim(ao)}" data-o="${i}"${ent ? ` data-e="${esc(ent)}"` : ""}${kb}>
        ${ent || mode === "fiche" ? `<path class="cible" d="M${a} ${b}L${d} ${e}"/>` : ""}${baie}${traits}${volet}<title></title></g>`;
    }).join("");
    let svg = `<svg viewBox="${x0} ${y0} ${W} ${H}" role="img" aria-label="${esc(c.titre || _t("Plan de la maison"))}">
      <defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd54f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd54f" stop-opacity="0"/></radialGradient></defs>`;
    // ambiance (pas en édition) : teinte de nuit (plus forte dehors), lumière du soleil et météo sur les extérieurs, sous les halos
    const A = (!ed || this._editeur?.vueAmbiance) && c.ambiance && typeof c.ambiance === "object" ? c.ambiance : null, b0 = this._box;
    const ext = c.pieces.filter((p) => p.dehors && !p.sous_zone && Array.isArray(p.poly) && p.poly.length > 2);
    let amb = "";
    if (A) {
      const r = `x="${b0.x0}" y="${b0.y0}" width="${b0.W}" height="${b0.H}"`;
      amb = `<g class="amb" aria-hidden="true"><defs><linearGradient id="amb-g" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb74d"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient>
        <radialGradient id="amb-nuage"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>
        ${ext.length ? `<clipPath id="cp-dehors">${ext.map((p) => `<polygon points="${ptsSvg(p.poly)}"/>`).join("")}</clipPath>` : ""}</defs>
        <rect class="amb-n amb-ni" ${r} fill="#0b1d4d" opacity="0"/>
        ${ext.length ? `<g clip-path="url(#cp-dehors)"><rect class="amb-n amb-ne" ${r} fill="#0b1d4d" opacity="0"/><rect class="amb-sol" ${r} fill="url(#amb-g)" opacity="0"/><g class="amb-meteo"></g></g>` : ""}</g>`;
    }
    this._meteoCle = null; this._fluxCle = null;
    for (const k of Q.svg) {
      if (k === "halos") svg += amb;
      if (voir(k)) svg += `<g class="cq${k === "meubles" ? " meubles" : ""}${cq(k)}" data-cq="${k}"${k === "meubles" && !ed ? ` aria-hidden="true"` : ""}>${S[k]}</g>`;
      if (k === "meubles" && A && coucheEnergie(A)) svg += `<g class="flux" aria-hidden="true"></g>`; // billes au-dessus des meubles
    }
    const vit = c.vitrine ? this._vitrine(pct, xy) : null;
    if (vit) svg += vit.svg;
    const iso = this._iso != null ? c.pieces[this._iso] : null;
    if (iso) {
      const b = this._box;
      svg += `<path class="voile" fill-rule="evenodd" d="M${b.x0 - 5000} ${b.y0 - 5000}h${b.W + 10000}v${b.H + 10000}h${-(b.W + 10000)}Z M${iso.poly.map((q) => `${+q[0]} ${+q[1]}`).join("L")}Z"/>`;
    }
    svg += `</svg>`;
    const hors = (pos) => iso && !dansPoly(pos, iso.poly) ? " hors" : "";

    const H_ = { etiquettes: "", libelles: "", appareils: "", textes: "", meubles: "" };
    // meuble connecté : bouton HTML centré (cible tactile ≥ 44 px, clavier, lecteur d'écran) qui porte le badge de valeur
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m, i]) => {
      if (!estConnecte(m)) return;
      const nom = esc(m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble"))), b = clicMeuble(m) !== "aucun";
      const am = animDe(c, "meuble", m);
      H_.meubles += `<${b ? "button" : "span"} class="mb${hors(m.pos)}${cq("meubles")}${em(m)}${classeAnim(am)}" data-mbq="${i}" ${xy(m.pos)} style="${pct(m.pos)}${couleurMeuble(m) ? `;--mb-couleur:${esc(couleurMeuble(m))}` : ""};${styleAnim(am)}"${b ? ` aria-haspopup="${clicMeuble(m) === "fiche" ? "dialog" : "false"}" aria-label="${nom}"` : ""}><span class="v"></span></${b ? "button" : "span"}>`;
    });
    const cp = interactionDe(c).clic; // `interaction.room_tap`
    const EP = etiquettesPieces(c);
    trie(c.pieces).forEach(([p, i]) => {
      if (!p.etiquette) return;
      const cible = p.clic || p.temperature;
      // étiquette sans action au toucher (rien, ou « plus d'infos » sans entité) : pas d'apparence de bouton cliquable
      // (hors de l'ordre du clavier : elle ne fait rien)
      const inerte = !ed && cp !== "vue" && p.zoom !== false && (cp === "aucun" || !cible) ? " inerte" : "";
      if (p.sous_zone) { if (voir("sous_zones")) H_.libelles += `<span class="zone-etq sz${iso && !dansPoly(p.etiquette, iso.poly) ? " hors" : ""}${cq("libelles", "sous_zones")}${em(p)}" data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}">${esc(p.nom)}</span>`; return; }
      H_.etiquettes += `<button class="etq${p.dehors ? " dehors" : ""}${iso && i !== this._iso ? " hors" : ""}${cq("etiquettes")}${em(p)}${inerte}"${inerte ? ` tabindex="-1"` : ""} data-l="${i}" ${xy(p.etiquette)} style="${pct(p.etiquette)}"${cible ? ` data-e="${esc(cible)}"` : ""}>
        <b${EP.nom ? "" : ' class="cache"'}>${esc(p.nom)}</b><span class="val"></span></button>`;
    });
    const bs = classesPastilles(stylePastilles(c));
    trie(c.points || []).forEach(([p, i]) => {
      const ap = animDe(c, evenementPoint(p), p);
      H_.appareils += `<button class="pt${bs}${hors(p.pos)}${cq("appareils")}${em(p)}${classeAnim(ap)}" data-q="${i}" data-e="${esc(p.entite)}" ${xy(p.pos)} style="${pct(p.pos)};--pt-couleur:${couleurSure(p.couleur) || "var(--state-active-color,#fdd835)"};${styleAnim(ap)}"${clicPorteur(p) === "fiche" ? ` aria-haspopup="dialog"` : ""}>
        <ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon><span class="v"></span></button>`;
    });
    // nom d'un espace : libellé d'un meuble, masqué avec le calque Meubles comme avec celui des libellés
    if (voir("meubles")) trie(c.meubles || [], niveauMeuble).forEach(([m]) => {
      if (m.type === "espace" && m.nom) H_.libelles += `<span class="zone-etq${hors(m.pos)}${cq("libelles", "meubles")}${em(m)}" ${xy(m.pos)} style="${pct(m.pos)}">${esc(m.nom)}</span>`;
    });
    trie(c.textes || []).forEach(([t, i]) => {
      // zone d'informations : un texte qui porte une liste d'entités (titre facultatif, une ligne par entité, valeurs en direct)
      if (Array.isArray(t.infos)) {
        H_.textes += `<div class="txt infob${t.style === "discret" ? " discret" : ""}${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">
          ${t.t ? `<b class="ib-t">${esc(t.t)}</b>` : ""}${t.infos.map((l, j) => `<span class="ib-l" data-ibl="${j}"${typeof l?.entite === "string" ? ` data-e="${esc(l.entite)}"` : ""}><ha-icon icon="${esc(l?.icone || "mdi:information-outline")}"></ha-icon><span class="ib-n"></span><span class="ib-v"></span></span>`).join("")}
          ${t.infos.length ? "" : `<span class="ib-vide">${_t("Ajoute des entités")}</span>`}</div>`;
        return;
      }
      H_.textes += `<span class="txt${hors(t.pos)}${cq("textes")}${em(t)}" data-t="${i}" ${xy(t.pos)} style="${pct(t.pos)}${t.taille ? `;font-size:calc(var(--zk,1)*${nb(t.taille, 1)}em)` : ""}">${esc(t.t)}</span>`;
    });
    // les boutons des meubles passent sous les pastilles (même place que le calque Appareils, qu'il soit affiché ou non)
    const calque = Q.html.map((k) => (k === "appareils" ? H_.meubles : "") + (voir(k) ? H_[k] : "")).join("")
      + (A && coucheJour(A) && coucheJour(A).marqueur !== false ? `<span class="amb-astre" hidden><ha-icon icon="mdi:white-balance-sunny"></ha-icon></span>` : "")
      + (vit ? vit.html : "") + (A ? this._htmlPersonnes(A) : "");

    // mode tablette sans titre : dans la vue d'une pièce, son nom sert de titre (sans « › » devant)
    const tabSansTitre = !c.titre && !!this._tablette();
    poserHTML(R.querySelector(".titre"), `${esc(c.titre || "")}${iso ? (tabSansTitre ? esc(iso.nom) : ` <span class="fil">› ${esc(iso.nom)}</span>`) : ""}${this._sim ? ` <span class="badge-demo" title="${_t("Appartement de démonstration : états simulés, aucune commande n'atteint la maison")}">${_t("Démo · états simulés")}</span>` : ""}`);
    R.querySelector(".retour").hidden = !iso;
    // vue figée : boutons de zoom cachés ; mode tablette sans titre : pas d'en-tête (sauf dans la vue d'une pièce, pour le retour),
    // le bouton d'édition passe alors avec les boutons du plan
    const fig = this._figee(), tab = this._tablette(), sansTete = !!tab && !c.titre && !iso && !this._sim;
    R.querySelector('[data-z="tout"]').hidden = !this._vue || fig;
    for (const z of ["plus", "moins"]) R.querySelector(`[data-z="${z}"]`).hidden = fig;
    R.querySelector(".barre").hidden = sansTete;
    const bEd = R.querySelector(".editer"), hote = R.querySelector(sansTete ? ".zoom" : ".barre");
    if (bEd.parentElement !== hote) hote.append(bEd);
    const niv = this._niveauAnim(), card = R.querySelector("ha-card");
    card.classList.toggle("anim-reduit", niv === "reduit");
    card.classList.toggle("anim-aucune", niv === "aucun");
    card.classList.toggle("tablette", !!tab);
    const brp = R.querySelector('[data-z="replay"]');
    brp.hidden = ed || !c.replay;
    brp.classList.toggle("on", !!this._rp);
    const bcq = R.querySelector('[data-z="calques"]');
    bcq.hidden = ed || !c.calques?.bouton_vue || !this._calquesMenu().length;
    if (bcq.hidden) this._menuCalques(false);
    const zone = R.querySelector(".zone");
    zone.classList.toggle("zoome", !!this._vue);
    zone.classList.toggle("figee", fig);
    zone.style.aspectRatio = `${this._box.W} / ${this._box.H}`;
    zone.classList.toggle("amb-glisse", ed && !!this._editeur?.vueAmbiance && !!A && !!couchePersonnes(A));
    const tc = coucheTraces(A)?.couleur;
    zone.style.setProperty("--trace-c", tc && COULEUR_SURE.test(tc) ? tc : "var(--md-primary)");
    poserHTML(R.querySelector(".zone"), `${svg}<div class="calque">${calque}</div>`);
    this._mbs = (c.meubles || []).map((m, i) => (estConnecte(m) ? { m, g: R.querySelector(`.zone svg [data-mb="${i}"]`), b: R.querySelector(`.calque>[data-mbq="${i}"]`) } : null)).filter((x) => x && (x.g || x.b));
    const deg = `linear-gradient(90deg,${PALIERS.map(([t, col]) => `${col} ${((t - 17) / 11 * 100).toFixed(0)}%`).join(",")})`;
    // légende : dégradé aux bornes de la teinte (`temperature_tint`), retiré sans teinte ; `legend: false` la cache
    const te = teinteTemp(c);
    poserHTML(R.querySelector(".legende"), `${te ? `<span>${fmt(te[0])} °C<span class="degrade" style="background:${deg}"></span>${fmt(te[1])} °C</span>` : ""}
        <span><i style="color:var(--plan-ferme)"></i>${_t("fermé")}</span><span><i style="color:var(--md-error)"></i>${_t("ouvert")}</span>
        ${(c.ouvertures || []).some((o) => o.volet) ? `<span><i style="color:var(--plan-volet);border-top-width:6px"></i>${_t("volet baissé")}</span>` : ""}`);
    const vide = !c.pieces.length && !(c.murs || []).length && !(c.points || []).length;
    R.querySelector(".tete").hidden = !this._editeur && (vide || !this._puces().length || (!!tab && !tab.resume));
    R.querySelector(".legende").hidden = !c.pieces.length || c.legende === false;
    let ev = R.querySelector(".etat-vide");
    if (vide) {
      const admin = !!this._hass?.user?.is_admin && c.edition !== false && !this._apercu();
      if (!ev) { ev = document.createElement("div"); ev.className = "etat-vide"; R.querySelector(".plan").append(ev); }
      poserHTML(ev, admin ? `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan est vide")}</h2>
          <p>${_t("Pars des pièces de Home Assistant (avec leurs appareils), dessine les pièces, ou importe un plan déjà fait.")}</p>
          <div class="actions"><button class="plein" data-depart="pieces"><ha-icon icon="mdi:home-import-outline"></ha-icon>${_t("Démarrer avec mes pièces")}</button>
            <button data-depart="rectangle"><ha-icon icon="mdi:rectangle-outline"></ha-icon>${_t("Dessiner une pièce")}</button>
            <button data-depart="importer"><ha-icon icon="mdi:file-import-outline"></ha-icon>${_t("Importer un plan")}</button></div>`
        : `<ha-icon icon="mdi:floor-plan"></ha-icon><h2>${_t("Le plan n'est pas encore dessiné")}</h2><p>${_t("Un administrateur peut le créer avec le bouton crayon de cette carte.")}</p>`);
    } else ev?.remove();
    R.querySelector(".editer").hidden = !!this._editeur || c.edition === false || !this._hass?.user?.is_admin || this._apercu();
    R.querySelector(".corps").classList.toggle("edition", !!this._editeur);
    this._ok = true;
    this._minuterie();
    this._change();
    this._maj();
    this._editeur?.apresConstruction();
    this._mise();
    this._reprise();
  }

  vue() { return this._vue || this._box; }

  // nouvelle vue (même proportions que le plan entier), bornée au plan ; null = plan entier
  _normaliser(v) {
    const B = this._box, r = B.W / B.H;
    let W = Math.min(B.W, Math.max(B.W / 8, v.W)), H = W / r;
    if (W >= B.W * 0.985) return null;
    const cx = v.x0 + v.W / 2, cy = v.y0 + v.H / 2;
    let x0 = cx - W / 2, y0 = cy - H / 2;
    x0 = Math.min(Math.max(x0, B.x0), B.x0 + B.W - W);
    y0 = Math.min(Math.max(y0, B.y0), B.y0 + B.H - H);
    return { x0, y0, W, H };
  }

  _cadrer(v, anim = false) {
    const cible = v && this._normaliser(v);
    const depart = this.vue(), fin = cible || this._box;
    cancelAnimationFrame(this._anim);
    const poser = (q) => {
      const R = this.shadowRoot, svg = R.querySelector(".zone svg");
      if (!svg || !(q.W > 0 && q.H > 0)) return;
      svg.setAttribute("viewBox", `${q.x0} ${q.y0} ${q.W} ${q.H}`);
      R.querySelectorAll(".calque>[data-x]").forEach((n) => {
        n.style.left = `${((n.dataset.x - q.x0) / q.W) * 100}%`;
        n.style.top = `${((n.dataset.y - q.y0) / q.H) * 100}%`;
      });
      this._tailleBadges(q);
    };
    const finir = () => {
      this._vue = cible;
      const R = this.shadowRoot;
      R.querySelector('[data-z="tout"]').hidden = !cible || this._figee();
      R.querySelector(".zone").classList.toggle("zoome", !!cible);
      if (this._editeur) this._construire(); else poser(fin);
    };
    if (!anim || this._niveauAnim() === "aucun" || matchMedia("(prefers-reduced-motion: reduce)").matches) { this._vue = cible; poser(fin); return finir(); }
    const t0 = performance.now(), D = 320, ease = (k) => 1 - Math.pow(1 - k, 3);
    const pas = (t) => {
      // l'horodatage de la 1re image peut précéder t0 : k < 0 extrapolerait au-delà du départ (largeur négative en dézoomant)
      const k = ease(Math.max(0, Math.min(1, (t - t0) / D)));
      poser({ x0: depart.x0 + (fin.x0 - depart.x0) * k, y0: depart.y0 + (fin.y0 - depart.y0) * k, W: depart.W + (fin.W - depart.W) * k, H: depart.H + (fin.H - depart.H) * k });
      if (k < 1) this._anim = requestAnimationFrame(pas); else finir();
    };
    this._anim = requestAnimationFrame(pas);
  }

  zoomer(f, centre) {
    const v = this.vue(), [cx, cy] = centre || [v.x0 + v.W / 2, v.y0 + v.H / 2];
    const W = v.W * f, H = v.H * f;
    this._cadrer({ x0: cx - (cx - v.x0) * f, y0: cy - (cy - v.y0) * f, W, H }, !centre);
  }

  toutVoir() {
    if (this._iso != null) { this._iso = null; this._construire(); }
    this._cadrer(null, true);
  }

  isoler(i) {
    // une sous-zone n'a pas de vue à elle : on isole la pièce qui la contient
    if (this._config.pieces[i]?.sous_zone) {
      const z = this._config.pieces[i].poly, c = [z.reduce((a, q) => a + q[0], 0) / z.length, z.reduce((a, q) => a + q[1], 0) / z.length];
      i = this._config.pieces.findIndex((p) => !p.sous_zone && dansPoly(c, p.poly));
      if (i < 0) return;
    }
    if (this._config.pieces[i]?.zoom === false) return;
    const poly = this._config.pieces[i].poly, B = this._box;
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const m = Math.max(x1 - x0, y1 - y0) * 0.14 + 40;
    let W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
    if (W / H > B.W / B.H) H = W * B.H / B.W; else W = H * B.W / B.H;
    const depart = this.vue();
    this._iso = i;
    this._vue = null;
    this._construire();
    this._vue = depart === this._box ? null : depart;
    this._cadrer({ x0: (x0 + x1) / 2 - W / 2, y0: (y0 + y1) / 2 - H / 2, W, H }, true);
  }

  _pxVersCm(cx, cy) {
    const r = this.shadowRoot.querySelector(".zone").getBoundingClientRect(), v = this.vue();
    return [v.x0 + ((cx - r.left) / r.width) * v.W, v.y0 + ((cy - r.top) / r.height) * v.H];
  }

  _gestes(zone) {
    // pincement (2 doigts) partout ; glisser d'un doigt / de la souris quand on est zoomé (hors édition)
    let pince = null, pan = null;
    const debutPince = (t) => {
      const [a, b] = t, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
      pince = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, m: this._pxVersCm(mx, my), v: { ...this.vue() } };
    };
    zone.addEventListener("touchstart", (e) => {
      if (this._figee()) { pince = pan = null; return; } // vue figée : ni pincement ni déplacement, le toucher reste un clic
      if (e.touches.length === 2) { debutPince(e.touches); pan = null; this._editeur?.annulerGlisse?.(); }
      else if (e.touches.length === 1 && this._vue && !this._editeur) pan = { x: e.touches[0].clientX, y: e.touches[0].clientY, v: { ...this._vue }, bouge: false };
    }, { passive: true });
    zone.addEventListener("touchmove", (e) => {
      const r = zone.getBoundingClientRect();
      if (pince && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const B = this._box, W = Math.min(B.W, Math.max(B.W / 8, pince.v.W * pince.d / d)), H = W * B.H / B.W;
        const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
        this._cadrer({ x0: pince.m[0] - ((mx - r.left) / r.width) * W, y0: pince.m[1] - ((my - r.top) / r.height) * H, W, H });
        this._aBouge = true;
      } else if (pan && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0], dx = t.clientX - pan.x, dy = t.clientY - pan.y;
        if (Math.hypot(dx, dy) > 6) pan.bouge = this._aBouge = true;
        this._cadrer({ ...pan.v, x0: pan.v.x0 - (dx / r.width) * pan.v.W, y0: pan.v.y0 - (dy / r.height) * pan.v.H });
      }
    }, { passive: false });
    const finTouche = (e) => {
      if (e.touches.length < 2) pince = null;
      if (!e.touches.length) { pan = null; setTimeout(() => { this._aBouge = false; }, 60); }
    };
    zone.addEventListener("touchend", finTouche);
    zone.addEventListener("touchcancel", finTouche);
    zone.addEventListener("wheel", (e) => {
      if (!e.ctrlKey || this._figee()) return; // pincement du pavé tactile ou Ctrl + molette (vue figée : rien)
      e.preventDefault();
      this.zoomer(Math.exp(e.deltaY * 0.01), this._pxVersCm(e.clientX, e.clientY));
    }, { passive: false });
    zone.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== (this._editeur ? 1 : 0) || !this._vue || this._figee()) return;
      if (!this._editeur && e.composedPath().some((n) => n.classList?.contains("pt") || n.classList?.contains("mb"))) return;
      this.debutPan(e);
    });
  }

  debutPan(e) {
    if (!this._vue) return;
    const zone = this.shadowRoot.querySelector(".zone"), r = zone.getBoundingClientRect(), v0 = { ...this._vue };
    zone.classList.add("panne");
    const mv = (m) => {
      const dx = m.clientX - e.clientX, dy = m.clientY - e.clientY;
      if (Math.hypot(dx, dy) > 4) this._aBouge = true;
      this._cadrer({ ...v0, x0: v0.x0 - (dx / r.width) * v0.W, y0: v0.y0 - (dy / r.height) * v0.H });
    };
    const up = () => {
      zone.classList.remove("panne");
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
      setTimeout(() => { this._aBouge = false; }, 60);
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  }

  _plusInfos(e) {
    if (this._sim) return; // démo : pas de fenêtre « plus d'infos » (entités simulées)
    if (!e) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId: e };
    this.dispatchEvent(ev);
  }

  _clicMeuble(i) {
    const m = this._config.meubles?.[i];
    if (!estConnecte(m)) return;
    const mode = clicMeuble(m);
    if (mode === "infos") return this._plusInfos(m.entite || m.valeur);
    if (mode === "fiche") this._ouvrirFiche("meuble", i);
  }

  // ouverture ou pastille : true si le clic est pris en charge (fiche, plus d'infos ou rien, réglés) ; false = comportement d'avant
  _clicPorteur(genre, i) {
    const o = this._config[GENRES_FICHE[genre]]?.[i], mode = clicPorteur(o);
    if (!mode) return false;
    if (mode === "fiche") this._ouvrirFiche(genre, i);
    else if (mode === "infos") this._plusInfos(this._enteteFiche(genre, o).infos);
    return true;
  }

  _ficheOuvrable(genre, o) { return genre === "meuble" ? estConnecte(o) : clicPorteur(o) === "fiche"; }

  // en-tête d'une fiche selon l'élément qui la porte : icône, titre, entité dont on montre l'état, interrupteur, couleur, « plus d'infos »
  _enteteFiche(genre, o) {
    if (genre === "meuble") return { icone: ICONES_MEUBLE[o.type] || "mdi:sofa-outline", titre: o.fiche?.titre || o.nom || _t(MEUBLES[o.type]?.nom || _tk("Meuble")), etat: o.entite || o.valeur, bascule: o.entite, couleur: o.couleur, infos: o.entite || o.valeur };
    if (genre === "ouverture") {
      const e = o.contact || o.entite;
      return { icone: (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[0], titre: o.fiche?.titre || o.baie || o.nom || (e || o.volet ? this._nom(e || o.volet) : _t(NOMS_OUVERTURE[o.type] || _tk("Ouverture"))), etat: e, bascule: e, infos: e || o.volet };
    }
    return { icone: o.icone || "mdi:circle", titre: o.fiche?.titre || o.nom || this._nom(o.entite) || _t("Appareil"), etat: o.entite, bascule: o.entite, couleur: o.couleur, infos: o.entite };
  }

  // fiche d'un meuble connecté, d'une ouverture ou d'une pastille : <dialog> modal (couche supérieure, Échap, focus contenu puis rendu),
  // feuille du bas au téléphone ; ses widgets passent par le moteur des panneaux ; services possibles : marche / arrêt de l'entité
  // de l'en-tête (domaines BASCULES, jamais l'arrêt si elle est protégée) et Ouvrir / Stop / Fermer des widgets `commande`
  _ouvrirFiche(genre, i) {
    if (typeof genre === "number") [genre, i] = ["meuble", genre];
    const R = this.shadowRoot, o = this._config[GENRES_FICHE[genre]]?.[i];
    if (!o) return;
    let d = R.querySelector("dialog.mf");
    if (!d) {
      d = document.createElement("dialog");
      d.className = "mf";
      d.setAttribute("aria-labelledby", "mf-titre");
      R.querySelector("ha-card").append(d);
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // les clics de la fiche ne passent jamais par ceux de la carte (interrupteurs des widgets…)
        if (ev.target === d) return d.close(); // fond
        const chemin = ev.composedPath(), a = chemin.find((n) => n.dataset?.mf)?.dataset.mf;
        if (a === "fermer") return d.close();
        if (a === "infos") { const x = this._mfObjet(), cible = x && this._cibleInfos(this._mf.genre, x); d.close(); return this._ouvrirInfos(cible); }
        if (a === "allumer") return this._basculerFiche(true);
        if (a) return;
        const cmd = chemin.find((n) => n.dataset?.cmd);
        if (cmd) return this._lancerCommande(cmd);
        const th = chemin.find((n) => n.dataset?.th);
        if (th) return this._reglerThermostat(th);
        const el = chemin.find((n) => n.dataset?.e);
        if (el) { d.close(); this._plusInfos(el.dataset.e); }
      });
      d.addEventListener("change", (ev) => { if (ev.target.dataset?.mf === "basculer") this._basculerFiche(ev.target.checked); });
      d.addEventListener("close", () => {
        if (d.open) return; // rouverte (autre élément) avant que l'événement de fermeture n'arrive
        const r = this._mf?.retour;
        this._mf = null;
        if (r?.isConnected) r.focus();
      });
    }
    const t = this._enteteFiche(genre, o), dom = (t.bascule || "").split(".")[0];
    const retour = { meuble: `.calque>[data-mbq="${i}"]`, point: `.calque>[data-q="${i}"]`, ouverture: `.zone svg [data-o="${i}"][tabindex]` }[genre];
    this._mf = { genre, i, retour: (retour && R.querySelector(retour)) || R.activeElement, html: null };
    const tc = genre === "meuble" ? couleurMeuble(o) : t.couleur;
    d.style.cssText = tc && COULEUR_SURE.test(tc) ? `--mb-couleur:${tc}` : "";
    poserHTML(d, `<div class="mf-in"><header><span class="ic"><ha-icon icon="${esc(t.icone)}"></ha-icon></span>
        <div class="n"><h2 id="mf-titre">${esc(t.titre)}</h2><small class="etat"></small></div>
        ${t.bascule && BASCULES.includes(dom) && !o.protege ? `<input type="checkbox" class="bascule" role="switch" data-mf="basculer" aria-label="${_t("Marche / arrêt")}">` : ""}
        ${(() => { const ci = this._cibleInfos(genre, o), lien = ci && /^(\/|https?:\/\/)/i.test(ci), lib = lien ? _t("Ouvrir : {cible}", { cible: ci }) : _t("Plus d'infos");
          return ci ? `<button class="ib" data-mf="infos" title="${esc(lib)}" aria-label="${esc(lib)}"><ha-icon icon="${lien ? "mdi:open-in-new" : "mdi:information-outline"}"></ha-icon></button>` : ""; })()}
        <button class="ib" data-mf="fermer" title="${_t("Fermer (Échap)")}" aria-label="${_t("Fermer")}"><ha-icon icon="mdi:close"></ha-icon></button></header>
      ${o.protege ? `<div class="mf-protege"><ha-icon icon="mdi:shield-lock-outline"></ha-icon><span>${_t("Appareil protégé : pas d'arrêt depuis le plan.")}</span><button class="cta" data-mf="allumer" hidden><ha-icon icon="mdi:power"></ha-icon>${_t("Rallumer")}</button></div>` : ""}
      <div class="mf-w"></div></div>`);
    this._majFiche();
    if (!d.open) d.showModal();
    d.querySelector("header [data-mf=fermer]").focus();
  }

  // bouton « Plus d'infos » d'une fiche (`card.more_info`) : par défaut l'entité de l'en-tête ; false = masqué ; une autre entité,
  // un chemin de tableau de bord (/…) ou une URL (http…)
  _cibleInfos(genre, o) {
    const v = o?.fiche?.plus_infos;
    if (v === false) return null;
    return typeof v === "string" && v ? v : this._enteteFiche(genre, o).infos || null;
  }
  _ouvrirInfos(cible) {
    if (!cible) return;
    if (/^https?:\/\//i.test(cible)) return LIEN_SUR.test(cible) ? window.open(cible, "_blank", "noopener,noreferrer") : undefined;
    if (cible.startsWith("/")) {
      if (!LIEN_SUR.test(cible)) return;
      history.pushState(null, "", cible);
      const ev = new Event("location-changed", { bubbles: true, composed: true });
      ev.detail = { replace: false };
      return window.dispatchEvent(ev);
    }
    this._plusInfos(cible);
  }

  // vantaux d'une même baie (`baie` identique), l'ouverture seule sinon
  _vantaux(o) { return o?.baie ? (this._config.ouvertures || []).filter((x) => x.baie === o.baie) : o ? [o] : []; }

  _mfObjet() { return this._mf ? this._config[GENRES_FICHE[this._mf.genre]]?.[this._mf.i] ?? null : null; }

  // marche / arrêt depuis la fiche : service explicite selon l'état voulu (pas de toggle), sur l'entité de l'en-tête seulement,
  // arrêt refusé si l'élément est protégé
  _basculerFiche(on) {
    const o = this._mfObjet(), e = o ? this._enteteFiche(this._mf.genre, o).bascule : null, dom = (e || "").split(".")[0];
    if (!o || !BASCULES.includes(dom) || (!on && o.protege)) return;
    // `confirm: true` de l'élément : confirmation même pour ce service sûr ; annulé ou en échec, l'interrupteur revient à l'état réel
    const remettre = () => this._majFiche();
    this._appeler(dom, on ? "turn_on" : "turn_off", { entity_id: e }, undefined, { forcer: o.confirmer === true, libelle: on ? _t("Allumer") : _t("Éteindre") }).then((fait) => { if (!fait) remettre(); }, remettre);
  }
  _basculerMeuble(on) { return this._basculerFiche(on); } // nom d'origine (fiches des meubles)

  // mise à jour en direct de la fiche ouverte : en-tête modifié sur place (le focus reste), widgets réécrits seulement s'ils changent
  _majFiche() {
    const d = this.shadowRoot?.querySelector("dialog.mf"), o = this._mfObjet();
    if (!d || !o) return;
    const genre = this._mf.genre, t = this._enteteFiche(genre, o), s = this._etat(t.etat), on = s?.state === "on", ic = d.querySelector("header .ic");
    let v = "", actif = false, ouvert = false;
    let se = s;
    if (genre === "ouverture") {
      // baie à plusieurs vantaux : ouverte dès qu'un vantail l'est, état d'en-tête = le vantail ouvert (sinon le premier)
      const vs = this._vantaux(o).map((x) => this._etat(x.contact || x.entite)).filter(Boolean);
      se = vs.find((x) => ["on", "open"].includes(x.state)) || s;
      ouvert = !!se && ["on", "open"].includes(se.state);
      const sv = this._etat(o.volet), pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      if (sv) v = _t("volet {n} %", { n: pos });
      ic.querySelector("ha-icon").setAttribute("icon", (ICONES_OUVERTURE[o.type] || ICONES_OUVERTURE.porte)[ouvert ? 1 : 0]);
    } else {
      v = this._texteValeur(o);
      actif = !!s && this._actif(genre === "meuble" ? { ...o, actif: o.actif || o.entite || o.valeur } : o);
    }
    d.querySelector(".etat").textContent = [se ? this._hass.formatEntityState?.(se) ?? se.state : t.etat ? _t("indisponible") : "", v].filter(Boolean).join(" · ");
    ic.classList.toggle("on", actif);
    ic.classList.toggle("clair", actif && genre === "point" && !!(o.clair ?? clairPour(o.couleur)));
    ic.classList.toggle("alerte", ouvert);
    const b = d.querySelector('[data-mf="basculer"]');
    if (b) { b.checked = on; b.disabled = !s || s.state === "unavailable"; }
    const r = d.querySelector('[data-mf="allumer"]');
    if (r) r.hidden = !(s && s.state === "off" && BASCULES.includes((t.bascule || "").split(".")[0]));
    const l = o.fiche?.widgets || [];
    // PC : la fiche s'élargit avec le nombre de widgets (1, 2, 3 colonnes) plutôt que de défiler
    const n = l.filter((w) => w?.type !== "separateur").length;
    d.classList.toggle("l2", n === 2); d.classList.toggle("l3", n >= 3);
    this._sansBascule = true;
    let html;
    try { html = l.map((w, j) => { try { return this._widget(w, "mf", j); } catch (e) { return `<div class="w"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }).join(""); } finally { this._sansBascule = false; }
    if (!l.length) html = `<div class="w-note">${t.etat ? "" : _t("Aucun widget dans cette fiche.")}</div>`;
    if (html !== this._mf.html) { poserHTML(d.querySelector(".mf-w"), html); this._mf.html = html; }
  }

  _fiche() {
    const R = this.shadowRoot, f = R.querySelector(".fiche"), c = this._config;
    const iso = this._iso != null && !this._editeur ? c.pieces[this._iso] : null;
    f.hidden = !iso;
    if (!iso) { poserHTML(f, ""); return; }
    const t = this._num(iso.temperature, iso.attribut_temperature), h = this._num(iso.humidite, iso.attribut_humidite);
    const etat = (s) => (s ? this._hass.formatEntityState?.(s) ?? s.state : _t("indisponible"));
    // pastilles de la pièce (une pastille masquée, `hidden: true`, n'y figure pas) ; état actif et valeur lus de la config, pas du plan
    const lignes = (c.points || []).filter((p) => !p.masque && dansPoly(p.pos, iso.poly)).map((p) => {
      const s = this._etat(p.entite), on = this._actif(p), dom = (p.entite || "").split(".")[0];
      const v = this._texteValeur(p);
      return `<div class="ligne" data-e="${esc(p.entite)}"${clicPorteur(p) ? ` data-fq="${c.points.indexOf(p)}"` : ""} role="button"><span class="ic${on ? " on" : ""}${on && (p.clair ?? clairPour(p.couleur)) ? " clair" : ""}" style="--pt-couleur:${couleurSure(p.couleur) || "var(--md-primary)"}"><ha-icon icon="${esc(p.icone || "mdi:circle")}"></ha-icon></span>
        <span class="n"><span>${esc(p.nom || this._nom(p.entite))}</span><small>${esc(v ? `${v} · ${etat(s)}` : etat(s))}</small></span>
        ${BASCULES.includes(dom) && s ? this._interrupteur(p.entite, s, p) : ""}</div>`;
    });
    const ouv = (c.ouvertures || []).filter((o) => !o.masque && (o.contact || o.entite || o.volet) && distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], iso.poly) < 20)
      .filter((o, k, l) => !o.baie || l.findIndex((x) => x.baie === o.baie) === k).map((o) => { // une ligne par baie
      const ent = o.contact || o.entite, sv = this._etat(o.volet);
      const ss = this._vantaux(o).map((x) => this._etat(x.contact || x.entite)).filter(Boolean);
      const s = ss.find((x) => ["on", "open"].includes(x.state)) || this._etat(ent);
      const ouvert = s && ["on", "open"].includes(s.state);
      const pos = sv ? sv.attributes.current_position ?? (sv.state === "closed" ? 0 : 100) : null;
      const txt = [ent ? (ouvert ? _t("Ouverte") : s ? _t("Fermée") : _t("indisponible")) : "", sv ? _t("volet {n} %", { n: pos }) : ""].filter(Boolean).join(" · ");
      const ic = o.type === "fenetre" ? (ouvert ? "mdi:window-open-variant" : "mdi:window-closed-variant") : o.type === "portail" ? "mdi:garage-variant" : (ouvert ? "mdi:door-open" : "mdi:door-closed");
      return `<div class="ligne" data-e="${esc(ent || o.volet)}"${clicPorteur(o) ? ` data-fo="${c.ouvertures.indexOf(o)}"` : ""} role="button"><span class="ic${ouvert ? " alerte" : ""}"><ha-icon icon="${ic}"></ha-icon></span>
        <span class="n"><span>${esc(o.baie || o.nom || this._nom(ent || o.volet))}</span><small>${esc(txt)}</small></span></div>`;
    });
    const { boutons, automations } = this._actionsPiece(this._iso);
    const autos = automations.map((a) => {
      const s = this._etat(a);
      const script = a.startsWith("script.");
      return `<div class="ligne" data-e="${esc(a)}" role="button"><span class="ic${!script && s?.state === "on" ? " on" : ""}" style="--pt-couleur:var(--md-primary)"><ha-icon icon="${script ? "mdi:script-text-outline" : "mdi:robot-outline"}"></ha-icon></span>
        <span class="n"><span class="deux">${esc(s?.attributes.friendly_name || a)}</span><small>${script ? _t("Script · ") : ""}${esc(ilya(s?.attributes.last_triggered))}</small></span>
        ${s && !script ? `<input type="checkbox" class="bascule" data-b="${esc(a)}" ${s.state === "on" ? "checked" : ""} aria-label="${_t("Activer")}">` : ""}</div>`;
    });
    poserHTML(f, `<header><b>${esc(iso.nom)}</b><span>${[t != null ? `${fmt(t)} °C` : "", h != null ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · ")}</span></header>
      ${boutons.length ? `<div class="actions">${boutons.map((b, k) => `<button class="cta${b.plein ? " plein" : ""}" data-cta="${k}"${b.titre ? ` title="${esc(b.titre)}" aria-label="${esc(b.titre)}"` : ""}><ha-icon icon="${esc(b.icone || "mdi:gesture-tap")}"></ha-icon>${esc(b.nom)}</button>`).join("")}</div>` : ""}
      ${lignes.length ? `<h4>${_t("Appareils")}</h4>${lignes.join("")}` : ""}${ouv.length ? `<h4>${_t("Ouvertures")}</h4>${ouv.join("")}` : ""}
      ${autos.length ? `<h4>${_t("Automatisations")}</h4>${autos.join("")}` : ""}
      ${!lignes.length && !ouv.length && !boutons.length ? `<div class="vide">${_t("Aucun appareil placé dans cette pièce.")}</div>` : ""}`);
    this._boutons = boutons;
    this._ajusterCols();
  }

  // pleine page : un panneau trop haut est réduit (zoom CSS) pour tenir
  // (réduction plafonnée à 85 % pour rester lisible, au-delà défilement sans barre ; même échelle pour les deux colonnes)
  _ajusterCols() {
    const R = this.shadowRoot, plein = R?.querySelector("ha-card")?.classList.contains("plein");
    const cols = [...(R?.querySelectorAll(".col") || [])];
    cols.forEach((col) => { col.querySelector(".col-in").style.zoom = ""; });
    if (!plein || this._modeMise === "etroit") return;
    const vis = cols.filter((c) => !c.hidden);
    let z = 1;
    for (const col of vis) {
      const h = col.querySelector(".col-in").getBoundingClientRect().height / (this._zVue || 1);
      if (h > col.clientHeight + 1) z = Math.min(z, col.clientHeight / h);
    }
    z = Math.max(0.85, z);
    if (z < 1) vis.forEach((col) => { col.querySelector(".col-in").style.zoom = String(z); });
    const fondu = (col) => col.classList.toggle("suite", col.scrollTop + col.clientHeight < col.scrollHeight - 2);
    vis.forEach((col) => { fondu(col); col.onscroll ||= () => fondu(col); });
  }

  // panneaux affichés : ceux de la pièce isolée (ou sélectionnée dans l'éditeur), sinon ceux de la maison
  _panneauxCourants() {
    const c = this._config, s = this._editeur?.sel;
    let pi = this._iso;
    if (this._editeur) {
      // meuble connecté, ouverture ou pastille sélectionné (ou un widget de sa fiche) : la colonne de droite montre sa fiche, en vrai rendu
      const seul = this._editeur.multi.size <= 1;
      const pf = s?.type === "widget" && s.cote === "fiche" ? porteurDe(s)
        : seul && (s?.type === "meuble" ? estConnecte(c.meubles?.[s.i]) : s?.type === "ouverture" || s?.type === "point") ? { genre: s.type, i: s.i } : null;
      const o = pf && c[GENRES_FICHE[pf.genre]]?.[pf.i];
      if (o) return { P: { droite: o.fiche?.widgets || [] }, pi: null, pf };
      pi = s?.type === "piece" && this._editeur.multi.size <= 1 ? s.i : s?.type === "widget" && s.piece != null ? s.piece : null;
    }
    // mode tablette sans panneaux : ni ceux de la maison ni ceux des pièces (la fiche de la pièce reste)
    if (this._tablette() && !this._tablette().panneaux) return { P: {}, pi: pi != null && c.pieces[pi] ? pi : null };
    if (pi != null && c.pieces[pi]) return { P: c.pieces[pi].panneaux || {}, pi };
    return { P: c.panneaux || {}, pi: null };
  }

  _widgets() {
    const R = this.shadowRoot;
    if (!R || !this._hass) return;
    const { P, pi, pf } = this._panneauxCourants(), g = P.gauche || [], d = P.droite || [];
    const suf = pi != null ? `:${pi}` : pf ? sufFiche(pf) : "";
    const ajout = (cote) => (this._editeur ? `<button class="w-ajout" data-ajouter="${cote}"><ha-icon icon="mdi:plus"></ha-icon>${cote === "fiche" ? _t("Ajouter un widget à la fiche") : this._modeMise === "large" ? _t("Ajouter un widget") : cote === "gauche" ? _t("Ajouter un widget (gauche)") : _t("Ajouter un widget (droite)")}</button>` : "");
    const rendu = (l, cote) => {
      this._sansBascule = cote === "fiche"; // aperçu fidèle : pas d'interrupteur dans une fiche
      try { return l.map((w, i) => { try { return this._widget(w, cote, i, suf); } catch (e) { return `<div class="w" data-w="${cote}:${i}${suf}"><div class="w-note">${_t("Widget en erreur : {msg}", { msg: esc(e.message) })}</div></div>`; } }).join(""); }
      finally { this._sansBascule = false; }
    };
    const es = this._editeur?.sel, sel = es?.type === "widget" ? `${es.cote}:${es.i}${es.piece != null ? `:${es.piece}` : porteurDe(es) ? sufFiche(porteurDe(es)) : ""}` : null;
    let change = false;
    const poser = (el, html) => { if (el._html !== html) { poserHTML(el, html); el._html = html; change = true; } };
    if (pf) {
      const t = this._enteteFiche(pf.genre, this._config[GENRES_FICHE[pf.genre]][pf.i]).titre;
      const note = { meuble: _t("Fiche « {t} » : ce qui s'ouvre au toucher du meuble", { t: esc(t) }), ouverture: _t("Fiche « {t} » : ce qui s'ouvre au toucher de l'ouverture", { t: esc(t) }),
        point: _t("Fiche « {t} » : ce qui s'ouvre au toucher de la pastille", { t: esc(t) }) }[pf.genre];
      poser(R.querySelector(".col-g .widgets"), "");
      poser(R.querySelector(".col-d .widgets"), `<div class="w-note w-fiche"><ha-icon icon="mdi:card-text-outline"></ha-icon>${note}</div>${rendu(d, "fiche")}${ajout("fiche")}`);
    } else if (this._modeMise === "large") { poser(R.querySelector(".col-g .widgets"), rendu(g, "gauche") + ajout("gauche")); poser(R.querySelector(".col-d .widgets"), rendu(d, "droite") + ajout("droite")); }
    else { poser(R.querySelector(".col-g .widgets"), ""); poser(R.querySelector(".col-d .widgets"), rendu(g, "gauche") + ajout("gauche") + rendu(d, "droite") + ajout("droite")); }
    if (change) this._ajusterCols();
    R.querySelectorAll(".w.sel").forEach((n) => n.classList.remove("sel"));
    if (sel) R.querySelector(`.w[data-w="${sel}"]`)?.classList.add("sel");
    this._majFiche();
  }

  _val(e, dec, unite) {
    const s = this._etat(e);
    if (!s) return { t: "—", u: "" };
    const n = parseFloat(s.state);
    if (isNaN(n)) return { t: this._hass.formatEntityState?.(s) ?? s.state, u: "" };
    return { t: fmt(n, dec ?? (Math.abs(n) >= 100 ? 0 : 1)), u: unite ?? s.attributes.unit_of_measurement ?? "" };
  }

  _tete(w, defIcone, droite = "") {
    return `<div class="w-tete"><ha-icon icon="${esc(w.icone || defIcone)}"></ha-icon><span>${esc(w.titre || "")}</span>${droite ? `<span class="d">${droite}</span>` : ""}</div>`;
  }

  // interrupteur marche / arrêt (vue de la pièce, lignes des widgets) : `protected` (o.protege) = pas d'arrêt depuis le plan
  // (grisé tant que l'appareil est allumé), `confirm: true` (o.confirmer) = confirmation avant chaque appel
  _interrupteur(e, s, o = {}) {
    const on = s.state === "on", prot = o?.protege === true;
    return `<input type="checkbox" class="bascule" data-b="${esc(e)}"${prot ? ` data-p="1"` : ""}${o?.confirmer === true ? ` data-cf="1"` : ""} ${on ? "checked" : ""}${prot && on ? ` disabled title="${_t("Appareil protégé : pas d'arrêt depuis le plan.")}"` : ""} aria-label="${_t("Basculer")}">`;
  }
  // appui sur un interrupteur : bascule (allumage seul si protégé) ; annulé ou en échec, l'interrupteur revient à sa position
  _basculer(bas) {
    const e = bas.dataset.b, voulu = bas.checked, prot = bas.dataset.p === "1";
    if (this._editeur || !e) return;
    if (bas.disabled || (prot && !voulu)) { bas.checked = !voulu; return; }
    const remettre = () => { if (bas.isConnected) bas.checked = !voulu; };
    this._appeler("homeassistant", prot ? "turn_on" : "toggle", { entity_id: e }, undefined, { forcer: bas.dataset.cf === "1", libelle: bas.getAttribute("aria-label") || "" })
      .then((fait) => { if (!fait) remettre(); }, remettre);
  }

  // lignes d'un widget ; `confirm: true` du widget (w) : ses interrupteurs et ses boutons « Activer » demandent confirmation
  _lignes(liste, w = {}) {
    const cf = w?.confirmer === true ? ` data-cf="1"` : "";
    return `<div class="w-lignes">${(liste || []).map((l) => {
      const o = typeof l === "string" ? { entite: l } : l, s = this._etat(o.entite), v = this._val(o.entite, o.decimales, o.unite);
      const dom = (o.entite || "").split(".")[0];
      return `<div class="w-ligne" data-e="${esc(o.entite)}"><ha-icon icon="${esc(o.icone || s?.attributes.icon || "mdi:circle-small")}"></ha-icon><span class="n">${esc(o.nom || s?.attributes.friendly_name || o.entite)}</span>
        ${BASCULES.includes(dom) && s && !this._sansBascule ? this._interrupteur(o.entite, s, w)
          : Object.hasOwn(ACTIVABLES, dom) && s && !this._sansBascule ? `<button class="w-activer" data-active="${esc(o.entite)}"${cf}${s.state === "unavailable" ? ` aria-disabled="true"` : ""}>${_t("Activer##lancer")}</button>`
          : `<span class="v${enAlarme(o.entite, s) ? " alerte" : ""}">${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}</span>`}</div>`;
    }).join("")}</div>`;
  }

  _widget(w, cote, i, suf = "") {
    const id = `${cote}:${i}${suf}`, coul = couleurSure(w.couleur) ? `--w-couleur:${w.couleur}` : "";
    const ouvre = (inner) => `<div class="w" data-w="${id}" style="${coul}">${inner}</div>`;
    if (w.type === "separateur") return `<div class="w w-sep${w.titre ? "" : " vide"}" data-w="${id}"${w.espace ? ` style="margin:${+w.espace}px 0"` : ""}>${esc(w.titre || "")}</div>`;
    if (w.type === "tuile") {
      const v = this._val(w.entite, w.decimales, w.unite);
      const h = w.historique ? this._histo(w.entite, w.historique) : null;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:gauge")}<div class="w-grand${enAlarme(w.entite, this._etat(w.entite)) ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(v.t)}<small>${esc(v.u)}</small></div>
        ${h ? this._courbe(h) : ""}${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "jauge") {
      const n = this._num(w.entite), mn = +(w.min ?? 0), mx = +(w.max ?? 100), k = n == null ? 0 : Math.max(0, Math.min(1, (n - mn) / (mx - mn || 1)));
      const v = this._val(w.entite, w.decimales, w.unite);
      const col = (w.seuils && typeof w.seuils === "object" && n != null && couleurSeuils(w.seuils, n)) || couleurSure(w.couleur) || (k < 0.6 ? "#188038" : k < 0.85 ? "#e8710a" : "#d93025");
      const L = 0.75 * 2 * Math.PI * 80;
      return ouvre(`${this._tete({ ...w, titre: w.titre || (w.entite ? this._nom(w.entite) : "") }, "mdi:speedometer")}<div class="w-jauge" data-e="${esc(w.entite)}"><svg viewBox="0 0 200 200"><g transform="rotate(135 100 100)">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--md-outline-variant)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L} 999"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="${esc(col)}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(L * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></g></svg>
        <div class="val">${esc(v.t)}<small>${esc(v.u)}${w.max ? ` · ${fmt(k * 100, 0)}${globalThis.MaquetteI18n.pct()}` : ""}</small></div></div>
        <div class="w-bornes"><span>${fmt(mn, 3)}</span><span>${fmt(mx, 3)}</span></div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "entites") return ouvre(`${this._tete(w, "mdi:format-list-bulleted")}${this._lignes(w.entites, w)}`);
    if (w.type === "tarif") {
      const s = this._etat(w.prix), n = this._num(w.prix), sp = this._etat(w.periode), per = sp?.state || "";
      // période indisponible ou inconnue : pastille neutre (ni heures pleines ni heures creuses)
      const perIndispo = ["unavailable", "unknown"].includes(per), creuse = /creuse|off.?peak/i.test(per);
      // couleurs Tempo telles que HA les donne : en français (Bleu…) ou en anglais (Blue…)
      const tempo = { bleu: ["#1a73e8", "#fff"], blanc: ["#f1f3f4", "#202124"], rouge: ["#d93025", "#fff"] };
      Object.assign(tempo, { blue: tempo.bleu, white: tempo.blanc, red: tempo.rouge });
      const pastille = (nom, e) => {
        const st = this._etat(e)?.state || "", c = tempo[st.toLowerCase()];
        return e ? `<span class="pastille${c ? " forte" : ""}" data-e="${esc(e)}" style="${c ? `--p-couleur:${c[0]};--p-texte:${c[1]}` : ""}">${_t("{nom} : {etat}", { nom: esc(nom), etat: esc(st || "—") })}</span>` : "";
      };
      return ouvre(`${this._tete(w, "mdi:cash-clock")}<div class="w-grand" data-e="${esc(w.prix)}">${n != null ? fmt(n, 4) : "—"}<small>${esc(s?.attributes.unit_of_measurement || "€/kWh")}</small></div>
        <div class="pastilles">${per ? `<span class="pastille${perIndispo ? "" : " forte"}" data-e="${esc(w.periode)}"${perIndispo ? "" : ` style="--p-couleur:${creuse ? "#188038" : "#e8710a"}"`}>${esc(perIndispo ? this._hass.formatEntityState?.(sp) ?? _t("Indisponible") : per)}</span>` : ""}
        ${pastille(_t("Aujourd'hui"), w.couleur_jour)}${pastille(_t("Demain"), w.couleur_demain)}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`);
    }
    if (w.type === "ve") {
      // puissance ramenée en W selon l'unité de l'entité (W, kW, MW) ; le seuil `threshold` est en W
      const pu = String(this._etat(w.puissance)?.attributes.unit_of_measurement || "W").trim(), kp = /^kW$/i.test(pu) ? 1000 : /^MW$/.test(pu) ? 1e6 : 1;
      const bat = this._num(w.batterie), pw0 = this._num(w.puissance), pw = pw0 == null ? null : pw0 * kp, charge = pw != null && pw > nb(w.seuil ?? 50, 50);
      const br = this._etat(w.branche), branche = br ? ["on", "plugged", "connected", "true"].includes(br.state.toLowerCase()) : null;
      const etat = charge ? _t("En charge · {p} {u}", { p: fmt(pw / (pw >= 1000 ? 1000 : 1), pw >= 1000 ? 2 : 0), u: pw >= 1000 ? "kW" : "W" }) : branche === true ? _t("Branchée") : branche === false ? _t("Débranchée") : _t("À l'arrêt");
      const C = 2 * Math.PI * 42, k = bat == null ? 0 : Math.max(0, Math.min(1, bat / 100));
      const col = charge ? "#188038" : bat != null && bat < 20 ? "#d93025" : "var(--md-primary)";
      const lignes = [w.autonomie && { entite: w.autonomie, icone: "mdi:map-marker-distance", nom: _t("Autonomie") }, w.session_kwh && { entite: w.session_kwh, icone: "mdi:lightning-bolt", nom: _t("Session"), decimales: 1 },
        w.session_cout && { entite: w.session_cout, icone: "mdi:currency-eur", nom: _t("Coût de la session"), decimales: 2 }, ...(w.lignes || [])].filter(Boolean);
      return ouvre(`${this._tete(w, "mdi:car-electric")}<div class="w-ve">
        <div class="anneau" data-e="${esc(w.batterie || w.puissance || "")}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-outline-variant)" stroke-width="10"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * k).toFixed(1)} 999" style="transition:stroke-dasharray .6s"/></svg>
          <b>${bat != null ? `${fmt(bat, 0)}${globalThis.MaquetteI18n.pct()}` : `<ha-icon icon="mdi:${charge ? "battery-charging" : "car-electric-outline"}"></ha-icon>`}</b></div>
        <div class="etat"><span class="pastille forte" style="--p-couleur:${charge ? "#188038" : branche ? "#1a73e8" : "var(--md-surface-container-high)"};--p-texte:${charge || branche ? "#fff" : "var(--md-on-surface)"}" data-e="${esc(w.puissance || w.branche || "")}">${esc(etat)}</span>
          ${bat == null && !w.batterie ? `<span class="w-note">${_t("Batterie non configurée.")}</span>` : ""}</div></div>
        ${lignes.length ? this._lignes(lignes, w) : ""}`);
    }
    if (w.type === "periodes") {
      const per = w.periodes || ["jour", "semaine", "mois", "annee"];
      const NOMS = { jour: _t("Aujourd'hui"), semaine: _t("Semaine"), mois: _t("Mois"), annee: _t("Année") }, CAL = { jour: "day", semaine: "week", mois: "month", annee: "year" };
      const cols = w.colonnes || [];
      const cell = (c, p) => {
        let v = null, e = null;
        if (c.stat) { v = this._stat(c.stat, CAL[p]); e = c.stat; if (v != null) v *= nb(c.facteur ?? 1, 1); }
        else if (c[p]) { e = c[p]; v = this._num(e); if (v != null) v *= nb(c.facteur ?? 1, 1); }
        return `<td${e ? ` class="e" data-e="${esc(e)}"` : ""}>${v == null ? `<span class="vide">—</span>` : esc(fmt(v, c.decimales ?? 2))}</td>`;
      };
      return ouvre(`${this._tete(w, "mdi:table-clock")}<table class="w-table"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c.nom || "")}${c.unite ? `<br>${esc(c.unite)}` : ""}</th>`).join("")}</tr></thead>
        <tbody>${per.map((p) => `<tr><td>${esc(NOMS[p] || p)}</td>${cols.map((c) => cell(c, p)).join("")}</tr>`).join("")}</tbody></table>${w.note ? `<div class="w-note">${esc(w.note)}</div>` : ""}`);
    }
    if (w.type === "climat") return ouvre(this._climat(w));
    if (w.type === "thermostat") return ouvre(this._wThermostat(w, id));
    if (w.type === "commande") return ouvre(this._wCommande(w, id));
    if (w.type === "serrure") return ouvre(this._wSerrure(w, id));
    return ouvre(`${this._tete(w, "mdi:help-circle-outline")}<div class="w-note">${_t("Type de widget inconnu : {type}", { type: esc(w.type) })}</div>`);
  }

  // climat des pièces : température et humidité de chaque pièce, tendance sur `duree` minutes (historique HA),
  // alerte si la variation est trop forte (ou hors des bornes absolues, si elles sont réglées)
  _climat(w) {
    // écart signé, arrondi à l'affichage : « ±0 » quand l'arrondi est nul (jamais « +0° » ni « −0 % »)
    const ecart = (d, genre) => { if (d == null) return ""; const k = genre === "t" ? 10 : 1, r = Math.round(d * k) / k; return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${fmt(Math.abs(r), genre === "t" ? 1 : 0)}${genre === "t" ? "°" : globalThis.MaquetteI18n.pct()}`; };
    const duree = Math.max(5, Math.min(240, nb(w.duree, 30))), choix = Array.isArray(w.pieces) && w.pieces.length ? w.pieces : null, vus = new Set();
    const pieces = this._config.pieces.filter((p) => !p.sous_zone && (p.temperature || p.humidite) && (choix ? choix.includes(p.nom) : w.dehors !== false || !p.dehors))
      .filter((p) => { const k = `${p.temperature}|${p.attribut_temperature}|${p.humidite}|${p.attribut_humidite}`; if (vus.has(k)) return false; vus.add(k); return true; }); // même capteur = une ligne
    let alertes = 0;
    const mesure = (e, attr, genre) => {
      const v = this._num(e, attr);
      if (v == null) return `<span class="m vide">—</span>`;
      const stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2), seuil = nb(genre === "t" ? w.alerte_t : w.alerte_h, genre === "t" ? 1.5 : 10);
      const h = attr ? null : this._histo(e, duree / 60), depart = h?.pts?.length ? h.pts[0][1] : null, d = depart == null ? null : v - depart;
      const bas = nb(genre === "t" ? w.t_min : w.h_min, -Infinity), haut = nb(genre === "t" ? w.t_max : w.h_max, Infinity);
      const fort = (d != null && Math.abs(d) >= seuil) || v < bas || v > haut;
      if (fort) alertes++;
      const sens = d == null ? "" : d > stable ? "monte" : d < -stable ? "descend" : "stable";
      const ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
      const unite = genre === "t" ? " °C" : globalThis.MaquetteI18n.pct(), dt = ecart(d, genre);
      const titre = `${sens ? _t("{sens} sur {n} min ({ecart})", { sens: { monte: _t("En hausse"), descend: _t("En baisse"), stable: _t("Stable") }[sens], n: duree, ecart: dt }) : _t("Tendance indisponible")}${fort ? _t(" · variation forte") : ""}`;
      return `<span class="m ${sens}${fort ? " alerte" : ""}" data-e="${esc(e)}" title="${esc(titre)}">${esc(fmt(v, genre === "t" ? 1 : 0))}${unite}${ic ? `<ha-icon icon="${fort ? "mdi:alert" : ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
    };
    let lignes = pieces.map((p) => `<span class="n">${esc(p.nom)}</span>${p.temperature ? mesure(p.temperature, p.attribut_temperature, "t") : "<span></span>"}${p.humidite ? mesure(p.humidite, p.attribut_humidite, "h") : "<span></span>"}`).join("");
    if (w.moyenne) {
      // moyenne des pièces intérieures : valeur moyenne et écart moyen sur la durée (pièces dont la tendance est connue)
      const moy = (genre) => {
        const v = [], d = [];
        for (const p of pieces) {
          const e = genre === "t" ? p.temperature : p.humidite, at = genre === "t" ? p.attribut_temperature : p.attribut_humidite;
          if (p.dehors || !e) continue;
          const x = this._num(e, at); if (x == null) continue; v.push(x);
          const h = at ? null : this._histo(e, duree / 60); if (h?.pts?.length) d.push(x - h.pts[0][1]);
        }
        if (!v.length) return `<span class="m vide">—</span>`;
        const m = v.reduce((s, x) => s + x, 0) / v.length, dm = d.length ? d.reduce((s, x) => s + x, 0) / d.length : null, stable = nb(genre === "t" ? w.stable_t : w.stable_h, genre === "t" ? 0.3 : 2);
        const sens = dm == null ? "" : dm > stable ? "monte" : dm < -stable ? "descend" : "stable", ic = { monte: "mdi:trending-up", descend: "mdi:trending-down", stable: "mdi:trending-neutral" }[sens];
        const dt = ecart(dm, genre);
        return `<span class="m ${sens}">${esc(fmt(m, genre === "t" ? 1 : 0))}${genre === "t" ? " °C" : globalThis.MaquetteI18n.pct()}${ic ? `<ha-icon icon="${ic}"></ha-icon>` : ""}${dt ? `<small>${esc(dt)}</small>` : ""}</span>`;
      };
      lignes = `<span class="n moy">${_t("Moyenne intérieure")}</span>${moy("t")}${moy("h")}` + lignes;
    }
    return `${this._tete(w, "mdi:home-thermometer-outline", alertes ? `<span class="w-alerte"><ha-icon icon="mdi:alert"></ha-icon>${alertes}</span>` : `${duree} min`)}
      ${pieces.length ? `<div class="w-climat">${lignes}</div>` : `<div class="w-note">${_t("Aucune pièce n'a de capteur de température ou d'humidité.")}</div>`}`;
  }

  // thermostat (climate) : température mesurée, consigne réglable (−/+ au pas de l'appareil, entre ses bornes), action en cours, mode
  _wThermostat(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:thermostat")}<div class="w-note">${_t("Choisis le thermostat (entité climate).")}</div>`;
    const s = this._etat(w.entite), a = s?.attributes || {}, indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const cons = nb(a.temperature, NaN), mes = nb(a.current_temperature, NaN), pas = nb(a.target_temp_step, 0.5) || 0.5;
    const ACTION = { heating: [_t("Chauffe"), "#e8710a"], cooling: [_t("Refroidit"), "#1a73e8"], idle: [_t("Au repos"), ""], off: [_t("Arrêté"), ""], drying: [_t("Déshumidifie"), ""], fan: [_t("Ventile"), ""] };
    const [act, coul] = ACTION[a.hvac_action] || [a.hvac_action || "", ""];
    const bouton = (k, ic, nom) => `<button class="ib th-b" data-th="${k}"${indispo || isNaN(cons) ? ` aria-disabled="true"` : ""} aria-label="${nom}" title="${nom}"><ha-icon icon="${ic}"></ha-icon></button>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, "mdi:thermostat", act ? `<span class="pastille forte" style="--p-couleur:${coul || "var(--md-surface-container-high)"};--p-texte:${coul ? "#fff" : "var(--md-on-surface)"}">${esc(act)}</span>` : "")}
      <div class="w-th" data-te="${esc(w.entite)}" data-ti="${esc(id)}"${w.confirmer === true ? ` data-cf="1"` : ""}>
        <div class="mes" data-e="${esc(w.entite)}"><small>${_t("Mesurée")}</small><b>${isNaN(mes) ? "—" : esc(fmt(mes, 1))}<small> °C</small></b></div>
        <div class="cons">${bouton("moins", "mdi:minus", _t("Baisser la consigne"))}<div><small>${_t("Consigne")}</small><b>${isNaN(cons) ? "—" : esc(fmt(cons, pas < 1 ? 1 : 0))}<small> °C</small></b></div>${bouton("plus", "mdi:plus", _t("Monter la consigne"))}</div>
        <div class="mode"><small>${esc(indispo ? _t("Indisponible") : [this._hass.formatEntityState?.(s) ?? s.state, a.preset_mode && a.preset_mode !== "none" ? a.preset_mode : ""].filter(Boolean).join(" · "))}</small></div>
      </div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // −/+ de la consigne : climate.set_temperature sur le thermostat du widget (présent dans la config), bornée par l'appareil
  _reglerThermostat(btn) {
    const box = btn.closest(".w-th"), e = box?.dataset.te, s = this._etat(e);
    if (this._editeur || !e?.startsWith("climate.") || !s || btn.getAttribute("aria-disabled") === "true") return;
    const c = this._config, ok = new Set(), voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => { if (w?.type === "thermostat" && typeof w.entite === "string") ok.add(w.entite); });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    if (!ok.has(e)) return;
    const a = s.attributes, pas = nb(a.target_temp_step, 0.5) || 0.5, cons = nb(a.temperature, NaN);
    if (isNaN(cons)) return;
    const v = Math.max(nb(a.min_temp, 5), Math.min(nb(a.max_temp, 35), Math.round((cons + (btn.dataset.th === "plus" ? pas : -pas)) / pas) * pas));
    this._appeler("climate", "set_temperature", { entity_id: e, temperature: +v.toFixed(2) }, undefined, { forcer: box.dataset.cf === "1", libelle: btn.getAttribute("aria-label") || "" }).catch(() => {});
  }

  // commande d'une cover (volet, store, portail, porte de garage) : état, position, Ouvrir / Stop / Fermer ;
  // `confirmer` (par défaut pour garage, portail et porte) : le premier appui arme le bouton 4 s, le second lance l'action
  _wCommande(w, id) {
    const s = this._etat(w.entite), dc = s?.attributes.device_class, pos = s?.attributes.current_position;
    const ouvert = !!s && !["closed", "unavailable", "unknown"].includes(s.state), ic = ((w.entite || "").startsWith("valve.") ? ["mdi:valve-closed", "mdi:valve-open"] : ICONES_COVER[dc] || ICONES_COVER._)[ouvert ? 1 : 0];
    const conf = typeof w.confirmer === "boolean" ? w.confirmer : CONFIRMER_COVER.includes(dc) || (w.entite || "").startsWith("valve."), indispo = !s || ["unavailable", "unknown"].includes(s.state);
    const f = s?.attributes.supported_features, sans = (bit) => typeof f === "number" && !(f & bit); // OPEN 1, CLOSE 2, STOP 8
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "";
    const bouton = (k, bit) => {
      if (sans(bit)) return "";
      const [, cleNom, icone] = COMMANDES[k], nom = _t(cleNom);
      return `<button class="cta" data-cmd="${k}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    if (!w.entite) return `${this._tete(w, "mdi:window-shutter")}<div class="w-note">${_t("Choisis la cover à commander (volet, portail, porte de garage…).")}</div>`;
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic, pos != null ? `${fmt(pos, 0)}${globalThis.MaquetteI18n.pct()}` : "")}
      <div class="w-cmd" data-ce="${esc(w.entite)}" data-ci="${esc(id)}"${conf ? ` data-cf="1"` : ""}>
        <div class="w-grand" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? s.state : _t("Indisponible"))}${conf ? `<small><ha-icon icon="mdi:shield-check-outline" title="${_t("Action confirmée avant d'être lancée")}"></ha-icon></small>` : ""}</div>
        ${pos != null ? `<div class="w-pos" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${esc(pos)}" aria-label="${_t("Position")}"><i style="width:${Math.max(0, Math.min(100, nb(pos)))}%"></i></div>` : ""}
        <div class="w-cmd-btns">${bouton("ouvrir", 1)}${bouton("stop", 8)}${bouton("fermer", 2)}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // serrure (lock) : état et l'action utile — Déverrouiller si verrouillée, Verrouiller si ouverte, les deux si l'état est
  // incertain (bloquée, en cours, inconnu) — plus Ouvrir si la serrure sait ouvrir la porte ;
  // `confirmer` : true = tous les boutons en deux appuis, false = aucun, absent = Déverrouiller et Ouvrir seulement
  _wSerrure(w, id) {
    if (!w.entite) return `${this._tete(w, "mdi:lock")}<div class="w-note">${_t("Choisis la serrure (entité lock).")}</div>`;
    const s = this._etat(w.entite), st = s?.state, indispo = !s || ["unavailable", "unknown"].includes(st), f = s?.attributes.supported_features;
    const ic = st === "jammed" ? "mdi:lock-alert" : st === "locked" ? "mdi:lock" : st === "locking" || st === "unlocking" ? "mdi:lock-clock" : "mdi:lock-open-variant";
    const err = this._erreurCmd?.id === id ? this._erreurCmd.msg : "", alerte = st === "jammed" || st === "unlocked" || st === "open";
    const bouton = (k) => {
      const [cleNom, icone] = COMMANDES_SERRURE[k], nom = _t(cleNom);
      // déverrouiller et ouvrir sont toujours confirmés (services sensibles) ; `confirm: true` ajoute verrouiller
      const cf = k !== "verrouiller" || w.confirmer === true;
      return `<button class="cta" data-cmd="${k}" data-cf="${cf ? 1 : 0}"${indispo ? ` aria-disabled="true"` : ""} aria-label="${esc(nom)}"><ha-icon icon="${icone}"></ha-icon>${esc(nom)}</button>`;
    };
    return `${this._tete({ ...w, titre: w.titre || this._nom(w.entite) }, ic)}
      <div class="w-cmd w-serrure" data-ce="${esc(w.entite)}" data-ci="${esc(id)}">
        <div class="w-grand${alerte ? " alerte" : ""}" data-e="${esc(w.entite)}">${esc(s ? this._hass.formatEntityState?.(s) ?? st : _t("Indisponible"))}</div>
        <div class="w-cmd-btns">${st !== "locked" ? bouton("verrouiller") : ""}${!["unlocked", "open"].includes(st) ? bouton("deverrouiller") : ""}${typeof f === "number" && f & 1 && st !== "open" ? bouton("ouvrir") : ""}</div>
        ${err ? `<div class="w-note w-err">${_t("Échec : {msg}", { msg: esc(err) })}</div>` : ""}</div>${w.lignes?.length ? this._lignes(w.lignes, w) : ""}`;
  }

  // ligne « Activer » d'une liste : scène, script ou bouton de la config (scene.turn_on, script.turn_on, button.press)
  _activer(btn) {
    const e = btn.dataset.active, dom = (e || "").split(".")[0];
    if (this._editeur || !Object.hasOwn(ACTIVABLES, dom) || btn.getAttribute("aria-disabled") === "true") return;
    this._appeler(dom, ACTIVABLES[dom], { entity_id: e }, undefined, { forcer: btn.dataset.cf === "1", libelle: btn.textContent.trim() }).then((fait) => {
      if (fait && btn.isConnected) { btn.classList.add("fait"); setTimeout(() => btn.classList.remove("fait"), 1200); }
    }).catch(() => {});
  }

  // entités commandables : celles des widgets `commande` de la config (panneaux de la maison et des pièces, fiches)
  _entitesCommande() {
    const c = this._config, l = new Set();
    const voir = (ws) => (Array.isArray(ws) ? ws : []).forEach((w) => {
      if (typeof w?.entite !== "string") return;
      if ((w.type === "commande" && /^(cover|valve)\./.test(w.entite)) || (w.type === "serrure" && w.entite.startsWith("lock."))) l.add(w.entite);
    });
    for (const x of [c, ...c.pieces]) { voir(x?.panneaux?.gauche); voir(x?.panneaux?.droite); }
    for (const k of Object.values(GENRES_FICHE)) for (const o of c[k] || []) voir(o?.fiche?.widgets);
    return l;
  }

  // appui sur Ouvrir / Stop / Fermer (cover.open_cover…, valve.open_valve…) ou Verrouiller / Déverrouiller / Ouvrir (lock.lock…)
  // sur l'entité du widget, rien d'autre
  _lancerCommande(btn) {
    const box = btn.closest(".w-cmd"), k = btn.dataset.cmd, e = box?.dataset.ce, id = box?.dataset.ci, dom = (e || "").split(".")[0];
    const service = Object.hasOwn(SERVICES_CMD, dom) && Object.hasOwn(SERVICES_CMD[dom], k) ? SERVICES_CMD[dom][k] : null;
    if (this._editeur || !service || !id || btn.getAttribute("aria-disabled") === "true" || !this._entitesCommande().has(e)) return;
    const R = this.shadowRoot, focus = R.activeElement === btn;
    const rendre = () => { this._widgets(); if (focus) R.querySelector(`.w-cmd[data-ci="${globalThis.CSS.escape(id)}"] [data-cmd="${k}"]`)?.focus(); };
    if (this._erreurCmd?.id === id) this._erreurCmd = null;
    // confirmation (dialogue) : `confirm` du widget, garage / portail / porte et vannes par défaut, et toujours pour un service sensible
    this._appeler(dom, service, { entity_id: e }, undefined, { forcer: (btn.dataset.cf ?? box.dataset.cf) === "1", libelle: btn.textContent.trim() }).then(rendre, (x) => {
      this._erreurCmd = { id, msg: String(x?.message || x) };
      setTimeout(() => { if (this._erreurCmd?.id === id) { this._erreurCmd = null; this._widgets(); } }, 8000);
      this._widgets();
    });
  }

  // statistiques HA (variation sur la période calendaire : jour, semaine, mois, année), en cache 5 min
  _stat(id, periode) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${periode}`, c = (this._cacheStat ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        (this._cacheStat[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 });
        this._hass.callWS({ type: "recorder/statistic_during_period", statistic_id: id, calendar: { period: periode }, types: ["change"] })
          .then((r) => { this._cacheStat[cle] = { v: r?.change ?? null, t: Date.now() }; this._widgets(); })
          .catch(() => { this._cacheStat[cle] = { v: null, t: Date.now() }; });
      }
    }
    return c?.v ?? null;
  }

  // historique récent pour les courbes, en cache 5 min
  _histo(id, heures) {
    if (!id) return null; // widget pas encore configuré
    const cle = `${id}|${heures}`, c = (this._cacheHisto ||= {})[cle];
    if (!c || Date.now() - c.t > 300000) {
      if (!c?.enCours) {
        this._cacheHisto[cle] = { ...(c || {}), enCours: true, t: c?.t || 0 };
        const debut = new Date(Date.now() - heures * 3600e3).toISOString();
        this._hass.callWS({ type: "history/history_during_period", start_time: debut, entity_ids: [id], minimal_response: true, no_attributes: true })
          .then((r) => {
            const pts = (r?.[id] || []).map((x) => [(x.lu ?? x.lc ?? 0) * 1000, parseFloat(x.s)]).filter((p) => !isNaN(p[1]));
            this._cacheHisto[cle] = { v: { pts, debut: Date.now() - heures * 3600e3 }, t: Date.now() };
            this._widgets();
          }).catch(() => { this._cacheHisto[cle] = { v: null, t: Date.now() }; });
      }
    }
    const v = c?.v;
    if (!v) return null;
    const n = this._num(id), pts = [...v.pts];
    if (n != null) pts.push([Date.now(), n]);
    return { pts, debut: v.debut };
  }

  _courbe({ pts, debut }) {
    if (pts.length < 2) return "";
    const W = 300, H = 56, fin = Date.now(), ys = pts.map((p) => p[1]);
    const mn = Math.min(...ys), mx = Math.max(...ys), dy = mx - mn || 1;
    const X = (t) => ((Math.max(t, debut) - debut) / (fin - debut)) * W, Y = (v) => H - 4 - ((v - mn) / dy) * (H - 8);
    let d = "", prev = null;
    for (const [tt, v] of pts) { d += prev == null ? `M${X(tt).toFixed(1)} ${Y(v).toFixed(1)}` : `H${X(tt).toFixed(1)}V${Y(v).toFixed(1)}`; prev = v; }
    d += `H${W}`;
    return `<svg class="w-courbe" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path class="a" d="${d}V${H}H${X(pts[0][0]).toFixed(1)}Z"/><path class="l" d="${d}"/></svg>`;
  }

  // entités de la pièce : celles placées dans son contour + celles de la pièce HA liée
  entitesPiece(pi) {
    const c = this._config, p = c.pieces[pi], l = new Set();
    for (const q of c.points || []) if (dansPoly(q.pos, p.poly)) [q.entite, q.actif, q.valeur].forEach((e) => e && l.add(e));
    for (const o of c.ouvertures || []) if (distBord([(o.seg[0] + o.seg[2]) / 2, (o.seg[1] + o.seg[3]) / 2], p.poly) < 20) [o.contact, o.volet, o.entite].forEach((e) => e && l.add(e));
    entitesZone(this._hass, p.zone).forEach((e) => l.add(e));
    [p.temperature, p.humidite].forEach((e) => e && l.add(e));
    return [...l].filter((e) => e.includes(".") && this._hass.states[e]);
  }

  _actionsPiece(pi) {
    const p = this._config.pieces[pi], ents = this.entitesPiece(pi), dom = (e) => e.split(".")[0];
    const boutons = [];
    if (p.auto_actions !== false) {
      const lum = ents.filter((e) => dom(e) === "light");
      if (lum.length) {
        const allumees = lum.filter((e) => this._etat(e).state === "on").length;
        boutons.push(allumees ? { nom: lum.length > 1 ? _t("Éteindre tout") : _t("Éteindre"), icone: "mdi:lightbulb-off-outline", action: "light.turn_off", cibles: lum }
          : { nom: lum.length > 1 ? _t("Allumer tout") : _t("Allumer"), icone: "mdi:lightbulb-on-outline", action: "light.turn_on", cibles: lum, plein: true });
      }
      const vol = ents.filter((e) => dom(e) === "cover" && ["shade", "shutter", "blind", "curtain", "awning", "window"].includes(this._etat(e).attributes.device_class));
      if (vol.length) {
        // libellés courts (l'icône dit « volet »), texte complet en infobulle : les boutons tiennent sur une rangée
        boutons.push({ nom: _t("Ouvrir"), titre: vol.length > 1 ? _t("Ouvrir les volets") : _t("Ouvrir le volet"), icone: "mdi:window-shutter-open", action: "cover.open_cover", cibles: vol });
        boutons.push({ nom: _t("Fermer"), titre: vol.length > 1 ? _t("Fermer les volets") : _t("Fermer le volet"), icone: "mdi:window-shutter", action: "cover.close_cover", cibles: vol });
      }
    }
    for (const a of p.actions || []) {
      const d0 = (a.action || "").split(".")[0];
      const cibles = a.cible === "piece" ? (p.zone ? null : ents.filter((e) => d0 === "homeassistant" || dom(e) === d0)) : a.cible ? [a.cible] : null;
      boutons.push({ ...a, cibles, zone: a.cible === "piece" && p.zone ? p.zone : null });
    }
    const lie = this._lies(pi);
    // scènes liées en boutons ; les scripts restent listés (ils peuvent déclencher des alertes) : un appui ouvre leur fiche
    for (const e of lie.scene || []) {
      if ((p.actions || []).some((a) => a.cible === e)) continue;
      boutons.push({ nom: this._nom(e), icone: "mdi:palette-outline", action: "scene.turn_on", cibles: [e] });
    }
    return { boutons, automations: p.automatismes === false ? [] : [...(lie.automation || []), ...(lie.script || [])] };
  }

  // automatisations / scènes / scripts liés (search/related), en cache 10 min
  _lies(pi) {
    const p = this._config.pieces[pi], cle = `${pi}|${p.zone || ""}`, c = (this._cacheLies ||= {})[cle];
    if (!c || (Date.now() - c.t > 600000 && !c.enCours)) {
      this._cacheLies[cle] = { ...(c || { v: {} }), enCours: true, t: c?.t || 0 };
      const req = p.zone ? [{ item_type: "area", item_id: p.zone }] : this.entitesPiece(pi).slice(0, 20).map((e) => ({ item_type: "entity", item_id: e }));
      Promise.all(req.map((r) => this._hass.callWS({ type: "search/related", ...r }).catch(() => ({}))))
        .then((rs) => {
          const v = {};
          for (const r of rs) for (const k of ["automation", "scene", "script"]) for (const e of r[k] || []) (v[k] ||= new Set()).add(e);
          for (const k of Object.keys(v)) v[k] = [...v[k]].filter((e) => this._hass.states[e]).sort();
          this._cacheLies[cle] = { v, t: Date.now() };
          if (this._iso === pi) this._fiche();
        });
    }
    return c?.v || {};
  }

  // bouton d'une pièce : son service, confirmé par un dialogue s'il est sensible ou si le bouton a `confirm: true`
  _lancerAction(btn) {
    const b = this._boutons?.[+btn.dataset.cta];
    if (!b || typeof b.action !== "string" || !SERVICE_SUR.test(b.action)) return;
    const [domaine, service] = b.action.split(".");
    const cible = b.zone ? { area_id: b.zone } : b.cibles ? { entity_id: b.cibles } : undefined;
    const donnees = objetSimple(b.donnees) ? b.donnees : {};
    this._appeler(domaine, service, donnees, cible, { forcer: b.confirmer === true, libelle: b.nom }).then((fait) => {
      if (!fait || !btn.isConnected) return;
      btn.classList.remove("confirmer"); btn.classList.add("fait");
      setTimeout(() => btn.isConnected && btn.classList.remove("fait"), 1200);
    }).catch((e) => { btn.title = String(e?.message || e); btn.classList.add("confirmer"); });
  }

  // appel de service depuis le plan (jamais pendant l'édition) : un service sensible demande toujours une confirmation qui nomme
  // l'action réelle et les entités visées ; `forcer` la demande aussi pour un service sûr. Renvoie true si le service est parti.
  async _appeler(dom, svc, donnees = {}, cible, { forcer = false, libelle = "" } = {}) {
    if (this._editeur) return false;
    const ents = entitesAppel(this._hass, dom, donnees, cible);
    if ((forcer || serviceSensible(this._hass, dom, svc, ents)) && !(await this._confirmerService(dom, svc, donnees, ents, libelle))) return false;
    await this._hass.callService(dom, svc, donnees, cible);
    return true;
  }

  // dialogue de confirmation (MD3) : l'action réelle (verbe et service technique), les entités visées (nom et identifiant),
  // les clés des données envoyées (jamais leurs valeurs : un code reste caché) ; Annuler a le focus, Échap annule
  _confirmerService(dom, svc, donnees, ents, libelle) {
    const R = this.shadowRoot;
    R.querySelector("dialog.conf")?.close();
    const d = document.createElement("dialog");
    d.className = "conf";
    d.setAttribute("role", "alertdialog");
    d.setAttribute("aria-labelledby", "conf-t"); d.setAttribute("aria-describedby", "conf-d");
    const verbe = verbeService(dom, svc), cles = Object.keys(donnees || {}).filter((k) => k !== "entity_id" && k !== "area_id");
    const liste = ents === null ? `<p>${_t("Cibles : appareils ou zones (non détaillés).")}</p>`
      : ents.length ? `<ul>${ents.slice(0, 20).map((e) => `<li><b>${esc(this._nom(e))}</b><small>${esc(e)}</small></li>`).join("")}${ents.length > 20 ? `<li>${_t("… et {n} autres", { n: ents.length - 20 })}</li>` : ""}</ul>` : `<p>${_t("Sans entité visée.")}</p>`;
    const bouton = libelle && libelle !== verbe ? `<p>${_t("Bouton « {nom} »", { nom: esc(libelle) })}</p>` : "";
    poserHTML(d, `<ha-icon class="conf-ic" icon="mdi:shield-alert-outline"></ha-icon><h2 id="conf-t">${esc(_t("{action} ?", { action: verbe }))}</h2>
      <div id="conf-d">${bouton}<p>${_t("Service appelé : {service}", { service: `<code>${esc(`${dom}.${svc}`)}</code>` })}</p>${liste}
      ${cles.length ? `<p>${_t("Données envoyées : {cles}", { cles: esc(cles.join(", ")) })}</p>` : ""}</div>
      <div class="conf-actions"><button class="non" data-conf="non">${_t("Annuler")}</button><button class="oui" data-conf="oui">${esc(verbe)}</button></div>`);
    R.querySelector("ha-card").append(d);
    return new Promise((fin) => {
      let r = false;
      d.addEventListener("click", (ev) => {
        ev.stopPropagation(); // jamais vers les clics de la carte ni de la fiche ouverte
        const b = ev.composedPath().find((n) => n.dataset?.conf);
        if (b) { r = b.dataset.conf === "oui"; d.close(); }
      });
      d.addEventListener("close", () => { d.remove(); fin(r); });
      d.showModal();
      d.querySelector(".non").focus();
    });
  }

  // édition : glisser-déposer des widgets pour les réordonner ou les changer de panneau
  // (souris : dès 5 px ; tactile : appui long, le défilement de la page reste possible sinon)
  _glisserWidgets(vue) {
    vue.addEventListener("pointerdown", (ev) => {
      if (!this._editeur || ev.button > 0) return;
      const w = ev.composedPath().find((n) => n.classList?.contains("w") && n.dataset?.w);
      if (!w) return;
      const R = this.shadowRoot, src = this._selWidget(w.dataset.w);
      const x0 = ev.clientX, y0 = ev.clientY, tactile = ev.pointerType === "touch";
      let actif = false, fantome = null, depot = null, cible = null, dx = 0, dy = 0;
      const bloquer = (e) => e.preventDefault();
      const viser = (x, y) => {
        let cont = null;
        for (const c of R.querySelectorAll(".col:not([hidden]) .widgets")) { const r = c.closest(".col").getBoundingClientRect(); if (x >= r.left - 24 && x <= r.right + 24) cont = c; }
        if (!cont) return null;
        const items = [...cont.children].filter((n) => (n.dataset.w || n.dataset.ajouter) && !n.classList.contains("w-fantome"));
        for (const n of items) {
          const r = n.getBoundingClientRect();
          if (y < r.top + r.height / 2) return n.dataset.ajouter ? { cote: n.dataset.ajouter, i: Infinity, avant: n } : { cote: n.dataset.w.split(":")[0], i: +n.dataset.w.split(":")[1], avant: n };
        }
        const der = items[items.length - 1];
        return { cote: der?.dataset.ajouter || der?.dataset.w?.split(":")[0] || (cont.closest(".col-g") ? "gauche" : "droite"), i: Infinity, avant: null, cont };
      };
      const demarrer = () => {
        actif = true;
        const r = w.getBoundingClientRect();
        dx = x0 - r.left; dy = y0 - r.top;
        fantome = w.cloneNode(true);
        fantome.classList.add("w-fantome"); fantome.classList.remove("sel");
        Object.assign(fantome.style, { width: `${r.width}px`, left: `${r.left}px`, top: `${r.top}px` });
        R.querySelector("ha-card").append(fantome);
        w.classList.add("glisse");
        depot = document.createElement("div"); depot.className = "w-depot";
        if (tactile) window.addEventListener("touchmove", bloquer, { passive: false });
      };
      const minuteur = tactile ? setTimeout(demarrer, 350) : null;
      const bouge = (e) => {
        if (!actif) {
          const d = Math.hypot(e.clientX - x0, e.clientY - y0);
          if (tactile) { if (d > 8) fin(); return; }
          if (d < 5) return;
          demarrer();
        }
        fantome.style.left = `${e.clientX - dx}px`; fantome.style.top = `${e.clientY - dy}px`;
        cible = viser(e.clientX, e.clientY);
        if (!cible) { depot.remove(); return; }
        const cont = cible.avant?.parentElement || cible.cont || R.querySelector(`.col-${cible.cote === "gauche" ? "g" : "d"} .widgets`);
        if (cible.avant) cont.insertBefore(depot, cible.avant); else cont.append(depot);
      };
      const fin = (e) => {
        clearTimeout(minuteur);
        window.removeEventListener("pointermove", bouge); window.removeEventListener("pointerup", fin); window.removeEventListener("pointercancel", fin);
        window.removeEventListener("touchmove", bloquer);
        if (!actif) return;
        fantome.remove(); depot.remove();
        R.querySelectorAll(".w.glisse").forEach((n) => n.classList.remove("glisse"));
        this._wDrag = true;
        setTimeout(() => { this._wDrag = false; }, 0);
        if (e?.type === "pointerup" && cible) this._editeur?.deplacerWidget(src, cible.cote, cible.i);
      };
      window.addEventListener("pointermove", bouge); window.addEventListener("pointerup", fin); window.addEventListener("pointercancel", fin);
    });
  }

  // « gauche:2 », « droite:0:3 » (pièce 3), « fiche:1:5 » (fiche du meuble 5), « fiche:1:5:ouverture » / « fiche:1:5:point » → sélection de l'éditeur
  _selWidget(k) {
    const [cote, i, x, g] = k.split(":");
    return { type: "widget", cote, i: +i, ...(x != null ? (cote === "fiche" ? { [Object.hasOwn(GENRES_FICHE, g ?? "") ? g : "meuble"]: +x } : { piece: +x }) : {}) };
  }

  set preview(v) { this._preview = v; this._majCrayon(); }
  get preview() { return this._preview; }
  set editMode(v) { this._editMode = v; this._majCrayon(); }
  get editMode() { return this._editMode; }
  _majCrayon() {
    const b = this.shadowRoot?.querySelector(".editer");
    if (b && this._config) b.hidden = !!this._editeur || this._config.edition === false || !this._hass?.user?.is_admin || this._apercu();
  }

  // aperçu du sélecteur de cartes ou dashboard en mode édition de HA : pas d'éditeur (HA réécrirait la config par-dessus)
  _apercu() {
    if (this._preview || this._editMode) return true;
    for (let n = this; n; ) {
      if (/^(hui-card-preview|hui-card-picker|hui-dialog-edit-card|hui-card-options|hui-card-edit-mode)$/i.test(n.tagName || "")) return true;
      n = n.parentElement || n.getRootNode?.().host || null;
    }
    return false;
  }

  // puces du résumé : liste personnalisée (`resume`), sinon les quatre puces d'origine
  _puces() {
    const r = this._config.resume;
    if (Array.isArray(r)) return r;
    return r === false ? [] : MaquetteCard.PUCES.map((p) => ({ ...p }));
  }

  // en replay, l'état d'une entité à l'instant choisi (historique), sinon l'état en direct
  _etat(e) { if (!e) return undefined; const r = this._rp?.pret ? this._rpEtat(e) : undefined; return r ?? this._hass.states[e]; }
  _maintenant() { return this._rp?.pret ? this._rp.t : Date.now(); }
  _nom(e) { const s = this._etat(e); return s ? s.attributes.friendly_name || e : e; }
  _num(e, attr) { const s = this._etat(e); const v = s ? parseFloat(attr ? s.attributes[attr] : s.state) : NaN; return isNaN(v) ? null : v; }
  // « actif » d'une pastille (ou d'un meuble connecté) : état de `actif` (ou de l'entité), d'un attribut, ou au-dessus d'un seuil
  _actif(p) {
    const sa = this._etat(p.actif || p.entite), va = sa ? (p.actif_attribut ? sa.attributes[p.actif_attribut] : sa.state) : undefined;
    return va != null && (p.seuil != null && p.seuil !== "" ? parseFloat(va) > p.seuil : ACTIFS.has(va));
  }
  // valeur affichée : un attribut de l'entité, ou l'état numérique de `valeur` avec son unité
  _texteValeur(p) {
    const s = this._etat(p.entite);
    if (p.attribut && s) { const a = s.attributes[p.attribut]; return a != null ? `${typeof a === "number" ? fmt(a, p.decimales ?? 1) : a}${p.unite ?? ""}` : ""; }
    if (p.valeur) { const n = this._num(p.valeur), sv = this._etat(p.valeur); if (n != null) return `${fmt(n, p.decimales ?? 0)} ${p.unite ?? sv.attributes.unit_of_measurement ?? ""}`.trim(); }
    return "";
  }

  _maj() {
    const c = this._config, R = this.shadowRoot;
    const ouvertes = [], temps = [], teinte = teinteTemp(c), EP = etiquettesPieces(c);
    let lumieres = 0, voletsBas = 0;
    const voletsVus = new Set(); // un volet partagé par deux vantaux ne compte qu'une fois

    c.pieces.forEach((p, i) => {
      const t = this._num(p.temperature, p.attribut_temperature), h = this._num(p.humidite, p.attribut_humidite);
      if (p.sous_zone) return;
      if (t != null && !p.dehors) temps.push(t);
      const poly = R.querySelector(`[data-p="${i}"]`);
      if (!p.dehors && poly) {
        const col = teinte && couleurTempEchelle(t, teinte);
        poly.style.fill = col ? `color-mix(in srgb, ${col} 28%, var(--md-surface))` : "var(--secondary-background-color)";
      }
      const etq = R.querySelector(`[data-l="${i}"] .val`);
      if (etq) etq.textContent = [t != null && EP.temperature ? `${fmt(t)} °C` : "", h != null && EP.humidite ? `${fmt(h, 0)}${globalThis.MaquetteI18n.pct()}` : ""].filter(Boolean).join(" · ");
    });

    (c.ouvertures || []).forEach((o, i) => {
      // ouverture masquée (élément ou calque) : pas de dessin, mais elle compte toujours dans le résumé
      const g = R.querySelector(`[data-o="${i}"]`), ent = o.contact || o.entite;
      const s = this._etat(ent), cl = g?.classList;
      cl?.remove("ouvert", "bouge", "inconnu");
      let txt = o.nom || "";
      if (ent) {
        if (!s || ["unavailable", "unknown"].includes(s.state)) cl?.add("inconnu");
        else if (["opening", "closing"].includes(s.state)) cl?.add("bouge");
        else if (s.state === "on" || s.state === "open") { cl?.add("ouvert"); const n = o.baie || o.nom || this._nom(ent); if (!ouvertes.includes(n)) ouvertes.push(n); }
        txt = _t("{nom} : {etat}", { nom: o.nom || this._nom(ent), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" });
      }
      if (o.volet) {
        const sv = this._etat(o.volet), v = R.querySelector(`[data-v="${i}"]`);
        let pos = sv ? sv.attributes.current_position : undefined;
        if (pos == null && sv) pos = sv.state === "closed" ? 0 : 100;
        if (v) {
          // en mouvement : visible tout de suite (un volet ouvert à 100 % est transparent), tirets dans le sens du mouvement
          const bouge = !!sv && ["opening", "closing"].includes(sv.state);
          v.classList.toggle("bouge", bouge); v.classList.toggle("monte", bouge && sv.state === "opening");
          v.style.opacity = bouge ? Math.max(0.85, 1 - (pos ?? 0) / 100) : pos == null ? 0.15 : Math.max(0, Math.min(1, 1 - pos / 100));
        }
        if (pos != null && pos < 50 && !voletsVus.has(o.volet)) voletsBas++;
        voletsVus.add(o.volet);
        if (sv) txt += _t(" · volet {etat}", { etat: pos != null ? pos + globalThis.MaquetteI18n.pct() : sv.state });
      }
      if (g) g.querySelector("title").textContent = txt;
    });

    // bulles cachées (indisponibles ou inactives, selon `style_pastilles`) : plus dessinées ni cliquables ni lues ; toujours là en édition
    const st = stylePastilles(c), ed = !!this._editeur;
    (c.points || []).forEach((p, i) => {
      const b = R.querySelector(`[data-q="${i}"]`), s = this._etat(p.entite), actif = this._actif(p);
      if ((p.entite || "").startsWith("light.") && actif) lumieres++;
      const h = R.querySelector(`[data-h="${i}"]`);
      if (h) h.setAttribute("opacity", actif ? 1 : 0);
      if (!b) return; // pastille masquée : elle compte toujours dans le résumé
      b.classList.toggle("actif", actif);
      b.classList.toggle("clair", actif && (p.clair ?? clairPour(p.couleur)));
      b.classList.toggle("alerte", actif && !!p.alerte);
      const indispo = !s || s.state === "unavailable";
      b.classList.toggle("indispo", indispo);
      b.classList.toggle("bs-cache", !ed && (indispo ? st.indisponible === "cache" : !actif && st.inactif === "actif_seul"));
      b.classList.toggle("bs-estompe", !ed && !indispo && !actif && st.inactif === "estompe");
      b.querySelector(".v").textContent = this._texteValeur(p);
      b.title = _t("{nom} : {etat}", { nom: p.nom || this._nom(p.entite), etat: s ? this._hass.formatEntityState?.(s) ?? s.state : "?" });
    });

    // meubles connectés : classes et badge seulement (pas de reconstruction du plan) ; un meuble dont les états n'ont pas changé est sauté
    for (const x of this._mbs || []) {
      const { m, g, b } = x, etats = [m.entite, m.valeur, m.actif].map((e) => this._etat(e));
      if (x.prec && etats.every((v, j) => v === x.prec[j])) continue;
      x.prec = etats;
      const e = m.entite || m.valeur, s = this._etat(e), indispo = !!e && (!s || s.state === "unavailable");
      const actif = !indispo && !!(m.actif || m.entite || (m.valeur && m.seuil != null)) && this._actif({ ...m, actif: m.actif || m.entite || m.valeur });
      g?.classList.toggle("actif", actif); g?.classList.toggle("indispo", indispo);
      if (!b) continue;
      const v = this._texteValeur(m), etat = s ? this._hass.formatEntityState?.(s) ?? s.state : e ? _t("indisponible") : "";
      b.classList.toggle("actif", actif); b.classList.toggle("clair", actif && clairPour(m.couleur));
      b.querySelector(".v").textContent = v;
      const nom = m.nom || m.fiche?.titre || _t(MEUBLES[m.type]?.nom || _tk("Meuble")), txt = [nom, m.entite ? etat : "", v].filter(Boolean).join(" · ");
      b.title = txt;
      if (b.tagName === "BUTTON") b.setAttribute("aria-label", txt);
    }

    this._widgets();
    const fv = R.querySelector(".fiche").hidden;
    this._fiche();
    if (fv !== R.querySelector(".fiche").hidden) this._mise();

    const tete = R.querySelector(".tete");
    // pendant le glisser d'une puce, le résumé n'est pas redessiné (la puce saisie resterait sinon détachée)
    if (tete && !tete.hidden && !this._glissePuce) {
      const moy = temps.length ? fmt(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
      const es = this._editeur?.sel, selP = es?.type === "puce" ? es.i : null, ed = !!this._editeur;
      const puce = (i, ic, txt, opt = {}) => `<span class="chip${opt.alerte ? " alerte" : ""}${selP === i ? " sel" : ""}" data-puce="${i}"${opt.e && !ed ? ` data-e="${esc(opt.e)}"` : ""}${opt.title ? ` title="${esc(opt.title)}"` : ""}><ha-icon icon="${esc(ic)}"></ha-icon><span>${txt}</span></span>`;
      // « afficher » : toujours (défaut), seulement quand personne n'est là (absent) ou quand quelqu'un est là (present) ;
      // présence = `presence` (défaut zone.home : nombre de personnes à la maison, ou état home / on d'une personne / d'un groupe)
      const quelquun = (e) => this._quelquun(e);
      const L = this._puces(), parts = L.map((p, i) => {
        if (!ed && (p.afficher === "absent" || p.afficher === "present")) { const q = quelquun(p.presence); if (q != null && q === (p.afficher === "absent")) return ""; }
        if (p.type === "ouvertures") return puce(i, p.icone || `mdi:${ouvertes.length ? "window-open-variant" : "window-closed-variant"}`,
          ouvertes.length ? _t("<b>{n}</b> ouverte : {liste}|<b>{n}</b> ouvertes : {liste}", { n: ouvertes.length, liste: esc(ouvertes.join(", ")) }) : _t("Tout est fermé"), { alerte: ouvertes.length, title: ouvertes.join(", ") });
        if (p.type === "lumieres") return puce(i, p.icone || `mdi:lightbulb${lumieres ? "-on" : "-outline"}`, _t("<b>{n}</b> lumière|<b>{n}</b> lumières", { n: lumieres }));
        if (p.type === "volets") return puce(i, p.icone || "mdi:window-shutter", _t("<b>{n}</b> volet baissé|<b>{n}</b> volets baissés", { n: voletsBas }));
        if (p.type === "temperature") return moy || ed ? puce(i, p.icone || "mdi:home-thermometer-outline", _t("<b>{t} °C</b> à l'intérieur", { t: moy ?? "—" })) : "";
        if (p.type === "entite") {
          const st = this._etat(p.entite);
          if (!ed && (!st || (p.masquer_si != null && p.masquer_si !== "" && st.state === String(p.masquer_si)))) return "";
          const n = this._num(p.entite), v = p.entite ? this._val(p.entite, p.decimales, p.unite) : { t: "—", u: "" };
          const alerte = st && ((p.alerte_etat != null && p.alerte_etat !== "" && st.state === String(p.alerte_etat)) || (p.alerte_au_dessus != null && p.alerte_au_dessus !== "" && n != null && n > +p.alerte_au_dessus));
          const val = n == null && st ? esc(this._hass.formatEntityState?.(st) ?? st.state) : `${esc(v.t)}${esc(globalThis.MaquetteI18n.unite(v.u))}`;
          return puce(i, p.icone || (st?.attributes.icon) || "mdi:information-outline", `<b>${val}</b>${p.nom !== "" ? ` ${esc(p.nom ?? (p.entite ? this._nom(p.entite) : _t("Choisir une entité")))}` : ""}`, { alerte, e: p.entite });
        }
        return "";
      });
      // `ligne: true` : la puce commence une nouvelle ligne ; `sous: true` : elle se range sous la puce précédente (pile)
      const ajout = ed ? `<button class="chip ajout" data-ajouter-puce title="${_t("Ajouter une puce au résumé")}"><ha-icon icon="mdi:plus"></ha-icon><span>${_t("Puce")}</span></button>` : "";
      const struct = L.some((p) => p.ligne || p.sous);
      tete.classList.toggle("lignes", struct);
      let html;
      if (!struct) html = parts.join("") + ajout;
      else {
        const lignes = [];
        let lg = null, pile = null;
        L.forEach((p, i) => {
          if (!lg || (p.ligne && !p.sous)) { lg = []; lignes.push(lg); pile = null; }
          if (!pile || !p.sous) { pile = []; lg.push(pile); }
          pile.push(parts[i]);
        });
        const rendu = lignes.map((l) => l.map((pl) => pl.filter(Boolean)).filter((pl) => pl.length));
        if (ajout) (rendu[rendu.length - 1] ||= []).push([ajout]);
        html = rendu.filter((l) => l.length).map((l) => `<div class="tete-l">${l.map((pl) => (pl.length > 1 ? `<div class="pile">${pl.join("")}</div>` : pl[0])).join("")}</div>`).join("");
      }
      poserHTML(tete, html);
    }
    this._majInfos();
    this._majTraces();
    this._majAmbiance();
    this._majFlux();
    this._majPersonnes();
    this._majAlertes();
    // les pastilles changent de largeur avec leur valeur : les étiquettes recouvertes sont replacées (une fois par image)
    cancelAnimationFrame(this._rafEvite);
    this._rafEvite = requestAnimationFrame(() => this._eviterPastilles());
  }

  // zones d'informations : nom (sinon celui de l'entité), icône (sinon selon le type de mesure), valeur avec son unité
  _majInfos() {
    const R = this.shadowRoot, T = this._config.textes || [];
    R?.querySelectorAll(".calque>.infob").forEach((b) => {
      const t = T[+b.dataset.t];
      b.querySelectorAll(".ib-l").forEach((ln) => {
        const l = t?.infos?.[+ln.dataset.ibl] || {}, s = this._etat(l.entite), dc = s?.attributes.device_class;
        ln.querySelector(".ib-n").textContent = l.nom ?? (s ? s.attributes.friendly_name || l.entite : l.entite || "");
        const parAttr = /temp/i.test(l.attribut || "") ? "temperature" : /humid/i.test(l.attribut || "") ? "humidity" : null;
        if (!l.icone) ln.querySelector("ha-icon").setAttribute("icon", (parAttr && ICONES_MESURE[parAttr]) || s?.attributes.icon || ICONES_MESURE[dc] || "mdi:information-outline");
        let v = "—";
        if (s && l.attribut) { const a = s.attributes[l.attribut]; v = a == null ? "—" : `${typeof a === "number" ? fmt(a, l.decimales ?? 1) : a}${l.unite ? ` ${l.unite}` : ""}`; }
        else if (s && !isNaN(parseFloat(s.state))) { const x = this._val(l.entite, l.decimales, l.unite); v = `${x.t}${globalThis.MaquetteI18n.unite(x.u)}`; }
        else if (s) v = this._hass.formatEntityState?.(s) ?? s.state;
        ln.querySelector(".ib-v").textContent = v;
        ln.classList.toggle("indispo", !s || s.state === "unavailable");
      });
    });
  }

  // présence à la maison : `presence` (défaut : `presence` de la carte, sinon zone.home : nombre de personnes, ou état home / on d'une personne / d'un groupe) ; null = inconnue
  _quelquun(e) { const s = this._etat(e || presenceDefaut(this._config)); if (!s) return null; const n = parseFloat(s.state); return isNaN(n) ? ["home", "on", "true"].includes(s.state) : n > 0; }

  // ---------- flux d'énergie ----------
  _majFlux() {
    const R = this.shadowRoot, c = this._config, E = coucheEnergie(c.ambiance), g = R?.querySelector(".zone svg .flux");
    if (!E || !g) return;
    const M = c.meubles || [], src = typeof E.source === "number" ? M[E.source] : M.find((m) => m.type === (E.source || "tableau_elec"));
    const l = [], seuil = +(E.seuil ?? 5), couleur = (x) => (x && COULEUR_SURE.test(x) ? x : null);
    const ajoute = (o) => {
      if (!src?.pos || o === src || !Array.isArray(o.pos)) return;
      // puissance : la première de valeur / actif / entite exprimée en W ou kW
      const w = [o.valeur, o.actif, o.entite].map((e) => (typeof e === "string" ? enWatts(this._etat(e)) : null)).find((x) => x != null);
      if (w == null || w < seuil) return;
      l.push({ de: src.pos.map(nb), vers: o.pos.map(nb), w, col: couleur(E.couleur) || couleur(o.couleur) || COULEURS_TYPE[o.type] || "#fbc02d" });
    };
    M.forEach(ajoute);
    if (E.pastilles !== false) (c.points || []).forEach(ajoute);
    const cle = l.map((x) => `${x.vers}|${Math.round(Math.log2(x.w + 1) * 2)}|${x.col}`).join(";");
    if (cle === this._fluxCle) return;
    this._fluxCle = cle;
    const b = this._box;
    poserHTML(g, dessinFlux(l, Math.max(b.W, b.H) * 0.0045, this._sansBoucles()));
  }

  // ---------- personnes ----------
  _listePersonnes(A) {
    const P = couchePersonnes(A);
    if (!P) return [];
    return P.liste || Object.keys(this._hass?.states || {}).filter((e) => e.startsWith("person.")).sort().map((e) => ({ entite: e }));
  }
  _htmlPersonnes(A) {
    const P = couchePersonnes(A);
    return this._listePersonnes(A).map((p) => {
      const s = this._etat(p.entite), nom = s?.attributes.friendly_name || p.entite.split(".")[1], pic = s?.attributes.entity_picture;
      const ini = nom.trim().split(/[\s_]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
      // `avatar` : photo du profil HA si elle existe, sinon les initiales (défaut) ; `initiales` : toujours les initiales
      const url = affPersonne(P, p.entite).avatar === "photo" && typeof pic === "string" && /^\/(?![/\\])/.test(pic) ? (this._hass.hassUrl ? this._hass.hassUrl(pic) : pic) : null; // photo servie par HA seulement
      return `<button class="pers" data-pers="${esc(p.entite)}" data-e="${esc(p.entite)}" aria-label="${esc(nom)}"><span class="av">${url ? `<img src="${esc(url)}" alt="">` : esc(ini)}</span><small></small></button>`;
    }).join("");
  }
  // point de rassemblement à la maison : `maison` ([x, y] ou nom de pièce), sinon le centre des pièces intérieures
  _pointMaison() {
    const c = this._config, m = couchePersonnes(c.ambiance)?.maison;
    if (Array.isArray(m) && m.length === 2) return m.map(nb);
    const pc = typeof m === "string" ? c.pieces.find((x) => x.nom === m) : null;
    if (pc?.etiquette) return pc.etiquette;
    const l = (pc ? [pc] : c.pieces.filter((p) => !p.dehors && !p.sous_zone)).flatMap((p) => p.poly || []);
    if (!l.length) { const b = this._box; return [b.x0 + b.W / 2, b.y0 + b.H / 2]; }
    const xs = l.map((q) => q[0]), ys = l.map((q) => q[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  // à la maison : côte à côte au point de rassemblement (suit le zoom) ; dehors : au bord du plan, dans la direction réelle
  // (depuis les coordonnées de HA, avec `nord`), grisé, avec la distance ou le nom de la zone ; le passage de l'un à l'autre glisse.
  // Réglages (`dehors`, `chez_soi`, communs ou par personne) : dehors en rangée discrète en bas du plan avec la zone (`zone`),
  // ou caché (`cache`, à la maison comme dehors) : plus dessiné, ni cliquable, ni lu
  _majPersonnes() {
    const R = this.shadowRoot, A = this._config.ambiance, l = [...(R?.querySelectorAll(".calque>.pers[data-pers]") || [])];
    if (!l.length || this._glissePers) return; // pendant un glisser des avatars (éditeur), leur place suit le pointeur
    const q = this.vue(), mz = this._pointMaison(), nord = +A?.nord || 0, cf = this._hass.config || {}, P = couchePersonnes(A);
    const aff = new Map(l.map((el) => [el, affPersonne(P, el.dataset.pers)]));
    const tousChez = l.filter((el) => this._etat(el.dataset.pers)?.state === "home"), tousDehors = l.filter((el) => !tousChez.includes(el));
    const chez = tousChez.filter((el) => aff.get(el).chez_soi !== "cache"), dehors = tousDehors.filter((el) => aff.get(el).dehors === "direction");
    const rangee = tousDehors.filter((el) => aff.get(el).dehors === "zone");
    l.forEach((el) => {
      const s = this._etat(el.dataset.pers), nom = s?.attributes.friendly_name || el.dataset.pers, pt = el.querySelector("small");
      const home = tousChez.includes(el), a = aff.get(el), cache = home ? a.chez_soi === "cache" : a.dehors === "cache";
      el.classList.toggle("dehors", !home);
      el.classList.toggle("inconnu", !s || ["unknown", "unavailable"].includes(s.state));
      el.classList.toggle("cache", cache);
      el.classList.toggle("ailleurs", !home && a.dehors === "zone");
      if (cache) { delete el.dataset.x; delete el.dataset.y; return; }
      if (!home && a.dehors === "zone") {
        // rangée en bas du plan, sans direction ni distance : la zone de HA, ou « Absent » hors de toute zone
        delete el.dataset.x; delete el.dataset.y;
        const txt = !s ? _t("inconnu") : s.state === "not_home" ? _t("Absent") : this._hass.formatEntityState?.(s) ?? s.state;
        el.style.left = "50%"; el.style.top = "100%";
        pt.textContent = txt; el.title = _t("{nom} : {etat}", { nom, etat: txt });
        return;
      }
      if (home) {
        el.dataset.x = mz[0]; el.dataset.y = mz[1];
        el.style.left = `${((mz[0] - q.x0) / q.W) * 100}%`; el.style.top = `${((mz[1] - q.y0) / q.H) * 100}%`;
        el.style.setProperty("--dx", (chez.indexOf(el) - (chez.length - 1) / 2).toFixed(2));
        pt.textContent = ""; el.title = _t("{nom} : à la maison", { nom });
        return;
      }
      delete el.dataset.x; delete el.dataset.y;
      let txt = s ? this._hass.formatEntityState?.(s) ?? s.state : _t("inconnu"), ux = 0, uy = 1;
      const la = parseFloat(s?.attributes.latitude), lo = parseFloat(s?.attributes.longitude);
      if (!isNaN(la) && !isNaN(lo) && cf.latitude != null && cf.longitude != null) {
        const { cap, km } = capDistance(+cf.latitude, +cf.longitude, la, lo), f = ((cap + nord) * Math.PI) / 180;
        ux = Math.sin(f); uy = -Math.cos(f);
        if (s.state === "not_home") txt = km < 10 ? `${fmt(km, 1)} km` : `${Math.round(km)} km`;
      }
      const k = Math.min(Math.abs(ux) > 1e-6 ? 0.44 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.44 / Math.abs(uy) : Infinity);
      el.style.left = `${(50 + ux * k * 100).toFixed(2)}%`; el.style.top = `${(50 + uy * k * 100).toFixed(2)}%`;
      el.style.setProperty("--dx", (dehors.indexOf(el) * 0.5).toFixed(2)); // deux personnes au même endroit : légèrement décalées
      pt.textContent = txt; el.title = _t("{nom} : {etat}", { nom, etat: txt });
    });
    this._rangeePersonnes();
  }
  // rangée du bas (dehors: zone) : puces centrées côte à côte selon leur largeur (recalculé aussi au redimensionnement)
  _rangeePersonnes() {
    const l = [...(this.shadowRoot?.querySelectorAll(".calque>.pers.ailleurs:not(.cache)") || [])];
    if (!l.length) return;
    const g = 8, w = l.map((el) => el.offsetWidth), tot = w.reduce((a, b) => a + b, 0) + g * (l.length - 1);
    let x = -tot / 2;
    l.forEach((el, k) => { el.style.setProperty("--ox", `${(x + w[k] / 2).toFixed(1)}px`); x += w[k] + g; });
  }

  // ---------- alertes plein plan ----------
  _alertesActives() {
    const c = this._config, out = [];
    (Array.isArray(c.alertes) ? c.alertes : []).forEach((r, i) => {
      if (!r || typeof r !== "object" || r.actif === false) return;
      if (r.si_absent && this._quelquun(r.presence) !== false) return;
      const ents = r.type === "ouvertures" ? (c.ouvertures || []).map((o) => o.contact || o.entite) : [...(Array.isArray(r.entites) ? r.entites : []), r.entite];
      const vide = (v) => v == null || v === "";
      const on = [...new Set(ents.filter((e) => typeof e === "string"))].filter((e) => {
        const s = this._etat(e);
        if (!s) return false;
        const v = parseFloat(s.state);
        if (!vide(r.au_dessus)) return !isNaN(v) && v > +r.au_dessus;
        if (!vide(r.au_dessous)) return !isNaN(v) && v < +r.au_dessous;
        if (!vide(r.etat)) return s.state === String(r.etat);
        return ETATS_ALERTE.includes(s.state);
      });
      const niv = NIVEAUX_ALERTE[r.niveau] ? r.niveau : "critique";
      if (on.length) out.push({ r, on, niv, sig: `${i}|${on.map((e) => `${e}@${this._etat(e).last_changed}`).join(",")}` });
    });
    return out.sort((a, b) => NIVEAUX_ALERTE[b.niv].r - NIVEAUX_ALERTE[a.niv].r);
  }
  // voile coloré qui bat sur tout le plan, bandeau (nom, éléments concernés, détails, masquer jusqu'au prochain changement),
  // éléments concernés entourés d'une onde ; jamais pendant l'édition
  _majAlertes() {
    const R = this.shadowRoot, plan = R?.querySelector(".plan");
    if (!plan) return;
    const l = this._editeur ? [] : this._alertesActives().filter((a) => !this._alertesVues?.has(a.sig));
    R.querySelectorAll(".en-alerte:not(.vit-pt)").forEach((e) => { e.classList.remove("en-alerte"); e.style.removeProperty("--al-c"); });
    let v = plan.querySelector(":scope>.alerte-voile"), bd = plan.querySelector(":scope>.bandeau-al");
    this._alertes = l;
    if (!l.length) { v?.remove(); bd?.remove(); return; }
    const COUL = { critique: "var(--md-error)", alerte: "var(--warning-color,#f4b400)", info: "var(--md-primary)" }, a0 = l[0];
    if (!v) { v = document.createElement("div"); plan.append(v); }
    if (!bd) { bd = document.createElement("div"); bd.setAttribute("role", "alert"); plan.append(bd); }
    v.className = `alerte-voile ${a0.niv}`; bd.className = `bandeau-al ${a0.niv}`;
    plan.style.setProperty("--al-c", COUL[a0.niv]);
    const nomDe = (e) => { const o = (this._config.ouvertures || []).find((x) => (x.contact || x.entite) === e); return o?.baie || o?.nom || this._nom(e); };
    const html = `<ha-icon icon="${esc(a0.r.icone || NIVEAUX_ALERTE[a0.niv].icone)}"></ha-icon><span class="t"><b>${esc(a0.r.nom || _t("Alerte"))}</b>
      <small>${esc([...new Set(a0.on.map(nomDe))].join(", "))}${l.length > 1 ? _t(" · {n} autre alerte| · {n} autres alertes", { n: l.length - 1 }) : ""}</small></span>
      <button class="ib" data-al="infos" title="${_t("Détails")}" aria-label="${_t("Détails")}"><ha-icon icon="mdi:information-outline"></ha-icon></button>
      <button class="ib" data-al="masquer" title="${_t("Masquer jusqu'au prochain changement")}" aria-label="${_t("Masquer")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (bd._h !== html) { poserHTML(bd, html); bd._h = html; }
    for (const a of l) for (const e of a.on) {
      const els = [...R.querySelectorAll(".zone [data-e]")].filter((x) => x.dataset.e === e && !x.classList.contains("etq") && !x.classList.contains("pers"));
      (this._config.meubles || []).forEach((m, i) => { if (m.entite === e || m.valeur === e) els.push(R.querySelector(`.calque>[data-mbq="${i}"]`)); });
      for (const x of els) if (x && !x.classList.contains("en-alerte")) { x.classList.add("en-alerte"); x.style.setProperty("--al-c", COUL[a.niv]); }
    }
  }
  _actionAlerte(k) {
    const a = this._alertes?.[0];
    if (!a) return;
    if (k === "infos") return this._plusInfos(a.on[0]);
    (this._alertesVues ||= new Set()).add(a.sig);
    this._majAlertes();
  }

  // ---------- replay de la journée (`replay: true` ou {heures}) ----------
  // l'historique de toutes les entités suivies est chargé une fois (attributs pour les volets, le soleil, la météo, les personnes),
  // puis le plan entier (couleurs, ouvertures, volets, lumières, ambiance, personnes, alertes, panneaux) est rendu à l'instant choisi
  async _replayOuvrir() {
    if (this._rp || this._editeur) return;
    const c = this._config, h = borne(+(c.replay?.heures ?? 24) || 24, 1, 72), fin = Math.ceil(Date.now() / 60000) * 60000, debut = fin - h * 3600e3; // calé sur la minute
    const rp = (this._rp = { debut, fin, t: debut, vitesse: vitesseReplay(c.replay), lecture: false, pret: false, series: {}, cache: new Map() });
    this._barreReplay(_t("Chargement de l'historique…"));
    const ents = this._suivies.filter((e) => !e.startsWith("zone.") || e === "zone.home" || e === presenceDefaut(c));
    const avecAttr = ents.filter((e) => /^(cover|sun|weather|person|climate|media_player)\./.test(e)), sans = ents.filter((e) => !avecAttr.includes(e));
    // entités à attributs : réponse complète (sans `minimal_response`, HA ne renverrait les attributs que pour le premier état et
    // écarterait les changements d'attributs seuls : soleil, position d'un volet, personne, vent) ; les autres : états seuls, réponse minimale
    const lire = (l, attrs) => (l.length ? this._hass.callWS({ type: "history/history_during_period", start_time: new Date(debut).toISOString(), end_time: new Date(fin).toISOString(),
      entity_ids: l, minimal_response: !attrs, no_attributes: !attrs, significant_changes_only: !attrs }) : Promise.resolve({}));
    try {
      const [a, b] = await Promise.all([lire(avecAttr, true), lire(sans, false)]);
      if (this._rp !== rp) return;
      for (const [e, l] of Object.entries({ ...b, ...a })) {
        let attrs = {}, prec = null;
        rp.series[e] = (l || []).map((x) => {
          if (x.a) attrs = x.a;
          const lu = (x.lu ?? x.lc ?? 0) * 1000, lc = x.lc != null ? x.lc * 1000 : !prec || prec.s !== x.s ? lu : prec.lc;
          return (prec = { s: x.s, a: attrs, lu, lc });
        });
      }
      rp.pret = true;
      rp.t = fin - Math.min(2, h) * 3600e3; // on démarre 2 h avant maintenant
      this._barreReplay();
      this._rendreReplay();
    } catch (err) {
      if (this._rp === rp) this._barreReplay(_t("Historique indisponible : {msg}", { msg: err?.message || err }));
    }
  }
  _rpEtat(e) {
    const rp = this._rp, l = rp.series[e];
    if (!l?.length) return undefined;
    if (rp.cache.has(e)) return rp.cache.get(e);
    let a = 0, b = l.length - 1, k = -1;
    while (a <= b) { const m = (a + b) >> 1; if (l[m].lu <= rp.t) { k = m; a = m + 1; } else b = m - 1; }
    const x = l[Math.max(0, k)], iso = (t) => new Date(t).toISOString();
    // historique chargé sans attributs (capteurs, lumières…) : nom, unité, classe et icône repris de l'état actuel
    const live = this._hass.states[e]?.attributes || {}, fixes = {};
    for (const n of ATTRS_FIXES) if (live[n] != null) fixes[n] = live[n];
    const v = { entity_id: e, state: x.s, attributes: { ...fixes, ...x.a }, last_changed: iso(x.lc), last_updated: iso(x.lu) };
    rp.cache.set(e, v);
    return v;
  }
  _rendreReplay() {
    const rp = this._rp;
    if (!rp?.pret || this._rpRaf) return;
    this._rpRaf = requestAnimationFrame(() => {
      this._rpRaf = 0;
      if (this._rp !== rp) return;
      rp.cache.clear();
      this._maj();
      this._majBarreReplay();
    });
  }
  _actionReplay(k) {
    const rp = this._rp;
    if (!rp) return;
    if (k === "direct") return this._replayFermer();
    if (k === "lecture" && rp.pret) {
      rp.lecture = !rp.lecture;
      if (rp.lecture && rp.t >= rp.fin) rp.t = rp.debut;
      clearInterval(rp.tm);
      if (rp.lecture) rp.tm = setInterval(() => {
        rp.t = Math.min(rp.fin, rp.t + 100 * rp.vitesse);
        if (rp.t >= rp.fin) { rp.lecture = false; clearInterval(rp.tm); }
        this._rendreReplay();
      }, 100);
      this._majBarreReplay();
    }
  }
  _replayFermer() {
    const rp = this._rp;
    if (!rp) return;
    clearInterval(rp.tm);
    this._rp = null;
    const R = this.shadowRoot;
    R?.querySelector(".plan>.replay")?.remove();
    R?.querySelector(".plan")?.classList.remove("en-replay");
    R?.querySelector('[data-z="replay"]')?.classList.remove("on");
    this._prec = {};
    this._change();
    this._maj();
  }
  // frise : lecture / pause, curseur à la minute près, heure affichée, vitesse, repères (ouvertures, lumières, personnes), retour au direct
  _barreReplay(msg) {
    const R = this.shadowRoot, plan = R.querySelector(".plan"), rp = this._rp;
    let bar = plan.querySelector(":scope>.replay");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "replay";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", _t("Revoir la journée"));
      plan.append(bar);
    }
    plan.classList.add("en-replay");
    R.querySelector('[data-z="replay"]')?.classList.add("on");
    const fermer = `<button class="ib" data-rp="direct" title="${_t("Revenir au direct")}" aria-label="${_t("Revenir au direct")}"><ha-icon icon="mdi:close"></ha-icon></button>`;
    if (msg || !rp.pret) { poserHTML(bar, `<ha-icon icon="mdi:history"></ha-icon><span class="rp-msg">${esc(msg || _t("Chargement…"))}</span>${fermer}`); return; }
    const n = Math.round((rp.fin - rp.debut) / 60000), c = this._config, marques = [];
    const pos = (t) => (((t - rp.debut) / (rp.fin - rp.debut)) * 100).toFixed(2);
    const ajoute = (e, test, cls) => { let p = null; for (const x of rp.series[e] || []) { if (x.lu >= rp.debut && test(x.s) && !(p && test(p.s))) marques.push(`<i class="${cls}" style="left:${pos(x.lu)}%"></i>`); p = x; } };
    for (const o of c.ouvertures || []) if (o.contact || o.entite) ajoute(o.contact || o.entite, (v) => v === "on" || v === "open", "m-ouv");
    for (const p of c.points || []) if ((p.entite || "").startsWith("light.")) ajoute(p.entite, (v) => v === "on", "m-lum");
    // repères d'arrivée : pas pour une personne cachée à la maison comme dehors (elle n'apparaît jamais sur le plan)
    const PP = couchePersonnes(c.ambiance);
    for (const p of this._listePersonnes(c.ambiance)) { const a = affPersonne(PP, p.entite); if (a.dehors !== "cache" || a.chez_soi !== "cache") ajoute(p.entite, (v) => v === "home", "m-pers"); }
    poserHTML(bar, `<button class="ib" data-rp="lecture" title="${_t("Lecture")}" aria-label="${_t("Lecture")}"><ha-icon icon="mdi:play"></ha-icon></button>
      <div class="rp-piste"><div class="rp-marques" aria-hidden="true">${marques.join("")}</div><input type="range" min="0" max="${n}" step="1" aria-label="${_t("Moment de la journée")}"></div>
      <span class="rp-heure"></span>
      <select aria-label="${_t("Vitesse")}">${VITESSES_REPLAY.map(([v, t]) => `<option value="${v}" ${v === rp.vitesse ? "selected" : ""}>${t}</option>`).join("")}</select>${fermer}`);
    const r = bar.querySelector("input");
    r.oninput = () => { rp.t = rp.debut + +r.value * 60000; this._rendreReplay(); };
    r.onpointerdown = () => { rp.tient = true; };
    r.onpointerup = r.onpointercancel = () => { rp.tient = false; };
    bar.querySelector("select").onchange = (ev) => { rp.vitesse = +ev.target.value; };
    this._majBarreReplay();
  }
  _majBarreReplay() {
    const rp = this._rp, bar = this.shadowRoot?.querySelector(".plan>.replay");
    if (!rp?.pret || !bar) return;
    const r = bar.querySelector("input"), h = bar.querySelector(".rp-heure"), b = bar.querySelector('[data-rp="lecture"]');
    if (r && !rp.tient) r.value = String(Math.round((rp.t - rp.debut) / 60000)); // curseur tenu au doigt : on ne le bouscule pas
    const d = new Date(rp.t), auj = new Date().toDateString() === d.toDateString();
    if (h) h.textContent = `${auj ? "" : d.toDateString() === new Date(Date.now() - 864e5).toDateString() ? `${_t("hier")} ` : `${d.toLocaleDateString(_loc(), { day: "2-digit", month: "2-digit" })} `}${d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" })}`;
    if (b) { b.querySelector("ha-icon").setAttribute("icon", rp.lecture ? "mdi:pause" : "mdi:play"); b.title = rp.lecture ? _t("Pause") : _t("Lecture"); b.setAttribute("aria-label", b.title); }
  }

  // ---------- vitrine : exemples d'animations et d'ambiance sous le plan ----------
  _vitrine(pct, xy) {
    const c = this._config, g = geoVitrine(c, this.bornes(true)), fixe = this._sansBoucles();
    const nuage = (id) => `<radialGradient id="${id}"><stop offset="0" style="stop-color:var(--md-on-surface)" stop-opacity=".9"/><stop offset=".6" style="stop-color:var(--md-on-surface)" stop-opacity=".4"/><stop offset="1" style="stop-color:var(--md-on-surface)" stop-opacity="0"/></radialGradient>`;
    let svg = `<g class="vitrine" aria-hidden="true"><defs><linearGradient id="vit-dore"><stop offset="0" stop-color="#ffb74d" stop-opacity=".75"/><stop offset="1" stop-color="#ffb74d" stop-opacity="0"/></linearGradient></defs>
      <rect class="vit-fond" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.H}" rx="${(g.th * 0.4).toFixed(0)}"/>`, html = "";
    const etq = (x, y, t, cls = "") => { html += `<span class="txt vit${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])}">${esc(t)}</span>`; };
    const pt = (x, y, cls, style, ic) => { html += `<span class="pt vit-pt ${cls}" ${xy([+x.toFixed(1), +y.toFixed(1)])} style="${pct([x, y])};${style}"><ha-icon icon="${ic}"></ha-icon></span>`; };
    const cx0 = g.x + g.w / 2;
    // 1. animations : fenêtre ouverte et pastille active, pour chaque type
    let y = g.y + g.th;
    etq(cx0, g.y + g.th * 0.55, _t("Animations (fenêtre ouverte, pastille active)"), " titre-v");
    Object.keys(ANIMATIONS).forEach((t, k) => {
      const cx = g.x + g.ca * (k + 0.5), y1 = y + g.ha * 0.16, a = { type: t, duree: t === "defilement" ? 0.8 : 1.6 }, dx = g.ca * 0.32;
      svg += `<g class="ouv fenetre ouvert${classeAnim(a)}" style="${styleAnim(a)}"><path class="cible" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/><path class="trait" d="M${(cx - dx).toFixed(0)} ${y1.toFixed(0)}L${(cx + dx).toFixed(0)} ${y1.toFixed(0)}"/></g>`;
      pt(cx, y + g.ha * 0.52, `actif${classeAnim(a)}`, `--pt-couleur:#f6c445;${styleAnim(a)}`, "mdi:lightbulb-on-outline");
      etq(cx, y + g.ha * 0.88, _t(ANIMATIONS[t]).split(" (")[0]);
    });
    // 2. météo : un carré d'extérieur par temps
    y += g.ha + g.th;
    etq(cx0, y - g.th * 0.45, _t("Météo sur les extérieurs"), " titre-v");
    const carre = (k, rangee) => { const x = g.x + g.cm * k + g.cm * 0.06, w = g.cm * 0.88; return { x, w, b: { x0: x, y0: rangee, W: w, H: g.hm } }; };
    VITRINE_METEO.forEach(([cond, nom], k) => {
      const { x, w, b } = carre(k, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`;
      svg += `<defs>${nuage(`vit${k}-nuage`)}<clipPath id="vit-c${k}"><rect ${r}/></clipPath></defs><g clip-path="url(#vit-c${k})"><rect class="vit-dehors" ${r}/>
        ${dessinMeteo({ state: cond, attributes: { wind_speed: cond === "windy" ? 40 : 15, wind_bearing: 300, wind_speed_unit: "km/h", cloud_coverage: cond === "partlycloudy" ? 100 : undefined } }, b, 0, 1.6, fixe, `vit${k}`, borne(g.cm / 300, 0.3, 1))}</g>`;
      etq(x + w / 2, y + g.hm + g.th * 0.45, _t(nom));
    });
    // 3. ambiance : nuit, soleil bas, trace, flux d'énergie, alerte, personne dehors
    y += g.hm + g.th * 1.4;
    etq(cx0, y - g.th * 0.45, _t("Ambiance"), " titre-v");
    // personne dehors : comme la réglera le plan (direction et distance, ou zone) ; absente de la vitrine si les personnes dehors sont cachées
    const ap = affPersonne(couchePersonnes(c.ambiance), "");
    VITRINE_AMB.filter(([t]) => t !== "personne" || ap.dehors !== "cache").forEach(([t, nom], k) => {
      const { x, w } = carre(k + 1, y), r = `x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${g.hm.toFixed(0)}" rx="8"`, mx = x + w / 2, my = y + g.hm / 2;
      svg += `<rect class="vit-dehors" ${r}/>`;
      if (t === "nuit") svg += `<rect ${r} fill="#0b1d4d" opacity=".55"/>`;
      if (t === "dore") svg += `<rect ${r} fill="url(#vit-dore)" opacity=".8"/>`;
      if (t === "trace") pt(mx, my, "trace", "--t:.85", "mdi:door-open");
      if (t === "flux") svg += `<circle cx="${(x + w * 0.15).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/><circle cx="${(x + w * 0.85).toFixed(0)}" cy="${my.toFixed(0)}" r="${(g.hm * 0.06).toFixed(1)}" style="fill:#fbc02d"/>`
        + dessinFlux([{ de: [x + w * 0.15, my], vers: [x + w * 0.85, my], w: 900, col: "#fbc02d" }], g.hm * 0.035, fixe);
      if (t === "alerte") pt(mx, my, "en-alerte", "--al-c:var(--md-error)", "mdi:alarm-light");
      if (t === "personne") html += `<span class="pers dehors vit-pt" ${xy([+mx.toFixed(1), +my.toFixed(1)])} style="${pct([mx, my])}"><span class="av">A</span><small>${ap.dehors === "zone" ? _t("Absent") : "12 km"}</small></span>`;
      etq(mx, y + g.hm + g.th * 0.45, _t(nom));
    });
    return { svg: `${svg}</g>`, html };
  }

  // traces : les éléments qui viennent de changer gardent un liseré qui s'estompe sur `traces` minutes (10 par défaut) ;
  // capteurs numériques exclus (ils changent sans cesse) ; un redémarrage de HA (beaucoup d'entités changées ensemble) est ignoré
  _majTraces() {
    const R = this.shadowRoot, c = this._config, tr = !this._editeur && coucheTraces(c.ambiance);
    if (!R) return;
    if (!tr) { R.querySelectorAll(".zone .trace:not(.vit-pt)").forEach((e) => { e.classList.remove("trace"); e.style.removeProperty("--t"); }); return; }
    const l = [];
    (c.ouvertures || []).forEach((o, i) => l.push([R.querySelector(`.zone svg [data-o="${i}"]`), o.contact || o.entite || o.volet]));
    (c.points || []).forEach((p, i) => l.push([R.querySelector(`.calque>[data-q="${i}"]`), p.entite]));
    (c.meubles || []).forEach((m, i) => l.push([R.querySelector(`.calque>[data-mbq="${i}"]`), m.entite]));
    const t = l.map(([el, e]) => { const s = el && typeof e === "string" && !/^(sensor|weather|sun|zone)\./.test(e) ? this._etat(e) : null; return s && !["unavailable", "unknown"].includes(s.state) ? Date.parse(s.last_changed) : NaN; });
    const paquets = {}, ok = t.filter((x) => !isNaN(x));
    for (const x of ok) paquets[Math.round(x / 10000)] = (paquets[Math.round(x / 10000)] || 0) + 1;
    const seuil = Math.max(5, ok.length * 0.4), maint = this._maintenant(), d = tr.duree * 60000;
    l.forEach(([el], j) => {
      if (!el) return;
      const age = Math.max(0, maint - t[j]), oui = !isNaN(t[j]) && maint - t[j] > -60000 && age < d && paquets[Math.round(t[j] / 10000)] < seuil;
      el.classList.toggle("trace", oui);
      if (oui) el.style.setProperty("--t", (1 - age / d).toFixed(3)); else el.style.removeProperty("--t");
    });
  }

  // thème sombre : fond de la carte peu lumineux (sinon, carte transparente : réglage sombre de HA)
  _sombre() {
    const t = getComputedStyle(this.shadowRoot.querySelector("ha-card")).backgroundColor, c = t.match(/[\d.]+/g)?.map(Number), k = t.startsWith("color(") ? 1 : 255;
    if (!c || c.length < 3 || c[3] === 0) return !!this._hass?.themes?.darkMode;
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / k < 0.4;
  }

  // jour / nuit : teinte bleu nuit selon la hauteur du soleil (plus forte sur les extérieurs), lumière venant du côté du soleil
  // (azimut + `nord`), plus chaude au lever et au coucher ; repère du soleil au bord du plan ; météo redessinée quand elle change
  _majAmbiance() {
    const R = this.shadowRoot, A = this._config.ambiance, g = R?.querySelector(".zone svg .amb");
    if (!A || !g) return;
    const I = intensiteAmb(A), b = this._box, nord = +A.nord || 0, jn = coucheJour(A);
    const so = jn && this._etat(jn.soleil || "sun.sun"), e = so ? parseFloat(so.attributes.elevation) : NaN, az = so ? parseFloat(so.attributes.azimuth) : NaN;
    const Ij = I * borne(+(jn?.intensite ?? 1), 0, 2), nuit = isNaN(e) ? 0 : borne((2 - e) / 14, 0, 1), dore = isNaN(e) || e < -4 ? 0 : Math.max(0, 1 - Math.abs(e - 3) / 9);
    const op = (sel, v) => g.querySelector(sel)?.setAttribute("opacity", v.toFixed(3));
    // thème sombre : le bleu nuit sur un fond déjà sombre ne se voit presque pas en « discret » ; on le renforce (normal et fort inchangés)
    const In = I > 0 && I < INTENSITES.normal && this._sombre() ? Math.min(INTENSITES.normal * 1.5, I * 2.3) / I : 1;
    op(".amb-ni", Ij * In * nuit * 0.22); op(".amb-ne", Ij * In * nuit * 0.5);
    const cx = b.x0 + b.W / 2, cy = b.y0 + b.H / 2, f = ((az + nord) * Math.PI) / 180, ux = Math.sin(f), uy = -Math.cos(f);
    const lg = g.querySelector("#amb-g"), astre = R.querySelector(".calque>.amb-astre"), jour = !isNaN(az) && e > 0;
    if (lg && jour) {
      const rr = Math.max(b.W, b.H) / 2;
      [["x1", cx + ux * rr], ["y1", cy + uy * rr], ["x2", cx - ux * rr * 0.3], ["y2", cy - uy * rr * 0.3]].forEach(([k, v]) => lg.setAttribute(k, v.toFixed(0)));
      const col = dore > 0.5 ? "#ffb74d" : "#fff59d";
      lg.querySelectorAll("stop").forEach((st) => st.setAttribute("stop-color", col));
    }
    op(".amb-sol", jour ? Ij * (0.18 + 0.32 * dore) : 0);
    if (astre) {
      astre.hidden = !jour;
      if (jour) {
        // au bord du plan, dans la direction du soleil (2,5 % de marge)
        const k = Math.min(Math.abs(ux) > 1e-6 ? 0.475 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? 0.475 / Math.abs(uy) : Infinity);
        astre.style.left = `${(50 + ux * k * 100).toFixed(2)}%`; astre.style.top = `${(50 + uy * k * 100).toFixed(2)}%`;
        const hm = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleTimeString(_loc(), { hour: "2-digit", minute: "2-digit" }) : "?"; };
        astre.title = _t("Soleil : hauteur {h}°, azimut {az}° · coucher {coucher}", { h: Math.round(e), az: Math.round(az), coucher: hm(so.attributes.next_setting) });
      }
    }
    const me = coucheMeteo(A), w = me && this._etat(me.entite), zm = g.querySelector(".amb-meteo");
    const cle = w && zm ? [w.state, w.attributes.cloud_coverage, Math.round(+w.attributes.wind_speed || 0), Math.round((+w.attributes.wind_bearing || 0) / 10)].join("|") : "";
    if (zm && cle !== this._meteoCle) { this._meteoCle = cle; poserHTML(zm, w ? dessinMeteo(w, b, nord, I * borne(+(me.intensite ?? 1), 0, 2), this._sansBoucles(), "amb", 1, me.sens ?? 135) : ""); }
    // nuages : quasi invisibles la nuit (sinon, clairs sur fond sombre, on les prendrait pour des halos de lumière)
    zm?.querySelectorAll(".m-nuages").forEach((n) => { n.style.opacity = (+n.dataset.op * (1 - 0.85 * nuit)).toFixed(3); });
  }
}

// ancien nom (plan-maison-card) : brouillons, versions et calques repris une fois sous le nouveau préfixe
for (const st of [() => localStorage, () => sessionStorage]) {
  try {
    const s = st();
    for (const k of Object.keys(s)) if (k.startsWith("plan-maison-") && k !== "plan-maison-demo") {
      const n = "maquette-" + k.slice(12);
      if (s.getItem(n) == null) s.setItem(n, s.getItem(k));
      s.removeItem(k);
    }
  } catch (e) { /* stockage indisponible */ }
}
// versions précédentes gardées par l'éditeur (copies de la carte du dashboard) : celles d'avant les clés anglaises sont converties une fois
try {
  for (const k of Object.keys(localStorage)) if (k.startsWith("maquette-versions:")) {
    const l = JSON.parse(localStorage.getItem(k) || "[]");
    if (Array.isArray(l) && l.some((v) => v && typeof v === "object" && !v.en))
      localStorage.setItem(k, JSON.stringify(l.map((v) => (v && typeof v === "object" && !v.en ? { ...v, config: versAnglais(v.config), en: 1 } : v))));
  }
} catch (e) { /* stockage indisponible ou illisible */ }

console.info(`%c MAQUETTE %c ${VERSION} `, "color:#fff;background:#1a73e8;font-weight:700", "color:#1a73e8;background:#fff");
// une page restée ouverte pendant une mise à jour garde l'ancienne définition : il faut recharger la page
const DEPOT = "https://github.com/TooMuhtsh/maquette-card";
class MaquetteCardDemo extends MaquetteCard {
  setConfig(c) { super.setConfig({ ...(c || {}), demo: true }); }
  static getStubConfig() { return {}; }
}
// les anciens noms restent des alias : une sous-classe, car un même constructeur ne peut être défini deux fois
for (const [nom, C] of [["maquette-card", MaquetteCard], ["maquette-card-demo", MaquetteCardDemo],
  ["plan-maison-card", class extends MaquetteCard {}], ["plan-maison-card-demo", class extends MaquetteCardDemo {}]]) {
  if (!customElements.get(nom)) customElements.define(nom, C);
}
window.customCards = window.customCards || [];
for (const c of [{ type: "maquette-card", name: "Maquette", description: _t("Plan interactif en direct (ouvertures, volets, lumières, températures), avec éditeur intégré.") },
  // la même carte en démo : choisie dans le sélecteur de cartes, elle montre l'appartement de démonstration
  { type: "maquette-card-demo", name: _t("Maquette — démo"), description: _t("Un appartement de démonstration aux états simulés : toutes les fonctions sans rien configurer, sans rien commander.") }]) {
  if (!window.customCards.some((x) => x.type === c.type)) window.customCards.push({ ...c, documentationURL: DEPOT });
}
// dashboards « Maquette » (vierge) et « Maquette — démo » dans « Ajouter un tableau de bord » ;
// le plan vierge porte un id : l'éditeur reprend la main sur le dashboard (vues explicites) au premier enregistrement
const vuePlan = (demo) => ({ title: demo ? _t("Démo") : _t("Plan"), path: "plan", icon: "mdi:floor-plan", type: "panel",
  cards: [versAnglais(demo ? { type: "custom:maquette-card", demo: true } : { type: "custom:maquette-card", id: "plan", titre: _t("Ma maison") })] });
for (const [t, demo] of [["maquette", false], ["maquette-demo", true], ["plan-maison", false], ["plan-maison-demo", true]]) {
  if (!customElements.get(`ll-strategy-dashboard-${t}`)) customElements.define(`ll-strategy-dashboard-${t}`, class extends HTMLElement {
    static async generate(config, hass) {
      if (hass) globalThis.MaquetteI18n.definir(hass);
      return { title: demo ? _t("Maquette (démo)") : _t("Maison"), views: [vuePlan(demo)] };
    }
  });
}
window.customStrategies = window.customStrategies || [];
for (const [t, n, d] of [["maquette", "Maquette", _t("Un plan vierge à dessiner avec l'éditeur intégré (pièces de Home Assistant, import, dessin).")],
  ["maquette-demo", _t("Maquette — démo"), _t("L'appartement de démonstration : animations, météo, replay, alertes… avec des états simulés.")]]) {
  if (!window.customStrategies.some((x) => x.type === t)) window.customStrategies.push({ type: t, strategyType: "dashboard", name: n, description: d, documentationURL: DEPOT });
}
