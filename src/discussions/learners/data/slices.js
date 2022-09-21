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
    learnerProfiles: {},
    pages: [],
    nextPage: null,
    totalPages: null,
    totalLearners: null,
    sortedBy: LearnersOrdering.BY_LAST_ACTIVITY,
    usernameSearch: null,
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
      state.pages = [];
      state.sortedBy = payload;
    },
    setUsernameSearch: (state, { payload }) => {
      state.usernameSearch = payload;
      state.pages = [];
    },
  },
});

export const {
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
  fetchLearnersDenied,
  setSortedBy,
  setUsernameSearch,
} = learnersSlice.actions;

export const learnersReducer = learnersSlice.reducer;
