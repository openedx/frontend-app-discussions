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
    learnerProfiles: {},
    pages: [],
    nextPage: null,
    totalPages: null,
    totalLearners: null,
    sortedBy: LearnersOrdering.BY_LAST_ACTIVITY,
    commentPaginationByUser: {

    },
    commentsByUser: {
      // Map username to comments
    },
    postPaginationByUser: {

    },
    postsByUser: {
      // Map username to posts
    },
  },
  reducers: {
    fetchLearnersSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.pages[payload.page - 1] = payload.results;
      state.learnerProfiles = {
        ...state.learnerProfiles,
        ...(payload.learnerProfiles || {}),
      };
      state.nextPage = (payload.page < payload.pagination.numPages) ? payload.page + 1 : null;
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
    },
    fetchUserCommentsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchUserCommentsSuccess: (state, { payload }) => {
      state.commentsByUser[payload.username] ??= [];
      state.commentsByUser[payload.username][payload.page - 1] = payload.comments;
      state.commentPaginationByUser[payload.username] = {
        nextPage: (payload.page < payload.pagination.numPages) ? payload.page + 1 : null,
        totalPages: payload.pagination.numPages,
      };
      state.status = RequestStatus.SUCCESSFUL;
    },
    fetchUserCommentsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchUserPostsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchUserPostsSuccess: (state, { payload }) => {
      state.postsByUser[payload.username] ??= [];
      state.postsByUser[payload.username][payload.page - 1] = payload.posts;
      state.postPaginationByUser[payload.username] = {
        nextPage: (payload.page < payload.pagination.numPages) ? payload.page + 1 : null,
        totalPages: payload.pagination.numPages,
      };
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
