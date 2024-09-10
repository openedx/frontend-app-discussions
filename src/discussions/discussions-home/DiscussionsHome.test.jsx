import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getCourseMetadataApiUrl } from '../../components/NavigationBar/data/api';
import fetchTab from '../../components/NavigationBar/data/thunks';
import { getApiBaseUrl } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCourseConfigApiUrl, getDiscussionsConfigUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import { getCourseTopicsApiUrl } from '../in-context-topics/data/api';
import fetchCourseTopicsV3 from '../in-context-topics/data/thunks';
import navigationBarMessages from '../navigation/navigation-bar/messages';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import fetchCourseTopics from '../topics/data/thunks';
import DiscussionsHome from './DiscussionsHome';

import '../posts/data/__factories__/threads.factory';
import '../in-context-topics/data/__factories__/inContextTopics.factory';
import '../topics/data/__factories__/topics.factory';
import '../../components/NavigationBar/data/__factories__/navigationBar.factory';

const courseConfigApiUrl = getCourseConfigApiUrl();
let axiosMock;
let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
let container;

function renderComponent(location = `/${courseId}/`) {
  const wrapper = render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store} wrapWithRouter={false}>
          <MemoryRouter initialEntries={[location]}>
            <DiscussionsHome />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
  container = wrapper.container;
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
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: true })));
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);
  });

  async function setUpV1TopicsMockResponse() {
    axiosMock
      .onGet(`${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`)
      .reply(200, {
        courseware_topics: Factory.buildList('category', 2),
        non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw' }),
      });
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
  }

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
    waitFor(() => expect(screen.queryByRole('banner')).toBeInTheDocument());
    expect(document.getElementById('courseTabsNavigation')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).toBeInTheDocument();
  });

  it.each([
    { searchByEndPoint: 'category/unit-1' },
    { searchByEndPoint: 'topics/topic-1' },
  ])('should display add a post message for inContext empty topics %s', async ({ searchByEndPoint }) => {
    axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
      enableInContext: true, provider: 'openedx', hasModerationPrivileges: true,
    });
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await renderComponent(`/${courseId}/${searchByEndPoint}`);

    waitFor(() => {
      expect(screen.queryByText('Add a post')).toBeInTheDocument();
    });
  });

  it.each([
    { searchByEndPoint: 'category/section-topic-1', result: 'Add a post' },
    { searchByEndPoint: 'topics/topic-1', result: 'No post selected' },
  ])(`should display No post selected message on posts pages when user has yet to select a post to display
  for incontext topics %s`, async ({ searchByEndPoint, result }) => {
    axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
      enableInContext: true, provider: 'openedx', hasModerationPrivileges: true,
    });
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
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
    await renderComponent(`/${courseId}/${searchByEndPoint}`);

    waitFor(() => {
      expect(screen.queryByText(result)).toBeInTheDocument();
    });
  });

  it.each([
    { searchByEndPoint: 'category/section-topic-1' },
    { searchByEndPoint: 'topics' },
  ])(
    'should display No Topic selected message on inContext topic pages when user has yet to select a topic %s',
    async ({ searchByEndPoint }) => {
      axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
        enableInContext: true, provider: 'openedx', hasModerationPrivileges: true,
      });
      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
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
      await renderComponent(`/${courseId}/${searchByEndPoint}`);

      waitFor(() => {
        expect(screen.queryByText('No topic selected')).toBeInTheDocument();
      });
    },
  );

  it('should display empty page message for empty learners list', async () => {
    axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await renderComponent(`/${courseId}/learners`);

    waitFor(() => {
      expect(screen.queryByText('Nothing here yet')).toBeInTheDocument();
    });
  });

  it('should display post editor form when click on add a post button for posts', async () => {
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await renderComponent(`/${courseId}/my-posts`);

    const addPost = await screen.findByText('Add a post');

    await act(async () => {
      fireEvent.click(addPost);
    });

    await waitFor(() => expect(container.querySelector('.post-form')).toBeInTheDocument());
  });

  it('should display post editor form when click on add a post button in legacy topics view', async () => {
    axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
      enable_in_context: false, hasModerationPrivileges: true,
    });
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await renderComponent(`/${courseId}/topics`);

    await waitFor(() => expect(screen.queryByText('Nothing here yet')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.queryByText('Add a post'));
    });

    await waitFor(() => expect(container.querySelector('.post-form')).toBeInTheDocument());
  });

  it('should display Add a post button for legacy topics view', async () => {
    await renderComponent(`/${courseId}/topics/topic-1`);

    await waitFor(() => expect(screen.queryByText('Add a post')).toBeInTheDocument());
  });

  it('should display No post selected for legacy topics view', async () => {
    await setUpV1TopicsMockResponse();
    await renderComponent(`/${courseId}/topics/category-1-topic-1`);

    await waitFor(() => expect(screen.queryByText('No post selected')).toBeInTheDocument());
  });

  it('should display No topic selected for legacy topics view', async () => {
    await setUpV1TopicsMockResponse();
    await renderComponent(`/${courseId}/topics`);

    await waitFor(() => expect(screen.queryByText('No topic selected')).toBeInTheDocument());
  });

  it('should display navigation tabs', async () => {
    renderComponent(`/${courseId}/topics`);

    await waitFor(() => expect(screen.queryByText('Discussion')).toBeInTheDocument());
  });

  it('should display content unavailable message when the user is not enrolled in the course.', async () => {
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: false })));
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    renderComponent();

    await waitFor(() => expect(screen.queryByText('Content unavailable')).toBeInTheDocument());
  });

  it('should redirect to dashboard when the user clicks on the Enroll button.', async () => {
    const replaceMock = jest.fn();
    delete window.location;
    window.location = { replace: replaceMock };

    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: false })));
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    renderComponent();

    const enrollButton = await screen.findByText('Enroll');

    await act(async () => {
      fireEvent.click(enrollButton);
    });

    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledWith(expect.stringContaining('about'));
    });
  });
});
