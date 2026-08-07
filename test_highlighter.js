const vocab = [
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

const matches = [];

vocab.forEach(v => {
  const words = v.expression.split(' ');
  const regexParts = words.map(w => {
    if (w === 'your' || w === 'someone' || w === 'something') return '.*?';
    if (w.length <= 3 && !w.includes('-')) return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z-]*';
  });
  const regexStr = '\\b' + regexParts.join('\\s+') + '\\b';
  console.log(`Regex for "${v.expression}": ${regexStr}`);
  const regex = new RegExp(regexStr, 'gi');
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      vocab: v,
      matchedText: match[0]
    });
  }
});

console.log(matches);
