// Derives the two corpus-level display datasets the 長恨 project page needs from the
// edition's own published JSON, so the figures cannot drift from the frozen corpus:
//
//   src/data/janghan-corpus.json  one slim row per textual item (98), for the corpus grid
//   src/data/janghan-places.json  counted place mentions aggregated per place, for the locator
//
// Re-run after any corpus rebuild:  npm run janghan:views
// Nothing here interprets the data; it only projects fields the edition already publishes.

import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(`public/janghan/data/v1/${f}`, 'utf8'));

const items = read('text_items.json');
const places = read('places.json');
const mentions = read('place_mentions.json');

// ---- 1. the corpus grid ----
// Attribution groups are collapsed to the four labels the bylines figure already uses, so the
// grid and the bar agree. The corpus keeps `*_authored` and `*_attributed` apart; the interface
// folds authored onto attributed, because a byline evidences publication under a name and never
// authorship.
const GROUP = {
  gisaeng_attributed: 'kisaeng',
  gisaeng_authored: 'kisaeng',
  editor_produced: 'editor',
  editor_authored: 'editor',
  foreign_attributed: 'foreign',
  foreign_authored: 'foreign',
  unresolved_or_other: 'unresolved',
};

const corpus = {
  _meta: {
    source: 'public/janghan/data/v1/text_items.json',
    note: 'One row per textual item. Attribution groups folded to four labels; authored is never distinguished from attributed in the interface.',
    versions: 'Issue 1 corpus v3.3 (frozen) · Issue 2 corpus v3.4 (working layer)',
  },
  items: items.map((i) => ({
    id: i.text_item_id,
    issue: i.issue_id,
    unit: i.editorial_unit_id,
    nested: i.editorial_unit_id !== i.text_item_id,
    attribution: GROUP[i.group] ?? 'unresolved',
    certainty: i.status,
    register: i.register,
    witnesses: i.witnesses,
    genre: i.genre || 'unrecorded',
    title: i.title,
    byline: i.byline,
    pages: i.page_start === i.page_end ? i.page_start : `${i.page_start}–${i.page_end}`,
  })),
};
writeFileSync('src/data/janghan-corpus.json', JSON.stringify(corpus, null, 1) + '\n');

// ---- 2. the place locator ----
const counted = mentions.filter((m) => m.status === 'counted');
const byPlace = new Map();
for (const m of counted) {
  const row = byPlace.get(m.place_id) ?? { n: 0, functions: {} };
  row.n += 1;
  row.functions[m.place_function] = (row.functions[m.place_function] ?? 0) + 1;
  byPlace.set(m.place_id, row);
}

const placeRows = [...byPlace.entries()]
  .map(([id, row]) => {
    const p = places.find((x) => x.place_id === id);
    return {
      id,
      name: p.place_name,
      category: p.category,
      mappable: p.placeable_on_map === 'yes',
      lat: p.modern_coords_lat ? Number(p.modern_coords_lat) : null,
      lng: p.modern_coords_lng ? Number(p.modern_coords_lng) : null,
      n: row.n,
      functions: Object.entries(row.functions).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v })),
      note: p.corpus_role || '',
    };
  })
  .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));

const mapped = placeRows.filter((p) => p.mappable);
writeFileSync(
  'src/data/janghan-places.json',
  JSON.stringify(
    {
      _meta: {
        source: 'public/janghan/data/v1/{places,place_mentions}.json',
        dataset: 'place list v1.1 · coded place evidence v1.2 · Issue 1 only',
        note: 'Counted mentions only. Gap-logged, logged-not-counted, excluded-evidence and false-positive records are published in the edition and are deliberately absent here.',
      },
      counted_mentions: counted.length,
      counted_places: placeRows.length,
      mappable_places: mapped.length,
      mappable_mentions: mapped.reduce((s, p) => s + p.n, 0),
      places: placeRows,
    },
    null,
    1,
  ) + '\n',
);

console.log(
  `janghan views: ${corpus.items.length} items · ${placeRows.length} counted places ` +
  `(${mapped.length} mappable carrying ${mapped.reduce((s, p) => s + p.n, 0)} of ${counted.length} mentions)`,
);
