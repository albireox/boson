const fs = require('fs');
const path = require('path');

const pdfjsDistPath = path.join(
  path.dirname(require.resolve('react-pdf/package.json')),
  'node_modules',
  'pdfjs-dist'
);
const pdfWorkerPath = path.join(pdfjsDistPath, 'legacy', 'build', 'pdf.worker.js');

const targetDir = 'public';
const targetPath = path.join(targetDir, 'pdf.worker.js');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy file
fs.copyFileSync(pdfWorkerPath, targetPath);
