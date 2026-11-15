import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  ArrowRight,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  Plus,
  RotateCcw,
  Sparkles,
  ListFilter,
  CheckCircle,
} from 'lucide-react';
import type { StudyCollection, VerseTransition } from '../types/quran';
import { getTransitions, updateTransitionScore } from '../services/dbService';
import { getVerse, formatVerseWithMarker } from '../services/quranService';

interface RandomPracticeProps {
  collection: StudyCollection;
  onNavigateList: () => void;
}

type RecordingState = 'idle' | 'recording' | 'recorded';

export const RandomPractice: React.FC<RandomPracticeProps> = ({
  collection,
  onNavigateList,
}) => {
  const [transitions, setTransitions] = useState<VerseTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTransition, setCurrentTransition] = useState<VerseTransition | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [practiceCount, setPracticeCount] = useState(1);

  // Simulated dummy recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load registered transitions for this collection
  useEffect(() => {
    let isMounted = true;
    getTransitions(collection.id)
      .then((list) => {
        if (!isMounted) return;
        setTransitions(list);
        if (list.length > 0) {
          const randomIndex = Math.floor(Math.random() * list.length);
          setCurrentTransition(list[randomIndex]);
        } else {
          setCurrentTransition(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load transitions for practice:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [collection.id]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle Pick Next Random Transition
  const handleNext = () => {
    if (transitions.length === 0) return;

    let nextTransition: VerseTransition;
    if (transitions.length === 1) {
      nextTransition = transitions[0];
    } else {
      // Pick a random transition different from the current one
      const candidates = transitions.filter((t) => t.id !== currentTransition?.id);
      const randomIndex = Math.floor(Math.random() * candidates.length);
      nextTransition = candidates[randomIndex];
    }

    setCurrentTransition(nextTransition);
    // Reset recording and answer states
    setRecordingState('idle');
    setRevealAnswer(false);
    setElapsedSeconds(0);
    setPracticeCount((prev) => prev + 1);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Score adjustments (1 to 10)
  const handleScoreChange = async (newScore: number) => {
    if (!currentTransition) return;
    const clamped = Math.max(1, Math.min(10, newScore));
    await updateTransitionScore(currentTransition.id, clamped);

    // Update in local state
    setCurrentTransition((prev) => (prev ? { ...prev, memorizationScore: clamped } : null));
    setTransitions((prev) =>
      prev.map((t) => (t.id === currentTransition.id ? { ...t, memorizationScore: clamped } : t))
    );
  };

  // Simulated Recording Handlers (press and hold)
  const handleStartRecording = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (recordingState === 'recording') return;

    setRecordingState('recording');
    setElapsedSeconds(0);

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
  };

  const handleStopRecording = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (recordingState !== 'recording') return;

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecordingState('recorded');
  };

  // Format timer display MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-400">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Mempersiapkan sesi latihan acak...</p>
      </div>
    );
  }

  // Empty state if user has registered 0 transitions
  if (transitions.length === 0 || !currentTransition) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-emerald-950">
              Belum Ada Transisi Terdaftar
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              Latihan acak hanya dapat dijalankan setelah Anda mendaftarkan minimal 1 pasangan
              transisi ayat untuk <strong className="text-emerald-900">{collection.name}</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateList}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-800/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buka Halaman Pendaftaran Ayat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Retrieve current verse data
  const firstVerseData = getVerse(
    currentTransition.surahNumber,
    currentTransition.firstVerseNumber
  );
  const nextVerseData = getVerse(
    currentTransition.surahNumber,
    currentTransition.nextVerseNumber
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 animate-fadeIn">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-emerald-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            Latihan ke-{practiceCount}
          </span>
          <span className="text-xs text-stone-500 font-medium">
            Koleksi {collection.name} ({transitions.length} terdaftar)
          </span>
        </div>

        <button
          onClick={onNavigateList}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Lihat Semua Daftar</span>
        </button>
      </div>

      {/* Main Cue Card: Elongated Horizontal Emerald Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/15 border border-emerald-700/50">
        {/* Subtle decorative Quranic background geometry */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Card Cue Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-700/70 border border-emerald-500/40 text-emerald-100 text-xs font-semibold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ayat Pemicu (Cue) • {collection.name} : Ayat {currentTransition.firstVerseNumber}</span>
          </div>

          {/* Prominent Arabic Quranic Text (RTL, Emerald themed) */}
          <div className="w-full py-4 sm:py-6 px-2 sm:px-4">
            <p
              className="font-quran text-2xl sm:text-4xl text-emerald-50 leading-[2.3] sm:leading-[2.4] text-center font-normal select-text transition-all drop-shadow-xs"
              dir="rtl"
            >
              {firstVerseData
                ? formatVerseWithMarker(firstVerseData.arabicText, currentTransition.firstVerseNumber)
                : `[${collection.name} Ayat ${currentTransition.firstVerseNumber}]`}
            </p>
          </div>

          {/* Target Transition Cue Hint */}
          <div className="pt-2 border-t border-emerald-700/60 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/90 gap-2">
            <span>
              Tantangan: Lanjutkan melafalkan ke <strong>Ayat {currentTransition.nextVerseNumber}</strong>
            </span>
            <span className="text-[11px] text-emerald-300/80">
              Juz {firstVerseData?.juzNumber || '-'} • Halaman {firstVerseData?.page || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Verse (Answer Reveal Toggle for self-check) */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950">
              Kunci Sambungan Ayat ({collection.name} : {currentTransition.nextVerseNumber})
            </span>
            <span className="text-[11px] text-stone-400">
              (Disembunyikan saat latihan)
            </span>
          </div>

          <button
            onClick={() => setRevealAnswer((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
          >
            {revealAnswer ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Sembunyikan</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Buka Jawaban</span>
              </>
            )}
          </button>
        </div>

        {revealAnswer && nextVerseData && (
          <div className="mt-4 pt-4 border-t border-emerald-100 animate-fadeIn">
            <p
              className="font-quran text-xl sm:text-2xl text-emerald-950 leading-[2.2] text-right"
              dir="rtl"
            >
              {formatVerseWithMarker(nextVerseData.arabicText, currentTransition.nextVerseNumber)}
            </p>
          </div>
        )}
      </div>

      {/* Middle Interactive Zone: Visual Dummy Recording Simulation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm text-center flex flex-col items-center justify-center space-y-5">
        <div>
          <h4 className="text-sm font-bold text-emerald-950 tracking-wide uppercase">
            Simulasi Perekaman Pelafalan
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Tekan &amp; tahan tombol mikrofon saat melafalkan transisi ayat selanjutnya
          </p>
        </div>

        {/* Dynamic Sound-wave Visual Simulation */}
        <div className="h-12 flex items-center justify-center gap-1.5">
          {recordingState === 'recording' ? (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-1" />
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-2" />
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-3" />
              <span className="w-1.5 bg-emerald-500 rounded-full animate-wave-4" />
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-5" />
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-6" />
              <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-7" />
              <span className="ml-2 font-mono text-xs font-bold text-emerald-800">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          ) : recordingState === 'recorded' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Terekam ({formatTimer(elapsedSeconds || 3)})</span>
              <span className="text-stone-400 text-[10px]">| Simulasi visual selesai</span>
            </div>
          ) : (
            <div className="h-8 flex items-center">
              <span className="text-xs text-stone-400 italic">Siap melafalkan</span>
            </div>
          )}
        </div>

        {/* Circular Record Button (Purely Visual Press & Hold) */}
        <div className="relative select-none touch-none">
          {/* Animated pulsing outer halo when recording */}
          {recordingState === 'recording' && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
          )}

          <button
            type="button"
            onPointerDown={handleStartRecording}
            onPointerUp={handleStopRecording}
            onPointerLeave={handleStopRecording}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-150 shadow-xl focus:outline-hidden select-none active:scale-95 ${
              recordingState === 'recording'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-8 ring-emerald-200/80 scale-105'
                : recordingState === 'recorded'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white ring-4 ring-emerald-100'
                : 'bg-gradient-to-br from-emerald-700 to-emerald-900 text-white hover:brightness-110 shadow-emerald-900/20'
            }`}
            style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            aria-label="Tahan untuk merekam"
          >
            {recordingState === 'recording' ? (
              <Mic className="w-8 h-8 animate-pulse text-white" />
            ) : recordingState === 'recorded' ? (
              <RotateCcw className="w-7 h-7 text-emerald-100" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Instruction Status Label */}
        <div className="text-xs">
          {recordingState === 'recording' ? (
            <span className="font-bold text-emerald-700 tracking-wide">
              Merekam... Lepaskan tombol bila telah selesai
            </span>
          ) : recordingState === 'recorded' ? (
            <span className="font-semibold text-emerald-800">
              Pelafalan terekam. Anda dapat mengulangi atau menilai skor di bawah.
            </span>
          ) : (
            <span className="font-medium text-stone-500">
              Tahan tombol untuk merekam pelafalan Anda
            </span>
          )}
        </div>
      </div>

      {/* Manual Memorization Strength Score Assessment (1-10) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wide">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Nilai Kekuatan Hafalan Transisi Ini</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Penilaian mandiri subjektif untuk pasangan{' '}
              <strong className="text-emerald-900">
                {collection.name} {currentTransition.firstVerseNumber} → {currentTransition.nextVerseNumber}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Skor Saat Ini:</span>
            <span className="text-lg font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {currentTransition.memorizationScore} <span className="text-xs font-normal text-stone-400">/ 10</span>
            </span>
          </div>
        </div>

        {/* Step Buttons and Quick Pill Selectors (1 to 10) */}
        <div className="space-y-3">
          {/* Minus / Plus Stepper */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleScoreChange(currentTransition.memorizationScore - 1)}
              disabled={currentTransition.memorizationScore <= 1}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-extrabold text-sm transition-all"
              title="Kurangi skor"
            >
              [-] Turunkan Skor
            </button>

            <div className="text-center px-4 font-extrabold text-2xl text-emerald-950">
              {currentTransition.memorizationScore}{' '}
              <span className="text-stone-300 font-light text-base">/ 10</span>
            </div>

            <button
              onClick={() => handleScoreChange(currentTransition.memorizationScore + 1)}
              disabled={currentTransition.memorizationScore >= 10}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed font-extrabold text-sm border border-emerald-200 transition-all"
              title="Tingkatkan skor"
            >
              [+] Tingkatkan Skor
            </button>
          </div>

          {/* 1-10 Pill selector */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-stone-400 text-center mb-2">
              Pilih langsung tingkat kemutqinan (1 = Lemah / Baru, 10 = Sangat Lancar / Mutqin):
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-w-lg mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreVal) => {
                const isSelected = currentTransition.memorizationScore === scoreVal;
                return (
                  <button
                    key={scoreVal}
                    onClick={() => handleScoreChange(scoreVal)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-500 shadow-xs scale-105'
                        : 'bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60'
                    }`}
                  >
                    {scoreVal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Next (Lanjut) Navigation Button */}
      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 active:scale-[0.98] text-white font-extrabold text-base transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3"
        >
          <span>Lanjut Transisi Berikutnya</span>
          <ArrowRight className="w-5 h-5 text-emerald-200" />
        </button>
      </div>
    </div>
  );
};
