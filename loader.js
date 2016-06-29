{
  let row = $('.row');
  let cell = row.children();
  for (var i = 1; i < 5  ; i++) {
    cell.clone().appendTo(row);
  }
  for (var i = 1; i < 100; i++) {
    row.clone().appendTo($('ul'));
  }
}

window.promisify = require('promisify-node');
window.python = promisify(require('python').shell);
window.path = require('path');
window.fs = promisify(require('fs'));

var loadUnicodeData = new Promise(function(resolve, reject) {
  let UNICODE_DATA = [];
  fs.readFile(path.join(__dirname, 'load.py'), 'utf-8').then(pythonCode => {
    $('.loader p').html('Building&hellip;');
    python(pythonCode).then(json => {
      json = json.replace(/^Command Start\n/, '');
      var data = JSON.parse(json);
      data.forEach(charInfo => {
        let char = new UniChar(charInfo);
        UNICODE_DATA.push(char);
      });
      resolve(UNICODE_DATA);
    });
  }, err => {
    reject(err);
  });
});

////////////////////////////////////////////////////////////////////////////////

loadUnicodeData.then(data => {
  window.UNICODE_DATA = data;
  var rows = [];
  for (var i = 0; i < UNICODE_DATA.length; i++) {
    if (i % 5 === 0) {
      rows.push([]);
    }
    rows[rows.length-1].push(UNICODE_DATA[i]);
  }
  $('.loader p').html('Creating&hellip;');
  window.scroller = new IScroll("#wrapper", {
    mouseWheel: true,
    infiniteElements: 'main .row',
    disableMouse: true,
    disablePointer: true,
    dataset: (start, count) => {
      setTimeout(() => {
        scroller.updateCache(start, rows.slice(start, count));
      });
    },
    dataFiller: (el, data) => {
      $(el).children().each((i, el) => {
        data[i].fillView(el);
      });
    },
    cacheSize: 10000
  });
  setTimeout(() => {
    $('body').addClass('ready');
  }, 100);
  $('.loader').remove();
}, err => {throw err;});
