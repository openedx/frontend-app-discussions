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
    //   state.status = RequestStatus.SUCCESSFUL;
    //   state.pages[payload.page - 1] = payload.results;
    //   state.learnerProfiles = {
    //     ...state.learnerProfiles,
    //     ...(payload.learnerProfiles || {}),
    //   };
    //   state.nextPage = (payload.page < payload.pagination.numPages) ? payload.page + 1 : null;
    //   state.totalPages = payload.pagination.numPages;
    //   state.totalLearners = payload.pagination.count;
    // },
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
} = learnersSlice.actions;

export const learnersReducer = learnersSlice.reducer;
