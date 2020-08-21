/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../data/constants';

function normaliseComments(state, rawCommentData) {
  const { threadCommentMap: threads, comments } = state;
  rawCommentData.forEach(
    comment => {
      if (!threads[comment.thread_id]) {
        threads[comment.thread_id] = [];
      }
      if (!threads[comment.thread_id].includes(comment.id)) {
        threads[comment.thread_id].push(comment.id);
      }
      comments[comment.id] = comment;
    },
  );
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    page: null,
    threadCommentMap: {
      // Maps threads to comment ids in them.
    },
    comments: {
      // Map comment ids to comments.
    },
    // Stores the comment being posted in case it needs to be reposted due to network failure.
    // TODO: save in localstorage so user can continue editing?
    commentDraft: null,
    totalPages: null,
    totalThreads: null,
    postStatus: RequestStatus.SUCCESSFUL,
  },
  reducers: {
    fetchCommentsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCommentsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      normaliseComments(state, payload.results);
      state.page = payload.pagination.page;
      state.totalPages = payload.pagination.num_pages;
      state.totalThreads = payload.pagination.count;
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
      state.status = RequestStatus.SUCCESSFUL;
      normaliseComments(state, payload.results);
    },
    postCommentRequest: (state, { payload }) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
      state.commentDraft = payload;
    },
    postCommentDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    postCommentFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    postCommentSuccess: (state, { payload }) => {
      state.postStatus = RequestStatus.SUCCESSFUL;
      normaliseComments(state, [payload]);
      state.commentDraft = null;
    },
    updateCommentRequest: (state, { payload }) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
      state.commentDraft = payload;
    },
    updateCommentDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    updateCommentFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    updateCommentSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      normaliseComments(state, [payload.data]);
      state.commentDraft = null;
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
      const { commentId } = payload;
      state.postStatus = RequestStatus.SUCCESSFUL;
      const threadId = state.comments[commentId].thread_id;
      state.threadCommentMap[threadId] = state.threadCommentMap[threadId].filter(item => item !== commentId);
      delete state.comments[commentId];
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
