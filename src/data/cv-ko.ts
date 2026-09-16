// The Korean layer of the CV. English remains the record in cv.ts; this file carries only what
// has to be said in Korean, entry by entry, in the same order. Publication and presentation
// titles are not translated: a published title is cited as published, so it stays checkable.
import type { Entry } from './cv';

export type EntryKo = { when: string; role: string; org?: string; detail?: string };

export const cvKo = {
  /** The name as it is registered, with the Latin form kept beside it. */
  name: '모드 빌랄',
  nameLatin: 'Mohd Bilal',
  eyebrow: '이력서',
  affiliation: '한국학중앙연구원 한국학대학원, 경기도 성남',
  headline: '한국학 · 한국근현대사 · 젠더 및 문화사 · 디지털인문학',
  profile:
    '한국 근현대사와 식민지기 문화사, 젠더사, 그리고 기생(妓生) 연구를 중심으로 하는 한국학 연구자입니다. ' +
    '아울러 한국과 인도의 비교문화사, 그리고 역사·문화 자료에 대한 디지털인문학적 접근을 함께 다루며, ' +
    '두 지역에 걸친 젠더와 연행, 문화적 기억, 재현, 문화 교류를 연구하고 있습니다.',

  sections: {
    profile: '연구 개요',
    education: '학력',
    experience: '연구 및 실무 경력',
    awards: '수상 및 장학',
    publications: '논문',
    presentations: '학술대회 발표',
    training: '학술 연수',
    memberships: '학회 활동',
    languages: '언어',
  },

  education: [
    { when: '2024–현재', role: '한국학 석사과정', org: '한국학중앙연구원 한국학대학원' },
    { when: '2025년 가을학기', role: '교환학생, 국제대학원(GSIS)', org: '서울대학교', detail: '학점 4.3/4.3' },
    { when: '2020–2023', role: '한국학 학사', org: '자와할랄 네루 대학교(JNU), 인도 뉴델리', detail: '학점 3.43/4.00' },
  ] as EntryKo[],

  experience: [
    {
      when: '2025–현재',
      role: '대학원 조교',
      org: '한국학중앙연구원 글로벌한국학부',
      detail:
        '학부 교과목 및 학사 운영 전반을 지원합니다. 강의 행정, 학술 자료 작성, 강연·세미나 운영, ' +
        '학사 관련 연락, 교정, 자료 수집, 각종 문서와 보고서 작성을 담당합니다.',
    },
    {
      when: '2025',
      role: 'K-Campus 앰배서더',
      org: '중앙일보, 서울 (2025년 3월–8월)',
      detail:
        '중앙일보 K-Culture 플랫폼을 통해 선발되었습니다. 디지털 미디어와 문화 커뮤니케이션 활동, ' +
        '다문화 대상 공공 소통, 여러 국적의 학생 앰배서더들과의 협업을 수행했습니다.',
    },
    {
      when: '2024',
      role: '연구보조원',
      org: '한국학중앙연구원 (2024년 9월–12월)',
      detail:
        '교수 연구과제 AKSR2024-C19의 연구보조원으로서 2024년 한국학중앙연구원 국제학술회의 ' +
        '「아시아 사치품 교역 네트워크의 역사」의 기획과 운영을 맡았습니다. 해외 연구자 응대와 실무를 조율하고, ' +
        '연구 논문을 교정했으며, 발표 논문집과 프로그램, 일정 준비를 지원했습니다.',
    },
  ] as EntryKo[],

  training: [
    { when: '2026', role: '제11회 RIKS 한국학 신진학자 아카데미', org: '고려대학교 민족문화연구원 (2026년 8월 3–7일)' },
    { when: '2026', role: '제20회 규장각 한국학 여름학교 및 한문 워크숍', org: '서울대학교 (2026년 6–7월)' },
    { when: '2023', role: '제17회 규장각 한국학 여름 워크숍', org: '서울대학교 (2023년 7월)' },
    { when: '2022', role: '제33회 한국학중앙연구원 외국인 학생 여름 프로그램', org: '한국학중앙연구원 (2022년 8월)' },
  ] as EntryKo[],

  awards: [
    {
      when: '2024–현재',
      role: '한국학중앙연구원 대학원 석사과정 장학금',
      detail: '등록금 전액, 매월 생활비, 연구 지원, 한국어 교육을 포함합니다.',
    },
    {
      when: '2023–2024',
      role: '한국국제교류재단(KF) 대학원 장학금',
      detail: '한국의 기생(妓生)과 인도의 데바다시(devadasi)를 비교하는 연구로 선정되었습니다.',
    },
  ] as EntryKo[],

  memberships: '한국디지털인문학협의회(KADH) · 왕립아시아학회 한국지부(RAS Korea) · 유럽한국학회(AKSE)',
  languages: '힌디어(모어) · 영어(학술 구사) · 한국어(고급) · 한문(중급)',

  /** Labels that belong to a publication's state rather than to any one entry. */
  forthcoming: '게재 예정',
  underReview: '심사 중',
  titleNote: '논문과 발표 제목은 발표된 형태 그대로 두었습니다.',
  toEnglish: 'English CV',
};

/** The English CV's free-text dates rendered in Korean. "August 20–22, 2026" becomes "2026년 8월 20–22일";
 *  anything the pattern does not recognise is passed through unchanged rather than guessed at. */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
export const koDate = (when: string): string => {
  const m = when.match(/^([A-Z][a-z]+)\s*([\d\u2013\u2014-]*)\s*,?\s*(\d{4})$/);
  if (!m) return when;
  const i = MONTHS.indexOf(m[1]);
  if (i < 0) return when;
  const days = m[2] ? ` ${m[2].replace(/[\u2014-]/g, '\u2013')}일` : '';
  return `${m[3]}년 ${i + 1}월${days}`;
};

/** Guard: the Korean layer must stay the same length as the English record it mirrors. */
export const mirrors = (en: Entry[], ko: EntryKo[]) => en.length === ko.length;
