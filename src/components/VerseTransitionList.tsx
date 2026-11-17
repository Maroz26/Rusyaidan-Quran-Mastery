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
  getSurah,
  toArabicNumerals,
  getShortArabicPreview,
} from '../services/quranService';
import { AddTransitionModal } from './AddTransitionModal';
import { VerseDetailModal } from './VerseDetailModal';

interface VerseTransitionListProps {
  collection?: StudyCollection;
  collections?: StudyCollection[];
  juzNumber?: number;
  onNavigateRandom?: () => void;
}

export const VerseTransitionList: React.FC<VerseTransitionListProps> = ({
  collection,
  collections,
  juzNumber,
  onNavigateRandom,
}) => {
  const [transitions, setTransitions] = useState<VerseTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailTransition, setSelectedDetailTransition] = useState<VerseTransition | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [scoreFilter, setScoreFilter] = useState<'all' | number>('all');

  useEffect(() => {
    let isMounted = true;
    getTransitions(collection?.id)
      .then((list) => {
        if (isMounted) {
          setTransitions(
            (juzNumber === undefined
              ? list
              : list.filter(
                  (transition) =>
                    getVerse(transition.surahNumber, transition.firstVerseNumber)?.juzNumber === juzNumber,
                )
            ).sort(
              (a, b) =>
                a.surahNumber - b.surahNumber || a.firstVerseNumber - b.firstVerseNumber,
            ),
          );
          setLoadError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading transitions:', err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Kesalahan tidak diketahui.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [collection?.id, juzNumber, reloadTrigger]);

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
    try {
      await updateTransitionScore(transitionId, newScore);
      setTransitions((prev) =>
        prev.map((t) => (t.id === transitionId ? { ...t, memorizationScore: newScore } : t))
      );
      if (scoreFilter === target.memorizationScore) {
        setScoreFilter('all');
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Gagal menyimpan skor ke Firestore.');
    }
  };

  const handleDelete = async (transitionId: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus transisi ayat ${label} dari daftar?`)) {
      try {
        await deleteTransition(transitionId);
        refreshData();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Gagal menghapus transisi dari Firestore.');
      }
    }
  };

  // Helper for quick seed example (e.g. 36 -> 37 for Al-A'raf)
  const handleQuickSeed = async (firstVerse: number) => {
    if (!collection) return;
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
    try {
      await addTransition(newTrans);
      refreshData();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Gagal menyimpan transisi ke Firestore.');
    }
  };

  const availableScores = [...new Set(transitions.map((transition) => transition.memorizationScore))]
    .sort((a, b) => a - b);
  const visibleTransitions =
    scoreFilter === 'all'
      ? transitions
      : transitions.filter((transition) => transition.memorizationScore === scoreFilter);
  const selectedDetailCollection = selectedDetailTransition
    ? collection ?? collections?.find((item) => item.id === selectedDetailTransition.collectionId)
    : undefined;

  const avgScore =
    visibleTransitions.length > 0
      ? (
          visibleTransitions.reduce((sum, t) => sum + t.memorizationScore, 0) / visibleTransitions.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Layers className="w-4 h-4" />
            <span>
              {collection
                ? `Koleksi Surah ${collection.referenceNumber}`
                : `Pengelompokan Juz ${juzNumber}`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            {collection
              ? `Daftar Transisi Ayat — ${collection.name}`
              : `Daftar Transisi Ayat — Juz ${juzNumber}`}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {visibleTransitions.length} dari {transitions.length} pasang transisi ditampilkan
            {avgScore && ` • Rata-rata kekuatan hafalan: ${avgScore}/10`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateRandom && transitions.length > 0 && (
            <button
              onClick={onNavigateRandom}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200 text-sm font-bold transition-all active:scale-95 shadow-xs"
            >
              <Shuffle className="w-4 h-4 text-emerald-700" />
              <span>Mulai Acak</span>
            </button>
          )}

          {collection && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-all active:scale-95 shadow-md shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Ayat</span>
            </button>
          )}
        </div>
      </div>

      {!loading && !loadError && transitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <label htmlFor="memorization-score-filter" className="text-sm font-bold text-emerald-950">
            Filter kekuatan hafalan
          </label>
          <select
            id="memorization-score-filter"
            value={scoreFilter}
            onChange={(event) => setScoreFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">Semua level</option>
            {availableScores.map((score) => (
              <option key={score} value={score}>
                Level {score}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main List or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-emerald-300/60">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Memuat data transisi...</p>
        </div>
      ) : loadError ? (
        <p role="alert" className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-200">
          Gagal memuat transisi dari Firestore: {loadError}
        </p>
      ) : transitions.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-emerald-200/80 space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-emerald-950">Belum Ada Transisi Terdaftar</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
              Daftarkan pasangan ayat berurutan (contoh: {collection?.name ?? `Juz ${juzNumber}`} 36 → 37) yang ingin Anda latih dan
              evaluasi secara berkala.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {collection && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-800/10 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                + Daftarkan Ayat Sekarang
              </button>
            )}

            {collection?.referenceNumber === 7 && (
              <button
                onClick={() => handleQuickSeed(36)}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Isi Contoh Cepat (36 → 37)
              </button>
            )}

            {collection?.referenceNumber === 9 && (
              <button
                onClick={() => handleQuickSeed(1)}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Isi Contoh Cepat (1 → 2)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Transition Items List */
        visibleTransitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-10 text-center text-sm text-stone-500">
          Tidak ada transisi dengan level kekuatan hafalan {scoreFilter}.
        </div>
        ) : (
        <div className="space-y-4">
          {visibleTransitions.map((trans) => {
            const itemCollection = collection ?? collections?.find((item) => item.id === trans.collectionId);
            const firstVerse = getVerse(trans.surahNumber, trans.firstVerseNumber);
            const nextVerse = getVerse(trans.surahNumber, trans.nextVerseNumber);
            const surahName = itemCollection?.name ?? getSurah(trans.surahNumber)?.name ?? `Surah ${trans.surahNumber}`;

            const firstArabic = firstVerse ? firstVerse.arabicText : '';
            const nextPreview = nextVerse ? getShortArabicPreview(nextVerse.arabicText, 6) : '';
            const firstMarker = toArabicNumerals(trans.firstVerseNumber);

            const combinedPreview = `${firstArabic} ${firstMarker} ${nextPreview}`;

            return (
              <div
                key={trans.id}
                onClick={() => setSelectedDetailTransition(trans)}
                className="group bg-white rounded-2xl p-5 border border-emerald-100/90 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-black/20 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Item Top: Header & Score */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-50 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-950 text-base">
                      {surahName} {trans.firstVerseNumber} → {trans.nextVerseNumber}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      (Juz {firstVerse?.juzNumber || '-'})
                    </span>
                  </div>

                  {/* Memorization Score Controls */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl p-1 gap-1.5 shadow-2xs">
                      <button
                        onClick={(e) => handleScoreChange(trans.id, -1, e)}
                        disabled={trans.memorizationScore <= 1}
                        className="w-6 h-6 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                        title="Turunkan skor hafalan"
                      >
                        -
                      </button>

                      <span className="font-extrabold text-xs text-emerald-950 min-w-10 text-center flex items-center justify-center gap-0.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {trans.memorizationScore}
                        <span className="text-stone-400 font-normal text-[10px]">/10</span>
                      </span>

                      <button
                        onClick={(e) => handleScoreChange(trans.id, 1, e)}
                        disabled={trans.memorizationScore >= 10}
                        className="w-6 h-6 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                        title="Tingkatkan skor hafalan"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={(e) =>
                        handleDelete(
                          trans.id,
                          `${surahName} ${trans.firstVerseNumber} → ${trans.nextVerseNumber}`,
                          e
                        )
                      }
                      className="p-2 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus transisi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Body: Quranic Arabic Full Verse 1 + Preview Verse 2 */}
                <div className="py-3">
                  <p
                    className="font-quran text-lg sm:text-xl text-stone-900 leading-[2.1] text-right font-normal"
                    dir="rtl"
                  >
                    {combinedPreview}
                  </p>
                </div>

                {/* Item Footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-700/80 font-medium">
                  <span className="text-[11px] text-stone-400 group-hover:text-emerald-700 transition-colors">
                    Klik untuk membuka teks lengkap kedua ayat
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* Add Transition Modal */}
      {showAddModal && collection && (
        <AddTransitionModal
          collection={collection}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Full 2-verse detail modal */}
      {selectedDetailTransition && selectedDetailCollection && (
        <VerseDetailModal
          collection={selectedDetailCollection}
          transition={selectedDetailTransition}
          onClose={() => setSelectedDetailTransition(null)}
        />
      )}
    </div>
  );
};
