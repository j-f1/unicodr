var $ = require('jquery');
var {clipboard} = require('electron');

class UniChar {
  constructor({name, code}) {
    this.name = name.toLowerCase();
    this.code = code;
    this.char = String.fromCodePoint(code);
  }
  toString() {
    return `“${this.char}”: ${this.name} (${this.prettyCode})`;
  }
  get prettyCode() {
    var code = this.code.toString(16).toUpperCase();
    while (code.length < 4) {
      code = "0" + code;
    }
    return "U+" + code;
  }
  copy() {
    clipboard.writeText(this.char);
  }
}
module.exports = UniChar;
