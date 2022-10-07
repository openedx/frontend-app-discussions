import React from 'react';

import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { Routes } from '../../../data/constants';
import {
  selectCategories,
  selectNonCoursewareTopics,
  selectTopic,
  selectTopicsInCategory,
} from '../../topics/data/selectors';
import { discussionsPath } from '../../utils';
import BreadcrumbDropdown from './BreadcrumbDropdown';

function LegacyBreadcrumbMenu() {
  const {
    params: {
      courseId,
      category,
      topicId: currentTopicId,
    },
  } = useRouteMatch([Routes.TOPICS.CATEGORY, Routes.TOPICS.TOPIC]);

  const currentTopic = useSelector(selectTopic(currentTopicId));
  const currentCategory = category || currentTopic?.categoryId;
  const decodedCurrentCategory = String(currentCategory).replace('%23', '#');
  const topicsInCategory = useSelector(selectTopicsInCategory(decodedCurrentCategory));
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const categories = useSelector(selectCategories);
  const isNonCoursewareTopic = currentTopic && !currentCategory;

  return (
    <div className="breadcrumb-menu d-flex flex-row bg-light-200 box-shadow-down-1 px-2.5 py-1">
      {isNonCoursewareTopic ? (
        <BreadcrumbDropdown
          currentItem={currentTopic}
          itemLabelFunc={(item) => item?.name}
          itemActiveFunc={(topic) => topic?.id === currentTopicId}
          items={nonCoursewareTopics}
          showAllPath={discussionsPath(Routes.TOPICS.ALL, { courseId })}
          itemPathFunc={(topic) => discussionsPath(Routes.TOPICS.TOPIC, {
            courseId,
            topicId: topic.id,
          })}
        />
      ) : (
        <BreadcrumbDropdown
          currentItem={decodedCurrentCategory}
          itemLabelFunc={(catId) => catId}
          itemActiveFunc={(catId) => catId === currentCategory}
          items={categories}
          showAllPath={discussionsPath(Routes.TOPICS.ALL, { courseId })}
          itemPathFunc={(catId) => discussionsPath(Routes.TOPICS.CATEGORY, {
            courseId,
            category: catId,
          })}
        />
      )}
      {currentCategory && (
        <>
          <div className="d-flex py-2">/</div>
          <BreadcrumbDropdown
            currentItem={currentTopic}
            itemLabelFunc={(item) => item?.name}
            itemActiveFunc={(topic) => topic?.id === currentTopicId}
            items={topicsInCategory}
            showAllPath={discussionsPath(Routes.TOPICS.CATEGORY, {
              courseId,
              category: currentCategory,
            })}
            itemPathFunc={(topic) => discussionsPath(Routes.TOPICS.TOPIC, {
              courseId,
              topicId: topic.id,
            })}
          />
        </>
      )}
    </div>
  );
}

LegacyBreadcrumbMenu.propTypes = {};

export default LegacyBreadcrumbMenu;
