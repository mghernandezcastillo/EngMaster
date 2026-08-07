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
    const matches = [];
    
    vocabulary.forEach(vocab => {
      const words = vocab.expression.split(' ');
      const regexParts = words.map(w => {
        if (w === 'your' || w === 'someone' || w === 'something') return '(?:your|my|his|her|our|their|the|a|someone|something)';
        
        // Handle common irregular verbs manually if needed, or just let them be if they don't match. 
        // take -> took, taken
        if (w === 'take') return '(?:take|takes|took|taking|taken)';
        if (w === 'grow') return '(?:grow|grows|grew|growing|grown)';
        if (w === 'find') return '(?:find|finds|found|finding)';
        if (w === 'stand') return '(?:stand|stands|stood|standing)';
        if (w === 'build') return '(?:build|builds|built|building)';
        if (w === 'look') return '(?:look|looks|looked|looking)';
        if (w === 'move') return '(?:move|moves|moved|moving)';
        if (w === 'learning') return '(?:learning|learn)';
        if (w === 'feet') return '(?:feet|foot)';

        if (w.length <= 4) return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,2}';
        return w.substring(0, w.length - 2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,4}';
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
    
    matches.sort((a, b) => a.start - b.start);
    
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
    
    for (const match of filteredMatches) {
      const matchedText = text.substring(match.start, match.end);
      elements.push(
        `<span vocab>${matchedText} (${match.vocab.expression})</span>`
      );
      currentIdx = match.end;
    }
    
    return elements;
  };

console.log(renderText());
