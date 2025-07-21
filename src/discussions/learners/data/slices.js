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
    deleteCourseUserPostsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    deleteCourseUserPostsSuccess: (state) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
      }
    ),
    deleteCourseUserPostsFailed: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.FAILED,
        error: payload.error,
      }
    ),
    deleteCourseUserPostsCount: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        deleteCourseCounts: payload,
      }
    ),
    deleteOrgUserPostsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    deleteOrgUserPostsSuccess: (state) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
      }
    ),
    deleteOrgUserPostsFailed: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.FAILED,
        error: payload.error,
      }
    ),
    deleteOrgUserPostsCount: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        deleteOrgCounts: payload,
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
  deleteCourseUserPostsRequest,
  deleteCourseUserPostsSuccess,
  deleteCourseUserPostsFailed,
  deleteCourseUserPostsCount,
  deleteOrgUserPostsRequest,
  deleteOrgUserPostsSuccess,
  deleteOrgUserPostsFailed,
  deleteOrgUserPostsCount,
} = learnersSlice.actions;

export const learnersReducer = learnersSlice.reducer;
