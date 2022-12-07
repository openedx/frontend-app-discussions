import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { DiscussionContext } from '../common/context';
import { fetchConfigSuccess } from '../data/slices';
import { getThreadsApiUrl } from '../posts/data/api';
import DiscussionSidebar from './DiscussionSidebar';

import '../posts/data/__factories__';

let store;
let container;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const threadsApiUrl = getThreadsApiUrl();
let axiosMock;

function renderComponent(displaySidebar = true, location = `/${courseId}/`) {
  const wrapper = render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <DiscussionContext.Provider value={{ courseId }}>
            <MemoryRouter initialEntries={[location]}>
              <DiscussionSidebar displaySidebar={displaySidebar} postActionBarRef={null} />
            </MemoryRouter>
          </DiscussionContext.Provider>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
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
    store.dispatch(fetchConfigSuccess({}));
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

  test('User will be redirected to "All Posts" by default', async () => {
    axiosMock.onGet(threadsApiUrl)
      .reply(({ params }) => [200, Factory.build('threadsResult', {}, {
        threadAttrs: {
          title: `Thread by ${params.author || 'other users'}`,
          previewBody: 'thread preview body',
        },
      })]);
    renderComponent();
    await act(async () => expect(await screen.findAllByText('Thread by other users')).toBeTruthy());
    expect(screen.queryByText('Thread by abc123')).not.toBeInTheDocument();
  });

  test('Display discussion posts should equal to post count in "All Posts"', async () => {
    const postCount = 5;
    axiosMock.onGet(threadsApiUrl)
      .reply(({ params }) => [200, Factory.build('threadsResult', {}, {
        count: postCount,
        threadAttrs: {
          title: `Thread by ${params.author || 'other users'}`,
          previewBody: 'thread preview body',
        },
      })]);
    renderComponent();
    await act(async () => expect(await screen.findAllByText('Thread by other users')).toBeTruthy());
    expect(screen.queryByText('Thread by abc123')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.discussion-post')).toHaveLength(postCount);
  });
});
