// The project contract: every project declares a kind, a state, one question and one
// finding, and resolves to exactly three routes (argument · explore · data).
// The argument page is budgeted at 700-1,000 words of prose (figures and their data tables
// excluded) and at most four figures. tests/e2e/test_contract.py enforces both.
// Adding a project means adding one entry here and three files under src/pages/projects/.

export type Kind = 'edition' | 'argument' | 'investigation';
export type State = 'in-progress' | 'frozen' | 'released';

export type Project = {
  slug: string;
  href: string;
  /** Short name used in navigation, breadcrumbs and prose. */
  shortTitle: string;
  /** The single public title. Used on the page, the index, the card and the browser tab. */
  title: string;
  kind: Kind;
  state: State;
  /** Human label for the state, drawn from the data rather than from a mood. */
  stateLabel: string;
  /** The span the project covers, not the span it was built in. */
  dates: string;
  /** Slot 1: the research question, as a question. */
  question: string;
  /** Slot 1: the finding, as a sentence with a verb. Used on home and on the index. */
  finding: string;
  /** Dataset version shown on the data page. */
  version: string;
  /** Present only once minted. Never write "pending" into the site. */
  doi?: string;
  /** 150–250 words, the whole Korean layer for this project. */
  summaryKo: string;
  /** Explore route exists only where there is an evidence layer to enter. */
  explore?: { href: string; label: string; blurb: string };
};

export const kindLabel: Record<Kind, string> = {
  edition: 'Edition',
  argument: 'Argument',
  investigation: 'Investigation',
};

export const kindGloss: Record<Kind, string> = {
  edition: 'A reconstructed research object other people can use and cite.',
  argument: 'A historical claim carried by a small, fully graded dataset.',
  investigation: 'A methods study in progress: what the sources will and will not support.',
};

