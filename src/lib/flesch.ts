import type { FleschResult } from "@/types";

/**
 * Counts syllables in a word using a vowel-group heuristic.
 *
 * Algorithm:
 * 1. Count groups of consecutive vowels (a, e, i, o, u, y).
 * 2. Subtract 1 for silent trailing 'e'.
 * 3. Add 1 for words ending in 'le' preceded by a consonant.
 * 4. Ensure minimum of 1 syllable per word.
 *
 * Note: This is a standard heuristic, not perfect. Edge cases with
 * abbreviations and numerals may produce slightly different scores
 * than reference implementations. (Flagged as assumption #10)
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 2) return 1;

  let count = 0;
  const vowels = "aeiouy";
  let prevIsVowel = false;

  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }

  // Silent 'e' at the end
  if (w.endsWith("e") && !w.endsWith("le")) {
    count--;
  }

  // Words like "table" — 'le' preceded by a consonant adds a syllable
  if (w.endsWith("le") && w.length > 2 && !vowels.includes(w[w.length - 3])) {
    // Already counted by the vowel group, no adjustment needed
  }

  return Math.max(1, count);
}

/**
 * Splits text into sentences using punctuation delimiters.
 * Handles common abbreviations (Mr., Dr., etc.) by not splitting on them.
 */
export function countSentences(text: string): number {
  if (!text.trim()) return 0;

  // Replace common abbreviations to avoid false sentence splits
  const cleaned = text
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Ave|Blvd|etc|vs|e\.g|i\.e)\./gi, "$1___DOT___");

  // Split on sentence-ending punctuation
  const sentences = cleaned
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return Math.max(1, sentences.length);
}

/**
 * Splits text into words.
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;

  return text
    .split(/\s+/)
    .filter((w) => w.replace(/[^a-zA-Z0-9]/g, "").length > 0).length;
}

/**
 * Calculates Flesch Reading Ease Score (FRES) and Flesch-Kincaid Grade Level (FGL).
 *
 * FRES = 206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
 * FGL  = 0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
 *
 * R5 (FR-FRE 1): The system shall calculate FRES and FGL for a textual document,
 * along with word and sentence counts.
 */
export function calculateFlesch(text: string): FleschResult {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);

  if (wordCount === 0 || sentenceCount === 0) {
    return { fres: 0, fgl: 0, wordCount: 0, sentenceCount: 0, syllableCount: 0 };
  }

  // Count total syllables
  const words = text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z0-9]/g, "").length > 0);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  const fres = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fgl = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return {
    fres: Math.round(fres * 100) / 100,
    fgl: Math.round(fgl * 100) / 100,
    wordCount,
    sentenceCount,
    syllableCount,
  };
}
