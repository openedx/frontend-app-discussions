import React from 'react';
import Topic, { topicShape } from './topic/Topic';


function TopicGroup({ id, name, topics }) {
  return (
    <div className="discussion-topic-group d-flex flex-column" data-topic-id={id}>
      { name && (
        <div className="topic-name border-bottom pl-2 pt-1 pb-1">
          { name }
        </div>
      ) }
      {
        topics.map(
          topic => <Topic id={topic.id} name={topic.name} topics={topic.children} key={topic.id} />,
        )
      }
    </div>
  );
}

TopicGroup.propTypes = topicShape;

TopicGroup.defaultProps = {
  id: null,
  name: null,
};

export default TopicGroup;
