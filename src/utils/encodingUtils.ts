/**
 * Utility for sanitizing and repairing corrupted UTF-8 character encoding (mojibake).
 * Fixes common artifacts like 'Ã©' -> 'é', 'Ã ' -> 'à', 'Ã¨' -> 'è', 'â€™' -> '’', etc.
 */

const MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
  // Common specific words
  [/MathÃ©matiques/gi, 'Mathématiques'],
  [/FranÃ§ais/gi, 'Français'],
  [/GÃ©ographie/gi, 'Géographie'],
  [/Ã‰ducation/gi, 'Éducation'],

  // Lowercase accented characters
  [/Ã©/g, 'é'],
  [/Ã¨/g, 'è'],
  [/Ãª/g, 'ê'],
  [/Ã«/g, 'ë'],
  [/Ã /g, 'à'],
  [/Ã¢/g, 'â'],
  [/Ã®/g, 'î'],
  [/Ã¯/g, 'ï'],
  [/Ã´/g, 'ô'],
  [/Ã¹/g, 'ù'],
  [/Ã»/g, 'û'],
  [/Ã¼/g, 'ü'],
  [/Ã§/g, 'ç'],

  // Uppercase accented characters
  [/Ã€/g, 'À'],
  [/Ã‰/g, 'É'],
  [/Ãˆ/g, 'È'],
  [/ÃŠ/g, 'Ê'],
  [/Ã‡/g, 'Ç'],
  [/Ã”/g, 'Ô'],
  [/ÃŽ/g, 'Î'],

  // Quotes and punctuation
  [/â€™/g, '’'],
  [/â€˜/g, '‘'],
  [/â€œ/g, '“'],
  [/â€/g, '”'],
  [/â€/g, '”'],
  [/Â°/g, '°'],
  [/Â«/g, '«'],
  [/Â»/g, '»'],
  [/Â·/g, '·'],
  [/Â–/g, '–'],
  [/Â—/g, '—'],
  [/Â/g, ''],
];

/**
 * Sanitizes a single string from corrupted UTF-8 mojibake
 */
export function cleanUtf8(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return input || '';
  let result = input;
  for (const [regex, replacement] of MOJIBAKE_REPLACEMENTS) {
    if (regex.test(result)) {
      result = result.replace(regex, replacement);
    }
  }
  return result;
}

/**
 * Recursively sanitizes any object or array of string fields
 */
export function cleanObjectUtf8<T>(data: T): T {
  if (!data) return data;
  if (typeof data === 'string') {
    return cleanUtf8(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanObjectUtf8(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(data as any)) {
      cleaned[key] = cleanObjectUtf8((data as any)[key]);
    }
    return cleaned;
  }
  return data;
}

/**
 * Normalizes subject names for resilient matching regardless of accents or encoding
 */
export function normalizeSubjectName(name: string | undefined | null): string {
  if (!name) return '';
  return cleanUtf8(name)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents for comparison
}

export function getSubjectCanonicalKey(name: string | undefined | null): string {
  if (!name) return '';
  const clean = normalizeSubjectName(name);
  if (/^math/i.test(clean)) return 'maths';
  if (/^fran/i.test(clean) || clean === 'lettres') return 'francais';
  if (/^ang/i.test(clean) || clean === 'english') return 'anglais';
  if (/^(phys|chim|sc.*phys|pc)/i.test(clean)) return 'physique';
  if (/^(svt|bio|sc.*vie)/i.test(clean)) return 'svt';
  if (/^(hg|hist|geo)/i.test(clean)) return 'histoire-geo';
  if (/^(eps|sport|ed.*phys)/i.test(clean)) return 'eps';
  if (/^(philo)/i.test(clean)) return 'philosophie';
  if (/^(info|tic|techno)/i.test(clean)) return 'informatique';
  if (/^(esp)/i.test(clean)) return 'espagnol';
  if (/^(all)/i.test(clean)) return 'allemand';
  if (/^(art)/i.test(clean)) return 'arts';
  if (/^(mus)/i.test(clean)) return 'musique';
  if (/^(edhc|civique|morale)/i.test(clean)) return 'edhc';
  return clean;
}

/**
 * Compares two subject names leniently (handles accents, casing, spacing, mojibake and abbreviations)
 */
export function isSameSubject(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  const normA = normalizeSubjectName(a);
  const normB = normalizeSubjectName(b);
  if (normA === normB) return true;
  const keyA = getSubjectCanonicalKey(a);
  const keyB = getSubjectCanonicalKey(b);
  if (keyA && keyB && keyA === keyB) return true;
  if ((normA.length >= 4 && normB.includes(normA)) || (normB.length >= 4 && normA.includes(normB))) return true;
  return false;
}

