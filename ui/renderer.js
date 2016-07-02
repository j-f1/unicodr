var $ = require('jquery');

module.exports = createScroller = ({data, wrapperSelector, rowSelector, loadData, renderData, cache=1000}) => {
  var scroller = new IScroll(wrapperSelector, {
    mouseWheel: true,
    infiniteElements: wrapperSelector + ' ' + rowSelector,
    disableMouse: true,
    disablePointer: true,
    dataset: (start, count) => {
      setImmediate(() => {
        scroller.updateCache(start, loadData(start, count).filter(x=>!!x));
      });
    },
    dataFiller: (el, char) => {
      if (el && char) {
        renderData(el, char);
      }
    },
    cacheSize: cache
  });
  return scroller;
};
