import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
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
import { executeThunk } from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import { getCourseTopicsApiUrl } from '../in-context-topics/data/api';
import { fetchCourseTopicsV3 } from '../in-context-topics/data/thunks';
import navigationBarMessages from '../navigation/navigation-bar/messages';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import DiscussionsHome from './DiscussionsHome';

import '../posts/data/__factories__/threads.factory';
import '../in-context-topics/data/__factories__/inContextTopics.factory';

const courseConfigApiUrl = getCourseConfigApiUrl();
let axiosMock;
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
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
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, { provider: 'openedx' });
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    renderComponent(`/${courseId}/topics?inContextSidebar`);

    expect(screen.queryByText(navigationBarMessages.allTopics.defaultMessage))
      .not
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' }))
      .toBeInTheDocument();
  });

  test('the close button should post a message', async () => {
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, { provider: 'openedx' });
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    const { parent } = window;
    delete window.parent;
    window.parent = { ...window, postMessage: jest.fn() };
    renderComponent(`/${courseId}/topics?inContextSidebar`);

    const closeButton = screen.queryByRole('button', { name: 'Close' });

    await act(async () => {
      fireEvent.click(closeButton);
    });

    await waitFor(() => expect(window.parent.postMessage).toHaveBeenCalled());
    window.parent = parent;
  });

  test('header, course navigation bar and footer are only visible in Discussions MFE', async () => {
    renderComponent();
    expect(screen.queryByRole('banner')).toBeInTheDocument();
    expect(document.getElementById('courseTabsNavigation')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).toBeInTheDocument();
  });

  it.each([
    { searchByEndPoint: 'category/unit-1' },
    { searchByEndPoint: 'topics/topic-1' },
  ])('should display add a post message for empty topics', async ({ searchByEndPoint }) => {
    await renderComponent(`/${courseId}/${searchByEndPoint}?inContextSidebar`);

    expect(screen.queryByText('Add a post')).toBeInTheDocument();
  });

  it.each([
    { searchByEndPoint: 'category/section-topic-1' },
    { searchByEndPoint: 'topics/topic-1' },
  ])(`should display No post selected message on posts pages when user has yet to select a post to display
  for topics`, async ({ searchByEndPoint }) => {
    axiosMock.onGet(getThreadsApiUrl())
      .reply(() => {
        const threadAttrs = { previewBody: 'thread preview body' };
        return [200, Factory.build('threadsResult', {}, {
          topicId: 'noncourseware-topic-1',
          threadAttrs,
          count: 3,
        })];
      });
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);

    await renderComponent(`/${courseId}/${searchByEndPoint}?inContextSidebar`);

    expect(screen.queryByText('No post selected')).toBeInTheDocument();
  });

  it.each([
    { searchByEndPoint: 'category/section-topic-1' },
    { searchByEndPoint: 'topics' },
  ])('should display No Topic selected message on topic pages when user has yet to select a topic',
    async ({ searchByEndPoint }) => {
      axiosMock.onGet(`${getCourseTopicsApiUrl()}${courseId}`)
        .reply(200, (Factory.buildList('topic', 1, null, {
          topicPrefix: 'noncourseware-topic',
          enabledInContext: true,
          topicNamePrefix: 'general-topic',
          usageKey: '',
          courseware: false,
          discussionCount: 1,
          questionCount: 1,
        }).concat(Factory.buildList('section', 2, null, { topicPrefix: 'courseware' })))
          .concat(Factory.buildList('archived-topics', 2, null)));
      await executeThunk(fetchCourseTopicsV3(courseId), store.dispatch, store.getState);

      await renderComponent(`/${courseId}/${searchByEndPoint}?inContextSidebar`);

      expect(screen.queryByText('No topic selected')).toBeInTheDocument();
    });
});
