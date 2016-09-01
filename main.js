if (process.argv[2] !== '--debug') process.env.NODE_ENV = 'production';

const {Menu, app, globalShortcut} = require('electron');

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
  mb.window.setResizable(false);
  mb.window.setMaximizable(false);
  let show = () => {
    if (mb.window.isVisible()) {
      mb.hideWindow();
    } else {
      mb.window.webContents.executeJavaScript(`$('.search').focus()[0].select()`);
      mb.showWindow();
    }
  };
  const viewMenu = process.NODE_ENV === 'production' ? undefined : {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
    ]
  };

  const menu = Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        {
          role: 'quit'
        },
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
  ].concat(viewMenu));
  Menu.setApplicationMenu(menu);
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
