import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../store';
import { executeThunk } from '../test-utils';
import { getBlocksAPIResponse } from './__factories__';
import { getBlocksAPIURL } from './api';
import { RequestStatus } from './constants';
import { fetchCourseBlocks } from './thunks';

const blocksAPIURL = getBlocksAPIURL();
const courseId = 'course-v1:edX+DemoX+Demo_Course';

let axiosMock;
let store;

describe('Course blocks data layer tests', () => {
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

  it('successfully processes block data', async () => {
    axiosMock.onGet(blocksAPIURL)
      .reply(200, getBlocksAPIResponse());

    await executeThunk(fetchCourseBlocks(courseId, 'test-user'), store.dispatch, store.getState);

    expect(store.getState().blocks.chapters)
      .toHaveLength(4);
    expect(store.getState().blocks.chapters)
      .toEqual([
        'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
        'block-v1:edX+DemoX+Demo_Course+type@chapter+block@graded_interactions',
        'block-v1:edX+DemoX+Demo_Course+type@chapter+block@social_integration',
        'block-v1:edX+DemoX+Demo_Course+type@chapter+block@1414ffd5143b4b508f739b563ab468b7',
      ]);
    expect(Object.keys(store.getState().blocks.topics))
      .toEqual(['d9f970a42067413cbb633f81cfb12604', '98d8feb5971041a085512ae22b398613', '1d153da210844719a1a6cc39ca09673c', '265ca2d808814d76ad670957a2b6071f', '23347cb1d1e74ec79453ce361e38eb18', '4250393f9f684bfeb3f1d514e15592d1', 'eb264c9899b745fc81cd7405b53a7a65', 'aecab8f355744782af5a9470185f0005', 'cba3e4cd91d0466b9ac50926e495b76f', 'ed3164d1235645739374094a8172964b', 'b770140a122741fea651a50362dee7e6', 'c49f0dfb8fc94c9c8d9999cc95190c56', '53c486b035b4437c9197a543371e0f03', 'd7b66e45154b4af18f33213337685e91', '9ad16580878f49d1bf20ce1bc533d16e', 'b11488e3580241f08146cbcfca693d06', 'bb15269287ec44b6a2f69447db43d845', '239ef52e6eee468fb698b4217a7bafc6', 'cdad92273f7d4622aed770b7de8583bc', 'e4365aad2c39498d824cf984b3f9b083', '6e51dd8f181b44ffa6d91303a287ed3f', 'edx_demo_embedded_discussion', '31c83aefa6634e83a3c80b81f5447201', '0717ec26e67e49b2a9f30d2e15c417dd', 'df0905ee484844769644f330844253e7', 'e252d4de97c7426e8b67ff516a9962f6', '97f19f6202e54d6a9ea59f7a573725a1', 'd459fcb5792b459ca0aefe141e633ccc', 'ba12c2e0b81e4cef8e05e22049aafd63', 'a56e406f164746d8bbff76545e6d981f']);
    expect(store.getState().blocks.topics['98d8feb5971041a085512ae22b398613'])
      .toEqual({
        chapterName: 'Example Week 1: Getting Started',
        unitLink: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/jump_to/block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0',
        unitName: 'Videos on edX',
        verticalName: 'Lesson 1 - Getting Started',
      });
    Object.values(store.getState().blocks.topics)
      .forEach(
        topic => {
          expect(topic.chapterName)
            .not
            .toEqual(undefined);
          expect(topic.unitName)
            .not
            .toEqual(undefined);
          expect(topic.verticalName)
            .not
            .toEqual(undefined);
          expect(topic.unitLink)
            .not
            .toEqual(undefined);
        },
      );
  });

  it('handles network error', async () => {
    axiosMock.onGet(blocksAPIURL).networkError();

    await executeThunk(fetchCourseBlocks(courseId, 'test-user'), store.dispatch, store.getState);

    expect(store.getState().blocks.status)
      .toBe(RequestStatus.FAILED);
  });
  it('handles network timeout', async () => {
    axiosMock.onGet(blocksAPIURL).timeout();

    await executeThunk(fetchCourseBlocks(courseId, 'test-user'), store.dispatch, store.getState);

    expect(store.getState().blocks.status)
      .toBe(RequestStatus.FAILED);
  });
  it('handles access denied', async () => {
    axiosMock.onGet(blocksAPIURL).reply(403, {});

    await executeThunk(fetchCourseBlocks(courseId, 'test-user'), store.dispatch, store.getState);

    expect(store.getState().blocks.status)
      .toBe(RequestStatus.DENIED);
  });
});
