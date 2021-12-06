/* eslint-disable import/prefer-default-export */

export const selectTopicFilter = state => state.topics.filter.trim().toLowerCase();

export const selectCategories = state => state.topics.categoryIds;

export const selectTopicsInCategory = (categoryId) => state => (
  state.topics.topicsInCategory[categoryId]?.map(id => state.topics.topics[id]) || []
);

export const selectTopics = state => state.topics.topics;
export const selectCoursewareTopics = state => state.topics.categoryIds.map(category => ({
  id: category,
  name: category,
  children: state.topics.topicsInCategory[category].map(id => state.topics.topics[id]),
}));

export const selectNonCoursewareIds = state => state.topics.nonCoursewareIds;

export const selectNonCoursewareTopics = state => state.topics.nonCoursewareIds.map(id => state.topics.topics[id]);

export const selectTopic = topicId => state => state.topics.topics[topicId];

export const topicsLoadingStatus = state => (
  state.topics.status
);
