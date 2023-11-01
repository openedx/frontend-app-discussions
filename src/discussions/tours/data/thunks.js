import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getDiscussionTours, updateDiscussionTour } from './api';
import {
  discussionsTourRequest,
  discussionsToursRequestError,
  fetchUserDiscussionsToursSuccess,
  updateUserDiscussionsTourSuccess,
} from './slices';

function normaliseTourData(data) {
  return data.map(tour => ({ ...tour, enabled: true }));
}

/**
 * Action thunk to fetch the list of discussion tours for the current user.
 * @returns {function} - Thunk that dispatches the request, success, and error actions.
 */
export function fetchDiscussionTours() {
  return async (dispatch) => {
    try {
      dispatch(discussionsTourRequest());
      const data = await getDiscussionTours();
      dispatch(fetchUserDiscussionsToursSuccess(camelCaseObject(normaliseTourData(data))));
    } catch (error) {
      dispatch(discussionsToursRequestError());
      logError(error);
    }
  };
}

/**
 * Action thunk to update the show_tour field for a specific discussion tour for the current user.
 * @param {number} tourId - The ID of the tour to update.
 * @returns {function} - Thunk that dispatches the request, success, and error actions.
 */

export function updateTourShowStatus(tourId) {
  return async (dispatch) => {
    try {
      dispatch(discussionsTourRequest());
      const data = await updateDiscussionTour(tourId);
      dispatch(updateUserDiscussionsTourSuccess(camelCaseObject(data)));
    } catch (error) {
      dispatch(discussionsToursRequestError());
      logError(error);
    }
  };
}
