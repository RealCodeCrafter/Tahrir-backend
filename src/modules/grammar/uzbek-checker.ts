import { IssueType } from '../../common/enums';

export interface GrammarIssue {
  start: number;
  end: number;
  suggestion: string;
  message: string;
  type: IssueType;
}

const EXACT: Record<string, string> = {
  kop: "ko'p",
  kopincha: "ko'pincha",
  koproq: "ko'proq",
  kopchilik: "ko'pchilik",
  bolsa: "bo'lsa",
  boladi: "bo'ladi",
  bolmaydi: "bo'lmaydi",
  bolgan: "bo'lgan",
  boldi: "bo'ldi",
  bolib: "bo'lib",
  bolish: "bo'lish",
  qoshish: "qo'shish",
  organish: "o'rganish",
  organadi: "o'rganadi",
  organaman: "o'rganaman",
};

const STEMS: Array<[string, string]> = [
  ['korsat', "ko'rsat"],
  ['korin', "ko'rin"],
  ['ozbek', "o'zbek"],
  ['ozgar', "o'zgar"],
  ['goya', "g'oya"],
  ['gozal', "go'zal"],
  ['togri', "to'g'ri"],
  ['malumot', "ma'lumot"],
  ['qollab', "qo'llab"],
  ['qollan', "qo'llan"],
  ['tolov', "to'lov"],
  ['toliq', "to'liq"],
  ['olchov', "o'lchov"],
  ['oquvchi', "o'quvchi"],
  ['oqituvchi', "o'qituvchi"],
  ['qoshimcha', "qo'shimcha"],
  ['bolim', "bo'lim"],
  ['kopayt', "ko'payt"],
  ['talim', "ta'lim"],
];

function matchCase(src: string, out: string): string {
  if (src.length > 1 && src === src.toUpperCase()) return out.toUpperCase();
  if (src[0] !== src[0].toLowerCase()) {
    return out[0].toUpperCase() + out.slice(1);
  }
  return out;
}

function fixWord(word: string): string | null {
  const lower = word.toLowerCase();
  if (EXACT[lower]) return matchCase(word, EXACT[lower]);
  for (const [wrong, right] of STEMS) {
    if (lower.startsWith(wrong)) {
      return matchCase(word, right + lower.slice(wrong.length));
    }
  }
  return null;
}

const WORD = "[\\p{L}'’ʻ‘]";
const WS = '[ \\t\\u00A0]';

export function checkUzbek(text: string): GrammarIssue[] {
  const found: GrammarIssue[] = [];

  for (const m of text.matchAll(new RegExp(`${WORD}+`, 'gu'))) {
    const fixed = fixWord(m[0]);
    if (fixed && fixed !== m[0] && m.index !== undefined) {
      found.push({
        start: m.index,
        end: m.index + m[0].length,
        suggestion: fixed,
        message: `To'g'ri yozilishi: «${fixed}». Tutuq belgisi (') qo'yiladi.`,
        type: IssueType.SPELLING,
      });
    }
  }

  for (const m of text.matchAll(
    new RegExp(`(^|[^\\p{L}'’ʻ‘])(${WORD}+)${WS}+\\2(?!${WORD})`, 'giu'),
  )) {
    if (m.index === undefined) continue;
    const start = m.index + m[1].length;
    found.push({
      start,
      end: m.index + m[0].length,
      suggestion: m[2],
      message: "So'z ketma-ket ikki marta yozilgan.",
      type: IssueType.STYLE,
    });
  }

  for (const m of text.matchAll(new RegExp(`${WS}{2,}`, 'g'))) {
    if (m.index === undefined) continue;
    found.push({
      start: m.index,
      end: m.index + m[0].length,
      suggestion: ' ',
      message: "Ortiqcha bo'shliq bor.",
      type: IssueType.STYLE,
    });
  }

  for (const m of text.matchAll(new RegExp(`${WS}+([.,!?;:])`, 'g'))) {
    if (m.index === undefined) continue;
    found.push({
      start: m.index,
      end: m.index + m[0].length,
      suggestion: m[1],
      message: "Tinish belgisidan oldin bo'shliq qo'yilmaydi.",
      type: IssueType.PUNCT,
    });
  }

  for (const m of text.matchAll(
    new RegExp(`(^|[.!?]["»”)]?${WS}+|\\n${WS}*)(\\p{Ll}${WORD}*)`, 'gu'),
  )) {
    if (m.index === undefined) continue;
    const start = m.index + m[1].length;
    found.push({
      start,
      end: start + m[2].length,
      suggestion: m[2][0].toUpperCase() + m[2].slice(1),
      message: 'Gap bosh harf bilan boshlanadi.',
      type: IssueType.STYLE,
    });
  }

  return found;
}

export function countWords(text: string): number {
  return (text.match(/[\p{L}\p{N}'’ʻ‘-]+/gu) || []).length;
}

export function rewriteText(text: string, style: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  switch (style) {
    case 'simpler':
      return cleaned
        .replace(/juda muhim/gi, 'muhim')
        .replace(/professional/gi, 'ishonchli')
        .replace(/yordam beradi/gi, 'yordam qiladi');
    case 'formal':
      return cleaned
        .replace(/biz /gi, 'jamoa ')
        .replace(/juda /gi, '');
    case 'shorter':
      return cleaned.split(/[.!?]/).filter(Boolean).slice(0, 2).join('. ').trim() + '.';
    case 'detailed':
      return `${cleaned} Bu yondashuv matnni aniqroq, tushunarliroq va maqsadga mosroq qiladi.`;
    default:
      return cleaned;
  }
}

export function analyzeText(text: string) {
  const issues = checkUzbek(text);
  const spelling = issues.filter((i) => i.type === IssueType.SPELLING).length;
  const style = issues.filter((i) => i.type === IssueType.STYLE).length;
  const punct = issues.filter((i) => i.type === IssueType.PUNCT).length;
  const words = countWords(text);

  return {
    words,
    chars: text.replace(/\n/g, '').length,
    issues: issues.length,
    grammar: spelling ? `${spelling} ta taklif` : 'Yaxshi',
    clarity: style ? `${style} ta taklif` : 'Yaxshi',
    tone: spelling + style > 4 ? "Yaxshilash kerak" : 'Yaxshi',
    readability: words > 0 && words < 400 ? 'Yaxshi' : "O'rtacha",
    punctuation: punct ? `${punct} ta taklif` : 'Yaxshi',
  };
}
