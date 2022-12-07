import React from 'react';

import { render, screen } from '@testing-library/react';
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
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import { getCoursesApiUrl } from './data/api';
import LearnerPostsView from './LearnerPostsView';

import './data/__factories__';

let store;
let axiosMock;
const coursesApiUrl = getCoursesApiUrl();
const courseConfigApiUrl = getCourseConfigApiUrl();
const courseId = 'course-v1:edX+TestX+Test_Course';
const username = 'abc123';

function renderComponent(path = `/${courseId}/learners/${username}/posts`) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{
            learnerUsername: username,
            courseId,
          }}
        >
          <MemoryRouter initialEntries={[path]}>
            <Route path={path}>
              <LearnerPostsView />
            </Route>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('LearnerPostsView', () => {
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
    const learnerPosts = Factory.build('learnerPosts', {}, {
      abuseFlaggedCount: 1,
    });
    const apiUrl = `${coursesApiUrl}${courseId}/learner/`;
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(apiUrl, { username, count_flagged: true })
      .reply(() => [200, learnerPosts]);
  });

  describe('Basic', () => {
    test('Reported icon is visible to moderator for post with reported comment', async () => {
      axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
        has_moderation_privileges: true,
      });
      axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
      await act(async () => {
        renderComponent();
      });
      expect(screen.queryAllByTestId('reported-post')[0]).toBeInTheDocument();
    });

    test('Reported icon is not visible to learner for post with reported comment', async () => {
      await renderComponent();
      expect(screen.queryByTestId('reported-post')).not.toBeInTheDocument();
    });
  });
});
