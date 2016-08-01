// jshint -W033
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// const {"default": installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer');
// console.log(installExtension);
// installExtension(REACT_DEVELOPER_TOOLS)
//   .then((name) => console.log(`Added Extension:  ${name}`))
//   .catch((err) => console.log('An error occurred: ', err));

const loadUnicodeData = require('./loader.js')
var unicodeData = null,
    unicodeDataErr = null
loadUnicodeData.then(data => {
  unicodeData = data
}, err => {
  unicodeDataErr = err
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, titleBarStyle: 'hidden-inset', webPreferences: {
    scrollBounce: true
  }})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/ui/index.html`)

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.executeJavaScript(`$('html').addClass('fullscreen')`);
  }).on('leave-full-screen', () => {
    mainWindow.webContents.executeJavaScript(`$('html').removeClass('fullscreen')`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (unicodeData) {
      mainWindow.webContents.send('UNICODE_DATA', unicodeData)
    } else if (unicodeDataErr) {
      mainWindow.webContents.send('UNICODE_DATA.err', unicodeDataErr)
    } else {
      loadUnicodeData.then(data => {
        mainWindow.webContents.send('UNICODE_DATA', data)
      }, err => {
        mainWindow.webContents.send('UNICODE_DATA.err', err)
      })
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
