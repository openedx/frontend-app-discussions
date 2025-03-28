import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { StrictMode } from 'react';

// eslint-disable-next-line import/no-unresolved
import { createRoot } from 'react-dom/client';

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

const rootNode = createRoot(document.getElementById('root'));
subscribe(APP_READY, () => {
  rootNode.render(
    <StrictMode>
      <AppProvider store={store}>
        <Head />
        <DiscussionsHome />
      </AppProvider>
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  rootNode.render(<ErrorPage message={error.message} />);
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
