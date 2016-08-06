var React = require('react');
var ReactDOM = require('react-dom');
const {clipboard} = require('electron');
const nbsp = String.fromCharCode(0xA0);
var $ = require('jquery');

// ABC //

class GridComponent extends React.Component {
  _autoWidth() {
    return (window.innerWidth / this.props.cols) - 10;
  }
  _autoHeight({index}) {
    // index: row index
    if (!index) {
      return this.props.headerHeight;
    }
    return window.innerWidth / this.props.cols;
  }
  get _height() {
    return parseInt(getComputedStyle(document.getElementById(this.props.containerId)).height);
  }
  get _width() {
    return parseInt(getComputedStyle(document.getElementById(this.props.containerId)).width);
  }
  _fromCache(index, gen) {
    if (!this.hasOwnProperty('cache')) this.cache = {};
    if (!this.cache[index]) {
      console.log("cache miss:", index);
      this.cache[index] = gen();
    }
    return this.cache[index];
  }
}

class CharComponent extends React.Component {
  get char() {
    return this.props.char;
  }
  render() {throw new Error('Rendering an ABC');}
}

// MAIN GRID //

class GridItem extends CharComponent {
  render() {
    // jshint ignore:start
    return (<span className="item">
        <span className="char" onClick={this.char.copy.bind(this.char)}>{this.char.char}</span>
        <span className="name">{this.char.name}</span>
        <span className="code">{this.char.prettyCode}</span>
        <span className="note">Click to copy</span>
      </span>)
    // jshint ignore:end
  }
}

class GridRow extends React.Component {
  render() {
    let start = this.props.row * this.props.cols;
    let chars = this.props.chars.slice(start, start + this.props.cols);
    // jshint ignore:start
    return (<div className="row">
      {chars.map(char => <GridItem key={char} char={char} />)}
    </div>)
    // jshint ignore:end
  }
}
GridRow.propTypes = {
  chars: React.PropTypes.arrayOf(React.PropTypes.instanceOf(require('./unichar.js'))).isRequired,
  cols: React.PropTypes.number,
  row: React.PropTypes.number.isRequired,
};
GridRow.defaultProps = {
  cols: 5,
};

class MainGrid extends GridComponent {
  render() {
    // jshint ignore:start
    return (<VirtualScroll
      rowHeight={window.innerWidth/5}
      count={Math.ceil(this.props.chars.length/this.props.cols)}
      topInset={2.5 * 16}
      renderer={i => <GridRow chars={this.props.chars} cols={this.props.cols} row={i} />}
      cache={Number.MAX_VALUE} // ♡ 4 ever!
    />)
    // jshint ignore:end
  }
}

// SEARCH RESULTS //

class SearchResult extends CharComponent {
  _inPlace(event) {
    // TODO
    event.preventDefault();
  }
  render() {
    // jshint ignore:start
    return (<div className={"item " + (this.props.className || "")} onMouseOver={this._mouseEnter.bind(this)}>
      <span className="char">{this.char.char || nbsp}</span>
      <span className="code">{this.char.prettyCode}</span>
      <span className="name">{this.char.name}</span>
      { /*<button className="btn btn-sm in-place" onClick={this._inPlace.bind(this)}><span /></button>*/ }
      <button className="btn btn-sm" onClick={e => {
        debugger;
        this.char.copy();
        e.preventDefault();
      }.bind(this)}>Copy</button>
    </div>)
    // jshint ignore:end
  }
  _mouseEnter() {
    this.props.parent.selectRow(this.props.index);
  }
}

class SearchResults extends GridComponent {
  constructor(...args) {
    super(...args);
    this.state = {selected: -1};
  }
  selectRow(selected) {
    this.scroller.reloadRow(this.state.selected);
    this.setState({selected});
    this.scroller.reloadRow(selected);
    this.forceUpdate();
  }
  activateSelected() {
    if (this.state.selected === -1) {
      this.props.exactMatch.copy();
    } else {
      this.props.chars[this.state.selected].copy();
    }
  }
  _getCell(i) {
    // jshint ignore:start
    return <SearchResult
      parent={this}
      index={i}
      className={i===this.state.selected && "selected"}
      char={this.props.chars[i]}
    />
    // jshint ignore:end
  }
  render() {
    // jshint ignore:start
    return (<div>
      {this.props.exactMatch && <div className="exact-match">
        <SearchResult
          parent={this}
          index={-1}
          char={this.props.exactMatch}
          className={this.state.selected === -1 && "selected"}
        />
        </div>}
      <VirtualScroll
        ref={c=>{
          // if(!c) debugger;
          this.scroller=c
        }.bind(this)}
        count={this.props.chars.length}
        rowHeight={window.innerWidth / 10}
        renderer={this._getCell.bind(this)}
        {...this.props}
      />
    </div>)
    // jshint ignore:end
  }
  componentWillMount() {
    $('body').on('keydown', this._keyDown.bind(this));
  }
  componentWillUnmount() {
    $('body').off('keydown', this._keyDown.bind(this));
  }
  _keyDown({which}) {
    let selected = this.state.selected;
    if (which === 38) { // up
      selected--;
    } else if (which === 40) { // down
      selected++;
    }
    if (which === 38 || which == 40) {
      if (selected <= -1) {
        selected = -1;
      }
      if (selected >= this.props.chars.length) {
        selected = this.props.chars.length - 1;
      }
      this.scroller.scrollTo(this._calculateScrollPos(selected));
      this.selectRow(selected);
      event.preventDefault();
    }
  }
  _calculateScrollPos(selected) {
    let pos = selected * this.scroller.props.rowHeight;
    pos -= (window.innerHeight - this.scroller.props.rowHeight) / 2;
    if (pos < 0) {
      pos = 0;
    }
    return pos;
  }
}

window.SearchResults = SearchResults;
window.MainGrid = MainGrid;

window.SearchResult = SearchResult;
