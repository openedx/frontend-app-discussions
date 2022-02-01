import { fireEvent, render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getBlocksAPIResponse } from '../../data/__factories__';
import { blocksAPIURL } from '../../data/api';
import { API_BASE_URL } from '../../data/constants';
import { selectSequences } from '../../data/selectors';
import { fetchCourseBlocks } from '../../data/thunks';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { selectCoursewareTopics, selectNonCoursewareTopics } from './data/selectors';
import { fetchCourseTopics } from './data/thunks';
import TopicsView from './TopicsView';

import './data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const topicsApiUrl = `${API_BASE_URL}/api/discussion/v1/course_topics/${courseId}`;
const topicsv2ApiUrl = `${API_BASE_URL}/api/discussion/v2/course_topics/${courseId}`;
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
  describe.each(['legacy', 'openedx'])('%s provider', (provider) => {
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
        config: { provider },
        blocks: {
          topics: {},
        },
      });
      Factory.resetAll();
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      lastLocation = undefined;
    });

    async function setupMockResponse() {
      if (provider === 'legacy') {
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
      } else {
        const blocksAPIResponse = getBlocksAPIResponse(true);
        const ids = Object.values(blocksAPIResponse.blocks).filter(block => block.type === 'vertical')
          .map(block => block.block_id);
        const data = [
          ...Factory.buildList('topic.v2', 2, { usage_key: null }, { topicPrefix: 'ncw' }),
          ...ids.map(id => Factory.build('topic.v2', { id })),
        ];

        axiosMock
          .onGet(topicsv2ApiUrl)
          .reply(200, data);
        axiosMock.onGet(blocksAPIURL)
          .reply(200, getBlocksAPIResponse(true));
        axiosMock.onAny().networkError();
        await executeThunk(fetchCourseBlocks(courseId, 'abc123'), store.dispatch, store.getState);
        await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
        const state = store.getState();
        categories = selectSequences(state);
        globalTopics = selectNonCoursewareTopics(state);
        inContextTopics = selectCoursewareTopics(state);
      }
    }

    it('displays non-courseware topics', async () => {
      await setupMockResponse();
      renderComponent();

      globalTopics.forEach(topic => {
        expect(screen.queryByText(topic.name)).toBeInTheDocument();
      });
    });

    it('displays non-courseware in outside of a topic group', async () => {
      await setupMockResponse();
      renderComponent();

      categories.forEach(category => {
        // For the new provider categories are blocks so use the display name
        // otherwise use the category itself which is a string
        expect(screen.queryByText(category.displayName || category)).toBeInTheDocument();
      });

      const topicGroups = screen.queryAllByTestId('topic-group');
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
      const categoryPath = provider === 'legacy' ? categoryName : categories[0].id;
      const topic = await screen.findByText(categoryName);
      fireEvent.click(topic);
      expect(lastLocation.pathname.endsWith(`/category/${categoryPath}`)).toBeTruthy();
    });
  });
});
