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
      const { threadId, page, endorsed } = payload;

      const newState = { ...state };

      newState.status = RequestStatus.SUCCESSFUL;

      newState.commentsInThreads = {
        ...newState.commentsInThreads,
        [threadId]: newState.commentsInThreads[threadId] || {},
      };

      newState.pagination = {
        ...newState.pagination,
        [threadId]: newState.pagination[threadId] || {},
      };

      if (page === 1) {
        newState.commentsInThreads = {
          ...newState.commentsInThreads,
          [threadId]: {
            ...newState.commentsInThreads[threadId],
            [endorsed]: payload.commentsInThreads[threadId] || [],
          },
        };
      } else {
        newState.commentsInThreads = {
          ...newState.commentsInThreads,
          [threadId]: {
            ...newState.commentsInThreads[threadId],
            [endorsed]: [
              ...new Set([
                ...(newState.commentsInThreads[threadId][endorsed] || []),
                ...(payload.commentsInThreads[threadId] || []),
              ]),
            ],
          },
        };
      }

      newState.pagination = {
        ...newState.pagination,
        [threadId]: {
          ...newState.pagination[threadId],
          [endorsed]: {
            currentPage: payload.page,
            totalPages: payload.pagination.numPages,
            hasMorePages: Boolean(payload.pagination.next),
          },
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
        const threadComments = newState.commentsInThreads[payload.threadId] || {};
        const endorsementStatus = threadComments[EndorsementStatus.DISCUSSION]
          ? EndorsementStatus.DISCUSSION
          : EndorsementStatus.UNENDORSED;

        const updatedThreadComments = {
          ...threadComments,
          [endorsementStatus]: [
            ...(threadComments[endorsementStatus] || []),
            payload.id,
          ],
        };
        newState.commentsInThreads = {
          ...newState.commentsInThreads,
          [payload.threadId]: updatedThreadComments,
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
      }
    ),
    updateCommentsList: (state, { payload }) => {
      const { id: commentId, threadId, endorsed } = payload;
      const commentAddListtype = endorsed ? EndorsementStatus.ENDORSED : EndorsementStatus.UNENDORSED;
      const commentRemoveListType = !endorsed ? EndorsementStatus.ENDORSED : EndorsementStatus.UNENDORSED;

      const updatedThread = { ...state.commentsInThreads[threadId] };

      updatedThread[commentRemoveListType] = updatedThread[commentRemoveListType]
        ?.filter(item => item !== commentId)
        ?? [];
      updatedThread[commentAddListtype] = [
        ...(updatedThread[commentAddListtype] || []), commentId,
      ];

      return {
        ...state,
        commentsInThreads: {
          ...state.commentsInThreads,
          [threadId]: updatedThread,
        },
      };
    },
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

      [EndorsementStatus.DISCUSSION, EndorsementStatus.UNENDORSED, EndorsementStatus.ENDORSED].forEach((endorsed) => {
        newState.commentsInThreads[threadId] = {
          ...newState.commentsInThreads[threadId],
          [endorsed]: newState.commentsInThreads[threadId]?.[endorsed]?.filter(item => item !== commentId),
        };
      });

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
  updateCommentsList,
  deleteCommentDenied,
  deleteCommentFailed,
  deleteCommentRequest,
  deleteCommentSuccess,
  setCommentSortOrder,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
