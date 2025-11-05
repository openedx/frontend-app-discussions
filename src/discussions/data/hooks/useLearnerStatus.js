import { useMemo } from 'react';

/**
 * Custom hook to determine learner status (new learner, regular learner, or neither).
 *
 * This hook consumes the learner_status field from the backend API.
 * The backend determines learner status based on actual engagement metrics and enrollment data.
 *
 * @param {Object} postData - The thread or comment data from the API that includes learner_status field
 * @param {string} author - The username of the author; used to check for anonymous and retired users
 * to suppress learner messages
 * @param {string} authorLabel - The author's role label (Staff, Moderator, etc.)
 * @returns {Object} - { isNewLearner: boolean, isRegularLearner: boolean }
 */
export const useLearnerStatus = (postData, author, authorLabel) => useMemo(() => {
  // Users with special roles (Staff, Moderator, Community TA) should not display learner messages
  // Anonymous and retired users should also not display learner messages
  if (
    authorLabel
    || author === 'anonymous'
    || (author && author.startsWith('retired__user'))
  ) {
    return {
      isNewLearner: false,
      isRegularLearner: false,
    };
  }

  // Always rely on backend-provided learner_status field
  if (postData && typeof postData === 'object') {
    const learnerStatus = postData.learnerStatus || postData.learner_status;

    // Also check for legacy boolean fields for backward compatibility
    const legacyIsNewLearner = postData.isNewLearner || postData.is_new_learner;
    const legacyIsRegularLearner = postData.isRegularLearner || postData.is_regular_learner;

    // Use new learner_status field if available, otherwise fall back to legacy boolean fields
    if (learnerStatus) {
      return {
        isNewLearner: learnerStatus === 'new',
        isRegularLearner: learnerStatus === 'regular',
      };
    } if (legacyIsNewLearner !== undefined || legacyIsRegularLearner !== undefined) {
      return {
        isNewLearner: Boolean(legacyIsNewLearner),
        isRegularLearner: Boolean(legacyIsRegularLearner),
      };
    }
  }

  // If postData is not available, return false for both
  // Do not attempt client-side detection as it would produce false positives
  return {
    isNewLearner: false,
    isRegularLearner: false,
  };
}, [postData, author, authorLabel]);

export default useLearnerStatus;
