// Project registry. The card fields (category, yearLabel, art, overlay) drive the home and
// projects-page cards; the project fields (kind, question, finding, version, summaryKo, explore)
// drive the project pages themselves. Adding a project means one entry here plus its pages.

export type Category = 'editions' | 'networks' | 'corpora';
export type Kind = 'edition' | 'argument' | 'investigation';
export type State = 'frozen' | 'in-progress' | 'released';

export type Project = {
  slug: string;
  href: string;
  /** Short name for breadcrumbs and prose. */
  shortTitle: string;
  /** The public title, used on the card, the page and the browser tab. */
  title: string;
  subtitle: string;
  description: string;
  method: string;
  state: State;
  stateLabel: string;
  /** Short form for cards, where the meta row must stay on one line. */
  stateShort: string;
  tags: string[];
  category: Category;
  yearLabel: string;
  art: string;
  /** What the card image actually shows. Alt text describes the thing, not the project. */
  artAlt: string;
  overlay: 1 | 2 | 3 | 4;

  /** What kind of scholarly output this is. Shown on the project page, not on the card. */
  kind: Kind;
  /** The span the project covers. */
  dates: string;
  /** The research question, as a question. */
  question: string;
  /** The finding, as a sentence with a verb. */
  finding: string;
  /** Dataset version, shown on the project page and its data page. */
  version: string;
  /** Present only once minted; the site never prints "DOI pending". */
  doi?: string;
  /** 150–250 words. The whole Korean layer for this project. */
  summaryKo: string;
  /** One line for the card: scope, span and size, in that order. Not the finding. */
  blurb: string;
  /** Three headline counts for the card, in the corpus's own units. */
  counts: { n: string; unit: string }[];
  /** The evidence layer, where there is one to enter. */
  explore?: { href: string; label: string; blurb: string };
};

export const categories: { key: Category; title: string }[] = [
  { key: 'editions', title: 'Digital editions and datasets' },
  { key: 'corpora', title: 'Press corpora' },
];

export const kindLabel: Record<Kind, string> = {
  edition: 'Digital edition',
  argument: 'Prosopography',
  investigation: 'Corpus in development',
};

