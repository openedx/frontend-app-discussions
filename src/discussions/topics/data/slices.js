/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus, TopicOrdering } from '../../../data/constants';

const topicsSlice = createSlice({
  name: 'courseTopics',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    // List of all category ids
    categoryIds: [],
    // List of all non-courseware topics
    nonCoursewareIds: [],
    // Topics that have been archived
    archivedIds: [],
    // Mapping of all topics in each category
    topicsInCategory: {},
    // Map of topics ids to topic data
    topics: {},
    filter: '',
    sortBy: TopicOrdering.BY_COURSE_STRUCTURE,
    results: {
      count: 0,
    },
  },
  reducers: {
    fetchCourseTopicsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCourseTopicsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.topics = payload.topics;
      state.nonCoursewareIds = payload.nonCoursewareIds;
      state.categoryIds = payload.categoryIds;
      state.archivedIds = payload.archivedIds;
      state.topicsInCategory = payload.topicsInCategory;
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
    setTopicsCount: (state, { payload }) => {
      state.results.count = payload;
    },
  },
});

export const {
  fetchCourseTopicsRequest,
  fetchCourseTopicsSuccess,
  fetchCourseTopicsFailed,
  setFilter,
  setSortBy,
  setTopicsCount,
} = topicsSlice.actions;

export const topicsReducer = topicsSlice.reducer;
