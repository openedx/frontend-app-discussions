import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getCoursesApiUrl, getUserProfileApiUrl } from './api';
import { fetchLearners, fetchUserPosts } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseId2 = 'course-v1:edX+TestX+Test_Course2';
const coursesApiUrl = getCoursesApiUrl();
const userProfileApiUrl = getUserProfileApiUrl();

let axiosMock;
let store;
const username = 'abc123';
const learnerCount = 3;

describe('Learner api test cases', () => {
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
  });

  afterEach(() => {
    axiosMock.reset();
  });

  async function setupLearnerMockResponse(learnerCourseId, statusCode) {
    const learnersData = Factory.build('learnersResult', {}, {
      count: learnerCount,
      pageSize: 6,
    });
    axiosMock.onGet(`${coursesApiUrl}${learnerCourseId}/activity_stats/`)
      .reply(() => [statusCode, learnersData]);

    const learnersProfile = Factory.build('learnersProfile', {}, {
      username: ['learner-1', 'learner-2', 'learner-3'],
    });
    axiosMock.onGet(`${userProfileApiUrl}?username=learner-1,learner-2,learner-3`)
      .reply(() => [statusCode, learnersProfile.profiles]);

    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
    return store.getState().learners;
  }

  async function setupPostsMockResponse(learnerCourseId, statusCode) {
    const learnerPosts = Factory.build('learnerPosts', {}, {
      abuseFlaggedCount: 1,
    });
    const apiUrl = `${coursesApiUrl}${learnerCourseId}/learner/`;

    axiosMock.onGet(apiUrl, { username, count_flagged: true })
      .reply(() => [statusCode, learnerPosts]);

    await executeThunk(fetchUserPosts(courseId), store.dispatch, store.getState);
    return store.getState().threads;
  }

  test('Successfully get API response for the learner\'s list and learners posts', async () => {
    const learners = await setupLearnerMockResponse(courseId, 200);
    const threads = await setupPostsMockResponse(courseId, 200);

    expect(learners.status).toEqual('successful');
    expect(learners.learnerProfiles).not.toBeUndefined();
    expect(threads.status).toEqual('successful');
    expect(threads.threadsById).not.toBeUndefined();
  });

  test('Successfully store learners and learnerPosts API data in redux', async () => {
    const learners = await setupLearnerMockResponse(courseId, 200);
    const threads = await setupPostsMockResponse(courseId, 200);

    expect(Object.values(threads.threadsById)).toHaveLength(2);
    expect(Object.values(learners.learnerProfiles)).toHaveLength(3);
  });

  it('failed to fetch learners', async () => {
    const learners = await setupLearnerMockResponse(courseId2, 200);

    expect(learners.status).toEqual('failed');
  });

  it('denied to fetch learners', async () => {
    const learners = await setupLearnerMockResponse(courseId, 403);

    expect(learners.status).toEqual('denied');
  });

  it('failed to fetch learnerPosts', async () => {
    const threads = await setupPostsMockResponse(courseId2, 200);

    expect(threads.status).toEqual('failed');
  });

  it('denied to fetch learnerPosts', async () => {
    const threads = await setupPostsMockResponse(courseId, 403);

    expect(threads.status).toEqual('denied');
  });
});
