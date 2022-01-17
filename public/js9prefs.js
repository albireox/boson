var JS9Prefs = {
  globalOpts: {
    helperType: 'sock.io',
    helperPort: 2718,
    helperCGI: './cgi-bin/js9/js9Helper.cgi',
    debug: 1,
    loadProxy: false,
    workDir: './tmp',
    workDirQuota: 100,
    dataPath: '$HOME/Desktop:$HOME/Downloads:/data/gcam',
    analysisPlugins: './analysis-plugins',
    analysisWrappers: './analysis-wrappers',
    resize: true,
    fits2fits: 'always',
    image: { xdim: 2048, ydim: 2048, bin: 4 },
    table: { xdim: 2048, ydim: 2048, bin: 4 },
    alerts: false,
    waitType: 'mouse'
  },
  imageOpts: {
    colormap: 'grey',
    scale: 'linear'
  }
};
