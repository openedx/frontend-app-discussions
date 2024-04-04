import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import DiscussionContext from '../common/context';
import { selectCoursewareTopics, selectNonCoursewareTopics } from './data/selectors';
import fetchCourseTopics from './data/thunks';
import TopicsView from './TopicsView';

import './data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
let store;
let axiosMock;
let lastLocation;
let container;

const LocationComponent = () => {
  lastLocation = useLocation();
  return null;
};

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <DiscussionContext.Provider value={{ courseId }}>
          <MemoryRouter initialEntries={[`/${courseId}/topics/`]}>
            <Routes>
              <Route path="/:courseId/topics/*" element={<><TopicsView /><LocationComponent /></>} />
              <Route path="/:courseId/category/:category" element={<><TopicsView /><LocationComponent /></>} />
            </Routes>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
}

describe('Legacy Topics View', () => {
  let inContextTopics;
  let globalTopics;
  let categories;
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
      config: { provider: 'legacy', hasModerationPrivileges: true },
      blocks: {
        topics: {},
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    lastLocation = undefined;
  });

  async function setupMockResponse() {
    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, {
        courseware_topics: Factory.buildList('category', 2),
        non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw' }),
      });
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
    const state = store.getState();
    categories = state.topics.categoryIds;
    globalTopics = selectNonCoursewareTopics(state);
    inContextTopics = selectCoursewareTopics(state);
  }

  it('displays non-courseware topics', async () => {
    await setupMockResponse();
    renderComponent();

    globalTopics.forEach(topic => {
      expect(screen.queryByText(topic.name)).toBeInTheDocument();
    });
  });

  it('displays non-courseware outside of a topic group', async () => {
    await setupMockResponse();
    renderComponent();

    categories.forEach(category => {
      // For the new provider categories are blocks so use the display name
      // otherwise use the category itself which is a string
      expect(screen.queryByText(category.displayName || category)).toBeInTheDocument();
    });

    const topicGroups = screen.queryAllByTestId('topic-group');
    // For the new provider there should be a section for archived topics
    expect(topicGroups).toHaveLength(categories.length);
  });

  it('displays courseware topics', async () => {
    await setupMockResponse();
    renderComponent();

    inContextTopics.forEach(topic => {
      expect(screen.queryByText(topic.name)).toBeInTheDocument();
    });
  });

  it('clicking on courseware topic (category) takes to category page', async () => {
    await setupMockResponse();
    renderComponent();

    const categoryName = categories[0].displayName || categories[0];
    const categoryPath = categoryName;
    const topic = await screen.findByText(categoryName);
    fireEvent.click(topic);
    expect(lastLocation.pathname.endsWith(`/category/${categoryPath}`)).toBeTruthy();
  });

  it('should display Unnamed category message for undefined groupId', async () => {
    const mockData = {
      courseware_topics: Factory.buildList('category', 2),
      non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw' }),
    };
    mockData.courseware_topics[0].name = '';

    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, mockData);
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
    await renderComponent();

    expect(await screen.findByText('Unnamed category')).toBeInTheDocument();
  });

  it('should select the specific topic', async () => {
    await setupMockResponse();
    renderComponent();

    const topic = await container.querySelector('[data-topic-id="ncwtopic-5"]');

    await act(async () => {
      fireEvent.click(topic);
    });
    await waitFor(() => {
      expect(lastLocation.pathname.endsWith('/ncwtopic-5')).toBeTruthy();
    });
  });

  it(`should display reported and previously reported messages by enabling canSeeReportedStats along with
  activeFlags and inactiveFlags`, async () => {
    await setupMockResponse();
    renderComponent();

    const reportedIcon = await waitFor(() => container.querySelector('.text-danger'));
    await act(async () => fireEvent.mouseEnter(reportedIcon));

    expect(reportedIcon).toBeInTheDocument();
    expect(screen.getByText('2 reported')).toBeInTheDocument();
    expect(screen.getByText('1 previously reported')).toBeInTheDocument();
  });
});
