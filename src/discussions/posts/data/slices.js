/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';

function normalisePosts(rawPostsData) {
  const posts = {};
  rawPostsData.forEach(
    post => {
      posts[post.id] = post;
    },
  );
  return posts;
}

function normalisePostsToTopics(rawPostsData) {
  const topicPostMap = {};
  rawPostsData.forEach(
    post => {
      if (!topicPostMap[post.topic_id]) {
        topicPostMap[post.topic_id] = [];
      }
      topicPostMap[post.topic_id].push(post);
    },
  );
  return topicPostMap;
}

const coursePostsSlice = createSlice({
  name: 'coursePosts',
  initialState: {
    status: LoadingStatus.LOADING,
    page: null,
    posts: {
      // Mapping of post ids to actual post objects
    },
    topicPostMap: {
      // Mapping of topic ids to posts in them
    },
    totalPages: null,
    totalThreads: null,
  },
  reducers: {
    fetchCoursePostsRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCoursePostsSuccess: (state, { payload }) => {
      state.status = LoadingStatus.LOADED;
      state.posts = normalisePosts(payload.results);
      state.topicPostMap = normalisePostsToTopics(payload.results);
      state.page = payload.pagination.page;
      state.totalPages = payload.pagination.num_pages;
      state.totalThreads = payload.pagination.count;
    },
    fetchCoursePostsFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchCoursePostsDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
  },
});

export const {
  fetchCoursePostsRequest,
  fetchCoursePostsSuccess,
  fetchCoursePostsFailed,
} = coursePostsSlice.actions;

export const coursePostsReducer = coursePostsSlice.reducer;
