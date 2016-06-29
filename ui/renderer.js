var $ = require('jquery');

module.exports = createScroller = ({data, wrapperSelector, rowSelector, loadData, renderData}) => {
  var scroller = new IScroll(wrapperSelector, {
    mouseWheel: true,
    infiniteElements: wrapperSelector + ' ' + rowSelector,
    disableMouse: true,
    disablePointer: true,
    dataset: loadData,
    dataFiller: renderData,
    cacheSize: 10000
  });
  return scroller;
};
