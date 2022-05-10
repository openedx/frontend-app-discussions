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
import Latex from './latex';
import store from './store';

import './assets/favicon.ico';
import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <Latex>
        <DiscussionsHome />
      </Latex>
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
      });
    },
  },
});
