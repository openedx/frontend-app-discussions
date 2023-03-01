import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getCoursesApiUrl, getUserProfileApiUrl } from './api';
import { setPostFilter, setSortedBy, setUsernameSearch } from './slices';
import { fetchLearners } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const coursesApiUrl = getCoursesApiUrl();
const userProfileApiUrl = getUserProfileApiUrl();

let axiosMock;
let store;
const username = 'abc123';
const learnerCount = 6;

describe('Learner redux test cases', () => {
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

  async function setupLearnerMockResponse() {
    const learnersData = Factory.build('learnersResult', {}, {
      count: learnerCount,
      pageSize: 3,
    });
    axiosMock.onGet(`${coursesApiUrl}${courseId}/activity_stats/`)
      .reply(() => [200, learnersData]);

    const learnersProfile = Factory.build('learnersProfile', {}, {
      username: ['learner-1', 'learner-2', 'learner-3'],
    });
    axiosMock.onGet(`${userProfileApiUrl}?username=learner-1,learner-2,learner-3`)
      .reply(() => [200, learnersProfile.profiles]);

    await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
    return store.getState().learners;
  }

  test('Successfully load initial states in redux', async () => {
    executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
    const state = store.getState();

    expect(state.learners.status).toEqual('in-progress');
    expect(state.learners.learnerProfiles).toEqual({});
    expect(state.learners.pages).toHaveLength(0);
    expect(state.learners.nextPage).toBeNull();
    expect(state.learners.totalPages).toBeNull();
    expect(state.learners.totalLearners).toBeNull();
    expect(state.learners.sortedBy).toEqual('activity');
    expect(state.learners.usernameSearch).toBeNull();
    expect(state.learners.postFilter.postType).toEqual('all');
    expect(state.learners.postFilter.status).toEqual('statusAll');
    expect(state.learners.postFilter.orderBy).toEqual('lastActivityAt');
    expect(state.learners.postFilter.cohort).toEqual('');
  });

  test('Successfully store a learner posts stats data as pages object in redux',
    async () => {
      const learners = await setupLearnerMockResponse();
      const pages = learners.pages[0];
      const stats = pages[0];

      expect(pages).toHaveLength(3);
      expect(stats.responses).toEqual(3);
      expect(stats.threads).toEqual(1);
      expect(stats.replies).toEqual(0);
    });

  test('Successfully store the nextPage, totalPages, totalLearners, and sortedBy data in redux',
    async () => {
      const learners = await setupLearnerMockResponse();

      expect(learners.nextPage).toEqual(2);
      expect(learners.totalPages).toEqual(2);
      expect(learners.totalLearners).toEqual(6);
      expect(learners.sortedBy).toEqual('activity');
    });

  test('Successfully updated the learner\'s sort data in redux', async () => {
    const learners = await setupLearnerMockResponse();

    expect(learners.sortedBy).toEqual('activity');
    expect(learners.pages[0]).toHaveLength(3);

    await store.dispatch(setSortedBy('recency'));
    const updatedLearners = store.getState().learners;

    expect(updatedLearners.sortedBy).toEqual('recency');
    expect(updatedLearners.pages).toHaveLength(0);
  });

  test('Successfully updated the post-filter data in redux', async () => {
    const learners = await setupLearnerMockResponse();
    const filter = {
      ...learners.postFilter,
      postType: 'discussion',
    };

    expect(learners.postFilter.postType).toEqual('all');

    await store.dispatch(setPostFilter(filter));
    const updatedLearners = store.getState().learners;

    expect(updatedLearners.postFilter.postType).toEqual('discussion');
    expect(updatedLearners.pages).toHaveLength(0);
  });

  test('Successfully update the learner\'s search query in redux when searching for a learner',
    async () => {
      const learners = await setupLearnerMockResponse();

      expect(learners.usernameSearch).toBeNull();

      await store.dispatch(setUsernameSearch('learner-2'));
      const updatedLearners = store.getState().learners;

      expect(updatedLearners.usernameSearch).toEqual('learner-2');
    });
});
