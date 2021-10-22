import React from 'react';

import { useSelector } from 'react-redux';
import { generatePath, useHistory, useRouteMatch } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown, DropdownButton } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import {
  selectCategories,
  selectNonCoursewareTopics,
  selectTopic,
  selectTopicsInCategory,
} from '../../topics/data/selectors';
import messages from './messages';

function LegacyBreadcrumbMenu({ intl }) {
  const history = useHistory();
  const {
    params: {
      courseId,
      category,
      topicId: currentTopicId,
    },
  } = useRouteMatch([Routes.TOPICS.CATEGORY, Routes.TOPICS.TOPIC]);

  const currentTopic = useSelector(selectTopic(currentTopicId));
  const currentCategory = category || currentTopic?.categoryId;
  const topicsInCategory = useSelector(selectTopicsInCategory(currentCategory));
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const categories = useSelector(selectCategories);
  const showAllMsg = intl.formatMessage(messages.showAll);
  const isNonCoursewareTopic = currentTopic && !currentCategory;

  const navigateToCategory = (categoryId) => {
    if (!categoryId) {
      history.push(generatePath(Routes.TOPICS.ALL, {
        courseId,
        category: categoryId,
      }));
    } else {
      history.push(generatePath(Routes.TOPICS.CATEGORY, {
        courseId,
        category: categoryId,
      }));
    }
  };
  const navigateToTopic = (topicId) => {
    if (!topicId) {
      navigateToCategory(currentCategory);
    } else {
      history.push(generatePath(Routes.TOPICS.TOPIC, {
        courseId,
        topicId,
      }));
    }
  };

  return (
    <div className="breadcrumb-menu d-flex flex-row mt-2 mx-3">
      {isNonCoursewareTopic ? (
        <DropdownButton
          title={currentTopic.name}
          variant="outline"
          onSelect={navigateToTopic}
        >
          <Dropdown.Item eventKey={null} key="null" active={!currentTopic}>
            {showAllMsg}
          </Dropdown.Item>
          {nonCoursewareTopics.map(topic => (
            <Dropdown.Item eventKey={topic.id} key={topic.id} active={topic.id === currentTopicId}>
              {topic.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      ) : (
        <DropdownButton
          title={currentCategory || showAllMsg}
          variant="outline"
          onSelect={navigateToCategory}
        >
          <Dropdown.Item eventKey={null} key="null" active={!currentCategory}>
            {showAllMsg}
          </Dropdown.Item>
          {categories.map(categoryId => (
            <Dropdown.Item eventKey={categoryId} key={categoryId} active={categoryId === currentCategory}>
              {categoryId}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      )}
      {currentCategory && (
        <>
          <div className="d-flex py-2">/</div>
          <DropdownButton
            title={currentTopic?.name || showAllMsg}
            variant="outline"
            onSelect={navigateToTopic}
          >
            <Dropdown.Item eventKey={null} key="null" active={!currentTopic}>
              {showAllMsg}
            </Dropdown.Item>
            {topicsInCategory?.map(topic => (
              <Dropdown.Item eventKey={topic.id} key={topic.id} active={topic.id === currentTopicId}>
                {topic.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </>
      )}
    </div>
  );
}

LegacyBreadcrumbMenu.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LegacyBreadcrumbMenu);
