var $ = require('jquery');
var React = require('react');
var {render, unmountComponentAtNode} = require('react-dom');
var punycode = require('punycode');
var fuzzaldrin = require('fuzzaldrin-plus');
var {ucs2: {decode}} = require('punycode');

{
  let S = {
    HEX_RE        : Symbol('hex regex'),
    listener      : Symbol('listener'),
    old           : Symbol('old'),
    $resultCount  : Symbol('$result count'),
    $searchResults: Symbol('$search results'),
    filter        : Symbol('filter'),
    filtered      : Symbol('filtered'),
    exactMatch    : Symbol('exact match'),
    resultCount   : Symbol('result count'),
    createView    : Symbol('create view'),
  };

  var Seeker = class Seeker {
    constructor({$resultCount: rc, $results: r}) {
      this[S.HEX_RE] = /^\s*(?:U?[+-]?|0x|\+)?([0-9A-F]+)\s*$/i;
      this[S.listener] = null;
      this[S.old] = '';
      this[S.$resultCount] = rc;
      this[S.$searchResults] = r;

      this.SORTERS = {
        relevance: x => x,
        codepoint: results => {
          return [...results].sort((a, b) => a.code - b.code); // sort is in-place, so we have to make a copy.
        },
      };
      this.currentSorter = this.SORTERS.relevance;
    }
    reset() {
      this[S.old] = '';
      window.removeEventListener('resize', this[S.listener]);
      this[S.listener] = null;

      unmountComponentAtNode(this[S.$searchResults][0]);
    }
    updateSort(name, query) {
      this.currentSorter = this.SORTERS[name];
      this[S.old] = '';
      this.search(query);
    }
    search(query) {
      let results = this[S.filter](query);

      let matches = this[S.resultCount];
      this[S.$resultCount].text(matches.toLocaleString() + ' result' + (matches == 1 ? '' : 's'));

      let el = this[S.createView](results);
      if (query === this[S.old]) {
        el.activateSelected();
      } else {
        el.scroller.reloadData();
        el.setState({selected: -1});
        el.scroller.scrollTo(0);
      }
      el.forceUpdate();
      this[S.old] = query;
    }

    // PRIVATE //
    [S.filter](query) {
      let exactMatch;
      let hex = this[S.HEX_RE].exec(query);
      if (hex !== null) {
        let code = parseInt(hex[1], 16);
        exactMatch = UNICODE_DATA.filter(char => char.code === code)[0];
      }
      if (!exactMatch && decode(query.normalize('NFC')).length === 1) {
        let chr = query.normalize('NFC')[Symbol.iterator]().next().value;
        exactMatch = UNICODE_DATA.filter(char => char.char === chr)[0];
      }

      this[S.filtered] = this.currentSorter(
        fuzzaldrin.filter(UNICODE_DATA,
          query, {
            key: 'name'
          }
        )
      );
      this[S.exactMatch] = exactMatch;
    }
    [S.createView]() {
      if (this[S.listener]) {
        window.removeEventListener('resize', this[S.listener]);
        this[S.listener] = null;
      }
      let run = () => {
        return render(React.createElement(SearchResults, {
          chars: this[S.filtered],
          topInset: 2.5 * 16 + (!!this[S.exactMatch] && window.innerWidth/10),
          exactMatch: this[S.exactMatch],
        }), this[S.$searchResults][0]);
      };
      this[S.listener] = run;
      window.addEventListener('resize', run);
      return run();
    }
    get [S.resultCount]() {
      if (this[S.exactMatch]) {
        return this[S.filtered].length + 1;
      }
      return this[S.filtered].length;
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

$('body').on('keydown keyup', ({which}) => {
  if ($('.search')[0] !== document.activeElement && $('.settings').is(':not(.active)')) {
    $('.search').focus();
  }
})

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
