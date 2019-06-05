/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import 'babel-polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import FontFaceObserver from 'fontfaceobserver';
import createHistory from 'history/createBrowserHistory';
import 'sanitize.css/sanitize.css';
import openSocket from 'socket.io-client';

// Import root app
import App from 'containers/App';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

// Load the favicon and the .htaccess file
import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import 'file-loader?name=[name].[ext]!./.htaccess'; // eslint-disable-line import/extensions
import '!file-loader?name=[name].[ext]!./../public/cars/lada.jpg';
import '!file-loader?name=[name].[ext]!./../public/cars/tank1.jpg';
import '!file-loader?name=[name].[ext]!./../public/cars/schoolbus.jpg';
import '!file-loader?name=[name].[ext]!./../public/cars/truck1.jpg';
import '!file-loader?name=[name].[ext]!./../public/cars/golf1.jpg';

import configureStore from './configureStore';

// Import i18n messages
import { translationMessages } from './i18n';

// Import CSS reset and Global Styles
import './global-styles';

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
});

window.data = {
  avatar: localStorage.getItem('avatar'),
  name: localStorage.getItem('name'),
  selectedCar: localStorage.getItem('selectedCar'),
};
window.socket = openSocket();

if (window.location.href.endsWith('/play')) {
  if (window.data.selectedCar) {
    const selectedCarFn = response => {
      if (!response) {
        window.data.selectedCar = null;
        window.location.href = '/join';
      }
    };
    window.socket.on('selectedCar', selectedCarFn);
    window.socket.emit('selectCar', {
      car: window.data.selectedCar,
      user: window.data.name,
    });
  } else {
    window.location.href = '/join';
  }
} else if (window.data.selectedCar) {
  window.socket.emit('returnCar', {
    car: window.data.selectedCar,
    user: window.data.name,
  });
}

// Create redux store with history
const initialState = {};
const history = createHistory();
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app');

const render = messages => {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={messages}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </LanguageProvider>
    </Provider>,
    MOUNT_NODE,
  );
};

if (module.hot) {
  // Hot reloadable React components and translation json files
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./i18n', 'containers/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render(translationMessages);
  });
}

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  new Promise(resolve => {
    resolve(import('intl'));
  })
    .then(() =>
      Promise.all([
        import('intl/locale-data/jsonp/en.js'),
        import('intl/locale-data/jsonp/de.js'),
      ]),
    )
    .then(() => render(translationMessages))
    .catch(err => {
      throw err;
    });
} else {
  render(translationMessages);
}

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
