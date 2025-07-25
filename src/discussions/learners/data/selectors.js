import { createSelector } from '@reduxjs/toolkit';

export const selectAllLearners = createSelector(
  state => state.learners.pages,
  pages => pages.flat(),
);

export const learnersLoadingStatus = () => state => state.learners.status;

export const selectUsernameSearch = () => state => state.learners.usernameSearch;

export const selectLearnerSorting = () => state => state.learners.sortedBy;

export const selectLearnerNextPage = () => state => state.learners.nextPage;

export const selectLearnerAvatar = author => state => (
  state.learners.learnerProfiles[author]?.profileImage?.imageUrlLarge
);

export const selectBulkDeleteStats = () => state => state.learners.bulkDeleteStats;
