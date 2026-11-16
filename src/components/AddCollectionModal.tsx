import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { getSurahList, isVerseAvailable } from '../services/quranService';
import type { StudyCollection } from '../types/quran';

interface AddCollectionModalProps {
  existingCollectionIds: string[];
  onAdd: (collection: StudyCollection) => Promise<void>;
  onClose: () => void;
}

export const AddCollectionModal: React.FC<AddCollectionModalProps> = ({
  existingCollectionIds,
  onAdd,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number | null>(null);

  const allSurahs = useMemo(() => getSurahList(), []);

  const filteredSurahs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allSurahs;
    return allSurahs.filter(
      (s) =>
        s.number.toString().includes(term) ||
        s.englishName.toLowerCase().includes(term) ||
        s.englishNameTranslation.toLowerCase().includes(term) ||
        s.name.includes(term)
    );
  }, [allSurahs, searchTerm]);

  const handleSelect = async (surahNumber: number) => {
    setSelectedSurahNum(surahNumber);
    const surah = allSurahs.find((s) => s.number === surahNumber);
    if (!surah) return;

    setLoading(true);
    try {
      const newCollection: StudyCollection = {
        id: `surah-${surah.number}`,
        type: 'surah',
        referenceNumber: surah.number,
        name: surah.englishName,
        arabicName: surah.name,
        englishName: surah.englishName,
        numberOfVerses: surah.numberOfAyahs,
        createdAt: new Date().toISOString(),
      };
      await onAdd(newCollection);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-br from-[#123E30] via-[#0E3529] to-[#0A2920] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-black/80 border-2 border-emerald-500/50 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
          <div>
            <h3 className="font-extrabold text-white text-lg">Tambah Koleksi Surah</h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Pilih Surah dari 114 Surah Al-Qur'an untuk dipelajari
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
          <input
            type="text"
            placeholder="Cari nomor atau nama surah (contoh: 36 atau Ya-Sin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-500/40 bg-[#08221A] focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/20 outline-hidden text-sm text-white placeholder:text-emerald-600/70 shadow-inner"
          />
        </div>

        {/* Surahs List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-500/20">
          {filteredSurahs.map((surah) => {
            const isAlreadyAdded = existingCollectionIds.includes(`surah-${surah.number}`);
            const hasBundledData = isVerseAvailable(surah.number, 1);

            return (
              <div
                key={surah.number}
                className="pt-2 flex items-center justify-between hover:bg-[#154636] p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-400/40 text-emerald-100 font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {surah.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {surah.englishName}
                      </span>
                      {hasBundledData && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-200 border border-emerald-400/40 font-medium px-2 py-0.5 rounded-full">
                          Tersedia Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      {surah.numberOfAyahs} Ayat • {surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-quran text-lg text-white font-bold" dir="rtl">
                    {surah.name}
                  </span>
                  {isAlreadyAdded ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-200 bg-emerald-950/90 border border-emerald-400/40 px-2.5 py-1.5 rounded-lg font-medium shadow-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Terdaftar
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(surah.number)}
                      disabled={loading && selectedSurahNum === surah.number}
                      className="flex items-center gap-1 text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-md shadow-black/30 border border-emerald-400/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-emerald-500/40 text-emerald-200 hover:bg-[#08221A] hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
