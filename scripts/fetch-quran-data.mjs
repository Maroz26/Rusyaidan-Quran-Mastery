import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../src/data');

async function fetchJson(url) {
  let response;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText} for ${url}`);
    response = await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('HTTP error')) throw error;

    const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';
    const json = execFileSync(
      curl,
      ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', url],
      { encoding: 'utf8' },
    );
    response = JSON.parse(json);
  }

  if (response.code !== 200 || !response.data) {
    throw new Error(`Unexpected API response for ${url}`);
  }
  return response.data;
}

async function main() {
  console.log('Fetching surah list...');
  const surahData = await fetchJson('https://api.alquran.cloud/v1/surah');
  const surahList = surahData.map((surah) => ({
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    englishNameTranslation: surah.englishNameTranslation,
    numberOfAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
  }));

  if (
    surahList.length !== 114 ||
    surahList.some((surah, index) => surah.number !== index + 1)
  ) {
    throw new Error('Surah metadata is incomplete or out of order; existing dataset was not changed.');
  }

  const expectedVerseCount = surahList.reduce((total, surah) => total + surah.numberOfAyahs, 0);
  if (expectedVerseCount !== 6236) {
    throw new Error(
      `Expected 6,236 verses in the metadata, got ${expectedVerseCount}; existing dataset was not changed.`,
    );
  }

  const verses = [];
  for (const [index, surah] of surahList.entries()) {
    console.log(`Fetching Surah ${surah.number}/114 (${surah.englishName})...`);
    const data = await fetchJson(
      `https://api.alquran.cloud/v1/surah/${surah.number}/quran-uthmani`,
    );

    if (data.number !== surah.number || data.ayahs?.length !== surah.numberOfAyahs) {
      throw new Error(
        `Surah ${surah.number} returned an unexpected number of ayahs; existing dataset was not changed.`,
      );
    }

    for (const [verseIndex, ayah] of data.ayahs.entries()) {
      if (ayah.numberInSurah !== verseIndex + 1 || typeof ayah.text !== 'string' || !ayah.text.trim()) {
        throw new Error(
          `Surah ${surah.number} has missing or out-of-order ayah data; existing dataset was not changed.`,
        );
      }

      verses.push({
        surahNumber: data.number,
        surahName: data.name,
        surahEnglishName: data.englishName,
        verseNumber: ayah.numberInSurah,
        arabicText: ayah.text,
        juzNumber: ayah.juz,
        page: ayah.page,
        manzil: ayah.manzil,
        ruku: ayah.ruku,
        sajda: ayah.sajda,
      });
    }

    if (index < surahList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (verses.length !== expectedVerseCount) {
    throw new Error(
      `Expected ${expectedVerseCount} verses, fetched ${verses.length}; existing dataset was not changed.`,
    );
  }

  const quranData = {
    source: 'Tanzil Project / Al-Quran Cloud API (Uthmani Hafs)',
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    surahs: surahList,
    verses,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'surahList.json'),
    JSON.stringify(surahList, null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(outDir, 'quranData.json'),
    JSON.stringify(quranData, null, 2),
    'utf-8',
  );

  console.log(`Saved metadata for ${surahList.length} surahs.`);
  console.log(`Saved all ${verses.length} ayahs across Surahs 1–114.`);
}

main().catch((err) => {
  console.error('Error fetching Quran data:', err);
  process.exitCode = 1;
});
