import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { API_BASE_URL } from '../../data/constants';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { fetchCourseTopics } from './data/thunks';
import TopicsView from './TopicsView';

import './data/__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const topicsApiUrl = `${API_BASE_URL}/api/discussion/v1/course_topics/${courseId}`;
let store;
let axiosMock;
let lastLocation;

function renderComponent() {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[`/${courseId}/topics/`]}>
          <Route path="/:courseId/topics/">
            <TopicsView />
          </Route>
          <Route path="/:courseId/category/:category">
            <TopicsView />
          </Route>
          <Route
            render={({ location }) => {
              lastLocation = location;
              return null;
            }}
          />
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('TopicsView', () => {
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
      blocks: {
        topics: {},
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    lastLocation = undefined;
  });

  async function setupMockResponse(response) {
    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, response);
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
  }

  it('displays non-courseware topics', async () => {
    setupMockResponse({
      courseware_topics: [],
      non_courseware_topics: Factory.buildList('topic', 3),
    });
    renderComponent();

    await screen.findByText('topic 1');
    expect(screen.queryByText('topic 2')).toBeInTheDocument();
    expect(screen.queryByText('topic 3')).toBeInTheDocument();
  });

  it('displays non-courseware in outside of a topic group', async () => {
    setupMockResponse({
      courseware_topics: [],
      non_courseware_topics: Factory.buildList('topic', 3),
    });
    renderComponent();

    await screen.findByText('topic 1');
    const topicGroups = screen.queryAllByTestId('topic-group');
    expect(topicGroups).toHaveLength(0);
  });

  it('displays courseware topics', async () => {
    setupMockResponse({
      courseware_topics: Factory.buildList('topic', 3),
      non_courseware_topics: [],
    });
    renderComponent();

    await screen.findByText('topic 1');
    expect(screen.queryByText('topic 2')).toBeInTheDocument();
    expect(screen.queryByText('topic 3')).toBeInTheDocument();
  });

  it('displays courseware topics in individual topic groups', async () => {
    setupMockResponse({
      courseware_topics: Factory.buildList('topic', 3),
      non_courseware_topics: [],
    });
    renderComponent();

    await screen.findByText('topic 1');
    const topicGroups = screen.queryAllByTestId('topic-group');
    expect(topicGroups).toHaveLength(3);
  });

  it('clicking on courseware topic (category) takes to category page', async () => {
    setupMockResponse({
      courseware_topics: Factory.buildList('topic', 3),
      non_courseware_topics: Factory.buildList('topic', 3),
    });
    renderComponent();

    const topic = await screen.findByText('topic 1');
    fireEvent.click(topic);

    await waitFor(() => expect(screen.queryByText('topic 2')).not.toBeInTheDocument());
    expect(lastLocation.pathname.endsWith('/category/topic 1')).toBeTruthy();
  });

  it('on category page only selected category and it\'s children are displayed', async () => {
    const category = Factory.build('topic');
    category.children = Factory.buildList('topic', 3);
    setupMockResponse({
      courseware_topics: [
        category,
        Factory.build('topic'),
      ],
      non_courseware_topics: Factory.buildList('topic', 3),
    });
    renderComponent();

    const topic = await screen.findByText('topic 1');
    fireEvent.click(topic);

    await waitFor(() => expect(screen.queryByText('topic 6')).not.toBeInTheDocument());
    // children
    expect(screen.queryByText('topic 2')).toBeInTheDocument();
    expect(screen.queryByText('topic 3')).toBeInTheDocument();
    expect(screen.queryByText('topic 4')).toBeInTheDocument();

    // other courseware topics (categories) and non-courseware topics
    expect(screen.queryByText('topic 5')).not.toBeInTheDocument();
    expect(screen.queryByText('topic 6')).not.toBeInTheDocument();
    expect(screen.queryByText('topic 7')).not.toBeInTheDocument();
    expect(screen.queryByText('topic 8')).not.toBeInTheDocument();
  });
});
