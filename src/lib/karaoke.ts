export type KaraokeWord = {
  word: string;
  start: number;
  end: number;
  charIndex: number;
};

export type KaraokePayload = {
  audioUrl: string;
  words: KaraokeWord[];
};

type ElevenAlignment = {
  characters?: string[];
  character_start_times_seconds?: number[];
  character_end_times_seconds?: number[];
};

export function buildWordTimings(alignment: ElevenAlignment | null | undefined): KaraokeWord[] {
  if (!alignment?.characters?.length) return [];

  const characters = alignment.characters;
  const starts = alignment.character_start_times_seconds || [];
  const ends = alignment.character_end_times_seconds || [];
  const text = characters.join('');
  const words: KaraokeWord[] = [];
  const wordRegex = /\b[\w'-]+\b/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const charStart = match.index;
    const charEnd = match.index + match[0].length - 1;
    const start = starts[charStart];
    const end = ends[charEnd] ?? starts[charEnd];

    if (typeof start === 'number' && typeof end === 'number') {
      words.push({
        word: match[0],
        start,
        end,
        charIndex: charStart,
      });
    }
  }

  return words;
}
