import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

export function Dashboard() {
  const navigate = useNavigate();
  const { progress, language } = useStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const lesson = lessons[currentIndex];
  const status = progress[lesson?.id];
  
  // All modules are now unlocked
  const isUnlocked = true;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(prev => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= lessons.length) nextIndex = lessons.length - 1;
      return nextIndex;
    });
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000 && currentIndex < lessons.length - 1) {
      paginate(1);
    } else if (swipe > 10000 && currentIndex > 0) {
      paginate(-1);
    }
  };

  if (!lesson) return null;

  return (
    <div className="flex flex-col h-full justify-center space-y-6 overflow-hidden">
      <div className="text-center space-y-1">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-medium mb-2"
        >
          <Cpu className="w-3 h-3" />
          {language === 'es' ? 'Motor de Retención Activo' : 'Retention Engine Active'}
        </motion.div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
          {language === 'es' ? 'Módulos de Fluidez' : 'Fluency Modules'}
        </h1>
      </div>

      <div className="relative flex-1 max-h-[60vh] flex items-center justify-center">
        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} onPointerDown={(e) => e.stopPropagation()} className="absolute left-1 md:left-2 z-[100] pointer-events-auto p-3 text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 bg-white/80 dark:bg-slate-900/80 rounded-full border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-lg transition-colors cursor-pointer active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < lessons.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); paginate(1); }} onPointerDown={(e) => e.stopPropagation()} className="absolute right-1 md:right-2 z-[100] pointer-events-auto p-3 text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 bg-white/80 dark:bg-slate-900/80 rounded-full border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-lg transition-colors cursor-pointer active:scale-95">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, scale: 0.9, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: direction > 0 ? -100 : 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="w-full max-w-[85%] h-full max-h-[400px] relative rounded-3xl p-1 bg-gradient-to-br from-teal-500/30 via-slate-800/50 to-emerald-500/30 shadow-2xl cursor-grab active:cursor-grabbing"
          >
            {/* Animated border line */}
            <motion.div 
              className="absolute inset-0 rounded-3xl border border-teal-500/30 pointer-events-none"
              animate={{ boxShadow: ['0 0 0px transparent', '0 0 15px rgba(20, 184, 166, 0.5)', '0 0 0px transparent'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="relative w-full h-full bg-white dark:bg-[#0f172a] rounded-[22px] overflow-hidden flex flex-col">
              <div className="h-1/2 relative overflow-hidden pointer-events-none">
                <img src={lesson.image} alt={lesson.title} className={cn("w-full h-full object-cover")} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold text-teal-400 uppercase tracking-widest border border-teal-500/20">
                  {language === 'es' ? 'Módulo' : 'Module'} {currentIndex + 1}
                </div>
              </div>
              
              <div className="flex-1 p-5 flex flex-col justify-between relative z-10 bg-[#0f172a]">
                <div>
                  <h3 className="text-lg font-bold leading-tight mb-1">{lesson.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{lesson.subtitle}</p>
                </div>
                
                <div className="mt-4">
                  <button
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && navigate(`/lesson/${lesson.id}/intro`)}
                    className={cn(
                      "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all relative overflow-hidden",
                      isUnlocked ? "bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 active:scale-95" : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    )}
                  >
                    {isUnlocked && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent pointer-events-none"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    
                    {status?.stage === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    {status?.stage === 'completed' 
                      ? (language === 'es' ? 'Repasar' : 'Review') 
                      : (language === 'es' ? 'Iniciar Módulo' : 'Start Module')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center flex-wrap gap-1.5 mt-2 px-4">
        {lessons.map((_, idx) => (
          <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", idx === currentIndex ? "w-6 bg-teal-500" : "w-1.5 bg-slate-700")} />
        ))}
      </div>
    </div>
  );
}
