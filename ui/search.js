var $ = require('jquery');

let tmpl =
`<tr class="item">
  <td class="char">&#xA0;</td>
  <td class="code"></td>
  <td class="name"></td>
  <td><button class="btn copy">Copy</button></td>
</tr>`;

window.loadUnicodeData.then(() => {
  $('.search-results').hide();
});

$('.search').on('change', (e) => {
  setTimeout(() => {
    var val = e.target.value.toLowerCase();
    if (val.length) {
      let _filtered = UNICODE_DATA.filter(char => char.matches(val));

      let _els = _filtered.map(char => char.fillView($(tmpl)[0]));
      var $results = $('.search-results').empty().remove();
      _els.forEach(el => {
        $results.append(el);
      });
      $results.appendTo('body');

      $('main').fadeOut();
      $('.search-results').fadeIn();
    } else {
      $('main').fadeIn();
      $('.search-results').fadeOut(function () {
        $(this).empty();
      });
    }
  });
}).on('keyup', (e) => {
  if (e.keyCode === 27) {
    $(e.target).val('').trigger('change');
  }
});
