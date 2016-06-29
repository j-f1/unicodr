var $ = require('jquery');

module.exports = createScroller = ({data, wrapperSelector, rowSelector, loadData, renderData}) => {
  var scroller = new IScroll(wrapperSelector, {
    mouseWheel: true,
    infiniteElements: wrapperSelector + ' ' + rowSelector,
    disableMouse: true,
    disablePointer: true,
    dataset: (start, count) => {
      setTimeout(() => {
        scroller.updateCache(start, loadData(start, count).filter(x=>!!x));
      });
    },
    dataFiller: (el, char) => {
      if (el && char) {
        renderData(el, char);
      }
    },
    cacheSize: 10000
  });
  return scroller;
};
