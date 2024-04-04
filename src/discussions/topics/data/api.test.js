import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCourseTopics, getCourseTopicsApiUrl } from './api';
import fetchCourseTopics from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const courseId2 = 'course-v1:edX+TestX+Test_Course2';
const courseTopicsApiUrl = getCourseTopicsApiUrl();

let axiosMock = null;
let store;

describe('Legacy Topic Api', () => {
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
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test('successfully get topics', async () => {
    axiosMock
      .onGet(`${courseTopicsApiUrl}${courseId}`)
      .reply(200, {
        courseware_topics: Factory.buildList('category', 2),
        non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw' }),
      });
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);

    const response = await getCourseTopics(courseId);

    expect(response).not.toBeUndefined();
    expect(response.courseware_topics).toHaveLength(2);
    expect(response.non_courseware_topics).toHaveLength(3);
  });

  it('failed to fetch topics', async () => {
    axiosMock.onGet(`${courseTopicsApiUrl}${courseId2}`)
      .reply(404);
    await executeThunk(fetchCourseTopics(courseId2), store.dispatch, store.getState);

    expect(store.getState().topics.status).toEqual('failed');
  });

  it('denied to fetch topics', async () => {
    axiosMock.onGet(`${courseTopicsApiUrl}${courseId}`)
      .reply(403, {});
    await executeThunk(fetchCourseTopics(courseId), store.dispatch);

    expect(store.getState().topics.status).toEqual('denied');
  });
});
