import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Moon, Sun, Home, BookOpen, Brain, Languages } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { darkMode, toggleDarkMode, language, setLanguage } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col overflow-hidden relative">
      
      {/* AI Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 dark:opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(20, 184, 166, 0.1), transparent, rgba(16, 185, 129, 0.1), transparent)'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0f1a_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0f1a_100%)]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-50 w-full backdrop-blur-xl bg-white/40 dark:bg-[#050b14]/60 border-b border-teal-500/10 dark:border-teal-500/20 flex-none shadow-[0_4px_30px_rgba(20,184,166,0.1)]">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-teal-900/40 border border-teal-500/40 overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border-t-2 border-r-2 border-transparent border-t-teal-400 rounded-full opacity-70"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-b-2 border-l-2 border-transparent border-b-emerald-400 rounded-full opacity-50"
              />
            </div>
            <div className="flex flex-col items-start leading-none ml-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-teal-500/80 uppercase">Neural Sync</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-emerald-400 tracking-wide font-bold uppercase text-base">EngMaster</span>
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/80 border border-slate-300/50 dark:border-teal-500/20 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-teal-400"
            >
              <Languages className="w-3 h-3" />
              {language.toUpperCase()}
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-transparent hover:border-teal-500/30 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-teal-400"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col h-full overflow-hidden p-4 pb-20"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-[#0a0f1a]/70 border-t border-white/10 dark:border-white/5 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button onClick={() => navigate('/')} className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", location.pathname === '/' ? "text-teal-500" : "text-slate-500")}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/')} className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", location.pathname !== '/' ? "text-teal-500" : "text-slate-500")}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Learn</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
