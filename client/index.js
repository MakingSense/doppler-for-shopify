
import React from 'react';import 'isomorphic-fetch';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import configureStore from './store/configureStore';

const store = configureStore();

const history = syncHistoryWithStore(browserHistory, store);

function renderApp() {
  render(
    <AppContainer>
      <Provider store={store}>
        <Router history={history} routes={routes} />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
}

renderApp();

if (module.hot) {
  module.hot.accept();
}
