/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';

function normaliseThreads(rawThreadsData) {
  const topicThreadMap = {};
  rawThreadsData.forEach(
    thread => {
      if (!topicThreadMap[thread.topic_id]) {
        topicThreadMap[thread.topic_id] = [];
      }
      topicThreadMap[thread.topic_id].push(thread);
    },
  );
  return topicThreadMap;
}

const courseThreadsSlice = createSlice({
  name: 'courseThreads',
  initialState: {
    status: LoadingStatus.LOADING,
    page: null,
    threads: {
      // Mapping of topic ids to threads in them
    },
    totalPages: null,
    totalThreads: null,
  },
  reducers: {
    fetchCourseThreadsRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCourseThreadsSuccess: (state, { payload }) => {
      state.status = LoadingStatus.LOADED;
      state.threads = normaliseThreads(payload.results);
      state.page = payload.pagination.page;
      state.totalPages = payload.pagination.num_pages;
      state.totalThreads = payload.pagination.count;
    },
    fetchCourseThreadsFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchCourseThreadsDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
  },
});

export const {
  fetchCourseThreadsRequest,
  fetchCourseThreadsSuccess,
  fetchCourseThreadsFailed,
} = courseThreadsSlice.actions;

export const courseThreadsReducer = courseThreadsSlice.reducer;
