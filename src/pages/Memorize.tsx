import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Brain,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Activity,
  Play,
  Square,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TextHighlighter } from '../components/TextHighlighter';

export function Memorize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, updateProgress } = useStore();

  const lesson = lessons.find(l => l.id === id);
  const paragraphs = lesson?.text
    .match(/[^.?!]+[.?!]+(?:\s+|$)|.+/g)
    ?.map(s => s.trim())
    .filter(s => s.length > 0) || [];
  const startsInReviewMode = searchParams.get('mode') === 'review' && paragraphs.length > 0;

  const [currentParagraph, setCurrentParagraph] = useState(startsInReviewMode ? paragraphs.length : 0);
  const [direction, setDirection] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingFragment, setIsPlayingFragment] = useState(false);
  const [highlightCharIndex, setHighlightCharIndex] = useState<number | undefined>(undefined);

  // Ref to prevent rapid-click navigation blocking
  const navigatingRef = useRef(false);
  const reviewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Cancel fragment audio when paragraph changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlayingFragment(false);
    navigatingRef.current = false;
  }, [currentParagraph]);

  if (!lesson) return <div>Lesson not found</div>;

  const isReviewMode = currentParagraph === paragraphs.length;
  const currentText = isReviewMode ? lesson.text : paragraphs[currentParagraph];

  // Debounced paginate — ignore if already navigating
  const paginate = useCallback((newDirection: number) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    setDirection(newDirection);
    setIsHidden(false);

    setCurrentParagraph(prev => {
      const next = prev + newDirection;
      if (next < 0) return prev;
      if (next > paragraphs.length) return prev;
      return next;
    });
  }, [paragraphs.length]);

  // Swipe gesture handler (same as Dashboard)
  const handleDragEnd = (_e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -8000 && currentParagraph < paragraphs.length) {
      paginate(1);
    } else if (swipe > 8000 && currentParagraph > 0) {
      paginate(-1);
    }
  };

  // Karaoke for full review
  const toggleKaraoke = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setHighlightCharIndex(undefined);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lesson.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setHighlightCharIndex(event.charIndex);
          // Auto-scroll the review container to the highlighted word
          const el = document.getElementById('spoken-word');
          if (el && reviewScrollRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setHighlightCharIndex(undefined);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setHighlightCharIndex(undefined);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fragment audio
  const speakCurrentFragment = () => {
    if (isPlayingFragment) {
      window.speechSynthesis.cancel();
      setIsPlayingFragment(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = isReviewMode ? lesson.text : paragraphs[currentParagraph];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.onend = () => setIsPlayingFragment(false);
      utterance.onerror = () => setIsPlayingFragment(false);
      setIsPlayingFragment(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentParagraph < paragraphs.length - 1) {
      paginate(1);
    } else if (currentParagraph === paragraphs.length - 1) {
      // Go to review mode
      setDirection(1);
      setCurrentParagraph(paragraphs.length);
      setIsHidden(false);
      navigatingRef.current = false;
    } else {
      updateProgress(lesson.id, 'memorize');
      navigate(`/lesson/${lesson.id}/test`);
    }
  };

  const handlePrev = () => {
    if (currentParagraph > 0) {
      paginate(-1);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">

      {/* Progress Bar */}
      <div className="flex-none flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-white/5 shadow-md">
        <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
          {isReviewMode
            ? (language === 'es' ? 'REPASO' : 'REVIEW')
            : `${currentParagraph + 1}/${paragraphs.length}`}
        </span>

        <div className="flex flex-1 gap-1.5 mx-3">
          {paragraphs.map((_, idx) => (
            <div key={idx} className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-700/50 relative">
              {idx <= currentParagraph && (
                <motion.div
                  initial={{ width: idx === currentParagraph ? '0%' : '100%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                  className={cn("absolute inset-0", idx === currentParagraph && !isReviewMode ? "bg-teal-400" : "bg-teal-600/50")}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-teal-500">
          <Activity className="w-3 h-3" />
          <span>{Math.round((Math.min(currentParagraph + 1, paragraphs.length) / paragraphs.length) * 100)}%</span>
        </div>
      </div>

      {/* Main Swipeable Card Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">

        {/* Arrow overlays */}
        {currentParagraph > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-[100] p-2.5 bg-slate-900/80 rounded-full border border-white/10 text-teal-400 hover:text-teal-300 backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentParagraph < paragraphs.length && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-[100] p-2.5 bg-slate-900/80 rounded-full border border-white/10 text-teal-400 hover:text-teal-300 backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentParagraph + '-' + (isHidden ? 'h' : 'v')}
            custom={direction}
            initial={{ opacity: 0, scale: 0.9, x: direction > 0 ? 120 : -120 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: direction > 0 ? -120 : 120 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag={isReviewMode ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            className={cn(
              "absolute inset-0 mx-8 rounded-3xl shadow-2xl flex flex-col overflow-hidden",
              "bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-teal-500/30",
              !isReviewMode && "cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Animated glow border */}
            <motion.div
              className="absolute inset-0 rounded-3xl border border-teal-500/20 pointer-events-none"
              animate={{ boxShadow: ['0 0 0px transparent', '0 0 18px rgba(20,184,166,0.35)', '0 0 0px transparent'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />

            {/* Background roulette rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <motion.div
                className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-500/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dotted border-teal-400/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/20"
                animate={{ rotate: 360, scale: [1, 1.07, 1] }}
                transition={{ rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 3.5, repeat: Infinity } }}
              />
            </div>

            {/* Glowing orb */}
            <motion.div
              className="absolute w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />

            {/* ── REVIEW MODE ── */}
            {isReviewMode ? (
              <div ref={reviewScrollRef} className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-5">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-800/95 backdrop-blur pb-2 z-20 border-b border-white/5">
                  <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    {language === 'es' ? 'Repaso General' : 'Full Review'}
                  </h3>
                  <button
                    onClick={toggleKaraoke}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border shadow-md active:scale-95",
                      isPlaying
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                    )}
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                    {isPlaying
                      ? (language === 'es' ? 'Detener' : 'Stop')
                      : (language === 'es' ? 'Escuchar Karaoke' : 'Listen Karaoke')}
                  </button>
                </div>
                <div className="mb-5 text-center">
                  <h4 className="text-xl font-bold text-teal-300">{lesson.title}</h4>
                  {lesson.subtitle && <p className="text-sm text-teal-500/80 mt-1">{lesson.subtitle}</p>}
                </div>
                <div className="pb-10">
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} highlightCharIndex={highlightCharIndex} />
                </div>
              </div>
            ) : !isHidden ? (
              /* ── NORMAL TEXT FRAGMENT ── */
              <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                  <span className="text-[10px] font-mono text-teal-400/80 uppercase tracking-widest">
                    {language === 'es' ? 'FRAGMENTO' : 'FRAGMENT'} {currentParagraph + 1}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); speakCurrentFragment(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 pointer-events-auto",
                      isPlayingFragment
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                        : "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                    )}
                  >
                    {isPlayingFragment ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isPlayingFragment
                      ? (language === 'es' ? 'Detener' : 'Stop')
                      : (language === 'es' ? 'Escuchar' : 'Listen')}
                  </button>
                </div>
                <div className="my-auto py-4">
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} />
                </div>
                <p className="text-[10px] text-center text-slate-600 font-mono mt-2">
                  {language === 'es' ? 'Desliza o usa las flechas para navegar' : 'Swipe or use arrows to navigate'}
                </p>
              </div>
            ) : (
              /* ── HIDDEN / RECALL MODE ── */
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6 px-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-4 border border-dashed border-teal-500/40 rounded-full pointer-events-none"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-8 border border-teal-500/20 rounded-full pointer-events-none"
                  />
                  <Brain className="w-14 h-14 text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xs font-mono text-teal-500 tracking-widest uppercase">
                    {language === 'es' ? 'Recuperación Activa' : 'Active Recall'}
                  </div>
                  <p className="text-slate-300 font-medium text-sm">
                    {language === 'es' ? 'Reconstruye el texto en tu mente' : 'Reconstruct the text in your mind'}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); speakCurrentFragment(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all shadow-md pointer-events-auto"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    {language === 'es' ? 'Pista de Audio' : 'Audio Clue'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex-none flex items-center gap-2 pt-1">
        {/* Back */}
        <button
          disabled={currentParagraph === 0}
          onClick={handlePrev}
          className={cn(
            "p-3.5 rounded-2xl font-bold border transition-all active:scale-95 flex items-center justify-center shrink-0",
            currentParagraph > 0
              ? "bg-slate-800/80 border-white/10 text-teal-400 hover:bg-slate-700 hover:border-teal-500/30"
              : "bg-slate-800/30 border-white/5 text-slate-600 cursor-not-allowed opacity-40"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Hide/Show */}
        {!isReviewMode && (
          <button
            onClick={() => setIsHidden(!isHidden)}
            className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-800/80 border border-white/10 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
          >
            {isHidden ? <Eye className="w-4 h-4 text-teal-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {isHidden ? (language === 'es' ? 'Mostrar' : 'Show') : (language === 'es' ? 'Ocultar' : 'Hide')}
          </button>
        )}

        {/* Fragment audio button */}
        {!isReviewMode && (
          <button
            onClick={(e) => { e.stopPropagation(); speakCurrentFragment(); }}
            className={cn(
              "p-3.5 rounded-2xl font-bold border transition-all active:scale-95 flex items-center justify-center shrink-0",
              isPlayingFragment
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-slate-800/80 border-white/10 text-teal-300 hover:bg-slate-700"
            )}
          >
            {isPlayingFragment ? <VolumeX className="w-5 h-5 text-emerald-400" /> : <Volume2 className="w-5 h-5 text-teal-400" />}
          </button>
        )}

        {/* Forward / Proceed */}
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl font-bold bg-teal-600/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-xs"
        >
          {isReviewMode ? (
            <>{language === 'es' ? 'Evaluación' : 'Test'} <Check className="w-4 h-4" /></>
          ) : (
            <>{language === 'es' ? 'Avanzar' : 'Next'} <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Dot indicator */}
      <div className="flex justify-center gap-1 pb-1">
        {paragraphs.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setDirection(idx > currentParagraph ? 1 : -1); setCurrentParagraph(idx); setIsHidden(false); }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === currentParagraph ? "w-5 bg-teal-400" : "w-1.5 bg-slate-700 hover:bg-slate-500"
            )}
          />
        ))}
        <button
          onClick={() => { setDirection(1); setCurrentParagraph(paragraphs.length); setIsHidden(false); }}
          className={cn("h-1.5 rounded-full transition-all duration-300", isReviewMode ? "w-5 bg-emerald-400" : "w-1.5 bg-slate-700 hover:bg-slate-500")}
        />
      </div>
    </div>
  );
}
