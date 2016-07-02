const $ = require('jquery');

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
    resolve(message);
  }).once('UNICODE_DATA.err', (event, message) => {
    reject(message);
  });
});

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
}, throwOnFail);
