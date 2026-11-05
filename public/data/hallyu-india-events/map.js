/* Hallyu Events in India: the map instrument.
   One module for the register's standalone page and the website. Leaflet (and Leaflet.markercluster,
   when the page loaded it) is passed in rather than imported, so each page can load it as it likes.
   Everything drawn here carries an hm- class and is styled by map.css; the data comes from
   events.geojson (mapped occurrences) and events_unmapped.json (online or unplaced ones).

   createHallyuMap(L, root, {
     data, unmapped        file paths (default: next to the page)
     scrollWheel           zoom with the wheel without first focusing the map (default false)
     url                   keep the filters and the selected record in the query string (default true)
     links                 { gaps, data } for the legend's two "read more" links
   }) -> { map, setState, getState, select }                                                        */

const Y0 = 2012, Y1 = 2025;
const DOMAINS = [
  ['kpop', 'K-pop'], ['kdrama', 'K-drama'], ['film', 'Film'], ['kmusic_other', 'Other Korean music'],
  ['multi', 'Mixed programme'], ['non_pop_culture', 'Not pop culture: language, taekwondo, exhibitions, talks'],
];
const DEFAULT_DOMAINS = DOMAINS.map((d) => d[0]).filter((d) => d !== 'non_pop_culture');
const GRADES = [
  ['A', 'A', 'confirmed after the event by a source outside the Korean mission'],
  ['B', 'B', "the organiser's own record after the event, and nothing independent"],
  ['C', 'C', 'an announcement only; nothing says it took place'],
];
const STATUSES = [['occurred', 'occurred'], ['announced_only', 'announced only'], ['cancelled', 'cancelled'], ['postponed', 'postponed'], ['unknown', 'unknown']];
const WHO = [
  ['all', 'Everyone'],
  ['mission', 'Run by the Korean mission', 'KCCI, the Embassy or a consulate as organiser or co-organiser'],
  ['commercial', 'Ticketed concerts and fan meetings', 'no mission actor in any role'],
  ['other', 'Other organisers', 'fan collectives, universities, companies, NGOs without the mission'],
];
const CHANNEL = { kcci: 'Korean Cultural Centre', mofa: 'Embassy', kofice: 'KOFICE correspondent', press: 'press', setlist: 'setlist.fm', university: 'university', social: 'social media', other: 'other' };
const TYPE = {
  contest_round: 'contest round', contest_final: 'contest final', fan_meeting: 'fan meeting', fan_gathering: 'fan gathering',
  screening_or_film_festival: 'screening or film festival', workshop_or_class: 'workshop or class', lecture_or_talk: 'lecture or talk',
  competition_other: 'other competition', culture_festival: 'culture festival',
};
const INDIA = [[6.5, 68.0], [37.3, 97.5]];   // the extent of India as the base map draws it
const FRAME = [[-14, 38], [52, 122]];         // the extent of the drawn base map (basemap.json "frame")
const NEIGHBOURS = new Set(['PAK', 'CHN', 'NPL', 'BTN', 'BGD', 'MMR', 'LKA', 'AFG']);
const COUNTRY_SHORT = { "People's Republic of China": 'China', 'United Arab Emirates': 'UAE' };
const DEFAULTS = () => ({ y0: Y0, y1: Y1, pre: false, add: false, domain: new Set(DEFAULT_DOMAINS), grade: new Set(['A', 'B', 'C']), status: new Set(['occurred', 'announced_only']), who: 'all', id: '' });

