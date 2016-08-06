var $ = require('jquery');
var React = require('react');
var {render, unmountComponentAtNode} = require('react-dom');
var {filter} = require('fuzzaldrin-plus');

let _listener = null;
const HEX_RE = /^\s*(?:U?[+-]?|0x|\+)?([0-9A-F]+)\s*$/i;
let old = "";

$('.search').on('keydown', ({which}) => {
  if (which !== 13 && which) return; // enter
  var val = $('.search').val().toLowerCase();
  if (val.length) {
    let _filtered = filter(UNICODE_DATA, val, {key: 'name'});
    if (_listener) {
      window.removeEventListener('resize', _listener);
      _listener = null;
    }
    let exactMatch;
    let hex = HEX_RE.exec(val);
    if (hex !== null) {
      let code = parseInt(hex[1], 16);
      exactMatch = UNICODE_DATA.filter(char => char.code === code)[0];
    }
    if (!exactMatch && require('punycode').ucs2.decode(val.normalize('NFC')).length === 1) {
      let chr = val.normalize('NFC')[Symbol.iterator]().next().value;
      exactMatch = UNICODE_DATA.filter(char => char.char === chr)[0];
    }
    let matches = (_filtered.length + (+ !!exactMatch));
    $('header .results').text(matches.toLocaleString() + ' result' + (matches == 1 ? '' : 's'));
    let run = () => {
      return render(React.createElement(SearchResults, {
        chars: _filtered,
        topInset: 2.5 * 16 + (!!exactMatch && window.innerWidth/10),
        scrollTo: 0,
        exactMatch,
      }), $('.search-results')[0]);
    };
    let el = run();
    el.scroller.scrollTo(0);
    if (val === old) {
      el.activateSelected();
    } else {
      el.setState({selected: -1});
    }
    el.forceUpdate();
    old = val;
    _listener = run;
    window.addEventListener('resize', run);

    $('main').fadeOut();
    $('.search-results').fadeIn();
  } else {
    $('header .results').text('');
    window.removeEventListener('resize', _listener);
    _listener = null;
    unmountComponentAtNode($('.search-results')[0]);
    $('main').fadeIn();
    $('.search-results').fadeOut();
  }
});
