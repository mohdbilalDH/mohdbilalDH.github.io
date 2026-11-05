// Derive the figure datasets for the Hallyu events register from the register's own web contract
// (public/data/hallyu-india-events/, copied from the analysis repository's outputs/web/), so that
// the page's counts, the contest matrix and the channel figure cannot drift from the map's data.
// Idempotent: `npm run hallyu-events:views` after every copy of the contract files.
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'public/data/hallyu-india-events';
const read = (f) => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
const geo = read('events.geojson');
const unmapped = read('events_unmapped.json');
const stats = read('stats.json');

const mapped = geo.features.map((f) => ({ ...f.properties, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }));
const all = mapped.concat(unmapped);
const series = all.filter((p) => !p.pre_register && !p.addendum);
const MISSION = new Set(['kcci', 'mofa']);
const DEFAULT_DOMAINS = new Set(['kpop', 'kdrama', 'film', 'kmusic_other', 'multi']);
const NORTHEAST = new Set(['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura']);
const PERIODS = [['2012–2016', 2012, 2016], ['2017–2019', 2017, 2019], ['2020–2022', 2020, 2022], ['2023–2025', 2023, 2025]];
const years = Array.from({ length: 14 }, (_, i) => 2012 + i);
const chans = (p) => p.channels_all.split(';').filter(Boolean);
const count = (arr, key) => arr.reduce((m, p) => m.set(key(p), (m.get(key(p)) || 0) + 1), new Map());

// --- scale line ---
const sourceUrls = new Set(series.flatMap((p) => p.sources.map((s) => s.url)));
const actorNames = new Set(series.flatMap((p) => p.actors.map((a) => a.name)));
const inPerson = series.filter((p) => p.mode !== 'online' && p.city !== 'online');
const scale = {
  occurrences: series.length,
  mapped: series.filter((p) => p.lat !== undefined).length,
  online: series.filter((p) => p.lat === undefined).length,
  cities: new Set(inPerson.map((p) => p.city)).size,
  states: new Set(inPerson.map((p) => p.state).filter(Boolean)).size,
  sources: sourceUrls.size,
  actors: actorNames.size,
  grades: Object.fromEntries(['A', 'B', 'C'].map((g) => [g, series.filter((p) => p.evidence_grade === g).length])),
  pre_register: all.filter((p) => p.pre_register).length,
  addendum: all.filter((p) => p.addendum).length,
  venue_geocoded: series.filter((p) => p.geo_precision === 'venue').length,
};

// --- who documented what: per year, records known from the mission only, from both, or only from outside it ---
const channelSplit = years.map((y) => {
  const rows = series.filter((p) => p.year === y);
  const split = { year: y, mission_only: 0, both: 0, independent_only: 0 };
  rows.forEach((p) => {
    const c = chans(p), m = c.some((x) => MISSION.has(x)), i = c.some((x) => !MISSION.has(x));
    if (m && i) split.both++; else if (m) split.mission_only++; else split.independent_only++;
  });
  return { ...split, total: rows.length };
});

// --- commercial K-pop (ticketed concerts and fan meetings with no mission actor), and who recorded it ---
const commercial = series.filter((p) => p.commercial && DEFAULT_DOMAINS.has(p.hallyu_domain));
const commercialSummary = {
  total: commercial.length,
  in_kcci: commercial.filter((p) => chans(p).includes('kcci')).length,
  in_mofa: commercial.filter((p) => chans(p).includes('mofa')).length,
  in_mission: commercial.filter((p) => chans(p).some((x) => MISSION.has(x))).length,
  by_city: [...count(commercial.filter((p) => p.city !== 'online'), (p) => p.city)].sort((a, b) => b[1] - a[1]).map(([city, n]) => ({ city, n })),
};
// the mission's own pop-culture programme, and how much of it anyone else recorded
const missionPop = series.filter((p) => p.mission && DEFAULT_DOMAINS.has(p.hallyu_domain));
const missionSummary = {
  total: missionPop.length,
  outside: missionPop.filter((p) => chans(p).some((x) => !MISSION.has(x))).length,
  alone: missionPop.filter((p) => !chans(p).some((x) => !MISSION.has(x))).length,
};

