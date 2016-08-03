var React = require('react');
var ReactDOM = require('react-dom');
var LRU = require('lru-cache');

window.VirtualScroll = class VirtualScroll extends React.Component {
  // PUBLIC API //
  reloadRow(i) {
    // Call this to reload row `i` (the next time the component renders it).
    this._cache.del(i);
  }
  reloadData() {
    // call this to reload all rows.
    this._cache.reset();
  }
  scrollTo(scrollPos) {
    this.setState({scrollPos});
  }
  // PRIVATE & REACT API //
  constructor(...args) {
    super(...args);
    this.state = {scrollPos: 0};
    this._onWheel = this._onWheel.bind(this);
    this._cache = LRU({
      max: 500,
      stale: true,
      maxAge: 500, // ms
    });
  }
  componentWillMount() {
    this._plum = setInterval(() => {
      this._cache.prune();
    }, 1000);
  }
  componentWillUnmount() {
    this._cache.reset();
    clearInterval(this._plum);
    this._plum = null;
  }

  _onWheel(event) {
    let newScroll = this.state.scrollPos + event.deltaY * this.props.acceleration;
    if (newScroll < 0) {
      newScroll = 0;
    }
    let max = ((this.props.rowHeight * this.props.count) - window.innerHeight);
    if (newScroll > max) {
      newScroll = max;
    }
    this.setState({scrollPos: newScroll});
  }

  _getComponent(i) {
    if (!this._cache.has(i)) {
      this._cache.set(i, this.props.renderer(i));
    }
    return this._cache.get(i);
  }
  _styleForRow(i) {
    return {
      width: '100%',
      position: 'absolute',
      transform: 'translateY('+ ((i * this.props.rowHeight - this.state.scrollPos) + this.props.topInset) +'px)'
    };
  }

  get _visibility() {
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
  get _mainStyle() {
    return {
      position: 'relative',
      width: '100%',
      height: '100%'
    };
  }
  get _visibleStyledRows() {
    let {startIdx, endIdx} = this._visibility;
    let rows = [];
    for (let i = startIdx; i <= endIdx; i++) {
      let row = this._getComponent(i);
      // jshint ignore:start
      rows.push(<div style={this._styleForRow(i)} key={i}>{row}</div>)
      // jshint ignore:end
    }
    return rows;
  }


  render() {
    // jshint ignore:start
    return (<div style={this._mainStyle} onWheel={this._onWheel}>{this._visibleStyledRows}</div>)
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
};
VirtualScroll.defaultProps = {
  acceleration: 0.35,
  // rowHeight: Error,
  // count: Error,
  topInset: 0,
  margin: 5,
  // renderer: Error,
};
