var $ = require('jquery');

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

window.promisify = require('promisify-node');
window.python = promisify(require('python').shell);
window.path = require('path');
window.fs = promisify(require('fs'));

module.exports = loadUnicodeData = new Promise(function(resolve, reject) {
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
  $('.loader p').html('Creating&hellip;');
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    if (i % 5 === 0) {
      rows.push([]);
    }
    rows[rows.length-1].push(data[i]);
  }
  window.scroller = createScroller({data, wrapperSelector:'main', rowSelector: '.row',
  loadData:(start, count) => rows.slice(start, count),
  renderData: (el, data) => {
    $(el).children().each((i, el) => {
      data[i].fillView(el);
    });
  } });
  setTimeout(() => {
    $('body').addClass('ready');
  }, 100);
  $('.loader').remove();
}, err => {throw err;});
