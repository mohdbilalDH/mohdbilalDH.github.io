export type Article = {
  title: string;
  venue: string;
  coauthors?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year: number;
  status: 'published' | 'forthcoming' | 'under-review';
  note?: string;
};

export const articles: Article[] = [
  {
    title: 'Hybridizing Culture and Linguistics: A Case Study of K-Dramas’ Impact in India',
    venue: 'The Myanmar Journal',
    coauthors: 'With Santosh Kumar Ranjan',
    volume: '11',
    issue: '1',
    pages: '165–188',
    year: 2024,
    status: 'published',
  },
  {
    title: 'Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda',
    venue: '남아시아연구 (Journal of South Asian Studies)',
    volume: '32',
    issue: '2',
    year: 2026,
    status: 'forthcoming',
    note: 'Accepted · in proofs',
  },
  {
    title: 'The Role of Remakes and Adaptations in Activating Indian Agency',
    venue: 'Asian Communication Research',
    year: 2026,
    status: 'under-review',
    note: 'special issue “Circuits of K-content: Co-productions, Collaborations, and Connections.” Manuscript under review',
  },
];

export const venueLine = (a: Article): string =>
  `${a.coauthors ? a.coauthors + '. ' : ''}<em>${a.venue}</em>${a.volume ? ` ${a.volume}` : ''}${a.issue ? `, no. ${a.issue}` : ''} (${a.year})${a.pages ? `: ${a.pages}` : ''}.${a.status === 'forthcoming' ? ' Forthcoming.' : ''}`;

export const byStatus = (status: Article['status']) => articles.filter((a) => a.status === status);
