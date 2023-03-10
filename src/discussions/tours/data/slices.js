/* eslint-disable no-param-reassign,import/prefer-default-export */

import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

const userDiscussionsToursSlice = createSlice({
  name: 'userDiscussionsTours',
  initialState: {
    tours: [],
    loading: RequestStatus.SUCCESSFUL,
    error: null,
  },
  reducers: {
    discussionsTourRequest: (state) => {
      state.loading = RequestStatus.IN_PROGRESS;
      state.error = null;
    },
    fetchUserDiscussionsToursSuccess: (state, action) => {
      state.tours = action.payload;
      state.loading = RequestStatus.SUCCESSFUL;
      state.error = null;
    },
    discussionsToursRequestError: (state, action) => {
      state.loading = RequestStatus.FAILED;
      state.error = action.payload;
    },
    updateUserDiscussionsTourSuccess: (state, action) => {
      const tourIndex = state.tours.findIndex(tour => tour.id === action.payload.id);
      state.tours[tourIndex] = action.payload;
      state.loading = RequestStatus.SUCCESSFUL;
      state.error = null;
    },
    updateUserDiscussionsTourByName: (state, action) => {
      const tourIndex = state.tours.findIndex(tour => tour.tourName === action.payload.tourName);
      state.tours[tourIndex] = { ...state.tours[tourIndex], ...action.payload };
      state.loading = RequestStatus.SUCCESSFUL;
      state.error = null;
    },
  },
});

export const {
  discussionsTourRequest,
  fetchUserDiscussionsToursSuccess,
  discussionsToursRequestError,
  updateUserDiscussionsTourSuccess,
  updateUserDiscussionsTourByName,
} = userDiscussionsToursSlice.actions;

export const toursReducer = userDiscussionsToursSlice.reducer;
