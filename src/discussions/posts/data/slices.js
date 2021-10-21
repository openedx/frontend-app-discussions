/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import {
  AllPostsFilter,
  MyPostsFilter,
  PostsStatusFilter,
  RequestStatus,
  ThreadOrdering,
} from '../../../data/constants';

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
    pages: [],
    threadDraft: null,
    nextPage: null,
    totalPages: null,
    totalThreads: null,
    postStatus: RequestStatus.SUCCESSFUL,
    filters: {
      status: PostsStatusFilter.ALL,
      allPosts: AllPostsFilter.ALL_POSTS,
      myPosts: MyPostsFilter.MY_POSTS,
      search: '',
    },
    postEditorVisible: false,
    redirectToThread: null,
    sortedBy: ThreadOrdering.BY_LAST_ACTIVITY,
  },
  reducers: {
    fetchThreadsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchThreadsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.pages[payload.page - 1] = payload.ids;
      state.threadsById = { ...state.threadsById, ...payload.threadsById };
      state.threadsInTopic = { ...state.threadsInTopic, ...payload.threadsInTopic };
      state.avatars = { ...state.avatars, ...payload.avatars };
      state.nextPage = (payload.page < payload.pagination.numPages) ? payload.page + 1 : null;
      state.totalPages = payload.pagination.numPages;
      state.totalThreads = payload.pagination.count;
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
      state.threadsInTopic[payload.topicId].push(payload.id);
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
    updateThreadSuccess: (state, { payload }) => {
      state.postStatus = RequestStatus.SUCCESSFUL;
      state.threadsById[payload.id] = { ...state.threadsById[payload.id], ...payload };
      state.avatars = { ...state.avatars, ...payload.avatars };
      state.threadDraft = null;
    },
    updateThreadFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    updateThreadDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
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
      delete state.threadsById[threadId];
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
    setAllPostsTypeFilter: (state, { payload }) => {
      state.filters.allPosts = payload;
      state.pages = [];
    },
    setMyPostsTypeFilter: (state, { payload }) => {
      state.filters.myPosts = payload;
      state.pages = [];
    },
    setSearchQuery: (state, { payload }) => {
      state.filters.search = payload;
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
  },
});

export const {
  deleteThreadDenied,
  deleteThreadFailed,
  deleteThreadRequest,
  deleteThreadSuccess,
  fetchThreadDenied,
  fetchThreadFailed,
  fetchThreadRequest,
  fetchThreadsDenied,
  fetchThreadsFailed,
  fetchThreadsRequest,
  fetchThreadsSuccess,
  fetchThreadSuccess,
  postThreadDenied,
  postThreadFailed,
  postThreadRequest,
  postThreadSuccess,
  updateThreadDenied,
  updateThreadFailed,
  updateThreadRequest,
  updateThreadSuccess,
  setAllPostsTypeFilter,
  setMyPostsTypeFilter,
  setSortedBy,
  setStatusFilter,
  setSearchQuery,
  showPostEditor,
  hidePostEditor,
  clearRedirect,
} = threadsSlice.actions;

export const threadsReducer = threadsSlice.reducer;
