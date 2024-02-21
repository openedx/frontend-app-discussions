import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

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
    responsesPagination: {},
    sortOrder: true,
  },
  reducers: {
    fetchCommentsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchCommentsSuccess: (state, { payload }) => {
      const { threadId, page } = payload;

      const newState = { ...state };

      newState.status = RequestStatus.SUCCESSFUL;
      newState.commentsInThreads = {
        ...newState.commentsInThreads,
        [threadId]: newState.commentsInThreads[threadId] || [],
      };

      newState.pagination = {
        ...newState.pagination,
        [threadId]: newState.pagination[threadId] || {},
      };

      if (page === 1) {
        newState.commentsInThreads = {
          ...newState.commentsInThreads,
          [threadId]: [...payload.commentsInThreads[threadId]] || [],
        };
      } else {
        newState.commentsInThreads = {
          [threadId]: [
            ...new Set([
              ...(newState.commentsInThreads[threadId] || []),
              ...(payload.commentsInThreads[threadId] || []),
            ]),
          ],
        };
      }

      newState.pagination = {
        ...newState.pagination,
        [threadId]: {
          ...newState.pagination[threadId],
          currentPage: payload.page,
          totalPages: payload.pagination.numPages,
          hasMorePages: Boolean(payload.pagination.next),
        },
      };

      newState.commentsById = { ...newState.commentsById, ...payload.commentsById };

      return newState;
    },
    fetchCommentsFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchCommentsDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    fetchCommentResponsesRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchCommentResponsesFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchCommentResponsesDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    fetchCommentResponsesSuccess: (state, { payload }) => {
      const newState = { ...state };
      newState.status = RequestStatus.SUCCESSFUL;

      if (payload.page === 1) {
        newState.commentsInComments = {
          ...newState.commentsInComments,
          [payload.commentId]: payload.commentsInComments[payload.commentId] || [],
        };
      } else {
        newState.commentsInComments = {
          ...newState.commentsInComments,
          [payload.commentId]: [
            ...new Set([
              ...(newState.commentsInComments[payload.commentId] || []),
              ...(payload.commentsInComments[payload.commentId] || []),
            ]),
          ],
        };
      }

      newState.commentsById = { ...newState.commentsById, ...payload.commentsById };
      newState.responsesPagination = {
        ...newState.responsesPagination,
        [payload.commentId]: {
          currentPage: payload.page,
          totalPages: payload.pagination.numPages,
          hasMorePages: Boolean(payload.pagination.next),
        },
      };

      return newState;
    },
    postCommentRequest: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
        commentDraft: payload,
      }
    ),
    postCommentDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
      }
    ),
    postCommentFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
      }
    ),
    postCommentSuccess: (state, { payload }) => {
      const newState = { ...state };
      newState.postStatus = RequestStatus.SUCCESSFUL;

      if (payload.parentId) {
        newState.commentsInComments = {
          ...newState.commentsInComments,
          [payload.parentId]: [
            ...(newState.commentsInComments[payload.parentId] || []),
            payload.id,
          ],
        };
      } else {
        const threadComments = newState.commentsInThreads[payload.threadId] || [];
        newState.commentsInThreads = {
          ...newState.commentsInThreads,
          [payload.threadId]: [...threadComments, payload.id],
        };
      }

      newState.commentsById = { ...newState.commentsById, [payload.id]: payload };
      newState.commentDraft = null;

      return newState;
    },
    updateCommentRequest: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
        commentDraft: payload,
      }
    ),
    updateCommentDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
      }
    ),
    updateCommentFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
      }
    ),
    updateCommentSuccess: (state, { payload }) => (
      {
      ...state,
      commentsById: {
        ...state.commentsById,
        [payload.id]: payload,
      },
      commentDraft: null,
    }),
    deleteCommentRequest: (state) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
      }
    ),
    deleteCommentDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
      }
    ),
    deleteCommentFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
      }
    ),
    deleteCommentSuccess: (state, { payload }) => {
      const { commentId } = payload;
      const { threadId, parentId } = state.commentsById[commentId];

      const newState = {
        ...state,
        postStatus: RequestStatus.SUCCESSFUL,
        commentsInThreads: { ...state.commentsInThreads },
        commentsInComments: { ...state.commentsInComments },
        commentsById: { ...state.commentsById },
      };

      newState.commentsInThreads[threadId] = [
        ...newState.commentsInThreads[threadId]?.filter(item => item !== commentId) || [],
      ];

      if (parentId) {
        newState.commentsInComments[parentId] = newState.commentsInComments[parentId].filter(
          item => item !== commentId,
        );
      }

      delete newState.commentsById[commentId];

      return newState;
    },
    setCommentSortOrder: (state, { payload }) => (
      {
        ...state,
        sortOrder: payload,
      }
    ),
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
  setCommentSortOrder,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
