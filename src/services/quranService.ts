import quranDataJson from '../data/quranData.json';
import surahListJson from '../data/surahList.json';
import type { QuranVerse, StudyCollection, SurahInfo } from '../types/quran';

const surahs: SurahInfo[] = surahListJson as SurahInfo[];
const verses: QuranVerse[] = quranDataJson.verses as QuranVerse[];

// Quick lookup map: "surahNumber:verseNumber" -> QuranVerse
const verseMap = new Map<string, QuranVerse>();
for (const v of verses) {
  verseMap.set(`${v.surahNumber}:${v.verseNumber}`, v);
}

// Map for surah lookup by number
const surahMap = new Map<number, SurahInfo>();
for (const s of surahs) {
  surahMap.set(s.number, s);
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