const ICON = {
  filters: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M4 8h8M6 12h4"/></svg>',
  legend: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="4.5" r="1.6"/><circle cx="4" cy="11.5" r="1.6"/><path d="M8 4.5h6M8 11.5h6"/></svg>',
  find: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.3"/><path d="M10.3 10.3L14 14"/></svg>',
  list: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 8h12M2 12.5h12"/></svg>',
  reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7"/><path d="M3 2.8v3h3"/></svg>',
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const typeLabel = (t) => TYPE[t] || t.replace(/_/g, ' ');
const domainLabel = (d) => (DOMAINS.find((x) => x[0] === d) || [d, d])[1];
const placeOf = (p) => p.mode === 'online' || p.city === 'online' ? 'online' : p.state && p.state !== p.city ? `${p.city}, ${p.state}` : p.city;
const sortKey = (p) => `${p.date_start || ''}|${p.occurrence_id}`;

export function createHallyuMap(L, root, opts = {}) {
  const O = { data: 'events.geojson', unmapped: 'events_unmapped.json', basemap: 'basemap.json', scrollWheel: false, url: true, links: {}, ...opts };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uid = `hm${Math.floor(Math.random() * 1e6)}`;
  const id = (s) => `${uid}-${s}`;
  const state = DEFAULTS();
  let feats = [], unmapped = [], all = [], cluster, markers = new Map(), listOpen = false, listLimit = 120, selectedId = '';

  // ---------- markup ----------
  root.classList.add('hm');
  root.innerHTML = '';
  const stage = h('<div class="hm-stage"></div>');
  const mapEl = h(`<div class="hm-map" id="${id('map')}" aria-label="Map of documented Hallyu events in India. The list below the map gives the same records in reading order."></div>`);
  const notice = h('<div class="hm-notice" role="status"><p>Loading the register…</p></div>');
  const toolbar = h('<div class="hm-toolbar"></div>');
  const pill = (key, label, aria) => h(`<button type="button" class="hm-pill" data-panel="${key}" aria-expanded="false" aria-controls="${id('p-' + key)}"${aria ? ` aria-label="${aria}"` : ''}>${ICON[key]}<span>${label}</span><span class="hm-n" hidden></span></button>`);
  const pills = { filters: pill('filters', 'Filters'), legend: pill('legend', 'Legend'), find: pill('find', 'Find a place'), list: pill('list', 'List') };
  const resetPill = h(`<button type="button" class="hm-pill hm-pill--ghost" hidden>${ICON.reset}<span>Reset</span></button>`);
  Object.values(pills).forEach((b) => toolbar.appendChild(b));
  toolbar.appendChild(resetPill);
  const panels = {
    filters: h(`<section class="hm-panel" id="${id('p-filters')}" aria-label="Filters" hidden></section>`),
    legend: h(`<section class="hm-panel" id="${id('p-legend')}" aria-label="Legend" hidden></section>`),
    find: h(`<section class="hm-panel hm-find" id="${id('p-find')}" aria-label="Find a place or a record" hidden></section>`),
  };
  stage.append(mapEl, notice, toolbar, panels.filters, panels.legend, panels.find);
  const timeline = h('<div class="hm-timeline"></div>');
  const status = h('<p class="hm-status" aria-live="polite"></p>');
  const list = h(`<section class="hm-list" id="${id('p-list')}" aria-label="Records matching the current filters" hidden></section>`);
  root.append(stage, timeline, status, list);

  // ---------- the map ----------
  const map = L.map(mapEl, {
    scrollWheelZoom: !!O.scrollWheel, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced,
    minZoom: 3, maxZoom: 13, zoomSnap: 0.5, zoomControl: false, attributionControl: true, worldCopyJump: false,
    maxBounds: FRAME, maxBoundsViscosity: 0.8,
  });
  // the view can never be wider than the drawn frame, so no edge of the drawing is ever seen
  const fitMinZoom = () => map.setMinZoom(Math.max(3, map.getBoundsZoom(FRAME, true)));
  fitMinZoom();
  map.on('resize', fitMinZoom);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  map.attributionControl.addAttribution('Boundaries: <a href="https://www.naturalearthdata.com/">Natural Earth</a>, India point of view');
  L.control.zoom({ position: 'topright' }).addTo(map);

  // The base map is drawn, not tiled: country polygons and India's state lines from Natural Earth's
  // India point-of-view release (basemap.json, built by src/build_basemap.py), which draws India's
  // international boundary as India represents it. No tile server is contacted, and the map has no
  // street level: the register's places are cities and venues, and the marks carry the colour.
  // The land is drawn in Leaflet's own overlay pane (below the markers, added before the cluster
  // legs), because Leaflet guards that pane's SVG against page-wide `svg { max-width }` rules.
  map.createPane('hm-labels'); map.getPane('hm-labels').style.zIndex = 450; map.getPane('hm-labels').style.pointerEvents = 'none';
  const labelLayer = L.layerGroup().addTo(map);
  const labels = [];
  function drawBasemap(bm) {
    L.geoJSON(bm.countries, { interactive: false, style: (f) => ({ className: f.properties.india ? 'hm-land hm-land--in' : 'hm-land', weight: 1 }) }).addTo(map);
    L.geoJSON(bm.states, { interactive: false, style: (f) => ({ className: f.properties.india ? 'hm-state hm-state--in' : 'hm-state', weight: 1 }) }).addTo(map);
    bm.countries.features.filter((f) => f.properties.label && (NEIGHBOURS.has(f.properties.iso3) || f.properties.area >= 8)).forEach((f) => {
      labels.push({ latlng: f.properties.label, kind: 'country', near: NEIGHBOURS.has(f.properties.iso3), html: `<span class="hm-lbl hm-lbl--country">${esc(COUNTRY_SHORT[f.properties.name] || f.properties.name)}</span>` });
    });
  }
  function buildLabels() {
    const cities = new Map();
    feats.forEach((p) => { const c = cities.get(p.city) || { n: 0, lat: 0, lon: 0 }; c.n++; c.lat += p._latlng[0]; c.lon += p._latlng[1]; cities.set(p.city, c); });
    cities.forEach((c, name) => labels.push({ latlng: [c.lat / c.n, c.lon / c.n], kind: 'city', n: c.n, html: `<span class="hm-lbl hm-lbl--city">${esc(name)}</span>` }));
    labels.forEach((l) => { l.marker = L.marker(l.latlng, { icon: L.divIcon({ html: l.html, className: 'hm-lblw', iconSize: [0, 0], iconAnchor: [0, 0] }), pane: 'hm-labels', interactive: false, keyboard: false }); });
    map.on('zoomend', updateLabels);
    updateLabels();
  }
  function updateLabels() {                           // the busiest cities are named at every zoom, the rest as the map closes in
    const z = map.getZoom();
    labels.forEach((l) => {
      const show = l.kind === 'country' ? (l.near ? z <= 7 : z <= 5.5) : (l.n >= 15 || (l.n >= 5 && z >= 6.5) || z >= 8);
      if (show && !labelLayer.hasLayer(l.marker)) labelLayer.addLayer(l.marker);
      if (!show && labelLayer.hasLayer(l.marker)) labelLayer.removeLayer(l.marker);
    });
  }
  // The home view is set once the container has a size: a map initialised in a hidden or
  // still-empty panel would otherwise compute its zoom from a zero-size box and draw nothing.
  const sized = () => mapEl.clientWidth > 0 && mapEl.clientHeight > 0;
  const home = () => { map.invalidateSize(); fitMinZoom(); if (!selectedId) map.fitBounds(INDIA, { padding: [8, 8] }); };
  if (sized()) home();
  else if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (sized()) { home(); ro.disconnect(); } }); ro.observe(mapEl); }
  else map.fitBounds(INDIA, { padding: [8, 8] });
  if (!O.scrollWheel) {                                 // the wheel scrolls the page until the map has focus
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
  }
  const SIZE = { s: 30, m: 38, l: 46 };
  cluster = L.markerClusterGroup
    ? L.markerClusterGroup({
      showCoverageOnHover: false, maxClusterRadius: 34, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 12,
      animate: !reduced, animateAddingMarkers: false, chunkedLoading: true, removeOutsideVisibleBounds: true,
      spiderLegPolylineOptions: { weight: 1, className: 'hm-leg' },
      iconCreateFunction: (c) => {
        const n = c.getChildCount(), s = n < 10 ? 's' : n < 100 ? 'm' : 'l';
        return L.divIcon({ html: `<span class="hm-cl hm-cl--${s}">${n}</span>`, className: 'hm-clw', iconSize: [SIZE[s], SIZE[s]] });
      },
    })
    : L.layerGroup();
  cluster.addTo(map);
  map.on('click', () => closePanels());

  // ---------- panels ----------
  const chip = (group, value, label, checked, swatch = '') => {
    const el = h(`<label class="hm-chip${checked ? ' is-on' : ''}"><input type="checkbox" name="${id(group)}" value="${esc(value)}" autocomplete="off"${checked ? ' checked' : ''}>${swatch}<span>${esc(label)}</span></label>`);
    const input = el.querySelector('input');
    input.defaultChecked = checked;
    input.addEventListener('change', () => { el.classList.toggle('is-on', input.checked); state[group][input.checked ? 'add' : 'delete'](value); render(); });
    return el;
  };
  const sw = (cls) => `<span class="hm-sw hm-mk ${cls}" aria-hidden="true"></span>`;

  function buildFilters() {
    const P = panels.filters;
    P.innerHTML = '<h3>Filters</h3>';
    const who = h('<div class="hm-group" role="radiogroup"><span class="hm-group-label">Who ran it</span></div>');
    WHO.forEach(([v, lab, sub]) => {
      const r = h(`<label class="hm-radio"><input type="radio" name="${id('who')}" value="${v}" autocomplete="off"${state.who === v ? ' checked' : ''}><span>${esc(lab)}${sub ? ` <span class="hm-note">· ${esc(sub)}</span>` : ''}</span></label>`);
      r.querySelector('input').addEventListener('change', (e) => { if (e.target.checked) { state.who = v; render(); } });
      who.appendChild(r);
    });
    const dom = h('<div class="hm-group"><span class="hm-group-label">Domain</span></div>');
    DOMAINS.forEach(([v, lab]) => dom.appendChild(chip('domain', v, lab, state.domain.has(v))));
    const gr = h('<div class="hm-group"><span class="hm-group-label">Evidence grade</span></div>');
    GRADES.forEach(([v, lab]) => gr.appendChild(chip('grade', v, `Grade ${lab}`, state.grade.has(v), sw(`hm-mk--${v}`))));
    gr.appendChild(h(`<p class="hm-note">${GRADES.map(([v, , d]) => `<b>${v}</b> ${esc(d)}`).join(' · ')}.</p>`));
    const st = h('<div class="hm-group"><span class="hm-group-label">Status</span></div>');
    STATUSES.forEach(([v, lab]) => { if (all.some((p) => p.status === v)) st.appendChild(chip('status', v, lab, state.status.has(v))); });
    const foot = h('<div class="hm-group"><button type="button" class="hm-linklike">Reset all filters</button></div>');
    foot.querySelector('button').addEventListener('click', () => reset());
    P.append(who, dom, gr, st, foot);
  }

  function buildLegend() {
    const P = panels.legend;
    const gaps = O.links.gaps ? ` <a href="${esc(O.links.gaps)}">What the register cannot show.</a>` : '';
    const data = O.links.data ? ` <a href="${esc(O.links.data)}">Method and data.</a>` : '';
    P.innerHTML = `<h3>Reading the map</h3>
      <div class="hm-key">
        ${sw('hm-mk--A')}<span><b>Grade A</b>: confirmed after the event by a source outside the Korean mission</span>
        ${sw('hm-mk--B')}<span><b>Grade B</b>: the organiser's own record after the event</span>
        ${sw('hm-mk--C')}<span><b>Grade C</b>: announced, never confirmed</span>
        ${sw('hm-mk--A hm-mk--venue')}<span><b>Square</b>: the venue is known and geocoded</span>
        ${sw('hm-mk--A')}<span><b>Circle</b>: no venue recorded; placed near the city centre, offset so that records do not hide each other</span>
        <span class="hm-sw hm-cl" aria-hidden="true">12</span><span><b>Number</b>: that many records close together; select it to open them</span>
      </div>
      <p>Each mark is one documented occurrence, as one of four channels recorded it: a round of a contest, a screening, a concert, a workshop. Where nothing was documented, nothing is drawn.</p>
      <p class="hm-note">Online events (most of 2020–2022) have no point and are in the list. Records before 2012 and the 2026 addendum are off by default. The boundaries follow Natural Earth's India point-of-view release, which draws India's international boundary as India represents it.${gaps}${data}</p>`;
  }

  function buildFind() {
    const P = panels.find;
    P.innerHTML = `<h3>Find a place or a record</h3>
      <label class="hm-vh" for="${id('q')}">City, state or words from a title</label>
      <input type="search" id="${id('q')}" placeholder="City, state or words from a title" autocomplete="off" spellcheck="false">
      <ul role="listbox" aria-label="Matches" id="${id('q-list')}"></ul>`;
    const input = P.querySelector('input'), ul = P.querySelector('ul');
    const run = () => {
      const q = input.value.trim().toLowerCase();
      ul.innerHTML = '';
      if (q.length < 2) return;
      const sel = all.filter(matches);
      const cities = new Map();
      sel.forEach((p) => {
        if (!p._latlng) return;
        const key = p.city;
        if (!(`${p.city} ${p.state}`.toLowerCase().includes(q))) return;
        const c = cities.get(key) || { city: p.city, state: p.state, n: 0, lat: 0, lon: 0 };
        c.n++; c.lat += p._latlng[0]; c.lon += p._latlng[1]; cities.set(key, c);
      });
      const cityRows = [...cities.values()].sort((a, b) => b.n - a.n).slice(0, 6);
      const recRows = sel.filter((p) => p.title_en.toLowerCase().includes(q)).sort((a, b) => sortKey(a) < sortKey(b) ? -1 : 1).slice(0, 8);
      cityRows.forEach((c) => {
        const li = h(`<li role="option"><button type="button" class="hm-opt"><span><span class="hm-opt-kind">Place</span>${esc(c.city)}${c.state && c.state !== c.city ? `, ${esc(c.state)}` : ''}</span><span class="hm-opt-sub">${c.n} record${c.n === 1 ? '' : 's'}</span></button></li>`);
        li.querySelector('button').addEventListener('click', () => { goTo([c.lat / c.n, c.lon / c.n], 11); closePanels(); });
        ul.appendChild(li);
      });
      recRows.forEach((p) => {
        const li = h(`<li role="option"><button type="button" class="hm-opt"><span><span class="hm-opt-kind">Record · ${esc(p.date_edtf)}</span>${esc(p.title_en)}</span><span class="hm-opt-sub">${esc(placeOf(p))}</span></button></li>`);
        li.querySelector('button').addEventListener('click', () => { closePanels(); select(p.occurrence_id); });
        ul.appendChild(li);
      });
      if (!ul.children.length) ul.appendChild(h('<li class="hm-note" style="padding:8px">Nothing matches within the current filters.</li>'));
    };
    input.addEventListener('input', run);
    P.addEventListener('keydown', (e) => {
      const opts = [...ul.querySelectorAll('button')];
      const i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (opts[i + 1] || opts[0])?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? opts[i - 1] : input).focus(); }
    });
  }

  function openPanel(key) {
    Object.entries(panels).forEach(([k, p]) => { const on = k === key && p.hidden; p.hidden = !on; pills[k].setAttribute('aria-expanded', String(on)); });
    if (key === 'find' && !panels.find.hidden) panels.find.querySelector('input').focus();
  }
  function closePanels() { Object.entries(panels).forEach(([k, p]) => { p.hidden = true; pills[k].setAttribute('aria-expanded', 'false'); }); }
  Object.entries(pills).forEach(([k, b]) => b.addEventListener('click', () => {
    if (k === 'list') { listOpen = !listOpen; list.hidden = !listOpen; b.setAttribute('aria-expanded', String(listOpen)); renderList(); if (listOpen) list.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); return; }
    openPanel(k);
  }));
  pills.list.setAttribute('aria-controls', id('p-list'));
  resetPill.addEventListener('click', () => reset());
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePanels(); } });

  // ---------- timeline ----------
  const tl = { bars: [], nums: [] };
  function buildTimeline() {
    timeline.innerHTML = `<div class="hm-tl-head"><span class="hm-tl-title">Years</span><span class="hm-tl-read" id="${id('read')}"></span><span class="hm-tl-extra"></span></div>
      <ul class="hm-bars" aria-label="Records per year; select a year to show it alone"></ul>
      <ul class="hm-labels" aria-hidden="true"></ul>
      <div class="hm-range"><div class="hm-range-track"></div><div class="hm-range-sel"></div>
        <label class="hm-vh" for="${id('r0')}">From year</label><input type="range" id="${id('r0')}" min="${Y0}" max="${Y1}" step="1" value="${state.y0}" autocomplete="off">
        <label class="hm-vh" for="${id('r1')}">To year</label><input type="range" id="${id('r1')}" min="${Y0}" max="${Y1}" step="1" value="${state.y1}" autocomplete="off"></div>`;
    const bars = timeline.querySelector('.hm-bars'), labels = timeline.querySelector('.hm-labels');
    for (let y = Y0; y <= Y1; y++) {
      const li = h(`<li><button type="button" class="hm-yr" data-year="${y}" aria-label="${y}"><span class="hm-yr-n"></span><span class="hm-yr-bar"></span></button></li>`);
      const b = li.querySelector('button');
      b.addEventListener('click', (e) => {
        if (e.shiftKey && state.y0 === state.y1) { state.y0 = Math.min(state.y0, y); state.y1 = Math.max(state.y1, y); }
        else if (state.y0 === y && state.y1 === y) { state.y0 = Y0; state.y1 = Y1; }
        else { state.y0 = y; state.y1 = y; }
        render();
      });
      tl.bars.push(b); tl.nums.push(b.querySelector('.hm-yr-n'));
      bars.appendChild(li);
      labels.appendChild(h(`<li><span class="hm-lbl-l">${y}</span><span class="hm-lbl-s">’${String(y).slice(2)}</span></li>`));
    }
    const extra = timeline.querySelector('.hm-tl-extra');
    const nPre = all.filter((p) => p.pre_register).length, nAdd = all.filter((p) => p.addendum).length;
    const flag = (key, label, n) => {
      const el = h(`<label class="hm-chip${state[key] ? ' is-on' : ''}"><input type="checkbox" autocomplete="off"${state[key] ? ' checked' : ''}><span>${label} <span class="hm-note">(${n})</span></span></label>`);
      const i = el.querySelector('input'); i.defaultChecked = state[key];
      i.addEventListener('change', () => { state[key] = i.checked; el.classList.toggle('is-on', i.checked); render(); });
      return el;
    };
    if (nPre) extra.appendChild(flag('pre', 'before 2012', nPre));
    if (nAdd) extra.appendChild(flag('add', '2026 addendum', nAdd));
    const r0 = timeline.querySelector(`#${id('r0')}`), r1 = timeline.querySelector(`#${id('r1')}`);
    const onRange = () => {
      let a = +r0.value, b = +r1.value;
      if (a > b) [a, b] = [b, a];
      state.y0 = a; state.y1 = b; render();
    };
    r0.addEventListener('input', onRange); r1.addEventListener('input', onRange);
    tl.r0 = r0; tl.r1 = r1; tl.sel = timeline.querySelector('.hm-range-sel'); tl.read = timeline.querySelector('.hm-tl-read');
  }
  function renderTimeline() {
    const counts = new Array(Y1 - Y0 + 1).fill(0);
    all.forEach((p) => { if (!p.pre_register && !p.addendum && matchesExceptYear(p)) counts[p.year - Y0]++; });
    const max = Math.max(1, ...counts);
    tl.bars.forEach((b, i) => {
      const y = Y0 + i, pct = Math.round((counts[i] / max) * 100);
      b.style.setProperty('--h', `${pct}%`);
      b.classList.toggle('is-out', y < state.y0 || y > state.y1);
      b.setAttribute('aria-label', `${y}: ${counts[i]} record${counts[i] === 1 ? '' : 's'}${y < state.y0 || y > state.y1 ? ', outside the selected years' : ''}`);
      b.setAttribute('aria-pressed', String(y >= state.y0 && y <= state.y1));
      tl.nums[i].textContent = counts[i];
    });
    tl.r0.value = state.y0; tl.r1.value = state.y1;
    const span = Y1 - Y0;
    tl.sel.style.left = `${((state.y0 - Y0) / span) * 100}%`;
    tl.sel.style.width = `${((state.y1 - state.y0) / span) * 100}%`;
    tl.read.textContent = state.y0 === state.y1 ? String(state.y0) : `${state.y0} – ${state.y1}`;
  }

  // ---------- selection logic ----------
  function matchesExceptYear(p) {
    if (!state.domain.has(p.hallyu_domain) || !state.grade.has(p.evidence_grade) || !state.status.has(p.status)) return false;
    if (state.who === 'mission' && !p.mission) return false;
    if (state.who === 'commercial' && !p.commercial) return false;
    if (state.who === 'other' && (p.mission || p.commercial)) return false;
    return true;
  }
  function matches(p) {
    if (p.pre_register) { if (!state.pre) return false; }
    else if (p.addendum) { if (!state.add) return false; }
    else if (p.year < state.y0 || p.year > state.y1) return false;
    return matchesExceptYear(p);
  }
  function isDefault() {
    const d = DEFAULTS();
    const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
    return state.y0 === d.y0 && state.y1 === d.y1 && state.pre === d.pre && state.add === d.add && state.who === d.who && same(state.domain, d.domain) && same(state.grade, d.grade) && same(state.status, d.status);
  }
  function activeFilterCount() {
    const d = DEFAULTS();
    let n = 0;
    if (state.who !== d.who) n++;
    if (state.domain.size !== d.domain.size || ![...state.domain].every((x) => d.domain.has(x))) n++;
    if (state.grade.size !== 3) n++;
    if (state.status.size !== d.status.size || ![...state.status].every((x) => d.status.has(x))) n++;
    return n;
  }

  // ---------- records ----------
  function recordHTML(p, inList = false) {
    const chans = p.channels_all.split(';').filter(Boolean).map((c) => CHANNEL[c] || c).join(', ');
    const acts = p.actors.map((a) => `${esc(a.name)} <em>(${esc(a.role.replace(/_/g, ' '))})</em>`).join('; ');
    const srcs = p.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> <span>· ${esc(s.publisher)}</span></li>`).join('');
    const g = GRADES.find((x) => x[0] === p.evidence_grade);
    const prec = p.mode === 'online' ? 'online, no place' : p.geo_precision === 'venue' ? 'venue geocoded' : 'city-centre point';
    const link = O.url ? `${location.pathname}?id=${encodeURIComponent(p.occurrence_id)}` : '';
    return `<article class="hm-rec">
      <p class="hm-rec-kicker">${esc(p.occurrence_id)} · ${esc(p.date_edtf)}${p.date_precision === 'month' ? ' (month)' : p.date_precision === 'year' ? ' (year)' : ''}</p>
      <h4>${esc(p.title_en)}</h4>
      <p class="hm-rec-meta">${esc(placeOf(p))}${p.venue_recorded ? ` · ${esc(p.venue_recorded)}` : ''} · ${esc(typeLabel(p.event_type))} · ${esc(domainLabel(p.hallyu_domain))}</p>
      <p class="hm-rec-grade"><span class="hm-badge hm-badge--${p.evidence_grade}">Grade ${p.evidence_grade}</span> ${g ? esc(g[2]) : ''} · ${esc(p.status.replace(/_/g, ' '))} · ${p.n_sources} source${p.n_sources === 1 ? '' : 's'} (${esc(chans)}) · ${prec}</p>
      ${acts ? `<p class="hm-rec-actors">${acts}</p>` : ''}
      <ul class="hm-rec-src">${srcs}</ul>
      ${link && !inList ? `<p class="hm-rec-foot">Link to this record: <a href="${esc(link)}">${esc(location.host + link)}</a></p>` : ''}
    </article>`;
  }

  function buildMarkers() {
    markers.clear();
    feats.forEach((p) => {
      const icon = L.divIcon({ html: `<span class="hm-mk hm-mk--${p.evidence_grade}${p.geo_precision === 'venue' ? ' hm-mk--venue' : ''}"></span>`, className: 'hm-mkw', iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -8] });
      const m = L.marker(p._latlng, { icon, keyboard: false, title: '' });
      m.bindPopup(() => recordHTML(p), { maxWidth: 360, minWidth: 260, className: 'hm-popup', autoPanPaddingTopLeft: [16, 70], autoPanPaddingBottomRight: [16, 16] });
      m.on('popupopen', () => { setSelected(p.occurrence_id); });
      m.on('popupclose', () => { if (selectedId === p.occurrence_id) setSelected(''); });
      markers.set(p.occurrence_id, m);
    });
  }
  function setSelected(oid) {
    if (selectedId && markers.get(selectedId)?._icon) markers.get(selectedId)._icon.classList.remove('is-selected');
    selectedId = oid;
    state.id = oid;
    if (oid && markers.get(oid)?._icon) markers.get(oid)._icon.classList.add('is-selected');
    writeURL();
  }
  function goTo(latlng, zoom) {
    if (reduced || !map.flyTo) map.setView(latlng, zoom); else map.flyTo(latlng, zoom, { duration: 0.9 });
  }
  function select(oid, { instant = false } = {}) {
    const p = all.find((x) => x.occurrence_id === oid);
    if (!p) return false;
    if (!matches(p)) {                                 // widen the filters just enough to show the record
      if (p.pre_register) state.pre = true; else if (p.addendum) state.add = true; else { state.y0 = Math.min(state.y0, p.year); state.y1 = Math.max(state.y1, p.year); }
      state.domain.add(p.hallyu_domain); state.grade.add(p.evidence_grade); state.status.add(p.status); state.who = 'all';
      syncControls(); render();
    }
    const m = markers.get(oid);
    if (!m) { listOpen = true; list.hidden = false; pills.list.setAttribute('aria-expanded', 'true'); renderList(oid); return true; }
    const open = () => m.openPopup();
    // a record opened from the address jumps straight to it; one chosen on the page animates there
    if (instant || reduced) map.setView(m.getLatLng(), Math.max(map.getZoom(), 12), { animate: false });
    if (cluster.zoomToShowLayer) cluster.zoomToShowLayer(m, open); else { map.setView(m.getLatLng(), Math.max(map.getZoom(), 11), { animate: !reduced }); open(); }
    return true;
  }

  // ---------- list ----------
  function renderList(openId = '') {
    if (!listOpen) return;
    const rows = all.filter(matches).sort((a, b) => sortKey(a) < sortKey(b) ? -1 : 1);
    const shown = rows.slice(0, listLimit);
    list.innerHTML = `<div class="hm-list-head"><h3>${rows.length} record${rows.length === 1 ? '' : 's'} in the current selection</h3><span class="hm-note">Mapped records open on the map as well. Online and unplaced records open here only.</span></div>
      <div class="hm-list-wrap"><table><thead><tr><th scope="col">Date</th><th scope="col">Record</th><th scope="col">Place</th><th scope="col">Grade</th><th scope="col"><span class="hm-vh">Open</span></th></tr></thead><tbody></tbody></table></div>`;
    const tb = list.querySelector('tbody');
    shown.forEach((p) => {
      const tr = h(`<tr data-id="${esc(p.occurrence_id)}"><td class="hm-td-date">${esc(p.date_edtf)}</td><td>${esc(p.title_en)}</td><td>${esc(placeOf(p))}</td><td class="hm-td-g"><span class="hm-rec"><span class="hm-badge hm-badge--${p.evidence_grade}">${p.evidence_grade}</span></span></td><td><button type="button" class="hm-linklike" aria-expanded="false">${markers.has(p.occurrence_id) ? 'Show' : 'Details'}</button></td></tr>`);
      const btn = tr.querySelector('button');
      btn.addEventListener('click', () => {
        const openRow = tr.nextElementSibling?.classList.contains('hm-detail') ? tr.nextElementSibling : null;
        list.querySelectorAll('.hm-detail').forEach((d) => { d.previousElementSibling.classList.remove('hm-row-open'); d.previousElementSibling.querySelector('button').setAttribute('aria-expanded', 'false'); d.remove(); });
        if (openRow) return;
        tr.classList.add('hm-row-open'); btn.setAttribute('aria-expanded', 'true');
        tr.insertAdjacentElement('afterend', h(`<tr class="hm-detail"><td colspan="5">${recordHTML(p, true)}</td></tr>`));
        if (markers.has(p.occurrence_id)) { const m = markers.get(p.occurrence_id); if (cluster.zoomToShowLayer) cluster.zoomToShowLayer(m, () => m.openPopup()); else { map.setView(m.getLatLng(), 11); m.openPopup(); } }
        else setSelected(p.occurrence_id);
      });
      tb.appendChild(tr);
    });
    if (rows.length > shown.length) {
      const more = h(`<p class="hm-more"><button type="button" class="hm-linklike">Show all ${rows.length} records</button></p>`);
      more.querySelector('button').addEventListener('click', () => { listLimit = Infinity; renderList(); });
      list.appendChild(more);
    }
    if (openId) { const b = tb.querySelector(`tr[data-id="${CSS.escape(openId)}"] button`); if (b) { b.click(); b.scrollIntoView({ block: 'center' }); } }
  }

  // ---------- render ----------
  function render() {
    const sel = feats.filter(matches);
    cluster.clearLayers();
    if (cluster.addLayers) cluster.addLayers(sel.map((p) => markers.get(p.occurrence_id))); else sel.forEach((p) => markers.get(p.occurrence_id).addTo(cluster));
    const nU = unmapped.filter(matches).length;
    const years = state.y0 === state.y1 ? String(state.y0) : `${state.y0}–${state.y1}`;
    const extras = [state.pre ? 'with the records before 2012' : '', state.add ? 'with the 2026 addendum' : ''].filter(Boolean).join(', ');
    const hidden = [];
    if (!state.status.has('cancelled') && all.some((p) => p.status === 'cancelled')) hidden.push('cancelled events');
    if (!state.domain.has('non_pop_culture')) hidden.push('records outside popular culture');
    status.innerHTML = sel.length || nU
      ? `<b>${sel.length}</b> of ${feats.length} mapped occurrences shown for ${years}${extras ? `, ${extras}` : ''}; <b>${nU}</b> online or unplaced record${nU === 1 ? '' : 's'} match and are in the list${hidden.length ? `. Hidden by default: ${hidden.join(' and ')}` : ''}.`
      : `No record matches these filters for ${years}. <button type="button" class="hm-linklike">Reset the filters</button>`;
    status.querySelector('button')?.addEventListener('click', () => reset());
    renderTimeline();
    renderList();
    const n = activeFilterCount();
    const nEl = pills.filters.querySelector('.hm-n'); nEl.textContent = n; nEl.hidden = !n;
    const lEl = pills.list.querySelector('.hm-n'); lEl.textContent = sel.length + nU; lEl.hidden = false;
    resetPill.hidden = isDefault();
    writeURL();
  }
  function syncControls() {                           // after a programmatic state change, make the controls agree
    panels.filters.querySelectorAll('input[type=checkbox]').forEach((i) => {
      const group = i.name.endsWith('-domain') ? 'domain' : i.name.endsWith('-grade') ? 'grade' : 'status';
      i.checked = state[group].has(i.value); i.closest('.hm-chip').classList.toggle('is-on', i.checked);
    });
    panels.filters.querySelectorAll('input[type=radio]').forEach((i) => { i.checked = i.value === state.who; });
    timeline.querySelectorAll('.hm-tl-extra input').forEach((i, k) => { const key = i.closest('label').textContent.includes('before') ? 'pre' : 'add'; i.checked = state[key]; i.closest('.hm-chip').classList.toggle('is-on', i.checked); });
  }
  function reset() { Object.assign(state, DEFAULTS()); syncControls(); render(); }

  // ---------- URL state ----------
  function readURL() {
    if (!O.url) return;
    const q = new URLSearchParams(location.search);
    const int = (k, lo, hi) => { const v = parseInt(q.get(k) || '', 10); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null; };
    const a = int('from', Y0, Y1), b = int('to', Y0, Y1);
    if (a !== null) state.y0 = a; if (b !== null) state.y1 = b; if (state.y0 > state.y1) [state.y0, state.y1] = [state.y1, state.y0];
    const set = (k, allowed) => { const v = q.get(k); if (v !== null) state[k] = new Set(v.split(',').filter((x) => allowed.includes(x))); };
    set('domain', DOMAINS.map((d) => d[0])); set('grade', ['A', 'B', 'C']); set('status', STATUSES.map((s) => s[0]));
    if (WHO.some((w) => w[0] === q.get('who'))) state.who = q.get('who');
    state.pre = q.get('pre') === '1'; state.add = q.get('add') === '1';
    state.id = q.get('id') || '';
  }
  function writeURL() {
    if (!O.url) return;
    const d = DEFAULTS(), q = new URLSearchParams();
    if (state.y0 !== d.y0) q.set('from', state.y0); if (state.y1 !== d.y1) q.set('to', state.y1);
    const diff = (k) => state[k].size !== d[k].size || ![...state[k]].every((x) => d[k].has(x));
    if (diff('domain')) q.set('domain', [...state.domain].join(',')); if (diff('grade')) q.set('grade', [...state.grade].join(',')); if (diff('status')) q.set('status', [...state.status].join(','));
    if (state.who !== 'all') q.set('who', state.who); if (state.pre) q.set('pre', '1'); if (state.add) q.set('add', '1');
    if (state.id) q.set('id', state.id);
    const s = q.toString();
    const next = `${location.pathname}${s ? `?${s}` : ''}${location.hash}`;
    if (next !== location.pathname + location.search + location.hash) history.replaceState(null, '', next);
  }

  // ---------- load ----------
  (async () => {
    try {
      const [g, u, bm] = await Promise.all([
        fetch(O.data).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch(O.unmapped).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch(O.basemap).then((r) => (r.ok ? r.json() : null)).catch(() => null),   // without it the marks still draw, on an empty sea
      ]);
      feats = g.features.map((f) => ({ ...f.properties, _latlng: [f.geometry.coordinates[1], f.geometry.coordinates[0]] }));
      unmapped = u.map((p) => ({ ...p, _latlng: null }));
      all = feats.concat(unmapped);
      if (bm) drawBasemap(bm);
    } catch (e) {
      notice.innerHTML = `<p>The register's data files could not be loaded (${esc(e.message)}).</p><p><a href="${esc(O.data)}">events.geojson</a> · <a href="${esc(O.unmapped)}">events_unmapped.json</a></p>`;
      return;
    }
    readURL();
    buildMarkers(); buildLabels(); buildFilters(); buildLegend(); buildFind(); buildTimeline();
    notice.hidden = true;
    render();
    if (state.id) select(state.id, { instant: true });
  })();

  const api = { map, select, getState: () => ({ ...state, domain: [...state.domain], grade: [...state.grade], status: [...state.status] }), setState: (patch) => { Object.assign(state, patch); syncControls(); render(); } };
  root.hallyuMap = api;
  return api;
}
