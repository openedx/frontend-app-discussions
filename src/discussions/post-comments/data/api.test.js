import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCommentsApiUrl } from './api';
import {
  addComment, editComment, fetchCommentResponses, fetchThreadComments, removeComment,
} from './thunks';

import './__factories__';

const threadId = 'test-thread';
const commentId = 'comment-1';
const content = 'Test comment';
const newComment = 'Edited comment';
const commentsApiUrl = getCommentsApiUrl();
let axiosMock = null;
let store;

describe('Post comments view api tests', () => {
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

  test('successfully get thread comments', async () => {
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
    await executeThunk(fetchThreadComments(threadId, { endorsed: 'discussion' }), store.dispatch, store.getState);

    expect(Object.keys(store.getState().comments.commentsById)).toEqual(['comment-1', 'comment-2', 'comment-3']);
  });

  it('failed to fetch thread comments', async () => {
    axiosMock.onGet(commentsApiUrl).reply(404);
    await executeThunk(fetchThreadComments(threadId, { endorsed: 'discussion' }), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('failed');
  });

  it('denied to fetch thread comments', async () => {
    axiosMock.onGet(commentsApiUrl).reply(403, {});
    await executeThunk(fetchThreadComments(threadId, { endorsed: 'discussion' }), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('denied');
  });

  test('successfully fetched comment responses', async () => {
    axiosMock.onGet(`${commentsApiUrl}${commentId}/`)
      .reply(200, Factory.build('commentsResult', null, { parentId: commentId }));
    await executeThunk(fetchCommentResponses(commentId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInComments)
      .toEqual({ 'comment-1': ['comment-4', 'comment-5', 'comment-6'] });
  });

  it('failed to fetch comment responses', async () => {
    axiosMock.onGet(`${commentsApiUrl}${commentId}/`).reply(404);
    await executeThunk(fetchCommentResponses(commentId), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('failed');
  });

  it('denied to fetch comment responses', async () => {
    axiosMock.onGet(`${commentsApiUrl}${commentId}/`).reply(403, {});
    await executeThunk(fetchCommentResponses(commentId), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('denied');
  });

  test('successfully added comment', async () => {
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onPost(commentsApiUrl)
      .reply(200, Factory.build('comment', {
        thread_id: threadId,
        raw_body: content,
        rendered_body: content,
      }));
    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('successful');
  });

  it('failed to add comment', async () => {
    axiosMock.onPost(commentsApiUrl).reply(404);
    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('failed');
  });

  it('denied to add comment', async () => {
    axiosMock.onPost(commentsApiUrl).reply(403, {});
    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('denied');
  });

  test('comment updated successfully', async () => {
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onPatch(`${commentsApiUrl}${commentId}/`)
      .reply(200, Factory.build('comment', {
        id: commentId,
        raw_body: newComment,
        rendered_body: newComment,
      }));
    await executeThunk(editComment(commentId, newComment), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('successful');
  });

  it('failed to update comment', async () => {
    axiosMock.onPatch(`${commentsApiUrl}${commentId}/`).reply(404);
    await executeThunk(editComment(commentId, newComment), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('failed');
  });

  it('denied to update comment', async () => {
    axiosMock.onPatch(`${commentsApiUrl}${commentId}/`).reply(403, {});
    await executeThunk(editComment(commentId, newComment), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('denied');
  });

  test('comment removed successfully', async () => {
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onDelete(`${commentsApiUrl}${commentId}/`).reply(201);
    await executeThunk(removeComment(commentId, threadId), store.dispatch, store.getState);

    expect(store.getState().comments.status).toEqual('successful');
  });

  it('failed to remove comment', async () => {
    axiosMock.onDelete(`${commentsApiUrl}${commentId}/`).reply(404);
    await executeThunk(removeComment(commentId, threadId), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('failed');
  });

  it('denied to remove comment', async () => {
    axiosMock.onDelete(`${commentsApiUrl}${commentId}/`).reply(403, {});
    await executeThunk(removeComment(commentId, threadId), store.dispatch, store.getState);

    expect(store.getState().comments.postStatus).toEqual('denied');
  });
});
