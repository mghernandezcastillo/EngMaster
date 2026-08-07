const text = "When I first entered the workforce, I assumed that competence meant having all the answers. In reality, I had to grow into roles that demanded patience, judgment and the ability to communicate under pressure. I gradually took on responsibilities that were outside my comfort zone, and although the learning curve was steep, those experiences helped me build up transferable skills that still shape the way I work today.\n\nWhen I look back on that period, what stands out is not a single achievement but the sustained effort behind it. I learned that credibility comes from being consistent, admitting what you do not know and following through on what you promise. Once I began to find my feet, I also became more willing to ask for feedback and reflect on my underlying strengths. That self-awareness helped me stand out without pretending to be someone I was not.\n\nWhat I have come to realize is that professional growth is less about collecting impressive titles than about becoming more articulate, adaptable and useful to others. Every demanding experience can broaden your perspective, provided that you learn from it and move forward with a clearer sense of your long-term potential.";

// Split by sentence boundaries, keeping the punctuation
const segmentText = (text) => {
  // Replace newlines with spaces to normalize or keep them?
  // Let's keep \n\n as boundaries too.
  const rawSegments = text.split(/(?<=[.?!])\s+(?=[A-Z])|\n\n/);
  
  // Combine short segments? Or just return as is?
  return rawSegments.map(s => s.trim()).filter(s => s.length > 0);
};

console.log(segmentText(text));
