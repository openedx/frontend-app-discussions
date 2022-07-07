import { DiscussionProvider } from '../../data/constants';

export default function countFilteredTopics(topicsSelector, provider) {
  let count = 0;
  const query = topicsSelector?.filter?.trim().toLowerCase();
  // Counting non-courseware topics
  const nonCoursewareTopicsList = topicsSelector.nonCoursewareIds?.map(
    id => topicsSelector.topics[id],
  ).filter(item => (query
    ? item.name.toLowerCase().includes(query)
    : true
  ));
  count += nonCoursewareTopicsList.length;
  // Counting legacy topics
  if (provider === DiscussionProvider.LEGACY) {
    const categories = topicsSelector?.categoryIds;
    const filteredTopics = categories?.map(categoryId => {
      const topics = topicsSelector.topicsInCategory[categoryId]?.map(
        id => topicsSelector.topics[id],
      ) || [];
      const matchesFilter = query ? categoryId?.toLowerCase().includes(query) : true;
      return topics.filter(
        topic => (
          query
            ? (topic.name.toLowerCase()
              .includes(query) || matchesFilter)
            : true
        ),
      );
    });
    count += [].concat(...filteredTopics).length;
  }
  return count;
}
