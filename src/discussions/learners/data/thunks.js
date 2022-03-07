/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getHttpErrorStatus } from '../../utils';
import {
  getLearners, getUserProfiles,
} from './api';
import {
  fetchLearnersDenied,
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
} from './slices';

/**
 * Fetches the learners for the course courseId.
 * @param {string} courseId The course ID for the course to fetch data for.
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchLearners(courseId, {
  orderBy,
  page = 1,
} = {}) {
  const options = {
    orderBy,
    page,
  };
  return async (dispatch) => {
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
      dispatch(fetchLearnersSuccess({ ...camelCaseObject(learnerStats), learnerProfiles }));
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