export const projects: Project[] = [
  {
    slug: 'janghan',
    href: '/projects/janghan/',
    shortTitle: '長恨 (1927)',
    title: '長恨 (1927): the magazine the kisaeng made',
    subtitle: 'Reconstructing the contents, and registering the attributions',
    method: 'digital edition',
    kind: 'edition',
    state: 'frozen',
    stateLabel: 'Issue 1 corpus frozen',
    stateShort: 'Issue 1 frozen',
    dates: '1927',
    description:
      'For two issues in 1927, women registered as kisaeng edited and largely wrote their own magazine. A structural edition of both issues, reconstructed from four independent witnesses that disagree about what the magazine contained, with every item, contributor and place opening to the evidence behind it.',
    question:
      'What was actually in 長恨, a magazine published by and largely written by kisaeng, when the four surviving sources do not agree?',
    finding:
      'Four sources disagree about the contents, and they disagree for a countable reason. Reconstructing the magazine changes what can be said about who wrote it: 51 of 98 texts carry kisaeng attributions, and 8 identities are confirmed.',
    version: 'Issue 1 corpus v3.3 (frozen) · Issue 2 working layer v3.4 · place evidence v1.2',
    tags: ['Digital edition', 'structural encoding', 'spatial coding', 'Korean colonial print culture'],
    category: 'editions',
    yearLabel: '1927 · Issue 1 corpus frozen',
    blurb:
      'A structural edition of both 1927 issues of a magazine published by and largely written by kisaeng, reconstructed from four witnesses that disagree: 98 texts, 44 bylines and 53 coded place mentions.',
    counts: [
      { n: '98', unit: 'textual items' },
      { n: '44', unit: 'bylines' },
      { n: '4', unit: 'witnesses' },
    ],
    art: '/art/janghan.png',
    artAlt: 'The two 1927 covers of 長恨 side by side: a woman seated inside a birdcage, and two women in hanbok and Western dress beneath a rising sun.',
    overlay: 1,
    summaryKo:
      '1927년 경성에서 장한사가 발행한 잡지 『장한』 두 호의 수록 내용을 네 개의 서로 다른 증거(1927년 원본 스캔, 2009년 영인·자료편, 연세대 목록, 기존 서지)로부터 재구성한 연구입니다. 네 증거는 수록 기사 수를 각각 다르게 기록하는데, 이는 부주의가 아니라 세는 단위가 다르기 때문입니다. 본 연구는 서지 항목·편집 단위·텍스트 항목의 세 층위를 구분하여 기록하며, 두 호를 합쳐 89개 편집 단위 안에 98개 텍스트 항목을 확인했습니다. 서명(byline)은 저자성이 아니라 "그 이름으로 발표되었다"는 증거로만 기록하고, 확정·개연·미확인 등 확실성 등급을 함께 표시합니다. 98개 텍스트 중 51개가 기생 서명이지만 신원이 확정된 경우는 8건에 그칩니다. 저작권 문제로 지면 이미지와 전문 번각은 공개하지 않으며, 메타데이터·구조·증거 관계만 공개합니다. 창간호 말뭉치는 v3.3으로 동결되었고, 2월호는 작업 층위로 남아 있습니다. 장소 분석은 창간호만 코딩된 진행 중 연구입니다.',
    explore: {
      href: '/janghan/',
      label: 'Enter the edition',
      blurb:
        'Both issues item by item, the four witnesses and where they disagree, every byline with its attribution status, and the coded place evidence. 171 pages generated from the frozen corpus, so the interface cannot drift from the data.',
    },
  },
  {
    slug: 'buddhist-bridges',
    href: '/projects/buddhist-bridges/',
    shortTitle: 'Buddhist Bridges',
    title: 'Buddhist Bridges: five bridges, one silence',
    subtitle: 'Who mediated Buddhist exchange between India and Korea, 300–2026?',
    method: 'prosopography',
    kind: 'argument',
    state: 'frozen',
    stateLabel: 'Dataset frozen · v3.0',
    stateShort: 'Dataset frozen',
    dates: '300–2026',
    description:
      'Who actually mediated Buddhist exchange between India and Korea, 300–2026? A source-graded prosopography of 43 documented mediators, with a frozen, checksummed dataset, an interactive chronology, and a page for every person.',
    question:
      'Was there ever a continuous Buddhist bridge between India and Korea, and if not, what does the documented record show instead?',
    finding:
      'The documented record shows no continuous bridge. It shows five short-lived bridges built by different kinds of people in different directions, and one interruption five centuries long in which no person, journey, text or institution meets the evidence bar.',
    version: 'v3.0, frozen 17 August 2026 · SHA-256 manifest 769b00c67fdd1a6e',
    tags: ['Prosopography', 'timeline', 'network', 'Python + Astro', 'data CC-BY-4.0'],
    category: 'editions',
    yearLabel: '300–2026 · Dataset v3.0 frozen',
    blurb:
      'A source-graded prosopography of documented mediators of India–Korea Buddhist exchange across sixteen centuries, with a page for every person and every excluded candidate retained.',
    counts: [
      { n: '43', unit: 'mediators' },
      { n: '187', unit: 'graded sources' },
      { n: '6', unit: 'cohorts' },
    ],
    art: '/art/buddhist-bridges.png',
    artAlt: 'Route ribbons for the eight journeys whose intermediate stations the sources record, running between Korea, China, Central Asia, Tibet, India and Persia.',
    overlay: 3,
    summaryKo:
      '인도와 한국 사이의 불교 교류를 매개한 인물들을 300년부터 2026년까지 문헌 근거에 따라 기록한 소규모 프로소포그래피입니다. 총 76명을 검토하여 불교 관련성 기준을 통과한 43명을 본 데이터셋에 포함했고, 41건의 이동, 30건의 텍스트, 31개 기관, 19건의 사건이 187개의 등급화된 사료 위에 놓여 있습니다. 수집 원칙은 하나입니다. 문헌 증거 없이 어떤 관계도 "영향"으로 기록하지 않으며, 두 나라 모두와 관련이 있다는 사실만으로는 영향이 되지 않습니다. 결과는 연속된 하나의 다리가 아니라 다섯 개의 짧은 다리이며, 조선 시대 500년(1392–1900)에는 기준을 충족하는 기록이 하나도 없습니다. 이 영(零)은 명시된 포함 기준 아래에서의 발견이며, 접촉이 전혀 없었다는 주장이 아닙니다. 제외된 11명의 후보는 문서화된 음성 사례로 데이터셋에 남아 있습니다. 모든 기록은 확실성 등급과 연대 정밀도를 함께 가지며, 안전한 연대가 없는 기록은 연표에 놓지 않습니다.',
    explore: {
      href: '/projects/buddhist-bridges/explore/',
      label: 'Explore the evidence',
      blurb:
        'The full timeline instrument with four question presets, the two documented network slices, and the register of all 43 mediators. Every person opens to a citable page carrying the full record and its sources.',
    },
  },
  {
    slug: 'hallyu-indian-press',
    href: '/projects/hallyu-indian-press/',
    shortTitle: 'Hallyu in the Indian press',
    title: 'Looking for Hallyu in the Indian Press',
    subtitle: 'What the archives can and cannot show, 2000–2026',
    method: 'corpus study',
    kind: 'investigation',
    state: 'in-progress',
    stateLabel: 'Source audit complete · corpus in development',
    stateShort: 'Audit complete',
    dates: '2000–2026',
    description:
      'How did Indian English-language newspapers represent Korean popular culture, and what can their archives actually support as evidence? A reproducible corpus project whose source audit is complete and has already produced a publishable negative finding.',
    question:
      'What can Indian English-language newspaper archives actually support as evidence about Korean popular culture, and where do they fail?',
    finding:
      'Across 2000 to 2010 the licensed full text of three national dailies holds 10,146 Korea-related articles, and the words Hallyu or Korean wave appear in them exactly once. The visibility curve turns in 2018–19, not 2017, and every apparent rise coincides with a change in what the databases hold.',
    version: 'Source audit v1 (18 August 2026) · print series 2006–2026, 4,796 articles · pilot corpus 50 documents',
    tags: ['Web archives', 'SQLite + FTS5', 'Python', 'metadata-only publishing'],
    category: 'corpora',
    yearLabel: '2000–2026 · Source audit complete',
    blurb:
      'An audit of what Indian English-language newspaper archives can support as evidence about Korean popular culture, and a corpus being built on it. Counts only: the text is copyrighted.',
    counts: [
      { n: '4,796', unit: 'print articles' },
      { n: '6', unit: 'archives audited' },
      { n: '1', unit: 'use of “Hallyu” before 2011' },
    ],
    art: '/art/hallyu.png',
    artAlt: 'Coverage bars showing when each newspaper archive begins its licensed full text, from 2005 to 2015, with a marker where online editions enter the index in 2017.',
    overlay: 2,
    summaryKo:
      '2000년부터 2026년까지 인도 영자 일간지가 한국 대중문화를 어떻게 다루었는지 연구하기 위한 말뭉치 구축 및 자료 가용성 조사입니다. 현재 완료된 것은 프레이밍 분석이 아니라 자료 조사 단계이며, 그 결과 자체가 하나의 발견입니다. 라이선스 전문 검색(ProQuest: Times of India, Hindustan Times, Indian Express)에서 2000–2010년 한국 관련 기사는 10,146건이지만 "Hallyu" 또는 "Korean wave"라는 단어는 전 기간에 걸쳐 단 1회 나타납니다. 인터넷 아카이브를 통한 The Hindu 독립 수집에서도 문화 맥락의 한류 표제어는 0건으로, 같은 결과가 독립적으로 확인되었습니다. 지면판만으로 집계한 2006–2026년 계열(4,796건)에서 곡선이 꺾이는 지점은 2017년이 아니라 2018–19년이며, 2017년은 오히려 국지적 저점입니다. 또한 각 신문의 전문 수록 개시 연도가 서로 다르고 2017년부터 온라인판이 색인에 들어오기 때문에 기사 수의 증가를 곧 인기의 증가로 읽을 수 없습니다. 신문 본문은 저작권 대상이므로 이 저장소는 메타데이터·빈도·파생 통계만 공개합니다.',
  },
];
