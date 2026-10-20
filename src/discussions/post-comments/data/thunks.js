import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { setContentCreationRateLimited } from '../../data/slices';
import { getHttpErrorStatus } from '../../utils';
import {
  deleteComment, getCommentResponses, getThreadComments, postComment, updateComment,
} from './api';
import {
  deleteCommentDenied,
  deleteCommentFailed,
  deleteCommentRequest,
  deleteCommentSuccess,
  fetchCommentResponsesDenied,
  fetchCommentResponsesFailed,
  fetchCommentResponsesRequest,
  fetchCommentResponsesSuccess,
  fetchCommentsDenied,
  fetchCommentsFailed,
  fetchCommentsRequest,
  fetchCommentsSuccess,
  postCommentDenied,
  postCommentFailed,
  postCommentRequest,
  postCommentSuccess,
  updateCommentDenied,
  updateCommentFailed,
  updateCommentRequest,
  updateCommentSuccess,
} from './slices';

/**
 * Normalises comment data by mapping comments to ids, and grouping them by their
 * parent thread and comment.
 * @param data
 * @returns {{commentsInComments: {}, pagination, commentsById: {}, commentsInThreads: {}}}
 */
function normaliseComments(data) {
  const { pagination, results } = data;
  const commentsInThreads = {};
  const commentsInComments = {};
  const commentsById = {};
  const ids = [];
  const seenInComments = {};
  const seenInThreads = {};
  results.forEach(
    comment => {
      const { parentId, threadId, id } = comment;
      ids.push(id);
      if (parentId) {
        if (!commentsInComments[parentId]) {
          commentsInComments[parentId] = [];
          seenInComments[parentId] = new Set();
        }
        if (!seenInComments[parentId].has(id)) {
          seenInComments[parentId].add(id);
          commentsInComments[parentId].push(id);
        }
      } else {
        if (!commentsInThreads[threadId]) {
          commentsInThreads[threadId] = [];
          seenInThreads[threadId] = new Set();
        }
        if (!seenInThreads[threadId].has(id)) {
          seenInThreads[threadId].add(id);
          commentsInThreads[threadId].push(id);
        }
      }
      commentsById[id] = comment;
    },
  );
  return {
    ids,
    commentsInThreads,
    commentsInComments,
    commentsById,
    pagination,
  };
}

const pendingThreadFetches = new Set();

export function fetchThreadComments(
  threadId,
  {
    page = 1,
    reverseOrder,
    threadType,
    enableInContextSidebar,
    signal,
  } = {},
) {
  return async (dispatch, getState) => {
    const requestKey = `${threadId}-p${page}-r${reverseOrder}-d${showDeleted}-m${includeMuted}`;
    if (pendingThreadFetches.has(requestKey)) {
      return;
    }
    pendingThreadFetches.add(requestKey);
    try {
      dispatch(fetchCommentsRequest());
      const data = await getThreadComments(threadId, {
        page, reverseOrder, threadType, enableInContextSidebar, signal,
      });
      dispatch(fetchCommentsSuccess({
        ...normaliseComments(camelCaseObject(data)),
        page,
        threadId,
      }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCommentsDenied());
      } else {
        dispatch(fetchCommentsFailed());
      }
      logError(error);
    } finally {
      pendingThreadFetches.delete(requestKey);
    }
  };
}

/**
 * Tracks in-flight fetchCommentResponses calls by commentId.
 * Prevents duplicate parallel requests for the same comment's responses
 * when multiple re-renders or sort-order changes fire simultaneously.
 */
const pendingResponseFetches = new Set();

export function fetchCommentResponses(commentId, {
  page = 1, reverseOrder = true, showDeleted = false, includeMuted,
} = {}) {
  return async (dispatch, getState) => {
    const requestKey = `${commentId}-p${page}-r${reverseOrder}-d${showDeleted}-m${includeMuted}`;
    if (pendingResponseFetches.has(requestKey)) {
      return;
    }
    pendingResponseFetches.add(requestKey);
    try {
      dispatch(fetchCommentResponsesRequest({ commentId }));
      const data = await getCommentResponses(commentId, { page, reverseOrder });
      dispatch(fetchCommentResponsesSuccess({
        ...normaliseComments(camelCaseObject(data)),
        page,
        commentId,
      }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCommentResponsesDenied());
      } else {
        dispatch(fetchCommentResponsesFailed());
      }
      logError(error);
    } finally {
      pendingResponseFetches.delete(requestKey);
    }
  };
}

export function editComment(commentId, comment) {
  return async (dispatch) => {
    try {
      dispatch(updateCommentRequest({ commentId }));
      const data = await updateComment(commentId, comment);
      dispatch(updateCommentSuccess(camelCaseObject(data)));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(updateCommentDenied());
      } else {
        dispatch(updateCommentFailed());
      }
      logError(error);
    }
  };
}

export function addComment(comment, threadId, parentId = null, enableInContextSidebar = false, recaptchaToken = '') {
  return async (dispatch) => {
    try {
      dispatch(postCommentRequest({
        comment,
        threadId,
        parentId,
        recaptchaToken,
      }));
      const data = await postComment(comment, threadId, parentId, enableInContextSidebar, recaptchaToken);
      dispatch(postCommentSuccess(camelCaseObject(data)));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(postCommentDenied());
      } else if (getHttpErrorStatus(error) === 429) {
        dispatch(setContentCreationRateLimited());
      } else {
        dispatch(postCommentFailed());
      }
      logError(error);
    }
  };
}

export function removeComment(commentId, threadId) {
  return async (dispatch) => {
    try {
      dispatch(deleteCommentRequest({ commentId }));
      await deleteComment(commentId);
      dispatch(deleteCommentSuccess({
        commentId,
        threadId,
      }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(deleteCommentDenied());
      } else {
        dispatch(deleteCommentFailed());
      }
      logError(error);
    }
  };
}
