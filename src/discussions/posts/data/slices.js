/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../data/constants';

function normaliseThreads(state, rawThreadsData) {
  const { topicThreadMap: topics, threads } = state;
  rawThreadsData.forEach(
    thread => {
      if (!topics[thread.topic_id]) {
        topics[thread.topic_id] = [];
      }
      if (!topics[thread.topic_id].includes(thread.id)) {
        topics[thread.topic_id].push(thread.id);
      }
      threads[thread.id] = thread;
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
  },
  reducers: {
    fetchThreadsRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchThreadsSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      normaliseThreads(state, payload.results);
      state.page = payload.pagination.page;
      state.totalPages = payload.pagination.num_pages;
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
      normaliseThreads(state.threads, [payload]);
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
      const topicId = state.threads[threadId].topic_id;
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
  },
});

export const {
  deleteThreadDenied,
  deleteThreadFailed,
  deleteThreadRequest,
  deleteThreadSuccess,
  fetchThreadFailed,
  fetchThreadRequest,
  fetchThreadsFailed,
  fetchThreadsRequest,
  fetchThreadsSuccess,
  fetchThreadSuccess,
  postThreadFailed,
  postThreadRequest,
  postThreadSuccess,
  updateThreadDenied,
  updateThreadFailed,
  updateThreadRequest,
  updateThreadSuccess,
} = threadsSlice.actions;

export const threadsReducer = threadsSlice.reducer;
