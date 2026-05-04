const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

const replacements = [
  // Backgrounds
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-[#111827]' },
  { regex: /(?<!dark:)bg-slate-50(?!0)/g, replacement: 'bg-slate-50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-100/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-slate-900/g, replacement: 'bg-slate-900 dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-\[\#F8FAFC\]/g, replacement: 'bg-[#F8FAFC] dark:bg-[#0B1121]' },
  
  // Text
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-100' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  
  // Borders
  { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700/50' },
  { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-50(?!0)/g, replacement: 'border-slate-50 dark:border-slate-800/50' },

  // Hovers
  { regex: /(?<!dark:)hover:bg-slate-50(?!0)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-800/80' },
  { regex: /(?<!dark:)hover:bg-slate-100/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  { regex: /(?<!dark:)hover:text-slate-900/g, replacement: 'hover:text-slate-900 dark:hover:text-white' },
  { regex: /(?<!dark:)hover:text-slate-600/g, replacement: 'hover:text-slate-600 dark:hover:text-slate-300' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Modified: ${fullPath}`);
      }
    }
  }
}

console.log('Starting dark mode injection...');
processDirectory(srcDir);
console.log('Finished dark mode injection.');
