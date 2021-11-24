/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from './constants';

const blocksSlice = createSlice({
  name: 'courseBlocks',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    topics: {
      // Maps topic id to the discussion course path and link
    },
    // List of chapter blocks in the course. Rest of the structure can be derived from children of topics
    chapters: [],
    // Mapping of block keys to block data
    blocks: {},
    currentChapter: null,
    currentSequential: null,
    currentVertical: null,
  },
  reducers: {
    fetchCourseBlocksRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchCourseBlocksSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      Object.assign(state, payload);
    },
    fetchCourseBlocksFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchCourseBlocksDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
    setCurrentChapter: (state, { payload }) => {
      state.currentChapter = payload;
      state.currentSequential = null;
      state.currentVertical = null;
    },
    setCurrentSequential: (state, { payload }) => {
      state.currentSequential = payload;
      state.currentVertical = null;
    },
    setCurrentVertical: (state, { payload }) => {
      state.currentVertical = payload;
    },
  },
});

export const {
  fetchCourseBlocksRequest,
  fetchCourseBlocksSuccess,
  fetchCourseBlocksFailed,
  fetchCourseBlocksDenied,
  setCurrentVertical,
  setCurrentChapter,
  setCurrentSequential,
} = blocksSlice.actions;

export const blocksReducer = blocksSlice.reducer;
