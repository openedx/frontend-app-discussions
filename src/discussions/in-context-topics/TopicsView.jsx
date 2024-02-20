import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import { Spinner } from '@openedx/paragon';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import SearchInfo from '../../components/SearchInfo';
import { RequestStatus } from '../../data/constants';
import DiscussionContext from '../common/context';
import { selectAreThreadsFiltered, selectDiscussionProvider } from '../data/selectors';
import { clearFilter, clearSort } from '../posts/data/slices';
import NoResults from '../posts/NoResults';
import { handleKeyDown } from '../utils';
import {
  selectArchivedTopics, selectCoursewareTopics, selectFilteredTopics, selectLoadingStatus,
  selectNonCoursewareTopics, selectTopicFilter, selectTopics,
} from './data/selectors';
import { setFilter } from './data/slices';
import fetchCourseTopicsV3 from './data/thunks';
import { ArchivedBaseGroup, SectionBaseGroup, Topic } from './topic';

const TopicsList = () => {
  const loadingStatus = useSelector(selectLoadingStatus);
  const coursewareTopics = useSelector(selectCoursewareTopics);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const archivedTopics = useSelector(selectArchivedTopics);

  const renderNonCoursewareTopics = useMemo(() => (
    nonCoursewareTopics?.map((topic, index) => (
      <Topic
        key={topic.id}
        topic={topic}
        showDivider={(nonCoursewareTopics.length - 1) !== index}
      />
    ))
  ), [nonCoursewareTopics]);

  const renderCoursewareTopics = useMemo(() => (
    coursewareTopics?.map((topic, index) => (
      <SectionBaseGroup
        key={topic.id}
        section={topic?.children}
        sectionId={topic.id}
        sectionTitle={topic.displayName}
        showDivider={(coursewareTopics.length - 1) !== index}
      />
    ))
  ), [coursewareTopics]);

  return (
    <>
      {renderNonCoursewareTopics}
      {renderCoursewareTopics}
      {!isEmpty(archivedTopics) && (
        <ArchivedBaseGroup
          archivedTopics={archivedTopics}
          showDivider={(!isEmpty(nonCoursewareTopics) || !isEmpty(coursewareTopics))}
        />
      )}
      {loadingStatus === RequestStatus.IN_PROGRESS && (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      )}
    </>
  );
};

const TopicsView = () => {
  const dispatch = useDispatch();
  const { courseId } = useContext(DiscussionContext);
  const provider = useSelector(selectDiscussionProvider);
  const topicFilter = useSelector(selectTopicFilter);
  const filteredTopics = useSelector(selectFilteredTopics);
  const loadingStatus = useSelector(selectLoadingStatus);
  const isPostsFiltered = useSelector(selectAreThreadsFiltered);
  const topics = useSelector(selectTopics);

  useEffect(() => {
    if (provider) {
      dispatch(fetchCourseTopicsV3(courseId));
    }
  }, [provider]);

  useEffect(() => {
    if (isPostsFiltered) {
      dispatch(clearFilter());
      dispatch(clearSort());
    }
  }, [isPostsFiltered]);

  const handleOnClear = useCallback(() => {
    dispatch(setFilter(''));
  }, []);

  return (
    <div className="d-flex flex-column h-100" data-testid="inContext-topics-view">
      {topicFilter && (
        <>
          <SearchInfo
            text={topicFilter}
            count={filteredTopics.length}
            loadingStatus={loadingStatus}
            onClear={handleOnClear}
          />
          {filteredTopics.length === 0 && loadingStatus === RequestStatus.SUCCESSFUL && <NoResults />}
        </>
      )}
      <div
        className={classNames('list-group list-group-flush flex-fill', {
          'justify-content-center': loadingStatus === RequestStatus.IN_PROGRESS && isEmpty(topics),
        })}
        role="list"
        onKeyDown={e => handleKeyDown(e)}
      >
        {topicFilter ? (
          filteredTopics?.map((topic) => (
            <Topic
              key={topic.id}
              topic={topic}
            />
          ))
        ) : (
          <TopicsList />
        )}
      </div>
    </div>
  );
};

export default TopicsView;
