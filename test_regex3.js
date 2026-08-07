const vocabulary = [
  { expression: 'put into practice' },
  { expression: 'talk over' },
  { expression: 'see through' },
  { expression: 'meet someone halfway' },
  { expression: 'learn the ropes' },
  { expression: 'a steep learning curve' }
];

const texts = [
  "practice is what helps us put it into practice with accuracy",
  "we should talk it over",
  "I will see it through",
  "meet each other halfway",
  "It took time to learn the ropes.", // Wait, lesson 7 missing 'learn the ropes'?
  "although the learning curve was steep"
];

vocabulary.forEach((vocab, i) => {
      const words = vocab.expression.split(' ');
      const regexParts = words.map(w => {
        const lower = w.toLowerCase();
        if (lower === 'your' || lower === 'someone' || lower === 'something' || lower === 'oneself') {
          return '(?:your|my|his|her|our|their|the|a|someone|something|oneself|himself|herself|myself|each\\s+other|one\\s+another|it|them|him|her)';
        }
        const verbMap = {
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
        if (lower.length <= 4) return lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,2}';
        return lower.substring(0, lower.length - 2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,4}';
      });
      // Allow up to 2 words between any two words of a phrasal verb/idiom, but wait...
      // Maybe only allow it if the expression is short?
      // Actually `\s+(?:[a-zA-Z-]+\s+){0,2}` is safe enough.
      const regexStr = '\\b' + regexParts.join('\\s+(?:[a-zA-Z-]+\\s+){0,2}') + '\\b';
      const regex = new RegExp(regexStr, 'gi');
      
      console.log(`\nTesting: ${vocab.expression}`);
      console.log(`Regex: ${regexStr}`);
      texts.forEach(text => {
        const matches = text.match(regex);
        if (matches) console.log(`Matched in "${text}": ${matches}`);
      });
});
