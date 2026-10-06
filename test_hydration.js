const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check selectors in main.js
const js = fs.readFileSync('main.js', 'utf8');

const qsMatches = [...js.matchAll(/querySelector\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
console.log("Total querySelector checks:", qsMatches.length);

const missingSelectors = [];
qsMatches.forEach(sel => {
  // basic check
  if (sel.startsWith('#')) {
    const id = sel.slice(1);
    if (!html.includes(`id="${id}"`)) missingSelectors.push(sel);
  } else if (sel.startsWith('.')) {
    const cls = sel.slice(1).split(' ')[0].split(':')[0];
    if (!html.includes(`class="`) || !html.includes(cls)) missingSelectors.push(sel);
  }
});
console.log("Potentially missing selectors:", missingSelectors);
