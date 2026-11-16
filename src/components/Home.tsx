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
      {/* Hero Welcome Banner - Dark Emerald Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2E22] via-[#0E3D2E] to-[#07241A] text-white p-7 sm:p-10 shadow-2xl shadow-black/40 border border-emerald-600/30">
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none text-emerald-400">
          <BookOpen className="w-48 h-48" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-4 tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Metode Mutqin Mandiri
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Rusyaidan Qur'an Mastery
          </h2>

          <p className="mt-3 text-emerald-200/90 text-sm sm:text-base leading-relaxed font-normal">
            Evaluasi dan perkuat ketahanan hafalan Al-Qur'an melalui latihan{' '}
            <span className="font-semibold text-emerald-300">Transisi Ayat (Verse Transition)</span>{' '}
            berkelanjutan dengan tolok ukur skor mandiri.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-emerald-700/50 grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{collections.length}</div>
              <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">Koleksi Aktif</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{totalTransitions}</div>
              <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">Transisi Terdaftar</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {overallAvg !== null ? `${overallAvg} / 10` : '-'}
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">Rata-rata Skor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Surah Collections Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Koleksi Surah Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-emerald-400/70">
              Pilih surah untuk mengelola transisi ayat atau memulai latihan acak
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#0B2A20] text-emerald-200 hover:bg-[#113A2D] hover:text-white border border-emerald-700/60 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Tambah Surah</span>
          </button>
        </div>

        {/* Surah Cards Grid in Dark Emerald */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((col) => {
            const stats = statsMap[col.id] || { count: 0, avgScore: null };
            const isAlAraf = col.referenceNumber === 7;
            const isAtTawbah = col.referenceNumber === 9;

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group relative bg-[#0B251D] hover:bg-[#0E2E24] rounded-2xl p-6 border border-emerald-800/60 hover:border-emerald-500/80 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-emerald-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge & Number */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-900/80 text-emerald-300 font-extrabold text-base flex items-center justify-center border border-emerald-700/60 group-hover:scale-105 transition-transform shadow-inner">
                      {col.referenceNumber}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-emerald-100 group-hover:text-emerald-300 transition-colors">
                        {col.name}
                      </h4>
                      <p className="text-xs text-emerald-400/70 font-medium">
                        Surah ke-{col.referenceNumber} • {col.numberOfVerses ? `${col.numberOfVerses} Ayat` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-quran text-2xl font-bold text-emerald-100 leading-none" dir="rtl">
                      {col.arabicName}
                    </span>
                    <div className="mt-1">
                      {isAlAraf && (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-semibold px-2 py-0.5 rounded-full">
                          Juz 8–9
                        </span>
                      )}
                      {isAtTawbah && (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-semibold px-2 py-0.5 rounded-full">
                          Juz 10–11
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Footer inside Card */}
                <div className="mt-6 pt-4 border-t border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-emerald-500/80 block text-[10px] uppercase font-semibold">
                        Transisi Terdaftar
                      </span>
                      <span className="font-bold text-emerald-100 text-sm">
                        {stats.count} Pasang
                      </span>
                    </div>

                    <div className="h-6 w-px bg-emerald-800/50" />

                    <div>
                      <span className="text-emerald-500/80 block text-[10px] uppercase font-semibold">
                        Rata-rata Skor
                      </span>
                      <span className="font-bold text-emerald-100 text-sm flex items-center gap-1">
                        {stats.avgScore !== null ? (
                          <>
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            {stats.avgScore} <span className="text-emerald-500/80 font-normal text-xs">/ 10</span>
                          </>
                        ) : (
                          <span className="text-emerald-500/60 font-normal">Belum ada</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-emerald-900/60 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white flex items-center justify-center transition-colors border border-emerald-700/50">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Note Box */}
      <div className="bg-[#071F17] border border-emerald-800/60 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-black/20">
        <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-700/50">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
          <h5 className="font-bold text-emerald-100 mb-1">Panduan Penguatan Hafalan:</h5>
          <p className="text-emerald-300/80">
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
