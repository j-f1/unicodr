var React = require('react');
var ReactDOM = require('react-dom');
const {clipboard} = require('electron');
const nbsp = String.fromCharCode(0xA0);
var {Grid, VirtualScroll} = require('react-virtualized');

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
    return (<tr className="item">
      <td className="char">{this.char.char || nbsp}</td>
      <td className="code">{this.char.prettyCode}</td>
      <td className="name">{this.char.name}</td>
      <td><button className="btn" onClick={this.char.copy}>Copy</button></td>
    </tr>)
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
      width={this._width}
      height={this._height}
      rowHeight={this._autoHeight.bind(this)}
      rowRenderer={this._getCell.bind(this)}
      rowCount={this.props.chars.length}
      _updater={{x:window.innerWidth, y:window.innerHeight}}
    />)
    // jshint ignore:end
  }
}

window.SearchResults = SearchResults;
window.MainGrid = MainGrid;
