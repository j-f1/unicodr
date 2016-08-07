var $ = require('jquery');
var React = require('react');
var {render, unmountComponentAtNode} = require('react-dom');
var punycode = require('punycode');
var fuzzaldrin = require('fuzzaldrin-plus');
var {ucs2: {decode}} = require('punycode');

{
  let HEX_RE         = Symbol('hex regex');
  let listener       = Symbol('listener');
  let old            = Symbol('old');
  let $resultCount   = Symbol('$result count');
  let $searchResults = Symbol('$search results');
  let filter         = Symbol('filter');
  let filtered       = Symbol('filtered');
  let exactMatch     = Symbol('exact match');
  let resultCount    = Symbol('result count');
  let createView     = Symbol('create view');

  var Seeker = class Seeker {
    constructor({$resultCount: rc, $results: r}) {
      this[HEX_RE] = /^\s*(?:U?[+-]?|0x|\+)?([0-9A-F]+)\s*$/i;
      this[listener] = null;
      this[old] = '';
      this[$resultCount] = rc;
      this[$searchResults] = r;

      this.SORTERS = {
        relevance: x => x,
        codepoint: results => {
          return [...results].sort((a, b) => a.code - b.code); // sort is in-place, so we have to make a copy.
        },
      };
      this.currentSorter = this.SORTERS.relevance;
    }
    reset() {
      this[old] = '';
      window.removeEventListener('resize', this[listener]);
      this[listener] = null;

      unmountComponentAtNode(this[$searchResults][0]);
    }
    updateSort(name, query) {
      this.currentSorter = this.SORTERS[name];
      this[old] = '';
      this.search(query);
    }
    search(query) {
      let results = this[filter](query);

      let matches = this[resultCount];
      this[$resultCount].text(matches.toLocaleString() + ' result' + (matches == 1 ? '' : 's'));

      let el = this[createView](results);
      if (query === this[old]) {
        el.activateSelected();
      } else {
        el.scroller.reloadData();
        el.setState({selected: -1});
        el.scroller.scrollTo(0);
      }
      el.forceUpdate();
      this[old] = query;
    }

    // PRIVATE //
    [filter](query) {
      let exactMatch;
      let hex = this[HEX_RE].exec(query);
      if (hex !== null) {
        let code = parseInt(hex[1], 16);
        exactMatch = UNICODE_DATA.filter(char => char.code === code)[0];
      }
      if (!exactMatch && decode(query.normalize('NFC')).length === 1) {
        let chr = query.normalize('NFC')[Symbol.iterator]().next().value;
        exactMatch = UNICODE_DATA.filter(char => char.char === chr)[0];
      }

      this[filtered] = this.currentSorter(
        fuzzaldrin.filter(UNICODE_DATA,
          query, {
            key: 'name'
          }
        )
      );
      this[exactMatch] = exactMatch;
    }
    [createView]() {
      if (this[listener]) {
        window.removeEventListener('resize', this[listener]);
        this[listener] = null;
      }
      let run = () => {
        return render(React.createElement(SearchResults, {
          chars: this[filtered],
          topInset: 2.5 * 16 + (!!this[exactMatch] && window.innerWidth/10),
          exactMatch: this[exactMatch],
        }), this[$searchResults][0]);
      };
      this[listener] = run;
      window.addEventListener('resize', run);
      return run();
    }
    get [resultCount]() {
      if (this[exactMatch]) {
        return this[filtered].length + 1;
      }
      return this[filtered].length;
    }
  };
}

let seeker = new Seeker({
  $results: $('.search-results'),
  $resultCount: $('header .results'),
});

$('[name="sort"]').on('change', ({target: {value}}) => {
  seeker.updateSort(value, $('.search').val().toLowerCase());
});

$('.search').on('keydown', ({which}) => {
  if (which === 27) {
    // escape (or ␛ or ⎋ :)
    $('.search').val('');
  } else if (which !== 13 && which) return; // enter
  var query = $('.search').val().toLowerCase();
  if (query.length) {
    $('.sort').addClass('active');

    seeker.search(query);
    window.switchToSearch();
  } else {
    window.switchToMain();
  }
});

window.switchToMain = function() {
  $('.search').val('');
  $('.sort').removeClass('active').prop('checked', false);
  $('header .results').text('');

  seeker.reset();

  $('main').fadeIn();
  $('.search-results').fadeOut();
};
window.switchToSearch = function() {
  $('main').fadeOut();
  $('.search-results').fadeIn();
};