export const projects: Project[] = [
  {
    slug: 'janghan',
    href: '/projects/janghan/',
    shortTitle: '長恨 (1927)',
    title: '長恨 (1927): a reconstruction of the contents and a register of the attributions',
    kind: 'edition',
    state: 'frozen',
    stateLabel: 'Issue 1 frozen at v3.3',
    dates: '1927',
    question:
      'What was actually in 長恨, a magazine published by and largely written by kisaeng, when four surviving sources do not agree?',
    finding:
      'Four sources disagree about the contents, and they disagree for a countable reason. Reconstructing the magazine changes what can be said about who wrote it: 51 of 98 texts carry kisaeng attributions, and 8 identities are confirmed.',
    version: 'Issue 1 corpus v3.3 · Issue 2 working layer v3.4',
    summaryKo:
      '1927년 경성에서 장한사가 발행한 잡지 『장한』 두 호의 수록 내용을 네 개의 서로 다른 증거(1927년 원본 스캔, 2009년 영인·자료편, 연세대 목록, 기존 서지)로부터 재구성한 연구입니다. 네 증거는 수록 기사 수를 각각 다르게 기록하는데, 이는 부주의가 아니라 세는 단위가 다르기 때문입니다. 본 연구는 서지 항목·편집 단위·텍스트 항목의 세 층위를 구분하여 기록하며, 두 호를 합쳐 89개 편집 단위 안에 98개 텍스트 항목을 확인했습니다. 서명(byline)은 저자성이 아니라 "그 이름으로 발표되었다"는 증거로만 기록하고, 확정·개연·미확인 등 확실성 등급을 함께 표시합니다. 98개 텍스트 중 51개가 기생 서명이지만 신원이 확정된 경우는 8건에 그칩니다. 저작권 문제로 지면 이미지와 전문 번각은 공개하지 않으며, 메타데이터·구조·증거 관계만 공개합니다. 창간호 말뭉치는 v3.3으로 동결되었고, 2월호는 작업 층위로 남아 있습니다. 장소 분석은 창간호만 코딩된 진행 중 연구입니다.',
    explore: {
      href: '/janghan/',
      label: 'Enter the edition',
      blurb:
        'Both issues item by item, the four witnesses and where they disagree, every byline with its attribution status, and the coded place evidence. Generated from the frozen corpus, so it cannot drift from the data.',
    },
  },
  {
    slug: 'buddhist-bridges',
    href: '/projects/buddhist-bridges/',
    shortTitle: 'Buddhist Bridges',
    title: 'Five bridges, one silence',
    kind: 'argument',
    state: 'frozen',
    stateLabel: 'Dataset frozen at v3.0',
    dates: '300–2026',
    question:
      'Was there ever a continuous Buddhist bridge between India and Korea, and if not, what does the documented record show instead?',
    finding:
      'The documented record shows no continuous bridge. It shows five short-lived bridges built by different kinds of people in different directions, and one interruption five centuries long in which no person, journey, text or institution meets the evidence bar.',
    version: 'v3.0, frozen 17 August 2026, SHA-256 manifest 769b00c67fdd1a6e',
    summaryKo:
      '인도와 한국 사이의 불교 교류를 매개한 인물들을 300년부터 2026년까지 문헌 근거에 따라 기록한 소규모 프로소포그래피입니다. 총 76명을 검토하여 불교 관련성 기준을 통과한 43명을 본 데이터셋에 포함했고, 41건의 이동, 30건의 텍스트, 31개 기관, 19건의 사건이 187개의 등급화된 사료 위에 놓여 있습니다. 수집 원칙은 하나입니다. 문헌 증거 없이 어떤 관계도 "영향"으로 기록하지 않으며, 두 나라 모두와 관련이 있다는 사실만으로는 영향이 되지 않습니다. 결과는 연속된 하나의 다리가 아니라 다섯 개의 짧은 다리이며, 조선 시대 500년(1392–1900)에는 기준을 충족하는 기록이 하나도 없습니다. 이 영(零)은 명시된 포함 기준 아래에서의 발견이며, 접촉이 전혀 없었다는 주장이 아닙니다. 제외된 11명의 후보는 문서화된 음성 사례로 데이터셋에 남아 있습니다. 모든 기록은 확실성 등급과 연대 정밀도를 함께 가지며, 안전한 연대가 없는 기록은 연표에 놓지 않습니다.',
    explore: {
      href: '/projects/buddhist-bridges/explore/',
      label: 'Explore the evidence',
      blurb:
        'One timeline instrument with four question presets, and the register of all 43 mediators. Every person opens to a citable page carrying the full record and its sources.',
    },
  },
  {
    slug: 'hallyu-indian-press',
    href: '/projects/hallyu-indian-press/',
    shortTitle: 'Hallyu in the Indian press',
    title: 'Looking for Hallyu in the Indian press',
    kind: 'investigation',
    state: 'in-progress',
    stateLabel: 'Source audit complete · corpus in development',
    dates: '2000–2026',
    question:
      'What can Indian English-language newspaper archives actually support as evidence about Korean popular culture, and where do they fail?',
    finding:
      'Across 2000 to 2010 the licensed full text of three national dailies holds 10,146 Korea-related articles, and the words Hallyu or Korean wave appear in them exactly once. Every later rise coincides with a change in what the databases hold, so the curve cannot be read as popularity until the denominator is controlled.',
    version: 'Source audit v1, 18 August 2026 · pilot corpus 50 documents',
    summaryKo:
      '2000년부터 2026년까지 인도 영자 일간지가 한국 대중문화를 어떻게 다루었는지 연구하기 위한 말뭉치 구축 및 자료 가용성 조사입니다. 현재 완료된 것은 프레이밍 분석이 아니라 자료 조사 단계이며, 그 결과 자체가 하나의 발견입니다. 라이선스 전문 검색(ProQuest: Times of India, Hindustan Times, Indian Express)에서 2000–2010년 한국 관련 기사는 10,146건이지만 "Hallyu" 또는 "Korean wave"라는 단어는 전 기간에 걸쳐 단 1회 나타납니다. 인터넷 아카이브를 통한 The Hindu 독립 수집에서도 문화 맥락의 한류 표제어는 0건으로, 같은 결과가 독립적으로 확인되었습니다. 또한 각 신문의 전문 수록 개시 연도가 서로 다르고(2005–2015), 2017년부터 온라인판이 색인에 들어오기 때문에 기사 수의 증가를 곧 인기의 증가로 읽을 수 없습니다. 신문 본문은 저작권 대상이므로 이 저장소는 메타데이터·빈도·파생 통계만 공개합니다. 프레이밍 분석은 다음 단계입니다.',
  },
];

export const byState: Record<State, string> = {
  'in-progress': 'In progress',
  frozen: 'Frozen',
  released: 'Released',
};
