import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Spinner } from '@edx/paragon';

import { RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import { selectTopicThreads } from '../posts/data/selectors';
import PostsList from '../posts/PostsList';
import { discussionsPath, handleKeyDown } from '../utils';
import {
  selectArchivedTopic, selectLoadingStatus, selectNonCoursewareTopics,
  selectSubsection, selectSubsectionUnits, selectUnits,
} from './data/selectors';
import { fetchCourseTopicsV3 } from './data/thunks';
import { BackButton, NoResults } from './components';
import messages from './messages';
import { Topic } from './topic';

const TopicPostsView = ({ intl }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { courseId, topicId, category } = useContext(DiscussionContext);
  const provider = useSelector(selectDiscussionProvider);
  const topicsStatus = useSelector(selectLoadingStatus);
  const topicsInProgress = topicsStatus === RequestStatus.IN_PROGRESS;
  const posts = useSelector(selectTopicThreads([topicId]));
  const selectedSubsectionUnits = useSelector(selectSubsectionUnits(category));
  const selectedSubsection = useSelector(selectSubsection(category));
  const selectedUnit = useSelector(selectUnits)?.find(unit => unit.id === topicId);
  const selectedNonCoursewareTopic = useSelector(selectNonCoursewareTopics)?.find(topic => topic.id === topicId);
  const selectedArchivedTopic = useSelector(selectArchivedTopic(topicId));

  useEffect(() => {
    if (provider && topicsStatus === RequestStatus.IDLE) {
      dispatch(fetchCourseTopicsV3(courseId));
    }
  }, [provider]);

  const backButtonPath = () => {
    const path = selectedUnit ? Routes.TOPICS.CATEGORY : Routes.TOPICS.ALL;
    const params = selectedUnit ? { courseId, category: selectedUnit?.parentId } : { courseId };
    return discussionsPath(path, params)(location);
  };

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      {topicId ? (
        <BackButton
          loading={topicsInProgress}
          path={backButtonPath()}
          title={selectedUnit?.name || selectedNonCoursewareTopic?.name || selectedArchivedTopic?.name
            || intl.formatMessage(messages.unnamedTopic)}
        />
      ) : (
        <BackButton
          loading={topicsInProgress}
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
            parentIsLoading={topicsInProgress}
          />
        ) : (
          selectedSubsectionUnits?.map((unit) => (
            <Topic
              key={unit.id}
              topic={unit}
            />
          ))
        )}
        {(category && selectedSubsectionUnits.length === 0 && topicsStatus === RequestStatus.SUCCESSFUL) && (
          <NoResults />
        )}
        {(category && topicsInProgress) && (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

TopicPostsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TopicPostsView);
