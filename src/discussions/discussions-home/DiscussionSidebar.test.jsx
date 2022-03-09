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
import { threadsApiUrl } from '../posts/data/api';
import {
  fetchThreads,
} from '../posts/data/thunks';
import DiscussionSidebar from './DiscussionSidebar';

import '../posts/data/__factories__';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
let axiosMock;

function renderComponent(displaySidebar = true, location = `/${courseId}/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter initialEntries={[location]}>
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

    store = initializeStore({
      blocks: { blocks: { 'test-usage-key': { topics: ['some-topic-2', 'some-topic-0'] } } },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });
  afterEach(() => {
    axiosMock.reset();
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

  test('User with some topics should be redirected to "My Topics"', async () => {
    const myOwnthreads = Factory.build('threadsResult', {}, {});
    axiosMock.onGet(threadsApiUrl)
      .reply(200, myOwnthreads);
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    renderComponent(true);
    expect(await screen.queryByText('All posts by recent activity', { exact: false })).not.toBeInTheDocument();
    expect(await screen.queryByText('Own posts by recent activity', { exact: false })).toBeInTheDocument();
  });
  test('User with no posts should be redirected to "All Topics"', async () => {
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult', {}, { filterAuthor: 'test_user' }));
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    renderComponent();
    expect(await screen.queryByText('All posts by recent activity', { exact: false })).toBeInTheDocument();
    expect(await screen.queryByText('Own posts by recent activity', { exact: false })).not.toBeInTheDocument();
  });
});
