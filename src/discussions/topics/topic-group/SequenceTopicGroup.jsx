import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { selectTopicsById } from '../data/selectors';
import TopicGroupBase from './TopicGroupBase';

function SequenceTopicGroup({
  sequence,
}) {
  const topicsIds = sequence.topics;
  const topics = useSelector(selectTopicsById(topicsIds));

  return (
    <TopicGroupBase groupId={sequence.id} groupTitle={sequence.displayName} topics={topics} />
  );
}

SequenceTopicGroup.propTypes = {
  sequence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    topics: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default SequenceTopicGroup;
