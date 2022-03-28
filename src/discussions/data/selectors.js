/* eslint-disable import/prefer-default-export */
import { PostsStatusFilter, ThreadType } from '../../data/constants';

export const selectAnonymousPostingConfig = state => ({
  allowAnonymous: state.config.allowAnonymous,
  allowAnonymousToPeers: state.config.allowAnonymousToPeers,
});

export const selectUserIsPrivileged = state => state.config.userIsPrivileged;

export const selectconfigLoadingStatus = state => state.config.status;

export const selectLearnersTabEnabled = state => state.config.learnersTabEnabled;

export const selectDivisionSettings = state => state.config.settings;

export const selectModerationSettings = state => ({
  postCloseReasons: state.config.postCloseReasons,
  editReasons: state.config.editReasons,
  reasonCodesEnabled: state.config.reasonCodesEnabled,
});

export const selectDiscussionProvider = state => state.config.provider;

export function selectAreThreadsFiltered(state) {
  const { filters } = state.threads;

  if (filters.search) {
    return true;
  }

  return !(
    filters.status === PostsStatusFilter.ALL
    && filters.postType === ThreadType.ALL
  );
}

export function selectTopicThreadCount(topicId) {
  return state => {
    const topic = state.topics.topics[topicId];
    if (!topic) {
      return 0;
    }
    return topic.threadCounts.question + topic.threadCounts.discussion;
  };
}

export function selectPostThreadCount(state) {
  return state.threads.totalThreads;
}
