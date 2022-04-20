/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getUserComments } from '../../comments/data/api';
import { getUserPosts } from '../../posts/data/api';
import { getHttpErrorStatus } from '../../utils';
import {
  getLearners, getUserProfiles,
} from './api';
import {
  fetchLearnersDenied,
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
  fetchUserCommentsDenied,
  fetchUserCommentsRequest,
  fetchUserCommentsSuccess,
  fetchUserPostsDenied,
  fetchUserPostsRequest,
  fetchUserPostsSuccess,
} from './slices';

/**
 * Fetches the learners for the course courseId.
 * @param {string} courseId The course ID for the course to fetch data for.
 * @param {string} orderBy
 * @param {number} page
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchLearners(courseId, {
  orderBy,
  page = 1,
} = {}) {
  return async (dispatch) => {
    const options = {
      orderBy,
      page,
    };
    try {
      dispatch(fetchLearnersRequest({ courseId }));
      const learnerStats = await getLearners(courseId, options);
      const learnerProfilesData = await getUserProfiles(learnerStats.results.map((l) => l.username));
      const learnerProfiles = {};
      learnerProfilesData.forEach(
        learnerProfile => {
          learnerProfiles[learnerProfile.username] = camelCaseObject(learnerProfile);
        },
      );
      dispatch(fetchLearnersSuccess({ ...camelCaseObject(learnerStats), learnerProfiles, page }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchLearnersDenied());
      } else {
        dispatch(fetchLearnersFailed());
      }
      logError(error);
    }
  };
}

/**
 * Fetch the comments of a user for the specified course and update the
 * redux state
 *
 * @param {string} courseId Course ID of the course eg., course-v1:X+Y+Z
 * @param {string} username Username of the learner
 * @param {number} page
 * @returns a promise that will update the state with the learner's comments
 */
export function fetchUserComments(courseId, username, { page = 1 } = {}) {
  return async (dispatch) => {
    try {
      dispatch(fetchUserCommentsRequest());
      const data = await getUserComments(courseId, username, { page });
      dispatch(fetchUserCommentsSuccess(camelCaseObject({
        page,
        username,
        comments: data.results,
        pagination: data.pagination,
      })));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchUserCommentsDenied());
      }
    }
  };
}

/**
 * Fetch the posts of a user for the specified course and update the
 * redux state
 *
 * @param {string} courseId Course ID of the course eg., course-v1:X+Y+Z
 * @param {string} username Username of the learner
 * @param page
 * @returns a promise that will update the state with the learner's posts
 */
export function fetchUserPosts(courseId, username, { page = 1 } = {}) {
  return async (dispatch) => {
    try {
      dispatch(fetchUserPostsRequest());
      const data = await getUserPosts(courseId, username, { page });
      dispatch(fetchUserPostsSuccess(camelCaseObject({
        page,
        username,
        posts: data.results,
        pagination: data.pagination,
      })));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchUserPostsDenied());
      }
    }
  };
}
