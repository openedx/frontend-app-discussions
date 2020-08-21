/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import {
  deleteComment, getComment, getThreadComments, postComment, updateComment,
} from './api';
import {
  deleteCommentDenied,
  deleteCommentFailed,
  deleteCommentRequest,
  deleteCommentSuccess,
  fetchCommentDenied,
  fetchCommentFailed,
  fetchCommentRequest,
  fetchCommentsDenied,
  fetchCommentsFailed,
  fetchCommentsRequest,
  fetchCommentsSuccess,
  fetchCommentSuccess,
  postCommentDenied,
  postCommentFailed,
  postCommentRequest,
  postCommentSuccess,
  updateCommentDenied,
  updateCommentFailed,
  updateCommentRequest,
  updateCommentSuccess,
} from './slices';

export function fetchThreadComments(threadId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentsRequest({ threadId }));
      const data = await getThreadComments(threadId);
      dispatch(fetchCommentsSuccess(data));
    } catch (error) {
      const { httpErrorStatus } = error && error.customAttributes;
      if (httpErrorStatus === 403) {
        dispatch(fetchCommentsDenied());
      } else {
        dispatch(fetchCommentsFailed());
      }
      logError(error);
    }
  };
}

export function fetchComment(commentId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentRequest({ commentId }));
      const data = await getComment(commentId);
      dispatch(fetchCommentSuccess(data));
    } catch (error) {
      const { httpErrorStatus } = error && error.customAttributes;
      if (httpErrorStatus === 403) {
        dispatch(fetchCommentDenied());
      } else {
        dispatch(fetchCommentFailed());
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
      dispatch(updateCommentSuccess(data));
    } catch (error) {
      const { httpErrorStatus } = error && error.customAttributes;
      if (httpErrorStatus === 403) {
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
      dispatch(postCommentSuccess(data));
    } catch (error) {
      const { httpErrorStatus } = error && error.customAttributes;
      if (httpErrorStatus === 403) {
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
      const { httpErrorStatus } = error && error.customAttributes;
      if (httpErrorStatus === 403) {
        dispatch(deleteCommentDenied());
      } else {
        dispatch(deleteCommentFailed());
      }
      logError(error);
    }
  };
}

// FIXME: For testing only
window.thunks = window.thunks ? window.thunks : {};
window.thunks.fetchThreadComments = fetchThreadComments;
window.thunks.fetchComment = fetchComment;
window.thunks.postComment = postComment;
window.thunks.updateComment = updateComment;
window.thunks.removeComment = removeComment;
