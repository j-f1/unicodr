# Hi! It’s nice to see you looking underneath the hood of my app!

## FAQ:

### What do I need to install?

You need:
  - [Python 3](https://python.org/download). Follow the instructions there to install.
  - [`node.js`](https://nodejs.org). Install that, then run:
        npm install -g npm
    Next, `cd` into this directory and `npm install`.
  - [SASS](http://sass-lang.com/) for the stylesheets

### What are **all these files**?

- `dev/`: files related to development.
  - `load.py`: a [Python](https://python.org) file. To use, run `npm run data` in this directory.
      - I pass `-- -v` to `npm run data` to make the wait feel less long.
- `ui/`: the window that pops up when you click the icon.
  - `vendor/`: libs
  - `IconTemplate(@2x).png`: the icon
  - `index.html`: the HTML file
  - `index.scss`: the stylesheet. Run `npm run watch` to compile to CSS on save.
  - `unichar.js`: the data model
  - `virtual.jsx`: my Ꝛeact `<VirtualScroll />` component.
  - `react.jsx`: the Ꝛeact components.
  - `search.jsx`: the search library.
  - `loader.jsx`: re-wraps the main process promise.
- `.jshintrc`: for [JSHint](http://jshint.com)
- `build.js`, to build a double-clickable app.
- `data.dat`: made by `dev/load.py`.
- `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `HACKING.md`: `RecursionError`
- `icon.blend`: A [Blender](https://blender.org) file that has the icon.
- `loader.js`: the thing that does the actual data cache/load.
- `main.js`: the entry point of the app.
- `package.json`: used by npm/node.
- `virtual.md`: a [rubber duck](https://en.wikipedia.org/wiki/Rubber_duck_debugging).
