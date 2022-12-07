import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { EndorsementStatus } from '../../../data/constants';
import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
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
    {
      threadType: 'discussion',
      endorsed: EndorsementStatus.DISCUSSION,
    },
    {
      threadType: 'question',
      endorsed: EndorsementStatus.UNENDORSED,
    },
    {
      threadType: 'question',
      endorsed: EndorsementStatus.ENDORSED,
    },
  ])('successfully processes comments for \'$threadType\' thread with endorsed=$endorsed', async ({
    endorsed,
  }) => {
    const threadId = 'test-thread';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));

    await executeThunk(fetchThreadComments(threadId, { endorsed }), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads)
      .toEqual({ 'test-thread': { [endorsed]: ['comment-1', 'comment-2', 'comment-3'] } });
    expect(store.getState().comments.pagination)
      .toEqual({
        'test-thread': {
          [endorsed]: {
            currentPage: 1,
            totalPages: 1,
            hasMorePages: false,
          },
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

  test('successfully handles response creation for discussion type threads', async () => {
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
      .toEqual({
        [EndorsementStatus.DISCUSSION]: [
          'comment-1',
          'comment-2',
          'comment-3',
          'comment-4',
        ],
      });
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(store.getState().comments.commentsById['comment-4'].threadId)
      .toEqual(threadId);
  });

  test('successfully handles reply creation for discussion type threads', async () => {
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
      .toEqual({
        [EndorsementStatus.DISCUSSION]: [
          'comment-1',
          'comment-2',
          'comment-3',
        ],
      });
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4']);
    expect(store.getState().comments.commentsInComments[parentId])
      .toEqual(['comment-4']);
    expect(store.getState().comments.commentsById['comment-4'].threadId)
      .toEqual(threadId);
    expect(store.getState().comments.commentsById['comment-4'].parentId)
      .toEqual(parentId);
  });

  test('successfully handles comment creation for question type threads', async () => {
    const threadId = 'test-thread';
    const content = 'Test comment';
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult', null, { endorsed: false }));
    await executeThunk(
      fetchThreadComments(threadId, { endorsed: EndorsementStatus.UNENDORSED }),
      store.dispatch,
      store.getState,
    );
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult', null, { endorsed: true }));
    await executeThunk(
      fetchThreadComments(threadId, { endorsed: EndorsementStatus.ENDORSED }),
      store.dispatch,
      store.getState,
    );

    axiosMock.onPost(commentsApiUrl)
      .reply(200, Factory.build('comment', {
        thread_id: threadId,
        raw_body: content,
        rendered_body: content,
      }));

    await executeThunk(addComment(content, threadId, null), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads[threadId])
      .toEqual({
        [EndorsementStatus.UNENDORSED]: [
          'comment-1',
          'comment-2',
          'comment-3',
          // Newly-added comment
          'comment-7',
        ],
        [EndorsementStatus.ENDORSED]: [
          'comment-4',
          'comment-5',
          'comment-6',
        ],
      });
    expect(Object.keys(store.getState().comments.commentsById))
      .toEqual(['comment-1', 'comment-2', 'comment-3', 'comment-4', 'comment-5', 'comment-6', 'comment-7']);
    expect(store.getState().comments.commentsById['comment-7'].threadId)
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

  test('correctly handles comment responses pagination after posting a new response', async () => {
    const threadId = 'test-thread';
    const commentId = 'comment-1';

    // This will generate 3 comments, so the responses will start at id = 'comment-4'
    axiosMock.onGet(commentsApiUrl)
      .reply(200, Factory.build('commentsResult'));
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
    axiosMock.onPost(commentsApiUrl)
      .reply(200, comment);
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

    expect(store.getState().comments.commentsInComments[commentId])
      .toEqual([
        'comment-4',
        'comment-5',
        'comment-6',
        'comment-7',
        // our comment was pushed down
        'comment-8',
        // the newer comment is placed correctly
        'comment-9',
      ]);
  });

  test.each([
    {
      threadType: 'discussion',
      endorsed: EndorsementStatus.DISCUSSION,
    },
    {
      threadType: 'unendorsed',
      endorsed: EndorsementStatus.UNENDORSED,
    },
  ])('correctly handles `$threadType` thread comments pagination after posting a new comment', async ({ endorsed }) => {
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
    await executeThunk(fetchThreadComments(threadId, { endorsed }), store.dispatch, store.getState);

    // Post new comment
    const comment = Factory.build('comment', { thread_id: threadId });
    allComments.push(comment);
    axiosMock.onPost(commentsApiUrl)
      .reply(200, comment);
    await executeThunk(addComment('Test Comment', threadId, null), store.dispatch, store.getState);

    // Somebody else posted a new response now
    allComments.push(Factory.build('comment', { thread_id: threadId }));

    // Load next comment page
    axiosMock.onGet(commentsApiUrl)
      .reply(200, {
        results: allComments.slice(3, 6),
        pagination: { count: 6, numPages: 2 },
      });
    await executeThunk(fetchThreadComments(threadId, { page: 2, endorsed }), store.dispatch, store.getState);

    expect(store.getState().comments.commentsInThreads[threadId][endorsed])
      .toEqual([
        'comment-1',
        'comment-2',
        'comment-3',
        'comment-4',
        // our comment was pushed down
        'comment-5',
        // the newer comment is placed correctly
        'comment-6',
      ]);
  });
});
