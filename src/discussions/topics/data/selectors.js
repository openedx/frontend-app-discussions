/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line no-unused-vars
const filteredTopics = (topics, filter) => (filter
  ? topics
    .map(topic => ({
      ...topic,
      children: filteredTopics(topic.children, filter),
    }))
    .filter(topic => topic.children.length || topic.name.toLowerCase()
      .includes(filter.toLowerCase()))
  : topics);

export const selectTopicFilter = () => state => state.topics.filter.trim().toLowerCase();

export const selectCourseTopics = () => state => (
  {
    coursewareTopics: state.topics.topics.coursewareTopics,
    nonCoursewareTopics: state.topics.topics.nonCoursewareTopics,
  }
);

export const selectCourseTopic = topicId => state => state.topics.topics.coursewareTopics[topicId]
  || state.topics.topics.nonCoursewareTopics[topicId];

export const selectTopicCategory = topicId => state => (
  state.topics.topics.coursewareTopics.find(category => (
    category.children.find(topic => topic.id === topicId)
  ))
);

export const topicsLoadingStatus = state => (
  state.topics.status
);
