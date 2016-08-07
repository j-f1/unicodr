#!/usr/bin/env node

var packager = require('electron-packager');

function prompt(promptStr, defaultValue) {
  return new Promise(function(resolve, reject) {
    process.stdout.write(`${promptStr}: [${defaultValue}] `);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', val => {
      resolve(val.replace('\n', '') || defaultValue);
      process.stdin.pause();
    });
  });
}

let fail = err => {
  console.error('ERR!', err);
};

prompt('Platform (linux/win32/darwin/all)', process.platform).then(platform => {
  prompt('Architecture (ia32/x64/all)', process.arch).then(arch => {
    packager({
      arch,
      dir: __dirname,
      platform,
      // icon: 'icon.icns || icon.ico',
      ignore: [
        /.*\.blend\d+/,
      ],
      name: 'Unicodr',
      overwrite: true,
      prune: true,
      version: '1.3.1',
      out: 'build/',
    }, (err, paths) => {
      if (err) {
        console.error('ERR!', err);
      } else {
        paths.forEach(path => {
          console.log('executable: ', path);
        });
      }
    });
  }, fail);
}, fail);
