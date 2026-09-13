export type Entry = { when: string; role: string; org?: string; detail?: string };

export const cv = {
  headline: 'Korean Studies · Modern Korean History · Gender & Cultural History · Digital Humanities',
  profile:
    'Korean Studies scholar specializing in modern and contemporary Korean history, colonial-era cultural history, gender history, and kisaeng studies. My research also engages with comparative Korean–Indian cultural history and Digital Humanities approaches to historical and cultural materials, examining gender, performance, cultural memory, representation, and cultural exchange across Korea and India.',
  education: [
    { when: '2024–present', role: 'M.A. in Korean Studies', org: 'The Academy of Korean Studies, Republic of Korea' },
    { when: 'Fall 2025', role: 'Exchange Student, International College', org: 'Seoul National University, Republic of Korea', detail: 'GPA 4.3/4.3' },
    { when: '2020–2023', role: 'B.A. in Korean Studies', org: 'Jawaharlal Nehru University, New Delhi, India', detail: 'GPA 3.43/4.00' },
  ] as Entry[],
  experience: [
    {
      when: '2025–present',
      role: 'Graduate Teaching Assistant',
      org: 'Division of Global Korean Studies, The Academy of Korean Studies',
      detail:
        'Support teaching and academic activities across departmental courses and programs: course administration, preparation of academic materials, coordination of lectures and seminars, academic communication, proofreading, data collection, and departmental documents and reports.',
    },
    {
      when: '2025',
      role: 'K-Campus Ambassador',
      org: 'JoongAng Ilbo, Seoul, Republic of Korea (March–August 2025)',
      detail:
        "Selected through JoongAng Ilbo's K-Culture platform; digital media and cultural communication activities, cross-cultural public engagement, and collaboration with student ambassadors from diverse national backgrounds.",
    },
    {
      when: '2024',
      role: 'University Research Assistant',
      org: 'The Academy of Korean Studies (September–December 2024)',
      detail:
        'Research Assistant on faculty-led project AKSR2024-C19: organization and execution of the 2024 AKS International Conference “A History of Luxury Goods Trade Network in Asia.” Coordinated international scholars and logistics; proofread research papers and assisted in preparing conference proceedings, program, and schedule.',
    },
  ] as Entry[],
  training: [
    { when: '2026', role: 'The 11th RIKS Academy for Young Scholars of Korean Studies', org: 'Research Institute of Korean Studies (RIKS), Korea University (August 3–7, 2026)' },
    { when: '2026', role: '20th Kyujanggak Korean Studies Summer School and Classical Chinese Workshop', org: 'Seoul National University (June–July 2026)' },
    { when: '2023', role: '17th Kyujanggak Korean Studies Summer Workshop', org: 'Seoul National University (July 2023)' },
    { when: '2022', role: '33rd AKS Summer Program for International Students', org: 'The Academy of Korean Studies (August 2022)' },
  ] as Entry[],
  awards: [
    { when: '2024–present', role: "Academy of Korean Studies Graduate Scholarship for Master's Degree", detail: 'Full tuition, monthly living stipend, research support, and Korean language training.' },
    { when: '2023–2024', role: 'Korea Foundation (KF) Scholarship for Graduate Studies', detail: "Awarded for research on Korea's kisaeng and India's devadasi." },
  ] as Entry[],
  memberships: 'The Korean Association for Digital Humanities (KADH) · Royal Asiatic Society Korea Branch · Association for Korean Studies in Europe (AKSE)',
  languages: 'Hindi (native) · English (academic fluency) · Korean (advanced) · Classical Chinese (intermediate)',
};
