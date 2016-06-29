var $ = require('jquery');

{
  let row = $('.search-results .item');
  for (var i = 1; i < 10; i++) {
    row.clone().appendTo($('.search-results ul'));
  }
}

var _filtered = [];

window.loadUnicodeData.then(data => {
  window.searchScroller = createScroller({data, wrapperSelector:'.search-results', rowSelector:'.item',
  loadData: (start, count) => _filtered.slice(start, count),
  renderData: (el, char) => char.fillView(el) });
  setTimeout(() => {
    $('.search-results').hide();
  }, 10);
});

$('.search').on('change', (e) => {
  var val = e.target.value.toLowerCase();
  if (val.length) {
    $('main').fadeOut();
    $('.search-results').fadeIn();
    _filtered = UNICODE_DATA.slice().filter(char => char.matches(val));
    console.log(_filtered.map(item => item.toString()));
  } else {
    $('main').fadeIn();
    $('.search-results').fadeOut();
  }
});
