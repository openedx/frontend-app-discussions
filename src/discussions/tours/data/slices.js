/* eslint-disable no-param-reassign,import/prefer-default-export */

import { createSlice } from '@reduxjs/toolkit';

const userDiscussionsToursSlice = createSlice({
  name: 'userDiscussionsTours',
  initialState: {
    tours: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchUserDiscussionsToursRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserDiscussionsToursSuccess: (state, action) => {
      state.tours = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchUserDiscussionsToursError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserDiscussionsTourRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserDiscussionsTourSuccess: (state, action) => {
      const tourIndex = state.tours.tours.findIndex(tour => tour.id === action.payload.id);
      state.tours.tours[tourIndex] = action.payload;
      state.tours.loading = false;
      state.tours.error = null;
    },
    updateUserDiscussionsTourError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchUserDiscussionsToursRequest,
  fetchUserDiscussionsToursSuccess,
  fetchUserDiscussionsToursError,
  updateUserDiscussionsTourRequest,
  updateUserDiscussionsTourSuccess,
  updateUserDiscussionsTourError,
} = userDiscussionsToursSlice.actions;

export const toursReducer = userDiscussionsToursSlice.reducer;
