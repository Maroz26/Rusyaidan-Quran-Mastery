import { useState, useEffect } from 'react';
import type { ActiveScreen, StudyCollection } from './types/quran';
import { getCollections, saveCollection } from './services/dbService';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { SurahDetail } from './components/SurahDetail';
import { VerseTransitionList } from './components/VerseTransitionList';
import { RandomPractice } from './components/RandomPractice';

export function App() {
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>({ type: 'home' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCollections()
      .then((data) => {
        if (isMounted) {
          setCollections(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching collections:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddCollection = async (newCol: StudyCollection) => {
    await saveCollection(newCol);
    const updated = await getCollections();
    setCollections(updated);
  };

  // Find currently selected collection if on a sub-page
  const selectedCollection =
    currentScreen.type !== 'home'
      ? collections.find((c) => c.id === currentScreen.collectionId)
      : undefined;

  // Back navigation logic
  const handleBack = () => {
    if (currentScreen.type === 'surah-detail') {
      setCurrentScreen({ type: 'home' });
    } else if (currentScreen.type === 'transition-list' || currentScreen.type === 'random-practice') {
      setCurrentScreen({
        type: 'surah-detail',
        collectionId: currentScreen.collectionId,
      });
    }
  };

  const getBackTitle = () => {
    if (currentScreen.type === 'surah-detail') return 'Beranda';
    if (currentScreen.type === 'transition-list' || currentScreen.type === 'random-practice') {
      return selectedCollection ? selectedCollection.name : 'Detail Surah';
    }
    return 'Kembali';
  };

  return (
    <div className="min-h-screen bg-[#061C14] text-[#ECFDF5] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar
        currentScreen={currentScreen}
        onNavigateHome={() => setCurrentScreen({ type: 'home' })}
        onBack={currentScreen.type !== 'home' ? handleBack : undefined}
        backTitle={getBackTitle()}
      />

      <main className="flex-1 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-300/60">
            <div className="animate-spin w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium text-emerald-200/80">Memuat data Rusyaidan Qur'an Mastery...</p>
          </div>
        ) : currentScreen.type === 'home' ? (
          <Home
            collections={collections}
            onSelectCollection={(collectionId) =>
              setCurrentScreen({ type: 'surah-detail', collectionId })
            }
            onAddCollection={handleAddCollection}
          />
        ) : selectedCollection ? (
          currentScreen.type === 'surah-detail' ? (
            <SurahDetail
              collection={selectedCollection}
              onNavigateList={() =>
                setCurrentScreen({
                  type: 'transition-list',
                  collectionId: selectedCollection.id,
                })
              }
              onNavigateRandom={() =>
                setCurrentScreen({
                  type: 'random-practice',
                  collectionId: selectedCollection.id,
                })
              }
            />
          ) : currentScreen.type === 'transition-list' ? (
            <VerseTransitionList
              collection={selectedCollection}
              onNavigateRandom={() =>
                setCurrentScreen({
                  type: 'random-practice',
                  collectionId: selectedCollection.id,
                })
              }
            />
          ) : currentScreen.type === 'random-practice' ? (
            <RandomPractice
              collection={selectedCollection}
              onNavigateList={() =>
                setCurrentScreen({
                  type: 'transition-list',
                  collectionId: selectedCollection.id,
                })
              }
            />
          ) : null
        ) : (
          <div className="max-w-md mx-auto p-8 text-center text-emerald-300/70 bg-[#0C2B21] border border-emerald-800/60 rounded-3xl mt-12 shadow-xl">
            <p>Koleksi surah tidak ditemukan.</p>
            <button
              onClick={() => setCurrentScreen({ type: 'home' })}
              className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </main>

      {/* Elegant Dark Emerald Footer */}
      <footer className="border-t border-emerald-900/60 bg-[#04140E]/90 backdrop-blur-md py-6 text-center text-xs text-emerald-400/70 space-y-1">
        <p className="font-semibold text-emerald-200 tracking-wide">
          Rusyaidan Qur'an Mastery
        </p>
        <p className="text-[11px] text-emerald-500/60">
          Teks Al-Qur'an Otentik bersumber dari Tanzil Project (Medina Mushaf Uthmani Hafs). Penyimpanan data lokal via IndexedDB.
        </p>
      </footer>
    </div>
  );
}

export default App;
