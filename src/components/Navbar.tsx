import React, { useState } from 'react';
import { BookOpen, Info, ChevronLeft, Sparkles, X } from 'lucide-react';
import type { ActiveScreen } from '../types/quran';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigateHome: () => void;
  onBack?: () => void;
  backTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigateHome,
  onBack,
  backTitle,
}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  const isHome = currentScreen.type === 'home';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#061C14]/90 backdrop-blur-md border-b border-emerald-900/60 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-emerald-300 hover:bg-emerald-900/40 active:scale-95 transition-all text-sm font-medium border border-emerald-800/60"
                aria-label="Kembali"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{backTitle || 'Kembali'}</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-500/30">
                <BookOpen className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-emerald-100 tracking-tight leading-none group-hover:text-emerald-300 transition-colors">
                  Rusyaidan Qur'an Mastery
                </h1>
                <p className="text-[11px] text-emerald-400/80 font-medium tracking-wide">
                  Evaluasi &amp; Penguatan Hafalan
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAboutModal(true)}
              className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-200 transition-colors"
              title="Tentang Aplikasi"
              aria-label="Tentang Aplikasi"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-emerald-950 text-lg">Tentang Rusyaidan Qur'an Mastery</h3>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-stone-600 leading-relaxed">
              <p>
                <strong className="text-emerald-950">Rusyaidan Qur'an Mastery</strong> adalah aplikasi web mandiri lokal-first untuk membantu penghafal Al-Qur'an mengevaluasi dan memperkuat hafalan dengan fokus utama:
              </p>

              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white mt-0.5">1</span>
                  <div>
                    <strong className="text-emerald-950">Verse Transition (Transisi Ayat):</strong>
                    <p className="text-emerald-800 text-xs mt-0.5">Kemampuan menyambung dari satu ayat ke ayat berikutnya secara tepat, lancar, dan mantap.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-emerald-200/50">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900 mt-0.5">2</span>
                  <div>
                    <strong className="text-emerald-950">Verse Retention (Retensi Ayat):</strong>
                    <p className="text-emerald-800 text-xs mt-0.5">Kemampuan mengingat keseluruhan ayat dengan akurat (Segera Hadir / Coming Soon).</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-emerald-950 mb-1">Sumber Data Al-Qur'an Otentik:</h4>
                <p className="text-xs text-stone-500">
                  Teks Arab bersumber dari <strong className="text-emerald-900">Tanzil Project (Medina Mushaf Uthmani Hafs)</strong> dengan harakat lengkap, rasm Uthmani, dan tanda waqaf terverifikasi.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-emerald-950 mb-1">Simulasi Perekaman &amp; Penilaian Mandiri:</h4>
                <p className="text-xs text-stone-500">
                  Fitur perekaman merupakan simulasi visual interaktif (tanpa mikrofon riil). Skor kekuatan hafalan (1–10) ditentukan secara mandiri oleh pengguna dan tersimpan aman di peramban Anda melalui <strong className="text-emerald-900">IndexedDB</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
