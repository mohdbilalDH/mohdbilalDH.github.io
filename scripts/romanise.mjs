// Display-layer romanisation. The site publishes McCune-Reischauer (see /method/); the
// frozen research datasets were compiled with a mix of McCune-Reischauer and Revised
// Romanization. Rewriting the frozen CSVs would break their manifests and their citability,
// so this runs over the *display copies* in src/data/ and public/data/ instead — the same
// display-layer principle the 長恨 edition already uses for damaged bylines.
//
//   npm run romanise      (idempotent; re-run after any re-export from a project repository)
//
// Two rules keep this honest:
//   1. Source citations and URLs are never rewritten. A citation must match the published item.
//   2. Person names are mapped explicitly, from the hangul, in NAME_MAP below — not by a
//      general transliteration rule — so that every change is reviewable and correctable.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILES = [
  'src/data/people.json', 'src/data/story.json', 'src/data/timeline.json',
  'src/data/sources.json', 'src/data/core.json', 'src/data/network.json',
  'public/data/people.json', 'public/data/story.json', 'public/data/timeline.json',
  'public/data/sources.json', 'public/data/core.json', 'public/data/network.json',
];

// Terms. Word-boundary matched, so possessives and hyphenated compounds follow.
const TERMS = [
  [/\bJoseon\b/g, 'Chosŏn'],
  [/\bGoryeo\b/g, 'Koryŏ'],
  [/\bBaekje\b/g, 'Paekche'],
  [/\bGoguryeo\b/g, 'Koguryŏ'],
  [/\bGyeongju\b/g, 'Kyŏngju'],
  [/\bgisaeng\b/g, 'kisaeng'],
  [/\bGisaeng\b/g, 'Kisaeng'],
];

// Names, derived from the hangul in the record. Living people who publish under a spelling of
// their own keep it (Ko Un, Jung Seung-suk, Lokesh Chandra); Sanskrit and other non-Korean
// names are untouched.
const NAME_MAP = {
  'Woncheuk': "Wŏnch'ŭk",
  'Gyeomik': 'Kyŏmik',
  'Naong Hyegeun': 'Naong Hyegŭn',
  'Baegun Gyeonghan': 'Paegun Kyŏnghan',
  'U Myeong-ju': 'U Myŏng-ju',
  'Hyoseok': 'Hyosŏk',
  'Wookwan': 'Ukwan',
  'Gakseong': 'Kaksŏng',
  'Hyeeop': 'Hyeŏp',
  'Gubon': 'Kubon',
  'Wonpyo': "Wŏnp'yo",
  'Hyecho': "Hyech'o",
};
// Longest first, so "Naong Hyegeun" is matched before "Hyegeun" could be.
const NAME_RE = new RegExp(
  `(${Object.keys(NAME_MAP).sort((a, b) => b.length - a.length).join('|')})`, 'g',
);

const SKIP_KEYS = new Set(['citation', 'url', 'id', 'manifest_check', 'hangul', 'hanja', 'variants']);

function fixString(s) {
  if (/^https?:\/\//.test(s)) return s;
  // Normalise the apostrophe to the ASCII form the dataset already uses (T'aehyŏn, Hyŏnt'ae).
  let out = s.replace(/\u02bb/g, "'");
  for (const [re, to] of TERMS) out = out.replace(re, to);
  out = out.replace(NAME_RE, (m) => NAME_MAP[m]);
  return out;
}

function walk(node, key) {
  if (typeof node === 'string') return SKIP_KEYS.has(key) ? node : fixString(node);
  if (Array.isArray(node)) return node.map((v) => walk(v, key));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v, k);
    return out;
  }
  return node;
}

let changed = 0;
for (const file of FILES) {
  if (!existsSync(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = JSON.stringify(walk(JSON.parse(before)), null, 1) + '\n';
  if (after !== before) { writeFileSync(file, after); changed++; console.log('romanised', file); }
}
console.log(`romanise: ${changed} file(s) rewritten`);
