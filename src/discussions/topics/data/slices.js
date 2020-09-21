/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';

function normaliseTopics(coursewareTopics = [], nonCoursewareTopics = []) {
  const topics = {};
  coursewareTopics.forEach(
    category => category.children.forEach(
      topic => {
        topics[topic.id] = topic;
      },
    ),
  );
  nonCoursewareTopics.forEach(
    topic => {
      topics[topic.id] = topic;
    },
  );
  return topics;
}

const topicsSlice = createSlice({
  name: 'courseTopics',
  initialState: {
    status: LoadingStatus.LOADING,
    topics: {
      // Mapping of topic ids to actual topic objects
    },
    courseware_topics: [],
    non_courseware_topics: [],
  },
  reducers: {
    fetchCourseTopicsRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCourseTopicsSuccess: (state, { payload }) => {
      state.status = LoadingStatus.LOADED;
      state.topics = normaliseTopics(payload.courseware_topics, payload.non_courseware_topics);
      state.courseware_topics = payload.courseware_topics;
      state.non_courseware_topics = payload.non_courseware_topics;
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
} = topicsSlice.actions;

export const topicsReducer = topicsSlice.reducer;
