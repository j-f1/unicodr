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

createScroller = ({data, wrapperSelector}) => {
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    if (i % 5 === 0) {
      rows.push([]);
    }
    rows[rows.length-1].push(data[i]);
  }
  var scroller = new IScroll(wrapperSelector, {
    mouseWheel: true,
    infiniteElements: wrapperSelector + ' .row',
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
  return scroller;
};
