import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Shuffle,
  BookOpen,
} from 'lucide-react';
import type { StudyCollection, VerseTransition } from '../types/quran';
import {
  getTransitions,
  addTransition,
  updateTransitionScore,
  deleteTransition,
} from '../services/dbService';
import {
  getVerse,
  toArabicNumerals,
  getShortArabicPreview,
} from '../services/quranService';
import { AddTransitionModal } from './AddTransitionModal';
import { VerseDetailModal } from './VerseDetailModal';

interface VerseTransitionListProps {
  collection: StudyCollection;
  onNavigateRandom: () => void;
}

export const VerseTransitionList: React.FC<VerseTransitionListProps> = ({
  collection,
  onNavigateRandom,
}) => {
  const [transitions, setTransitions] = useState<VerseTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailTransition, setSelectedDetailTransition] = useState<VerseTransition | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getTransitions(collection.id)
      .then((list) => {
        if (isMounted) {
          setTransitions(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading transitions:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [collection.id, reloadTrigger]);

  const refreshData = () => setReloadTrigger((prev) => prev + 1);

  const handleAdd = async (newTransition: VerseTransition) => {
    await addTransition(newTransition);
    refreshData();
  };

  const handleScoreChange = async (transitionId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = transitions.find((t) => t.id === transitionId);
    if (!target) return;
    const newScore = Math.max(1, Math.min(10, target.memorizationScore + delta));
    await updateTransitionScore(transitionId, newScore);
    setTransitions((prev) =>
      prev.map((t) => (t.id === transitionId ? { ...t, memorizationScore: newScore } : t))
    );
  };

  const handleDelete = async (transitionId: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus transisi ayat ${label} dari daftar?`)) {
      await deleteTransition(transitionId);
      refreshData();
    }
  };

  // Helper for quick seed example (e.g. 36 -> 37 for Al-A'raf)
  const handleQuickSeed = async (firstVerse: number) => {
    const nextVerse = firstVerse + 1;
    const newTrans: VerseTransition = {
      id: `trans-${collection.id}-${firstVerse}-${nextVerse}-${Date.now()}`,
      collectionId: collection.id,
      surahNumber: collection.referenceNumber,
      firstVerseNumber: firstVerse,
      nextVerseNumber: nextVerse,
      memorizationScore: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addTransition(newTrans);
    refreshData();
  };

  const avgScore =
    transitions.length > 0
      ? (
          transitions.reduce((sum, t) => sum + t.memorizationScore, 0) / transitions.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Top Banner / Summary - Rich Elevated Card */}
      <div className="bg-gradient-to-br from-[#123E30] via-[#0E3529] to-[#0A2920] rounded-3xl p-6 border border-emerald-500/40 shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
            <Layers className="w-4 h-4 text-emerald-300" />
            <span>Koleksi Surah {collection.referenceNumber}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Daftar Transisi Ayat — {collection.name}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            {transitions.length} pasang transisi terdaftar
            {avgScore && ` • Rata-rata kekuatan hafalan: ${avgScore}/10`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {transitions.length > 0 && (
            <button
              onClick={onNavigateRandom}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2B20] text-emerald-200 hover:bg-[#144534] hover:text-white border border-emerald-500/50 text-sm font-bold transition-all active:scale-95 shadow-md shadow-black/30"
            >
              <Shuffle className="w-4 h-4 text-emerald-300" />
              <span>Mulai Acak</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-black/40 border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Ayat</span>
          </button>
        </div>
      </div>

      {/* Main List or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-emerald-400/60">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Memuat data transisi...</p>
        </div>
      ) : transitions.length === 0 ? (
        /* Empty State */
        <div className="bg-gradient-to-b from-[#10382B] to-[#0B261D] rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-emerald-600/50 space-y-4 shadow-xl shadow-black/30">
          <div className="w-16 h-16 rounded-2xl bg-[#071F17] border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Belum Ada Transisi Terdaftar</h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 leading-relaxed">
              Daftarkan pasangan ayat berurutan (contoh: {collection.name} 36 → 37) yang ingin Anda latih dan
              evaluasi secara berkala.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold shadow-lg shadow-black/40 transition-all active:scale-95 flex items-center gap-2 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4" />
              + Daftarkan Ayat Sekarang
            </button>

            {collection.referenceNumber === 7 && (
              <button
                onClick={() => handleQuickSeed(36)}
                className="px-4 py-2.5 rounded-xl bg-[#092B20] hover:bg-[#124232] text-emerald-200 border border-emerald-500/50 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Isi Contoh Cepat (36 → 37)
              </button>
            )}

            {collection.referenceNumber === 9 && (
              <button
                onClick={() => handleQuickSeed(1)}
                className="px-4 py-2.5 rounded-xl bg-[#092B20] hover:bg-[#124232] text-emerald-200 border border-emerald-500/50 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Isi Contoh Cepat (1 → 2)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Transition Items List with Distinct Floating Depth */
        <div className="space-y-4">
          {transitions.map((trans) => {
            const firstVerse = getVerse(trans.surahNumber, trans.firstVerseNumber);
            const nextVerse = getVerse(trans.surahNumber, trans.nextVerseNumber);

            const firstArabic = firstVerse ? firstVerse.arabicText : '';
            const nextPreview = nextVerse ? getShortArabicPreview(nextVerse.arabicText, 6) : '';
            const firstMarker = toArabicNumerals(trans.firstVerseNumber);

            // Combined representation as requested in Requirement Section 9:
            // "Display the first verse in full, followed by a shortened preview of the next verse."
            const combinedPreview = `${firstArabic} ${firstMarker} ${nextPreview}`;

            return (
              <div
                key={trans.id}
                onClick={() => setSelectedDetailTransition(trans)}
                className="group bg-gradient-to-br from-[#144234] via-[#0F362A] to-[#0B2B21] hover:from-[#184F3E] hover:via-[#134032] hover:to-[#0E3327] rounded-2xl p-5 border border-emerald-500/40 hover:border-emerald-300/80 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-emerald-950/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Item Top: Header & Score */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/25 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base group-hover:text-emerald-200 transition-colors">
                      {collection.name} {trans.firstVerseNumber} → {trans.nextVerseNumber}
                    </span>
                    <span className="text-[11px] text-emerald-300/70 font-medium">
                      (Juz {firstVerse?.juzNumber || '-'})
                    </span>
                  </div>

                  {/* Memorization Score Controls */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-black/40 backdrop-blur-xs border border-emerald-500/30 rounded-xl p-1 gap-1.5 shadow-inner">
                      <button
                        onClick={(e) => handleScoreChange(trans.id, -1, e)}
                        disabled={trans.memorizationScore <= 1}
                        className="w-6 h-6 rounded-lg bg-emerald-800/80 text-emerald-100 hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center transition-colors border border-emerald-500/40"
                        title="Turunkan skor hafalan"
                      >
                        -
                      </button>

                      <span className="font-extrabold text-xs text-white min-w-10 text-center flex items-center justify-center gap-0.5">
                        <Award className="w-3.5 h-3.5 text-emerald-300" />
                        {trans.memorizationScore}
                        <span className="text-emerald-300/70 font-normal text-[10px]">/10</span>
                      </span>

                      <button
                        onClick={(e) => handleScoreChange(trans.id, 1, e)}
                        disabled={trans.memorizationScore >= 10}
                        className="w-6 h-6 rounded-lg bg-emerald-800/80 text-emerald-100 hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center transition-colors border border-emerald-500/40"
                        title="Tingkatkan skor hafalan"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={(e) =>
                        handleDelete(
                          trans.id,
                          `${collection.name} ${trans.firstVerseNumber} → ${trans.nextVerseNumber}`,
                          e
                        )
                      }
                      className="p-2 text-emerald-400/60 hover:text-rose-300 hover:bg-rose-950/50 rounded-xl transition-colors border border-transparent hover:border-rose-800/50"
                      title="Hapus transisi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Body: Quranic Arabic Full Verse 1 + Preview Verse 2 */}
                <div className="py-3">
                  <p
                    className="font-quran text-lg sm:text-xl text-white leading-[2.2] text-right font-normal drop-shadow-2xs"
                    dir="rtl"
                  >
                    {combinedPreview}
                  </p>
                </div>

                {/* Item Footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-200/80 font-medium border-t border-emerald-500/20">
                  <span className="text-[11px] text-emerald-300/70 group-hover:text-emerald-100 transition-colors">
                    Klik untuk membuka teks lengkap kedua ayat
                  </span>
                  <span className="flex items-center gap-1 text-emerald-300 group-hover:text-white group-hover:translate-x-1 transition-transform">
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Transition Modal */}
      {showAddModal && (
        <AddTransitionModal
          collection={collection}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Full 2-verse detail modal */}
      {selectedDetailTransition && (
        <VerseDetailModal
          collection={collection}
          transition={selectedDetailTransition}
          onClose={() => setSelectedDetailTransition(null)}
        />
      )}
    </div>
  );
};
