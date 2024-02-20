import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import { Spinner } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus, Routes } from '../../data/constants';
import DiscussionContext from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import { selectTopicThreadsIds } from '../posts/data/selectors';
import PostsList from '../posts/PostsList';
import { discussionsPath, handleKeyDown } from '../utils';
import {
  selectArchivedTopic, selectLoadingStatus, selectNonCoursewareTopics,
  selectSubsection, selectSubsectionUnits, selectUnits,
} from './data/selectors';
import fetchCourseTopicsV3 from './data/thunks';
import { BackButton, NoResults } from './components';
import messages from './messages';
import { Topic } from './topic';

const TopicPostsView = () => {
  const intl = useIntl();
  const location = useLocation();
  const dispatch = useDispatch();
  const { courseId, topicId, category } = useContext(DiscussionContext);
  const provider = useSelector(selectDiscussionProvider);
  const topicsStatus = useSelector(selectLoadingStatus);
  const postsIds = useSelector(selectTopicThreadsIds([topicId]));
  const selectedSubsectionUnits = useSelector(selectSubsectionUnits(category));
  const selectedSubsection = useSelector(selectSubsection(category));
  const units = useSelector(selectUnits);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const selectedArchivedTopic = useSelector(selectArchivedTopic(topicId));
  const topicsInProgress = topicsStatus === RequestStatus.IN_PROGRESS;

  const selectedUnit = useMemo(() => (
    units?.find(unit => unit.id === topicId)
  ), [units, topicId]);

  const selectedNonCoursewareTopic = useMemo(() => (
    nonCoursewareTopics?.find(topic => topic.id === topicId)
  ), [nonCoursewareTopics, topicId]);

  const backButtonPath = useCallback(() => {
    const path = selectedUnit ? Routes.TOPICS.CATEGORY : Routes.TOPICS.ALL;
    const params = selectedUnit ? { courseId, category: selectedUnit?.parentId } : { courseId };
    return discussionsPath(path, params)(location);
  }, [selectedUnit]);

  useEffect(() => {
    if (provider && topicsStatus === RequestStatus.IDLE) {
      dispatch(fetchCourseTopicsV3(courseId));
    }
  }, [provider]);

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
            postsIds={postsIds}
            topicsIds={[topicId]}
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

export default React.memo(TopicPostsView);
