const CACHE_PATH = require('path').join((require('electron').app || require('electron').remote.app).getPath('userData'), 'cache.dat');
const SHORTCUTS = {
  gbl: {
    toggle: {
      ctrl: 'Ctrl+Shift+U',
      cmd: 'Cmd+Shift+U'
    }
  }
};

module.exports = Object.freeze({CACHE_PATH, SHORTCUTS});
