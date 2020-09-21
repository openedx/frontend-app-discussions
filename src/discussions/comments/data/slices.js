/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../../../data/constants';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: LoadingStatus.LOADING,
    page: null,
    comment: {
      // Map post ids to comment
    },
    replies: {
      // Map post ids to replies
    },
    inlineReplies: {
      // Map reply ids to inline replies
    },
    totalPages: null,
    totalThreads: null,
  },
  reducers: {
    fetchRepliesRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchRepliesSuccess: (state, { payload }) => {
      const { data, postId } = payload;
      state.status = LoadingStatus.LOADED;
      state.replies[postId] = data.results;
      state.page = data.pagination.page;
      state.totalPages = data.pagination.num_pages;
      state.totalThreads = data.pagination.count;
    },
    fetchRepliesFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchRepliesDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
    fetchCommentRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchCommentSuccess: (state, { payload }) => {
      const { data, postId } = payload;
      state.status = LoadingStatus.LOADED;
      state.comment[postId] = data;
    },
    fetchCommentFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchCommentDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
    fetchInlineRepliesRequest: (state) => {
      state.status = LoadingStatus.LOADING;
    },
    fetchInlineRepliesSuccess: (state, { payload }) => {
      const { data, replyId } = payload;
      state.status = LoadingStatus.LOADED;
      state.inlineReplies[replyId] = data.results;
      state.page = data.pagination.page;
      state.totalPages = data.pagination.num_pages;
      state.totalThreads = data.pagination.count;
    },
    fetchInlineRepliesFailed: (state) => {
      state.status = LoadingStatus.FAILED;
    },
    fetchInlineRepliesDenied: (state) => {
      state.status = LoadingStatus.DENIED;
    },
  },
});

export const {
  fetchRepliesRequest,
  fetchRepliesSuccess,
  fetchRepliesFailed,
  fetchCommentRequest,
  fetchCommentSuccess,
  fetchCommentFailed,
  fetchInlineRepliesRequest,
  fetchInlineRepliesSuccess,
  fetchInlineRepliesFailed,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
