/* eslint-disable import/prefer-default-export */
export const selectCourseTopics = state => (
  {
    courseware_topics: state.topics.courseware_topics,
    non_courseware_topics: state.topics.non_courseware_topics,
  }
);

export const selectCourseTopic = topicId => state => state.topics.topics[topicId];

export const selectTopicCategory = topicId => state => (
  state.topics.courseware_topics.find(category => (
    category.children.find(topic => topic.id === topicId)
  ))
);
