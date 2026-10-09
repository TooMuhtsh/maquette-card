// CSS : traces, ambiance, infos, replay, résumé, personnes, alertes, vitrine, bulles, niveau d'animation — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
void ` // @assemblage
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
