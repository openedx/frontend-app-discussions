import React from 'react';

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { LearnerTabs } from '../../data/constants';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { commentsApiUrl } from '../comments/data/api';
import { DiscussionContext } from '../common/context';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { threadsApiUrl } from '../posts/data/api';
import { coursesApiUrl, userProfileApiUrl } from './data/api';
import { fetchLearners } from './data/thunks';

import '../comments/data/__factories__';
import '../posts/data/__factories__';
import './data/__factories__';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
const testUsername = 'leaner-1';

function renderComponent(username = testUsername) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ learnerUsername: username, courseId }}>
          <MemoryRouter initialEntries={[`/${courseId}/learners/${username}/${LearnerTabs.POSTS}`]}>
            <Route path="/:courseId/learners/:learnerUsername">
              <DiscussionContent />
            </Route>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('LearnersContentView', () => {
  const learnerCount = 1;

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
    store = initializeStore({});
    Factory.resetAll();

    axiosMock.onGet(`${coursesApiUrl}${courseId}/activity_stats/`)
      .reply(
        200,
        Factory.build('learnersResult', {}, {
          count: learnerCount,
          pageSize: 5,
        }),
      );

    axiosMock.onGet(`${userProfileApiUrl}?username=${testUsername}`)
      .reply(
        200,
        Factory.build('learnersProfile', {}, {
          username: [testUsername],
        }).profiles,
      );
    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);

    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult', {}, {
        topicId: undefined,
        count: 6,
        pageSize: 5,
      }));

    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult', {}, {
        count: 9,
        pageSize: 8,
      }));
  });

  test('it loads the posts view by default', async () => {
    await act(async () => {
      await renderComponent();
    });
    expect(screen.queryAllByTestId('post')).toHaveLength(5);
    expect(screen.queryAllByText('This is Thread', { exact: false })).toHaveLength(5);
  });

  test('it renders all the comments WITHOUT parent id in responses tab', async () => {
    await act(async () => {
      await renderComponent();
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Responses', { exact: false }));
    });

    expect(screen.queryAllByText('comment number', { exact: false })).toHaveLength(8);
  });

  test('it renders all the comments with parent id in comments tab', async () => {
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult', {}, {
        count: 4,
        parentId: 'test_parent_id',
      }));
    await act(async () => {
      await renderComponent();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: /Comments \d+/i }));
    });
    expect(screen.queryAllByText('comment number', { exact: false })).toHaveLength(4);
  });

  test('it can switch back to the posts tab', async () => {
    await act(async () => {
      await renderComponent();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: /Responses \d+/i }));
    });
    expect(screen.queryAllByText('comment number', { exact: false })).toHaveLength(8);

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: /Posts \d+/i }));
    });
    await waitFor(() => expect(screen.queryAllByTestId('post')).toHaveLength(5));
  });

  describe('Posts Tab Button', () => {
    it('does not show Report Icon when the learner has NO active flags', async () => {
      await act(async () => {
        await renderComponent('leaner-2');
      });
      const button = screen.getByRole('link', { name: /Posts/i });
      expect(button.innerHTML).not.toContain('svg');
    });

    it('shows the Report Icon when the learner has active Flags', async () => {
      axiosMock.onGet(`${coursesApiUrl}${courseId}/activity_stats/`)
        .reply(() => [200, Factory.build('learnersResult', {}, {
          count: 1,
          pageSize: 5,
          activeFlags: 1,
        })]);
      axiosMock.onGet(`${userProfileApiUrl}?username=leaner-2`)
        .reply(() => [200, Factory.build('learnersProfile', {}, {
          username: ['leaner-2'],
        }).profiles]);
      await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);

      await act(async () => {
        await renderComponent('leaner-2');
      });
      const button = screen.getByRole('link', { name: /Posts/i });
      expect(button.innerHTML).toContain('svg');
    });
  });
});
