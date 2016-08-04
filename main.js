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
      mb.showWindow();
      mb.window.webContents.executeJavaScript(`$('.search').focus();`);
    }
  };
  globalShortcut.register('Ctrl+Shift+U', show);
  globalShortcut.register('Cmd+Shift+U', show);
  mb.window.webContents.on('did-finish-load', () => {
    loadUnicodeData.then(data => {
      mb.window.webContents.send('UNICODE_DATA', data);
    }, err => {
      mb.window.webContents.send('UNICODE_DATA.err', err);
    });
  });
});
