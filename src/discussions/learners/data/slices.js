/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import {
  LearnersOrdering,
  RequestStatus,
} from '../../../data/constants';

const learnersSlice = createSlice({
  name: 'learner',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    avatars: {},
    learners: [],
    learnerProfiles: {},
    pages: [],
    nextPage: null,
    totalPages: null,
    totalLearners: null,
    sortedBy: LearnersOrdering.BY_LAST_ACTIVITY,
    commentsByUser: {
      // Map username to comments
    },
    postsByUser: {
      // Map username to posts
    },
    commentCountByUser: {
      // Map of username and comment count
    },
    postCountByUser: {
      // Map of username and post count
    },
  },
  reducers: {
    fetchLearnersSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.learners = payload.results;
      state.learnerProfiles = {
        ...state.learnerProfiles,
        ...(payload.learnerProfiles || {}),
      };
      state.nextPage = payload.pagination.next;
      state.totalPages = payload.pagination.numPages;
      state.totalLearners = payload.pagination.count;
    },
    fetchLearnersFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchLearnersDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchLearnersRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    setSortedBy: (state, { payload }) => {
      state.sortedBy = payload;
      state.pages = [];
    },
    fetchUserCommentsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchUserCommentsSuccess: (state, { payload }) => {
      state.commentsByUser[payload.username] = payload.comments;
      state.commentCountByUser[payload.username] = payload.pagination.count;
      state.status = RequestStatus.SUCCESS;
    },
    fetchUserCommentsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchUserPostsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchUserPostsSuccess: (state, { payload }) => {
      state.postsByUser[payload.username] = payload.posts;
      state.postCountByUser[payload.username] = payload.pagination.count;
      state.status = RequestStatus.SUCCESS;
    },
    fetchUserPostsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },

  },
});

export const {
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
  fetchLearnersDenied,
  setSortedBy,
  fetchUserCommentsRequest,
  fetchUserCommentsDenied,
  fetchUserCommentsSuccess,
  fetchUserPostsRequest,
  fetchUserPostsDenied,
  fetchUserPostsSuccess,

} = learnersSlice.actions;

export const learnersReducer = learnersSlice.reducer;
