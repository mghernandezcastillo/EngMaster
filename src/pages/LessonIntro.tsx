import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, ArrowRight, ChevronRight, ChevronLeft, ChevronDown, Cpu, Puzzle, Database, Network, Fingerprint, Sparkles, Activity, Zap, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

export function LessonIntro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, updateProgress } = useStore();
  
  const [tab, setTab] = useState<'vocab' | 'structures'>('vocab');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [expandedStruct, setExpandedStruct] = useState<number | null>(null);
  const [isPlayingVocab, setIsPlayingVocab] = useState(false);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlayingVocab(false);
  }, [vocabIndex]);
  
  const lesson = lessons.find(l => l.id === id);

  if (!lesson) return <div>Lesson not found</div>;

  const speakVocab = () => {
    if (isPlayingVocab) {
      window.speechSynthesis.cancel();
      setIsPlayingVocab(false);
      return;
    }
    const vocab = lesson.vocabulary[vocabIndex];
    const text = `${vocab.expression}. ${vocab.microExample}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.onend = () => setIsPlayingVocab(false);
    utterance.onerror = () => setIsPlayingVocab(false);
    setIsPlayingVocab(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    updateProgress(lesson.id, 'intro');
    navigate(`/lesson/${lesson.id}/memorize`);
  };

  const vocab = lesson.vocabulary[vocabIndex];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none mb-4 text-center">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500 leading-tight">
          {lesson.title}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-800/50 rounded-lg mb-4 flex-none border border-white/5">
        <button onClick={() => setTab('vocab')} className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", tab === 'vocab' ? "bg-teal-500/20 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.2)]" : "text-slate-400")}>
          {language === 'es' ? 'Vocabulario' : 'Vocabulary'}
        </button>
        <button onClick={() => setTab('structures')} className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all", tab === 'structures' ? "bg-teal-500/20 text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.2)]" : "text-slate-400")}>
          {language === 'es' ? 'Patrones Clave' : 'Key Patterns'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {tab === 'vocab' ? (
            <motion.div
              key="vocab"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">

                {/* Spinning roulette rings — same as Memorize.tsx */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-500/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[360px] h-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dotted border-teal-400/30"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[220px] h-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ rotate: { duration: 22, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
                  />
                </div>

                {/* AI Scanner line */}
                <motion.div 
                  className="absolute left-0 right-0 h-[2px] bg-teal-400/50 shadow-[0_0_10px_#2dd4bf]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                />

                <div className="absolute top-4 flex items-center gap-2 text-xs font-mono text-teal-500 tracking-widest">
                  <Cpu className="w-4 h-4" />
                  <span>DATA_NODE: {vocabIndex + 1}/{lesson.vocabulary.length}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={vocabIndex}
                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full space-y-6 z-10"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      {/* DATA_NODE icon with spinning roulette rings */}
                      <div className="relative flex items-center justify-center w-24 h-24">
                        {/* Spinning ring 1 */}
                        <motion.div
                          className="absolute inset-0 rounded-full border border-dashed border-teal-500/40 pointer-events-none"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Spinning ring 2 */}
                        <motion.div
                          className="absolute -inset-3 rounded-full border border-teal-400/20 pointer-events-none"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Spinning ring 3 */}
                        <motion.div
                          className="absolute -inset-6 rounded-full border border-dotted border-emerald-500/10 pointer-events-none"
                          animate={{ rotate: 360, scale: [1, 1.04, 1] }}
                          transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
                        />

                        {/* Icon Container */}
                        <motion.div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.3)] relative overflow-hidden group"
                          animate={{ y: [-3, 3, -3] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="absolute inset-0 bg-teal-900/80 z-10 mix-blend-multiply" />
                          <img
                            src={lesson.image}
                            alt="Context"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-110"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/app_logo.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.5),transparent)] opacity-50 mix-blend-screen z-10" />
                          {(() => {
                            const getSemanticIcon = (word: string) => {
                              const str = word.toLowerCase();
                              if (str.includes('grow') || str.includes('build') || str.includes('up')) return Activity;
                              if (str.includes('think') || str.includes('mind') || str.includes('aware')) return BrainCircuit;
                              if (str.includes('connect') || str.includes('network')) return Network;
                              if (str.includes('find') || str.includes('look') || str.includes('seek')) return Fingerprint;
                              if (str.includes('new') || str.includes('innovate') || str.includes('create')) return Sparkles;
                              if (str.includes('power') || str.includes('force') || str.includes('drive')) return Zap;
                              return Database;
                            };
                            const CurrentIcon = getSemanticIcon(vocab.expression);
                            return <CurrentIcon className="w-8 h-8 text-teal-300 drop-shadow-[0_0_8px_rgba(20,184,166,0.8)] relative z-20" />;
                          })()}
                        </motion.div>
                      </div>
                      <h3 className="text-3xl font-bold text-teal-300 tracking-tight drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">
                        {vocab.expression}
                      </h3>
                    </div>

                {/* Audio listen button */}
                <button
                  onClick={(e) => { e.stopPropagation(); speakVocab(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 pointer-events-auto",
                    isPlayingVocab
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                      : "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                  )}
                >
                  {isPlayingVocab ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isPlayingVocab
                    ? (language === 'es' ? 'Detener' : 'Stop')
                    : (language === 'es' ? 'Escuchar' : 'Listen')}
                </button>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md text-left">
                  <p className="text-sm text-slate-200 font-medium mb-3 border-b border-white/10 pb-2">{vocab.meaning}</p>
                  <div className="space-y-1.5">
                    <p className="text-sm text-teal-400 font-medium">"{vocab.microExample}"</p>
                    <p className="text-xs text-slate-400 italic">"{vocab.microExampleTranslation}"</p>
                  </div>
                </div>

                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-4 left-0 w-full px-4 flex items-center justify-between gap-2 z-20">
                  <button
                    disabled={vocabIndex === 0}
                    onClick={(e) => { e.stopPropagation(); setVocabIndex(prev => prev - 1); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-full disabled:opacity-30 border border-white/10 transition-all pointer-events-auto shadow-lg active:scale-90"
                  >
                    <ChevronLeft className="w-6 h-6 text-teal-400" />
                  </button>

                  {/* Progress dots in the center */}
                  <div className="flex gap-1 justify-center flex-1">
                    {lesson.vocabulary.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setVocabIndex(i); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300 pointer-events-auto",
                          i === vocabIndex ? "w-5 bg-teal-400" : "w-1.5 bg-slate-600"
                        )}
                      />
                    ))}
                  </div>

                  <button
                    disabled={vocabIndex === lesson.vocabulary.length - 1}
                    onClick={(e) => { e.stopPropagation(); setVocabIndex(prev => prev + 1); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-full disabled:opacity-30 border border-white/10 transition-all pointer-events-auto shadow-lg active:scale-90"
                  >
                    <ChevronRight className="w-6 h-6 text-teal-400" />
                  </button>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="structures"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col"
            >
              <div className="bg-teal-900/20 border border-teal-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
                <Puzzle className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <p className="text-xs text-teal-100/80 leading-relaxed">
                  {language === 'es' 
                    ? 'Estos son los patrones gramaticales avanzados que internalizarás en este módulo. Memorizar cómo conectar estas ideas te dará fluidez natural (nivel C1).' 
                    : 'These are the advanced grammatical patterns you will internalize in this module. Memorizing how to connect these ideas will give you natural fluency (C1 level).'}
                </p>
              </div>
              <div className="space-y-3 pb-4">
                {lesson.structures.map((struct, i) => {
                  const isExpanded = expandedStruct === i;
                  const match = struct.match(/^(.*?)(?:\((.*?)\))?$/);
                  const mainPattern = match?.[1]?.trim() || struct;
                  const detail = match?.[2]?.trim() || "";
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      onClick={() => setExpandedStruct(isExpanded ? null : i)}
                      className={cn(
                        "p-4 rounded-xl border relative overflow-hidden cursor-pointer transition-all",
                        isExpanded 
                          ? "bg-slate-800/80 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]" 
                          : "bg-slate-800/40 border-teal-500/10 hover:bg-slate-800/60"
                      )}
                    >
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 transition-all",
                        isExpanded ? "bg-teal-400" : "bg-teal-500/50"
                      )} />
                      
                      <div className="flex justify-between items-center pl-2">
                        <p className="text-sm text-slate-200 font-medium">{mainPattern}</p>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-teal-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-2 pt-3 mt-3 border-t border-white/5 overflow-hidden"
                          >
                            <div className="flex gap-2 items-start mb-2">
                              <BrainCircuit className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-teal-200">
                                <span className="font-bold text-teal-400">{language === 'es' ? 'Concepto Neural:' : 'Neural Concept:'}</span> {detail || (language === 'es' ? `Patrón avanzado para: ${lesson.title}` : `Advanced pattern for: ${lesson.title}`)}
                              </p>
                            </div>
                            <p className="text-xs text-slate-400 italic bg-black/20 p-2 rounded-md">
                              {language === 'es' 
                                ? `Usa esta estructura para articular ideas complejas sobre "${lesson.title.toLowerCase()}". Al memorizar el patrón completo, tu cerebro no traduce palabra por palabra, permitiéndote expresar estas ideas (como "${lesson.subtitle}") con la fluidez de un nivel C1.`
                                : `Use this structure to articulate complex ideas about "${lesson.title.toLowerCase()}". By memorizing the full pattern, your brain avoids word-by-word translation, allowing you to express these concepts (like "${lesson.subtitle}") with C1-level fluency.`}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none pt-4 pb-2">
        <button 
          onClick={handleStart}
          className="w-full relative overflow-hidden group bg-teal-600/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
        >
          <BrainCircuit className="w-5 h-5" />
          {language === 'es' ? 'Iniciar Sincronización Neural' : 'Start Neural Sync'}
          <ArrowRight className="w-5 h-5" />
          
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </button>
      </div>
    </div>
  );
}
