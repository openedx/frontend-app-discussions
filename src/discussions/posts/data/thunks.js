/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import {
  PostsStatusFilter, ThreadType,
} from '../../../data/constants';
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
 * @property {ThreadType} postType
 */

/**
 * Normalises raw data returned by threads API by mapping threads to id and
 * mapping topic ids to threads in them.
 * @param data
 * @returns {{pagination, threadsById: {}, threadsInTopic: {}, avatars: {}}}
 */
function normaliseThreads(data) {
  const normalized = {};
  let threads;
  if ('results' in data) {
    threads = data.results;
    normalized.pagination = data.pagination;
  } else {
    threads = [data];
  }
  const threadsInTopic = {};
  const threadsById = {};
  let avatars = {};
  const ids = [];
  threads.forEach(
    thread => {
      const { topicId, id } = thread;
      ids.push(id);
      if (!threadsInTopic[topicId]) {
        threadsInTopic[topicId] = [];
      }
      if (!threadsInTopic[topicId].includes(id)) {
        threadsInTopic[topicId].push(id);
      }
      threadsById[id] = thread;
      avatars = { ...avatars, ...thread.users };
    },
  );
  return {
    ids, threadsById, threadsInTopic, avatars, ...normalized,
  };
}

/**
 * Fetches the threads for the course specified va the threadIds.
 * @param {string} courseId The course ID for the course to fetch data for.
 * @param {?string} author The author whose posts need to be viewed.
 * @param {[string]} topicIds List of topics to limit threads to
 * @param {ThreadOrdering} orderBy The results will be sorted on this basis.
 * @param {ThreadFilter} filters The set of filters to apply to the thread.
 * @param {number} page Page to fetch
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchThreads(courseId, {
  topicIds,
  orderBy,
  author = null,
  filters = {},
  page = 1,
} = {}) {
  const options = {
    orderBy,
    topicIds,
    page,
    author,
  };
  if (filters.status === PostsStatusFilter.FOLLOWING) {
    options.following = true;
  }
  if (filters.status === PostsStatusFilter.UNREAD) {
    options.view = 'unread';
  }
  if (filters.status === PostsStatusFilter.UNANSWERED) {
    options.view = 'unanswered';
  }
  if (filters.status === PostsStatusFilter.REPORTED) {
    options.flagged = true;
  }
  if (filters.postType !== ThreadType.ALL) {
    options.threadType = filters.postType;
  }
  if (filters.search) {
    options.textSearch = filters.search;
  }
  return async (dispatch) => {
    try {
      dispatch(fetchThreadsRequest({ courseId }));
      const data = await getThreads(courseId, options);
      const normalisedData = normaliseThreads(camelCaseObject(data));
      dispatch(fetchThreadsSuccess({ ...normalisedData, page, author }));
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
      dispatch(fetchThreadSuccess(normaliseThreads(camelCaseObject(data))));
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

export function createNewThread({
  courseId,
  topicId,
  type,
  title,
  content,
  following,
  anonymous,
  anonymousToPeers,
  cohort,
}) {
  return async (dispatch) => {
    try {
      dispatch(postThreadRequest({
        courseId,
        topicId,
        type,
        title,
        content,
        following,
        anonymous,
        anonymousToPeers,
        cohort,
      }));
      const data = await postThread(courseId, topicId, type, title, content, {
        cohort,
        following,
        anonymous,
        anonymousToPeers,
      });
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
  flagged, voted, read, topicId, type, title, content, following, closed, pinned, closeReasonCode, editReasonCode,
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
        closed,
        pinned,
        editReasonCode,
        closeReasonCode,
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
        closed,
        pinned,
        editReasonCode,
        closeReasonCode,
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
