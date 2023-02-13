import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getCourseTopicsApiUrl } from './api';
import {
  selectArchivedTopics,
  selectCoursewareTopics,
  selectLoadingStatus,
  selectNonCoursewareIds,
  selectNonCoursewareTopics,
  selectTopics,
  selectUnits,
} from './selectors';
import { fetchCourseTopicsV3 } from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseTopicsApiUrl = getCourseTopicsApiUrl();

let axiosMock;
let store;

describe('In Context Topics Selector test cases', () => {
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

  async function setupMockData() {
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
    await executeThunk(fetchCourseTopicsV3(courseId), store.dispatch, store.getState);

    const state = store.getState();
    return state;
  }

  test('should return topics list', async () => {
    setupMockData().then((state) => {
      const topics = selectTopics(state);

      expect(topics).not.toBeUndefined();
      topics.forEach(data => {
        const topicFunc = jest.fn((topic) => {
          if (topic.id.includes('noncourseware-topic')) { return true; }
          if (topic.id.includes('courseware-topic')) { return true; }
          if (topic.id.includes('archived')) { return true; }
          return false;
        });
        topicFunc(data);
        expect(topicFunc).toHaveReturnedWith(true);
      });
    });
  });

  test('should return courseware topics list', async () => {
    setupMockData().then((state) => {
      const coursewareTopics = selectCoursewareTopics(state);

      expect(coursewareTopics).not.toBeUndefined();
      coursewareTopics.forEach((topic, index) => {
        expect(topic?.id).toEqual(`courseware-topic-${index + 1}`);
      });
    });
  });

  test('should return noncourseware topics list', async () => {
    setupMockData().then((state) => {
      const nonCoursewareTopics = selectNonCoursewareTopics(state);

      expect(nonCoursewareTopics).not.toBeUndefined();
      nonCoursewareTopics.forEach((topic, index) => {
        expect(topic?.id).toEqual(`noncourseware-topic-${index + 1}`);
      });
    });
  });

  test('should return noncourseware ids list', async () => {
    setupMockData().then((state) => {
      const nonCoursewareIds = selectNonCoursewareIds(state);

      expect(nonCoursewareIds).not.toBeUndefined();
      nonCoursewareIds.forEach((id, index) => {
        expect(id).toEqual(`noncourseware-topic-${index + 1}`);
      });
    });
  });

  test('should return units list', async () => {
    setupMockData().then((state) => {
      const units = selectUnits(state);

      expect(units).not.toBeUndefined();
      units.forEach(unit => {
        expect(unit?.usageKey).not.toBeNull();
      });
    });
  });

  test('should return archived topics list', async () => {
    setupMockData().then((state) => {
      const archivedTopics = selectArchivedTopics(state);

      expect(archivedTopics).not.toBeUndefined();
      archivedTopics.forEach((topic, index) => {
        expect(topic.id).toEqual(`archived-${index + 1}`);
      });
    });
  });

  test('should return loading status successful', async () => {
    setupMockData().then((state) => {
      const status = selectLoadingStatus(state);

      expect(status).toEqual('successful');
    });
  });
});
