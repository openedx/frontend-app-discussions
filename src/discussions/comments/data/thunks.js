/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import { getPostComment, getPostReplies, getReplyInlineReplies } from './api';
import {
  fetchRepliesFailed,
  fetchRepliesRequest,
  fetchRepliesSuccess,
  fetchCommentFailed,
  fetchCommentRequest,
  fetchCommentSuccess,
  fetchInlineRepliesFailed,
  fetchInlineRepliesRequest,
  fetchInlineRepliesSuccess,
} from './slices';

export function fetchComment(postId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCommentRequest({ postId }));
      const data = await getPostComment(postId);
      dispatch(fetchCommentSuccess({ postId, data }));
    } catch (error) {
      dispatch(fetchCommentFailed());
      logError(error);
    }
  };
}

export function fetchPostReplies(postId) {
  return async (dispatch) => {
    try {
      dispatch(fetchRepliesRequest({ postId }));
      const data = await getPostReplies(postId);
      dispatch(fetchRepliesSuccess({ postId, data }));
    } catch (error) {
      dispatch(fetchRepliesFailed());
      logError(error);
    }
  };
}

export function fetchReplyInlineReplies(replyId) {
  return async (dispatch) => {
    try {
      dispatch(fetchInlineRepliesRequest({ replyId }));
      const data = await getReplyInlineReplies(replyId);
      dispatch(fetchInlineRepliesSuccess({ replyId, data }));
    } catch (error) {
      dispatch(fetchInlineRepliesFailed());
      logError(error);
    }
  };
}
