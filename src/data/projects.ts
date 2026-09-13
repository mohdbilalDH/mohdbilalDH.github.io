export type Project = {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  method: string;
  state: 'frozen' | 'in-progress';
  stateLabel: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    slug: 'janghan',
    href: '/projects/janghan/',
    title: '長恨 (1927)',
    subtitle: 'The magazine the gisaeng made',
    method: 'digital edition',
    state: 'frozen',
    stateLabel: 'Issue 1 corpus frozen',
    description:
      'For two issues in 1927, women registered as gisaeng edited and largely wrote their own magazine. A digital scholarly edition of both issues, reconstructed from four independent witnesses that disagree about what the magazine contained — with every item, contributor and place opening to the evidence behind it.',
    tags: ['Digital edition', 'structural encoding', 'spatial coding', 'Korean colonial print culture'],
  },
  {
    slug: 'buddhist-bridges',
    href: '/projects/buddhist-bridges/',
    title: 'Buddhist Bridges',
    subtitle: 'Five bridges, one silence',
    method: 'prosopography',
    state: 'frozen',
    stateLabel: 'Dataset frozen · V3.0',
    description:
      'Who actually mediated Buddhist exchange between India and Korea, 300–2026? A source-graded prosopography of 43 documented mediators, with a frozen, checksummed dataset and an interactive chronology.',
    tags: ['Prosopography', 'timeline', 'network', 'Python + Astro', 'data CC-BY-4.0'],
  },
  {
    slug: 'hallyu-indian-press',
    href: '/projects/hallyu-indian-press/',
    title: 'Framing Hallyu in the Indian Press',
    subtitle: '2000–2026',
    method: 'corpus study',
    state: 'in-progress',
    stateLabel: 'Pilot complete · corpus in progress',
    description:
      'How did Indian English-language newspapers represent and frame Hallyu as Korean popular culture became visible in India? A reproducible corpus project; the 2000–2010 pilot is complete and has already produced a publishable-grade negative finding.',
    tags: ['Web archives', 'SQLite + FTS5', 'Python', 'metadata-only publishing'],
  },
];
