/* eslint-disable import/prefer-default-export */

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Posts API service');

const apiBaseUrl = getConfig().LMS_BASE_URL;

export const courseConfigApiUrl = `${apiBaseUrl}/api/discussion/v1/courses/`;

/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsConfig(courseId) {
  const url = `${courseConfigApiUrl}${courseId}/`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

/**
 * Get discussions course config
 * @param {string} courseId
 */
export async function getDiscussionsSettings(courseId) {
  const url = `${courseConfigApiUrl}${courseId}/settings`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

/**
 * Get the moderation settings
 */
export async function getModerationSettings() {
  const url = `${apiBaseUrl}/api/discussion/v1/moderation_settings`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}
