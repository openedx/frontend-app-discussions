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
  // This normalisation code is goes throught the block structure and converts it
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
    chapters.push(chapterData);
    blockData[chapterId] = chapterData;
    chapterData.topics = [];

    blocks[chapterId].children?.forEach(sequentialId => {
      blockData[sequentialId] = camelCaseObject(blocks[sequentialId]);
      blockData[sequentialId].topics = [];

      blocks[sequentialId].children?.forEach(verticalId => {
        blockData[verticalId] = camelCaseObject(blocks[verticalId]);
        blockData[verticalId].topics = [];

        blocks[verticalId].children?.forEach(discussionId => {
          const discussion = camelCaseObject(blocks[discussionId]);
          blockData[discussionId] = discussion;
          // Add this topic id to the list of topics for the current chapter, sequential, and vertical
          chapterData.topics.push(discussion.studentViewData.topicId);
          blockData[sequentialId].topics.push(discussion.studentViewData.topicId);
          blockData[verticalId].topics.push(discussion.studentViewData.topicId);
          // Store the topic's context in the course in a map
          topics[discussion.studentViewData.topicId] = {
            chapterName: blockData[chapterId].displayName,
            verticalName: blockData[sequentialId].displayName,
            unitName: blockData[verticalId].displayName,
            unitLink: blockData[verticalId].lmsWebUrl,
          };
        });
      });
    });
  });
  return { chapters, blocks: blockData, topics };
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
