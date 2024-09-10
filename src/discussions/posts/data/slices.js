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
    fetchLearnerThreadsRequest: (state, { payload }) => (
      {
        ...state,
        pages: state.author !== payload.author ? [] : state.pages,
        author: state.author !== payload.author ? payload.author : state.author,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    clearPostsPages: (state) => (
      {
        ...state,
        pages: [],
      }
    ),
    fetchThreadsRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchThreadsSuccess: (state, { payload }) => {
      const {
        author, page, ids, threadsById, isFilterChanged, threadsInTopic, avatars, pagination, textSearchRewrite,
      } = payload;

      const newState = { ...state };

      if (newState.author !== author) {
        newState.pages = [];
        newState.author = author;
      }

      const updatedPages = newState.pages.slice();
      if (!updatedPages[page - 1]) {
        updatedPages[page - 1] = ids;
      } else {
        updatedPages[page - 1] = [...new Set([...updatedPages[page - 1], ...ids])];
      }
      newState.pages = updatedPages;

      newState.status = RequestStatus.SUCCESSFUL;
      newState.threadsById = { ...newState.threadsById, ...threadsById };
      newState.threadsInTopic = (isFilterChanged || page === 1)
        ? { ...threadsInTopic }
        : mergeThreadsInTopics(newState.threadsInTopic, threadsInTopic);
      newState.avatars = { ...newState.avatars, ...avatars };
      newState.nextPage = (page < pagination.numPages) ? page + 1 : null;
      newState.totalPages = pagination.numPages;
      newState.totalThreads = pagination.count;
      newState.textSearchRewrite = textSearchRewrite;

      return newState;
    },
    fetchThreadsFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchThreadsDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    fetchThreadRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchThreadSuccess: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        threadsById: { ...state.threadsById, ...payload.threadsById },
        avatars: { ...state.avatars, ...payload.avatars },
      }
    ),
    fetchThreadByDirectLinkSuccess: (state, { payload }) => (
      {
        ...state,
        status: RequestStatus.SUCCESSFUL,
        pages: [
          ...state.pages.slice(0, payload.page - 1),
          payload.ids,
          ...state.pages.slice(payload.page),
        ],
        threadsInTopic: { ...payload.threadsInTopic, ...state.threadsInTopic },
        threadsById: { ...payload.threadsById, ...state.threadsById },
        avatars: { ...state.avatars, ...payload.avatars },
      }
    ),
    fetchThreadFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchThreadDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    postThreadRequest: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
        threadsDraft: payload,
      }
    ),
    postThreadSuccess: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.SUCCESSFUL,
        threadsById: {
          ...state.threadsById,
          [payload.id]: payload,
        },
        threadsInTopic: {
          ...state.threadsInTopic,
          [payload.topicId]: [
            ...(state.threadsInTopic[payload.topicId] || []),
            payload.id,
          ],
        },
        pages: !payload.anonymousToPeers
          ? [
            ...(state.pages[0] ? [payload.id].concat(state.pages[0]) : []),
            ...state.pages.slice(1),
          ]
          : [...state.pages],
        avatars: { ...state.avatars, ...payload.avatars },
        redirectToThread: { topicId: payload.topicId, threadId: payload.id },
        threadDraft: null,
      }
    ),
    postThreadFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
      }
    ),
    postThreadDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
      }
    ),
    updateThreadRequest: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
        threadsDraft: payload,
      }
    ),
    updateThreadAsRead: (state, { payload }) => (
      {
        ...state,
        threadsById: {
          ...state.threadsById,
          [payload.threadId]: {
            ...state.threadsById[payload.threadId],
            read: true,
          },
        },
      }
    ),
    updateThreadSuccess: (state, { payload }) => (
      {
        ...state,
        postStatus: RequestStatus.SUCCESSFUL,
        threadsById: {
          ...state.threadsById,
          [payload.id]: {
            ...state.threadsById[payload.id],
            ...payload,
            abuseFlaggedCount: state.threadsById[payload.id].abuseFlaggedCount || false,
          },
        },
        avatars: { ...state.avatars, ...payload.avatars },
        threadDraft: null,
      }
    ),
    updateThreadFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
        totalThreads: 0,
      }
    ),
    updateThreadDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
        totalThreads: 0,
      }
    ),
    deleteThreadRequest: (state) => (
      {
        ...state,
        postStatus: RequestStatus.IN_PROGRESS,
      }
    ),
    deleteThreadSuccess: (state, { payload }) => {
      const { threadId } = payload;
      const { topicId } = state.threadsById[threadId];
      return {
        ...state,
        postStatus: RequestStatus.SUCCESSFUL,
        threadsInTopic: {
          ...state.threadsInTopic,
          [topicId]: state.threadsInTopic[topicId].filter(item => item !== threadId),
        },
        pages: state.pages.map(page => page?.filter(item => item !== threadId)),
        threadsById: omitBy(state.threadsById, (thread) => thread.id === threadId),
      };
    },
    deleteThreadFailed: (state) => (
      {
        ...state,
        postStatus: RequestStatus.FAILED,
      }
    ),
    deleteThreadDenied: (state) => (
      {
        ...state,
        postStatus: RequestStatus.DENIED,
      }
    ),
    setSortedBy: (state, { payload }) => (
      {
        ...state,
        sortedBy: payload,
        pages: [],
      }
    ),
    setStatusFilter: (state, { payload }) => (
      {
        ...state,
        filters: {
          ...state.filters,
          status: payload,
        },
        pages: [],
      }
    ),
    setPostsTypeFilter: (state, { payload }) => (
      {
        ...state,
        filters: {
          ...state.filters,
          postType: payload,
        },
        pages: [],
      }
    ),
    setCohortFilter: (state, { payload }) => (
      {
        ...state,
        filters: {
          ...state.filters,
          cohort: payload,
        },
        pages: [],
      }
    ),
    setSearchQuery: (state, { payload }) => (
      {
        ...state,
        filters: {
          ...state.filters,
          search: payload,
          status: state.filters.status === PostsStatusFilter.FOLLOWING
            ? PostsStatusFilter.ALL
            : state.filters.status,
        },
        pages: [],
      }
    ),
    showPostEditor: (state) => (
      {
        ...state,
        postEditorVisible: true,
        redirectToThread: null,
      }
    ),
    hidePostEditor: (state) => (
      {
        ...state,
        postEditorVisible: false,
      }
    ),
    clearRedirect: (state) => (
      {
        ...state,
        redirectToThread: null,
      }
    ),
    clearFilter: (state) => (
      {
        ...state,
        filters: {
          ...state.filters,
          status: PostsStatusFilter.ALL,
          postType: ThreadType.ALL,
          cohort: '',
          search: '',
        },
        pages: [],
      }
    ),
    clearSort: (state) => (
      {
        ...state,
        sortedBy: ThreadOrdering.BY_LAST_ACTIVITY,
        pages: [],
      }
    ),
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
