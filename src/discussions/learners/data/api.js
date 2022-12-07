/* eslint-disable import/prefer-default-export */
import snakeCase from 'lodash/snakeCase';

import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

export const getCoursesApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/`;
export const getUserProfileApiUrl = () => `${getConfig().LMS_BASE_URL}/api/user/v1/accounts`;

/**
 * Fetches all the learners in the given course.
 * @param {string} courseId
 * @param {object} params {page, order_by}
 * @returns {Promise<{}>}
 */
export async function getLearners(courseId, params) {
  const url = `${getCoursesApiUrl()}${courseId}/activity_stats/`;
  const { data } = await getAuthenticatedHttpClient().get(url, { params });
  return data;
}

/**
 * Get user profile
 * @param {string} usernames
 */
export async function getUserProfiles(usernames) {
  const url = `${getUserProfileApiUrl()}?username=${usernames.join()}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

/**
 * Get the posts by a specific user in a course's discussions
 *
 * @param {string} courseId Course ID of the course
 * @param {string} author
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
 * @returns API Response object in the format
 *  {
 *    results: [array of posts],
 *    pagination: {count, num_pages, next, previous}
 *  }
 */
export async function getUserPosts(courseId, {
  page,
  pageSize,
  textSearch,
  orderBy,
  status,
  author,
  threadType,
  countFlagged,
  cohort,
} = {}) {
  const learnerPostsApiUrl = `${getCoursesApiUrl()}${courseId}/learner/`;

  const params = snakeCaseObject({
    page,
    pageSize,
    textSearch,
    threadType,
    orderBy: orderBy && snakeCase(orderBy),
    status,
    requestedFields: 'profile_image',
    username: author,
    countFlagged,
    groupId: cohort,
  });

  const { data } = await getAuthenticatedHttpClient()
    .get(learnerPostsApiUrl, { params });
  return data;
}
