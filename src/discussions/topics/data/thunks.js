import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { getHttpErrorStatus } from '../../utils';
import { getCourseTopics } from './api';
import {
  fetchCourseTopicsDenied, fetchCourseTopicsFailed, fetchCourseTopicsRequest, fetchCourseTopicsSuccess,
} from './slices';

function normaliseTopics(data) {
  const topicsInCategory = {};
  const topics = {};
  const categoryIds = [];
  data.coursewareTopics.forEach(category => {
    topicsInCategory[category.name] = category.children.map(topic => {
      topics[topic.id] = { ...topic, categoryId: category.name };
      return topic.id;
    });
    categoryIds.push(category.name);
  });
  const nonCoursewareIds = data.nonCoursewareTopics.map(topic => {
    topics[topic.id] = topic;
    return topic.id;
  });
  return {
    categoryIds, topicsInCategory, topics, nonCoursewareIds,
  };
}

export default function fetchCourseTopics(courseId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCourseTopicsRequest({ courseId }));

      const data = normaliseTopics(camelCaseObject(await getCourseTopics(courseId)));
      dispatch(fetchCourseTopicsSuccess(data));
    } catch (error) {
      if (getHttpErrorStatus(error) === 403) {
        dispatch(fetchCourseTopicsDenied());
      } else {
        dispatch(fetchCourseTopicsFailed());
      }
      logError(error);
    }
  };
}
