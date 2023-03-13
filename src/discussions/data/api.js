/* eslint-disable import/prefer-default-export */

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

export const getCourseConfigApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/`;
export const getDiscussionsConfigUrl = (courseId) => `${getCourseConfigApiUrl()}${courseId}/`;
/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsConfig(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(getDiscussionsConfigUrl(courseId));
  return data;
}

/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsSettings(courseId) {
  const url = `${getDiscussionsConfigUrl(courseId)}settings`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}
