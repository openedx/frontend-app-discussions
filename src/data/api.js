import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from './constants';

/**
 * Get every page of a paginated list and return the results of all of them.
 * @param {string} url Address of the first page
 * @param {object} params Query parameters for the first page
 * @returns {Promise<Array>}
 */
export async function getAllPages(url, params = {}) {
  const client = getAuthenticatedHttpClient();
  let { data } = await client.get(url, { params: { page_size: 100, ...params } });
  const results = [...data.results];
  while (data.next) {
    // Each page links to the next one, so the pages are fetched one after another.
    // eslint-disable-next-line no-await-in-loop
    ({ data } = await client.get(data.next));
    results.push(...data.results);
  }
  return results;
}

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
