/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice, current } from '@reduxjs/toolkit';

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
      let count = 0;
      const currentState = current(state);
      // Counting non-courseware topics
      const nonCoursewareTopicsList = currentState.nonCoursewareIds.map(
        id => currentState.topics[id],
      ).filter(item => (payload
        ? item.name.toLowerCase().includes(payload)
        : true
      ));
      count += nonCoursewareTopicsList.length;
      // Counting legacy topics
      const categories = currentState.categoryIds;
      const filteredTopics = categories?.map(categoryId => {
        const topics = currentState.topicsInCategory[categoryId]?.map(
          id => currentState.topics[id],
        ) || [];
        const matchesFilter = payload ? categoryId?.toLowerCase().includes(payload) : true;
        return topics.filter(
          topic => (
            payload
              ? (topic.name.toLowerCase()
                .includes(payload) || matchesFilter)
              : true
          ),
        );
      });
      count += [].concat(...filteredTopics).length;
      state.results.count = count;
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
