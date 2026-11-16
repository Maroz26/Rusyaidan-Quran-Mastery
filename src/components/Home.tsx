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
      {/* Hero Welcome Banner - Elegant Medium Jade with Deep Depth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E6851] via-[#257C61] to-[#185542] text-white p-7 sm:p-10 shadow-2xl shadow-black/50 border-2 border-[#3EAB88]/60">
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-emerald-300/15 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-15 pointer-events-none text-emerald-100">
          <BookOpen className="w-52 h-52" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-xs border border-white/20 text-emerald-100 text-xs font-bold mb-4 tracking-wide shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Metode Mutqin Mandiri
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            Rusyaidan Qur'an Mastery
          </h2>

          <p className="mt-3 text-emerald-50 text-sm sm:text-base leading-relaxed font-normal">
            Evaluasi dan perkuat ketahanan hafalan Al-Qur'an melalui latihan{' '}
            <span className="font-bold text-white underline decoration-emerald-200/60 underline-offset-2">
              Transisi Ayat (Verse Transition)
            </span>{' '}
            berkelanjutan dengan tolok ukur skor mandiri.
          </p>

          {/* Quick Metrics Bar with Distinct Elevated Stat Pods */}
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-black/30 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-white/20 text-center shadow-inner">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{collections.length}</div>
              <div className="text-[11px] sm:text-xs text-emerald-100 font-semibold mt-0.5">Koleksi Aktif</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-white/20 text-center shadow-inner">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{totalTransitions}</div>
              <div className="text-[11px] sm:text-xs text-emerald-100 font-semibold mt-0.5">Transisi Terdaftar</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-white/20 text-center shadow-inner">
              <div className="text-xl sm:text-2xl font-extrabold text-white">
                {overallAvg !== null ? `${overallAvg} / 10` : '-'}
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-100 font-semibold mt-0.5">Rata-rata Skor</div>
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
            <p className="text-xs sm:text-sm text-emerald-300/80">
              Pilih surah untuk mengelola transisi ayat atau memulai latihan acak
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#21735A] to-[#1A5C47] hover:from-[#29876A] hover:to-[#206E55] text-white border border-[#43B893]/60 transition-all active:scale-95 shadow-md shadow-black/40"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>Tambah Surah</span>
          </button>
        </div>

        {/* Surah Cards Grid with Medium Jade Contrast (Not dark emerald, not overly bright) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((col) => {
            const stats = statsMap[col.id] || { count: 0, avgScore: null };
            const isAlAraf = col.referenceNumber === 7;
            const isAtTawbah = col.referenceNumber === 9;

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group relative bg-gradient-to-br from-[#1F6E56] via-[#257D62] to-[#1A5B47] hover:from-[#278368] hover:via-[#2D8F72] hover:to-[#206B54] rounded-2xl p-6 border-2 border-[#39A986]/50 hover:border-[#52D2AA] shadow-2xl shadow-black/50 hover:shadow-black/70 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge & Number */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#124636] to-[#0A2E23] text-white font-extrabold text-lg flex items-center justify-center border border-[#42BD97]/60 group-hover:scale-105 transition-transform shadow-md shadow-black/30">
                      {col.referenceNumber}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                        {col.name}
                      </h4>
                      <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                        Surah ke-{col.referenceNumber} • {col.numberOfVerses ? `${col.numberOfVerses} Ayat` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-quran text-2xl sm:text-3xl font-bold text-white leading-none drop-shadow-xs" dir="rtl">
                      {col.arabicName}
                    </span>
                    <div className="mt-1.5">
                      {isAlAraf && (
                        <span className="text-[10px] bg-black/35 text-white border border-white/20 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          Juz 8–9
                        </span>
                      )}
                      {isAtTawbah && (
                        <span className="text-[10px] bg-black/35 text-white border border-white/20 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          Juz 10–11
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Footer inside Card */}
                <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-emerald-100/80 block text-[10px] uppercase font-bold tracking-wider">
                        Transisi Terdaftar
                      </span>
                      <span className="font-extrabold text-white text-base">
                        {stats.count} Pasang
                      </span>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <div>
                      <span className="text-emerald-100/80 block text-[10px] uppercase font-bold tracking-wider">
                        Rata-rata Skor
                      </span>
                      <span className="font-extrabold text-white text-base flex items-center gap-1">
                        {stats.avgScore !== null ? (
                          <>
                            <Award className="w-4 h-4 text-emerald-200" />
                            <span className="text-white">{stats.avgScore}</span>{' '}
                            <span className="text-emerald-100/80 font-normal text-xs">/ 10</span>
                          </>
                        ) : (
                          <span className="text-emerald-100/70 font-normal text-xs">Belum ada</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#124636] group-hover:bg-white text-emerald-200 group-hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-[#42BD97]/60 shadow-md">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Note Box with Distinct Elevated Medium Jade Tone */}
      <div className="bg-gradient-to-r from-[#1B5E4A] to-[#154E3D] border-2 border-[#3EAB88]/50 rounded-2xl p-5 flex items-start gap-4 shadow-xl shadow-black/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#124636] to-[#0A2E23] text-white flex items-center justify-center shrink-0 mt-0.5 border border-[#48BFA0]/60 shadow-md">
          <TrendingUp className="w-5 h-5 text-emerald-200" />
        </div>
        <div className="text-xs sm:text-sm text-white leading-relaxed">
          <h5 className="font-bold text-white mb-1">Panduan Penguatan Hafalan:</h5>
          <p className="text-emerald-100/90">
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
