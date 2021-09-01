/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Comments API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

export const commentsApiUrl = `${apiBaseUrl}/api/discussion/v1/comments/`;

/**
 * Returns all the comments for the specified thread.
 * @param {string} threadId
 * @param {number=} page
 * @param {number=} pageSize
 * @returns {Promise<{}>}
 */
export async function getThreadComments(
  threadId, {
    page,
    pageSize,
  } = {},
) {
  const params = snakeCaseObject({
    threadId,
    page,
    pageSize,
    requestedFields: 'profile_image',
  });

  const { data } = await getAuthenticatedHttpClient()
    .get(commentsApiUrl, { params });
  return data;
}

/**
 * Fetches a responses to a comment.
 * @param {string} commentId
 * @param {number=} page
 * @param {number=} pageSize
 * @returns {Promise<{}>}
 */
export async function getCommentResponses(
  commentId, {
    page,
    pageSize,
  } = {},
) {
  const url = `${commentsApiUrl}${commentId}/`;
  const params = snakeCaseObject({
    page,
    pageSize,
    requestedFields: 'profile_image',
  });
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
export async function postComment(comment, threadId, parentId = null) {
  const { data } = await getAuthenticatedHttpClient()
    .post(commentsApiUrl, snakeCaseObject({ threadId, raw_body: comment, parentId }));
  return data;
}

/**
 * Updates existing comment.
 * @param {string} commentId ID of comment to update.
 * @param {string=} comment Raw updated comment data to post.
 * @param {boolean=} voted
 * @param {boolean=} flagged
 * @param {boolean=} endorsed
 * @returns {Promise<{}>}
 */
export async function updateComment(commentId, {
  comment,
  voted,
  flagged,
  endorsed,
}) {
  const url = `${commentsApiUrl}${commentId}/`;
  const postData = {
    raw_body: comment,
    voted,
    abuse_flagged: flagged,
    endorsed,
  };

  const { data } = await getAuthenticatedHttpClient()
    .patch(url, postData, { headers: { 'Content-Type': 'application/merge-patch+json' } });
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
