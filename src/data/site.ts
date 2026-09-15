export const site = {
  name: 'Mohd Bilal',
  title: 'Mohd Bilal — Korean Studies & Digital Humanities',
  description:
    'Mohd Bilal — Korean Studies and Digital Humanities. Modern Korean history, colonial-era cultural history, gender, kisaeng studies, and computational research on Korea and India.',
  url: 'https://mohdbilaldh.github.io',
  role: 'Korean Studies · Digital Humanities',
  affiliation: 'Division of Global Korean Studies, The Academy of Korean Studies, Seongnam, Republic of Korea',
  affiliationShort: 'The Academy of Korean Studies',
  email: 'mohdbilalkhan2017@gmail.com',
  github: 'https://github.com/mohdbilalDH',
  githubLabel: 'github.com/mohdbilalDH',
  orcid: 'https://orcid.org/0009-0007-8367-4690',
  orcidId: '0009-0007-8367-4690',
  lede:
    'M.A. student in Korean Studies at The Academy of Korean Studies, working on modern Korean history and its cultural afterlives — between the colonial period and the contemporary moment, and between archival and computational methods.',
  bio: [
    'My research centres on gender and cultural history in modern Korea, with a particular interest in how women appear — and are made to appear — in the print culture of colonial Korea. Much of my current work concerns <em>kisaeng</em>, and how the periodical press of the 1920s and 1930s framed them as both objects of nostalgia and figures of modern anxiety. The sources are uneven, censored, and often hostile to the people they describe, which makes reading them a methodological problem as much as a historical one.',
    'I also work on the Korean Wave — particularly how Korean popular culture has been received and reframed in Indian media — and on comparisons between Korea and South Asia: colonial modernity, gendered performance traditions, and the uneven ways cultural forms travel between the two regions.',
    'The computational side of this work runs through corpus construction from historical newspapers, text analysis of Hangul–Hanja mixed sources, historical GIS, and network analysis. Colonial-era sources are fragmentary and full of uncertainty about dates, names, and authorship; most computational work smooths that uncertainty away. I would rather represent it — building projects that show the limits of what the archive can support, alongside what it reveals.',
  ],
  contactLede:
    'I am always glad to hear from people working on adjacent questions — in Korean Studies, digital humanities, or comparative colonial history.',
  contactNote:
    "For questions about a specific project's data or method, the project pages carry citation and licensing details; corrections to any dataset are welcome by email.",
  nav: [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/about/', label: 'About', key: 'about' },
    { href: '/projects/', label: 'Projects', key: 'projects' },
    { href: '/publications/', label: 'Publications', key: 'publications' },
    { href: '/visualizations/', label: 'Visualizations', key: 'visualizations' },
    { href: '/cv/', label: 'CV', key: 'cv' },
    { href: '/contact/', label: 'Contact', key: 'contact' },
  ],
} as const;
