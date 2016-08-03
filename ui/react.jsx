var React = require('react');
var ReactDOM = require('react-dom');
const {clipboard} = require('electron');
const nbsp = String.fromCharCode(0xA0);

class CharComponent extends React.Component {
  get char() {
    return this.props.char;
  }
  render() {throw new Error('Rendering an ABC');}
}

class GridItem extends CharComponent {
  render() {
    // jshint ignore:start
    return (<span className="item">
        <span className="char" onClick={this.char.copy}>{this.char.char}</span>
        <span className="name">{this.char.name}</span>
        <span className="code">{this.char.prettyCode}</span>
        <span className="note">Click to copy</span>
      </span>)
    // jshint ignore:end
  }
}

class SearchResult extends CharComponent {
  render() {
    // jshint ignore:start
    return (<div className="item">
      <span className="char">{this.char.char || nbsp}</span>
      <span className="code">{this.char.prettyCode}</span>
      <span className="name">{this.char.name}</span>
      <button className="btn btn-sm" onClick={this.char.copy}>Copy</button>
    </div>)
    // jshint ignore:end
  }
}

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

class MainGrid extends GridComponent {
  _getCell({columnIndex, rowIndex}) {
    if (rowIndex === 0) {
      // jshint ignore:start
      return <div className="top" />;
      // jshint ignore:end
    }
    let index = (rowIndex * this.props.cols) + columnIndex;
    // jshint ignore:start
    return this._fromCache(index, () => <GridItem char={this.props.chars[index]} />)
    // jshint ignore:end
  }
  render() {
    // jshint ignore:start
    return <div />
    return (<Grid
      cellClassName="inline-block"
      columnCount={this.props.cols}
      rowCount={this.props.chars.length/this.props.cols}
      columnWidth={this._autoWidth.bind(this)}
      cellRenderer={this._getCell.bind(this)}
      height={this._height}
      rowHeight={this._autoHeight.bind(this)}
      width={this._width}
    />)
    // jshint ignore:end
  }
}

class SearchResults extends GridComponent {
  _getCell({index}) {
    // jshint ignore:start
    return this._fromCache(index, () => <SearchResult char={this.props.chars[index]} />);
    // jshint ignore:end
  }
  render() {
    // jshint ignore:start
    return (<VirtualScroll
      ref={c=>this.scroller=c}
      count={this.props.chars.length}
      rowHeight={window.innerWidth / 10}
      renderer={(i) => <SearchResult char={this.props.chars[i]} />}
      {...this.props}
    />)
    // jshint ignore:end
  }
}

window.SearchResults = SearchResults;
window.MainGrid = MainGrid;

window.SearchResult = SearchResult;
