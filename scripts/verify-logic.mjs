import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quranDataPath = path.resolve(__dirname, '../src/data/quranData.json');
const surahListPath = path.resolve(__dirname, '../src/data/surahList.json');

const quranData = JSON.parse(fs.readFileSync(quranDataPath, 'utf8'));
const surahList = JSON.parse(fs.readFileSync(surahListPath, 'utf8'));

console.log('--- TEST 1: Surah Metadata Verification ---');
console.log(`Total Surahs in metadata: ${surahList.length}`);
if (surahList.length !== 114) {
  throw new Error(`Expected 114 surahs, got ${surahList.length}`);
}

const surah7 = surahList.find(s => s.number === 7);
const surah9 = surahList.find(s => s.number === 9);
console.log(`Surah 7: ${surah7.englishName} (${surah7.name}), ${surah7.numberOfAyahs} ayahs`);
console.log(`Surah 9: ${surah9.englishName} (${surah9.name}), ${surah9.numberOfAyahs} ayahs`);

if (!surah7 || surah7.numberOfAyahs !== 206) throw new Error('Surah 7 metadata invalid');
if (!surah9 || surah9.numberOfAyahs !== 129) throw new Error('Surah 9 metadata invalid');

console.log('\n--- TEST 2: Verified Arabic Text Retrieval (Al-A\'raf 36 & 37) ---');
const v36 = quranData.verses.find(v => v.surahNumber === 7 && v.verseNumber === 36);
const v37 = quranData.verses.find(v => v.surahNumber === 7 && v.verseNumber === 37);

if (!v36) throw new Error('Verse 7:36 not found!');
if (!v37) throw new Error('Verse 7:37 not found!');

console.log('Ayah 7:36 text:', v36.arabicText);
console.log('Ayah 7:37 text:', v37.arabicText);

// Verify expected words from prompt
if (!v36.arabicText.includes('وَٱلَّذِينَ كَذَّبُوا۟ بِـَٔايَٰتِنَا')) {
  throw new Error('Ayah 7:36 does not match expected authentic text');
}
if (!v37.arabicText.includes('فَمَنْ أَظْلَمُ')) {
  throw new Error('Ayah 7:37 does not match expected authentic text');
}

console.log('\n--- TEST 3: At-Tawbah Verses Check ---');
const v9_1 = quranData.verses.find(v => v.surahNumber === 9 && v.verseNumber === 1);
const v9_2 = quranData.verses.find(v => v.surahNumber === 9 && v.verseNumber === 2);
if (!v9_1 || !v9_2) throw new Error('Surah 9 verses not found!');
console.log('Ayah 9:1 text:', v9_1.arabicText);
console.log('Ayah 9:2 text:', v9_2.arabicText);

console.log('\n--- TEST 4: Validation Edge Cases Simulation ---');
function validatePair(surahNumber, first, next, maxAyahs) {
  if (first < 1 || first > maxAyahs) return { valid: false, error: 'First verse out of bounds' };
  if (next < 1 || next > maxAyahs) return { valid: false, error: 'Next verse out of bounds' };
  if (next !== first + 1) return { valid: false, error: 'Not consecutive' };
  return { valid: true };
}

// Valid consecutive
const r1 = validatePair(7, 36, 37, 206);
if (!r1.valid) throw new Error('36->37 should be valid');

// Invalid non-consecutive
const r2 = validatePair(7, 36, 38, 206);
if (r2.valid) throw new Error('36->38 should be invalid (non-consecutive)');

// Out of bounds
const r3 = validatePair(7, 206, 207, 206);
if (r3.valid) throw new Error('206->207 should be invalid (out of bounds)');

console.log('All edge cases correctly validated!');

console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
