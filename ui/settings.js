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
$('button').click(() => {
  window.parent.$('.settings').removeClass('active');
});
$('.settings input').on('change', ({target: {name, checked}}) => {
  try {
    settings.set(name, checked);
  } catch(e) {
    alert(`FAIL ${e}`);
  }
});
