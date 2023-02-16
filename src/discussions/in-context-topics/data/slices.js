/* eslint-disable no-param-reassign,import/prefer-default-export */
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
    fetchCourseTopicsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCourseTopicsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.topics = payload.topics;
      state.coursewareTopics = payload.coursewareTopics;
      state.nonCoursewareTopics = payload.nonCoursewareTopics;
      state.nonCoursewareIds = payload.nonCoursewareIds;
      state.units = payload.units;
      state.archivedTopics = payload.archivedTopics;
    },
    fetchCourseTopicsFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCourseTopicsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    setFilter: (state, { payload }) => {
      state.filter = payload;
    },
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
