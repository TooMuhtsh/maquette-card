// statistiques, historique et courbes des widgets — morceau de src/maquette-card.js, recollé par build.mjs (ordre : src/assemblage.mjs) // @assemblage
class MaquetteCard extends HTMLElement { // @assemblage
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

} // @assemblage
