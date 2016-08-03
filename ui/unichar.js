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
  matches(name /* must be all lowercase */) {
    return this.name.indexOf(name) !== -1;
  }
}
module.exports = UniChar;
