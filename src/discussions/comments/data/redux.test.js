import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { commentsApiUrl } from './api';
import {
  addComment, editComment, fetchCommentResponses, fetchThreadComments, removeComment,
} from './thunks';

import './__factories__';

let axiosMock;
let store;

describe('Comments/Responses data layer tests', () => {
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

  test('successfully processes comments', async () => {
    const threadId = 'test-thread';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads)
      .toEqual({ 'test-thread': ['comment-1', 'comment-2', 'comment-3'] });
    expect(store.getState().comments.pages)
      .toEqual([['comment-1', 'comment-2', 'comment-3']]);
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3']);
    expect(store.getState().comments.commentsById['comment-1'])
      .toHaveProperty('threadId');
    expect(store.getState().comments.commentsById['comment-1'])
      .toHaveProperty('parentId');
    expect(store.getState().comments.commentsById['comment-1'].threadId)
      .toEqual('test-thread');
  });

  test('successfully processes comment responses', async () => {
    const threadId = 'test-thread';
    const commentId = 'comment-1';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onGet(`${commentsApiUrl}${commentId}/`)
      .reply(200, Factory.build('commentsResult', null, { parentId: commentId }));
    // get some comments into the store first
    await executeThunk(fetchCommentResponses(commentId), store.dispatch, store.getState);

    expect(Object.keys(store.getState().comments.commentsById))
      .toHaveLength(6);
    expect(store.getState().comments.commentsInComments)
      .toEqual({ 'comment-1': ['comment-4', 'comment-5', 'comment-6'] });
  });

  test('successfully handles comment creation', async () => {
    const threadId = 'test-thread';
    const content = 'Test comment';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onPost(`${commentsApiUrl}`)
      .reply(200, Factory.build('comment', {
        thread_id: threadId,
        raw_body: content,
        rendered_body: content,
      }));

    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads[threadId])
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(store.getState().comments.commentsById['comment-4'].threadId)
      .toEqual(threadId);
  });

  test('successfully handles comment edits', async () => {
    const threadId = 'test-thread';
    const commentId = 'comment-1';
    const newComment = 'Edited comment';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsById[commentId].rawBody)
      .not
      .toEqual(newComment);

    axiosMock.onPatch(`${commentsApiUrl}${commentId}/`)
      .reply(200, Factory.build('comment', {
        id: commentId,
        raw_body: newComment,
        rendered_body: newComment,
      }));

    await executeThunk(editComment(commentId, newComment), store.dispatch, store.getState);

    expect(store.getState().comments.commentsById[commentId].rawBody)
      .toEqual(newComment);
  });

  test('successfully handles comment deletion', async () => {
    const threadId = 'test-thread';
    const commentId = 'comment-1';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsById)
      .toHaveProperty(commentId);
    expect(store.getState().comments.pages[0])
      .toContain(commentId);

    axiosMock.onDelete(`${commentsApiUrl}${commentId}/`)
      .reply(201);

    await executeThunk(removeComment(commentId, threadId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsById)
      .not
      .toHaveProperty(commentId);
    expect(store.getState().comments.pages[0])
      .not
      .toContain(commentId);
    expect(store.getState().comments.commentsInThreads[threadId])
      .not
      .toContain(commentId);
  });
});
