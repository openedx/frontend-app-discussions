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
  const topics = {};
  const chapters = [];
  const blockData = {};
  blocks[root].children?.forEach(chapterId => {
    const chapterData = camelCaseObject(blocks[chapterId]);
    chapters.push(chapterData);
    blockData[chapterId] = chapterData;
    blocks[chapterId].children?.forEach(sequentialId => {
      blockData[sequentialId] = camelCaseObject(blocks[sequentialId]);
      blocks[sequentialId].children?.forEach(verticalId => {
        blockData[verticalId] = camelCaseObject(blocks[verticalId]);
        blocks[verticalId].children?.forEach(discussionId => {
          const discussion = camelCaseObject(blocks[discussionId]);
          blockData[discussionId] = discussion;
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
