/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from "@edx/frontend-platform/auth";

import { getApiBaseUrl } from "../../../data/constants";
import { camelCaseObject, getConfig } from "@edx/frontend-platform";

export const getCourseTopicsApiUrl = () =>
  `${getApiBaseUrl()}/api/discussion/v1/course_topics/`;

export async function getCourseTopics(courseId) {
  const url = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(
        `${getConfig().LMS_BASE_URL}/discussions/${courseId}/not-found`
      );

      // return {};
    }
    console.log(error, "this is error");
    throw error;
  }
}
