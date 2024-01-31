import { createSelector } from '@reduxjs/toolkit';

export const selectTopicFilter = state => state.topics.filter.trim()
  .toLowerCase();

export const selectCategories = state => state.topics.categoryIds;

const selectTopicCategoryMap = state => state.topics.topicsInCategory;

export const selectTopicsInCategory = (categoryId) => state => (
  state.topics.topicsInCategory[categoryId]?.map(id => state.topics.topics[id]) || []
);

export const selectTopicsInCategoryIds = (categoryId) => state => (
  state.topics.topicsInCategory[categoryId] || []
);

export const selectTopics = state => state.topics.topics;
export const selectCoursewareTopics = createSelector(
  selectCategories,
  selectTopicCategoryMap,
  selectTopics,
  (categoryIds, topicsInCategory, topics) => (
    categoryIds.map(category => ({
      id: category,
      name: category,
      topics: topicsInCategory[category].map(id => topics[id]),
    }))
  ),
);

export const selectNonCoursewareIds = state => state.topics.nonCoursewareIds;

export const selectNonCoursewareTopics = state => state.topics.nonCoursewareIds?.map(id => state.topics.topics[id])
|| [];

export const selectTopic = topicId => state => state.topics.topics[topicId];

export const selectTopicsById = topicIds => state => topicIds.map(topicId => state.topics.topics[topicId])
  .filter(Boolean);

export const topicsLoadingStatus = state => state.topics.status;
