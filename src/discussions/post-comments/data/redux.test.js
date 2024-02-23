import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { ThreadType } from '../../../data/constants';
import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCommentsApiUrl } from './api';
import {
  addComment, editComment, fetchCommentResponses, fetchThreadComments, removeComment,
} from './thunks';

import './__factories__';

const commentsApiUrl = getCommentsApiUrl();
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

  test.each([
    ThreadType.DISCUSSION,
    ThreadType.QUESTION,
  ])('successfully processes comments for %s type thread', async (threadType) => {
    const threadId = 'test-thread';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId, { threadType }), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads)
      .toEqual({ 'test-thread': ['comment-1', 'comment-2', 'comment-3'] });
    expect(store.getState().comments.pagination)
      .toEqual({
        'test-thread': {
          currentPage: 1,
          totalPages: 1,
          hasMorePages: false,
        },
      });
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3']);
    expect(store.getState().comments.commentsById['comment-1'])
      .toHaveProperty('threadId');
    expect(store.getState().comments.commentsById['comment-1'])
      .toHaveProperty('parentId');
    expect(store.getState().comments.commentsById['comment-1'].threadId)
      .toEqual('test-thread');
  });

  test('successfully processes comment replies', async () => {
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

  test('successfully handles comment creation for threads', async () => {
    const threadId = 'test-thread';
    const content = 'Test comment';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onPost(commentsApiUrl)
      .reply(200, Factory.build('comment', {
        thread_id: threadId,
        raw_body: content,
        rendered_body: content,
      }));

    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads[threadId])
      .toEqual([
        'comment-1',
        'comment-2',
        'comment-3',
        'comment-4',
      ]);
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(store.getState().comments.commentsById['comment-4'].threadId)
      .toEqual(threadId);
  });

  test('successfully handles reply creation for threads', async () => {
    const threadId = 'test-thread';
    const parentId = 'comment-1';
    const content = 'Test comment';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    expect(store.getState().comments.commentsInComments)
      .not.toHaveProperty(parentId);

    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    axiosMock.onPost(commentsApiUrl)
      .reply(200, Factory.build('comment', {
        thread_id: threadId,
        parent_id: parentId,
        raw_body: content,
        rendered_body: content,
      }));

    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads[threadId])
      .toEqual([
        'comment-1',
        'comment-2',
        'comment-3',
      ]);
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(store.getState().comments.commentsInComments[parentId])
      .toEqual(['comment-4']);
    expect(store.getState().comments.commentsById['comment-4'].threadId)
      .toEqual(threadId);
    expect(store.getState().comments.commentsById['comment-4'].parentId)
      .toEqual(parentId);
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

    axiosMock.onDelete(`${commentsApiUrl}${commentId}/`)
      .reply(201);

    await executeThunk(removeComment(commentId, threadId), store.dispatch, store.getState);

    expect(store.getState().comments.commentsById)
      .not
      .toHaveProperty(commentId);
    expect(store.getState().comments.commentsInThreads[threadId])
      .not
      .toContain(commentId);
  });

  test('correctly handles comment replies pagination after posting a new reply', async () => {
    const threadId = 'test-thread';
    const commentId = 'comment-1';

    // This will generate 3 comments, so the responses will start at id = 'comment-4'
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
    await executeThunk(fetchThreadComments(threadId), store.dispatch, store.getState);

    // Build all comments first, so we can paginate over them and they
    // keep a previous creation timestamp
    const allResponses = Factory.buildList('comment', 4, {
      thread_id: threadId,
      parent_id: commentId,
    });

    // load the first page of responses
    axiosMock.onGet(`${commentsApiUrl}${commentId}/`)
      .reply(200, {
        results: allResponses.slice(0, 3),
        pagination: { count: 5, numPages: 2 },
      });
    await executeThunk(fetchCommentResponses(commentId), store.dispatch, store.getState);

    // Post new response
    const comment = Factory.build('comment', {
      thread_id: threadId,
      parent_id: commentId,
    });
    allResponses.push(comment);
    axiosMock.onPost(commentsApiUrl).reply(200, comment);
    await executeThunk(addComment('Test Comment', threadId, null), store.dispatch, store.getState);

    // Someone else posted a new response now
    allResponses.push(Factory.build('comment', { parent_id: commentId, thread_id: threadId }));

    // Load next comment page
    axiosMock.onGet(`${commentsApiUrl}${commentId}/`)
      .reply(200, {
        results: allResponses.slice(3, 6),
        pagination: { count: 6, numPages: 2 },
      });
    await executeThunk(fetchCommentResponses(commentId, { page: 2 }), store.dispatch, store.getState);

    // sorting is implemented on backend
    expect(store.getState().comments.commentsInComments[commentId])
      .toEqual([
        'comment-4',
        'comment-5',
        'comment-6',
        'comment-8',
        'comment-7',
        'comment-9',
      ]);
  });

  test.each([
    ThreadType.DISCUSSION,
    ThreadType.QUESTION,
  ])('correctly handles %s thread comments pagination after posting a new comment', async (threadType) => {
    const threadId = 'test-thread';

    // Build all comments first, so we can paginate over them and they
    // keep a previous creation timestamp
    const allComments = Factory.buildList('comment', 4, { thread_id: threadId });

    // Load the first page of comments
    axiosMock.onGet(commentsApiUrl)
      .reply(200, {
        results: allComments.slice(0, 3),
        pagination: { count: 4, numPages: 2 },
      });
    await executeThunk(fetchThreadComments(threadId, { threadType }), store.dispatch, store.getState);

    // Post new comment
    const comment = Factory.build('comment', { thread_id: threadId });
    allComments.push(comment);
    axiosMock.onPost(commentsApiUrl).reply(200, comment);
    await executeThunk(addComment('Test Comment', threadId, null), store.dispatch, store.getState);

    // Somebody else posted a new response now
    allComments.push(Factory.build('comment', { thread_id: threadId }));

    // Load next comment page
    axiosMock.onGet(commentsApiUrl)
      .reply(200, {
        results: allComments.slice(3, 6),
        pagination: { count: 6, numPages: 2 },
      });
    await executeThunk(fetchThreadComments(threadId, { page: 2, threadType }), store.dispatch, store.getState);

    // sorting is implemented on backend
    expect(store.getState().comments.commentsInThreads[threadId])
      .toEqual([
        'comment-1',
        'comment-2',
        'comment-3',
        'comment-5',
        'comment-4',
        'comment-6',
      ]);
  });
});
