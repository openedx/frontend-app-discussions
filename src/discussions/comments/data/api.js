/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { EndorsementValue } from '../../../data/constants';

ensureConfig([
  'LMS_BASE_URL',
], 'Comments API service');

export const getCommentsApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/comments/`;

/**
 * Returns all the comments for the specified thread.
 * @param {string} threadId
 * @param {EndorsementStatus} endorsed
 * @param {number=} page
 * @param {number=} pageSize
 * @returns {Promise<{}>}
 */
export async function getThreadComments(
  threadId, {
    endorsed,
    page,
    pageSize,
  } = {},
) {
  const params = snakeCaseObject({
    threadId,
    endorsed: EndorsementValue[endorsed],
    page,
    pageSize,
    requestedFields: 'profile_image',
  });

  const { data } = await getAuthenticatedHttpClient()
    .get(getCommentsApiUrl(), { params });
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
  const url = `${getCommentsApiUrl()}${commentId}/`;
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
    .post(getCommentsApiUrl(), snakeCaseObject({ threadId, raw_body: comment, parentId }));
  return data;
}

/**
 * Updates existing comment.
 * @param {string} commentId ID of comment to update.
 * @param {string=} comment Raw updated comment data to post.
 * @param {boolean=} voted
 * @param {boolean=} flagged
 * @param {boolean=} endorsed
 * @param {string=} editReasonCode The moderation reason code for editing.
 * @returns {Promise<{}>}
 */
export async function updateComment(commentId, {
  comment,
  voted,
  flagged,
  endorsed,
  editReasonCode,
}) {
  const url = `${getCommentsApiUrl()}${commentId}/`;
  const postData = snakeCaseObject({
    raw_body: comment,
    voted,
    abuse_flagged: flagged,
    endorsed,
    editReasonCode,
  });

  const { data } = await getAuthenticatedHttpClient()
    .patch(url, postData, { headers: { 'Content-Type': 'application/merge-patch+json' } });
  return data;
}

/**
 * Deletes existing comment.
 * @param {string} commentId ID of comment to delete
 */
export async function deleteComment(commentId) {
  const url = `${getCommentsApiUrl()}${commentId}/`;
  await getAuthenticatedHttpClient()
    .delete(url);
}
