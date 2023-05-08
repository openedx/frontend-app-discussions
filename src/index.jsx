/* eslint-disable no-underscore-dangle */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { Profiler } from 'react';
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

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions, // the Set of interactions belonging to this update
) {
  // Aggregate or log render timings...
  console.log(`Profiler ID: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual duration: ${actualDuration}`);
  console.log(`Base duration: ${baseDuration}`);
  console.log(`Start time: ${startTime}`);
  console.log(`Commit time: ${commitTime}`);
  console.log(`Interactions: ${interactions}`);
}

function enableProfiler() {
  console.log('Enabling React Profiler');
  if (
    process.env.NODE_ENV === 'production'
    && typeof window !== 'undefined'
    && window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    && typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function'
  ) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
      onRender: onRenderCallback,
    });
  }
}

subscribe(APP_READY, () => {
  ReactDOM.render(
    <Profiler id="discussions" onRender={onRenderCallback}>
      <AppProvider store={store}>
        <DiscussionsHome />
      </AppProvider>
    </Profiler>,
    document.getElementById('root'),
    () => {
      enableProfiler();
    },
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
