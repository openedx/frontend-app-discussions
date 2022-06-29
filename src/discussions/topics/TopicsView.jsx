import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { DiscussionProvider } from '../../data/constants';
import { selectSequences } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import { selectCategories, selectNonCoursewareTopics, selectTopicFilter } from './data/selectors';
import { fetchCourseTopics } from './data/thunks';
import ArchivedTopicGroup from './topic-group/ArchivedTopicGroup';
import LegacyTopicGroup from './topic-group/LegacyTopicGroup';
import SequenceTopicGroup from './topic-group/SequenceTopicGroup';
import Topic from './topic-group/topic/Topic';
import TopicSearchBar from './topic-search-bar/TopicSearchBar';

function CourseWideTopics() {
  const { category } = useParams();
  const filter = useSelector(selectTopicFilter);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  return (nonCoursewareTopics && category === undefined) && nonCoursewareTopics.filter(
    item => (filter
      ? item.name.toLowerCase()
        .includes(filter)
      : true
    ),
  )
    .map(topic => (
      <Topic topic={topic} key={topic.id} />
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
  const { courseId } = useContext(DiscussionContext);
  const dispatch = useDispatch();
  useEffect(() => {
    // Don't load till the provider information is available
    if (provider) {
      dispatch(fetchCourseTopics(courseId));
    }
  }, [provider]);

  return (
    <div
      className="discussion-topics d-flex flex-column card"
      data-testid="topics-view"
    >
      <TopicSearchBar />
      <div className="list-group list-group-flush">
        <CourseWideTopics />
        {provider === DiscussionProvider.OPEN_EDX && <CoursewareTopics />}
        {provider === DiscussionProvider.LEGACY && <LegacyCoursewareTopics />}
      </div>
    </div>
  );
}

TopicsView.propTypes = {};

export default TopicsView;
