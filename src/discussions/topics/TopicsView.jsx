import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { selectCourseTopics, selectTopicFilter } from './data/selectors';
import { fetchCourseTopics } from './data/thunks';
import TopicGroup from './topic-group/TopicGroup';
import TopicSearchBar from './topic-search-bar/TopicSearchBar';

function TopicsView() {
  const dispatch = useDispatch();
  const { courseId, category } = useParams();
  const {
    coursewareTopics,
    nonCoursewareTopics,
  } = useSelector(selectCourseTopics());
  const filter = useSelector(selectTopicFilter());
  const topics = (
    category
      ? coursewareTopics.filter(topic => topic.name === category)
      : coursewareTopics
  );
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCourseTopics(courseId));
  }, [courseId]);

  const topicElements = topics.map(
    topicGroup => (
      <TopicGroup
        id={topicGroup.name}
        name={topicGroup.name}
        subtopics={topicGroup.children}
        key={topicGroup.id ?? topicGroup.name}
        filter={filter}
      />
    ),
  );

  if (nonCoursewareTopics && category === undefined) {
    topicElements.unshift(<TopicGroup subtopics={nonCoursewareTopics} filter={filter} key="non-courseware" />);
  }

  return (
    <div className="discussion-topics d-flex flex-column card">
      <TopicSearchBar />
      <div className="list-group list-group-flush">
        {topicElements}
      </div>
    </div>
  );
}

TopicsView.propTypes = {};

export default TopicsView;
