/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    blackouts: [],
    allowAnonymous: false,
    allowAnonymousToPeers: false,
    userRoles: [],
    groupAtSubsection: false,
    hasModerationPrivileges: false,
    isGroupTa: false,
    isUserAdmin: false,
    learnersTabEnabled: false,
    settings: {
      divisionScheme: 'none',
      alwaysDivideInlineDiscussions: false,
      dividedInlineDiscussions: [],
      dividedCourseWideDiscussions: [],
    },
    reasonCodesEnabled: false,
    editReasons: [],
    postCloseReasons: [],
  },
  reducers: {
    fetchConfigRequest: (state) => {
      state.status = RequestStatus.IN_PROGRESS;
    },
    fetchConfigSuccess: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      Object.assign(state, payload);
    },
    fetchConfigFailed: (state) => {
      state.status = RequestStatus.FAILED;
    },
    fetchConfigDenied: (state) => {
      state.status = RequestStatus.DENIED;
    },
  },
});

export const {
  fetchConfigDenied,
  fetchConfigFailed,
  fetchConfigRequest,
  fetchConfigSuccess,
} = configSlice.actions;

export const configReducer = configSlice.reducer;
