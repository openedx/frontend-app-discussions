/* eslint-disable import/prefer-default-export */
import { Factory } from 'rosie';

import {
  getUserProfileApiUrl,
  learnerPostsApiUrl,
  learnersApiUrl,
} from './discussions/learners/data/api';
import { fetchLearners, fetchUserPosts } from './discussions/learners/data/thunks';

export const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

export async function setupLearnerMockResponse(learnerCourseId, statusCode, axiosMock, store, learnerCount, courseId) {
  axiosMock.onGet(learnersApiUrl(learnerCourseId))
    .reply(() => [statusCode, Factory.build('learnersResult', {}, {
      count: learnerCount,
      pageSize: 3,
    })]);

  axiosMock.onGet(`${getUserProfileApiUrl()}?username=learner-1,learner-2,learner-3`)
    .reply(() => [statusCode, Factory.build('learnersProfile', {}, {
      username: ['learner-1', 'learner-2', 'learner-3'],
    }).profiles]);

  await executeThunk(fetchLearners(courseId), store.dispatch, store.getState);
  return store.getState().learners;
}

export async function setupPostsMockResponse(learnerCourseId, statusCode, filters = { status: 'all' }, axiosMock, store, courseId, username) {
  axiosMock.onGet(learnerPostsApiUrl(learnerCourseId), { username, count_flagged: true })
    .reply(() => [statusCode, Factory.build('learnerPosts', {}, {
      abuseFlaggedCount: 1,
    })]);

  await executeThunk(fetchUserPosts(courseId, { filters }), store.dispatch, store.getState);
  return store.getState().threads;
}
