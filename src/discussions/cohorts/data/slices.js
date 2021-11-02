/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

const cohortsSlice = createSlice({
  name: 'cohorts',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    cohorts: [],
  },
  reducers: {
    fetchCohortsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
      state.cohorts = [];
    },
    fetchCohortsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.cohorts = payload;
    },
    fetchCohortsFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
  },
});

export const {
  fetchCohortsRequest,
  fetchCohortsSuccess,
  fetchCohortsFailed,
} = cohortsSlice.actions;

export const cohortsReducer = cohortsSlice.reducer;
