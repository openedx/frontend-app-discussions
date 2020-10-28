/* eslint-disable no-unused-vars, react/forbid-prop-types */
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faComments, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { useParams } from 'react-router';
import { Routes } from '../../../../data/constants';
import { DiscussionAppLink } from '../../../navigation';

function Topic({
  id,
  name,
  subtopics,
  questions,
  discussions,
  flags,
}) {
  return (
    <DiscussionAppLink
      className="discussion-topic d-flex flex-column list-group-item px-3 py-2 text-gray-900 text-decoration-none"
      data-topic-id={id}
      to={Routes.POSTS.PATH}
      urlParams={{ topicId: id }}
    >
      <div className="topic-name font-weight-bold small">
        { name }
      </div>
      <div className="d-flex text-gray-300 h4 mt-1 mb-0">
        <div className="badge mr-4">
          <FontAwesomeIcon className="mr-2" icon={faQuestionCircle} />
          {questions}
        </div>
        <div className="badge mr-4">
          <FontAwesomeIcon className="mr-2" icon={faComments} />
          {discussions}
        </div>
        {flags > 0 && (
          <div className="badge">
            <FontAwesomeIcon className="mr-2" icon={faFlag} />
            {flags}
          </div>
        ) }
      </div>

    </DiscussionAppLink>
  );
}

export const topicShape = {
  name: PropTypes.string,
  id: PropTypes.string,
  subtopics: PropTypes.array,
  questions: PropTypes.number,
  discussions: PropTypes.number,
  flags: PropTypes.number,
};
Topic.propTypes = topicShape;
Topic.defaultProps = {
  id: null,
  name: null,
  subtopics: [],
  questions: 0,
  discussions: 0,
  flags: 0,
};

export default Topic;
