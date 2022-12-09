import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl, Routes } from '../../../data/constants';
import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getCohortsApiUrl } from '../../cohorts/data/api';
import { DiscussionContext } from '../../common/context';
import { fetchCourseTopics } from '../../topics/data/thunks';
import { getThreadsApiUrl } from '../data/api';
import { fetchThread } from '../data/thunks';
import { PostEditor } from '../index';

import '../../cohorts/data/__factories__';
import '../../data/__factories__';
import '../../topics/data/__factories__';
import '../data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
const threadsApiUrl = getThreadsApiUrl();
let store;
let axiosMock;

async function renderComponent(editExisting = false, location = `/${courseId}/posts/`) {
  const path = editExisting ? Routes.POSTS.EDIT_POST : Routes.POSTS.NEW_POSTS;
  await render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId, category: null }}
        >
          <MemoryRouter initialEntries={[location]}>
            <Route path={path}>
              <PostEditor editExisting={editExisting} />
            </Route>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('PostEditor', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const cwtopics = Factory.buildList('category', 2);
    Factory.reset('topic');
    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, {
        courseware_topics: cwtopics,
        non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw-' }),
      });
  });
  describe.each([
    {
      allowAnonymous: false,
      allowAnonymousToPeers: false,
    },
    {
      allowAnonymous: false,
      allowAnonymousToPeers: true,
    },
    {
      allowAnonymous: true,
      allowAnonymousToPeers: false,
    },
    {
      allowAnonymous: true,
      allowAnonymousToPeers: true,
    },
  ])('anonymous posting', ({
    allowAnonymous,
    allowAnonymousToPeers,
  }) => {
    beforeEach(async () => {
      store = initializeStore({
        config: {
          provider: 'legacy',
          allowAnonymous,
          allowAnonymousToPeers,
          moderationSettings: {},
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
    });
    test(
      `new post when anonymous posts are ${allowAnonymous ? '' : 'not '}allowed and anonymous posts to peers are ${allowAnonymousToPeers ? '' : 'not '}allowed`,
      async () => {
        await renderComponent();

        expect(screen.queryByRole('heading'))
          .toHaveTextContent('Add a post');
        expect(screen.queryAllByRole('radio'))
          .toHaveLength(2);
        // 2 categories with 4 subcategories each
        expect(screen.queryAllByText(/category-\d-topic \d/))
          .toHaveLength(8);
        // 3 non courseare topics
        expect(screen.queryAllByText(/ncw-topic \d/))
          .toHaveLength(3);

        expect(screen.queryByText('cohort', { exact: false }))
          .not.toBeInTheDocument();
        if (allowAnonymous) {
          expect(screen.queryByText('Post anonymously'))
            .not.toBeInTheDocument();
        } else {
          expect(screen.queryByText('Post anonymously'))
            .not.toBeInTheDocument();
        }
        if (allowAnonymousToPeers) {
          expect(screen.queryByText('Post anonymously to peers'))
            .toBeInTheDocument();
        } else {
          expect(screen.queryByText('Post anonymously to peers'))
            .not
            .toBeInTheDocument();
        }
      },
    );
  });

  describe('cohorting', () => {
    const dividedncw = ['ncw-topic-2'];
    const dividedcw = ['category-1-topic-2', 'category-2-topic-1', 'category-2-topic-2'];

    beforeEach(async () => {
      axiosMock.onGet(getCohortsApiUrl(courseId))
        .reply(200, Factory.buildList('cohort', 3));
    });

    async function setupData(config = {}, settings = {}) {
      store = initializeStore({
        config: {
          provider: 'legacy',
          userRoles: ['Student', 'Moderator'],
          hasModerationPrivileges: true,
          settings: {
            dividedInlineDiscussions: dividedcw,
            dividedCourseWideDiscussions: dividedncw,
            ...settings,
          },
          ...config,
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
    }

    test('test privileged user', async () => {
      await setupData();
      await renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', {
        name: /cohort visibility/i,
      }))
        .not
        .toBeInTheDocument();
      // If a cohorted topic is selected, the cohort visibility selector is displayed
      ['ncw-topic 2', 'category-1-topic 2', 'category-2-topic 1', 'category-2-topic 2'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });

        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .toBeInTheDocument();
      });
      // Now if a non-cohorted topic is selected, the cohort visibility selector is hidden
      ['ncw-topic 1', 'category-1-topic 1', 'category-2-topic 4'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('test always divided inline', async () => {
      await setupData({}, { alwaysDivideInlineDiscussions: true });
      await renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', {
        name: /cohort visibility/i,
      }))
        .not
        .toBeInTheDocument();
      // All coursweare topics are divided
      [1, 2].forEach(catId => {
        [1, 2, 3, 4].forEach((topicId) => {
          act(() => {
            userEvent.selectOptions(
              screen.getByRole('combobox', {
                name: /topic area/i,
              }),
              screen.getByRole('option', { name: `category-${catId}-topic ${topicId}` }),
            );
          });

          expect(screen.queryByRole('combobox', {
            name: /cohort visibility/i,
          }))
            .toBeInTheDocument();
        });
      });

      // Non-courseware topics can still have cohort visibility hidden
      ['ncw-topic 1', 'ncw-topic 3'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('test unprivileged user', async () => {
      await setupData({ hasModerationPrivileges: false });
      await renderComponent();
      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('edit existing post should not show cohort selector to unprivileged users', async () => {
      const threadId = 'thread-1';
      await setupData({ hasModerationPrivileges: false });
      axiosMock.onGet(`${threadsApiUrl}${threadId}/`)
        .reply(200, Factory.build('thread'));
      await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('cancel posting of existing post', async () => {
      const threadId = 'thread-1';
      await setupData();
      axiosMock.onGet(`${threadsApiUrl}${threadId}/`)
        .reply(200, Factory.build('thread'));
      await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Edit codes', () => {
    const threadId = 'thread-1';
    beforeEach(async () => {
      const dividedncw = ['ncw-topic-2'];
      const dividedcw = ['category-1-topic-2', 'category-2-topic-1', 'category-2-topic-2'];

      store = initializeStore({
        config: {
          provider: 'legacy',
          hasModerationPrivileges: true,
          reasonCodesEnabled: true,
          editReasons: [
            {
              code: 'reason-1',
              label: 'Reason 1',
            },
            {
              code: 'reason-2',
              label: 'Reason 2',
            },
          ],
          settings: {
            dividedInlineDiscussions: dividedcw,
            dividedCourseWideDiscussions: dividedncw,
          },
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
      axiosMock.onGet(`${threadsApiUrl}${threadId}/`)
        .reply(200, Factory.build('thread'));
      await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
    });
    test('Edit post and see reasons', async () => {
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      expect(screen.queryByRole('combobox', {
        name: /reason for editing/i,
      }))
        .toBeInTheDocument();
      expect(screen.getAllByRole('option', {
        name: /reason \d/i,
      })).toHaveLength(2);
    });
  });
});
