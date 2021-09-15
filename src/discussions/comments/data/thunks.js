/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

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
  results.forEach(
    comment => {
      const { parentId, threadId, id } = comment;
      ids.push(id);
      if (parentId) {
        if (!commentsInComments[parentId]) {
          commentsInComments[parentId] = [];
        }
        if (!commentsInComments[parentId].includes(id)) {
          commentsInComments[parentId].push(id);
        }
      } else {
        if (!commentsInThreads[threadId]) {
          commentsInThreads[threadId] = [];
        }
        if (!commentsInThreads[threadId].includes(id)) {
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

export function fetchThreadComments(threadId, { page = 1 } = {}) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentsRequest({ threadId }));
      const data = await getThreadComments(threadId, { page });
      dispatch(fetchCommentsSuccess({
        ...normaliseComments(camelCaseObject(data)),
        page,
      }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCommentsDenied());
      } else {
        dispatch(fetchCommentsFailed());
      }
      logError(error);
    }
  };
}

export function fetchCommentResponses(commentId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentResponsesRequest({ commentId }));
      const data = await getCommentResponses(commentId);
      dispatch(fetchCommentResponsesSuccess(normaliseComments(camelCaseObject(data))));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCommentResponsesDenied());
      } else {
        dispatch(fetchCommentResponsesFailed());
      }
      logError(error);
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

export function addComment(comment, threadId, parentId) {
  return async (dispatch) => {
    try {
      dispatch(postCommentRequest({
        comment,
        threadId,
        parentId,
      }));
      const data = await postComment(comment, threadId, parentId);
      dispatch(postCommentSuccess(camelCaseObject(data)));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(postCommentDenied());
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
