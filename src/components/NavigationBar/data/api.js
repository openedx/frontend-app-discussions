/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getApiBaseUrl } from '../../../data/constants';

function normalizeCourseHomeCourseMetadata(metadata, rootSlug) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    tabs: data.tabs.map(tab => ({
      // The API uses "courseware" as a slug for both courseware and the outline tab.
      // If needed, we switch it to "outline" here for
      // use within the MFE to differentiate between course home and courseware.
      slug: tab.tabId === 'courseware' ? rootSlug : tab.tabId,
      title: tab.title,
      url: tab.url,
    })),
    isMasquerading: data.originalUserIsStaff && !data.isStaff,
  };
}

export async function getCourseHomeCourseMetadata(courseId, rootSlug) {
  const url = `${getApiBaseUrl()}/api/course_home/course_metadata/${courseId}`;
  // don't know the context of adding timezone in url. hence omitting it
  // url = appendBrowserTimezoneToUrl(url);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data, rootSlug);
}
