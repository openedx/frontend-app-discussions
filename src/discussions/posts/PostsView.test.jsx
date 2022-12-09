import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import {
  generatePath, MemoryRouter, Route, Switch,
} from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { Routes, ThreadType } from '../../data/constants';
import { initializeStore } from '../../store';
import { getCohortsApiUrl } from '../cohorts/data/api';
import { DiscussionContext } from '../common/context';
import { fetchConfigSuccess } from '../data/slices';
import { getCoursesApiUrl } from '../learners/data/api';
import { getThreadsApiUrl } from './data/api';
import { PostsView } from './index';

import './data/__factories__';
import '../cohorts/data/__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const coursesApiUrl = getCoursesApiUrl();
const threadsApiUrl = getThreadsApiUrl();
let store;
let axiosMock;
const username = 'abc123';

async function renderComponent({
  postId, topicId, category, myPosts, inContext = false,
} = { myPosts: false }) {
  let path = generatePath(Routes.POSTS.ALL_POSTS, { courseId });
  let page;
  if (postId) {
    path = generatePath(Routes.POSTS.ALL_POSTS, { courseId, postId });
    page = 'posts';
  } else if (topicId) {
    path = generatePath(Routes.POSTS.PATH, { courseId, topicId });
    page = 'posts';
  } else if (category) {
    path = generatePath(Routes.TOPICS.CATEGORY, { courseId, category });
    page = 'category';
  } else if (myPosts) {
    path = generatePath(Routes.POSTS.MY_POSTS, { courseId });
    page = 'my-posts';
  }
  await render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <DiscussionContext.Provider value={{
            courseId,
            postId,
            topicId,
            category,
            page,
            inContext,
          }}
          >
            <Switch>
              <Route path={Routes.POSTS.MY_POSTS}>
                <PostsView />
              </Route>
              <Route
                path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.TOPICS.CATEGORY]}
                component={PostsView}
              />
            </Switch>
          </DiscussionContext.Provider>
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('PostsView', () => {
  const threadCount = 6;
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username,
        administrator: true,
        roles: [],
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(getCohortsApiUrl(courseId)).reply(200, Factory.buildList('cohort', 1));
    axiosMock.onGet(threadsApiUrl)
      .reply((args) => {
        const threadAttrs = { previewBody: 'thread preview body' };
        if (args.params.author) {
          threadAttrs.author = args.params.author;
        }
        return [200, Factory.build('threadsResult', {}, {
          topicId: undefined,
          count: threadCount,
          threadAttrs,
          pageSize: 6,
        })];
      });
  });

  function setupStore(data = {}) {
    const storeData = {
      blocks: { blocks: { 'test-usage-key': { topics: ['some-topic-2', 'some-topic-0'] } } },
      config: { hasModerationPrivileges: true },
      ...data,
    };
    // console.log(storeData);
    store = initializeStore(storeData);
    store.dispatch(fetchConfigSuccess({}));
  }

  describe('Basic', () => {
    test('displays a list of all posts', async () => {
      setupStore();
      await act(async () => {
        await renderComponent();
      });
      expect(screen.getAllByText(/this is thread-\d+/i)).toHaveLength(threadCount);
    });

    test('displays a list of user posts', async () => {
      setupStore();
      axiosMock.onGet(`${coursesApiUrl}${courseId}/learner/`, { username, count_flagged: true })
        .reply(() => {
          const threadAttrs = { previewBody: 'thread preview body', author: username };
          return [200, Factory.build('threadsResult', {}, {
            topicId: undefined,
            count: threadCount,
            threadAttrs,
            pageSize: 6,
          })];
        });

      await act(async () => {
        await renderComponent({ myPosts: true });
      });

      expect(screen.getAllByText('abc123')).toHaveLength(threadCount);
    });

    test('displays a list of posts in a topic', async () => {
      setupStore();
      await act(async () => {
        await renderComponent({ topicId: 'some-topic-1' });
      });
      expect(screen.getAllByText(/this is thread-\d+ in topic some-topic-1/i)).toHaveLength(Math.ceil(threadCount / 3));
    });

    test.each([true, false])(
      'displays a list of posts in a category with grouping at subsection = %s',
      async (grouping) => {
        setupStore({
          blocks: {
            blocks: {
              'test-usage-key': {
                type: 'vertical',
                topics: ['some-topic-2', 'some-topic-0'],
                parent: 'test-seq-key',
              },
              'test-seq-key': { type: 'sequential', topics: ['some-topic-0', 'some-topic-1', 'some-topic-2'] },
            },
          },
          config: { groupAtSubsection: grouping, hasModerationPrivileges: true, provider: 'openedx' },
        });
        await act(async () => {
          await renderComponent({ category: 'test-usage-key', inContext: true, p: true });
        });
        const topicThreadCount = Math.ceil(threadCount / 3);
        expect(screen.queryAllByText(/this is thread-\d+ in topic some-topic-2/i))
          .toHaveLength(topicThreadCount);
        expect(screen.queryAllByText(/this is thread-\d+ in topic some-topic-0/i))
          .toHaveLength(topicThreadCount);
        // When grouping is enabled, topic 1 will be shown, but not otherwise.
        expect(screen.queryAllByText(/this is thread-\d+ in topic some-topic-1/i))
          .toHaveLength(grouping ? topicThreadCount : 0);
      },
    );
  });

  describe('Filtering', () => {
    let dropDownButton;

    function lastQueryParams() {
      const { params } = axiosMock.history.get[axiosMock.history.get.length - 1];
      return params;
    }

    beforeEach(async () => {
      setupStore();
      await act(async () => {
        await renderComponent();
      });
      dropDownButton = screen.getByRole('button', {
        name: /all posts sorted by recent activity/i,
      });
      await act(async () => {
        fireEvent.click(dropDownButton);
      });
    });

    test('test that the filter bar works', async () => {
      // 3 type filters: all, discussion, question
      // 5 status filters: any, unread, following, reported, unanswered
      // 3 sort: activity, comments, likes
      // 2 cohort: all groups, 1 api mock response cohort
      expect(screen.queryAllByRole('radio')).toHaveLength(14);
    });

    test('test that the cohorts filter works', async () => {
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Cohort 1'));
      });

      dropDownButton = screen.getByRole('button', {
        name: /All posts in Cohort 1 sorted by recent activity/i,
      });

      expect(dropDownButton).toBeInTheDocument();
    });

    describe.each([
      {
        label: 'Discussions',
        queryParam: { thread_type: ThreadType.DISCUSSION },
      },
      {
        label: 'Questions',
        queryParam: { thread_type: ThreadType.QUESTION },
      },
      {
        label: 'Unread',
        queryParam: { view: 'unread' },
      },
      {
        label: 'Unanswered',
        queryParam: { view: 'unanswered' },
      },
      {
        label: 'Following',
        queryParam: { following: true },
      },
      {
        label: 'Reported',
        queryParam: { flagged: true },
      },
      {
        label: 'Most activity',
        queryParam: { order_by: 'comment_count' },
      },
      {
        label: 'Most likes',
        queryParam: { order_by: 'vote_count' },
      },
      {
        label: 'All groups',
        queryParam: { group_id: undefined },
      },
      {
        label: 'Cohort 1',
        queryParam: { group_id: 'cohort-1' },
      },
    ])(
      'one at a time',
      ({
        label,
        queryParam,
      }) => {
        test(`select "${label}"`, async () => {
          await act(async () => {
            fireEvent.click(screen.getByLabelText(label));
          });
          // Assert that changing the filters results in the correct query
          expect(lastQueryParams()).toMatchObject(queryParam);
        });
      },
    );

    describe.each([
      {
        firstClick: 'Discussions',
        secondClick: 'Unanswered',
        selected: ['Questions', 'Unanswered'],
      },
      {
        firstClick: 'Unanswered',
        secondClick: 'Discussions',
        selected: ['Discussions', 'Any'],
      },
    ])(
      'incompatible combinations',
      ({
        firstClick,
        secondClick,
        selected,
      }) => {
        test(`select "${firstClick}" then "${secondClick}"`, async () => {
          await act(async () => {
            fireEvent.click(screen.getByLabelText(firstClick));
          });
          await act(async () => {
            fireEvent.click(dropDownButton);
          });
          await act(async () => {
            fireEvent.click(screen.getByLabelText(secondClick));
          });
          await act(async () => {
            fireEvent.click(dropDownButton);
          });
          expect(screen.getAllByTestId('selected')[0]).toHaveTextContent(selected[0]);
          expect(screen.getAllByTestId('selected')[1]).toHaveTextContent(selected[1]);
        });
      },
    );
  });
});
