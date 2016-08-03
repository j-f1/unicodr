var $ = require('jquery');
var React = require('react');
var {render, unmountComponentAtNode} = require('react-dom');

let tmpl =
`<tr class="item">
  <td class="char">&#xA0;</td>
  <td class="code"></td>
  <td class="name"></td>
  <td><button class="btn copy">Copy</button></td>
</tr>`;

let _listener = null;

$('.search').on('change', ({target}) => {
  setImmediate(() => {
    var val = target.value.toLowerCase();
    if (val.length) {
      let _filtered = UNICODE_DATA.filter(char => char.matches(val));
      if (_listener) {
        window.removeEventListener('resize', _listener);
        _listener = null;
      }
      let run = () => {
        render(React.createElement(SearchResults, {
          chars: _filtered,
          topInset: 2.5 * 16,
          scrollTo: 0
        }), $('.search-results')[0]).scroller.scrollTo(0);
      };
      run();
      _listener = run;
      window.addEventListener('resize', run);

      $('main').fadeOut();
      $('.search-results').fadeIn();
    } else {
      window.removeEventListener('resize', _listener);
      _listener = null;
      unmountComponentAtNode($('.search-results')[0]);
      $('main').fadeIn();
      $('.search-results').fadeOut();
    }
  });
}).on('keyup', ({keyCode, target}) => {
  if (keyCode === 27) {
    $(target).val('').trigger('change');
  }
});
