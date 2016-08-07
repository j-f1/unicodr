var React = require('react');
var ReactDOM = require('react-dom');
var LRU = require('lru-cache');

let S = {
  cache: Symbol('cache'),
  onWheel: Symbol('on wheel'),
  plum: Symbol('plum'),
  getComponent: Symbol('get component'),
  styleForRow: Symbol('style for row'),
  visibility: Symbol('visibility'),
  mainStyle: Symbol('main style'),
  visibleStyledRows: Symbol('visible styled rows'),
};

window.VirtualScroll = class VirtualScroll extends React.Component {
  // PUBLIC API //
  reloadRow(i) {
    // Call this to reload row `i` (the next time the component renders it).
    this[S.cache].del(i);
  }
  reloadData() {
    // call this to reload all rows.
    this[S.cache].reset();
  }
  scrollTo(scrollPos) {
    this.setState({scrollPos});
  }
  scrollToRow(row) {
    let pos = row * this.props.rowHeight;
    let max = (this.props.count * this.props.rowHeight) - window.innerHeight;
    pos -= (window.innerHeight - this.props.rowHeight) / 2;
    if (pos < 0) {
      pos = 0;
    } else if (pos > max) {
      pos = max;
    }
    this.scrollTo(pos);
  }
  // PRIVATE & REACT API //
  constructor(...args) {
    super(...args);
    this.state = {scrollPos: 0};
    this[S.onWheel] = this[S.onWheel].bind(this);
  }
  componentWillMount() {
    this[S.plum] = setInterval(() => {
      this[S.cache].prune();
    }, 1000);
    this[S.cache] = LRU({
      max: 500,
      stale: true,
      maxAge: this.props.cache, // ms
    });
  }
  componentWillUnmount() {
    this[S.cache].reset();
    clearInterval(this[S.plum]);
    this[S.plum] = null;
  }

  [S.onWheel](event) {
    let newScroll = this.state.scrollPos + event.deltaY * this.props.acceleration;
    if (newScroll < 0) {
      newScroll = 0;
    }
    let max = ((this.props.rowHeight * this.props.count) - window.innerHeight) + this.props.topInset;
    if (newScroll > max) {
      newScroll = max;
    }
    this.setState({scrollPos: newScroll});
  }

  [S.getComponent](i) {
    if (!this[S.cache].has(i)) {
      this[S.cache].set(i, this.props.renderer(i));
    }
    return this[S.cache].get(i);
  }
  [S.styleForRow](i) {
    return {
      width: '100%',
      position: 'absolute',
      transform: 'translateY('+ ((i * this.props.rowHeight - this.state.scrollPos) + this.props.topInset) +'px)'
    };
  }

  get [S.visibility]() {
    let startIdx = Math.floor(this.state.scrollPos / this.props.rowHeight) - this.props.margin;
    let count = Math.ceil(window.innerHeight / this.props.rowHeight) + (this.props.margin * 2);
    let endIdx = startIdx + count;
    if (startIdx < 0) {
      startIdx = 0;
    }
    if (endIdx >= this.props.count) {
      endIdx = this.props.count - 1;
    }
    return {startIdx, endIdx};
  }
  get [S.mainStyle]() {
    return {
      position: 'relative',
      width: '100%',
      height: '100%'
    };
  }
  get [S.visibleStyledRows]() {
    let {startIdx, endIdx} = this[S.visibility];
    let rows = [];
    for (let i = startIdx; i <= endIdx; i++) {
      let row = this[S.getComponent](i);
      // jshint ignore:start
      rows.push(<div style={this[S.styleForRow](i)} key={i}>{row}</div>)
      // jshint ignore:end
    }
    return rows;
  }


  render() {
    // jshint ignore:start
    return (<div style={this[S.mainStyle]} onWheel={this[S.onWheel]}>{this[S.visibleStyledRows]}</div>)
    // jshint ignore:end
  }
};

VirtualScroll.propTypes = {
  acceleration: React.PropTypes.number,
  rowHeight: React.PropTypes.number.isRequired,
  count: React.PropTypes.number.isRequired,
  topInset: React.PropTypes.number,
  margin: React.PropTypes.number,
  renderer: React.PropTypes.func.isRequired, // (index:React.PropTypes.number) => React.PropTypes.element
  cache: React.PropTypes.number,
};
VirtualScroll.defaultProps = {
  acceleration: 0.35,
  // rowHeight: Error,
  // count: Error,
  topInset: 0,
  margin: 5,
  // renderer: Error,
  cache: 5000,
};
