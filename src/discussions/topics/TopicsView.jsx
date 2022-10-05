import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import SearchInfo from '../../components/SearchInfo';
import { DiscussionProvider, RequestStatus } from '../../data/constants';
import { selectSequences } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import NoResults from '../posts/NoResults';
import { selectCategories, selectNonCoursewareTopics, selectTopicFilter } from './data/selectors';
import { setFilter, setTopicsCount } from './data/slices';
import { fetchCourseTopics } from './data/thunks';
import ArchivedTopicGroup from './topic-group/ArchivedTopicGroup';
import LegacyTopicGroup from './topic-group/LegacyTopicGroup';
import SequenceTopicGroup from './topic-group/SequenceTopicGroup';
import Topic from './topic-group/topic/Topic';
import countFilteredTopics from './utils';

function CourseWideTopics() {
  const { category } = useParams();
  const filter = useSelector(selectTopicFilter);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const filteredNonCoursewareTopics = nonCoursewareTopics.filter(item => (filter
    ? item.name.toLowerCase().includes(filter)
    : true
  ));

  return (nonCoursewareTopics && category === undefined)
    && filteredNonCoursewareTopics.map((topic, index) => (
      <Topic
        topic={topic}
        key={topic.id}
        index={index}
        showDivider={(filteredNonCoursewareTopics.length - 1) !== index}
      />
    ));
}

function CoursewareTopics() {
  const sequences = useSelector(selectSequences);

  return (
    <>
      { sequences?.map(
        sequence => (
          <SequenceTopicGroup
            sequence={sequence}
            key={sequence.id}
          />
        ),
      )}
      <ArchivedTopicGroup />
    </>
  );
}

function LegacyCoursewareTopics() {
  const { category } = useParams();
  const categories = useSelector(selectCategories)
    .filter(cat => (category ? cat === category : true));
  return categories?.map(
    topicGroup => (
      <LegacyTopicGroup
        id={topicGroup}
        category={topicGroup}
        key={topicGroup}
      />
    ),
  );
}

function TopicsView() {
  const provider = useSelector(selectDiscussionProvider);
  const topicFilter = useSelector(selectTopicFilter);
  const topicsSelector = useSelector(({ topics }) => topics);
  const filteredTopicsCount = useSelector(({ topics }) => topics.results.count);
  const loadingStatus = useSelector(({ topics }) => topics.status);
  const { courseId } = useContext(DiscussionContext);
  const dispatch = useDispatch();

  const handleKeyDown = (event) => {
    const { key } = event;
    if (key !== 'ArrowDown' && key !== 'ArrowUp') { return; }
    const option = event.target;

    let selectedOption;
    if (key === 'ArrowDown') { selectedOption = option.nextElementSibling; }
    if (key === 'ArrowUp') { selectedOption = option.previousElementSibling; }

    if (selectedOption) {
      selectedOption.focus();
    }
  };

  useEffect(() => {
    // Don't load till the provider information is available
    if (provider) {
      dispatch(fetchCourseTopics(courseId));
    }
  }, [provider]);

  useEffect(() => {
    const count = countFilteredTopics(topicsSelector, provider);
    dispatch(setTopicsCount(count));
  }, [topicFilter]);

  return (
    <div className="discussion-topics d-flex flex-column h-100" data-testid="topics-view">
      {topicFilter && (
        <SearchInfo
          text={topicFilter}
          count={filteredTopicsCount}
          loadingStatus={loadingStatus}
          onClear={() => dispatch(setFilter(''))}
        />
      )}
      <div className="list-group list-group-flush flex-fill" role="list" onKeyDown={e => handleKeyDown(e)}>
        <CourseWideTopics />
        {provider === DiscussionProvider.OPEN_EDX && <CoursewareTopics />}
        {provider === DiscussionProvider.LEGACY && <LegacyCoursewareTopics />}
      </div>
      {
        filteredTopicsCount === 0
        && loadingStatus === RequestStatus.SUCCESSFUL
        && topicFilter !== ''
        && <NoResults />
      }
    </div>
  );
}

TopicsView.propTypes = {};

export default TopicsView;
