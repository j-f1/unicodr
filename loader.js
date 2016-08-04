const promisify = require('promisify-node');
const path = require('path');
const fs = promisify(require('fs'));
const CBOR = require('cbor');
const zlib = require('zlib');

let l = v => console.log('loader: ' + v);
// l = ()=>0; // Release

module.exports = new Promise(function(resolve, reject) {
  setImmediate(() => {
    l('start');
    let fileStream = fs.createReadStream(path.join(__dirname, 'data.dat'));
    fileStream.on('error', reject);
    l('file stream created');

    let gzip = zlib.createUnzip();
    gzip.on('error', reject);
    l('gzip stream created');

    let decoder = new CBOR.Decoder();
    decoder.on('data', ({value}) => {
      l('CBOR data');
      resolve(value.map(data => data.value));
      l('resolved');
    });
    decoder.on('error', reject);
    l('CBOR decoder created');

    fileStream.pipe(gzip).pipe(decoder);
    l('data piped');
  });
});
