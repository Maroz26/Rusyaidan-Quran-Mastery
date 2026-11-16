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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-br from-[#123E30] via-[#0E3529] to-[#0A2920] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black/80 border-2 border-emerald-500/50 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-emerald-500/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-200 border border-emerald-400/40 text-xs font-bold mb-1 shadow-inner">
              <Layers className="w-3.5 h-3.5 text-emerald-300" />
              Detail Dua Ayat Berurutan
            </div>
            <h3 className="font-extrabold text-white text-xl sm:text-2xl drop-shadow-xs">
              {collection.name} {transition.firstVerseNumber}–{transition.nextVerseNumber}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Surah ke-{collection.referenceNumber} • Juz {firstVerse?.juzNumber || '-'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/35 backdrop-blur-xs border border-emerald-400/30 rounded-xl text-xs font-bold text-white shadow-inner">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              Skor: {transition.memorizationScore}/10
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verse Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Ayat Pertama */}
          <div className="bg-gradient-to-br from-[#154636] to-[#0F362A] rounded-2xl p-5 border border-emerald-500/40 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-400/20 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.firstVerseNumber}
                </span>
                Ayat Pertama (Pemicu / Cue)
              </span>
              <span className="text-emerald-300/80 text-[11px] bg-black/30 px-2 py-0.5 rounded">Halaman {firstVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-white leading-[2.3] text-right font-normal select-text drop-shadow-xs"
              dir="rtl"
            >
              {firstVerse
                ? formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Ayat Selanjutnya */}
          <div className="bg-gradient-to-br from-[#103D34] to-[#0C3029] rounded-2xl p-5 border border-teal-500/40 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-teal-400/20 text-xs font-semibold text-teal-200">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.nextVerseNumber}
                </span>
                Ayat Selanjutnya (Target Hafalan)
              </span>
              <span className="text-teal-300/80 text-[11px] bg-black/30 px-2 py-0.5 rounded">Halaman {nextVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-white leading-[2.3] text-right font-normal select-text drop-shadow-xs"
              dir="rtl"
            >
              {nextVerse
                ? formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Consecutive Sequence View (Combined) */}
          <div className="bg-[#092219] rounded-2xl p-5 border border-emerald-600/40 text-right shadow-inner">
            <div className="text-left text-xs font-semibold text-emerald-300 mb-3 border-b border-emerald-500/20 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Tampilan Tersambung (Mushaf Flow)
            </div>
            <p
              className="font-quran text-2xl sm:text-3xl text-emerald-50 leading-[2.4] select-text drop-shadow-2xs"
              dir="rtl"
            >
              {firstVerse && formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)}{' '}
              {nextVerse && formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-emerald-500/30 flex items-center justify-between">
          <span className="text-xs text-emerald-300/80">
            Terdaftar pada {new Date(transition.createdAt).toLocaleDateString('id-ID')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-black/40 border border-emerald-400/30"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
