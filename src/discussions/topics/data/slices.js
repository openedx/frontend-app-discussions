/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../data/constants';

const topicsSLice = createSlice({
  name: 'courseTopics',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    topics: {
      courseware_topics: [],
      non_courseware_topics: [],
    },
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
  },
});

export const {
  fetchCourseTopicsRequest,
  fetchCourseTopicsSuccess,
  fetchCourseTopicsFailed,
} = topicsSLice.actions;

export const topicsReducer = topicsSLice.reducer;
