# VirtualScroll

## Usage:

```
<VirtualScroll
  count={array.length}
  rowHeight={42} // need to be able to be dynamic, somehow.
  renderer={(i) => <MyComponent item={array[i]} />} // must be FAST!
  [margin={5}] // the number of extra rows that are currently invisible at the top and bottom.
              // More for less chance of a white flash, less for speed.
  [topInset={40}] // the extra space at the top when scrolled all the way.
/>
```

## Implementation

### 1. Scrolling

Use `transform`:

```js
_styleForRow(i) {
  return {
    transform: 'translateY('+ ((i * this.props.rowHeight - this.state.scrollPos) + this.props.topInset) +')'
  }
}
```

### 2. Visibility

```js
get _visibility() {
  startIdx = Math.floor(this.state.scrollPos / this.props.rowHeight) - this.props.margin;
  count = Math.ceil(window.innerHeight / this.props.rowHeight) + this.props.margin;
  endIdx = startIdx + count;
  return {startIdx, endIdx};
}
```
### 3. Caching

```js
const LRU = require('lru-cache');
// ...
constructor() {
  this._cache = LRU({
    max: 500,
    stale: true,
    maxAge: 500, // ms
  });
}
willMountOrSimilar() {
  this._plum = setInterval(() => {
    this._cache.prune();
  }, 1000);
}
_getComponent(i) {
  if (!this._cache.has(i)) {
    this._cache.set(i, this.props.renderer(i));
  }
  return this._cache.get(i);
}
forceUpdate(i) { // public API
  this._cache.set(i, this.props.renderer(i));
}
willUnmountOrSimilar() {
  this._cache.reset();
  clearInterval(this._plum);
  this._plum = null;
}
```

### 4. All together now!
<!--
```js
class Null extends React.component {
  render() {
    return React.Children.only(this.props.children);
  }
}
```
-->

```js
get _visibleStyledRows() {
  let {startIdx, endIdx} = this._visibility;
  let rows = [];
  for (let i = startIdx; i <= endIdx; i++) {
    let row = this._getComponent(i);
    rows.push(<div style={this._styleForRow(i)} key={i}>{row}</div>)
  }
  return rows;
}
render() {
  return <div>{this._visibleStyledRows}</div>
}
```
