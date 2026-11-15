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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
          <div>
            <h3 className="font-bold text-emerald-950 text-lg">Tambah Koleksi Surah</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih Surah dari 114 Surah Al-Qur'an untuk dipelajari
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nomor atau nama surah (contoh: 36 atau Ya-Sin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden text-sm"
          />
        </div>

        {/* Surahs List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-50">
          {filteredSurahs.map((surah) => {
            const isAlreadyAdded = existingCollectionIds.includes(`surah-${surah.number}`);
            const hasBundledData = isVerseAvailable(surah.number, 1);

            return (
              <div
                key={surah.number}
                className="pt-2 flex items-center justify-between hover:bg-emerald-50/60 p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {surah.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800 text-sm">
                        {surah.englishName}
                      </span>
                      {hasBundledData && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">
                          Tersedia Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {surah.numberOfAyahs} Ayat • {surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-quran text-lg text-emerald-950 font-bold" dir="rtl">
                    {surah.name}
                  </span>
                  {isAlreadyAdded ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-medium">
                      <Check className="w-3.5 h-3.5" />
                      Terdaftar
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(surah.number)}
                      disabled={loading && selectedSurahNum === surah.number}
                      className="flex items-center gap-1 text-xs text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-xs"
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

        <div className="mt-4 pt-3 border-t border-emerald-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
