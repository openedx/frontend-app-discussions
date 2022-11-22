/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

import { DiscussionProvider } from '../../../data/constants';
import { selectSequences } from '../../../data/selectors';
import { selectDiscussionProvider } from '../../data/selectors';

export const selectTopicFilter = state => state.topics.filter.trim()
  .toLowerCase();

export const selectCategories = state => state.topics.categoryIds;

const selectTopicCategoryMap = state => state.topics.topicsInCategory;

export const selectTopicsInCategory = (categoryId) => state => (
  state.topics.topicsInCategory[categoryId]?.map(id => state.topics.topics[id]) || []
);

export const selectTopics = state => state.topics.topics;
export const selectCoursewareTopics = createSelector(
  selectDiscussionProvider,
  selectCategories,
  selectTopicCategoryMap,
  selectTopics,
  selectSequences,
  (provider, categoryIds, topicsInCategory, topics, sequences) => (
    provider === DiscussionProvider.LEGACY
      ? categoryIds.map(category => ({
        id: category,
        name: category,
        topics: topicsInCategory[category].map(id => topics[id]),
      }))
      : sequences.map(sequence => ({
        id: sequence.id,
        name: sequence.displayName,
        topics: sequence.topics.map(topicId => ({ id: topicId, name: topics[topicId]?.name || 'unnamed' })),
      }))
  ),
);

export const selectNonCoursewareIds = state => state.topics.nonCoursewareIds;

export const selectNonCoursewareTopics = state => state.topics.nonCoursewareIds.map(id => state.topics.topics[id]);

export const selectTopic = topicId => state => state.topics.topics[topicId];

export const selectTopicsById = topicIds => state => topicIds.map(topicId => state.topics.topics[topicId])
  .filter(Boolean);

export const topicsLoadingStatus = state => state.topics.status;
