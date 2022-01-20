const fs = require('fs-extra');
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

// Copy js9
fs.copy(path.dirname(require.resolve('js9/package.json')), path.join(targetDir, 'js9'));
