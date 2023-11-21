import React, { useCallback } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Routes } from '../../../data/constants';
import {
  selectCategories,
  selectNonCoursewareTopics,
  selectTopic,
  selectTopicsInCategory,
} from '../../topics/data/selectors';
import { discussionsPath } from '../../utils';
import BreadcrumbDropdown from './BreadcrumbDropdown';

const LegacyBreadcrumbMenu = () => {
  const {
    courseId,
    category,
    topicId: currentTopicId,
  } = useParams();
  const currentTopic = useSelector(selectTopic(currentTopicId));
  const currentCategory = category || currentTopic?.categoryId;
  const decodedCurrentCategory = String(currentCategory).replace('%23', '#');
  const topicsInCategory = useSelector(selectTopicsInCategory(decodedCurrentCategory));
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const categories = useSelector(selectCategories);
  const isNonCoursewareTopic = currentTopic && !currentCategory;

  const nonCoursewareItemLabel = useCallback((item) => (
    item?.name
  ), []);

  const nonCoursewareActive = useCallback((topic) => (
    topic?.id === currentTopicId
  ), [currentTopicId]);

  const nonCoursewareItemPath = useCallback((topic) => (
    discussionsPath(Routes.TOPICS.TOPIC, {
      courseId,
      topicId: topic.id,
    })
  ), [courseId]);

  const coursewareItemLabel = useCallback((catId) => (
    catId
  ), []);

  const coursewareActive = useCallback((catId) => (
    catId === currentCategory
  ), [currentTopicId]);

  const coursewareItemPath = useCallback((catId) => (
    discussionsPath(Routes.TOPICS.CATEGORY, {
      courseId,
      category: catId,
    })
  ), [courseId]);

  const categoryItemLabel = useCallback((item) => item?.name, []);

  const categoryActive = useCallback((topic) => (
    topic?.id === currentTopicId
  ), [currentTopicId]);

  const categoryItemPath = useCallback((topic) => (
    discussionsPath(Routes.TOPICS.TOPIC, {
      courseId,
      topicId: topic.id,
    })
  ), [courseId]);

  return (
    <div className="breadcrumb-menu d-flex flex-row bg-light-200 box-shadow-down-1 px-2.5 py-1">
      {isNonCoursewareTopic ? (
        <BreadcrumbDropdown
          currentItem={currentTopic}
          itemLabelFunc={nonCoursewareItemLabel}
          itemActiveFunc={nonCoursewareActive}
          items={nonCoursewareTopics}
          showAllPath={discussionsPath(Routes.TOPICS.ALL, { courseId })}
          itemPathFunc={nonCoursewareItemPath}
        />
      ) : (
        <BreadcrumbDropdown
          currentItem={decodedCurrentCategory}
          itemLabelFunc={coursewareItemLabel}
          itemActiveFunc={coursewareActive}
          items={categories}
          showAllPath={discussionsPath(Routes.TOPICS.ALL, { courseId })}
          itemPathFunc={coursewareItemPath}
        />
      )}
      {currentCategory && (
        <>
          <div className="d-flex py-2">/</div>
          <BreadcrumbDropdown
            currentItem={currentTopic}
            itemLabelFunc={categoryItemLabel}
            itemActiveFunc={categoryActive}
            items={topicsInCategory}
            showAllPath={discussionsPath(Routes.TOPICS.CATEGORY, {
              courseId,
              category: currentCategory,
            })}
            itemPathFunc={categoryItemPath}
          />
        </>
      )}
    </div>
  );
};

export default LegacyBreadcrumbMenu;
