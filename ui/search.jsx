var $ = require('jquery');
var React = require('react');
var {render, unmountComponentAtNode} = require('react-dom');
var punycode = require('punycode');

let _listener = null;
const HEX_RE = /^\s*(?:U?[+-]?|0x|\+)?([0-9A-F]+)\s*$/i;
let old = '';

function filter(query) {
  let exactMatch;
  let hex = HEX_RE.exec(query);
  if (hex !== null) {
    let code = parseInt(hex[1], 16);
    exactMatch = UNICODE_DATA.filter(char => char.code === code)[0];
  }
  if (!exactMatch && require('punycode').ucs2.decode(query.normalize('NFC')).length === 1) {
    let chr = query.normalize('NFC')[Symbol.iterator]().next().value;
    exactMatch = UNICODE_DATA.filter(char => char.char === chr)[0];
  }

  return {filtered: require('fuzzaldrin-plus').filter(UNICODE_DATA, query, {key: 'name'}), exactMatch};
}

function createView({filtered: chars, exactMatch}) {
  if (_listener) {
    window.removeEventListener('resize', _listener);
    _listener = null;
  }
  let run = () => {
    return render(React.createElement(SearchResults, {
      chars,
      topInset: 2.5 * 16 + (!!exactMatch && window.innerWidth/10),
      scrollTo: 0,
      exactMatch,
    }), $('.search-results')[0]);
  };
  _listener = run;
  window.addEventListener('resize', run);
  return run();
}

function resultCount({filtered, exactMatch}) {
  if (exactMatch) {
    return filtered.length + 1;
  }
  return filtered.length;
}

function search(query) {
  let results = filter(query);
  results.filtered = currentSorter(results.filtered);

  let matches = resultCount(results);
  $('header .results').text(matches.toLocaleString() + ' result' + (matches == 1 ? '' : 's'));

  let el = createView(results);
  el.scroller.scrollTo(0);
  if (query === old) {
    el.activateSelected();
  } else {
    el.scroller.reloadData();
    el.setState({selected: -1});
  }
  el.forceUpdate();
  old = query;
}

const SORTERS = {
  relevance: x => x,
  codepoint: results => {
    return [...results].sort((a, b) => a.code - b.code); // sort is in-place, so we have to make a copy.
  },
};
let currentSorter = SORTERS.relevance;

$('[name="sort"]').on('change', ({target: {value}}) => {
  currentSorter = SORTERS[value];
  old = '';
  search($('.search').val().toLowerCase());
});

$('.search').on('keydown', ({which}) => {
  if (which === 27) {
    // escape (or ␛ or ⎋ :)
    $('.search').val('');
  } else if (which !== 13 && which) return; // enter
  var query = $('.search').val().toLowerCase();
  if (query.length) {
    $('.sort').addClass('active');

    search(query);

    window.switchToSearch();
  } else {
    window.switchToMain();
  }
});

window.switchToMain = function() {
  old = '';
  $('.search').val('');
  $('.sort').removeClass('active');
  $('header .results').text('');
  window.removeEventListener('resize', _listener);
  _listener = null;

  unmountComponentAtNode($('.search-results')[0]);


  $('main').fadeIn();
  $('.search-results').fadeOut();
};
window.switchToSearch = function() {
  $('main').fadeOut();
  $('.search-results').fadeIn();
};
