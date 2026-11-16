import React from 'react';
import { X, BookOpen, Layers, Award } from 'lucide-react';
import type { StudyCollection, VerseTransition } from '../types/quran';
import { getVerse, formatVerseWithMarker } from '../services/quranService';

interface VerseDetailModalProps {
  collection: StudyCollection;
  transition: VerseTransition;
  onClose: () => void;
}

export const VerseDetailModal: React.FC<VerseDetailModalProps> = ({
  collection,
  transition,
  onClose,
}) => {
  const firstVerse = getVerse(transition.surahNumber, transition.firstVerseNumber);
  const nextVerse = getVerse(transition.surahNumber, transition.nextVerseNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B251D] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black/70 border border-emerald-700/60 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              Detail Dua Ayat Berurutan
            </div>
            <h3 className="font-extrabold text-emerald-100 text-xl sm:text-2xl">
              {collection.name} {transition.firstVerseNumber}–{transition.nextVerseNumber}
            </h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Surah ke-{collection.referenceNumber} • Juz {firstVerse?.juzNumber || '-'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#071F17] border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-200 shadow-inner">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Skor: {transition.memorizationScore}/10
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verse Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Ayat Pertama */}
          <div className="bg-gradient-to-br from-[#0A2A20] to-[#071D16] rounded-2xl p-5 border border-emerald-700/60 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-800/60 text-xs font-semibold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.firstVerseNumber}
                </span>
                Ayat Pertama (Pemicu / Cue)
              </span>
              <span className="text-emerald-400/70 text-[11px]">Halaman {firstVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-white leading-[2.3] text-right font-normal select-text"
              dir="rtl"
            >
              {firstVerse
                ? formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Ayat Selanjutnya */}
          <div className="bg-gradient-to-br from-[#07241D] to-[#051A14] rounded-2xl p-5 border border-teal-700/50 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-teal-800/60 text-xs font-semibold text-teal-300">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.nextVerseNumber}
                </span>
                Ayat Selanjutnya (Target Hafalan)
              </span>
              <span className="text-teal-400/70 text-[11px]">Halaman {nextVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-white leading-[2.3] text-right font-normal select-text"
              dir="rtl"
            >
              {nextVerse
                ? formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Consecutive Sequence View (Combined) */}
          <div className="bg-[#061811] rounded-2xl p-5 border border-emerald-800/80 text-right shadow-inner">
            <div className="text-left text-xs font-semibold text-emerald-400/80 mb-3 border-b border-emerald-900/60 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Tampilan Tersambung (Mushaf Flow)
            </div>
            <p
              className="font-quran text-2xl sm:text-3xl text-emerald-50 leading-[2.4] select-text"
              dir="rtl"
            >
              {firstVerse && formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)}{' '}
              {nextVerse && formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-emerald-800/60 flex items-center justify-between">
          <span className="text-xs text-emerald-500/70">
            Terdaftar pada {new Date(transition.createdAt).toLocaleDateString('id-ID')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-950/40"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
