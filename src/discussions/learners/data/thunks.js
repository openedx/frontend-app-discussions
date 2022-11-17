/* eslint-disable import/prefer-default-export */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import {
  PostsStatusFilter, ThreadType,
} from '../../../data/constants';
import {
  fetchLearnerThreadsRequest,
  fetchThreadsDenied,
  fetchThreadsFailed,
  fetchThreadsSuccess,
} from '../../posts/data/slices';
import { normaliseThreads } from '../../posts/data/thunks';
import { getHttpErrorStatus } from '../../utils';
import { getLearners, getUserPosts, getUserProfiles } from './api';
import {
  fetchLearnersDenied,
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
} from './slices';

/**
 * Fetches the learners for the course courseId.
 * @param {string} courseId The course ID for the course to fetch data for.
 * @param {string} orderBy
 * @param {number} page
 * @param {usernameSearch} username
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchLearners(courseId, {
  orderBy,
  page = 1,
  usernameSearch = null,
} = {}) {
  return async (dispatch) => {
    try {
      const params = snakeCaseObject({ orderBy, page });
      if (usernameSearch) {
        params.username = usernameSearch;
      }
      dispatch(fetchLearnersRequest({ courseId }));
      const learnerStats = await getLearners(courseId, params);
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
 * Fetch the posts of a user for the specified course and update the
 * redux state
 *
 * @param {string} courseId Course ID of the course eg., course-v1:X+Y+Z
 * @param {string} username name of the learner
 * @param page
 * @returns a promise that will update the state with the learner's posts
 */
export function fetchUserPosts(courseId, {
  orderBy,
  filters = {},
  page = 1,
  author = null,
  countFlagged,
} = {}) {
  const options = {
    orderBy,
    page,
    author,
    countFlagged,
  };
  if (filters.status === PostsStatusFilter.UNREAD) {
    options.status = 'unread';
  }
  if (filters.status === PostsStatusFilter.UNANSWERED) {
    options.status = 'unanswered';
  }
  if (filters.status === PostsStatusFilter.REPORTED) {
    options.status = 'flagged';
  }
  if (filters.status === PostsStatusFilter.UNRESPONDED) {
    options.status = 'unresponded';
  }
  if (filters.postType !== ThreadType.ALL) {
    options.threadType = filters.postType;
  }
  if (filters.search) {
    options.textSearch = filters.search;
  }
  if (filters.cohort) {
    options.cohort = filters.cohort;
  }
  return async (dispatch) => {
    try {
      dispatch(fetchLearnerThreadsRequest({ courseId, author }));

      const data = await getUserPosts(courseId, options);
      const normalisedData = normaliseThreads(camelCaseObject(data));

      dispatch(fetchThreadsSuccess({ ...normalisedData, page, author }));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchThreadsDenied());
      } else {
        dispatch(fetchThreadsFailed());
      }
      logError(error);
    }
  };
}
