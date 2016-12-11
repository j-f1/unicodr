const ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
      settings = require('electron-settings'),
      React = require('react'),
      {unmountComponentAtNode: unmount} = require('react-dom');

function makeKeyPath(keyPath) {
  if (typeof keyPath === 'string') {
    return keyPath.split('.');
  }
  if (typeof keyPath === 'object' && Array.isArray(keyPath)) {
    return keyPath;
  }
  throw new TypeError('keyPath must be a string or an array.')
}

function getFromKeyPath(object, keyPath) {
  for (const key of makeKeyPath(keyPath)) {
    object = object[key];
  }
  return object;
}

class Settings extends React.Component {
  constructor(...args) {
    super(...args);
    this.dismiss = this.dismiss.bind(this);
    this.eraseCache = this.eraseCache.bind(this);
    this.state = {
      visible: false,
      loaded: false,
    };
  }
  componentDidMount() {
    this.refreshSettings();
  }
  refreshSettings() {
    this.setState({
      loaded: true,
      settings: settings.getSync(),
    });
  }
  show() {
    this.setState({visible: true})
  }
  dismiss() {
    this.setState({visible: false})
  }
  eraseCache() {
    if (confirm('Really clear cache? Unicodr will quit.')) {
      $('body').fadeOut(400, () => {
        $('[data-reactroot]').parent().each((i, el) => unmount(el));
        $('body').empty()
                 .css({margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'})
                 .html('Clearing&hellip;')
                 .fadeIn(400, () => {
          require('fs').unlink(require('../constants').CACHE_PATH, (err) => {
            if (err) {
              alert('Failed!\n'+err);
            }
            require('electron').remote.app.relaunch(); // tells Electron to restart after quitting.
            require('electron').remote.app.exit(0);
          });
        });
      });
    }
  }
  checkbox(name) {
    let checked = false;
    if (this.state.loaded) {
      checked = getFromKeyPath(this.state.settings, name);
    }
    return <input type="checkbox" name={name} disabled={!this.state.loaded} checked={checked} onChange={this.handleInput(name)} />
  }
  handleInput(name) {
    return ({target: {value, checked}}) => {
      try {
        settings.setSync(name, typeof checked === 'undefined' ? value : checked)
        this.refreshSettings();
      } catch(e) {
        alert(`Save failed: ${e}`)
      }
    }
  }
  render() {
    return (<div className={'settings' + (this.state.visible ? ' active' : '')} onClick={this.dismiss}>
      <section onClick={e=>e.stopPropagation()}>
        <header><h3>Settings <button onClick={this.dismiss}>Done</button></h3></header>
        <section>
          <h4>Keyboard Shortcuts</h4>
          <h5>Open/close from any app</h5>
          <p>
            <label>
              {this.checkbox("gbl.toggle.ctrl")}{" "}
              <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>U</kbd>
            </label><br />
            <label>
              <input type="checkbox" name="gbl.toggle.cmd" disabled={!this.state.loaded} />{" "}
              <kbd>Shift</kbd>+<kbd>⌘</kbd>+<kbd>U</kbd>
            </label>
          </p>
          <h5>Search results</h5>
          <p>
            <label><kbd>↑</kbd> Up Arrow: Highlight Previous</label><br />
            <label><kbd>↓</kbd> Down Arrow: Highlight Next</label><br />
            <label><kbd>↩</kbd> Enter: Copy selected</label>
          </p>
          <h4>Cache</h4>
          <p>
            <small>Erase cache when updating, or if the app won’t start. If you don’t know what this is, you probably don’t need it.</small><br />
            <button onClick={this.eraseCache}>Erase Cache</button>
          </p>
        </section>
      </section>
    </div>)
  }
}

window.Settings = Settings;
