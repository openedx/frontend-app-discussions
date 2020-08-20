/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Comments API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

const commentsApiUrl = `${apiBaseUrl}/api/discussion/v1/comments/`;

/**
 * Returns all the comments for the specified thread.
 * @param {string} threadId
 * @param {number=} page
 * @param {number=} pageSize
 * @param {[string]=} requestedFields
 * @returns {Promise<{}>}
 */
export async function getThreadComments(
  threadId, {
    page, pageSize, requestedFields,
  } = {},
) {
  const params = {
    thread_id: threadId,
    page,
    page_size: pageSize,
    requested_fields: requestedFields,
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(commentsApiUrl, { params });
  return data;
}

/**
 * Fetches a single comment.
 * @param {string} commentId
 * @param {number=} page
 * @param {number=} pageSize
 * @param {[string]=} requestedFields
 * @returns {Promise<{}>}
 */
export async function getComment(
  commentId, {
    page, pageSize, requestedFields,
  } = {},
) {
  const url = `${commentsApiUrl}${commentId}/`;
  const params = {
    page,
    page_size: pageSize,
    requested_fields: requestedFields,
  };
  const { data } = await getAuthenticatedHttpClient()
    .get(url, { params });
  return data;
}

/**
 * Posts a comment.
 * @param {string} comment Raw comment data to post.
 * @param {string} threadId Thread ID for thread in which to post comment.
 * @param {string=} parentId ID for a comments parent.
 * @returns {Promise<{}>}
 */
export async function postComment(comment, threadId, parentId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(commentsApiUrl, {
      thread_id: threadId,
      raw_body: comment,
      parent_id: parentId,
    });
  return data;
}

/**
 * Updates existing comment.
 * @param {string} commentId ID of comment to update.
 * @param {string} comment Raw updated comment data to post.
 * @returns {Promise<{}>}
 */
export async function updateComment(commentId, comment) {
  const url = `${commentsApiUrl}${commentId}/`;

  const { data } = await getAuthenticatedHttpClient()
    .patch(url, {
      raw_body: comment,
    });
  return data;
}

/**
 * Deletes existing comment.
 * @param {string} commentId ID of comment to delete
 */
export async function deleteComment(commentId) {
  const url = `${commentsApiUrl}${commentId}/`;
  await getAuthenticatedHttpClient()
    .delete(url);
}

window.api = window.api ? window.api : {};
window.api.getThreadComments = getThreadComments;
window.api.getComment = getComment;
window.api.postComment = postComment;
window.api.updateComment = updateComment;
window.api.deleteComment = deleteComment;
