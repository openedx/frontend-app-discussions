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
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import { getCoursesApiUrl, getUserProfileApiUrl } from './data/api';
import { fetchLearners } from './data/thunks';
import LearnersView from './LearnersView';

import './data/__factories__';

let store;
let axiosMock;
const coursesApiUrl = getCoursesApiUrl();
const courseConfigApiUrl = getCourseConfigApiUrl();
const userProfileApiUrl = getUserProfileApiUrl();
const courseId = 'course-v1:edX+TestX+Test_Course';

function renderComponent() {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[`/${courseId}/`]}>
          <Route path="/:courseId/">
            <LearnersView />
          </Route>
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('LearnersView', () => {
  const learnerCount = 3;
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    Factory.resetAll();
    const learnersData = Factory.build('learnersResult', {}, {
      count: learnerCount,
      pageSize: 6,
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${coursesApiUrl}${courseId}/activity_stats/`)
      .reply(() => [200, learnersData]);
    const learnersProfile = Factory.build('learnersProfile', {}, {
      username: ['leaner-1', 'leaner-2', 'leaner-3'],
    });
    axiosMock.onGet(`${userProfileApiUrl}?username=leaner-1,leaner-2,leaner-3`)
      .reply(() => [200, learnersProfile.profiles]);
    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
  });

  describe('Basic', () => {
    test('Learners tab is disabled by default', async () => {
      await act(async () => {
        await renderComponent();
      });
      expect(screen.queryByText(/Last active/i)).toBeFalsy();
    });
    test('Learners tab is enabled', async () => {
      axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
        learners_tab_enabled: true,
        user_is_privileged: true,
      });
      axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
      await act(async () => {
        await renderComponent();
      });
    });
  });
});
