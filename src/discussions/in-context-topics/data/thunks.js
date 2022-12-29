/* eslint-disable import/prefer-default-export */
import { reduce } from 'lodash';

import { logError } from '@edx/frontend-platform/logging';

import { getCourseTopicsV3 } from './api';
import { fetchCourseTopicsFailed, fetchCourseTopicsRequest, fetchCourseTopicsSuccess } from './slices';

function normalizeTopicsV3(topics) {
  const coursewareUnits = reduce(topics, (arrayOfUnits, chapter) => {
    if (chapter?.children) {
      return [
        ...arrayOfUnits,
        ...reduce(chapter.children, (units, sequential) => {
          if (sequential?.children) {
            return [
              ...units,
              ...sequential.children.map((unit) => ({
                ...unit,
                parentId: sequential.id,
                parentTitle: sequential.displayName,
              })),
            ];
          }
          return units;
        }, []),
      ];
    }
    return arrayOfUnits;
  }, []);

  const coursewareTopics = topics.filter((topic) => topic.courseware);
  const nonCoursewareTopics = topics.filter((topic) => !topic.courseware);
  const nonCoursewareIds = nonCoursewareTopics?.map((topic) => topic.id);

  return {
    topics,
    units: coursewareUnits,
    coursewareTopics,
    nonCoursewareTopics,
    nonCoursewareIds,
  };
}

export function fetchCourseTopicsV3(courseId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCourseTopicsRequest({ courseId }));
      const data = await getCourseTopicsV3(courseId);
      dispatch(fetchCourseTopicsSuccess(normalizeTopicsV3(data)));
    } catch (error) {
      dispatch(fetchCourseTopicsFailed());
      logError(error);
    }
  };
}
