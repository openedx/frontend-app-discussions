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
 * @param {number} page
 * @param {string} orderBy
 * @returns {Promise<{}>}
 */
export async function getLearners(
  courseId, { page, orderBy },
) {
  const params = { page, orderBy };
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
