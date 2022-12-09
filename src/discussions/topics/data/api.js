/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from '../../../data/constants';

export async function getCourseTopics(courseId, topicIds) {
  const url = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
  const params = {};
  if (topicIds) {
    params.topic_id = topicIds.join(',');
  }
  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}

export async function getCourseTopicsV2(courseId, topicIds) {
  const url = `${getApiBaseUrl()}/api/discussion/v2/course_topics/${courseId}`;
  const params = {};
  if (topicIds) {
    params.topic_id = topicIds.join(',');
  }
  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}
