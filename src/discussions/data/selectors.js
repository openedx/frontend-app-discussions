import { createSelector } from '@reduxjs/toolkit';

import selectCourseTabs from '../../components/NavigationBar/data/selectors';
import { PostsStatusFilter, ThreadType } from '../../data/constants';
import { isCourseStatusValid } from '../utils';

export const selectAnonymousPostingConfig = state => ({
  allowAnonymous: state.config.allowAnonymous,
  allowAnonymousToPeers: state.config.allowAnonymousToPeers,
});

export const selectUserHasModerationPrivileges = state => state.config.hasModerationPrivileges;

export const selectUserIsStaff = state => state.config.isUserAdmin;

export const selectUserIsGroupTa = state => state.config.isGroupTa;

export const selectConfigLoadingStatus = state => state.config.status;

export const selectUserRoles = state => state.config.userRoles;

export const selectDivisionSettings = state => state.config.settings;

export const selectGroupAtSubsection = state => state.config.groupAtSubsection;

export const selectIsCourseAdmin = state => state.config.isCourseAdmin;

export const selectIsCourseStaff = state => state.config.isCourseStaff;

export const selectEnableInContext = state => state.config.enableInContext;

export const selectIsPostingEnabled = state => state.config.isPostingEnabled;

export const selectModerationSettings = state => ({
  postCloseReasons: state.config.postCloseReasons,
  editReasons: state.config.editReasons,
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
    const topic = topicId && state.topics?.topics[topicId];
    if (!topic) {
      return 0;
    }
    return topic.threadCounts.question + topic.threadCounts.discussion;
  };
}

export function selectPostThreadCount(state) {
  return state.threads.totalThreads;
}

export const selectIsUserLearner = createSelector(
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
  selectUserIsStaff,
  selectIsCourseAdmin,
  selectIsCourseStaff,
  selectCourseTabs,
  (
    userHasModerationPrivileges,
    userIsGroupTa,
    userIsStaff,
    userIsCourseAdmin,
    userIsCourseStaff,
    { courseStatus },
  ) => (
    (
      !userHasModerationPrivileges
      && !userIsGroupTa
      && !userIsStaff
      && !userIsCourseAdmin
      && !userIsCourseStaff
      && isCourseStatusValid(courseStatus)
    ) || false
  ),
);
