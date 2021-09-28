var JS9Prefs = {
  globalOpts: {
    helperType: 'nodejs',
    helperPort: 2718,
    helperCGI: './cgi-bin/js9/js9Helper.cgi',
    debug: 0,
    loadProxy: true,
    workDir: './tmp',
    workDirQuota: 100,
    dataPath: '$HOME/Desktop:$HOME/Downloads',
    analysisPlugins: './analysis-plugins',
    analysisWrappers: './analysis-wrappers',
    resize: false,
    fits2fits: 'never'
  },
  imageOpts: {
    colormap: 'grey',
    scale: 'linear'
  },
  fits: {
    name: 'cfitsio'
  }
};
