/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

export const selectAllLearners = createSelector(
  state => state.learners,
  learners => learners.learners,
);

export const learnersLoadingStatus = () => state => state.learners.status;

export const selectLearnerSorting = () => state => state.learners.sortedBy;

export const selectLearnerFilters = () => state => state.learners.filters;

export const selectLearnerNextPage = () => state => state.learners.nextPage;

export const selectLearnerAvatar = author => state => (
  state.learners.learnerProfiles[author]?.profileImage?.imageUrlSmall
);

export const selectLearnerLastLogin = author => state => (
  state.learners.learnerProfiles[author]?.lastLogin
);
