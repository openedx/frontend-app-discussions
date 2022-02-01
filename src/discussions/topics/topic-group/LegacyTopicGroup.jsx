import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { Routes } from '../../../data/constants';
import { discussionsPath } from '../../utils';
import { selectTopicFilter, selectTopicsInCategory } from '../data/selectors';
import Topic from './topic/Topic';

function LegacyTopicGroup({
  id,
  category,
}) {
  const { courseId } = useParams();
  const topics = useSelector(selectTopicsInCategory(category));
  const filter = useSelector(selectTopicFilter);
  const matchesFilter = filter
    ? category?.toLowerCase()
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
  if (!matchesFilter && !hasFilteredSubtopics) {
    return null;
  }

  return (
    <div
      className="discussion-topic-group d-flex flex-column"
      data-topic-id={id}
      data-testid="topic-group"
    >
      <Link
        className="topic-name list-group-item p-4 text-primary-500"
        to={discussionsPath(Routes.TOPICS.CATEGORY, {
          courseId,
          category,
        })}
      >
        {category}
      </Link>
      {topicElements}
    </div>
  );
}

LegacyTopicGroup.propTypes = {
  id: PropTypes.string,
  category: PropTypes.string,
};

LegacyTopicGroup.defaultProps = {
  id: null,
  category: null,
};

export default LegacyTopicGroup;
