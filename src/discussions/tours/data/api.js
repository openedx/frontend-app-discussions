import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// create constant for the API URL
export const getDiscussionTourUrl = () => `${getConfig().LMS_BASE_URL}/api/user_tours/discussion_tours/`;

/**
 * getDiscussionTours
 * This function makes an HTTP GET request to the API to retrieve a list of tours for the authenticated user.
 * @returns {Promise} - A promise that resolves to the API response data.
 */
export async function getDiscussionTours() {
  const { data } = await getAuthenticatedHttpClient()
    .get(getDiscussionTourUrl());
  return data;
}

/**
 * updateDiscussionTour
 * This function makes an HTTP PUT request to the API to update a specific tour for the authenticated user.
 * @param {number} tourId - The ID of the tour to be updated.
 * @returns {Promise} - A promise that resolves to the API response data.
 */
export async function updateDiscussionTour(tourId) {
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getDiscussionTourUrl()}${tourId}`, {
      show_tour: false,
    });
  return data;
}
