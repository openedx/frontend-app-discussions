/* eslint-disable no-unused-vars, react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { generatePath, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { Icon } from '@edx/paragon';
import { Error as ErrorIcon, Help, Post as PostIcon } from '@edx/paragon/icons';

import { Routes } from '../../../../data/constants';

function Topic({
  id,
  name,
  questions,
  discussions,
  flags,
}) {
  const { courseId } = useParams();
  const topicUrl = generatePath(Routes.TOPICS.TOPIC, {
    courseId,
    topicId: id,
  });
  const icons = [
    {
      key: 'discussions',
      icon: PostIcon,
      count: discussions,
    },
    {
      key: 'questions',
      icon: Help,
      count: questions,
    },
  ];
  return (
    <Link
      className="discussion-topic d-flex flex-column list-group-item px-4 py-3 text-primary-500"
      data-topic-id={id}
      to={topicUrl}
    >
      <div className="topic-name">
        {name}
      </div>
      <div className="d-flex mt-3">
        {
          icons.map(({
            key,
            icon,
            count,
          }) => (
            <div className="mr-4 d-flex align-items-center" key={key}>
              <Icon className="mr-2" src={icon} />
              {/* Reserve some space for larger counts */}
              <span style={{ width: '2rem' }}>
                {count}
              </span>
            </div>
          ))
        }
        {flags && (
          <div className="d-flex align-items-center">
            <Icon className="mr-2" src={ErrorIcon} />
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
