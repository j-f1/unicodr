$('.search').on('change', (e) => {
  var val = e.target.value.toLowerCase();
  var filtered = UNICODE_DATA.slice().filter(char => char.matches(val));
  console.log(filtered.map(item => item.toString()));
});
