/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';


const topicsSLice = createSlice({
  name: 'courseTopics',
  initialState: {
    status: LoadingStatus.LOADING,
    topics: {
      courseware_topics: [],
      non_courseware_topics: [],
    },
  },
  reducers: {
    fetchCourseTopicsRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCourseTopicsSuccess: (state, { payload }) => {
      state.status = LoadingStatus.LOADED;
      state.topics = payload;
    },
    fetchCourseTopicsFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchCourseTopicsDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
  },
});

export const {
  fetchCourseTopicsRequest,
  fetchCourseTopicsSuccess,
  fetchCourseTopicsFailed,
} = topicsSLice.actions;

export const topicsReducer = topicsSLice.reducer;
