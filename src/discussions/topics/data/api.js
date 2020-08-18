/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { API_BASE_URL } from '../../../data/constants';

export async function getCourseTopics(courseId, topicIds) {
  const url = new URL(`${API_BASE_URL}/api/discussion/v1/course_topics/${courseId}`);
  if (topicIds) {
    url.searchParams.append('topic_id', topicIds.join(','));
  }
  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}
