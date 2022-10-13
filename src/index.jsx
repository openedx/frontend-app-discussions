import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as headerMessages } from '@edx/frontend-component-header';
import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig,
  subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { messages as paragonMessages } from '@edx/paragon';

import { DiscussionsHome } from './discussions';
import appMessages from './i18n';
import store from './store';

import './assets/favicon.ico';
import './index.scss';

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
    headerMessages,
    footerMessages,
    appMessages,
    paragonMessages,
  ],
  handlers: {
    config: () => {
      mergeConfig({
        LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
        DISPLAY_FEEDBACK_BANNER: process.env.DISPLAY_FEEDBACK_BANNER || 'false',
      }, 'DiscussionsConfig');
    },
  },
});
