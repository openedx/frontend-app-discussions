/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import {
  getCourseCohorts,
} from './api';
import {
  fetchCohortsFailed,
  fetchCohortsRequest,
  fetchCohortsSuccess,
} from './slices';

export function fetchCourseCohorts(courseId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCohortsRequest());
      const data = await getCourseCohorts(courseId);
      dispatch(fetchCohortsSuccess(camelCaseObject(data)));
    } catch (error) {
      dispatch(fetchCohortsFailed());
      logError(error);
    }
  };
}
