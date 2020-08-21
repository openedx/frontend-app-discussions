/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import { getHttpErrorStatus } from '../../utils';
import {
  deleteThread, getThread, getThreads, postThread, updateThread,
} from './api';
import {
  deleteThreadDenied,
  deleteThreadFailed,
  deleteThreadRequest,
  fetchThreadDenied,
  fetchThreadFailed,
  fetchThreadRequest,
  fetchThreadsDenied,
  fetchThreadsFailed,
  fetchThreadsRequest,
  fetchThreadsSuccess,
  fetchThreadSuccess,
  postThreadDenied,
  postThreadFailed,
  postThreadRequest,
  postThreadSuccess,
  updateThreadDenied,
  updateThreadFailed,
  updateThreadRequest,
  updateThreadSuccess,
} from './slices';

export function fetchThreads(courseId, topicIds) {
  return async (dispatch) => {
    try {
      dispatch(fetchThreadsRequest({ courseId }));
      const data = await getThreads(courseId, topicIds);
      dispatch(fetchThreadsSuccess(data));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchThreadsDenied());
      } else {
        dispatch(fetchThreadsFailed());
      }
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
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchThreadDenied());
      } else {
        dispatch(fetchThreadFailed());
      }
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
      if (getHttpErrorStatus(error) === 403) {
        dispatch(postThreadDenied());
      } else {
        dispatch(postThreadFailed());
      }
      logError(error);
    }
  };
}

export function updateExistingThread(threadId, {
  flagged, voted, read, topicId, type, title, content,
}) {
  return async (dispatch) => {
    try {
      dispatch(updateThreadRequest({
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
      dispatch(updateThreadSuccess(data));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(updateThreadDenied());
      } else {
        dispatch(updateThreadFailed());
      }
      logError(error);
    }
  };
}

export function removeThread(threadId) {
  return async (dispatch) => {
    try {
      dispatch(deleteThreadRequest({ threadId }));
      await deleteThread(threadId);
      dispatch(postThreadSuccess({ threadId }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(deleteThreadDenied());
      } else {
        dispatch(deleteThreadFailed());
      }
      logError(error);
    }
  };
}

// FIXME: For testing only
window.thunks = window.thunks ? window.thunks : {};
window.thunks.fetchThreads = fetchThreads;
window.thunks.fetchThread = fetchThread;
window.thunks.createNewThread = createNewThread;
window.thunks.updateExistingThread = updateExistingThread;
window.thunks.removeThread = removeThread;
