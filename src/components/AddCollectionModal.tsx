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
      <div className="bg-gradient-to-br from-[#1E6851] via-[#257C61] to-[#185542] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-black/80 border-2 border-[#3EAB88]/70 flex flex-col max-h-[85vh] text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          <div>
            <h3 className="font-extrabold text-white text-lg">Tambah Koleksi Surah</h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Pilih Surah dari 114 Surah Al-Qur'an untuk dipelajari
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-300" />
          <input
            type="text"
            placeholder="Cari nomor atau nama surah (contoh: 36 atau Ya-Sin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-white/20 bg-black/35 focus:border-white focus:ring-2 focus:ring-white/20 outline-hidden text-sm text-white placeholder:text-emerald-200/50 shadow-inner"
          />
        </div>

        {/* Surahs List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-white/15">
          {filteredSurahs.map((surah) => {
            const isAlreadyAdded = existingCollectionIds.includes(`surah-${surah.number}`);
            const hasBundledData = isVerseAvailable(surah.number, 1);

            return (
              <div
                key={surah.number}
                className="pt-2 flex items-center justify-between hover:bg-black/25 p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#124636] to-[#0A2E23] border border-[#48BFA0]/60 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {surah.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {surah.englishName}
                      </span>
                      {hasBundledData && (
                        <span className="text-[10px] bg-black/40 text-emerald-200 border border-white/20 font-bold px-2 py-0.5 rounded-full">
                          Tersedia Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-100/80">
                      {surah.numberOfAyahs} Ayat • {surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-quran text-lg text-white font-bold" dir="rtl">
                    {surah.name}
                  </span>
                  {isAlreadyAdded ? (
                    <span className="flex items-center gap-1 text-xs text-white bg-black/40 border border-white/20 px-2.5 py-1.5 rounded-lg font-bold shadow-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      Terdaftar
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(surah.number)}
                      disabled={loading && selectedSurahNum === surah.number}
                      className="flex items-center gap-1 text-xs text-white bg-gradient-to-r from-[#21735A] to-[#1A5C47] hover:from-[#29876A] hover:to-[#206E55] px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-md shadow-black/40 border border-[#43B893]/70"
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

        <div className="mt-4 pt-3 border-t border-white/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/25 text-white hover:bg-black/35 rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
