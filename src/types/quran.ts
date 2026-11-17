export interface QuranVerse {
  surahNumber: number;
  surahName: string;
  surahEnglishName?: string;
  verseNumber: number;
  arabicText: string;
  juzNumber?: number;
  page?: number;
  manzil?: number;
  ruku?: number;
  sajda?: boolean;
}

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan' | string;
}

export type CollectionType = 'surah' | 'juz';

export interface StudyCollection {
  id: string;
  type: CollectionType;
  referenceNumber: number;
  name: string;
  arabicName?: string;
  englishName?: string;
  numberOfVerses?: number;
  createdAt: string;
}

export interface VerseTransition {
  id: string;
  collectionId: string;
  surahNumber: number;
  firstVerseNumber: number;
  nextVerseNumber: number;
  memorizationScore: number; // 1 to 10, default 5
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TransitionWithVerses {
  transition: VerseTransition;
  firstVerse: QuranVerse;
  nextVerse: QuranVerse;
}

export type ActiveScreen = 
  | { type: 'home' }
  | { type: 'surah-detail'; collectionId: string }
  | { type: 'transition-list'; collectionId: string }
  | { type: 'juz-transition-list'; juzNumber: number }
  | { type: 'random-practice'; collectionId: string };
