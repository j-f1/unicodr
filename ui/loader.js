const $ = require('jquery');
const UniChar = require('./unichar.js');

{
  let row = $('main .row');
  let cell = row.children();
  for (var i = 1; i < 5  ; i++) {
    cell.clone().appendTo(row);
  }
  for (var i = 1; i < 100; i++) {
    row.clone().appendTo($('main ul'));
  }
}

const throwOnFail = err => {
  if (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error(err);
    }
  }
};

module.exports = loadUnicodeData = new Promise(function(resolve, reject) {
  require('electron').ipcRenderer.once('UNICODE_DATA', (event, message) => {
    resolve(message.map(data => new UniChar(data)));
  }).once('UNICODE_DATA.err', (event, message) => {
    reject(message);
  });
});

loadUnicodeData.then(data => {
  window.UNICODE_DATA = data;
  $('.loader p').html('Creating&hellip;');
  setTimeout(() => {
    $('body').addClass('ready');
  }, 100);
  $('.loader').remove();
}, throwOnFail);
