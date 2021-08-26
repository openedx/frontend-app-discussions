/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { PostsStatusFilter } from '../../../data/constants';
import { getHttpErrorStatus } from '../../utils';
import {
  deleteThread, getThread, getThreads, postThread, updateThread,
} from './api';
import {
  deleteThreadDenied,
  deleteThreadFailed,
  deleteThreadRequest,
  deleteThreadSuccess,
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

/**
 * Filters to apply to a thread/posts query.
 * @typedef {Object} ThreadFilter
 * @property {PostsStatusFilter} status
 * @property {AllPostsFilter} allPosts
 */

/**
 * Fetches the threads for the course specified va the threadIds.
 * @param {string} courseId The course ID for the course to fetch data for.
 * @param {[string]} topicIds List of topics to limit threads to
 * @param {ThreadOrdering} orderBy The results will be sorted on this basis.
 * @param {ThreadFilter} filters The set of filters to apply to the thread.
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchThreads(courseId, {
  topicIds,
  orderBy,
  filters = {},
} = {}) {
  const options = {
    orderBy,
    topicIds,
  };
  if (filters.status === PostsStatusFilter.FOLLOWING) {
    options.following = true;
  }
  if (filters.status === PostsStatusFilter.UNREAD) {
    options.view = 'unread';
  }
  if (filters.search) {
    options.textSearch = filters.search;
  }
  return async (dispatch) => {
    try {
      dispatch(fetchThreadsRequest({ courseId }));
      const data = await getThreads(courseId, options);
      dispatch(fetchThreadsSuccess(camelCaseObject(data)));
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
      dispatch(fetchThreadSuccess(camelCaseObject(data)));
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

export function markThreadAsRead(threadId) {
  return async (dispatch) => {
    try {
      dispatch(updateThreadRequest({ threadId, read: true }));
      const data = await updateThread(threadId, { read: true });
      dispatch(updateThreadSuccess(camelCaseObject(data)));
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
      dispatch(postThreadSuccess(camelCaseObject(data)));
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
  flagged, voted, read, topicId, type, title, content, following,
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
        following,
      }));
      const data = await updateThread(threadId, {
        flagged,
        voted,
        read,
        topicId,
        type,
        title,
        content,
        following,
      });
      dispatch(updateThreadSuccess(camelCaseObject(data)));
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
      dispatch(deleteThreadSuccess({ threadId }));
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
