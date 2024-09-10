import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from '../../../data/constants';

export const getCourseTopicsApiUrl = () => `${getApiBaseUrl()}/api/discussion/v1/course_topics/`;

export async function getCourseTopics(courseId) {
  const url = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;

  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}
