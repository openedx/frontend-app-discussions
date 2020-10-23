/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import { getThreadComments } from './api';
import { fetchCommentsFailed, fetchCommentsRequest, fetchCommentsSuccess } from './slices';

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
