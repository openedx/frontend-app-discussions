import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getUserProfileApiUrl, learnersApiUrl } from './api';
import {
  learnersLoadingStatus,
  selectLearnerNextPage,
  selectLearnerSorting,
  selectUsernameSearch,
} from './selectors';
import { fetchLearners } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const userProfileApiUrl = getUserProfileApiUrl();

let axiosMock;
let store;
const username = 'abc123';
const learnerCount = 3;
let state;

describe('Learner selectors test cases', () => {
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
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    axiosMock.onGet(learnersApiUrl(courseId))
      .reply(() => [200, Factory.build('learnersResult', {}, {
        count: learnerCount,
        pageSize: 6,
        page: 1,
      })]);

    axiosMock.onGet(`${userProfileApiUrl}?username=learner-1,learner-2,learner-3`)
      .reply(() => [200, Factory.build('learnersProfile', {}, {
        username: ['learner-1', 'learner-2', 'learner-3'],
      }).profiles]);

    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
    state = store.getState();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test('learnersLoadingStatus should return learners list loading status.', async () => {
    const status = learnersLoadingStatus()(state);
    expect(status).toEqual('successful');
  });

  test('selectUsernameSearch should return a learner search query.', async () => {
    const userNameSearch = selectUsernameSearch()(state);
    expect(userNameSearch).toBeNull();
  });

  test('selectLearnerSorting should return learner sortedBy.', async () => {
    const learnerSorting = selectLearnerSorting()(state);
    expect(learnerSorting).toEqual('activity');
  });

  test('selectLearnerNextPage should return learners next page.', async () => {
    const learnerNextPage = selectLearnerNextPage()(state);
    expect(learnerNextPage).toEqual(2);
  });
});
