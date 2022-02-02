/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getHttpErrorStatus } from '../utils';
import { getDiscussionsConfig, getDiscussionsSettings, getModerationSettings } from './api';
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
      dispatch(fetchConfigRequest());
      const config = await getDiscussionsConfig(courseId);
      if (config.user_is_privileged) {
        const settings = await getDiscussionsSettings(courseId);
        Object.assign(config, { settings });
        config.moderationSettings = await getModerationSettings();
      }
      dispatch(fetchConfigSuccess(camelCaseObject(config)));
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
