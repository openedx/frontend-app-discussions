/* eslint-disable no-unused-vars, react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { generatePath, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { Icon } from '@edx/paragon';
import { Error as ErrorIcon, Help, Post as PostIcon } from '@edx/paragon/icons';

import { Routes } from '../../../../data/constants';
import { discussionsPath } from '../../../utils';

function Topic({ topic }) {
  const { courseId } = useParams();
  const topicUrl = discussionsPath(Routes.TOPICS.TOPIC, {
    courseId,
    topicId: topic.id,
  });
  const icons = [
    {
      key: 'discussions',
      icon: PostIcon,
      count: topic?.threadCounts?.discussions || 0,
    },
    {
      key: 'questions',
      icon: Help,
      count: topic?.threadCounts?.questions || 0,
    },
  ];
  return (
    <Link
      className="discussion-topic d-flex flex-column list-group-item px-4 py-3 text-primary-500"
      data-topic-id={topic.id}
      to={topicUrl}
    >
      <div className="topic-name">
        {topic.name}
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
        {topic?.flags && (
          <div className="d-flex align-items-center">
            <Icon className="mr-2" src={ErrorIcon} />
            {topic.flags}
          </div>
        )}
      </div>
    </Link>
  );
}

export const topicShape = PropTypes.shape({
  name: PropTypes.string,
  id: PropTypes.string,
  questions: PropTypes.number,
  discussions: PropTypes.number,
  flags: PropTypes.number,
});
Topic.propTypes = {
  topic: topicShape.isRequired,
};

export default Topic;
