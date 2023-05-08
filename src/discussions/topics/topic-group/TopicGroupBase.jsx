import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { discussionsPath } from '../../utils';
import { selectTopicFilter } from '../data/selectors';
import messages from '../messages';
import Topic, { topicShape } from './topic/Topic';

function TopicGroupBase({
  groupId,
  groupTitle,
  linkToGroup,
  topics,
  intl,
}) {
  const { courseId } = useContext(DiscussionContext);
  const filter = useSelector(selectTopicFilter);
  const hasTopics = topics.length > 0;
  const matchesFilter = filter
    ? groupTitle?.toLowerCase().includes(filter)
    : true;

  const filteredTopicElements = topics.filter(
    topic => (filter
      ? (topic.name.toLowerCase().includes(filter) || matchesFilter)
      : true
    ),
  );

  const hasFilteredSubtopics = (filteredTopicElements.length > 0);
  if (!hasTopics || (!matchesFilter && !hasFilteredSubtopics)) {
    return null;
  }
  return (
    <div
      className="discussion-topic-group d-flex flex-column text-primary-500"
      data-category-id={groupId}
      data-testid="topic-group"
    >
      <div className="pt-2.5 px-4 font-weight-bold">
        {linkToGroup && groupId
          ? (
            <Link
              className="text-decoration-none text-primary-500"
              to={discussionsPath(Routes.TOPICS.CATEGORY, {
                courseId,
                category: groupId,
              })}
            >
              {groupTitle}
            </Link>
          ) : (
            groupTitle || intl.formatMessage(messages.unnamedTopicCategories)
          )}
      </div>
      {filteredTopicElements.map((topic, index) => (
        <Topic
          topic={topic}
          key={topic.id}
          index={index}
          showDivider={(filteredTopicElements.length - 1) !== index}
        />
      ))}
    </div>
  );
}

TopicGroupBase.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupTitle: PropTypes.string.isRequired,
  topics: PropTypes.arrayOf(topicShape).isRequired,
  linkToGroup: PropTypes.bool,
  intl: intlShape.isRequired,
};

TopicGroupBase.defaultProps = {
  linkToGroup: true,
};

export default injectIntl(TopicGroupBase);
