import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig,
  subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';

import Head from './components/Head/Head';
import { DiscussionsHome } from './discussions';
import messages from './i18n';
import store from './store';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <Head />
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
  messages,
  handlers: {
    config: () => {
      mergeConfig({
        LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
        LEARNER_FEEDBACK_URL: process.env.LEARNER_FEEDBACK_URL,
        STAFF_FEEDBACK_URL: process.env.STAFF_FEEDBACK_URL,
      }, 'DiscussionsConfig');
    },
  },
});
