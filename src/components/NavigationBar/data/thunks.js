/* eslint-disable import/prefer-default-export, no-unused-expressions */
import { logError } from '@edx/frontend-platform/logging';

import { getCourseHomeCourseMetadata } from './api';
import {
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
} from './slice';

export function fetchTab(courseId, tab, getTabData, targetUserId) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    try {
      const courseHomeCourseMetadata = await getCourseHomeCourseMetadata(courseId, 'outline');
      if (!courseHomeCourseMetadata.courseAccess.hasAccess) {
        dispatch(fetchTabDenied({ courseId }));
      } else {
        dispatch(fetchTabSuccess({
          courseId,
          targetUserId,
          tabs: courseHomeCourseMetadata.tabs,
        }));
      }
    } catch (e) {
      dispatch(fetchTabFailure({ courseId }));
      logError(e);
    }
  };
}
