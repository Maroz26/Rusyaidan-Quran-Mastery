import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Plus,
  BookOpen,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import type { StudyCollection } from '../types/quran';
import { getCollectionStats, getTransitions } from '../services/dbService';
import { AddCollectionModal } from './AddCollectionModal';

interface HomeProps {
  collections: StudyCollection[];
  onSelectCollection: (collectionId: string) => void;
  onAddCollection: (collection: StudyCollection) => Promise<void>;
}

interface CollectionStatsMap {
  [collectionId: string]: { count: number; avgScore: number | null };
}

export const Home: React.FC<HomeProps> = ({
  collections,
  onSelectCollection,
  onAddCollection,
}) => {
  const [statsMap, setStatsMap] = useState<CollectionStatsMap>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalTransitions, setTotalTransitions] = useState(0);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      const stats: CollectionStatsMap = {};
      let totalCount = 0;
      let totalScoreSum = 0;

      for (const col of collections) {
        const s = await getCollectionStats(col.id);
        stats[col.id] = s;
      }

      const allTransitions = await getTransitions();
      totalCount = allTransitions.length;
      if (totalCount > 0) {
        totalScoreSum = allTransitions.reduce((acc, t) => acc + t.memorizationScore, 0);
        setOverallAvg(Number((totalScoreSum / totalCount).toFixed(1)));
      } else {
        setOverallAvg(null);
      }

      setStatsMap(stats);
      setTotalTransitions(totalCount);
    }

    loadStats();
  }, [collections]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-7 sm:p-10 shadow-xl shadow-emerald-900/10 border border-emerald-600/30">
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/50 border border-emerald-400/30 text-emerald-100 text-xs font-semibold mb-4 tracking-wide">
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              Koleksi Surah Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Pilih surah untuk mengelola transisi ayat atau memulai latihan acak
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80 transition-all active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Tambah Surah</span>
          </button>
        </div>

        {/* Surah Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((col) => {
            const stats = statsMap[col.id] || { count: 0, avgScore: null };
            const isAlAraf = col.referenceNumber === 7;
            const isAtTawbah = col.referenceNumber === 9;

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group relative bg-white rounded-2xl p-6 border border-emerald-100/90 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-900/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge & Number */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/60 text-emerald-800 font-extrabold text-base flex items-center justify-center border border-emerald-300/40 group-hover:scale-105 transition-transform">
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
      </div>

      {/* Guide Note Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
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
