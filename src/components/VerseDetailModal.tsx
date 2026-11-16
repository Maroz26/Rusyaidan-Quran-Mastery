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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-emerald-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              Detail Dua Ayat Berurutan
            </div>
            <h3 className="font-extrabold text-emerald-950 text-xl sm:text-2xl">
              {collection.name} {transition.firstVerseNumber}–{transition.nextVerseNumber}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Surah ke-{collection.referenceNumber} • Juz {firstVerse?.juzNumber || '-'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Skor: {transition.memorizationScore}/10
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verse Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Ayat Pertama */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl p-5 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-100 text-xs font-semibold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[11px] font-bold">
                  {transition.firstVerseNumber}
                </span>
                Ayat Pertama (Pemicu / Cue)
              </span>
              <span className="text-stone-400 text-[11px]">Halaman {firstVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-emerald-950 leading-[2.2] text-right font-normal select-text"
              dir="rtl"
            >
              {firstVerse
                ? formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Ayat Selanjutnya */}
          <div className="bg-gradient-to-br from-teal-50/60 to-white rounded-2xl p-5 border border-teal-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-teal-100 text-xs font-semibold text-teal-950">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold">
                  {transition.nextVerseNumber}
                </span>
                Ayat Selanjutnya (Target Hafalan)
              </span>
              <span className="text-stone-400 text-[11px]">Halaman {nextVerse?.page || '-'}</span>
            </div>

            <p
              className="font-quran text-2xl sm:text-3xl text-emerald-950 leading-[2.2] text-right font-normal select-text"
              dir="rtl"
            >
              {nextVerse
                ? formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)
                : 'Teks ayat tidak ditemukan.'}
            </p>
          </div>

          {/* Consecutive Sequence View (Combined) */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-right">
            <div className="text-left text-xs font-semibold text-stone-500 mb-3 border-b border-stone-200/70 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-600" />
              Tampilan Tersambung (Mushaf Flow)
            </div>
            <p
              className="font-quran text-2xl sm:text-3xl text-stone-900 leading-[2.3] select-text"
              dir="rtl"
            >
              {firstVerse && formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)}{' '}
              {nextVerse && formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Terdaftar pada {new Date(transition.createdAt).toLocaleDateString('id-ID')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
