import {
  fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import {
  generatePath, MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { PostActionsBar } from '../../components';
import { Routes as ROUTES } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import DiscussionContext from '../common/context';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { getCourseTopicsApiUrl } from './data/api';
import { selectCoursewareTopics } from './data/selectors';
import fetchCourseTopicsV3 from './data/thunks';
import TopicPostsView from './TopicPostsView';
import TopicsView from './TopicsView';

import './data/__factories__';
import '../posts/data/__factories__/threads.factory';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const threadsApiUrl = getThreadsApiUrl();
const topicsApiUrl = getCourseTopicsApiUrl();
let store;
let axiosMock;
let lastLocation;
let container;

const LocationComponent = () => {
  lastLocation = useLocation();
  return null;
};

async function renderComponent({ topicId, category } = { }) {
  let path = `/${courseId}/topics`;
  if (topicId) {
    path = generatePath(ROUTES.POSTS.PATH, { courseId, topicId });
  } else if (category) {
    path = generatePath(ROUTES.TOPICS.CATEGORY, { courseId, category });
  }
  const wrapper = await render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <DiscussionContext.Provider value={{
          courseId,
          topicId,
          category,
          page: 'topics',
        }}
        >
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              {
                [
                  ROUTES.POSTS.PATH,
                  ROUTES.TOPICS.CATEGORY,
                ].map((route) => (
                  <Route
                    key={route}
                    path={route}
                    element={(
                      <>
                        <TopicPostsView />
                        <LocationComponent />
                      </>
                    )}
                  />
                ))
              }
              <Route
                path={ROUTES.TOPICS.ALL}
                element={(
                  <>
                    <PostActionsBar />
                    <TopicsView />
                    <LocationComponent />
                  </>
                )}
              />
            </Routes>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
}

describe('InContext Topic Posts View', () => {
  let coursewareTopics;

  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      config: {
        enableInContext: true,
        provider: 'openedx',
        hasModerationPrivileges: true,
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    lastLocation = undefined;
  });

  async function setupTopicsMockResponse(topicCount = 1, sectionCount = 2, archivedCount = 2) {
    axiosMock.onGet(`${topicsApiUrl}${courseId}`)
      .reply(200, (Factory.buildList('topic', topicCount, null, {
        topicPrefix: 'noncourseware-topic',
        enabledInContext: true,
        topicNamePrefix: 'general-topic',
        usageKey: '',
        courseware: false,
        discussionCount: 1,
        questionCount: 1,
      })
        .concat(Factory.buildList('section', sectionCount, null, { topicPrefix: 'courseware' })))
        .concat(Factory.buildList('archived-topics', archivedCount, null)));
    await executeThunk(fetchCourseTopicsV3(courseId), store.dispatch, store.getState);

    const state = store.getState();
    coursewareTopics = selectCoursewareTopics(state);
  }

  async function setupPostsMockResponse(topicId, numOfResponses = 3) {
    axiosMock.onGet(threadsApiUrl)
      .reply(() => {
        const threadAttrs = { previewBody: 'thread preview body' };
        return [200, Factory.build('threadsResult', {}, {
          topicId,
          threadAttrs,
          count: numOfResponses,
        })];
      });
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
  }

  test.each([
    { parentId: 'noncourseware-topic-1', parentTitle: 'general-topic-1', topicType: 'NonCourseware' },
    { parentId: 'courseware-topic-1-v3-1', parentTitle: 'Introduction Introduction 1-1-1', topicType: 'Courseware' },
  ])('\'$topicType\' topic should have a required number of post lengths.', async ({ parentId, parentTitle }) => {
    await setupTopicsMockResponse();
    await setupPostsMockResponse(parentId, 3);

    await act(async () => {
      renderComponent({ topicId: parentId });
    });

    await waitFor(async () => {
      const posts = await container.querySelectorAll('.discussion-post');
      const backButton = screen.getByLabelText('Back to topics list');
      const parentHeader = await screen.findByText(parentTitle);

      expect(lastLocation.pathname.endsWith(`/topics/${parentId}`)).toBeTruthy();
      expect(posts).toHaveLength(3);
      expect(backButton).toBeInTheDocument();
      expect(parentHeader).toBeInTheDocument();
    });
  });

  it('A back button should redirect from list of posts to list of units.', async () => {
    await setupTopicsMockResponse();
    const subSection = coursewareTopics[0].children[0];
    const unit = subSection.children[0];

    await act(async () => {
      setupPostsMockResponse(unit.id, 2);
      renderComponent({ topicId: unit.id });
    });

    const backButton = await screen.getByLabelText('Back to topics list');

    await act(async () => fireEvent.click(backButton));
    await waitFor(async () => {
      renderComponent({ category: subSection.id });

      const subSectionList = await container.querySelector('.list-group');
      const units = subSectionList.querySelectorAll('.discussion-topic');
      const unitHeader = within(subSectionList).queryByText(unit.name);

      expect(lastLocation.pathname.endsWith(`/category/${subSection.id}`)).toBeTruthy();
      expect(unitHeader).toBeInTheDocument();
      expect(units).toHaveLength(4);
    });
  });

  it('A back button should redirect from units to the parent/selected subsection.', async () => {
    await setupTopicsMockResponse();
    const subSection = coursewareTopics[0].children[0];

    renderComponent({ category: subSection.id });

    const backButton = await screen.getByLabelText('Back to topics list');

    await act(async () => fireEvent.click(backButton));
    await waitFor(async () => {
      renderComponent();

      const sectionList = await container.querySelector('.list-group');
      const subSections = sectionList.querySelectorAll('.discussion-topic-group');
      const subSectionHeader = within(sectionList).queryByText(subSection.displayName);

      expect(lastLocation.pathname.endsWith('/topics')).toBeTruthy();
      expect(subSectionHeader).toBeInTheDocument();
      expect(subSections).toHaveLength(3);
    });
  });

  test.each([
    { searchText: 'hello world', output: 'Showing 0 results for', resultCount: 0 },
    { searchText: 'introduction', output: 'Showing 8 results for', resultCount: 8 },
  ])(
    'It should have a search bar with a clear button and \'$output\' results found text.',
    async ({ searchText, output, resultCount }) => {
      await setupTopicsMockResponse();
      await renderComponent();

      const searchField = await within(container).getByPlaceholderText('Search topics');
      const searchButton = await within(container).getByTestId('search-icon');
      fireEvent.change(searchField, { target: { value: searchText } });

      await waitFor(async () => expect(searchField).toHaveValue(searchText));
      await act(async () => fireEvent.click(searchButton));
      await waitFor(async () => {
        const clearButton = await within(container).queryByText('Clear results');
        const searchMessage = within(container).queryByText(`${output} "${searchText}"`);
        const units = container.querySelectorAll('.discussion-topic');

        expect(searchMessage).toBeInTheDocument();
        expect(clearButton).toBeInTheDocument();
        expect(units).toHaveLength(resultCount);
      });
    },
  );

  it('When click on the clear button it should move to main topics pages.', async () => {
    await setupTopicsMockResponse();
    await renderComponent();

    const searchText = 'hello world';
    const searchField = await within(container).getByPlaceholderText('Search topics');
    const searchButton = await within(container).getByTestId('search-icon');

    fireEvent.change(searchField, { target: { value: searchText } });

    await waitFor(async () => expect(searchField).toHaveValue(searchText));
    await act(async () => fireEvent.click(searchButton));
    await waitFor(async () => {
      const clearButton = await within(container).queryByText('Clear results');

      await act(async () => fireEvent.click(clearButton));
      await waitFor(async () => {
        const coursewareTopicList = await container.querySelectorAll('.discussion-topic-group');

        expect(coursewareTopicList).toHaveLength(3);
        expect(within(container).queryByText('Clear results')).not.toBeInTheDocument();
      });
    });
  });

  it(
    'should display Nothing here yet and No topic exists message when topics and selectedSubsectionUnits are empty',
    async () => {
      await setupTopicsMockResponse(0, 0, 0);
      await renderComponent({ topicId: 'test-topic', category: 'test-category' });

      await waitFor(() => expect(within(container).queryByText('Nothing here yet')).toBeInTheDocument());
      expect(within(container).queryByText('No topic exists')).toBeInTheDocument();
      expect(within(container).queryByText('Unnamed Topic')).toBeInTheDocument();
    },
  );

  it('should display all topics when search by an empty search string', async () => {
    await setupTopicsMockResponse();
    await renderComponent();

    const searchField = await within(container).getByPlaceholderText('Search topics');
    fireEvent.change(searchField, { target: { value: '' } });

    await act(async () => fireEvent.click(within(container).getByTestId('search-icon')));
    await waitFor(() => {
      expect(within(container).queryByText('Clear results')).not.toBeInTheDocument();
      expect(container.querySelectorAll('.discussion-topic')).toHaveLength(3);
    });
  });
});
