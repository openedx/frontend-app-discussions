import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faComments, faFlag } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Routes } from '../../../../data/constants';

// eslint-disable-next-line no-unused-vars
function Topic({ id, name, topics }) {
  const { courseId } = useParams();

  return (
    <div className="discussion-topic d-flex flex-column border-bottom pl-2 pt-1 pb-1" data-topic-id={id}>
      <Link
        className="topic-name"
        to={
          Routes.POSTS.PATH.replace(':courseId', courseId)
            .replace(':topicId', id)
            .replace(':threadId', '')
        }
      >
        { name }
      </Link>
      <div className="d-flex">
        <span className="badge mr-1">
          <FontAwesomeIcon icon={faQuestionCircle} />
          22
        </span>
        <span className="badge mr-1">
          <FontAwesomeIcon icon={faComments} />
          33
        </span>
        <span className="badge">
          <FontAwesomeIcon icon={faFlag} />
          5
        </span>
      </div>

    </div>
  );
}

export const topicShape = {
  name: PropTypes.string,
  id: PropTypes.string,
  topics: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
topicShape.topics = PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired;
Topic.propTypes = topicShape;
Topic.defaultProps = {
  id: null,
  name: null,
};

export default Topic;
