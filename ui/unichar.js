var $ = require('jquery');
var {clipboard} = require('electron');

class UniChar {
  constructor({name, code}) {
    this.name = name.toLowerCase();
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
  copy() {
    clipboard.writeText(event.target.innerHTML);
  }
  fillView(view) {
    if (!view) return;
    (view.querySelector('.char') || {}).textContent = this.char;
    (view.querySelector('.code') || {}).textContent = this.prettyCode;
    (view.querySelector('.name') || {}).textContent = this.name;
    view.title = this.name;
    return view;
  }
  matches(name /* must be all lowercase */) {
    return this.name.indexOf(name) !== -1;
  }
}
UniChar.tmpl =
`<span class="item">
  <span class="char"></span>
  <span class="code"></span>
  <span class="note">Click to copy</span>
</span>`;
module.exports = UniChar;
