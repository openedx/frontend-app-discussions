/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { API_BASE_URL } from '../../../data/constants';

export async function getPostComment(postId) {
  const url = new URL(`${API_BASE_URL}/api/discussion/v1/threads/${postId}/`);
  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}

export async function getPostReplies(
  postId, {
    replyId, page, pageSize, requestedFields,
  } = {},
) {
  const url = new URL(`${API_BASE_URL}/api/discussion/v1/comments/`);
  const paramsMap = {
    thread_id: postId,
    comment_id: replyId,
    page,
    page_size: pageSize,
    requested_fields: requestedFields,
  };
  Object.keys(paramsMap)
    .forEach(
      (param) => {
        const paramValue = paramsMap[param];
        if (paramValue) {
          url.searchParams.append(param, paramValue);
        }
      },
    );

  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}

export async function getReplyInlineReplies(
  replyId, {
    page, pageSize, requestedFields,
  } = {},
) {
  const url = new URL(`${API_BASE_URL}/api/discussion/v1/comments/${replyId}/`);
  const paramsMap = {
    page,
    page_size: pageSize,
    requested_fields: requestedFields,
  };
  Object.keys(paramsMap)
    .forEach(
      (param) => {
        const paramValue = paramsMap[param];
        if (paramValue) {
          url.searchParams.append(param, paramValue);
        }
      },
    );

  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}
