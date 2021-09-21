/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { EndorsementStatus, RequestStatus } from '../../../data/constants';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    commentsInThreads: {
      // Maps threads to comment ids in them.
    },
    commentsInComments: {
      // Maps comments to response comments in them.
    },
    commentsById: {
      // Map comment ids to comments.
    },
    // Stores the comment being posted in case it needs to be reposted due to network failure.
    // TODO: save in localstorage so user can continue editing?
    commentDraft: null,
    postStatus: RequestStatus.SUCCESSFUL,
    pagination: {},
  },
  reducers: {
    fetchCommentsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCommentsSuccess: (state, { payload }) => {
      const { threadId, endorsed } = payload;
      // force endorsed to be null, true or false
      state.status = RequestStatus.SUCCESSFUL;
      state.commentsInThreads[threadId] = state.commentsInThreads[threadId] ?? {};
      state.pagination[threadId] = state.pagination[threadId] ?? {};
      state.commentsInThreads[threadId][endorsed] = [
        ...(state.commentsInThreads[threadId][endorsed] || []),
        ...(payload.commentsInThreads[threadId] || []),
      ];
      state.pagination[threadId][endorsed] = {
        currentPage: payload.page,
        totalPages: payload.pagination.numPages,
        hasMorePages: Boolean(payload.pagination.next),
      };
      state.commentsInComments = { ...state.commentsInComments, ...payload.commentsInComments };
      state.commentsById = { ...state.commentsById, ...payload.commentsById };
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
      state.commentsInComments = { ...state.commentsInComments, ...payload.commentsInComments };
      state.commentsById = { ...state.commentsById, ...payload.commentsById };
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
      if (payload.parentId) {
        state.commentsInComments[payload.parentId].push(payload.id);
      } else {
        // The comment should be added to either the discussion or unendorsed
        // sections since a new comment won't be endorsed yet.
        (
          state.commentsInThreads[payload.threadId][EndorsementStatus.DISCUSSION]
          ?? state.commentsInThreads[payload.threadId][EndorsementStatus.UNENDORSED]
        ).push(payload.id);
      }
      state.commentsById[payload.id] = payload;
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
      state.commentsById[payload.id] = payload;
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
      const { threadId, parentId } = state.commentsById[commentId];

      state.postStatus = RequestStatus.SUCCESSFUL;
      [EndorsementStatus.DISCUSSION, EndorsementStatus.UNENDORSED, EndorsementStatus.ENDORSED].forEach((endorsed) => {
        state.commentsInThreads[threadId][endorsed] = (
          state.commentsInThreads[threadId]?.[endorsed]?.filter(item => item !== commentId)
        );
      });
      if (parentId) {
        state.commentsInComments[parentId] = state.commentsInComments[parentId].filter(item => item !== commentId);
      }
      delete state.commentsById[commentId];
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
