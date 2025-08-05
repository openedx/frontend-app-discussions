import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    status: RequestStatus.IN_PROGRESS,
    allowAnonymous: false,
    allowAnonymousToPeers: false,
    userRoles: [],
    groupAtSubsection: false,
    hasModerationPrivileges: false,
    hasBulkDeletePrivileges: false,
    isGroupTa: false,
    isCourseAdmin: false,
    isCourseStaff: false,
    isUserAdmin: false,
    isPostingEnabled: false,
    settings: {
      divisionScheme: 'none',
      alwaysDivideInlineDiscussions: false,
      dividedInlineDiscussions: [],
      dividedCourseWideDiscussions: [],
    },
    captchaSettings: {
      enabled: false,
      siteKey: '',
    },
    editReasons: [],
    postCloseReasons: [],
    enableInContext: false,
    isEmailVerified: false,
    contentCreationRateLimited: false,
  },
  reducers: {
    fetchConfigRequest: (state) => (
      {
        ...state,
        status: RequestStatus.IN_PROGRESS,
      }
    ),
    fetchConfigSuccess: (state, { payload }) => {
      const newState = Object.assign(state, payload);
      newState.status = RequestStatus.SUCCESSFUL;
      return newState;
    },
    fetchConfigFailed: (state) => (
      {
        ...state,
        status: RequestStatus.FAILED,
      }
    ),
    fetchConfigDenied: (state) => (
      {
        ...state,
        status: RequestStatus.DENIED,
      }
    ),
    setContentCreationRateLimited: (state) => (
      {
        ...state,
        contentCreationRateLimited: true,
      }
    ),
  },
});

export const {
  fetchConfigDenied,
  fetchConfigFailed,
  fetchConfigRequest,
  fetchConfigSuccess,
  setContentCreationRateLimited,
} = configSlice.actions;

export const configReducer = configSlice.reducer;
