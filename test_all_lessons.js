const fs = require('fs');

const fileContent = fs.readFileSync('src/data/lessons.ts', 'utf8');

// A very hacky way to extract the lessons array since it's TS
// Instead, let's just compile and import it or write a simple parser
