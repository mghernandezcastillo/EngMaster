import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
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
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TextHighlighter } from '../components/TextHighlighter';

export function Memorize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, updateProgress } = useStore();
  
  const lesson = lessons.find(l => l.id === id);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingFragment, setIsPlayingFragment] = useState(false);
  const [highlightCharIndex, setHighlightCharIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Cancel speech audio when changing paragraphs
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPlayingFragment(false);
    setHighlightCharIndex(undefined);
  }, [currentParagraph]);

  if (!lesson) return <div>Lesson not found</div>;

  // Split text into smaller, contextually logical chunks (sentences) to avoid scrolling
  const paragraphs = lesson.text.match(/[^.?!]+[.?!]+(?:\s+|$)|.+/g)?.map(s => s.trim()).filter(s => s.length > 0) || [lesson.text];

  const isReviewMode = currentParagraph === paragraphs.length;

  const toggleKaraoke = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setHighlightCharIndex(undefined);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lesson.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setHighlightCharIndex(event.charIndex);
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setHighlightCharIndex(undefined);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakCurrentFragment = () => {
    if (isPlayingFragment) {
      window.speechSynthesis.cancel();
      setIsPlayingFragment(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = isReviewMode ? lesson.text : paragraphs[currentParagraph];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsPlayingFragment(false);
      };
      utterance.onerror = () => {
        setIsPlayingFragment(false);
      };

      setIsPlayingFragment(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentParagraph < paragraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
      setIsHidden(false);
    } else if (currentParagraph === paragraphs.length - 1) {
      setCurrentParagraph(paragraphs.length); // Trigger review mode
    } else {
      updateProgress(lesson.id, 'memorize');
      navigate(`/lesson/${lesson.id}/test`);
    }
  };

  const handlePrev = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
      setIsHidden(false);
    }
  };

  const currentText = isReviewMode ? lesson.text : paragraphs[currentParagraph];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Progress Bar & Counter */}
      <div className="flex-none flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-white/5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
            {isReviewMode ? (language === 'es' ? 'REPASO' : 'REVIEW') : `${currentParagraph + 1}/${paragraphs.length}`}
          </span>
        </div>
        <div className="flex flex-1 gap-1.5 mx-3">
          {paragraphs.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-700/50 relative"
            >
              {idx <= currentParagraph && (
                <motion.div 
                  initial={{ width: idx === currentParagraph ? '0%' : '100%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
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

      {/* Main Fragment Card */}
      <div className="flex-1 relative flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentParagraph + (isHidden ? '-hidden' : '-visible') + (isReviewMode ? '-review' : '')}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-teal-500/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Spinning Roulette / AI Ring Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <motion.div
                className="absolute top-1/2 left-1/2 w-[550px] h-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-dashed border-teal-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-dotted border-teal-400/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-[250px] h-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.15)]"
                animate={{ rotate: 360, scale: [1, 1.06, 1] }}
                transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              />
            </div>

            {/* Glowing orb background effect */}
            <motion.div 
              className="absolute w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {isReviewMode ? (
              <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-800/90 backdrop-blur pb-2 z-20 border-b border-white/5">
                  <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    {language === 'es' ? 'Repaso General' : 'Full Review'}
                  </h3>
                  <button 
                    onClick={toggleKaraoke}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-500/20 hover:bg-teal-500/30 px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider border border-teal-500/30 shadow-md active:scale-95"
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                    {isPlaying ? (language === 'es' ? 'Detener' : 'Stop') : (language === 'es' ? 'Escuchar (Karaoke)' : 'Listen (Karaoke)')}
                  </button>
                </div>
                <div className="mb-6 text-center">
                  <h4 className="text-xl font-bold text-teal-300">{lesson.title}</h4>
                  {lesson.subtitle && (
                    <p className="text-sm text-teal-500/80 mt-1">{lesson.subtitle}</p>
                  )}
                </div>
                <div className="pb-8">
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} highlightCharIndex={highlightCharIndex} />
                </div>
              </div>
            ) : !isHidden ? (
              <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
                {/* Audio Listen Button for the current fragment */}
                <div className="flex items-center justify-between pt-1 pb-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-teal-400/80 uppercase tracking-widest">
                    {language === 'es' ? 'FRAGMENTO DE TEXTO' : 'TEXT FRAGMENT'}
                  </span>
                  <button
                    onClick={speakCurrentFragment}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95",
                      isPlayingFragment
                        ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                        : "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                    )}
                  >
                    {isPlayingFragment ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isPlayingFragment 
                      ? (language === 'es' ? 'Detener Audio' : 'Stop Audio') 
                      : (language === 'es' ? 'Escuchar Fragmento' : 'Listen Fragment')}
                  </button>
                </div>

                <div className="my-auto w-full py-4 text-center">
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} />
                </div>

                <div className="text-[10px] text-center text-slate-500 font-mono">
                  {language === 'es' ? 'Usa las flechas para retroceder u ocultar el texto' : 'Use arrows to navigate or hide text'}
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border border-dashed border-teal-500/40 rounded-full pointer-events-none"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-8 border border-teal-500/20 rounded-full pointer-events-none"
                  />
                  <Brain className="w-16 h-16 text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-xs font-mono text-teal-500 tracking-widest uppercase">
                    {language === 'es' ? 'Recuperación Activa' : 'Active Recall'}
                  </div>
                  <p className="text-slate-300 font-medium">
                    {language === 'es' ? 'Reconstruye el texto en tu mente' : 'Reconstruct the text in your mind'}
                  </p>

                  <button
                    onClick={speakCurrentFragment}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    {language === 'es' ? 'Escuchar Pista de Audio' : 'Listen Audio Clue'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls: Back, Hide/Show, Audio, Forward */}
      <div className="flex-none flex items-center gap-2 pt-1">
        {/* Back Button */}
        <button
          disabled={currentParagraph === 0}
          onClick={handlePrev}
          className={cn(
            "p-3.5 rounded-2xl font-bold border transition-all active:scale-95 backdrop-blur-sm flex items-center justify-center shrink-0",
            currentParagraph > 0
              ? "bg-slate-800/80 border-white/10 text-teal-400 hover:bg-slate-700 hover:border-teal-500/30"
              : "bg-slate-800/30 border-white/5 text-slate-600 cursor-not-allowed opacity-40"
          )}
          title={language === 'es' ? 'Retroceder fragmento' : 'Previous fragment'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Hide/Show Toggle */}
        {!isReviewMode && (
          <button 
            onClick={() => setIsHidden(!isHidden)}
            className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-800/80 border border-white/10 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 backdrop-blur-sm text-xs"
          >
            {isHidden ? <Eye className="w-4 h-4 text-teal-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {isHidden ? (language === 'es' ? 'Mostrar' : 'Show') : (language === 'es' ? 'Ocultar' : 'Hide')}
          </button>
        )}

        {/* Listen Fragment Audio Button in Controls Bar */}
        {!isReviewMode && (
          <button 
            onClick={speakCurrentFragment}
            className={cn(
              "p-3.5 rounded-2xl font-bold border transition-all active:scale-95 backdrop-blur-sm flex items-center justify-center shrink-0",
              isPlayingFragment
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-slate-800/80 border-white/10 text-teal-300 hover:bg-slate-700"
            )}
            title={language === 'es' ? 'Escuchar fragmento' : 'Listen fragment'}
          >
            {isPlayingFragment ? <VolumeX className="w-5 h-5 text-emerald-400" /> : <Volume2 className="w-5 h-5 text-teal-400" />}
          </button>
        )}

        {/* Forward Next Button */}
        <button 
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl font-bold bg-teal-600/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-xs"
        >
          {isReviewMode ? (
            <>
              {language === 'es' ? 'Evaluación' : 'Test'} <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              {language === 'es' ? 'Avanzar' : 'Proceed'} <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
