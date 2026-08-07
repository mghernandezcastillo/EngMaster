import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowRight, Check, Eye, EyeOff, Activity, Play, Square, BookOpen } from 'lucide-react';
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
  const [highlightCharIndex, setHighlightCharIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

  const currentText = isReviewMode ? lesson.text : paragraphs[currentParagraph];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Progress Bar */}
      <div className="flex-none flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-white/5">
        <div className="flex flex-1 gap-1.5 mr-4">
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

      {/* Main Card */}
      <div className="flex-1 relative flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentParagraph + (isHidden ? '-hidden' : '-visible') + (isReviewMode ? '-review' : '')}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-teal-500/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Glowing orb background effect */}
            <motion.div 
              className="absolute w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* AI Background for Review Mode */}
            {isReviewMode && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <motion.div
                  className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-dashed border-teal-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-dotted border-teal-400/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-teal-500/10 shadow-[0_0_100px_rgba(20,184,166,0.1)]"
                  animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                  transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                />
                {/* Floating Particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-teal-400/60 rounded-full"
                    initial={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      opacity: Math.random()
                    }}
                    animate={{
                      y: [null, Math.random() * window.innerHeight],
                      x: [null, Math.random() * window.innerWidth],
                      opacity: [null, Math.random(), null]
                    }}
                    transition={{
                      duration: 10 + Math.random() * 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>
            )}
            
            {isReviewMode ? (
              <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-800/90 backdrop-blur pb-2 z-20 border-b border-white/5">
                  <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    {language === 'es' ? 'Repaso General' : 'Full Review'}
                  </h3>
                  <button 
                    onClick={toggleKaraoke}
                    className="flex items-center gap-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded transition-colors uppercase tracking-wider border border-teal-500/20"
                  >
                    {isPlaying ? <Square className="w-3 h-3" fill="currentColor" /> : <Play className="w-3 h-3" fill="currentColor" />}
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
              <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
                <div className="my-auto w-full py-4">
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} />
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
                <div className="text-center">
                  <div className="text-xs font-mono text-teal-500 mb-1 tracking-widest uppercase">
                    {language === 'es' ? 'Recuperación Activa' : 'Active Recall'}
                  </div>
                  <p className="text-slate-300 font-medium">
                    {language === 'es' ? 'Reconstruye el texto en tu mente' : 'Reconstruct the text in your mind'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex-none flex gap-3 pt-2">
        {!isReviewMode && (
          <button 
            onClick={() => setIsHidden(!isHidden)}
            className="flex-1 py-4 rounded-2xl font-bold bg-slate-800/80 border border-white/10 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
          >
            {isHidden ? <Eye className="w-5 h-5 text-teal-400" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
            {isHidden ? (language === 'es' ? 'Mostrar' : 'Show') : (language === 'es' ? 'Ocultar' : 'Hide')}
          </button>
        )}
        <button 
          onClick={handleNext}
          className="flex-1 py-4 rounded-2xl font-bold bg-teal-600/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
        >
          {isReviewMode ? (
            <>
              {language === 'es' ? 'Continuar a Evaluación' : 'Proceed to Test'} <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              {language === 'es' ? 'Avanzar' : 'Proceed'} <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
