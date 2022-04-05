/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

import { LearnerTabs } from '../../../data/constants';

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

export const selectLearner = (username) => createSelector(
  [selectAllLearners],
  learners => learners.find(l => l.username === username) || {},
);

export const selectLearnerProfile = (username) => state => state.learners.learnerProfiles[username] || {};

export const selectUserPosts = username => state => state.learners.postsByUser[username] || [];

/**
 * Get the comments of a post.
 * @param {string} username Username of the learner to get the comments of
 * @param {LearnerTabs} commentType Type of comments to get
 * @returns {Array} Array of comments
 */
export const selectUserComments = (username, commentType) => state => (
  commentType === LearnerTabs.COMMENTS
    ? (state.learners.commentsByUser[username] || []).filter(c => c.parentId)
    : (state.learners.commentsByUser[username] || []).filter(c => !c.parentId)
);

export const flaggedCommentCount = (username) => state => state.learners.flaggedCommentsByUser[username] || 0;
