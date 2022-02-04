import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { getConfig, initializeMockApp, setConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import navigationBarMessages from '../navigation/navigation-bar/messages';
import DiscussionsHome from './DiscussionsHome';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';

function renderComponent(location = `/${courseId}/`) {
  render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter initialEntries={[location]}>
            <DiscussionsHome />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe('DiscussionsHome', () => {
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

  test('clicking "All Topics" button renders topics view', async () => {
    renderComponent();

    const allTopicsButton = await screen.findByText(navigationBarMessages.allTopics.defaultMessage);
    fireEvent.click(allTopicsButton);

    await screen.findByTestId('topics-view');
  });

  test('full view should show header and footer and hide close button', async () => {
    renderComponent(`/${courseId}/topics`);
    expect(screen.queryByText(navigationBarMessages.allTopics.defaultMessage))
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' }))
      .not
      .toBeInTheDocument();
    // Header should be visible
    expect(screen.queryByRole('button', {
      name: /account menu for abc123/i,
    }))
      .toBeInTheDocument();
    // Footer should be visible
    expect(screen.queryByRole('contentinfo'))
      .toBeInTheDocument();
  });

  test('in-context view should hide header and footer and show close button', async () => {
    renderComponent(`/${courseId}/topics?inContext`);

    expect(screen.queryByText(navigationBarMessages.allTopics.defaultMessage))
      .not
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' }))
      .toBeInTheDocument();
    // Header should be hidden
    expect(screen.queryByRole('button', {
      name: /account menu for abc123/i,
    }))
      .not
      .toBeInTheDocument();
    // Footer should be hidden
    expect(screen.queryByRole('contentinfo'))
      .not
      .toBeInTheDocument();
  });
});
