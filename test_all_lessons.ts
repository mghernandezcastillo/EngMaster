import { lessons } from './src/data/lessons.ts';
let missingCount = 0;
let totalCount = 0;

lessons.forEach(lesson => {
  lesson.vocabulary.forEach(vocab => {
    totalCount++;
    const words = vocab.expression.split(' ');
    const regexParts = words.map(w => {
      const lower = w.toLowerCase();
      if (lower === 'your' || lower === 'someone' || lower === 'something' || lower === 'oneself') {
        return '(?:your|my|his|her|our|their|the|a|someone|something|oneself|himself|herself|myself)';
      }
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
        'bring': '(?:bring|brings|brought|bringing)'
      };
      if (verbMap[lower]) return verbMap[lower];
      if (lower.length <= 4) return lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,2}';
      return lower.substring(0, lower.length - 2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-zA-Z]{0,4}';
    });
    const regexStr = '\\b' + regexParts.join('\\s+') + '\\b';
    const regex = new RegExp(regexStr, 'gi');
    if (!regex.test(lesson.text)) {
        console.log(`Missing in lesson ${lesson.id}: ${vocab.expression} (Regex: ${regexStr})`);
        missingCount++;
    }
  });
});
console.log(`Total missing: ${missingCount} out of ${totalCount}`);
