import { useState, useEffect, useRef, useCallback, MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { lessons } from '../data/lessons';
import { fragmentTranslations as localFragmentTranslations } from '../data/fragmentTranslations';
import { loadLocalKaraokeAsset } from '../data/karaokeAssets';
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
  Loader2,
  X,
  Repeat2,
  Cpu,
  Radio,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TextHighlighter } from '../components/TextHighlighter';
import { KaraokePayload, KaraokeWord } from '../lib/karaoke';

type FragmentTranslation = {
  translatedText: string;
  vocabularyHighlights: { expression: string; translation: string }[];
};

const KARAOKE_SYNC_OFFSET_MS = -40;

export function Memorize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, updateProgress } = useStore();

  const lesson = lessons.find(l => l.id === id);
  const paragraphRanges = lesson?.text
    ? [...lesson.text.matchAll(/[^.?!]+[.?!]+(?:\s+|$)|.+/g)]
        .map(match => {
          const raw = match[0];
          const leadingWhitespace = raw.match(/^\s*/)?.[0].length || 0;
          const trailingWhitespace = raw.match(/\s*$/)?.[0].length || 0;
          const start = (match.index || 0) + leadingWhitespace;
          const end = (match.index || 0) + raw.length - trailingWhitespace;
          return {
            text: lesson.text.slice(start, end),
            start,
            end,
          };
        })
        .filter(item => item.text.length > 0)
    : [];
  const paragraphs = paragraphRanges.map(item => item.text);
  const startsInReviewMode = searchParams.get('mode') === 'review' && paragraphs.length > 0;

  const [currentParagraph, setCurrentParagraph] = useState(startsInReviewMode ? paragraphs.length : 0);
  const [direction, setDirection] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingFragment, setIsPlayingFragment] = useState(false);
  const [highlightCharIndex, setHighlightCharIndex] = useState<number | undefined>(undefined);
  const [showSpanishFragment, setShowSpanishFragment] = useState(false);
  const [isTranslatingFragment, setIsTranslatingFragment] = useState(false);
  const [fragmentTranslations, setFragmentTranslations] = useState<Record<number, FragmentTranslation>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCumulativeReviewPlaying, setIsCumulativeReviewPlaying] = useState(false);
  const [hasCumulativeReviewFinished, setHasCumulativeReviewFinished] = useState(false);
  const [cumulativeHighlightCharIndex, setCumulativeHighlightCharIndex] = useState<number | undefined>(undefined);
  const [fullReviewKaraoke, setFullReviewKaraoke] = useState<KaraokePayload | null>(null);
  const [cumulativeKaraoke, setCumulativeKaraoke] = useState<KaraokePayload | null>(null);
  const [isLoadingFullKaraoke, setIsLoadingFullKaraoke] = useState(false);
  const [isLoadingCumulativeKaraoke, setIsLoadingCumulativeKaraoke] = useState(false);

  // Ref to prevent rapid-click navigation blocking
  const navigatingRef = useRef(false);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const cumulativeReviewScrollRef = useRef<HTMLDivElement>(null);
  const fullReviewAudioRef = useRef<HTMLAudioElement>(null);
  const cumulativeAudioRef = useRef<HTMLAudioElement>(null);
  const fullReviewRafRef = useRef<number | null>(null);
  const cumulativeRafRef = useRef<number | null>(null);
  const karaokeBoundaryReceivedRef = useRef(false);
  const karaokeFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const karaokeFallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const karaokeStartedAtRef = useRef(0);
  const karaokeHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cumulativeBoundaryReceivedRef = useRef(false);
  const cumulativeFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cumulativeFallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cumulativeStartedAtRef = useRef(0);
  const cumulativeHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearKaraokeFallback = () => {
    if (fullReviewRafRef.current) {
      cancelAnimationFrame(fullReviewRafRef.current);
      fullReviewRafRef.current = null;
    }

    if (karaokeHighlightTimeoutRef.current) {
      clearTimeout(karaokeHighlightTimeoutRef.current);
      karaokeHighlightTimeoutRef.current = null;
    }

    if (karaokeFallbackTimeoutRef.current) {
      clearTimeout(karaokeFallbackTimeoutRef.current);
      karaokeFallbackTimeoutRef.current = null;
    }

    if (karaokeFallbackIntervalRef.current) {
      clearInterval(karaokeFallbackIntervalRef.current);
      karaokeFallbackIntervalRef.current = null;
    }
  };

  const clearCumulativeFallback = () => {
    if (cumulativeRafRef.current) {
      cancelAnimationFrame(cumulativeRafRef.current);
      cumulativeRafRef.current = null;
    }

    if (cumulativeHighlightTimeoutRef.current) {
      clearTimeout(cumulativeHighlightTimeoutRef.current);
      cumulativeHighlightTimeoutRef.current = null;
    }

    if (cumulativeFallbackTimeoutRef.current) {
      clearTimeout(cumulativeFallbackTimeoutRef.current);
      cumulativeFallbackTimeoutRef.current = null;
    }

    if (cumulativeFallbackIntervalRef.current) {
      clearInterval(cumulativeFallbackIntervalRef.current);
      cumulativeFallbackIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearKaraokeFallback();
      clearCumulativeFallback();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Cancel fragment audio when paragraph changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlayingFragment(false);
    setIsPlaying(false);
    setIsCumulativeReviewPlaying(false);
    setHasCumulativeReviewFinished(false);
    setIsReviewModalOpen(false);
    setHighlightCharIndex(undefined);
    setCumulativeHighlightCharIndex(undefined);
    setShowSpanishFragment(false);
    setCumulativeKaraoke(null);
    clearKaraokeFallback();
    clearCumulativeFallback();
    navigatingRef.current = false;
  }, [currentParagraph]);

  useEffect(() => {
    if (highlightCharIndex === undefined || !reviewScrollRef.current) return;

    requestAnimationFrame(() => {
      const spokenWord = document.getElementById('spoken-word');
      const scrollContainer = reviewScrollRef.current;
      if (!spokenWord || !scrollContainer) return;

      const wordRect = spokenWord.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetTop = scrollContainer.scrollTop + wordRect.top - containerRect.top - (containerRect.height / 2) + (wordRect.height / 2);

      scrollContainer.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'auto',
      });
    });
  }, [highlightCharIndex]);

  useEffect(() => {
    if (cumulativeHighlightCharIndex === undefined || !cumulativeReviewScrollRef.current) return;

    requestAnimationFrame(() => {
      const spokenWord = document.getElementById('spoken-word');
      const scrollContainer = cumulativeReviewScrollRef.current;
      if (!spokenWord || !scrollContainer) return;

      const wordRect = spokenWord.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetTop = scrollContainer.scrollTop + wordRect.top - containerRect.top - (containerRect.height / 2) + (wordRect.height / 2);

      scrollContainer.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'auto',
      });
    });
  }, [cumulativeHighlightCharIndex]);

  if (!lesson) return <div>Lesson not found</div>;

  const isReviewMode = currentParagraph === paragraphs.length;
  const currentText = isReviewMode ? lesson.text : paragraphs[currentParagraph];
  const currentTranslation = fragmentTranslations[currentParagraph];
  const cumulativeParagraphCount = Math.min(currentParagraph + 1, paragraphs.length);
  const cumulativeEndCharIndex = paragraphRanges[Math.max(0, cumulativeParagraphCount - 1)]?.end ?? currentText.length;
  const cumulativeReviewText = lesson.text.slice(0, cumulativeEndCharIndex).trim();
  const cumulativeProgress = Math.round((cumulativeParagraphCount / paragraphs.length) * 100);

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderTranslatedFragment = (translation: FragmentTranslation) => {
    const highlights = translation.vocabularyHighlights
      .map(item => item.translation?.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (highlights.length === 0) {
      return translation.translatedText;
    }

    const regex = new RegExp(`(${highlights.map(escapeRegExp).join('|')})`, 'gi');
    return translation.translatedText.split(regex).map((part, index) => {
      const isHighlight = highlights.some(item => item.toLowerCase() === part.toLowerCase());
      return isHighlight ? (
        <span key={`${part}-${index}`} className="inline rounded-md bg-amber-400/20 px-1 font-bold text-amber-200 ring-1 ring-amber-300/25">
          {part}
        </span>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      );
    });
  };

  const buildVocabularyHighlights = (translatedText: string): FragmentTranslation['vocabularyHighlights'] => {
    return lesson.vocabulary
      .flatMap(item => {
        const candidates = [
          item.meaning,
          ...item.meaning.split(/[;/]/),
          item.microExampleTranslation,
        ]
          .map(value => value.replace(/\([^)]*\)/g, '').trim())
          .filter(value => value.length >= 4);

        const match = candidates.find(candidate => translatedText.toLowerCase().includes(candidate.toLowerCase()));
        return match ? [{ expression: item.expression, translation: match }] : [];
      });
  };

  const scheduleSyncedHighlight = (
    event: SpeechSynthesisEvent,
    startedAt: number,
    setHighlight: (value: number) => void,
    timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    const targetAt = startedAt + (event.elapsedTime * 1000) + KARAOKE_SYNC_OFFSET_MS;
    const delay = Math.max(0, targetAt - performance.now());

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      flushSync(() => setHighlight(event.charIndex));
      timeoutRef.current = null;
    }, delay);
  };

  const fetchKaraokePayload = async (text: string, localAssetKey?: string) => {
    if (localAssetKey) {
      const localAsset = await loadLocalKaraokeAsset(localAssetKey);
      if (localAsset) return localAsset;
    }

    const response = await fetch('/api/tts-karaoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS karaoke failed: ${response.status}`);
    }

    return await response.json() as KaraokePayload;
  };

  const findActiveKaraokeWord = (words: KaraokeWord[], currentTime: number) => {
    const active = words.find(word => currentTime >= word.start && currentTime < word.end);
    if (active) return active;

    for (let i = words.length - 1; i >= 0; i -= 1) {
      if (currentTime >= words[i].start) return words[i];
    }

    return undefined;
  };

  const runAudioKaraokeSync = (
    audio: HTMLAudioElement,
    words: KaraokeWord[],
    setHighlight: (value: number | undefined) => void,
    rafRef: MutableRefObject<number | null>,
    stopAt?: number,
    onStopAt?: () => void
  ) => {
    const tick = () => {
      if (typeof stopAt === 'number' && audio.currentTime >= stopAt) {
        audio.pause();
        audio.currentTime = stopAt;
        onStopAt?.();
        rafRef.current = null;
        return;
      }

      const activeWord = findActiveKaraokeWord(words, audio.currentTime);
      if (activeWord) {
        setHighlight(activeWord.charIndex);
      }

      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const toggleFragmentLanguage = async () => {
    if (isReviewMode) return;

    if (showSpanishFragment) {
      setShowSpanishFragment(false);
      return;
    }

    setShowSpanishFragment(true);
    if (fragmentTranslations[currentParagraph]) return;

    const localTranslation = localFragmentTranslations[lesson.id]?.[currentParagraph];
    if (localTranslation) {
      setFragmentTranslations(prev => ({
        ...prev,
        [currentParagraph]: {
          translatedText: localTranslation,
          vocabularyHighlights: buildVocabularyHighlights(localTranslation),
        },
      }));
      return;
    }

    setIsTranslatingFragment(true);
    try {
      const response = await fetch('/api/translate-fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          vocabulary: lesson.vocabulary,
        }),
      });
      const data = await response.json();
      setFragmentTranslations(prev => ({
        ...prev,
        [currentParagraph]: {
          translatedText: data.translatedText || currentText,
          vocabularyHighlights: Array.isArray(data.vocabularyHighlights) ? data.vocabularyHighlights : [],
        },
      }));
    } catch (error) {
      console.error(error);
      setFragmentTranslations(prev => ({
        ...prev,
        [currentParagraph]: {
          translatedText: language === 'es' ? 'No se pudo traducir este fragmento.' : 'This fragment could not be translated.',
          vocabularyHighlights: [],
        },
      }));
    } finally {
      setIsTranslatingFragment(false);
    }
  };

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

  const playBrowserKaraoke = () => {
    clearKaraokeFallback();
    window.speechSynthesis.cancel();
    karaokeBoundaryReceivedRef.current = false;
    const utterance = new SpeechSynthesisUtterance(lesson.text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;

    utterance.onboundary = (event) => {
      if (typeof event.charIndex === 'number') {
        karaokeBoundaryReceivedRef.current = true;
        clearKaraokeFallback();
        scheduleSyncedHighlight(event, karaokeStartedAtRef.current, setHighlightCharIndex, karaokeHighlightTimeoutRef);
      }
    };
    utterance.onend = () => {
      clearKaraokeFallback();
      setIsPlaying(false);
      setHighlightCharIndex(undefined);
    };
    utterance.onerror = () => {
      clearKaraokeFallback();
      setIsPlaying(false);
      setHighlightCharIndex(undefined);
    };

    setIsPlaying(true);
    setHighlightCharIndex(0);
    karaokeStartedAtRef.current = performance.now();
    window.speechSynthesis.speak(utterance);

    karaokeFallbackTimeoutRef.current = setTimeout(() => {
      if (karaokeBoundaryReceivedRef.current) return;

      const wordMatches = [...lesson.text.matchAll(/\b[\w'-]+\b/g)];
      if (wordMatches.length === 0) return;

      let wordIndex = 0;
      const estimatedMsPerWord = Math.max(260, 430 / utterance.rate);
      flushSync(() => setHighlightCharIndex(wordMatches[0].index ?? 0));

      karaokeFallbackIntervalRef.current = setInterval(() => {
        if (karaokeBoundaryReceivedRef.current) {
          clearKaraokeFallback();
          return;
        }

        wordIndex += 1;
        if (wordIndex >= wordMatches.length) {
          clearKaraokeFallback();
          return;
        }

        flushSync(() => setHighlightCharIndex(wordMatches[wordIndex].index ?? 0));
      }, estimatedMsPerWord);
    }, 800);
  };

  // Karaoke for full review
  const toggleKaraoke = async () => {
    if (isPlaying) {
      clearKaraokeFallback();
      fullReviewAudioRef.current?.pause();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setHighlightCharIndex(undefined);
    } else {
      try {
        clearKaraokeFallback();
        window.speechSynthesis.cancel();
        setIsLoadingFullKaraoke(true);
        const payload = fullReviewKaraoke || await fetchKaraokePayload(lesson.text, `${lesson.id}:full`);
        setFullReviewKaraoke(payload);
        setHighlightCharIndex(0);
        setIsPlaying(true);

        requestAnimationFrame(async () => {
          const audio = fullReviewAudioRef.current;
          if (!audio) return;
          audio.currentTime = 0;
          await audio.play();
          runAudioKaraokeSync(audio, payload.words, setHighlightCharIndex, fullReviewRafRef);
        });
      } catch (error) {
        console.error(error);
        playBrowserKaraoke();
      } finally {
        setIsLoadingFullKaraoke(false);
      }
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

  const playBrowserCumulativeReview = () => {
    if (!cumulativeReviewText) return;

    clearKaraokeFallback();
    clearCumulativeFallback();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPlayingFragment(false);
    setHighlightCharIndex(undefined);
    setCumulativeHighlightCharIndex(undefined);
    setHasCumulativeReviewFinished(false);
    cumulativeBoundaryReceivedRef.current = false;

    const utterance = new SpeechSynthesisUtterance(cumulativeReviewText);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.onboundary = (event) => {
      if (typeof event.charIndex === 'number') {
        cumulativeBoundaryReceivedRef.current = true;
        clearCumulativeFallback();
        scheduleSyncedHighlight(event, cumulativeStartedAtRef.current, setCumulativeHighlightCharIndex, cumulativeHighlightTimeoutRef);
      }
    };
    utterance.onend = () => {
      clearCumulativeFallback();
      setIsCumulativeReviewPlaying(false);
      setHasCumulativeReviewFinished(true);
    };
    utterance.onerror = () => {
      clearCumulativeFallback();
      setIsCumulativeReviewPlaying(false);
      setHasCumulativeReviewFinished(true);
    };

    setIsCumulativeReviewPlaying(true);
    setCumulativeHighlightCharIndex(0);
    cumulativeStartedAtRef.current = performance.now();
    window.speechSynthesis.speak(utterance);

    cumulativeFallbackTimeoutRef.current = setTimeout(() => {
      if (cumulativeBoundaryReceivedRef.current) return;

      const wordMatches = [...cumulativeReviewText.matchAll(/\b[\w'-]+\b/g)];
      if (wordMatches.length === 0) return;

      let wordIndex = 0;
      const estimatedMsPerWord = Math.max(260, 430 / utterance.rate);
      flushSync(() => setCumulativeHighlightCharIndex(wordMatches[0].index ?? 0));

      cumulativeFallbackIntervalRef.current = setInterval(() => {
        if (cumulativeBoundaryReceivedRef.current) {
          clearCumulativeFallback();
          return;
        }

        wordIndex += 1;
        if (wordIndex >= wordMatches.length) {
          clearCumulativeFallback();
          return;
        }

        flushSync(() => setCumulativeHighlightCharIndex(wordMatches[wordIndex].index ?? 0));
      }, estimatedMsPerWord);
    }, 800);
  };

  const playCumulativeReview = async () => {
    if (!cumulativeReviewText) return;

    try {
      clearKaraokeFallback();
      clearCumulativeFallback();
      window.speechSynthesis.cancel();
      setIsLoadingCumulativeKaraoke(true);
      setIsPlaying(false);
      setIsPlayingFragment(false);
      setHighlightCharIndex(undefined);
      setCumulativeHighlightCharIndex(0);
      setHasCumulativeReviewFinished(false);

      let payload = cumulativeKaraoke;
      let stopAt: number | null = null;

      if (!payload) {
        const fullAsset = await loadLocalKaraokeAsset(`${lesson.id}:full`);
        if (fullAsset) {
          const words = fullAsset.words.filter(word => word.charIndex < cumulativeReviewText.length);
          const lastWord = words[words.length - 1];
          stopAt = lastWord?.end ?? null;
          payload = {
            audioUrl: fullAsset.audioUrl,
            words,
          };
        } else {
          payload = await fetchKaraokePayload(cumulativeReviewText, `${lesson.id}:prefix-${cumulativeParagraphCount}`);
        }
      }

      setCumulativeKaraoke(payload);
      setIsCumulativeReviewPlaying(true);

      requestAnimationFrame(async () => {
        const audio = cumulativeAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        await audio.play();
        runAudioKaraokeSync(audio, payload.words, setCumulativeHighlightCharIndex, cumulativeRafRef, stopAt ?? undefined, () => {
          setIsCumulativeReviewPlaying(false);
          setHasCumulativeReviewFinished(true);
        });
      });
    } catch (error) {
      console.error(error);
      playBrowserCumulativeReview();
    } finally {
      setIsLoadingCumulativeKaraoke(false);
    }
  };

  const openCumulativeReview = () => {
    setIsReviewModalOpen(true);
    window.setTimeout(playCumulativeReview, 120);
  };

  const closeCumulativeReview = () => {
    clearCumulativeFallback();
    cumulativeAudioRef.current?.pause();
    window.speechSynthesis.cancel();
    setIsCumulativeReviewPlaying(false);
    setHasCumulativeReviewFinished(false);
    setCumulativeHighlightCharIndex(undefined);
    setIsReviewModalOpen(false);
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
            dragDirectionLock
            onDragEnd={handleDragEnd}
            style={{ touchAction: isReviewMode ? 'auto' : 'pan-y' }}
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
                    disabled={isLoadingFullKaraoke}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border shadow-md active:scale-95 disabled:opacity-70",
                      isPlaying
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                    )}
                  >
                    {isLoadingFullKaraoke ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPlaying ? <Square className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                    {isLoadingFullKaraoke
                      ? (language === 'es' ? 'Preparando' : 'Preparing')
                      : isPlaying
                      ? (language === 'es' ? 'Detener' : 'Stop')
                      : (language === 'es' ? 'Escuchar Karaoke' : 'Listen Karaoke')}
                  </button>
                </div>
                <div className="mb-5 text-center">
                  <h4 className="text-xl font-bold text-teal-300">{lesson.title}</h4>
                  {lesson.subtitle && <p className="text-sm text-teal-500/80 mt-1">{lesson.subtitle}</p>}
                </div>
                <div className="pb-10">
                  {fullReviewKaraoke && (
                    <audio
                      ref={fullReviewAudioRef}
                      src={fullReviewKaraoke.audioUrl}
                      onEnded={() => {
                        clearKaraokeFallback();
                        setIsPlaying(false);
                        setHighlightCharIndex(undefined);
                      }}
                    />
                  )}
                  <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} highlightCharIndex={highlightCharIndex} />
                </div>
              </div>
            ) : !isHidden ? (
              /* ── NORMAL TEXT FRAGMENT ── */
              <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-5 touch-pan-y">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                  <span className="text-[10px] font-mono text-teal-400/80 uppercase tracking-widest">
                    {language === 'es' ? 'FRAGMENTO' : 'FRAGMENT'} {currentParagraph + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFragmentLanguage(); }}
                      onPointerDown={(e) => e.stopPropagation()}
                      disabled={isTranslatingFragment}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 pointer-events-auto disabled:opacity-60",
                        showSpanishFragment
                          ? "bg-amber-500/15 text-amber-200 border-amber-400/30 hover:bg-amber-500/25"
                          : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700"
                      )}
                    >
                      {isTranslatingFragment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSpanishFragment ? '🇺🇸' : '🇪🇸'}</span>
                    </button>

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
                </div>
                <div className="my-auto py-4">
                  {showSpanishFragment ? (
                    <div className="text-lg sm:text-xl leading-loose text-slate-200 font-medium text-center max-w-2xl mx-auto">
                      {isTranslatingFragment && !currentTranslation ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-200">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {language === 'es' ? 'Traduciendo fragmento...' : 'Translating fragment...'}
                        </div>
                      ) : currentTranslation ? (
                        renderTranslatedFragment(currentTranslation)
                      ) : (
                        currentText
                      )}
                    </div>
                  ) : (
                    <TextHighlighter text={currentText} vocabulary={lesson.vocabulary} />
                  )}
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

      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeCumulativeReview}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
            >
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.55, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute left-1/2 top-16 h-52 w-52 -translate-x-1/2 rounded-full border border-dashed border-cyan-300/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute left-1/2 top-24 h-32 w-32 -translate-x-1/2 rounded-full border border-teal-300/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="relative z-10 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
                      <motion.div
                        className="absolute inset-0 rounded-2xl border border-cyan-300/30"
                        animate={{ boxShadow: ['0 0 0px transparent', '0 0 18px rgba(34,211,238,0.45)', '0 0 0px transparent'] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                      <Cpu className="relative z-10 h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300/80">
                        {language === 'es' ? 'Repaso acumulado' : 'Cumulative review'}
                      </p>
                      <h3 className="text-lg font-black text-white">
                        {cumulativeProgress}% {language === 'es' ? 'de la lectura' : 'of the reading'}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={closeCumulativeReview}
                    className="rounded-full border border-white/10 bg-slate-800/80 p-2 text-slate-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <span>{language === 'es' ? 'Fragmentos incluidos' : 'Included fragments'}</span>
                    <span className="text-cyan-300">{cumulativeParagraphCount}/{paragraphs.length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cumulativeProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400"
                    />
                  </div>
                  <div
                    ref={cumulativeReviewScrollRef}
                    className="mt-4 max-h-56 overflow-y-auto custom-scrollbar rounded-xl bg-slate-950/35 p-3"
                  >
                    {cumulativeKaraoke && (
                      <audio
                        ref={cumulativeAudioRef}
                        src={cumulativeKaraoke.audioUrl}
                        onEnded={() => {
                          clearCumulativeFallback();
                          setIsCumulativeReviewPlaying(false);
                          setHasCumulativeReviewFinished(true);
                        }}
                      />
                    )}
                    <TextHighlighter
                      text={cumulativeReviewText}
                      vocabulary={lesson.vocabulary}
                      highlightCharIndex={cumulativeHighlightCharIndex}
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => {
                      if (isCumulativeReviewPlaying) {
                        clearCumulativeFallback();
                        cumulativeAudioRef.current?.pause();
                        window.speechSynthesis.cancel();
                        setIsCumulativeReviewPlaying(false);
                        setCumulativeHighlightCharIndex(undefined);
                        setHasCumulativeReviewFinished(true);
                      } else {
                        playCumulativeReview();
                      }
                    }}
                    className={cn(
                      "flex-1 rounded-2xl border py-3 text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2",
                      isCumulativeReviewPlaying
                        ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                        : "border-cyan-400/40 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25"
                    )}
                    disabled={isLoadingCumulativeKaraoke}
                  >
                    {isLoadingCumulativeKaraoke ? <Loader2 className="h-4 w-4 animate-spin" /> : isCumulativeReviewPlaying ? <Square className="h-4 w-4" fill="currentColor" /> : <Volume2 className="h-4 w-4" />}
                    {isLoadingCumulativeKaraoke
                      ? (language === 'es' ? 'Preparando' : 'Preparing')
                      : isCumulativeReviewPlaying
                      ? (language === 'es' ? 'Detener' : 'Stop')
                      : hasCumulativeReviewFinished
                        ? (language === 'es' ? 'Repetir audio' : 'Repeat audio')
                        : (language === 'es' ? 'Reproducir' : 'Play')}
                  </button>
                  <button
                    onClick={playCumulativeReview}
                    disabled={isCumulativeReviewPlaying || isLoadingCumulativeKaraoke}
                    className="rounded-2xl border border-white/10 bg-slate-800/80 px-4 text-slate-300 transition-all hover:bg-slate-700 disabled:opacity-50 active:scale-95"
                  >
                    <Repeat2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Cumulative memory review */}
        {!isReviewMode && (
          <button
            onClick={openCumulativeReview}
            className="p-3.5 rounded-2xl font-bold border transition-all active:scale-95 flex items-center justify-center shrink-0 bg-cyan-500/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.12)]"
          >
            <Radio className="w-5 h-5" />
          </button>
        )}

        {/* Forward / Proceed */}
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl font-bold bg-teal-600/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-xs"
        >
          {isReviewMode ? (
            <>{language === 'es' ? 'Evaluación' : 'Test'} <Check className="w-4 h-4" /></>
          ) : currentParagraph === paragraphs.length - 1 ? (
            <>{language === 'es' ? 'Lectura Karaoke' : 'Karaoke Reading'} <BookOpen className="w-4 h-4" /></>
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
