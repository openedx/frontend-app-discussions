import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { getAllPages } from '../../../data/api';

ensureConfig([
  'LMS_BASE_URL',
], 'Comments API service');

export const getCohortsApiUrl = courseId => `${getConfig().LMS_BASE_URL}/api/cohorts/v2/courses/${courseId}/cohorts/`;

export async function getCourseCohorts(courseId) {
  return getAllPages(getCohortsApiUrl(courseId));
}
