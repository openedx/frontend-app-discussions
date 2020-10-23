/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { API_BASE_URL } from '../../../data/constants';

export async function getCourseThreads(
  courseId, topicIds, {
    page, pageSize, textSearch, orderBy, following, view, requestedFields,
  } = {},
) {
  const url = new URL(`${API_BASE_URL}/api/discussion/v1/threads/`);
  const paramsMap = {
    page,
    page_size: pageSize,
    topic_id: topicIds && topicIds.join(','),
    text_search: textSearch,
    order_by: orderBy,
    following,
    view,
    requested_fields: requestedFields,
  };
  url.searchParams.append('course_id', courseId);
  Object.keys(paramsMap)
    .forEach(
      (param) => {
        const paramValue = paramsMap[param];
        if (paramValue) {
          url.searchParams.append(param, paramValue);
        }
      },
    );

  const { data } = await getAuthenticatedHttpClient()
    .get(url);
  return data;
}
