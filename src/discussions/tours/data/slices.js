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
    discussionsTourRequest: (state) => (
      {
        ...state,
        loading: RequestStatus.IN_PROGRESS,
        error: null,
      }
    ),
    fetchUserDiscussionsToursSuccess: (state, action) => (
      {
        ...state,
        tours: action.payload,
        loading: RequestStatus.SUCCESSFUL,
        error: null,
      }
    ),
    discussionsToursRequestError: (state, action) => (
      {
        ...state,
        loading: RequestStatus.FAILED,
        error: action.payload,
      }
    ),
    updateUserDiscussionsTourSuccess: (state, action) => {
      const tourIndex = state.tours.findIndex(tour => tour.id === action.payload.id);
      return {
        ...state,
        tours: state.tours.map(
          (tour, index) => (index === tourIndex ? action.payload : tour),
        ),
        loading: RequestStatus.SUCCESSFUL,
        error: null,
      };
    },
    updateUserDiscussionsTourByName: (state, action) => {
      const tourIndex = state.tours.findIndex(tour => tour.tourName === action.payload.tourName);
      return {
        ...state,
        tours: state.tours.map(
          (tour, index) => (index === tourIndex ? { ...state.tours[tourIndex], ...action.payload } : tour),
        ),
        loading: RequestStatus.SUCCESSFUL,
        error: null,
      };
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
