import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getCohortsApiUrl } from './api';
import { fetchCourseCohorts } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const courseId2 = 'course-v1:edX+TestX+Test_Course2';
let axiosMock;
let store;

describe('Cohorts data layer tests', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    Factory.resetAll();
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it('successfully fetch course cohorts', async () => {
    axiosMock.onGet(getCohortsApiUrl(courseId))
      .reply(200, Factory.buildList('cohort', 3));

    await executeThunk(
      fetchCourseCohorts(courseId),
      store.dispatch,
      store.getState,
    );

    expect(store.getState().cohorts.cohorts.map(cohort => cohort.id))
      .toEqual(['cohort-1', 'cohort-2', 'cohort-3']);
  });

  it('failed fetch different course cohorts', async () => {
    axiosMock.onGet(getCohortsApiUrl(courseId))
      .reply(200, Factory.buildList('cohort', 3));
    axiosMock.onGet(getCohortsApiUrl(courseId2))
      .reply(404);

    await executeThunk(
      fetchCourseCohorts(courseId),
      store.dispatch,
      store.getState,
    );
    await executeThunk(
      fetchCourseCohorts(courseId2),
      store.dispatch,
      store.getState,
    );

    // cohorts shouldn't contain outdated data
    expect(store.getState().cohorts.cohorts).toEqual([]);
  });
});
