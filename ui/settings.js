function recursivelyApply(vals, f, _prefix) {
  Object.keys(vals).forEach(name => {
    let newName = (_prefix ? _prefix+'.':"") + name;
    if (typeof vals[name] === "object") {
      recursivelyApply(vals[name], f, newName);
    } else {
      f(newName, vals[name]);
    }
  });
}
settings.get().then(vals => {
  recursivelyApply(vals, (key, value) => {
    $(`[name="${key}"]`).removeAttr('disabled').prop('checked', value);
  });
});
$('.settings .done').click(() => {
  $('.settings').removeClass('active');
});
$('.settings input').on('change', ({target: {name, checked}}) => {
  try {
    settings.set(name, checked);
  } catch(e) {
    alert(`FAIL ${e}`);
  }
});
$('.settings .cache').click(() => {
  if (confirm('Really clear cache? Unicodr will quit.')) {
    $('body').fadeOut(400, () => {
      $('body').empty()
               .css({margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'})
               .html('Clearing&hellip;')
               .fadeIn(400, () => {
        require('fs').unlink(require('../constants').CACHE_PATH, (err) => {
          if (err) {
            alert('Failed!\n'+err);
          } else {
            require('electron').remote.app.relaunch(); // tells Electron to restart after quitting.
            require('electron').remote.app.exit(0);
          }
        });
      });
    });
  }
});
