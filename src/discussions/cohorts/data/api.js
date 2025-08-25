import { getAuthenticatedHttpClient, getSiteConfig, snakeCaseObject } from '@openedx/frontend-base';

export const getCohortsApiUrl = courseId => `${getSiteConfig().LMS_BASE_URL}/api/cohorts/v1/courses/${courseId}/cohorts/`;

export async function getCourseCohorts(courseId) {
  const params = snakeCaseObject({ courseId });

  const { data } = await getAuthenticatedHttpClient()
    .get(getCohortsApiUrl(courseId), { params });
  return data;
}
