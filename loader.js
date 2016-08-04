const promisify = require('promisify-node');
const path = require('path');
const fs = promisify(require('fs'));
const CBOR = require('cbor');
const zlib = require('zlib');
const CACHE_PATH = require('path').join(require('electron').app.getPath('userData'), 'cache.dat');

let l = v => console.log('loader: ' + v);
// l = ()=>0; // Release

let load = (resolve, reject) => {
  try {
    let fileStream = fs.createReadStream(CACHE_PATH);
    let decoder = new CBOR.Decoder();
    decoder.on('data', ({value}) => {
      l('CBOR data');
      resolve(value.map(data => data.value));
      l('resolved');
    });
    decoder.on('error', reject);
    l('CBOR decoder created');

    fileStream.pipe(decoder);
    l('data piped');
  } catch(e) {
    reject(e);
  }
};

module.exports = new Promise(function(resolve, reject) {
  try {
    fs.access(CACHE_PATH, fs.F_OK).then(() => {
      load(resolve, reject);
    }, () => {
      try {
        l('start');
        let readStream = fs.createReadStream(path.join(__dirname, 'data.dat'));
        readStream.on('error', reject);
        l('file stream created');

        let gzip = zlib.createUnzip();
        gzip.on('error', reject);
        l('gzip stream created');

        let writeStream = fs.createWriteStream(CACHE_PATH);
        writeStream.on('error', reject);
        writeStream.on('finish', () => {
          load(resolve, reject);
        });
        l('write stream created');

        readStream.pipe(gzip).pipe(writeStream);
        l('piped.');
      } catch (e) {
        reject(e);
      }
    });
  } catch (e) {
    reject(e);
  }
});
