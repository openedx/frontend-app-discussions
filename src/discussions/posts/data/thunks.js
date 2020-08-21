/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import {
  deleteThread,
  getThread, getThreads, postThread, updateThread,
} from './api';
import {
  fetchThreadFailed,
  fetchThreadRequest,
  fetchThreadsFailed,
  fetchThreadsRequest,
  fetchThreadsSuccess,
  fetchThreadSuccess,
  postThreadFailed,
  postThreadRequest,
  postThreadSuccess,
} from './slices';

export function fetchThreads(courseId, topicIds) {
  return async (dispatch) => {
    try {
      dispatch(fetchThreadsRequest({ courseId }));
      const data = await getThreads(courseId, topicIds);
      dispatch(fetchThreadsSuccess(data));
    } catch (error) {
      dispatch(fetchThreadsFailed());
      logError(error);
    }
  };
}

export function fetchThread(threadId) {
  return async (dispatch) => {
    try {
      dispatch(fetchThreadRequest({ threadId }));
      const data = await getThread(threadId);
      dispatch(fetchThreadSuccess(data));
    } catch (error) {
      dispatch(fetchThreadFailed());
      logError(error);
    }
  };
}

export function createNewThread(courseId, topicId, type, title, content, following = false) {
  return async (dispatch) => {
    try {
      dispatch(postThreadRequest({
        courseId,
        topicId,
        type,
        title,
        content,
        following,
      }));
      const data = await postThread(courseId, topicId, type, title, content, following);
      dispatch(postThreadSuccess(data));
    } catch (error) {
      dispatch(postThreadFailed());
      logError(error);
    }
  };
}

export function updateExistingThread(threadId, {
  flagged, voted, read, topicId, type, title, content,
}) {
  return async (dispatch) => {
    try {
      dispatch(postThreadRequest({
        threadId,
        flagged,
        voted,
        read,
        topicId,
        type,
        title,
        content,
      }));
      const data = await updateThread(threadId, {
        flagged,
        voted,
        read,
        topicId,
        type,
        title,
        content,
      });
      dispatch(postThreadSuccess(data));
    } catch (error) {
      dispatch(postThreadFailed());
      logError(error);
    }
  };
}

// FIXME: For testing only
window.thunks = window.thunks ? window.thunks : {};
window.thunks.fetchThreads = fetchThreads;
window.thunks.fetchThread = fetchThread;
window.thunks.postThread = postThread;
window.thunks.updateExistingThread = updateExistingThread;
window.thunks.deleteThread = deleteThread;
