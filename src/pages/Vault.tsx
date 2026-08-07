import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookMarked, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  PlayCircle, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Vault() {
  const navigate = useNavigate();
  const { progress, language } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | 'all'>('all');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(lessons[0]?.id || null);

  // Flatten all vocabulary expressions with lesson context
  const allVocab = lessons.flatMap((lesson, index) => 
    lesson.vocabulary.map(item => ({
      ...item,
      lessonId: lesson.id,
      lessonNumber: index + 1,
      lessonTitle: lesson.title,
      isCompleted: progress[lesson.id]?.stage === 'completed'
    }))
  );

  // Filtered vocabulary
  const filteredVocab = allVocab.filter(item => {
    const matchesSearch = 
      item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.microExample.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLesson = selectedLessonId === 'all' || item.lessonId === selectedLessonId;
    return matchesSearch && matchesLesson;
  });

  // Calculate statistics
  const totalWords = allVocab.length;
  const completedLessons = Object.values(progress).filter(p => p?.stage === 'completed').length;

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto custom-scrollbar pb-6">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono"
        >
          <BookMarked className="w-3.5 h-3.5" />
          {language === 'es' ? 'Bóveda de Conocimiento C1' : 'C1 Knowledge Vault'}
        </motion.div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
          {language === 'es' ? 'Recuperación & Repaso' : 'Recall & Mastery'}
        </h1>
        <p className="text-xs text-slate-400">
          {language === 'es' 
            ? `${totalWords} expresiones y patrones estructurados por lección` 
            : `${totalWords} expressions & structural patterns organized by lesson`}
        </p>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">{completedLessons} / {lessons.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              {language === 'es' ? 'Módulos Listos' : 'Completed'}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">{totalWords}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              {language === 'es' ? 'Items C1' : 'C1 Expressions'}
            </div>
          </div>
        </div>
      </div>

      {/* Global Review Trigger */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // Launch test of the first active lesson or lesson 1
          const activeLesson = lessons.find(l => progress[l.id]?.stage === 'completed') || lessons[0];
          navigate(`/lesson/${activeLesson.id}/test`);
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:bg-teal-500/30 transition-all"
      >
        <BrainCircuit className="w-4 h-4 text-teal-400" />
        {language === 'es' ? 'Iniciar Test de Repaso Rápido' : 'Start Quick Mastery Quiz'}
        <Sparkles className="w-4 h-4 text-emerald-400" />
      </motion.button>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'es' ? 'Buscar phrasal verb, significado...' : 'Search expression, meaning...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter by Module */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        <button
          onClick={() => setSelectedLessonId('all')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border",
            selectedLessonId === 'all'
              ? "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
              : "bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800"
          )}
        >
          {language === 'es' ? 'Todos los Módulos' : 'All Modules'}
        </button>
        {lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => setSelectedLessonId(lesson.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border",
              selectedLessonId === lesson.id
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                : "bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800"
            )}
          >
            M{idx + 1}
          </button>
        ))}
      </div>

      {/* Main List Section */}
      {searchQuery || selectedLessonId !== 'all' ? (
        /* Flat filtered list */
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono text-slate-400 px-1">
            {language === 'es' ? `Resultados (${filteredVocab.length})` : `Results (${filteredVocab.length})`}
          </div>
          {filteredVocab.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {language === 'es' ? 'No se encontraron expresiones.' : 'No expressions found.'}
            </div>
          ) : (
            filteredVocab.map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-slate-800/40 border border-white/5 rounded-xl space-y-1.5 hover:border-teal-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-teal-300">{item.expression}</span>
                  <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                    Módulo {item.lessonNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{item.meaning}</p>
                <p className="text-[11px] text-teal-400/80 italic">"{item.microExample}"</p>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Accordion by Lesson */
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isExpanded = expandedLessonId === lesson.id;
            const isCompleted = progress[lesson.id]?.stage === 'completed';

            return (
              <div 
                key={lesson.id}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  isExpanded 
                    ? "bg-slate-800/60 border-teal-500/30 shadow-lg" 
                    : "bg-slate-800/30 border-white/5 hover:border-white/10"
                )}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border",
                      isCompleted 
                        ? "bg-teal-500/20 text-teal-300 border-teal-500/40" 
                        : "bg-slate-900 text-slate-400 border-white/5"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{lesson.title}</h4>
                      <p className="text-[10px] text-slate-400">{lesson.vocabulary.length} {language === 'es' ? 'expresiones C1' : 'C1 expressions'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-teal-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 p-4 space-y-3 bg-slate-900/40"
                    >
                      {/* Action Bar */}
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => navigate(`/lesson/${lesson.id}/test`)}
                          className="flex-1 py-2 px-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-teal-500/20 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Test de Módulo' : 'Module Quiz'}
                        </button>
                        <button
                          onClick={() => navigate(`/lesson/${lesson.id}/intro`)}
                          className="py-2 px-3 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-all"
                        >
                          <BookMarked className="w-3.5 h-3.5" />
                          {language === 'es' ? 'Ver Patrones' : 'View Patterns'}
                        </button>
                      </div>

                      {/* Vocabulary list inside module */}
                      <div className="space-y-2">
                        {lesson.vocabulary.map((item, vIdx) => (
                          <div 
                            key={vIdx}
                            className="p-3 bg-slate-800/40 border border-white/5 rounded-xl text-left space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-teal-300">{item.expression}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-medium">{item.meaning}</p>
                            <p className="text-[10px] text-teal-400/80 italic">"{item.microExample}"</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
