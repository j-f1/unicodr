if (process.argv[2] !== '--debug') process.env.NODE_ENV = 'production';

const {app, globalShortcut} = require('electron');

// const {"default": installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer');
// console.log(installExtension);
// installExtension(REACT_DEVELOPER_TOOLS)
//   .then((name) => console.log(`Added Extension:  ${name}`))
//   .catch((err) => console.log('An error occurred: ', err));

const loadUnicodeData = require('./loader.js');

const menubar = require('menubar');
var mb = menubar({
  dir: __dirname + '/ui',
  preloadWindow: true,
  width: 850,
  alwaysOnTop: true,
});
mb.on('ready', () => {
  let show = () => {
    if (mb.window.isVisible()) {
      mb.hideWindow();
    } else {
      mb.window.webContents.executeJavaScript(`$('.search').focus().val('').trigger('keydown')`);
      mb.showWindow();
    }
  };
  globalShortcut.register('Ctrl+Shift+U', show);
  globalShortcut.register('Cmd+Shift+U', show);
  if (process.env.NODE_ENV !== 'production') mb.window.webContents.openDevTools();
  mb.window.webContents.on('did-finish-load', () => {
    loadUnicodeData.then(data => {
      mb.window.webContents.send('UNICODE_DATA', data);
    }, err => {
      console.log(err);
      mb.window.webContents.send('UNICODE_DATA.err', require('util').inspect(err, { depth: null }));
    });
  });
});
