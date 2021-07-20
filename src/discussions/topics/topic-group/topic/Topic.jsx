/* eslint-disable no-unused-vars, react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '@edx/paragon';
import { Flag, Help, QuestionAnswer } from '@edx/paragon/icons';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { Routes } from '../../../../data/constants';

function Topic({
  id,
  name,
  questions,
  discussions,
  flags,
}) {
  const { courseId } = useParams();

  return (
    <Link
      className="discussion-topic d-flex flex-column list-group-item px-3 py-2 text-gray-900 text-decoration-none"
      data-topic-id={id}
      to={
        Routes.POSTS.PATH.replace(':courseId', courseId)
          .replace(':topicId', id)
      }
    >
      <div className="topic-name font-weight-bold small">
        {name}
      </div>
      <div className="d-flex text-gray-300 h4 mt-1 mb-0">
        <div className="badge mr-4">
          <Icon className="mr-2" src={Help} />
          {questions}
        </div>
        <div className="badge mr-4">
          <Icon className="mr-2" src={QuestionAnswer} />
          {discussions}
        </div>
        {flags !== null && (
          <div className="badge">
            <Icon className="mr-2" src={Flag} />
            {flags}
          </div>
        )}
      </div>

    </Link>
  );
}

export const topicShape = {
  name: PropTypes.string,
  id: PropTypes.string,
  questions: PropTypes.number,
  discussions: PropTypes.number,
  flags: PropTypes.number,
};
Topic.propTypes = topicShape;
Topic.defaultProps = {
  id: null,
  name: null,
  questions: 0,
  discussions: 0,
  flags: null,
};

export default Topic;
