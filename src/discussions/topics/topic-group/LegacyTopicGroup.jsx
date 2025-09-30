import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { selectTopicsInCategoryIds } from '../data/selectors';
import TopicGroupBase from './TopicGroupBase';

const LegacyTopicGroup = ({ categoryId = null }) => {
  const topicsIds = useSelector(selectTopicsInCategoryIds(categoryId));

  return (
    <TopicGroupBase groupId={categoryId} groupTitle={categoryId} topicsIds={topicsIds} />
  );
};

LegacyTopicGroup.propTypes = {
  categoryId: PropTypes.string,
};

export default React.memo(LegacyTopicGroup);
