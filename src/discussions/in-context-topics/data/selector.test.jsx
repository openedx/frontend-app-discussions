import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCourseTopicsApiUrl } from './api';
import {
  selectArchivedTopic,
  selectArchivedTopics,
  selectCourseWareThreadsCount,
  selectCoursewareTopics,
  selectLoadingStatus,
  selectNonCoursewareIds,
  selectNonCoursewareTopics,
  selectSubsection,
  selectTopics,
  selectTotalTopicsThreadsCount,
  selectUnits,
} from './selectors';
import fetchCourseTopicsV3 from './thunks';

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

  it('should return topics list', async () => {
    const state = await setupMockData();
    const topics = selectTopics(state);
    const topicsIds = topics.map(topic => topic.id);

    expect(topicsIds[0].includes('noncourseware-topic')).toBeTruthy();
    expect(topicsIds[1].includes('courseware-topic')).toBeTruthy();
    expect(topicsIds[3].includes('archived')).toBeTruthy();
  });

  it('should return courseware topics list', async () => {
    const state = await setupMockData();
    const coursewareTopics = selectCoursewareTopics(state);

    expect(coursewareTopics).not.toBeUndefined();
    coursewareTopics.forEach((topic, index) => {
      expect(topic?.id).toEqual(`courseware-topic-${index + 1}-v3`);
    });
  });

  it('should return noncourseware topics list', async () => {
    const state = await setupMockData();
    const nonCoursewareTopics = selectNonCoursewareTopics(state);

    expect(nonCoursewareTopics).not.toBeUndefined();
    nonCoursewareTopics.forEach((topic, index) => {
      expect(topic?.id).toEqual(`noncourseware-topic-${index + 1}`);
    });
  });

  it('should return noncourseware ids list', async () => {
    const state = await setupMockData();
    const nonCoursewareIds = selectNonCoursewareIds(state);

    expect(nonCoursewareIds).not.toBeUndefined();
    nonCoursewareIds.forEach((id, index) => {
      expect(id).toEqual(`noncourseware-topic-${index + 1}`);
    });
  });

  it('should return units list', async () => {
    const state = await setupMockData();
    const units = selectUnits(state);

    expect(units).not.toBeUndefined();
    units.forEach(unit => {
      expect(unit?.usageKey).not.toBeNull();
    });
  });

  it('should return archived topics list', async () => {
    const state = await setupMockData();
    const archivedTopics = selectArchivedTopics(state);

    expect(archivedTopics).not.toBeUndefined();
    archivedTopics.forEach((topic, index) => {
      expect(topic.id).toEqual(`archived-${index + 1}`);
    });
  });

  it('should return loading status successful', async () => {
    const state = await setupMockData();

    expect(selectLoadingStatus(state)).toEqual('successful');
  });

  it('should return total topics threads count successful.', async () => {
    const state = await setupMockData();

    expect(selectTotalTopicsThreadsCount(state)).toEqual(18);
  });

  it('should return courseware threads counts successful.', async () => {
    const state = await setupMockData();

    expect(selectCourseWareThreadsCount('section-topic-1')(state)).toEqual(8);
  });

  it('should return selected subsection.', async () => {
    const state = await setupMockData();

    expect(selectSubsection('section-topic-1')(state)).not.toBeNull();
  });

  it('should return selected archived topic.', async () => {
    const state = await setupMockData();

    expect(selectArchivedTopic('archived-1')(state)).not.toBeNull();
  });
});
