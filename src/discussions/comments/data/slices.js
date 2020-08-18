/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: LoadingStatus.LOADING,
    page: null,
    comments: {
      // Map thread ids to comments
    },
    totalPages: null,
    totalThreads: null,
  },
  reducers: {
    fetchCommentsRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCommentsSuccess: (state, { payload }) => {
      const { data, topicId } = payload;
      state.status = LoadingStatus.LOADED;
      state.comments[topicId] = data.results;
      state.page = data.pagination.page;
      state.totalPages = data.pagination.num_pages;
      state.totalThreads = data.pagination.count;
    },
    fetchCommentsFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchCommentsDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
  },
});

export const {
  fetchCommentsRequest,
  fetchCommentsSuccess,
  fetchCommentsFailed,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
