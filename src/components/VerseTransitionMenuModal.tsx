import React from 'react';
import { X, ListFilter, Shuffle, ArrowRight, Sparkles } from 'lucide-react';
import type { StudyCollection } from '../types/quran';

interface VerseTransitionMenuModalProps {
  collection: StudyCollection;
  transitionCount: number;
  onNavigateList: () => void;
  onNavigateRandom: () => void;
  onClose: () => void;
}

export const VerseTransitionMenuModal: React.FC<VerseTransitionMenuModalProps> = ({
  collection,
  transitionCount,
  onNavigateList,
  onNavigateRandom,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1E6851] via-[#257C61] to-[#185542] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-black/80 border-2 border-[#3EAB88]/70 flex flex-col relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 text-white border border-white/20 text-xs font-bold mb-1 shadow-inner">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Fitur Utama
            </div>
            <h3 className="font-extrabold text-white text-xl tracking-tight">
              Verse Transition
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {collection.name} (Surah {collection.referenceNumber}) • {transitionCount} Transisi Terdaftar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Description */}
        <p className="mt-4 text-xs sm:text-sm text-emerald-50 leading-relaxed">
          Pilih metode untuk mengelola atau menguji transisi sambungan antar ayat:
        </p>

        {/* Two Prominent Action Cards */}
        <div className="mt-5 space-y-3.5">
          {/* Action 1: Lihat Daftar */}
          <button
            onClick={() => {
              onClose();
              onNavigateList();
            }}
            className="w-full text-left p-4 rounded-2xl border-2 border-white/20 hover:border-white bg-black/35 hover:bg-black/50 transition-all group shadow-md shadow-black/30 active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#124636] to-[#0A2E23] text-white border border-[#48BFA0]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <ListFilter className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base group-hover:text-emerald-100 transition-colors">
                  Lihat Daftar
                </h4>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Kelola, tambah, atau pelajari daftar pasangan ayat terdaftar
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* Action 2: Acak */}
          <button
            onClick={() => {
              onClose();
              onNavigateRandom();
            }}
            className="w-full text-left p-4 rounded-2xl border-2 border-[#43B893]/70 bg-gradient-to-r from-[#21735A] to-[#1A5C47] hover:from-[#29876A] hover:to-[#206E55] text-white transition-all group shadow-xl shadow-black/50 active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-base">
                    Acak (Latihan Acak)
                  </h4>
                  <span className="text-[10px] bg-black/40 border border-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                    Direkomendasikan
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Tantangan acak dari pasangan ayat yang sudah Anda daftarkan
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-3 text-center border-t border-white/20">
          <p className="text-[11px] text-emerald-100/80">
            Latihan acak hanya memilih dari pasangan ayat yang telah Anda daftarkan.
          </p>
        </div>
      </div>
    </div>
  );
};
