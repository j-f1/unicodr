var $ = require('jquery');
const {clipboard, remote} = require('electron');
module.exports = currentBrowserWindow = remote.getCurrentWindow();

// Fullscreen support (the rest is in main.js).
$('html').toggleClass('fullscreen', currentBrowserWindow.isFullScreen());

// Click to copy.
$('main').click('.char', (event) => {
  clipboard.writeText(event.target.innerHTML);
});
