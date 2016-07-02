const promisify = require('promisify-node');
const path = require('path');
const fs = promisify(require('fs'));
const CBOR = require('cbor');
const zlib = require('zlib');

module.exports = new Promise(function(resolve, reject) {
  setTimeout(() => {
    let fileStream = fs.createReadStream(path.join(__dirname, '../data.dat'));
    fileStream.on('error', reject);

    let gzip = zlib.createUnzip();
    gzip.on('error', reject);

    let decoder = new CBOR.Decoder();
    decoder.on('data', ({value}) => {
      resolve(value.map(data => new UniChar(data.value)));
    });
    decoder.on('error', reject);

    fileStream.pipe(gzip).pipe(decoder);
  });
});
