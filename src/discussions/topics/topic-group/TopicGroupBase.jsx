import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { discussionsPath } from '../../utils';
import { selectTopicFilter } from '../data/selectors';
import Topic, { topicShape } from './topic/Topic';

function TopicGroupBase({
  groupId,
  groupTitle,
  linkToGroup,
  topics,
}) {
  const { courseId } = useContext(DiscussionContext);
  const filter = useSelector(selectTopicFilter);
  const hasTopics = topics.length > 0;
  const matchesFilter = filter
    ? groupTitle?.toLowerCase()
      .includes(filter)
    : true;
  const topicElements = topics.filter(
    topic => (
      filter
        ? topic.name.toLowerCase()
          .includes(filter)
        : true
    ),
  )
    .map(topic => (<Topic topic={topic} key={topic.id} />));
  const hasFilteredSubtopics = (topicElements.length > 0);
  if (!hasTopics || (!matchesFilter && !hasFilteredSubtopics)) {
    return null;
  }
  return (
    <div
      className="discussion-topic-group d-flex flex-column"
      data-category-id={groupId}
      data-testid="topic-group"
    >
      {linkToGroup
        ? (
          <Link
            className="list-group-item p-4 text-primary-500"
            to={discussionsPath(Routes.TOPICS.CATEGORY, {
              courseId,
              category: groupId,
            })}
          >
            {groupTitle}
          </Link>
        ) : (
          <span className="list-group-item p-4 text-primary-500">
            {groupTitle}
          </span>
        )}
      {topicElements}
    </div>
  );
}

TopicGroupBase.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupTitle: PropTypes.string.isRequired,
  topics: PropTypes.arrayOf(topicShape).isRequired,
  linkToGroup: PropTypes.bool,
};

TopicGroupBase.defaultProps = {
  linkToGroup: true,
};

export default TopicGroupBase;
