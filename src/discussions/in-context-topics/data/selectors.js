import { createSelector } from '@reduxjs/toolkit';

export const selectTopicFilter = state => state.inContextTopics.filter.trim().toLowerCase();

export const selectTopics = state => state.inContextTopics.topics;

export const selectCoursewareTopics = state => state.inContextTopics.coursewareTopics;

export const selectNonCoursewareTopics = state => state.inContextTopics.nonCoursewareTopics;

export const selectNonCoursewareIds = state => state.inContextTopics.nonCoursewareIds;

export const selectUnits = state => state.inContextTopics.units;

export const selectSubsectionUnits = subsectionId => state => state.inContextTopics.units?.filter(
  unit => unit.parentId === subsectionId,
);

export const selectSubsection = category => createSelector(
  selectCoursewareTopics,
  (coursewareTopics) => (
    coursewareTopics?.map((topic) => topic?.children)?.flat()?.find((topic) => topic.id === category)
  ),
);

export const selectArchivedTopics = state => state.inContextTopics.archivedTopics;

export const selectArchivedTopic = topic => createSelector(
  selectArchivedTopics,
  (archivedTopics) => (
    archivedTopics?.find((archivedTopic) => archivedTopic.id === topic)
  ),
);

export const selectLoadingStatus = state => state.inContextTopics.status;

export const selectFilteredTopics = createSelector(
  selectUnits,
  selectNonCoursewareTopics,
  selectTopicFilter,
  (units, nonCoursewareTopics, filter) => (
    (units && nonCoursewareTopics && filter) && [...units, ...nonCoursewareTopics]?.filter(
      topic => topic.name.toLowerCase().includes(filter),
    )
  ),
);

export const selectTotalTopicsThreadsCount = createSelector(
  selectUnits,
  selectNonCoursewareTopics,
  (units, nonCoursewareTopics) => (
    (units && nonCoursewareTopics) && [...units, ...nonCoursewareTopics]?.reduce((total, topic) => (
      total + topic.threadCounts.discussion + topic.threadCounts.question
    ), 0)
  ),
);

export const selectCourseWareThreadsCount = category => createSelector(
  selectSubsectionUnits(category),
  (units) => (
    units?.reduce((total, unit) => (
      total + unit.threadCounts.discussion + unit.threadCounts.question
    ), 0)
  ),
);
