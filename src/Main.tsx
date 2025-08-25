import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { CurrentAppProvider } from '@openedx/frontend-base';
import { appId } from './constants';
import store from './store';

import './app.scss';
import { DiscussionsHome } from './discussions';

const App = () => (
  <CurrentAppProvider appId={appId}>
    <ReduxProvider store={store}>
      <DiscussionsHome />
    </ReduxProvider>
  </CurrentAppProvider>
);

export default App;
