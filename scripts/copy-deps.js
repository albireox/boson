const fs = require('fs-extra');
const path = require('path');

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.js');

const targetDir = 'public';
const targetPath = path.join(targetDir, 'pdf.worker.js');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy file
fs.copyFileSync(pdfWorkerPath, targetPath);

// Copy js9
fs.copy(path.dirname(require.resolve('js9/package.json')), path.join(targetDir, 'js9'));
