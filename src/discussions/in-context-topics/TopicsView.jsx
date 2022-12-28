import React, { useContext, useEffect } from 'react';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { Spinner } from '@edx/paragon';

import SearchInfo from '../../components/SearchInfo';
import { RequestStatus } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import NoResults from '../posts/NoResults';
import { handleKeyDown } from '../utils';
import {
  selectCoursewareTopics,
  selectFilteredTopics, selectLoadingStatus,
  selectNonCoursewareTopics, selectTopicFilter,
} from './data/selectors';
import { setFilter } from './data/slices';
import { fetchCourseTopicsV3 } from './data/thunks';
import { SectionBaseGroup, Topic } from './topic';

function TopicsList() {
  const loadingStatus = useSelector(selectLoadingStatus);
  const coursewareTopics = useSelector(selectCoursewareTopics);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  console.log('TopicsList');

  return (
    <>
      {nonCoursewareTopics?.map((topic, index) => (
        <Topic
          key={topic.id}
          topic={topic}
          showDivider={(nonCoursewareTopics.length - 1) !== index}
        />
      ))}
      {coursewareTopics?.map((topic, index) => (
        <SectionBaseGroup
          key={topic.id}
          section={topic?.children}
          sectionId={topic.id}
          sectionTitle={topic.displayName}
          showDivider={(coursewareTopics.length - 1) !== index}
        />
      ))}
      {loadingStatus === RequestStatus.IN_PROGRESS && (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      )}
    </>
  );
}

function TopicsView() {
  const dispatch = useDispatch();
  const { courseId } = useContext(DiscussionContext);
  const provider = useSelector(selectDiscussionProvider);
  const topicFilter = useSelector(selectTopicFilter);
  const filteredTopics = useSelector(selectFilteredTopics);
  const loadingStatus = useSelector(selectLoadingStatus);

  useEffect(() => {
    debugger;
    if (provider) {
      dispatch(fetchCourseTopicsV3(courseId));
    }
  }, [provider]);
  console.log('TopicsView');

  return (
    <div className="d-flex flex-column h-100" data-testid="inContext-topics-view">
      {topicFilter && (
        <>
          <SearchInfo
            text={topicFilter}
            count={filteredTopics.length}
            loadingStatus={loadingStatus}
            onClear={() => dispatch(setFilter(''))}
          />
          {filteredTopics.length === 0 && loadingStatus === RequestStatus.SUCCESSFUL && <NoResults />}
        </>
      )}
      <div
        className={classNames('list-group list-group-flush flex-fill', {
          'justify-content-center': loadingStatus === RequestStatus.IN_PROGRESS,
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
}

export default TopicsView;
