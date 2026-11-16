import React, { useState } from 'react';
import { X, Plus, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import type { StudyCollection, VerseTransition } from '../types/quran';
import { getVerse, formatVerseWithMarker } from '../services/quranService';
import { isTransitionDuplicate } from '../services/dbService';

interface AddTransitionModalProps {
  collection: StudyCollection;
  onAdd: (transition: VerseTransition) => Promise<void>;
  onClose: () => void;
}

export const AddTransitionModal: React.FC<AddTransitionModalProps> = ({
  collection,
  onAdd,
  onClose,
}) => {
  const [firstVerseStr, setFirstVerseStr] = useState('');
  const [nextVerseStr, setNextVerseStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const firstVerseNum = parseInt(firstVerseStr.trim(), 10);
  const nextVerseNum = parseInt(nextVerseStr.trim(), 10);

  const maxAyah = collection.numberOfVerses || 206;

  // Validation logic
  let validationError: string | null = null;

  if (firstVerseStr.trim() !== '') {
    if (isNaN(firstVerseNum) || firstVerseNum < 1 || firstVerseNum > maxAyah) {
      validationError = `Ayat pertama harus berupa angka antara 1 sampai ${maxAyah}.`;
    }
  }

  if (!validationError && nextVerseStr.trim() !== '') {
    if (isNaN(nextVerseNum) || nextVerseNum < 1 || nextVerseNum > maxAyah) {
      validationError = `Ayat selanjutnya harus berupa angka antara 1 sampai ${maxAyah}.`;
    } else if (!isNaN(firstVerseNum) && nextVerseNum !== firstVerseNum + 1) {
      validationError = `Ayat harus berurutan (consecutive): jika ayat pertama adalah ${firstVerseNum}, ayat selanjutnya harus ${firstVerseNum + 1}.`;
    }
  }

  const isValidPair =
    !validationError &&
    !isNaN(firstVerseNum) &&
    !isNaN(nextVerseNum) &&
    firstVerseNum >= 1 &&
    firstVerseNum < maxAyah &&
    nextVerseNum === firstVerseNum + 1;

  // Retrieve verses from local dataset for preview
  const firstVerseData = isValidPair ? getVerse(collection.referenceNumber, firstVerseNum) : undefined;
  const nextVerseData = isValidPair ? getVerse(collection.referenceNumber, nextVerseNum) : undefined;

  const handleFirstVerseChange = (val: string) => {
    setFirstVerseStr(val);
    setSubmitError(null);
    const num = parseInt(val.trim(), 10);
    if (!isNaN(num) && num >= 1 && num < maxAyah) {
      setNextVerseStr((num + 1).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isValidPair) {
      setSubmitError(validationError || 'Harap masukkan nomor ayat yang valid dan berurutan.');
      return;
    }

    if (!firstVerseData || !nextVerseData) {
      setSubmitError(
        `Teks ayat untuk ${collection.name} ${firstVerseNum} & ${nextVerseNum} belum dimuat dalam dataset lokal.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const isDup = await isTransitionDuplicate(collection.id, firstVerseNum, nextVerseNum);
      if (isDup) {
        setSubmitError(
          `Transisi ${collection.name} ${firstVerseNum} → ${nextVerseNum} sudah terdaftar sebelumnya!`
        );
        setIsSubmitting(false);
        return;
      }

      const newTransition: VerseTransition = {
        id: `trans-${collection.id}-${firstVerseNum}-${nextVerseNum}-${Date.now()}`,
        collectionId: collection.id,
        surahNumber: collection.referenceNumber,
        firstVerseNumber: firstVerseNum,
        nextVerseNumber: nextVerseNum,
        memorizationScore: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onAdd(newTransition);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan transisi.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1E6851] via-[#257C61] to-[#185542] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-black/80 border-2 border-[#3EAB88]/70 max-h-[90vh] overflow-y-auto flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#124636] to-[#0A2E23] text-white flex items-center justify-center shadow-md border border-[#48BFA0]/60">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">
                Tambah Transisi Ayat
              </h3>
              <p className="text-xs text-emerald-100/90">
                {collection.name} (Surah {collection.referenceNumber}) • Rentang 1–{maxAyah} Ayat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Input 1: First Verse */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Ayat Pertama <span className="text-rose-300">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={maxAyah - 1}
                placeholder="Contoh: 36"
                value={firstVerseStr}
                onChange={(e) => handleFirstVerseChange(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white/25 bg-black/35 focus:border-white focus:ring-2 focus:ring-white/20 outline-hidden text-base font-semibold text-white placeholder:text-emerald-200/50 shadow-inner"
              />
              <span className="text-[11px] text-emerald-100/80 mt-1 block font-medium">
                Nomor ayat pemicu (N)
              </span>
            </div>

            {/* Input 2: Next Verse */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Ayat Selanjutnya <span className="text-rose-300">*</span>
              </label>
              <input
                type="number"
                min={2}
                max={maxAyah}
                placeholder="Contoh: 37"
                value={nextVerseStr}
                onChange={(e) => {
                  setNextVerseStr(e.target.value);
                  setSubmitError(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white/25 bg-black/35 focus:border-white focus:ring-2 focus:ring-white/20 outline-hidden text-base font-semibold text-white placeholder:text-emerald-200/50 shadow-inner"
              />
              <span className="text-[11px] text-emerald-100/80 mt-1 block font-medium">
                Harus berurutan (N + 1)
              </span>
            </div>
          </div>

          {/* Error alert */}
          {(validationError || submitError) && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-400 text-white text-xs flex items-start gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" />
              <span>{validationError || submitError}</span>
            </div>
          )}

          {/* Automatic Arabic Verse Retrieval Preview */}
          {isValidPair && firstVerseData && nextVerseData && (
            <div className="bg-black/30 border border-white/25 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/20 pb-2">
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Pratinjau Teks Al-Qur'an Otentik
                </span>
                <span className="text-[11px] bg-black/40 text-emerald-200 border border-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  Skor Awal: 5/10
                </span>
              </div>

              {/* First verse preview */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/20 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-emerald-100 mb-1.5 font-semibold">
                  <span className="text-white">
                    Ayat Pertama ({collection.name} : {firstVerseNum})
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded text-emerald-200">
                    Juz {firstVerseData.juzNumber || '-'}
                  </span>
                </div>
                <p
                  className="font-quran text-lg sm:text-xl text-white leading-loose text-right drop-shadow-xs"
                  dir="rtl"
                >
                  {formatVerseWithMarker(firstVerseData.arabicText, firstVerseNum)}
                </p>
              </div>

              {/* Next verse preview */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/20 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-emerald-100 mb-1.5 font-semibold">
                  <span className="text-white">
                    Ayat Selanjutnya ({collection.name} : {nextVerseNum})
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded text-emerald-200">
                    Juz {nextVerseData.juzNumber || '-'}
                  </span>
                </div>
                <p
                  className="font-quran text-lg sm:text-xl text-white leading-loose text-right drop-shadow-xs"
                  dir="rtl"
                >
                  {formatVerseWithMarker(nextVerseData.arabicText, nextVerseNum)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/30 text-white hover:bg-black/40 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValidPair || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#21735A] to-[#1A5C47] hover:from-[#29876A] hover:to-[#206E55] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-black/40 active:scale-95 flex items-center gap-2 border border-[#43B893]/70"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
