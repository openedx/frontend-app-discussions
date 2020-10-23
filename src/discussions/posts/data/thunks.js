/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import { getCourseThreads } from './api';
import { fetchCourseThreadsFailed, fetchCourseThreadsRequest, fetchCourseThreadsSuccess } from './slices';

export function fetchCourseThreads(courseId, topicIds) {
  return async (dispatch) => {
    try {
      dispatch(fetchCourseThreadsRequest({ courseId }));
      const data = await getCourseThreads(courseId, topicIds);
      dispatch(fetchCourseThreadsSuccess(data));
    } catch (error) {
      dispatch(fetchCourseThreadsFailed());
      logError(error);
    }
  };
}
