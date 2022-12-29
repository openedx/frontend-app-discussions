/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from '../../../data/constants';

export async function getCourseTopicsV3(courseId) {
  const url = `${getApiBaseUrl()}/api/discussion/v3/course_topics/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
}
