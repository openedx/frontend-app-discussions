import { logError } from '@edx/frontend-platform/logging';

import { getHttpErrorStatus } from '../../../discussions/utils';
import { getCourseHomeCourseMetadata } from './api';
import {
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
} from './slice';

export default function fetchTab(courseId) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    try {
      const courseHomeCourseMetadata = await getCourseHomeCourseMetadata(courseId);
      if (!courseHomeCourseMetadata.courseAccess.hasAccess) {
        dispatch(fetchTabDenied({ courseId }));
      } else {
        dispatch(fetchTabSuccess({
          courseId,
          tabs: courseHomeCourseMetadata.tabs,
          org: courseHomeCourseMetadata.org,
          courseNumber: courseHomeCourseMetadata.number,
          courseTitle: courseHomeCourseMetadata.title,
          isEnrolled: courseHomeCourseMetadata.isEnrolled,
        }));
      }
    } catch (e) {
      if (getHttpErrorStatus(e) === 403) {
        dispatch(fetchTabDenied({ courseId }));
      } else {
        dispatch(fetchTabFailure({ courseId }));
      }
      logError(e);
    }
  };
}
