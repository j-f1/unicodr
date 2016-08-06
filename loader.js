const promisify = require('promisify-node');
const path = require('path');
const fs = promisify(require('fs'));
const CBOR = require('cbor');
const zlib = require('zlib');
const CACHE_PATH = require('path').join(require('electron').app.getPath('userData'), 'cache.dat');

let l = v => console.log('loader: ' + v);
if (process.env.NODE_ENV === 'production') {
  l = ()=>0; // Release
}

let load = (resolve, reject) => {
  l('reading');
  try {
    fs.readFile(CACHE_PATH, {encoding: 'utf-8'}).then(JSON.parse).then(val => {
      l('resolving');
      resolve(val);
    }).catch(reject);
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

        let decoder = new CBOR.Decoder();
        decoder.on('data', ({value}) => {
          l('CBOR data');
          value = value.map(data => data.value);
          fs.writeFile(CACHE_PATH, JSON.stringify(value)).then(() => {
            l('cached');
            load(resolve, reject);
          }, reject);
        });
        decoder.on('error', reject);
        l('CBOR decoder created');

        readStream.pipe(gzip).pipe(decoder);
        l('piped.');
      } catch (e) {
        reject(e);
      }
    });
  } catch (e) {
    reject(e);
  }
});
