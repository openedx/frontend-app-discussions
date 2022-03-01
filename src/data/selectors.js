/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

import { selectDiscussionProvider } from '../discussions/data/selectors';
import { DiscussionProvider } from './constants';

export const selectTopicContext = (topicId) => (state) => state.blocks.topics[topicId];

export const selectBlocks = (state) => state.blocks.blocks;

export const selectorForUnitSubsection = createSelector(
  selectBlocks,
  blocks => key => blocks[blocks[key]?.parent],
);

export const selectChapters = (state) => state.blocks.chapters;
export const selectTopicsUnderCategory = createSelector(
  selectDiscussionProvider,
  selectBlocks,
  state => state.topics.topicsInCategory,
  (provider, blocks, topicsInCategory) => (
    provider === DiscussionProvider.LEGACY
      ? category => topicsInCategory?.[category]
      : category => blocks[category]?.topics
  ),
);

export const selectSequences = createSelector(
  selectChapters,
  selectBlocks,
  (chapterIds, blocks) => chapterIds?.flatMap(cId => blocks[cId].children.map(seqId => blocks[seqId])) || [],
);

export const selectTopicIds = () => (state) => state.blocks.chapters;
