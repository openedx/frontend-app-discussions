import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import DiscussionSidebar from './DiscussionSidebar';

let store;

function renderComponent(displaySidebar) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter>
            <DiscussionSidebar data-test- displaySidebar={displaySidebar} />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe('DiscussionSidebar', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  test('component visible if displaySidebar == true', async () => {
    renderComponent(true);
    const element = await screen.findByTestId('sidebar');
    expect(element).not.toHaveClass('d-none');
  });

  test('component invisible by default', async () => {
    renderComponent(false);
    const element = await screen.findByTestId('sidebar');
    expect(element).toHaveClass('d-none');
  });
});
