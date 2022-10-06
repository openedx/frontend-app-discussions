import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
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

  test('clicking "All Topics" button renders topics view', async () => {
    renderComponent();

    const allTopicsButton = await screen.findByText(navigationBarMessages.allTopics.defaultMessage);
    fireEvent.click(allTopicsButton);

    await screen.findByTestId('topics-view');
  });

  test('full view should hide close button', async () => {
    renderComponent(`/${courseId}/topics`);
    expect(screen.queryByText(navigationBarMessages.allTopics.defaultMessage))
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' }))
      .not
      .toBeInTheDocument();
  });

  test('in-context view should show close button', async () => {
    renderComponent(`/${courseId}/topics?inContext`);

    expect(screen.queryByText(navigationBarMessages.allTopics.defaultMessage))
      .not
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' }))
      .toBeInTheDocument();
  });

  test('the close button should post a message', async () => {
    const { parent } = window;
    delete window.parent;
    window.parent = { ...window, postMessage: jest.fn() };
    renderComponent(`/${courseId}/topics?inContext`);

    const closeButton = screen.queryByRole('button', { name: 'Close' });

    await act(async () => {
      fireEvent.click(closeButton);
    });

    await waitFor(() => expect(window.parent.postMessage).toHaveBeenCalled());
    window.parent = parent;
  });

  test('header, course navigation bar and footer are visible', async () => {
    renderComponent();
    expect(screen.queryByRole('banner')).toBeInTheDocument();
    expect(document.getElementById('courseTabsNavigation')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).toBeInTheDocument();
  });
});
