import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import { Routes } from '../../../data/constants';
import DiscussionContext from '../../common/context';
import { discussionsPath } from '../../utils';
import { selectTopicFilter, selectTopicsById } from '../data/selectors';
import messages from '../messages';
import Topic from './topic/Topic';

const TopicGroupBase = ({
  groupId,
  groupTitle,
  linkToGroup,
  topicsIds,
}) => {
  const intl = useIntl();
  const { search } = useLocation();
  const { courseId, enableInContextSidebar } = useContext(DiscussionContext);
  const filter = useSelector(selectTopicFilter);
  const topics = useSelector(selectTopicsById(topicsIds));
  const hasTopics = topics.length > 0;
  const { pathname } = discussionsPath(Routes.TOPICS.CATEGORY, {
    courseId,
    category: groupId,
  })();

  const matchesFilter = useMemo(() => (
    filter ? groupTitle?.toLowerCase().includes(filter) : true
  ), [filter, groupTitle]);

  const filteredTopicElements = useMemo(() => (
    topics.filter(topic => (
      filter ? (topic.name.toLowerCase().includes(filter) || matchesFilter) : true
    ))
  ), [topics, filter, matchesFilter]);

  const hasFilteredSubtopics = (filteredTopicElements.length > 0);

  const renderFilteredTopics = useMemo(() => {
    if (!hasFilteredSubtopics) {
      return null;
    }

    return (
      filteredTopicElements.map((topic, index) => (
        <Topic
          topicId={topic.id}
          key={topic.id}
          index={index}
          showDivider={(filteredTopicElements.length - 1) !== index}
        />
      ))
    );
  }, [filteredTopicElements]);

  if (!hasTopics || (!matchesFilter && !hasFilteredSubtopics)) {
    return null;
  }

  return (
    <div
      className="discussion-topic-group d-flex flex-column text-primary-500"
      data-category-id={groupId}
      data-testid="topic-group"
    >
      <div className="pt-2.5 px-4 font-weight-bold">
        {linkToGroup && groupId ? (
          <Link
            className="text-decoration-none text-primary-500"
            to={`${pathname}${enableInContextSidebar ? search : ''}`}
          >
            {groupTitle}
          </Link>
        ) : (
          groupTitle || intl.formatMessage(messages.unnamedTopicCategories)
        )}
      </div>
      {renderFilteredTopics}
    </div>
  );
};

TopicGroupBase.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupTitle: PropTypes.string.isRequired,
  topicsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  linkToGroup: PropTypes.bool,
};

TopicGroupBase.defaultProps = {
  linkToGroup: true,
};

export default React.memo(TopicGroupBase);
