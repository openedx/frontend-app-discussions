import React, { useContext } from 'react';

import first from 'lodash/first';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectTopicThreads } from '../posts/data/selectors';
import PostsList from '../posts/PostsList';
import { discussionsPath, handleKeyDown } from '../utils';
import { selectNonCoursewareTopics, selectSubsectionUnits, selectUnits } from './data/selectors';
import { BackButton } from './components';
import messages from './messages';
import { Topic } from './topic';

function TopicPostsView({ intl }) {
  const location = useLocation();
  const { courseId, topicId, category } = useContext(DiscussionContext);
  const posts = useSelector(selectTopicThreads([topicId]));
  const selectedSubsectionUnits = useSelector(selectSubsectionUnits(category));
  const selectedUnit = useSelector(selectUnits)?.find(unit => unit.id === topicId);
  const selectedNonCoursewareTopic = useSelector(selectNonCoursewareTopics)?.find(topic => topic.id === topicId);
  console.log('TopicPostsView');

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      {topicId ? (
        <BackButton
          path={discussionsPath(
            selectedUnit ? Routes.TOPICS.CATEGORY : Routes.TOPICS.ALL,
            selectedUnit ? { courseId, category: selectedUnit?.parentId } : { courseId },
          )(location)}
          title={
            selectedUnit?.name || selectedNonCoursewareTopic?.name
            || intl.formatMessage(messages.unnamedTopic)
          }
        />
      ) : (
        <BackButton
          path={discussionsPath(Routes.TOPICS.ALL, { courseId })(location)}
          title={first(selectedSubsectionUnits)?.parentTitle || intl.formatMessage(messages.unnamedSubsection)}
        />
      )}
      <div className="border-bottom border-light-400" />
      <div className="list-group list-group-flush flex-fill" role="list" onKeyDown={e => handleKeyDown(e)}>
        {topicId ? (
          <PostsList
            posts={posts}
            topics={[topicId]}
          />
        ) : (
          selectedSubsectionUnits?.map((unit) => (
            <Topic
              key={unit.id}
              topic={unit}
            />
          ))
        )}
      </div>
    </div>
  );
}

TopicPostsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicPostsView);
