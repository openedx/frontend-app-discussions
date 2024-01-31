import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getDiscussionsConfigUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import { getUserProfileApiUrl, learnerPostsApiUrl, learnersApiUrl } from './data/api';
import { fetchLearners, fetchUserPosts } from './data/thunks';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

export async function setupLearnerMockResponse({
  learnerCourseId = courseId,
  statusCode = 200,
  learnerCount = 3,
} = {}) {
  const store = initializeStore();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

  axiosMock.onGet(learnersApiUrl(learnerCourseId))
    .reply(() => [statusCode, Factory.build('learnersResult', {}, {
      count: learnerCount,
      pageSize: 6,
      page: 1,
    })]);

  axiosMock.onGet(`${getUserProfileApiUrl()}?username=learner-1,learner-2,learner-3`)
    .reply(() => [statusCode, Factory.build('learnersProfile', {}, {
      username: ['learner-1', 'learner-2', 'learner-3'],
    }).profiles]);

  await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
  return store.getState().learners;
}

export async function setupPostsMockResponse({
  learnerCourseId = courseId,
  statusCode = 200,
  username = 'abc123',
  filters = { status: 'all' },
} = {}) {
  const store = initializeStore();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

  axiosMock.onGet(learnerPostsApiUrl(learnerCourseId), { username, count_flagged: true })
    .reply(() => [statusCode, Factory.build('learnerPosts', {}, {
      abuseFlaggedCount: 1,
    })]);

  await executeThunk(fetchUserPosts(courseId, { filters }), store.dispatch, store.getState);
  return store.getState().threads;
}

export async function setUpPrivilages(axiosMock, store, hasModerationPrivileges) {
  axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
    hasModerationPrivileges,
  });

  await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
}
