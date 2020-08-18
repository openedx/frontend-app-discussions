import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';
import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import {
  APP_INIT_ERROR, APP_READY, initialize, subscribe,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';

import React from 'react';
import ReactDOM from 'react-dom';


import './assets/favicon.ico';
import { DiscussionsHomeContainer } from './discussions';
import appMessages from './i18n';
import './index.scss';
import store from './store';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <Header />
      <DiscussionsHomeContainer />
      <Footer />
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
    headerMessages,
    footerMessages,
  ],
});
