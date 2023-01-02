import React, { useContext } from 'react';

import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Spinner } from '@edx/paragon';

import { RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectTopicThreads } from '../posts/data/selectors';
import PostsList from '../posts/PostsList';
import { discussionsPath, handleKeyDown } from '../utils';
import {
  selectLoadingStatus, selectNonCoursewareTopics, selectSubsection, selectSubsectionUnits, selectUnits,
} from './data/selectors';
import { BackButton, NoResults } from './components';
import messages from './messages';
import { Topic } from './topic';

function TopicPostsView({ intl }) {
  const location = useLocation();
  const { courseId, topicId, category } = useContext(DiscussionContext);
  const topicsLoadingStatus = useSelector(selectLoadingStatus);
  const posts = useSelector(selectTopicThreads([topicId]));
  const selectedSubsectionUnits = useSelector(selectSubsectionUnits(category));
  const selectedSubsection = useSelector(selectSubsection(category));
  const selectedUnit = useSelector(selectUnits)?.find(unit => unit.id === topicId);
  const selectedNonCoursewareTopic = useSelector(selectNonCoursewareTopics)?.find(topic => topic.id === topicId);

  const backButtonPath = () => {
    const path = selectedUnit ? Routes.TOPICS.CATEGORY : Routes.TOPICS.ALL;
    const params = selectedUnit ? { courseId, category: selectedUnit?.parentId } : { courseId };
    return discussionsPath(path, params)(location);
  };

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      {topicId ? (
        <BackButton
          path={backButtonPath()}
          title={selectedUnit?.name || selectedNonCoursewareTopic?.name || intl.formatMessage(messages.unnamedTopic)}
        />
      ) : (
        <BackButton
          path={discussionsPath(Routes.TOPICS.ALL, { courseId })(location)}
          title={selectedSubsection?.displayName || intl.formatMessage(messages.unnamedSubsection)}
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
        {(category && selectedSubsectionUnits.length === 0 && topicsLoadingStatus === RequestStatus.SUCCESSFUL) && (
          <NoResults />
        )}
        {(category && topicsLoadingStatus === RequestStatus.IN_PROGRESS) && (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}

TopicPostsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicPostsView);
