// Shared helpers for the Buddhist Bridges project. Kept in one place so the register,
// the person pages and the figures all present a record identically.
import people from './people.json';
import core from './core.json';

export type Person = (typeof people.people)[number];

export const TYPO: Record<string, string> = {
  PILGRIM_VISITOR: 'pilgrim', TEXTUAL_MEDIATOR: 'textual mediator', STUDENT: 'student',
  RESIDENT_WORKER: 'resident', ENCOUNTER_FIGURE: 'encounter', INDIRECT_INFLUENCER: 'indirect',
  PLANNED_PILGRIM: 'planned pilgrim',
};

export const DIRECTION: Record<string, string> = {
  INDIA_TO_KOREA: 'India → Korea', KOREA_TO_INDIA: 'Korea → India',
  BIDIRECTIONAL: 'both directions', UNCERTAIN: 'uncertain',
};

export const GRADE: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3, SPECULATIVE: 4 };

/** Date precision is recorded, never invented. The notation is part of the record. */
export const life = (p: Person): string => {
  if (p.birth && p.death) return `${p.birth}–${p.death}`;
  if (p.birth) return `b. ${p.birth}`;
  if (p.floruit?.[0]) return `fl. ${p.floruit[0]}–${p.floruit[1]} ?`;
  return 'undated';
};

export const start = (p: Person): number => Number(p.birth || p.floruit?.[0] || 9999);

export const bandLabel = (id: string): string =>
  core.bands.find((b) => b.id === id)?.label ?? id;

export const bandSpan = (id: string): string => {
  const b = core.bands.find((x) => x.id === id);
  return b ? `${b.start}–${b.end}` : '';
};

/** Every person has one stable, citable address. */
export const personHref = (id: string): string => `/projects/buddhist-bridges/people/${id}/`;

export const carried = people.people;

export const CONFIDENCE_LEGEND =
  'Confidence grades the source basis, not historical importance. HIGH: corroborated by two or more independent sources of academic or archival standing. MEDIUM: documented, but resting on fewer or weaker sources. A single-source mark means the record is in the dataset and is not corroborated.';
