/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import omitBy from 'lodash/omitBy';

import {
  PostsStatusFilter, RequestStatus, ThreadOrdering, ThreadType,
} from '../../../data/constants';

const mergeThreadsInTopics = (dataFromState, dataFromPayload) => {
  const mergedArray = [];
  mergedArray.push(dataFromState);
  mergedArray.push(dataFromPayload);
  return mergedArray.reduce((acc, obj) => {
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    keys.forEach((key, index) => {
      if (!acc[key]) { acc[key] = []; }
      if (Array.isArray(acc[key])) {
        const uniqueValues = [...new Set(acc[key].concat(values[index]))];
        acc[key] = uniqueValues;
      } else { acc[key].push(values[index]); }
      return acc;
    });
    return acc;
  }, {});
};

const threadsSlice = createSlice({
  name: 'thread',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    avatars: {
      // Mapping users to avatars
    },
    threadsInTopic: {
      // Mapping of topic ids to thread ids in them
    },
    threadsById: {
      // Mapping of threads ids to threads in them
    },
    author: null,
    pages: [],
    threadDraft: null,
    nextPage: null,
    totalPages: null,
    totalThreads: null,
    textSearchRewrite: null,
    postStatus: RequestStatus.SUCCESSFUL,
    filters: {
      status: PostsStatusFilter.ALL,
      postType: ThreadType.ALL,
      cohort: '',
      search: '',
    },
    postEditorVisible: false,
    redirectToThread: null,
    sortedBy: ThreadOrdering.BY_LAST_ACTIVITY,
  },
  reducers: {
    fetchLearnerThreadsRequest: (state, { payload }) => {
      if (state.author !== payload.author) {
        state.pages = [];
        state.author = payload.author;
      }
      state.status = RequestStatus.IN_PROGRESS;
    },
    clearPostsPages: (state) => {
      state.pages = [];
    },
    fetchThreadsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchThreadsSuccess: (state, { payload }) => {
      const {
        author, page, ids, threadsById, isFilterChanged, threadsInTopic, avatars, pagination, textSearchRewrite,
      } = payload;

      if (state.author !== author) {
        state.pages = [];
        state.author = author;
      }
      if (!state.pages[page - 1]) {
        state.pages[page - 1] = ids;
      } else {
        state.pages[page - 1] = [...state.pages[page - 1], ...ids];
      }
      state.status = RequestStatus.SUCCESSFUL;
      state.threadsById = { ...state.threadsById, ...threadsById };
      state.threadsInTopic = (isFilterChanged || page === 1)
        ? { ...threadsInTopic }
        : mergeThreadsInTopics(state.threadsInTopic, threadsInTopic);
      state.avatars = { ...state.avatars, ...avatars };
      state.nextPage = (page < pagination.numPages) ? page + 1 : null;
      state.totalPages = pagination.numPages;
      state.totalThreads = pagination.count;
      state.textSearchRewrite = textSearchRewrite;
    },
    fetchThreadsFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchThreadsDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    fetchThreadRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchThreadSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.threadsById = { ...state.threadsById, ...payload.threadsById };
      state.avatars = { ...state.avatars, ...payload.avatars };
    },
    fetchThreadByDirectLinkSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.pages[payload.page - 1] = payload.ids;
      state.threadsInTopic = { ...payload.threadsInTopic, ...state.threadsInTopic };
      state.threadsById = { ...payload.threadsById, ...state.threadsById };
      state.avatars = { ...state.avatars, ...payload.avatars };
    },
    fetchThreadFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchThreadDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    postThreadRequest: (state, { payload }) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
      state.threadDraft = payload;
    },
    postThreadSuccess: (state, { payload }) => {
      state.postStatus = RequestStatus.SUCCESSFUL;
      state.threadsById[payload.id] = payload;
      state.threadsInTopic[payload.topicId] = [
        ...(state.threadsInTopic[payload.topicId] || []),
        payload.id,
      ];
      // Temporarily add it to the top of the list so it's visible
      state.pages[0] = [payload.id].concat(state.pages[0] || []);
      state.avatars = { ...state.avatars, ...payload.avatars };
      state.redirectToThread = { topicId: payload.topicId, threadId: payload.id };
      state.threadDraft = null;
    },
    postThreadFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    postThreadDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    updateThreadRequest: (state, { payload }) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
      state.threadDraft = payload;
    },
    updateThreadAsRead: (state, { payload }) => {
      state.threadsById[payload.threadId] = { ...state.threadsById[payload.threadId], read: true };
    },
    updateThreadSuccess: (state, { payload }) => {
      state.postStatus = RequestStatus.SUCCESSFUL;
      state.threadsById[payload.id] = {
        ...state.threadsById[payload.id],
        ...payload,
        abuseFlaggedCount: state.threadsById[payload.id].abuseFlaggedCount || false,
      };
      state.avatars = { ...state.avatars, ...payload.avatars };
      state.threadDraft = null;
    },
    updateThreadFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
      state.totalThreads = 0;
    },
    updateThreadDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
      state.totalThreads = 0;
    },
    deleteThreadRequest: (state) => {
      state.postStatus = RequestStatus.IN_PROGRESS;
    },
    deleteThreadSuccess: (state, { payload }) => {
      const { threadId } = payload;
      const { topicId } = state.threadsById[threadId];
      state.postStatus = RequestStatus.SUCCESSFUL;
      state.threadsInTopic[topicId] = state.threadsInTopic[topicId].filter(item => item !== threadId);
      state.pages = state.pages.map(page => page?.filter(item => item !== threadId));
      state.threadsById = omitBy(state.threadsById, (thread) => thread.id === threadId);
    },
    deleteThreadFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    deleteThreadDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    setSortedBy: (state, { payload }) => {
      state.sortedBy = payload;
      state.pages = [];
    },
    setStatusFilter: (state, { payload }) => {
      state.filters.status = payload;
      state.pages = [];
    },
    setPostsTypeFilter: (state, { payload }) => {
      state.filters.postType = payload;
      state.pages = [];
    },
    setCohortFilter: (state, { payload }) => {
      state.filters.cohort = payload;
      state.pages = [];
    },
    setSearchQuery: (state, { payload }) => {
      state.filters.search = payload;
      // Search doesn't work with following
      state.filters.status = state.filters.status === PostsStatusFilter.FOLLOWING
        ? PostsStatusFilter.ALL
        : state.filters.status;
      state.pages = [];
    },
    showPostEditor: (state) => {
      state.postEditorVisible = true;
      state.redirectToThread = null;
    },
    hidePostEditor: (state) => {
      state.postEditorVisible = false;
    },
    clearRedirect: (state) => {
      state.redirectToThread = null;
    },
    clearFilter: (state) => {
      state.filters = {
        status: PostsStatusFilter.ALL,
        postType: ThreadType.ALL,
        cohort: '',
        search: '',
      };
      state.pages = [];
    },
    clearSort: (state) => {
      state.sortedBy = ThreadOrdering.BY_LAST_ACTIVITY;
      state.pages = [];
    },
  },
});

export const {
  deleteThreadDenied,
  deleteThreadFailed,
  deleteThreadRequest,
  deleteThreadSuccess,
  fetchLearnerThreadsRequest,
  fetchThreadDenied,
  fetchThreadFailed,
  fetchThreadRequest,
  fetchThreadsDenied,
  fetchThreadsFailed,
  fetchThreadsRequest,
  fetchThreadsSuccess,
  fetchThreadSuccess,
  fetchThreadByDirectLinkSuccess,
  postThreadDenied,
  postThreadFailed,
  postThreadRequest,
  postThreadSuccess,
  updateThreadDenied,
  updateThreadFailed,
  updateThreadRequest,
  updateThreadAsRead,
  updateThreadSuccess,
  setPostsTypeFilter,
  setCohortFilter,
  setSortedBy,
  setStatusFilter,
  setSearchQuery,
  showPostEditor,
  hidePostEditor,
  clearRedirect,
  clearPostsPages,
  clearFilter,
  clearSort,
} = threadsSlice.actions;

export const threadsReducer = threadsSlice.reducer;
