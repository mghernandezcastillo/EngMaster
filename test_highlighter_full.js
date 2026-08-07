const vocabulary = [
  { expression: 'grow into' },
  { expression: 'take on' },
  { expression: 'look back on' },
  { expression: 'build up' },
  { expression: 'stand out' },
  { expression: 'move forward' },
  { expression: 'find your feet' },
  { expression: 'a steep learning curve' }
];

const text = "When I first entered the workforce, I assumed that competence meant having all the answers. In reality, I had to grow into roles that demanded patience, judgment and the ability to communicate under pressure. I gradually took on responsibilities that were outside my comfort zone, and although the learning curve was steep, those experiences helped me build up transferable skills that still shape the way I work today.\n\nWhen I look back on that period, what stands out is not a single achievement but the sustained effort behind it. I learned that credibility comes from being consistent, admitting what you do not know and following through on what you promise. Once I began to find my feet, I also became more willing to ask for feedback and reflect on my underlying strengths. That self-awareness helped me stand out without pretending to be someone I was not.\n\nWhat I have come to realize is that professional growth is less about collecting impressive titles than about becoming more articulate, adaptable and useful to others. Every demanding experience can broaden your perspective, provided that you learn from it and move forward with a clearer sense of your long-term potential.";

const renderText = () => {
    // 1. Find all vocabulary matches
    const matches = [];
    
    vocabulary.forEach(vocab => {
      // Create a fuzzy regex to find the expression (handles conjugations and pronoun changes)
      const words = vocab.expression.split(' ');
      const regexParts = words.map(w => {
        if (w === 'your' || w === 'someone' || w === 'something') return '.*?';
        if (w.length <= 3 && !w.includes('-')) return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z-]*';
      });
      const regexStr = '\\b' + regexParts.join('\\s+') + '\\b';
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
    const filteredMatches = [];
    let lastEnd = 0;
    
    for (const match of matches) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    }
    
    const elements = [];
    let currentIdx = 0;
    let keyCounter = 0;
    
    // Helper to process non-vocab text into words and punctuation
    const processNormalText = (str) => {
      const wordRegex = /([a-zA-Z0-9'-]+)|([^a-zA-Z0-9'-]+)/g;
      const parts = [];
      let m;
      while ((m = wordRegex.exec(str)) !== null) {
        if (m[1]) {
          parts.push(`<span word>${m[1]}</span>`);
        } else if (m[2]) {
          parts.push(`<span>${m[2]}</span>`);
        }
      }
      return parts;
    };
    
    // Build the final array of elements
    for (const match of filteredMatches) {
      if (match.start > currentIdx) {
        elements.push(...processNormalText(text.substring(currentIdx, match.start)));
      }
      
      const matchedText = text.substring(match.start, match.end);
      elements.push(
        `<span vocab>${matchedText}</span>`
      );
      
      currentIdx = match.end;
    }
    
    if (currentIdx < text.length) {
      elements.push(...processNormalText(text.substring(currentIdx)));
    }
    
    return elements;
  };

console.log(renderText().filter(x => x.includes('<span vocab>')));
