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
      // Auto-suggest next consecutive verse
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
        memorizationScore: 5, // Requirement: initial score is 5/10
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/45 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-950 text-lg">
                Tambah Transisi Ayat
              </h3>
              <p className="text-xs text-stone-500">
                {collection.name} (Surah {collection.referenceNumber}) • Rentang 1–{maxAyah} Ayat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Input 1: First Verse */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                Ayat Pertama <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={maxAyah - 1}
                placeholder="Contoh: 36"
                value={firstVerseStr}
                onChange={(e) => handleFirstVerseChange(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-hidden text-base font-semibold text-emerald-950 bg-stone-50/50"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Nomor ayat pemicu (N)
              </span>
            </div>

            {/* Input 2: Next Verse */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                Ayat Selanjutnya <span className="text-rose-500">*</span>
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-hidden text-base font-semibold text-emerald-950 bg-stone-50/50"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Harus berurutan (N + 1)
              </span>
            </div>
          </div>

          {/* Error alert */}
          {(validationError || submitError) && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{validationError || submitError}</span>
            </div>
          )}

          {/* Automatic Arabic Verse Retrieval Preview */}
          {isValidPair && firstVerseData && nextVerseData && (
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200/60 pb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Teks Al-Qur'an Otentik
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Skor Awal: 5/10
                </span>
              </div>

              {/* First verse preview */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span className="font-semibold text-emerald-800">
                    Ayat Pertama ({collection.name} : {firstVerseNum})
                  </span>
                  <span>Juz {firstVerseData.juzNumber || '-'}</span>
                </div>
                <p
                  className="font-quran text-lg sm:text-xl text-stone-900 leading-loose text-right"
                  dir="rtl"
                >
                  {formatVerseWithMarker(firstVerseData.arabicText, firstVerseNum)}
                </p>
              </div>

              {/* Next verse preview */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span className="font-semibold text-emerald-800">
                    Ayat Selanjutnya ({collection.name} : {nextVerseNum})
                  </span>
                  <span>Juz {nextVerseData.juzNumber || '-'}</span>
                </div>
                <p
                  className="font-quran text-lg sm:text-xl text-stone-900 leading-loose text-right"
                  dir="rtl"
                >
                  {formatVerseWithMarker(nextVerseData.arabicText, nextVerseNum)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-emerald-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValidPair || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-md shadow-emerald-800/10 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
