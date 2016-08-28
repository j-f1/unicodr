#!/usr/bin/env node

var packager = require('electron-packager');

/**
 * USAGE:
 * node build.js # will prompt for values
 * node build.js --auto # defaults
 * node build.js --plat <plat> # no prompt
 * node build.js --arch <arch> # no prompt
 * node build.js --plat # no prompt, default
 * node build.js --arch # no prompt, default
 */

function prompt(arg, promptStr, defaultValue) {
  if (process.argv.indexOf('--auto') > -1) {
    return Promise.resolve(defaultValue);
  }

  let idx = process.argv.indexOf(arg);
  if (idx > -1) {
    let val = process.argv[idx+1];
    if (!val || val.match(/^-+/)) {
      val = defaultValue;
    }
    return Promise.resolve(val)
  }

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

prompt('--plat', 'Platform (linux/win32/darwin/all)', process.platform).then(platform => {
  prompt('--arch', 'Architecture (ia32/x64/all)', process.arch).then(arch => {
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
