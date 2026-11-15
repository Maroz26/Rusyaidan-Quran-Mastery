import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../src/data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText} for ${url}`);
  return await res.json();
}

async function main() {
  console.log('Fetching surah list...');
  const surahsResponse = await fetchJson('https://api.alquran.cloud/v1/surah');
  const surahList = surahsResponse.data.map(s => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));

  fs.writeFileSync(
    path.join(outDir, 'surahList.json'),
    JSON.stringify(surahList, null, 2),
    'utf-8'
  );
  console.log(`Saved ${surahList.length} surahs to surahList.json`);

  // Target surahs to bundle: Surah 7 (Al-A'raf) and Surah 9 (At-Tawbah)
  // We can also bundle Surah 1 (Al-Fatihah) or others if desired.
  const targetSurahs = [1, 7, 9];
  const verses = [];

  for (const surahNum of targetSurahs) {
    console.log(`Fetching Surah ${surahNum}...`);
    const surahData = await fetchJson(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
    const sInfo = surahData.data;

    for (const ayah of sInfo.ayahs) {
      verses.push({
        surahNumber: sInfo.number,
        surahName: sInfo.name,
        surahEnglishName: sInfo.englishName,
        verseNumber: ayah.numberInSurah,
        arabicText: ayah.text,
        juzNumber: ayah.juz,
        page: ayah.page,
        manzil: ayah.manzil,
        ruku: ayah.ruku,
        sajda: ayah.sajda,
      });
    }
  }

  const quranData = {
    source: "Tanzil Project / Al-Quran Cloud (Uthmani Hafs)",
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    surahs: surahList,
    verses: verses,
  };

  fs.writeFileSync(
    path.join(outDir, 'quranData.json'),
    JSON.stringify(quranData, null, 2),
    'utf-8'
  );

  console.log(`Saved ${verses.length} verses across Surahs [${targetSurahs.join(', ')}] to quranData.json`);
}

main().catch(err => {
  console.error('Error fetching data:', err);
  process.exit(1);
});
