/* eslint-disable import/prefer-default-export */
import { AllPostsFilter, PostsStatusFilter } from '../../data/constants';

export const selectAnonymousPostingConfig = state => ({
  allowAnonymous: state.config.allowAnonymous,
  allowAnonymousToPeers: state.config.allowAnonymousToPeers,
});

export const selectUserIsPrivileged = state => state.config.userIsPrivileged;

export const selectDivisionSettings = state => state.config.settings;

export const selectDiscussionProvider = state => state.config.provider;

export function selectAreThreadsFiltered(state) {
  const { filters } = state.threads;

  if (filters.search) {
    return true;
  }

  return !(
    filters.status === PostsStatusFilter.ALL
    && filters.allPosts === AllPostsFilter.ALL_POSTS
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
