/* eslint-disable import/prefer-default-export */
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { DiscussionProvider } from '../../../data/constants';
import { getCourseTopics, getCourseTopicsV2 } from './api';
import { fetchCourseTopicsFailed, fetchCourseTopicsRequest, fetchCourseTopicsSuccess } from './slices';

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

function normaliseTopicsV2(data) {
  const nonCoursewareIds = [];
  const topics = {};
  const archivedIds = [];
  data.forEach(topic => {
    if (!topic.enabledInContext) {
      archivedIds.push(topic.id);
    } else if (topic.usageKey === null) {
      nonCoursewareIds.push(topic.id);
    }
    topics[topic.id] = topic;
  });
  return {
    topics, nonCoursewareIds, archivedIds,
  };
}

export function fetchCourseTopics(courseId) {
  return async (dispatch, getState) => {
    try {
      const { config } = getState();
      dispatch(fetchCourseTopicsRequest({ courseId }));
      let data = {};
      if (config.provider === DiscussionProvider.LEGACY) {
        data = normaliseTopics(camelCaseObject(await getCourseTopics(courseId)));
      } else if (config.provider === DiscussionProvider.OPEN_EDX) {
        data = normaliseTopicsV2(camelCaseObject(await getCourseTopicsV2(courseId)));
      }
      dispatch(fetchCourseTopicsSuccess(data));
    } catch (error) {
      dispatch(fetchCourseTopicsFailed());
      logError(error);
    }
  };
}

export function fetchCourseTopicsV2(courseId) {
  return async (dispatch) => {
    try {
      dispatch(fetchCourseTopicsRequest({ courseId }));
      const data = await getCourseTopicsV2(courseId);
      dispatch(fetchCourseTopicsSuccess(normaliseTopicsV2(camelCaseObject(data))));
    } catch (error) {
      dispatch(fetchCourseTopicsFailed());
      logError(error);
    }
  };
}
