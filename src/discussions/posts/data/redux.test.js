import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { getThreadsApiUrl } from './api';
import {
  createNewThread, fetchThread, fetchThreads, removeThread, updateExistingThread,
} from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const threadsApiUrl = getThreadsApiUrl();

let axiosMock;
let store;

describe('Threads/Posts data layer tests', () => {
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

  test('successfully processes threads', async () => {
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult'));

    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);

    expect(store.getState().threads.threadsInTopic)
      .toEqual({ 'test-topic': ['thread-1', 'thread-2', 'thread-3'] });
    expect(store.getState().threads.pages)
      .toEqual([['thread-1', 'thread-2', 'thread-3']]);
    expect(Object.keys(store.getState().threads.threadsById))
      .toEqual(['thread-1', 'thread-2', 'thread-3']);
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('courseId');
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('topicId');
    expect(store.getState().threads.threadsById['thread-1'].topicId)
      .toEqual('test-topic');
  });

  test('successfully processes threads pagination', async () => {
    const mockPage = page => axiosMock
      .onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult', null, {
        page,
        count: 5,
        pageSize: 3,
      }));

    mockPage(1);
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    expect(store.getState().threads.pages)
      .toEqual([
        ['thread-1', 'thread-2', 'thread-3'],
      ]);
    expect(store.getState().threads.nextPage)
      .toEqual(2);

    mockPage(2);
    await executeThunk(fetchThreads(courseId, { page: 2 }), store.dispatch, store.getState);
    expect(store.getState().threads.pages)
      .toEqual([
        ['thread-1', 'thread-2', 'thread-3'],
        ['thread-4', 'thread-5'],
      ]);
    expect(store.getState().threads.nextPage)
      .toBeNull();
  });

  test('successfully processes single thread', async () => {
    const threadId = 'thread-1';
    axiosMock.onGet(`${threadsApiUrl}${threadId}/`)
      .reply(200, Factory.build('thread'));

    await executeThunk(fetchThread(threadId), store.dispatch, store.getState);

    expect(Object.keys(store.getState().threads.threadsById))
      .toEqual(['thread-1']);
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('courseId');
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('topicId');
    expect(store.getState().threads.threadsById['thread-1'].topicId)
      .toEqual('some-topic-1');
  });

  test('successfully handles thread creation', async () => {
    const topicId = 'test-topic';
    const title = 'A Test Thread';
    const content = 'Some test content';
    // pre-load thread results
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult'));
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);

    axiosMock.onPost(threadsApiUrl)
      .reply(200, Factory.build('thread', {
        course_id: courseId, topic_id: topicId, title, raw_body: content, rendered_body: content,
      }));

    await executeThunk(createNewThread(courseId, topicId, 'discussion', title, content), store.dispatch, store.getState);

    expect(store.getState().threads.threadsInTopic)
      .toEqual({ [topicId]: ['thread-1', 'thread-2', 'thread-3', 'thread-4'] });
    expect(Object.keys(store.getState().threads.threadsById))
      .toEqual(['thread-1', 'thread-2', 'thread-3', 'thread-4']);
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('courseId');
    expect(store.getState().threads.threadsById['thread-1'])
      .toHaveProperty('topicId');
    expect(store.getState().threads.threadsById['thread-1'].topicId)
      .toEqual(topicId);
  });

  test('successfully handles thread creation for topic that has not been preloaded', async () => {
    const topicId = 'test-topic';
    const title = 'A Test Thread';
    const content = 'Some test content';

    axiosMock.onPost(threadsApiUrl)
      .reply(200, Factory.build('thread', {
        course_id: courseId, topic_id: topicId, title, raw_body: content, rendered_body: content,
      }));

    expect(store.getState().threads.threadsInTopic[topicId])
      .toEqual(undefined);

    await executeThunk(createNewThread(courseId, topicId, 'discussion', title, content), store.dispatch, store.getState);

    expect(store.getState().threads.threadsInTopic[topicId])
      .toEqual(['thread-1']);
  });

  test('successfully handles thread updates', async () => {
    const threadId = 'thread-2';
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult'));
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);

    expect(store.getState().threads.threadsById[threadId].voted)
      .toEqual(false);

    axiosMock.onPatch(`${threadsApiUrl}${threadId}/`)
      .reply(200, Factory.build('thread', { voted: true, id: threadId }));
    await executeThunk(updateExistingThread(threadId, { voted: true }), store.dispatch, store.getState);

    expect(store.getState().threads.threadsById[threadId].voted)
      .toEqual(true);
  });

  test('successfully handles thread deletion', async () => {
    const threadId = 'thread-2';
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult'));
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);

    axiosMock.onDelete(`${threadsApiUrl}${threadId}/`)
      .reply(201);
    await executeThunk(removeThread(threadId), store.dispatch, store.getState);

    expect(store.getState().threads.threadsById)
      .not
      .toHaveProperty(threadId);
    expect(store.getState().threads.pages[0])
      .not
      .toContain(threadId);
    expect(store.getState().threads.threadsInTopic['test-topic'])
      .not
      .toContain(threadId);
  });
});
