/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from './constants';

export const getBlocksAPIURL = () => `${getApiBaseUrl()}/api/courses/v1/blocks/`;
export async function getCourseBlocks(courseId, username) {
  const params = {
    course_id: courseId,
    username,
    depth: 'all',
    requested_fields: 'children,discussions_id',
    block_types_filter: 'course,chapter,sequential,vertical,discussion',
    student_view_data: 'discussion',
  };
  const { data } = await getAuthenticatedHttpClient()
    .get(getBlocksAPIURL(), { params });
  return data;
}
