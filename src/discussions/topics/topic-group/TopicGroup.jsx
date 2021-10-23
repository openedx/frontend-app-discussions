import React from 'react';
import PropTypes from 'prop-types';

import { generatePath, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { Routes } from '../../../data/constants';
import Topic, { topicShape } from './topic/Topic';

function TopicGroup({
  id,
  name,
  subtopics,
  filter,
}) {
  const { courseId } = useParams();
  const matchesFilter = filter
    ? name?.toLowerCase().includes(filter)
    : true;
  const subtopicElements = subtopics.filter(
    topic => (filter
      ? topic.name.toLowerCase().includes(filter)
      : true),
  )
    .map(
      topic => (
        <Topic
          id={topic.id}
          name={topic.name}
          subtopics={topic.subtopics}
          questions={topic?.threadCounts?.question}
          discussions={topic?.threadCounts?.discussion}
          flags={topic.flags}
          key={topic.id}
          filter={filter}
        />
      ),
    );
  const hasFilteredSubtopics = (subtopicElements.length > 0);
  if (!matchesFilter && !hasFilteredSubtopics) {
    return null;
  }

  return (
    <div
      className="discussion-topic-group d-flex flex-column"
      data-topic-id={id}
      data-testid="topic-group"
    >
      {name && (
        <Link
          className="topic-name list-group-item p-4 text-primary-500"
          to={generatePath(Routes.TOPICS.CATEGORY, { courseId, category: name })}
        >
          {name}
        </Link>
      )}
      {subtopicElements}
    </div>
  );
}

TopicGroup.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  subtopics: PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired,
  filter: PropTypes.string.isRequired,
};

TopicGroup.defaultProps = {
  id: null,
  name: null,
};

export default TopicGroup;
