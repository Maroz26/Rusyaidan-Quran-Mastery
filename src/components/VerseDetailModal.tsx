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
      <div className="bg-gradient-to-br from-[#1E6851] via-[#257C61] to-[#185542] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black/80 border-2 border-[#3EAB88]/70 flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 text-white border border-white/20 text-xs font-bold mb-1 shadow-inner">
              <Layers className="w-3.5 h-3.5 text-emerald-300" />
              Detail Dua Ayat Berurutan
            </div>
            <h3 className="font-extrabold text-white text-xl sm:text-2xl drop-shadow-xs">
              {collection.name} {transition.firstVerseNumber}–{transition.nextVerseNumber}
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Surah ke-{collection.referenceNumber} • Juz {firstVerse?.juzNumber || '-'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-black/40 backdrop-blur-xs border border-white/25 rounded-xl text-xs font-bold text-white shadow-inner">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              Skor: {transition.memorizationScore}/10
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-black/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verse Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Ayat Pertama */}
          <div className="bg-black/35 rounded-2xl p-5 border border-white/20 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/15 text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#124636] border border-[#48BFA0]/60 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.firstVerseNumber}
                </span>
                Ayat Pertama (Pemicu / Cue)
              </span>
              <span className="text-white text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/10">Halaman {firstVerse?.page || '-'}</span>
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
          <div className="bg-black/35 rounded-2xl p-5 border border-white/20 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/15 text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#124636] border border-[#48BFA0]/60 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {transition.nextVerseNumber}
                </span>
                Ayat Selanjutnya (Target Hafalan)
              </span>
              <span className="text-white text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/10">Halaman {nextVerse?.page || '-'}</span>
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
          <div className="bg-black/45 rounded-2xl p-5 border border-white/20 text-right shadow-inner">
            <div className="text-left text-xs font-semibold text-emerald-200 mb-3 border-b border-white/15 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              Tampilan Tersambung (Mushaf Flow)
            </div>
            <p
              className="font-quran text-2xl sm:text-3xl text-white leading-[2.4] select-text drop-shadow-xs"
              dir="rtl"
            >
              {firstVerse && formatVerseWithMarker(firstVerse.arabicText, transition.firstVerseNumber)}{' '}
              {nextVerse && formatVerseWithMarker(nextVerse.arabicText, transition.nextVerseNumber)}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs text-emerald-100/80">
            Terdaftar pada {new Date(transition.createdAt).toLocaleDateString('id-ID')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#21735A] to-[#1A5C47] hover:from-[#29876A] hover:to-[#206E55] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-black/40 border border-[#43B893]/70"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
