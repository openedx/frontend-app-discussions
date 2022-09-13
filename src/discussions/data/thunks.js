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
      const postsFilterStatus = PostsStatusFilter.ALL;
      dispatch(fetchConfigRequest());

      const config = await getDiscussionsConfig(courseId);
      if (config.has_moderation_privileges) {
        const settings = await getDiscussionsSettings(courseId);
        Object.assign(config, { settings });
      }

      if ((config.has_moderation_privileges || config.is_group_ta)) {
        learnerSort = LearnersOrdering.BY_FLAG;
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
