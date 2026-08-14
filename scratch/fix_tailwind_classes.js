import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replacements
  content = content.replaceAll("aspect-16/9", "aspect-video");
  content = content.replaceAll("z-[80]", "z-80");
  content = content.replaceAll("break-words", "wrap-break-word");
  content = content.replaceAll("p-[1px]", "p-px");
  content = content.replaceAll("aspect-[4/3]", "aspect-4/3");
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir('app', processFile);
walkDir('components', processFile);
