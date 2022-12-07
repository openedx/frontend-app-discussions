import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import messages from '../messages';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import EmptyPosts from './EmptyPosts';

import '../posts/data/__factories__';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const threadsApiUrl = getThreadsApiUrl();

function renderComponent(location = `/${courseId}/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter initialEntries={[location]}>
            <EmptyPosts subTitleMessage={messages.emptyMyPosts} />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

function mockFetchThreads() {
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.onGet(threadsApiUrl).reply(200, Factory.build('threadsResult'));

  return executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
}

describe('EmptyPage', () => {
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

  test('"posts youve interacted with" message shown when no posts in system', async () => {
    renderComponent(`/${courseId}/my-posts/`);
    expect(
      screen.queryByText(messages.emptyMyPosts.defaultMessage),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Add a post' }),
    ).toBeInTheDocument();
  });

  test('"no post selected" text shown when posts are in system', async () => {
    await mockFetchThreads();
    renderComponent(`/${courseId}/my-posts/`);

    expect(
      screen.queryByText(messages.noPostSelected.defaultMessage),
    ).toBeInTheDocument();
  });
});
