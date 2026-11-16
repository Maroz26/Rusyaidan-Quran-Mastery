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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B251D] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-black/60 border border-emerald-700/60 flex flex-col relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Fitur Utama
            </div>
            <h3 className="font-extrabold text-emerald-100 text-xl tracking-tight">
              Verse Transition
            </h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              {collection.name} (Surah {collection.referenceNumber}) • {transitionCount} Transisi Terdaftar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Description */}
        <p className="mt-4 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
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
            className="w-full text-left p-4 rounded-2xl border-2 border-emerald-800/80 hover:border-emerald-500 bg-[#081F18] hover:bg-[#0D2E24] transition-all group shadow-sm hover:shadow-lg hover:shadow-black/30 active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <ListFilter className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-100 text-base group-hover:text-emerald-300 transition-colors">
                  Lihat Daftar
                </h4>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  Kelola, tambah, atau pelajari daftar pasangan ayat terdaftar
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-200 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Action 2: Acak */}
          <button
            onClick={() => {
              onClose();
              onNavigateRandom();
            }}
            className="w-full text-left p-4 rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all group shadow-lg shadow-black/40 active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">
                    Acak (Latihan Acak)
                  </h4>
                  <span className="text-[10px] bg-emerald-500/40 border border-emerald-300/40 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
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
        <div className="mt-6 pt-3 text-center border-t border-emerald-900/50">
          <p className="text-[11px] text-emerald-400/70">
            Latihan acak hanya memilih dari pasangan ayat yang telah Anda daftarkan.
          </p>
        </div>
      </div>
    </div>
  );
};
