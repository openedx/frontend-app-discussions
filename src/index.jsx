import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import { MathJaxContext } from 'better-react-mathjax';

import {
  APP_INIT_ERROR, APP_READY, initialize, subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';

import { DiscussionsHome } from './discussions';
import appMessages from './i18n';
import config from './mathjax-config';
import store from './store';

import './assets/favicon.ico';
import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <MathJaxContext version={3} config={config}>
      <AppProvider store={store}>
        <DiscussionsHome />
      </AppProvider>
    </MathJaxContext>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  requireAuthenticatedUser: true,
  messages: [
    appMessages,
  ],
});
