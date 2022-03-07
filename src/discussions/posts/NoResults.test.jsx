import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { PostsStatusFilter } from '../../data/constants';
import { initializeStore } from '../../store';
import messages from '../messages';
import { setSearchQuery, setStatusFilter } from './data';
import NoResults from './NoResults';

import './data/__factories__';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';

function renderComponent(location = `/${courseId}/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter initialEntries={[location]}>
            <NoResults />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe('NoResults', () => {
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

  test('component skips rendering if there are no filters', async () => {
    renderComponent();
    expect(
      screen.queryByText(messages.removeFilters.defaultMessage),
    ).not.toBeInTheDocument();
  });

  test('remove filters displays when filter is added', async () => {
    store.dispatch(setStatusFilter(PostsStatusFilter.UNANSWERED));
    renderComponent();
    expect(
      screen.queryByText(messages.removeFilters.defaultMessage),
    ).toBeInTheDocument();
  });

  test('remove keywords displays when filter is added', async () => {
    store.dispatch(setSearchQuery('test'));
    renderComponent();
    expect(
      screen.queryByText(messages.removeKeywords.defaultMessage),
    ).toBeInTheDocument();
  });
});
