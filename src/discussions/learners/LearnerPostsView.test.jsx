import React from 'react';

import {
  fireEvent,
  render,
  screen,
  waitFor,
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
import { DiscussionContext } from '../common/context';
import { learnerPostsApiUrl } from './data/api';
import LearnerPostsView from './LearnerPostsView';
import { setUpPrivilages } from './test-utils';

import './data/__factories__';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
const username = 'abc123';
let container;
let lastLocation;

function renderComponent() {
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
  });

  it('Reported icon is visible to moderator for post with reported comment', async () => {
    await setUpPrivilages(axiosMock, store, true);
    await act(async () => {
      renderComponent(true);
    });

    expect(screen.queryAllByTestId('reported-post')[0]).toBeInTheDocument();
  });

  it('Reported icon is not visible to learner for post with reported comment', async () => {
    await renderComponent();
    expect(screen.queryByTestId('reported-post')).not.toBeInTheDocument();
  });

  it('Learner title bar should display a title bar, a learner name, and a back button', async () => {
    await renderComponent();

    const titleBar = await container.querySelector('.discussion-posts').children[0];
    const learnerName = await screen.queryByText('Activity for Abc123');
    const backButton = await screen.getByLabelText('Back');

    expect(titleBar).toBeInTheDocument();
    expect(learnerName).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('Learner title bar should redirect to the learners list when clicking on the back button',
    async () => {
      await renderComponent();

      const backButton = await screen.getByLabelText('Back');

      await act(async () => fireEvent.click(backButton));
      await waitFor(async () => {
        expect(lastLocation.pathname.endsWith('/learners')).toBeTruthy();
      });
    });

  it('It should display a post-filter bar and All posts sorted by recent activity text.', async () => {
    await setUpPrivilages(axiosMock, store, false);
    await act(async () => {
      renderComponent();
    });
    const filterBar = await container.querySelector('.filter-bar');
    const recentActivity = screen.getByText('All posts sorted by recent activity');

    expect(filterBar).toBeInTheDocument();
    expect(recentActivity).toBeInTheDocument();
  });

  it(`It should display a list of the interactive posts of a selected learner and the posts count
     should be equal to the API response count.`, async () => {
    await act(async () => renderComponent());
    await waitFor(async () => {
      const posts = await container.querySelectorAll('.discussion-post');

      expect(posts).toHaveLength(2);
      expect(posts).toHaveLength(Object.values(store.getState().threads.threadsById).length);
    });
  });
});
