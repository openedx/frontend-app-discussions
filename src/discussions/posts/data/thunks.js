/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
import { getCoursePosts } from './api';
import { fetchCoursePostsFailed, fetchCoursePostsRequest, fetchCoursePostsSuccess } from './slices';

export function fetchCoursePosts(courseId, topicIds) {
  return async (dispatch) => {
    try {
      dispatch(fetchCoursePostsRequest({ courseId }));
      const data = await getCoursePosts(courseId, topicIds);
      dispatch(fetchCoursePostsSuccess(data));
    } catch (error) {
      dispatch(fetchCoursePostsFailed());
      logError(error);
    }
  };
}
