import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from '../../../data/constants';

export const getCourseMetadataApiUrl = (courseId) => `${getApiBaseUrl()}/api/course_home/course_metadata/${courseId}`;

function normalizeCourseHomeCourseMetadata(metadata) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    tabs: data.tabs.map(tab => ({
      slug: tab.tabId === 'courseware' ? 'outline' : tab.tabId,
      title: tab.title,
      url: tab.url,
    })),
    isMasquerading: data.originalUserIsStaff && !data.isStaff,
  };
}

export async function getCourseHomeCourseMetadata(courseId) {
  const url = getCourseMetadataApiUrl(courseId);
  const { data } = await getAuthenticatedHttpClient().get(url);

  return normalizeCourseHomeCourseMetadata(data);
}
