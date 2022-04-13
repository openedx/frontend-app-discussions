import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';

import { DiscussionsHome } from './discussions';
import appMessages from './i18n';
import store from './store';

import './assets/favicon.ico';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <DiscussionsHome />
    </AppProvider>,
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
  handlers: {
    config() {
      mergeConfig({
        POST_MARK_AS_READ_DELAY: process.env.POST_MARK_AS_READ_DELAY || 2000,
        THEME_LOADER_URL: process.env.THEME_LOADER_URL || 'http://localhost:8111/themes.js',
      });
    },
  },
});
