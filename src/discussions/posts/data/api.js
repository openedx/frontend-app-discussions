/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { API_BASE_URL } from '../../../data/constants';

/**
 * Fetches all the threads in the given course and topic.
 * @param courseId
 * @param topicIds
 * @param page
 * @param pageSize
 * @param textSearch
 * @param orderBy
 * @param following
 * @param view
 * @param requestedFields
 * @returns {Promise<*>}
 */
export async function getCourseThreads(
  courseId, topicIds, {
    page, pageSize, textSearch, orderBy, following, view, requestedFields,
  } = {},
) {
  const url = `${API_BASE_URL}/api/discussion/v1/threads/`;
  const params = {
    course_id: courseId,
    page,
    page_size: pageSize,
    topic_id: topicIds && topicIds.join(','),
    text_search: textSearch,
    order_by: orderBy,
    following,
    view,
    requested_fields: requestedFields,
  };

  const { data } = await getAuthenticatedHttpClient()
    .get(url, { params });
  return data;
}