// --- the contest's circuit: one row per city, one column per year ---
const contestYears = stats.contest.filter((r) => +r.year >= 2012 && +r.year <= 2025);
const cityYears = new Map();
contestYears.forEach((r) => r.cities.split(';').map((s) => s.trim()).filter(Boolean).forEach((c) => {
  if (!cityYears.has(c)) cityYears.set(c, new Set());
  cityYears.get(c).add(+r.year);
}));
const contestCities = [...cityYears.entries()].map(([city, ys]) => ({ city, years: [...ys].sort(), first: Math.min(...ys), n: ys.size, state: (series.find((p) => p.city === city) || {}).state || '' }))
  .sort((a, b) => a.first - b.first || b.n - a.n || a.city.localeCompare(b.city));
const contest = {
  cities: contestCities,
  years: contestYears.map((r) => ({ year: +r.year, in_person_cities: +r.in_person_cities, online_regions: +r.online_regions, occurrences: +r.occurrences })),
};

// --- where: city × period, and the Northeast share of in-person pop-culture records ---
const periodOf = (y) => PERIODS.find(([, a, b]) => y >= a && y <= b)?.[0];
const cityRows = [...new Set(inPerson.map((p) => p.city))].map((city) => {
  const rows = inPerson.filter((p) => p.city === city);
  const r = { city, state: rows[0].state, total: rows.length, pop: rows.filter((p) => DEFAULT_DOMAINS.has(p.hallyu_domain)).length };
  PERIODS.forEach(([label]) => { r[label] = rows.filter((p) => periodOf(p.year) === label).length; });
  return r;
}).sort((a, b) => b.total - a.total || a.city.localeCompare(b.city));
const popInPerson = inPerson.filter((p) => DEFAULT_DOMAINS.has(p.hallyu_domain));
const northeast = PERIODS.map(([label]) => {
  const rows = popInPerson.filter((p) => periodOf(p.year) === label);
  return { period: label, northeast: rows.filter((p) => NORTHEAST.has(p.state)).length, total: rows.length };
});

// --- co-production: fan collectives organising or co-organising events that carry the mission's brand ---
const fanRole = (p) => p.actors.some((a) => a.type === 'fan_collective' && ['organiser', 'co_organiser'].includes(a.role));
const fanPop = series.filter((p) => DEFAULT_DOMAINS.has(p.hallyu_domain) && fanRole(p));
const coproduction = {
  fan_events: fanPop.length,
  fan_events_mission: fanPop.filter((p) => p.mission).length,
  by_period: PERIODS.map(([label]) => ({ period: label, n: fanPop.filter((p) => p.mission && periodOf(p.year) === label).length })),
  peak_years: [...count(fanPop.filter((p) => p.mission), (p) => p.year)].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([year, n]) => ({ year, n })),
};
// --- how many records each channel documents (a record in two channels counts in both) ---
const channelTotals = {};
series.forEach((p) => chans(p).forEach((c) => { channelTotals[c] = (channelTotals[c] || 0) + 1; }));
const oneChannelOnly = series.filter((p) => chans(p).length === 1).length;

// --- records the prose points at, found by title so the ids survive a renumbering ---
const findId = (re) => (series.find((p) => re.test(p.title_en)) || {}).occurrence_id || '';
const examples = {
  imphal_2019: findId(/Contest 2019 .*Manipur regional round/i),
  diphu_2019: findId(/Jang Hanbyul .*Diphu/i),
  first_contest_2012: findId(/K-?Pop Contest.*2012|2012.*K-?Pop Contest/i),
};

const out = {
  built_from: 'public/data/hallyu-india-events (register v0.2.0, build of 5 November 2026)',
  periods: PERIODS.map((p) => p[0]),
  scale, by_year: stats.by_year.filter((r) => +r.year >= 2012 && +r.year <= 2025).map((r) => ({ ...r, year: +r.year })),
  channel_split: channelSplit, commercial: commercialSummary, mission: missionSummary, contest, cities: cityRows, northeast,
  coproduction, examples, channel_totals: channelTotals, one_channel_only: oneChannelOnly,
};
writeFileSync('src/data/hallyu-events.json', JSON.stringify(out, null, 1) + '\n');
console.log(`hallyu-events.json: ${scale.occurrences} occurrences, ${scale.mapped} mapped, ${scale.cities} cities, ${contestCities.length} contest cities; commercial ${commercialSummary.total} (in the mission's record ${commercialSummary.in_mission})`);
