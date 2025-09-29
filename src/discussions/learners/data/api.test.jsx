import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { setupLearnerMockResponse, setupPostsMockResponse } from '../test-utils';

import './__factories__';

const courseId2 = 'course-v1:edX+TestX+Test_Course2';
let axiosMock;

describe('Learner api test cases', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it(
    'Successfully get and store API response for the learner\'s list and learners posts in redux',
    async () => {
      const learners = await setupLearnerMockResponse();
      const threads = await setupPostsMockResponse();

      expect(learners.status).toEqual('successful');
      expect(Object.values(learners.learnerProfiles)).toHaveLength(3);
      expect(threads.status).toEqual('successful');
      expect(Object.values(threads.threadsById)).toHaveLength(2);
    },
  );

  it.each([
    { status: 'statusUnread', search: 'Title', cohort: 'post' },
    { status: 'statusUnanswered', search: 'Title', cohort: 'post' },
    { status: 'statusReported', search: 'Title', cohort: 'post' },
    { status: 'statusUnresponded', search: 'Title', cohort: 'post' },
  ])(
    'Successfully fetch user posts based on %s filters',
    async ({ status, search, cohort }) => {
      const threads = await setupPostsMockResponse({ filters: { status, search, cohort } });

      expect(threads.status).toEqual('successful');
      expect(Object.values(threads.threadsById)).toHaveLength(2);
    },
  );

  it('Failed to fetch learners', async () => {
    const learners = await setupLearnerMockResponse({ learnerCourseId: courseId2 });

    expect(learners.status).toEqual('failed');
  });

  it('Denied to fetch learners', async () => {
    const learners = await setupLearnerMockResponse({ statusCode: 403 });

    expect(learners.status).toEqual('denied');
  });

  it('Failed to fetch learnerPosts', async () => {
    const threads = await setupPostsMockResponse({ learnerCourseId: courseId2 });

    expect(threads.status).toEqual('failed');
  });

  it('Denied to fetch learnerPosts', async () => {
    const threads = await setupPostsMockResponse({ statusCode: 403 });

    expect(threads.status).toEqual('denied');
  });
});
