import React from 'react';

import {
  fireEvent, render, screen, waitFor,
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
import { learnerPostsApiUrl } from './data/api';
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
});
