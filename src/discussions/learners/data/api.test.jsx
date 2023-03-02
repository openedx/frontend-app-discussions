import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import {
  getUserProfileApiUrl,
  learnerPostsApiUrl,
  learnersApiUrl,
} from './api';
import { fetchLearners, fetchUserPosts } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseId2 = 'course-v1:edX+TestX+Test_Course2';
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
    axiosMock.onGet(learnersApiUrl(learnerCourseId))
      .reply(() => [statusCode, Factory.build('learnersResult', {}, {
        count: learnerCount,
        pageSize: 3,
      })]);

    axiosMock.onGet(`${userProfileApiUrl}?username=learner-1,learner-2,learner-3`)
      .reply(() => [statusCode, Factory.build('learnersProfile', {}, {
        username: ['learner-1', 'learner-2', 'learner-3'],
      }).profiles]);

    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
    return store.getState().learners;
  }

  async function setupPostsMockResponse(learnerCourseId, statusCode, filters = { status: 'all' }) {
    axiosMock.onGet(learnerPostsApiUrl(learnerCourseId), { username, count_flagged: true })
      .reply(() => [statusCode, Factory.build('learnerPosts', {}, {
        abuseFlaggedCount: 1,
      })]);

    await executeThunk(fetchUserPosts(courseId, { filters }), store.dispatch, store.getState);
    return store.getState().threads;
  }

  test('Successfully get and store API response for the learner\'s list and learners posts in redux',
    async () => {
      const learners = await setupLearnerMockResponse(courseId, 200);
      const threads = await setupPostsMockResponse(courseId, 200);

      expect(learners.status).toEqual('successful');
      expect(Object.values(learners.learnerProfiles)).toHaveLength(3);
      expect(threads.status).toEqual('successful');
      expect(Object.values(threads.threadsById)).toHaveLength(2);
    });

  test.each([
    { status: 'statusUnread', search: 'Title', cohort: 'post' },
    { status: 'statusUnanswered', search: 'Title', cohort: 'post' },
    { status: 'statusReported', search: 'Title', cohort: 'post' },
    { status: 'statusUnresponded', search: 'Title', cohort: 'post' },
  ])('Successfully fetch user posts based on multiple filters', async ({ status, search, cohort }) => {
    const threads = await setupPostsMockResponse(courseId, 200, { status, search, cohort });

    expect(threads.status).toEqual('successful');
    expect(Object.values(threads.threadsById)).toHaveLength(2);
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
