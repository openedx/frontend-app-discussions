/* eslint-disable import/prefer-default-export */
import { ensureConfig, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'LMS_BASE_URL',
], 'Comments API service');

export const getCohortsApiUrl = courseId => `${getConfig().LMS_BASE_URL}/api/cohorts/v1/courses/${courseId}/cohorts/`;

export async function getCourseCohorts(courseId) {
  const params = snakeCaseObject({ courseId });

  const { data } = await getAuthenticatedHttpClient()
    .get(getCohortsApiUrl(courseId), { params });
  return data;
}
