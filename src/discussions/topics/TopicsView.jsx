import PropTypes from 'prop-types';
import React from 'react';
import { useParams } from 'react-router';
import { topicShape } from './topic-group/topic/Topic';
import TopicGroup from './topic-group/TopicGroup';
import TopicSearchBar from './topic-search-bar/TopicSearchBar';

function TopicsView({ coursewareTopics, nonCoursewareTopics }) {
  const { category } = useParams();

  const renderNonCoursewareTopics = () => {
    if (nonCoursewareTopics && category === undefined) {
      return <TopicGroup subtopics={nonCoursewareTopics} />;
    }

    return (null);
  };

  const renderCoursewareTopics = () => {
    const topics = (
      category
        ? coursewareTopics.filter(topic => topic.name === category)
        : coursewareTopics
    );

    return topics.map(
      topicGroup => (
        <TopicGroup
          id={topicGroup.id}
          name={topicGroup.name}
          subtopics={topicGroup.children}
          key={topicGroup.name}
        />
      ),
    );
  };

  return (
    <div className="discussion-topics d-flex flex-column card">
      <TopicSearchBar />
      <div className="list-group list-group-flush">
        { renderNonCoursewareTopics() }
        { renderCoursewareTopics() }
      </div>
    </div>
  );
}

TopicsView.propTypes = {
  coursewareTopics: PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired,
  nonCoursewareTopics: PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired,
};

export default TopicsView;
