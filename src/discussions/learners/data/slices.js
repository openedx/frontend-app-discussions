import { createSlice } from '@reduxjs/toolkit';

import {
  LearnersOrdering,
  PostsStatusFilter,
  RequestStatus,
  ThreadOrdering,
  ThreadType,
} from '../../../data/constants';

const learnersSlice = createSlice({
  name: 'learner',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    learnerProfiles: {},
    pages: [],
    nextPage: null,
    totalPages: null,
    totalLearners: null,
    sortedBy: LearnersOrdering.BY_LAST_ACTIVITY,
    postFilter: {
      postType: ThreadType.ALL,
      status: PostsStatusFilter.ALL,
      orderBy: ThreadOrdering.BY_LAST_ACTIVITY,
      cohort: '',
    },
    usernameSearch: null,
    bulkDeleteStats: {
      commentCount: 0,
      threadCount: 0,
    },
  },
  reducers: {
    fetchLearnersSuccess: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        pages: [
          ...state.pages.slice(0, payload.page - 1),
          payload.results,
          ...state.pages.slice(payload.page),
        ],
        learnerProfiles: {
          ...state.learnerProfiles,
          ...(payload.learnerProfiles || {}),
        },
        nextPage: payload.page < payload.pagination.numPages ? payload.page + 1 : null,
        totalPages: payload.pagination.numPages,
        totalLearners: payload.pagination.count,
      }
    ),
    fetchLearnersFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchLearnersDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    fetchLearnersRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    setSortedBy: (state, { payload }) => (
      {
        ...state,
        pages: [],
        sortedBy: payload,
      }
    ),
    setUsernameSearch: (state, { payload }) => (
      {
        ...state,
        usernameSearch: payload,
        pages: [],
      }
    ),
    setPostFilter: (state, { payload }) => (
      {
        ...state,
        pages: [],
        postFilter: payload,
      }
    ),
    deleteUserPostsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    deleteUserPostsSuccess: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        bulkDeleteStats: payload,
      }
    ),
    deleteUserPostsFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
  },
});

export const {
  fetchLearnersFailed,
  fetchLearnersRequest,
  fetchLearnersSuccess,
  fetchLearnersDenied,
  setSortedBy,
  setUsernameSearch,
  setPostFilter,
  deleteUserPostsRequest,
  deleteUserPostsSuccess,
  deleteUserPostsFailed,
} = learnersSlice.actions;

export const learnersReducer = learnersSlice.reducer;
