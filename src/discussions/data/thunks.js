/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import {
  LearnersOrdering,
  PostsStatusFilter,
} from '../../data/constants';
import { setSortedBy } from '../learners/data';
import { setStatusFilter } from '../posts/data';
import { getHttpErrorStatus } from '../utils';
import { getDiscussionsConfig, getDiscussionsSettings } from './api';
import {
  fetchConfigDenied, fetchConfigFailed, fetchConfigRequest, fetchConfigSuccess,
} from './slices';

/**
 * Fetches the configuration data for the course
 * @param {string} courseId The course ID for the course to fetch config for.
 * @returns {(function(*): Promise<void>)|*}
 */
export function fetchCourseConfig(courseId) {
  return async (dispatch) => {
    try {
      let learnerSort = LearnersOrdering.BY_LAST_ACTIVITY;
      let postsFilterStatus = PostsStatusFilter.ALL;

      dispatch(fetchConfigRequest());

      const config = await getDiscussionsConfig(courseId);
      if (config.is_user_admin || config.user_is_privileged) {
        const settings = await getDiscussionsSettings(courseId);
        Object.assign(config, { settings });
        learnerSort = LearnersOrdering.BY_FLAG;
        postsFilterStatus = PostsStatusFilter.REPORTED;
      }

      dispatch(fetchConfigSuccess(camelCaseObject(config)));
      dispatch(setSortedBy(learnerSort));
      dispatch(setStatusFilter(postsFilterStatus));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchConfigDenied());
      } else {
        dispatch(fetchConfigFailed());
      }
      logError(error);
    }
  };
}
