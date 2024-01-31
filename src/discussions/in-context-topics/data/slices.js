import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

const topicsSlice = createSlice({
  name: 'inContextTopics',
  initialState: {
    status: RequestStatus.IDLE,
    topics: [],
    coursewareTopics: [],
    nonCoursewareTopics: [],
    nonCoursewareIds: [],
    units: [],
    archivedTopics: [],
    filter: '',
  },
  reducers: {
    fetchCourseTopicsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchCourseTopicsSuccess: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        topics: payload.topics,
        coursewareTopics: payload.coursewareTopics,
        nonCoursewareTopics: payload.nonCoursewareTopics,
        nonCoursewareIds: payload.nonCoursewareIds,
        units: payload.units,
        archivedTopics: payload.archivedTopics,
      }
    ),
    fetchCourseTopicsFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchCourseTopicsDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    setFilter: (state, { payload }) => (
      {
        ...state,
        filter: payload,
      }
    ),
  },
});

export const {
  fetchCourseTopicsRequest,
  fetchCourseTopicsSuccess,
  fetchCourseTopicsFailed,
  fetchCourseTopicsDenied,
  setFilter,
  setSortBy,
} = topicsSlice.actions;

export const inContextTopicsReducer = topicsSlice.reducer;
