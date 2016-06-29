var $ = require('jquery');

{
  let row = $('.search-results .item');
  for (var i = 1; i < 100; i++) {
    row.clone().appendTo($('.search-results ul'));
  }
}

window.loadUnicodeData.then(data => {
  window.searchScroller = createScroller({data, wrapperSelector:'.search-results', rowSelector:'.item', loadData:(start, count) => {
    setTimeout(() => scroller.updateCache(start, data.slice(start, count)));
  }, renderData: (el, data) => data.fillView(el)});
});

$('.search').on('change', (e) => {
  var val = e.target.value.toLowerCase();
  var filtered = UNICODE_DATA.slice().filter(char => char.matches(val));
  console.log(filtered.map(item => item.toString()));
});
