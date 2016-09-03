if (process.argv.indexOf('--debug') === -1) process.env.NODE_ENV = 'production';

const {Menu, app, globalShortcut} = require('electron');

let settings = require('electron-settings');
settings.configure({
  atomicSaving: true,
});
settings.defaults({
  gbl: {
    toggle: {
      ctrl: true,
      cmd: false,
    },
  },
});
let observers = [];

const SHORTCUTS = {
  gbl: {
    toggle: {
      ctrl: 'Ctrl+Shift+U',
      cmd: 'Cmd+Shift+U'
    }
  }
};
function initShortcuts() {
  let show = () => {
    if (mb.window.isVisible()) {
      mb.hideWindow();
    } else {
      mb.window.webContents.executeJavaScript(`$('.search').focus()[0].select()`);
      mb.showWindow();
    }
  };

  if (settings.getSync('gbl.toggle.ctrl')) {
    globalShortcut.register(SHORTCUTS.gbl.toggle.ctrl, show);
  }
  settings.observe('gbl.toggle.ctrl', ({newValue: val}) => {
    if (val) {
      globalShortcut.register(SHORTCUTS.gbl.toggle.ctrl, show);
    } else {
      globalShortcut.unregister(SHORTCUTS.gbl.toggle.ctrl);
    }
  });

  if (settings.getSync('gbl.toggle.cmd')) {
    globalShortcut.register(SHORTCUTS.gbl.toggle.cmd, show);
  }
  settings.observe('gbl.toggle.cmd', ({newValue: val}) => {
    if (val) {
      globalShortcut.register(SHORTCUTS.gbl.toggle.cmd, show);
    } else {
      globalShortcut.unregister(SHORTCUTS.gbl.toggle.cmd);
    }
  });
}

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

  initShortcuts();

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
