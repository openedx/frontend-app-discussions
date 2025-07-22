import React from 'react';

import {
  fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCohortsApiUrl } from '../cohorts/data/api';
import fetchCourseCohorts from '../cohorts/data/thunks';
import DiscussionContext from '../common/context';
import { deletePostsApiUrl, learnerPostsApiUrl } from './data/api';
import { fetchUserPosts } from './data/thunks';
import LearnerPostsView from './LearnerPostsView';
import { setUpPrivilages } from './test-utils';

import '../cohorts/data/__factories__/cohorts.factory';
import './data/__factories__';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
const username = 'abc123';
let container;
let lastLocation;

const LocationComponent = () => {
  lastLocation = useLocation();
  return null;
};

async function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <DiscussionContext.Provider
          value={{
            learnerUsername: username,
            courseId,
            page: 'learners',
          }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/learners/${username}/posts`]}>
            <Routes>
              <Route path="/:courseId/learners/:learnerUsername?/posts?" element={<><LearnerPostsView /><LocationComponent /></>} />
            </Routes>
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

  afterEach(() => {
    axiosMock.reset();
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

  test(
    'Learner title bar should redirect to the learners list when clicking on the back button',
    async () => {
      await renderComponent();

      const backButton = screen.getByLabelText('Back');

      await act(async () => {
        fireEvent.click(backButton);
      });
      await waitFor(() => {
        expect(lastLocation.pathname.endsWith('/learners')).toBeTruthy();
      });
    },
  );

  it('should display a post-filter bar and All posts sorted by recent activity text.', async () => {
    await renderComponent();

    const filterBar = container.querySelector('.filter-bar');
    const recentActivity = screen.getByText('All posts sorted by recent activity');

    expect(filterBar).toBeInTheDocument();
    expect(recentActivity).toBeInTheDocument();
  });

  it('should display a list of the interactive posts of a selected learner', async () => {
    await waitFor(() => {
      renderComponent();
    });
    const posts = await container.querySelectorAll('.discussion-post');

    expect(posts).toHaveLength(2);
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

  it.each([
    { searchBy: 'type-all', result: 2 },
    { searchBy: 'cohort-1', result: 2 },
  ])('successfully display learners by %s.', async ({ searchBy, result }) => {
    await setUpPrivilages(axiosMock, store, true);
    axiosMock.onGet(getCohortsApiUrl(courseId)).reply(200, Factory.buildList('cohort', 3));

    await executeThunk(fetchCourseCohorts(courseId), store.dispatch, store.getState);
    await renderComponent();

    const filterBar = await container.querySelector('.collapsible-trigger');
    await act(async () => {
      fireEvent.click(filterBar);
    });

    const cohort = await container.querySelector(`[for='${searchBy}']`);

    await act(async () => {
      fireEvent.click(cohort);
    });

    await waitFor(() => {
      const learners = container.querySelectorAll('.discussion-post');
      expect(learners).toHaveLength(result);
    });
  });

  it('should display load more posts button and display more posts by clicking on button.', async () => {
    await renderComponent();
    await waitFor(() => container.querySelector('[data-testid="load-more-posts"]'));

    const loadMoreButton = container.querySelector('[data-testid="load-more-posts"]');

    expect(loadMoreButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    expect(loadMoreButton).not.toBeInTheDocument();
    expect(container.querySelectorAll('.discussion-post')).toHaveLength(4);
  });

  test('should display dropdown menu button for bulk delete user posts for privileged users', async () => {
    await setUpPrivilages(axiosMock, store, true, true);
    await renderComponent();
    expect(within(container).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });

  test('should NOT display dropdown menu button for bulk delete user posts for other users', async () => {
    await setUpPrivilages(axiosMock, store, true, false);
    await renderComponent();
    expect(within(container).queryByRole('button', { name: /actions menu/i })).not.toBeInTheDocument();
  });

  test('should display confirmation dialog when delete course posts is clicked', async () => {
    await setUpPrivilages(axiosMock, store, true, true);
    axiosMock.onPost(deletePostsApiUrl(courseId, username, 'course', false))
      .reply(202, { thread_count: 2, comment_count: 3 });
    await renderComponent();

    const actionsButton = await screen.findByRole('button', { name: /actions menu/i });
    await act(async () => {
      fireEvent.click(actionsButton);
    });

    const deleteCourseItem = await screen.findByTestId('delete-course-posts');
    await act(async () => {
      fireEvent.click(deleteCourseItem);
    });

    await waitFor(() => {
      const dialog = screen.getByText('Are you sure you want to delete this user\'s discussion contributions?');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('You are about to delete 5 discussion contributions by this user in this course. This includes all discussion threads, responses, and comments authored by them.')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  test('should complete delete course posts flow and redirect', async () => {
    await setUpPrivilages(axiosMock, store, true, true);
    axiosMock.onPost(deletePostsApiUrl(courseId, username, 'course', false))
      .reply(202, { thread_count: 2, comment_count: 3 });
    axiosMock.onPost(deletePostsApiUrl(courseId, username, 'course', true))
      .reply(202, { thread_count: 0, comment_count: 0 });
    await renderComponent();

    const actionsButton = await screen.findByRole('button', { name: /actions menu/i });
    await act(async () => {
      fireEvent.click(actionsButton);
    });

    const deleteCourseItem = await screen.findByTestId('delete-course-posts');
    await act(async () => {
      fireEvent.click(deleteCourseItem);
    });

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this user\'s discussion contributions?')).toBeInTheDocument();
    });

    const confirmButton = await screen.findByText('Delete');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(lastLocation.pathname.endsWith('/learners')).toBeTruthy();
      expect(screen.queryByText('Are you sure you want to delete this user\'s discussion contributions?')).not.toBeInTheDocument();
    });
  });

  test('should close confirmation dialog when cancel is clicked', async () => {
    await setUpPrivilages(axiosMock, store, true, true);
    axiosMock.onPost(deletePostsApiUrl(courseId, username, 'course', false))
      .reply(202, { thread_count: 2, comment_count: 3 });
    await renderComponent();

    const actionsButton = await screen.findByRole('button', { name: /actions menu/i });
    await act(async () => {
      fireEvent.click(actionsButton);
    });

    const deleteCourseItem = await screen.findByTestId('delete-course-posts');
    await act(async () => {
      fireEvent.click(deleteCourseItem);
    });

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this user\'s discussion contributions?')).toBeInTheDocument();
    });

    const cancelButton = await screen.findByText('Cancel');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to delete this user\'s discussion contributions?')).not.toBeInTheDocument();
    });
  });

  test('should display confirmation dialog for org posts deletion', async () => {
    await setUpPrivilages(axiosMock, store, true, true);
    axiosMock.onPost(deletePostsApiUrl(courseId, username, 'org', false))
      .reply(202, { thread_count: 5, comment_count: 10 });
    await renderComponent();

    const actionsButton = await screen.findByRole('button', { name: /actions menu/i });
    await act(async () => {
      fireEvent.click(actionsButton);
    });

    const deleteOrgItem = await screen.findByTestId('delete-org-posts');
    await act(async () => {
      fireEvent.click(deleteOrgItem);
    });

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this user\'s discussion contributions?')).toBeInTheDocument();
      expect(screen.getByText('You are about to delete 15 discussion contributions by this user across the organization. This includes all discussion threads, responses, and comments authored by them.')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });
  });
});
