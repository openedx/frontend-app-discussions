import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { selectTopicsInCategory } from '../data/selectors';
import TopicGroupBase from './TopicGroupBase';

function LegacyTopicGroup({
  id,
  category,
}) {
  const topics = useSelector(selectTopicsInCategory(category));
  return (
    <TopicGroupBase groupId={id} groupTitle={category} topics={topics} />
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
