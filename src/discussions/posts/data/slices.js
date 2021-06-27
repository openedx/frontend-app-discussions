/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import {
  AllPostsFilter,
  MyPostsFilter,
  PostsStatusFilter,
  RequestStatus,
  ThreadOrdering,
} from '../../../data/constants';

function normaliseProfileImage(currentThread, newThread) {
  newThread.authorAvatars = newThread.users
    ? newThread.users?.[newThread.author].profile.image
    : currentThread.authorAvatars;
  return newThread;
}

function normaliseThreads(state, rawThreadsData) {
  const {
    topicThreadMap: topics,
    threads,
  } = state;
  rawThreadsData.forEach(
    thread => {
      if (!topics[thread.topicId]) {
        topics[thread.topicId] = [];
      }
      if (!topics[thread.topicId].includes(thread.id)) {
        topics[thread.topicId].push(thread.id);
      }
      threads[thread.id] = normaliseProfileImage(threads[thread.id], thread);
    },
  );
}

const threadsSlice = createSlice({
  name: 'thread',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    page: null,
    topicThreadMap: {
      // Mapping of topic ids to thread ids in them
    },
    threads: {
      // Mapping of threads ids to threads in them
    },
    threadDraft: null,
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
    sortedBy: ThreadOrdering.BY_LAST_ACTIVITY,
  },
  reducers: {
    fetchThreadsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchThreadsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.topicThreadMap = {};
      state.threads = {};
      normaliseThreads(state, payload.results);
      state.page = payload.pagination.page;
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
      normaliseThreads(state, [payload]);
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
      normaliseThreads(state, [payload]);
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
      normaliseThreads(state, [payload]);
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
      const { topicId } = state.threads[threadId];
      state.postStatus = RequestStatus.SUCCESSFUL;
      state.topicThreadMap[topicId] = state.topicThreadMap[topicId].filter(item => item !== threadId);
      delete state.threads[threadId];
    },
    deleteThreadFailed: (state) => {
      state.postStatus = RequestStatus.FAILED;
    },
    deleteThreadDenied: (state) => {
      state.postStatus = RequestStatus.DENIED;
    },
    setSortedBy: (state, { payload }) => {
      state.sortedBy = payload;
    },
    setStatusFilter: (state, { payload }) => {
      state.filters.status = payload;
    },
    setAllPostsTypeFilter: (state, { payload }) => {
      state.filters.allPosts = payload;
    },
    setMyPostsTypeFilter: (state, { payload }) => {
      state.filters.myPosts = payload;
    },
    setSearchQuery: (state, { payload }) => {
      state.filters.search = payload;
    },
    showPostEditor: (state) => {
      state.postEditorVisible = true;
    },
    hidePostEditor: (state) => {
      state.postEditorVisible = false;
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
} = threadsSlice.actions;

export const threadsReducer = threadsSlice.reducer;
