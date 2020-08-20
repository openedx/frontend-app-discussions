/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import {
  deleteComment, getComment, getThreadComments, updateComment,
} from './api';
import {
  fetchCommentsFailed,
  fetchCommentsRequest,
  fetchCommentsSuccess,
  fetchCommentFailed,
  fetchCommentRequest,
  fetchCommentSuccess,
  updateCommentRequest,
  updateCommentSuccess,
  updateCommentFailed,
  deleteCommentRequest,
  deleteCommentSuccess,
  deleteCommentFailed,
} from './slices';

export function fetchTopicComments(topicId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentsRequest({ topicId }));
      const data = await getThreadComments(topicId);
      dispatch(fetchCommentsSuccess({ topicId, data }));
    } catch (error) {
      dispatch(fetchCommentsFailed());
      logError(error);
    }
  };
}

export function fetchComment(commentId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentRequest({ commentId }));
      const data = await getComment(commentId);
      dispatch(fetchCommentSuccess({ commentId, data }));
    } catch (error) {
      dispatch(fetchCommentFailed());
      logError(error);
    }
  };
}

export function editComment(commentId, comment) {
  return async (dispatch) => {
    try {
      dispatch(updateCommentRequest({ commentId }));
      const data = await updateComment(commentId, comment);
      dispatch(updateCommentSuccess({ commentId, data }));
    } catch (error) {
      dispatch(updateCommentFailed());
      logError(error);
    }
  };
}

export function removeComment(commentId, threadId) {
  return async (dispatch) => {
    try {
      dispatch(deleteCommentRequest({ commentId }));
      await deleteComment(commentId);
      dispatch(deleteCommentSuccess({ commentId, threadId }));
    } catch (error) {
      dispatch(deleteCommentFailed());
      logError(error);
    }
  };
}
