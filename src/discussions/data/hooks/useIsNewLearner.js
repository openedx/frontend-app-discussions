import { useLearnerStatus } from './useLearnerStatus';

/**
 * Custom hook to determine if a user is a new learner.
 *
 * This hook now consumes the is_new_learner field from the backend API
 * and is a convenience wrapper around useLearnerStatus for backward compatibility.
 *
 * @param {Object} postData - The thread or comment data from the API that includes is_new_learner field
 * @param {string} author - The username of the author (fallback for legacy usage)
 * @param {string} authorLabel - The author's role label (Staff, Moderator, etc.)
 * @returns {boolean} - True if the user is a new learner, false otherwise
 */
export const useIsNewLearner = (postData, author, authorLabel) => {
  const { isNewLearner } = useLearnerStatus(postData, author, authorLabel);
  return isNewLearner;
};

export default useIsNewLearner;
