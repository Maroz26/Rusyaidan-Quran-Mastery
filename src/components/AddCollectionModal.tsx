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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B251D] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-black/60 border border-emerald-700/60 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-800/50">
          <div>
            <h3 className="font-bold text-emerald-100 text-lg">Tambah Koleksi Surah</h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Pilih Surah dari 114 Surah Al-Qur'an untuk dipelajari
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-500" />
          <input
            type="text"
            placeholder="Cari nomor atau nama surah (contoh: 36 atau Ya-Sin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-800 bg-[#071F17] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden text-sm text-emerald-100 placeholder:text-emerald-700"
          />
        </div>

        {/* Surahs List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-900/40">
          {filteredSurahs.map((surah) => {
            const isAlreadyAdded = existingCollectionIds.includes(`surah-${surah.number}`);
            const hasBundledData = isVerseAvailable(surah.number, 1);

            return (
              <div
                key={surah.number}
                className="pt-2 flex items-center justify-between hover:bg-[#0E2E24] p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0">
                    {surah.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-100 text-sm">
                        {surah.englishName}
                      </span>
                      {hasBundledData && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-medium px-1.5 py-0.5 rounded">
                          Tersedia Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400/70">
                      {surah.numberOfAyahs} Ayat • {surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-quran text-lg text-white font-bold" dir="rtl">
                    {surah.name}
                  </span>
                  {isAlreadyAdded ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-1.5 rounded-lg font-medium">
                      <Check className="w-3.5 h-3.5" />
                      Terdaftar
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(surah.number)}
                      disabled={loading && selectedSurahNum === surah.number}
                      className="flex items-center gap-1 text-xs text-white bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-md shadow-emerald-950/40"
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

        <div className="mt-4 pt-3 border-t border-emerald-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-emerald-800 text-emerald-300 hover:bg-[#071F17] hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
