import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCourseTopicsApiUrl } from './api';
import fetchCourseTopicsV3 from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseTopicsApiUrl = getCourseTopicsApiUrl();

let axiosMock;
let store;

describe('Redux in context topics tests', () => {
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

  test('successfully load initial states in redux', async () => {
    executeThunk(fetchCourseTopicsV3(courseId), store.dispatch, store.getState);
    const state = store.getState();

    expect(state.inContextTopics.status).toEqual('in-progress');
    expect(state.inContextTopics.topics).toHaveLength(0);
    expect(state.inContextTopics.coursewareTopics).toHaveLength(0);
    expect(state.inContextTopics.nonCoursewareTopics).toHaveLength(0);
    expect(state.inContextTopics.nonCoursewareIds).toHaveLength(0);
    expect(state.inContextTopics.units).toHaveLength(0);
    expect(state.inContextTopics.archivedTopics).toHaveLength(0);
    expect(state.inContextTopics.filter).toEqual('');
  });

  test('successfully store all api data of courseware and noncourseware in redux', async () => {
    setupMockData().then((state) => {
      const { coursewareTopics, nonCoursewareTopics } = state.inContextTopics;

      expect(coursewareTopics).toHaveLength(2);
      expect(nonCoursewareTopics).toHaveLength(1);
    });
  });

  test('successfully store the combined list of courseware and noncourseware topics in topics', async () => {
    setupMockData().then((state) => {
      const {
        coursewareTopics, nonCoursewareTopics, archivedTopics, topics,
      } = state.inContextTopics;

      expect(topics).toHaveLength(coursewareTopics.length + nonCoursewareTopics.length + archivedTopics.length);
    });
  });

  test('successfully get the posts ', async () => {
    setupMockData().then((state) => {
      expect(state?.inContextTopics?.status).toEqual('successful');
    });
  });

  test('successfully checked that the coursewaretopic has three levels', async () => {
    setupMockData().then((state) => {
      const { coursewareTopics } = state.inContextTopics;

      // contain chapter at first level
      coursewareTopics.forEach((chapter, index) => {
        expect(chapter.courseware).toEqual(true);
        expect(chapter.id).toEqual(`courseware-topic-${index + 1}-v3`);
        expect(chapter.type).toEqual('chapter');
        expect(chapter).toHaveProperty('blockId');
        expect(chapter).toHaveProperty('lmsWebUrl');
        expect(chapter).toHaveProperty('legacyWebUrl');
        expect(chapter).toHaveProperty('studentViewUrl');

        // contain section at second level
        chapter.children.forEach((section, secIndex) => {
          expect(section.id).toEqual(`section-topic-${secIndex + 1}`);
          expect(section.type).toEqual('sequential');
          expect(section).toHaveProperty('blockId');
          expect(section).toHaveProperty('lmsWebUrl');
          expect(section).toHaveProperty('legacyWebUrl');
          expect(section).toHaveProperty('studentViewUrl');

          // contain sub section at third level
          section.children.forEach((subSection, subSecIndex) => {
            expect(subSection.enabledInContext).toEqual(true);
            expect(subSection.id).toEqual(`courseware-topic-${index + 1}-v3-${subSecIndex + 1}`);
            expect(subSection).toHaveProperty('usageKey');
            expect(subSection).not.toHaveProperty('blockId');
            expect(subSection?.threadCounts?.discussion).toEqual(1);
            expect(subSection?.threadCounts?.question).toEqual(1);
          });
        });
      });
    });
  });

  test('successfully checked that the noncoursewaretopic have proper attributes', async () => {
    setupMockData().then((state) => {
      const { nonCoursewareTopics } = state.inContextTopics;

      nonCoursewareTopics.forEach((topic, index) => {
        expect(topic.usageKey).toEqual('');
        expect(topic.id).toEqual(`noncourseware-topic-${index + 1}`);
        expect(topic.name).toEqual(`general-topic-${index + 1}`);
        expect(topic.enabledInContext).toEqual(true);
        expect(topic?.threadCounts?.discussion).toEqual(1);
        expect(topic?.threadCounts?.question).toEqual(1);
        expect(topic).not.toHaveProperty('blockId');
      });
    });
  });

  test('nonCoursewareIds successfully contains ids of noncourseware topics', async () => {
    setupMockData().then((state) => {
      const { nonCoursewareIds, nonCoursewareTopics } = state.inContextTopics;

      nonCoursewareIds.forEach((nonCoursewareId, index) => {
        expect(nonCoursewareTopics[index].id).toEqual(nonCoursewareId);
      });
    });
  });

  test('selectUnits successfully contains all sub sections', async () => {
    setupMockData().then((state) => {
      const subSections = state.inContextTopics.coursewareTopics?.map(x => x.children)
        ?.flat()?.map(x => x.children)?.flat();
      const { units } = state.inContextTopics;

      units.forEach(unit => {
        const subSection = subSections.find(x => x.id === unit.id);
        expect(subSection?.id).toEqual(unit.id);
      });
    });
  });

  test('successfully stored archived data in redux', async () => {
    setupMockData().then((state) => {
      const { archivedTopics } = state.inContextTopics;

      archivedTopics.forEach((archivedTopic, index) => {
        expect(archivedTopic?.enabledInContext).toEqual(false);
        expect(archivedTopic?.id).toEqual(`archived-${index + 1}`);
        expect(archivedTopic?.usageKey).not.toBeNull();
        expect(archivedTopic?.threadCounts?.discussion).toEqual(1);
        expect(archivedTopic?.threadCounts?.question).toEqual(1);
      });
    });
  });
});
