import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Cpu, Sparkles, Home, ChevronRight, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { Word } from '../types';
import { cn } from '../lib/utils';

type TestMode = 'quiz' | 'quiz-results' | 'transcription' | 'transcription-feedback';

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function Test() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, updateProgress } = useStore();
  
  const lesson = lessons.find(l => l.id === id);
  
  const [mode, setMode] = useState<TestMode>('quiz');
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Word[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  
  // Transcription State
  const [attempt, setAttempt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ feedback: string; score: number; missedWords: string[] } | null>(null);
  
  useEffect(() => {
    if (lesson) {
      const shuffledWords = shuffle(lesson.vocabulary);
      setQuizQuestions(shuffledWords.slice(0, 5));
    }
  }, [lesson]);
  
  useEffect(() => {
    if (quizQuestions.length > 0 && currentQuestionIdx < quizQuestions.length) {
      const currentWord = quizQuestions[currentQuestionIdx];
      
      const distractors = shuffle(lesson!.vocabulary.filter(v => v.expression !== currentWord.expression)).slice(0, 3).map(w => w.expression);
      
      setOptions(shuffle([currentWord.expression, ...distractors]));
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  }, [currentQuestionIdx, quizQuestions, lesson]);

  if (!lesson) return <div>Lesson not found</div>;

  const handleAnswerSelect = (option: string) => {
    if (showAnswer) return;
    
    setSelectedAnswer(option);
    setShowAnswer(true);
    
    if (option === quizQuestions[currentQuestionIdx].expression) {
      setQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestionIdx < quizQuestions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        setMode('quiz-results');
      }
    }, 1500);
  };
  
  const handleTranscriptionSubmit = async () => {
    if (!attempt.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: lesson.text,
          userAttempt: attempt,
          language
        })
      });
      
      const data = await response.json();
      setFeedback(data);
      updateProgress(lesson.id, 'completed', data.score);
      setMode('transcription-feedback');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    updateProgress(lesson.id, 'completed', Math.round((quizScore / quizQuestions.length) * 100));
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        
        {/* QUIZ MODE */}
        {mode === 'quiz' && quizQuestions.length > 0 && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full space-y-6"
          >
            <div className="flex-none bg-slate-800/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-400">
                <BrainCircuit className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide uppercase">
                  {language === 'es' ? 'Evaluación de Vocabulario' : 'Vocabulary Evaluation'}
                </span>
              </div>
              <div className="text-sm font-mono text-slate-400">
                {currentQuestionIdx + 1} / {quizQuestions.length}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="text-center px-4">
                <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-widest">
                  {language === 'es' ? 'Selecciona la expresión para:' : 'Select the expression for:'}
                </h3>
                <h2 className="text-2xl font-bold text-white leading-snug">
                  "{quizQuestions[currentQuestionIdx].meaning}"
                </h2>
              </div>

              <div className="w-full flex flex-col gap-3">
                {options.map((option, idx) => {
                  const isCorrect = option === quizQuestions[currentQuestionIdx].expression;
                  const isSelected = option === selectedAnswer;
                  
                  let buttonClasses = "border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-700";
                  let Icon = null;
                  
                  if (showAnswer) {
                    if (isCorrect) {
                      buttonClasses = "border-teal-500 bg-teal-500/20 text-teal-300";
                      Icon = CheckCircle2;
                    } else if (isSelected) {
                      buttonClasses = "border-rose-500 bg-rose-500/20 text-rose-300";
                      Icon = XCircle;
                    } else {
                      buttonClasses = "border-white/5 bg-slate-800/40 text-slate-500 opacity-50";
                    }
                  } else if (isSelected) {
                    buttonClasses = "border-teal-500/50 bg-teal-500/10 text-teal-300";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showAnswer}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all border flex items-center justify-between shadow-sm",
                        buttonClasses,
                        !showAnswer && "active:scale-95 hover:border-teal-500/30"
                      )}
                    >
                      <span>{option}</span>
                      {Icon && <Icon className="w-6 h-6" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* QUIZ RESULTS */}
        {mode === 'quiz-results' && (
          <motion.div 
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full items-center justify-center space-y-8"
          >
            <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 rounded-full w-48 h-48 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(20,184,166,0.15)]">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300 mb-1">
                {Math.round((quizScore / quizQuestions.length) * 100)}%
              </div>
              <div className="text-xs font-mono text-teal-400 tracking-widest uppercase">
                {language === 'es' ? 'Puntuación' : 'Score'}
              </div>
            </div>
            
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">
                {language === 'es' ? '¡Evaluación Completada!' : 'Evaluation Completed!'}
              </h2>
              <p className="text-slate-400">
                {language === 'es' 
                  ? 'Has demostrado una buena comprensión del vocabulario de esta lección.' 
                  : 'You have shown a good understanding of this lesson\'s vocabulary.'}
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 mt-4">
              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-slate-900 py-4 rounded-2xl font-bold transition-all hover:bg-teal-400 active:scale-95 shadow-lg shadow-teal-500/20"
              >
                <CheckCircle2 className="w-5 h-5" />
                {language === 'es' ? 'Finalizar Lección' : 'Finish Lesson'}
              </button>
              
              <button
                onClick={() => setMode('transcription')}
                className="w-full flex items-center justify-center gap-2 bg-slate-800/80 border border-teal-500/30 hover:bg-slate-700 text-teal-300 py-4 rounded-2xl font-bold transition-all active:scale-95"
              >
                <Cpu className="w-5 h-5" />
                {language === 'es' ? 'Reto Opcional: Transcripción con IA' : 'Optional Challenge: AI Transcription'}
              </button>
            </div>
          </motion.div>
        )}

        {/* TRANSCRIPTION MODE */}
        {mode === 'transcription' && (
          <motion.div 
            key="transcription"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full space-y-4"
          >
            {/* Header/Memory Map */}
            <div className="flex-none bg-slate-800/60 p-3 rounded-2xl border border-teal-500/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <h3 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                    Memory Map Sequence
                  </h3>
                </div>
                <button onClick={handleFinish} className="text-xs text-slate-400 hover:text-white underline">
                  {language === 'es' ? 'Saltar' : 'Skip'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lesson.memoryMap.map((mapItem, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-[11px] font-medium bg-slate-900/80 px-2 py-0.5 rounded text-teal-300 border border-teal-500/10">
                      {mapItem}
                    </span>
                    {idx < lesson.memoryMap.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 focus-within:border-teal-500/50 transition-colors shadow-inner">
              <textarea
                value={attempt}
                onChange={(e) => setAttempt(e.target.value)}
                placeholder={language === 'es' ? 'Transcribe el texto de memoria aquí...' : 'Transcribe the text from memory here...'}
                className="w-full h-full p-4 bg-transparent resize-none outline-none text-slate-200 text-base leading-relaxed custom-scrollbar placeholder:text-slate-600"
                disabled={isSubmitting}
              />
              
              {/* AI Processing Overlay */}
              <AnimatePresence>
                {isSubmitting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <div className="relative">
                      <motion.div 
                        className="absolute inset-0 border-2 border-teal-500 rounded-full"
                        animate={{ scale: [1, 1.5, 2], opacity: [1, 0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <Cpu className="w-8 h-8 text-teal-400 relative z-10" />
                    </div>
                    <p className="mt-4 text-xs font-mono text-teal-400 tracking-widest uppercase animate-pulse">
                      {language === 'es' ? 'Analizando Red Neuronal...' : 'Analyzing Neural Network...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Submit Button */}
            <div className="flex-none pt-2">
              <button
                onClick={handleTranscriptionSubmit}
                disabled={isSubmitting || !attempt.trim()}
                className="w-full relative overflow-hidden flex items-center justify-center gap-2 bg-teal-600/20 border border-teal-500/50 disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-teal-500/30 text-teal-300 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.1)] disabled:shadow-none"
              >
                {!isSubmitting && (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {language === 'es' ? 'Ejecutar Análisis' : 'Execute Analysis'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* TRANSCRIPTION FEEDBACK MODE */}
        {mode === 'transcription-feedback' && feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full space-y-4"
          >
            <div className="flex-none bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(20,184,166,0.15)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.2)_0%,transparent_70%)]" />
              
              <div className="relative z-10 text-center">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300 drop-shadow-md mb-2">
                  {feedback.score}%
                </div>
                <div className="text-xs font-mono text-teal-400 tracking-widest uppercase">
                  {language === 'es' ? 'Precisión de Retención' : 'Retention Accuracy'}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-800/50 rounded-3xl p-5 border border-white/5 overflow-y-auto custom-scrollbar flex flex-col space-y-5">
              <div>
                <h3 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI Feedback
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feedback.feedback}
                </p>
              </div>

              {feedback.missedWords && feedback.missedWords.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">
                    {language === 'es' ? 'Datos Perdidos (Repasar)' : 'Data Loss (Review)'}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.missedWords.map((word, idx) => (
                      <span key={idx} className="bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-md text-xs font-medium border border-rose-500/20">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-none pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 py-4 rounded-2xl font-bold transition-transform active:scale-95"
              >
                <Home className="w-5 h-5" />
                {language === 'es' ? 'Volver al Sistema' : 'Return to System'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
