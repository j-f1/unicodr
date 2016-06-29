var $ = require('jquery');

class UniChar {
  constructor({name, code}) {
    this.name = name;
    this._lname = name.toLowerCase();
    this.code = code;
    this.char = String.fromCharCode(code);
  }
  toString() {
    return `“${this.char}”: ${this.name} (${this.prettyCode})`;
  }
  get prettyCode() {
    var code = this.code.toString(16);
    while (code.length < 4) {
      code = "0" + code;
    }
    return "U+" + code;
  }
  get HTML() {
    let el = $(this.constructor.tmpl)[0];
    this.fillView(el);
    return el.outerHTML;
  }
  fill$View($view) {
    $view.each(function(i, el) {
      this.fillView(el);
    });
  }
  fillView(view) {
    view.querySelector('.char').textContent = this.char;
    view.querySelector('.code').textContent = this.prettyCode;
    view.title = this.name.toLowerCase();
    return view;
  }
  matches(name /* must be all lowercase */) {
    return this._lname.indexOf(name) !== -1;
  }
}
UniChar.tmpl =
`<span class="item">
  <span class="char"></span>
  <span class="code"></span>
  <span class="note">Click to copy</span>
</span>`.replace(/>\s+</m, '><');
module.exports = UniChar;
