import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Loader2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Word } from '../types';

interface TextHighlighterProps {
  text: string;
  vocabulary: Word[];
  highlightCharIndex?: number;
}

export function TextHighlighter({ text, vocabulary, highlightCharIndex }: TextHighlighterProps) {
  const { language } = useStore();
  
  // State for modals/tooltips
  const [activeVocab, setActiveVocab] = useState<Word | null>(null);
  const [activeWord, setActiveWord] = useState<{ word: string, context: string, rect: DOMRect } | null>(null);
  
  // State for translation
  const [translation, setTranslation] = useState<{ translation: string, phonetics: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (highlightCharIndex !== undefined) {
      const el = document.getElementById('spoken-word');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightCharIndex]);

  // Play pronunciation using Web Speech API
  const playAudio = (wordText: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVocabClick = (vocab: Word, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveWord(null);
    setActiveVocab(vocab);
  };

  const handleWordClick = async (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVocab(null);
    
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setActiveWord({ word, context: text, rect });
    setTranslation(null);
    setIsTranslating(true);
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context: text, language })
      });
      const data = await res.json();
      setTranslation(data);
    } catch (err) {
      console.error(err);
      setTranslation({ translation: 'Error', phonetics: '' });
    } finally {
      setIsTranslating(false);
    }
  };

  // Close modals when clicking outside
  useEffect(() => {
    const closeModals = () => {
      setActiveVocab(null);
      setActiveWord(null);
    };
    window.addEventListener('click', closeModals);
    return () => window.removeEventListener('click', closeModals);
  }, []);

  // Parse text to identify vocabulary and normal words
  const renderText = () => {
    // 1. Find all vocabulary matches
    const matches: { start: number, end: number, vocab: Word }[] = [];
    
    vocabulary.forEach(vocab => {
      // Create a smart regex to find the expression (handles common conjugations and pronoun changes)
      const words = vocab.expression.split(' ');
      const regexParts = words.map(w => {
        const lower = w.toLowerCase();
        if (lower === 'your' || lower === 'someone' || lower === 'something' || lower === 'oneself') {
          return '(?:your|my|his|her|our|their|the|a|someone|something|oneself|himself|herself|myself|each\\\\s+other|one\\\\s+another|it|them|him|her)';
        }
        
        // Handle common irregular/regular verbs manually for best accuracy
        const verbMap: Record<string, string> = {
          'take': '(?:take|takes|took|taking|taken)',
          'grow': '(?:grow|grows|grew|growing|grown)',
          'find': '(?:find|finds|found|finding)',
          'stand': '(?:stand|stands|stood|standing)',
          'build': '(?:build|builds|built|building)',
          'look': '(?:look|looks|looked|looking)',
          'move': '(?:move|moves|moved|moving)',
          'learn': '(?:learn|learns|learned|learning|learnt)',
          'feet': '(?:feet|foot)',
          'come': '(?:come|comes|came|coming)',
          'get': '(?:get|gets|got|getting|gotten)',
          'go': '(?:go|goes|went|going|gone)',
          'make': '(?:make|makes|made|making)',
          'think': '(?:think|thinks|thought|thinking)',
          'see': '(?:see|sees|saw|seeing|seen)',
          'know': '(?:know|knows|knew|knowing|known)',
          'give': '(?:give|gives|gave|giving|given)',
          'say': '(?:say|says|said|saying)',
          'have': '(?:have|has|had|having)',
          'do': '(?:do|does|did|doing|done)',
          'put': '(?:put|puts|putting)',
          'set': '(?:set|sets|setting)',
          'catch': '(?:catch|catches|caught|catching)',
          'keep': '(?:keep|keeps|kept|keeping)',
          'break': '(?:break|breaks|broke|breaking|broken)',
          'bring': '(?:bring|brings|brought|bringing)',
          'talk': '(?:talk|talks|talked|talking)',
          'meet': '(?:meet|meets|met|meeting)'
        };

        if (verbMap[lower]) return verbMap[lower];

        // For other words, allow minor suffix changes like 's', 'ed', 'ing'
        if (lower.length <= 4) return lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,2}';
        return lower.substring(0, lower.length - 2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,4}';
      });
      // Allow up to two words between phrasal verb parts to handle separable verbs like "put it into practice"
      const regexStr = `\\b${regexParts.join('\\s+(?:[a-zA-Z-]+\\s+){0,2}')}\\b`;
      const regex = new RegExp(regexStr, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          vocab
        });
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Resolve overlaps (keep the longest or first)
    const filteredMatches: typeof matches = [];
    let lastEnd = 0;
    
    for (const match of matches) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    }
    
    const elements: React.ReactNode[] = [];
    let currentIdx = 0;
    let keyCounter = 0;
    
    // Helper to process non-vocab text into words and punctuation
    const processNormalText = (str: string, baseIdx: number) => {
      const wordRegex = /([a-zA-Z0-9'-]+)|([^a-zA-Z0-9'-]+)/g;
      const parts = [];
      let m;
      while ((m = wordRegex.exec(str)) !== null) {
        const startIdx = baseIdx + m.index;
        const endIdx = startIdx + m[0].length;
        const isSpoken = highlightCharIndex !== undefined && highlightCharIndex >= startIdx && highlightCharIndex < endIdx;

        if (m[1]) {
          // It's a word
          const word = m[1];
          parts.push(
            <span 
              key={`w-${keyCounter++}`}
              id={isSpoken ? "spoken-word" : undefined}
              onClick={(e) => handleWordClick(word, e)}
              className={cn(
                "cursor-pointer rounded px-0.5 transition-colors duration-150",
                isSpoken ? "bg-teal-500/50 text-white" : "hover:bg-slate-700/50 hover:text-teal-300"
              )}
            >
              {word}
            </span>
          );
        } else if (m[2]) {
          // It's punctuation/space
          parts.push(<span key={`s-${keyCounter++}`} id={isSpoken ? "spoken-word" : undefined} className={isSpoken ? "bg-teal-500/50 text-white rounded px-0.5" : ""}>{m[2]}</span>);
        }
      }
      return parts;
    };
    
    // Build the final array of elements
    for (const match of filteredMatches) {
      if (match.start > currentIdx) {
        elements.push(...processNormalText(text.substring(currentIdx, match.start), currentIdx));
      }
      
      const matchedText = text.substring(match.start, match.end);
      const isSpoken = highlightCharIndex !== undefined && highlightCharIndex >= match.start && highlightCharIndex < match.end;

      elements.push(
        <span
          key={`v-${keyCounter++}`}
          id={isSpoken ? "spoken-word" : undefined}
          onClick={(e) => handleVocabClick(match.vocab, e)}
          className={cn(
            "inline-block relative cursor-pointer font-bold group",
            isSpoken ? "text-white bg-teal-500/60 rounded px-1" : "text-teal-400"
          )}
        >
          <span className={cn("relative z-10", !isSpoken && "px-1 hover:text-teal-200 transition-colors")}>{matchedText}</span>
          {!isSpoken && <span className="absolute bottom-0 left-0 w-full h-1 bg-teal-500/40 group-hover:h-full group-hover:bg-teal-500/20 transition-all rounded" />}
        </span>
      );
      
      currentIdx = match.end;
    }
    
    if (currentIdx < text.length) {
      elements.push(...processNormalText(text.substring(currentIdx), currentIdx));
    }
    
    return elements;
  };

  return (
    <div className="relative">
      <div className="text-lg sm:text-xl leading-loose text-slate-200 font-medium text-center max-w-2xl mx-auto">
        {renderText()}
      </div>

      {/* Vocabulary Modal (Centered) */}
      <AnimatePresence>
        {activeVocab && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-50 bg-slate-800 border border-teal-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-teal-400">{activeVocab.expression}</h3>
                <p className="text-slate-300 font-medium mt-1">{activeVocab.meaning}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveVocab(null); }}
                className="text-slate-400 hover:text-white bg-slate-700/50 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 mt-2">
              <p className="text-slate-300 italic text-sm">"{activeVocab.microExample}"</p>
              <p className="text-slate-400 text-sm mt-1">{activeVocab.microExampleTranslation}</p>
            </div>
            
            <button
              onClick={() => playAudio(activeVocab.expression)}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600/20 hover:bg-teal-500/30 text-teal-300 font-semibold rounded-xl transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              {language === 'es' ? 'Escuchar' : 'Listen'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Word Tooltip (Floats near the word) */}
      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            // We use fixed positioning to avoid overflow clipping issues, but absolute works if parent isn't overflow-hidden.
            // Let's just center it at the bottom of the screen for mobile friendliness, or try to position near the word.
            // For simplicity and mobile friendliness, a fixed bottom sheet or a fixed floating tooltip at the bottom is often better,
            // but let's try a fixed position near the click.
            style={{
              position: 'fixed',
              top: activeWord.rect.bottom + 10,
              left: Math.max(10, Math.min(window.innerWidth - 200, activeWord.rect.left - 100 + (activeWord.rect.width / 2))),
            }}
            className="w-48 z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-3 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <div className="min-w-0">
                <span className="block font-bold text-white truncate max-w-[120px]">{activeWord.word}</span>
                {translation?.phonetics && (
                  <span className="block text-[11px] text-teal-300/80 font-mono mt-0.5 truncate max-w-[120px]">/{translation.phonetics}/</span>
                )}
              </div>
              <button
                onClick={() => playAudio(activeWord.word)}
                className="text-teal-400 hover:text-teal-300 p-1 bg-teal-900/30 rounded-full"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="min-h-[40px] flex items-center justify-center">
              {isTranslating ? (
                <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
              ) : translation ? (
                <div className="w-full text-center">
                  <div className="text-slate-200 font-medium text-sm">{translation.translation}</div>
                </div>
              ) : (
                <div className="text-red-400 text-sm">Error</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
