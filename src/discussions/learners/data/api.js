/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

export const coursesApiUrl = `${apiBaseUrl}/api/discussion/v1/courses/`;
export const userProfileApiUrl = `${apiBaseUrl}/api/user/v1/accounts`;

/**
 * Fetches all the learners in the given course.
 * @param {string} courseId
 * @param {object} params {page, order_by}
 * @returns {Promise<{}>}
 */
export async function getLearners(courseId, params) {
  const url = `${coursesApiUrl}${courseId}/activity_stats/`;
  const { data } = await getAuthenticatedHttpClient().get(url, { params });
  return data;
}

/**
 * Get user profile
 * @param {string} usernames
 */
export async function getUserProfiles(usernames) {
  const url = `${userProfileApiUrl}?username=${usernames.join()}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

/**
 * Get the posts by a specific user in a course's discussions
 *
 * @param {string} courseId Course ID of the course
 * @param {string} username Username of the user
 * @param {number} page
 * @param {boolean} countFlagged
 * @returns API Response object in the format
 *  {
 *    results: [array of posts],
 *    pagination: {count, num_pages, next, previous}
 *  }
 */
export async function getUserPosts(courseId, username, { page, countFlagged }) {
  const learnerPostsApiUrl = `${coursesApiUrl}${courseId}/learner/`;
  const { data } = await getAuthenticatedHttpClient()
    .get(learnerPostsApiUrl, { params: { username, page, count_flagged: countFlagged } });
  return data;
}
