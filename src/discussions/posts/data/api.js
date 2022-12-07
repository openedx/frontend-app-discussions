/* eslint-disable import/prefer-default-export */
import snakeCase from 'lodash.snakecase';

import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

export const getThreadsApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/threads/`;
export const getCoursesApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/`;

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
 * @param {string} threadType Can be 'discussion' or 'question'.
 * @param {ThreadViewStatus} view Set to "unread" on "unanswered" to filter to only those statuses.
 * @param {boolean} countFlagged If true, abuseFlaggedCount will be available.
 * @param {number} cohort
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
    threadType,
    countFlagged,
    cohort,
  } = {},
) {
  const params = snakeCaseObject({
    courseId,
    page,
    pageSize,
    topicId: topicIds && topicIds.join(','),
    textSearch,
    threadType,
    orderBy: snakeCase(orderBy),
    following,
    view,
    requestedFields: 'profile_image',
    author,
    flagged,
    countFlagged,
    groupId: cohort,
  });
  const { data } = await getAuthenticatedHttpClient().get(getThreadsApiUrl(), { params });
  return data;
}

/**
 * Fetches a single thread.
 * @param {string} threadId
 * @returns {Promise<{}>}
 */
export async function getThread(threadId, courseId) {
  const params = { requested_fields: 'profile_image', course_id: courseId };
  const url = `${getThreadsApiUrl()}${threadId}/`;
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
 * @param {number} cohort
 * @param {boolean} following Follow the thread after creating
 * @param {boolean} anonymous Should the thread be anonymous to all users
 * @param {boolean} anonymousToPeers Should the thread be anonymous to peers
 * @returns {Promise<{}>}
 */
export async function postThread(
  courseId,
  topicId,
  type,
  title,
  content,
  {
    following,
    cohort,
    anonymous,
    anonymousToPeers,
  } = {},
) {
  const postData = snakeCaseObject({
    courseId,
    topicId,
    type,
    title,
    raw_body: content,
    following,
    anonymous,
    anonymousToPeers,
    groupId: cohort,
  });

  const { data } = await getAuthenticatedHttpClient()
    .post(getThreadsApiUrl(), postData);
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
 * @param {string} editReasonCode
 * @param {string} closeReasonCode
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
  editReasonCode,
  closeReasonCode,
} = {}) {
  const url = `${getThreadsApiUrl()}${threadId}/`;
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
    editReasonCode,
    closeReasonCode,
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
  const url = `${getThreadsApiUrl()}${threadId}/`;
  await getAuthenticatedHttpClient()
    .delete(url);
}

/**
 * Upload a file.
 * @param {Blob} blob The file body
 * @param {string} filename
 * @param {string} courseId
 * @param {string} threadKey
 * @returns {Promise<{ location: string }>}
 */
export async function uploadFile(blob, filename, courseId, threadKey) {
  const uploadUrl = `${getCoursesApiUrl()}${courseId}/upload`;
  const formData = new FormData();
  formData.append('thread_key', threadKey);
  formData.append('uploaded_file', blob, filename);
  const { data } = await getAuthenticatedHttpClient().post(uploadUrl, formData);
  if (data.developer_message) {
    throw new Error(data.developer_message);
  }
  return data;
}
