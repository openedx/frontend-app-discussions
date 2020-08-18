import PropTypes from 'prop-types';
import React from 'react';
import { topicShape } from './topic-group/topic/Topic';
import TopicGroup from './topic-group/TopicGroup';


function TopicsView({ coursewareTopics, nonCoursewareTopics }) {
  return (
    <div className="discussion-topics d-flex flex-column">
      { nonCoursewareTopics
      && <TopicGroup topics={nonCoursewareTopics} /> }
      { coursewareTopics.map(
        topicGroup => (
          <TopicGroup
            id={topicGroup.id}
            name={topicGroup.name}
            topics={topicGroup.children}
            key={topicGroup.name}
          />
        ),
      ) }
    </div>
  );
}

TopicsView.propTypes = {
  coursewareTopics: PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired,
  nonCoursewareTopics: PropTypes.arrayOf(PropTypes.shape(topicShape)).isRequired,
};

export default TopicsView;
