const fs = require('fs-extra');
const path = require('path');

const targetDir = 'public';

// Copy js9
if (fs.pathExistsSync(path.join(targetDir, 'js9'))) {
  fs.rmdirSync(path.join(targetDir, 'js9'), { recursive: true, force: true });
}
fs.copy(path.dirname(require.resolve('js9/package.json')), path.join(targetDir, 'js9'));
