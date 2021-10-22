import React from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { selectCategories, selectNonCoursewareTopics, selectTopicFilter } from './data/selectors';
import Topic from './topic-group/topic/Topic';
import TopicGroup from './topic-group/TopicGroup';
import TopicSearchBar from './topic-search-bar/TopicSearchBar';

function TopicsView() {
  const { category } = useParams();
  const categories = useSelector(selectCategories)
    .filter(cat => (category ? cat === category : true));
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const filter = useSelector(selectTopicFilter);
  const nonCoursewareTopicElements = (nonCoursewareTopics && category === undefined) && nonCoursewareTopics.filter(
    item => (filter
      ? item.name.toLowerCase()
        .includes(filter)
      : true
    ),
  )
    .map(topic => (
      <Topic topic={topic} key={topic.id} />
    ));
  const topicElements = categories?.map(
    topicGroup => (
      <TopicGroup
        id={topicGroup}
        category={topicGroup}
        key={topicGroup}
      />
    ),
  );

  return (
    <div
      className="discussion-topics d-flex flex-column card"
      data-testid="topics-view"
    >
      <TopicSearchBar />
      <div className="list-group list-group-flush">
        {nonCoursewareTopicElements}
        {topicElements}
      </div>
    </div>
  );
}

TopicsView.propTypes = {};

export default TopicsView;
