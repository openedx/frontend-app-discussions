/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus, TopicOrdering } from '../../../data/constants';

const topicsSlice = createSlice({
  name: 'courseTopics',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    topics: {
      coursewareTopics: [],
      nonCoursewareTopics: [],
    },
    filter: '',
    sortBy: TopicOrdering.BY_COURSE_STRUCTURE,
  },
  reducers: {
    fetchCourseTopicsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCourseTopicsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.topics = payload;
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
    setSortBy: (state, { payload }) => {
      state.sortBy = payload;
    },
  },
});

export const {
  fetchCourseTopicsRequest,
  fetchCourseTopicsSuccess,
  fetchCourseTopicsFailed,
  setFilter,
  setSortBy,
} = topicsSlice.actions;

export const topicsReducer = topicsSlice.reducer;
