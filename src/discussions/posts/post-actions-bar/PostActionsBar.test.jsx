import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';

import { getConfig, initializeMockApp, setConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../../store';
import messages from './messages';
import PostActionsBar from './PostActionsBar';

let store;

function renderComponent(inContext) {
  render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <PostActionsBar inContext={inContext} />
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe.each([
  { inContext: false },
  { inContext: true },
])('PostActionsBar', ({ inContext }) => {
  beforeEach(async () => {
    setConfig({
      ...getConfig(),
      FEEDER_PROJECT_ID: 'test-id',
    });

    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        email: 'abc123@example.com',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  test(`'full view should show feedback, add post, ${inContext ? 'close button and title and hide searchbar'
    : 'searchbar and hide title and close button'} when inContext is ${inContext}`, () => {
    renderComponent(inContext);

    expect(screen.queryByTestId('feedback').childElementCount).toEqual(1);
    expect(screen.queryByRole('button', { name: 'Add a post' })).toBeInTheDocument();

    if (inContext) {
      expect(screen.queryByPlaceholderText(messages.searchAllPosts.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.title.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close' })).toBeInTheDocument();
    } else {
      expect(screen.queryByPlaceholderText(messages.searchAllPosts.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText(messages.title.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    }
  });
});
