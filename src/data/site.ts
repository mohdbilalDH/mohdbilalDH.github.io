export const site = {
  name: 'Mohd Bilal',
  title: 'Mohd Bilal — Korean Studies & Digital Humanities',
  description:
    'Mohd Bilal — Korean Studies and Digital Humanities. Small, fully documented datasets on modern Korean history, colonial-era print culture, kisaeng studies, and the connections between Korea and South Asia.',
  url: 'https://mohdbilaldh.github.io',
  role: 'Korean Studies · Digital Humanities',
  affiliation: 'Division of Global Korean Studies, The Academy of Korean Studies, Seongnam, Republic of Korea',
  affiliationShort: 'The Academy of Korean Studies',
  affiliationKo: '한국학중앙연구원 한국학대학원 글로벌한국학부',
  email: 'mohdbilalkhan2017@gmail.com',
  github: 'https://github.com/mohdbilalDH',
  githubLabel: 'github.com/mohdbilalDH',
  orcid: 'https://orcid.org/0009-0007-8367-4690',
  orcidId: '0009-0007-8367-4690',

  /** The thesis sentence. This is what the home page opens with, and it is not a job description. */
  thesis:
    'I build small, fully documented datasets about Korea and its connections with South Asia, and I design them to show what the sources cannot support as clearly as what they can.',

  lede:
    'M.A. student in Korean Studies at The Academy of Korean Studies, working on modern Korean history and its cultural afterlives, between the colonial period and the contemporary moment, and between archival and computational methods.',

  bio: [
    'My research centres on gender and cultural history in modern Korea, with a particular interest in how women appear — and are made to appear — in the print culture of colonial Korea. Much of my current work concerns <em>kisaeng</em>, and how the periodical press of the 1920s and 1930s framed them as both objects of nostalgia and figures of modern anxiety. The sources are uneven, censored, and often hostile to the people they describe, which makes reading them a methodological problem as much as a historical one.',
    'I also work on the Korean Wave — particularly how Korean popular culture has been received and reframed in Indian media — and on comparisons between Korea and South Asia: colonial modernity, gendered performance traditions, and the uneven ways cultural forms travel between the two regions.',
    'The computational side of this work runs through corpus construction from historical newspapers, text analysis of Hangŭl–Hanja mixed sources, historical GIS, and network analysis. Colonial-era sources are fragmentary and full of uncertainty about dates, names, and authorship; most computational work smooths that uncertainty away. I would rather represent it, and the <a href="/method/">method these projects share</a> is built around doing so.',
  ],

  bioKo:
    '한국학중앙연구원 한국학대학원 글로벌한국학부 석사과정에 재학 중이며, 근대 한국사와 그 문화적 후과(後果)를 연구합니다. 주요 관심 분야는 식민지기 인쇄문화 속의 젠더, 특히 기생(妓生)의 재현과 자기 서술, 인도 미디어에서의 한류 수용, 그리고 한국과 남아시아를 잇는 역사적 교류입니다. 방법론적으로는 역사 신문·잡지 말뭉치 구축, 한글–한자 혼용 자료의 텍스트 분석, 역사 GIS, 네트워크 분석을 사용하되, 식민지기 자료의 불확실성을 지우지 않고 그대로 드러내는 시각화를 지향합니다.',

  contactLede:
    'I am always glad to hear from people working on adjacent questions — in Korean Studies, digital humanities, or comparative colonial history.',
  contactNote:
    "For questions about a specific project's data or method, each project's data page carries citation and licensing details; corrections to any dataset are welcome by email.",

  /** Four items. The lockup is the home link; the CV is reached from About. */
  nav: [
    { href: '/projects/', label: 'Projects', key: 'projects' },
    { href: '/method/', label: 'Method', key: 'method' },
    { href: '/writing/', label: 'Writing', key: 'writing' },
    { href: '/about/', label: 'About', key: 'about' },
  ],
} as const;
