import React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Routes } from '../../../data/constants';
import Topic, { topicShape } from './topic/Topic';

function TopicGroup({ id, name, subtopics }) {
  const { courseId } = useParams();

  return (
    <div className="discussion-topic-group d-flex flex-column" data-topic-id={id}>
      { name && (
        <Link
          className="topic-name list-group-item px-3 py-2 text-gray-300 text-decoration-none text-uppercase small"
          to={
            Routes.TOPICS.PATH.replace(':courseId', courseId)
              .replace(':category?', name)
          }
        >
          { name }
        </Link>
      ) }
      {
        subtopics.map(
          topic => (
            <Topic
              id={topic.id}
              name={topic.name}
              subtopics={topic.subtopics}
              questions={topic.questions}
              discussions={topic.discussions}
              flags={topic.flags}
              key={topic.id}
            />
          ),
        )
      }
    </div>
  );
}

TopicGroup.propTypes = topicShape;

TopicGroup.defaultProps = {
  id: null,
  name: null,
};

export default TopicGroup;
