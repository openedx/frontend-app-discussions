import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
export const DENIED = 'denied';

const slice = createSlice({
  name: 'courseTabs',
  initialState: {
    courseStatus: 'loading',
    courseId: null,
    tabs: [],
    courseTitle: null,
    courseNumber: null,
    isEnrolled: false,
    org: null,
  },
  reducers: {
    fetchTabDenied: (state, { payload }) => (
      {
        ...state,
        courseId: payload.courseId,
        courseStatus: DENIED,
      }
    ),
    fetchTabFailure: (state, { payload }) => (
      {
        ...state,
        courseId: payload.courseId,
        courseStatus: FAILED,
      }
    ),
    fetchTabRequest: (state, { payload }) => (
      {
        ...state,
        courseId: payload.courseId,
        courseStatus: LOADING,
      }
    ),
    fetchTabSuccess: (state, { payload }) => (
      {
        ...state,
        courseId: payload.courseId,
        targetUserId: payload.targetUserId,
        tabs: payload.tabs,
        courseStatus: LOADED,
        courseTitle: payload.courseTitle,
        courseNumber: payload.courseNumber,
        org: payload.org,
        isEnrolled: payload.isEnrolled,
      }
    ),
  },
});

export const {
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
} = slice.actions;

export const courseTabsReducer = slice.reducer;
