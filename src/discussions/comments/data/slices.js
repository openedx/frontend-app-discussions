/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

function normaliseComments(state, rawCommentData) {
  const {
    threadCommentMap: threads,
    commentResponsesMap: responses,
    comments,
  } = state;
  rawCommentData.forEach(
    comment => {
      if (comment.parentId) {
        if (!responses[comment.parentId]) {
          responses[comment.parentId] = [];
        }
        if (!responses[comment.parentId].includes(comment.id)) {
          responses[comment.parentId].push(comment.id);
        }
      } else {
        if (!threads[comment.threadId]) {
          threads[comment.threadId] = [];
        }

        if (!threads[comment.threadId].includes(comment.id)) {
          threads[comment.threadId].push(comment.id);
        }
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
    commentResponsesMap: {
      // Maps comments to response comments in them.
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
      state.totalPages = payload.pagination.numPages;
      state.totalThreads = payload.pagination.count;
    },
    fetchCommentsFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCommentsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchCommentResponsesRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCommentResponsesFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCommentResponsesDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchCommentResponsesSuccess: (state, { payload }) => {
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
      normaliseComments(state, [payload]);
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
      const { threadId } = state.comments[commentId];
      state.threadCommentMap[threadId] = state.threadCommentMap[threadId].filter(item => item !== commentId);
      delete state.comments[commentId];
    },
  },
});

export const {
  fetchCommentResponsesDenied,
  fetchCommentResponsesFailed,
  fetchCommentResponsesRequest,
  fetchCommentResponsesSuccess,
  fetchCommentsDenied,
  fetchCommentsFailed,
  fetchCommentsRequest,
  fetchCommentsSuccess,
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
