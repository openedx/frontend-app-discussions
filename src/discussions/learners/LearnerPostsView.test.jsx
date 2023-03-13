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

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { DiscussionContext } from '../common/context';
import { learnerPostsApiUrl } from './data/api';
import { fetchUserPosts } from './data/thunks';
import LearnerPostsView from './LearnerPostsView';
import { setUpPrivilages } from './test-utils';

import './data/__factories__';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
const username = 'abc123';
let container;
let lastLocation;

async function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{
            learnerUsername: username,
            courseId,
          }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/learners/${username}/posts`]}>
            <Route path="/:courseId/learners/:learnerUsername/posts">
              <LearnerPostsView />
            </Route>
            <Route
              render={({ location }) => {
                lastLocation = location;
                return null;
              }}
            />
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
}

describe('Learner Posts View', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username,
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(learnerPostsApiUrl(courseId), { username, count_flagged: true })
      .reply(() => [200, Factory.build('learnerPosts', {}, {
        abuseFlaggedCount: 1,
      })]);
    await executeThunk(fetchUserPosts(courseId), store.dispatch, store.getState);
  });

  test('Reported icon is visible to moderator for post with reported comment', async () => {
    await setUpPrivilages(axiosMock, store, true);
    await waitFor(() => { renderComponent(); });

    expect(container.querySelector('[data-testid="reported-post"]')).toBeInTheDocument();
  });

  test('Reported icon is not visible to learner for post with reported comment', async () => {
    await renderComponent();
    expect(screen.queryByTestId('reported-post')).not.toBeInTheDocument();
  });

  test('Learner title bar should display a title bar, a learner name, and a back button', async () => {
    await renderComponent();

    const titleBar = container.querySelector('.discussion-posts:first-child');
    const learnerName = screen.queryByText('Activity for Abc123');
    const backButton = screen.getByLabelText('Back');

    expect(titleBar).toBeInTheDocument();
    expect(learnerName).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  test('Learner title bar should redirect to the learners list when clicking on the back button',
    async () => {
      await renderComponent();

      const backButton = screen.getByLabelText('Back');

      await act(() => fireEvent.click(backButton));
      await waitFor(() => {
        expect(lastLocation.pathname.endsWith('/learners')).toBeTruthy();
      });
    });

  it('should display a post-filter bar and All posts sorted by recent activity text.', async () => {
    await renderComponent();

    const filterBar = container.querySelector('.filter-bar');
    const recentActivity = screen.getByText('All posts sorted by recent activity');

    expect(filterBar).toBeInTheDocument();
    expect(recentActivity).toBeInTheDocument();
  });

  it(`should display a list of the interactive posts of a selected learner and the posts count
     should be equal to the API response count.`, async () => {
    await waitFor(() => {
      renderComponent();
    });
    const posts = await container.querySelectorAll('.discussion-post');

    expect(posts).toHaveLength(2);
    expect(posts).toHaveLength(Object.values(store.getState().threads.threadsById).length);
  });

  it.each([
    { searchBy: 'type-all', result: 2 },
    { searchBy: 'type-discussions', result: 2 },
    { searchBy: 'type-questions', result: 2 },
    { searchBy: 'status-unread', result: 2 },
    { searchBy: 'sort-comments', result: 2 },
    { searchBy: 'sort-votes', result: 2 },
    { searchBy: 'sort-activity', result: 2 },
  ])('successfully display learners by %s.', async ({ searchBy, result }) => {
    await setUpPrivilages(axiosMock, store, true);
    await renderComponent();

    const filterBar = container.querySelector('.collapsible-trigger');
    await act(async () => {
      fireEvent.click(filterBar);
    });

    await waitFor(async () => {
      const activity = container.querySelector(`[for='${searchBy}']`);

      await act(async () => {
        fireEvent.click(activity);
      });
      await waitFor(() => {
        const learners = container.querySelectorAll('.discussion-post');

        expect(learners).toHaveLength(result);
      });
    });
  });
});
