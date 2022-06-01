const fs = require('fs-extra');
const path = require('path');

const targetDir = 'public';

// Copy js9
fs.copy(path.dirname(require.resolve('js9/package.json')), path.join(targetDir, 'js9'));
