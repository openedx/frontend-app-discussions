/* eslint-disable import/prefer-default-export, no-unused-expressions */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getHttpErrorStatus } from '../discussions/utils';
import { getCourseBlocks } from './api';
import {
  fetchCourseBlocksDenied,
  fetchCourseBlocksFailed,
  fetchCourseBlocksRequest,
  fetchCourseBlocksSuccess,
} from './slices';

function normaliseCourseBlocks({
  root,
  blocks,
}) {
  // This normalisation code is goes through the block structure and converts it
  // to a format that's easier for the app to use.
  // It does a couple of things:
  // 1. It creates record of all topic ids, and their position in the course
  //    structure, i.e. their section, sub-section, and unit.
  // 2. It keeps a record of all the topic ids under each part of the course. So
  //    the app can easily query all the topic ids under any section, subsection
  //    so it can display posts from all of them if needed.
  // 3. It creates a list of chapters/sections so there is a place to start
  //    navigating the course structure.
  const topics = {};
  const chapters = [];
  const blockData = {};
  blocks[root].children?.forEach(chapterId => {
    const chapterData = camelCaseObject(blocks[chapterId]);
    chapterData.parent = root;
    blockData[chapterId] = chapterData;
    chapterData.topics = [];

    blocks[chapterId].children?.forEach(sequentialId => {
      blockData[sequentialId] = camelCaseObject(blocks[sequentialId]);
      blockData[sequentialId].parent = chapterId;
      blockData[sequentialId].topics = [];

      blocks[sequentialId].children?.forEach(verticalId => {
        blockData[verticalId] = camelCaseObject(blocks[verticalId]);
        blockData[verticalId].parent = sequentialId;
        blockData[verticalId].topics = [];
        const { discussionsId } = blockData[verticalId];

        if (discussionsId) {
          chapterData.topics.push(blockData[verticalId].discussionsId);
          blockData[sequentialId].topics.push(blockData[verticalId].discussionsId);
          blockData[verticalId].topics.push(blockData[verticalId].discussionsId);
          topics[discussionsId] = {
            chapterName: blockData[chapterId].displayName,
            verticalName: blockData[sequentialId].displayName,
            unitName: blockData[verticalId].displayName,
            unitLink: blockData[verticalId].lmsWebUrl,
          };
        } else {
          blocks[verticalId].children?.forEach(discussionId => {
            const discussion = camelCaseObject(blocks[discussionId]);
            const { topicId } = discussion.studentViewData || {};
            if (topicId) {
              blockData[discussionId] = discussion;
              // Add this topic id to the list of topics for the current chapter, sequential, and vertical
              chapterData.topics.push(topicId);
              blockData[sequentialId].topics.push(topicId);
              blockData[verticalId].topics.push(topicId);
              // Store the topic's context in the course in a map
              topics[topicId] = {
                chapterName: blockData[chapterId].displayName,
                verticalName: blockData[sequentialId].displayName,
                unitName: blockData[verticalId].displayName,
                unitLink: blockData[verticalId].lmsWebUrl,
              };
            }
          });
        }
      });
    });
    if (chapterData.topics.length > 0) {
      chapters.push(chapterData.id);
    }
  });
  return {
    chapters,
    blocks: blockData,
    topics,
  };
}

export function fetchCourseBlocks(courseId, username) {
  return async (dispatch) => {
    try {
      dispatch(fetchCourseBlocksRequest({ courseId }));
      const data = await getCourseBlocks(courseId, username);
      dispatch(fetchCourseBlocksSuccess(normaliseCourseBlocks(data)));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCourseBlocksDenied());
      } else {
        dispatch(fetchCourseBlocksFailed());
      }
      logError(error);
    }
  };
}
