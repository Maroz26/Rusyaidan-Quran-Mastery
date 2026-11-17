import quranDataUrl from '../data/quranData.json?url';
import surahListJson from '../data/surahList.json';
import type { QuranVerse, StudyCollection, SurahInfo } from '../types/quran';

const surahs: SurahInfo[] = surahListJson as SurahInfo[];
let verses: QuranVerse[] = [];

let verseMap = new Map<string, QuranVerse>();
let quranDataPromise: Promise<void> | null = null;

// Map for surah lookup by number
const surahMap = new Map<number, SurahInfo>();
for (const s of surahs) {
  surahMap.set(s.number, s);
}

export function initializeQuranData(): Promise<void> {
  if (!quranDataPromise) {
    quranDataPromise = (async () => {
      const response = await fetch(quranDataUrl);
      if (!response.ok) {
        throw new Error(`Failed to load Quran text dataset: HTTP ${response.status}`);
      }

      const data: unknown = await response.json();
      if (
        typeof data !== 'object' ||
        data === null ||
        !('verses' in data) ||
        !Array.isArray(data.verses)
      ) {
        throw new Error('Quran text dataset has an invalid format.');
      }

      const expectedVerseCount = surahs.reduce((count, surah) => count + surah.numberOfAyahs, 0);
      if (data.verses.length !== expectedVerseCount) {
        throw new Error(
          `Quran text dataset is incomplete: expected ${expectedVerseCount} verses, got ${data.verses.length}.`,
        );
      }

      const loadedVerses = data.verses as QuranVerse[];
      const loadedVerseMap = new Map<string, QuranVerse>();
      for (const verse of loadedVerses) {
        if (
          !Number.isInteger(verse.surahNumber) ||
          !Number.isInteger(verse.verseNumber) ||
          typeof verse.arabicText !== 'string' ||
          !verse.arabicText.trim()
        ) {
          throw new Error('Quran text dataset contains an invalid verse.');
        }

        const key = `${verse.surahNumber}:${verse.verseNumber}`;
        if (loadedVerseMap.has(key)) {
          throw new Error(`Quran text dataset contains a duplicate verse: ${key}.`);
        }
        loadedVerseMap.set(key, verse);
      }

      for (const surah of surahs) {
        for (let verseNumber = 1; verseNumber <= surah.numberOfAyahs; verseNumber += 1) {
          if (!loadedVerseMap.has(`${surah.number}:${verseNumber}`)) {
            throw new Error(`Quran text dataset is missing verse ${surah.number}:${verseNumber}.`);
          }
        }
      }

      verses = loadedVerses;
      verseMap = loadedVerseMap;
    })().catch((error: unknown) => {
      quranDataPromise = null;
      throw error;
    });
  }

  return quranDataPromise;
}

/**
 * Returns all 114 Surahs metadata
 */
export function getSurahList(): SurahInfo[] {
  return surahs;
}

/**
 * Returns metadata for a specific Surah
 */
export function getSurah(surahNumber: number): SurahInfo | undefined {
  return surahMap.get(surahNumber);
}

/**
 * Retrieves a single verse by Surah number and Verse number
 * e.g. getVerse(7, 36) -> QuranVerse for Al-A'raf verse 36
 */
export function getVerse(surahNumber: number, verseNumber: number): QuranVerse | undefined {
  return verseMap.get(`${surahNumber}:${verseNumber}`);
}

/**
 * Checks if a verse is loaded in the local dataset
 */
export function isVerseAvailable(surahNumber: number, verseNumber: number): boolean {
  return verseMap.has(`${surahNumber}:${verseNumber}`);
}

/**
 * Retrieves all available verses for a given Surah
 */
export function getVersesBySurah(surahNumber: number): QuranVerse[] {
  return verses.filter((v) => v.surahNumber === surahNumber);
}

/**
 * Converts Western digits (0-9) to Eastern Arabic-Indic digits (٠-٩)
 */
export function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const d = parseInt(char, 10);
      return !isNaN(d) ? arabicDigits[d] : char;
    })
    .join('');
}

/**
 * Formats a verse with an Arabic end-of-ayah marker
 */
export function formatVerseWithMarker(verseText: string, verseNum: number): string {
  const arabicNum = toArabicNumerals(verseNum);
  return `${verseText.trim()} ﴿${arabicNum}﴾`;
}

/**
 * Produces a shortened preview of Arabic verse text (e.g., first 5-8 words + ellipsis)
 */
export function getShortArabicPreview(arabicText: string, maxWords: number = 7): string {
  const words = arabicText.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return arabicText.trim();
  }
  return `${words.slice(0, maxWords).join(' ')}...`;
}

/**
 * Default initial study collections (Al-A'raf and At-Tawbah)
 */
export function getInitialSeedCollections(): StudyCollection[] {
  const alAraf = getSurah(7);
  const atTawbah = getSurah(9);

  return [
    {
      id: 'surah-7',
      type: 'surah',
      referenceNumber: 7,
      name: "Al-A'raf",
      arabicName: alAraf?.name || 'سُورَةُ الأَعۡرَافِ',
      englishName: alAraf?.englishName || "Al-A'raaf",
      numberOfVerses: alAraf?.numberOfAyahs || 206,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surah-9',
      type: 'surah',
      referenceNumber: 9,
      name: 'At-Tawbah',
      arabicName: atTawbah?.name || 'سُورَةُ التَّوۡبَةِ',
      englishName: atTawbah?.englishName || 'At-Tawba',
      numberOfVerses: atTawbah?.numberOfAyahs || 129,
      createdAt: new Date().toISOString(),
    },
  ];
}
