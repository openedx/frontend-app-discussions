/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../data/constants';

function findCommentIndex(state, threadId, commentId) {
  return state.comments[threadId].findIndex(entry => entry.id === commentId);
}

function updateCommentInState(state, comment) {
  const threadId = comment.thread_id;
  const index = findCommentIndex(state, threadId, comment.id);
  if (index >= 0) {
    state.comments[threadId][index] = comment;
  }
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    page: null,
    comments: {
      // Map thread ids to comments
    },
    totalPages: null,
    totalThreads: null,
    postStatus: RequestStatus.SUCCESSFUL,
  },
  reducers: {
    fetchCommentsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCommentsSuccess: (state, { payload }) => {
      const { data, threadId } = payload;
      state.status = RequestStatus.SUCCESSFUL;
      state.comments[threadId] = data.results;
      state.page = data.pagination.page;
      state.totalPages = data.pagination.num_pages;
      state.totalThreads = data.pagination.count;
    },
    fetchCommentsFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCommentsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchCommentRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCommentFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCommentDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchCommentSuccess: (state, { payload }) => {
      const { data } = payload;
      state.status = RequestStatus.SUCCESSFUL;
      updateCommentInState(state, data.results[0]);
    },
    postCommentRequest: (state) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
    },
    postCommentDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    postCommentFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    postCommentSuccess: (state, { payload }) => {
      state.postStatus = RequestStatus.SUCCESSFUL;
      const { data, threadId } = payload;
      state.comments[threadId].push(data);
    },
    updateCommentRequest: (state) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
    },
    updateCommentDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    updateCommentFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    updateCommentSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      updateCommentInState(state, payload.data.results[0]);
    },
    deleteCommentRequest: (state) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
    },
    deleteCommentDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    deleteCommentFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    deleteCommentSuccess: (state, { payload }) => {
      const { commentId, threadId } = payload;
      console.log(state);
      console.log(payload);
      state.postStatus = RequestStatus.POSTED;
      const index = findCommentIndex(state, threadId, commentId);
      state.comments[threadId].splice(index, 1);
    },
  },
});

export const {
  fetchCommentDenied,
  fetchCommentFailed,
  fetchCommentRequest,
  fetchCommentsDenied,
  fetchCommentsFailed,
  fetchCommentsRequest,
  fetchCommentsSuccess,
  fetchCommentSuccess,
  postCommentDenied,
  postCommentFailed,
  postCommentRequest,
  postCommentSuccess,
  updateCommentDenied,
  updateCommentFailed,
  updateCommentRequest,
  updateCommentSuccess,
  deleteCommentDenied,
  deleteCommentFailed,
  deleteCommentRequest,
  deleteCommentSuccess,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
