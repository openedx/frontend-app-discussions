/* eslint-disable import/prefer-default-export */

export const selectAnonymousPostingConfig = state => ({
  allowAnonymous: state.config.allowAnonymous,
  allowAnonymousToPeers: state.config.allowAnonymousToPeers,
});

export const selectUserIsPrivileged = state => state.config.userIsPrivileged;

export const selectDivisionSettings = state => state.config.settings;

export const selectDiscussionProvider = state => state.config.provider;
