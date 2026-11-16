import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  Brain,
  Layers,
  Award,
  Lock,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import type { StudyCollection } from '../types/quran';
import { getCollectionStats } from '../services/dbService';
import { VerseTransitionMenuModal } from './VerseTransitionMenuModal';

interface SurahDetailProps {
  collection: StudyCollection;
  onNavigateList: () => void;
  onNavigateRandom: () => void;
}

export const SurahDetail: React.FC<SurahDetailProps> = ({
  collection,
  onNavigateList,
  onNavigateRandom,
}) => {
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [stats, setStats] = useState<{ count: number; avgScore: number | null }>({
    count: 0,
    avgScore: null,
  });

  useEffect(() => {
    async function fetchStats() {
      const s = await getCollectionStats(collection.id);
      setStats(s);
    }
    fetchStats();
  }, [collection]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Surah Header Banner */}
      <div className="bg-gradient-to-br from-[#0C382A] via-[#144737] to-[#0A2F23] text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs font-semibold shadow-inner">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              Surah ke-{collection.referenceNumber}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {collection.name}
            </h2>

            <p className="text-emerald-200/90 text-sm font-medium">
              {collection.numberOfVerses ? `${collection.numberOfVerses} Ayat Keseluruhan` : ''}
              {collection.referenceNumber === 7 ? ' • Makkiyyah • Juz 8–9' : ''}
              {collection.referenceNumber === 9 ? ' • Madaniyyah • Juz 10–11' : ''}
            </p>
          </div>

          <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-emerald-500/30 pt-4 md:pt-0">
            <div className="font-quran text-3xl sm:text-4xl font-bold text-white leading-relaxed drop-shadow-xs" dir="rtl">
              {collection.arabicName}
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-200 mt-2">
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-400/20">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                {stats.count} Transisi Terdaftar
              </span>
              {stats.avgScore !== null && (
                <span className="flex items-center gap-1.5 font-bold text-white bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-400/20">
                  <Award className="w-3.5 h-3.5 text-emerald-300" />
                  Skor: {stats.avgScore}/10
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Selection Section with Enhanced Contrast */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-emerald-100">Pilih Mode Evaluasi Hafalan</h3>
          <p className="text-xs sm:text-sm text-emerald-300/80">
            Fokuskan latihan Anda pada transisi sambungan ayat atau retensi ayat penuh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Feature 1: Verse Transition (Active) - Elevated Emerald Jewel Card */}
          <div
            onClick={() => setShowMenuModal(true)}
            className="group relative bg-gradient-to-br from-[#123E30] via-[#0E3529] to-[#0A2920] hover:from-[#174B3B] hover:via-[#123E30] hover:to-[#0D3126] rounded-2xl p-6 border-2 border-emerald-500/60 hover:border-emerald-300 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-emerald-950/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border border-emerald-400/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-black/30">
                  <GitCommit className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 shadow-2xs">
                  Fitur Aktif
                </span>
              </div>

              <h4 className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors">
                Verse Transition
              </h4>
              <p className="text-xs font-semibold text-emerald-300 mt-0.5">
                Evaluasi Transisi Sambungan Ayat
              </p>

              <p className="text-xs sm:text-sm text-emerald-100/90 mt-3 leading-relaxed">
                Uji kemampuan menyambung dari satu ayat ke ayat berikutnya secara tepat dan yakin.
                Dilengkapi simulasi rekaman dan penilaian kekuatan memorisasi mandiri (1–10).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/25 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200 group-hover:text-white flex items-center gap-1">
                Buka Menu Transisi
              </span>
              <div className="w-9 h-9 rounded-full bg-emerald-800/80 text-emerald-200 group-hover:bg-emerald-500 group-hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-emerald-500/50 shadow-md">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feature 2: Verse Retention (Coming Soon) */}
          <div className="relative bg-[#092219]/90 rounded-2xl p-6 border-2 border-emerald-900/40 flex flex-col justify-between opacity-80 cursor-not-allowed shadow-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-500 border border-emerald-900/60 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                  <Lock className="w-3 h-3" />
                  Coming Soon
                </span>
              </div>

              <h4 className="text-xl font-bold text-emerald-200/70">
                Verse Retention
              </h4>
              <p className="text-xs font-semibold text-emerald-400/60 mt-0.5">
                Evaluasi Daya Ingat Satu Ayat Penuh
              </p>

              <p className="text-xs sm:text-sm text-emerald-300/60 mt-3 leading-relaxed">
                Menguji daya ingat menyeluruh terhadap satu ayat penuh secara mandiri, akurat, dan
                konsisten dari awal hingga akhir lafal ayat.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-900/50 flex items-center justify-between text-emerald-400/50">
              <span className="text-xs font-medium italic">
                Akan hadir pada fase pengembangan berikutnya
              </span>
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Verse Transition Menu Modal */}
      {showMenuModal && (
        <VerseTransitionMenuModal
          collection={collection}
          transitionCount={stats.count}
          onNavigateList={onNavigateList}
          onNavigateRandom={onNavigateRandom}
          onClose={() => setShowMenuModal(false)}
        />
      )}
    </div>
  );
};
