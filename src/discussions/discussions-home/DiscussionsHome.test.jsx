import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { Routes } from '../../data/constants';
import { initializeStore } from '../../store';
import navigationBarMessages from '../navigation/navigation-bar/messages';
import DiscussionsHome from './DiscussionsHome';

let store;

function renderComponent() {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[Routes.DISCUSSIONS.PATH]}>
          <DiscussionsHome />
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('DiscussionsHome', () => {
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

  it('clicking "All Topics" button renders topics view', async () => {
    renderComponent();

    const allTopicsButton = await screen.findByText(navigationBarMessages.allTopics.defaultMessage);
    fireEvent.click(allTopicsButton);

    await screen.findByTestId('topics-view');
  });
});
