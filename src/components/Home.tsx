import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Plus,
  BookOpen,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import type { StudyCollection } from '../types/quran';
import { getTransitions } from '../services/dbService';
import { getVerse } from '../services/quranService';
import { AddCollectionModal } from './AddCollectionModal';

interface HomeProps {
  collections: StudyCollection[];
  onSelectCollection: (collectionId: string) => void;
  onSelectJuz: (juzNumber: number) => void;
  onAddCollection: (collection: StudyCollection) => Promise<void>;
}

interface CollectionStatsMap {
  [collectionId: string]: { count: number; avgScore: number | null };
}

interface JuzStats {
  count: number;
  avgScore: number;
  surahNames: string[];
}

export const Home: React.FC<HomeProps> = ({
  collections,
  onSelectCollection,
  onSelectJuz,
  onAddCollection,
}) => {
  const [statsMap, setStatsMap] = useState<CollectionStatsMap>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalTransitions, setTotalTransitions] = useState(0);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [grouping, setGrouping] = useState<'surah' | 'juz'>('surah');
  const [juzStats, setJuzStats] = useState<Record<number, JuzStats>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const allTransitions = await getTransitions();
        const collectionAggregates = new Map<string, { scoreSum: number; count: number }>();
        const juzAggregates = new Map<number, { scoreSum: number; count: number; surahNames: Set<string> }>();

        for (const transition of allTransitions) {
          const collectionAggregate = collectionAggregates.get(transition.collectionId) ?? {
            scoreSum: 0,
            count: 0,
          };
          collectionAggregate.scoreSum += transition.memorizationScore;
          collectionAggregate.count += 1;
          collectionAggregates.set(transition.collectionId, collectionAggregate);

          const juzNumber = getVerse(transition.surahNumber, transition.firstVerseNumber)?.juzNumber;
          if (juzNumber === undefined) continue;

          const aggregate = juzAggregates.get(juzNumber) ?? {
            scoreSum: 0,
            count: 0,
            surahNames: new Set<string>(),
          };
          aggregate.scoreSum += transition.memorizationScore;
          aggregate.count += 1;
          const surahName = collections.find((item) => item.id === transition.collectionId)?.name;
          if (surahName) aggregate.surahNames.add(surahName);
          juzAggregates.set(juzNumber, aggregate);
        }

        const stats: CollectionStatsMap = {};
        for (const [collectionId, aggregate] of collectionAggregates) {
          stats[collectionId] = {
            count: aggregate.count,
            avgScore: Number((aggregate.scoreSum / aggregate.count).toFixed(1)),
          };
        }

        const groupedJuzStats: Record<number, JuzStats> = {};
        for (const [juzNumber, aggregate] of juzAggregates) {
          groupedJuzStats[juzNumber] = {
            count: aggregate.count,
            avgScore: Number((aggregate.scoreSum / aggregate.count).toFixed(1)),
            surahNames: [...aggregate.surahNames],
          };
        }

        let totalScoreSum = 0;
        if (allTransitions.length > 0) {
          totalScoreSum = allTransitions.reduce((acc, t) => acc + t.memorizationScore, 0);
        }

        if (isMounted) {
          setStatsMap(stats);
          setJuzStats(groupedJuzStats);
          setTotalTransitions(allTransitions.length);
          setOverallAvg(allTransitions.length > 0 ? Number((totalScoreSum / allTransitions.length).toFixed(1)) : null);
          setStatsError(null);
          setIsStatsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setStatsError(error instanceof Error ? error.message : 'Kesalahan tidak diketahui.');
          setIsStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [collections]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-7 sm:p-10 shadow-xl shadow-black/40 border border-emerald-600/30">
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
          <BookOpen className="w-52 h-52 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/50 border border-emerald-400/30 text-emerald-100 text-xs font-semibold mb-4 tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Metode Mutqin Mandiri
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Rusyaidan Qur'an Mastery
          </h2>

          <p className="mt-3 text-emerald-100/90 text-sm sm:text-base leading-relaxed font-normal">
            Evaluasi dan perkuat ketahanan hafalan Al-Qur'an melalui latihan{' '}
            <span className="font-semibold text-emerald-200">Transisi Ayat (Verse Transition)</span>{' '}
            berkelanjutan dengan tolok ukur skor mandiri.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-emerald-600/50 grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{collections.length}</div>
              <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Koleksi Aktif</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{totalTransitions}</div>
              <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Transisi Terdaftar</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {overallAvg !== null ? `${overallAvg} / 10` : '-'}
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Rata-rata Skor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Surah Collections Section */}
      <div>
        {statsError && (
          <p role="alert" className="mb-3 rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-200">
            Gagal memuat statistik Firestore: {statsError}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              {grouping === 'surah' ? 'Koleksi Surah Tersedia' : 'Transisi Berdasarkan Juz'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-300/80">
              {grouping === 'surah'
                ? 'Pilih surah untuk mengelola transisi ayat atau memulai latihan acak'
                : 'Transisi dikelompokkan menurut Juz ayat pertama; pilih Juz untuk melihat daftarnya'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600/60 transition-all active:scale-95 shadow-md shadow-black/40"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>Tambah Surah</span>
          </button>
        </div>

        <div className="mb-5 inline-flex rounded-xl border border-emerald-800/70 bg-[#0C2B21] p-1" role="group" aria-label="Pengelompokan koleksi">
          <button
            type="button"
            onClick={() => setGrouping('surah')}
            aria-pressed={grouping === 'surah'}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${grouping === 'surah' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-200 hover:bg-emerald-900/60'}`}
          >
            Berdasarkan Surah
          </button>
          <button
            type="button"
            onClick={() => setGrouping('juz')}
            aria-pressed={grouping === 'juz'}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${grouping === 'juz' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-200 hover:bg-emerald-900/60'}`}
          >
            Berdasarkan Juz
          </button>
        </div>

        {grouping === 'surah' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((col) => {
            const stats = statsMap[col.id] || { count: 0, avgScore: null };
            const isAlAraf = col.referenceNumber === 7;
            const isAtTawbah = col.referenceNumber === 9;

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group relative bg-stone-100 rounded-2xl p-6 border border-stone-300 hover:border-emerald-300 shadow-md hover:shadow-xl hover:shadow-black/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge & Number */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/60 text-emerald-800 font-extrabold text-base flex items-center justify-center border border-emerald-300/40 group-hover:scale-105 transition-transform shadow-xs">
                      {col.referenceNumber}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                        {col.name}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        Surah ke-{col.referenceNumber} • {col.numberOfVerses ? `${col.numberOfVerses} Ayat` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-quran text-2xl font-bold text-emerald-900/90 leading-none" dir="rtl">
                      {col.arabicName}
                    </span>
                    <div className="mt-1">
                      {isAlAraf && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Juz 8–9
                        </span>
                      )}
                      {isAtTawbah && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Juz 10–11
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Footer inside Card */}
                <div className="mt-6 pt-4 border-t border-emerald-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                        Transisi Terdaftar
                      </span>
                      <span className="font-bold text-emerald-950 text-sm">
                        {stats.count} Pasang
                      </span>
                    </div>

                    <div className="h-6 w-px bg-emerald-100" />

                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                        Rata-rata Skor
                      </span>
                      <span className="font-bold text-emerald-950 text-sm flex items-center gap-1">
                        {stats.avgScore !== null ? (
                          <>
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            {stats.avgScore} <span className="text-stone-400 font-normal text-xs">/ 10</span>
                          </>
                        ) : (
                          <span className="text-stone-400 font-normal">Belum ada</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-700 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : isStatsLoading ? (
          <div className="rounded-2xl border border-emerald-800/60 bg-[#0C2B21] p-8 text-center text-sm text-emerald-200/70">
            Memuat daftar Juz...
          </div>
        ) : Object.keys(juzStats).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-800/60 bg-[#0C2B21] p-8 text-center text-sm text-emerald-200/70">
            Belum ada transisi yang dapat dikelompokkan berdasarkan Juz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(juzStats).sort(([a], [b]) => Number(a) - Number(b)).map(([juzNumber, stats]) => (
              <button
                type="button"
                key={juzNumber}
                onClick={() => onSelectJuz(Number(juzNumber))}
                className="group rounded-2xl border border-stone-300 bg-stone-100 p-6 text-left shadow-md transition-all hover:border-emerald-300 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/40 bg-gradient-to-br from-emerald-100 to-emerald-200/60 text-base font-extrabold text-emerald-800">
                      {juzNumber}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700">
                        Juz {juzNumber}
                      </h4>
                      <p className="text-xs font-medium text-stone-500">
                        {stats.surahNames.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Layers className="h-5 w-5 shrink-0 text-emerald-700" />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-emerald-200 pt-4">
                  <span className="text-sm font-bold text-emerald-950">
                    {stats.count} Pasang Transisi
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-emerald-800">
                    <Award className="h-4 w-4" />
                    {stats.avgScore}/10
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guide Note Box */}
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-md text-emerald-950">
        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
          <h5 className="font-bold text-emerald-900 mb-1">Panduan Penguatan Hafalan:</h5>
          <p className="text-stone-600">
            Daftarkan pasangan ayat yang sering membingungkan atau rawan terlupa transisinya. Lakukan latihan
            acak secara berkala dan perbarui skor hafalan (1–10) sesuai kemantapan mutqin Anda.
          </p>
        </div>
      </div>

      {showAddModal && (
        <AddCollectionModal
          existingCollectionIds={collections.map((c) => c.id)}
          onAdd={onAddCollection}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
