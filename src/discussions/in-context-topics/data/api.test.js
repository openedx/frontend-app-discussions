import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCourseTopicsApiUrl, getCourseTopicsV3 } from './api';
import fetchCourseTopicsV3 from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const courseId2 = 'course-v1:edX+TestX+Test_Course2';
const courseTopicsApiUrl = getCourseTopicsApiUrl();

let axiosMock = null;
let store;

describe('In context topic api tests', () => {
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
    axiosMock.onGet(`${courseTopicsApiUrl}${courseId}`)
      .reply(200, (Factory.buildList('topic', 1, null, {
        topicPrefix: 'noncourseware-topic',
        enabledInContext: true,
        topicNamePrefix: 'general-topic',
        usageKey: '',
        courseware: false,
        discussionCount: 1,
        questionCount: 1,
      }).concat(Factory.buildList('section', 2, null, { topicPrefix: 'courseware' })))
        .concat(Factory.buildList('archived-topics', 2, null)));

    const response = await getCourseTopicsV3(courseId);

    expect(response).not.toBeUndefined();
  });

  it('failed to fetch topics', async () => {
    axiosMock.onGet(`${courseTopicsApiUrl}${courseId2}`)
      .reply(404);
    await executeThunk(fetchCourseTopicsV3(courseId2), store.dispatch, store.getState);

    expect(store.getState().inContextTopics.status).toEqual('failed');
  });

  it('denied to fetch topics', async () => {
    axiosMock.onGet(`${courseTopicsApiUrl}${courseId}`)
      .reply(403, {});
    await executeThunk(fetchCourseTopicsV3(courseId), store.dispatch);

    expect(store.getState().inContextTopics.status).toEqual('denied');
  });
});
