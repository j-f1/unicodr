var React = require('react');
var ReactDOM = require('react-dom');
const {clipboard} = require('electron');
const nbsp = String.fromCharCode(0xA0);

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
        <span className="char" onClick={this.char.copy}>{this.char.char}</span>
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
  render() {
    // jshint ignore:start
    return (<div className="item">
      <span className="char">{this.char.char || nbsp}</span>
      <span className="code">{this.char.prettyCode}</span>
      <span className="name">{this.char.name}</span>
      <button className="btn btn-sm" onClick={this.char.copy.bind(this.char)}>Copy</button>
    </div>)
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
    return (<div>
      {this.props.exactMatch && <div className="exact-match"><SearchResult char={this.props.exactMatch} /></div>}
      <VirtualScroll
        ref={c=>this.scroller=c}
        count={this.props.chars.length}
        rowHeight={window.innerWidth / 10}
        renderer={(i) => <SearchResult char={this.props.chars[i]} />}
        {...this.props}
      />
    </div>)
    // jshint ignore:end
  }
}

window.SearchResults = SearchResults;
window.MainGrid = MainGrid;

window.SearchResult = SearchResult;
