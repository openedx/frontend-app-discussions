import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { API_BASE_URL, Routes } from '../../../data/constants';
import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { fetchCourseTopics } from '../../topics/data/thunks';
import { threadsApiUrl } from '../data/api';
import { fetchThread } from '../data/thunks';
import { PostEditor } from '../index';

import '../../cohorts/data/__factories__';
import '../../data/__factories__';
import '../../topics/data/__factories__';
import '../data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${API_BASE_URL}/api/discussion/v1/course_topics/${courseId}`;
let store;
let axiosMock;

async function renderComponent(editExisting = false, location = `/${courseId}/posts/`) {
  const path = editExisting ? Routes.POSTS.EDIT_POST : Routes.POSTS.NEW_POSTS;
  await render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[location]}>
          <Route path={path}>
            <PostEditor editExisting={editExisting} />
          </Route>
        </MemoryRouter>
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
  ])('Non-Cohorted', ({
    allowAnonymous,
    allowAnonymousToPeers,
  }) => {
    beforeEach(async () => {
      store = initializeStore({
        config: {
          provider: 'legacy',
          allowAnonymous,
          allowAnonymousToPeers,
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
          .not
          .toBeInTheDocument();
        if (allowAnonymous) {
          expect(screen.queryByText('Post anonymously'))
            .toBeInTheDocument();
        } else {
          expect(screen.queryByText('Post anonymously'))
            .not
            .toBeInTheDocument();
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

  describe('Cohorted', () => {
    const dividedncw = ['ncw-topic-2'];
    const dividedcw = ['category-1-topic-2', 'category-2-topic-1', 'category-2-topic-2'];

    async function setupData(config = {}, settings = {}) {
      store = initializeStore({
        config: {
          provider: 'legacy',
          userRoles: ['Student', 'Moderator'],
          userIsPrivileged: true,
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
      renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', {
        name: /cohort visibility/i,
      }))
        .not
        .toBeInTheDocument();
      // If a cohorted topic is selected, the cohort visibility selector is displayed
      ['ncw-topic 2', 'category-1-topic 2', 'category-2-topic 1', 'category-2-topic 2'].forEach((topicName) => {
        userEvent.selectOptions(
          screen.getByRole('combobox', {
            name: /topic area/i,
          }),
          screen.getByRole('option', { name: topicName }),
        );

        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .toBeInTheDocument();
      });
      // Now if a non-cohorted topic is selected, the cohort visibility selector is hidden
      ['ncw-topic 1', 'category-1-topic 1', 'category-2-topic 4'].forEach((topicName) => {
        userEvent.selectOptions(
          screen.getByRole('combobox', {
            name: /topic area/i,
          }),
          screen.getByRole('option', { name: topicName }),
        );
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('test always divided inline', async () => {
      await setupData({}, { alwaysDivideInlineDiscussions: true });
      renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', {
        name: /cohort visibility/i,
      }))
        .not
        .toBeInTheDocument();
      // All coursweare topics are divided
      [1, 2].forEach(catId => {
        [1, 2, 3, 4].forEach((topicId) => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: `category-${catId}-topic ${topicId}` }),
          );

          expect(screen.queryByRole('combobox', {
            name: /cohort visibility/i,
          }))
            .toBeInTheDocument();
        });
      });

      // Non-courseware topics can still have cohort visibility hidden
      ['ncw-topic 1', 'ncw-topic 3'].forEach((topicName) => {
        userEvent.selectOptions(
          screen.getByRole('combobox', {
            name: /topic area/i,
          }),
          screen.getByRole('option', { name: topicName }),
        );
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('test unprivileged user', async () => {
      await setupData({ userIsPrivileged: false });
      renderComponent();
      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        userEvent.selectOptions(
          screen.getByRole('combobox', {
            name: /topic area/i,
          }),
          screen.getByRole('option', { name: topicName }),
        );
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
    test('edit existing post should not show cohort selector', async () => {
      const threadId = 'thread-1';
      await setupData();
      axiosMock.onGet(`${threadsApiUrl}${threadId}/`)
        .reply(200, Factory.build('thread'));
      await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        userEvent.selectOptions(
          screen.getByRole('combobox', {
            name: /topic area/i,
          }),
          screen.getByRole('option', { name: topicName }),
        );
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', {
          name: /cohort visibility/i,
        }))
          .not
          .toBeInTheDocument();
      });
    });
  });
});
