/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

const threadsApiUrl = `${apiBaseUrl}/api/discussion/v1/threads/`;

/**
 * Fetches all the threads in the given course and topic.
 * @param {string} courseId
 * @param {[string]} topicIds List of topics to limit threads to
 * @param {number} page
 * @param {number} pageSize
 * @param {string} textSearch A search string to match.
 * @param {ThreadOrdering} orderBy The results wil be sorted on this basis.
 * @param {boolean} following If true, only threads followed by the current user will be returned.
 * @param {ThreadViewStatus} view Set to "unread" on "unanswered" to filter to only those statuses.
 * @param {string} requestedFields List of additional field to include in returned data.
 * @returns {Promise<{}>}
 */
export async function getThreads(
  courseId, topicIds, {
    page, pageSize, textSearch, orderBy, following, view, requestedFields,
  } = {},
) {
  const params = {
    course_id: courseId,
    page,
    page_size: pageSize,
    topic_id: topicIds && topicIds.join(','),
    text_search: textSearch,
    order_by: orderBy,
    following,
    view,
    requested_fields: requestedFields,
  };

  const { data } = await getAuthenticatedHttpClient().get(threadsApiUrl, { params });
  return data;
}

/**
 * Fetches a single thread.
 * @param {string} threadId
 * @param {string} requestedFields List of additional field to include in returned data.
 * @returns {Promise<{}>}
 */
export async function getThread(threadId, requestedFields) {
  const params = { requested_fields: requestedFields };
  const url = `${threadsApiUrl}${threadId}/`;
  const { data } = await getAuthenticatedHttpClient().get(url, { params });
  return data;
}

/**
 * Posts a new thread.
 * @param {string} courseId
 * @param {string} topicId
 * @param {string} type The thread's type (either "question" or "discussion")
 * @param {string} title
 * @param {string} content
 * @param {boolean} following Follow the thread after creating
 * @returns {Promise<{}>}
 */
export async function postThread(courseId, topicId, type, title, content, following = false) {
  const postData = {
    course_id: courseId,
    topic_id: topicId,
    type,
    title,
    raw_body: content,
    following,
  };

  const { data } = await getAuthenticatedHttpClient().post(threadsApiUrl, postData);
  return data;
}

/**
 * Updates an existing thread.
 * @param {string} threadId
 * @param {string} topicId
 * @param {string} type The thread's type (either "question" or "discussion")
 * @param {string} title
 * @param {string} content
 * @param {boolean} flagged
 * @param {boolean} voted
 * @param {boolean} read
 * @returns {Promise<{}>}
 */
export async function updateThread(threadId, {
  flagged, voted, read, topicId, type, title, content,
} = {}) {
  const url = `${threadsApiUrl}${threadId}/`;
  const patchData = {
    topic_id: topicId,
    abuse_flagged: flagged,
    voted,
    read,
    type,
    title,
    raw_body: content,
  };

  const { data } = await getAuthenticatedHttpClient()
    .patch(url, patchData, { headers: { 'Content-Type': 'application/merge-patch+json' } });
  return data;
}

/**
 * Deletes a thread.
 * @param {string} threadId
 */
export async function deleteThread(threadId) {
  const url = `${threadsApiUrl}${threadId}/`;
  await getAuthenticatedHttpClient().delete(url);
}

// FIXME: For testing only.

window.api = window.api ? window.api : {};
window.api.getThreads = getThreads;
window.api.getThread = getThread;
window.api.postThread = postThread;
window.api.updateThread = updateThread;
window.api.deleteThread = deleteThread;
