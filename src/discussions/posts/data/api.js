/* eslint-disable import/prefer-default-export */
import snakeCase from 'lodash.snakecase';

import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

export const threadsApiUrl = `${apiBaseUrl}/api/discussion/v1/threads/`;

/**
 * Fetches all the threads in the given course and topic.
 * @param {string} courseId
 * @param {string} author
 * @param {[string]} topicIds List of topics to limit threads to
 * @param {number} page
 * @param {number} pageSize
 * @param {string} textSearch A search string to match.
 * @param {ThreadOrdering} orderBy The results wil be sorted on this basis.
 * @param {boolean} following If true, only threads followed by the current user will be returned.
 * @param {boolean} flagged If true, only threads that have been reported will be returned.
 * @param {ThreadViewStatus} view Set to "unread" on "unanswered" to filter to only those statuses.
 * @returns {Promise<{}>}
 */
export async function getThreads(
  courseId, {
    topicIds,
    page,
    pageSize,
    textSearch,
    orderBy,
    following,
    view,
    author,
    flagged,
  } = {},
) {
  const params = snakeCaseObject({
    courseId,
    page,
    pageSize,
    topicId: topicIds && topicIds.join(','),
    textSearch,
    orderBy: snakeCase(orderBy),
    following,
    view,
    requestedFields: 'profile_image',
    author,
    flagged,
  });

  const { data } = await getAuthenticatedHttpClient().get(threadsApiUrl, { params });
  return data;
}

/**
 * Fetches a single thread.
 * @param {string} threadId
 * @returns {Promise<{}>}
 */
export async function getThread(threadId) {
  const params = { requested_fields: 'profile_image' };
  const url = `${threadsApiUrl}${threadId}/`;
  const { data } = await getAuthenticatedHttpClient().get(url, { params });
  return data;
}

/**
 * Posts a new thread.
 * @param {string} courseId
 * @param {string} topicId
 * @param {ThreadType} type The thread's type (either "question" or "discussion")
 * @param {string} title
 * @param {string} content
 * @param {boolean} following Follow the thread after creating
 * @returns {Promise<{}>}
 */
export async function postThread(courseId, topicId, type, title, content, following = false, cohort) {
  const postData = snakeCaseObject({
    courseId,
    topicId,
    type,
    title,
    raw_body: content,
    following,
    groupId: cohort,
  });

  const { data } = await getAuthenticatedHttpClient().post(threadsApiUrl, postData);
  return data;
}

/**
 * Updates an existing thread.
 * @param {string} threadId
 * @param {string} topicId
 * @param {ThreadType} type The thread's type (either "question" or "discussion")
 * @param {string} title
 * @param {string} content
 * @param {boolean} flagged
 * @param {boolean} voted
 * @param {boolean} read
 * @param {boolean} following
 * @param {boolean} closed
 * @param {boolean} pinned
 * @returns {Promise<{}>}
 */
export async function updateThread(threadId, {
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
} = {}) {
  const url = `${threadsApiUrl}${threadId}/`;
  const patchData = snakeCaseObject({
    topicId,
    abuse_flagged: flagged,
    voted,
    read,
    type,
    title,
    raw_body: content,
    following,
    closed,
    pinned,
  });
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
